"""Строит пошаговые прогоны для глав модуля 10 настоящим запуском Python.

Движок записи кадров — тот же, что в модуле 8 (../08-dva-ukazatelya/make_traces.py):
модуль загружается, ему подставляются исходники и подписи модуля 10.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('engine', HERE.parent / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)

SOURCES = {}

# Глава 10.3.
SOURCES['longest_within'] = '''
def longest_within(nums, limit):
    if limit < 0:
        raise ValueError("limit должно быть не меньше 0")
    best = 0
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        while total > limit:
            total -= nums[l]
            l += 1
        best = max(best, r - l + 1)
    return best
'''

SOURCES['longest_within_brute'] = '''
def longest_within_brute(nums, limit):
    if limit < 0:
        raise ValueError("limit должно быть не меньше 0")
    best = 0
    for l in range(len(nums)):
        total = 0
        for r in range(l, len(nums)):
            total += nums[r]
            if total <= limit:
                best = max(best, r - l + 1)
    return best
'''

# Ошибочные версии для главы 10.3.
SOURCES['bug_best_early'] = '''
def longest_within(nums, limit):
    if limit < 0:
        raise ValueError("limit должно быть не меньше 0")
    best = 0
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        best = max(best, r - l + 1)
        while total > limit:
            total -= nums[l]
            l += 1
    return best
'''
SOURCES['bug_l_first'] = SOURCES['longest_within'].replace(
    '            total -= nums[l]\n            l += 1\n', '            l += 1\n            total -= nums[l]\n')
assert SOURCES['bug_l_first'] != SOURCES['longest_within']

# Глава 10.4.
SOURCES['shortest_window'] = '''
def shortest_window(nums, s):
    if s < 1:
        raise ValueError("s должно быть не меньше 1")
    best = 0
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        while total >= s:
            length = r - l + 1
            if best == 0 or length < best:
                best = length
            total -= nums[l]
            l += 1
    return best
'''

# Ошибочные версии для главы 10.4.
SOURCES['bug_after_while'] = '''
def shortest_window(nums, s):
    if s < 1:
        raise ValueError("s должно быть не меньше 1")
    best = 0
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        while total >= s:
            total -= nums[l]
            l += 1
        length = r - l + 1
        if best == 0 or length < best:
            best = length
    return best
'''
SOURCES['bug_gt'] = SOURCES['shortest_window'].replace('while total >= s:', 'while total > s:')
SOURCES['bug_min_zero'] = SOURCES['shortest_window'].replace(
    '            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n',
    '            best = min(best, r - l + 1)\n')
for _k in ('bug_gt', 'bug_min_zero'):
    assert SOURCES[_k] != SOURCES['shortest_window'], _k

SOURCES['longest_ones'] = '''
def longest_ones(nums, k):
    best = 0
    zeros = 0
    l = 0
    for r in range(len(nums)):
        if nums[r] == 0:
            zeros += 1
        while zeros > k:
            if nums[l] == 0:
                zeros -= 1
            l += 1
        best = max(best, r - l + 1)
    return best
'''

# Глава 10.5.
SOURCES['longest_unique'] = '''
def longest_unique(text):
    count = {}
    best = 0
    l = 0
    for r in range(len(text)):
        ch = text[r]
        count[ch] = count.get(ch, 0) + 1
        while count[ch] > 1:
            count[text[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best
'''

SOURCES['longest_unique_brute'] = '''
def longest_unique_brute(text):
    best = 0
    for l in range(len(text)):
        seen = set()
        for r in range(l, len(text)):
            if text[r] in seen:
                break
            seen.add(text[r])
            best = max(best, r - l + 1)
    return best
'''

SOURCES['longest_unique_jump'] = '''
def longest_unique_jump(text):
    last = {}
    best = 0
    l = 0
    for r in range(len(text)):
        ch = text[r]
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best
'''

# Ошибочные версии для главы 10.5.
SOURCES['bug_wrong_key'] = SOURCES['longest_unique'].replace('count[text[l]] -= 1', 'count[ch] -= 1')
SOURCES['bug_jump_back'] = SOURCES['longest_unique_jump'].replace('if ch in last and last[ch] >= l:', 'if ch in last:')
assert SOURCES['bug_wrong_key'] != SOURCES['longest_unique']
SOURCES['bug_if'] = SOURCES['longest_unique'].replace('while count[ch] > 1:', 'if count[ch] > 1:')
assert SOURCES['bug_if'] != SOURCES['longest_unique']
assert SOURCES['bug_jump_back'] != SOURCES['longest_unique_jump']


def win(l, r):
    """Окно с l по r включительно, записанное срезом."""
    return f'nums[{l}:{r + 1}]'


def shortest_caption(line, fr, nxt, key, nums, s):
    """Подписи к задаче о самом коротком отрезке с суммой не меньше s."""
    g = fr['raw'].get
    if line == 'if s < 1:':
        return f"Проверка порога: s = {s} не меньше 1, исключения не будет."
    if line == 'best = 0':
        return "best — длина самого короткого подходящего окна. Значение 0 означает, что такого окна пока не было."
    if line in ('while total >= s:', 'while total > s:'):
        t, l, r = g('total'), g('l'), g('r')
        strict = line.endswith('> s:')
        if (t > s) if strict else (t >= s):
            sign = '>' if strict else '≥'
            if key == 'bug_after_while':
                return f"{t} {sign} {s}: окно {win(l, r)} подходит, но его длина здесь не записывается. Окно сразу сжимается."
            return f"{t} {sign} {s}: окно {win(l, r)} подходит. Его длина записывается, затем окно сжимается."
        if strict and t == s:
            return (f"{t} > {s} ложно, поэтому цикл не выполняется. Но сумма окна {win(l, r)} равна порогу, "
                    f"окно подходит, и его длина {r - l + 1} осталась незаписанной.")
        if l > r:
            return f"{t} < {s}: окно пустое. Цикл while закончен."
        return f"{t} < {s}: окно {win(l, r)} не подходит. Цикл while закончен."
    if line == 'length = r - l + 1':
        t, l, r = g('total'), g('l'), g('r')
        c = r - l + 1
        if key == 'bug_after_while':
            what = 'пустое окно' if c == 0 else f'окно {win(l, r)} с суммой {t}'
            return f"После цикла осталось {what}, это меньше {s}: окно не подходит. Его длина всё равно вычисляется: {r} − {l} + 1 = {c}."
        return f"Длина подходящего окна: r − l + 1 = {r} − {l} + 1 = {c}."
    if line == 'if best == 0 or length < best:':
        b, c = g('best'), g('length')
        if b == 0:
            return f"best = 0: подходящих окон ещё не было, длина {c} записывается."
        if c < b:
            return f"{c} < {b}: окно короче лучшего из найденных, длина записывается."
        return f"{c} не меньше {b}: лучшая длина не меняется."
    if line == 'best = length':
        return f"best = {g('length')}."
    if line == 'best = min(best, r - l + 1)':
        b, c = g('best'), g('r') - g('l') + 1
        return (f"Длина подходящего окна {c}. best = min({b}, {c}) = {min(b, c)}: начальное значение 0 меньше любой длины, "
                f"поэтому best не меняется.")
    if line == 'return best':
        b = g('best')
        if b == 0:
            return "Все положения правой границы пройдены. В best осталось 0: функция сообщает, что подходящего окна нет."
        return f"Все положения правой границы пройдены. Длина самого короткого подходящего окна — {b}."
    return None


def ones_caption(line, fr, nxt, key, nums, k):
    """Подписи к задаче о единицах с заменой не больше k нулей."""
    g = fr['raw'].get
    if line == 'zeros = 0':
        return "zeros — состояние окна: число нулей в нём. Окно пока пустое."
    if line == 'if nums[r] == 0:':
        r = g('r')
        if nums[r] == 0:
            return f"nums[{r}] = 0: в окно пришёл ноль, его нужно посчитать."
        return f"nums[{r}] = 1: счётчик нулей не меняется."
    if line == 'zeros += 1':
        return f"Расширение: zeros = {g('zeros')} + 1 = {g('zeros') + 1}."
    if line == 'while zeros > k:':
        z, l, r = g('zeros'), g('l'), g('r')
        if z > k:
            return f"Нулей в окне {z}, это больше k = {k}: окно {win(l, r)} недопустимо. Его нужно сжать слева."
        if l > r:
            return f"Нулей в окне {z}, это не больше k = {k}: окно пустое, цикл while закончен."
        return f"Нулей в окне {z}, это не больше k = {k}: окно {win(l, r)} допустимо. Цикл while закончен."
    if line == 'if nums[l] == 0:':
        l = g('l')
        if nums[l] == 0:
            return f"Из окна уходит nums[{l}] = 0: ноль нужно убрать из счётчика."
        return f"Из окна уходит nums[{l}] = 1: счётчик нулей не меняется."
    if line == 'zeros -= 1':
        return f"Сжатие: zeros = {g('zeros')} − 1 = {g('zeros') - 1}."
    return None


def sub(text, l, r):
    """Окно строки с l по r включительно, в кавычках."""
    return "'" + ''.join(text[l:r + 1]) + "'" if l <= r else 'пустое'


def unique_caption(line, fr, nxt, key, text):
    """Подписи к задаче о подстроке без повторов."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'count = {}':
        return "count — частотная карта окна: символ → сколько раз он встречается в окне. Окно пустое, и карта пустая."
    if line == 'last = {}':
        return "last — словарь: символ → позиция, на которой он встретился в последний раз."
    if line == 'best = 0':
        return "best — длина самой длинной подстроки без повторов среди проверенных. Для пустой строки так и останется 0."
    if line == 'l = 0':
        return "l — индекс первого символа окна. Индекс последнего символа — r, его задаёт цикл for."
    if line == 'for l in range(len(text)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"l = {nxt['raw']['l']}: перебираются подстроки, которые начинаются с этой позиции."
        return "Все начала подстрок пройдены, внешний цикл завершён."
    if line == 'seen = set()':
        return "seen — множество символов текущей подстроки. Начало сменилось, поэтому множество собирается заново."
    if line == 'for r in range(l, len(text)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: к подстроке добавляется символ '{text[r]}'."
        return f"Строка закончилась, подстроки с началом {g('l')} пройдены."
    if line == 'if text[r] in seen:':
        r, l = g('r'), g('l')
        if text[r] in g('seen'):
            return (f"Символ '{text[r]}' уже есть в подстроке {sub(text, l, r - 1)}: повтор. "
                    f"Более длинные подстроки с началом {l} тоже содержат этот повтор.")
        return f"Символа '{text[r]}' в подстроке {sub(text, l, r - 1)} нет." if r > l else f"Подстрока пока пустая, символа '{text[r]}' в ней нет."
    if line == 'break':
        return f"Внутренний цикл прерван: с началом {g('l')} длиннее не получится."
    if line == 'seen.add(text[r])':
        return f"Символ '{text[g('r')]}' добавлен в множество. Подстрока {sub(text, g('l'), g('r'))} без повторов."
    if line == 'for r in range(len(text)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: правая граница сдвинулась, в окно входит символ '{text[r]}'."
        return "Правая граница дошла до конца строки, цикл for завершён."
    if line == 'ch = text[r]':
        return f"ch — символ, который пришёл в окно: '{text[g('r')]}'."
    if line == 'count[ch] = count.get(ch, 0) + 1':
        ch, c = g('ch'), g('count')
        if ch not in c:
            return f"Расширение: символа '{ch}' в карте нет, get возвращает 0. count['{ch}'] = 0 + 1 = 1."
        old = c[ch]
        tail = 'в окне его не было' if old == 0 else 'символ уже есть в окне'
        return f"Расширение: count['{ch}'] = {old} + 1 = {old + 1}, {tail}."
    if line == 'while count[ch] > 1:':
        ch, c, l, r = g('ch'), g('count'), g('l'), g('r')
        if c[ch] > 1:
            return f"count['{ch}'] = {c[ch]} > 1: в окне {sub(text, l, r)} символ '{ch}' встречается дважды. Окно нужно сжать слева."
        return f"count['{ch}'] = {c[ch]}: повторов в окне {sub(text, l, r)} нет. Цикл while закончен."
    if line == 'if count[ch] > 1:':
        ch, c, l, r = g('ch'), g('count'), g('l'), g('r')
        if c[ch] > 1:
            return f"count['{ch}'] = {c[ch]} > 1: в окне {sub(text, l, r)} символ '{ch}' встречается дважды. Оператор if выполнит сжатие один раз."
        return f"count['{ch}'] = {c[ch]}: условие ложно, сжатия нет. Окно — {sub(text, l, r)}."
    if line == 'count[text[l]] -= 1':
        l, c = g('l'), g('count')
        x = text[l]
        return f"Сжатие: из окна уходит text[{l}] = '{x}'. count['{x}'] = {c[x]} − 1 = {c[x] - 1}."
    if line == 'count[ch] -= 1':
        l, c, ch = g('l'), g('count'), g('ch')
        x = text[l]
        if x == ch:
            return f"Из окна уходит text[{l}] = '{x}', это тот же символ, что пришёл. count['{ch}'] = {c[ch]} − 1 = {c[ch] - 1}."
        return (f"Из окна уходит text[{l}] = '{x}', но уменьшается счётчик пришедшего символа: count['{ch}'] = {c[ch]} − 1 = {c[ch] - 1}. "
                f"В карте осталось count['{x}'] = {c[x]}, хотя символ '{x}' из окна ушёл.")
    if line == 'l += 1':
        l, r = g('l'), g('r')
        return f"l: {l} → {l + 1}. Окно теперь {sub(text, l + 1, r)}."
    if line in ('if ch in last and last[ch] >= l:', 'if ch in last:'):
        ch, last, l = g('ch'), g('last'), g('l')
        if ch not in last:
            return f"Символ '{ch}' раньше не встречался, левая граница остаётся на месте."
        p = last[ch]
        if p >= l:
            return f"Символ '{ch}' встречался на позиции {p}, она внутри окна: {p} ≥ l = {l}. Это повтор."
        if line == 'if ch in last:':
            return (f"Символ '{ch}' встречался на позиции {p}. Она левее окна: {p} < l = {l}, для окна это не повтор. "
                    f"Но условие проверяет только наличие символа в словаре и выполняется.")
        return f"Символ '{ch}' встречался на позиции {p}, но она левее окна: {p} < l = {l}. Для окна это не повтор."
    if line == 'l = last[ch] + 1':
        ch, last, l = g('ch'), g('last'), g('l')
        new = last[ch] + 1
        if new < l:
            return f"l = {last[ch]} + 1 = {new}. Левая граница сдвинулась назад: была {l}, стала {new}. В окно вернулись символы, которые из него уже ушли."
        return f"Левая граница переносится сразу за прошлое вхождение: l = {last[ch]} + 1 = {new}."
    if line == 'last[ch] = r':
        return f"last['{g('ch')}'] = {g('r')}: запомнена новая позиция символа."
    if line == 'best = max(best, r - l + 1)':
        r, l, b = g('r'), g('l'), g('best')
        c = r - l + 1
        w = sub(text, l, r)
        note = ''
        if len(set(text[l:r + 1])) != c:
            note = ' В этом окне есть повтор, но его длина сравнивается с лучшей.'
        return f"Длина окна {w}: r − l + 1 = {r} − {l} + 1 = {c}. best = max({b}, {c}) = {max(b, c)}.{note}"
    if line == 'return best':
        return f"Все положения правой границы пройдены. Длина самой длинной подстроки без повторов — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


