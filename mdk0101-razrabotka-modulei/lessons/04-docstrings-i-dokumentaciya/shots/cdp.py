"""Управление отдельным экземпляром VS Code по протоколу DevTools.

Прежний обвяз (`shoot.py`) нажимает клавиши через System Events: окно съёмки
приходится выводить вперёд, и промах уводит нажатия в чужие программы. Здесь
нажатия, движения мыши и снимки идут прямо в окно редактора по протоколу
DevTools, поэтому экран пользователя не переключается и фокус не нужен.

Запуск экземпляра — `launch()`: бинарник Electron без переменной
ELECTRON_RUN_AS_NODE (она наследуется из терминала VS Code и превращает
программу в Node) и с портом отладки.
"""
import asyncio
import base64
import json
import os
import subprocess
import time
import urllib.request

import websockets

APP = "/Applications/Visual Studio Code.app/Contents/MacOS/Code"
PROFILE = "/private/tmp/vsc-types"
PORT = 9337

# Клавиши, которые нужны сценариям: имя → (key, code, keyCode)
KEYS = {
    "Enter": ("Enter", "Enter", 13), "Escape": ("Escape", "Escape", 27),
    "Tab": ("Tab", "Tab", 9), "Backspace": ("Backspace", "Backspace", 8),
    "ArrowLeft": ("ArrowLeft", "ArrowLeft", 37), "ArrowUp": ("ArrowUp", "ArrowUp", 38),
    "ArrowRight": ("ArrowRight", "ArrowRight", 39), "ArrowDown": ("ArrowDown", "ArrowDown", 40),
    "End": ("End", "End", 35), "Home": ("Home", "Home", 36), "F1": ("F1", "F1", 112),
    "Space": (" ", "Space", 32), "`": ("`", "Backquote", 192),
}
MODS = {"Alt": 1, "Ctrl": 2, "Meta": 4, "Shift": 8}


def launch(folder: str, width: int = 1240, height: int = 780) -> None:
    """Поднимает экземпляр на папке проекта и ждёт порт отладки."""
    # Из окружения терминала убирается всё, что относится к рабочему VS Code
    # и к его окружению Python: иначе новый экземпляр пишет «VIRTUAL_ENV is set».
    env = {k: v for k, v in os.environ.items()
           if k not in ("ELECTRON_RUN_AS_NODE", "VIRTUAL_ENV", "PYTHONPATH")
           and not k.startswith("VSCODE_")}
    env["PATH"] = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin"
    # Прежний экземпляр держит порт отладки ещё несколько секунд после сигнала;
    # новый тогда стартует без порта, и соединение уходит к умирающему.
    subprocess.run(["pkill", "-f", f"user-data-dir={PROFILE}/data"], capture_output=True)
    for _ in range(30):
        busy = subprocess.run(["pgrep", "-f", f"user-data-dir={PROFILE}/data"], capture_output=True)
        if not busy.stdout:
            break
        time.sleep(0.5)
    else:
        # Окно с несохранённым файлом ждёт ответа «сохранить?» и на сигнал
        # не завершается; тогда экземпляр снимается принудительно.
        subprocess.run(["pkill", "-9", "-f", f"user-data-dir={PROFILE}/data"], capture_output=True)
    time.sleep(1.5)
    subprocess.Popen([APP, f"--user-data-dir={PROFILE}/data", f"--extensions-dir={PROFILE}/ext",
                      f"--remote-debugging-port={PORT}", "--disable-renderer-backgrounding",
                      "--disable-backgrounding-occluded-windows", "--new-window", folder],
                     env=env, stdout=open(f"{PROFILE}/log.txt", "w"), stderr=subprocess.STDOUT,
                     cwd="/private/tmp")
    for _ in range(60):
        try:
            if page_ws():
                return
        except OSError:
            pass
        time.sleep(1)
    raise SystemExit("порт отладки не открылся")


def page_ws() -> str:
    targets = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
    pages = [t for t in targets if t["type"] == "page" and "workbench" in t.get("url", "")]
    return pages[0]["webSocketDebuggerUrl"] if pages else ""


