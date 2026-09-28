"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""

import random

from extra import is_clean_palindrome, max_water, three_sum_zero


# ---------- LeetCode 11 ----------

def test_water_example():
    assert max_water([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49


def test_water_two_walls():
    assert max_water([3, 5]) == 3


def test_water_too_few_walls():
    assert max_water([]) == 0
    assert max_water([7]) == 0


def test_water_equal_walls():
    assert max_water([4, 4, 4, 4]) == 12


def test_water_matches_brute_force():
    rnd = random.Random(11)
    for _ in range(300):
        h = [rnd.randint(0, 20) for _ in range(rnd.randint(0, 12))]
        brute = max([min(h[i], h[j]) * (j - i) for i in range(len(h)) for j in range(i + 1, len(h))], default=0)
        assert max_water(h) == brute


# ---------- LeetCode 125 ----------

def test_palindrome_phrase():
    assert is_clean_palindrome("A man, a plan, a canal: Panama") is True


def test_palindrome_russian():
    assert is_clean_palindrome("А роза упала на лапу Азора") is True


def test_not_palindrome():
    assert is_clean_palindrome("race a car") is False


def test_palindrome_only_punctuation():
    assert is_clean_palindrome(" ,.!") is True


def test_palindrome_digits():
    assert is_clean_palindrome("0P") is False
    assert is_clean_palindrome("12:21") is True


# ---------- LeetCode 15 ----------

def normalize(triples):
    return sorted(tuple(t) for t in triples)


def test_three_sum_example():
    assert normalize(three_sum_zero([-1, 0, 1, 2, -1, -4])) == [(-1, -1, 2), (-1, 0, 1)]


def test_three_sum_none():
    assert three_sum_zero([0, 1, 1]) == []


def test_three_sum_zeros():
    assert normalize(three_sum_zero([0, 0, 0, 0])) == [(0, 0, 0)]


def test_three_sum_does_not_change_input():
    nums = [3, -2, 1, 0, -1]
    three_sum_zero(nums)
    assert nums == [3, -2, 1, 0, -1]


def test_three_sum_matches_brute_force():
    rnd = random.Random(15)
    for _ in range(300):
        nums = [rnd.randint(-5, 5) for _ in range(rnd.randint(0, 9))]
        brute = {tuple(sorted((nums[a], nums[b], nums[c])))
                 for a in range(len(nums)) for b in range(a + 1, len(nums)) for c in range(b + 1, len(nums))
                 if nums[a] + nums[b] + nums[c] == 0}
        got = normalize(three_sum_zero(nums))
        assert got == sorted(brute)
        assert len(got) == len(set(got))
