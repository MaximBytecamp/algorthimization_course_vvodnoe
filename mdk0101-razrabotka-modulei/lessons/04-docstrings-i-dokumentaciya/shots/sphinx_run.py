"""Прогон глав 4.12–4.16 (Sphinx) на третьем архиве: выводы команд и кадры сайта.

    python3 sphinx_run.py            весь сценарий с начала
    python3 sphinx_run.py --no-shots без снимков страниц

Сценарий идёт по главам в том же порядке, что и текст: quickstart, первая
сборка, autodoc без пути и с путём, napoleon, страницы .rst, sphinx-apidoc,
перекрёстные ссылки, темы, чистая сборка с -W. Каждый вывод записывается
в raw/sphinx/<имя>.txt, абсолютный путь к проекту заменён на «…», чтобы
выводы можно было переносить в книгу как есть. Кадры сайта — в ../img/site-*.png.

В конце из получившегося проекта собирается materials/otchet-kafe-sphinx.zip —
эталон для сверки в главе 4.16.
"""
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
MATERIALS = HERE.parent / "materials"
IMG = HERE.parent / "img"
OUT = HERE / "raw" / "sphinx"
WORK = Path("/private/tmp/student-sphinx")
NAME = "otchet-kafe-dokumentirovan"
P = WORK / NAME
NODE_PATH = Path.home() / "python_presentations/tools/node_modules"
SHOTS = "--no-shots" not in sys.argv
DOCS_REQ = ["sphinx==9.1.1", "furo==2025.12.19", "sphinx-rtd-theme==3.1.0"]


def bin_(name: str) -> str:
    return str(P / ".venv" / "bin" / name)


def run(name: str, cmd: list[str], stdin: str | None = None, env: dict | None = None) -> str:
    """Запускает команду в корне проекта и сохраняет вывод под именем name."""
    full_env = {**os.environ, "LANG": "ru_RU.UTF-8", **(env or {})}
    r = subprocess.run(cmd, cwd=P, input=stdin, capture_output=True, text=True, env=full_env)
    text = (r.stdout + r.stderr).replace(str(P), "…")
    text = "\n".join(line for line in text.splitlines() if not line.startswith(("Writing evaluated template", "Запись результатов обработки шаблона")))
    shown = " ".join(c.replace(str(P / ".venv/bin") + "/", "") for c in cmd)
    (OUT / f"{name}.txt").write_text(f"$ {shown}\n{text}\nrc={r.returncode}\n", encoding="utf-8")
    print(f"── {name} (rc={r.returncode})\n{text[-1500:]}")
    return text


def build(name: str, *extra: str) -> str:
    return run(name, [bin_("sphinx-build"), "-M", "html", "docs/source", "docs/build", *extra])


def edit(rel: str, old: str, new: str) -> None:
    path = P / rel
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"в {rel} нет «{old}»")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def write(rel: str, text: str) -> None:
    (P / rel).parent.mkdir(parents=True, exist_ok=True)
    (P / rel).write_text(text, encoding="utf-8")


def save(rel: str, name: str) -> None:
    """Копия файла проекта в текущем состоянии — для вставки в книгу."""
    shutil.copy(P / rel, OUT / name)


def shot(name: str, page: str, height: int = 780, width: int = 1240, sel: str = "") -> None:
    if not SHOTS:
        return
    raw = OUT / f"{name}.png"
    args = ["node", str(HERE / "site_shot.cjs"), str(raw), str(P / "docs/build/html" / page), str(width), str(height)]
    if sel:
        args.append(sel)
    subprocess.run(args, check=True, env={**os.environ, "NODE_PATH": str(NODE_PATH)})
    im = Image.open(raw)
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(IMG / f"site-{name}.png", optimize=True)


def prepare() -> None:
    shutil.rmtree(WORK, ignore_errors=True)
    WORK.mkdir()
    with zipfile.ZipFile(MATERIALS / f"{NAME}.zip") as zf:
        zf.extractall(WORK)
    subprocess.run([sys.executable, "-m", "venv", str(P / ".venv")], check=True)
    subprocess.run([bin_("pip"), "-q", "install", "-r", "requirements.txt", *DOCS_REQ], cwd=P, check=True)


