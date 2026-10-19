"""Обрезка кадров ветки Go (`shoot_go.py`) и пошаговых кадров Python 4.10–4.11 (`shoot_py.py`).

    python3 crop_go.py

Границы — в точках окна 1240 × 780, как в `crop_types.py`.
"""
from pathlib import Path

from PIL import Image

RAW = Path(__file__).resolve().parent / "raw"
OUT = Path(__file__).resolve().parent.parent / "img"
MAX_WIDTH = 1600

# имя кадра → (лево, верх, право, низ) в точках окна
FRAMES = {
    "go-hover-empty": (345, 200, 1240, 445),   # 4.7 §3 — подсказка без комментария
    "go-hover-doc": (345, 200, 1240, 445),     # 4.7 §3 — подсказка с комментарием
    "go-hover-call": (345, 200, 1240, 445),    # 4.1 §6 — подпись на вызове
    "go-hover-variable": (345, 300, 1240, 445),  # 4.1 §6 — тип переменной из :=
    "go-completion": (200, 395, 1000, 510),    # 4.1 §7 — поля Kopeks и Waiter
    "go-project-run": (0, 0, 1240, 780),       # 4.6 — проект после запуска
    "go-quickfix": (345, 320, 1240, 545),      # 4.5 §5 — Fill in return values
    "go-final": (345, 40, 1240, 255),          # 4.5 §8 — четыре команды на итоге
    "go-comment-complete": (345, 215, 1000, 345),  # 4.10 §1 — имя в комментарии
    "go-settings-json": (345, 25, 1240, 182),  # 4.10 §5 — настройка линтера
    "go-revive-problems": (345, 460, 1240, 670),  # 4.10 §5 — замечания revive
    "go-checks": (345, 470, 1240, 635),        # 4.11 §3 — vet, revive, тесты
    "go-revive-terminal": (345, 40, 1240, 285),   # 4.10 — revive в терминале
    "go-snippet-list": (345, 385, 1240, 575),     # 4.10 — сниппет в подсказках
    "go-snippet-inserted": (345, 375, 1240, 485),  # 4.10 — вставленная заготовка
    "go-revive-fixed": [(345, 250, 1240, 300), (345, 460, 1240, 650)],  # 4.10 — замечание пропало
    "go-doc-all": (345, 82, 1240, 560),           # 4.11 — go doc -all
    # ветка Python, главы 4.10–4.11 (кадры shoot_py.py)
    "py-ext-installed-all": (0, 25, 560, 540),   # 4.10 — все расширения темы
    "py-ext-ruff": (0, 25, 560, 190),            # 4.10 — Ruff по идентификатору
    "py-generate-filled": (345, 360, 1240, 660),  # 4.10 — заполненная заготовка
    "py-ruff-file-before": (345, 460, 1240, 760),  # 4.10/4.11 — 4 замечания
    "py-ruff-file-after": (345, 460, 1240, 560),  # 4.10/4.11 — All checks passed
    "go-ext-installed": (0, 25, 560, 330),      # 4.3 шаг 1 — расширение Go
    "go-squiggle": (345, 25, 1240, 300),        # 4.3 шаг 3 — подчёркивания
    "go-hover-error": (345, 25, 1240, 300),     # 4.3 шаг 4 — сообщение
    "go-problems": (345, 455, 1240, 570),       # 4.3 шаг 5 — панель Problems
    "go-terminal-build": (345, 455, 1240, 600),  # 4.3 §5 — go build с ошибками
    "go-terminal-fixed": (345, 455, 1240, 560),  # 4.3 §5 — после исправления
    "go-hover-bounds": (345, 230, 1240, 345),   # 4.3 §9 — тип переменной
    "go-oshibki-build": (345, 25, 1240, 215),   # 4.3 §8 — go build на архиве с ошибками
    "go-oshibki-problems": (345, 25, 1240, 645),  # 4.3 §8 — все 12 ошибок в редакторе
    # 4.3 §4 — файл, который собирается: код сверху, Problems снизу
    # (окно снято высотой 980 точек, пустая середина вырезана)
    "go-ladder": [(345, 25, 1240, 510), (345, 665, 1240, 765)],
}


def main() -> None:
    for name, box in FRAMES.items():
        source = RAW / f"{name}.png"
        if not source.exists():
            print(f"  нет кадра {source.name}")
            continue
        image = Image.open(source).convert("RGB")
        scale = image.width / 1240
        parts = [image.crop(tuple(round(v * scale) for v in b)) for b in (box if isinstance(box, list) else [box])]
        image = Image.new("RGB", (parts[0].width, sum(p.height for p in parts)), "white")
        top = 0
        for part in parts:
            image.paste(part, (0, top))
            top += part.height
        if image.width > MAX_WIDTH:
            image = image.resize((MAX_WIDTH, round(image.height * MAX_WIDTH / image.width)), Image.LANCZOS)
        target = OUT / f"vscode-{name}.png"
        image.save(target, optimize=True)
        print(f"  ✓ {target.name} — {image.width}×{image.height}")


if __name__ == "__main__":
    main()
