"""Кадры VS Code для глав 4.1–4.4 (аннотации и проверка типов).

    python3 shoot_types.py prepare bez|start   распаковать архив и поднять редактор
    python3 shoot_types.py <стадия> [<стадия> …]

Съёмка идёт в фоне: редактор управляется по протоколу DevTools (`cdp.py`),
экран пользователя не переключается, нажатия в другие программы не попадают.
Проекты распаковываются из архивов темы, поэтому на кадрах тот же код,
который студент скачивает кнопкой.
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import websockets

from cdp import Editor, launch

MATERIALS = Path(__file__).resolve().parent.parent / "materials"
STUDENT = Path("/private/tmp/student")
NAMES = {"bez": "otchet-kafe-bez-tipov", "start": "otchet-kafe-start"}
RAW = Path(__file__).resolve().parent / "raw"
W, H = 1240, 780

PROBA_BAD = '''from app.utils.formatter import format_kopeks, format_title

title = format_title(40)
price = format_kopeks("1250")
'''
PROBA_GOOD = '''from app.utils.formatter import format_kopeks, format_title

title = format_title(" Итог ")
price = format_kopeks(125000)
'''


def project() -> Path:
    return Path(open(".shot-project").read().strip())


def settings_file() -> Path:
    return project() / ".vscode" / "settings.json"


def set_mode(mode: str | None) -> None:
    """Режим проверки Pylance в настройках проекта; None — строки нет."""
    data = json.loads(settings_file().read_text(encoding="utf-8"))
    data.pop("python.analysis.typeCheckingMode", None)
    if mode:
        data["python.analysis.typeCheckingMode"] = mode
    settings_file().write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare(kind: str) -> None:
    name = NAMES[kind]
    target = STUDENT / name
    subprocess.run(["rm", "-rf", str(target)])
    STUDENT.mkdir(exist_ok=True)
    subprocess.run(["unzip", "-qo", str(MATERIALS / f"{name}.zip"), "-d", str(STUDENT)])
    subprocess.run([sys.executable, "-m", "venv", str(target / ".venv")])
    subprocess.run([str(target / ".venv/bin/pip"), "-q", "install", "-r", str(target / "requirements.txt")])
    # Кэш mypy прогревается заранее: первый запуск идёт долго.
    subprocess.run([str(target / ".venv/bin/mypy"), "app"], cwd=target, capture_output=True)
    open(".shot-project", "w").write(str(target))
    launch(str(target))


async def reset(e: Editor) -> None:
    """Перед каждым кадром: без вкладок, без нижней панели, проводник слева."""
    await e.send("Emulation.setFocusEmulationEnabled", enabled=True)
    await e.size(W, H)
    await e.key("Escape", 0.3)
    await e.palette("View: Close All Editors", 0.8)
    await e.palette("View: Show Explorer", 0.8)
    await panel(e, False)


async def open_file(e: Editor, name: str, wait: float = 2.5) -> None:
    await e.key("Meta+P", 0.8)
    await e.paste(name, 1.0)
    await e.key("Enter", wait)


async def goto(e: Editor, line: int, col: int = 1) -> None:
    await e.key("Ctrl+G", 0.6)
    await e.paste(f"{line}:{col}", 0.4)
    await e.key("Enter", 0.6)


async def hover(e: Editor, wait: float = 2.5) -> None:
    """Подсказка под курсором — команда палитры, без движения мыши."""
    await e.palette("Show or Focus Hover", wait)


async def terminal(e: Editor, command: str, wait: float = 6.0) -> None:
    await e.palette("Terminal: Kill All Terminals", 1.2)
    await e.palette("Terminal: Create New Terminal", 3.0)
    await e.paste("clear", 0.2)
    await e.key("Enter", 0.6)
    await e.paste(command, 0.3)
    await e.key("Enter", wait)


async def park(e: Editor) -> None:
    """Курсор — в правый верхний угол редактора, где нет кнопок и списков."""
    await e.move(W - 160, 140, 0.3)


async def panel(e: Editor, want: bool) -> None:
    """Нижняя панель: открыть или закрыть по её фактическому состоянию.

    Команда палитры «Close Panel» иногда отрабатывает до того, как терминал
    успел появиться, поэтому состояние проверяется по разметке."""
    for _ in range(3):
        shown = await e.js("(() => { const p = document.querySelector('.part.panel');"
                           " return !!p && p.getBoundingClientRect().height > 30; })()")
        if shown == want:
            return
        await e.key("Meta+J", 1.0)


# ── стадии ────────────────────────────────────────────────────────────────

async def st_ext(e: Editor) -> None:
    await reset(e)
    await e.palette("Extensions: Show Installed Extensions", 3.0)
    await panel(e, False)
    await park(e)
    await e.shot(f"{RAW}/types-ext-installed.png")


async def st_interpreter(e: Editor) -> None:
    await reset(e)
    await open_file(e, "main.py")
    await e.palette("Python: Select Interpreter", 3.0)
    await park(e)
    await e.shot(f"{RAW}/types-interpreter.png")
    await e.key("Escape", 0.5)


async def st_off(e: Editor) -> None:
    """Режим off: тот же файл с ошибками, подчёркиваний нет."""
    set_mode(None)
    (project() / "proba.py").write_text(PROBA_BAD, encoding="utf-8")
    await reset(e)
    await open_file(e, "proba.py", 5.0)
    await panel(e, False)
    await park(e)
    await e.shot(f"{RAW}/types-mode-off.png")


async def st_settings(e: Editor) -> None:
    """Окно настроек, вкладка Workspace, параметр Type Checking Mode."""
    set_mode(None)
    await reset(e)
    await e.palette("Preferences: Open Workspace Settings", 3.0)
    await e.paste("python.analysis.typeCheckingMode", 3.0)
    await park(e)
    await e.shot(f"{RAW}/types-settings-off.png")
    x, y, w, h = await e.rect(".setting-item-contents .monaco-select-box")
    await e.click(x + w / 2, y + h / 2, 1.5)
    await e.shot(f"{RAW}/types-settings-list.png")
    await e.key("ArrowDown", 0.5)                      # off → basic
    await e.key("Enter", 2.5)
    await park(e)
    await e.shot(f"{RAW}/types-settings-basic.png")
    print("  в файле:", json.loads(settings_file().read_text()).get("python.analysis.typeCheckingMode"))


async def st_json(e: Editor) -> None:
    set_mode("basic")
    await reset(e)
    await open_file(e, ".vscode/settings.json", 2.0)
    await park(e)
    await e.shot(f"{RAW}/types-settings-json.png")


async def st_squiggle(e: Editor) -> None:
    set_mode("basic")
    (project() / "proba.py").write_text(PROBA_BAD, encoding="utf-8")
    await reset(e)
    await open_file(e, "proba.py", 6.0)
    await panel(e, False)
    await goto(e, 5)
    await park(e)
    await e.shot(f"{RAW}/types-squiggle.png")
    await goto(e, 3, 22)
    await hover(e, 3.0)
    await e.shot(f"{RAW}/types-hover-error.png")
    await e.key("Escape", 0.4)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 2.5)
    await park(e)
    await e.shot(f"{RAW}/types-problems.png")


async def st_mypy(e: Editor) -> None:
    """mypy в терминале: версия и проверка файла с двумя ошибками."""
    set_mode("basic")
    (project() / "proba.py").write_text(PROBA_BAD, encoding="utf-8")
    await reset(e)
    await open_file(e, "proba.py", 4.0)
    await goto(e, 5)
    await terminal(e, ".venv/bin/mypy --version && .venv/bin/mypy proba.py", 8.0)
    await park(e)
    await e.shot(f"{RAW}/types-mypy-file.png")
    # Переход по ссылке «proba.py:3» из вывода: ⌘ и наведение подсвечивают её.
    box = await e.js("""(() => {
      const rows = [...document.querySelectorAll('.xterm-rows > div')];
      const i = rows.findIndex(r => r.textContent.startsWith('proba.py:3'));
      if (i < 0) return null;
      const r = rows[i].getBoundingClientRect();
      return [r.x, r.y, r.height];
    })()""")
    if box:
        x, y, h = box
        await e.move(x + 30, y + h / 2, 1.5)
        await e.shot(f"{RAW}/types-mypy-link.png")


async def st_fixed(e: Editor) -> None:
    set_mode("basic")
    (project() / "proba.py").write_text(PROBA_GOOD, encoding="utf-8")
    await reset(e)
    await open_file(e, "proba.py", 5.0)
    await goto(e, 5)
    await terminal(e, ".venv/bin/mypy proba.py", 6.0)
    await park(e)
    await e.shot(f"{RAW}/types-mypy-fixed.png")


async def st_app(e: Editor) -> None:
    """mypy на всём пакете: на втором архиве — Success, на первом — 17 ошибок."""
    (project() / "proba.py").unlink(missing_ok=True)
    untyped = "bez-tipov" in str(project())
    await reset(e)
    await terminal(e, ".venv/bin/mypy app", 8.0)
    if untyped:                                     # 18 строк вывода не помещаются
        await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/{'types-mypy-errors' if untyped else 'types-mypy-success'}.png")


async def st_reveal(e: Editor) -> None:
    """Тип, который вывела проверка: наведение на переменную."""
    set_mode("basic")
    (project() / "proba.py").write_text(
        "from app.services.calculator import grade_bounds\n\n"
        "bounds = grade_bounds([5, 3, 4])\n", encoding="utf-8")
    await reset(e)
    await open_file(e, "proba.py", 5.0)
    await panel(e, False)
    await goto(e, 3, 3)
    await hover(e, 3.0)
    await e.shot(f"{RAW}/types-hover-variable.png")
    await e.key("Escape", 0.3)


def line_of(rel: str, fragment: str) -> tuple[int, int]:
    """Номер строки и столбца первого вхождения фрагмента в файле проекта."""
    for n, text in enumerate((project() / rel).read_text(encoding="utf-8").splitlines(), 1):
        if fragment in text:
            return n, text.index(fragment) + 1
    raise SystemExit(f"в {rel} нет «{fragment}»")


def tag() -> str:
    return "untyped" if "bez-tipov" in str(project()) else "typed"


async def st_hovercall(e: Editor) -> None:
    """Подсказка на вызове revenue_by_waiter в main.py."""
    await reset(e)
    await open_file(e, "main.py", 5.0)
    line, col = line_of("main.py", "revenue_by_waiter(orders)")
    await goto(e, line, col + 3)
    await hover(e, 3.0)
    await e.shot(f"{RAW}/types-hover-call-{tag()}.png")
    await e.key("Escape", 0.3)


async def st_completion(e: Editor) -> None:
    """Автодополнение после точки у элемента списка orders."""
    await reset(e)
    await open_file(e, "orders.py", 5.0)
    line, _ = line_of("app/services/orders.py", "orders.sort(")
    await goto(e, line)
    await e.key("End", 0.3)
    await e.paste("\n", 0.6)                      # Enter как ввод текста: так редактор
    await e.type("orders[0].", 2.0)                 # ставит отступ новой строки
    await e.key("Ctrl+Space", 3.0)
    await e.shot(f"{RAW}/types-completion-{tag()}.png")
    await e.key("Escape", 0.3)
    await e.palette("File: Revert File", 1.5)
    await e.palette("View: Close All Editors", 0.8)


async def st_inlay(e: Editor) -> None:
    """Подсказки вставки: тип результата, который Pylance вывел сам."""
    data = json.loads(settings_file().read_text(encoding="utf-8"))
    data["python.analysis.inlayHints.functionReturnTypes"] = True
    settings_file().write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    await reset(e)
    await open_file(e, "formatter.py", 6.0)
    await goto(e, 1)
    await park(e)
    await e.shot(f"{RAW}/types-inlay.png")
    data.pop("python.analysis.inlayHints.functionReturnTypes")
    settings_file().write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


STAGES = {name[3:]: fn for name, fn in globals().items() if name.startswith("st_")}


async def run(names: list[str]) -> None:
    """Каждая стадия — своё соединение. Окно редактора изредка перезагружается
    само, и прежнее соединение рвётся; тогда стадия повторяется один раз."""
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
    if sys.argv[1] == "prepare":
        prepare(sys.argv[2])
        return
    asyncio.run(run(sys.argv[1:]))


if __name__ == "__main__":
    main()
