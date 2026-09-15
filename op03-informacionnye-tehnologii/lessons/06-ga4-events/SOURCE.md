# Слайд 89. Где мы остановились

## Заголовок

Сайт уже передаёт данные в GA4

## Текст

На предыдущем этапе мы построили цепочку:

VS Code

↓

GitHub

↓

Vercel

↓

Google Tag

↓

GA4

↓

Realtime

Мы уже видим просмотры страниц.

Теперь необходимо понять, как GA4 фиксирует действия пользователя.

## Визуал

Схема:

USER → WEBSITE → GOOGLE TAG → GA4

Под GA4 показать:

`page_view ✓`

---

# Слайд 90. Главная идея GA4

## Заголовок

GA4 построен вокруг событий

## Текст

В Google Analytics 4 действия пользователя описываются событиями.

Событие отвечает на вопрос:

**Что произошло?**

Например:

```text
page_view
scroll
click
form_submit
file_download
generate_lead
purchase
```

## Визуал

Пользователь в центре.

Вокруг карточки:

OPEN PAGE
SCROLL
CLICK
FORM
DOWNLOAD

Каждая стрелка заканчивается словом:

EVENT

---

# Слайд 91. Что такое Event

## Заголовок

Event = зафиксированное действие

## Текст

Event — событие, которое описывает определённое взаимодействие или состояние.

Например:

Пользователь открыл страницу.

GA4 получает:

```text
page_view
```

Пользователь отправил форму.

GA4 может получить:

```text
form_submit
```

или более осмысленное бизнес-событие:

```text
generate_lead
```

## Визуал

Сделать три карточки:

ДЕЙСТВИЕ

↓

EVENT NAME

↓

GA4

---

# Слайд 92. Событие — это не просто название

## Заголовок

Event Name + Parameters

## Текст

Событие может содержать дополнительную информацию.

Например:

```text
event:
file_download

parameters:
file_name = guide.pdf
file_extension = pdf
link_text = Скачать
```

Название отвечает:

**Что произошло?**

Параметры отвечают:

**Где? С чем? Каким способом?**

## Визуал

Большая карточка:

EVENT
`file_download`

ниже:

PARAMETERS
`file_name`
`file_extension`
`link_text`

---

# Слайд 93. Четыре типа событий

## Заголовок

Какие события бывают в GA4

## Текст

Условно события можно разделить на четыре группы:

**Automatically collected**

собираются автоматически.

**Enhanced Measurement**

собираются автоматически при включённой расширенной статистике.

**Recommended Events**

добавляем самостоятельно, но используем названия и структуру Google.

**Custom Events**

полностью определяем самостоятельно.

## Визуал

4 вертикальные карточки.

1. Automatic
2. Enhanced
3. Recommended
4. Custom

---

# Слайд 94. Сначала ничего не программируем

## Заголовок

Посмотрим, что GA4 уже собирает

## Текст

Перед добавлением собственного JavaScript необходимо проверить существующие события.

Google рекомендует не создавать собственное событие, если нужное действие уже собирается автоматически или для него существует рекомендуемое событие.

## Визуал

Схема принятия решения:

Нужно измерить действие

↓

GA4 уже собирает?

YES → используем существующее

NO ↓

Есть Recommended Event?

YES → используем его

NO ↓

Custom Event

---

# Слайд 95. Возвращаемся в наш Web Data Stream

## Заголовок

Шаг 1. Открыть Enhanced Measurement

## Текст

В GA4 перейдите:

**Admin**

↓

**Data collection and modification**

↓

**Data streams**

↓

наш Web Data Stream

Найдите:

**Enhanced measurement**

## Скриншот

Web stream details.

## Акцент

Выделить блок Enhanced measurement.

---

# Слайд 96. Enhanced Measurement

## Заголовок

Часть событий можно получать без кода

## Текст

Enhanced Measurement позволяет собирать ряд взаимодействий без написания дополнительного JavaScript.

Если функция включена, Google Tag начинает автоматически отслеживать поддерживаемые действия.

## Скриншот

Блок Enhanced Measurement.

Должен быть виден переключатель:

On.

---

# Слайд 97. Открываем настройки

## Заголовок

Шаг 2. Посмотреть автоматические измерения

## Текст

Рядом с Enhanced Measurement откройте настройки.

Посмотрите, какие измерения включены.

В зависимости от сайта там могут использоваться:

