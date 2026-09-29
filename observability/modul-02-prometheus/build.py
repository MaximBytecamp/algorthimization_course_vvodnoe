"""Сборка страниц модуля 2 «Как работает Prometheus».

Текст глав лежит в src/*.html — только содержимое страницы между шапкой
и листалкой. Скрипт оборачивает его в общий каркас (шрифты, стили,
корешок, колонтитул, листалка, выходные данные) и пишет готовые
страницы рядом с этим файлом. Архив стенда собирается здесь же.

Запуск: python3 build.py
"""

import re
import zipfile
from pathlib import Path

import diagrams

HERE = Path(__file__).parent
SRC = HERE / "src"

MODULE = "Модуль 2 · Как работает Prometheus"

CHAPTERS = [
    ("01-chto-takoe-prometheus", "2.1", "Что такое Prometheus"),
    ("02-target", "2.2", "Target: куда обращаться за метриками"),
    ("03-endpoint-metrics", "2.3", "Endpoint /metrics и текстовый формат"),
    ("04-scrape", "2.4", "Scrape: как Prometheus собирает значения"),
    ("05-pull-model", "2.5", "Pull-модель: Prometheus приходит сам"),
    ("06-pervyj-zapusk", "2.6", "Первый запуск: Prometheus и FastAPI"),
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
  <meta name="theme-color" content="#F1F2EC">
  <meta name="description" content="{description}">
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{fonts}" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="algo.css">
  <link rel="stylesheet" href="prom.css">
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
  <script src="book.js"></script>
  <script src="algo.js"></script>
  <script src="prom.js"></script>
</body>
</html>
"""


def pager(i):
    left = '<a href="index.html">← К оглавлению модуля</a>'
    if i > 0:
        slug, num, title = CHAPTERS[i - 1]
        left = f'<a href="{slug}.html">← {num} {title}</a>'
    right = '<a href="../index.html">К справочнику ↑</a>'
    if i < len(CHAPTERS) - 1:
        slug, num, title = CHAPTERS[i + 1]
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
        eyebrow_rest="справочник Макарова М. Н." if cover else "сбор метрик",
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
             "compose.yaml", "prometheus.yml", "prometheus-errors.yml",
             "prometheus-local.yml", "README.md"]
    with zipfile.ZipFile(HERE / "prometheus-start.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for name in files:
            z.write(stand / name, f"prometheus-start/{name}")


def include(text):
    """Подставляет файлы src/_*.svg на место <!--include:имя-->."""
    return re.sub(r"<!--include:([\w.-]+)-->",
                  lambda m: (SRC / m.group(1)).read_text(encoding="utf-8"), text)


def main():
    diagrams.main()
    cover = (SRC / "index.html").read_text(encoding="utf-8")
    (HERE / "index.html").write_text(page(
        cover,
        title="Как работает Prometheus · Метрики и наблюдаемость",
        description="Модуль 2 справочника «Метрики и наблюдаемость»: target, /metrics, scrape, pull-модель и первый запуск Prometheus.",
        folio="6 глав",
        cover=True,
    ), encoding="utf-8")
    for i, (slug, num, title) in enumerate(CHAPTERS):
        body = include((SRC / f"{slug}.html").read_text(encoding="utf-8"))
        (HERE / f"{slug}.html").write_text(page(
            body,
            title=f"{num} {title} · Как работает Prometheus",
            description=f"Глава {num} модуля «Как работает Prometheus»: {title.lower()}.",
            folio=f"Глава {num}",
            i=i,
        ), encoding="utf-8")
    build_zip()
    print("готово:", len(CHAPTERS) + 1, "страниц и prometheus-start.zip")


if __name__ == "__main__":
    main()
