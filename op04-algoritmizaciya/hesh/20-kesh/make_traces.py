"""Строит пошаговые прогоны для глав модуля 20 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 20. Кэш — класс, а движок
прогоняет одну функцию, поэтому прогоны идут по функциям-«сценариям»,
в которых те же действия записаны одним циклом.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import builtins
import copy
import importlib.util
import json
import pathlib
import sys
import types
from collections import OrderedDict

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'engine', HERE.parent.parent / 'massivy' / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.copy = types.SimpleNamespace(copy=copy.deepcopy, deepcopy=copy.deepcopy)


def load(key):
    """Медленная загрузка из базы — в прогоне это цена товара по коду."""
    return len(key) * 10


builtins.load = load
builtins.OrderedDict = OrderedDict
from bisect import bisect_right
builtins.bisect_right = bisect_right

SOURCES = {}

# Глава 20.2.
SOURCES['build_index'] = '''
def build_index(records, field):
    index = {}
    for rec in records:
        key = rec[field]
        if key in index:
            raise ValueError(f'повтор ключа {key!r}')
        index[key] = rec
    return index
'''
SOURCES['serve'] = '''
def serve(requests):
    cache = {}
    hits = misses = 0
    for key in requests:
        if key in cache:
            hits += 1
        else:
            misses += 1
            cache[key] = load(key)
    return hits, misses
'''

# Глава 20.3.
SOURCES['lru_run'] = '''
def lru_run(capacity, ops):
    cache = OrderedDict()
    out = []
    for op, key in ops:
        if op == 'get':
            if key in cache:
                cache.move_to_end(key)
                out.append(cache[key])
            else:
                out.append(None)
        else:
            if key in cache:
                cache.move_to_end(key)
            cache[key] = load(key)
            if len(cache) > capacity:
                cache.popitem(last=False)
    return out
'''
SOURCES['bug_no_move'] = SOURCES['lru_run'].replace(
    "            if key in cache:\n                cache.move_to_end(key)\n                out.append(cache[key])",
    "            if key in cache:\n                out.append(cache[key])")
SOURCES['bug_put_no_move'] = SOURCES['lru_run'].replace(
    "            if key in cache:\n                cache.move_to_end(key)\n            cache[key] = load(key)",
    "            cache[key] = load(key)")
SOURCES['bug_evict_first'] = SOURCES['lru_run'].replace(
    "            if key in cache:\n                cache.move_to_end(key)\n            cache[key] = load(key)\n            if len(cache) > capacity:\n                cache.popitem(last=False)",
    "            if len(cache) >= capacity:\n                cache.popitem(last=False)\n            cache[key] = load(key)")

# Глава 20.6: задачи тренажёра — классы LeetCode записаны функцией над списком операций.
SOURCES['lru_ops'] = '''
def lru_ops(capacity, ops):
    cache = OrderedDict()
    out = []
    for op in ops:
        if op[0] == 'get':
            key = op[1]
            if key in cache:
                cache.move_to_end(key)
                out.append(cache[key])
            else:
                out.append(-1)
        else:
            key, value = op[1], op[2]
            if key in cache:
                cache.move_to_end(key)
            cache[key] = value
            if len(cache) > capacity:
                cache.popitem(last=False)
    return out
'''
SOURCES['find_prices'] = '''
def find_prices(records, queries):
    index = {}
    for rec in records:
        index[rec['code']] = rec['price']
    out = []
    for code in queries:
        out.append(index.get(code))
    return out
'''
SOURCES['hashmap_ops'] = '''
def hashmap_ops(ops):
    buckets = [[] for _ in range(8)]
    out = []
    for op in ops:
        key = op[1]
        bucket = buckets[key % 8]
        pos = next((i for i, (k, v) in enumerate(bucket) if k == key), -1)
        if op[0] == 'put':
            if pos >= 0:
                bucket[pos] = (key, op[2])
            else:
                bucket.append((key, op[2]))
        elif op[0] == 'get':
            out.append(bucket[pos][1] if pos >= 0 else -1)
        elif pos >= 0:
            bucket.pop(pos)
    return out
'''
SOURCES['timemap_ops'] = '''
def timemap_ops(ops):
    store = {}
    out = []
    for op in ops:
        if op[0] == 'set':
            key, value, t = op[1], op[2], op[3]
            store.setdefault(key, []).append((t, value))
        else:
            key, t = op[1], op[2]
            history = store.get(key, [])
            i = bisect_right(history, (t, chr(0x10FFFF)))
            out.append(history[i - 1][1] if i else '')
    return out
'''
SOURCES['freq_tracker_ops'] = '''
def freq_tracker_ops(ops):
    count = {}
    freq_of = {}
    out = []
    for op, x in ops:
        if op == 'add':
            c = count.get(x, 0)
            freq_of[c] = freq_of.get(c, 0) - 1
            count[x] = c + 1
            freq_of[c + 1] = freq_of.get(c + 1, 0) + 1
        elif op == 'delete':
            c = count.get(x, 0)
            if c > 0:
                freq_of[c] -= 1
                count[x] = c - 1
                freq_of[c - 1] = freq_of.get(c - 1, 0) + 1
        else:
            out.append(freq_of.get(x, 0) > 0)
    return out
'''
SOURCES['auth_ops'] = '''
def auth_ops(ttl, ops):
    expires = {}
    out = []
    for op in ops:
        if op[0] == 'generate':
            token, t = op[1], op[2]
            expires[token] = t + ttl
        elif op[0] == 'renew':
            token, t = op[1], op[2]
            if expires.get(token, 0) > t:
                expires[token] = t + ttl
        else:
            t = op[1]
            out.append(sum(1 for e in expires.values() if e > t))
    return out
'''
SOURCES['shorten_all'] = '''
def shorten_all(urls):
    code_of = {}
    url_of = {}
    out = []
    for url in urls:
        if url not in code_of:
            code = 'u' + str(len(code_of))
            code_of[url] = code
            url_of[code] = url
        code = code_of[url]
        out.append((code, url_of[code]))
    return out
'''
MOCK_KEYS = {'lru_ops', 'find_prices', 'hashmap_ops', 'timemap_ops', 'freq_tracker_ops', 'auth_ops', 'shorten_all'}


def mock_caption(line, fr, nxt):
    """Подпись кадра тренажёра: строка и переменные, которые она изменила."""
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if fr['ev'] == 'exc':
        return f"Ошибка: {fr['err']}."
    said = f"Строка {fr['ln']}: {line}"
    for word in ('if ', 'elif ', 'while '):
        if line.startswith(word) and line.endswith(':'):
            cond = line[len(word):-1]
            try:
                ok = eval(cond, {}, dict(fr['raw']))
            except Exception:
                break
            return f"Проверка {cond}: {'да' if ok else 'нет'}."
    if line.startswith('for ') and nxt is not None:
        if nxt['ln'] == fr['ln'] + 1:
            var = line[4:line.index(' in ')]
            names = [v.strip() for v in var.split(',')]
            return 'Следующий шаг цикла: ' + ', '.join(f"{v} = {nxt['vars'].get(v)}" for v in names) + '.'
        return 'Цикл закончен.'
    if nxt is None:
        return said
    changed = [f"{k} = {v}" for k, v in nxt['vars'].items() if fr['vars'].get(k) != v]
    return said + (' → ' + ', '.join(changed) if changed else '') + '.'


def q(v):
    return repr(v)


def ok(d):
    return '[' + ', '.join(repr(k) for k in d) + ']' if d else '[]'


def caption(line, fr, nxt, is_bug, key=''):
    """key — имя исходника прогона: подписи ошибочных версий отличаются."""
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt)
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if fr['ev'] == 'exc':
        return f"Ошибка {fr['err']}: два товара с одним ключом, индекс не может выбрать, какой из них вернуть."
    # 20.2: индекс
    if line == 'index = {}':
        return "index — словарь «ключ → запись». Строится один раз, дальше запись по ключу находится в среднем за O(1)."
    if line == 'for rec in records:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующая запись: {q(nxt['raw']['rec'])}."
        return "Записи пройдены, индекс построен."
    if line == 'key = rec[field]':
        return f"Ключ — поле {q(g('field'))}: {q(g('rec')[g('field')])}."
    if line == 'if key in index:':
        return (f"Ключ {q(g('key'))} уже есть в индексе." if g('key') in g('index') else f"Ключа {q(g('key'))} в индексе нет.")
    if line == "raise ValueError(f'повтор ключа {key!r}')":
        return f"Повтор ключа {q(g('key'))}: контракт требует ошибку, а не молчаливую замену."
    if line == 'index[key] = rec':
        return f"index[{q(g('key'))}] = запись. Ключей в индексе: {len(g('index')) + 1}."
    if line == 'return index':
        return "Ответ — индекс."
    # 20.2: кэш с подсчётом
    if line == 'cache = {}':
        return "cache — словарь «ключ → значение». Пока пустой: первое же обращение будет промахом."
    if line == 'hits = misses = 0':
        return "Счётчики попаданий и промахов."
    if line == 'for key in requests:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Запрос: {q(nxt['raw']['key'])}."
        return f"Запросы обработаны: попаданий {g('hits')}, промахов {g('misses')}."
    if line == 'if key in cache:' and 'hits' in fr['raw']:
        return (f"{q(g('key'))} в кэше: попадание." if g('key') in g('cache') else f"{q(g('key'))} в кэше нет: промах.")
    if line == 'hits += 1':
        return f"Попаданий: {g('hits') + 1}. Медленная загрузка не нужна."
    if line == 'misses += 1':
        return f"Промахов: {g('misses') + 1}."
    if line == 'cache[key] = load(key)':
        if 'hits' in fr['raw']:
            return f"Медленная загрузка load({q(g('key'))}) = {load(g('key'))}, результат — в кэш."
        return f"Запись: cache[{q(g('key'))}] = load({q(g('key'))}) = {load(g('key'))}."
    if line == 'return hits, misses':
        return "Ответ — попадания и промахи."
    # 20.3: LRU
    if line == 'cache = OrderedDict()':
        return f"cache — OrderedDict: слева ключи, к которым давно не обращались, справа — последние. Ёмкость {g('capacity')}."
    if line == 'out = []':
        return "out — ответы на get по порядку: значение или None при промахе."
    if line == 'for op, key in ops:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Операция: {nxt['raw']['op']} {q(nxt['raw']['key'])}. Кэш: {ok(g('cache'))}."
        return f"Операции выполнены. Кэш: {ok(g('cache'))}."
    if line == "if op == 'get':":
        return "Чтение." if g('op') == 'get' else "Запись."
    if line == 'if key in cache:':
        return (f"{q(g('key'))} в кэше." if g('key') in g('cache') else f"{q(g('key'))} в кэше нет.")
    if line == 'cache.move_to_end(key)':
        c = list(g('cache')); c.remove(g('key')); c.append(g('key'))
        return f"move_to_end: {q(g('key'))} — в конец, теперь он последний использованный. Кэш: {ok(c)}."
    if line == 'out.append(cache[key])':
        note = ''
        if key == 'bug_no_move':
            note = ' Ключ не перенесён в конец: обращение не учтено, порядок остался порядком записи.'
        return f"Попадание: ответ {q(g('cache')[g('key')])}.{note}"
    if line == 'out.append(None)':
        return "Промах: ответ None. Кэш не меняется."
    if line == 'if len(cache) > capacity:':
        n = len(g('cache'))
        return f"В кэше {n} при ёмкости {g('capacity')}: " + ("лишний ключ надо вытеснить." if n > g('capacity') else "место есть.")
    if line == 'if len(cache) >= capacity:':
        n = len(g('cache'))
        extra = ' Но ключ уже в кэше, и запись его только обновит — вытеснять никого не нужно.' if g('key') in g('cache') and n >= g('capacity') else ''
        return f"В кэше {n} при ёмкости {g('capacity')}: " + ("версия вытесняет заранее." if n >= g('capacity') else "место есть.") + extra
    if line == 'cache.popitem(last=False)':
        first = next(iter(g('cache')))
        if key == 'bug_put_no_move':
            return (f"popitem(last=False): вытеснен {q(first)}, хотя его только что записали. Присваивание "
                    f"существующему ключу OrderedDict не сдвигает его в конец, а move_to_end в put нет.")
        return f"popitem(last=False): вытеснен {q(first)} — к нему дольше всех не обращались."
    if line == 'return out':
        return "Ответы на все get."
    return f"Выполняется строка {fr['ln']}."


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))



def run(key, func_name, args, arr_name, ptrs):
    t = engine.run_trace(key, func_name, args, arr_name, ptrs)
    for fr in t['frames']:
        a = fr['arr']
        if a and isinstance(a[0], dict):
            fr['arr'] = [r['code'] for r in a]
        elif a and isinstance(a[0], tuple):
            fr['arr'] = [' '.join(str(x) for x in t) for t in a]
    return t


GOODS = [{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}, {'code': 'шайба', 'price': 2}]
OPS = [('put', 'болт'), ('put', 'гайка'), ('get', 'болт'), ('put', 'шайба'), ('get', 'гайка'), ('get', 'болт')]
TRACES = {
    'index': ('build_index', 'build_index', (GOODS, 'code'), 'records', []),
    'index_dup': ('build_index', 'build_index', (GOODS + [{'code': 'гайка', 'price': 6}], 'code'), 'records', []),
    'serve': ('serve', 'serve', (['болт', 'гайка', 'болт', 'болт', 'шайба', 'гайка'],), 'requests', []),
    'lru': ('lru_run', 'lru_run', (2, OPS), 'ops', []),
    'bug_no_move': ('bug_no_move', 'lru_run', (2, OPS), 'ops', []),
    'bug_put_no_move': ('bug_put_no_move', 'lru_run', (2, [('put', 'болт'), ('put', 'гайка'), ('put', 'болт'), ('put', 'шайба'), ('get', 'болт')]), 'ops', []),
    'fix_put_no_move': ('lru_run', 'lru_run', (2, [('put', 'болт'), ('put', 'гайка'), ('put', 'болт'), ('put', 'шайба'), ('get', 'болт')]), 'ops', []),
    'bug_evict_first': ('bug_evict_first', 'lru_run', (2, [('put', 'болт'), ('put', 'гайка'), ('put', 'гайка'), ('get', 'болт')]), 'ops', []),
    'fix_evict_first': ('lru_run', 'lru_run', (2, [('put', 'болт'), ('put', 'гайка'), ('put', 'гайка'), ('get', 'болт')]), 'ops', []),
    # Глава 20.6: первый пример каждой задачи тренажёра.
    'mock_lru': ('lru_ops', 'lru_ops', (2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2), ('put', 4, 4), ('get', 1), ('get', 3), ('get', 4)]), 'ops', []),
    'mock_serve': ('serve', 'serve', (['болт', 'болт', 'гайка', 'болт'],), 'requests', []),
    'mock_prices': ('find_prices', 'find_prices', ([{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}], ['гайка', 'винт', 'болт']), 'queries', []),
    'mock_hashmap': ('hashmap_ops', 'hashmap_ops', ([('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 3), ('put', 2, 1), ('get', 2), ('remove', 2), ('get', 2)],), 'ops', []),
    'mock_timemap': ('timemap_ops', 'timemap_ops', ([('set', 'foo', 'bar', 1), ('get', 'foo', 1), ('get', 'foo', 3), ('set', 'foo', 'bar2', 4), ('get', 'foo', 4), ('get', 'foo', 5)],), 'ops', []),
    'mock_freq': ('freq_tracker_ops', 'freq_tracker_ops', ([('add', 3), ('add', 3), ('has', 2), ('delete', 3), ('has', 2), ('has', 1)],), 'ops', []),
    'mock_auth': ('auth_ops', 'auth_ops', (5, [('renew', 'aaa', 1), ('generate', 'aaa', 2), ('count', 6), ('generate', 'bbb', 7), ('renew', 'aaa', 8), ('renew', 'bbb', 10), ('count', 15)]), 'ops', []),
    'mock_short': ('shorten_all', 'shorten_all', (['a.ru/x', 'b.ru/y', 'a.ru/x'],), 'urls', []),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:18} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 20. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