Page views;

Scrolls;

Outbound clicks;

Site search;

Video engagement;

File downloads;

Form interactions.

## Скриншот

Открытые настройки Enhanced Measurement.

---

# Слайд 98. Page View

## Заголовок

`page_view`

## Текст

`page_view` фиксирует просмотр страницы.

Например:

```text
/
```

↓

```text
page_view
```

Переходим:

```text
/about.html
```

↓

ещё один:

```text
page_view
```

## Визуал

Три страницы сайта.

Home → page_view
About → page_view
Contacts → page_view

---

# Слайд 99. У page_view есть параметры

## Заголовок

Как GA4 понимает, какую страницу открыли

## Текст

Одно название:

```text
page_view
```

не говорит, какая конкретно страница была открыта.

Поэтому вместе с событием передаются параметры.

Например:

```text
page_location
page_referrer
```

`page_location` содержит адрес страницы.

## Визуал

Карточка:

```text
page_view

page_location:
/about.html
```

---

# Слайд 100. Scroll

## Заголовок

`scroll`

## Текст

При включённом Enhanced Measurement GA4 может автоматически фиксировать глубокую прокрутку страницы.

Стандартное событие:

```text
scroll
```

срабатывает, когда пользователь впервые достигает примерно 90% вертикальной глубины страницы.

## Визуал

Высокая веб-страница.

Линия на 90%.

При достижении:

`scroll`

---

# Слайд 101. Проверяем Scroll

## Заголовок

Шаг 3. Прокрутить страницу

## Текст

Откройте опубликованный сайт:

```text
https://ВАШ-ПРОЕКТ.vercel.app
```

Прокрутите длинную страницу почти до конца.

После этого вернитесь в:

**Reports → Realtime**

Найдите событие:

```text
scroll
```

## Скриншот

Realtime → Event count by Event name.

## Акцент

`scroll`

---

# Слайд 102. Click — важное уточнение

## Заголовок

GA4 не фиксирует автоматически любой клик

## Текст

Событие Enhanced Measurement:

```text
click
```

по умолчанию предназначено для **outbound clicks**.

То есть для переходов по ссылкам на другой домен.

Обычное нажатие на внутреннюю кнопку сайта автоматически не становится событием `click` только потому, что пользователь нажал кнопку.

## Визуал

Два примера:

`Наш сайт → about.html`

НЕ outbound

`Наш сайт → github.com`

outbound click ✓

---

# Слайд 103. Подготовим внешний переход

## Заголовок

Шаг 4. Найти внешнюю ссылку

## Текст

В нашем учебном проекте должна быть ссылка, например:

```html
<a href="https://github.com/" target="_blank">
    Открыть GitHub
</a>
```

Если такой ссылки нет — добавьте её на главную страницу.

## Скриншот

VS Code.

Показать HTML внешней ссылки.

---

# Слайд 104. Проверяем outbound click

## Заголовок

Шаг 5. Нажать внешнюю ссылку

## Текст

Откройте опубликованный сайт.

Нажмите:

**Открыть GitHub**

После этого в Realtime должно появиться событие:

```text
click
```

Вместе с ним GA4 может передать информацию о ссылке.

## Скриншот

Realtime с событием `click`.

---

# Слайд 105. Параметры click

## Заголовок

GA4 знает, куда перешёл пользователь

## Текст

Для outbound click могут передаваться параметры:

```text
link_url
link_domain
link_id
link_classes
outbound
```

Например:

```text
event = click

link_domain = github.com
outbound = true
```

## Визуал

Карточка события с параметрами.

---

# Слайд 106. File Download

## Заголовок

`file_download`

## Текст

Enhanced Measurement умеет автоматически отслеживать переход по ссылке на файл распространённого формата.

Например:

PDF;

DOCX;

XLSX;

ZIP;

CSV;

MP3;

MP4.

Для такого действия GA4 может сформировать:

```text
file_download
```

## Визуал

Кнопка:

DOWNLOAD PDF

↓

`file_download`

---

# Слайд 107. Добавляем учебный файл

## Заголовок

Шаг 6. Подготовить PDF для скачивания

## Текст

Добавьте в проект папку:

```text
assets/
```

и файл:

```text
analytics-guide.pdf
```

Структура:

```text
ga4-analytics-lab/
├── assets/
│   └── analytics-guide.pdf
├── index.html
├── about.html
└── contacts.html
```

