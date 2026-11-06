"""Строит пошаговые прогоны для глав модуля 19 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 19.
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
# Кадр хранит снимок переменных; множества и списки копируются глубоко.
engine.copy = types.SimpleNamespace(copy=copy.deepcopy, deepcopy=copy.deepcopy)

SOURCES = {}

# Глава 19.2.
SOURCES['common_users'] = '''
def common_users(a, b):
    in_b = set(b)
    seen = set()
    result = []
    for u in a:
        if u in in_b and u not in seen:
            seen.add(u)
            result.append(u)
    return result
'''
SOURCES['bug_set_result'] = '''
def common_users(a, b):
    return list(set(a) & set(b))
'''
SOURCES['bug_no_seen'] = '''
def common_users(a, b):
    in_b = set(b)
    result = []
    for u in a:
        if u in in_b:
            result.append(u)
    return result
'''

# Глава 19.3.
SOURCES['longest_consecutive'] = '''
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best
'''
SOURCES['bug_every'] = '''
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        y = x
        while y + 1 in s:
            y += 1
        best = max(best, y - x + 1)
    return best
'''

# Глава 19.4.
SOURCES['find_duplicates'] = '''
def find_duplicates(logins):
    seen = set()
    reported = set()
    result = []
    for login in logins:
        key = login.strip().casefold()
        if key in seen and key not in reported:
            reported.add(key)
            result.append(key)
        seen.add(key)
    return result
'''
SOURCES['bug_no_reported'] = '''
def find_duplicates(logins):
    seen = set()
    result = []
    for login in logins:
        key = login.strip().casefold()
        if key in seen:
            result.append(key)
        seen.add(key)
    return result
'''
SOURCES['bug_raw_login'] = SOURCES['find_duplicates'].replace('key = login.strip().casefold()', 'key = login')

# Глава 19.6: задачи тренажёра.
SOURCES['is_happy'] = '''
def is_happy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    return n == 1
'''
SOURCES['missing_number'] = '''
def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)
'''
SOURCES['two_out_of_three'] = '''
def two_out_of_three(a, b, c):
    sa, sb, sc = set(a), set(b), set(c)
    result = []
    for x in sorted(sa | sb | sc):
        if (x in sa) + (x in sb) + (x in sc) >= 2:
            result.append(x)
    return result
'''
SOURCES['is_path_crossing'] = '''
def is_path_crossing(path):
    step = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
    x, y = 0, 0
    visited = {(0, 0)}
    for move in path:
        dx, dy = step[move]
        x, y = x + dx, y + dy
        if (x, y) in visited:
            return True
        visited.add((x, y))
    return False
'''
SOURCES['arithmetic_triplets'] = '''
def arithmetic_triplets(nums, diff):
    s = set(nums)
    count = 0
    for x in nums:
        if x + diff in s and x + 2 * diff in s:
            count += 1
    return count
'''
MOCK_KEYS = {'is_happy', 'missing_number', 'two_out_of_three', 'is_path_crossing', 'arithmetic_triplets'}


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


def sq(v):
    """Множество для подписи: по возрастанию, чтобы подпись не зависела от ячеек."""
    return '{' + ', '.join(repr(x) for x in sorted(v)) + '}' if v else 'set()'


def common_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'in_b = set(b)':
        return f"Множество из b — один раз, O(m): {sq(set(g('b')))}. Проверка u in in_b дальше стоит в среднем O(1)."
    if line == 'seen = set()':
        return "seen — пользователи, уже записанные в ответ. Повтор в a второй раз в ответ не попадёт."
    if line == 'result = []':
        return "result — ответ в порядке a. Множество порядок не хранит, поэтому ответ собирается в список."
    if line == 'for u in a:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий пользователь из a: {q(nxt['raw']['u'])}."
        return f"a пройден. result = {q(g('result'))}."
    if line == 'if u in in_b and u not in seen:':
        u = g('u')
        if u not in g('in_b'):
            return f"{q(u)} нет в b: в ответ не идёт."
        if u in g('seen'):
            return f"{q(u)} есть в b, но уже записан в ответ."
        return f"{q(u)} есть в b и ещё не записан."
    if line == 'if u in in_b:':
        u = g('u')
        if u in g('in_b'):
            return f"{q(u)} есть в b." + (" Он уже в ответе, но проверки повтора нет." if u in g('result') else '')
        return f"{q(u)} нет в b."
    if line == 'seen.add(u)':
        return f"seen = {sq(g('seen') | {g('u')})}."
    if line == 'result.append(u)':
        return f"result = {q(g('result') + [g('u')])}."
    if line == 'return list(set(a) & set(b))':
        r = set(g('a')) & set(g('b'))
        return (f"Пересечение верное — {sq(r)}, но list от множества идёт в порядке ячеек таблицы, "
                f"а не в порядке a.")
    if line == 'return result':
        return "Ответ — общие пользователи в порядке первого появления в a."
    return f"Выполняется строка {fr['ln']}."


def consec_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 's = set(nums)':
        return f"Множество чисел: {sq(set(g('nums')))}. Повторы ушли, проверка y + 1 in s — в среднем O(1)."
    if line == 'best = 0':
        return "best — длина самой длинной серии, найденной до сих пор."
    if line == 'for x in s:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующее число множества: x = {nxt['raw']['x']}. Порядок обхода — порядок ячеек, на ответ он не влияет."
        return f"Множество пройдено. best = {g('best')}."
    if line == 'if x - 1 not in s:':
        x = g('x')
        if x - 1 in g('s'):
            return f"{x - 1} есть во множестве: {x} — не начало серии, от него вверх не идём."
        return f"{x - 1} нет во множестве: {x} — начало серии."
    if line == 'y = x':
        return f"y = {g('x')}: идём вверх от {g('x')}."
    if line == 'while y + 1 in s:':
        y = g('y')
        return f"{y + 1} есть во множестве: серия продолжается." if y + 1 in g('s') else f"{y + 1} нет: серия кончилась на {y}."
    if line == 'y += 1':
        return f"y = {g('y') + 1}."
    if line == 'best = max(best, y - x + 1)':
        L = g('y') - g('x') + 1
        return f"Серия {g('x')}…{g('y')}, длина {L}. best = max({g('best')}, {L}) = {max(g('best'), L)}."
    if line == 'return best':
        return "Ответ — длина самой длинной серии."
    return f"Выполняется строка {fr['ln']}."


def dup_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'seen = set()':
        return "seen — логины, которые уже встречались."
    if line == 'reported = set()':
        return "reported — логины, уже записанные в ответ как повторы. Логин, встретившийся трижды, войдёт в ответ один раз."
    if line == 'result = []':
        return "result — повторы в порядке, в котором обнаружились."
    if line == 'for login in logins:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий логин: {q(nxt['raw']['login'])}."
        return f"Логины пройдены. result = {q(g('result'))}."
    if line == 'key = login.strip().casefold()':
        l = g('login'); k = l.strip().casefold()
        return f"Ключ {q(k)}" + ("." if l == k else f": {q(l)} без пробелов по краям и регистра.")
    if line == 'key = login':
        return f"Ключ {q(g('login'))} — как есть: регистр и пробелы — часть ключа."
    if line == 'if key in seen and key not in reported:':
        k = g('key')
        if k not in g('seen'):
            return f"{q(k)} встретился впервые."
        if k in g('reported'):
            return f"{q(k)} — повтор, но уже в ответе."
        return f"{q(k)} уже встречался: это повтор."
    if line == 'if key in seen:':
        k = g('key')
        if k in g('seen'):
            return f"{q(k)} — повтор." + (" В ответе он уже есть, но проверки reported нет." if k in g('result') else '')
        return f"{q(k)} встретился впервые."
    if line == 'reported.add(key)':
        return f"reported = {sq(g('reported') | {g('key')})}."
    if line == 'result.append(key)':
        return f"result = {q(g('result') + [g('key')])}."
    if line == 'seen.add(key)':
        return f"seen = {sq(g('seen') | {g('key')})}."
    if line == 'return result':
        return "Ответ — каждый повторяющийся логин один раз."
    return f"Выполняется строка {fr['ln']}."


def caption(line, fr, nxt, is_bug, key=''):
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt)
    if key in ('common_users', 'bug_set_result', 'bug_no_seen'):
        return common_caption(line, fr, nxt, key)
    if key in ('longest_consecutive', 'bug_every'):
        return consec_caption(line, fr, nxt, key)
    return dup_caption(line, fr, nxt, key)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))


def run(key, func_name, args, arr_name, ptrs):
    t = engine.run_trace(key, func_name, args, arr_name, ptrs)
    # Генератор внутри sum в Python 3.12 даёт кадр на каждую цифру: подряд идущие
    # кадры одной строки сводятся к последнему. Строка на ленте — список символов.
    fs = t['frames']
    t['frames'] = [fr for k, fr in enumerate(fs)
                   if not (k + 1 < len(fs) and fs[k + 1]['ln'] == fr['ln'] and fr['ev'] == fs[k + 1]['ev'] == 'line')]
    for fr in t['frames']:
        if isinstance(fr['arr'], str):
            fr['arr'] = list(fr['arr'])
    return t


A, B = [5, 3, 8, 3, 1, 8], [1, 8, 9]
NUMS = [100, 4, 200, 1, 3, 2]
LOGINS = ['ivan', 'Olga', ' IVAN', 'petr', 'olga', 'ivan']
TRACES = {
    'common': ('common_users', 'common_users', (A, B), 'a', []),
    'bug_set_result': ('bug_set_result', 'common_users', ([30, 1, 9, 16], [16, 1, 9]), 'a', []),
    'fix_set_result': ('common_users', 'common_users', ([30, 1, 9, 16], [16, 1, 9]), 'a', []),
    'bug_no_seen': ('bug_no_seen', 'common_users', (A, B), 'a', []),
    'consec': ('longest_consecutive', 'longest_consecutive', (NUMS,), 'nums', []),
    'bug_every': ('bug_every', 'longest_consecutive', ([3, 2, 1, 4],), 'nums', []),
    'fix_every': ('longest_consecutive', 'longest_consecutive', ([3, 2, 1, 4],), 'nums', []),
    'dups': ('find_duplicates', 'find_duplicates', (LOGINS,), 'logins', []),
    'bug_no_reported': ('bug_no_reported', 'find_duplicates', (LOGINS,), 'logins', []),
    'bug_raw_login': ('bug_raw_login', 'find_duplicates', (LOGINS,), 'logins', []),
    # Глава 19.6: первый пример каждой задачи тренажёра.
    'mock_common': ('common_users', 'common_users', ([4, 9, 5, 9], [9, 4, 9, 8, 4]), 'a', []),
    'mock_consec': ('longest_consecutive', 'longest_consecutive', ([0, 3, 7, 2, 5, 8, 4, 6, 0, 1],), 'nums', []),
    'mock_dups': ('find_duplicates', 'find_duplicates', (['Max', 'anna', 'max ', 'MAX'],), 'logins', []),
    'mock_happy': ('is_happy', 'is_happy', (19,), '_', []),
    'mock_missing': ('missing_number', 'missing_number', ([3, 0, 1],), 'nums', []),
    'mock_two3': ('two_out_of_three', 'two_out_of_three', ([1, 1, 3, 2], [2, 3], [3]), 'a', []),
    'mock_path': ('is_path_crossing', 'is_path_crossing', ('NESWW',), 'path', []),
    'mock_triplets': ('arithmetic_triplets', 'arithmetic_triplets', ([0, 1, 4, 6, 7, 10], 3), 'nums', []),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:18} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 19. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
