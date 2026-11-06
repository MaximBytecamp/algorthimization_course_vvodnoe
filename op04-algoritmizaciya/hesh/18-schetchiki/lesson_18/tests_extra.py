"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import count_words, find_lucky, frequency_sort_asc


@pytest.mark.parametrize('arr, want', [
    ([2, 2, 3, 4], 2),
    ([1, 2, 2, 3, 3, 3], 3),
    ([2, 2, 2, 3, 3], -1),
    ([1], 1),
    ([5], -1),
])
def test_lucky(arr, want):
    assert find_lucky(arr) == want


@pytest.mark.parametrize('nums, want', [
    ([1, 1, 2, 2, 2, 3], [3, 1, 1, 2, 2, 2]),
    ([2, 3, 1, 3, 2], [1, 3, 3, 2, 2]),
    ([-1, 1, -6, 4, 5, -6, 1, 4, 1], [5, -1, 4, 4, -6, -6, 1, 1, 1]),
    ([], []),
    ([7], [7]),
])
def test_frequency_sort_asc(nums, want):
    assert frequency_sort_asc(nums) == want


@pytest.mark.parametrize('w1, w2, want', [
    (['leetcode', 'is', 'amazing', 'as', 'is'], ['amazing', 'leetcode', 'is'], 2),
    (['b', 'bb', 'bbb'], ['a', 'aa', 'aaa'], 0),
    (['a', 'ab'], ['a', 'a', 'a', 'ab'], 1),
    ([], ['a'], 0),
    (['кот'], ['кот'], 1),
])
def test_count_words(w1, w2, want):
    assert count_words(w1, w2) == want
