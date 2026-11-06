"""Занятие 20. Ассоциативные примитивы: кэш и индекс.

Функция и три класса с пустыми телами. Контракты — глава 20.1, §6.
Проверка: python -m pytest tests.py -v
"""
from collections import OrderedDict


def build_index(records, field):
    """Индекс «значение поля → запись». Повтор ключа — ValueError.

    Время O(n), память O(n), поиск по индексу — O(1) в среднем.
    """
    raise NotImplementedError


class CountingCache:
    """Неограниченный кэш над медленной функцией load(key).

    get(key) возвращает значение; при промахе вызывает load и запоминает
    результат. Поля hits и misses считают попадания и промахи.
    """

    def __init__(self, load):
        raise NotImplementedError

    def get(self, key):
        raise NotImplementedError


class LRUCache:
    """Ограниченный кэш с вытеснением LRU на OrderedDict, LeetCode 146.

    LRUCache(capacity): capacity >= 1, иначе ValueError.
    get(key): значение или None; при попадании ключ становится свежим,
    промах кэш не меняет.
    put(key, value): записать или обновить, ключ становится свежим; если
    ключей стало больше capacity, вытеснить самый давний. Обновление
    существующего ключа никого не вытесняет.
    len(cache) — число ключей. get и put — O(1) в среднем.
    """

    def __init__(self, capacity):
        raise NotImplementedError

    def get(self, key):
        raise NotImplementedError

    def put(self, key, value):
        raise NotImplementedError

    def __len__(self):
        raise NotImplementedError


class LRUCacheLinked:
    """Расширение: тот же контракт на словаре и двусвязном списке, без OrderedDict.

    keys() — ключи от самого давнего к последнему.
    """

    def __init__(self, capacity):
        raise NotImplementedError

    def get(self, key):
        raise NotImplementedError

    def put(self, key, value):
        raise NotImplementedError

    def __len__(self):
        raise NotImplementedError

    def keys(self):
        raise NotImplementedError
