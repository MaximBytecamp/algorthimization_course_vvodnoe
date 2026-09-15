#!/usr/bin/env python3
# Собирает страницы урока «Файловая система Linux» и материалы. Текст — text_01…08.py, блоки — render.py.
from pathlib import Path
import html, sys, zipfile
sys.dont_write_bytecode = True
from content import CHAPTERS
from render import blocks_html, counters, missing

B = Path(__file__).resolve().parent
E = html.escape
N = len(CHAPTERS)
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
TITLE = 'Файловая система Linux'


def nav(current=0):
    cells = ''
    for i, c in enumerate(CHAPTERS, 1):
        cur = ' aria-current="page"' if i == current else ''
        cells += f'<a href="{c["slug"]}.html" style="--c:{c["color"]}" data-layer="{i}" title="Часть {i} · {c["layer"]}"{cur}><span>{i}</span></a>'
    return f'<nav class="gauge" aria-label="Части урока">{cells}</nav>'


def sources():
    return ('<details class="sources"><summary>Источники и снимки экрана</summary><p>'
            '<a href="https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html">Linux Foundation · FHS 3.0</a> · <a href="https://man7.org/linux/man-pages/man7/hier.7.html">hier(7)</a> · '
            '<a href="https://www.gnu.org/software/bash/manual/html_node/Command-Search-and-Execution.html">GNU Bash · поиск команд</a> · '
            '<a href="https://docs.kernel.org/filesystems/proc.html">Ядро Linux · proc</a> · <a href="https://docs.kernel.org/filesystems/sysfs.html">sysfs</a> · <a href="https://docs.kernel.org/filesystems/tmpfs.html">tmpfs</a> · '
            '<a href="https://man7.org/linux/man-pages/man8/findmnt.8.html">findmnt</a> · <a href="https://man7.org/linux/man-pages/man7/inode.7.html">inode(7)</a></p>'
            '<p>Снимки сделаны в виртуальной машине VirtualBox 7.2: Ubuntu 24.04.4 Desktop ARM64, Live-сессия, Bash. <a href="shots/SOURCES.md">Команды для каждого снимка</a>.</p></details>')


def shell(title, content, current=0, color='#2B1A2D'):
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="theme-color" content="#1E0E1C"><meta name="description" content="Лекция о файловой системе Linux: дерево каталогов, стандарт FHS, программы, изменяемые данные, /proc и /sys, inode, ссылки и монтирование.">'
            f'<title>{E(title)} · {TITLE} · ОП.05</title><link rel="icon" href="favicon.svg" type="image/svg+xml">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="{FONTS}">'
            f'<link rel="stylesheet" href="lesson.css"><script src="lesson.js" defer></script></head>'
            f'<body data-layer="{current}" style="--c:{color}"><a class="skip" href="#main">К содержанию</a>'
            f'<header class="topbar"><a class="brand" href="../../index.html" title="К дисциплине"><span>ОП.05</span></a><a class="lesson-name" href="index.html"><b>{TITLE}</b><small>занятие 3</small></a>'
            f'{nav(current)}<a class="topbar-mat" href="index.html#materials">Материалы</a></header>'
            f'<main id="main">{content}</main>'
            f'<footer class="site-foot"><div class="wrap">{sources()}<p class="credits"><span>ОП.05 · Операционные системы и среды</span><span>Макаров Максим Николаевич</span></p></div></footer>'
            '<dialog id="image-dialog" aria-label="Снимок крупным планом"><button id="close-image" type="button">Закрыть ×</button><img alt=""><p></p><a id="original-image" target="_blank" rel="noopener">Открыть в отдельной вкладке ↗</a></dialog>'
            '<div id="toast" role="status" aria-live="polite"></div></body></html>')


