"""Домашнее задание 11, задача 2. Три функции с ошибкой на граничном входе.

Каждая функция верно отвечает на обычных входах. Для каждой:
1) найдите вход, на котором ответ неверный или функция падает;
2) запишите падающий тест в tests_bugs_11.py;
3) исправьте одну строку;
4) прогоните тесты снова.
"""


def longest_zero_sum(nums):
    """Длина самого длинного отрезка подряд с суммой 0; если такого нет — 0.

    nums — целые числа любого знака, может быть пустым.
    Для каждой префиксной суммы запоминается индекс, где она встретилась впервые.
    Время O(n), память O(n).
    """
    first = {}
    prefix = 0
    best = 0
    for i in range(len(nums)):
        prefix += nums[i]
        if prefix in first:
            best = max(best, i - first[prefix])
        else:
            first[prefix] = i
    return best


def last_pivot_index(nums):
    """Самый правый индекс i, где сумма nums[:i] равна сумме nums[i + 1:]; нет — -1.

    nums — целые числа любого знака, может быть пустым.
    Проход справа налево: right — сумма правее i. Время O(n), память O(1).
    """
    total = sum(nums)
    right = 0
    for i in range(len(nums) - 1, 0, -1):
        left = total - right - nums[i]
        if left == right:
            return i
        right += nums[i]
    return -1


def max_query_sum(nums, queries):
    """Наибольшая сумма среди запросов (l, r) — полуинтервалов nums[l:r].

    nums — целые числа любого знака; queries — непустой список верных запросов,
    0 <= l <= r <= len(nums). Время O(n + q), память O(n).
    """
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    best = 0
    for l, r in queries:
        s = prefix[r] - prefix[l]
        if s > best:
            best = s
    return best
