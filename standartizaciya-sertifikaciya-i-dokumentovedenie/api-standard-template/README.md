# Service Desk API · api-standard-template

[![API contract](https://github.com/MaximBytecamp/api-standard-template/actions/workflows/ci.yml/badge.svg)](https://github.com/MaximBytecamp/api-standard-template/actions/workflows/ci.yml)
[![Publish docs](https://github.com/MaximBytecamp/api-standard-template/actions/workflows/docs.yml/badge.svg)](https://maximbytecamp.github.io/api-standard-template/)

Учебный эталон стандартизированного REST API для дисциплины
«Стандартизация, сертификация и техническое документоведение».
Предметная область — регистрация обращений в службу поддержки.

В репозитории есть не только код, но и всё, что делает API проверяемым контрактом:
style guide, OpenAPI, единый формат ошибок, политика версий, ADR, журнал изменений,
контрактные тесты, линтер, поиск breaking changes, CI, шаблоны issue и pull request,
владельцы кода и опубликованная документация.

**Откуда взято каждое правило** — [docs/STANDARDS.md](docs/STANDARDS.md): цитата из стандарта
или правил крупной компании, перевод и ссылки на то, как тот же файл устроен у Kubernetes,
GitHub, Azure, Zalando, Stripe и других.

## Документация

| Где | Что |
|---|---|
| [maximbytecamp.github.io/api-standard-template](https://maximbytecamp.github.io/api-standard-template/) | ReDoc по `openapi/openapi.yaml` |
| […/problems/](https://maximbytecamp.github.io/api-standard-template/problems/) | страницы видов ошибок из поля `type` |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | первый запрос за пять минут |

## Запуск

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

| Адрес | Что открывается |
|---|---|
| http://127.0.0.1:8000/docs | Swagger UI |
| http://127.0.0.1:8000/redoc | ReDoc |
| http://127.0.0.1:8000/openapi.json | OpenAPI schema |

Операции записи требуют токен: в Swagger UI нажмите **Authorize** и введите `demo-token`.
`viewer-token` может только читать — на нём видно разницу между `401` и `403`.

## Endpoints

| Метод | Путь | Успех | Ошибки |
|---|---|---|---|
| GET | `/api/v1/tickets` | 200 | 422 |
| POST | `/api/v1/tickets` | 201 + `Location`, `ETag` | 401, 403, 422, 429 |
| GET | `/api/v1/tickets/{ticket_id}` | 200 + `ETag`, 304 | 404, 422 |
| PATCH | `/api/v1/tickets/{ticket_id}` | 200 + `ETag` | 401, 403, 404, 412, 422, 429 |
| DELETE | `/api/v1/tickets/{ticket_id}` | 204 | 401, 403, 404, 422, 429 |
| GET | `/api/v1/tickets/open` · **deprecated** | 200 + `Deprecation`, `Sunset` | 422 |

## Проверки

```bash
pytest                                            # поведение, заголовки и контракт
python scripts/export_openapi.py --check          # openapi/ совпадает с кодом
npx @stoplight/spectral-cli lint openapi/openapi.yaml
```

В GitHub Actions те же шаги выполняет job `contract`, а в pull request job `breaking-changes`
сравнивает контракт с веткой `main` с помощью oasdiff.

## Структура

```text
api-standard-template/
├── .github/
│   ├── ISSUE_TEMPLATE/       формы: изменение API, ошибка API, ошибка документации
│   ├── workflows/            ci.yml — проверки, docs.yml — публикация документации
│   ├── CODEOWNERS            кто утверждает изменения контракта
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── app/
│   ├── main.py               метаданные, CORS, сборка OpenAPI
│   ├── schemas.py            TicketCreate, TicketUpdate, Ticket, TicketPage, ProblemDetails
│   ├── problems.py           ошибки RFC 9457
│   ├── security.py           Bearer-аутентификация
│   ├── middleware.py         X-Request-Id
│   ├── limits.py             429 и X-RateLimit-*
│   ├── idempotency.py        Idempotency-Key
│   └── api/v1/endpoints/tickets.py
├── docs/
│   ├── STANDARDS.md          источники всех правил с цитатами и вариантами компаний
│   ├── API_STYLE_GUIDE.md    правила проекта MUST / SHOULD / MAY
│   ├── QUICKSTART.md
│   ├── VERSIONING.md
│   ├── ERRORS.md
│   ├── SECURITY.md
│   ├── CONTRIBUTING.md
│   └── adr/0001-api-versioning.md
├── openapi/                  выгруженный контракт: openapi.json, openapi.yaml
├── scripts/                  export_openapi.py, build_docs.py
├── tests/                    test_tickets.py, test_http_features.py, test_contract.py
├── .spectral.yaml
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Как использовать шаблон в практической работе

Нажмите **Use this template** и создайте свой репозиторий. Не копируйте Service Desk
без изменений: выберите свою предметную область, перепишите ресурсы, схемы и style guide,
затем добейтесь зелёного CI. Порядок изменений описан в [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
