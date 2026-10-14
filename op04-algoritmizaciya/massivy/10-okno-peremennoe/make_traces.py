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

# Изменённые версии для главы 10.6.
SOURCES['var_no_check'] = SOURCES['shortest_window'].replace(
    '    if s < 1:\n        raise ValueError("s должно быть не меньше 1")\n', '')
SOURCES['var_best_n'] = SOURCES['shortest_window'].replace('    best = 0\n', '    best = len(nums)\n').replace(
    'if best == 0 or length < best:', 'if length < best:')
SOURCES['var_best_one'] = SOURCES['longest_unique'].replace('    best = 0\n', '    best = 1\n')
SOURCES['var_lower'] = SOURCES['longest_unique'].replace('ch = text[r]\n', 'ch = text[r].lower()\n')
for _k in ('var_no_check', 'var_best_n', 'var_best_one', 'var_lower'):
    assert _k in SOURCES and SOURCES[_k].count('\n') > 3

# Глава 10.8.
SOURCES['total_fruit'] = '''
def total_fruit(fruits):
    count = {}
    best = 0
    l = 0
    for r in range(len(fruits)):
        f = fruits[r]
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            count[fruits[l]] -= 1
            if count[fruits[l]] == 0:
                del count[fruits[l]]
            l += 1
        best = max(best, r - l + 1)
    return best
'''

SOURCES['total_fruit_brute'] = '''
def total_fruit_brute(fruits):
    best = 0
    for l in range(len(fruits)):
        kinds = set()
        for r in range(l, len(fruits)):
            kinds.add(fruits[r])
            if len(kinds) > 2:
                break
            best = max(best, r - l + 1)
    return best
'''

SOURCES['bug_no_del'] = SOURCES['total_fruit'].replace(
    '            if count[fruits[l]] == 0:\n                del count[fruits[l]]\n', '')
assert SOURCES['bug_no_del'] != SOURCES['total_fruit']

# Глава 10.11, тренажёр.
SOURCES['max_frequency'] = '''
def max_frequency(nums, k):
    count = {}
    best = 0
    l = 0
    for r in range(len(nums)):
        x = nums[r]
        count[x] = count.get(x, 0) + 1
        while count[x] > k:
            count[nums[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best
'''

SOURCES['max_erasure'] = '''
def max_erasure(nums):
    seen = set()
    total = 0
    best = 0
    l = 0
    for r in range(len(nums)):
        while nums[r] in seen:
            seen.remove(nums[l])
            total -= nums[l]
            l += 1
        seen.add(nums[r])
        total += nums[r]
        best = max(best, total)
    return best
'''

SOURCES['min_operations'] = '''
def min_operations(nums, x):
    target = sum(nums) - x
    if target < 0:
        return -1
    best = -1
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        while total > target:
            total -= nums[l]
            l += 1
        if total == target:
            best = max(best, r - l + 1)
    return -1 if best == -1 else len(nums) - best
'''

SOURCES['shortest_all_kinds'] = '''
def shortest_all_kinds(nums):
    need = len(set(nums))
    count = {}
    best = 0
    l = 0
    for r in range(len(nums)):
        x = nums[r]
        count[x] = count.get(x, 0) + 1
        while len(count) == need:
            length = r - l + 1
            if best == 0 or length < best:
                best = length
            count[nums[l]] -= 1
            if count[nums[l]] == 0:
                del count[nums[l]]
            l += 1
    return best
'''


def win(l, r):
    """Окно с l по r включительно, записанное срезом."""
    return f'nums[{l}:{r + 1}]'


