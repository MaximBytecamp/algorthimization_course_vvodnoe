#!/usr/bin/env python3
# Собирает страницы урока «Пользователи, группы и sudo» и материалы.
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
NUM = 5
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Пользователи, группы и sudo'
DESCRIPTION = 'Лекция и практическая работа: учётные записи, /etc/passwd, /etc/shadow и /etc/group, root и sudo, создание пользователей и групп, общий каталог команды и проверка доступа.'
KEY = 'os-users-lab-v1'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://man7.org/linux/man-pages/man5/passwd.5.html">passwd(5)</a> · <a href="https://man7.org/linux/man-pages/man5/shadow.5.html">shadow(5)</a> · '
            '<a href="https://man7.org/linux/man-pages/man5/group.5.html">group(5)</a> · <a href="https://www.sudo.ws/docs/man/sudoers.man/">sudoers(5)</a> · '
            '<a href="https://man7.org/linux/man-pages/man8/useradd.8.html">useradd(8)</a> · <a href="https://man7.org/linux/man-pages/man8/usermod.8.html">usermod(8)</a> · '
            '<a href="https://manpages.ubuntu.com/manpages/noble/man8/adduser.8.html">adduser(8), Ubuntu 24.04</a> · '
            '<a href="https://documentation.ubuntu.com/server/how-to/security/user-management/">Ubuntu Server · User management</a></p>'
            '<p>Снимки сделаны в виртуальной машине VirtualBox 7.2: Ubuntu 24.04.4 Desktop ARM64, Live-сеанс, Bash, 21 сентября 2026 года. <a href="shots/SOURCES.md">Команды для каждого снимка</a>.</p></details>')


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
            '<a href="materials/team-lab-check.sh" download><b>team-lab-check.sh</b><span>проверяет модель доступа mobile-app</span></a>'
            '<a href="materials/access-tests-template.md" download><b>access-tests-template.md</b><span>таблица тестов доступа и схема ролей</span></a>'
            '<a href="materials/report-template.md" download><b>report-template.md</b><span>шаблон отчёта со снимками</span></a>'
            '<a href="materials/users-lab.zip" download><b>Весь набор</b><span>скрипт, шаблоны, задание и памятка</span></a></div></section>')


ASSIGN = [('01-id.png', 'Учётная запись', 'id, getent passwd $(whoami)', 'Подпишите семь полей своей строки /etc/passwd.'),
          ('02-shadow.png', 'passwd и shadow', 'ls -l /etc/passwd /etc/shadow', 'Почему shadow закрыт для остальных пользователей.'),
          ('03-groups.png', 'Группы', 'groups, getent group sudo', 'Где основная группа, где дополнительные.'),
          ('04-sudo.png', 'Правила sudo', 'sudo -l', 'Какое правило даёт вам права администратора.'),
          ('05-team.png', 'Команда mobile-app', 'getent group …, id lead dev qa guest', 'Совпадают ли группы со схемой ролей.'),
          ('06-dirs.png', 'Каталоги проекта', 'ls -l /srv/mobile', 'Что означает каждая цифра в 2770.'),
          ('07-access.png', 'Тесты доступа', 'sudo -u … ls / touch', 'Результаты таблицы тестов доступа.'),
          ('08-check.png', 'Проверка', 'sudo bash team-lab-check.sh', 'Итог проверки; какие пункты потребовали исправления.'),
          ('09-denied.png', 'Отказ sudo в журнале', 'journalctl -t sudo | grep "NOT in sudoers"', 'Кто, когда и какую команду пытался выполнить.')]

CRITERIA = [('2', 'учётные записи и группы созданы по схеме ролей — задания 1–3'), ('2', 'каталоги проекта: группы и права 2770 — задание 4'),
            ('2', 'таблица тестов доступа: ожидаемый и фактический результат — задание 5'), ('2', 'проверка 21 из 21 и запись об отказе в журнале — задания 6–7'),
            ('2', 'объяснение, почему постоянная работа под root опасна, с тремя примерами — задание 8')]


