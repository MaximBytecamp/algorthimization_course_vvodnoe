"""Домашнее задание 13, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_13.py,
исправьте одну строку и прогоните тесты снова.
"""


def is_pangram_ru(text):
    """True, если в тексте есть все 33 буквы русского алфавита.

    Регистр не важен, символы кроме букв не учитываются.
    """
    alphabet = {chr(code) for code in range(ord('а'), ord('я') + 1)}
    seen = {ch for ch in text.casefold() if ch.isalpha()}
    return alphabet <= seen


def top_letter(text):
    """Самая частая буква текста без учёта регистра.

    Символы кроме букв не учитываются. Если у нескольких букв частота
    одинаковая, ответ — та, что встретилась в тексте раньше. Букв нет — ''.
    """
    count = {}
    for ch in text.casefold():
        if ch.isalpha():
            count[ch] = count.get(ch, 0) + 1
    best, best_count = '', 0
    for ch, c in count.items():
        if c >= best_count:
            best, best_count = ch, c
    return best


def all_unique(text):
    """True, если ни одна буква не встречается в тексте дважды.

    Регистр не важен: 'А' и 'а' — одна буква. Символы кроме букв
    не учитываются.
    """
    found = [ch for ch in text if ch.isalpha()]
    return len(set(found)) == len(found)
