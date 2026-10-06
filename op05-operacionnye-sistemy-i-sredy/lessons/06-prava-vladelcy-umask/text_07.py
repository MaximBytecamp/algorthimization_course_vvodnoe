from blocks import *

# Задания практической работы: (задание, подсказка). Используются здесь и в build.py.
TASKS = [
    ('Создайте группу <code>shop-dev</code> и учётные записи <code>alex</code>, <code>bella</code>, <code>chris</code> с домашними каталогами и оболочкой bash. Добавьте alex и bella в <code>shop-dev</code>.', '<code>groupadd</code>, <code>useradd -m -s</code>, <code>usermod -aG</code>'),
    ('Создайте каталоги <code>/srv/shop/src</code>, <code>/srv/shop/releases</code>, <code>/srv/shop/uploads</code> и назначьте им группу <code>shop-dev</code>.', '<code>mkdir -p</code> и фигурные скобки, <code>chgrp</code>'),
    ('Установите права по таблице: src — <code>2770</code>, releases — <code>2775</code>, uploads — <code>3770</code>. Проверьте строки <code>ls -l</code>.', '<code>chmod</code>; перед заданием переведите числа в буквы сами'),
    ('От имени alex создайте <code>src/app.py</code> с одной строкой, от имени bella допишите в него вторую строку.', '<code>sudo -u alex bash -c \'…\'</code>, <code>tee -a</code>'),
    ('От имени alex создайте <code>src/config.env</code> и закройте его правами <code>600</code>. Убедитесь, что bella его не читает.', '<code>chmod 600</code> внутри <code>bash -c</code>'),
    ('От имени alex опубликуйте <code>releases/v1.txt</code> и передайте файл во владение bella.', '<code>sudo chown</code>'),
    ('Проверьте доступ chris: читает <code>releases/v1.txt</code>, не открывает <code>src</code>, не создаёт файлы в <code>releases</code>.', '<code>sudo -u chris</code>'),
    ('От имени bella положите файл в <code>uploads</code> и убедитесь, что alex не может его удалить.', 'sticky-бит'),
    ('Запустите проверку <code>sudo bash ~/Downloads/perms-lab-check.sh</code> и добейтесь результата 14 из 14.', 'скрипт в материалах занятия'),
]

ROLES = ('<ul class="team">'
         '<li><b>alex</b><p>разработчик: пишет код в <code>src</code>, публикует сборки в <code>releases</code></p><span class="tag">shop-dev</span></li>'
         '<li><b>bella</b><p>разработчица: работает в <code>src</code> вместе с alex, загружает файлы в <code>uploads</code></p><span class="tag">shop-dev</span></li>'
         '<li><b>chris</b><p>аналитик: читает опубликованные сборки, к коду доступа не имеет</p><span class="tag">только личная группа</span></li>'
         '<li><b>root</b><p>администратор: создаёт каталоги, меняет владельцев</p><span class="tag">через sudo</span></li>'
         '</ul>')

