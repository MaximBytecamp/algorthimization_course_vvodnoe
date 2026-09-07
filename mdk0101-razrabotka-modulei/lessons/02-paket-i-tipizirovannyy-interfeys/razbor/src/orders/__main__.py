"""Точка входа: python -m orders data/orders.json"""

import sys
from pathlib import Path

from orders.report import render
from orders.storage import read_orders

DEFAULT_PATH = Path("data/orders.json")


def main(argv: list[str]) -> int:
    path = Path(argv[1]) if len(argv) > 1 else DEFAULT_PATH
    if not path.exists():
        print(f"файла {path} нет: укажите путь к данным первым аргументом", file=sys.stderr)
        return 1
    print(render(read_orders(path)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
