"""Кадры VS Code для главы 4.5 «VS Code: генератор и проверка».

    python3 shoot.py prepare     поднять чистый экземпляр редактора
    python3 shoot.py ext         панель расширений с autoDocstring
    python3 shoot.py problems    панель Problems с замечаниями Ruff
    python3 shoot.py terminal    вывод ruff check в терминале
    python3 shoot.py generate    вставка заготовки докстринга
    python3 shoot.py hover       подсказка с докстрингом при наведении
    python3 shoot.py unhide      вернуть скрытые приложения

Снимается отдельный экземпляр редактора с чистым профилем
(`--user-data-dir`): в рабочем VS Code открыты Claude Code, Copilot и лишние
панели, а студент видит окно без них. В профиль поставлены расширения Python,
autoDocstring и Ruff — те же три, что названы в главе.

Про предохранители. Рабочее окно на этой машине развёрнуто на весь экран,
то есть живёт на отдельном рабочем столе macOS, и фокус между запусками
уходил в чужие окна: нажатия попадали в браузер и мессенджер. Поэтому перед
каждым нажатием и кликом проверяется, что впереди процесс съёмки и что под
курсором окно этого же процесса; иначе работа прекращается без единого
нажатия. На время съёмки прочие программы прячутся.
"""
import subprocess
import sys
import time

import Quartz

PROFILE = "/private/tmp/vsc-docs"
DEMO = "/private/tmp/student/otchet-kafe"
CODE = "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
PIDFILE = ".shot-pid"
WIN = (100, 60, 1240, 780)           # x, y, ширина, высота — логические точки


def osa(script: str) -> str:
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return r.stdout.strip()


def pid() -> str:
    return open(PIDFILE).read().strip()


def front_pid() -> str:
    return osa('tell application "System Events" to return unix id of '
               '(first application process whose frontmost is true)')


def owner_at(x: float, y: float) -> int:
    """PID окна, которое лежит сверху в точке экрана."""
    wl = Quartz.CGWindowListCopyWindowInfo(
        Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements,
        Quartz.kCGNullWindowID)
    for w in wl:                     # список идёт сверху вниз по слоям
        b = w.get("kCGWindowBounds")
        if not b or w.get("kCGWindowAlpha", 1) == 0:
            continue
        # слои выше нуля — меню, Dock и служебный оверлей «Снимок экрана»
        if w.get("kCGWindowLayer", 0) != 0:
            continue
        if b["X"] <= x <= b["X"] + b["Width"] and b["Y"] <= y <= b["Y"] + b["Height"]:
            return int(w.get("kCGWindowOwnerPID", 0))
    return 0


def raise_window() -> None:
    osa(f'''tell application "System Events" to tell (first process whose unix id is {pid()})
      set frontmost to true
      delay 0.6
      repeat with w in windows
        set position of w to {{{WIN[0]}, {WIN[1]}}}
        delay 0.2
        set size of w to {{{WIN[2]}, {WIN[3]}}}
        delay 0.2
        perform action "AXRaise" of w
      end repeat
    end tell''')
    time.sleep(0.8)


def activate() -> None:
    centre = (WIN[0] + WIN[2] / 2, WIN[1] + WIN[3] / 2)
    for _ in range(5):
        raise_window()
        if front_pid() == pid() and str(owner_at(*centre)) == pid():
            return
        time.sleep(1.2)
    stop(f"окно съёмки не удалось вывести вперёд: впереди {front_pid()}, "
         f"в центре кадра окно процесса {owner_at(*centre)}")


def stop(why: str) -> None:
    print(f"СТОП: {why}. Ввод прекращён, кадры не сняты.")
    sys.exit(1)


def guard(point=None) -> None:
    if front_pid() != pid():
        activate()
    if front_pid() != pid():
        stop(f"впереди процесс {front_pid()}, а не окно съёмки {pid()}")
    if point is not None:
        owner = owner_at(*point)
        if str(owner) != pid():
            stop(f"под курсором окно процесса {owner}, а не окно съёмки {pid()}")


