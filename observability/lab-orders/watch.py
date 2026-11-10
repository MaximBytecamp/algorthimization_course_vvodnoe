import time
from urllib.request import urlopen

API = "http://127.0.0.1:8025/metrics"
WORKER = "http://127.0.0.1:8026/metrics"
INTERVAL = 5

def read(url):
    values = {}
    for line in urlopen(url).read().decode().splitlines():
        if line.startswith("#"):
            continue
        name, value = line.rsplit(" ", 1)
        if name.split("{")[0].endswith("_created"):
            continue
        values[name] = float(value)
    return values

def total(values, prefix, part=""):
    return sum(v for k, v in values.items() if k.startswith(prefix) and part in k)

def snapshot():
    api, worker = read(API), read(WORKER)
    return {
        "http": total(api, "orders_http_requests_total", 'route="/orders"'),
        "http_5xx": total(api, "orders_http_requests_total", 'status="5'),
        "http_sec": total(api, "orders_http_request_duration_seconds_sum", '"/orders"'),
        "queue": total(api, "orders_queue_depth"),
        "busy": total(worker, "orders_worker_busy_slots"),
        "slots": total(worker, "orders_worker_concurrency"),
        "created": total(api, "orders_created_total"),
        "paid": total(worker, "orders_paid_total"),
        "rejected": total(worker, "orders_rejected_total"),
        "retries": total(worker, "orders_task_retries_total"),
        "wait_sec": total(worker, "orders_task_queue_wait_seconds_sum"),
        "wait_count": total(worker, "orders_task_queue_wait_seconds_count"),
    }

print("время  запр/с  5xx  мс/запр  очередь  занято  ждали,с  принято/с  оплачено/с  отклонено  повторы")
before = snapshot()
started = time.time()
while time.time() - started < 200:
    time.sleep(INTERVAL)
    now = snapshot()
    d = {k: now[k] - before[k] for k in now}
    rate = d["http"] / INTERVAL
    ms = d["http_sec"] / d["http"] * 1000 if d["http"] else 0
    wait = d["wait_sec"] / d["wait_count"] if d["wait_count"] else 0
    print(f"{time.time() - started:4.0f}с  {rate:6.1f}  {d['http_5xx']:3.0f}  {ms:7.1f}  "
          f"{now['queue']:7.0f}  {now['busy']:.0f} из {now['slots']:.0f}  {wait:7.1f}  "
          f"{d['created'] / INTERVAL:9.1f}  {d['paid'] / INTERVAL:10.1f}  {now['rejected']:9.0f}  {now['retries']:7.0f}", flush=True)
    before = now
