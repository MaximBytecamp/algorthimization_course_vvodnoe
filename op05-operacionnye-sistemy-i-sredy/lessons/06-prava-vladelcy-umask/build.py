#!/usr/bin/env python3
# Собирает страницы урока «Права доступа, владельцы и umask» и материалы.
# Текст — text_01…07.py, блоки — render.py, схемы — widgets.py.
from pathlib import Path
import html, sys, zipfile
sys.dont_write_bytecode = True
from content import CHAPTERS
from render import blocks_html, counters, missing
from text_07 import TASKS

B = Path(__file__).resolve().parent
E = html.escape
N = len(CHAPTERS)
NUM = 6
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Права доступа, владельцы и umask'
DESCRIPTION = 'Лекция и практическая работа: права r, w, x у файла и каталога, chmod буквами и числами, chown и chgrp, umask, setuid, setgid, sticky-бит и ACL, каталог проекта для команды.'
KEY = 'os-perms-lab-v1'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://man7.org/linux/man-pages/man1/chmod.1.html">chmod(1)</a> · <a href="https://man7.org/linux/man-pages/man1/chown.1.html">chown(1)</a> · '
            '<a href="https://man7.org/linux/man-pages/man2/umask.2.html">umask(2)</a> · <a href="https://man7.org/linux/man-pages/man7/inode.7.html">inode(7): биты режима</a> · '
            '<a href="https://man7.org/linux/man-pages/man5/acl.5.html">acl(5)</a> · <a href="https://man7.org/linux/man-pages/man1/setfacl.1.html">setfacl(1)</a> · '
            '<a href="https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html">GNU Coreutils · File permissions</a></p>'
            '<p>Снимки сделаны в виртуальной машине VirtualBox 7.2: Ubuntu 24.04.4 Desktop ARM64, Live-сеанс, Bash. <a href="shots/SOURCES.md">Команды для каждого снимка</a>.</p></details>')


def shell(title, content, current=0, color='#1E2448'):
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="theme-color" content="#161B33"><meta name="description" content="{E(DESCRIPTION)}">'
            f'<title>{E(title)} · {TITLE} · ОП.05</title><link rel="icon" href="favicon.svg" type="image/svg+xml">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{FONTS}">'
            f'<link rel="stylesheet" href="lesson.css"><script src="lesson.js" defer></script></head>'
            f'<body data-layer="{current}" data-key="{KEY}" style="--c:{color}"><a class="skip" href="#main">К содержанию</a>'
            f'<header class="topbar"><a class="brand" href="../../index.html" title="К дисциплине"><span>ОП.05</span></a><a class="lesson-name" href="index.html"><b>{TITLE}</b><small>занятие {NUM}</small></a>'
            f'{nav(current)}<a class="topbar-mat" href="index.html#materials">Материалы</a></header>'
            f'<main id="main">{content}</main>'
            f'<footer class="site-foot"><div class="wrap">{sources()}<p class="credits"><span>ОП.05 · Операционные системы и среды</span><span>Макаров Максим Николаевич</span></p></div></footer>'
            '<dialog id="image-dialog" aria-label="Снимок крупным планом"><button id="close-image" type="button">Закрыть ×</button><img alt=""><p></p><a id="original-image" target="_blank" rel="noopener">Открыть в отдельной вкладке ↗</a></dialog>'
            '<div id="toast" role="status" aria-live="polite"></div></body></html>')


def materials():
    return ('<section id="materials" class="materials"><h2>Материалы</h2><div class="downloads">'
            '<a href="materials/perms-lab-setup.sh" download><b>perms-lab-setup.sh</b><span>создаёт ~/perm-lab и пользователей anna, boris</span></a>'
            '<a href="materials/perms-lab-check.sh" download><b>perms-lab-check.sh</b><span>проверяет каталог проекта /srv/shop</span></a>'
            '<a href="materials/report-template.md" download><b>report-template.md</b><span>шаблон отчёта со снимками</span></a>'
            '<a href="materials/perms-lab.zip" download><b>Весь набор</b><span>скрипты, шаблон, задание и памятка</span></a></div></section>')


ASSIGN = [('01-ls-l.png', 'Строка ls -l', 'ls -l, stat -c …', 'Подпишите поля одной строки: тип, три тройки, владелец, группа.'),
          ('02-dir-rx.png', 'Каталог без x и без r', 'chmod u-x / u-r docs, ls, cat', 'Объясните каждую ошибку: что запрещено без x и без r.'),
          ('03-dir-w.png', 'Удаление и право w', 'chmod u-w docs, rm', 'Почему удаление файла решает каталог, а не файл.'),
          ('04-chmod.png', 'chmod буквами и числом', 'chmod -v …', 'Переведите три своих примера из букв в число и обратно.'),
          ('05-chown.png', 'Владелец и группа', 'chown, chgrp', 'Почему chown без sudo запрещён, а chgrp на свою группу разрешён.'),
          ('06-umask.png', 'umask', 'umask, (umask 027; …)', 'Права файла и каталога при маске 0027 — расчёт по тройкам.'),
          ('07-shop-dirs.png', 'Каталоги проекта', 'ls -l /srv/shop', 'Что означает каждая буква в drwxrws--T.'),
          ('08-shop-access.png', 'Тесты доступа', 'sudo -u … cat / ls / rm', 'Какой бит или право объясняет каждый результат.'),
          ('09-shop-check.png', 'Проверка', 'sudo bash perms-lab-check.sh', 'Итог проверки; какие пункты потребовали исправления.')]

