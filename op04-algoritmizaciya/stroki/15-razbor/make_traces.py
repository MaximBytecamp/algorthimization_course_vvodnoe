"""Строит пошаговые прогоны для глав модуля 15 настоящим запуском Python.

Движок записи кадров — тот же, что в книге о массивах
(../../massivy/08-dva-ukazatelya/make_traces.py): модуль загружается, ему
подставляются исходники и подписи модуля 15.
Строка в кадре показывается лентой символов, пробел — знаком ␣.
Подряд идущие кадры одной строки сводятся к последнему.
parse_event и REQUIRED подставлены в builtins, чтобы в прогоне parse_log
на экране был только код разбора журнала.
Результат пишется в traces.js как window.TRACES = {...}.
Запуск: python make_traces.py traces.js
"""
import builtins
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

# Глава 15.2.
SOURCES['compress'] = '''
def compress(s):
    out = []
    i = 0
    while i < len(s):
        if s[i].isdigit():
            raise ValueError(f'символ {i}: цифра {s[i]!r}')
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(s[i])
        if j - i > 1:
            out.append(str(j - i))
        i = j
    return ''.join(out)
'''
SOURCES['decompress'] = '''
def decompress(code):
    out = []
    i = 0
    prev = ''
    while i < len(code):
        ch = code[i]
        if ch.isdigit():
            raise ValueError(f'символ {i}: цифра без символа серии')
        if ch == prev:
            raise ValueError(f'символ {i}: серия {ch!r} разбита на две')
        j = i + 1
        while j < len(code) and code[j].isdigit():
            j += 1
        digits = code[i + 1:j]
        if digits == '':
            count = 1
        elif digits[0] == '0' or digits == '1':
            raise ValueError(f'символ {i + 1}: недопустимая длина {digits!r}')
        else:
            count = int(digits)
        out.append(ch * count)
        prev = ch
        i = j
    return ''.join(out)
'''

# Глава 15.3.
SOURCES['parse_event'] = '''
def parse_event(line):
    if line.endswith(';'):
        line = line[:-1]
    event = {}
    for k, field in enumerate(line.split(';'), start=1):
        if field.strip() == '':
            raise ValueError(f'поле {k}: пустое')
        key, sep, value = field.partition('=')
        if sep == '':
            raise ValueError(f"поле {k}: нет '='")
        key = key.strip()
        if key == '':
            raise ValueError(f'поле {k}: пустой ключ')
        if key in event:
            raise ValueError(f'поле {k}: ключ {key!r} повторяется')
        event[key] = value.strip()
    return event
'''
SOURCES['bug_split'] = SOURCES['parse_event'].replace(
    "key, sep, value = field.partition('=')", "key, value = field.split('=')").replace(
    "if sep == '':", "if key == field:")
SOURCES['parse_log'] = '''
def parse_log(text):
    events, errors = [], []
    for n, line in enumerate(text.split('\\n'), start=1):
        if line.strip() == '':
            continue
        try:
            event = parse_event(line)
        except ValueError as e:
            errors.append((n, str(e)))
            continue
        missing = [key for key in REQUIRED if key not in event]
        if missing:
            errors.append((n, f'нет ключа {missing[0]}'))
            continue
        events.append(event)
    return events, errors
'''

# Глава 15.4.
SOURCES['bug_last_run'] = '''
def compress(s):
    out = []
    count = 1
    for k in range(1, len(s)):
        if s[k] == s[k - 1]:
            count += 1
        else:
            out.append(s[k - 1] + (str(count) if count > 1 else ''))
            count = 1
    return ''.join(out)
'''
SOURCES['fix_last_run'] = SOURCES['bug_last_run'].replace(
    "    return ''.join(out)",
    "    if s:\n        out.append(s[-1] + (str(count) if count > 1 else ''))\n    return ''.join(out)")
SOURCES['bug_one_digit'] = SOURCES['decompress'].replace(
    'while j < len(code) and code[j].isdigit():', 'if j < len(code) and code[j].isdigit():')