def materials():
    return ('<section id="materials" class="materials"><h2>Материалы</h2><div class="downloads">'
            '<a href="materials/linux-fhs-lab.zip" download><b>Стартовый набор</b><span>шаблон отчёта, задание и памятка</span></a>'
            '<a href="materials/report-template.md" download><b>Шаблон отчёта</b><span>README.md с разделами для 13 снимков</span></a>'
            '<a href="materials/cheatsheet.md" download><b>Памятка</b><span>каталоги и команды</span></a>'
            '<a href="materials/practice.md" download><b>Задание</b><span>практическая работа и критерии</span></a></div></section>')


ASSIGN = [('01-root.png', 'Корневой каталог', 'pwd, ls -lah /', 'Что такое корневой каталог, чем абсолютный путь отличается от относительного.'),
          ('02-home.png', 'Домашний каталог', 'cd ~, pwd, ls -a', 'Где находится домашний каталог, что такое скрытые файлы.'),
          ('03-system.png', 'Каталог /etc', 'cat /etc/os-release; getent passwd', 'Версия системы, UID, домашний каталог и оболочка.'),
          ('04-programs.png', 'Программы и PATH', 'command -v, type, echo $PATH', 'Как оболочка находит программу.'),
          ('05-var.png', 'Изменяемые данные', 'ls /var; findmnt -T /run', 'Назначение /var/lib, /var/log, /var/cache и /run.'),
          ('06-dev.png', 'Устройства', 'ls -l /dev/null; echo $?', 'Тип устройства и код завершения.'),
          ('07-proc.png', 'Файлы /proc', 'cat /proc/uptime; cp; sleep 5', 'Почему копия не меняется.'),
          ('08-sys.png', 'Сетевые интерфейсы', 'ls /sys/class/net', 'Какие интерфейсы есть в системе.'),
          ('09-links.png', 'inode и ссылки', 'ls -li; rm data/info.txt; cat info-link.txt', 'Чем жёсткая ссылка отличается от символической.'),
          ('10-space.png', 'Место на диске', 'findmnt /; df -h .; du -sh data', 'Чем df отличается от du.'),
          ('11-mount-before.png', 'Монтирование tmpfs', 'findmnt -T mount-demo', 'Почему before.txt перестал быть виден.'),
          ('12-mount-after.png', 'Отключение tmpfs', 'cat mount-demo/before.txt', 'Что стало с inside.txt.'),
          ('13-model.png', 'Файлы shop-api', 'find model-root -type f', 'Почему выбран каждый каталог.')]


def deliver():
    rows = ''.join(f'<tr><td><code>{x[0]}</code></td><td>{x[1]}</td><td>{x[3]}</td></tr>' for x in ASSIGN)
    checks = ['В README записаны мои результаты и выводы', 'Все снимки открываются из README', 'Ссылки и структура shop-api созданы', 'tmpfs отключена или ошибка описана', 'Итоговая задача выполнена, работа сохранена на внешнем носителе']
    return ('<section id="submission" class="submission"><h2>Что сдать</h2><p>Каталог <code>linux-fhs-lab</code> с заполненным README.md и 13 снимками экрана. Если команду mount выполнить не удалось из-за прав, приложите текст ошибки и разбор опыта по снимкам урока.</p>'
            f'<div class="tbl"><table><thead><tr><th>Снимок</th><th>Тема</th><th>Что написать под снимком</th></tr></thead><tbody>{rows}</tbody></table></div>'
            '<h3>Критерии оценки · 10 баллов</h3><ul class="criteria"><li><b>2</b> дерево каталогов, домашний каталог, /etc и учётная запись</li><li><b>2</b> программы и PATH, /var и /run, размещение shop-api</li>'
            '<li><b>2</b> /dev, /proc и /sys</li><li><b>2</b> типы файлов, inode, жёсткие и символические ссылки</li><li><b>2</b> findmnt, df, du и опыт с tmpfs</li></ul>'
            '<p>По каждому пункту: 2 балла — есть результат и вывод, 1 — результат без вывода, 0 — нет результата или вывод неверный.</p>'
            '<h3>Итоговая задача</h3><p>Служба shop-api установлена в систему. Проверьте её пути и для каждой строки укажите: оставить путь или заменить, правильный путь и из какой части урока это следует. В настоящей системе ничего не перемещайте.</p>'
            '<pre class="paths">/home/admin/shop.log\n/usr/bin/config.json\n/tmp/database.db\n/etc/shop-api/app.conf\n/var/log/shop-api/access.log\n/var/lib/shop-api/database.db</pre>'
            '<h3>Домашнее задание</h3><p>Составьте таблицу каталогов для службы резервного копирования <code>backup-agent</code>: программа, настройки, журнал, список сделанных копий и номер процесса. Для каждого файла укажите каталог и основание. Сами резервные копии храните на постоянном носителе.</p>'
            '<div class="checklist"><h3>Перед сдачей</h3>' + ''.join(f'<label><input type="checkbox" data-check="{i}">{s}</label>' for i, s in enumerate(checks))
            + '<p id="check-status" aria-live="polite">Отмечено 0 из 5</p></div></section>')


