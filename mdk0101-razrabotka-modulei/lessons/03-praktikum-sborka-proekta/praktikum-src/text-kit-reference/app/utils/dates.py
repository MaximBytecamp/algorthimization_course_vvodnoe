"""Функции для работы с датами."""

from datetime import date


def parse_date(text: str) -> date:
    """Читает дату из строки вида «17.09.2026»."""
    day, month, year = (int(part) for part in text.split("."))
    return date(year, month, day)


def format_date(value: date) -> str:
    """Записывает дату строкой вида «17.09.2026»."""
    return f"{value.day:02d}.{value.month:02d}.{value.year}"


def is_weekend(value: date) -> bool:
    """Отвечает, выходной ли это день: суббота или воскресенье."""
    return value.weekday() >= 5


def days_between(first: date, second: date) -> int:
    """Считает, сколько дней между двумя датами. Порядок дат не важен."""
    return abs((second - first).days)