SOURCES['bug_no_try'] = '''
def parse_log(text):
    events, errors = [], []
    for n, line in enumerate(text.split('\\n'), start=1):
        if line.strip() == '':
            continue
        event = parse_event(line)
        missing = [key for key in REQUIRED if key not in event]
        if missing:
            errors.append((n, f'нет ключа {missing[0]}'))
            continue
        events.append(event)
    return events, errors
'''

for _k, _base in [('bug_split', 'parse_event'), ('fix_last_run', 'bug_last_run'), ('bug_one_digit', 'decompress')]:
    assert SOURCES[_k] != SOURCES[_base], f'замена в {_k} не сработала'

# Глава 15.6, тренажёр.
SOURCES['reverse_words'] = '''
def reverse_words(s):
    words = s.split()
    words.reverse()
    return ' '.join(words)
'''
SOURCES['compress_in_place'] = '''
def compress_in_place(chars):
    write = 0
    i = 0
    while i < len(chars):
        j = i
        while j < len(chars) and chars[j] == chars[i]:
            j += 1
        chars[write] = chars[i]
        write += 1
        if j - i > 1:
            for d in str(j - i):
                chars[write] = d
                write += 1
        i = j
    return write
'''
SOURCES['count_and_say'] = '''
def count_and_say(n):
    s = '1'
    for _ in range(n - 1):
        out = []
        i = 0
        while i < len(s):
            j = i
            while j < len(s) and s[j] == s[i]:
                j += 1
            out.append(str(j - i) + s[i])
            i = j
        s = ''.join(out)
    return s
'''
SOURCES['num_unique_emails'] = '''
def num_unique_emails(emails):
    seen = set()
    for email in emails:
        local, _, domain = email.partition('@')
        local = local.split('+')[0].replace('.', '')
        seen.add(local + '@' + domain)
    return len(seen)
'''
SOURCES['license_key'] = '''
def license_key(s, k):
    chars = [ch.upper() for ch in s if ch != '-']
    first = len(chars) % k or k
    groups = [''.join(chars[:first])]
    for start in range(first, len(chars), k):
        groups.append(''.join(chars[start:start + k]))
    return '-'.join(groups)
'''
SOURCES['length_of_last_word'] = '''
def length_of_last_word(s):
    j = len(s) - 1
    while j >= 0 and s[j] == ' ':
        j -= 1
    length = 0
    while j >= 0 and s[j] != ' ':
        length += 1
        j -= 1
    return length
'''

# parse_log вызывает parse_event: эталон подставляется в builtins.
_ns = {}
exec(SOURCES['parse_event'], _ns)
builtins.parse_event = _ns['parse_event']
builtins.REQUIRED = ('time', 'user', 'action')


def q(v):
    return repr(v)


def nxt_in(fr, nxt):
    """Следующий кадр — тело цикла, а не строка после него."""
    return nxt is not None and nxt['ln'] == fr['ln'] + 1


