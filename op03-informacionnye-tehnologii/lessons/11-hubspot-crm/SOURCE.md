# Слайд 735. Где мы остановились

## Заголовок
Мы видим весь путь до заявки

## Текст
Сейчас система выглядит так:

```text
Instagram
↓
ManyChat
↓
UTM
↓
Website
├→ GA4
│   ↓
│ Data Studio
│
└→ Form
    ↓
Google Sheets
    ↓
Power Query
```

Мы умеем:

собирать заявку;

определять источник;

анализировать трафик;

очищать данные;

строить dashboard.

Но появляется следующий вопрос.

## Визуал
Вся архитектура курса.

Справа:

**Кто теперь работает с заявкой?**

---

# Слайд 736. Google Sheets начинает мешать

## Заголовок
Таблица хорошо хранит строки

## Текст
Сейчас заявка выглядит примерно так:

```text
REQ-A81C4B92
2026-10-08
Иван Тестов
student@example.com
backend
instagram
backend_guide
new
```

Для 10 заявок этого достаточно.

А если их:

```text
100?
1 000?
10 000?
```

## Визуал
Google Sheet постепенно увеличивается.

---

# Слайд 737. Новые вопросы

## Заголовок
Одного status становится мало

## Текст
Нам понадобится понимать:

кто обрабатывает заявку;

связывались ли уже с человеком;

что ему написали;

какой следующий шаг;

когда нужно связаться снова;

почему заявка закрыта;

какие ещё заявки оставлял этот человек.

## Визуал
Одна строка Google Sheets → множество связанных сущностей.

---

# Слайд 738. Можно добавить ещё 20 столбцов

## Заголовок
Но получится таблица, изображающая CRM

## Текст

```text
request_id
status
owner
next_action
last_contact
comment
phone
result
...
```

Технически это возможно.

Но постепенно таблица становится неудобной системой управления процессом.

## Визуал
Очень широкая таблица с горизонтальным scroll.

---

# Слайд 739. Следующий инструмент

## Заголовок
CRM

## Текст
CRM — система для хранения информации о взаимодействиях с людьми и управления процессом работы с ними.

В нашем случае:

```text
человек
+
его заявка
+
текущий этап
+
действия
+
история
```

## Визуал

```text
CONTACT
   ↓
  DEAL
   ↓
PIPELINE
```

---

# Слайд 740. Что используем

## Заголовок
HubSpot CRM

## Текст
Для учебного стенда используем:

**HubSpot CRM**

Нам нужны только базовые возможности:

```text
Contacts
Deals
Properties
Pipeline
Stages
Import
Associations
Tasks
Activities
```

Не изучаем всю платформу HubSpot.

## Визуал
HubSpot → выделены только нужные компоненты.

---

# Слайд 741. Почему HubSpot

## Заголовок
Нам нужен настоящий CRM-интерфейс

## Текст
На бесплатном стенде доступны базовые CRM-возможности:

контакты;

сделки;

задачи;

импорт;

pipeline management;

работа с CRM records.

Этого достаточно для лабораторной работы.

## Визуал
LAB CRM ✓

Enterprise Sales Platform ✕

---

# Слайд 742. Главная мысль темы

## Заголовок
Заявка и человек — не одно и то же

## Текст
Сейчас в Google Sheets одна строка содержит всё сразу:

```text
Иван Тестов
student@example.com
REQ-001
backend
new
```

В CRM мы разделим данные на сущности.

## Визуал
Одна строка → два объекта.

---

# Слайд 743. Contact

## Заголовок
Contact = человек

## Текст
Contact содержит сведения о человеке.

Например:

```text
First name = Иван
Last name = Тестов
Email = student@example.com
```

Это человек.

Не конкретная заявка.

## Визуал
Карточка CONTACT.

---

# Слайд 744. Deal

## Заголовок
Deal = конкретный процесс / заявка

## Текст
Например:

```text
Deal name:
Заявка REQ-001

Direction:
backend

Source:
instagram

Campaign:
backend_guide

Stage:
New application
```

Это уже не человек.

Это конкретная заявка.

## Визуал
Карточка DEAL.

---

# Слайд 745. Почему нельзя хранить request_id у Contact

## Заголовок
Один человек может обратиться несколько раз

## Текст
Представим:

```text
Иван Тестов
student@example.com
```

оставил:

```text
REQ-001 → backend
```

а через месяц:

```text
REQ-194 → data
```

Contact один.

Deals два.

## Визуал

```text
CONTACT
Иван
├→ REQ-001
└→ REQ-194
```

---

# Слайд 746. Правильная модель

## Заголовок
Contact 1 → N Deals

## Текст

```text
CONTACT
student@example.com
       │
       ├── DEAL REQ-001
       │
       └── DEAL REQ-194
```

Поэтому:

```text
email
```

описывает Contact.

А:

```text
request_id
utm_source
utm_campaign
direction
status
```

описывают Deal.

## Визуал
ER-like diagram.

---

# Слайд 747. Association

## Заголовок
Как CRM связывает объекты

## Текст
Связь:

```text
Contact
↔
Deal
```

называется:

**Association**

Она позволяет открыть человека и увидеть связанные сделки.

И наоборот.

## Визуал
CONTACT ↔ DEAL.

---

# Слайд 748. Другие CRM Objects

## Заголовок
CRM может хранить не только людей и сделки

## Текст
В HubSpot существуют разные объекты.

Например:

```text
Contacts
Companies
Deals
Tickets
```

Но сегодня работаем только с:

```text
Contact
Deal
```

## Визуал
Contacts + Deals выделены, остальные затемнены.

---

# Слайд 749. Property

## Заголовок
Поле внутри CRM-объекта

