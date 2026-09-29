# Слайд 354. Где мы остановились

## Заголовок
Один файл мы уже умеем обрабатывать

## Текст
На прошлом занятии мы построили:

```text
leads_dirty.csv
↓
Power Query
↓
Applied Steps
↓
leads_clean
```

После замены исходных данных достаточно было выполнить:

```text
Refresh
```

Но в реальной работе данные редко приходят одним вечным CSV.

## Визуал
Один CSV → Power Query → Clean Dataset.

Справа появляются ещё несколько CSV.

---

# Слайд 355. Новая проблема

## Заголовок
Теперь файлов стало много

## Текст
Представим, что заявки выгружаются каждый день.

```text
leads_2026-09-23.csv
leads_2026-09-24.csv
leads_2026-09-25.csv
leads_2026-09-26.csv
```

Все файлы описывают одну сущность:

**заявку**.

Нам нужен один общий dataset.

## Визуал

```text
23.csv ─┐
24.csv ─┤
25.csv ─┼→ ?
26.csv ─┘
```

---

# Слайд 356. Плохой вариант

## Заголовок
Не копируем строки вручную

## Текст
Можно открыть четыре файла и руками перенести всё в один Excel.

Но завтра появится:

```text
leads_2026-09-27.csv
```

И процесс придётся повторять.

Это снова ручная операция.

## Визуал
Несколько CSV → Copy → Paste → Excel.

Красный крест.

---

# Слайд 357. Правильная идея

## Заголовок
Источник теперь — папка

## Текст
Вместо подключения к одному файлу подключимся к папке:

```text
incoming/
├── leads_2026-09-23.csv
├── leads_2026-09-24.csv
├── leads_2026-09-25.csv
└── leads_2026-09-26.csv
```

Power Query сможет обработать файлы как единый источник.

## Визуал

```text
FOLDER
↓
POWER QUERY
↓
COMBINED DATASET
```

---

# Слайд 358. Что будем делать

## Заголовок
Маршрут занятия

## Текст

```text
папка с CSV
↓
From Folder
↓
список файлов
↓
Combine Files
↓
единая таблица
↓
справочник источников
↓
Merge Queries
↓
Left Outer Join
↓
обогащённые данные
↓
Left Anti Join
↓
unmatched records
```

## Визуал
Roadmap на весь слайд.

---

# Слайд 359. Подготавливаем структуру

## Заголовок
Рабочая папка занятия

## Текст

```text
lesson_power_query_02/
├── incoming/
│   ├── leads_2026-09-23.csv
│   ├── leads_2026-09-24.csv
│   └── leads_2026-09-25.csv
│
├── lookup/
│   ├── sources_lookup.csv
│   └── statuses_lookup.csv
│
└── result/
```

## Скриншот
Проводник или Explorer VS Code с этой структурой.

---

# Слайд 360. Первый файл

## Заголовок
leads_2026-09-23.csv

## Текст

```csv
request_id,created_at,name,direction,utm_source,utm_medium,utm_campaign,status
REQ-101,2026-09-23 10:15:00,Иван,backend,telegram,social,september,new
REQ-102,2026-09-23 10:42:00,Анна,data,vk,social,september,new
REQ-103,2026-09-23 11:03:00,Мария,frontend,direct,none,not_set,done
```

## Скриншот
CSV в VS Code.

---

# Слайд 361. Второй файл

## Заголовок
leads_2026-09-24.csv

## Текст

```csv
request_id,created_at,name,direction,utm_source,utm_medium,utm_campaign,status
REQ-104,2026-09-24 09:12:00,Олег,backend,telegram,social,september,new
REQ-105,2026-09-24 10:31:00,Ирина,data,email,email,autumn_mail,in_progress
REQ-106,2026-09-24 13:25:00,Петр,frontend,vk,social,september,rejected
```

## Скриншот
Второй CSV.

---

# Слайд 362. Третий файл

## Заголовок
Добавим неизвестный источник

## Текст

```csv
request_id,created_at,name,direction,utm_source,utm_medium,utm_campaign,status
REQ-107,2026-09-25 09:00:00,Алексей,backend,telegram,social,september,new
REQ-108,2026-09-25 11:20:00,Елена,data,tiktok,social,september,new
REQ-109,2026-09-25 15:10:00,Роман,frontend,direct,none,not_set,done
```

Обратите внимание:

```text
utm_source = tiktok
```

Пока ничего с ним не делаем.

## Скриншот
Третий CSV.

## Акцент
Строка с `tiktok`.

---

# Слайд 363. Главное условие Combine Files

## Заголовок
Файлы должны описывать одну структуру

## Текст
У наших CSV одинаковые столбцы:

```text
request_id
created_at
name
direction
utm_source
utm_medium
utm_campaign
status
```

Количество строк может отличаться.

Значения тоже могут отличаться.

Но структура должна быть согласованной.

