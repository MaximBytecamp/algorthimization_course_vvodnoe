"""Кадры VS Code для глав 4.12–4.16 (Sphinx): весь путь шаг за шагом.

    python3 shoot_sphinx.py prepare           третий архив, .venv без Sphinx, редактор
    python3 shoot_sphinx.py ch12 ch13 ch14 ch15 ch16
    python3 shoot_sphinx.py crop              кадры в ../img/vscode-sphinx-*.png

Стадии идут строго по порядку: каждая продолжает проект с того места, где
закончилась предыдущая, как у студента, который читает главы подряд. Правки
файлов пишутся на диск этим скриптом (как будто набраны), редактор их
подхватывает; команды выполняются в терминале VS Code.

Съёмка фоновая, через `cdp.py`, как в `shoot_py.py`. Профиль —
/private/tmp/vsc-sphinx без расширений, светлая тема, bash --norc,
LANG=ru_RU.UTF-8 (в настройках профиля): вывод Sphinx совпадает с выводами
в raw/sphinx, которые пишет sphinx_run.py.

Кадры терминала снимаются с развёрнутой панелью и обрезаются по её границам
(`term`), кадры редактора — окно целиком (`win`).
"""
import asyncio
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import cdp
import shoot_py as sp
import sphinx_run as sr
from cdp import Editor, launch

cdp.PROFILE = "/private/tmp/vsc-sphinx"
MATERIALS = Path(__file__).resolve().parent.parent / "materials"
STUDENT = Path("/private/tmp/student-sphinx-vsc")
NAME = "otchet-kafe-dokumentirovan"
RAW = Path(__file__).resolve().parent / "raw" / "vsc"
IMG = Path(__file__).resolve().parent.parent / "img"
P = STUDENT / NAME
ANSWERS = ["y", "Отчёт кафе", "Макаров М. Н.", "1.0", "ru"]
BUILD = "sphinx-build -M html docs/source docs/build"
APIDOC = "SPHINX_APIDOC_OPTIONS=members sphinx-apidoc -f -M -o docs/source/api app"


def prepare() -> None:
    shutil.rmtree(STUDENT, ignore_errors=True)
    STUDENT.mkdir()
    with zipfile.ZipFile(MATERIALS / f"{NAME}.zip") as zf:
        zf.extractall(STUDENT)
    subprocess.run([sys.executable, "-m", "venv", str(P / ".venv")], check=True)
    subprocess.run([str(P / ".venv/bin/pip"), "-q", "install", "-r", "requirements.txt"], cwd=P, check=True)
    launch(str(P))


def edit(rel: str, old: str, new: str) -> None:
    path = P / rel
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"в {rel} нет «{old}»")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def write(rel: str, text: str) -> None:
    (P / rel).parent.mkdir(parents=True, exist_ok=True)
    (P / rel).write_text(text, encoding="utf-8")


def line_of(rel: str, fragment: str) -> int:
    for n, text in enumerate((P / rel).read_text(encoding="utf-8").splitlines(), 1):
        if fragment in text:
            return n
    raise SystemExit(f"в {rel} нет «{fragment}»")


async def win(e: Editor, name: str) -> None:
    await sp.park(e)
    await e.shot(f"{RAW}/{name}.png")


async def vterm(e: Editor, command: str, wait: float = 8.0, clear: bool = True) -> None:
    """Свежий терминал с активированным окружением, как у студента после главы 4.12, §3.

    Активация и очистка экрана идут одной строкой, поэтому на кадре видна
    только команда шага, а приглашение начинается с (.venv).
    """
    await e.palette("Terminal: Kill All Terminals", 1.2)
    await e.palette("Terminal: Create New Terminal", 3.0)
    await e.paste("source .venv/bin/activate" + (" && clear" if clear else ""), 0.2)
    await e.key("Enter", 1.0)
    if command:
        await e.paste(command, 0.3)
        await e.key("Enter", wait)


