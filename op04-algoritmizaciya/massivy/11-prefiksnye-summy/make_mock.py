"""Собирает главу 11.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../10-okno-peremennoe/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m11traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m11 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m11)
REF = {k: _m11.SOURCES[k] for k in ('range_sums', 'pivot_index', 'count_k_sums', 'product_except_self',
                                    'ways_to_split', 'xor_queries', 'left_right_diff', 'nice_subarrays')}

FORMS = {
    'query': 'Префиксный массив и одна операция над двумя ячейками на запрос',
    'lr': 'Величина слева и величина справа от позиции за проход',
    'dict': 'Префиксная сумма и словарь встреченных сумм',
    'window': 'Окно переменного размера',
}

FORM_WHY = {
    'query': 'Префиксный массив строят один раз, когда к неизменному списку приходит много запросов на участок: каждый ответ — одна операция над двумя ячейками.',
    'lr': 'Величину слева накапливают по ходу прохода, величину справа получают из итога по всему списку или вторым проходом справа налево.',
    'dict': 'Словарь префиксных сумм нужен, когда считают все отрезки с точной суммой: для каждого конца ищут, сколько раз раньше встречалась сумма prefix − k.',
    'window': 'Окно переменного размера ищет лучший отрезок и на каждый конец держит одно начало. Здесь границы задаёт запрос, нужна величина для каждой позиции или нужно посчитать все отрезки — окно этого не даёт.',
}

STORE = [5, -2, 7, -4, 3, 6, -1, 2]


def _ok_raises(call):
    return f'''
    try:
        r = {call}
    except ValueError:
        return
    assert False, f"ожидалась ValueError, функция вернула {{r!r}}"'''


def _eq(call, want, doc):
    name = 'test_' + re.sub(r'\W+', '_', doc).strip('_')
    return f'''
def {name}():
    """{doc}"""
    r = {call}
    assert r == {want!r}, f"ожидалось {want!r}, получено {{r!r}}"
'''


def _tests(fn, cases):
    """Тесты песочницы по списку (аргументы, ожидаемый ответ, имя, описание)."""
    out = ''
    for args, want, name, doc in cases:
        call = f"{fn}({', '.join(repr(a) for a in args)})"
        out += f'''
def test_{name}():
    """{doc}"""
    r = {call}
    assert r == {want!r}, f"ожидалось {want!r}, получено {{r!r}}"
'''
    return out


CX_QUERY = ('O(n + q) по времени, O(n) по памяти',
            ['O(n·q) по времени, O(1) по памяти', 'O(n) по времени, O(1) по памяти', 'O(n log n + q) по времени, O(n) по памяти'])
CX_LR = ('O(n) по времени, O(1) дополнительной памяти',
         ['O(n²) по времени, O(1) дополнительной памяти', 'O(n) по времени, O(n) дополнительной памяти', 'O(n log n) по времени, O(1) дополнительной памяти'])
CX_DICT = ('O(n) по времени, O(n) по памяти',
           ['O(n²) по времени, O(1) по памяти', 'O(n) по времени, O(1) по памяти', 'O(n log n) по времени, O(n) по памяти'])


TASKS = [
  dict(
    id='range', fn='range_sums', title='Сервис сумм на диапазонах', lc='LeetCode 303', lc_url='https://leetcode.com/problems/range-sum-query-immutable/', chapter='11.2', form='query',
    heads=('nums, queries', 'Ответ'),
    say='Дан журнал склада — изменение числа коробок по дням — и список запросов. Каждый запрос — пара дней <code>(l, r)</code>. Для каждого запроса верните, на сколько изменился остаток за эти дни.',
    retell='«Для каждого запроса нужна сумма участка журнала. Журнал не меняется, запросов много».',
    ask=[
      ('Числа могут быть отрицательными?', 'Да, расход записан со знаком минус.', 'Числа любого знака.', 'Префиксным суммам знак не важен: ответ получается вычитанием.'),
      ('День r входит в запрос?', 'Нет: запрос (l, r) — дни с l по r − 1, как срез nums[l:r]. При l = r ответ 0.', 'Запрос — полуинтервал [l, r).', 'Ответ prefix[r] − prefix[l] без поправок на единицу.'),
      ('Сколько запросов и меняется ли журнал?', 'До ста тысяч, журнал не меняется.', 'Запросов много, список не меняется.', 'Подготовка один раз за O(n), ответ за O(1).'),
      ('Что делать с неверным запросом?', 'ValueError.', 'Нужно 0 ≤ l ≤ r ≤ len(nums), иначе ValueError.', 'Отрицательный индекс Python не остановит: проверка нужна в коде.'),
    ],
    examples=[
      ((STORE, [(2, 5), (0, 8), (3, 3)]), 'участок, весь журнал, пустой запрос'),
      ((STORE, [(0, 3)]), 'запрос с первого дня'),
      ((STORE, [(5, 8)]), 'запрос до последнего дня'),
      (([], [(0, 0)]), 'пустой журнал'),
      (([-3, -1, -2], [(0, 3), (1, 2)]), 'все числа отрицательные'),
    ],
    brute='На каждый запрос складывать числа участка заново: до n сложений на запрос, всего O(n·q).',
    form_hint='Список не меняется, запросов на сумму участка много.',
    steps=[
      ('Подготовка', '<code>prefix[i + 1] = prefix[i] + nums[i]</code>, ячеек n + 1, <code>prefix[0] = 0</code>.'),
      ('Проверка', '<code>0 &lt;= l &lt;= r &lt;= len(nums)</code>, иначе ValueError.'),
      ('Ответ', '<code>prefix[r] − prefix[l]</code>.'),
    ],
    hand='<div class="prefhand" data-a="[5,-2,7,-4,3,6,-1,2]" data-q="[[2,5],[0,3]]"></div>',
    cx=CX_QUERY + ('Подготовка — n сложений, каждый запрос — одно вычитание. Список prefix занимает n + 1 ячейку.',),
    start='''
def range_sums(nums, queries):
    prefix = [0] * (len(nums) + 1)
    # Заполните prefix: prefix[i + 1] = prefix[i] + nums[i].
    answers = []
    for l, r in queries:
        # Проверьте границы запроса и добавьте в answers сумму nums[l:r].
        pass
    return answers
''',
    tests=_tests('range_sums', [
      ((STORE, [(2, 5), (0, 8), (3, 3)]), [6, 16, 0], 'example', 'журнал склада, три запроса'),
      ((STORE, [(0, 3)]), [10], 'from_start', 'запрос с первого дня'),
      (([], [(0, 0)]), [0], 'empty_list', 'пустой журнал'),
      (([-3, -1, -2], [(0, 3), (1, 2)]), [-6, -1], 'negative', 'все числа отрицательные'),
    ]) + '''
def test_bad_query():
    """l = -1 — ValueError"""''' + _ok_raises('range_sums([5, -2, 7], [(-1, 2)])') + '\n',
    call='print(range_sums([5, -2, 7, -4, 3, 6, -1, 2], [(2, 5), (0, 8), (3, 3)]))',
    trace=('range', 'prefix'),
    follow=('Интервьюер добавляет: «Между запросами журнал иногда исправляют — меняют одно число». Что станет с решением?',
      [('После каждого исправления prefix придётся пересчитывать от этого дня до конца, O(n)', True, 'Верно. Изменение nums[i] меняет все prefix[i + 1], …, prefix[n], глава 11.1, §3. При частых исправлениях нужны дерево Фенвика или дерево отрезков — по КТП это за пределами курса.'),
       ('Ничего: prefix от чисел журнала не зависит', False, 'prefix составлен из чисел журнала: каждая ячейка — сумма первых i дней.'),
       ('Достаточно поменять одну ячейку prefix[i]', False, 'Число nums[i] входит во все суммы prefix[j] при j &gt; i, и все они устареют.')]),
  ),
  dict(
    id='pivot', fn='pivot_index', title='Равновесный индекс', lc='LeetCode 724', lc_url='https://leetcode.com/problems/find-pivot-index/', chapter='11.3', form='lr',
    heads=('nums', 'Ответ'),
    say='Дан список целых чисел. Найдите индекс, для которого сумма чисел левее него равна сумме чисел правее. Если таких несколько — самый левый, если нет — верните −1.',
    retell='«Нужен самый левый i, где сумма nums[:i] равна сумме nums[i + 1:]. Само nums[i] не входит ни в одну сумму. Нет — −1».',
    ask=[
      ('Числа могут быть отрицательными?', 'Да, любые целые.', 'Числа любого знака.', 'Суммы не монотонны, окно не подходит. Префиксы работают с любым знаком.'),
      ('Входит ли nums[i] в одну из сумм?', 'Нет, ни в левую, ни в правую.', 'nums[i] не входит в суммы.', 'right = total − left − nums[i].'),
      ('Какая сумма слева у индекса 0?', 'Левее нуля чисел нет, сумма 0.', 'Слева у индекса 0 — сумма 0.', 'left начинается с 0. Нужен пример с ответом 0.'),
      ('Что вернуть для пустого списка?', '−1.', 'Пустой список — −1.', 'Цикл не выполнится, функция вернёт −1 без отдельной проверки.'),
    ],
    examples=[
      (([1, 7, 3, 6, 5, 6],), 'пример из условия'),
      (([2, 1, -1],), 'ответ — индекс 0'),
      (([1, 2, 3],), 'индекса нет'),
      (([],), 'пустой список'),
      (([0, 0, 0],), 'несколько ответов, нужен самый левый'),
    ],
    brute='Для каждого индекса считать обе суммы заново, sum(nums[:i]) и sum(nums[i + 1:]): O(n²).',
    form_hint='Для каждой позиции нужны сумма слева и сумма справа.',
    steps=[
      ('Подготовка', '<code>total = sum(nums)</code>, <code>left = 0</code>.'),
      ('Сравнение', '<code>right = total − left − nums[i]</code>; если <code>left == right</code> — ответ i.'),
      ('Сдвиг', '<code>left += nums[i]</code> — после сравнения.'),
    ],
    hand='<div class="balance" data-a="[1,7,3,6,5,6]"></div>',
    cx=CX_LR + ('Один проход для total, второй для поиска. Хранятся только total, left и right.',),
    start='''
def pivot_index(nums):
    total = sum(nums)
    left = 0
    # Для каждого i посчитайте right, сравните с left, затем сдвиньте left.
    return -1
''',
    tests=_tests('pivot_index', [
      (([1, 7, 3, 6, 5, 6],), 3, 'example', 'пример из условия'),
      (([2, 1, -1],), 0, 'first_index', 'ответ — индекс 0'),
      (([1, 2, 3],), -1, 'none', 'индекса нет'),
      (([],), -1, 'empty', 'пустой список'),
      (([0, 0, 0],), 0, 'leftmost', 'самый левый из нескольких'),
    ]),
    call='print(pivot_index([1, 7, 3, 6, 5, 6]))',
    trace=('pivot', 'balance'),
    follow=('Интервьюер спрашивает: «Что изменится, если перенести left += nums[i] перед вычислением right?»',
      [('nums[i] попадёт в левую сумму до сравнения, ответы станут неверными', True, 'Верно. На примере из условия такая версия возвращает −1, а на [1, 2, 3] — 1, глава 11.3, §4.'),
       ('Ничего: порядок сложений не важен', False, 'Важен: при сравнении left должна быть суммой nums[:i], без самого nums[i].'),
       ('Функция станет быстрее', False, 'Число операций не меняется, меняется только то, что сравнивается.')]),
  ),
  dict(
    id='ksum', fn='count_k_sums', title='Отрезки с суммой k', lc='LeetCode 560', lc_url='https://leetcode.com/problems/subarray-sum-equals-k/', chapter='11.3', form='dict',
    heads=('nums, k', 'Ответ'),
    say='Дан список целых чисел и число <code>k</code>. Посчитайте, сколько отрезков подряд имеют сумму ровно <code>k</code>.',
    retell='«Нужно число непустых отрезков подряд с суммой ровно k. Числа и k — любые целые».',
    ask=[
      ('Числа бывают отрицательными?', 'Да.', 'Числа любого знака.', 'Окно переменного размера не подходит, глава 10.1, §3.'),
      ('Пустой отрезок считается?', 'Нет, только непустые.', 'Только непустые отрезки.', 'При k = 0 нужен тест: пустые отрезки не должны попасть в ответ.'),
      ('Одинаковые по числам отрезки в разных местах — разные?', 'Да, отрезок определяют его границы.', 'Отрезки различаются границами.', 'Словарь хранит, сколько раз встречалась каждая префиксная сумма.'),
      ('Каким может быть k?', 'Любым целым, в том числе 0 и отрицательным.', 'k — любое целое.', 'Нужны тесты с k = 0.'),
    ],
    examples=[
      (([1, -1, 2, 1, -2, 3], 2), 'отрицательные числа'),
      (([1, 1, 1], 2), 'пример из условия'),
      (([3, -3], 0), 'k = 0'),
      (([], 0), 'пустой список'),
      (([1, 2, 3], 7), 'отрезков нет'),
    ],
    brute='Для каждого начала накапливать сумму вправо и считать совпадения с k: O(n²).',
    form_hint='Нужно посчитать все отрезки с точной суммой, числа любого знака.',
    steps=[
      ('Префикс', '<code>prefix += nums[r]</code>.'),
      ('Подсчёт', '<code>count += seen.get(prefix − k, 0)</code> — отрезки с концом r.'),
      ('Запись', '<code>seen[prefix] += 1</code> — после подсчёта.'),
    ],
    hand='',
    cx=CX_DICT + ('Каждый конец — одно обращение к словарю и одна запись. В словаре до n + 1 разных сумм.',),
    start='''
def count_k_sums(nums, k):
    seen = {0: 1}
    prefix = 0
    count = 0
    # Для каждого конца r: обновите prefix, прибавьте к count число нужных префиксов, запишите prefix в seen.
    return count
''',
    tests=_tests('count_k_sums', [
      (([1, -1, 2, 1, -2, 3], 2), 4, 'example', 'отрицательные числа'),
      (([1, 1, 1], 2), 2, 'leetcode', 'пример из условия'),
      (([3, -3], 0), 1, 'k_zero', 'k = 0, пустые отрезки не считаются'),
      (([], 0), 0, 'empty', 'пустой список'),
      (([1, 2, 3], 7), 0, 'none', 'отрезков нет'),
    ]),
    call='print(count_k_sums([1, -1, 2, 1, -2, 3], 2))',
    trace=('ksum', ''),
    follow=('Что будет, если записывать prefix в seen до подсчёта?',
      [('При k = 0 посчитаются пустые отрезки, ответ станет больше', True, 'Верно. На [3, −3] при k = 0 такая версия возвращает 3 вместо 1, глава 11.4, §1. При k ≠ 0 она отвечает верно, поэтому нужен тест с k = 0.'),
       ('Ответ станет меньше на любом входе', False, 'При k ≠ 0 ответ не меняется: только что записанная сумма prefix не равна prefix − k.'),
       ('Появится KeyError', False, 'get возвращает 0 для отсутствующего ключа, исключения не будет.')]),
  ),
  dict(
    id='product', fn='product_except_self', title='Произведение всех, кроме себя', lc='LeetCode 238', lc_url='https://leetcode.com/problems/product-of-array-except-self/', chapter='11.3', form='lr',
    heads=('nums', 'Ответ'),
    say='Дан список целых чисел. Для каждой позиции верните произведение всех остальных чисел. Деление использовать нельзя.',
    retell='«answer[i] — произведение всех чисел, кроме nums[i]. Без деления, время O(n)».',
    ask=[
      ('Почему нельзя делить?', 'Так задано. К тому же в списке бывают нули.', 'Деление запрещено, нули возможны.', 'Нужны примеры с одним и с двумя нулями.'),
      ('Сколько в списке чисел?', 'Не меньше двух.', 'n ≥ 2.', 'Пустой список проверять не нужно.'),
      ('Числа бывают отрицательными?', 'Да.', 'Числа любого знака.', 'Знак произведения получается сам, отдельной обработки не нужно.'),
      ('Сколько дополнительной памяти можно взять?', 'Список ответа не считается, остальное — O(1).', 'Память O(1) кроме ответа.', 'Произведения слева пишутся прямо в answer, справа — в одну переменную.'),
    ],
    examples=[
      (([1, 2, 3, 4],), 'пример из условия'),
      (([-1, 1, 0, -3, 3],), 'один ноль'),
      (([0, 0, 5],), 'два нуля'),
      (([2, 3],), 'два числа'),
      (([-2, -3, 4],), 'отрицательные'),
    ],
    brute='Для каждой позиции перемножать все остальные числа: O(n²).',
    form_hint='Для каждой позиции нужны величина слева и величина справа, только здесь это произведения.',
    steps=[
      ('Слева', '<code>answer[i] = left</code>, затем <code>left *= nums[i]</code>.'),
      ('Справа', 'Проход справа налево: <code>answer[i] *= right</code>, затем <code>right *= nums[i]</code>.'),
    ],
    hand='',
    cx=CX_LR + ('Два прохода по списку. Кроме ответа хранятся только left и right.',),
    start='''
def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    # Первый проход: в answer[i] — произведение чисел левее i.
    # Второй проход справа налево: домножьте на произведение чисел правее i.
    return answer
''',
    tests=_tests('product_except_self', [
      (([1, 2, 3, 4],), [24, 12, 8, 6], 'example', 'пример из условия'),
      (([-1, 1, 0, -3, 3],), [0, 0, 9, 0, 0], 'one_zero', 'один ноль'),
      (([0, 0, 5],), [0, 0, 0], 'two_zeros', 'два нуля'),
      (([2, 3],), [3, 2], 'two_numbers', 'два числа'),
      (([-2, -3, 4],), [-12, -8, 6], 'negative', 'отрицательные'),
    ]),
    call='print(product_except_self([1, 2, 3, 4]))',
    trace=('product_except_self', ''),
    follow=('Интервьюер спрашивает: «Почему не перемножить весь список и не делить на nums[i]?»',
      [('Деление запрещено, а на позиции нуля пришлось бы делить на 0', True, 'Верно. В [−1, 1, 0, −3, 3] на позиции нуля деление невозможно. Произведения слева и справа деления не требуют.'),
       ('Деление медленнее умножения в O-нотации', False, 'Обе операции — O(1), дело не в скорости.'),
       ('Произведение всего списка всегда равно 0', False, 'Только если в списке есть ноль.')]),
  ),
  dict(
    id='split', fn='ways_to_split', title='Разрезы с тяжёлой левой частью', lc='LeetCode 2270', lc_url='https://leetcode.com/problems/number-of-ways-to-split-array/', chapter='только в тренажёре', form='lr',
    heads=('nums', 'Ответ'),
    say='Дан список целых чисел. Разрез после индекса <code>i</code> делит его на левую часть — числа с 0 по i — и правую, в ней хотя бы одно число. Посчитайте, во скольких разрезах сумма левой части не меньше суммы правой.',
    retell='«Для каждого i от 0 до n − 2 сравнить sum(nums[:i + 1]) и sum(nums[i + 1:]) и посчитать случаи, где левая не меньше».',
    ask=[
      ('Числа бывают отрицательными?', 'Да.', 'Числа любого знака.', 'Суммы считаются точно, знак чисел решению не мешает.'),
      ('Равенство сумм подходит?', 'Да, «не меньше».', 'Равенство подходит.', 'Знак <code>&gt;=</code>. Нужен пример с равными частями.'),
      ('Правая часть может быть пустой?', 'Нет, разрез после последнего числа не считается.', 'i от 0 до n − 2.', 'Цикл по <code>range(len(nums) - 1)</code>.'),
      ('Сколько чисел в списке?', 'Не меньше двух.', 'n ≥ 2.', 'Хотя бы один разрез есть.'),
    ],
    examples=[
      (([10, 4, -8, 7],), 'пример 1 из условия'),
      (([2, 3, 1, 0],), 'пример 2 из условия'),
      (([1, 1],), 'равные части'),
      (([-5, 1],), 'левая часть меньше'),
      (([0, 0, 0],), 'нули'),
    ],
    brute='Для каждого разреза считать обе суммы заново: O(n²).',
    form_hint='Для каждого разреза нужны сумма слева и сумма справа.',
    steps=[
      ('Подготовка', '<code>total = sum(nums)</code>, <code>left = 0</code>.'),
      ('Разрез', '<code>left += nums[i]</code>; сумма правой части — <code>total − left</code>.'),
      ('Подсчёт', 'Если <code>left &gt;= total − left</code> — разрез подходит.'),
    ],
    hand='',
    cx=CX_LR + ('Один проход для total, второй по разрезам. Хранятся total, left и count.',),
    start='''
def ways_to_split(nums):
    total = sum(nums)
    left = 0
    count = 0
    # Для каждого разреза после индекса i, кроме последнего, сравните left и total - left.
    return count
''',
    tests=_tests('ways_to_split', [
      (([10, 4, -8, 7],), 2, 'example_1', 'пример 1 из условия'),
      (([2, 3, 1, 0],), 2, 'example_2', 'пример 2 из условия'),
      (([1, 1],), 1, 'equal', 'равные части'),
      (([-5, 1],), 0, 'left_less', 'левая часть меньше'),
      (([0, 0, 0],), 2, 'zeros', 'нули'),
    ]),
    call='print(ways_to_split([10, 4, -8, 7]))',
    trace=('ways_to_split', ''),
    follow=('Что будет, если цикл пройдёт по всем индексам, range(len(nums))?',
      [('Посчитается разрез с пустой правой частью', True, 'Верно. После последнего числа left = total, справа 0. На [10, 4, −8, 7] такой разрез засчитается, и ответ станет 3 вместо 2.'),
       ('Возникнет IndexError', False, 'nums[n − 1] существует, исключения не будет. Ответ просто станет неверным.'),
       ('Ничего не изменится', False, 'На [10, 4, −8, 7] ответ станет 3 вместо 2: сумма всего списка 13 не меньше 0.')]),
  ),
  dict(
    id='xor', fn='xor_queries', title='XOR на участках', lc='LeetCode 1310', lc_url='https://leetcode.com/problems/xor-queries-of-a-subarray/', chapter='только в тренажёре', form='query',
    heads=('arr, queries', 'Ответ'),
    say='Дан список неотрицательных целых чисел <code>arr</code> и запросы <code>[l, r]</code>. Для каждого запроса верните XOR чисел с <code>arr[l]</code> по <code>arr[r]</code> включительно.',
    retell='«Для каждого запроса — arr[l] ^ arr[l + 1] ^ … ^ arr[r], оба конца включительно».',
    ask=[
      ('Правый конец входит в запрос?', 'Да, оба конца включительно.', 'Запрос [l, r] включительно.', 'Ответ prefix[r + 1] ^ prefix[l] — та же поправка, что в LeetCode 303.'),
      ('Что такое XOR?', 'Побитовое исключающее ИЛИ, в Python — оператор ^.', 'XOR — оператор ^.', 'Нужны два свойства: x ^ x = 0 и x ^ 0 = x.'),
      ('Запросы бывают неверными?', 'Нет, 0 ≤ l ≤ r &lt; len(arr).', 'Запросы верные.', 'Проверку границ можно не писать.'),
      ('Сколько запросов?', 'До 30 000, массив не меняется.', 'Запросов много, массив не меняется.', 'Подготовка O(n), каждый ответ O(1).'),
    ],
    examples=[
      (([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]), 'пример 1 из условия'),
      (([4, 8, 2, 10], [[2, 3], [1, 3], [0, 0], [0, 3]]), 'пример 2 из условия'),
      (([5], [[0, 0]]), 'одно число'),
      (([7, 7], [[0, 1]]), 'одинаковые числа'),
      (([0, 0, 0], [[0, 2], [1, 1]]), 'нули'),
    ],
    brute='На каждый запрос применять XOR ко всем числам участка: O(n·q).',
    form_hint='Массив не меняется, запросов на участок много, а у XOR есть обратная операция — он сам.',
    steps=[
      ('Подготовка', '<code>prefix[i + 1] = prefix[i] ^ arr[i]</code>.'),
      ('Ответ', '<code>prefix[r + 1] ^ prefix[l]</code>: числа левее l входят в обе ячейки и дают 0.'),
    ],
    hand='',
    cx=CX_QUERY + ('Подготовка — n операций XOR, каждый запрос — одна. Список prefix занимает n + 1 ячейку.',),
    start='''
def xor_queries(arr, queries):
    prefix = [0] * (len(arr) + 1)
    # Заполните prefix: prefix[i + 1] = prefix[i] ^ arr[i].
    answers = []
    for l, r in queries:
        # Добавьте XOR чисел arr[l], ..., arr[r].
        pass
    return answers
''',
    tests=_tests('xor_queries', [
      (([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]), [2, 7, 14, 8], 'example_1', 'пример 1 из условия'),
      (([4, 8, 2, 10], [[2, 3], [1, 3], [0, 0], [0, 3]]), [8, 0, 4, 4], 'example_2', 'пример 2 из условия'),
      (([5], [[0, 0]]), [5], 'one', 'одно число'),
      (([7, 7], [[0, 1]]), [0], 'same', 'одинаковые числа'),
    ]),
    call='print(xor_queries([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]))',
    trace=('xor_queries', 'prefix1'),
    follow=('Интервьюер спрашивает: «А если вместо XOR нужен максимум на участке?»',
      [('Префиксы не помогут: у максимума нет обратной операции', True, 'Верно. Глава 11.1, §3: из максимума первых r + 1 чисел и максимума первых l чисел максимум участка не получить.'),
       ('Достаточно заменить ^ на max', False, 'Формула работает потому, что XOR отменяет сам себя. max ничего не отменяет.'),
       ('Нужно отсортировать массив', False, 'Сортировка перемешает позиции, и участки [l, r] потеряют смысл.')]),
  ),
  dict(
    id='diff', fn='left_right_diff', title='Разность сумм слева и справа', lc='LeetCode 2574', lc_url='https://leetcode.com/problems/left-and-right-sum-differences/', chapter='только в тренажёре', form='lr',
    heads=('nums', 'Ответ'),
    say='Дан список целых чисел. Для каждой позиции <code>i</code> верните модуль разности между суммой чисел левее <code>i</code> и суммой чисел правее <code>i</code>.',
    retell='«answer[i] = |sum(nums[:i]) − sum(nums[i + 1:])| для каждого i».',
    ask=[
      ('Какая сумма слева у индекса 0 и справа у последнего?', 'Обе 0: чисел там нет.', 'Пустая сторона — сумма 0.', 'left начинается с 0, right у последнего индекса получается 0 сам.'),
      ('Входит ли nums[i] в суммы?', 'Нет.', 'nums[i] не входит.', 'right = total − left − nums[i].'),
      ('Числа бывают отрицательными?', 'В LeetCode числа положительные, но решение не должно от этого зависеть.', 'Числа любого знака.', 'abs берёт модуль, знак разности не важен.'),
      ('Сколько чисел?', 'Хотя бы одно.', 'n ≥ 1.', 'Пример с одним числом: ответ [0].'),
    ],
    examples=[
      (([10, 4, 8, 3],), 'пример 1 из условия'),
      (([1],), 'пример 2: одно число'),
      (([5, 5],), 'два равных числа'),
      (([-2, 3, -1],), 'отрицательные'),
      (([0, 0, 0],), 'нули'),
    ],
    brute='Для каждой позиции считать обе суммы заново: O(n²).',
    form_hint='Для каждой позиции нужны сумма слева и сумма справа.',
    steps=[
      ('Подготовка', '<code>total = sum(nums)</code>, <code>left = 0</code>.'),
      ('Позиция', '<code>right = total − left − nums[i]</code>, в ответ — <code>abs(left − right)</code>.'),
      ('Сдвиг', '<code>left += nums[i]</code>.'),
    ],
    hand='',
    cx=CX_LR + ('Один проход для total, второй по позициям. Кроме ответа хранятся total, left и right.',),
    start='''
def left_right_diff(nums):
    total = sum(nums)
    left = 0
    answer = []
    # Для каждого i: right = total - left - nums[i], добавьте |left - right|, сдвиньте left.
    return answer
''',
    tests=_tests('left_right_diff', [
      (([10, 4, 8, 3],), [15, 1, 11, 22], 'example_1', 'пример 1 из условия'),
      (([1],), [0], 'one', 'одно число'),
      (([5, 5],), [5, 5], 'two_equal', 'два равных числа'),
      (([-2, 3, -1],), [2, 1, 1], 'negative', 'отрицательные'),
    ]),
    call='print(left_right_diff([10, 4, 8, 3]))',
    trace=('left_right_diff', 'balance'),
    follow=('Что изменится, если вместо abs(left - right) записать left - right?',
      [('Там, где справа больше, ответ станет отрицательным', True, 'Верно. На [10, 4, 8, 3] в позиции 0 получится 0 − 15 = −15 вместо 15.'),
       ('Ничего: левая сумма всегда больше правой', False, 'В начале списка левая сумма маленькая, а правая большая.'),
       ('Возникнет исключение', False, 'Вычитание целых чисел исключений не даёт.')]),
  ),
  dict(
    id='nice', fn='nice_subarrays', title='Отрезки с k нечётными', lc='LeetCode 1248', lc_url='https://leetcode.com/problems/count-number-of-nice-subarrays/', chapter='только в тренажёре', form='dict',
    heads=('nums, k', 'Ответ'),
    say='Дан список целых чисел и число <code>k</code>. Посчитайте, сколько отрезков подряд содержат ровно <code>k</code> нечётных чисел.',
    retell='«Нужно число отрезков подряд, в которых нечётных чисел ровно k».',
    ask=[
      ('Каким бывает k?', 'От 1 до длины списка.', '1 ≤ k ≤ n.', 'При k ≥ 1 пустые отрезки в ответ не попадут.'),
      ('Числа бывают отрицательными?', 'В LeetCode — нет, но решение не должно от этого зависеть.', 'Числа любого знака.', 'В Python −3 % 2 == 1, нечётность определяется верно.'),
      ('Важны сами значения или только чётность?', 'Только чётность.', 'Важна только чётность.', 'Если нечётное заменить на 1, а чётное на 0, получится задача «отрезки с суммой k».'),
      ('Отрезки различаются границами?', 'Да.', 'Отрезки различаются границами.', 'В словаре хранится число встреч, а не факт.'),
    ],
    examples=[
      (([1, 1, 2, 1, 1], 3), 'пример 1 из условия'),
      (([2, 4, 6], 1), 'нечётных нет'),
      (([2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2), 'пример 3: чётные числа по краям'),
      (([1], 1), 'одно число'),
      (([-3, 2, 5], 2), 'отрицательное нечётное'),
    ],
    brute='Для каждого начала идти вправо и считать нечётные: O(n²).',
    form_hint='Нужно посчитать все отрезки с точным количеством. После замены нечётных на 1 это отрезки с суммой k.',
    steps=[
      ('Префикс', '<code>odd += nums[r] % 2</code>.'),
      ('Подсчёт', '<code>count += seen.get(odd − k, 0)</code>.'),
      ('Запись', '<code>seen[odd] += 1</code>.'),
    ],
    hand='',
    cx=CX_DICT + ('Каждый конец — одно обращение к словарю и одна запись. Разных значений odd не больше n + 1.',),
    start='''
def nice_subarrays(nums, k):
    seen = {0: 1}
    odd = 0
    count = 0
    # Для каждого r: обновите odd, прибавьте к count число нужных префиксов, запишите odd в seen.
    return count
''',
    tests=_tests('nice_subarrays', [
      (([1, 1, 2, 1, 1], 3), 2, 'example_1', 'пример 1 из условия'),
      (([2, 4, 6], 1), 0, 'no_odd', 'нечётных нет'),
      (([2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2), 16, 'example_3', 'пример 3 из условия'),
      (([-3, 2, 5], 2), 1, 'negative', 'отрицательное нечётное'),
    ]),
    call='print(nice_subarrays([1, 1, 2, 1, 1], 3))',
    trace=('nice_subarrays', ''),
    follow=('Интервьюер замечает: «У задачи на LeetCode есть метка Sliding Window». Подойдёт ли окно из модуля 10 как есть — сжимать, пока нечётных больше k, и считать окно, если их ровно k?',
      [('Нет: на каждый конец оно находит один отрезок, а их бывает несколько', True, 'Верно. На примере 3 такое окно насчитывает 4 вместо 16: чётные числа слева можно брать или не брать, и у одного конца несколько подходящих начал. На примере 1 оно случайно отвечает верно, 2. Словарь считает все начала сразу.'),
       ('Да, ответ совпадёт на любом входе', False, 'На примере 3 окно насчитывает 4, а верный ответ 16.'),
       ('Нет: окно не работает с нечётными числами', False, 'Окну чётность не мешает. Дело в том, что отрезков с одним концом бывает несколько.')]),
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
      'len', 'range', 'sorted', 'max', 'str', 'is', 'sum', 'abs'}


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
    hand = ''
    if t['hand']:
        lead = ('Посчитайте префиксы руками и ответьте на запросы: для каждого щёлкните две ячейки prefix. Неверный ответ не принимается, вместо него появляется объяснение.'
                if 'prefhand' in t['hand'] else 'Пройдите список руками: на каждом индексе введите сумму справа и сравните её с суммой слева.')
        hand = f'<p>{lead}</p>{t["hand"]}'
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
            <div class="tracer" data-trace="{key}" data-zone="{zone}" data-title="{E(t["title"])}"></div>
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
  <title>11.6 Мок-интервью по задачам модуля · Алгоритмы на массивах</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Literata:ital,opsz,wght@0,7..72,600;0,7..72,700;1,7..72,400&family=Pixelify+Sans:wght@500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../algo.css">
</head>
<body>
  <!-- Страница собрана скриптом make_mock.py: править описания задач там. -->
  <div class="book">
    <div class="book__body">
      <div class="spine"><span>Модуль 11 · Префиксные суммы · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Алгоритмы на массивах</a> · модуль 11 · префиксные суммы</p>
          <p class="running__folio">Глава 11.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">11.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на префиксные суммы в формате алгоритмической секции. Каждая проходит этапы алгоритмической секции по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 8.6, 9.6 и 10.6.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Главы 11.1–11.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Решать задачи на префиксные суммы в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из четырёх: префиксный массив с ответом на запрос из двух ячеек, величина слева и справа за проход, префиксная сумма со словарём или окно переменного размера из модуля 10. Первые три — формы префиксных сумм из глав 11.2 и 11.3, четвёртая проверяет, что окно не берут по привычке. В последнем этапе эталонное решение проходится по шагам, и интервьюер задаёт вопрос, который меняет условие.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 525, 974 и 304 — и задача домашнего задания LeetCode 2559. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. Первые четыре разобраны в главах модуля, остальные четыре — только здесь. В задаче LeetCode 1310 вместо суммы — XOR, а в LeetCode 1248 суммы в условии нет: её получают, заменив нечётные числа единицами. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Условие пересказано до вопросов</b>В пересказе названы вход, что считается для участка или позиции и что вернуть.</span></div>
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Про знак чисел, включён ли правый конец запроса, k = 0, пустой вход.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустой вход и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названо, что считается заранее, что хранится и какая формула даёт ответ.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 11.5 Практика и ДЗ</a><a href="../index.html">К оглавлению →</a></div>
        <div class="colophon">
          <span>Модуль 11 · Префиксные суммы · ОП.04 · 3 курс</span>
          <span class="author-line">Автор: Макаров Максим Николаевич</span>
        </div>
      </main>
    </div>
  </div>
  <script src="traces.js"></script>
  <script src="../book.js"></script>
  <script src="../algo.js"></script>
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

