"""Строит пошаговые прогоны для глав модуля 8 настоящим запуском Python.

Каждый кадр — состояние перед выполнением строки: номер строки, значения
переменных, содержимое списка. Подпись кадра считается по этому состоянию.
Результат пишется в traces.js как window.TRACES = {...}.
"""
import copy
import json
import sys
import textwrap

SOURCES = {}

SOURCES['pair_sum'] = '''
def pair_sum(prices, target):
    i, j = 0, len(prices) - 1
    while i < j:
        s = prices[i] + prices[j]
        if s == target:
            return (i, j)
        if s < target:
            i += 1
        else:
            j -= 1
    return None
'''

SOURCES['pair_sum_brute'] = '''
def pair_sum_brute(prices, target):
    n = len(prices)
    for i in range(n):
        for j in range(i + 1, n):
            if prices[i] + prices[j] == target:
                return (i, j)
    return None
'''

SOURCES['dedup_sorted'] = '''
def dedup_sorted(ids):
    if not ids:
        return 0
    w = 1
    for r in range(1, len(ids)):
        if ids[r] != ids[w - 1]:
            ids[w] = ids[r]
            w += 1
    del ids[w:]
    return w
'''

SOURCES['compress'] = '''
def compress(chars):
    w = 0
    r = 0
    n = len(chars)
    while r < n:
        start = r
        while r < n and chars[r] == chars[start]:
            r += 1
        chars[w] = chars[start]
        w += 1
        count = r - start
        if count > 1:
            for d in str(count):
                chars[w] = d
                w += 1
    del chars[w:]
    return w
'''

SOURCES['move_zeros'] = '''
def move_zeros(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w], nums[r] = nums[r], nums[w]
            w += 1
'''

SOURCES['split_by_limit'] = '''
def split_by_limit(nums, limit):
    i, j = 0, len(nums) - 1
    while i <= j:
        if nums[i] < limit:
            i += 1
        elif nums[j] >= limit:
            j -= 1
        else:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
            j -= 1
    return i
'''

SOURCES['sort_colors'] = '''
def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
'''

SOURCES['is_subsequence'] = '''
def is_subsequence(word, text):
    i = 0
    for j in range(len(text)):
        if i < len(word) and text[j] == word[i]:
            i += 1
    return i == len(word)
'''

SOURCES['best_pair_sum'] = '''
def best_pair_sum(prices, budget):
    prices = sorted(prices)
    i, j = 0, len(prices) - 1
    best = -1
    while i < j:
        s = prices[i] + prices[j]
        if s <= budget:
            best = max(best, s)
            i += 1
        else:
            j -= 1
    return best
'''

SOURCES['pair_sum_set'] = '''
def pair_sum_set(prices, target):
    seen = {}
    for j, p in enumerate(prices):
        if target - p in seen:
            return (seen[target - p], j)
        seen.setdefault(p, j)
    return None
'''

SOURCES['pair_sum_sorted_copy'] = '''
def pair_sum_sorted_copy(prices, target):
    ordered = sorted(prices)
    answer = pair_sum(ordered, target)
    if answer is None:
        return None
    i, j = answer
    return (ordered[i], ordered[j])
'''

SOURCES['best_pair_sum_brute'] = '''
def best_pair_sum_brute(prices, budget):
    best = -1
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            s = prices[i] + prices[j]
            if s <= budget:
                best = max(best, s)
    return best
'''

# Ошибочные версии для главы про ошибки.
SOURCES['bug_same_item'] = SOURCES['pair_sum'].replace('while i < j:', 'while i <= j:')
SOURCES['bug_wrong_move'] = SOURCES['pair_sum'].replace(
    '        if s < target:\n            i += 1\n        else:\n            j -= 1',
    '        if s < target:\n            j -= 1\n        else:\n            i += 1')
SOURCES['bug_zeros_assign'] = SOURCES['move_zeros'].replace(
    'nums[w], nums[r] = nums[r], nums[w]', 'nums[w] = nums[r]')
SOURCES['bug_dedup_neighbour'] = SOURCES['dedup_sorted'].replace(
    '    if not ids:\n        return 0\n    w = 1\n    for r in range(1, len(ids)):\n        if ids[r] != ids[w - 1]:',
    '    w = 0\n    for r in range(len(ids) - 1):\n        if ids[r] != ids[r + 1]:')

SOURCES['bug_compress_str'] = SOURCES['compress'].replace(
    '            for d in str(count):\n                chars[w] = d\n                w += 1',
    '            chars[w] = str(count)\n            w += 1')

