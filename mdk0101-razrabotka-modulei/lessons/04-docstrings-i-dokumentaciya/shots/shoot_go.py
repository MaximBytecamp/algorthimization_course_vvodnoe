"""Кадры VS Code для ветки Go (расширение Go и gopls).

    python3 shoot_go.py prepare start|dok   распаковать архив и поднять редактор
    python3 shoot_go.py <стадия> [<стадия> …]

Съёмка фоновая, как в `shoot_types.py`: редактор управляется по протоколу
DevTools (`cdp.py`), экран пользователя не переключается. Профиль редактора
свой — /private/tmp/vsc-go, в нём установлено расширение golang.go.
"""
import asyncio
import subprocess
import sys
import zipfile
from pathlib import Path

import websockets

import cdp
from cdp import Editor, launch

cdp.PROFILE = "/private/tmp/vsc-go"
MATERIALS = Path(__file__).resolve().parent.parent / "materials"
STUDENT = Path("/private/tmp/student-go-shots")
NAMES = {"start": "otchet-kafe-go-start", "dok": "otchet-kafe-go-dokumentirovan"}
RAW = Path(__file__).resolve().parent / "raw"
W, H = 1240, 780


def project() -> Path:
    return Path(open(".shot-project-go").read().strip())


def prepare(kind: str) -> None:
    name = NAMES[kind]
    subprocess.run(["rm", "-rf", str(STUDENT / name)])
    STUDENT.mkdir(exist_ok=True)
    with zipfile.ZipFile(MATERIALS / f"{name}.zip") as zf:
        zf.extractall(STUDENT)
    target = STUDENT / name
    subprocess.run(["go", "build", "./..."], cwd=target, check=True)
    open(".shot-project-go", "w").write(str(target))
    launch(str(target))


def line_of(rel: str, fragment: str) -> tuple[int, int]:
    for n, text in enumerate((project() / rel).read_text(encoding="utf-8").splitlines(), 1):
        if fragment in text:
            return n, text.index(fragment) + 1
    raise SystemExit(f"в {rel} нет «{fragment}»")


def tag() -> str:
    return "doc" if "dokumentirovan" in str(project()) else "empty"


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


async def open_file(e: Editor, name: str, wait: float = 3.0) -> None:
    await e.key("Meta+P", 0.8)
    await e.paste(name, 1.0)
    await e.key("Enter", wait)


async def goto(e: Editor, line: int, col: int = 1) -> None:
    await e.key("Ctrl+G", 0.6)
    await e.paste(f"{line}:{col}", 0.4)
    await e.key("Enter", 0.6)


async def st_hoverdoc(e: Editor) -> None:
    """4.7 §3: подсказка на вызове RevenueByWaiter — без комментария и с ним."""
    await reset(e)
    await open_file(e, "main.go", 8.0)              # gopls поднимается не сразу
    line, col = line_of("main.go", "RevenueByWaiter(orders")
    await goto(e, line, col + 3)
    await e.palette("Show or Focus Hover", 4.0)
    await e.shot(f"{RAW}/go-hover-{tag()}.png")
    await e.key("Escape", 0.3)


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
    if sys.argv[1] == "prepare":
        prepare(sys.argv[2])
        return
    asyncio.run(run(sys.argv[1:]))


if __name__ == "__main__":
    main()
