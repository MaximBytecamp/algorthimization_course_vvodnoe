/* Тест МДК.01.01 по теме 02. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "mdk0101-test-t02",
 "prefix": "MD02",
 "title": "Тема 02 · структура проекта: модули, пакеты и окружение",
 "minutes": 45,
 "salt": "mdk0101-t02-2026-sep",
 "context": "Проект во всех заданиях — Student Tools из книги темы 02, ветка Python. Команды выполняются в терминале VS Code. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
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
   "topic": "2.1 · зачем .venv",
   "type": "single",
   "text": "Одногруппник просит: «Скинь мне свою папку <code>.venv</code>, чтобы не ставить библиотеки заново». Как правильно поступить?",
   "options": [
    "Не передавать её: отправить код и <code>requirements.txt</code>, окружение он создаст сам",
    "Передать архивом: внутри те же версии библиотек, значит у него всё запустится",
    "Передать, но сначала выполнить <code>deactivate</code>, чтобы окружение стало переносимым",
    "Отправить через Git: при клонировании пути внутри <code>.venv</code> пересчитаются сами"
   ]
  },
  {
   "id": "q02",
   "topic": "2.1–2.3 · первый запуск",
   "type": "order",
   "text": "Расставьте шаги от распакованного архива до цветного результата в правильном порядке. Первый шаг — сверху.",
   "items": [
    "Открыть папку <code>student-tools</code> в VS Code и терминал в ней",
    "Создать окружение: <code>python -m venv .venv</code>",
    "Активировать окружение в этом терминале",
    "Проверить <code>sys.executable</code>: путь ведёт внутрь <code>.venv</code>",
    "Установить библиотеку: <code>python -m pip install rich</code>",
    "Запустить программу: <code>python main.py</code>"
   ]
  },
  {
   "id": "q03",
   "topic": "2.1 · что делает активация",
   "type": "multi",
   "text": "На схеме — список папок из переменной PATH до и после активации. Какие утверждения об активации верны? Отметьте все.",
   "options": [
    "Ставит <code>.venv/bin</code> в начало PATH — первым находится python окружения",
    "Действует только в текущем терминале, соседняя вкладка работает по-старому",
    "<code>deactivate</code> возвращает прежний PATH, а папка <code>.venv</code> остаётся на диске",
    "Записывает путь к <code>.venv</code> в системный PATH — для всех терминалов сразу",
    "Без активации python из <code>.venv</code> не запустить, даже по полному пути"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 680 250\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"список PATH до и после активации\"><text x=\"16\" y=\"26\" font-family=\"Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#020835\">до активации</text><text x=\"16\" y=\"46\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">PATH, поиск сверху вниз</text><rect x=\"16\" y=\"60\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"28\" y=\"84\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">1</text><text x=\"48\" y=\"84\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/opt/homebrew/bin</text><rect x=\"16\" y=\"106\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"28\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">2</text><text x=\"48\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/usr/bin</text><rect x=\"16\" y=\"152\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"28\" y=\"176\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">3</text><text x=\"48\" y=\"176\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/bin</text><text x=\"356\" y=\"26\" font-family=\"Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#020835\">после активации</text><text x=\"356\" y=\"46\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">PATH, поиск сверху вниз</text><rect x=\"356\" y=\"60\" width=\"310\" height=\"38\" fill=\"#E3F1FA\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"368\" y=\"84\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">1</text><text x=\"388\" y=\"84\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"700\" fill=\"#020835\">~/student-tools/.venv/bin</text><rect x=\"356\" y=\"106\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"368\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">2</text><text x=\"388\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/opt/homebrew/bin</text><rect x=\"356\" y=\"152\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"368\" y=\"176\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">3</text><text x=\"388\" y=\"176\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/usr/bin</text><rect x=\"356\" y=\"198\" width=\"310\" height=\"38\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"368\" y=\"222\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" fill=\"#5A6385\">4</text><text x=\"388\" y=\"222\" font-family=\"Roboto Mono,monospace\" font-size=\"13\" font-weight=\"400\" fill=\"#020835\">/bin</text></svg>",
    "caption": "PATH в одном терминале до и после активации (macOS)"
   }
  },
  {
   "id": "q04",
   "topic": "2.1 · проверка окружения",
   "type": "single",
   "text": "Студент выполнил проверку и получил вывод с картинки. Что он узнал?",
   "options": [
    "Терминал работает с базовым Python: окружение в нём не активировано",
    "Окружение активно, просто оно создано от Python из <code>/opt/homebrew</code>",
    "Папки <code>.venv</code> в проекте нет: <code>False</code> значит «окружение не найдено»",
    "Rich поставлен не туда: <code>False</code> значит, что pip взял другой Python"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 156\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"153\" rx=\"8\" fill=\"#0B1230\" stroke=\"#020835\" stroke-width=\"3\"/><circle cx=\"22\" cy=\"20\" r=\"6\" fill=\"#FF5F57\"/><circle cx=\"42\" cy=\"20\" r=\"6\" fill=\"#FEBC2E\"/><circle cx=\"62\" cy=\"20\" r=\"6\" fill=\"#28C840\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#8E98BC\">ТЕРМИНАЛ</text><text x=\"24\" y=\"58\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8FE3B0\">$ </tspan><tspan fill=\"#E8ECF7\" font-weight=\"700\">python -c \"import sys; print(sys.executable);</tspan></text><text x=\"24\" y=\"82\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\" font-weight=\"700\">  print(sys.prefix != sys.base_prefix)\"</tspan></text><text x=\"24\" y=\"106\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\">/opt/homebrew/bin/python3</tspan></text><text x=\"24\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\">False</tspan></text></svg>",
    "caption": "терминал VS Code, папка student-tools"
   }
  },
  {
   "id": "q05",
   "topic": "2.2 · редактор и терминал",
   "type": "single",
   "text": "В терминале <code>python -m pip show rich</code> показывает Location внутри <code>student-tools/.venv</code>, и <code>python main.py</code> работает. А кнопка запуска в VS Code даёт <code>ModuleNotFoundError: No module named 'rich'</code>. Что проверить первым?",
   "options": [
    "Интерпретатор в VS Code: <b>Python: Select Interpreter</b> → <code>./.venv</code>",
    "Переустановить Rich: <code>python -m pip install rich</code> в новом терминале",
    "Прописать путь к <code>.venv</code> в системный PATH и перезапустить VS Code",
    "Ещё раз выполнить активацию в терминале, где <code>main.py</code> уже работает"
   ]
  },
  {
   "id": "q06",
   "topic": "2.3 · python -m pip",
   "type": "single",
   "text": "Почему в книге библиотеки ставят командой <code>python -m pip install rich</code>, а не просто <code>pip install rich</code>?",
   "options": [
    "pip запускается выбранным Python, и пакет ставится именно в него",
    "С <code>-m</code> пакет попадёт в <code>.venv</code>, даже если она не активирована",
    "С <code>-m</code> библиотека и её версия сразу пишутся в <code>requirements.txt</code>",
    "Так пакет ставится сразу во все Python, которые есть на компьютере"
   ]
  },
  {
   "id": "q07",
   "topic": "2.1–2.6 · команды проекта",
   "type": "slots",
   "text": "Подставьте к каждой задаче команду, которой её решают в проекте Student Tools. Все команды выполняются из корня проекта.",
   "chips": [
    "python -m venv .venv",
    "python -m pip install rich",
    "python -m pip freeze &gt; requirements.txt",
    "python -m pip install -r requirements.txt",
    "python -m app.main",
    "python -m pytest -v",
    "python app/main.py",
    "python -m pip freeze &lt; requirements.txt"
   ],
   "slots": [
    "Создать окружение проекта",
    "Добавить библиотеку в окружение",
    "Записать установленные версии в файл",
    "На другом компьютере поставить те же версии",
    "Запустить приложение-пакет",
    "Прогнать тесты"
   ]
  },
  {
   "id": "q08",
   "topic": "2.4 · повторный импорт",
   "type": "number",
   "text": "Первая строка файла <code>calculator.py</code> — <code>print(\"загружаю calculator\")</code>. Сколько раз эта фраза появится в терминале после <code>python main.py</code>?",
   "code": "import calculator\nimport calculator\nfrom calculator import calculate_average\n\nprint(calculate_average([5, 4, 5, 3, 5]))",
   "unit": "раз"
  },
  {
   "id": "q09",
   "topic": "2.4 · две формы импорта",
   "type": "slots",
   "text": "Обе строки загружают один и тот же <code>calculator.py</code>. Подставьте, какое имя появляется в файле после импорта и как вызвать функцию.",
   "chips": [
    "calculator",
    "calculate_average",
    "calculator.calculate_average([5, 4, 5])",
    "calculate_average([5, 4, 5])",
    "calculator.py",
    "calculator.py.calculate_average([5, 4, 5])"
   ],
   "slots": [
    "import calculator → появилось имя",
    "import calculator → вызов",
    "from calculator import calculate_average → появилось имя",
    "from calculator import calculate_average → вызов"
   ]
  },
  {
   "id": "q10",
   "topic": "2.4 · код верхнего уровня",
   "type": "line",
   "text": "Тесты импортируют этот модуль, и каждый прогон начинается с лишней строки <code>4.4</code> в выводе. Щёлкните строку, которая в этом виновата.",
   "code": "def calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)\n\n\nprint(calculate_average([5, 4, 5, 3, 5]))",
   "file": "app/services/calculator.py"
  },
  {
   "id": "q11",
   "topic": "2.4 · переменная __name__",
   "type": "slots",
   "text": "Из корня проекта выполнили <code>python -m app.main</code>. Каждый файл печатает свою переменную <code>__name__</code>. Что напечатает каждый?",
   "chips": [
    "__main__",
    "app.main",
    "main",
    "app.services.calculator",
    "calculator",
    "app.utils.formatter",
    "formatter"
   ],
   "slots": [
    "app/main.py",
    "app/services/calculator.py",
    "app/utils/formatter.py"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 294\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"дерево проекта\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"291\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"22\" y=\"30\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\"></tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">student-tools/</tspan></text><text x=\"22\" y=\"54\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">.venv/</tspan></text><text x=\"22\" y=\"78\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">└ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">app/</tspan></text><text x=\"22\" y=\"102\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"126\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">main.py</tspan></text><text x=\"22\" y=\"150\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">services/</tspan></text><text x=\"22\" y=\"174\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   │  ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"198\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   │  └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">calculator.py</tspan></text><text x=\"22\" y=\"222\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   └ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">utils/</tspan></text><text x=\"22\" y=\"246\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">      ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"270\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">      └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">formatter.py</tspan></text></svg>",
    "caption": "проект student-tools после главы 2.5"
   }
  },
  {
   "id": "q12",
   "topic": "2.5 · раскладка по ответственности",
   "type": "slots",
   "text": "Коллега прислал Student Tools одним архивом без папок (как в практике 2.7). По содержимому файла подставьте, куда он переедет.",
   "chips": [
    "app/main.py",
    "app/services/calculator.py",
    "app/utils/formatter.py",
    "tests/test_calculator.py",
    "requirements.txt",
    "app/__init__.py",
    ".venv/"
   ],
   "slots": [
    "СЧИТАТЬ.py — return sum(values) / len(values)",
    "красивый текст.py — return f\"Средний результат: {value:.2f}\"",
    "запуск final.py — задаёт оценки, вызывает расчёт и печатает",
    "проверка.py — функции test_average, test_empty_list",
    "библиотеки.txt — rich==13.9.4, pytest==9.1.1"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 156\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"153\" rx=\"8\" fill=\"#0B1230\" stroke=\"#020835\" stroke-width=\"3\"/><circle cx=\"22\" cy=\"20\" r=\"6\" fill=\"#FF5F57\"/><circle cx=\"42\" cy=\"20\" r=\"6\" fill=\"#FEBC2E\"/><circle cx=\"62\" cy=\"20\" r=\"6\" fill=\"#28C840\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#8E98BC\">ТЕРМИНАЛ</text><text x=\"24\" y=\"58\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8FE3B0\">$ </tspan><tspan fill=\"#E8ECF7\" font-weight=\"700\">ls practice/python</tspan></text><text x=\"24\" y=\"82\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\">ЗАДАНИЕ.md           СЧИТАТЬ.py</tspan></text><text x=\"24\" y=\"106\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\">библиотеки.txt       запуск final.py</tspan></text><text x=\"24\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#E8ECF7\">красивый текст.py    проверка.py</tspan></text></svg>",
    "caption": "содержимое архива практики"
   }
  },
  {
   "id": "q13",
   "topic": "2.5 · что выполняется при импорте",
   "type": "order",
   "text": "В <code>app/main.py</code> стоит строка <code>from app.services.calculator import calculate_average</code>. Во все файлы по пути временно добавили <code>print</code>. В каком порядке Python их выполнит? Первый — сверху.",
   "items": [
    "<code>app/__init__.py</code>",
    "<code>app/services/__init__.py</code>",
    "<code>app/services/calculator.py</code>",
    "в <code>main.py</code> появляется имя <code>calculate_average</code>"
   ]
  },
  {
   "id": "q14",
   "topic": "2.5 · импорт и команда запуска",
   "type": "slots",
   "text": "Какой результат даст каждая комбинация? Команды выполняются из корня <code>student-tools</code>, Rich установлен. Одну карточку можно ставить несколько раз.",
   "chips": [
    "печатает «Средний результат: 4.40»",
    "No module named 'app'",
    "No module named 'services'",
    "partially initialized module"
   ],
   "slots": [
    "from app.services.calculator import … + python -m app.main",
    "from app.services.calculator import … + python app/main.py",
    "from services.calculator import … + python app/main.py",
    "from services.calculator import … + python -m app.main"
   ]
  },
  {
   "id": "q15",
   "topic": "2.5 · No module named app",
   "type": "single",
   "text": "Студент получил ошибку с картинки. Импорты в <code>main.py</code> записаны от корня: <code>from app.services…</code>. Как исправить?",
   "options": [
    "Перейти на уровень выше, в <code>student-tools</code>, и повторить команду",
    "Переписать импорты в <code>main.py</code> на <code>from services.calculator import …</code>",
    "Проверить, есть ли в <code>app</code> файл <code>__init__.py</code>, и создать его",
    "Запустить файлом: <code>python main.py</code> — без <code>-m</code> пакет не нужен"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 180\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"177\" rx=\"8\" fill=\"#0B1230\" stroke=\"#020835\" stroke-width=\"3\"/><circle cx=\"22\" cy=\"20\" r=\"6\" fill=\"#FF5F57\"/><circle cx=\"42\" cy=\"20\" r=\"6\" fill=\"#FEBC2E\"/><circle cx=\"62\" cy=\"20\" r=\"6\" fill=\"#28C840\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#8E98BC\">ТЕРМИНАЛ</text><text x=\"24\" y=\"58\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#2D7FC1\" font-weight=\"700\">~/student-tools/app</tspan></text><text x=\"24\" y=\"82\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8FE3B0\">$ </tspan><tspan fill=\"#E8ECF7\" font-weight=\"700\">python -m app.main</tspan></text><text x=\"24\" y=\"106\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#FF8A7A\">/Users/anna/student-tools/.venv/bin/python: Error while finding</tspan></text><text x=\"24\" y=\"130\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#FF8A7A\">module specification for 'app.main' (ModuleNotFoundError:</tspan></text><text x=\"24\" y=\"154\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#FF8A7A\">No module named 'app')</tspan></text></svg>",
    "caption": "терминал VS Code"
   }
  },
  {
   "id": "q16",
   "topic": "2.5 · направление зависимостей",
   "type": "single",
   "text": "На схеме — импорты в проекте коллеги. Стрелка «A → B» значит «A импортирует B». Какая стрелка лишняя и что из-за неё будет?",
   "options": [
    "Стрелка 3: цикл main ↔ calculator, ошибка <code>partially initialized module</code>",
    "Стрелка 4: тесты должны запускать <code>main.py</code>, а не импортировать расчёт",
    "Стрелка 1: main не должен знать про расчёт — пусть расчёт сам вызывает main",
    "Стрелка 2: оформление должен вызывать calculator, а не точка запуска"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 664 320\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"схема импортов, четыре стрелки\"><defs><marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto-start-reverse\"><path d=\"M0,0 L10,5 L0,10 z\" fill=\"#020835\"/></marker></defs><path d=\"M 430 78 L 280 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 550 78 L 550 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 350 238 C 400 190, 470 150, 475 82\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 134 78 L 200 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><rect x=\"24\" y=\"28\" width=\"220\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"134.0\" y=\"59\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">tests/test_calculator.py</text><rect x=\"404\" y=\"28\" width=\"180\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"494.0\" y=\"59\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/main.py</text><rect x=\"110\" y=\"238\" width=\"260\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"240.0\" y=\"269\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/services/calculator.py</text><rect x=\"410\" y=\"238\" width=\"230\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"525.0\" y=\"269\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/utils/formatter.py</text><circle cx=\"355\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"355\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">1</text><circle cx=\"550\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"550\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">2</text><circle cx=\"429\" cy=\"167\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"429\" y=\"173\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">3</text><circle cx=\"167\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"167\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">4</text></svg>",
    "caption": "кто кого импортирует в проекте коллеги"
   }
  },
  {
   "id": "q17",
   "topic": "2.5 · что кладут в __init__.py",
   "type": "sort",
   "text": "Код в <code>__init__.py</code> выполняется при любом импорте из пакета. Разложите, что туда кладут, а что — нет.",
   "items": [
    "версию пакета: <code>__version__ = \"1.0\"</code>",
    "короткий псевдоним, чтобы писать <code>from app.services import calculate_average</code>",
    "общую настройку пакета, например имя по умолчанию",
    "расчёт среднего по списку оценок",
    "чтение файла с оценками с диска",
    "запрос к серверу в интернете"
   ],
   "buckets": [
    "Уместно в __init__.py",
    "Не кладут в __init__.py"
   ]
  },
  {
   "id": "q18",
   "topic": "2.6 · что попадёт в Git",
   "type": "sort",
   "text": "Разложите содержимое корня проекта: что отправляют в репозиторий, а что остаётся только на вашем компьютере.",
   "items": [
    "<code>app/</code>",
    "<code>tests/</code>",
    "<code>requirements.txt</code>",
    "<code>README.md</code>",
    "<code>.gitignore</code>",
    "<code>.venv/</code>",
    "<code>__pycache__/</code> и <code>*.pyc</code>",
    "<code>.env</code>"
   ],
   "buckets": [
    "В репозиторий",
    "Только на компьютере (.gitignore)"
   ]
  },
  {
   "id": "q19",
   "topic": "2.6 · requirements.txt",
   "type": "single",
   "text": "В проекте установлены только Rich и pytest, а <code>requirements.txt</code> получился таким, как на картинке. Что пошло не так?",
   "options": [
    "<code>pip freeze</code> выполнили в базовом Python, а не в окружении проекта",
    "Так и должно быть: freeze всегда записывает все библиотеки компьютера",
    "Rich и pytest сами тянут за собой Django, numpy и pandas как зависимости",
    "freeze дописал новые строки к старому файлу, а не перезаписал его"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 208\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"содержимое файла\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"205\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><rect x=\"3\" y=\"3\" width=\"44\" height=\"202\" fill=\"#EEF0F6\"/><text x=\"36\" y=\"32\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">1</text><text x=\"62\" y=\"32\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">Django==5.1.2</text><text x=\"36\" y=\"56\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">2</text><text x=\"62\" y=\"56\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">numpy==2.1.2</text><text x=\"36\" y=\"80\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">3</text><text x=\"62\" y=\"80\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">pandas==2.2.3</text><text x=\"36\" y=\"104\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">4</text><text x=\"62\" y=\"104\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">pytest==9.1.1</text><text x=\"36\" y=\"128\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">5</text><text x=\"62\" y=\"128\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">requests==2.32.3</text><text x=\"36\" y=\"152\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\">6</text><text x=\"62\" y=\"152\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#020835\">rich==13.9.4</text><text x=\"36\" y=\"176\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" fill=\"#5A6385\"></text><text x=\"62\" y=\"176\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" fill=\"#5A6385\" font-style=\"italic\">…и ещё 31 строка</text></svg>",
    "caption": "student-tools/requirements.txt"
   }
  },
  {
   "id": "q20",
   "topic": "2.6 · вывод pytest",
   "type": "slots",
   "text": "Подставьте к каждому выводу <code>python -m pytest -v</code>, что он означает.",
   "chips": [
    "всё проверено, тестов столько, сколько написано",
    "расчёт вернул не то значение — ошибка в функции",
    "сломан сам код теста — до сравнения не дошло",
    "проверок не было: файл или функции названы не по правилу test_",
    "pytest не установлен в окружение"
   ],
   "slots": [
    "collected 0 items … no tests ran",
    "assert 3.4000000000000004 == 4.4 ± 4.4e-06 … 1 failed, 2 passed",
    "NameError: name 'calculate_avg' is not defined",
    "collected 3 items … 3 passed"
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
