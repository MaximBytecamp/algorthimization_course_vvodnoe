"""Собирает главу 13.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../../massivy/12-intervaly/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m13traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m13 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m13)

LETTERS = '''
import unicodedata

def letters(text):
    text = unicodedata.normalize('NFC', text).casefold()
    return [ch for ch in text if ch.isalnum()]
'''
REF = {k: _m13.SOURCES[k] for k in ('first_unique', 'can_construct', 'is_pangram', 'almost_equivalent',
                                    'equal_counts', 'first_repeat')}
# В главах letters и unicodedata подставляются прогону отдельно; в тренажёре код эталона полный.
REF['is_anagram'] = LETTERS + _m13.SOURCES['is_anagram']
REF['normalize_name'] = '\nimport unicodedata\n' + _m13.SOURCES['normalize_name']

FORMS = {
    'count': 'Частотный словарь: один проход с подсчётом, затем сравнение или проверка счётчиков',
    'twopass': 'Два прохода: частоты всей строки, затем поиск по строке слева направо',
    'seen': 'Множество уже встреченных символов',
    'parse': 'Разбор на слова и сборка результата через join',
    'pointers': 'Два указателя навстречу',
}

FORM_WHY = {
    'count': 'Частотный словарь берут, когда ответ зависит от того, сколько раз встречается каждый символ, а порядок символов не важен. Один проход строит словарь за O(n), память O(k) по числу разных символов.',
    'twopass': 'Два прохода берут, когда нужен первый по порядку символ с заданной частотой: частота становится известна только после прохода по всей строке, а порядок — только при втором проходе.',
    'seen': 'Множество берут, когда достаточно знать, встречался ли символ, а сколько раз — неважно. Проверка и добавление стоят O(1).',
    'parse': 'Разбор на слова берут, когда строку нужно привести к формату: разделить по пробелам или другому разделителю, оформить каждую часть и собрать результат через join за O(n).',
    'pointers': 'Два указателя навстречу сравнивают символы с двух концов строки: так проверяют палиндромы, это занятие 14. Частоты символов они не считают.',
}

NAME = '  салтыков-щедрин   михаил '


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


CX_COUNT = ('O(n) по времени, O(k) по памяти, k — число разных символов',
            ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(n²) по памяти'])
CX_TWO = ('O(n + m) по времени, O(k) по памяти',
          ['O(n · m) по времени, O(1) по памяти', 'O((n + m) log(n + m)) по времени, O(n + m) по памяти', 'O(n + m) по времени, O(n · m) по памяти'])
CX_LINE = ('O(n) по времени, O(n) по памяти на результат',
           ['O(n²) по времени, O(n) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(1) по памяти'])

HAND_FREQ = '<p>Сравните частоты руками: впишите свои строки, отметьте приведение к ключу и посмотрите, у каких символов столбики различаются.</p><div class="freq" data-a="Апельсин" data-b="спаниель" data-norm="on"></div>'


TASKS = [
  dict(
    id='anagram', fn='is_anagram', title='Слова из одних букв', lc='LeetCode 242', lc_url='https://leetcode.com/problems/valid-anagram/', chapter='13.2', form='count',
    heads=('a, b', 'Ответ'), label='список a после letters',
    say='Даны две строки. Проверьте, что одна получается из другой перестановкой букв.',
    retell='«Нужно вернуть True, если строки составлены из одних и тех же букв в одинаковом количестве, порядок не важен».',
    ask=[
      ('Важен ли регистр?', 'Нет.', 'Регистр не важен.', 'Перед подсчётом <code>casefold</code>.'),
      ('Учитывать пробелы и знаки?', 'Нет, только буквы и цифры.', 'Пробелы и знаки не учитываются.', 'Фильтр <code>isalnum</code>.'),
      ('ё и е — одна буква?', 'Нет, разные.', 'ё и е различаются.', 'Замены нет, нужен тест «ёж» — «еж».'),
      ('Бывают ли пустые строки?', 'Да, две пустые строки — анаграммы.', 'Пустые строки — True.', 'Нужен тест <code>\'\'</code>, <code>\'\'</code>.'),
    ],
    examples=[
      (('Апельсин', 'спаниель'), 'регистр'),
      (('А роза упала', 'Ау, пала роза!'), 'пробелы и знаки'),
      (('папа', 'пап'), 'разная длина'),
      (('ёж', 'еж'), 'ё и е'),
      (('', ''), 'пустые строки'),
    ],
    brute='Для каждой буквы a найти такую же в копии b и вычеркнуть её: поиск в списке O(m) на каждую из n букв, всего O(n·m).',
    form_hint='Порядок букв не важен, важно, сколько раз встречается каждая.',
    steps=[
      ('Нормализация', '<code>a = letters(a)</code>, <code>b = letters(b)</code>; если длины разные — False.'),
      ('Подсчёт', 'Для каждого символа a: <code>count[ch] = count.get(ch, 0) + 1</code>.'),
      ('Сверка', 'Для каждого символа b: если <code>count.get(ch, 0) == 0</code> — False, иначе <code>count[ch] -= 1</code>.'),
    ],
    hand=HAND_FREQ,
    cx=('O(n + m) по времени, O(k) по памяти на словарь',
        ['O(n · m) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n + m) по времени, O(n · m) по памяти'],
        'Нормализация и два прохода — O(n + m). Словарь хранит по ключу на каждый разный символ.'),
    start=LETTERS + '''
def is_anagram(a, b):
    a = letters(a)
    b = letters(b)
    # Сравните длины, посчитайте частоты a, сверьте с ними символы b.
    return True
''',
    tests=_tests('is_anagram', [
      (('Апельсин', 'спаниель'), True, 'case', 'регистр'),
      (('папа', 'пап'), False, 'length', 'разная длина'),
      (('аб', 'аа'), False, 'counts', 'длины равны, частоты разные'),
      (('ёж', 'еж'), False, 'yo', 'ё и е'),
      (('', ''), True, 'empty', 'пустые строки'),
    ]),
    call="print(is_anagram('Апельсин', 'спаниель'))",
    trace=('anagram', ''),
    follow=('Интервьюер спрашивает: «Можно ли обойтись без сравнения длин?»',
      [('Нет: без него «папа» и «пап» окажутся анаграммами — лишняя буква в a останется в count, а второй цикл этого не проверяет', True, 'Верно. Второй цикл ищет пару только для символов b. Глава 13.4, §1.'),
       ('Да: второй цикл всё равно найдёт символ без пары', False, 'Второй цикл найдёт лишний символ, только если он в b. Если лишний символ в a, цикл закончится без ошибки: «папа» и «пап» дают True.'),
       ('Да, если заменить словарь множеством', False, 'Множество теряет частоты: у «папа» и «пап» множества букв равны.')]),
  ),
  dict(
    id='unique', fn='first_unique', title='Первая неповторяющаяся буква', lc='LeetCode 387', lc_url='https://leetcode.com/problems/first-unique-character-in-a-string/', chapter='13.3', form='twopass',
    heads=('text', 'Ответ'), label='строка text',
    say='Дана строка. Найдите первую букву, которая встречается в строке один раз, и верните её индекс.',
    retell='«Нужно вернуть индекс самой левой буквы с частотой 1, а если такой нет — −1».',
    ask=[
      ('Заглавная и строчная — одна буква?', 'Да, «К» и «к» — одна буква.', 'Регистр не важен.', 'Ключ словаря — <code>ch.casefold()</code>. Тест «Казак» → 2.'),
      ('Что делать со знаками и пробелами?', 'Они не буквы, их не рассматривать.', 'Учитываются только буквы.', 'Во втором проходе <code>ch.isalpha()</code>. Тест «Тот, кто» → 5.'),
      ('Что вернуть, если такой буквы нет?', '−1.', 'Нет ответа — −1.', 'После второго прохода <code>return -1</code>.'),
      ('Индекс — в исходной строке?', 'Да.', 'Индекс в исходной строке.', 'Строку не нормализовать целиком: индексы сдвинутся.'),
    ],
    examples=[
      (('Казак',), 'одна буква в двух регистрах'),
      (('Тот, кто',), 'знаки и пробел'),
      (('leetcode',), 'пример 1 из условия'),
      (('aabb',), 'уникальной буквы нет'),
      (('',), 'пустая строка'),
    ],
    brute='Для каждой буквы вызвать <code>text.count</code>: O(n) на каждый из n символов, всего O(n²).',
    form_hint='Частота буквы известна только после прохода по всей строке, а первая по порядку — только при втором проходе.',
    steps=[
      ('Первый проход', 'Для каждого символа: <code>count[ch.casefold()] += 1</code>.'),
      ('Второй проход', 'Для каждого <code>i, ch</code>: если <code>ch.isalpha()</code> и <code>count[ch.casefold()] == 1</code> — вернуть <code>i</code>.'),
      ('Нет ответа', 'После цикла — <code>return -1</code>.'),
    ],
    hand='',
    cx=CX_COUNT + ('Два прохода по O(n). Словарь хранит частоту каждого разного символа.',),
    start='''
def first_unique(text):
    count = {}
    # Первый проход: частоты без учёта регистра.
    # Второй проход: первый индекс буквы с частотой 1.
    return -1
''',
    tests=_tests('first_unique', [
      (('Казак',), 2, 'case', 'одна буква в двух регистрах'),
      (('Тот, кто',), 5, 'marks', 'знаки и пробел'),
      (('leetcode',), 0, 'leetcode', 'пример из условия'),
      (('aabb',), -1, 'none', 'уникальной нет'),
      (('',), -1, 'empty', 'пустая строка'),
    ]),
    call="print(first_unique('Казак'))",
    trace=('unique', ''),
    follow=('Интервьюер спрашивает: «Строка — поток символов, второго прохода нет. Что хранить?»',
      [('Для каждой буквы — частоту и индекс первого появления; в конце выбрать наименьший индекс среди букв с частотой 1', True, 'Верно. Словарь «буква → (частота, первый индекс)» заменяет второй проход: время O(n), выбор ответа — O(k).'),
       ('Только множество встреченных букв', False, 'Множество говорит, встречалась ли буква, но не сколько раз и где впервые.'),
       ('Отсортировать буквы и найти одиночные', False, 'Сортировка теряет исходный порядок, а ответ — первая буква по порядку.')]),
  ),
  dict(
    id='name', fn='normalize_name', title='ФИО из формы', lc='своя задача', lc_url='', chapter='13.3', form='parse',
    heads=('text', 'Ответ'), label='список words',
    say='Покупатель вписывает ФИО в форму как угодно. Приведите строку к единому виду для печати на документах.',
    retell='«Нужно убрать лишние пробелы и оформить каждое слово с заглавной буквы, остальные строчные».',
    ask=[
      ('Что делать с несколькими пробелами подряд и пробелами по краям?', 'Убрать, между словами — один пробел.', 'Пробелы сжимаются.', '<code>split()</code> без аргумента и <code>\' \'.join</code>.'),
      ('Как оформлять двойную фамилию?', 'Каждую часть с заглавной: «Салтыков-Щедрин».', 'Части через дефис оформляются отдельно.', 'Слово делится по дефису.'),
      ('Заменять ли ё на е?', 'Нет, ё сохраняется.', 'ё сохраняется.', 'Тест «ёлкин пётр» → «Ёлкин Пётр».'),
      ('Что вернуть для пустого ввода?', 'Пустую строку.', 'Пустой ввод — \'\'.', '<code>\' \'.join([])</code> даёт <code>\'\'</code> без отдельной проверки.'),
    ],
    examples=[
      ((NAME,), 'пробелы и двойная фамилия'),
      (('ИВАНОВ иван\xa0петрович',), 'регистр и неразрывный пробел'),
      (('ёлкин пётр',), 'буква ё'),
      (("д'артаньян",), 'апостроф'),
      (('   ',), 'одни пробелы'),
    ],
    brute='Пройти строку посимвольно, отслеживая начало слова и дефис, и собирать результат сложением строк: в худшем случае O(n²) из-за копирования.',
    form_hint='Строку нужно разделить на слова, оформить каждое и собрать обратно.',
    steps=[
      ('Слова', '<code>words = unicodedata.normalize(\'NFC\', text).split()</code>.'),
      ('Части', 'Каждое слово — <code>word.split(\'-\')</code>, у каждой части <code>capitalize()</code>, склейка через дефис.'),
      ('Сборка', '<code>\' \'.join(result)</code>.'),
    ],
    hand='',
    cx=CX_LINE + ('split, capitalize и join проходят строку по разу. Результат и список слов — O(n).',),
    start='''
import unicodedata

def normalize_name(text):
    words = unicodedata.normalize('NFC', text).split()
    result = []
    # Оформите каждое слово с учётом дефиса.
    return ' '.join(result)
''',
    tests=_tests('normalize_name', [
      ((NAME,), 'Салтыков-Щедрин Михаил', 'hyphen', 'пробелы и двойная фамилия'),
      (('ИВАНОВ иван\xa0петрович',), 'Иванов Иван Петрович', 'nbsp', 'регистр и неразрывный пробел'),
      (('ёлкин пётр',), 'Ёлкин Пётр', 'yo', 'буква ё'),
      (("д'артаньян",), "Д'артаньян", 'apostrophe', 'апостроф'),
      (('   ',), '', 'blank', 'одни пробелы'),
    ]),
    call="print(repr(normalize_name('  салтыков-щедрин   михаил ')))",
    trace=('name', ''),
    follow=('Интервьюер спрашивает: «Почему не text.title()?»',
      [('title делает заглавной букву после любого не-буквенного символа: «д\'артаньян» станет «Д\'Артаньян»', True, 'Верно. Для двойной фамилии title подходит, а для апострофа — нет. Глава 13.3, §4.'),
       ('title не работает с кириллицей', False, '<code>\'салтыков-щедрин\'.title()</code> даёт <code>\'Салтыков-Щедрин\'</code>: кириллицу title обрабатывает.'),
       ('title не убирает лишние пробелы', False, 'Это верно, но пробелы убирает split, и с ним title можно было бы использовать. Отличие в апострофе.')]),
  ),
  dict(
    id='construct', fn='can_construct', title='Записка из букв журнала', lc='LeetCode 383', lc_url='https://leetcode.com/problems/ransom-note/', chapter='только в тренажёре', form='count',
    heads=('note, magazine', 'Ответ'), label='строка magazine',
    say='Даны записка и текст журнала. Можно ли вырезать из журнала буквы и сложить записку, если каждую букву журнала можно использовать один раз?',
    retell='«Нужно проверить, что каждой буквы в журнале не меньше, чем в записке».',
    ask=[
      ('Регистр важен?', 'Да, символы сравниваются как есть.', 'Регистр важен.', 'Без нормализации.'),
      ('Пробелы тоже вырезаются?', 'Да, любой символ записки должен найтись в журнале.', 'Все символы учитываются.', 'Подсчёт по всем символам.'),
      ('Пустая записка?', 'Её можно составить всегда.', 'Пустая записка — True.', 'Второй цикл не выполнится, ответ True.'),
      ('Что больше, записка или журнал?', 'Как угодно.', 'Длины любые.', 'Сравнение длин не нужно: это не анаграммы.'),
    ],
    examples=[
      (('aa', 'aab'), 'букв хватает'),
      (('a', 'b'), 'буквы нет'),
      (('aa', 'ab'), 'буквы мало'),
      (('', 'abc'), 'пустая записка'),
      (('Кот', 'кот'), 'регистр'),
    ],
    brute='Для каждой буквы записки искать и вычёркивать её в копии журнала: O(n·m).',
    form_hint='Важно только, сколько каждой буквы есть в журнале.',
    steps=[
      ('Подсчёт журнала', 'Частоты символов <code>magazine</code>.'),
      ('Сверка', 'Для каждого символа записки: если счётчик 0 — False, иначе уменьшить.'),
      ('Ответ', 'Цикл закончился — True.'),
    ],
    hand='',
    cx=CX_TWO + ('Проход по журналу и по записке. Словарь — по ключу на разный символ журнала.',),
    start='''
def can_construct(note, magazine):
    count = {}
    # Посчитайте символы журнала и заберите по одному на каждый символ записки.
    return True
''',
    tests=_tests('can_construct', [
      (('aa', 'aab'), True, 'enough', 'букв хватает'),
      (('a', 'b'), False, 'missing', 'буквы нет'),
      (('aa', 'ab'), False, 'not_enough', 'буквы мало'),
      (('', 'abc'), True, 'empty', 'пустая записка'),
      (('Кот', 'кот'), False, 'case', 'регистр'),
    ]),
    call="print(can_construct('aa', 'aab'))",
    trace=('can_construct', ''),
    follow=('Интервьюер спрашивает: «Чем эта задача отличается от анаграмм?»',
      [('Журнал может быть длиннее записки: проверяется, что каждой буквы в журнале не меньше, чем в записке', True, 'Верно. Поэтому длины не сравнивают, а в конце в count могут остаться неиспользованные буквы.'),
       ('Ничем, это та же задача', False, 'У анаграмм частоты равны. Здесь частоты в журнале могут быть больше.'),
       ('Здесь важен порядок букв', False, 'Порядок не важен ни там, ни здесь: буквы вырезают из любого места журнала.')]),
  ),
  dict(
    id='pangram', fn='is_pangram', title='Все буквы алфавита', lc='LeetCode 1832', lc_url='https://leetcode.com/problems/check-if-the-sentence-is-pangram/', chapter='только в тренажёре', form='seen',
    heads=('sentence', 'Ответ'), label='строка sentence',
    say='Дана строка из строчных английских букв. Проверьте, что в ней есть каждая буква алфавита.',
    retell='«Нужно вернуть True, если встречаются все 26 букв».',
    ask=[
      ('Какие символы бывают в строке?', 'Только строчные английские буквы.', 'Только a–z.', 'Нормализация не нужна.'),
      ('Важно ли, сколько раз встречается буква?', 'Нет.', 'Частота не важна.', 'Хватает множества.'),
      ('Бывает ли пустая строка?', 'По условию длина от 1.', 'Строка непустая.', 'Тест на одну букву → False.'),
      ('Какая длина строки?', 'До 1000.', 'n ≤ 1000.', 'Любое решение O(n) подходит.'),
    ],
    examples=[
      (('thequickbrownfoxjumpsoverthelazydog',), 'пример 1 из условия'),
      (('leetcode',), 'пример 2 из условия'),
      (('abcdefghijklmnopqrstuvwxy',), 'нет одной буквы'),
      (('a',), 'одна буква'),
      (('zyxwvutsrqponmlkjihgfedcbaa',), 'все буквы и повтор'),
    ],
    brute='Для каждой из 26 букв проверить <code>ch in sentence</code>: 26 проходов по строке, O(26·n).',
    form_hint='Нужно знать только, встречалась ли буква.',
    steps=[
      ('Множество', '<code>seen = set()</code>.'),
      ('Проход', 'Каждую букву добавить в <code>seen</code>.'),
      ('Ответ', '<code>len(seen) == 26</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти: не больше 26 букв', ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(n) по памяти'],
        'Один проход. Множество хранит не больше 26 букв, сколько бы ни было символов в строке.'),
    start='''
def is_pangram(sentence):
    seen = set()
    # Соберите встреченные буквы.
    return False
''',
    tests=_tests('is_pangram', [
      (('thequickbrownfoxjumpsoverthelazydog',), True, 'full', 'все буквы'),
      (('leetcode',), False, 'short', 'мало букв'),
      (('abcdefghijklmnopqrstuvwxy',), False, 'no_z', 'нет одной буквы'),
      (('zyxwvutsrqponmlkjihgfedcbaa',), True, 'repeat', 'все буквы и повтор'),
    ]),
    call="print(is_pangram('thequickbrownfoxjumpsoverthelazydog'))",
    trace=('is_pangram', ''),
    follow=('Интервьюер спрашивает: «А для русского текста с заглавными буквами?»',
      [('Нормализовать: casefold и только буквы; алфавит — 33 буквы, и ё в нём нужно не забыть', True, 'Верно. Диапазон от а до я по номерам не содержит ё: она стоит после я, глава 0.2. Такая ошибка — в домашнем задании.'),
       ('Сравнить len(seen) с 32', False, 'В русском алфавите 33 буквы. 32 — это диапазон от а до я без ё.'),
       ('Ничего менять не нужно', False, 'Заглавные буквы попадут в множество отдельно, знаки и пробелы тоже, и len(seen) == 26 перестанет что-либо значить.')]),
  ),
  dict(
    id='almost', fn='almost_equivalent', title='Почти одинаковые слова', lc='LeetCode 2068', lc_url='https://leetcode.com/problems/check-whether-two-strings-are-almost-equivalent/', chapter='только в тренажёре', form='count',
    heads=('word1, word2', 'Ответ'), label='строка word1',
    say='Даны два слова одной длины. Они почти одинаковые, если частота каждой буквы в них отличается не больше чем на 3. Проверьте это.',
    retell='«Для каждой буквы разность частот по модулю не больше 3 — тогда True».',
    ask=[
      ('Какие буквы?', 'Строчные английские.', 'Только a–z.', 'Нормализация не нужна.'),
      ('Буквы, которых нет в одном слове, учитывать?', 'Да, их частота там 0.', 'Отсутствие буквы — частота 0.', 'Обойти ключи обоих слов.'),
      ('Длины слов равны?', 'Да.', 'Длины равны.', 'Сравнивать длины не нужно.'),
      ('Ровно 3 — это ещё почти одинаковые?', 'Да, не больше 3.', 'Порог включительно.', 'Условие <code>abs(d) &gt; 3</code> для False.'),
    ],
    examples=[
      (('aaaa', 'bccb'), 'пример 1 из условия'),
      (('abcdeef', 'abaaacc'), 'пример 2 из условия'),
      (('aaab', 'bbbb'), 'разность ровно 3'),
      (('abc', 'abc'), 'одинаковые слова'),
      (('cccddabba', 'babababab'), 'пример 3 из условия'),
    ],
    brute='Для каждой из 26 букв вызвать <code>count</code> в обоих словах: 52 прохода, O(26·n).',
    form_hint='Ответ зависит только от частот букв.',
    steps=[
      ('Плюс', 'Для букв word1: <code>diff[ch] += 1</code>.'),
      ('Минус', 'Для букв word2: <code>diff[ch] -= 1</code>.'),
      ('Проверка', 'Если какая-то <code>abs(d) &gt; 3</code> — False.'),
    ],
    hand='',
    cx=CX_COUNT + ('Два прохода и обход словаря. Словарь — не больше 26 ключей.',),
    start='''
def almost_equivalent(word1, word2):
    diff = {}
    # diff[ch] — частота в word1 минус частота в word2.
    return True
''',
    tests=_tests('almost_equivalent', [
      (('aaaa', 'bccb'), False, 'ex1', 'пример 1'),
      (('abcdeef', 'abaaacc'), True, 'ex2', 'пример 2'),
      (('aaab', 'bbbb'), True, 'three', 'ровно 3'),
      (('cccddabba', 'babababab'), True, 'ex3', 'пример 3'),
      (('aaaab', 'bbbbb'), False, 'four', 'разность 4'),
    ]),
    call="print(almost_equivalent('aaaa', 'bccb'))",
    trace=('almost_equivalent', ''),
    follow=('Интервьюер спрашивает: «Зачем один словарь разностей, а не два словаря частот?»',
      [('Один словарь — тот же ответ за меньшую память и один обход в конце', True, 'Верно. Буква, которой нет в word1, получит отрицательную разность во втором цикле, и обход diff её увидит.'),
       ('С двумя словарями ответ будет неверным', False, 'С двумя словарями ответ тоже верный, если обойти ключи обоих.'),
       ('Один словарь быстрее в n раз', False, 'Оба способа — O(n). Разница — в памяти и длине кода.')]),
  ),
  dict(
    id='equal', fn='equal_counts', title='Все буквы поровну', lc='LeetCode 1941', lc_url='https://leetcode.com/problems/check-if-all-characters-have-equal-number-of-occurrences/', chapter='только в тренажёре', form='count',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка из строчных английских букв. Проверьте, что все буквы, которые в ней есть, встречаются одинаковое число раз.',
    retell='«Нужно вернуть True, если у всех встреченных букв одна и та же частота».',
    ask=[
      ('Буквы, которых нет в строке, учитывать?', 'Нет, только встреченные.', 'Только встреченные буквы.', 'Обходить ключи словаря.'),
      ('Строка из одной буквы?', 'True.', 'Одна буква — True.', 'Тест на одну букву.'),
      ('Какие символы?', 'Строчные английские.', 'Только a–z.', 'Нормализация не нужна.'),
      ('Длина строки?', 'От 1 до 1000.', 'Строка непустая.', 'Множество частот не будет пустым.'),
    ],
    examples=[
      (('abacbc',), 'пример 1 из условия'),
      (('aaabb',), 'пример 2 из условия'),
      (('z',), 'одна буква'),
      (('aabbccd',), 'одна буква реже'),
      (('abcabcabc',), 'по три раза'),
    ],
    brute='Для каждой буквы строки вызвать <code>s.count</code> и сравнить с первой: O(n²).',
    form_hint='Нужны частоты всех букв.',
    steps=[
      ('Подсчёт', 'Частоты всех букв.'),
      ('Разные частоты', '<code>set(count.values())</code>.'),
      ('Ответ', 'Значение одно — True.'),
    ],
    hand='',
    cx=CX_COUNT + ('Один проход и множество из не более 26 значений.',),
    start='''
def equal_counts(s):
    count = {}
    # Посчитайте частоты и проверьте, что значение у всех одно.
    return False
''',
    tests=_tests('equal_counts', [
      (('abacbc',), True, 'ex1', 'пример 1'),
      (('aaabb',), False, 'ex2', 'пример 2'),
      (('z',), True, 'one', 'одна буква'),
      (('aabbccd',), False, 'rare', 'одна буква реже'),
    ]),
    call="print(equal_counts('abacbc'))",
    trace=('equal_counts', ''),
    follow=('Интервьюер спрашивает: «Почему не сравнить все частоты с count[s[0]]?»',
      [('Можно и так, это тот же O(n); через set короче', True, 'Верно. Обе записи верны: set(count.values()) из одного элемента означает, что все частоты равны первой.'),
       ('Так нельзя: s[0] может быть редкой буквой', False, 'Если частота s[0] отличается от другой, ответ False в обоих способах. Какая буква редкая, неважно.'),
       ('Так быстрее в 26 раз', False, 'Множество из не более 26 значений строится за O(k). Оба способа — O(n).')]),
  ),
  dict(
    id='repeat', fn='first_repeat', title='Первая буква со второй встречей', lc='LeetCode 2351', lc_url='https://leetcode.com/problems/first-letter-to-appear-twice/', chapter='только в тренажёре', form='seen',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка из строчных английских букв. Верните букву, которая первой встретилась второй раз.',
    retell='«Нужна буква, второе появление которой стоит раньше вторых появлений остальных букв».',
    ask=[
      ('«Первой» — по первому или по второму появлению?', 'По второму.', 'Сравниваются вторые появления.', 'Ответ — в момент, когда буква встретилась повторно.'),
      ('Есть ли гарантия, что повтор будет?', 'Да.', 'Повтор есть всегда.', 'После цикла отдельного ответа не нужно.'),
      ('Какие символы?', 'Строчные английские.', 'Только a–z.', 'Нормализация не нужна.'),
      ('Длина?', 'От 2 до 100.', 'n ≤ 100.', 'Подойдёт любое O(n).'),
    ],
    examples=[
      (('abccbaacz',), 'пример 1 из условия'),
      (('abcdd',), 'пример 2 из условия'),
      (('aa',), 'две одинаковые'),
      (('abba',), 'повтор в середине'),
      (('abcab',), 'повтор первой буквы'),
    ],
    brute='Для каждой позиции j проверить <code>s[j] in s[:j]</code>: O(n²).',
    form_hint='Нужно знать только, встречалась ли буква раньше.',
    steps=[
      ('Множество', '<code>seen = set()</code>.'),
      ('Проверка', 'Если <code>ch in seen</code> — вернуть <code>ch</code>.'),
      ('Запоминание', 'Иначе <code>seen.add(ch)</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти: не больше 26 букв', ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(n) по памяти'],
        'Один проход до первого повтора. Множество — не больше 26 букв.'),
    start='''
def first_repeat(s):
    seen = set()
    # Верните букву в момент её второй встречи.
''',
    tests=_tests('first_repeat', [
      (('abccbaacz',), 'c', 'ex1', 'пример 1'),
      (('abcdd',), 'd', 'ex2', 'пример 2'),
      (('aa',), 'a', 'two', 'две одинаковые'),
      (('abba',), 'b', 'middle', 'повтор в середине'),
    ]),
    call="print(first_repeat('abccbaacz'))",
    trace=('first_repeat', ''),
    follow=('Интервьюер спрашивает: «Чем эта задача отличается от первой уникальной буквы?»',
      [('Здесь ответ известен в момент повтора, и хватает одного прохода; там частоту видно только после всей строки', True, 'Верно. Поэтому здесь множество и один проход, а в задаче 387 — словарь и два прохода.'),
       ('Ничем: обе решаются одним множеством', False, 'Множество не отличит букву, встреченную дважды, от встреченной трижды, а для 387 нужна частота ровно 1 по всей строке.'),
       ('Здесь нужна сортировка', False, 'Сортировка потеряет порядок, а ответ зависит от порядка вторых появлений.')]),
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
  <title>13.6 Мок-интервью по задачам модуля · Алгоритмы на строках</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400&family=Pixelify+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../massivy/styles.css">
  <link rel="stylesheet" href="../../massivy/algo.css">
  <link rel="stylesheet" href="../stroki.css">
</head>
<body>
  <!-- Страница собрана скриптом make_mock.py: править описания задач там. -->
  <div class="book">
    <div class="book__body">
      <div class="spine"><span>Модуль 13 · Частоты · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Алгоритмы на строках</a> · модуль 13 · нормализация и частоты</p>
          <p class="running__folio">Глава 13.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">13.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на частоты и нормализацию строк в формате алгоритмической секции. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модуль 0 и главы 13.1–13.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Решать задачи на частоты в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из пяти: частотный словарь, два прохода, множество встреченных символов, разбор на слова или два указателя навстречу. Первые четыре — формы решения задач модуля, пятая — техника занятия 14 о палиндромах: выбор между ней и техниками занятия 13 тоже входит в этап. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 1189, 205, 1160 — и задача домашнего задания LeetCode 438. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Первые три разобраны в главах модуля, остальные пять — только здесь. В задачах занятия строки нормализуют по ответам интервьюера, в задачах LeetCode 1832, 2068, 1941 и 2351 строки состоят из строчных английских букв, и нормализация не нужна. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Условие пересказано до вопросов</b>В пересказе названы вход, что считается одинаковыми символами и что вернуть.</span></div>
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Регистр, пробелы и знаки, ё и е, Unicode, пустая строка, что вернуть, если ответа нет.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустую строку и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названо, что хранится в словаре или множестве, сколько проходов нужно и от чего зависит память.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 13.5 Практика и ДЗ</a><a href="../index.html">К оглавлению книги →</a></div>
        <div class="colophon">
          <span>Модуль 13 · Нормализация и частоты · ОП.04 · 3 курс</span>
          <span class="author-line">Автор: Макаров Максим Николаевич</span>
        </div>
      </main>
    </div>
  </div>
  <script src="traces.js"></script>
  <script src="../../massivy/book.js"></script>
  <script src="../../massivy/algo.js"></script>
  <script src="../stroki.js"></script>
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

