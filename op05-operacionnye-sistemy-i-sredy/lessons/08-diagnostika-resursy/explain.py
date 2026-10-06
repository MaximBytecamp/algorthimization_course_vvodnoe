# Разбор команд для кнопки «что делает» в блоках «В терминале».
# Строка делится на команды по ; и & (вне кавычек и $( … )), каждая команда — на имя, ключи,
# аргументы и операторы | > >>. Присваивание ИМЯ=$( … ) разбирается как сохранение вывода в переменную.
# Нераспознанные части собираются в UNKNOWN: сборка перечисляет их.
import re, shlex

UNKNOWN = []

CMD = {
    'ls': 'вывести содержимое каталога', 'sleep': 'ничего не делать указанное число секунд',
    'pgrep': 'найти процессы и вывести их PID', 'ps': 'вывести сведения о процессах', 'head': 'оставить только первые строки',
    'tail': 'оставить только последние строки', 'echo': 'напечатать текст или значение переменной',
    'bash': 'запустить оболочку bash', 'pstree': 'нарисовать дерево процессов', 'yes': 'бесконечно печатать строку y',
    'kill': 'послать процессу сигнал', 'python3': 'запустить интерпретатор Python', 'cat': 'вывести содержимое файла',
    'nproc': 'напечатать число ядер процессора', 'uptime': 'напечатать время работы системы и нагрузку',
    'free': 'вывести сведения о памяти', 'top': 'монитор процессов', 'htop': 'интерактивный монитор процессов',
    'taskset': 'запустить программу только на указанных ядрах', 'nice': 'запустить программу с поправкой приоритета',
    'renice': 'изменить поправку приоритета работающего процесса', 'sudo': 'выполнить следующую команду от имени root',
    'time': 'ключевое слово bash: выполнить команду и напечатать, сколько времени она заняла',
    '/usr/bin/time': 'программа time: выполнить команду и напечатать заданные сведения о её работе',
    'find': 'обойти каталоги и вывести пути всех найденных файлов', 'rm': 'удалить файл',
}

FLAG = {
    ('ls', '-l'): 'подробный список: права, владелец, размер, дата; для ссылки — куда она указывает',
    ('pgrep', '-f'): 'искать образец во всей командной строке, а не только в имени',
    ('pgrep', '-af'): '-a — вывести командную строку, -f — искать по всей командной строке',
    ('ps', '-p'): 'выбрать процесс: {v}', ('ps', '-o'): 'выводить столбцы {v}', ('ps', '-C'): 'выбрать процессы с именем {v}',
    ('ps', '-eo'): '-e — все процессы системы; -o — выводить столбцы {v}',
    ('ps', '--sort=-%cpu'): 'сортировать по загрузке процессора, минус — по убыванию',
    ('ps', '--sort=-rss'): 'сортировать по занятой памяти, минус — по убыванию',
    ('head', '-N'): 'сколько первых строк оставить: {v}', ('tail', '-N'): 'сколько последних строк оставить: {v}',
    ('pstree', '-p'): 'показывать PID рядом с именем', ('pstree', '-s'): 'показать предков процесса — цепочку от PID 1',
    ('kill', '-9'): 'послать сигнал 9 — KILL: завершить немедленно',
    ('bash', '-c'): 'выполнить команды из строки {v}', ('python3', '-c'): 'выполнить программу из строки {v}',
    ('free', '-h'): 'показывать размеры в удобных единицах: Ki, Mi, Gi',
    ('top', '-b'): 'пакетный режим: печатать таблицу как обычный текст', ('top', '-n'): 'сколько раз обновить: {v}',
    ('taskset', '-c'): 'номера ядер, на которых можно работать: {v}',
    ('nice', '-n'): 'поправка приоритета: {v}', ('renice', '-n'): 'новое значение nice: {v}', ('renice', '-p'): 'какой процесс: {v}',
    ('/usr/bin/time', '-f'): 'формат вывода {v}: %e — время по часам в секундах, %M — пиковая память в килобайтах',
}
VALUE_FLAGS = {('ps', '-p'), ('ps', '-o'), ('ps', '-eo'), ('ps', '-C'), ('bash', '-c'), ('python3', '-c'), ('top', '-n'),
               ('taskset', '-c'), ('nice', '-n'), ('renice', '-n'), ('renice', '-p'), ('/usr/bin/time', '-f')}
# После этих команд и их ключей начинается другая команда, которую они запускают.
WRAPPERS = {'taskset', 'nice', 'sudo', 'time', '/usr/bin/time'}

ROLE = {
    'ls': ['что показать'], 'sleep': ['сколько секунд'], 'pgrep': ['образец'], 'echo': ['что напечатать'],
    'pstree': ['с какого процесса начинать'], 'kill': ['какому процессу'], 'python3': ['файл программы'], 'cat': ['какой файл'],
    'bash': ['файл скрипта'], 'head': ['какой файл'], 'tail': ['какой файл'], 'find': ['с какого каталога начинать'], 'rm': ['какой файл'],
}

VALUES = {
    '$!': 'PID последнего процесса, запущенного в фоне', '$$': 'PID текущей оболочки',
    '%1': 'задание номер 1', '%2': 'задание номер 2', '/dev/null': 'устройство, которое выбрасывает всё записанное',
}

OPS = {'|': 'передать вывод левой команды на вход следующей', '>': 'записать вывод в файл', '>>': 'дописать вывод в конец файла'}

OVERRIDE = {
    "bash -c 'cd /tmp; while true; do :; done' &": [
        ("bash -c '…'", 'запустить bash и выполнить команды из строки'),
        ('cd /tmp', 'перейти в каталог /tmp: он станет текущим каталогом процесса'),
        ('while true; do :; done', 'бесконечный цикл; двоеточие — пустая команда, процесс просто крутится'), ('&', 'запустить в фоне')],
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
        if cmd is None or (cmd in WRAPPERS and not tok.startswith('-')):
            cmd, argn = tok, 0
            parts.append((tok, CMD.get(tok, ''))); i += 1
            continue
        if cmd in ('head', 'tail') and re.fullmatch(r'-\d+', tok):
            parts.append((tok, FLAG[(cmd, '-N')].format(v=tok[1:]))); i += 1; continue
        if tok.startswith('-') and len(tok) > 1 and not tok[1:].isdigit() or (cmd == 'kill' and tok == '-9'):
            if (cmd, tok) in VALUE_FLAGS and i + 1 < len(tokens):
                v = tokens[i + 1]
                vt = (f'PID из вывода «{v[2:-1]}»' if v.startswith('$(') else VALUES.get(v)
                      or (f'PID из переменной {v[1]}' if len(v) == 2 and v[1].isupper() else v))
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
