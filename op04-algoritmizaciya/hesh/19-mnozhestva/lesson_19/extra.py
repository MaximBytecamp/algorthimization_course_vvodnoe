"""Дополнительные задачи занятия 19. Проверка: python -m pytest tests_extra.py -v"""


def dest_city(paths):
    """Конечный город, LeetCode 1436.

    paths — пары [откуда, куда]; маршруты образуют цепочку без циклов. Вернуть город,
    из которого нет маршрута. Пример: [['B', 'C'], ['D', 'B'], ['C', 'A']] → 'A'.
    """
    raise NotImplementedError


def find_error_nums(nums):
    """Ошибка в наборе, LeetCode 645.

    nums должен содержать числа 1…n по одному разу, но одно число повторилось, а другое
    пропало. Вернуть [повтор, пропавшее]. Пример: [1, 2, 2, 4] → [2, 3].
    """
    raise NotImplementedError


def uncommon_from_sentences(s1, s2):
    """Необщие слова двух предложений, LeetCode 884.

    Слово необщее, если встречается ровно один раз в одном предложении и ни разу в другом.
    Вернуть в порядке появления: сначала из s1, потом из s2.
    Пример: 'this apple is sweet', 'this apple is sour' → ['sweet', 'sour'].
    """
    raise NotImplementedError
