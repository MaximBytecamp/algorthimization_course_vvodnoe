"""Точка входа Service Desk API."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html

from app.api.v1.endpoints import tickets
from app.middleware import REQUEST_ID_HEADER, RequestIdMiddleware
from app.problems import PROBLEM_MEDIA_TYPE, register_problem_handlers
from app.schemas import ProblemDetails

API_DESCRIPTION = """
Учебный API системы регистрации обращений в службу поддержки.

* Контракт описан правилами из `docs/API_STYLE_GUIDE.md`, источники правил — `docs/STANDARDS.md`.
* Ошибки возвращаются в формате Problem Details (RFC 9457), `application/problem+json`.
* Операции записи требуют Bearer token: `demo-token` — запись, `viewer-token` — только чтение.
* Мажорная версия API указана в пути: `/api/v1`.
* Каждый ответ содержит `X-Request-Id`. Обращение отдаётся с `ETag`, изменение принимает `If-Match`.
"""

# Страницы, куда ведут адреса type из Problem Details, и браузерные клиенты,
# которым разрешено обращаться к API. Оба значения задаются окружением.
CORS_ORIGINS = [o for o in os.getenv("API_CORS_ORIGINS", "http://localhost:5173").split(",") if o]

app = FastAPI(
    title="Service Desk API",
    version="1.1.0",
    summary="Учебный стандартизированный REST API",
    description=API_DESCRIPTION,
    contact={
        "name": "API Team",
        "email": "api-team@example.edu",
        "url": "https://github.com/MaximBytecamp/api-standard-template",
    },
    license_info={"name": "MIT", "identifier": "MIT"},
    openapi_tags=[
        {"name": "Tickets", "description": "Обращения в службу поддержки: создание, просмотр, изменение и удаление"},
    ],
    servers=[{"url": "http://127.0.0.1:8000", "description": "Local development"}],
    redoc_url=None,
)

register_problem_handlers(app)
app.add_middleware(RequestIdMiddleware)
# Браузер отдаёт скрипту только перечисленные заголовки ответа (Fetch Standard, CORS protocol),
# поэтому ETag, Location и остальные заголовки контракта нужно открыть явно.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "If-Match", "If-None-Match", "Idempotency-Key", REQUEST_ID_HEADER],
    expose_headers=[
        "ETag", "Location", REQUEST_ID_HEADER, "Retry-After", "Deprecation", "Sunset",
        "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset",
    ],
)
app.include_router(tickets.router, prefix="/api/v1")

# FastAPI 0.115 подключает ReDoc по тегу redoc@next, а CDN по этому тегу больше
# не отдаёт файл: страница /redoc остаётся пустой. Версия закреплена явно.
REDOC_JS_URL = "https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js"


@app.get("/redoc", include_in_schema=False)
def redoc():
    return get_redoc_html(openapi_url=app.openapi_url, title=f"{app.title} - ReDoc", redoc_js_url=REDOC_JS_URL)


_generate_openapi = app.openapi


def openapi_with_problem_details() -> dict:
    """Дополняет схему FastAPI тем, что обработчики возвращают на самом деле.

    - Все ответы 4xx и 5xx описаны схемой ProblemDetails и media type application/problem+json
      (FastAPI по умолчанию описывает 422 своей моделью HTTPValidationError).
    - Каждый ответ содержит заголовок X-Request-Id, который добавляет RequestIdMiddleware.
    """
    if app.openapi_schema:
        return app.openapi_schema
    schema = _generate_openapi()
    components = schema.setdefault("components", {})
    schemas = components.setdefault("schemas", {})
    schemas.pop("HTTPValidationError", None)
    schemas.pop("ValidationError", None)
    schemas["ProblemDetails"] = ProblemDetails.model_json_schema()
    components["headers"] = {
        "XRequestId": {
            "description": "Идентификатор запроса: значение клиента или UUID, созданный сервером",
            "schema": {"type": "string", "example": "0b6f3c1e-2a9d-4a4f-9d7e-3f4a1c2b5d6e"},
        }
    }
    for path_item in schema["paths"].values():
        for operation in path_item.values():
            for code, response in operation["responses"].items():
                response.setdefault("headers", {})[REQUEST_ID_HEADER] = {"$ref": "#/components/headers/XRequestId"}
                if code.startswith(("4", "5")):
                    response["content"] = {
                        PROBLEM_MEDIA_TYPE: {"schema": {"$ref": "#/components/schemas/ProblemDetails"}}
                    }
    return schema


app.openapi = openapi_with_problem_details