## Текст
Например Contact имеет properties:

```text
First name
Last name
Email
```

Deal:

```text
Deal name
Deal stage
Amount
Close date
```

Property примерно соответствует столбцу нашей таблицы.

## Визуал

```text
CSV COLUMN
≈
CRM PROPERTY
```

---

# Слайд 750. Record

## Заголовок
Конкретный экземпляр объекта

## Текст
Например:

```text
Contact
Иван Тестов
```

— это Contact Record.

А:

```text
Deal
Заявка REQ-001
```

— Deal Record.

## Визуал
OBJECT → RECORDS.

---

# Слайд 751. Pipeline

## Заголовок
Процесс движения Deal

## Текст
Pipeline показывает этапы процесса.

Например:

```text
New application
↓
In progress
↓
Contacted
↓
Done
```

или:

```text
Rejected
```

## Визуал
Kanban pipeline.

---

# Слайд 752. Stage

## Заголовок
Где находится конкретная заявка

## Текст
Pipeline — весь процесс.

Stage — текущая точка конкретного Deal.

Например:

```text
Pipeline:
Applications

Deal:
REQ-001

Stage:
In progress
```

## Визуал
Pipeline с выделенной карточкой.

---

# Слайд 753. Status из Sheets и Stage в CRM

## Заголовок
Переносим нашу старую модель

## Текст
Было:

```text
new
in_progress
done
rejected
```

Станет:

```text
New application
In progress
Done
Rejected
```

`status` превращается в часть бизнес-процесса.

## Визуал
Sheets Status → CRM Stage.

---

# Слайд 754. Что построим сегодня

## Заголовок
Маршрут занятия

## Текст

```text
HubSpot Account
↓
Contact / Deal
↓
Custom Properties
↓
Pipeline
↓
Prepare CSV
↓
Import
↓
Field Mapping
↓
Associations
↓
Board View
↓
Move Deal
↓
Task / Note
```

## Визуал
Roadmap.

---

# Слайд 755. Создаём HubSpot Account

## Заголовок
Шаг 1. HubSpot

## Текст
Откройте:

**hubspot.com**

Создайте бесплатный учебный аккаунт.

Используйте учебные данные.

Не импортируйте реальные клиентские базы.

## Скриншот
Стартовая страница HubSpot CRM.

---

# Слайд 756. Free CRM достаточно

## Заголовок
Нам не нужны платные функции

## Текст
Для занятия достаточно:

```text
Contacts
Deals
Properties
Import
Pipeline
Board
Tasks
Activities
```

Не подключаем платную подписку ради лаборатории.

## Визуал
FREE LAB ✓.

---

# Слайд 757. Интерфейс может немного отличаться

## Заголовок
HubSpot обновил CRM navigation

## Текст
На новых Free-аккаунтах используется обновлённый CRM Index.

Поэтому путь может выглядеть:

```text
CRM → Contacts
```

или:

```text
More → CRM → Contacts
```

в зависимости от отображаемого меню.

## Скриншот
Актуальное левое меню HubSpot.

---

# Слайд 758. Открываем Contacts

## Заголовок
Шаг 2. CRM → Contacts

## Текст
Откройте:

**CRM**

↓

**Contacts**

Сейчас список может быть пустым.

## Скриншот
Contacts Index.

---

# Слайд 759. Table View

## Заголовок
Основное представление Contacts

## Текст
В таблице одна строка соответствует одному Contact record.

Колонки — properties.

Например:

```text
Name
Email
Phone
Contact owner
Create date
```

## Скриншот
Contacts → Table View.

---

# Слайд 760. Создаём тестовый Contact вручную

## Заголовок
Шаг 3. Create Contact

## Текст
До массового импорта создадим одну запись вручную.

Нажмите:

**Create contact**

Тестовые данные:

```text
First name: Иван
Last name: Тестов
Email: ivan.test@example.com
```

## Скриншот
Create Contact panel.

---

# Слайд 761. Открываем Contact Record

## Заголовок
Шаг 4. Карточка человека

## Текст
Откройте созданный Contact.

Найдите:

```text
Properties
Activities
Associations
```

CRM хранит больше, чем строку таблицы.

## Скриншот
Contact Record.

---

# Слайд 762. Activity Timeline

## Заголовок
История взаимодействий

## Текст
CRM может хранить действия вокруг записи:

```text
notes
tasks
emails
calls
meetings
```

В нашей лаборатории используем:

```text
Note
Task
```

## Скриншот
Activity timeline.

---

# Слайд 763. Открываем Deals

## Заголовок
Шаг 5. CRM → Deals

## Текст
Перейдите:

**CRM → Deals**

Deals можно смотреть:

```text
Table View
Board View
```

## Скриншот
Deals Index.

---

# Слайд 764. Board View

## Заголовок
Процесс становится визуальным

## Текст
Переключитесь:

**Board View**

Карточки Deal распределяются по Stage.

## Скриншот
Deal Board.

---

# Слайд 765. Default Pipeline

## Заголовок
HubSpot уже имеет Sales Pipeline

## Текст
В новом аккаунте существует стандартный Deal Pipeline.

В нём могут быть стадии вроде:

```text
Appointment scheduled
Qualified to buy
Presentation scheduled
...
Closed won
Closed lost
```

Для нашей задачи это слишком sales-oriented.

## Скриншот
Default Sales Pipeline.

---

# Слайд 766. Настраиваем под наш процесс

## Заголовок
Шаг 6. Pipeline Settings

## Текст
Откройте:

**Settings**

↓

**Objects**

↓

**Deals**

↓

**Pipelines**

Выберите существующий Sales Pipeline.

## Скриншот
Deal Pipeline Settings.

---

# Слайд 767. Почему не создаём второй Pipeline

