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
   "text": "Проект Student Tools у вас полностью работает. Одногруппник просит: «Скинь мне свою папку <code>.venv</code> — не хочу заново ставить библиотеки». Как поступить, чтобы проект запустился на его компьютере? Выберите один вариант.",
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
   "text": "На схеме — PATH одного терминала до и после активации. PATH — список папок, где терминал ищет программу <code>python</code>: сверху вниз, до первой найденной. Какие утверждения об активации окружения верны? Отметьте все верные утверждения.",
   "options": [
    "Активация ставит <code>.venv/bin</code> первой в PATH, и терминал находит python окружения",
    "Активация действует только в этом терминале, соседняя вкладка работает по-старому",
    "<code>deactivate</code> возвращает прежний PATH, а папка <code>.venv</code> остаётся",
    "Активация меняет PATH всей системы и действует во всех терминалах сразу",
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
   "text": "В папке <code>student-tools</code> уже создана <code>.venv</code>. Студент открыл терминал в этой папке и выполнил проверку из главы 2.1 — команда и её вывод на картинке. Первая строка вывода — путь к Python, который выполнил команду. Вторая строка — ответ на вопрос «это виртуальное окружение?»: True — да, False — нет. Что означает такой вывод? Выберите один вариант.",
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
   "text": "В терминале VS Code всё в порядке: <code>python -m pip show rich</code> показывает Location внутри <code>student-tools/.venv</code>, а <code>python main.py</code> печатает результат. Но если запустить тот же <code>main.py</code> кнопкой ▶ в правом верхнем углу редактора, появляется ошибка <code>ModuleNotFoundError: No module named 'rich'</code>. Что нужно сделать в первую очередь? Выберите один вариант.",
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
   "text": "Ниже — шесть задач из темы 02. К каждой задаче перетащите карточку с командой, которая её выполняет. Все команды выполняются из корня проекта <code>student-tools</code> при активной <code>.venv</code>. Две карточки лишние.",
   "chips": [
    "python -m venv .venv",
    "python -m pip install rich",
    "python -m pip freeze > requirements.txt",
    "python -m pip install -r requirements.txt",
    "python -m app.main",
    "python -m pytest -v",
    "python app/main.py",
    "python -m pip freeze < requirements.txt"
   ],
   "slots": [
    "Создать виртуальное окружение в папке .venv",
    "Установить библиотеку Rich в окружение",
    "Сохранить список установленных библиотек с версиями в requirements.txt",
    "На другом компьютере установить библиотеки по списку из requirements.txt",
    "Запустить программу Student Tools (пакет app)",
    "Запустить тесты из папки tests"
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
   "text": "Во вкладке — файл <code>calculator.py</code> с функцией <code>calculate_average</code>. Её можно подключить в <code>main.py</code> двумя строками импорта. После каждой строки в <code>main.py</code> становится доступно своё имя, поэтому и вызов функции записывается по-разному. Для каждой строки импорта заполните два пропуска: какое имя становится доступно в <code>main.py</code> и как вызвать функцию со списком <code>[5, 4, 5]</code>. Две карточки лишние.",
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
    "import calculator — какое имя доступно в main.py",
    "import calculator — как вызвать функцию",
    "from calculator import calculate_average — какое имя доступно в main.py",
    "from calculator import calculate_average — как вызвать функцию"
   ]
  },
  {
   "id": "q10",
   "topic": "2.4 · код верхнего уровня",
   "type": "line",
   "text": "Ниже — файл <code>app/services/calculator.py</code> с номерами строк. Функция в нём считает правильно. Но при запуске <code>python -m app.main</code> программа печатает две строки: сначала лишнее число <code>4.4</code>, потом «Средний результат: 4.40». Файл <code>app/main.py</code> открывается во вкладке — он печатает только вторую строку. Нажмите строку <code>calculator.py</code>, которая печатает <code>4.4</code>.",
   "code": "def calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)\n\n\nprint(calculate_average([5, 4, 5, 3, 5]))",
   "file": "app/services/calculator.py",
   "files": [
    {
     "name": "app/main.py",
     "note": "Точка запуска импортирует calculator и печатает одну строку отчёта.",
     "code": "from rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    }
   ]
  },
  {
   "id": "q11",
   "topic": "2.4 · переменная __name__",
   "type": "slots",
   "text": "Значение переменной <code>__name__</code> зависит от того, как файл попал в программу. Чтобы его увидеть, первой строкой в <code>app/main.py</code> и <code>app/services/calculator.py</code> временно добавили <code>print</code> с этой переменной — оба файла открываются во вкладках. Из корня проекта выполнили по очереди две команды: <code>python -m app.main</code> и <code>python -c \"import app.main\"</code>. Какое значение <code>__name__</code> напечатается в каждом из трёх случаев ниже? Перетащите к каждому случаю карточку со значением. Четыре карточки лишние.",
   "files": [
    {
     "name": "app/main.py",
     "code": "print(\"main.py:\", __name__)\nfrom rich.console import Console\n\nfrom app.services.calculator import calculate_average\nfrom app.utils.formatter import format_average\n\n\ndef main():\n    values = [5, 4, 5, 3, 5]\n    average = calculate_average(values)\n    console = Console()\n    console.print(f\"[bold green]{format_average(average)}[/bold green]\")\n\n\nif __name__ == \"__main__\":\n    main()"
    },
    {
     "name": "app/services/calculator.py",
     "code": "print(\"calculator.py:\", __name__)\ndef calculate_average(values: list[int]) -> float:\n    if not values:\n        raise ValueError(\"Список оценок не должен быть пустым\")\n    return sum(values) / len(values)"
    }
   ],
   "chips": [
    "__main__",
    "app.main",
    "main",
    "app.services.calculator",
    "calculator",
    "app/main.py",
    "services.calculator"
   ],
   "slots": [
    "python -m app.main — строка из app/main.py",
    "python -m app.main — строка из app/services/calculator.py",
    "python -c \"import app.main\" — строка из app/main.py"
   ]
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
   "text": "Из корня проекта выполнили команду, которая импортирует одну функцию: <code>python -c \"from app.services.calculator import calculate_average\"</code>. Импорт проходит через три файла: <code>app/__init__.py</code>, <code>app/services/__init__.py</code> и <code>app/services/calculator.py</code>. Чтобы увидеть, в каком порядке Python их выполняет, в начало каждого из них временно добавили <code>print</code> — файлы открываются во вкладках. Расставьте события в том порядке, в каком они произойдут: первое — сверху.",
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
    "имя <code>calculate_average</code> становится доступно в команде, которая его импортировала"
   ]
  },
  {
   "id": "q14",
   "topic": "2.5 · импорт и команда запуска",
   "type": "slots",
   "text": "Импорты в <code>app/main.py</code> можно записать двумя способами — оба варианта файла открываются во вкладках. Запустить программу можно двумя командами: <code>python -m app.main</code> и <code>python app/main.py</code>. Получается четыре сочетания «способ импорта + команда». Что произойдёт в каждом? Команды выполняются из корня <code>student-tools</code>, Rich установлен, остальные файлы — как в проекте после главы 2.5. Перетащите к каждому сочетанию карточку с результатом. Одну карточку можно поставить несколько раз.",
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
    "ошибка: No module named 'app'",
    "ошибка: No module named 'services'",
    "ошибка: partially initialized module"
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
   "text": "Вы готовите проект Student Tools к отправке на GitHub. Ниже — файлы и папки, которые есть в проекте. Что должно попасть в репозиторий, а что остаётся только на вашем компьютере и вносится в <code>.gitignore</code>? Перетащите каждую карточку в одну из двух групп.",
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
   "text": "В окружение проекта студент установил только Rich и pytest. Потом он выполнил <code>pip freeze &gt; requirements.txt</code>, и файл получился таким, как на картинке: в нём Django, numpy, pandas и ещё десятки библиотек, которые он в проект не ставил. Почему так получилось? Выберите один вариант.",
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
   "text": "В проекте три теста. Ниже — четыре разных вывода команды <code>python -m pytest -v</code>, из каждого показана главная строка. К каждому выводу перетащите карточку с его причиной. Одна карточка лишняя.",
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
