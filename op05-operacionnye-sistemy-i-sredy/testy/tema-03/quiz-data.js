/* Тест ОП.05 по занятию 3 «Файловая система Linux». Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op05-test-t03",
 "prefix": "OS03",
 "title": "Занятие 3 · FHS: разложить сервер по местам",
 "minutes": 60,
 "salt": "op05-t03-fhs-2026-sep",
 "context": "Во всех заданиях — служба <b>college-notify</b>, которая рассылает студентам уведомления колледжа. Сервер — Ubuntu 24.04. Службу написали в колледже и ставят вручную, без apt. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 26,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 20,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 14,
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
   "id": "q14",
   "topic": "настоящая Ubuntu · права",
   "type": "line",
   "text": "Первый столбец вывода <code>ls -ld</code> — тип и права: после буквы <code>d</code> идут три тройки символов — для владельца, для группы и для всех остальных; <code>w</code> означает право записи. Отметьте строки каталогов, в которых обычный пользователь без sudo может создать файл.",
   "code": "$ ls -ld /etc /run /tmp /usr/local/bin /var/lib /var/tmp\ndrwxr-xr-x 139 root root 12288 Sep 14 18:40 /etc\ndrwxr-xr-x  37 root root  1020 Sep 14 18:45 /run\ndrwxrwxrwt  18 root root   380 Sep 14 18:53 /tmp\ndrwxr-xr-x   2 root root  4096 Feb 10 14:02 /usr/local/bin\ndrwxr-xr-x  77 root root  4096 Sep 14 18:40 /var/lib\ndrwxrwxrwt   1 root root   260 Sep 14 18:53 /var/tmp",
   "file": "терминал",
   "many": true,
   "chapters": [
    "Часть 4"
   ]
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
   "id": "q29",
   "topic": "владелец базы",
   "type": "single",
   "text": "В выводе <code>ls -l</code> третий столбец — владелец, четвёртый — группа. Права: три тройки символов для владельца, группы и остальных, <code>w</code> — запись. Кто может изменять <code>database.db</code>? Выберите один вариант.",
   "options": [
    "Служба, работающая от пользователя college-notify, и root",
    "Любой участник группы college-notify, а также владелец файла",
    "Любой пользователь сервера, потому что файл лежит в /var",
    "Только root, потому что /var/lib — это системный каталог"
   ],
   "chapters": [
    "Часть 4",
    "Часть 8"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 664 156\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"вывод терминала\"><rect x=\"1.5\" y=\"1.5\" width=\"661\" height=\"153\" rx=\"8\" fill=\"#300A24\" stroke=\"#241F2F\" stroke-width=\"3\"/><circle cx=\"602\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"622\" cy=\"20\" r=\"6\" fill=\"#5E4A58\"/><circle cx=\"642\" cy=\"20\" r=\"6\" fill=\"#E95420\"/><text x=\"332.0\" y=\"25\" text-anchor=\"middle\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"12\" fill=\"#B79AAD\">ubuntu@ubuntu: ~</text><text x=\"20\" y=\"58\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#8AE234\" font-weight=\"700\">ubuntu@ubuntu</tspan><tspan fill=\"#729FCF\" font-weight=\"700\">:~$ </tspan><tspan fill=\"#F2ECF0\">ls -l /var/lib/college-notify</tspan></text><text x=\"20\" y=\"82\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">total 96</tspan></text><text x=\"20\" y=\"106\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">-rw-r----- 1 college-notify college-notify 90112 Sep 22 10:15 database.db</tspan></text><text x=\"20\" y=\"130\" font-family=\"JetBrains Mono,Roboto Mono,monospace\" font-size=\"14\" xml:space=\"preserve\"><tspan fill=\"#F2ECF0\">drwxr-x--- 2 college-notify college-notify  4096 Sep 22 10:14 uploads</tspan></text></svg>",
    "caption": "терминал Ubuntu 24.04 · каталог данных службы"
   }
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
    case 'single': case 'multi': case 'line': case 'odd':
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
