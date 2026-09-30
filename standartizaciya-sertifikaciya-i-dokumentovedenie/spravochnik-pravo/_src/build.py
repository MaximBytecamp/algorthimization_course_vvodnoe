#!/usr/bin/env python3
"""Сборка справочника «Вайбкодинг в России».

Главы пишутся фрагментами в _src/chapters/*.html: шапка-комментарий с полями
и тело из секций <section class="sec">. Сборщик добавляет оформление страницы,
оглавление главы, переходы между главами и титульную страницу.

Два своих тега:
  <law a="pd152:21" p="ч. 3.1">текст</law>  — выписка из закона со ссылкой
                                             на статью в КонсультантПлюс;
  <fine t="КоАП 13.11 ч. 2" gr="10-15" dl="100-300" ip="" ul="300-700"/>
                                          — шкала штрафа в тысячах рублей.

Запуск: python3 _src/build.py
"""
import html
import json
import math
import re
from pathlib import Path

SRC = Path(__file__).resolve().parent
ROOT = SRC.parent
URLS = json.loads((SRC / 'laws.json').read_text())

BOOK = 'Вайбкодинг в России'
AUTHOR = 'Макаров Максим Николаевич'

# Название закона и редакция, по которой сверены выписки (КонсультантПлюс, 30.09.2026).
LAWS = {
    'koap':   ('КоАП РФ', 'ред. от 26.07.2026'),
    'uk':     ('УК РФ', 'ред. от 04.08.2026'),
    'pd152':  ('152-ФЗ «О персональных данных»', 'ред. от 26.07.2026'),
    'info149': ('149-ФЗ «Об информации, информационных технологиях и о защите информации»', 'ред. от 26.06.2026'),
    'kkt54':  ('54-ФЗ «О применении контрольно-кассовой техники»', 'ред. от 24.06.2025'),
    'ad38':   ('38-ФЗ «О рекламе»', 'ред. от 04.08.2026'),
    'dv282':  ('282-ФЗ «О цифровых валютах и цифровых правах»', 'от 04.08.2026'),
    'cfa259': ('259-ФЗ «О цифровых финансовых активах, цифровой валюте…»', 'ред. от 04.08.2026'),
    'zozpp':  ('Закон РФ 2300-1 «О защите прав потребителей»', 'ред. от 28.12.2025'),
    'gk1':    ('ГК РФ', 'ред. от 10.06.2026'),
    'gk4':    ('ГК РФ, часть четвёртая', 'ред. от 23.07.2025'),
    'nk1':    ('НК РФ, часть первая', 'ред. от 04.08.2026'),
    'nk2':    ('НК РФ, часть вторая', 'ред. от 04.08.2026'),
    'npd422': ('422-ФЗ о налоге на профессиональный доход', 'ред. от 04.08.2026'),
    'aml115': ('115-ФЗ «О противодействии легализации (отмыванию) доходов…»', 'ред. от 04.08.2026'),
    'ep63':   ('63-ФЗ «Об электронной подписи»', 'ред. от 31.07.2025'),
    'ai243':  ('243-ФЗ «О поддержке развития технологий искусственного интеллекта»', 'от 26.07.2026'),
    'lang53': ('53-ФЗ «О государственном языке Российской Федерации»', 'ред. от 22.04.2024'),
    'fz168':  ('168-ФЗ от 24.06.2025 (изменения в закон о защите прав потребителей)', 'ст. 1 действует с 01.03.2026'),
    'val173': ('173-ФЗ «О валютном регулировании и валютном контроле»', 'ред. от 04.08.2026'),
    'kii187': ('187-ФЗ «О безопасности критической информационной инфраструктуры»', 'ред. от 07.04.2025'),
    'pl289':  ('289-ФЗ «Об отдельных вопросах регулирования платформенной экономики…»', 'от 31.07.2025, действует с 01.10.2026'),
    'ch436':  ('436-ФЗ «О защите детей от информации, причиняющей вред их здоровью и развитию»', 'ред. от 29.12.2025'),
    'ed273':  ('273-ФЗ «Об образовании в Российской Федерации»', 'ред. от 04.08.2026'),
    'tk':     ('ТК РФ', 'ред. от 25.05.2026'),
    'gk2':    ('ГК РФ, часть вторая', 'ред. от 24.06.2025'),
    'med323': ('323-ФЗ «Об основах охраны здоровья граждан в Российской Федерации»', 'ред. от 04.08.2026'),
    'rcb39':  ('39-ФЗ «О рынке ценных бумаг»', 'ред. от 04.08.2026'),
    'gz44':   ('44-ФЗ «О контрактной системе в сфере закупок…»', 'ред. от 04.08.2026'),
    'ooo14':  ('14-ФЗ «Об обществах с ограниченной ответственностью»', 'ред. от 04.08.2026'),
    'kt98':   ('98-ФЗ «О коммерческой тайне»', 'ред. от 08.08.2024'),
    'ia255':  ('255-ФЗ «О контроле за деятельностью лиц, находящихся под иностранным влиянием»', 'ред. от 26.06.2026'),
    'st162':  ('162-ФЗ «О стандартизации в Российской Федерации»', 'ред. от 04.08.2026'),
    'tr184':  ('184-ФЗ «О техническом регулировании»', 'ред. от 02.05.2026'),
    'nps161': ('161-ФЗ «О национальной платежной системе»', 'ред. от 04.08.2026'),
    'pa103':  ('103-ФЗ «О деятельности по приему платежей физических лиц…»', 'ред. от 09.04.2026'),
    'lot138': ('138-ФЗ «О лотереях»', 'ред. от 29.12.2025'),
    'az244':  ('244-ФЗ «О государственном регулировании деятельности по организации и проведению азартных игр…»', 'ред. от 26.06.2026'),
}

