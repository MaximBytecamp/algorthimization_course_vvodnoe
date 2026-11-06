"""Публичные тесты занятия 19. Запуск: python -m pytest tests.py -v"""

import random
import time

import pytest

from solution import (common_users, find_duplicates, is_happy, left_users,
                      longest_consecutive, longest_consecutive_sorted)


def common_brute(a, b, keep):
    out = []
    for u in a:
        if (u in b) == keep and u not in out:
            out.append(u)
    return out


def consecutive_brute(nums):
    best = 0
    for x in nums:
        length = 0
        while x + length in nums:
            length += 1
        best = max(best, length)
    return best


# ---------- Задача 1. Общие пользователи и разность ----------

COMMON_CASES = [
    ([5, 3, 8, 3, 1, 8], [1, 8, 9], [8, 1], [5, 3]),
    ([30, 1, 9, 16], [16, 1, 9], [1, 9, 16], [30]),
    ([8, 8, 8], [8, 8], [8], []),
    ([], [1], [], []),
    ([1, 2], [], [], [1, 2]),
    (['u7', 'u2', 'u5'], ['u5', 'u7'], ['u7', 'u5'], ['u2']),
]


@pytest.mark.parametrize('a, b, common, left', COMMON_CASES)
def test_common_edges(a, b, common, left):
    assert common_users(a, b) == common


@pytest.mark.parametrize('a, b, common, left', COMMON_CASES)
def test_left_edges(a, b, common, left):
    assert left_users(a, b) == left


def test_common_matches_brute():
    rnd = random.Random(349)
    for _ in range(500):
        a = [rnd.randint(0, 9) for _ in range(rnd.randint(0, 10))]
        b = [rnd.randint(0, 9) for _ in range(rnd.randint(0, 10))]
        assert common_users(a, b) == common_brute(a, b, True), (a, b)
        assert left_users(a, b) == common_brute(a, b, False), (a, b)


def test_common_long():
    """списки по 10⁵ — проверка в списке не пройдёт"""
    a = list(range(0, 200_000, 2))
    b = list(range(0, 300_000, 3))
    assert len(common_users(a, b)) == 33_334


# ---------- Задача 2. Самая длинная последовательность ----------

CONSEC_CASES = [
    ([100, 4, 200, 1, 3, 2], 4),
    ([0, 3, 7, 2, 5, 8, 4, 6, 0, 1], 9),
    ([1, 2, 2, 3], 3),
    ([-1, -2, 0, 5], 3),
    ([], 0),
    ([7], 1),
    ([5, 5, 5], 1),
    ([10, 30, 20], 1),
]


@pytest.mark.parametrize('func', [longest_consecutive, longest_consecutive_sorted])
@pytest.mark.parametrize('nums, want', CONSEC_CASES)
def test_consecutive_edges(func, nums, want):
    assert func(nums) == want


@pytest.mark.parametrize('func', [longest_consecutive, longest_consecutive_sorted])
def test_consecutive_matches_brute(func):
    rnd = random.Random(128)
    for _ in range(500):
        a = [rnd.randint(-5, 8) for _ in range(rnd.randint(0, 10))]
        assert func(a) == consecutive_brute(a), a


def test_consecutive_long_run():
    """одна серия из 10⁵ чисел — проход только от начала серии"""
    nums = list(range(100_000))
    random.Random(1).shuffle(nums)
    start = time.perf_counter()
    assert longest_consecutive(nums) == 100_000
    assert time.perf_counter() - start < 1.0


def test_consecutive_many_repeats():
    """много повторов начала серии — цикл идёт по множеству"""
    nums = [0] * 20_000 + list(range(20_000))
    start = time.perf_counter()
    assert longest_consecutive(nums) == 20_000
    assert time.perf_counter() - start < 1.0


# ---------- Задача 3. Контроль уникальности ----------

@pytest.mark.parametrize('logins, want', [
    (['ivan', 'Olga', ' IVAN', 'petr', 'olga', 'ivan'], ['ivan', 'olga']),
    (['a', 'a', 'a'], ['a']),
    (['Petr', ' petr '], ['petr']),
    (['a', 'b', 'c'], []),
    (['x', 'y', 'y', 'x'], ['y', 'x']),
    ([], []),
    (['Ёж', 'ёж'], ['ёж']),
])
def test_duplicates(logins, want):
    assert find_duplicates(logins) == want


# ---------- Задача 4. Счастливое число ----------

@pytest.mark.parametrize('n, want', [(19, True), (2, False), (1, True), (7, True), (4, False), (100, True)])
def test_happy(n, want):
    assert is_happy(n) is want
