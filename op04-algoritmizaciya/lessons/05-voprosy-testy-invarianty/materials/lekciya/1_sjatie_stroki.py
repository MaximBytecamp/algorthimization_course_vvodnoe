"""Одно условие — два разных ответа.

«Сожмите строку: aaabb → a3b2». Что делать с одиночным символом,
в условии не сказано, и от ответа зависит результат.
"""


def sjat_vsegda_s_chislom(text):
    """Пишет число всегда, даже когда символ один: abc → a1b1c1."""
    if not text:
        return ''
    kuski = []
    dlina = 1
    for i in range(1, len(text) + 1):
        if i < len(text) and text[i] == text[i - 1]:
            dlina += 1
        else:
            kuski.append(text[i - 1] + str(dlina))
            dlina = 1
    return ''.join(kuski)


def sjat_bez_edinic(text):
    """Одиночный символ пишет без числа: abc → abc."""
    if not text:
        return ''
    kuski = []
    dlina = 1
    for i in range(1, len(text) + 1):
        if i < len(text) and text[i] == text[i - 1]:
            dlina += 1
        else:
            kuski.append(text[i - 1] + (str(dlina) if dlina > 1 else ''))
            dlina = 1
    return ''.join(kuski)


for vhod in ['aaabb', 'abc', '']:
    print(f'{vhod!r:8} с числом всегда: {sjat_vsegda_s_chislom(vhod)!r:10} без единиц: {sjat_bez_edinic(vhod)!r}')
