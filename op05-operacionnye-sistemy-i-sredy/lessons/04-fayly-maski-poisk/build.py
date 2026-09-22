#!/usr/bin/env python3
# Собирает страницы урока «Файлы, маски, поиск и справка» и материалы.
# Текст — text_01…07.py, блоки — render.py, схемы — widgets.py.
from pathlib import Path
import html, sys, zipfile
sys.dont_write_bytecode = True
from content import CHAPTERS
from render import blocks_html, counters, missing
from text_07 import QUEST

B = Path(__file__).resolve().parent
E = html.escape
N = len(CHAPTERS)
NUM = 4
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Файлы, маски, поиск и справка'
DESCRIPTION = 'Лекция и практическая работа: создание, копирование, перемещение и удаление файлов, маски имён, поиск find и locate, справка man и --help.'
KEY = 'os-files-lab-v1'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://www.gnu.org/software/coreutils/manual/coreutils.html">GNU Coreutils · cp, mv, rm, mkdir, touch, ln</a> · '
            '<a href="https://www.gnu.org/software/bash/manual/html_node/Filename-Expansion.html">GNU Bash · Filename Expansion</a> · '
            '<a href="https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html">Brace Expansion</a> · '
            '<a href="https://www.gnu.org/software/findutils/manual/html_mono/find.html">GNU Findutils · find</a> · '
            '<a href="https://man7.org/linux/man-pages/man7/glob.7.html">glob(7)</a> · <a href="https://man7.org/linux/man-pages/man1/man.1.html">man(1)</a> · '
            '<a href="https://plocate.sesse.net/">plocate</a></p>'
            '<p>Снимки сделаны в виртуальной машине VirtualBox 7.2: Ubuntu 24.04.4 Desktop ARM64, Live-сеанс, Bash, 21 сентября 2026 года. <a href="shots/SOURCES.md">Команды для каждого снимка</a>.</p></details>')


def shell(title, content, current=0, color='#123A38'):
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="theme-color" content="#0E2524"><meta name="description" content="{E(DESCRIPTION)}">'
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
            '<a href="materials/files-lab-setup.sh" download><b>files-lab-setup.sh</b><span>создаёт учебный каталог inbox</span></a>'
            '<a href="materials/files-lab-check.sh" download><b>files-lab-check.sh</b><span>проверяет результат квеста</span></a>'
            '<a href="materials/journal-template.md" download><b>journal-template.md</b><span>шаблон журнала команд</span></a>'
            '<a href="materials/files-lab.zip" download><b>Весь набор</b><span>скрипты, задание, отчёт и памятка</span></a></div></section>')


ASSIGN = [('01-site-tree.png', 'Каталог site', 'mkdir -p, touch, tree', 'Почему mkdir без -p сообщил об ошибке.'),
          ('02-inbox.png', 'Учебный набор', 'ls, ls -A inbox', 'Какой файл виден только с ключом -A и почему.'),
          ('03-cp-i.png', 'Копирование с вопросом', 'cp -i data.csv ../backup/', 'Что сделает cp без -i, если файл уже есть.'),
          ('04-rmdir.png', 'Удаление каталога', 'rm, rmdir, rm -rv', 'Чем rmdir отличается от rm -r.'),
          ('05-masks.png', 'Маски', 'ls *.txt, ls photo-00[1-3].jpg, echo *.docx', 'Кто раскрывает маску и что получает команда, если совпадений нет.'),
          ('06-find.png', 'Поиск find', 'find -size, find -mtime', 'Почему -size -1M не нашёл ни одного файла.'),
          ('07-locate.png', 'Поиск locate', 'locate, sudo updatedb, locate -e', 'Почему locate выводит путь удалённого файла.'),
          ('08-man.png', 'Справка', 'man ls, поиск /sort by file size', 'Какой ключ сортирует по размеру и как вы его нашли.'),
          ('09-sorted.png', 'Результат квеста', 'tree ~/files-lab/sorted', 'Сколько файлов в каждом подкаталоге.'),
          ('10-check.png', 'Проверка', 'bash ~/Downloads/files-lab-check.sh', 'Итог проверки; какие пункты потребовали исправления.')]

