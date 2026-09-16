"""Собирает печатный PDF практикума: бланк и листинг всех вариантов.

Листинг берётся из тех же .py файлов, поэтому бумага не расходится с кодом.
Запуск: python3 build_pdf.py (нужен playwright с Chromium).
"""
import html
import io
import pathlib
import re

PAPKA = pathlib.Path(__file__).parent
VYHOD = PAPKA.parent / 'praktikum-5-7.pdf'

STIL = """
@page { size: A4; margin: 16mm 14mm; }
body { font: 10.5pt/1.5 -apple-system, 'Segoe UI', sans-serif; color: #10182c; }
h1 { font-size: 19pt; margin: 0 0 4mm; }
h2 { font-size: 14pt; margin: 8mm 0 3mm; border-bottom: 1.5pt solid #10182c; padding-bottom: 2mm; }
h3 { font-size: 11.5pt; margin: 6mm 0 2mm; }
p { margin: 0 0 2.5mm; }
hr { border: 0; border-top: 1pt solid #b9c0d0; margin: 7mm 0; }
table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 9pt; }
th, td { border: 0.7pt solid #8a93a8; padding: 2.2mm 2mm; text-align: left; vertical-align: top; }
th { background: #e6ecf5; }
td:empty { height: 9mm; }
code { font: 9.5pt 'SFMono-Regular', Consolas, monospace; background: #eef1f6; padding: 0 1mm; }
ol { margin: 0 0 3mm; padding-left: 6mm; }
li { margin-bottom: 1.5mm; }
pre { font: 8.3pt/1.45 'SFMono-Regular', Consolas, monospace; background: #f4f6fa;
      border: 0.7pt solid #c3cad8; padding: 3mm; white-space: pre-wrap; margin: 0 0 4mm; }
.listing { page-break-before: always; }
.note { font-size: 9pt; color: #4a5470; }
"""


def md_v_html(text):
    """Небольшой конвертер: заголовки, таблицы, списки, абзацы, код в строке."""
    vyhod = []
    stroki = text.split('\n')
    i = 0
    while i < len(stroki):
        stroka = stroki[i]
        if not stroka.strip():
            i += 1
            continue
        if stroka.startswith('---') and set(stroka.strip()) == {'-'}:
            vyhod.append('<hr>')
            i += 1
            continue
        if stroka.startswith('#'):
            uroven = len(stroka) - len(stroka.lstrip('#'))
            vyhod.append(f'<h{uroven}>{vstroki(stroka.lstrip("# ").strip())}</h{uroven}>')
            i += 1
            continue
        if stroka.startswith('|'):
            tablica = []
            while i < len(stroki) and stroki[i].startswith('|'):
                tablica.append(stroki[i])
                i += 1
            vyhod.append(sobrat_tablicu(tablica))
            continue
        if re.match(r'^\d+\. ', stroka):
            punkty = []
            while i < len(stroki) and re.match(r'^\d+\. ', stroki[i]):
                punkty.append(f'<li>{vstroki(stroki[i].split(". ", 1)[1])}</li>')
                i += 1
            vyhod.append('<ol>' + ''.join(punkty) + '</ol>')
            continue
        if stroka.startswith('- '):
            punkty = []
            while i < len(stroki) and stroki[i].startswith('- '):
                punkty.append(f'<li>{vstroki(stroki[i][2:])}</li>')
                i += 1
            vyhod.append('<ul>' + ''.join(punkty) + '</ul>')
            continue
        if stroka.startswith('```'):
            i += 1
            blok = []
            while i < len(stroki) and not stroki[i].startswith('```'):
                blok.append(stroki[i])
                i += 1
            i += 1
            vyhod.append('<pre>' + html.escape('\n'.join(blok)) + '</pre>')
            continue
        abzac = []
        while i < len(stroki) and stroki[i].strip() and not stroki[i][0] in '#|-`' :
            abzac.append(stroki[i])
            i += 1
        vyhod.append(f'<p>{vstroki(" ".join(abzac))}</p>')
    return '\n'.join(vyhod)


def vstroki(text):
    text = html.escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = text.replace('____', '<span style="color:#98a0b4">____</span>')
    return text


def sobrat_tablicu(stroki):
    ryady = [[kletka.strip() for kletka in s.strip().strip('|').split('|')] for s in stroki]
    shapka, telo = ryady[0], ryady[2:]
    out = ['<table><thead><tr>' + ''.join(f'<th>{vstroki(k)}</th>' for k in shapka) + '</tr></thead><tbody>']
    for ryad in telo:
        out.append('<tr>' + ''.join(f'<td>{vstroki(k)}</td>' for k in ryad) + '</tr>')
    out.append('</tbody></table>')
    return ''.join(out)


def listing(imya, zagolovok):
    kod = io.open(PAPKA / imya, encoding='utf-8').read().rstrip()
    return (f'<section class="listing"><h2>{zagolovok}</h2>'
            f'<p class="note">Файл {imya} из архива. Код на бумаге совпадает с файлом в архиве.</p>'
            f'<pre>{html.escape(kod)}</pre></section>')


def main():
    from playwright.sync_api import sync_playwright
    telo = md_v_html(io.open(PAPKA / 'blank.md', encoding='utf-8').read())
    telo += listing('zadacha_a_kth.py', 'Листинг: десять вариантов задачи A')
    telo += listing('zadacha_b_poisk.py', 'Листинг: десять вариантов задачи B')
    stranica = f'<!doctype html><meta charset="utf-8"><style>{STIL}</style>{telo}'
    vremennyy = PAPKA / '_pdf.html'
    io.open(vremennyy, 'w', encoding='utf-8').write(stranica)
    with sync_playwright() as p:
        brauzer = p.chromium.launch()
        page = brauzer.new_page()
        page.goto(vremennyy.as_uri())
        page.pdf(path=str(VYHOD), format='A4', print_background=True)
        brauzer.close()
    vremennyy.unlink()
    print('готово:', VYHOD, f'{VYHOD.stat().st_size // 1024} КБ')


if __name__ == '__main__':
    main()
