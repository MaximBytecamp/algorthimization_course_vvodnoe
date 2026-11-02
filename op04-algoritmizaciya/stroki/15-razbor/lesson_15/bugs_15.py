"""Домашнее задание 15, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_15.py,
исправьте одну строку и прогоните тесты снова.
"""


def runs(s):
    """Серии строки списком пар [символ, длина].

    'aab' → [['a', 2], ['b', 1]], '' → [].
    """
    result = [[s[0], 0]]
    for ch in s:
        if ch == result[-1][0]:
            result[-1][1] += 1
        else:
            result.append([ch, 1])
    return result


def parse_query(query):
    """Параметры из адресной строки: 'page=2&sort=name' → {'page': '2', 'sort': 'name'}.

    Параметры разделены '&', ключ от значения отделяет первый '='.
    Значение может содержать '='. Пустые куски пропускаются, '' → {}.
    """
    params = {}
    for piece in query.split('&'):
        if piece == '':
            continue
        key, value = piece.split('=')
        params[key] = value
    return params


def expand(code):
    """Запись «длина, символ»: '3a2b' → 'aaabb'.

    Длина стоит перед каждым символом и может быть многозначной.
    """
    out = []
    i = 0
    while i < len(code):
        j = i
        while code[j].isdigit():
            j += 1
        count = int(code[j - 1])
        out.append(code[j] * count)
        i = j + 1
    return ''.join(out)
