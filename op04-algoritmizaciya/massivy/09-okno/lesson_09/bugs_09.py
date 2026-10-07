"""Домашнее задание 9, задача 2. Три функции с ошибкой на граничном входе.

Каждая функция верно отвечает на обычных входах. Для каждой:
1) найдите вход, на котором ответ неверный;
2) запишите падающий тест в tests_bugs_09.py;
3) исправьте одну строку;
4) прогоните тесты снова.
"""


def count_strong_windows(nums, k, limit):
    """Сколько окон длины k имеют сумму не меньше limit.

    k — длина окна, 1 <= k <= len(nums); иначе ValueError.
    Время O(n), память O(1).
    """
    if k < 1 or k >= len(nums):
        raise ValueError("k должно быть от 1 до len(nums)")
    total = sum(nums[:k])
    count = 1 if total >= limit else 0
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        if total >= limit:
            count += 1
    return count


def min_window(nums, k):
    """Окно длины k с наименьшей суммой: (start, total).

    При равных суммах — самое левое окно. 1 <= k <= len(nums); иначе ValueError.
    Время O(n), память O(1).
    """
    if k < 1 or k > len(nums):
        raise ValueError("k должно быть от 1 до len(nums)")
    total = sum(nums[:k])
    best, start = total, 0
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        if total <= best:
            best, start = total, r - k + 1
    return (start, best)


def count_in_window(times, s, w):
    """Сколько событий попадает в окно [s, s + w).

    times — моменты событий, w > 0. Время O(n), память O(1).
    """
    count = 0
    for t in times:
        if s <= t <= s + w:
            count += 1
    return count
