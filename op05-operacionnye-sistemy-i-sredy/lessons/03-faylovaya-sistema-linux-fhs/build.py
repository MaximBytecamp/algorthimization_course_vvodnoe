#!/usr/bin/env python3
# Собирает страницы урока «Разрез Linux» и материалы из content.py. Доступ к VM не нужен.
from pathlib import Path
import html, json, sys, zipfile
sys.dont_write_bytecode = True
from content import CHAPTERS, THESIS, PATH_EXAMPLE

B = Path(__file__).resolve().parent
E = html.escape
N = len(CHAPTERS)
W_SHOT, H_SHOT = 1280, 800

# Числа из реальных кадров, которые используют модели. Кадры сняты в разных Live-сеансах,
# поэтому номера inode в модели ссылок взяты из кадра link-broken, а не из 17-inode.
FACTS = dict(inode_file='1605', inode_link='1607', uptime_first='1791.32', uptime_second='1808.04', uptime_copy='1795.24')

missing = []
def shot(name):
    if not (B / 'shots' / f'{name}.png').exists():
        missing.append(name)
        return False
    return True

# ───────────────────────────── блоки раздела

def lens_html(name, lens):
    cols = lens.get('cols') or 80
    top = 80 + 22 * lens['first']
    bottom = 80 + 22 * (lens['last'] + 1) + 2
    left = 57
    right = min(W_SHOT, 67 + 10 * cols + 12)
    cw, ch = right - left, bottom - top
    px = left / (W_SHOT - cw) * 100 if W_SHOT > cw else 0
    py = top / (H_SHOT - ch) * 100 if H_SHOT > ch else 0
    marks, seen = '', set()
    for k, (line, c1, c2, num) in enumerate(lens['marks']):
        x = (67 + 10 * c1 - 3 - left) / cw * 100
        y = (80 + 22 * line - top) / ch * 100
        w = (10 * (c2 - c1) + 6) / cw * 100
        h = 22 / ch * 100
        badge = f'<i>{num}</i>' if num not in seen else ''
        seen.add(num)
        marks += f'<span class="lens-mark" style="left:{x:.2f}%;top:{y:.2f}%;width:{w:.2f}%;height:{h:.2f}%;--d:{k}">{badge}</span>'
    notes = ''.join(f'<li><i>{n}</i><span>{t}</span></li>' for n, t in enumerate(lens['notes'], 1))
    return (f'<div class="lens" style="aspect-ratio:{cw}/{ch}" role="img" aria-label="Увеличенный фрагмент кадра {name}">'
            f'<div class="lens-img" style="background-image:url(shots/{name}.png);background-size:{W_SHOT / cw * 100:.3f}% auto;background-position:{px:.3f}% {py:.3f}%"></div>{marks}</div>'
            f'<ol class="lens-notes">{notes}</ol>')

core_counter = [0]
def core_html(d, chapter):
    name = d['shot']
    if not shot(name):
        return ''
    core_counter[0] += 1
    body = lens_html(name, d['lens']) if d['lens'] else ''
    wide = '' if d['lens'] else ' core--whole'
    return (f'<figure class="core{wide} reveal"><figcaption class="core-head"><span class="core-tag">Кадр {chapter}.{core_counter[0]}</span>'
            f'<span class="core-src">Ubuntu 24.04 · кадр {E(name)}</span></figcaption>{body}'
            f'<div class="core-foot"><a class="zoom-shot" href="shots/{name}.png"><img src="shots/{name}.png" alt="{E(d["caption"])}" width="1280" height="800" loading="lazy"><span>Весь кадр ↗</span></a>'
            f'<p>{d["caption"]}</p></div></figure>')

probe_counter = [0]
def probe_html(d, chapter):
    probe_counter[0] += 1
    cmds = '\n'.join(c for c, _ in d['lines'])
    lines = ''.join(f'<li><code>{E(c)}</code>' + (f'<span class="why"># {w}</span>' if w else '') + '</li>' for c, w in d['lines'])
    return (f'<section class="probe reveal" aria-label="В терминале {chapter}.{probe_counter[0]}"><header><span class="probe-tag">В терминале · {chapter}.{probe_counter[0]}</span>'
            f'<b>{E(d["title"])}</b><button class="copy" type="button" data-copy="{E(cmds)}">Копировать команды</button></header>'
            f'<ol class="probe-lines">{lines}</ol><footer><span>Что должно получиться</span><p>{d["expect"]}</p></footer></section>')

def def_html(d):
    rows = [('Имя', f'<b>{d["term"]}</b> — {d["tag"]}'), ('Что это', d['what']), ('Как работает', d['how']), ('Зачем', d['why'])]
    if d['no']:
        rows.append(('Не путать', d['no']))
    head = E(d['term'].upper())
    return (f'<article class="man reveal"><header><span>{head}(7)</span><span>Определение</span><span>{head}(7)</span></header>'
            '<dl>' + ''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k, v in rows) + '</dl></article>')

def ask_html(d):
    return (f'<details class="ask reveal"><summary><span class="ask-mark" aria-hidden="true">?</span><span class="ask-q">{d["q"]}</span>'
            f'<span class="ask-hint">Сначала ответьте сами</span></summary><div class="ask-a">{d["a"]}</div></details>')

