"""Строит пошаговые прогоны для глав модуля 17 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 17.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import copy
import importlib.util
import json
import pathlib
import sys
import types

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'engine', HERE.parent.parent / 'massivy' / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
# Кадр хранит снимок переменных. Словарь списков копируется глубоко, иначе
# списки внутри снимка меняются вместе с работающей функцией.
engine.copy = types.SimpleNamespace(copy=copy.deepcopy, deepcopy=copy.deepcopy)

SOURCES = {}

# Глава 17.2.
SOURCES['has_duplicate'] = '''
def has_duplicate(items):
    seen = set()
    for x in items:
        if x in seen:
            return True
        seen.add(x)
    return False
'''
SOURCES['bug_add_first'] = '''
def has_duplicate(items):
    seen = set()
    for x in items:
        seen.add(x)
        if x in seen:
            return True
    return False
'''
SOURCES['unique_in_order'] = '''
def unique_in_order(items):
    seen = set()
    result = []
    for x in items:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result
'''

# Глава 17.3.
SOURCES['two_sum'] = '''
def two_sum(nums, target):
    index = {}
    for j, x in enumerate(nums):
        need = target - x
        if need in index:
            return (index[need], j)
        if x not in index:
            index[x] = j
    return None
'''
SOURCES['bug_index_first'] = '''
def two_sum(nums, target):
    index = {}
    for j, x in enumerate(nums):
        index[x] = j
        need = target - x
        if need in index:
            return (index[need], j)
    return None
'''

# Глава 17.4.
SOURCES['duplicate_clients'] = '''
def duplicate_clients(clients):
    groups = {}
    no_email = []
    for cid, email in clients:
        key = email.strip().casefold()
        if not key:
            no_email.append(cid)
            continue
        if key not in groups:
            groups[key] = []
        groups[key].append(cid)
    dups = {key: ids for key, ids in groups.items() if len(ids) > 1}
    return dups, no_email
'''
SOURCES['bug_raw_key'] = SOURCES['duplicate_clients'].replace(
    'key = email.strip().casefold()', 'key = email')
SOURCES['bug_empty_key'] = SOURCES['duplicate_clients'].replace(
    '        if not key:\n            no_email.append(cid)\n            continue\n', '')
SOURCES['bug_no_filter'] = SOURCES['duplicate_clients'].replace(
    '    dups = {key: ids for key, ids in groups.items() if len(ids) > 1}\n    return dups, no_email',
    '    return groups, no_email')

# Глава 17.6: задачи тренажёра.
SOURCES['contains_nearby_duplicate'] = '''
def contains_nearby_duplicate(nums, k):
    last = {}
    for j, x in enumerate(nums):
        if x in last and j - last[x] <= k:
            return True
        last[x] = j
    return False
'''
SOURCES['repeated_character'] = '''
def repeated_character(s):
    seen = set()
    for ch in s:
        if ch in seen:
            return ch
        seen.add(ch)
    return ''
'''
SOURCES['num_jewels_in_stones'] = '''
def num_jewels_in_stones(jewels, stones):
    kinds = set(jewels)
    count = 0
    for st in stones:
        if st in kinds:
            count += 1
    return count
'''
SOURCES['sum_of_unique'] = '''
def sum_of_unique(nums):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    total = 0
    for x, c in count.items():
        if c == 1:
            total += x
    return total
'''
SOURCES['two_sum_sorted'] = '''
def two_sum_sorted(numbers, target):
    i, j = 0, len(numbers) - 1
    while i < j:
        s = numbers[i] + numbers[j]
        if s == target:
            return [i + 1, j + 1]
        if s < target:
            i += 1
        else:
            j -= 1
    return []
'''
MOCK_KEYS = {'contains_nearby_duplicate', 'repeated_character', 'num_jewels_in_stones', 'sum_of_unique', 'two_sum_sorted'}


def mock_caption(line, fr, nxt):
    """Подпись кадра тренажёра: строка и переменные, которые она изменила."""
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if fr['ev'] == 'exc':
        return f"Ошибка: {fr['err']}."
    said = f"Строка {fr['ln']}: {line}"
    for word in ('if ', 'while '):
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


def loop_next(fr, nxt, var):
    """Следующее значение переменной цикла или None, если цикл закончен."""
    if nxt is not None and nxt['ln'] == fr['ln'] + 1:
        return nxt['raw'][var]
    return None


def dup_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'seen = set()':
        return "seen — множество элементов, которые уже встретились левее текущего. Пока оно пустое."
    if line == 'result = []':
        return "result — ответ: элементы в порядке первого появления. Множество порядок не хранит, поэтому нужен отдельный список."
    if line == 'for x in items:':
        x = loop_next(fr, nxt, 'x')
        if x is not None:
            return f"Следующий элемент: x = {q(x)}."
        if key == 'unique_in_order':
            return f"Список пройден. В result каждый элемент один раз, в порядке первого появления: {q(g('result'))}."
        return "Список пройден, ни один элемент не встретился второй раз."
    if line == 'if x in seen:':
        x, s = g('x'), g('seen')
        if key == 'bug_add_first':
            return f"{q(x)} есть в seen = {q(s)}: проверка истинна, потому что элемент добавлен строкой выше."
        if x in s:
            return f"{q(x)} есть в seen = {q(s)}: этот элемент уже встречался. Проверка стоит в среднем O(1)."
        return f"{q(x)} нет в seen = {q(s) if s else 'set()'}: элемент встретился впервые."
    if line == 'if x not in seen:':
        x, s = g('x'), g('seen')
        if x in s:
            return f"{q(x)} уже есть в seen: это повтор, в ответ он не идёт."
        return f"{q(x)} встретился впервые."
    if line == 'seen.add(x)':
        if key == 'bug_add_first':
            return f"Элемент {q(g('x'))} добавлен в seen до проверки. Теперь проверка ниже найдёт его самого."
        return f"Запоминаем {q(g('x'))}: seen = {q(g('seen') | {g('x')})}."
    if line == 'result.append(x)':
        return f"{q(g('x'))} добавлен в ответ: result = {q(g('result') + [g('x')])}."
    if line == 'return True':
        if key == 'bug_add_first':
            return (f"{q(g('x'))} найден в seen, но это не повтор: его только что добавили. "
                    f"Версия отвечает True уже на первом элементе любого непустого списка.")
        return f"Повтор найден: {q(g('x'))}. Остаток списка проверять не нужно."
    if line == 'return False':
        return "Повторов нет."
    if line == 'return result':
        return "Ответ готов."
    return f"Выполняется строка {fr['ln']}."


def sum_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'index = {}':
        return "index — словарь «число → индекс» для чисел левее текущего. По нему ищется пара для каждого числа."
    if line == 'for j, x in enumerate(nums):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"j = {nxt['raw']['j']}, x = {q(nxt['raw']['x'])}."
        return "Список пройден, пары с такой суммой нет."
    if line == 'need = target - x':
        return f"Пара для x = {g('x')}: need = {g('target')} − {g('x')} = {g('target') - g('x')}."
    if line == 'if need in index:':
        need, ix = g('need'), g('index')
        if need in ix:
            if key == 'bug_index_first' and ix[need] == g('j'):
                return (f"need = {need} есть в index, но это сам x: index[{need}] = {ix[need]} = j. "
                        f"Число записано в словарь до поиска пары и нашло само себя.")
            return f"need = {need} есть в index, его индекс {ix[need]}: пара найдена."
        return f"need = {need} нет в index = {q(ix) if ix else '{}'}: левее пары для {g('x')} нет."
    if line == 'if x not in index:':
        x, ix = g('x'), g('index')
        if x in ix:
            return f"{x} уже есть в index с индексом {ix[x]}: первое вхождение не перезаписывается."
        return f"{x} встретилось впервые."
    if line == 'index[x] = j':
        x, j, ix = g('x'), g('j'), dict(g('index'))
        ix[x] = j
        if key == 'bug_index_first':
            return f"index[{x}] = {j} записан до поиска пары: index = {q(ix)}."
        return f"Запоминаем число: index[{x}] = {j}, index = {q(ix)}. Оно может стать парой для чисел правее."
    if line == 'return (index[need], j)':
        i, j = g('index')[g('need')], g('j')
        if key == 'bug_index_first' and i == j:
            return f"Ответ ({i}, {j}): одно и то же число использовано дважды. Верный ответ на этом входе другой."
        return f"Ответ ({i}, {j}): nums[{i}] + nums[{j}] = {g('nums')[i]} + {g('nums')[j]} = {g('target')}."
    if line == 'return None':
        return "Пары нет."
    return f"Выполняется строка {fr['ln']}."


def clients_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'groups = {}':
        return "groups — словарь «нормализованная почта → список id». Ключ строится из почты, а не берётся как есть."
    if line == 'no_email = []':
        return "no_email — id клиентов без почты. Пустая почта ключом не считается, такие клиенты идут сюда."
    if line == 'for cid, email in clients:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий клиент: id {nxt['raw']['cid']}, почта {q(nxt['raw']['email'])}."
        return f"Все клиенты пройдены. groups = {q(g('groups'))}."
    if line == 'key = email.strip().casefold()':
        e = g('email'); k = e.strip().casefold()
        if not e:
            return "Почта пустая, ключ ''."
        if e == k:
            return f"Ключ {q(k)}: почта уже без пробелов по краям и в нижнем регистре."
        return f"Ключ: {q(e)} → strip → casefold → {q(k)}."
    if line == 'key = email':
        return f"Ключ {q(g('email'))} берётся как есть: пробелы и регистр остаются частью ключа."
    if line == 'if not key:':
        if not g('key'):
            return "Ключ пустой: у клиента нет почты."
        return f"Ключ {q(g('key'))} не пустой."
    if line == 'no_email.append(cid)':
        return f"id {g('cid')} — в no_email: no_email = {q(g('no_email') + [g('cid')])}."
    if line == 'continue':
        return "В groups такой клиент не попадает: переход к следующему."
    if line == 'if key not in groups:':
        k, gr = g('key'), g('groups')
        if k in gr:
            return f"Ключ {q(k)} уже есть: у него id {q(gr[k])}. Этот клиент — дубликат."
        if key == 'bug_empty_key' and not k:
            return f"Ключ {q(k)} пустой, но проверки на пустоту нет: он станет обычным ключом группы."
        return f"Ключа {q(k)} ещё нет."
    if line == 'groups[key] = []':
        return f"Новая группа: groups[{q(g('key'))}] = []."
    if line == 'groups[key].append(cid)':
        k = g('key'); ids = g('groups')[k] + [g('cid')]
        return f"groups[{q(k)}] = {q(ids)}."
    if line == 'dups = {key: ids for key, ids in groups.items() if len(ids) > 1}':
        d = {k: v for k, v in g('groups').items() if len(v) > 1}
        return f"Оставляем только группы с двумя и более id: {q(d)}. Клиенты без пары — не дубликаты."
    if line == 'return dups, no_email':
        return "Ответ: группы дубликатов и список клиентов без почты."
    if line == 'return groups, no_email':
        return (f"Возвращаются все группы, в том числе из одного клиента: {q(g('groups'))}. "
                f"Каждый клиент с уникальной почтой выглядит как дубликат.")
    return f"Выполняется строка {fr['ln']}."


CLIENT_KEYS = {'duplicate_clients', 'bug_raw_key', 'bug_empty_key', 'bug_no_filter'}
DUP_KEYS = {'has_duplicate', 'bug_add_first', 'unique_in_order'}


def caption(line, fr, nxt, is_bug, key=''):
    if key in DUP_KEYS:
        return dup_caption(line, fr, nxt, key)
    if key in CLIENT_KEYS:
        return clients_caption(line, fr, nxt, key)
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt)
    return sum_caption(line, fr, nxt, key)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

CLIENTS = [(1, 'Ivan@Mail.ru'), (2, ' ivan@mail.ru'), (3, ''), (4, 'olga@mail.ru'), (5, '  ')]
TRACES = {
    # Глава 17.2.
    'dup': ('has_duplicate', 'has_duplicate', ([4, 1, 7, 1, 3],), 'items', []),
    'dup_none': ('has_duplicate', 'has_duplicate', ([4, 1, 7],), 'items', []),
    'bug_add_first': ('bug_add_first', 'has_duplicate', ([4, 1, 7],), 'items', []),
    'unique': ('unique_in_order', 'unique_in_order', ([4, 1, 4, 7, 1],), 'items', []),
    # Глава 17.3.
    'two_sum': ('two_sum', 'two_sum', ([3, 8, 4, 5], 9), 'nums', ['j']),
    'bug_index_first': ('bug_index_first', 'two_sum', ([3, 4, 2], 6), 'nums', ['j']),
    'fix_index_first': ('two_sum', 'two_sum', ([3, 4, 2], 6), 'nums', ['j']),
    # Глава 17.4.
    'clients': ('duplicate_clients', 'duplicate_clients', (CLIENTS,), 'clients', []),
    'bug_raw_key': ('bug_raw_key', 'duplicate_clients', (CLIENTS,), 'clients', []),
    'bug_empty_key': ('bug_empty_key', 'duplicate_clients', (CLIENTS,), 'clients', []),
    'bug_no_filter': ('bug_no_filter', 'duplicate_clients', (CLIENTS,), 'clients', []),
    # Глава 17.6: первый пример каждой задачи тренажёра.
    'mock_dup': ('has_duplicate', 'has_duplicate', ([1, 2, 3, 1],), 'items', []),
    'mock_sum': ('two_sum', 'two_sum', ([2, 7, 11, 15], 9), 'nums', ['j']),
    'mock_clients': ('duplicate_clients', 'duplicate_clients', ([(1, 'A@b.ru'), (2, 'a@B.ru '), (3, '')],), 'clients', []),
    'mock_nearby': ('contains_nearby_duplicate', 'contains_nearby_duplicate', ([1, 2, 3, 1], 3), 'nums', ['j']),
    'mock_repeat': ('repeated_character', 'repeated_character', ('abccbaacz',), 's', []),
    'mock_jewels': ('num_jewels_in_stones', 'num_jewels_in_stones', ('aA', 'aAAbbbb'), 'stones', []),
    'mock_unique_sum': ('sum_of_unique', 'sum_of_unique', ([1, 2, 3, 2],), 'nums', []),
    'mock_sorted': ('two_sum_sorted', 'two_sum_sorted', ([2, 7, 11, 15], 9), 'numbers', ['i', 'j']),
}


def run(key, func_name, args, arr_name, ptrs):
    t = engine.run_trace(key, func_name, args, arr_name, ptrs)
    # Генератор словаря в Python 3.12 даёт событие line на каждой итерации:
    # подряд идущие кадры одной строки сводятся к последнему.
    fs = t['frames']
    t['frames'] = [fr for k, fr in enumerate(fs)
                   if not (k + 1 < len(fs) and fs[k + 1]['ln'] == fr['ln'] and fr['ev'] == fs[k + 1]['ev'] == 'line')]
    # Строка показывается лентой символов, пары (id, почта) — списками из двух элементов.
    for fr in t['frames']:
        if isinstance(fr['arr'], str):
            fr['arr'] = list(fr['arr'])
        if fr['arr'] and isinstance(fr['arr'][0], tuple):
            fr['arr'] = [list(pair) for pair in fr['arr']]
    return t

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:18} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 17. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