## Визуал
Три файла с одинаковыми заголовками.

---

# Слайд 364. Schema consistency

## Заголовок
Что значит одинаковая схема

## Текст
Хорошо:

```text
file_1:
request_id | created_at | status

file_2:
request_id | created_at | status
```

Проблемно:

```text
file_3:
id | date | lead_status
```

Power Query должен понимать, какие столбцы соответствуют друг другу.

## Визуал
SAME SCHEMA ✓

DIFFERENT SCHEMA ✕

---

# Слайд 365. Открываем Excel

## Заголовок
Шаг 1. Новая книга

## Текст
Создайте:

```text
power_query_combined.xlsx
```

Откройте:

**Data**

↓

**Get Data**

## Скриншот
Excel → вкладка Data.

---

# Слайд 366. From Folder

## Заголовок
Шаг 2. Подключаемся к папке

## Текст
Выберите:

**Data**

↓

**Get Data**

↓

**From File**

↓

**From Folder**

## Скриншот
Меню Get Data.

## Акцент
From Folder.

---

# Слайд 367. Выбираем incoming

## Заголовок
Шаг 3. Указать папку

## Текст
Выберите:

```text
lesson_power_query_02/incoming
```

Не выбираем отдельный CSV.

Выбираем папку целиком.

## Скриншот
Диалог выбора Folder.

---

# Слайд 368. Power Query показывает не заявки

## Заголовок
Сначала мы видим список файлов

## Текст
После подключения появится таблица примерно с полями:

```text
Content
Name
Extension
Date accessed
Date modified
Date created
Folder Path
```

Это пока метаданные файлов.

## Скриншот
Окно Folder Preview.

---

# Слайд 369. Что такое Content

## Заголовок
Binary — содержимое файла

## Текст
В колонке:

```text
Content
```

можно увидеть:

```text
Binary
```

Это внутреннее представление содержимого каждого файла.

Power Query пока ещё не объединил строки CSV.

## Визуал

```text
Name                     Content
leads_2026-09-23.csv     Binary
leads_2026-09-24.csv     Binary
```

---

# Слайд 370. Проверяем список файлов

## Заголовок
Шаг 4. Не объединяем мусор

## Текст
Убедитесь, что в папке находятся только нужные файлы.

Например:

```text
leads_2026-09-23.csv
leads_2026-09-24.csv
leads_2026-09-25.csv
```

Если рядом лежит:

```text
README.txt
old_backup.xlsx
```

он тоже может попасть в список источников.

## Скриншот
Folder Preview со списком файлов.

---

# Слайд 371. Почему отдельная папка лучше

## Заголовок
Folder Source должен быть предсказуемым

## Текст
Хорошо:

```text
incoming/
только файлы заявок
```

Плохо:

```text
Downloads/
CSV
PDF
ZIP
скриншоты
старые версии
```

Источник должен быть контролируемым.

## Визуал
Dedicated Folder ✓

Downloads ✕

---

# Слайд 372. Transform Data

## Заголовок
Шаг 5. Сначала посмотрим источник

## Текст
Вместо мгновенного:

**Combine & Load**

выберите:

**Transform Data**

Так мы увидим список файлов в Power Query Editor и сможем его проверить.

## Скриншот
Folder Preview.

## Акцент
Transform Data.

---

# Слайд 373. Фильтруем Extension

## Заголовок
Шаг 6. Оставить только CSV

## Текст
В столбце:

```text
Extension
```

оставьте:

```text
.csv
```

Это дополнительная защита от случайных файлов.

## Скриншот
Фильтр Extension.

---

# Слайд 374. Проверяем Folder Path

## Заголовок
Шаг 7. Откуда пришёл файл

## Текст
Посмотрите:

```text
Folder Path
```

Так можно убедиться, что Power Query читает именно нужную директорию.

Позже это особенно полезно при работе с несколькими папками.

## Скриншот
Колонка Folder Path.

---

# Слайд 375. Теперь объединяем

## Заголовок
Шаг 8. Combine Files

## Текст
Найдите кнопку объединения в колонке:

```text
Content
```

или используйте команду:

**Combine Files**

Power Query попросит выбрать пример файла.

## Скриншот
Кнопка Combine Files возле Content.

---

# Слайд 376. Зачем нужен Sample File

## Заголовок
Power Query должен понять структуру

## Текст
Для настройки объединения Power Query берёт один файл как пример.

Например:

```text
leads_2026-09-23.csv
```

По нему определяется:

разделитель;

кодировка;

структура;

названия столбцов.

Затем та же логика применяется к остальным файлам.

## Визуал

```text
Sample File
↓
Transformation Rules
↓
All Files
```

---

# Слайд 377. Combine Files dialog

## Заголовок
Шаг 9. Проверяем Sample File

## Текст
В окне Combine Files проверьте:

**Sample File**

**File Origin**

**Delimiter**

**Data Type Detection**

Для нашего CSV:

