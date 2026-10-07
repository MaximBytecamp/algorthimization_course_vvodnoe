# Слайд 450. Где мы остановились

## Заголовок
Данные уже собираются

## Текст
Наша система уже умеет фиксировать путь:

```text
Instagram
↓
ManyChat
↓
UTM
↓
Vercel
↓
GA4
↓
form_start
↓
generate_lead
↓
Google Sheets
```

До сих пор мы в основном спрашивали:

**«Данные пришли?»**

Теперь вопрос другой:

**«Что эти данные означают?»**

## Визуал
Слева — вся архитектура.

Справа:

```text
COLLECTING DATA ✓
ANALYZING DATA ?
```

---

# Слайд 451. Новая задача

## Заголовок
Из измерения — в анализ

## Текст
Теперь хотим отвечать на вопросы:

```text
Откуда приходят пользователи?

Какие кампании работают лучше?

На какой странице начинают путь?

Где выпадают из воронки?

Какие события происходят чаще?

Какие пользователи доходят до заявки?

Что происходило перед generate_lead?
```

## Визуал
Большой знак вопроса над таблицей GA4.

---

# Слайд 452. В GA4 несколько уровней анализа

## Заголовок
Не существует одного «главного отчёта»

## Текст

```text
Realtime
↓
Reports
↓
Comparisons
↓
Explorations
↓
Advertising / Attribution
↓
Insights
↓
Custom Reports
```

Каждый инструмент отвечает на разные вопросы.

## Визуал
Лестница от простого к более глубокому анализу.

---

# Слайд 453. Realtime мы уже знаем

## Заголовок
Realtime — диагностика прямо сейчас

## Текст
Realtime хорошо отвечает на вопросы:

```text
Пришёл ли пользователь?

Пришёл ли event?

Определился ли source?

Сработал ли generate_lead?
```

Но Realtime плохо подходит для анализа поведения за неделю или месяц.

## Визуал

```text
Realtime
= NOW
```

---

# Слайд 454. Reports

## Заголовок
Стандартные отчёты

## Текст
Reports нужны для регулярно повторяющихся вопросов.

Например:

```text
Сколько пользователей было?

Откуда они пришли?

Какие страницы открывали?

Какие события выполняли?

Сколько было key events?
```

## Визуал

```text
REPORTS
=
готовые представления данных
```

---

# Слайд 455. Explorations

## Заголовок
Когда стандартного отчёта недостаточно

## Текст
Explore нужен, когда вопрос становится сложнее.

Например:

> Пользователи из Instagram, пришедшие по `backend_guide`, чаще доходят до `generate_lead`, чем direct traffic?

Или:

> Что пользователи обычно делают перед `generate_lead`?

## Визуал

```text
REPORT
Что произошло?

EXPLORE
Почему и каким путём?
```

---

# Слайд 456. План темы

## Заголовок
Что изучим

## Текст

```text
Reports
↓
Acquisition
↓
Engagement
↓
Landing Pages
↓
Comparisons
↓
Explore
↓
Free Form
↓
Funnel Exploration
↓
Path Exploration
↓
Segments
↓
Attribution
↓
Insights
↓
Export
```

## Визуал
Roadmap на весь экран.

---

# Слайд 457. Открываем GA4

## Заголовок
Шаг 1. Reports

## Текст
Откройте нужный GA4 Property.

В левом меню выберите:

**Reports**

Не открывайте пока Explore.

Сначала разберём готовые отчёты.

## Скриншот
GA4 с выделенным `Reports`.

---

# Слайд 458. Reports Snapshot

## Заголовок
Первый обзор

## Текст
Reports Snapshot даёт быстрый обзор состояния ресурса.

Там могут находиться карточки:

users;

sessions;

traffic;

events;

key events;

pages;

другие показатели.

Состав зависит от конфигурации ресурса.

## Скриншот
Reports Snapshot целиком.

---

# Слайд 459. Не анализируем dashboard глазами хаотично

## Заголовок
Сначала задаём вопрос

## Текст
Плохо:

> Посмотрю на графики и, может быть, что-нибудь замечу.

Хорошо:

> Сколько пользователей пришло из Instagram за последние 7 дней?

После вопроса выбираем нужный отчёт.

## Визуал

```text
QUESTION
↓
REPORT
↓
ANSWER
```

---

# Слайд 460. Date Range

## Заголовок
Первый фильтр любого анализа — время

## Текст
В правом верхнем углу отчётов находится период.

Например:

```text
Today
Last 7 days
Last 28 days
Custom
```

Данные без понимания периода почти бессмысленны.

## Скриншот
Date range picker.

---

# Слайд 461. Сравнение периодов

## Заголовок
10 заявок — это много или мало?

## Текст
Само число:

```text
10 generate_lead
```

ничего не говорит.

Но:

```text
прошлая неделя: 4
эта неделя: 10
```

уже показывает изменение.

## Визуал

```text
4 → 10
+150%
```

---

# Слайд 462. Dimension и Metric

## Заголовок
Два главных типа полей аналитики

## Текст
**Dimension** описывает объект.

Например:

```text
Session source
Campaign
Page path
Device category
Event name
```

**Metric** — числовое измерение.

Например:

```text
Users
Sessions
Event count
Key events
Engagement rate
```

## Визуал
DIMENSION → «что?»

METRIC → «сколько?»

---

# Слайд 463. Пример

## Заголовок
Источник + количество сессий

## Текст

Dimension:

```text
Session source
```

Metric:

```text
Sessions
```

Результат:

```text
instagram     40
direct        31
google        12
```

## Визуал
Простая таблица.

---

# Слайд 464. Почему это важно

## Заголовок
Отчёт строится из вопросов к данным

## Текст
Вопрос:

> Сколько сессий пришло из каждого источника?

Разбираем:

```text
что сравниваем?
→ source

что считаем?
→ sessions
```

## Визуал

```text
QUESTION
↓
DIMENSION + METRIC
```

---

# Слайд 465. Acquisition

## Заголовок
Откуда пришли пользователи?

## Текст
Откройте отчёты Acquisition.

Здесь нас особенно интересуют:

```text
User acquisition
Traffic acquisition
```

На первый взгляд они похожи.

Но отвечают на разные вопросы.

## Скриншот
Reports → Acquisition.

---

# Слайд 466. User Acquisition

## Заголовок
Как пользователь впервые нас нашёл?

## Текст
User acquisition ориентирован на **первичное привлечение нового пользователя**.

Упрощённый вопрос:

