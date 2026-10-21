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


# Глава 11.3.
SOURCES['pivot_index'] = '''
def pivot_index(nums):
    total = sum(nums)
    left = 0
    for i in range(len(nums)):
        right = total - left - nums[i]
        if left == right:
            return i
        left += nums[i]
    return -1
'''

# Ошибочные версии для главы 11.3.
SOURCES['bug_right'] = SOURCES['pivot_index'].replace('right = total - left - nums[i]', 'right = total - left')
SOURCES['bug_early'] = '''
def pivot_index(nums):
    total = sum(nums)
    left = 0
    for i in range(len(nums)):
        left += nums[i]
        right = total - left
        if left == right:
            return i
    return -1
'''
assert SOURCES['bug_right'] != SOURCES['pivot_index']

SOURCES['count_k_sums'] = '''
def count_k_sums(nums, k):
    seen = {0: 1}
    prefix = 0
    count = 0
    for r in range(len(nums)):
        prefix += nums[r]
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count
'''


# Изменённые версии для главы 11.4.
SOURCES['var_no_check'] = SOURCES['range_sums'].replace(
    '        if not 0 <= l <= r <= len(nums):\n            raise ValueError("нужно 0 <= l <= r <= len(nums)")\n', '')
SOURCES['var_start_one'] = SOURCES['pivot_index'].replace('for i in range(len(nums)):', 'for i in range(1, len(nums)):')
SOURCES['var_no_zero_key'] = SOURCES['count_k_sums'].replace('seen = {0: 1}', 'seen = {}')
SOURCES['var_order'] = SOURCES['count_k_sums'].replace(
    '        count += seen.get(prefix - k, 0)\n        seen[prefix] = seen.get(prefix, 0) + 1\n',
    '        seen[prefix] = seen.get(prefix, 0) + 1\n        count += seen.get(prefix - k, 0)\n')
for _k in ('var_no_check', 'var_start_one', 'var_no_zero_key', 'var_order'):
    assert SOURCES[_k] not in (SOURCES['range_sums'], SOURCES['pivot_index'], SOURCES['count_k_sums']), _k


# Глава 11.6, тренажёр. Ключ прогона совпадает с именем функции.
SOURCES['product_except_self'] = '''
def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    left = 1
    for i in range(n):
        answer[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= right
        right *= nums[i]
    return answer
'''

SOURCES['ways_to_split'] = '''
def ways_to_split(nums):
    total = sum(nums)
    left = 0
    count = 0
    for i in range(len(nums) - 1):
        left += nums[i]
        if left >= total - left:
            count += 1
    return count
'''

SOURCES['xor_queries'] = '''
def xor_queries(arr, queries):
    prefix = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        prefix[i + 1] = prefix[i] ^ arr[i]
    answers = []
    for l, r in queries:
        answers.append(prefix[r + 1] ^ prefix[l])
    return answers
'''

SOURCES['left_right_diff'] = '''
def left_right_diff(nums):
    total = sum(nums)
    left = 0
    answer = []
    for i in range(len(nums)):
        right = total - left - nums[i]
        answer.append(abs(left - right))
        left += nums[i]
    return answer
'''

SOURCES['nice_subarrays'] = '''
def nice_subarrays(nums, k):
    seen = {0: 1}
    odd = 0
    count = 0
    for r in range(len(nums)):
        odd += nums[r] % 2
        count += seen.get(odd - k, 0)
        seen[odd] = seen.get(odd, 0) + 1
    return count
'''


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


def minus(x):
    return str(x).replace('-', '−') if isinstance(x, int) and x < 0 else str(x)


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
            if l < 0 or r > len(nums) or l > r:
                return f"Следующий запрос: l = {l}, r = {r}. Такого диапазона в журнале нет."
            return f"Следующий запрос: l = {l}, r = {r} — сумма {seg(nums, l, r)}."
        return "Запросов больше нет, цикл закончен."
    if line == 'if not 0 <= l <= r <= len(nums):':
        l, r = g('l'), g('r')
        if 0 <= l <= r <= len(nums):
            return f"0 ≤ {l} ≤ {r} ≤ {len(nums)}: границы верные, исключения не будет."
        return f"Условие 0 ≤ {l} ≤ {r} ≤ {len(nums)} нарушено. Следующая строка прервёт функцию исключением."
    if line == 'answers.append(prefix[r] - prefix[l])':
        l, r = g('l'), g('r')
        if l < 0:
            return (f"l = {l}: такого дня нет, но Python читает prefix[{l}] с конца списка — это {pre[l]}, сумма всего журнала. "
                    f"prefix[{r}] − prefix[{l}] = {pre[r]} − {pre[l]} = {pre[r] - pre[l]}. Исключения нет.")
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


