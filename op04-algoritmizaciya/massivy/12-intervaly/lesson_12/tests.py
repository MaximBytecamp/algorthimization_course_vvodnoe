"""Публичные тесты занятия 12. Запуск: python -m pytest tests.py -v"""

import copy
import random
from itertools import combinations

import pytest

from solution import can_attend, insert_interval, merge_intervals, overlaps

DOCK = [[13, 15], [9, 12], [16, 18], [10, 11], [15, 16]]


def merge_brute(intervals):
    """Перебор по моментам времени: занятые единичные отрезки [t, t + 1) склеиваются подряд."""
    busy = set()
    for start, end in intervals:
        busy.update(range(start, end))
    blocks = []
    for t in sorted(busy):
        if blocks and t == blocks[-1][1]:
            blocks[-1][1] = t + 1
        else:
            blocks.append([t, t + 1])
    return blocks


def attend_brute(intervals):
    return not any(a[0] < b[1] and b[0] < a[1] for a, b in combinations(intervals, 2))


def random_intervals(rnd, n_max=8, t_max=20):
    out = []
    for _ in range(rnd.randint(0, n_max)):
        start = rnd.randint(0, t_max)
        out.append([start, start + rnd.randint(1, 6)])
    return out


# ---------- Границы: касание, вложение, повторы, пустой вход, входной список ----------

@pytest.mark.parametrize("a, b, want", [
    ([9, 11], [11, 12], False),
    ([9, 12], [10, 11], True),
    ([10, 11], [10, 11], True),
    ([9, 10], [12, 13], False),
], ids=["touch", "inside", "same", "apart"])
def test_overlaps_edges(a, b, want):
    assert overlaps(a, b) == want
    assert overlaps(b, a) == want


@pytest.mark.parametrize("intervals, want", [
    ([], []),
    ([[9, 12]], [[9, 12]]),
    ([[10, 11], [10, 11]], [[10, 11]]),
    ([[9, 11], [11, 12]], [[9, 12]]),
    ([[9, 12], [10, 11]], [[9, 12]]),
    ([[1, 10], [2, 3], [4, 5]], [[1, 10]]),
    ([[9, 10], [9, 12]], [[9, 12]]),
    ([[16, 18], [9, 10], [12, 13]], [[9, 10], [12, 13], [16, 18]]),
], ids=["empty", "one", "duplicate", "touch", "inside", "long_first", "same_start", "unsorted_apart"])
def test_merge_edges(intervals, want):
    assert merge_intervals(intervals) == want


@pytest.mark.parametrize("intervals", [DOCK, [[9, 11], [11, 12]]], ids=["dock", "touch"])
def test_merge_keeps_input(intervals):
    before = copy.deepcopy(intervals)
    merge_intervals(intervals)
    assert intervals == before


@pytest.mark.parametrize("intervals, want", [
    ([], True),
    ([[9, 12]], True),
    ([[10, 11], [10, 11]], False),
    ([[9, 11], [11, 12]], True),
    ([[9, 12], [10, 11]], False),
    ([[9, 11], [13, 15], [14, 16]], False),
    ([[13, 15], [9, 11]], True),
], ids=["empty", "one", "duplicate", "touch", "inside", "last_pair", "unsorted_free"])
def test_attend_edges(intervals, want):
    assert can_attend(intervals) == want


# ---------- Задача 0. Пересечение двух интервалов ----------

def test_overlaps_example():
    assert overlaps([9, 12], [10, 14]) is True
    assert overlaps([13, 15], [9, 12]) is False


# ---------- Задача 1. Объединение ----------

def test_merge_example():
    assert merge_intervals(DOCK) == [[9, 12], [13, 18]]


@pytest.mark.parametrize("intervals, want", [
    ([[1, 3], [2, 6], [8, 10], [15, 18]], [[1, 6], [8, 10], [15, 18]]),
    ([[1, 4], [4, 5]], [[1, 5]]),
], ids=["leetcode_1", "leetcode_2"])
def test_merge_leetcode(intervals, want):
    assert merge_intervals(intervals) == want


def test_merge_returns_new_lists():
    intervals = [[9, 11], [10, 12]]
    merged = merge_intervals(intervals)
    merged[0][1] = 99
    assert intervals == [[9, 11], [10, 12]]


def test_merge_matches_brute():
    rnd = random.Random(1201)
    for _ in range(500):
        intervals = random_intervals(rnd)
        assert merge_intervals(intervals) == merge_brute(intervals), intervals


# ---------- Задача 2. Встречи без конфликтов ----------

@pytest.mark.parametrize("intervals, want", [
    ([[0, 30], [5, 10], [15, 20]], False),
    ([[7, 10], [2, 4]], True),
    ([[13, 15], [9, 11], [15, 16], [11, 12]], True),
], ids=["leetcode_1", "leetcode_2", "free_day"])
def test_attend(intervals, want):
    assert can_attend(intervals) == want


def test_attend_keeps_input():
    intervals = [[13, 15], [9, 11]]
    can_attend(intervals)
    assert intervals == [[13, 15], [9, 11]]


def test_attend_matches_brute():
    rnd = random.Random(1202)
    for _ in range(500):
        intervals = random_intervals(rnd, t_max=40)
        assert can_attend(intervals) == attend_brute(intervals), intervals


# ---------- Задача 3. Вставка интервала ----------

@pytest.mark.parametrize("intervals, new, want", [
    ([[1, 3], [6, 9]], [2, 5], [[1, 5], [6, 9]]),
    ([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8], [[1, 2], [3, 10], [12, 16]]),
    ([], [5, 7], [[5, 7]]),
    ([[1, 2], [5, 6]], [3, 4], [[1, 2], [3, 4], [5, 6]]),
    ([[1, 2], [5, 6]], [2, 5], [[1, 6]]),
    ([[3, 4]], [8, 9], [[3, 4], [8, 9]]),
], ids=["leetcode_1", "leetcode_2", "empty", "between", "touch_both", "after_all"])
def test_insert(intervals, new, want):
    assert insert_interval(intervals, new) == want


def test_insert_matches_merge():
    rnd = random.Random(1203)
    for _ in range(500):
        blocks = merge_brute(random_intervals(rnd))
        start = rnd.randint(0, 25)
        new = [start, start + rnd.randint(1, 6)]
        assert insert_interval(blocks, new) == merge_brute(blocks + [new]), (blocks, new)
