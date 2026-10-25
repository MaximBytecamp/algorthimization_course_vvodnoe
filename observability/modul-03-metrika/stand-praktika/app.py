"""Сервис доставки — стенд практики модуля 3 (глава 3.8).

Сервис принимает заявки на доставку, отдаёт доставку по номеру и
рассчитывает маршрут курьера. Новые заявки ждут свободного курьера:
курьер забирает одну заявку каждые 2 секунды.

В сервисе уже есть одна метрика — http_requests_total. В ней ошибка,
которую нужно найти в задании 1 и исправить в задании 2. Места для
метрик заданий 3–5 отмечены словом ЗАДАНИЕ.

Запуск без Docker:  uvicorn app:app --port 8033
"""

import asyncio
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    Counter,
    disable_created_metrics,
    generate_latest,
)

disable_created_metrics()

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "HTTP requests handled by the service",
    ["method", "path", "status"],
)

# ЗАДАНИЕ 3: счётчик созданных заявок с меткой zone.
# ЗАДАНИЕ 4: gauge — заявки, которые ждут курьера.
# ЗАДАНИЕ 5: гистограмма длительности расчёта маршрута.

ZONES = ("north", "south", "center")
COURIER_SECONDS = 2.0  # курьер забирает одну заявку каждые 2 секунды

app = FastAPI(title="Delivery service")
waiting: asyncio.Queue = asyncio.Queue()


@app.on_event("startup")
async def start_courier():
    asyncio.create_task(courier())


async def courier():
    """Курьер забирает заявки по одной."""
    while True:
        await waiting.get()
        await asyncio.sleep(COURIER_SECONDS)
        # ЗАДАНИЕ 4: заявка забрана курьером.


@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)
    if request.url.path != "/metrics":
        HTTP_REQUESTS.labels(request.method, request.url.path, str(response.status_code)).inc()
    return response


@app.get("/")
async def index():
    return {"service": "delivery", "metrics": "/metrics"}


@app.get("/deliveries/{delivery_id}")
async def get_delivery(delivery_id: int):
    if delivery_id > 300:
        return JSONResponse({"detail": "delivery not found"}, status_code=404)
    return {"delivery_id": delivery_id, "status": "on the way"}


@app.post("/deliveries")
async def create_delivery(zone: str = "center"):
    if zone not in ZONES:
        return JSONResponse({"detail": "zone must be north, south or center"}, status_code=422)
    # ЗАДАНИЕ 3: заявка создана.
    # ЗАДАНИЕ 4: заявка ждёт курьера.
    await waiting.put(zone)
    return {"queued": True, "zone": zone}


@app.get("/route")
async def build_route(ms: int = 100):
    """Расчёт маршрута, который занимает ms миллисекунд."""
    start = time.perf_counter()
    await asyncio.sleep(ms / 1000)
    elapsed = time.perf_counter() - start
    # ЗАДАНИЕ 5: записать elapsed в гистограмму.
    return {"route": "ready", "ms": ms}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