## Заголовок
Для Free-стенда достаточно одного

## Текст
В бесплатной лаборатории используем существующий pipeline и меняем его этапы.

Дополнительные pipelines относятся к платным возможностям.

Для обучения один процесс даже удобнее.

## Визуал

```text
1 PIPELINE
=
1 учебный процесс
```

---

# Слайд 768. Наш Pipeline

## Заголовок
Applications

## Текст
Настроим этапы:

```text
New application
In progress
Contacted
Done
Rejected
```

## Визуал
Пять колонок.

---

# Слайд 769. Deal Probability

## Заголовок
У Deal Stage есть probability

## Текст
HubSpot связывает Deal stages с вероятностью успешного завершения.

Для лаборатории используем условно:

```text
New application   10%
In progress       30%
Contacted         60%
Done             100%
Rejected           0%
```

## Визуал
Stage → Probability.

---

# Слайд 770. Closed Won и Closed Lost

## Заголовок
Финальные стадии отличаются от обычных

## Текст
Pipeline Deal должен иметь успешный и неуспешный финал.

Поэтому:

```text
Done
→ Won
→ 100%
```

```text
Rejected
→ Lost
→ 0%
```

## Визуал
Развилка:

DONE ✓

REJECTED ✕.

---

# Слайд 771. Почему probability сегодня не главное

## Заголовок
Мы не строим прогноз продаж

## Текст
Нам важно понять:

```text
Stage
Pipeline
Move between stages
Closed state
```

Probability нужна HubSpot как часть Deal pipeline.

Глубокую sales-аналитику не изучаем.

## Визуал
Probability затемнена.

Stage выделен.

---

# Слайд 772. Сохраняем Pipeline

## Заголовок
Шаг 7. Save

## Текст
Проверьте порядок:

```text
New application
In progress
Contacted
Done
Rejected
```

Сохраните изменения.

## Скриншот
Pipeline Settings после настройки.

---

# Слайд 773. Теперь нужны наши поля

## Заголовок
HubSpot не знает что такое Request ID

## Текст
У HubSpot есть стандартные Deal Properties.

Но наших полей пока нет:

```text
request_id
direction
utm_source
utm_medium
utm_campaign
application_created_at
```

Создадим Custom Properties.

## Визуал
CSV columns → Missing CRM Properties.

---

# Слайд 774. Открываем Properties

## Заголовок
Шаг 8. Settings → Properties

## Текст
В Settings откройте:

**Properties**

В Select an object выберите:

```text
Deal properties
```

## Скриншот
Properties Settings.

---

# Слайд 775. Создаём Request ID

## Заголовок
Шаг 9. Custom Property

## Текст
Нажмите:

**Create property**

Property label:

```text
Request ID
```

Field type:

```text
Single-line text
```

## Скриншот
Create Property panel.

---

# Слайд 776. Где должен жить Request ID

## Заголовок
Deal Property, не Contact Property

## Текст
Правильно:

```text
Deal
└ Request ID
```

Неправильно:

```text
Contact
└ Request ID
```

Потому что один Contact может иметь несколько заявок.

## Визуал
Правильная модель.

---

# Слайд 777. Direction

## Заголовок
Шаг 10. Направление заявки

## Текст
Создайте Deal Property:

```text
Direction
```

Field Type:

**Dropdown select**

Значения:

```text
backend
frontend
data
```

## Скриншот
Dropdown Property.

---

# Слайд 778. Почему Dropdown

## Заголовок
Снова контролируем словарь

## Текст
Не хотим получить:

```text
Backend
back end
BACKEND
бекенд
```

Используем фиксированный набор.

Та же идея уже встречалась в Google Sheets.

## Визуал
Free Text ✕ / Enumeration ✓.

---

# Слайд 779. UTM Source

## Заголовок
Шаг 11. Источник

## Текст
Deal Property:

```text
UTM Source
```

Field Type:

```text
Single-line text
```

Например:

```text
instagram
direct
google
```

## Скриншот
UTM Source Property.

---

# Слайд 780. UTM Medium

## Заголовок
Шаг 12. Medium

## Текст
Создайте:

```text
UTM Medium
```

Тип:

```text
Single-line text
```

## Скриншот
Property.

---

# Слайд 781. UTM Campaign

## Заголовок
Шаг 13. Campaign

## Текст
Создайте:

```text
UTM Campaign
```

Тип:

```text
Single-line text
```

Например:

```text
backend_guide
```

## Скриншот
Property.

---

# Слайд 782. Application Created At

## Заголовок
Шаг 14. Дата создания исходной заявки

## Текст
Создайте Deal Property:

```text
Application Created At
```

Тип:

```text
Date and time
```

Не путайте её с HubSpot:

```text
Create date
```

## Визуал
APPLICATION TIME ≠ CRM IMPORT TIME.

---

# Слайд 783. Почему две даты

## Заголовок
Заявка появилась раньше CRM-record

## Текст
Например:

```text
Application Created At:
10:04
```

Но импортировали её в CRM:

```text
HubSpot Create Date:
11:30
```

Это разные события.

## Визуал
Timeline.

---

# Слайд 784. Модель Deal готова

## Заголовок
Что теперь знает Deal

## Текст

```text
Deal name
Deal stage
Request ID
Direction
UTM Source
UTM Medium
UTM Campaign
Application Created At
```

## Визуал
Deal Record Schema.

---

# Слайд 785. Возвращаемся к Power Query

## Заголовок
У нас уже есть подготовленные данные

## Текст
После предыдущей темы:

```text
dirty data
↓
Power Query
↓
leads_clean
```

Не импортируем исходный грязный CSV.

CRM должна получать уже подготовленные данные.

## Визуал

