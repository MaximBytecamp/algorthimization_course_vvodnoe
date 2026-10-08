# Google Таблицы → CSV для CRM

Продолжаем актуальную тему 8. Работайте с учебной копией. Для воспроизводимого опыта импортируйте leads_clean-demo.csv в новый лист `leads_clean`, не заменяя рабочие leads.

Вход A:I: request_id, created_at, name, email, direction, utm_source, utm_medium, utm_campaign, status.
Три записи: строки 2–4. Имена в этом наборе состоят ровно из двух слов; сложные имена разберите вручную по согласованному правилу.

Создайте лист `crm_import`, вставьте заголовки в A1:L1 (разделитель — табуляция):

```text
first_name	last_name	email	deal_name	pipeline	request_id	direction	utm_source	utm_medium	utm_campaign	deal_stage	created_at
```

Формулы строки 2, затем протянуть по строку 4. Используются английские имена функций и разделитель аргументов `;`. В локали с `,` замените разделители аргументов, не содержимое строк.

| Ячейка | Формула |
|---|---|
| A2 | `=INDEX(SPLIT(TRIM(leads_clean!C2);" ");1;1)` |
| B2 | `=INDEX(SPLIT(TRIM(leads_clean!C2);" ");1;2)` |
| C2 | `=LOWER(TRIM(leads_clean!D2))` |
| D2 | `="Заявка "&leads_clean!A2` |
| E2 | `="Applications"` |
| F2 | `=leads_clean!A2` |
| G2 | `=leads_clean!E2` |
| H2 | `=leads_clean!F2` |
| I2 | `=leads_clean!G2` |
| J2 | `=leads_clean!H2` |
| K2 | `=SWITCH(leads_clean!I2;"new";"New application";"in_progress";"In progress";"done";"Done";"rejected";"Rejected";"CHECK STATUS")` |
| L2 | `=TEXT(leads_clean!B2;"yyyy-mm-dd hh:mm")` |

E должен точно совпасть с именем Pipeline. В G допустимы backend/frontend/data. В K не должно быть CHECK STATUS. Идентификаторы F непустые и уникальные; для 3 строк `=COUNTA(F2:F4)` и `=COUNTUNIQUE(F2:F4)` должны дать 3. Email заполнены.

## Дата — отдельная проверка

До TEXT проверьте `=ISNUMBER(leads_clean!B2)`: TRUE означает числовую дату. Файл комплекта содержит 2026-10-08 10:04, 10:12, 10:20 в Europe/Moscow. В настройках таблицы задайте этот пояс. Формат ячейки сам по себе не превращает текст в дату.

Если импортированный CSV оставил ровно такие 16-символьные строки текстом, используйте временную колонку с формулой:

```text
=DATE(VALUE(LEFT(B2;4));VALUE(MID(B2;6;2));VALUE(MID(B2;9;2)))+TIME(VALUE(MID(B2;12;2));VALUE(RIGHT(B2;2));0)
```

Она предназначена только для `YYYY-MM-DD HH:mm` комплекта. Проверьте результат, затем копируйте значения обратно в B учебного листа и убедитесь в ISNUMBER. Для ISO со смещением или иного формата нужен отдельный разбор; не удаляйте часовой пояс из реальной даты без преобразования.

Активируйте crm_import → Файл → Скачать → CSV текущего листа. Переименуйте в crm_import.csv, откройте в VS Code: UTF-8, 12 заголовков, три строки, значения вместо формул. В HubSpot выбирайте YMD и Europe/Moscow. При другом поясе отображения сверяйте один и тот же момент времени.

Для второго импорта используйте отдельный repeat_contact.csv. REQ-001 туда не копируем.