## Скриншот

Explorer VS Code.

---

# Слайд 108. Добавляем ссылку на файл

## Заголовок

Шаг 7. Создать кнопку скачивания

## Текст

В `index.html` добавьте:

```html
<a
    href="assets/analytics-guide.pdf"
    download
>
    Скачать материал
</a>
```

После сохранения отправьте изменения:

Save

↓

Commit

↓

Push

↓

Vercel Deployment

## Скриншот

HTML-код ссылки в VS Code.

---

# Слайд 109. Проверяем скачивание

## Заголовок

Шаг 8. Скачать файл

## Текст

После нового Deployment откройте Production URL.

Нажмите:

**Скачать материал**

Вернитесь в Realtime.

Найдите:

```text
file_download
```

## Скриншот

Realtime.

## Акцент

`file_download`

---

# Слайд 110. Что можно узнать о файле

## Заголовок

Параметры file_download

## Текст

Вместе с событием могут передаваться:

```text
file_name
file_extension
link_url
link_text
```

Например:

```text
file_name = analytics-guide
file_extension = pdf
```

Событие говорит:

**Файл скачали.**

Параметры говорят:

**Какой именно файл скачали.**

## Визуал

EVENT + PARAMETERS.

---

# Слайд 111. Form Interactions

## Заголовок

Форма тоже может отслеживаться автоматически

## Текст

Enhanced Measurement поддерживает события взаимодействия с формой:

```text
form_start
```

и:

```text
form_submit
```

`form_start` фиксирует начало взаимодействия с формой.

`form_submit` — отправку формы.

## Визуал

Форма:

Имя
Email
Отправить

↓

`form_start`

↓

`form_submit`

---

# Слайд 112. Проверяем настройки формы

## Заголовок

Шаг 9. Form interactions

## Текст

Вернитесь:

Admin

↓

Data streams

↓

Web Data Stream

↓

Enhanced Measurement Settings

Проверьте, включено ли:

**Form interactions**

## Скриншот

Настройки Enhanced Measurement.

## Акцент

Form interactions.

---

# Слайд 113. Форма учебного проекта

## Заголовок

На странице должна быть форма

## Текст

На `contacts.html` используем форму:

```html
<form id="lead-form">
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

    <button type="submit">
        Отправить заявку
    </button>
</form>
```

## Скриншот

Форма в браузере и соответствующий HTML в VS Code.

---

# Слайд 114. Важное правило данных

## Заголовок

Не отправляем персональные данные в GA4

## Текст

Наличие имени или email в форме не означает, что эти значения нужно отправлять в Analytics.

Не передаём в параметры событий:

имя;

email;

номер телефона;

пароль;

другие персональные идентификаторы пользователя.

Мы анализируем действие, а не содержимое персональных полей.

## Визуал

Слева:

`generate_lead ✓`

Справа:

`email = student@gmail.com ✕`

---

# Слайд 115. Проверяем form_start

## Заголовок

Шаг 10. Начать заполнять форму

## Текст

Откройте страницу Contacts.

Кликните в поле формы.

Начните вводить данные.

Вернитесь в Realtime.

Найдите:

```text
form_start
```

## Скриншот

Realtime.

## Акцент

form_start.

---

# Слайд 116. Проверяем form_submit

## Заголовок

Шаг 11. Отправить форму

## Текст

Заполните обязательные поля.

Нажмите:

**Отправить заявку**

При работающем автоматическом отслеживании формы можно увидеть:

```text
form_submit
```

## Скриншот

Realtime.

## Акцент

form_submit.

---

# Слайд 117. Но form_submit ещё не говорит о бизнес-смысле

## Заголовок

Техническое событие ≠ бизнес-событие

## Текст

`form_submit` сообщает:

**Форма была отправлена.**

Но для нашего проекта отправка этой формы означает:

**Мы получили потенциального клиента.**

Для такого действия Google предлагает рекомендуемое событие:

```text
generate_lead
```

## Визуал

`form_submit`

↓

Техническое действие

↓

`generate_lead`

↓

Бизнес-смысл

---

# Слайд 118. Recommended Event

## Заголовок

Почему используем generate_lead

## Текст

Если Google уже определил подходящее рекомендуемое событие, лучше использовать его название.

Для отправки формы потенциального клиента подходит:

```text
generate_lead
```

