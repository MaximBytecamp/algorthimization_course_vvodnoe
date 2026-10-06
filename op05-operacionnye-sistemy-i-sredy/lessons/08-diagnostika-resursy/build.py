#!/usr/bin/env python3
# Собирает страницы урока «Диагностика процессов и управление ресурсами» и материалы.
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
NUM = 8
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Диагностика процессов и управление ресурсами'
DESCRIPTION = 'Лекция и практическая работа: load average и число ядер, top и htop, поиск процесса командами ps, pstree и /proc, приоритет nice и renice, измерение командой time, порядок действий при зависании и postmortem.'
KEY = 'os-diag-lab-v1'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://man7.org/linux/man-pages/man5/proc_loadavg.5.html">proc_loadavg(5)</a> · <a href="https://man7.org/linux/man-pages/man1/top.1.html">top(1)</a> · '
            '<a href="https://man7.org/linux/man-pages/man1/ps.1.html">ps(1)</a> · <a href="https://man7.org/linux/man-pages/man1/nice.1.html">nice(1)</a> · '
            '<a href="https://man7.org/linux/man-pages/man1/renice.1.html">renice(1)</a> · <a href="https://man7.org/linux/man-pages/man7/sched.7.html">sched(7): nice и веса</a> · '
            '<a href="https://man7.org/linux/man-pages/man1/time.1.html">time(1)</a> · <a href="https://htop.dev/">htop</a> · '
            '<a href="https://sre.google/sre-book/postmortem-culture/">Google SRE Book · Postmortem Culture</a></p>'
            '<p>Снимки сделаны в виртуальной машине VirtualBox 7.2: Ubuntu 24.04.4 Desktop ARM64, Live-сеанс, Bash, два ядра. <a href="shots/SOURCES.md">Команды для каждого снимка</a>.</p></details>')


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
            '<a href="materials/diag-lab-setup.sh" download><b>diag-lab-setup.sh</b><span>создаёт ~/diag-lab с учебным сервером и заготовкой postmortem</span></a>'
            '<a href="materials/diag-lab-check.sh" download><b>diag-lab-check.sh</b><span>проверяет, как устранён инцидент, и заполнен ли postmortem</span></a>'
            '<a href="materials/report-template.md" download><b>report-template.md</b><span>шаблон отчёта со снимками</span></a>'
            '<a href="materials/diag-lab.zip" download><b>Весь набор</b><span>скрипты, шаблон, задание и памятка</span></a></div></section>')


ASSIGN = [('01-load.png', 'Нагрузка', 'nproc, uptime, /proc/loadavg, free -h', 'Сравните load average с числом ядер до и после запуска yes.'),
          ('02-top.png', 'top', 'top -b -n 1 | head -12', 'Подпишите нагрузку, долю us и самый загруженный процесс.'),
          ('03-htop.png', 'htop', 'htop', 'Что показывают полосы ядер и памяти.'),
          ('04-find.png', 'Поиск виновника', 'ps --sort=-%cpu, pstree -s -p, /proc/PID/cwd', 'PID виновника, кто его запустил и где он работает.'),
          ('05-nice.png', 'nice и renice', 'taskset, nice, renice', 'Почему ядро разделилось 90 на 10 и почему renice отказал.'),
          ('06-time.png', 'time', 'time, /usr/bin/time -f', 'Соотношение real, user и sys для каждой команды.'),
          ('07-memory.png', 'Память', 'free -h, ps --sort=-rss', 'Сколько памяти занял процесс и вернулась ли она.'),
          ('08-lab-find.png', 'Инцидент: симптом', 'uptime, tail web.log, ps, pstree', 'Симптом в числах и виновники.'),
          ('09-lab-fix.png', 'Инцидент: исправление', 'renice, kill, kill -9, exit-codes.log', 'Что сделано и как изменилось время ответа.'),
          ('10-lab-check.png', 'Проверка', 'bash diag-lab-check.sh', 'Итог проверки; какие пункты потребовали исправления.')]

CRITERIA = [('2', 'нагрузка, top и htop: числа на снимках прочитаны и объяснены — части 1–2'), ('2', 'поиск виновника: ps с сортировкой, предки, каталог — часть 3'),
            ('2', 'nice, renice и time: доли процессора и три времени объяснены — части 4–5'), ('2', 'практическая работа: инцидент устранён, проверка 11 из 11'),
            ('2', 'postmortem: четыре раздела по фактам, проверяемая профилактика')]


