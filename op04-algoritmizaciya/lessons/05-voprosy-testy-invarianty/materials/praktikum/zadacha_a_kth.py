"""Задача A: вернуть k-й по величине элемент списка целых чисел.

Десять рабочих реализаций одной задачи. Они отличаются временем,
дополнительной памятью и требованиями к входу. Какая подходит,
определяют ограничения задачи, а их узнают вопросами к условию.

Общий контракт: k считается с единицы, повторы учитываются,
1 <= k <= len(numbers), исходный список не изменяется.
Варианты, которые нарушают этот контракт, отмечены в TREBOVANIYA.

Запуск: python3 zadacha_a_kth.py
"""
import heapq
import random
from bisect import insort


def v01_sort_kopii(numbers, k):
    """Сортировка копии по убыванию. O(n log n) времени, O(n) памяти."""
    return sorted(numbers, reverse=True)[k - 1]


def v02_sort_na_meste(numbers, k):
    """Сортировка на месте. O(n log n) времени, O(1) доп. памяти.
    Меняет исходный список: после вызова порядок элементов другой."""
    numbers.sort()
    return numbers[-k]


def v03_nlargest(numbers, k):
    """heapq.nlargest: k наибольших. O(n log k) времени, O(k) памяти."""
    return heapq.nlargest(k, numbers)[-1]


def v04_kucha_iz_k(numbers, k):
    """Своя куча из k наибольших. O(n log k) времени, O(k) памяти.
    Подходит, когда весь список сразу в память не помещается."""
    heap = []
    for value in numbers:
        if len(heap) < k:
            heapq.heappush(heap, value)
        elif value > heap[0]:
            heapq.heapreplace(heap, value)
    return heap[0]


def v05_k_prohodov(numbers, k):
    """k проходов: каждый раз ищем максимум среди неотброшенных.
    O(n * k) времени, O(n) памяти на копию. Для k = 1 это обычный поиск максимума."""
    ostatok = list(numbers)
    for _ in range(k - 1):
        ostatok.remove(max(ostatok))
    return max(ostatok)


def v06_quickselect(numbers, k):
    """Быстрый выбор. В среднем O(n), в худшем случае O(n^2).
    Работает с копией, исходный список не меняет."""
    chast = list(numbers)
    cel = len(chast) - k
    levo, pravo = 0, len(chast) - 1
    while True:
        opora = chast[random.randint(levo, pravo)]
        menshe = [x for x in chast[levo:pravo + 1] if x < opora]
        ravno = [x for x in chast[levo:pravo + 1] if x == opora]
        bolshe = [x for x in chast[levo:pravo + 1] if x > opora]
        if cel - levo < len(menshe):
            chast[levo:pravo + 1] = menshe
            pravo = levo + len(menshe) - 1
        elif cel - levo < len(menshe) + len(ravno):
            return opora
        else:
            levo = levo + len(menshe) + len(ravno)
            chast[levo:pravo + 1] = bolshe


def v07_schetchik(numbers, k):
    """Счётчик по значениям. O(n + m) времени и O(m) памяти,
    где m — размер диапазона значений. Требует целых значений от 0 до m."""
    predel = max(numbers)
    schet = [0] * (predel + 1)
    for value in numbers:
        schet[value] += 1
    ostalos = k
    for value in range(predel, -1, -1):
        ostalos -= schet[value]
        if ostalos <= 0:
            return value


def v08_bisect_top_k(numbers, k):
    """Держим отсортированный список из k наибольших через insort.
    O(n * k) в худшем случае из-за сдвигов при вставке, O(k) памяти."""
    top = []
    for value in numbers:
        insort(top, value)
        if len(top) > k:
            top.pop(0)
    return top[0]


def v09_dve_peremennye(numbers, k):
    """Один проход с двумя переменными. O(n) времени, O(1) памяти.
    Работает только при k = 2: для другого k нужен другой код."""
    if k != 2:
        raise ValueError('вариант v09 написан только для k = 2')
    pervyy = vtoroy = None
    for value in numbers:
        if pervyy is None or value > pervyy:
            pervyy, vtoroy = value, pervyy
        elif vtoroy is None or value > vtoroy:
            vtoroy = value
    return vtoroy


def v10_razlichnye(numbers, k):
    """k-е различное значение: повторы сначала убираются.
    Другой контракт: для [10, 10, 5] и k = 2 ответ 5, а не 10."""
    return sorted(set(numbers), reverse=True)[k - 1]


# Что каждый вариант требует от входа и чем платит.
TREBOVANIYA = {
    'v01_sort_kopii': 'ничего не требует; O(n log n) времени, O(n) памяти',
    'v02_sort_na_meste': 'меняет исходный список; O(n log n) времени, O(1) доп. памяти',
    'v03_nlargest': 'ничего не требует; O(n log k) времени, O(k) памяти',
    'v04_kucha_iz_k': 'ничего не требует; O(n log k) времени, O(k) памяти',
    'v05_k_prohodov': 'ничего не требует; O(n * k) времени, O(n) памяти',
    'v06_quickselect': 'ничего не требует; в среднем O(n), в худшем O(n^2)',
    'v07_schetchik': 'целые значения от 0 до m; O(n + m) времени, O(m) памяти',
    'v08_bisect_top_k': 'ничего не требует; O(n * k) в худшем случае, O(k) памяти',
    'v09_dve_peremennye': 'только k = 2; O(n) времени, O(1) памяти',
    'v10_razlichnye': 'другой контракт: k-е различное значение',
}

VARIANTY = [v01_sort_kopii, v02_sort_na_meste, v03_nlargest, v04_kucha_iz_k,
            v05_k_prohodov, v06_quickselect, v07_schetchik, v08_bisect_top_k,
            v09_dve_peremennye, v10_razlichnye]

if __name__ == '__main__':
    dannye = [7, 2, 9, 9, 4, 1]
    k = 2
    print('вход:', dannye, '| k =', k)
    for variant in VARIANTY:
        try:
            print(f'{variant.__name__:20} {variant(list(dannye), k)}')
        except ValueError as oshibka:
            print(f'{variant.__name__:20} ошибка: {oshibka}')