> Откуда этот пользователь впервые появился у нас?

## Визуал

```text
USER
↓ first visit
instagram
```

---

# Слайд 467. Traffic Acquisition

## Заголовок
Откуда пришла конкретная сессия?

## Текст
Traffic acquisition анализирует источник **сессии**.

Один пользователь может прийти:

первый раз из Instagram;

потом напрямую;

позже из Google.

Это будут разные sessions.

## Визуал

```text
USER
├→ Instagram
├→ Direct
└→ Google
```

---

# Слайд 468. Не путайте

## Заголовок
User scope и Session scope

## Текст
**User Acquisition**

```text
Как пользователь впервые появился?
```

**Traffic Acquisition**

```text
Что привело эту конкретную сессию?
```

Для анализа нашей Instagram-воронки чаще нужен:

**Traffic Acquisition**

## Визуал
USER / SESSION.

---

# Слайд 469. Открываем Traffic Acquisition

## Заголовок
Шаг 2. Анализируем текущий трафик

## Текст
Откройте:

**Reports → Acquisition → Traffic acquisition**

Найдите таблицу с источниками или группами каналов.

## Скриншот
Traffic Acquisition целиком.

---

# Слайд 470. Session source / medium

## Заголовок
Меняем основное измерение

## Текст
В таблице выберите измерение:

```text
Session source / medium
```

Ищем:

```text
instagram / social
```

## Скриншот
Dimension picker.

## Акцент
Session source / medium.

---

# Слайд 471. Наш Instagram должен появиться

## Заголовок
Проверяем цепочку UTM

## Текст
Если пользователь пришёл по:

```text
utm_source=instagram
utm_medium=social
```

в Traffic Acquisition ожидаем соответствующий источник сессии.

## Скриншот
Строка `instagram / social`.

---

# Слайд 472. Теперь смотрим не только Sessions

## Заголовок
Количество трафика ≠ качество трафика

## Текст
Источник может привести много sessions, но мало целевых действий.

Например:

```text
instagram
100 sessions
5 leads

direct
40 sessions
8 leads
```

## Визуал
Две колонки.

---

# Слайд 473. Engagement Rate

## Заголовок
Что пользователи делали после перехода?

## Текст
В Traffic Acquisition можно смотреть показатели вовлечения.

Не ограничивайтесь количеством Sessions.

Смотрите, взаимодействуют ли пользователи с сайтом.

## Скриншот
Таблица Traffic Acquisition с engagement metrics.

---

# Слайд 474. Campaign

## Заголовок
Источник — ещё не вся история

## Текст
Instagram может содержать несколько кампаний:

```text
backend_guide
frontend_guide
analytics_guide
```

Поэтому нужно уметь анализировать:

```text
Session campaign
```

## Визуал

```text
Instagram
├ backend_guide
├ frontend_guide
└ analytics_guide
```

---

# Слайд 475. Secondary Dimension

## Заголовок
Добавляем второй разрез

## Текст
В detail report рядом с основной dimension нажмите:

**+**

Добавьте дополнительное измерение.

Например:

```text
Session campaign
```

Теперь можно видеть комбинацию:

```text
source / medium + campaign
```

## Скриншот
Кнопка `+` рядом с dimension.

---

# Слайд 476. Пример результата

## Заголовок
Разные кампании одного источника

## Текст

```text
instagram / social | backend_guide   | 52 sessions
instagram / social | frontend_guide  | 31 sessions
instagram / social | analytics_guide | 19 sessions
```

Теперь Instagram перестал быть одной общей строкой.

## Визуал
Таблица.

---

# Слайд 477. utm_content

## Заголовок
А какой Reel работает лучше?

## Текст
Мы использовали:

```text
utm_content=reel01
```

и можем использовать:

```text
utm_content=reel02
```

Это позволяет различать конкретные варианты контента внутри одной кампании.

## Визуал

```text
backend_guide
├ reel01
└ reel02
```

---

# Слайд 478. Но не всё удобно анализировать стандартными Reports

## Заголовок
Начинаются ограничения

## Текст
Когда нам нужно одновременно:

source;

campaign;

content;

events;

lead conversion;

несколько групп пользователей;

стандартный отчёт становится неудобным.

Здесь начинает появляться смысл Explore.

## Визуал
REPORT → слишком много вопросов → EXPLORE.

---

# Слайд 479. Пока остаёмся в Reports

## Заголовок
Сначала ещё несколько важных отчётов

## Текст
Перед Explore нужно научиться находить готовый ответ там, где он уже существует.

Посмотрим:

```text
Landing page
Events
Key events
Pages and screens
Tech
```

## Визуал
Пять карточек.

---

# Слайд 480. Landing Page

## Заголовок
С какой страницы начинается сессия?

## Текст
Landing page — первая страница, которую пользователь увидел в рамках сессии.

Это не обязательно:

```text
/
```

Пользователь может сразу открыть:

```text
/contacts.html
```

или другую страницу.

## Визуал
Internet → first page.

---

# Слайд 481. Открываем Landing Page Report

## Заголовок
Шаг 3. Landing page

## Текст
Откройте:

**Reports → Engagement → Landing page**

Если отчёт отсутствует в текущей коллекции, его расположение может зависеть от настроенной навигации GA4.

## Скриншот
Landing Page report.

---

# Слайд 482. Что искать

## Заголовок
Где начинается пользовательский путь?

## Текст
Сравните:

```text
/
```

```text
/contacts.html
```

другие страницы.

Смотрите:

sessions;

users;

engagement;

key events.

## Скриншот
Landing Page table.

---

# Слайд 483. Landing Page + Source

## Заголовок
Куда попадает Instagram-трафик?

## Текст
Добавьте secondary dimension:

```text
Session source / medium
```

Теперь можно увидеть:

```text
/                  instagram / social
/contacts.html     instagram / social
```

## Скриншот
Landing Page + secondary dimension.

---

# Слайд 484. Возможный вывод

## Заголовок
Трафик приходит не туда

## Текст
Представим:

```text
Instagram → /
```

Но главный CTA находится глубоко на другой странице.

Тогда проблема может быть не в источнике трафика.

Проблема — в landing experience.

## Визуал

```text
Instagram
↓
wrong landing
↓
drop
```

---

# Слайд 485. Pages and Screens

## Заголовок
Какие страницы просматривают?

## Текст
Landing page отвечает:

> С чего началась сессия?

Pages and screens отвечает:

> Какие страницы вообще просматривали?

Это разные вопросы.

