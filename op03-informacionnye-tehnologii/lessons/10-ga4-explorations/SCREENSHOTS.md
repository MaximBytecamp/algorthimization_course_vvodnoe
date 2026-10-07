# ОП.03 · Тема 10 · GA4 Reports и Explorations

## Задание для Claude

Сними реальные интерфейсы по презентации последовательно. Рабочая папка: op03-informacionnye-tehnologii/lessons/10-ga4-explorations/shots/. Каждый PNG называй точно по таблице. «Экран» — позиция в колоде, «исходник» — постоянный номер; буква — промежуточный шаг. Ссылка на слайд: index.html#450, index.html#456a и т. д.

Сначала прочитай files/README.md и analysis-template.md. Используй тот же ресурс GA4, что в теме 9. Запиши период и часовой пояс. Все основные кадры снимай на одном ресурсе и периоде; для сравнения дат и Within фиксируй изменение отдельно. Не выдавай условные числа презентации за данные ресурса. Пустые состояния снимай с видимыми настройками и объяснением.

Доступ: Explore и отчёты — в доступном аккаунте; Custom Insights и Library требуют Editor / Administrator. Изменения правил и публикацию новой коллекции делай только в согласованном ресурсе. Email-уведомления другим пользователям не подключай. Не меняй общую атрибуцию или срок хранения ради кадра. Если прав нет, зафиксируй ограничение; не рисуй интерфейс.

Проверяй смысл: Session source вместо First user source; Direct = (direct); Key events не всегда только generate_lead; перед сравнением Instagram/Direct убери общий Instagram-фильтр. На Funnel/Path не оставляй Event name = generate_lead в общих фильтрах — он обрежет маршрут. Для основного кейса на каждой вкладке нужны source=instagram И campaign=backend_guide. Проверяй тип сегмента; не подменяй сессионную группу пользовательской без подписи.

Основной Funnel: четыре шага, Closed, Indirectly, без Within. Path: явно выбранная метрика, отдельные вкладки прямого и обратного маршрута. Итог — реальные числители, знаменатели и гипотеза, не заранее обещанный результат.

Снимай PNG с читаемым текстом, желательно 1600×1000 и выше. На шаге с двумя состояниями допустим один кадр с обоими состояниями либо два снимка, объединённых в PNG без изменения данных. Скрывай чужие персональные данные и секреты; оставляй настройки, период и значения, необходимые для проверки. Записывай время, интерфейс, фактический результат и имя PNG в shots/evidence.json.

После съёмки: node build.mjs в папке темы, проверить каждый PNG в увеличении, проверить manifest. Сейчас запланировано 99 кадров.

