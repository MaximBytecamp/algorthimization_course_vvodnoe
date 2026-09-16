"""Инвариант на примере самой длинной серии одинаковых соседей.

longest_run([1, 1, 2, 2, 2]) должна вернуть 3.
Инвариант: после обработки первых k элементов best — длина самой длинной
серии внутри этих k, а tekushchaya — длина серии, которая кончается на k-м.
"""


def longest_run(chisla):
    if not chisla:
        return 0
    best = tekushchaya = 1
    for i in range(1, len(chisla)):
        if chisla[i] == chisla[i - 1]:
            tekushchaya += 1
        else:
            tekushchaya = 1
        if tekushchaya > best:
            best = tekushchaya
        print(f'  k = {i + 1}: обработано {chisla[:i + 1]}  tekushchaya = {tekushchaya}  best = {best}')
    return best


print('вход [1, 1, 2, 2, 2]')
print('ответ:', longest_run([1, 1, 2, 2, 2]))
print()
print('вход [7]  ответ:', longest_run([7]))
print('вход []   ответ:', longest_run([]))