MODULES = [
    ('1', 'Как устроена ответственность'),
    ('2', 'Форма бизнеса и налоги'),
    ('3', 'Персональные данные'),
    ('4', 'Сайт, доступ и контент'),
    ('5', 'Деньги'),
    ('6', 'Реклама и продвижение'),
    ('7', 'Код, контент и бренд'),
    ('8', 'Пользователи и договоры'),
    ('9', 'Безопасность и уголовные статьи'),
    ('10', 'Нейросеть в коде и в продукте'),
    ('11', 'Площадки и инфраструктура'),
    ('12', 'Проекты с повышенным риском'),
    ('14', 'Проект растёт: дети, обучение, заказчики'),
    ('15', 'Деньги, партнёры, государство'),
    ('16', 'Регулируемые темы: иноагенты, медицина, финансы'),
    ('17', 'ИИ в бизнесе: имена, картинки, правила'),
    ('18', 'Стандарты, платежи, розыгрыши и новые нормы'),
    ('19', 'Практика'),
]

HEAD = '''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f4ee">
<meta name="description" content="{desc}">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}styles.css"><script defer src="{up}book.js"></script></head>
'''

ZOOM = '<dialog id="zoom"><div class="bar"><span>Кадр</span><button type="button">Закрыть ✕</button></div><img alt=""></dialog>\n'


def parse(path):
    text = path.read_text()
    m = re.match(r'<!--(.*?)-->\s*', text, re.S)
    meta = {}
    for line in m.group(1).strip().splitlines():
        key, _, value = line.partition(':')
        meta[key.strip()] = value.strip()
    meta['body'] = text[m.end():]
    meta['path'] = path
    return meta


def rub(k):
    """Сумма в тысячах рублей → «15 тыс.», «1,5 млн»."""
    v = float(k)
    if v >= 1000:
        s = f'{v / 1000:.2f}'.rstrip('0').rstrip('.').replace('.', ',')
        return f'{s} млн'
    s = f'{v:.1f}'.rstrip('0').rstrip('.').replace('.', ',')
    return f'{s} тыс.'


def fine(attrs):
    """Шкала штрафа: полосы от минимума до максимума на логарифмической оси 1 тыс. — 500 млн."""
    lo, hi = math.log10(1), math.log10(500_000)
    pos = lambda k: (math.log10(max(float(k), 1)) - lo) / (hi - lo) * 100
    rows = []
    for key, who in (('gr', 'Гражданин'), ('dl', 'Должностное лицо'), ('ip', 'ИП'), ('ul', 'Организация')):
        val = attrs.get(key)
        if not val:
            continue
        if val.startswith('%'):
            # оборотный штраф: «%20000-500000» — проценты выручки в указанных границах
            a, b = val[1:].split('-')
            left, right = pos(a), pos(b)
            label = f'1–3 % выручки, от {rub(a)} до {rub(b)} ₽'
        elif '-' in val:
            a, b = val.split('-')
            left, right = pos(a), pos(b)
            label = f'от {rub(a)} до {rub(b)} ₽'
        else:
            left = right = pos(val)
            label = f'до {rub(val)} ₽'
        width = max(right - left, 1.4)
        rows.append(f'<div class="fine__row"><span>{who}</span><div class="fine__track"><i style="left:{left:.1f}%;width:{width:.1f}%"></i></div><b>{label}</b></div>')
    extra = attrs.get('x', '')
    extra = f'<p class="fine__x">{extra}</p>' if extra else ''
    return (f'<figure class="fine"><figcaption>{attrs["t"]}</figcaption>'
            + ''.join(rows)
            + '<div class="fine__row fine__row--axis"><span></span><div class="fine__axis">'
            + ''.join(f'<span style="left:{pos(k):.1f}%">{t}</span>' for k, t in
                      ((1, '1 тыс.'), (10, '10 тыс.'), (100, '100 тыс.'), (1000, '1 млн'), (10000, '10 млн'), (100000, '100 млн')))
            + '</div><b></b></div>'
            + extra + '</figure>')


def attrs_of(s):
    return {k: html.unescape(v) for k, v in re.findall(r'(\w+)="([^"]*)"', s)}