Это позволяет сохранять стандартную семантику GA4 и использовать возможности отчётности, связанные с рекомендуемыми событиями.

## Визуал

Форма → `generate_lead`

---

# Слайд 119. Теперь добавим событие сами

## Заголовок

Шаг 12. Открыть script.js

## Текст

В VS Code откройте:

```text
js/script.js
```

Теперь мы впервые самостоятельно отправим событие в GA4.

Для этого используется функция:

```javascript
gtag()
```

Она уже появилась на сайте вместе с Google Tag.

## Скриншот

VS Code → `js/script.js`.

---

# Слайд 120. Находим форму через JavaScript

## Заголовок

Шаг 13. Получить форму

## Текст

Добавьте:

```javascript
const leadForm = document.querySelector('#lead-form');
```

Теперь переменная `leadForm` содержит нашу HTML-форму.

## Скриншот

VS Code с этой строкой.

---

# Слайд 121. Слушаем submit

## Заголовок

Шаг 14. Реагировать на отправку

## Текст

Добавьте обработчик:

```javascript
leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
});
```

`submit` возникает при отправке формы.

`preventDefault()` используем в учебном проекте, чтобы страница не перезагрузилась и мы могли спокойно проверить событие.

## Визуал

Форма

↓

submit

↓

JavaScript handler

---

# Слайд 122. Отправляем generate_lead

## Заголовок

Шаг 15. gtag('event', ...)

## Текст

Внутри обработчика добавьте:

```javascript
leadForm.addEventListener('submit', (event) => {
    event.preventDefault();

    gtag('event', 'generate_lead');
});
```

Теперь при отправке формы браузер передаст событие:

```text
generate_lead
```

в GA4.

## Скриншот

Код в VS Code.

## Акцент

Строка:

```javascript
gtag('event', 'generate_lead');
```

---

# Слайд 123. Как читается gtag()

## Заголовок

Разберём строку

## Текст

Конструкция:

```javascript
gtag('event', 'generate_lead');
```

читается примерно так:

**Отправить в Google Analytics событие с именем generate_lead.**

Первый аргумент:

```text
event
```

говорит, что отправляем событие.

Второй:

```text
generate_lead
```

задаёт его имя.

## Визуал

Разбить строку на две подписанные части.

---

# Слайд 124. Добавляем параметр

## Заголовок

Шаг 16. Передать контекст события

## Текст

Можно добавить дополнительную информацию:

```javascript
gtag('event', 'generate_lead', {
    lead_source: 'contact_form'
});
```

Теперь GA4 получает:

```text
event:
generate_lead

parameter:
lead_source = contact_form
```

## Скриншот

Код в VS Code.

---

# Слайд 125. Что такое параметр события

## Заголовок

Parameter = дополнительный контекст

## Текст

Параметры передаются в формате:

```text
ключ = значение
```

Например:

```text
lead_source = contact_form
```

или:

```text
button_name = hero_cta
```

Событие говорит:

**что произошло.**

Параметр уточняет:

**как именно это произошло.**

## Визуал

Event:

`generate_lead`

Parameters:

`lead_source → contact_form`

---

# Слайд 126. Код формы целиком

## Заголовок

Итоговый обработчик

## Текст

На данном этапе код может выглядеть так:

```javascript
const leadForm = document.querySelector('#lead-form');

if (leadForm) {
    leadForm.addEventListener('submit', (event) => {
        event.preventDefault();

        gtag('event', 'generate_lead', {
            lead_source: 'contact_form'
        });

        alert('Заявка отправлена');
    });
}
```

## Скриншот

Полный фрагмент в `script.js`.

---

# Слайд 127. Почему проверяем наличие формы

## Заголовок

Зачем нужен if (leadForm)

## Текст

Наш `script.js` может подключаться сразу на нескольких страницах.

Но форма находится только на:

```text
contacts.html
```

Поэтому:

```javascript
if (leadForm)
```

не позволяет коду обращаться к несуществующей форме на других страницах.

## Визуал

Home → no form
About → no form
Contacts → form ✓

---

# Слайд 128. Публикуем изменение

## Заголовок

Шаг 17. Save → Commit → Push

## Текст

Сохраните `script.js`.

В Source Control проверьте изменения.

Создайте commit:

```text
Add generate_lead GA4 event
```

После этого:

**Commit**

↓

**Sync Changes / Push**

## Скриншот

VS Code Source Control.

---