# ── 4.12 ────────────────────────────────────────────────────────────────
def ch12() -> None:
    run("12-version", [bin_("sphinx-build"), "--version"])
    run("12-quickstart", [bin_("sphinx-quickstart"), "docs"], stdin="y\nОтчёт кафе\nМакаров М. Н.\n1.0\nru\n")
    # Пустую папку Git не хранит; без _static строгая сборка в Actions падает.
    write("docs/source/_static/.gitkeep", "")
    save("docs/source/conf.py", "12-conf.py")
    save("docs/source/index.rst", "12-index.rst")
    run("12-tree", ["find", "docs", "-not", "-path", "*/build/*"])
    build("12-build1")
    run("12-tree-build", ["find", "docs/build", "-maxdepth", "2"])
    shot("12-empty", "index.html", 440)
    build("12-build-again")
    # Практика 4.12: свой заголовок и абзац на главной.
    edit("docs/source/index.rst", "Отчёт кафе documentation\n========================\n\n"
         "Add your content using ``reStructuredText`` syntax. See the\n"
         "`reStructuredText <https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html>`_\n"
         "documentation for details.\n",
         "Отчёт кафе\n==========\n\n"
         "Программа читает файл смены кафе, считает выручку по официантам\n"
         "и печатает отчёт.\n")
    edit("docs/source/index.rst", ":caption: Contents:", ":caption: Содержание:")
    build("12-build-edited")
    shot("12-edited", "index.html", 440)
    # Опыт: заголовок короче черты подчёркивания — и наоборот.
    edit("docs/source/index.rst", "Отчёт кафе\n==========\n", "Отчёт кафе\n=====\n")
    build("12-build-short-underline")
    edit("docs/source/index.rst", "Отчёт кафе\n=====\n", "Отчёт кафе\n==========\n")
    # Опыт: язык en — надписи интерфейса меняются.
    edit("docs/source/conf.py", "language = 'ru'", "language = 'en'")
    build("12-build-en")
    edit("docs/source/conf.py", "language = 'en'", "language = 'ru'")
    build("12-build-ru", "-E")
    save("docs/source/index.rst", "12-index-edited.rst")


# ── 4.13 ────────────────────────────────────────────────────────────────
ORDERS_RST = """Заказы смены
============

.. automodule:: app.services.orders
   :members:
"""


def ch13() -> None:
    write("docs/source/orders.rst", ORDERS_RST)
    edit("docs/source/index.rst", ":caption: Содержание:\n", ":caption: Содержание:\n\n   orders\n")
    build("13-no-autodoc", "-q")
    edit("docs/source/conf.py", "extensions = []", "extensions = [\n    'sphinx.ext.autodoc',\n]")
    build("13-no-path", "-q")
    edit("docs/source/conf.py", "# -- Project information",
         "import sys\nfrom pathlib import Path\n\n"
         "# Корень проекта — на две папки выше conf.py: docs/source → docs → проект.\n"
         "sys.path.insert(0, str(Path(__file__).resolve().parents[2]))\n\n# -- Project information")
    build("13-autodoc", "-q")
    shot("13-autodoc", "orders.html", 900)
    edit("docs/source/conf.py", "    'sphinx.ext.autodoc',\n]",
         "    'sphinx.ext.autodoc',\n    'sphinx.ext.napoleon',\n]\n\n"
         "napoleon_google_docstring = True\nnapoleon_numpy_docstring = False")
    build("13-napoleon", "-q")
    shot("13-napoleon", "orders.html", 900)
    edit("docs/source/conf.py", "napoleon_numpy_docstring = False",
         "napoleon_numpy_docstring = False\n\nautodoc_typehints = 'description'")
    build("13-typehints", "-q", "-E")
    edit("docs/source/conf.py", "\n\nautodoc_typehints = 'description'", "")
    # Ошибка в докстринге: звёздочка без пары — начало выделения в reST.
    rel = "app/services/orders.py"
    original = (P / rel).read_text(encoding="utf-8")
    edit(rel, "        top: Сколько официантов оставить в результате. Значение 0\n"
              "            означает, что возвращаются все.",
              "        top: Сколько официантов оставить в результате. Значение 0\n"
              "            означает, что возвращаются все, *3 — три лучших.")
    run("13-bad-docstring-ruff", [bin_("ruff"), "check", rel])
    build("13-bad-docstring", "-q", "-E")
    shot("13-bad-docstring", "orders.html", 900)
    build("13-bad-docstring-W", "-q", "-E", "-W", "--keep-going")
    (P / rel).write_text(original, encoding="utf-8")
    edit("docs/source/conf.py", "    'sphinx.ext.napoleon',\n]", "    'sphinx.ext.napoleon',\n    'sphinx.ext.viewcode',\n]")
    build("13-viewcode", "-q", "-E")
    shot("13-viewcode", "orders.html", 520)
    shot("13-viewcode-source", "_modules/app/services/orders.html", 780)
    save("docs/source/conf.py", "13-conf.py")


