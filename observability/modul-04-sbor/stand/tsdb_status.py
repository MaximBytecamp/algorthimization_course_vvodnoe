"""Что хранит база Prometheus сейчас: ряды в памяти, время данных, срок хранения (глава 4.5)."""

import json
import sys
import urllib.request
from datetime import datetime, timezone

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:9104"

def api(path):
    with urllib.request.urlopen(base + path) as response:
        return json.load(response)["data"]

head = api("/api/v1/status/tsdb")["headStats"]
runtime = api("/api/v1/status/runtimeinfo")
utc = lambda ms: datetime.fromtimestamp(ms / 1000, timezone.utc).strftime("%H:%M:%S")

print("рядов в head:", head["numSeries"], " кусков:", head["chunkCount"])
print("head с", utc(head["minTime"]), "по", utc(head["maxTime"]), "UTC")
print("срок хранения:", runtime["storageRetention"])
