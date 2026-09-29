# ОП.03 · Тема 9 · 67 кадров

Папка: op03-informacionnye-tehnologii/lessons/09-power-query-combine-merge/shots/

Снимать настоящие Excel / Power Query, Проводник и текстовый редактор. Согласовать ОС и версию Excel между кадрами, записать их в shots/evidence.json. Не заменять интерфейс рисованными картинками. Все данные в комплекте вымышленные.

Распаковать files/power-query-combine-lab.zip. Начать с трёх CSV в incoming (9 заявок). На шаге 386 скопировать из later файл за 26 сентября (12 строк). После создания Left Anti снять tiktok в отчёте; на шаге 421 дописать tiktok в исходный справочник (отчёт 0). На шаге 437 добавить файл за 27 сентября (13 строк), на шаге 439a — за 28 сентября (14 строк, youtube в отчёте). Будущие файлы и резервные копии нельзя держать внутри incoming.

Сохранять PNG по именам ниже. Буквенный суффикс — промежуточный шаг, нумерация исходника не меняется. После съёмки выполнить node build.mjs из папки темы, обновить evidence.json и проверить кадры в увеличении.

| Экран | Исходник | Файл | Что снять | Статус |
|---|---|---|---|---|
| 6 | 359 | 359-shot.png | Проводник или Explorer VS Code с этой структурой.  | pending |
| 7 | 359a | 359a-shot.png | Проводник: распакованная папка практики; incoming с тремя CSV, рядом lookup, later, backup и result.  | pending |
| 8 | 360 | 360-shot.png | CSV в VS Code.  | pending |
| 9 | 361 | 361-shot.png | Второй CSV.  | pending |
| 10 | 362 | 362-shot.png | Третий CSV. Строка с `tiktok`. | pending |
| 11 | 363 | 363-shot.png | Несколько CSV рядом: одинаковые восемь заголовков.  | pending |
| 13 | 364a | 364a-shot.png | Excel: меню Data → Get Data с командой From Folder. Записать ОС и версию Excel в evidence.json.  | pending |
| 14 | 365 | 365-shot.png | Excel → вкладка Data.  | pending |
| 15 | 366 | 366-shot.png | Меню Get Data. From Folder. | pending |
| 16 | 367 | 367-shot.png | Диалог выбора Folder.  | pending |
| 17 | 368 | 368-shot.png | Окно Folder Preview.  | pending |
| 19 | 370 | 370-shot.png | Folder Preview со списком файлов.  | pending |
| 21 | 372 | 372-shot.png | Folder Preview. Transform Data. | pending |
| 22 | 373 | 373-shot.png | Фильтр Extension.  | pending |
| 23 | 374 | 374-shot.png | Колонка Folder Path.  | pending |
| 24 | 374a | 374a-shot.png | Фильтры Folder Path и Name: путь incoming, имена начинаются с leads_; три нужных CSV.  | pending |
| 25 | 375 | 375-shot.png | Кнопка Combine Files возле Content.  | pending |
| 27 | 377 | 377-shot.png | Combine Files dialog.  | pending |
| 28 | 378 | 378-shot.png | Queries pane сразу после Combine.  | pending |
| 29 | 379 | 379-shot.png | Queries pane. Helper Queries. | pending |
| 31 | 381 | 381-shot.png | Query Settings → Name.  | pending |
| 32 | 381a | 381a-shot.png | leads_combined: Source.Name и восемь заголовков с типами; данные из трёх файлов.  | pending |
| 33 | 382 | 382-shot.png | Основной запрос после Combine: девять заявок, заголовки не попали в строки.  | pending |
| 34 | 383 | 383-shot.png | Колонка Source.Name.  | pending |
| 37 | 385a | 385a-shot.png | Close & Load To: Table и New worksheet; затем таблица leads_combined на 9 строк.  | pending |
| 38 | 386 | 386-shot.png | Папка с четырьмя CSV.  | pending |
| 39 | 387 | 387-shot.png | Refresh All.  | pending |
| 40 | 388 | 388-shot.png | `leads_combined` после Refresh.  | pending |
| 41 | 388a | 388a-shot.png | Queries & Connections: leads_combined → Edit; запрос после обновления.  | pending |
| 47 | 394 | 394-shot.png | `sources_lookup.csv` в VS Code.  | pending |
| 49 | 396 | 396-shot.png | Import sources_lookup.csv.  | pending |
| 50 | 397 | 397-shot.png | Power Query Editor со справочником.  | pending |
| 51 | 397a | 397a-shot.png | Оба ключевых столбца: utm_source и source имеют Text, шаги Trim и lowercase.  | pending |
| 52 | 397b | 397b-shot.png | sources_lookup целиком: четыре уникальных непустых source, у каждого заполнены source_name и channel_group.  | pending |
| 56 | 401 | 401-shot.png | Home → Merge Queries.  | pending |
| 57 | 402 | 402-shot.png | Merge dialog с выбранными столбцами.  | pending |
| 58 | 403 | 403-shot.png | Join Kind dropdown.  | pending |
| 62 | 407 | 407-shot.png | Результат Merge.  | pending |
| 63 | 408 | 408-shot.png | Столбец sources_lookup со значениями Table.  | pending |
| 64 | 409 | 409-shot.png | Expand dialog.  | pending |
| 65 | 410 | 410-shot.png | Expand dialog.  | pending |
| 66 | 410a | 410a-shot.png | leads_combined после Expand: 12 записей, два новых поля и сохранённый Source.Name.  | pending |
| 67 | 411 | 411-shot.png | Строка telegram после Expand: исходный ключ и две подписи справа.  | pending |
| 68 | 412 | 412-shot.png | Строка `tiktok` с `null`.  | pending |
| 70 | 414 | 414-shot.png | Фильтр по null.  | pending |
| 71 | 414a | 414a-shot.png | Applied Steps: удаляется только демонстрационный Filtered Rows; восстановлен полный набор из 12 заявок.  | pending |
| 73 | 416 | 416-shot.png | Merge Queries as New.  | pending |
| 75 | 418 | 418-shot.png | Merge dialog.  | pending |
| 76 | 419 | 419-shot.png | Query `unmatched_sources`.  | pending |
| 77 | 419a | 419a-shot.png | Excel: два листа leads_combined и unmatched_sources; в отчёте только REQ-108.  | pending |
| 80 | 421a | 421a-shot.png | lookup/sources_lookup.csv после сохранения: заголовок, пять строк, tiktok добавлен один раз.  | pending |
| 81 | 422 | 422-shot.png | REQ-108 после Refresh.  | pending |
| 82 | 423 | 423-shot.png | Пустой unmatched_sources.  | pending |
| 83 | 424 | 424-shot.png | CSV справочника статусов.  | pending |
| 86 | 427 | 427-shot.png | Query statuses_lookup.  | pending |
| 87 | 427a | 427a-shot.png | statuses_lookup: четыре строки; ABC у status, 123 у status_order, логический тип у is_final.  | pending |
| 88 | 428 | 428-shot.png | Merge dialog.  | pending |
| 89 | 429 | 429-shot.png | Результат Expand.  | pending |
| 90 | 429a | 429a-shot.png | Excel: leads_combined после двух Merge, поля статуса и 12 записей; отдельный лист отчёта.  | pending |
| 99 | 438 | 438-shot.png | Applied Steps итогового Query.  | pending |
| 100 | 439 | 439-shot.png | Строка после Refresh.  | pending |
| 101 | 439a | 439a-shot.png | incoming: добавлен leads_2026-09-28.csv; в редакторе его строка REQ-121 / youtube.  | pending |
| 102 | 440 | 440-shot.png | Входная строка youtube.  | pending |
| 103 | 441 | 441-shot.png | Основной dataset + unmatched_sources.  | pending |
| 109 | 447 | 447-shot.png | View → Query Dependencies.  | pending |
| 110 | 448 | 448-shot.png | Query Dependencies diagram.  | pending |
| 113 | 450a | 450a-shot.png | Сохранённая книга в result и структура всей папки для сдачи.  | pending |
