"""Счётчик операций · занятие 3.

Скрипт не измеряет время. Он считает, сколько раз выполнится сравнение —
та операция, ради которой алгоритм и написан. Секунды зависят от машины,
фоновой нагрузки и версии Python; число сравнений не зависит ни от чего,
кроме размера входа. Именно про него говорит O-нотация.

Каждое решение получает худший для себя вход: искомого элемента нет,
одинаковых номеров нет. Так видно верхнюю границу, а не удачный случай.

    python course-materials/complexity/opcount.py
    python course-materials/complexity/opcount.py --sizes 8 16 32 64

Замеры настоящего времени — на следующем занятии, в benchmarks/.
"""
import argparse


class Counter:
    """Считает сравнения. Каждое обращение к сравнению проходит через него."""

    def __init__(self):
        self.value = 0

    def equal(self, left, right):
        self.value += 1
        return left == right

    def less(self, left, right):
        self.value += 1
        return left < right


def linear_search(data, target, ops):
    """Поиск перебором: сравниваем с каждым элементом подряд."""
    for item in data:
        if ops.equal(item, target):
            return True
    return False


def pairwise_duplicates(data, ops):
    """Двойной цикл: каждый элемент сравнивается с каждым следующим."""
    for i in range(len(data)):
        for j in range(i + 1, len(data)):
            if ops.equal(data[i], data[j]):
                return True
    return False


def set_duplicates(data, ops):
    """Один проход: каждый элемент проверяется по множеству просмотренных."""
    seen = set()
    for item in data:
        ops.value += 1          # проверка принадлежности множеству
        if item in seen:
            return True
        seen.add(item)
    return False


def binary_search(sorted_data, target, ops):
    """Половинное деление: на каждом шаге отбрасывается половина отрезка."""
    low, high = 0, len(sorted_data) - 1
    while low <= high:
        middle = (low + high) // 2
        if ops.equal(sorted_data[middle], target):
            return True
        if ops.less(sorted_data[middle], target):
            low = middle + 1
        else:
            high = middle - 1
    return False


def merge_sort(data, ops):
    """Сортировка слиянием: log n уровней, на каждом просматривается n элементов."""
    if len(data) <= 1:
        return data
    middle = len(data) // 2
    left = merge_sort(data[:middle], ops)
    right = merge_sort(data[middle:], ops)

    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if ops.less(left[i], right[j]):
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def take_first(data, ops):
    """Обращение по индексу: одна операция, сколько бы ни было элементов."""
    ops.value += 1
    return data[0]


COLUMNS = [
    ("O(1)", "первый элемент", take_first),
    ("O(log n)", "бинарный поиск", lambda data, ops: binary_search(data, -1, ops)),
    ("O(n)", "поиск перебором", lambda data, ops: linear_search(data, -1, ops)),
    ("O(n log n)", "сортировка слиянием", lambda data, ops: merge_sort(data, ops)),
    ("O(n²)", "все пары", lambda data, ops: pairwise_duplicates(data, ops)),
]


def run(sizes):
    table = []
    for size in sizes:
        data = list(range(size))          # худший вход: искомого числа в нём нет
        row = []
        for _, _, call in COLUMNS:
            ops = Counter()
            call(data, ops)
            row.append(ops.value)
        table.append((size, row))
    return table


def main():
    parser = argparse.ArgumentParser(description="Счётчик сравнений")
    parser.add_argument("--sizes", nargs="+", type=int, default=[8, 16, 32, 64, 128])
    args = parser.parse_args()
    sizes = sorted(args.sizes)
    table = run(sizes)

    head = f"{'n':>6}" + "".join(f"{name:>13}" for name, _, _ in COLUMNS)
    print("СКОЛЬКО СРАВНЕНИЙ ВЫПОЛНИТСЯ")
    print(head)
    print("-" * len(head))
    for size, row in table:
        print(f"{size:>6}" + "".join(f"{value:>13}" for value in row))

    print("\nВО СКОЛЬКО РАЗ БОЛЬШЕ, КОГДА n УДВАИВАЕТСЯ")
    print(head)
    print("-" * len(head))
    for (prev_size, prev), (size, row) in zip(table, table[1:]):
        if size != prev_size * 2:
            continue
        cells = []
        for before, after in zip(prev, row):
            cells.append("—" if before == 0 else f"{after / before:.2f}x")
        print(f"{size:>6}" + "".join(f"{cell:>13}" for cell in cells))

    print("\nЧто здесь видно:")
    for name, note, _ in COLUMNS:
        print(f"  {name:<11} {note}")


if __name__ == "__main__":
    main()
