# Тема 11 · Data Studio · 91 кадров

## Инструкция для Claude

Сними настоящие экраны Data Studio, GA4 и Google Sheets по порядку презентации. Папка: op03-informacionnye-tehnologii/lessons/11-data-studio/shots/. PNG — по точным именам таблицы. «Экран» — позиция в колоде; «исходник» — постоянный номер. Прямая ссылка: index.html#606, index.html#688a и т. д.

Сначала прочитай files/README.md, formulas.md и dashboard-spec.md. Используй существующие GA4 Property и leads из предыдущих тем. Перед началом зафиксируй период, часовой пояс и исходные числа. Не заменяй реальные показатели числами примеров. Если нет данных/прав — сними фактическое состояние и укажи причину.

Построй три страницы по презентации: GA4, Sheets, затем Blend. У каждого компонента сверяй источник, поле даты и фильтры. Event name=generate_lead относится к отдельной карточке либо третьей таблице Blend, не ко всему трафику. После копирования status-карточек удаляй старый фильтр. Все периоды согласованы.

Blend: таблица GA4 Traffic слева; Sheets Leads справа; позднее третья таблица того же GA4 с Event count и фильтром generate_lead. Два ключа source/campaign, Left Outer. Date и created_at — для отбора периода. Не добавляй request_id/status/device в Dimensions агрегатов. Проверяй NULL, несовпавшие правые записи и отсутствие умножения Sessions. Done Count — условный подсчёт ID, а не status в ключах.

На кадрах не показывай чужие name/email, пароли или токены. Съёмка Share не требует отправлять приглашения; не открывай публичный доступ. Изменения источников и прав делай только в согласованном ресурсе. Для проверки зрителем используй разрешённый тестовый аккаунт. Wireframe и модель JOIN в презентации — схемы, не скриншоты.

Снимай читаемые PNG, желательно от 1600×1000. Если шаг требует два состояния, допустим составной PNG без изменения данных. В shots/evidence.json запиши время, интерфейс, URL/объект без секретов, имя файла и фактический результат. После съёмки выполни node build.mjs, проверь каждый кадр в увеличении и статус manifest.

