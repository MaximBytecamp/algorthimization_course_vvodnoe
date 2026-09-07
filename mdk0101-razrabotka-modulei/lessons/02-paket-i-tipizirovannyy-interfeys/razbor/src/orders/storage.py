"""Единственный модуль пакета, который трогает диск."""

import json
from pathlib import Path

from orders.contracts import Order


def read_orders(path: Path) -> list[Order]:
    """Прочитать заказы. Файла нет — считаем, что заказов ноль."""
    if not path.exists():
        return []
    raw: list[Order] = json.loads(path.read_text(encoding="utf-8"))
    return raw


def write_orders(path: Path, orders: list[Order]) -> None:
    path.write_text(
        json.dumps(orders, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
