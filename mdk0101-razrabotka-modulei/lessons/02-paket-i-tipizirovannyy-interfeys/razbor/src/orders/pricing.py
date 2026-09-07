"""Деньги: скидка по промокоду, доставка и итог заказа.

Модуль ничего не читает и никуда не пишет: на вход заказ, на выход число.
Поэтому его можно проверять тестами без файлов и без сети.
"""

from orders.contracts import Money, Order

PROMO: dict[str, int] = {"WELCOME": 10, "FRIEND": 15, "BIRTHDAY": 20}

FREE_DELIVERY_FROM: Money = 1500
DELIVERY_PRICE: Money = 199


def items_sum(order: Order) -> Money:
    """Сумма позиций без скидки и без доставки."""
    return sum(item["price"] * item["qty"] for item in order["items"])


def discount(order: Order) -> Money:
    """Скидка в рублях. Неизвестный промокод скидки не даёт."""
    percent = PROMO.get(order["promo"] or "", 0)
    return items_sum(order) * percent // 100


def delivery(order: Order) -> Money:
    """Доставка считается от суммы уже со скидкой."""
    if items_sum(order) - discount(order) >= FREE_DELIVERY_FROM:
        return 0
    return DELIVERY_PRICE


def total(order: Order) -> Money:
    """Сколько заказ стоит клиенту: позиции минус скидка плюс доставка."""
    return items_sum(order) - discount(order) + delivery(order)
