"""Дата для шапки отчёта."""

from datetime import date


def today_label() -> str:
    """Возвращает текущую дату в виде «21.09.2026» для шапки отчёта."""
    return date.today().strftime("%d.%m.%Y")