CHAPTER = dict(
slug='07-praktika', layer='Практика', color='#1F6F68',
title='Практическая работа · Каталог проекта shop',
lead='В этой части настроим каталог проекта для команды из трёх человек: общий код, публичные сборки и общая папка загрузок, в которой нельзя удалить чужой файл. Результат проверим тестами доступа и скриптом.',
sections=[
dict(title='Роли и каталоги', blocks=[
  P('Команда делает интернет-магазин shop. Разработчики alex и bella вместе пишут код и выкладывают сборки, аналитик chris читает готовые сборки. Каталог <code>uploads</code> общий для разработчиков, но каждый удаляет только свои файлы. Каждая роль получает только нужные ей права — принцип минимальных привилегий из занятия 5.'),
  RAW(ROLES),
  TABLE(['Каталог', 'Владелец и группа', 'Права', 'Что получается'], [
    ['<code>/srv/shop/src</code>', 'root · shop-dev', '<code>2770</code> · <code>drwxrws---</code>', 'разработчики читают и пишут, новые файлы получают группу shop-dev, остальным закрыто'],
    ['<code>/srv/shop/releases</code>', 'root · shop-dev', '<code>2775</code> · <code>drwxrwsr-x</code>', 'разработчики публикуют, все остальные только читают'],
    ['<code>/srv/shop/uploads</code>', 'root · shop-dev', '<code>3770</code> · <code>drwxrws--T</code>', 'разработчики кладут файлы, удалить может только владелец файла'],
  ]),
  P('Файлы, созданные через <code>sudo -u</code>, получают маску вызвавшего пользователя: в Ubuntu это 0002, поэтому новые файлы в <code>src</code> открыты группе на запись. Секретный файл <code>config.env</code> закрывают явно, командой <code>chmod 600</code>.'),
]),
dict(title='Задания', blocks=[
  P('Задания выполняются в учебной виртуальной машине от имени пользователя из группы sudo. Перед началом сделайте снимок состояния виртуальной машины. Выполняйте задания по порядку: каждое следующее использует каталоги и файлы предыдущего.'),
  TABLE(['№', 'Задание', 'Подсказка'], [[str(i), t, h] for i, (t, h) in enumerate(TASKS, 1)]),
  PROBE('Каталоги проекта', [
    ('sudo groupadd shop-dev', ''),
    ('for u in alex bella chris; do sudo useradd -m -s /bin/bash $u; done', 'три учётные записи'),
    ('sudo usermod -aG shop-dev alex', ''),
    ('sudo usermod -aG shop-dev bella', ''),
    ('sudo mkdir -p /srv/shop/{src,releases,uploads}', ''),
    ('sudo chgrp shop-dev /srv/shop/{src,releases,uploads}', ''),
    ('sudo chmod 2770 /srv/shop/src', ''),
    ('sudo chmod 2775 /srv/shop/releases', ''),
    ('sudo chmod 3770 /srv/shop/uploads', ''),
    ('ls -l /srv/shop', ''),
    ('id alex; id bella; id chris', ''),
  ], 'три каталога группы shop-dev с правами <code>drwxrwsr-x</code>, <code>drwxrws---</code> и <code>drwxrws--T</code>; chris не входит в shop-dev.'),
  CORE('12-shop-dirs', 'Каталоги проекта и группы участников эталонного решения.',
    LENS(9, 17, [(11, 0, 10, 1), (12, 0, 10, 2), (13, 0, 10, 3), (17, 32, 51, 4)],
      ['releases: группа пишет, остальные читают', 'src: только группе', 'uploads: sticky — удаляет только владелец файла', 'у chris только личная группа'], cols=80)),
  PROBE('Файлы и тесты доступа', [
    ("sudo -u alex bash -c 'echo \"print(1)\" > /srv/shop/src/app.py'", 'alex создаёт файл'),
    ("echo 'print(2)' | sudo -u bella tee -a /srv/shop/src/app.py", 'bella дописывает'),
    ("sudo -u alex bash -c 'echo TOKEN=lab > /srv/shop/src/config.env; chmod 600 /srv/shop/src/config.env'", 'секрет только для alex'),
    ('sudo -u bella cat /srv/shop/src/config.env', ''),
    ("sudo -u alex bash -c 'echo release-1 > /srv/shop/releases/v1.txt'", 'публикация'),
    ('sudo chown bella /srv/shop/releases/v1.txt', 'передать bella'),
    ('sudo -u chris cat /srv/shop/releases/v1.txt', ''),
    ('sudo -u chris ls /srv/shop/src', ''),
    ('sudo -u bella touch /srv/shop/uploads/photo.jpg', ''),
    ('sudo -u alex rm /srv/shop/uploads/photo.jpg', 'чужой файл в uploads'),
    ('sudo ls -l /srv/shop/src /srv/shop/releases', ''),
  ], 'bella дописала строку в файл alex; config.env ей закрыт; chris читает сборку и не открывает src; alex не удаляет файл bella.'),
  CORE('13-shop-access', 'Тесты доступа: общий файл, закрытый секрет, сборка для аналитика, защищённая загрузка.',
    LENS(0, 24, [(2, 0, 8, 1), (6, 0, 46, 2), (10, 0, 9, 3), (12, 0, 60, 4), (15, 0, 72, 5), (19, 13, 18, 6), (23, 18, 26, 7), (24, 0, 10, 7)],
      ['bella дописала строку: группа shop-dev пишет в app.py', 'config.env с правами 600 закрыт для bella', 'chris читает опубликованную сборку', 'src закрыт для chris', 'sticky-бит: alex не удаляет файл bella', 'v1.txt теперь принадлежит bella', 'app.py — группа shop-dev, config.env — 600'], cols=104)),
]),
dict(title='Проверка результата', blocks=[
  P('Скрипт <code>perms-lab-check.sh</code> проверяет группы, права каталогов, владельцев файлов и доступ от имени каждого пользователя. Пробные файлы, которые он создаёт, скрипт удаляет. Запускается через <code>sudo</code>, потому что проверяет доступ от имени других пользователей.'),
  PROBE('Проверка', [
    ('sudo bash ~/Downloads/perms-lab-check.sh', 'проверка по 14 пунктам'),
  ], 'все пункты <code>OK</code>, итог <code>14 из 14</code>.'),
  CORE('14-shop-check', 'Результат проверки эталонного решения.'),
  STEPS('Уборка после работы', [
    'Проверьте, что лежит в каталогах: <code>sudo ls -R /srv/shop /srv/shared</code>.',
    'Удалите каталоги: <code>sudo rm -r /srv/shop /srv/shared</code>.',
    'Удалите учётные записи с домашними каталогами: <code>for u in alex bella chris; do sudo userdel -r $u; done</code>.',
    'Удалите группу: <code>sudo groupdel shop-dev</code>.',
  ]),
]),
],
summary=[
  'Каталог проекта: группа команды, <code>2770</code> для закрытой работы, <code>2775</code> для публикации, <code>3770</code> для общей папки загрузок.',
  'setgid даёт новым файлам группу проекта, маска 0002 — запись для группы, <code>chmod 600</code> закрывает секреты.',
  'Тесты доступа выполняются от имени каждого пользователя через <code>sudo -u</code>.',
],
report='Снимки каталогов проекта, тестов доступа и проверки 14 из 14.',
bridge='',
)
