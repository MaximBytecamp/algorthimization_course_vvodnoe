"""Собрать оглавления по chapters.json, не изменяя тексты глав.

В каталоге публикуются только главы со status=ready. Запланированные темы
остаются текстом без ссылки. Старые обзоры модулей без готовых глав сохраняются.
"""
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def document(title, number, lead, body, prefix=''):
    return f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#F2F1E9"><title>{escape(title)} · ООП на Python</title><link rel="stylesheet" href="{prefix}styles.css"><link rel="stylesheet" href="{prefix}oop.css"></head>
<body><div class="book"><div class="book__body"><div class="spine"><span>ООП на Python</span></div><main class="leaf">
<div class="running"><p class="eyebrow"><a href="{prefix}index.html">Справочник по ООП на Python</a></p><p class="running__folio">Оглавление</p></div>
<header class="chapter-head"><span class="chapter-num">{number}</span><h1>{escape(title)}</h1><p class="lead">{lead}</p></header>
{body}<div class="colophon"><span>ООП на Python · Справочные материалы</span></div></main></div></div></body></html>
'''


def listing(chapters, prefix=''):
    lines = ['<ol class="chapter-list">']
    for item in chapters:
        label = f'<span class="topic-number">{item["number"]}</span><span>{escape(item["title"])}</span>'
        if item['status'] == 'ready':
            entry = f'<a href="{prefix}{item["path"]}">{label}</a>'
        else:
            entry = f'<span class="topic-planned">{label}<small>Запланировано</small></span>'
        lines.append(f'<li>{entry}</li>')
    return '\n'.join(lines + ['</ol>'])


def main():
    chapters = json.loads((ROOT / 'chapters.json').read_text(encoding='utf-8'))
    for item in chapters:
        if item['status'] not in ('ready', 'planned'):
            raise ValueError(f'Неизвестный статус: {item["number"]}')
        if item['status'] == 'ready' and not (ROOT / item['path']).is_file():
            raise FileNotFoundError(item['path'])
    modules = sorted({c['module'] for c in chapters})
    ready = sum(c['status'] == 'ready' for c in chapters)
    intros = {
        8: 'Классы, экземпляры и способы обращения к данным и действиям. Сначала разобраны объект и его состояние, затем создание экземпляров, методы и протоколы Python.',
        9: 'Наследование, связи объектов и способы выразить общий интерфейс. План включает отдельные главы о принципах, инструментах и механизмах доступа к атрибутам.',
        10: 'Дескрипторы, dataclass, создание классов и управление атрибутами. Каждому механизму будет посвящена самостоятельная глава.'
    }
    body = f'''<dl class="passport"><div><dt>Формат</dt><dd>Отдельная глава на каждую тему</dd></div><div><dt>Готовность</dt><dd>{ready} из {len(chapters)} глав</dd></div><div><dt>Перед началом</dt><dd>Функции, коллекции и исключения</dd></div><div><dt>Среда</dt><dd>Python 3.11 и новее</dd></div></dl>
<p>Справочник выходит частями. Готовые главы доступны по ссылкам ниже. Остальные темы отмечены как запланированные: пустых страниц для них нет.</p>
<p>Каждая готовая глава подробно разбирает свою тему: объяснение, самостоятельные программы с выводом, схемы, аналогии, частые ошибки и шпаргалка.</p>
<nav class="contents"><b>Модули</b><ol>'''
    for m in modules:
        selected = [c for c in chapters if c['module'] == m]
        body += f'<li><a href="#module{m}">{m}. {escape(selected[0]["module_title"])}</a></li>'
    body += '</ol></nav>'
    for m in modules:
        selected = [c for c in chapters if c['module'] == m]
        completed = [c for c in selected if c['status'] == 'ready']
        title = selected[0]['module_title']
        body += f'<section class="module-catalog" id="module{m}"><h2>Модуль {m}. {escape(title)}</h2><p>{intros[m]}</p>'
        if completed:
            body += f'<p><a href="modul-{m:02d}/index.html">Оглавление модуля {m} →</a> · Готово: {len(completed)} из {len(selected)}</p>'
            modbody = f'<p>{intros[m]}</p><p>Готово {len(completed)} из {len(selected)} глав. Ссылки открывают завершённые темы; остальные перечислены как план следующих выпусков.</p>'
            modbody += listing(selected, prefix='../')
            modbody += f'<div class="pager"><a href="../index.html">← Все модули</a><a href="{completed[0]["path"].split("/", 1)[1]}">Начать с главы {completed[0]["number"]} →</a></div>'
            (ROOT / f'modul-{m:02d}' / 'index.html').write_text(document(title, str(m), 'Оглавление отдельных глав', modbody, prefix='../'), encoding='utf-8')
        else:
            body += f'<p class="source-note">Отдельные главы ещё готовятся. Пока доступен <a href="modul-{m:02d}/index.html">прежний общий обзор модуля {m}</a>. Он будет заменён оглавлением по мере выпуска отдельных тем.</p>'
        body += listing(selected) + '</section>'
    body += '''<h2 id="examples">Как запускать примеры</h2><p>Каждый блок «main.py» — самостоятельная программа. Скопируйте один пример в файл и выполните <code>python main.py</code>, <code>python3 main.py</code> или <code>py main.py</code> на Windows. Импорты и определения повторяются, чтобы примеры можно было запускать независимо.</p><p>Блок «Вывод» показывает результат соседней программы. Код и вывод копировать вместе не нужно. Команды внешних инструментов качества кода в обзоре модуля 9 выделены отдельно.</p>
<details class="more"><summary>Источник и границы книги</summary><p>Основа — предоставленные справочные материалы по Python: модули 8–10 раздела ООП, страницы 541–740 по оглавлению. Завершение темы __slots__ включено. Соответствие тем исходным страницам сохранено в chapters.json.</p><p>Порядок уточнён для последовательного чтения: объект вводится перед собственными классами. Технические неточности исходника исправляются при переработке. Модуль 11 о SOLID и паттернах в эту книгу не входит.</p></details>
<div class="pager"><a href="../index.html">← Материалы МДК.01.01</a><a href="modul-08/01-paradigma-oop/index.html">Начать читать →</a></div>'''
    (ROOT / 'index.html').write_text(document('Справочник по ООП на Python', 'Py', 'Отдельные главы о каждом понятии: от состояния объекта и self до дескрипторов, метаклассов и слотов.', body), encoding='utf-8')
    print(f'Оглавления пересобраны: готово {ready} из {len(chapters)} глав')


if __name__ == '__main__':
    main()
