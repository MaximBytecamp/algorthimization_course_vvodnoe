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


def shot(name, title, caption):
    width, height = _png_size(name)
    return (f'<figure class="evidence"><button class="zoom" data-image="../shots/{name}.png" aria-label="Увеличить: {title}">'
            f'<img src="../shots/{name}.png" alt="{title}" loading="lazy" width="{width}" height="{height}"></button>'
            f'<figcaption><b>Снимок · {title}</b>{caption}'
            f'<a href="../shots/{name}.png" target="_blank" rel="noreferrer">Открыть в полном размере ↗</a></figcaption></figure>')


def example(title, body):
    """Разобранный пример: условие и решение видны сразу, без вопроса к читателю."""
    return '<div class="example"><span class="eyebrow">Пример</span><h3>' + title + '</h3>' + body + '</div>'


def diagram(title, caption, svg):
    """Схема, нарисованная в SVG: подпись читается и без изображения."""
    return ('<figure class="diagram"><div class="diagram-scroll" tabindex="0" role="group" aria-label="Схема · ' + title + '">'
            + svg + '</div><figcaption><b>Схема · ' + title + '</b>' + p(caption) + '</figcaption></figure>')


def source(url, title):
    return '<p class="source">Первоисточник: <a href="' + url + '" target="_blank" rel="noreferrer">' + title + ' ↗</a></p>'


def chapter(slug, title, lead, epigraph, passport, sections, mistakes, selfcheck, cheatsheet, links, practice=''):
    """epigraph — короткая мысль главы в шапке; practice — упражнение перед «Проверьте себя»."""
    return dict(slug=slug, title=title, lead=lead, epigraph=epigraph, passport=passport, sections=sections,
                mistakes=mistakes, selfcheck=selfcheck, cheatsheet=cheatsheet, links=links, practice=practice)
