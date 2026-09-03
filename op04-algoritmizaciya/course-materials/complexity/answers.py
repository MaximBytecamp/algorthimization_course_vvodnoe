"""Ваши ответы по фрагментам из fragments.py · занятие 3.

Заполните оба словаря и запустите проверку:

    pytest course-materials/complexity/test_lesson_03.py

Проверка сравнивает не текст, а отпечаток ответа, поэтому подсмотреть
правильные оценки в тестах нельзя. Зато можно проверять себя сколько угодно
раз: тест называет номер фрагмента, но не называет верный ответ.

Как записывать оценку:

    O(1)        O(log n)      O(n)        O(n log n)      O(n^2)
    O(n + m)    — когда входов два и они растут независимо

Регистр букв и пробелы значения не имеют: «o(N LOG N)» засчитается.
Записи «O(2n)», «O(n/2)» и «O(n^2 + n)» — нет: константы и младшие
слагаемые в оценке не пишутся.

Незаполненный ответ — пустая строка. Тест покажет его как «не заполнено»,
а не как ошибку.
"""

# Время: как растёт число операций с ростом входа.
TIME = {
    "01_find_pass": "",
    "02_first_and_last": "",
    "03_has_duplicate_badges": "",
    "04_has_duplicate_badges_fast": "",
    "05_three_cheapest": "",
    "06_find_receipt": "",
    "07_average_and_spikes": "",
    "08_closest_pair_distance": "",
    "09_word_counts": "",
    "10_unique_keep_order": "",
    "11_halving_steps": "",
    "12_merge_sorted": "",
}

# Память: сколько функция занимает дополнительно к тому, что ей передали.
SPACE = {
    "01_find_pass": "",
    "02_first_and_last": "",
    "03_has_duplicate_badges": "",
    "04_has_duplicate_badges_fast": "",
    "05_three_cheapest": "",
    "06_find_receipt": "",
    "07_average_and_spikes": "",
    "08_closest_pair_distance": "",
    "09_word_counts": "",
    "10_unique_keep_order": "",
    "11_halving_steps": "",
    "12_merge_sorted": "",
}

# Худший случай двух фрагментов — одной строкой: при каком входе
# работы больше всего и почему.
WORST_CASE = {
    "01_find_pass": "",
    "04_has_duplicate_badges_fast": "",
}