def run_caption(line, fr, nxt, key):
    """compress, compress_in_place, count_and_say: проход по сериям индексами i и j."""
    g = fr['raw'].get
    s = g('chars') if key == 'compress_in_place' else g('s')
    i, j = g('i'), g('j')
    if line == 'out = []':
        return "out — список частей ответа. Строка собирается один раз в конце, через join."
    if line == 'i = 0':
        return "i — начало текущей серии."
    if line == 'write = 0':
        return "write — куда писать следующий символ ответа. Ответ пишется в тот же список поверх прочитанного."
    if line.startswith('while i < len('):
        if i < len(s):
            return f"i = {i}: новая серия начинается с символа {q(s[i])}."
        return f"i = {i} = длине: серии кончились."
    if line == 'if s[i].isdigit():':
        return f"s[{i}] = {q(s[i])} — не цифра, сжатие возможно." if not s[i].isdigit() else f"s[{i}] = {q(s[i])} — цифра."
    if line.startswith('raise ValueError'):
        return "Цифра во входе: по сжатой записи её нельзя было бы отличить от длины серии."
    if line == 'j = i':
        return "j пойдёт вправо до первого символа другой серии."
    if line.startswith('while j < len('):
        if j < len(s) and s[j] == s[i]:
            return f"s[{j}] = {q(s[j])} — та же серия."
        if j >= len(s):
            return f"j = {j} = длине: строка кончилась, серия тоже. Длина серии j − i = {j - i}."
        return f"s[{j}] = {q(s[j])} ≠ {q(s[i])}: серия кончилась. Её длина j − i = {j - i}."
    if line == 'j += 1':
        return f"j = {j + 1}."
    if line == 'out.append(s[i])':
        return f"В out добавляется символ серии {q(s[i])}."
    if line == 'if j - i > 1:':
        return f"Длина {j - i} больше 1 и записывается." if j - i > 1 else "Длина 1 не записывается."
    if line == 'out.append(str(j - i))':
        n = j - i
        return f"В out добавляется длина {q(str(n))}" + (f": {len(str(n))} цифры одним куском." if n > 9 else ".")
    if line == 'out.append(str(j - i) + s[i])':
        return f"Серия из {j - i} символов {q(s[i])} читается как «{j - i} раз {s[i]}»: в out добавляется {q(str(j - i) + s[i])}."
    if line == 'i = j':
        return f"Следующая серия начинается с i = {j}."
    if line == "return ''.join(out)":
        return f"join соединяет {len(g('out'))} частей одним проходом: {q(''.join(g('out')))}."
    if line == 'chars[write] = chars[i]':
        return f"chars[{g('write')}] = {q(s[i])}: символ серии записан. Чтение ушло вперёд, поэтому запись ничего не портит."
    if line == 'write += 1':
        return f"write = {g('write') + 1}."
    if line == 'for d in str(j - i):':
        return f"Длина {j - i} пишется по цифре." if nxt_in(fr, nxt) else "Цифры длины записаны."
    if line == 'chars[write] = d':
        return f"chars[{g('write')}] = {q(g('d'))}."
    if line == 'return write':
        return f"Длина ответа — {g('write')}: {q(''.join(s[:g('write')]))}. Остаток списка задача не проверяет."
    if line == "s = '1'":
        return "Первый член последовательности — '1'."
    if line == 'for _ in range(n - 1):':
        return f"Строим следующий член из s = {q(s)}." if nxt_in(fr, nxt) else f"Построено {g('n')} членов."
    if line == "s = ''.join(out)":
        return f"Новый член: {q(''.join(g('out')))}."
    if line == 'return s':
        return f"Ответ: {q(s)}."
    return f"Выполняется строка {fr['ln']}."


