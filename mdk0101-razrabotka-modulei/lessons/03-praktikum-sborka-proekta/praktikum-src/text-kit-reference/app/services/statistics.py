"""Расчёты по числовым данным."""


def average(numbers: list[float]) -> float:
    """Считает среднее значение. Для пустого списка вызывает ValueError."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    return sum(numbers) / len(numbers)


def median(numbers: list[float]) -> float:
    """Возвращает срединное значение списка."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def spread(numbers: list[float]) -> float:
    """Считает разницу между наибольшим и наименьшим значением."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    return max(numbers) - min(numbers)


def count_values(items: list) -> dict:
    """Считает, сколько раз встречается каждое значение."""
    result: dict = {}
    for item in items:
        result[item] = result.get(item, 0) + 1
    return result
