# Слайд 606. Где мы остановились

## Заголовок
Мы научились анализировать GA4

## Текст
На предыдущей теме использовали:

```text
Reports
Acquisition
Events
Comparisons
Free Form
Funnel Exploration
Path Exploration
Attribution
```

Теперь мы умеем исследовать поведение пользователя.

Но аналитика находится не в одной системе.

## Визуал

```text
GA4
→ traffic
→ events
→ key events

Google Sheets
→ request_id
→ lead
→ status
```

---

# Слайд 607. Важное изменение названия

## Заголовок
Looker Studio теперь называется Data Studio

## Текст
В апреле 2026 Google вернул продукту название:

**Data Studio**

Поэтому в актуальном интерфейсе и документации используем именно это название.

Старое название:

```text
Looker Studio
```

может всё ещё встречаться в старых статьях и видео.

## Визуал

```text
Looker Studio
↓
Data Studio
```

---

# Слайд 608. Новая проблема

## Заголовок
Руководителю не нужен десяток экранов

## Текст
Чтобы понять ситуацию сейчас, приходится открывать:

```text
GA4
↓
Traffic Acquisition

GA4
↓
Events

Google Sheets
↓
Leads

Power Query
↓
Clean data
```

Хотим один экран.

## Визуал
Несколько окон → один Dashboard.

---

# Слайд 609. Что такое Dashboard

## Заголовок
Dashboard — не просто набор графиков

## Текст
Dashboard — представление ключевых показателей для конкретной задачи.

Он должен быстро отвечать:

```text
что происходит?
где проблема?
что изменилось?
куда смотреть дальше?
```

## Визуал
Dashboard → Decision.

---

# Слайд 610. Что будем строить

## Заголовок
Три страницы

## Текст

```text
PAGE 1
WEB ANALYTICS

PAGE 2
LEADS

PAGE 3
MARKETING → BUSINESS
```

Первая страница — данные GA4.

Вторая — Google Sheets.

Третья — сопоставление двух источников.

## Визуал
Три макета страниц.

---

# Слайд 611. Архитектура

## Заголовок
Data Studio ничего не собирает сам

## Текст

```text
GA4 ─────────┐
             │
             ├→ DATA STUDIO
             │
GOOGLE SHEETS┘
```

Data Studio подключается к существующим источникам и визуализирует их.

## Визуал
Два connector → dashboard.

---

# Слайд 612. Data Source

## Заголовок
Первое понятие

## Текст
**Data Source** — подключение Data Studio к конкретному набору данных.

Например:

```text
GA4 Property
```

или:

```text
Google Sheets worksheet
```

## Визуал

```text
DATA
↓ connector
DATA SOURCE
↓
REPORT
```

---

# Слайд 613. Connector

## Заголовок
Как Data Studio понимает разные системы

## Текст
Для разных платформ существуют connectors.

Например:

```text
Google Analytics
Google Sheets
Google Ads
Search Console
BigQuery
CSV
SQL databases
```

## Визуал
Data Studio в центре + источники вокруг.

---

# Слайд 614. Report

## Заголовок
Data Source и Report — не одно и то же

## Текст
**Data Source**

описывает данные.

**Report**

содержит:

```text
pages
charts
tables
scorecards
controls
filters
```

## Визуал

```text
SOURCE
↓
REPORT
↓
DASHBOARD
```

---

# Слайд 615. Открываем Data Studio

## Заголовок
Шаг 1. datastudio.google.com

## Текст
Откройте Data Studio под тем же Google-аккаунтом, который имеет доступ к GA4 и Google Sheets.

## Скриншот
Главная страница Data Studio.

---

# Слайд 616. Создаём Report

## Заголовок
Шаг 2. Create → Report

## Текст
Нажмите:

**Create**

↓

**Report**

Откроется редактор нового отчёта.

## Скриншот
Create → Report.

---

# Слайд 617. Первый Data Source

## Заголовок
Шаг 3. Google Analytics

## Текст
В окне:

**Add data to report**

выберите connector:

```text
Google Analytics
```

## Скриншот
Панель connectors.

## Акцент
Google Analytics.

---

# Слайд 618. Authorization

## Заголовок
Шаг 4. Разрешить доступ

## Текст
При первом подключении Data Studio может запросить разрешение на доступ к Google Analytics.

Используйте учебный Google Account.

## Скриншот
Authorization screen.

---

# Слайд 619. Выбираем GA4 Property

## Заголовок
Шаг 5. Наша аналитика

## Текст
Выберите:

```text
Account
↓
GA4 Property
```

которую использовали на предыдущих занятиях.

Не выбирайте случайный Property.

## Скриншот
Список GA4 Properties.

---

# Слайд 620. Add

## Заголовок
Шаг 6. Добавить источник

## Текст
После выбора Property нажмите:

**Add**

↓

**Add to report**

Теперь GA4 становится первым Data Source нашего отчёта.

## Скриншот
Add to report.

---

# Слайд 621. Canvas

## Заголовок
Редактор отчёта

## Текст
Основные элементы:

```text
Canvas
Toolbar
Page navigation
Properties panel
Data fields
```

## Скриншот
Весь интерфейс Data Studio.

Подписать основные области.

---

# Слайд 622. Edit и View

