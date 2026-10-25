"""Сервис заказов для модуля 3 «Метрика как данные».

Метрики приложения:
  http_requests_total            counter    запросы по методу, шаблону пути и коду ответа
  http_request_duration_seconds  histogram  длительность обработки запроса
  http_requests_in_progress      gauge      запросы, которые обрабатываются сейчас
  orders_created_total           counter    созданные заказы по способу оплаты
  orders_queue_length            gauge      заказы, которые ждут сборки

Опыт с кардинальностью (глава 3.7) включается переменной окружения
BAD_LABELS=1: тогда появляется счётчик с полным путём и номером клиента
в метках.

Запуск без Docker:  uvicorn app:app --port 8031
"""

import asyncio
import os
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    Counter,
    Gauge,
    Histogram,
    disable_created_metrics,
    generate_latest,
)

# Ряд _created разобран в главе 2.3; в этом стенде он не нужен.
disable_created_metrics()

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "HTTP requests handled by the service",
    ["method", "route", "status"],
)

# Границы корзин в секундах: от 25 мс до 2,5 с.
HTTP_DURATION = Histogram(
    "http_request_duration_seconds",
    "Time spent handling an HTTP request",
    ["route"],
    buckets=(0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5),
)

IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "HTTP requests being handled right now",
)

ORDERS_CREATED = Counter(
    "orders_created_total",
    "Orders created",
    ["payment"],
)

QUEUE_LENGTH = Gauge(
    "orders_queue_length",
    "Orders waiting to be packed",
)

BAD_LABELS = os.environ.get("BAD_LABELS") == "1"
if BAD_LABELS:
    REQUESTS_BY_PATH = Counter(
        "http_requests_by_path_total",
        "HTTP requests by full path and customer (cardinality demo)",
        ["path", "customer_id"],
    )

# Запросы к /metrics не учитываются: иначе счётчики росли бы от каждого scrape.
SERVICE_PATHS = {"/metrics"}

# Заказ на сборке занимает одну секунду.
PACK_SECONDS = 1.0

app = FastAPI(title="Orders service")
queue: asyncio.Queue = asyncio.Queue()


@app.on_event("startup")
async def start_packer():
    asyncio.create_task(packer())


async def packer():
    """Склад собирает заказы по одному."""
    while True:
        await queue.get()
        await asyncio.sleep(PACK_SECONDS)
        QUEUE_LENGTH.dec()


def route_of(request: Request) -> str:
    """Шаблон пути из описания маршрута: /orders/{order_id}, а не /orders/17."""
    route = request.scope.get("route")
    return getattr(route, "path", "unknown")


@app.middleware("http")
async def measure(request: Request, call_next):
    if request.url.path in SERVICE_PATHS:
        return await call_next(request)
    IN_PROGRESS.inc()
    start = time.perf_counter()
    try:
        response = await call_next(request)
    finally:
        IN_PROGRESS.dec()
    elapsed = time.perf_counter() - start
    route = route_of(request)
    HTTP_REQUESTS.labels(request.method, route, str(response.status_code)).inc()
    HTTP_DURATION.labels(route).observe(elapsed)
    if BAD_LABELS:
        customer = request.headers.get("X-Customer-Id", "none")
        REQUESTS_BY_PATH.labels(request.url.path, customer).inc()
    return response


@app.get("/")
async def index():
    return {"service": "orders", "metrics": "/metrics"}


@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    if order_id > 500:
        return JSONResponse({"detail": "order not found"}, status_code=404)
    return {"order_id": order_id, "status": "packed"}


@app.post("/orders")
async def create_order(payment: str = "card"):
    if payment not in ("card", "cash"):
        return JSONResponse({"detail": "payment must be card or cash"}, status_code=422)
    ORDERS_CREATED.labels(payment).inc()
    QUEUE_LENGTH.inc()
    await queue.put(payment)
    return {"queued": True, "payment": payment}


@app.get("/report")
async def report(ms: int = 100):
    """Отчёт, который строится ms миллисекунд: длительность задаётся в запросе."""
    await asyncio.sleep(ms / 1000)
    return {"report": "ready", "ms": ms}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
