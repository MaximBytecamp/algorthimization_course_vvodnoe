"""Собирает главу 15.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../14-palindromy/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m15traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m15 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m15)

REF = {k: _m15.SOURCES[k] for k in ('compress', 'parse_event', 'reverse_words', 'compress_in_place',
                                    'count_and_say', 'num_unique_emails', 'license_key', 'length_of_last_word')}

FORMS = {
    'runs': 'Проход по сериям двумя индексами: начало серии и её конец',
    'split2': 'Разбор в два уровня: split по разделителю, partition по первому знаку',
    'tokens': 'split() по пробелам и сборка через join',
    'write': 'Чтение и запись в одном списке: указатель записи отстаёт от чтения',
    'groups': 'Очистка строки, затем группы фиксированной длины',
    'backscan': 'Проход с конца строки до первого пробела',
}

FORM_WHY = {
    'runs': 'Проход по сериям берут, когда ответ строится из серий одинаковых символов: i стоит на начале серии, j уходит до её конца, затем i = j. Каждый символ проходится один раз.',
    'split2': 'Разбор в два уровня берут, когда строка делится на части, а каждая часть — ещё на две: поля по «;», поле по первому «=», адрес по «@».',
    'tokens': 'split() без аргумента берут, когда части разделены пробелами в любом количестве: он режет по любым пробелам и не оставляет пустых слов. Ответ собирают через join.',
    'write': 'Запись в тот же список берут, когда ответ нужно получить без нового списка: ответ не длиннее прочитанного, поэтому указатель записи никогда не обгоняет чтение.',
    'groups': 'Группы фиксированной длины берут, когда символы нужно переразбить на куски по k: сначала убрать старые разделители, потом нарезать заново.',
    'backscan': 'Проход с конца берут, когда ответ находится в конце строки: не нужно делить всю строку, хватает символов последнего слова и пробелов после него.',
}

LINE = _m15.LINE


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


def _raises(fn, cases):
    """Тесты, в которых вызов должен бросить ValueError."""
    out = ''
    for args, name, doc in cases:
        call = f"{fn}({', '.join(repr(a) for a in args)})"
        out += f'''
def test_{name}():
    """{doc}"""
    try:
        {call}
    except ValueError:
        return
    assert False, {f"{call}: ожидалось ValueError"!r}
'''
    return out


def _tests_inplace(cases):
    """Тесты для LeetCode 443: длина ответа и начало списка после вызова."""
    out = ''
    for arg, want, name, doc in cases:
        out += f'''
def test_{name}():
    """{doc}"""
    chars = {arg!r}
    n = compress_in_place(chars)
    assert chars[:n] == {want!r}, {f"ожидалось {want!r}, получено "!r} + repr(chars[:n])
'''
    return out


CX_LINE = ('O(n) по времени, O(n) по памяти на ответ',
           ['O(n²) по времени, O(n) по памяти', 'O(n log n) по времени, O(n) по памяти', 'O(n) по времени, O(1) по памяти'])

HAND_RLE = '<p>Проверьте серии руками: впишите строку и посмотрите, на какие серии она делится и что попадёт в ответ.</p><div class="rle" data-s="aaabccdddd" data-title="Строка по сериям"></div>'
HAND_PARSE = '<p>Разберите строку руками: кнопки подставляют повреждённые строки.</p><div class="parse" data-s="time=09:15;user=ivan;action=login" data-title="Разбор строки события" data-presets=\'[["две ; подряд","time=09:15;;user=ivan"],["поле без =","time=09:15;user"],["ключ дважды","user=ivan;user=olga"],["= в значении","time=09:15;note=a=b"]]\'></div>'


TASKS = [
  dict(
    id='compress', fn='compress', title='Сжатие серий', lc='своя задача', lc_url='', chapter='15.2', form='runs',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка. Сожмите её: каждую серию одинаковых символов запишите символом и длиной.',
    retell='«Нужно заменить каждую серию на символ и число её повторов и вернуть получившуюся строку».',
    ask=[
      ('Писать ли длину 1?', 'Нет: «b», а не «b1».', 'Длина 1 не пишется.', 'Условие <code>if j - i &gt; 1</code>.'),
      ('Бывают ли серии длиннее 9?', 'Да, длина пишется всеми цифрами.', 'Длина может быть многозначной.', '<code>str(j - i)</code> одним куском; тест <code>\'a\' * 12</code> → <code>\'a12\'</code>.'),
      ('Бывают ли во входе цифры?', 'Нет, это ошибка: иначе запись не разобрать обратно.', 'Цифра во входе — ValueError.', 'Проверка <code>isdigit</code> в начале серии.'),
      ('Важен ли регистр?', 'Да, «a» и «A» — разные серии.', 'Регистр важен.', 'Без <code>casefold</code>; тест <code>\'aA\'</code>.'),
    ],
    examples=[
      (('aaabccdddd',), 'пример из условия'),
      (('a' * 12,), 'серия длиннее 9'),
      (('abc',), 'нет повторов'),
      (('aAAa',), 'регистр'),
      (('',), 'пустая строка'),
    ],
    brute='Отрезать от строки найденную серию и продолжить с остатком: верно, но каждый срез копирует остаток, O(n · r), на коротких сериях O(n²).',
    form_hint='Ответ строится из серий одинаковых символов.',
    steps=[
      ('Серия', '<code>j</code> идёт от <code>i</code>, пока <code>j &lt; len(s)</code> и <code>s[j] == s[i]</code>.'),
      ('Запись', 'В <code>out</code> — символ и <code>str(j - i)</code>, если длина больше 1.'),
      ('Сдвиг', '<code>i = j</code>; в конце <code>\'\'.join(out)</code>.'),
    ],
    hand=HAND_RLE,
    cx=CX_LINE + ('Индекс j проходит каждый символ один раз. Ответ не длиннее строки.',),
    start='''
def compress(s):
    out = []
    i = 0
    # Для каждой серии: проверьте цифру, найдите конец серии j,
    # допишите символ и длину, если она больше 1, и поставьте i = j.
    return ''.join(out)
''',
    tests=_tests('compress', [
      (('aaabccdddd',), 'a3bc2d4', 'example', 'пример из условия'),
      (('a' * 12,), 'a12', 'long', 'серия длиннее 9'),
      (('abc',), 'abc', 'no_runs', 'нет повторов'),
      (('aAAa',), 'aA2a', 'case', 'регистр'),
      (('',), '', 'empty', 'пустая строка'),
    ]) + _raises('compress', [(('ab12',), 'digit', 'цифра во входе')]),
    call="print(compress('aaabccdddd'))",
    trace=('compress', ''),
    follow=('Интервьюер спрашивает: «Решение со срезом s = s.lstrip(ch) короче. Чем оно хуже?»',
      [('Срез копирует остаток строки на каждой серии: O(n · r), на коротких сериях это O(n²)', True, 'Верно. На миллионе символов в коротких сериях срез медленнее в 36 раз. Глава 15.2, §4.'),
       ('Ничем: оба решения O(n)', False, 'O(n) только проход по индексам. У среза время зависит от числа серий r.'),
       ('Срез теряет последнюю серию', False, 'Ответ среза верный, последняя серия пишется. Проблема во времени, а не в ответе.')]),
  ),
  dict(
    id='event', fn='parse_event', title='Строка события в словарь', lc='своя задача', lc_url='', chapter='15.3', form='split2',
    heads=('line', 'Ответ'), label='поле field',
    say='Есть строка события вида time=09:15;user=ivan;action=login. Верните словарь полей.',
    retell='«Нужно разделить строку на поля, каждое поле — на ключ и значение, и вернуть словарь; повреждённую строку — отвергнуть».',
    ask=[
      ('Может ли в значении быть «=»?', 'Да: ключ — до первого «=».', 'Значение может содержать «=».', '<code>partition(\'=\')</code>, а не <code>split(\'=\')</code>.'),
      ('Что делать с повреждённой строкой?', 'ValueError с номером поля.', 'Повреждение — ValueError.', 'Проверки: пустое поле, нет «=», пустой ключ, повтор ключа.'),
      ('Бывают ли пробелы вокруг ключа и значения?', 'Да, их убрать.', 'Пробелы по краям убираются.', '<code>strip</code> у ключа и значения.'),
      ('Может ли строка кончаться «;»?', 'Одна «;» в конце допустима.', 'Одна «;» в конце — не ошибка.', 'Отрезать её до <code>split</code>.'),
    ],
    examples=[
      ((LINE,), 'пример из условия'),
      ((' time = 09:15 ; note=a=b',), 'пробелы и «=» в значении'),
      (('time=09:15;note=;',), 'пустое значение и «;» в конце'),
      (('user=ivan',), 'одно поле'),
      (('a=1;b=2;c=3',), 'три поля'),
    ],
    brute='Пройти строку посимвольно с флагом «читаю ключ / читаю значение»: тоже O(n), но кода больше и легче ошибиться на границах полей.',
    form_hint='Строка делится на поля, а каждое поле — ещё на две части по первому знаку.',
    steps=[
      ('Поля', 'Отрезать одну «;» в конце, затем <code>line.split(\';\')</code>.'),
      ('Поле', '<code>key, sep, value = field.partition(\'=\')</code>; проверки пустого поля, <code>sep</code>, ключа.'),
      ('Запись', 'Повтор ключа — ошибка, иначе <code>event[key.strip()] = value.strip()</code>.'),
    ],
    hand=HAND_PARSE,
    cx=('O(n) по времени, O(n) по памяти',
        ['O(n²) по времени, O(n) по памяти', 'O(n · k) по времени, k — число полей, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти'],
        'split, partition и strip читают каждый символ по разу; проверка ключа в словаре — O(1).'),
    start='''
def parse_event(line):
    event = {}
    # Отрежьте одну ';' в конце, разделите строку на поля,
    # каждое поле — по первому '='. Повреждение — ValueError.
    return event
''',
    tests=_tests('parse_event', [
      ((LINE,), {'time': '09:15', 'user': 'ivan', 'action': 'login'}, 'example', 'пример из условия'),
      ((' time = 09:15 ; note=a=b',), {'time': '09:15', 'note': 'a=b'}, 'spaces_eq', 'пробелы и «=» в значении'),
      (('time=09:15;note=;',), {'time': '09:15', 'note': ''}, 'tail', 'пустое значение и «;» в конце'),
    ]) + _raises('parse_event', [
      (('time=09:15;;user=ivan',), 'empty_field', 'две «;» подряд'),
      (('time=09:15;user',), 'no_eq', 'поле без «=»'),
      (('user=ivan;user=olga',), 'repeat', 'ключ повторяется'),
    ]),
    call=f"print(parse_event({LINE!r}))",
    trace=('parse_event', ''),
    follow=('Интервьюер спрашивает: «Журнал из тысячи строк, одна повреждена. Что вернёт разбор журнала?»',
      [('Записи 999 верных строк и список ошибок с номером повреждённой строки: ValueError ловится на каждой строке', True, 'Верно. Ошибку строки ловят в цикле по журналу, и разбор идёт дальше. Глава 15.3, §4.'),
       ('Ничего: ValueError прерывает весь разбор', False, 'Так работает разбор без <code>try</code>, и это ошибка: 999 верных строк теряются. Глава 15.4, §1.'),
       ('Все 1000 записей, повреждённую — с пустыми полями', False, 'Повреждённую строку нельзя достроить догадкой: непонятно, какие поля верны.')]),
  ),
  dict(
    id='words', fn='reverse_words', title='Слова в обратном порядке', lc='LeetCode 151', lc_url='https://leetcode.com/problems/reverse-words-in-a-string/', chapter='только в тренажёре', form='tokens',
    heads=('s', 'Ответ'), label='список words',
    say='Дана строка из слов. Верните слова в обратном порядке.',
    retell='«Нужно переставить слова задом наперёд и разделить их одним пробелом».',
    ask=[
      ('Сколько пробелов между словами?', 'Сколько угодно, и по краям тоже.', 'Пробелов может быть много.', '<code>split()</code> без аргумента.'),
      ('Какие пробелы в ответе?', 'Ровно один между словами, по краям — нет.', 'В ответе один пробел.', '<code>\' \'.join</code>.'),
      ('Что, если слов нет?', 'Пустая строка.', 'Без слов — \'\'.', 'Тест <code>\'   \'</code>.'),
    ],
    examples=[
      (('  the sky  is blue ',), 'лишние пробелы'),
      (('the sky is blue',), 'пример из условия'),
      (('hello',), 'одно слово'),
      (('   ',), 'одни пробелы'),
      (('a good   example',), 'много пробелов внутри'),
    ],
    brute='Идти по строке с конца, собирать буквы слова и переворачивать каждое: тоже O(n), но с ручным учётом пробелов.',
    form_hint='Части разделены пробелами в любом количестве.',
    steps=[
      ('Слова', '<code>words = s.split()</code> — без пустых слов.'),
      ('Порядок', '<code>words.reverse()</code>.'),
      ('Сборка', '<code>\' \'.join(words)</code>.'),
    ],
    hand='',
    cx=CX_LINE + ('split, reverse и join проходят строку по разу. Список слов и ответ — O(n).',),
    start='''
def reverse_words(s):
    # Разделите на слова, разверните, соберите через пробел.
    return s
''',
    tests=_tests('reverse_words', [
      (('  the sky  is blue ',), 'blue is sky the', 'spaces', 'лишние пробелы'),
      (('hello',), 'hello', 'one', 'одно слово'),
      (('   ',), '', 'blank', 'одни пробелы'),
      (('a good   example',), 'example good a', 'inner', 'много пробелов внутри'),
    ]),
    call="print(reverse_words('  the sky  is blue '))",
    trace=('reverse_words', ''),
    follow=('Интервьюер спрашивает: «Что изменится, если написать s.split(\' \')?»',
      [('Пробелы подряд дадут пустые слова, и в ответе появятся лишние пробелы', True, 'Верно. <code>\'a  b\'.split(\' \')</code> — <code>[\'a\', \'\', \'b\']</code>. Без аргумента пустых слов нет.'),
       ('Ничего: оба вызова режут по пробелу', False, 'С аргументом split сохраняет пустые куски между разделителями. Глава 15.3, §1.'),
       ('Строка перестанет делиться на слова', False, 'Делиться будет, но вместе со словами появятся пустые строки.')]),
  ),
  dict(
    id='inplace', fn='compress_in_place', title='Сжатие в том же списке', lc='LeetCode 443', lc_url='https://leetcode.com/problems/string-compression/', chapter='только в тренажёре', form='write',
    heads=('chars', 'Ответ · список после вызова'), label='список chars', show_list=True,
    say='Дан список символов. Сожмите серии в этом же списке и верните длину ответа.',
    retell='«Нужно записать сжатую строку в начало того же списка, по символу в ячейку, и вернуть, сколько ячеек занято».',
    ask=[
      ('Можно ли создать новый список?', 'Нет, память O(1).', 'Ответ пишется в тот же список.', 'Указатель записи <code>write</code>.'),
      ('Как писать длину 12?', 'Двумя ячейками: «1» и «2».', 'Каждая цифра — отдельная ячейка.', '<code>for d in str(j - i)</code>.'),
      ('Что после ответа в списке?', 'Неважно, проверяется только начало.', 'Остаток списка не проверяется.', 'Вернуть <code>write</code>.'),
    ],
    examples=[
      ((['a', 'a', 'b', 'b', 'c', 'c', 'c'],), 'пример 1'),
      ((['a'],), 'один символ'),
      ((['a'] + ['b'] * 12,), 'серия длиннее 9'),
      ((['a', 'b', 'c'],), 'нет повторов'),
      ((['a', 'a', 'a', 'b', 'b', 'a', 'a'],), 'символ повторяется в разных сериях'),
    ],
    brute='Собрать ответ в новый список и скопировать обратно: O(n), но память O(n), а условие требует O(1).',
    form_hint='Ответ не длиннее прочитанного, поэтому его можно писать поверх уже прочитанных ячеек.',
    steps=[
      ('Серия', '<code>j</code> от <code>i</code> до конца серии.'),
      ('Запись', '<code>chars[write] = chars[i]</code>, затем цифры длины, если она больше 1, каждая с <code>write += 1</code>.'),
      ('Сдвиг', '<code>i = j</code>; в конце вернуть <code>write</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти',
        ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(n) по памяти', 'O(n log n) по времени, O(1) по памяти'],
        'i и j идут только вперёд, write не обгоняет i. Кроме индексов хранится только строка длины, O(log n) цифр.'),
    start='''
def compress_in_place(chars):
    write = 0
    i = 0
    # Для каждой серии запишите в chars[write] символ,
    # затем цифры длины, если она больше 1.
    return len(chars)
''',
    tests=_tests_inplace([
      (['a', 'a', 'b', 'b', 'c', 'c', 'c'], ['a', '2', 'b', '2', 'c', '3'], 'example', 'пример 1'),
      (['a'], ['a'], 'one', 'один символ'),
      (['a'] + ['b'] * 12, ['a', 'b', '1', '2'], 'long', 'серия длиннее 9'),
      (['a', 'a', 'a', 'b', 'b', 'a', 'a'], ['a', '3', 'b', '2', 'a', '2'], 'again', 'символ в разных сериях'),
    ]),
    call="chars = ['a', 'a', 'b', 'b', 'c', 'c', 'c']; n = compress_in_place(chars); print(n, chars[:n])",
    trace=('compress_in_place', ''),
    follow=('Интервьюер спрашивает: «Почему запись в тот же список не портит символы, которые ещё не прочитаны?»',
      [('Запись серии занимает не больше ячеек, чем сама серия: write никогда не обгоняет i', True, 'Верно. Серия длины 1 — одна ячейка, длины 2 — две, длины 12 — три. Запись всегда помещается в уже прочитанное.'),
       ('Портит, поэтому символы сначала копируют в новый список', False, 'Копия не нужна: запись не заходит на непрочитанные ячейки.'),
       ('Потому что список сортируется перед сжатием', False, 'Сортировка смешала бы серии: «aabaa» стала бы «aaaab».')]),
  ),
  dict(
    id='say', fn='count_and_say', title='Посчитай и скажи', lc='LeetCode 38', lc_url='https://leetcode.com/problems/count-and-say/', chapter='только в тренажёре', form='runs',
    heads=('n', 'Ответ'), label='строка s',
    say='Первый член последовательности — «1». Каждый следующий описывает предыдущий сериями: «одна единица» — «11», «две единицы» — «21». Верните n-й член.',
    retell='«Нужно n − 1 раз заменить строку описанием её серий: длина, потом цифра».',
    ask=[
      ('В каком порядке писать серию?', 'Сначала длина, потом цифра.', 'Длина перед цифрой.', '<code>str(j - i) + s[i]</code>.'),
      ('С какого n начинается?', 'n = 1 — «1».', 'Первый член — «1».', 'Цикл <code>range(n - 1)</code>.'),
      ('Бывают ли серии длиннее 3?', 'Нет, в этой последовательности не бывает.', 'Длина — одна цифра.', 'Особый случай для длинных серий не нужен.'),
    ],
    examples=[
      ((4,), 'пример из условия'),
      ((1,), 'первый член'),
      ((2,), 'одна единица'),
      ((5,), 'пятый член'),
      ((6,), 'шестой член'),
    ],
    brute='Других способов нет: каждый член строится из предыдущего. Перебор здесь и есть решение.',
    form_hint='Следующий член описывает серии предыдущего.',
    steps=[
      ('Начало', '<code>s = \'1\'</code>.'),
      ('Описание', 'Проход по сериям <code>s</code>: в <code>out</code> — <code>str(j - i) + s[i]</code>.'),
      ('Шаг', '<code>s = \'\'.join(out)</code>, и так n − 1 раз.'),
    ],
    hand='',
    cx=('O(L) по времени и памяти, L — суммарная длина всех членов до n-го',
        ['O(n) по времени, O(1) по памяти', 'O(n²) по времени, O(1) по памяти', 'O(2ⁿ) по времени, O(n) по памяти'],
        'Каждый член проходится один раз. Члены растут примерно в 1,3 раза за шаг, поэтому L определяется последними членами.'),
    start='''
def count_and_say(n):
    s = '1'
    # n - 1 раз замените s описанием её серий.
    return s
''',
    tests=_tests('count_and_say', [
      ((4,), '1211', 'example', 'пример из условия'),
      ((1,), '1', 'first', 'первый член'),
      ((2,), '11', 'second', 'одна единица'),
      ((5,), '111221', 'fifth', 'пятый член'),
      ((6,), '312211', 'sixth', 'шестой член'),
    ]),
    call='print(count_and_say(4))',
    trace=('count_and_say', ''),
    follow=('Интервьюер спрашивает: «Чем эта задача отличается от сжатия серий?»',
      [('Тот же проход по сериям, но длина пишется перед символом и всегда, даже 1', True, 'Верно. «1» в сжатии осталась бы «1», а здесь даёт «11».'),
       ('Здесь серии ищут с конца строки', False, 'Серии ищут слева направо, как в сжатии.'),
       ('Здесь нужен частотный словарь', False, 'Словарь потеряет порядок серий: у «1211» и «2111» частоты одинаковы.')]),
  ),
  dict(
    id='emails', fn='num_unique_emails', title='Разные адреса почты', lc='LeetCode 929', lc_url='https://leetcode.com/problems/unique-email-addresses/', chapter='только в тренажёре', form='split2',
    heads=('emails', 'Ответ'), label='',
    say='Дан список адресов почты. В имени точки не учитываются, а всё после «+» отбрасывается; в домене правила не действуют. Сколько разных адресов получат письма?',
    retell='«Нужно привести каждый адрес к одному виду по правилам и посчитать разные».',
    ask=[
      ('Правила действуют и в домене?', 'Нет, только в имени.', 'Домен не меняется.', 'Сначала разделить по <code>@</code>.'),
      ('Может ли «+» стоять в начале имени?', 'Нет, имя не начинается с «+».', 'Имя до «+» не пустое.', 'Отдельной проверки не нужно.'),
      ('Важен ли регистр?', 'Нет, адреса из строчных букв.', 'Нормализации регистра нет.', 'Сравнение как есть.'),
    ],
    examples=[
      ((['test.email+alex@leetcode.com', 'test.e.mail+bob.cathy@leetcode.com', 'testemail+david@lee.tcode.com'],), 'пример 1'),
      ((['a@leetcode.com', 'b@leetcode.com', 'c@leetcode.com'],), 'пример 2'),
      ((['a.b@x.com', 'ab@x.com'],), 'точка в имени'),
      ((['ab@x.com', 'ab@x.co.m'],), 'точка в домене'),
      ((['a+1@x.com', 'a+2@x.com', 'a@x.com'],), 'всё после «+»'),
    ],
    brute='Сравнивать каждый приведённый адрес со всеми предыдущими: O(m²) сравнений для m адресов.',
    form_hint='Адрес делится на имя и домен, а имя — ещё по «+».',
    steps=[
      ('Адрес', '<code>local, _, domain = email.partition(\'@\')</code>.'),
      ('Имя', '<code>local.split(\'+\')[0].replace(\'.\', \'\')</code>.'),
      ('Счёт', 'Добавить <code>local + \'@\' + domain</code> в множество, вернуть его размер.'),
    ],
    hand='',
    cx=('O(L) по времени и памяти, L — суммарная длина адресов',
        ['O(m²) по времени, O(1) по памяти', 'O(L log L) по времени, O(1) по памяти', 'O(m) по времени, O(1) по памяти'],
        'Каждый адрес обрабатывается за его длину, проверка в множестве — O(1) в среднем.'),
    start='''
def num_unique_emails(emails):
    seen = set()
    # Приведите каждый адрес к одному виду и добавьте в seen.
    return len(emails)
''',
    tests=_tests('num_unique_emails', [
      ((['test.email+alex@leetcode.com', 'test.e.mail+bob.cathy@leetcode.com', 'testemail+david@lee.tcode.com'],), 2, 'example', 'пример 1'),
      ((['a@leetcode.com', 'b@leetcode.com', 'c@leetcode.com'],), 3, 'all_diff', 'пример 2'),
      ((['a.b@x.com', 'ab@x.com'],), 1, 'dot', 'точка в имени'),
      ((['ab@x.com', 'ab@x.co.m'],), 2, 'domain_dot', 'точка в домене'),
    ]),
    call="print(num_unique_emails(['test.email+alex@leetcode.com', 'test.e.mail+bob.cathy@leetcode.com', 'testemail+david@lee.tcode.com']))",
    trace=('num_unique_emails', ''),
    follow=('Интервьюер спрашивает: «Почему нельзя сразу убрать все точки из адреса через email.replace(\'.\', \'\')?»',
      [('Точки в домене значимы: lee.tcode.com и leetcode.com — разные домены', True, 'Верно. Поэтому адрес сначала делят по «@», и правила применяют только к имени.'),
       ('Можно: точки нигде не учитываются', False, 'По условию правило про точки действует только в имени.'),
       ('Можно, если потом отбросить всё после «+»', False, 'Порядок действий не спасает: точки домена всё равно пропадут.')]),
  ),
  dict(
    id='key', fn='license_key', title='Формат лицензионного ключа', lc='LeetCode 482', lc_url='https://leetcode.com/problems/license-key-formatting/', chapter='только в тренажёре', form='groups',
    heads=('s, k', 'Ответ'), label='',
    say='Дан ключ с дефисами в случайных местах и число k. Перепишите ключ группами по k символов через дефис, буквы — заглавные. Первая группа может быть короче.',
    retell='«Нужно убрать старые дефисы, перевести буквы в верхний регистр и нарезать символы на группы по k так, чтобы короче была только первая».',
    ask=[
      ('Какая группа короче — первая или последняя?', 'Первая.', 'Неполная — первая группа.', 'Её длина — <code>len % k</code>, а если 0 — <code>k</code>.'),
      ('Что, если в ключе одни дефисы?', 'Пустая строка.', 'Без символов — \'\'.', 'Тест <code>\'---\'</code>.'),
      ('Буквы приводить к верхнему регистру?', 'Да.', 'Буквы заглавные.', '<code>upper()</code> при очистке.'),
    ],
    examples=[
      (('5F3Z-2e-9-w', 4), 'пример 1'),
      (('2-5g-3-J', 2), 'пример 2'),
      (('---', 3), 'одни дефисы'),
      (('a-a-a-a', 1), 'k = 1'),
      (('abc', 5), 'одна короткая группа'),
    ],
    brute='Вставлять дефисы в строку с конца каждые k символов: каждая вставка копирует строку, O(n² / k).',
    form_hint='Старые разделители не нужны: символы нарезаются заново.',
    steps=[
      ('Очистка', '<code>chars = [ch.upper() for ch in s if ch != \'-\']</code>.'),
      ('Первая группа', '<code>first = len(chars) % k or k</code>.'),
      ('Группы', 'Остальные — по k с позиции <code>first</code>; <code>\'-\'.join(groups)</code>.'),
    ],
    hand='',
    cx=CX_LINE + ('Очистка, нарезка и join проходят символы по разу.',),
    start='''
def license_key(s, k):
    chars = [ch.upper() for ch in s if ch != '-']
    # Нарежьте chars на группы: первая — len(chars) % k или k, остальные — по k.
    return ''.join(chars)
''',
    tests=_tests('license_key', [
      (('5F3Z-2e-9-w', 4), '5F3Z-2E9W', 'example', 'пример 1'),
      (('2-5g-3-J', 2), '2-5G-3J', 'short_first', 'первая группа короче'),
      (('---', 3), '', 'dashes', 'одни дефисы'),
      (('a-a-a-a', 1), 'A-A-A-A', 'k1', 'k = 1'),
    ]),
    call="print(license_key('5F3Z-2e-9-w', 4))",
    trace=('license_key', ''),
    follow=('Интервьюер спрашивает: «Зачем or k в first = len(chars) % k or k?»',
      [('Если символов ровно кратно k, остаток 0, а первая группа должна быть полной, а не пустой', True, 'Верно. Без <code>or k</code> у «5F3Z2E9W» при k = 4 первая группа была бы пустой, и ответ начался бы с дефиса.'),
       ('Чтобы не делить на ноль', False, 'k по условию не меньше 1, деления на ноль нет.'),
       ('Чтобы последняя группа была короче', False, 'Короче должна быть первая группа.')]),
  ),
  dict(
    id='last', fn='length_of_last_word', title='Длина последнего слова', lc='LeetCode 58', lc_url='https://leetcode.com/problems/length-of-last-word/', chapter='только в тренажёре', form='backscan',
    heads=('s', 'Ответ'), label='строка s',
    say='Дана строка из слов и пробелов. Верните длину последнего слова.',
    retell='«Нужно найти последнее слово, не считая пробелов в конце строки, и вернуть число его букв».',
    ask=[
      ('Бывают ли пробелы в конце?', 'Да, сколько угодно.', 'Пробелы в конце пропускаются.', 'Первый цикл с конца.'),
      ('Есть ли в строке хотя бы одно слово?', 'Да, по условию.', 'Слово всегда есть.', 'Ответ не меньше 1.'),
      ('Можно ли разделить всю строку на слова?', 'Можно, но нужна память O(1).', 'Память O(1).', 'Проход с конца без split.'),
    ],
    examples=[
      (('   fly me   to   the moon  ',), 'пробелы в конце'),
      (('Hello World',), 'пример 1'),
      (('luffy is still joyboy',), 'пример 3'),
      (('a',), 'одна буква'),
      (('day ',), 'одно слово и пробел'),
    ],
    brute='<code>len(s.split()[-1])</code>: O(n) по времени, но split строит список всех слов, O(n) по памяти.',
    form_hint='Ответ стоит в конце строки, читать её с начала не нужно.',
    steps=[
      ('Хвост', '<code>j</code> с конца, пока <code>s[j] == \' \'</code>.'),
      ('Слово', 'Пока <code>j &gt;= 0</code> и <code>s[j] != \' \'</code>: <code>length += 1</code>, <code>j -= 1</code>.'),
      ('Ответ', 'Вернуть <code>length</code>.'),
    ],
    hand='',
    cx=('O(n) по времени, O(1) по памяти',
        ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(n) по памяти', 'O(log n) по времени, O(1) по памяти'],
        'В худшем случае j проходит всю строку. Хранятся только j и length.'),
    start='''
def length_of_last_word(s):
    j = len(s) - 1
    # Пропустите пробелы в конце, затем посчитайте буквы слова.
    return 0
''',
    tests=_tests('length_of_last_word', [
      (('   fly me   to   the moon  ',), 4, 'tail', 'пробелы в конце'),
      (('Hello World',), 5, 'example', 'пример 1'),
      (('a',), 1, 'one', 'одна буква'),
      (('day ',), 3, 'one_word', 'одно слово и пробел'),
    ]),
    call="print(length_of_last_word('   fly me   to   the moon  '))",
    trace=('length_of_last_word', ''),
    follow=('Интервьюер спрашивает: «Зачем во втором цикле условие j >= 0?»',
      [('Если слово стоит в начале строки, j уходит в отрицательные индексы: Python читает строку с конца ещё раз, и выходит неверный ответ или IndexError', True, 'Верно. На «ab» без проверки цикл читает <code>s[-1]</code> и <code>s[-2]</code> — снова «b» и «a» — и падает на <code>s[-3]</code>.'),
       ('Не нужно: s[-1] — допустимый индекс, ответ не изменится', False, 'Индекс допустимый, но это последний символ строки: цикл начинает считать буквы заново.'),
       ('Не нужно: строка всегда начинается с пробела', False, 'В «Hello World» пробела в начале нет.')]),
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
  <title>15.6 Мок-интервью по задачам модуля · Алгоритмы на строках</title>
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
      <div class="spine"><span>Модуль 15 · Разбор · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Алгоритмы на строках</a> · модуль 15 · сжатие и разбор</p>
          <p class="running__folio">Глава 15.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">15.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на сжатие, разбор и построение строк в формате алгоритмической секции. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 13.6 и 14.6 и в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модуль 0 и главы 15.1–15.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Решать задачи на разбор строк в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из шести: проход по сериям, разбор в два уровня, разбиение на слова, запись в тот же список, нарезка на группы и проход с конца. Каждая встречается в задачах тренажёра. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 1446, 1108, 1859 — и задача домашнего задания LeetCode 8. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Сжатие и разбор строки события разобраны в главах 15.2 и 15.3, остальные шесть — только здесь. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Что разделяет части, что делать с повреждённым вводом, длинные серии, можно ли новый список, пустая строка.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустую строку и длинную серию.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названо, что считается частью строки, как собирается ответ и от чего зависит время.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 15.5 Практика и ДЗ</a><a href="../../massivy/16-mok-intervyu/index.html">Мок-интервью № 1 →</a></div>
        <div class="colophon">
          <span>Модуль 15 · Сжатие и разбор · ОП.04 · 3 курс</span>
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

