# Тема 11 · HubSpot CRM · 97 кадров

## Задание для Claude

Открой op03-informacionnye-tehnologii/lessons/11-hubspot-crm/index.html и выполняй шаги последовательно. Сохраняй настоящие PNG в op03-informacionnye-tehnologii/lessons/11-hubspot-crm/shots/ по именам таблицы. «Экран» — позиция, «исходник» — постоянный номер слайда; ссылка index.html#735 или #818a. Соседние кадры могут показывать разные части одного экрана, но подписи и значения должны читаться.

До съёмки прочитай files/README.md, sheets-preparation.md и reconciliation.md. Работай в учебном аккаунте с вымышленными example.com. Не имитируй интерфейс и успешные результаты. Если шаг недоступен, сними реальное состояние и запиши причину. Регистрацию и подтверждение входа выполняет владелец аккаунта; пароли/коды не включай в кадр.

Порядок: Account → Contact → один существующий учебный Pipeline Applications → пять стадий → шесть Deal Properties → Google Sheets → CSV → Advanced import Contacts + Deals → mapping → проверка → Stage/Note/Task → Saved View → новая заявка прежнего Contact.

Первый файл crm_import.csv содержит REQ-001/002/003. Иван уже создан вручную. Contacts сопоставляй по Email; Deals создавай новыми. В mapping обязательно включи pipeline → Deal → Pipeline, created_at → Application Created At. Формат YMD, часовой пояс Europe/Moscow для файлов комплекта. Request ID — обычное текстовое поле, оно не предотвращает дубли при повторном Create new.

Не загружай полный файл снова ради кадра. При ошибках сначала сверь созданные Deal и Record ID; исправление созданных — через update, создание — только отсутствующих. На слайде 863 используй отдельный repeat_contact.csv с одной строкой REQ-101. После него один Contact Ивана связан с двумя Deals. Не отправляй письма, не подключай рассылки и не приглашай пользователей ради снимков. Notes явно помечены как учебная имитация.

Снимай состояния в момент шага: начальная доска — до переноса, Done/Rejected — после. Смена Stage не обновляет Sheets и не завершает Task. Права рабочего аккаунта и рабочий Pipeline не меняй. Если есть реальные данные, используй учебный стенд и не включай их в кадр.

Рекомендуемый размер — от 1600×1000, читаемый масштаб. Если нужны два состояния, допустим составной кадр без изменения данных. В evidence.json укажи время, имя PNG, объект/URL без секретов, фактическое состояние. После добавления кадров: node build.mjs, проверить manifest и увеличение каждого PNG.