def key(code: int, mods: str = "", wait: float = 0.7) -> None:
    guard()
    osa(f'tell application "System Events" to key code {code}{mods}')
    time.sleep(wait)


def typ(text: str, wait: float = 0.9) -> None:
    guard()
    osa(f'tell application "System Events" to keystroke "{text}"')
    time.sleep(wait)


def paste(text: str, wait: float = 0.9) -> None:
    """Кавычки и решётки надёжнее вставлять через буфер обмена."""
    subprocess.run("pbcopy", input=text, text=True, shell=True)
    key(9, " using {command down}", wait)          # ⌘V


def move(x: float, y: float, wait: float = 0.5) -> None:
    """Перенос курсора сам по себе события «мышь поехала» не создаёт,
    поэтому шлём настоящие mouseMoved несколькими шагами."""
    cur = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
    for i in range(1, 6):
        px = cur.x + (x - cur.x) * i / 5
        py = cur.y + (y - cur.y) * i / 5
        Quartz.CGEventPost(Quartz.kCGHIDEventTap,
                           Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventMouseMoved,
                                                          (px, py), Quartz.kCGMouseButtonLeft))
        time.sleep(0.05)
    time.sleep(wait)


def click(x: float, y: float, wait: float = 1.2) -> None:
    guard((x, y))
    move(x, y, 0.4)
    time.sleep(0.3)
    guard((x, y))                    # окно могло смениться, пока ехал курсор
    for t in (Quartz.kCGEventLeftMouseDown, Quartz.kCGEventLeftMouseUp):
        Quartz.CGEventPost(Quartz.kCGHIDEventTap,
                           Quartz.CGEventCreateMouseEvent(None, t, (x, y), Quartz.kCGMouseButtonLeft))
        time.sleep(0.06)
    time.sleep(wait)


def retry(action, *args, tries: int = 6, **kwargs):
    """Повтор действия, если окно съёмки ушло на другой рабочий стол.
    Проверки при этом не ослабляются: каждая попытка заново убеждается,
    что впереди окно съёмки и под курсором оно же. Между запусками система
    возвращается на рабочий стол с полноэкранным редактором, и одной
    активации в начале стадии не хватает."""
    for attempt in range(tries):
        try:
            return action(*args, **kwargs)
        except SystemExit:
            print(f"  попытка {attempt + 1}: окно ушло, возвращаю")
            time.sleep(1.5)
            try:
                activate()
            except SystemExit:
                pass
    stop("окно съёмки не удержалось впереди за несколько попыток")


def park() -> None:
    """Курсор уводится в пустое место редактора настоящим движением мыши.

    Если увести его за пределы окна, редактор не узнает об уходе указателя
    и оставит на кадре подсказку кнопки, над которой курсор был до этого."""
    move(WIN[0] + 950, WIN[1] + 260, 0.4)   # пустая часть редактора
    time.sleep(0.6)


def shot(name: str, wait: float = 0.8, keep_cursor: bool = False) -> None:
    """Проверка перед съёмкой идёт по владельцу окна в центре кадра.
    Одной проверки активной программы мало: рабочий VS Code развёрнут на весь
    экран и живёт на своём рабочем столе, система возвращается туда между
    запусками, и в область кадра попадает чужое окно."""
    guard((WIN[0] + WIN[2] / 2, WIN[1] + WIN[3] / 2))
    if not keep_cursor:
        park()
    time.sleep(wait)
    subprocess.run(["screencapture", f"-R{WIN[0]},{WIN[1]},{WIN[2]},{WIN[3]}",
                    "-x", f"raw/{name}.png"])
    print(f"  ✓ raw/{name}.png")


def ensure_abc() -> None:
    """Раскладка запоминается для каждой программы: палитра ждёт латиницу."""
    cur = osa('tell application "System Events" to return description of menu bar item 1 '
              'of menu bar 2 of (first process whose name is "TextInputMenuAgent")')
    if cur == "ABC":
        return
    osa('tell application "System Events" to tell (first process whose name is "TextInputMenuAgent") '
        'to tell menu bar item 1 of menu bar 2 to perform action "AXPress"')
    time.sleep(1.2)
    osa('tell application "System Events" to tell (first process whose name is "TextInputMenuAgent") '
        'to click menu item "ABC" of menu 1 of menu bar item 1 of menu bar 2')
    time.sleep(1.5)
    print(f"  раскладка: {cur} → ABC")


