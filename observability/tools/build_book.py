"""Собирает статический справочник из глав tools/chapters/ и записанных данных стенда."""
from pathlib import Path
from html import escape
import csv
import importlib
import json
import re
import sys

TOOLS = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))
from kit import ROOT, p, ul, table, plural  # noqa: E402

CH = [importlib.import_module('chapters.' + f.stem).CHAPTER for f in sorted((TOOLS / 'chapters').glob('c*.py'))]

FONT = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400&family=Roboto+Mono:wght@400;500;700&display=swap'


def layout(title, body, number=None):
    prefix = '../' if number else ''
    home = prefix + 'index.html'
    nav = ''.join(f'<a href="{"" if number else "temy/"}{c["slug"]}.html"' + (' aria-current="page"' if number == i + 1 else '')
                  + f'>1.{i + 1} {c["title"]}</a>' for i, c in enumerate(CH))
    return f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#302330"><meta name="description" content="{escape(title)}. Справочник Макарова М. Н.: объяснения, измерения учебного сервиса, схемы и снимки экрана."><title>{escape(title)} · Наблюдаемость · Макаров М. Н.</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="{FONT}" rel="stylesheet"><link rel="stylesheet" href="{prefix}styles.css"><script src="{prefix}assets/experiment-data.js" defer></script><script src="{prefix}book.js" defer></script></head><body>
