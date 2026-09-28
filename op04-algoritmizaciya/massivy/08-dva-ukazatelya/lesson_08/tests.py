"""Публичные тесты занятия 8. Запуск: python -m pytest tests.py -v"""

import pytest

from solution import compress, dedup_sorted, move_zeros, pair_sum, pair_sum_brute

PAIR_FUNCS = [pair_sum_brute, pair_sum]


def check_pair(prices, target, answer):
    """Ответ — пара индексов i < j с нужной суммой."""
    assert answer is not None
    i, j = answer
    assert 0 <= i < j < len(prices)
    assert prices[i] + prices[j] == target


# ---------- Задача 1. Пара с заданной суммой ----------

@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_example(func):
    prices = [300, 450, 700, 900, 1200, 1500]
    check_pair(prices, 1600, func(prices, 1600))


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_first_and_last(func):
    assert func([100, 200, 300, 400], 500) in {(0, 3), (1, 2)}


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_neighbours_in_the_middle(func):
    assert func([100, 200, 300, 400, 1000], 500) in {(0, 3), (1, 2)}


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_not_found(func):
    assert func([300, 450, 700, 900], 100) is None


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_empty(func):
    assert func([], 500) is None


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_single_item_is_not_a_pair(func):
    assert func([250], 500) is None


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_equal_prices(func):
    assert func([250, 250], 500) == (0, 1)


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_same_item_twice_is_forbidden(func):
    assert func([100, 250, 400], 500) == (0, 2)


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_negative_numbers(func):
    check_pair([-7, -3, 0, 2, 9], -1, func([-7, -3, 0, 2, 9], -1))


@pytest.mark.parametrize("func", PAIR_FUNCS)
def test_pair_does_not_change_input(func):
    prices = [300, 450, 700, 900]
    func(prices, 1150)
    assert prices == [300, 450, 700, 900]


def test_pair_answers_match_on_many_inputs():
    import random
    rnd = random.Random(8)
    for _ in range(300):
        prices = sorted(rnd.randint(-50, 50) for _ in range(rnd.randint(0, 12)))
        target = rnd.randint(-100, 100)
        fast = pair_sum(prices, target)
        slow = pair_sum_brute(prices, target)
        assert (fast is None) == (slow is None)
        if fast is not None:
            check_pair(prices, target, fast)


# ---------- Задача 2. Удаление дубликатов на месте ----------

def test_dedup_example():
    ids = [101, 101, 102, 105, 105, 105, 110]
    same = ids
    assert dedup_sorted(ids) == 4
    assert ids == [101, 102, 105, 110]
    assert same is ids


def test_dedup_empty():
    ids = []
    assert dedup_sorted(ids) == 0
    assert ids == []


def test_dedup_single():
    ids = [7]
    assert dedup_sorted(ids) == 1
    assert ids == [7]


def test_dedup_all_equal():
    ids = [5, 5, 5, 5]
    assert dedup_sorted(ids) == 1
    assert ids == [5]


def test_dedup_no_duplicates():
    ids = [1, 2, 3, 4]
    assert dedup_sorted(ids) == 4
    assert ids == [1, 2, 3, 4]


def test_dedup_duplicates_at_the_end():
    ids = [1, 2, 3, 3, 3]
    assert dedup_sorted(ids) == 3
    assert ids == [1, 2, 3]


# ---------- Задача 3. Сжатие последовательности ----------

def test_compress_example():
    chars = list("aaabccddd")
    same = chars
    assert compress(chars) == 7
    assert chars == ["a", "3", "b", "c", "2", "d", "3"]
    assert same is chars


def test_compress_exact_result():
    chars = list("aabccc")
    assert compress(chars) == 5
    assert chars == ["a", "2", "b", "c", "3"]


def test_compress_single_letters_stay():
    chars = list("abc")
    assert compress(chars) == 3
    assert chars == ["a", "b", "c"]


def test_compress_empty():
    chars = []
    assert compress(chars) == 0
    assert chars == []


def test_compress_one_long_run():
    chars = ["x"] * 12
    assert compress(chars) == 3
    assert chars == ["x", "1", "2"]


def test_compress_same_letter_in_two_runs():
    chars = list("aabaa")
    assert compress(chars) == 5
    assert chars == ["a", "2", "b", "a", "2"]


# ---------- Расширение. Нули в конец ----------

def test_zeros_example():
    nums = [0, 4, 0, 0, 7, 2]
    move_zeros(nums)
    assert nums == [4, 7, 2, 0, 0, 0]


def test_zeros_none():
    nums = [3, 1, 2]
    move_zeros(nums)
    assert nums == [3, 1, 2]


def test_zeros_all():
    nums = [0, 0, 0]
    move_zeros(nums)
    assert nums == [0, 0, 0]


def test_zeros_returns_none_and_keeps_object():
    nums = [0, 1]
    same = nums
    assert move_zeros(nums) is None
    assert same is nums and nums == [1, 0]
