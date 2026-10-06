#!/usr/bin/env python3
# Собирает страницы урока «Процессы: PID, состояния и сигналы» и материалы.
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
NUM = 7
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Процессы: PID, состояния и сигналы'
DESCRIPTION = 'Лекция и практическая работа: программа и процесс, PID и PPID, дерево процессов, состояния R, S, D, T, Z, фон и передний план, сигналы TERM, KILL, STOP и CONT, коды завершения и зомби.'
KEY = 'os-procs-lab-v1'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://man7.org/linux/man-pages/man7/signal.7.html">signal(7)</a> · <a href="https://man7.org/linux/man-pages/man1/ps.1.html">ps(1): столбец STAT</a> · '
            '<a href="https://man7.org/linux/man-pages/man5/proc_pid_status.5.html">proc_pid_status(5)</a> · <a href="https://man7.org/linux/man-pages/man2/fork.2.html">fork(2)</a> · '
            '<a href="https://man7.org/linux/man-pages/man2/execve.2.html">execve(2)</a> · <a href="https://man7.org/linux/man-pages/man2/wait.2.html">wait(2)</a> · '
            '<a href="https://www.gnu.org/software/bash/manual/html_node/Job-Control.html">GNU Bash · Job Control</a> · <a href="https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html">GNU Bash · Exit Status</a></p>'
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
            '<a href="materials/procs-lab-setup.sh" download><b>procs-lab-setup.sh</b><span>создаёт ~/procs-lab с набором процессов и диспетчером</span></a>'
            '<a href="materials/procs-lab-check.sh" download><b>procs-lab-check.sh</b><span>проверяет, как завершён каждый процесс набора</span></a>'
            '<a href="materials/report-template.md" download><b>report-template.md</b><span>шаблон отчёта со снимками</span></a>'
            '<a href="materials/procs-lab.zip" download><b>Весь набор</b><span>скрипты, шаблон, задание и памятка</span></a></div></section>')


ASSIGN = [('01-process.png', 'Программа и процесс', 'sleep 300 &, pgrep -a, /proc/PID/status', 'Подпишите PID, PPID и состояние; чем процесс отличается от файла программы.'),
          ('02-tree.png', 'Дерево процессов', 'echo $$, pstree -p $$', 'Подпишите цепочку от оболочки до sleep: кто чей родитель.'),
          ('03-states.png', 'Состояния', 'yes &, sleep &, Ctrl+Z, ps -o stat', 'Объясните каждое из четырёх состояний и почему появился зомби.'),
          ('04-jobs.png', 'Фон и передний план', 'Ctrl+Z, jobs -l, bg, fg', 'Что делает с заданием каждое действие.'),
          ('05-signals.png', 'STOP, CONT и trap', 'kill -STOP, kill -CONT, trap', 'Почему процесс пережил TERM и не пережил KILL.'),
          ('06-exit.png', 'Коды завершения', 'echo $?, wait $!', 'Объясните коды 130, 143 и 137.'),
          ('07-lab-tree.png', 'Набор процессов', 'pstree -p, ps --ppid', 'Таблица «процесс — состояние» для набора.'),
          ('08-lab-signals.png', 'Сигналы по заданиям', 'kill, kill -9, exit-codes.log', 'Какой сигнал выбран для каждого процесса и почему.'),
          ('09-lab-check.png', 'Проверка', 'bash procs-lab-check.sh', 'Итог проверки; какие пункты потребовали исправления.')]

CRITERIA = [('2', 'процесс, PID, PPID и дерево — части 1–2'), ('2', 'состояния R, S, T, Z на опыте и их объяснение — часть 3'),
            ('2', 'фон и передний план, сигналы STOP, CONT, TERM, KILL — части 4–5'), ('2', 'коды завершения и зомби — часть 6'),
            ('2', 'практическая работа: таблица состояний, сигналы по заданиям, проверка 11 из 11')]


