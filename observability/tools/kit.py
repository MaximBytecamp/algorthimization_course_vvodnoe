"""Блоки, из которых собираются главы справочника. Текст глав — в tools/chapters/."""
from pathlib import Path
from html import escape
import csv
import io
import json
import keyword
import struct
import tokenize

ROOT = Path(__file__).resolve().parents[1]


def plural(number, one, few, many):
    """Согласование существительного с числом: 1 раздел, 2 раздела, 81 раздел."""
    tail, hundred = number % 10, number % 100
    if 11 <= hundred <= 14 or tail == 0 or tail >= 5:
        return many
    return one if tail == 1 else few


def lab_requests():
    """Записанный прогон: двадцать измерений из lab/results/requests.csv."""
    with (ROOT / 'lab/results/requests.csv').open(newline='') as file:
        rows = list(csv.DictReader(file))
    for row in rows:
        row['number'] = int(row['number'])
        row['status'] = int(row['status'])
        row['client_ms'] = float(row['client_ms'])
        row['handler_ms'] = float(row['handler_ms'])
    return rows


def lab_slow_event():
    """Запись о медленном запросе того же прогона: её этапы рисует водопад."""
    events = json.loads((ROOT / 'lab/results/events.json').read_text())
    return next(event for event in events if event['scenario'] == 'slow')


def p(s):
    return '<p>' + s + '</p>'


def ul(items):
    return '<ul>' + ''.join('<li>' + s + '</li>' for s in items) + '</ul>'


def ol(items):
    return '<ol>' + ''.join('<li>' + s + '</li>' for s in items) + '</ol>'


def term(name, text):
    """Определение: термин выделен, объяснение идёт сразу за ним."""
    return '<p class="definition"><strong>' + name + '</strong> — ' + text + '</p>'


def note(title, s):
    return '<aside class="margin-note"><b>' + title + '</b>' + p(s) + '</aside>'


def table(headers, rows):
    head = ''.join('<th scope="col">' + s + '</th>' for s in headers)
    body = ''.join('<tr>' + ''.join('<td>' + s + '</td>' for s in row) + '</tr>' for row in rows)
    return '<div class="table-scroll"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>'


def highlight_python(s):
    try:
        offsets = [0]
        for line in s.splitlines(keepends=True):
            offsets.append(offsets[-1] + len(line))
        out, cursor = [], 0
        for token in tokenize.generate_tokens(io.StringIO(s).readline):
            cls = {tokenize.STRING: 's', tokenize.NUMBER: 'n', tokenize.COMMENT: 'c'}.get(token.type)
            if token.type == tokenize.NAME and keyword.iskeyword(token.string):
                cls = 'k'
            if not cls:
                continue
            a = offsets[token.start[0] - 1] + token.start[1]
            b = offsets[token.end[0] - 1] + token.end[1]
            out.extend([escape(s[cursor:a]), '<span class="' + cls + '">' + escape(s[a:b]) + '</span>'])
            cursor = b
        out.append(escape(s[cursor:]))
        return ''.join(out)
    except (tokenize.TokenError, IndentationError, IndexError):
        return escape(s)


def code(s, label='Python', file=None):
    raw = s.strip('\n')
    rendered = highlight_python(raw) if label.startswith('Python') else escape(raw)
    link = '<a download href="../lab/' + file + '">Файл целиком ↓</a>' if file else ''
    return ('<figure class="code"><figcaption><span>' + label + '</span>' + link + '</figcaption>'
            '<pre><code>' + rendered + '</code></pre></figure>')


def output(s, label='Вывод в терминале'):
    return '<figure class="code code-output"><figcaption><span>' + label + '</span></figcaption><pre><code>' + escape(s.strip('\n')) + '</code></pre></figure>'


def _png_size(name):
    with open(ROOT / 'shots' / (name + '.png'), 'rb') as f:
        header = f.read(24)
    return struct.unpack('>II', header[16:24])


# Номер рисунка ставит сборка: знак заменяется на «1.4.2» по порядку внутри главы.
FIG = '¤'


def fig_title(title):
    return '<b class="fig-title"><span class="fig-no">Рис. ' + FIG + '</span> ' + title + '</b>'


def shot(name, title, caption, pins=()):
    """Снимок экрана. pins — метки поверх снимка: (x %, y %, заголовок, пояснение);
    под снимком они повторяются нумерованным списком, поэтому читаются и без картинки."""
    width, height = _png_size(name)
    marks = ''.join(f'<span class="pin" style="left:{x}%;top:{y}%">{i}</span>' for i, (x, y, _, _) in enumerate(pins, 1))
    legend = ('<ol class="pin-legend">' + ''.join(f'<li><b>{head}.</b> {text}</li>' for _, _, head, text in pins) + '</ol>') if pins else ''
    return (f'<figure class="evidence"><button class="zoom" data-image="../shots/{name}.png" aria-label="Увеличить: {title}">'
            f'<span class="shot-frame"><img src="../shots/{name}.png" alt="{title}" loading="lazy" width="{width}" height="{height}">'
            f'<span class="pins" aria-hidden="true">{marks}</span></span></button>'
            f'<figcaption>{fig_title(title)}{caption}{legend}'
            f'<a href="../shots/{name}.png" target="_blank" rel="noreferrer">Открыть в полном размере ↗</a></figcaption></figure>')


