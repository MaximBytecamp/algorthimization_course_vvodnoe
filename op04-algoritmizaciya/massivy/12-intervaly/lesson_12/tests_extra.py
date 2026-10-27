"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""

import pytest

from extra import count_ways_to_group, free_slots, poisoned_duration


@pytest.mark.parametrize("time_series, duration, want", [
    ([1, 4], 2, 4),
    ([1, 2], 2, 3),
    ([], 5, 0),
    ([1, 2, 3], 0, 0),
    ([5], 10, 10),
], ids=["leetcode_1", "leetcode_2", "empty", "zero_duration", "one"])
def test_poisoned_duration(time_series, duration, want):
    assert poisoned_duration(time_series, duration) == want


@pytest.mark.parametrize("ranges, want", [
    ([[6, 10], [5, 15]], 2),
    ([[1, 3], [10, 20], [2, 5], [4, 8]], 4),
    ([[1, 2], [3, 4]], 4),
    ([[1, 2], [2, 3]], 2),
    ([[5, 5]], 2),
], ids=["leetcode_1", "leetcode_2", "neighbours_apart", "share_point", "one"])
def test_count_ways_to_group(ranges, want):
    assert count_ways_to_group(ranges) == want


@pytest.mark.parametrize("intervals, open_time, close_time, want", [
    ([[13, 15], [9, 12], [16, 18], [10, 11], [15, 16]], 8, 20, [[8, 9], [12, 13], [18, 20]]),
    ([], 9, 18, [[9, 18]]),
    ([[9, 18]], 9, 18, []),
    ([[9, 10], [17, 18]], 9, 18, [[10, 17]]),
    ([[11, 12], [10, 11]], 10, 12, []),
], ids=["dock", "empty_day", "full_day", "edges_busy", "touching"])
def test_free_slots(intervals, open_time, close_time, want):
    assert free_slots(intervals, open_time, close_time) == want
