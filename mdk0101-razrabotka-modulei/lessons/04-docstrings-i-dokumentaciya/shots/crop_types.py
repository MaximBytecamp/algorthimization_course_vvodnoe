"""Обрезка кадров глав 4.1–4.4, снятых `shoot_types.py`.

    python3 crop_types.py

Кадр снимается окном 1240 × 780 точек с плотностью 2, то есть 2480 × 1560
пикселей. Целиком в колонку книги он ложится мелко, поэтому из каждого кадра
вырезается часть, о которой идёт речь в тексте: панель, подсказка, терминал.
Границы ниже — в точках окна; ширина готового файла не больше 1600.
"""
from pathlib import Path

from PIL import Image

RAW = Path(__file__).resolve().parent / "raw"
OUT = Path(__file__).resolve().parent.parent / "img"
MAX_WIDTH = 1600

# имя кадра → (лево, верх, право, низ) в точках окна
FRAMES = {
    "types-hover-call-untyped": (345, 60, 1000, 300),   # 4.1 — подсказка без аннотаций
    "types-hover-call-typed": (345, 60, 1000, 300),     # 4.1 — подсказка с аннотациями
    "types-completion-untyped": (345, 380, 1240, 700),  # 4.1 — No suggestions
    "types-completion-typed": (345, 380, 1240, 700),    # 4.1 — kopeks, waiter
    "types-ext-installed": (0, 25, 560, 330),           # 4.2 шаг 1 — расширения
    "types-interpreter": (300, 0, 940, 240),            # 4.2 шаг 2 — интерпретатор
    "types-mode-off": (345, 25, 1100, 185),             # 4.2 шаг 3 — режим off
    "types-settings-off": (124, 90, 1117, 640),         # 4.2 шаг 4 — окно настроек
    "types-settings-list": (124, 560, 800, 740),       # 4.2 шаг 4 — список режимов
    "types-settings-json": (345, 25, 1100, 200),        # 4.2 шаг 4 — что записалось
    "types-squiggle": (345, 25, 1100, 185),             # 4.2 шаг 5 — подчёркивания
    "types-hover-error": (345, 25, 1240, 200),          # 4.2 шаг 6 — сообщение
    "types-problems": (345, 455, 1240, 605),            # 4.2 шаг 7 — панель Problems
    "types-mypy-file": (345, 455, 1240, 605),           # 4.2 шаг 9 — mypy на файле
    "types-mypy-fixed": (345, 455, 1240, 605),          # 4.2 шаг 11 — Success
    "types-mypy-success": (345, 455, 1240, 605),        # 4.2 — весь пакет
    "types-mypy-errors": (345, 25, 1240, 400),          # 4.2 — 17 функций
    "types-hover-variable": (345, 25, 1000, 165),       # 4.2 — выведенный тип
    "types-inlay": (345, 25, 1240, 220),                # 4.5 — подсказки вставки
    # 4.3 — один файл в четырёх режимах: код сверху, панель Problems снизу,
    # пустая середина редактора вырезана (окно снято высотой 980 точек)
    "types-mode-off-all": [(345, 25, 1240, 445), (345, 650, 1240, 965)],
    "types-mode-basic-all": [(345, 25, 1240, 445), (345, 650, 1240, 965)],
    "types-mode-standard-all": [(345, 25, 1240, 445), (345, 650, 1240, 965)],
    "types-mode-strict-all": [(345, 25, 1240, 445), (345, 650, 1240, 965)],
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
        print(f"  ✓ {target.name} — {image.width}×{image.height}, {target.stat().st_size // 1024} КБ")


if __name__ == "__main__":
    main()
