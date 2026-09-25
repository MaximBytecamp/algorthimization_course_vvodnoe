# Слайд 171. Где мы остановились

## Заголовок

Мы умеем видеть заявку в аналитике

## Текст

На предыдущих занятиях мы построили:

UTM

↓

сайт на Vercel

↓

Google Tag / GTM

↓

GA4

↓

события

При отправке формы GA4 может получить:

```text
generate_lead
```

Но возникает новый вопрос:

**Где находится сама заявка?**

## Визуал

Схема:

FORM SUBMIT

↓

GA4

↓

`generate_lead ✓`

Справа большой знак вопроса:

**А данные заявки?**

---

# Слайд 172. GA4 — не база заявок

## Заголовок

Событие и заявка — разные данные

## Текст

GA4 нужен для аналитики поведения.

Он хорошо отвечает на вопросы:

откуда пришёл пользователь;

какую страницу открыл;

какое событие совершил;

какая кампания привела к действию.

Но GA4 не должен использоваться как таблица клиентов или CRM.

## Визуал

Две колонки.

GA4:

```text
generate_lead
utm_source
page_location
campaign
```

Система заявок:

```text
request_id
created_at
name
email
status
```

---

# Слайд 173. Одна отправка — два результата

## Заголовок

Разделяем аналитику и бизнес-данные

## Текст

После отправки формы будем делать две независимые операции.

```text
FORM SUBMIT
     │
     ├──→ GA4
     │    generate_lead
     │
     └──→ Google Sheets
          сама заявка
```

GA4 отвечает:

**Что сделал пользователь?**

Google Sheets отвечает:

**Какую заявку необходимо обработать?**

## Визуал

Именно эта схема на весь экран.

---

# Слайд 174. Что построим сегодня

## Заголовок

Маршрут занятия

## Текст

Сегодня необходимо:

1. создать таблицу заявок;
2. определить структуру данных;
3. настроить статусы;
4. добавить проверки качества;
5. создать Apps Script endpoint;
6. подключить существующую форму;
7. передать UTM из URL;
8. создать ID заявки;
9. записать заявку в Google Sheets;
10. сохранить `generate_lead` в GA4;
11. проверить пустые значения;
12. проверить дубли;
13. проверить неправильный статус.

## Визуал

Roadmap:

```text
FORM
↓
APPS SCRIPT
↓
GOOGLE SHEETS
↓
QUALITY CHECK
```

---

# Слайд 175. Минимальная модель заявки

## Заголовок

Какие данные действительно нужны

## Текст

Для одной заявки используем:

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

Не собираем данные просто «на всякий случай».

Каждое поле должно иметь понятное назначение.

## Визуал

Карточка одной заявки с девятью полями.

---

# Слайд 176. Пример записи

## Заголовок

Как будет выглядеть результат

## Текст

Пример:

```text
request_id   REQ-031A5470-9AE5-4305-B6A1-095B91D9C278
created_at   2026-09-23 12:40
name         Иван
email        student@example.com
direction    backend
utm_source   telegram
utm_medium   social
utm_campaign september
status       new
```

## Визуал

Показать как одну карточку записи.

---

# Слайд 177. Откуда берётся каждое поле

## Заголовок

Не все данные вводит пользователь

## Текст

**Пользователь вводит:**

```text
name
email
direction
```

**Браузер получает из URL:**

```text
utm_source
utm_medium
utm_campaign
```

**Система создаёт сама:**

```text
request_id
created_at
status
```

## Визуал

Три источника → одна заявка.

---

# Слайд 178. Почему это важно

## Заголовок

Не доверяем пользователю системные поля

## Текст

Пользователь не должен самостоятельно вводить:

```text
request_id
created_at
status
```

Например, статус новой заявки должен автоматически быть:

```text
new
```

а не определяться человеком, который заполняет форму.

## Визуал

FORM:

Name ✓
Email ✓
Direction ✓

Status ✕

Timestamp ✕

ID ✕

---

# Слайд 179. Только вымышленные данные

## Заголовок

Сегодня не используем реальные персональные данные

## Текст

В практической работе используйте тестовые значения.

Например:

```text
Иван Тестов
student@example.com
```

Не используйте:

реальные телефоны;

личные email;

пароли;

паспортные данные;

другие чувствительные сведения.

## Визуал

TEST DATA ✓

REAL PERSONAL DATA ✕

---

# Слайд 180. Создаём Google Sheets

## Заголовок

Шаг 1. Открыть Google Sheets

## Текст

Откройте:

**sheets.google.com**

Создайте новую пустую таблицу.

## Скриншот

Главная страница Google Sheets.

## Акцент

Кнопка:

**Blank spreadsheet / Пустая таблица**

---

# Слайд 181. Название таблицы

## Заголовок

Шаг 2. Назвать документ

## Текст

Название:

```text
GA4 Analytics Lab — Leads
```

или:

```text
GA4 Leads — Иванов
```

Название должно позволять сразу понять назначение таблицы.

## Скриншот

Google Sheets.

Выделить название документа.

---

# Слайд 182. Название листа

## Заголовок

Шаг 3. Переименовать лист

## Текст

Переименуйте первый лист:

```text
leads
```

Именно это название позже будет использовать Apps Script.

## Скриншот

Нижняя вкладка листа.

## Акцент

`leads`

---

# Слайд 183. Создаём заголовки

## Заголовок

Шаг 4. Структура таблицы

## Текст

В первую строку добавьте:

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

Один столбец — одно понятие.

## Скриншот

Первая строка Google Sheets со всеми заголовками.

---

# Слайд 184. Почему одна строка = одна заявка

## Заголовок

Не смешиваем разные сущности

## Текст

Правило нашей таблицы:

**одна строка = одна заявка**

Не объединяем несколько заявок в одну ячейку.

Не вставляем комментарии между строками данных.