def homework():
    return ('<section id="homework" class="homework"><div class="hw-sheet">'
            '<p class="hw-kicker">Домашнее задание · занятие 8</p>'
            '<h2>Максим Николаевич не хочет задавать домашнее задание. Но очень хочет</h2>'
            '<figure class="hw-meme"><img src="img/meme-four-laptops.jpg" alt="Человек одновременно печатает на четырёх ноутбуках, руки размыты от скорости" width="500" height="375" loading="lazy"></figure>'
            '<h3>Свой инцидент</h3>'
            '<p>Устройте на своей виртуальной машине инцидент и разберите его по порядку действий из части 6. Виновника выберите сами: процесс, который занимает процессор, процесс, который занимает память, или зависший процесс, который не реагирует на TERM.</p>'
            '<ul class="summary"><li>Снимите симптом до инцидента и во время него: <code>uptime</code>, <code>free -h</code> или <code>top -b -n 1</code>.</li>'
            '<li>Найдите виновника командами из части 3, смягчите или устраните его и повторите измерение.</li>'
            '<li>Измерьте командой <code>/usr/bin/time -f "%e s, %M KB"</code> время и пиковую память любой программы на ваш выбор и объясните результат.</li>'
            '<li>Напишите <code>postmortem.md</code> из четырёх разделов: симптом, причина, действия, профилактика.</li></ul>'
            '<h3>Порядок сдачи</h3><ul class="hw-rules">'
            '<li><b>Файлы</b><span>папка <code>lesson_06</code> в своём репозитории по шаблону <a href="https://github.com/MaximBytecamp/os-environments-template">os-environments-template</a>: <code>report.md</code>, снимки в <code>screenshots/</code>, <code>postmortem.md</code> практической работы, <code>incident.md</code> со своим инцидентом.</span></li>'
            '<li><b>Ветка и PR</b><span>ветка <code>hw-06</code>, Pull Request в свою <code>main</code>.</span></li>'
            '<li><b>Срок</b><span>до начала следующего занятия.</span></li>'
            '<li><b>Критерии</b><span>практическая работа — 10 баллов по критериям выше; домашнее задание принимается, если симптом измерен до и после, виновник найден командами и postmortem содержит все четыре раздела.</span></li>'
            '<li><b>ИИ</b><span>нейросеть можно попросить причесать формулировки и оформить таблицы в <code>.md</code> — <mark>я сам так делаю всегда, поэтому и вам запрещать не буду</mark>. Команды и вывод — только из вашей виртуальной машины.</span></li></ul>'
            '</div><button class="hw-print" type="button">Скачать задание в PDF</button></section>')


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['Проверка выводит «Итог: 11 из 11»', 'Под каждым снимком есть вывод своими словами', 'В postmortem.md заполнены четыре раздела', 'Время ответа сайта записано до и после исправления', 'web-worker работал до конца работы']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Отчёт <code>report.md</code> с десятью снимками экрана по шаблону из материалов и <code>postmortem.md</code> практической работы. Номера PID и время ответа в вашей системе будут отличаться от снимков урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria">' + ''.join(f'<li><b>{p}</b><span>{t}</span></li>' for p, t in CRITERIA) + '</ul>'
            '<p>По каждому пункту: 2 балла — результат получен и объяснён, 1 — результат без объяснения, 0 — результата нет или объяснение неверное.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + f'<p id="check-status" aria-live="polite">Отмечено 0 из {len(checks)}</p></div></section>' + homework())


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 8 · практическое занятие</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Средняя нагрузка и число ядер, мониторы top и htop, поиск процесса, который занял процессор или память, приоритет nice и renice, измерение командой time. В конце — инцидент на учебном сервере: найти причину, восстановить работу и написать postmortem.</p>'
            '<a class="cover-start" href="01-nagruzka.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План занятия</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы № 1 и терминал. Права администратора понадобятся один раз, в части 4. Учебный сервер для практической работы создаёт скрипт <code>diag-lab-setup.sh</code>.</p>'
            '<p>На занятие отводится одна пара — 90 минут: части 1–6 около 45 минут, практическая работа — 45 минут. Снимки экрана сделаны в Ubuntu 24.04.4 Live на виртуальной машине с двумя ядрами; числа нагрузки и времени в вашей системе будут другими.</p>'
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

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="42" text-anchor="middle" font-size="22" font-family="monospace" font-weight="700" fill="#F2A65A">top</text></svg>')

# ───────────────────────────── материалы

strip = lambda s: s.replace('<code>', '`').replace('</code>', '`').replace('<kbd>', '').replace('</kbd>', '').replace('&gt;', '>').replace('&lt;', '<')

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += '## Перед сдачей\n\n- [ ] Проверка: 11 из 11.\n- [ ] Под каждым снимком есть вывод.\n- [ ] postmortem.md заполнен.\n'
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + strip(x) + '\n' for x in c['summary']) + '\n'
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа № 5 · диагностика процесса\n\n'
            'Учебный сервер: web-worker.sh (сайт, не трогать), report-builder.sh и три report-calc.sh (занимают процессор), sync-agent.sh (завис, игнорирует TERM), диспетчер incident.py.\n\n'
            '| № | Задание | Подсказка |\n|---|---|---|\n'
            + ''.join(f'| {i} | {strip(t)} | {strip(h)} |\n' for i, (t, h) in enumerate(TASKS, 1))
            + '\nПроверка: `bash ~/Downloads/diag-lab-check.sh`\n\n'
            '## Postmortem\n\nЧетыре раздела в ~/diag-lab/postmortem.md: симптом, причина, действия, профилактика.\n\n'
            '## Оценка · 10 баллов\n\n' + ''.join(f'- {p} — {t}\n' for p, t in CRITERIA)
            + '\n## Домашнее задание\n\nСвой инцидент на виртуальной машине: симптом до и во время, поиск виновника, исправление, повторное измерение; /usr/bin/time -f "%e s, %M KB" для любой программы; postmortem в incident.md.\n'
            'Сдача: папка lesson_06 в своём репозитории по шаблону https://github.com/MaximBytecamp/os-environments-template, ветка hw-06, Pull Request в main, до начала следующего занятия.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/diag-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['diag-lab-setup.sh', 'diag-lab-check.sh']:
        z.write(B / 'materials' / f, f'diag-lab-kit/{f}')
    z.writestr('diag-lab-kit/README.md', report)
    z.writestr('diag-lab-kit/PRACTICE.md', practice)
    z.writestr('diag-lab-kit/CHEATSHEET.md', cheat)

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков или описаний:', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
