"""Публичные тесты занятия 13. Запуск: python -m pytest tests.py -v"""

import random
import unicodedata

import pytest

from solution import can_construct, first_unique, is_anagram, letters, normalize_name

NFD = lambda s: unicodedata.normalize('NFD', s)
RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'


def anagram_brute(a, b):
    """Перебор через сортировку символов после той же нормализации."""
    key = lambda s: sorted(c for c in unicodedata.normalize('NFC', s).casefold() if c.isalnum())
    return key(a) == key(b)


def unique_brute(text):
    """Перебор: для каждой буквы пересчитать её по всей строке, O(n²)."""
    low = text.casefold()
    for i, ch in enumerate(text):
        if ch.isalpha() and low.count(ch.casefold()) == 1:
            return i
    return -1


# ---------- Границы: пробелы, регистр, ё, пустая строка, NFD ----------

@pytest.mark.parametrize("text, want", [
    ('  салтыков-щедрин   михаил ', 'Салтыков-Щедрин Михаил'),
    ('ИВАНОВ иван\xa0петрович', 'Иванов Иван Петрович'),
    ('', ''),
    ('   ', ''),
    ('ёлкин пётр', 'Ёлкин Пётр'),
    (NFD('йошкин'), 'Йошкин'),
    ("д'артаньян", "Д'артаньян"),
], ids=["spaces_hyphen", "case_nbsp", "empty", "blank", "yo", "nfd", "apostrophe"])
def test_name_edges(text, want):
    assert normalize_name(text) == want


def test_letters_example():
    assert letters('А роза!') == ['а', 'р', 'о', 'з', 'а']


@pytest.mark.parametrize("a, b, want", [
    ('листок', 'слиток', True),
    ('Апельсин', 'спаниель', True),
    ('А роза упала', 'Ау, пала роза!', True),
    ('ёж', 'еж', False),
    ('папа', 'пап', False),
    ('пап', 'папа', False),
    ('аб', 'аа', False),
    ('', '', True),
    ('!!!', '', True),
    (NFD('йод'), 'дой', True),
], ids=["simple", "case", "spaces_marks", "yo", "longer_a", "longer_b", "same_len", "empty", "no_letters", "nfd"])
def test_anagram_edges(a, b, want):
    assert is_anagram(a, b) == want


@pytest.mark.parametrize("text, want", [
    ('Казак', 2),
    ('Тот, кто', 5),
    ('', -1),
    ('аА', -1),
    (' ,!', -1),
    ('1а1', 1),
    ('ёЁж', 2),
], ids=["case", "marks", "empty", "same_letter_cases", "no_letters", "digits", "yo"])
def test_unique_edges(text, want):
    assert first_unique(text) == want


# ---------- Примеры из условий LeetCode ----------

@pytest.mark.parametrize("text, want", [('leetcode', 0), ('loveleetcode', 2), ('aabb', -1)])
def test_unique_leetcode(text, want):
    assert first_unique(text) == want


@pytest.mark.parametrize("a, b, want", [('anagram', 'nagaram', True), ('rat', 'car', False)])
def test_anagram_leetcode(a, b, want):
    assert is_anagram(a, b) == want


@pytest.mark.parametrize("note, magazine, want", [
    ('a', 'b', False), ('aa', 'ab', False), ('aa', 'aab', True), ('', '', True),
], ids=["no_letter", "not_enough", "enough", "empty"])
def test_construct(note, magazine, want):
    assert can_construct(note, magazine) == want


# ---------- Сравнение с перебором ----------

def test_anagram_matches_brute():
    """300 случайных пар: ответ совпадает с сортировкой"""
    rnd = random.Random(13)
    for _ in range(300):
        a = ''.join(rnd.choice(RU[:6] + 'АБ !') for _ in range(rnd.randint(0, 8)))
        b = list(a) if rnd.random() < 0.5 else [rnd.choice(RU[:6] + 'В ,') for _ in range(rnd.randint(0, 8))]
        rnd.shuffle(b)
        b = ''.join(b)
        assert is_anagram(a, b) == anagram_brute(a, b), (a, b)


def test_unique_matches_brute():
    """300 случайных строк: ответ совпадает с перебором"""
    rnd = random.Random(31)
    for _ in range(300):
        text = ''.join(rnd.choice('абвАБВ ,1') for _ in range(rnd.randint(0, 10)))
        assert first_unique(text) == unique_brute(text), text

