"""Выгружает контракт в openapi/openapi.json и openapi/openapi.yaml.

    python scripts/export_openapi.py          записать файлы
    python scripts/export_openapi.py --check  проверить, что файлы совпадают с кодом

Режим --check запускается в CI: если разработчик изменил код и не обновил
контракт, сборка падает. Так документация не расходится с реализацией.
"""

import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.main import app  # noqa: E402


def render() -> dict[Path, str]:
    schema = app.openapi()
    return {
        ROOT / "openapi" / "openapi.json": json.dumps(schema, ensure_ascii=False, indent=2) + "\n",
        ROOT / "openapi" / "openapi.yaml": yaml.safe_dump(schema, allow_unicode=True, sort_keys=False),
    }


def main() -> int:
    files = render()
    if "--check" in sys.argv:
        outdated = [path for path, text in files.items() if not path.exists() or path.read_text(encoding="utf-8") != text]
        for path in outdated:
            print(f"{path.relative_to(ROOT)} is outdated: run python scripts/export_openapi.py")
        return 1 if outdated else 0
    for path, text in files.items():
        path.parent.mkdir(exist_ok=True)
        path.write_text(text, encoding="utf-8")
        print(f"written {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
