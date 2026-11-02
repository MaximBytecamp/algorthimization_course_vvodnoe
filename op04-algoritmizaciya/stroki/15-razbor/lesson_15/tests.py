"""Публичные тесты занятия 15. Запуск: python -m pytest tests.py -v"""

import random
import re
import time

import pytest

from solution import compress, decompress, parse_event, parse_log, reverse_words


def compress_brute(s):
    """Сжатие регулярным выражением: (.)\\1* — символ и его повторы."""
    return ''.join(m.group(1) + (str(len(m.group(0))) if len(m.group(0)) > 1 else '')
                   for m in re.finditer(r'(.)\1*', s, re.S))


# ---------- Сжатие: пустая строка, один символ, длинные серии, регистр, цифры ----------

@pytest.mark.parametrize("s, want", [
    ('aaabccdddd', 'a3bc2d4'),
    ('', ''),
    ('a', 'a'),
    ('abc', 'abc'),
    ('aab', 'a2b'),
    ('a' * 12, 'a12'),
    ('a' * 100 + 'b', 'a100b'),
    ('aA', 'aA'),
    ('ёёе', 'ё2е'),
    ('  x', ' 2x'),
], ids=["example", "empty", "one", "no_runs", "run_first", "two_digits", "three_digits", "case", "yo", "spaces"])
def test_compress_edges(s, want):
    assert compress(s) == want


@pytest.mark.parametrize("s", ['a1', 'x9y'])
def test_compress_digit(s):
    with pytest.raises(ValueError):
        compress(s)


# ---------- Восстановление: верные и повреждённые записи ----------

@pytest.mark.parametrize("code, want", [
    ('a3bc2d4', 'aaabccdddd'),
    ('', ''),
    ('a', 'a'),
    ('a12', 'a' * 12),
    ('a10b', 'a' * 10 + 'b'),
    (' 2x', '  x'),
], ids=["example", "empty", "one", "two_digits", "zero_inside", "spaces"])
def test_decompress_edges(code, want):
    assert decompress(code) == want


@pytest.mark.parametrize("code", ['3a', '12', 'a0', 'a03', 'a1', 'aa', 'a2a'],
                         ids=["digit_first", "only_digits", "zero", "leading_zero", "one", "split_run", "split_run_count"])
def test_decompress_malformed(code):
    with pytest.raises(ValueError):
        decompress(code)


def test_long_run():
    """Серия из миллиона символов: длина 1000000 записывается семью цифрами"""
    s = 'я' * 1_000_000 + 'a'
    assert compress(s) == 'я1000000a'
    assert decompress('я1000000a') == s


def test_compress_linear():
    """Миллион символов в коротких сериях сжимается быстрее 1,5 секунды"""
    rnd = random.Random(15)
    s = ''.join(rnd.choice('ab') for _ in range(1_000_000))
    start = time.perf_counter()
    code = compress(s)
    spent = time.perf_counter() - start
    assert code == compress_brute(s)
    assert spent < 1.5, f'{spent:.2f} с: похоже, на каждой серии копируется остаток строки'


def test_round_trip():
    """2000 случайных строк: сжатие совпадает с регулярным выражением, восстановление — с исходной строкой"""
    rnd = random.Random(443)
    for _ in range(2000):
        s = ''.join(rnd.choice('aabё ') for _ in range(rnd.randint(0, 12)))
        if rnd.random() < 0.1:
            s += 'b' * rnd.randint(9, 120)
        assert compress(s) == compress_brute(s), s
        assert decompress(compress(s)) == s, s


# ---------- Разбор строки события ----------

@pytest.mark.parametrize("line, want", [
    ('time=09:15;user=ivan;action=login', {'time': '09:15', 'user': 'ivan', 'action': 'login'}),
    ('time=09:15;user=ivan;', {'time': '09:15', 'user': 'ivan'}),
    (' time = 09:15 ; note=a=b', {'time': '09:15', 'note': 'a=b'}),
    ('time=09:15;note=', {'time': '09:15', 'note': ''}),
], ids=["example", "trailing_semicolon", "spaces_and_eq_in_value", "empty_value"])
def test_parse_event(line, want):
    assert parse_event(line) == want


@pytest.mark.parametrize("line, field", [
    ('', 1),
    ('time=09:15;;user=ivan', 2),
    ('time=09:15; ;user=ivan', 2),
    ('time=09:15;user', 2),
    ('time=09:15;=ivan', 2),
    ('user=ivan;time=09:15;user=olga', 3),
], ids=["empty_line", "double_semicolon", "blank_field", "no_eq", "empty_key", "repeated_key"])
def test_parse_event_malformed(line, field):
    with pytest.raises(ValueError, match=f'поле {field}'):
        parse_event(line)


# ---------- Разбор журнала ----------

LOG = '\n'.join([
    'time=09:15;user=ivan;action=login',
    '',
    'time=09:20;user=olga',
    'time=09:21;;user=petr;action=logout',
    '   ',
    'time=09:30;user=ivan;action=logout;',
])


def test_parse_log():
    events, errors = parse_log(LOG)
    assert events == [{'time': '09:15', 'user': 'ivan', 'action': 'login'},
                      {'time': '09:30', 'user': 'ivan', 'action': 'logout'}]
    assert [n for n, _ in errors] == [3, 4]
    assert 'action' in errors[0][1]
    assert 'поле 2' in errors[1][1]


def test_parse_log_all_bad():
    """Ни одной верной записи: событий нет, ошибка на каждой строке"""
    events, errors = parse_log('user\n;;\ntime=1;user=a;action=b;user=c')
    assert events == []
    assert [n for n, _ in errors] == [1, 2, 3]


def test_parse_log_empty():
    assert parse_log('') == ([], [])


# ---------- Расширение: слова в обратном порядке ----------

@pytest.mark.parametrize("s, want", [
    ('the sky is blue', 'blue is sky the'),
    ('  hello world  ', 'world hello'),
    ('a good   example', 'example good a'),
    ('   ', ''),
], ids=["example", "edge_spaces", "many_spaces", "only_spaces"])
def test_reverse_words(s, want):
    assert reverse_words(s) == want
