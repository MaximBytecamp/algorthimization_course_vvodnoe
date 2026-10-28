"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import good_words_length, is_isomorphic, max_words


@pytest.mark.parametrize("text, word, want", [
    ('nlaebolko', 'balloon', 1),
    ('loonbalxballpoon', 'balloon', 2),
    ('leetcode', 'balloon', 0),
    ('', 'кот', 0),
    ('коткоткот', 'кот', 3),
])
def test_max_words(text, word, want):
    assert max_words(text, word) == want


@pytest.mark.parametrize("s, t, want", [
    ('egg', 'add', True),
    ('foo', 'bar', False),
    ('paper', 'title', True),
    ('badc', 'baba', False),
    ('', '', True),
])
def test_isomorphic(s, t, want):
    assert is_isomorphic(s, t) == want


@pytest.mark.parametrize("words, chars, want", [
    (['cat', 'bt', 'hat', 'tree'], 'atach', 6),
    (['hello', 'world', 'leetcode'], 'welldonehoneyr', 10),
    ([], 'abc', 0),
    (['aa'], 'a', 0),
    (['кот', 'ток', 'кит'], 'окт', 6),
])
def test_good_words(words, chars, want):
    assert good_words_length(words, chars) == want