```text
Delimiter = Comma
```

## Скриншот
Combine Files dialog.

---

# Слайд 378. Нажимаем OK

## Заголовок
Шаг 10. Power Query строит объединение

## Текст
После подтверждения Power Query автоматически создаст несколько вспомогательных Queries.

Не пугайтесь количества новых элементов.

## Скриншот
Queries pane сразу после Combine.

---

# Слайд 379. Почему запросов стало больше

## Заголовок
Helper Queries

## Текст
Power Query может создать:

```text
Sample File
Parameter
Transform File
Transform Sample File
```

и основной итоговый запрос.

Эти запросы работают вместе.

## Скриншот
Queries pane.

## Акцент
Helper Queries.

---

# Слайд 380. Что делает Transform File

## Заголовок
Одна логика применяется ко всем файлам

## Текст
Упрощённо:

```text
Файл 1 → Transform File
Файл 2 → Transform File
Файл 3 → Transform File
```

После этого результаты складываются в одну таблицу.

## Визуал

```text
CSV 1 ─┐
CSV 2 ─┼→ SAME TRANSFORM → COMBINED
CSV 3 ─┘
```

---

# Слайд 381. Итоговый Query

## Заголовок
Шаг 11. Переименовать результат

## Текст
Основной запрос переименуйте:

```text
leads_combined
```

Он должен содержать строки сразу из всех файлов.

## Скриншот
Query Settings → Name.

---

# Слайд 382. Сколько должно быть строк

## Заголовок
Первичная проверка

## Текст
У нас было:

```text
3 файла
×
3 заявки
=
9 строк
```

После Combine ожидаем:

```text
9 записей
```

Если строк меньше или больше — уже нужно выяснять причину.

## Визуал

```text
3 + 3 + 3 = 9
```

---

# Слайд 383. Source.Name

## Заголовок
Не спешим удалять имя файла

## Текст
После Combine Power Query часто сохраняет имя исходного файла.

Например:

```text
Source.Name
```

Это полезное техническое поле.

Оно позволяет понять:

**из какого файла пришла конкретная заявка.**

## Скриншот
Колонка Source.Name.

---

# Слайд 384. Data lineage

## Заголовок
Откуда появилась эта строка?

## Текст
Например:

```text
REQ-105
```

пришла из:

```text
leads_2026-09-24.csv
```

Такую информацию называют происхождением данных:

**data lineage**.

## Визуал

```text
REQ-105
↓
leads_2026-09-24.csv
```

---

# Слайд 385. Не удаляем технические поля без причины

## Заголовок
Иногда источник нужен для диагностики

## Текст
Если завтра студент спросит:

> Почему эта заявка появилась дважды?

Первый полезный вопрос:

> Из какого файла пришла каждая строка?

Поэтому `Source.Name` пока оставляем.

## Визуал
Duplicate → Source.Name → investigation.

---

# Слайд 386. Добавляем новый файл

## Заголовок
Шаг 12. Проверяем автоматическое расширение

## Текст
Скопируйте в `incoming` ещё один файл:

```text
leads_2026-09-26.csv
```

с той же структурой.

Например, ещё три заявки.

## Скриншот
Папка с четырьмя CSV.

---

# Слайд 387. Ничего не импортируем заново

## Заголовок
Folder Source уже знает папку

## Текст
Не создаём новый Query.

Не нажимаем From Text/CSV.

Не копируем строки.

В Excel используем:

**Data → Refresh All**

## Скриншот
Refresh All.

---

# Слайд 388. Проверяем результат

## Заголовок
Шаг 13. Новый файл вошёл автоматически

## Текст
Было:

```text
9 строк
```

Добавили ещё:

```text
3 строки
```

Ожидаемый результат:

```text
12 строк
```

## Скриншот
`leads_combined` после Refresh.

---

# Слайд 389. Вот зачем нужен Folder Source

## Заголовок
Папка стала источником данных

## Текст

```text
NEW CSV
↓
кладём в incoming
↓
Refresh
↓
Power Query обрабатывает файл
↓
строки появляются в общем dataset
```

## Визуал
Папка → Refresh → Dataset.

---

# Слайд 390. Combine и Append

## Заголовок
Что сейчас произошло концептуально

## Текст
Мы добавили строки нескольких одинаковых таблиц друг под другом.

Это логика:

**Append**

Пример:

```text
Table A
REQ-1
REQ-2

+

Table B
REQ-3
REQ-4

=

REQ-1
REQ-2
REQ-3
REQ-4
```

## Визуал
Две вертикальные таблицы → одна длинная.

---

# Слайд 391. Append не добавляет новые свойства

## Заголовок
Append = больше строк

## Текст
Главный вопрос Append:

**«Есть ещё записи той же структуры?»**

Он увеличивает количество строк.

```text
3 заявки
+
3 заявки
=
6 заявок
```

## Визуал
ROWS ↓↓↓