def expand(body):
    def law(m):
        a = attrs_of(m.group(1))
        key, _, art = a['a'].partition(':')
        name, ed = LAWS[key]
        url = URLS.get(a['a'], '')
        where = f'ст. {art}' + (f', {a["p"]}' if a.get('p') else '')
        link = f'<a href="{url}">{where}</a>' if url else where
        return (f'<blockquote class="law"><div class="law__head"><b>{name}</b><span>{link}</span><em>{ed}</em></div>'
                f'<div class="law__text">{m.group(2).strip()}</div></blockquote>')
    body = re.sub(r'<law\s+([^>]*)>(.*?)</law>', law, body, flags=re.S)
    body = re.sub(r'<fine\s+([^>]*?)/>', lambda m: fine(attrs_of(m.group(1))), body)
    return body


def contents(body):
    items = re.findall(r'<section class="sec" id="(s\d+)">\s*<h2><i>§\d+</i>(.*?)</h2>', body)
    lis = ''.join(f'<li><a href="#{i}">{re.sub(r"<[^>]+>", "", t)}</a></li>' for i, t in items)
    return f'<nav class="contents"><b>В этой главе</b>\n<ol>{lis}</ol>\n</nav>'


def chapter_page(ch, prev, nxt):
    mod = dict(MODULES)[ch['module']]
    passport = ''.join(
        f'<div><dt>{k.strip()}</dt><dd>{v.strip()}</dd></div>'
        for k, v in (p.split('|', 1) for p in ch['passport'].split(';;')))
    body = expand(ch['body'])
    nav = '<nav class="chapter-nav">'
    if prev:
        nav += f'<a href="../{prev["slug"]}/index.html">← Глава {prev["num"]}. {prev["title"]}</a>'
    else:
        nav += '<a href="../../index.html">← Оглавление справочника</a>'
    if nxt:
        nav += f'<a href="../{nxt["slug"]}/index.html">Глава {nxt["num"]}. {nxt["title"]} →</a>'
    else:
        nav += '<a href="../../index.html">Оглавление справочника →</a>'
    nav += '</nav>'
    # Раздел итогов (ошибки, вопросы, шпаргалка) отделяется чертой, навигация — внутри него.
    body = body.replace('<!--wrapup-->', '<section class="wrapup">', 1)
    if '<section class="wrapup">' in body:
        body = body.rstrip() + '\n\n' + nav + '\n</section>\n'
    else:
        body = body.rstrip() + '\n\n' + nav + '\n'
    return (HEAD.format(desc=html.escape(ch['desc']), title=f'{ch["num"]} {ch["title"]} · {BOOK}', up='../../')
            + '<body><a class="skip" href="#s1">К тексту главы</a>\n<div class="book"><div class="book__body">\n'
            + f'<div class="spine"><span>Модуль {ch["module"]} · {mod}</span></div>\n<main class="leaf">\n'
            + f'<div class="running"><p class="eyebrow"><a href="../../index.html">Справочник «{BOOK}»</a> · модуль {ch["module"]} · {mod}</p><p class="folio">Глава {ch["num"]}</p></div>\n\n'
            + f'<header class="chapter-head">\n<span class="chapter-num">{ch["num"]}</span>\n<h1>{ch["h1"]}</h1>\n<p class="lead">{ch["lead"]}</p>\n</header>\n\n'
            + f'<dl class="passport">{passport}</dl>\n\n' + contents(body) + '\n\n' + body
            + f'\n<p class="foot"><span>Справочник «{BOOK}» · модуль {ch["module"]} · глава {ch["num"]}</span><span>{AUTHOR}</span></p>\n'
            + '</main>\n</div></div>\n' + ZOOM + '</body></html>\n')


def index_page(chapters):
    mods = ''
    for num, name in MODULES:
        chs = [c for c in chapters if c['module'] == num]
        if not chs:
            continue
        lis = ''.join(
            f'<li><a href="temy/{c["slug"]}/index.html"><b>{c["num"]}</b><span><i>{c["title"]}</i><span>{c["card"]}</span></span></a></li>'
            for c in chs)
        word = 'глава' if len(chs) == 1 else ('главы' if len(chs) < 5 else 'глав')
        mods += (f'<article class="module">\n<header><b>Модуль {num}</b><h2>{name}</h2><span>{len(chs)} {word}</span></header>\n'
                 f'<ol>{lis}</ol>\n</article>\n')
    tpl = (SRC / 'index.tpl.html').read_text()
    return tpl.replace('{{MODULES}}', mods).replace('{{COUNT}}', str(len(chapters)))


def main():
    chapters = sorted((parse(p) for p in (SRC / 'chapters').glob('*.html')),
                      key=lambda c: [int(x) for x in c['num'].split('.')])
    for i, ch in enumerate(chapters):
        out = ROOT / 'temy' / ch['slug'] / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(chapter_page(ch, chapters[i - 1] if i else None, chapters[i + 1] if i + 1 < len(chapters) else None))
    (ROOT / 'index.html').write_text(index_page(chapters))
    print(f'глав: {len(chapters)}')


if __name__ == '__main__':
    main()
