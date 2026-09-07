"""Сценарии: найти, создать, отменить. Здесь модули складываются вместе."""

from datetime import datetime
from pathlib import Path

from orders.contracts import Item, Order, OrderId
from orders.errors import OrderCannotBeCanceled, OrderNotFound
from orders.pricing import total
from orders.rules import can_cancel
from orders.storage import read_orders, write_orders


def find(orders: list[Order], order_id: OrderId) -> Order:
    """Вернуть заказ или поднять OrderNotFound: None наружу не отдаём."""
    for order in orders:
        if order["id"] == order_id:
            return order
    raise OrderNotFound(order_id)


def next_id(orders: list[Order]) -> OrderId:
    return max((order["id"] for order in orders), default=0) + 1


def create(path: Path, customer: str, items: list[Item], promo: str | None = None) -> Order:
    orders = read_orders(path)
    order: Order = {
        "id": next_id(orders),
        "customer": customer,
        "status": "new",
        "promo": promo,
        "items": items,
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }
    orders.append(order)
    write_orders(path, orders)
    return order


def cancel(path: Path, order_id: OrderId) -> Order:
    """Отменить заказ. Нельзя — поднимаем ошибку, а не печатаем строку."""
    orders = read_orders(path)
    order = find(orders, order_id)
    if not can_cancel(order, total(order)):
        raise OrderCannotBeCanceled(order_id, order["status"])
    order["status"] = "canceled"
    write_orders(path, orders)
    return order