def homework():
    return ('<section id="homework" class="homework"><div class="hw-sheet">'
            '<p class="hw-kicker">Домашнее задание · занятие 5</p>'
            '<h2>Максим Николаевич не хочет задавать домашнее задание. Но очень хочет</h2>'
            '<figure class="hw-meme"><img src="img/meme-password-taken.jpg" alt="Форма регистрации сообщает, что пароль уже занят другим пользователем; ниже подпись «Круто напрограммировали»" width="803" height="877" loading="lazy"></figure>'
            '<h3>Модель доступа своего проекта</h3>'
            '<p>Возьмите проект, над которым вы работаете или хотели бы работать, — сайт, бот, мобильное приложение — и составьте для него модель доступа в файле <code>access-model.md</code>.</p>'
            '<ul class="summary"><li>Четыре роли, для каждой — учётная запись, группы, каталоги, что роль может и чего не может.</li>'
            '<li>Каталоги проекта в <code>/srv</code> с группой и правами числом и буквами.</li>'
            '<li>Скрипт <code>setup-team.sh</code>, который создаёт группы, пользователей и каталоги. Запустите его в учебной виртуальной машине и приложите вывод <code>id</code> для каждого пользователя и <code>ls -l</code> каталогов.</li>'
            '<li>Пять строк таблицы тестов доступа с ожидаемым и фактическим результатом.</li></ul>'
            '<h3>Порядок сдачи</h3><ul class="hw-rules">'
            '<li><b>Файлы</b><span><code>labs/lab04-users/</code> в репозитории <code>os-linux-course</code>: <code>README.md</code> со снимками, <code>access-tests.md</code>, <code>access-model.md</code>, <code>setup-team.sh</code>.</span></li>'
            '<li><b>Ветка и PR</b><span>ветка <code>lab04-users</code>, Pull Request в <code>main</code> с названием «Пользователи, группы и sudo».</span></li>'
            '<li><b>Срок</b><span>до начала следующего занятия.</span></li>'
            '<li><b>Критерии</b><span>практическая работа — 10 баллов по критериям выше; модель доступа принимается, если скрипт выполнен в виртуальной машине и вывод приложен.</span></li>'
            '<li><b>ИИ</b><span>нейросеть можно попросить причесать формулировки и оформить таблицы в <code>.md</code> — <mark>я сам так делаю всегда, поэтому и вам запрещать не буду</mark>. Команды и вывод — только из вашей виртуальной машины.</span></li></ul>'
            '</div><button class="hw-print" type="button">Скачать задание в PDF</button></section>')


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['Проверка выводит «Итог: 21 из 21»', 'Таблица тестов доступа заполнена полностью', 'В группе sudo только lead', 'Объяснение про root содержит три примера', 'Учебные учётные записи удалены после сдачи']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Отчёт <code>README.md</code> с девятью снимками экрана и таблицу тестов доступа <code>access-tests.md</code> по шаблону из материалов. Номера UID и GID в вашей системе будут отличаться от снимков урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria">' + ''.join(f'<li><b>{p}</b><span>{t}</span></li>' for p, t in CRITERIA) + '</ul>'
            '<p>По каждому пункту: 2 балла — результат получен и объяснён, 1 — результат без объяснения, 0 — результата нет или объяснение неверное.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + f'<p id="check-status" aria-live="polite">Отмечено 0 из {len(checks)}</p></div></section>' + homework())


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 5 · комбинированное занятие</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Учётные записи и их номера, файлы /etc/passwd, /etc/shadow и /etc/group, суперпользователь root и sudo, создание пользователей и групп для команды разработки, общий каталог и проверка доступа. В конце — модель доступа для команды mobile-app.</p>'
            '<a class="cover-start" href="01-uchetnye-zapisi.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План занятия</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы № 1 и терминал. Команды, которые создают и удаляют учётные записи, выполняются через <code>sudo</code> — только в учебной виртуальной машине. Перед частью 5 сделайте снимок состояния виртуальной машины в VirtualBox.</p>'
            '<p>На занятие отводится одна пара — 90 минут: части 1–4 около 35 минут, части 5–6 — 25 минут, практическая работа — 30 минут. Снимки экрана сделаны в Ubuntu 24.04.4 Live: в Live-сеансе у пользователя ubuntu нет пароля, и sudo его не спрашивает. В установленной Ubuntu sudo спросит ваш пароль.</p>'
            '<p>Каждая часть построена одинаково: объяснение, команды для выполнения в терминале, снимок с результатом, итоги части и переход к следующей.</p></section>'
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

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="45" text-anchor="middle" font-size="38" font-family="monospace" font-weight="700" fill="#F2A65A">#</text></svg>')

# ───────────────────────────── материалы

strip = lambda s: s.replace('<code>', '`').replace('</code>', '`').replace('<kbd>', '').replace('</kbd>', '').replace('&gt;', '>').replace('&lt;', '<')

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += '## Почему постоянная работа под root опасна\n\n1. …\n2. …\n3. …\n\n## Перед сдачей\n\n- [ ] Проверка: 21 из 21.\n- [ ] access-tests.md заполнен.\n- [ ] Учебные учётные записи удалены.\n'
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + strip(x) + '\n' for x in c['summary']) + '\n'
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа · модель доступа команды mobile-app\n\n'
            'Роли: lead (mobile-dev, mobile-qa, sudo), dev (mobile-dev), qa (mobile-qa), guest (только личная группа).\n'
            'Каталоги: /srv/mobile/src — группа mobile-dev, 2770; /srv/mobile/reports — группа mobile-qa, 2770.\n\n'
            '| № | Задание | Подсказка |\n|---|---|---|\n'
            + ''.join(f'| {i} | {strip(t)} | {strip(h)} |\n' for i, (t, h) in enumerate(TASKS, 1))
            + '\nПроверка: `sudo bash ~/Downloads/team-lab-check.sh`\n\n'
            '## Оценка · 10 баллов\n\n' + ''.join(f'- {p} — {t}\n' for p, t in CRITERIA)
            + '\n## Уборка\n\n```bash\nfor u in lead dev qa guest anna boris; do sudo userdel -r $u; done\nsudo groupdel mobile-dev; sudo groupdel mobile-qa; sudo groupdel devteam\nsudo rm -r /srv/mobile /srv/devteam   # после проверки содержимого\n```\n\n'
            '## Домашнее задание\n\nМодель доступа своего проекта: четыре роли, каталоги в /srv, скрипт setup-team.sh, пять тестов доступа.\n'
            'Сдача: labs/lab04-users/ в репозитории os-linux-course, ветка lab04-users, Pull Request в main, до начала следующего занятия.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/users-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['team-lab-check.sh', 'access-tests-template.md']:
        z.write(B / 'materials' / f, f'users-lab-kit/{f}')
    z.writestr('users-lab-kit/README.md', report)
    z.writestr('users-lab-kit/PRACTICE.md', practice)
    z.writestr('users-lab-kit/CHEATSHEET.md', cheat)

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков или описаний:', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
