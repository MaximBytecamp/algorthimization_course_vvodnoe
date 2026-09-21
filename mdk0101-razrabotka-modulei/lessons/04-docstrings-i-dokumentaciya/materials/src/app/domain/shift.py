"""Смена: заказы одного рабочего дня."""

from datetime import date

from app.domain.order import Order


class Shift:
    """Смена кафе: заказы одного рабочего дня.

    Объект накапливает заказы и считает по ним итоги. Заказы хранятся
    в порядке добавления.

    Attributes:
        day: Дата смены.
        orders: Добавленные заказы в порядке поступления.
    """

    def __init__(self, day: date) -> None:
        """Создаёт пустую смену на указанную дату."""
        self.day = day
        self.orders: list[Order] = []

    def add(self, order: Order) -> None:
        """Добавляет заказ в конец списка смены.

        Args:
            order: Заказ с уже нормализованным именем официанта.
        """
        self.orders.append(order)

    def total_kopeks(self) -> int:
        """Возвращает выручку смены в копейках; у пустой смены — 0."""
        return sum(order.kopeks for order in self.orders)
