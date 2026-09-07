"""Заказы: публичный интерфейс пакета.

Снаружи пакет видят только через эти имена. Всё остальное — внутреннее
устройство, его можно переписать, не сломав чужой код.
"""

from orders.errors import OrderCannotBeCanceled, OrderError, OrderNotFound
from orders.pricing import total
from orders.report import render
from orders.service import cancel, create, find

__all__ = [
    "OrderCannotBeCanceled",
    "OrderError",
    "OrderNotFound",
    "cancel",
    "create",
    "find",
    "render",
    "total",
]
