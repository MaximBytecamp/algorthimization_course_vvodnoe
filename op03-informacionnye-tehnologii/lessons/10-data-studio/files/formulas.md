# Формулы DataLens

Все поля создаются в датасете: «Поля» → «Добавить поле». Формулы проверены в DataLens 14.10.2026.

## GA4 трафик и GA4 generate_lead

**Дата** — выгрузка GA4 хранит дату текстом 20261007:

```text
DATE_PARSE([date])
```

Сборка даты из кусочков `DATE(LEFT([date], 4) + "-" + MID(...))` проверку датасета не прошла.

**source** — прямой заход GA4 пишет как `(direct)`, а форма — как `direct`:

```text
IF([utm_source] = "(direct)", "direct", [utm_source])
```

**campaign** — `(direct)` и `(not set)` в GA4 соответствуют `not_set` в форме:

```text
IF([utm_campaign] = "(direct)" OR [utm_campaign] = "(not set)", "not_set", [utm_campaign])
```

Числа: sessions, active_users, lead_events — тип «Целое число», агрегация «Сумма».
Сумма active_users по строкам больше числа уникальных пользователей в GA4: один человек в разные дни считается несколько раз.

## Заявки

```text
Дата        = DATE([created_at])
source      = [utm_source]
campaign    = [utm_campaign]
Lead Count  = COUNTD([request_id])
Done Count  = COUNTD(IF([status] = "done", [request_id], NULL))
```

COUNTD считает уникальные request_id и не исправляет пустые ID — их чистят в таблице.
Done Count считает заявки, созданные за период и имеющие статус done сейчас. Дату завершения таблица не хранит.

## Сводная таблица

Чарт из трёх датасетов, связи только по source, campaign и Дата. Каждый датасет считается отдельно, затем строки ставятся рядом. `null` — пары нет в этом датасете, это не ноль.

Отношение заявок к сеансам считается как отношение сумм: Lead Count / sessions по паре. Долю сеансов, закончившихся заявкой, оно не показывает и может быть больше 1.
