"""Нагрузка: заданное число запросов в секунду, поровну на три экземпляра.

Запросы отправляются по расписанию, не дожидаясь ответов, — как от многих пользователей.
Каждый ответ записывается в CSV: время отправки, экземпляр, код, длительность у клиента, request_id.
    python load.py --rate 186 --seconds 30 --out before.csv
"""
import argparse
import asyncio
import csv
import time

import httpx

INSTANCES = {"api-1": "http://127.0.0.1:8031", "api-2": "http://127.0.0.1:8032", "api-3": "http://127.0.0.1:8033"}


async def one(client, name, url, rows):
    sent = time.time()
    started = time.perf_counter()
    response = await client.get(url + "/products")
    rows.append({"t": round(sent, 3), "instance": name, "status": response.status_code,
                 "ms": round((time.perf_counter() - started) * 1000, 1),
                 "request_id": response.headers.get("X-Request-ID", "")})


async def main(rate, seconds, out):
    rows, tasks = [], []
    names = list(INSTANCES)
    limits = httpx.Limits(max_connections=2000, max_keepalive_connections=300)
    async with httpx.AsyncClient(timeout=120, limits=limits) as client:
        begin = time.perf_counter()
        for n in range(int(rate * seconds)):
            delay = begin + n / rate - time.perf_counter()
            if delay > 0:
                await asyncio.sleep(delay)
            name = names[n % 3]
            tasks.append(asyncio.create_task(one(client, name, INSTANCES[name], rows)))
        await asyncio.gather(*tasks)
    with open(out, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda row: row["t"]))
    print(f"{out}: {len(rows)} ответов")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rate", type=float, default=186)
    parser.add_argument("--seconds", type=float, default=30)
    parser.add_argument("--out", default="results.csv")
    args = parser.parse_args()
    asyncio.run(main(args.rate, args.seconds, args.out))