async def term(e: Editor, name: str, command: str, wait: float = 8.0, clear: bool = True) -> None:
    """Команда в свежем терминале; кадр — только развёрнутая панель."""
    await vterm(e, command, wait, clear)
    await e.palette("View: Toggle Maximized Panel", 1.2)
    await sp.park(e)
    r = await e.rect(".part.panel")
    await e.shot(f"{RAW}/{name}.png", clip=r)
    await e.palette("View: Toggle Maximized Panel", 0.8)


async def show(e: Editor, rel: str, name: str, line: int | None = None, reveal: bool = True) -> None:
    """Файл открыт в редакторе и найден в проводнике."""
    await sp.reset(e)
    await sp.open_file(e, rel, 3.0)
    if line:
        await sp.goto(e, line)
    if reveal:
        await e.palette("File: Reveal Active File in Explorer View", 1.2)
    await e.palette("View: Focus Active Editor Group", 0.5)
    await win(e, name)


# ── 4.12 ────────────────────────────────────────────────────────────────
async def st_ch12(e: Editor) -> None:
    shutil.rmtree(P / "docs", ignore_errors=True)
    await sp.reset(e)
    await sp.reset(e)
    await e.palette("Terminal: Kill All Terminals", 1.2)
    await e.palette("Terminal: Create New Terminal", 3.0)
    await e.paste("clear", 0.2)
    await e.key("Enter", 0.6)
    await e.paste("source .venv/bin/activate", 0.3)
    await e.key("Enter", 1.5)
    await e.palette("View: Toggle Maximized Panel", 1.2)
    await sp.park(e)
    await e.shot(f"{RAW}/12-activate.png", clip=await e.rect(".part.panel"))
    await e.palette("View: Toggle Maximized Panel", 0.8)
    await term(e, "12-install", "pip install sphinx 2>&1 | tail -4", 50.0)
    await term(e, "12-version", "sphinx-build --version", 4.0)
    # Мастер: первый вопрос и итог.
    await sp.reset(e)
    await vterm(e, "sphinx-quickstart docs", 4.0)
    await e.palette("View: Toggle Maximized Panel", 1.2)
    r = await e.rect(".part.panel")
    await e.shot(f"{RAW}/12-qs-first.png", clip=r)
    for answer in ANSWERS:
        await e.paste(answer, 0.4)
        await e.key("Enter", 1.5)
    await asyncio.sleep(2.0)
    await sp.park(e)
    await e.shot(f"{RAW}/12-qs-done.png", clip=r)
    await e.palette("View: Toggle Maximized Panel", 0.8)
    await show(e, "docs/source/conf.py", "12-conf")
    await show(e, "docs/source/index.rst", "12-index")
    await term(e, "12-build", BUILD, 10.0)
    await show(e, "docs/build/html/index.html", "12-build-tree-open")
    await e.palette("View: Close All Editors", 0.8)
    await win(e, "12-build-tree")
    await term(e, "12-build-again", BUILD, 8.0)
    # Своя главная страница.
    edit("docs/source/index.rst", "Отчёт кафе documentation\n========================\n\n"
         "Add your content using ``reStructuredText`` syntax. See the\n"
         "`reStructuredText <https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html>`_\n"
         "documentation for details.\n",
         "Отчёт кафе\n==========\n\n"
         "Программа читает файл смены кафе, считает выручку по официантам\n"
         "и печатает отчёт.\n")
    edit("docs/source/index.rst", ":caption: Contents:", ":caption: Содержание:")
    await show(e, "docs/source/index.rst", "12-index-edited")
    await term(e, "12-build-edited", BUILD, 8.0)
    # .gitignore: строки docs/build/ в третьем архиве нет — её добавляют.
    await show(e, ".gitignore", "12-gitignore-before")
    edit(".gitignore", ".mypy_cache/\n", ".mypy_cache/\ndocs/build/\n")
    await show(e, ".gitignore", "12-gitignore")
    write("docs/source/_static/.gitkeep", "")
    await show(e, "docs/source/_static/.gitkeep", "12-gitkeep")