<a class="skip" href="#main">К содержанию</a><div class="progress" aria-hidden="true"><span></span></div>
<header class="topbar"><a class="brand" href="{home}"><b>∿</b><span>Метрики и<br>наблюдаемость</span></a><div class="top-links"><a href="{prefix}../index.html">Все дисциплины</a><a href="https://python-theory-makarov.vercel.app/" target="_blank" rel="noreferrer">Справочник Python ↗</a></div><details class="chapter-menu"><summary>Главы темы 1</summary><nav aria-label="Главы первой темы">{nav}</nav></details></header>
<div class="book"><div class="book-body"><aside class="spine" aria-hidden="true"><span>Наблюдаемость / Метрики · Логи · Трассы / Макаров М. Н.</span></aside><main class="leaf" id="main"><div class="running"><a href="{home}">Практический справочник</a><span>{'Глава 1.' + str(number) if number else 'Макаров Максим Николаевич'}</span></div>{body}<footer><a href="{home}">К оглавлению ↑</a><span>Автор: Макаров Максим Николаевич</span><a href="{prefix}SOURCES.md">Источники и снимки</a></footer></main></div></div>
<dialog id="image-dialog" aria-label="Увеличенный снимок экрана"><form method="dialog"><button aria-label="Закрыть изображение">Закрыть ×</button></form><img alt=""><p></p></dialog></body></html>'''


def selfcheck(items):
    return '<div class="selfcheck">' + ''.join(
        f'<details><summary>{q}</summary><div class="answer">{a}</div></details>' for q, a in items) + '</div>'


def render_chapter(i, c):
    body = (f'<header class="chapter-head"><span class="chapter-num">1.{i}</span><h1>{c["title"]}</h1>'
            f'<p class="lead">{c["lead"]}</p><blockquote class="quote"><p>{c["epigraph"]}</p></blockquote></header>')
    body += '<dl class="passport">' + ''.join(f'<div><dt>{dt}</dt><dd>{dd}</dd></div>' for dt, dd in c['passport']) + '</dl>'
    tail = [('mistakes', 'Частые ошибки'), ('check', 'Проверьте себя'), ('cheatsheet', 'Шпаргалка')]
    body += ('<nav class="contents" aria-label="Содержание главы"><b>В этой главе</b><ol>'
             + ''.join(f'<li><a href="#{sid}">{name}</a></li>' for sid, name, _ in c['sections'])
             + ''.join(f'<li><a href="#{sid}">{name}</a></li>' for sid, name in tail) + '</ol></nav>')
    for k, (sid, title, html) in enumerate(c['sections'], 1):
        body += f'<section id="{sid}"><h2><span class="sec">§{k}</span><span class="h2-text">{title}</span></h2>{html}</section>'
    n = len(c['sections'])
    body += (f'<section id="mistakes"><h2><span class="sec">§{n + 1}</span><span class="h2-text">Частые ошибки</span></h2>'
             + table(['Что делают', 'Что получается', 'Как правильно'], c['mistakes']) + '</section>')
    body += f'<section id="check"><h2><span class="sec">§{n + 2}</span><span class="h2-text">Проверьте себя</span></h2>{c["practice"]}{selfcheck(c["selfcheck"])}</section>'
    body += f'<section id="cheatsheet"><h2><span class="sec">§{n + 3}</span><span class="h2-text">Шпаргалка</span></h2><div class="recap">{ul(c["cheatsheet"])}</div></section>'
    body += ('<section class="references"><h3>Первоисточники</h3>'
             + ul([f'<a href="{url}" target="_blank" rel="noreferrer">{title} ↗</a>' for url, title in c['links']]) + '</section>')
    prev = f'{CH[i - 2]["slug"]}.html' if i > 1 else '../index.html'
    nxt = f'{CH[i]["slug"]}.html' if i < len(CH) else '../index.html'
    body += (f'<nav class="chapter-nav" aria-label="Переходы"><a href="{prev}">← ' + (f'Глава 1.{i - 1}' if i > 1 else 'Оглавление')
             + f'</a><a href="{nxt}">' + (f'Глава 1.{i + 1} →' if i < len(CH) else 'Всё содержание ↑') + '</a></nav>')
    (ROOT / 'temy' / f'{c["slug"]}.html').write_text(layout(c['title'], body, i))


for i, c in enumerate(CH, 1):
    render_chapter(i, c)

roadmap = [('Метрика как данные', ['Измерение, timestamp и sample', 'Имя и единица измерения', 'Labels и идентичность ряда', 'Counter: события и сбросы', 'Gauge: состояние системы', 'Histogram: распределение длительности', 'Кардинальность и стоимость детализации']), ('Сбор и хранение', ['Endpoint /metrics и формат экспозиции', 'Targets, jobs и instances', 'Scrape interval, timeout и up', 'Exporters и границы измерения', 'Service discovery', 'TSDB, retention и пропуски', 'Когда нужен Pushgateway']), ('Запросы PromQL', ['Селекторы и временные диапазоны', 'rate и increase для счётчиков', 'Агрегации и группировка', 'Доля ошибок и нулевой трафик', 'Перцентили и histogram_quantile', 'Сопоставление рядов и vector matching', 'Recording rules и проверка запросов']), ('Grafana: от вопроса к панели', ['Источник данных и первый запрос', 'Единицы, легенды и интервал', 'Time series, stat, table и heatmap', 'Переменные и повторение панелей', 'Сравнение периодов и annotations', 'Корреляция: перейти от метрики к событию', 'Дашборд расследования']), ('Python и зависимости', ['Инструментация FastAPI', 'RED: rate, errors, duration', 'PostgreSQL: соединения, ожидания и запросы', 'Redis: память, попадания и вытеснения', 'RabbitMQ: ready, unacked и throughput', 'Celery: очередь, retries и результаты', 'Процесс, хост и контейнер']), ('Алерты и надёжность', ['SLI, SLO и бюджет ошибок', 'Симптом, условие и уведомление', 'Pending, firing и for', 'Alertmanager: группировка и маршруты', 'Silence, inhibition и шум', 'Runbook и проверка восстановления', 'Тестирование правил']), ('OpenTelemetry и расследования', ['Resource, scope и semantic conventions', 'Spans, context propagation и baggage', 'HTTP и сообщения очереди', 'Collector: receivers, processors, exporters', 'Сэмплирование и потерянные данные', 'Логи и трассы: Loki и Tempo', 'Профилирование и стоимость наблюдаемости'])]

sections_total = sum(len(c['sections']) for c in CH)
body = f'''<header class="cover"><div><span class="eyebrow">Учебное издание · Python и работающий сервис</span><h1>Метрики<br>и наблюдаемость</h1><p class="cover-sub">От медленного запроса<br>к объяснённому инциденту</p><p>Как узнать, что происходит с приложением после запуска на сервере: что измерять, какие события записывать и как найти этап, на котором запрос теряет время. Главы с кодом, настоящими измерениями и снимками учебного стенда.</p><p class="author-line">Макаров Максим Николаевич</p><a class="primary" href="temy/{CH[0]["slug"]}.html">Начать первую тему →</a></div><aside class="cover-sheet"><span class="eyebrow">Один сервис / три сигнала</span><div class="cover-series"><svg viewBox="0 0 280 85" role="img" aria-label="Условный график: рост длительности запросов"><path d="M0 65H280M0 35H280" class="cover-grid"/><path d="M0 65L30 64L55 62L80 64L110 60L135 62L160 18L180 25L200 17L225 23L250 20L280 15" fill="none" stroke="currentColor" stroke-width="3"/></svg><b>МЕТРИКИ</b><p>Изменение видно в истории.</p></div><div class="cover-log"><b>ЛОГИ</b><code>event=request_completed<br>status=500 request_id=b5408f22…</code></div><div class="cover-trace"><b>ТРАССЫ</b><span style="width:100%">GET /products</span><span style="width:78%;margin-left:12%">dependency.wait</span></div><small>Условная схема; значения учебные.</small></aside></header>
<div class="cover-meta"><span>Тема 1 · {len(CH)} {plural(len(CH), 'глава', 'главы', 'глав')}</span><span>{sections_total} {plural(sections_total, 'раздел', 'раздела', 'разделов')}</span><span>Снимки учебного стенда</span><span>Запускаемый Python-проект</span></div>
<section><h2><span class="sec">I</span>Как устроен справочник</h2><p>Первая тема посвящена мониторингу, наблюдаемости и телеметрии. Мы начинаем с учебного сервиса на FastAPI и того, что разработчик теряет после его развёртывания. Затем по отдельности разбираем метрики, логи и трассы, проводим по ним расследование и смотрим, как данные собирают Prometheus и Grafana.</p><p>Каждая глава построена одинаково: объяснение по разделам, частые ошибки, вопросы для самопроверки с ответами и шпаргалка. Все числа и снимки получены на учебном стенде; архив стенда можно скачать и повторить опыт. Следующие модули показаны в содержании как план.</p><div class="reading-path"><b>Ситуация</b><span>→</span><b>Механизм</b><span>→</span><b>Измерения</b><span>→</span><b>Проверка вывода</b></div></section>
<section id="contents"><h2><span class="sec">II</span>Содержание по модулям</h2><div class="module-grid"><div class="module module-ready"><div class="module-spine">МОДУЛЬ 1 · ГОТОВ</div><div class="module-body"><h3>Мониторинг, наблюдаемость и телеметрия</h3><p>От жалобы пользователя до подтверждённой причины сбоя.</p><ol class="toc">'''
for i, c in enumerate(CH, 1):
    body += f'<li><a href="temy/{c["slug"]}.html"><b>1.{i}</b><span>{c["title"]}</span><em>читать ↗</em></a></li>'
body += f'</ol><a class="practice-link" href="temy/{CH[-1]["slug"]}.html">Практика · от жалобы к проверяемому выводу →</a></div></div>'
for i, (title, topics) in enumerate(roadmap, 2):
    body += (f'<div class="module planned"><div class="module-spine">МОДУЛЬ {i} · ПЛАН</div><div class="module-body"><h3>{title}</h3><p>Главы готовятся.</p><ol class="toc">'
             + ''.join(f'<li><span class="planned-row"><b>{i}.{j}</b><span>{t}</span></span></li>' for j, t in enumerate(topics, 1)) + '</ol></div></div>')
body += '''</div></section><section id="materials"><h2><span class="sec">III</span>Учебный проект и опорные материалы</h2><div class="downloads"><a href="assets/telemetry-lab.zip" download><b>↓ Telemetry Lab</b><span>FastAPI-сервис, скрипт эксперимента, записанный прогон и инструкция; дополнительно — стенд Prometheus и Grafana в Docker Compose.</span></a><a href="assets/investigation.md" download><b>↓ Бланк расследования</b><span>Симптом, масштаб, наблюдения, гипотеза, проверка, что не выяснено, действия.</span></a><a href="https://python-theory-makarov.vercel.app/" target="_blank" rel="noreferrer"><b>Справочник Python ↗</b><span>Функции, словари, модули, исключения и асинхронный код, которые используются в примерах.</span></a><a href="https://maximbytecamp.github.io/mongodb_theory_makarov/" target="_blank" rel="noreferrer"><b>Справочник MongoDB ↗</b><span>Работа приложения с базой данных: запросы, курсоры и типичные ошибки.</span></a></div></section><section><h2><span class="sec">IV</span>Данные и снимки экрана</h2><p>Снимки страницы стенда, Swagger, /metrics, Prometheus и Grafana сделаны на учебном стенде этого справочника. Длительности в главах 1.4–1.6 взяты из записанного прогона и совпадают с файлами в архиве. Данные кейса в главе 1.7 составлены для разбора, и это указано в самой главе.</p><p><a href="SOURCES.md">Источники и происхождение снимков</a> · <a href="lab/README.md">Как повторить опыт</a></p></section>'''
(ROOT / 'index.html').write_text(layout('Метрики и наблюдаемость', body))

# Записанные данные для интерактивных схем: сайту не нужен работающий API.
rows = list(csv.DictReader((ROOT / 'lab/results/requests.csv').open()))
for r in rows:
    for k in ('number', 'status'):
        r[k] = int(r[k])
    for k in ('client_ms', 'handler_ms'):
        r[k] = float(r[k])
events = json.loads((ROOT / 'lab/results/events.json').read_text())
slow = next(e for e in events if e['scenario'] == 'slow')
(ROOT / 'assets/experiment-data.js').write_text('window.TELEMETRY_DATA = ' + json.dumps({'requests': rows, 'slow': slow}, ensure_ascii=False) + ';\n')

# Переносы строк на границах блоков, чтобы собранный HTML можно было читать в diff.
for path in [ROOT / 'index.html', *ROOT.glob('temy/*.html')]:
    text = path.read_text()
    text = re.sub(r'(</(?:p|section|header|nav|figure|aside|table|dl|details)>|<section\b)', r'\1\n', text)
    path.write_text(text)
print(f'Built {len(CH)} chapters, {sections_total} sections and the book index')
