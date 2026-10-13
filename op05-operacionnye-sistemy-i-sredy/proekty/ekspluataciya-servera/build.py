#!/usr/bin/env python3
# Собирает страницы «Эксплуатация Linux-сервера»: обзор с правилами работы в паре и три технических задания.
# Текст заданий — content.py, скрипты стендов и приёмки — materials/.
from pathlib import Path
import html, json, subprocess, sys
sys.dont_write_bytecode = True
from content import TZ
from hints import HINTS
from guides import REFERENCE, BASH, ERRORS, GIT, METHOD

B = Path(__file__).resolve().parent
E = html.escape
TITLE = 'Эксплуатация Linux-сервера'
FONTS = 'https://fonts.googleapis.com/css2?family=Geologica:wght@400;600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap'

CRITERIA = [('10', 'приёмка на стенде, развёрнутом заново: баллы пропорциональны числу пунктов OK'),
            ('5', 'скрипт из результата работы выполняет свою задачу на чистом стенде'),
            ('5', 'документ — матрица доступа, postmortem или акт аудита: по фактам, с командами и выводом'),
            ('4', 'паспорт сервера и журнал работ'),
            ('3', 'работа в паре: свои ветки и Pull Request, ревью напарника с замечаниями'),
            ('3', 'ответы на испытаниях при сдаче')]


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
            '<p class="sub">Три технических задания компании «Пятый склад» на администрирование Ubuntu: выкладка сервиса заявок, ночной инцидент на сервере платежей и закрытие доступа уволенного администратора. Каждое задание выполняет пара практикантов группы эксплуатации на копии сервера в своей виртуальной машине.</p></div></section>'
            '<div class="wrap page">'
            '<section><h2>Компания</h2><p>«Пятый склад» хранит товары интернет-магазинов и доставляет их покупателям: 14 складов, 600 курьеров, около 9 000 отправлений в день. Внутренние сервисы работают на серверах Ubuntu 24.04, их обслуживает группа эксплуатации ИТ-отдела. С октября в группе проходят практику практиканты колледжа: они работают парами и получают заявки из очереди группы. Изменения на рабочих серверах вносит дежурный инженер по отчёту и журналу работ пары, поэтому пара работает на копии сервера.</p>'
            '<p>В каждом ТЗ — письмо директора по ИТ, текст заявки и хронология, сотрудники и регламенты компании, требования, порядок работы, сдача и оценка. Каждое ТЗ можно скачать в PDF с подписями и актом сдачи-приёмки.</p></section>'
            f'<section><h2>Задания</h2><ol class="cards">{cards}</ol><p>Вариант паре назначает преподаватель. Номера PID, время и числа нагрузки у каждой пары свои.</p></section>'
            '<section><h2>Материалы</h2><ul class="mats">'
            '<li><a href="metodichka.html"><b>Методичка</b><span>как вести работу самостоятельно, где искать ответ, частые сообщения об ошибках, Git в паре, защита</span></a></li>'
            '<li><a href="spravochnik.html"><b>Справочник команд</b><span>команды по задачам: осмотр, поиск, диск, учётные записи, sudo, права, процессы, скрипты bash</span></a></li>'
            '<li><a href="shablony.zip" download><b>Шаблоны и каркасы</b><span>README, журнал работ, паспорт сервера, матрица доступа, postmortem, акт аудита, каркасы трёх скриптов</span></a></li>'
            '<li><a href="../../index.html"><b>Лекции курса</b><span>занятия 3–8: FHS, файлы и поиск, пользователи и sudo, права, процессы, диагностика</span></a></li></ul>'
            '<p>В каждом ТЗ есть раздел «Куда смотреть»: что изучить и чем себя проверить по каждой задаче. Готовых решений там нет.</p></section>'
            '<section><h2>Как работает пара</h2><ol class="steps">'
            '<li><b>Репозиторий.</b> Один репозиторий на пару. Его создаёт практикант 1 и добавляет напарника в Collaborators. В README — номер ТЗ, состав пары и кто за какую часть отвечает.</li>'
            '<li><b>Стенд у каждого.</b> Каждый разворачивает стенд в своей виртуальной машине и выполняет свою часть работ. Стенд можно разворачивать заново сколько угодно раз: он возвращает сервер в исходное состояние.</li>'
            '<li><b>Ветки и ревью.</b> Каждый работает в своей ветке и открывает Pull Request. Напарник проверяет его: повторяет команды на своём стенде и оставляет замечания. Слить можно после одобрения.</li>'
            '<li><b>Журнал работ.</b> <code>runbook.md</code> общий: время, кто из пары, команда, результат. Ошибки и откаты тоже записываются, по журналу должно быть понятно, как пара пришла к решению.</li>'
            '<li><b>Финальная приёмка.</b> На одной машине: стенд заново, обе части решения по скрипту или журналу, затем скрипт приёмки. Снимок с итогом — в репозиторий.</li></ol></section>'
            '<section><h2>Структура репозитория</h2>'
            + code(['README.md            номер ТЗ, состав пары, кто за что отвечает, итог приёмки', 'server-passport.md   паспорт сервера до изменений', 'runbook.md           журнал работ',
                    '…                    документ и скрипт из части 4 своего ТЗ', 'acceptance.txt       вывод скрипта приёмки после финального прогона',
                    'optional/            задачи по выбору', 'screenshots/         снимки, которые требует ТЗ']) +
            '</section>'
            f'<section><h2>Оценка · 30 баллов</h2><ul class="crit">{crit}</ul><p>27–30 баллов — 5, 23–26 — 4, 18–22 — 3, меньше 18 — работа возвращается на доработку. Задачи по выбору каждого ТЗ дают до 4 дополнительных баллов.</p>'
            '<p>Оценку получает пара, но вклад каждого виден по коммитам, Pull Request и журналу. Если работу выполнил один из пары, второй получает 0 баллов за работу в паре и отвечает по своей части отдельно.</p></section>'
            '<section><h2>Сроки и правила</h2><ul class="plain">'
            '<li>Срок — 14 календарных дней с даты выдачи, этапы — в разделе 3.3 каждого ТЗ. Сдача — пятью испытаниями в присутствии обоих практикантов.</li>'
            '<li>Стенды запускаются только в виртуальной машине: они создают и удаляют учётные записи, правила sudo, подключают разделы.</li>'
            '<li>Справка <code>man</code>, лекции курса и поиск в интернете разрешены. Нейросетью можно править текст документов. Команды и их вывод в документах — только с вашей виртуальной машины.</li>'
            '<li>Ослаблять права, чтобы служба запустилась, запрещено. Если служба не стартует, причину ищут в её сообщении и журнале.</li></ul></section>'
            '</div>')
    return shell(TITLE, body)


