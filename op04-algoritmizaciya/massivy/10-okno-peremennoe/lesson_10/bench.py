"""Замер окна переменного размера против перебора отрезков.

Запуск после того, как в solution.py написаны shortest_window и longest_unique:
    python bench.py
Переборы и вариант с позициями символов записаны в этом файле, их писать не нужно.
Каждое число — медиана пяти запусков в миллисекундах. Данные готовятся
до замера, время уходит только на вызов функции.
"""
import platform
import random
import statistics
import sys
import time

from solution import longest_unique, shortest_window


def shortest_window_brute(nums, s):
    """Перебор: для каждого начала отрезок удлиняется, пока сумма меньше s."""
    if s < 1:
        raise ValueError("s должно быть не меньше 1")
    best = 0
    for l in range(len(nums)):
        total = 0
        for r in range(l, len(nums)):
            total += nums[r]
            if total >= s:
                if best == 0 or r - l + 1 < best:
                    best = r - l + 1
                break
    return best


def longest_unique_brute(text):
    """Перебор: для каждого начала подстрока удлиняется до первого повтора."""
    best = 0
    for l in range(len(text)):
        seen = set()
        for r in range(l, len(text)):
            if text[r] in seen:
                break
            seen.add(text[r])
            best = max(best, r - l + 1)
    return best


def longest_unique_jump(text):
    """Вариант с позициями символов: левая граница переносится сразу за прошлое вхождение."""
    last = {}
    best = 0
    l = 0
    for r in range(len(text)):
        ch = text[r]
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best


def measure(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000    # миллисекунды


def row(label, brute, window):
    print(f"{label:<16}| {brute:10.3f} | {window:10.3f} | {brute / window:8.1f}")


def main():
    rnd = random.Random(10)
    data = [rnd.randint(1, 9) for _ in range(20_000)]
    print(f"Python {platform.python_version()}, {platform.system()} {platform.machine()}")

    print("\n1. Минимальный отрезок, отрезка нет, n растёт")
    print("n               |   перебор  |    окно    | перебор / окно")
    for n in (500, 1_000, 2_000, 4_000, 8_000):
        nums = data[:n]
        s = sum(nums) + 1
        row(f"{n}", measure(shortest_window_brute, nums, s), measure(shortest_window, nums, s))

    print("\n2. Минимальный отрезок, n = 20 000, порог s растёт")
    print("s (ответ)       |   перебор  |    окно    | перебор / окно")
    for s in (10, 100, 1_000, 10_000):
        answer = shortest_window(data, s)
        row(f"{s} ({answer})", measure(shortest_window_brute, data, s), measure(shortest_window, data, s))

    print("\n3. Подстрока без повторов, n = 20 000, в строке m разных символов по кругу")
    print("m               |   перебор  |    окно    | перебор / окно | позиции")
    for m in (1, 10, 100, 1_000):
        text = "".join(chr(0x100 + i % m) for i in range(20_000))
        brute = measure(longest_unique_brute, text)
        window = measure(longest_unique, text)
        jump = measure(longest_unique_jump, text)
        print(f"{m:<16}| {brute:10.3f} | {window:10.3f} | {brute / window:14.1f} | {jump:8.3f}")
    print("\nВремя в миллисекундах, медиана пяти запусков.")


if __name__ == "__main__":
    sys.exit(main())
