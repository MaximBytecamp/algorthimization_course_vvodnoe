"""Ночная задача: строит отчёт и в конце отправляет метрики в Pushgateway (глава 4.7)."""

import os
import random
import time

from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

GATEWAY = os.environ.get("PUSHGATEWAY", "pushgateway:9091")

registry = CollectorRegistry()            # свой реестр: только метрики задачи
duration = Gauge("report_duration_seconds", "How long the report took", registry=registry)
rows = Gauge("report_rows", "Rows in the report", registry=registry)
last_success = Gauge("report_last_success_timestamp_seconds",
                     "When the report last finished successfully", registry=registry)

start = time.time()
time.sleep(3)                             # работа задачи
n = random.randint(900, 1100)
elapsed = time.time() - start
rows.set(n)
duration.set(elapsed)
last_success.set_to_current_time()

push_to_gateway(GATEWAY, job="nightly_report", registry=registry)
print("отправлено:", n, "строк за", round(elapsed, 2), "с")
