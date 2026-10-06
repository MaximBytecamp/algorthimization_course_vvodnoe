/* Практическая работа модуля 8 «Два указателя», ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-praktika-m08-r1",
 "prefix": "PR08",
 "title": "Практическая работа · модуль 8",
 "minutes": 80,
 "salt": "op04-pr08-2026-oct",
 "fixedOrder": true,
 "maxScore": 43,
 "context": "Код в заданиях — Python 3.12. Под n понимается длина списка. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место. В заданиях из нескольких мест балл ставится за каждое верно занятое место.",
 "grades": [
  {
   "min": 39,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 30,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 22,
   "mark": 3,
   "label": "удовлетворительно"
  },
  {
   "min": 0,
   "mark": 2,
   "label": "неудовлетворительно"
  }
 ],
 "questions": [
  {
   "id": "q01",
   "topic": "часть 1 · сложность кода",
   "type": "slots",
   "text": "Четыре функции решают одну задачу: найти в списке <code>a</code> два разных элемента с суммой <code>target</code>. Функции А, Б и В возвращают индексы пары, функция Г — значения; функция Б рассчитана на отсортированный список. Поставьте каждой функции оценку времени и дополнительной памяти при длине списка n. Дополнительная память — структуры, размер которых растёт с n: новый список или словарь; отдельные переменные — O(1).",
   "code": "# ── Код А ──\ndef pair_brute(a, target):\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] + a[j] == target:\n                return (i, j)\n    return None\n\n# ── Код Б ──\ndef pair_pointers(a, target):\n    i, j = 0, len(a) - 1\n    while i < j:\n        s = a[i] + a[j]\n        if s == target:\n            return (i, j)\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None\n\n# ── Код В ──\ndef pair_dict(a, target):\n    seen = {}\n    for j in range(len(a)):\n        need = target - a[j]\n        if need in seen:\n            return (seen[need], j)\n        seen[a[j]] = j\n    return None\n\n# ── Код Г ──\ndef pair_sorted_copy(a, target):\n    b = sorted(a)\n    i, j = 0, len(b) - 1\n    while i < j:\n        s = b[i] + b[j]\n        if s == target:\n            return (b[i], b[j])\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None",
   "chips": [
    "O(1)",
    "O(n)",
    "O(n log n)",
    "O(n²)"
   ],
   "slots": [
    "Код А · время",
    "Код А · доп. память",
    "Код Б · время",
    "Код Б · доп. память",
    "Код В · время",
    "Код В · доп. память",
    "Код Г · время",
    "Код Г · доп. память"
   ],
   "points": 8,
   "partial": true
  },
  {
   "id": "q02",
   "topic": "часть 2 · выбор кода под входные данные",
   "type": "sort",
   "text": "Те же четыре функции, что в задании 1. Каждая карточка описывает входные данные и ограничения. Поставьте карточку к функции, которую нужно выбрать: она выполняет все требования карточки и укладывается в 1 секунду. Если подходят несколько, выбирается функция с меньшей оценкой времени из задания 1, при одинаковой оценке — с меньшей памятью. Ориентир: Python выполняет около 10⁷ простых операций в секунду, встроенная <code>sorted</code> написана на C и сортирует 10⁶ чисел за доли секунды.",
   "code": "# ── Код А ──\ndef pair_brute(a, target):\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] + a[j] == target:\n                return (i, j)\n    return None\n\n# ── Код Б ──\ndef pair_pointers(a, target):\n    i, j = 0, len(a) - 1\n    while i < j:\n        s = a[i] + a[j]\n        if s == target:\n            return (i, j)\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None\n\n# ── Код В ──\ndef pair_dict(a, target):\n    seen = {}\n    for j in range(len(a)):\n        need = target - a[j]\n        if need in seen:\n            return (seen[need], j)\n        seen[a[j]] = j\n    return None\n\n# ── Код Г ──\ndef pair_sorted_copy(a, target):\n    b = sorted(a)\n    i, j = 0, len(b) - 1\n    while i < j:\n        s = b[i] + b[j]\n        if s == target:\n            return (b[i], b[j])\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None",
   "items": [
    "Список отсортирован по возрастанию. n = 10⁶. Вернуть индексы пары. Дополнительная память — O(1).",
    "Список не отсортирован. n = 10⁶. Вернуть индексы пары в исходном списке.",
    "Список не отсортирован. n = 10⁵. Вернуть значения пары. Словарь использовать нельзя.",
    "Список не отсортирован. n ≤ 300. Дополнительная память — O(1).",
    "Список отсортирован по возрастанию. n = 50. Вернуть индексы пары.",
    "Список не отсортирован. n = 2 000. Вернуть индексы пары. Дополнительная память — O(1)."
   ],
   "buckets": [
    "Код А · pair_brute",
    "Код Б · pair_pointers",
    "Код В · pair_dict",
    "Код Г · pair_sorted_copy"
   ],
   "points": 6,
   "partial": true
  },
  {
   "id": "q03",
   "topic": "часть 3 · условие и строки кода, задача 1",
   "type": "slots",
   "text": "<b>Условие.</b> Сервис доставки хранит заказы курьера. Расстояния до адресов записаны в списке <code>dist</code> по возрастанию. Курьер берёт за одну поездку два разных заказа, и сумма расстояний должна быть равна <code>d</code>. Верните номера заказов в списке. Если такой пары нет, верните <code>None</code>.<br><br>Ниже решение. Поставьте к каждой из пяти строк фрагмент условия, из-за которого эта строка в коде появилась. Два фрагмента ни к одной строке не относятся.",
   "code": "def find_two_orders(dist, d):\n    i, j = 0, len(dist) - 1\n    while i < j:\n        s = dist[i] + dist[j]\n        if s == d:\n            return (i, j)\n        if s < d:\n            i += 1\n        else:\n            j -= 1\n    return None",
   "chips": [
    "по возрастанию",
    "два разных заказа",
    "сумма расстояний должна быть равна d",
    "верните номера заказов",
    "если такой пары нет, верните None",
    "сервис доставки",
    "за одну поездку"
   ],
   "slots": [
    "строка 3: while i < j:",
    "строка 5: if s == d:",
    "строка 6: return (i, j)",
    "строка 7: if s < d:",
    "строка 11: return None"
   ],
   "points": 5,
   "partial": true
  },
  {
   "id": "q04",
   "topic": "часть 3 · условие и строки кода, задача 2",
   "type": "slots",
   "text": "<b>Условие.</b> Онлайн-кинотеатр ведёт журнал просмотров <code>ids</code> в порядке просмотра. Если зритель несколько раз подряд включал один и тот же фильм, в журнале остаётся одна запись. Журнал может быть пустым. Измените журнал на месте. После вызова в списке не должно быть лишних элементов в конце. Верните новую длину.<br><br>Ниже решение. Поставьте к каждой из пяти строк фрагмент условия, из-за которого эта строка в коде появилась. Два фрагмента ни к одной строке не относятся.",
   "code": "def squash_log(ids):\n    if not ids:\n        return 0\n    w = 1\n    for r in range(1, len(ids)):\n        if ids[r] != ids[w - 1]:\n            ids[w] = ids[r]\n            w += 1\n    del ids[w:]\n    return w",
   "chips": [
    "журнал может быть пустым",
    "несколько раз подряд",
    "измените журнал на месте",
    "не должно быть лишних элементов в конце",
    "верните новую длину",
    "онлайн-кинотеатр",
    "в порядке просмотра"
   ],
   "slots": [
    "строка 2: if not ids:",
    "строка 6: if ids[r] != ids[w - 1]:",
    "строка 7: ids[w] = ids[r]",
    "строка 9: del ids[w:]",
    "строка 10: return w"
   ],
   "points": 5,
   "partial": true
  },
  {
   "id": "q05",
   "topic": "часть 4 · строка с ошибкой, функция 1",
   "type": "line",
   "text": "Функция удаляет из <code>nums</code> все элементы, равные <code>val</code>, в том же списке, сохраняя порядок, и возвращает новую длину. <br><br><b>Вызов:</b> <code>remove_value([3, 1, 3, 2], 3)</code><br><b>Ожидается:</b> функция вернёт 2, в списке останется <code>[1, 2]</code>.<br><b>Получается:</b> функция возвращает 4, в списке остаётся <code>[3, 1, 3, 2]</code>.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def remove_value(nums, val):\n    w = 0\n    for r in range(len(nums)):\n        if nums[r] != val:\n            nums[w] = nums[r]\n        w += 1\n    del nums[w:]\n    return w",
   "points": 2
  },
  {
   "id": "q06",
   "topic": "часть 4 · строка с ошибкой, функция 2",
   "type": "line",
   "text": "Функция получает два строго возрастающих списка и возвращает список общих элементов по возрастанию за O(n + m), где n и m — длины списков. <br><br><b>Вызов:</b> <code>common_sorted([1, 4], [2, 4])</code><br><b>Ожидается:</b> <code>[4]</code>.<br><b>Получается:</b> <code>[]</code>.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def common_sorted(a, b):\n    i = j = 0\n    res = []\n    while i < len(a) and j < len(b):\n        if a[i] == b[j]:\n            res.append(a[i])\n            i += 1\n            j += 1\n        elif a[i] < b[j]:\n            j += 1\n        else:\n            i += 1\n    return res",
   "points": 2
  },
  {
   "id": "q07",
   "topic": "часть 4 · строка с ошибкой, функция 3",
   "type": "line",
   "text": "Цены отсортированы по возрастанию. Функция возвращает наибольшую сумму цен двух разных товаров, не превышающую бюджет, или −1. <br><br><b>Вызов:</b> <code>best_pair_under([1, 4, 5, 9], 10)</code><br><b>Ожидается:</b> 10 (1 + 9).<br><b>Получается:</b> 9.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def best_pair_under(prices, budget):\n    i, j = 0, len(prices) - 1\n    best = -1\n    while i < j:\n        s = prices[i] + prices[j]\n        if s <= budget:\n            best = s\n            i += 1\n        else:\n            j -= 1\n    return best",
   "points": 2
  },
  {
   "id": "q08",
   "topic": "часть 5 · пропуски в коде",
   "type": "slots",
   "text": "Цены <code>prices</code> отсортированы по возрастанию, товаров не меньше двух. Функция возвращает сумму цен двух разных товаров, ближайшую к <code>target</code>: такую сумму <code>s</code>, у которой <code>abs(s - target)</code> наименьшее. Если таких сумм несколько, подходит любая. Время O(n), память O(1). Поставьте в каждый пропуск ⟨1⟩–⟨5⟩ знак сравнения, имя переменной или строку кода. Одна карточка ставится в несколько пропусков, часть карточек не нужна.",
   "code": "def closest_sum(prices, target):\n    i, j = 0, len(prices) - 1\n    best = prices[0] + prices[1]\n    while i ⟨1⟩ j:\n        s = prices[i] + prices[j]\n        if abs(s - target) < abs(best - target):\n            best = ⟨2⟩\n        if s ⟨3⟩ target:\n            ⟨4⟩\n        elif s > target:\n            ⟨5⟩\n        else:\n            return s\n    return best",
   "chips": [
    "<",
    "<=",
    ">",
    "s",
    "best",
    "i += 1",
    "j -= 1",
    "i -= 1",
    "j += 1"
   ],
   "slots": [
    "пропуск 1: while i … j:",
    "пропуск 2: best = …",
    "пропуск 3: if s … target:",
    "пропуск 4: строка после «if s … target:»",
    "пропуск 5: строка после «elif s > target:»"
   ],
   "points": 5,
   "partial": true
  },
  {
   "id": "q09",
   "topic": "часть 6 · своё решение",
   "type": "code",
   "text": "<b>Условие.</b> Два склада присылают списки артикулов <code>a</code> и <code>b</code>. Каждый список отсортирован по неубыванию: каждый следующий артикул не меньше предыдущего, одинаковые стоят рядом. Напишите <code>merge_unique(a, b)</code>: функция возвращает <b>новый</b> список всех различных артикулов из обоих списков по возрастанию, каждый артикул один раз.<br><br><b>Ограничения.</b> Время O(n + m), где n и m — длины списков. Нельзя использовать <code>sorted</code>, <code>list.sort</code>, <code>set</code> и <code>dict</code>. Входные списки не менять.<br><br><b>Примеры.</b><br><code>[1, 3, 3, 7]</code> и <code>[2, 3, 8]</code> → <code>[1, 2, 3, 7, 8]</code><br><code>[]</code> и <code>[4, 4, 5]</code> → <code>[4, 5]</code><br><code>[5, 5, 5]</code> и <code>[5, 5]</code> → <code>[5]</code><br><br><b>Что проверяют 19 тестов.</b> Пример из условия; пустые списки; одинаковые элементы; все числа одного списка меньше чисел другого; чередование; хвост с повторами; повтор на стыке списков; отрицательные и большие числа; входные списки не изменились; результат — новый список; <code>sorted</code>, <code>set</code> и <code>dict</code> не вызываются; 400 случайных входов; два списка по 20 000 чисел быстрее чем за секунду.<br><br><b>Баллы.</b> Все 19 тестов — 8 баллов, от 15 до 18 — 4 балла. Засчитывается последний запуск. Если код изменён после запуска, тесты нужно запустить снова, иначе ответ не сохранится.",
   "points": 8,
   "steps": [
    [
     19,
     8
    ],
    [
     15,
     4
    ]
   ],
   "start": "def merge_unique(a, b):\n    i = j = 0\n    res = []\n    # Ваш код: пройдите оба списка и соберите в res\n    # различные значения по возрастанию.\n    return res\n",
   "tests": "import random\nimport time\n\n\ndef _forbidden(name):\n    def stub(*args, **kwargs):\n        raise AssertionError(f\"по условию {name} использовать нельзя\")\n    return stub\n\n\ndef _expected(a, b):\n    return sorted(set(a) | set(b))\n\n\ndef test_example():\n    \"\"\"пример из условия\"\"\"\n    assert merge_unique([1, 3, 3, 7], [2, 3, 8]) == [1, 2, 3, 7, 8]\n\n\ndef test_both_empty():\n    \"\"\"оба списка пустые\"\"\"\n    assert merge_unique([], []) == []\n\n\ndef test_first_empty():\n    \"\"\"первый пустой, во втором повторы\"\"\"\n    assert merge_unique([], [4, 4, 5]) == [4, 5]\n\n\ndef test_second_empty():\n    \"\"\"второй пустой\"\"\"\n    assert merge_unique([1, 2, 2, 9], []) == [1, 2, 9]\n\n\ndef test_single_each():\n    \"\"\"по одному элементу, одинаковые\"\"\"\n    assert merge_unique([7], [7]) == [7]\n\n\ndef test_all_same():\n    \"\"\"все элементы обоих списков одинаковые\"\"\"\n    assert merge_unique([5, 5, 5], [5, 5]) == [5]\n\n\ndef test_same_lists():\n    \"\"\"два одинаковых списка\"\"\"\n    assert merge_unique([1, 2, 3], [1, 2, 3]) == [1, 2, 3]\n\n\ndef test_first_before_second():\n    \"\"\"все числа первого меньше всех чисел второго\"\"\"\n    assert merge_unique([1, 2], [10, 20, 30]) == [1, 2, 10, 20, 30]\n\n\ndef test_second_before_first():\n    \"\"\"все числа второго меньше всех чисел первого\"\"\"\n    assert merge_unique([10, 20, 30], [1, 2]) == [1, 2, 10, 20, 30]\n\n\ndef test_interleaved():\n    \"\"\"числа списков чередуются\"\"\"\n    assert merge_unique([1, 3, 5, 7], [2, 4, 6, 8]) == [1, 2, 3, 4, 5, 6, 7, 8]\n\n\ndef test_long_tail_with_repeats():\n    \"\"\"хвост одного списка с повторами после конца другого\"\"\"\n    assert merge_unique([1, 2], [2, 6, 6, 6, 9, 9]) == [1, 2, 6, 9]\n\n\ndef test_repeat_across_lists():\n    \"\"\"одно значение повторяется в конце первого и в начале второго\"\"\"\n    assert merge_unique([1, 4, 4], [4, 4, 8]) == [1, 4, 8]\n\n\ndef test_negative_and_zero():\n    \"\"\"отрицательные числа и ноль\"\"\"\n    assert merge_unique([-5, -5, 0, 3], [-7, -5, 0, 0]) == [-7, -5, 0, 3]\n\n\ndef test_big_numbers():\n    \"\"\"большие числа\"\"\"\n    assert merge_unique([10**12, 10**15], [10**12 + 1]) == [10**12, 10**12 + 1, 10**15]\n\n\ndef test_inputs_not_changed():\n    \"\"\"входные списки не меняются\"\"\"\n    a, b = [1, 1, 4], [2, 4, 4]\n    merge_unique(a, b)\n    assert a == [1, 1, 4] and b == [2, 4, 4], f\"после вызова a = {a}, b = {b}\"\n\n\ndef test_new_list():\n    \"\"\"результат — новый список, а не один из входных\"\"\"\n    a, b = [1, 2, 3], []\n    res = merge_unique(a, b)\n    assert res is not a and res is not b, \"функция вернула входной список вместо нового\"\n\n\ndef test_no_builtin_sorting():\n    \"\"\"sorted, set и dict не используются\"\"\"\n    g = merge_unique.__globals__\n    saved = {name: g[name] for name in (\"sorted\", \"set\", \"dict\") if name in g}\n    for name in (\"sorted\", \"set\", \"dict\"):\n        g[name] = _forbidden(name)\n    try:\n        assert merge_unique([1, 1, 5, 6], [0, 5, 9]) == [0, 1, 5, 6, 9]\n    finally:\n        for name in (\"sorted\", \"set\", \"dict\"):\n            del g[name]\n        g.update(saved)\n\n\ndef test_random_small():\n    \"\"\"400 случайных пар списков длиной до 12\"\"\"\n    rnd = random.Random(8)\n    for _ in range(400):\n        a = sorted(rnd.randint(-5, 5) for _ in range(rnd.randint(0, 12)))\n        b = sorted(rnd.randint(-5, 5) for _ in range(rnd.randint(0, 12)))\n        got = merge_unique(list(a), list(b))\n        assert got == _expected(a, b), f\"merge_unique({a}, {b}) вернула {got}, нужно {_expected(a, b)}\"\n\n\ndef test_big_input_is_fast():\n    \"\"\"по 20 000 чисел в каждом списке быстрее чем за 1 секунду\"\"\"\n    rnd = random.Random(80)\n    a = sorted(rnd.randint(0, 30000) for _ in range(20000))\n    b = sorted(rnd.randint(0, 30000) for _ in range(20000))\n    start = time.perf_counter()\n    got = merge_unique(a, b)\n    spent = time.perf_counter() - start\n    assert got == _expected(a, b), \"на большом входе ответ неверный\"\n    assert spent < 1.0, f\"работает {spent:.2f} с: похоже, решение не O(n + m)\"\n",
   "limit": 20000
  }
 ]
};

const SECRET = "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";

let SECRET_CACHE = null;
async function secretData() {
  if (SECRET_CACHE) return SECRET_CACHE;
  const pad = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(QUIZ.salt)));
  const bytes = Uint8Array.from(atob(SECRET), c => c.charCodeAt(0)).map((b, i) => b ^ pad[i % pad.length]);
  SECRET_CACHE = JSON.parse(new TextDecoder().decode(bytes));
  return SECRET_CACHE;
}

async function shortHash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/* Приводит ответ к форме ключа. Пустой или неполный ответ даёт null.
   В заданиях с частичными баллами (partial) ответ засчитывается и неполным. */
