# ОП.03 · Тема 10 · Анализ Instagram-воронки

## Условия
- Автор: Максим Макаров
- GA4 Property / ID: Tvuya Sreda Website / 553351386
- Сайт: ga4-analytics-lab-ivanov.vercel.app
- Дата проверки: 08.10.2026
- Период от / до: 10.09.2026 – 07.10.2026
- Часовой пояс ресурса: Россия (GMT+03:00) Москва
- Source: instagram
- Campaign: backend_guide
- Ограничения: события хранятся 2 мес.; тестовые визиты, группа — 8 пользователей

## Reports
| Вопрос | Измерение | Метрика | Значение | Файл |
|---|---|---|---|---|
| Объём кампании | Session source / medium + campaign | Sessions | 11 | 587-shot.png |
| Стартовая страница | Landing page | Sessions | /guide.html — 10 | 588-shot.png |
| Нажатия CTA | Event name = cta_click | Event count | 3 | 589-shot.png |
| Начало формы | Event name = form_start | Event count | 1 | 589-shot.png |
| Отправка | Event name = generate_lead | Event count | 1 | 589-shot.png |
| Сеансы с отправкой | Session source / medium | Session key event rate | 9,09 % | 490a-shot.png |

## Funnel (Closed, Indirectly, без Within; фильтры instagram + backend_guide)
| Шаг | Пользователи | Дошли дальше, % | Потеря, чел. | Потеря, % |
|---|---|---|---|---|
| session_start | 8 | 37,5 % | 5 | 62,5 % |
| cta_click | 3 | 33,3 % | 2 | 66,7 % |
| form_start | 1 | 100 % | 0 | 0 % |
| generate_lead | 1 | — | — | — |

- Наибольшая абсолютная потеря: 5 чел. (session_start → cta_click)
- Наибольшая доля потерь: 66,7 % (cta_click → form_start)
- Device category: desktop 7 → 3 → 1 → 1; mobile 1 → 0

## Path
- After CTA: session_start → page_view → /guide.html (сегмент IG backend_guide sessions)
- Before lead: generate_lead ← scroll (1)
- Фильтры вкладки Path по source/campaign не загрузились — условия заданы сегментом сеансов

## Sheets: отдельная сверка
- Период / фильтры: 10.09–07.10.2026, instagram + backend_guide
- Строк: 1 · уникальных request_id: 1
- GA4 generate_lead: 1 событие у 1 пользователя — совпадает

## Итог
1. Наблюдение: 1 из 3 пользователей после CTA начал форму (33,3 %); период 10.09–07.10.2026; instagram / backend_guide.
2. Ограничение: 8 пользователей, тестовые визиты; результат проверяется на новом периоде.
3. Гипотеза: после CTA на contacts.html форма не видна сразу — пользователь уходит до form_start.
4. Проверка: поднять форму к первому экрану; метрика — доля cta_click → form_start; сравнить 4 недели до и после.
5. Подтвердит: рост доли cta_click → form_start при сопоставимом числе сеансов; опровергнет: доля без изменений.
