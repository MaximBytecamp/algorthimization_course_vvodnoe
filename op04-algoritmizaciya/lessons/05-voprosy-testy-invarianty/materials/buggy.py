"""Намеренно ошибочные версии для разбора в модулях 5.3 и 5.6.

Контракты и разбор ошибок — на страницах этих модулей."""

def second_max(numbers):
    first = 0
    second = 0
    for value in numbers:
        if value > first:
            second = first
            first = value
        elif value > second:
            second = value
    return second


def contains_zero(numbers):
    for i in range(len(numbers) - 1):
        if numbers[i] == 0:
            return True
    return False


def is_sorted(numbers):
    for i in range(len(numbers) - 1):
        if numbers[i] >= numbers[i + 1]:
            return False
    return True