## Заголовок
Два режима

## Текст
**Edit**

позволяет менять dashboard.

**View**

показывает отчёт так, как его увидит пользователь.

## Визуал

```text
EDIT
строим

VIEW
используем
```

---

# Слайд 623. Название отчёта

## Заголовок
Шаг 7. Naming

## Текст
Назовите:

```text
Digital Funnel Dashboard — Иванов
```

или:

```text
GA4 + Leads Dashboard
```

Не оставляйте:

```text
Untitled Report
```

## Скриншот
Название отчёта сверху.

---

# Слайд 624. Первая страница

## Заголовок
WEB ANALYTICS

## Текст
Переименуйте первую страницу:

```text
01 — Web Analytics
```

На ней будут только данные GA4.

## Скриншот
Page → Manage pages.

---

# Слайд 625. Макет страницы

## Заголовок
Сначала структура, потом графики

## Текст
Верх:

```text
Sessions
Users
Leads
Date Range
```

Середина:

```text
Traffic over time
```

Низ:

```text
Sources
Campaigns
Devices
```

## Визуал
Wireframe страницы.

---

# Слайд 626. Scorecard

## Заголовок
Что такое Scorecard

## Текст
Scorecard показывает одно главное число.

Например:

```text
Sessions
428
```

Используется для KPI.

## Визуал
Большая карточка `428 Sessions`.

---

# Слайд 627. Добавляем Sessions

## Заголовок
Шаг 8. Scorecard

## Текст
Выберите:

**Add a chart**

↓

**Scorecard**

Metric:

```text
Sessions
```

## Скриншот
Scorecard + Properties.

---

# Слайд 628. Active Users

## Заголовок
Шаг 9. Второй KPI

## Текст
Скопируйте Scorecard.

Измените Metric:

```text
Active users
```

Теперь рядом:

```text
Sessions
Active Users
```

## Скриншот
Две карточки.

---

# Слайд 629. Key Events

## Заголовок
Шаг 10. Бизнес-результат

## Текст
Добавьте третью Scorecard.

Metric:

```text
Key events
```

Но пока она показывает все Key Events.

Нам нужен конкретно:

```text
generate_lead
```

## Скриншот
Key Events Scorecard.

---

# Слайд 630. Chart Filter

## Заголовок
Шаг 11. Только generate_lead

## Текст
Выберите Scorecard.

В Properties:

**Add a filter**

↓

**Create a filter**

Условие:

```text
Include
Event name
Equal to
generate_lead
```

## Скриншот
Filter configuration.

---

# Слайд 631. Переименовываем карточку

## Заголовок
Не оставляем техническое название

## Текст
Подпись:

```text
Leads
```

или:

```text
GA4 Leads
```

Так пользователю dashboard понятнее.

## Визуал

```text
GA4 Leads
18
```

---

# Слайд 632. Date Range Control

## Заголовок
Шаг 12. Управление периодом

## Текст
Добавьте:

**Add a control**

↓

**Date range control**

Теперь пользователь сможет выбирать:

```text
Today
Last 7 days
Last 28 days
Custom
```

## Скриншот
Date Range Control.

---

# Слайд 633. Почему Date Range обязателен

## Заголовок
Число без периода почти бесполезно

## Текст
Например:

```text
Leads = 18
```

Но:

```text
за день?
за неделю?
за год?
```

Dashboard должен явно показывать временной контекст.

## Визуал
18 + ? days.

---

# Слайд 634. Time Series

## Заголовок
Шаг 13. Динамика

## Текст
Добавьте:

**Time series**

Dimension:

```text
Date
```

Metric:

```text
Sessions
```

## Скриншот
Time Series chart.

---

# Слайд 635. Добавляем Users

## Заголовок
Два показателя на одном графике

## Текст
В этот же chart добавьте:

```text
Active users
```

Теперь видно изменение Sessions и Users во времени.

## Скриншот
Time Series с двумя линиями.

---

# Слайд 636. Когда Time Series полезен

## Заголовок
Не только «сколько», но и «когда»

## Текст
Он помогает заметить:

```text
рост
падение
аномальный день
эффект кампании
```

## Визуал
Линия с резким пиком.

---

# Слайд 637. Таблица источников

## Заголовок
Шаг 14. Traffic Sources

## Текст
Добавьте Table.

Dimension:

```text
Session source / medium
```

Metrics:

```text
Sessions
Active users
Key events
```

## Скриншот
Table.

---

# Слайд 638. Фильтр Key Events здесь сложнее

## Заголовок
Не все Key Events обязательно generate_lead

## Текст
Если Property содержит несколько Key Events, лучше либо:

использовать отдельную metric/filter комбинацию;

либо явно подписать столбец как:

```text
All Key Events
```

Не называйте его Leads, если он считает другие события.

## Визуал
Correct naming.

---

# Слайд 639. Campaign Performance

## Заголовок
Шаг 15. Campaigns

## Текст
Добавьте новую Table.

Dimension:

```text
Session campaign
```

Metrics:

```text
Sessions
Active users
Key events
```

## Скриншот
Campaign table.

---

# Слайд 640. Конкретный Reel

## Заголовок
Шаг 16. Content

## Текст
Создайте таблицу:

Dimension:

