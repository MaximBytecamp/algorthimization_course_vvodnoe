"""Обрезка и уменьшение кадров для главы 4.5.

    python3 crop.py

Снимки делаются на экране Retina, поэтому выходят вдвое крупнее окна:
2480 × 1560 точек на окно 1240 × 780. Для книги такой вес не нужен, но и
уменьшать до ширины окна не стоит — текст в редакторе станет мылким.
Компромисс: ширина 1600, шрифт остаётся читаемым, вес кадра втрое меньше.

Ключ `right` обрезает правую часть кадра. Он нужен для снимков, где VS Code
сам открыл панель чата: закрыть её командой палитры на этой сборке нельзя,
а переснимать кадр из-за панели дороже, чем отрезать её.
"""
from pathlib import Path

from PIL import Image

RAW = Path("raw")
OUT = Path("../img")
WIDTH = 1600

# имя файла → сколько точек оставить по ширине (None — весь кадр)
FRAMES = {
    "ext-autodocstring": None,
    "problems-ruff": None,
    "terminal-ruff": None,
    "generate-before": None,
    "generate-after": None,
    "hover-docstring": None,
}


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, right in FRAMES.items():
        source = RAW / f"{name}.png"
        if not source.exists():
            print(f"  нет кадра {source}")
            continue
        image = Image.open(source).convert("RGB")
        if right:
            image = image.crop((0, 0, right, image.height))
        height = round(image.height * WIDTH / image.width)
        image = image.resize((WIDTH, height), Image.LANCZOS)
        target = OUT / f"vscode-{name}.png"
        image.save(target, optimize=True)
        print(f"  ✓ {target} — {image.width}×{image.height}, "
              f"{target.stat().st_size // 1024} КБ")


if __name__ == "__main__":
    main()