def table_html(d):
    return ('<div class="tbl reveal"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in d['head']) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in d['rows']) + '</tbody></table></div>')

# ───────────────────────────── интерактивные модели

def w_walk():
    nodes = [('/', 0, '/'), ('/etc', 1, 'etc'), ('/home', 1, 'home'), ('/home/ubuntu', 2, 'ubuntu'), ('/usr', 1, 'usr'), ('/usr/bin', 2, 'bin'), ('/usr/share', 2, 'share')]
    tree = ''.join(f'<li data-node="{p}" style="--lvl:{l}"><span>{n}</span></li>' for p, l, n in nodes)
    cmds = ['cd /usr/share', 'cd ..', 'cd bin', 'cd /', 'cd usr', 'cd ~', 'cd bin', 'cd /etc']
    buttons = ''.join(f'<button type="button" data-cd="{c}">{c}</button>' for c in cmds)
    return (f'<div class="model walk reveal" data-widget="walk"><div class="model-head"><span>Модель · маршрут по дереву</span><b>Нажимайте команды по порядку слева направо</b></div>'
            f'<div class="walk-grid"><ul class="walk-tree" aria-label="Дерево каталогов">{tree}</ul>'
            f'<div class="walk-side"><div class="walk-buttons">{buttons}</div><div class="walk-term" aria-live="polite"><p><span class="pr">ubuntu@ubuntu:/$</span> <span class="cursor"></span></p></div>'
            '<p class="walk-kind" aria-live="polite">Путь с / в начале — абсолютный, без неё — относительный.</p></div></div>'
            '<p class="model-note">На схеме только семь каталогов. В настоящей системе их гораздо больше, но пути читаются так же.</p></div>')

def w_axes():
    cells = [
        ('static shareable', 'Не меняются · подходят любому компьютеру', [('/usr', 'Программы одной версии одинаковы на всех компьютерах и не меняются во время работы.'), ('/opt', 'Сторонние программы после установки не меняются и одинаковы на разных компьютерах.')]),
        ('static unshareable', 'Не меняются · только для этого компьютера', [('/etc', 'Настройки этого компьютера: имя, сеть, службы. Программы во время работы их не меняют.'), ('/boot', 'Файлы для загрузки этого компьютера. Меняются только при обновлении системы.')]),
        ('variable shareable', 'Меняются · подходят любому компьютеру', [('/var/mail', 'Почтовые ящики постоянно меняются, но их можно хранить на общем сервере.'), ('/var/spool/news', 'Очередь новостей меняется и может быть общей для нескольких компьютеров.')]),
        ('variable unshareable', 'Меняются · только для этого компьютера', [('/var/run', 'Сведения о программах, запущенных на этом компьютере. Сейчас вместо него используется /run.'), ('/var/lock', 'Файлы блокировок: показывают, что устройство или файл сейчас занят.')]),
    ]
    grid = ''
    for key, label, chips in cells:
        grid += f'<div class="axes-cell" data-cell="{key}"><span class="axes-label">{label}</span>' + ''.join(
            f'<button type="button" data-explain="{E(t)}">{p}</button>' for p, t in chips) + '</div>'
    return ('<div class="model axes reveal" data-widget="axes"><div class="model-head"><span>Модель · классификация FHS 3.0, раздел 2</span><b>Нажмите на каталог</b></div>'
            '<div class="axes-frame"><span class="axis-x">подходят любому компьютеру <i>→</i> только для этого компьютера</span><span class="axis-y">не меняются <i>→</i> меняются</span>'
            f'<div class="axes-grid">{grid}</div></div><p class="axes-out" aria-live="polite">Нажмите на каталог, чтобы узнать, почему он в этой клетке.</p></div>')

SPREAD = [
    ('/usr/sbin/cupsd', 'usr', 'программа службы печати', 'программа → /usr'),
    ('/lib/systemd/system/cups.service', 'usr', 'описание службы, пришло с пакетом', 'часть программы → /usr/lib'),
    ('/etc/cups', 'etc', 'настройки печати', 'настройки → /etc'),
    ('/var/spool/cups', 'var', 'задания, которые ждут печати', 'очередь → /var/spool'),
    ('/var/log/cups', 'var', 'журналы', 'журнал → /var/log'),
    ('/var/cache/cups', 'var', 'кэш, программа может создать его заново', 'кэш → /var/cache'),
    ('/run/cups', 'run', 'файлы работающей службы', 'нужны до перезагрузки → /run'),
]
def w_spread():
    items = ''.join(f'<li data-branch="{b}" style="view-transition-name:sp{i}"><code>{p}</code><span>{what}</span><em>{rule}</em></li>' for i, (p, b, what, rule) in enumerate(SPREAD))
    return ('<div class="model spread reveal" data-widget="spread" data-mode="fhs"><div class="model-head"><span>Модель · один пакет cups-daemon</span>'
            '<div class="seg" role="group" aria-label="Способ раскладки"><button type="button" data-mode="app" aria-pressed="false">Если бы по программе</button><button type="button" data-mode="fhs" aria-pressed="true">Как в Ubuntu — по назначению</button></div></div>'
            '<div class="spread-board"><div class="spread-col" data-col="app"><b>/cups/ — одна папка программы</b><span>воображаемая схема</span></div>'
            '<div class="spread-col" data-col="usr"><b>/usr</b><span>программа</span></div><div class="spread-col" data-col="etc"><b>/etc</b><span>настройки</span></div>'
            '<div class="spread-col" data-col="var"><b>/var</b><span>меняется во время работы</span></div><div class="spread-col" data-col="run"><b>/run</b><span>до перезагрузки</span></div>'
            f'<ul class="spread-items">{items}</ul></div>'
            '<p class="model-note">Левая схема воображаемая: так выглядела бы установка, если бы файлы собирали в папку программы. Правая — настоящие адреса из кадра выше.</p></div>')

PATHDIRS = ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin', '/usr/games', '/usr/local/games', '/snap/bin']
def w_pathscan():
    dirs = ''.join(f'<li data-dir="{d}"><span>{d}</span></li>' for d in PATHDIRS)
    names = ''.join(f'<button type="button" data-name="{n}">{n}</button>' for n in ['python3', 'cupsd', 'ls', 'cd', 'app'])
    return ('<div class="model pathscan reveal" data-widget="pathscan"><div class="model-head"><span>Модель · поиск команды в Bash</span>'
            f'<div class="pathscan-names" role="group" aria-label="Имя команды">{names}</div></div>'
            f'<ol class="pathscan-steps"><li data-step="alias">псевдоним?</li><li data-step="builtin">встроенная?</li><li data-step="path">каталоги PATH по порядку</li></ol>'
            f'<ul class="pathscan-dirs">{dirs}</ul><div class="pathscan-log" aria-live="polite"><p>Выберите имя команды.</p></div>'
            '<p class="model-note">Порядок каталогов взят из PATH на кадре 08-programs.</p></div>')

LIFETIME_ITEMS = [
    ('prog', '/usr/sbin/cupsd', 'программа'),
    ('conf', '/etc/cups/cupsd.conf', 'настройки, изменённые администратором'),
    ('spool', '/var/spool/cups/…', 'задание в очереди печати'),
    ('log', '/var/log/cups/access_log', 'журнал'),
    ('cache', '/var/cache/cups/…', 'кэш'),
    ('sock', '/run/cups/cups.sock', 'файл для связи с работающей службой'),
]
def w_lifetime():
    rows = ''.join(f'<li data-item="{k}"><code>{p}</code><span class="lt-what">{w}</span><span class="lt-state" aria-live="polite">на месте</span></li>' for k, p, w in LIFETIME_ITEMS)
    events = [('reboot', 'Перезагрузка'), ('upgrade', 'Обновление пакета'), ('cache', 'Очистка кэша'), ('remove', 'apt remove cups-daemon'), ('reset', 'Сбросить')]
    buttons = ''.join(f'<button type="button" data-event="{k}">{t}</button>' for k, t in events)
    return ('<div class="model lifetime reveal" data-widget="lifetime"><div class="model-head"><span>Модель · что станет с файлами</span>'
            f'<div class="lt-events" role="group" aria-label="Событие">{buttons}</div></div><ul class="lt-list">{rows}</ul>'
            '<p class="lt-out" aria-live="polite">Выберите событие.</p>'
            '<p class="model-note">Модель показывает обычное поведение пакетов Ubuntu. У отдельных программ бывают исключения.</p></div>')

def w_kernelfs():
    f = FACTS
    return (f'<div class="model kernelfs reveal" data-widget="kernelfs" data-first="{f["uptime_first"]}" data-second="{f["uptime_second"]}" data-copy="{f["uptime_copy"]}">'
            '<div class="model-head"><span>Модель · откуда берётся содержимое файла</span><div class="seg" role="group" aria-label="Что читаем">'
            '<button type="button" data-read="copy" aria-pressed="false">cat saved-uptime.txt</button><button type="button" data-read="proc" aria-pressed="false">cat /proc/uptime</button></div></div>'
            '<div class="kfs-route"><div class="kfs-node" data-n="cat"><b>cat</b><span>программа читает файл</span></div>'
            '<div class="kfs-node" data-n="vfs"><b>ядро</b><span>смотрит, на какой файловой системе файл</span></div>'
            '<div class="kfs-fork"><div class="kfs-node" data-n="disk"><b>overlay / ext4</b><span>читает данные с диска</span></div>'
            '<div class="kfs-node" data-n="proc"><b>proc</b><span>считает время с загрузки в момент чтения</span></div></div>'
            '<div class="kfs-node kfs-result" data-n="out"><b>ответ</b><code aria-live="polite">—</code></div></div>'
            '<p class="model-note">Числа — из кадра proc-uptime: первое чтение, чтение через пять секунд и копия, сделанная между ними.</p></div>')

def w_inode():
    f = FACTS
    steps = [('ln', 'ln data/info.txt data/info-hard.txt'), ('rm', 'rm data/info.txt'), ('cat', 'cat info-link.txt'), ('relink', 'ln data/info-hard.txt data/info.txt')]
    buttons = ''.join(f'<button type="button" data-op="{k}">{E(c)}</button>' for k, c in steps)
    return (f'<div class="model inode reveal" data-widget="inode" data-file="{f["inode_file"]}" data-link="{f["inode_link"]}">'
            '<div class="model-head"><span>Модель · имена, inode и данные</span><div class="inode-ops" role="group" aria-label="Команды">' + buttons + '<button type="button" data-op="reset">Сбросить</button></div></div>'
            '<div class="inode-board"><div class="inode-col"><b>Каталог linux-fhs-lab</b><ul class="dir" data-dir="lab"></ul><b>Каталог data</b><ul class="dir" data-dir="data"></ul></div>'
            '<div class="inode-col"><b>Таблица inode</b><div class="inode-cards"></div></div></div>'
            '<pre class="inode-term" aria-live="polite"></pre></div>')

def w_mount():
    return ('<div class="model mount reveal" data-widget="mount"><div class="model-head"><span>Модель · что видно в каталоге</span>'
            '<div class="seg" role="group" aria-label="Этап"><button type="button" data-stage="0" aria-pressed="true">1 · до mount</button><button type="button" data-stage="1" aria-pressed="false">2 · tmpfs подключена</button><button type="button" data-stage="2" aria-pressed="false">3 · после umount</button></div></div>'
            '<div class="mount-stage" data-stage="0"><div class="mount-path">~/linux-fhs-lab/mount-demo/</div>'
            '<div class="mount-pit"><div class="mount-disk"><small>файлы на диске</small><span class="file">before.txt</span></div>'
            '<div class="mount-plate"><small>tmpfs · память · 16M</small><span class="file">inside.txt</span></div></div></div>'
            '<dl class="mount-read"><dt>ls mount-demo</dt><dd data-ls>before.txt</dd><dt>findmnt: TARGET SOURCE FSTYPE</dt><dd data-fm>/ /cow overlay</dd></dl>'
            '<p class="mount-out" aria-live="polite"></p></div>')

QUIZ = [('Программа shop-api, установленная вручную', '/usr/local/bin', 'Программы, которые администратор установил сам, кладут в /usr/local, отдельно от пакетов.'),
        ('Настройки shop-api', '/etc/shop-api', 'Настройки лежат в /etc.'),
        ('База заказов', '/var/lib/shop-api', 'База меняется во время работы и должна сохраняться после перезагрузки.'),
        ('Журнал запросов', '/var/log/shop-api', 'Журналы служб лежат в /var/log.'),
        ('Файл с номером запущенного процесса', '/run/shop-api', 'Номер процесса нужен только до перезагрузки.'),
        ('Промежуточный файл, который можно потерять', '/tmp', 'Такие файлы кладут во временный каталог.')]
def w_placement():
    opts = ['Выберите каталог', '/usr/local/bin', '/etc/shop-api', '/var/lib/shop-api', '/var/log/shop-api', '/run/shop-api', '/tmp']
    rows = ''.join(f'<div class="quiz-row"><label for="q{i}">{q}</label><select id="q{i}" data-answer="{a}">' + ''.join(
        f'<option value="{o if j else ""}">{o}</option>' for j, o in enumerate(opts)) + f'</select><p class="feedback" data-explanation="{E(x)}" aria-live="polite"></p></div>'
        for i, (q, a, x) in enumerate(QUIZ))
    return ('<div class="model placement reveal" id="placement" data-widget="placement"><div class="model-head"><span>Самопроверка · системная установка</span><b>Выберите каталог для каждого файла shop-api</b></div>'
            f'{rows}<div class="quiz-foot"><button id="check-placement" type="button">Проверить</button><output id="quiz-score" aria-live="polite"></output></div></div>')

FULLCUT_CHECK = ['ls -l /var/log/cups', 'man hier', 'systemctl cat cups', 'cat /etc/logrotate.d/cups-daemon', 'findmnt -T /proc/uptime', 'stat /var/log/cups/access_log', 'findmnt -T /var/log/cups']
def w_fullcut():
    rows = ''.join(f'<li style="--c:{c["color"]};--d:{i}"><span class="fc-n">{i + 1:02}</span><b>{c["layer"]}</b><p>{c["strata"]}</p><code>{E(FULLCUT_CHECK[i])}</code></li>'
                   for i, c in enumerate(CHAPTERS[:7]))
    return (f'<div class="model fullcut reveal" data-widget="fullcut"><div class="model-head"><span>Путь целиком</span><b><code>{PATH_EXAMPLE}</code></b></div>'
            f'<ol class="fc-list">{rows}</ol><p class="model-note">Правый столбец — команда, которой вы проверите слой на своей машине.</p></div>')

WIDGETS = dict(walk=w_walk, axes=w_axes, spread=w_spread, pathscan=w_pathscan, lifetime=w_lifetime, kernelfs=w_kernelfs, inode=w_inode, mount=w_mount, placement=w_placement, fullcut=w_fullcut)

def blocks_html(blocks, chapter):
    out = ''
    for kind, d in blocks:
        if kind == 'p': out += f'<p class="reveal">{d}</p>'
        elif kind == 'def': out += def_html(d)
        elif kind == 'probe': out += probe_html(d, chapter)
        elif kind == 'core': out += core_html(d, chapter)
        elif kind == 'ask': out += ask_html(d)
        elif kind == 'widget': out += WIDGETS[d]()
        elif kind == 'note': out += f'<aside class="note reveal"><b>На вашей машине</b><p>{d}</p></aside>'
        elif kind == 'table': out += table_html(d)
    return out

# ───────────────────────────── карта корня на обложке

ROOTMAP = [('/', 1, 'Корневой каталог', 'Самый верхний каталог, с него начинается любой путь.', 'pwd'), ('/home', 1, 'Каталоги пользователей', 'Файлы и настройки обычных пользователей.', 'ls /home'),
           ('/root', 1, 'Каталог пользователя root', 'Домашний каталог root. Не путать с корнем /.', 'getent passwd root'),
           ('/etc', 2, 'Настройки', 'Настройки системы и программ.', 'cat /etc/os-release'), ('/boot', 2, 'Загрузка', 'Файлы для загрузки системы.', 'ls /boot'),
           ('/usr', 3, 'Программы', 'Программы, библиотеки и справка.', 'ls /usr'), ('/usr/local', 3, 'Программы, установленные вручную', 'Сюда администратор ставит программы сам, без менеджера пакетов.', 'ls /usr/local'),
           ('/opt', 3, 'Сторонние программы', 'Программы, установленные целиком в один каталог. Часто пуст.', 'ls -la /opt'),
           ('/var', 4, 'Меняющиеся данные', 'Журналы, базы, очереди и кэш.', 'ls /var'), ('/tmp', 4, 'Временные файлы', 'Файлы могут быть удалены в любой момент.', 'findmnt -T /tmp'),
           ('/run', 4, 'Файлы работающих служб', 'После перезагрузки каталог пуст.', 'findmnt -T /run'),
           ('/dev', 5, 'Устройства', 'Файлы, через которые программы обращаются к устройствам.', 'ls -l /dev/null'), ('/proc', 5, 'Сведения о системе', 'Сведения о процессах и памяти, их выдаёт ядро.', 'cat /proc/uptime'),
           ('/sys', 5, 'Сведения об устройствах', 'Параметры устройств, их выдаёт ядро.', 'ls /sys/class/net'),
           ('/mnt', 7, 'Ручное подключение', 'Место, куда вручную подключают диски.', 'findmnt -T /mnt'), ('/media', 7, 'Съёмные носители', 'Сюда подключаются флешки.', 'ls /media'),
           ('/srv', 8, 'Данные сервисов', 'Файлы, которые сервис отдаёт, например сайт.', 'ls -la /srv')]
def rootmap():
    tiles = ''.join(f'<button type="button" style="--c:{CHAPTERS[l - 1]["color"]}" data-root="{E(json.dumps(dict(p=p, t=t, d=d, c=c, l=l, s=CHAPTERS[l - 1]["slug"], n=CHAPTERS[l - 1]["layer"]), ensure_ascii=False))}">{p}</button>' for p, l, t, d, c in ROOTMAP)
    table = ''.join(f'<tr><td><code>{p}</code></td><td>{d}</td><td><code>{c}</code></td><td>слой {l:02}</td></tr>' for p, l, t, d, c in ROOTMAP)
    return (f'<div class="model rootmap reveal" data-widget="rootmap"><div class="rootmap-tiles">{tiles}</div>'
            '<div class="rootmap-out" aria-live="polite"><span class="rm-path">/</span><b class="rm-title">Корневой каталог</b><p class="rm-desc">Самый верхний каталог, с него начинается любой путь.</p><code class="rm-cmd">pwd</code><a class="rm-link" href="01-adres.html">Разбирается в слое 01 · Адрес →</a></div></div>'
            f'<details class="tbl-details"><summary>Вся карта таблицей</summary><div class="tbl"><table><thead><tr><th>Путь</th><th>Назначение</th><th>Проверка</th><th>Слой</th></tr></thead><tbody>{table}</tbody></table></div></details>')

# ───────────────────────────── каркас страницы

def gauge(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Слой {i:02} · {c["layer"]}"{cur}><span>{i:02}</span><em>{c["layer"]}</em></a>'
    return f'<nav class="gauge" aria-label="Слои урока">{cells}</nav>'

FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'

def sources():
    return ('<details class="sources"><summary>Документация и происхождение кадров</summary><p>'
            '<a href="https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html">Linux Foundation · FHS 3.0</a> · <a href="https://man7.org/linux/man-pages/man7/hier.7.html">hier(7)</a> · '
            '<a href="https://ubuntu.com/containers/rockcraft/docs/1/explanation/usrmerge/">Canonical · usrmerge</a> · <a href="https://www.gnu.org/software/bash/manual/html_node/Command-Search-and-Execution.html">GNU Bash · поиск команд</a> · '
            '<a href="https://docs.kernel.org/filesystems/proc.html">Ядро Linux · proc</a> · <a href="https://docs.kernel.org/filesystems/sysfs.html">sysfs</a> · <a href="https://docs.kernel.org/filesystems/tmpfs.html">tmpfs</a> · '
            '<a href="https://man7.org/linux/man-pages/man8/findmnt.8.html">findmnt</a> · <a href="https://man7.org/linux/man-pages/man7/inode.7.html">inode(7)</a></p>'
            '<p>Кадры сняты с дисплея виртуальной машины Ubuntu-lab-01 (VirtualBox 7.2) 14 сентября 2026 года: Ubuntu 24.04.4 Desktop ARM64, Live-сеанс, Bash. '
            'Команды выполнялись в настоящем терминале, вывод не перерисован. <a href="shots/SOURCES.md">Среда и список кадров</a>.</p></details>')

def shell(title, content, current=0, color='#2B1A2D'):
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="theme-color" content="#1E0E1C"><meta name="description" content="Разрез Linux: файловая система и стандарт FHS на реальной Ubuntu — от адреса до монтирования.">'
            f'<title>{E(title)} · Разрез Linux · ОП.05</title><link rel="icon" href="favicon.svg" type="image/svg+xml">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{FONTS}">'
            f'<link rel="stylesheet" href="lesson.css"><script src="lesson.js" defer></script></head>'
            f'<body data-layer="{current}" style="--c:{color}"><a class="skip" href="#main">К содержанию</a>'
            f'<header class="topbar"><a class="brand" href="../../index.html" title="К дисциплине"><span>ОП.05</span></a><a class="lesson-name" href="index.html"><b>Разрез Linux</b><small>занятие 3 · файловая система и FHS</small></a>'
            f'{gauge(current)}<a class="topbar-mat" href="index.html#materials">Материалы ↓</a></header>'
            f'<main id="main">{content}</main>'
            f'<footer class="site-foot"><div class="wrap">{sources()}<p class="credits"><span>ОП.05 · Операционные системы и среды</span><span>Макаров Максим Николаевич</span></p></div></footer>'
            '<dialog id="image-dialog" aria-label="Кадр крупным планом"><button id="close-image" type="button">Закрыть ×</button><img alt=""><p></p><a id="original-image" target="_blank" rel="noopener">Открыть оригинал ↗</a></dialog>'
            '<div id="toast" role="status" aria-live="polite"></div>'
            '<noscript><p class="noscript">Текст, команды и кадры доступны без JavaScript; для моделей и отметок включите JavaScript.</p></noscript></body></html>')

def column(current):
    rows = f'<li class="col-path"><code>{PATH_EXAMPLE}</code></li>'
    for i, c in enumerate(CHAPTERS, 1):
        if i < current:
            rows += f'<li class="col-row past" style="--c:{c["color"]};--d:{i}"><span>{i:02}</span><b>{c["layer"]}</b></li>'
        elif i == current:
            rows += f'<li class="col-row now" style="--c:{c["color"]};--d:{i}"><span>{i:02}</span><b>{c["layer"]}</b><p>{c["strata"]}</p></li>'
        else:
            rows += f'<li class="col-row deep" style="--d:{i}"><span>{i:02}</span><b>?</b></li>'
    return f'<ol class="column" aria-label="Разрез пути до текущего слоя">{rows}</ol>'

def thesis_line(upto, reveal_now=False):
    parts = ''
    for i, t in enumerate(THESIS[:upto], 1):
        c = CHAPTERS[i - 1]['color']
        if i < upto:
            parts += f'<span class="th past" style="--c:{c}"><i>{i:02}</i>{t}</span> '
        elif reveal_now:
            parts += f'<span class="th now" style="--c:{c}"><i>{i:02}</i><mark class="draw">{t}</mark></span>'
        else:
            parts += f'<span class="th gap" style="--c:{c}"><i>{i:02}</i>…это предложение появится в конце страницы</span>'
    return parts

def materials():
    return ('<section id="materials" class="materials"><h2>Материалы для работы</h2><div class="downloads">'
            '<a href="materials/linux-fhs-lab.zip" download><b>↓ Стартовый набор</b><span>шаблон отчёта, задание и памятка</span></a>'
            '<a href="materials/report-template.md" download><b>↓ Шаблон README</b><span>13 проверок с местом для объяснений</span></a>'
            '<a href="materials/cheatsheet.md" download><b>↓ Карта и команды</b><span>памятка для терминала</span></a>'
            '<a href="materials/practice.md" download><b>↓ Практика и домашняя работа</b><span>условия и критерии</span></a></div></section>')

ASSIGN = [('01-root.png', 'Корень и навигация', 'pwd, ls -lah /', 'Объясните /, абсолютный и относительный путь.'),
          ('02-home.png', 'Пользователь', 'echo "$HOME", pwd, ls -a', 'Различите /, /root, ~ и скрытые имена.'),
          ('03-system.png', 'Настройки', 'cat /etc/os-release; getent passwd', 'Назовите дистрибутив, версию, UID, дом и оболочку.'),
          ('04-programs.png', 'Программы и usrmerge', 'command -v, type, readlink -f /bin', 'Объясните порядок поиска в PATH и результат ls -ld /bin.'),
          ('05-var.png', 'Срок жизни данных', 'ls /var; findmnt -T /run', 'Различите состояние, журнал, кэш и данные текущего запуска.'),
          ('06-dev.png', 'Устройства', 'ls -l /dev/null; echo $?', 'Подтвердите тип устройства и успех записи.'),
          ('07-proc.png', 'Живой /proc', 'cat /proc/uptime; cp; sleep 5', 'Объясните нулевой размер и застывшую копию.'),
          ('08-sys.png', 'Сетевые интерфейсы', 'ls /sys/class/net', 'Назовите lo и остальные интерфейсы.'),
          ('09-links.png', 'Ссылки и inode', 'ls -li; rm data/info.txt; cat info-link.txt', 'Почему жёсткая ссылка сохранила данные, а символическая сломалась.'),
          ('10-space.png', 'Место и монтирование', 'findmnt /; df -h .; du -sh data', 'SOURCE, FSTYPE и свободное место; чем df отличается от du.'),
          ('11-mount-before.png', 'Подключение tmpfs', 'findmnt -T mount-demo', 'Куда делся before.txt. Без sudo — отказ и разбор кадров урока.'),
          ('12-mount-after.png', 'Отключение tmpfs', 'cat mount-demo/before.txt', 'tmpfs отключена; что стало с inside.txt.'),
          ('13-model.png', 'Размещение shop-api', 'find model-root -type f', 'Обоснуйте каталог каждого из пяти компонентов.')]

def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['В README мои результаты и объяснения', 'Все изображения открываются из README', 'Ссылки и модель приложения созданы', 'Учебная tmpfs отключена или ограничение описано', 'Финальная задача разобрана, файлы сохранены на постоянном носителе']
    return ('<section id="submission" class="submission"><h2>Что сдавать</h2><p>Каталог <code>linux-fhs-lab</code> с заполненным README.md и 13 своими снимками экрана. Если команда mount не выполнилась из-за прав, приложите сообщение об ошибке, разберите опыт по снимкам урока и напишите, что сами его не выполняли.</p>'
            f'<div class="tbl"><table><thead><tr><th>Кадр</th><th>Проверка</th><th>Что объяснить</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии · 10 баллов</h3><ul class="criteria"><li><b>2</b> адрес и назначение: навигация, дом, /etc и учётная запись</li><li><b>2</b> программы и срок жизни: PATH, usrmerge, /var и /run, размещение shop-api</li>'
            '<li><b>2</b> ядро: /dev, /proc, /sys на своих результатах</li><li><b>2</b> имя и inode: типы, две ссылки, опыт с rm</li><li><b>2</b> монтирование: findmnt, df, du и опыт с tmpfs</li></ul>'
            '<p>По каждому пункту: 2 — результат и объяснение, 1 — результат без полного объяснения, 0 — проверки нет или вывод неверен.</p>'
            '<h3>Итоговая задача: исправьте пути</h3><p>shop-api установлен в систему как служба. Его журнал должен собираться вместе с журналами других служб, настройки — сохраняться при обновлении программы, база — после перезагрузки.</p>'
            '<pre class="paths">/home/admin/shop.log\n/usr/bin/config.json\n/tmp/database.db\n/etc/shop-api/app.conf\n/var/log/shop-api/access.log\n/var/lib/shop-api/database.db</pre>'
            '<p>Для каждой строки напишите: оставить путь или изменить, какой путь правильный и какой слой урока это объясняет. В настоящей системе ничего не перемещайте.</p>'
            '<details class="ask"><summary><span class="ask-mark" aria-hidden="true">?</span><span class="ask-q">Разбор после собственного решения</span><span class="ask-hint">Сначала решите сами</span></summary><div class="ask-a">'
            'shop.log → /var/log/shop-api/shop.log (срок жизни); config.json → /etc/shop-api/config.json (назначение); database.db из /tmp → /var/lib/shop-api/database.db (срок жизни). Остальные три адреса верны. '
            'Если по целевому адресу база уже есть, перезаписывать нельзя: сначала выясняют, какие данные актуальны. Личный скрипт администратора мог бы держать журнал в своей домашней папке.</div></details>'
            '<h3>Домашнее задание</h3><p>Выберите каталоги для файлов службы резервного копирования <code>backup-agent</code>: программа, настройки, журнал, список сделанных копий и файл с номером процесса. Составьте таблицу путей и объясните, какие файлы можно потерять, а какие нельзя. Сами резервные копии храните на постоянном носителе, не в /tmp.</p>'
            '<div class="checklist"><h3>Проверка перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + '<p id="check-status" aria-live="polite">Отмечено 0 из 5</p></div></section>')

# ───────────────────────────── обложка

def cover():
    spread_lines = ''.join(f'<li style="--d:{i}"><code>{p}</code><span>{what}</span></li>' for i, (p, b, what, rule) in enumerate(SPREAD))
    thesis = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><i>{i:02}</i><span>{THESIS[i - 1]}</span></a></li>' for i, c in enumerate(CHAPTERS, 1))
    strata = ''.join(f'<li style="--c:{c["color"]};--d:{i}"><a href="{c["slug"]}.html"><span class="st-n">{i:02}</span><b>{c["layer"]}</b><p>{c["question"]}</p><em>{len(c["sections"])} {"раздела" if len(c["sections"]) < 5 else "разделов"}</em></a></li>' for i, c in enumerate(CHAPTERS, 1))
    legend = ('<div class="legend"><div><span class="lg lg-probe">В терминале</span><p>Команды, которые вы выполняете сами. Рядом с каждой написано, что она делает, внизу — что должно получиться.</p></div>'
              '<div><span class="lg lg-core">Кадр</span><p>Снимок экрана Ubuntu. Важные строки увеличены и пронумерованы, пояснения под ними.</p></div>'
              '<div><span class="lg lg-man">Определение</span><p>Термин в виде страницы справки man: что это, как работает, зачем нужно и с чем не путать.</p></div>'
              '<div><span class="lg lg-ask">?</span><p>Вопрос: сначала ответьте сами, потом откройте ответ.</p></div></div>')
    cups_core = core_html(dict(shot='cups-spread', caption='Вывод команды dpkg: файлы пакета cups-daemon лежат в разных каталогах.', lens=None), 0)
    return (f'<section class="cover"><div class="wrap cover-in"><div class="cover-text"><p class="kicker">ОП.05 · занятие 3 · практикум на Ubuntu</p>'
            '<h1>Разрез<br><span>Linux</span></h1><p class="cover-sub">Как устроено дерево каталогов Linux и почему файлы лежат там, где лежат.</p>'
            '<a class="cover-start" href="01-adres.html">Начать с первого слоя →</a></div>'
            f'<div class="cover-term" aria-label="Вывод dpkg для пакета cups-daemon"><p class="ct-cmd"><span>ubuntu@ubuntu:~$</span> dpkg -L cups-daemon</p><ul class="ct-lines">{spread_lines}</ul>'
            '<p class="ct-q">Одна служба печати, семь каталогов. <b>Почему не один?</b></p></div></div>'
            f'<div class="cover-strata" aria-hidden="true">' + ''.join(f'<i style="--c:{c["color"]}"></i>' for c in CHAPTERS) + '</div></section>'
            '<div class="wrap page">'
            '<section class="prolog"><h2>С чего начинается урок</h2>'
            '<p class="reveal">В Windows программа обычно устанавливается в одну папку внутри <code>C:\\Program Files</code>. В Ubuntu файлы службы печати CUPS лежат сразу в <code>/usr</code>, <code>/etc</code>, <code>/var</code> и <code>/run</code>. Так сделано по <mark>определённому правилу</mark>, и в этом уроке мы его разберём.</p>'
            f'{cups_core}</section>'
            f'<section class="big-thesis"><h2>Главная мысль урока</h2><p class="reveal">Главная мысль урока складывается из восьми предложений, по одному на слой. В начале каждой страницы видно, что уже известно, в конце добавляется новое предложение.</p><ol class="thesis-list reveal">{thesis}</ol></section>'
            f'<section class="strata-index"><h2>Восемь слоёв</h2><p class="reveal">Каждый слой отвечает на один вопрос и опирается на предыдущие, поэтому проходите их по порядку.</p><ol class="strata-list">{strata}</ol></section>'
            f'<section class="howto"><h2>Блоки на страницах</h2>{legend}</section>'
            f'<section class="before reveal"><h2>Перед началом</h2><p>Нужна Ubuntu из практической работы №1 и терминал. Все опыты выполняются в каталоге <code>~/linux-fhs-lab</code> от имени обычного пользователя. Команда <code>sudo</code> понадобится один раз, в слое 7. На урок отводится две пары по 90 минут, отчёт можно закончить дома.</p>'
            '<p>Снимки сделаны в Ubuntu 24.04.4 Live. У вас будут другие имя пользователя, номера процессов и inode. Это нормально: важно, что означает результат, а не совпадение чисел.</p></section>'
            f'<section id="map" class="map"><h2>Карта корня</h2><p class="reveal">Основные каталоги и слой, в котором разбирается каждый. Цвет плитки совпадает с цветом слоя.</p>{rootmap()}</section>'
            f'{materials()}</div>')

# ───────────────────────────── сборка

for old in ['book.css', 'book.js', 'map.json', 'content.json', '01-derevo.html', '02-karta-fhs.html', '03-programmy.html', '04-dannye.html', '05-yadro.html', '06-fayly-i-ssylki.html', '07-montirovanie.html', '08-praktika.html']:
    (B / old).unlink(missing_ok=True)

(B / 'index.html').write_text(shell('Файловая система Linux и FHS', cover()))

for i, c in enumerate(CHAPTERS, 1):
    core_counter[0] = probe_counter[0] = 0
    body = (f'<section class="hero" style="--c:{c["color"]}"><div class="wrap hero-in"><div class="hero-text"><p class="depth">Слой {i:02} из {N:02} <span>·</span> {c["layer"]}</p>'
            f'<h1>{c["title"]}</h1><p class="question"><span>Вопрос слоя</span>{c["question"]}</p></div>{column(i)}</div></section>'
            f'<div class="wrap page"><section class="thesis-now reveal"><p class="label">Главная мысль · что уже известно</p><p class="thesis">{thesis_line(i)}</p></section>'
            f'<div class="intro reveal">{c["intro"]}</div>')
    for j, s in enumerate(c['sections'], 1):
        body += (f'<section class="stage" id="s{j}"><div class="stage-mark" aria-hidden="true"><span>−{i}.{j}</span></div>'
                 f'<div class="stage-body"><h2><span>{i}.{j}</span> {s["title"]}</h2>{blocks_html(s["blocks"], i)}</div></section>')
    body += (f'<section class="answer reveal" style="--c:{c["color"]}"><p class="label">Итог слоя {i:02}</p><p class="thesis">{thesis_line(i, True)}</p>'
             f'<p class="answer-text">{c["outro"]}</p><div class="answer-foot"><p class="report"><b>В отчёт</b>{c["report"]}</p>'
             '<button id="mark-layer" type="button" aria-pressed="false">Отметить слой пройденным</button></div></section>')
    if i == N:
        body += deliver() + materials()
    if i < N:
        nx = CHAPTERS[i]
        body += f'<a class="next" href="{nx["slug"]}.html" style="--c:{nx["color"]}"><span>Следующий слой · {i + 1:02}</span><b>{nx["layer"]}</b><em>{nx["question"]}</em></a>'
    else:
        body += '<a class="next next--top" href="index.html"><span>Урок пройден</span><b>К началу урока</b><em>Главная мысль целиком и материалы для отчёта</em></a>'
    body += '</div>'
    (B / f'{c["slug"]}.html').write_text(shell(f'{i:02} · {c["layer"]}', body, i, c['color']))

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' + ''.join(
    f'<rect y="{k * 8}" width="64" height="8" fill="{c["color"]}"/>' for k, c in enumerate(CHAPTERS)) + '<text x="32" y="46" text-anchor="middle" font-size="44" font-family="monospace" font-weight="700" fill="#fff">/</text></svg>')

