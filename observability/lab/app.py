"""Учебный API: детерминированные сценарии, события и длительности.
Запуск: python -m uvicorn app:app --host 127.0.0.1 --port 8015
Зависимость моделируется asyncio.sleep; реальной базы данных здесь нет.
"""
import asyncio
import json
import logging
import os
import time
import traceback
import uuid
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, Response

app = FastAPI(title="Telemetry Lab · Макаров М. Н.", version="1.0",
              description="Учебная модель: fast / slow / error. PostgreSQL заменён управляемым ожиданием.")
logger = logging.getLogger("telemetry_lab")
events = deque(maxlen=2000)
totals = {"200": 0, "500": 0}
duration_sum = 0.0
buckets = {x: 0 for x in [0.1, 0.25, 0.5, 1.0, 2.5, 5.0, float("inf")]}


@app.get("/health", tags=["Проверка процесса"])
async def health():
    return {"status": "ok", "scope": "process only; dependencies not checked"}


@app.get("/products", tags=["Эксперимент"])
async def products(scenario: Literal["fast", "slow", "error"] = "fast"):
    global duration_sum
    request_id = uuid.uuid4().hex
    started_at = datetime.now(timezone.utc).isoformat()
    started = time.perf_counter()
    spans = []
    status = 200
    exception_text = None

    async def stage(name, seconds):
        offset = time.perf_counter() - started
        begin = time.perf_counter()
        await asyncio.sleep(seconds)
        spans.append({"name": name, "offset_ms": round(offset * 1000, 3),
                      "duration_ms": round((time.perf_counter() - begin) * 1000, 3)})

    await stage("validate", 0.01)
    try:
        await stage("dependency.wait (simulated)", 3.0 if scenario == "slow" else 0.06)
        if scenario == "error":
            raise TimeoutError("Simulated dependency timeout; no database is connected")
        await stage("serialize", 0.01)
    except TimeoutError:
        status = 500
        # Путь к папке проекта убираем: журналу нужен файл и строка, а не устройство диска сервера.
        exception_text = traceback.format_exc().replace(str(Path(__file__).parent) + os.sep, "")
        logger.exception("dependency_timeout request_id=%s", request_id)

    elapsed = time.perf_counter() - started
    totals[str(status)] += 1
    duration_sum += elapsed
    for bound in buckets:
        if elapsed <= bound:
            buckets[bound] += 1
    event = {"timestamp": started_at, "level": "ERROR" if status == 500 else "INFO",
             "service": "products-api", "event": "request_completed", "route": "/products",
             "status": status, "duration_ms": round(elapsed * 1000, 3),
             "request_id": request_id, "scenario": scenario, "spans": spans,
             "exception": exception_text}
    events.append(event)
    logger.info(json.dumps({k: v for k, v in event.items() if k not in {"spans", "exception"}}, ensure_ascii=False))
    if status == 500:
        raise HTTPException(500, detail={"error": "simulated dependency timeout", "request_id": request_id},
                            headers={"X-Request-ID": request_id, "X-Duration-Ms": str(event["duration_ms"])})
    return Response(json.dumps({"status": "ok", "items": 10, "request_id": request_id,
                                "duration_ms": event["duration_ms"]}), media_type="application/json",
                    headers={"X-Request-ID": request_id, "X-Duration-Ms": str(event["duration_ms"])})


@app.get("/events", tags=["Учебные данные"])
async def get_events():
    return {"note": "Last 2000 events in this single process; cleared on restart", "events": list(events)}


@app.get("/metrics", include_in_schema=False)
async def metrics():
    # Minimal text exposition for the introduction. Later chapters use a client library.
    lines = ["# HELP lab_http_requests_total Completed products requests.",
             "# TYPE lab_http_requests_total counter"]
    for status, value in totals.items():
        lines.append(f'lab_http_requests_total{{route="/products",status="{status}"}} {value}')
    lines.extend(["# HELP lab_http_request_duration_seconds Application handler duration.",
                  "# TYPE lab_http_request_duration_seconds histogram"])
    for bound, value in buckets.items():
        le = "+Inf" if bound == float("inf") else str(bound)
        lines.append(f'lab_http_request_duration_seconds_bucket{{le="{le}"}} {value}')
    lines.append(f"lab_http_request_duration_seconds_sum {duration_sum}")
    lines.append(f"lab_http_request_duration_seconds_count {sum(totals.values())}")
    return Response("\n".join(lines) + "\n", media_type="text/plain; version=0.0.4")


@app.get("/lab", response_class=HTMLResponse, include_in_schema=False)
async def lab():
    return Path(__file__).with_name("console.html").read_text()
