"""Задача B: ответить на запросы «есть ли значение x в списке».

Десять рабочих реализаций одной задачи. Функция получает список чисел
и список запросов, возвращает список ответов True/False в том же порядке.
Отличаются они временем, дополнительной памятью и требованиями к входу.

Общий контракт: исходный список не изменяется, порядок ответов совпадает
с порядком запросов. Варианты, которые нарушают этот контракт или требуют
чего-то от входа, отмечены в TREBOVANIYA.

Запуск: python3 zadacha_b_poisk.py
"""
from bisect import bisect_left
from collections import Counter


def v01_lineyno_kazhdyy(numbers, zaprosy):
    """Для каждого запроса свой проход по списку. O(n * q) времени, O(1) памяти."""
    otvety = []
    for x in zaprosy:
        nayden = False
        for value in numbers:
            if value == x:
                nayden = True
                break
        otvety.append(nayden)
    return otvety


def v02_operator_in(numbers, zaprosy):
    """То же самое через оператор in. Короче на вид, но работа та же:
    in по списку — это линейный проход, всего O(n * q)."""
    return [x in numbers for x in zaprosy]


def v03_set_zaranee(numbers, zaprosy):
    """Множество строится один раз до запросов.
    O(n + q) времени в среднем, O(n) памяти."""
    vidennye = set(numbers)
    return [x in vidennye for x in zaprosy]


def v04_sort_kopii_bisect(numbers, zaprosy):
    """Отсортированная копия и двоичный поиск по ней.
    O(n log n + q log n) времени, O(n) памяти. Исходный список цел."""
    poryadok = sorted(numbers)
    otvety = []
    for x in zaprosy:
        mesto = bisect_left(poryadok, x)
        otvety.append(mesto < len(poryadok) and poryadok[mesto] == x)
    return otvety


def v05_sort_na_meste_bisect(numbers, zaprosy):
    """Сортировка на месте и двоичный поиск. O(n log n + q log n) времени,
    O(1) доп. памяти. Меняет исходный список."""
    numbers.sort()
    otvety = []
    for x in zaprosy:
        mesto = bisect_left(numbers, x)
        otvety.append(mesto < len(numbers) and numbers[mesto] == x)
    return otvety


def v06_flagi(numbers, zaprosy):
    """Массив флагов по значениям. O(n + m + q) времени, O(m) памяти,
    где m — размер диапазона. Требует целых значений от 0 до m."""
    predel = max(numbers)
    est = [False] * (predel + 1)
    for value in numbers:
        est[value] = True
    return [0 <= x <= predel and est[x] for x in zaprosy]


def v07_slovar_kolichestv(numbers, zaprosy):
    """Словарь «значение → сколько раз». O(n + q) времени, O(n) памяти.
    Даёт не только ответ «есть ли», но и кратность."""
    skolko = Counter(numbers)
    return [skolko[x] > 0 for x in zaprosy]


def v08_set_kazhdyy_raz(numbers, zaprosy):
    """Множество строится внутри каждого запроса. Проверка быстрая,
    но построение стоит O(n), поэтому всего снова O(n * q)."""
    return [x in set(numbers) for x in zaprosy]


def v09_binarnyy_poisk_svoy(numbers, zaprosy):
    """Свой двоичный поиск без сортировки. O(q log n) времени, O(1) памяти.
    Требует, чтобы список уже был отсортирован по возрастанию."""
    otvety = []
    for x in zaprosy:
        levo, pravo = 0, len(numbers) - 1
        nayden = False
        while levo <= pravo:
            seredina = (levo + pravo) // 2
            if numbers[seredina] == x:
                nayden = True
                break
            if numbers[seredina] < x:
                levo = seredina + 1
            else:
                pravo = seredina - 1
        otvety.append(nayden)
    return otvety


def v10_sliyanie_zaprosov(numbers, zaprosy):
    """Сортируем и список, и запросы, идём по обоим один раз.
    O(n log n + q log q) времени, O(n + q) памяти. Порядок ответов
    восстанавливается по исходным позициям запросов."""
    poryadok = sorted(numbers)
    pary = sorted(range(len(zaprosy)), key=lambda i: zaprosy[i])
    otvety = [False] * len(zaprosy)
    i = 0
    for nomer in pary:
        x = zaprosy[nomer]
        while i < len(poryadok) and poryadok[i] < x:
            i += 1
        otvety[nomer] = i < len(poryadok) and poryadok[i] == x
    return otvety


TREBOVANIYA = {
    'v01_lineyno_kazhdyy': 'ничего не требует; O(n * q) времени, O(1) памяти',
    'v02_operator_in': 'ничего не требует; O(n * q) времени, O(1) памяти',
    'v03_set_zaranee': 'ничего не требует; O(n + q) времени, O(n) памяти',
    'v04_sort_kopii_bisect': 'ничего не требует; O(n log n + q log n), O(n) памяти',
    'v05_sort_na_meste_bisect': 'меняет исходный список; O(n log n + q log n), O(1) доп. памяти',
    'v06_flagi': 'целые значения от 0 до m; O(n + m + q) времени, O(m) памяти',
    'v07_slovar_kolichestv': 'ничего не требует; O(n + q) времени, O(n) памяти, даёт кратность',
    'v08_set_kazhdyy_raz': 'ничего не требует; O(n * q) времени: множество строится заново на каждый запрос',
    'v09_binarnyy_poisk_svoy': 'список уже отсортирован; O(q log n) времени, O(1) памяти',
    'v10_sliyanie_zaprosov': 'ничего не требует; O(n log n + q log q), O(n + q) памяти',
}

VARIANTY = [v01_lineyno_kazhdyy, v02_operator_in, v03_set_zaranee,
            v04_sort_kopii_bisect, v05_sort_na_meste_bisect, v06_flagi,
            v07_slovar_kolichestv, v08_set_kazhdyy_raz, v09_binarnyy_poisk_svoy,
            v10_sliyanie_zaprosov]

if __name__ == '__main__':
    dannye = [4, 1, 9, 4, 7]
    zaprosy = [4, 5, 9, 0]
    print('список:', dannye, '| запросы:', zaprosy)
    for variant in VARIANTY:
        rabochiy = sorted(dannye) if variant is v09_binarnyy_poisk_svoy else list(dannye)
        print(f'{variant.__name__:26} {variant(rabochiy, list(zaprosy))}')
