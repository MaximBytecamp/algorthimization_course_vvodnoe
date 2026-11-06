"""Дополнительные задачи занятия 20. Проверка: python -m pytest tests_extra.py -v"""


class MyHashSet:
    """Множество целых чисел без set и dict, LeetCode 705.

    add(key), remove(key), contains(key). Внутри — список корзин: число попадает
    в корзину key % len(buckets), как ключ в ячейку в главе 0.3.
    """

    def __init__(self, buckets=769):
        raise NotImplementedError

    def add(self, key):
        raise NotImplementedError

    def remove(self, key):
        raise NotImplementedError

    def contains(self, key):
        raise NotImplementedError


class OrderedStream:
    """Упорядоченный поток, LeetCode 1656.

    Пары (id, value) с id от 1 до n приходят в любом порядке. insert возвращает
    самый длинный кусок значений, которые теперь можно выдать подряд от указателя.
    """

    def __init__(self, n):
        raise NotImplementedError

    def insert(self, id_key, value):
        raise NotImplementedError


class UndergroundSystem:
    """Среднее время поездки, LeetCode 1396.

    check_in(id, station, t), check_out(id, station, t),
    get_average_time(start, end) — среднее по всем завершённым поездкам start → end.
    """

    def __init__(self):
        raise NotImplementedError

    def check_in(self, pid, station, t):
        raise NotImplementedError

    def check_out(self, pid, station, t):
        raise NotImplementedError

    def get_average_time(self, start, end):
        raise NotImplementedError