function normalized(q, a) {
  if (a == null) return null;
  switch (q.type) {
    case 'single': case 'multi': case 'line':
      return a.length ? [...a].sort((x, y) => x - y) : null;
    case 'order':
      return a.length ? a : null;
    case 'slots': case 'sort':
      return a.every(x => x !== null && x !== undefined) ? a : null;
    case 'code':
      return a && typeof a.src === 'string' && a.total > 0 ? a : null;
    case 'number': {
      const s = String(a).replace(/\s/g, '').replace(',', '.');
      return s !== '' && isFinite(Number(s)) ? [Number(s)] : null;
    }
  }
  return null;
}

/* Место ключа может принимать одну карточку (число) или несколько (массив). */
function keyAccepts(k, v) {
  return Array.isArray(k) ? k.includes(v) : k === v;
}

/* Баллы за задание: { pts, max }. */
async function scoreOf(q, a) {
  const max = q.points || 1;
  if (q.type === 'code') {
    const r = normalized(q, a);
    if (!r) return { pts: 0, max };
    const step = (q.steps || []).find(([need]) => r.ok >= need);
    return { pts: step ? step[1] : 0, max };
  }
  const key = (await secretData())[q.id].key;
  if (q.type === 'line') {
    const norm = normalized(q, a);
    return { pts: norm && key.includes(norm[0]) ? max : 0, max };
  }
  if ((q.type === 'slots' || q.type === 'sort') && q.partial) {
    const mine = a || [];
    const hit = key.filter((k, i) => mine[i] !== null && mine[i] !== undefined && keyAccepts(k, mine[i])).length;
    return { pts: Math.round(hit * max / key.length), max };
  }
  const norm = normalized(q, a);
  if (!norm) return { pts: 0, max };
  if (q.type === 'slots' || q.type === 'sort') return { pts: norm.every((v, i) => keyAccepts(key[i], v)) ? max : 0, max };
  return { pts: JSON.stringify(norm) === JSON.stringify(key) ? max : 0, max };
}

