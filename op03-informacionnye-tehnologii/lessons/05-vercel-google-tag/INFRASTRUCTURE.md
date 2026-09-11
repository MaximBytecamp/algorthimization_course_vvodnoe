# Учебный стенд темы 5

## GitHub

- Шаблон: https://github.com/MaximBytecamp/ga4-analytics-lab
- Кнопка **Use this template** включена.
- Демонстрационная копия: https://github.com/MaximBytecamp/ga4-analytics-demo
- В обоих репозиториях ветка `main` и три страницы: `index.html`, `about.html`, `contacts.html`.
- Локальные копии: `op03-informacionnye-tehnologii/ga4-analytics-lab/` и `op03-informacionnye-tehnologii/ga4-analytics-demo/`. Это отдельные Git-репозитории, исключённые из репозитория курса.
- Шаблон содержит HTML/CSS/JavaScript и README. Сборка и зависимости не нужны.
- Форма демонстрационная: данные никуда не отправляются и не сохраняются.

## Vercel

Для публикации подготовлен репозиторий `MaximBytecamp/ga4-analytics-demo`.
Настройки: Framework Preset **Other**, Root Directory — корень, Build Command — пусто, Output Directory — **.**.
Проект создан и связан с GitHub. Первая публикация из `main` завершилась статусом **READY**.
Постоянный Production URL: https://ga4-analytics-demo.vercel.app/
ID проекта: `prj_03KL7xb5xoQlAcvRJLpPyGgOlCsc`.
Первый Deployment: `dpl_CjDsdxuGuysFSTh98WZoNHfTMwH3`.
Публичный адрес проверен без авторизации: HTTP 200. Google Tag на этом сайте не устанавливался — он остаётся примером состояния до шага 26 практики.

## Стенд для съёмки кадров

Практика пройдена целиком на отдельной копии, созданной из шаблона через **Use this template**. Демо-копия `ga4-analytics-demo` и её проект не использовались и не изменялись.

- Репозиторий: https://github.com/MaximBytecamp/ga4-analytics-lab-ivanov
- Сайт: https://ga4-analytics-lab-ivanov.vercel.app — Framework Preset **Other**, Root Directory — корень, Build Command — пусто
- Первый Deployment из `main` — **READY**, второй после коммита `Add GA4 Google tag` — **READY**, Production
- Локальная копия для съёмки: `/private/tmp/lab/ga4-analytics-lab-ivanov`

## GA4

Учебный поток обновлён под этот сайт. Прежние значения для отката: Stream name `ByteCamp Website`, Website URL `https://bytecamp.ru`.

- Stream name: **GA4 Analytics Lab**
- Website URL: **https://ga4-analytics-lab-ivanov.vercel.app**
- Stream ID: `15744428303`, Measurement ID: **G-2CNN55NJF7** — не менялся
- Google Tag установлен по одному разу на `index.html`, `about.html`, `contacts.html`
- Проверка из инструкции тега: «На вашем сайте обнаружен тег Google». Realtime получил `page_view` по всем трём страницам

Шаблон `ga4-analytics-lab` остаётся без тега. Рабочий ByteCamp не изменялся.

Источник и кампания из UTM в Realtime не отображаются: эти измерения вычисляются при обработке данных. Об этом добавлены три слайда после исходного 78, а после 77 — набор UTM-ссылок под разные каналы.

## Скриншоты

Все 43 кадра сняты и лежат в `shots/` под именами из `SCREENSHOTS.md`, привязанными к исходным номерам 20–88. SVG-заглушки сохранены как запасной вариант. Интерфейс GA4 на кадрах русскоязычный. Кадры 28 и 29 сняты в окне 1200×800 (2400×1600), остальные — в окнах около 1470×920.

## Проверка

Все три страницы проверены при ширине 1440 и 390 пикселей: переполнений нет, активный пункт навигации указан, форма работает, ошибок JavaScript нет. Презентация с настоящей ссылкой на шаблон ранее прошла проверку 207 состояний (69 экранов × 3 размера).

После съёмки: колода отдаёт 78 слайдов, все 43 PNG подставляются вместо заглушек, сломанных изображений и ошибок JavaScript нет. Прямые ссылки по исходным номерам и по всем дополнительным (`#24a` … `#78c`) работают, как и переходы из содержания и увеличение кадра.
