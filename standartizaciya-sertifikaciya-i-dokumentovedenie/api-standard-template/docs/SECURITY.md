# Безопасность

Источники и варианты этого файла у Microsoft и Kubernetes — [STANDARDS.md, разделы 19 и 25](STANDARDS.md#19-политика-безопасности).

## Поддерживаемые версии

| Версия | Поддерживается |
|---|---|
| 1.1.x | да |
| 1.0.x | нет, обновитесь до 1.1 |

## Сообщить об уязвимости

**Не публикуйте уязвимость в issue.** Используйте
[приватное сообщение об уязвимости](https://github.com/MaximBytecamp/api-standard-template/security/advisories/new)
на GitHub или напишите API Team: api-team@example.edu.

Укажите, насколько сможете:

- операцию и версию API;
- шаги воспроизведения;
- `X-Request-Id` из ответа;
- чем уязвимость опасна.

Мы ответим в течение трёх рабочих дней.

## Аутентификация учебного стенда

Схема `BearerAuth` описана в OpenAPI (`components.securitySchemes`):

```yaml
BearerAuth:
  type: http
  scheme: bearer
```

| Токен | Чтение | Создание, изменение, удаление |
|---|---|---|
| нет | да | `401 Unauthorized` |
| `demo-token` | да | да |
| `viewer-token` | да | `403 Forbidden` |

Токены задаются переменными `API_WRITER_TOKEN` и `API_VIEWER_TOKEN`.
Это учебное упрощение: в production токен выдаёт сервер авторизации
по OAuth 2.0 / OpenID Connect, и сервис проверяет его подпись и срок действия.
Схему OAuth 2.0 в контракт добавляют вместе с настоящим сервером авторизации.

## Защита от злоупотреблений

- Операции записи ограничены по частоте: `429 Too Many Requests` с `Retry-After` (`app/limits.py`).
- Значение `X-Request-Id` от клиента проверяется по формату, прежде чем попасть в лог.
- CORS разрешает запросы только из источников в `API_CORS_ORIGINS`.

## Что не решает документация

Наличие `/docs` и корректной OpenAPI-схемы не доказывает безопасность API.
Перед релизом команда проверяет риски из
[OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/),
в первую очередь:

- **API1 Broken Object Level Authorization** — может ли клиент прочитать или изменить
  чужое обращение, подставив другой `ticket_id`;
- **API2 Broken Authentication** — принимаются ли просроченные и поддельные токены;
- **API3 Broken Object Property Level Authorization** — может ли клиент изменить поля,
  которые ему менять нельзя (в проекте запрещено передавать `id` при создании);
- **API4 Unrestricted Resource Consumption** — ограничена ли частота и объём запросов.