```text
Session manual ad content
```

Ищем:

```text
reel01
reel02
```

## Скриншот
Content table.

---

# Слайд 641. Теперь UTM полностью видна

## Заголовок
Source → Campaign → Content

## Текст

```text
instagram
↓
backend_guide
↓
reel01
```

На dashboard можно анализировать каждый уровень отдельно.

## Визуал
Иерархия UTM.

---

# Слайд 642. Device Category

## Заголовок
Шаг 17. Устройства

## Текст
Добавьте Bar Chart или Donut Chart.

Dimension:

```text
Device category
```

Metric:

```text
Active users
```

Получим:

```text
mobile
desktop
tablet
```

## Скриншот
Device chart.

---

# Слайд 643. Control по Source

## Заголовок
Шаг 18. Interactive Dashboard

## Текст
Добавьте:

**Add a control → Drop-down list**

Control field:

```text
Session source
```

Теперь пользователь может выбрать:

```text
instagram
direct
google
```

## Скриншот
Drop-down control.

---

# Слайд 644. Control по Campaign

## Заголовок
Шаг 19. Campaign Filter

## Текст
Создайте второй Drop-down.

Control field:

```text
Session campaign
```

Теперь dashboard можно переключить, например, только на:

```text
backend_guide
```

## Скриншот
Campaign Drop-down.

---

# Слайд 645. Control ≠ Editor Filter

## Заголовок
Кто управляет фильтром

## Текст
**Filter Property**

настраивает автор отчёта.

**Control**

может менять пользователь в View mode.

## Визуал

```text
EDITOR FILTER
fixed

CONTROL
interactive
```

---

# Слайд 646. Cross-filtering

## Заголовок
Шаг 20. График становится фильтром

## Текст
Для поддерживаемых charts можно включить:

```text
Cross-filtering
```

После этого клик по:

```text
instagram
```

на графике может отфильтровать другие компоненты страницы.

## Скриншот
Chart interactions → Cross-filtering.

---

# Слайд 647. Проверяем

## Заголовок
Шаг 21. View Mode

## Текст
Переключитесь в View.

Нажмите на:

```text
instagram
```

в графике Traffic Sources.

Посмотрите, изменились ли другие charts.

## Скриншот
Dashboard после cross-filter.

---

# Слайд 648. Первая страница готова

## Заголовок
01 — Web Analytics

## Текст
Она отвечает:

```text
сколько трафика?
откуда?
какие кампании?
какой Reel?
какие устройства?
сколько Key Events?
что происходило во времени?
```

## Визуал
Полный скриншот Page 1.

---

# Слайд 649. Но здесь нет реальной заявки

## Заголовок
generate_lead ≠ запись в таблице

## Текст
GA4 знает:

```text
generate_lead
```

Но не хранит нашу операционную сущность:

```text
request_id
status
```

Для этого подключаем второй источник.

## Визуал
GA4 → Analytics.

Sheets → Operations.

---

# Слайд 650. Добавляем вторую страницу

## Заголовок
Шаг 22. Leads

## Текст
Создайте Page:

```text
02 — Leads
```

На ней будем использовать Google Sheets.

## Скриншот
Manage pages.

---

# Слайд 651. Перед подключением Sheets

## Заголовок
Таблица должна быть пригодна для BI

## Текст
Наш лист:

```text
leads
```

должен иметь структуру:

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

## Визуал
Google Sheet.

---

# Слайд 652. Одна строка = одна заявка

## Заголовок
Главное правило

## Текст
Правильно:

```text
REQ-001 | ...
REQ-002 | ...
REQ-003 | ...
```

Не добавляем внутрь dataset:

```text
ИТОГО
комментарии
пустые заголовки
объединённые ячейки
```

## Визуал
Clean table / messy table.

---

# Слайд 653. Не добавляем Total Row

## Заголовок
Агрегацию делает Data Studio

## Текст
Не нужно хранить:

```text
TOTAL = 150
```

внизу Google Sheet.

Иначе dashboard может посчитать итоговую строку как ещё одну обычную запись.

## Визуал

```text
raw rows ✓
manual totals ✕
```

---

# Слайд 654. Добавляем Data Source

## Заголовок
Шаг 23. Google Sheets

## Текст
В Report:

**Add data**

↓

**Google Sheets**

Выберите таблицу:

```text
GA4 Analytics Lab — Leads
```

## Скриншот
Google Sheets connector.

---

# Слайд 655. Выбираем Worksheet

## Заголовок
Шаг 24. leads

## Текст
Google Sheets connector подключается к конкретному worksheet.

Выберите:

```text
leads
```

## Скриншот
Spreadsheet + Worksheet picker.

---

# Слайд 656. First Row as Headers

## Заголовок
Шаг 25. Заголовки

## Текст
Оставляем:

```text
Use first row as headers
```

Data Studio должен получить поля:

```text
request_id
created_at
...
status
```

а не:

```text
A
B
C
D
```

## Скриншот
Connector options.

---

# Слайд 657. Проверяем Schema

## Заголовок
Шаг 26. Fields

## Текст
Перед построением charts проверьте типы.

Особенно:

```text
created_at
```

должен распознаваться как Date / Date & Time.

А:

```text
request_id
```

как Text.