```text
DIRTY ✕
CLEAN ✓
```

---

# Слайд 786. Исходная структура

## Заголовок
Сейчас leads_clean выглядит примерно так

## Текст

```text
request_id
created_at
name
email
direction
utm_source
utm_medium
utm_campaign
status
```

Нужно адаптировать данные под CRM Objects.

## Визуал
Source schema → CRM schema.

---

# Слайд 787. Name нужно разделить

## Заголовок
Contact имеет First Name и Last Name

## Текст
Для учебного набора используем имена вида:

```text
Иван Тестов
```

Разделяем:

```text
First name = Иван
Last name = Тестов
```

## Визуал
Split Column.

---

# Слайд 788. Используем Power Query ещё раз

## Заголовок
Шаг 15. Split name

## Текст
В `leads_clean` выберите:

```text
name
```

Далее:

**Split Column → By Delimiter**

Delimiter:

```text
Space
```

Для лаборатории разделяем на две части.

## Скриншот
Power Query Split Column.

---

# Слайд 789. Переименовываем

## Заголовок
Шаг 16. CRM-friendly names

## Текст
Полученные столбцы:

```text
name.1
name.2
```

переименуйте:

```text
first_name
last_name
```

## Скриншот
Power Query после Rename.

---

# Слайд 790. Создаём Deal Name

## Заголовок
Шаг 17. Понятное название заявки

## Текст
Добавьте поле:

```text
deal_name
```

Результат:

```text
Заявка REQ-001
```

То есть:

```text
"Заявка " + request_id
```

## Визуал
REQ-001 → Заявка REQ-001.

---

# Слайд 791. Deal Name ≠ Request ID

## Заголовок
Человекочитаемое и техническое значение

## Текст
`Request ID`:

```text
REQ-001
```

используется как технический идентификатор.

`Deal name`:

```text
Заявка REQ-001
```

удобен человеку в CRM.

## Визуал
ID / Label.

---

# Слайд 792. Status нужно преобразовать

## Заголовок
Шаг 18. CRM Stage Mapping

## Текст
Создаём соответствие:

```text
new
→ New application

in_progress
→ In progress

done
→ Done

rejected
→ Rejected
```

## Визуал
Mapping table.

---

# Слайд 793. Mapping

## Заголовок
Это слово будет встречаться постоянно

## Текст
Mapping — правило соответствия одного представления другому.

Например:

```text
status
→
Deal Stage
```

или:

```text
utm_source
→
UTM Source
```

## Визуал
SOURCE FIELD → TARGET PROPERTY.

---

# Слайд 794. Итоговый CRM Import Dataset

## Заголовок
Что должно получиться

## Текст

```text
first_name
last_name
email
deal_name
request_id
direction
utm_source
utm_medium
utm_campaign
deal_stage
created_at
```

## Визуал
Таблица schema.

---

# Слайд 795. Пример

## Заголовок
Одна строка импорта

## Текст

```text
Иван
Тестов
ivan.test@example.com
Заявка REQ-001
REQ-001
backend
instagram
social
backend_guide
New application
2026-10-08 10:04
```

Одна строка содержит данные сразу для:

```text
Contact + Deal
```

## Визуал
Строка разделяется на два объекта.

---

# Слайд 796. Один файл — два объекта

## Заголовок
Почему это возможно

## Текст
В одной строке находятся:

Contact Properties:

```text
first_name
last_name
email
```

Deal Properties:

```text
deal_name
request_id
direction
utm_*
deal_stage
created_at
```

При импорте скажем HubSpot, к какому объекту относится каждый столбец.

## Визуал
CSV row → Contact + Deal.

---

# Слайд 797. Email будет идентификатором Contact

## Заголовок
Один человек не должен создаваться десять раз

## Текст
Для Contact используем:

```text
Email
```

как уникальный идентификатор.

Если тот же email встречается в нескольких строках, CRM может связать несколько Deals с одним Contact.

## Визуал

```text
ivan@example.com
├ REQ-001
└ REQ-194
```

---

# Слайд 798. Deal пока создаём как новый

## Заголовок
Request ID хранится для контроля

## Текст
Для лаборатории каждая строка создаёт новый Deal.

`Request ID` сохраняем внутри Deal.

Позже при автоматизации отдельно разберём:

```text
idempotency
deduplication
retry
```

## Визуал
REQ ID → future deduplication.

---

# Слайд 799. Экспорт

## Заголовок
Шаг 19. crm_import.csv

## Текст
Сохраните подготовленный набор:

```text
crm_import.csv
```

Проверьте:

UTF-8;

заголовки;

одну заявку на строку;

нет пустых email;

нет дублей request_id.

## Скриншот
CSV в VS Code.

---

# Слайд 800. Пример файла

## Заголовок
crm_import.csv

## Текст

```csv
first_name,last_name,email,deal_name,request_id,direction,utm_source,utm_medium,utm_campaign,deal_stage,created_at
Иван,Тестов,ivan.test@example.com,Заявка REQ-001,REQ-001,backend,instagram,social,backend_guide,New application,2026-10-08 10:04:00
Анна,Демо,anna.demo@example.com,Заявка REQ-002,REQ-002,data,instagram,social,analytics_guide,In progress,2026-10-08 10:12:00
Петр,Тестов,petr.test@example.com,Заявка REQ-003,REQ-003,frontend,direct,none,not_set,Done,2026-10-08 10:20:00
```

## Скриншот
Файл в VS Code.

---

# Слайд 801. Не используем Quick Contact Import

## Заголовок
Нам нужно больше одного объекта

## Текст
Quick Import подходит для:

```text
Contacts only
```

Но нам нужны:

```text
Contacts
+
Deals
+
Associations
```

