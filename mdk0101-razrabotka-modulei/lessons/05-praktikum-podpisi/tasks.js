/* Задания практикума «Младший разработчик: первая неделя».

   ENV    — письмо 1: порядок команд, раскладка файлов, ситуации из чата.
   CATALOG, BUILD — письмо 2: подписи по заявкам заказчиков.
   SIEVE  — письмо 3: какие вызовы подходят к подписи.
   WRITE  — письмо 4: подпись вручную.

   Ответы письма 3 сверены с mypy 2.3 (default-настройки):
   ~/mdk0101-tests-private/praktikum-podpisi/verify.py. После правки
   заданий — прогнать verify.py, расхождений должно быть 0. */
window.PD = (() => {
  const FROM = 'Ирина Белова, тимлид Python-группы';

  const LETTERS = [
    {
      subject: 'Понедельник: рабочее место',
      body: [
        'Добро пожаловать в студию «Верстак». Мы пишем модули на Python для небольших компаний: электронный журнал колледжа, касса кофейни, учёт абонементов фитнес-клуба, склад книжного магазина, расчёты для курьерской службы.',
        'Первый день уходит на рабочее место. Каждый проект студии живёт в своей папке и со своим окружением .venv, список библиотек лежит в requirements.txt. Сегодня вы разворачиваете проект кассы, решаете, какие файлы уходят в репозиторий, и разбираете вопросы стажёров из общего чата.',
        'В чате стажёры присылают вывод терминала и описание того, что делали. Для каждого случая выберите причину из списка.',
      ],
      task: 'Три части: порядок команд от архива до запуска, раскладка десяти файлов и папок, причины семи проблем из чата.',
    },
    {
      subject: 'Вторник: подписи по заявкам',
      body: [
        'Заказчики прислали заявки на новые функции. Код функций напишут позже. Сейчас нужна подпись каждой функции: какие параметры она принимает, какого они типа и что возвращает. По подписи фронтенд-группа начнёт писать вызовы, не дожидаясь тела функции.',
        'Имя функции я уже придумала. В заявке есть и данные, которые функции не нужны: их выводит или хранит другая часть программы. Такие данные в подпись не переносите.',
        'Если значение бывает двух видов, в слот кладутся два типа: подпись покажет их через вертикальную черту, например int | str. Отсутствие значения обозначает тип None.',
      ],
      task: 'Десять заявок. Перенесите в подпись нужные параметры и подберите тип каждому параметру и результату.',
    },
    {
      subject: 'Среда: какие вызовы подходят к подписи',
      body: [
        'Подписи из вторника утверждены, и фронтенд-группа прислала свои вызовы. Перед сборкой проекта каждый вызов сверяют с подписью функции: число аргументов, тип каждого аргумента и то, как используется результат.',
        'По подписи решите, какие строки ей соответствуют, а какие нет. Тела функций не показаны: для сверки вызова с подписью тело не нужно.',
      ],
      task: 'Пять подписей, к каждой восемь строк кода. Разложите строки по колонкам «Подходит к подписи» и «Не подходит».',
    },
    {
      subject: 'Четверг: подпись вручную',
      body: [
        'Последнее задание недели — те же подписи, но без готовых блоков. Строку def пишете сами, от def до двоеточия в конце.',
        'Имена функции и параметров даны в заявке, порядок параметров — тоже. Под полем видно, как Python прочитает вашу строку. Если в записи ошибка, там же будет сказано, в каком месте.',
        'В конце письма — кнопка «Сдать работу». После неё ответы закрываются, а в пятницу придёт рецензия.',
      ],
      task: 'Четыре заявки. Напишите подпись функции целиком: имя, параметры с типами, значения по умолчанию, тип результата.',
    },
  ];

  /* ── Письмо 1 ─────────────────────────────────────────────────── */
  const ORDER = {
    intro: 'Ирина прислала архив проекта кассы «Зерно»: в нём app/, tests/, main.py, README.md, .gitignore и requirements.txt. Окружения в архиве нет. Разложите шаги от архива до первого запуска. Лишние шаги оставьте в наборе.',
    steps: [
      { id: 'o1', text: 'Распаковать архив и открыть папку проекта в VS Code: File → Open Folder, затем Terminal → New Terminal' },
      { id: 'o2', text: 'python -m venv .venv' },
      { id: 'o3', text: 'Активировать окружение: .venv\\Scripts\\activate в Windows или source .venv/bin/activate в macOS и Linux' },
      { id: 'o4', text: 'python -m pip install -r requirements.txt' },
      { id: 'o5', text: 'python main.py' },
    ],
    extra: [
      { id: 'x1', text: 'python -m pip freeze > requirements.txt', why: 'freeze записывает в файл то, что установлено сейчас. До установки зависимостей это пустой или чужой список, и присланный requirements.txt будет перезаписан.' },
      { id: 'x2', text: 'deactivate', why: 'deactivate возвращает базовый Python. После неё python main.py запустится без библиотек проекта.' },
      { id: 'x3', text: 'pip install rich', why: 'Rich уже есть в requirements.txt и ставится вместе с остальными пакетами. Команда pip без python -m к тому же может взять pip другого Python.' },
    ],
    why: 'Окружение создаётся до активации, активация — до установки: иначе pip поставит пакеты в базовый Python. Запуск идёт последним, когда библиотеки уже в .venv.',
  };

  const FILES = {
    intro: 'Проект кассы запущен. Перед первым коммитом решите, что уходит в репозиторий, а что остаётся только на вашем компьютере.',
    cards: [
      { id: 'f1', name: 'main.py', where: 'repo', why: 'Исходный код: без него проекта нет.' },
      { id: 'f2', name: 'app/calculator.py', where: 'repo', why: 'Модуль проекта — тоже исходный код.' },
      { id: 'f3', name: 'tests/test_calculator.py', where: 'repo', why: 'Тесты нужны каждому, кто будет менять код.' },
      { id: 'f4', name: 'requirements.txt', where: 'repo', why: 'По этому списку другой разработчик создаст своё окружение.' },
      { id: 'f5', name: 'README.md', where: 'repo', why: 'Инструкция: что делает программа и как её запустить.' },
      { id: 'f6', name: '.gitignore', where: 'repo', why: 'Правила игнорирования нужны всем участникам: у каждого появятся свои .venv и кэш.' },
      { id: 'f7', name: '.venv/', where: 'local', why: 'Окружение содержит пути вашего компьютера. Другой разработчик создаёт своё по requirements.txt.' },
      { id: 'f8', name: '__pycache__/', where: 'local', why: 'Кэш Python создаётся автоматически при запуске.' },
      { id: 'f9', name: 'app/__pycache__/calculator.cpython-312.pyc', where: 'local', why: 'Скомпилированный файл из кэша: появится заново при следующем запуске.' },
      { id: 'f10', name: '.env', where: 'local', why: 'В .env хранят локальные настройки и секреты, например пароль к базе.' },
    ],
  };

  /* Причины для ситуаций из чата. Порядок не совпадает с порядком ситуаций. */
  const CAUSES = [
    ['vscode', 'VS Code использует другой интерпретатор, не из .venv'],
    ['net', 'Нет доступа к PyPI: пакет не скачался'],
    ['freeze', 'Список зависимостей снят не в окружении проекта'],
    ['pip', 'Пакет установлен в другой Python, не в окружение проекта'],
    ['moved', 'Окружение перенесено с другого компьютера'],
    ['code', 'Ошибка в коде main.py'],
    ['ignore', 'Нет правил .gitignore для окружения и кэша'],
    ['act', 'Окружение не активно в этом терминале'],
    ['req', 'Зависимости проекта не записаны в requirements.txt'],
  ];

  const CHAT = [
    {
      id: 'c1', who: 'Денис',
      text: 'Поставил Rich, установка прошла. Запускаю программу — она его не видит.',
      term: '$ pip install rich\nSuccessfully installed markdown-it-py-3.0.0 mdurl-0.1.2 pygments-2.18.0 rich-13.9.4\n$ python main.py\nTraceback (most recent call last):\n  File "main.py", line 1, in <module>\n    from rich.console import Console\nModuleNotFoundError: No module named \'rich\'',
      cause: 'pip',
      why: 'Команда pip — отдельная программа, её выбирает PATH. Здесь сработал pip другого Python, и Rich попал туда. Исправление: при активном окружении выполнить python -m pip install rich — тогда пакет попадёт в тот Python, который запускает программу.',
    },
    {
      id: 'c2', who: 'Лиза',
      text: 'Утром всё работало. После обеда открыла новую вкладку терминала, проверяю окружение — False.',
      term: '$ python -c "import sys; print(sys.prefix != sys.base_prefix)"\nFalse',
      cause: 'act',
      why: 'Активация меняет PATH только в том терминале, где её выполнили. В новой вкладке python снова означает базовый Python. Исправление: выполнить активацию в этой вкладке.',
    },
    {
      id: 'c3', who: 'Ксюша',
      text: 'Скачала проект Тимура с GitHub, создала .venv и активировала. В репозитории только app/, main.py и README.md. Запуск падает.',
      term: '$ python main.py\nModuleNotFoundError: No module named \'rich\'\n$ python -m pip install -r requirements.txt\nERROR: Could not open requirements file: [Errno 2] No such file or directory: \'requirements.txt\'',
      cause: 'req',
      why: 'Тимур не записал зависимости. Без requirements.txt нельзя узнать, какие библиотеки и версии нужны проекту. Исправление: Тимуру выполнить python -m pip freeze > requirements.txt в своём окружении и добавить файл в репозиторий.',
    },
    {
      id: 'c4', who: 'Глеб',
      text: 'Готовлю первый коммит. Git предлагает добавить вот это.',
      term: '$ git status --short\n?? .venv/\n?? __pycache__/\n?? app/\n?? main.py\n?? requirements.txt',
      cause: 'ignore',
      why: 'Git видит окружение и кэш как новые файлы. Исправление: создать .gitignore со строками .venv/, __pycache__/, *.pyc и .env — тогда в списке останутся исходники и requirements.txt.',
    },
    {
      id: 'c5', who: 'Марат',
      text: 'В проекте только Rich, а в requirements.txt почти сорок строк. Откуда там Django?',
      term: '$ python -m pip freeze > requirements.txt\n$ head -5 requirements.txt\nasgiref==3.8.1\nDjango==5.1.2\nnumpy==2.1.2\npandas==2.2.3\nrich==13.9.4',
      cause: 'freeze',
      why: 'freeze записывает всё, что установлено в текущем Python. Марат выполнил её не в .venv проекта, а там, где лежат пакеты других проектов. Исправление: активировать окружение проекта и повторить freeze.',
    },
    {
      id: 'c6', who: 'Оля',
      text: 'В терминале программа запускается. А редактор подчёркивает импорт.',
      term: 'Подсказка редактора у строки 1:\nImport "rich.console" could not be resolved\n\n$ python main.py\nСредний результат: 4.40',
      cause: 'vscode',
      why: 'Терминал работает с .venv, а редактор проверяет код другим интерпретатором, где Rich нет. Исправление: Python: Select Interpreter и выбрать Python из .venv проекта.',
    },
    {
      id: 'c7', who: 'Тимур',
      text: 'Коллега прислал архив вместе со своей папкой .venv. Запускаю через неё — ошибка про чужого пользователя.',
      term: '> .venv\\Scripts\\python main.py\nNo Python at \'"C:\\Users\\denis\\AppData\\Local\\Programs\\Python\\Python312\\python.exe\'',
      cause: 'moved',
      why: '.venv ссылается на Python того компьютера, где её создали, — здесь это папка пользователя denis. Окружение не переносят: удалить чужую .venv, создать свою и установить пакеты по requirements.txt.',
    },
  ];

  /* ── Письмо 2 ─────────────────────────────────────────────────── */
  /* Каталог типов. Один и тот же тип можно класть в любое число слотов. */
  const CATALOG = [
    ['Простые', ['int', 'float', 'str', 'bool', 'None']],
    ['Списки', ['list[int]', 'list[float]', 'list[str]', 'list[bool]']],
    ['Словари', ['dict[str, int]', 'dict[str, float]', 'dict[str, str]', 'dict[int, str]', 'dict[str, bool]', 'dict[str, list[int]]']],
    ['Кортежи', ['tuple[int, int]', 'tuple[float, float]', 'tuple[str, str]', 'tuple[str, int]', 'tuple[int, ...]']],
    ['Множества', ['set[str]', 'set[int]']],
    ['Классы', ['date', 'Path']],
  ];

  /* params — верная подпись (порядок как в эталоне), pool — что лежит в наборе.
     У параметра с умолчанием default — текст после знака равенства.
     ex — вызовы из заявки: verify.py проверяет ими эталон в mypy. */
  const BUILD = [
    {
      id: 'b1', client: 'Колледж «Северный» · электронный журнал', fn: 'average_grade',
      request: 'Классному руководителю нужен средний балл студента за семестр. Оценки студента журнал хранит списком целых чисел от 2 до 5, например 5, 4, 4, 3. Функция возвращает средний балл: для этих оценок — 4.25. ФИО студента и номер группы печатает шапка отчёта, в расчёте они не участвуют.',
      pool: [['grades'], ['student_name'], ['group_number']],
      params: [['grades', 'list[int]']], ret: 'float',
      ex: ['average_grade([5, 4, 4, 3])'],
      why: 'Оценки — список целых чисел, поэтому list[int]. Среднее 4.25 — дробное число, результат float. ФИО и группа в расчёте не участвуют.',
    },
    {
      id: 'b2', client: 'Колледж «Северный» · посещаемость', fn: 'count_absences',
      request: 'Куратор хочет знать, сколько пар студент пропустил за месяц. Отметки посещаемости журнал хранит списком строк: "+" — студент был на паре, "н" — не был. Функция возвращает число пропусков. Название месяца и фамилия преподавателя есть в журнале, но для подсчёта не нужны.',
      pool: [['month'], ['marks'], ['teacher']],
      params: [['marks', 'list[str]']], ret: 'int',
      ex: ['count_absences(["+", "н", "+", "н"])'],
      why: 'Отметки — строки "+" и "н" в списке: list[str]. Число пропусков целое: int.',
    },
    {
      id: 'b3', client: 'Кофейня «Зерно» · касса', fn: 'order_total',
      request: 'Касса передаёт состав заказа словарём: ключ — название позиции, значение — цена в копейках, целое число. Например, {"Латте": 25000, "Круассан": 18000}. Функция складывает цены и вычитает скидку постоянного гостя. Скидка — целое число процентов; если её не передать, скидки нет. Возвращается сумма к оплате в копейках. Имя бариста и номер столика касса печатает в чеке отдельно.',
      pool: [['barista'], ['items'], ['discount', '0'], ['table_number']],
      params: [['items', 'dict[str, int]'], ['discount', 'int', '0']], ret: 'int',
      ex: ['order_total({"Латте": 25000, "Круассан": 18000})', 'order_total({"Латте": 25000}, 10)'],
      why: 'Состав заказа — словарь «название (str) → цена в копейках (int)»: dict[str, int]. Скидка — целое число процентов со значением по умолчанию 0. Сумма в копейках — целое число.',
    },
    {
      id: 'b4', client: 'Кофейня «Зерно» · постоянные гости', fn: 'find_guest_phone',
      request: 'Бариста вводит имя гостя, функция ищет его телефон в базе постоянных гостей. База — словарь «имя → телефон», телефон записан строкой, например "+7 900 111-22-33". Если гостя в базе нет, функция возвращает None.',
      pool: [['phone'], ['guests'], ['name']],
      params: [['guests', 'dict[str, str]'], ['name', 'str']], ret: 'str | None',
      ex: ['find_guest_phone({"Анна": "+7 900 111-22-33"}, "Анна")'],
      why: 'База — словарь «имя → телефон», оба строки: dict[str, str]. Имя — str. Телефон функция возвращает, поэтому в параметры он не входит. Результат — строка или None, если гость не найден: str | None.',
    },
    {
      id: 'b5', client: 'Фитнес-клуб «Пульс» · абонементы', fn: 'is_membership_active',
      request: 'Администратор на входе проверяет, действует ли абонемент. Функция получает дату окончания абонемента и сегодняшнюю дату — обе типа date из модуля datetime — и отвечает «да» или «нет». Имя клиента и цена абонемента на ответ не влияют.',
      pool: [['client_name'], ['end_date'], ['price'], ['today']],
      params: [['end_date', 'date'], ['today', 'date']], ret: 'bool',
      ex: ['is_membership_active(date(2026, 12, 31), date(2026, 10, 2))'],
      why: 'Обе даты — объекты класса date. Ответ «да» или «нет» записывается типом bool: True или False.',
    },
    {
      id: 'b6', client: 'Книжный магазин «Переплёт» · склад', fn: 'parse_quantity',
      request: 'Количество экземпляров книги приходит из двух мест. Складская программа присылает его целым числом, например 5. Форма на сайте присылает строкой, например "5". Функция принимает любое из этих значений и возвращает целое число. Название книги и номер склада в пересчёте не участвуют.',
      pool: [['title'], ['value'], ['warehouse']],
      params: [['value', 'int | str']], ret: 'int',
      ex: ['parse_quantity(5)', 'parse_quantity("5")'],
      why: 'Значение приходит числом или строкой — два типа в одном слоте: int | str. Результат всегда целое число.',
    },
    {
      id: 'b7', client: 'Курьерская служба «Квартал» · отчёт за день', fn: 'distance_bounds',
      request: 'Диспетчеру нужна самая короткая и самая длинная доставка за день. Расстояния всех доставок курьер сдаёт списком дробных чисел в километрах, например 2.5, 7.25, 1.8. Функция возвращает пару: сначала самое короткое расстояние, затем самое длинное. Имя курьера и дата в отчёте уже есть.',
      pool: [['courier'], ['day'], ['distances']],
      params: [['distances', 'list[float]']], ret: 'tuple[float, float]',
      ex: ['distance_bounds([2.5, 7.25, 1.8])'],
      why: 'Расстояния — список дробных чисел: list[float]. Результат — ровно два дробных числа: tuple[float, float].',
    },
    {
      id: 'b8', client: 'Кофейня «Зерно» · печать чека', fn: 'print_receipt',
      request: 'Функция печатает чек в консоль кассы. Строки чека передаются списком строк. Ширину чека в символах можно не передавать — тогда она 32. Функция только печатает и ничего не возвращает. Имя кассира уже записано в строках чека.',
      pool: [['lines'], ['cashier'], ['width', '32']],
      params: [['lines', 'list[str]'], ['width', 'int', '32']], ret: 'None',
      ex: ['print_receipt(["Латте     250,00", "Итого     250,00"])', 'print_receipt(["Латте"], 40)'],
      why: 'Строки чека — list[str]. Ширина — целое число со значением по умолчанию 32. Функция ничего не возвращает: -> None.',
    },
    {
      id: 'b9', client: 'Колледж «Северный» · ведомость группы', fn: 'average_by_student',
      request: 'Для ведомости нужен средний балл каждого студента группы. Журнал группы — словарь: ключ — ФИО студента, значение — список его оценок, целых чисел. Функция возвращает новый словарь: ключ — ФИО, значение — средний балл, дробное число. Номер группы печатает шапка ведомости.',
      pool: [['group_number'], ['journal']],
      params: [['journal', 'dict[str, list[int]]']], ret: 'dict[str, float]',
      ex: ['average_by_student({"Иванов Пётр": [5, 4], "Петрова Анна": [3, 4, 5]})'],
      why: 'Журнал — словарь «ФИО (str) → список оценок (list[int])»: dict[str, list[int]]. Результат — словарь «ФИО → средний балл»: dict[str, float].',
    },
    {
      id: 'b10', client: 'Фитнес-клуб «Пульс» · карта клиента', fn: 'format_name',
      request: 'На карту клиента печатается имя в виде «Иванов Пётр Сергеевич». Функция получает фамилию, имя и отчество строками и возвращает одну строку. Отчество есть не у всех клиентов: если его нет, параметр не передают или передают None. Дата рождения на карту не печатается.',
      pool: [['middle_name', 'None'], ['birthday'], ['first_name'], ['last_name']],
      params: [['last_name', 'str'], ['first_name', 'str'], ['middle_name', 'str | None', 'None']], ret: 'str',
      ex: ['format_name("Иванов", "Пётр", "Сергеевич")', 'format_name("Иванов", "Пётр")'],
      why: 'Фамилия и имя — строки. Отчество — строка или None, по умолчанию None: str | None = None. Параметр со значением по умолчанию стоит последним, иначе Python не примет подпись. Результат — строка.',
    },
  ];

  /* ── Письмо 3 ─────────────────────────────────────────────────── */
  /* ok: true — строка соответствует подписи, false — нет. Студенты mypy ещё
     не проходили, поэтому msg на странице не показывается: это текст mypy
     для сверки в verify.py. */
  const SIEVE = [
    {
      id: 's1', sig: 'def average_grade(grades: list[int]) -> float:',
      cards: [
        { code: 'average_grade([5, 4, 4, 3])', ok: true },
        { code: 'average_grade([5, "4", 3])', ok: false, msg: 'List item 1 has incompatible type "str"; expected "int"  [list-item]' },
        { code: 'average_grade((5, 4, 3))', ok: false, msg: 'Argument 1 to "average_grade" has incompatible type "tuple[int, int, int]"; expected "list[int]"  [arg-type]' },
        { code: 'average_grade([])', ok: true },
        { code: 'average_grade(5)', ok: false, msg: 'Argument 1 to "average_grade" has incompatible type "int"; expected "list[int]"  [arg-type]' },
        { code: 'average_grade(grades=[3, 3])', ok: true },
        { code: 'score: float = average_grade([5, 5])', ok: true },
        { code: 'score: int = average_grade([5, 5])', ok: false, msg: 'Incompatible types in assignment (expression has type "float", variable has type "int")  [assignment]' },
      ],
      why: 'Параметр принимает только список целых чисел. Кортеж (5, 4, 3) — другой тип, хотя внутри те же числа. Пустой список подходит: в нём нет элементов неверного типа. Результат float нельзя положить в переменную с аннотацией int.',
    },
    {
      id: 's2', sig: 'def find_guest_phone(guests: dict[str, str], name: str) -> str | None:',
      setup: 'guests = {"Анна": "+7 900 111-22-33"}',
      cards: [
        { code: 'find_guest_phone(guests, "Анна")', ok: true },
        { code: 'find_guest_phone("Анна", guests)', ok: false, msg: 'Argument 1 to "find_guest_phone" has incompatible type "str"; expected "dict[str, str]"  [arg-type]\nArgument 2 to "find_guest_phone" has incompatible type "dict[str, str]"; expected "str"  [arg-type]' },
        { code: 'find_guest_phone(guests, None)', ok: false, msg: 'Argument 2 to "find_guest_phone" has incompatible type "None"; expected "str"  [arg-type]' },
        { code: 'find_guest_phone({"Анна": 79001112233}, "Анна")', ok: false, msg: 'Dict entry 0 has incompatible type "str": "int"; expected "str": "str"  [dict-item]' },
        { code: 'find_guest_phone({}, "Анна")', ok: true },
        { code: 'phone: str = find_guest_phone(guests, "Анна")', ok: false, msg: 'Incompatible types in assignment (expression has type "str | None", variable has type "str")  [assignment]' },
        { code: 'phone: str | None = find_guest_phone(guests, "Анна")', ok: true },
        { code: 'find_guest_phone(guests, "Анна").startswith("+7")', ok: false, msg: 'Item "None" of "str | None" has no attribute "startswith"  [union-attr]' },
      ],
      why: 'Аргументы сверяются по порядку: первым должен идти словарь, вторым строка. В словаре телефон должен быть строкой, число 79001112233 не подходит. Результат str | None может оказаться None: его нельзя положить в переменную типа str и нельзя сразу вызвать у него метод строки — сначала нужна проверка if phone is not None.',
    },
    {
      id: 's3', sig: 'def format_name(last_name: str, first_name: str, middle_name: str | None = None) -> str:',
      cards: [
        { code: 'format_name("Иванов", "Пётр")', ok: true },
        { code: 'format_name("Иванов", "Пётр", "Сергеевич")', ok: true },
        { code: 'format_name("Иванов", "Пётр", None)', ok: true },
        { code: 'format_name("Иванов")', ok: false, msg: 'Missing positional argument "first_name" in call to "format_name"  [call-arg]' },
        { code: 'format_name("Иванов", "Пётр", middle_name=1)', ok: false, msg: 'Argument "middle_name" to "format_name" has incompatible type "int"; expected "str | None"  [arg-type]' },
        { code: 'format_name("Иванов", None)', ok: false, msg: 'Argument 2 to "format_name" has incompatible type "None"; expected "str"  [arg-type]' },
        { code: 'format_name("Иванов", "Пётр", "Сергеевич", "Москва")', ok: false, msg: 'Too many arguments for "format_name"  [call-arg]' },
        { code: 'format_name(first_name="Пётр", last_name="Иванов")', ok: true },
      ],
      why: 'Фамилия и имя обязательны и должны быть строками. Отчество можно не передавать, передать строкой или передать None — все три варианта есть в типе str | None = None. Число в отчество не подходит. Именованные аргументы можно передавать в любом порядке. Четвёртого параметра у функции нет.',
    },
    {
      id: 's4', sig: 'def parse_quantity(value: int | str) -> int:',
      cards: [
        { code: 'parse_quantity(5)', ok: true },
        { code: 'parse_quantity("5")', ok: true },
        { code: 'parse_quantity(5.5)', ok: false, msg: 'Argument 1 to "parse_quantity" has incompatible type "float"; expected "int | str"  [arg-type]' },
        { code: 'parse_quantity(None)', ok: false, msg: 'Argument 1 to "parse_quantity" has incompatible type "None"; expected "int | str"  [arg-type]' },
        { code: 'parse_quantity(["5"])', ok: false, msg: 'Argument 1 to "parse_quantity" has incompatible type "list[str]"; expected "int | str"  [arg-type]' },
        { code: 'parse_quantity("пять")', ok: true },
        { code: 'total: int = parse_quantity("3") + 2', ok: true },
        { code: 'label: str = parse_quantity("3")', ok: false, msg: 'Incompatible types in assignment (expression has type "int", variable has type "str")  [assignment]' },
      ],
      why: 'Подходит любое значение из перечня int | str. Дробное число, None и список в перечне не значатся. Строка "пять" — тоже str, поэтому вызов подходит к подписи. Подпись задаёт только тип значения, что написано внутри строки, по ней не проверяется. Ошибка ValueError появится только при запуске, когда int("пять") не сможет перевести строку в число. Результат — int: его можно сложить с числом, но нельзя положить в переменную типа str.',
    },
    {
      id: 's5', sig: 'def print_receipt(lines: list[str], width: int = 32) -> None:',
      cards: [
        { code: 'print_receipt(["Латте", "Круассан"])', ok: true },
        { code: 'print_receipt(["Латте"], 40)', ok: true },
        { code: 'print_receipt(["Латте"], "40")', ok: false, msg: 'Argument 2 to "print_receipt" has incompatible type "str"; expected "int"  [arg-type]' },
        { code: 'print_receipt("Латте")', ok: false, msg: 'Argument 1 to "print_receipt" has incompatible type "str"; expected "list[str]"  [arg-type]' },
        { code: 'print_receipt(["Латте", 250])', ok: false, msg: 'List item 1 has incompatible type "int"; expected "str"  [list-item]' },
        { code: 'result = print_receipt(["Латте"])', ok: false, msg: '"print_receipt" does not return a value (it only ever returns None)  [func-returns-value]' },
        { code: 'print_receipt([], width=20)', ok: true },
        { code: 'print_receipt(["Латте"], width=None)', ok: false, msg: 'Argument "width" to "print_receipt" has incompatible type "None"; expected "int"  [arg-type]' },
      ],
      why: 'Строки чека — только список строк: одна строка "Латте" и число 250 внутри списка не подходят. Ширина — целое число; None в её типе не указан, хотя у параметра есть значение по умолчанию. Функция с -> None ничего не возвращает: сохранять её результат в переменную бессмысленно, и такая строка подписи не соответствует.',
    },
  ];

  /* ── Письмо 4 ─────────────────────────────────────────────────── */
  const WRITE = [
    {
      id: 'w1', client: 'Колледж «Северный» · лучший студент',
      task: 'Функция best_student получает словарь averages: ключ — ФИО студента, значение — средний балл, дробное число. Возвращает ФИО студента с самым высоким баллом. Если словарь пуст, возвращает None.',
      answer: 'def best_student(averages: dict[str, float]) -> str | None:',
      ex: ['best_student({"Иванов Пётр": 4.5, "Петрова Анна": 4.75})', 'best_student({})'],
      hint: 'Словарь записывается как dict[тип ключа, тип значения]. Результат бывает двух видов — строка или None.',
    },
    {
      id: 'w2', client: 'Фитнес-клуб «Пульс» · бонусы',
      task: 'Функция add_bonus начисляет бонусы. Параметры по порядку: balance — текущий баланс бонусов, целое число; visits — число посещений за месяц, целое число; is_vip — VIP-клиент или нет, по умолчанию нет. Возвращает новый баланс, целое число.',
      answer: 'def add_bonus(balance: int, visits: int, is_vip: bool = False) -> int:',
      ex: ['add_bonus(120, 8)', 'add_bonus(120, 8, True)'],
      hint: '«Да или нет» — тип bool, его значения True и False. Значение по умолчанию пишется после типа: имя: тип = значение.',
    },
    {
      id: 'w3', client: 'Курьерская служба «Квартал» · адреса',
      task: 'Функция split_address получает адрес address одной строкой, например "Лесная, 12", и возвращает пару строк: улицу и номер дома — ("Лесная", "12").',
      answer: 'def split_address(address: str) -> tuple[str, str]:',
      ex: ['split_address("Лесная, 12")'],
      hint: 'Пара значений — кортеж из двух элементов. В скобках перечисляется тип каждого элемента.',
    },
    {
      id: 'w4', client: 'Книжный магазин «Переплёт» · авторы',
      task: 'Функция unique_authors получает список books. Каждый элемент списка — пара строк: название книги и автор, например ("Мёртвые души", "Гоголь"). Возвращает множество авторов без повторов.',
      answer: 'def unique_authors(books: list[tuple[str, str]]) -> set[str]:',
      ex: ['unique_authors([("Мёртвые души", "Гоголь"), ("Нос", "Гоголь")])'],
      hint: 'Тип элемента списка сам может быть составным: list[тип элемента]. Набор без повторов — множество, set[...].',
    },
  ];

  return { FROM, LETTERS, ORDER, FILES, CAUSES, CHAT, CATALOG, BUILD, SIEVE, WRITE };
})();
