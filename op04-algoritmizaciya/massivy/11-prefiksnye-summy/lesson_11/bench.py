"""Замер префиксных сумм против перебора.

Запуск после того, как в solution.py написаны range_sums, pivot_index и count_k_sums:
    python bench.py
Переборы записаны в этом файле, их писать не нужно.
Каждое число — медиана пяти запусков в миллисекундах. Данные готовятся
до замера, время уходит только на вызов функции.
"""
import platform
import statistics
import sys
import time

from solution import count_k_sums, pivot_index, range_sums


def range_sums_brute(nums, queries):
    """Перебор: на каждый запрос числа участка складываются заново."""
    answers = []
    for l, r in queries:
        if not 0 <= l <= r <= len(nums):
            raise ValueError("нужно 0 <= l <= r <= len(nums)")
        total = 0
        for i in range(l, r):
            total += nums[i]
        answers.append(total)
    return answers


def pivot_index_brute(nums):
    """Перебор: для каждого индекса обе суммы считаются заново."""
    for i in range(len(nums)):
        if sum(nums[:i]) == sum(nums[i + 1:]):
            return i
    return -1


def count_k_sums_brute(nums, k):
    """Перебор: для каждого начала отрезок удлиняется до конца списка."""
    count = 0
    for l in range(len(nums)):
        total = 0
        for r in range(l, len(nums)):
            total += nums[r]
            if total == k:
                count += 1
    return count


def measure(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000    # миллисекунды


def row(label, brute, fast):
    print(f"{label:<16}| {brute:10.2f} | {fast:10.2f} | {brute / fast:10.1f}")


def main():
    data = [(i * 7919) % 201 - 100 for i in range(8_000)]    # числа от −100 до 100
    print(f"Python {platform.python_version()}, {platform.system()} {platform.machine()}")

    print("\n1. Сервис сумм: n чисел и n запросов, каждый запрос — весь список")
    print("n = q           |   перебор  |  префиксы  | перебор / префиксы")
    for n in (1_000, 2_000, 4_000):
        nums = data[:n]
        queries = [(0, n)] * n
        row(f"{n}", measure(range_sums_brute, nums, queries), measure(range_sums, nums, queries))

    print("\n2. Равновесный индекс, индекса нет")
    print("n               |   перебор  |   проход   | перебор / проход")
    for n in (1_000, 2_000, 4_000):
        nums = [1] * n          # суммы слева и справа не совпадают ни на одном индексе
        row(f"{n}", measure(pivot_index_brute, nums), measure(pivot_index, nums))

    print("\n3. Отрезки с суммой k = 0")
    print("n               |   перебор  |  словарь   | перебор / словарь")
    for n in (1_000, 2_000, 4_000):
        nums = data[:n]
        row(f"{n}", measure(count_k_sums_brute, nums, 0), measure(count_k_sums, nums, 0))
    print("\nВремя в миллисекундах, медиана пяти запусков.")


if __name__ == "__main__":
    sys.exit(main())
