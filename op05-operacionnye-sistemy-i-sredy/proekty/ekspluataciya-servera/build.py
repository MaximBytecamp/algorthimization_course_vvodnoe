#!/usr/bin/env python3
# Собирает страницы «Эксплуатация Linux-сервера»: обзор с правилами работы в паре и три технических задания.
# Текст заданий — content.py, скрипты стендов и приёмки — materials/.
from pathlib import Path
import html, sys
sys.dont_write_bytecode = True
from content import TZ
from hints import HINTS
from guides import REFERENCE, BASH, ERRORS, GIT, METHOD

B = Path(__file__).resolve().parent
E = html.escape
TITLE = 'Эксплуатация Linux-сервера'
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
BASE = 'https://algorthimization-course-vvodnoe.vercel.app/op05-operacionnye-sistemy-i-sredy/proekty/ekspluataciya-servera/materials'

CRITERIA = [('4', 'приёмка: скрипт приёмки выводит все пункты OK на стенде, развёрнутом заново'),
            ('2', 'повторяемость: скрипт из результата работы воспроизводит решение или выполняет свою задачу на чистом стенде'),
            ('2', 'документ — матрица доступа, postmortem или акт аудита: по фактам, с командами и выводом'),
            ('2', 'работа в паре: у каждого свои коммиты и Pull Request, ревью напарника с замечаниями, журнал работ с авторством')]


def shell(title, body, current=''):
    items = [(t['slug'], f'ТЗ {t["num"]}', t['color']) for t in TZ] + [('spravochnik', 'Команды', '#1F6F68'), ('metodichka', 'Методичка', '#8C2F4E')]
    nav = ''.join(f'<a href="{slug}.html"{" aria-current=\"page\"" if slug == current else ""} style="--c:{c}">{label}</a>' for slug, label, c in items)
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)} · ОП.05</title><meta name="description" content="Три технических задания по администрированию Linux для работы в паре: выкладка сервиса, инцидент с диском и процессами, закрытие доступа уволенного администратора.">'
            f'<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link rel="stylesheet" href="{FONTS}"><link rel="stylesheet" href="style.css"></head><body>'
            f'<header class="topbar"><a class="brand" href="../../index.html" title="К дисциплине">ОП.05</a><a class="name" href="index.html">{TITLE}</a><nav>{nav}</nav></header>'
            f'<main>{body}</main><footer class="foot"><div class="wrap"><span>ОП.05 · Операционные системы и среды</span><span>Макаров Максим Николаевич</span></div></footer>'
            '<script>document.querySelectorAll(".print").forEach(b=>b.addEventListener("click",()=>window.print()));'
            'document.querySelectorAll(".copy").forEach(b=>b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Скопировано";setTimeout(()=>b.textContent="Копировать",1500)}catch{b.textContent="Выделите и скопируйте вручную"}}));</script>'
            '</body></html>')


def code(lines):
    text = '\n'.join(lines)
    return f'<div class="term"><button class="copy" type="button" data-copy="{E(text)}">Копировать</button><pre>{E(text)}</pre></div>'


