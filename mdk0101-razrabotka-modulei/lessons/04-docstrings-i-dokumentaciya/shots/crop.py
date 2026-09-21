"""Обрезка и уменьшение кадров для главы 4.9.

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
    "types-hover-untyped": None,  # 4.1 — подсказка без аннотаций: Unknown
    "types-pylance-error": None,  # 4.3 — ошибка Pylance при наведении
    "types-problems": None,       # 4.3 — панель Problems с Pylance и Ruff
    "types-mypy-success": None,   # 4.3 — mypy без ошибок
    "types-mypy-errors": None,    # 4.3 — 17 функций без аннотаций
    "types-final": None,          # 4.4 — mypy, тесты, запуск
    "project-run": None,        # 4.5 — дерево проекта и запуск
    "hover-empty": None,        # 4.6 — подсказка без докстринга
    "hover-docstring": None,    # 4.6 — подсказка с докстрингом
    "terminal-help": None,      # 4.6 — help() в терминале
    "terminal-doctest": None,   # 4.7 — проверка примеров
    "terminal-help-class": None,  # 4.8 — справка по классу
    "ext-autodocstring": None,  # 4.9 — панель расширений
    "generate-before": None,    # 4.9 — функция без описания
    "generate-after": None,     # 4.9 — вставленная заготовка
    "settings-json": None,      # 4.9 — настройки проекта
    "problems-ruff": None,      # 4.9 — панель Problems
    "terminal-ruff": None,      # 4.9 — вывод ruff check
    "quickfix": None,           # 4.9 — быстрое исправление D415
    "terminal-checks": None,    # 4.10 — тесты и проверка пройдены
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