Не создаём отдельную таблицу для каждого источника.

## Визуал

Правильно:

```text
REQ-01 | ...
REQ-02 | ...
REQ-03 | ...
```

Неправильно:

```text
Telegram заявки
...
VK заявки
...
```

---

# Слайд 185. Что такое request_id

## Заголовок

Каждая заявка должна иметь ID

## Текст

`request_id` — уникальный идентификатор конкретной заявки.

Например:

```text
REQ-031A5470-9AE5-4305-B6A1-095B91D9C278
```

Он нужен, чтобы:

найти заявку;

связать записи между системами;

обнаружить повторную доставку;

проводить диагностику.

## Визуал

Одна заявка → один ID.

---

# Слайд 186. Что такое created_at

## Заголовок

Когда система получила заявку?

## Текст

`created_at` хранит дату и время появления записи.

Например:

```text
24.09.2026 9:37:48
```

Timestamp создаёт система.

Не просим пользователя вводить дату вручную.

## Визуал

FORM SUBMIT

↓

SERVER TIME

↓

created_at

---

# Слайд 187. Зачем сохранять UTM

## Заголовок

Источник должен доехать до заявки

## Текст

Если пользователь пришёл по ссылке:

```text
?utm_source=telegram
&utm_medium=social
&utm_campaign=september
```

эти значения необходимо сохранить вместе с заявкой.

Тогда можно связать:

источник

↓

реальную заявку

↓

её дальнейший статус.

## Визуал

Telegram → UTM → Form → Sheet.

---

# Слайд 188. Что такое status

## Заголовок

Заявка меняется со временем

## Текст

Используем ограниченный набор статусов:

```text
new
in_progress
done
rejected
```

Не допускаем свободные варианты:

```text
Новая
NEW
готово
готов
Finished
обработал
```

## Визуал

Workflow:

`new → in_progress → done`

и отдельная ветка:

`→ rejected`

---

# Слайд 189. Добавляем dropdown

## Заголовок

Шаг 5. Проверка данных для status

## Текст

Выделите столбец `status`.

Откройте:

**Data → Data validation**

Добавьте Dropdown:

```text
new
in_progress
done
rejected
```

Для неверных значений выберите режим отклонения.

## Скриншот

Google Sheets → Data validation rules.

## Акцент

Dropdown и четыре значения.

---

# Слайд 190. Зачем Data Validation

## Заголовок

Контролируем словарь значений

## Текст

Без проверки легко получить:

```text
new
NEW
New
новая
```

Для аналитики это четыре разных значения.

С Data Validation используем только заранее определённый словарь.

## Визуал

BAD:

4 разных варианта.

GOOD:

`new`

---

# Слайд 191. Проверяем неправильный статус

## Заголовок

Шаг 6. Попробовать сломать правило

## Текст

Вручную попробуйте написать:

```text
finished
```

в ячейке `status`.

Google Sheets должен показать, что значение не соответствует правилу.

После теста удалите экспериментальную строку.

## Скриншот

Попытка ввести invalid status.

---

# Слайд 192. Пустые обязательные данные

## Заголовок

Какие поля считаем обязательными

## Текст

Минимально обязательны:

```text
request_id
created_at
name
email
direction
status
```

UTM может отсутствовать.

Например, пользователь может открыть сайт напрямую.

В этом случае используем:

```text
utm_source = direct
utm_medium = none
utm_campaign = not_set
```

## Визуал

Required / Optional.

---

# Слайд 193. Подсвечиваем пустые значения

## Заголовок

Шаг 7. Условное форматирование

## Текст

Для обязательных столбцов создайте правило условного форматирования.

Цель:

если обязательная ячейка пустая — строка должна визуально выделяться.

Не исправляем значение автоматически.

Сначала показываем проблему.

## Скриншот

Format → Conditional formatting.

Показать правило для пустой ячейки.

---

# Слайд 194. Проверяем дубль ID

## Заголовок

Шаг 8б. Контроль request_id

## Текст

`request_id` должен быть уникальным.

Добавьте Conditional Formatting для столбца A с custom formula:

```text
=COUNTIF($A:$A,A1)>1
```

Теперь повторяющиеся ID будут выделяться.

## Скриншот

Conditional formatting rule.

## Акцент

Custom formula.

---

# Слайд 195. Что считать дублем

## Заголовок

Одинаковый email ≠ обязательно дубль

## Текст

Пользователь может оставить несколько разных заявок.

Поэтому:

```text
одинаковый email
```

ещё не означает технический дубль.

В нашем стенде дубль определяется как повторная запись с тем же:

```text
request_id
```

## Визуал

Same email + different ID → допустимо.

Same request_id → duplicate.

---

# Слайд 196. Контролируемая таблица v1

## Заголовок

Первый слой готов

## Текст

Теперь таблица имеет:

фиксированные столбцы;

понятную структуру;

ID;

timestamp;

UTM;

ограниченный status;

подсветку пустых полей;

контроль duplicate ID.

Но сайт пока не умеет сюда писать.

## Визуал

Google Sheet → ✓

Website → ×

---

# Слайд 197. Нужен приёмник данных

## Заголовок

Как сайт запишет строку в Google Sheets?

## Текст

HTML-страница Vercel не должна напрямую редактировать Google Sheet.

Добавим промежуточный слой:

**Google Apps Script Web App**

Он получит POST-запрос и добавит новую строку.

## Визуал

Схема:

```text
VERCEL FORM
     ↓ POST
APPS SCRIPT
     ↓
GOOGLE SHEETS
```

---

# Слайд 198. Что такое Apps Script

## Заголовок

Небольшой серверный код Google

## Текст

Google Apps Script позволяет выполнять JavaScript-код на стороне сервисов Google.

Для нашей работы он будет выполнять только несколько действий:

получить данные формы;

проверить обязательные поля;

проверить ID;

