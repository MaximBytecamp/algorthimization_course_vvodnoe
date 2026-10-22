"""Кадры VS Code для пошаговых блоков глав 4.10 и 4.11 (ветка Python).

    python3 shoot_py.py prepare            распаковать второй архив и поднять редактор
    python3 shoot_py.py <стадия> [<стадия> …]

Съёмка фоновая, через `cdp.py`, как в `shoot_types.py` и `shoot_go.py`.
Профиль редактора — /private/tmp/vsc-py с расширениями Python, autoDocstring
и Ruff.
"""
import asyncio
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import websockets

import cdp
from cdp import Editor, launch

cdp.PROFILE = "/private/tmp/vsc-py"
MATERIALS = Path(__file__).resolve().parent.parent / "materials"
STUDENT = Path("/private/tmp/student-py-shots")
RAW = Path(__file__).resolve().parent / "raw"
W, H = 1240, 780
NAME = "otchet-kafe-start"
DOCUMENTED = MATERIALS / "build" / "otchet-kafe-dokumentirovan"


def project() -> Path:
    return STUDENT / NAME


def prepare() -> None:
    shutil.rmtree(project(), ignore_errors=True)
    STUDENT.mkdir(exist_ok=True)
    with zipfile.ZipFile(MATERIALS / f"{NAME}.zip") as zf:
        zf.extractall(STUDENT)
    subprocess.run([sys.executable, "-m", "venv", str(project() / ".venv")], check=True)
    subprocess.run([str(project() / ".venv/bin/pip"), "-q", "install", "-r", "requirements.txt"],
                   cwd=project(), check=True)
    settings = project() / ".vscode" / "settings.json"
    text = settings.read_text(encoding="utf-8").rstrip().rstrip("}").rstrip().rstrip(",")
    settings.write_text(text + f',\n  "python.defaultInterpreterPath": "{project()}/.venv/bin/python"\n}}\n',
                        encoding="utf-8")
    launch(str(project()))


def line_of(rel: str, fragment: str) -> int:
    for n, text in enumerate((project() / rel).read_text(encoding="utf-8").splitlines(), 1):
        if fragment in text:
            return n
    raise SystemExit(f"в {rel} нет «{fragment}»")


async def panel(e: Editor, want: bool) -> None:
    for _ in range(3):
        shown = await e.js("(() => { const p = document.querySelector('.part.panel');"
                           " return !!p && p.getBoundingClientRect().height > 30; })()")
        if shown == want:
            return
        await e.key("Meta+J", 1.0)


async def reset(e: Editor) -> None:
    await e.send("Emulation.setFocusEmulationEnabled", enabled=True)
    await e.size(W, H)
    await e.key("Escape", 0.3)
    await e.palette("View: Close All Editors", 0.8)
    await e.palette("View: Show Explorer", 0.8)
    await panel(e, False)


async def open_file(e: Editor, name: str, wait: float = 4.0) -> None:
    await e.key("Meta+P", 0.8)
    await e.paste(name, 1.0)
    await e.key("Enter", wait)


async def goto(e: Editor, line: int, col: int = 1) -> None:
    await e.key("Ctrl+G", 0.6)
    await e.paste(f"{line}:{col}", 0.4)
    await e.key("Enter", 0.6)


async def terminal(e: Editor, command: str, wait: float = 8.0) -> None:
    await e.palette("Terminal: Kill All Terminals", 1.2)
    await e.palette("Terminal: Create New Terminal", 3.0)
    await e.paste("clear", 0.2)
    await e.key("Enter", 0.6)
    await e.paste(command, 0.3)
    await e.key("Enter", wait)


async def park(e: Editor) -> None:
    await e.move(200, 640, 0.3)


async def st_extensions(e: Editor) -> None:
    """4.10, шаг установки: все расширения темы в списке установленных."""
    await reset(e)
    await e.palette("Extensions: Show Installed Extensions", 3.0)
    await panel(e, False)
    await park(e)
    await e.shot(f"{RAW}/py-ext-installed-all.png")