CRITERIA = [('2', 'создание, копирование и перенос файлов — задания 1–6'), ('2', 'безопасное удаление с проверкой маски и пути — задания 7–8'),
            ('2', 'поиск find и locate — задания 9 и 12'), ('2', 'справка и скрытый файл — задания 10–11'),
            ('2', 'журнал команд: команда, результат и безопасный вариант')]


def homework():
    return ('<section id="homework" class="homework"><div class="hw-sheet">'
            '<p class="hw-kicker">Домашнее задание · занятие 4</p>'
            '<h2>Максим Николаевич не хочет задавать домашнее задание. Но очень хочет</h2>'
            '<figure class="hw-meme"><img src="img/meme-remote-worker.jpg" alt="Кот перед игровой приставкой, подпись: «Устроился удалёнщиком (чё удалять, пока непонятно)»" width="590" height="520" loading="lazy"></figure>'
            '<h3>Шпаргалка команд</h3>'
            '<p>Превратите журнал практической работы в шпаргалку <code>cheatsheet.md</code>: таблицу из 15 команд занятия. Для каждой команды заполните четыре графы.</p>'
            '<div class="tbl"><table><thead><tr><th>Команда</th><th>Назначение</th><th>Безопасный пример</th><th>Опасный вариант и чем он опасен</th></tr></thead><tbody>'
            '<tr><td><code>rm</code></td><td>удаляет файлы без корзины</td><td><code>ls *.bak</code>, затем <code>rm -v *.bak</code></td><td><code>rm * .bak</code> — лишний пробел, удаляются все файлы каталога</td></tr>'
            '<tr><td>…</td><td>…</td><td>…</td><td>…</td></tr></tbody></table></div>'
            '<p>В шпаргалку обязательно входят <code>cp</code>, <code>mv</code>, <code>rm</code>, <code>find</code> с <code>-delete</code>, <code>locate</code>, <code>man -k</code> и одна маска со скобками <code>[ ]</code>. Каждый безопасный пример выполните в своём каталоге <code>~/files-lab</code>: в шпаргалке только проверенные команды.</p>'
            '<h3>Порядок сдачи</h3><ul class="hw-rules">'
            '<li><b>Файлы</b><span><code>labs/lab03-files/</code> в репозитории <code>os-linux-course</code>: <code>README.md</code> со снимками, <code>journal.md</code>, <code>answers.txt</code>, <code>cheatsheet.md</code>.</span></li>'
            '<li><b>Ветка и PR</b><span>ветка <code>lab03-files</code>, Pull Request в <code>main</code> с названием «Практическая работа № 3».</span></li>'
            '<li><b>Срок</b><span>до начала следующего занятия.</span></li>'
            '<li><b>Критерии</b><span>практическая работа — 10 баллов по критериям выше; шпаргалка принимается, если в ней 15 команд и все четыре графы заполнены.</span></li>'
            '<li><b>ИИ</b><span>нейросеть можно попросить причесать формулировки и оформить таблицу в <code>.md</code> — <mark>я сам так делаю всегда, поэтому и вам запрещать не буду</mark>. Команды и результаты — только из вашего терминала.</span></li></ul>'
            '</div><button class="hw-print" type="button">Скачать задание в PDF</button></section>')


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['Все 12 пунктов проверки выводят OK', 'answers.txt содержит ответы на задания 9–12', 'В journal.md не меньше 12 команд с безопасным вариантом', 'Снимки открываются из README', 'Удаление выполнялось только внутри ~/files-lab']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Отчёт <code>README.md</code> с десятью снимками экрана, файлы <code>journal.md</code> и <code>answers.txt</code> из каталога <code>~/files-lab</code>. Снимки делаются в вашей системе; имя пользователя и даты на них будут отличаться от снимков урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria">' + ''.join(f'<li><b>{p}</b><span>{t}</span></li>' for p, t in CRITERIA) + '</ul>'
            '<p>По каждому пункту: 2 балла — результат получен и объяснён, 1 — результат без объяснения, 0 — результата нет или объяснение неверное.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + f'<p id="check-status" aria-live="polite">Отмечено 0 из {len(checks)}</p></div></section>' + homework())


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 4 · практическое занятие</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Создание, копирование, перемещение и удаление файлов, маски имён, поиск по дереву каталогов и встроенная справка. В конце — квест по разбору каталога inbox с журналом команд.</p>'
            '<a class="cover-start" href="01-katalogi-i-fayly.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План занятия</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы № 1 и терминал. Все команды выполняются от имени обычного пользователя в каталоге <code>~/files-lab</code>; права администратора (<code>sudo</code>) нужны только для установки программ и команды <code>updatedb</code>.</p>'
            '<p>Если в системе нет команд <code>tree</code> и <code>locate</code>, установите их одной командой: <code>sudo apt install tree plocate</code>.</p>'
            '<p>На занятие отводится одна пара — 90 минут: части 1–6 около 50 минут, практическая работа — 40 минут. Снимки экрана сделаны в Ubuntu 24.04.4 Live; имя пользователя, даты и размеры в вашей системе будут отличаться.</p>'
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

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0E2524"/><text x="32" y="45" text-anchor="middle" font-size="40" font-family="monospace" font-weight="700" fill="#E9A23B">*</text></svg>')