# Слайд 129. Vercel создаёт новую версию

## Заголовок

Шаг 18. Проверить Deployment

## Текст

Откройте Vercel.

Перейдите:

**Project → Deployments**

Проверьте, что новый Deployment создан из коммита:

```text
Add generate_lead GA4 event
```

После успешной публикации откройте Production URL.

## Скриншот

Vercel Deployments.

---

# Слайд 130. Генерируем событие

## Заголовок

Шаг 19. Отправить тестовую заявку

## Текст

На опубликованном сайте:

1. откройте Contacts;
2. заполните форму;
3. нажмите «Отправить заявку».

JavaScript должен вызвать:

```javascript
gtag('event', 'generate_lead', {
    lead_source: 'contact_form'
});
```

## Скриншот

Форма в браузере.

---

# Слайд 131. Проверяем Realtime

## Заголовок

Шаг 20. Найти generate_lead

## Текст

Вернитесь в:

**Reports → Realtime**

Найдите:

```text
generate_lead
```

Если событие появилось — сайт успешно отправил наше собственное событие в GA4.

## Скриншот

Realtime → Event count by Event name.

## Акцент

generate_lead.

---

# Слайд 132. Теперь сделаем Custom Event

## Заголовок

Не для каждого действия есть готовое имя Google

## Текст

Представим, что на главной странице есть большая кнопка:

**Посмотреть программу**

Мы хотим отдельно анализировать именно эту кнопку.

Подходящего автоматически собираемого события для нашего смысла нет.

Создадим:

```text
cta_click
```

## Визуал

Большая CTA-кнопка.

Под ней:

`cta_click`

---

# Слайд 133. Добавляем ID кнопке

## Заголовок

Шаг 21. Подготовить HTML

## Текст

В `index.html`:

```html
<button id="program-cta">
    Посмотреть программу
</button>
```

ID позволит JavaScript найти конкретную кнопку.

## Скриншот

HTML в VS Code.

---

# Слайд 134. Получаем кнопку

## Заголовок

Шаг 22. querySelector

## Текст

В `script.js`:

```javascript
const programCta =
    document.querySelector('#program-cta');
```

## Скриншот

Код VS Code.

---

# Слайд 135. Отправляем cta_click

## Заголовок

Шаг 23. Custom Event

## Текст

Добавьте:

```javascript
if (programCta) {
    programCta.addEventListener('click', () => {
        gtag('event', 'cta_click');
    });
}
```

Теперь нажатие именно этой кнопки вызывает:

```text
cta_click
```

## Скриншот

Код в VS Code.

---

# Слайд 136. Добавим параметры кнопки

## Заголовок

Какую именно CTA нажали?

## Текст

Если на сайте появится несколько CTA, одного `cta_click` станет недостаточно.

Добавим параметры:

```javascript
gtag('event', 'cta_click', {
    button_name: 'program',
    page_section: 'hero'
});
```

Теперь GA4 получает не только факт клика, но и контекст.

## Визуал

EVENT:

`cta_click`

PARAMETERS:

`button_name = program`

`page_section = hero`

---

# Слайд 137. Не превращаем названия событий в хаос

## Заголовок

Правила именования

## Текст

Для собственных событий используйте понятные стабильные имена.

Хорошо:

```text
cta_click
course_card_open
project_demo_open
```

Плохо:

```text
ClickButton
button-click!!!
test123
event_new_final
```

Лучше придерживаться:

lowercase;

английского языка;

snake_case;

понятного бизнес-смысла.

## Визуал

GOOD / BAD.

---

# Слайд 138. Сначала Recommended, потом Custom

## Заголовок

Не изобретайте события без необходимости

## Текст

Перед созданием собственного события задайте три вопроса:

**1. GA4 уже собирает его автоматически?**

Если да — используем готовое.

**2. Есть Recommended Event Google?**

Если да — используем рекомендуемое имя.

**3. Ничего не подходит?**

Создаём Custom Event.

## Визуал

Decision tree.

---

# Слайд 139. Публикуем cta_click

## Заголовок

Шаг 24. Отправить изменения

## Текст

Сохраните:

`index.html`

и:

`script.js`

Создайте commit:

```text
Add CTA analytics event
```

Push.

Проверьте новый Vercel Deployment.

## Скриншот

Source Control + Vercel Deployment.

---

# Слайд 140. Проверяем cta_click