## Скриншот
Data source fields.

---

# Слайд 658. Dimension и Metric снова

## Заголовок
Sheets сам по себе не знает бизнес-смысл

## Текст
Например:

```text
status
```

логично использовать как Dimension.

Но:

```text
сколько заявок?
```

нам нужно определить самим.

## Визуал

```text
request_id
↓
COUNT DISTINCT
↓
Leads
```

---

# Слайд 659. Calculated Field

## Заголовок
Шаг 27. Создаём Lead Count

## Текст
Создайте Calculated Field:

```text
Lead Count
```

Формула:

```text
COUNT_DISTINCT(request_id)
```

Теперь считаем уникальные заявки.

## Скриншот
Create field.

---

# Слайд 660. Почему не просто Count Rows

## Заголовок
У нас уже есть уникальный ID

## Текст
Если случайно появится технический дубль, количество строк может отличаться от количества уникальных заявок.

Поэтому используем:

```text
COUNT_DISTINCT(request_id)
```

## Визуал

```text
rows = 11
unique request_id = 10
```

---

# Слайд 661. Scorecard Leads

## Заголовок
Шаг 28. Actual Leads

## Текст
Добавьте Scorecard.

Data Source:

```text
Google Sheets — leads
```

Metric:

```text
Lead Count
```

Название:

```text
Actual Leads
```

## Скриншот
Scorecard.

---

# Слайд 662. Done Leads

## Заголовок
Шаг 29. Успешно обработанные

## Текст
Скопируйте Scorecard.

Добавьте Filter:

```text
Include
status
Equal to
done
```

Название:

```text
Done
```

## Скриншот
Filtered scorecard.

---

# Слайд 663. New Leads

## Заголовок
Шаг 30. Новые заявки

## Текст
Ещё одна Scorecard.

Filter:

```text
status = new
```

Название:

```text
New
```

## Скриншот
New scorecard.

---

# Слайд 664. In Progress

## Заголовок
Шаг 31. В обработке

## Текст
Создайте:

```text
status = in_progress
```

Получаем верхнюю строку:

```text
Actual Leads
New
In Progress
Done
```

## Скриншот
4 Scorecards.

---

# Слайд 665. Status Distribution

## Заголовок
Шаг 32. Структура заявок

## Текст
Добавьте Bar Chart.

Dimension:

```text
status
```

Metric:

```text
Lead Count
```

## Скриншот
Status chart.

---

# Слайд 666. Почему Bar, а не только Pie

## Заголовок
Главное — читаемость

## Текст
Например:

```text
new          42
in_progress  15
done          9
rejected      4
```

Bar Chart позволяет быстро сравнить величины.

## Визуал
Bar chart.

---

# Слайд 667. Leads by Source

## Заголовок
Шаг 33. Источник реальных заявок

## Текст
Добавьте Table:

Dimension:

```text
utm_source
```

Metric:

```text
Lead Count
```

## Скриншот
Leads by Source.

---

# Слайд 668. Leads by Campaign

## Заголовок
Шаг 34. Кампании

## Текст
Dimension:

```text
utm_campaign
```

Metric:

```text
Lead Count
```

Получаем:

```text
backend_guide
frontend_guide
analytics_guide
```

## Скриншот
Campaign leads table.

---

# Слайд 669. Leads over Time

## Заголовок
Шаг 35. Динамика заявок

## Текст
Добавьте Time Series.

Dimension:

```text
created_at
```

Metric:

```text
Lead Count
```

## Скриншот
Lead trend.

---

# Слайд 670. Date Type важен

## Заголовок
Если график не строится

## Текст
Проверьте, что:

```text
created_at
```

имеет тип Date / Date & Time.

Если поле осталось Text, Data Studio не сможет корректно использовать его как временную ось.

## Скриншот
Data Source → field type.

---

# Слайд 671. Status Control

## Заголовок
Шаг 36. Интерактивная фильтрация

## Текст
Добавьте Drop-down:

```text
status
```

Пользователь сможет выбрать:

```text
new
in_progress
done
rejected
```

## Скриншот
Status control.

---

# Слайд 672. Source Control

## Заголовок
Шаг 37. UTM Source

## Текст
Добавьте второй control:

```text
utm_source
```

Теперь можно посмотреть только заявки:

```text
instagram
```

## Скриншот
utm_source filter.

---

# Слайд 673. Вторая страница готова

## Заголовок
02 — Leads

## Текст
Она отвечает:

```text
сколько реальных заявок?
какие статусы?
какой источник?
какая кампания?
как меняется количество заявок?
```

## Визуал
Полный Page 2.

---

# Слайд 674. Теперь самое интересное

## Заголовок
Два dashboard пока существуют отдельно

## Текст
Page 1 говорит:

```text
Instagram
100 Sessions
8 GA4 Leads
```

Page 2:

```text
Instagram
7 Actual Leads
3 Done
```

Хотим увидеть их рядом.

## Визуал
Marketing ↔ Business.

---

# Слайд 675. Почему нельзя просто добавить два столбца

## Заголовок
Это разные Data Sources

## Текст
GA4 имеет:

```text
Session source
Session campaign
```

Google Sheets:

```text
utm_source
utm_campaign
```

Data Studio должен понять, какие строки относятся друг к другу.