async function isCorrect(q, a) {
  const s = await scoreOf(q, a);
  return s.pts === s.max;
}

function b64urlText(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64urlText(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
}

/* Ответ в коде результата: строка на вопрос. Номера — одной цифрой, пусто — x.
   Задание с кодом: «прошло~всего~исходник в base64url». */
function encodeAnswer(q, a) {
  if (a == null) return '';
  if (q.type === 'code') return `${a.ok}~${a.total}~${b64urlText(a.src)}`;
  if (q.type === 'number') return String(a).replace(/[^0-9.,\-]/g, '').slice(0, 12);
  if (q.type === 'slots' || q.type === 'sort') return a.map(x => (x === null || x === undefined) ? 'x' : String(x)).join('');
  return a.join('');
}

function decodeAnswer(q, s) {
  s = s || '';
  if (s === '') return null;
  if (q.type === 'code') {
    const [ok, total, body] = s.split('~');
    try { return { ok: Number(ok), total: Number(total), src: unb64urlText(body || '') }; } catch (e) { return null; }
  }
  if (q.type === 'number') return s;
  const parts = s.split('');
  if (q.type === 'slots' || q.type === 'sort') return parts.map(c => c === 'x' ? null : Number(c));
  return parts.map(Number);
}

function gradeFor(score) {
  return QUIZ.grades.find(g => score >= g.min) || QUIZ.grades[QUIZ.grades.length - 1];
}
