"""Замер: сортировка и один проход против перебора.

Запуск после того, как в solution.py написаны merge_intervals и can_attend:
    python bench.py
Переборы записаны в этом файле, их писать не нужно.
Каждое число — медиана пяти запусков в миллисекундах. Данные готовятся
до замера, время уходит только на вызов функции.
"""
import platform
import random
import statistics
import sys
import time

from solution import can_attend, merge_intervals


def merge_brute(intervals):
    """Перебор: ищем любую пару блоков, которые пересекаются или касаются, и склеиваем её.
    Повторяем, пока такие пары есть. Без порядка каждый блок сравнивается с каждым."""
    blocks = [list(iv) for iv in intervals]
    changed = True
    while changed:
        changed = False
        for a in range(len(blocks)):
            for b in range(a + 1, len(blocks)):
                if blocks[a][0] <= blocks[b][1] and blocks[b][0] <= blocks[a][1]:
                    blocks[a] = [min(blocks[a][0], blocks[b][0]), max(blocks[a][1], blocks[b][1])]
                    del blocks[b]
                    changed = True
                    break
            if changed:
                break
    return sorted(blocks)


def attend_brute(intervals):
    """Перебор: каждая встреча сравнивается с каждой."""
    for a in range(len(intervals)):
        for b in range(a + 1, len(intervals)):
            if intervals[a][0] < intervals[b][1] and intervals[b][0] < intervals[a][1]:
                return False
    return True


def apart(n, seed):
    """n интервалов без пересечений и касаний в случайном порядке: худший случай для переборов."""
    out = [[3 * k, 3 * k + 2] for k in range(n)]
    random.Random(seed).shuffle(out)
    return out


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
    print(f"Python {platform.python_version()}, {platform.system()} {platform.machine()}")

    print("\n1. Объединение, интервалы не пересекаются, порядок случайный")
    print("n               |   перебор  | сортировка | перебор / сортировка")
    for n in (500, 1_000, 2_000):
        data = apart(n, n)
        row(f"{n}", measure(merge_brute, data), measure(merge_intervals, data))

    print("\n2. Встречи без конфликтов, конфликтов нет")
    print("n               |   перебор  | сортировка | перебор / сортировка")
    for n in (1_000, 2_000, 4_000):
        data = apart(n, n)
        row(f"{n}", measure(attend_brute, data), measure(can_attend, data))

    print("\n3. Какую часть времени merge_intervals занимает сортировка")
    print("n               | sorted     | merge      | доля sorted, %")
    for n in (20_000, 40_000, 80_000):
        rnd = random.Random(n)
        data = [[s, s + rnd.randint(1, 5)] for s in (rnd.randint(0, 10 * n) for _ in range(n))]
        part, whole = measure(sorted, data), measure(merge_intervals, data)
        print(f"{n:<16}| {part:10.2f} | {whole:10.2f} | {part / whole * 100:10.0f}")
    print("\nВремя в миллисекундах, медиана пяти запусков.")


if __name__ == "__main__":
    sys.exit(main())
