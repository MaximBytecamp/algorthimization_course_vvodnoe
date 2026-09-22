"""Сервис заказов стенда: FastAPI принимает заказ, Celery обрабатывает его в фоне.

Запуск: python -m uvicorn app:app --host 127.0.0.1 --port 8025
Платёжный шлюз смоделирован; внешних вызовов и настоящих денег здесь нет.
"""
import os
import time
import uuid
from pathlib import Path
from typing import Literal

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

import metrics
from tasks import AWAITING_KEY, QUEUE, gateway_failure_rate, process_order, store, GATEWAY_KEY

app = FastAPI(title="Orders Lab · Макаров М. Н.", version="1.0",
              description="FastAPI принимает заказ и отвечает 202. Оплату подтверждает воркер Celery.")

# Клиенты Redis и httpx в этом стенде синхронные. Внутри async-обработчика они
# заблокировали бы цикл событий и вместе с ним весь процесс, поэтому обработчики
# объявлены обычными def: FastAPI выполняет такие функции в пуле потоков.

AMOUNTS = {"web": 2400, "mobile": 1800, "partner": 7300}


@app.middleware("http")
async def measure(request: Request, call_next):
    """Одно измерение на запрос: длительность, код ответа и число запросов в работе."""
    route = request.url.path
    if route.startswith("/orders/"):
        route = "/orders/{id}"          # шаблон вместо адреса: иначе метка станет идентификатором
    metrics.http_inflight.inc()
    started = time.perf_counter()
    try:
        response = await call_next(request)
        status = response.status_code
    finally:
        metrics.http_inflight.dec()
    elapsed = time.perf_counter() - started
    if route not in {"/metrics", "/lab"}:
        metrics.http_duration.labels(route).observe(elapsed)
        metrics.http_requests.labels(route, request.method, str(status)).inc()
    response.headers["X-Duration-Ms"] = f"{elapsed * 1000:.1f}"
    return response


@app.get("/health", tags=["Проверка процесса"])
def health():
    return {"status": "ok", "scope": "process only; broker and worker not checked"}


@app.post("/orders", tags=["Заказы"])
def create_order(channel: Literal["web", "mobile", "partner"] = "web"):
    """Принять заказ, поставить задание в очередь и сразу ответить 202 Accepted."""
    order_id = uuid.uuid4().hex[:12]
    amount = AMOUNTS[channel]
    store.hset(f"lab:order:{order_id}", mapping={"state": "accepted", "amount_rub": amount})
    process_order.apply_async(args=[order_id, amount, channel, time.time()], queue=QUEUE)
    metrics.orders_created.labels(channel).inc()
    store.incr(AWAITING_KEY)
    return JSONResponse({"order_id": order_id, "state": "accepted", "amount_rub": amount},
                        status_code=202, headers={"X-Order-Id": order_id})


@app.get("/orders/{order_id}", tags=["Заказы"])
def read_order(order_id: str):
    data = store.hgetall(f"lab:order:{order_id}")
    if not data:
        return JSONResponse({"error": "not found", "order_id": order_id}, status_code=404)
    return {"order_id": order_id, **data}


@app.post("/admin/gateway", tags=["Управление опытом"])
def set_gateway(failure_rate: float = 0.0):
    """Задать долю отказов платёжного шлюза: 0 — исправен, 0.3 — отказывает каждый третий раз."""
    store.set(GATEWAY_KEY, max(0.0, min(1.0, failure_rate)))
    return {"gateway_failure_rate": gateway_failure_rate()}


@app.get("/metrics", include_in_schema=False)
def expose_metrics():
    # Длину очереди API читает у брокера в момент опроса: это состояние, а не событие.
    metrics.queue_depth.labels(QUEUE).set(store.llen(QUEUE))
    metrics.awaiting_payment.set(int(store.get(AWAITING_KEY) or 0))
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/lab", response_class=HTMLResponse, include_in_schema=False)
def lab():
    return Path(__file__).with_name("console.html").read_text()


@app.get("/state", include_in_schema=False)
def state():
    """Сводка для страницы стенда. Счётчики воркера читает сервер, а не браузер:
    у воркера свой процесс и свой адрес /metrics, и из браузера он закрыт правилом CORS."""
    worker = {}
    try:
        response = httpx.get(os.environ.get("ORDERS_WORKER_METRICS", "http://127.0.0.1:8026/metrics"), timeout=2)
        worker = parse_counters(response.text, ["orders_paid_total", "orders_gateway_failures_total",
                                                "orders_rejected_total", "orders_task_retries_total",
                                                "orders_tasks_finished_total"])
    except httpx.HTTPError:
        worker = {}
    api_text = generate_latest().decode()
    return {"queue_depth": store.llen(QUEUE),
            "gateway_failure_rate": gateway_failure_rate(),
            "awaiting_payment": int(store.get(AWAITING_KEY) or 0),
            "created": sum_counter(api_text, "orders_created_total"),
            "http_2xx": sum_counter(api_text, "orders_http_requests_total", 'status="2'),
            "http_5xx": sum_counter(api_text, "orders_http_requests_total", 'status="5'),
            **worker}


def sum_counter(text, name, contains=None):
    """Сумма всех рядов счётчика в тексте экспозиции. Ряды _created пропускаем."""
    total = 0.0
    for line in text.splitlines():
        if not line.startswith(name) or line.startswith(name + "_created"):
            continue
        if contains and contains not in line:
            continue
        total += float(line.rsplit(" ", 1)[1])
    return round(total, 2)


def parse_counters(text, names):
    return {name.replace("orders_", "").replace("_total", ""): sum_counter(text, name) for name in names}