---

# Слайд 392. Но теперь нужна другая операция

## Заголовок
Мы хотим узнать больше о каждой строке

## Текст
В `leads_combined` есть:

```text
utm_source = telegram
```

Но хотелось бы получить ещё:

```text
source_name = Telegram
channel_group = social
```

Эти данные хранятся в отдельном справочнике.

## Визуал

```text
telegram
↓
?
↓
Telegram / social
```

---

# Слайд 393. Что такое lookup table

## Заголовок
Справочник значений

## Текст
Lookup table хранит соответствия.

Например:

```text
source     source_name     channel_group
telegram   Telegram        social
vk         VK              social
email      Email           email
direct     Direct          direct
```

## Визуал
Небольшая справочная таблица.

---

# Слайд 394. sources_lookup.csv

## Заголовок
Подготавливаем справочник источников

## Текст

```csv
source,source_name,channel_group
telegram,Telegram,social
vk,VK,social
email,Email,email
direct,Direct,direct
```

Обратите внимание:

```text
tiktok
```

здесь отсутствует.

## Скриншот
`sources_lookup.csv` в VS Code.

---

# Слайд 395. Почему tiktok отсутствует специально

## Заголовок
Нам нужна ошибка справочника

## Текст
В заявках существует:

```text
utm_source = tiktok
```

Но в lookup его нет.

Так мы проверим, умеем ли обнаруживать значение, для которого не существует соответствия.

## Визуал

```text
LEADS: tiktok
LOOKUP: ?
```

---

# Слайд 396. Импортируем справочник

## Заголовок
Шаг 14. From Text/CSV

## Текст
В Excel:

**Data**

↓

**Get Data**

↓

**From File**

↓

**From Text/CSV**

Выберите:

```text
lookup/sources_lookup.csv
```

## Скриншот
Import sources_lookup.csv.

---

# Слайд 397. Transform Data

## Заголовок
Шаг 15. Создаём Query

## Текст
Выберите:

**Transform Data**

Проверьте типы.

Назовите Query:

```text
sources_lookup
```

## Скриншот
Power Query Editor со справочником.

---

# Слайд 398. Теперь у нас две таблицы

## Заголовок
Что хотим связать

## Текст
Основная:

```text
leads_combined
```

Ключ:

```text
utm_source
```

Справочник:

```text
sources_lookup
```

Ключ:

```text
source
```

## Визуал

```text
leads_combined.utm_source
          ↓
       MATCH
          ↓
sources_lookup.source
```

---

# Слайд 399. Это уже не Append

## Заголовок
Теперь нужен Merge

## Текст
Append отвечает:

> Добавить ещё строки?

Merge отвечает:

> Найти связанную информацию по ключу?

Нам нужен:

**Merge Queries**

## Визуал
APPEND = rows.

MERGE = columns.

---

# Слайд 400. Append vs Merge

## Заголовок
Не путайте две операции

## Текст
**Append**

```text
Table A
+
Table B
↓
больше строк
```

**Merge**

```text
Table A
+
Lookup Table
↓
больше информации о строках
```

## Визуал
Две схемы рядом.

---

# Слайд 401. Merge Queries

## Заголовок
Шаг 16. Начинаем соединение

## Текст
Откройте:

```text
leads_combined
```

Далее:

**Home**

↓

**Merge Queries**

Для начала выполняем merge в текущий Query.

## Скриншот
Home → Merge Queries.

---

# Слайд 402. Выбираем вторую таблицу

## Заголовок
Шаг 17. sources_lookup

## Текст
В верхней таблице:

```text
leads_combined
```

выберите:

```text
utm_source
```

Во второй:

```text
sources_lookup
```

выберите:

```text
source
```

## Скриншот
Merge dialog с выбранными столбцами.

---

# Слайд 403. Join Kind

## Заголовок
Как именно соединить таблицы?

## Текст
В Merge появляется параметр:

**Join Kind**

Он определяет, какие строки попадут в результат.

Для нашей основной таблицы сначала используем:

```text
Left Outer
```

## Скриншот
Join Kind dropdown.

---

# Слайд 404. Left Outer

## Заголовок
Сохраняем все заявки

## Текст
Left Outer означает:

**все строки из левой таблицы**

+

**совпавшие данные из правой**

То есть:

```text
все заявки
+
данные справочника, если соответствие найдено
```

## Визуал

```text
LEADS — сохраняем все
LOOKUP — берём совпадения
```

---

# Слайд 405. Почему не Inner Join

## Заголовок
Inner Join может скрыть проблему

## Текст
Inner Join оставляет только строки, где найдено соответствие.

Если:

```text
tiktok
```

нет в справочнике, такая заявка может исчезнуть из результата.

Для основного dataset это опасно.

## Визуал

```text
tiktok
↓
NO MATCH
↓
INNER JOIN
↓
ROW LOST
```

---

# Слайд 406. Главный принцип

