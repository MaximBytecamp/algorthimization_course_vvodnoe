"""Домашнее задание 19, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_19.py,
исправьте одну строку и прогоните тесты снова.
"""


def missing_numbers(nums, n):
    """Числа от 1 до n включительно, которых нет в nums, по возрастанию.

    [1, 5, 2], 5 → [3, 4].
    """
    present = set(nums)
    return [v for v in range(1, n) if v not in present]


def count_unique_emails(emails):
    """Сколько разных адресов, если регистр и пробелы по краям не важны.

    ['A@b.ru', 'a@b.ru'] → 1.
    """
    return len({e.casefold() for e in emails})


def covers(small, big):
    """Все ли разные значения small есть в big.

    [1, 2], [2, 3, 1] → True; [1, 4], [1, 2] → False.
    """
    return set(small) < set(big)