Поэтому выбираем:

**Advanced Import**

## Визуал
QUICK ✕

ADVANCED ✓.

---

# Слайд 802. Открываем Import

## Заголовок
Шаг 20. Data Management

## Текст
Откройте:

**More**

↓

**Data Management**

↓

**Data Integration**

↓

**Import data**

В некоторых интерфейсах Import также доступен непосредственно на CRM Index Page.

## Скриншот
Import Data.

---

# Слайд 803. Advanced Imports

## Заголовок
Шаг 21. All Objects

## Текст
Выберите:

**Advanced imports (all objects)**

## Скриншот
Import options.

---

# Слайд 804. Выбираем объекты

## Заголовок
Шаг 22. Contacts + Deals

## Текст
Добавьте:

```text
Contacts
Deals
```

Нажмите:

**Next**

## Скриншот
Object selector.

---

# Слайд 805. Single File

## Заголовок
Шаг 23. Один CSV

## Текст
Выберите:

```text
Single file
```

Потому что данные Contact и Deal находятся в одной строке нашего CSV.

## Скриншот
Single file selection.

---

# Слайд 806. Как импортируем Contacts

## Заголовок
Шаг 24. Create and Update

## Текст
Для Contacts выбираем режим, позволяющий:

```text
Create and update records
```

Email будет использоваться для сопоставления контактов.

## Скриншот
Choose how to import Contacts.

---

# Слайд 807. Как импортируем Deals

## Заголовок
Шаг 25. Create New

## Текст
Для лаборатории Deals создаём как новые records.

Мы не обновляем существующие Deal.

## Скриншот
Choose how to import Deals.

---

# Слайд 808. Загружаем файл

## Заголовок
Шаг 26. crm_import.csv

## Текст
Выберите:

```text
crm_import.csv
```

HubSpot прочитает заголовки и предложит mapping.

## Скриншот
File upload.

---

# Слайд 809. Самый важный экран импорта

## Заголовок
Column Mapping

## Текст
Теперь необходимо определить:

```text
CSV Column
↓
CRM Object
↓
CRM Property
```

Не нажимайте Next автоматически.

## Скриншот
Mapping Screen целиком.

---

# Слайд 810. first_name

## Заголовок
Шаг 27. Contact Mapping

## Текст

```text
first_name
```

Object:

```text
Contact
```

Property:

```text
First name
```

## Скриншот
Mapping row.

---

# Слайд 811. last_name

## Заголовок
Шаг 28.

## Текст

```text
last_name
→ Contact
→ Last name
```

## Скриншот
Mapping.

---

# Слайд 812. email

## Заголовок
Шаг 29. Unique Contact Identifier

## Текст

```text
email
→ Contact
→ Email
```

Используем Email для идентификации Contact.

## Скриншот
Email mapping.

## Акцент
Unique identifier.

---

# Слайд 813. deal_name

## Заголовок
Шаг 30. Deal Name

## Текст

```text
deal_name
→ Deal
→ Deal name
```

## Скриншот
Deal Name mapping.

---

# Слайд 814. request_id

## Заголовок
Шаг 31. Custom Property

## Текст

```text
request_id
→ Deal
→ Request ID
```

Это созданная нами Custom Property.

## Скриншот
Request ID mapping.

---

# Слайд 815. direction

## Заголовок
Шаг 32.

## Текст

```text
direction
→ Deal
→ Direction
```

Проверьте значения Dropdown:

```text
backend
frontend
data
```

## Скриншот
Direction mapping.

---

# Слайд 816. UTM

## Заголовок
Шаг 33. Marketing Context

## Текст
Сопоставьте:

```text
utm_source
→ Deal → UTM Source

utm_medium
→ Deal → UTM Medium

utm_campaign
→ Deal → UTM Campaign
```

## Скриншот
Три строки mapping.

---

# Слайд 817. created_at

## Заголовок
Шаг 34. Исходная дата заявки

## Текст

```text
created_at
→ Deal
→ Application Created At
```

Проверьте, что значения распознаются как дата и время.

## Скриншот
Date mapping.

---

# Слайд 818. deal_stage

## Заголовок
Шаг 35. Deal Stage

## Текст

```text
deal_stage
→ Deal
→ Deal stage
```

Значения должны соответствовать существующим stages:

```text
New application
In progress
Done
Rejected
```

## Скриншот
Deal Stage mapping.

---

# Слайд 819. Association

## Заголовок
Contact и Deal должны связаться

## Текст
Поскольку Contact и Deal находятся в одной строке multi-object import, HubSpot может создать association между ними.

После импорта хотим получить:

```text
Contact
Иван Тестов
     ↕
Deal
Заявка REQ-001
```

## Визуал
CSV row → association.

---

# Слайд 820. Почему Association критична

## Заголовок
Без связи получим два независимых списка

## Текст
Плохо:

```text
Contacts:
Иван
Анна
Петр

Deals:
REQ-001
REQ-002
REQ-003
```

но неизвестно:

**кому принадлежит какая заявка?**

## Визуал
Disconnected objects ✕.

---

# Слайд 821. Review Mapping

## Заголовок
Шаг 36. Перед импортом

## Текст
Проверьте:

Contact:

```text
First name
Last name
Email
```

Deal:

```text
Deal name
Request ID
Direction
UTM Source
UTM Medium
UTM Campaign
Application Created At
Deal stage
```

## Скриншот
Полный Mapping Screen.

---

# Слайд 822. Import Name

## Заголовок
Шаг 37. Название импорта

## Текст
Например:

```text
Lesson 12 — Applications Import v1
```

Не:

```text
test
new
import123
```

## Скриншот
Import name.

---

# Слайд 823. Consent

