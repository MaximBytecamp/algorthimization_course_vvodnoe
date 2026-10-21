"""Публичные тесты занятия 11. Запуск: python -m pytest tests.py -v"""

import random

import pytest

from solution import count_k_sums, highest_altitude, pivot_index, range_sums

STORE = [5, -2, 7, -4, 3, 6, -1, 2]


# ---------- Границы: контроль КТП «проверка на границах диапазона и согласование индексации» ----------

@pytest.mark.parametrize("query", [(-1, 2), (3, 2), (0, 9), (9, 9)],
                         ids=["l_negative", "l_greater_r", "r_over_n", "both_over_n"])
def test_bad_query_raises(query):
    with pytest.raises(ValueError):
        range_sums(STORE, [query])


@pytest.mark.parametrize("nums, queries, want", [
    ([], [(0, 0)], [0]),
    (STORE, [(0, 3)], [10]),
    (STORE, [(5, 8)], [7]),
    (STORE, [(4, 4), (8, 8)], [0, 0]),
    (STORE, [(0, 8)], [16]),
    (STORE, [], []),
], ids=["empty_list", "from_start", "to_end", "empty_range", "whole_list", "no_queries"])
def test_range_edges(nums, queries, want):
    assert range_sums(nums, queries) == want


@pytest.mark.parametrize("nums, want", [
    ([], -1),
    ([0], 0),
    ([2, 1, -1], 0),
    ([-1, 1, 2], 2),
    ([1, 2, 3], -1),
    ([0, 0, 0], 0),
], ids=["empty", "one_zero", "first_index", "last_index", "none", "several"])
def test_pivot_edges(nums, want):
    assert pivot_index(nums) == want


@pytest.mark.parametrize("nums, k, want", [
    ([], 0, 0),
    ([3, -3], 0, 1),
    ([0, 0], 0, 3),
    ([1, -1, 2], 2, 2),
], ids=["empty", "k_zero", "zeros", "from_start"])
def test_ksum_edges(nums, k, want):
    assert count_k_sums(nums, k) == want


# ---------- Задача 0. Наибольшая высота ----------

@pytest.mark.parametrize("gain, want", [
    ([-5, 1, 5, 0, -7], 1),
    ([-4, -3, -2, -1, 4, 3, 2], 0),
    ([], 0),
    ([3], 3),
], ids=["leetcode_1", "leetcode_2", "empty", "one_step"])
def test_altitude(gain, want):
    assert highest_altitude(gain) == want


# ---------- Задача 1. Сервис сумм на диапазонах ----------

def test_range_example():
    assert range_sums(STORE, [(2, 5), (0, 8), (3, 3)]) == [6, 16, 0]


def test_range_does_not_change_list():
    nums = STORE[:]
    range_sums(nums, [(0, 8)])
    assert nums == STORE


def test_range_matches_brute():
    rnd = random.Random(1101)
    for _ in range(300):
        nums = [rnd.randint(-9, 9) for _ in range(rnd.randint(0, 15))]
        queries = []
        for _ in range(rnd.randint(0, 8)):
            l = rnd.randint(0, len(nums))
            queries.append((l, rnd.randint(l, len(nums))))
        assert range_sums(nums, queries) == [sum(nums[l:r]) for l, r in queries], (nums, queries)


# ---------- Задача 2. Равновесный индекс ----------

@pytest.mark.parametrize("nums, want", [
    ([1, 7, 3, 6, 5, 6], 3),
    ([2, -1, 1], 0),
    ([5, -5, 5], 0),
], ids=["leetcode_1", "right_sum_zero", "negative"])
def test_pivot(nums, want):
    assert pivot_index(nums) == want


def test_pivot_matches_brute():
    rnd = random.Random(1102)
    for _ in range(300):
        nums = [rnd.randint(-5, 5) for _ in range(rnd.randint(0, 12))]
        want = next((i for i in range(len(nums)) if sum(nums[:i]) == sum(nums[i + 1:])), -1)
        assert pivot_index(nums) == want, nums


# ---------- Задача 3. Отрезки с суммой k ----------

@pytest.mark.parametrize("nums, k, want", [
    ([1, 1, 1], 2, 2),
    ([1, 2, 3], 3, 2),
    ([1, -1, 2, 1, -2, 3], 2, 4),
    ([1, 2, 3], 7, 0),
], ids=["leetcode_1", "leetcode_2", "negative", "none"])
def test_ksum(nums, k, want):
    assert count_k_sums(nums, k) == want


def test_ksum_matches_brute():
    rnd = random.Random(1103)
    for _ in range(300):
        nums = [rnd.randint(-3, 3) for _ in range(rnd.randint(0, 12))]
        k = rnd.randint(-4, 4)
        want = sum(1 for l in range(len(nums)) for r in range(l + 1, len(nums) + 1) if sum(nums[l:r]) == k)
        assert count_k_sums(nums, k) == want, (nums, k)
