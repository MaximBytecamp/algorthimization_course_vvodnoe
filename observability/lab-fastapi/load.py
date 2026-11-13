"""Нагрузка на стенд: 400 запросов разных видов, по 10 одновременно.

    python load.py
"""
import asyncio
import random

import httpx

BASE = "http://127.0.0.1:8040"


async def one(client):
    kind = random.random()
    if kind < 0.4:
        r = await client.get(BASE + "/products")
    elif kind < 0.75:
        r = await client.get(f"{BASE}/products/{random.randint(1, 150)}")
    elif kind < 0.9:
        r = await client.post(BASE + "/orders")
    else:
        r = await client.get(BASE + "/report")
    return r.status_code


async def main():
    random.seed(7)
    async with httpx.AsyncClient(timeout=30) as client:
        codes = []
        for _ in range(40):
            codes += await asyncio.gather(*(one(client) for _ in range(10)))
    print({code: codes.count(code) for code in sorted(set(codes))})


asyncio.run(main())
