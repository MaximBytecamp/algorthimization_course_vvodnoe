# ОП.03 · Тема 8 · 54 кадров

Папка: op03-informacionnye-tehnologii/lessons/08-power-query-cleaning/shots/

Снимать реальные интерфейсы Excel / Power Query, текстового редактора и учебного Google Sheets. ОС и версия Excel должны быть согласованы между кадрами. Поля и названия команд должны читаться. Не заменять интерфейс рисованными макетами. Примеры только вымышленные.

Порядок: распаковать files/power-query-lab.zip; пройти слайды, сохранить кадры; заменить источник v2; Refresh и снять результат. Ошибки даты не удалять. Для демонстрации ошибки схемы использовать отдельную копию запроса и CSV.

Номера 264–353 сохранены. Суффикс a/b обозначает добавленный шаг. Сохранять файлы по точным именам. После добавления PNG выполнить node build.mjs и проверить увеличенный кадр в презентации. Описание фактической съёмки записать в shots/evidence.json.

| Экран | Исходник | Файл | Что снять | Статус |
|---|---|---|---|---|
| 10 | 272a | 272a-shot.png | Google Sheets: выбран лист leads, раскрыто Файл → Скачать, пункт CSV. Текущий лист и пункт CSV. | pending |
| 13 | 273a | 273a-shot.png | Проводник или Finder: распакованная lesson_power_query, папки data и result; в data видны три CSV.  | pending |
| 14 | 274 | 274-shot.png | Исходный leads_dirty.csv в текстовом редакторе: заголовок и пять строк; видны wrong_date, TG и пробелы.  | pending |
| 15 | 275 | 275-shot.png | Тот же CSV крупно: выделены проблемы формата, структуры и даты.  | pending |
| 18 | 277a | 277a-shot.png | Excel: вкладка Данные и доступная команда получения данных / Power Query; зафиксировать ОС и версию в evidence.json.  | pending |
| 19 | 278 | 278-shot.png | Пустая книга Excel.  | pending |
| 20 | 279 | 279-shot.png | Excel Ribbon → Data. Get & Transform Data. | pending |
| 21 | 280 | 280-shot.png | Раскрытое меню Get Data. From Text/CSV. | pending |
| 22 | 281 | 281-shot.png | Диалог выбора файла. `leads_dirty.csv`. | pending |
| 23 | 282 | 282-shot.png | Окно Text/CSV preview.  | pending |
| 24 | 282a | 282a-shot.png | Окно импорта: UTF-8, Comma и список Data Type Detection, если доступен в установленной версии.  | pending |
| 26 | 284 | 284-shot.png | Preview CSV. Transform Data. | pending |
| 27 | 285 | 285-shot.png | Power Query Editor целиком. Пять подписей поверх интерфейса. | pending |
| 28 | 285a | 285a-shot.png | Power Query: имена восьми столбцов и пять записей; при необходимости команда Use First Row as Headers.  | pending |
| 29 | 286 | 286-shot.png | Левая панель Queries.  | pending |
| 30 | 287 | 287-shot.png | Таблица Power Query.  | pending |
| 31 | 288 | 288-shot.png | Query Settings. Applied Steps. | pending |
| 33 | 290 | 290-shot.png | Applied Steps с выбранным Source.  | pending |
| 35 | 292 | 292-shot.png | Query Settings → Name.  | pending |
| 36 | 293 | 293-shot.png | Значок типа данных в заголовке столбца.  | pending |
| 38 | 295 | 295-shot.png | Applied Steps → Changed Type.  | pending |
| 39 | 296 | 296-shot.png | Заголовки восьми столбцов Power Query со значками назначенных типов.  | pending |
| 40 | 296a | 296a-shot.png | Выделенные текстовые столбцы и меню Data Type → Text.  | pending |
| 41 | 297 | 297-shot.png | Меню типов данных. Date/Time. | pending |
| 42 | 298 | 298-shot.png | Ячейка Error в created_at.  | pending |
| 44 | 300 | 300-shot.png | Error details в Power Query.  | pending |
| 46 | 302 | 302-shot.png | Transform → Format → Trim.  | pending |
| 48 | 303a | 303a-shot.png | Replace Values для name: два пробела заменяются одним. Рядом результат Иван Тестов. В подписи пояснить невидимые символы: 2 пробела → 1 пробел. | pending |
| 49 | 304 | 304-shot.png | Transform → Format → Clean.  | pending |
| 52 | 307 | 307-shot.png | Split Column menu.  | pending |
| 53 | 308 | 308-shot.png | Split Column by Delimiter dialog.  | pending |
| 54 | 309 | 309-shot.png | Два новых столбца.  | pending |
| 55 | 310 | 310-shot.png | Rename column.  | pending |
| 56 | 311 | 311-shot.png | Applied Steps.  | pending |
| 57 | 312 | 312-shot.png | Два выделенных столбца + Trim.  | pending |
| 58 | 312a | 312a-shot.png | Выделены utm_campaign и status, раскрыта команда Trim.  | pending |
| 59 | 313 | 313-shot.png | Transform → Format → lowercase.  | pending |
| 62 | 316 | 316-shot.png | Replace Values dialog.  | pending |
| 64 | 318 | 318-shot.png | Отфильтрованные уникальные status.  | pending |
| 65 | 319 | 319-shot.png | Filter dropdown status.  | pending |
| 70 | 324 | 324-shot.png | Formula Bar Power Query.  | pending |
| 71 | 325 | 325-shot.png | CSV рядом с очищенным Power Query preview.  | pending |
| 72 | 326 | 326-shot.png | Home → Close & Load.  | pending |
| 73 | 327 | 327-shot.png | Excel с загруженной таблицей.  | pending |
| 74 | 328 | 328-shot.png | Вкладка листа `leads_clean`.  | pending |
| 76 | 330 | 330-shot.png | leads_dirty_v2.csv в текстовом редакторе: новые строки REQ-006…REQ-008.  | pending |
| 77 | 330a | 330a-shot.png | Папка data: рабочий leads_dirty.csv, резервная v1 и файл leads_dirty_v2.csv.  | pending |
| 78 | 331 | 331-shot.png | Два файла в редакторе перед заменой: источник leads_dirty.csv и версия leads_dirty_v2.csv.  | pending |
| 79 | 331a | 331a-shot.png | Текстовый редактор: рабочий leads_dirty.csv после замены, видны REQ-006…REQ-008.  | pending |
| 81 | 333 | 333-shot.png | Excel → Data → Refresh All.  | pending |
| 84 | 336 | 336-shot.png | Новая строка после Refresh.  | pending |
| 85 | 337 | 337-shot.png | Applied Steps после Refresh.  | pending |
| 86 | 337a | 337a-shot.png | Excel: результат после Refresh и сохранение книги result/power_query_leads.xlsx.  | pending |
| 90 | 341 | 341-shot.png | Диагностика на отдельной копии запроса: первый ошибочный шаг и предыдущий рабочий шаг. Рабочий источник не портить.  | pending |