## Заголовок
Не теряем заявку из-за плохого справочника

## Текст
Заявка существует независимо от того, знаем ли мы её источник.

Поэтому сначала:

```text
Left Outer
```

Сохраняем строку.

А отсутствие справочника диагностируем отдельно.

## Визуал

```text
REQ-108 | tiktok | null
```

лучше, чем:

```text
REQ-108 исчез
```

---

# Слайд 407. Выполняем Merge

## Заголовок
Шаг 18. Left Outer

## Текст
Выберите:

```text
Left Outer
```

Нажмите:

**OK**

В таблице появится новый столбец:

```text
sources_lookup
```

## Скриншот
Результат Merge.

---

# Слайд 408. Почему в ячейках написано Table

## Заголовок
Merge ещё не развернул данные

## Текст
В новом столбце можно увидеть:

```text
Table
```

Внутри находится найденная строка справочника.

Нужно выбрать, какие поля добавить в основную таблицу.

## Скриншот
Столбец sources_lookup со значениями Table.

---

# Слайд 409. Expand

## Заголовок
Шаг 19. Разворачиваем справочник

## Текст
Нажмите значок Expand в заголовке:

```text
sources_lookup
```

Выберите:

```text
source_name
channel_group
```

Сам `source` повторно добавлять не нужно.

## Скриншот
Expand dialog.

---

# Слайд 410. Убираем prefix

## Заголовок
Шаг 20. Понятные названия

## Текст
При необходимости снимите:

**Use original column name as prefix**

Чтобы получить:

```text
source_name
channel_group
```

вместо длинных названий:

```text
sources_lookup.source_name
```

## Скриншот
Expand dialog.

---

# Слайд 411. Результат Merge

## Заголовок
Данные стали богаче

## Текст
Было:

```text
utm_source = telegram
```

Стало:

```text
utm_source = telegram
source_name = Telegram
channel_group = social
```

## Визуал
BEFORE → AFTER.

---

# Слайд 412. А что произошло с tiktok?

## Заголовок
Справочник не нашёл значение

## Текст
Для:

```text
utm_source = tiktok
```

получаем:

```text
source_name = null
channel_group = null
```

Заявка осталась.

Но отсутствие соответствия стало заметно.

## Скриншот
Строка `tiktok` с `null`.

---

# Слайд 413. Null здесь — полезный сигнал

## Заголовок
Это не просто пустая ячейка

## Текст

```text
null
```

сообщает:

> В справочнике не найдено соответствие.

Теперь можно отдельно собрать такие записи.

## Визуал

```text
tiktok
↓
lookup
↓
NO MATCH
↓
null
```

---

# Слайд 414. Можно фильтровать null

## Заголовок
Первый способ найти проблему

## Текст
Откройте фильтр:

```text
source_name
```

и оставьте только:

```text
null
```

Мы увидим заявки с неизвестным источником.

## Скриншот
Фильтр по null.

---

# Слайд 415. Но основной Query не портим

## Заголовок
Нам нужен отдельный отчёт проблем

## Текст
Не хотим превращать:

```text
leads_combined
```

в таблицу только ошибок.

Создадим отдельный Query.

## Визуал

```text
leads_combined
├→ основной dataset
└→ unmatched_sources
```

---

# Слайд 416. Merge Queries as New

## Заголовок
Шаг 21. Отдельный Query

## Текст
Откройте:

**Home**

↓

**Merge Queries**

↓

**Merge Queries as New**

Теперь результат соединения появится как отдельный Query.

## Скриншот
Merge Queries as New.

---

# Слайд 417. Left Anti Join

## Заголовок
Найти только несовпавшие строки

## Текст
Используем:

```text
Left Anti
```

Он возвращает строки из левой таблицы, для которых **нет соответствия** в правой.

Для нас:

```text
заявки, источник которых отсутствует в sources_lookup
```

## Визуал

```text
LEADS
MINUS
MATCHED SOURCES
=
UNMATCHED
```

---

# Слайд 418. Настраиваем Left Anti

## Заголовок
Шаг 22. Ищем неизвестные источники

## Текст
Первая таблица:

```text
leads_combined
```

Поле:

```text
utm_source
```

Вторая:

```text
sources_lookup
```

Поле:

```text
source
```

Join Kind:

```text
Left Anti
```

## Скриншот
Merge dialog.

---

# Слайд 419. Получаем unmatched_sources

## Заголовок
Шаг 23. Переименовать Query

## Текст
Назовите результат:

```text
unmatched_sources
```

В нём должна остаться заявка:

```text
REQ-108
utm_source = tiktok
```

## Скриншот
Query `unmatched_sources`.

---

# Слайд 420. Вот зачем нужен Left Anti

## Заголовок
Мы не потеряли проблему

## Текст
Теперь существуют:

```text
leads_combined
```

все заявки

и:

```text
unmatched_sources
```

