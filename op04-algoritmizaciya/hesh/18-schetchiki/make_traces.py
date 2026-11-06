"""Строит пошаговые прогоны для глав модуля 18 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 18.
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

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'engine', HERE.parent.parent / 'massivy' / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
# Кадр хранит снимок переменных. Словарь списков копируется глубоко, иначе
# списки внутри снимка меняются вместе с работающей функцией.
engine.copy = types.SimpleNamespace(copy=copy.deepcopy, deepcopy=copy.deepcopy)

RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
POS = {ch: i for i, ch in enumerate(RU)}
builtins.RU = RU
builtins.POS = POS

SOURCES = {}

# Глава 18.2.
SOURCES['group_anagrams'] = '''
def group_anagrams(words):
    groups = {}
    for w in words:
        key = ''.join(sorted(w))
        if key not in groups:
            groups[key] = []
        groups[key].append(w)
    return list(groups.values())
'''
SOURCES['anagram_key_counts'] = '''
def anagram_key_counts(word):
    counts = [0] * len(RU)
    for ch in word:
        counts[POS[ch]] += 1
    return tuple(counts)
'''
SOURCES['bug_list_key'] = SOURCES['group_anagrams'].replace("key = ''.join(sorted(w))", 'key = sorted(w)')
SOURCES['bug_set_key'] = SOURCES['group_anagrams'].replace("key = ''.join(sorted(w))", "key = ''.join(sorted(set(w)))")

# Глава 18.3.
SOURCES['top_k_frequent'] = '''
def top_k_frequent(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    order = sorted(count, key=lambda x: -count[x])
    return order[:k]
'''
SOURCES['top_k_bucket'] = '''
def top_k_bucket(nums, k):
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    result = []
    for c in range(len(nums), 0, -1):
        for x in buckets[c]:
            if len(result) == k:
                return result
            result.append(x)
    return result
'''
SOURCES['bug_ties_by_value'] = SOURCES['top_k_frequent'].replace('key=lambda x: -count[x]', 'key=lambda x: (-count[x], x)')
SOURCES['bug_set_order'] = SOURCES['top_k_frequent'].replace('sorted(count, key', 'sorted(set(nums), key')

# Глава 18.4.
SOURCES['bug_sorted_groups'] = SOURCES['group_anagrams'].replace('return list(groups.values())', 'return sorted(groups.values())')
SOURCES['bug_counts_answer'] = SOURCES['top_k_frequent'].replace('return order[:k]', 'return [count[x] for x in order[:k]]')

# Глава 18.6: задачи тренажёра.
SOURCES['frequency_sort'] = '''
def frequency_sort(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    order = sorted(count, key=lambda ch: -count[ch])
    return ''.join(ch * count[ch] for ch in order)
'''
SOURCES['kth_distinct'] = '''
def kth_distinct(arr, k):
    count = {}
    for s in arr:
        count[s] = count.get(s, 0) + 1
    for s in arr:
        if count[s] == 1:
            k -= 1
            if k == 0:
                return s
    return ''
'''
SOURCES['count_k_difference'] = '''
def count_k_difference(nums, k):
    seen = {}
    pairs = 0
    for x in nums:
        pairs += seen.get(x - k, 0) + seen.get(x + k, 0)
        seen[x] = seen.get(x, 0) + 1
    return pairs
'''
SOURCES['smaller_than_current'] = '''
def smaller_than_current(nums):
    top = max(nums, default=0)
    count = [0] * (top + 1)
    for x in nums:
        count[x] += 1
    less = [0] * (top + 1)
    for v in range(1, top + 1):
        less[v] = less[v - 1] + count[v - 1]
    return [less[x] for x in nums]
'''
SOURCES['rearrange_characters'] = '''
def rearrange_characters(s, target):
    have = {}
    for ch in s:
        have[ch] = have.get(ch, 0) + 1
    need = {}
    for ch in target:
        need[ch] = need.get(ch, 0) + 1
    copies = len(s)
    for ch, c in need.items():
        copies = min(copies, have.get(ch, 0) // c)
    return copies
'''
SOURCES['group_by_domain'] = '''
def group_by_domain(emails):
    groups = {}
    for e in emails:
        e = e.strip()
        if '@' not in e:
            continue
        domain = e.rpartition('@')[2].casefold()
        if domain not in groups:
            groups[domain] = []
        groups[domain].append(e)
    return groups
'''
MOCK_KEYS = {'frequency_sort', 'kth_distinct', 'count_k_difference', 'smaller_than_current',
             'rearrange_characters', 'group_by_domain'}


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


def group_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if fr['ev'] == 'exc':
        return f"Ошибка {fr['err']}: список изменяемый, у него нет хеша, и ключом словаря он быть не может."
    if line == 'groups = {}':
        return "groups — словарь «ключ группы → список слов». Группы появляются в порядке первого появления ключа."
    if line == 'for w in words:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующее слово: {q(nxt['raw']['w'])}."
        return f"Слова пройдены. groups = {q(g('groups'))}."
    if line == "key = ''.join(sorted(w))":
        w = g('w')
        return f"Ключ: буквы {q(w)} по алфавиту → {q(''.join(sorted(w)))}. У всех анаграмм этот ключ один."
    if line == 'key = sorted(w)':
        return f"sorted возвращает список: {q(sorted(g('w')))}. Строкой его никто не сделал."
    if line == "key = ''.join(sorted(set(w)))":
        w = g('w')
        return f"set убирает повторы букв: {q(w)} → {q(''.join(sorted(set(w))))}. Сколько раз встречалась буква, ключ больше не помнит."
    if line == 'if key not in groups:':
        k, gr = g('key'), g('groups')
        if k in gr:
            return f"Ключ {q(k)} уже есть: слово идёт в группу {q(gr[k])}."
        return f"Ключа {q(k)} ещё нет: это первое слово новой группы."
    if line == 'groups[key] = []':
        return f"Новая группа: groups[{q(g('key'))}] = []."
    if line == 'groups[key].append(w)':
        k = g('key')
        return f"groups[{q(k)}] = {q(g('groups')[k] + [g('w')])}."
    if line == 'return sorted(groups.values())':
        gr = list(g('groups').values())
        return (f"Группы в порядке появления: {q(gr)}. sorted упорядочивает их по первому слову: {q(sorted(gr))}. "
                f"Порядок входа потерян.")
    if line == 'return list(groups.values())':
        return "Ответ — списки слов без ключей, в порядке появления групп."
    return f"Выполняется строка {fr['ln']}."


def top_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'count = {}':
        return "count — частотный словарь «число → сколько раз встретилось». Ключи в нём идут в порядке первого появления."
    if line == 'for x in nums:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующее число: x = {nxt['raw']['x']}."
        return f"Числа пройдены. count = {q(g('count'))}."
    if line == 'count[x] = count.get(x, 0) + 1':
        x, c = g('x'), g('count').get(g('x'), 0)
        return f"count[{x}] = {c} + 1 = {c + 1}."
    if line == 'order = sorted(count, key=lambda x: -count[x])':
        c = g('count'); o = sorted(c, key=lambda x: -c[x])
        return (f"Ключи по убыванию частоты: {q(o)}. sorted устойчив: числа с равной частотой остаются "
                f"в порядке count, то есть в порядке первого появления.")
    if line == 'order = sorted(count, key=lambda x: (-count[x], x))':
        c = g('count'); o = sorted(c, key=lambda x: (-c[x], x))
        return f"При равной частоте числа сравниваются по значению: {q(o)}. Порядок первого появления потерян."
    if line == 'order = sorted(set(nums), key=lambda x: -count[x])':
        c = g('count'); o = sorted(set(g('nums')), key=lambda x: -c[x])
        return f"sorted идёт по set(nums): {q(sorted(set(g('nums')), key=lambda x: 0))} — порядок ячеек таблицы, а не первого появления. Итог: {q(o)}."
    if line == 'return [count[x] for x in order[:k]]':
        o = g('order')[:g('k')]
        return f"Вместо чисел {q(o)} возвращаются их частоты {q([g('count')[x] for x in o])}: ответ не восстановлен."
    if line == 'return order[:k]':
        return f"Первые k = {g('k')} элементов: {q(g('order')[:g('k')])}. В ответе числа, а не частоты."
    if line == 'buckets = [[] for _ in range(len(nums) + 1)]':
        return f"Вёдра 0…{len(g('nums'))}: в ведре c будут числа с частотой c. Частота не больше n, поэтому вёдер n + 1."
    if line == 'for x, c in count.items():':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Число {nxt['raw']['x']} с частотой {nxt['raw']['c']}."
        return f"Вёдра разложены: {q({c: b for c, b in enumerate(g('buckets')) if b})}."
    if line == 'buckets[c].append(x)':
        return f"Число {g('x')} — в ведро {g('c')}."
    if line == 'result = []':
        return "Ответ собирается из вёдер от большей частоты к меньшей."
    if line == 'for c in range(len(nums), 0, -1):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            c = nxt['raw']['c']
            b = g('buckets')[c]
            return f"Ведро {c}: {q(b)}." if b else f"Ведро {c} пустое."
        return "Все вёдра просмотрены."
    if line == 'for x in buckets[c]:':
        if not g('buckets')[g('c')]:
            return "Чисел нет, к следующему ведру."
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Число {nxt['raw']['x']} из ведра {g('c')}."
        return "Ведро закончилось."
    if line == 'if len(result) == k:':
        n = len(g('result'))
        return f"В ответе {n} из k = {g('k')}: " + ("ответ готов." if n == g('k') else "берём ещё.")
    if line == 'result.append(x)':
        return f"result = {q(g('result') + [g('x')])}."
    if line == 'return result':
        return "Ответ — числа из вёдер."
    return f"Выполняется строка {fr['ln']}."


def caption(line, fr, nxt, is_bug, key=''):
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt)
    if key.startswith('top_') or key in ('bug_ties_by_value', 'bug_set_order', 'bug_counts_answer'):
        return top_caption(line, fr, nxt, key)
    return group_caption(line, fr, nxt, key)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))


def run(key, func_name, args, arr_name, ptrs):
    t = engine.run_trace(key, func_name, args, arr_name, ptrs)
    # Генератор списка в Python 3.12 даёт событие line на каждой итерации:
    # подряд идущие кадры одной строки сводятся к последнему.
    fs = t['frames']
    t['frames'] = [fr for k, fr in enumerate(fs)
                   if not (k + 1 < len(fs) and fs[k + 1]['ln'] == fr['ln'] and fr['ev'] == fs[k + 1]['ev'] == 'line')]
    for fr in t['frames']:
        if isinstance(fr['arr'], str):
            fr['arr'] = list(fr['arr'])
    return t


WORDS = ['кот', 'листок', 'ток', 'слиток', 'окт']
NUMS = [3, 1, 1, 2, 2, 3, 4, 1]
TRACES = {
    # Глава 18.2.
    'group': ('group_anagrams', 'group_anagrams', (WORDS,), 'words', []),
    'bug_list_key': ('bug_list_key', 'group_anagrams', (WORDS,), 'words', []),
    'bug_set_key': ('bug_set_key', 'group_anagrams', (['аб', 'абб', 'ба'],), 'words', []),
    'fix_set_key': ('group_anagrams', 'group_anagrams', (['аб', 'абб', 'ба'],), 'words', []),
    # Глава 18.3.
    'top': ('top_k_frequent', 'top_k_frequent', (NUMS, 2), 'nums', []),
    'bucket': ('top_k_bucket', 'top_k_bucket', (NUMS, 2), 'nums', []),
    'bug_ties_by_value': ('bug_ties_by_value', 'top_k_frequent', ([5, 5, 2, 2, 7], 1), 'nums', []),
    'fix_ties': ('top_k_frequent', 'top_k_frequent', ([5, 5, 2, 2, 7], 1), 'nums', []),
    # Глава 18.4.
    'bug_sorted_groups': ('bug_sorted_groups', 'group_anagrams', (['слон', 'кот', 'нолс', 'ток'],), 'words', []),
    'fix_sorted_groups': ('group_anagrams', 'group_anagrams', (['слон', 'кот', 'нолс', 'ток'],), 'words', []),
    'bug_set_order': ('bug_set_order', 'top_k_frequent', ([5, 5, 2, 2, 7], 1), 'nums', []),
    'bug_counts_answer': ('bug_counts_answer', 'top_k_frequent', ([7, 7, 7, 0], 1), 'nums', []),
    'fix_counts_answer': ('top_k_frequent', 'top_k_frequent', ([7, 7, 7, 0], 1), 'nums', []),
    # Глава 18.6: первый пример каждой задачи тренажёра.
    'mock_group': ('group_anagrams', 'group_anagrams', (['ток', 'дом', 'кот', 'мод'],), 'words', []),
    'mock_top': ('top_k_frequent', 'top_k_frequent', ([1, 1, 1, 2, 2, 3], 2), 'nums', []),
    'mock_freq_sort': ('frequency_sort', 'frequency_sort', ('tree',), 's', []),
    'mock_kth': ('kth_distinct', 'kth_distinct', (['d', 'b', 'c', 'b', 'c', 'a'], 2), 'arr', []),
    'mock_kdiff': ('count_k_difference', 'count_k_difference', ([1, 2, 2, 1], 1), 'nums', []),
    'mock_smaller': ('smaller_than_current', 'smaller_than_current', ([8, 1, 2, 2, 3],), 'nums', []),
    'mock_rearrange': ('rearrange_characters', 'rearrange_characters', ('ilovecodingonleetcode', 'code'), 's', []),
    'mock_domain': ('group_by_domain', 'group_by_domain', ([' ivan@Mail.ru', 'olga@yandex.ru', 'petr@mail.RU', 'bad-address'],), 'emails', []),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:18} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 18. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
