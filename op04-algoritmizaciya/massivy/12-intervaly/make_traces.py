"""Строит пошаговые прогоны для глав модуля 12 настоящим запуском Python.

Движок записи кадров — тот же, что в модуле 8 (../08-dva-ukazatelya/make_traces.py):
модуль загружается, ему подставляются исходники и подписи модуля 12.
Интервалы — списки из двух чисел, поэтому кадры копируются глубоко:
иначе версия, которая меняет входные интервалы, испортила бы ранние кадры.
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
spec = importlib.util.spec_from_file_location('engine', HERE.parent / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.copy = types.SimpleNamespace(copy=copy.deepcopy, deepcopy=copy.deepcopy)

SOURCES = {}

# Глава 12.2.
SOURCES['merge_intervals'] = '''
def merge_intervals(intervals):
    ordered = sorted(intervals)
    merged = []
    for start, end in ordered:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
'''

# Ошибочные версии для главы 12.2.
SOURCES['bug_touch'] = SOURCES['merge_intervals'].replace(
    'if merged and start <= merged[-1][1]:', 'if merged and start < merged[-1][1]:')
SOURCES['bug_end'] = SOURCES['merge_intervals'].replace(
    'merged[-1][1] = max(merged[-1][1], end)', 'merged[-1][1] = end')
SOURCES['bug_no_sort'] = SOURCES['merge_intervals'].replace(
    '    ordered = sorted(intervals)\n', '').replace('for start, end in ordered:', 'for start, end in intervals:')

# Глава 12.3.
SOURCES['can_attend'] = '''
def can_attend(intervals):
    ordered = sorted(intervals)
    for i in range(1, len(ordered)):
        if ordered[i][0] < ordered[i - 1][1]:
            return False
    return True
'''
SOURCES['bug_attend_le'] = SOURCES['can_attend'].replace(
    'if ordered[i][0] < ordered[i - 1][1]:', 'if ordered[i][0] <= ordered[i - 1][1]:')
SOURCES['bug_attend_nosort'] = SOURCES['can_attend'].replace('ordered = sorted(intervals)', 'ordered = intervals')
SOURCES['bug_end_key'] = SOURCES['merge_intervals'].replace(
    'ordered = sorted(intervals)', 'ordered = sorted(intervals, key=lambda iv: iv[1])')

SOURCES['insert_interval'] = '''
def insert_interval(intervals, new):
    start, end = new
    result = []
    i = 0
    while i < len(intervals) and intervals[i][1] < start:
        result.append(list(intervals[i]))
        i += 1
    while i < len(intervals) and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    result.append([start, end])
    while i < len(intervals):
        result.append(list(intervals[i]))
        i += 1
    return result
'''

# Изменённые версии для главы 12.4.
SOURCES['var_sort_inplace'] = SOURCES['merge_intervals'].replace(
    '    ordered = sorted(intervals)\n', '    intervals.sort()\n').replace('for start, end in ordered:', 'for start, end in intervals:')
SOURCES['var_alias'] = '''
def merge_intervals(intervals):
    ordered = sorted(intervals)
    merged = []
    for iv in ordered:
        if merged and iv[0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], iv[1])
        else:
            merged.append(iv)
    return merged
'''
SOURCES['var_first'] = '''
def merge_intervals(intervals):
    ordered = sorted(intervals)
    merged = [list(ordered[0])]
    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
'''
SOURCES['var_last_pair'] = SOURCES['can_attend'].replace(
    'for i in range(1, len(ordered)):', 'for i in range(1, len(ordered) - 1):')

for _k, _base in [('bug_touch', 'merge_intervals'), ('bug_end', 'merge_intervals'), ('bug_no_sort', 'merge_intervals'),
                  ('bug_attend_le', 'can_attend'), ('bug_attend_nosort', 'can_attend'), ('bug_end_key', 'merge_intervals'),
                  ('var_sort_inplace', 'merge_intervals'), ('var_last_pair', 'can_attend')]:
    assert SOURCES[_k] != SOURCES[_base], f'замена в {_k} не сработала'


# Глава 12.6, тренажёр. Ключ прогона совпадает с именем функции.
SOURCES['remove_covered'] = '''
def remove_covered(intervals):
    ordered = sorted(intervals, key=lambda iv: (iv[0], -iv[1]))
    count = 0
    reach = 0
    for start, end in ordered:
        if end > reach:
            count += 1
            reach = end
    return count
'''

SOURCES['summary_ranges'] = '''
def summary_ranges(nums):
    result = []
    i = 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
            j += 1
        if i == j:
            result.append(str(nums[i]))
        else:
            result.append(f"{nums[i]}->{nums[j]}")
        i = j + 1
    return result
'''

SOURCES['interval_intersections'] = '''
def interval_intersections(first, second):
    result = []
    i = j = 0
    while i < len(first) and j < len(second):
        start = max(first[i][0], second[j][0])
        end = min(first[i][1], second[j][1])
        if start <= end:
            result.append([start, end])
        if first[i][1] < second[j][1]:
            i += 1
        else:
            j += 1
    return result
'''

SOURCES['have_conflict'] = '''
def have_conflict(event1, event2):
    return event1[0] <= event2[1] and event2[0] <= event1[1]
'''

SOURCES['car_points'] = '''
def car_points(nums):
    ordered = sorted(nums)
    total = 0
    reach = 0
    for start, end in ordered:
        if end > reach:
            total += end - max(start - 1, reach)
            reach = end
    return total
'''


def iv(p):
    return f"[{p[0]}, {p[1]})"


def ivs(ps):
    return '[' + ', '.join(f"[{a}, {b}]" for a, b in ps) + ']'


def merge_caption(line, fr, nxt, key):
    """Подписи к объединению интервалов и его изменённым версиям."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    merged = g('merged')
    if line == 'ordered = sorted(intervals)':
        src = g('intervals')
        want = sorted(src)
        if not src:
            return "Список пустой, сортировать нечего: ordered = []."
        return (f"sorted возвращает новый список, отсортированный по началу; при равных началах раньше стоит интервал "
                f"с меньшим концом. ordered = {ivs(want)}. Список intervals не меняется.")
    if line == 'ordered = sorted(intervals, key=lambda iv: iv[1])':
        want = sorted(g('intervals'), key=lambda p: p[1])
        return (f"Сортировка по концу: ordered = {ivs(want)}. Начала теперь идут не по возрастанию: "
                f"интервал {iv(want[-1])} начинается раньше всех, но стоит последним.")
    if line == 'intervals.sort()':
        return ("intervals.sort() сортирует тот самый список, который передал вызывающий код. Нового списка нет: "
                "после вызова порядок заявок у вызывающего потерян.")
    if line == 'merged = []':
        return ("merged — блоки занятости. Все блоки, кроме последнего, уже закончены. Последний может ещё "
                "продлиться, поэтому каждый следующий интервал сравнивается только с ним.")
    if line == 'merged = [list(ordered[0])]':
        return "Первый блок — копия ordered[0]. Если список пустой, ordered[0] не существует."
    if line in ('for start, end in ordered:', 'for start, end in intervals:', 'for start, end in ordered[1:]:', 'for iv in ordered:'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            nr = nxt['raw']
            p = nr['iv'] if 'iv' in nr else [nr['start'], nr['end']]
            return f"Следующий интервал {iv(p)}."
        return "Все интервалы пройдены."
    if line in ('if merged and start <= merged[-1][1]:', 'if merged and start < merged[-1][1]:',
                'if start <= merged[-1][1]:', 'if merged and iv[0] <= merged[-1][1]:'):
        if 'iv' in fr['raw']:
            s, e = g('iv')
        else:
            s, e = g('start'), g('end')
        if not merged:
            return f"merged пуст: интервал {iv([s, e])} начинает первый блок."
        bs, be = merged[-1]
        strict = ' < ' in line
        if s > be:
            return (f"{s} > {be}: между блоком {iv([bs, be])} и интервалом свободно {s - be}. Блок закончен: "
                    f"у следующих интервалов начала не меньше {s}.") if key not in ('bug_no_sort',) else \
                   f"{s} > {be}: интервал начинается после конца последнего блока, открывается новый блок."
        if strict and s == be:
            return (f"Условие {s} < {be} ложно: интервал касается блока {iv([bs, be])}. Свободного времени между ними нет, "
                    f"но эта версия открывает новый блок.")
        if key in ('bug_no_sort', 'bug_end_key') and s < bs:
            return (f"{s} ≤ {be}: интервал вливается в блок {iv([bs, be])}. Но он начинается в {s}, раньше начала блока {bs}: "
                    f"список не упорядочен по началу, а начало блока при слиянии не меняется. Время с {s} до {bs} потеряно.")
        how = 'касается блока' if s == be else 'пересекает блок'
        return f"{s} ≤ {be}: интервал {iv([s, e])} {how} {iv([bs, be])}, это одно время занятости."
    if line in ('merged[-1][1] = max(merged[-1][1], end)', 'merged[-1][1] = max(merged[-1][1], iv[1])'):
        e = g('iv')[1] if 'iv' in fr['raw'] else g('end')
        be = merged[-1][1]
        alias = ''
        if key == 'var_alias' and e > be:
            alias = (f" merged[-1] — тот же список, что лежит в intervals: входной интервал [{merged[-1][0]}, {be}] "
                     f"тоже становится [{merged[-1][0]}, {e}].")
        if e <= be:
            return f"Конец интервала {e} не больше {be}: интервал лежит внутри блока, max({be}, {e}) = {be}, блок не меняется.{alias}"
        return f"Блок продлевается: max({be}, {e}) = {e}.{alias}"
    if line == 'merged[-1][1] = end':
        e, (bs, be) = g('end'), merged[-1]
        if e < be:
            return (f"Конец блока заменяется на {e}, хотя блок шёл до {be}. Интервал {iv([g('start'), e])} лежит внутри блока, "
                    f"и время с {e} до {be} пропадает из ответа.")
        return f"Конец блока заменяется на {e}. Здесь {e} ≥ {be}, ответ пока верный."
    if line == 'merged.append([start, end])':
        return f"Новый блок {iv([g('start'), g('end')])}: в merged кладётся новый список из двух чисел."
    if line == 'merged.append(iv)':
        return (f"В merged кладётся сам список {g('iv')} из ordered. sorted копирует только внешний список: "
                f"внутренние интервалы у ordered и intervals общие.")
    if line == 'return merged':
        return f"Блоки занятости: {ivs(merged)}."
    return f"Выполняется строка {fr['ln']}."


def attend_caption(line, fr, nxt, key):
    """Подписи к проверке встреч без конфликтов."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'ordered = sorted(intervals)':
        return f"ordered = {ivs(sorted(g('intervals')))}: встречи по возрастанию начала. Список intervals не меняется."
    if line == 'ordered = intervals':
        return f"Сортировки нет: ordered — тот же список в порядке заявок, {ivs(g('intervals'))}."
    if line.startswith('for i in range('):
        o = g('ordered')
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            i = nxt['raw']['i']
            return f"i = {i}: встреча ordered[{i}] = {iv(o[i])} сравнивается с предыдущей ordered[{i - 1}] = {iv(o[i - 1])}."
        if key == 'var_last_pair' and len(o) >= 2:
            k = len(o) - 1
            return (f"Цикл закончен на i = {k - 1}. Пара ordered[{k - 1}] и ordered[{k}] = {iv(o[k])} не проверена: "
                    f"range(1, len(ordered) - 1) не доходит до последнего индекса.")
        return "Все соседние пары проверены, конфликтов нет."
    if line in ('if ordered[i][0] < ordered[i - 1][1]:', 'if ordered[i][0] <= ordered[i - 1][1]:'):
        o, i = g('ordered'), g('i')
        s, pe = o[i][0], o[i - 1][1]
        if '<=' in line and s == pe:
            return (f"{s} ≤ {pe} истинно: встреча начинается в момент, когда предыдущая заканчивается. Общего времени нет, "
                    f"но эта версия считает касание конфликтом.")
        if s < pe:
            note = ''
            if key == 'bug_attend_nosort' and o[i][1] <= o[i - 1][0]:
                note = (f" Но {iv(o[i])} заканчивается до начала {iv(o[i - 1])}: встречи не пересекаются. "
                        f"Без сортировки условие сравнивает только начало одной встречи с концом другой.")
            return f"{s} < {pe}: встреча {iv(o[i])} начинается до конца {iv(o[i - 1])}.{note}"
        return f"{s} ≥ {pe}: встреча начинается не раньше конца предыдущей, конфликта нет."
    if line == 'return False':
        return "Конфликт найден, дальше проверять не нужно."
    if line == 'return True':
        return "Конфликтов нет: все встречи можно провести в одной переговорной."
    return f"Выполняется строка {fr['ln']}."


def insert_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    ivl = g('intervals')
    i = g('i')
    if line == 'start, end = new':
        return f"Новый интервал {iv(g('new'))}. Список intervals уже отсортирован и блоки в нём не пересекаются: сортировать не нужно."
    if line == 'result = []':
        return "result — ответ. Проход идёт слева направо, по каждому блоку один раз."
    if line == 'i = 0':
        return "i — первый ещё не обработанный блок."
    if line == 'while i < len(intervals) and intervals[i][1] < start:':
        if i < len(ivl) and ivl[i][1] < g('start'):
            return f"Блок {iv(ivl[i])} заканчивается в {ivl[i][1]}, раньше начала нового {g('start')}: он целиком левее и переходит в ответ без изменений."
        return "Блоки, которые целиком левее нового интервала, закончились."
    if line == 'result.append(list(intervals[i]))':
        return f"В ответ — копия блока {iv(ivl[i])}."
    if line == 'while i < len(intervals) and intervals[i][0] <= end:':
        if i < len(ivl) and ivl[i][0] <= g('end'):
            return f"Блок {iv(ivl[i])} начинается в {ivl[i][0]}, не позже конца нового {g('end')}: они пересекаются или касаются, блок вливается в новый."
        return f"Пересекающиеся блоки закончились. Новый интервал после слияния — {iv([g('start'), g('end')])}."
    if line == 'start = min(start, intervals[i][0])':
        return f"start = min({g('start')}, {ivl[i][0]}) = {min(g('start'), ivl[i][0])}."
    if line == 'end = max(end, intervals[i][1])':
        return f"end = max({g('end')}, {ivl[i][1]}) = {max(g('end'), ivl[i][1])}."
    if line == 'i += 1':
        return f"Переход к блоку {i + 1}."
    if line == 'result.append([start, end])':
        return f"В ответ — новый интервал после слияния: {iv([g('start'), g('end')])}."
    if line == 'while i < len(intervals):':
        if i < len(ivl):
            return f"Блок {iv(ivl[i])} правее нового интервала, он переходит в ответ без изменений."
        return "Блоки закончились."
    if line == 'return result':
        return f"Ответ: {ivs(g('result'))}."
    return f"Выполняется строка {fr['ln']}."


def mock_caption(line, fr, nxt, key):
    """Подписи к новым задачам тренажёра 12.6."""
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if key == 'remove_covered':
        if line.startswith('ordered = sorted('):
            o = sorted(g('intervals'), key=lambda p: (p[0], -p[1]))
            return (f"Ключ (start, −end): по возрастанию начала, а при равном начале первым идёт более длинный интервал. "
                    f"ordered = {o}.")
        if line == 'count = 0':
            return "count — сколько интервалов не покрыто другими."
        if line == 'reach = 0':
            return "reach — самый дальний конец среди уже пройденных интервалов."
        if line == 'for start, end in ordered:':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                return f"Следующий интервал [{nxt['raw']['start']}, {nxt['raw']['end']}]."
            return "Все интервалы пройдены."
        if line == 'if end > reach:':
            e, r = g('end'), g('reach')
            if e > r:
                return f"{e} > {r}: интервал выходит за все предыдущие, никем не покрыт."
            return f"{e} ≤ {r}: у пройденного интервала начало не больше {g('start')} и конец не меньше {e} — этот интервал покрыт."
        if line == 'count += 1':
            return f"count = {g('count')} + 1 = {g('count') + 1}."
        if line == 'reach = end':
            return f"reach = {g('end')}."
        if line == 'return count':
            return f"Остаётся интервалов: {g('count')}."
    if key == 'summary_ranges':
        nums, i, j = g('nums'), g('i'), g('j')
        if line == 'result = []':
            return "result — диапазоны в виде строк."
        if line == 'i = 0':
            return "i — начало текущего диапазона."
        if line == 'while i < len(nums):':
            return f"Новый диапазон начинается с nums[{i}] = {nums[i]}." if i < len(nums) else "Числа закончились."
        if line == 'j = i':
            return "j — конец диапазона, пока он из одного числа."
        if line == 'while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:':
            if j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
                return f"nums[{j + 1}] = {nums[j + 1]} = {nums[j]} + 1: число продолжает диапазон."
            return f"Следующего числа подряд нет: диапазон заканчивается на nums[{j}] = {nums[j]}."
        if line == 'j += 1':
            return f"j = {j + 1}."
        if line == 'if i == j:':
            return "Диапазон из одного числа записывается без стрелки." if i == j else f"Диапазон от {nums[i]} до {nums[j]}."
        if line.startswith('result.append('):
            return f"В ответ: {repr(str(nums[i]) if i == j else f'{nums[i]}->{nums[j]}')}."
        if line == 'i = j + 1':
            return f"Следующий диапазон начнётся с индекса {j + 1}."
        if line == 'return result':
            return f"Ответ: {g('result')}."
    if key == 'interval_intersections':
        a, b, i, j = g('first'), g('second'), g('i'), g('j')
        if line == 'result = []':
            return "result — пересечения. Оба списка уже отсортированы, сортировать не нужно."
        if line == 'i = j = 0':
            return "i идёт по first, j — по second: два указателя, как в модуле 8."
        if line == 'while i < len(first) and j < len(second):':
            if i < len(a) and j < len(b):
                return f"Сравниваются first[{i}] = {a[i]} и second[{j}] = {b[j]}."
            return "Один из списков закончился, пересечений больше нет."
        if line == 'start = max(first[i][0], second[j][0])':
            return f"Начало общей части — позднее из двух начал: max({a[i][0]}, {b[j][0]}) = {max(a[i][0], b[j][0])}."
        if line == 'end = min(first[i][1], second[j][1])':
            return f"Конец общей части — раннее из двух концов: min({a[i][1]}, {b[j][1]}) = {min(a[i][1], b[j][1])}."
        if line == 'if start <= end:':
            return (f"{g('start')} ≤ {g('end')}: общая часть есть." if g('start') <= g('end')
                    else f"{g('start')} > {g('end')}: интервалы не пересекаются.")
        if line == 'result.append([start, end])':
            return f"В ответ: [{g('start')}, {g('end')}]."
        if line == 'if first[i][1] < second[j][1]:':
            return (f"first[{i}] заканчивается раньше ({a[i][1]} < {b[j][1]}): дальше он ни с чем не пересечётся, i сдвигается."
                    if a[i][1] < b[j][1] else f"second[{j}] заканчивается не позже ({b[j][1]} ≤ {a[i][1]}): сдвигается j.")
        if line == 'i += 1':
            return f"i = {i + 1}."
        if line == 'j += 1':
            return f"j = {j + 1}."
        if line == 'return result':
            return f"Ответ: {g('result')}."
    if key == 'have_conflict':
        e1, e2 = g('event1'), g('event2')
        c1, c2 = e1[0] <= e2[1], e2[0] <= e1[1]
        return (f"Строки вида 'ЧЧ:ММ' с ведущими нулями сравниваются как время. {e1[0]!r} <= {e2[1]!r} — {c1}, "
                f"{e2[0]!r} <= {e1[1]!r} — {c2}. Оба конца включены, поэтому знак <=.")
    if key == 'car_points':
        if line == 'ordered = sorted(nums)':
            return f"ordered = {sorted(g('nums'))}: машины по возрастанию начала."
        if line == 'total = 0':
            return "total — сколько целых точек уже покрыто."
        if line == 'reach = 0':
            return "reach — самая правая покрытая точка. Точки начинаются с 1, поэтому 0 значит «ничего не покрыто»."
        if line == 'for start, end in ordered:':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                return f"Машина [{nxt['raw']['start']}, {nxt['raw']['end']}]: оба конца включены."
            return "Машины закончились."
        if line == 'if end > reach:':
            return (f"{g('end')} > {g('reach')}: машина покрывает новые точки." if g('end') > g('reach')
                    else f"{g('end')} ≤ {g('reach')}: все точки машины уже покрыты.")
        if line == 'total += end - max(start - 1, reach)':
            s, e, r = g('start'), g('end'), g('reach')
            first_new = max(s, r + 1)
            return f"Новые точки — с {first_new} по {e}: total = {g('total')} + {e} − {max(s - 1, r)} = {g('total') + e - max(s - 1, r)}."
        if line == 'reach = end':
            return f"reach = {g('end')}."
        if line == 'return total':
            return f"Покрыто точек: {g('total')}."
    return f"Выполняется строка {fr['ln']}."


MERGE_KEYS = {'merge_intervals', 'bug_touch', 'bug_end', 'bug_no_sort', 'bug_end_key', 'var_sort_inplace', 'var_alias', 'var_first'}
ATTEND_KEYS = {'can_attend', 'bug_attend_le', 'bug_attend_nosort', 'var_last_pair'}


def caption(line, fr, nxt, is_bug, key=''):
    if key in MERGE_KEYS:
        return merge_caption(line, fr, nxt, key)
    if key in ATTEND_KEYS:
        return attend_caption(line, fr, nxt, key)
    if key == 'insert_interval':
        return insert_caption(line, fr, nxt, key)
    return mock_caption(line, fr, nxt, key)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

DOCK = [[13, 15], [9, 12], [16, 18], [10, 11], [15, 16]]
FREE = [[13, 15], [9, 11], [15, 16], [11, 12]]
BUSY = [[9, 11], [13, 15], [10, 12]]
TRACES = {
    # Глава 12.2.
    'merge': ('merge_intervals', 'merge_intervals', (DOCK,), 'ordered', []),
    'bug_touch': ('bug_touch', 'merge_intervals', (DOCK,), 'ordered', []),
    'bug_end': ('bug_end', 'merge_intervals', (DOCK,), 'ordered', []),
    'bug_no_sort': ('bug_no_sort', 'merge_intervals', (DOCK,), 'intervals', []),
    # Глава 12.3.
    'attend_free': ('can_attend', 'can_attend', (FREE,), 'ordered', ['i']),
    'attend_busy': ('can_attend', 'can_attend', (BUSY,), 'ordered', ['i']),
    'bug_attend_le': ('bug_attend_le', 'can_attend', (FREE,), 'ordered', ['i']),
    'bug_attend_nosort': ('bug_attend_nosort', 'can_attend', (FREE,), 'ordered', ['i']),
    'bug_end_key': ('bug_end_key', 'merge_intervals', ([[1, 10], [2, 3], [4, 5]],), 'ordered', []),
    'fix_end_key': ('merge_intervals', 'merge_intervals', ([[1, 10], [2, 3], [4, 5]],), 'ordered', []),
    'insert': ('insert_interval', 'insert_interval', ([[9, 12], [13, 15], [16, 18]], [11, 14]), 'intervals', ['i']),
    # Глава 12.4: изменённая версия и верная на одном входе.
    'var_sort_inplace': ('var_sort_inplace', 'merge_intervals', (DOCK,), 'intervals', []),
    'var_alias': ('var_alias', 'merge_intervals', (DOCK,), 'ordered', []),
    'var_first': ('var_first', 'merge_intervals', ([],), 'ordered', []),
    'fix_first': ('merge_intervals', 'merge_intervals', ([],), 'ordered', []),
    'var_last_pair': ('var_last_pair', 'can_attend', ([[9, 11], [13, 15], [14, 16]],), 'ordered', ['i']),
    'fix_last_pair': ('can_attend', 'can_attend', ([[9, 11], [13, 15], [14, 16]],), 'ordered', ['i']),
    # Глава 12.6.
    'remove_covered': ('remove_covered', 'remove_covered', ([[1, 4], [3, 6], [2, 8]],), 'ordered', []),
    'summary_ranges': ('summary_ranges', 'summary_ranges', ([0, 1, 2, 4, 5, 7],), 'nums', ['i', 'j']),
    'interval_intersections': ('interval_intersections', 'interval_intersections',
                               ([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]), 'first', ['i']),
    'have_conflict': ('have_conflict', 'have_conflict', (['01:15', '02:00'], ['02:00', '03:00']), 'event1', []),
    'car_points': ('car_points', 'car_points', ([[3, 6], [1, 5], [4, 7]],), 'ordered', []),
}

if __name__ == '__main__':
    out = {name: engine.run_trace(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:22} frames={len(t['frames']):3} result={t['error'] or t['result']}  after={t['after']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 12. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
