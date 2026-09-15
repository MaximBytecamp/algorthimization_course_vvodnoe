# Домашнее задание к теме 5

ОП.03 «Информационные технологии». Тема — **свой сайт, Vercel и Google Tag**.

## Что нужно получить

Опубликовать свою копию учебного сайта на Vercel, подключить её к учебному
Web Data Stream GA4 и доказать, что аналитика получает посещение и событие
`page_view`.

Рабочий сайт `bytecamp.ru` не изменяем. Используем только собственную копию
репозитория и собственный/учебный поток GA4.

## Что сдаётся

В рабочем репозитории создайте папку `lesson_05/` и положите в неё:

- `site.md` — отчёт по шаблону ниже;
- папку `screens/` с шестью скриншотами;
- при необходимости `notes.md` с кратким описанием ошибки и способом её исправления.

Работу отправьте в ветке `hw-05` и оформите Pull Request в свою ветку `main`.

## Порядок выполнения

1. Создайте личную копию шаблона `ga4-analytics-lab` через **Use this template**.
2. Откройте копию в VS Code и убедитесь, что в ней есть `index.html`,
   `about.html`, `contacts.html`, CSS и JavaScript.
3. Импортируйте репозиторий в Vercel. Для статического сайта выберите
   **Framework Preset → Other**, оставьте Build Command пустой, Root Directory —
   корень репозитория.
4. Выполните первый **Deploy**. Откройте полученный Production URL вида
   `https://ваш-проект.vercel.app`.
5. В GA4 откройте **Admin → Data streams**, выберите учебный Web Data Stream и
   замените Website URL на свой Production URL. Measurement ID не меняйте и не
   подставляйте чужой ID.
6. Получите код Google Tag в GA4 через **View tag instructions → Install
   manually** и вставьте его в `<head>` всех трёх HTML-страниц.
7. Сохраните изменения, сделайте commit с сообщением `Add GA4 Google tag` и
   отправьте его в GitHub. Убедитесь, что Vercel создал новый Production
   Deployment.
8. Откройте новую версию сайта, перейдите по двум-трём страницам и проверьте
   GA4: **Reports → Realtime**.

## Обязательные скриншоты

Снимайте PNG или JPG, масштаб браузера — 100%. На кадрах Vercel и сайта должен
быть виден адрес или название проекта. Личные email, аватар, токены и пароли в
кадр не попадают. Measurement ID показывать можно: это не секретный ключ.

| Файл | Что должно быть видно |
|---|---|
| `01-vercel-deployment.png` | Vercel Project/Deployments: статус **Ready**, ветка или commit и Production-домен `.vercel.app` |
| `02-site-production.png` | Сайт открыт по своему публичному `https://…vercel.app`, адресная строка видна |
| `03-ga4-stream.png` | GA4 Web Data Stream: новый Website URL и Measurement ID |
| `04-google-tag-code.png` | Код Google Tag, установленный в `<head>` одной из страниц, или экран проверки тега в GA4 |
| `05-ga4-realtime-user.png` | GA4 Realtime: появился как минимум один активный пользователь после открытия сайта |
| `06-ga4-page-view.png` | GA4 Realtime: событие `page_view` и посещённая страница |

Дополнительно можно приложить `07-ga4-pages.png` с двумя-тремя страницами
(`Home`, `About`, `Contacts`) в Realtime и `08-utm-url.png` с тестовой ссылкой,
если проверяли UTM из предыдущей темы.

## Шаблон `site.md`

Скопируйте этот блок в `lesson_05/site.md` и заполните своими значениями:

```md
# Тема 5 · Vercel и Google Tag

ФИО: ...
Группа: ...
Дата: ...

## Ссылки

- GitHub repository: https://github.com/...
- Vercel Production: https://....vercel.app
- GA4 Web Data Stream: настроен на Production URL выше
- Measurement ID: G-...

## Проверка

- Vercel Deployment: Ready / Production
- Google Tag установлен в `index.html`, `about.html`, `contacts.html`
- GA4 Realtime: активный пользователь — да/нет
- GA4 Realtime: `page_view` — да/нет
- Дополнительные страницы открыты: да/нет

## Скриншоты

1. `screens/01-vercel-deployment.png`
2. `screens/02-site-production.png`
3. `screens/03-ga4-stream.png`
4. `screens/04-google-tag-code.png`
5. `screens/05-ga4-realtime-user.png`
6. `screens/06-ga4-page-view.png`

## Краткий вывод

Сайт опубликован по адресу ... . После открытия страницы в GA4 Realtime
появились ... . Если была ошибка, я исправил(а) её так: ... .
```

## Если Realtime пустой

Проверьте цепочку по порядку: открыт ли новый Production URL; совпадает ли URL
в Web Data Stream; не перепутан ли Measurement ID; есть ли Google Tag во всех
трёх файлах и находится ли он внутри `<head>`; сохранён ли commit; завершился ли
новый Deployment статусом **Ready**; не блокирует ли браузер расширение
аналитику. После исправления откройте сайт в новой вкладке и подождите немного.

## Критерии оценки — 10 баллов

- 2 балла — личный GitHub-репозиторий и понятный отчёт;
- 2 балла — успешный Production Deployment на Vercel;
- 2 балла — Web Data Stream содержит правильный Vercel URL;
- 2 балла — Google Tag установлен на всех трёх HTML-страницах;
- 2 балла — в GA4 Realtime видны активный пользователь и `page_view`.