def decomp_caption(line, fr, nxt, key):
    g = fr['raw'].get
    code, i, j = g('code'), g('i'), g('j')
    if line == 'out = []':
        return "out — части ответа: каждая серия добавится строкой ch * count."
    if line == 'i = 0':
        return "i — где начинается запись очередной серии: символ, затем цифры длины."
    if line == "prev = ''":
        return "prev — символ прошлой серии. Две серии одного символа подряд compress не пишет."
    if line == 'while i < len(code):':
        return f"i = {i}: читаем серию с символа {q(code[i])}." if i < len(code) else "Запись прочитана целиком."
    if line == 'ch = code[i]':
        return f"ch = {q(code[i])}."
    if line == 'if ch.isdigit():':
        return f"{q(g('ch'))} — не цифра." if not g('ch').isdigit() else f"{q(g('ch'))} — цифра на месте символа."
    if line == 'if ch == prev:':
        return f"{q(g('ch'))} ≠ прошлой серии {q(g('prev'))}." if g('ch') != g('prev') else f"{q(g('ch'))} совпадает с прошлой серией."
    if line == 'j = i + 1':
        return f"j = {i + 1}: с этого места могут идти цифры длины."
    if line == 'while j < len(code) and code[j].isdigit():':
        if j < len(code) and code[j].isdigit():
            return f"code[{j}] = {q(code[j])} — цифра длины, j идёт дальше."
        return f"Цифры кончились на j = {j}."
    if line == 'if j < len(code) and code[j].isdigit():':
        if j < len(code) and code[j].isdigit():
            return f"code[{j}] = {q(code[j])} — цифра. Это if, а не while: прочитана только одна цифра."
        return f"code[{j}] — не цифра."
    if line == 'j += 1':
        return f"j = {j + 1}."
    if line == 'digits = code[i + 1:j]':
        return f"digits = code[{i + 1}:{j}] = {q(code[i + 1:j])}."
    if line == "if digits == '':":
        return "Цифр нет: длина 1." if g('digits') == '' else f"Цифры есть: {q(g('digits'))}."
    if line == 'count = 1':
        return "count = 1."
    if line == "elif digits[0] == '0' or digits == '1':":
        d = g('digits')
        return f"{q(d)} — недопустимая длина: compress так не пишет." if d[0] == '0' or d == '1' else f"{q(d)} — допустимая длина."
    if line == 'count = int(digits)':
        return f"count = int({q(g('digits'))}) = {int(g('digits'))}."
    if line == 'out.append(ch * count)':
        return f"В out добавляется {q(g('ch'))} × {g('count')}."
    if line == 'prev = ch':
        return f"prev = {q(g('ch'))}."
    if line == 'i = j':
        return f"Следующая серия начинается с i = {j}."
    if line == "return ''.join(out)":
        return f"Ответ: {q(''.join(g('out')))}."
    return f"Выполняется строка {fr['ln']}."


def event_caption(line, fr, nxt, key):
    g = fr['raw'].get
    ln, k, field = g('line'), g('k'), g('field')
    if line == "if line.endswith(';'):":
        return "Строка кончается на ';': её отрежем." if ln.endswith(';') else "';' в конце нет."
    if line == 'line = line[:-1]':
        return "Одна ';' в конце допустима и отрезается."
    if line == 'event = {}':
        return "event — словарь результата."
    if line.startswith('for k, field in enumerate'):
        if nxt_in(fr, nxt):
            nk, nf = nxt['raw']['k'], nxt['raw']['field']
            pre = f"line.split(';') даёт {len(ln.split(';'))} поля. " if nk == 1 else ''
            return f"{pre}Поле {nk}: {q(nf)}."
        return "Все поля разобраны."
    if line == "if field.strip() == '':":
        return "Поле пустое." if field.strip() == '' else "Поле не пустое."
    if line == "key, sep, value = field.partition('=')":
        a, b, c = field.partition('=')
        return f"partition делит по первому '=': {q(a)}, {q(b)}, {q(c)}."
    if line == "key, value = field.split('=')":
        parts = field.split('=')
        if len(parts) == 2:
            return f"split('=') даёт два куска: {q(parts[0])} и {q(parts[1])}."
        return f"split('=') даёт {len(parts)} куска: {q(parts)}. В две переменные их не разложить."
    if line == "if sep == '':":
        return "Знака '=' нет." if g('sep') == '' else "Знак '=' есть."
    if line == 'if key == field:':
        return "Знак '=' есть."
    if line == 'key = key.strip()':
        return f"Пробелы по краям ключа убраны: {q(g('key').strip())}."
    if line == "if key == '':":
        return "Ключ пустой." if g('key') == '' else f"Ключ {q(g('key'))} не пустой."
    if line == 'if key in event:':
        return f"Ключ {q(g('key'))} уже был." if g('key') in g('event') else f"Ключа {q(g('key'))} ещё нет."
    if line == 'event[key] = value.strip()':
        return f"event[{q(g('key'))}] = {q(g('value').strip())}."
    if line == 'return event':
        return f"Разобрано полей: {len(g('event'))}."
    return f"Выполняется строка {fr['ln']}."


