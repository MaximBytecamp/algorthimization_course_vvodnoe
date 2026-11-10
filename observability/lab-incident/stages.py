import json
import statistics

events = json.load(open("events2.json"))["events"]       # ответ /events экземпляра api-2
print(f"записей: {len(events)}, с уровнем WARNING: {sum(e['level'] == 'WARNING' for e in events)}")
for name in ("select_products", "acquire_connection"):
    ms = [s["duration_ms"] for e in events for s in e["spans"] if s["name"] == name]
    print(f"{name}: в среднем {statistics.mean(ms):.1f} мс, максимум {max(ms):.1f} мс")
