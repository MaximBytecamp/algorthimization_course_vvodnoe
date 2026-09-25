# Подключение существующего сайта

Таблица: https://docs.google.com/spreadsheets/d/1TFOS0FVQ8sfRwx7Az2jV67n0MGqCPZ-LUVXskLoWeIw/edit

Приёмник: https://script.google.com/macros/s/AKfycbySPuRZPch24mf03CenvwP2E8itXl9JGhTAgHUhKtEXcZJI1L-NgaT_v2uxa53sqt18/exec

Сайт: https://ga4-analytics-lab-ivanov.vercel.app
Репозиторий: https://github.com/MaximBytecamp/ga4-analytics-lab-ivanov

## Что сделано

Таблица `GA4 Analytics Lab — Leads` создана 24.09.2026 в аккаунте bytecampmm@gmail.com — том же, которому принадлежит ресурс GA4. Лист `leads`, A1:I1: request_id, created_at, name, email, direction, utm_source, utm_medium, utm_campaign, status. Первая строка закреплена, ширина столбцов подобрана по данным.

В столбце `status` настроен список `new` / `in_progress` / `done` / `rejected` с запретом ввода посторонних значений. По всей ширине строки подсвечивается заполненная строка с пропущенным обязательным полем (`=AND($A2<>"";COUNTBLANK($C2:$E2)>0)`), в столбце `request_id` — повторяющийся ID (`=AND($A2<>"";COUNTIF(A:A;$A2)>1)`). Правила заведены на весь лист; если строк станет больше, диапазоны нужно продлить.

`Code.gs` из этой папки вставлен в проект Apps Script `GA4 Analytics Lab — Leads Receiver` и опубликован как веб-приложение: запуск от имени владельца, доступ «Все», версия 1.

В сайте изменены два файла: `contacts.html` (форма с полями name, email, direction, четырьмя скрытыми полями и скрытым iframe для ответа) и `js/script.js` (подстановка UTM из адреса, генерация `request_id`, событие `generate_lead`). Google Tag `G-2CNN55NJF7` и `js/metrics.js` оставлены как были. Коммит `7e5fba6` «Add Google Sheets lead collection», Vercel собрал его в production.

## Что проверено на живых данных

Через форму сайта отправлены две заявки с вымышленными данными (`Иван Тестов`, `student@example.com`), обе записаны листом `leads`:

- без меток — utm_source `direct`, utm_medium `none`, utm_campaign `not_set`;
- по ссылке с `utm_source=telegram&utm_medium=social&utm_campaign=lesson07` — метки попали в свои столбцы.

Обе строки получили server-side `created_at` и `status` = `new`. Realtime ресурса GA4 показал два события `generate_lead` со страницы Contacts.

Отдельно проверены: отклонение недопустимого `status`, подсветка повторяющегося `request_id` (копия строки вставлена вручную и сразу удалена) и встроенная проверка браузера при пустом обязательном поле.

## Про прежнюю таблицу

В инструкции к теме была указана таблица `1xYN6sEDQG97efB8WeTHvRVWLN-xnVKMnRQVEupNIWNs`. Она создана под другим аккаунтом Google и из bytecampmm@gmail.com недоступна — Google отвечает «Нет доступа. Запросите доступ к файлу». Поэтому таблица создана заново, а ID в `Code.gs` обновлён. Универсальный скачиваемый пример в `../files/Code.gs` остаётся шаблоном для студентов: там ID подставляет сам студент.