## Визуал
Two tables → JOIN.

---

# Слайд 676. Data Blending

## Заголовок
Соединяем несколько источников

## Текст
**Blend** позволяет создать chart на основе нескольких Data Sources.

Например:

```text
GA4
+
Google Sheets
```

## Визуал

```text
SOURCE A
  \
   → BLEND → CHART
  /
SOURCE B
```

---

# Слайд 677. Вспоминаем базы данных

## Заголовок
Это очень похоже на JOIN

## Текст
Нам нужно определить:

```text
какие поля совпадают?
```

Например:

```text
GA4 Session source
=
Sheets utm_source
```

и:

```text
GA4 Session campaign
=
Sheets utm_campaign
```

## Визуал
JOIN conditions.

---

# Слайд 678. Почему Source недостаточно

## Заголовок
Instagram содержит несколько кампаний

## Текст
Если соединить только:

```text
instagram = instagram
```

мы смешаем:

```text
backend_guide
frontend_guide
analytics_guide
```

Поэтому используем минимум:

```text
Source + Campaign
```

## Визуал
Bad join / better join.

---

# Слайд 679. Создаём третью страницу

## Заголовок
Шаг 38. Marketing → Business

## Текст
Добавьте:

```text
03 — Marketing → Business
```

Здесь будут blended data.

## Скриншот
Pages.

---

# Слайд 680. Открываем Blend

## Заголовок
Шаг 39. Manage blends

## Текст
Откройте:

**Resource**

↓

**Manage blended data**

↓

**Add a blend**

## Скриншот
Manage blends.

---

# Слайд 681. Table 1 — GA4

## Заголовок
Шаг 40. Маркетинговые данные

## Текст
Для GA4 добавьте Dimensions:

```text
Session source
Session campaign
```

Metrics:

```text
Sessions
Active users
Key events
```

## Скриншот
Blend editor → GA4 table.

---

# Слайд 682. Table 2 — Leads

## Заголовок
Шаг 41. Операционные данные

## Текст
Добавьте Google Sheets.

Dimensions:

```text
utm_source
utm_campaign
```

Metric:

```text
Lead Count
```

## Скриншот
Blend editor → Sheets.

---

# Слайд 683. Join Condition №1

## Заголовок
Source

## Текст
Укажите:

```text
Session source
=
utm_source
```

Например:

```text
instagram = instagram
```

## Скриншот
Join configuration.

---

# Слайд 684. Join Condition №2

## Заголовок
Campaign

## Текст
Добавьте второе условие:

```text
Session campaign
=
utm_campaign
```

Теперь строки должны совпасть сразу по двум признакам.

## Скриншот
Два join conditions.

---

# Слайд 685. Join Type

## Заголовок
Шаг 42. Left Outer Join

## Текст
Для нашего dashboard удобно оставить GA4 слева.

Используем:

```text
Left Outer Join
```

Тогда увидим даже кампании, у которых:

```text
Sessions > 0
Leads = 0
```

## Визуал

```text
GA4 campaigns
↓
все сохраняются
```

---

# Слайд 686. Почему это полезно

## Заголовок
Кампания без заявки тоже важна

## Текст
Например:

```text
Campaign          Sessions   Leads

backend_guide       100        8
frontend_guide       50        4
test_campaign        30        0
```

`test_campaign` нельзя потерять из отчёта.

## Визуал
Таблица.

---

# Слайд 687. Сохраняем Blend

## Заголовок
Шаг 43. Naming

## Текст
Название:

```text
GA4 + Leads by Source Campaign
```

Нажмите:

**Save**

## Скриншот
Blend name + Save.

---

# Слайд 688. Создаём совместную таблицу

## Заголовок
Шаг 44. Campaign Performance

## Текст
Используйте Blend как Data Source.

Dimensions:

```text
Session source
Session campaign
```

Metrics:

```text
Sessions
Key events
Lead Count
```

## Скриншот
Blended table.

---

# Слайд 689. Вот ради чего делали всю цепочку

## Заголовок
Маркетинговые и реальные данные рядом

## Текст

```text
Campaign        Sessions   GA4 Lead   Actual Lead

backend_guide      100         9          8
frontend_guide      70         6          6
analytics_guide     40         4          3
```

Теперь можно увидеть разницу.

## Визуал
Таблица крупно.

---

# Слайд 690. Почему GA4 Lead может отличаться от Actual Lead

## Заголовок
Это не обязательно ошибка dashboard

## Текст
Например:

```text
GA4 generate_lead = 9
Google Sheets leads = 8
```

Возможные причины:

событие сработало, а запись не сохранилась;

одно событие сработало несколько раз;

разные периоды;

разные условия подсчёта;

технические ошибки.

## Визуал

```text
ANALYTICS EVENT
≠
BUSINESS RECORD
```

---

# Слайд 691. Reconciliation

## Заголовок
Сверяем системы

## Текст
Теперь можно задавать инженерный вопрос:

```text
Почему GA4 говорит 9,
а система заявок говорит 8?
```

Это уже задача контроля целостности процесса.

## Визуал

```text
GA4
9
↕ reconcile
SHEETS
8
```

---

# Слайд 692. Добавляем Done

## Заголовок
Шаг 45. Бизнес-результат глубже Lead

