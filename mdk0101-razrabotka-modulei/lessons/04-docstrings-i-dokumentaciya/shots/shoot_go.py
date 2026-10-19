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
NAMES = {"start": "otchet-kafe-go-start", "dok": "otchet-kafe-go-dokumentirovan",
         "oshibki": "otchet-kafe-go-oshibki"}
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
    if kind != "oshibki":
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


async def st_hovercall(e: Editor) -> None:
    """4.1 §6: подсказка на вызове и на переменной, объявленной через :=."""
    await reset(e)
    await open_file(e, "main.go", 8.0)
    line, col = line_of("main.go", "RevenueByWaiter(orders")
    await goto(e, line, col + 3)
    await e.palette("Show or Focus Hover", 4.0)
    await e.shot(f"{RAW}/go-hover-call.png")
    await e.key("Escape", 0.3)
    line, col = line_of("main.go", "revenue, err :=")
    await goto(e, line, col + 2)
    await e.palette("Show or Focus Hover", 4.0)
    await e.shot(f"{RAW}/go-hover-variable.png")
    await e.key("Escape", 0.3)


async def st_completion(e: Editor) -> None:
    """4.1 §7: автодополнение после orders[0]."""
    await reset(e)
    await open_file(e, "orders.go", 8.0)
    line, _ = line_of("internal/services/orders.go", "func SortOrdersInPlace(")
    await goto(e, line)
    await e.key("End", 0.3)
    await e.paste("\n", 0.6)
    await e.type("orders[0].", 2.5)
    await e.key("Ctrl+Space", 3.0)
    await e.shot(f"{RAW}/go-completion.png")
    await e.key("Escape", 0.3)
    await e.palette("File: Revert File", 1.5)
    await e.palette("View: Close All Editors", 0.8)


PROBA_BAD = """package main

import "example.com/otchet-kafe/internal/utils"

func main() {
	title := utils.FormatTitle(40, 40)
	price := utils.FormatKopeks("1250")
	_, _ = title, price
}
"""
PROBA_GOOD = PROBA_BAD.replace("FormatTitle(40, 40)", 'FormatTitle(" Итог ", 40)').replace('FormatKopeks("1250")', "FormatKopeks(125000)")
PROBA_LADDER = """package main

import (
	"fmt"
	"strings"

	"example.com/otchet-kafe/internal/utils"
)

func main() {
	name := "иванов пётр"
	strings.ToUpper(name)
	total := 125000
	fmt.Printf("Итог: %d\\n", utils.FormatKopeks(total))
	for i := 0; i < 3; i++ {
		total = total
	}
	fmt.Println(utils.FormatKopeks(total))
}
"""
PROBA_BOUNDS = """package main

import (
	"fmt"

	"example.com/otchet-kafe/internal/services"
)

func main() {
	low, high, err := services.GradeBounds([]int{5, 3, 4})
	fmt.Println(low, high, err)
}
"""


def write_proba(text: str) -> None:
    (project() / "proba").mkdir(exist_ok=True)
    (project() / "proba" / "main.go").write_text(text, encoding="utf-8")


async def terminal(e: Editor, command: str, wait: float = 8.0) -> None:
    await e.palette("Terminal: Kill All Terminals", 1.2)
    await e.palette("Terminal: Create New Terminal", 3.0)
    await e.paste("clear", 0.2)
    await e.key("Enter", 0.6)
    await e.paste(command, 0.3)
    await e.key("Enter", wait)


async def park(e: Editor) -> None:
    """Указатель — на пустое место проводника, где нет всплывающих подсказок."""
    await e.move(200, 640, 0.3)


async def st_ext(e: Editor) -> None:
    """4.3 шаг 1: расширение Go в списке установленных."""
    await reset(e)
    await e.palette("Extensions: Show Installed Extensions", 3.0)
    await panel(e, False)
    await park(e)
    await e.shot(f"{RAW}/go-ext-installed.png")


async def st_squiggle(e: Editor) -> None:
    """4.3 шаги 3–5: подчёркивания, сообщение, панель Problems."""
    write_proba(PROBA_BAD)
    await reset(e)
    await open_file(e, "proba/main.go", 8.0)
    await goto(e, 9)
    await park(e)
    await e.shot(f"{RAW}/go-squiggle.png")
    await goto(e, 6, 32)                        # столбец в VS Code: табуляция = 4
    await e.palette("Show or Focus Hover", 3.0)
    await e.shot(f"{RAW}/go-hover-error.png")
    await e.key("Escape", 0.4)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 2.5)
    await park(e)
    await e.shot(f"{RAW}/go-problems.png")


