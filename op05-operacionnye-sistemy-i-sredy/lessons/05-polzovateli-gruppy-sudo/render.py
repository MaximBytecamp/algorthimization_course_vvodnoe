# Разметка блоков урока: определение, порядок действий, команды, снимок с увеличенным фрагментом,
# предупреждение, таблица. Интерактивные схемы — в widgets.py.
from pathlib import Path
import html
from shot_notes import NOTES
from explain import explain
from command_summary import SUMMARY
from widgets import WIDGETS

B = Path(__file__).resolve().parent
E = html.escape
W_SHOT, H_SHOT = 1280, 800
SRC = 'Ubuntu 24.04'

missing = []
counters = dict(core=0, probe=0)


def lens_html(name, lens):
    cols = lens.get('cols') or 80
    top = 80 + 22 * lens['first']
    bottom = 80 + 22 * (lens['last'] + 1) + 2
    left, right = 57, min(W_SHOT, 67 + 10 * cols + 12)
    cw, ch = right - left, bottom - top
    px = left / (W_SHOT - cw) * 100 if W_SHOT > cw else 0
    py = top / (H_SHOT - ch) * 100 if H_SHOT > ch else 0
    marks, seen = '', set()
    for line, c1, c2, num in lens['marks']:
        x = (67 + 10 * c1 - 3 - left) / cw * 100
        y = (80 + 22 * line - top) / ch * 100
        w = (10 * (c2 - c1) + 6) / cw * 100
        h = 22 / ch * 100
        badge = f'<i>{num}</i>' if num not in seen else ''
        seen.add(num)
        marks += f'<span class="lens-mark" style="left:{x:.2f}%;top:{y:.2f}%;width:{w:.2f}%;height:{h:.2f}%">{badge}</span>'
    notes = ''.join(f'<li><i>{n}</i><span>{t}</span></li>' for n, t in enumerate(lens['notes'], 1))
    return (f'<div class="lens" style="aspect-ratio:{cw}/{ch}" role="img" aria-label="Увеличенный фрагмент снимка {name}">'
            f'<div class="lens-img" style="background-image:url(shots/{name}.png);background-size:{W_SHOT / cw * 100:.3f}% auto;background-position:{px:.3f}% {py:.3f}%"></div>{marks}</div>'
            f'<ol class="lens-notes">{notes}</ol>')


def core_html(d, chapter):
    name = d['shot']
    if not (B / 'shots' / f'{name}.png').exists():
        missing.append(name)
        return ''
    if counters['core'] == 0:
        counters['seen'] = {}
    counters['core'] += 1
    seen = counters['seen']
    seen[name] = seen.get(name, 0) + 1
    key = f'{chapter}:{name}' + (f':{seen[name]}' if seen[name] > 1 else '')
    if key not in NOTES:
        missing.append('вывод ' + key)
    shows, use = NOTES.get(key, ('', ''))
    after = (f'<div class="core-after"><p><b>Что показывает снимок.</b> {shows}</p><p><b>Где это пригодится.</b> {use}</p></div>' if shows else '')
    body = lens_html(name, d['lens']) if d['lens'] else ''
    wide = '' if d['lens'] else ' core--whole'
    return (f'<figure class="core{wide}"><figcaption class="core-head"><span class="core-tag">Снимок {chapter}.{counters["core"]}</span>'
            f'<span class="core-src">{SRC}</span></figcaption>{body}'
            f'<div class="core-foot"><a class="zoom-shot" href="shots/{name}.png"><img src="shots/{name}.png" alt="{E(d["caption"])}" width="1280" height="800" loading="lazy"><span>Весь снимок ↗</span></a>'
            f'<p>{d["caption"]}</p></div>{after}</figure>')


def probe_html(d, chapter):
    counters['probe'] += 1
    cmds = '\n'.join(c for c, _ in d['lines'] if not c.startswith('KEY:'))

    def line(c, w):
        if c.startswith('KEY:'):
            return (f'<li class="key-line"><code>{E(c[4:])}</code>'
                    + (f'<span class="why"># {w}</span>' if w else '<span class="why"></span>') + '<span></span></li>')
        rows = ''.join(f'<dt><code>{E(p)}</code></dt><dd>{E(t)}</dd>' for p, t in explain(c))
        whole = SUMMARY.get(c)
        if not whole:
            missing.append('описание команды ' + c)
        head = f'<p class="explain-whole"><b>Что делает команда.</b> {E(whole)}</p><p class="explain-parts">По частям:</p>' if whole else ''
        return (f'<li><code>{E(c)}</code>' + (f'<span class="why"># {w}</span>' if w else '<span class="why"></span>')
                + f'<details class="explain"><summary>что делает</summary><div class="explain-body">{head}<dl>{rows}</dl></div></details></li>')
    lines = ''.join(line(c, w) for c, w in d['lines'])
    return (f'<section class="probe" aria-label="Команды {chapter}.{counters["probe"]}"><header><span class="probe-tag">В терминале</span>'
            f'<b>{E(d["title"])}</b><button class="copy" type="button" data-copy="{E(cmds)}">Копировать</button></header>'
            f'<ol class="probe-lines">{lines}</ol><footer><span>Результат</span><p>{d["expect"]}</p></footer></section>')


def def_html(d):
    no = f'<p class="term-no"><b>Не путать.</b> {d["no"]}</p>' if d['no'] else ''
    return f'<aside class="term"><span class="term-tag">Определение</span><p class="term-name"><dfn>{d["term"]}</dfn></p><p>{d["text"]}</p>{no}</aside>'


def steps_html(d):
    items = ''.join(f'<li><span class="step-n">{i}</span><div>{s}</div></li>' for i, s in enumerate(d['steps'], 1))
    return f'<section class="steps"><header><span class="steps-tag">Порядок действий</span><b>{d["title"]}</b></header><ol>{items}</ol></section>'


def table_html(d):
    return ('<div class="tbl"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in d['head']) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in d['rows']) + '</tbody></table></div>')


def blocks_html(blocks, chapter):
    out = ''
    for kind, d in blocks:
        if kind == 'p': out += f'<p>{d}</p>'
        elif kind == 'def': out += def_html(d)
        elif kind == 'steps': out += steps_html(d)
        elif kind == 'probe': out += probe_html(d, chapter)
        elif kind == 'core': out += core_html(d, chapter)
        elif kind == 'widget': out += WIDGETS[d]()
        elif kind == 'note': out += f'<aside class="note"><b>Примечание</b><p>{d}</p></aside>'
        elif kind == 'warn': out += f'<aside class="warn"><b>Осторожно</b><p>{d}</p></aside>'
        elif kind == 'table': out += table_html(d)
        elif kind == 'raw': out += d
    return out