def shortest_caption(line, fr, nxt, key, nums, s):
    """Подписи к задаче о самом коротком отрезке с суммой не меньше s."""
    g = fr['raw'].get
    if line == 'if s < 1:':
        if s < 1:
            return f"Проверка порога: s = {s} меньше 1. Следующая строка прервёт функцию исключением."
        return f"Проверка порога: s = {s} не меньше 1, исключения не будет."
    if line == 'best = 0':
        return "best — длина самого короткого подходящего окна. Значение 0 означает, что такого окна пока не было."
    if line == 'best = len(nums)':
        return f"best = len(nums) = {len(nums)}: длина всего списка взята как наибольшая возможная."
    if line == 'if length < best:':
        b_, c = g('best'), g('length')
        return f"{c} < {b_}: окно короче, длина записывается." if c < b_ else f"{c} не меньше {b_}: лучшая длина не меняется."
    if line in ('while total >= s:', 'while total > s:'):
        t, l, r = g('total'), g('l'), g('r')
        if key == 'var_no_check' and l > r:
            if t >= s:
                return f"Окно пустое, его сумма {t}, и {t} ≥ {s}: при пороге {s} условие истинно и для пустого окна. Цикл продолжается."
            return f"Окно пустое, а сумма {t} < {s}: в total вычтен элемент, которого в окне не было. Цикл while закончен."
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
        if key == 'var_no_check' and c == 0:
            return f"Длина пустого окна: {r} − {l} + 1 = 0. Пустое окно считается подходящим."
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
        if key == 'var_best_n' and b == len(nums) and sum(nums) < s:
            return (f"В best осталось начальное значение {b} = len(nums): ни одно окно не подошло, "
                    f"но функция возвращает длину всего списка, как будто подошёл весь список.")
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


def fruit_caption(line, fr, nxt, key, a):
    """Подписи к задаче о двух корзинах."""
    g = fr['raw'].get
    ev = fr['ev']
    seg = lambda l, r: '[' + ', '.join(str(x) for x in a[l:r + 1]) + ']' if l <= r else 'пустое'
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'count = {}':
        return "count — частотная карта окна: вид фрукта → сколько деревьев этого вида в окне. Число ключей — число занятых корзин."
    if line == 'best = 0':
        return "best — наибольшее число собранных фруктов среди проверенных окон."
    if line == 'l = 0':
        return "l — дерево, с которого начат сбор. r — последнее дерево окна, его задаёт цикл for."
    if line == 'for l in range(len(fruits)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"l = {nxt['raw']['l']}: сбор начинается с этого дерева."
        return "Все начала пройдены, внешний цикл завершён."
    if line == 'kinds = set()':
        return "kinds — виды фруктов в корзинах. Начало сменилось, корзины пустые."
    if line == 'for r in range(l, len(fruits)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: сборщик подходит к дереву с фруктом вида {a[r]}."
        return f"Деревья закончились, начало {g('l')} пройдено."
    if line == 'kinds.add(fruits[r])':
        return f"Вид {a[g('r')]} добавлен в множество: {sorted(g('kinds') | {a[g('r')]})}."
    if line == 'if len(kinds) > 2:':
        k = g('kinds')
        if len(k) > 2:
            return f"Видов {len(k)}: третий фрукт в две корзины не помещается. Сбор с начала {g('l')} закончен."
        return f"Видов {len(k)}, корзин хватает."
    if line == 'break':
        return f"Внутренний цикл прерван: дальше с начала {g('l')} идти нельзя."
    if line == 'for r in range(len(fruits)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: правая граница сдвинулась, в окно входит дерево с фруктом вида {a[r]}."
        return "Правая граница дошла до конца ряда, цикл for завершён."
    if line == 'f = fruits[r]':
        return f"f — вид фрукта на пришедшем дереве: {a[g('r')]}."
    if line == 'count[f] = count.get(f, 0) + 1':
        f, c = g('f'), g('count')
        old = c.get(f, 0)
        tail = '' if f in c else f" Вида {f} в карте не было: занята ещё одна корзина, ключей стало {len(c) + 1}."
        return f"Расширение: count[{f}] = {old} + 1 = {old + 1}.{tail}"
    if line == 'while len(count) > 2:':
        c, l, r = g('count'), g('l'), g('r')
        kinds = len(set(a[l:r + 1]))
        if len(c) > 2 and kinds <= 2:
            what = 'Окно пустое' if l > r else f"В окне {seg(l, r)} видов {kinds}"
            return (f"В карте {len(c)} ключа: {c}. {what}, но ключи со счётчиком 0 и меньше остались в карте, "
                    f"и условие len(count) > 2 истинно. Цикл продолжает сжимать окно.")
        if len(c) > 2:
            return f"В карте {len(c)} ключа: {c}. В окне {seg(l, r)} три вида, корзин две. Окно нужно сжать слева."
        return f"В карте {len(c)} {'ключ' if len(c) == 1 else 'ключа'}: {c}. Окно {seg(l, r)} допустимо, цикл while закончен."
    if line == 'count[fruits[l]] -= 1':
        l, c = g('l'), g('count')
        x = a[l]
        if l > g('r'):
            return (f"Окно пустое, но из карты вычитается дерево {l} с фруктом вида {x} — оно в окно ещё не входило. "
                    f"count[{x}] = {c[x]} − 1 = {c[x] - 1}.")
        return f"Сжатие: из окна уходит дерево {l} с фруктом вида {x}. count[{x}] = {c[x]} − 1 = {c[x] - 1}."
    if line == 'if count[fruits[l]] == 0:':
        l, c = g('l'), g('count')
        x = a[l]
        if c[x] == 0:
            return f"count[{x}] = 0: фруктов вида {x} в окне не осталось, корзина освободилась. Ключ нужно удалить."
        return f"count[{x}] = {c[x]}: фрукты вида {x} в окне ещё есть, ключ остаётся."
    if line == 'del count[fruits[l]]':
        x = a[g('l')]
        return f"Ключ {x} удалён из карты. Ключей стало {len(g('count')) - 1}."
    if line == 'l += 1':
        l, r = g('l'), g('r')
        if key == 'bug_no_del' and l + 1 > r:
            return f"l: {l} → {l + 1}. Окно пустое, но в карте по-прежнему {len(g('count'))} ключа."
        return f"l: {l} → {l + 1}. Окно теперь {seg(l + 1, r)}."
    if line == 'best = max(best, r - l + 1)':
        r, l, b = g('r'), g('l'), g('best')
        c = r - l + 1
        return f"Окно {seg(l, r)}: собрано {c}. best = max({b}, {c}) = {max(b, c)}."
    if line == 'return best':
        return f"Все положения правой границы пройдены. Наибольшее число фруктов — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


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
    if line == 'best = 1':
        return "best = 1: предполагается, что в строке есть хотя бы один символ, а подстрока из одного символа повторов не имеет."
    if line == 'ch = text[r].lower()':
        x = text[g('r')]
        return f"ch = '{x}'.lower() = '{x.lower()}': символ приведён к нижнему регистру, и в карту попадёт '{x.lower()}'."
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
        if not text:
            return "Строка пустая: range(0) не выдаёт ни одного значения, тело цикла не выполняется."
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
        if key == 'var_lower' and c[ch] > 1 and len(set(text[l:r + 1])) == r - l + 1:
            return (f"count['{ch}'] = {c[ch]} > 1: символы окна {sub(text, l, r)} разные, но после lower() они записаны "
                    f"под одним ключом '{ch}'. Окно считается окном с повтором и сжимается.")
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
        if not text:
            return f"Строка пустая, цикл не выполнился ни разу. Функция возвращает начальное значение best = {g('best')}."
        return f"Все положения правой границы пройдены. Длина самой длинной подстроки без повторов — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


