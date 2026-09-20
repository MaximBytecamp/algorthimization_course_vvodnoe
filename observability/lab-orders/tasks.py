"""Celery-приложение и задание обработки заказа.

Платёжный шлюз смоделирован: настоящих денег и внешних вызовов здесь нет.
Режим шлюза читается из Redis, поэтому его можно менять на ходу и повторять опыт.
"""
import os
import random
import time

import redis
from celery import Celery
from celery.signals import worker_ready
from prometheus_client import start_http_server

import metrics

BROKER = os.environ.get("ORDERS_BROKER", "redis://127.0.0.1:6389/0")
QUEUE = "orders"

celery_app = Celery("orders", broker=BROKER, backend=BROKER)
celery_app.conf.update(
    task_default_queue=QUEUE,
    task_acks_late=True,
    worker_prefetch_multiplier=4,   # при 1 воркер забирает задания по одному и теряет мощность
    broker_connection_retry_on_startup=True,
    result_expires=3600,
)

store = redis.Redis.from_url(BROKER, decode_responses=True)

# Доля отказов платёжного шлюза: 0 — шлюз исправен. Значение лежит в Redis,
# поэтому воркер и API видят одно и то же и опыт повторяется.
GATEWAY_KEY = "lab:gateway_failure_rate"
# Заказы, принятые но не подтверждённые, считаем в Redis: API и воркер — разные процессы,
# и счётчик в памяти одного из них второй не увидит.
AWAITING_KEY = "lab:awaiting_payment"


def gateway_failure_rate():
    value = store.get(GATEWAY_KEY)
    return float(value) if value else 0.0


class PaymentGatewayError(RuntimeError):
    """Платёжный шлюз не ответил. Повторяемая ошибка, не отказ покупателю."""


@celery_app.task(bind=True, name="process_order", max_retries=3, default_retry_delay=2)
def process_order(self, order_id, amount_rub, channel, enqueued_at):
    """Три этапа: проверка заказа, обращение к платёжному шлюзу, запись результата."""
    started = time.perf_counter()
    if self.request.retries == 0:
        # Ожидание считаем один раз: повторы — это уже выполнение, а не стояние в очереди.
        metrics.task_queue_wait.labels("process_order").observe(max(0.0, time.time() - enqueued_at))
    metrics.worker_busy.inc()
    try:
        time.sleep(0.05)  # проверка состава заказа

        time.sleep(0.25)  # обращение к платёжному шлюзу
        if random.random() < gateway_failure_rate():
            # Неуспешное обращение и повтор — разные события. Одно задание даёт
            # несколько неуспешных обращений, но отказ покупателю — только один.
            metrics.gateway_failures.labels("timeout").inc()
            if self.request.retries < self.max_retries:
                metrics.task_retries.labels("process_order").inc()
                raise self.retry(exc=PaymentGatewayError("payment gateway did not answer"))
            metrics.tasks_finished.labels("process_order", "failure").inc()
            metrics.orders_rejected.labels("gateway_unavailable").inc()
            store.decr(AWAITING_KEY)
            store.hset(f"lab:order:{order_id}", mapping={"state": "rejected", "reason": "gateway_unavailable"})
            raise PaymentGatewayError("payment gateway did not answer")

        time.sleep(0.1)  # запись результата
        store.hset(f"lab:order:{order_id}", mapping={"state": "paid", "amount_rub": amount_rub})
        metrics.tasks_finished.labels("process_order", "success").inc()
        metrics.orders_paid.labels(channel).inc()
        metrics.revenue.inc(amount_rub)
        store.decr(AWAITING_KEY)
        return {"order_id": order_id, "state": "paid"}
    finally:
        metrics.worker_busy.dec()
        metrics.task_duration.labels("process_order").observe(time.perf_counter() - started)


@worker_ready.connect
def _expose_worker_metrics(sender=None, **_):
    """Воркер отдаёт свои метрики на отдельном порту: это другой процесс со своими счётчиками."""
    pool = getattr(getattr(sender, "controller", None), "pool", None)
    metrics.worker_concurrency.set(getattr(pool, "num_processes", 0) or celery_app.conf.worker_concurrency or 0)
    metrics.worker_busy.set(0)
    start_http_server(int(os.environ.get("ORDERS_WORKER_METRICS_PORT", 8026)))