# ── 4.13 ────────────────────────────────────────────────────────────────
async def st_ch13(e: Editor) -> None:
    write("docs/source/orders.rst", sr.ORDERS_RST)
    await show(e, "docs/source/orders.rst", "13-orders-rst")
    edit("docs/source/index.rst", ":caption: Содержание:\n", ":caption: Содержание:\n\n   orders\n")
    await show(e, "docs/source/index.rst", "13-index-orders")
    await term(e, "13-err-directive", BUILD + " -q", 8.0)
    edit("docs/source/conf.py", "extensions = []", "extensions = [\n    'sphinx.ext.autodoc',\n]")
    await show(e, "docs/source/conf.py", "13-conf-autodoc", line_of("docs/source/conf.py", "extensions"))
    await term(e, "13-err-import", BUILD + " -q", 8.0)
    edit("docs/source/conf.py", "# -- Project information",
         "import sys\nfrom pathlib import Path\n\n"
         "# Корень проекта — на две папки выше conf.py: docs/source → docs → проект.\n"
         "sys.path.insert(0, str(Path(__file__).resolve().parents[2]))\n\n# -- Project information")
    await show(e, "docs/source/conf.py", "13-conf-path", 9)
    await term(e, "13-err-indent", BUILD + " -q", 8.0)
    edit("docs/source/conf.py", "    'sphinx.ext.autodoc',\n]",
         "    'sphinx.ext.autodoc',\n    'sphinx.ext.napoleon',\n]\n\n"
         "napoleon_google_docstring = True\nnapoleon_numpy_docstring = False")
    await show(e, "docs/source/conf.py", "13-conf-napoleon", line_of("docs/source/conf.py", "extensions"))
    await term(e, "13-build-napoleon", BUILD + " -q", 8.0)
    # Звёздочка в докстринге.
    rel = "app/services/orders.py"
    original = (P / rel).read_text(encoding="utf-8")
    edit(rel, "            означает, что возвращаются все.", "            означает, что возвращаются все, *3 — три лучших.")
    await show(e, rel, "13-orders-star", line_of(rel, "*3"))
    await term(e, "13-ruff-star", f"ruff check {rel}", 5.0)
    await term(e, "13-warn-star", BUILD + " -q -E", 9.0)
    await term(e, "13-warn-W", BUILD + " -q -E -W --keep-going; echo \"код завершения: $?\"", 9.0)
    (P / rel).write_text(original, encoding="utf-8")
    await term(e, "13-clean-W", BUILD + " -q -E -W --keep-going; echo \"код завершения: $?\"", 9.0)
    edit("docs/source/conf.py", "    'sphinx.ext.napoleon',\n]", "    'sphinx.ext.napoleon',\n    'sphinx.ext.viewcode',\n]")
    await show(e, "docs/source/conf.py", "13-conf-viewcode", line_of("docs/source/conf.py", "extensions"))
    await term(e, "13-build-viewcode", BUILD + " -q", 9.0)


# ── 4.14 ────────────────────────────────────────────────────────────────
async def st_ch14(e: Editor) -> None:
    write("docs/source/usage.rst", sr.USAGE_RST)
    await show(e, "docs/source/usage.rst", "14-usage-rst")
    await term(e, "14-warn-orphan", BUILD + " -q", 8.0)
    edit("docs/source/index.rst", "   orders\n", "   usage\n   orders\n")
    await show(e, "docs/source/index.rst", "14-index-usage")
    await term(e, "14-build-usage", BUILD + " -q", 8.0)
    await term(e, "14-apidoc-default", "sphinx-apidoc -o docs/source/api app", 5.0)
    await show(e, "docs/source/api/app.services.rst", "14-apidoc-file")
    edit("docs/source/index.rst", "   orders\n", "   api/modules\n")
    (P / "docs/source/orders.rst").unlink()
    await show(e, "docs/source/index.rst", "14-index-api")
    await term(e, "14-warn-dup", BUILD + " -q -E", 10.0)
    edit("docs/source/conf.py", "napoleon_numpy_docstring = False",
         "napoleon_numpy_docstring = False\nnapoleon_use_ivar = True")
    await show(e, "docs/source/conf.py", "14-conf-ivar", line_of("docs/source/conf.py", "napoleon_use_ivar"))
    await term(e, "14-build-ivar", BUILD + " -q -E", 10.0)
    await term(e, "14-apidoc-members", APIDOC, 5.0)
    await show(e, "docs/source/api/app.services.rst", "14-apidoc-file-members")
    await term(e, "14-build-members", BUILD + " -q -E", 10.0)
    # Попробуйте сами: новый модуль без apidoc и с ним.
    write("app/utils/percent.py", PERCENT)
    await show(e, "app/utils/percent.py", "14-percent")
    await term(e, "14-ruff-percent", "ruff check app/utils/percent.py", 5.0)
    await term(e, "14-apidoc-percent", APIDOC + " && grep -n percent docs/source/api/app.utils.rst", 6.0)
    (P / "app/utils/percent.py").unlink()
    await term(e, "14-stale", "sphinx-apidoc -o docs/source/api app && " + BUILD + " -q -E", 12.0)
    await term(e, "14-stale-fixed", APIDOC + " && " + BUILD + " -q -E", 12.0)
    await st_indices(e)


