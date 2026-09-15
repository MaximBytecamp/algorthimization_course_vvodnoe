"""Ограничение частоты операций записи.

Каждый токен может выполнить не больше API_WRITE_LIMIT_PER_MINUTE операций записи
за минуту. Превышение даёт 429 Too Many Requests с заголовком Retry-After (RFC 6585).
В каждом ответе на запись есть три заголовка X-RateLimit-* в том смысле, который
задаёт правило Zalando 153: Reset — сколько секунд осталось до сброса окна.
У GitHub тот же заголовок x-ratelimit-reset содержит время сброса в секундах Unix epoch,
поэтому смысл заголовка обязательно описывается в контракте.

Счётчик хранится в памяти процесса: для учебного стенда этого достаточно,
при нескольких экземплярах сервиса счётчик выносят в общее хранилище.
"""

import math
import os
import time

from fastapi import Depends, HTTPException, Response

from app.security import require_writer


class FixedWindowLimiter:
    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._windows: dict[str, tuple[float, int]] = {}

    def reset(self) -> None:
        self._windows.clear()

    def hit(self, client: str) -> tuple[bool, int, int]:
        """Возвращает: разрешён ли запрос, сколько осталось, через сколько секунд сброс."""
        now = time.monotonic()
        started, count = self._windows.get(client, (now, 0))
        if now - started >= self.window_seconds:
            started, count = now, 0
        reset_after = max(1, math.ceil(self.window_seconds - (now - started)))
        if count >= self.limit:
            return False, 0, reset_after
        count += 1
        self._windows[client] = (started, count)
        return True, self.limit - count, reset_after


write_limiter = FixedWindowLimiter(int(os.getenv("API_WRITE_LIMIT_PER_MINUTE", "60")))


def write_rate_limit(response: Response, token: str = Depends(require_writer)) -> str:
    allowed, remaining, reset_after = write_limiter.hit(token)
    headers = {
        "X-RateLimit-Limit": str(write_limiter.limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(reset_after),
    }
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Write limit of {write_limiter.limit} requests per minute exceeded",
            headers={**headers, "Retry-After": str(reset_after)},
        )
    response.headers.update(headers)
    return token
