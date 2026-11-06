"""Публичные тесты занятия 18. Запуск: python -m pytest tests.py -v"""

import random
from collections import Counter

import pytest

from solution import frequency_sort, group_anagrams, group_anagrams_counts, top_k_bucket, top_k_frequent

RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'


def groups_brute(words):
    """Перебор: слово идёт в первую группу, с первым словом которой у него равны отсортированные буквы."""
    groups = []
    for w in words:
        for g in groups:
            if sorted(g[0]) == sorted(w):
                g.append(w)
                break
        else:
            groups.append([w])
    return groups


# ---------- Задача 1. Группы анаграмм: оба ключа ----------

GROUP_CASES = [
    (['кот', 'листок', 'ток', 'слиток', 'окт'], [['кот', 'ток', 'окт'], ['листок', 'слиток']]),
    (['бра', 'кот', 'араб', 'ток', 'раба', 'абр'], [['бра', 'абр'], ['кот', 'ток'], ['араб', 'раба']]),
    (['слон', 'кот', 'нолс', 'ток'], [['слон', 'нолс'], ['кот', 'ток']]),
    (['кот', 'кот', 'ток'], [['кот', 'кот', 'ток']]),
    (['', 'а', ''], [['', ''], ['а']]),
    (['ёж', 'жё', 'еж'], [['ёж', 'жё'], ['еж']]),
    (['аб', 'абб', 'ба'], [['аб', 'ба'], ['абб']]),
    ([], []),
    (['я'], [['я']]),
]


@pytest.mark.parametrize('func', [group_anagrams, group_anagrams_counts])
@pytest.mark.parametrize('words, want', GROUP_CASES)
def test_group_edges(func, words, want):
    assert func(words) == want


@pytest.mark.parametrize('func', [group_anagrams, group_anagrams_counts])
def test_group_matches_brute(func):
    rnd = random.Random(49)
    for _ in range(300):
        words = [''.join(rnd.choice('абвё') for _ in range(rnd.randint(0, 4))) for _ in range(rnd.randint(0, 10))]
        assert func(words) == groups_brute(words), words


def test_group_counts_long_words():
    """200 слов по 1000 букв: ключ из частот"""
    rnd = random.Random(1000)
    base = [rnd.choice(RU) for _ in range(1000)]
    words = []
    for _ in range(200):
        rnd.shuffle(base)
        words.append(''.join(base))
    assert len(group_anagrams_counts(words)) == 1


# ---------- Задача 2. Самые частые числа: сортировка и вёдра ----------

TOP_CASES = [
    ([3, 1, 1, 2, 2, 3, 4, 1], 2, [1, 3]),
    ([5, 5, 2, 2, 7], 1, [5]),
    ([9, 8, 7], 3, [9, 8, 7]),
    ([4, 4, 1], 5, [4, 1]),
    ([], 2, []),
    ([7, 7, 7, 0], 1, [7]),
    ([2, 2], 1, [2]),
    ([-1, -1, 0], 2, [-1, 0]),
]


@pytest.mark.parametrize('func', [top_k_frequent, top_k_bucket])
@pytest.mark.parametrize('nums, k, want', TOP_CASES)
def test_top_edges(func, nums, k, want):
    assert func(nums, k) == want


@pytest.mark.parametrize('func', [top_k_frequent, top_k_bucket])
def test_top_matches_counter(func):
    rnd = random.Random(347)
    for _ in range(500):
        a = [rnd.randint(-3, 6) for _ in range(rnd.randint(0, 12))]
        k = rnd.randint(1, 5)
        assert func(a, k) == [x for x, _ in Counter(a).most_common(k)], (a, k)


@pytest.mark.parametrize('func', [top_k_frequent, top_k_bucket])
def test_top_long(func):
    """10⁵ чисел — решение без перебора пар"""
    nums = [i % 1000 for i in range(100_000)] + [5]
    assert func(nums, 1) == [5]


# ---------- Задача 3. Символы по частоте ----------

@pytest.mark.parametrize('s, want', [
    ('tree', 'eetr'),
    ('кабак', 'ккааб'),
    ('', ''),
    ('Aab', 'Aab'),
    ('aaAA', 'aaAA'),
    ('абв', 'абв'),
    ('ббба', 'ббба'),
    ('abab', 'aabb'),
])
def test_frequency_sort(s, want):
    assert frequency_sort(s) == want