добавить timestamp;

назначить статус `new`;

записать строку в Google Sheets.

## Визуал

Apps Script как небольшой блок между сайтом и таблицей.

---

# Слайд 199. Открываем Apps Script

## Заголовок

Шаг 9. Расширения → Apps Script

## Текст

В таблице откройте:

**Расширения**

↓

**Apps Script**

Откроется редактор скрипта, связанный с этой таблицей.

## Скриншот

Google Sheets с раскрытым меню Extensions.

## Акцент

Apps Script.

---

# Слайд 200. Проект Apps Script

## Заголовок

Шаг 10. Открыть Code.gs

## Текст

В редакторе уже существует файл:

```text
Code.gs
```

Удалите демонстрационную функцию `myFunction`, если она есть.

Мы создадим собственную функцию:

```javascript
doPost(e)
```

## Скриншот

Apps Script Editor.

Слева `Code.gs`.

---

# Слайд 201. Почему doPost()

## Заголовок

POST-запрос запускает doPost

## Текст

Наш сайт будет отправлять HTTP POST.

Когда опубликованный Apps Script Web App получает POST-запрос, Google вызывает:

```javascript
doPost(e)
```

Объект `e` содержит данные входящего запроса.

## Визуал

Website

↓

POST

↓

`doPost(e)`

---

# Слайд 273. Где в адресе лежит ID таблицы

## После

212

## Заголовок

Откуда копировать ID таблицы

## Текст

Откройте свою таблицу и посмотрите на адресную строку. Адрес устроен так:

```text
docs.google.com/spreadsheets/d/ВАШ_ID/edit
```

ID — длинная строка между `/d/` и `/edit`. Скопируйте её целиком, без самих слэшей.

Это не название таблицы и не ссылка «Поделиться»: у копии таблицы будет свой ID.

## Скриншот

Адресная строка браузера с открытой таблицей.

## Акцент

Между /d/ и /edit

---

# Слайд 202. Получаем лист leads

## После

273

## Заголовок

Шаг 11. Выбираем таблицу

## Текст

Начало функции:

```javascript
function doPost(e) {
  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName('leads');
}
```

Apps Script получает лист:

```text
leads
```

из нашей текущей Google Sheet.

## Скриншот

Начало файла Code.gs с константой SPREADSHEET_ID.

---

# Слайд 203. Получаем параметры формы

## Заголовок

Разбор: как читаются поля формы

## Текст

Первые строки функции:

```javascript
const p = (e && e.parameter) || {};
const clean = key => String(p[key] || '').trim();
```

Теперь через `p` можно получить:

```javascript
p.request_id
p.name
p.email
p.direction
p.utm_source
p.utm_medium
p.utm_campaign
```

## Визуал

HTTP POST → `e.parameter`.

---

# Слайд 204. Не доверяем только HTML required

## Заголовок

Проверка должна быть и на стороне приёмника

## Текст

HTML может содержать:

```html
required
```

Но клиентскую проверку можно обойти.

Поэтому Apps Script повторно проверяет обязательные поля.

Это называется:

**server-side validation**

## Визуал

Browser validation

↓

Server validation

↓

Storage

---

# Слайд 205. Проверяем обязательные поля

## Заголовок

Разбор: проверка обязательных полей

## Текст

В файле это две строки:

```javascript
const missing = ['request_id', 'name', 'email', 'direction']
  .filter(key => !clean(key));
if (missing.length) return jsonResponse(
  {ok:false, error:'missing_required', fields:missing});
```

## Скриншот

Код проверки в Apps Script.

---

# Слайд 206. Проверяем duplicate request_id

## Заголовок

Разбор: одна заявка — одна строка

## Текст

Проверим, существует ли такой ID:

```javascript
const duplicate = sheet
  .getRange('A:A')
  .createTextFinder(p.request_id)
  .matchEntireCell(true)
  .findNext();

if (duplicate) {
  return jsonResponse({
    ok: false,
    error: 'duplicate_request_id'
  });
}
```

## Визуал

REQ-123 уже существует?

YES → reject

NO → append

---

# Слайд 207. Timestamp создаёт сервер

## Заголовок

Разбор: время ставит сервер

## Текст

Время записи создаёт сам Apps Script:

```javascript
const createdAt = new Date();
```

Почему не отправляем его из браузера?

Потому что время на устройстве пользователя может быть неправильным или изменённым.

## Визуал

Browser time ✕

Server time ✓

---

# Слайд 208. Status тоже назначает система

## Заголовок

Разбор: статус назначает сервер

## Текст

Статус в файле задан жёстко:

```javascript
const status = 'new';
```

Форма пользователя не содержит поле `status`.

Пользователь не должен иметь возможность отправить себе:

```text
done
```

или:

```text
rejected
```

## Визуал

FORM ✕ status

SERVER ✓ status=new

---

# Слайд 209. Нормализуем UTM по умолчанию

## Заголовок

Что делать без UTM

## Текст

Пустая метка заменяется заглушкой:

```javascript
const source = clean('utm_source') || 'direct';
const medium = clean('utm_medium') || 'none';
const campaign = clean('utm_campaign') || 'not_set';
```

Теперь пустой источник не превращается в пустую ячейку: в столбце видно, что посетитель пришёл сам.
## Визуал

UTM exists → telegram/social/september.

UTM absent → direct/none/not_set.

---

# Слайд 210. Записываем строку

## Заголовок

Разбор: запись строки в лист

## Текст

Добавляем:

```javascript
sheet.appendRow([
  p.request_id,
  createdAt,
  p.name.trim(),
  p.email.trim(),
  p.direction.trim(),
  source,
  medium,
  campaign,
  status
]);
```

Порядок значений должен совпадать с порядком столбцов Google Sheet.

## Скриншот

Apps Script с `appendRow()`.

---

# Слайд 211. Возвращаем результат