def example(title, body):
    """Разобранный пример: условие и решение видны сразу, без вопроса к читателю."""
    return '<div class="example"><span class="eyebrow">Пример</span><h3>' + title + '</h3>' + body + '</div>'


def diagram(title, caption, svg):
    """Схема, нарисованная в SVG: подпись читается и без изображения."""
    return ('<figure class="diagram"><div class="diagram-scroll" tabindex="0" role="group" aria-label="Схема · ' + title + '">'
            + svg + '</div><figcaption>' + fig_title(title) + p(caption) + '</figcaption></figure>')


def widget(html, title, caption):
    """Интерактивная схема с номером рисунка и подписью: что на ней показано и как ею пользоваться."""
    return '<figure class="widget-figure">' + html + '<figcaption>' + fig_title(title) + p(caption) + '</figcaption></figure>'


def steps(items):
    """Нумерованные шаги с крупными номерами: (заголовок, пояснение)."""
    return '<ol class="steps">' + ''.join('<li><b>' + head + '</b>' + p(text) + '</li>' for head, text in items) + '</ol>'


def flow(items, caption=''):
    """Цепочка этапов слева направо: (название, короткая подпись)."""
    cells = '<i aria-hidden="true">→</i>'.join('<div><b>' + head + '</b><span>' + sub + '</span></div>' for head, sub in items)
    return '<div class="flow">' + cells + '</div>' + (('<p class="flow-note">' + caption + '</p>') if caption else '')


def cards(items, columns=None):
    """Карточки понятий: (метка, заголовок, текст). Цвет метки меняется по порядку."""
    style = f' style="--cols:{columns}"' if columns else ''
    return (f'<div class="cards"{style}>' + ''.join('<div class="card"><span class="card-tag">' + tag + '</span><h4>' + head + '</h4>' + p(text) + '</div>'
                                                  for tag, head, text in items) + '</div>')


def compare(left, right):
    """Две колонки рядом: (метка, заголовок, html, вид), вид — bad, good или plain."""
    def col(tag, head, html, kind):
        return f'<div class="compare-col {kind}"><span class="compare-tag">{tag}</span><h4>{head}</h4>{html}</div>'
    return '<div class="compare">' + col(*left) + col(*right) + '</div>'


def formula(expr, parts, result=''):
    """Расчёт крупно и расшифровка каждой части. expr — строка с формулой, parts — (обозначение, смысл)."""
    legend = ''.join('<div><dt>' + a + '</dt><dd>' + b + '</dd></div>' for a, b in parts)
    tail = ('<p class="formula-result">' + result + '</p>') if result else ''
    return '<div class="formula"><div class="formula-expr">' + expr + '</div><dl>' + legend + '</dl>' + tail + '</div>'


def stats(items):
    """Плитки с числами: (значение, подпись, пояснение)."""
    return '<div class="stats">' + ''.join('<div><b>' + value + '</b><span>' + label + '</span><em>' + note + '</em></div>'
                                           for value, label, note in items) + '</div>'


def meter(rows, caption=''):
    """Горизонтальные полосы долей: (подпись, процент от 0 до 100, текст справа)."""
    body = ''.join(f'<div class="meter-row"><span>{label}</span><div class="meter-track"><div style="width:{pct}%"></div></div><b>{value}</b></div>'
                   for label, pct, value in rows)
    return '<div class="meter">' + body + (('<p class="flow-note">' + caption + '</p>') if caption else '') + '</div>'


def warn(title, s):
    """Предупреждение: то, на чём чаще всего ошибаются."""
    return '<aside class="margin-note warn"><b>' + title + '</b>' + p(s) + '</aside>'


def source(url, title):
    return '<p class="source">Первоисточник: <a href="' + url + '" target="_blank" rel="noreferrer">' + title + ' ↗</a></p>'


def chapter(slug, title, lead, epigraph, passport, sections, mistakes, selfcheck, cheatsheet, links, practice=''):
    """epigraph — короткая мысль главы в шапке; practice — упражнение перед «Проверьте себя»."""
    return dict(slug=slug, title=title, lead=lead, epigraph=epigraph, passport=passport, sections=sections,
                mistakes=mistakes, selfcheck=selfcheck, cheatsheet=cheatsheet, links=links, practice=practice)
