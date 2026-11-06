"""Тесты к extra.py. Запуск: python -m pytest tests_extra.py -v"""
import pytest

from extra import MyHashSet, OrderedStream, UndergroundSystem


def test_hashset_basic():
    s = MyHashSet()
    s.add(1); s.add(2)
    assert s.contains(1) and not s.contains(3)
    s.add(2)
    assert s.contains(2)
    s.remove(2)
    assert not s.contains(2)


def test_hashset_collisions():
    """числа с одним остатком лежат в одной корзине"""
    s = MyHashSet(8)
    for k in (8, 16, 24):
        s.add(k)
    s.remove(16)
    assert s.contains(8) and not s.contains(16) and s.contains(24)


def test_hashset_remove_missing():
    s = MyHashSet()
    s.remove(5)
    assert not s.contains(5)


def test_stream_example():
    o = OrderedStream(5)
    assert [o.insert(3, 'c'), o.insert(1, 'a'), o.insert(2, 'b'), o.insert(5, 'e'), o.insert(4, 'd')] == \
        [[], ['a'], ['b', 'c'], [], ['d', 'e']]


def test_stream_in_order():
    o = OrderedStream(3)
    assert [o.insert(1, 'x'), o.insert(2, 'y'), o.insert(3, 'z')] == [['x'], ['y'], ['z']]


def test_stream_reverse():
    o = OrderedStream(3)
    assert [o.insert(3, 'z'), o.insert(2, 'y'), o.insert(1, 'x')] == [[], [], ['x', 'y', 'z']]


@pytest.fixture
def metro():
    u = UndergroundSystem()
    u.check_in(45, 'Leyton', 3); u.check_in(32, 'Paradise', 8); u.check_in(27, 'Leyton', 10)
    u.check_out(45, 'Waterloo', 15); u.check_out(27, 'Waterloo', 20); u.check_out(32, 'Cambridge', 22)
    return u


def test_metro_averages(metro):
    assert metro.get_average_time('Paradise', 'Cambridge') == 14.0
    assert metro.get_average_time('Leyton', 'Waterloo') == 11.0


def test_metro_new_trip(metro):
    metro.check_in(10, 'Leyton', 24); metro.check_out(10, 'Waterloo', 38)
    assert metro.get_average_time('Leyton', 'Waterloo') == 12.0


def test_metro_direction(metro):
    """поездка в обратную сторону — другой маршрут"""
    metro.check_in(1, 'Waterloo', 0); metro.check_out(1, 'Leyton', 100)
    assert metro.get_average_time('Waterloo', 'Leyton') == 100.0
    assert metro.get_average_time('Leyton', 'Waterloo') == 11.0


def test_metro_same_person_twice():
    u = UndergroundSystem()
    u.check_in(1, 'A', 0); u.check_out(1, 'B', 10)
    u.check_in(1, 'A', 20); u.check_out(1, 'B', 40)
    assert u.get_average_time('A', 'B') == 15.0