async def st_build(e: Editor) -> None:
    """4.3 §5: go build в терминале — с ошибками и после исправления."""
    write_proba(PROBA_BAD)
    await reset(e)
    await open_file(e, "proba/main.go", 4.0)
    await terminal(e, "go version && go build ./...", 10.0)
    await park(e)
    await e.shot(f"{RAW}/go-terminal-build.png")
    write_proba(PROBA_GOOD)
    await asyncio.sleep(2.0)
    await terminal(e, "go build ./... && go vet ./...", 12.0)
    await park(e)
    await e.shot(f"{RAW}/go-terminal-fixed.png")


async def st_ladder(e: Editor) -> None:
    """4.3 §4: файл, который собирается, но вызывает замечания go vet."""
    write_proba(PROBA_LADDER)
    await reset(e)
    await e.size(W, 980)
    await open_file(e, "proba/main.go", 8.0)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 2.5)
    await e.palette("View: Focus Active Editor Group", 1.0)
    await goto(e, 1)
    await park(e)
    await e.shot(f"{RAW}/go-ladder.png")


async def st_bounds(e: Editor) -> None:
    """4.3 §9: тип переменной из нескольких результатов."""
    write_proba(PROBA_BOUNDS)
    await reset(e)
    await open_file(e, "proba/main.go", 8.0)
    await goto(e, 10, 6)
    await e.palette("Show or Focus Hover", 3.0)
    await e.shot(f"{RAW}/go-hover-bounds.png")
    await e.key("Escape", 0.3)


async def st_oshibki(e: Editor) -> None:
    """4.3 §8: архив с ошибками — терминал видит один пакет, редактор все."""
    await reset(e)
    await open_file(e, "main.go", 10.0)
    await terminal(e, "go build ./...", 10.0)
    await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/go-oshibki-build.png")
    await e.palette("View: Toggle Maximized Panel", 1.0)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 3.0)
    await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/go-oshibki-problems.png")
    await e.palette("View: Toggle Maximized Panel", 1.0)



async def st_run(e: Editor) -> None:
    """4.6: проект после запуска — дерево, main.go, отчёт в терминале."""
    subprocess.run(["rm", "-rf", str(project() / "proba")])
    await reset(e)
    await open_file(e, "main.go", 6.0)
    await e.palette("View: Collapse Folders in Explorer", 0.8)
    await terminal(e, "go run .", 10.0)
    await park(e)
    await e.shot(f"{RAW}/go-project-run.png")



async def st_quickfix(e: Editor) -> None:
    """4.5 §5: быстрое исправление gopls для not enough return values."""
    await reset(e)
    await open_file(e, "calculator.go", 10.0)
    line, _ = line_of("internal/services/calculator.go", "return slices.Min(grades), slices.Max(grades)")
    await goto(e, line, 6)
    await e.palette("Quick Fix...", 3.0)
    await e.shot(f"{RAW}/go-quickfix.png")
    await e.key("Escape", 0.4)


async def st_final(e: Editor) -> None:
    """4.5 §8: четыре команды на исправленном проекте."""
    subprocess.run(["rm", "-rf", str(project() / "proba")])
    await reset(e)
    await open_file(e, "main.go", 5.0)
    await terminal(e, "go build ./... && go vet ./... && go test ./... && go run .", 25.0)
    await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/go-final.png")
    await e.palette("View: Toggle Maximized Panel", 1.0)



LINT_SETTINGS = """{
  "go.lintTool": "revive",
  "go.lintOnSave": "package"
}
"""


async def st_revive(e: Editor) -> None:
    """4.10 §5: замечания revive в панели Problems после сохранения файла."""
    (project() / ".vscode").mkdir(exist_ok=True)
    (project() / ".vscode" / "settings.json").write_text(LINT_SETTINGS, encoding="utf-8")
    await reset(e)
    await open_file(e, ".vscode/settings.json", 2.0)
    await park(e)
    await e.shot(f"{RAW}/go-settings-json.png")
    await open_file(e, "formatter.go", 8.0)
    await e.key("Meta+S", 8.0)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 2.5)
    await park(e)
    await e.shot(f"{RAW}/go-revive-problems.png")


