"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""

import pytest

from extra import count_unique_windows, longest_after_delete, longest_ones


@pytest.mark.parametrize("nums, k, want", [
    ([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2, 6),
    ([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3, 10),
    ([1, 1, 0, 1, 1, 1], 0, 3),
    ([0, 0], 0, 0),
    ([0, 1, 0, 1], 5, 4),
], ids=["leetcode_1", "leetcode_2", "k_zero", "only_zeros", "big_k"])
def test_longest_ones(nums, k, want):
    assert longest_ones(nums, k) == want


@pytest.mark.parametrize("nums, want", [
    ([1, 1, 0, 1], 3),
    ([0, 1, 1, 1, 0, 1, 1, 0, 1], 5),
    ([1, 1, 1], 2),
    ([0, 0, 0], 0),
    ([1], 0),
], ids=["leetcode_1", "leetcode_2", "leetcode_3", "only_zeros", "one_element"])
def test_longest_after_delete(nums, want):
    assert longest_after_delete(nums) == want


@pytest.mark.parametrize("nums, want", [
    ([1, 2, 1, 3], 8),
    ([5, 5, 5], 3),
    ([1, 2, 3], 6),
    ([7], 1),
    ([], 0),
], ids=["example", "all_same", "all_different", "one", "empty"])
def test_count_unique_windows(nums, want):
    assert count_unique_windows(nums) == want
