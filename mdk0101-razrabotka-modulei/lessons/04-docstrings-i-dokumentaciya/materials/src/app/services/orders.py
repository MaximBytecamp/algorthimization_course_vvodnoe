"""Заказы смены: чтение данных и расчёты по ним.

Модуль работает только с данными: читает CSV, собирает объекты Order
и считает итоги. Печать и форматирование — в app/ui и app/utils.
Суммы во всём модуле хранятся в копейках, целыми числами.
"""

from pathlib import Path

from app.domain.order import Order
from app.services.importer import read_rows


def load_orders(path: Path) -> list[Order]:
    """Читает заказы из файла смены.

    Args:
        path: Путь к файлу с колонками waiter и kopeks.

    Returns:
        Список заказов в порядке следования строк файла.

    Raises:
        FileNotFoundError: Если файла по указанному пути нет.
        ValueError: Если в колонке kopeks не целое число.
    """
    return [
        Order(waiter=row["waiter"], kopeks=int(row["kopeks"]))
        for row in read_rows(path)
    ]


def revenue_by_waiter(orders: list[Order], top: int = 0) -> dict[str, int]:
    """Считает выручку по каждому официанту.

    Args:
        orders: Заказы за смену, список не должен быть пустым.
        top: Сколько официантов оставить в результате. Значение 0
            означает, что возвращаются все.

    Returns:
        Выручка в копейках по именам официантов, в порядке убывания суммы.

    Raises:
        ValueError: Если список заказов пуст.
    """
    if not orders:
        raise ValueError("Список заказов пуст")
    totals: dict[str, int] = {}
    for order in orders:
        totals[order.waiter] = totals.get(order.waiter, 0) + order.kopeks
    ranked = sorted(totals.items(), key=lambda pair: -pair[1])
    if top:
        ranked = ranked[:top]
    return dict(ranked)


def sort_orders_in_place(orders: list[Order]) -> None:
    """Сортирует список заказов по убыванию суммы, изменяя сам список.

    Args:
        orders: Список заказов. Порядок элементов в нём меняется,
            новый список не создаётся.

    Note:
        Вызывающий код после вызова получает изменённый список. Когда
        исходный порядок нужно сохранить, передают его копию:
        sort_orders_in_place(orders.copy()).
    """
    orders.sort(key=lambda order: -order.kopeks)
