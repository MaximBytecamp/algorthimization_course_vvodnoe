"""Занятие 17. Hash map и set: выбор структуры.

Пять функций с пустыми телами. Контракты — глава 17.1, §5.
Проверка: python -m pytest tests.py -v
"""


def has_duplicate(items):
    """Есть ли в списке повтор, LeetCode 217.

    Элементы хешируемые. Пустой список и список из одного элемента — False.
    Проход останавливается на первом повторе.
    Время O(n) в среднем, память O(n).
    """
    raise NotImplementedError


def unique_in_order(items):
    """Элементы без повторов в порядке первого появления.

    [4, 1, 4, 7, 1] → [4, 1, 7]. Исходный список не меняется.
    Время O(n) в среднем, память O(n).
    """
    raise NotImplementedError


def two_sum(nums, target):
    """Индексы пары с суммой target, LeetCode 1.

    Возвращает кортеж (i, j), i < j, nums[i] + nums[j] == target.
    Один элемент дважды не берётся. Из нескольких пар — с наименьшим j,
    для него — с наименьшим i. Пары нет — None.
    Время O(n) в среднем, память O(n).
    """
    raise NotImplementedError


def duplicate_clients(clients):
    """Клиенты с одинаковой почтой после нормализации.

    clients — список пар (id, email). Ключ — email.strip().casefold().
    Пустая почта ключом не считается: такие клиенты не дубликаты друг
    друга, их id возвращаются отдельным списком.
    Возвращает (groups, no_email): groups — словарь «ключ → список id»
    только для ключей с двумя и более id, в порядке первого появления ключа.
    Время O(n) в среднем, память O(n).
    """
    raise NotImplementedError


def contains_nearby_duplicate(nums, k):
    """Есть ли два равных числа на расстоянии не больше k, LeetCode 219.

    True, если есть i != j, nums[i] == nums[j] и abs(i - j) <= k.
    k >= 0. Время O(n) в среднем, память O(n).
    """
    raise NotImplementedError
