"""Сборка страниц модуля 4 «Сбор и хранение».

Текст глав лежит в src/*.html — только содержимое страницы между шапкой
и листалкой. Скрипт оборачивает его в общий каркас (шрифты, стили,
корешок, колонтитул, листалка, выходные данные) и пишет готовые
страницы рядом с этим файлом. Архив проекта собирается здесь же.
Стили и скрипты общие с модулями 2 и 3 и подключаются из их папок.

Запуск: python3 build.py
"""

import re
import zipfile
from pathlib import Path


HERE = Path(__file__).parent
SRC = HERE / "src"

MODULE = "Модуль 4 · Сбор и хранение"

CHAPTERS = [
    ("01-exporter", "4.1", "Exporter: метрики чужой программы"),
    ("02-discovery", "4.2", "Service discovery: target из файла"),
    ("03-relabeling", "4.3", "Relabeling: метки до опроса и после"),
    ("04-limity", "4.4", "Лимиты опроса"),
    ("05-tsdb", "4.5", "TSDB: head, WAL, блоки и retention"),
    ("06-propuski", "4.6", "Пропуски и устаревшие ряды"),
    ("07-pushgateway", "4.7", "Pushgateway и пакетные задачи"),
    ("08-federaciya", "4.8", "Федерация и remote_write"),
    ("09-praktika", "4.9", "Практика"),
    ("10-itogi", "4.10", "Итоги модуля: главное коротко"),
]

FONTS = (
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800"
    "&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400"
    "&family=Pixelify+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap"
)

HEAD = """<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#EEF1F5">
  <meta name="description" content="{description}">
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{fonts}" rel="stylesheet">
  <link rel="stylesheet" href="../modul-02-prometheus/styles.css">
  <link rel="stylesheet" href="../modul-02-prometheus/algo.css">
  <link rel="stylesheet" href="../modul-02-prometheus/prom.css">
  <link rel="stylesheet" href="../modul-03-metrika/m3.css">
</head>
<body>
  <div class="book">
    <div class="book__body">
      <div class="spine"><span>{spine}</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="{home}" style="text-decoration:none;color:inherit">{eyebrow_link}</a> · {eyebrow_rest}</p>
          <p class="running__folio">{folio}</p>
        </div>
"""

FOOT = """
{pager}
        <div class="colophon">
          <span>Метрики и наблюдаемость · {module}</span>
          <span class="author-line">Автор: Макаров Максим Николаевич</span>
        </div>
      </main>
    </div>
  </div>
  <script src="../modul-02-prometheus/book.js"></script>
  <script src="../modul-02-prometheus/algo.js"></script>
  <script src="../modul-02-prometheus/prom.js"></script>
</body>
</html>
"""


def ready():
    """Главы, у которых уже есть текст в src/. Остальные на обложке помечены «в работе»."""
    return [c for c in CHAPTERS if (SRC / f"{c[0]}.html").exists()]


def pager(i):
    left = '<a href="index.html">← К оглавлению модуля</a>'
    if i > 0:
        slug, num, title = ready()[i - 1]
        left = f'<a href="{slug}.html">← {num} {title}</a>'
    right = '<a href="../index.html">К справочнику →</a>'
    if i < len(ready()) - 1:
        slug, num, title = ready()[i + 1]
        right = f'<a href="{slug}.html">{num} {title} →</a>'
    return f'        <div class="pager">{left}{right}</div>'


def page(body, *, title, description, folio, i=None, cover=False):
    head = HEAD.format(
        description=description,
        title=title,
        fonts=FONTS.replace("&", "&amp;"),
        spine=f"{MODULE} · Макаров М. Н.",
        home="../index.html" if cover else "index.html",
        eyebrow_link="Метрики и наблюдаемость" if cover else MODULE.lower().replace("модуль", "Модуль"),
        eyebrow_rest="справочник Макарова М. Н." if cover else "сбор и хранение",
        folio=folio,
    )
    pg = (
        '        <div class="pager"><a href="../index.html">← К справочнику</a>'
        f'<a href="{CHAPTERS[0][0]}.html">{CHAPTERS[0][1]} {CHAPTERS[0][2]} →</a></div>'
        if cover else pager(i)
    )
    return head + body.rstrip() + "\n" + FOOT.format(pager=pg, module=MODULE)


def build_zip():
    """Проект модуля: всё из папки stand, кроме окружений и кэшей."""
    stand = HERE / "stand"
    skip = {".venv", "__pycache__", ".DS_Store"}
    with zipfile.ZipFile(HERE / "sbor-hranenie.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(stand.rglob("*")):
            if path.is_file() and not skip & set(path.relative_to(stand).parts):
                z.write(path, f"sbor-hranenie/{path.relative_to(stand).as_posix()}")


def build_final_zip():
    """Стенд практики: всё из папки stand-praktika, кроме окружений и кэшей."""
    stand = HERE / "stand-praktika"
    if not stand.exists():
        return
    skip = {".venv", "__pycache__", ".DS_Store"}
    with zipfile.ZipFile(HERE / "sbor-praktika.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(stand.rglob("*")):
            if path.is_file() and not skip & set(path.relative_to(stand).parts):
                z.write(path, f"sbor-praktika/{path.relative_to(stand).as_posix()}")


def include(text):
    """Подставляет файлы src/_*.svg на место <!--include:имя-->."""
    return re.sub(r"<!--include:([\w.-]+)-->",
                  lambda m: (SRC / m.group(1)).read_text(encoding="utf-8"), text)


def main():
    cover = (SRC / "index.html").read_text(encoding="utf-8")
    for slug, _, _ in CHAPTERS:
        if not (SRC / f"{slug}.html").exists():
            cover = re.sub(rf'<li><a href="{slug}\.html">(.*?)<em>[^<]*</em></a></li>',
                           r'<li><a class="is-planned" aria-disabled="true">\1<em>в работе</em></a></li>', cover)
    (HERE / "index.html").write_text(page(
        cover,
        title="Сбор и хранение · Метрики и наблюдаемость",
        description="Модуль 4 справочника «Метрики и наблюдаемость»: exporters, service discovery, relabeling, лимиты, TSDB, пропуски, Pushgateway, федерация и remote_write.",
        folio=f"{len(CHAPTERS)} глав",
        cover=True,
    ), encoding="utf-8")
    for i, (slug, num, title) in enumerate(ready()):
        body = include((SRC / f"{slug}.html").read_text(encoding="utf-8"))
        (HERE / f"{slug}.html").write_text(page(
            body,
            title=f"{num} {title} · Сбор и хранение",
            description=f"Глава {num} модуля «Сбор и хранение»: {title[0].lower() + title[1:]}.",
            folio=f"Глава {num}",
            i=i,
        ), encoding="utf-8")
    build_zip()
    build_final_zip()
    print("готово:", len(ready()) + 1, "страниц и архивы проекта")


if __name__ == "__main__":
    main()
