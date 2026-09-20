"""Определения метрик сервиса заказов. Один файл на API и воркер: имена не расходятся.

Соглашение об именах Prometheus: приставка orders_ — приложение, _total — счётчик,
_seconds — единица измерения. Метки берут значения из небольшого известного набора.
"""
from prometheus_client import Counter, Gauge, Histogram

# --- Технические метрики HTTP: rate, errors, duration ---
http_requests = Counter(
    "orders_http_requests_total", "Завершённые HTTP-запросы.",
    ["route", "method", "status"])
http_duration = Histogram(
    "orders_http_request_duration_seconds", "Длительность обработчика HTTP.",
    ["route"], buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5])
http_inflight = Gauge(
    "orders_http_inflight_requests", "Запросы, которые обрабатываются прямо сейчас.")

# --- Насыщение: очередь и воркеры ---
queue_depth = Gauge(
    "orders_queue_depth", "Заданий ждёт в очереди брокера.", ["queue"])
worker_concurrency = Gauge(
    "orders_worker_concurrency", "Сколько заданий воркер может выполнять одновременно.")
worker_busy = Gauge(
    "orders_worker_busy_slots", "Сколько слотов воркера заняты прямо сейчас.")

# --- Фоновые задания: три разных времени ---
task_queue_wait = Histogram(
    "orders_task_queue_wait_seconds", "Время от постановки задания в очередь до начала выполнения.",
    ["task"], buckets=[0.1, 0.5, 1.0, 5.0, 15.0, 30.0, 60.0, 120.0, 300.0])
task_duration = Histogram(
    "orders_task_duration_seconds", "Время выполнения задания воркером.",
    ["task"], buckets=[0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0])
tasks_finished = Counter(
    "orders_tasks_finished_total", "Завершённые задания по итогу.", ["task", "state"])
task_retries = Counter(
    "orders_task_retries_total", "Сколько раз задание было поставлено на повтор.", ["task"])
gateway_failures = Counter(
    "orders_gateway_failures_total", "Неуспешные обращения к платёжному шлюзу.", ["reason"])

# --- Бизнес-метрики: то, ради чего сервис существует ---
orders_created = Counter(
    "orders_created_total", "Принятые заказы.", ["channel"])
orders_paid = Counter(
    "orders_paid_total", "Заказы, оплата которых подтверждена.", ["channel"])
orders_rejected = Counter(
    "orders_rejected_total", "Заказы, отклонённые окончательно.", ["reason"])
revenue = Counter(
    "orders_revenue_rub_total", "Подтверждённая выручка, рубли.")
awaiting_payment = Gauge(
    "orders_awaiting_payment", "Заказы, принятые, но ещё не подтверждённые.")
