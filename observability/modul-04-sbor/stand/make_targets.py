"""Пишет список target для Prometheus в targets/orders.json (глава 4.2).

Файл сначала пишется рядом под другим именем, затем подменяет старый целиком:
Prometheus никогда не прочитает его наполовину записанным.
"""

import json
import os

replicas = ["api", "api2"]            # например, ответ системы развёртывания
groups = [{"targets": [f"{name}:8000" for name in replicas],
           "labels": {"env": "prod"}}]

with open("targets/orders.json.tmp", "w") as f:
    json.dump(groups, f, indent=2)
os.replace("targets/orders.json.tmp", "targets/orders.json")  # подмена за один шаг
print(open("targets/orders.json").read())
