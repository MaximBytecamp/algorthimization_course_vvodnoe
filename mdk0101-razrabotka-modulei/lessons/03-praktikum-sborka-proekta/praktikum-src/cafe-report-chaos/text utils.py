"""Работа со строками отчёта: имена и выравнивание колонок."""


def normalize_name(name: str) -> str:
    """Убирает лишние пробелы и приводит имя к виду «Анна Петрова»."""
    return " ".join(part.capitalize() for part in name.split())


def pad(text: str, width: int) -> str:
    """Дополняет строку пробелами справа до нужной ширины колонки."""
    if len(text) >= width:
        return text
    return text + " " * (width - len(text))
