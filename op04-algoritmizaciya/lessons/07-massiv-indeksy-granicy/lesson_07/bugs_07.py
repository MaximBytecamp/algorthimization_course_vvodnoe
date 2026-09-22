"""Домашнее задание 7 · три функции с ошибкой на границе.

Каждая функция на обычных входах отвечает верно и ошибается только на
граничном входе. Для каждой: найти вход, записать тест, который падает,
исправить одну строку и прогнать тест снова.
"""


def has_growth(prices: list[int]) -> bool:
    """True, если хотя бы в один день цена выросла по сравнению с предыдущим."""
    for i in range(len(prices)):
        if prices[i + 1] > prices[i]:
            return True
    return False


def window_sums(values: list[int], k: int) -> list[int]:
    """Суммы всех отрезков длины k подряд, слева направо. 1 <= k <= len(values)."""
    return [sum(values[i:i + k]) for i in range(len(values) - k)]


def last_n(events: list[str], n: int) -> list[str]:
    """Последние n событий журнала. Если событий меньше n, возвращаются все. n >= 0."""
    return events[len(events) - n:]
