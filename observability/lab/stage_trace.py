"""Функция stage из app.py с печатью значений после каждого этапа (лекция 1.3, §6)."""
import asyncio
import time

async def main():
    started = time.perf_counter()
    spans = []

    async def stage(name, seconds):
        offset = time.perf_counter() - started
        begin = time.perf_counter()
        await asyncio.sleep(seconds)
        spans.append({"name": name, "offset_ms": round(offset * 1000, 3),
                      "duration_ms": round((time.perf_counter() - begin) * 1000, 3)})
        print(f"{name:<16} offset = {offset * 1000:7.3f} мс  длительность = {spans[-1]['duration_ms']:7.3f} мс")

    print(f"started = {started:.3f}  (показание таймера, секунды)")
    await stage("validate", 0.01)
    await stage("dependency.wait", 0.06)
    await stage("serialize", 0.01)
    print(spans)

asyncio.run(main())