## Заголовок

Разбор: ответ приёмника

## Текст

В конце файла лежит вспомогательная функция:

```javascript
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Она позволяет Web App сформировать текстовый JSON-ответ.

## Скриншот

Функция в Apps Script.

---

# Слайд 212. Полный Apps Script

## После

200

## Заголовок

Шаг 10а. Вставить готовый Code.gs

## Текст

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName('leads');

  const p = e.parameter;

  const required = [
    'request_id',
    'name',
    'email',
    'direction'
  ];

  const missing = required.filter((field) => {
    return !String(p[field] || '').trim();
  });

  if (missing.length > 0) {
    return jsonResponse({
      ok: false,
      error: 'missing_required',
      fields: missing
    });
  }

  const duplicate = sheet
    .getRange('A:A')
    .createTextFinder(p.request_id)
    .matchEntireCell(true)
    .findNext();

  if (duplicate) {
    return jsonResponse({
      ok: false,
      error: 'duplicate_request_id'
    });
  }

  const createdAt = new Date();

  const source =
    p.utm_source || 'direct';

  const medium =
    p.utm_medium || 'none';

  const campaign =
    p.utm_campaign || 'not_set';

  const status = 'new';

  sheet.appendRow([
    p.request_id,
    createdAt,
    p.name.trim(),
    p.email.trim(),
    p.direction.trim(),
    source,
    medium,
    campaign,
    status
  ]);

  return jsonResponse({
    ok: true,
    request_id: p.request_id
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Скриншот

Apps Script Editor с итоговым кодом.

---

# Слайд 213. Сохраняем скрипт

## Заголовок

Шаг 12. Сохранить проект

## Текст

Сохраните проект Apps Script.

Название проекта:

```text
GA4 Analytics Lab — Leads Receiver
```

Пока код существует только внутри редактора.

Чтобы сайт мог отправлять запросы, необходимо развернуть Web App.

## Скриншот

Название проекта и кнопка Save.

---

# Слайд 214. Создаём Deployment

## Заголовок

Шаг 13. Новое развертывание

## Текст

В правом верхнем углу нажмите:

**Начать развертывание**

↓

**Новое развертывание**

## Скриншот

Apps Script с раскрытым Deploy.

---

# Слайд 215. Выбираем Web app

## Заголовок

Шаг 14. Выбрать тип

## Текст

В открывшемся окне нажмите шестерёнку «Выберите тип».

Выберите:

**Веб-приложение**

Именно Web App даст нам HTTP URL.

## Скриншот

New deployment → Select type → Web app.

---

# Слайд 216. Настройки Web App

## Заголовок

Шаг 15. Настройки развёртывания

## Текст

Укажите описание:

```text
Приём заявок с сайта GA4 Analytics Lab
```

Для нашего стенда Web App должен выполняться с правами владельца скрипта и принимать обращения от пользователей формы.

Конкретный вариант доступности зависит от типа Google-аккаунта.

## Скриншот

Deployment configuration.

Показать:

Description

Execute as

Who has access

## Примечание

Используем только тестовые данные.

Не рассматриваем этот публичный endpoint как production-backend.

---

# Слайд 217. Авторизация

## Заголовок

Шаг 16. Разрешить Apps Script работать с таблицей

## Текст

При первом Deployment Google запросит разрешение.

Apps Script должен иметь возможность:

открыть связанную Google Sheet;

добавлять строки.

Проверьте используемый аккаунт и подтвердите необходимые разрешения.

## Скриншот

Экран authorization.

Не показывать личные данные аккаунта крупным планом.

---

# Слайд 218. Получаем Web App URL

## Заголовок

Шаг 17. Скопировать адрес приёмника

## Текст

После Deployment появится адрес вида:

```text
https://script.google.com/macros/s/...../exec
```

Скопируйте именно URL опубликованного Web App.

Он понадобится в HTML-форме.

## Скриншот

Deployment completed.

## Акцент

Web app URL.

---

# Слайд 219. Что мы получили

## Заголовок

У нас появился HTTP endpoint

## Текст

Теперь существует цепочка:

```text
POST
https://script.google.com/.../exec
```

↓

```text
doPost(e)
```

↓

```text
sheet.appendRow(...)
```

↓

Google Sheets

## Визуал

Эту схему крупно.

---

# Слайд 220. Возвращаемся в ga4-analytics-lab

## Заголовок

Шаг 18. Открыть проект в VS Code

## Текст

Откройте тот же проект, который использовали на предыдущих занятиях.

Новый проект не создаём.

Работаем с существующим:

```text
ga4-analytics-lab
```

## Скриншот

VS Code Explorer.

---

# Слайд 221. Открываем contacts.html

## Заголовок

Шаг 19. Найти форму

## Текст

Откройте:

```text
contacts.html
```

Найдите существующую форму:

```html
<form id="lead-form">
```

Будем расширять её, а не создавать ещё одну.

## Скриншот

VS Code → contacts.html.

---

# Слайд 222. Поля пользователя

## Заголовок

Форма содержит только необходимые данные

## Текст

Основная часть:

```html
<input
  type="text"
  name="name"
  placeholder="Имя"
  required
>

<input
  type="email"
  name="email"
  placeholder="Email"
  required
>

<select name="direction" required>
  <option value="">Выберите направление</option>
  <option value="frontend">Frontend</option>
  <option value="backend">Backend</option>
  <option value="data">Data</option>
</select>

<button type="submit">
  Отправить заявку
</button>
```

## Скриншот

Форма в VS Code и её вид в браузере.

---

# Слайд 223. Указываем адрес Apps Script

## Заголовок

Шаг 20. action и method

## Текст

Измените открывающий `<form>`:

```html
<form
  id="lead-form"
  action="ВАШ_APPS_SCRIPT_URL"
  method="POST"
  target="submission-frame"
