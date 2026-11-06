"""Домашнее задание 18, задача 2: три функции с ошибкой на границе.

Каждая функция верно отвечает на обычных входах и ошибается на граничном.
Найдите такой вход, запишите падающий тест в tests_bugs_18.py,
исправьте ошибку и прогоните тесты снова.
"""


def most_frequent_letter(text):
    """Самая частая буква строки. При равной частоте — та, что встретилась раньше.

    'ананас' → 'а'. Пустая строка → ''.
    """
    count = {}
    for ch in text:
        count[ch] = count.get(ch, 0) + 1
    best, best_count = '', 0
    for ch, c in count.items():
        if c >= best_count:
            best, best_count = ch, c
    return best


def group_by_length(words):
    """Словарь «длина → слова этой длины» в порядке входа, повторы сохраняются.

    ['кот', 'ёж', 'дом', 'кот'] → {3: ['кот', 'дом', 'кот'], 2: ['ёж']}.
    """
    groups = {}
    for w in words:
        groups.setdefault(len(w), [])
        if w not in groups[len(w)]:
            groups[len(w)].append(w)
    return groups


def count_top_ties(nums):
    """Сколько разных чисел имеют наибольшую частоту.

    [1, 1, 2, 2, 3] → 2 (это 1 и 2). Пустой список → 0.
    """
    count = {}
    for x in nums:
        count[x] = count.get(x, 0) + 1
    top = max(count.values())
    return sum(1 for c in count.values() if c == top)
