"""Домашнее задание 10, задача 2. Три функции с ошибкой на граничном входе.

Каждая функция верно отвечает на обычных входах. Для каждой:
1) найдите вход, на котором ответ неверный или функция падает;
2) запишите падающий тест в tests_bugs_10.py;
3) исправьте одну строку;
4) прогоните тесты снова.
"""


def max_ones(bits, k):
    """Самый длинный отрезок, в котором нулей не больше k (LeetCode 1004).

    bits — список из 0 и 1, k >= 0. Время O(n), память O(1).
    """
    best = 0
    zeros = 0
    l = 0
    for r in range(len(bits)):
        if bits[r] == 0:
            zeros += 1
        while zeros > k and l < r:
            if bits[l] == 0:
                zeros -= 1
            l += 1
        best = max(best, r - l + 1)
    return best


def longest_k_distinct(text, k):
    """Самая длинная подстрока, в которой не больше k разных символов.

    text — любая строка, может быть пустой; k >= 0. Время O(n), память O(k).
    """
    count = {}
    best = 1
    l = 0
    for r in range(len(text)):
        ch = text[r]
        count[ch] = count.get(ch, 0) + 1
        while len(count) > k:
            count[text[l]] -= 1
            if count[text[l]] == 0:
                del count[text[l]]
            l += 1
        best = max(best, r - l + 1)
    return best


def shortest_at_least(nums, s):
    """Длина самого короткого отрезка с суммой не меньше s, 0 — если такого нет.

    nums — неотрицательные целые числа; s >= 1, иначе ValueError.
    Время O(n), память O(1).
    """
    if s < 0:
        raise ValueError("s должно быть не меньше 1")
    best = 0
    total = 0
    l = 0
    for r in range(len(nums)):
        total += nums[r]
        while total >= s:
            length = r - l + 1
            if best == 0 or length < best:
                best = length
            total -= nums[l]
            l += 1
    return best
