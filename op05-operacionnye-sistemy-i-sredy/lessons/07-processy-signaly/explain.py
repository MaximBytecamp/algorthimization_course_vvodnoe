# Разбор команд для кнопки «что делает» в блоках «В терминале».
# Строка делится на команды по ; и & (вне кавычек и $( … )), каждая команда — на имя, ключи,
# аргументы и операторы | > >>. Присваивание ИМЯ=$( … ) разбирается как сохранение вывода в переменную.
# Нераспознанные части собираются в UNKNOWN: сборка перечисляет их.
import re, shlex

UNKNOWN = []

CMD = {
    'ls': 'вывести содержимое каталога', 'sleep': 'ничего не делать указанное число секунд',
    'pgrep': 'найти процессы и вывести их PID', 'ps': 'вывести сведения о процессах', 'head': 'оставить только первые строки',
    'readlink': 'показать, куда указывает символическая ссылка', 'echo': 'напечатать текст или значение переменной',
    'bash': 'запустить оболочку bash', 'pstree': 'нарисовать дерево процессов', 'yes': 'бесконечно печатать строку y',
    'cut': 'вырезать из строк нужные символы или поля', 'sort': 'отсортировать строки', 'uniq': 'объединить одинаковые соседние строки',
    'jobs': 'встроенная команда оболочки: вывести задания', 'bg': 'встроенная команда оболочки: продолжить задание в фоне',
    'fg': 'встроенная команда оболочки: вернуть задание на передний план', 'kill': 'послать процессу сигнал',
    'true': 'ничего не делать и завершиться с кодом 0', 'false': 'ничего не делать и завершиться с кодом 1',
    'wait': 'встроенная команда оболочки: дождаться завершения фонового процесса и вернуть его код',
    'python3': 'запустить интерпретатор Python и выполнить программу из файла', 'cat': 'вывести содержимое файла',
}

FLAG = {
    ('ls', '-l'): 'подробный список: права, владелец, размер, дата',
    ('pgrep', '-a'): 'выводить вместе с PID командную строку', ('pgrep', '-f'): 'искать образец во всей командной строке, а не только в имени',
    ('pgrep', '-P'): 'искать потомков процесса {v}', ('pgrep', '-af'): '-a — вывести командную строку, -f — искать по всей командной строке',
    ('ps', '-p'): 'выбрать процесс с PID {v}', ('ps', '-o'): 'выводить столбцы {v}', ('ps', '--ppid'): 'выбрать потомков процесса {v}',
    ('ps', '-eo'): '-e — все процессы системы; -o {v} — выводить только этот столбец, знак = убирает заголовок',
    ('head', '-N'): 'сколько первых строк оставить: {v}', ('pstree', '-p'): 'показывать PID рядом с именем',
    ('cut', '-c1'): 'оставить первый символ строки', ('uniq', '-c'): 'перед каждой строкой вывести, сколько раз она повторилась',
    ('jobs', '-l'): 'добавить PID каждого задания',
    ('kill', '-l'): 'вывести список сигналов с номерами', ('kill', '-9'): 'послать сигнал 9 — KILL: завершить немедленно',
    ('kill', '-STOP'): 'послать сигнал STOP: остановить процесс', ('kill', '-CONT'): 'послать сигнал CONT: продолжить остановленный процесс',
    ('bash', '-c'): 'выполнить команды из строки {v}',
}
VALUE_FLAGS = {('pgrep', '-P'), ('ps', '-p'), ('ps', '-o'), ('ps', '--ppid'), ('ps', '-eo'), ('bash', '-c')}

ROLE = {
    'ls': ['что показать'], 'sleep': ['сколько секунд'], 'pgrep': ['образец имени'], 'readlink': ['какая ссылка'],
    'echo': ['что напечатать'], 'pstree': ['с какого процесса начинать'], 'kill': ['какому процессу'], 'wait': ['какой процесс ждать'],
    'python3': ['файл программы'], 'cat': ['какой файл'], 'bg': ['какое задание'], 'fg': ['какое задание'], 'bash': ['файл скрипта'],
    'head': ['какой файл'],
}

VALUES = {
    '$!': 'PID последнего процесса, запущенного в фоне', '$$': 'PID текущей оболочки', '$?': 'код завершения предыдущей команды',
    '%1': 'задание номер 1', '/dev/null': 'устройство, которое выбрасывает всё записанное',
}

OPS = {'|': 'передать вывод левой команды на вход следующей', '>': 'записать вывод в файл', '>>': 'дописать вывод в конец файла'}