# ───────────────────────────── материалы

report = '# Разрез Linux · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live / другая (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды (уточните по своей работе):\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nФактический результат: …\n\n{q}\n\nМоё объяснение: …\n\n'
report += ('## Размещение shop-api\n\n| Объект | Системный путь | Почему (какой слой решает) |\n|---|---|---|\n| Исполняемый файл | … | … |\n| Настройки | … | … |\n| Постоянные данные | … | … |\n| Журнал | … | … |\n| PID-файл | … | … |\n\n'
           '## Финальная задача\n\nДля каждого из шести путей: оставить / изменить, новый путь, основание.\n\n'
           '## Главная мысль своими словами\n\nОдним абзацем: почему файлы одной программы лежат в разных каталогах и что стоит за путём.\n\n'
           '## Проверка завершения\n\n- [ ] Учебная tmpfs отключена либо ограничение описано.\n- [ ] Изображения открываются.\n- [ ] Результаты мои, а не скопированы из урока.\n- [ ] Работа сохранена на постоянном носителе.\n')
(B / 'materials/report-template.md').write_text(report)

cheat = '# Разрез Linux · памятка\n\n## Главная мысль\n\n' + ''.join(f'{i}. {t}\n' for i, t in enumerate(THESIS, 1))
cheat += '\n## Карта корня\n\n| Путь | Назначение | Проверка | Слой |\n|---|---|---|---|\n' + ''.join(f'| `{p}` | {d} | `{c}` | {l} |\n' for p, l, t, d, c in ROOTMAP)
cheat += ('\n## Команды\n\n- `pwd`, `cd` — текущий каталог и переход.\n- `ls -lah`, `ls -li` — подробный список; `-i` добавляет inode.\n- `command -v`, `type` — во что превращается имя команды.\n'
          '- `readlink`, `readlink -f` — записанная и итоговая цель ссылки.\n- `file`, `file -L` — содержимое объекта и цели ссылки.\n- `stat` — сведения из inode.\n'
          '- `ln -s цель ссылка` — символическая ссылка; `ln файл имя` — жёсткая.\n- `findmnt -T путь` — какая файловая система отвечает за путь.\n'
          '- `lsblk` — блочные устройства; `df -h .` — место; `du -sh каталог` — занято содержимым; `df -i .` — inode.\n- `dpkg -S файл`, `dpkg -L пакет` — чей файл и какие файлы у пакета.\n\n'
          '`/var/lib` — постоянное состояние; `/var/log` — журналы; `/var/cache` — восстанавливаемый кэш; `/var/spool` — очереди; `/run` — до перезагрузки.\n\n'
          'Опыты — в `~/linux-fhs-lab`. В устройства дисков не пишите.\n')
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = ('# Практическая работа · Разрез Linux\n\nПройдите слои 1–7, заполните report-template.md и сохраните его как README.md.\nСоздайте screenshots/ и добавьте свои кадры. Рабочая папка: ~/linux-fhs-lab.\n\n'
            + ''.join(f'{i}. **{x[1]}** — `{x[0]}`. {x[3]}\n' for i, x in enumerate(ASSIGN, 1))
            + '\n## Финальная задача\n\nСистемный shop-api хранит файлы:\n\n```text\n/home/admin/shop.log\n/usr/bin/config.json\n/tmp/database.db\n/etc/shop-api/app.conf\n/var/log/shop-api/access.log\n/var/lib/shop-api/database.db\n```\n\n'
            'Укажите, что оставить, что изменить, новый путь и основание. Ничего не переносите в реальной системе.\nСуществующую базу по целевому пути нельзя перезаписывать, не выяснив её содержимое.\n\n'
            '## Оценка · 10 баллов\n\nПо 2 балла: адрес и назначение; программы и срок жизни; ядро; имя и inode; монтирование.\n'
            'В каждом пункте 2 — проверка и объяснение, 1 — неполное объяснение, 0 — нет результата или вывод неверен.\nДля mount без прав приложите сообщение об отказе и разбор двух кадров урока.\n\n'
            '## Домашнее продолжение\n\nРазместите backup-agent: программа, настройки, журнал, индекс копий и PID-файл.\nОбоснуйте пути и сроки жизни данных. Выберите постоянный носитель для архива копий.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/linux-fhs-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('linux-fhs-lab/README.md', report)
    z.writestr('linux-fhs-lab/PRACTICE.md', practice)
    z.writestr('linux-fhs-lab/CHEATSHEET.md', cheat)
    for d in ['screenshots', 'config', 'data', 'logs', 'tmp']:
        z.writestr(f'linux-fhs-lab/{d}/', '')

if missing:
    print('Нет кадров (блоки пропущены):', ', '.join(sorted(set(missing))))
print('Готово:', N, 'слоёв')
