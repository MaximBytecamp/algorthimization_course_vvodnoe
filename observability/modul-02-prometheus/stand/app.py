"""Сервис для модуля 2: одно приложение FastAPI и одна метрика.

Метрика http_requests_total считает обработанные HTTP-запросы с метками
method и status. Endpoint /metrics отдаёт её в текстовом формате Prometheus.

Запуск без Docker:  uvicorn app:app --port 8020
"""

import asyncio

from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    Counter,
    disable_created_metrics,
    generate_latest,
)

# Без этого вызова рядом с каждым рядом счётчика появляется служебный ряд
# http_requests_created. Он разобран в главе 2.3, в стенде не нужен.
disable_created_metrics()

# Свой реестр вместо глобального: в выводе будет только наша метрика,
# без python_gc_* и process_* из стандартных сборщиков.
registry = CollectorRegistry()

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "status"],
    registry=registry,
)

# Пути, которые служат сбору метрик, в счётчик запросов не попадают:
# иначе он рос бы от каждого scrape сам по себе.
SERVICE_PATHS = {"/metrics", "/metrics/slow", "/metrics/broken", "/metrics/html"}

app = FastAPI(title="Prometheus start")


@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)
    if request.url.path not in SERVICE_PATHS:
        HTTP_REQUESTS.labels(request.method, str(response.status_code)).inc()
    return response


@app.get("/")
async def index():
    return {"service": "prometheus-start", "metrics": "/metrics"}


@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id > 100:
        return PlainTextResponse("not found", status_code=404)
    return {"item_id": item_id}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(registry), media_type=CONTENT_TYPE_LATEST)


# Три пути ниже нужны только для опыта из главы 2.4: так выглядят
# неуспешные scrape. Рабочая конфигурация к ним не обращается.

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