## Визуал
Landing page = START.

Pages = ALL VISITED.

---

# Слайд 486. Events Report

## Заголовок
Что пользователи делают?

## Текст
Откройте Events.

Там должны находиться наши события:

```text
page_view
scroll
click
form_start
form_submit
generate_lead
cta_click
```

## Скриншот
Events table.

---

# Слайд 487. Event Count

## Заголовок
Сколько раз событие произошло?

## Текст
Например:

```text
page_view        450
cta_click         81
form_start        32
generate_lead     18
```

Уже можно приблизительно увидеть уменьшение количества действий.

## Визуал
События в виде ступеней.

---

# Слайд 488. Event Count ≠ Users

## Заголовок
Один пользователь может вызвать event несколько раз

## Текст
Например, один человек может нажать CTA три раза.

Тогда:

```text
Users = 1
Event count = 3
```

Нельзя автоматически считать каждое событие отдельным пользователем.

## Визуал
1 USER → click ×3.

---

# Слайд 489. Key Events

## Заголовок
Не все события одинаково важны

## Текст
Мы ранее отметили:

```text
generate_lead
```

как Key Event.

Это позволяет анализировать его не просто как техническое событие, а как важный результат.

## Визуал

```text
page_view
scroll
cta_click
generate_lead ★
```

---

# Слайд 490. Зачем Key Event

## Заголовок
Фокус на бизнес-результате

## Текст
Например:

```text
Instagram:
100 sessions
8 generate_lead

Direct:
50 sessions
7 generate_lead
```

Instagram приводит больше трафика.

Но результат отличается уже не так сильно.

## Визуал
Sessions vs Leads.

---

# Слайд 491. Tech

## Заголовок
Иногда проблема не в маркетинге

## Текст
Tech reports позволяют посмотреть:

device category;

browser;

operating system;

screen resolution;

другие технические характеристики.

## Визуал
Desktop / Mobile / Tablet.

---

# Слайд 492. Практический кейс

## Заголовок
Instagram приводит мобильных пользователей

## Текст
Представим:

```text
Instagram
90% mobile
```

И одновременно:

```text
mobile generate_lead rate
значительно ниже desktop
```

Возможно, проблема находится в мобильной форме.

## Визуал

```text
Traffic ✓
Mobile UX ✕
```

---

# Слайд 493. Аналитика не говорит причину автоматически

## Заголовок
Данные дают сигнал

## Текст
GA4 может показать:

```text
mobile users
↓
редко generate_lead
```

Но GA4 не доказывает:

> форма плохая.

Это гипотеза.

Нужно открыть мобильную версию и проверить.

## Визуал

```text
DATA
↓
HYPOTHESIS
↓
TEST
```

---

# Слайд 494. Comparisons

## Заголовок
Сравниваем группы прямо в Reports

## Текст
В стандартных отчётах можно создавать Comparisons.

Например:

```text
instagram traffic
```

против:

```text
direct traffic
```

## Скриншот
Кнопка создания Comparison.

---

# Слайд 495. Создаём Comparison

## Заголовок
Шаг 4. Instagram

## Текст
Создайте comparison по условию:

```text
Session source
exactly matches
instagram
```

Примените.

## Скриншот
Comparison builder.

---

# Слайд 496. Второе Comparison

## Заголовок
Direct traffic

## Текст
Добавьте ещё одну группу:

```text
Session source
exactly matches
(direct)
```

Теперь графики позволяют визуально сопоставлять две группы.

## Скриншот
Два Comparisons в отчёте.

---

# Слайд 497. Comparison ≠ Filter

## Заголовок
Не одно и то же

## Текст
Filter обычно ограничивает набор.

Comparison позволяет видеть наборы **рядом**.

Например:

```text
Instagram
vs
Direct
```

Это полезно для анализа различий.

## Визуал
FILTER → оставить одну группу.

COMPARISON → две группы рядом.

---

# Слайд 498. Хороший аналитический вопрос

## Заголовок
Не «кто лучше вообще»

## Текст
Лучше задавать конкретно:

> Как отличаются Sessions, Engagement и Key Events у Instagram и Direct за последние 7 дней?

Такой вопрос можно проверить данными.

## Визуал
Question card.

---

# Слайд 499. Экспорт Report

## Заголовок
Данные можно вынести из GA4

## Текст
В стандартном отчёте можно использовать Share / Export.

В зависимости от отчёта доступны варианты:

```text
PDF
CSV
Google Sheets
```

## Скриншот
Share this report → Download / Export.

---

# Слайд 500. Зачем экспорт

## Заголовок
GA4 — не конечная точка анализа

## Текст
Например:

```text
GA4
↓
Google Sheets
↓
дополнительные расчёты
```

или позже:

```text
GA4
↓
Looker Studio
↓
dashboard
```

## Визуал
GA4 → другие аналитические инструменты.

---

# Слайд 501. Что мы умеем Reports

## Заголовок
Промежуточный итог

## Текст
Мы уже можем исследовать:

```text
источники
кампании
landing pages
страницы
events
key events
devices
```

Но теперь появляется сложный вопрос.

## Визуал
Галочки напротив каждого пункта.

---

# Слайд 502. Сложный вопрос

## Заголовок
Где пользователи выпадают?

## Текст
Хотим увидеть:

```text
session_start
↓
page_view
↓
cta_click
↓
form_start
↓
generate_lead
```

И для каждого шага:

```text
сколько дошло?
сколько выпало?
```

Обычная таблица Events неудобна.

## Визуал
Воронка.

---

# Слайд 503. Explore

## Заголовок
Начинаем Explorations

## Текст
В левом меню откройте:

**Explore**

Explorations предназначены для более гибкого ad-hoc анализа.

## Скриншот
GA4 → Explore.

---

# Слайд 504. Gallery

## Заголовок
GA4 предлагает несколько techniques

## Текст
В Explore можно увидеть разные техники.

Например:

```text
Free form
Funnel exploration
Path exploration
Cohort exploration
Segment overlap
User lifetime
```

Сегодня подробно работаем с первыми тремя.

## Скриншот
Explore Gallery.

---

# Слайд 505. Не начинаем сразу с Funnel

## Заголовок
Сначала разберём устройство Explore

## Текст
Откройте:

**Blank**

или:

**Free form**

Нужно понять три основных области интерфейса.

## Скриншот
Новая Free Form exploration.

---

# Слайд 506. Три области Explore

## Заголовок
Variables → Settings → Canvas

## Текст
Слева:

```text
Variables
```

