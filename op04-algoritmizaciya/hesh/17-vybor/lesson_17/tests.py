"""Публичные тесты занятия 17. Запуск: python -m pytest tests.py -v"""

import random

import pytest

from solution import contains_nearby_duplicate, duplicate_clients, has_duplicate, two_sum, unique_in_order


def has_duplicate_brute(items):
    return any(items[i] == items[j] for i in range(len(items)) for j in range(i + 1, len(items)))


def two_sum_brute(nums, target):
    for j in range(len(nums)):
        for i in range(j):
            if nums[i] + nums[j] == target:
                return (i, j)
    return None


def nearby_brute(nums, k):
    return any(nums[i] == nums[j] for i in range(len(nums)) for j in range(i + 1, min(len(nums), i + k + 1)))


# ---------- Задача 1. Повторы ----------

DUP_CASES = [
    ([4, 1, 7, 1, 3], True),
    ([4, 1, 7], False),
    ([], False),
    ([5], False),
    ([1, 2], False),
    ([7, 7], True),
    (['болт', 'гайка', 'болт'], True),
    (['Болт', 'болт'], False),
    ([0, -0], True),
    ([1, 1.0], True),
]


@pytest.mark.parametrize('items, want', DUP_CASES)
def test_duplicate_edges(items, want):
    assert has_duplicate(items) is want


def test_duplicate_stops_early():
    """проход останавливается на первом повторе"""
    def items():
        yield 1
        yield 1
        raise AssertionError('функция пошла дальше первого повтора')
    assert has_duplicate(items()) is True


def test_duplicate_matches_brute():
    rnd = random.Random(217)
    for _ in range(500):
        a = [rnd.randint(-9, 9) for _ in range(rnd.randint(0, 10))]
        assert has_duplicate(a) == has_duplicate_brute(a), a


def test_duplicate_long():
    """10⁵ разных чисел — решение O(n) укладывается в секунду"""
    assert has_duplicate(list(range(100_000))) is False


# ---------- Изменение условия: порядок первого появления ----------

ORDER_CASES = [
    ([4, 1, 4, 7, 1], [4, 1, 7]),
    ([], []),
    ([3, 3, 3], [3]),
    (['шайба', 'болт', 'шайба', 'гайка'], ['шайба', 'болт', 'гайка']),
    ([2, 1], [2, 1]),
]


@pytest.mark.parametrize('items, want', ORDER_CASES)
def test_order_edges(items, want):
    assert unique_in_order(items) == want


def test_order_input_unchanged():
    items = [4, 1, 4, 7, 1]
    unique_in_order(items)
    assert items == [4, 1, 4, 7, 1]


def test_order_matches_fromkeys():
    rnd = random.Random(170)
    for _ in range(300):
        a = [rnd.choice('абвгд') for _ in range(rnd.randint(0, 10))]
        assert unique_in_order(a) == list(dict.fromkeys(a)), a


# ---------- Задача 2. Пара с суммой ----------

SUM_CASES = [
    ([3, 8, 4, 5], 9, (2, 3)),
    ([2, 7, 11, 15], 9, (0, 1)),
    ([3, 5], 6, None),
    ([3, 3], 6, (0, 1)),
    ([], 1, None),
    ([5], 10, None),
    ([1, 4, 2, 3], 5, (0, 1)),
    ([2, 2, 4], 6, (0, 2)),
    ([-2, 7], 5, (0, 1)),
    ([0, 4, 0], 0, (0, 2)),
    ([1, 2, 4], 100, None),
]


@pytest.mark.parametrize('nums, target, want', SUM_CASES)
def test_sum_edges(nums, target, want):
    assert two_sum(nums, target) == want


def test_sum_matches_brute():
    rnd = random.Random(1)
    for _ in range(500):
        a = [rnd.randint(-5, 5) for _ in range(rnd.randint(0, 10))]
        t = rnd.randint(-8, 8)
        assert two_sum(a, t) == two_sum_brute(a, t), (a, t)


def test_sum_long():
    """10⁵ чётных чисел и нечётный target — пары нет, решение O(n)"""
    assert two_sum(list(range(0, 200_000, 2)), -1) is None


# ---------- Задача 3. Клиенты с одинаковой почтой ----------

CLIENTS = [(1, 'Ivan@Mail.ru'), (2, ' ivan@mail.ru'), (3, ''), (4, 'olga@mail.ru'), (5, '  ')]


def test_clients_example():
    assert duplicate_clients(CLIENTS) == ({'ivan@mail.ru': [1, 2]}, [3, 5])


def test_clients_normalized_key():
    dups, _ = duplicate_clients([(1, 'A@B.RU'), (2, 'a@b.ru  '), (3, ' A@b.ru')])
    assert dups == {'a@b.ru': [1, 2, 3]}


def test_clients_empty_key():
    dups, no_email = duplicate_clients([(7, ''), (8, '   '), (9, '\t')])
    assert dups == {}
    assert no_email == [7, 8, 9]


def test_clients_single_not_duplicate():
    assert duplicate_clients([(1, 'a@b.ru'), (2, 'c@d.ru')]) == ({}, [])


def test_clients_order():
    dups, _ = duplicate_clients([(5, 'z@z'), (2, 'a@a'), (9, 'Z@z'), (1, 'a@a'), (3, 'z@z')])
    assert list(dups) == ['z@z', 'a@a']
    assert dups['z@z'] == [5, 9, 3]


def test_clients_empty_input():
    assert duplicate_clients([]) == ({}, [])


def test_clients_input_unchanged():
    clients = list(CLIENTS)
    duplicate_clients(clients)
    assert clients == CLIENTS


# ---------- Задача 4. Повтор на расстоянии не больше k ----------

NEAR_CASES = [
    ([1, 2, 3, 1], 3, True),
    ([1, 0, 1, 1], 1, True),
    ([1, 2, 3, 1, 2, 3], 2, False),
    ([], 0, False),
    ([1, 1], 0, False),
    ([5, 5], 1, True),
    ([1, 2, 1, 9, 9, 9, 1], 2, True),
]


@pytest.mark.parametrize('nums, k, want', NEAR_CASES)
def test_nearby_edges(nums, k, want):
    assert contains_nearby_duplicate(nums, k) is want


def test_nearby_matches_brute():
    rnd = random.Random(219)
    for _ in range(500):
        a = [rnd.randint(0, 5) for _ in range(rnd.randint(0, 10))]
        k = rnd.randint(0, 4)
        assert contains_nearby_duplicate(a, k) == nearby_brute(a, k), (a, k)
