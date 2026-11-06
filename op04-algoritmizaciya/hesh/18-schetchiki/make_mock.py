"""Собирает главу 17.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../17-vybor/make_mock.py, задачи и текст страницы — свои.
Перед записью страницы скрипт проверяет запуском:
  - ответы в таблицах примеров — эталонной функцией из make_traces.py;
  - тесты песочницы проходят на эталоне и падают на заготовке;
  - пошаговый прогон из traces.js вызывает эталон на первом примере.
Запуск: python make_mock.py  →  06-mok-intervyu.html
"""
import html
import json
import re
import sys
import textwrap

E = html.escape

# ── Эталонные решения: те же, что в главах модуля и в traces.js ───────
import importlib.util as _ilu
import pathlib as _pl
_spec = _ilu.spec_from_file_location('m18traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m18 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m18)

REF = {k: _m18.SOURCES[k] for k in ('group_anagrams', 'top_k_frequent', 'frequency_sort', 'kth_distinct',
                                    'count_k_difference', 'smaller_than_current', 'rearrange_characters', 'group_by_domain')}

FORMS = {
    'group': 'Словарь групп по ключу группировки',
    'count': 'Частотный словарь, затем проход по исходной последовательности',
    'sortfreq': 'Частотный словарь, затем сортировка по частоте',
    'pairs': 'Словарь частот пройденной части для подсчёта пар',
    'prefix': 'Частоты по значениям и префиксные суммы',
    'ratio': 'Две частотные таблицы и деление частот',
}

FORM_WHY = {
    'group': 'Словарь групп берут, когда элементы с одним признаком нужно собрать вместе. Признак — ключ: отсортированные буквы, домен почты. Ключ хешируемый, группа — список.',
    'count': 'Частотный словарь с повторным проходом берут, когда ответ зависит и от частоты, и от позиции: «k-й элемент, встретившийся один раз». Первый проход считает, второй идёт по входу в его порядке.',
    'sortfreq': 'Сортировку частот берут, когда ответ — элементы, упорядоченные по частоте. Сортируются только d разных значений, устойчивость сохраняет порядок первого появления.',
    'pairs': 'Словарь частот пройденной части берут, когда считают пары i < j: для каждого x прибавляют, сколько подходящих значений уже встретилось левее. Это приём пары с суммой из модуля 17.',
    'prefix': 'Частоты по значениям с префиксными суммами берут, когда значения — небольшие целые, а для каждого нужно знать, сколько значений меньше. Префиксные суммы — модуль 11 книги о массивах.',
    'ratio': 'Две частотные таблицы берут, когда из одного набора букв собирают другой. Число копий — наименьшее отношение «есть / нужно» по буквам образца.',
}

CX_HASH = ('O(n) по времени в среднем, O(d) по памяти',
           ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(1) по памяти'])


def _tests(fn, cases):
    """Тесты песочницы по списку (аргументы, ожидаемый ответ, имя, описание)."""
    out = ''
    for args, want, name, doc in cases:
        call = f"{fn}({', '.join(repr(a) for a in args)})"
        out += f'''
def test_{name}():
    """{doc}"""
    r = {call}
    assert r == {want!r}, {f"ожидалось {want!r}, получено "!r} + repr(r)
'''
    return out


TASKS = [
  dict(
    id='group', fn='group_anagrams', title='Группы анаграмм', lc='LeetCode 49', lc_url='https://leetcode.com/problems/group-anagrams/', chapter='18.2', form='group',
    heads=('words', 'Ответ'), label='список words',
    say='Дан список слов. Сгруппируйте анаграммы.',
    retell='«Нужно разбить слова на группы так, чтобы в каждой были слова из одних и тех же букв».',
    ask=[
      ('Какие символы в словах?', 'Строчные русские буквы, ё отдельно.', 'Нормализации нет.', 'Ключ из букв как есть. Тест «ёж», «жё», «еж».'),
      ('Бывают ли одинаковые слова?', 'Да, оба остаются.', 'Повторы сохраняются.', 'Группа — список. Тест <code>[\'кот\', \'кот\']</code>.'),
      ('В каком порядке группы?', 'В порядке первого слова группы, слова — в порядке входа.', 'Результат устойчив.', 'Словарь хранит порядок вставки; группы не сортировать.'),
      ('Бывает ли пустое слово?', 'Да.', 'Пустое слово — своя группа.', 'Ключ <code>\'\'</code>. Тест <code>[\'\', \'\']</code>.'),
    ],
    examples=[
      ((['ток', 'дом', 'кот', 'мод'],), 'две группы'),
      ((['кот', 'кот'],), 'повтор слова'),
      ((['аб', 'абб', 'ба'],), 'повтор буквы'),
      ((['', 'а', ''],), 'пустое слово'),
      (([],), 'пустой список'),
    ],
    brute='Сравнить каждое слово с первым словом каждой группы через sorted: O(n² · m log m).',
    form_hint='Слова одной группы нужно собрать вместе, и у всех них один признак — набор букв.',
    steps=[
      ('Ключ', '<code>key = \'\'.join(sorted(w))</code> — строка, её можно хешировать.'),
      ('Группа', 'При первом появлении ключа — пустой список, затем <code>append(w)</code>.'),
      ('Ответ', '<code>list(groups.values())</code> — группы в порядке появления.'),
    ],
    hand='<p>Впишите свои слова и переключите ключ.</p><div class="groupby" data-words=\'["ток", "дом", "кот", "мод"]\' data-title="Слова и их ключи"></div>',
    cx=('O(n · m log m) по времени, O(n · m) по памяти',
        ['O(n²) по времени, O(1) по памяти', 'O(n · m) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти'],
        'Каждое слово длины m сортируется один раз, запись в словарь — в среднем O(1). Словарь хранит все слова.'),
    start='''
def group_anagrams(words):
    groups = {}
    # Для каждого слова постройте ключ и добавьте слово в его группу.
    return list(groups.values())
''',
    tests=_tests('group_anagrams', [
      ((['ток', 'дом', 'кот', 'мод'],), [['ток', 'кот'], ['дом', 'мод']], 'example', 'две группы'),
      ((['кот', 'кот'],), [['кот', 'кот']], 'dup', 'повтор слова'),
      ((['аб', 'абб', 'ба'],), [['аб', 'ба'], ['абб']], 'letters', 'повтор буквы'),
      ((['', 'а', ''],), [['', ''], ['а']], 'empty_word', 'пустое слово'),
    ]),
    call="print(group_anagrams(['ток', 'дом', 'кот', 'мод']))",
    trace=('mock_group', ''),
    follow=('Интервьюер спрашивает: «Слова длиной по 10 000 букв. Что изменить?»',
      [('Ключ из частот букв: кортеж из 33 чисел строится за O(m), без множителя log m', True, 'Верно. По замеру главы 18.2 на длинных словах он быстрее в 2,4 раза.'),
       ('Ключ из set(w): он короче', False, 'Множество теряет повторы букв: «аб» и «абб» попадут в одну группу.'),
       ('Ничего: sorted на C работает за O(m)', False, 'Код на C уменьшает множитель, но сортировка остаётся O(m log m).')]),
  ),
  dict(
    id='top', fn='top_k_frequent', title='k самых частых чисел', lc='LeetCode 347', lc_url='https://leetcode.com/problems/top-k-frequent-elements/', chapter='18.3', form='sortfreq',
    heads=('nums, k', 'Ответ'), label='список nums',
    say='Дан список чисел и число k. Верните k самых частых чисел.',
    retell='«Нужно посчитать частоты и вернуть k чисел с наибольшими частотами».',
    ask=[
      ('В каком порядке вернуть числа?', 'По убыванию частоты.', 'Ответ упорядочен.', 'Сортировка по <code>-count[x]</code>.'),
      ('Что при равной частоте?', 'В порядке первого появления.', 'Устойчивый результат.', 'Ключи словаря и устойчивый <code>sorted</code>. Тест <code>[5, 5, 2, 2, 7], 1 → [5]</code>.'),
      ('Если разных чисел меньше k?', 'Вернуть все.', 'Срез, а не индексы.', '<code>order[:k]</code>. Тест <code>[4, 4, 1], 5</code>.'),
      ('Что вернуть — числа или частоты?', 'Числа.', 'Ответ восстанавливается.', 'Не <code>count[x]</code> и не пары <code>most_common</code>.'),
    ],
    examples=[
      (([1, 1, 1, 2, 2, 3], 2), 'пример LeetCode'),
      (([5, 5, 2, 2, 7], 1), 'равные частоты'),
      (([4, 4, 1], 5), 'k больше числа разных'),
      (([7, 7, 7, 0], 1), 'числа, а не частоты'),
      (([], 2), 'пустой список'),
    ],
    brute='Для каждого числа посчитать nums.count(x) и отсортировать: O(n²).',
    form_hint='Ответ — числа, упорядоченные по частоте.',
    steps=[
      ('Частоты', '<code>count[x] = count.get(x, 0) + 1</code>.'),
      ('Сортировка', '<code>sorted(count, key=lambda x: -count[x])</code> — d разных чисел.'),
      ('Ответ', '<code>order[:k]</code>.'),
    ],
    hand='<p>Впишите свои числа и k: схема разложит их по вёдрам частот.</p><div class="buckets" data-nums="[1, 1, 1, 2, 2, 3]" data-k="2" data-title="Частоты и вёдра"></div>',
    cx=('O(n + d log d) по времени, O(d) по памяти',
        ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(1) по памяти', 'O(k) по времени, O(k) по памяти'],
        'Подсчёт — один проход. Сортируются только d разных чисел. Словарь хранит d записей.'),
    start='''
def top_k_frequent(nums, k):
    count = {}
    # Посчитайте частоты, отсортируйте ключи по убыванию частоты.
    return []
''',
    tests=_tests('top_k_frequent', [
      (([1, 1, 1, 2, 2, 3], 2), [1, 2], 'example', 'пример LeetCode'),
      (([5, 5, 2, 2, 7], 1), [5], 'ties', 'равные частоты'),
      (([4, 4, 1], 5), [4, 1], 'k_larger', 'k больше числа разных'),
      (([7, 7, 7, 0], 1), [7], 'numbers', 'числа, а не частоты'),
    ]),
    call='print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))',
    trace=('mock_top', ''),
    follow=('Интервьюер спрашивает: «Можно ли быстрее, чем с сортировкой?»',
      [('Вёдра «частота → числа»: O(n), частота не больше n. В Python на практике быстрее Counter.most_common', True, 'Верно. Глава 18.3, §3–4: вёдра создают n + 1 списков, и постоянный множитель у них большой.'),
       ('Нет: без сортировки порядок по частоте не получить', False, 'Частоты — целые от 1 до n, поэтому числа раскладываются по вёдрам без сравнений.'),
       ('Да: множество вместо словаря', False, 'Множество не хранит частоты. Подсчёт без словаря невозможен.')]),
  ),
  dict(
    id='freq_sort', fn='frequency_sort', title='Символы по частоте', lc='LeetCode 451', lc_url='https://leetcode.com/problems/sort-characters-by-frequency/', chapter='тренажёр', form='sortfreq',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка. Переставьте символы так, чтобы они шли по убыванию частоты.',
    retell='«Нужно собрать строку, где самые частые символы идут первыми, одинаковые — подряд».',
    ask=[
      ('Различается ли регистр?', 'Да, \'A\' и \'a\' — разные символы.', 'Регистр различается.', 'Без casefold. Тест <code>\'Aab\'</code>.'),
      ('Что при равной частоте?', 'В порядке первого появления.', 'Устойчивый результат.', 'Тест <code>\'tree\' → \'eetr\'</code>: t раньше r.'),
      ('Что для пустой строки?', 'Пустая строка.', 'Пустой вход — \'\'.', 'Тест <code>\'\'</code>.'),
    ],
    examples=[
      (('tree',), 'пример LeetCode'),
      (('кабак',), 'кириллица'),
      (('Aab',), 'регистр'),
      (('абв',), 'все по одному разу'),
      (('',), 'пустая строка'),
    ],
    brute='Каждый раз искать самый частый оставшийся символ через count: O(n · d).',
    form_hint='Ответ — символы, упорядоченные по частоте.',
    steps=[
      ('Частоты', 'Частотный словарь символов.'),
      ('Сортировка', '<code>sorted(count, key=lambda ch: -count[ch])</code>.'),
      ('Сборка', '<code>\'\'.join(ch * count[ch] for ch in order)</code>.'),
    ],
    hand='',
    cx=('O(n + d log d) по времени, O(n) по памяти',
        ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(1) по памяти', 'O(d) по времени, O(d) по памяти'],
        'Подсчёт — один проход, сортировка d разных символов, сборка строки длины n.'),
    start='''
def frequency_sort(s):
    count = {}
    # Посчитайте частоты, отсортируйте символы и соберите строку.
    return s
''',
    tests=_tests('frequency_sort', [
      (('tree',), 'eetr', 'example', 'пример LeetCode'),
      (('кабак',), 'ккааб', 'cyrillic', 'кириллица'),
      (('Aab',), 'Aab', 'case', 'регистр'),
      (('ббба',), 'ббба', 'order', 'частый символ первым'),
      (('abaa',), 'aaab', 'regroup', 'символы собираются подряд'),
      (('abab',), 'aabb', 'ties_grouped', 'равные частоты — символы всё равно подряд'),
    ]),
    call="print(frequency_sort('tree'))",
    trace=('mock_freq_sort', ''),
    follow=('Интервьюер спрашивает: «Почему не sorted(s, key=lambda ch: -count[ch])?»',
      [('При равных частотах разных символов они не соберутся подряд: \'abab\' останется \'abab\', а нужно \'aabb\'', True, 'Верно. У a и b один ключ −2, и устойчивая сортировка оставляет их в порядке входа. Сортировка ключей словаря и сборка ch * count[ch] этой ошибки не имеют.'),
       ('Так верно, только медленнее: сортируются n символов, а не d', False, 'Не только медленнее: на \'abab\' ответ неверный, одинаковые символы не идут подряд.'),
       ('Так нельзя: sorted не работает со строками', False, 'sorted принимает строку и возвращает список символов. Ошибка в другом — при равных частотах.')]),
  ),
  dict(
    id='kth', fn='kth_distinct', title='k-я уникальная строка', lc='LeetCode 2053', lc_url='https://leetcode.com/problems/kth-distinct-string-in-an-array/', chapter='тренажёр', form='count',
    heads=('arr, k', 'Ответ'), label='список arr',
    say='Дан список строк и число k. Верните k-ю по порядку строку, которая встречается в списке ровно один раз.',
    retell='«Нужно пройти список по порядку и отсчитать k-ю строку с частотой 1».',
    ask=[
      ('Если таких строк меньше k?', 'Пустая строка.', 'Нет ответа — \'\'.', '<code>return \'\'</code> после цикла.'),
      ('Порядок — по первому появлению?', 'Да, по порядку в списке.', 'Отсчёт идёт по входу.', 'Второй проход по <code>arr</code>, не по словарю.'),
      ('Различается ли регистр?', 'Да.', 'Строки сравниваются как есть.', 'Тест <code>[\'a\', \'A\']</code>.'),
    ],
    examples=[
      ((['d', 'b', 'c', 'b', 'c', 'a'], 2), 'пример LeetCode'),
      ((['aaa', 'aa', 'a'], 1), 'все уникальные'),
      ((['a', 'b', 'a'], 3), 'уникальных меньше k'),
      ((['a', 'A'], 2), 'регистр'),
      (([], 1), 'пустой список'),
    ],
    brute='Для каждой строки вызывать arr.count(s): O(n²).',
    form_hint='Ответ зависит и от частоты, и от позиции строки в списке.',
    steps=[
      ('Частоты', 'Первый проход: <code>count[s] = count.get(s, 0) + 1</code>.'),
      ('Отсчёт', 'Второй проход по <code>arr</code>: строка с частотой 1 уменьшает k.'),
      ('Ответ', 'k стало 0 — вернуть строку; проход закончился — <code>\'\'</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Два прохода по списку, каждая проверка частоты в среднем O(1). Словарь хранит d разных строк.',),
    start='''
def kth_distinct(arr, k):
    count = {}
    # Посчитайте частоты, затем отсчитайте k-ю строку с частотой 1.
    return ''
''',
    tests=_tests('kth_distinct', [
      ((['d', 'b', 'c', 'b', 'c', 'a'], 2), 'a', 'example', 'пример LeetCode'),
      ((['aaa', 'aa', 'a'], 1), 'aaa', 'first', 'все уникальные'),
      ((['a', 'b', 'a'], 3), '', 'few', 'уникальных меньше k'),
      ((['a', 'A'], 2), 'A', 'case', 'регистр'),
    ]),
    call="print(kth_distinct(['d', 'b', 'c', 'b', 'c', 'a'], 2))",
    trace=('mock_kth', ''),
    follow=('Интервьюер спрашивает: «Почему второй проход идёт по arr, а не по count?»',
      [('Порядок ответа — порядок в списке; у ключей словаря порядок первого появления, и здесь он совпадает, но arr показывает это явно', True, 'Верно. По count тоже можно — ключи идут в порядке первого появления. Важно не идти по множеству: его порядок — порядок ячеек.'),
       ('По count нельзя: словарь не хранит порядок', False, 'С Python 3.7 словарь хранит порядок вставки, глава 0.6.'),
       ('Так быстрее асимптотически', False, 'Оба прохода O(n) или O(d). Разница — в понятности кода, а не в оценке.')]),
  ),
  dict(
    id='kdiff', fn='count_k_difference', title='Пары с разностью k', lc='LeetCode 2006', lc_url='https://leetcode.com/problems/count-number-of-pairs-with-absolute-difference-k/', chapter='тренажёр', form='pairs',
    heads=('nums, k', 'Ответ'), label='список nums',
    say='Дан список чисел и число k. Посчитайте пары i < j, у которых |nums[i] − nums[j]| = k.',
    retell='«Нужно число пар индексов с разностью значений, равной k по модулю».',
    ask=[
      ('Может ли k быть нулём?', 'Нет, k ≥ 1.', 'k ≥ 1.', 'x − k и x + k — разные числа, пара не считается дважды.'),
      ('Одинаковые числа дают разные пары?', 'Да, пары — по индексам.', 'Считаются индексы.', 'Словарь хранит частоту, а не факт «было».'),
      ('Что вернуть, если пар нет?', '0.', 'Без пар — 0.', 'Тест <code>[1, 3], 3</code>.'),
    ],
    examples=[
      (([1, 2, 2, 1], 1), 'пример LeetCode'),
      (([1, 3], 3), 'пар нет'),
      (([3, 2, 1, 5, 4], 2), 'три пары'),
      (([5, 5, 5], 1), 'одинаковые числа'),
      (([], 1), 'пустой список'),
    ],
    brute='Перебрать все пары i < j: O(n²).',
    form_hint='Для каждого числа нужно знать, сколько подходящих чисел уже встретилось левее.',
    steps=[
      ('Структура', '<code>seen</code> — частоты чисел левее текущего.'),
      ('Счёт', '<code>pairs += seen.get(x - k, 0) + seen.get(x + k, 0)</code>.'),
      ('Запись', 'После счёта — <code>seen[x] += 1</code>, как в two_sum из модуля 17.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждое число обрабатывается один раз: два чтения и одна запись в словарь, в среднем O(1).',),
    start='''
def count_k_difference(nums, k):
    seen = {}
    pairs = 0
    # Для x прибавьте, сколько раз левее встречались x - k и x + k.
    return pairs
''',
    tests=_tests('count_k_difference', [
      (([1, 2, 2, 1], 1), 4, 'example', 'пример LeetCode'),
      (([1, 3], 3), 0, 'none', 'пар нет'),
      (([3, 2, 1, 5, 4], 2), 3, 'three', 'три пары'),
      (([5, 5, 5], 1), 0, 'equal', 'одинаковые числа'),
    ]),
    call='print(count_k_difference([1, 2, 2, 1], 1))',
    trace=('mock_kdiff', ''),
    follow=('Интервьюер спрашивает: «Почему seen обновляется после счёта, а не до?»',
      [('Иначе при k = 0 число нашло бы само себя; в общем случае порядок держит правило «только левее», как в two_sum', True, 'Верно. Структура хранит пройденную часть, текущий элемент добавляется после проверки. Глава 17.3, §4.'),
       ('Порядок не важен: при k ≥ 1 ответ тот же', False, 'При k ≥ 1 ответ действительно тот же, но правило «добавлять после» защищает от ошибки при k = 0 и в других задачах этого вида.'),
       ('Обновление до счёта быстрее', False, 'Обе версии делают одни и те же операции.')]),
  ),
  dict(
    id='smaller', fn='smaller_than_current', title='Сколько чисел меньше текущего', lc='LeetCode 1365', lc_url='https://leetcode.com/problems/how-many-numbers-are-smaller-than-the-current-number/', chapter='тренажёр', form='prefix',
    heads=('nums', 'Ответ'), label='список nums',
    say='Дан список чисел от 0 до 100. Для каждого числа верните, сколько чисел списка строго меньше него.',
    retell='«Нужен список той же длины: на месте i — количество чисел меньше nums[i]».',
    ask=[
      ('Какие значения бывают?', 'Целые от 0 до 100.', 'Значения малы и неотрицательны.', 'Частоты можно хранить в списке, индекс — само значение.'),
      ('Равные числа считаются?', 'Нет, строго меньше.', 'Сравнение строгое.', 'Префиксная сумма до v − 1. Тест <code>[7, 7, 7]</code>.'),
      ('Порядок ответа?', 'Как во входе.', 'Ответ по позициям входа.', 'Последний проход — по <code>nums</code>.'),
    ],
    examples=[
      (([8, 1, 2, 2, 3],), 'пример LeetCode'),
      (([6, 5, 4, 8],), 'все разные'),
      (([7, 7, 7],), 'все равные'),
      (([0],), 'один ноль'),
      (([],), 'пустой список'),
    ],
    brute='Для каждого числа пройти весь список и посчитать меньшие: O(n²).',
    form_hint='Значения — небольшие целые, и для каждого нужно знать, сколько значений меньше.',
    steps=[
      ('Частоты', '<code>count[x] += 1</code> — список длины <code>max(nums) + 1</code>.'),
      ('Префиксы', '<code>less[v] = less[v - 1] + count[v - 1]</code>.'),
      ('Ответ', '<code>[less[x] for x in nums]</code>.'),
    ],
    hand='',
    cx=('O(n + V) по времени, O(V) по памяти, V — наибольшее значение',
        ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(V) по времени, O(1) по памяти'],
        'Подсчёт и ответ — по одному проходу по n числам, префиксные суммы — проход по V + 1 значениям.'),
    start='''
def smaller_than_current(nums):
    # Посчитайте частоты значений, затем префиксные суммы.
    return [0] * len(nums)
''',
    tests=_tests('smaller_than_current', [
      (([8, 1, 2, 2, 3],), [4, 0, 1, 1, 3], 'example', 'пример LeetCode'),
      (([6, 5, 4, 8],), [2, 1, 0, 3], 'distinct', 'все разные'),
      (([7, 7, 7],), [0, 0, 0], 'equal', 'все равные'),
      (([0, 100],), [0, 1], 'bounds', 'крайние значения'),
    ]),
    call='print(smaller_than_current([8, 1, 2, 2, 3]))',
    trace=('mock_smaller', ''),
    follow=('Интервьюер спрашивает: «Если значения — до 10⁹?»',
      [('Список длины 10⁹ не подходит: сортировать копию и для каждого числа брать индекс первого вхождения, O(n log n)', True, 'Верно. Частоты по значениям годятся, только когда значений мало. Иначе — сортировка и словарь «значение → первый индекс».'),
       ('Ничего не менять: O(n + V) — всё равно линейно', False, 'При V = 10⁹ это миллиард шагов и гигабайты памяти на список.'),
       ('Взять множество вместо списка частот', False, 'Множество не хранит частоты и порядок значений, префиксные суммы по нему не построить.')]),
  ),
  dict(
    id='rearrange', fn='rearrange_characters', title='Сколько копий слова собрать', lc='LeetCode 2287', lc_url='https://leetcode.com/problems/rearrange-characters-to-make-target-string/', chapter='тренажёр', form='ratio',
    heads=('s, target', 'Ответ'), label='строка s',
    say='Даны строки s и target. Сколько копий target можно собрать из букв s, если каждую букву s брать не больше одного раза?',
    retell='«Нужно наибольшее число копий target, на которое хватит букв s».',
    ask=[
      ('Порядок букв важен?', 'Нет, буквы можно переставлять.', 'Важны только частоты.', 'Две частотные таблицы.'),
      ('Если в target повторяется буква?', 'Её нужно столько, сколько в target.', 'Учитывать частоты target.', 'Деление <code>have // need</code>. Тест <code>\'aab\'</code>.'),
      ('Если буквы нет в s?', 'Ответ 0.', 'Нехватка буквы — 0.', '<code>have.get(ch, 0)</code>.'),
    ],
    examples=[
      (('ilovecodingonleetcode', 'code'), 'пример LeetCode'),
      (('abcba', 'abc'), 'одна копия'),
      (('aaab', 'aab'), 'повтор в target'),
      (('abc', 'd'), 'буквы нет'),
      (('кококо', 'ок'), 'кириллица'),
    ],
    brute='Пока получается, вычеркивать из s буквы очередной копии target: O(n · m).',
    form_hint='Из одного набора букв собирают другой, порядок не важен.',
    steps=[
      ('Частоты', 'Словари <code>have</code> для s и <code>need</code> для target.'),
      ('Отношение', 'Для каждой буквы target — <code>have.get(ch, 0) // c</code>.'),
      ('Ответ', 'Наименьшее из отношений.'),
    ],
    hand='',
    cx=('O(n + m) по времени, O(d) по памяти',
        ['O(n · m) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(m) по времени, O(1) по памяти'],
        'По одному проходу по s и target, затем проход по разным буквам target.'),
    start='''
def rearrange_characters(s, target):
    # Посчитайте частоты обеих строк и найдите наименьшее отношение.
    return 0
''',
    tests=_tests('rearrange_characters', [
      (('ilovecodingonleetcode', 'code'), 2, 'example', 'пример LeetCode'),
      (('abcba', 'abc'), 1, 'one', 'одна копия'),
      (('aaab', 'aab'), 1, 'repeat', 'повтор в target'),
      (('кококо', 'ок'), 3, 'cyrillic', 'кириллица'),
    ]),
    call="print(rearrange_characters('ilovecodingonleetcode', 'code'))",
    trace=('mock_rearrange', ''),
    follow=('Интервьюер спрашивает: «Почему деление нацело, а не просто сравнение have ≥ need?»',
      [('Сравнение отвечает «хватит ли на одну копию», а нужно число копий: сколько раз need помещается в have', True, 'Верно. Для каждой буквы число копий — have // need, ответ ограничен самой дефицитной буквой.'),
       ('Деление быстрее сравнения', False, 'Скорость одинаковая, разница в ответе: нужно число копий.'),
       ('Деление нужно, чтобы учесть порядок букв', False, 'Порядок здесь не важен, важны только частоты.')]),
  ),
  dict(
    id='domain', fn='group_by_domain', title='Почта по доменам', lc='задача модуля', lc_url='', chapter='тренажёр', form='group',
    heads=('emails', 'Ответ'), label='список emails',
    say='Дан список адресов почты. Сгруппируйте адреса по домену — части после @.',
    retell='«Нужен словарь: домен → адреса с этим доменом».',
    ask=[
      ('Регистр домена важен?', 'Нет, Mail.ru и mail.ru — один домен.', 'Домен — casefold.', 'Ключ <code>casefold</code>, адрес в группе — как во входе.'),
      ('Бывают ли пробелы по краям?', 'Да, их убрать.', 'Адрес — strip.', 'Тест <code>\' ivan@Mail.ru\'</code>.'),
      ('Что делать со строкой без @?', 'Пропустить.', 'Строки без @ не входят в ответ.', '<code>if \'@\' not in e: continue</code>.'),
      ('В каком порядке домены?', 'В порядке первого появления.', 'Результат устойчив.', 'Словарь хранит порядок вставки.'),
    ],
    examples=[
      (([' ivan@Mail.ru', 'olga@yandex.ru', 'petr@mail.RU', 'bad-address'],), 'регистр, пробел и мусор'),
      ((['a@x', 'b@y', 'c@x'],), 'порядок доменов'),
      ((['nobody'],), 'адресов нет'),
      ((['a@b@c.ru'],), 'две @'),
      (([],), 'пустой список'),
    ],
    brute='Для каждого адреса искать его домен среди уже собранных групп перебором: O(n · d).',
    form_hint='Адреса с одним признаком — доменом — нужно собрать вместе.',
    steps=[
      ('Очистка', '<code>e = e.strip()</code>; без <code>@</code> — пропустить.'),
      ('Ключ', '<code>domain = e.rpartition(\'@\')[2].casefold()</code>.'),
      ('Группа', 'При первом появлении домена — пустой список, затем <code>append(e)</code>.'),
    ],
    hand='',
    cx=('O(L) по времени в среднем, O(L) по памяти, L — общая длина адресов',
        ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(1) по памяти'],
        'Каждый адрес очищается и разбирается один раз, запись в словарь — в среднем O(1). Словарь хранит все адреса.'),
    start='''
def group_by_domain(emails):
    groups = {}
    # Очистите адрес, выделите домен и добавьте адрес в группу домена.
    return groups
''',
    tests=_tests('group_by_domain', [
      (([' ivan@Mail.ru', 'olga@yandex.ru', 'petr@mail.RU', 'bad-address'],), {'mail.ru': ['ivan@Mail.ru', 'petr@mail.RU'], 'yandex.ru': ['olga@yandex.ru']}, 'example', 'регистр, пробел и мусор'),
      ((['a@x', 'b@y', 'c@x'],), {'x': ['a@x', 'c@x'], 'y': ['b@y']}, 'order', 'порядок доменов'),
      ((['nobody'],), {}, 'no_at', 'адресов нет'),
      ((['a@b@c.ru'],), {'c.ru': ['a@b@c.ru']}, 'two_at', 'две @'),
    ]),
    call="print(group_by_domain([' ivan@Mail.ru', 'olga@yandex.ru', 'petr@mail.RU', 'bad-address']))",
    trace=('mock_domain', ''),
    follow=('Интервьюер спрашивает: «Почему rpartition, а не split(\'@\')[1]?»',
      [('В адресе может быть несколько @; домен — часть после последнего, и rpartition берёт её', True, 'Верно. Для \'a@b@c.ru\' split(\'@\')[1] даёт \'b\', а домен — \'c.ru\'.'),
       ('split медленнее', False, 'Оба метода проходят строку за O(длины). Разница в ответе на адресе с двумя @.'),
       ('split не работает с кириллицей', False, 'split работает с любыми строками. Ошибка — в выборе части при двух @.')]),
  ),
]


def chap(t):
    """Подпись главы: «глава 11.2» или текст, если задача разобрана только в тренажёре."""
    return f'глава {t["chapter"]}' if t['chapter'][0].isdigit() else t['chapter']


STAGES = [
    ('Условие', 2), ('Уточнения', 3), ('Примеры', 3), ('Перебор и идея', 7),
    ('Сложность', 1), ('Код', 5), ('Проверка', 4),
]


# ── Подсветка Python в стиле глав ─────────────────────────────────────
KW = {'def', 'for', 'in', 'while', 'if', 'elif', 'else', 'return', 'and', 'or', 'not', 'del', 'None', 'True', 'False',
      'len', 'range', 'sorted', 'max', 'min', 'list', 'lambda', 'str', 'is', 'sum', 'abs', 'import', 'set', 'enumerate'}


def hl(src):
    out = []
    for m in re.finditer(r'(#.*)|("[^"]*"|\'[^\']*\')|(\b\d+\b)|([A-Za-z_]\w*)|(\s+|.)', src):
        c, s, n, w, o = m.groups()
        if c: out.append(f'<span class="c">{E(c)}</span>')
        elif s: out.append(f'<span class="s">{E(s)}</span>')
        elif n: out.append(f'<span class="n">{n}</span>')
        elif w:
            prev = ''.join(out[-2:])
            if w in KW: out.append(f'<span class="k">{w}</span>')
            elif prev.endswith('<span class="k">def</span> '): out.append(f'<span class="f">{w}</span>')
            else: out.append(w)
        else: out.append(E(o))
    return ''.join(out)


def show(v, as_str=False):
    if as_str and isinstance(v, list):
        return E(repr(''.join(v)))
    return E(repr(v))


# ── Проверка запуском ─────────────────────────────────────────────────
def load(src, name):
    ns = {}
    exec(textwrap.dedent(src), ns)
    return ns[name]


def run_tests(user_src, tests):
    ns = {}
    exec(textwrap.dedent(user_src), ns)
    exec(textwrap.dedent(tests), ns)
    res = {}
    for k, f in list(ns.items()):
        if k.startswith('test_') and callable(f):
            try:
                f(); res[k] = True
            except Exception:
                res[k] = False
    return res


def answers(t):
    import copy
    f = load(REF[t['fn']], t['fn'])
    rows = []
    for args, what in t['examples']:
        a = copy.deepcopy(list(args))
        r = f(*a)
        rows.append((args, r, a[0], what))
    return rows


def verify(traces):
    for t in TASKS:
        ok = run_tests(REF[t['fn']], t['tests'])
        assert ok and all(ok.values()), (t['id'], 'эталон не проходит тесты', ok)
        st = run_tests(t['start'], t['tests'])
        assert not all(st.values()), (t['id'], 'заготовка проходит все тесты')
        key = t['trace'][0]
        assert key in traces, (t['id'], key)
        args = t['examples'][0][0]
        call = f"{t['fn']}({', '.join(repr(a) for a in args)})"
        assert traces[key]['call'] == call, (t['id'], traces[key]['call'], call)
        ans = sum(1 for o in t['follow'][1] if o[1])
        assert ans == 1, t['id']
        print(f"{t['id']:8} эталон {sum(ok.values())}/{len(ok)}, заготовка {sum(st.values())}/{len(st)}, прогон {key}")


# ── Разметка ──────────────────────────────────────────────────────────
def quiz(q, opts, label):
    lis = ''.join(f'<li{" data-ok" if ok else ""}><button>{txt}</button><p class="quiz__why">{why}</p></li>' for txt, ok, why in opts)
    return f'<div class="quiz"><p class="quiz__q"><b>{label}</b>{q}</p><ul class="quiz__opts">{lis}</ul></div>'


def rotate(opts, k):
    k %= len(opts)
    return opts[k:] + opts[:k]


def task_html(n, t):
    tid = t['id']
    rows = answers(t)
    as_str = t.get('as_str')
    # Этап 1. Условие
    s1 = f'''<p class="mock__lead">Интервьюер формулирует задачу. Перескажите её своими словами: что на входе, что вернуть, что нельзя делать. Пересказ — проверка, что условие понято одинаково.</p>
            <div class="pull-quote"><p>«{t["say"]}»</p></div>
            <details class="mock__answer"><summary>Пересказ кандидата</summary><div><p>{t["retell"]}</p></div></details>'''
    # Этап 2. Уточнения
    btns = ''.join(f'<button data-answer="{E(a)}" data-fact="{E(f)}" data-code="{E(c)}">{q}</button>' for q, a, f, c in t['ask'])
    s2 = f'''<p class="mock__lead">До кода выясняют то, чего в условии нет. Задайте вопросы по одному: справа появится ответ интервьюера и то, что он меняет в решении, слева — уточнённое условие.</p>
            <div class="widget ask">
              <div class="widget__head"><b>{E(t["title"])}</b><span class="ask__count"></span></div>
              <div class="ask__layout">
                <div class="ask__task"><span class="tracer__label">условие от интервьюера</span><p>«{t["say"]}»</p><span class="tracer__label">уточнено</span><ul class="ask__facts"></ul></div>
                <div class="ask__side"><div class="ask__qs">{btns}</div><div class="ask__log" aria-live="polite"></div></div>
              </div>
            </div>'''
    # Этап 3. Примеры
    hin, hout = t.get('heads', ('вход', 'Ответ'))
    trs = ''
    for args, r, after, what in rows:
        inp = ', '.join(show(a, as_str) for a in args)
        if t.get('list_only'): out = show(after)
        elif t.get('show_list') or tid == 'split': out = f'{show(r)} · {show(after)}'
        else: out = show(r)
        trs += f'<tr><td><code>{inp}</code></td><td class="mock-ex__ans"><code>{out}</code></td><td>{what}</td></tr>'
    if t.get('list_only'): hout = 'Список после вызова'
    s3 = f'''<p class="mock__lead">Запишите пять входов и ответы к ним, среди них — крайние случаи из уточнений. Ответы скрыты: сначала посчитайте сами, потом откройте и сравните. Ответы получены запуском эталонного решения.</p>
            <div class="mock-ex"><div class="table-scroll"><table>
              <thead><tr><th>{hin}</th><th>{hout}</th><th>Что проверяет</th></tr></thead><tbody>{trs}</tbody></table></div>
              <button class="btn mock-ex__show" type="button">Показать ответы</button></div>'''
    # Этап 4. Перебор и идея
    forms = list(FORMS)
    fopts = []
    for f in forms:
        if f == t['form']:
            fopts.append((FORMS[f], True, f'Верно. {t["form_hint"]} {FORM_WHY[f]}'))
        else:
            fopts.append((FORMS[f], False, FORM_WHY[f]))
    fopts = rotate(fopts, n)
    steps = ''.join(f'<li><b>{a}.</b> {b}</li>' for a, b in t['steps'])
    hand = t['hand']
    s4 = f'''<p class="mock__lead">Сначала называют медленное решение, которое точно верное, и его сложность. Потом ищут быстрое: выбирают форму техники и формулируют правило шага.</p>
            <details class="mock__answer"><summary>Перебор, который называет кандидат</summary><div><p>{t["brute"]}</p></div></details>
            {quiz("Какая техника подходит?", fopts, "Техника")}
            <details class="mock__answer"><summary>Правило шага</summary><div><ol class="steps">{steps}</ol></div></details>
            {hand}'''
    # Этап 5. Сложность
    good, bad, why = t['cx']
    copts = [(good, True, f'Верно. {why}')] + [(b, False, why) for b in bad]
    copts = rotate(copts, n + 1)
    s5 = f'''<p class="mock__lead">Сложность называют до кода: интервьюер соглашается с решением раньше, чем на запись потрачено время.</p>
            {quiz("Сколько стоит быстрое решение?", copts, "Сложность")}'''
    # Этап 6. Код
    s6 = f'''<p class="mock__lead">Напишите функцию в окне ниже. «Запустить тесты» проверяет её на входах из этапа «Примеры»; часть из них заготовка проходит сразу. Первый запуск загружает Python в браузер, около 10 МБ.</p>
            <div class="sandbox" id="mock-{tid}" data-title="{E(t["fn"])}" data-call="{E(t["call"])}">
<script type="text/plain" class="sandbox__start">{textwrap.dedent(t["start"])}</script>
<script type="text/plain" class="sandbox__tests">{textwrap.dedent(t["tests"])}</script>
</div>
            <details class="mock__answer"><summary>Код эталонного решения</summary><div><figure class="code"><figcaption><span>{E(t["fn"])}</span><span>{chap(t)}</span></figcaption><pre>{hl(textwrap.dedent(REF[t["fn"]]).strip())}</pre></figure></div></details>'''
    # Этап 7. Проверка
    key, zone = t['trace']
    fq, fopts2 = t['follow']
    s7 = f'''<p class="mock__lead">Код проходят по шагам на первом примере. На секции это делают руками; ниже тот же проход — пошаговым прогоном эталонного решения. Затем интервьюер задаёт вопрос по решению.</p>
            <div class="tracer" data-trace="{key}" data-zone="{zone}" data-label="{E(t["label"])}" data-title="{E(t["title"])}"></div>
            {quiz(fq, rotate(fopts2, n), "Вопрос интервьюера")}'''
    stages = [s1, s2, s3, s4, s5, s6, s7]
    body = ''.join(f'\n          <section class="mock__stage" data-title="{name}" data-min="{m}">\n            {html_}\n          </section>'
                   for (name, m), html_ in zip(STAGES, stages))
    lc = f'<a href="{t["lc_url"]}" target="_blank" rel="noopener">{t["lc"]}</a>' if t['lc_url'] else t['lc']
    return f'''
        <div class="mock" id="task-{tid}" data-name="{E(t["title"])}">
          <div class="mock__head"><b>Задача {n + 1} · {E(t["title"])}</b><span>{lc} · {chap(t)}</span></div>{body}
        </div>'''


def board():
    cards = ''
    for n, t in enumerate(TASKS):
        cards += f'<button type="button" data-mock="task-{t["id"]}"><i>{n + 1}</i><b>{E(t["title"])}</b><small>{t["lc"]} · {chap(t)}</small></button>'
    return f'<div class="mock-board">{cards}<button type="button" class="mock-board__random" data-mock="random"><i>?</i><b>Случайная задача</b><small>как на секции: задачу выбирает интервьюер</small></button></div>'


def map_table():
    rows = ''
    for n, t in enumerate(TASKS):
        rows += f'<tr><td>{n + 1}</td><td>{E(t["title"])}</td><td>{t["lc"]}</td><td>{t["chapter"] if t["chapter"][0].isdigit() else "—"}</td></tr>'
    return rows



PAGE = '''<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#F1F2EC">
  <title>18.6 Мок-интервью по задачам модуля · Хеш-структуры</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400&family=Pixelify+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../massivy/styles.css">
  <link rel="stylesheet" href="../../massivy/algo.css">
  <link rel="stylesheet" href="../hesh.css">
</head>
<body>
  <!-- Страница собрана скриптом make_mock.py: править описания задач там. -->
  <div class="book">
    <div class="book__body">
      <div class="spine"><span>Модуль 18 · Счётчики и группировка · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Хеш-структуры</a> · модуль 18 · счётчики и группировка</p>
          <p class="running__folio">Глава 18.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">18.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на счётчики и группировку в формате алгоритмической секции. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 13.6–15.6 книги о строках и в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модуль 17 и главы 18.1–18.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Выбирать ключ группировки и способ восстановить ответ в темпе собеседования</dd></div>
        </dl>

        <nav class="contents">
          <b>В этой главе</b>
          <ol>
            <li><a href="#s1">Как устроен тренажёр</a></li>
            <li><a href="#s2">Задачи тренажёра</a></li>
            <li><a href="#s3">Тренажёр</a></li>
            <li><a href="#s4">Как оценить свою попытку</a></li>
          </ol>
        </nav>

        <h2 id="s1"><span class="sec">§1</span>Как устроен тренажёр</h2>
        <p>Задача разбита на семь этапов шаблона interview canvas. Сначала открыт только первый; кнопка «Этап пройден» открывает следующий и записывает, сколько минут ушло на этап. Над этапами — полоса с планом: сколько минут отводится на каждый этап, чтобы уложиться в 25.</p>
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из шести: словарь групп по ключу, частотный словарь с повторным проходом по входу, частоты с сортировкой, частоты пройденной части для подсчёта пар, частоты по значениям с префиксными суммами и две частотные таблицы с делением. Все шесть — формы частотного словаря, и различаются они тем, как из частот восстанавливается ответ. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 1394, 1636, 2085 — и задача домашнего задания LeetCode 692. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Задачи 49 и 347 разобраны в главах 18.2 и 18.3, остальные шесть — только здесь. Задача 451 — расширение стартового набора <code>lesson_18</code>: если вы её уже решили, начните с других. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
        <div class="table-scroll">
          <table>
            <thead><tr><th>№</th><th>Задача</th><th>Источник</th><th>Глава</th></tr></thead>
            <tbody>MAP</tbody>
          </table>
        </div>

        <h2 id="s3"><span class="sec">§3</span>Тренажёр</h2>
        <p>Выберите задачу на карточке или нажмите «Случайная задача». Пройденные этапы и секундомер сбрасываются при перезагрузке страницы. Код в песочнице браузер запоминает, и после перезагрузки он остаётся.</p>
        <div class="mockset">
          BOARD
TASKS
        </div>

        <h2 id="s4"><span class="sec">§4</span>Как оценить свою попытку</h2>
        <p>После задачи пройдитесь по списку. Каждый пункт соответствует тому, что интервьюер отмечает на секции.</p>
        <div class="checklist">
          <p class="checklist__head">Задача решена, если</p>
          <div class="checklist__item"><span><b>Условие пересказано до вопросов</b>В пересказе названы вход, что считается равным и что вернуть.</span></div>
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Что при равных частотах, сохраняются ли повторы, в каком порядке вернуть группы, различается ли регистр, что вернуть, если ответа нет.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустой вход и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названы ключ словаря, как из частот восстанавливается ответ и от чего зависят время и память.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 18.5 Практика и ДЗ</a><a href="../index.html">К оглавлению книги →</a></div>
        <div class="colophon">
          <span>Модуль 18 · Счётчики и группировка · ОП.04 · 3 курс</span>
          <span class="author-line">Автор: Макаров Максим Николаевич</span>
        </div>
      </main>
    </div>
  </div>
  <script src="traces.js"></script>
  <script src="../../massivy/book.js"></script>
  <script src="../../massivy/algo.js"></script>
  <script src="../hesh.js"></script>
</body>
</html>
'''

if __name__ == '__main__':
    src = open('traces.js', encoding='utf-8').read()
    traces = json.loads(src[src.index('window.TRACES = ') + 16:src.rstrip().rindex(';')])
    verify(traces)
    page = PAGE.replace('MAP', map_table()).replace('BOARD', board()).replace('TASKS', ''.join(task_html(n, t) for n, t in enumerate(TASKS)))
    out = sys.argv[1] if len(sys.argv) > 1 else '06-mok-intervyu.html'
    open(out, 'w', encoding='utf-8').write(page)
    print('записано', out)

