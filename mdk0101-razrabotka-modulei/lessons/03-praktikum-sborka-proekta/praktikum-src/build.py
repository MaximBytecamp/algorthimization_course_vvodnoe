"""Собирает архивы практикума из папок с исходниками и кладёт их в materials/.

Запуск: python3 praktikum-src/build.py

Архивы собираются модулем zipfile, а не командой zip: он записывает имена
файлов в UTF-8 и ставит нужный флаг, поэтому русские имена внутри архива
читаются и на Windows.
"""

import shutil
import zipfile
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / "materials"

# Папка с исходниками, имя архива, имя верхней папки внутри архива.
ARCHIVES = [
    ("cafe-report-chaos", "praktikum-1-cafe-report.zip", "praktikum-1-cafe-report"),
    ("cafe-report-reference", "praktikum-1-cafe-report-etalon.zip", "cafe-report"),
    ("text-kit-split", "praktikum-2-text-kit.zip", "praktikum-2-text-kit"),
    ("text-kit-reference", "praktikum-2-text-kit-etalon.zip", "text-kit"),
]

TASKS = [
    ("cafe-report-chaos/ЗАДАНИЕ.md", "zadanie-1-ierarhiya-proekta.md"),
    ("text-kit-split/ЗАДАНИЕ.md", "zadanie-2-razdelenie-na-moduli.md"),
]

SKIP_DIRS = {"__pycache__", ".pytest_cache", ".venv", ".git"}


def pack(folder: str, archive: str, top: str) -> None:
    root = SRC / folder
    target = OUT / archive
    files = []
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        if path.is_file():
            files.append(path)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in files:
            zf.write(path, f"{top}/{path.relative_to(root)}")
    print(f"{archive}: {len(files)} файлов")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for folder, archive, top in ARCHIVES:
        pack(folder, archive, top)
    for source, name in TASKS:
        shutil.copy(SRC / source, OUT / name)
        print(name)


if __name__ == "__main__":
    main()