# ── 4.14 ────────────────────────────────────────────────────────────────
USAGE_RST = """Запуск и проверки
=================

Программа читает файл смены ``data/smena.csv`` и печатает выручку
по каждому официанту. Суммы в файле записаны в копейках.

Установка
---------

1. Создайте окружение и установите зависимости.
2. Запустите программу из корня проекта.

.. code-block:: console

   python -m venv .venv
   pip install -r requirements.txt
   python main.py

Проверки
--------

* ``python -m pytest -v`` — двенадцать тестов;
* ``mypy app`` — проверка типов;
* ``ruff check app`` — проверка докстрингов.

.. note::

   Расчёт выручки описан в функции :func:`app.services.orders.revenue_by_waiter`,
   формат суммы — в :func:`app.utils.formatter.format_kopeks`.

Формат файла смены описан на странице `документации модуля csv
<https://docs.python.org/3/library/csv.html>`_.
"""


def ch14() -> None:
    write("docs/source/usage.rst", USAGE_RST)
    build("14-usage-orphan", "-q")
    edit("docs/source/index.rst", "   orders\n", "   usage\n   orders\n")
    build("14-usage", "-q")
    shot("14-usage", "usage.html", 900)
    # Ссылка на несуществующую функцию: в обычной сборке молчит, -n её находит.
    edit("docs/source/usage.rst", "format_kopeks`", "format_rubles`")
    build("14-badref", "-q", "-E")
    build("14-badref-n", "-q", "-E", "-n")
    edit("docs/source/usage.rst", "format_rubles`", "format_kopeks`")
    # sphinx-apidoc с настройками по умолчанию.
    run("14-apidoc", [bin_("sphinx-apidoc"), "-o", "docs/source/api", "app"])
    run("14-apidoc-ls", ["ls", "docs/source/api"])
    save("docs/source/api/app.services.rst", "14-app.services-default.rst")
    save("docs/source/api/modules.rst", "14-modules.rst")
    build("14-apidoc-orphan", "-q")
    edit("docs/source/index.rst", "   orders\n", "   api/modules\n")
    (P / "docs/source/orders.rst").unlink()
    build("14-apidoc-dup", "-q", "-E")
    shot("14-apidoc-dup", "api/app.domain.html", 900)
    # Поля dataclass описаны дважды: разделом Attributes и самим autodoc.
    edit("docs/source/conf.py", "napoleon_numpy_docstring = False",
         "napoleon_numpy_docstring = False\nnapoleon_use_ivar = True")
    build("14-apidoc-ivar", "-q", "-E")
    # Повтор без :undoc-members: и без «Базовые классы: object».
    run("14-apidoc-again", [bin_("sphinx-apidoc"), "-o", "docs/source/api", "app"])
    # Ключ --automodule-options в 9.1.1 разбирается, но в файлы не попадает;
    # действует только переменная окружения.
    run("14-apidoc-force-key", [bin_("sphinx-apidoc"), "-f", "-M", "--automodule-options", "members",
                                "-o", "docs/source/api", "app"])
    save("docs/source/api/app.services.rst", "14-app.services-key.rst")
    run("14-apidoc-force-opts", [bin_("sphinx-apidoc"), "-f", "-M", "-o", "docs/source/api", "app"],
        env={"SPHINX_APIDOC_OPTIONS": "members"})
    save("docs/source/api/app.services.rst", "14-app.services-members.rst")
    build("14-apidoc-clean", "-q", "-E")
    shot("14-apidoc-domain", "api/app.domain.html", 900)
    shot("14-genindex", "genindex.html", 900)
    shot("14-search", "search.html?q=выручка", 780)
    # Строгий режим ссылок на всём сайте: внешние типы и ошибка в Returns у format_kopeks.
    build("14-nitpicky-full", "-q", "-E", "-n")
    shot("14-format-kopeks", "api/app.utils.html", 900, sel="dl.py.function:has(> dt[id='app.utils.formatter.format_kopeks'])")
    save("docs/source/index.rst", "14-index.rst")


# ── 4.15 ────────────────────────────────────────────────────────────────
WORKFLOW = """name: Документация

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt -r docs/requirements.txt
      - run: sphinx-build -M html docs/source docs/build -W --keep-going
      - uses: actions/upload-pages-artifact@v5
        with:
          path: docs/build/html

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
"""


README_DOCS = """
## Документация

Сайт собирается Sphinx из докстрингов пакета app, тема Furo.

    pip install -r docs/requirements.txt
    SPHINX_APIDOC_OPTIONS=members sphinx-apidoc -f -M -o docs/source/api app
    sphinx-build -M html docs/source docs/build -E -W --keep-going

Готовый сайт — docs/build/html/index.html. Публикация на GitHub Pages
описана в .github/workflows/docs.yml: сборка при каждой отправке в main.
Страницы в docs/source/api создаёт sphinx-apidoc, руками их не правят.
"""