## Текст
Мы можем дополнительно вывести:

```text
Actual Leads
Done Leads
```

И получить цепочку:

```text
Sessions
↓
GA4 Lead
↓
Actual Lead
↓
Done
```

## Визуал
Ступенчатая схема.

---

# Слайд 693. Настоящий смысл dashboard

## Заголовок
Не просто «сколько переходов»

## Текст
Теперь можем анализировать:

```text
Instagram
↓
100 Sessions
↓
9 generate_lead
↓
8 actual leads
↓
3 done
```

Это уже связь маркетинга с реальным процессом.

## Визуал
Большая воронка.

---

# Слайд 694. Calculated Fields

## Заголовок
Можно создавать собственные показатели

## Текст
Data Studio поддерживает Calculated Fields.

Мы уже использовали:

```text
COUNT_DISTINCT(request_id)
```

Также можно строить производные показатели.

## Визуал

```text
existing fields
↓ formula
new metric
```

---

# Слайд 695. Conversion Rate

## Заголовок
Дополнительная практика

## Текст
При корректно подготовленном Blend можно создать показатель:

```text
Lead Rate
```

логически:

```text
Actual Leads / Sessions
```

Например:

```text
8 / 100 = 8%
```

## Визуал
Sessions → % → Leads.

## Примечание
Перед использованием ratio обязательно проверить агрегацию полей в Blend.

---

# Слайд 696. Почему агрегация важна

## Заголовок
Dashboard может красиво показывать неправильное число

## Текст
Если неправильно соединить данные:

```text
100 Sessions
```

могут повториться несколько раз.

Получим математически корректный, но смыслово неверный результат.

## Визуал

```text
CORRECT FORMULA
+
WRONG DATA MODEL
=
WRONG ANSWER
```

---

# Слайд 697. Blend — не магия

## Заголовок
Нужно понимать Granularity

## Текст
Перед JOIN задайте вопрос:

```text
Одна строка здесь означает что?
```

В GA4:

```text
campaign aggregation
```

В Sheets:

```text
individual lead
```

Data Studio агрегирует данные перед соединением согласно выбранным Dimensions.

## Визуал
Different granularity.

---

# Слайд 698. Зачем нужен request_id

## Заголовок
Уникальные идентификаторы снова важны

## Текст
В Sheets каждая реальная заявка имеет:

```text
request_id
```

Это позволяет считать:

```text
COUNT_DISTINCT(request_id)
```

и контролировать дубли.

То, что мы сделали несколько тем назад, снова используется.

## Визуал
REQ-001 → unique.

---

# Слайд 699. Controls с несколькими Data Sources

## Заголовок
Есть важное ограничение

## Текст
Control, созданный для GA4:

```text
Session source
```

не обязан автоматически фильтровать chart Google Sheets с полем:

```text
utm_source
```

Это разные Data Sources и разные поля.

## Визуал

```text
GA4 control
↓
GA4 charts ✓

Sheets chart
? 
```

---

# Слайд 700. Поэтому не строим один гигантский фильтр

## Заголовок
На первых dashboard разделяем ответственность

## Текст
Page 1:

```text
GA4 controls
```

Page 2:

```text
Sheets controls
```

Page 3:

```text
Blend controls
```

Это понятнее и надёжнее для первого проекта.

## Визуал
Три страницы / три scopes.

---

# Слайд 701. Date Range тоже требует внимания

## Заголовок
Источники имеют разные правила

## Текст
GA4 обычно работает с выбранным аналитическим периодом.

Google Sheets содержит все строки таблицы.

Чтобы Date Range работал на Leads, необходимо правильно указать:

```text
created_at
```

как date dimension.

## Визуал
GA4 Date / Sheets created_at.

---

# Слайд 702. Проверяем одинаковый период

## Заголовок
Нельзя сравнивать неделю с годом

## Текст
Перед сравнением:

```text
GA4 Leads
vs
Actual Leads
```

проверьте одинаковый временной диапазон.

Иначе расхождение ничего не означает.

## Визуал

```text
GA4: 7 days
Sheets: all time
✕
```

---

# Слайд 703. Dashboard Design

## Заголовок
Теперь немного о визуальной логике

## Текст
На первом экране должно быть видно:

```text
KPI
↓
trend
↓
breakdown
↓
details
```

Не размещаем элементы случайно.

## Визуал
Иерархия dashboard.

---

# Слайд 704. Верх страницы

## Заголовок
Главные показатели

## Текст
Сверху:

```text
Sessions
Users
GA4 Leads
Actual Leads
Done
```

Человек должен увидеть состояние за несколько секунд.

## Визуал
Ряд Scorecards.

---

# Слайд 705. Середина

## Заголовок
Показываем изменение

## Текст
Time Series отвечает:

> ситуация стабильна, улучшается или ухудшается?

Это полезнее, чем только одно итоговое число.

## Визуал
Trend.

---

# Слайд 706. Низ страницы

## Заголовок
Детализация

## Текст
Там располагаем:

```text
source
campaign
content
device
status
```

Пользователь сначала замечает проблему, затем проваливается в детали.

## Визуал
Overview → Detail.

---

# Слайд 707. Не делаем график для каждого поля

