/* Тест по книге «Алгоритмы на строках»: модуль 0 и модули 13–15, ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-m1315-r1",
 "prefix": "AL15",
 "title": "Модули 0, 13–15 · алгоритмы на строках",
 "minutes": 60,
 "salt": "op04-m1315-2026-nov",
 "context": "Код в вопросах — Python 3.12, функции те же, что в главах модулей 0, 13, 14 и 15 книги «Алгоритмы на строках». Под n понимается длина строки. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 25,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 19,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 13,
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
   "topic": "0.1 · индекс и срез",
   "type": "multi",
   "text": "В переменной <code>s</code> лежит строка из девяти букв.",
   "task": "Отметьте все выражения, которые дают строку <code>'лад'</code>.",
   "code": "s = 'накладная'",
   "options": [
    "<code>s[3:6]</code>",
    "<code>s[2:5]</code>",
    "<code>s[-6:-3]</code>",
    "<code>s[4:7]</code>",
    "<code>s[::-1][3:6]</code>",
    "<code>s[3:-4]</code>"
   ]
  },
  {
   "id": "q02",
   "topic": "0.1 · строку нельзя изменить",
   "type": "single",
   "text": "Программа работает со строкой и со списком её символов.",
   "task": "Выберите, что напечатает программа.",
   "code": "a = 'склад'\nb = a\na = a.upper()\nc = list(b)\nc[0] = 'С'\nprint(a, b, ''.join(c))",
   "options": [
    "<code>СКЛАД склад Склад</code>",
    "<code>СКЛАД СКЛАД Склад</code>",
    "<code>склад склад Склад</code>",
    "Программа упадёт с TypeError"
   ]
  },
  {
   "id": "q03",
   "topic": "0.1 · индекс, срез и запись",
   "type": "sort",
   "text": "Все выражения выполняются после строки <code>s = 'склад'</code>. Длина строки — 5.",
   "task": "Разложите выражения по результату выполнения.",
   "items": [
    "<code>s[10]</code>",
    "<code>s[2:100]</code>",
    "<code>s[0] = 'С'</code>",
    "<code>s[-5]</code>",
    "<code>s[-6]</code>",
    "<code>s[5:2]</code>",
    "<code>s.replace('с', 'С')</code>"
   ],
   "buckets": [
    "IndexError",
    "TypeError",
    "выполняется без ошибки"
   ]
  },
  {
   "id": "q04",
   "topic": "0.1–0.2 · сравнение строк",
   "type": "multi",
   "text": "Строки сравниваются слева направо, символ за символом, по номерам символов в таблице Unicode.",
   "task": "Отметьте все выражения, которые дают <code>True</code>.",
   "options": [
    "<code>'10' &lt; '9'</code>",
    "<code>'ё' &lt; 'ж'</code>",
    "<code>'Я' &lt; 'а'</code>",
    "<code>'abc' &lt; 'ab'</code>",
    "<code>'Склад' == 'склад'</code>",
    "<code>'ёж' &gt; 'яма'</code>"
   ]
  },
  {
   "id": "q05",
   "topic": "0.2 · порядок sorted",
   "type": "order",
   "text": "Список строк упорядочивают вызовом <code>sorted(words)</code> без аргумента key.",
   "task": "Расставьте строки в том порядке, в котором их напечатает программа. Первая — сверху.",
   "code": "words = ['ёж', 'Яма', 'арбуз', '10', '9', 'Банан']\nprint(sorted(words))",
   "items": [
    "'10'",
    "'9'",
    "'Банан'",
    "'Яма'",
    "'арбуз'",
    "'ёж'"
   ]
  },
  {
   "id": "q06",
   "topic": "0.2 · байты UTF-8",
   "type": "number",
   "text": "Название товара записывается в базу данных в кодировке UTF-8. Поле в базе ограничено числом байтов, а не символов.",
   "task": "Введите, что напечатает программа.",
   "code": "name = 'Ёлка 2026'\nprint(len(name.encode('utf-8')))",
   "unit": ""
  },
  {
   "id": "q07",
   "topic": "0.2 · регистр и casefold",
   "type": "single",
   "text": "Немецкая буква ß в заглавном виде записывается двумя буквами SS.",
   "task": "Выберите, что напечатает программа.",
   "code": "s = 'Straße'\nprint(len(s.upper()), s.casefold() == 'STRASSE'.casefold())",
   "options": [
    "<code>7 True</code>",
    "<code>6 True</code>",
    "<code>7 False</code>",
    "<code>6 False</code>"
   ]
  },
  {
   "id": "q08",
   "topic": "0.3 · порядок шагов нормализации",
   "type": "single",
   "text": "Функция <code>city_key</code> строит ключ города для группировки заказов.<ul><li>Запись «Королёв» пришла из программы, которая хранит ё двумя кодовыми точками: буквой е и знаком ◌̈ над ней.</li><li><code>city_key('Королев')</code> вернула 'королев'.</li><li>Для записи из программы функция вернула строку, которая на экране выглядит как 'королёв'.</li></ul>",
   "task": "Выберите причину, по которой ключи двух записей не совпали.",
   "code": "import unicodedata\n\ndef city_key(text):\n    text = text.lower().replace('ё', 'е')\n    text = unicodedata.normalize('NFC', text)\n    return ' '.join(text.replace('-', ' ').split())",
   "options": [
    "replace ищет ё одной кодовой точкой, а до шага NFC такой точки нет",
    "lower не переводит в строчную букву Е, если над ней стоит знак ◌̈",
    "NFC делит букву ё на е и знак ◌̈, и replace после этого их не находит",
    "replace меняет только первую букву ё, а в записи она стоит не первой"
   ]
  },
  {
   "id": "q09",
   "topic": "0.3 · split и split(' ')",
   "type": "number",
   "text": "ФИО из формы делят на слова. В строке два пробела в начале, три пробела между словами и неразрывный пробел <code>\\xa0</code> в конце.",
   "task": "Введите, что напечатает программа.",
   "code": "text = '  Иван   Петров\\xa0'\nprint(len(text.split(' ')))",
   "unit": ""
  },
  {
   "id": "q10",
   "topic": "0.4 · стоимость операций",
   "type": "sort",
   "text": "n — длина строки s. Строки нельзя изменить, и операция, которая возвращает строку, копирует символы в новую.",
   "task": "Разложите операции по времени работы.",
   "items": [
    "<code>len(s)</code>",
    "<code>s[i]</code>",
    "<code>s.lower()</code>",
    "<code>''.join(parts)</code>, в parts — n символов",
    "Цикл по s, в котором для каждого символа вызывается <code>s.count(ch)</code>",
    "Цикл по s: <code>result = result + ch</code>, затем <code>history.append(result)</code>",
    "<code>'x' in s</code>",
    "<code>Counter(s)</code>"
   ],
   "buckets": [
    "O(1)",
    "O(n)",
    "O(n²)"
   ]
  },
  {
   "id": "q11",
   "topic": "13.1, 14.1, 15.1 · вид задачи",
   "type": "sort",
   "text": "Ниже семь условий задач на строки из занятий 13–15 и LeetCode.",
   "task": "Разложите условия по способу решения.",
   "items": [
    "Можно ли составить записку из букв журнала",
    "Собрать самый длинный палиндром из букв строки, буквы можно переставлять",
    "Читается ли фраза одинаково с двух концов, копию строки создавать нельзя",
    "Развернуть только буквы, знаки оставить на своих местах",
    "Записать каждую серию одинаковых символов символом и длиной серии",
    "Переставить слова в обратном порядке, между словами один пробел",
    "Найти индекс первой буквы, которая встречается в строке один раз"
   ],
   "buckets": [
    "частоты символов",
    "два указателя навстречу",
    "разбор и построение строки"
   ]
  },
  {
   "id": "q12",
   "topic": "13.2 · контракт is_anagram",
   "type": "sort",
   "text": "Функция <code>is_anagram</code> из главы 13.2. По контракту:<ul><li>регистр, пробелы и знаки не важны;</li><li>ё и е — разные буквы;</li><li>две строки без букв и цифр — анаграммы.</li></ul>",
   "task": "Разложите вызовы по результату.",
   "code": "import unicodedata\n\ndef letters(text):\n    text = unicodedata.normalize('NFC', text).casefold()\n    return [ch for ch in text if ch.isalnum()]\n\n\ndef is_anagram(a, b):\n    a = letters(a)\n    b = letters(b)\n    if len(a) != len(b):\n        return False\n    count = {}\n    for ch in a:\n        count[ch] = count.get(ch, 0) + 1\n    for ch in b:\n        if count.get(ch, 0) == 0:\n            return False\n        count[ch] -= 1\n    return True",
   "items": [
    "<code>is_anagram('Апельсин', 'спаниель')</code>",
    "<code>is_anagram('папа', 'пап')</code>",
    "<code>is_anagram('ёж', 'еж')</code>",
    "<code>is_anagram('', '!!')</code>",
    "<code>is_anagram('Листок!', 'слиток')</code>",
    "<code>is_anagram('аб', 'аа')</code>",
    "<code>is_anagram('кот 1', 'ток 2')</code>"
   ],
   "buckets": [
    "True",
    "False"
   ]
  },
  {
   "id": "q13",
   "topic": "13.2 · версия с множеством",
   "type": "multi",
   "text": "В этой версии <code>is_anagram</code> словарь заменён множеством. В вариантах ответа — тесты к функции, в каждом записан верный по контракту ответ.",
   "task": "Отметьте все тесты, которые упадут на этой версии.",
   "code": "import unicodedata\n\ndef letters(text):\n    text = unicodedata.normalize('NFC', text).casefold()\n    return [ch for ch in text if ch.isalnum()]\n\n\ndef is_anagram(a, b):\n    return set(letters(a)) == set(letters(b))",
   "options": [
    "<code>assert is_anagram('листок', 'слиток') == True</code>",
    "<code>assert is_anagram('папа', 'пап') == False</code>",
    "<code>assert is_anagram('аабб', 'абаб') == True</code>",
    "<code>assert is_anagram('ааб', 'абб') == False</code>",
    "<code>assert is_anagram('Кот', 'ток!') == True</code>",
    "<code>assert is_anagram('', 'а') == False</code>"
   ]
  },
  {
   "id": "q14",
   "topic": "13.2 · код со словарём",
   "type": "slots",
   "text": "В функции <code>is_anagram</code> три пропуска. Функция <code>letters</code> — из главы 13.2, она возвращает список значимых символов.",
   "task": "Заполните пропуски так, чтобы функция работала по контракту главы 13.2.",
   "code": "def is_anagram(a, b):\n    a = letters(a)\n    b = letters(b)\n    if [1]:\n        return False\n    count = {}\n    for ch in a:\n        count[ch] = [2]\n    for ch in b:\n        if [3]:\n            return False\n        count[ch] -= 1\n    return True",
   "chips": [
    "len(a) != len(b)",
    "set(a) != set(b)",
    "count.get(ch, 0) + 1",
    "count[ch] + 1",
    "count.get(ch, 0) == 0",
    "ch not in count",
    "count[ch] == 1"
   ],
   "slots": [
    "[1] условие раннего выхода",
    "[2] новое значение счётчика",
    "[3] условие внутри второго цикла"
   ]
  },
  {
   "id": "q15",
   "topic": "13.3 · прогон first_unique",
   "type": "number",
   "text": "Функция <code>first_unique</code> из главы 13.3 ищет первую букву, которая встречается в строке один раз. Регистр не важен, символы, которые не буквы, не рассматриваются.",
   "task": "Введите, что напечатает программа.",
   "code": "def first_unique(text):\n    count = {}\n    for ch in text:\n        key = ch.casefold()\n        count[key] = count.get(key, 0) + 1\n    for i, ch in enumerate(text):\n        if ch.isalpha() and count[ch.casefold()] == 1:\n            return i\n    return -1\n\nprint(first_unique('Анна, Нина и Ян!'))",
   "unit": ""
  },
  {
   "id": "q16",
   "topic": "13.3 · ошибка в first_unique",
   "type": "line",
   "text": "Это изменённая версия <code>first_unique</code>.<ul><li>На строке 'казак' функция вернула 2 — это верно.</li><li>Вызов <code>first_unique('Казак')</code> упал с ошибкой <code>KeyError: 'К'</code>.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def first_unique(text):\n    count = {}\n    for ch in text:\n        key = ch.casefold()\n        count[key] = count.get(key, 0) + 1\n    for i, ch in enumerate(text):\n        if ch.isalpha() and count[ch] == 1:\n            return i\n    return -1"
  },
  {
   "id": "q17",
   "topic": "13.3 · ФИО из формы",
   "type": "single",
   "text": "Функция <code>normalize_name</code> из главы 13.3 приводит ФИО из формы к единому виду.",
   "task": "Выберите, что напечатает программа.",
   "code": "import unicodedata\n\ndef normalize_name(text):\n    words = unicodedata.normalize('NFC', text).split()\n    result = []\n    for word in words:\n        parts = [part.capitalize() for part in word.split('-')]\n        result.append('-'.join(parts))\n    return ' '.join(result)\n\nprint(normalize_name(\"  д'артаньян   салтыков-щедрин \"))",
   "options": [
    "<code>Д'артаньян Салтыков-Щедрин</code>",
    "<code>Д'Артаньян Салтыков-Щедрин</code>",
    "<code>Д'артаньян Салтыков-щедрин</code>",
    "<code>  Д'артаньян   Салтыков-Щедрин </code>"
   ]
  },
  {
   "id": "q18",
   "topic": "14.2 · прогон is_palindrome",
   "type": "number",
   "text": "Функция <code>is_palindrome</code> из главы 14.2 проверяет фразу двумя указателями и пропускает символы, которые не буквы и не цифры.",
   "task": "Введите, сколько раз за этот вызов выполнится сравнение <code>text[i].casefold() != text[j].casefold()</code>.",
   "code": "def is_palindrome(text):\n    i, j = 0, len(text) - 1\n    while i < j:\n        while i < j and not text[i].isalnum():\n            i += 1\n        while i < j and not text[j].isalnum():\n            j -= 1\n        if text[i].casefold() != text[j].casefold():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nprint(is_palindrome('Аргентина манит негра'))",
   "unit": "раз"
  },
  {
   "id": "q19",
   "topic": "14.4 · граница пропуска",
   "type": "line",
   "text": "Это изменённая версия <code>is_palindrome</code>.<ul><li>На фразах с буквами функция отвечает верно.</li><li>Вызов <code>is_palindrome('?!')</code> упал с IndexError. По контракту строка без букв и цифр — палиндром.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def is_palindrome(text):\n    i, j = 0, len(text) - 1\n    while i < j:\n        while not text[i].isalnum():\n            i += 1\n        while i < j and not text[j].isalnum():\n            j -= 1\n        if text[i].casefold() != text[j].casefold():\n            return False\n        i += 1\n        j -= 1\n    return True"
  },
  {
   "id": "q20",
   "topic": "14.2 · контракт is_palindrome",
   "type": "sort",
   "text": "Функция <code>is_palindrome</code> из главы 14.2. По контракту сравниваются только буквы и цифры без учёта регистра, ё и е — разные буквы.",
   "task": "Разложите вызовы по результату.",
   "code": "def is_palindrome(text):\n    i, j = 0, len(text) - 1\n    while i < j:\n        while i < j and not text[i].isalnum():\n            i += 1\n        while i < j and not text[j].isalnum():\n            j -= 1\n        if text[i].casefold() != text[j].casefold():\n            return False\n        i += 1\n        j -= 1\n    return True",
   "items": [
    "<code>is_palindrome('')</code>",
    "<code>is_palindrome('.,')</code>",
    "<code>is_palindrome('1а2')</code>",
    "<code>is_palindrome('Аа')</code>",
    "<code>is_palindrome('ёе')</code>",
    "<code>is_palindrome('Я иду с мечем, судия')</code>",
    "<code>is_palindrome('race a car')</code>"
   ],
   "buckets": [
    "True",
    "False"
   ]
  },
  {
   "id": "q21",
   "topic": "14.3 · removal_index",
   "type": "sort",
   "text": "Функция <code>removal_index</code> из главы 14.3 возвращает:<ul><li>−1, если строка уже палиндром;</li><li>индекс символа, после удаления которого строка становится палиндромом;</li><li>None, если одного удаления не хватает.</li></ul>",
   "task": "Разложите вызовы по значению, которое вернёт этот код.",
   "code": "def removal_index(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        if s[i] != s[j]:\n            if is_range_palindrome(s, i + 1, j):\n                return i\n            if is_range_palindrome(s, i, j - 1):\n                return j\n            return None\n        i += 1\n        j -= 1\n    return -1\n\n\ndef is_range_palindrome(s, i, j):\n    while i < j:\n        if s[i] != s[j]:\n            return False\n        i += 1\n        j -= 1\n    return True",
   "items": [
    "<code>removal_index('ротатор')</code>",
    "<code>removal_index('ротатоор')</code>",
    "<code>removal_index('шалаши')</code>",
    "<code>removal_index('ашалаш')</code>",
    "<code>removal_index('abcda')</code>",
    "<code>removal_index('')</code>",
    "<code>removal_index('xшалаш')</code>"
   ],
   "buckets": [
    "−1",
    "0",
    "5",
    "None"
   ]
  },
  {
   "id": "q22",
   "topic": "14.3 · две проверки",
   "type": "single",
   "text": "В <code>can_be_palindrome</code> указатели идут навстречу до первого различия <code>s[i] != s[j]</code>. Затем проверяются только два отрезка: без <code>s[i]</code> и без <code>s[j]</code>.",
   "task": "Выберите, почему удалять другие символы строки не нужно.",
   "code": "def can_be_palindrome(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        if s[i] != s[j]:\n            return is_range_palindrome(s, i + 1, j) or is_range_palindrome(s, i, j - 1)\n        i += 1\n        j -= 1\n    return True",
   "options": [
    "Пары снаружи совпали, а пара s[i] и s[j] не совпадёт, пока оба стоят на месте",
    "По условию задачи удалять разрешено только первый или последний символ строки",
    "После удаления символа в середине строки её длина становится чётной",
    "Символы левее i уже удалены из строки на предыдущих шагах цикла"
   ]
  },
  {
   "id": "q23",
   "topic": "14.3 · проверка одного варианта",
   "type": "multi",
   "text": "В этой версии <code>can_be_palindrome</code> при различии проверяется только отрезок без <code>s[i]</code>. В вариантах ответа — тесты к функции, в каждом записан верный ответ.",
   "task": "Отметьте все тесты, которые упадут на этой версии.",
   "code": "def can_be_palindrome(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        if s[i] != s[j]:\n            return is_range_palindrome(s, i + 1, j)\n        i += 1\n        j -= 1\n    return True\n\n\ndef is_range_palindrome(s, i, j):\n    while i < j:\n        if s[i] != s[j]:\n            return False\n        i += 1\n        j -= 1\n    return True",
   "options": [
    "<code>assert can_be_palindrome('abca') == True</code>",
    "<code>assert can_be_palindrome('шалаши') == True</code>",
    "<code>assert can_be_palindrome('abc') == False</code>",
    "<code>assert can_be_palindrome('ротатоор') == True</code>",
    "<code>assert can_be_palindrome('ab') == True</code>",
    "<code>assert can_be_palindrome('eeeed') == True</code>"
   ]
  },
  {
   "id": "q24",
   "topic": "14.2–14.3 · время и память",
   "type": "sort",
   "text": "<code>is_palindrome</code> идёт указателями по исходной строке, <code>is_palindrome_copy</code> строит очищенный список символов и сравнивает его с разворотом. n — длина строки.",
   "task": "Разложите оценки по группам.",
   "code": "def is_palindrome_copy(text):\n    cleaned = [ch.casefold() for ch in text if ch.isalnum()]\n    return cleaned == cleaned[::-1]",
   "items": [
    "Время is_palindrome",
    "Дополнительная память is_palindrome",
    "Дополнительная память is_palindrome_copy",
    "Время перебора: удалить каждый символ по очереди и проверить остаток",
    "Время can_be_palindrome",
    "Дополнительная память can_be_palindrome",
    "Время is_palindrome_copy"
   ],
   "buckets": [
    "O(1)",
    "O(n)",
    "O(n²)"
   ]
  },
  {
   "id": "q25",
   "topic": "15.2 · недопустимые записи",
   "type": "multi",
   "text": "Функции <code>compress</code> и <code>decompress</code> из главы 15.2. По контракту:<ul><li>цифра во входе compress — ValueError;</li><li>decompress принимает только то, что может выдать compress, остальное — ValueError.</li></ul>",
   "task": "Отметьте все вызовы, которые закончатся исключением ValueError.",
   "code": "def compress(s):\n    out = []\n    i = 0\n    while i < len(s):\n        if s[i].isdigit():\n            raise ValueError(f'символ {i}: цифра {s[i]!r}')\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        out.append(s[i])\n        if j - i > 1:\n            out.append(str(j - i))\n        i = j\n    return ''.join(out)\n\n\ndef decompress(code):\n    out = []\n    i = 0\n    prev = ''\n    while i < len(code):\n        ch = code[i]\n        if ch.isdigit():\n            raise ValueError(f'символ {i}: цифра без символа серии')\n        if ch == prev:\n            raise ValueError(f'символ {i}: серия {ch!r} разбита на две')\n        j = i + 1\n        while j < len(code) and code[j].isdigit():\n            j += 1\n        digits = code[i + 1:j]\n        if digits == '':\n            count = 1\n        elif digits[0] == '0' or digits == '1':\n            raise ValueError(f'символ {i + 1}: недопустимая длина {digits!r}')\n        else:\n            count = int(digits)\n        out.append(ch * count)\n        prev = ch\n        i = j\n    return ''.join(out)",
   "options": [
    "<code>compress('a12')</code>",
    "<code>decompress('a12')</code>",
    "<code>decompress('a1')</code>",
    "<code>decompress('3a')</code>",
    "<code>decompress('a2a')</code>",
    "<code>decompress('a10')</code>",
    "<code>compress('')</code>",
    "<code>decompress('ab')</code>"
   ]
  },
  {
   "id": "q26",
   "topic": "15.2 · длина сжатой записи",
   "type": "number",
   "text": "Функция <code>compress</code> из главы 15.2: серия записывается символом и длиной, длина 1 не пишется, длина пишется всеми цифрами.",
   "task": "Введите, что напечатает программа.",
   "code": "def compress(s):\n    out = []\n    i = 0\n    while i < len(s):\n        if s[i].isdigit():\n            raise ValueError(f'символ {i}: цифра {s[i]!r}')\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        out.append(s[i])\n        if j - i > 1:\n            out.append(str(j - i))\n        i = j\n    return ''.join(out)\n\nprint(len(compress('x' * 12 + 'yzz' + 'q' * 100)))",
   "unit": ""
  },
  {
   "id": "q27",
   "topic": "15.2 · граница серии",
   "type": "line",
   "text": "Это изменённая версия <code>compress</code>.<ul><li>Вызов <code>compress('aab')</code> упал с IndexError.</li><li>Верный ответ — 'a2b'.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def compress(s):\n    out = []\n    i = 0\n    while i < len(s):\n        if s[i].isdigit():\n            raise ValueError(f'символ {i}: цифра {s[i]!r}')\n        j = i\n        while s[j] == s[i] and j < len(s):\n            j += 1\n        out.append(s[i])\n        if j - i > 1:\n            out.append(str(j - i))\n        i = j\n    return ''.join(out)"
  },
  {
   "id": "q28",
   "topic": "15.3 · partition",
   "type": "single",
   "text": "Функция <code>parse_event</code> из главы 15.3 разбирает строку события в словарь. Ключ отделяется по первому знаку = через <code>partition</code>, пробелы по краям убираются, одна ; в конце допустима.",
   "task": "Выберите, что напечатает программа.",
   "code": "def parse_event(line):\n    if line.endswith(';'):\n        line = line[:-1]\n    event = {}\n    for k, field in enumerate(line.split(';'), start=1):\n        if field.strip() == '':\n            raise ValueError(f'поле {k}: пустое')\n        key, sep, value = field.partition('=')\n        if sep == '':\n            raise ValueError(f\"поле {k}: нет '='\")\n        key = key.strip()\n        if key == '':\n            raise ValueError(f'поле {k}: пустой ключ')\n        if key in event:\n            raise ValueError(f'поле {k}: ключ {key!r} повторяется')\n        event[key] = value.strip()\n    return event\n\nprint(parse_event('time = 09:15; note=a=b;'))",
   "options": [
    "<code>{'time': '09:15', 'note': 'a=b'}</code>",
    "<code>{'time ': ' 09:15', ' note': 'a=b'}</code>",
    "<code>{'time': '09:15', 'note': 'a'}</code>",
    "ValueError: поле 3: пустое"
   ]
  },
  {
   "id": "q29",
   "topic": "15.3 · повреждённая строка",
   "type": "sort",
   "text": "Функция <code>parse_event</code> из главы 15.3 бросает ValueError с номером поля, если поле пустое, в поле нет =, ключ пустой или ключ повторяется. Пустое значение допустимо.",
   "task": "Разложите строки по результату вызова <code>parse_event</code>.",
   "code": "def parse_event(line):\n    if line.endswith(';'):\n        line = line[:-1]\n    event = {}\n    for k, field in enumerate(line.split(';'), start=1):\n        if field.strip() == '':\n            raise ValueError(f'поле {k}: пустое')\n        key, sep, value = field.partition('=')\n        if sep == '':\n            raise ValueError(f\"поле {k}: нет '='\")\n        key = key.strip()\n        if key == '':\n            raise ValueError(f'поле {k}: пустой ключ')\n        if key in event:\n            raise ValueError(f'поле {k}: ключ {key!r} повторяется')\n        event[key] = value.strip()\n    return event",
   "items": [
    "<code>'time=09:15;;user=ivan'</code>",
    "<code>'user=ivan;'</code>",
    "<code>'user'</code>",
    "<code>'=ivan'</code>",
    "<code>'a=1;a=2'</code>",
    "<code>'note='</code>",
    "<code>' user = ivan '</code>"
   ],
   "buckets": [
    "словарь",
    "ValueError"
   ]
  },
  {
   "id": "q30",
   "topic": "15.3 · разбор журнала",
   "type": "sort",
   "text": "Журнал из шести строк разбирается функцией <code>parse_log</code> из главы 15.3. Она вызывает <code>parse_event</code> для каждой строки.<ul><li>Пустые строки пропускаются.</li><li>Ошибка строки записывается в errors вместе с номером строки, разбор идёт дальше.</li><li>Обязательные ключи — time, user и action.</li></ul>",
   "task": "Разложите строки журнала по тому, куда они попадут.",
   "code": "REQUIRED = ('time', 'user', 'action')\n\ndef parse_log(text):\n    events, errors = [], []\n    for n, line in enumerate(text.split('\\n'), start=1):\n        if line.strip() == '':\n            continue\n        try:\n            event = parse_event(line)\n        except ValueError as e:\n            errors.append((n, str(e)))\n            continue\n        missing = [key for key in REQUIRED if key not in event]\n        if missing:\n            errors.append((n, f'нет ключа {missing[0]}'))\n            continue\n        events.append(event)\n    return events, errors\n\n\nlog = '''time=09:15;user=ivan;action=login\n\ntime=09:20;user=olga\ntime=09:31;;user=petr;action=logout\n time = 09:40 ; user = anna ; action = login ;\nuser=ivan;action=logout;time=09:55'''\nevents, errors = parse_log(log)",
   "items": [
    "строка 1 · time=09:15;user=ivan;action=login",
    "строка 2 · пустая",
    "строка 3 · time=09:20;user=olga",
    "строка 4 · time=09:31;;user=petr;action=logout",
    "строка 5 · time = 09:40 ; user = anna ; action = login ;",
    "строка 6 · user=ivan;action=logout;time=09:55"
   ],
   "buckets": [
    "events",
    "errors",
    "пропущена"
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