CRITERIA = [('2', 'опыты с правами файла и каталога: r, w, x и удаление — части 1–2'), ('2', 'chmod буквами и числом, перевод своих примеров — часть 3'),
            ('2', 'chown и chgrp, umask с расчётом по тройкам — части 4–5'), ('2', 'каталоги проекта с setgid и sticky — задания 1–3'),
            ('2', 'тесты доступа и проверка 14 из 14 — задания 4–9')]


def homework():
    return ('<section id="homework" class="homework"><div class="hw-sheet">'
            '<p class="hw-kicker">Домашнее задание · занятие 6</p>'
            '<h2>Максим Николаевич не хочет задавать домашнее задание. Но очень хочет</h2>'
            '<figure class="hw-meme"><img src="img/meme-everything-disappeared.jpg" alt="Котёнок сидит на клавиатуре ноутбука, подпись: «я чето нажала и всё исчезло»" width="807" height="794" loading="lazy"></figure>'
            '<h3>Права своего проекта</h3>'
            '<p>Возьмите проект из домашнего задания занятия 5 или любой другой — сайт, бот, приложение — и составьте для него таблицу прав в файле <code>permissions.md</code>.</p>'
            '<ul class="summary"><li>Шесть объектов: три каталога и три файла, среди них один секрет и один исполняемый скрипт.</li>'
            '<li>Для каждого: владелец, группа, права буквами и числом и одно предложение — почему так.</li>'
            '<li>Какую маску <code>umask</code> вы поставите команде и какие права получат новые файлы и каталоги.</li>'
            '<li>Где в проекте нужен sticky-бит или запись ACL, и почему без неё нельзя обойтись. Если нигде — объясните, почему.</li></ul>'
            '<h3>Порядок сдачи</h3><ul class="hw-rules">'
            '<li><b>Файлы</b><span>папка <code>lesson_04</code> в своём репозитории по шаблону <a href="https://github.com/MaximBytecamp/os-environments-template">os-environments-template</a>: <code>report.md</code>, снимки в <code>screenshots/</code>, <code>permissions.md</code>.</span></li>'
            '<li><b>Ветка и PR</b><span>ветка <code>hw-04</code>, Pull Request в свою <code>main</code>.</span></li>'
            '<li><b>Срок</b><span>до начала следующего занятия.</span></li>'
            '<li><b>Критерии</b><span>практическая работа — 10 баллов по критериям выше; таблица прав принимается, если для всех шести объектов права записаны двумя способами и объяснены.</span></li>'
            '<li><b>ИИ</b><span>нейросеть можно попросить причесать формулировки и оформить таблицы в <code>.md</code> — <mark>я сам так делаю всегда, поэтому и вам запрещать не буду</mark>. Команды и вывод — только из вашей виртуальной машины.</span></li></ul>'
            '</div><button class="hw-print" type="button">Скачать задание в PDF</button></section>')


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['Проверка выводит «Итог: 14 из 14»', 'Под каждым снимком есть вывод своими словами', 'Права своих примеров переведены из букв в число', 'Расчёт umask 0027 сделан по тройкам', 'Учебные каталоги и учётные записи удалены после сдачи']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Отчёт <code>report.md</code> с девятью снимками экрана по шаблону из материалов. Номера UID и GID, даты и размеры в вашей системе будут отличаться от снимков урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria">' + ''.join(f'<li><b>{p}</b><span>{t}</span></li>' for p, t in CRITERIA) + '</ul>'
            '<p>По каждому пункту: 2 балла — результат получен и объяснён, 1 — результат без объяснения, 0 — результата нет или объяснение неверное.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + f'<p id="check-status" aria-live="polite">Отмечено 0 из {len(checks)}</p></div></section>' + homework())


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 6 · практическое занятие</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Что разрешают r, w и x файлу и каталогу, запись прав буквами и числами, смена владельца и группы, права новых файлов и umask, специальные биты setuid, setgid и sticky, списки доступа ACL. В конце — каталог проекта для команды из трёх человек.</p>'
            '<a class="cover-start" href="01-stroka-ls.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План занятия</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы № 1 и терминал. Учебный набор создаёт скрипт <code>perms-lab-setup.sh</code>: каталог <code>~/perm-lab</code> и пользователей anna и boris. Команды с <code>sudo</code> выполняйте только в учебной виртуальной машине; перед практической работой сделайте снимок её состояния.</p>'
            '<p>На занятие отводится одна пара — 90 минут: части 1–6 около 50 минут, практическая работа — 40 минут. Снимки экрана сделаны в Ubuntu 24.04.4 Live: у пользователя ubuntu нет пароля, и sudo его не спрашивает. В установленной Ubuntu sudo спросит ваш пароль.</p>'
            '<p>Каждая часть построена одинаково: объяснение, определения, команды для выполнения в терминале, снимок с результатом, итоги части и переход к следующей.</p></section>'
            f'{materials()}</div>')