## Заголовок

Шаг 25. Нажать кнопку

## Текст

На Production-сайте нажмите:

**Посмотреть программу**

После этого откройте Realtime.

Найдите:

```text
cta_click
```

## Скриншот

Realtime с cta_click.

---

# Слайд 141. Realtime хорош для быстрой проверки

## Заголовок

Но нам нужен более точный инструмент

## Текст

Realtime показывает активность пользователей и помогает быстро убедиться, что событие приходит.

Но при разработке нам важно видеть:

каждое событие;

порядок событий;

конкретное устройство;

параметры события.

Для этого используется:

**DebugView**

## Визуал

Realtime → быстрый контроль

DebugView → подробная диагностика

---

# Слайд 142. Что такое DebugView

## Заголовок

DebugView — режим диагностики GA4

## Текст

DebugView показывает события, которые Analytics получает от устройства в режиме отладки.

Это удобно, когда мы:

разрабатываем события;

проверяем параметры;

исправляем ошибки;

убеждаемся, что событие вызывается один раз.

## Визуал

Developer → Website → DebugView.

---

# Слайд 143. Включаем Debug Mode

## Заголовок

Шаг 26. Google Tag Assistant

## Текст

Для веб-сайта удобный способ включить debug mode — использовать Google Tag Assistant.

Откройте:

**tagassistant.google.com**

Подключите ваш опубликованный Vercel-сайт.

После подключения взаимодействуйте с сайтом в открытой debug-сессии.

## Скриншот

Google Tag Assistant.

Показать поле подключения URL.

---

# Слайд 144. Открываем DebugView

## Заголовок

Шаг 27. Admin → DebugView

## Текст

В GA4 откройте:

**Admin**

↓

**Data display**

↓

**DebugView**

Оставьте сайт подключённым через Tag Assistant.

## Скриншот

Admin → Data display → DebugView.

## Акцент

DebugView.

---

# Слайд 145. Что показывает DebugView

## Заголовок

События почти по секундам

## Текст

В DebugView можно увидеть последовательность событий конкретного debug-устройства.

Например:

```text
page_view
scroll
cta_click
page_view
form_start
form_submit
generate_lead
```

Это позволяет увидеть путь пользователя буквально по действиям.

## Скриншот

DebugView timeline.

---

# Слайд 146. Проверяем generate_lead подробно

## Заголовок

Шаг 28. Открыть событие

## Текст

На сайте снова отправьте форму.

В DebugView найдите:

```text
generate_lead
```

Нажмите на событие.

Посмотрите его параметры.

## Скриншот

DebugView с открытым generate_lead.

---

# Слайд 147. Проверяем lead_source

## Заголовок

Параметр дошёл?

## Текст

Внутри `generate_lead` должен присутствовать:

```text
lead_source
```

со значением:

```text
contact_form
```

Если параметр отсутствует — возвращаемся к JavaScript и проверяем объект параметров.

## Скриншот

DebugView → generate_lead → parameters.

## Акцент

lead_source.

---

# Слайд 148. Проверяем cta_click

## Заголовок

Шаг 29. Проверить Custom Event

## Текст

Нажмите:

**Посмотреть программу**

В DebugView найдите:

```text
cta_click
```

Откройте событие.

Проверьте:

```text
button_name = program
page_section = hero
```

## Скриншот

DebugView с параметрами cta_click.

---

# Слайд 149. Realtime и DebugView

## Заголовок

Не путайте инструменты

## Текст

**Realtime**

показывает текущую активность пользователей.

Используем, чтобы быстро увидеть:

«Данные вообще приходят?»

**DebugView**

используем при разработке.

Он помогает ответить:

«Какое событие пришло и какие параметры оно содержит?»

## Визуал

Две колонки:

REALTIME
контроль

DEBUGVIEW
диагностика

---

# Слайд 150. Параметр пришёл, но этого ещё недостаточно

## Заголовок

Как использовать custom parameter в отчётах?

## Текст

DebugView уже показывает:

```text
button_name
page_section
```

Но для полноценного использования собственного параметра в отчётах GA4 может потребоваться зарегистрировать его как:

**Custom Dimension**

## Визуал

Parameter

↓

Custom Dimension

↓

Reports / Explore

---

# Слайд 151. Открываем Custom Definitions

## Заголовок

Шаг 30. Admin → Custom definitions

## Текст

В GA4:

**Admin**