async def st_ruffext(e: Editor) -> None:
    """4.10: поиск расширения Ruff по идентификатору."""
    await reset(e)
    await e.palette("Extensions: Show Installed Extensions", 2.0)
    await e.key("Meta+A", 0.3)
    await e.paste("charliermarsh.ruff", 4.0)
    await panel(e, False)
    await park(e)
    await e.shot(f"{RAW}/py-ext-ruff.png")


async def st_filled(e: Editor) -> None:
    """4.10: заготовка генератора заполнена — докстринг revenue_by_waiter."""
    rel = "app/services/orders.py"
    original = (project() / rel).read_text(encoding="utf-8")
    documented = (DOCUMENTED / rel).read_text(encoding="utf-8")
    start = documented.index("def revenue_by_waiter")
    end = documented.index("    if not orders:", start)
    func_doc = documented[start:end]
    text = original.replace(original[original.index("def revenue_by_waiter"):original.index("    if not orders:")], func_doc)
    (project() / rel).write_text(text, encoding="utf-8")
    try:
        await reset(e)
        await open_file(e, "orders.py", 6.0)
        await goto(e, line_of(rel, "def revenue_by_waiter"))
        await e.palette("View: Focus Active Editor Group", 0.5)
        await park(e)
        await e.shot(f"{RAW}/py-generate-filled.png")
    finally:
        (project() / rel).write_text(original, encoding="utf-8")


async def st_fileclean(e: Editor) -> None:
    """4.10 и 4.11: модуль задокументирован — проверка файла проходит."""
    rel = "app/services/orders.py"
    original = (project() / rel).read_text(encoding="utf-8")
    try:
        await reset(e)
        await open_file(e, "orders.py", 4.0)
        await terminal(e, f".venv/bin/ruff check {rel}", 6.0)
        await park(e)
        await e.shot(f"{RAW}/py-ruff-file-before.png")
        (project() / rel).write_text((DOCUMENTED / rel).read_text(encoding="utf-8"), encoding="utf-8")
        await asyncio.sleep(2.0)
        await terminal(e, f".venv/bin/ruff check {rel}", 6.0)
        await park(e)
        await e.shot(f"{RAW}/py-ruff-file-after.png")
    finally:
        (project() / rel).write_text(original, encoding="utf-8")



PROBA_GEN = """from app.domain.order import Order


def revenue_by_waiter(orders: list[Order], top: int = 0) -> dict[str, int]:
    
    if not orders:
        raise ValueError("Список заказов пуст")
    return {}
"""
BASE_SETTINGS = {
    "autoDocstring.docstringFormat": "google",
    "autoDocstring.startOnNewLine": False,
    "autoDocstring.includeName": False,
    "autoDocstring.guessTypes": True,
}
TEMPLATE = """{{summaryPlaceholder}}

{{#parametersExist}}
Args:
{{#args}}
    {{var}}: {{descriptionPlaceholder}}
{{/args}}
{{#kwargs}}
    {{var}}: {{descriptionPlaceholder}}. По умолчанию {{&default}}.
{{/kwargs}}
{{/parametersExist}}
{{#exceptionsExist}}

Raises:
{{#exceptions}}
    {{type}}: {{descriptionPlaceholder}}
{{/exceptions}}
{{/exceptionsExist}}
{{#returnsExist}}

Returns:
    {{descriptionPlaceholder}}
{{/returnsExist}}
"""
VARIANTS = {
    "base": {},
    "startOnNewLine": {"autoDocstring.startOnNewLine": True},
    "includeName": {"autoDocstring.includeName": True},
    "guessTypes-false": {"autoDocstring.guessTypes": False},
    "extendedSummary": {"autoDocstring.includeExtendedSummary": True},
    "quoteStyle": {"autoDocstring.quoteStyle": "\'\'\'"},
    "google-notypes": {"autoDocstring.docstringFormat": "google-notypes"},
    "numpy": {"autoDocstring.docstringFormat": "numpy"},
    "sphinx": {"autoDocstring.docstringFormat": "sphinx"},
    "pep257": {"autoDocstring.docstringFormat": "pep257"},
    "one-line-sphinx": {"autoDocstring.docstringFormat": "one-line-sphinx"},
    "template": {"autoDocstring.customTemplatePath": ".vscode/docstring.mustache"},
}
CAPTURED = Path(__file__).resolve().parent / "raw" / "autodocstring-variants.txt"
ONLY: list[str] = []