def caption(line, fr, nxt, is_bug, key=''):
    v = fr['raw']
    g = v.get
    ev = fr['ev']
    if 'text' in v:
        return unique_caption(line, fr, nxt, key, g('text'))
    nums = g('nums')
    limit = g('limit')
    brute = key.endswith('brute')
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if 's' in v:
        special = shortest_caption(line, fr, nxt, key, nums, g('s'))
        if special:
            return special
    if 'k' in v:
        special = ones_caption(line, fr, nxt, key, nums, g('k'))
        if special:
            return special
    if line == 'if limit < 0:':
        return f"Проверка лимита: limit = {limit} не меньше 0, исключения не будет."
    if line == 'best = 0':
        return "best — длина самого длинного допустимого окна среди проверенных. Для пустого списка так и останется 0."
    if line == 'total = 0':
        if brute:
            return f"Начало отрезка сменилось, поэтому сумма считается заново, с нуля."
        return "total — состояние окна: сумма его элементов. Окно пока пустое, сумма 0."
    if line == 'l = 0':
        return "l — индекс первого элемента окна. Индекс последнего элемента — r, его задаёт цикл for."
    if line == 'for l in range(len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"l = {nxt['raw']['l']}: перебираются все отрезки, которые начинаются с этого индекса."
        return "Все начала отрезков пройдены, внешний цикл завершён."
    if line == 'for r in range(l, len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: следующий отрезок — {win(g('l'), r)}."
        return f"Отрезки с началом {g('l')} закончились."
    if line == 'for r in range(len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: правая граница сдвинулась, в окно входит nums[{r}] = {nums[r]}."
        return "Правая граница дошла до конца списка, цикл for завершён."
    if line == 'total += nums[r]':
        r, t = g('r'), g('total')
        if brute:
            return f"total = {t} + {nums[r]} = {t + nums[r]} — сумма отрезка {win(g('l'), r)}."
        return f"Расширение: пришедший элемент добавлен в состояние окна. total = {t} + {nums[r]} = {t + nums[r]}."
    if line == 'if total <= limit:':
        t, l, r = g('total'), g('l'), g('r')
        if t <= limit:
            return f"{t} ≤ {limit}: отрезок {win(l, r)} допустим."
        return (f"{t} > {limit}: отрезок {win(l, r)} недопустим, длина не записывается. Числа неотрицательные, "
                f"поэтому более длинные отрезки с началом {l} тоже недопустимы, но перебор проверяет и их.")
    if line == 'while total > limit:':
        t, l, r = g('total'), g('l'), g('r')
        if t > limit:
            return f"{t} > {limit}: окно {win(l, r)} недопустимо. Его нужно сжать слева."
        if l > r:
            return f"{t} ≤ {limit}: окно пустое, l = {l} стоит правее r = {r}. Пустое окно допустимо, цикл while закончен."
        return f"{t} ≤ {limit}: окно {win(l, r)} допустимо. Цикл while закончен."
    if line == 'total -= nums[l]':
        t, l = g('total'), g('l')
        if key == 'bug_l_first':
            if l >= len(nums):
                return f"l = {l} вышел за конец списка."
            return (f"l уже сдвинут, поэтому вычитается nums[{l}] = {nums[l]} — элемент, который остался в окне. "
                    f"Ушедший nums[{l - 1}] = {nums[l - 1]} остался в сумме. total = {t} − {nums[l]} = {t - nums[l]}.")
        return f"Сжатие: ушедший элемент nums[{l}] = {nums[l]} убран из состояния окна. total = {t} − {nums[l]} = {t - nums[l]}."
    if line == 'l += 1':
        l, r = g('l'), g('r')
        if key == 'bug_l_first':
            return f"l: {l} → {l + 1}. Граница сдвинута раньше, чем элемент nums[{l}] = {nums[l]} убран из суммы."
        if l + 1 > r:
            return f"l: {l} → {l + 1}. В окне не осталось элементов."
        return f"l: {l} → {l + 1}. Окно теперь {win(l + 1, r)}."
    if line == 'best = max(best, r - l + 1)':
        r, l, b, t = g('r'), g('l'), g('best'), g('total')
        c = r - l + 1
        head = f"Длина окна: r − l + 1 = {r} − {l} + 1 = {c}."
        if key == 'bug_best_early' and t > limit:
            head = f"Длина {c} записывается до сжатия, хотя сумма окна {win(l, r)} равна {t} и больше {limit}."
        return f"{head} best = max({b}, {c}) = {max(b, c)}."
    if line == 'return best':
        return f"Все положения правой границы пройдены. Длина самого длинного допустимого окна — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

