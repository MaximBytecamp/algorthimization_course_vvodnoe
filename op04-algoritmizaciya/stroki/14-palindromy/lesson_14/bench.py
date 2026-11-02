"""Замер к занятию 14: указатели без копии против копии и разворота.

Запуск: python bench.py > bench_results.txt
Опыт 1 — время: ваша is_palindrome (указатели) и is_palindrome_copy (копия).
Опыт 2 — пиковая дополнительная память тех же функций (tracemalloc).
Опыт 3 — одно удаление: ваша can_be_palindrome и перебор, который пробует
удалить каждый символ. Различие стоит в середине строки, и одного удаления
не хватает: худший случай для обоих способов.
Строки опытов 1–2 — палиндромы из русских букв с пробелами и знаками.
Каждое время — медиана пяти повторов, в миллисекундах. Около 15 секунд.
"""
import platform
import random
import statistics
import sys
import time
import tracemalloc

from solution import can_be_palindrome, is_palindrome, is_palindrome_copy

RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'


def one_removal_brute(s):
    if s == s[::-1]:
        return True
    for k in range(len(s)):
        t = s[:k] + s[k + 1:]
        if t == t[::-1]:
            return True
    return False


def make_phrase(rnd, n):
    half = []
    while len(half) < n // 2:
        half.append(rnd.choice(RU))
        if rnd.random() < 0.2:
            half.append(rnd.choice(' ,.!'))
    s = ''.join(half)
    return (s + s[::-1]).capitalize()


def median_ms(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def peak_kb(func, *args):
    tracemalloc.start()
    func(*args)
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return peak / 1024


def main():
    rnd = random.Random(14)
    print(f'Python {sys.version.split()[0]}, {platform.machine()}')
    print()
    phrases = {n: make_phrase(rnd, n) for n in (100_000, 200_000, 400_000, 800_000)}
    print('Опыт 1. Палиндром длины n, мс')
    print(f"{'n':>8} {'указатели':>10} {'копия':>9}")
    for n, s in phrases.items():
        assert is_palindrome(s) and is_palindrome_copy(s)
        print(f'{n:>8} {median_ms(is_palindrome, s):10.1f} {median_ms(is_palindrome_copy, s):9.1f}')
    print()
    print('Опыт 2. Пиковая дополнительная память, КБ')
    print(f"{'n':>8} {'указатели':>10} {'копия':>9}")
    for n, s in phrases.items():
        print(f'{n:>8} {peak_kb(is_palindrome, s):10.1f} {peak_kb(is_palindrome_copy, s):9.0f}')
    print()
    print('Опыт 3. Одно удаление, одного удаления не хватает, мс')
    print(f"{'n':>8} {'указатели':>10} {'перебор':>9}")
    for n in (1_000, 2_000, 4_000, 8_000):
        half = ''.join(rnd.choice('аб') for _ in range(n // 2))
        s = half + 'вгд' + half[::-1]
        assert not can_be_palindrome(s) and not one_removal_brute(s)
        print(f'{len(s):>8} {median_ms(can_be_palindrome, s):10.3f} {median_ms(one_removal_brute, s):9.1f}')


if __name__ == '__main__':
    main()