async def st_commentcomplete(e: Editor) -> None:
    """4.10 §1: подсказка имени при наборе комментария над функцией."""
    await reset(e)
    await open_file(e, "formatter.go", 8.0)
    line, _ = line_of("internal/utils/formatter.go", "func FormatKopeks(")
    await goto(e, line)
    await e.key("Home", 0.2)
    await e.paste("\n", 0.4)
    await e.key("ArrowUp", 0.3)
    await e.type("// Format", 2.0)
    await e.key("Ctrl+Space", 3.0)
    await e.shot(f"{RAW}/go-comment-complete.png")
    await e.key("Escape", 0.3)
    await e.palette("File: Revert File", 1.5)



async def st_checks(e: Editor) -> None:
    """4.11 §3: законченная работа на паре — vet, revive, тесты."""
    await reset(e)
    await open_file(e, "main.go", 5.0)
    await terminal(e, "go vet ./... && go run github.com/mgechev/revive@latest -set_exit_status ./... && go test ./...", 30.0)
    await park(e)
    await e.shot(f"{RAW}/go-checks.png")



SNIPPET = """{
  "Комментарий документации функции": {
    "scope": "go",
    "prefix": "docf",
    "body": [
      "// ${1:Имя} ${2:действие одним предложением}.",
      "//",
      "// ${3:Ограничения параметров. Когда возвращается ошибка: [ErrX].}"
    ],
    "description": "Первое предложение с имени, пустая строка, подробности"
  }
}
"""


async def st_revive_terminal(e: Editor) -> None:
    """4.10: revive в терминале на втором архиве."""
    await reset(e)
    await open_file(e, "main.go", 4.0)
    await terminal(e, "revive ./... | sort | head -12", 15.0)
    await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/go-revive-terminal.png")
    await e.palette("View: Toggle Maximized Panel", 1.0)


async def st_snippet(e: Editor) -> None:
    """4.10: сниппет docf — подсказка и вставленная заготовка."""
    (project() / ".vscode").mkdir(exist_ok=True)
    (project() / ".vscode" / "go.code-snippets").write_text(SNIPPET, encoding="utf-8")
    await reset(e)
    await open_file(e, "formatter.go", 8.0)
    line, _ = line_of("internal/utils/formatter.go", "func FormatTitle(")
    await goto(e, line)
    await e.key("Home", 0.2)
    await e.paste("\n", 0.4)
    await e.key("ArrowUp", 0.3)
    await e.type("docf", 2.5)
    await e.shot(f"{RAW}/go-snippet-list.png")
    await e.key("Enter", 1.5)
    await e.shot(f"{RAW}/go-snippet-inserted.png")
    await e.key("Escape", 0.3)
    await e.palette("File: Revert File", 1.5)


async def st_revive_fixed(e: Editor) -> None:
    """4.10: после комментария у FormatKopeks замечание пропадает."""
    (project() / ".vscode").mkdir(exist_ok=True)
    (project() / ".vscode" / "settings.json").write_text(LINT_SETTINGS, encoding="utf-8")
    await reset(e)
    await open_file(e, "formatter.go", 8.0)
    line, _ = line_of("internal/utils/formatter.go", "func FormatKopeks(")
    await goto(e, line)
    await e.key("Home", 0.2)
    await e.paste("\n", 0.4)
    await e.key("ArrowUp", 0.3)
    await e.paste("// FormatKopeks переводит сумму в копейках в строку вида «1 250,00 ₽».", 0.6)
    await e.key("Meta+S", 8.0)
    await e.palette("View: Focus Problems (Errors, Warnings, Infos)", 2.5)
    await park(e)
    await e.shot(f"{RAW}/go-revive-fixed.png")
    await e.palette("File: Revert File", 1.5)
    await e.key("Meta+S", 1.0)


async def st_docall(e: Editor) -> None:
    """4.11: go doc -all на третьем архиве."""
    await reset(e)
    await open_file(e, "main.go", 4.0)
    await terminal(e, "go doc -all ./internal/services | head -40", 10.0)
    await e.palette("View: Toggle Maximized Panel", 1.5)
    await park(e)
    await e.shot(f"{RAW}/go-doc-all.png")
    await e.palette("View: Toggle Maximized Panel", 1.0)


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
