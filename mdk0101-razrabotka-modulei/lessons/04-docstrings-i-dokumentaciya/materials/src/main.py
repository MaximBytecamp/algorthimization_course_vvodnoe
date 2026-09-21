"""Отчёт кафе: точка входа.

Читает файл смены, считает выручку по официантам и печатает отчёт.
Запуск: python main.py
"""

from pathlib import Path

from app.services.orders import load_orders, revenue_by_waiter
from app.ui.console import print_report
from app.utils.clock import today_label
from app.utils.formatter import format_kopeks, format_title


def build_report(path: Path) -> list[str]:
    """Собирает строки отчёта по файлу смены.

    Args:
        path: Путь к файлу смены с колонками waiter и kopeks.

    Returns:
        Строки отчёта: заголовок с датой, строка на каждого официанта
        и итог.

    Raises:
        FileNotFoundError: Если файла смены нет.
        ValueError: Если в файле нет ни одного заказа.
    """
    orders = load_orders(path)
    revenue = revenue_by_waiter(orders)
    lines = [format_title(f" Смена {today_label()} ")]
    for waiter, kopeks in revenue.items():
        lines.append(f"{waiter:<20}{format_kopeks(kopeks):>20}")
    lines.append(format_title(f" Итого {format_kopeks(sum(revenue.values()))} "))
    return lines


if __name__ == "__main__":
    print_report(build_report(Path("data/smena.csv")))
