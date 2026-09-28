"""Замер четырёх способов найти пару с заданной суммой.

Запуск: python bench.py
Худший случай: пары нет, поэтому каждый способ просматривает вход до конца.
Цены — чётные числа по возрастанию, сумма — нечётная.
Каждое число — медиана пяти запусков в миллисекундах.
"""

import platform
import random
import statistics
import time

from solution import pair_sum, pair_sum_brute


def pair_sum_set(prices, target):
    """Словарь уже просмотренных цен. Работает и на неотсортированном входе."""
    seen = {}                               # цена → индекс первого вхождения
    for j, p in enumerate(prices):
        if target - p in seen:              # нужная пара уже встречалась
            return (seen[target - p], j)
        seen.setdefault(p, j)
    return None


def pair_sum_sorted_copy(prices, target):
    """Для неотсортированного входа: сортировка копии, затем указатели.

    Возвращает пару значений, потому что индексы после сортировки другие.
    """
    ordered = sorted(prices)                # новый список, O(n log n)
    answer = pair_sum(ordered, target)
    if answer is None:
        return None
    i, j = answer
    return (ordered[i], ordered[j])


def measure(func, prices, target, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(prices, target)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000    # миллисекунды


def main():
    print(f"Python {platform.python_version()}, {platform.system()} {platform.machine()}")
    print("n        | перебор   | указатели | словарь   | сортировка + указатели")
    print("-" * 72)
    rnd = random.Random(8)
    for n in [1_000, 2_000, 4_000, 8_000, 16_000, 100_000, 1_000_000]:
        prices = list(range(0, 2 * n, 2))
        shuffled = prices[:]
        rnd.shuffle(shuffled)
        target = 1
        brute = measure(pair_sum_brute, prices, target) if n <= 16_000 else None
        two = measure(pair_sum, prices, target)
        table = measure(pair_sum_set, shuffled, target)
        sort_two = measure(pair_sum_sorted_copy, shuffled, target)
        cell = lambda v: "не мерили" if v is None else f"{v:9.2f}"
        print(f"{n:<8} | {cell(brute):>9} | {two:9.3f} | {table:9.3f} | {sort_two:9.3f}")
    print("Время в миллисекундах. Перебор на n > 16 000 не запускается: он идёт минуты.")


if __name__ == "__main__":
    main()
