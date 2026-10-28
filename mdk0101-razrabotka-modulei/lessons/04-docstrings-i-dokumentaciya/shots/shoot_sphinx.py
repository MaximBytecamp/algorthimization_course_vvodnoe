"""Кадры VS Code для глав 4.12–4.16 (Sphinx).

    python3 shoot_sphinx.py prepare        третий архив, окружение со Sphinx, редактор
    python3 shoot_sphinx.py <стадия> […]   quickstart tree build
    python3 shoot_sphinx.py crop           кадры в ../img/vscode-sphinx-*.png

Съёмка фоновая, через `cdp.py`, как в `shoot_py.py`. Профиль —
/private/tmp/vsc-sphinx без расширений: в кадрах только проводник, файлы
и терминал. Язык терминала русский (LANG в настройках профиля), поэтому
вывод Sphinx совпадает с выводами в raw/sphinx, которые пишет sphinx_run.py.
"""
import asyncio
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import cdp
import shoot_py as sp
from cdp import Editor, launch

cdp.PROFILE = "/private/tmp/vsc-sphinx"
MATERIALS = Path(__file__).resolve().parent.parent / "materials"
STUDENT = Path("/private/tmp/student-sphinx-vsc")
NAME = "otchet-kafe-dokumentirovan"
RAW = Path(__file__).resolve().parent / "raw"
P = STUDENT / NAME
ANSWERS = ["y", "Отчёт кафе", "Макаров М. Н.", "1.0", "ru"]


def prepare() -> None:
    shutil.rmtree(STUDENT, ignore_errors=True)
    STUDENT.mkdir()
    with zipfile.ZipFile(MATERIALS / f"{NAME}.zip") as zf:
        zf.extractall(STUDENT)
    subprocess.run([sys.executable, "-m", "venv", str(P / ".venv")], check=True)
    subprocess.run([str(P / ".venv/bin/pip"), "-q", "install", "-r", "requirements.txt", "sphinx==9.1.1"],
                   cwd=P, check=True)
    launch(str(P))


async def maximize_panel(e: Editor) -> None:
    await e.palette("View: Toggle Maximized Panel", 1.0)


async def st_quickstart(e: Editor) -> None:
    """4.12 §3: ответы на вопросы sphinx-quickstart в терминале."""
    shutil.rmtree(P / "docs", ignore_errors=True)
    await sp.reset(e)
    await sp.terminal(e, ".venv/bin/sphinx-quickstart docs", 4.0)
    await maximize_panel(e)
    await e.shot(f"{RAW}/sphinx-qs-1.png")
    for answer in ANSWERS:
        await e.paste(answer, 0.4)
        await e.key("Enter", 1.5)
    await asyncio.sleep(2.0)
    await e.shot(f"{RAW}/sphinx-qs-2.png")
    await maximize_panel(e)


async def st_tree(e: Editor) -> None:
    """4.12 §4: дерево docs/ в проводнике и открытый conf.py."""
    await sp.reset(e)
    await sp.open_file(e, "docs/source/conf.py", 3.0)
    await e.palette("File: Reveal Active File in Explorer View", 1.5)
    await sp.park(e)
    await e.shot(f"{RAW}/sphinx-tree-conf.png")
    await sp.open_file(e, "docs/source/index.rst", 3.0)
    await sp.park(e)
    await e.shot(f"{RAW}/sphinx-tree-index.png")


async def st_build(e: Editor) -> None:
    """4.12 §5: первая сборка, конец вывода."""
    shutil.rmtree(P / "docs" / "build", ignore_errors=True)
    await sp.reset(e)
    await sp.terminal(e, ".venv/bin/sphinx-build -M html docs/source docs/build", 10.0)
    await maximize_panel(e)
    await e.shot(f"{RAW}/sphinx-build.png")
    await maximize_panel(e)


STAGES = {name[3:]: fn for name, fn in globals().items() if name.startswith("st_")}


async def run(names: list[str]) -> None:
    for name in names:
        print(f"── {name}")
        async with Editor() as e:
            await STAGES[name](e)


FRAMES = ["qs-2", "tree-conf", "build"]


def crop() -> None:
    """Кадры в книгу: ширина 1600, как у остальных кадров VS Code темы."""
    from PIL import Image
    for name in FRAMES:
        im = Image.open(RAW / f"sphinx-{name}.png")
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(RAW.parent.parent / "img" / f"vscode-sphinx-{name}.png", optimize=True)


def main() -> None:
    RAW.mkdir(exist_ok=True)
    if sys.argv[1] == "prepare":
        prepare()
        return
    if sys.argv[1] == "crop":
        crop()
        return
    asyncio.run(run(sys.argv[1:]))


if __name__ == "__main__":
    main()