В центре:

```text
Tab Settings
```

Справа:

```text
Canvas
```

## Скриншот
Explore с тремя подписанными зонами.

---

# Слайд 507. Variables

## Заголовок
Что доступно для анализа

## Текст
В Variables находятся:

```text
Segments
Dimensions
Metrics
```

Это набор деталей, которые можно использовать в текущем Exploration.

## Скриншот
Variables panel.

---

# Слайд 508. Dimensions

## Заголовок
Что описывает данные?

## Текст
Добавим:

```text
Session source
Session campaign
Session manual ad content
Event name
Landing page
Device category
```

Набор может немного отличаться в зависимости от данных и ресурса.

## Скриншот
Add Dimensions.

---

# Слайд 509. Metrics

## Заголовок
Что будем считать?

## Текст
Добавим:

```text
Active users
Sessions
Event count
Key events
Engagement rate
```

## Скриншот
Add Metrics.

---

# Слайд 510. Import

## Заголовок
Шаг 5. Добавить Variables

## Текст
После выбора Dimensions и Metrics нажмите:

**Import**

Они появятся в Variables.

Это ещё не означает, что они уже используются на Canvas.

## Скриншот
Import button.

---

# Слайд 511. Variables ≠ Visualization

## Заголовок
Мы только подготовили инструменты

## Текст
Variables — доступные поля.

Tab Settings определяет:

**что именно из них показать сейчас.**

## Визуал

```text
Variables
↓
Tab Settings
↓
Canvas
```

---

# Слайд 512. Rows

## Заголовок
Шаг 6. Первая таблица

## Текст
Перетащите:

```text
Session source
```

в:

```text
Rows
```

## Скриншот
Drag Session source → Rows.

---

# Слайд 513. Values

## Заголовок
Добавляем показатель

## Текст
В Values добавьте:

```text
Sessions
```

Получаем простую таблицу:

```text
Source → Sessions
```

## Скриншот
Free Form table.

---

# Слайд 514. Добавляем Key Events

## Заголовок
Трафик и результат рядом

## Текст
Добавьте в Values:

```text
Key events
```

Теперь видим:

```text
source | sessions | key events
```

## Скриншот
Free Form с двумя metrics.

---

# Слайд 515. Пример

## Заголовок
Начинается анализ

## Текст

```text
instagram   100 sessions   8 key events
direct       50 sessions   7 key events
google       45 sessions   3 key events
```

У какого источника больше трафика?

А у какого лучше отношение результата к трафику?

## Визуал
Таблица + вопрос.

---

# Слайд 516. Добавляем Campaign

## Заголовок
Nested Rows

## Текст
После `Session source` добавьте:

```text
Session campaign
```

Теперь можно раскрыть источник на уровень кампаний.

## Скриншот
Rows:

```text
Session source
Session campaign
```

---

# Слайд 517. Источник и кампания

## Заголовок
Один source — несколько результатов

## Текст

```text
instagram
  backend_guide
  frontend_guide
  analytics_guide
```

Теперь можно сравнивать кампании внутри Instagram.

## Визуал
Иерархическая таблица.

---

# Слайд 518. utm_content

## Заголовок
Доходим до конкретного Reel

## Текст
Добавьте измерение, соответствующее manual ad content / UTM content.

Сравните:

```text
reel01
reel02
```

## Скриншот
Content dimension в таблице.

---

# Слайд 519. Вот зачем мы делали UTM

## Заголовок
Из URL получилась аналитическая структура

## Текст

```text
utm_source
↓
instagram

utm_campaign
↓
backend_guide

utm_content
↓
reel01
```

Теперь каждый уровень можно анализировать отдельно.

## Визуал
URL → dimensions.

---

# Слайд 520. Visualization

## Заголовок
Free Form — это не только таблица

## Текст
Можно переключать визуализацию.

Например:

table;

bar chart;

line chart;

donut;

scatterplot;

geo map.

Выбор зависит от вопроса.

## Скриншот
Visualization picker.

---

# Слайд 521. Не выбираем график ради красоты

## Заголовок
Visualization должна помогать ответить

## Текст
Для сравнения количества по источникам хорошо подходит:

```text
bar chart
```

Для изменения показателя во времени:

```text
line chart
```

Для точного сравнения нескольких metrics:

```text
table
```

## Визуал
Три типа задач → три визуализации.

---

# Слайд 522. Filters

## Заголовок
Ограничиваем текущий анализ

## Текст
Допустим, нас интересует только Instagram.

Добавьте Filter:

```text
Session source
exactly matches
instagram
```

## Скриншот
Filters section.

---

# Слайд 523. Важный момент

## Заголовок
Filters в Explore чувствительнее

## Текст
При работе с фильтрами внимательно смотрите:

```text
contains
exactly matches
begins with
```

и фактические значения dimension.

Не угадывайте значение.

## Визуал
Filter operator picker.

---

# Слайд 524. Segment

## Заголовок
Filter и Segment — разные инструменты

## Текст
Filter ограничивает конкретную вкладку Exploration.

Segment описывает группу:

```text
Users
Sessions
Events
```

и может использоваться в разных вкладках текущего исследования.

## Визуал

```text
FILTER → this tab
SEGMENT → analytical group
```

---

# Слайд 525. Создаём Instagram Segment

## Заголовок
Шаг 7. Session Segment

## Текст
Создайте Segment:

```text
Instagram Sessions
```

Условие:

```text
Session source = instagram
```

## Скриншот
Segment Builder.

---

# Слайд 526. Создаём Direct Segment

## Заголовок
Вторая группа

## Текст
Создайте:

```text
Direct Sessions
```

Теперь две группы можно сравнивать в одном Exploration.

## Скриншот
Два Segment в Variables.

---

# Слайд 527. Сравнение сегментов

## Заголовок
Instagram vs Direct

## Текст
Примените два сегмента.

Сравните:

```text
Sessions
Event count
Key events
Engagement
```

## Скриншот
Free Form с двумя сегментами.

---

# Слайд 528. Reports Comparison vs Explore Segment

## Заголовок
Похожая идея, разная глубина

## Текст
Reports:

```text
Comparison
```

Explore:

```text
Segment
```

Segments дают более гибкие условия для глубокого анализа пользователей, сессий и событий.

## Визуал
Comparison ↔ Segment.

---

# Слайд 529. Теперь строим настоящую воронку

## Заголовок
Funnel Exploration

## Текст
Наш вопрос:

> Какой процент пользователей проходит путь от визита до заявки?