INDICES = """

Указатели
---------

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
"""


PERCENT = '''"""Проценты от суммы."""


def share(part: int, total: int) -> float:
    """Считает долю части от целого в процентах.

    Args:
        part: Часть, в копейках.
        total: Целое, в копейках, больше нуля.

    Returns:
        Доля в процентах, округлённая до одного знака.
    """
    return round(part * 100 / total, 1)


def rounded(value: float) -> int:
    return round(value)
'''


# ── 4.15 ────────────────────────────────────────────────────────────────
async def st_ch15(e: Editor) -> None:
    await term(e, "15-install-furo", "pip install furo 2>&1 | tail -4", 35.0)
    edit("docs/source/conf.py", "html_theme = 'alabaster'", "html_theme = 'furo'")
    edit("docs/source/conf.py", "html_static_path = ['_static']",
         "html_static_path = ['_static']\nhtml_title = 'Отчёт кафе 1.0'")
    await show(e, "docs/source/conf.py", "15-conf-furo", line_of("docs/source/conf.py", "html_theme"))
    await term(e, "15-build-furo", BUILD + " -E", 12.0)
    await term(e, "15-pip-show", "pip show sphinx furo | grep -E '^(Name|Version)'", 5.0)
    write("docs/requirements.txt", "sphinx==9.1.1\nfuro==2025.12.19\n")
    await show(e, "docs/requirements.txt", "15-docs-req")
    write(".github/workflows/docs.yml", sr.WORKFLOW)
    await show(e, ".github/workflows/docs.yml", "15-workflow")
    await term(e, "15-strict", BUILD + " -E -W --keep-going 2>&1 | tail -4", 14.0)


async def st_indices(e: Editor) -> None:
    """4.14 §7: ссылки на указатель и поиск в index.rst."""
    if "genindex" not in (P / "docs/source/index.rst").read_text(encoding="utf-8"):
        (P / "docs/source/index.rst").write_text(
            (P / "docs/source/index.rst").read_text(encoding="utf-8").rstrip("\n") + "\n" + INDICES,
            encoding="utf-8")
    await show(e, "docs/source/index.rst", "14-index-indices")
    await term(e, "14-build-indices", BUILD + " -q", 10.0)


GIT = Path("/private/tmp/student-sphinx-git/otchet-kafe-dokumentirovan")


async def side(e: Editor, name: str) -> None:
    """Кадр боковой панели (проводник или Source Control) по её границам."""
    await sp.park(e)
    r = await e.rect(".part.sidebar")
    await e.shot(f"{RAW}/{name}.png", clip=[r[0], r[1], r[2], r[3]])


