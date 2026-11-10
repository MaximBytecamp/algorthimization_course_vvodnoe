"""Стенд лекции 1.6: сервис каталога с пулом соединений к базе данных.

Запуск одного экземпляра:
    INSTANCE=api-1 VERSION=2.14.0 POOL_SIZE=10 python -m uvicorn app:app --port 8031
Базы данных здесь нет: соединение пула — место в asyncio.Semaphore, SQL-запрос — ожидание 40 мс.
"""
import asyncio
import os
import time
import uuid
from collections import deque
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import JSONResponse, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

INSTANCE = os.environ.get("INSTANCE", "api-1")
VERSION = os.environ.get("VERSION", "2.14.0")
POOL_SIZE = int(os.environ.get("POOL_SIZE", "10"))
SQL_SECONDS = 0.04

app = FastAPI(title=f"Catalog {INSTANCE} · Макаров М. Н.")
pool = asyncio.Semaphore(POOL_SIZE)
waiting = 0
events = deque(maxlen=5000)

BUCKETS = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
requests_total = Counter("catalog_http_requests_total", "Запросы /products.", ["instance", "version", "status"])
duration = Histogram("catalog_http_request_duration_seconds", "Длительность /products.", ["instance", "version"], buckets=BUCKETS)
pool_wait = Histogram("catalog_pool_wait_seconds", "Ожидание соединения из пула.", ["instance"], buckets=BUCKETS)
pool_in_use = Gauge("catalog_pool_in_use", "Занятые соединения пула.", ["instance"])
pool_size = Gauge("catalog_pool_size", "Размер пула.", ["instance"])
pool_size.labels(INSTANCE).set(POOL_SIZE)


@app.get("/products")
async def products():
    global waiting
    request_id = uuid.uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat()
    started = time.perf_counter()
    spans = []

    def span(name, begin):
        spans.append({"name": name, "offset_ms": round((begin - started) * 1000, 1),
                      "duration_ms": round((time.perf_counter() - begin) * 1000, 1)})

    begin = time.perf_counter()
    waiting += 1
    await pool.acquire()
    waiting -= 1
    waited = time.perf_counter() - begin
    span("acquire_connection", begin)
    pool_wait.labels(INSTANCE).observe(waited)
    pool_in_use.labels(INSTANCE).inc()
    try:
        begin = time.perf_counter()
        await asyncio.sleep(SQL_SECONDS)
        span("select_products", begin)
    finally:
        pool.release()
        pool_in_use.labels(INSTANCE).dec()
    begin = time.perf_counter()
    await asyncio.sleep(0.005)
    span("serialize", begin)

    elapsed = time.perf_counter() - started
    level = "WARNING" if waited > 1 else "INFO"
    event = {"timestamp": timestamp, "level": level, "instance": INSTANCE, "version": VERSION,
             "route": "/products", "status": 200, "duration_ms": round(elapsed * 1000, 1),
             "request_id": request_id, "spans": spans}
    if level == "WARNING":
        event["message"] = f"pool_wait_exceeded pool_size={POOL_SIZE} waiting={waiting}"
    events.append(event)
    requests_total.labels(INSTANCE, VERSION, "200").inc()
    duration.labels(INSTANCE, VERSION).observe(elapsed)
    return JSONResponse({"items": 10, "request_id": request_id},
                        headers={"X-Request-ID": request_id, "X-Instance": INSTANCE})


@app.get("/config")
async def config():
    return {"instance": INSTANCE, "version": VERSION, "pool_size": POOL_SIZE}


@app.get("/events")
async def get_events():
    return {"events": list(events)}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
