"""Идентификатор запроса X-Request-Id.

Клиент может прислать свой идентификатор, сервер вернёт его в ответе и запишет
в лог. Если заголовка нет или значение подозрительное, сервер создаёт UUID сам.
Так одну операцию можно найти в логах клиента, gateway и сервиса.

Источники и варианты у разных компаний — docs/STANDARDS.md, раздел «Идентификатор запроса».
"""

import re
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

REQUEST_ID_HEADER = "X-Request-Id"
# Значение приходит от клиента и попадает в логи, поэтому длина и символы ограничены.
VALID_REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,128}$")


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        incoming = request.headers.get(REQUEST_ID_HEADER, "")
        request_id = incoming if VALID_REQUEST_ID.match(incoming) else str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
