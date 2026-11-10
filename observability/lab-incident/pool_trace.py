"""Четыре одновременных запроса к api-2 и ожидание соединения у каждого (лекция 1.6, §2)."""
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        await asyncio.gather(*(client.get("http://127.0.0.1:8032/products") for _ in range(4)))
        events = (await client.get("http://127.0.0.1:8032/events")).json()["events"]
    for n, event in enumerate(events, 1):
        spans = {s["name"]: s["duration_ms"] for s in event["spans"]}
        print(f"запрос {n}: acquire_connection {spans['acquire_connection']:5.1f} мс, "
              f"select_products {spans['select_products']:4.1f} мс, всего {event['duration_ms']:5.1f} мс")

asyncio.run(main())