def pivot_caption(line, fr, nxt, key, nums):
    """Подписи к равновесному индексу и его ошибочным версиям."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'total = sum(nums)':
        return f"total — сумма всего списка: {plus(nums)} = {sum(nums)}. Её считают один раз, до цикла."
    if line == 'left = 0':
        return "left — сумма чисел левее текущего индекса. Левее индекса 0 чисел нет, поэтому 0."
    if line in ('for i in range(len(nums)):', 'for i in range(1, len(nums)):'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            i = nxt['raw']['i']
            head = ''
            if line.startswith('for i in range(1') and i == 1:
                head = f"Цикл начинается с 1: индекс 0 не проверяется, и nums[0] = {nums[0]} не попадёт в left. "
            return f"{head}i = {i}: проверяется, равны ли суммы слева и справа от nums[{i}] = {nums[i]}."
        return "Все индексы проверены, равновесного нет."
    if line == 'right = total - left - nums[i]':
        i, t, l = g('i'), g('total'), g('left')
        tail = ''
        if l != sum(nums[:i]):
            tail = f" Но настоящая сумма левее индекса {i} равна {sum(nums[:i])}, а в left {l}."
        return (f"right — сумма правее индекса {i}: из всей суммы убирают левую часть и само nums[{i}]. "
                f"right = {t} − {minus(l)} − {minus(nums[i])} = {t - l - nums[i]}.{tail}").replace('− −', '+ ').replace('− -', '+ ')
    if line == 'right = total - left':
        i, t, l = g('i'), g('total'), g('left')
        tail = (f"Число nums[{i}] = {nums[i]} осталось в right, хотя справа от индекса его нет: оно стоит на самом индексе."
                if key == 'bug_right' else f"left уже включает nums[{i}] = {nums[i]}.")
        return f"right = {t} − {minus(l)} = {t - l}. {tail}".replace('− −', '+ ').replace('− -', '+ ')
    if line == 'if left == right:':
        i, l, r = g('i'), g('left'), g('right')
        true_l, true_r = sum(nums[:i]), sum(nums[i + 1:])
        if l == r:
            return f"left = {l}, right = {r}: суммы равны, индекс {i} — равновесный."
        note = ''
        if (l, r) != (true_l, true_r) and true_l == true_r:
            note = f" Настоящие суммы слева и справа от индекса {i} равны: {true_l} и {true_r}. Индекс пропущен."
        return f"left = {l}, right = {r}: суммы не равны.{note}"
    if line == 'return i':
        return f"Найден самый левый равновесный индекс: {g('i')}."
    if line == 'left += nums[i]':
        i, l = g('i'), g('left')
        if key == 'bug_early':
            return f"left = {minus(l)} + {minus(nums[i])} = {l + nums[i]}. Число nums[{i}] попало в левую сумму до сравнения."
        return f"Переход к следующему индексу: nums[{i}] = {nums[i]} теперь левее. left = {add(l, nums[i])}."
    if line == 'return -1':
        return "Цикл прошёл весь список, равновесного индекса нет. Функция вернёт −1."
    return f"Выполняется строка {fr['ln']}."


def ksum_caption(line, fr, nxt, key, nums):
    """Подписи к подсчёту отрезков с суммой k."""
    g = fr['raw'].get
    ev = fr['ev']
    k = g('k')
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'seen = {0: 1}':
        return ("seen — словарь «префиксная сумма → сколько раз она уже встречалась». Запись {0: 1} — префикс из нуля "
                "чисел: без неё не посчитаются отрезки, которые начинаются с nums[0].")
    if line == 'seen = {}':
        return "seen — словарь префиксных сумм. Он пустой: префикса из нуля чисел с суммой 0 в нём нет."
    if line == 'prefix = 0':
        return "prefix — сумма чисел от начала списка до текущего включительно."
    if line == 'count = 0':
        return f"count — сколько отрезков с суммой {k} уже найдено."
    if line == 'for r in range(len(nums)):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: ищутся отрезки, которые заканчиваются на nums[{r}] = {nums[r]}."
        return "Все концы отрезков пройдены."
    if line == 'prefix += nums[r]':
        return f"prefix = {add(g('prefix'), nums[g('r')])}: сумма nums[0:{g('r') + 1}]."
    if line == 'count += seen.get(prefix - k, 0)':
        p, seen, r, c = g('prefix'), g('seen'), g('r'), g('count')
        need = p - k
        found = seen.get(need, 0)
        if not found:
            miss = ''
            if key == 'var_no_zero_key' and need == 0:
                miss = f" Но отрезок nums[0:{r + 1}] имеет сумму {k}: его префикс из нуля чисел в словарь не записан."
                return (f"Нужна префиксная сумма {p} − {minus(k)} = 0. В словаре её нет.{miss} count не меняется.").replace('− −', '+ ').replace('− -', '+ ')
            return (f"Отрезок nums[l:{r + 1}] имеет сумму {k}, если prefix[l] = {p} − {minus(k)} = {minus(need)}. "
                    f"Такой префиксной суммы раньше не было: отрезков с концом {r} нет.").replace('− −', '+ ').replace('− -', '+ ')
        ls = [l for l in range(r + 1) if sum(nums[:l]) == need]
        if key == 'var_no_zero_key' and 0 in ls:
            ls.remove(0)
            parts = '; '.join(f"nums[{l}:{r + 1}] = [{', '.join(str(x) for x in nums[l:r + 1])}]" for l in ls)
            return (f"Нужна префиксная сумма {p} − {minus(k)} = {minus(need)}. Она встречалась {found} раз: отрезок {parts}. "
                    f"Отрезок nums[0:{r + 1}] тоже имеет сумму {k}, но префикса из нуля чисел в словаре нет, и он не посчитан. "
                    f"count = {c} + {found} = {c + found}.")
        if key == 'var_order' and len(ls) < found:
            return (f"Нужна префиксная сумма {p} − {minus(k)} = {minus(need)}. В словаре seen[{need}] = {found}, но одну из этих "
                    f"записей сделала строка выше для текущего конца — это пустой отрезок nums[{r + 1}:{r + 1}]. Настоящих отрезков "
                    f"{len(ls)}. count = {c} + {found} = {c + found}.").replace('− −', '+ ').replace('− -', '+ ')
        parts = '; '.join(f"nums[{l}:{r + 1}] = [{', '.join(str(x) for x in nums[l:r + 1])}]" for l in ls)
        times = 'раз' if found == 1 or found >= 5 else 'раза'
        what = 'отрезок' if found == 1 else 'отрезки'
        return (f"Нужна префиксная сумма {p} − {minus(k)} = {minus(need)}. Она встречалась {found} {times}: "
                f"{what} {parts}. count = {c} + {found} = {c + found}.").replace('− −', '+ ').replace('− -', '+ ')
    if line == 'seen[prefix] = seen.get(prefix, 0) + 1':
        p, seen = g('prefix'), g('seen')
        return f"Префиксная сумма {p} записана в словарь: seen[{p}] = {seen.get(p, 0) + 1}. Её используют следующие концы."
    if line == 'return count':
        return f"Отрезков с суммой {k}: {g('count')}."
    return f"Выполняется строка {fr['ln']}."


PIVOT_KEYS = {'pivot_index', 'bug_right', 'bug_early', 'var_start_one'}
KSUM_KEYS = {'count_k_sums', 'var_no_zero_key', 'var_order'}


def mock_caption(line, fr, nxt, key, a):
    """Подписи к новым задачам тренажёра 11.6."""
    g = fr['raw'].get
    ev = fr['ev']
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    nums = g('nums')
    if key == 'product_except_self':
        ans = g('answer')
        if line == 'n = len(nums)':
            return f"n = {len(nums)}."
        if line == 'answer = [1] * n':
            return "answer — ответ. Первый проход запишет в answer[i] произведение чисел левее i."
        if line == 'left = 1':
            return "left — произведение чисел левее текущего индекса. Левее индекса 0 чисел нет, поэтому 1."
        if line == 'for i in range(n):':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                return f"i = {nxt['raw']['i']}: проход слева направо."
            return f"Первый проход закончен: answer = {ans} — произведения слева."
        if line == 'answer[i] = left':
            return f"answer[{g('i')}] = {g('left')}: произведение чисел левее индекса {g('i')}."
        if line == 'left *= nums[i]':
            i = g('i')
            return f"nums[{i}] = {nums[i]} уходит влево: left = {g('left')} · {nums[i]} = {g('left') * nums[i]}."
        if line == 'right = 1':
            return "right — произведение чисел правее текущего индекса. Второй проход идёт справа налево."
        if line == 'for i in range(n - 1, -1, -1):':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                return f"i = {nxt['raw']['i']}: проход справа налево."
            return f"Второй проход закончен: answer = {ans}."
        if line == 'answer[i] *= right':
            i = g('i')
            return f"answer[{i}] = {ans[i]} · {g('right')} = {ans[i] * g('right')}: произведение слева умножено на произведение справа."
        if line == 'right *= nums[i]':
            i = g('i')
            return f"nums[{i}] = {nums[i]} уходит вправо: right = {g('right')} · {nums[i]} = {g('right') * nums[i]}."
        if line == 'return answer':
            return f"Ответ: {ans}."
    if key in ('ways_to_split', 'left_right_diff'):
        if line == 'total = sum(nums)':
            return f"total — сумма всего списка: {sum(nums)}."
        if line == 'left = 0':
            return "left — сумма левой части. Пока она пустая."
        if line == 'count = 0':
            return "count — сколько разбиений уже подошло."
        if line == 'answer = []':
            return "answer — список ответов для каждого индекса."
        if line in ('for i in range(len(nums) - 1):', 'for i in range(len(nums)):'):
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                i = nxt['raw']['i']
                if key == 'ways_to_split':
                    return f"i = {i}: разрез после nums[{i}]. Правая часть не должна быть пустой, поэтому последний индекс не берётся."
                return f"i = {i}: считаются суммы слева и справа от nums[{i}] = {nums[i]}."
            return "Все индексы пройдены."
        if line == 'left += nums[i]':
            i = g('i')
            return f"nums[{i}] = {nums[i]} уходит в левую часть: left = {add(g('left'), nums[i])}."
        if line == 'if left >= total - left:':
            l, t = g('left'), g('total')
            ok = l >= t - l
            return f"Слева {l}, справа {t} − {minus(l)} = {t - l}.".replace('− −', '+ ') + (" Левая часть не меньше — разбиение подходит." if ok else " Левая часть меньше — не подходит.")
        if line == 'count += 1':
            return f"count = {g('count')} + 1 = {g('count') + 1}."
        if line == 'right = total - left - nums[i]':
            i, l, t = g('i'), g('left'), g('total')
            return f"right = {t} − {minus(l)} − {minus(nums[i])} = {t - l - nums[i]}.".replace('− −', '+ ')
        if line == 'answer.append(abs(left - right))':
            l, r = g('left'), g('right')
            return f"|left − right| = |{l} − {r}| = {abs(l - r)}."
        if line in ('return count', 'return answer'):
            return f"Ответ: {g('count') if line == 'return count' else g('answer')}."
    if key == 'xor_queries':
        arr, pre = g('arr'), g('prefix')
        if line == 'prefix = [0] * (len(arr) + 1)':
            return "prefix[i] — XOR первых i чисел. XOR нуля чисел — 0."
        if line == 'for i in range(len(arr)):':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                return f"i = {nxt['raw']['i']}."
            return f"prefix готов: {pre}."
        if line == 'prefix[i + 1] = prefix[i] ^ arr[i]':
            i = g('i')
            return f"prefix[{i + 1}] = {pre[i]} ^ {arr[i]} = {pre[i] ^ arr[i]}."
        if line == 'answers = []':
            return "answers — ответы на запросы."
        if line == 'for l, r in queries:':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                l, r = nxt['raw']['l'], nxt['raw']['r']
                return f"Запрос [{l}, {r}]: оба конца включительно, это arr[{l}:{r + 1}] = {arr[l:r + 1]}."
            return "Запросов больше нет."
        if line == 'answers.append(prefix[r + 1] ^ prefix[l])':
            l, r = g('l'), g('r')
            head = f"prefix[{r + 1}] ^ prefix[{l}] = {pre[r + 1]} ^ {pre[l]} = {pre[r + 1] ^ pre[l]}."
            if not g('answers'):
                head += " XOR одинаковых чисел даёт 0, поэтому числа левее l сокращаются, как при вычитании сумм."
            return head
        if line == 'return answers':
            return f"Ответы: {g('answers')}."
    if key == 'nice_subarrays':
        k = g('k')
        if line == 'seen = {0: 1}':
            return "seen — сколько раз встречалось каждое число нечётных среди префиксов. {0: 1} — префикс из нуля чисел."
        if line == 'odd = 0':
            return "odd — сколько нечётных чисел от начала списка до текущего включительно. Это префиксная сумма списка, где нечётное — 1, чётное — 0."
        if line == 'count = 0':
            return f"count — сколько найдено отрезков ровно с {k} нечётными."
        if line == 'for r in range(len(nums)):':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                r = nxt['raw']['r']
                return f"r = {r}: ищутся отрезки с концом на nums[{r}] = {nums[r]}."
            return "Все концы пройдены."
        if line == 'odd += nums[r] % 2':
            x = nums[g('r')]
            return f"nums[{g('r')}] = {x} {'нечётное' if x % 2 else 'чётное'}: odd = {g('odd')} + {x % 2} = {g('odd') + x % 2}."
        if line == 'count += seen.get(odd - k, 0)':
            o, seen, c = g('odd'), g('seen'), g('count')
            f = seen.get(o - k, 0)
            if o - k < 0:
                return f"Нечётных от начала пока {o}, это меньше k = {k}: отрезков с концом {g('r')} нет."
            return f"Нужен префикс с {o} − {k} = {o - k} нечётными. Он встречался {f} {'раз' if f in (0, 1) or f >= 5 else 'раза'}: count = {c} + {f} = {c + f}."
        if line == 'seen[odd] = seen.get(odd, 0) + 1':
            o = g('odd')
            return f"seen[{o}] = {g('seen').get(o, 0) + 1}."
        if line == 'return count':
            return f"Отрезков ровно с {k} нечётными: {g('count')}."
    return f"Выполняется строка {fr['ln']}."


MOCK_KEYS = {'product_except_self', 'ways_to_split', 'xor_queries', 'left_right_diff', 'nice_subarrays'}


def caption(line, fr, nxt, is_bug, key=''):
    nums = fr['raw'].get('nums')
    if key in MOCK_KEYS:
        return mock_caption(line, fr, nxt, key, nums)
    if key in PIVOT_KEYS:
        return pivot_caption(line, fr, nxt, key, nums)
    if key in KSUM_KEYS:
        return ksum_caption(line, fr, nxt, key, nums)
    return range_caption(line, fr, nxt, key, nums)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

STORE = [5, -2, 7, -4, 3, 6, -1, 2]
TRACES = {
    # Глава 11.2.
    'range': ('range_sums', 'range_sums', (STORE, [(2, 5), (0, 8), (3, 3)]), 'prefix', ['l', 'r']),
    'bug_no_zero': ('bug_no_zero', 'range_sums', (STORE, [(2, 5), (0, 3)]), 'prefix', ['l', 'r']),
    'bug_r_incl': ('bug_r_incl', 'range_sums', (STORE, [(2, 5), (0, 3)]), 'prefix', ['l', 'r']),
    # Глава 11.3.
    'pivot': ('pivot_index', 'pivot_index', ([1, 7, 3, 6, 5, 6],), 'nums', ['i']),
    'bug_right': ('bug_right', 'pivot_index', ([1, 7, 3, 6, 5, 6],), 'nums', ['i']),
    'bug_early': ('bug_early', 'pivot_index', ([1, 7, 3, 6, 5, 6],), 'nums', ['i']),
    'ksum': ('count_k_sums', 'count_k_sums', ([1, -1, 2, 1, -2, 3], 2), 'nums', ['r']),
    # Глава 11.4: изменённая версия и верная на одном входе.
    'var_no_check': ('var_no_check', 'range_sums', (STORE, [(-1, 2)]), 'prefix', ['l', 'r']),
    'fix_no_check': ('range_sums', 'range_sums', (STORE, [(-1, 2)]), 'prefix', ['l', 'r']),
    'var_start_one': ('var_start_one', 'pivot_index', ([2, 1, -1],), 'nums', ['i']),
    'fix_start_one': ('pivot_index', 'pivot_index', ([2, 1, -1],), 'nums', ['i']),
    'var_no_zero_key': ('var_no_zero_key', 'count_k_sums', ([1, -1, 2, 1, -2, 3], 2), 'nums', ['r']),
    'var_order': ('var_order', 'count_k_sums', ([3, -3], 0), 'nums', ['r']),
    'fix_order': ('count_k_sums', 'count_k_sums', ([3, -3], 0), 'nums', ['r']),
    # Глава 11.6.
    'product_except_self': ('product_except_self', 'product_except_self', ([1, 2, 3, 4],), 'answer', ['i']),
    'ways_to_split': ('ways_to_split', 'ways_to_split', ([10, 4, -8, 7],), 'nums', ['i']),
    'xor_queries': ('xor_queries', 'xor_queries', ([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]), 'prefix', ['l']),
    'left_right_diff': ('left_right_diff', 'left_right_diff', ([10, 4, 8, 3],), 'nums', ['i']),
    'nice_subarrays': ('nice_subarrays', 'nice_subarrays', ([1, 1, 2, 1, 1], 3), 'nums', ['r']),
}

if __name__ == '__main__':
    out = {name: engine.run_trace(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:16} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 11. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
