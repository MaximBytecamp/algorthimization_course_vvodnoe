/* Задания практикума «Младший разработчик: первая неделя», ветка Go.

   ENV    — письмо 1: порядок команд, раскладка файлов, ситуации из чата.
   CATALOG, BUILD — письмо 2: подписи по заявкам заказчиков.
   SIEVE  — письмо 3: какие строки компилятор примет при такой подписи.
   WRITE  — письмо 4: подпись вручную.

   Ответы письма 3 и вывод терминала в письме 1 сверены с компилятором Go:
   ~/mdk0101-tests-private/praktikum-podpisi-go/verify.py. После правки
   заданий — прогнать verify.py, расхождений должно быть 0. */
window.PD = (() => {
  const FROM = 'Ирина Белова, тимлид Go-группы';

  const LETTERS = [
    {
      subject: 'Понедельник: рабочее место',
      body: [
        'Добро пожаловать в студию «Верстак». Мы пишем модули на Go для небольших компаний: электронный журнал колледжа, касса кофейни, учёт абонементов фитнес-клуба, склад книжного магазина, расчёты для курьерской службы.',
        'Первый день уходит на рабочее место. Каждый проект студии — отдельный модуль: в корне папки лежит go.mod с именем модуля и версиями библиотек, рядом go.sum с контрольными суммами. Сегодня вы разворачиваете проект кассы, решаете, какие файлы уходят в репозиторий, и разбираете вопросы стажёров из общего чата.',
        'В чате стажёры присылают вывод терминала и описание того, что делали. Для каждого случая выберите причину из списка.',
      ],
      task: 'Три части: порядок команд от архива до запуска, раскладка десяти файлов и папок, причины семи проблем из чата.',
    },
    {
      subject: 'Вторник: подписи по заявкам',
      body: [
        'Заказчики прислали заявки на новые функции. Код функций напишут позже. Сейчас нужна подпись каждой функции: какие параметры она принимает, какого они типа и что возвращает. По подписи вторая группа начнёт писать вызовы, не дожидаясь тела функции.',
        'Имя функции я уже придумала. Оно с заглавной буквы: функцию будут вызывать из другого пакета. В заявке есть и данные, которые функции не нужны: их выводит или хранит другая часть программы. Такие данные в подпись не переносите.',
        'У параметра в Go один тип. Результатов может быть несколько: тогда в слот результата кладутся два типа по порядку, и подпись покажет их в скобках, например (int, error). Если функция ничего не возвращает, слот результата остаётся пустым.',
      ],
      task: 'Десять заявок. Перенесите в подпись нужные параметры и подберите тип каждому параметру и результату.',
    },
    {
      subject: 'Среда: какие строки примет компилятор',
      body: [
        'Подписи из вторника утверждены, и вторая группа прислала свои вызовы. Go сверяет каждый вызов с подписью при сборке: число аргументов, тип каждого аргумента и то, как используется результат. Одна неподходящая строка — и go build не соберёт проект.',
        'По подписи решите, какие строки компилятор примет, а какие нет. Тела функций не показаны: для сверки вызова с подписью тело не нужно. Считайте, что каждая объявленная в строке переменная дальше используется.',
      ],
      task: 'Пять подписей, к каждой восемь строк кода. Разложите строки по колонкам «Соберётся» и «Не соберётся».',
    },
    {
      subject: 'Четверг: подпись вручную',
      body: [
        'Последнее задание недели — те же подписи, но без готовых блоков. Строку func пишете сами, от слова func до типа результата.',
        'Имена функции и параметров даны в заявке, порядок параметров — тоже. Под полем видно, как Go прочитает вашу строку. Если в записи ошибка, там же будет сказано, в каком месте.',
        'В конце письма — кнопка «Сдать работу». После неё ответы закрываются, а в пятницу придёт рецензия.',
      ],
      task: 'Четыре заявки. Напишите подпись функции целиком: имя, параметры с типами, типы результатов.',
    },
  ];

  /* ── Письмо 1 ─────────────────────────────────────────────────── */
  const ORDER = {
    intro: 'Ирина прислала архив проекта кассы «Зерно»: в нём main.go, report.go, папка internal/, README.md и .gitignore. Файлов go.mod и go.sum в архиве нет: стажёр, который его собирал, их не положил. В коде есть импорты example.com/zerno-kassa/internal/services и github.com/fatih/color. Разложите шаги от архива до первого запуска. Лишние шаги оставьте в наборе.',
    steps: [
      { id: 'o1', text: 'Распаковать архив и открыть папку проекта в VS Code: File → Open Folder, затем Terminal → New Terminal' },
      { id: 'o2', text: 'go mod init example.com/zerno-kassa' },
      { id: 'o3', text: 'go mod tidy' },
      { id: 'o4', text: 'go run .' },
    ],
    extra: [
      { id: 'x1', text: 'go get -u ./...', why: 'Ключ -u поднимает версии всех зависимостей до последних. Проект соберётся не на тех версиях, на которых его писали. Нужные версии go mod tidy подберёт сам.' },
      { id: 'x2', text: 'go run main.go', why: 'Так собирается один файл, а в пакете main их два: main.go и report.go. Сборка остановится на undefined: buildReport. Пакет целиком запускает go run .' },
      { id: 'x3', text: 'python -m venv .venv', why: 'Окружение .venv — способ Python. В Go версии библиотек записаны в go.mod, отдельную папку под проект не создают и ничего не активируют.' },
    ],
    why: 'Без go.mod команда go не считает папку модулем, поэтому первым объявляют модуль. Имя модуля должно совпадать с началом импортов в коде. Затем go mod tidy читает импорты, скачивает библиотеку и записывает версии в go.mod и go.sum. Запуск идёт последним, когда зависимости записаны.',
  };

  const FILES = {
    intro: 'Проект кассы запущен. Перед первым коммитом решите, что уходит в репозиторий, а что остаётся только на вашем компьютере.',
    cards: [
      { id: 'f1', name: 'main.go', where: 'repo', why: 'Исходный код: без него проекта нет.' },
      { id: 'f2', name: 'internal/services/calculator.go', where: 'repo', why: 'Пакет проекта — тоже исходный код.' },
      { id: 'f3', name: 'internal/services/calculator_test.go', where: 'repo', why: 'Тесты нужны каждому, кто будет менять код.' },
      { id: 'f4', name: 'go.mod', where: 'repo', why: 'Имя модуля и версии зависимостей: по нему другой разработчик соберёт проект на тех же версиях.' },
      { id: 'f5', name: 'README.md', where: 'repo', why: 'Инструкция: что делает программа и как её запустить.' },
      { id: 'f6', name: '.gitignore', where: 'repo', why: 'Правила игнорирования нужны всем участникам: у каждого после go build появится свой собранный файл.' },
      { id: 'f7', name: 'go.sum', where: 'repo', why: 'Контрольные суммы зависимостей. Файл создаётся сам, но хранится в Git: по нему Go проверяет, что скачан тот же код.' },
      { id: 'f8', name: 'zerno-kassa', where: 'local', why: 'Собранная программа для macOS и Linux. Её заново создаёт go build из исходников.' },
      { id: 'f9', name: 'zerno-kassa.exe', where: 'local', why: 'Собранная программа для Windows. На другой системе она не запустится, а из исходников собирается одной командой.' },
      { id: 'f10', name: '.env', where: 'local', why: 'В .env хранят локальные настройки и секреты, например пароль к базе.' },
    ],
  };

  /* Причины для ситуаций из чата. Порядок не совпадает с порядком ситуаций. */
  const CAUSES = [
    ['folder', 'В VS Code открыта папка уровнем выше, а не папка с go.mod'],
    ['net', 'Нет доступа к сети: библиотека не скачалась'],
    ['runfile', 'Запущен один файл, а не пакет целиком'],
    ['export', 'Имя функции начинается с маленькой буквы и не видно из другого пакета'],
    ['cwd', 'Терминал открыт не в папке модуля'],
    ['cycle', 'Два пакета импортируют друг друга'],
    ['ignore', 'Нет правил .gitignore для собранного файла и настроек'],
    ['dep', 'Библиотека импортирована в коде, но не записана в go.mod'],
    ['pkg', 'В одной папке лежат файлы с разными именами пакета'],
  ];

  const CHAT = [
    {
      id: 'c1', who: 'Денис',
      text: 'Распаковал проект, открыл терминал и запускаю. Go отвечает, что не видит go.mod, хотя файл в проекте есть.',
      term: '$ pwd\n/Users/denis/Downloads\n$ ls\nzerno-kassa   zerno-kassa.zip\n$ go run .\ngo: go.mod file not found in current directory or any parent directory; see \'go help modules\'',
      cause: 'cwd',
      why: 'Команда go ищет go.mod в текущей папке и выше по дереву. Терминал стоит в Downloads, а go.mod лежит на уровень ниже, в zerno-kassa. Исправление: перейти в папку проекта командой cd zerno-kassa или открыть терминал из VS Code, когда открыта эта папка.',
    },
    {
      id: 'c2', who: 'Лиза',
      text: 'Добавила в main.go цветной вывод, строку импорта написала как в документации библиотеки. Сборка не идёт.',
      term: '$ go run .\nmain.go:4:2: no required module provides package github.com/fatih/color; to add it:\n\tgo get github.com/fatih/color',
      cause: 'dep',
      why: 'Импорт в коде есть, а строки require в go.mod нет: Go не знает, какую версию библиотеки брать. Исправление: выполнить go get github.com/fatih/color или go mod tidy — команда допишет версию в go.mod и суммы в go.sum.',
    },
    {
      id: 'c3', who: 'Ксюша',
      text: 'Вынесла функцию buildReport в отдельный файл report.go, пакет тот же — main. Теперь программа не запускается.',
      term: '$ ls\ngo.mod   go.sum   internal   main.go   report.go\n$ go run main.go\n# command-line-arguments\n./main.go:11:14: undefined: buildReport',
      cause: 'runfile',
      why: 'Команда go run main.go собирает только перечисленный файл. Функция buildReport лежит в report.go, и компилятор её не видит. Исправление: go run . — точка означает «весь пакет в этой папке».',
    },
    {
      id: 'c4', who: 'Глеб',
      text: 'Готовлю первый коммит. Git предлагает добавить вот это.',
      term: '$ go build\n$ git status --short\n?? .env\n?? go.mod\n?? go.sum\n?? internal/\n?? main.go\n?? report.go\n?? zerno-kassa',
      cause: 'ignore',
      why: 'Git видит собранный файл zerno-kassa и файл настроек .env как новые. Исправление: создать .gitignore со строками zerno-kassa, zerno-kassa.exe и .env — тогда в списке останутся исходники, go.mod и go.sum.',
    },
    {
      id: 'c5', who: 'Марат',
      text: 'Написал расчёт суммы в пакете services, функция называется orderTotal. Вызываю её из main.go — компилятор говорит, что такой функции нет.',
      term: '$ go run .\n# example.com/zerno-kassa\n./main.go:10:20: undefined: services.orderTotal',
      cause: 'export',
      why: 'Из другого пакета видны только имена с заглавной буквы. Функция orderTotal доступна внутри пакета services и не видна из main. Исправление: переименовать её в OrderTotal и в объявлении, и в вызове.',
    },
    {
      id: 'c6', who: 'Оля',
      text: 'В терминале программа собирается и работает. А редактор подчёркивает строки импорта.',
      term: 'Explorer в VS Code:\nDOWNLOADS\n└── zerno-kassa\n    ├── go.mod\n    └── main.go\n\nПодсказка редактора у строки импорта:\nno required module provides package example.com/zerno-kassa/internal/services\n\n$ cd zerno-kassa\n$ go run .\nК оплате: 387,00 ₽',
      cause: 'folder',
      why: 'Расширение Go считает проектом ту папку, в корне которой лежит go.mod. Открыта папка Downloads, go.mod в ней на уровень глубже, поэтому редактор не находит модуль. В терминале Оля перешла в zerno-kassa, и там сборка работает. Исправление: File → Open Folder и выбрать zerno-kassa.',
    },
    {
      id: 'c7', who: 'Тимур',
      text: 'Добавил в папку internal/services второй файл format.go, первой строкой написал package calculator. Сборка остановилась.',
      term: '$ go build ./...\nmain.go:6:2: found packages services (calculator.go) and calculator (format.go) in /Users/timur/zerno-kassa/internal/services',
      cause: 'pkg',
      why: 'Пакет в Go — это папка: у всех файлов в ней первая строка package должна называть одно и то же имя. В calculator.go записано package services, в format.go — package calculator. Исправление: в format.go написать package services.',
    },
  ];

  /* ── Письмо 2 ─────────────────────────────────────────────────── */
  /* Каталог типов. Один и тот же тип можно класть в любое число слотов. */
  const CATALOG = [
    ['Простые', ['int', 'float64', 'string', 'bool', 'error']],
    ['Срезы', ['[]int', '[]float64', '[]string', '[]bool']],
    ['Словари', ['map[string]int', 'map[string]float64', 'map[string]string', 'map[int]string', 'map[string]bool', 'map[string][]int']],
    ['Время', ['time.Time']],
  ];

  /* params — верная подпись, pool — что лежит в наборе.
     ret — типы результатов по порядку; пустой список — результата нет.
     ex — строки из заявки: verify.py собирает их с эталонной подписью. */
  const BUILD = [
    {
      id: 'b1', client: 'Колледж «Северный» · электронный журнал', fn: 'AverageGrade',
      request: 'Классному руководителю нужен средний балл студента за семестр. Оценки студента журнал хранит срезом целых чисел от 2 до 5, например 5, 4, 4, 3. Функция возвращает средний балл: для этих оценок — 4.25. ФИО студента и номер группы печатает шапка отчёта, в расчёте они не участвуют.',
      pool: [['grades'], ['studentName'], ['groupNumber']],
      params: [['grades', '[]int']], ret: ['float64'],
      ex: ['AverageGrade([]int{5, 4, 4, 3})'],
      why: 'Оценки — срез целых чисел, поэтому []int. Среднее 4.25 — дробное число, результат float64. ФИО и группа в расчёте не участвуют.',
    },
    {
      id: 'b2', client: 'Колледж «Северный» · посещаемость', fn: 'CountAbsences',
      request: 'Куратор хочет знать, сколько пар студент пропустил за месяц. Отметки посещаемости журнал хранит срезом строк: "+" — студент был на паре, "н" — не был. Функция возвращает число пропусков. Название месяца и фамилия преподавателя есть в журнале, но для подсчёта не нужны.',
      pool: [['month'], ['marks'], ['teacher']],
      params: [['marks', '[]string']], ret: ['int'],
      ex: ['CountAbsences([]string{"+", "н", "+", "н"})'],
      why: 'Отметки — строки "+" и "н" в срезе: []string. Число пропусков целое: int.',
    },
    {
      id: 'b3', client: 'Кофейня «Зерно» · касса', fn: 'OrderTotal',
      request: 'Касса передаёт состав заказа словарём: ключ — название позиции, значение — цена в копейках, целое число. Например, "Латте" — 25000, "Круассан" — 18000. Функция складывает цены и вычитает скидку постоянного гостя. Скидка — целое число процентов; когда скидки нет, касса передаёт 0. Возвращается сумма к оплате в копейках. Имя бариста и номер столика касса печатает в чеке отдельно.',
      pool: [['barista'], ['items'], ['discount'], ['tableNumber']],
      params: [['items', 'map[string]int'], ['discount', 'int']], ret: ['int'],
      ex: ['OrderTotal(map[string]int{"Латте": 25000, "Круассан": 18000}, 0)', 'OrderTotal(map[string]int{"Латте": 25000}, 10)'],
      why: 'Состав заказа — словарь «название (string) → цена в копейках (int)»: map[string]int. Скидка — целое число процентов. Значений по умолчанию в Go нет, поэтому скидка — обычный параметр, и без скидки передают 0. Сумма в копейках — целое число.',
    },
    {
      id: 'b4', client: 'Кофейня «Зерно» · постоянные гости', fn: 'FindGuestPhone',
      request: 'Бариста вводит имя гостя, функция ищет его телефон в базе постоянных гостей. База — словарь «имя → телефон», телефон записан строкой, например "+7 900 111-22-33". Функция возвращает два значения: сначала телефон, затем признак, найден ли гость, — true или false. Если гостя нет, телефон — пустая строка.',
      pool: [['phone'], ['guests'], ['name']],
      params: [['guests', 'map[string]string'], ['name', 'string']], ret: ['string', 'bool'],
      ex: ['FindGuestPhone(map[string]string{"Анна": "+7 900 111-22-33"}, "Анна")'],
      why: 'База — словарь «имя → телефон», оба строки: map[string]string. Имя — string. Телефон функция возвращает, поэтому в параметры он не входит. Результатов два, и порядок важен: сначала телефон (string), затем признак «найден» (bool). В подписи это (string, bool).',
    },
    {
      id: 'b5', client: 'Фитнес-клуб «Пульс» · абонементы', fn: 'IsMembershipActive',
      request: 'Администратор на входе проверяет, действует ли абонемент. Функция получает дату окончания абонемента и сегодняшнюю дату — обе типа time.Time из пакета time — и отвечает «да» или «нет». Имя клиента и цена абонемента на ответ не влияют.',
      pool: [['clientName'], ['endDate'], ['price'], ['today']],
      params: [['endDate', 'time.Time'], ['today', 'time.Time']], ret: ['bool'],
      ex: ['IsMembershipActive(time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC), time.Now())'],
      why: 'Обе даты — значения типа time.Time. Ответ «да» или «нет» записывается типом bool: true или false.',
    },
    {
      id: 'b6', client: 'Книжный магазин «Переплёт» · склад', fn: 'ParseQuantity',
      request: 'Форма на сайте присылает количество экземпляров книги строкой, например "5". Функция переводит строку в целое число. В строке может оказаться не число, например "пять". Поэтому функция возвращает два значения: сначала количество, затем ошибку. Если перевод удался, ошибка равна nil. Название книги и номер склада в пересчёте не участвуют.',
      pool: [['title'], ['text'], ['warehouse']],
      params: [['text', 'string']], ret: ['int', 'error'],
      ex: ['ParseQuantity("5")', 'ParseQuantity("пять")'],
      why: 'На входе строка: string. Результатов два: количество (int) и ошибка (error). Ошибку в Go возвращают последним значением: вызывающий код сначала проверяет её, потом берёт число. В подписи это (int, error).',
    },
    {
      id: 'b7', client: 'Курьерская служба «Квартал» · отчёт за день', fn: 'DistanceBounds',
      request: 'Диспетчеру нужна самая короткая и самая длинная доставка за день. Расстояния всех доставок курьер сдаёт срезом дробных чисел в километрах, например 2.5, 7.25, 1.8. Функция возвращает два значения: сначала самое короткое расстояние, затем самое длинное. Имя курьера и дата в отчёте уже есть.',
      pool: [['courier'], ['day'], ['distances']],
      params: [['distances', '[]float64']], ret: ['float64', 'float64'],
      ex: ['DistanceBounds([]float64{2.5, 7.25, 1.8})'],
      why: 'Расстояния — срез дробных чисел: []float64. Результат — два дробных числа, поэтому тип float64 стоит в слоте дважды: (float64, float64).',
    },
    {
      id: 'b8', client: 'Кофейня «Зерно» · печать чека', fn: 'PrintReceipt',
      request: 'Функция печатает чек в консоль кассы. Строки чека передаются срезом строк. Вторым передаётся ширина чека в символах, целое число, например 32. Функция только печатает и ничего не возвращает. Имя кассира уже записано в строках чека.',
      pool: [['lines'], ['cashier'], ['width']],
      params: [['lines', '[]string'], ['width', 'int']], ret: [],
      ex: ['PrintReceipt([]string{"Латте     250,00", "Итого     250,00"}, 32)'],
      why: 'Строки чека — []string. Ширина — целое число. Функция ничего не возвращает: после закрывающей скобки в подписи ничего не пишется, слот результата пуст.',
    },
    {
      id: 'b9', client: 'Колледж «Северный» · ведомость группы', fn: 'AverageByStudent',
      request: 'Для ведомости нужен средний балл каждого студента группы. Журнал группы — словарь: ключ — ФИО студента, значение — срез его оценок, целых чисел. Функция возвращает новый словарь: ключ — ФИО, значение — средний балл, дробное число. Номер группы печатает шапка ведомости.',
      pool: [['groupNumber'], ['journal']],
      params: [['journal', 'map[string][]int']], ret: ['map[string]float64'],
      ex: ['AverageByStudent(map[string][]int{"Иванов Пётр": {5, 4}, "Петрова Анна": {3, 4, 5}})'],
      why: 'Журнал — словарь «ФИО (string) → срез оценок ([]int)»: map[string][]int. Результат — словарь «ФИО → средний балл»: map[string]float64.',
    },
    {
      id: 'b10', client: 'Книжный магазин «Переплёт» · выгрузка каталога', fn: 'ExportCatalog',
      request: 'Раз в день магазин выгружает названия книг в текстовый файл. Функция получает путь к файлу строкой и названия книг срезом строк. Она возвращает два значения: сначала число записанных строк, затем ошибку. Ошибка появляется, если файл не удалось создать; при успешной записи она равна nil. Имя кладовщика в выгрузку не попадает.',
      pool: [['titles'], ['storekeeper'], ['path']],
      params: [['path', 'string'], ['titles', '[]string']], ret: ['int', 'error'],
      ex: ['ExportCatalog("catalog.txt", []string{"Мёртвые души", "Нос"})'],
      why: 'Путь — строка, названия — срез строк. Результатов два: число записанных строк (int) и ошибка (error), ошибка стоит последней: (int, error).',
    },
  ];

  /* ── Письмо 3 ─────────────────────────────────────────────────── */
  /* ok: true — строка собирается с этой подписью, false — нет.
     msg — текст компилятора Go для сверки в verify.py; на странице
     показывается только в рецензии. */
  const SIEVE = [
    {
      id: 's1', sig: 'func AverageGrade(grades []int) float64',
      cards: [
        { code: 'AverageGrade([]int{5, 4, 4, 3})', ok: true },
        { code: 'AverageGrade([]float64{5, 4, 3})', ok: false, msg: "cannot use []float64{…} (value of type []float64) as []int value in argument to AverageGrade" },
        { code: 'AverageGrade([]int{})', ok: true },
        { code: 'AverageGrade(5)', ok: false, msg: "cannot use 5 (untyped int constant) as []int value in argument to AverageGrade" },
        { code: 'AverageGrade(nil)', ok: true },
        { code: 'score := AverageGrade([]int{5, 5})', ok: true },
        { code: 'var score int = AverageGrade([]int{5, 5})', ok: false, msg: "cannot use AverageGrade([]int{…}) (value of type float64) as int value in variable declaration" },
        { code: 'AverageGrade(5, 4, 3)', ok: false, msg: "too many arguments in call to AverageGrade have (number, number, number) want ([]int)" },
      ],
      why: 'Параметр принимает только срез целых чисел. Срез []float64 — другой тип, даже если в нём записаны целые значения. Одно число и три числа через запятую срезом не являются. Пустой срез и nil подходят: nil — это срез без элементов. Результат float64 нельзя положить в переменную типа int. Запись через := подходит: тип переменной Go берёт из результата.',
    },
    {
      id: 's2', sig: 'func FindGuestPhone(guests map[string]string, name string) (string, bool)',
      setup: 'guests := map[string]string{"Анна": "+7 900 111-22-33"}',
      cards: [
        { code: 'phone, ok := FindGuestPhone(guests, "Анна")', ok: true },
        { code: 'phone := FindGuestPhone(guests, "Анна")', ok: false, msg: "assignment mismatch: 1 variable but FindGuestPhone returns 2 values" },
        { code: 'FindGuestPhone("Анна", guests)', ok: false, msg: "cannot use \"Анна\" (untyped string constant) as map[string]string value in argument to FindGuestPhone\ncannot use guests (variable of type map[string]string) as string value in argument to FindGuestPhone" },
        { code: 'phone, _ := FindGuestPhone(guests, "Анна")', ok: true },
        { code: 'FindGuestPhone(map[string]int{"Анна": 79001112233}, "Анна")', ok: false, msg: "cannot use map[string]int{…} (value of type map[string]int) as map[string]string value in argument to FindGuestPhone" },
        { code: 'FindGuestPhone(map[string]string{}, "Анна")', ok: true },
        { code: 'var phone string = FindGuestPhone(guests, "Анна")', ok: false, msg: "multiple-value FindGuestPhone(guests, \"Анна\") (value of type (string, bool)) in single-value context" },
        { code: 'n := len(FindGuestPhone(guests, "Анна"))', ok: false, msg: "invalid operation: too many arguments for len(FindGuestPhone(guests, \"Анна\")) (expected 1, found 2)" },
      ],
      why: 'Функция возвращает два значения, и принять нужно оба: слева от := стоят две переменные. Ненужное значение принимают знаком подчёркивания. Одна переменная слева не подходит, и передать результат в len тоже нельзя: там ждут одно значение. Аргументы сверяются по порядку: первым идёт словарь, вторым строка. В словаре телефон должен быть строкой, число 79001112233 не подходит.',
    },
    {
      id: 's3', sig: 'func ParseQuantity(text string) (int, error)',
      cards: [
        { code: 'n, err := ParseQuantity("5")', ok: true },
        { code: 'n, err := ParseQuantity(5)', ok: false, msg: "cannot use 5 (untyped int constant) as string value in argument to ParseQuantity" },
        { code: 'n, err := ParseQuantity("пять")', ok: true },
        { code: 'n := ParseQuantity("5")', ok: false, msg: "assignment mismatch: 1 variable but ParseQuantity returns 2 values" },
        { code: 'n, _ := ParseQuantity("12")', ok: true },
        { code: 'total := ParseQuantity("3") + 2', ok: false, msg: "multiple-value ParseQuantity(\"3\") (value of type (int, error)) in single-value context" },
        { code: "n, err := ParseQuantity('5')", ok: false, msg: "cannot use \'5\' (untyped rune constant 53) as string value in argument to ParseQuantity" },
        { code: '_, err := ParseQuantity("")', ok: true },
      ],
      why: 'Параметр — строка в двойных кавычках. Число 5 строкой не является. Запись в одинарных кавычках в Go — это один символ, а не строка, поэтому она тоже не подходит. Строка "пять" и пустая строка — тоже string, компилятор их примет. Подпись задаёт только тип значения; что написано внутри строки, по ней не проверяется. О неудачном переводе функция сообщит при работе программы вторым результатом — ошибкой. Результатов два, поэтому слева нужны две переменные, и прибавить число сразу к вызову нельзя.',
    },
    {
      id: 's4', sig: 'func DistanceBounds(distances []float64) (float64, float64)',
      cards: [
        { code: 'shortest, longest := DistanceBounds([]float64{2.5, 7.25, 1.8})', ok: true },
        { code: 'shortest, longest := DistanceBounds([]int{2, 7, 1})', ok: false, msg: "cannot use []int{…} (value of type []int) as []float64 value in argument to DistanceBounds" },
        { code: 'shortest, longest := DistanceBounds([]float64{2, 7, 1})', ok: true },
        { code: 'a, b, c := DistanceBounds([]float64{2.5, 7.25, 1.8})', ok: false, msg: "assignment mismatch: 3 variables but DistanceBounds returns 2 values" },
        { code: 'shortest, longest := DistanceBounds(2.5, 7.25, 1.8)', ok: false, msg: "too many arguments in call to DistanceBounds have (number, number, number) want ([]float64)" },
        { code: '_, longest := DistanceBounds([]float64{2.5})', ok: true },
        { code: 'var shortest, longest int = DistanceBounds([]float64{2.5, 7.25})', ok: false, msg: "cannot use 1st function result (value of type float64) as int value in multiple assignment\ncannot use 2nd function result (value of type float64) as int value in multiple assignment" },
        { code: 'var shortest, longest float64 = DistanceBounds(nil)', ok: true },
      ],
      why: 'Параметр — срез дробных чисел. Срез []int не подходит, хотя числа в нём те же. Запись []float64{2, 7, 1} подходит: тип среза назван явно, и числа 2, 7, 1 записываются в него как дробные. Три числа через запятую — это три аргумента, а параметр один. Результатов два: слева должно быть ровно две переменные, и обе типа float64.',
    },
    {
      id: 's5', sig: 'func PrintReceipt(lines []string, width int)',
      cards: [
        { code: 'PrintReceipt([]string{"Латте", "Круассан"}, 32)', ok: true },
        { code: 'PrintReceipt([]string{"Латте"})', ok: false, msg: "not enough arguments in call to PrintReceipt have ([]string) want ([]string, int)" },
        { code: 'PrintReceipt([]string{"Латте"}, "32")', ok: false, msg: "cannot use \"32\" (untyped string constant) as int value in argument to PrintReceipt" },
        { code: 'PrintReceipt(nil, 40)', ok: true },
        { code: 'PrintReceipt("Латте", 32)', ok: false, msg: "cannot use \"Латте\" (untyped string constant) as []string value in argument to PrintReceipt" },
        { code: 'result := PrintReceipt([]string{"Латте"}, 32)', ok: false, msg: "PrintReceipt([]string{…}, 32) (no value) used as value" },
        { code: 'PrintReceipt([]string{}, 16*2)', ok: true },
        { code: 'PrintReceipt([]string{"Латте", 250}, 32)', ok: false, msg: "cannot use 250 (untyped int constant) as string value in array or slice literal" },
      ],
      why: 'Оба параметра обязательны: значений по умолчанию в Go нет, и вызов без ширины не соберётся. Строки чека — только срез строк: одна строка "Латте" и число 250 внутри среза не подходят. Ширина — целое число: "32" в кавычках — строка, а 16*2 — целое, Go вычисляет его при сборке. У функции нет результата, поэтому сохранить его в переменную нельзя.',
    },
  ];

  /* ── Письмо 4 ─────────────────────────────────────────────────── */
  const WRITE = [
    {
      id: 'w1', client: 'Колледж «Северный» · лучший студент',
      task: 'Функция BestStudent получает словарь averages: ключ — ФИО студента, значение — средний балл, дробное число. Возвращает два значения: сначала ФИО студента с самым высоким баллом, затем признак, нашёлся ли такой студент, — true или false. Для пустого словаря признак равен false.',
      answer: 'func BestStudent(averages map[string]float64) (string, bool)',
      ex: ['BestStudent(map[string]float64{"Иванов Пётр": 4.5, "Петрова Анна": 4.75})', 'BestStudent(map[string]float64{})'],
      hint: 'Словарь записывается как map[тип ключа]тип значения. Два результата перечисляются в скобках через запятую, в том порядке, в каком они названы в заявке.',
    },
    {
      id: 'w2', client: 'Фитнес-клуб «Пульс» · бонусы',
      task: 'Функция AddBonus начисляет бонусы. Параметры по порядку: balance — текущий баланс бонусов, целое число; visits — число посещений за месяц, целое число; isVIP — VIP-клиент или нет. Возвращает новый баланс, целое число.',
      answer: 'func AddBonus(balance int, visits int, isVIP bool) int',
      ex: ['AddBonus(120, 8, false)', 'AddBonus(120, 8, true)'],
      hint: '«Да или нет» — тип bool, его значения true и false. Тип пишется после имени параметра через пробел: balance int. Один результат пишется после скобки без скобок.',
    },
    {
      id: 'w3', client: 'Курьерская служба «Квартал» · адреса',
      task: 'Функция SplitAddress получает адрес address одной строкой, например "Лесная, 12", и возвращает два значения: сначала улицу, затем номер дома. Оба — строки: "Лесная" и "12".',
      answer: 'func SplitAddress(address string) (string, string)',
      ex: ['SplitAddress("Лесная, 12")'],
      hint: 'Два результата одного типа записываются в скобках дважды: тип повторяется.',
    },
    {
      id: 'w4', client: 'Книжный магазин «Переплёт» · цены',
      task: 'Функция LoadPrices читает цены из файла. Параметр path — путь к файлу, строка. Возвращает два значения: сначала словарь «название книги → цена в копейках», цена — целое число; затем ошибку, если файл прочитать не удалось.',
      answer: 'func LoadPrices(path string) (map[string]int, error)',
      ex: ['LoadPrices("prices.csv")'],
      hint: 'Тип результата может быть составным: map[string]int. Ошибка записывается типом error и стоит последней.',
    },
  ];

  return { FROM, LETTERS, ORDER, FILES, CAUSES, CHAT, CATALOG, BUILD, SIEVE, WRITE };
})();
