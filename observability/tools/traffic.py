"""Нагрузка для снимков Prometheus и Grafana: 2 минуты без ошибок, затем 90 секунд с ошибками.

Запуск после свежего старта API, чтобы счётчики начинались с нуля:
python3 tools/traffic.py [http://127.0.0.1:8015]
"""
import sys
import time
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8015'


def phase(seconds, pick):
    end, n = time.time() + seconds, 0
    while time.time() < end:
        n += 1
        try:
            urllib.request.urlopen(f'{BASE}/products?scenario={pick(n)}', timeout=10).read()
        except urllib.error.HTTPError:
            pass
        time.sleep(0.4)


phase(120, lambda n: 'fast')
phase(90, lambda n: 'error' if n % 4 == 0 else 'slow' if n % 25 == 0 else 'fast')
print('traffic done')
