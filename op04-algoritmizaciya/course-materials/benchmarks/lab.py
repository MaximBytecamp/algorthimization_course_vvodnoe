"""Измерительный контур · занятие 4.

Занятие 3 считало операции: число сравнений не зависит ни от машины,
ни от версии Python. Здесь мы измеряем секунды, и они зависят от всего
сразу. Поэтому вокруг замера строится контур — четыре обязательных
элемента, без которых число ничего не значит:

    граница   измеряется только исследуемая операция; генерация данных,
              копирование и печать остаются снаружи;
    прогрев   первый вызов оплачивает разовые расходы интерпретатора,
              поэтому в серию он не идёт;
    серия     не меньше семи повторов, все сырые значения сохраняются;
    агрегат   минимум как оценка чистого времени, медиана как оценка
              типичного, максимум как мера помех.

Рабочая задача: пакет входящих идентификаторов сверяется с реестром
известных. Два корректных решения, разная стоимость проверки:

    match_list   проверка `x in known`, где known — список: O(n) на запрос;
    match_set    проверка `x in known`, где known — множество: O(1) в среднем.

Запуск:

    python benchmarks/lab.py
    python benchmarks/lab.py --sizes 1000 2000 4000 --repeats 15
    python benchmarks/lab.py --raw 2000        # сырые значения одной серии
    python benchmarks/lab.py --boundary 4000   # цена каждой части участка
"""
import argparse
import csv
import gc
import random
import statistics
import time
from pathlib import Path

RESULTS = Path(__file__).with_name("results_time.csv")
WARMUP_SIZE = 32


# ---------- данные ----------

def make_data(size, seed=42):
    """Реестр и пакет входящих. Одинаковые данные для всех решений."""
    rnd = random.Random(seed)
    registry = [rnd.randrange(size * 10) for _ in range(size)]
    incoming = [rnd.randrange(size * 10) for _ in range(size)]
    return registry, incoming


# ---------- два решения ----------

def match_list(registry, incoming):
    known = list(registry)
    return sum(1 for x in incoming if x in known)


def match_set(registry, incoming):
    known = set(registry)
    return sum(1 for x in incoming if x in known)


SOLUTIONS = {"list": match_list, "set": match_set}


# ---------- контур ----------

def series(func, registry, incoming, repeats):
    """Сырые значения серии в микросекундах на вызов.

    Внутри границы — только вызов решения. Данные подготовлены заранее,
    сборщик мусора запускается до отсчёта, чтобы его пауза не попала
    в измеряемый участок.
    """
    func(registry[:WARMUP_SIZE], incoming[:WARMUP_SIZE])      # прогрев
    samples = []
    for _ in range(repeats):
        gc.collect()
        start = time.perf_counter()
        func(registry, incoming)                              # ← граница
        samples.append((time.perf_counter() - start) * 1e6)
    return samples


def summarize(samples):
    """Четыре агрегата. Ни один из них не заменяет остальные."""
    return {
        "min": min(samples),
        "median": statistics.median(samples),
        "mean": statistics.mean(samples),
        "max": max(samples),
        "spread": max(samples) / min(samples),
    }


# ---------- режимы запуска ----------