только заявки, которые не удалось сопоставить со справочником.

## Визуал

```text
ALL DATA
├→ MAIN DATASET
└→ UNMATCHED REPORT
```

---

# Слайд 421. Как исправить проблему

## Заголовок
Не переписываем заявку

## Текст
Проблема не в:

```text
REQ-108
```

Проблема в справочнике.

Если `tiktok` является допустимым источником, добавляем его в:

```text
sources_lookup.csv
```

Например:

```csv
tiktok,TikTok,social
```

## Визуал
Lookup table + новая строка.

---

# Слайд 422. Refresh после обновления справочника

## Заголовок
Шаг 24. Проверяем исправление

## Текст
Сохраните:

```text
sources_lookup.csv
```

В Excel:

**Data → Refresh All**

После обновления:

```text
REQ-108
```

должен получить:

```text
source_name = TikTok
channel_group = social
```

## Скриншот
REQ-108 после Refresh.

---

# Слайд 423. Что станет с unmatched_sources

## Заголовок
Проблема должна исчезнуть

## Текст
После добавления `tiktok` в справочник и Refresh:

```text
unmatched_sources
```

должен стать пустым.

Это хороший результат.

Пустой error-report означает:

**неизвестных источников сейчас нет.**

## Скриншот
Пустой unmatched_sources.

---

# Слайд 424. Второй справочник

## Заголовок
Status тоже можно обогатить

## Текст
Создадим:

```text
statuses_lookup.csv
```

Например:

```csv
status,status_order,is_final
new,1,false
in_progress,2,false
done,3,true
rejected,4,true
```

## Скриншот
CSV справочника статусов.

---

# Слайд 425. Зачем status_order

## Заголовок
Текстовый статус имеет порядок процесса

## Текст
Алфавитная сортировка:

```text
done
in_progress
new
rejected
```

не отражает жизненный цикл заявки.

Поэтому справочник задаёт:

```text
new = 1
in_progress = 2
done = 3
rejected = 4
```

## Визуал
1 → 2 → 3.

Отдельная ветка 4.

---

# Слайд 426. is_final

## Заголовок
Справочник может хранить бизнес-свойства

## Текст
Например:

```text
new          → false
in_progress  → false
done         → true
rejected     → true
```

Теперь не нужно в каждом отчёте заново решать:

> Какие статусы считаются закрытыми?

## Визуал
Status → is_final.

---

# Слайд 427. Импортируем statuses_lookup

## Заголовок
Шаг 25. Второй lookup Query

## Текст
Через:

**Data → Get Data → From Text/CSV**

импортируйте:

```text
statuses_lookup.csv
```

Назовите Query:

```text
statuses_lookup
```

## Скриншот
Query statuses_lookup.

---

# Слайд 428. Merge по status

## Заголовок
Шаг 26. Второе обогащение

## Текст
В:

```text
leads_combined
```

выполните Merge:

```text
status
```

с:

```text
statuses_lookup.status
```

Join:

```text
Left Outer
```

## Скриншот
Merge dialog.

---

# Слайд 429. Expand status fields

## Заголовок
Шаг 27. Добавляем свойства статуса

## Текст
Разверните:

```text
status_order
is_final
```

Теперь каждая заявка содержит информацию о стадии процесса.

## Скриншот
Результат Expand.

---

# Слайд 430. Итоговая структура

## Заголовок
Что теперь находится в dataset

## Текст
Исходные поля:

```text
request_id
created_at
direction
utm_source
status
```

Дополнительные:

```text
Source.Name
source_name
channel_group
status_order
is_final
```

## Визуал
ORIGINAL + ENRICHED.

---

# Слайд 431. Merge не должен менять исходный смысл

## Заголовок
Lookup только добавляет контекст

## Текст
Мы не заменяем:

```text
utm_source
```

на красивое название.

Сохраняем техническое значение:

```text
telegram
```

и отдельно добавляем:

```text
source_name = Telegram
```

Это полезнее для дальнейшей автоматизации.

## Визуал
Technical key + Human-readable label.

---

# Слайд 432. Типы Join

## Заголовок
Какие варианты вообще существуют

## Текст
Power Query поддерживает несколько типов соединений.

На этой теме важно понимать:

**Left Outer**

все слева + совпадения справа.

**Inner**

только совпавшие.

**Left Anti**

только несовпавшие слева.

Остальные типы пока достаточно узнавать по назначению.

## Визуал
Три схемы Венна или три простые таблицы.

---

# Слайд 433. Когда нужен Left Outer

## Заголовок
Основной dataset

## Текст
Используем, когда главная таблица важнее справочника.

Например:

```text
все заявки
+
информация об источнике
```

Заявка не должна исчезнуть из-за отсутствующего lookup.

## Визуал
Leads LEFT → Lookup RIGHT.

---

# Слайд 434. Когда нужен Inner

## Заголовок
Только подтверждённые соответствия