async def st_git12(e: Editor) -> None:
    """4.12 §7 на копии проекта под Git: docs/build до и после строки в .gitignore.

    Перед стадией редактор запускают на GIT (`launch(str(GIT))`): там проект
    закоммичен до главы 4.12, а docs собрана, как к концу главы.
    """
    gi = GIT / ".gitignore"
    text = gi.read_text(encoding="utf-8").replace("docs/build/\n", "")
    gi.write_text(text, encoding="utf-8")
    await sp.reset(e)
    await e.palette("Git: Refresh", 3.0)
    await e.palette("View: Show Source Control", 2.0)
    await side(e, "12-scm-before")
    await sp.reset(e)
    await sp.open_file(e, ".gitignore", 3.0)
    await win(e, "12-gitignore-before")
    gi.write_text(text + "docs/build/\n", encoding="utf-8")
    await asyncio.sleep(2.0)
    await e.palette("File: Revert File", 1.0)
    await sp.goto(e, 7)
    await e.palette("Git: Refresh", 4.0)
    await win(e, "12-gitignore")
    await sp.open_file(e, "docs/build/html/index.html", 3.0)
    await e.palette("File: Reveal Active File in Explorer View", 1.5)
    await e.palette("View: Close All Editors", 0.8)
    await e.palette("View: Show Explorer", 1.0)
    await side(e, "12-build-ignored")
    await e.palette("View: Show Source Control", 2.5)
    await side(e, "12-scm-after")


async def st_wf(e: Editor) -> None:
    """Только кадр docs.yml — после смены версий действий, на проекте после ch15."""
    write(".github/workflows/docs.yml", sr.WORKFLOW)
    await show(e, ".github/workflows/docs.yml", "15-workflow")


# ── 4.16 ────────────────────────────────────────────────────────────────
async def st_ch16(e: Editor) -> None:
    """Ошибка в format_kopeks: вывод -n, файл до и после, повтор -n."""
    rel = "app/utils/formatter.py"
    await term(e, "16-nitpicky", BUILD + " -q -E -n", 12.0)
    await show(e, rel, "16-formatter-before", line_of(rel, "Returns:"))
    edit(rel, "        Строка вида «1 250,00 ₽»: пробел разделяет тысячи, запятая\n        отделяет копейки.",
         "        Строка вида «1 250,00 ₽», в которой пробел разделяет тысячи,\n        а запятая отделяет копейки.")
    await show(e, rel, "16-formatter-after", line_of(rel, "Returns:"))
    await term(e, "16-nitpicky-fixed", BUILD + " -q -E -n", 12.0)
    await term(e, "16-checks", "ruff check app && python -m doctest app/utils/formatter.py"
               " && python -m pytest -q", 10.0)


STAGES = {name[3:]: fn for name, fn in globals().items() if name.startswith("st_")}


async def run(names: list[str]) -> None:
    for name in names:
        print(f"── {name}")
        async with Editor() as e:
            await e.send("Emulation.setFocusEmulationEnabled", enabled=True)
            await STAGES[name](e)


def crop() -> None:
    """Кадры в книгу: ширина не больше 1600, как у остальных кадров VS Code темы."""
    from PIL import Image, ImageChops
    for raw in sorted(RAW.glob("*.png")):
        if raw.stem.endswith("-open"):  # промежуточный кадр, в книгу не идёт
            continue
        im = Image.open(raw).convert("RGB")
        # Кадр терминала — развёрнутая панель без строки состояния: снизу
        # пустое поле, обрезаем его по последней строке текста.
        body = im.crop((0, 0, im.width - 40, im.height))
        bg = Image.new("RGB", body.size, body.getpixel((body.width - 5, body.height - 5)))
        box = ImageChops.difference(body, bg).convert("L").point(lambda v: 255 if v > 40 else 0).getbbox()
        if box and im.height - box[3] > 120:
            im = im.crop((0, 0, im.width, min(im.height, box[3] + 36)))
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(IMG / f"vscode-sphinx-{raw.stem}.png", optimize=True)
        print(raw.stem, im.size)


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    if sys.argv[1] == "prepare":
        prepare()
        return
    if sys.argv[1] == "crop":
        crop()
        return
    asyncio.run(run(sys.argv[1:]))


if __name__ == "__main__":
    main()
