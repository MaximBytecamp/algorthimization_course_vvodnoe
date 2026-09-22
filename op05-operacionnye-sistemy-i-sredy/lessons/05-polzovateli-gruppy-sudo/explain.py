# Разбор команд для кнопки «что делает» в блоках «В терминале».
# Команда делится на части: имя, ключи (со значениями), аргументы и операторы | > >> 2>/dev/null.
# Для каждой части ищется объяснение в словарях ниже; нераспознанные части собираются в UNKNOWN.
import shlex

UNKNOWN = []

CMD = {
    'whoami': 'вывести имя текущего пользователя', 'id': 'вывести номера пользователя и его группы',
    'getent': 'получить запись из системной базы данных', 'wc': 'посчитать строки, слова или байты',
    'cut': 'вырезать из строк нужные поля', 'head': 'оставить только первые строки', 'tail': 'оставить только последние строки',
    'grep': 'отобрать строки, в которых есть образец', 'ps': 'вывести список процессов', 'sort': 'отсортировать строки',
    'uniq': 'объединить одинаковые соседние строки', 'ls': 'вывести содержимое каталога', 'cat': 'вывести содержимое файла',
    'sudo': 'выполнить команду от имени другого пользователя, по умолчанию root', 'passwd': 'задать пароль или показать его состояние',
    'groups': 'вывести группы пользователя', 'journalctl': 'прочитать системный журнал',
    'groupadd': 'создать группу', 'useradd': 'создать учётную запись', 'adduser': 'создать учётную запись по шагам с вопросами',
    'usermod': 'изменить учётную запись', 'mkdir': 'создать каталог', 'chgrp': 'сменить группу файла или каталога',
    'chmod': 'изменить права доступа', 'touch': 'создать пустой файл', 'echo': 'напечатать текст',
    'tee': 'записать полученный текст в файл и вывести на экран', 'su': 'открыть оболочку другого пользователя',
    'userdel': 'удалить учётную запись', 'groupdel': 'удалить группу', 'bash': 'запустить оболочку bash и выполнить команды из файла',
}

FLAG = {
    ('wc', '-l'): 'считать только строки',
    ('cut', '-d:'): 'поля разделены двоеточием', ('cut', '-f1,3,7'): 'взять поля 1, 3 и 7: имя, UID и оболочку',
    ('head', '-N'): 'сколько первых строк оставить: {v}', ('tail', '-n'): 'сколько последних строк оставить: {v}',
    ('grep', '-c'): 'вывести не строки, а их количество', ('grep', '-v'): 'отобрать строки, в которых образца нет',
    ('ps', '-eo', 'user='): '-e — все процессы системы; -o user= — выводить только владельца, знак = убирает заголовок столбца',
    ('uniq', '-c'): 'перед каждой строкой вывести, сколько раз она повторилась',
    ('ls', '-l'): 'подробный список: права, владелец, группа, размер', ('ls', '-a'): 'показать и скрытые файлы',
    ('ls', '-d'): 'показать сам каталог, а не его содержимое',
    ('passwd', '-S'): 'показать состояние пароля', ('id', '-G'): 'вывести все группы', ('id', '-n'): 'имена вместо номеров',
    ('sudo', '-l'): 'вывести правила sudo для текущего пользователя', ('sudo', '-i'): 'открыть оболочку root с полным входом',
    ('sudo', '-u'): 'выполнить от имени пользователя {v}',
    ('journalctl', '-n'): 'вывести последние {v} записей', ('journalctl', '--no-pager'): 'вывести сразу в терминал, без постраничного просмотра',
    ('journalctl', '-t'): 'только записи с меткой {v}',
    ('useradd', '-m'): 'создать домашний каталог и скопировать файлы из /etc/skel', ('useradd', '-s'): 'оболочка после входа: {v}',
    ('useradd', '-c'): 'комментарий: {v}',
    ('usermod', '-a'): 'добавить к имеющимся группам', ('usermod', '-G'): 'дополнительные группы; без -a прежний список групп заменяется целиком',
    ('tee', '-a'): 'дописать в конец файла; без -a файл перезаписывается', ('su', '-'): 'полный вход: окружение и домашний каталог целевого пользователя',
    ('userdel', '-r'): 'удалить и домашний каталог с почтовым ящиком',
}

VALUE_FLAGS = {('ps', '-eo'), ('sudo', '-u'), ('journalctl', '-n'), ('journalctl', '-t'), ('useradd', '-s'), ('useradd', '-c'), ('tail', '-n')}
SPLIT_SHORT = {'ls', 'id', 'usermod'}

ROLE = {
    'id': ['чей номер показать'], 'getent': ['какая база данных', 'какая запись'], 'wc': ['какой файл'], 'cut': ['из какого файла'],
    'grep': ['образец', 'в каком файле искать'], 'ls': ['что показать'], 'cat': ['какой файл вывести'], 'passwd': ['чей пароль'],
    'groupadd': ['имя новой группы'], 'useradd': ['имя новой учётной записи'], 'adduser': ['имя новой учётной записи'],
    'usermod': ['чью запись изменить'], 'mkdir': ['какой каталог создать'], 'chgrp': ['новая группа', 'какой каталог'],
    'chmod': ['права', 'какой каталог'], 'touch': ['какой файл'], 'echo': ['что напечатать'], 'tee': ['в какой файл записать'],
    'su': ['в чью учётную запись войти'], 'userdel': ['какую запись удалить'], 'groupdel': ['какую группу удалить'], 'bash': ['файл скрипта'],
    'journalctl': ['условие отбора'],
}

