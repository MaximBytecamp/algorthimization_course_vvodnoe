"""Замер к занятию 20: индекс против перебора, доля попаданий LRU и FIFO, скорость LRU.

Запуск: python bench.py > bench_results.txt
Опыт 1 — 1000 поисков товара по коду: перебор списка против вашего build_index.
Опыт 2 — 100 000 запросов к 1000 товаров, популярные спрашивают чаще: доля попаданий
         LRU и FIFO при разной ёмкости.
Опыт 3 — 200 000 операций get и put: ваши LRUCache и LRUCacheLinked против LRU на списке.
Каждое время — медиана трёх повторов, в миллисекундах. Около 5 секунд.
"""
import platform
import random
import statistics
import time
from collections import OrderedDict

from solution import LRUCache, LRUCacheLinked, build_index


def median_ms(func, *args, repeat=3):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


class LRUList:
    """LRU с порядком в списке: перенос ключа — order.remove, O(n)."""

    def __init__(self, capacity):
        self.capacity, self.order, self.data = capacity, [], {}

    def get(self, key):
        if key not in self.data:
            return None
        self.order.remove(key)
        self.order.append(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.order.remove(key)
        self.order.append(key)
        self.data[key] = value
        if len(self.order) > self.capacity:
            del self.data[self.order.pop(0)]


rnd = random.Random(20)
print(f'Python {platform.python_version()}, {platform.machine()}, {platform.system()}')
print()
print('Опыт 1. Поиск по коду, мс')
print(f'{"записей":>8} {"перебор":>10} {"индекс: построение":>19} {"индекс: поиски":>15}')
for n in (10_000, 50_000):
    recs = [{'code': i} for i in range(n)]
    rnd.shuffle(recs)
    queries = [rnd.randrange(n) for _ in range(1000)]

    def scan():
        for q in queries:
            for r in recs:
                if r['code'] == q:
                    break
    idx = build_index(recs, 'code')

    def lookups():
        for q in queries:
            idx[q]
    print(f'{n:>8} {median_ms(scan):>10.1f} {median_ms(build_index, recs, "code"):>19.2f} {median_ms(lookups):>15.3f}')
print()
print('Опыт 2. Доля попаданий, 100 000 запросов к 1000 товаров')
keys = list(range(1000))
requests = rnd.choices(keys, weights=[1 / (k + 1) for k in keys], k=100_000)


def hit_rate(policy, capacity):
    cache, hits = OrderedDict(), 0
    for k in requests:
        if k in cache:
            hits += 1
            if policy == 'lru':
                cache.move_to_end(k)
        else:
            cache[k] = True
            if len(cache) > capacity:
                cache.popitem(last=False)
    return hits / len(requests)


print(f'{"ёмкость":>8} {"LRU":>8} {"FIFO":>8}')
for cap in (10, 50, 100, 500):
    print(f'{cap:>8} {hit_rate("lru", cap):>8.3f} {hit_rate("fifo", cap):>8.3f}')
print()
print('Опыт 3. 200 000 операций, мс')
ops = [(rnd.random() < 0.7, rnd.randrange(5000)) for _ in range(200_000)]


def drive(cls, capacity):
    c = cls(capacity)
    for is_get, k in ops:
        if is_get:
            c.get(k)
        else:
            c.put(k, k)


print(f'{"ёмкость":>8} {"OrderedDict":>12} {"связный":>10} {"список":>10}')
for cap in (100, 1000):
    print(f'{cap:>8} {median_ms(drive, LRUCache, cap):>12.1f} {median_ms(drive, LRUCacheLinked, cap):>10.1f} '
          f'{median_ms(drive, LRUList, cap, repeat=1):>10.1f}')
