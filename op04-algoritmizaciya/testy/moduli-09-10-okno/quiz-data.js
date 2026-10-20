/* Тест по модулям 9–10 «Скользящее окно фиксированного и переменного размера», ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-m0910-r1",
 "prefix": "AL10",
 "title": "Модули 9–10 · скользящее окно",
 "minutes": 50,
 "salt": "op04-m0910-2026-oct",
 "context": "Код в вопросах — Python 3.12, функции те же, что в главах модулей 9 и 10. Под n понимается длина списка или строки, под k — длина окна фиксированной длины, под s — порог суммы. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 21,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 16,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 11,
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
   "topic": "9.1, 10.1 · вид задачи",
   "type": "sort",
   "text": "Ниже шесть условий задач о списке чисел или о строке.",
   "task": "Разложите условия по трём группам: окно фиксированной длины, окно переменного размера, окно не подходит.",
   "items": [
    "Наибольшее число посетителей сайта за любые 30 минут подряд, посетители записаны поминутно",
    "Самый короткий отрезок подряд, в котором сумма заказов не меньше 500",
    "Самая длинная подстрока, в которой не больше двух разных букв",
    "Число подстрок длины 4, в которых все четыре буквы разные",
    "Самый короткий отрезок с суммой не меньше S, числа в списке бывают отрицательными",
    "Три числа с наибольшей суммой, которые стоят в любых местах списка"
   ],
   "buckets": [
    "окно фиксированной длины",
    "окно переменного размера",
    "окно не подходит"
   ]
  },
  {
   "id": "q02",
   "topic": "9.2 · сдвиг окна",
   "type": "number",
   "text": "Окно длины 4 стоит на элементах с индексами 0–3, его сумма 21.",
   "task": "Окно сдвигают вправо два раза подряд, каждый раз на одну позицию. Введите сумму окна после второго сдвига.",
   "unit": "",
   "image": {
    "svg": "<svg viewBox=\"0 0 556 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [6, 2, 9, 4, 1, 8, 3]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">nums</text><rect x=\"66\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"98.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">6</text><text x=\"98.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"136\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"168.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"168.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"206\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"238.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">9</text><text x=\"238.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"276\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"308.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">4</text><text x=\"308.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text><rect x=\"346\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"378.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">1</text><text x=\"378.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[4]</text><rect x=\"416\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"448.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">8</text><text x=\"448.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[5]</text><rect x=\"486\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"518.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">3</text><text x=\"518.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[6]</text></svg>",
    "caption": "nums = [6, 2, 9, 4, 1, 8, 3], k = 4, окно nums[0:4] = [6, 2, 9, 4]"
   }
  },
  {
   "id": "q03",
   "topic": "9.2 · код best_window",
   "type": "slots",
   "text": "Функция <code>best_window(nums, k)</code> возвращает пару <code>(start, best)</code>: начало и сумму окна длины k с наибольшей суммой. Условия задачи:<ul><li>числа в списке бывают отрицательными;</li><li>при равных суммах нужно самое левое окно.</li></ul>",
   "task": "Заполните три пропуска в коде. Одну карточку можно ставить несколько раз.",
   "code": "def best_window(nums, k):\n    if k < 1 or k > len(nums):\n        raise ValueError(\"k должно быть от 1 до len(nums)\")\n    total = sum(nums[:k])\n    best, start = [1], 0\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        if total [2] best:\n            best, start = total, [3]\n    return (start, best)",
   "chips": [
    "0",
    "total",
    ">",
    ">=",
    "r - k",
    "r - k + 1",
    "r"
   ],
   "slots": [
    "[1] начальное значение best",
    "[2] знак сравнения",
    "[3] начало нового лучшего окна"
   ]
  },
  {
   "id": "q04",
   "topic": "9.3 · события в окне",
   "type": "number",
   "text": "Моменты событий записаны в отсортированный список. Окно по времени длиной 4 секунды — полуинтервал <code>[s, s + 4)</code>: момент s в окно входит, момент s + 4 не входит.",
   "task": "Введите наибольшее число событий, которое помещается в одно такое окно.",
   "unit": "событий",
   "image": {
    "svg": "<svg viewBox=\"0 0 636 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [1, 2, 4, 7, 8, 9, 11, 14]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">times</text><rect x=\"76\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"108.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">1</text><text x=\"108.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"146\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"178.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"178.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"216\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"248.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">4</text><text x=\"248.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"286\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"318.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">7</text><text x=\"318.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text><rect x=\"356\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"388.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">8</text><text x=\"388.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[4]</text><rect x=\"426\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"458.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">9</text><text x=\"458.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[5]</text><rect x=\"496\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"528.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">11</text><text x=\"528.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[6]</text><rect x=\"566\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"598.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">14</text><text x=\"598.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[7]</text></svg>",
    "caption": "times = [1, 2, 4, 7, 8, 9, 11, 14], w = 4"
   }
  },
  {
   "id": "q05",
   "topic": "9.4 · граничные значения k",
   "type": "multi",
   "text": "Ниже функция <code>best_window(nums, k)</code> из главы 9.2. Первые две строки тела проверяют вход.",
   "task": "Отметьте все вызовы, которые закончатся исключением <code>ValueError</code>.",
   "code": "def best_window(nums, k):\n    if k < 1 or k > len(nums):\n        raise ValueError(\"k должно быть от 1 до len(nums)\")\n    total = sum(nums[:k])\n    best, start = total, 0\n    for r in range(k, len(nums)):\n        total += nums[r] - nums[r - k]\n        if total > best:\n            best, start = total, r - k + 1\n    return (start, best)",
   "options": [
    "<code>best_window([4, 1], 2)</code>",
    "<code>best_window([4, 1], 0)</code>",
    "<code>best_window([], 1)</code>",
    "<code>best_window([7], 1)</code>",
    "<code>best_window([2, 5, 1], -1)</code>",
    "<code>best_window([2, 5, 1], 4)</code>"
   ]
  },
  {
   "id": "q06",
   "topic": "9.2 · сколько стоят срезы",
   "type": "number",
   "text": "Сумму каждого окна считают срезом: <code>sum(nums[s:s + k])</code> для каждого начала s. Длина списка n = 10, длина окна k = 4.",
   "task": "Введите, сколько всего элементов будет сложено при подсчёте сумм всех окон.",
   "unit": "элементов"
  },
  {
   "id": "q07",
   "topic": "9.3 · ошибка в max_events",
   "type": "line",
   "text": "Функция <code>max_events(times, w)</code> считает наибольшее число событий в окне <code>[s, s + w)</code>.<ul><li>Вызов <code>max_events([4, 6, 20], 5)</code> вернул 1.</li><li>В окно <code>[4, 9)</code> попадают два события: 4 и 6.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def max_events(times, w):\n    if w <= 0:\n        raise ValueError(\"w должно быть больше 0\")\n    best = 0\n    l = 0\n    for r in range(len(times)):\n        while times[r] - times[l] >= w:\n            l += 1\n        best = max(best, r - l)\n    return best"
  },
  {
   "id": "q08",
   "topic": "9.2–10.3 · время работы",
   "type": "sort",
   "text": "n — длина списка или строки. Ниже код трёх функций из глав модулей 9 и 10: max_events, shortest_window и longest_unique. Остальные способы описаны в карточках.",
   "task": "Разложите способы по времени работы.",
   "code": "def max_events(times, w):\n    if w <= 0:\n        raise ValueError(\"w должно быть больше 0\")\n    best = 0\n    l = 0\n    for r in range(len(times)):\n        while times[r] - times[l] >= w:\n            l += 1\n        best = max(best, r - l + 1)\n    return best\n\n\ndef shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best\n\n\ndef longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "items": [
    "Суммы всех окон срезами при k = n / 2",
    "Суммы всех окон сдвигом при любом k",
    "max_events из главы 9.3",
    "shortest_window из главы 10.2",
    "Перебор всех отрезков: для каждого начала сумма копится при сдвиге конца",
    "longest_unique с частотной картой",
    "max_events, где l = 0 ставится заново на каждом шаге for"
   ],
   "buckets": [
    "O(n)",
    "O(n²)"
   ]
  },
  {
   "id": "q09",
   "topic": "10.1 · когда окно не подходит",
   "type": "single",
   "text": "Функция <code>shortest_window(nums, s)</code> ищет самый короткий отрезок с суммой не меньше s. По контракту числа в списке неотрицательные.",
   "task": "Выберите, почему на списке с отрицательными числами эта функция может вернуть неверный ответ.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best",
   "options": [
    "Сжатие останавливается, хотя уход ещё одного элемента снова увеличил бы сумму",
    "Сумма отрицательных чисел в переменной total переполняется на длинных списках",
    "Цикл while на отрицательных числах никогда не заканчивается и функция зависает",
    "Длина окна r − l + 1 становится отрицательной, когда l обгоняет правую границу"
   ]
  },
  {
   "id": "q10",
   "topic": "10.1 · окно на отрицательных числах",
   "type": "number",
   "text": "Функцию <code>shortest_window</code> запустили на списке с отрицательным числом.",
   "task": "Введите, что напечатает программа.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best\n\nprint(shortest_window([4, -3, 6], 6))",
   "unit": ""
  },
  {
   "id": "q11",
   "topic": "10.2 · порядок шагов",
   "type": "order",
   "text": "Ниже перемешаны шаги функции <code>shortest_window(nums, s)</code>. Шаги 4–6 выполняются внутри цикла и повторяются.",
   "task": "Расставьте шаги в порядке выполнения. Первый шаг — сверху.",
   "items": [
    "Проверить, что s не меньше 1",
    "Поставить best = 0, total = 0, l = 0",
    "Взять следующий элемент nums[r] и прибавить его к total",
    "Проверить условие total ≥ s, при ложном — перейти к следующему r",
    "Сравнить длину r − l + 1 с best и оставить меньшую",
    "Вычесть nums[l] из total и сдвинуть l на одну позицию вправо",
    "Когда элементы закончились, вернуть best"
   ]
  },
  {
   "id": "q12",
   "topic": "10.2 · прогон shortest_window",
   "type": "number",
   "text": "Функция из главы 10.2 вызвана на списке заказов по часам.",
   "task": "Введите, что напечатает программа.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best\n\nprint(shortest_window([1, 4, 2, 2, 5, 1], 9))",
   "unit": ""
  },
  {
   "id": "q13",
   "topic": "10.3 · ошибка в сжатии",
   "type": "line",
   "text": "Функция <code>longest_unique(text)</code> возвращает длину самой длинной подстроки без повторов.<ul><li>Вызов <code>longest_unique('pwwkew')</code> вернул 4.</li><li>Верный ответ — 3, подстрока <code>'wke'</code>.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[ch] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best"
  },
  {
   "id": "q14",
   "topic": "10.3 · цикл сжатия",
   "type": "line",
   "text": "Это другая версия <code>longest_unique(text)</code>.<ul><li>Вызов <code>longest_unique('abba')</code> вернул 3.</li><li>Верный ответ — 2: подстроки <code>'ab'</code> и <code>'ba'</code>.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        if count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best"
  },
  {
   "id": "q15",
   "topic": "10.3 · две корзины",
   "type": "single",
   "text": "Функция <code>total_fruit(fruits)</code> ищет самый длинный отрезок, в котором не больше двух разных чисел (LeetCode 904). Условие цикла считает ключи словаря: <code>len(count) &gt; 2</code>.",
   "task": "Выберите, что произойдёт при запуске программы.",
   "code": "def total_fruit(fruits):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(fruits)):\n        f = fruits[r]\n        count[f] = count.get(f, 0) + 1\n        while len(count) > 2:\n            count[fruits[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best\n\nprint(total_fruit([1, 2, 3, 2, 2]))",
   "options": [
    "Программа упадёт с IndexError",
    "Программа напечатает число 4",
    "Программа напечатает число 5",
    "Программа упадёт с ошибкой KeyError"
   ]
  },
  {
   "id": "q16",
   "topic": "10.3 · прогон longest_unique",
   "type": "number",
   "text": "Функция из главы 10.3 вызвана на строке <code>'tmmzuxt'</code>.",
   "task": "Введите, что напечатает программа.",
   "code": "def longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best\n\nprint(longest_unique('tmmzuxt'))",
   "unit": ""
  },
  {
   "id": "q17",
   "topic": "10.3 · код longest_unique",
   "type": "slots",
   "text": "В функции <code>longest_unique(text)</code> четыре пропуска. Состояние окна — частотная карта <code>count</code>: для каждого символа окна, сколько раз он в окне встречается.",
   "task": "Заполните пропуски так, чтобы функция возвращала длину самой длинной подстроки без повторов.",
   "code": "def longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = [1] + 1\n        [2] count[ch] > 1:\n            count[[3]] -= 1\n            l += 1\n        best = max(best, [4])\n    return best",
   "chips": [
    "0",
    "count.get(ch, 0)",
    "count[ch]",
    "if",
    "while",
    "text[l]",
    "text[l + 1]",
    "r - l",
    "r - l + 1"
   ],
   "slots": [
    "[1] счётчик до прихода ch",
    "[2] начало строки",
    "[3] символ, счётчик которого уменьшается",
    "[4] значение для сравнения с best"
   ]
  },
  {
   "id": "q18",
   "topic": "10.2–10.3 · самый короткий и самый длинный",
   "type": "sort",
   "text": "В <code>shortest_window</code> ищется самый короткий отрезок с суммой не меньше s, в <code>longest_unique</code> — самая длинная подстрока без повторов. Проход в обеих функциях одинаковый, отличаются условие цикла while, место записи длины и сравнение с лучшей.",
   "task": "Разложите утверждения по функциям, к которым они относятся.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best\n\n\ndef longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "items": [
    "Окно сжимают, пока оно подходит",
    "Окно сжимают, пока оно недопустимо",
    "Длину записывают внутри while, перед сжатием",
    "Длину записывают после цикла while",
    "Ответ меняют, если новая длина меньше лучшей",
    "Ответ меняют через max(best, …)"
   ],
   "buckets": [
    "shortest_window",
    "longest_unique"
   ]
  },
  {
   "id": "q19",
   "topic": "10.2 · почему O(n)",
   "type": "number",
   "text": "Функцию <code>shortest_window</code> вызвали на списке из 50 чисел. В ней цикл while стоит внутри цикла for. Правая граница сдвигается на каждом шаге for, левая — строкой <code>l += 1</code>.",
   "task": "Введите наибольшее возможное число сдвигов обеих границ вместе за один вызов.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best",
   "unit": "сдвигов"
  },
  {
   "id": "q20",
   "topic": "10.2 · инвариант",
   "type": "single",
   "text": "Инвариант — утверждение, которое остаётся верным после каждого шага алгоритма. В <code>shortest_window</code> окно — элементы с индекса l по индекс r.",
   "task": "Выберите утверждение, которое верно каждый раз, когда завершился цикл while.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best",
   "options": [
    "total равна сумме окна с l по r, и эта сумма меньше s",
    "total равна сумме окна с l по r, и эта сумма не меньше s",
    "best равна длине текущего окна, то есть r − l + 1",
    "Окно с l по r — самый короткий отрезок с суммой не меньше s"
   ]
  },
  {
   "id": "q21",
   "topic": "10.4 · граничные входы",
   "type": "sort",
   "text": "Ниже функции <code>shortest_window</code> и <code>longest_unique</code>, написанные по контракту модуля 10:<ul><li>порог s меньше 1 — исключение ValueError;</li><li>подходящего отрезка нет — ответ 0;</li><li>пустая строка — ответ 0.</li></ul>",
   "task": "Разложите вызовы по результату.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best\n\n\ndef longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "items": [
    "shortest_window([1, 2], 0)",
    "shortest_window([], 5)",
    "shortest_window([1, 1, 1, 1], 5)",
    "longest_unique('')",
    "shortest_window([5], 5)",
    "longest_unique('aaaa')",
    "shortest_window([2, 3], -1)"
   ],
   "buckets": [
    "ValueError",
    "0",
    "1"
   ]
  },
  {
   "id": "q22",
   "topic": "10.4 · начальное значение",
   "type": "line",
   "text": "Это версия <code>shortest_window(nums, s)</code> с изменённой строкой.<ul><li>Вызов <code>shortest_window([1, 1, 1, 1], 5)</code> вернул 4.</li><li>Сумма всего списка 4 меньше порога 5, верный ответ — 0.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = len(nums)\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best"
  },
  {
   "id": "q23",
   "topic": "10.4 · тесты к ошибке",
   "type": "multi",
   "text": "В этой версии <code>shortest_window</code> вместо <code>while total &gt;= s:</code> записано <code>while total &gt; s:</code>, остальные строки верные. В вариантах ответа — тесты к функции, в каждом записан верный ответ.",
   "task": "Отметьте все тесты, которые упадут на этой версии.",
   "code": "def shortest_window(nums, s):\n    if s < 1:\n        raise ValueError(\"s должно быть не меньше 1\")\n    best = 0\n    total = 0\n    l = 0\n    for r in range(len(nums)):\n        total += nums[r]\n        while total > s:\n            length = r - l + 1\n            if best == 0 or length < best:\n                best = length\n            total -= nums[l]\n            l += 1\n    return best",
   "options": [
    "<code>assert shortest_window([2, 3, 1, 2, 4, 3], 7) == 2</code>",
    "<code>assert shortest_window([1, 1, 1], 5) == 0</code>",
    "<code>assert shortest_window([5], 5) == 1</code>",
    "<code>assert shortest_window([1, 2, 10], 6) == 1</code>",
    "<code>assert shortest_window([], 3) == 0</code>",
    "<code>assert shortest_window([4, 4], 8) == 2</code>"
   ]
  },
  {
   "id": "q24",
   "topic": "10.1 · задача из статьи Яндекса",
   "type": "number",
   "text": "В статье журнала Яндекс Образования об алгоритмических собеседованиях приведена задача: дан массив чисел, найти число подмассивов, в которых значения всех чисел различны. Подмассив — отрезок подряд.",
   "task": "Введите ответ для массива <code>[1, 2, 1, 3]</code>.",
   "unit": "подмассивов"
  },
  {
   "id": "q25",
   "topic": "10.4 · объяснение условия while",
   "type": "single",
   "text": "На собеседовании по <code>longest_unique</code> интервьюер спрашивает: почему после прихода символа ch проверяется только <code>count[ch] &gt; 1</code>, а счётчики остальных символов окна не проверяются?",
   "task": "Выберите ответ, который объясняет это верно.",
   "code": "def longest_unique(text):\n    count = {}\n    best = 0\n    l = 0\n    for r in range(len(text)):\n        ch = text[r]\n        count[ch] = count.get(ch, 0) + 1\n        while count[ch] > 1:\n            count[text[l]] -= 1\n            l += 1\n        best = max(best, r - l + 1)\n    return best",
   "options": [
    "До прихода ch повторов в окне не было, и меняется только счётчик ch",
    "Словарь count хранит счётчик только последнего пришедшего символа",
    "Повтор может появиться только у двух соседних символов строки",
    "Счётчики остальных символов окна при расширении уменьшаются на единицу"
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
