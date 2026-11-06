"""Собирает главу 17.6 «Мок-интервью» из описаний задач ниже.

Код этапов и проверки взят из ../19-mnozhestva/make_mock.py, задачи и текст страницы — свои.
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
_spec = _ilu.spec_from_file_location('m20traces', _pl.Path(__file__).resolve().parent / 'make_traces.py')
_m20 = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_m20)

REF = {k: _m20.SOURCES[k] for k in ('lru_ops', 'serve', 'find_prices', 'hashmap_ops',
                                    'timemap_ops', 'freq_tracker_ops', 'auth_ops', 'shorten_all')}

# Эталоны используют OrderedDict, bisect_right и load из окружения make_traces.py.
import builtins as _bi
_bi.load = _m20.load

FORMS = {
    'order': 'Словарь и порядок обращений: OrderedDict',
    'dict': 'Словарь как готовый ответ: индекс или кэш',
    'buckets': 'Список корзин вместо dict',
    'dict_lists': 'Словарь списков и двоичный поиск',
    'two_dicts': 'Два словаря, которые держат друг друга в согласии',
    'expiry': 'Словарь «ключ → время истечения»',
}

FORM_WHY = {
    'order': 'OrderedDict берут, когда кроме поиска по ключу нужен порядок обращений: перенос в конец и удаление первого — O(1).',
    'dict': 'Словарь как готовый ответ берут, когда запросы повторяются: индекс строится заранее, кэш заполняется при промахах.',
    'buckets': 'Список корзин берут, когда словарь использовать нельзя: ключ попадает в корзину по остатку, внутри корзины — короткий перебор.',
    'dict_lists': 'Словарь списков берут, когда у ключа много значений во времени. Значения приходят по возрастанию времени, поэтому список отсортирован и ищется двоичным поиском.',
    'two_dicts': 'Два словаря берут, когда нужно отвечать на два разных вопроса за O(1): «сколько раз x» и «есть ли частота f», «код по ссылке» и «ссылка по коду».',
    'expiry': 'Словарь «ключ → время истечения» берут, когда записи живут ограниченное время: продление — перезапись, проверка — сравнение со временем.',
}

CX_HASH = ('O(1) в среднем на операцию, O(n) памяти',
           ['O(n) на операцию, O(1) памяти', 'O(log n) на операцию, O(n) памяти', 'O(n²) на все операции, O(1) памяти'])


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
    id='lru', fn='lru_ops', title='LRU-кэш', lc='LeetCode 146', lc_url='https://leetcode.com/problems/lru-cache/', chapter='20.3', form='order',
    heads=('capacity, ops', 'Ответы get'), label='операции',
    say='Реализуйте LRU-кэш ёмкости capacity: get(key) и put(key, value) за O(1). Промах get — −1.',
    retell='«Кэш на capacity ключей; при переполнении вытесняется ключ, к которому дольше всех не обращались».',
    ask=[
      ('Запись — тоже обращение?', 'Да.', 'put делает ключ свежим.', 'move_to_end в put для существующего ключа.'),
      ('Обновление вытесняет?', 'Нет.', 'Проверка размера после записи.', '<code>len(cache) &gt; capacity</code> после присваивания.'),
      ('Что вернуть при промахе?', '−1, значения неотрицательные.', 'Промах — −1.', 'Как на LeetCode.'),
      ('Какое время?', 'O(1) на операцию.', 'Без списка порядка.', 'OrderedDict.'),
    ],
    examples=[
      ((2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2), ('put', 4, 4), ('get', 1), ('get', 3), ('get', 4)]), 'пример LeetCode'),
      ((2, [('put', 1, 1), ('put', 2, 2), ('put', 1, 10), ('put', 3, 3), ('get', 1), ('get', 2)]), 'обновление делает свежим'),
      ((2, [('put', 1, 1), ('put', 2, 2), ('put', 2, 20), ('get', 1)]), 'обновление не вытесняет'),
      ((1, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 2)]), 'ёмкость 1'),
      ((2, [('get', 7)]), 'промах в пустом'),
    ],
    brute='Хранить порядок в списке ключей: перенос — remove, O(capacity) на операцию.',
    form_hint='Кроме поиска по ключу нужен порядок обращений, и меняется он при каждой операции.',
    steps=[
      ('get', 'Промах — −1; попадание — <code>move_to_end</code> и значение.'),
      ('put', 'Существующий ключ — <code>move_to_end</code>; затем запись.'),
      ('Вытеснение', 'Если ключей больше capacity — <code>popitem(last=False)</code>.'),
    ],
    hand='<p>Пройдите операции на схеме кэша.</p><div class="lru" data-cap="2" data-ops=\'["put 1", "put 2", "get 1", "put 3", "get 2", "put 4", "get 1", "get 3", "get 4"]\' data-title="LRU на 2 ключа"></div>',
    cx=('O(1) в среднем на get и put, O(capacity) памяти',
        ['O(capacity) на операцию, O(capacity) памяти', 'O(log capacity) на операцию', 'O(1) на операцию, O(1) памяти'],
        'Поиск в словаре, перенос и удаление узла цепочки — по O(1). Хранится не больше capacity ключей.'),
    start='''
from collections import OrderedDict

def lru_ops(capacity, ops):
    cache = OrderedDict()
    out = []
    # Для ('get', key) — ответ в out; для ('put', key, value) — запись и вытеснение.
    return out
''',
    tests=_tests('lru_ops', [
      ((2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2), ('put', 4, 4), ('get', 1), ('get', 3), ('get', 4)]), [1, -1, -1, 3, 4], 'example', 'пример LeetCode'),
      ((2, [('put', 1, 1), ('put', 2, 2), ('put', 1, 10), ('put', 3, 3), ('get', 1), ('get', 2)]), [10, -1], 'update_use', 'обновление делает свежим'),
      ((2, [('put', 1, 1), ('put', 2, 2), ('put', 2, 20), ('get', 1)]), [1], 'update_no_evict', 'обновление не вытесняет'),
      ((1, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 2)]), [-1, 2], 'cap1', 'ёмкость 1'),
    ]),
    call="print(lru_ops(2, [('put', 1, 1), ('put', 2, 2), ('get', 1), ('put', 3, 3), ('get', 2)]))",
    trace=('mock_lru', ''),
    follow=('Интервьюер спрашивает: «OrderedDict брать нельзя. Как сохранить O(1)?»',
      [('Словарь «ключ → узел» и двусвязный список узлов с ограничителями: перенос и удаление — смена ссылок', True, 'Верно. Это углубление из главы 20.3, §3.'),
       ('Словарь и список ключей, но удалять через pop(0)', False, 'pop(0) сдвигает весь список, O(n). И перенос из середины тоже O(n).'),
       ('Обычный словарь и сортировка по времени обращения при вытеснении', False, 'Сортировка — O(n log n) на каждое вытеснение.')]),
  ),
  dict(
    id='serve', fn='serve', title='Кэш с подсчётом попаданий', lc='задача модуля', lc_url='', chapter='20.2', form='dict',
    heads=('requests', 'Попадания и промахи'), label='запросы',
    say='Есть медленная функция load(key). Обслужите поток запросов так, чтобы load вызывалась для каждого ключа один раз, и верните (попадания, промахи).',
    retell='«Кэшировать ответы load и посчитать, сколько запросов обошлись без неё».',
    ask=[
      ('Ограничен ли кэш?', 'Нет.', 'Кэш без ёмкости.', 'Обычный словарь.'),
      ('Бывают ли значения None или 0?', 'Да.', 'Попадание — по ключу.', '<code>key in cache</code>, а не проверка значения.'),
      ('Что вернуть для пустого потока?', '(0, 0).', 'Пустой поток.', 'Тест <code>[]</code>.'),
    ],
    examples=[
      ((['болт', 'болт', 'гайка', 'болт'],), 'пример'),
      ((['a', 'b', 'c'],), 'все разные'),
      ((['x'] * 5,), 'один ключ'),
      (([],), 'пустой поток'),
      ((['', ''],), 'пустой ключ'),
    ],
    brute='Вызывать load на каждый запрос: столько медленных вызовов, сколько запросов.',
    form_hint='Запросы повторяются, а ответ на каждый дорогой.',
    steps=[
      ('Проверка', '<code>if key in cache</code> — попадание.'),
      ('Промах', '<code>cache[key] = load(key)</code>, промахов +1.'),
      ('Ответ', '<code>(hits, misses)</code>.'),
    ],
    hand='',
    cx=('O(n) на поток в среднем, O(d) памяти, d — разных ключей',
        ['O(n²) на поток, O(1) памяти', 'O(n log n) на поток, O(n) памяти', 'O(d) на поток, O(1) памяти'],
        'Каждый запрос — одна проверка в словаре; load вызывается d раз.'),
    start='''
def load(key):
    return len(key) * 10     # медленная загрузка из базы

def serve(requests):
    cache = {}
    hits = misses = 0
    # Попадание — hits += 1; промах — misses += 1 и cache[key] = load(key).
    return hits, misses
''',
    tests=_tests('serve', [
      ((['болт', 'болт', 'гайка', 'болт'],), (2, 2), 'example', 'пример'),
      ((['a', 'b', 'c'],), (0, 3), 'distinct', 'все разные'),
      ((['x'] * 5,), (4, 1), 'one_key', 'один ключ'),
      ((['', ''],), (1, 1), 'empty_key', 'пустой ключ'),
    ]),
    call="print(serve(['болт', 'болт', 'гайка', 'болт']))",
    trace=('mock_serve', ''),
    follow=('Интервьюер спрашивает: «Ключей — миллионы, память кончается. Что изменить?»',
      [('Ограничить ёмкость и вытеснять по LRU: популярные ключи останутся, редкие уйдут', True, 'Верно. В замере главы 20.1 кэш на 50 ответов из 1000 обслужил почти половину запросов.'),
       ('Очищать кэш целиком каждые N запросов', False, 'Так тоже можно, но после очистки все популярные ключи снова станут промахами.'),
       ('Хранить ключи в списке вместо словаря', False, 'Память почти та же, а проверка станет O(n).')]),
  ),
  dict(
    id='prices', fn='find_prices', title='Цены по индексу', lc='задача модуля', lc_url='', chapter='20.2', form='dict',
    heads=('records, queries', 'Цены'), label='запросы',
    say='Дан список товаров и список запросов кодов. Для каждого запроса верните цену или None, если такого кода нет.',
    retell='«Построить индекс «код → цена» и ответить на каждый запрос за O(1)».',
    ask=[
      ('Коды уникальны?', 'Да.', 'Повторов в товарах нет.', 'Простая запись в индекс.'),
      ('Если кода нет?', 'None.', 'Отсутствие — None.', '<code>index.get(code)</code>.'),
      ('Сколько запросов?', 'Много, до 10⁵.', 'Индекс окупается.', 'Не перебирать список на каждый запрос.'),
    ],
    examples=[
      (([{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}], ['гайка', 'винт', 'болт']), 'пример'),
      (([], ['болт']), 'товаров нет'),
      (([{'code': 'a', 'price': 0}], ['a']), 'цена 0'),
      (([{'code': 'a', 'price': 1}], []), 'запросов нет'),
      (([{'code': 'a', 'price': 1}], ['a', 'a']), 'повтор запроса'),
    ],
    brute='Для каждого запроса перебирать список товаров: O(n · q).',
    form_hint='По одному полю много раз ищут запись.',
    steps=[
      ('Индекс', '<code>index[rec[\'code\']] = rec[\'price\']</code> для каждого товара.'),
      ('Ответы', '<code>index.get(code)</code> для каждого запроса.'),
      ('Ответ', 'Список цен в порядке запросов.'),
    ],
    hand='',
    cx=('O(n + q) в среднем, O(n) памяти',
        ['O(n · q), O(1) памяти', 'O(q log n), O(1) памяти', 'O(n log n + q), O(n) памяти'],
        'Индекс — один проход, O(n); каждый запрос — O(1).'),
    start='''
def find_prices(records, queries):
    index = {}
    # Постройте индекс и ответьте на запросы.
    return [None] * len(queries)
''',
    tests=_tests('find_prices', [
      (([{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}], ['гайка', 'винт', 'болт']), [5, None, 12], 'example', 'пример'),
      (([{'code': 'a', 'price': 0}], ['a']), [0], 'zero', 'цена 0'),
      (([{'code': 'a', 'price': 1}], ['a', 'a']), [1, 1], 'repeat', 'повтор запроса'),
      (([], ['болт']), [None], 'no_goods', 'товаров нет'),
    ]),
    call="print(find_prices([{'code': 'болт', 'price': 12}, {'code': 'гайка', 'price': 5}], ['гайка', 'винт', 'болт']))",
    trace=('mock_prices', ''),
    follow=('Интервьюер спрашивает: «Если коды могут повторяться?»',
      [('Решить по контракту: ошибка, первая цена или список цен; молча оставлять последнюю нельзя', True, 'Верно. В build_index из главы 20.2 повтор — ValueError, чтобы ошибка данных не потерялась.'),
       ('Ничего не менять: словарь сам разберётся', False, 'Словарь оставит последнюю цену, первая пропадёт без сообщения.'),
       ('Перейти на список: повторы в нём сохраняются', False, 'Список сохранит повторы, но поиск станет O(n), а вопрос, какую цену вернуть, останется.')]),
  ),
  dict(
    id='hashmap', fn='hashmap_ops', title='Своя хеш-таблица', lc='LeetCode 706', lc_url='https://leetcode.com/problems/design-hashmap/', chapter='тренажёр', form='buckets',
    heads=('ops', 'Ответы get'), label='операции',
    say='Без dict и set реализуйте словарь целых чисел: put(key, value), get(key) → значение или −1, remove(key).',
    retell='«Сделать хеш-таблицу вручную: корзины по остатку ключа».',
    ask=[
      ('Сколько корзин?', 'Выберите сами.', 'Здесь — 8 корзин.', 'Номер корзины — <code>key % 8</code>.'),
      ('put существующего ключа?', 'Обновить значение.', 'Ключ один раз.', 'Поиск в корзине перед добавлением.'),
      ('remove отсутствующего?', 'Ничего не делать.', 'Без ошибки.', 'Проверка pos ≥ 0.'),
    ],
    examples=[
      (([('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 3), ('put', 2, 1), ('get', 2), ('remove', 2), ('get', 2)],), 'пример LeetCode'),
      (([('put', 8, 'a'), ('put', 16, 'b'), ('get', 8), ('get', 16)],), 'одна корзина'),
      (([('remove', 5), ('get', 5)],), 'удаление отсутствующего'),
      (([('put', 0, 0), ('get', 0)],), 'ключ и значение 0'),
      (([],), 'нет операций'),
    ],
    brute='Хранить пары в одном списке и искать перебором: O(n) на операцию.',
    form_hint='dict брать нельзя, но ключ можно разложить по корзинам остатком.',
    steps=[
      ('Корзины', '<code>buckets = [[] for _ in range(8)]</code>, корзина — <code>key % 8</code>.'),
      ('Поиск в корзине', 'Позиция пары с этим ключом или −1.'),
      ('Операция', 'put — замена или добавление, get — значение или −1, remove — удаление пары.'),
    ],
    hand='<p>Так же раскладывались ключи по ячейкам в главе 0.3 — посмотрите коллизии на схеме.</p><div class="htable" data-keys="[1, 2, 9, 17]" data-m="8" data-title="Остаток от деления на 8"></div>',
    cx=('O(1 + n / m) в среднем на операцию, m — число корзин; O(n + m) памяти',
        ['O(1) всегда, при любом числе ключей', 'O(log n) на операцию', 'O(n) на операцию всегда'],
        'В корзине в среднем n / m пар. При фиксированных 8 корзинах и большом n таблицу нужно увеличивать — глава 0.5.'),
    start='''
def hashmap_ops(ops):
    buckets = [[] for _ in range(8)]
    out = []
    # put, get, remove по корзине key % 8.
    return out
''',
    tests=_tests('hashmap_ops', [
      (([('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 3), ('put', 2, 1), ('get', 2), ('remove', 2), ('get', 2)],), [1, -1, 1, -1], 'example', 'пример LeetCode'),
      (([('put', 8, 'a'), ('put', 16, 'b'), ('get', 8), ('get', 16)],), ['a', 'b'], 'collision', 'одна корзина'),
      (([('remove', 5), ('get', 5)],), [-1], 'remove_missing', 'удаление отсутствующего'),
      (([('put', 0, 0), ('get', 0)],), [0], 'zero', 'ключ и значение 0'),
    ]),
    call="print(hashmap_ops([('put', 1, 1), ('put', 2, 2), ('get', 1), ('get', 3)]))",
    trace=('mock_hashmap', ''),
    follow=('Интервьюер спрашивает: «Ключей стало миллион, корзин по-прежнему 8. Что будет?»',
      [('В каждой корзине около 125 000 пар, операции станут O(n); таблицу нужно увеличивать и раскладывать заново', True, 'Верно. Это resize и rehash из главы 0.5: число корзин растёт вместе с числом ключей.'),
       ('Ничего: хеш-таблица всегда O(1)', False, 'O(1) — в среднем при заполнении, ограниченном константой. При 8 корзинах на миллион ключей это не так.'),
       ('Ключи начнут теряться', False, 'Ключи не теряются, корзины просто становятся длинными.')]),
  ),
  dict(
    id='timemap', fn='timemap_ops', title='Хранилище со временем', lc='LeetCode 981', lc_url='https://leetcode.com/problems/time-based-key-value-store/', chapter='тренажёр', form='dict_lists',
    heads=('ops', 'Ответы get'), label='операции',
    say='set(key, value, t) запоминает значение ключа в момент t. get(key, t) возвращает значение с наибольшим моментом не позже t или пустую строку.',
    retell='«Для ключа хранить историю значений и находить последнее не позже t».',
    ask=[
      ('Моменты t в set возрастают?', 'Да, строго.', 'История отсортирована.', 'append сохраняет порядок; поиск — bisect.'),
      ('Если раньше t значений нет?', 'Пустая строка.', 'Нет значения — \'\'.', 'Тест get до первого set.'),
      ('Сколько операций?', 'До 2 · 10⁵.', 'Перебор истории медленный.', 'Двоичный поиск, O(log k).'),
    ],
    examples=[
      (([('set', 'foo', 'bar', 1), ('get', 'foo', 1), ('get', 'foo', 3), ('set', 'foo', 'bar2', 4), ('get', 'foo', 4), ('get', 'foo', 5)],), 'пример LeetCode'),
      (([('set', 'a', 'x', 10), ('get', 'a', 5)],), 'раньше первого'),
      (([('get', 'b', 1)],), 'ключа нет'),
      (([('set', 'a', 'x', 1), ('set', 'b', 'y', 2), ('get', 'a', 2)],), 'два ключа'),
      (([('set', 'a', 'x', 1), ('set', 'a', 'y', 2), ('set', 'a', 'z', 3), ('get', 'a', 2)],), 'середина истории'),
    ],
    brute='Хранить все записи списком и при get перебирать его: O(n) на запрос.',
    form_hint='У ключа много значений во времени, и они приходят по возрастанию времени.',
    steps=[
      ('Хранилище', '<code>store[key]</code> — список пар (t, value), по возрастанию t.'),
      ('Поиск', '<code>bisect_right(history, (t, chr(0x10FFFF)))</code> — сколько записей не позже t.'),
      ('Ответ', 'Последняя из них или <code>\'\'</code>.'),
    ],
    hand='',
    cx=('set — O(1), get — O(log k) в среднем, k — длина истории ключа; O(n) памяти',
        ['set и get — O(k)', 'set и get — O(1)', 'set — O(k log k), get — O(1)'],
        'Добавление в конец списка — O(1). Двоичный поиск по отсортированной истории — O(log k).'),
    start='''
from bisect import bisect_right

def timemap_ops(ops):
    store = {}
    out = []
    # set — в историю ключа; get — двоичный поиск по истории.
    return out
''',
    tests=_tests('timemap_ops', [
      (([('set', 'foo', 'bar', 1), ('get', 'foo', 1), ('get', 'foo', 3), ('set', 'foo', 'bar2', 4), ('get', 'foo', 4), ('get', 'foo', 5)],), ['bar', 'bar', 'bar2', 'bar2'], 'example', 'пример LeetCode'),
      (([('set', 'a', 'x', 10), ('get', 'a', 5)],), [''], 'before', 'раньше первого'),
      (([('get', 'b', 1)],), [''], 'no_key', 'ключа нет'),
      (([('set', 'a', 'x', 1), ('set', 'a', 'y', 2), ('set', 'a', 'z', 3), ('get', 'a', 2)],), ['y'], 'middle', 'середина истории'),
    ]),
    call="print(timemap_ops([('set', 'foo', 'bar', 1), ('get', 'foo', 1), ('get', 'foo', 3)]))",
    trace=('mock_timemap', ''),
    follow=('Интервьюер спрашивает: «Зачем в bisect_right вторым элементом chr(0x10FFFF)?»',
      [('Пары сравниваются по t, а при равном t — по значению; самый большой символ ставит ключ поиска после всех пар с этим t', True, 'Верно. Так в счёт входят записи ровно в момент t. Можно и хранить отдельный список моментов и искать в нём bisect_right(times, t).'),
       ('Чтобы строки сравнивались без учёта регистра', False, 'Регистр тут ни при чём: второй элемент нужен для сравнения пар с равным t.'),
       ('Это ограничение длины значения', False, 'Длина значения не ограничивается. Это самый большой символ Unicode для сравнения пар.')]),
  ),
  dict(
    id='freq', fn='freq_tracker_ops', title='Трекер частот', lc='LeetCode 2671', lc_url='https://leetcode.com/problems/frequency-tracker/', chapter='тренажёр', form='two_dicts',
    heads=('ops', 'Ответы has'), label='операции',
    say='add(x) добавляет число, delete(x) удаляет одно вхождение, has(f) отвечает, есть ли число с частотой ровно f. Все операции — O(1).',
    retell='«Держать частоты чисел и уметь за O(1) ответить, встречается ли где-то частота f».',
    ask=[
      ('delete отсутствующего?', 'Ничего не делать.', 'Без ошибки.', 'Проверка c &gt; 0.'),
      ('has(f) — по всем числам?', 'Да, хотя бы одно число.', 'Нужен счёт частот.', 'Второй словарь «частота → сколько чисел».'),
      ('Перебирать числа при has можно?', 'Нет, O(1).', 'has — O(1).', 'Без прохода по count.values().'),
    ],
    examples=[
      (([('add', 3), ('add', 3), ('has', 2), ('delete', 3), ('has', 2), ('has', 1)],), 'пример'),
      (([('delete', 1), ('has', 1)],), 'удаление отсутствующего'),
      (([('add', 1), ('add', 2), ('has', 1), ('add', 1), ('has', 1)],), 'частота у двух чисел'),
      (([('has', 1)],), 'пусто'),
      (([('add', 5), ('delete', 5), ('has', 1)],), 'добавить и удалить'),
    ],
    brute='На has(f) перебирать все частоты: O(d) на запрос.',
    form_hint='Вопросов два: сколько раз встречается x и есть ли частота f, и оба за O(1).',
    steps=[
      ('Частоты', '<code>count[x]</code> — сколько раз x.'),
      ('Частоты частот', '<code>freq_of[f]</code> — сколько чисел с частотой f; при add/delete сдвинуть x из f в f ± 1.'),
      ('has', '<code>freq_of.get(f, 0) &gt; 0</code>.'),
    ],
    hand='',
    cx=CX_HASH + ('Каждая операция меняет по одной записи в двух словарях.',),
    start='''
def freq_tracker_ops(ops):
    count = {}
    freq_of = {}
    out = []
    # Держите count и freq_of согласованными; на has — ответ в out.
    return out
''',
    tests=_tests('freq_tracker_ops', [
      (([('add', 3), ('add', 3), ('has', 2), ('delete', 3), ('has', 2), ('has', 1)],), [True, False, True], 'example', 'пример'),
      (([('delete', 1), ('has', 1)],), [False], 'delete_missing', 'удаление отсутствующего'),
      (([('add', 1), ('add', 2), ('has', 1), ('add', 1), ('has', 1)],), [True, True], 'two_numbers', 'частота у двух чисел'),
      (([('add', 5), ('delete', 5), ('has', 1)],), [False], 'add_delete', 'добавить и удалить'),
    ]),
    call="print(freq_tracker_ops([('add', 3), ('add', 3), ('has', 2), ('delete', 3), ('has', 2), ('has', 1)]))",
    trace=('mock_freq', ''),
    follow=('Интервьюер спрашивает: «Что сломается, если при add забыть уменьшить freq_of старой частоты?»',
      [('freq_of будет считать число сразу в двух частотах, и has ответит True для частоты, которой уже нет', True, 'Верно. Два словаря должны меняться вместе: число переходит из частоты c в c + 1.'),
       ('Ничего: freq_of только растёт', False, 'После [add 3, add 3] без уменьшения has(1) ответит True, хотя 3 встречается дважды.'),
       ('has начнёт бросать KeyError', False, 'get с умолчанием не бросает ошибку. Ответ станет неверным.')]),
  ),
  dict(
    id='auth', fn='auth_ops', title='Токены с истечением', lc='LeetCode 1797', lc_url='https://leetcode.com/problems/design-authentication-manager/', chapter='тренажёр', form='expiry',
    heads=('ttl, ops', 'Ответы count'), label='операции',
    say='Токен живёт ttl секунд. generate(id, t) создаёт его, renew(id, t) продлевает живой токен, count(t) — сколько токенов живы в момент t.',
    retell='«Хранить время истечения каждого токена, продлевать только живые, считать живые на момент t».',
    ask=[
      ('Токен, истекающий ровно в t, жив?', 'Нет.', 'Жив, если истекает позже t.', 'Сравнение <code>e &gt; t</code>.'),
      ('renew истёкшего?', 'Ничего не делать.', 'Продлевается только живой.', 'Проверка перед перезаписью.'),
      ('Моменты t возрастают?', 'Да.', 'Время идёт вперёд.', 'Старые записи можно не удалять.'),
    ],
    examples=[
      ((5, [('renew', 'aaa', 1), ('generate', 'aaa', 2), ('count', 6), ('generate', 'bbb', 7), ('renew', 'aaa', 8), ('renew', 'bbb', 10), ('count', 15)]), 'пример LeetCode'),
      ((3, [('generate', 'a', 1), ('count', 4)]), 'истекает ровно в t'),
      ((3, [('generate', 'a', 1), ('renew', 'a', 3), ('count', 5)]), 'продление'),
      ((3, [('count', 1)]), 'токенов нет'),
      ((10, [('generate', 'a', 1), ('generate', 'b', 2), ('count', 3)]), 'два живых'),
    ],
    brute='Хранить события списком и при count пересчитывать историю каждого токена.',
    form_hint='Записи живут ограниченное время: важно только, когда каждая истекает.',
    steps=[
      ('generate', '<code>expires[id] = t + ttl</code>.'),
      ('renew', 'Если <code>expires.get(id, 0) &gt; t</code> — <code>expires[id] = t + ttl</code>.'),
      ('count', 'Сколько значений больше t.'),
    ],
    hand='',
    cx=('generate и renew — O(1), count — O(n); O(n) памяти',
        ['все операции O(1)', 'все операции O(n)', 'generate O(n), count O(1)'],
        'Запись и продление — по одной операции со словарём. count проходит все токены; на LeetCode этого хватает.'),
    start='''
def auth_ops(ttl, ops):
    expires = {}
    out = []
    # generate, renew, count по словарю «токен → время истечения».
    return out
''',
    tests=_tests('auth_ops', [
      ((5, [('renew', 'aaa', 1), ('generate', 'aaa', 2), ('count', 6), ('generate', 'bbb', 7), ('renew', 'aaa', 8), ('renew', 'bbb', 10), ('count', 15)]), [1, 0], 'example', 'пример LeetCode'),
      ((3, [('generate', 'a', 1), ('count', 4)]), [0], 'exact', 'истекает ровно в t'),
      ((3, [('generate', 'a', 1), ('renew', 'a', 3), ('count', 5)]), [1], 'renew', 'продление'),
      ((10, [('generate', 'a', 1), ('generate', 'b', 2), ('count', 3)]), [2], 'two', 'два живых'),
    ]),
    call="print(auth_ops(5, [('generate', 'aaa', 2), ('count', 6)]))",
    trace=('mock_auth', ''),
    follow=('Интервьюер спрашивает: «Токенов миллион, count вызывают часто. Как ускорить count?»',
      [('Удалять истёкшие при каждом обращении в порядке истечения — например, держать токены в OrderedDict по времени продления', True, 'Верно. Время идёт вперёд и ttl одинаковый, поэтому порядок продлений — порядок истечений, как в LRU.'),
       ('Хранить токены во множестве', False, 'Множество не хранит время истечения: не узнать, какие живы.'),
       ('Сортировать словарь при каждом count', False, 'Сортировка — O(n log n), это медленнее прохода.')]),
  ),
  dict(
    id='short', fn='shorten_all', title='Сокращатель ссылок', lc='LeetCode 535', lc_url='https://leetcode.com/problems/encode-and-decode-tinyurl/', chapter='тренажёр', form='two_dicts',
    heads=('urls', 'Код и восстановленная ссылка'), label='ссылки',
    say='Каждой ссылке дайте короткий код и умейте по коду вернуть ссылку. Для каждой входной ссылки верните пару (код, ссылка по коду).',
    retell='«Нужны два направления: ссылка → код и код → ссылка, обе за O(1)».',
    ask=[
      ('Одна ссылка дважды — один код?', 'Да.', 'Повтор — тот же код.', 'Словарь «ссылка → код».'),
      ('Какие коды?', 'u0, u1, … по порядку.', 'Код — счётчик.', '<code>\'u\' + str(len(code_of))</code>.'),
      ('Как вернуть ссылку по коду?', 'За O(1).', 'Обратный словарь.', 'Словарь «код → ссылка».'),
    ],
    examples=[
      ((['a.ru/x', 'b.ru/y', 'a.ru/x'],), 'повтор ссылки'),
      ((['q'],), 'одна ссылка'),
      (([],), 'нет ссылок'),
      ((['x', 'y', 'z'],), 'три разные'),
      ((['', ''],), 'пустая ссылка'),
    ],
    brute='Хранить ссылки в списке, код — индекс; повтор искать перебором: O(n) на ссылку.',
    form_hint='Нужно отвечать на два вопроса: код по ссылке и ссылку по коду.',
    steps=[
      ('Новая ссылка', 'Код <code>\'u\' + str(len(code_of))</code>, запись в оба словаря.'),
      ('Повтор', 'Код из <code>code_of</code>.'),
      ('Ответ', 'Пара (код, <code>url_of[код]</code>).'),
    ],
    hand='',
    cx=CX_HASH + ('Каждая ссылка — одна-две записи в словари и одно чтение.',),
    start='''
def shorten_all(urls):
    code_of = {}
    url_of = {}
    out = []
    # Дайте коды и восстановите ссылки по ним.
    return out
''',
    tests=_tests('shorten_all', [
      ((['a.ru/x', 'b.ru/y', 'a.ru/x'],), [('u0', 'a.ru/x'), ('u1', 'b.ru/y'), ('u0', 'a.ru/x')], 'example', 'повтор ссылки'),
      ((['q'],), [('u0', 'q')], 'one', 'одна ссылка'),
      ((['x', 'y', 'z'],), [('u0', 'x'), ('u1', 'y'), ('u2', 'z')], 'three', 'три разные'),
      ((['', ''],), [('u0', ''), ('u0', '')], 'empty', 'пустая ссылка'),
    ]),
    call="print(shorten_all(['a.ru/x', 'b.ru/y', 'a.ru/x']))",
    trace=('mock_short', ''),
    follow=('Интервьюер спрашивает: «Почему не хеш ссылки в качестве кода, hash(url)?»',
      [('Хеш строки меняется между запусками Python, а коды должны жить долго; и у разных ссылок хеши могут совпасть', True, 'Верно. Это глава 0.3: хеш строки нельзя сохранять. Для постоянных кодов берут счётчик или стойкий хеш с проверкой коллизий.'),
       ('hash работает только с числами', False, 'hash принимает строки. Проблема в том, что его значение меняется между запусками.'),
       ('Хеш слишком короткий', False, 'Хеш длинный, около 19 цифр. Дело в изменчивости и коллизиях.')]),
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
    ns = {'__builtins__': __builtins__}
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
  <title>20.6 Мок-интервью по задачам модуля · Хеш-структуры</title>
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
      <div class="spine"><span>Модуль 20 · Кэш и индекс · ОП.04</span></div>

      <main class="leaf">
        <div class="running">
          <p class="eyebrow"><a href="../index.html" style="text-decoration:none;color:inherit">Хеш-структуры</a> · модуль 20 · кэш и индекс</p>
          <p class="running__folio">Глава 20.6</p>
        </div>

        <header class="chapter-head">
          <span class="chapter-num">20.6</span>
          <h1>Мок-интервью<br>по задачам модуля</h1>
          <p class="lead">В этой главе восемь задач на проектирование структур данных в формате алгоритмической секции. Классы из LeetCode записаны функциями над списком операций, как в тестах LeetCode: так их можно проверить на странице и пройти по шагам. Каждая проходит этапы по шаблону interview canvas: условие, уточнения, примеры, перебор и идея, сложность, код, проверка. Этапы открываются по одному, рядом идёт секундомер с планом на 25 минут. Код пишется и проверяется прямо на странице. Тренажёр устроен так же, как в главах 13.6–15.6 книги о строках и в главах 8.6–12.6 книги о массивах.</p>
        </header>

        <dl class="passport">
          <div><dt>Категория</dt><dd>Тренажёр</dd></div>
          <div><dt>Уровень</dt><dd>Средний</dd></div>
          <div><dt>Опирается на</dt><dd>Модули 0, 17–19 и главы 20.1–20.4</dd></div>
          <div><dt>Зачем это знать</dt><dd>Проектировать кэш и структуры с операциями за O(1) в темпе собеседования</dd></div>
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
        <p>В каждом этапе сначала работа самостоятельно, потом сверка. Пересказ, перебор, правило шага и эталонный код спрятаны в раскрывающихся блоках, ответы к примерам скрыты до нажатия кнопки. В этапе «Перебор и идея» нужно выбрать технику из шести: OrderedDict для порядка обращений, словарь как готовый ответ, список корзин вместо dict, словарь списков с двоичным поиском, два согласованных словаря и словарь времени истечения. Все шесть — словарь плюс что-то ещё, и различаются они тем, что именно добавлено.</p>
        <p>Секундомер запускается кнопкой «Старт» и не ограничивает время. В конце задачи появляется таблица «план — фактически». Кнопка «Открыть все этапы» показывает задачу целиком: так задачу разбирают после попытки или читают как разобранный пример.</p>
        <p>В тренажёр не входят задачи дополнительного набора <code>extra.py</code> — LeetCode 705, 1656, 1396 — и задача домашнего задания LeetCode 380. Их решения здесь были бы подсказкой.</p>

        <h2 id="s2"><span class="sec">§2</span>Задачи тренажёра</h2>
        <p>В таблице — восемь задач и глава, где задача разобрана подробно. LRU разобран в главе 20.3, кэш с подсчётом и индекс цен — в главе 20.2, остальные пять — только здесь. Техника в таблице не указана: её выбор — один из вопросов этапа «Перебор и идея».</p>
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
          <div class="checklist__item"><span><b>Заданы вопросы, которые меняют решение</b>Что вернуть при промахе, считается ли запись обращением, что при повторе ключа, какое время у каждой операции, что делать с отсутствующим ключом.</span></div>
          <div class="checklist__item"><span><b>Ответы к примерам совпали</b>Все пять, включая пустой вход и случай без ответа.</span></div>
          <div class="checklist__item"><span><b>Названы перебор и его сложность</b>До быстрого решения, одной-двумя фразами.</span></div>
          <div class="checklist__item"><span><b>Техника и сложность выбраны с первого раза</b>Названы обе структуры решения — словарь и то, что к нему добавлено, — и время каждой операции.</span></div>
          <div class="checklist__item"><span><b>Все тесты в песочнице прошли</b>Эталонный код при этом не открывался.</span></div>
          <div class="checklist__item"><span><b>Время — около 25 минут</b>По таблице «план — фактически» видно, на каком этапе ушло больше времени, чем по плану.</span></div>
        </div>
        <p>Задачи, на которых не получилось хотя бы одно из этого, стоит пройти ещё раз через день, по главе из таблицы §2.</p>

        <div class="pager"><a href="05-praktika-i-dz.html">← 20.5 Практика и ДЗ</a><a href="../index.html">К оглавлению книги →</a></div>
        <div class="colophon">
          <span>Модуль 20 · Кэш и индекс · ОП.04 · 3 курс</span>
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