# ───────────────────────────── материалы

strip = lambda s: s.replace('<code>', '`').replace('</code>', '`').replace('<kbd>', '').replace('</kbd>', '').replace('&gt;', '>').replace('&lt;', '<')

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += '## Ответы\n\nСодержимое answers.txt:\n\n```text\n…\n```\n\n## Перед сдачей\n\n- [ ] Проверка: 12 из 12.\n- [ ] Снимки открываются.\n- [ ] journal.md заполнен.\n'
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + strip(x) + '\n' for x in c['summary']) + '\n'
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа № 3 · {TITLE}\n\nВсе задания выполняются в каталоге ~/files-lab. Перед началом:\n\n'
            '```bash\nrm -r ~/files-lab/sorted        # после проверки содержимого\nbash ~/Downloads/files-lab-setup.sh\ncp ~/Downloads/journal-template.md ~/files-lab/journal.md\ncd ~/files-lab/inbox\n```\n\n'
            '| № | Задание | Подсказка | Пункт проверки |\n|---|---|---|---|\n'
            + ''.join(f'| {i} | {strip(t)} | {strip(h)} | {n} |\n' for i, (t, h, n) in enumerate(QUEST, 1))
            + '\nЖурнал: не меньше 12 строк в ~/files-lab/journal.md (пункт 12).\n\nПроверка: `bash ~/Downloads/files-lab-check.sh`\n\n'
            '## Оценка · 10 баллов\n\n' + ''.join(f'- {p} — {t}\n' for p, t in CRITERIA)
            + '\n2 — результат получен и объяснён, 1 — результат без объяснения, 0 — нет результата.\n\n'
            '## Домашнее задание\n\nШпаргалка cheatsheet.md: 15 команд занятия; графы — команда, назначение, безопасный пример, опасный вариант и чем он опасен.\n'
            'Сдача: labs/lab03-files/ в репозитории os-linux-course, ветка lab03-files, Pull Request в main, до начала следующего занятия.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/files-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in ['files-lab-setup.sh', 'files-lab-check.sh', 'journal-template.md']:
        z.write(B / 'materials' / f, f'files-lab-kit/{f}')
    z.writestr('files-lab-kit/README.md', report)
    z.writestr('files-lab-kit/PRACTICE.md', practice)
    z.writestr('files-lab-kit/CHEATSHEET.md', cheat)

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков или описаний:', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