def run_series(sizes, repeats):
    rows = []
    head = f"{'n':>7} {'список, мкс':>14} {'множество, мкс':>16} {'во сколько раз':>15}"
    print(head)
    print("-" * len(head))
    previous = {}
    for size in sizes:
        registry, incoming = make_data(size)
        row = {"n": size, "repeats": repeats}
        for name, func in SOLUTIONS.items():
            stats = summarize(series(func, registry, incoming, repeats))
            row[f"{name}_min_us"] = round(stats["min"], 3)
            row[f"{name}_median_us"] = round(stats["median"], 3)
            row[f"{name}_spread"] = round(stats["spread"], 3)
            row[f"{name}_growth"] = (round(stats["min"] / previous[name], 3)
                                     if name in previous else "")
            previous[name] = stats["min"]
        row["ratio"] = round(row["list_min_us"] / row["set_min_us"], 1)
        print(f"{size:>7} {row['list_min_us']:>14.1f} {row['set_min_us']:>16.1f}"
              f" {row['ratio']:>14.0f}x")
        rows.append(row)

    print("\nВО СКОЛЬКО РАЗ ВЫРОСЛО ВРЕМЯ ПРИ УДВОЕНИИ n")
    print(f"{'n':>7} {'список':>10} {'множество':>12}   ожидание: 4.00 и 2.00")
    for row in rows:
        if row["list_growth"] == "":
            continue
        print(f"{row['n']:>7} {row['list_growth']:>10.2f} {row['set_growth']:>12.2f}")

    with RESULTS.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nСырые значения серий сохранены: {RESULTS}")
    print("Вывод по эксперименту записывается в benchmarks/README.md.")
    return rows


def run_raw(size, repeats):
    """Одна серия целиком: видно разброс, из которого берётся агрегат."""
    registry, incoming = make_data(size)
    samples = series(match_list, registry, incoming, repeats)
    stats = summarize(samples)
    print(f"n = {size}, повторов {repeats}, решение match_list\n")
    for number, value in enumerate(samples, 1):
        bar = "#" * int(40 * value / stats["max"])
        print(f"{number:>3} {value:>12.1f} мкс  {bar}")
    print(f"\nминимум  {stats['min']:>12.1f}   чистое время без помех")
    print(f"медиана  {stats['median']:>12.1f}   типичный запуск")
    print(f"среднее  {stats['mean']:>12.1f}   смещено выбросом вверх")
    print(f"максимум {stats['max']:>12.1f}   помеха, а не свойство решения")
    print(f"разброс  {stats['spread']:>12.2f}x  max / min")
    return stats


def run_boundary(size):
    """Цена каждой части участка: видно, что попадает внутрь границы."""
    registry, incoming = make_data(size)
    known_set = set(registry)

    def best(action, repeats=7):
        values = []
        for _ in range(repeats):
            gc.collect()
            start = time.perf_counter()
            action()
            values.append((time.perf_counter() - start) * 1e6)
        return min(values)

    parts = [
        ("генерация данных", lambda: make_data(size)),
        ("копия списка", lambda: list(registry)),
        ("построение множества", lambda: set(registry)),
        ("сверка по списку", lambda: sum(1 for x in incoming if x in registry)),
        ("сверка по множеству", lambda: sum(1 for x in incoming if x in known_set)),
    ]
    print(f"n = {size}, минимум из 7 повторов, микросекунды\n")
    measured = {}
    for label, action in parts:
        value = best(action)
        measured[label] = value
        print(f"{label:<24}{value:>12.1f}")
    print("\nЕсли генерация данных попала внутрь границы, к обоим решениям"
          f"\nприбавится {measured['генерация данных']:.0f} мкс — для сверки по множеству"
          " это в разы больше самой работы.")
    return measured


def main():
    parser = argparse.ArgumentParser(description="Измерительный контур занятия 4")
    parser.add_argument("--sizes", nargs="+", type=int,
                        default=[250, 500, 1000, 2000, 4000, 8000])
    parser.add_argument("--repeats", type=int, default=7)
    parser.add_argument("--raw", type=int, metavar="N",
                        help="показать сырые значения одной серии при n = N")
    parser.add_argument("--boundary", type=int, metavar="N",
                        help="показать цену каждой части участка при n = N")
    args = parser.parse_args()

    print(f"Python {'.'.join(map(str, __import__('sys').version_info[:3]))}, "
          f"часы perf_counter, разрешение "
          f"{time.get_clock_info('perf_counter').resolution:.0e} с\n")

    if args.raw:
        run_raw(args.raw, max(args.repeats, 15))
    elif args.boundary:
        run_boundary(args.boundary)
    else:
        run_series(args.sizes, args.repeats)


if __name__ == "__main__":
    main()
