"""Дополнительные задачи занятия 17. Проверка: python -m pytest tests_extra.py -v"""


def num_identical_pairs(nums):
    """Число хороших пар, LeetCode 1512.

    Пара (i, j) хорошая, если i < j и nums[i] == nums[j].
    Пример: [1, 2, 3, 1, 1, 3] → 4. Время O(n).
    """
    raise NotImplementedError


def find_difference(nums1, nums2):
    """Разность двух массивов, LeetCode 2215.

    Вернуть [a, b]: a — отсортированный список различных чисел nums1, которых нет в nums2,
    b — то же для nums2. Пример: [1, 2, 3], [2, 4, 6] → [[1, 3], [4, 6]].
    """
    raise NotImplementedError


def unique_occurrences(arr):
    """Все ли частоты разные, LeetCode 1207.

    True, если у разных чисел разное число вхождений.
    Пример: [1, 2, 2, 1, 1, 3] → True (частоты 3, 2, 1), [1, 2] → False.
    """
    raise NotImplementedError