def log_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if line == 'events, errors = [], []':
        return "events — верные записи, errors — пары (номер строки, ошибка)."
    if line.startswith('for n, line in enumerate'):
        if nxt_in(fr, nxt):
            return f"Строка {nxt['raw']['n']}: {q(nxt['raw']['line'])}."
        return "Журнал прочитан."
    if line == "if line.strip() == '':":
        return "Строка пустая или из пробелов." if g('line').strip() == '' else "Строка не пустая."
    if line == 'continue':
        return "Переход к следующей строке журнала."
    if line == 'try:':
        return "Ошибка разбора одной строки не должна останавливать весь журнал."
    if line == 'event = parse_event(line)':
        return "parse_event разбирает строку."
    if line == 'except ValueError as e:':
        return "parse_event бросил ValueError: строка повреждена."
    if line == 'errors.append((n, str(e)))':
        return f"В errors: ({g('n')}, {q(str(g('e')))})."
    if line == 'missing = [key for key in REQUIRED if key not in event]':
        return "Ищем обязательные ключи, которых нет: time, user, action."
    if line == 'if missing:':
        return f"Нет ключей {g('missing')}." if g('missing') else "Все обязательные ключи есть."
    if line == "errors.append((n, f'нет ключа {missing[0]}'))":
        return f"В errors: ({g('n')}, 'нет ключа {g('missing')[0]}')."
    if line == 'events.append(event)':
        return "Запись верная, она добавляется в events."
    if line == 'return events, errors':
        return f"Записей {len(g('events'))}, ошибок {len(g('errors'))}."
    return f"Выполняется строка {fr['ln']}."


def last_run_caption(line, fr, nxt, key):
    g = fr['raw'].get
    s, k, count = g('s'), g('k'), g('count')
    if line == 'out = []':
        return "out — части ответа."
    if line == 'count = 1':
        return "count — длина текущей серии." if k is None else "Началась новая серия: count = 1."
    if line == 'for k in range(1, len(s)):':
        if nxt_in(fr, nxt):
            nk = nxt['raw']['k']
            return f"k = {nk}: сравниваем s[{nk}] = {q(s[nk])} с s[{nk - 1}] = {q(s[nk - 1])}."
        if key == 'bug_last_run':
            return f"Цикл кончился. Серия {q(s[-1])} длины {count} ещё не записана, а после цикла её никто не записывает."
        return f"Цикл кончился. Последняя серия {q(s[-1])} длины {count} ещё не записана."
    if line == 'if s[k] == s[k - 1]:':
        return "Та же серия." if s[k] == s[k - 1] else "Серия сменилась."
    if line == 'count += 1':
        return f"count = {count + 1}."
    if line == "out.append(s[k - 1] + (str(count) if count > 1 else ''))":
        part = s[k - 1] + (str(count) if count > 1 else '')
        return f"Серия {q(s[k - 1])} закончилась на прошлом символе: в out добавляется {q(part)}."
    if line == 'if s:':
        return "Строка не пустая: последнюю серию нужно дописать."
    if line == "out.append(s[-1] + (str(count) if count > 1 else ''))":
        part = s[-1] + (str(count) if count > 1 else '')
        return f"После цикла дописывается последняя серия {q(part)}."
    if line == "return ''.join(out)":
        return f"Ответ: {q(''.join(g('out')))}."
    return f"Выполняется строка {fr['ln']}."


