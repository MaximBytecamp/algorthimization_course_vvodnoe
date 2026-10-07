"""Публичные тесты занятия 9. Запуск: python -m pytest tests.py -v"""

import pytest

from solution import best_window, max_events, max_vowels, window_sums, window_sums_slices

K_FUNCS = [window_sums, best_window]
SUM_FUNCS = [window_sums_slices, window_sums]


# ---------- Границы k: контроль КТП «k = 0/1/n и неверный k» ----------

@pytest.mark.parametrize("func", K_FUNCS)
@pytest.mark.parametrize("nums, k", [([1, 2], 0), ([1, 2], -1), ([1, 2], 3), ([], 1)],
                         ids=["k_zero", "k_negative", "k_over_n", "empty"])
def test_bad_k_raises(func, nums, k):
    with pytest.raises(ValueError):
        func(nums, k)


def test_k_is_one():
    assert window_sums([3, -2, 7], 1) == [3, -2, 7]
    assert best_window([3, -2, 7], 1) == (2, 7)


def test_k_is_n():
    assert window_sums([4, 1, 2], 3) == [7]
    assert best_window([4, 1, 2], 3) == (0, 7)


def test_bad_w_raises():
    for w in (0, -1):
        with pytest.raises(ValueError):
            max_events([1, 2], w)


def test_events_right_edge_and_empty():
    assert max_events([0, 5], 5) == 1
    assert max_events([], 3) == 0


# ---------- Задача 0. Сумма каждого окна: срезами и сдвигом ----------

@pytest.mark.parametrize("func", SUM_FUNCS)
def test_sums_example(func):
    assert func([12, 15, 9, 20, 18, 7, 25], 3) == [36, 44, 47, 45, 50]


@pytest.mark.parametrize("func", SUM_FUNCS)
def test_sums_negative(func):
    assert func([-5, -2, -8, -1], 2) == [-7, -10, -9]


@pytest.mark.parametrize("func", SUM_FUNCS)
def test_sums_does_not_change_input(func):
    nums = [5, 1, 4, 2]
    func(nums, 2)
    assert nums == [5, 1, 4, 2]


def test_sums_match_on_many_inputs():
    import random
    rnd = random.Random(9)
    for _ in range(300):
        nums = [rnd.randint(-20, 20) for _ in range(rnd.randint(1, 15))]
        k = rnd.randint(1, len(nums))
        assert window_sums(nums, k) == window_sums_slices(nums, k)


# ---------- Задача 1. Лучший отрезок длины k ----------

def test_best_example():
    assert best_window([12, 15, 9, 20, 18, 7, 25], 3) == (4, 50)


def test_best_ties_leftmost():
    assert best_window([5, 1, 5, 1], 2) == (0, 6)


def test_best_all_negative():
    assert best_window([-5, -2, -8, -1], 2) == (0, -7)


def test_best_does_not_change_input():
    nums = [5, 1, 4, 2]
    best_window(nums, 2)
    assert nums == [5, 1, 4, 2]


def test_best_matches_slices():
    import random
    rnd = random.Random(10)
    for _ in range(300):
        nums = [rnd.randint(-20, 20) for _ in range(rnd.randint(1, 15))]
        k = rnd.randint(1, len(nums))
        sums = [sum(nums[s:s + k]) for s in range(len(nums) - k + 1)]
        assert best_window(nums, k) == (sums.index(max(sums)), max(sums))


# ---------- Задача 2. События во временном окне ----------

def test_events_example():
    assert max_events([1, 3, 4, 10, 12, 13, 14, 30], 5) == 4


def test_events_same_moment():
    assert max_events([7, 7, 7], 1) == 3


def test_events_one_event():
    assert max_events([42], 10) == 1


def test_events_does_not_change_input():
    times = [1, 2, 8]
    max_events(times, 3)
    assert times == [1, 2, 8]


def test_events_match_brute():
    import random
    rnd = random.Random(11)
    for _ in range(300):
        times = sorted(rnd.randint(0, 40) for _ in range(rnd.randint(0, 12)))
        w = rnd.randint(1, 10)
        want = max((sum(1 for t in times if s <= t < s + w) for s in times), default=0)
        assert max_events(times, w) == want


# ---------- Расширение. Гласные в окне, LeetCode 1456 ----------

@pytest.mark.parametrize("s, k, want", [
    ("abciiidef", 3, 3),
    ("aeiou", 2, 2),
    ("leetcode", 3, 2),
    ("rhythms", 4, 0),
    ("bcdfaa", 2, 2),
], ids=["example", "all_vowels", "leetcode", "no_vowels", "best_at_end"])
def test_vowels(s, k, want):
    assert max_vowels(s, k) == want
