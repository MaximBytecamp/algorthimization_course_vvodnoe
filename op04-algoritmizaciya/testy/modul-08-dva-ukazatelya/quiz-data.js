/* Итоговый тест модуля 8 «Два указателя», ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-m08-r1",
 "prefix": "AL08",
 "title": "Модуль 8 · два указателя",
 "minutes": 40,
 "salt": "op04-m08-2026-sep",
 "context": "Код в вопросах — Python 3.12, функции те же, что в главах модуля 8. Под n понимается длина списка. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
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
   "topic": "8.2 · признаки в условии",
   "type": "multi",
   "text": "В каких условиях подходят два указателя, которые стартуют с двух концов и сходятся? Отметьте все такие условия.",
   "options": [
    "Цены отсортированы по возрастанию, нужно найти два товара с заданной суммой",
    "Нужно проверить, читается ли строка одинаково слева направо и справа налево",
    "Температуры записаны по дням, нужно вернуть номера двух дней с суммой 40",
    "В массиве есть отрицательные числа, нужно посчитать отрезки с суммой S",
    "Массив отсортирован и содержит отрицательные числа, нужны квадраты по возрастанию"
   ]
  },
  {
   "id": "q02",
   "topic": "8.11 · interview canvas",
   "type": "order",
   "text": "Расставьте этапы решения задачи на алгоритмической секции в порядке шаблона interview canvas. Первый этап — сверху.",
   "items": [
    "Пересказать условие своими словами",
    "Уточнить порядок данных, размер и крайние случаи",
    "Записать несколько входов с ответами",
    "Назвать решение перебором и его сложность",
    "Найти правило быстрого решения и обосновать его",
    "Назвать время и память быстрого решения",
    "Записать функцию в редакторе",
    "Прогнать код руками на своих примерах"
   ]
  },
  {
   "id": "q03",
   "topic": "8.4 · число пар",
   "type": "number",
   "text": "Каталог из 9 цен, пары с нужной суммой в нём нет. Сколько пар проверит перебор, прежде чем вернуть <code>None</code>?",
   "code": "def pair_sum_brute(prices, target):\n    n = len(prices)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if prices[i] + prices[j] == target:\n                return (i, j)\n    return None",
   "unit": "пар"
  },
  {
   "id": "q04",
   "topic": "8.4 · число ходов",
   "type": "number",
   "text": "Каталог из 9 цен, пары с нужной суммой нет. Какое наибольшее число ходов могут сделать указатели в <code>pair_sum</code>, прежде чем встретятся?",
   "unit": "ходов"
  },
  {
   "id": "q05",
   "topic": "8.4 · правило сдвига",
   "type": "single",
   "text": "Ищем пару с суммой 970. Указатели стоят на крайних ценах: 150 и 990, их сумма 1140. Какой ход верный?",
   "options": [
    "Сдвинуть j влево: 990 не даёт 970 даже с самой дешёвой ценой",
    "Сдвинуть i вправо: 150 — самая дешёвая цена, её нужно заменить",
    "Сдвинуть оба указателя: так быстрее найдётся ответ",
    "Вернуть None: крайние цены не подошли, пары нет"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 506 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [150, 320, 410, 560, 780, 990]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">prices</text><rect x=\"86\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"118.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">150</text><text x=\"118.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"156\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"188.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">320</text><text x=\"188.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"226\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"258.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">410</text><text x=\"258.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"296\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"328.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">560</text><text x=\"328.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text><rect x=\"366\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"398.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">780</text><text x=\"398.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[4]</text><rect x=\"436\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"468.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">990</text><text x=\"468.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[5]</text></svg>",
    "caption": "prices = [150, 320, 410, 560, 780, 990], target = 970"
   }
  },
  {
   "id": "q06",
   "topic": "8.4 · код задачи 1",
   "type": "slots",
   "text": "Заполните пропуски в функции <code>pair_sum</code>. Одну карточку можно ставить несколько раз.",
   "code": "def pair_sum(prices, target):\n    i, j = 0, len(prices) - 1\n    while i [1] j:\n        s = prices[i] + prices[j]\n        if s == target:\n            return (i, j)\n        if s [2] target:\n            i += 1\n        else:\n            j [3] 1\n    return None",
   "chips": [
    "<",
    "<=",
    ">",
    "-=",
    "+=",
    "!="
   ],
   "slots": [
    "[1] условие цикла",
    "[2] когда сдвигать i",
    "[3] сдвиг j"
   ]
  },
  {
   "id": "q07",
   "topic": "8.4 · прогон",
   "type": "number",
   "text": "Сколько ходов (сдвигов <code>i</code> или <code>j</code>) сделают указатели, прежде чем функция вернёт ответ?",
   "code": "prices = [10, 20, 35, 50, 65, 80, 95, 120]\npair_sum(prices, 85)",
   "unit": "ходов"
  },
  {
   "id": "q08",
   "topic": "8.5 · инвариант",
   "type": "single",
   "text": "Какое утверждение — инвариант <code>pair_sum</code>, верный перед каждой проверкой условия цикла?",
   "options": [
    "Сумма prices[i] + prices[j] с каждым шагом приближается к цели",
    "Если пара с суммой target есть, она лежит на участке с i по j",
    "Все цены левее i меньше цели, все правее j — больше",
    "Указатели i и j всегда стоят на соседних позициях"
   ]
  },
  {
   "id": "q09",
   "topic": "8.5 · монотонность",
   "type": "single",
   "text": "Из чего следует, что <code>pair_sum</code> работает за O(n)?",
   "options": [
    "Указатели сравнивают сразу две цены за один шаг цикла",
    "Список отсортирован, а в отсортированном списке любой поиск — O(n)",
    "Указатели только сходятся и ни разу не возвращаются назад",
    "Цикл while всегда быстрее вложенных циклов for"
   ]
  },
  {
   "id": "q10",
   "topic": "8.9 · ошибка в pair_sum",
   "type": "line",
   "text": "На <code>[100, 250, 600]</code> с целью 500 функция вернула <code>(1, 1)</code>. Щёлкните строку с ошибкой.",
   "code": "def pair_sum(prices, target):\n    i, j = 0, len(prices) - 1\n    while i <= j:\n        s = prices[i] + prices[j]\n        if s == target:\n            return (i, j)\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return None"
  },
  {
   "id": "q11",
   "topic": "8.9 · ошибка в move_zeros",
   "type": "line",
   "text": "Функция должна перенести нули в конец, сохранив порядок остальных. На <code>[0, 4, 0, 0, 7, 2]</code> она оставила <code>[4, 7, 2, 0, 7, 2]</code>. Щёлкните строку с ошибкой.",
   "code": "def move_zeros(nums):\n    w = 0\n    for r in range(len(nums)):\n        if nums[r] != 0:\n            nums[w] = nums[r]\n            w += 1"
  },
  {
   "id": "q12",
   "topic": "8.1, 8.7 · формы техники",
   "type": "sort",
   "text": "Разложите задачи по формам двух указателей.",
   "items": [
    "Пара с заданной суммой в отсортированных ценах",
    "Удаление повторов из отсортированного списка на месте",
    "Проверка, читается ли строка одинаково с обеих сторон",
    "Сжатие серий одинаковых символов в том же списке",
    "Получается ли слово из текста вычёркиванием букв",
    "Перенос нулей в конец с сохранением порядка",
    "Слияние двух отсортированных журналов событий",
    "Разделение по порогу без сохранения порядка"
   ],
   "buckets": [
    "навстречу, с двух концов",
    "в одну сторону по одному списку",
    "в одну сторону по двум последовательностям"
   ]
  },
  {
   "id": "q13",
   "topic": "8.7 · удаление повторов",
   "type": "number",
   "text": "Что вернёт функция?",
   "code": "def dedup_sorted(ids):\n    if not ids:\n        return 0\n    w = 1\n    for r in range(1, len(ids)):\n        if ids[r] != ids[w - 1]:\n            ids[w] = ids[r]\n            w += 1\n    del ids[w:]\n    return w\n\nids = [3, 3, 3, 5, 8, 8, 9]\nresult = dedup_sorted(ids)"
  },
  {
   "id": "q14",
   "topic": "8.7 · сжатие",
   "type": "number",
   "text": "Какой длины станет список после вызова <code>compress</code>? Серию длины больше 9 функция записывает по цифрам.",
   "code": "chars = list(\"xxxxxxxxxxxxy\")   # 12 символов x и один y\nresult = compress(chars)"
  },
  {
   "id": "q15",
   "topic": "8.7 · запись и чтение",
   "type": "single",
   "text": "Почему в <code>compress</code> запись в тот же список не затирает символы, которые ещё не прочитаны?",
   "options": [
    "Функция сначала копирует список и пишет в копию",
    "Сжатая запись серии никогда не длиннее самой серии",
    "Символы пишутся с конца списка, а читаются с начала",
    "Python запрещает запись в ячейку правее указателя чтения"
   ]
  },
  {
   "id": "q16",
   "topic": "8.7 · подпоследовательность",
   "type": "single",
   "text": "Что вернёт <code>is_subsequence(\"нос\", \"сосна\")</code>?",
   "code": "def is_subsequence(word, text):\n    i = 0\n    for j in range(len(text)):\n        if i < len(word) and text[j] == word[i]:\n            i += 1\n    return i == len(word)",
   "options": [
    "True: все буквы н, о, с в тексте есть",
    "False: после буквы н в тексте нет буквы о",
    "True: буквы н, о, с встречаются по порядку",
    "False: слово длиннее половины текста"
   ]
  },
  {
   "id": "q17",
   "topic": "8.8 · перенос нулей",
   "type": "multi",
   "text": "Какие утверждения о верной функции <code>move_zeros</code> из модуля верны? Отметьте все.",
   "options": [
    "Порядок ненулевых чисел сохраняется",
    "Функция возвращает число перенесённых нулей",
    "Дополнительная память — O(1)",
    "После вызова список становится короче",
    "Вход должен быть отсортирован"
   ]
  },
  {
   "id": "q18",
   "topic": "8.10 · замер",
   "type": "number",
   "text": "По замеру из главы 8.10 перебор на 8 000 ценах работал 751,5 мс, на 16 000 — 2785,6 мс. Во сколько раз выросло время? Округлите до целого.",
   "unit": "раз"
  },
  {
   "id": "q19",
   "topic": "8.10, 8.11 · сложность",
   "type": "sort",
   "text": "Разложите решения по времени работы.",
   "items": [
    "Перебор всех пар в поиске пары с суммой",
    "Указатели навстречу по отсортированным ценам",
    "Словарь просмотренных цен на неотсортированном списке",
    "Сортировка копии, затем указатели навстречу",
    "Удаление повторов из отсортированного списка",
    "Подарки в пределах бюджета: цены не отсортированы"
   ],
   "buckets": [
    "O(n²)",
    "O(n)",
    "O(n log n)"
   ]
  },
  {
   "id": "q20",
   "topic": "8.11 · влияние сортировки",
   "type": "single",
   "text": "В задаче «подарки в пределах бюджета» интервьюер разрешил менять входной список. Что меняется в решении?",
   "options": [
    "Время становится O(n): сортировать больше не нужно",
    "Копия не нужна, но время остаётся O(n log n)",
    "Ничего: sorted() и list.sort() работают одинаково",
    "Можно вернуться к перебору, он станет быстрее"
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
