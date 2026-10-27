"""Дополнительные задачи на интервалы — для тех, кто закончил основные.

Проверка: python -m pytest tests_extra.py -v
"""


def poisoned_duration(time_series, duration):
    """LeetCode 495 · Teemo Attacking.

    time_series — моменты атак по неубыванию, duration >= 0. Атака в момент t
    отравляет на полуинтервал [t, t + duration); новая атака во время отравления
    не складывается со старой, а отсчитывает duration заново. Вернуть, сколько
    всего длилось отравление. Подсказка: интервалы уже упорядочены по началу,
    сортировать не нужно. Время O(n).
    """
    raise NotImplementedError


def count_ways_to_group(ranges):
    """LeetCode 2580 · Count Ways to Group Overlapping Ranges.

    ranges — отрезки [start, end], ОБА конца включительно. Отрезки, у которых есть
    общее целое число, должны попасть в одну группу. Групп две, каждая группа
    связанных отрезков целиком уходит в одну из них. Вернуть число способов
    по модулю 10**9 + 7. Подсказка: объедините отрезки, ответ — 2 в степени
    числа блоков. Время O(n log n).
    """
    raise NotImplementedError


def free_slots(intervals, open_time, close_time):
    """Свободные окна рабочего дня.

    intervals — занятые интервалы [start, end) в любом порядке, все внутри
    [open_time, close_time). Вернуть список свободных интервалов дня по
    возрастанию, без пустых окон. Время O(n log n).
    """
    raise NotImplementedError