def cover():
    parts = ''.join(f'<li style="--c:{c["color"]}"><a href="{c["slug"]}.html"><span class="st-n">{i}</span><b>{c["title"]}</b><p>{c["lead"]}</p></a></li>' for i, c in enumerate(CHAPTERS, 1))
    return ('<section class="cover"><div class="wrap cover-in"><p class="kicker">ОП.05 · Операционные системы и среды · занятие 3</p>'
            f'<h1>{TITLE}</h1><p class="cover-sub">Устройство дерева каталогов, стандарт FHS, размещение программ и данных, файлы устройств и ядра, inode, ссылки и монтирование.</p>'
            '<a class="cover-start" href="01-adres.html">Часть 1 →</a></div></section>'
            '<div class="wrap page">'
            f'<section><h2>План лекции</h2><ol class="strata-list">{parts}</ol></section>'
            '<section class="before"><h2>Подготовка</h2><p>Для работы нужна Ubuntu из практической работы №1 и терминал. Примеры выполняются от имени обычного пользователя в каталоге <code>~/linux-fhs-lab</code>; права администратора (<code>sudo</code>) понадобятся один раз, в части 7. На занятие отводится две пары по 90 минут.</p>'
            '<p>Снимки экрана сделаны в Ubuntu 24.04.4 Live. Имя пользователя, номера процессов и inode в вашей системе будут отличаться.</p>'
            '<p>Каждая часть построена одинаково: объяснение, команды для выполнения в терминале, снимок с результатом и итог части.</p></section>'
            f'{materials()}</div>')


for old in ['book.css', 'book.js', 'map.json', 'content.json']:
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
    if i < N:
        nx = CHAPTERS[i]
        body += f'<a class="next" href="{nx["slug"]}.html" style="--c:{nx["color"]}"><span>Часть {i + 1}</span><b>{nx["title"]}</b></a>'
    else:
        body += '<a class="next next--top" href="index.html"><span>Лекция завершена</span><b>К содержанию</b></a>'
    body += '</div>'
    (B / f'{c["slug"]}.html').write_text(shell(f'{i}. {c["layer"]}', body, i, c['color']))