def write_settings(extra: dict) -> None:
    data = dict(BASE_SETTINGS)
    data["python.defaultInterpreterPath"] = f"{project()}/.venv/bin/python"
    data.update(extra)
    (project() / ".vscode" / "settings.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


async def st_variants(e: Editor) -> None:
    """4.10: заготовка autoDocstring при каждой настройке — настоящий текст."""
    (project() / ".vscode" / "docstring.mustache").write_text(TEMPLATE, encoding="utf-8")
    original = (project() / ".vscode" / "settings.json").read_text(encoding="utf-8")
    out = []
    try:
        for name, extra in VARIANTS.items():
            if ONLY and name not in ONLY:
                continue
            write_settings(extra)
            (project() / "proba.py").write_text(PROBA_GEN, encoding="utf-8")
            await reset(e)
            await open_file(e, "proba.py", 4.0)
            await e.palette("File: Revert File", 1.5)
            await goto(e, 5, 5)
            await e.palette("Generate Docstring", 2.5)
            await e.key("Escape", 0.3)
            await e.key("Meta+S", 1.5)
            text = (project() / "proba.py").read_text(encoding="utf-8")
            body = text[text.index("def revenue_by_waiter"):text.index("    if not orders")]
            out.append(f"===== {name}\n{body}")
            print(f"  {name}: {len(body.splitlines())} строк")
        CAPTURED.write_text("\n".join(out), encoding="utf-8")
    finally:
        (project() / ".vscode" / "settings.json").write_text(original, encoding="utf-8")
        (project() / "proba.py").unlink(missing_ok=True)



PY_SNIPPET = """{
  "Докстринг в формате Google": {
    "scope": "python",
    "prefix": "dsg",
    "body": [
      "\\"\\"\\"${1:Действие функции одним предложением.}",
      "",
      "Args:",
      "    ${2:параметр}: ${3:ограничения и смысл}",
      "",
      "Returns:",
      "    ${4:что означает результат}",
      "\\"\\"\\""
    ],
    "description": "Заготовка докстринга с разделами Args и Returns"
  }
}
"""


async def st_pysnippet(e: Editor) -> None:
    """4.10: сниппет dsg — команда настройки, подсказка, вставка."""
    await reset(e)
    await e.palette("Snippets: Configure Snippets", 2.5)
    await e.shot(f"{RAW}/py-snippet-configure.png")
    await e.key("Escape", 0.5)
    (project() / ".vscode" / "python.code-snippets").write_text(PY_SNIPPET, encoding="utf-8")
    (project() / "proba.py").write_text(PROBA_GEN, encoding="utf-8")
    try:
        await reset(e)
        await open_file(e, "proba.py", 5.0)
        await e.palette("File: Revert File", 1.5)
        await goto(e, 5, 5)
        await e.type("dsg", 2.5)
        await e.shot(f"{RAW}/py-snippet-list.png")
        await e.key("Enter", 1.5)
        await e.shot(f"{RAW}/py-snippet-inserted.png")
        await e.key("Escape", 0.3)
        await e.key("Meta+S", 1.5)
        text = (project() / "proba.py").read_text(encoding="utf-8")
        (RAW / "py-snippet-inserted.txt").write_text(text, encoding="utf-8")
        print(text)
    finally:
        (project() / "proba.py").unlink(missing_ok=True)


STAGES = {name[3:]: fn for name, fn in globals().items() if name.startswith("st_")}


async def run(names: list[str]) -> None:
    for name in names:
        print(f"── {name}")
        for attempt in (1, 2):
            try:
                async with Editor() as e:
                    await STAGES[name](e)
                break
            except (websockets.ConnectionClosed, ConnectionError, RuntimeError) as err:
                print(f"  попытка {attempt}: {err}")
                await asyncio.sleep(8)


def main() -> None:
    RAW.mkdir(exist_ok=True)
    if "--only" in sys.argv:
        k = sys.argv.index("--only")
        ONLY.extend(sys.argv[k + 1].split(","))
        del sys.argv[k:k + 2]
    if sys.argv[1] == "prepare":
        prepare()
        return
    asyncio.run(run(sys.argv[1:]))


if __name__ == "__main__":
    main()