# Изменённые версии: одна строка записана иначе, чем в верной функции.
SOURCES['var_check_late'] = SOURCES['pair_sum'].replace(
    '        if s == target:\n            return (i, j)\n        if s < target:\n            i += 1\n        else:\n            j -= 1',
    '        if s < target:\n            i += 1\n        else:\n            j -= 1\n        if s == target:\n            return (i, j)')
SOURCES['var_return_inside'] = SOURCES['pair_sum'].replace('\n    return None', '\n        return None')
SOURCES['var_j_len'] = SOURCES['pair_sum'].replace('i, j = 0, len(prices) - 1', 'i, j = 0, len(prices)')
SOURCES['var_move_j'] = SOURCES['pair_sum'].replace(
    '        if s < target:\n            i += 1', '        if s < target:\n            j -= 1')
SOURCES['var_both'] = SOURCES['pair_sum'].replace(
    '        else:\n            j -= 1', '        else:\n            j -= 1\n            i += 1')
SOURCES['var_no_return'] = SOURCES['pair_sum'].replace('\n    return None', '')
SOURCES['bug_dedup_no_check'] = SOURCES['dedup_sorted'].replace('    if not ids:\n        return 0\n', '')
SOURCES['bug_compress_and_order'] = SOURCES['compress'].replace(
    'while r < n and chars[r] == chars[start]:', 'while chars[r] == chars[start] and r < n:')
SOURCES['bug_subseq_no_guard'] = SOURCES['is_subsequence'].replace(
    'if i < len(word) and text[j] == word[i]:', 'if text[j] == word[i]:')
SOURCES['bug_split_strict'] = SOURCES['split_by_limit'].replace('while i <= j:', 'while i < j:')
SOURCES['bug_colors_mid_moves'] = SOURCES['sort_colors'].replace(
    '            high -= 1', '            high -= 1\n            mid += 1')

for _k, _base in [('bug_same_item', 'pair_sum'), ('bug_wrong_move', 'pair_sum'), ('bug_zeros_assign', 'move_zeros'),
                  ('bug_dedup_neighbour', 'dedup_sorted'), ('bug_compress_str', 'compress'), ('var_check_late', 'pair_sum'),
                  ('var_return_inside', 'pair_sum'), ('var_j_len', 'pair_sum'), ('var_move_j', 'pair_sum'),
                  ('var_both', 'pair_sum'), ('var_no_return', 'pair_sum'), ('bug_dedup_no_check', 'dedup_sorted'),
                  ('bug_compress_and_order', 'compress'), ('bug_subseq_no_guard', 'is_subsequence'),
                  ('bug_split_strict', 'split_by_limit'), ('bug_colors_mid_moves', 'sort_colors')]:
    assert SOURCES[_k] != SOURCES[_base], f'замена в {_k} не сработала'


def is_variant(key):
    return key.startswith(('bug_', 'var_'))


def run_trace(key, func_name, args, arr_name, ptrs):
    src = textwrap.dedent(SOURCES[key]).strip('\n')
    ns = {}
    exec(compile(src, f'<{key}>', 'exec'), ns)
    func = ns[func_name]
    code = func.__code__
    first = code.co_firstlineno
    frames = []

    def snap(frame, event, arg=None):
        loc = frame.f_locals
        vars_ = {}
        for k, v in loc.items():
            if k == arr_name:
                continue
            vars_[k] = repr(v)
        frames.append({
            'ln': frame.f_lineno - first + 1,
            'ev': event,
            'vars': vars_,
            'arr': copy.copy(loc.get(arr_name)),
            'ret': repr(arg) if event == 'return' else None,
            'err': f'{arg[0].__name__}: {arg[1]}' if event == 'exc' else None,
            'raw': {k: copy.copy(v) for k, v in loc.items()},
        })

    def tracer(frame, event, arg):
        if frame.f_code is not code:
            return None
        if event == 'line':
            snap(frame, 'line')
        elif event == 'exception':
            snap(frame, 'exc', arg)
        elif event == 'return' and not (frames and frames[-1]['ev'] == 'exc'):
            snap(frame, 'return', arg)
        return tracer

    call_args = copy.deepcopy(args)
    error = None
    sys.settrace(tracer)
    try:
        result = func(*call_args)
    except Exception as e:
        result, error = None, f'{type(e).__name__}: {e}'
    finally:
        sys.settrace(None)
    # Кадр исключения повторяет строку, на которой оно возникло: показываем
    # строку один раз, уже с ошибкой.
    if error and len(frames) > 1 and frames[-2]['ev'] == 'line' and frames[-2]['ln'] == frames[-1]['ln']:
        del frames[-2]
    lines = src.split('\n')
    for k, fr in enumerate(frames):
        nxt = frames[k + 1] if k + 1 < len(frames) else None
        fr['say'] = caption(lines[fr['ln'] - 1].strip(), fr, nxt, is_variant(key), key)
    for fr in frames:
        del fr['raw']
    return {
        'code': lines,
        'frames': frames,
        'arr_name': arr_name,
        'ptrs': ptrs,
        'call': f"{func_name}({', '.join(repr(a) for a in args)})",
        'result': repr(result),
        'error': error,
        'after': repr(call_args[0]),
    }


