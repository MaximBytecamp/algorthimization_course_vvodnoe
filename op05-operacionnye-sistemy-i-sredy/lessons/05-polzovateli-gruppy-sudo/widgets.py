# Интерактивные схемы занятия 5: анатомия строки учётной записи, маршрут команды sudo
# и проверка доступа к общему каталогу. Строки, номера и ответы терминала взяты со снимков 01–17.
import html, json
E = html.escape

# Строки системных файлов: (вкладка, файл, строка, [(поле, пояснение)])
RECORDS = [
    ('anna · passwd', '/etc/passwd', 'anna:x:1002:1003:Anna Developer:/home/anna:/bin/bash', [
        ('имя входа', 'по нему пользователь входит в систему и его видят команды ls -l, ps, id'),
        ('пароль', 'x означает, что хеш пароля хранится в /etc/shadow'),
        ('UID', 'номер пользователя; по номеру система определяет владельца файлов и процессов'),
        ('GID', 'номер основной группы: 1003 — личная группа anna'),
        ('комментарий', 'полное имя или описание учётной записи'),
        ('домашний каталог', 'каталог, который открывается после входа; в нём личные файлы и настройки'),
        ('оболочка', 'программа, которая запускается после входа: /bin/bash — командная оболочка')]),
    ('www-data · passwd', '/etc/passwd', 'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin', [
        ('имя входа', 'служебная учётная запись веб-сервера'),
        ('пароль', 'x: хеш в /etc/shadow; там для www-data стоит *, входа по паролю нет'),
        ('UID', 'номер меньше 1000 — системная учётная запись'),
        ('GID', 'основная группа www-data'),
        ('комментарий', 'описание: имя службы'),
        ('домашний каталог', 'каталог с файлами сайтов'),
        ('оболочка', '/usr/sbin/nologin выводит отказ и завершает сеанс: войти под этой записью нельзя')]),
    ('anna · shadow', '/etc/shadow', 'anna:$y$j9T$g7zEi3hrM12Bp6AjRYdSA/$hloIoQta77XzpMpzneo7pdKumNj3tvkBHmMxFQDNvI4:20717:0:99999:7:::', [
        ('имя входа', 'та же учётная запись, что в /etc/passwd'),
        ('хеш пароля', '$y$ — алгоритм yescrypt, j9T — параметры, дальше соль и хеш; сам пароль не хранится'),
        ('последняя смена', 'номер дня с 1 января 1970 года: 20717 — 21 сентября 2026 года'),
        ('минимум дней', '0 — пароль можно сменить в любой день'),
        ('максимум дней', '99999 — обязательной смены пароля нет'),
        ('предупреждение', 'за 7 дней до обязательной смены система предупредит'),
        ('неактивность', 'пусто — после истечения пароля запись не блокируется'),
        ('срок действия', 'пусто — учётная запись действует бессрочно'),
        ('резерв', 'поле не используется')]),
    ('devteam · group', '/etc/group', 'devteam:x:1002:anna,boris', [
        ('имя группы', 'группа команды разработки'),
        ('пароль группы', 'x — пароль группы не используется'),
        ('GID', 'номер группы; этот номер записывается в свойства файлов'),
        ('участники', 'пользователи, для которых devteam — дополнительная группа')]),
]


def w_record():
    tabs = ''.join(f'<button type="button" data-rec="{i}" aria-pressed="{str(i == 0).lower()}">{E(t)}</button>' for i, (t, *_rest) in enumerate(RECORDS))
    data = json.dumps([dict(file=f, line=l, fields=fl) for _, f, l, fl in RECORDS], ensure_ascii=False)
    return ('<div class="model record" data-widget="record" data-records="' + E(data) + '">'
            f'<div class="model-head"><span>Схема · анатомия строки учётной записи</span><div class="rec-tabs" role="group" aria-label="Строка">{tabs}</div></div>'
            '<p class="rec-file"></p><div class="rec-line" aria-label="Строка файла"></div>'
            '<dl class="rec-explain" aria-live="polite"></dl>'
            '<p class="rec-hint">Нажмите на поле строки, чтобы увидеть его назначение.</p></div>')


