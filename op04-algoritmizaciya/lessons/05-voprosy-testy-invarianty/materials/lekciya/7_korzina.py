"""Самый простой инвариант: сумма покупок в корзине.

Проходим по ценам и держим в переменной itogo сумму того, что уже
положили. После каждого шага печатаем состояние: видно, что утверждение
«itogo — сумма первых k цен» верно на каждой строке.
"""

CENY = [120, 45, 300, 60]


def summa(ceny):
    itogo = 0
    for k, cena in enumerate(ceny, start=1):
        itogo += cena
        print(f'  положили {k}-й товар за {cena:>3} | в корзине {ceny[:k]} | itogo = {itogo}')
    return itogo


print('цены:', CENY)
print('проход:')
otvet = summa(CENY)
print('итог:', otvet, '| проверка суммой Python:', sum(CENY))