def q(v):
    """Значение так, как его печатает Python."""
    return repr(v)


def special_caption(key, line, fr, nxt):
    """Подписи, которые зависят от версии функции, а не только от строки."""
    v = fr['raw']
    g = v.get
    ev = fr['ev']
    arr = next((x for x in v.values() if isinstance(x, list)), None)
    if ev == 'return':
        return None

    if key == 'pair_sum_set':
        if line == 'seen = {}':
            return "seen — словарь «цена → индекс». В нём будут цены, которые уже прочитаны. Пока он пустой."
        if line == 'for j, p in enumerate(prices):':
            if nxt is not None and nxt['ln'] == fr['ln'] + 1:
                nj, np_ = nxt['raw']['j'], nxt['raw']['p']
                return f"enumerate выдаёт следующую пару «индекс, цена»: j = {nj}, p = {np_}."
            return "Цены закончились, цикл for завершён."
        if line == 'if target - p in seen:':
            need = g('target') - g('p')
            yes = need in g('seen')
            return (f"Парная цена для {g('p')}: {g('target')} − {g('p')} = {need}. Она уже встречалась? "
                    + (f"Да, на индексе {g('seen')[need]}." if yes else "Нет, такой цены в seen ещё нет."))
        if line == 'return (seen[target - p], j)':
            need = g('target') - g('p')
            return f"Пара найдена: цена {need} на индексе {g('seen')[need]} и цена {g('p')} на индексе {g('j')}."
        if line == 'seen.setdefault(p, j)':
            return f"Запоминаем цену {g('p')} с индексом {g('j')}: следующие цены смогут найти её парой."

    if key == 'var_j_len':
        if line == 'i, j = 0, len(prices)':
            n = len(arr)
            return f"i = 0, j = len(prices) = {n}. Индексы списка идут от 0 до {n - 1}: элемента с индексом {n} нет."
        if ev == 'exc':
            return (f"Нужно прочитать prices[{g('j')}], а последний индекс списка {len(arr) - 1}. "
                    f"Обращение за границу списка прерывает функцию: {fr['err']}.")

    if key == 'var_check_late' and ev == 'line':
        if line == 'if s == target:':
            return (f"Проверка равенства стоит после сдвига. s = {g('s')} — сумма пары, которая была до сдвига, "
                    f"а указатели уже стоят на i = {g('i')}, j = {g('j')}. "
                    + ("Сумма равна цели." if g('s') == g('target') else "Сумма не равна цели."))
        if line == 'return (i, j)':
            same = ' Это один и тот же индекс дважды.' if g('i') == g('j') else ''
            return f"Возвращаем текущие индексы ({g('i')}, {g('j')}), а сумма {g('s')} была у другой пары.{same}"

    if key == 'var_return_inside' and line == 'return None':
        return ("return None стоит внутри цикла, на одном уровне с if. Он выполняется на первом же шаге, "
                "когда пара ещё не найдена, и функция заканчивает работу.")

    if key in ('bug_wrong_move', 'var_move_j', 'var_both') and ev == 'line':
        if line == 'j -= 1' and g('s') < g('target'):
            return (f"Сумма {g('s')} меньше цели, а сдвигается j: {g('j')} → {g('j') - 1}. Правая цена станет дешевле, "
                    f"и сумма уменьшится ещё. Цена {arr[g('j')]} исключается без основания: при сумме меньше цели "
                    f"правило исключает левую цену.")
        if line == 'i += 1' and g('s') > g('target'):
            return (f"Сумма {g('s')} больше цели, а сдвигается i: {g('i')} → {g('i') + 1}. Левая цена станет дороже, "
                    f"и сумма вырастет ещё. Цена {arr[g('i')]} исключается без основания: при сумме больше цели "
                    f"правило исключает правую цену.")

    if key == 'bug_dedup_neighbour' and line.startswith('for r in'):
        if nxt is None or nxt['ln'] != fr['ln'] + 1:
            n = len(arr)
            return (f"range(len(ids) - 1) закончился на r = {n - 2}. Последний элемент ids[{n - 1}] = {arr[n - 1]} "
                    f"цикл не прочитал и не записал.")

    if key == 'bug_dedup_no_check':
        if line == 'w = 1':
            return ("w = 1 означает, что первый элемент уже оставлен. В пустом списке первого элемента нет, "
                    "но проверки на пустой список в этой версии нет.")
        if line.startswith('for r in') and (nxt is None or nxt['ln'] != fr['ln'] + 1):
            return "range(1, 0) не содержит ни одного числа: цикл не выполняется ни разу."
        if line == 'return w':
            return "Возвращаем w = 1: функция сообщает, что в пустом списке одно различное значение."

    if key == 'bug_compress_str' and line == 'chars[w] = str(count)':
        c = g('count')
        return (f"Записываем длину серии одним элементом: chars[{g('w')}] = str({c}) = {str(c)!r}. "
                f"В числе {len(str(c))} цифры, и обе попадают в один элемент списка.")

    if key == 'bug_compress_and_order' and line == 'while chars[r] == chars[start] and r < n:':
        if ev == 'exc':
            return (f"r = {g('r')} = n: серия дошла до конца списка. Первой выполняется проверка chars[{g('r')}], "
                    f"а такого индекса нет — {fr['err']}. До r < n дело не доходит.")
        same = arr[g('r')] == arr[g('start')]
        return (f"chars[{g('r')}] = {arr[g('r')]!r}, начало серии — {arr[g('start')]!r}: "
                + ('тот же символ, серия продолжается.' if same else 'другой символ, серия закончилась.'))

    if key == 'bug_subseq_no_guard' and line == 'if text[j] == word[i]:':
        if ev == 'exc':
            return (f"Все {len(g('word'))} буквы слова уже найдены, i = {g('i')}. Сравнение читает word[{g('i')}], "
                    f"а такого индекса в слове нет — {fr['err']}.")
        c, w = g('text')[g('j')], g('word')[g('i')]
        return f"text[{g('j')}] = {c!r}, следующая нужная буква word[{g('i')}] = {w!r}: " + ('совпали.' if c == w else 'не совпали.')

    if key == 'bug_split_strict' and line == 'while i < j:' and g('i') == g('j'):
        return (f"Условие цикла: {g('i')} < {g('j')} — нет, цикл закончен. Но nums[{g('i')}] = {arr[g('i')]} "
                f"ещё не сравнивалось с порогом и не отнесено ни к одной группе.")

    if key == 'bug_colors_mid_moves' and line == 'mid += 1' and fr['ln'] == 13:
        return (f"mid: {g('mid')} → {g('mid') + 1}. На место mid только что пришло число {arr[g('mid')]} "
                f"из непрочитанной части, и оно так и останется непроверенным.")
    return None