```text
session_start
↓
page_view
↓
cta_click
↓
form_start
↓
generate_lead
```

## Визуал
Вертикальная funnel.

---

# Слайд 530. Создаём новую вкладку

## Заголовок
Шаг 8. Funnel Exploration

## Текст
В текущем Exploration можно создать новую вкладку.

Выберите technique:

**Funnel exploration**

Либо создайте отдельный Funnel Exploration из Gallery.

## Скриншот
Technique picker → Funnel exploration.

---

# Слайд 531. Funnel Steps

## Заголовок
Воронка состоит из условий

## Текст
Каждый шаг — не просто подпись.

Нужно определить условие.

Например:

```text
Event name
exactly matches
cta_click
```

## Скриншот
Edit funnel steps.

---

# Слайд 532. Step 1

## Заголовок
Первое посещение

## Текст
Для учебной воронки можно начать с:

```text
session_start
```

Название:

```text
Session started
```

## Скриншот
Step 1 configuration.

---

# Слайд 533. Step 2

## Заголовок
CTA

## Текст
Добавьте:

```text
Event name = cta_click
```

Название:

```text
CTA Click
```

## Скриншот
Step 2.

---

# Слайд 534. Step 3

## Заголовок
Начало формы

## Текст

```text
Event name = form_start
```

Название:

```text
Form Start
```

## Скриншот
Step 3.

---

# Слайд 535. Step 4

## Заголовок
Заявка

## Текст

```text
Event name = generate_lead
```

Название:

```text
Lead
```

Это финальный шаг нашей учебной воронки.

## Скриншот
Step 4.

---

# Слайд 536. Первая воронка

## Заголовок
Теперь видим потери

## Текст
Например:

```text
Session Start     100
CTA Click          48
Form Start         21
Lead               11
```

## Скриншот
Готовый Funnel Exploration.

---

# Слайд 537. Completion Rate

## Заголовок
Сколько дошло дальше?

## Текст
Теперь можно видеть не только число пользователей.

Но и долю, переходящую между этапами.

Например:

```text
100 → 48
48 → 21
21 → 11
```

## Визуал
Стрелки с процентами.

---

# Слайд 538. Abandonment

## Заголовок
Где произошло выпадение?

## Текст
Если:

```text
CTA Click = 48
Form Start = 21
```

между ними потерялось много пользователей.

Возникает гипотеза:

> Что происходит после CTA?

## Визуал
Выделить самый большой разрыв.

---

# Слайд 539. Аналитика приводит к вопросу

## Заголовок
Не исправляем сайт на основании одного графика

## Текст
Воронка показывает:

**где наблюдается проблема.**

Она ещё не говорит:

**почему она появилась.**

Нужно исследовать дальше.

## Визуал

```text
FUNNEL
↓
PROBLEM AREA
↓
HYPOTHESIS
```

---

# Слайд 540. Open Funnel

## Заголовок
Нужно ли обязательно начинать с первого шага?

## Текст
В Open Funnel пользователь может войти в воронку не только с первого этапа.

Например, пользователь может сразу оказаться на странице формы.

## Визуал

```text
Step 1
↓
Step 2 ← USER CAN ENTER
↓
Step 3
```

---

# Слайд 541. Closed Funnel

## Заголовок
Строгая последовательность

## Текст
В Closed Funnel пользователь должен войти через первый определённый шаг.

Это полезно, когда анализируем конкретный маршрут.

## Визуал

```text
START REQUIRED
↓
Step 1
↓
Step 2
↓
Step 3
```

---

# Слайд 542. Какой вариант выбрать

## Заголовок
Зависит от вопроса

## Текст
Если спрашиваем:

> Как проходит конкретная Instagram-воронка от начала до заявки?

Closed Funnel может быть удобнее.

Если спрашиваем:

> Как пользователи вообще попадают на разные этапы?

Open Funnel может дать дополнительную информацию.

## Визуал
Question → funnel type.

---

# Слайд 543. Directly followed by

## Заголовок
Насколько строгой должна быть последовательность?

## Текст
Между двумя этапами пользователь может совершать другие события.

Например:

```text
cta_click
↓
scroll
↓
page_view
↓
form_start
```

Нужно понимать, допускает ли выбранное правило промежуточные действия.

## Визуал
DIRECT / INDIRECT.

---

# Слайд 544. Time Constraint

## Заголовок
Сколько времени допускаем между шагами?

## Текст
Иногда важно не только:

```text
произошёл ли следующий шаг?
```

но и:

```text
как быстро?
```

Например:

> Пользователь начал форму в течение 10 минут после CTA.

## Визуал
CTA → 10 min → Form.

---

# Слайд 545. Breakdown

## Заголовок
Одна воронка может вести себя по-разному

## Текст
Добавьте Breakdown.

Например:

```text
Device category
```

Получаем отдельное поведение:

```text
mobile
desktop
tablet
```

## Скриншот
Funnel Breakdown.

---

# Слайд 546. Возможный результат

## Заголовок
Mobile теряется на форме

## Текст

```text
Desktop:
Form Start → Lead
70%

Mobile:
Form Start → Lead
25%
```

Это уже сильный сигнал для проверки интерфейса.

## Визуал
Desktop vs Mobile funnel.

---

# Слайд 547. Breakdown по Campaign

## Заголовок
Сравниваем автоворонки

## Текст
Если данных достаточно, используйте campaign как breakdown.

Например:

```text
backend_guide
frontend_guide
analytics_guide
```

## Скриншот
Funnel с campaign breakdown.

---

# Слайд 548. Segment в Funnel

## Заголовок
Instagram vs Direct

## Текст
Примените ранее созданные Segments:

```text
Instagram Sessions
Direct Sessions
```

Теперь можно сравнить поведение групп внутри одной воронки.

## Скриншот
Funnel + segments.

---

# Слайд 549. Аналитический вывод

## Заголовок
Не «Instagram хороший»

## Текст
Правильнее:

> Instagram приводит больше сессий, но пользователи из Direct чаще переходят от `form_start` к `generate_lead`.

Это конкретное наблюдение.

## Визуал
Observation card.

---

# Слайд 550. Что делать после такого вывода

## Заголовок
Аналитика должна приводить к действию

## Текст
Можно сформулировать гипотезу:

> Instagram-пользователь приходит менее подготовленным.

И проверить:

другой текст landing page;

другой CTA;

более подробный DM;

другой контент Reel.

## Визуал

```text
DATA
↓
INSIGHT
↓
HYPOTHESIS
↓
CHANGE
↓
MEASURE AGAIN
```

