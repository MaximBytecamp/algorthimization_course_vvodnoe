"""Домашнее задание 17, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_17.py,
исправьте ошибку и прогоните тесты снова.
"""


def count_single(items):
    """Сколько элементов встречается в списке ровно один раз.

    [4, 1, 4, 7] → 2 (это 1 и 7). Пустой список → 0.
    """
    seen = set()
    for x in items:
        if x in seen:
            seen.remove(x)
        else:
            seen.add(x)
    return len(seen)


def common_ids(a, b):
    """Отсортированный список id, которые есть и в a, и в b, без повторов.

    [3, 1, 2], [2, 3, 5] → [2, 3].
    """
    in_b = set(b)
    return sorted(x for x in a if x in in_b)


def pair_exists(nums, target):
    """Есть ли два элемента с разными индексами и суммой target.

    [1, 4, 6], 10 → True. Один элемент дважды не берётся.
    """
    seen = set(nums)
    for x in nums:
        if target - x in seen:
            return True
    return False