def caption(line, fr, nxt, is_bug, key=''):
    """Подпись к кадру: что делает строка при этих значениях переменных."""
    v = fr['raw']
    ev = fr['ev']
    arr = next((x for x in v.values() if isinstance(x, list)), None)
    g = v.get
    special = special_caption(key, line, fr, nxt)
    if special:
        return special
    if ev == 'exc':
        return f"Строка выполняется и прерывает функцию исключением {fr['err']}. Ответа функция не вернула."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    yes = lambda c: 'да' if c else 'нет'

    if 'word' in v:
        if line == 'i = 0':
            return "i — сколько букв слова уже найдено в тексте по порядку. Пока ни одной."
        if line == 'if i < len(word) and text[j] == word[i]:':
            if g('i') >= len(g('word')):
                return f"Все {len(g('word'))} буквы слова уже найдены, дальше текст только дочитывается."
            c, w = g('text')[g('j')], g('word')[g('i')]
            return f"text[{g('j')}] = {c!r}, следующая нужная буква word[{g('i')}] = {w!r}: " + ('совпали.' if c == w else 'не совпали, j идёт дальше, i стоит.')
        if line == 'i += 1':
            return f"Буква найдена: i: {g('i')} → {g('i') + 1}. i только растёт, назад не возвращается."
        if line == 'return i == len(word)':
            return f"Текст прочитан. Найдено букв по порядку: {g('i')} из {len(g('word'))}, " + ('слово — подпоследовательность текста.' if g('i') == len(g('word')) else 'слово не набирается.')
    if 'budget' in v:
        if line == 'prices = sorted(prices)':
            return "Цены не отсортированы. sorted() создаёт новый отсортированный список, O(n log n); исходный список вызывающего кода не меняется."
        if line == 'best = -1':
            return "best — лучшая сумма не больше бюджета среди проверенных пар. −1 означает, что такой пары пока нет."
        if line == 'if s <= budget:':
            ok = g('s') <= g('budget')
            return f"Сумма {g('s')} не больше бюджета {g('budget')}? " + ('Да: это кандидат в ответ.' if ok else 'Нет, сумма велика.')
        if line == 'best = max(best, s)':
            return f"best = max({g('best')}, {g('s')}) = {max(g('best'), g('s'))}."
        if line == 'i += 1':
            return (f"Сдвигаем i: {g('i')} → {g('i') + 1}. Для цены {arr[g('i')]} лучшая пара уже найдена — с самой дорогой из оставшихся цен, "
                    f"{arr[g('j')]}. С остальными ценами сумма будет меньше.")
        if line == 'j -= 1':
            return (f"Сдвигаем j: {g('j')} → {g('j') - 1}. Цена {arr[g('j')]} даже с самой дешёвой из оставшихся ({arr[g('i')]}) "
                    f"выходит за бюджет, с остальными — тем более.")
        if line == 'return best':
            return f"Указатели встретились. Лучшая сумма не больше бюджета — {g('best')}."

    if line == 'i, j = 0, len(prices) - 1':
        return f"Левый указатель i ставим на самую дешёвую цену (индекс 0), правый j — на самую дорогую (индекс {len(arr) - 1})."
    if line == 'i, j = 0, len(nums) - 1':
        return f"i начинает слева (индекс 0), j — справа (индекс {len(arr) - 1})."
    if line in ('while i < j:', 'while i <= j:'):
        op = '<' if '<=' not in line else '≤'
        ok = g('i') < g('j') if op == '<' else g('i') <= g('j')
        if ok and g('i') == g('j'):
            return f"Условие цикла: {g('i')} {op} {g('j')} — да, указатели стоят на одном элементе."
        if ok:
            return f"Условие цикла: {g('i')} {op} {g('j')} — да, между указателями есть непроверенные элементы."
        return f"Условие цикла: {g('i')} {op} {g('j')} — нет, указатели встретились или разошлись. Цикл закончен."
    if line == 's = prices[i] + prices[j]':
        a, b = arr[g('i')], arr[g('j')]
        extra = ' Оба указателя стоят на одном элементе: цена складывается сама с собой.' if g('i') == g('j') else ''
        return f"Складываем цены под указателями: prices[{g('i')}] + prices[{g('j')}] = {a} + {b} = {a + b}.{extra}"
    if line == 'if s == target:':
        return f"Сумма {g('s')} равна цели {g('target')}? {yes(g('s') == g('target')).capitalize()}."
    if line == 'return (i, j)':
        return f"Пара найдена: возвращаем индексы ({g('i')}, {g('j')})."
    if line == 'if s < target:':
        less = g('s') < g('target')
        if is_bug:
            return f"Сумма {g('s')} меньше цели {g('target')}? {yes(less).capitalize()}."
        if less:
            return f"Сумма {g('s')} меньше цели {g('target')}? Да. Увеличить сумму может только более дорогая левая цена."
        return f"Сумма {g('s')} меньше цели {g('target')}? Нет, она больше. Уменьшить сумму может только более дешёвая правая цена."
    if line == 'i += 1':
        if 'prices' in v and not is_bug:
            return (f"Сдвигаем i вправо: {g('i')} → {g('i') + 1}. Цена {arr[g('i')]} даже с самой дорогой из оставшихся "
                    f"({arr[g('j')]}) даёт меньше цели, с остальными даст ещё меньше: эту цену больше не проверяем.")
        return f"i: {g('i')} → {g('i') + 1}."
    if line == 'j -= 1':
        if 'prices' in v and not is_bug:
            return (f"Сдвигаем j влево: {g('j')} → {g('j') - 1}. Цена {arr[g('j')]} даже с самой дешёвой из оставшихся "
                    f"({arr[g('i')]}) даёт больше цели, с остальными даст ещё больше: эту цену больше не проверяем.")
        return f"j: {g('j')} → {g('j') - 1}."
    if line == 'return None':
        return "Цикл закончился, пара не найдена: функция вернёт None."
    if line == 'n = len(prices)':
        return f"Запоминаем длину списка: n = {len(arr)}."
    if line.startswith('for ') and ' in ' in line:
        var = line.split()[1]
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Цикл for берёт следующее значение: {var} = {q(nxt['raw'][var])}."
        return f"Значения для {var} закончились, цикл for завершён."
    if line == 'if prices[i] + prices[j] == target:':
        a, b = arr[g('i')], arr[g('j')]
        return f"Проверяем пару ({g('i')}, {g('j')}): {a} + {b} = {a + b}. Совпало с {g('target')}? {yes(a + b == g('target')).capitalize()}."
    if line == 'if not ids:':
        return "Список пустой? Нет, идём дальше." if arr else "Список пустой: возвращаем 0."
    if line == 'return 0':
        return "Возвращаем 0: в пустом списке различных значений нет."
    if line == 'w = 1':
        return "Первый элемент остаётся на месте в любом случае. w = 1 — позиция, куда запишем следующее новое значение."
    if line == 'w = 0':
        return "w = 0 — позиция, куда запишем следующий нужный элемент."
    if line == 'if ids[r] != ids[w - 1]:':
        x, y = arr[g('r')], arr[g('w') - 1]
        tail = 'значения разные, это новое значение: его нужно записать.' if x != y else 'значения равны, это повтор: пропускаем.'
        return f"Сравниваем прочитанное ids[{g('r')}] = {x} с последним записанным ids[{g('w') - 1}] = {y}: {tail}"
    if line == 'if ids[r] != ids[r + 1]:':
        x, y = arr[g('r')], arr[g('r') + 1]
        tail = 'значения разные, записываем ids[r].' if x != y else 'значения одинаковые, пропускаем.'
        return f"Сравниваем ids[{g('r')}] = {x} с соседом справа ids[{g('r') + 1}] = {y}: {tail}"
    if line == 'ids[w] = ids[r]':
        return f"Записываем {arr[g('r')]} в позицию w = {g('w')}."
    if line == 'w += 1':
        return f"w: {g('w')} → {g('w') + 1}."
    if line in ('del ids[w:]', 'del chars[w:]'):
        cut = len(arr) - g('w')
        if cut <= 0:
            return f"del {line.split()[1]} с индекса {g('w')}: элементов с такими индексами нет, удалять нечего."
        return f"Обрезаем хвост: удаляем элементы с индекса {g('w')}, их {cut}."
    if line == 'return w':
        return f"Возвращаем w = {g('w')}."
    if line == 'r = 0':
        return "r = 0 — позиция чтения."
    if line == 'n = len(chars)':
        return f"n = {len(arr)} — длина списка."
    if line == 'while r < n:':
        ok = g('r') < g('n')
        return f"Условие цикла: {g('r')} < {g('n')} — {yes(ok)}." + ('' if ok else ' Все символы прочитаны.')
    if line == 'start = r':
        return f"Новая серия начинается с позиции {g('r')}, символ {q(arr[g('r')])}. Запоминаем начало: start = {g('r')}."
    if line == 'while r < n and chars[r] == chars[start]:':
        if g('r') >= g('n'):
            return f"r = {g('r')} = n: список прочитан до конца, серия закончилась."
        same = arr[g('r')] == arr[g('start')]
        return (f"chars[{g('r')}] = {q(arr[g('r')])}, начало серии — {q(arr[g('start')])}: "
                + ('тот же символ, серия продолжается.' if same else 'другой символ, серия закончилась.'))
    if line == 'r += 1':
        return f"r: {g('r')} → {g('r') + 1}."
    if line == 'chars[w] = chars[start]':
        return f"Записываем символ серии {q(arr[g('start')])} в позицию w = {g('w')}."
    if line == 'count = r - start':
        return f"Длина серии: r − start = {g('r')} − {g('start')} = {g('r') - g('start')}."
    if line == 'if count > 1:':
        c = g('count')
        return f"{c} > 1? " + ('Да: после символа записываем длину серии цифрами.' if c > 1 else 'Нет: одиночный символ, длину не пишем.')
    if line == 'chars[w] = d':
        return f"Записываем цифру {q(g('d'))} в позицию w = {g('w')}."
    if line == 'if nums[r] != 0:':
        x = arr[g('r')]
        return f"nums[{g('r')}] = {x}: " + ('не ноль, его нужно поставить в позицию w.' if x != 0 else 'ноль, пропускаем.')
    if line == 'nums[w], nums[r] = nums[r], nums[w]':
        if g('w') == g('r'):
            return f"w = r = {g('w')}: обмен элемента с самим собой, список не меняется."
        return f"Меняем местами nums[{g('w')}] = {arr[g('w')]} и nums[{g('r')}] = {arr[g('r')]}."
    if line == 'nums[w] = nums[r]':
        if g('w') == g('r'):
            return f"w = r = {g('w')}: элемент записывается сам в себя."
        return f"Копируем nums[{g('r')}] = {arr[g('r')]} в позицию {g('w')}. В позиции {g('r')} остаётся та же копия {arr[g('r')]}, ноль из позиции {g('w')} пропадает."
    if line == 'if nums[i] < limit:':
        x = arr[g('i')]
        return f"nums[{g('i')}] = {x} меньше {g('limit')}? " + ('Да: он уже в левой части, сдвигаем i.' if x < g('limit') else 'Нет: слева стоит число, которому место справа.')
    if line == 'elif nums[j] >= limit:':
        y = arr[g('j')]
        return f"nums[{g('j')}] = {y} не меньше {g('limit')}? " + ('Да: оно уже в правой части, сдвигаем j.' if y >= g('limit') else 'Нет: справа стоит число, которому место слева.')
    if line == 'nums[i], nums[j] = nums[j], nums[i]':
        return f"Оба числа не на своих сторонах: меняем местами {arr[g('i')]} и {arr[g('j')]}."
    if line == 'return i':
        return f"Возвращаем i = {g('i')}: столько чисел меньше {g('limit')} стоят в начале списка."
    if line == 'low, mid, high = 0, 0, len(nums) - 1':
        return f"low и mid начинают слева (индекс 0), high — справа (индекс {len(arr) - 1}). Слева от low будут нули, справа от high — двойки."
    if line == 'while mid <= high:':
        ok = g('mid') <= g('high')
        return f"Условие цикла: {g('mid')} ≤ {g('high')} — " + ('да, между mid и high есть непрочитанные числа.' if ok else 'нет, все числа прочитаны.')
    if line == 'if nums[mid] == 0:':
        x = arr[g('mid')]
        return f"nums[{g('mid')}] = {x}. Это ноль? " + ('Да: его место в левой группе.' if x == 0 else 'Нет.')
    if line == 'nums[low], nums[mid] = nums[mid], nums[low]':
        if g('low') == g('mid'):
            return f"low = mid = {g('low')}: ноль уже на месте, обмен с самим собой."
        return f"Меняем местами nums[{g('low')}] = {arr[g('low')]} и nums[{g('mid')}] = {arr[g('mid')]}: ноль уходит к левой группе."
    if line == 'low += 1':
        return f"low: {g('low')} → {g('low') + 1}."
    if line == 'mid += 1':
        return f"mid: {g('mid')} → {g('mid') + 1}."
    if line == 'elif nums[mid] == 1:':
        x = arr[g('mid')]
        return f"nums[{g('mid')}] = {x}. Это единица? " + ('Да: единицы остаются посередине, двигаем только mid.' if x == 1 else 'Нет, значит, это двойка.')
    if line == 'nums[mid], nums[high] = nums[high], nums[mid]':
        return f"Меняем местами nums[{g('mid')}] = {arr[g('mid')]} и nums[{g('high')}] = {arr[g('high')]}: двойка уходит к правой группе. Пришедшее на место mid число ещё не проверено, поэтому mid не двигается."
    if line == 'high -= 1':
        return f"high: {g('high')} → {g('high') - 1}."
    return f"Выполняется строка {fr['ln']}."