def mock_caption(line, fr, nxt, key):
    g = fr['raw'].get
    if key == 'reverse_words':
        if line == 'words = s.split()':
            return f"split() без аргумента режет по любым пробелам и отбрасывает пустые куски: {q(g('s').split())}."
        if line == 'words.reverse()':
            return "Список слов разворачивается на месте."
        if line == "return ' '.join(words)":
            return f"Слова соединяются одним пробелом: {q(' '.join(g('words')))}."
    if key == 'num_unique_emails':
        if line == 'seen = set()':
            return "seen — множество адресов после приведения к одному виду."
        if line == 'for email in emails:':
            return f"Адрес {q(nxt['raw']['email'])}." if nxt_in(fr, nxt) else "Адреса кончились."
        if line == "local, _, domain = email.partition('@')":
            a, _, c = g('email').partition('@')
            return f"partition('@'): имя {q(a)}, домен {q(c)}."
        if line == "local = local.split('+')[0].replace('.', '')":
            l = g('local')
            return f"Всё после '+' отбрасывается, точки убираются: {q(l.split('+')[0].replace('.', ''))}."
        if line == "seen.add(local + '@' + domain)":
            a = g('local') + '@' + g('domain')
            return f"{q(a)} " + ("уже есть в seen." if a in g('seen') else "добавляется в seen.")
        if line == 'return len(seen)':
            return f"Разных адресов: {len(g('seen'))}."
    if key == 'license_key':
        if line == "chars = [ch.upper() for ch in s if ch != '-']":
            return "Дефисы убираются, буквы переводятся в верхний регистр."
        if line == 'first = len(chars) % k or k':
            n, k = len(g('chars')), g('k')
            if n % k == 0:
                return f"Символов {n}, {n} % {k} = 0: первая группа полная, {k} символа."
            return f"Символов {n}, {n} % {k} = {n % k}: в первой группе {n % k}, в остальных по {k}."
        if line == "groups = [''.join(chars[:first])]":
            return f"Первая группа: {q(''.join(g('chars')[:g('first')]))}."
        if line == 'for start in range(first, len(chars), k):':
            return f"Группа с индекса {nxt['raw']['start']}." if nxt_in(fr, nxt) else "Группы собраны."
        if line == "groups.append(''.join(chars[start:start + k]))":
            st, k = g('start'), g('k')
            return f"Группа {q(''.join(g('chars')[st:st + k]))}."
        if line == "return '-'.join(groups)":
            return f"Группы соединяются дефисом: {q('-'.join(g('groups')))}."
    if key == 'length_of_last_word':
        s, j = g('s'), g('j')
        if line == 'j = len(s) - 1':
            return f"j — последний символ, j = {len(s) - 1}. Строку читаем с конца."
        if line == "while j >= 0 and s[j] == ' ':":
            return f"s[{j}] — пробел в конце, пропускаем." if j >= 0 and s[j] == ' ' else f"s[{j}] = {q(s[j])} — последняя буква последнего слова."
        if line == 'length = 0':
            return "length — длина слова."
        if line == "while j >= 0 and s[j] != ' ':":
            if j >= 0 and s[j] != ' ':
                return f"s[{j}] = {q(s[j])} — буква слова."
            return "Слово кончилось: " + ("строка прочитана до начала." if j < 0 else f"s[{j}] — пробел.")
        if line == 'length += 1':
            return f"length = {g('length') + 1}."
        if line == 'j -= 1':
            return f"j = {j - 1}."
        if line == 'return length':
            return f"Длина последнего слова — {g('length')}."
    return f"Выполняется строка {fr['ln']}."


RUN_KEYS = {'compress', 'compress_in_place', 'count_and_say'}
DECOMP_KEYS = {'decompress', 'bug_one_digit'}
EVENT_KEYS = {'parse_event', 'bug_split'}
LOG_KEYS = {'parse_log', 'bug_no_try'}
LAST_KEYS = {'bug_last_run', 'fix_last_run'}


