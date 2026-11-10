"""Четыре фазы нагрузки для лекции 1.5: обычная, наплыв, разбор очереди, отказ шлюза.

Запуск вместе с watch.py во втором терминале: python phases.py
"""
import time
import httpx
API = "http://127.0.0.1:8025"
PHASES = [("обычная нагрузка", 40, 3.0, 0.0), ("наплыв заказов", 30, 11.0, 0.0),
          ("очередь разбирается", 50, 1.0, 0.0), ("шлюз отказывает", 60, 2.5, 0.5)]
t0 = time.time()
with httpx.Client(timeout=10) as c:
    for title, sec, rate, fail in PHASES:
        c.post(f"{API}/admin/gateway", params={"failure_rate": fail})
        print(f"{time.time()-t0:4.0f}с фаза: {title}, {rate}/с, отказ {fail:.0%}", flush=True)
        b = time.time(); sent = 0
        while time.time() - b < sec:
            target = int((time.time() - b) * rate)
            while sent < target:
                c.post(f"{API}/orders", params={"channel": ["web","mobile","partner"][sent % 3]}); sent += 1
            time.sleep(0.02)
    c.post(f"{API}/admin/gateway", params={"failure_rate": 0.0})
print(f"{time.time()-t0:4.0f}с конец", flush=True)
