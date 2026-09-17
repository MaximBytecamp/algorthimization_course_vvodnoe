"""Сборка текста отчёта из расчётов и вспомогательных функций."""

from app.services.orders import average_kopeks, kopeks_by_waiter, total_kopeks
from app.utils.money import format_rubles, to_rubles
from app.utils.text import pad

WIDTH = 34


def build_report(orders: list[dict]) -> list[str]:
    """Возвращает готовые строки отчёта по списку заказов."""
    lines = ["ОТЧЁТ ПО ЗАКАЗАМ", "-" * WIDTH]
    lines.append(f"Заказов: {len(orders)}")
    lines.append(f"Выручка: {format_rubles(to_rubles(total_kopeks(orders)))}")
    lines.append(f"Средний чек: {format_rubles(to_rubles(average_kopeks(orders)))}")
    lines.append("-" * WIDTH)
    for waiter, kopeks in sorted(kopeks_by_waiter(orders).items()):
        lines.append(pad(waiter, 18) + format_rubles(to_rubles(kopeks)))
    return lines