>
```

`action` — куда отправляется форма.

`method="POST"` — способ передачи данных.

## Скриншот

Открывающий тег form.

---

# Слайд 224. Не уходим со страницы

## Заголовок

Шаг 21. Скрытый iframe

## Текст

После формы добавьте:

```html
<iframe
  name="submission-frame"
  id="submission-frame"
  hidden
></iframe>
```

Форма отправится в Apps Script, но браузер не заменит нашу страницу ответом Web App.

## Визуал

Form → hidden iframe → Apps Script.

---

# Слайд 225. Системные поля делаем hidden

## Заголовок

Шаг 22. Добавить технические поля

## Текст

Внутрь формы добавьте:

```html
<input
  type="hidden"
  name="request_id"
  id="request_id"
>

<input
  type="hidden"
  name="utm_source"
  id="utm_source"
>

<input
  type="hidden"
  name="utm_medium"
  id="utm_medium"
>

<input
  type="hidden"
  name="utm_campaign"
  id="utm_campaign"
>
```

Пользователь их не заполняет.

JavaScript заполнит их автоматически.

## Скриншот

Hidden inputs в VS Code.

---

# Слайд 226. Почему status не hidden input

## Заголовок

Не отправляем статус из браузера

## Текст

Можно было бы добавить:

```html
<input
  type="hidden"
  name="status"
  value="new"
>
```

Но мы этого не делаем.

Статус определяет Apps Script:

```javascript
const status = 'new';
```

Это надёжнее:

клиент не управляет системным состоянием записи.

## Визуал

Browser ✕ status

Server ✓ status

---

# Слайд 227. Читаем UTM из URL

## Заголовок

Шаг 23. URLSearchParams

## Текст

В `script.js`:

```javascript
const params =
  new URLSearchParams(window.location.search);
```

Теперь JavaScript может читать параметры текущей ссылки.

Например:

```text
utm_source
utm_medium
utm_campaign
```

## Скриншот

JS-код в VS Code.

---

# Слайд 228. Заполняем hidden UTM

## Заголовок

Шаг 24. Передать источник в форму

## Текст

Добавьте:

```javascript
const utmSource =
  document.querySelector('#utm_source');

const utmMedium =
  document.querySelector('#utm_medium');

const utmCampaign =
  document.querySelector('#utm_campaign');

utmSource.value =
  params.get('utm_source') || 'direct';

utmMedium.value =
  params.get('utm_medium') || 'none';

utmCampaign.value =
  params.get('utm_campaign') || 'not_set';
```

## Скриншот

JS-блок заполнения UTM.

---

# Слайд 229. Проверяем UTM в браузере

## Заголовок

Шаг 25. Открыть тестовую ссылку

## Текст

Откройте:

```text
https://ВАШ-САЙТ.vercel.app/contacts.html
?utm_source=telegram
&utm_medium=social
&utm_campaign=lesson07
```

JavaScript должен получить:

```text
telegram
social
lesson07
```

## Скриншот

Браузер с полной UTM-ссылкой в адресной строке.

---

# Слайд 230. Создаём request_id

## Заголовок

Шаг 26. Уникальный ID в браузере

## Текст

Перед отправкой формы создадим ID:

```javascript
const requestId =
  document.querySelector('#request_id');
```

При submit:

```javascript
requestId.value =
  'REQ-' +
  crypto.randomUUID()
    .slice(0, 8)
    .toUpperCase();
```

Пример:

```text
REQ-3F7A81D2
```

## Скриншот

Код генерации request_id.

---

# Слайд 231. Почему random ID

## Заголовок

ID не должен зависеть от номера строки

## Текст

Не используем:

```text
1
2
3
4
```

как основной идентификатор заявки.

Строки могут:

перемещаться;

удаляться;

объединяться;

передаваться в другие системы.

ID должен существовать независимо от положения строки.

## Визуал

Row 15 ≠ Request ID.

---

# Слайд 232. Оставляем событие GA4

## Заголовок

Шаг 27. generate_lead никуда не исчезает

## Текст

При submit продолжаем отправлять:

```javascript
gtag('event', 'generate_lead', {
  lead_source: 'contact_form'
});
```

Это аналитическое событие.

Одновременно обычный HTML POST отправит данные формы в Apps Script.

## Визуал

Submit:

```text
├→ gtag → GA4
└→ POST → Apps Script
```

---

# Слайд 233. Итоговый обработчик формы

## Заголовок

Шаг 28. JavaScript перед отправкой

## Текст

Получается:

```javascript
const leadForm =
  document.querySelector('#lead-form');

const requestId =
  document.querySelector('#request_id');

if (leadForm) {
  leadForm.addEventListener('submit', () => {

    requestId.value =
      'REQ-' +
      crypto.randomUUID()
        .slice(0, 8)
        .toUpperCase();

    gtag('event', 'generate_lead', {
      lead_source: 'contact_form'
    });
  });
}
```

Важно:

`preventDefault()` здесь не используем.

Нам нужна настоящая отправка POST.

## Скриншот

Итоговый обработчик в `script.js`.

---

# Слайд 234. Вся HTML-форма

## Заголовок

Контроль структуры contacts.html

## Текст

```html
<form
  id="lead-form"
  action="ВАШ_APPS_SCRIPT_URL"
  method="POST"
  target="submission-frame"
>

  <input
    type="text"
    name="name"
    placeholder="Имя"
    required
  >

  <input
    type="email"
    name="email"
    placeholder="Email"
    required
  >

  <select name="direction" required>
    <option value="">
      Выберите направление
    </option>

    <option value="frontend">
      Frontend
    </option>

    <option value="backend">
      Backend
    </option>

    <option value="data">
      Data
    </option>
  </select>

  <input
    type="hidden"
    name="request_id"
    id="request_id"
  >

  <input
    type="hidden"
    name="utm_source"
    id="utm_source"
  >

  <input
    type="hidden"
    name="utm_medium"
    id="utm_medium"
  >

  <input
    type="hidden"
    name="utm_campaign"
    id="utm_campaign"
  >

  <button type="submit">
    Отправить заявку
  </button>

