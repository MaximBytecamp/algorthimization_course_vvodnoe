"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import dest_city, find_error_nums, uncommon_from_sentences


@pytest.mark.parametrize('paths, want', [
    ([['London', 'New York'], ['New York', 'Lima'], ['Lima', 'Sao Paulo']], 'Sao Paulo'),
    ([['B', 'C'], ['D', 'B'], ['C', 'A']], 'A'),
    ([['A', 'Z']], 'Z'),
    ([['Тула', 'Орёл'], ['Москва', 'Тула']], 'Орёл'),
    ([['x', 'y'], ['y', 'z'], ['w', 'x']], 'z'),
])
def test_dest_city(paths, want):
    assert dest_city(paths) == want


@pytest.mark.parametrize('nums, want', [
    ([1, 2, 2, 4], [2, 3]),
    ([1, 1], [1, 2]),
    ([3, 2, 2], [2, 1]),
    ([2, 2], [2, 1]),
    ([1, 5, 3, 2, 2], [2, 4]),
])
def test_error_nums(nums, want):
    assert find_error_nums(nums) == want


@pytest.mark.parametrize('s1, s2, want', [
    ('this apple is sweet', 'this apple is sour', ['sweet', 'sour']),
    ('apple apple', 'banana', ['banana']),
    ('кот', 'кот', []),
    ('a b', 'c', ['a', 'b', 'c']),
    ('x x y', 'y z', ['z']),
])
def test_uncommon(s1, s2, want):
    assert uncommon_from_sentences(s1, s2) == want
