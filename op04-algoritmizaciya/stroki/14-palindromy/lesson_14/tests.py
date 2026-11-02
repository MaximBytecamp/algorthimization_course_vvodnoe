"""Публичные тесты занятия 14. Запуск: python -m pytest tests.py -v"""

import random
import tracemalloc

import pytest

from solution import can_be_palindrome, is_palindrome, is_palindrome_copy, longest_palindrome_length, removal_index


def palindrome_brute(text):
    key = [ch.casefold() for ch in text if ch.isalnum()]
    return key == key[::-1]


def one_removal_brute(s):
    """Перебор: попробовать удалить каждый символ, O(n²)."""
    if s == s[::-1]:
        return True
    return any((t := s[:k] + s[k + 1:]) == t[::-1] for k in range(len(s)))


# ---------- Границы: пустая строка, один символ, знаки, регистр, цифры, ё ----------

PAL_CASES = [
    ('А роза упала на лапу Азора', True),
    ('А в Енисее — синева', True),
    ('race a car', False),
    ('', True),
    ('.,', True),
    ('а', True),
    ('Аа', True),
    ('ab', False),
    ('1а2', False),
    ('1а1', True),
    ('ёе', False),
]
PAL_IDS = ["roza", "dash", "race", "empty", "no_letters", "one", "case", "two_diff", "digits", "digits_same", "yo"]


@pytest.mark.parametrize("text, want", PAL_CASES, ids=PAL_IDS)
def test_palindrome_edges(text, want):
    assert is_palindrome(text) == want


@pytest.mark.parametrize("text, want", PAL_CASES[:6], ids=PAL_IDS[:6])
def test_palindrome_copy_edges(text, want):
    assert is_palindrome_copy(text) == want


def test_palindrome_no_copy():
    """Без копии строки: пиковая память на строке в 200 000 символов меньше 10 КБ"""
    text = 'а, б' * 25_000
    text = text + text[::-1]
    tracemalloc.start()
    assert is_palindrome(text) is True
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    assert peak < 10_000, f'пиковая память {peak} байт: похоже, строка копируется'


@pytest.mark.parametrize("s, want", [
    ('aba', True), ('abca', True), ('abc', False), ('', True), ('a', True), ('ab', True),
    ('abbab', True), ('шалаши', True), ('ротатоор', True), ('abcda', False),
], ids=["leet1", "leet2", "leet3", "empty", "one", "two", "greedy_trap", "last", "middle", "two_diffs"])
def test_one_removal_edges(s, want):
    assert can_be_palindrome(s) == want


@pytest.mark.parametrize("s", ['кабак', 'шалаши', 'ашалаш', 'ротатоор', 'abbab', 'abc', 'ab', ''])
def test_removal_index(s):
    k = removal_index(s)
    if s == s[::-1]:
        assert k == -1
    elif not one_removal_brute(s):
        assert k is None
    else:
        assert isinstance(k, int) and 0 <= k < len(s)
        t = s[:k] + s[k + 1:]
        assert t == t[::-1], f'после удаления s[{k}] получилось {t!r}'


@pytest.mark.parametrize("s, want", [('abccccdd', 7), ('a', 1), ('Aa', 1), ('', 0), ('aaaa', 4), ('абвабв', 6)])
def test_longest_palindrome_length(s, want):
    assert longest_palindrome_length(s) == want


# ---------- Сравнение с перебором ----------

def test_palindrome_matches_brute():
    """300 случайных строк: ответ совпадает с очищенной копией"""
    rnd = random.Random(14)
    for _ in range(300):
        half = ''.join(rnd.choice('абАБ ,1') for _ in range(rnd.randint(0, 5)))
        text = half + rnd.choice(['', 'в', ' ']) + (half[::-1] if rnd.random() < 0.5 else half)
        assert is_palindrome(text) == palindrome_brute(text), text


def test_one_removal_matches_brute():
    """2000 случайных строк из букв a, b, c: ответ совпадает с перебором удалений"""
    rnd = random.Random(680)
    for _ in range(2000):
        s = ''.join(rnd.choice('abc') for _ in range(rnd.randint(0, 9)))
        assert can_be_palindrome(s) == one_removal_brute(s), s
