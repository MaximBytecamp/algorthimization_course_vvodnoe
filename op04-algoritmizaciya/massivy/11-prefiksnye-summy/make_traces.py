"""Строит пошаговые прогоны для глав модуля 11 настоящим запуском Python.

Движок записи кадров — тот же, что в модуле 8 (../08-dva-ukazatelya/make_traces.py):
модуль загружается, ему подставляются исходники и подписи модуля 11.
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

# Глава 11.2.
SOURCES['range_sums'] = '''
def range_sums(nums, queries):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    answers = []
    for l, r in queries:
        if not 0 <= l <= r <= len(nums):
            raise ValueError("нужно 0 <= l <= r <= len(nums)")
        answers.append(prefix[r] - prefix[l])
    return answers
'''

# Ошибочные версии для главы 11.2.
SOURCES['bug_no_zero'] = '''
def range_sums(nums, queries):
    prefix = [0] * len(nums)
    prefix[0] = nums[0]
    for i in range(1, len(nums)):
        prefix[i] = prefix[i - 1] + nums[i]
    answers = []
    for l, r in queries:
        if not 0 <= l <= r <= len(nums):
            raise ValueError("нужно 0 <= l <= r <= len(nums)")
        answers.append(prefix[r - 1] - prefix[l - 1])
    return answers
'''
SOURCES['bug_r_incl'] = SOURCES['range_sums'].replace(
    'answers.append(prefix[r] - prefix[l])', 'answers.append(prefix[r + 1] - prefix[l])')
assert SOURCES['bug_r_incl'] != SOURCES['range_sums']


def seg(nums, l, r):
    """Срез nums[l:r] со значениями."""
    part = nums[l:r]
    return f"nums[{l}:{r}] = [{', '.join(str(x) for x in part)}]"


def plus(xs):
    """Сумма, записанная через знаки: 7 − 4 + 3."""
    if not xs:
        return '0'
    out = str(xs[0])
    for x in xs[1:]:
        out += f" − {-x}" if x < 0 else f" + {x}"
    return out


def add(a, b):
    """Сложение со знаком второго числа: 5 − 2 = 3."""
    return f"{a} − {-b} = {a + b}" if b < 0 else f"{a} + {b} = {a + b}"


def first(k):
    return 'первого числа' if k == 1 else f'первых {k} чисел'


def range_caption(line, fr, nxt, key, nums):
    """Подписи к сервису сумм на диапазонах и его ошибочным версиям."""
    g = fr['raw'].get
    ev = fr['ev']
    pre = g('prefix')
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'prefix = [0] * (len(nums) + 1)':
        return (f"prefix — список из len(nums) + 1 = {len(nums) + 1} ячеек. В prefix[i] будет сумма первых i чисел. "
                f"prefix[0] = 0: сумма нуля чисел.")
    if line == 'prefix = [0] * len(nums)':
        return f"prefix — список из len(nums) = {len(nums)} ячеек, на одну меньше, чем в верной версии. Ячейки для суммы нуля чисел нет."
    if line == 'prefix[0] = nums[0]':
        return f"prefix[0] = nums[0] = {nums[0]}. В этой версии prefix[i] — сумма чисел с 0 по i включительно."
    if line == 'for i in range(len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            i = nxt['raw']['i']
            return f"i = {i}: следующее число nums[{i}] = {nums[i]} добавляется к накопленной сумме."
        return f"Все {len(nums)} чисел пройдены, prefix готов: {pre}. Дальше каждый запрос стоит одно вычитание."
    if line == 'for i in range(1, len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            i = nxt['raw']['i']
            return f"i = {i}: к сумме добавляется nums[{i}] = {nums[i]}."
        return f"prefix готов: {pre}."
    if line == 'prefix[i + 1] = prefix[i] + nums[i]':
        i = g('i')
        return f"prefix[{i + 1}] = prefix[{i}] + nums[{i}] = {add(pre[i], nums[i])}: сумма {first(i + 1)}."
    if line == 'prefix[i] = prefix[i - 1] + nums[i]':
        i = g('i')
        return f"prefix[{i}] = prefix[{i - 1}] + nums[{i}] = {add(pre[i - 1], nums[i])}."
    if line == 'answers = []':
        return "answers — ответы на запросы в том же порядке, в каком пришли запросы."
    if line == 'for l, r in queries:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            l, r = nxt['raw']['l'], nxt['raw']['r']
            return f"Следующий запрос: l = {l}, r = {r} — сумма {seg(nums, l, r)}."
        return "Запросов больше нет, цикл закончен."
    if line == 'if not 0 <= l <= r <= len(nums):':
        l, r = g('l'), g('r')
        if 0 <= l <= r <= len(nums):
            return f"0 ≤ {l} ≤ {r} ≤ {len(nums)}: границы верные, исключения не будет."
        return f"Условие 0 ≤ {l} ≤ {r} ≤ {len(nums)} нарушено. Следующая строка прервёт функцию исключением."
    if line == 'answers.append(prefix[r] - prefix[l])':
        l, r = g('l'), g('r')
        want = sum(nums[l:r])
        if l == r:
            return f"l = r = {l}: диапазон пустой. prefix[{r}] − prefix[{l}] = {pre[r]} − {pre[l]} = 0."
        return (f"Ответ: prefix[{r}] − prefix[{l}] = {pre[r]} − {pre[l]} = {pre[r] - pre[l]}. "
                f"Проверка сложением: {plus(nums[l:r])} = {want}.")
    if line == 'answers.append(prefix[r + 1] - prefix[l])':
        l, r = g('l'), g('r')
        if r + 1 >= len(pre):
            return f"r + 1 = {r + 1}, а последняя ячейка prefix — {len(pre) - 1}. Обращение prefix[{r + 1}] выходит за конец списка."
        got = pre[r + 1] - pre[l]
        return (f"prefix[{r + 1}] − prefix[{l}] = {pre[r + 1]} − {pre[l]} = {got}. Это сумма nums[{l}:{r + 1}]: "
                f"в ответ попал nums[{r}] = {nums[r]}, которого в диапазоне [{l}, {r}) нет. Верный ответ — {sum(nums[l:r])}.")
    if line == 'answers.append(prefix[r - 1] - prefix[l - 1])':
        l, r = g('l'), g('r')
        got = pre[r - 1] - pre[l - 1]
        if l == 0:
            return (f"l = 0, поэтому l − 1 = −1, а prefix[−1] в Python — последняя ячейка списка, сумма всех чисел {pre[-1]}. "
                    f"prefix[{r - 1}] − prefix[−1] = {pre[r - 1]} − {pre[-1]} = {got}. Верный ответ — {sum(nums[l:r])}.")
        return f"prefix[{r - 1}] − prefix[{l - 1}] = {pre[r - 1]} − {pre[l - 1]} = {got}. Здесь ответ верный: l не равно 0."
    if line == 'return answers':
        return f"Все запросы обработаны. Ответы: {g('answers')}."
    return f"Выполняется строка {fr['ln']}."


def caption(line, fr, nxt, is_bug, key=''):
    return range_caption(line, fr, nxt, key, fr['raw'].get('nums'))


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

STORE = [5, -2, 7, -4, 3, 6, -1, 2]
TRACES = {
    # Глава 11.2.
    'range': ('range_sums', 'range_sums', (STORE, [(2, 5), (0, 8), (3, 3)]), 'prefix', ['l', 'r']),
    'bug_no_zero': ('bug_no_zero', 'range_sums', (STORE, [(2, 5), (0, 3)]), 'prefix', ['l', 'r']),
    'bug_r_incl': ('bug_r_incl', 'range_sums', (STORE, [(2, 5), (0, 3)]), 'prefix', ['l', 'r']),
}

if __name__ == '__main__':
    out = {name: engine.run_trace(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:16} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 11. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