def homework():
    return ('<section id="homework" class="homework"><div class="hw-sheet">'
            '<p class="hw-kicker">Домашнее задание · занятие 7</p>'
            '<h2>Максим Николаевич не хочет задавать домашнее задание. Но очень хочет</h2>'
            '<figure class="hw-meme"><img src="img/meme-wrong-key.jpg" alt="Котёнок сидит над клавиатурой ноутбука, подпись: «хоспаде, куда я жмав»" width="800" height="800" loading="lazy"></figure>'
            '<h3>Аккуратное завершение</h3>'
            '<p>Напишите скрипт <code>graceful.sh</code>, который при запуске создаёт временный файл <code>/tmp/graceful-$$.tmp</code>, затем работает в бесконечном цикле со <code>sleep 1</code>. На сигнал TERM скрипт должен удалить свой временный файл и выйти с кодом 0 — команда <code>trap</code> из части 5.</p>'
            '<ul class="summary"><li>Запустите скрипт в фоне, пошлите TERM, получите код через <code>wait $!</code> и покажите, что временного файла нет.</li>'
            '<li>Запустите ещё раз и пошлите KILL: покажите код 137 и оставшийся временный файл. Объясните разницу двумя-тремя предложениями.</li>'
            '<li>Выведите цепочку процессов от PID 1 до своей оболочки командой <code>pstree -s -p $$</code> и подпишите каждое звено: что это за программа.</li></ul>'
            '<h3>Порядок сдачи</h3><ul class="hw-rules">'
            '<li><b>Файлы</b><span>папка <code>lesson_05</code> в своём репозитории по шаблону <a href="https://github.com/MaximBytecamp/os-environments-template">os-environments-template</a>: <code>report.md</code>, снимки в <code>screenshots/</code>, <code>states.md</code>, <code>graceful.sh</code>, <code>processes.md</code>.</span></li>'
            '<li><b>Ветка и PR</b><span>ветка <code>hw-05</code>, Pull Request в свою <code>main</code>.</span></li>'
            '<li><b>Срок</b><span>до начала следующего занятия.</span></li>'
            '<li><b>Критерии</b><span>практическая работа — 10 баллов по критериям выше; домашнее задание принимается, если скрипт удаляет файл на TERM и оба запуска показаны снимками с кодами завершения.</span></li>'
            '<li><b>ИИ</b><span>нейросеть можно попросить причесать формулировки и оформить таблицы в <code>.md</code> — <mark>я сам так делаю всегда, поэтому и вам запрещать не буду</mark>. Команды и вывод — только из вашей виртуальной машины.</span></li></ul>'
            '</div><button class="hw-print" type="button">Скачать задание в PDF</button></section>')


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['Проверка выводит «Итог: 11 из 11»', 'Под каждым снимком есть вывод своими словами', 'Таблица состояний states.md заполнена', 'Для каждого кода 130, 143, 137 указан сигнал', 'Процессов набора не осталось: pgrep -af procs-lab пуст']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Отчёт <code>report.md</code> с девятью снимками экрана по шаблону из материалов и таблица состояний <code>states.md</code>. Номера PID в вашей системе будут отличаться от снимков урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria">' + ''.join(f'<li><b>{p}</b><span>{t}</span></li>' for p, t in CRITERIA) + '</ul>'
            '<p>По каждому пункту: 2 балла — результат получен и объяснён, 1 — результат без объяснения, 0 — результата нет или объяснение неверное.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + f'<p id="check-status" aria-live="polite">Отмечено 0 из {len(checks)}</p></div></section>' + homework())


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 7 · комбинированное занятие</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Программа и процесс, номера PID и PPID, дерево процессов, состояния R, S, D, T и Z, фон и передний план, сигналы TERM, KILL, STOP и CONT, коды завершения и зомби. В конце — набор процессов в разных состояниях, который нужно завершить подходящими сигналами.</p>'
            '<a class="cover-start" href="01-process.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План занятия</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы № 1 и терминал. Права администратора на этом занятии не нужны: все процессы запускаются от вашего имени. Набор для практической работы создаёт скрипт <code>procs-lab-setup.sh</code>.</p>'
            '<p>На занятие отводится одна пара — 90 минут: части 1–6 около 55 минут, практическая работа — 35 минут. Снимки экрана сделаны в Ubuntu 24.04.4 Live; номера процессов в вашей системе будут другими.</p>'
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

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="44" text-anchor="middle" font-size="30" font-family="monospace" font-weight="700" fill="#F2A65A">PID</text></svg>')

# ───────────────────────────── материалы

strip = lambda s: s.replace('<code>', '`').replace('</code>', '`').replace('<kbd>', '').replace('</kbd>', '').replace('&gt;', '>').replace('&lt;', '<')

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += '## Перед сдачей\n\n- [ ] Проверка: 11 из 11.\n- [ ] Под каждым снимком есть вывод.\n- [ ] states.md заполнен.\n'
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + strip(x) + '\n' for x in c['summary']) + '\n'
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа · диспетчер процессов\n\n'
            'Набор: worker.sh (спит), hog.sh (занимает процессор), stubborn.sh (перехватывает TERM), paused.sh (остановлен), lab-parent (родитель зомби), диспетчер manager.py.\n\n'
            '| № | Задание | Подсказка |\n|---|---|---|\n'
            + ''.join(f'| {i} | {strip(t)} | {strip(h)} |\n' for i, (t, h) in enumerate(TASKS, 1))
            + '\nПроверка: `bash ~/Downloads/procs-lab-check.sh`\n\n'
            '## Оценка · 10 баллов\n\n' + ''.join(f'- {p} — {t}\n' for p, t in CRITERIA)
            + '\n## Домашнее задание\n\nСкрипт graceful.sh: на TERM удаляет свой временный файл и выходит с кодом 0; опыты с TERM и KILL с кодами завершения; цепочка pstree -s -p $$ с подписями в processes.md.\n'
            'Сдача: папка lesson_05 в своём репозитории по шаблону https://github.com/MaximBytecamp/os-environments-template, ветка hw-05, Pull Request в main, до начала следующего занятия.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/procs-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['procs-lab-setup.sh', 'procs-lab-check.sh']:
        z.write(B / 'materials' / f, f'procs-lab-kit/{f}')
    z.writestr('procs-lab-kit/README.md', report)
    z.writestr('procs-lab-kit/PRACTICE.md', practice)
    z.writestr('procs-lab-kit/CHEATSHEET.md', cheat)

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков или описаний:', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
