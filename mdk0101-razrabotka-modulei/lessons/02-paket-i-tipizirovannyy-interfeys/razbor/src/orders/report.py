"""Печать отчёта. Единственный модуль, которому разрешено писать в консоль."""

from orders.contracts import Money, Order
from orders.pricing import total
from orders.rules import is_active

WIDTH = 46


def format_line(order: Order) -> str:
    return (
        f"{order['id']:>3} {order['customer']:<16} "
        f"{order['status']:<10} {total(order):>9}"
    )


def payable(orders: list[Order]) -> Money:
    """Сумма по активным заказам: отменённые в неё не входят."""
    return sum(total(order) for order in orders if is_active(order))


def render(orders: list[Order]) -> str:
    rule = "-" * WIDTH
    lines = ["ОТЧЁТ ПО ЗАКАЗАМ", rule]
    lines += [format_line(order) for order in orders]
    lines += [rule, f"всего к оплате: {payable(orders)}"]
    return "\n".join(lines)