(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2C0B26"/><text x="32" y="46" text-anchor="middle" font-size="44" font-family="monospace" font-weight="700" fill="#F0A45A">/</text></svg>')

# ───────────────────────────── материалы

report = f'# {TITLE} · отчёт\n\nФИО: …\nГруппа: …\nДата: …\nСреда: установленная Ubuntu / Live (указать)\n\n'
for name, title, cmd, q in ASSIGN:
    report += f'## {title}\n\nКоманды:\n\n```bash\n{cmd}\n```\n\n![{title}](screenshots/{name})\n\nРезультат: …\n\n{q}\n\nВывод: …\n\n'
report += ('## Размещение shop-api\n\n| Файл | Каталог | Основание |\n|---|---|---|\n| Исполняемый файл | … | … |\n| Настройки | … | … |\n| База данных | … | … |\n| Журнал | … | … |\n| Номер процесса | … | … |\n\n'
           '## Итоговая задача\n\nДля каждого из шести путей: оставить / заменить, правильный путь, основание.\n\n'
           '## Перед сдачей\n\n- [ ] tmpfs отключена или ошибка описана.\n- [ ] Снимки открываются.\n- [ ] Результаты получены в моей системе.\n- [ ] Работа сохранена на внешнем носителе.\n')
(B / 'materials/report-template.md').write_text(report)

cheat = f'# {TITLE} · памятка\n\n'
for i, c in enumerate(CHAPTERS, 1):
    cheat += f'## {i}. {c["title"]}\n\n' + ''.join('- ' + x.replace('<code>', '`').replace('</code>', '`') + '\n' for x in c['summary']) + '\n'
cheat += ('## Команды\n\n- `pwd`, `cd`, `ls -lah` — текущий каталог, переход, содержимое.\n- `command -v`, `type` — как оболочка разрешает имя команды.\n'
          '- `readlink -f` — цель символической ссылки.\n- `file` — тип содержимого файла.\n- `stat`, `ls -li` — сведения из inode.\n'
          '- `ln файл имя` — жёсткая ссылка; `ln -s цель ссылка` — символическая.\n- `findmnt -T путь` — файловая система, содержащая путь.\n'
          '- `lsblk` — диски и разделы; `df -h .` — место на файловой системе; `du -sh каталог` — место, занятое каталогом.\n- `dpkg -L пакет` — файлы пакета.\n')
(B / 'materials/cheatsheet.md').write_text(cheat)

practice = (f'# Практическая работа · {TITLE}\n\nВыполните примеры частей 1–7 в каталоге ~/linux-fhs-lab, заполните report-template.md и сохраните его как README.md.\nСнимки сохраните в каталог screenshots.\n\n'
            + ''.join(f'{i}. **{x[1]}** — `{x[0]}`. {x[3]}\n' for i, x in enumerate(ASSIGN, 1))
            + '\n## Итоговая задача\n\nСлужба shop-api хранит файлы:\n\n```text\n/home/admin/shop.log\n/usr/bin/config.json\n/tmp/database.db\n/etc/shop-api/app.conf\n/var/log/shop-api/access.log\n/var/lib/shop-api/database.db\n```\n\n'
            'Для каждого пути укажите: оставить или заменить, правильный путь, основание. В настоящей системе ничего не перемещайте.\n\n'
            '## Оценка · 10 баллов\n\nПо 2 балла: дерево каталогов и /etc; программы, /var и shop-api; /dev, /proc и /sys; inode и ссылки; монтирование.\n'
            '2 — результат и вывод, 1 — результат без вывода, 0 — нет результата или вывод неверный.\n\n'
            '## Домашнее задание\n\nСоставьте таблицу каталогов для службы backup-agent: программа, настройки, журнал, список копий, номер процесса.\n')
(B / 'materials/practice.md').write_text(practice)

with zipfile.ZipFile(B / 'materials/linux-fhs-lab.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('linux-fhs-lab/README.md', report)
    z.writestr('linux-fhs-lab/PRACTICE.md', practice)
    z.writestr('linux-fhs-lab/CHEATSHEET.md', cheat)
    for d in ['screenshots', 'config', 'data', 'logs', 'tmp']:
        z.writestr(f'linux-fhs-lab/{d}/', '')

from explain import UNKNOWN
if UNKNOWN:
    print('Нет объяснения для частей команд:\n  ' + '\n  '.join(sorted(set(UNKNOWN))))
if missing:
    print('Нет снимков (блоки пропущены):', ', '.join(sorted(set(missing))))
print('Готово:', N, 'частей')