## Текст
Inner Join полезен, когда нужны исключительно записи, присутствующие в обеих таблицах.

Но применять его необходимо осознанно.

Иначе несовпавшие строки просто не попадут в результат.

## Визуал
Only matches.

---

# Слайд 435. Когда нужен Left Anti

## Заголовок
Поиск проблем

## Текст
Left Anti удобен для вопросов:

```text
Какие источники неизвестны?
```

```text
Какие ID отсутствуют во второй системе?
```

```text
Какие записи не нашли справочник?
```

## Визуал
LEFT — MATCHED = UNMATCHED.

---

# Слайд 436. Append и Merge ещё раз

## Заголовок
Два ключевых действия Power Query

## Текст
**Append / Combine**

```text
ещё строки
```

Например:

дневные CSV.

**Merge**

```text
ещё свойства
```

Например:

заявки + справочник источников.

## Визуал

```text
APPEND ↓ rows

MERGE → columns
```

---

# Слайд 437. Что произойдёт завтра

## Заголовок
Новый день — новый CSV

## Текст
Появляется:

```text
leads_2026-09-27.csv
```

Мы:

1. кладём его в `incoming`;
2. нажимаем Refresh.

Не нужно:

импортировать файл отдельно;

делать Append вручную;

повторять Merge.

## Визуал
New File → Folder → Refresh.

---

# Слайд 438. Почему Merge тоже повторится

## Заголовок
Merge — это Applied Step

## Текст
Наши действия:

```text
Combine
Merge sources
Expand sources
Merge statuses
Expand statuses
```

являются частью Query.

При Refresh они выполняются снова на новых строках.

## Скриншот
Applied Steps итогового Query.

---

# Слайд 439. Проверяем новый файл

## Заголовок
Шаг 28. Добавить ещё одну заявку

## Текст
В новом CSV добавьте:

```text
REQ-120
utm_source = email
status = in_progress
```

После Refresh должны автоматически появиться:

```text
source_name = Email
channel_group = email
status_order = 2
is_final = false
```

## Скриншот
Строка после Refresh.

---

# Слайд 440. Проверяем неизвестный lookup

## Заголовок
Шаг 29. Сломать справочник

## Текст
Добавьте во входной CSV:

```text
utm_source = youtube
```

Не добавляйте `youtube` в:

```text
sources_lookup.csv
```

Выполните Refresh.

## Скриншот
Входная строка youtube.

---

# Слайд 441. Что ожидаем

## Заголовок
Главный контроль занятия

## Текст
В основном dataset:

```text
REQ-...
utm_source = youtube
source_name = null
```

А в:

```text
unmatched_sources
```

должна появиться эта же заявка.

## Скриншот
Основной dataset + unmatched_sources.

---

# Слайд 442. Мы не потеряли строку

## Заголовок
Это принципиально важно

## Текст
Плохой вариант:

```text
не нашли source
↓
удалили заявку
```

Наш вариант:

```text
не нашли source
↓
сохранили заявку
+
зафиксировали проблему
```

## Визуал
DELETE ✕

KEEP + FLAG ✓

---

# Слайд 443. А что если структура нового CSV отличается?

## Заголовок
Folder Source требует дисциплины

## Текст
Представим новый файл:

```text
lead_id
date
traffic_source
```

вместо:

```text
request_id
created_at
utm_source
```

Power Query больше не получает ожидаемую схему.

## Визуал
Expected Schema / Actual Schema.

---

# Слайд 444. Schema drift

## Заголовок
Структура источника изменилась

## Текст
Изменение:

названия поля;

типа;

количества столбцов;

формата файла

может нарушить pipeline.

Это пример:

**schema drift**.

## Визуал
Schema v1 → Schema v2 → Query?.

---

# Слайд 445. Почему sample file важен

## Заголовок
Combine строится вокруг ожидаемой структуры

## Текст
Power Query использует пример файла, чтобы определить правила обработки остальных файлов.

Поэтому новый файл должен быть совместим с этой схемой.

## Визуал

```text
SAMPLE FILE
↓
EXPECTED STRUCTURE
↓
ALL FILES
```

---

# Слайд 446. Не исправляем несовместимый файл молча

## Заголовок
Нужно понять причину

## Текст
Если один файл перестал соответствовать контракту:

не переименовываем всё наугад;

не удаляем проблемный файл молча;

не скрываем ошибку.

Сначала фиксируем:

**какое изменение нарушило контракт.**

## Визуал
Breaking Change → Investigation.

---

# Слайд 447. Query Dependencies

## Заголовок
У нас уже появилась настоящая система запросов

## Текст
Теперь Queries связаны между собой:

```text
Folder
↓
leads_combined
├→ sources_lookup
├→ statuses_lookup
└→ unmatched_sources
```

Power Query позволяет посмотреть зависимости запросов.

## Скриншот
View → Query Dependencies.

---

# Слайд 448. Открываем Query Dependencies