def index():
    cards = ''.join(f'<li style="--c:{t["color"]}"><a href="{t["slug"]}.html"><span class="num">ТЗ {t["num"]}</span><b>{t["title"]}</b><p>{t["short"]}</p>'
                    f'<span class="tags">{"".join(f"<i>{x}</i>" for x in t["topics"])}</span></a></li>' for t in TZ)
    crit = ''.join(f'<li><b>{p}</b><span>{x}</span></li>' for p, x in CRITERIA)
    body = (f'<section class="cover"><div class="wrap"><p class="kicker">ОП.05 · работа в паре · темы 1–8</p><h1>{TITLE}</h1>'
            '<p class="sub">Три технических задания на администрирование Ubuntu: выкладка сервиса, ночной инцидент на сервере платежей и закрытие доступа уволенного администратора. Каждое задание выполняет пара инженеров на копии сервера, развёрнутой в своей виртуальной машине.</p></div></section>'
            '<div class="wrap page">'
            f'<section><h2>Задания</h2><ol class="cards">{cards}</ol><p>Вариант паре назначает преподаватель. Номера PID, время и числа нагрузки у каждой пары свои.</p></section>'
            '<section><h2>Материалы</h2><ul class="mats">'
            '<li><a href="metodichka.html"><b>Методичка</b><span>как вести работу самостоятельно, где искать ответ, частые сообщения об ошибках, Git в паре, защита</span></a></li>'
            '<li><a href="spravochnik.html"><b>Справочник команд</b><span>команды по задачам: осмотр, поиск, диск, учётные записи, sudo, права, процессы, скрипты bash</span></a></li>'
            '<li><a href="shablony.zip" download><b>Шаблоны и каркасы</b><span>README, журнал работ, матрица доступа, postmortem, акт аудита, каркасы трёх скриптов</span></a></li>'
            '<li><a href="../../index.html"><b>Лекции курса</b><span>занятия 3–8: FHS, файлы и поиск, пользователи и sudo, права, процессы, диагностика</span></a></li></ul>'
            '<p>В каждом ТЗ есть раздел «Куда смотреть»: что изучить и чем себя проверить по каждой задаче. Готовых решений там нет.</p></section>'
            '<section><h2>Как работает пара</h2><ol class="steps">'
            '<li><b>Репозиторий.</b> Один репозиторий на пару. Его создаёт инженер 1 и добавляет напарника в Collaborators. В README — номер ТЗ, состав пары и кто за какую часть отвечает.</li>'
            '<li><b>Стенд у каждого.</b> Каждый разворачивает стенд в своей виртуальной машине и выполняет свою часть работ. Стенд можно разворачивать заново сколько угодно раз: он возвращает сервер в исходное состояние.</li>'
            '<li><b>Ветки и ревью.</b> Каждый работает в своей ветке и открывает Pull Request. Напарник проверяет его: повторяет команды на своём стенде и оставляет замечания. Слить можно после одобрения.</li>'
            '<li><b>Журнал работ.</b> <code>runbook.md</code> общий: время, кто из пары, команда, результат. Ошибки и откаты тоже записываются, по журналу должно быть понятно, как пара пришла к решению.</li>'
            '<li><b>Финальная приёмка.</b> На одной машине: стенд заново, обе части решения по скрипту или журналу, затем скрипт приёмки. Снимок с итогом — в репозиторий.</li></ol></section>'
            '<section><h2>Структура репозитория</h2>'
            + code(['README.md          номер ТЗ, состав пары, кто за что отвечает', 'runbook.md         журнал работ', 'acceptance.txt     вывод скрипта приёмки после финального прогона',
                    'screenshots/       снимки, которые требует ТЗ', '…                  документ и скрипт из раздела «Результат работы» своего ТЗ']) +
            '</section>'
            f'<section><h2>Оценка · 10 баллов</h2><ul class="crit">{crit}</ul>'
            '<p>Оценку получает пара, но вклад каждого виден по коммитам, Pull Request и журналу. Если работу выполнил один из пары, второй получает 0 за пункт «работа в паре» и отвечает по своей части устно.</p></section>'
            '<section><h2>Сроки и правила</h2><ul class="plain">'
            '<li>Две пары на работу в аудитории. Pull Request с итогом — до начала следующего занятия.</li>'
            '<li>Стенды запускаются только в виртуальной машине: они создают и удаляют учётные записи, правила sudo, подключают разделы.</li>'
            '<li>Справка <code>man</code>, лекции курса и поиск в интернете разрешены. Нейросеть можно попросить причесать текст документа; команды и их вывод — только из вашей машины.</li>'
            '<li>Ослабить права, чтобы «заработало», — не решение. Если служба не стартует, причину ищут в её сообщении и журнале.</li></ul></section>'
            '</div>')
    return shell(TITLE, body)


