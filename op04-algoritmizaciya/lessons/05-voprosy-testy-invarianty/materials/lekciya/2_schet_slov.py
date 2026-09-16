"""Таблица тестов до реализации.

count_words(text) возвращает число слов. Слова разделены пробелами,
табуляцией или переводом строки.

Версия ниже считает разделители и прибавляет единицу — частая ошибка.
"""


def count_words(text):
    """Ошибочная версия: считает пробелы, а не слова."""
    probelov = 0
    for simvol in text:
        if simvol == ' ':
            probelov += 1
    return probelov + 1


TESTY = [
    ('кот пёс', 2, 'обычный случай'),
    ('кот', 1, 'одно слово без разделителей'),
    ('', 0, 'пустая строка'),
    ('  кот   пёс ', 2, 'лишние пробелы по краям и внутри'),
    ('кот\nпёс', 2, 'разделитель — перевод строки'),
]

for text, ojidaem, chto_proveryaet in TESTY:
    poluchili = count_words(text)
    itog = 'ок' if poluchili == ojidaem else 'ОШИБКА'
    print(f'{text!r:16} ждём {ojidaem}  получили {poluchili}  {itog:6} {chto_proveryaet}')