## Заголовок
Не импортируем случайные базы

## Текст
HubSpot потребует подтвердить корректность использования контактных данных.

В лаборатории:

используем только тестовые email;

не загружаем купленные базы;

не используем реальные персональные данные студентов.

## Визуал
TEST DATA ✓.

---

# Слайд 824. Finish Import

## Заголовок
Шаг 38. Запускаем

## Текст
Нажмите:

**Finish import**

После завершения откройте результаты импорта.

## Скриншот
Import status.

---

# Слайд 825. Import Results

## Заголовок
Не закрываем экран сразу

## Текст
Проверьте:

```text
created records
updated records
errors
```

Если есть Errors — сначала изучите их.

## Скриншот
Import Result.

---

# Слайд 826. Import Error — полезный сигнал

## Заголовок
Не исправляем всё вручную в CRM

## Текст
Например ошибка:

```text
Unknown deal stage
```

означает, что значение файла не соответствует CRM Pipeline.

Исправлять нужно:

```text
mapping / source data
```

а не десять карточек вручную.

## Визуал

```text
ERROR
↓
ROOT CAUSE
↓
FIX SOURCE
```

---

# Слайд 827. Открываем Contacts

## Заголовок
Шаг 39. Проверяем людей

## Текст
Перейдите:

**CRM → Contacts**

Должны появиться:

```text
Иван Тестов
Анна Демо
Петр Тестов
```

## Скриншот
Contacts Table.

---

# Слайд 828. Открываем Deals

## Заголовок
Шаг 40. Проверяем заявки

## Текст
Перейдите:

**CRM → Deals**

Ожидаем:

```text
Заявка REQ-001
Заявка REQ-002
Заявка REQ-003
```

## Скриншот
Deals Table.

---

# Слайд 829. Проверяем Association

## Заголовок
Шаг 41. Открыть Deal

## Текст
Откройте:

```text
Заявка REQ-001
```

Найдите Associated Contact.

Должен быть:

```text
Иван Тестов
```

## Скриншот
Deal Record + Associated Contact.

---

# Слайд 830. Проверяем обратную связь

## Заголовок
Шаг 42. Contact → Deal

## Текст
Откройте Contact:

```text
Иван Тестов
```

В связанных records должна отображаться:

```text
Заявка REQ-001
```

## Скриншот
Contact Record + Deal Association.

---

# Слайд 831. Проверяем Properties Deal

## Заголовок
Шаг 43. Контекст заявки

## Текст
В Deal найдите:

```text
Request ID
Direction
UTM Source
UTM Medium
UTM Campaign
Application Created At
```

## Скриншот
Deal Properties.

---

# Слайд 832. Вот зачем UTM доехала до CRM

## Заголовок
Маркетинговый контекст не потерян

## Текст
Теперь можно открыть заявку и увидеть:

```text
Source:
instagram

Campaign:
backend_guide
```

Даже если пользователь уже давно покинул сайт.

## Визуал

```text
Instagram
↓
UTM
↓
Website
↓
Sheet
↓
CRM
```

---

# Слайд 833. Переходим в Board

## Заголовок
Шаг 44. Работаем с процессом

## Текст
В Deals включите:

**Board View**

Теперь заявки распределены по Stage.

## Скриншот
Deals Board.

---

# Слайд 834. Импортированные стадии

## Заголовок
Карточки должны стоять правильно

## Текст
Например:

```text
New application
REQ-001

In progress
REQ-002

Done
REQ-003
```

## Скриншот
Board после импорта.

---

# Слайд 835. Двигаем Deal

## Заголовок
Шаг 45. New → In progress

## Текст
Перетащите:

```text
Заявка REQ-001
```

из:

```text
New application
```

в:

```text
In progress
```

## Скриншот
Drag & Drop Deal.

---

# Слайд 836. Что изменилось

## Заголовок
Stage — состояние объекта

## Текст
Мы не редактировали:

```text
status cell
```

Мы изменили состояние Deal внутри бизнес-процесса.

CRM визуально отражает изменение.

## Визуал

```text
DEAL
New
↓
In Progress
```

---

# Слайд 837. Добавляем Note

## Заголовок
Шаг 46. Фиксируем взаимодействие

## Текст
Откройте Deal или Contact.

Добавьте Note:

```text
Связались с пользователем.
Интересуется backend-направлением.
```

Используем только тестовый текст.

## Скриншот
Add Note.

---

# Слайд 838. Зачем Note

## Заголовок
Контекст больше не живёт в голове сотрудника

## Текст
Следующий человек, открывший запись, может увидеть историю.

Это одна из причин использовать CRM вместо таблицы.

## Визуал

```text
PERSON A
↓ note
CRM
↓
PERSON B
```

---

# Слайд 839. Создаём Task

## Заголовок
Шаг 47. Следующее действие

## Текст
Добавьте Task:

```text
Повторно связаться с пользователем
```

Например:

```text
Due date:
завтра
```

## Скриншот
Create Task panel.

---

# Слайд 840. Deal Stage и Task — разные вещи

## Заголовок
Состояние ≠ следующее действие

## Текст
Stage:

```text
In progress
```

отвечает:

> Где заявка находится в процессе?

Task:

```text
Написать пользователю
```

отвечает:

> Что нужно сделать?

## Визуал
STATE / ACTION.

---

# Слайд 841. Перемещаем в Contacted

## Заголовок
Шаг 48. Продолжаем процесс

## Текст
После коммуникации переместите Deal:

```text
In progress
↓
Contacted
```

## Скриншот
Board с Deal в Contacted.

---

# Слайд 842. Завершаем Deal

## Заголовок
Шаг 49. Done

## Текст
Если учебная заявка успешно обработана:

```text
Contacted
↓
Done
```

