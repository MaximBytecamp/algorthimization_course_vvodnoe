# Практика 9 · Power Query: папка, Combine и Merge

Все имена и заявки вымышленные. Это отдельный учебный набор, не выгрузка персональных данных. В отличие от темы 8, в CSV нет email и объединённого source_medium: здесь восемь исходных полей, уже с отдельными utm_source и utm_medium. Короткие ID используются только в учебных CSV, их не отправляют в Apps Script темы 7.

## Перед началом

Распакуйте архив целиком. incoming содержит только три CSV за 23–25 сентября, каждый по три заявки. lookup, later, backup и result должны лежать рядом с incoming, не внутри: Folder Source может читать вложенные папки. Для маршрута нужен настольный Excel с Power Query Editor и From Folder (основные названия меню на слайдах — Excel Windows). Если вашей платформе недоступен этот источник, используйте подходящий учебный компьютер.

Создайте result/power_query_combined.xlsx. Книгу темы 8 не меняйте.

## Этап 1 · Собрать папку

1. Data → Get Data → From File → From Folder → выбрать incoming.
2. Transform Data → фильтр Extension = .csv; Folder Path — точный путь к incoming; при необходимости Name начинается с leads_. Не фильтруйте по фиксированным трём именам: новые файлы должны проходить отбор.
3. Content → Combine Files. Sample — файл за 23 сентября; UTF-8 / 65001; Comma. Не включать Skip files with errors. Если доступно — отключить автоматическое определение типов.
4. Основной запрос назвать leads_combined. Проверить заголовки и типы: created_at Date/Time, остальные Text. Сохранить Source.Name. Ожидаются 9 записей и 9 столбцов: 8 входных + имя файла.
5. Close & Load To → Table → New worksheet. Назвать лист leads_combined и сохранить книгу.
6. На шаге 386 скопировать later/leads_2026-09-26.csv в incoming. Refresh All → дождаться завершения. Ожидаются 12 строк. Это три новые заявки, а не повтор старого файла.

## Этап 2 · Источники

1. Импортировать lookup/sources_lookup.csv через From Text/CSV → Transform Data. Имя запроса sources_lookup; три столбца Text, четыре строки. Можно загрузить Only Create Connection.
2. На ключах leads_combined.utm_source и sources_lookup.source применить Text, Trim и lowercase. Ключи справочника должны быть уникальными и непустыми; source_name и channel_group заполнены. Fuzzy matching не включать.
3. Открыть leads_combined через Queries & Connections → Edit. Home → Merge Queries; слева leads_combined / utm_source, справа sources_lookup / source. Left Outer → OK.
4. Expand вложенного столбца → source_name, channel_group, без префикса → OK. Ожидаются те же 12 строк и 11 столбцов. REQ-108 / tiktok имеет два null.
5. Демонстрационный фильтр source_name = null после снимка отменить: удалить именно последний Filtered Rows. Проверить, что снова 12 строк.
6. Home → Merge Queries as New. Явно выбрать обе таблицы и ключи как выше, Join Kind = Left Anti. Назвать новый запрос unmatched_sources. Ожидается одна строка: REQ-108. Если есть вложенный правый столбец, удалить только его, не раскрывать.
7. Загрузить unmatched_sources отдельной таблицей на новый лист. Сохранить полный основной набор отдельно.
8. В текстовом редакторе дописать в lookup/sources_lookup.csv одну строку без нового заголовка:

```csv
tiktok,TikTok,social
```

9. Сохранить UTF-8, Excel → Refresh All. Основные строки: 12; у REQ-108 TikTok / social; unmatched_sources: 0. Ключ tiktok добавляется только один раз.

## Этап 3 · Статусы

1. Импортировать lookup/statuses_lookup.csv, имя запроса statuses_lookup.
2. Типы: status Text, status_order Whole Number, is_final True/False. На status в обоих запросах применить Trim и lowercase. Проверить четыре уникальных ключа.
3. leads_combined → Merge Queries → statuses_lookup по status, Left Outer.
4. Expand только status_order и is_final, без префикса. Проверить: 12 строк и 13 столбцов.
5. Close & Load → Refresh All → дождаться обновления → сохранить книгу. unmatched_sources пока пуст.

## Этап 4 · Повторение на новых данных

- На шаге 437 скопировать later/leads_2026-09-27.csv в incoming. В нём только REQ-120. Refresh: всего 13 строк; Email / email / 2 / false; отчёт пуст.
- На шаге 439a скопировать later/leads_2026-09-28.csv в incoming. В нём только REQ-121 / youtube / new. Refresh: всего 14 строк; source_name и channel_group null, status_order=1 и is_final=false. Отчёт содержит именно REQ-121.
- Не добавлять youtube в справочник до окончания этого опыта. Финальная проблема намеренно видима.

## Контроль результата

| Состояние | Основные строки | Отчёт несовпадений |
|---|---:|---|
| Три исходных CSV | 9 | Ещё не создан |
| Четвёртый CSV, source Merge и Anti | 12 | 1: REQ-108 / tiktok |
| Добавлен tiktok в lookup | 12 | 0 |
| Добавлен файл за 27 сентября | 13 | 0 |
| Добавлен файл за 28 сентября | 14 | 1: REQ-121 / youtube |

Число строк отчёта не прибавляется к основному набору: это его подмножество. При уникальных правых ключах Merge не меняет число основных строк. Повторы справа могут размножить заявки после Expand. Пустой отчёт проверяет только совпадения источников, не все аспекты качества.

## Сдача и повторение

Сохраните книгу, всю папку и контрольные кадры. При переносе измените пути к incoming и обоим справочникам через Data Source Settings. Helper queries не удаляйте. From Folder перечитывает текущее содержимое папки; он не ведёт отдельный архив исторических строк.

Для повторения опыта уберите из incoming только три добавленных файла за 26, 27, 28 сентября (оригиналы остаются в later), восстановите lookup/sources_lookup.csv из backup/sources_lookup_initial.csv и обновите книгу. Первые три исходных CSV сохраняйте.
