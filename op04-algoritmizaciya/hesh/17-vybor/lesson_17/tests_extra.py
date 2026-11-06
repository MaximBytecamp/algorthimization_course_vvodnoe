"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import find_difference, num_identical_pairs, unique_occurrences


@pytest.mark.parametrize('nums, want', [
    ([1, 2, 3, 1, 1, 3], 4),
    ([1, 1, 1, 1], 6),
    ([1, 2, 3], 0),
    ([], 0),
    ([7], 0),
])
def test_identical_pairs(nums, want):
    assert num_identical_pairs(nums) == want


@pytest.mark.parametrize('a, b, want', [
    ([1, 2, 3], [2, 4, 6], [[1, 3], [4, 6]]),
    ([1, 2, 3, 3], [1, 1, 2, 2], [[3], []]),
    ([], [5], [[], [5]]),
    ([3, 1, 3], [], [[1, 3], []]),
    ([-1, 0], [0, -1], [[], []]),
])
def test_difference(a, b, want):
    assert find_difference(a, b) == want


@pytest.mark.parametrize('arr, want', [
    ([1, 2, 2, 1, 1, 3], True),
    ([1, 2], False),
    ([-3, 0, 1, -3, 1, 1, 1, -3, 10, 0], True),
    ([5], True),
    ([4, 4, 5, 5], False),
])
def test_unique_occurrences(arr, want):
    assert unique_occurrences(arr) is want
