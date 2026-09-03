"""Чужой замер, который врёт · занятие 4.

Этот скрипт запускается и печатает правдоподобную таблицу. Числа в ней
неверные: в контуре измерения пять дефектов. Код работает, ошибок не
выдаёт, вывод выглядит убедительно — тем он и опасен.

Задание: найти все пять, исправить и показать, как изменился вывод.
Правильные числа получаются запуском `lab.py` на тех же размерах.

Подсказка о масштабе расхождения: честный замер при n = 1000 даёт
разницу около 180 раз, этот скрипт — около 13. Вывод «разница невелика,
можно оставить список» сделан по испорченному измерению.

Запуск:

    python benchmarks/broken_bench.py
"""
import random
import time


def make_data(size):
    registry = [random.randrange(size * 10) for _ in range(size)]
    incoming = [random.randrange(size * 10) for _ in range(size)]
    return registry, incoming


def match_list(registry, incoming):
    known = list(registry)
    return sum(1 for x in incoming if x in known)


def match_set(registry, incoming):
    known = set(registry)
    return sum(1 for x in incoming if x in known)


def measure(func, size):
    start = time.time()
    registry, incoming = make_data(size)
    found = func(registry, incoming)
    print(f"  {func.__name__}: совпадений {found}")
    return (time.time() - start) * 1e6


def main():
    print(f"{'n':>7} {'список, мкс':>14} {'множество, мкс':>16} {'разница':>10}")
    for size in (250, 500, 1000):
        t_list = measure(match_list, size)
        t_set = measure(match_set, size)
        print(f"{size:>7} {t_list:>14.1f} {t_set:>16.1f} {t_list / t_set:>9.1f}x")
    print("\nВывод: разница есть, но небольшая. Список можно оставить.")


if __name__ == "__main__":
    main()
