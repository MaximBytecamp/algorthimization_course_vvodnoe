"""Ряд по истории: где отсчёты есть и где дыра (глава 4.6)."""

import json
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

query, start, end = sys.argv[1], sys.argv[2], sys.argv[3]   # время — UTC, ЧЧ:ММ:СС
day = datetime.now(timezone.utc).strftime("%Y-%m-%dT")
params = urllib.parse.urlencode({"query": query, "start": day + start + "Z",
                                 "end": day + end + "Z", "step": "15s"})
with urllib.request.urlopen("http://localhost:9104/api/v1/query_range?" + params) as r:
    result = json.load(r)["data"]["result"]

points = {}
for series in result:
    for ts, value in series["values"]:
        points[ts] = value
t = datetime.fromisoformat(day + start + "+00:00").timestamp()
while t <= datetime.fromisoformat(day + end + "+00:00").timestamp():
    print(datetime.fromtimestamp(t, timezone.utc).strftime("%H:%M:%S"), points.get(t, "—"))
    t += 15
