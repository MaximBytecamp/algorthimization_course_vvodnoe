"""Публичные тесты занятия 10. Запуск: python -m pytest tests.py -v"""

import random

import pytest

from solution import longest_unique, longest_within, shortest_window, total_fruit


# ---------- Границы: контроль КТП «проверяются дубликаты и пустая строка» ----------

@pytest.mark.parametrize("s", [0, -1], ids=["s_zero", "s_negative"])
def test_bad_s_raises(s):
    with pytest.raises(ValueError):
        shortest_window([1, 2], s)


@pytest.mark.parametrize("nums, s, want", [
    ([], 3, 0),
    ([1, 1, 1, 1], 5, 0),
    ([7], 7, 1),
    ([7], 8, 0),
    ([1, 2, 3], 6, 3),
], ids=["empty", "no_window", "one_exact", "one_short", "whole_list"])
def test_shortest_edges(nums, s, want):
    assert shortest_window(nums, s) == want


@pytest.mark.parametrize("text, want", [
    ("", 0),
    ("z", 1),
    ("bbbbb", 1),
    ("pwwkew", 3),
    ("abba", 2),
    ("aA", 2),
    ("a b a", 3),
], ids=["empty", "one_char", "all_same", "adjacent_repeat", "repeat_left_window", "case", "space"])
def test_unique_edges(text, want):
    assert longest_unique(text) == want


# ---------- Задача 0. Самый длинный отрезок в пределах лимита ----------

@pytest.mark.parametrize("nums, limit, want", [
    ([4, 2, 5, 1, 1, 2, 1, 9], 7, 4),
    ([3, 4], 7, 2),
    ([8, 1, 1], 2, 2),
    ([5, 9, 8], 4, 0),
    ([0, 0, 0], 0, 3),
    ([], 5, 0),
], ids=["example", "exact_limit", "big_first", "no_window", "zeros", "empty"])
def test_within(nums, limit, want):
    assert longest_within(nums, limit) == want


def test_within_bad_limit():
    with pytest.raises(ValueError):
        longest_within([1, 2], -1)


# ---------- Задача 1. Минимальный отрезок с суммой не меньше S ----------

@pytest.mark.parametrize("nums, s, want", [
    ([5, 8, 3, 12, 20, 6, 22, 9], 30, 2),
    ([2, 3, 1, 2, 4, 3], 7, 2),
    ([4, 40, 1], 30, 1),
    ([0, 0, 5, 0], 5, 1),
], ids=["orders", "exact_sum", "one_element", "zeros"])
def test_shortest(nums, s, want):
    assert shortest_window(nums, s) == want


# ---------- Задача 2. Подстрока без повторов ----------

@pytest.mark.parametrize("text, want", [
    ("abcabcbb", 3),
    ("a1!a1?", 4),
    ("dvdf", 3),
], ids=["example", "any_symbols", "repeat_after_shrink"])
def test_unique(text, want):
    assert longest_unique(text) == want


# ---------- Задача 3. Две корзины ----------

@pytest.mark.parametrize("fruits, want", [
    ([1, 2, 1], 3),
    ([0, 1, 2, 2], 3),
    ([1, 2, 3, 2, 2], 4),
    ([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4], 5),
    ([5, 5, 5], 3),
    ([], 0),
], ids=["leetcode_1", "leetcode_2", "leetcode_3", "middle", "one_kind", "empty"])
def test_fruit(fruits, want):
    assert total_fruit(fruits) == want


# ---------- Общие проверки: вход не меняется, ответ совпадает с перебором ----------

def test_input_not_changed():
    nums = [5, 1, 4, 2]
    longest_within(nums, 6)
    shortest_window(nums, 6)
    total_fruit(nums)
    assert nums == [5, 1, 4, 2]


def test_within_matches_brute():
    rnd = random.Random(103)
    for _ in range(300):
        nums = [rnd.randint(0, 9) for _ in range(rnd.randint(0, 12))]
        limit = rnd.randint(0, 20)
        want = max([r - l for l in range(len(nums) + 1) for r in range(l, len(nums) + 1)
                    if sum(nums[l:r]) <= limit])
        assert longest_within(nums, limit) == want, (nums, limit)


def test_shortest_matches_brute():
    rnd = random.Random(104)
    for _ in range(300):
        nums = [rnd.randint(0, 9) for _ in range(rnd.randint(0, 12))]
        s = rnd.randint(1, 25)
        lens = [r - l for l in range(len(nums)) for r in range(l + 1, len(nums) + 1)
                if sum(nums[l:r]) >= s]
        assert shortest_window(nums, s) == (min(lens) if lens else 0), (nums, s)


def test_unique_matches_brute():
    rnd = random.Random(105)
    for _ in range(300):
        text = "".join(rnd.choice("abcA ") for _ in range(rnd.randint(0, 12)))
        want = max([r - l for l in range(len(text) + 1) for r in range(l, len(text) + 1)
                    if len(set(text[l:r])) == r - l])
        assert longest_unique(text) == want, text


def test_fruit_matches_brute():
    rnd = random.Random(904)
    for _ in range(300):
        fruits = [rnd.randint(0, 4) for _ in range(rnd.randint(0, 12))]
        want = max([r - l for l in range(len(fruits) + 1) for r in range(l, len(fruits) + 1)
                    if len(set(fruits[l:r])) <= 2])
        assert total_fruit(fruits) == want, fruits
