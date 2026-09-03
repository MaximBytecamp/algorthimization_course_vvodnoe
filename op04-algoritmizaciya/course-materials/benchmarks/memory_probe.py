"""Замер памяти · занятие 4.

Время и память измеряются разными приборами и в разные заходы:
`tracemalloc` сам по себе замедляет программу в несколько раз, поэтому
секунды при включённой трассировке не имеют смысла.

Что именно считает tracemalloc: блоки, которые запросил аллокатор Python
внутри трассируемого участка. Он не считает память интерпретатора,
расширений на C и того, что операционная система выдала процессу
про запас. Число из `tracemalloc` меньше, чем RSS в диспетчере задач,
и это нормально: это разные величины.

Различаем четыре величины:

    вход           то, что решение получило в аргументах; в S(n) не входит;
    дополнительная то, что решение создало само;
    текущая        сколько занято на момент замера;
    пиковая        максимум за время участка — по нему считают лимит.

Запуск:

    python benchmarks/memory_probe.py
    python benchmarks/memory_probe.py --sizes 1000 4000 16000
"""
import argparse
import csv
import tracemalloc
from pathlib import Path

from lab import make_data, match_list, match_set

RESULTS = Path(__file__).with_name("results_memory.csv")


def peak_of(func, registry, incoming):
    """Пиковая дополнительная память вызова, в байтах.

    Данные созданы до старта трассировки, поэтому вход в число не попадает:
    считается только то, что создала сама функция.
    """
    tracemalloc.start()
    tracemalloc.reset_peak()
    func(registry, incoming)
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return current, peak


def main():
    parser = argparse.ArgumentParser(description="Пиковая память двух решений")
    parser.add_argument("--sizes", nargs="+", type=int,
                        default=[500, 1000, 2000, 4000, 8000])
    args = parser.parse_args()

    head = f"{'n':>7} {'список, байт':>15} {'на элемент':>12} {'множество, байт':>17} {'на элемент':>12}"
    print(head)
    print("-" * len(head))
    rows = []
    for size in args.sizes:
        registry, incoming = make_data(size)
        _, list_peak = peak_of(match_list, registry, incoming)
        _, set_peak = peak_of(match_set, registry, incoming)
        print(f"{size:>7} {list_peak:>15} {list_peak / size:>12.1f}"
              f" {set_peak:>17} {set_peak / size:>12.1f}")
        rows.append({"n": size,
                     "list_peak_bytes": list_peak,
                     "list_bytes_per_item": round(list_peak / size, 2),
                     "set_peak_bytes": set_peak,
                     "set_bytes_per_item": round(set_peak / size, 2),
                     "ratio": round(set_peak / list_peak, 2)})

    with RESULTS.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nСохранено: {RESULTS}")
    print("Копия списка растёт ровно: 8 байт на указатель плюс заголовок.")
    print("Множество растёт ступенями: при заполнении таблица перестраивается")
    print("на вчетверо больший размер, и до следующей ступени пик не меняется.")


if __name__ == "__main__":
    main()
