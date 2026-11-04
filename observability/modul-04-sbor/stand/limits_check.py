"""Почему target в состоянии DOWN: задание, длительность опроса и ошибка (глава 4.4)."""

import json
import urllib.request

with urllib.request.urlopen("http://localhost:9104/api/v1/targets") as response:
    targets = json.load(response)["data"]["activeTargets"]

for t in sorted(targets, key=lambda t: t["labels"]["job"]):
    if t["health"] != "up":
        error = t["lastError"].split(" (")[0]          # причина без подробностей
        print(f'{t["labels"]["job"]:<13}{t["lastScrapeDuration"]:>7.3f} с  {error}')
