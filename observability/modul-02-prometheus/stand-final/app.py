"""Итоговый стенд модуля 2: приложение FastAPI с двумя метриками.

http_requests_total — counter: сколько HTTP-запросов обработано, метки method и status.
items_in_progress   — gauge: сколько запросов к /items обрабатывается в эту секунду.

Страница /metrics отдаёт обе метрики в текстовом формате Prometheus.

Запуск без Docker:  uvicorn app:app --port 8020
"""

import asyncio

from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    Counter,
    Gauge,
    disable_created_metrics,
    generate_latest,
)

# Без этого вызова у каждого ряда счётчика появляется второй ряд
# http_requests_created (глава 2.3, §5).
disable_created_metrics()

# Свой реестр: в ответе только метрики приложения, без python_gc_* и process_*.
registry = CollectorRegistry()

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "status"],
    registry=registry,
)

# Задание 4 главы 2.6. У gauge без меток один ряд, он появляется в ответе
# сразу со значением 0.0.
ITEMS_IN_PROGRESS = Gauge(
    "items_in_progress",
    "Requests to /items being processed right now",
    registry=registry,
)

# Запросы Prometheus к этим адресам в счётчик не попадают.
SERVICE_PATHS = {"/metrics", "/metrics/slow", "/metrics/broken", "/metrics/html"}

app = FastAPI(title="Prometheus final")


@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)
    if request.url.path not in SERVICE_PATHS:
        HTTP_REQUESTS.labels(request.method, str(response.status_code)).inc()
    return response


@app.get("/")
async def index():
    return {"service": "prometheus-final", "metrics": "/metrics"}


@app.get("/items/{item_id}")
async def get_item(item_id: int, wait: float = 0):
    # wait — сколько секунд обрабатывать запрос, не больше 60. Нужен, чтобы
    # значение items_in_progress успело попасть в scrape: /items/7?wait=40
    ITEMS_IN_PROGRESS.inc()
    try:
        await asyncio.sleep(min(max(wait, 0), 60))
        if item_id > 100:
            return PlainTextResponse("not found", status_code=404)
        return {"item_id": item_id}
    finally:
        ITEMS_IN_PROGRESS.dec()


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(registry), media_type=CONTENT_TYPE_LATEST)


# Три адреса ниже нужны только для опыта с ошибками из главы 2.4.

@app.get("/metrics/slow")
async def metrics_slow():
    await asyncio.sleep(3)
    return Response(generate_latest(registry), media_type=CONTENT_TYPE_LATEST)


@app.get("/metrics/broken")
async def metrics_broken():
    body = "# TYPE http_requests_total counter\nhttp_requests_total{method=GET} 1\n"
    return Response(body, media_type=CONTENT_TYPE_LATEST)


@app.get("/metrics/html")
async def metrics_html():
    return Response(generate_latest(registry), media_type="text/html")
