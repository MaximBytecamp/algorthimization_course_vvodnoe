"""Замер к занятию 17: поиск в list, set и dict, повторы и пара с суммой.

Запуск: python bench.py > bench_results.txt
Опыт 1 — 1000 поисков отсутствующих номеров в list, set и dict (глава 0.2).
Опыт 2 — ваша has_duplicate против перебора пар на n разных числах.
Опыт 3 — ваша two_sum против перебора пар, пары нет.
Каждое время — медиана пяти повторов, в миллисекундах. Около 10 секунд.
"""
import platform
import random
import statistics
import sys
import time

from solution import has_duplicate, two_sum


def median_ms(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def lookups(container, queries):
    found = 0
    for q in queries:
        if q in container:
            found += 1
    return found


def has_duplicate_brute(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False


def two_sum_brute(nums, target):
    for j in range(len(nums)):
        for i in range(j):
            if nums[i] + nums[j] == target:
                return (i, j)
    return None


print(f'Python {platform.python_version()}, {platform.machine()}, {platform.system()}')
print()
print('Опыт 1. 1000 поисков отсутствующих номеров, мс')
print(f'{"n":>8} {"list":>10} {"set":>10} {"dict":>10}')
queries = list(range(1, 2000, 2))
for n in (10_000, 20_000, 40_000, 80_000):
    orders = list(range(0, 2 * n, 2))
    as_set, as_dict = set(orders), dict.fromkeys(orders, 'принят')
    print(f'{n:>8} {median_ms(lookups, orders, queries):>10.3f} '
          f'{median_ms(lookups, as_set, queries):>10.3f} {median_ms(lookups, as_dict, queries):>10.3f}')
print()
print('Опыт 2. Повторы: n разных чисел вперемешку, мс')
print(f'{"n":>8} {"перебор":>10} {"has_duplicate":>14}')
for n in (1000, 2000, 4000):
    items = list(range(n))
    random.Random(n).shuffle(items)
    print(f'{n:>8} {median_ms(has_duplicate_brute, items):>10.3f} {median_ms(has_duplicate, items):>14.3f}')
print()
print('Опыт 3. Пара с суммой: n чётных чисел, target = -1, мс')
print(f'{"n":>8} {"перебор":>10} {"two_sum":>10}')
for n in (1000, 2000, 4000):
    nums = list(range(0, 2 * n, 2))
    print(f'{n:>8} {median_ms(two_sum_brute, nums, -1):>10.3f} {median_ms(two_sum, nums, -1):>10.3f}')
