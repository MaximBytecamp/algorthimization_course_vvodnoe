/* Практическая работа модуля 9 «Скользящее окно», ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-praktika-m09-r1",
 "prefix": "PR09",
 "title": "Практическая работа · модуль 9",
 "minutes": 90,
 "salt": "op04-pr09-2026-oct",
 "fixedOrder": true,
 "maxScore": 49,
 "context": "Код в заданиях — Python 3.12. Под n понимается длина списка, под k — длина окна. Дополнительная память — структуры, размер которых растёт с входом: новый список, срез, словарь; отдельные переменные — O(1). Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место. В заданиях из нескольких мест балл ставится за каждое верно занятое место.",
 "grades": [
  {
   "min": 44,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 34,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 25,
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
   "topic": "часть 1 · время и память кода",
   "type": "slots",
   "text": "Пять функций из модуля 9. Все ответы верные, различаются способы. Поставьте каждой функции оценку времени и дополнительной памяти. n — длина списка, k — длина окна. Одну карточку можно ставить на несколько мест.",
   "code": "# ── Функция А: наибольшая сумма окна длины k ──\ndef best_sum_slices(nums, k):\n    best = sum(nums[:k])\n    for s in range(1, len(nums) - k + 1):\n        best = max(best, sum(nums[s:s + k]))\n    return best\n\n# ── Функция Б: наибольшая сумма окна длины k ──\ndef best_sum_shift(nums, k):\n    total = 0\n    for i in range(k):\n        total += nums[i]\n    best = total\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        best = max(best, total)\n    return best\n\n# ── Функция В: наибольшее число событий в окне длиной w секунд ──\ndef max_events(times, w):\n    best = 0\n    l = 0\n    for r in range(len(times)):\n        while times[r] - times[l] >= w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best\n\n# ── Функция Г: наименьший разброс среди любых k оценок ──\ndef min_difference(scores, k):\n    s = sorted(scores)\n    best = s[k - 1] - s[0]\n    for i in range(1, len(s) - k + 1):\n        best = min(best, s[i + k - 1] - s[i])\n    return best\n\n# ── Функция Д: наибольшее число событий в окне длиной w секунд ──\ndef max_events_reset(times, w):\n    best = 0\n    for r in range(len(times)):\n        l = 0\n        while times[r] - times[l] >= w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "chips": [
    "O(1)",
    "O(k)",
    "O(n)",
    "O(n·k)",
    "O(n log n)",
    "O(n²)"
   ],
   "slots": [
    "Функция А · время",
    "Функция А · доп. память",
    "Функция Б · время",
    "Функция Б · доп. память",
    "Функция В · время",
    "Функция В · доп. память",
    "Функция Г · время",
    "Функция Г · доп. память",
    "Функция Д · время",
    "Функция Д · доп. память"
   ],
   "points": 10,
   "partial": true
  },
  {
   "id": "q02",
   "topic": "часть 2 · техника по условию",
   "type": "sort",
   "text": "Каждая карточка — условие задачи. Поставьте её к технике, которой задачу решают быстрее всего при этих ограничениях. «Другая техника» — словарь, окно переменной длины, сортировка и всё, что не входит в первые четыре группы.",
   "items": [
    "Цены по возрастанию. Найти два товара с суммой ровно S. Дополнительная память — O(1).",
    "Найти наибольшую сумму продаж за любые 7 дней подряд.",
    "Удалить из списка все отрицательные числа в том же списке, сохранив порядок остальных.",
    "Моменты запросов по возрастанию. Сколько запросов было за самую нагруженную минуту?",
    "Числа в произвольном порядке. Вернуть индексы двух чисел с суммой S, n до 10⁶.",
    "Проверить, что строка читается одинаково слева направо и справа налево.",
    "Для каждого часа найти среднее число заказов за последние 3 часа.",
    "Найти самый короткий отрезок, сумма которого не меньше S. Числа положительные."
   ],
   "buckets": [
    "Два указателя навстречу",
    "Указатели чтения и записи",
    "Окно фиксированной длины",
    "Окно по времени",
    "Другая техника"
   ],
   "points": 8,
   "partial": true
  },
  {
   "id": "q03",
   "topic": "часть 3 · техника, время и память",
   "type": "slots",
   "text": "Для каждой из четырёх задач выберите технику, которой её решают лучше всего при указанных ограничениях, и оценки времени и дополнительной памяти этого решения. Одну карточку можно ставить на несколько мест.<br><br><b>Задача 1.</b> Оценки n студентов записаны в произвольном порядке, n ≤ 10⁵. Выберите любых k студентов так, чтобы разница между наибольшей и наименьшей оценкой была наименьшей, и верните эту разницу. Исходный список менять нельзя.<br><br><b>Задача 2.</b> Температуры за n дней записаны по порядку. Верните наибольшую среднюю температуру за k дней подряд. Дополнительная память — O(1).<br><br><b>Задача 3.</b> Моменты входов в здание записаны в секундах по возрастанию. Сколько человек вошло за самые загруженные 10 минут?<br><br><b>Задача 4.</b> Список из n ≤ 300 чисел в произвольном порядке. Верните номера двух чисел с суммой S. Дополнительная память — O(1), список менять нельзя.",
   "chips": [
    "Два указателя навстречу",
    "Указатели чтения и записи",
    "Окно фиксированной длины",
    "Окно по времени",
    "Сортировка копии, затем окно",
    "Перебор всех пар",
    "O(1)",
    "O(n)",
    "O(n log n)",
    "O(n²)"
   ],
   "slots": [
    "Задача 1 · техника",
    "Задача 1 · время",
    "Задача 1 · доп. память",
    "Задача 2 · техника",
    "Задача 2 · время",
    "Задача 2 · доп. память",
    "Задача 3 · техника",
    "Задача 3 · время",
    "Задача 3 · доп. память",
    "Задача 4 · техника",
    "Задача 4 · время",
    "Задача 4 · доп. память"
   ],
   "points": 12,
   "partial": true
  },
  {
   "id": "q04",
   "topic": "часть 4 · строка с ошибкой, функция 1",
   "type": "line",
   "text": "Функция возвращает начало и сумму окна длины k с наибольшей суммой. При равных суммах нужно самое левое окно. <br><br><b>Вызов:</b> <code>best_window([5, 1, 5, 1], 2)</code><br><b>Ожидается:</b> <code>(0, 6)</code>.<br><b>Получается:</b> <code>(2, 6)</code>.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def best_window(nums, k):\n    total = sum(nums[:k])\n    best, start = total, 0\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        if total >= best:\n            best, start = total, r - k + 1\n    return (start, best)",
   "points": 2
  },
  {
   "id": "q05",
   "topic": "часть 4 · строка с ошибкой, функция 2",
   "type": "line",
   "text": "Функция возвращает наибольшее число событий в окне <code>[s, s + w)</code>: момент <code>s + w</code> в окно не входит. Моменты отсортированы. <br><br><b>Вызов:</b> <code>max_events([0, 5], 5)</code><br><b>Ожидается:</b> 1.<br><b>Получается:</b> 2.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def max_events(times, w):\n    best = 0\n    l = 0\n    for r in range(len(times)):\n        while times[r] - times[l] > w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "points": 2
  },
  {
   "id": "q06",
   "topic": "часть 4 · строка с ошибкой, функция 3",
   "type": "line",
   "text": "Функция возвращает наибольшее число гласных a, e, i, o, u в подстроке длины k. <br><br><b>Вызов:</b> <code>max_vowels('abab', 2)</code><br><b>Ожидается:</b> 1.<br><b>Получается:</b> 2.<br><br>Нажмите строку, из-за которой ответ неверный.",
   "code": "def max_vowels(s, k):\n    vowels = set(\"aeiou\")\n    count = sum(1 for ch in s[:k] if ch in vowels)\n    best = count\n    for r in range(k, len(s)):\n        count += (s[r] in vowels)\n        best = max(best, count)\n    return best",
   "points": 2
  },
  {
   "id": "q07",
   "topic": "часть 5 · пропуски в коде",
   "type": "slots",
   "text": "Функция строит список <code>avgs</code> длины n: на месте <code>i</code> — среднее элементов с <code>i − k</code> по <code>i + k</code> целочисленным делением. Если слева или справа от <code>i</code> меньше k элементов, там остаётся −1. Это LeetCode 2090. Время O(n), память O(1) кроме ответа. Поставьте в каждый пропуск ⟨1⟩–⟨5⟩ выражение или знак сравнения. Часть карточек не нужна.",
   "code": "def k_radius_averages(nums, k):\n    n = len(nums)\n    avgs = [-1] * n\n    size = ⟨1⟩\n    if size ⟨2⟩ n:\n        return avgs\n    total = sum(nums[:size])\n    avgs[⟨3⟩] = total // size\n    for r in range(size, n):\n        total += nums[r] - nums[⟨4⟩]\n        avgs[⟨5⟩] = total // size\n    return avgs",
   "chips": [
    "2 * k + 1",
    "2 * k",
    "k",
    "k + 1",
    "r - size",
    "r - size + 1",
    "r - k",
    ">",
    ">="
   ],
   "slots": [
    "пропуск 1: size = …",
    "пропуск 2: if size … n:",
    "пропуск 3: avgs[…] = total // size",
    "пропуск 4: total += nums[r] - nums[…]",
    "пропуск 5: avgs[…] = total // size"
   ],
   "points": 5,
   "partial": true
  },
  {
   "id": "q08",
   "topic": "часть 6 · своё решение",
   "type": "code",
   "text": "<b>Условие.</b> Плейлист — длительности треков в секундах по порядку, все длительности положительные. Напишите <code>best_block(durations, k, limit)</code>: функция выбирает k треков подряд с наибольшей общей длительностью, которая не превышает <code>limit</code>, и возвращает эту длительность. Если ни один блок из k треков подряд не укладывается в limit, функция возвращает −1.<br><br><b>Ограничения.</b> <code>1 ≤ k ≤ len(durations)</code>, иначе <code>ValueError</code>. Время O(n) при любом k, дополнительная память O(1). Список не менять.<br><br><b>Примеры.</b><br><code>[180, 240, 200, 300, 150, 210]</code>, k = 3, limit = 700 → <code>660</code>: блок 240 + 200 + 300 = 740 длиннее лимита<br><code>[400, 500, 600]</code>, k = 2, limit = 800 → <code>−1</code><br><code>[300, 400, 100]</code>, k = 2, limit = 700 → <code>700</code><br><br><b>Что проверяют 16 тестов.</b> Примеры; блок с наибольшей суммой не укладывается в лимит; k = 1 и k = n; лучший блок первый и последний; k = 0, k &lt; 0, k &gt; n и пустой список; список после вызова тот же; 500 случайных плейлистов против перебора; 40 000 треков при k = 20 000 быстрее чем за секунду.<br><br><b>Баллы.</b> Все 16 тестов — 8 баллов, от 13 до 15 — 4 балла. Засчитывается последний запуск. Если код изменён после запуска, тесты нужно запустить снова, иначе ответ не сохранится.",
   "points": 8,
   "steps": [
    [
     16,
     8
    ],
    [
     13,
     4
    ]
   ],
   "start": "def best_block(durations, k, limit):\n    best = -1\n    # Ваш код: проверьте k, посчитайте первый блок,\n    # затем сдвигайте окно и запоминайте лучшую сумму не больше limit.\n    return best\n",
   "tests": "import random\nimport time\n\n\ndef _brute(durations, k, limit):\n    sums = [sum(durations[s:s + k]) for s in range(len(durations) - k + 1)]\n    fit = [x for x in sums if x <= limit]\n    return max(fit) if fit else -1\n\n\ndef _raises(*args):\n    try:\n        best_block(*args)\n    except ValueError:\n        return True\n    return False\n\n\ndef test_example():\n    \"\"\"пример из условия\"\"\"\n    assert best_block([180, 240, 200, 300, 150, 210], 3, 700) == 660\n\n\ndef test_best_window_too_long():\n    \"\"\"блок с наибольшей суммой не укладывается в лимит\"\"\"\n    assert best_block([100, 500, 500, 100], 2, 700) == 600\n\n\ndef test_nothing_fits():\n    \"\"\"ни один блок не укладывается — -1\"\"\"\n    assert best_block([400, 500, 600], 2, 800) == -1\n\n\ndef test_exact_limit():\n    \"\"\"сумма, равная лимиту, подходит\"\"\"\n    assert best_block([300, 400, 100], 2, 700) == 700\n\n\ndef test_k_is_one():\n    \"\"\"k = 1: лучший одиночный трек не длиннее лимита\"\"\"\n    assert best_block([90, 300, 250, 120], 1, 260) == 250\n\n\ndef test_k_is_n():\n    \"\"\"k = n: блок один — весь плейлист\"\"\"\n    assert best_block([100, 200, 300], 3, 600) == 600\n    assert best_block([100, 200, 300], 3, 599) == -1\n\n\ndef test_best_at_end():\n    \"\"\"лучший блок — последний\"\"\"\n    assert best_block([10, 20, 30, 40, 50], 2, 95) == 90\n\n\ndef test_best_at_start():\n    \"\"\"лучший блок — первый\"\"\"\n    assert best_block([50, 40, 30, 20, 10], 2, 95) == 90\n\n\ndef test_k_zero():\n    \"\"\"k = 0 — ValueError\"\"\"\n    assert _raises([1, 2], 0, 10)\n\n\ndef test_k_negative():\n    \"\"\"k < 0 — ValueError\"\"\"\n    assert _raises([1, 2], -1, 10)\n\n\ndef test_k_over_n():\n    \"\"\"k больше длины — ValueError\"\"\"\n    assert _raises([1, 2], 3, 10)\n\n\ndef test_empty():\n    \"\"\"пустой плейлист — ValueError\"\"\"\n    assert _raises([], 1, 10)\n\n\ndef test_does_not_change_input():\n    \"\"\"плейлист после вызова тот же\"\"\"\n    d = [180, 240, 200]\n    best_block(d, 2, 500)\n    assert d == [180, 240, 200]\n\n\ndef test_random_small():\n    \"\"\"400 случайных плейлистов: ответ совпадает с перебором\"\"\"\n    rnd = random.Random(9)\n    for _ in range(400):\n        d = [rnd.randint(1, 50) for _ in range(rnd.randint(1, 15))]\n        k = rnd.randint(1, len(d))\n        limit = rnd.randint(1, 50 * k)\n        assert best_block(d, k, limit) == _brute(d, k, limit), (d, k, limit)\n\n\ndef test_random_large_values():\n    \"\"\"100 случайных плейлистов с длинными треками\"\"\"\n    rnd = random.Random(10)\n    for _ in range(100):\n        d = [rnd.randint(1000, 100000) for _ in range(rnd.randint(1, 30))]\n        k = rnd.randint(1, len(d))\n        limit = rnd.randint(1000 * k, 100000 * k)\n        assert best_block(d, k, limit) == _brute(d, k, limit), (d, k, limit)\n\n\ndef test_fast_with_long_window():\n    \"\"\"40 000 треков и k = 20 000 — быстрее чем за секунду\"\"\"\n    rnd = random.Random(11)\n    d = [rnd.randint(60, 600) for _ in range(40000)]\n    start = time.perf_counter()\n    best_block(d, 20000, 8_000_000)\n    spent = time.perf_counter() - start\n    assert spent < 1, f\"{spent:.2f} с: проверьте, что сумма окна не пересчитывается заново\"\n",
   "limit": 30000
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
