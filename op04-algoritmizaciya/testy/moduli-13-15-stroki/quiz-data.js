/* Тест по книге «Алгоритмы на строках»: модуль 0 и модули 13–15, ОП.04. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op04-test-m1315-r2",
 "prefix": "AL15",
 "title": "Модули 0, 13–15 · алгоритмы на строках",
 "minutes": 60,
 "salt": "op04-m1315-2026-nov",
 "context": "Код в вопросах — Python 3.12, функции те же, что в главах модулей 0, 13, 14 и 15 книги «Алгоритмы на строках». Под n понимается длина строки. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 13,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 10,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 7,
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
   "id": "q16",
   "topic": "13.3 · ошибка в first_unique",
   "type": "line",
   "text": "Это изменённая версия <code>first_unique</code>.<ul><li>На строке 'казак' функция вернула 2 — это верно.</li><li>Вызов <code>first_unique('Казак')</code> упал с ошибкой <code>KeyError: 'К'</code>.</li></ul>",
   "task": "Нажмите строку кода, в которой ошибка.",
   "code": "def first_unique(text):\n    count = {}\n    for ch in text:\n        key = ch.casefold()\n        count[key] = count.get(key, 0) + 1\n    for i, ch in enumerate(text):\n        if ch.isalpha() and count[ch] == 1:\n            return i\n    return -1"
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