| Экран | Исходник | Имя PNG | Что снять | Статус |
|---|---|---|---|---|
| 21 | 754a | 754a-shot.png | Учебный аккаунт и таблица до начала работы; исходное число записей.  | pending |
| 22 | 755 | 755-shot.png | Стартовая страница HubSpot CRM.  | pending |
| 23 | 755a | 755a-shot.png | Домашний экран после входа и название учебного аккаунта, без данных входа.  | pending |
| 25 | 756a | 756a-shot.png | Settings → Properties: объект Deal и доступность Create property; видимый лимит, если показан.  | pending |
| 26 | 757 | 757-shot.png | Актуальное левое меню HubSpot.  | pending |
| 27 | 758 | 758-shot.png | Contacts Index.  | pending |
| 28 | 759 | 759-shot.png | Contacts → Table View.  | pending |
| 29 | 760 | 760-shot.png | Create Contact panel.  | pending |
| 30 | 760a | 760a-shot.png | Созданный Contact с email и Record ID; одна запись в результатах поиска.  | pending |
| 31 | 761 | 761-shot.png | Contact Record.  | pending |
| 32 | 762 | 762-shot.png | Activity timeline.  | pending |
| 33 | 763 | 763-shot.png | Deals Index.  | pending |
| 34 | 764 | 764-shot.png | Deal Board.  | pending |
| 35 | 765 | 765-shot.png | Default Sales Pipeline.  | pending |
| 36 | 766 | 766-shot.png | Deal Pipeline Settings.  | pending |
| 37 | 766a | 766a-shot.png | Pipeline selector и сохранённое название Applications либо фактическое имя.  | pending |
| 40 | 768a | 768a-shot.png | Три открытые стадии в редакторе Pipeline с условными вероятностями.  | pending |
| 43 | 770a | 770a-shot.png | Done с Won и Rejected с Lost в настройках стадий.  | pending |
| 45 | 772 | 772-shot.png | Pipeline Settings после настройки.  | pending |
| 46 | 772a | 772a-shot.png | Пустая учебная доска: Applications и пять заданных колонок.  | pending |
| 48 | 774 | 774-shot.png | Properties Settings.  | pending |
| 49 | 775 | 775-shot.png | Create Property panel.  | pending |
| 50 | 775a | 775a-shot.png | Request ID после сохранения: объект Deal, тип и internal name.  | pending |
| 52 | 777 | 777-shot.png | Dropdown Property.  | pending |
| 53 | 777a | 777a-shot.png | Direction после сохранения с тремя вариантами и внутренними значениями.  | pending |
| 55 | 779 | 779-shot.png | UTM Source Property.  | pending |
| 56 | 780 | 780-shot.png | Property.  | pending |
| 57 | 781 | 781-shot.png | Property.  | pending |
| 58 | 782 | 782-shot.png | Создание Deal Property Application Created At типа Date and time picker.  | pending |
| 59 | 782a | 782a-shot.png | Созданная Application Created At: Date and time picker; выбранный часовой пояс пользователя.  | pending |
| 62 | 784a | 784a-shot.png | Список шести Deal Properties с типами.  | pending |
| 64 | 785a | 785a-shot.png | Google Sheets: leads_clean и новый crm_import с 12 заголовками.  | pending |
| 67 | 788 | 788-shot.png | Google Sheets: crm_import!A2, формула first_name и три результата.  | pending |
| 68 | 789 | 789-shot.png | Google Sheets: first_name и last_name заполнены для трёх учебных строк.  | pending |
| 69 | 790 | 790-shot.png | Google Sheets crm_import: формула deal_name и результат Заявка REQ-001.  | pending |
| 70 | 790a | 790a-shot.png | Столбец pipeline = Applications рядом с deal_name; такое же название в HubSpot.  | pending |
| 72 | 792 | 792-shot.png | Google Sheets: формула status → deal_stage и соответствующие значения.  | pending |
| 73 | 792a | 792a-shot.png | Столбец deal_stage и проверка отсутствия CHECK STATUS.  | pending |
| 75 | 794 | 794-shot.png | Google Sheets crm_import: все 12 заголовков и три проверенные строки.  | pending |
| 76 | 794a | 794a-shot.png | Все 12 столбцов crm_import, три строки, исходные ID и время.  | pending |
| 77 | 794b | 794b-shot.png | Google Sheets: шесть перенесённых полей и формула выбранной ячейки.  | pending |
| 78 | 794c | 794c-shot.png | ISNUMBER для исходной даты и TEXT в L2 с результатом.  | pending |
| 82 | 798 | 798-shot.png | Deal Properties: Request ID как обычное Single-line text; уникальность не настроена.  | pending |
| 84 | 799 | 799-shot.png | CSV в VS Code.  | pending |
| 85 | 799a | 799a-shot.png | Google Sheets: активный crm_import и команда скачивания CSV.  | pending |
| 86 | 800 | 800-shot.png | Файл в VS Code.  | pending |
| 88 | 802 | 802-shot.png | Import Data.  | pending |
| 89 | 803 | 803-shot.png | Import options.  | pending |
| 90 | 804 | 804-shot.png | Object selector.  | pending |
| 91 | 805 | 805-shot.png | Single file selection.  | pending |
| 92 | 806 | 806-shot.png | Choose how to import Contacts.  | pending |
| 93 | 807 | 807-shot.png | Choose how to import Deals.  | pending |
| 94 | 807a | 807a-shot.png | Выбранные режимы Contacts create/update и Deals create new; три исходные строки.  | pending |
| 95 | 808 | 808-shot.png | File upload.  | pending |
| 96 | 809 | 809-shot.png | Mapping Screen целиком.  | pending |
| 97 | 810 | 810-shot.png | Mapping row.  | pending |
| 98 | 811 | 811-shot.png | Mapping.  | pending |
| 99 | 812 | 812-shot.png | Email mapping. Unique identifier. | pending |
| 100 | 813 | 813-shot.png | Deal Name mapping.  | pending |
| 101 | 814 | 814-shot.png | Request ID mapping.  | pending |
| 102 | 815 | 815-shot.png | Direction mapping.  | pending |
| 103 | 816 | 816-shot.png | Три строки mapping.  | pending |
| 104 | 817 | 817-shot.png | Date mapping.  | pending |
| 105 | 818 | 818-shot.png | Deal Stage mapping.  | pending |
| 106 | 818a | 818a-shot.png | Mapping pipeline → Deal → Pipeline и preview Applications.  | pending |
| 107 | 819 | 819-shot.png | Mapping: поля Contact и Deal из одной строки файла перед запуском импорта.  | pending |
| 109 | 821 | 821-shot.png | Полный Mapping Screen.  | pending |
| 110 | 822 | 822-shot.png | Import name.  | pending |
| 111 | 822a | 822a-shot.png | Details импорта: формат YMD и Time zone для Application Created At.  | pending |
| 113 | 824 | 824-shot.png | Import status.  | pending |
| 114 | 825 | 825-shot.png | Import Result.  | pending |
| 115 | 825a | 825a-shot.png | Итог импорта по объектам, ссылка на записи и число ошибок.  | pending |
| 117 | 826a | 826a-shot.png | Файл ошибки и проверка соответствующего Deal; причина и выбранный способ исправления.  | pending |
| 118 | 827 | 827-shot.png | Contacts Table.  | pending |
| 119 | 828 | 828-shot.png | Deals Table.  | pending |
| 120 | 829 | 829-shot.png | Deal Record + Associated Contact.  | pending |
| 121 | 830 | 830-shot.png | Contact Record + Deal Association.  | pending |
| 122 | 831 | 831-shot.png | Deal Properties.  | pending |
| 123 | 831a | 831a-shot.png | Две даты в Deal и значения исходного CSV.  | pending |
| 125 | 833 | 833-shot.png | Deals Board.  | pending |
| 126 | 834 | 834-shot.png | Board после импорта.  | pending |
| 127 | 835 | 835-shot.png | Drag & Drop Deal.  | pending |
| 128 | 835a | 835a-shot.png | Deal после перезагрузки с In progress; исходный status в Sheets без изменения.  | pending |
| 130 | 837 | 837-shot.png | Add Note.  | pending |
| 131 | 837a | 837a-shot.png | Сохранённая учебная Note в timeline REQ-001 с ассоциацией.  | pending |
| 133 | 839 | 839-shot.png | Create Task panel.  | pending |
| 134 | 839a | 839a-shot.png | Сохранённая задача: assignee, срок, associated Deal; Deal owner в карточке.  | pending |
| 136 | 841 | 841-shot.png | Board с Deal в Contacted.  | pending |
| 137 | 841a | 841a-shot.png | Task со статусом Completed в связанной заявке.  | pending |
| 138 | 842 | 842-shot.png | Deal в Done.  | pending |
| 140 | 843a | 843a-shot.png | REQ-002 в Rejected с причиной в Note; REQ-001 остаётся Done.  | pending |
| 143 | 846 | 846-shot.png | Filter configuration.  | pending |
| 144 | 847 | 847-shot.png | Filtered Deals.  | pending |
| 145 | 848 | 848-shot.png | Save View.  | pending |
| 146 | 848a | 848a-shot.png | Повторно открытый Saved View с двумя условиями AND.  | pending |
| 162 | 863a | 863a-shot.png | Второй импорт: одна новая Deal; карточка Ивана со связанными REQ-001 и REQ-101.  | pending |
| 164 | 865 | 865-shot.png | Deal Properties.  | pending |
