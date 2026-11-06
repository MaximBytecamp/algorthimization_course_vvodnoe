"""Собирает главу 17.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../../stroki/14-palindromy/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m17traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m17 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m17)

REF = {k: _m17.SOURCES[k] for k in ('has_duplicate', 'two_sum', 'duplicate_clients', 'contains_nearby_duplicate',
                                    'repeated_character', 'num_jewels_in_stones', 'sum_of_unique', 'two_sum_sorted')}

FORMS = {
    'seen': 'Множество уже встреченных: проверка, затем добавление',
    'index': 'Словарь «значение → индекс» по пройденной части',
    'group': 'Словарь групп по построенному ключу',
    'lookup': 'Множество, построенное заранее из одного входа',
    'count': 'Частотный словарь, затем проход по нему',
    'pointers': 'Два указателя навстречу по отсортированному списку',
}

FORM_WHY = {
    'seen': 'Множество уже встреченных берут, когда о каждом элементе нужно знать одно: был ли он левее. Проверка идёт до добавления, ответ находится на первом повторе.',
    'index': 'Словарь «значение → индекс» берут, когда вместе с ответом «было ли» нужен индекс: пара с суммой, расстояние между повторами.',
    'group': 'Словарь групп берут, когда ключ строится из записи и под одним ключом собираются несколько элементов: нормализованная почта, отсортированные буквы.',
    'lookup': 'Множество, построенное заранее, берут, когда один вход задаёт допустимые значения. Второй вход проверяется по нему, каждый поиск в среднем O(1).',
    'count': 'Частотный словарь берут, когда ответ зависит от того, сколько раз встречается значение, а не от того, где оно стоит.',
    'pointers': 'Два указателя берут, когда список уже отсортирован. Сдвиг левого указателя увеличивает сумму пары, сдвиг правого — уменьшает, память O(1).',
}

CX_HASH = ('O(n) по времени в среднем, O(n) по памяти',
           ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(1) по памяти', 'O(n) по времени, O(1) по памяти'])


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
    id='dup', fn='has_duplicate', title='Есть ли повтор', lc='LeetCode 217', lc_url='https://leetcode.com/problems/contains-duplicate/', chapter='17.2', form='seen',
    heads=('items', 'Ответ'), label='список items',
    say='Дан список. Верните True, если какое-то значение встречается в нём хотя бы дважды.',
    retell='«Нужно ответить, есть ли в списке два равных элемента на разных позициях».',
    ask=[
      ('Какие элементы бывают?', 'Числа и строки, все хешируемые.', 'Элементы хешируемые.', 'Можно хранить их во множестве.'),
      ('Что вернуть для пустого списка?', 'False.', 'Пустой список и один элемент — False.', 'Тесты <code>[]</code> и <code>[5]</code>.'),
      ('Список длинный, повтор может быть в начале?', 'Да, до 10⁶ элементов.', 'Нужна остановка на первом повторе.', 'Цикл со множеством, а не <code>len(set(items))</code>.'),
      ('Можно ли менять список, например сортировать?', 'Нет.', 'Вход не меняется.', 'Сортировка на месте не подходит, копия стоит O(n) памяти и O(n log n).'),
    ],
    examples=[
      (([1, 2, 3, 1],), 'повтор в конце'),
      (([1, 2, 3, 4],), 'повторов нет'),
      (([],), 'пустой список'),
      (([1, 2],), 'два разных элемента'),
      ((['a', 'b', 'a'],), 'строки'),
    ],
    brute='Сравнить каждую пару элементов: n(n − 1)/2 сравнений, O(n²).',
    form_hint='Для каждого элемента важно только, встречался ли он левее.',
    steps=[
      ('Структура', '<code>seen = set()</code> — элементы левее текущего.'),
      ('Проверка', 'Если <code>x in seen</code> — <code>return True</code>.'),
      ('Добавление', 'Иначе <code>seen.add(x)</code>; после цикла <code>return False</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждый элемент проверяется и добавляется один раз, в среднем за O(1). Без повторов во множество попадают все n элементов.',),
    start='''
def has_duplicate(items):
    seen = set()
    # Проверьте x по seen, затем добавьте его.
    return False
''',
    tests=_tests('has_duplicate', [
      (([1, 2, 3, 1],), True, 'example', 'повтор в конце'),
      (([1, 2, 3, 4],), False, 'unique', 'повторов нет'),
      (([],), False, 'empty', 'пустой список'),
      (([1, 2],), False, 'two', 'два разных элемента'),
      ((['a', 'b', 'a'],), True, 'strings', 'строки'),
    ]),
    call='print(has_duplicate([1, 2, 3, 1]))',
    trace=('mock_dup', ''),
    follow=('Интервьюер спрашивает: «Почему не написать return len(set(items)) != len(items)?»',
      [('Ответ тот же, но множество строится из всего списка, даже если повтор второй по счёту: нет раннего выхода', True, 'Верно. На списке из 10⁶ чисел с повтором в начале цикл отвечает за микросекунды, а len(set(...)) — за миллисекунды. Глава 17.2, §3.'),
       ('Так нельзя: len(set(...)) даёт неверный ответ на строках', False, 'Ответ верный на любых хешируемых элементах. Разница в скорости при раннем повторе.'),
       ('Так нельзя: set меняет порядок элементов списка', False, 'Множество строится заново, исходный список не меняется. Порядок для этой задачи не важен.')]),
  ),
  dict(
    id='sum', fn='two_sum', title='Пара с суммой', lc='LeetCode 1', lc_url='https://leetcode.com/problems/two-sum/', chapter='17.3', form='index',
    heads=('nums, target', 'Ответ'), label='список nums',
    say='Дан список чисел и число target. Верните индексы двух чисел, сумма которых равна target.',
    retell='«Нужно найти i и j, i меньше j, у которых nums[i] + nums[j] равно target, и вернуть эти индексы».',
    ask=[
      ('Можно ли взять одно число дважды?', 'Нет.', 'Индексы разные.', 'Число записывается в словарь после поиска пары. Тест <code>[3, 5], 6 → None</code>.'),
      ('Бывают ли одинаковые числа?', 'Да.', 'Повторы допустимы.', 'Тест <code>[3, 3], 6 → (0, 1)</code>.'),
      ('Что вернуть, если пары нет?', 'None.', 'Пары может не быть.', '<code>return None</code> после цикла.'),
      ('Если пар несколько?', 'С наименьшим j, для него — с наименьшим i.', 'Правило выбора пары.', 'В словаре — первое вхождение числа.'),
      ('Отсортирован ли список?', 'Нет, нужны исходные индексы.', 'Сортировать нельзя.', 'Указатели не подходят, нужен словарь.'),
    ],
    examples=[
      (([2, 7, 11, 15], 9), 'пара в начале'),
      (([3, 5], 6), 'одно число дважды не берётся'),
      (([3, 3], 6), 'одинаковые числа'),
      (([2, 2, 4], 6), 'первый индекс при повторе'),
      (([], 1), 'пустой список'),
    ],
    brute='Перебрать все пары i < j и проверить сумму: O(n²).',
    form_hint='Для числа x пара известна заранее — target − x, а в ответе нужен её индекс.',
    steps=[
      ('Структура', '<code>index = {}</code> — число → индекс его первого вхождения левее.'),
      ('Поиск', '<code>need = target - x</code>; если <code>need in index</code> — <code>return (index[need], j)</code>.'),
      ('Запись', 'Иначе, если <code>x</code> ещё нет в словаре, <code>index[x] = j</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждое число проверяется и записывается один раз, в среднем за O(1). Без пары в словаре оказываются все n чисел.',),
    start='''
def two_sum(nums, target):
    index = {}
    for j, x in enumerate(nums):
        # Найдите пару для x среди чисел левее, затем запишите x.
        pass
    return None
''',
    tests=_tests('two_sum', [
      (([2, 7, 11, 15], 9), (0, 1), 'example', 'пара в начале'),
      (([3, 5], 6), None, 'not_twice', 'одно число дважды не берётся'),
      (([3, 3], 6), (0, 1), 'equal', 'одинаковые числа'),
      (([2, 2, 4], 6), (0, 2), 'first_index', 'первый индекс при повторе'),
      (([], 1), None, 'empty', 'пустой список'),
    ]),
    call='print(two_sum([2, 7, 11, 15], 9))',
    trace=('mock_sum', ''),
    follow=('Интервьюер спрашивает: «Если список уже отсортирован и индексы нужны в нём же, что изменится?»',
      [('Хватит двух указателей с концов: время O(n), память O(1)', True, 'Верно. Сумма растёт при сдвиге левого указателя и падает при сдвиге правого, словарь не нужен. Глава 17.1, §3.'),
       ('Ничего: словарь всё равно лучше', False, 'Время одинаковое, а словарь берёт O(n) памяти. На отсортированном списке указатели выигрывают по памяти.'),
       ('Нужен двоичный поиск пары для каждого числа: O(log n) на всё решение', False, 'Двоичный поиск для каждого из n чисел — O(n log n), а не O(log n). Указатели дают O(n).')]),
  ),
  dict(
    id='clients', fn='duplicate_clients', title='Клиенты с одинаковой почтой', lc='задача КТП', lc_url='', chapter='17.4', form='group',
    heads=('clients', 'Ответ'), label='список clients',
    say='Дан список клиентов: пары «id, почта». Найдите клиентов, у которых одна и та же почта.',
    retell='«Нужно сгруппировать id по почте и вернуть только группы, где клиентов больше одного».',
    ask=[
      ('Почта может отличаться регистром и пробелами?', 'Да, это одна почта.', 'Ключ — strip и casefold.', 'Тест <code>\'A@b.ru\'</code> и <code>\'a@B.ru \'</code>.'),
      ('Бывает ли пустая почта?', 'Да, такие клиенты не дубликаты друг друга.', 'Пустой ключ — отдельный список.', '<code>if not key</code> до записи в словарь.'),
      ('В каком порядке вернуть группы?', 'В порядке первого появления почты.', 'Порядок групп — как во входе.', 'Словарь хранит порядок вставки, сортировать не нужно.'),
      ('Что вернуть для клиента с уникальной почтой?', 'В группы он не попадает.', 'Только группы из двух и более id.', 'Отбор <code>len(ids) &gt; 1</code> в конце.'),
    ],
    examples=[
      (([(1, 'A@b.ru'), (2, 'a@B.ru '), (3, '')],), 'регистр, пробел и пустая почта'),
      (([(1, 'a@b'), (2, 'c@d')],), 'дубликатов нет'),
      (([(7, ''), (8, '  ')],), 'двое без почты'),
      (([],), 'пустой список'),
      (([(5, 'z@z'), (2, 'a@a'), (9, 'Z@z')],), 'порядок групп'),
    ],
    brute='Сравнить нормализованную почту каждой пары клиентов: O(n²) сравнений.',
    form_hint='Ключ строится из записи, и под одним ключом собирается несколько id.',
    steps=[
      ('Ключ', '<code>key = email.strip().casefold()</code>; пустой — id в <code>no_email</code>.'),
      ('Группа', 'Если ключа нет — <code>groups[key] = []</code>; затем <code>groups[key].append(cid)</code>.'),
      ('Отбор', 'Вернуть группы, где <code>len(ids) &gt; 1</code>, и <code>no_email</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждый клиент обрабатывается один раз: ключ строится за длину почты, запись в словарь — в среднем O(1). В словаре все непустые ключи.',),
    start='''
def duplicate_clients(clients):
    groups = {}
    no_email = []
    # Постройте ключ из почты, разложите id по группам,
    # верните группы из двух и более id и список no_email.
    return {}, no_email
''',
    tests=_tests('duplicate_clients', [
      (([(1, 'A@b.ru'), (2, 'a@B.ru '), (3, '')],), ({'a@b.ru': [1, 2]}, [3]), 'example', 'регистр, пробел и пустая почта'),
      (([(1, 'a@b'), (2, 'c@d')],), ({}, []), 'unique', 'дубликатов нет'),
      (([(7, ''), (8, '  ')],), ({}, [7, 8]), 'no_email', 'двое без почты'),
      (([(5, 'z@z'), (2, 'a@a'), (9, 'Z@z'), (1, 'a@a')],), ({'z@z': [5, 9], 'a@a': [2, 1]}, []), 'order', 'порядок групп'),
    ]),
    call="print(duplicate_clients([(1, 'A@b.ru'), (2, 'a@B.ru '), (3, '')]))",
    trace=('mock_clients', ''),
    follow=('Интервьюер спрашивает: «Отдел продаж просит считать одной почтой ivan.petrov@mail.ru и ivanpetrov@mail.ru. Что ответите?»',
      [('Это решение заказчика о нормализации: правило добавляется в ключ и в контракт, но оно может слить разных людей', True, 'Верно. На многих почтовых сервисах это разные ящики. Нормализацию задаёт условие, глава 17.4, §1.'),
       ('Точки надо удалять всегда: это та же почта', False, 'Не на всех сервисах. Слишком сильная нормализация сливает разных клиентов в одного.'),
       ('Так сделать нельзя: ключ словаря должен совпадать с почтой', False, 'Ключ строится как угодно, лишь бы был хешируемым. Вопрос в том, какое правило верно для данных.')]),
  ),
  dict(
    id='nearby', fn='contains_nearby_duplicate', title='Повтор на расстоянии не больше k', lc='LeetCode 219', lc_url='https://leetcode.com/problems/contains-duplicate-ii/', chapter='тренажёр', form='index',
    heads=('nums, k', 'Ответ'), label='список nums',
    say='Дан список чисел и число k. Верните True, если есть два равных числа, индексы которых отличаются не больше чем на k.',
    retell='«Нужно найти i и j, i ≠ j, с равными числами и |i − j| ≤ k».',
    ask=[
      ('Может ли k быть нулём?', 'Да. Тогда ответ всегда False.', 'k ≥ 0.', 'Тест <code>[1, 1], 0 → False</code>.'),
      ('Если число встречается много раз?', 'Важна любая пара вхождений.', 'Сравнивать с ближайшим прошлым вхождением.', 'В словаре — последний индекс числа, он перезаписывается.'),
      ('Что вернуть для пустого списка?', 'False.', 'Пустой список — False.', 'Тест <code>[], 3</code>.'),
    ],
    examples=[
      (([1, 2, 3, 1], 3), 'расстояние ровно k'),
      (([1, 0, 1, 1], 1), 'повтор рядом'),
      (([1, 2, 3, 1, 2, 3], 2), 'повторы дальше k'),
      (([1, 1], 0), 'k = 0'),
      (([1, 2, 1, 9, 9, 9, 1], 2), 'далёкое и близкое вхождение'),
    ],
    brute='Для каждого i проверить следующие k элементов: O(n·k), при k ≈ n — O(n²).',
    form_hint='Для каждого числа нужно знать, где оно встретилось в последний раз.',
    steps=[
      ('Структура', '<code>last = {}</code> — число → индекс последнего вхождения.'),
      ('Проверка', 'Если <code>x in last</code> и <code>j - last[x] &lt;= k</code> — <code>return True</code>.'),
      ('Запись', '<code>last[x] = j</code> — перезаписать: ближайшее вхождение важнее старого.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждое число проверяется и записывается один раз, в среднем за O(1). В словаре — по одной записи на каждое разное число.',),
    start='''
def contains_nearby_duplicate(nums, k):
    last = {}
    # Для каждого x проверьте расстояние до прошлого вхождения.
    return False
''',
    tests=_tests('contains_nearby_duplicate', [
      (([1, 2, 3, 1], 3), True, 'example', 'расстояние ровно k'),
      (([1, 0, 1, 1], 1), True, 'close', 'повтор рядом'),
      (([1, 2, 3, 1, 2, 3], 2), False, 'far', 'повторы дальше k'),
      (([1, 1], 0), False, 'k_zero', 'k = 0'),
      (([1, 2, 1, 9, 9, 9, 1], 2), True, 'overwrite', 'далёкое и близкое вхождение'),
    ]),
    call='print(contains_nearby_duplicate([1, 2, 3, 1], 3))',
    trace=('mock_nearby', ''),
    follow=('Интервьюер спрашивает: «Почему здесь индекс перезаписывается, а в two_sum — нет?»',
      [('Здесь важна ближайшая пара, и ближайшее прошлое вхождение — последнее. В two_sum правило требует наименьший i', True, 'Верно. Что хранить при повторе, решает условие: здесь — последний индекс, в two_sum — первый. Глава 17.3, §5.'),
       ('Перезапись быстрее, чем проверка x not in index', False, 'Обе операции в среднем O(1). Разница — в ответе, который требует условие.'),
       ('В two_sum перезапись дала бы неверную сумму', False, 'Сумма осталась бы верной, изменился бы только выбор i при повторе числа.')]),
  ),
  dict(
    id='repeat', fn='repeated_character', title='Первая буква, встреченная дважды', lc='LeetCode 2351', lc_url='https://leetcode.com/problems/first-letter-to-appear-twice/', chapter='тренажёр', form='seen',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка из строчных латинских букв. Верните букву, которая первой встретилась второй раз.',
    retell='«Нужно найти позицию, где буква повторилась раньше всего, и вернуть эту букву».',
    ask=[
      ('Гарантирован ли повтор?', 'На LeetCode да. Здесь — если повтора нет, верните пустую строку.', 'Без повтора — \'\'.', '<code>return \'\'</code> после цикла.'),
      ('«Первая» — по первому или по второму вхождению?', 'По второму: чьё второе вхождение раньше.', 'Ответ — где случился первый повтор.', 'Проход слева направо до первого <code>ch in seen</code>.'),
      ('Какие символы бывают?', 'Строчные латинские буквы.', 'Алфавит из 26 букв.', 'Множество хранит не больше 26 букв: память O(1).'),
    ],
    examples=[
      (('abccbaacz',), 'c повторилась раньше a и b'),
      (('abcdd',), 'повтор в конце'),
      (('abc',), 'повтора нет'),
      (('aa',), 'две одинаковые'),
      (('abba',), 'b раньше a'),
    ],
    brute='Для каждой позиции j проверить, есть ли s[j] в s[:j]: O(n²).',
    form_hint='Для каждой буквы важно только, встречалась ли она левее.',
    steps=[
      ('Структура', '<code>seen = set()</code>.'),
      ('Проверка', 'Если <code>ch in seen</code> — <code>return ch</code>.'),
      ('Добавление', 'Иначе <code>seen.add(ch)</code>; после цикла <code>return \'\'</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти: не больше 26 букв во множестве',
        ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(n) по памяти: множество растёт с длиной строки', 'O(n log n) по времени, O(n) по памяти'],
        'Строка проходится один раз. Во множестве не больше 26 разных букв, сколько бы символов ни было в строке.'),
    start='''
def repeated_character(s):
    seen = set()
    # Верните первую букву, которая уже есть в seen.
    return ''
''',
    tests=_tests('repeated_character', [
      (('abccbaacz',), 'c', 'example', 'c повторилась раньше a и b'),
      (('abcdd',), 'd', 'end', 'повтор в конце'),
      (('aa',), 'a', 'two', 'две одинаковые'),
      (('abba',), 'b', 'abba', 'b раньше a'),
    ]),
    call="print(repeated_character('abccbaacz'))",
    trace=('mock_repeat', ''),
    follow=('Интервьюер спрашивает: «Можно ли обойтись без множества, раз букв всего 26?»',
      [('Да: список из 26 флагов, номер ячейки — ord(ch) - ord(\'a\'). Это тот же поиск по месту без хеша', True, 'Верно. Для небольшого известного алфавита список флагов работает так же, глава 17.1, §3.'),
       ('Нет: без хеш-таблицы проверка станет O(n)', False, 'Проверка флага по номеру ячейки — O(1), хеш для этого не нужен.'),
       ('Да: s.count(ch) &gt; 1 для каждой буквы', False, 'count проходит всю строку: для каждой буквы O(n), всего O(n²). И он не скажет, какой повтор был первым.')]),
  ),
  dict(
    id='jewels', fn='num_jewels_in_stones', title='Драгоценности среди камней', lc='LeetCode 771', lc_url='https://leetcode.com/problems/jewels-and-stones/', chapter='тренажёр', form='lookup',
    heads=('jewels, stones', 'Ответ'), label='строка stones',
    say='Строка jewels — виды драгоценных камней, строка stones — камни, которые у вас есть. Сколько ваших камней драгоценные?',
    retell='«Нужно посчитать символы stones, которые встречаются в jewels».',
    ask=[
      ('Важен ли регистр?', 'Да, \'a\' и \'A\' — разные камни.', 'Регистр различается.', 'Без casefold. Тест <code>\'aA\', \'aAAbbbb\'</code>.'),
      ('Бывают ли повторы в jewels?', 'Нет, все виды разные.', 'Виды уникальны.', 'Множество из jewels.'),
      ('Какой длины строки?', 'До 50 символов каждая, но решение должно быть линейным.', 'Нужно O(m + n).', 'Не <code>st in jewels</code> по строке, а по множеству.'),
    ],
    examples=[
      (('aA', 'aAAbbbb'), 'регистр различается'),
      (('z', 'ZZ'), 'нет драгоценных'),
      (('abc', ''), 'камней нет'),
      (('a', 'aaaa'), 'все драгоценные'),
      (('', 'abc'), 'видов нет'),
    ],
    brute='Для каждого камня искать его в строке jewels: O(m · n).',
    form_hint='Одна строка задаёт допустимые значения, другая проверяется по ним.',
    steps=[
      ('Структура', '<code>kinds = set(jewels)</code> — один раз, O(m).'),
      ('Проход', 'Для каждого камня: если <code>st in kinds</code> — <code>count += 1</code>.'),
      ('Ответ', '<code>return count</code>.'),
    ],
    hand='',
    cx=('O(m + n) по времени в среднем, O(m) по памяти',
        ['O(m · n) по времени, O(1) по памяти', 'O(n log n) по времени, O(1) по памяти', 'O(m + n) по времени, O(n) по памяти на копию stones'],
        'Множество видов строится за O(m), каждый из n камней проверяется в среднем за O(1). Во множестве — только виды из jewels.'),
    start='''
def num_jewels_in_stones(jewels, stones):
    count = 0
    # Постройте множество видов и проверьте каждый камень.
    return count
''',
    tests=_tests('num_jewels_in_stones', [
      (('aA', 'aAAbbbb'), 3, 'example', 'регистр различается'),
      (('z', 'ZZ'), 0, 'case', 'нет драгоценных'),
      (('abc', ''), 0, 'no_stones', 'камней нет'),
      (('a', 'aaaa'), 4, 'all', 'все драгоценные'),
    ]),
    call="print(num_jewels_in_stones('aA', 'aAAbbbb'))",
    trace=('mock_jewels', ''),
    follow=('Интервьюер спрашивает: «А почему не set(stones) &amp; set(jewels)?»',
      [('Пересечение теряет число камней: из \'aAAbbbb\' останется {\'a\', \'A\'}, а ответ — 3', True, 'Верно. Множество хранит каждый камень один раз, а считать нужно все камни.'),
       ('Пересечение медленнее: O(m · n)', False, 'Пересечение множеств — O(min(m, n)) в среднем. Проблема в ответе: повторы камней теряются.'),
       ('Так можно, ответ тот же', False, 'На \'aA\', \'aAAbbbb\' пересечение даёт 2 элемента, а драгоценных камней 3.')]),
  ),
  dict(
    id='unique_sum', fn='sum_of_unique', title='Сумма уникальных элементов', lc='LeetCode 1748', lc_url='https://leetcode.com/problems/sum-of-unique-elements/', chapter='тренажёр', form='count',
    heads=('nums', 'Ответ'), label='список nums',
    say='Дан список чисел. Верните сумму тех чисел, которые встречаются в нём ровно один раз.',
    retell='«Нужно сложить числа с частотой 1».',
    ask=[
      ('Если число встречается три раза?', 'Оно не уникальное.', 'Уникальное — ровно одно вхождение.', 'Сравнение <code>c == 1</code>, а не чётность.'),
      ('Что вернуть, если уникальных нет?', '0.', 'Сумма пустого набора — 0.', 'Тест <code>[1, 1, 1]</code>.'),
      ('Бывают ли отрицательные числа?', 'На LeetCode нет, здесь — да.', 'Числа любые.', 'Тест <code>[-2, 5, 5]</code>.'),
    ],
    examples=[
      (([1, 2, 3, 2],), 'одно число повторяется'),
      (([1, 1, 1],), 'уникальных нет'),
      (([1, 2, 3, 4, 5],), 'все уникальные'),
      (([-2, 5, 5],), 'отрицательное число'),
      (([],), 'пустой список'),
    ],
    brute='Для каждого числа посчитать nums.count(x): O(n²).',
    form_hint='Ответ зависит от того, сколько раз встречается число, а не от позиции.',
    steps=[
      ('Частоты', '<code>count[x] = count.get(x, 0) + 1</code> для каждого числа.'),
      ('Отбор', 'Пройти <code>count.items()</code>, сложить числа с <code>c == 1</code>.'),
      ('Ответ', '<code>return total</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Список проходится один раз, словарь частот — ещё раз. В словаре — по записи на каждое разное число.',),
    start='''
def sum_of_unique(nums):
    count = {}
    total = 0
    # Посчитайте частоты, затем сложите числа с частотой 1.
    return total
''',
    tests=_tests('sum_of_unique', [
      (([1, 2, 3, 2],), 4, 'example', 'одно число повторяется'),
      (([1, 1, 1],), 0, 'none', 'уникальных нет'),
      (([1, 2, 3, 4, 5],), 15, 'all', 'все уникальные'),
      (([-2, 5, 5],), -2, 'negative', 'отрицательное число'),
      (([],), 0, 'empty', 'пустой список'),
    ]),
    call='print(sum_of_unique([1, 2, 3, 2]))',
    trace=('mock_unique_sum', ''),
    follow=('Интервьюер спрашивает: «Можно ли решить двумя множествами без словаря?»',
      [('Да: seen и repeated; ответ — сумма seen − repeated', True, 'Верно. Повторное вхождение отправляет число в repeated, сколько бы раз оно ни встретилось. Время и память те же.'),
       ('Да: добавлять число в seen и удалять при повторе', False, 'При третьем вхождении число вернётся в seen и попадёт в сумму. Ошибка видна на <code>[1, 1, 1]</code>.'),
       ('Нет: без словаря частоты не узнать', False, 'Точная частота не нужна, достаточно знать «один раз или больше». Это дают два множества.')]),
  ),
  dict(
    id='sorted', fn='two_sum_sorted', title='Пара с суммой в отсортированном списке', lc='LeetCode 167', lc_url='https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', chapter='тренажёр', form='pointers',
    heads=('numbers, target', 'Ответ'), label='список numbers',
    say='Дан список чисел по неубыванию и число target. Верните номера двух чисел с суммой target, нумерация с единицы.',
    retell='«Нужно найти i < j с numbers[i] + numbers[j] = target и вернуть [i + 1, j + 1]».',
    ask=[
      ('Сколько памяти можно взять?', 'O(1).', 'Дополнительная память O(1).', 'Словарь не подходит: два указателя.'),
      ('Если пары нет?', 'На LeetCode она есть. Здесь — пустой список.', 'Без пары — [].', '<code>return []</code> после цикла.'),
      ('Нумерация с нуля или с единицы?', 'С единицы.', 'Ответ — [i + 1, j + 1].', 'Тест <code>[2, 7, 11, 15], 9 → [1, 2]</code>.'),
    ],
    examples=[
      (([2, 7, 11, 15], 9), 'пара в начале'),
      (([2, 3, 4], 6), 'крайние числа'),
      (([-1, 0], -1), 'отрицательное число'),
      (([1, 2, 3], 10), 'пары нет'),
      (([1, 3, 3, 5], 6), 'одинаковые числа'),
    ],
    brute='Перебрать все пары: O(n²). Или словарь из two_sum: O(n), но память O(n).',
    form_hint='Список отсортирован, а память ограничена O(1).',
    steps=[
      ('Указатели', '<code>i, j = 0, len(numbers) - 1</code>, цикл <code>while i &lt; j</code>.'),
      ('Сумма', 'Совпала — вернуть <code>[i + 1, j + 1]</code>.'),
      ('Сдвиг', 'Сумма меньше — <code>i += 1</code>, больше — <code>j -= 1</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти',
        ['O(n) по времени в среднем, O(n) по памяти', 'O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(1) по памяти'],
        'Каждый шаг сдвигает один из указателей, всего не больше n − 1 шагов. Хранятся только два индекса.'),
    start='''
def two_sum_sorted(numbers, target):
    i, j = 0, len(numbers) - 1
    # Сдвигайте указатели навстречу по сумме пары.
    return []
''',
    tests=_tests('two_sum_sorted', [
      (([2, 7, 11, 15], 9), [1, 2], 'example', 'пара в начале'),
      (([2, 3, 4], 6), [1, 3], 'ends', 'крайние числа'),
      (([-1, 0], -1), [1, 2], 'negative', 'отрицательное число'),
      (([1, 2, 3], 10), [], 'none', 'пары нет'),
      (([1, 3, 3, 5], 6), [1, 4], 'equal', 'одинаковые числа'),
    ]),
    call='print(two_sum_sorted([2, 7, 11, 15], 9))',
    trace=('mock_sorted', ''),
    follow=('Интервьюер спрашивает: «Зачем указатели, если словарь из задачи two_sum тоже даёт O(n)?»',
      [('Время одинаковое, но указатели берут O(1) памяти, а словарь — O(n). Сортировка уже дана в условии', True, 'Верно. Хеш-структура нужна, когда порядок не помогает. Здесь он помогает. Глава 17.1, §3.'),
       ('Словарь здесь не работает: числа повторяются', False, 'Словарь работает и с повторами, это видно в two_sum. Разница в памяти.'),
       ('Указатели быстрее асимптотически: O(log n)', False, 'Указатели делают до n − 1 шагов: это O(n), как и словарь.')]),
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
  <title>17.6 Мок-интервью по задачам модуля · Хеш-структуры</title>
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
      <div class="spine"><span>Модуль 17 · Hash map и set: выбор структуры · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Хеш-структуры</a> · модуль 17 · выбор структуры</p>
          <p class="running__folio">Глава 17.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">17.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на выбор хеш-структуры в формате алгоритмической секции. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 13.6–15.6 книги о строках и в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модуль 0 и главы 17.1–17.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Выбирать между множеством, словарём и указателями в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из шести. Пять из них — формы хеш-структуры: множество уже встреченных, словарь «значение → индекс», словарь групп по построенному ключу, множество, построенное заранее из одного входа, и частотный словарь. Шестая — два указателя по отсортированному списку: одна задача тренажёра решается без хеш-структуры, и это нужно заметить. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 1512, 2215, 1207 — и задача домашнего задания LeetCode 3. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Задачи 217, 1 и задача о клиентах разобраны в главах 17.2–17.4, остальные пять — только здесь. Задача 219 — расширение стартового набора <code>lesson_17</code>: если вы её уже решили, начните с других. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Можно ли взять элемент дважды, бывают ли повторы, какой ответ выбрать из нескольких, отсортирован ли вход, сколько памяти можно взять, что вернуть, если ответа нет.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустой вход и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названо, что хранится в структуре перед проверкой, почему множество или словарь, средний случай и память.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 17.5 Практика и ДЗ</a><a href="../index.html">К оглавлению книги →</a></div>
        <div class="colophon">
          <span>Модуль 17 · Hash map и set: выбор структуры · ОП.04 · 3 курс</span>
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