↓

**Data display**

↓

**Custom definitions**

Откройте вкладку:

**Custom dimensions**

Нажмите:

**Create custom dimension**

## Скриншот

Custom definitions.

---

# Слайд 152. Регистрируем button_name

## Заголовок

Шаг 31. Создать Event-scoped Dimension

## Текст

Заполните:

**Dimension name**

Button name

**Scope**

Event

**Description**

CTA button identifier

**Event parameter**

```text
button_name
```

Нажмите:

**Save**

## Скриншот

Create custom dimension.

---

# Слайд 153. Регистрируем page_section

## Заголовок

Шаг 32. Второй параметр

## Текст

Аналогично создайте:

**Dimension name**

Page section

**Scope**

Event

**Event parameter**

```text
page_section
```

Теперь эти значения можно будет использовать для более детального анализа.

## Скриншот

Вторая Custom Dimension.

---

# Слайд 154. Зачем нужны Custom Dimensions

## Заголовок

Event Parameter и Dimension — не одно и то же

## Текст

JavaScript отправляет:

```text
event parameter
```

Например:

```text
button_name = program
```

Custom Dimension позволяет использовать этот параметр как аналитический разрез.

Например:

**Какие CTA пользователи нажимают чаще?**

## Визуал

`button_name`

↓

Custom Dimension

↓

program — 57 clicks
portfolio — 22 clicks
community — 18 clicks

---

# Слайд 155. Теперь выберем важное событие

## Заголовок

Не все события одинаково важны

## Текст

Мы собираем:

```text
page_view
scroll
click
file_download
form_start
form_submit
cta_click
generate_lead
```

Но бизнес-ценность этих действий отличается.

Для учебного проекта наиболее важным действием считаем:

```text
generate_lead
```

## Визуал

Список событий.

`generate_lead` выделен.

---

# Слайд 156. Что такое Key Event

## Заголовок

Key Event = особенно важное событие

## Текст

Любое собираемое событие GA4 можно отметить как Key Event, если оно представляет важное для проекта действие.

Например:

заявка;

регистрация;

покупка;

оформление подписки.

В нашем случае:

```text
generate_lead
```

будет Key Event.

## Визуал

EVENT

↓

⭐

↓

KEY EVENT

---

# Слайд 157. Открываем Events

## Заголовок

Шаг 33. Admin → Events

## Текст

Откройте:

**Admin**

↓

**Data display**

↓

**Events**

Найдите среди полученных событий:

```text
generate_lead
```

## Скриншот

Admin → Events.

## Акцент

generate_lead.

---

# Слайд 158. Делаем событие ключевым

## Заголовок

Шаг 34. Mark as key event

## Текст

Напротив:

```text
generate_lead
```

отметьте событие как:

**Key Event**

В текущем интерфейсе это может отображаться как соответствующий переключатель или значок звезды.

После этого будущие срабатывания `generate_lead` будут учитываться как ключевые события.

## Скриншот

Events с отмеченным generate_lead.

---

# Слайд 159. Что мы сделали

## Заголовок

Event → Key Event

## Текст

До настройки:

```text
generate_lead
```

было обычным событием.

После настройки:

```text
generate_lead
```

становится одновременно:

Event

и

Key Event.

Код сайта при этом менять не требуется.

## Визуал

`generate_lead`

↓

MARK AS KEY

↓

⭐ generate_lead

---

# Слайд 160. Проверяем Key Event

## Заголовок

Шаг 35. Отправить ещё одну форму

## Текст

Вернитесь на Production-сайт.

Отправьте форму ещё раз.

Проверьте Realtime.

GA4 должен получить:

```text
generate_lead
```

Теперь это действие имеет статус важного для проекта.

## Скриншот

Realtime с generate_lead.

---

# Слайд 161. UTM + Key Event

## Заголовок

Вот зачем мы изучали UTM

## Текст

Теперь можем связать две части курса.

Пользователь приходит:

```text
utm_source = telegram
utm_medium = social
utm_campaign = ga4_lab
```

После этого отправляет форму:

```text
generate_lead
```

GA4 получает и источник пользователя, и важное действие.

## Визуал

TELEGRAM

↓

UTM

↓

WEBSITE

↓

generate_lead

↓

KEY EVENT

---

# Слайд 162. Теперь вопрос становится интереснее

## Заголовок

Не просто «сколько пришло»