| Экран | Исходник | PNG | Что снять | Статус |
|---|---|---|---|---|
| 8 | 456a | 456a-shot.png | GA4: выбранный ресурс, период и существующие события; рядом заполненная шапка отчёта.  | pending |
| 9 | 457 | 457-shot.png | GA4 с выделенным `Reports`.  | pending |
| 10 | 457a | 457a-shot.png | Reports: структура коллекций и доступный Traffic acquisition либо его карточка в Library.  | pending |
| 11 | 458 | 458-shot.png | Reports Snapshot целиком.  | pending |
| 13 | 460 | 460-shot.png | Date range picker.  | pending |
| 15 | 461a | 461a-shot.png | Date range: основной и предыдущий период; сравнение включено.  | pending |
| 19 | 465 | 465-shot.png | Reports → Acquisition.  | pending |
| 23 | 469 | 469-shot.png | Traffic Acquisition целиком.  | pending |
| 24 | 470 | 470-shot.png | Dimension picker. Session source / medium. | pending |
| 25 | 471 | 471-shot.png | Строка `instagram / social`.  | pending |
| 26 | 471a | 471a-shot.png | Traffic acquisition: период, Session source / medium, состояние фильтров и фактический результат.  | pending |
| 28 | 473 | 473-shot.png | Таблица Traffic Acquisition с engagement metrics.  | pending |
| 30 | 475 | 475-shot.png | Кнопка `+` рядом с dimension.  | pending |
| 36 | 481 | 481-shot.png | Landing Page report.  | pending |
| 37 | 482 | 482-shot.png | Landing Page table.  | pending |
| 38 | 483 | 483-shot.png | Landing Page + secondary dimension.  | pending |
| 41 | 485a | 485a-shot.png | Pages and screens: пути guide.html и contacts.html с Views и Active users.  | pending |
| 42 | 486 | 486-shot.png | Events table.  | pending |
| 46 | 489a | 489a-shot.png | Events в Admin: generate_lead отмечен как Key event; отдельно селектор generate_lead в отчёте.  | pending |
| 48 | 490a | 490a-shot.png | Traffic acquisition: Sessions, Key events и Session key event rate для generate_lead.  | pending |
| 50 | 491a | 491a-shot.png | Tech details: Device category и показатели поведения для Instagram.  | pending |
| 53 | 494 | 494-shot.png | Кнопка создания Comparison.  | pending |
| 54 | 495 | 495-shot.png | Comparison builder.  | pending |
| 55 | 496 | 496-shot.png | Два Comparisons в отчёте.  | pending |
| 58 | 499 | 499-shot.png | Share this report → Download / Export.  | pending |
| 62 | 503 | 503-shot.png | GA4 → Explore.  | pending |
| 63 | 504 | 504-shot.png | Explore Gallery.  | pending |
| 64 | 505 | 505-shot.png | Новая Free Form exploration.  | pending |
| 65 | 505a | 505a-shot.png | Explore: имя исследования и раскрытый календарь Variables с выбранными датами.  | pending |
| 66 | 506 | 506-shot.png | Explore с тремя подписанными зонами.  | pending |
| 67 | 507 | 507-shot.png | Variables panel.  | pending |
| 68 | 508 | 508-shot.png | Add Dimensions.  | pending |
| 69 | 509 | 509-shot.png | Add Metrics.  | pending |
| 70 | 510 | 510-shot.png | Import button.  | pending |
| 72 | 512 | 512-shot.png | Drag Session source → Rows.  | pending |
| 73 | 513 | 513-shot.png | Free Form table.  | pending |
| 74 | 514 | 514-shot.png | Free Form с двумя metrics.  | pending |
| 75 | 514a | 514a-shot.png | Две вкладки: Sources без Event name-фильтра и Lead events с generate_lead и Event count.  | pending |
| 77 | 516 | 516-shot.png | Rows:  ```text Session source Session campaign ```  | pending |
| 79 | 518 | 518-shot.png | Content dimension в таблице.  | pending |
| 80 | 518a | 518a-shot.png | Free form: source, campaign, Session manual ad content; фактические reel01 или (not set).  | pending |
| 82 | 520 | 520-shot.png | Visualization picker.  | pending |
| 84 | 522 | 522-shot.png | Filters section.  | pending |
| 85 | 523 | 523-shot.png | Фильтр Explore: доступные операторы и выбранное точное значение instagram.  | pending |
| 87 | 525 | 525-shot.png | Segment Builder.  | pending |
| 88 | 526 | 526-shot.png | Два Segment в Variables.  | pending |
| 89 | 527 | 527-shot.png | Free Form с двумя сегментами.  | pending |
| 90 | 527a | 527a-shot.png | Free form: два сегмента и отсутствие общего Instagram-фильтра.  | pending |
| 93 | 530 | 530-shot.png | Technique picker → Funnel exploration.  | pending |
| 94 | 530a | 530a-shot.png | Funnel: Make open funnel выключен, заголовок вкладки и период.  | pending |
| 95 | 531 | 531-shot.png | Edit funnel steps.  | pending |
| 96 | 532 | 532-shot.png | Step 1 configuration.  | pending |
| 97 | 533 | 533-shot.png | Step 2.  | pending |
| 98 | 534 | 534-shot.png | Step 3.  | pending |
| 99 | 535 | 535-shot.png | Step 4.  | pending |
| 100 | 535a | 535a-shot.png | Edit funnel steps: четыре условия, косвенные переходы и Apply.  | pending |
| 101 | 536 | 536-shot.png | Готовый Funnel Exploration.  | pending |
| 107 | 541a | 541a-shot.png | Одинаковая воронка до и после Make open funnel; виден переключатель.  | pending |
| 109 | 543 | 543-shot.png | Steps: варианты Directly и Indirectly; для базовой воронки выбран Indirectly.  | pending |
| 110 | 544 | 544-shot.png | Редактор перехода CTA → Form Start с доступной настройкой Within.  | pending |
| 111 | 544a | 544a-shot.png | Условие Within 10 minutes на переходе CTA → Form Start и результат после Apply.  | pending |
| 112 | 545 | 545-shot.png | Funnel Breakdown.  | pending |
| 114 | 547 | 547-shot.png | Funnel с campaign breakdown.  | pending |
| 115 | 548 | 548-shot.png | Funnel + segments.  | pending |
| 116 | 548a | 548a-shot.png | Редактор пользовательского сегмента и его применение к Funnel; видны имя и область группы.  | pending |
| 121 | 553 | 553-shot.png | Technique picker.  | pending |
| 122 | 553a | 553a-shot.png | Path после Start over: Starting point и выбранная метрика.  | pending |
| 123 | 554 | 554-shot.png | Starting point configuration.  | pending |
| 124 | 555 | 555-shot.png | Path tree после session_start.  | pending |
| 125 | 556 | 556-shot.png | Раскрытый node.  | pending |
| 128 | 558a | 558a-shot.png | Path: выбран Page path and screen class, видны реальные пути страниц.  | pending |
| 129 | 559 | 559-shot.png | Path Exploration → Ending Point.  | pending |
| 130 | 559a | 559a-shot.png | Path Before lead: Ending point generate_lead и два раскрытых уровня назад.  | pending |
| 136 | 565 | 565-shot.png | Advertising section.  | pending |
| 137 | 566 | 566-shot.png | Key event attribution paths.  | pending |
| 141 | 570 | 570-shot.png | Data quality indicator в Exploration.  | pending |
| 142 | 570a | 570a-shot.png | Data retention и открытая подсказка качества данных Explore; без изменения настроек ресурса.  | pending |
| 145 | 573 | 573-shot.png | Insights area.  | pending |
| 147 | 575 | 575-shot.png | Create Custom Insight.  | pending |
| 148 | 575a | 575a-shot.png | Форма Custom Insight: частота, метрика, условие, значение, имя и пустой список email.  | pending |
| 149 | 575b | 575b-shot.png | Manage insights: сохранённое правило либо честно зафиксированное ограничение прав.  | pending |
| 151 | 577 | 577-shot.png | Reports → Library.  | pending |
| 152 | 578 | 578-shot.png | Reports → Library.  | pending |
| 155 | 580a | 580a-shot.png | Редактор detail report: измерения, метрики и сохранённое имя.  | pending |
| 156 | 580b | 580b-shot.png | Library: отчёт внутри темы новой коллекции; Published и пункт Reports.  | pending |
| 157 | 581 | 581-shot.png | Export options Exploration.  | pending |
| 158 | 581a | 581a-shot.png | Export data и открытый выгруженный файл с заголовками и фактическими значениями.  | pending |
| 164 | 586a | 586a-shot.png | Настройки сравнения/фильтров: Session source instagram AND Session campaign backend_guide.  | pending |
| 165 | 587 | 587-shot.png | Traffic acquisition с периодом, instagram / social и backend_guide.  | pending |
| 166 | 588 | 588-shot.png | Landing Page report.  | pending |
| 167 | 589 | 589-shot.png | Events.  | pending |
| 168 | 590 | 590-shot.png | Free Form.  | pending |
| 169 | 591 | 591-shot.png | Funnel Exploration.  | pending |
| 170 | 592 | 592-shot.png | Funnel breakdown.  | pending |
| 171 | 593 | 593-shot.png | Path.  | pending |
| 172 | 594 | 594-shot.png | Reverse Path.  | pending |
| 173 | 594a | 594a-shot.png | Sheets: отбор периода и кампании, уникальные request_id и итог без чужих персональных данных.  | pending |
| 174 | 595 | 595-shot.png | Финальное наблюдение: этап, числитель, знаменатель, доля, период и ограничения.  | pending |
| 177 | 597a | 597a-shot.png | Заполненный итоговый отчёт: наблюдение, гипотеза, проверка и ограничения.  | pending |