</form>

<iframe
  name="submission-frame"
  hidden
></iframe>
```

## Скриншот

Contacts.html целиком в VS Code.

---

# Слайд 235. Сохраняем изменения

## Заголовок

Шаг 29. Сохранить файлы

## Текст

Сохраните:

```text
contacts.html
js/script.js
```

Проверьте Source Control.

## Скриншот

VS Code Source Control с двумя изменёнными файлами.

---

# Слайд 236. Commit

## Заголовок

Шаг 30. Зафиксировать изменение

## Текст

Commit:

```text
Add Google Sheets lead collection
```

После этого:

**Commit**

↓

**Sync Changes / Push**

## Скриншот

Source Control с commit message.

---

# Слайд 237. Vercel Deployment

## Заголовок

Шаг 31. Проверить публикацию

## Текст

Откройте:

**Vercel → Project → Deployments**

Последний deployment должен соответствовать:

```text
Add Google Sheets lead collection
```

После успешного deployment откройте Production URL.

## Скриншот

Vercel Deployments.

---

# Слайд 238. Первый тест без UTM

## Заголовок

Шаг 32. Direct-заявка

## Текст

Откройте сайт обычной ссылкой:

```text
https://ВАШ-САЙТ.vercel.app/contacts.html
```

Заполните тестовыми данными:

```text
Иван Тестов
student@example.com
Frontend
```

Нажмите:

**Отправить заявку**

## Скриншот

Заполненная форма перед отправкой.

---

# Слайд 239. Проверяем Google Sheets

## Заголовок

Шаг 33. Появилась новая строка?

## Текст

Откройте лист:

```text
leads
```

Должна появиться запись примерно такого вида:

```text
REQ-...
timestamp
Иван Тестов
student@example.com
backend
direct
none
not_set
new
```

## Скриншот

Первая реальная тестовая строка в Google Sheets.

---

# Слайд 240. Проверяем автоматические поля

## Заголовок

Что пользователь не вводил?

## Текст

Найдите:

```text
request_id
created_at
status
```

Пользователь их не заполнял.

Они появились автоматически.

Это пример системных данных.

## Скриншот

Google Sheet.

## Акцент

request_id + created_at + status.

---

# Слайд 241. Теперь тестируем UTM

## Заголовок

Шаг 34. Telegram-заявка

## Текст

Откройте:

```text
https://ВАШ-САЙТ.vercel.app/contacts.html
?utm_source=telegram
&utm_medium=social
&utm_campaign=lesson07
```

Отправьте ещё одну тестовую заявку.

## Скриншот

Браузер с UTM URL.

---

# Слайд 242. UTM доехала до таблицы?

## Заголовок

Шаг 35. Проверить source

## Текст

В новой строке должны появиться:

```text
utm_source = telegram
utm_medium = social
utm_campaign = lesson07
```

Теперь мы связали рекламную ссылку и реальную запись заявки.

## Скриншот

Google Sheet.

## Акцент

Три UTM-столбца.

---

# Слайд 243. Проверяем GA4 одновременно

## Заголовок

Та же отправка должна создать generate_lead

## Текст

Откройте:

**GA4 → Realtime**

или DebugView.

Найдите:

```text
generate_lead
```

Одна отправка формы дала два результата.

## Скриншот

GA4 Realtime / DebugView с generate_lead.

---

# Слайд 244. Сравниваем две системы

## Заголовок

Не путайте данные

## Текст

В GA4:

```text
generate_lead
utm_source
campaign
страница
```

В Google Sheets:

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

GA4 ↔ Google Sheets.

Общие поля:

UTM.

Разные цели:

аналитика / обработка заявки.

---

# Слайд 245. Проверяем обязательное поле

## Заголовок

Шаг 36. Попробовать отправить пустую форму

## Текст

Удалите значение `name`.

Попробуйте отправить форму.

HTML `required` должен остановить отправку до обращения к Apps Script.

## Скриншот

Browser validation message около пустого поля.

---

# Слайд 246. Почему двух уровней проверки недостаточно не бывает

## Заголовок

Browser validation + server validation

## Текст

Первый уровень:

```text
HTML required
```

делает форму удобнее.

Второй:

```text
Apps Script validation
```

защищает таблицу от запроса, отправленного в обход интерфейса.

Проверка только в браузере недостаточна.

## Визуал

CLIENT

↓

SERVER

↓

DATA

---

# Слайд 247. Проверяем дубль

## Заголовок

Шаг 37. Смоделировать duplicate ID

## Текст

Скопируйте одну корректную строку Google Sheets и вставьте её ниже без изменения `request_id`.

Conditional Formatting должен выделить одинаковые ID.

Это демонстрирует проблему:

**одна и та же заявка появилась два раза.**

## Скриншот

Две строки с одинаковым request_id.

## Акцент

Повторяющиеся ID.

---

# Слайд 248. Apps Script уже умеет отклонять дубль

## Заголовок

Повторный POST с тем же ID не должен создать строку

## Текст

В коде уже существует:

```javascript
if (duplicate) {
  return jsonResponse({
    ok: false,
    error: 'duplicate_request_id'
  });
}
```

То есть проверка есть не только визуально в таблице.

Она присутствует и на входе.

## Визуал

Same ID

↓

Apps Script

↓

REJECT

---

# Слайд 249. Проверяем неправильный status

## Заголовок

Шаг 38. Ввести неверное состояние

## Текст

В тестовой строке попробуйте установить:

```text
finished
```

вместо допустимых значений.

Data Validation должна показать ошибку или отклонить ввод.

Допустимый словарь:

```text
new
in_progress
done
rejected
```

## Скриншот

Ошибка Data Validation.

---

# Слайд 250. Изменяем статус правильно

## Заголовок

Шаг 39. Заявка начинает обрабатываться

## Текст

Для одной записи смените:

```text
new
```

на:

```text
in_progress
```

Затем:

```text
done
```

Теперь таблица хранит не только факт получения заявки, но и её состояние.

## Скриншот

Dropdown status.

---

# Слайд 251. Что такое controlled source

## Заголовок

Таблица больше не просто набор ячеек

## Текст

Контролируемый источник данных имеет:

определённую структуру;

идентификаторы;

типы значений;

обязательные поля;

ограниченные справочники;

правила качества;

понятный процесс обновления.

## Визуал

Spreadsheet

↓

STRUCTURE

↓

RULES

↓

CONTROLLED DATA

---

# Слайд 252. Чем плох хаос

## Заголовок

Как выглядит неконтролируемая таблица

## Текст

Проблемный набор:

```text
id      status      source
1       new         Telegram
2       готово      tg
2       NEW         telegram
        done
