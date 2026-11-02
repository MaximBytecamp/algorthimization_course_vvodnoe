"""Домашнее задание 14, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_14.py,
исправьте одну строку и прогоните тесты снова.
"""


def is_word_palindrome(text):
    """Палиндром ли фраза по словам: 'кот ест кот' → True.

    Слова сравниваются без учёта регистра, знаков внутри слов нет.
    Слова разделены пробелами, пробелов может быть несколько подряд.
    """
    words = text.casefold().split(' ')
    i, j = 0, len(words) - 1
    while i < j:
        if words[i] != words[j]:
            return False
        i += 1
        j -= 1
    return True


def reverse_letters(text):
    """Развернуть только буквы, остальные символы оставить на местах.

    'аб-вг' → 'гв-ба'. Буква — символ, для которого str.isalpha() истинно.
    """
    chars = list(text)
    i, j = 0, len(chars) - 1
    while i < j:
        while not chars[i].isalpha():
            i += 1
        while i < j and not chars[j].isalpha():
            j -= 1
        if i < j:
            chars[i], chars[j] = chars[j], chars[i]
        i += 1
        j -= 1
    return ''.join(chars)


def count_mismatches(text):
    """Сколько пар символов нужно исправить, чтобы строка стала палиндромом.

    Пара — символы на позициях k и len(text) - 1 - k. Символы сравниваются
    как есть. 'абвба' → 0, 'абвга' → 1.
    """
    n = len(text)
    count = 0
    for k in range(n // 2 + 1):
        if text[k] != text[n - 1 - k]:
            count += 1
    return count