def seg(a, l, r):
    return '[' + ', '.join(str(x) for x in a[l:r + 1]) + ']' if l <= r else 'пустое'


def mock_caption(line, fr, nxt, key, a):
    """Подписи к задачам тренажёра 10.11."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    l, r = g('l'), g('r')
    if line == 'l = 0':
        return "l — первый элемент окна, r — последний, его задаёт цикл for."
    if line == 'for r in range(len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            rr = nxt['raw']['r']
            return f"r = {rr}: правая граница сдвинулась, в окно входит nums[{rr}] = {a[rr]}."
        return "Правая граница дошла до конца списка, цикл for завершён."
    if line == 'count = {}':
        return "count — частотная карта окна: значение → сколько раз оно встречается в окне."
    if line == 'best = 0':
        return {'max_frequency': "best — длина самого длинного хорошего окна среди проверенных.",
                'max_erasure': "best — наибольшая сумма окна без повторов среди проверенных.",
                'shortest_all_kinds': "best — длина самого короткого окна со всеми видами. 0 — такого окна пока не было."}[key]
    if line == 'x = nums[r]':
        return f"x — значение, которое пришло в окно: {a[r]}."
    if line == 'count[x] = count.get(x, 0) + 1':
        c, x = g('count'), g('x')
        return f"Расширение: count[{x}] = {c.get(x, 0)} + 1 = {c.get(x, 0) + 1}."
    if line == 'while count[x] > k:':
        c, x, k = g('count'), g('x'), g('k')
        if c[x] > k:
            return f"count[{x}] = {c[x]} > k = {k}: значение {x} встречается в окне {seg(a, l, r)} слишком часто. Окно нужно сжать слева."
        return f"count[{x}] = {c[x]} ≤ {k}: окно {seg(a, l, r)} хорошее. Цикл while закончен."
    if line == 'count[nums[l]] -= 1':
        c = g('count')
        return f"Сжатие: уходит nums[{l}] = {a[l]}, count[{a[l]}] = {c[a[l]]} − 1 = {c[a[l]] - 1}."
    if line == 'l += 1':
        return f"l: {l} → {l + 1}. Окно теперь {seg(a, l + 1, r)}."
    if line == 'best = max(best, r - l + 1)':
        c, b = r - l + 1, g('best')
        return f"Длина окна {seg(a, l, r)}: {c}. best = max({b}, {c}) = {max(b, c)}."
    # max_erasure
    if line == 'seen = set()':
        return "seen — множество значений окна. Повторов в окне быть не должно."
    if line == 'total = 0':
        return "total — сумма окна. Окно пустое, сумма 0."
    if line == 'while nums[r] in seen:':
        if a[r] in g('seen'):
            return f"Значение {a[r]} уже есть в окне {seg(a, l, r - 1)}: после прихода будет повтор. Окно нужно сжать слева."
        return f"Значения {a[r]} в окне {seg(a, l, r - 1)} нет. Цикл while закончен."
    if line == 'seen.remove(nums[l])':
        return f"Сжатие: значение {a[l]} убрано из множества."
    if line == 'total -= nums[l]':
        tt = g('total')
        if key == 'min_operations':
            return f"Сжатие: уходит nums[{l}] = {a[l]}, total = {tt} − {a[l]} = {tt - a[l]}."
        return f"total = {tt} − {a[l]} = {tt - a[l]}."
    if line == 'seen.add(nums[r])':
        return f"Расширение: значение {a[r]} добавлено в множество."
    if line == 'total += nums[r]':
        tt = g('total')
        return f"total = {tt} + {a[r]} = {tt + a[r]}."
    if line == 'best = max(best, total)':
        b, tt = g('best'), g('total')
        return f"Сумма окна {seg(a, l, r)} без повторов: {tt}. best = max({b}, {tt}) = {max(b, tt)}."
    # min_operations
    if line == 'target = sum(nums) - x':
        return f"Убранные с краёв числа дают x, значит оставшийся отрезок подряд даёт sum(nums) − x = {sum(a)} − {g('x')} = {sum(a) - g('x')}."
    if line == 'if target < 0:':
        return f"target = {g('target')} не меньше 0: такой отрезок может существовать."
    if line == 'best = -1':
        return "best — длина самого длинного отрезка с суммой target. −1 — такого отрезка пока не было."
    if line == 'while total > target:':
        tt, tg = g('total'), g('target')
        if tt > tg:
            return f"{tt} > {tg}: сумма окна {seg(a, l, r)} больше нужной. Окно нужно сжать слева."
        return f"{tt} ≤ {tg}: цикл while закончен, окно {seg(a, l, r)}."
    if line == 'if total == target:':
        tt, tg = g('total'), g('target')
        if tt == tg:
            return f"Сумма окна {seg(a, l, r)} равна {tg}: эти числа можно оставить, а остальные убрать с краёв."
        return f"Сумма окна {tt} не равна {tg}, длина не записывается."
    if line == 'best = max(best, r - l + 1)' or line == 'best = max(best, r - l + 1) ':
        pass
    if line == 'return -1 if best == -1 else len(nums) - best':
        b = g('best')
        if b == -1:
            return "Отрезка с нужной суммой нет: свести x к нулю нельзя, ответ −1."
        return f"Самый длинный оставшийся отрезок — {b} чисел. Убрать нужно len(nums) − {b} = {len(a) - b}."
    # shortest_all_kinds
    if line == 'need = len(set(nums))':
        return f"need — сколько разных значений во всём списке: {len(set(a))}. Окно подходит, если в нём все они."
    if line == 'while len(count) == need:':
        c = g('count')
        if len(c) == g('need'):
            return f"В карте {len(c)} ключа — все виды. Окно {seg(a, l, r)} подходит: длина записывается, затем окно сжимается."
        return f"В карте {len(c)} из {g('need')} видов: окно {seg(a, l, r)} не подходит. Цикл while закончен."
    if line == 'length = r - l + 1':
        return f"Длина подходящего окна: {r} − {l} + 1 = {r - l + 1}."
    if line == 'if best == 0 or length < best:':
        b, c = g('best'), g('length')
        if b == 0:
            return f"Это первое подходящее окно, длина {c} записывается."
        return f"{c} < {b}: окно короче, длина записывается." if c < b else f"{c} не меньше {b}: лучшая длина не меняется."
    if line == 'best = length':
        return f"best = {g('length')}."
    if line == 'if count[nums[l]] == 0:':
        c = g('count')
        if c[a[l]] == 0:
            return f"Значения {a[l]} в окне не осталось: ключ нужно удалить, иначе len(count) посчитает его."
        return f"Значение {a[l]} в окне ещё есть, ключ остаётся."
    if line == 'del count[nums[l]]':
        return f"Ключ {a[l]} удалён. Видов в окне стало {len(g('count')) - 1}."
    if line == 'return best':
        b = g('best')
        return {'max_frequency': f"Все положения правой границы пройдены. Длина самого длинного хорошего окна — {b}.",
                'max_erasure': f"Все положения правой границы пройдены. Наибольшая сумма отрезка без повторов — {b}.",
                'shortest_all_kinds': f"Все положения правой границы пройдены. Самое короткое окно со всеми видами — {b}."}[key]
    return f"Выполняется строка {fr['ln']}."


MOCK_KEYS = {'max_frequency', 'max_erasure', 'min_operations', 'shortest_all_kinds'}


def caption(line, fr, nxt, is_bug, key=''):
    v = fr['raw']
    g = v.get
    ev = fr['ev']
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt, key, g('nums'))
    if 'text' in v:
        return unique_caption(line, fr, nxt, key, g('text'))
    if 'fruits' in v:
        return fruit_caption(line, fr, nxt, key, g('fruits'))
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
        if limit < 0:
            return f"Проверка лимита: limit = {limit} меньше 0. Следующая строка прервёт функцию исключением."
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
        if l >= len(nums):
            return f"l = {l}: элемента nums[{l}] в списке нет."
        if key == 'var_no_check' and l > g('r'):
            return (f"Окно пустое, но из суммы вычитается nums[{l}] = {nums[l]} — элемент, который в окно ещё не входил. "
                    f"total = {t} − {nums[l]} = {t - nums[l]}.")
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
    # Глава 10.6.
    'var_no_check': ('var_no_check', 'shortest_window', ([1, 2], 0), 'nums', ['l', 'r']),
    'fix_no_check': ('shortest_window', 'shortest_window', ([1, 2], 0), 'nums', ['l', 'r']),
    'var_best_n': ('var_best_n', 'shortest_window', ([1, 1, 1, 1], 5), 'nums', ['l', 'r']),
    'fix_best_n': ('shortest_window', 'shortest_window', ([1, 1, 1, 1], 5), 'nums', ['l', 'r']),
    'var_best_one': ('var_best_one', 'longest_unique', ([],), 'text', ['l', 'r']),
    'fix_best_one': ('longest_unique', 'longest_unique', ([],), 'text', ['l', 'r']),
    'var_lower': ('var_lower', 'longest_unique', (list('aA'),), 'text', ['l', 'r']),
    'fix_lower': ('longest_unique', 'longest_unique', (list('aA'),), 'text', ['l', 'r']),
    # Глава 10.8.
    'fruit_brute': ('total_fruit_brute', 'total_fruit_brute', ([1, 2, 3, 2, 2],), 'fruits', ['l', 'r']),
    'fruit': ('total_fruit', 'total_fruit', ([1, 2, 3, 2, 2],), 'fruits', ['l', 'r']),
    'bug_no_del': ('bug_no_del', 'total_fruit', ([1, 2, 3, 2, 2],), 'fruits', ['l', 'r']),
    # Глава 10.11. Ключ прогона совпадает с именем функции: по нему выбираются подписи.
    'max_frequency': ('max_frequency', 'max_frequency', ([1, 2, 3, 1, 2, 3, 1, 2], 2), 'nums', ['l', 'r']),
    'max_erasure': ('max_erasure', 'max_erasure', ([4, 2, 4, 5, 6],), 'nums', ['l', 'r']),
    'min_operations': ('min_operations', 'min_operations', ([1, 1, 4, 2, 3], 5), 'nums', ['l', 'r']),
    'shortest_all_kinds': ('shortest_all_kinds', 'shortest_all_kinds', ([5, 5, 1, 5, 5, 2, 1],), 'nums', ['l', 'r']),
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
