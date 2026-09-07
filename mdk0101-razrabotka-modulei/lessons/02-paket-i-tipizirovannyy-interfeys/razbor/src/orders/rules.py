"""Правила продукта: какие статусы бывают и что с ними можно делать.

Модулю нужна сумма заказа, но не нужен модуль, который её считает:
число приходит параметром. Так между rules и pricing нет стрелки.
"""

from orders.contracts import Money, Order, Status

FINAL_STATUSES: frozenset[Status] = frozenset({"shipped", "delivered", "canceled"})

MANAGER_LIMIT: Money = 5000


def can_cancel(order: Order, order_total: Money) -> bool:
    """Отменить можно, пока заказ не уехал со склада и не дороже лимита."""
    if order_total > MANAGER_LIMIT:
        return False
    return order["status"] not in FINAL_STATUSES


def is_active(order: Order) -> bool:
    """Активный заказ попадает в сумму отчёта, отменённый — нет."""
    return order["status"] != "canceled"