def caption(line, fr, nxt, is_bug, key=''):
    if fr['ev'] == 'exc':
        if key == 'bug_no_try':
            return f"parse_event бросил {fr['err']}. Перехвата нет: исключение прерывает весь разбор, следующие строки журнала не прочитаны."
        if key == 'bug_split':
            return f"Исключение {fr['err']}: значение содержит '=', и split даёт больше двух кусков."
        if key == 'bug_one_digit':
            return f"Исключение {fr['err']}: прочитана только первая цифра длины, и верная запись принята за повреждённую."
        return f"Исключение {fr['err']}."
    if fr['ev'] == 'return':
        return f"Функция вернула {fr['ret']}."
    if key in RUN_KEYS:
        return run_caption(line, fr, nxt, key)
    if key in DECOMP_KEYS:
        return decomp_caption(line, fr, nxt, key)
    if key in EVENT_KEYS:
        return event_caption(line, fr, nxt, key)
    if key in LOG_KEYS:
        return log_caption(line, fr, nxt, key)
    if key in LAST_KEYS:
        return last_run_caption(line, fr, nxt, key)
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
        if arr_name == 'text':
            # Журнал целиком в ленту не помещается: его строки видны в переменной line.
            fr['arr'] = None
            continue
        if isinstance(fr['arr'], (str, list)) and all(isinstance(x, str) and len(x) == 1 for x in fr['arr']):
            fr['arr'] = ['␣' if ch == ' ' else ch for ch in fr['arr']]
        elif not isinstance(fr['arr'], list):
            fr['arr'] = None
    return t


LINE = 'time=09:15;user=ivan;action=login'
LOG = 'time=09:15;user=ivan;action=login\ntime=09:20;;user=olga\ntime=09:31;user=petr;action=logout'
TRACES = {
    # Глава 15.2.
    'compress': ('compress', 'compress', ('aaabccdddd',), 's', ['i', 'j']),
    'decompress': ('decompress', 'decompress', ('a12bc2',), 'code', ['i', 'j']),
    # Глава 15.3.
    'parse_event': ('parse_event', 'parse_event', (LINE,), 'none', []),
    'bug_split': ('bug_split', 'parse_event', ('time=09:15;note=a=b',), 'none', []),
    'parse_log': ('parse_log', 'parse_log', (LOG,), 'text', []),
    # Глава 15.4.
    'bug_last_run': ('bug_last_run', 'compress', ('aaabcc',), 's', ['k']),
    'fix_last_run': ('fix_last_run', 'compress', ('aaabcc',), 's', ['k']),
    'bug_one_digit': ('bug_one_digit', 'decompress', ('a12b',), 'code', ['i', 'j']),
    'fix_one_digit': ('decompress', 'decompress', ('a12b',), 'code', ['i', 'j']),
    'bug_no_try': ('bug_no_try', 'parse_log', (LOG,), 'text', []),
    'fix_no_try': ('parse_log', 'parse_log', (LOG,), 'text', []),
    # Глава 15.6.
    'reverse_words': ('reverse_words', 'reverse_words', ('  the sky  is blue ',), 'words', []),
    'compress_in_place': ('compress_in_place', 'compress_in_place', (['a', 'a', 'b', 'b', 'c', 'c', 'c'],), 'chars', ['write', 'i', 'j']),
    'count_and_say': ('count_and_say', 'count_and_say', (4,), 's', ['i', 'j']),
    'num_unique_emails': ('num_unique_emails', 'num_unique_emails',
                          (['test.email+alex@leetcode.com', 'test.e.mail+bob.cathy@leetcode.com', 'testemail+david@lee.tcode.com'],), 'none', []),
    'license_key': ('license_key', 'license_key', ('5F3Z-2e-9-w', 4), 'chars', []),
    'length_of_last_word': ('length_of_last_word', 'length_of_last_word', ('   fly me   to   the moon  ',), 's', ['j']),
}

if __name__ == '__main__':
    out = {name: run(*spec_) for name, spec_ in TRACES.items()}
    for name, t in out.items():
        print(f"{name:22} frames={len(t['frames']):3} result={t['error'] or t['result']}")
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        f.write('/* Пошаговые прогоны модуля 15. Файл собран скриптом make_traces.py\n'
                '   настоящим запуском Python 3.12: править вручную не нужно. */\n')
        f.write('window.TRACES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
