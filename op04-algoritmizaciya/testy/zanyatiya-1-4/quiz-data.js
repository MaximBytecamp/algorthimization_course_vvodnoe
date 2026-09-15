/* Тест ОП.04 по занятиям 1, 3, 4. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-z134",
 "prefix": "AL14",
 "title": "Занятия 1, 3, 4 · алгоритмы, сложность, замеры",
 "minutes": 20,
 "salt": "op04-z134-2026-sep",
 "context": "Код в вопросах — Python 3.12. Под n понимается размер входа. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 20,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 15,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 10,
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
   "topic": "Занятие 1 · определение алгоритма",
   "type": "multi",
   "text": "Какие свойства входят в определение алгоритма, данное на первом занятии? Отметьте все.",
   "options": [
    "Конечность: выполнение завершается за определённое число шагов",
    "Однозначность: каждый шаг любой исполнитель понимает одинаково",
    "Массовость: работает на всём классе допустимых входов",
    "Оптимальность: делает наименьшее возможное число операций",
    "Наглядность: алгоритм записан в виде блок-схемы"
   ]
  },
  {
   "id": "q02",
   "topic": "Занятие 1 · инвариант",
   "type": "single",
   "text": "Цикл ищет максимум в списке с картинки. Какое утверждение — <b>инвариант</b> этого цикла, то есть верно после каждого шага?",
   "code": "data = [7, 2, 9, 2]\nbest = data[0]\nfor number in data:\n    best = max(best, number)\nprint(best)",
   "options": [
    "В <code>best</code> лежит максимум уже пройденной части списка",
    "Значение <code>best</code> увеличивается на каждом шаге",
    "<code>best</code> равен последнему прочитанному числу",
    "<code>best</code> больше всех чисел, которые ещё не пройдены"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 340 120\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список [7, 2, 9, 2]\"><text x=\"16\" y=\"62\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#020835\">data</text><rect x=\"60\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"92.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">7</text><text x=\"92.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[0]</text><rect x=\"130\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"162.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"162.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[1]</text><rect x=\"200\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"232.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">9</text><text x=\"232.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[2]</text><rect x=\"270\" y=\"24\" width=\"64\" height=\"64\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"302.0\" y=\"67\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"26\" font-weight=\"700\" fill=\"#020835\">2</text><text x=\"302.0\" y=\"108\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">[3]</text></svg>",
    "caption": "вход: data = [7, 2, 9, 2]"
   }
  },
  {
   "id": "q03",
   "topic": "Занятие 1 · ход решения на секции",
   "type": "order",
   "text": "Расставьте шаги работы над задачей на алгоритмической секции в том порядке, который разбирали на первом занятии. Первый шаг — сверху.",
   "items": [
    "Пересказать условие своими словами",
    "Уточнить размер входа, дубликаты, пустой ввод",
    "Привести примеры: обычный, граничный, случай без ответа",
    "Написать полный перебор (brute force) как корректную основу",
    "Оптимизировать: выбрать структуру данных",
    "Написать код, прогнать примеры, назвать сложность"
   ]
  },
  {
   "id": "q04",
   "topic": "Занятие 1 · вердикт TLE",
   "type": "single",
   "text": "Проверяющая система вернула решению вердикт <b>TLE</b>. Что это означает?",
   "options": [
    "Ответ, возможно, верный, но решение не уложилось в лимит времени",
    "Решение выдало неверный ответ на одном из скрытых тестов",
    "Программа завершилась с ошибкой во время выполнения",
    "Решение заняло больше памяти, чем разрешено условием"
   ]
  },
  {
   "id": "q05",
   "topic": "Занятия 1 и 3 · прикидка времени",
   "type": "single",
   "text": "В условии <code>n ≤ 200 000</code>. Решение перебирает все пары <code>i &lt; j</code> — это около <code>n²/2 = 2·10¹⁰</code> сравнений. Сколько оно будет работать по ориентиру для Python <b>10⁷ операций в секунду</b>?",
   "options": [
    "Около получаса",
    "Доли секунды",
    "Около двух секунд",
    "Около года"
   ]
  },
  {
   "id": "q06",
   "topic": "Занятие 3 · стоимость строки",
   "type": "sort",
   "text": "<code>orders</code> — список из миллиона номеров, <code>seen</code> — множество. Разложите строки по стоимости: сколько действий нужно, чтобы выполнить строку один раз.",
   "items": [
    "<code>orders[-1]</code>",
    "<code>len(orders)</code>",
    "<code>x in seen</code>",
    "<code>orders.append(x)</code>",
    "<code>sum(orders)</code>",
    "<code>orders.insert(0, x)</code>",
    "<code>orders[1:]</code>",
    "<code>x in orders</code>"
   ],
   "buckets": [
    "1 — не зависит от длины",
    "n — проходит или сдвигает весь список"
   ]
  },
  {
   "id": "q07",
   "topic": "Занятие 3 · подсчёт T(n)",
   "type": "number",
   "text": "Сколько раз выполнится сравнение <code>badges[i] == badges[j]</code>? Все восемь номеров различны.",
   "code": "badges = [417, 133, 604, 902, 288, 715, 950, 366]\nfor i in range(len(badges)):\n    for j in range(i + 1, len(badges)):\n        if badges[i] == badges[j]:\n            print(\"есть повтор\")",
   "unit": "сравнений"
  },
  {
   "id": "q08",
   "topic": "Занятие 3 · форма записи",
   "type": "slots",
   "text": "Автопроверка не принимает записи слева. Перетащите к каждой верную форму. Одну карточку можно ставить несколько раз.",
   "chips": [
    "O(1)",
    "O(n)",
    "O(n²)",
    "O(log n)",
    "O(n + m)",
    "O(m)"
   ],
   "slots": [
    "O(2n)",
    "O(n² + n)",
    "O(log₂ n)",
    "O(4n + 5)",
    "O(n + m), размеры двух списков не связаны"
   ]
  },
  {
   "id": "q09",
   "topic": "Занятие 3 · определение O",
   "type": "number",
   "text": "Доказываем, что <code>4n + 5 = O(n)</code>. По определению нужно найти <code>c</code> и <code>n₀</code>, чтобы <code>4n + 5 ≤ c·n</code> при всех <code>n ≥ n₀</code>. Взяли <code>c = 5</code>. Каким будет наименьшее подходящее <code>n₀</code>?",
   "unit": "n₀ =",
   "unit_before": true
  },
  {
   "id": "q10",
   "topic": "Занятие 3 · порядок роста",
   "type": "order",
   "text": "Расставьте классы от самого медленного роста (сверху) к самому быстрому.",
   "items": [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(2ⁿ)"
   ]
  },
  {
   "id": "q11",
   "topic": "Занятие 3 · скрытая стоимость",
   "type": "line",
   "text": "В функции один цикл, но она работает за O(n²). Щёлкните строку, из-за которой так получается.",
   "code": "def unique_codes(codes):\n    result = []\n    for code in codes:\n        if code not in result:\n            result.append(code)\n    return result"
  },
  {
   "id": "q12",
   "topic": "Занятие 3 · циклы подряд",
   "type": "single",
   "text": "Какова временная сложность функции?",
   "code": "def avg_and_max(temps):\n    total = 0\n    for t in temps:\n        total += t\n    best = temps[0]\n    for t in temps:\n        if t > best:\n            best = t\n    return total / len(temps), best",
   "options": [
    "<code>O(n)</code>",
    "<code>O(n²)</code>",
    "<code>O(2n)</code>",
    "<code>O(n + n²)</code>"
   ]
  },
  {
   "id": "q13",
   "topic": "Занятие 3 · деление пополам",
   "type": "single",
   "text": "Что напечатает программа?",
   "code": "def steps_to_one(number):\n    steps = 0\n    while number > 1:\n        number //= 2\n        steps += 1\n    return steps\n\nprint(steps_to_one(1024))",
   "options": [
    "<code>10</code>",
    "<code>11</code>",
    "<code>512</code>",
    "<code>1024</code>"
   ]
  },
  {
   "id": "q14",
   "topic": "Занятие 4 · два решения задачи о дубликатах",
   "type": "slots",
   "text": "Заполните таблицу для двух решений задачи «есть ли в списке повтор». Время — в худшем случае (все ID различны), память — дополнительная, без входного списка. Карточки можно ставить несколько раз.",
   "code": "def has_duplicates_nested(numbers):        # решение A\n    n = len(numbers)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if numbers[i] == numbers[j]:\n                return True\n    return False\n\ndef has_duplicates_set(numbers):           # решение B\n    seen = set()\n    for number in numbers:\n        if number in seen:\n            return True\n        seen.add(number)\n    return False",
   "chips": [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n²)"
   ],
   "slots": [
    "A · время T(n)",
    "A · память S(n)",
    "B · время T(n)",
    "B · память S(n)"
   ]
  },
  {
   "id": "q15",
   "topic": "Занятие 3 · дополнительная память",
   "type": "sort",
   "text": "Разложите фрагменты по дополнительной памяти S(n). Входной список не считается: он существовал до вызова.",
   "items": [
    "счётчик <code>late += 1</code> в цикле по заказам",
    "индексы <code>i</code> и <code>j</code> в двойном цикле по парам",
    "<code>low</code>, <code>high</code>, <code>mid</code> в бинарном поиске",
    "<code>seen = set()</code> и <code>seen.add(badge)</code> в цикле",
    "<code>return sorted(prices)[:3]</code>",
    "<code>copy = badges[:]</code>"
   ],
   "buckets": [
    "S(n) = O(1)",
    "S(n) = O(n)"
   ]
  },
  {
   "id": "q16",
   "topic": "Занятие 3 · память рекурсии",
   "type": "single",
   "text": "Сколько <b>дополнительной памяти</b> занимает вызов <code>fib(n)</code>?",
   "code": "def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)",
   "options": [
    "<code>O(n)</code> — столько кадров одновременно лежит в стеке вызовов",
    "<code>O(1)</code> — функция не создаёт ни списков, ни множеств",
    "<code>O(2ⁿ)</code> — по одному кадру на каждый из вызовов",
    "<code>O(log n)</code> — задача на каждом шаге уменьшается вдвое"
   ]
  },
  {
   "id": "q17",
   "topic": "Занятие 3 · ограничение подсказывает решение",
   "type": "slots",
   "text": "Для каждого ограничения из условия подставьте <b>самый медленный класс</b>, который ещё укладывается в лимит при ориентире 10⁷ операций в секунду.",
   "chips": [
    "O(n!)",
    "O(n³)",
    "O(n²)",
    "O(n log n)",
    "O(n)",
    "O(log n)"
   ],
   "slots": [
    "n ≤ 12",
    "n ≤ 5 000",
    "n ≤ 10⁵",
    "n ≤ 10⁶",
    "одно число k ≤ 10⁹"
   ]
  },
  {
   "id": "q18",
   "topic": "Занятие 3 · худший случай",
   "type": "multi",
   "text": "Какие входы — <b>худший случай</b> для функции <code>find_pass</code> на списке из n пропусков? Отметьте все.",
   "code": "def find_pass(passes, code):\n    for i in range(len(passes)):\n        if passes[i] == code:\n            return i\n    return -1",
   "options": [
    "Искомого пропуска в списке нет",
    "Искомый пропуск стоит последним",
    "Искомый пропуск стоит первым",
    "Искомый пропуск стоит ровно посередине"
   ]
  },
  {
   "id": "q19",
   "topic": "Занятие 3 · амортизированная стоимость",
   "type": "single",
   "text": "Когда место в списке заканчивается, <code>append</code> копирует все элементы в участок вдвое больше — это стоит n. Почему <code>append</code> всё равно записывают как O(1)?",
   "options": [
    "Расширения случаются всё реже: на 1000 добавлений приходится около 2 операций на одно",
    "Python при расширении копирует только последний элемент, а не весь список",
    "Это средний случай по входным данным: большие списки встречаются редко",
    "Список сразу выделяет память под миллион элементов, и расширений не бывает"
   ]
  },
  {
   "id": "q20",
   "topic": "Занятие 3 · кривые роста",
   "type": "slots",
   "text": "На графике четыре кривые: по горизонтали размер входа, по вертикали число операций. Подпишите каждую кривую классом. Сверяйтесь с сеткой: где кривая проходит при n = 8, 16 и 32.",
   "chips": [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(n³)"
   ],
   "slots": [
    "Кривая A",
    "Кривая B",
    "Кривая C",
    "Кривая D"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 350\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"четыре кривые роста A, B, C, D\"><defs><clipPath id=\"plot\"><rect x=\"64\" y=\"24\" width=\"536\" height=\"276\"/></clipPath></defs><rect x=\"64\" y=\"24\" width=\"536\" height=\"276\" fill=\"#fff\"/><line x1=\"64.0\" y1=\"24\" x2=\"64.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"64.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">0</text><line x1=\"131.0\" y1=\"24\" x2=\"131.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"131.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">4</text><line x1=\"198.0\" y1=\"24\" x2=\"198.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"2\"/><text x=\"198.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"700\" fill=\"#020835\">8</text><line x1=\"265.0\" y1=\"24\" x2=\"265.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"265.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">12</text><line x1=\"332.0\" y1=\"24\" x2=\"332.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"2\"/><text x=\"332.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"700\" fill=\"#020835\">16</text><line x1=\"399.0\" y1=\"24\" x2=\"399.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"399.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">20</text><line x1=\"466.0\" y1=\"24\" x2=\"466.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"466.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">24</text><line x1=\"533.0\" y1=\"24\" x2=\"533.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"533.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">28</text><line x1=\"600.0\" y1=\"24\" x2=\"600.0\" y2=\"300\" stroke=\"#D5DAE6\" stroke-width=\"2\"/><text x=\"600.0\" y=\"320\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"700\" fill=\"#020835\">32</text><line x1=\"64\" y1=\"300.0\" x2=\"600\" y2=\"300.0\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"304.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">0</text><line x1=\"64\" y1=\"265.5\" x2=\"600\" y2=\"265.5\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"269.5\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">8</text><line x1=\"64\" y1=\"231.0\" x2=\"600\" y2=\"231.0\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"235.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">16</text><line x1=\"64\" y1=\"196.5\" x2=\"600\" y2=\"196.5\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"200.5\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">24</text><line x1=\"64\" y1=\"162.0\" x2=\"600\" y2=\"162.0\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"166.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">32</text><line x1=\"64\" y1=\"127.5\" x2=\"600\" y2=\"127.5\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"131.5\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">40</text><line x1=\"64\" y1=\"93.0\" x2=\"600\" y2=\"93.0\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"97.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">48</text><line x1=\"64\" y1=\"58.5\" x2=\"600\" y2=\"58.5\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"62.5\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">56</text><line x1=\"64\" y1=\"24.0\" x2=\"600\" y2=\"24.0\" stroke=\"#D5DAE6\" stroke-width=\"1\"/><text x=\"56\" y=\"28.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">64</text><rect x=\"64\" y=\"24\" width=\"536\" height=\"276\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"332.0\" y=\"344\" text-anchor=\"middle\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#3B4467\">размер входа n</text><text x=\"16\" y=\"162.0\" transform=\"rotate(-90 16 162.0)\" text-anchor=\"middle\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#3B4467\">операции</text><polyline clip-path=\"url(#plot)\" points=\"80.8,300.0 84.9,298.3 89.1,296.2 93.3,293.9 97.5,291.4 101.7,288.6 105.9,285.7 110.1,282.7 114.2,279.5 118.4,276.2 122.6,272.7 126.8,269.2 131.0,265.5 135.2,261.7 139.4,257.9 143.6,254.0 147.8,249.9 151.9,245.8 156.1,241.7 160.3,237.4 164.5,233.1 168.7,228.7 172.9,224.3 177.1,219.8 181.2,215.3 185.4,210.6 189.6,206.0 193.8,201.3 198.0,196.5 202.2,191.7 206.4,186.8 210.6,181.9 214.8,177.0 218.9,172.0 223.1,166.9 227.3,161.9 231.5,156.7 235.7,151.6 239.9,146.4 244.1,141.2 248.2,135.9 252.4,130.6 256.6,125.3 260.8,119.9 265.0,114.5 269.2,109.0 273.4,103.6 277.6,98.1 281.8,92.5 285.9,87.0 290.1,81.4 294.3,75.8 298.5,70.1 302.7,64.5 306.9,58.8 311.1,53.0 315.2,47.3 319.4,41.5 323.6,35.7 327.8,29.9 332.0,24.0 336.2,18.1 340.4,12.2 344.6,6.3 348.8,0.3 352.9,-5.6 357.1,-11.6 361.3,-17.7 365.5,-23.7 369.7,-29.8 373.9,-31.2 378.1,-31.2 382.2,-31.2 386.4,-31.2 390.6,-31.2 394.8,-31.2 399.0,-31.2 403.2,-31.2 407.4,-31.2 411.6,-31.2 415.8,-31.2 419.9,-31.2 424.1,-31.2 428.3,-31.2 432.5,-31.2 436.7,-31.2 440.9,-31.2 445.1,-31.2 449.2,-31.2 453.4,-31.2 457.6,-31.2 461.8,-31.2 466.0,-31.2 470.2,-31.2 474.4,-31.2 478.6,-31.2 482.8,-31.2 486.9,-31.2 491.1,-31.2 495.3,-31.2 499.5,-31.2 503.7,-31.2 507.9,-31.2 512.1,-31.2 516.2,-31.2 520.4,-31.2 524.6,-31.2 528.8,-31.2 533.0,-31.2 537.2,-31.2 541.4,-31.2 545.6,-31.2 549.8,-31.2 553.9,-31.2 558.1,-31.2 562.3,-31.2 566.5,-31.2 570.7,-31.2 574.9,-31.2 579.1,-31.2 583.2,-31.2 587.4,-31.2 591.6,-31.2 595.8,-31.2 600.0,-31.2\" fill=\"none\" stroke=\"#B4531F\" stroke-width=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"308.0\" cy=\"40.0\" r=\"15\" fill=\"#B4531F\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"308.0\" y=\"46.0\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"16\" font-weight=\"700\" fill=\"#fff\">A</text><polyline clip-path=\"url(#plot)\" points=\"80.8,300.0 84.9,298.6 89.1,297.5 93.3,296.5 97.5,295.7 101.7,295.0 105.9,294.3 110.1,293.7 114.2,293.2 118.4,292.7 122.6,292.2 126.8,291.8 131.0,291.4 135.2,291.0 139.4,290.6 143.6,290.3 147.8,290.0 151.9,289.7 156.1,289.4 160.3,289.1 164.5,288.9 168.7,288.6 172.9,288.4 177.1,288.1 181.2,287.9 185.4,287.7 189.6,287.5 193.8,287.3 198.0,287.1 202.2,286.9 206.4,286.7 210.6,286.5 214.8,286.3 218.9,286.2 223.1,286.0 227.3,285.8 231.5,285.7 235.7,285.5 239.9,285.4 244.1,285.2 248.2,285.1 252.4,284.9 256.6,284.8 260.8,284.7 265.0,284.5 269.2,284.4 273.4,284.3 277.6,284.2 281.8,284.0 285.9,283.9 290.1,283.8 294.3,283.7 298.5,283.6 302.7,283.5 306.9,283.4 311.1,283.3 315.2,283.2 319.4,283.0 323.6,282.9 327.8,282.8 332.0,282.8 336.2,282.7 340.4,282.6 344.6,282.5 348.8,282.4 352.9,282.3 357.1,282.2 361.3,282.1 365.5,282.0 369.7,281.9 373.9,281.8 378.1,281.8 382.2,281.7 386.4,281.6 390.6,281.5 394.8,281.4 399.0,281.4 403.2,281.3 407.4,281.2 411.6,281.1 415.8,281.1 419.9,281.0 424.1,280.9 428.3,280.8 432.5,280.8 436.7,280.7 440.9,280.6 445.1,280.6 449.2,280.5 453.4,280.4 457.6,280.4 461.8,280.3 466.0,280.2 470.2,280.2 474.4,280.1 478.6,280.0 482.8,280.0 486.9,279.9 491.1,279.9 495.3,279.8 499.5,279.7 503.7,279.7 507.9,279.6 512.1,279.6 516.2,279.5 520.4,279.4 524.6,279.4 528.8,279.3 533.0,279.3 537.2,279.2 541.4,279.2 545.6,279.1 549.8,279.0 553.9,279.0 558.1,278.9 562.3,278.9 566.5,278.8 570.7,278.8 574.9,278.7 579.1,278.7 583.2,278.6 587.4,278.6 591.6,278.5 595.8,278.5 600.0,278.4\" fill=\"none\" stroke=\"#2E7D50\" stroke-width=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"582.0\" cy=\"258.4\" r=\"15\" fill=\"#2E7D50\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"582.0\" y=\"264.4\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"16\" font-weight=\"700\" fill=\"#fff\">B</text><polyline clip-path=\"url(#plot)\" points=\"80.8,295.7 84.9,293.3 89.1,290.3 93.3,286.8 97.5,282.8 101.7,278.2 105.9,273.0 110.1,267.4 114.2,261.2 118.4,254.4 122.6,247.2 126.8,239.4 131.0,231.0 135.2,222.1 139.4,212.7 143.6,202.7 147.8,192.2 151.9,181.1 156.1,169.5 160.3,157.4 164.5,144.8 168.7,131.5 172.9,117.8 177.1,103.5 181.2,88.7 185.4,73.3 189.6,57.4 193.8,41.0 198.0,24.0 202.2,6.5 206.4,-11.6 210.6,-30.2 214.8,-31.2 218.9,-31.2 223.1,-31.2 227.3,-31.2 231.5,-31.2 235.7,-31.2 239.9,-31.2 244.1,-31.2 248.2,-31.2 252.4,-31.2 256.6,-31.2 260.8,-31.2 265.0,-31.2 269.2,-31.2 273.4,-31.2 277.6,-31.2 281.8,-31.2 285.9,-31.2 290.1,-31.2 294.3,-31.2 298.5,-31.2 302.7,-31.2 306.9,-31.2 311.1,-31.2 315.2,-31.2 319.4,-31.2 323.6,-31.2 327.8,-31.2 332.0,-31.2 336.2,-31.2 340.4,-31.2 344.6,-31.2 348.8,-31.2 352.9,-31.2 357.1,-31.2 361.3,-31.2 365.5,-31.2 369.7,-31.2 373.9,-31.2 378.1,-31.2 382.2,-31.2 386.4,-31.2 390.6,-31.2 394.8,-31.2 399.0,-31.2 403.2,-31.2 407.4,-31.2 411.6,-31.2 415.8,-31.2 419.9,-31.2 424.1,-31.2 428.3,-31.2 432.5,-31.2 436.7,-31.2 440.9,-31.2 445.1,-31.2 449.2,-31.2 453.4,-31.2 457.6,-31.2 461.8,-31.2 466.0,-31.2 470.2,-31.2 474.4,-31.2 478.6,-31.2 482.8,-31.2 486.9,-31.2 491.1,-31.2 495.3,-31.2 499.5,-31.2 503.7,-31.2 507.9,-31.2 512.1,-31.2 516.2,-31.2 520.4,-31.2 524.6,-31.2 528.8,-31.2 533.0,-31.2 537.2,-31.2 541.4,-31.2 545.6,-31.2 549.8,-31.2 553.9,-31.2 558.1,-31.2 562.3,-31.2 566.5,-31.2 570.7,-31.2 574.9,-31.2 579.1,-31.2 583.2,-31.2 587.4,-31.2 591.6,-31.2 595.8,-31.2 600.0,-31.2\" fill=\"none\" stroke=\"#6B4FB3\" stroke-width=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\" stroke-dasharray=\"8 5\"/><circle cx=\"176.0\" cy=\"46.0\" r=\"15\" fill=\"#6B4FB3\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"176.0\" y=\"52.0\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"16\" font-weight=\"700\" fill=\"#fff\">C</text><polyline clip-path=\"url(#plot)\" points=\"80.8,295.7 84.9,294.6 89.1,293.5 93.3,292.5 97.5,291.4 101.7,290.3 105.9,289.2 110.1,288.1 114.2,287.1 118.4,286.0 122.6,284.9 126.8,283.8 131.0,282.8 135.2,281.7 139.4,280.6 143.6,279.5 147.8,278.4 151.9,277.4 156.1,276.3 160.3,275.2 164.5,274.1 168.7,273.0 172.9,272.0 177.1,270.9 181.2,269.8 185.4,268.7 189.6,267.7 193.8,266.6 198.0,265.5 202.2,264.4 206.4,263.3 210.6,262.3 214.8,261.2 218.9,260.1 223.1,259.0 227.3,258.0 231.5,256.9 235.7,255.8 239.9,254.7 244.1,253.6 248.2,252.6 252.4,251.5 256.6,250.4 260.8,249.3 265.0,248.2 269.2,247.2 273.4,246.1 277.6,245.0 281.8,243.9 285.9,242.9 290.1,241.8 294.3,240.7 298.5,239.6 302.7,238.5 306.9,237.5 311.1,236.4 315.2,235.3 319.4,234.2 323.6,233.2 327.8,232.1 332.0,231.0 336.2,229.9 340.4,228.8 344.6,227.8 348.8,226.7 352.9,225.6 357.1,224.5 361.3,223.5 365.5,222.4 369.7,221.3 373.9,220.2 378.1,219.1 382.2,218.1 386.4,217.0 390.6,215.9 394.8,214.8 399.0,213.8 403.2,212.7 407.4,211.6 411.6,210.5 415.8,209.4 419.9,208.4 424.1,207.3 428.3,206.2 432.5,205.1 436.7,204.0 440.9,203.0 445.1,201.9 449.2,200.8 453.4,199.7 457.6,198.7 461.8,197.6 466.0,196.5 470.2,195.4 474.4,194.3 478.6,193.3 482.8,192.2 486.9,191.1 491.1,190.0 495.3,189.0 499.5,187.9 503.7,186.8 507.9,185.7 512.1,184.6 516.2,183.6 520.4,182.5 524.6,181.4 528.8,180.3 533.0,179.2 537.2,178.2 541.4,177.1 545.6,176.0 549.8,174.9 553.9,173.9 558.1,172.8 562.3,171.7 566.5,170.6 570.7,169.5 574.9,168.5 579.1,167.4 583.2,166.3 587.4,165.2 591.6,164.2 595.8,163.1 600.0,162.0\" fill=\"none\" stroke=\"#2D7FC1\" stroke-width=\"4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"582.0\" cy=\"142.0\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"582.0\" y=\"148.0\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"16\" font-weight=\"700\" fill=\"#fff\">D</text></svg>",
    "caption": "число операций при n от 1 до 32"
   }
  },
  {
   "id": "q21",
   "topic": "Занятие 4 · граница замера",
   "type": "line",
   "text": "Нужно измерить только поиск <code>-1 in numbers</code>. Щёлкните строку, которая попала внутрь замера лишней.",
   "code": "from time import perf_counter\n\nstart = perf_counter()\nnumbers = list(range(1_000_000))\nresult = -1 in numbers\nelapsed = perf_counter() - start\nprint(f\"{elapsed:.6f} sec\")"
  },
  {
   "id": "q22",
   "topic": "Занятие 4 · медиана",
   "type": "single",
   "text": "Функция <code>measure_time</code> из занятия запускает код 7 раз и возвращает медиану. На картинке — время семи запусков, в последнем в фоне обновлялся браузер. Что вернёт функция?",
   "options": [
    "<code>10.1</code> мс",
    "<code>15.5</code> мс",
    "<code>9.8</code> мс",
    "<code>48.0</code> мс"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 300\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"время семи запусков\"><line x1=\"56\" y1=\"250.0\" x2=\"600\" y2=\"250.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"254.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">0</text><line x1=\"56\" y1=\"204.0\" x2=\"600\" y2=\"204.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"208.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">10</text><line x1=\"56\" y1=\"158.0\" x2=\"600\" y2=\"158.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"162.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">20</text><line x1=\"56\" y1=\"112.0\" x2=\"600\" y2=\"112.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"116.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">30</text><line x1=\"56\" y1=\"66.0\" x2=\"600\" y2=\"66.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"70.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">40</text><line x1=\"56\" y1=\"20.0\" x2=\"600\" y2=\"20.0\" stroke=\"#D5DAE6\"/><text x=\"48\" y=\"24.0\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#020835\">50</text><rect x=\"70.0\" y=\"203.5\" width=\"49.7\" height=\"46.5\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"94.9\" y=\"195.5\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">10,1</text><text x=\"94.9\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 1</text><rect x=\"147.7\" y=\"204.9\" width=\"49.7\" height=\"45.1\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"172.6\" y=\"196.9\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">9,8</text><text x=\"172.6\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 2</text><rect x=\"225.4\" y=\"203.1\" width=\"49.7\" height=\"46.9\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"250.3\" y=\"195.1\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">10,2</text><text x=\"250.3\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 3</text><rect x=\"303.1\" y=\"204.5\" width=\"49.7\" height=\"45.5\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"328.0\" y=\"196.5\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">9,9</text><text x=\"328.0\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 4</text><rect x=\"380.8\" y=\"204.0\" width=\"49.7\" height=\"46.0\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"405.7\" y=\"196.0\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">10,0</text><text x=\"405.7\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 5</text><rect x=\"458.6\" y=\"202.6\" width=\"49.7\" height=\"47.4\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"483.4\" y=\"194.6\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">10,3</text><text x=\"483.4\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 6</text><rect x=\"536.3\" y=\"29.2\" width=\"49.7\" height=\"220.8\" fill=\"#B4531F\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"561.1\" y=\"21.2\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">48,0</text><text x=\"561.1\" y=\"272\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#3B4467\">запуск 7</text><line x1=\"56\" y1=\"250\" x2=\"600\" y2=\"250\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"600\" y=\"294\" text-anchor=\"end\" font-family=\"Inter,sans-serif\" font-size=\"12\" fill=\"#3B4467\">время, мс</text></svg>",
    "caption": "время семи запусков, мс"
   }
  },
  {
   "id": "q23",
   "topic": "Занятие 4 · квадратичный рост",
   "type": "single",
   "text": "Замер <code>process_pairs</code> (два вложенных цикла по n) дал <b>0,020 с</b> при <code>n = 400</code>. Какое время ожидать при <code>n = 800</code>?",
   "code": "def process_pairs(n):\n    counter = 0\n    for i in range(n):\n        for j in range(n):\n            counter += 1\n    return counter",
   "options": [
    "Около 0,080 с",
    "Около 0,040 с",
    "Около 0,160 с",
    "Около 0,021 с"
   ]
  },
  {
   "id": "q24",
   "topic": "Занятие 4 · два O(n)",
   "type": "single",
   "text": "На одном списке из миллиона чисел встроенная <code>sum()</code> оказалась в несколько раз быстрее ручного цикла. Какой вывод верный?",
   "code": "def manual_sum(numbers):\n    result = 0\n    for number in numbers:\n        result += number\n    return result\n\ndef builtin_sum(numbers):\n    return sum(numbers)",
   "options": [
    "Обе функции O(n); Big O не показывает постоянный множитель и цену одной операции",
    "<code>sum()</code> работает за O(1), поэтому и быстрее",
    "Ручной цикл на самом деле O(n²) из-за присваивания внутри",
    "Замер ошибочен: у функций одного класса время должно совпадать"
   ]
  },
  {
   "id": "q25",
   "topic": "Занятие 4 · tracemalloc и генератор",
   "type": "single",
   "text": "Обе функции считают одну и ту же сумму. У какой <code>tracemalloc</code> покажет больший <code>peak</code> при n = 1 000 000 и почему?",
   "code": "def with_list(n):\n    return sum([i * i for i in range(n)])\n\ndef with_generator(n):\n    return sum(i * i for i in range(n))",
   "options": [
    "У <code>with_list</code>: список хранит все n квадратов сразу",
    "У <code>with_generator</code>: генератор заранее готовит все значения",
    "Одинаковый: результат у функций один и тот же",
    "Разницы не будет: tracemalloc показывает память всего процесса"
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