OVERRIDE = {
    "bash -c 'trap \"echo got TERM, keep working\" TERM; while true; do sleep 1; done' &": [
        ("bash -c '…'", 'запустить bash и выполнить команды из строки'),
        ('trap "echo got TERM, keep working" TERM', 'обработчик: при сигнале TERM напечатать строку и продолжить работу'),
        ('while true; do sleep 1; done', 'бесконечный цикл: спать по секунде'), ('&', 'запустить в фоне')],
    "bash -c 'sleep 1 & exec sleep 300' &": [
        ("bash -c '…'", 'запустить bash и выполнить команды из строки'), ('sleep 1 &', 'потомок: спит секунду в фоне и завершается'),
        ('exec sleep 300', 'заменить саму оболочку программой sleep 300; новая программа не ждёт потомков'), ('&', 'запустить всё в фоне')],
    "bash -c 'sleep 1 & exec -a lab-parent sleep 300' &": [
        ("bash -c '…'", 'запустить bash и выполнить команды из строки'), ('sleep 1 &', 'потомок: спит секунду в фоне и завершается'),
        ('exec -a lab-parent sleep 300', 'заменить оболочку программой sleep 300 под именем lab-parent; она не ждёт потомков'), ('&', 'запустить всё в фоне')],
    "bash -c 'sleep 200; echo done' &": [
        ("bash -c '…'", 'запустить отдельную оболочку bash и выполнить команды из строки'),
        ('sleep 200; echo done', 'две команды по очереди: оболочка остаётся родителем sleep'), ('&', 'запустить в фоне')],
}


def shape(tok):
    t = tok.strip('"\'')
    if t.startswith('~/'): return 'путь от домашнего каталога'
    if t.startswith('/'): return 'абсолютный путь'
    return ''


def split_line(s):
    """Делит строку на команды по ; и & вне кавычек и $( … ). Возвращает [(команда, разделитель)]."""
    out, cur, q, depth, i = [], '', None, 0, 0
    while i < len(s):
        ch = s[i]
        if q:
            cur += ch
            if ch == q: q = None
        elif ch in '\'"':
            q = ch; cur += ch
        elif s.startswith('$(', i):
            depth += 1; cur += '$('; i += 2; continue
        elif ch == ')' and depth:
            depth -= 1; cur += ch
        elif ch in ';&' and not depth and not s.startswith('&&', i) and not (ch == '&' and cur.endswith('>')):
            out.append((cur.strip(), ch)); cur = ''
        else:
            cur += ch
        i += 1
    if cur.strip(): out.append((cur.strip(), ''))
    return out


def explain_one(cmdline):
    m = re.match(r'^([A-Z])=\$\((.*)\)$', cmdline)
    if m:
        return [(f'{m.group(1)}=$( … )', f'сохранить в переменную {m.group(1)} вывод команды в скобках')] + explain_one(m.group(2))
    lex = shlex.shlex(cmdline, posix=False); lex.whitespace_split = True; lex.commenters = ''
    tokens = []
    for t in lex:                       # $( … ) с пробелами внутри — один токен
        if tokens and tokens[-1].count('$(') > tokens[-1].count(')'):
            tokens[-1] += ' ' + t
        else:
            tokens.append(t)
    parts, i, cmd, argn = [], 0, None, 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in OPS:
            parts.append((tok, OPS[tok])); i += 1
            if tok in ('>', '>>') and i < len(tokens):
                parts.append((tokens[i], VALUES.get(tokens[i], 'файл, в который записывается вывод'))); i += 1
            if tok == '|': cmd = None
            continue
        if cmd is None:
            cmd, argn = tok, 0
            parts.append((tok, CMD.get(tok, ''))); i += 1
            continue
        if cmd == 'head' and re.fullmatch(r'-\d+', tok):
            parts.append((tok, FLAG[('head', '-N')].format(v=tok[1:]))); i += 1; continue
        if tok.startswith('-') and len(tok) > 1 and not tok[1:].isdigit() or (cmd == 'kill' and tok == '-9'):
            if (cmd, tok) in VALUE_FLAGS and i + 1 < len(tokens):
                v = tokens[i + 1]
                vt = f'из вывода «{v[2:-1]}»' if v.startswith('$(') else v
                parts.append((f'{tok} {v}', FLAG.get((cmd, tok), '').format(v=vt))); i += 2; continue
            parts.append((tok, FLAG.get((cmd, tok), ''))); i += 1; continue
        if tok.startswith('$(') and tok.endswith(')'):
            parts.append((tok, 'подставить вывод команды ' + tok[2:-1])); i += 1; continue
        roles = ROLE.get(cmd, [''])
        role = roles[min(argn, len(roles) - 1)]; argn += 1
        val = VALUES.get(tok)
        if cmd == 'kill' and tok.isdigit(): val = f'PID {tok}' + (' — первый процесс системы, systemd' if tok == '1' else '')
        if tok.startswith('$') and len(tok) == 2 and tok[1].isupper():
            val = f'значение переменной {tok[1]}: сохранённый PID'
        s = shape(tok)
        text = ', '.join(x for x in (role, val) if x) or s
        if s and text != s: text += f' ({s})'
        parts.append((tok, text)); i += 1
    return parts


def explain(cmdline):
    if cmdline in OVERRIDE:
        return OVERRIDE[cmdline]
    parts = []
    segs = split_line(cmdline)
    for cmd, sep in segs:
        if cmd:
            parts += explain_one(cmd)
        if sep == ';' and cmd is not segs[-1][0]:
            parts.append((';', 'разделитель: выполнить следующую команду после этой'))
        elif sep == '&':
            parts.append(('&', 'запустить команду слева в фоне и сразу продолжить'))
    for p, t in parts:
        if not t:
            UNKNOWN.append(f'{cmdline!r} → {p}')
    return parts