def ch15() -> None:
    shot("15-alabaster", "api/app.services.html", 780)
    edit("docs/source/conf.py", "html_theme = 'alabaster'", "html_theme = 'furo'")
    build("15-furo", "-q", "-E")
    shot("15-furo", "api/app.services.html", 780)
    edit("docs/source/conf.py", "html_theme = 'furo'", "html_theme = 'sphinx_rtd_theme'")
    build("15-rtd", "-q", "-E")
    shot("15-rtd", "api/app.services.html", 780)
    edit("docs/source/conf.py", "html_theme = 'sphinx_rtd_theme'", "html_theme = 'furo'")
    edit("docs/source/conf.py", "html_static_path = ['_static']",
         "html_static_path = ['_static']\nhtml_title = 'Отчёт кафе 1.0'")
    write("docs/requirements.txt", "".join(f"{r}\n" for r in DOCS_REQ[:2]))
    write(".github/workflows/docs.yml", WORKFLOW)
    readme = (P / "README.md").read_text(encoding="utf-8")
    readme = readme.replace("# Отчёт кафе — задокументированный проект", "# Отчёт кафе — проект с сайтом документации", 1)
    (P / "README.md").write_text(readme + README_DOCS, encoding="utf-8")
    gi = (P / ".gitignore")
    gi.write_text((gi.read_text(encoding="utf-8") if gi.exists() else "") + "docs/build/\n", encoding="utf-8")
    # Раздел Returns: текст до двоеточия napoleon считает типом — 4.16, шаг чтения сайта.
    edit("app/utils/formatter.py", "        Строка вида «1 250,00 ₽»: пробел разделяет тысячи, запятая\n        отделяет копейки.",
         "        Строка вида «1 250,00 ₽», в которой пробел разделяет тысячи,\n        а запятая отделяет копейки.")
    build("15-final", "-E", "-W", "--keep-going")
    build("15-final-n", "-q", "-E", "-n")
    shot("15-format-kopeks-fixed", "api/app.utils.html", 900, sel="dl.py.function:has(> dt[id='app.utils.formatter.format_kopeks'])")
    shot("15-final-index", "index.html", 780)
    save("docs/source/conf.py", "15-conf.py")
    save(".github/workflows/docs.yml", "15-docs.yml")


# ── 4.16: отсчёт предупреждений практики на паре ─────────────────────────
def ch16() -> None:
    """Числа для ленты отсчёта 4.16: та же настройка, что на паре, по шагам."""
    work = WORK / "para"
    shutil.rmtree(work, ignore_errors=True)
    shutil.copytree(P, work, ignore=shutil.ignore_patterns(".venv", "build", "api"))
    sb, ad = bin_("sphinx-build"), bin_("sphinx-apidoc")
    conf = work / "docs/source/conf.py"
    final = conf.read_text(encoding="utf-8")

    def step(tag: str, text: str, apidoc: list[str] | None = None) -> None:
        conf.write_text(text, encoding="utf-8")
        if apidoc is not None:
            subprocess.run([ad, "-f", *apidoc, "-o", "docs/source/api", "app"], cwd=work,
                           capture_output=True, check=True,
                           env={**os.environ, "SPHINX_APIDOC_OPTIONS": "members"} if apidoc else None)
        r = subprocess.run([sb, "-M", "html", "docs/source", "docs/build", "-E", "-q"],
                           cwd=work, capture_output=True, text=True, env={**os.environ, "LANG": "ru_RU.UTF-8"})
        text_out = (r.stdout + r.stderr).replace(str(work), "…")
        warns = [line for line in text_out.splitlines() if "WARNING" in line or "ERROR" in line]
        (OUT / f"16-{tag}.txt").write_text(text_out, encoding="utf-8")
        print(f"── 16-{tag}: {len(warns)}")

    no_nap = final.replace("    'sphinx.ext.napoleon',\n", "")
    for k in ("napoleon_google_docstring = True\n", "napoleon_numpy_docstring = False\n", "napoleon_use_ivar = True\n"):
        no_nap = no_nap.replace(k, "")
    no_ivar = final.replace("napoleon_use_ivar = True\n", "")
    step("1-autodoc", no_nap, [])
    step("2-napoleon", no_ivar)
    step("3-ivar", final)
    step("4-members", final, ["-M"])


def pack() -> None:
    target = MATERIALS / "otchet-kafe-sphinx.zip"
    skip = {".venv", "build", "__pycache__", ".mypy_cache", ".ruff_cache", ".pytest_cache"}
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(P.rglob("*")):
            rel = path.relative_to(P)
            if any(part in skip for part in rel.parts) or path.is_dir():
                continue
            zf.write(path, Path("otchet-kafe-sphinx") / rel)
    print("архив:", target)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    prepare()
    ch12()
    ch13()
    ch14()
    ch15()
    ch16()
    pack()


if __name__ == "__main__":
    main()
