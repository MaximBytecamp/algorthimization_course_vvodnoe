"""Дополнительные задачи на окно фиксированной длины — для тех, кто закончил основные.

Проверка: python -m pytest tests_extra.py -v
Все три задачи есть на LeetCode с меткой Sliding Window.
"""


def min_recolors(blocks, k):
    """LeetCode 2379 · Minimum Recolors to Get K Consecutive Black Blocks.

    blocks — строка из 'W' (белый) и 'B' (чёрный), 1 <= k <= len(blocks).
    За операцию белый блок перекрашивается в чёрный. Вернуть наименьшее число
    операций, чтобы где-то стояли k чёрных блоков подряд.
    Подсказка: состояние окна — число белых блоков в нём. Время O(n), память O(1).
    """
    raise NotImplementedError


def count_good_substrings(s):
    """LeetCode 1876 · Substrings of Size Three with Distinct Characters.

    Посчитать подстроки длины 3, в которых все три буквы разные.
    Одинаковые подстроки в разных местах считаются отдельно.
    Время O(n), память O(1).
    """
    raise NotImplementedError


def max_satisfied(customers, grumpy, minutes):
    """LeetCode 1052 · Grumpy Bookstore Owner.

    customers[i] — покупатели в минуту i, grumpy[i] == 1 — продавец сердит, и они недовольны.
    Один раз за день продавец может не сердиться minutes минут подряд.
    Вернуть наибольшее число довольных покупателей за день.
    Подсказка: довольные без приёма считаются один раз, а окно длины minutes
    выбирает, где выгоднее всего «вернуть» покупателей. Время O(n), память O(1).
    """
    raise NotImplementedError
