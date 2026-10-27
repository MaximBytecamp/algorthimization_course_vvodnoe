"""Домашнее задание 12, задача 2. Три функции с ошибкой на граничном входе.

Каждая функция верно отвечает на обычных входах. Для каждой:
1) найдите вход, на котором ответ неверный или функция падает;
2) запишите падающий тест в tests_bugs_12.py;
3) исправьте одну строку;
4) прогоните тесты снова.
Интервал — [start, end), start < end, моменты времени — целые числа от 0.
"""


def busy_hours(intervals):
    """Сколько часов занято хотя бы одной встречей: длина объединения интервалов.

    intervals — встречи в любом порядке, может быть пустым.
    reach — самый поздний конец среди пройденных встреч. Время O(n log n).
    """
    total = 0
    reach = 0
    for start, end in sorted(intervals):
        if start >= reach:
            total += end - start
        elif end > reach:
            total += end - reach
        reach = end
    return total


def first_conflict(intervals):
    """Первый конфликт в порядке начала встреч.

    Встречи сортируются по началу. Вернуть пару [предыдущая, текущая] для первой
    встречи, которая начинается раньше конца предыдущей. Конфликтов нет — None.
    Время O(n log n).
    """
    ordered = sorted(intervals)
    for i in range(1, len(ordered) - 1):
        if ordered[i][0] < ordered[i - 1][1]:
            return [ordered[i - 1], ordered[i]]
    return None


def longest_busy(intervals):
    """Длина самого длинного блока занятости: пересекающиеся и касающиеся встречи
    склеиваются в один блок. Для пустого списка — 0. Время O(n log n).
    """
    best = 0
    block_start = block_end = None
    for start, end in sorted(intervals):
        if block_end is not None and start < block_end:
            block_end = max(block_end, end)
        else:
            block_start, block_end = start, end
        best = max(best, block_end - block_start)
    return best
