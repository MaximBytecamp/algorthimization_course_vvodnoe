"""Exporter склада: читает JSON со страницы /status и отдаёт метрики.

Склад опрашивается в момент, когда Prometheus запрашивает /metrics у exporter.
Своего хранилища у exporter нет: каждое число — то, что склад ответил сейчас.

Запуск без Docker:  SKLAD_URL=http://localhost:8043/status python sklad_exporter.py
"""

import json
import os
import time
import urllib.request

from prometheus_client import start_http_server
from prometheus_client.core import REGISTRY, CounterMetricFamily, GaugeMetricFamily

SKLAD_URL = os.environ.get("SKLAD_URL", "http://sklad:8000/status")


class SkladCollector:
    def collect(self):
        up = GaugeMetricFamily("sklad_up", "1 if the warehouse answered /status")
        try:
            with urllib.request.urlopen(SKLAD_URL, timeout=2) as response:
                status = json.load(response)
        except OSError:
            up.add_metric([], 0)
            yield up
            return
        up.add_metric([], 1)
        yield up
        yield GaugeMetricFamily("sklad_queue_length", "Orders waiting to be packed",
                                value=status["queue"])
        yield CounterMetricFamily("sklad_packed", "Orders packed since start",
                                  value=status["packed_total"])


REGISTRY.register(SkladCollector())

if __name__ == "__main__":
    start_http_server(8000)
    while True:
        time.sleep(3600)
