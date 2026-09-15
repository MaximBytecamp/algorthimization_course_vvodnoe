"""Блоки, из которых собираются главы справочника. Текст глав — в tools/chapters/."""
from pathlib import Path
from html import escape
import io
import keyword
import struct
import tokenize

ROOT = Path(__file__).resolve().parents[1]


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


def source(url, title):
    return '<p class="source">Первоисточник: <a href="' + url + '" target="_blank" rel="noreferrer">' + title + ' ↗</a></p>'


def chapter(slug, title, lead, passport, sections, mistakes, selfcheck, cheatsheet, links, practice=''):
    """practice — интерактивное упражнение, которое стоит перед вопросами «Проверьте себя»."""
    return dict(slug=slug, title=title, lead=lead, passport=passport, sections=sections,
                mistakes=mistakes, selfcheck=selfcheck, cheatsheet=cheatsheet, links=links, practice=practice)