Deal становится Closed Won.

## Скриншот
Deal в Done.

---

# Слайд 843. Другой результат

## Заголовок
Rejected

## Текст
Если заявка не подходит или человек отказался:

```text
Rejected
```

Deal становится Closed Lost.

Это не удаление записи.

История сохраняется.

## Визуал
DONE / REJECTED.

---

# Слайд 844. Почему нельзя просто удалить плохую заявку

## Заголовок
Закрытая заявка тоже является данными

## Текст
Если удалять все отклонённые записи, мы потеряем возможность анализировать:

```text
сколько заявок отклоняется?
из каких источников?
по каким направлениям?
```

Поэтому:

```text
Rejected
```

лучше удаления.

## Визуал
DELETE ✕ / CLOSED LOST ✓.

---

# Слайд 845. Table View и Board View

## Заголовок
Два способа смотреть на одни records

## Текст
Table View удобно использовать для:

```text
properties
filters
bulk data
```

Board View:

```text
pipeline
stages
movement
```

## Визуал
TABLE ↔ BOARD.

---

# Слайд 846. Filters

## Заголовок
Шаг 50. Найти заявки Instagram

## Текст
В Deals создайте Filter:

```text
UTM Source
is equal to
instagram
```

## Скриншот
Filter configuration.

---

# Слайд 847. Ещё один Filter

## Заголовок
backend_guide

## Текст
Добавьте:

```text
UTM Campaign
=
backend_guide
```

Теперь видим только заявки конкретной автоворонки.

## Скриншот
Filtered Deals.

---

# Слайд 848. Saved View

## Заголовок
Регулярный фильтр можно сохранить

## Текст
Создайте View:

```text
Instagram — Backend Guide
```

Теперь не нужно каждый раз заново настраивать условия.

## Скриншот
Save View.

---

# Слайд 849. Это уже операционная аналитика

## Заголовок
CRM отвечает на другие вопросы

## Текст
Например:

```text
Сколько Instagram-заявок сейчас New?

Сколько In Progress?

Сколько Done?

Какие требуют действий?
```

Это отличается от GA4.

## Визуал
GA4 questions / CRM questions.

---

# Слайд 850. GA4 vs CRM

## Заголовок
Не заменяют друг друга

## Текст
GA4:

```text
traffic
sessions
events
behavior
attribution
```

CRM:

```text
contacts
deals
pipeline
activities
tasks
outcomes
```

## Визуал
ANALYTICS ↔ OPERATIONS.

---

# Слайд 851. Data Studio vs CRM

## Заголовок
Dashboard тоже не заменяет CRM

## Текст
Data Studio:

```text
observe
compare
analyze
```

CRM:

```text
work
change stage
assign task
record activity
```

## Визуал

```text
DATA STUDIO
LOOK

CRM
ACT
```

---

# Слайд 852. Теперь архитектура стала больше

## Заголовок
Полный путь

## Текст

```text
Instagram
↓
ManyChat
↓
Vercel
├→ GA4
│   ↓
│ Data Studio
│
└→ Form
    ↓
Google Sheets
    ↓
Power Query
    ↓
CSV
    ↓
HubSpot CRM
```

## Визуал
Архитектура на весь слайд.

---

# Слайд 853. Что здесь плохо?

## Заголовок
Посмотрите внимательно

## Текст
Чтобы новая заявка попала в CRM, мы сейчас должны:

```text
Google Sheets
↓
Export
↓
Power Query
↓
Refresh
↓
Export CSV
↓
HubSpot
↓
Import
```

Каждый раз.

## Визуал
Очень длинная ручная цепочка.

---

# Слайд 854. Представим 100 заявок в день

## Заголовок
Ручной импорт перестаёт работать

## Текст
Мы не хотим ежедневно:

скачивать CSV;

обновлять Excel;

экспортировать файл;

загружать CRM;

делать mapping;

проверять импорт.

## Визуал
Human bottleneck.

---

# Слайд 855. Главный вопрос следующего этапа

## Заголовок
Как создать Deal автоматически?

## Текст
Хотим:

```text
FORM SUBMIT
↓
?
↓
HUBSPOT CONTACT
+
HUBSPOT DEAL
```

без ручного CSV.

## Визуал
Вместо `?` большой блок.

---

# Слайд 856. У CRM есть API

## Заголовок
Программный интерфейс

## Текст
Вместо:

```text
CSV Upload
```

приложение может отправить данные программно.

Например концептуально:

```text
POST /contacts
```

или:

```text
POST /deals
```

## Визуал
App → HTTP → CRM.

---

# Слайд 857. Но сначала нужно понять HTTP

## Заголовок
Не прыгаем сразу в HubSpot API

## Текст
До автоматизации необходимо понять:

```text
URL
Method
Headers
Body
JSON
Status Code
Response
```

Это и будет следующая технологическая тема.

## Визуал
HTTP Request diagram.

---

# Слайд 858. Ещё одна проблема

## Заголовок
Как связать Contact и Deal автоматически?

## Текст
Нужно будет:

```text
найти или создать Contact
↓
получить его ID
↓
создать Deal
↓
создать Association
```

Это уже интеграционный процесс.

## Визуал
Contact → ID → Deal → Association.

---

# Слайд 859. А если запрос придёт два раза?

## Заголовок
Появится проблема дублей

## Текст
Например:

```text
REQ-A81C4B92
```

доставлен дважды.

Нельзя создавать:

```text
Deal #1
Deal #2
```

для одной заявки.

Здесь снова понадобится:

```text
Request ID
```

## Визуал
Duplicate request → one Deal.

---

# Слайд 860. А если CRM временно недоступна?

## Заголовок
Ещё одна будущая проблема