def hide_others() -> None:
    """Чужое окно под курсором — главная причина промахов."""
    osa('''tell application "System Events"
      repeat with p in (every application process whose background only is false)
        try
          if (name of p is not "Code") and (name of p is not "Finder") then set visible of p to false
        end try
      end repeat
    end tell''')
    time.sleep(1.5)


def ready() -> None:
    hide_others()
    ensure_abc()
    activate()


def palette(command: str, wait: float = 1.6) -> None:
    """Команда через палитру: надёжнее сочетаний, которые зависят от раскладки."""
    key(35, " using {command down, shift down}", 1.0)   # ⇧⌘P
    typ(command, 1.2)
    key(36, "", wait)                                  # Enter


def chat_open() -> bool:
    """Открыта ли панель чата справа.

    Переключатель ⌥⌘B именно переключает: вслепую он с равной вероятностью
    открывает панель и закрывает. Поэтому состояние определяется по кадру:
    в углу панели стоит надпись Chat, и на этом месте появляется тёмный
    текст на светлом фоне. Пустой редактор даёт там ровную заливку.
    """
    box = "/tmp/shot-chat-probe.png"
    subprocess.run(["screencapture", f"-R{WIN[0] + 930},{WIN[1] + 40},70,26", "-x", box])
    from PIL import Image
    pixels = list(Image.open(box).convert("L").getdata())
    spread = max(pixels) - min(pixels)
    return spread > 60


def ensure_no_chat() -> None:
    """Закрывает панель чата, если редактор открыл её снова."""
    for _ in range(3):
        if not chat_open():
            return
        osa(f'tell application "System Events" to tell (first process whose unix id is {pid()}) '
            'to keystroke "b" using {command down, option down}')
        time.sleep(1.5)
    print("  панель чата закрыть не удалось")


def tidy() -> None:
    """Перед каждым кадром: убрать нижнюю панель и вкладки редактора.

    Панель чата отсюда убрана намеренно. Команда палитры «Close Secondary
    Side Bar» на этой сборке находит команду-переключатель и открывает
    панель обратно. Панель закрывается один раз крестиком в её заголовке
    (стадия prepare) и после этого не возвращается."""
    palette("View: Close Panel")
    palette("View: Close All Editors")


def open_file(name: str) -> None:
    """Быстрое открытие: ⌘P, имя файла, Enter."""
    key(35, " using {command down}", 1.0)          # ⌘P
    typ(name, 1.4)
    key(36, "", 2.0)                               # Enter


def close_all() -> None:
    """Закрывает вкладки редактора. Сочетание ⌘W здесь не годится: закрыв
    последнее окно, экземпляр съёмки завершается, и следующая команда уходит
    в рабочий VS Code. Поэтому только ⌘K ⌘W — «закрыть все вкладки»."""
    key(53, "", 0.4)                               # Esc
    osa(f'tell application "System Events" to tell (first process whose unix id is {pid()}) '
        'to keystroke "k" using {command down}')
    time.sleep(0.4)
    osa(f'tell application "System Events" to tell (first process whose unix id is {pid()}) '
        'to keystroke "w" using {command down}')
    time.sleep(1.2)