def fr_next_inside(line, nxt, var, cur):
    """Следующий кадр — тело цикла с новым значением переменной."""
    return var in nxt and (var not in cur or nxt[var] != cur[var])


TRACES = {
    'pair_found': ('pair_sum', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    'pair_missing': ('pair_sum', 'pair_sum', ([300, 450, 700, 900], 1300), 'prices', ['i', 'j']),
    'pair_unsorted': ('pair_sum', 'pair_sum', ([300, 450, 1200, 700, 900, 1500], 1600), 'prices', ['i', 'j']),
    'pair_brute': ('pair_sum_brute', 'pair_sum_brute', ([300, 450, 700, 900], 1600), 'prices', ['i', 'j']),
    'dedup': ('dedup_sorted', 'dedup_sorted', ([101, 101, 102, 105, 105, 105, 110],), 'ids', ['w', 'r']),
    'compress': ('compress', 'compress', (list('aaabcc'),), 'chars', ['w', 'start', 'r']),
    'zeros': ('move_zeros', 'move_zeros', ([0, 4, 0, 0, 7, 2],), 'nums', ['w', 'r']),
    'split': ('split_by_limit', 'split_by_limit', ([5, 12, 3, 18, 7, 25, 1], 10), 'nums', ['i', 'j']),
    'colors': ('sort_colors', 'sort_colors', ([2, 0, 2, 1, 1, 0],), 'nums', ['low', 'mid', 'high']),
    'subseq_yes': ('is_subsequence', 'is_subsequence', (list('кот'), list('компот')), 'text', ['j']),
    'subseq_no': ('is_subsequence', 'is_subsequence', (list('кот'), list('картошка')), 'text', ['j']),
    'best_pair': ('best_pair_sum', 'best_pair_sum', ([700, 250, 1200, 450, 900, 300], 1400), 'prices', ['i', 'j']),
    'bug_same_item': ('bug_same_item', 'pair_sum', ([100, 250, 600], 500), 'prices', ['i', 'j']),
    'bug_wrong_move': ('bug_wrong_move', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    'bug_zeros_assign': ('bug_zeros_assign', 'move_zeros', ([0, 4, 0, 0, 7, 2],), 'nums', ['w', 'r']),
    'bug_dedup_neighbour': ('bug_dedup_neighbour', 'dedup_sorted', ([101, 101, 102, 105],), 'ids', ['w', 'r']),
    # Глава 8.9: исправленные версии на тех же входах, что и ошибочные.
    'fix_same_item': ('pair_sum', 'pair_sum', ([100, 250, 600], 500), 'prices', ['i', 'j']),
    'fix_dedup_short': ('dedup_sorted', 'dedup_sorted', ([101, 101, 102, 105],), 'ids', ['w', 'r']),
    'bug_compress_str': ('bug_compress_str', 'compress', (['x'] * 12,), 'chars', ['w', 'start', 'r']),
    'fix_compress_x12': ('compress', 'compress', (['x'] * 12,), 'chars', ['w', 'start', 'r']),
    # Глава 8.6: строка записана иначе, чем в верной функции.
    'var_j_len': ('var_j_len', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    'var_check_late': ('var_check_late', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    'var_move_j': ('var_move_j', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    'var_both': ('var_both', 'pair_sum', ([100, 200, 300, 900], 400), 'prices', ['i', 'j']),
    'fix_both': ('pair_sum', 'pair_sum', ([100, 200, 300, 900], 400), 'prices', ['i', 'j']),
    'var_return_inside': ('var_return_inside', 'pair_sum', ([300, 450, 700, 900, 1200, 1500], 1600), 'prices', ['i', 'j']),
    # Глава 8.7.
    'bug_dedup_no_check': ('bug_dedup_no_check', 'dedup_sorted', ([],), 'ids', ['w', 'r']),
    'fix_dedup_empty': ('dedup_sorted', 'dedup_sorted', ([],), 'ids', ['w', 'r']),
    'bug_compress_and_order': ('bug_compress_and_order', 'compress', (list('aab'),), 'chars', ['w', 'start', 'r']),
    'fix_compress_aab': ('compress', 'compress', (list('aab'),), 'chars', ['w', 'start', 'r']),
    'bug_subseq_no_guard': ('bug_subseq_no_guard', 'is_subsequence', (list('кот'), list('котик')), 'text', ['j']),
    'fix_subseq_guard': ('is_subsequence', 'is_subsequence', (list('кот'), list('котик')), 'text', ['j']),
    # Глава 8.8.
    'bug_split_strict': ('bug_split_strict', 'split_by_limit', ([8, 0, 12, 9, 5, 3], 10), 'nums', ['i', 'j']),
    'fix_split_strict': ('split_by_limit', 'split_by_limit', ([8, 0, 12, 9, 5, 3], 10), 'nums', ['i', 'j']),
    'bug_colors_mid_moves': ('bug_colors_mid_moves', 'sort_colors', ([1, 2, 0],), 'nums', ['low', 'mid', 'high']),
    'fix_colors_short': ('sort_colors', 'sort_colors', ([1, 2, 0],), 'nums', ['low', 'mid', 'high']),
    # Глава 8.10: словарь просмотренных цен.
    'pair_set': ('pair_sum_set', 'pair_sum_set', ([300, 450, 1200, 700, 900, 1500], 1600), 'prices', ['j']),
}

if __name__ == '__main__':
    out = {name: run_trace(*spec) for name, spec in TRACES.items()}
    for name, t in out.items():
        print(f"{name:24} frames={len(t['frames']):3} result={(t['error'] or t['result']):36} after={t['after']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 8. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