EX = [4, 2, 5, 1, 1, 2, 1, 9]
LC209 = [2, 3, 1, 2, 4, 3]
TRACES = {
    # Глава 10.3.
    'within_brute': ('longest_within_brute', 'longest_within_brute', ([4, 2, 5, 1], 7), 'nums', ['l', 'r']),
    'within': ('longest_within', 'longest_within', (EX, 7), 'nums', ['l', 'r']),
    'bug_best_early': ('bug_best_early', 'longest_within', (EX, 7), 'nums', ['l', 'r']),
    'bug_l_first': ('bug_l_first', 'longest_within', (EX, 7), 'nums', ['l', 'r']),
    # Глава 10.4.
    'shortest': ('shortest_window', 'shortest_window', (LC209, 7), 'nums', ['l', 'r']),
    'bug_after_while': ('bug_after_while', 'shortest_window', (LC209, 7), 'nums', ['l', 'r']),
    'bug_gt': ('bug_gt', 'shortest_window', (LC209, 7), 'nums', ['l', 'r']),
    'bug_min_zero': ('bug_min_zero', 'shortest_window', (LC209, 7), 'nums', ['l', 'r']),
    'ones': ('longest_ones', 'longest_ones', ([1, 0, 1, 1, 0, 1, 0, 1], 1), 'nums', ['l', 'r']),
    # Глава 10.5. Строка передаётся списком символов, чтобы каждый символ стоял в своей ячейке.
    'unique_brute': ('longest_unique_brute', 'longest_unique_brute', (list('pwwkew'),), 'text', ['l', 'r']),
    'unique': ('longest_unique', 'longest_unique', (list('abcabcbb'),), 'text', ['l', 'r']),
    'bug_if': ('bug_if', 'longest_unique', (list('abba'),), 'text', ['l', 'r']),
    'fix_if': ('longest_unique', 'longest_unique', (list('abba'),), 'text', ['l', 'r']),
    'bug_wrong_key': ('bug_wrong_key', 'longest_unique', (list('pwwkew'),), 'text', ['l', 'r']),
    'fix_wrong_key': ('longest_unique', 'longest_unique', (list('pwwkew'),), 'text', ['l', 'r']),
    'bug_jump_back': ('bug_jump_back', 'longest_unique_jump', (list('abba'),), 'text', ['l', 'r']),
    'fix_jump_back': ('longest_unique_jump', 'longest_unique_jump', (list('abba'),), 'text', ['l', 'r']),
}

if __name__ == '__main__':
    out = {name: engine.run_trace(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:16} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 10. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
