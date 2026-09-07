"""Ошибки предметной области. Ни одна из них не знает про HTTP и про файлы."""


class OrderError(Exception):
    """Общий предок: по нему ловят всё, что относится к заказам."""


class OrderNotFound(OrderError):
    def __init__(self, order_id: int) -> None:
        super().__init__(f"заказ {order_id} не найден")
        self.order_id = order_id


class OrderCannotBeCanceled(OrderError):
    def __init__(self, order_id: int, status: str) -> None:
        super().__init__(f"заказ {order_id} в статусе {status} отменить нельзя")
        self.order_id = order_id
        self.status = status
