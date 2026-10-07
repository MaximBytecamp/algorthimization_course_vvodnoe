/* Итоговый тест модуля 9 «Скользящее окно», ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-m09-r1",
 "prefix": "AL09",
 "title": "Модуль 9 · скользящее окно",
 "minutes": 40,
 "salt": "op04-m09-2026-oct",
 "context": "Код в вопросах — Python 3.12, функции те же, что в главах модуля 9. Под n понимается длина списка, под k — длина окна. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 17,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 13,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 9,
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
   "topic": "9.2 · признаки в условии",
   "type": "multi",
   "text": "В каких условиях подходит окно фиксированной длины? Отметьте все такие условия.",
   "options": [
    "Найти наибольшую выручку магазина за любые 7 дней подряд",
    "Посчитать подстроки длины 3, в которых все три буквы разные",
    "Найти самый короткий отрезок, сумма которого не меньше S",
    "Выбрать любые k чисел с наибольшей суммой, не обязательно подряд",
    "Для каждого дня найти среднюю температуру за последние 5 дней"
   ]
  },
  {
   "id": "q02",
   "topic": "9.1 · число окон",
   "type": "number",
   "text": "Сколько окон длины 6 в списке из 20 элементов?",
   "unit": "окон"
  },
  {
   "id": "q03",
   "topic": "9.3 · сдвиг окна",
   "type": "number",
   "text": "Окно длины 3 стоит на элементах с индексами 1–3, его сумма 17. Окно сдвигается на одну позицию вправо. Какая сумма у нового окна?",
   "unit": "",
   "image": {
    "svg": "<svg viewBox=\"0 0 486 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [8, 3, 5, 9, 2, 7]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">nums</text><rect x=\"66\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"98.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">8</text><text x=\"98.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"136\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"168.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">3</text><text x=\"168.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"206\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"238.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">5</text><text x=\"238.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"276\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"308.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">9</text><text x=\"308.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text><rect x=\"346\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"378.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"378.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[4]</text><rect x=\"416\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"448.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">7</text><text x=\"448.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[5]</text></svg>",
    "caption": "nums = [8, 3, 5, 9, 2, 7], k = 3, окно nums[1:4] = [3, 5, 9]"
   }
  },
  {
   "id": "q04",
   "topic": "9.3 · код сдвига",
   "type": "slots",
   "text": "Заполните пропуски в функции <code>window_sums</code>: она возвращает сумму каждого окна длины k. Одну карточку можно ставить несколько раз.",
   "code": "def window_sums(nums, k):\n    total = sum(nums[:k])\n    sums = [1]\n    for r in range([2], len(nums)):\n        total += nums[r] - nums[[3]]\n        sums.append(total)\n    return sums",
   "chips": [
    "[total]",
    "[]",
    "k",
    "k + 1",
    "r - k",
    "r - k + 1"
   ],
   "slots": [
    "[1] начало ответа",
    "[2] первый пришедший элемент",
    "[3] индекс ушедшего элемента"
   ]
  },
  {
   "id": "q05",
   "topic": "9.3 · состояние окна",
   "type": "single",
   "text": "Какое состояние окна нельзя исправить при сдвиге за O(1), зная только ушедший и пришедший элементы?",
   "options": [
    "Число отрицательных элементов в окне",
    "Наибольший элемент в окне",
    "Сумма элементов окна",
    "Число гласных в подстроке"
   ]
  },
  {
   "id": "q06",
   "topic": "9.4 · прогон best_window",
   "type": "number",
   "text": "Что вернёт вызов ниже? Введите начало лучшего окна — первое число в ответе.",
   "code": "def best_window(nums, k):\n    if k < 1 or k > len(nums):\n        raise ValueError(\"k должно быть от 1 до len(nums)\")\n    total = sum(nums[:k])\n    best, start = total, 0\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        if total > best:\n            best, start = total, r - k + 1\n    return (start, best)\n\nprint(best_window([4, -1, 6, -2, 7, -9, 3], 3))",
   "unit_before": "start ="
  },
  {
   "id": "q07",
   "topic": "9.4 · знак сравнения",
   "type": "single",
   "text": "По условию при равных суммах нужно самое левое окно. Окна проходятся слева направо. Какое сравнение должно стоять перед обновлением лучшего окна?",
   "options": [
    "<code>if total &gt; best:</code>",
    "<code>if total &gt;= best:</code>",
    "<code>if total != best:</code>",
    "<code>if best &gt; total:</code>"
   ]
  },
  {
   "id": "q08",
   "topic": "9.4 · ошибка в best_window",
   "type": "line",
   "text": "Функция вернула <code>(0, 0)</code>, хотя ни одно окно не даёт сумму 0. Выберите строку с ошибкой.",
   "code": "def best_window(nums, k):\n    if k < 1 or k > len(nums):\n        raise ValueError(\"k должно быть от 1 до len(nums)\")\n    total = sum(nums[:k])\n    best, start = 0, 0\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        if total > best:\n            best, start = total, r - k + 1\n    return (start, best)"
  },
  {
   "id": "q09",
   "topic": "9.4 · LeetCode 643",
   "type": "number",
   "text": "Чему равно наибольшее среднее отрезка длины 2?",
   "code": "def find_max_average(nums, k):\n    total = sum(nums[:k])\n    best = total\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        best = max(best, total)\n    return best / k\n\nprint(find_max_average([3, -1, 8, 4, -6, 10], 2))",
   "unit": ""
  },
  {
   "id": "q10",
   "topic": "9.5 · порядок шагов",
   "type": "order",
   "text": "Расставьте шаги функции <code>max_events(times, w)</code> в порядке выполнения. Первый шаг — сверху.",
   "items": [
    "Проверить, что w больше нуля",
    "Поставить l = 0 и best = 0",
    "Взять следующее событие times[r]",
    "Пока times[r] − times[l] ≥ w, сдвигать l вправо",
    "Посчитать события окна r − l + 1 и обновить best",
    "После всех событий вернуть best"
   ]
  },
  {
   "id": "q11",
   "topic": "9.5 · события в окне",
   "type": "number",
   "text": "Сколько событий попадает в лучшее окно длиной 4 секунды? Окно — полуинтервал <code>[s, s + 4)</code>.",
   "unit": "событий",
   "image": {
    "svg": "<svg viewBox=\"0 0 566 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [2, 3, 5, 9, 10, 11, 13]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">times</text><rect x=\"76\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"108.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"108.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"146\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"178.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">3</text><text x=\"178.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"216\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"248.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">5</text><text x=\"248.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"286\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"318.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">9</text><text x=\"318.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text><rect x=\"356\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"388.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">10</text><text x=\"388.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[4]</text><rect x=\"426\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"458.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">11</text><text x=\"458.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[5]</text><rect x=\"496\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"528.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">13</text><text x=\"528.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[6]</text></svg>",
    "caption": "times = [2, 3, 5, 9, 10, 11, 13], w = 4"
   }
  },
  {
   "id": "q12",
   "topic": "9.5 · монотонность",
   "type": "single",
   "text": "В <code>max_events</code> цикл <code>while</code> стоит внутри <code>for</code>. Почему время работы O(n)?",
   "options": [
    "Цикл while выполняется на каждом шаге не больше одного раза",
    "l только растёт и за всю работу сдвигается не больше n раз",
    "Окно по времени никогда не содержит больше w событий",
    "Список отсортирован, поэтому while заканчивается сразу"
   ]
  },
  {
   "id": "q13",
   "topic": "9.5 · ошибка границы",
   "type": "line",
   "text": "На входе <code>[0, 5]</code>, w = 5 функция вернула 2, а окно <code>[0, 5)</code> не включает момент 5. Выберите строку с ошибкой.",
   "code": "def max_events(times, w):\n    if w <= 0:\n        raise ValueError(\"w должно быть больше 0\")\n    best = 0\n    l = 0\n    for r in range(len(times)):\n        while times[r] - times[l] > w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best"
  },
  {
   "id": "q14",
   "topic": "9.6 · граничные входы",
   "type": "sort",
   "text": "Разложите вызовы <code>best_window</code> по тому, что получится: исключение <code>ValueError</code>, ровно одно окно или окна из одного элемента.",
   "items": [
    "best_window([1, 2], 0)",
    "best_window([1, 2, 3], 3)",
    "best_window([4, 1, 2], 1)",
    "best_window([], 1)",
    "best_window([1, 2], 3)",
    "best_window([5, 6], 2)"
   ],
   "buckets": [
    "ValueError",
    "одно окно — весь список",
    "окна по одному элементу"
   ]
  },
  {
   "id": "q15",
   "topic": "9.6 · проверка входа",
   "type": "single",
   "text": "Почему проверку неверного k пишут через <code>if … raise ValueError</code>, а не через <code>assert</code>?",
   "options": [
    "assert выключается при запуске Python с ключом -O",
    "assert работает медленнее, чем проверка через if",
    "assert нельзя писать внутри функции",
    "assert бросает исключение только в тестах pytest"
   ]
  },
  {
   "id": "q16",
   "topic": "9.7 · замер",
   "type": "number",
   "text": "В опыте 3 главы 9.7, где k = n / 2, время срезов при n = 16 000 было 284 мс, при n = 32 000 — 1137 мс. Во сколько раз выросло время? Округлите до целого.",
   "unit": "раз"
  },
  {
   "id": "q17",
   "topic": "9.7, 9.11 · сложность",
   "type": "sort",
   "text": "Разложите способы по времени работы. n — длина списка.",
   "items": [
    "Сумма каждого окна срезами при постоянном k = 100",
    "Сумма каждого окна срезами при k = n / 2",
    "Сумма каждого окна сдвигом при любом k",
    "max_events: окно по времени с while внутри for",
    "Разница оценок: сортировка копии, затем окно длины k"
   ],
   "buckets": [
    "O(n)",
    "O(n log n)",
    "O(n²)"
   ]
  },
  {
   "id": "q18",
   "topic": "9.8 · окно в оставшихся картах",
   "type": "single",
   "text": "Карт в ряду 9, взять нужно 4 карты, только с левого и правого края. Какое окно ищет решение главы 9.8?",
   "options": [
    "Окно длины 4 с наибольшей суммой очков",
    "Окно длины 5 с наименьшей суммой очков",
    "Окно длины 5 с наибольшей суммой очков",
    "Окно длины 4 с наименьшей суммой очков"
   ]
  },
  {
   "id": "q19",
   "topic": "9.8 · LeetCode 1423",
   "type": "number",
   "text": "Сколько очков наберёт лучший способ взять 2 карты с краёв ряда?",
   "code": "def max_card_points(cards, k):\n    size = len(cards) - k\n    total = sum(cards[:size])\n    smallest = total\n    for r in range(size, len(cards)):\n        total += cards[r] - cards[r - size]\n        smallest = min(smallest, total)\n    return sum(cards) - smallest\n\nprint(max_card_points([5, 1, 1, 8, 2, 6], 2))",
   "unit": "очков"
  },
  {
   "id": "q20",
   "topic": "9.9 · ошибка сложности",
   "type": "single",
   "text": "Эта версия <code>max_events</code> отвечает верно на любом входе. Что с ней не так?",
   "code": "def max_events(times, w):\n    best = 0\n    for r in range(len(times)):\n        l = 0\n        while times[r] - times[l] >= w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "options": [
    "Время O(n²): l на каждом шаге начинается с нуля",
    "Событие на правой границе тоже попадает в окно",
    "На пустом списке функция падает с IndexError",
    "Ответ на единицу меньше: нужно считать r − l + 2"
   ]
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

/* Приводит ответ к форме ключа. Пустой или неполный ответ даёт null. */
function normalized(q, a) {
  if (a == null) return null;
  switch (q.type) {
    case 'single': case 'multi': case 'line':
      return a.length ? [...a].sort((x, y) => x - y) : null;
    case 'order':
      return a.length ? a : null;
    case 'slots': case 'sort':
      return a.every(x => x !== null && x !== undefined) ? a : null;
    case 'number': {
      const s = String(a).replace(/\s/g, '').replace(',', '.');
      return s !== '' && isFinite(Number(s)) ? [Number(s)] : null;
    }
  }
  return null;
}

async function isCorrect(q, a) {
  const norm = normalized(q, a);
  if (!norm) return false;
  const key = (await secretData())[q.id].key;
  return JSON.stringify(norm) === JSON.stringify(key);
}

/* Ответ в коде результата: строка на вопрос. Номера — одной цифрой, пусто — x. */
function encodeAnswer(q, a) {
  if (a == null) return '';
  if (q.type === 'number') return String(a).replace(/[^0-9.,\-]/g, '').slice(0, 12);
  if (q.type === 'slots' || q.type === 'sort') return a.map(x => (x === null || x === undefined) ? 'x' : String(x)).join('');
  return a.join('');
}

function decodeAnswer(q, s) {
  s = s || '';
  if (q.type === 'number') return s === '' ? null : s;
  if (s === '') return null;
  const parts = s.split('');
  if (q.type === 'slots' || q.type === 'sort') return parts.map(c => c === 'x' ? null : Number(c));
  return parts.map(Number);
}

function gradeFor(score) {
  return QUIZ.grades.find(g => score >= g.min) || QUIZ.grades[QUIZ.grades.length - 1];
}
