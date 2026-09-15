"""Единый формат ошибок: Problem Details (RFC 9457).

Все ответы 4xx и 5xx уходят с Content-Type application/problem+json
и одинаковым набором полей, какой бы endpoint их ни вернул.
"""

import logging
import os
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

PROBLEM_MEDIA_TYPE = "application/problem+json"
# RFC 9457, раздел 3.1.1: если type — адрес http(s), по нему SHOULD открываться
# документация о виде проблемы. Страницы публикует .github/workflows/docs.yml.
PROBLEM_TYPE_BASE = os.getenv("API_PROBLEM_TYPE_BASE", "https://maximbytecamp.github.io/api-standard-template/problems/")

TITLES = {
    400: "Bad request",
    401: "Authentication required",
    403: "Operation forbidden",
    404: "Resource not found",
    405: "Method not allowed",
    409: "Conflict",
    412: "Precondition failed",
    422: "Validation error",
    429: "Too many requests",
    500: "Internal server error",
}

logger = logging.getLogger("service_desk")


def problem(status: int, detail: str | None, instance: str, headers: dict | None = None, **extra) -> JSONResponse:
    body = {
        "type": f"{PROBLEM_TYPE_BASE}http-{status}",
        "title": TITLES.get(status, HTTPStatus(status).phrase),
        "status": status,
    }
    if detail:
        body["detail"] = detail
    body["instance"] = instance
    body.update(extra)
    return JSONResponse(body, status_code=status, headers=headers, media_type=PROBLEM_MEDIA_TYPE)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else None
    return problem(exc.status_code, detail, request.url.path, headers=exc.headers)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        {"loc": [str(part) for part in error["loc"]], "msg": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return problem(422, "Request does not match the API contract", request.url.path, errors=errors)


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Traceback остаётся в логах сервера, клиент получает только публичное описание.
    request_id = getattr(request.state, "request_id", "-")
    logger.exception("Unhandled error on %s %s, request id %s", request.method, request.url.path, request_id)
    return problem(500, "Unexpected server error. The incident has been logged.", request.url.path)


def register_problem_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
