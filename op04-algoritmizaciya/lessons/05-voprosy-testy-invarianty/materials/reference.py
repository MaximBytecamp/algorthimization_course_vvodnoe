"""Эталон для сверки после самостоятельного разбора. Python 3.12."""


def second_max(numbers):
    """Второе различное значение или None. Вход не изменяется."""
    first = None
    second = None
    for value in numbers:
        if first is None or value > first:
            second = first
            first = value
        elif value != first and (second is None or value > second):
            second = value
    return second


def contains_zero(numbers):
    """True, если есть ноль; для пустого списка False."""
    for value in numbers:
        if value == 0:
            return True
    return False


def is_sorted(numbers):
    """Неубывание; равенство разрешено, пустой список упорядочен."""
    for i in range(len(numbers) - 1):
        if numbers[i] > numbers[i + 1]:
            return False
    return True
