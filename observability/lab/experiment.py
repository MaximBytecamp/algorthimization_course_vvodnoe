"""20 воспроизводимых запросов: 17 fast, 2 slow, 1 error. Python stdlib."""
import argparse
import csv
import json
import math
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen


def run(base, output):
    scenarios = ["fast"] * 20
    scenarios[6] = scenarios[16] = "slow"
    scenarios[12] = "error"
    rows = []
    for number, scenario in enumerate(scenarios, 1):
        start = time.perf_counter()
        try:
            response = urlopen(f"{base}/products?scenario={scenario}", timeout=15)
        except HTTPError as error:
            response = error
        body = json.load(response)
        row = {"number": number, "scenario": scenario, "status": response.code,
               "client_ms": round((time.perf_counter() - start) * 1000, 3),
               "handler_ms": float(response.headers["X-Duration-Ms"]),
               "request_id": response.headers["X-Request-ID"]}
        rows.append(row)
        print(f'{number:02d} {scenario:5s} HTTP {row["status"]} {row["client_ms"]:.1f} ms', flush=True)
    output.mkdir(parents=True, exist_ok=True)
    with (output / "requests.csv").open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader(); writer.writerows(rows)
    durations = sorted(r["client_ms"] for r in rows)
    summary = {"total": len(rows), "errors": sum(r["status"] >= 500 for r in rows),
               "slow_over_1000ms": sum(r["client_ms"] > 1000 for r in rows),
               "mean_ms": round(sum(durations) / len(rows), 3),
               "p95_nearest_rank_ms": durations[math.ceil(.95 * len(rows)) - 1],
               "method": "client wall time, all statuses, sequential requests; nearest rank p95"}
    (output / "summary.json").write_text(json.dumps(summary, indent=2))
    with urlopen(base + "/events") as response:
        all_events = json.load(response)["events"]
    ids = {r["request_id"] for r in rows}
    (output / "events.json").write_text(json.dumps([e for e in all_events if e["request_id"] in ids], indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:8015")
    parser.add_argument("--output", type=Path, default=Path("results"))
    args = parser.parse_args()
    run(args.base, args.output)
