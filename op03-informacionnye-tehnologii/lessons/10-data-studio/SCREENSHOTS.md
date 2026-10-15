# Тема 10 · часть 2 · DataLens · 112 кадров

Кадры сняты 14–15.10.2026 фоновым Chrome (CDP). Все промежуточные шаги — shots/steps с журналом steps.md (166 PNG). Слайд ссылается на номер шага в datalens.mjs; build.mjs копирует его в shots/<номер>-shot.png. Кадры с личными данными берутся из shots/edited (prep_shots.py).

| Экран | Номер | PNG | Шаг | Что на кадре |
|---|---|---|---|---|
| 2 | 607 | 607-shot.png | steps/002-lookerstudio-open.png (обработан) | lookerstudio.google.com из России: «Service Unavailable». |
| 10 | 615 | 615-shot.png | steps/007-ga4-explore-list.png | GA4 → Исследования: шаблон «Свободная форма». |
| 11 | 615a | 615a-shot.png | steps/008-ga4-freeform-new.png | Новое исследование «Свободная форма». |
| 12 | 616 | 616-shot.png | steps/009-ga4-name.png | Название исследования «DataLens · выгрузка GA4». |
| 13 | 617 | 617-shot.png | steps/017-ga4-dim-date.png | Импорт параметров: отмечена «Дата». |
| 14 | 617a | 617a-shot.png | steps/011-ga4-dim-source.png | Отмечен «Источник сеанса». |
| 15 | 617b | 617b-shot.png | steps/013-ga4-dim-campaign.png | Отмечена «Кампания, связанная с сеансом». |
| 16 | 618 | 618-shot.png | steps/016-ga4-metrics-pick.png | Импорт показателей: «Сеансы» и «Количество событий». |
| 17 | 619 | 619-shot.png | steps/018-ga4-rows.png | Строки: Дата, Источник сеанса, Кампания, Тип устройства. |
| 18 | 620 | 620-shot.png | steps/019-ga4-values.png | 500 строк, значения «Активные пользователи» и «Сеансы». |
| 19 | 621 | 621-shot.png | steps/020-ga4-traffic-table.png | Свободная форма: 4 параметра, Активные пользователи и Сеансы. |
| 20 | 622 | 622-shot.png | steps/021-ga4-export-menu.png | Меню «Экспортировать данные»: Google Таблицы, TSV, CSV, PDF. |
| 21 | 622a | 622a-shot.png | steps/022-sheets-import-confirm.png | Страница «Импорт документа». |
| 22 | 623 | 623-shot.png | steps/023-sheets-export-raw.png | Выгрузка GA4: служебные строки сверху, «Общий итог» под заголовками. |
| 23 | 624 | 624-shot.png | steps/024-sheets-del-total-menu.png | Строка «Общий итог» → «Удалить строку». |
| 24 | 624a | 624a-shot.png | steps/025-sheets-del-header-menu.png | Строки 1–6 выделены → «Удалить строки 1–6». |
| 25 | 625 | 625-shot.png | steps/026-sheets-headers.png | Заголовки заменены латинскими именами. |
| 26 | 625a | 625a-shot.png | steps/027-sheets-renamed.png | Таблица «GA4 для DataLens», лист ga4_traffic. |
| 27 | 626 | 626-shot.png | steps/028-ga4-tab-menu.png | Меню вкладки: «Создать копию». |
| 28 | 626a | 626a-shot.png | steps/030-ga4-filter-lead.png | Фильтр вкладки: Название события = generate_lead. |
| 29 | 627 | 627-shot.png | steps/031-ga4-lead-table.png | Вкладка generate_lead: 6 строк, всего 11 событий. |
| 30 | 628 | 628-shot.png | steps/032-sheets-ga4-leads.png | Лист ga4_leads без служебных строк и итога. |
| 32 | 630 | 630-shot.png | steps/033-datalens-landing.png | datalens.ru: кнопка «Начать в облаке». |
| 33 | 630a | 630a-shot.png | steps/034-datalens-org.png | Выбор организации. |
| 34 | 631 | 631-shot.png | steps/035-datalens-home.png | Главная страница DataLens. |
| 35 | 632 | 632-shot.png | steps/036-conn-types.png | Типы подключений: «Google Sheets» в разделе «Файлы и сервисы». |
| 36 | 632a | 632a-shot.png | steps/037-conn-gsheets-form.png | Форма Google Sheets: «Войти через Google». |
| 37 | 633 | 633-shot.png | steps/039-google-consent.png (обработан) | Google: DataLens запрашивает просмотр таблиц. Почта аккаунта скрыта. |
| 38 | 634 | 634-shot.png | steps/041-conn-after-google.png | Подключение: «Аутентификация пройдена». |
| 39 | 635 | 635-shot.png | steps/042-conn-link-leads.png | Ссылка на таблицу Leads в поле «Ссылка на файл». |
| 40 | 635a | 635a-shot.png | steps/044-conn-sheet-leads.png | «Добавить листы»: отмечен лист leads. |
| 41 | 636 | 636-shot.png | steps/045-conn-leads-preview.png (обработан) | Лист leads в подключении. name и email закрашены. |
| 42 | 637 | 637-shot.png | steps/047-conn-sheets-ga4.png | «Добавить листы»: ga4_traffic и ga4_leads. |
| 43 | 638 | 638-shot.png | steps/048-conn-ga4-preview.png | ga4_traffic: заголовки попали в данные. |
| 44 | 638a | 638a-shot.png | steps/049-conn-ga4-headers-yes.png | ga4_traffic: заголовки включены. |
| 45 | 639 | 639-shot.png | steps/054-conn-workbook-pick.png | Сохранение подключения: выбор воркбука. |
| 46 | 639a | 639a-shot.png | steps/057-conn-name.png | Название подключения. |
| 47 | 640 | 640-shot.png | steps/058-conn-saved.png (обработан) | Подключение в воркбуке «ОП03 Маркетинг и заявки». name и email закрашены. |
| 49 | 642 | 642-shot.png | steps/060-ds-new.png | Новый датасет: листы подключения слева. |
| 50 | 642a | 642a-shot.png | steps/061-ds-traffic-dropped.png | ga4_traffic в области датасета. |
| 51 | 643 | 643-shot.png | steps/062-ds-traffic-fields.png | Вкладка «Поля»: все поля строковые. |
| 52 | 644 | 644-shot.png | steps/063-ds-type-menu.png | Список типов данных. |
| 53 | 644a | 644a-shot.png | steps/065-ds-agg-menu.png | Список агрегаций. |
| 54 | 644b | 644b-shot.png | steps/066-ds-traffic-numbers.png | active_users и sessions — числа. |
| 55 | 645 | 645-shot.png | steps/068-ds-date-error.png | Поле с LEFT/MID/RIGHT: «датасет не прошёл валидацию». |
| 56 | 646 | 646-shot.png | steps/069-ds-date-parse.png | Поле «Дата» с формулой DATE_PARSE([date]). |
| 58 | 648 | 648-shot.png | steps/070-ds-field-source.png | Поле source. |
| 59 | 648a | 648a-shot.png | steps/071-ds-field-campaign.png | Поле campaign. |
| 60 | 649 | 649-shot.png | steps/072-ds-traffic-keys.png | Поля Дата, source, campaign и числа. |
| 61 | 650 | 650-shot.png | steps/076-ds-leadevents-fields.png | Датасет GA4 generate_lead. |
| 62 | 651 | 651-shot.png | steps/078-ds-leads-fields.png (обработан) | Поля листа leads. name и email в предпросмотре закрашены. |
| 63 | 652 | 652-shot.png | steps/079-ds-leads-hide-pii.png | name и email скрыты. |
| 64 | 653 | 653-shot.png | steps/080-ds-field-leadcount.png | Поле Lead Count. |
| 66 | 655 | 655-shot.png | steps/081-ds-field-donecount.png | Поле Done Count. |
| 68 | 657 | 657-shot.png | steps/082-ds-leads-fields-done.png | Датасет «Заявки»: поля и формулы. |
| 69 | 658 | 658-shot.png | steps/084-wiz-new.png | Новый чарт. |
| 70 | 658a | 658a-shot.png | steps/085-wiz-types.png | Список типов визуализации. |
| 71 | 659 | 659-shot.png | steps/087-wiz-indicator-sessions.png | Индикатор: сумма sessions = 92. |
| 73 | 661 | 661-shot.png | steps/088-wiz-field-rename.png | Настройки поля: название «Сеансы». |
| 74 | 661a | 661a-shot.png | steps/089-wiz-save-dialog.png | Сохранение чарта «Сеансы». |
| 75 | 662 | 662-shot.png | steps/091-wiz-indicator-users.png | Индикатор active_users: 70. |
| 77 | 664 | 664-shot.png | steps/092-wiz-indicator-leadevents.png | Индикатор GA4 Lead Events: 11. |
| 78 | 665 | 665-shot.png | steps/093-wiz-line-x.png | Линейная диаграмма: «Дата» в X. |
| 79 | 665a | 665a-shot.png | steps/096-wiz-line-renamed.png | Линии «Пользователи» и «Сеансы». |
| 80 | 666 | 666-shot.png | steps/100-wiz-table-sorted.png | Таблица «Источники и кампании». |
| 81 | 667 | 667-shot.png | steps/102-wiz-pie-device.png | Круговая диаграмма «Устройства». |
| 82 | 668 | 668-shot.png | steps/104-wiz-leadcount.png | Индикатор Actual Leads: 7. |
| 83 | 669 | 669-shot.png | steps/105-wiz-filter-new.png | Фильтр status: выбрано new. |
| 84 | 669a | 669a-shot.png | steps/107-wiz-save-as-menu.png | Меню «Сохранить как копию». |
| 85 | 670 | 670-shot.png | steps/108-wiz-filter-replace.png | Фильтр копии: new убран, выбран in_progress. |
| 86 | 670a | 670a-shot.png | steps/109-wiz-inprogress-card.png | Карточка «В обработке». |
| 87 | 671 | 671-shot.png | steps/110-wiz-done-card.png | Карточка Done через Done Count. |
| 88 | 672 | 672-shot.png | steps/112-wiz-status-bar-labels.png | Заявки по статусам. |
| 89 | 673 | 673-shot.png | steps/113-wiz-leads-table.png | Таблица заявок по source и campaign. |
| 90 | 674 | 674-shot.png | steps/114-wiz-leads-trend.png | Динамика заявок по дате создания. |
| 95 | 678 | 678-shot.png | steps/115-wiz-add-dataset.png | Список датасетов чарта: «Добавить датасет». |
| 96 | 678a | 678a-shot.png | steps/117-wiz-dataset-added.png | Датасет «Заявки» в чарте: значки связей. |
| 97 | 678b | 678b-shot.png | steps/119-wiz-three-datasets.png | Активный датасет — GA4 generate_lead: его поля в списке слева. |
| 98 | 679 | 679-shot.png | steps/120-wiz-links-auto.png | Связи, созданные автоматически. |
| 99 | 679a | 679a-shot.png | steps/121-wiz-link-edit.png | Окно связи: кнопка «Удалить». |
| 100 | 679b | 679b-shot.png | steps/122-wiz-links-clean.png | Связи по source, campaign и Дата. |
| 101 | 680 | 680-shot.png | steps/123-wiz-blend-table.png | Таблица из трёх датасетов. |
| 106 | 684 | 684-shot.png | steps/124-wiz-blend-renamed.png | Сводная таблица с подписями. |
| 108 | 686 | 686-shot.png | steps/125-workbook-list.png | Воркбук «ОП03 Маркетинг и заявки». |
| 109 | 686a | 686a-shot.png | steps/127-workbook-create-menu.png | Меню «Создать». |
| 110 | 687 | 687-shot.png | steps/128-dash-new.png | Новый дашборд. |
| 111 | 688 | 688-shot.png | steps/130-dash-chart-picked.png | Выбран чарт «Сеансы». |
| 112 | 688a | 688a-shot.png | steps/132-dash-page1-widgets.png | Виджеты одной колонкой. |
| 113 | 689 | 689-shot.png | steps/133-dash-save.png | Создание дашборда. |
| 114 | 690 | 690-shot.png | steps/134-dash-page1-layout.png | Раскладка вкладки Web Analytics. |
| 115 | 691 | 691-shot.png | steps/135-dash-selector-date.png | Селектор «Дата»: календарь с диапазоном. |
| 116 | 691a | 691a-shot.png | steps/136-dash-selector-source.png | Второй селектор группы: source. |
| 117 | 692 | 692-shot.png | steps/138-dash-selectors-pinned.png | Селекторы закреплены сверху. |
| 118 | 693 | 693-shot.png | steps/140-dash-tabs.png | Настройки → Вкладки: Web Analytics, Заявки, Маркетинг и заявки. |
| 119 | 694 | 694-shot.png | steps/141-dash-links-period.png | Связи селектора «Период». |
| 120 | 694a | 694a-shot.png | steps/142-dash-alias.png | Окно «Настройка алиасов» для виджета GA4 Lead Events. |
| 121 | 695 | 695-shot.png | steps/145-dash-tab2-layout.png | Раскладка вкладки «Заявки». |
| 122 | 696 | 696-shot.png | steps/146-dash-trap-status.png | «Новые» и «В обработке» показывают 7. |
| 123 | 696a | 696a-shot.png | steps/149-dash-status-unlink.png | Связи карточки «Новые»: «Статус» — «Не связаны». |
| 124 | 696b | 696b-shot.png | steps/150-dash-tab2-fixed.png | Вкладка «Заявки» после исправления. |
| 125 | 697 | 697-shot.png | steps/153-dash-tab3-view.png | Вкладка «Маркетинг и заявки». |
| 126 | 698 | 698-shot.png | steps/154-dash-tab1-view.png | Web Analytics в режиме просмотра. |
| 127 | 698a | 698a-shot.png | steps/155-dash-source-open.png | Список значений селектора «Источник». |
| 128 | 699 | 699-shot.png | steps/157-dash-trap-alias.png | Источник instagram, но GA4 Lead Events — 11. |
| 129 | 699a | 699a-shot.png | steps/158-dash-alias-source.png | Алиасы: Дата = Дата и source = source. |
| 130 | 699b | 699b-shot.png | steps/159-dash-source-instagram.png | Источник instagram: все виджеты пересчитаны. |
| 131 | 700 | 700-shot.png | steps/161-dash-period-pick.png | Выбран период 01.10–13.10.2026. |
| 132 | 700a | 700a-shot.png | steps/162-dash-period-applied.png | Период 01.10–13.10.2026 и источник instagram. |
| 133 | 701 | 701-shot.png | steps/163-dash-tab3-campaign.png | Кампания backend_guide на вкладке «Маркетинг и заявки». |
| 136 | 704 | 704-shot.png | steps/164-share-org.png (обработан) | «Поделиться»: права на воркбук. Имя и почта автора закрашены. |
| 137 | 704a | 704a-shot.png | steps/165-share-public.png | Вкладка «Публично». Публикация не создавалась. |
| 138 | 705 | 705-shot.png | steps/166-conn-credentials.png (обработан) | Подключение: «Аутентификация пройдена». name и email закрашены. |
