"""Прогон из трёх фаз: норма, наплыв заказов, отказ платёжного шлюза.

Запуск (API, воркер, Redis и Prometheus уже подняты):
    .venv/bin/python run_experiment.py

Сохраняет results/timeline.json — границы фаз и опрос состояния раз в секунду,
results/series.json — те же ряды, что рисует Grafana, выгруженные из Prometheus.
"""
import json
import threading
import time
from pathlib import Path

import httpx

API = "http://127.0.0.1:8025"
PROM = "http://127.0.0.1:9096"
RESULTS = Path(__file__).with_name("results")
RESULTS.mkdir(exist_ok=True)

# Мощность воркера измерена заранее: около 4,6 задания в секунду при concurrency 2.
PHASES = [
    ("norma", "Обычная нагрузка", 60, 3.0, 0.0),
    ("naplyv", "Наплыв заказов", 25, 11.0, 0.0),
    ("drain", "Очередь разбирается", 60, 1.0, 0.0),
    ("otkaz", "Платёжный шлюз отказывает", 75, 2.5, 0.5),
]

state_log = []
stop = threading.Event()


def poll_state():
    """Раз в секунду спрашиваем сервис о длине очереди: так виден рост и спад."""
    with httpx.Client(timeout=5) as client:
        while not stop.is_set():
            try:
                data = client.get(API + "/state").json()
                state_log.append({"t": round(time.time(), 2), **data})
            except httpx.HTTPError:
                pass
            time.sleep(1.0)


def main():
    started = time.time()
    watcher = threading.Thread(target=poll_state, daemon=True)
    watcher.start()
    marks = []
    channels = ["web", "mobile", "partner"]
    with httpx.Client(timeout=10) as client:
        for key, title, seconds, rate, failure in PHASES:
            client.post(f"{API}/admin/gateway", params={"failure_rate": failure})
            begin = time.time()
            marks.append({"phase": key, "title": title, "from": round(begin, 2),
                          "rate_per_second": rate, "gateway_failure_rate": failure})
            print(f"{key}: {title} — {seconds} с, {rate} заказов/с, отказ шлюза {failure:.0%}", flush=True)
            sent = 0
            while time.time() - begin < seconds:
                target = int((time.time() - begin) * rate)
                while sent < target:
                    client.post(f"{API}/orders", params={"channel": channels[sent % 3]})
                    sent += 1
                time.sleep(0.02)
            marks[-1]["to"] = round(time.time(), 2)
            marks[-1]["orders_sent"] = sent
        client.post(f"{API}/admin/gateway", params={"failure_rate": 0.0})
    stop.set()
    watcher.join(timeout=3)
    finished = time.time()

    (RESULTS / "timeline.json").write_text(json.dumps(
        {"started": round(started, 2), "finished": round(finished, 2), "phases": marks, "state": state_log},
        ensure_ascii=False, indent=1))
    print("timeline.json сохранён")
    save_series(started - 30, finished + 30)


def save_series(begin, end):
    """Выгружаем из Prometheus те же ряды, что показывает дашборд."""
    queries = {
        "http_rps": 'sum(rate(orders_http_requests_total[1m]))',
        "http_p95": 'histogram_quantile(0.95, sum by (le) (rate(orders_http_request_duration_seconds_bucket[1m])))',
        "http_5xx_ratio": '(sum(rate(orders_http_requests_total{status=~"5.."}[1m])) or vector(0)) / clamp_min(sum(rate(orders_http_requests_total[1m])), 0.001)',
        "queue_depth": 'orders_queue_depth{job="orders-api",queue="orders"}',
        "queue_wait_p95": 'histogram_quantile(0.95, sum by (le) (rate(orders_task_queue_wait_seconds_bucket[1m])))',
        "worker_busy": 'orders_worker_busy_slots{job="orders-worker"}',
        "worker_slots": 'orders_worker_concurrency{job="orders-worker"}',
        "created_rps": "sum(rate(orders_created_total[1m]))",
        "paid_rps": "sum(rate(orders_paid_total[1m]))",
        "retries_rps": "sum(rate(orders_task_retries_total[1m]))",
        "gateway_failures_rps": "sum(rate(orders_gateway_failures_total[1m]))",
        "rejected_rps": "sum(rate(orders_rejected_total[1m]))",
    }
    out = {}
    with httpx.Client(timeout=30) as client:
        for name, expr in queries.items():
            response = client.get(PROM + "/api/v1/query_range", params={
                "query": expr, "start": begin, "end": end, "step": 5})
            result = response.json()["data"]["result"]
            out[name] = [[float(t), None if v in ("NaN", "+Inf") else float(v)] for t, v in result[0]["values"]] if result else []
    (RESULTS / "series.json").write_text(json.dumps(out, ensure_ascii=False))
    print("series.json сохранён:", ", ".join(f"{k}={len(v)}" for k, v in out.items()))


if __name__ == "__main__":
    main()
