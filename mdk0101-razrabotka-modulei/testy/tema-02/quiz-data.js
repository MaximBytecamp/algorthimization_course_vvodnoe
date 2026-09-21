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
   "text": "Проект Student Tools у вас полностью работает. Одногруппник просит: «Скинь мне свою папку <code>.venv</code> — не хочу заново ставить библиотеки». Что правильно ему отправить, чтобы проект запустился на его компьютере? Выберите один вариант.",
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
   "text": "У вас распакованный стартовый архив Student Tools: в папке только <code>main.py</code>, окружения ещё нет. Цель — увидеть в терминале цветной вывод «Средний результат: 4.40», который печатает библиотека Rich. Расставьте шаги в том порядке, в каком их выполняют: первый шаг — сверху, последний — снизу.",
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
   "text": "На схеме — PATH одного терминала до и после активации. PATH — список папок, где терминал ищет программу <code>python</code>: сверху вниз, до первой найденной. Какие утверждения об активации верны? Отметьте все верные — их несколько.",
   "options": [
    "Ставит <code>.venv/bin</code> первой в PATH, поэтому находится python окружения",
    "Действует только в этом терминале, соседняя вкладка работает по-старому",
    "<code>deactivate</code> возвращает прежний PATH, а папка <code>.venv</code> остаётся",
    "Меняет PATH всей системы, поэтому действует во всех терминалах сразу",
    "Без активации python из <code>.venv</code> не запустить никаким способом"
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
   "text": "Студент выполнил в терминале проверку из главы 2.1 (картинка). Первая строка вывода — путь к Python, который сейчас работает, вторая отвечает на вопрос «это виртуальное окружение?». Что означает такой вывод? Выберите один вариант.",
   "options": [
    "Окружение в этом терминале не активировано, работает базовый Python",
    "Окружение активировано, всё в порядке — можно ставить библиотеки",
    "Python на компьютере установлен неправильно, его надо переустановить",
    "Папка <code>.venv</code> повреждена, её нужно удалить и создать заново"
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
   "text": "В терминале VS Code всё в порядке: <code>python -m pip show rich</code> показывает Location внутри <code>student-tools/.venv</code>, а <code>python main.py</code> печатает результат. Но если запустить тот же <code>main.py</code> кнопкой ▶ в правом верхнем углу редактора, появляется ошибка <code>ModuleNotFoundError: No module named 'rich'</code>. Что нужно проверить в первую очередь? Выберите один вариант.",
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
   "text": "В книге библиотеки ставят длинной командой <code>python -m pip install rich</code>, а не короткой <code>pip install rich</code>. Зачем нужна приставка <code>python -m</code>? Выберите один вариант.",
   "options": [
    "Пакет попадёт в тот Python, которым вы запускаете программу",
    "Пакет попадёт в <code>.venv</code>, даже если она не активирована",
    "Версия пакета сразу запишется в файл <code>requirements.txt</code>",
    "Пакет установится во все Python, которые есть на компьютере"
   ]
  },
  {
   "id": "q07",
   "topic": "2.1–2.6 · команды проекта",
   "type": "slots",
   "text": "Ниже — шесть задач, которые вы решали в теме 02. К каждой задаче перетащите карточку с командой, которой её решают. Все команды выполняются из корня проекта <code>student-tools</code> при активной <code>.venv</code>. Две карточки лишние.",
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
   "text": "В корне проекта два файла: <code>main.py</code> и <code>calculator.py</code>. Откройте оба во вкладках над кодом. В <code>main.py</code> модуль <code>calculator</code> импортируется три раза, а первая строка <code>calculator.py</code> печатает «загружаю calculator». Из корня выполнили <code>python main.py</code>. Сколько раз в терминале появится строка «загружаю calculator»? Введите число.",
   "files": [
    {
     "name": "main.py",
     "code": "import calculator\nimport calculator\nfrom calculator import calculate_average\n\nprint(calculate_average([5, 4, 5, 3, 5]))"
    },
    {
     "name": "calculator.py",
     "code": "print(\"загружаю calculator\")\n\ndef calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    }
   ],
   "unit": "раз"
  },
  {
   "id": "q09",
   "topic": "2.4 · две формы импорта",
   "type": "slots",
   "text": "Во вкладке — файл <code>calculator.py</code> с функцией <code>calculate_average</code>. Её можно подключить в <code>main.py</code> двумя способами. После каждого способа в <code>main.py</code> появляется своё новое имя, и функцию вызывают по-разному. Заполните четыре пропуска: какое имя появилось и как записать вызов функции со списком <code>[5, 4, 5]</code>. Две карточки лишние.",
   "files": [
    {
     "name": "calculator.py",
     "code": "def calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    }
   ],
   "chips": [
    "calculator",
    "calculate_average",
    "calculator.calculate_average([5, 4, 5])",
    "calculate_average([5, 4, 5])",
    "calculator.py",
    "calculator.py.calculate_average([5, 4, 5])"
   ],
   "slots": [
    "import calculator — какое имя появилось в main.py",
    "import calculator — как вызвать функцию",
    "from calculator import calculate_average — какое имя появилось",
    "from calculator import calculate_average — как вызвать функцию"
   ]
  },
  {
   "id": "q10",
   "topic": "2.4 · код верхнего уровня",
   "type": "line",
   "text": "Ниже, в строках с номерами, — файл <code>app/services/calculator.py</code>. Функция в нём считает правильно, и тесты проходят (файл тестов можно открыть во вкладке). Но каждый прогон <code>python -m pytest -v</code> начинается с лишней строки <code>4.4</code>, хотя сами тесты ничего не печатают. Нажмите строку в <code>calculator.py</code>, из-за которой появляется эта строка.",
   "code": "def calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)\n\n\nprint(calculate_average([5, 4, 5, 3, 5]))",
   "file": "app/services/calculator.py",
   "files": [
    {
     "name": "tests/test_calculator.py",
     "note": "Тесты импортируют модуль — сами они ничего не печатают.",
     "code": "import pytest\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef test_average():\n    assert calculate_average([5, 4, 5, 3, 5]) == pytest.approx(4.4)\n\n\ndef test_format():\n    assert format_average(4.4) == \"Средний результат: 4.40\"\n\n\ndef test_empty_list():\n    with pytest.raises(ValueError):\n        calculate_average([])"
    }
   ]
  },
  {
   "id": "q11",
   "topic": "2.4 · переменная __name__",
   "type": "slots",
   "text": "Структура проекта — на картинке. В начало каждого из трёх файлов добавили строку <code>print(__name__)</code> — их можно открыть во вкладках. Затем из корня проекта выполнили <code>python -m app.main</code>. Что напечатает каждый файл? Перетащите к каждому файлу карточку с его значением <code>__name__</code>. Четыре карточки лишние.",
   "files": [
    {
     "name": "app/main.py",
     "code": "print(__name__)\nfrom rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    },
    {
     "name": "app/services/calculator.py",
     "code": "print(__name__)\ndef calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    },
    {
     "name": "app/utils/formatter.py",
     "code": "print(__name__)\ndef format_average(value: float) -> str:\n    return f\"Средний результат: {value:.2f}\""
    }
   ],
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
    "svg": "<svg viewBox=\"0 0 237 294\" style=\"max-width:237px\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"дерево проекта\"><rect width=\"237\" height=\"294\" fill=\"#fff\"/><text x=\"22\" y=\"30\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\"></tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">student-tools/</tspan></text><text x=\"22\" y=\"54\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">.venv/</tspan></text><text x=\"22\" y=\"78\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">└ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">app/</tspan></text><text x=\"22\" y=\"102\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"126\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">main.py</tspan></text><text x=\"22\" y=\"150\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   ├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">services/</tspan></text><text x=\"22\" y=\"174\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   │  ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"198\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   │  └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">calculator.py</tspan></text><text x=\"22\" y=\"222\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">   └ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">utils/</tspan></text><text x=\"22\" y=\"246\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">      ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"270\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">      └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">formatter.py</tspan></text></svg>",
    "caption": "проект student-tools после главы 2.5"
   }
  },
  {
   "id": "q12",
   "topic": "2.5 · раскладка по ответственности",
   "type": "slots",
   "text": "Как в практике 2.7: коллега прислал Student Tools одним архивом — пять файлов без папок и с неудачными именами. Откройте каждый файл во вкладках и посмотрите, что в нём. Затем перетащите к каждому файлу карточку с путём, по которому он должен лежать в готовом проекте. Две карточки лишние.",
   "files": [
    {
     "name": "СЧИТАТЬ.py",
     "code": "def calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    },
    {
     "name": "красивый текст.py",
     "code": "def format_average(value: float) -> str:\n    return f\"Средний результат: {value:.2f}\""
    },
    {
     "name": "запуск final.py",
     "code": "from rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    },
    {
     "name": "проверка.py",
     "code": "import pytest\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef test_average():\n    assert calculate_average([5, 4, 5, 3, 5]) == pytest.approx(4.4)\n\n\ndef test_format():\n    assert format_average(4.4) == \"Средний результат: 4.40\"\n\n\ndef test_empty_list():\n    with pytest.raises(ValueError):\n        calculate_average([])"
    },
    {
     "name": "библиотеки.txt",
     "code": "iniconfig==2.3.0\nmarkdown-it-py==4.2.0\nmdurl==0.1.2\npackaging==26.3\npluggy==1.6.0\nPygments==2.21.0\npytest==9.1.1\nrich==13.9.4"
    }
   ],
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
    "СЧИТАТЬ.py",
    "красивый текст.py",
    "запуск final.py",
    "проверка.py",
    "библиотеки.txt"
   ]
  },
  {
   "id": "q13",
   "topic": "2.5 · что выполняется при импорте",
   "type": "order",
   "text": "Из корня проекта выполнили команду, которая импортирует одну функцию: <code>python -c \"from app.services.calculator import calculate_average\"</code>. Чтобы увидеть, какие файлы Python при этом выполняет, в начало каждого файла по пути временно добавили <code>print</code> — откройте их во вкладках. Расставьте события в том порядке, в каком они произойдут: первое — сверху.",
   "files": [
    {
     "name": "app/__init__.py",
     "code": "print(\"выполняю app/__init__.py\")"
    },
    {
     "name": "app/services/__init__.py",
     "code": "print(\"выполняю app/services/__init__.py\")"
    },
    {
     "name": "app/services/calculator.py",
     "code": "print(\"выполняю app/services/calculator.py\")\ndef calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    }
   ],
   "items": [
    "выполняется <code>app/__init__.py</code>",
    "выполняется <code>app/services/__init__.py</code>",
    "выполняется <code>app/services/calculator.py</code>",
    "функция <code>calculate_average</code> готова к вызову"
   ]
  },
  {
   "id": "q14",
   "topic": "2.5 · импорт и команда запуска",
   "type": "slots",
   "text": "Импорты в <code>app/main.py</code> можно записать двумя способами — оба открываются во вкладках. Программу можно запустить двумя командами. Всего четыре сочетания. Что произойдёт в каждом? Команды выполняются из корня <code>student-tools</code>, Rich установлен, остальные файлы как в эталоне. Перетащите к каждому сочетанию карточку с результатом. Одну карточку можно поставить несколько раз.",
   "files": [
    {
     "name": "main.py · импорт от корня",
     "note": "Способ 1: путь импорта начинается с пакета app.",
     "code": "from rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    },
    {
     "name": "main.py · импорт внутри пакета",
     "note": "Способ 2: путь импорта начинается с services и utils.",
     "code": "from rich.console import Console\n\nfrom services.calculator import calculate_average\nfrom utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    }
   ],
   "chips": [
    "печатает «Средний результат: 4.40»",
    "No module named 'app'",
    "No module named 'services'",
    "partially initialized module"
   ],
   "slots": [
    "импорт from app.services.calculator … · запуск python -m app.main",
    "импорт from app.services.calculator … · запуск python app/main.py",
    "импорт from services.calculator … · запуск python app/main.py",
    "импорт from services.calculator … · запуск python -m app.main"
   ]
  },
  {
   "id": "q15",
   "topic": "2.5 · No module named app",
   "type": "single",
   "text": "Студент запустил проект и получил ошибку с картинки. Синяя строка — папка, в которой открыт терминал. Импорты в <code>app/main.py</code> записаны от корня проекта: <code>from app.services.calculator import …</code>. Как исправить ошибку? Выберите один вариант.",
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
   "text": "В проекте коллеги четыре файла — откройте их во вкладках под схемой. Каждая стрелка на схеме — это одна строка импорта: стрелка идёт от файла, в котором написан <code>import</code>, к файлу, который импортируют. Например, стрелка 1 — строка <code>from app.services.calculator import calculate_average</code> в файле <code>app/main.py</code>. Правило из главы 2.5: точка запуска <code>main.py</code> импортирует расчёт и оформление, а они её — никогда. Какая стрелка нарушает это правило? Выберите один вариант.",
   "files": [
    {
     "name": "app/main.py",
     "code": "from rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    },
    {
     "name": "app/services/calculator.py",
     "code": "from app.main import main\n\ndef calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    },
    {
     "name": "app/utils/formatter.py",
     "code": "def format_average(value: float) -> str:\n    return f\"Средний результат: {value:.2f}\""
    },
    {
     "name": "tests/test_calculator.py",
     "code": "import pytest\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef test_average():\n    assert calculate_average([5, 4, 5, 3, 5]) == pytest.approx(4.4)\n\n\ndef test_format():\n    assert format_average(4.4) == \"Средний результат: 4.40\"\n\n\ndef test_empty_list():\n    with pytest.raises(ValueError):\n        calculate_average([])"
    }
   ],
   "options": [
    "Стрелка 3: расчёт импортирует точку запуска — получается замкнутый круг",
    "Стрелка 4: тесты должны запускать main.py, а не импортировать расчёт",
    "Стрелка 1: main не должен импортировать расчёт, пусть расчёт вызывает main",
    "Стрелка 2: оформление должен импортировать calculator, а не main"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 664 352\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"схема импортов, четыре стрелки\"><defs><marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto-start-reverse\"><path d=\"M0,0 L10,5 L0,10 z\" fill=\"#020835\"/></marker></defs><path d=\"M 430 78 L 280 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 550 78 L 550 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 350 238 C 400 190, 470 150, 475 82\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><path d=\"M 134 78 L 200 234\" fill=\"none\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><rect x=\"24\" y=\"28\" width=\"220\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"134.0\" y=\"59\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">tests/test_calculator.py</text><rect x=\"404\" y=\"28\" width=\"180\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"494.0\" y=\"59\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/main.py</text><rect x=\"110\" y=\"238\" width=\"260\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"240.0\" y=\"269\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/services/calculator.py</text><rect x=\"410\" y=\"238\" width=\"230\" height=\"50\" fill=\"#fff\" stroke=\"#020835\" stroke-width=\"3\"/><text x=\"525.0\" y=\"269\" text-anchor=\"middle\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#020835\">app/utils/formatter.py</text><circle cx=\"355\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"355\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">1</text><circle cx=\"550\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"550\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">2</text><circle cx=\"429\" cy=\"167\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"429\" y=\"173\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">3</text><circle cx=\"167\" cy=\"156\" r=\"15\" fill=\"#2D7FC1\" stroke=\"#020835\" stroke-width=\"2\"/><text x=\"167\" y=\"162\" text-anchor=\"middle\" font-family=\"Unbounded,Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#fff\">4</text><line x1=\"24\" y1=\"330\" x2=\"84\" y2=\"330\" stroke=\"#020835\" stroke-width=\"3\" marker-end=\"url(#ah)\"/><text x=\"96\" y=\"335\" font-family=\"Inter,sans-serif\" font-size=\"14\" fill=\"#020835\"><tspan font-weight=\"700\">A → B</tspan>: в файле A есть строка import, которая загружает файл B</text></svg>",
    "caption": "стрелка = строка import: от файла, где она написана, к файлу, который импортируют"
   }
  },
  {
   "id": "q17",
   "topic": "2.5 · модуль и пакет",
   "type": "sort",
   "text": "Проект Student Tools после главы 2.5 — на картинке. Разложите элементы проекта по трём группам: модуль (один файл с кодом Python), пакет (папка с модулями, которую можно импортировать) или ни то ни другое. Перетащите каждую карточку в свою группу.",
   "items": [
    "<code>app/services/calculator.py</code>",
    "<code>app/main.py</code>",
    "<code>app/</code>",
    "<code>app/services/</code>",
    "<code>requirements.txt</code>",
    "<code>.venv/</code>"
   ],
   "buckets": [
    "Модуль",
    "Пакет",
    "Ни модуль, ни пакет"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 237 342\" style=\"max-width:237px\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"дерево проекта\"><rect width=\"237\" height=\"342\" fill=\"#fff\"/><text x=\"22\" y=\"30\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\"></tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">student-tools/</tspan></text><text x=\"22\" y=\"54\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">.venv/</tspan></text><text x=\"22\" y=\"78\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">app/</tspan></text><text x=\"22\" y=\"102\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"126\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">main.py</tspan></text><text x=\"22\" y=\"150\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  ├ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">services/</tspan></text><text x=\"22\" y=\"174\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  │  ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"198\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  │  └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">calculator.py</tspan></text><text x=\"22\" y=\"222\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│  └ </tspan><tspan fill=\"#2D7FC1\" font-weight=\"700\">utils/</tspan></text><text x=\"22\" y=\"246\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│     ├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">__init__.py</tspan></text><text x=\"22\" y=\"270\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">│     └ </tspan><tspan fill=\"#020835\" font-weight=\"400\">formatter.py</tspan></text><text x=\"22\" y=\"294\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">├ </tspan><tspan fill=\"#020835\" font-weight=\"400\">requirements.txt</tspan></text><text x=\"22\" y=\"318\" font-family=\"Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#D5DAE6\">└ </tspan><tspan fill=\"#020835\" font-weight=\"400\">README.md</tspan></text></svg>",
    "caption": "student-tools: главные файлы и папки (tests и служебные файлы не показаны)"
   }
  },
  {
   "id": "q18",
   "topic": "2.6 · что попадёт в Git",
   "type": "sort",
   "text": "Вы готовите проект Student Tools к отправке на GitHub. Ниже — всё, что лежит в корне проекта. Что должно попасть в репозиторий, а что остаётся только на вашем компьютере и вносится в <code>.gitignore</code>? Перетащите каждую карточку в одну из двух групп.",
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
   "text": "В окружение проекта установлены только Rich и pytest. Студент выполнил <code>pip freeze &gt; requirements.txt</code>, и файл получился таким, как на картинке: в нём Django, numpy, pandas и ещё десятки библиотек. Почему так получилось? Выберите один вариант.",
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
   "text": "В проекте три теста. Ниже — четыре варианта того, чем может закончиться команда <code>python -m pytest -v</code>. К каждому выводу перетащите карточку с объяснением, что он означает. Одна карточка лишняя.",
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