## Заголовок
Dashboard ≠ коллекция диаграмм

## Текст
Если таблица отвечает на вопрос лучше — используйте таблицу.

Если одно число достаточно — Scorecard.

Если важна динамика — Time Series.

Если нужно сравнение категорий — Bar Chart.

## Визуал
Question → Visualization.

---

# Слайд 708. Слишком много цветов

## Заголовок
Цвет тоже несёт смысл

## Текст
Не нужно делать:

```text
Sessions — синий
Users — зелёный
Leads — красный
Done — жёлтый
...
```

если цвет не объясняет данные.

Лучше простой и последовательный интерфейс.

## Визуал
Busy dashboard ✕ / clean dashboard ✓.

---

# Слайд 709. Один цвет — одно значение

## Заголовок
Пример

## Текст
Например, выделяем только:

```text
Warning
Problem
Target
```

Остальное остаётся нейтральным.

## Визуал
Minimal dashboard.

---

# Слайд 710. View Mode

## Заголовок
Шаг 46. Пользуемся собственным dashboard

## Текст
Переключитесь в:

**View**

Проверьте:

Date Range;

Source controls;

Campaign controls;

cross-filtering;

pages.

## Скриншот
View Mode.

---

# Слайд 711. Тест №1

## Заголовок
Instagram

## Текст
На Page 1 выберите:

```text
Source = instagram
```

Посмотрите:

```text
Sessions
Users
Campaigns
Key Events
```

## Скриншот
Отфильтрованный Page 1.

---

# Слайд 712. Тест №2

## Заголовок
backend_guide

## Текст
Выберите:

```text
Campaign = backend_guide
```

Проверьте:

```text
Sessions
reel content
events
```

## Скриншот
Campaign filter.

---

# Слайд 713. Тест №3

## Заголовок
Actual Leads

## Текст
На Page 2:

```text
utm_source = instagram
```

Проверьте:

```text
Total Leads
Statuses
Campaign
```

## Скриншот
Page 2 Instagram.

---

# Слайд 714. Тест №4

## Заголовок
Сверяем системы

## Текст
На Page 3 найдите:

```text
backend_guide
```

Сравните:

```text
Sessions
GA4 Key Events
Actual Leads
```

## Скриншот
Blend table.

---

# Слайд 715. Аналитическое задание

## Заголовок
Не сдаём только красивые скриншоты

## Текст
Ответьте:

> Какая кампания привела больше всего Sessions?

> Какая — больше Actual Leads?

> Совпадает ли лидер?

> Есть ли расхождение GA4 Leads и Actual Leads?

> Какая гипотеза объясняет расхождение?

## Визуал
Question cards.

---

# Слайд 716. Ещё один вопрос

## Заголовок
А где бизнес-результат?

## Текст
Представим:

```text
Campaign A
1000 sessions
40 leads
2 done

Campaign B
300 sessions
25 leads
10 done
```

Какая кампания лучше?

## Визуал
A vs B.

---

# Слайд 717. Traffic ≠ Business Value

## Заголовок
Главный вывод

## Текст
Большой traffic не гарантирует:

```text
много leads
```

Много leads не гарантирует:

```text
много successful outcomes
```

Поэтому нужны данные разных этапов процесса.

## Визуал

```text
TRAFFIC
↓
LEAD
↓
OUTCOME
```

---

# Слайд 718. Sharing

## Заголовок
Шаг 47. Поделиться dashboard

## Текст
Нажмите:

**Share**

Можно дать пользователю:

```text
Viewer
```

или:

```text
Editor
```

Не всем нужен Edit access.

## Скриншот
Share dialog.

---

# Слайд 719. Viewer

## Заголовок
Использует dashboard

## Текст
Viewer может:

смотреть отчёт;

переключать pages;

использовать controls;

исследовать разрешённые данные.

Но не должен менять структуру dashboard.

## Визуал
VIEWER.

---

# Слайд 720. Editor

## Заголовок
Меняет dashboard

## Текст
Editor может:

добавлять charts;

менять Data Sources;

изменять filters;

редактировать структуру.

Поэтому права выдаём осознанно.

## Визуал
EDITOR.

---

# Слайд 721. Права на Report ≠ права на данные

## Заголовок
Очень важное различие

## Текст
Отдельно существуют:

```text
Report permissions
```

и:

```text
Data credentials
```

То, что человек может открыть dashboard, ещё не объясняет, от чьего имени Data Studio читает данные.

## Визуал
REPORT ACCESS / DATA ACCESS.

---

# Слайд 722. Owner's Credentials

## Заголовок
Данные от имени владельца

## Текст
При Owner's Credentials Data Studio использует доступ владельца Data Source.

Это может позволить viewer видеть данные dashboard, даже если у него нет прямого доступа к исходной таблице.

Используем осторожно.

## Визуал

```text
VIEWER
↓
OWNER CREDENTIALS
↓
DATA
```

---

# Слайд 723. Viewer's Credentials

## Заголовок
Каждый использует собственный доступ

## Текст
При Viewer's Credentials пользователь должен сам иметь доступ к исходному dataset.

Это другая модель безопасности.

## Визуал

```text
VIEWER
↓ own credentials
DATA
```

---

# Слайд 724. Почему не публикуем всё в интернет