---

# Слайд 551. Но Funnel показывает только заданный нами маршрут

## Заголовок
А что пользователи делают на самом деле?

## Текст
Мы сами сказали GA4:

```text
посмотри именно такой путь
```

Но пользователь мог действовать иначе.

Для этого существует:

**Path Exploration**

## Визуал
Funnel → fixed route.

Path → actual routes.

---

# Слайд 552. Path Exploration

## Заголовок
Исследуем последовательность действий

## Текст
Path Exploration показывает дерево событий и страниц.

Можно начать:

с события;

со страницы;

или исследовать путь в обратную сторону от финального события.

## Визуал
Tree graph.

---

# Слайд 553. Создаём Path

## Заголовок
Шаг 9. Path Exploration

## Текст
Создайте новую вкладку.

Technique:

**Path exploration**

## Скриншот
Technique picker.

---

# Слайд 554. Starting Point

## Заголовок
Откуда начинается исследование?

## Текст
Выберите:

```text
Event name
```

Starting point:

```text
session_start
```

## Скриншот
Starting point configuration.

---

# Слайд 555. Следующий шаг

## Заголовок
Что происходило после session_start?

## Текст
GA4 покажет реальные следующие nodes.

Например:

```text
page_view
scroll
cta_click
...
```

## Скриншот
Path tree после session_start.

---

# Слайд 556. Раскрываем Node

## Заголовок
Шаг за шагом

## Текст
Нажмите на интересующий node.

Например:

```text
cta_click
```

GA4 покажет, что происходило после него.

## Скриншот
Раскрытый node.

---

# Слайд 557. Можно увидеть неожиданный путь

## Заголовок
Пользователь не обязан следовать нашей логике

## Текст
Мы ожидали:

```text
cta_click
↓
form_start
```

Но реально можем увидеть:

```text
cta_click
↓
page_view
↓
scroll
↓
page_view
↓
exit
```

## Визуал
Expected / Actual path.

---

# Слайд 558. Path помогает искать тупики

## Заголовок
Куда пользователь уходит вместо цели?

## Текст
Например, после CTA многие переходят на:

```text
/about.html
```

и больше не возвращаются.

Это интересный участок для анализа.

## Визуал

```text
CTA
├→ FORM ✓
└→ ABOUT → EXIT ?
```

---

# Слайд 559. Reverse Path

## Заголовок
Можно начать с конца

## Текст
Иногда вопрос звучит иначе:

> Что пользователи делали непосредственно перед заявкой?

Тогда удобнее установить Ending Point:

```text
generate_lead
```

## Скриншот
Path Exploration → Ending Point.

---

# Слайд 560. Что происходило перед Lead

## Заголовок
Обратное исследование

## Текст
Например:

```text
page_view
↓
form_start
↓
generate_lead
```

или:

```text
cta_click
↓
page_view
↓
form_start
↓
generate_lead
```

## Визуал
Reverse tree.

---

# Слайд 561. Funnel и Path решают разные задачи

## Заголовок
Не выбираем один «лучший»

## Текст
**Funnel**

проверяем заранее определённый маршрут.

**Path**

исследуем фактические последовательности действий.

## Визуал

```text
FUNNEL
expected route

PATH
observed routes
```

---

# Слайд 562. Хорошая последовательность анализа

## Заголовок
Используем инструменты вместе

## Текст

```text
Reports
↓
заметили проблему
↓
Funnel
↓
нашли место выпадения
↓
Path
↓
изучили поведение рядом с проблемой
```

## Визуал
Цикл анализа.

---

# Слайд 563. Ещё один уровень — Attribution

## Заголовок
Кому засчитать Key Event?

## Текст
Представим путь:

```text
Instagram
↓
Direct
↓
Google
↓
generate_lead
```

Какому источнику принадлежит результат?

Это уже вопрос атрибуции.

## Визуал
Три touchpoints → Lead.

---

# Слайд 564. Attribution

## Заголовок
Что такое атрибуция

## Текст
Attribution — правила распределения ценности значимого действия между маркетинговыми touchpoints.

Она особенно важна, когда пользователь взаимодействует с сайтом несколько раз.

## Визуал
Instagram → Direct → Google → ★.

---

# Слайд 565. Advertising

## Заголовок
Отчёты атрибуции

## Текст
Откройте:

**Advertising**

В зависимости от доступных данных и конфигурации здесь можно исследовать:

```text
Attribution models
Key event attribution paths
```

## Скриншот
Advertising section.

---

# Слайд 566. Attribution Paths

## Заголовок
Путь до Key Event

## Текст
Отчёт позволяет исследовать цепочки touchpoints до важного события.

Например:

```text
Instagram
→ Direct
→ Lead
```

или:

```text
Google
→ Instagram
→ Direct
→ Lead
```

## Скриншот
Key event attribution paths.

---

# Слайд 567. Touchpoints

## Заголовок
Первое касание не всегда последнее

## Текст
Пользователь может:

увидеть Reel сегодня;

перейти на сайт;

ничего не отправить;

через два дня вернуться напрямую;

оставить заявку.

Поэтому:

```text
Traffic source
```

и:

```text
credit for lead
```

не всегда одно и то же.

## Визуал
Timeline пользователя.

---

# Слайд 568. Attribution Model

## Заголовок
Разные правила дают разные оценки

## Текст
GA4 предоставляет отчёты для анализа того, как выбранная модель атрибуции распределяет ценность Key Events между каналами.

Не нужно на этом этапе глубоко изучать рекламные модели.

Главное понять проблему.

## Визуал
Touchpoints → attribution model → credit.

---

# Слайд 569. Мы ещё не готовы делать серьёзные выводы по маленькому стенду

## Заголовок
Учебных данных мало

## Текст
Если у нас:

```text
3 users
2 leads
```

проценты могут выглядеть впечатляюще, но статистически ничего не доказывать.

Цель лаборатории — понять инструменты и логику анализа.

## Визуал

```text
2 / 3 = 66%
```

Большой знак:

**SMALL SAMPLE**

---

# Слайд 570. Data Quality Indicator

## Заголовок
GA4 тоже имеет ограничения

## Текст
В Explore обращайте внимание на индикаторы качества данных.

Exploration может зависеть от:

sampling;

thresholding;

доступности dimensions;

объёма данных.

Не воспринимайте любую цифру как абсолютную истину.

## Скриншот
Data quality indicator в Exploration.

---

