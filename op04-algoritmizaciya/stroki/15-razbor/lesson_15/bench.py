"""Замер к занятию 15: сжатие по индексам против сжатия со срезом остатка.

Запуск: python bench.py > bench_results.txt
Сравниваются ваша compress и compress_slice ниже. compress_slice на каждой
серии отрезает её от строки: s = s.lstrip(ch) создаёт новую строку и копирует
в неё весь остаток. Сколько это стоит, зависит от числа серий r.
Опыт 1 — короткие серии: в строке из букв a и b серий около n / 2.
Опыт 2 — длинные серии: серии по 1000 символов, серий n / 1000.
Каждое время — медиана пяти повторов, в миллисекундах. Около 30 секунд.
"""
import platform
import random
import statistics
import sys
import time

from solution import compress


def compress_slice(s):
    """Верное сжатие, которое на каждой серии копирует остаток строки: O(n · r)."""
    out = []
    while s:
        ch = s[0]
        rest = s.lstrip(ch)
        k = len(s) - len(rest)
        out.append(ch + (str(k) if k > 1 else ''))
        s = rest
    return ''.join(out)


def median_ms(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def runs(s):
    return sum(1 for k in range(len(s)) if k == 0 or s[k] != s[k - 1])


def table(title, strings):
    print(title)
    print(f"{'n':>9} {'серий':>8} {'индексы':>9} {'срез':>9}")
    for s in strings:
        assert compress(s) == compress_slice(s)
        print(f'{len(s):>9} {runs(s):>8} {median_ms(compress, s):9.1f} {median_ms(compress_slice, s):9.1f}')
    print()


def main():
    rnd = random.Random(15)
    print(f'Python {sys.version.split()[0]}, {platform.machine()}')
    print()
    sizes = (125_000, 250_000, 500_000, 1_000_000)
    table('Опыт 1. Короткие серии, мс', [''.join(rnd.choice('ab') for _ in range(n)) for n in sizes])
    table('Опыт 2. Серии по 1000 символов, мс', [''.join('ab'[k % 2] * 1000 for k in range(n // 1000)) for n in sizes])


if __name__ == '__main__':
    main()
