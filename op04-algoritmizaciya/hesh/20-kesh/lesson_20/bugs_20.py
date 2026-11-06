"""Домашнее задание 20, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_20.py,
исправьте одну строку и прогоните тесты снова.
"""


def first_position(items):
    """Индекс «элемент → позиция его первого появления».

    ['a', 'b'] → {'a': 0, 'b': 1}.
    """
    index = {}
    for i, x in enumerate(items):
        index[x] = i
    return index


def hit_rate(results):
    """Доля попаданий: results — список True (попадание) и False (промах).

    [True, False, True, True] → 0.75. Пустой список → 0.0.
    """
    return sum(results) / len(results)


def price_or_default(cache, code, default):
    """Цена из кэша-словаря или default, если товара в кэше нет.

    {'болт': 12}, 'болт', -1 → 12; {'болт': 12}, 'винт', -1 → -1.
    """
    return cache.get(code) or default
