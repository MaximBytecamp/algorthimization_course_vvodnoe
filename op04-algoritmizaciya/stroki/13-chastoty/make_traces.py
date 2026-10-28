"""Строит пошаговые прогоны для глав модуля 13 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 13.
Строки в прогоне показываются лентой символов: строка в кадре превращается в список.
Функция letters (нормализация из главы 13.2) в прогон не входит: она подставляется
в builtins, чтобы на экране был только код проверяемой функции.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import builtins
import importlib.util
import json
import pathlib
import sys
import unicodedata

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'engine', HERE.parent.parent / 'massivy' / '08-dva-ukazatelya' / 'make_traces.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)


def letters(text):
    text = unicodedata.normalize('NFC', text).casefold()
    return [ch for ch in text if ch.isalnum()]


builtins.letters = letters
builtins.unicodedata = unicodedata

SOURCES = {}

# Глава 13.2.
SOURCES['is_anagram'] = '''
def is_anagram(a, b):
    a = letters(a)
    b = letters(b)
    if len(a) != len(b):
        return False
    count = {}
    for ch in a:
        count[ch] = count.get(ch, 0) + 1
    for ch in b:
        if count.get(ch, 0) == 0:
            return False
        count[ch] -= 1
    return True
'''
SOURCES['bug_set'] = '''
def is_anagram(a, b):
    return set(letters(a)) == set(letters(b))
'''
SOURCES['bug_no_len'] = SOURCES['is_anagram'].replace(
    '    if len(a) != len(b):\n        return False\n', '')

# Глава 13.3.
SOURCES['first_unique'] = '''
def first_unique(text):
    count = {}
    for ch in text:
        key = ch.casefold()
        count[key] = count.get(key, 0) + 1
    for i, ch in enumerate(text):
        if ch.isalpha() and count[ch.casefold()] == 1:
            return i
    return -1
'''
SOURCES['bug_case'] = '''
def first_unique(text):
    count = {}
    for ch in text:
        count[ch] = count.get(ch, 0) + 1
    for i, ch in enumerate(text):
        if ch.isalpha() and count[ch] == 1:
            return i
    return -1
'''
SOURCES['bug_alpha'] = SOURCES['first_unique'].replace(
    'if ch.isalpha() and count[ch.casefold()] == 1:', 'if count[ch.casefold()] == 1:')

SOURCES['normalize_name'] = '''
def normalize_name(text):
    words = unicodedata.normalize('NFC', text).split()
    result = []
    for word in words:
        parts = [part.capitalize() for part in word.split('-')]
        result.append('-'.join(parts))
    return ' '.join(result)
'''
SOURCES['bug_split_space'] = SOURCES['normalize_name'].replace(".split()", ".split(' ')")
SOURCES['bug_hyphen'] = '''
def normalize_name(text):
    words = unicodedata.normalize('NFC', text).split()
    result = []
    for word in words:
        result.append(word.capitalize())
    return ' '.join(result)
'''

for _k, _base in [('bug_no_len', 'is_anagram'), ('bug_alpha', 'first_unique'), ('bug_split_space', 'normalize_name')]:
    assert SOURCES[_k] != SOURCES[_base], f'замена в {_k} не сработала'

# Глава 13.6, тренажёр. Ключ прогона совпадает с именем функции.
SOURCES['can_construct'] = '''
def can_construct(note, magazine):
    count = {}
    for ch in magazine:
        count[ch] = count.get(ch, 0) + 1
    for ch in note:
        if count.get(ch, 0) == 0:
            return False
        count[ch] -= 1
    return True
'''
SOURCES['is_pangram'] = '''
def is_pangram(sentence):
    seen = set()
    for ch in sentence:
        seen.add(ch)
    return len(seen) == 26
'''
SOURCES['almost_equivalent'] = '''
def almost_equivalent(word1, word2):
    diff = {}
    for ch in word1:
        diff[ch] = diff.get(ch, 0) + 1
    for ch in word2:
        diff[ch] = diff.get(ch, 0) - 1
    for d in diff.values():
        if abs(d) > 3:
            return False
    return True
'''
SOURCES['equal_counts'] = '''
def equal_counts(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    return len(set(count.values())) == 1
'''
SOURCES['first_repeat'] = '''
def first_repeat(s):
    seen = set()
    for ch in s:
        if ch in seen:
            return ch
        seen.add(ch)
'''


def q(v):
    return repr(v)


def anagram_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'a = letters(a)':
        return (f"letters оставляет буквы и цифры после NFC и casefold: {q(g('a'))} → "
                f"{q(letters(g('a')))}. Пробелы, знаки и регистр больше не влияют на ответ.")
    if line == 'b = letters(b)':
        return f"То же для второй строки: {q(g('b'))} → {q(letters(g('b')))}."
    if line == 'if len(a) != len(b):':
        la, lb = len(g('a')), len(g('b'))
        if la != lb:
            return f"Длины {la} и {lb} разные: строки не могут быть анаграммами, дальше считать не нужно."
        return f"Длины равны, {la} и {lb}. Если частоты совпадут, строки — анаграммы."
    if line == 'count = {}':
        return "count — частотный словарь: символ → сколько раз он встретился в a и ещё не нашёл пары в b."
    if line == 'for ch in a:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий символ a: {q(nxt['raw']['ch'])}."
        return f"Строка a пройдена. Частоты: {q(g('count'))}."
    if line == 'count[ch] = count.get(ch, 0) + 1':
        ch, c = g('ch'), g('count')
        old = c.get(ch, 0)
        new = 'новый ключ' if old == 0 else f'было {old}'
        return f"count[{q(ch)}] = {old} + 1 = {old + 1} ({new})."
    if line == 'for ch in b:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий символ b: {q(nxt['raw']['ch'])}. Для него в count должна остаться пара."
        if key == 'bug_no_len':
            left = {k: v for k, v in g('count').items() if v}
            return (f"Строка b пройдена, и для каждого её символа пара нашлась. Но в count остались символы без пары: "
                    f"{q(left)}. Строка a длиннее, а эта версия длину не сравнила.")
        return "Строка b пройдена, для каждого символа нашлась пара. Длины равны, значит, лишних символов в a тоже нет."
    if line == 'if count.get(ch, 0) == 0:':
        ch, c = g('ch'), g('count').get(g('ch'), 0)
        if c == 0:
            return f"Для {q(ch)} пар не осталось: в b этот символ встречается чаще, чем в a."
        return f"count[{q(ch)}] = {c}: пара есть."
    if line == 'return False':
        return "Строки — не анаграммы."
    if line == 'count[ch] -= 1':
        ch, c = g('ch'), g('count')[g('ch')]
        return f"Пара использована: count[{q(ch)}] = {c} − 1 = {c - 1}."
    if line == 'return True':
        return "Все символы b нашли пару в a."
    if line == 'return set(letters(a)) == set(letters(b))':
        sa, sb = set(letters(g('a'))), set(letters(g('b')))
        return (f"set оставляет каждый символ один раз: {q(sorted(sa))} и {q(sorted(sb))}. "
                f"Множества равны, и сколько раз символ встречался, уже не видно.")
    return f"Выполняется строка {fr['ln']}."


def unique_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line == 'count = {}':
        return "Первый проход считает, сколько раз встречается каждая буква. Второй ищет первую букву с частотой 1."
    if line == 'for ch in text:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующий символ: {q(nxt['raw']['ch'])}."
        return f"Первый проход закончен. Частоты: {q(g('count'))}."
    if line == 'key = ch.casefold()':
        ch = g('ch')
        if ch != ch.casefold():
            return f"Ключ без регистра: {q(ch)} → {q(ch.casefold())}."
        if ch.isalpha():
            return f"Ключ {q(ch)}: буква уже строчная."
        return f"Ключ {q(ch)}: это не буква, ключом остаётся сам символ."
    if line == 'count[key] = count.get(key, 0) + 1':
        k = g('key')
        old = g('count').get(k, 0)
        return f"count[{q(k)}] = {old} + 1 = {old + 1}."
    if line == 'count[ch] = count.get(ch, 0) + 1':
        ch = g('ch')
        old = g('count').get(ch, 0)
        note = (f" Регистр не убран: {q(ch)} и {q(ch.swapcase())} — разные ключи."
                if ch != ch.swapcase() and ch.swapcase() in g('text') else '')
        return f"count[{q(ch)}] = {old} + 1 = {old + 1}.{note}"
    if line == 'for i, ch in enumerate(text):':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"i = {nxt['raw']['i']}, символ {q(nxt['raw']['ch'])}."
        return "Второй проход закончен: буквы с частотой 1 нет."
    if line == 'if ch.isalpha() and count[ch.casefold()] == 1:':
        ch, c = g('ch'), g('count')
        if not ch.isalpha():
            return f"{q(ch)} — не буква, такие символы по условию не рассматриваются."
        n = c[ch.casefold()]
        return f"{q(ch)}: count[{q(ch.casefold())}] = {n}." + (" Буква встречается один раз." if n == 1 else " Буква повторяется, проход продолжается.")
    if line == 'if ch.isalpha() and count[ch] == 1:':
        ch, n = g('ch'), g('count')[g('ch')]
        if n == 1 and g('count').get(ch.swapcase(), 0):
            return (f"count[{q(ch)}] = 1, хотя буква встречается ещё как {q(ch.swapcase())}. "
                    f"Без casefold заглавная и строчная считаются разными буквами.")
        return f"count[{q(ch)}] = {n}."
    if line == 'if count[ch.casefold()] == 1:':
        ch, n = g('ch'), g('count')[g('ch').casefold()]
        if n == 1 and not ch.isalpha():
            return f"count[{q(ch)}] = 1. {q(ch)} — не буква, но проверки isalpha нет, и знак принимается за ответ."
        return f"{q(ch)}: count[{q(ch.casefold())}] = {n}."
    if line == 'return i':
        return f"Ответ — индекс {g('i')}, символ {q(g('ch'))}."
    if line == 'return -1':
        return "Каждая буква встречается больше одного раза или букв нет: ответ −1."
    return f"Выполняется строка {fr['ln']}."


def name_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if line.startswith('words = '):
        w = (nxt['raw']['words'] if nxt else None)
        if ".split(' ')" in line:
            return (f"split(' ') делит строку по каждому пробелу: два пробела подряд дают пустое слово ''. "
                    f"words = {q(w)}.")
        return f"NFC, затем split() без аргумента: пробелы по краям убраны, серии пробелов — один разделитель. words = {q(w)}."
    if line == 'result = []':
        return "result — слова после приведения к виду «Заглавная и строчные»."
    if line == 'for word in words:':
        if nxt is not None and nxt['ln'] == fr['ln'] + 1:
            return f"Следующее слово: {q(nxt['raw']['word'])}."
        return f"Слова закончились: result = {q(g('result'))}."
    if line == "parts = [part.capitalize() for part in word.split('-')]":
        w = g('word')
        return (f"{q(w)}.split('-') → {q(w.split('-'))}; capitalize у каждой части: "
                f"{q([p.capitalize() for p in w.split('-')])}.")
    if line == "result.append('-'.join(parts))":
        return f"Части склеиваются через дефис: {q('-'.join(g('parts')))}."
    if line == 'result.append(word.capitalize())':
        w = g('word')
        return (f"{q(w)}.capitalize() → {q(w.capitalize())}." +
                (" Заглавной становится только первая буква всего слова, вторая часть после дефиса остаётся строчной." if '-' in w else ''))
    if line == "return ' '.join(result)":
        return f"Слова склеиваются через один пробел: {q(' '.join(g('result')))}."
    return f"Выполняется строка {fr['ln']}."


def mock_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if fr['ev'] == 'return':
        return f"Функция закончила работу и вернула {fr['ret']}."
    if key == 'can_construct':
        if line == 'count = {}':
            return "count — сколько каждого символа есть в журнале и ещё не использовано."
        if line == 'for ch in magazine:':
            return f"Следующий символ журнала: {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"Журнал пройден: {q(g('count'))}."
        if line == 'count[ch] = count.get(ch, 0) + 1':
            old = g('count').get(g('ch'), 0)
            return f"count[{q(g('ch'))}] = {old + 1}."
        if line == 'for ch in note:':
            return f"Следующий символ записки: {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else "Записка собрана."
        if line == 'if count.get(ch, 0) == 0:':
            c = g('count').get(g('ch'), 0)
            return f"Символов {q(g('ch'))} в журнале не осталось." if c == 0 else f"count[{q(g('ch'))}] = {c}: символ есть."
        if line == 'count[ch] -= 1':
            return f"Символ использован: count[{q(g('ch'))}] = {g('count')[g('ch')] - 1}."
        if line == 'return False':
            return "Записку собрать нельзя."
        if line == 'return True':
            return "Для каждого символа записки нашёлся символ в журнале."
    if key == 'is_pangram':
        if line == 'seen = set()':
            return "seen — множество букв, которые уже встретились."
        if line == 'for ch in sentence:':
            return f"Следующая буква: {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"Строка пройдена, разных букв: {len(g('seen'))}."
        if line == 'seen.add(ch)':
            return f"{q(g('ch'))} уже есть в seen, множество не меняется." if g('ch') in g('seen') else f"{q(g('ch'))} добавлена, разных букв {len(g('seen')) + 1}."
        if line == 'return len(seen) == 26':
            return f"Разных букв {len(g('seen'))}, в английском алфавите 26."
    if key == 'almost_equivalent':
        if line == 'diff = {}':
            return "diff — для каждой буквы: сколько раз в word1 минус сколько раз в word2."
        if line == 'for ch in word1:':
            return f"Буква word1: {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"word1 пройдено: {q(g('diff'))}."
        if line == 'diff[ch] = diff.get(ch, 0) + 1':
            return f"diff[{q(g('ch'))}] = {g('diff').get(g('ch'), 0) + 1}."
        if line == 'for ch in word2:':
            return f"Буква word2: {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"word2 пройдено: {q(g('diff'))}."
        if line == 'diff[ch] = diff.get(ch, 0) - 1':
            return f"diff[{q(g('ch'))}] = {g('diff').get(g('ch'), 0) - 1}."
        if line == 'for d in diff.values():':
            return f"Следующая разность: {nxt['raw']['d']}." if nxt and nxt['ln'] == fr['ln'] + 1 else "Все разности не больше 3 по модулю."
        if line == 'if abs(d) > 3:':
            return f"|{g('d')}| > 3." if abs(g('d')) > 3 else f"|{g('d')}| ≤ 3."
        if line == 'return False':
            return "Разность больше 3: строки не почти равны."
        if line == 'return True':
            return "Строки почти равны."
    if key == 'equal_counts':
        if line == 'count = {}':
            return "count — частота каждой буквы."
        if line == 'for ch in s:':
            return f"Буква {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else f"Частоты: {q(g('count'))}."
        if line == 'count[ch] = count.get(ch, 0) + 1':
            return f"count[{q(g('ch'))}] = {g('count').get(g('ch'), 0) + 1}."
        if line == 'return len(set(count.values())) == 1':
            return f"Разные значения частот: {q(set(g('count').values()))}. Строка хорошая, если значение одно."
    if key == 'first_repeat':
        if line == 'seen = set()':
            return "seen — буквы, которые уже встретились один раз."
        if line == 'for ch in s:':
            return f"Буква {q(nxt['raw']['ch'])}." if nxt and nxt['ln'] == fr['ln'] + 1 else "Строка закончилась."
        if line == 'if ch in seen:':
            return f"{q(g('ch'))} уже встречалась: это второе появление." if g('ch') in g('seen') else f"{q(g('ch'))} встречается впервые."
        if line == 'return ch':
            return f"Первая буква, которая встретилась второй раз: {q(g('ch'))}."
        if line == 'seen.add(ch)':
            return f"seen = {q(sorted(g('seen') | {g('ch')}))}."
    return f"Выполняется строка {fr['ln']}."


ANAGRAM_KEYS = {'is_anagram', 'bug_set', 'bug_no_len'}
UNIQUE_KEYS = {'first_unique', 'bug_case', 'bug_alpha'}
NAME_KEYS = {'normalize_name', 'bug_split_space', 'bug_hyphen'}


def caption(line, fr, nxt, is_bug, key=''):
    if key in ANAGRAM_KEYS:
        return anagram_caption(line, fr, nxt, key)
    if key in UNIQUE_KEYS:
        return unique_caption(line, fr, nxt, key)
    if key in NAME_KEYS:
        return name_caption(line, fr, nxt, key)
    return mock_caption(line, fr, nxt, key)


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
            fr['arr'] = ['␣' if ch == ' ' else ch for ch in fr['arr']]
        elif fr['arr'] is not None and not isinstance(fr['arr'], list):
            fr['arr'] = None
    return t


NAME = '  салтыков-щедрин   михаил '
TRACES = {
    # Глава 13.2.
    'anagram': ('is_anagram', 'is_anagram', ('Апельсин', 'спаниель'), 'a', []),
    'bug_set': ('bug_set', 'is_anagram', ('папа', 'пап'), 'a', []),
    'fix_set': ('is_anagram', 'is_anagram', ('папа', 'пап'), 'a', []),
    # Глава 13.3.
    'unique': ('first_unique', 'first_unique', ('Казак',), 'text', ['i']),
    'bug_case': ('bug_case', 'first_unique', ('Казак',), 'text', ['i']),
    'name': ('normalize_name', 'normalize_name', (NAME,), 'words', []),
    # Глава 13.4: изменённая версия и верная на одном входе.
    'bug_no_len': ('bug_no_len', 'is_anagram', ('папа', 'пап'), 'a', []),
    'bug_alpha': ('bug_alpha', 'first_unique', ('Тот, кто',), 'text', ['i']),
    'fix_alpha': ('first_unique', 'first_unique', ('Тот, кто',), 'text', ['i']),
    'bug_split_space': ('bug_split_space', 'normalize_name', (NAME,), 'words', []),
    'bug_hyphen': ('bug_hyphen', 'normalize_name', (NAME,), 'words', []),
    # Глава 13.6.
    'can_construct': ('can_construct', 'can_construct', ('aa', 'aab'), 'magazine', []),
    'is_pangram': ('is_pangram', 'is_pangram', ('thequickbrownfoxjumpsoverthelazydog',), 'sentence', []),
    'almost_equivalent': ('almost_equivalent', 'almost_equivalent', ('aaaa', 'bccb'), 'word1', []),
    'equal_counts': ('equal_counts', 'equal_counts', ('abacbc',), 's', []),
    'first_repeat': ('first_repeat', 'first_repeat', ('abccbaacz',), 's', []),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:18} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 13. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
