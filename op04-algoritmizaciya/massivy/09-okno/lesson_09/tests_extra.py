"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""

import pytest

from extra import count_good_substrings, max_satisfied, min_recolors


@pytest.mark.parametrize("blocks, k, want", [
    ("WBBWWBBWBW", 7, 3),
    ("WBWBBBW", 2, 0),
    ("WWWW", 4, 4),
    ("B", 1, 0),
    ("WBWWB", 3, 2),
], ids=["leetcode_1", "leetcode_2", "all_white", "one_black", "middle"])
def test_min_recolors(blocks, k, want):
    assert min_recolors(blocks, k) == want


@pytest.mark.parametrize("s, want", [
    ("xyzzaz", 1),
    ("aababcabc", 4),
    ("ab", 0),
    ("aaa", 0),
    ("abcabc", 4),
], ids=["leetcode_1", "leetcode_2", "short", "same_letters", "repeat"])
def test_count_good_substrings(s, want):
    assert count_good_substrings(s) == want


@pytest.mark.parametrize("customers, grumpy, minutes, want", [
    ([1, 0, 1, 2, 1, 1, 7, 5], [0, 1, 0, 1, 0, 1, 0, 1], 3, 16),
    ([1], [0], 1, 1),
    ([4, 10, 10], [1, 1, 0], 2, 24),
    ([2, 6, 6, 9], [0, 0, 1, 1], 1, 17),
    ([5, 5, 5], [1, 1, 1], 3, 15),
], ids=["leetcode_1", "leetcode_2", "start", "end", "all_grumpy"])
def test_max_satisfied(customers, grumpy, minutes, want):
    assert max_satisfied(customers, grumpy, minutes) == want
