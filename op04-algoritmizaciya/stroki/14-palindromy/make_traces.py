"""Строит пошаговые прогоны для глав модуля 14 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 14.
Строка в кадре показывается лентой символов, пробел — знаком ␣.
Подряд идущие кадры одной строки сводятся к последнему.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'engine', HERE.parent.parent / 'massivy' / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)

SOURCES = {}

# Глава 14.2.
SOURCES['is_palindrome'] = '''
def is_palindrome(text):
    i, j = 0, len(text) - 1
    while i < j:
        while i < j and not text[i].isalnum():
            i += 1
        while i < j and not text[j].isalnum():
            j -= 1
        if text[i].casefold() != text[j].casefold():
            return False
        i += 1
        j -= 1
    return True
'''
SOURCES['bug_case'] = SOURCES['is_palindrome'].replace(
    'if text[i].casefold() != text[j].casefold():', 'if text[i] != text[j]:')
SOURCES['bug_bound'] = SOURCES['is_palindrome'].replace(
    'while i < j and not text[i].isalnum():', 'while not text[i].isalnum():').replace(
    'while i < j and not text[j].isalnum():', 'while not text[j].isalnum():')
SOURCES['bug_isalpha'] = SOURCES['is_palindrome'].replace('.isalnum()', '.isalpha()')

# Глава 14.3. Главная функция стоит первой: номера строк прогона считаются от неё.
HELPER = '''
def is_range_palindrome(s, i, j):
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True
'''
SOURCES['can_be_palindrome'] = '''
def can_be_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return is_range_palindrome(s, i + 1, j) or is_range_palindrome(s, i, j - 1)
        i += 1
        j -= 1
    return True
''' + HELPER
SOURCES['bug_only_left'] = SOURCES['can_be_palindrome'].replace(
    'return is_range_palindrome(s, i + 1, j) or is_range_palindrome(s, i, j - 1)',
    'return is_range_palindrome(s, i + 1, j)')
SOURCES['removal_index'] = '''
def removal_index(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            if is_range_palindrome(s, i + 1, j):
                return i
            if is_range_palindrome(s, i, j - 1):
                return j
            return None
        i += 1
        j -= 1
    return -1
''' + HELPER
SOURCES['bug_greedy'] = '''
def can_be_palindrome(s):
    i, j = 0, len(s) - 1
    used = False
    while i < j:
        if s[i] == s[j]:
            i += 1
            j -= 1
        elif used:
            return False
        elif s[i + 1] == s[j]:
            used = True
            i += 1
        elif s[i] == s[j - 1]:
            used = True
            j -= 1
        else:
            return False
    return True
'''

for _k, _base in [('bug_case', 'is_palindrome'), ('bug_bound', 'is_palindrome'), ('bug_isalpha', 'is_palindrome'),
                  ('bug_only_left', 'can_be_palindrome')]:
    assert SOURCES[_k] != SOURCES[_base], f'замена в {_k} не сработала'

# Глава 14.6, тренажёр.
SOURCES['longest_palindrome_length'] = '''
def longest_palindrome_length(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    total = 0
    odd = False
    for c in count.values():
        total += c // 2 * 2
        if c % 2 == 1:
            odd = True
    return total + 1 if odd else total
'''
SOURCES['is_palindrome_number'] = '''
def is_palindrome_number(x):
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    rev = 0
    while x > rev:
        rev = rev * 10 + x % 10
        x //= 10
    return x == rev or x == rev // 10
'''
SOURCES['reverse_only_letters'] = '''
def reverse_only_letters(s):
    chars = list(s)
    i, j = 0, len(chars) - 1
    while i < j:
        if not chars[i].isalpha():
            i += 1
        elif not chars[j].isalpha():
            j -= 1
        else:
            chars[i], chars[j] = chars[j], chars[i]
            i += 1
            j -= 1
    return ''.join(chars)
'''
SOURCES['reverse_string'] = '''
def reverse_string(s):
    i, j = 0, len(s) - 1
    while i < j:
        s[i], s[j] = s[j], s[i]
        i += 1
        j -= 1
'''
SOURCES['smallest_palindrome'] = '''
def smallest_palindrome(s):
    chars = list(s)
    i, j = 0, len(chars) - 1
    while i < j:
        if chars[i] != chars[j]:
            chars[i] = chars[j] = min(chars[i], chars[j])
        i += 1
        j -= 1
    return ''.join(chars)
'''
SOURCES['first_palindrome'] = '''
def first_palindrome(words):
    for word in words:
        if word == word[::-1]:
            return word
    return ''
'''


def q(v):
    return repr(v)


def pal_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    t, i, j = g('text'), g('i'), g('j')
    test = 'isalpha' if key == 'bug_isalpha' else 'isalnum'
    if line == 'i, j = 0, len(text) - 1':
        return f"i — первый символ, j — последний: i = 0, j = {len(t) - 1}. Копия строки не создаётся."
    if line == 'while i < j:':
        if i < j:
            return f"i = {i} < j = {j}: между указателями ещё есть непроверенные символы."
        return f"i = {i}, j = {j}: указатели встретились, все пары проверены."
    if line in ('while i < j and not text[i].isalnum():', 'while i < j and not text[i].isalpha():', 'while not text[i].isalnum():'):
        if 'i < j' in line and i >= j:
            return f"i = {i} не меньше j = {j}: пропуск остановлен проверкой i < j."
        if i < len(t) and not getattr(t[i], test)():
            note = '' if 'i < j' in line or i < j else f" Проверки i < j нет, и i уже правее j = {j}."
            return f"text[{i}] = {q(t[i])} — не буква и не цифра, i сдвигается.{note}" if test == 'isalnum' else \
                   f"text[{i}] = {q(t[i])} — не буква: isalpha() ложно, i сдвигается."
        if i >= j and 'i < j' in line:
            return f"i = {i} не меньше j = {j}: пропуск остановлен проверкой i < j."
        return f"text[{i}] = {q(t[i])} — значимый символ, i остаётся."
    if line in ('while i < j and not text[j].isalnum():', 'while i < j and not text[j].isalpha():', 'while not text[j].isalnum():'):
        if 'i < j' in line and i >= j:
            return f"i = {i} не меньше j = {j}: пропуск справа остановлен."
        if 0 <= j < len(t) and not getattr(t[j], test)():
            return f"text[{j}] = {q(t[j])} — не буква и не цифра, j сдвигается." if test == 'isalnum' else \
                   f"text[{j}] = {q(t[j])} — не буква: isalpha() ложно, j сдвигается."
        if i >= j:
            return f"i = {i} не меньше j = {j}: пропуск справа остановлен."
        return f"text[{j}] = {q(t[j])} — значимый символ, j остаётся."
    if line in ('i += 1', 'j -= 1'):
        if line == 'i += 1' and (nxt is None or nxt['ln'] != fr['ln'] + 1):
            return f"i = {i + 1}."
        if line == 'i += 1':
            return f"Пара проверена, указатели сдвигаются навстречу: i = {i + 1}."
        return f"j = {j - 1}."
    if line == 'if text[i].casefold() != text[j].casefold():':
        a, b = t[i].casefold(), t[j].casefold()
        if a != b:
            return f"text[{i}] = {q(t[i])} и text[{j}] = {q(t[j])} после casefold — {q(a)} и {q(b)}: различаются."
        return f"text[{i}] = {q(t[i])} и text[{j}] = {q(t[j])} после casefold — {q(a)}: совпадают."
    if line == 'if text[i] != text[j]:':
        if t[i] != t[j]:
            extra = (f" Это одна буква в разных регистрах, но без casefold символы {q(t[i])} и {q(t[j])} разные."
                     if t[i].casefold() == t[j].casefold() else '')
            return f"text[{i}] = {q(t[i])}, text[{j}] = {q(t[j])}: различаются.{extra}"
        return f"text[{i}] = text[{j}] = {q(t[i])}: совпадают."
    if line == 'return False':
        return "Пара не совпала: строка — не палиндром."
    if line == 'return True':
        return "Все пары значимых символов совпали."
    return f"Выполняется строка {fr['ln']}."


def one_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'exc':
        return f"Строка прерывает функцию исключением {fr['err']}."
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    s, i, j = g('s'), g('i'), g('j')
    rp = lambda a, b: s[a:b + 1] == s[a:b + 1][::-1]
    if line == 'i, j = 0, len(s) - 1':
        return f"i = 0, j = {len(s) - 1}: проверка с двух концов, как в обычном палиндроме."
    if line == 'used = False':
        return "used — удалён ли уже символ."
    if line == 'while i < j:':
        return f"i = {i} < j = {j}." if i < j else f"i = {i}, j = {j}: указатели встретились."
    if line == 'if s[i] != s[j]:':
        if s[i] != s[j]:
            return f"s[{i}] = {q(s[i])}, s[{j}] = {q(s[j])}: первое различие. Удалять нужно один из этих двух символов."
        return f"s[{i}] = s[{j}] = {q(s[i])}: пара совпала."
    if line == 'if s[i] == s[j]:':
        return f"s[{i}] = s[{j}] = {q(s[i])}: пара совпала." if s[i] == s[j] else f"s[{i}] = {q(s[i])}, s[{j}] = {q(s[j])}: различие."
    if line.startswith('return is_range_palindrome('):
        a, b = rp(i + 1, j), rp(i, j - 1)
        if 'or' in line:
            return (f"Без s[{i}]: отрезок s[{i + 1}..{j}] = {q(s[i + 1:j + 1])} — {'палиндром' if a else 'не палиндром'}. "
                    f"Без s[{j}]: s[{i}..{j - 1}] = {q(s[i:j])} — {'палиндром' if b else 'не палиндром'}.")
        return (f"Проверяется только удаление s[{i}]: s[{i + 1}..{j}] = {q(s[i + 1:j + 1])} — "
                f"{'палиндром' if a else 'не палиндром'}. Удаление s[{j}] = {q(s[j])} эта версия не пробует.")
    if line == 'if is_range_palindrome(s, i + 1, j):':
        a = rp(i + 1, j)
        return f"Без s[{i}] = {q(s[i])}: отрезок s[{i + 1}..{j}] = {q(s[i + 1:j + 1])} — {'палиндром' if a else 'не палиндром'}."
    if line == 'if is_range_palindrome(s, i, j - 1):':
        b = rp(i, j - 1)
        return f"Без s[{j}] = {q(s[j])}: отрезок s[{i}..{j - 1}] = {q(s[i:j])} — {'палиндром' if b else 'не палиндром'}."
    if line == 'return i':
        return f"Удалить символ с индексом {i}: {q(s[:i] + s[i + 1:])} — палиндром."
    if line == 'return j':
        return f"Удалить символ с индексом {j}: {q(s[:j] + s[j + 1:])} — палиндром."
    if line == 'return None':
        return "Ни одно из двух удалений не даёт палиндром, а удалять что-то другое бесполезно: эта пара останется несовпавшей."
    if line == 'return -1':
        return "Различий нет: строка уже палиндром, удалять ничего не нужно."
    if line == 'return True':
        return "Различий нет: строка уже палиндром."
    if line == 'return False':
        return "Второе различие: одного удаления не хватает." if g('used') else "Различие, которое не исправить удалением соседа."
    if line == 'elif used:':
        return "Символ уже удалён." if g('used') else "Удалений ещё не было."
    if line == 'elif s[i + 1] == s[j]:':
        if s[i + 1] == s[j]:
            return (f"s[{i + 1}] = s[{j}] = {q(s[j])}: эта версия сразу выбирает удаление s[{i}], "
                    f"не проверяя, сойдётся ли остальная строка.")
        return f"s[{i + 1}] = {q(s[i + 1])} ≠ s[{j}]."
    if line == 'elif s[i] == s[j - 1]:':
        return f"s[{i}] = s[{j - 1}]: удаляется s[{j}]." if s[i] == s[j - 1] else f"s[{i}] ≠ s[{j - 1}]."
    if line == 'used = True':
        return "Удаление использовано."
    if line == 'i += 1':
        return f"i = {i + 1}."
    if line == 'j -= 1':
        return f"j = {j - 1}."
    return f"Выполняется строка {fr['ln']}."


def mock_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if key == 'longest_palindrome_length':
        if line == 'count = {}':
            return "count — частоты букв: палиндром из букв собирается парами."
        if line == 'for ch in s:':
            return f"Буква {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"Частоты: {q(g('count'))}."
        if line == 'count[ch] = count.get(ch, 0) + 1':
            return f"count[{q(g('ch'))}] = {g('count').get(g('ch'), 0) + 1}."
        if line == 'total = 0':
            return "total — длина палиндрома из пар."
        if line == 'odd = False':
            return "odd — есть ли буква с нечётной частотой: одну такую можно поставить в центр."
        if line == 'for c in count.values():':
            return f"Частота {nxt['raw']['c']}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"Пары дают {g('total')}."
        if line == 'total += c // 2 * 2':
            c = g('c')
            return f"Из {c} букв в пары идут {c // 2 * 2}: total = {g('total') + c // 2 * 2}."
        if line == 'if c % 2 == 1:':
            return f"{g('c')} — нечётное, одна буква остаётся без пары." if g('c') % 2 else f"{g('c')} — чётное."
        if line == 'odd = True':
            return "Одна непарная буква может стоять в центре."
        if line == 'return total + 1 if odd else total':
            return f"Ответ: {g('total')}" + (" + 1 за букву в центре." if g('odd') else ".")
    if key == 'is_palindrome_number':
        x, rev = g('x'), g('rev')
        if line.startswith('if x < 0'):
            return "Отрицательное число и число, оканчивающееся нулём (кроме 0), — не палиндромы: ведущего нуля не бывает."
        if line == 'rev = 0':
            return "rev — перевёрнутая правая половина числа."
        if line == 'while x > rev:':
            return f"x = {x} > rev = {rev}: левая часть ещё длиннее." if x > rev else f"x = {x} ≤ rev = {rev}: половина перевёрнута."
        if line == 'rev = rev * 10 + x % 10':
            return f"Последняя цифра x — {x % 10}: rev = {rev} · 10 + {x % 10} = {rev * 10 + x % 10}."
        if line == 'x //= 10':
            return f"x = {x} // 10 = {x // 10}."
        if line == 'return x == rev or x == rev // 10':
            return f"x = {x}, rev = {rev}. Для нечётного числа цифр средняя цифра в rev лишняя: сравнивается и rev // 10 = {rev // 10}."
    if key in ('reverse_only_letters', 'reverse_string', 'smallest_palindrome'):
        arr = g('chars') if key != 'reverse_string' else g('s')
        i, j = g('i'), g('j')
        if line in ('chars = list(s)',):
            return "Строку нельзя изменить, поэтому символы копируются в список."
        if line.startswith('i, j = 0'):
            return f"i = 0, j = {len(arr) - 1}."
        if line == 'while i < j:':
            return f"i = {i} < j = {j}." if i < j else "Указатели встретились."
        if line == 'if not chars[i].isalpha():':
            return f"chars[{i}] = {q(arr[i])} — не буква, остаётся на месте." if not arr[i].isalpha() else f"chars[{i}] = {q(arr[i])} — буква."
        if line == 'elif not chars[j].isalpha():':
            return f"chars[{j}] = {q(arr[j])} — не буква, остаётся на месте." if not arr[j].isalpha() else f"chars[{j}] = {q(arr[j])} — буква."
        if line in ('chars[i], chars[j] = chars[j], chars[i]', 's[i], s[j] = s[j], s[i]'):
            return f"Обмен: позиции {i} и {j} получают {q(arr[j])} и {q(arr[i])}."
        if line == 'if chars[i] != chars[j]:':
            return f"{q(arr[i])} ≠ {q(arr[j])}: нужна одна замена." if arr[i] != arr[j] else f"{q(arr[i])} = {q(arr[j])}: замена не нужна."
        if line == 'chars[i] = chars[j] = min(chars[i], chars[j])':
            return f"Обе позиции получают меньшую букву {q(min(arr[i], arr[j]))}: замен столько же, а строка меньше."
        if line == 'i += 1':
            return f"i = {i + 1}."
        if line == 'j -= 1':
            return f"j = {j - 1}."
        if line == "return ''.join(chars)":
            return f"Ответ: {q(''.join(arr))}."
    if key == 'first_palindrome':
        if line == 'for word in words:':
            return f"Слово {q(nxt['raw']['word'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else "Палиндромов нет."
        if line == 'if word == word[::-1]:':
            w = g('word')
            return f"{q(w)} и {q(w[::-1])}: " + ("совпадают." if w == w[::-1] else "различаются.")
        if line == 'return word':
            return f"Первый палиндром — {q(g('word'))}."
        if line == "return ''":
            return "Пустая строка."
    return f"Выполняется строка {fr['ln']}."


PAL_KEYS = {'is_palindrome', 'bug_case', 'bug_bound', 'bug_isalpha'}
ONE_KEYS = {'can_be_palindrome', 'bug_only_left', 'removal_index', 'bug_greedy'}


def caption(line, fr, nxt, is_bug, key=''):
    if key in PAL_KEYS:
        return pal_caption(line, fr, nxt, key)
    if key in ONE_KEYS:
        return one_caption(line, fr, nxt, key)
    return mock_caption(line, fr, nxt, key)


engine.SOURCES = SOURCES
engine.caption = caption
engine.is_variant = lambda key: key.startswith(('bug_', 'var_'))


def run(key, func_name, args, arr_name, ptrs):
    t = engine.run_trace(key, func_name, args, arr_name, ptrs)
    fs = t['frames']
    t['frames'] = [fr for k, fr in enumerate(fs)
                   if not (k + 1 < len(fs) and fs[k + 1]['ln'] == fr['ln'] and fr['ev'] == fs[k + 1]['ev'] == 'line')]
    for fr in t['frames']:
        if isinstance(fr['arr'], str):
            fr['arr'] = ['␣' if ch == ' ' else ch for ch in fr['arr']]
        elif isinstance(fr['arr'], list):
            fr['arr'] = ['␣' if ch == ' ' else ch for ch in fr['arr']]
        elif fr['arr'] is not None:
            fr['arr'] = None
    return t


ROZA = 'А роза упала на лапу Азора'
TRACES = {
    # Глава 14.2.
    'pal': ('is_palindrome', 'is_palindrome', (ROZA,), 'text', ['i', 'j']),
    'bug_case': ('bug_case', 'is_palindrome', (ROZA,), 'text', ['i', 'j']),
    # Глава 14.3.
    'can': ('can_be_palindrome', 'can_be_palindrome', ('ротатоор',), 's', ['i', 'j']),
    'removal': ('removal_index', 'removal_index', ('ротатоор',), 's', ['i', 'j']),
    'bug_only_left': ('bug_only_left', 'can_be_palindrome', ('шалаши',), 's', ['i', 'j']),
    'fix_only_left': ('can_be_palindrome', 'can_be_palindrome', ('шалаши',), 's', ['i', 'j']),
    # Глава 14.4.
    'bug_bound': ('bug_bound', 'is_palindrome', ('.,',), 'text', ['i', 'j']),
    'fix_bound': ('is_palindrome', 'is_palindrome', ('.,',), 'text', ['i', 'j']),
    'bug_isalpha': ('bug_isalpha', 'is_palindrome', ('1а2',), 'text', ['i', 'j']),
    'fix_isalpha': ('is_palindrome', 'is_palindrome', ('1а2',), 'text', ['i', 'j']),
    'bug_greedy': ('bug_greedy', 'can_be_palindrome', ('abbab',), 's', ['i', 'j']),
    'fix_greedy': ('can_be_palindrome', 'can_be_palindrome', ('abbab',), 's', ['i', 'j']),
    # Глава 14.6.
    'longest_palindrome_length': ('longest_palindrome_length', 'longest_palindrome_length', ('abccccdd',), 's', []),
    'is_palindrome_number': ('is_palindrome_number', 'is_palindrome_number', (1221,), 'none', []),
    'reverse_only_letters': ('reverse_only_letters', 'reverse_only_letters', ('ab-cd',), 'chars', ['i', 'j']),
    'reverse_string': ('reverse_string', 'reverse_string', (['h', 'e', 'l', 'l', 'o'],), 's', ['i', 'j']),
    'smallest_palindrome': ('smallest_palindrome', 'smallest_palindrome', ('egcfe',), 'chars', ['i', 'j']),
    'first_palindrome': ('first_palindrome', 'first_palindrome', (['abc', 'car', 'ada', 'racecar', 'cool'],), 'words', []),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:26} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 14. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
