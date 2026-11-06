"""Замер к занятию 18: два ключа группировки и три способа найти самые частые числа.

Запуск: python bench.py > bench_results.txt
Опыт 1 — 200 000 случайных букв разбиты на слова длины m: ваши group_anagrams
(ключ sorted) и group_anagrams_counts (ключ из частот), глава 18.2, §4.
Опыт 2 — миллион чисел из диапазона d, k = 10: ваши top_k_frequent и top_k_bucket
и Counter.most_common, глава 18.3, §4.
Каждое время — медиана трёх повторов, в миллисекундах. Около 5 секунд.
"""
import platform
import random
import statistics
import time
from collections import Counter

from solution import RU, group_anagrams, group_anagrams_counts, top_k_bucket, top_k_frequent


def median_ms(func, *args, repeat=3):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def most_common(nums, k):
    return [x for x, _ in Counter(nums).most_common(k)]


rnd = random.Random(18)
print(f'Python {platform.python_version()}, {platform.machine()}, {platform.system()}')
print()
print('Опыт 1. Группы анаграмм: 200 000 букв, мс')
print(f'{"m":>6} {"слов":>7} {"sorted":>10} {"частоты":>10}')
for m in (5, 20, 100, 1000, 10000):
    words = [''.join(rnd.choice(RU) for _ in range(m)) for _ in range(200_000 // m)]
    print(f'{m:>6} {len(words):>7} {median_ms(group_anagrams, words):>10.1f} {median_ms(group_anagrams_counts, words):>10.1f}')
print()
print('Опыт 2. Самые частые: 10⁶ чисел, k = 10, мс')
print(f'{"разных":>8} {"sorted":>10} {"вёдра":>10} {"Counter":>10}')
for d in (100, 10_000, 1_000_000):
    nums = [rnd.randrange(d) for _ in range(1_000_000)]
    print(f'{len(set(nums)):>8} {median_ms(top_k_frequent, nums, 10):>10.1f} '
          f'{median_ms(top_k_bucket, nums, 10):>10.1f} {median_ms(most_common, nums, 10):>10.1f}')
