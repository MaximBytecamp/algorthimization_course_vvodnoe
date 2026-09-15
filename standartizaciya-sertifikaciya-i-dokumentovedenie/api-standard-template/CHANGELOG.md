# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версии — [Semantic Versioning](https://semver.org/lang/ru/).
Журнал написан для потребителей API: здесь только изменения публичного контракта.

## [Unreleased]

## [1.1.0] - 2026-09-16

### Added

- Заголовок `X-Request-Id` в каждом ответе; значение клиента возвращается, если оно корректно.
- `ETag` в ответах с одним обращением, `304 Not Modified` на совпавший `If-None-Match`.
- `If-Match` в `PATCH /api/v1/tickets/{ticket_id}`, ответ `412 Precondition Failed` при устаревшей версии.
- `Idempotency-Key` в `POST /api/v1/tickets`: повтор с тем же ключом не создаёт второе обращение.
- Лимит операций записи: `429 Too Many Requests` с `Retry-After`, заголовки `X-RateLimit-*`.
- CORS для источников из `API_CORS_ORIGINS` с открытыми заголовками контракта.
- Поле `type` в Problem Details ведёт на опубликованные страницы видов ошибок.

### Deprecated

- `GET /api/v1/tickets/open` — используйте `GET /api/v1/tickets?status=open`.
  Ответ содержит `Deprecation` и `Sunset`; отключение 2027-03-01.

## [1.0.0] - 2026-09-15

### Added

- `GET /api/v1/tickets` — список обращений с фильтром `status` и пагинацией `limit`, `offset`.
- `POST /api/v1/tickets` — создание обращения, ответ `201 Created` с заголовком `Location`.
- `GET /api/v1/tickets/{ticket_id}` — одно обращение.
- `PATCH /api/v1/tickets/{ticket_id}` — частичное изменение обращения.
- `DELETE /api/v1/tickets/{ticket_id}` — удаление обращения, ответ `204 No Content`.
- Схема безопасности `BearerAuth` для операций записи.
- Ошибки в формате Problem Details, `application/problem+json`.

[Unreleased]: https://github.com/MaximBytecamp/api-standard-template/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/MaximBytecamp/api-standard-template/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MaximBytecamp/api-standard-template/releases/tag/v1.0.0
