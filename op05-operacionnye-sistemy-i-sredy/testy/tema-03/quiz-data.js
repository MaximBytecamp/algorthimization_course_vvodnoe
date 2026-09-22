/* Тест ОП.05 по занятию 3 «Файловая система Linux». Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op05-test-t03-r2",
 "prefix": "OS03",
 "title": "Занятие 3 · FHS: разложить сервер по местам",
 "minutes": 75,
 "salt": "op05-t03-fhs-2026-sep",
 "context": "Во всех заданиях — служба <b>college-notify</b>, которая рассылает студентам уведомления колледжа. Сервер — Ubuntu 24.04. Службу написали в колледже и ставят вручную, без apt. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 34,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 27,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 19,
   "mark": 3,
   "label": "удовлетворительно"
  },
  {
   "min": 0,
   "mark": 2,
   "label": "неудовлетворительно"
  }
 ],
 "chapters": {
  "Часть 1": {
   "title": "Дерево каталогов и пути",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/01-adres.html"
  },
  "Часть 2": {
   "title": "Назначение каталогов и стандарт FHS",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/02-naznachenie.html"
  },
  "Часть 3": {
   "title": "Где хранятся программы и как оболочка их находит",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/03-programmy.html"
  },
  "Часть 4": {
   "title": "Изменяемые и временные данные",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/04-srok-zhizni.html"
  },
  "Часть 5": {
   "title": "Устройства и сведения ядра: /dev, /proc, /sys",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/05-yadro.html"
  },
  "Часть 7": {
   "title": "Файловые системы и монтирование",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/07-montirovanie.html"
  },
  "Часть 8": {
   "title": "Практическая работа: размещение файлов приложения",
   "url": "../../lessons/03-faylovaya-sistema-linux-fhs/08-sborka.html"
  }
 },
 "questions": [
  {
   "id": "q01",
   "topic": "разложить приложение · 1",
   "type": "sort",
   "text": "Разложите восемь объектов college-notify по каталогам сервера. Перетащите каждый файл в строку каталога. Не все каталоги понадобятся.",
   "items": [
    "college-notify · программа",
    "config.yaml · настройки",
    "database.db · база",
    "app.log · журнал работы",
    "error.log · журнал ошибок",
    "cache/ · кэш",
    "college-notify.pid · номер процесса",
    "report.tmp · временный файл"
   ],
   "buckets": [
    "/etc/college-notify/",
    "/run/college-notify/",
    "/tmp/",
    "/usr/bin/",
    "/usr/local/bin/",
    "/var/cache/college-notify/",
    "/var/lib/college-notify/",
    "/var/log/college-notify/",
    "/var/tmp/"
   ],
   "tree": true,
   "chapters": [
    "Часть 2",
    "Часть 3",
    "Часть 4"
   ]
  },
  {
   "id": "q02",
   "topic": "разложить приложение · 2",
   "type": "sort",
   "text": "Остальные пять объектов college-notify. Разложите их по каталогам. Не все каталоги понадобятся.",
   "items": [
    ".env · пароли и токены",
    "college-notify.sock · Unix-сокет",
    "uploads/ · файлы от пользователей",
    "README.md · документация",
    "logo.png · картинка для писем"
   ],
   "buckets": [
    "/etc/college-notify/",
    "/run/college-notify/",
    "/tmp/",
    "/usr/local/share/college-notify/",
    "/usr/local/share/doc/college-notify/",
    "/var/cache/college-notify/",
    "/var/lib/college-notify/"
   ],
   "tree": true,
   "chapters": [
    "Часть 2",
    "Часть 3",
    "Часть 4"
   ]
  },
  {
   "id": "q03",
   "topic": "итоговая структура",
   "type": "slots",
   "text": "Итоговая структура college-notify. Подпишите назначение каждого каталога: перетащите карточку к каталогу. Две карточки лишние.",
   "chips": [
    "настройки, которые меняет администратор",
    "программа, поставленная вручную",
    "постоянные данные: база и загрузки",
    "журналы работы и ошибок",
    "данные, которые можно вычислить заново",
    "номер процесса и сокет работающей службы",
    "программы из пакетов дистрибутива",
    "файлы, которые отдаёт сетевая служба"
   ],
   "slots": [
    "/etc/college-notify/",
    "/usr/local/bin/",
    "/var/lib/college-notify/",
    "/var/log/college-notify/",
    "/var/cache/college-notify/",
    "/run/college-notify/"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q04",
   "topic": "срок хранения",
   "type": "sort",
   "text": "Сервер — установленная Ubuntu, не Live-сессия. Что станет с каждым файлом после перезагрузки? Разложите пути по двум группам.",
   "items": [
    "<code>/run/college-notify/college-notify.pid</code>",
    "<code>/tmp/report.tmp</code>",
    "<code>/run/college-notify/college-notify.sock</code>",
    "<code>/var/cache/college-notify/avatars.json</code>",
    "<code>/var/tmp/video-processing.part</code>",
    "<code>/var/lib/college-notify/database.db</code>",
    "<code>/var/log/college-notify/error.log</code>",
    "<code>/etc/college-notify/config.yaml</code>"
   ],
   "buckets": [
    "сохранится после перезагрузки",
    "исчезнет при перезагрузке"
   ],
   "chapters": [
    "Часть 4",
    "Часть 7"
   ]
  },
  {
   "id": "q05",
   "topic": "кто меняет файл",
   "type": "sort",
   "text": "Какие файлы college-notify меняет сама программа во время работы, а какие остаются неизменными, пока их не изменит администратор? Разложите по группам.",
   "items": [
    "college-notify · программа",
    "config.yaml",
    ".env",
    "logo.png",
    "database.db",
    "app.log",
    "cache/",
    "college-notify.pid",
    "uploads/"
   ],
   "buckets": [
    "меняет администратор: при настройке или обновлении",
    "меняет сама программа во время работы"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4"
   ]
  },
  {
   "id": "q06",
   "topic": "плохой сервер · найти ошибки",
   "type": "line",
   "text": "Другой разработчик установил college-notify. Ниже — пути всех файлов службы на его сервере. Отметьте каждую строку, где объект лежит не в том каталоге.",
   "code": "/home/admin/college-notify/app.log\n/etc/college-notify/.env\n/tmp/college-notify/database.db\n/etc/college-notify/cache/\n/var/log/college-notify/error.log\n/usr/bin/college-notify/config.yaml\n/run/college-notify/college-notify.pid\n/var/log/college-notify/database.db\n/home/admin/college-notify.pid\n/etc/college-notify/error.log",
   "file": "пути файлов college-notify",
   "many": true,
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q07",
   "topic": "плохой сервер · перенести",
   "type": "sort",
   "text": "Так файлы разложены на сервере плохого разработчика. Перенесите в правильный каталог каждый файл, который лежит не на месте. Файлы, которые лежат верно, оставьте.",
   "items": [
    "app.log",
    "database.db",
    "cache/",
    "config.yaml",
    "college-notify.pid",
    "error.log",
    "uploads/",
    ".env"
   ],
   "buckets": [
    "/etc/college-notify/",
    "/home/admin/college-notify/",
    "/run/college-notify/",
    "/tmp/college-notify/",
    "/usr/bin/college-notify/",
    "/var/cache/college-notify/",
    "/var/lib/college-notify/",
    "/var/log/college-notify/"
   ],
   "tree": true,
   "start": [
    1,
    3,
    0,
    4,
    1,
    0,
    3,
    0
   ],
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q08",
   "topic": "плохой сервер · база в /tmp",
   "type": "single",
   "text": "На сервере плохого разработчика база лежит в <code>/tmp/college-notify/database.db</code>. Что из этого следует? Выберите один вариант.",
   "options": [
    "База исчезнет при перезагрузке или очистке /tmp, и данные пропадут",
    "Любой процесс сможет открыть базу, и служба будет работать медленнее",
    "В /tmp нельзя создать файл с расширением .db, служба не запустится",
    "База не сохранит изменения, потому что /tmp открыт только для чтения"
   ],
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q09",
   "topic": "плохой сервер · настройки в /usr/bin",
   "type": "single",
   "text": "Настройки college-notify лежат в <code>/usr/bin/college-notify/config.yaml</code>. В чём ошибка такого размещения? Выберите один вариант.",
   "options": [
    "/usr/bin — место программ из пакетов, настройки ищут в /etc",
    "В /usr/bin нельзя создавать подкаталоги, файл не прочитается",
    "/usr/bin очищается при загрузке, настройки придётся писать заново",
    "Оболочка выполнит config.yaml как команду при каждом входе"
   ],
   "chapters": [
    "Часть 2",
    "Часть 3"
   ]
  },
  {
   "id": "q10",
   "topic": "плохой сервер · журнал в /etc",
   "type": "single",
   "text": "Журнал ошибок пишется в <code>/etc/college-notify/error.log</code>. К каким последствиям это приводит? Выберите один вариант.",
   "options": [
    "Службе нужна запись в /etc, а журнал попадает и в копию настроек",
    "Ядро не даёт писать в /etc, поэтому ошибки перестанут сохраняться",
    "Файлы из /etc удаляются при перезагрузке, история ошибок пропадёт",
    "Служба прочитает error.log как настройки и не сможет запуститься"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4"
   ]
  },
  {
   "id": "q11",
   "topic": "всё в /home/max/app",
   "type": "multi",
   "text": "Разработчик предлагает не раскладывать файлы, а положить всё приложение вместе с базой, журналами и настройками в <code>/home/max/app/</code>. Какие утверждения о таком решении верны? Отметьте все верные.",
   "options": [
    "Служба зависит от учётной записи max: удалят её — пострадает и служба",
    "Настройки и базу не сохранить в копию отдельно от журналов и кэша",
    "Администратор будет искать журналы в /var/log и не найдёт их там",
    "Linux не запускает программы, если файл лежит внутри каталога /home",
    "Файлы в домашнем каталоге система удаляет при каждой перезагрузке"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4"
   ]
  },
  {
   "id": "q12",
   "topic": "настоящая Ubuntu · /run",
   "type": "single",
   "text": "Служба записала номер своего процесса в <code>/run/college-notify/college-notify.pid</code>. Что станет с этим файлом после перезагрузки? Ответ подтвердите выводом команд. Выберите один вариант.",
   "options": [
    "Исчезнет: /run находится на tmpfs, то есть в оперативной памяти",
    "Сохранится: /run находится на диске, на той же системе, что и /var",
    "Сохранится: права на /run только у root, и система его не чистит",
    "Исчезнет: каталог /run очищается раз в сутки службой очистки"
   ],
   "chapters": [
    "Часть 4",
    "Часть 7"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 252\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"249\" rx=\"8\" fill=\"#300A24\" stroke=\"#241F2F\" stroke-width=\"3\"/><circle cx=\"578\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"598\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"618\" cy=\"20\" r=\"6\" fill=\"#E95420\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"12\" fill=\"#B79AAD\">ubuntu@ubuntu: ~</text><text x=\"20\" y=\"58\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -ld /tmp /var/tmp /run</tspan></text><text x=\"20\" y=\"82\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwxr-xr-x 37 root root 1020 Sep 14 18:45 /run</tspan></text><text x=\"20\" y=\"106\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwxrwxrwt 18 root root  380 Sep 14 18:53 /tmp</tspan></text><text x=\"20\" y=\"130\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwxrwxrwt  1 root root  260 Sep 14 18:53 /var/tmp</tspan></text><text x=\"20\" y=\"154\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">findmnt -n -o TARGET,FSTYPE -T /run</tspan></text><text x=\"20\" y=\"178\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/run   tmpfs</tspan></text><text x=\"20\" y=\"202\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">findmnt -n -o TARGET,FSTYPE -T /var/lib</tspan></text><text x=\"20\" y=\"226\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/      ext4</tspan></text></svg>",
    "caption": "терминал Ubuntu 24.04 · каталоги временных данных"
   }
  },
  {
   "id": "q13",
   "topic": "настоящая Ubuntu · CUPS",
   "type": "multi",
   "text": "Служба печати CUPS — готовый пример раскладки по FHS. Какие утверждения подтверждаются выводом команд? Отметьте все верные.",
   "options": [
    "Настройки службы печати лежат в /etc/cups, например файл cupsd.conf",
    "Файл cups.sock лежит на tmpfs, при загрузке служба создаёт его заново",
    "Журнал access_log может прочитать любой пользователь этой системы",
    "Журналы CUPS хранятся в оперативной памяти вместе с каталогом /run",
    "Очередь заданий печати хранится в каталоге кэша /var/cache/cups"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 647 396\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"644\" height=\"393\" rx=\"8\" fill=\"#300A24\" stroke=\"#241F2F\" stroke-width=\"3\"/><circle cx=\"585\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"605\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"625\" cy=\"20\" r=\"6\" fill=\"#E95420\"/><text x=\"323.5\" y=\"25\" text-anchor=\"middle\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"12\" fill=\"#B79AAD\">ubuntu@ubuntu: ~</text><text x=\"20\" y=\"58\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls /etc/cups</tspan></text><text x=\"20\" y=\"82\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">cups-browsed.conf  cupsd.conf  ppd        raw.types  ssl</tspan></text><text x=\"20\" y=\"106\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">cups-files.conf    interfaces  raw.convs  snmp.conf  subscriptions.conf</tspan></text><text x=\"20\" y=\"130\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -l /var/log/cups</tspan></text><text x=\"20\" y=\"154\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">-rw-r----- 1 root adm 336 Sep 14 19:49 access_log</tspan></text><text x=\"20\" y=\"178\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -ld /var/spool/cups /var/cache/cups</tspan></text><text x=\"20\" y=\"202\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwxrwx--- 1 root lp 80 Sep 14 19:49 /var/cache/cups</tspan></text><text x=\"20\" y=\"226\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwx--x--- 1 root lp 60 Feb 10  2026 /var/spool/cups</tspan></text><text x=\"20\" y=\"250\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -l /run/cups</tspan></text><text x=\"20\" y=\"274\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">dr-x--x--x 2 lp   lpadmin  60 Sep 14 20:04 certs</tspan></text><text x=\"20\" y=\"298\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">srw-rw-rw- 1 root root      0 Sep 14 19:49 cups.sock</tspan></text><text x=\"20\" y=\"322\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">-rw-r--r-- 1 root root    135 Sep 14 19:49 printcap</tspan></text><text x=\"20\" y=\"346\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">findmnt -n -o TARGET,FSTYPE -T /run/cups</tspan></text><text x=\"20\" y=\"370\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/run   tmpfs</tspan></text></svg>",
    "caption": "терминал Ubuntu 24.04 · файлы службы печати CUPS"
   }
  },
  {
   "id": "q15",
   "topic": "настоящая Ubuntu · что где",
   "type": "sort",
   "text": "Эти объекты есть в любой Ubuntu. Разложите их по назначению.",
   "items": [
    "<code>/etc/hostname</code>",
    "<code>/usr/bin/python3</code>",
    "<code>/var/lib/dpkg/status</code> — список установленных пакетов",
    "<code>/var/log/cups/access_log</code>",
    "<code>/var/cache/apt/archives/</code> — скачанные пакеты",
    "<code>/var/spool/cups/</code>",
    "<code>/etc/passwd</code>",
    "<code>/usr/lib/</code>"
   ],
   "buckets": [
    "настройки",
    "программы и библиотеки",
    "постоянные данные",
    "журналы",
    "кэш",
    "очереди заданий"
   ],
   "chapters": [
    "Часть 2",
    "Часть 3",
    "Часть 4"
   ]
  },
  {
   "id": "q16",
   "topic": "/run, /tmp, /var/tmp, /var/lib",
   "type": "slots",
   "text": "Четыре файла из вопроса 1 практики. Поставьте к каждому каталог, куда его положить. Две карточки лишние.",
   "chips": [
    "/run",
    "/tmp",
    "/var/tmp",
    "/var/lib",
    "/var/cache",
    "/var/log"
   ],
   "slots": [
    "process.pid — номер процесса работающей службы",
    "video-processing.tmp — кадры, нужные только пока идёт обработка видео",
    "unfinished-report.tmp — черновик отчёта, который собирают три дня",
    "users.db — база пользователей"
   ],
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q17",
   "topic": "mytool · куда ставить",
   "type": "single",
   "text": "Вы написали утилиту <code>mytool</code> и ставите её на сервер сами, без apt. В какой каталог положить исполняемый файл? Выберите один вариант.",
   "options": [
    "/usr/local/bin — туда администратор ставит программы вручную",
    "/usr/bin — туда попадают все программы, какие есть в системе",
    "/etc — там лежат файлы, которые администратор создаёт сам",
    "/opt/bin — там лежат все программы, собранные не для Ubuntu"
   ],
   "chapters": [
    "Часть 3"
   ]
  },
  {
   "id": "q18",
   "topic": "mytool · какой запустится",
   "type": "single",
   "text": "На сервере оказалось два файла <code>mytool</code>: ваш в <code>/usr/local/bin</code> и чужой в <code>/usr/bin</code>. Вы вводите <code>mytool</code>. Какой файл запустит оболочка? Выберите один вариант.",
   "options": [
    "/usr/local/bin/mytool — его каталог стоит в PATH раньше",
    "/usr/bin/mytool — программы из /usr/bin всегда главнее",
    "Оба по очереди: сначала /usr/local/bin, затем /usr/bin",
    "Никакой: оболочка выдаст ошибку из-за двух одинаковых имён"
   ],
   "chapters": [
    "Часть 3"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 348\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"345\" rx=\"8\" fill=\"#300A24\" stroke=\"#241F2F\" stroke-width=\"3\"/><circle cx=\"578\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"598\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"618\" cy=\"20\" r=\"6\" fill=\"#E95420\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"12\" fill=\"#B79AAD\">ubuntu@ubuntu: ~</text><text x=\"20\" y=\"58\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">printf \"%s\\n\" \"$PATH\" | tr : \"\\n\"</tspan></text><text x=\"20\" y=\"82\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/local/sbin</tspan></text><text x=\"20\" y=\"106\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/local/bin</tspan></text><text x=\"20\" y=\"130\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/sbin</tspan></text><text x=\"20\" y=\"154\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/bin</tspan></text><text x=\"20\" y=\"178\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/sbin</tspan></text><text x=\"20\" y=\"202\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/bin</tspan></text><text x=\"20\" y=\"226\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/games</tspan></text><text x=\"20\" y=\"250\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/local/games</tspan></text><text x=\"20\" y=\"274\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/snap/bin</tspan></text><text x=\"20\" y=\"298\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls /usr/local/bin/mytool /usr/bin/mytool</tspan></text><text x=\"20\" y=\"322\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/usr/bin/mytool  /usr/local/bin/mytool</tspan></text></svg>",
    "caption": "терминал Ubuntu 24.04 · переменная PATH"
   }
  },
  {
   "id": "q19",
   "topic": "зачем разделять /etc и /var",
   "type": "multi",
   "text": "Почему настройки хранят в <code>/etc</code>, а изменяющиеся данные — в <code>/var</code>? Отметьте все верные утверждения.",
   "options": [
    "Настройки сохраняют в копию отдельно от растущих журналов и кэша",
    "Обновление программы в /usr не затрагивает ни настройки, ни данные",
    "Настройки и журналы любой службы администратор ищет в одних местах",
    "/var можно подключить с отдельного диска, если журналы и база растут",
    "Файлы в /etc программа читает быстрее, чем такие же файлы в /var",
    "Система сжимает файлы в /var, и журналы занимают меньше места"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 7"
   ]
  },
  {
   "id": "q20",
   "topic": "что должно пережить перезагрузку",
   "type": "sort",
   "text": "Сервер перезагрузился. Какие данные college-notify обязательно должны сохраниться, а какие служба может создать заново? Разложите по группам.",
   "items": [
    "PID процесса",
    "кэш изображений",
    "база пользователей",
    "конфигурация приложения",
    "журналы",
    "Unix-сокет",
    "временный файл обработки видео"
   ],
   "buckets": [
    "должно сохраниться",
    "можно создать заново"
   ],
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q21",
   "topic": "/opt, /srv, /usr/local",
   "type": "slots",
   "text": "К каждому примеру поставьте каталог, где его разместить. Две карточки лишние.",
   "chips": [
    "/opt",
    "/srv",
    "/usr/local",
    "/usr",
    "/home",
    "/var/lib",
    "/etc"
   ],
   "slots": [
    "Сторонняя программа, которая поставляется одним архивом и целиком живёт в своём каталоге",
    "Файлы сайта колледжа, которые отдаёт веб-сервер",
    "Утилита, которую администратор собрал из исходного кода",
    "Редактор nano, установленный из репозитория Ubuntu командой apt",
    "Личные документы пользователя max"
   ],
   "chapters": [
    "Часть 2",
    "Часть 3"
   ]
  },
  {
   "id": "q22",
   "topic": "убрать лишнее · /etc",
   "type": "odd",
   "text": "Так выглядит каталог настроек после плохого разработчика. Уберите из него всё, чему там не место.",
   "items": [
    "config.yaml",
    ".env",
    "templates.yaml",
    "app.log",
    "database.db",
    "college-notify.pid",
    "cache/"
   ],
   "dir": "/etc/college-notify/",
   "chapters": [
    "Часть 2",
    "Часть 4"
   ]
  },
  {
   "id": "q23",
   "topic": "убрать лишнее · /run",
   "type": "odd",
   "text": "Каталог работающей службы. Уберите из него всё, чему там не место.",
   "items": [
    "college-notify.pid",
    "college-notify.sock",
    "database.db",
    "error.log",
    "uploads/"
   ],
   "dir": "/run/college-notify/",
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q24",
   "topic": "убрать лишнее · /usr/local/bin",
   "type": "odd",
   "text": "Каталог программ, поставленных вручную. Уберите из него всё, чему там не место.",
   "items": [
    "college-notify",
    "mytool",
    "backup.sh",
    "config.yaml",
    "report.tmp",
    "notify-cleanup"
   ],
   "dir": "/usr/local/bin/",
   "chapters": [
    "Часть 3"
   ]
  },
  {
   "id": "q25",
   "topic": "секреты .env",
   "type": "single",
   "text": "В <code>.env</code> лежат пароль к почтовому серверу и токен рассылки. Где хранить этот файл и кому давать его читать? Выберите один вариант.",
   "options": [
    "/etc/college-notify/, читать может служба и администратор",
    "/etc/college-notify/, читать может любой пользователь сервера",
    "/usr/local/bin/, рядом с программой, чтобы она нашла файл",
    "/tmp/, чтобы секреты стирались при каждой перезагрузке"
   ],
   "chapters": [
    "Часть 2"
   ]
  },
  {
   "id": "q26",
   "topic": "преподаватель называет файл",
   "type": "slots",
   "text": "Преподаватель называет файл службы program. Поставьте к каждому каталог, куда его положить. Две карточки лишние.",
   "chips": [
    "/etc/program/",
    "/var/lib/program/",
    "/var/log/program/",
    "/run/program/",
    "/var/cache/program/",
    "/tmp/",
    "/usr/local/bin/",
    "/var/spool/program/"
   ],
   "slots": [
    "config.yaml",
    "users.db",
    "app.log",
    "program.pid",
    "cache.json",
    "temporary.zip"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q27",
   "topic": "сколько пропадёт",
   "type": "number",
   "text": "Все 13 объектов college-notify разложены по FHS (список выше). Сервер — установленная Ubuntu. Сколько объектов из списка пропадут после перезагрузки? Введите число.",
   "code": "/usr/local/bin/college-notify\n/etc/college-notify/config.yaml\n/etc/college-notify/.env\n/var/log/college-notify/app.log\n/var/log/college-notify/error.log\n/run/college-notify/college-notify.pid\n/run/college-notify/college-notify.sock\n/var/cache/college-notify/\n/var/lib/college-notify/database.db\n/var/lib/college-notify/uploads/\n/tmp/report.tmp\n/usr/local/share/doc/college-notify/README.md\n/usr/local/share/college-notify/logo.png",
   "file": "размещение college-notify",
   "unit": "объекта",
   "chapters": [
    "Часть 4",
    "Часть 7"
   ]
  },
  {
   "id": "q28",
   "topic": "как оболочка находит программу",
   "type": "order",
   "text": "Администратор вводит в терминале <code>college-notify --check</code>. Расставьте действия оболочки по порядку: первое — сверху.",
   "items": [
    "Делит строку на имя команды college-notify и ключ --check",
    "Проверяет, не задан ли псевдоним с именем college-notify",
    "Проверяет, не встроенная ли это команда оболочки",
    "Ищет файл college-notify по каталогам PATH слева направо",
    "Запускает найденный файл и передаёт ему ключ --check",
    "Ждёт завершения программы и снова выводит приглашение"
   ],
   "chapters": [
    "Часть 3"
   ]
  },
  {
   "id": "q30",
   "topic": "журнал · что происходит с файлом",
   "type": "single",
   "text": "Файл <code>/var/log/college-notify/app.log</code> удалили. Что произойдёт? Выберите один вариант.",
   "options": [
    "Потеряется история событий, а служба продолжит работу",
    "Служба остановится: без журнала она не может работать",
    "Потеряются данные пользователей, их придётся вводить заново",
    "Ничего: при удалении журнал переносится в /var/cache"
   ],
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q31",
   "topic": "путь · база",
   "type": "path",
   "text": "Соберите абсолютный путь к базе college-notify <code>database.db</code>. Лишние сегменты не используйте.",
   "chips": [
    "var/",
    "lib/",
    "log/",
    "etc/",
    "run/",
    "tmp/",
    "usr/",
    "college-notify/",
    "database.db"
   ],
   "chapters": [
    "Часть 1",
    "Часть 4"
   ]
  },
  {
   "id": "q32",
   "topic": "путь · cd ..",
   "type": "path",
   "text": "Текущий каталог — <code>/usr/share</code>. Вы выполняете <code>cd ../bin</code>. Соберите абсолютный путь каталога, в котором окажется оболочка.",
   "chips": [
    "usr/",
    "share/",
    "bin/",
    "local/",
    "sbin/",
    "lib/",
    "home/"
   ],
   "chapters": [
    "Часть 1"
   ]
  },
  {
   "id": "q33",
   "topic": "путь · /proc",
   "type": "path",
   "text": "Номер процесса college-notify — 1223. Соберите путь к ссылке на текущий каталог этого процесса.",
   "chips": [
    "proc/",
    "sys/",
    "run/",
    "1223/",
    "cwd",
    "exe",
    "dev/"
   ],
   "chapters": [
    "Часть 5"
   ]
  },
  {
   "id": "q34",
   "topic": "путь · флешка",
   "type": "path",
   "text": "Пользователь ubuntu вставил флешку с меткой FLASH, и Ubuntu подключила её сама. Соберите путь к точке монтирования флешки.",
   "chips": [
    "media/",
    "mnt/",
    "dev/",
    "ubuntu/",
    "FLASH/",
    "sdb1",
    "home/"
   ],
   "chapters": [
    "Часть 7"
   ]
  },
  {
   "id": "q35",
   "topic": "дерево · перенос на новый сервер",
   "type": "node",
   "text": "Службу college-notify переносят на новый сервер. Программу поставят заново, журналы и кэш переносить не нужно. Нажмите на дереве каталоги, которые нужно скопировать, чтобы служба заработала с прежними настройками и данными.",
   "many": true,
   "nodes": [
    "etc/",
    "  college-notify/",
    "run/",
    "  college-notify/",
    "tmp/",
    "usr/",
    "  local/",
    "    bin/",
    "var/",
    "  cache/",
    "    college-notify/",
    "  lib/",
    "    college-notify/",
    "  log/",
    "    college-notify/"
   ],
   "chapters": [
    "Часть 2",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q36",
   "topic": "дерево · кэш apt",
   "type": "node",
   "text": "Менеджер пакетов apt держит скачанные пакеты там, откуда их можно удалить без потери данных. Нажмите этот каталог на дереве.",
   "nodes": [
    "etc/",
    "  apt/",
    "usr/",
    "  bin/",
    "  lib/",
    "var/",
    "  cache/",
    "    apt/",
    "  lib/",
    "    dpkg/",
    "    mysql/",
    "  log/",
    "    apache2/",
    "  spool/",
    "    cups/"
   ],
   "chapters": [
    "Часть 4"
   ]
  },
  {
   "id": "q37",
   "topic": "дерево · что не на диске",
   "type": "node",
   "text": "Корневой каталог установленной Ubuntu. Нажмите каталоги, содержимое которых не хранится на диске.",
   "many": true,
   "nodes": [
    "boot/",
    "dev/",
    "etc/",
    "home/",
    "opt/",
    "proc/",
    "run/",
    "srv/",
    "sys/",
    "tmp/",
    "usr/",
    "var/"
   ],
   "chapters": [
    "Часть 4",
    "Часть 5",
    "Часть 7"
   ]
  },
  {
   "id": "q38",
   "topic": "освободить место",
   "type": "odd",
   "text": "df -h показывает, что место на диске заканчивается. Самые крупные объекты в <code>/var</code> — ниже. Отправьте в корзину то, что можно удалить без потери информации: программы создадут это заново.",
   "items": [
    "cache/apt/archives/ · 1,8 ГБ",
    "cache/college-notify/ · 640 МБ",
    "lib/college-notify/database.db · 2,1 ГБ",
    "lib/mysql/ · 3,4 ГБ",
    "lib/college-notify/uploads/ · 950 МБ",
    "spool/cups/ · 12 МБ"
   ],
   "dir": "/var",
   "view": "grid",
   "chapters": [
    "Часть 4",
    "Часть 7"
   ]
  },
  {
   "id": "q39",
   "topic": "плохой сервер · backup-agent",
   "type": "sort",
   "text": "Служба резервного копирования backup-agent из домашнего задания лекции лежит целиком в домашнем каталоге администратора. Разнесите её файлы по каталогам FHS.",
   "items": [
    "backup-agent · программа",
    "agent.conf · настройки",
    "agent.log · журнал",
    "copies.list · список сделанных копий",
    "backup-agent.pid · номер процесса",
    "part-0001.tmp · промежуточный файл"
   ],
   "buckets": [
    "/etc/backup-agent/",
    "/home/admin/backup-agent/",
    "/run/backup-agent/",
    "/tmp/",
    "/usr/local/bin/",
    "/var/lib/backup-agent/",
    "/var/log/backup-agent/"
   ],
   "tree": true,
   "start": [
    1,
    1,
    1,
    1,
    1,
    1
   ],
   "chapters": [
    "Часть 2",
    "Часть 3",
    "Часть 4",
    "Часть 8"
   ]
  },
  {
   "id": "q40",
   "topic": "какая файловая система",
   "type": "sort",
   "text": "Установленная Ubuntu. Какую файловую систему покажет <code>findmnt -T</code> для каждого пути? Разложите пути по типам.",
   "items": [
    "<code>/proc/meminfo</code>",
    "<code>/proc/uptime</code>",
    "<code>/sys/class/net/lo/operstate</code>",
    "<code>/run/cups/cups.sock</code>",
    "<code>/run/college-notify/college-notify.pid</code>",
    "<code>/etc/hostname</code>",
    "<code>/var/log/cups/access_log</code>",
    "<code>/home/ubuntu/notes.txt</code>"
   ],
   "buckets": [
    "ext4 — раздел диска",
    "tmpfs — оперативная память",
    "proc — сведения о процессах и системе",
    "sysfs — сведения об устройствах"
   ],
   "chapters": [
    "Часть 4",
    "Часть 5",
    "Часть 7"
   ]
  },
  {
   "id": "q41",
   "topic": "/proc/uptime и копия",
   "type": "single",
   "text": "Файл <code>/proc/uptime</code> скопировали, подождали пять секунд и прочитали оба файла. Почему значение в <code>/proc/uptime</code> выросло, а в копии — нет? Выберите один вариант.",
   "options": [
    "Копия — обычный файл на диске, а /proc/uptime ядро создаёт при чтении",
    "cp копирует только первую строку, остальное ядро допишет в копию позже",
    "У копии нет прав на запись, поэтому ядро не может обновить её значение",
    "/proc/uptime пустой, поэтому cp скопировал старое значение из кэша apt"
   ],
   "chapters": [
    "Часть 5",
    "Часть 7"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 348\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"637\" height=\"345\" rx=\"8\" fill=\"#300A24\" stroke=\"#241F2F\" stroke-width=\"3\"/><circle cx=\"578\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"598\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"618\" cy=\"20\" r=\"6\" fill=\"#E95420\"/><text x=\"320.0\" y=\"25\" text-anchor=\"middle\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"12\" fill=\"#B79AAD\">ubuntu@ubuntu: ~</text><text x=\"20\" y=\"58\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -l /proc/uptime</tspan></text><text x=\"20\" y=\"82\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">-r--r--r-- 1 root root 0 Sep 14 19:49 /proc/uptime</tspan></text><text x=\"20\" y=\"106\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">cat /proc/uptime</tspan></text><text x=\"20\" y=\"130\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">1791.32 3396.13</tspan></text><text x=\"20\" y=\"154\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">cp /proc/uptime saved-uptime.txt</tspan></text><text x=\"20\" y=\"178\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">sleep 5</tspan></text><text x=\"20\" y=\"202\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">cat /proc/uptime</tspan></text><text x=\"20\" y=\"226\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">1808.04 3427.79</tspan></text><text x=\"20\" y=\"250\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">cat saved-uptime.txt</tspan></text><text x=\"20\" y=\"274\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">1795.24 3403.28</tspan></text><text x=\"20\" y=\"298\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">findmnt -n -o TARGET,FSTYPE -T /proc/uptime</tspan></text><text x=\"20\" y=\"322\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">/proc  proc</tspan></text></svg>",
    "caption": "терминал Ubuntu 24.04 · /proc/uptime и его копия"
   }
  },
  {
   "id": "q42",
   "topic": "опыт с tmpfs",
   "type": "order",
   "text": "Опыт из части 7: показать, что монтирование закрывает прежнее содержимое каталога, а tmpfs исчезает вместе со своими файлами. Расставьте шаги по порядку.",
   "items": [
    "Создать каталог mount-demo",
    "Записать в mount-demo файл before.txt",
    "Подключить к mount-demo tmpfs командой sudo mount",
    "Записать в mount-demo файл inside.txt",
    "Отключить tmpfs командой sudo umount",
    "Убедиться, что before.txt снова виден, а inside.txt пропал"
   ],
   "chapters": [
    "Часть 7"
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
    case 'single': case 'multi': case 'line': case 'odd': case 'node':
      return a.length ? [...a].sort((x, y) => x - y) : null;
    case 'order': case 'path':
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

/* Ответ в коде результата: строка на вопрос. Номера — одним символом (узлы дерева — в base36), пусто — x. */
function encodeAnswer(q, a) {
  if (a == null) return '';
  if (q.type === 'number') return String(a).replace(/[^0-9.,\-]/g, '').slice(0, 12);
  if (q.type === 'slots' || q.type === 'sort') return a.map(x => (x === null || x === undefined) ? 'x' : String(x)).join('');
  if (q.type === 'node') return a.map(x => x.toString(36)).join('');
  return a.join('');
}

function decodeAnswer(q, s) {
  s = s || '';
  if (q.type === 'number') return s === '' ? null : s;
  if (s === '') return null;
  const parts = s.split('');
  if (q.type === 'slots' || q.type === 'sort') return parts.map(c => c === 'x' ? null : Number(c));
  if (q.type === 'node') return parts.map(c => parseInt(c, 36));
  return parts.map(Number);
}

function gradeFor(score) {
  return QUIZ.grades.find(g => score >= g.min) || QUIZ.grades[QUIZ.grades.length - 1];
}
