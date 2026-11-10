"""Собирает lekcii/index.html — оглавление книги — из карты PLAN.md.

Готовая лекция — файл lekcii/<часть>-<номер>-*.html (например 2-3-metki.html); у неё в оглавлении
ссылка, у остальных — пометка «готовится».

    python3 observability/lekcii/tools/build_index.py
"""
import html
import re
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
plan = (BOOK / 'PLAN.md').read_text(encoding='utf-8')

parts = []
for m in re.finditer(r'^### Часть (\d+)\. (.+?) · \d+ лекци\S*\n\n(.*?)\n\n(.*?)(?=\n\n|\Z)', plan, re.M | re.S):
    num, title, about, items = m.group(1), m.group(2), m.group(3), ' '.join(m.group(4).split())
    lectures = []
    for item in items.split(' · '):
        im = re.match(r'(\d+\.\d+) (.+?)(?: [★✎]+)?$', item.strip())
        if im:
            lectures.append((im.group(1), im.group(2)))
    parts.append((num, title, ' '.join(about.split()), lectures))

ready = {}
for f in BOOK.glob('*-*-*.html'):
    pm = re.match(r'(\d+)-(\d+)-', f.name)
    if pm:
        ready[f'{pm.group(1)}.{pm.group(2)}'] = f.name

total = sum(len(p[3]) for p in parts)
done = sum(1 for p in parts for n, _ in p[3] if n in ready)

def md(text):
    text = html.escape(text, quote=False)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', text)

blocks = []
for num, title, about, lectures in parts:
    rows = []
    for n, t in lectures:
        if n in ready:
            rows.append(f'        <li><a href="{ready[n]}"><span class="csec">{n}</span>{md(t)}</a></li>')
        else:
            rows.append(f'        <li class="soon"><span class="csec">{n}</span>{md(t)}<i>готовится</i></li>')
    blocks.append(f'''  <section class="toc-part" id="part-{num}">
    <h2><span class="sec">Часть {num}</span>{md(title)}</h2>
    <p class="about">{md(about)}</p>
    <ol class="toc-list">
{chr(10).join(rows)}
    </ol>
  </section>''')

page = f'''<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#F2F1E9">
  <title>Метрики и наблюдаемость · Справочник</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400&family=Pixelify+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="book">
  <div class="book__body">
    <div class="spine"><span>Метрики и наблюдаемость</span></div>
    <main class="leaf">
  <div class="running">
    <p class="eyebrow">Справочник · Макаров М. Н.</p>
    <p class="running__folio">Готово {done} из {total}</p>
  </div>

  <header class="chapter-head">
    <h1>Метрики и наблюдаемость</h1>
    <p class="lead">Как устроены метрики, логи, трассы и профили и как с ними работают Prometheus, Grafana, Alertmanager, Thanos, VictoriaMetrics, Loki, OpenTelemetry, Jaeger, Tempo, Pyroscope и инструменты Ozon Tech. Лекции идут по порядку: каждая опирается только на предыдущие.</p>
  </header>

{chr(10).join(blocks)}

  <div class="colophon">
    <span>Метрики и наблюдаемость · справочник</span>
    <span class="author-line">Автор: Макаров Максим Николаевич</span>
  </div>
    </main>
  </div>
</div>
</body>
</html>
'''
(BOOK / 'index.html').write_text(page, encoding='utf-8')
print(f'index.html: частей {len(parts)}, лекций {total}, готово {done}')
