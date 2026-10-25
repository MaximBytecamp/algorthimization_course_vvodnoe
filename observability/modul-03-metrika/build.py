"""Сборка страниц модуля 3 «Метрика как данные».

Текст глав лежит в src/*.html — только содержимое страницы между шапкой
и листалкой. Скрипт оборачивает его в общий каркас (шрифты, стили,
корешок, колонтитул, листалка, выходные данные) и пишет готовые
страницы рядом с этим файлом. Архив стенда собирается здесь же.
Стили и скрипты общие с модулем 2 и подключаются из его папки;
блоки, которые есть только в модуле 3, лежат в m3.css и m3.js.

Запуск: python3 build.py
"""

import re
import zipfile
from pathlib import Path


HERE = Path(__file__).parent
SRC = HERE / "src"

MODULE = "Модуль 3 · Метрика как данные"

CHAPTERS = [
    ("01-sample", "3.1", "Измерение, timestamp и sample"),
    ("02-imya-i-edinica", "3.2", "Имя и единица измерения"),
    ("03-labels", "3.3", "Метки и идентичность ряда"),
    ("04-counter", "3.4", "Counter: события и сбросы"),
    ("05-gauge", "3.5", "Gauge: состояние системы"),
    ("06-histogram", "3.6", "Histogram: распределение длительности"),
    ("07-kardinalnost", "3.7", "Кардинальность и цена детализации"),
    ("08-praktika", "3.8", "Практика: метрики сервиса заказов"),
    ("09-itogi", "3.9", "Итоги модуля: главное коротко"),
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
  <link rel="stylesheet" href="m3.css">
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
  <script src="m3.js"></script>
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
        eyebrow_rest="справочник Макарова М. Н." if cover else "модель данных",
        folio=folio,
    )
    pg = (
        '        <div class="pager"><a href="../index.html">← К справочнику</a>'
        f'<a href="{CHAPTERS[0][0]}.html">{CHAPTERS[0][1]} {CHAPTERS[0][2]} →</a></div>'
        if cover else pager(i)
    )
    return head + body.rstrip() + "\n" + FOOT.format(pager=pg, module=MODULE)


def build_zip():
    stand = HERE / "stand"
    files = ["app.py", "requirements.txt", "Dockerfile", ".dockerignore",
             "compose.yaml", "prometheus.yml", "prometheus-limit.yml", "README.md"]
    with zipfile.ZipFile(HERE / "metrika-start.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for name in files:
            z.write(stand / name, f"metrika-start/{name}")


def build_final_zip():
    """Стенд практики: всё из папки stand-praktika, кроме окружений и кэшей."""
    stand = HERE / "stand-praktika"
    if not stand.exists():
        return
    skip = {".venv", "__pycache__", ".DS_Store"}
    with zipfile.ZipFile(HERE / "metrika-praktika.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(stand.rglob("*")):
            if path.is_file() and not skip & set(path.relative_to(stand).parts):
                z.write(path, f"metrika-praktika/{path.relative_to(stand).as_posix()}")


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
        title="Метрика как данные · Метрики и наблюдаемость",
        description="Модуль 3 справочника «Метрики и наблюдаемость»: отсчёт и время, имя и единица, метки, counter, gauge, histogram, кардинальность.",
        folio=f"{len(CHAPTERS)} глав",
        cover=True,
    ), encoding="utf-8")
    for i, (slug, num, title) in enumerate(ready()):
        body = include((SRC / f"{slug}.html").read_text(encoding="utf-8"))
        (HERE / f"{slug}.html").write_text(page(
            body,
            title=f"{num} {title} · Метрика как данные",
            description=f"Глава {num} модуля «Метрика как данные»: {title[0].lower() + title[1:]}.",
            folio=f"Глава {num}",
            i=i,
        ), encoding="utf-8")
    build_zip()
    build_final_zip()
    print("готово:", len(ready()) + 1, "страниц и архивы стенда")


if __name__ == "__main__":
    main()
