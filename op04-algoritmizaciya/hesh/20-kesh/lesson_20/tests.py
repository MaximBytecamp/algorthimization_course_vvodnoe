"""Публичные тесты занятия 20. Запуск: python -m pytest tests.py -v"""

import random
import time

import pytest

from solution import CountingCache, LRUCache, LRUCacheLinked, build_index

GOODS = [{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}, {'code': 'шайба', 'price': 2}]


# ---------- Задача 1. Индекс ----------

def test_index_lookup():
    idx = build_index(GOODS, 'code')
    assert idx['гайка'] == {'code': 'гайка', 'price': 5} and len(idx) == 3


def test_index_other_field():
    assert build_index(GOODS, 'price')[2]['code'] == 'шайба'


def test_index_duplicate():
    with pytest.raises(ValueError):
        build_index(GOODS + [{'code': 'гайка', 'price': 6}], 'code')


def test_index_same_record():
    assert build_index(GOODS, 'code')['болт'] is GOODS[0]


def test_index_empty():
    assert build_index([], 'code') == {}


def test_index_long():
    recs = [{'id': i} for i in range(100_000)]
    start = time.perf_counter()
    idx = build_index(recs, 'id')
    assert idx[77_777]['id'] == 77_777 and time.perf_counter() - start < 1.0


# ---------- Задача 2. Кэш с подсчётом ----------

def test_counting_hits_misses():
    c = CountingCache(lambda code: len(code) * 10)
    for code in ['болт', 'гайка', 'болт', 'болт', 'шайба', 'гайка']:
        c.get(code)
    assert (c.hits, c.misses) == (3, 3)


def test_counting_values():
    c = CountingCache(lambda code: len(code) * 10)
    assert [c.get(x) for x in ['болт', 'болт', 'ёж']] == [40, 40, 20]


def test_counting_load_once():
    calls = []
    c = CountingCache(lambda k: calls.append(k) or k.upper())
    c.get('a'); c.get('a'); c.get('b')
    assert calls == ['a', 'b']


@pytest.mark.parametrize('value', [None, 0, '', False])
def test_counting_falsy_values(value):
    """значения None, 0, '' тоже кэшируются"""
    calls = []
    c = CountingCache(lambda k: calls.append(k) or value)
    c.get('x'); c.get('x')
    assert calls == ['x'] and (c.hits, c.misses) == (1, 1)


# ---------- Задачи 3 и 4. LRU: OrderedDict и связный список ----------

LRU_CLASSES = [LRUCache, LRUCacheLinked]


def model_run(cap, ops):
    order, vals, out = [], {}, []
    for op in ops:
        k = op[1]
        if op[0] == 'get':
            if k in vals:
                order.remove(k); order.append(k); out.append(vals[k])
            else:
                out.append(None)
        else:
            if k in vals:
                order.remove(k)
            order.append(k); vals[k] = op[2]
            if len(order) > cap:
                del vals[order.pop(0)]
    return out, order


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_leetcode(cls):
    c = cls(2)
    c.put(1, 1); c.put(2, 2)
    assert c.get(1) == 1
    c.put(3, 3)
    assert c.get(2) is None
    c.put(4, 4)
    assert c.get(1) is None and c.get(3) == 3 and c.get(4) == 4


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_update_is_use(cls):
    c = cls(2)
    c.put('a', 1); c.put('b', 2); c.put('a', 10); c.put('c', 3)
    assert c.get('a') == 10 and c.get('b') is None


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_update_no_evict(cls):
    c = cls(2)
    c.put('a', 1); c.put('b', 2); c.put('b', 20)
    assert len(c) == 2 and c.get('a') == 1 and c.get('b') == 20


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_get_is_use(cls):
    c = cls(2)
    c.put('a', 1); c.put('b', 2); c.get('a'); c.put('c', 3)
    assert c.get('a') == 1 and c.get('b') is None


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_miss_no_change(cls):
    c = cls(2)
    c.put('a', 1)
    assert c.get('zzz') is None and len(c) == 1


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_capacity_one(cls):
    c = cls(1)
    c.put('a', 1); c.put('b', 2)
    assert c.get('a') is None and c.get('b') == 2 and len(c) == 1


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_capacity_zero(cls):
    with pytest.raises(ValueError):
        cls(0)


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_falsy_value(cls):
    c = cls(2)
    c.put('a', 0)
    assert c.get('a') == 0


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_matches_model(cls):
    rnd = random.Random(146)
    for _ in range(500):
        cap = rnd.randint(1, 4)
        ops = [('get', rnd.randint(0, 5)) if rnd.random() < 0.5 else ('put', rnd.randint(0, 5), rnd.randint(0, 9))
               for _ in range(rnd.randint(0, 20))]
        c, out = cls(cap), []
        for op in ops:
            if op[0] == 'get':
                out.append(c.get(op[1]))
            else:
                c.put(op[1], op[2])
        want, order = model_run(cap, ops)
        assert out == want, (cap, ops)
        assert len(c) == len(order)


def test_linked_keys_order():
    c = LRUCacheLinked(3)
    c.put('a', 1); c.put('b', 2); c.put('c', 3); c.get('a'); c.put('d', 4)
    assert c.keys() == ['c', 'a', 'd']


@pytest.mark.parametrize('cls', LRU_CLASSES)
def test_lru_fast(cls):
    """200 000 операций при ёмкости 10 000 — O(1) на операцию"""
    rnd = random.Random(1)
    c = cls(10_000)
    start = time.perf_counter()
    for _ in range(200_000):
        k = rnd.randrange(30_000)
        if rnd.random() < 0.7:
            c.get(k)
        else:
            c.put(k, k)
    assert time.perf_counter() - start < 2.0
