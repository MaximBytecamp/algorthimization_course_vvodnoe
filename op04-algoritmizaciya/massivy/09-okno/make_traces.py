"""Строит пошаговые прогоны для глав модуля 9 настоящим запуском Python.

Движок записи кадров — тот же, что в модуле 8 (../08-dva-ukazatelya/make_traces.py):
модуль загружается, ему подставляются исходники и подписи модуля 9.
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

SOURCES['window_sums'] = '''
def window_sums(nums, k):
    if k < 1 or k > len(nums):
        raise ValueError("k должно быть от 1 до len(nums)")
    total = sum(nums[:k])
    sums = [total]
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        sums.append(total)
    return sums
'''

SOURCES['window_sums_slices'] = '''
def window_sums_slices(nums, k):
    if k < 1 or k > len(nums):
        raise ValueError("k должно быть от 1 до len(nums)")
    sums = []
    for s in range(len(nums) - k + 1):
        sums.append(sum(nums[s:s + k]))
    return sums
'''

SOURCES['best_window'] = '''
def best_window(nums, k):
    if k < 1 or k > len(nums):
        raise ValueError("k должно быть от 1 до len(nums)")
    total = sum(nums[:k])
    best, start = total, 0
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        if total > best:
            best, start = total, r - k + 1
    return (start, best)
'''

SOURCES['max_vowels'] = '''
def max_vowels(s, k):
    vowels = set("aeiou")
    count = sum(1 for ch in s[:k] if ch in vowels)
    best = count
    for r in range(k, len(s)):
        count += (s[r] in vowels) - (s[r - k] in vowels)
        best = max(best, count)
    return best
'''

# Ошибочные версии для главы 9.4.
SOURCES['bug_ge'] = SOURCES['best_window'].replace('if total > best:', 'if total >= best:')
SOURCES['bug_zero_start'] = SOURCES['best_window'].replace('best, start = total, 0', 'best, start = 0, 0')

SOURCES['max_events'] = '''
def max_events(times, w):
    if w <= 0:
        raise ValueError("w должно быть больше 0")
    best = 0
    l = 0
    for r in range(len(times)):
        while times[r] - times[l] >= w:
            l += 1
        best = max(best, r - l + 1)
    return best
'''

# Ошибочные версии для главы 9.5.
SOURCES['bug_strict'] = SOURCES['max_events'].replace('times[r] - times[l] >= w', 'times[r] - times[l] > w')
SOURCES['bug_count'] = SOURCES['max_events'].replace('max(best, r - l + 1)', 'max(best, r - l)')

# Изменённые версии best_window для главы 9.6.
SOURCES['var_no_check'] = SOURCES['best_window'].replace(
    '    if k < 1 or k > len(nums):\n        raise ValueError("k должно быть от 1 до len(nums)")\n', '')
SOURCES['var_range_k1'] = SOURCES['best_window'].replace('range(k, len(nums))', 'range(k + 1, len(nums))')
SOURCES['var_check_ge'] = SOURCES['best_window'].replace('k > len(nums)', 'k >= len(nums)')
for _k in ('var_no_check', 'var_range_k1', 'var_check_ge'):
    assert SOURCES[_k] != SOURCES['best_window'], _k

# Ошибочные версии сдвига для главы 9.3.
SOURCES['bug_out_index'] = SOURCES['window_sums'].replace('nums[r] - nums[r - k]', 'nums[r] - nums[r - k + 1]')
SOURCES['bug_no_first'] = SOURCES['window_sums'].replace('sums = [total]', 'sums = []')
for _k, _b in (('bug_out_index', 'window_sums'), ('bug_no_first', 'window_sums'), ('bug_ge', 'best_window'), ('bug_zero_start', 'best_window'), ('bug_strict', 'max_events'), ('bug_count', 'max_events')):
    assert SOURCES[_k] != SOURCES[_b], _k


def plural(n, one, few, many):
    """Число со словом в нужной форме: 1 сумма, 3 суммы, 5 сумм."""
    if n % 10 == 1 and n % 100 != 11:
        return f'{n} {one}'
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return f'{n} {few}'
    return f'{n} {many}'


def pn(x):
    """Число как операнд после знака: отрицательное — в скобках."""
    return f'({x})' if x < 0 else str(x)


def seq(xs):
    return ' + '.join([str(xs[0])] + [pn(x) for x in xs[1:]])


def border_caption(line, fr, nxt, key, nums, k):
    """Подписи к изменённым версиям best_window из главы 9.6."""
    g = fr['raw'].get
    ev = fr['ev']
    n = len(nums)
    bad_k = k < 1 or k > n
    if ev == 'return':
        if bad_k:
            return (f"Функция вернула {fr['ret']}, хотя окна длины {k} в списке из {n} элементов нет. "
                    f"Вызывающий код получит ответ и не узнает, что вход был неверным.")
        return None
    if ev == 'exc' and key == 'var_check_ge':
        return (f"Функция прерывается исключением {fr['err']} на допустимом k = {k}: окно длины {k} "
                f"в списке из {n} элементов есть — это весь список.")
    if line == 'if k < 1 or k >= len(nums):':
        return f"Проверка k: k = {k}, длина списка {n}. Условие k >= len(nums) истинно: {k} >= {n}."
    if line == 'total = sum(nums[:k])' and bad_k:
        if k <= 0:
            return f"nums[:{k}] = {nums[:k]}, сумма {sum(nums[:k])}. Проверки k нет, и функция продолжает работу без сообщения об ошибке."
        return (f"k = {k} больше длины списка, но срез nums[:{k}] ошибки не даёт: он берёт весь список {nums[:k]}, "
                f"сумма {sum(nums[:k])}. Проверки k нет, и функция продолжает работу.")
    if line.startswith('for r in range(k, len(nums))') and bad_k:
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}. При k = {k} индекс ушедшего элемента r − k = {r - k}."
        return f"range({k}, {n}) пуст или закончился: сдвигов больше нет."
    if line == 'total += nums[r] - nums[r - k]' and k == 0:
        r = g('r')
        return f"При k = 0 прибавляется и вычитается один и тот же элемент nums[{r}] = {nums[r]}: сумма остаётся {g('total')}."
    if line.startswith('for r in range(k + 1, len(nums))'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            if r == k + 1:
                return (f"Цикл начинается с r = k + 1 = {r}. Шаг r = {k}, на котором в окно входит nums[{k}] = {nums[k]}, "
                        f"пропущен: total всё ещё сумма nums[0:{k}].")
            return f"r = {r}: в окно входит nums[{r}] = {nums[r]}, из окна уходит nums[{r - k}] = {nums[r - k]}."
        return "Значения r закончились."
    if line == 'total += nums[r] - nums[r - k]' and key == 'var_range_k1':
        r, t = g('r'), g('total')
        new = t + nums[r] - nums[r - k]
        true = sum(nums[r - k + 1:r + 1])
        return (f"{t} + {pn(nums[r])} − {pn(nums[r - k])} = {new}. Сумма окна nums[{r - k + 1}:{r + 1}] на самом деле {true}: "
                f"из-за пропущенного шага total отстаёт, и ошибка переходит на все следующие окна.")
    if line == 'best, start = total, r - k + 1' and key == 'var_range_k1':
        r, t = g('r'), g('total')
        true = sum(nums[r - k + 1:r + 1])
        return (f"best = {t}, start = {r - k + 1}. Функция считает {t} суммой окна nums[{r - k + 1}:{r + 1}], "
                f"хотя у этого окна сумма {true}.")
    if line == 'return (start, best)' and (bad_k or key == 'var_range_k1'):
        return f"Цикл закончен, функция возвращает (start, best) = ({g('start')}, {g('best')})."
    return None


def caption(line, fr, nxt, is_bug, key=''):
    v = fr['raw']
    g = v.get
    ev = fr['ev']
    name = 'nums' if 'nums' in v else 'times' if 'times' in v else 's'
    nums = g(name)
    n = len(nums)
    k = g('k')
    if name == 'times':
        return events_caption(line, fr, nxt, key, nums)
    if key.startswith('var_'):
        special = border_caption(line, fr, nxt, key, nums, k)
        if special:
            return special
    if ev == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line.startswith('if k < 1 or k > len(nums):'):
        return f"Проверка k: k = {k}, длина списка {n}. k лежит в пределах от 1 до {n}, исключения не будет."
    if line == 'total = sum(nums[:k])':
        part = nums[:k]
        return f"Первое окно nums[0:{k}]: {seq(part)} = {sum(part)}. Это единственное окно, которое складывается целиком: {plural(k, 'обращение', 'обращения', 'обращений')} к элементам."
    if line == 'sums = [total]':
        return f"Сумма первого окна, {g('total')}, — первый элемент ответа."
    if line == 'sums = []':
        if key == 'bug_no_first':
            return f"Ответ начинается с пустого списка. Сумма первого окна, {g('total')}, посчитана строкой выше, но в ответ не попадает."
        return "Ответ начинается с пустого списка: суммы окон будут дописываться по одной."
    if line.startswith('for r in range'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: в окно входит {name}[{r}] = {nums[r]!r}, из окна уходит {name}[{r - k}] = {nums[r - k]!r}."
        return f"Значения r закончились: пройдены все окна, их {n - k + 1}."
    if line.startswith('for s in range'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            s = nxt['raw']['s']
            return f"s = {s}: следующее окно — nums[{s}:{s + k}]."
        return f"Значения s закончились: пройдены все окна, их {n - k + 1}."
    if line == 'total += nums[r] - nums[r - k]':
        r, t = g('r'), g('total')
        new = t + nums[r] - nums[r - k]
        rest = ('' if k == 1 else f' Элемент nums[{r - 1}] остаётся в окне и не перечитывается.' if k == 2 else
                f" Остальные {plural(k - 1, 'элемент', 'элемента', 'элементов')} окна не перечитываются.")
        return f"Сдвиг окна: {t} + {pn(nums[r])} − {pn(nums[r - k])} = {new}. Окно теперь nums[{r - k + 1}:{r + 1}].{rest}"
    if line == 'total += nums[r] - nums[r - k + 1]':
        r, t = g('r'), g('total')
        new = t + nums[r] - nums[r - k + 1]
        right = sum(nums[r - k + 1:r + 1])
        return (f"Вычитается nums[{r - k + 1}] = {nums[r - k + 1]} — элемент, который остаётся в окне. "
                f"Из окна уходит nums[{r - k}] = {nums[r - k]}. Получается {t} + {pn(nums[r])} − {pn(nums[r - k + 1])} = {new}, "
                f"а сумма окна nums[{r - k + 1}:{r + 1}] равна {right}.")
    if line == 'sums.append(total)':
        return f"Записываем сумму окна {g('total')}. В ответе {plural(len(g('sums')) + 1, 'сумма', 'суммы', 'сумм')}."
    if line == 'sums.append(sum(nums[s:s + k]))':
        s = g('s')
        part = nums[s:s + k]
        return (f"Срез nums[{s}:{s + k}] = {part} копирует {plural(k, 'элемент', 'элемента', 'элементов')}, sum складывает их: {seq(part)} = {sum(part)}. "
                f"Сумма предыдущего окна здесь не используется.")
    if line == 'return sums':
        return f"Все окна пройдены. Ответ — {plural(len(g('sums')), 'сумма', 'суммы', 'сумм')}: {g('sums')}."
    if line == 'best, start = total, 0':
        return f"Первое окно — пока лучшее: best = {g('total')}, start = 0."
    if line == 'best, start = 0, 0':
        return (f"best = 0 ещё до сравнения с первым окном, а сумма первого окна равна {g('total')}. "
                f"Если все суммы окон отрицательные, ни одна из них не окажется больше 0.")
    if line in ('if total > best:', 'if total >= best:'):
        t, b = g('total'), g('best')
        if line == 'if total > best:':
            return f"Сумма окна {t} больше лучшей {b}? " + ('Да.' if t > b else 'Нет: суммы равны, лучшим остаётся окно левее.' if t == b else 'Нет.')
        return f"Сумма окна {t} не меньше лучшей {b}? " + ('Да: суммы равны, и при >= лучшим становится окно правее.' if t == b else 'Да.' if t > b else 'Нет.')
    if line == 'best, start = total, r - k + 1':
        r = g('r')
        return f"Новое лучшее окно: nums[{r - k + 1}:{r + 1}], сумма {g('total')}, start = {r - k + 1}."
    if line == 'return (start, best)':
        st, b = g('start'), g('best')
        return f"Все окна пройдены. Лучшее окно начинается с индекса {st}: nums[{st}:{st + k}], сумма {b}."
    if line == 'vowels = set("aeiou")':
        return "Множество гласных. Проверка ch in vowels для множества стоит O(1)."
    if line == 'count = sum(1 for ch in s[:k] if ch in vowels)':
        part = nums[:k]
        c = sum(1 for ch in part if ch in 'aeiou')
        return f"Первое окно {''.join(part)!r}: гласных {c}. Это единственное окно, буквы которого просматриваются целиком."
    if line == 'best = count':
        return f"Первое окно — пока лучшее: best = {g('count')}."
    if line == 'count += (s[r] in vowels) - (s[r - k] in vowels)':
        r, c = g('r'), g('count')
        a, b = nums[r] in 'aeiou', nums[r - k] in 'aeiou'
        return (f"Пришла {nums[r]!r} — {'гласная, +1' if a else 'не гласная, +0'}; ушла {nums[r - k]!r} — "
                f"{'гласная, −1' if b else 'не гласная, −0'}. count: {c} → {c + int(a) - int(b)}.")
    if line == 'best = max(best, count)':
        return f"best = max({g('best')}, {g('count')}) = {max(g('best'), g('count'))}."
    if line == 'return best':
        return f"Все окна пройдены. Наибольшее число гласных в окне — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


def events_caption(line, fr, nxt, key, times):
    """Подписи к задаче о событиях во временном окне."""
    g = fr['raw'].get
    ev = fr['ev']
    w = g('w')
    if ev == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'if w <= 0:':
        return f"Проверка длины окна: w = {w} больше 0, исключения не будет."
    if line == 'best = 0':
        return "best — наибольшее число событий в одном окне среди проверенных. Для пустого списка так и останется 0."
    if line == 'l = 0':
        return f"l — первое событие окна, r — последнее. Окно начинается в момент times[l] и длится {w} секунд: [times[l], times[l] + {w})."
    if line.startswith('for r in range'):
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            r = nxt['raw']['r']
            return f"r = {r}: событие в момент {times[r]} добавляется в окно справа."
        return "События закончились, цикл for завершён."
    if line in ('while times[r] - times[l] >= w:', 'while times[r] - times[l] > w:'):
        r, l = g('r'), g('l')
        d = times[r] - times[l]
        strict = line.endswith('> w:')
        cond = d > w if strict else d >= w
        sign = '>' if strict else '≥'
        if cond:
            return (f"{times[r]} − {times[l]} = {d} {sign} {w}: событие {times[l]} с событием {times[r]} в одно окно "
                    f"длиной {w} не помещается. Левую границу нужно сдвинуть.")
        if strict and d == w:
            return (f"{times[r]} − {times[l]} = {d}, и {d} > {w} ложно, поэтому l не двигается. Но окно [{times[l]}, {times[l] + w}) "
                    f"не включает момент {times[l] + w}: событие {times[r]} лежит на правой границе и в окно не входит.")
        return (f"{times[r]} − {times[l]} = {d} < {w}: события с индекса {l} по {r} помещаются в окно "
                f"[{times[l]}, {times[l] + w}). Цикл while закончен.")
    if line == 'l += 1':
        l = g('l')
        return f"l: {l} → {l + 1}. Событие в момент {times[l]} уходит из окна."
    if line == 'best = max(best, r - l + 1)':
        r, l, b = g('r'), g('l'), g('best')
        c = r - l + 1
        return f"В окне события с индекса {l} по {r} включительно: {c}. best = max({b}, {c}) = {max(b, c)}."
    if line == 'best = max(best, r - l)':
        r, l, b = g('r'), g('l'), g('best')
        return (f"r − l = {r - l}, а событий с индекса {l} по {r} включительно {r - l + 1}: формула теряет одно. "
                f"best = max({b}, {r - l}) = {max(b, r - l)}.")
    if line == 'return best':
        return f"Все события пройдены. Наибольшее число событий в одном окне — {g('best')}."
    return f"Выполняется строка {fr['ln']}."


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))

EX = [12, 15, 9, 20, 18, 7, 25]
TRACES = {
    'sums_slices': ('window_sums_slices', 'window_sums_slices', (EX, 3), 'nums', ['s']),
    'sums_roll': ('window_sums', 'window_sums', (EX, 3), 'nums', ['r']),
    'bug_out_index': ('bug_out_index', 'window_sums', (EX, 3), 'nums', ['r']),
    'bug_no_first': ('bug_no_first', 'window_sums', (EX, 3), 'nums', ['r']),
    # Глава 9.4.
    'best_roll': ('best_window', 'best_window', (EX, 3), 'nums', ['r']),
    'bug_ge': ('bug_ge', 'best_window', ([5, 1, 5, 1], 2), 'nums', ['r']),
    'fix_ge': ('best_window', 'best_window', ([5, 1, 5, 1], 2), 'nums', ['r']),
    'bug_zero_start': ('bug_zero_start', 'best_window', ([-5, -2, -8, -1], 2), 'nums', ['r']),
    'fix_zero_start': ('best_window', 'best_window', ([-5, -2, -8, -1], 2), 'nums', ['r']),
    'vowels': ('max_vowels', 'max_vowels', (list('abciiidef'), 3), 's', ['r']),
    # Глава 9.5.
    'events': ('max_events', 'max_events', ([1, 3, 4, 10, 12, 13, 14, 30], 5), 'times', ['l', 'r']),
    'bug_strict': ('bug_strict', 'max_events', ([0, 5], 5), 'times', ['l', 'r']),
    'fix_strict': ('max_events', 'max_events', ([0, 5], 5), 'times', ['l', 'r']),
    'bug_count': ('bug_count', 'max_events', ([1, 3, 4, 10, 12, 13, 14, 30], 5), 'times', ['l', 'r']),
    # Глава 9.6.
    'var_no_check_k0': ('var_no_check', 'best_window', ([1, 2], 0), 'nums', ['r']),
    'var_no_check_big': ('var_no_check', 'best_window', ([1, 2], 3), 'nums', ['r']),
    'var_range_k1': ('var_range_k1', 'best_window', (EX, 3), 'nums', ['r']),
    'var_check_ge': ('var_check_ge', 'best_window', ([4, 1, 2], 3), 'nums', ['r']),
    'fix_k_is_n': ('best_window', 'best_window', ([4, 1, 2], 3), 'nums', ['r']),
}

if __name__ == '__main__':
    out = {name: engine.run_trace(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:14} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 9. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