| Экран | Исходник | PNG | Что снять | Статус |
|---|---|---|---|---|
| 10 | 614a | 614a-shot.png | GA4 и Sheets: один период, исходные показатели; заполненная шапка спецификации.  | pending |
| 11 | 615 | 615-shot.png | Главная страница Data Studio.  | pending |
| 12 | 616 | 616-shot.png | Create → Report.  | pending |
| 13 | 617 | 617-shot.png | Панель connectors. Google Analytics. | pending |
| 14 | 618 | 618-shot.png | Authorization screen.  | pending |
| 15 | 619 | 619-shot.png | Список GA4 Properties.  | pending |
| 16 | 620 | 620-shot.png | Add to report.  | pending |
| 17 | 620a | 620a-shot.png | Список источников отчёта и GA4 fields с названием GA4 · Funnel.  | pending |
| 18 | 621 | 621-shot.png | Весь интерфейс Data Studio.  Подписать основные области.  | pending |
| 20 | 623 | 623-shot.png | Название отчёта сверху.  | pending |
| 21 | 624 | 624-shot.png | Page → Manage pages.  | pending |
| 22 | 625 | 625-shot.png | Макет Page 1 в редакторе: верхние KPI, controls, место для динамики и таблиц.  | pending |
| 25 | 627 | 627-shot.png | Scorecard + Properties.  | pending |
| 26 | 628 | 628-shot.png | Две карточки.  | pending |
| 27 | 629 | 629-shot.png | Key Events Scorecard.  | pending |
| 28 | 630 | 630-shot.png | Filter configuration.  | pending |
| 29 | 630a | 630a-shot.png | Карточка generate_lead с фильтром; рядом Sessions без него.  | pending |
| 30 | 631 | 631-shot.png | Подпись GA4 Lead Events на карточке и её выбранная метрика.  | pending |
| 31 | 632 | 632-shot.png | Date Range Control.  | pending |
| 32 | 632a | 632a-shot.png | Date range control и настройки Auto у карточки; два состояния периода.  | pending |
| 34 | 634 | 634-shot.png | Time Series chart.  | pending |
| 35 | 635 | 635-shot.png | Time Series с двумя линиями.  | pending |
| 37 | 637 | 637-shot.png | Table.  | pending |
| 39 | 639 | 639-shot.png | Campaign table.  | pending |
| 40 | 640 | 640-shot.png | Content table.  | pending |
| 42 | 642 | 642-shot.png | Device chart.  | pending |
| 43 | 643 | 643-shot.png | Drop-down control.  | pending |
| 44 | 644 | 644-shot.png | Campaign Drop-down.  | pending |
| 46 | 646 | 646-shot.png | Chart interactions → Cross-filtering.  | pending |
| 47 | 647 | 647-shot.png | Dashboard после cross-filter.  | pending |
| 48 | 647a | 647a-shot.png | Page 1 после сброса: controls без выбранных категорий и исходные KPI.  | pending |
| 49 | 648 | 648-shot.png | Page 1 целиком в View с периодом и фильтрами.  | pending |
| 51 | 650 | 650-shot.png | Manage pages.  | pending |
| 52 | 651 | 651-shot.png | Google Sheets leads: структура из девяти полей; name/email скрыты.  | pending |
| 53 | 651a | 651a-shot.png | Лист leads: девять заголовков, даты, идентификаторы и статусы; скрыть имя/email.  | pending |
| 56 | 654 | 654-shot.png | Google Sheets connector.  | pending |
| 57 | 655 | 655-shot.png | Spreadsheet + Worksheet picker.  | pending |
| 58 | 656 | 656-shot.png | Connector options.  | pending |
| 59 | 657 | 657-shot.png | Data source fields.  | pending |
| 60 | 657a | 657a-shot.png | Редактор поля даты: исходное значение, выбранный тип либо формула разбора и результат.  | pending |
| 62 | 659 | 659-shot.png | Create field.  | pending |
| 63 | 659a | 659a-shot.png | Редактор вычисляемого Lead Count и поле после сохранения.  | pending |
| 65 | 661 | 661-shot.png | Scorecard.  | pending |
| 66 | 661a | 661a-shot.png | Page 2: control периода и created_at в Date range dimension карточки.  | pending |
| 67 | 662 | 662-shot.png | Filtered scorecard.  | pending |
| 68 | 663 | 663-shot.png | New scorecard.  | pending |
| 69 | 664 | 664-shot.png | 4 Scorecards.  | pending |
| 70 | 664a | 664a-shot.png | Четыре карточки и их разные status-фильтры; Actual Leads без фильтра статуса.  | pending |
| 71 | 665 | 665-shot.png | Status chart.  | pending |
| 73 | 667 | 667-shot.png | Leads by Source.  | pending |
| 74 | 668 | 668-shot.png | Campaign leads table.  | pending |
| 75 | 669 | 669-shot.png | Lead trend.  | pending |
| 76 | 670 | 670-shot.png | Data Source → field type.  | pending |
| 77 | 671 | 671-shot.png | Status control.  | pending |
| 78 | 672 | 672-shot.png | utm_source filter.  | pending |
| 79 | 672a | 672a-shot.png | Page 2: source и campaign controls с двумя выбранными условиями.  | pending |
| 80 | 673 | 673-shot.png | Page 2 целиком в View: Actual Leads, статусы, динамика и controls.  | pending |
| 86 | 678a | 678a-shot.png | Две контрольные таблицы с source/campaign; совпадающие и несовпадающие пары видны.  | pending |
| 87 | 679 | 679-shot.png | Pages.  | pending |
| 88 | 680 | 680-shot.png | Manage blends.  | pending |
| 89 | 681 | 681-shot.png | Blend editor → GA4 table.  | pending |
| 90 | 682 | 682-shot.png | Blend editor → Sheets.  | pending |
| 91 | 682a | 682a-shot.png | Blend editor: Date / created_at как поля диапазона; Auto; по два измерения на сторону.  | pending |
| 92 | 683 | 683-shot.png | Join configuration.  | pending |
| 93 | 684 | 684-shot.png | Два join conditions.  | pending |
| 94 | 685 | 685-shot.png | Join configuration: Left Outer, GA4 слева.  | pending |
| 95 | 685a | 685a-shot.png | Join configuration: Left Outer и два ключа; результат с отсутствующим совпадением.  | pending |
| 97 | 687 | 687-shot.png | Blend name + Save.  | pending |
| 98 | 688 | 688-shot.png | Blended table.  | pending |
| 99 | 688a | 688a-shot.png | Третья таблица Blend: GA4 с фильтром generate_lead, Event count, два ключа и Left Outer.  | pending |
| 100 | 688b | 688b-shot.png | Три таблицы рядом: GA4 отдельно, Sheets отдельно, Blend для одинаковых ключей и дат.  | pending |
| 104 | 692 | 692-shot.png | Итоговая таблица с Lead Count и Done Count.  | pending |
| 105 | 692a | 692a-shot.png | Done Count в источнике Sheets, затем среди метрик Sheets-таблицы Blend.  | pending |
| 108 | 695 | 695-shot.png | Отношение Actual Leads / Sessions в Blend и контроль ручного расчёта.  | pending |
| 109 | 695a | 695a-shot.png | Вычисляемое поле диаграммы Blend, тип Percent и ручная сверка одной строки.  | pending |
| 116 | 700a | 700a-shot.png | Page 3: controls используют Blend; переключение страниц не переносит чужой source-фильтр.  | pending |
| 117 | 701 | 701-shot.png | created_at как Date range dimension у компонента Sheets.  | pending |
| 119 | 702a | 702a-shot.png | Период, сведения об обновлении и дата на обеих сторонах; фактическая ошибка при её наличии.  | pending |
| 127 | 710 | 710-shot.png | View Mode.  | pending |
| 128 | 711 | 711-shot.png | Отфильтрованный Page 1.  | pending |
| 129 | 712 | 712-shot.png | Campaign filter.  | pending |
| 130 | 713 | 713-shot.png | Page 2 Instagram.  | pending |
| 131 | 714 | 714-shot.png | Blend table.  | pending |
| 132 | 714a | 714a-shot.png | Page 2 и Page 3 для одного периода; список пар Sheets без соответствия в GA4.  | pending |
| 136 | 718 | 718-shot.png | Share dialog.  | pending |
| 137 | 718a | 718a-shot.png | Share dialog: текущий ограниченный доступ и роли; без лишних персональных данных.  | pending |
| 140 | 721 | 721-shot.png | Report permissions и Data credentials как отдельные настройки.  | pending |
| 143 | 723a | 723a-shot.png | Редакторы GA4 и Sheets: фактическая модель credentials без секретов.  | pending |
| 146 | 725a | 725a-shot.png | Страница Leads без name/email; настройки ограниченного набора и проверка экспорта.  | pending |
| 150 | 729 | 729-shot.png | Три страницы отчёта и список двух источников плюс Blend.  | pending |
| 151 | 729a | 729a-shot.png | Заполненная спецификация отчёта и сверка исходных/объединённых показателей.  | pending |
