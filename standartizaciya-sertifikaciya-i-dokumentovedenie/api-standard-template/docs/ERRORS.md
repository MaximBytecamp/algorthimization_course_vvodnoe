# Контракт ошибок

Все ответы 4xx и 5xx возвращаются в формате Problem Details
([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)) с заголовком
`Content-Type: application/problem+json`. Реализация — `app/problems.py`.
Откуда взяты правила — [STANDARDS.md, раздел 4](STANDARDS.md#4-формат-ошибок-problem-details).

## Поля

| Поле | Обязательно | Назначение |
|---|---|---|
| `type` | да | адрес страницы с описанием вида проблемы. Клиент ветвит обработку по нему, а не по тексту |
| `title` | да | краткое описание вида проблемы, одинаковое для всех случаев этого вида |
| `status` | да | HTTP status code, продублированный в теле |
| `detail` | нет | что произошло именно в этом запросе |
| `instance` | нет | адрес запроса, в котором возникла проблема |
| `errors` | нет | расширение проекта: список полей, не прошедших валидацию (только 422) |

## Адрес в поле type открывается

RFC 9457, раздел 3.1.1:

> If the type URI is a locator (e.g., those with an "http" or "https" scheme), dereferencing it SHOULD provide human-readable documentation for the problem type (e.g., using HTML).

Перевод: если URI в поле type является адресом (например, со схемой http или https), то по нему SHOULD открываться понятная человеку документация о виде проблемы, например HTML-страница.

Поэтому `type` ведёт на страницы, которые `.github/workflows/docs.yml` публикует на GitHub Pages:
<https://maximbytecamp.github.io/api-standard-template/problems/>.
Базовый адрес меняется переменной окружения `API_PROBLEM_TYPE_BASE`.

## Виды проблем

| status | type | Когда возникает |
|---|---|---|
| 401 | [`…/problems/http-401`](https://maximbytecamp.github.io/api-standard-template/problems/http-401.html) | нет заголовка Authorization или токен неизвестен |
| 403 | [`…/problems/http-403`](https://maximbytecamp.github.io/api-standard-template/problems/http-403.html) | токен известен, но операция ему запрещена |
| 404 | [`…/problems/http-404`](https://maximbytecamp.github.io/api-standard-template/problems/http-404.html) | ресурса с таким идентификатором нет |
| 412 | [`…/problems/http-412`](https://maximbytecamp.github.io/api-standard-template/problems/http-412.html) | `If-Match` не совпадает с текущим `ETag`: обращение изменили после чтения |
| 422 | [`…/problems/http-422`](https://maximbytecamp.github.io/api-standard-template/problems/http-422.html) | запрос не соответствует схеме или `Idempotency-Key` уже использован с другим телом |
| 429 | [`…/problems/http-429`](https://maximbytecamp.github.io/api-standard-template/problems/http-429.html) | превышен лимит операций записи; ответ содержит `Retry-After` |
| 500 | [`…/problems/http-500`](https://maximbytecamp.github.io/api-standard-template/problems/http-500.html) | непредвиденная ошибка сервера |

Добавили новый код ответа — добавьте его в `TITLES` в `app/problems.py` и в `PROBLEMS`
в `scripts/build_docs.py`, иначе `type` будет вести на несуществующую страницу.

## Пример

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json
X-Request-Id: 0b6f3c1e-2a9d-4a4f-9d7e-3f4a1c2b5d6e
```

```json
{
  "type": "https://maximbytecamp.github.io/api-standard-template/problems/http-404",
  "title": "Resource not found",
  "status": 404,
  "detail": "Ticket 8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10 does not exist",
  "instance": "/api/v1/tickets/8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10"
}
```

## Что не попадает в ответ

Traceback, текст SQL-запроса, пути файловой системы, значения переменных окружения.
Технические подробности пишутся в лог сервера вместе с `X-Request-Id` (`app/problems.py`).
