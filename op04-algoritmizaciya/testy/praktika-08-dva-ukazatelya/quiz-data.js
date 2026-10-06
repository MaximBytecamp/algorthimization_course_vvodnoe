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
   "text": "Те же четыре функции, что в задании 1. Каждая карточка описывает входные данные и ограничения. Поставьте карточку к функции, которую нужно выбрать: она выполняет все требования карточки и укладывается в 1 секунду. Если подходят несколько — более быстрая, при одинаковом времени — с меньшей памятью. Ориентир: Python выполняет около 10⁷ простых операций в секунду, встроенная <code>sorted</code> написана на C и сортирует 10⁶ чисел за доли секунды.",
   "code": "# ── Код А ──\ndef pair_brute(a, target):\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] + a[j] == target:\n                return (i, j)\n    return None\n\n# ── Код Б ──\ndef pair_pointers(a, target):\n    i, j = 0, len(a) - 1\n    while i < j:\n        s = a[i] + a[j]\n        if s == target:\n            return (i, j)\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None\n\n# ── Код В ──\ndef pair_dict(a, target):\n    seen = {}\n    for j in range(len(a)):\n        need = target - a[j]\n        if need in seen:\n            return (seen[need], j)\n        seen[a[j]] = j\n    return None\n\n# ── Код Г ──\ndef pair_sorted_copy(a, target):\n    b = sorted(a)\n    i, j = 0, len(b) - 1\n    while i < j:\n        s = b[i] + b[j]\n        if s == target:\n            return (b[i], b[j])\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None",
   "items": [
    "Список отсортирован по возрастанию. n = 10⁶. Вернуть индексы пары. Дополнительная память — O(1).",
    "Список не отсортирован. n = 10⁶. Вернуть индексы пары в исходном списке.",
    "Список не отсортирован. n = 10⁵. Вернуть значения пары. Словарь использовать нельзя.",
    "Список не отсортирован. n ≤ 300. Дополнительная память — O(1). Список менять нельзя.",
    "Список отсортирован по возрастанию. n = 50. Вернуть индексы пары.",
    "Список не отсортирован. n = 2 000. Вернуть индексы пары. Дополнительная память — O(1)."
   ],
   "buckets": [
    "Код А",
    "Код Б",
    "Код В",
    "Код Г"
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
   "text": "<b>Условие.</b> Онлайн-кинотеатр ведёт журнал просмотров <code>ids</code> в порядке просмотра. Если зритель несколько раз подряд включал один и тот же фильм, в журнале остаётся одна запись. Журнал может быть пустым. Измените журнал на месте: после вызова в нём должны остаться только оставленные записи. Верните новую длину.<br><br>Ниже решение. Поставьте к каждой из пяти строк фрагмент условия, из-за которого эта строка в коде появилась. Два фрагмента ни к одной строке не относятся.",
   "code": "def squash_log(ids):\n    if not ids:\n        return 0\n    w = 1\n    for r in range(1, len(ids)):\n        if ids[r] != ids[w - 1]:\n            ids[w] = ids[r]\n            w += 1\n    del ids[w:]\n    return w",
   "chips": [
    "журнал может быть пустым",
    "несколько раз подряд",
    "измените журнал на месте",
    "в нём должны остаться только оставленные записи",
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
   "text": "Функция удаляет из <code>nums</code> все элементы, равные <code>val</code>, в том же списке, сохраняя порядок, и возвращает новую длину. Вызов <code>remove_value([3, 1, 3, 2], 3)</code>: ожидается функция возвращает 2, список <code>[1, 2]</code>, а получается функция возвращает 4, список <code>[3, 1, 3, 2]</code>. Нажмите строку, из-за которой ответ неверный.",
   "code": "def remove_value(nums, val):\n    w = 0\n    for r in range(len(nums)):\n        if nums[r] != val:\n            nums[w] = nums[r]\n        w += 1\n    del nums[w:]\n    return w",
   "points": 2
  },
  {
   "id": "q06",
   "topic": "часть 4 · строка с ошибкой, функция 2",
   "type": "line",
   "text": "Функция получает два строго возрастающих списка и возвращает список общих элементов по возрастанию за O(n + m). Вызов <code>common_sorted([1, 4], [2, 4])</code>: ожидается <code>[4]</code>, а получается <code>[]</code>. Нажмите строку, из-за которой ответ неверный.",
   "code": "def common_sorted(a, b):\n    i = j = 0\n    res = []\n    while i < len(a) and j < len(b):\n        if a[i] == b[j]:\n            res.append(a[i])\n            i += 1\n            j += 1\n        elif a[i] < b[j]:\n            j += 1\n        else:\n            i += 1\n    return res",
   "points": 2
  },
  {
   "id": "q07",
   "topic": "часть 4 · строка с ошибкой, функция 3",
   "type": "line",
   "text": "Цены отсортированы по возрастанию. Функция возвращает наибольшую сумму цен двух разных товаров, не превышающую бюджет, или −1. Вызов <code>best_pair_under([1, 4, 5, 9], 10)</code>: ожидается 10 (1 + 9), а получается 9. Нажмите строку, из-за которой ответ неверный.",
   "code": "def best_pair_under(prices, budget):\n    i, j = 0, len(prices) - 1\n    best = -1\n    while i < j:\n        s = prices[i] + prices[j]\n        if s <= budget:\n            best = s\n            i += 1\n        else:\n            j -= 1\n    return best",
   "points": 2
  },
  {
   "id": "q08",
   "topic": "часть 5 · пропуски в коде",
   "type": "slots",
   "text": "Цены <code>prices</code> отсортированы по возрастанию, товаров не меньше двух. Функция возвращает сумму цен двух разных товаров, ближайшую к <code>target</code>. Если таких сумм несколько, подходит любая. Время O(n), память O(1). Поставьте в каждый пропуск ⟨1⟩–⟨5⟩ оператор, имя или строку. Одна карточка ставится в несколько пропусков, часть карточек не нужна.",
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
    "пропуск 4: …",
    "пропуск 5: …"
   ],
   "points": 5,
   "partial": true
  },
  {
   "id": "q09",
   "topic": "часть 6 · своё решение",
   "type": "code",
   "text": "Два склада присылают списки артикулов <code>a</code> и <code>b</code>. Каждый список отсортирован по неубыванию, внутри списка артикулы могут повторяться. Напишите <code>merge_unique(a, b)</code>: функция возвращает <b>новый</b> список всех различных артикулов из обоих списков по возрастанию. Время O(n + m); <code>sorted</code>, <code>list.sort</code>, <code>set</code> и <code>dict</code> не использовать; входные списки не менять.<br>Примеры: <code>[1, 3, 3, 7]</code> и <code>[2, 3, 8]</code> → <code>[1, 2, 3, 7, 8]</code>; <code>[]</code> и <code>[4, 4, 5]</code> → <code>[4, 5]</code>; <code>[5, 5, 5]</code> и <code>[5, 5]</code> → <code>[5]</code>.<br>Тесты (19): пример, пустые списки, одинаковые элементы, все числа одного списка меньше другого, чередование, хвосты с повторами, повтор на стыке, отрицательные и большие числа, входы не меняются, результат — новый список, запрет sorted/set/dict, 400 случайных входов, скорость на 20 000 чисел. Баллы: все 19 тестов — 8, от 15 до 18 — 4. Засчитывается последний запуск; после правки кода тесты нужно запустить снова.",
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
