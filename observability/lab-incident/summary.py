"""Сводка прогона load.py: частота, ошибки, медиана и p95 — всего и по экземплярам.

    python summary.py after.csv
"""
import csv
import math
import sys

def p(values, q):
    values = sorted(values)
    return values[math.ceil(q * len(values)) - 1]

rows = list(csv.DictReader(open(sys.argv[1])))
seconds = float(rows[-1]["t"]) - float(rows[0]["t"])
groups = {"все": rows}
for row in rows:
    groups.setdefault(row["instance"], []).append(row)

print("группа   запр/с  ошибок  медиана  p95")
for name, group in groups.items():
    ms = [float(row["ms"]) for row in group]
    errors = sum(row["status"] != "200" for row in group)
    print(f"{name:<7} {len(group) / seconds:7.1f} {errors:7d} {p(ms, 0.5):6.0f} мс {p(ms, 0.95):5.0f} мс")