SPECIAL = {
    ('getent', 'passwd'): 'база учётных записей', ('getent', 'group'): 'база групп',
    ('grep', '"^#"'): 'образец: строки, которые начинаются с # (комментарии)', ('grep', '"^$"'): 'образец: пустые строки',
    ('grep', '"NOT in sudoers"'): 'образец: слова записи об отказе sudo',
    ('journalctl', '_COMM=sudo'): 'только записи программы sudo', ('journalctl', '_COMM=su'): 'только записи программы su',
    ('chmod', '2770'): 'права числом: 2 — setgid, 7 — rwx владельцу, 7 — rwx группе, 0 — ничего остальным',
    ('echo', '"draft by boris"'): 'текст строки', ('chgrp', 'devteam'): 'новая группа devteam',
    ('usermod', 'devteam'): 'группа devteam', ('usermod', 'testers'): 'группа testers',
}

OPS = {'|': 'передать вывод левой команды на вход следующей', '>': 'записать вывод в файл; если файл есть, он будет перезаписан',
       '>>': 'дописать вывод в конец файла', '2>/dev/null': 'отправить сообщения об ошибках (поток 2) в /dev/null: на экран они не попадут'}


def shape(tok):
    t = tok.strip('"\'')
    notes = []
    quoted = tok[:1] in '"\''
    if t == '..': notes.append('каталог уровнем выше')
    elif t == '.': notes.append('текущий каталог')
    elif t == '~': notes.append('домашний каталог')
    elif t.startswith('~/'): notes.append('путь от домашнего каталога')
    elif t.startswith('../'): notes.append('путь от каталога уровнем выше')
    elif t.startswith('/'): notes.append('абсолютный путь')
    elif '/' in t or ('.' in t and not any(ch in t for ch in '*?[{')): notes.append('путь относительно текущего каталога')
    if t.endswith('/') and len(t) > 1: notes.append('косая черта в конце: это каталог')
    if quoted and any(ch in t for ch in '*?['): notes.append('в кавычках: маску получает сама команда, оболочка её не раскрывает')
    elif any(ch in t for ch in '*?[') or '{' in t:
        parts = []
        if '*' in t: parts.append('* — любые символы')
        if '?' in t: parts.append('? — один символ')
        if '[!' in t: parts.append('[!…] — один символ, кроме перечисленных')
        elif '[' in t: parts.append('[…] — один символ из набора')
        if '{' in t: parts.append('{…} — оболочка подставит каждый вариант')
        notes.append('маска: ' + ', '.join(parts) + '; оболочка заменит её именами файлов')
    return '; '.join(notes)


def tokenize(cmdline):
    lex = shlex.shlex(cmdline, posix=False)
    lex.whitespace_split = True
    lex.commenters = ''
    out = []
    for t in lex:
        if out and out[-1].endswith('\\') and not out[-1].endswith('\\\\') and out[-1] != '\\':
            out[-1] += ' ' + t      # «my\ report.txt»: пробел после \ остаётся внутри слова
        else:
            out.append(t)
    return out


def explain(cmdline):
    tokens = tokenize(cmdline)
    parts, i, cmd, argn = [], 0, None, 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in OPS:
            parts.append((tok, OPS[tok])); i += 1
            if tok in ('>', '>>') and i < len(tokens):
                parts.append((tokens[i], 'файл, в который записывается вывод')); i += 1
            if tok == '|': cmd = None
            continue
        if cmd is None:
            cmd, argn = tok, 0
            parts.append((tok, CMD.get(tok, '')))
            i += 1
            if cmd == 'sudo':
                while i < len(tokens) and tokens[i].startswith('-'):   # ключи самой sudo
                    f = tokens[i]
                    if (('sudo', f) in VALUE_FLAGS) and i + 1 < len(tokens):
                        parts.append((f'{f} {tokens[i + 1]}', FLAG[('sudo', f)].format(v=tokens[i + 1]))); i += 2
                    else:
                        parts.append((f, FLAG.get(('sudo', f), ''))); i += 1
                cmd = None
            continue
        if cmd == 'find' and tok == '-exec':
            j = tokens.index('\\;', i)
            inner = ' '.join(tokens[i + 1:j])
            parts.append((' '.join(tokens[i:j + 1]), f'для каждого найденного файла выполнить «{inner}»: вместо {{}} подставляется путь, \\; — конец команды'))
            i = j + 1; continue
        if tok == '-' and cmd == 'su':
            parts.append((tok, FLAG[('su', '-')])); i += 1; continue
        if tok.startswith('-') and not tok.lstrip('-').isdigit() or (cmd in ('head',) and tok.startswith('-')):
            if cmd == 'head':
                parts.append((tok, FLAG[('head', '-N')].format(v=tok[1:]))); i += 1; continue
            if not tok.startswith('--') and len(tok) > 2 and cmd in SPLIT_SHORT:
                for ch in tok[1:]:
                    parts.append((f'-{ch}', FLAG.get((cmd, f'-{ch}'), '')))
                i += 1; continue
            if (cmd, tok) in VALUE_FLAGS and i + 1 < len(tokens):
                v = tokens[i + 1]
                text = FLAG.get((cmd, tok, v)) or FLAG.get((cmd, tok), '').format(v=v)
                parts.append((f'{tok} {v}', text)); i += 2; continue
            parts.append((tok, FLAG.get((cmd, tok), ''))); i += 1; continue
        roles = ROLE.get(cmd, [''])
        role = roles[min(argn, len(roles) - 1)]
        argn += 1
        text = SPECIAL.get((cmd, tok))
        if not text:
            s = shape(tok)
            text = f'{role} ({s})' if role and s else (role or s)
        parts.append((tok, text))
        i += 1
    for p, t in parts:
        if not t:
            UNKNOWN.append(f'{cmdline!r} → {p}')
    return parts
