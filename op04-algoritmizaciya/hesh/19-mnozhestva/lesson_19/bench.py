"""Замер к занятию 19: общие пользователи и самая длинная последовательность.

Запуск: python bench.py > bench_results.txt
Опыт 1 — общие пользователи двух списков по n: проверка в списке против вашей common_users.
Опыт 2 — одна серия из n чисел вперемешку: ваши longest_consecutive и longest_consecutive_sorted.
Опыт 3 — n случайных разных чисел из диапазона 3n: те же две функции.
Каждое время — медиана трёх повторов, в миллисекундах. Около 5 секунд.
"""
import platform
import random
import statistics
import time

from solution import common_users, longest_consecutive, longest_consecutive_sorted


def median_ms(func, *args, repeat=3):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def common_list(a, b):
    result = []
    for u in a:
        if u in b and u not in result:
            result.append(u)
    return result


rnd = random.Random(19)
print(f'Python {platform.python_version()}, {platform.machine()}, {platform.system()}')
print()
print('Опыт 1. Общие пользователи, мс')
print(f'{"n":>8} {"список":>10} {"множество":>10}')
for n in (1000, 2000, 4000, 8000):
    a, b = rnd.sample(range(4 * n), n), rnd.sample(range(4 * n), n)
    print(f'{n:>8} {median_ms(common_list, a, b):>10.1f} {median_ms(common_users, a, b):>10.3f}')
print()
print('Опыт 2. Одна серия, мс')
print(f'{"n":>8} {"множество":>10} {"сортировка":>11}')
for n in (10_000, 100_000, 1_000_000):
    nums = list(range(n))
    rnd.shuffle(nums)
    print(f'{n:>8} {median_ms(longest_consecutive, nums):>10.1f} {median_ms(longest_consecutive_sorted, nums):>11.1f}')
print()
print('Опыт 3. Случайные разные числа, мс')
print(f'{"n":>8} {"множество":>10} {"сортировка":>11}')
for n in (10_000, 100_000, 1_000_000):
    nums = rnd.sample(range(3 * n), n)
    print(f'{n:>8} {median_ms(longest_consecutive, nums):>10.1f} {median_ms(longest_consecutive_sorted, nums):>11.1f}')
