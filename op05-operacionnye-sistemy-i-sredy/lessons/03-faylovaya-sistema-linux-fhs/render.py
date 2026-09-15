# Разметка блоков урока: определение, команды, снимок с увеличенным фрагментом, таблица
# и три интерактивные схемы (переходы cd, имена и inode, монтирование).
from pathlib import Path
import html
from shot_notes import NOTES
from explain import explain

B =Path(__file__).resolve().parent
E = html.escape
W_SHOT, H_SHOT = 1280, 800

# Номера inode из снимка link-broken: схема имён и inode показывает те же числа.
FACTS = dict(inode_file='1605', inode_link='1607')

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
            f'<span class="core-src">Ubuntu 24.04</span></figcaption>{body}'
            f'<div class="core-foot"><a class="zoom-shot" href="shots/{name}.png"><img src="shots/{name}.png" alt="{E(d["caption"])}" width="1280" height="800" loading="lazy"><span>Весь снимок ↗</span></a>'
            f'<p>{d["caption"]}</p></div>{after}</figure>')


def probe_html(d, chapter):
    counters['probe'] += 1
    cmds = '\n'.join(c for c, _ in d['lines'])
    def line(c, w):
        rows = ''.join(f'<dt><code>{E(p)}</code></dt><dd>{E(t)}</dd>' for p, t in explain(c))
        return (f'<li><code>{E(c)}</code>' + (f'<span class="why"># {w}</span>' if w else '<span class="why"></span>')
                + f'<details class="explain"><summary>разбор</summary><dl>{rows}</dl></details></li>')
    lines = ''.join(line(c, w) for c, w in d['lines'])
    return (f'<section class="probe" aria-label="Команды {chapter}.{counters["probe"]}"><header><span class="probe-tag">В терминале</span>'
            f'<b>{E(d["title"])}</b><button class="copy" type="button" data-copy="{E(cmds)}">Копировать</button></header>'
            f'<ol class="probe-lines">{lines}</ol><footer><span>Результат</span><p>{d["expect"]}</p></footer></section>')


def def_html(d):
    no = f'<p class="term-no"><b>Не путать.</b> {d["no"]}</p>' if d['no'] else ''
    return f'<aside class="term"><span class="term-tag">Определение</span><p class="term-name"><dfn>{d["term"]}</dfn></p><p>{d["text"]}</p>{no}</aside>'


def table_html(d):
    return ('<div class="tbl"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in d['head']) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in d['rows']) + '</tbody></table></div>')


def w_walk():
    nodes = [('/', 0, '/'), ('/etc', 1, 'etc'), ('/home', 1, 'home'), ('/home/ubuntu', 2, 'ubuntu'), ('/usr', 1, 'usr'), ('/usr/bin', 2, 'bin'), ('/usr/share', 2, 'share')]
    tree = ''.join(f'<li data-node="{p}" style="--lvl:{l}"><span>{n}</span></li>' for p, l, n in nodes)
    buttons = ''.join(f'<button type="button" data-cd="{c}">{c}</button>' for c in ['cd /usr/share', 'cd ..', 'cd bin', 'cd /', 'cd usr', 'cd ~', 'cd bin', 'cd /etc'])
    return ('<div class="model walk" data-widget="walk"><div class="model-head"><span>Схема · переходы между каталогами</span></div>'
            f'<div class="walk-grid"><ul class="walk-tree" aria-label="Дерево каталогов">{tree}</ul>'
            f'<div class="walk-side"><div class="walk-buttons">{buttons}</div><div class="walk-term" aria-live="polite"><p><span class="pr">ubuntu@ubuntu:/$</span></p></div>'
            '<p class="walk-kind" aria-live="polite">Выберите команду: схема покажет, в какой каталог она ведёт.</p></div></div></div>')


def w_inode():
    f = FACTS
    steps = [('ln', 'ln data/info.txt data/info-hard.txt'), ('rm', 'rm data/info.txt'), ('cat', 'cat info-link.txt'), ('relink', 'ln data/info-hard.txt data/info.txt')]
    buttons = ''.join(f'<button type="button" data-op="{k}">{E(c)}</button>' for k, c in steps)
    return (f'<div class="model inode" data-widget="inode" data-file="{f["inode_file"]}" data-link="{f["inode_link"]}">'
            '<div class="model-head"><span>Схема · имена, inode и ссылки</span><div class="inode-ops" role="group" aria-label="Команды">' + buttons + '<button type="button" data-op="reset">Сначала</button></div></div>'
            '<div class="inode-board"><div class="inode-col"><b>Каталог linux-fhs-lab</b><ul class="dir" data-dir="lab"></ul><b>Каталог data</b><ul class="dir" data-dir="data"></ul></div>'
            '<div class="inode-col"><b>inode</b><div class="inode-cards"></div></div></div>'
            '<pre class="inode-term" aria-live="polite"></pre></div>')


def w_mount():
    return ('<div class="model mount" data-widget="mount"><div class="model-head"><span>Схема · монтирование</span>'
            '<div class="seg" role="group" aria-label="Этап"><button type="button" data-stage="0" aria-pressed="true">1. До mount</button><button type="button" data-stage="1" aria-pressed="false">2. После mount</button><button type="button" data-stage="2" aria-pressed="false">3. После umount</button></div></div>'
            '<div class="mount-stage" data-stage="0"><div class="mount-path">~/linux-fhs-lab/mount-demo/</div>'
            '<div class="mount-pit"><div class="mount-disk"><small>файлы на диске</small><span class="file">before.txt</span></div>'
            '<div class="mount-plate"><small>tmpfs · оперативная память</small><span class="file">inside.txt</span></div></div></div>'
            '<dl class="mount-read"><dt>ls mount-demo</dt><dd data-ls>before.txt</dd><dt>findmnt</dt><dd data-fm>/ /cow overlay</dd></dl>'
            '<p class="mount-out" aria-live="polite"></p></div>')


WIDGETS = dict(walk=w_walk, inode=w_inode, mount=w_mount)


def blocks_html(blocks, chapter):
    out = ''
    for kind, d in blocks:
        if kind == 'p': out += f'<p>{d}</p>'
        elif kind == 'def': out += def_html(d)
        elif kind == 'probe': out += probe_html(d, chapter)
        elif kind == 'core': out += core_html(d, chapter)
        elif kind == 'widget': out += WIDGETS[d]()
        elif kind == 'note': out += f'<aside class="note"><b>Примечание</b><p>{d}</p></aside>'
        elif kind == 'table': out += table_html(d)
    return out
