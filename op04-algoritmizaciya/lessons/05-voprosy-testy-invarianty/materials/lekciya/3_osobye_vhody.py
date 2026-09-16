"""Пять входов, на которых падают чаще всего.

Каждый пример — отдельная функция с одной ошибкой и вход, который её
показывает. Запуск печатает, что ждали и что получилось.
"""


def srednee(chisla):
    """Пустой список: деление на ноль."""
    return sum(chisla) / len(chisla)


def maksimum(chisla):
    """Отрицательные числа: начальное значение не из списка."""
    best = 0
    for value in chisla:
        if value > best:
            best = value
    return best


def indeks_minimuma(chisla):
    """Дубликаты: >= переносит ответ на последнее совпадение."""
    best = 0
    for i in range(len(chisla)):
        if chisla[i] <= chisla[best]:
            best = i
    return best


def est_nol(chisla):
    """Граница цикла: последний элемент не проверяется."""
    for i in range(len(chisla) - 1):
        if chisla[i] == 0:
            return True
    return False


def summa_v_int32(chisla):
    """Переполнение: каждое число помещается в int32, сумма — нет."""
    predel = 2 ** 31 - 1
    itogo = sum(chisla)
    return itogo if itogo <= predel else f'не помещается в int32: {itogo}'


PROVERKI = [
    ('пустой вход', srednee, ([],), 'ошибку или None'),
    ('отрицательные', maksimum, ([-7, -3],), -3),
    ('дубликаты', indeks_minimuma, ([3, 1, 1],), 1),
    ('последний элемент', est_nol, ([4, 8, 0],), True),
    ('переполнение', summa_v_int32, ([2_000_000_000, 2_000_000_000],), 4_000_000_000),
]

for nazvanie, funkciya, argumenty, ojidaem in PROVERKI:
    try:
        poluchili = funkciya(*argumenty)
    except Exception as oshibka:
        poluchili = f'{type(oshibka).__name__}: {oshibka}'
    print(f'{nazvanie:18} вход {argumenty[0]}')
    print(f'{"":18} ждём {ojidaem} · получили {poluchili}')
