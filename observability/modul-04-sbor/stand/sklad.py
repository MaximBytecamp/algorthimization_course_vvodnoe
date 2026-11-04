"""Склад — «чужая» программа для модуля 4.

Своих метрик у склада нет: состояние он отдаёт только в JSON на /status.
Перевести это состояние в метрики — задача exporter (sklad_exporter.py).

Запуск без Docker:  uvicorn sklad:app --port 8000
"""

import asyncio

from fastapi import FastAPI

PACK_SECONDS = 2.0  # один заказ собирается две секунды

app = FastAPI(title="Warehouse")
queue: asyncio.Queue = asyncio.Queue()
state = {"packed_total": 0}


@app.on_event("startup")
async def start_packer():
    asyncio.create_task(packer())


async def packer():
    while True:
        await queue.get()
        await asyncio.sleep(PACK_SECONDS)
        state["packed_total"] += 1


@app.post("/orders")
async def add_order():
    await queue.put(1)
    return {"queued": queue.qsize()}


@app.get("/status")
async def status():
    return {
        "queue": queue.qsize(),
        "packed_total": state["packed_total"],
    }