class Editor:
    """Окно редактора: команды протокола поверх одного соединения."""

    def __init__(self) -> None:
        self.ws = None
        self.n = 0

    async def __aenter__(self):
        self.ws = await websockets.connect(page_ws(), max_size=64 * 2**20)
        return self

    async def __aexit__(self, *exc):
        await self.ws.close()

    async def send(self, method: str, **params):
        self.n += 1
        mid = self.n
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params}))
        while True:
            try:
                raw = await asyncio.wait_for(self.ws.recv(), 30)
            except TimeoutError:
                raise RuntimeError(f"{method}: нет ответа 30 секунд") from None
            msg = json.loads(raw)
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    async def js(self, expr: str):
        r = await self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r.get("result", {}).get("value")

    async def size(self, width: int, height: int) -> None:
        """Размер области страницы; снимок получается ровно этого размера в точках."""
        await self.send("Emulation.setDeviceMetricsOverride", width=width, height=height,
                        deviceScaleFactor=2, mobile=False)
        await asyncio.sleep(1.5)

    async def key(self, combo: str, wait: float = 0.5) -> None:
        """Сочетание вида "Meta+Shift+P" или одна клавиша."""
        *mods, name = combo.split("+")
        mask = sum(MODS[m] for m in mods)
        if name in KEYS:
            key, code, kc = KEYS[name]
        else:
            key, code, kc = name.lower(), f"Key{name.upper()}", ord(name.upper())
        text = key if len(key) == 1 and not (mask & ~MODS["Shift"]) else ""
        down = dict(type="keyDown" if text else "rawKeyDown", key=key, code=code,
                    windowsVirtualKeyCode=kc, nativeVirtualKeyCode=kc, modifiers=mask)
        if text:
            down["text"] = text
        await self.send("Input.dispatchKeyEvent", **down)
        await self.send("Input.dispatchKeyEvent", type="keyUp", key=key, code=code,
                        windowsVirtualKeyCode=kc, nativeVirtualKeyCode=kc, modifiers=mask)
        await asyncio.sleep(wait)

    async def type(self, text: str, wait: float = 0.5) -> None:
        """Ввод по символу: так срабатывают подсказки, которые ждут набор."""
        for ch in text:
            await self.send("Input.insertText", text=ch)
            await asyncio.sleep(0.03)
        await asyncio.sleep(wait)

    async def paste(self, text: str, wait: float = 0.5) -> None:
        await self.send("Input.insertText", text=text)
        await asyncio.sleep(wait)

    async def move(self, x: float, y: float, wait: float = 0.4) -> None:
        await self.send("Input.dispatchMouseEvent", type="mouseMoved", x=x, y=y)
        await asyncio.sleep(wait)

    async def click(self, x: float, y: float, wait: float = 0.6, count: int = 1) -> None:
        await self.move(x, y, 0.15)
        for t in ("mousePressed", "mouseReleased"):
            await self.send("Input.dispatchMouseEvent", type=t, x=x, y=y, button="left", clickCount=count)
        await asyncio.sleep(wait)

    async def palette(self, command: str, wait: float = 1.2) -> None:
        """Команда через палитру (F1 — без модификаторов, от раскладки не зависит)."""
        await self.key("F1", 0.8)
        await self.paste(command, 0.9)
        await self.key("Enter", wait)

    async def rect(self, selector: str):
        """Границы первого видимого элемента по селектору: x, y, ширина, высота."""
        return await self.js(f"""(() => {{
          const el = [...document.querySelectorAll({json.dumps(selector)})]
            .find(e => e.getBoundingClientRect().width > 0);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return [r.x, r.y, r.width, r.height];
        }})()""")

    async def shot(self, path: str, clip=None) -> None:
        params = {"format": "png", "captureBeyondViewport": False}
        if clip:
            x, y, w, h = clip
            params["clip"] = dict(x=x, y=y, width=w, height=h, scale=1)
        r = await self.send("Page.captureScreenshot", **params)
        with open(path, "wb") as f:
            f.write(base64.b64decode(r["data"]))
        print(f"  ✓ {path}")
