"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import defang_ip, max_power, sort_sentence


@pytest.mark.parametrize("s, want", [
    ('leetcode', 2), ('abbcccddddeeeeedcba', 5), ('a', 1), ('ab', 1), ('я' * 1000, 1000),
])
def test_max_power(s, want):
    assert max_power(s) == want


@pytest.mark.parametrize("address, want", [
    ('1.1.1.1', '1[.]1[.]1[.]1'), ('255.100.50.0', '255[.]100[.]50[.]0'), ('0.0.0.0', '0[.]0[.]0[.]0'),
    ('10.0.0.1', '10[.]0[.]0[.]1'), ('127.0.0.1', '127[.]0[.]0[.]1'),
])
def test_defang_ip(address, want):
    assert defang_ip(address) == want


@pytest.mark.parametrize("s, want", [
    ('is2 sentence4 This1 a3', 'This is a sentence'), ('Myself2 Me1 I4 and3', 'Me Myself and I'),
    ('one1', 'one'), ('b2 a1', 'a b'), ('w9 w8 w7 w6 w5 w4 w3 w2 w1', 'w w w w w w w w w'),
])
def test_sort_sentence(s, want):
    assert sort_sentence(s) == want
