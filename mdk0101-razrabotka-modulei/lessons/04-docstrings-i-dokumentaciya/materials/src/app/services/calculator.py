"""Расчёты по оценкам: среднее и границы."""


def calculate_average(grades: list[int]) -> float:
    """Считает среднюю оценку по списку.

    Args:
        grades: Оценки от 2 до 5, список не должен быть пустым.

    Returns:
        Среднее значение, округлённое до двух знаков.

    Raises:
        ValueError: Если список оценок пуст. Среднее по пустому списку
            не определено, поэтому нуль в этом случае не возвращается.
    """
    if not grades:
        raise ValueError("Список оценок пуст")
    return round(sum(grades) / len(grades), 2)


def grade_bounds(grades: list[int]) -> tuple[int, int]:
    """Находит минимальную и максимальную оценку.

    Args:
        grades: Оценки студента, список не должен быть пустым.

    Returns:
        Пара «минимум, максимум» именно в этом порядке.

    Raises:
        ValueError: Если список оценок пуст.
    """
    if not grades:
        raise ValueError("Список оценок пуст")
    return min(grades), max(grades)