## Заголовок
Шаг 30. Посмотреть архитектуру

## Текст
В Power Query Editor откройте:

**View**

↓

**Query Dependencies**

Посмотрите, какие источники и Queries связаны между собой.

## Скриншот
Query Dependencies diagram.

---

# Слайд 449. Это уже небольшой data pipeline

## Заголовок
Не просто Excel-таблица

## Текст

```text
DAILY CSV FILES
↓
FOLDER SOURCE
↓
COMBINE
↓
MERGE LOOKUPS
↓
ENRICHED DATASET
↓
UNMATCHED REPORT
```

Мы построили небольшой воспроизводимый pipeline подготовки данных.

## Визуал
Архитектура на весь экран.

---

# Слайд 450. Что сдаёт студент

## Заголовок
Результат практики

## Текст
Должны существовать:

```text
power_query_combined.xlsx
```

Queries:

```text
leads_combined
sources_lookup
statuses_lookup
unmatched_sources
```

и папка:

```text
incoming/
```

с несколькими CSV.

## Визуал
Артефакты с галочками.

---

# Слайд 451. Что необходимо проверить

## Заголовок
Контроль результата

## Текст
Студент должен доказать:

1. три CSV объединяются;
2. новый CSV входит после Refresh;
3. source lookup обогащает данные;
4. status lookup обогащает данные;
5. неизвестный source не удаляет заявку;
6. неизвестный source появляется в `unmatched_sources`;
7. после обновления справочника проблема исчезает.

## Визуал
Checklist.

---

# Слайд 452. Контрольные скриншоты

## Заголовок
Что необходимо сохранить

## Текст
Сделайте скриншоты:

1. папки `incoming`;
2. одинаковых заголовков нескольких CSV;
3. `Data → Get Data → From Folder`;
4. Folder Preview;
5. списка CSV в Power Query;
6. фильтра `.csv`;
7. Combine Files;
8. Sample File dialog;
9. Helper Queries;
10. итогового `leads_combined`;
11. `Source.Name`;
12. результата после добавления нового CSV;
13. `sources_lookup`;
14. Merge dialog;
15. Left Outer;
16. Expand lookup;
17. строки `tiktok` с `null`;
18. Left Anti;
19. `unmatched_sources`;
20. результата после добавления `tiktok` в справочник;
21. `statuses_lookup`;
22. Query Dependencies.

## Визуал
Checklist.

---

# Слайд 453. Что студент должен объяснить

## Заголовок
Не просто повторить интерфейс

## Текст
Необходимо понимать:

что такое Folder Source;

зачем файлам одинаковая схема;

что делает Combine Files;

зачем нужен Sample File;

что такое Append;

чем Append отличается от Merge;

что такое lookup table;

что такое key;

что делает Left Outer;

почему Inner может потерять строки;

зачем нужен Left Anti;

что такое unmatched record;

что такое schema drift.

## Визуал
Concept map.

---

# Слайд 454. Append

## Заголовок
Одна фраза для запоминания

## Текст
**Append**

отвечает на вопрос:

> Где взять ещё строки такого же типа?

Пример:

```text
понедельник
+
вторник
+
среда
=
заявки за три дня
```

## Визуал
Вертикальное сложение таблиц.

---

# Слайд 455. Merge

## Заголовок
Одна фраза для запоминания

## Текст
**Merge**

отвечает на вопрос:

> Какие дополнительные данные связаны с этой строкой?

Пример:

```text
utm_source = telegram
+
sources_lookup
=
channel_group = social
```

## Визуал
Горизонтальное расширение строки.

---

# Слайд 456. Главный результат занятия

## Заголовок
Мы перестали собирать файлы руками

## Текст

```text
NEW FILE
↓
FOLDER
↓
REFRESH
↓
COMBINE
↓
MERGE
↓
READY DATA
```

Новые файлы проходят через уже созданную логику.

## Визуал
Большая схема Refresh pipeline.

---

# Слайд 457. Но появилась новая проблема

## Заголовок
Объединить данные ещё не значит доверять им

## Текст
В общей таблице всё ещё могут быть:

```text
duplicate request_id
null в обязательном поле
неизвестный status
ошибка даты
потерянная строка
```

Поэтому следующий вопрос:

**можем ли мы доказать качество результата?**

## Визуал

```text
COMBINED DATA ✓
TRUSTED DATA ?
```

---

# Слайд 458. Следующая тема

## Заголовок
Power Query: контроль качества данных

## Текст
На следующем занятии построим:

```text
Column Quality
Duplicate Check
Required Fields
Error Query
Unknown Status
Quality Flags
Row Count Reconciliation
Refresh Order
```

И разделим данные на:

```text
VALID
```

и:

```text
PROBLEM RECORDS
```

## Визуал

```text
COMBINED DATA
↓
QUALITY CONTROL
├→ VALID
└→ ERRORS
```