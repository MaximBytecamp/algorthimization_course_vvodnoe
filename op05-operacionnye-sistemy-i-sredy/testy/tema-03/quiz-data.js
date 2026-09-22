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
    "/opt/",
    "/run/college-notify/",
    "/tmp/",
    "/usr/bin/",
    "/usr/local/bin/",
    "/var/cache/college-notify/",
    "/var/lib/college-notify/",
    "/var/log/college-notify/"
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
    "Журнал access_log лежит среди настроек CUPS в каталоге /etc/cups",
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
   "text": "Четыре файла с разным сроком хранения. Поставьте к каждому каталог, куда его положить. Две карточки лишние.",
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
    "журналы (история событий)",
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
    "notify-cleanup",
    "nano · установлен через apt"
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
   "text": "Менеджер пакетов apt сохраняет скачанные пакеты на диске. Нажмите на дереве каталог, где они лежат.",
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
    "ext4",
    "tmpfs",
    "proc",
    "sysfs"
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
    "Копия лежит в /home, а там ядро обновляет файлы только раз в минуту"
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