# Слайд 571. Почему Reports и Explore иногда показывают разные числа

## Заголовок
Это не всегда ошибка

## Текст
Reports и Explorations имеют различия в:

поддерживаемых dimensions;

фильтрах;

segments/comparisons;

обработке данных;

thresholding;

sampling;

времени обработки.

Поэтому небольшое различие нужно сначала объяснять, а не объявлять багом.

## Визуал
Reports ≠ Explore, но обе поверхности GA4.

---

# Слайд 572. Filter Case Sensitivity

## Заголовок
В Explore особенно внимательно к строкам

## Текст
При фильтрации проверяйте точные значения.

Например:

```text
instagram
```

и:

```text
Instagram
```

могут вести себя не так, как ожидает студент, в зависимости от операции и поля.

Поэтому сначала посмотрите фактические данные dimension.

## Визуал
`instagram` ≠ предположение.

---

# Слайд 573. Insights

## Заголовок
GA4 может сам заметить необычное изменение

## Текст
Analytics Intelligence поддерживает:

```text
Automated Insights
Custom Insights
```

Например:

> резко уменьшилось число пользователей;

> неожиданно выросло число Key Events.

## Скриншот
Insights area.

---

# Слайд 574. Automated Insight

## Заголовок
GA4 обнаруживает аномалию

## Текст
Пример:

```text
Sessions decreased unusually
```

Это не диагноз.

Это сигнал:

**посмотрите внимательнее.**

## Визуал
Metric → anomaly → alert.

---

# Слайд 575. Custom Insight

## Заголовок
Задаём собственное условие

## Текст
Можно создать условие, которое важно именно нам.

Например:

```text
Daily users
decrease more than 50%
```

или:

```text
generate_lead
drops unexpectedly
```

## Скриншот
Create Custom Insight.

---

# Слайд 576. Alert ≠ решение проблемы

## Заголовок
Система сообщает, человек исследует

## Текст

```text
INSIGHT
↓
что-то изменилось
```

Дальше:

```text
Reports
↓
Explore
↓
Funnel
↓
Path
```

чтобы понять контекст.

## Визуал
Alert → investigation.

---

# Слайд 577. Custom Reports

## Заголовок
Если стандартный отчёт постоянно неудобен

## Текст
Editor / Administrator может создавать и изменять detail reports.

Например, постоянно нужен отчёт:

```text
Campaign
Sessions
Engagement
Key Events
```

Его можно сделать частью стандартной навигации ресурса.

## Скриншот
Reports → Library.

---

# Слайд 578. Library

## Заголовок
Управление набором отчётов

## Текст
В Library можно работать с:

```text
Reports
Collections
Topics
```

Это позволяет настроить GA4 под задачи команды.

## Скриншот
Reports → Library.

---

# Слайд 579. Права имеют значение

## Заголовок
Не каждый пользователь может менять Reports

## Текст
Просматривать данные и перестраивать навигацию — разные действия.

Для создания и изменения ряда custom reports нужны соответствующие права Editor / Administrator.

## Визуал

```text
Viewer
≠
Editor
```

---

# Слайд 580. Когда Custom Report имеет смысл

## Заголовок
Не создаём отчёт под один вопрос

## Текст
Exploration лучше подходит для:

```text
разового исследования
```

Custom Report — для:

```text
регулярного вопроса команды
```

## Визуал
ONE-OFF → Explore.

REPEATABLE → Report.

---

# Слайд 581. Экспорт из Explore

## Заголовок
Результат исследования тоже можно вынести

## Текст
После анализа данные Exploration можно экспортировать и использовать дальше.

Например:

```text
Explore
↓
CSV / Sheets
↓
дополнительный анализ
```

## Скриншот
Export options Exploration.

---

# Слайд 582. Следующий уровень аналитики

## Заголовок
GA4 не обязан быть финальным dashboard

## Текст
Сейчас данные существуют отдельно:

```text
GA4
→ traffic + events

Google Sheets
→ actual leads + status
```

В GA4 мы не видим полный операционный статус заявки.

## Визуал
Две системы рядом.

---

# Слайд 583. Пример проблемы

## Заголовок
generate_lead ещё не означает успех

## Текст
GA4 знает:

```text
generate_lead = 20
```

Google Sheets знает:

```text
20 leads
↓
12 new
5 in_progress
3 done
```

GA4 не является CRM.

## Визуал
GA4 → 20 leads.

Sheets → status breakdown.

---

# Слайд 584. Нам нужен общий аналитический слой

## Заголовок
Следующий вопрос курса

## Текст
Как показать на одном экране:

```text
Sessions
Sources
Campaigns
Events
generate_lead
Actual Leads
Lead Status
```

Ответ:

**dashboard / BI tool**

## Визуал
Несколько источников → Dashboard.

---

# Слайд 585. Looker Studio

## Заголовок
Следующий аналитический инструмент

## Текст
В следующем блоке можно подключить:

```text
GA4
+
Google Sheets
↓
Looker Studio
```

И построить единый dashboard.

## Визуал
GA4 + Sheets → Looker Studio.

---

# Слайд 586. Но сначала завершим анализ

## Заголовок
Практический кейс занятия

## Текст
Ответьте на вопрос:

> Как пользователи из Instagram `backend_guide` проходят путь до `generate_lead` и где происходит наибольшая потеря?

Для ответа нельзя использовать только один экран.

## Визуал
Большая карточка с вопросом.

---

# Слайд 587. Шаг 1. Traffic Acquisition

## Заголовок
Сколько трафика пришло?

## Текст
Найдите:

```text
instagram / social
```

и:

```text
backend_guide
```

Запишите:

```text
Sessions = ?
```

## Скриншот
Traffic Acquisition.

---

# Слайд 588. Шаг 2. Landing Page

## Заголовок
Куда пришли пользователи?

## Текст
Определите основную landing page для этой кампании.

Запишите:

```text
Landing page = ?
```

## Скриншот
Landing Page report.

---

# Слайд 589. Шаг 3. Events

## Заголовок
Какие действия происходили?

## Текст
Найдите:

```text
cta_click
form_start
generate_lead
```

Запишите Event Count.

## Скриншот
Events.

---

# Слайд 590. Шаг 4. Free Form

## Заголовок
Соберите кампании в таблицу

## Текст
Создайте:

Rows:

```text
Session campaign
```

Values:

```text
Sessions
Key events
```

Filter:

```text
Session source = instagram
```

## Скриншот
Free Form.

---

# Слайд 591. Шаг 5. Funnel

