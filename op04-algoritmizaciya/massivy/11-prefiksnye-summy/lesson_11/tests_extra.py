"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""

import pytest

from extra import count_divisible, longest_balanced, rect_sums


@pytest.mark.parametrize("nums, want", [
    ([0, 1], 2),
    ([0, 1, 0], 2),
    ([0, 1, 1, 1, 1, 1, 0, 0, 0], 6),
    ([1, 1, 1], 0),
    ([], 0),
], ids=["leetcode_1", "leetcode_2", "leetcode_3", "only_ones", "empty"])
def test_longest_balanced(nums, want):
    assert longest_balanced(nums) == want


@pytest.mark.parametrize("nums, k, want", [
    ([4, 5, 0, -2, -3, 1], 5, 7),
    ([5], 9, 0),
    ([-1, 2, 9], 2, 2),
    ([3, 3], 1, 3),
    ([], 4, 0),
], ids=["leetcode_1", "leetcode_2", "negative", "k_one", "empty"])
def test_count_divisible(nums, k, want):
    assert count_divisible(nums, k) == want


GRID = [[3, 0, 1, 4, 2],
        [5, 6, 3, 2, 1],
        [1, 2, 0, 1, 5],
        [4, 1, 0, 1, 7],
        [1, 0, 3, 0, 5]]


@pytest.mark.parametrize("query, want", [
    ((2, 1, 4, 3), 8),
    ((1, 1, 2, 2), 11),
    ((1, 2, 2, 4), 12),
    ((0, 0, 0, 0), 3),
    ((0, 0, 4, 4), 58),
], ids=["leetcode_1", "leetcode_2", "leetcode_3", "one_cell", "whole_grid"])
def test_rect_sums(query, want):
    assert rect_sums(GRID, [query]) == [want]
