"""Обрезка кадров ветки Go, снятых `shoot_go.py`.

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
}


def main() -> None:
    for name, box in FRAMES.items():
        source = RAW / f"{name}.png"
        if not source.exists():
            print(f"  нет кадра {source.name}")
            continue
        image = Image.open(source).convert("RGB")
        scale = image.width / 1240
        image = image.crop(tuple(round(v * scale) for v in box))
        if image.width > MAX_WIDTH:
            image = image.resize((MAX_WIDTH, round(image.height * MAX_WIDTH / image.width)), Image.LANCZOS)
        target = OUT / f"vscode-{name}.png"
        image.save(target, optimize=True)
        print(f"  ✓ {target.name} — {image.width}×{image.height}")


if __name__ == "__main__":
    main()
