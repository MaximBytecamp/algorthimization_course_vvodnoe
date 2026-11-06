"""Занятие 18. Счётчики, группировка и частотные задачи.

Пять функций с пустыми телами. Контракты — глава 18.1, §5.
Проверка: python -m pytest tests.py -v
"""
from collections import Counter, defaultdict

RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
POS = {ch: i for i, ch in enumerate(RU)}


def group_anagrams(words):
    """Группы анаграмм, LeetCode 49. Ключ — отсортированные буквы.

    Слова — строчные русские буквы, ё отдельно; пустое слово допустимо.
    Группы — в порядке первого появления ключа, слова в группе — в порядке
    входа, повторы сохраняются. Время O(n · m log m), память O(n · m).
    """
    raise NotImplementedError


def group_anagrams_counts(words):
    """То же, ключ — кортеж из 33 частот букв (места букв — POS).

    Время O(n · (m + 33)), память O(n · m).
    """
    raise NotImplementedError


def top_k_frequent(nums, k):
    """k самых частых чисел, LeetCode 347. Через сортировку частот.

    k >= 1. Список чисел по убыванию частоты; при равной частоте — в порядке
    первого появления в nums. Разных чисел меньше k — вернуть все.
    Время O(n + d log d), где d — число разных чисел, память O(d).
    """
    raise NotImplementedError


def top_k_bucket(nums, k):
    """То же, через вёдра «частота → числа». Время O(n), память O(n)."""
    raise NotImplementedError


def frequency_sort(s):
    """Символы по убыванию частоты, LeetCode 451.

    Одинаковые символы идут подряд. При равной частоте — в порядке первого
    появления в s. Регистр различается. 'tree' → 'eetr', 'кабак' → 'ккааб'.
    Время O(n + d log d), память O(n).
    """
    raise NotImplementedError
