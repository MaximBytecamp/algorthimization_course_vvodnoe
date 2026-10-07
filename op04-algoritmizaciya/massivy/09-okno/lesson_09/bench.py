"""Замер двух способов посчитать сумму каждого окна длины k.

Запуск после того, как в solution.py написаны window_sums и window_sums_slices:
    python bench.py
Каждое число — медиана пяти запусков в миллисекундах. Данные готовятся
до замера, время уходит только на вызов функции.
"""
import platform
import random
import statistics
import sys
import time

from solution import window_sums, window_sums_slices


def measure(func, nums, k, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(nums, k)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000    # миллисекунды


def row(n, k, nums):
    slices = measure(window_sums_slices, nums, k)
    rolling = measure(window_sums, nums, k)
    print(f"{n:<9}| {k:<7}| {slices:10.3f} | {rolling:10.3f} | {slices / rolling:6.1f}")


def main():
    rnd = random.Random(9)
    data = [rnd.randint(-1000, 1000) for _ in range(400_000)]
    print(f"Python {platform.python_version()}, {platform.system()} {platform.machine()}")
    head = "n        | k      |    срезы   |   сдвиг    | срезы / сдвиг"
    print("\n1. k = 100, n растёт\n" + head)
    for n in (25_000, 50_000, 100_000, 200_000, 400_000):
        row(n, 100, data[:n])
    print("\n2. n = 100 000, k растёт\n" + head)
    for k in (1, 10, 100, 1_000, 10_000):
        row(100_000, k, data[:100_000])
    print("\n3. k = n / 2, n растёт\n" + head)
    for n in (2_000, 4_000, 8_000, 16_000, 32_000):
        row(n, n // 2, data[:n])
    print("\nВремя в миллисекундах, медиана пяти запусков.")


if __name__ == "__main__":
    sys.exit(main())