## Текст

Раньше мы могли спросить:

**Сколько пользователей пришло из Telegram?**

Теперь можем спросить:

**Сколько пользователей из Telegram отправили заявку?**

И дальше:

**Какой источник приводит больше ключевых действий?**

## Визуал

Таблица:

Telegram
100 users
12 leads

VK
180 users
7 leads

Direct
50 users
9 leads

---

# Слайд 163. Событийная цепочка пользователя

## Заголовок

Один пользователь = последовательность событий

## Текст

Пример:

```text
session_start
↓
page_view
↓
scroll
↓
cta_click
↓
page_view
↓
form_start
↓
form_submit
↓
generate_lead
```

Это уже похоже на путь пользователя по продукту.

## Визуал

Вертикальная event timeline.

---

# Слайд 164. Из этой цепочки получится воронка

## Заголовок

Мы уже собираем данные для Funnel

## Текст

Можно выделить этапы:

Посетил сайт

↓

Нажал CTA

↓

Начал форму

↓

Отправил форму

↓

Получили lead

Следующий аналитический вопрос:

**На каком этапе пользователи уходят?**

## Визуал

Простая воронка.

1000 page_view

↓

300 cta_click

↓

120 form_start

↓

80 generate_lead

---

# Слайд 165. Что теперь есть в нашем проекте

## Заголовок

ga4-analytics-lab стал настоящим стендом

## Текст

Проект уже содержит данные для анализа:

```text
page_view
scroll
click
file_download
form_start
form_submit
generate_lead
cta_click
```

Также есть:

UTM;

Event Parameters;

Custom Dimensions;

Key Event;

Realtime;

DebugView.

## Визуал

Архитектура проекта с галочками.

---

# Слайд 166. Что студент должен сохранить

## Заголовок

Контрольные артефакты

## Текст

Сделайте скриншоты:

1. Enhanced Measurement;
2. `scroll` в Realtime;
3. `click` по внешней ссылке;
4. `file_download`;
5. `form_start`;
6. `form_submit`;
7. кода `generate_lead`;
8. `generate_lead` в Realtime;
9. кода `cta_click`;
10. параметров `cta_click` в DebugView;
11. параметра `lead_source`;
12. Custom Dimension `button_name`;
13. `generate_lead`, отмеченного как Key Event.

## Визуал

Checklist.

---

# Слайд 167. Что должен понимать студент

## Заголовок

Не просто повторить код

## Текст

После практики необходимо уметь объяснить:

что такое Event;

что такое Event Parameter;

чем Automatic Event отличается от Custom Event;

что делает Enhanced Measurement;

зачем существуют Recommended Events;

почему `generate_lead` лучше случайного названия;

зачем нужен DebugView;

что такое Custom Dimension;

что такое Key Event.

## Визуал

Concept map.

---

# Слайд 168. Полная схема

## Заголовок

От действия пользователя до аналитики

## Текст

```text
USER ACTION
↓
JAVASCRIPT / ENHANCED MEASUREMENT
↓
EVENT
↓
EVENT PARAMETERS
↓
GOOGLE TAG
↓
GA4
↓
REALTIME / DEBUGVIEW
↓
REPORTS
↓
KEY EVENTS
```

## Визуал

Сделать эту архитектуру на весь экран.

---

# Слайд 169. Что мы пока делаем вручную

## Заголовок

Есть один недостаток

## Текст

Чтобы отслеживать нашу CTA-кнопку, мы сделали:

```javascript
programCta.addEventListener('click', () => {
    gtag('event', 'cta_click', {
        button_name: 'program',
        page_section: 'hero'
    });
});
```

То есть разработчик изменял JavaScript сайта.

Но аналитикам и маркетологам не всегда удобно менять код для каждого нового события.

## Визуал

Marketing request

↓

Developer

↓

JavaScript

↓

Deploy

↓

Analytics

---

# Слайд 170. Следующий инструмент

## Заголовок

Google Tag Manager

## Текст

На следующем этапе мы попробуем настраивать события через:

**Google Tag Manager**

Разберём:

Container;

Tags;

Triggers;

Variables;

Preview Mode;

передачу событий в GA4.

И попробуем настроить событие клика без написания отдельного обработчика `addEventListener()` в коде сайта.

## Визуал

WEBSITE

↓

GTM

↓

GA4

Подпись:

**Следующая тема: Google Tag Manager**
