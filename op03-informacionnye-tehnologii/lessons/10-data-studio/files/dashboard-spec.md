# Data Studio · спецификация результата

## Ресурсы
- Автор:
- Report URL с ограниченным доступом:
- GA4 Property / ID:
- Google Sheets / worksheet:
- Названия Data sources:
- Период от / до:
- Часовой пояс GA4 и created_at:
- Дата/время обновления:

## Page 1 — Web Analytics
- Sessions:
- Active users:
- GA4 Lead Events: метрика Key events или Event count; фильтр:
- Time series: Date, Sessions, Active users:
- Source / Campaign / Content / Devices:
- Период и controls:
- Результат сброса cross-filter:

## Page 2 — Leads
- Lead Count: COUNT_DISTINCT(request_id):
- Actual Leads / New / In Progress / Done / Rejected:
- created_at: тип, часовой пояс, поле диапазона:
- Source / Campaign / Status controls:
- Проверка дублей, пустых ID и конфликтующих статусов:
- Динамика по дате создания:

## Page 3 — Marketing → Business
- GA4 Traffic: Dimensions; Metrics; период:
- Sheets Leads: Dimensions; Lead Count / Done Count; период:
- GA4 Lead Events: source/campaign; Event count; фильтр generate_lead; период:
- Два Join conditions:
- Left Outer, порядок таблиц:
- Контроль отсутствия умножения Sessions:
- Пары без совпадения справа (NULL):
- Пары Sheets без GA4, отсутствующие в Left Outer:
- Формула Actual Leads / Session и ручная сверка:
- Controls используют поля Blend:

## Доступ
- Кому разрешено открывать отчёт и с какой ролью:
- GA4 Data credentials:
- Sheets Data credentials:
- Проверка согласованным зрителем:
- Есть ли персональные данные в charts / экспорте / доступном источнике:
- Публичный доступ выключен:

## Итог
1. Наблюдение с периодом и единицами:
2. Расхождение GA4 и Sheets:
3. Что уже проверено: даты / ключи / фильтры / обновление / детализация:
4. Гипотеза:
5. Следующая проверка:
6. Ограничения данных и доступа:
7. Список приложенных кадров:

Числа примеров презентации не переносите сюда как реальные. Done обозначает текущий статус, не выручку и не число завершений по дате завершения.