def next_card(i):
    c = CHAPTERS[i - 1]
    if i < N:
        nx = CHAPTERS[i]
        return (f'<a class="next" href="{nx["slug"]}.html" style="--c:{nx["color"]}"><span>Часть {i + 1} · {nx["layer"]}</span>'
                f'<b>{nx["title"]}</b><em>{c["bridge"]}</em></a>')
    return '<a class="next next--top" href="index.html"><span>Занятие завершено</span><b>К содержанию</b></a>'


for old in ['map.json', 'content.json']:
    (B / old).unlink(missing_ok=True)

(B / 'index.html').write_text(shell('Содержание', cover()))

for i, c in enumerate(CHAPTERS, 1):
    counters['core'] = counters['probe'] = 0
    toc = ''.join(f'<li><a href="#s{j}">{i}.{j} {s["title"]}</a></li>' for j, s in enumerate(c['sections'], 1))
    body = (f'<section class="hero" style="--c:{c["color"]}"><div class="wrap hero-in"><p class="depth">Часть {i} из {N}</p>'
            f'<h1>{c["title"]}</h1><p class="lead">{c["lead"]}</p><ol class="toc">{toc}</ol></div></section><div class="wrap page">')
    for j, s in enumerate(c['sections'], 1):
        body += f'<section class="stage" id="s{j}"><h2><span>{i}.{j}</span> {s["title"]}</h2>{blocks_html(s["blocks"], i)}</section>'
    items = ''.join(f'<li>{x}</li>' for x in c['summary'])
    body += (f'<section class="answer" style="--c:{c["color"]}"><h2>Итоги части {i}</h2><ul class="summary">{items}</ul>'
             f'<div class="answer-foot"><p class="report"><b>В отчёт</b>{c["report"]}</p>'
             '<button id="mark-layer" type="button" aria-pressed="false">Отметить часть пройденной</button></div></section>')
    if i == N:
        body += deliver() + materials()
    body += next_card(i) + '</div>'
    (B / f'{c["slug"]}.html').write_text(shell(f'{i}. {c["layer"]}', body, i, c['color']))

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="44" text-anchor="middle" font-size="30" font-family="monospace" font-weight="700" fill="#F2A65A">rwx</text></svg>')

# ───────────────────────────── материалы

strip = lambda s: s.replace('<code>', '`').replace('</code>', '`').replace('<kbd>', '').replace('</kbd>', '').replace('&gt;', '>').replace('&lt;', '<')

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += '## Перед сдачей\n\n- [ ] Проверка: 14 из 14.\n- [ ] Под каждым снимком есть вывод.\n- [ ] Учебные каталоги и учётные записи удалены.\n'
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + strip(x) + '\n' for x in c['summary']) + '\n'
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа · каталог проекта shop\n\n'
            'Роли: alex и bella — разработчики (группа shop-dev), chris — аналитик (только личная группа).\n'
            'Каталоги: /srv/shop/src — 2770, /srv/shop/releases — 2775, /srv/shop/uploads — 3770; группа всех трёх — shop-dev.\n\n'
            '| № | Задание | Подсказка |\n|---|---|---|\n'
            + ''.join(f'| {i} | {strip(t)} | {strip(h)} |\n' for i, (t, h) in enumerate(TASKS, 1))
            + '\nПроверка: `sudo bash ~/Downloads/perms-lab-check.sh`\n\n'
            '## Оценка · 10 баллов\n\n' + ''.join(f'- {p} — {t}\n' for p, t in CRITERIA)
            + '\n## Уборка\n\n```bash\nsudo rm -r /srv/shop /srv/shared   # после проверки содержимого\nfor u in alex bella chris; do sudo userdel -r $u; done\nsudo groupdel shop-dev\n```\n\n'
            '## Домашнее задание\n\nТаблица прав своего проекта permissions.md: шесть объектов, права буквами и числом, umask команды, где нужен sticky-бит или ACL.\n'
            'Сдача: папка lesson_04 в своём репозитории по шаблону https://github.com/MaximBytecamp/os-environments-template, ветка hw-04, Pull Request в main, до начала следующего занятия.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/perms-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['perms-lab-setup.sh', 'perms-lab-check.sh']:
        z.write(B / 'materials' / f, f'perms-lab-kit/{f}')
    z.writestr('perms-lab-kit/README.md', report)
    z.writestr('perms-lab-kit/PRACTICE.md', practice)
    z.writestr('perms-lab-kit/CHEATSHEET.md', cheat)

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков или описаний:', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
