"""Замер времени по правилам дисциплины.

Что здесь важно и что переносится в ваши собственные замеры:

- генерация данных вынесена из измеряемого участка;
- каждый размер прогоняется несколько раз (по умолчанию пять);
- перед серией делается прогон вхолостую — прогрев;
- в результат идёт медиана серии, а не единичный запуск;
- сравниваемые решения получают одинаковые входные данные.

Пример показывает, чем отличается проверка «есть ли число» в списке
и в множестве. Запуск:

    python benchmarks/bench.py
    python benchmarks/bench.py --sizes 1000 5000 20000 --repeats 7
"""
import argparse
import csv
import random
import statistics
import time
from pathlib import Path

RESULTS = Path(__file__).with_name("results.csv")


def make_data(size, seed=42):
    """Готовит одинаковые данные для всех решений."""
    rnd = random.Random(seed)
    haystack = [rnd.randrange(size * 10) for _ in range(size)]
    needles = [rnd.randrange(size * 10) for _ in range(size)]
    return haystack, needles


def count_in_list(haystack, needles):
    seen = list(haystack)
    return sum(1 for x in needles if x in seen)


def count_in_set(haystack, needles):
    seen = set(haystack)
    return sum(1 for x in needles if x in seen)


def measure(func, haystack, needles, repeats):
    """Возвращает медиану времени серии в секундах."""
    func(haystack[:50], needles[:50])          # прогрев
    samples = []
    for _ in range(repeats):
        start = time.perf_counter()
        func(haystack, needles)
        samples.append(time.perf_counter() - start)
    return statistics.median(samples)


def main():
    parser = argparse.ArgumentParser(description="Замер времени двух решений")
    parser.add_argument("--sizes", nargs="+", type=int,
                        default=[1000, 2000, 4000, 8000])
    parser.add_argument("--repeats", type=int, default=5)
    args = parser.parse_args()

    rows = []
    print(f"{'n':>8} {'список, с':>14} {'множество, с':>16} {'разница':>10}")
    for size in args.sizes:
        haystack, needles = make_data(size)
        t_list = measure(count_in_list, haystack, needles, args.repeats)
        t_set = measure(count_in_set, haystack, needles, args.repeats)
        ratio = t_list / t_set if t_set else float("inf")
        print(f"{size:>8} {t_list:>14.4f} {t_set:>16.4f} {ratio:>9.0f}x")
        rows.append({"n": size, "repeats": args.repeats,
                     "list_median_s": round(t_list, 6),
                     "set_median_s": round(t_set, 6),
                     "ratio": round(ratio, 1)})

    with RESULTS.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nСохранено: {RESULTS}")
    print("Вывод по результатам запишите в benchmarks/README.md.")


if __name__ == "__main__":
    main()