def main() -> None:
    stage = sys.argv[1] if len(sys.argv) > 1 else ""

    if stage == "prepare":
        subprocess.run(["pkill", "-f", f"user-data-dir {PROFILE}/data"], capture_output=True)
        time.sleep(1)
        subprocess.Popen([CODE, "--user-data-dir", f"{PROFILE}/data",
                          "--extensions-dir", f"{PROFILE}/ext", "--new-window", DEMO],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(14)
        out = subprocess.run(["pgrep", "-f", f"user-data-dir {PROFILE}/data --extensions-dir"],
                             capture_output=True, text=True).stdout.split()
        if not out:
            stop("экземпляр редактора не запустился")
        open(PIDFILE, "w").write(out[0])
        print("PID экземпляра:", out[0])
        ready()
        # крестик в заголовке панели Chat: закрывается один раз на сессию
        retry(click, WIN[0] + 1219, WIN[1] + 49)
        print("панель чата закрыта")
        return

    if stage == "unhide":
        osa('''tell application "System Events"
          repeat with p in (every application process whose background only is false)
            try
              set visible of p to true
            end try
          end repeat
        end tell''')
        print("Приложения возвращены.")
        return

    if stage == "ext":
        ready()
        tidy()
        print("Панель расширений:")
        key(7, " using {command down, shift down}", 2.0)     # ⇧⌘X
        key(0, " using {command down}", 0.5)                 # ⌘A — поле поиска
        key(51, "", 0.5)                                     # Delete: в поле мог
        paste("njpwerner.autodocstring", 3.5)                # остаться прошлый запрос
        shot("ext-autodocstring", 1.5)
        key(53, "", 0.5)
        return

    if stage == "problems":
        ready()
        tidy()
        print("Открываю файлы, чтобы Ruff их разобрал:")
        key(14, " using {command down, shift down}", 1.0)    # ⇧⌘E — проводник
        open_file("formatter.py")
        time.sleep(3)
        # Открытый файл редактор прикладывает к чату и показывает панель
        # чата заново, поэтому её состояние проверяется по кадру.
        ensure_no_chat()
        key(46, " using {command down, shift down}", 2.5)    # ⇧⌘M — Problems
        shot("problems-ruff", 1.5)
        return

    if stage == "terminal":
        ready()
        tidy()
        print("Терминал и запуск проверки:")
        key(50, " using {control down}", 2.5)                # ⌃` — терминал
        paste("clear", 0.6)                                   # убрать след прошлого
        key(36, "", 1.2)                                      # запуска и подсказку zsh
        paste(".venv/bin/ruff check app --output-format=concise", 0.8)
        key(36, "", 4.0)                                     # Enter
        ensure_no_chat()
        shot("terminal-ruff", 1.5)
        return

    if stage == "generate":
        ready()
        tidy()
        print("Функция без докстринга:")
        open_file("orders.py")
        key(5, " using {control down}", 1.0)                 # ⌃G — переход к строке
        typ("1", 0.6)
        key(36, "", 1.2)
        ensure_no_chat()
        retry(shot, "generate-before", 1.0)
        print("Вставка заготовки:")
        # Курсор — в конец строки def, затем пустая строка тела: иначе
        # закрывающие кавычки заготовки встанут в одну строку с кодом.
        key(124, " using {command down}", 0.6)               # ⌘→ — конец строки
        key(36, "", 1.0)                                     # Enter — пустая строка
        # Вставка кавычек через буфер обмена генератор не запускает:
        # расширение ждёт набранные символы. Команда палитры надёжнее.
        palette("Generate Docstring", 2.5)
        ensure_no_chat()
        retry(shot, "generate-after", 1.5)
        print("Возвращаю файл в исходный вид:")
        for _ in range(8):
            key(6, " using {command down}", 0.4)             # ⌘Z
        return

    if stage == "hover":
        ready()
        tidy()
        print("Подсказка с докстрингом:")
        open_file("main.py")
        key(38, " using {command down}", 1.5)                # ⌘J — убрать нижнюю
        time.sleep(0.8)                                      # панель: подсказка
        #                                                      иначе обрезается
        key(5, " using {control down}", 1.0)                 # ⌃G
        typ("5", 0.6)
        key(36, "", 1.2)
        for _ in range(8):                                   # внутрь имени функции
            key(124, "", 0.12)
        osa(f'tell application "System Events" to tell (first process whose unix id is {pid()}) '
            'to keystroke "k" using {command down}')
        time.sleep(0.8)
        osa(f'tell application "System Events" to tell (first process whose unix id is {pid()}) '
            'to keystroke "i" using {command down}')
        time.sleep(2.5)
        shot("hover-docstring", 1.0)
        key(53, "", 0.5)
        return

    print(__doc__)


if __name__ == "__main__":
    main()