# Маршрут sudo: сценарии со снимков 05, 07 и 16.
SUDO = [
    dict(who='ubuntu', label='ubuntu: sudo whoami', groups='ubuntu adm cdrom sudo dip plugdev users lpadmin sambashare',
         rule='%sudo ALL=(ALL:ALL) ALL и правило Live-сеанса (ALL) NOPASSWD: ALL', ok=True, password='не спрашивается: правило NOPASSWD',
         out='root', log='ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/usr/bin/whoami'),
    dict(who='viktor', label='viktor: sudo whoami', groups='viktor testers', rule='правил для viktor и его групп нет', ok=False,
         password='[sudo] password for viktor: — пароль самого viktor', out='viktor is not in the sudoers file.',
         log='viktor : user NOT in sudoers ; TTY=pts/0 ; PWD=/home/viktor ; USER=root ; COMMAND=/usr/bin/whoami'),
    dict(who='admin', label='установленная Ubuntu: admin из группы sudo', groups='admin adm cdrom sudo …',
         rule='%sudo ALL=(ALL:ALL) ALL', ok=True, password='[sudo] password for admin: — пароль самого admin',
         out='root', log='admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/usr/bin/whoami'),
]


def w_sudo():
    buttons = ''.join(f'<button type="button" data-sudo="{i}">{E(s["label"])}</button>' for i, s in enumerate(SUDO))
    steps = ['Пользователь вводит команду', 'sudo запускается с правами root', 'Поиск правила в /etc/sudoers', 'Проверка пароля', 'Команда выполняется от имени root', 'Запись в журнал']
    lis = ''.join(f'<li data-step="{i}"><span class="rt-n">{i + 1}</span><b>{s}</b><p></p></li>' for i, s in enumerate(steps))
    return ('<div class="model route" data-widget="sudo" data-cases="' + E(json.dumps(SUDO, ensure_ascii=False)) + '">'
            f'<div class="model-head"><span>Схема · маршрут команды sudo</span><div class="route-cases" role="group" aria-label="Сценарий">{buttons}</div></div>'
            f'<ol class="route-steps">{lis}</ol><pre class="route-term" aria-live="polite"></pre></div>')


# Проверка доступа к /srv/devteam (drwxrws--- root devteam): группы со снимков 01, 11 и 12.
GATE_USERS = [
    ('anna', 1002, ['anna', 'devteam']), ('boris', 1004, ['boris', 'users', 'devteam']),
    ('viktor', 1005, ['viktor', 'testers']), ('ubuntu', 1000, ['ubuntu', 'adm', 'cdrom', 'sudo', 'dip', 'plugdev', 'users', 'lpadmin', 'sambashare']),
    ('root', 0, ['root']),
]
GATE_ACTIONS = [('ls', 'открыть каталог: ls /srv/devteam', 'r-x'), ('touch', 'создать файл: touch /srv/devteam/new.txt', '-wx')]


def w_gate():
    users = ''.join(f'<button type="button" data-user="{u}" aria-pressed="{str(u == "anna").lower()}">{u}</button>' for u, _, _ in GATE_USERS)
    acts = ''.join(f'<button type="button" data-act="{k}" aria-pressed="{str(k == "ls").lower()}">{E(t)}</button>' for k, t, _ in GATE_ACTIONS)
    data = json.dumps(dict(users=GATE_USERS, actions=GATE_ACTIONS), ensure_ascii=False)
    return ('<div class="model gate" data-widget="gate" data-gate="' + E(data) + '">'
            '<div class="model-head"><span>Схема · проверка доступа к каталогу</span></div>'
            f'<div class="gate-pick"><div><small>Кто</small><div class="gate-users" role="group" aria-label="Пользователь">{users}</div></div>'
            f'<div><small>Что делает</small><div class="gate-acts" role="group" aria-label="Действие">{acts}</div></div></div>'
            '<div class="gate-obj"><code>drwxrws---</code> <span>владелец <b>root</b></span> <span>группа <b>devteam</b></span> <code>/srv/devteam</code>'
            '<div class="gate-triads"><span data-t="u">rwx<small>владелец</small></span><span data-t="g">rws<small>группа</small></span><span data-t="o">---<small>остальные</small></span></div></div>'
            '<ol class="gate-steps"></ol><pre class="gate-term" aria-live="polite"></pre></div>')


WIDGETS = dict(record=w_record, sudo=w_sudo, gate=w_gate)