## Текст
Что делать если:

```text
FORM ✓
GOOGLE SHEETS ✓
CRM ✕
```

Нужно будет рассмотреть:

```text
error handling
retry
logging
```

Но позже.

## Визуал
Integration failure.

---

# Слайд 861. Почему мы сначала делали всё руками

## Заголовок
Чтобы понимать процесс до автоматизации

## Текст
Теперь студент понимает:

что такое Contact;

что такое Deal;

какие Properties нужны;

как выглядит Mapping;

что такое Association;

как работает Pipeline.

Поэтому автоматизация не будет набором неизвестных API-запросов.

## Визуал
MANUAL → UNDERSTAND → AUTOMATE.

---

# Слайд 862. Практическое задание

## Заголовок
Что необходимо сделать

## Текст
Студент должен:

создать HubSpot CRM;

изучить Contacts и Deals;

настроить Deal Pipeline;

создать Custom Properties;

подготовить `crm_import.csv`;

импортировать Contact + Deal;

проверить Association;

переместить Deal между stages;

создать Note;

создать Task;

сохранить фильтр по Instagram.

## Визуал
Checklist.

---

# Слайд 863. Контрольный кейс

## Заголовок
Один человек — две заявки

## Текст
Добавьте в CSV:

```text
ivan.test@example.com
REQ-001
backend
```

и:

```text
ivan.test@example.com
REQ-101
data
```

После импорта должно быть:

```text
1 Contact
2 Deals
```

## Визуал

```text
IVAN
├ BACKEND
└ DATA
```

---

# Слайд 864. Что будет неправильным результатом

## Заголовок
Проверяем модель

## Текст
Неправильно:

```text
2 Contacts
2 Deals
```

если оба Contact имеют одинаковый email.

Это означает проблему:

```text
deduplication / import mapping
```

## Визуал
Duplicate Contact ✕.

---

# Слайд 865. Ещё один контроль

## Заголовок
Deal не должен потерять UTM

## Текст
Для Deal:

```text
REQ-001
```

проверьте:

```text
UTM Source = instagram
UTM Campaign = backend_guide
```

## Скриншот
Deal Properties.

---

# Слайд 866. Ещё один контроль

## Заголовок
Pipeline Stage

## Текст
Deal с исходным:

```text
status = new
```

должен оказаться:

```text
New application
```

А не:

```text
Done
```

## Визуал
Status Mapping check.

---

# Слайд 867. Что необходимо сохранить

## Заголовок
Контрольные скриншоты

## Текст
Сохраните скриншоты:

1. HubSpot Contacts;
2. HubSpot Deals;
3. Board View;
4. настроенного Pipeline;
5. stages и probabilities;
6. Property `Request ID`;
7. Property `Direction`;
8. UTM properties;
9. `crm_import.csv`;
10. Import Objects — Contacts + Deals;
11. Advanced Import;
12. Mapping Contact fields;
13. Mapping Deal fields;
14. Email unique identifier;
15. Deal Stage mapping;
16. Import Result;
17. импортированных Contacts;
18. импортированных Deals;
19. Contact → associated Deal;
20. Deal → associated Contact;
21. Deal Properties с UTM;
22. Board после импорта;
23. Deal в `In progress`;
24. Note;
25. Task;
26. Deal в `Done`;
27. Filter `UTM Source = instagram`;
28. Saved View.

---

# Слайд 868. Что студент должен уметь объяснить

## Заголовок
Контроль понимания

## Текст
Студент должен объяснить:

что такое CRM;

что такое CRM Object;

что такое Record;

что такое Property;

чем Contact отличается от Deal;

почему `request_id` относится к Deal;

что такое Association;

что такое Pipeline;

что такое Stage;

зачем Deal Stage имеет вероятность;

чем `Done` отличается от удаления Deal;

зачем хранить Closed Lost;

что такое Custom Property;

что такое Mapping;

почему перед CRM нужен clean dataset;

зачем Email используется для идентификации Contact;

почему один Contact может иметь несколько Deals;

чем Table View отличается от Board View;

чем Stage отличается от Task;

чем CRM отличается от GA4;

чем CRM отличается от Data Studio.

---

# Слайд 869. Итог занятия

## Заголовок
Из строки получилась бизнес-сущность

## Текст
Было:

```text
CSV ROW
```

Стало:

```text
CONTACT
    ↕
  DEAL
    ↓
 PIPELINE
    ↓
 ACTIVITY
    ↓
 OUTCOME
```

## Визуал
Преобразование строки в CRM model.

---

# Слайд 870. Полная архитектура курса

## Заголовок
Что уже умеет наша система

## Текст

```text
INSTAGRAM
↓
MANYCHAT
↓
WEBSITE
├────────────→ GA4
│               ↓
│          EXPLORATIONS
│               ↓
│          DATA STUDIO
│
└→ FORM
   ↓
GOOGLE SHEETS
   ↓
POWER QUERY
   ↓
CRM IMPORT
   ↓
HUBSPOT
├→ CONTACT
└→ DEAL
     ↓
  PIPELINE
```

## Визуал
Схема на весь экран.

---

# Слайд 871. Следующая тема

## Заголовок
HTTP API: убираем ручной импорт

## Текст
Сейчас между нашей системой и CRM находится человек:

```text
FORM
↓
SHEETS
↓
POWER QUERY
↓
CSV
↓
👤
↓
CRM
```

Следующая задача:

```text
APP
↓
HTTP REQUEST
↓
API
↓
CRM
```

Изучим:

```text
Request
Response
URL
Endpoint
Method
Headers
JSON Body
Status Codes
Authentication
```

Главный вопрос следующей темы:

**Как одна информационная система программно разговаривает с другой?**