## Заголовок
Dashboard может содержать чувствительные данные

## Текст
На нашей учебной Page Leads могут находиться:

```text
name
email
request_id
```

Поэтому не создаём публичную ссылку на реальные пользовательские данные.

Для лаборатории используем только тестовые записи.

## Визуал
Public internet ✕ / controlled sharing ✓.

---

# Слайд 725. А нужны ли вообще name и email на dashboard?

## Заголовок
Минимизируем данные

## Текст
Для аналитического dashboard обычно достаточно:

```text
request_id
source
campaign
status
date
```

Имена и email можно вообще не выводить.

## Визуал

```text
NEEDED FOR ANALYSIS?
YES / NO
```

---

# Слайд 726. Dashboard и CRM — разные системы

## Заголовок
Не пытаемся обрабатывать заявки здесь

## Текст
Data Studio хорошо показывает:

```text
что происходит?
```

Но он не предназначен для процесса:

```text
назначить менеджера
поменять stage
оставить комментарий
связаться с клиентом
```

## Визуал

```text
DATA STUDIO
ANALYZE

CRM
OPERATE
```

---

# Слайд 727. Теперь проблема CRM стала очевидной

## Заголовок
Google Sheets начинает изображать CRM

## Текст
Мы уже храним:

```text
request_id
status
```

Но если появятся:

```text
owner
activities
notes
pipeline
history
```

таблица начнёт становиться неудобной.

## Визуал
Spreadsheet → overloaded.

---

# Слайд 728. Следующий логичный инструмент

## Заголовок
CRM

## Текст
На следующей теме:

```text
Contact
Deal
Pipeline
Stage
Properties
Import
Mapping
```

И перенесём подготовленные заявки в настоящую CRM.

## Визуал
Sheets → CRM.

---

# Слайд 729. Но сначала артефакты

## Заголовок
Что должно быть готово

## Текст
Dashboard должен содержать:

```text
01 — Web Analytics
02 — Leads
03 — Marketing → Business
```

И два Data Sources:

```text
GA4
Google Sheets
```

плюс Blend.

## Визуал
Структура отчёта.

---

# Слайд 730. Что необходимо сохранить

## Заголовок
Контрольные скриншоты

## Текст
Сохраните:

1. Data Studio Home;
2. Google Analytics connector;
3. выбранный GA4 Property;
4. редактор Page 1;
5. Sessions Scorecard;
6. GA4 Leads Filter;
7. Date Range Control;
8. Time Series;
9. Traffic Sources;
10. Campaign table;
11. Content / Reel table;
12. Source Control;
13. Cross-filtering;
14. Google Sheets connector;
15. выбранный worksheet `leads`;
16. schema Google Sheets;
17. calculated `Lead Count`;
18. Actual Leads Scorecard;
19. Status chart;
20. Leads by Source;
21. Leads by Campaign;
22. Leads Time Series;
23. Blend Editor;
24. два Join Conditions;
25. Left Outer Join;
26. итоговую blended table;
27. View Mode;
28. Share permissions.

## Визуал
Checklist.

---

# Слайд 731. Что студент должен объяснить

## Заголовок
Контроль понимания

## Текст
Студент должен объяснить:

что такое Data Studio;

чем Data Source отличается от Report;

что такое Connector;

что такое Scorecard;

зачем Date Range Control;

чем Filter отличается от Control;

что такое Cross-filtering;

как подключается GA4;

как подключается Google Sheets;

почему одна строка Sheet должна представлять одну сущность;

зачем `COUNT_DISTINCT(request_id)`;

что такое Calculated Field;

что такое Data Blend;

что такое Join Condition;

почему используем Source + Campaign;

что такое Left Outer Join;

почему GA4 Lead может отличаться от Actual Lead;

почему неправильный Join может испортить показатели;

чем Viewer отличается от Editor;

что такое Data Credentials.

---

# Слайд 732. Итог темы

## Заголовок
Мы связали аналитику и операционные данные

## Текст

```text
INSTAGRAM
↓
MANYCHAT
↓
WEBSITE
↓
GA4
        ↘
         DATA STUDIO
        ↗
GOOGLE SHEETS
```

Теперь на одном dashboard можно видеть путь:

```text
TRAFFIC
↓
EVENT
↓
LEAD
↓
STATUS
```

## Визуал
Полная архитектура.

---

# Слайд 733. Мы дошли до нового уровня

## Заголовок
От технической аналитики к управленческой

## Текст
Раньше вопрос был:

```text
Сработало ли событие?
```

Теперь:

```text
Какой источник эффективнее?

Где теряются пользователи?

Сколько событий превращается в реальные заявки?

Сколько заявок действительно обработано?
```

## Визуал
Technical → Business Analytics.

---

# Слайд 734. Следующая тема

## Заголовок
CRM: Contact, Deal и Pipeline

## Текст
Следующая проблема:

```text
Заявка появилась.
Кто её обрабатывает?
Что с ней сейчас?
Какие действия уже выполнены?
Кто ответственный?
```

Google Sheets становится недостаточно.

Следующий шаг:

```text
clean leads
↓
CRM
↓
Contact
↓
Deal
↓
Pipeline
↓
Stage
```

## Визуал
Dashboard → CRM.