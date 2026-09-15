"""Учебная Bearer-аутентификация.

Два статических токена показывают разницу между 401 и 403:
- без токена или с неизвестным токеном — 401, клиент не аутентифицирован;
- viewer-token — 403, клиент известен, но изменять обращения ему нельзя.

В production токен выдаёт сервер авторизации (OAuth 2.0 / OpenID Connect),
а не переменная окружения.
"""

import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

WRITER_TOKEN = os.getenv("API_WRITER_TOKEN", "demo-token")
VIEWER_TOKEN = os.getenv("API_VIEWER_TOKEN", "viewer-token")

bearer_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    description="Учебные токены: demo-token может изменять обращения, viewer-token — только читать.",
    auto_error=False,
)


def require_writer(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> str:
    token = credentials.credentials if credentials else None
    if token not in (WRITER_TOKEN, VIEWER_TOKEN):
        raise HTTPException(
            status_code=401,
            detail="Provide a valid Bearer token in the Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if token == VIEWER_TOKEN:
        raise HTTPException(status_code=403, detail="This token can only read tickets")
    return token