def tz_page(t, doc):
    """Страница ТЗ в том же порядке разделов, что и PDF: разделы собирает tz/export.mjs из того же источника."""
    meta = ''.join(f'<div><dt>{k}</dt><dd>{E(v)}</dd></div>' for k, v in doc['meta'])
    toc = [('letter', 'Обращение Заказчика'), ('s1', '1. Ситуация'), ('s2', '2. Задача'), ('s3', '3. Порядок работы'),
           ('s4', '4. Сдача и проверка'), ('hints', 'Куда смотреть'), ('appA', 'А. Пункты скрипта приёмки'), ('appB', 'Б. Выдержки из регламентов')]
    toc_html = ''.join(f'<a href="#{a}">{n}</a>' for a, n in toc)
    hints = ''
    for h, where, tools, links in HINTS[t['num']]:
        lec = ' · '.join(f'<a href="{u}">{n}</a>' for u, n in links)
        hints += f'<details class="hint"><summary>{h}</summary><p>{where}</p><p class="chk"><b>Инструменты</b>{tools}</p><p class="lec">{lec}</p></details>'
    body = (f'<section class="cover" style="--c:{doc["accent"]}"><div class="wrap"><p class="kicker">Техническое задание № {doc["code"]} · ООО «Пятый склад»</p>'
            f'<h1>{doc["title"]}</h1><p class="sub">{doc["subtitle"]}</p><dl class="meta">{meta}</dl>'
            f'<p class="cover-actions"><a class="btn" href="{doc["pdf"]}" download>Скачать ТЗ в PDF</a><span>бланк с подписями, лист согласования и акт сдачи-приёмки</span></p></div></section>'
            f'<div class="wrap page tzdoc" style="--c:{doc["accent"]}"><nav class="toc" aria-label="Содержание">{toc_html}</nav>'
            + ''.join(doc['sections'])
            + '<section class="part" id="hints"><h2>Куда смотреть</h2><p>Что изучить и чем себя проверить по каждой задаче. Сначала попробуйте разобраться сами, открывайте, когда застряли. Готовых решений здесь нет.</p>'
            + hints + '</section>'
            + ''.join(doc['appendix'])
            + '<p class="fiction">Кейс ОП.05: организация, реквизиты, сотрудники, печать и подписи вымышлены.</p></div>')
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
DOCS = json.loads(subprocess.run(['node', str(B / 'tz' / 'export.mjs')], check=True, capture_output=True, text=True).stdout)
for t in TZ:
    (B / f'{t["slug"]}.html').write_text(tz_page(t, DOCS[t['slug']]))
(B / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#161B33"/><text x="32" y="42" text-anchor="middle" font-size="24" font-family="monospace" font-weight="700" fill="#F2A65A">ТЗ</text></svg>')
missing = [s for t in TZ for s in t['stand'] if not (B / 'materials' / s).exists()]
print('Нет скриптов:', missing) if missing else print('Готово:', len(TZ), 'ТЗ')