def tz_page(t):
    meta = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in t['meta'])
    ctx = ''.join(f'<p>{p}</p>' for p in t['context'])
    stand, acc = t['stand']
    comp = ''.join(f'<tr><td><code>{a}</code></td><td>{b}</td></tr>' for a, b in t['release'])
    comp_head = 'Состав релиза' if t['num'] == 1 else 'Что есть на сервере'
    req = ''
    for i, (g, items) in enumerate(t['groups'], 1):
        req += f'<h3>{i}. {g}</h3><ol class="req">' + ''.join(f'<li><span>{i}.{j}</span><div>{x}</div></li>' for j, x in enumerate(items, 1)) + '</ol>'
    matrix = ''
    if t['matrix']:
        head, rows = t['matrix']
        matrix = ('<h3>Матрица доступа</h3><div class="tbl"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr></thead><tbody>'
                  + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>'
                  '<p>Запуск программ из <code>/usr/local/bin</code> разрешён всем. root в матрице не указан: для его процессов права не проверяются.</p>')
    hints = ''
    for h, where, tools, links in HINTS[t['num']]:
        lec = ' · '.join(f'<a href="{u}">{n}</a>' for u, n in links)
        hints += f'<details class="hint"><summary>{h}</summary><p>{where}</p><p class="chk"><b>Инструменты</b>{tools}</p><p class="lec">{lec}</p></details>'
    split = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in t['split'])
    deliver = ''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a, b in t['deliver'])
    body = (f'<section class="cover" style="--c:{t["color"]}"><div class="wrap"><p class="kicker">Техническое задание № {t["num"]}</p><h1>{t["title"]}</h1>'
            f'<dl class="meta">{meta}</dl></div></section><div class="wrap page">'
            f'<section><h2>1. Задача</h2>{ctx}</section>'
            f'<section><h2>2. Стенд</h2><p>Копия сервера разворачивается в вашей виртуальной машине. Скачайте скрипты стенда и приёмки и разверните стенд:</p>'
            + code([f'cd ~/Downloads', f'wget {BASE}/{stand}', f'wget {BASE}/{acc}', f'sudo bash {stand}']) +
            f'<p>{t["stand_note"]}</p><h3>{comp_head}</h3><div class="tbl"><table><tbody>{comp}</tbody></table></div></section>'
            f'<section><h2>3. Требования</h2>{req}{matrix}</section>'
            f'<section><h2>4. Распределение работ в паре</h2><ul class="split">{split}</ul></section>'
            f'<section><h2>5. Результат работы</h2><p>В репозитории пары, кроме общих файлов:</p><div class="tbl"><table><tbody>{deliver}</tbody></table></div></section>'
            f'<section><h2>6. Приёмка</h2><p>Скрипт приёмки ничего не меняет, только проверяет сервер и печатает OK или FAIL по каждому пункту. Работа принята, когда на стенде, развёрнутом заново, после вашего решения все пункты OK. Требования, которые скрипт проверить не может, проверяет преподаватель по документам.</p>'
            + code([f'sudo bash ~/Downloads/{acc} | tee acceptance.txt']) +
            '<p>Пункт FAIL — это подсказка, какое требование не выполнено. Подгонять сервер под скрипт в обход требований нельзя: при защите пара объясняет каждое действие из журнала.</p>'
            '</section>'
            f'<section><h2>7. Куда смотреть</h2><p>Что изучить и чем себя проверить по каждой задаче. Сначала попробуйте разобраться сами, открывайте, когда застряли.</p>{hints}'
            '<p>Справочник команд, методичка и шаблоны — в разделе «Материалы» на <a href="index.html">главной странице</a>.</p>'
            '<button class="print" type="button">Скачать ТЗ в PDF</button></section></div>')
    return shell(f'ТЗ {t["num"]} · {t["title"]}', body, t['slug'])


def table(head, rows):
    return ('<div class="tbl stack"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>')


def cover(kicker, title, sub, color):
    return f'<section class="cover" style="--c:{color}"><div class="wrap"><p class="kicker">{kicker}</p><h1>{title}</h1><p class="sub">{sub}</p></div></section>'


def reference():
    secs = ''.join(f'<section><h2>{title}</h2>' + table(['Задача', 'Команда', 'Пояснение'], [[a, f'<code>{E(c)}</code>', n] for a, c, n in rows]) + '</section>'
                   for title, rows in REFERENCE)
    bash = ('<section><h2>Скрипты bash</h2><p>Скрипт — команды, записанные в файл по порядку. Запуск: <code>sudo bash script.sh</code>. '
            'Скрипт эксплуатации должен выдерживать повторный запуск: шаг, который уже выполнен, не ломает работу.</p>'
            + table(['Конструкция', 'Пример', 'Что делает'], [[a, f'<code>{E(c)}</code>', n] for a, c, n in BASH]) + '</section>')
    body = (cover('Материалы · эксплуатация Linux-сервера', 'Справочник команд',
                  'Команды по задачам, которые встречаются в работе с сервером. Слова на русском и заглавными буквами — места для своих имён и путей. Подробности о любой команде — <code>man команда</code>.', '#1F6F68')
            + f'<div class="wrap page">{secs}{bash}</div>')
    return shell('Справочник команд', body, 'spravochnik')


def method():
    errs = table(['Сообщение', 'Что значит', 'С чего начать'], [[f'<code>{E(a)}</code>', b, c] for a, b, c in ERRORS])
    body = (cover('Материалы · эксплуатация Linux-сервера', 'Методичка',
                  'Как вести работу по ТЗ самостоятельно: с чего начать, где искать ответ, как не сломать сервер, как работать в паре через Git и как защитить работу.', '#8C2F4E')
            + '<div class="wrap page">' + METHOD['before'] + METHOD['order'] + METHOD['where'] + METHOD['habits']
            + f'<section><h2>Частые сообщения</h2>{errs}</section>'
            + '<section><h2>Git в паре</h2>' + METHOD['git_intro'] + code(GIT) + METHOD['git_after'] + '</section>'
            + METHOD['defense'] + '</div>')
    return shell('Методичка', body, 'metodichka')


(B / 'index.html').write_text(index())
(B / 'spravochnik.html').write_text(reference())
(B / 'metodichka.html').write_text(method())
for t in TZ:
    (B / f'{t["slug"]}.html').write_text(tz_page(t))
(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="42" text-anchor="middle" font-size="24" font-family="monospace" font-weight="700" fill="#F2A65A">ТЗ</text></svg>')
missing = [s for t in TZ for s in t['stand'] if not (B / 'materials' / s).exists()]
print('Нет скриптов:', missing) if missing else print('Готово:', len(TZ), 'ТЗ')