5       закончил    Телега
```

Проблемы:

дубль ID;

пустое поле;

разные названия статуса;

разные обозначения источника.

## Визуал

Красные отметки возле ошибок.

---

# Слайд 253. Как выглядит контролируемая таблица

## Заголовок

Одинаковые правила для всех записей

## Текст

```text
request_id | source   | status
REQ-001    | telegram | new
REQ-002    | telegram | done
REQ-003    | vk       | in_progress
```

Данные становятся пригодны для:

фильтрации;

аналитики;

Power Query;

API;

n8n;

CRM.

## Визуал

Чистая таблица с зелёными проверками.

---

# Слайд 254. Полный маршрут заявки

## Заголовок

Теперь пользователь действительно создаёт запись

## Текст

```text
UTM LINK
↓
VERCEL WEBSITE
↓
FORM
├────────────→ GA4
│              generate_lead
│
└→ APPS SCRIPT
       ↓
   VALIDATION
       ↓
  GOOGLE SHEETS
       ↓
 request_id
 timestamp
 UTM
 status
```

## Визуал

Архитектурная схема на весь слайд.

---

# Слайд 255. Что мы пока специально не делаем

## Заголовок

Это ещё не production backend

## Текст

Наш Apps Script — простой приёмник заявок.

Мы пока не разбираем:

полноценную авторизацию;

rate limiting;

captcha;

защиту от спама;

базу данных;

сложную обработку ошибок;

очереди;

production API.

Эти задачи требуют другой архитектуры.

## Визуал

LAB ≠ PRODUCTION.

---

# Слайд 256. Ещё одно ограничение

## Заголовок

Пока мы почти не анализируем HTTP-ответ

## Текст

Сайт умеет отправить POST в Apps Script.

Но мы пока не строим полноценную клиентскую обработку:

```text
200
400
409
500
```

и не рассматриваем API-контракт.

Это будет отдельная тема позже:

**HTTP API и Webhook.**

## Визуал

POST → ??? → response.

---

# Слайд 257. Почему это важно для следующих тем

## Заголовок

Теперь у нас появились настоящие данные

## Текст

До сегодняшнего занятия мы могли искусственно создать CSV.

Теперь CSV можно получить из реальной таблицы заявок.

Это значит, что следующая тема может работать уже с нашим собственным dataset.

## Визуал

Google Sheets

↓

Export / CSV

↓

Power Query

---

# Слайд 258. Подготавливаем следующую проблему

## Заголовок

Но данные всё равно будут грязными

## Текст

Со временем появятся:

лишние пробелы;

разный регистр;

пустые значения;

старые записи;

несколько файлов;

новые источники;

ошибочные статусы;

дубли.

Исправлять всё руками нельзя.

## Визуал

Clean Sheet → со временем → messy data.

---

# Слайд 259. Следующий инструмент

## Заголовок

Power Query

## Текст

Следующая задача:

взять набор заявок;

импортировать его;

очистить;

нормализовать;

выделить ошибки;

повторить те же преобразования на новой версии данных нажатием:

**Refresh**

## Визуал

Google Sheets / CSV

↓

POWER QUERY

↓

CLEAN DATA

---

# Слайд 260. Что необходимо сохранить

## Заголовок

Контрольные скриншоты

## Текст

Сделайте скриншоты:

1. структуры Google Sheet;
2. dropdown `status`;
3. Conditional Formatting для duplicate ID;
4. Apps Script с `doPost(e)`;
5. Deployment Web App;
6. формы с hidden UTM-полями;
7. UTM-ссылки в браузере;
8. первой заявки в Google Sheets;
9. UTM-полей в записанной заявке;
10. `generate_lead` в GA4;
11. проверки пустого обязательного поля;
12. двух строк с одинаковым `request_id`;
13. ошибки неправильного статуса;
14. записи со статусом `in_progress` или `done`.

## Визуал

Checklist.

---

# Слайд 261. Что студент должен уметь объяснить

## Заголовок

Не просто повторить инструкцию

## Текст

После занятия студент должен объяснить:

чем событие GA4 отличается от заявки;

зачем нужен `request_id`;

почему timestamp создаёт система;

зачем сохранять UTM вместе с заявкой;

почему status имеет ограниченный словарь;

чем клиентская валидация отличается от серверной;

что такое duplicate ID;

зачем Apps Script находится между сайтом и Google Sheets;

почему этот Apps Script endpoint не является полноценным production backend.

## Визуал

Concept map.

---

# Слайд 262. Итог занятия

## Заголовок

Контролируемая таблица заявок v1

## Текст

Сегодня мы построили:

```text
FORM
↓
POST
↓
APPS SCRIPT
↓
VALIDATION
↓
GOOGLE SHEETS
```

И сохранили связь с аналитикой:

```text
FORM
↓
generate_lead
↓
GA4
```

Теперь в проекте существуют одновременно:

**аналитическое событие**

и

**реальная запись заявки**.

## Визуал

Финальная схема из двух веток.

---

# Слайд 263. Следующая тема

## Заголовок

Power Query: данные без ручного исправления

## Текст

Следующее занятие:

экспортируем набор заявок;

создадим грязную версию данных;

импортируем её в Power Query;

разберём Applied Steps;

приведём типы;

очистим строки;

обработаем null и ошибки;

выполним Refresh;

докажем, что весь pipeline воспроизводится на новой порции данных.

## Визуал

GOOGLE SHEETS

↓

CSV

↓

POWER QUERY

↓

APPLIED STEPS

↓

REFRESH

---

# Слайд 264. Готовая таблица целиком

## После

174

## Заголовок

Так будет выглядеть таблица в конце

## Текст

Девять столбцов, закреплённая строка заголовков, формат даты у `created_at` и список статусов в последнем столбце.

Две строки внизу — настоящие заявки, отправленные формой сайта: одна пришла без меток, вторая по ссылке из Telegram.

## Скриншот

Готовый лист leads с двумя заявками.

## Акцент

Результат всех восьми этапов занятия.

---

# Слайд 265. Закрепляем строку заголовков

## После

183

## Заголовок

Шаг 4а. Закрепить первую строку

## Текст

Пока строка не закреплена, при прокрутке заголовки уезжают вверх и непонятно, в каком столбце вы находитесь.

Клик по любой ячейке → **Вид** → **Закрепить** → **1 строку**.

Под первой строкой появится серая разделительная полоса: она и означает, что строка закреплена.

## Скриншот

Google Sheets с раскрытым меню Вид и подменю Закрепить.

## Акцент

Вид → Закрепить → 1 строку

---

# Слайд 272. Шапка остаётся на месте

## После

183

## Заголовок

Как это выглядит при прокрутке

## Текст

Прокрутите лист вниз. Строка с заголовками осталась вверху, под ней — серая разделительная полоса.

Номера строк при этом идут с большими значениями: видно, что таблица прокручена, а шапка никуда не делась.

Если полосы нет и заголовки уехали — закрепление не применилось, вернитесь на шаг назад.

## Скриншот

Прокрученный лист leads с закреплённой первой строкой.

## Акцент

Серая полоса под строкой 1

---

# Слайд 266. Формат даты для created_at

## После

183

## Заголовок

Шаг 4б. Формат даты и времени

## Текст

Apps Script пришлёт в столбец `created_at` настоящую дату, но без формата таблица покажет её как число.

Клик по заголовку столбца **B** → **Формат** → **Числа** → **Дата и время**.

Формат задаём заранее, до первой заявки: тогда первая же запись сразу читается как дата.

## Скриншот

Меню Формат → Числа с пунктом даты и времени.

## Акцент

Столбец B целиком, а не отдельные ячейки

---

# Слайд 267. Ширина столбцов

## После

183

## Заголовок

Шаг 4в. Подогнать ширину столбцов

## Текст

`request_id` длинный: в столбце по умолчанию он обрезается многоточием и проверить заявку глазами невозможно.

Выделите заголовки **A**…**I** → правый клик по любому из них → **Изменить размер столбцов A–I** → **Автоподбор размера**.

Ширина подстроится под самое длинное значение в каждом столбце.

## Скриншот

Диалог изменения размера столбцов с выбранным автоподбором.

## Акцент

Автоподбор размера

---

# Слайд 270. Первое правило в работе

## После

193

## Заголовок

Как выглядит подсветка

## Текст

Впишите в пустую строку только `request_id` и имя, а email и направление оставьте пустыми.

Строка целиком станет красной: правило увидело, что заявка начата, но три обязательных поля заполнены не все.

Заполните недостающие поля — подсветка пропадёт сама. Ничего нажимать для этого не нужно.

## Скриншот

Лист leads с красной подсветкой неполной строки.

## Акцент

Подсвечивается вся строка A–I

---

# Слайд 268. Диапазон второго правила

## После

193

## Заголовок

Шаг 8а. Выделить столбец

## Текст

Второе правило работает только по столбцу `request_id`, поэтому диапазон у него другой.

Кликните в сетке по ячейке **A2**, затем нажмите **⌘ + Shift + ↓** — выделение дойдёт до конца столбца.

Если в столбце уже есть заявки, сочетание сначала остановится на последней заполненной строке. Нажмите его ещё раз.

Поле «Применить к диапазону» в панели заполнится само. Набирать диапазон руками в этом поле не нужно: панель принимает только выделение из сетки.

## Скриншот

Выделенный столбец A2:A1000 и открытая панель условного форматирования.

## Акцент

Сначала выделение в сетке, потом «Добавить правило»

---

# Слайд 269. Два правила в списке

## После

194

## Заголовок

Проверяем: правил стало два

## Текст

Нажмите **Готово**. В панели останется список из двух правил.

У первого диапазон по всем девяти столбцам — подсветка неполной заявки. У второго только столбец A — повторяющийся `request_id`.

Порядок в списке важен: если два правила совпадут на одной ячейке, Sheets применит то, что выше.

## Скриншот

Панель условного форматирования со списком из двух правил.

## Акцент

Разные диапазоны у разных правил

---

# Слайд 271. Оба правила сразу

## После

194

## Заголовок

Два правила на одном листе

## Текст

Теперь на листе работают обе проверки, и путать их не нужно: у них разный цвет и разная ширина.

Красная строка — неполная заявка, подсвечена целиком от A до I.

Оранжевая ячейка — повторяющийся `request_id`, подсвечен только столбец A.

## Скриншот

Лист leads: красная неполная строка и оранжевый дубль ID.

## Акцент

Разный цвет — разное правило
