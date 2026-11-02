"""Собирает главу 14.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../13-chastoty/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m14traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m14 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m14)

REF = {k: _m14.SOURCES[k] for k in ('is_palindrome', 'can_be_palindrome', 'longest_palindrome_length',
                                    'is_palindrome_number', 'reverse_only_letters', 'reverse_string',
                                    'smallest_palindrome', 'first_palindrome')}
HELPER = _m14.HELPER

FORMS = {
    'skip': 'Два указателя навстречу с пропуском лишних символов',
    'swap': 'Два указателя навстречу с обменом или заменой пары',
    'branch': 'Указатели до первого различия, затем две проверки отрезков',
    'count': 'Частотный словарь',
    'half': 'Разворот половины числа арифметикой',
    'reverse': 'Сравнение с развёрнутой копией через срез [::-1]',
}

FORM_WHY = {
    'skip': 'Указатели с пропуском берут, когда часть символов в задаче не участвует: знаки, пробелы, не-буквы. Указатель перешагивает такой символ, пока i < j, и только потом работает с парой.',
    'swap': 'Указатели с обменом или заменой берут, когда каждую пару «символ с начала — символ с конца» нужно изменить на месте: поменять местами или сделать одинаковой. Пропускать при этом нечего.',
    'branch': 'Две проверки отрезков берут, когда разрешено одно удаление: пары снаружи первого различия совпали, и удалить можно только один из двух различающихся символов.',
    'count': 'Частотный словарь берут, когда буквы можно переставлять: порядок не задан, сравнивать пары с концов не нужно, важно только, сколько раз встречается каждая буква.',
    'half': 'Разворот половины числа берут, когда на входе число, а строку строить нельзя: цифры достаются с конца через % 10 и // 10.',
    'reverse': 'Сравнение со срезом [::-1] берут, когда строки короткие: код получается в одну строку, а копия стоит O(m) памяти на длину строки.',
}

ROZA = _m14.ROZA


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


def _tests_inplace(fn, cases):
    """Тесты для функции, которая меняет список на месте: проверяется список после вызова."""
    out = ''
    for arg, want, name, doc in cases:
        out += f'''
def test_{name}():
    """{doc}"""
    s = {arg!r}
    {fn}(s)
    assert s == {want!r}, {f"ожидалось {want!r}, получено "!r} + repr(s)
'''
    return out


CX_LINE = ('O(n) по времени, O(1) по памяти',
           ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(n) по памяти', 'O(n log n) по времени, O(1) по памяти'])
CX_LIST = ('O(n) по времени, O(n) по памяти на список символов',
           ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти'])

HAND_MIRROR = '<p>Пройдите указателями руками: впишите свою фразу и посмотрите, какие символы пропускаются и где пара не совпала.</p><div class="mirror" data-s="А в Енисее — синева" data-title="Указатели с двух концов"></div>'


TASKS = [
  dict(
    id='pal', fn='is_palindrome', title='Палиндром с пропуском символов', lc='LeetCode 125', lc_url='https://leetcode.com/problems/valid-palindrome/', chapter='14.2', form='skip',
    heads=('text', 'Ответ'), label='строка text',
    say='Дана фраза. Проверьте, читается ли она одинаково слева направо и справа налево.',
    retell='«Нужно вернуть True, если значимые символы фразы, взятые с начала и с конца, совпадают попарно».',
    ask=[
      ('Важен ли регистр?', 'Нет.', 'Регистр не важен.', 'Перед сравнением <code>casefold</code>.'),
      ('Учитывать пробелы и знаки?', 'Нет, только буквы и цифры.', 'Пробелы и знаки пропускаются.', 'Пропуск по <code>isalnum</code>, тест «А в Енисее — синева».'),
      ('Цифры — значимые символы?', 'Да.', 'Цифры сравниваются наравне с буквами.', '<code>isalnum</code>, а не <code>isalpha</code>: тест «1а2» → False.'),
      ('Можно ли собрать очищенную копию?', 'Нет, память O(1).', 'Копию строить нельзя.', 'Два указателя по исходной строке, без среза и списка.'),
      ('Что вернуть для строки без букв и цифр?', 'True.', 'Пустая после очистки строка — палиндром.', 'Тест «.,» — и граница <code>i &lt; j</code> в циклах пропуска.'),
    ],
    examples=[
      ((ROZA,), 'фраза с пробелами и регистром'),
      (('race a car',), 'различие в середине'),
      (('.,',), 'нет букв и цифр'),
      (('1а2',), 'цифры значимы'),
      (('ёе',), 'ё и е — разные буквы'),
    ],
    brute='Собрать очищенную копию и сравнить её с разворотом: время O(n), но память O(n), а условие требует O(1).',
    form_hint='Сравниваются пары символов с двух концов, а знаки и пробелы в пары не входят.',
    steps=[
      ('Указатели', '<code>i, j = 0, len(text) - 1</code>, цикл <code>while i &lt; j</code>.'),
      ('Пропуск', 'Пока <code>i &lt; j</code> и <code>text[i]</code> не <code>isalnum</code> — <code>i += 1</code>; так же для <code>j</code> с конца.'),
      ('Сравнение', 'Если <code>casefold</code> символов различается — <code>return False</code>, иначе <code>i += 1</code>, <code>j -= 1</code>.'),
    ],
    hand=HAND_MIRROR,
    cx=CX_LINE + ('Каждый символ посещается одним из указателей один раз. Хранятся только два индекса.',),
    start='''
def is_palindrome(text):
    i, j = 0, len(text) - 1
    # Пропускайте символы, которые не буква и не цифра,
    # и сравнивайте пары без учёта регистра.
    return True
''',
    tests=_tests('is_palindrome', [
      ((ROZA,), True, 'roza', 'фраза из примера'),
      (('race a car',), False, 'race', 'различие в середине'),
      (('.,',), True, 'no_letters', 'нет букв и цифр'),
      (('1а2',), False, 'digits', 'цифры значимы'),
      (('Аа',), True, 'case', 'регистр не важен'),
    ]),
    call=f"print(is_palindrome({ROZA!r}))",
    trace=('pal', ''),
    follow=('Интервьюер спрашивает: «Зачем во внутренних циклах пропуска условие i < j?»',
      [('Без него на строке из одних знаков указатель уходит за конец строки: «.,» даёт IndexError', True, 'Верно. Внешнее условие проверяется только перед итерацией, а циклы пропуска идут внутри неё. Глава 14.4, §1.'),
       ('Чтобы не сравнивать средний символ сам с собой', False, 'Средний символ отсекает внешнее <code>while i &lt; j</code>. Внутреннее условие защищает от выхода за строку, когда значимых символов нет.'),
       ('Для скорости: без него ответ тот же, только дольше', False, 'Ответ не тот же: на «.,» без этого условия <code>i</code> выходит за конец строки, и Python бросает IndexError.')]),
  ),
  dict(
    id='can', fn='can_be_palindrome', title='Почти-палиндром', lc='LeetCode 680', lc_url='https://leetcode.com/problems/valid-palindrome-ii/', chapter='14.3', form='branch',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка. Из неё можно удалить не больше одного символа. Проверьте, может ли она стать палиндромом.',
    retell='«Нужно вернуть True, если строка уже палиндром или становится им после удаления одного символа».',
    ask=[
      ('Нужно ли приводить регистр и убирать знаки?', 'Нет, символы сравниваются как есть.', 'Нормализации нет.', 'Сравнение <code>s[i] != s[j]</code> без <code>casefold</code>.'),
      ('Если строка уже палиндром?', 'True, удалять не обязательно.', 'Удаление не обязательно.', 'Если различий нет — <code>return True</code> после цикла.'),
      ('Сколько символов можно удалить?', 'Не больше одного.', 'Одно удаление.', 'При первом различии — две проверки, без рекурсии.'),
      ('Бывает ли пустая строка?', 'Да, это палиндром.', 'Пустая строка — True.', 'Цикл не выполнится ни разу, тест <code>\'\'</code>.'),
    ],
    examples=[
      (('ротатоор',), 'удаление в середине'),
      (('шалаши',), 'удаление последнего символа'),
      (('abc',), 'одного удаления мало'),
      (('abbab',), 'сосед подсказывает не тот символ'),
      (('кабак',), 'уже палиндром'),
    ],
    brute='Удалить по очереди каждый символ и проверить остаток на палиндром: n вариантов по O(n), всего O(n²).',
    form_hint='Пары снаружи первого различия уже совпали, поэтому удалить можно только один из двух различающихся символов.',
    steps=[
      ('Указатели', 'Идти навстречу, пока <code>s[i] == s[j]</code>.'),
      ('Две проверки', 'При первом различии вернуть <code>is_range_palindrome(s, i + 1, j) or is_range_palindrome(s, i, j - 1)</code>.'),
      ('Без различий', 'Указатели встретились — <code>return True</code>.'),
    ],
    hand='',
    cx=CX_LINE + ('Указатели доходят до первого различия, затем каждая из двух проверок проходит отрезок один раз. Хранятся только индексы.',),
    start='''
def can_be_palindrome(s):
    i, j = 0, len(s) - 1
    # Идите навстречу до первого различия,
    # затем проверьте два отрезка: без s[i] и без s[j].
    return True
''' + HELPER,
    tests=_tests('can_be_palindrome', [
      (('ротатоор',), True, 'middle', 'удаление в середине'),
      (('шалаши',), True, 'right', 'удаление последнего символа'),
      (('abc',), False, 'abc', 'одного удаления мало'),
      (('abcda',), False, 'two_diff', 'два различия'),
      (('abbab',), True, 'neighbour', 'сосед подсказывает не тот символ'),
      (('',), True, 'empty', 'пустая строка'),
    ]),
    call="print(can_be_palindrome('ротатоор'))",
    trace=('can', ''),
    follow=('Интервьюер спрашивает: «Почему нельзя выбрать, какой символ удалить, по соседнему символу?»',
      [('Сосед может совпасть случайно: в «abbab» s[i + 1] == s[j], но удалять нужно s[j]; проверка одного варианта даёт False', True, 'Верно. Если удалить <code>s[0]</code>, остаётся «bbab» — не палиндром. Если удалить <code>s[4]</code>, остаётся «abba». Глава 14.4, §3.'),
       ('Можно: если сосед совпал, второй вариант всегда хуже', False, 'На «abbab» сосед слева совпадает с <code>s[j]</code>, но верный вариант — второй.'),
       ('Можно, если сначала отсортировать строку', False, 'Сортировка меняет порядок символов, а палиндром зависит от порядка.')]),
  ),
  dict(
    id='longest', fn='longest_palindrome_length', title='Палиндром из букв строки', lc='LeetCode 409', lc_url='https://leetcode.com/problems/longest-palindrome/', chapter='14.1', form='count',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка из букв. Какой длины самый длинный палиндром можно составить из этих букв?',
    retell='«Буквы можно переставлять, каждую взять не больше одного раза; нужно вернуть длину самого длинного палиндрома».',
    ask=[
      ('Заглавная и строчная — одна буква?', 'Нет, «A» и «a» разные.', 'Регистр важен.', 'Ключ словаря — сам символ. Тест «Aa» → 1.'),
      ('Нужно ли использовать все буквы?', 'Нет.', 'Часть букв можно не брать.', 'Из нечётной частоты берётся чётная часть.'),
      ('Вернуть палиндром или длину?', 'Длину.', 'Ответ — число.', 'Строку собирать не нужно.'),
      ('Бывает ли пустая строка?', 'Да, ответ 0.', 'Пустая строка — 0.', 'Тест <code>\'\'</code>.'),
    ],
    examples=[
      (('abccccdd',), 'пример из условия'),
      (('Aa',), 'регистр важен'),
      (('a',), 'одна буква'),
      (('aaaa',), 'все буквы парные'),
      (('abc',), 'пар нет'),
    ],
    brute='Перебрать все наборы букв и все их перестановки и проверить каждую на палиндром: число вариантов растёт быстрее 2ⁿ.',
    form_hint='Порядок букв задаём сами, поэтому важно только, сколько раз встречается каждая буква.',
    steps=[
      ('Подсчёт', 'Для каждого символа: <code>count[ch] = count.get(ch, 0) + 1</code>.'),
      ('Пары', 'Для каждой частоты: <code>total += c // 2 * 2</code> — пары встают по краям.'),
      ('Центр', 'Если хотя бы одна частота нечётная — ещё <code>+ 1</code>: одна буква в центр.'),
    ],
    hand='',
    cx=('O(n) по времени, O(k) по памяти, k — число разных букв',
        ['O(n²) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(2ⁿ) по времени, O(n) по памяти'],
        'Один проход строит словарь, второй проходит по k частотам.'),
    start='''
def longest_palindrome_length(s):
    count = {}
    # Посчитайте частоты, сложите пары
    # и прибавьте 1, если есть буква для центра.
    return 0
''',
    tests=_tests('longest_palindrome_length', [
      (('abccccdd',), 7, 'example', 'пример из условия'),
      (('Aa',), 1, 'case', 'регистр важен'),
      (('a',), 1, 'one', 'одна буква'),
      (('aaaa',), 4, 'even', 'все буквы парные'),
      (('',), 0, 'empty', 'пустая строка'),
    ]),
    call="print(longest_palindrome_length('abccccdd'))",
    trace=('longest_palindrome_length', ''),
    follow=('Интервьюер спрашивает: «Нечётных частот несколько. Почему единица прибавляется только один раз?»',
      [('Непарная буква может стоять только в центре, а центр у палиндрома один', True, 'Верно. От остальных нечётных частот берётся чётная часть: <code>c // 2 * 2</code>.'),
       ('Чтобы длина ответа всегда была нечётной', False, 'Ответ бывает чётным: у «aaaa» он 4, и единица не прибавляется.'),
       ('Нечётная частота в строке бывает только одна', False, 'У «abc» все три частоты нечётные, ответ 1.')]),
  ),
  dict(
    id='number', fn='is_palindrome_number', title='Палиндром-число', lc='LeetCode 9', lc_url='https://leetcode.com/problems/palindrome-number/', chapter='только в тренажёре', form='half',
    heads=('x', 'Ответ'), label='число x',
    say='Дано целое число. Проверьте, палиндром ли оно, не переводя его в строку.',
    retell='«Нужно вернуть True, если цифры числа читаются одинаково с двух концов; str() использовать нельзя».',
    ask=[
      ('Бывают ли отрицательные числа?', 'Да, они не палиндромы: −121 справа налево — «121−».', 'Отрицательное — False.', 'Отсев <code>x &lt; 0</code> до цикла.'),
      ('Что с числами, которые оканчиваются нулём?', 'Они не палиндромы: число не начинается с нуля. Кроме самого 0.', 'Оканчивается нулём — False, 0 — True.', 'Отсев <code>x % 10 == 0 and x != 0</code>; тест 10.'),
      ('Можно ли перевернуть всё число?', 'Да, но хватит половины.', 'Достаточно половины цифр.', 'Цикл <code>while x &gt; rev</code>.'),
    ],
    examples=[
      ((1221,), 'чётное число цифр'),
      ((12321,), 'нечётное число цифр'),
      ((-121,), 'отрицательное'),
      ((10,), 'оканчивается нулём'),
      ((0,), 'ноль'),
    ],
    brute='Перевести в строку и сравнить с разворотом — запрещено условием. Без строки можно развернуть всё число арифметикой и сравнить с исходным: O(d) по числу цифр d.',
    form_hint='Цифры числа достаются с конца арифметикой: x % 10 и x // 10.',
    steps=[
      ('Отсев', '<code>x &lt; 0</code> или <code>x % 10 == 0 and x != 0</code> — False.'),
      ('Половина', 'Пока <code>x &gt; rev</code>: <code>rev = rev * 10 + x % 10</code>, <code>x //= 10</code>.'),
      ('Сравнение', '<code>x == rev or x == rev // 10</code>: второе — для нечётного числа цифр.'),
    ],
    hand='',
    cx=('O(d) по времени, d — число цифр; O(1) по памяти',
        ['O(d²) по времени, O(1) по памяти', 'O(d) по времени, O(d) по памяти', 'O(x) по времени, O(1) по памяти'],
        'За шаг уходит одна цифра, цифр d ≈ log₁₀ x, а пройти нужно половину. Хранятся только x и rev.'),
    start='''
def is_palindrome_number(x):
    if x < 0:
        return False
    rev = 0
    # Переворачивайте правую половину в rev,
    # пока x больше rev, затем сравните.
    return True
''',
    tests=_tests('is_palindrome_number', [
      ((1221,), True, 'even', 'чётное число цифр'),
      ((12321,), True, 'odd', 'нечётное число цифр'),
      ((-121,), False, 'negative', 'отрицательное'),
      ((10,), False, 'zero_end', 'оканчивается нулём'),
      ((0,), True, 'zero', 'ноль'),
      ((123,), False, 'no', 'не палиндром'),
    ]),
    call='print(is_palindrome_number(1221))',
    trace=('is_palindrome_number', ''),
    follow=('Интервьюер спрашивает: «Зачем в конце сравнивать ещё и с rev // 10?»',
      [('При нечётном числе цифр средняя цифра попадает в rev, её отбрасывают: у 12321 в конце x = 12, rev = 123', True, 'Верно. Средней цифре пары нет, поэтому сравнивается 12 и 123 // 10.'),
       ('Для отрицательных чисел', False, 'Отрицательные числа отсеяны до цикла.'),
       ('Для чисел, которые оканчиваются нулём', False, 'Их отсеивает проверка <code>x % 10 == 0 and x != 0</code> до цикла.')]),
  ),
  dict(
    id='letters', fn='reverse_only_letters', title='Развернуть только буквы', lc='LeetCode 917', lc_url='https://leetcode.com/problems/reverse-only-letters/', chapter='только в тренажёре', form='skip',
    heads=('s', 'Ответ'), label='список chars',
    say='Дана строка. Разверните в ней только буквы, остальные символы оставьте на своих местах.',
    retell='«Буквы должны встать в обратном порядке, а остальные символы — остаться на тех же индексах».',
    ask=[
      ('Что считается буквой? Цифры тоже?', 'Буква — isalpha, цифры не буквы.', 'Цифры остаются на местах.', 'Пропуск по <code>isalpha</code>.'),
      ('Строку можно изменить на месте?', 'Строка в Python неизменяема.', 'Нужен список символов.', '<code>chars = list(s)</code>, в конце <code>\'\'.join(chars)</code>.'),
      ('Что вернуть, если букв нет?', 'Строку без изменений.', 'Без букв — та же строка.', 'Тест <code>\'-.\'</code>.'),
    ],
    examples=[
      (('ab-cd',), 'пример из условия'),
      (('a-bC-dEf-ghIj',), 'регистр не меняется'),
      (('Test1ng-Leet=code-Q!',), 'цифра и знаки'),
      (('-.',), 'нет букв'),
      (('а-б',), 'кириллица'),
    ],
    brute='Выписать буквы в отдельный список, развернуть его и расставить буквы обратно по позициям букв: O(n), но с лишним списком и двумя проходами.',
    form_hint='Знаки в обмене не участвуют и остаются на местах, меняются местами только пары букв с двух концов.',
    steps=[
      ('Список', '<code>chars = list(s)</code>, <code>i, j = 0, len(chars) - 1</code>.'),
      ('Пропуск', 'Если <code>chars[i]</code> не буква — <code>i += 1</code>; иначе если <code>chars[j]</code> не буква — <code>j -= 1</code>.'),
      ('Обмен', 'Иначе обмен <code>chars[i], chars[j] = chars[j], chars[i]</code> и оба сдвига.'),
    ],
    hand='',
    cx=CX_LIST + ('Каждый шаг сдвигает хотя бы один указатель. Список нужен, потому что строку изменить нельзя.',),
    start='''
def reverse_only_letters(s):
    chars = list(s)
    i, j = 0, len(chars) - 1
    # Пропускайте не-буквы с обоих концов,
    # меняйте местами пары букв.
    return ''.join(chars)
''',
    tests=_tests('reverse_only_letters', [
      (('ab-cd',), 'dc-ba', 'example', 'пример из условия'),
      (('a-bC-dEf-ghIj',), 'j-Ih-gfE-dCba', 'case', 'регистр не меняется'),
      (('Test1ng-Leet=code-Q!',), 'Qedo1ct-eeLg=ntse-T!', 'digit', 'цифра и знаки'),
      (('-.',), '-.', 'no_letters', 'нет букв'),
      (('а-б',), 'б-а', 'cyrillic', 'кириллица'),
    ]),
    call="print(reverse_only_letters('ab-cd'))",
    trace=('reverse_only_letters', ''),
    follow=('Интервьюер спрашивает: «Теперь цифры тоже нужно разворачивать вместе с буквами. Что изменится?»',
      [('Только проверка: isalpha заменить на isalnum, остальное не меняется', True, 'Верно. Пропуск решает, какие символы участвуют в обмене, остальной код от этого не зависит.'),
       ('Понадобится второй проход для цифр', False, 'Буквы и цифры разворачиваются вместе, одной последовательностью: хватает одного прохода.'),
       ('Цифры придётся хранить в отдельном списке', False, 'Цифры обмениваются в том же списке <code>chars</code>, что и буквы.')]),
  ),
  dict(
    id='reverse', fn='reverse_string', title='Развернуть список на месте', lc='LeetCode 344', lc_url='https://leetcode.com/problems/reverse-string/', chapter='только в тренажёре', form='swap',
    heads=('s', 'Список после вызова'), label='список s', list_only=True,
    say='Дан список символов. Разверните его на месте, без второго списка.',
    retell='«Нужно изменить сам список; возвращать ничего не нужно; дополнительная память O(1)».',
    ask=[
      ('Что вернуть?', 'Ничего, меняется сам список.', 'Результат — список после вызова.', 'Тест проверяет <code>s</code> после вызова.'),
      ('Можно ли s[::-1] или s.reverse()?', 'Нет: срез создаёт новый список, а reverse нужно написать самому.', 'Только обмены на месте.', 'Два указателя с обменом.'),
      ('Бывает ли пустой список?', 'Да, он остаётся пустым.', 'Пустой список — без изменений.', 'Цикл не выполнится, тест <code>[]</code>.'),
    ],
    examples=[
      ((['h', 'e', 'l', 'l', 'o'],), 'нечётная длина'),
      ((['H', 'a', 'n', 'n', 'a', 'h'],), 'чётная длина'),
      ((['а'],), 'один символ'),
      (([],), 'пустой список'),
      ((['a', 'b'],), 'два символа'),
    ],
    brute='Собрать новый список с конца и скопировать его обратно: O(n) по времени, но O(n) памяти, а условие требует O(1).',
    form_hint='Каждый символ меняется местами с зеркальным, пары берутся с двух концов.',
    steps=[
      ('Указатели', '<code>i, j = 0, len(s) - 1</code>.'),
      ('Обмен', 'Пока <code>i &lt; j</code>: <code>s[i], s[j] = s[j], s[i]</code>.'),
      ('Сдвиг', '<code>i += 1</code>, <code>j -= 1</code>.'),
    ],
    hand='',
    cx=CX_LINE + ('n // 2 обменов, каждый за O(1). Хранятся только два индекса.',),
    start='''
def reverse_string(s):
    i, j = 0, len(s) - 1
    # Меняйте местами пары с двух концов, пока i < j.
''',
    tests=_tests_inplace('reverse_string', [
      (['h', 'e', 'l', 'l', 'o'], ['o', 'l', 'l', 'e', 'h'], 'odd', 'нечётная длина'),
      (['H', 'a', 'n', 'n', 'a', 'h'], ['h', 'a', 'n', 'n', 'a', 'H'], 'even', 'чётная длина'),
      (['а'], ['а'], 'one', 'один символ'),
      ([], [], 'empty', 'пустой список'),
      (['a', 'b'], ['b', 'a'], 'two', 'два символа'),
    ]),
    call="s = ['h', 'e', 'l', 'l', 'o']; reverse_string(s); print(s)",
    trace=('reverse_string', ''),
    follow=('Интервьюер спрашивает: «Что будет, если написать while i <= j?»',
      [('Ответ тот же: при i == j символ меняется сам с собой, это один лишний шаг', True, 'Верно. Для обмена условие <code>i &lt;= j</code> безвредно: на списке нечётной длины выходит один лишний шаг.'),
       ('Средний символ уйдёт на другое место', False, 'При <code>i == j</code> обмен <code>s[i], s[j] = s[j], s[i]</code> ставит символ на то же место.'),
       ('IndexError на списке нечётной длины', False, 'Индексы <code>i</code> и <code>j</code> остаются внутри списка: при <code>i == j</code> оба указывают на средний символ.')]),
  ),
  dict(
    id='smallest', fn='smallest_palindrome', title='Наименьший палиндром заменами', lc='LeetCode 2697', lc_url='https://leetcode.com/problems/lexicographically-smallest-palindrome/', chapter='только в тренажёре', form='swap',
    heads=('s', 'Ответ'), label='список chars',
    say='Дана строка из строчных латинских букв. За одну операцию можно заменить любую букву. Сделайте строку палиндромом за наименьшее число замен, а из таких ответов верните наименьший по алфавиту.',
    retell='«Каждая несовпавшая пара требует одной замены; в паре оставляем меньшую из двух букв».',
    ask=[
      ('Можно ли удалять или вставлять буквы?', 'Нет, только заменять.', 'Длина не меняется.', 'Работа с парами на местах, в списке символов.'),
      ('Если вариантов с наименьшим числом замен несколько?', 'Наименьший по алфавиту.', 'Нужен лексикографически наименьший.', 'В паре обе позиции получают <code>min</code>.'),
      ('Если строка уже палиндром?', 'Вернуть её же.', 'Палиндром — без изменений.', 'Совпавшая пара не трогается.'),
    ],
    examples=[
      (('egcfe',), 'одна несовпавшая пара'),
      (('abcd',), 'все пары различны'),
      (('seven',), 'замена в начале'),
      (('a',), 'одна буква'),
      (('aba',), 'уже палиндром'),
    ],
    brute='Перебрать все строки, которые получаются заменами, и выбрать палиндром с наименьшим числом замен: вариантов 26ⁿ.',
    form_hint='Каждая пара с двух концов решается отдельно: совпала — ничего не делать, не совпала — одна замена.',
    steps=[
      ('Список', '<code>chars = list(s)</code>, указатели с двух концов.'),
      ('Пара', 'Если <code>chars[i] != chars[j]</code> — обе позиции получают <code>min(chars[i], chars[j])</code>.'),
      ('Сдвиг', '<code>i += 1</code>, <code>j -= 1</code>; в конце <code>\'\'.join(chars)</code>.'),
    ],
    hand='',
    cx=CX_LIST + ('Каждая пара рассматривается один раз. Список нужен, потому что строку изменить нельзя.',),
    start='''
def smallest_palindrome(s):
    chars = list(s)
    i, j = 0, len(chars) - 1
    # Для каждой пары с двух концов: если буквы различны,
    # поставьте в обе позиции меньшую.
    return ''.join(chars)
''',
    tests=_tests('smallest_palindrome', [
      (('egcfe',), 'efcfe', 'example', 'одна несовпавшая пара'),
      (('abcd',), 'abba', 'all_diff', 'все пары различны'),
      (('seven',), 'neven', 'seven', 'замена в начале'),
      (('a',), 'a', 'one', 'одна буква'),
      (('aba',), 'aba', 'palindrome', 'уже палиндром'),
    ]),
    call="print(smallest_palindrome('egcfe'))",
    trace=('smallest_palindrome', ''),
    follow=('Интервьюер спрашивает: «Сколько замен нужно в худшем случае для строки длины n?»',
      [('n // 2: по одной на каждую пару; средний символ при нечётной длине не меняется', True, 'Верно. У «abcd» обе пары различны — две замены, ответ «abba».'),
       ('n: каждую букву придётся заменить', False, 'В несовпавшей паре меняется одна буква из двух: вторая уже меньшая.'),
       ('n − 1: все, кроме первой', False, 'Пар всего n // 2, и на каждую нужна не больше одной замены.')]),
  ),
  dict(
    id='first', fn='first_palindrome', title='Первое слово-палиндром', lc='LeetCode 2108', lc_url='https://leetcode.com/problems/find-first-palindromic-string-in-the-array/', chapter='только в тренажёре', form='reverse',
    heads=('words', 'Ответ'), label='список words',
    say='Дан список слов. Верните первое слово, которое является палиндромом, или пустую строку, если таких нет.',
    retell='«Нужно пройти слова по порядку и вернуть первое, которое читается одинаково с двух концов».',
    ask=[
      ('Нужно ли приводить регистр?', 'Нет, слова из строчных латинских букв.', 'Нормализации нет.', 'Слово сравнивается как есть.'),
      ('Какой длины слова?', 'До 100 букв.', 'Слова короткие.', 'Копия слова через срез стоит мало.'),
      ('Что вернуть, если палиндромов нет?', 'Пустую строку.', 'Нет ответа — \'\'.', 'После цикла <code>return \'\'</code>.'),
    ],
    examples=[
      ((['abc', 'car', 'ada', 'racecar', 'cool'],), 'пример из условия'),
      ((['notapalindrome', 'racecar'],), 'палиндром последний'),
      ((['def', 'ghi'],), 'палиндромов нет'),
      ((['x', 'aa'],), 'слово из одной буквы'),
      ((['ab', 'aba', 'aa'],), 'первый по порядку, а не самый длинный'),
    ],
    brute='Здесь простое решение и есть ответ: для каждого слова сравнить его с разворотом. Слова короткие, поэтому копия word[::-1] не мешает.',
    form_hint='Слова короткие — до 100 букв: копия каждого стоит мало, а проверка записывается одной строкой.',
    steps=[
      ('Обход', '<code>for word in words</code>.'),
      ('Проверка', 'Если <code>word == word[::-1]</code> — <code>return word</code>.'),
      ('Нет ответа', 'После цикла — <code>return \'\'</code>.'),
    ],
    hand='',
    cx=('O(L) по времени, L — суммарная длина слов; O(m) по памяти на копию одного слова',
        ['O(L²) по времени, O(1) по памяти', 'O(L log L) по времени, O(1) по памяти', 'O(L) по времени, O(L) по памяти на копии всех слов сразу'],
        'Каждое слово читается и копируется один раз, а в памяти одновременно только одна копия длиной не больше m.'),
    start='''
def first_palindrome(words):
    # Верните первое слово, которое совпадает со своим разворотом.
    return ''
''',
    tests=_tests('first_palindrome', [
      ((['abc', 'car', 'ada', 'racecar', 'cool'],), 'ada', 'example', 'пример из условия'),
      ((['notapalindrome', 'racecar'],), 'racecar', 'last', 'палиндром последний'),
      ((['def', 'ghi'],), '', 'none', 'палиндромов нет'),
      ((['x', 'aa'],), 'x', 'one', 'слово из одной буквы'),
    ]),
    call="print(first_palindrome(['abc', 'car', 'ada', 'racecar', 'cool']))",
    trace=('first_palindrome', ''),
    follow=('Интервьюер спрашивает: «Теперь слова длиной до 10⁶ символов, и копия мешает. Что изменить?»',
      [('Проверять каждое слово двумя указателями без копии, как в is_palindrome: память O(1)', True, 'Верно. Время останется O(L), а память на копию исчезнет. Глава 14.2, §1.'),
       ('Отсортировать слова по длине', False, 'Сортировка потеряет порядок, а ответ — первое слово по порядку. Копия при этом никуда не денется.'),
       ('Сравнивать только первую и последнюю буквы', False, 'Слово «abca» пройдёт такую проверку, но палиндромом не является.')]),
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
  <title>14.6 Мок-интервью по задачам модуля · Алгоритмы на строках</title>
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
      <div class="spine"><span>Модуль 14 · Палиндромы · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Алгоритмы на строках</a> · модуль 14 · палиндромы</p>
          <p class="running__folio">Глава 14.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">14.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на палиндромы и симметричные проверки в формате алгоритмической секции. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главе 13.6 и в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модуль 0 и главы 14.1–14.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Решать задачи на симметрию строк в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из шести. Четыре из них — формы решения задач на симметрию: указатели с пропуском лишних символов, указатели с обменом или заменой пары, две проверки после первого различия и разворот половины числа. Ещё две — частотный словарь из модуля 13 и сравнение со срезом <code>[::-1]</code>: в задачах модуля встречаются и они. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 345, 1750, 1328 — и задача домашнего задания LeetCode 5. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Задачи 125 и 680 разобраны в главах 14.2 и 14.3, задача 409 — в главе 14.1, §3, остальные пять — только здесь. Регистр и знаки пропускаются только в задаче 125, в остальных символы сравниваются как есть. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Условие пересказано до вопросов</b>В пересказе названы вход, какие символы сравниваются и что вернуть.</span></div>
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Регистр, знаки и цифры, можно ли строить копию, менять ли на месте, пустая строка, что вернуть, если ответа нет.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая строку без букв и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названо, откуда идут указатели и что происходит с парой, нужна ли копия и от чего зависит память.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 14.5 Практика и ДЗ</a><a href="../index.html">К оглавлению книги →</a></div>
        <div class="colophon">
          <span>Модуль 14 · Палиндромы · ОП.04 · 3 курс</span>
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

