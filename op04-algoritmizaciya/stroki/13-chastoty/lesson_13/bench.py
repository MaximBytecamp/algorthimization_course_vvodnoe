"""Замер к занятию 13: сортировка против частотного словаря.

Запуск: python bench.py > bench_results.txt
Опыт 1 — анаграммы тремя способами: ваша is_anagram (словарь в цикле),
сортировка символов и Counter. Строки — анаграммы, поэтому все способы
проходят их до конца.
Опыт 2 — первая уникальная буква: ваша first_unique и вариант с text.count
в цикле. Уникальной буквы нет — худший случай для обоих.
Каждое число — медиана пяти повторов, в миллисекундах. Около 10 секунд.
"""
import platform
import random
import statistics
import sys
import time
from collections import Counter

from solution import first_unique, is_anagram, letters

RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'


def anagram_sorted(a, b):
    return sorted(letters(a)) == sorted(letters(b))


def anagram_counter(a, b):
    return Counter(letters(a)) == Counter(letters(b))


def unique_count(text):
    low = text.casefold()
    for i, ch in enumerate(text):
        if ch.isalpha() and low.count(ch.casefold()) == 1:
            return i
    return -1


def median_ms(func, *args, repeat=5):
    times = []
    for _ in range(repeat):
        start = time.perf_counter()
        func(*args)
        times.append(time.perf_counter() - start)
    return statistics.median(times) * 1000


def main():
    rnd = random.Random(13)
    print(f'Python {sys.version.split()[0]}, {platform.machine()}')
    print()
    print('Опыт 1. Анаграммы длины n, мс')
    print(f"{'n':>8} {'словарь':>9} {'sorted':>9} {'Counter':>9}")
    for n in (50_000, 100_000, 200_000, 400_000):
        a = ''.join(rnd.choice(RU) for _ in range(n))
        b = list(a)
        rnd.shuffle(b)
        b = ''.join(b)
        assert is_anagram(a, b) and anagram_sorted(a, b) and anagram_counter(a, b)
        row = [median_ms(f, a, b) for f in (is_anagram, anagram_sorted, anagram_counter)]
        print(f'{n:>8} ' + ' '.join(f'{v:9.1f}' for v in row))
    print()
    print('Опыт 2. Первая уникальная буква, уникальной нет, мс')
    print(f"{'n':>8} {'словарь':>9} {'count':>9}")
    for n in (2_000, 4_000, 8_000, 16_000):
        half = [rnd.choice(RU) for _ in range(n // 2)]
        text = ''.join(half + half[::-1])
        assert first_unique(text) == unique_count(text) == -1
        row = [median_ms(first_unique, text), median_ms(unique_count, text)]
        print(f'{n:>8} ' + ' '.join(f'{v:9.2f}' for v in row))


if __name__ == '__main__':
    main()
