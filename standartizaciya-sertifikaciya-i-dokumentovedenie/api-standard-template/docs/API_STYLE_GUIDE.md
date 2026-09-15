# API Style Guide · Service Desk API

Внутренний стандарт проекта. Сила требования обозначается словами из RFC 2119:
**MUST** — обязательно, **SHOULD** — рекомендуется, отступление нужно обосновать,
**MAY** — допускается.

В скобках после правила указано, чем оно проверяется автоматически.
Правило без пометки проверяется на review. Источник каждого правила и варианты
у других компаний — [STANDARDS.md](STANDARDS.md).

## 1. URI

- URI MUST use nouns: `/tickets`, а не `/getTickets` (`.spectral.yaml: paths-no-verbs`).
- Коллекции MUST называться во множественном числе: `/tickets`, `/users`.
- Конкретный ресурс MUST адресоваться path parameter: `/tickets/{ticket_id}`.
- Фильтрация, сортировка и пагинация MUST передаваться query parameters.
- Вложенность URI SHOULD NOT превышать два уровня: `/users/{user_id}/tickets`.
- Все пути MUST начинаться с мажорной версии: `/api/v1/` (`tests/test_contract.py`).

## 2. HTTP

- GET MUST NOT change business state.
- Создание ресурса MUST выполняться `POST` на коллекцию и возвращать `201 Created`
  с заголовком `Location` (`tests/test_tickets.py`).
- Частичное изменение MUST выполняться `PATCH`; `PUT` MAY использоваться только
  для полной замены представления.
- Успешное удаление SHOULD возвращать `204 No Content` без тела.
- Status code MUST описывать фактический результат: `200` не возвращается вместо `201`, `204`, `404`.

## 3. Заголовки

- Каждый ответ MUST содержать `X-Request-Id` (`tests/test_http_features.py`).
  Значение клиента принимается, только если оно из букв, цифр, `.`, `_`, `-` и не длиннее 128 символов.
- Ответ с одним ресурсом SHOULD содержать `ETag`; сервер MUST отвечать `304` на совпавший `If-None-Match`.
- Изменение ресурса MAY принимать `If-Match`; при несовпадении сервер MUST ответить `412`
  и не менять ресурс (`tests/test_http_features.py`).
- Операции записи MUST ограничиваться по частоте: превышение даёт `429` с `Retry-After`,
  каждый ответ на запись содержит `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
  `X-RateLimit-Reset` — секунды до сброса окна, а не время Unix.
- `POST` MAY принимать `Idempotency-Key` длиной до 255 символов; ключ хранится 24 часа.
  Повтор с другим телом MUST давать `422`.
- Заголовки ответа, которые нужны браузерному клиенту, MUST быть перечислены в `expose_headers` CORS.

## 4. Операции OpenAPI

- Public operations MUST define operationId в camelCase: `listTickets`, `createTicket`
  (`spectral:oas operation-operationId`, `tests/test_contract.py`).
- operationId MUST быть уникальным и SHOULD NOT меняться после релиза: по нему генерируются SDK.
- Каждая операция MUST иметь `tags` и `summary` (`operation-tags`, `tests/test_contract.py`).
- Каждая операция MUST описывать успешный ответ, ожидаемые ошибки и заголовки ответа.
- Схемы запросов и ответов SHOULD содержать осмысленные examples.

## 5. JSON

- Свойства MUST быть в `snake_case`: `created_at`, `ticket_id` (`json-properties-snake-case`).
- Дата и время MUST передаваться строкой RFC 3339 в UTC: `2026-09-15T17:30:00Z`.
- Для создания, изменения и ответа MUST использоваться разные схемы:
  `TicketCreate`, `TicketUpdate`, `Ticket`. Клиент не передаёт поля, которые формирует сервер.
- Collections MUST support pagination when their size is unbounded: `limit` от 1 до 100, `offset`.

## 6. Ошибки

- Errors MUST use `application/problem+json` (RFC 9457) (`error-responses-use-problem-json`).
- Тело ошибки MUST содержать `type`, `title`, `status`; SHOULD содержать `detail` и `instance`.
- Адрес в `type` MUST открывать страницу с описанием вида проблемы.
- Ответ MUST NOT раскрывать traceback, SQL, пути файловой системы и секреты.
- Подробности — в [ERRORS.md](ERRORS.md).

## 7. Версионирование

- `info.version` MUST следовать Semantic Versioning.
- Breaking change MUST выпускаться только в новой мажорной версии пути (job `breaking-changes`).
- Устаревающие операции MUST помечаться `deprecated: true` и SHOULD отдавать `Deprecation` и `Sunset`.
- Подробности — в [VERSIONING.md](VERSIONING.md) и [adr/0001-api-versioning.md](adr/0001-api-versioning.md).

## 8. Безопасность

- Операции записи MUST требовать Bearer token и объявлять `security` в OpenAPI
  (`tests/test_contract.py`).
- `401` MUST возвращаться при отсутствии или неверном токене, `403` — когда клиент известен,
  но операция ему запрещена.
- Подробности — в [SECURITY.md](SECURITY.md).

## 9. Репозиторий

- Изменение контракта MUST проходить через pull request по шаблону `.github/PULL_REQUEST_TEMPLATE.md`.
- Изменения в `openapi/`, `.spectral.yaml` и правилах MUST утверждать владельцы из `.github/CODEOWNERS`.
- Ветка `main` MUST быть защищена: слияние только после успешного CI.
