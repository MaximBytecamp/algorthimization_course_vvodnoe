"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import break_palindrome, min_length_after_trim, reverse_vowels


@pytest.mark.parametrize("s, want", [
    ('IceCreAm', 'AceCreIm'), ('leetcode', 'leotcede'), ('xyz', 'xyz'), ('a', 'a'), ('aA', 'Aa'),
])
def test_reverse_vowels(s, want):
    assert reverse_vowels(s) == want


@pytest.mark.parametrize("s, want", [
    ('ca', 2), ('cabaabac', 0), ('aabccabba', 3), ('a', 1), ('aba', 1),
])
def test_min_length(s, want):
    assert min_length_after_trim(s) == want


@pytest.mark.parametrize("p, want", [
    ('abccba', 'aaccba'), ('a', ''), ('aa', 'ab'), ('aba', 'abb'), ('zz', 'az'),
])
def test_break_palindrome(p, want):
    assert break_palindrome(p) == want
