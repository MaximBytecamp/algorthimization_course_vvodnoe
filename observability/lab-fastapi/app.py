"""Стенд лекции 2.12: сервис каталога на FastAPI с метриками запросов.

Запуск: python -m uvicorn app:app --port 8040
Несколько процессов: rm -rf mp && mkdir mp && PROMETHEUS_MULTIPROC_DIR=mp python -m uvicorn app:app --port 8040 --workers 2
Метрики: http://localhost:8040/metrics
"""
import asyncio
import os
import random
import time

from fastapi import FastAPI, HTTPException, Request
from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram, make_asgi_app, multiprocess

REQUESTS = Counter("http_requests", "HTTP-запросы", ["method", "route", "status"])
DURATION = Histogram("http_request_duration_seconds", "Длительность обработки запроса",
                     ["method", "route"], buckets=(0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10))
IN_PROGRESS = Gauge("http_requests_in_progress", "Запросы в работе", multiprocess_mode="livesum")

app = FastAPI(title="Catalog · Макаров М. Н.")
if "PROMETHEUS_MULTIPROC_DIR" in os.environ:          # несколько worker-процессов
    registry = CollectorRegistry()
    multiprocess.MultiProcessCollector(registry)      # сумма файлов всех процессов
    app.mount("/metrics", make_asgi_app(registry=registry))
else:
    app.mount("/metrics", make_asgi_app())


@app.middleware("http")
async def measure(request: Request, call_next):
    if request.url.path.startswith("/metrics"):          # опросы Prometheus не считаем
        return await call_next(request)
    started = time.perf_counter()
    status = 500                                          # если обработчик упадёт, так и останется
    with IN_PROGRESS.track_inprogress():
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            route = request.scope.get("route")
            template = route.path if route else "unmatched"   # шаблон маршрута, а не адрес
            REQUESTS.labels(request.method, template, str(status)).inc()
            DURATION.labels(request.method, template).observe(time.perf_counter() - started)


@app.get("/products")
async def products():
    await asyncio.sleep(random.uniform(0.02, 0.08))
    return {"items": 10}


@app.get("/products/{product_id}")
async def product(product_id: int):
    await asyncio.sleep(0.01)
    if product_id > 100:
        raise HTTPException(404, "товар не найден")
    return {"id": product_id}


@app.post("/orders")
async def create_order():
    await asyncio.sleep(0.03)
    if random.random() < 0.2:
        raise RuntimeError("платёжный шлюз не ответил")
    return {"state": "accepted"}


@app.get("/report")
async def report():
    await asyncio.sleep(random.uniform(0.3, 1.5))
    return {"rows": 1200}
