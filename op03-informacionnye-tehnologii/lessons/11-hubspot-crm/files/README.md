# Тема 11 · HubSpot CRM

Учебный импорт вручную: Contact ↔ Deal → Pipeline → действия. Данные вымышлены, домен example.com; письма и звонки не нужны. Реальные UUID из формы нельзя сокращать до примеров REQ-001.

1. Откройте учебный HubSpot. Проверьте права на импорт/редактирование и настройку Pipeline/Properties. Нужно шесть свободных Custom Properties; Free ограничен 10 суммарно. Проверьте доступность в своём аккаунте.
2. Создайте Иван Тестов / ivan.test@example.com вручную. Запишите Contact Record ID.
3. Адаптируйте существующий пустой учебный Pipeline: имя Applications, стадии New application (10%), In progress (30%), Contacted (60%), Done (Won 100%), Rejected (Lost 0%). Не меняйте рабочий процесс компании. Если название другое — измените pipeline в обоих CSV.
4. Создайте шесть Deal Properties по карте: Request ID (Single-line text), Direction (Dropdown: backend/frontend/data), UTM Source / Medium / Campaign (Single-line text), Application Created At (Date and time picker). Внутренние имена запишите в property-map.csv. Стандартные Deal name, Pipeline, Deal stage не создавайте заново.
5. Подготовьте Google Sheets по sheets-preparation.md. Готовый crm_import.csv позволяет сверить результат: 12 полей, три строки. Время файла — Europe/Moscow. Исходный рабочий leads не заменяем.
6. Advanced import → Contacts + Deals → Single file. Contacts create/update по Email; Deals create new. Все 12 колонок должны быть mapped. YMD и Europe/Moscow на Details. Имя Lesson 11 — Applications Import v1. Запускаем один раз.
7. При чистом стенде результат — три Contacts, три Deals. Иван остаётся прежним Contact; новых Contacts два. Счётчик Updated может зависеть от изменения полей. Проверьте Record ID и Associations в обе стороны, исходное время, UTM, стадии.
8. Ошибки изучайте по строкам и свойствам. Deal мог уже создаться с ошибкой отдельного свойства. Найдите его до повтора. Для существующего Deal нужен update по Record ID; в новый create-файл включают только отсутствующие заявки. Полный CSV не перезагружают повторно ради скриншота.
9. REQ-001: New → In progress; назначьте себя владельцем; сохраните учебную Note и Task с исполнителем/сроком/связью; Contacted; отдельно завершите Task; Done. REQ-002: Rejected с учебной причиной в Note. Снимайте каждый этап до следующего действия.
10. Сохраните личный View: UTM Source=instagram AND UTM Campaign=backend_guide. Проверьте после повторного открытия.
11. Контрольный импорт repeat_contact.csv содержит только новую REQ-101. Contacts create/update, Deals create new; имя Lesson 11 — Repeat contact v2. Получаем три Contacts и четыре Deals всего, у Ивана — два Deals. Старую REQ-001 повторно не импортируем.
12. Заполните reconciliation.md и сделайте кадры по SCREENSHOTS.md. Смена стадии в CRM не меняет status Sheets или dashboard предыдущего урока: синхронизации пока нет.

Скриншоты: ../shots/<номер>-shot.png. После съёмки из папки урока выполните `node build.mjs`. Имена и позиции — ../shots/manifest.json. Никакие внешние настройки этот генератор не выполняет.
