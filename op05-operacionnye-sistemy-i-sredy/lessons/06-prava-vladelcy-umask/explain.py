# Разбор команд для кнопки «что делает» в блоках «В терминале».
# Команда делится на части: имя, ключи (со значениями), аргументы и операторы | > >> ;.
# Строки с циклом, подоболочкой и bash -c разбираются целиком по таблице OVERRIDE.
# Нераспознанные части собираются в UNKNOWN: сборка перечисляет их.
import shlex

UNKNOWN = []

CMD = {
    'bash': 'запустить оболочку bash и выполнить команды из файла', 'cd': 'сменить текущий каталог',
    'ls': 'вывести содержимое каталога', 'stat': 'вывести сведения о файле из inode', 'chmod': 'изменить права доступа',
    'cat': 'вывести содержимое файла', './backup.sh': 'запустить файл backup.sh из текущего каталога как программу',
    'touch': 'создать пустой файл', 'rm': 'удалить файл', 'chown': 'сменить владельца (и группу) файла',
    'chgrp': 'сменить группу файла', 'sudo': 'выполнить команду от имени другого пользователя, по умолчанию root',
    'umask': 'встроенная команда оболочки: вывести или задать маску прав новых файлов', 'mkdir': 'создать каталог',
    'find': 'найти файлы и каталоги в дереве', 'head': 'оставить только первые строки',
    'setfacl': 'изменить список доступа ACL', 'getfacl': 'вывести список доступа ACL',
    'groupadd': 'создать группу', 'usermod': 'изменить учётную запись', 'id': 'вывести номера пользователя и его группы',
    'echo': 'напечатать текст', 'tee': 'записать полученный текст в файл и вывести на экран',
}

FLAG = {
    ('ls', '-l'): 'подробный список: права, владелец, группа, размер', ('ls', '-d'): 'показать сам каталог, а не его содержимое',
    ('ls', '-R'): 'показать и содержимое вложенных каталогов',
    ('stat', '-c'): 'вывести только поля по шаблону {v}',
    ('chmod', '-v'): 'печатать права до и после изменения',
    ('chown', '-R'): 'сменить владельца каталога и всего содержимого', ('find', '-perm'): 'условие {v}: у файла установлены все указанные биты; 4000 — setuid',
    ('head', '-N'): 'сколько первых строк оставить: {v}',
    ('sudo', '-u'): 'выполнить от имени пользователя {v}',
    ('setfacl', '-m'): 'добавить или изменить запись {v}', ('setfacl', '-b'): 'удалить все записи ACL',
    ('mkdir', '-p'): 'создать и промежуточные каталоги; без ошибки, если каталог уже есть',
    ('usermod', '-a'): 'добавить к имеющимся группам', ('usermod', '-G'): 'дополнительные группы; без -a прежний список заменяется целиком',
    ('tee', '-a'): 'дописать в конец файла; без -a файл перезаписывается',
}
VALUE_FLAGS = {('stat', '-c'), ('sudo', '-u'), ('setfacl', '-m'), ('find', '-perm')}
SPLIT_SHORT = {'ls', 'usermod'}

