"""Собирает homework_13.pdf из lesson_13/homework_13.md.

Запуск: python make_homework_pdf.py
Markdown разбирается здесь же: заголовки, абзацы, нумерованный список,
таблица, **жирный** и `код` — этого хватает для файла задания.
PDF печатает Chromium через Playwright, шрифты Google при печати не грузятся.
"""
import asyncio
import base64
import html
import pathlib
import re

from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / 'lesson_13' / 'homework_13.md'
OUT = HERE / 'homework_13.pdf'
MEME_FILE = HERE.parent.parent.parent / 'shared' / 'memes' / 'meme-wrong-key.jpg'
# Страница печатается из строки, а не из файла, поэтому картинка вставляется как data URI.
MEME = 'data:image/jpeg;base64,' + base64.b64encode(MEME_FILE.read_bytes()).decode()


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)


def convert(md):
    out, para, items, table = [], [], [], []

    def flush():
        if para:
            out.append('<p>' + inline(' '.join(para)) + '</p>')
            para.clear()
        if items:
            first = items[0][0]
            out.append(f'<ol start="{first}">' + ''.join('<li>' + inline(' '.join(i[1:])) + '</li>' for i in items) + '</ol>')
            items.clear()
        if table:
            rows = [r for r in table if not re.fullmatch(r'\|[\s|:-]+\|', r)]
            cells = [[c.strip() for c in r.strip('|').split('|')] for r in rows]
            body = ''.join('<tr><th>' + inline(c[0]) + '</th><td>' + inline(c[1]) + '</td></tr>'
                           for c in cells if c[0])
            out.append('<table>' + body + '</table>')
            table.clear()

    for line in md.splitlines():
        if not line.strip():
            flush()
        elif line.startswith('# '):
            flush(); out.append('<h1>' + inline(line[2:]) + '</h1>')
        elif line.startswith('## '):
            flush(); out.append('<h2>' + inline(line[3:]) + '</h2>')
        elif line.startswith('|'):
            table.append(line)
        elif re.match(r'\d+\. ', line):
            if para:
                flush()
            items.append([int(line.split('.')[0]), re.sub(r'^\d+\. ', '', line)])
        elif items and line.startswith('   '):
            items[-1].append(line.strip())
        else:
            para.append(line.strip())
    flush()
    page = '\n'.join(out)
    joke = 'Максим Николаевич не хочет задавать вам домашнее задание. Но очень хочет.'
    return page.replace('<p>' + inline(joke) + '</p>',
                        f'<p class="joke">{joke}</p><img class="meme" src="{MEME}" alt="">')


CSS = '''
@page { size: A4; margin: 16mm 16mm 18mm; }
body { font: 10.5pt/1.5 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #15202B; }
h1 { font-size: 19pt; line-height: 1.2; margin: 0 0 6pt; padding-bottom: 6pt; border-bottom: 3pt solid #15202B; }
h2 { font-size: 13pt; margin: 16pt 0 6pt; color: #1B5E9A; }
p { margin: 0 0 7pt; }
.joke { font: italic 14pt/1.35 Georgia, serif; margin: 12pt 0 8pt; }
.meme { display: block; width: 62%; margin: 0 0 10pt; border: 2pt solid #15202B; }
ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin-bottom: 7pt; }
code { font: 9.5pt "SF Mono", Menlo, monospace; background: #EEF1F4; padding: 0 2pt; }
table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
th, td { border: 1pt solid #9AA6B2; padding: 5pt 7pt; vertical-align: top; text-align: left; }
th { width: 22%; background: #EEF1F4; }
'''


async def main():
    body = convert(SRC.read_text(encoding='utf-8'))
    doc = f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(doc, wait_until='load')
        await page.pdf(path=str(OUT), format='A4', print_background=True)
        await browser.close()
    print(OUT, OUT.stat().st_size)


if __name__ == '__main__':
    asyncio.run(main())
