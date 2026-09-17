"""Работа с суммами: перевод копеек в рубли и запись суммы строкой."""


def to_rubles(kopeks: float) -> float:
    """Переводит сумму из копеек в рубли и округляет до двух знаков."""
    return round(kopeks / 100, 2)


def format_rubles(rubles: float) -> str:
    """Записывает сумму с пробелом между тысячами: 1 250,00 ₽."""
    text = f"{rubles:,.2f}".replace(",", " ").replace(".", ",")
    return f"{text} ₽"