# Значения прав для chmod: разбор символьной и числовой записи.
WHO_DAT = {'u': 'владельцу', 'g': 'группе', 'o': 'остальным', 'a': 'всем'}
WHO_GEN = {'u': 'владельца', 'g': 'группы', 'o': 'остальных', 'a': 'всех'}
DIG = {'7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '3': '-wx', '2': '-w-', '1': '--x', '0': '---'}
SPECIAL_BIT = {'1': 'бит sticky', '2': 'бит setgid', '3': 'биты setgid и sticky', '4': 'бит setuid'}


def chmod_mode(m):
    if m.isdigit():
        d = m[-3:]
        txt = f'права числом: {d[0]} — {DIG[d[0]]} владельцу, {d[1]} — {DIG[d[1]]} группе, {d[2]} — {DIG[d[2]]} остальным'
        if len(m) == 4:
            txt = f'первая цифра {m[0]} — {SPECIAL_BIT[m[0]]}; ' + txt
        return txt
    out = []
    for part in m.split(','):
        i = 0
        while i < len(part) and part[i] in WHO_DAT: i += 1
        who = part[:i] or 'a'
        op, perms = part[i], part[i + 1:]
        word = 'права' if len(perms) > 1 else 'право'
        if op == '+': out.append(f'добавить {" и ".join(WHO_DAT[c] for c in who)} {word} {perms}')
        elif op == '-': out.append(f'снять у {" и ".join(WHO_GEN[c] for c in who)} {word} {perms}')
        elif perms: out.append(f'установить {" и ".join(WHO_DAT[c] for c in who)} ровно {perms}')
        else: out.append(f'у {" и ".join(WHO_GEN[c] for c in who)} прав нет')
    return 'права буквами: ' + '; '.join(out)


ROLE = {
    'bash': ['файл скрипта'], 'cd': ['куда перейти'], 'ls': ['что показать'], 'stat': ['о каком файле'], 'chmod': ['права', 'какой файл или каталог'],
    'cat': ['какой файл вывести'], 'touch': ['какой файл'], 'rm': ['что удалить'], 'chown': ['новый владелец', 'какой файл или каталог'],
    'chgrp': ['новая группа', 'какой файл или каталог'], 'umask': ['новая маска'], 'mkdir': ['какой каталог создать'], 'find': ['где искать'],
    'setfacl': ['какой файл или каталог'], 'getfacl': ['какой файл или каталог'], 'groupadd': ['имя новой группы'],
    'usermod': ['группа', 'чью запись изменить'], 'id': ['чьи номера показать'], 'echo': ['что напечатать'], 'tee': ['в какой файл записать'],
}

SPECIAL = {
    ('stat', "'%A %a %U %G %n'"): 'шаблон', ('chown', 'anna:devteam'): 'новый владелец anna и группа devteam',
    ('chown', 'ubuntu:ubuntu'): 'владелец ubuntu и группа ubuntu', ('setfacl', 'u:anna:rx'): 'пользователю anna — чтение и проход',
    ('id', 'alex;'): 'чьи номера показать',
}

OPS = {'|': 'передать вывод левой команды на вход следующей', '>': 'записать вывод в файл; если файл есть, он будет перезаписан',
       '>>': 'дописать вывод в конец файла', '2>/dev/null': 'отправить сообщения об ошибках (поток 2) в /dev/null: на экран они не попадут'}

OVERRIDE = {
    '(umask 077; touch secret.txt; mkdir secret-dir; ls -ld secret.txt secret-dir)': [
        ('( … )', 'выполнить команды в подоболочке: отдельной копии bash; изменения маски не выйдут за скобки'),
        ('umask 077', 'маска 077: снимать у новых файлов все права группы и остальных'),
        ('touch secret.txt', 'создать файл: 666 без битов маски = 600'),
        ('mkdir secret-dir', 'создать каталог: 777 без битов маски = 700'),
        ('ls -ld secret.txt secret-dir', 'показать права обоих, каталог — сам, а не содержимое'),
        (';', 'разделитель: выполнить следующую команду после предыдущей')],
    '(umask 027; touch team.txt; ls -l team.txt)': [
        ('( … )', 'выполнить команды в подоболочке'), ('umask 027', 'маска 027: у группы снимать w, у остальных всё'),
        ('touch team.txt', 'создать файл: 666 без битов маски = 640'), ('ls -l team.txt', 'показать права нового файла')],
    'for u in alex bella chris; do sudo useradd -m -s /bin/bash $u; done': [
        ('for u in alex bella chris', 'цикл: переменная u по очереди принимает значения alex, bella, chris'),
        ('do … done', 'команды между do и done выполняются для каждого значения'),
        ('sudo useradd', 'создать учётную запись с правами root'), ('-m', 'создать домашний каталог'),
        ('-s /bin/bash', 'оболочка после входа: /bin/bash'), ('$u', 'вместо $u оболочка подставит текущее имя из списка')],
    'id alex; id bella; id chris': [
        ('id alex', 'номера и группы alex'), (';', 'разделитель: выполнить следующую команду'),
        ('id bella', 'номера и группы bella'), ('id chris', 'номера и группы chris')],
    "sudo -u alex bash -c 'echo \"print(1)\" > /srv/shop/src/app.py'": [
        ('sudo -u alex', 'выполнить от имени пользователя alex'), ('bash -c \'…\'', 'запустить bash и выполнить команды из строки в кавычках'),
        ('echo "print(1)" > /srv/shop/src/app.py', 'записать строку print(1) в новый файл; перенаправление > выполняет bash alex, поэтому права проверяются для alex')],
    "sudo -u alex bash -c 'echo TOKEN=lab > /srv/shop/src/config.env; chmod 600 /srv/shop/src/config.env'": [
        ('sudo -u alex', 'выполнить от имени пользователя alex'), ('bash -c \'…\'', 'выполнить две команды из строки в кавычках'),
        ('echo TOKEN=lab > …/config.env', 'создать файл с секретом'), ('chmod 600 …/config.env', 'оставить права только владельцу alex: rw-------')],
    "sudo -u alex bash -c 'echo release-1 > /srv/shop/releases/v1.txt'": [
        ('sudo -u alex', 'выполнить от имени пользователя alex'), ('bash -c \'…\'', 'запустить bash и выполнить команду из строки в кавычках'),
        ('echo release-1 > /srv/shop/releases/v1.txt', 'создать файл сборки v1.txt в каталоге публикаций')],
    "echo 'print(2)' | sudo -u bella tee -a /srv/shop/src/app.py": [
        ('echo \'print(2)\'', 'напечатать строку print(2)'), ('|', 'передать её на вход следующей команде'),
        ('sudo -u bella', 'выполнить от имени bella'), ('tee -a', 'дописать полученный текст в конец файла'),
        ('/srv/shop/src/app.py', 'файл alex: запись проверяется для bella'),
    ],
}


def shape(tok):
    t = tok.strip('"\'')
    notes = []
    if t == '~': notes.append('домашний каталог')
    elif t.startswith('~/'): notes.append('путь от домашнего каталога')
    elif t.startswith('/'): notes.append('абсолютный путь')
    elif '/' in t or '.' in t: notes.append('путь относительно текущего каталога')
    if '{' in t: notes.append('фигурные скобки: оболочка подставит каждый вариант')
    return '; '.join(notes)


def tokenize(cmdline):
    lex = shlex.shlex(cmdline, posix=False)
    lex.whitespace_split = True
    lex.commenters = ''
    return list(lex)


def explain_one(cmdline):
    tokens = tokenize(cmdline)
    parts, i, cmd, argn = [], 0, None, 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in OPS:
            parts.append((tok, OPS[tok])); i += 1
            if tok == '|': cmd = None
            continue
        if cmd is None:
            cmd, argn = tok, 0
            parts.append((tok, CMD.get(tok, '')))
            i += 1
            if cmd == 'sudo':
                while i < len(tokens) and tokens[i].startswith('-'):
                    f = tokens[i]
                    if ('sudo', f) in VALUE_FLAGS and i + 1 < len(tokens):
                        parts.append((f'{f} {tokens[i + 1]}', FLAG[('sudo', f)].format(v=tokens[i + 1]))); i += 2
                    else:
                        parts.append((f, FLAG.get(('sudo', f), ''))); i += 1
                cmd = None
            continue
        if cmd == 'head' and tok.startswith('-') and tok[1:].isdigit():
            parts.append((tok, FLAG[('head', '-N')].format(v=tok[1:]))); i += 1; continue
        if cmd == 'chmod' and argn == 0 and not tok == '-v':
            parts.append((tok, chmod_mode(tok))); argn += 1; i += 1; continue
        if tok.startswith('-') and len(tok) > 1:
            if not tok.startswith('--') and len(tok) > 2 and cmd in SPLIT_SHORT:
                for ch in tok[1:]:
                    parts.append((f'-{ch}', FLAG.get((cmd, f'-{ch}'), '')))
                i += 1; continue
            if (cmd, tok) in VALUE_FLAGS and i + 1 < len(tokens):
                v = tokens[i + 1]
                parts.append((f'{tok} {v}', FLAG.get((cmd, tok), '').format(v=v))); i += 2; continue
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
    return parts


def explain(cmdline):
    if cmdline in OVERRIDE:
        return OVERRIDE[cmdline]
    parts = explain_one(cmdline)
    for p, t in parts:
        if not t:
            UNKNOWN.append(f'{cmdline!r} → {p}')
    return parts
