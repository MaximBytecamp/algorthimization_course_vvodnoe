"""Ручной прогон: двоичный поиск с ошибкой в границе цикла.

Условие while left < right не проверяет отрезок из одного элемента,
поэтому поиск не находит существующее значение.
"""


def binary_search(chisla, target):
    left, right = 0, len(chisla) - 1
    while left < right:            # ошибка: нужно left <= right
        middle = (left + right) // 2
        print(f'  left = {left}, right = {right}, middle = {middle}, chisla[middle] = {chisla[middle]}')
        if chisla[middle] == target:
            return middle
        if chisla[middle] < target:
            left = middle + 1
        else:
            right = middle - 1
    print(f'  выход из цикла: left = {left}, right = {right} — отрезок из одного элемента не проверен')
    return -1


for chisla, target in [([1, 3, 5], 5), ([5], 5), ([1, 3, 5], 3)]:
    print(f'binary_search({chisla}, {target})')
    print('  ответ:', binary_search(chisla, target), '\n')
