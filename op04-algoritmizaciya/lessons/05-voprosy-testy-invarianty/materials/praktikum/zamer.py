"""Замер выбранных вариантов на своём компьютере.

Скрипт ничего не утверждает заранее: он печатает то время, которое
получилось у вас. Медиана трёх прогонов, как в теме 4.

Запуск: python3 zamer.py
Поменяйте RAZMERY и SPISOK_A / SPISOK_B под свой заказ.
"""
import random
from statistics import median
from time import perf_counter

import zadacha_a_kth as A
import zadacha_b_poisk as B

RAZMERY = [1_000, 10_000, 100_000]
POVTOROV = 3

# Какие варианты сравниваем. Добавьте или уберите строки.
SPISOK_A = [A.v01_sort_kopii, A.v03_nlargest, A.v05_k_prohodov]
SPISOK_B = [B.v01_lineyno_kazhdyy, B.v03_set_zaranee, B.v08_set_kazhdyy_raz]


def zamerit(funkciya, *argumenty):
    """Медиана нескольких запусков. Данные готовятся до замера."""
    vremena = []
    for _ in range(POVTOROV):
        start = perf_counter()
        funkciya(*argumenty)
        vremena.append(perf_counter() - start)
    return median(vremena)


def stolbcy(zagolovok, imena):
    print(f'\n{zagolovok}')
    print('n'.rjust(9), *[imya.rjust(24) for imya in imena])


def main():
    stolbcy('Задача A: k-й по величине, k = 10', [f.__name__ for f in SPISOK_A])
    for n in RAZMERY:
        dannye = [random.randint(0, 1_000_000) for _ in range(n)]
        stroka = [f'{zamerit(variant, list(dannye), 10):.6f}'.rjust(24) for variant in SPISOK_A]
        print(str(n).rjust(9), *stroka)

    stolbcy('Задача B: 1000 запросов', [f.__name__ for f in SPISOK_B])
    for n in RAZMERY:
        dannye = [random.randint(0, 1_000_000) for _ in range(n)]
        zaprosy = [random.randint(0, 1_000_000) for _ in range(1000)]
        stroka = [f'{zamerit(variant, list(dannye), list(zaprosy)):.6f}'.rjust(24) for variant in SPISOK_B]
        print(str(n).rjust(9), *stroka)

    print('\nВремя в секундах. Числа зависят от машины и загрузки системы,')
    print('поэтому сравнивают не абсолютные значения, а рост при увеличении n.')


if __name__ == '__main__':
    main()