## Заголовок
Найдите главный drop-off

## Текст
Постройте:

```text
session_start
↓
cta_click
↓
form_start
↓
generate_lead
```

Запишите этап с максимальным выпадением.

## Скриншот
Funnel Exploration.

---

# Слайд 592. Шаг 6. Breakdown

## Заголовок
Проверяем устройства

## Текст
Добавьте:

```text
Device category
```

Посмотрите:

```text
mobile
desktop
```

Есть ли сильное различие?

## Скриншот
Funnel breakdown.

---

# Слайд 593. Шаг 7. Path

## Заголовок
Исследуем проблемное место

## Текст
Если проблема находится после `cta_click`, используйте Path Exploration.

Посмотрите:

**что пользователи делают после CTA?**

## Скриншот
Path.

---

# Слайд 594. Шаг 8. Reverse Path

## Заголовок
Как доходят успешные пользователи?

## Текст
Ending Point:

```text
generate_lead
```

Посмотрите предыдущие действия.

## Скриншот
Reverse Path.

---

# Слайд 595. Формулируем вывод

## Заголовок
Не переписываем числа

## Текст
Плохо:

> Было 100 sessions и 10 leads.

Хорошо:

> Основная потеря Instagram-пользователей происходит между CTA и началом формы; падение особенно выражено на mobile.

## Визуал
NUMBER → INTERPRETATION.

---

# Слайд 596. Формулируем гипотезу

## Заголовок
Что может объяснить результат?

## Текст
Например:

> После перехода с Instagram мобильная форма требует слишком много действий.

Это пока:

```text
HYPOTHESIS
```

а не доказанный факт.

## Визуал
Observation ≠ Cause.

---

# Слайд 597. Что проверять дальше

## Заголовок
Аналитический цикл

## Текст
Можно:

изменить CTA;

сократить форму;

изменить Instagram DM;

перенаправить на другую landing page;

изменить мобильную версию.

После этого снова собираем данные.

## Визуал

```text
MEASURE
↓
ANALYZE
↓
CHANGE
↓
MEASURE AGAIN
```

---

# Слайд 598. Главный навык темы

## Заголовок
Не знание интерфейса GA4

## Текст
Студент должен научиться:

```text
сформулировать вопрос
↓
выбрать инструмент
↓
выбрать dimension
↓
выбрать metric
↓
получить данные
↓
сделать наблюдение
↓
сформировать гипотезу
```

## Визуал
Полный аналитический процесс.

---

# Слайд 599. Как выбрать инструмент

## Заголовок
Шпаргалка

## Текст
**Что происходит прямо сейчас?**

→ Realtime

**Откуда приходит трафик?**

→ Acquisition

**Какие страницы работают?**

→ Landing Page / Pages

**Какие действия происходят?**

→ Events

**Как сравнить группы?**

→ Comparison / Segment

**Где пользователи выпадают?**

→ Funnel

**Как реально движутся?**

→ Path

**Какие touchpoints привели к результату?**

→ Attribution

## Визуал
Decision tree.

---

# Слайд 600. Что необходимо сохранить

## Заголовок
Контрольные скриншоты

## Текст
Сохраните:

1. Reports Snapshot;
2. выбранный Date Range;
3. Traffic Acquisition;
4. `instagram / social`;
5. Campaign;
6. secondary dimension;
7. Landing Page;
8. Events;
9. `generate_lead`;
10. Comparison Instagram vs Direct;
11. Explore Gallery;
12. Free Form;
13. Variables;
14. Rows + Values;
15. Instagram Segment;
16. Funnel Exploration;
17. Funnel Steps;
18. Funnel Breakdown;
19. Path Exploration;
20. Reverse Path до `generate_lead`;
21. Advertising / Attribution;
22. Insights;
23. финальный аналитический вывод.

## Визуал
Checklist.

---

# Слайд 601. Что студент должен уметь объяснить

## Заголовок
Контроль понимания

## Текст
После темы студент должен объяснить:

чем Realtime отличается от стандартных Reports;

чем User Acquisition отличается от Traffic Acquisition;

что такое Dimension;

что такое Metric;

что такое Landing Page;

чем Event Count отличается от Users;

зачем нужен Key Event;

что такое Comparison;

чем Report отличается от Exploration;

что такое Segment;

чем Filter отличается от Segment;

когда использовать Free Form;

что показывает Funnel;

чем Open Funnel отличается от Closed Funnel;

что такое abandonment;

зачем нужен Breakdown;

что показывает Path Exploration;

зачем использовать reverse path;

что такое Attribution;

почему корреляция в GA4 ещё не доказывает причину.

## Визуал
Concept map.

---

# Слайд 602. Итог темы

## Заголовок
Мы перестали просто собирать события

## Текст

Было:

```text
EVENT
↓
«пришёл»
```

Стало:

```text
TRAFFIC
↓
BEHAVIOR
↓
FUNNEL
↓
DROP-OFF
↓
PATH
↓
KEY EVENT
↓
INSIGHT
↓
HYPOTHESIS
```

## Визуал
Большая аналитическая цепочка.

---

# Слайд 603. Вся система курса сейчас

## Заголовок
Что мы уже построили

## Текст

```text
INSTAGRAM
↓
MANYCHAT
↓
UTM
↓
VERCEL
├────────→ GA4
│          ↓
│        REPORTS
│          ↓
│        EXPLORE
│          ↓
│        INSIGHTS
│
└→ FORM
   ↓
APPS SCRIPT
   ↓
GOOGLE SHEETS
   ↓
POWER QUERY
```

У нас уже две полноценные ветки данных:

**аналитическая**

и

**операционная**.

## Визуал
Архитектура на весь слайд.

---

# Слайд 604. Следующая проблема

## Заголовок
Данные находятся в разных системах

## Текст
GA4 знает:

```text
source
campaign
sessions
events
key events
```

Google Sheets знает:

```text
request_id
lead
status
```

Power Query знает:

```text
clean dataset
```

Но руководителю нужен один экран.

## Визуал
Три системы → `?`.

---

# Слайд 605. Следующая тема

## Заголовок
Looker Studio: единый аналитический dashboard

## Текст
Следующий маршрут:

```text
GA4
      ↘
       LOOKER STUDIO
      ↗
Google Sheets
```

На одном dashboard попробуем показать:

```text
Traffic
Campaigns
Sessions
CTA
generate_lead
Actual Leads
Lead Status
```

Следующий вопрос курса:

**Как объединить аналитику разных систем в одном отчёте?**