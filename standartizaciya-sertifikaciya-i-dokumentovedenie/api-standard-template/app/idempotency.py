"""Ключ идемпотентности для POST /tickets.

POST не идемпотентен: если ответ потерялся из-за сети и клиент повторил запрос,
появится второе обращение. Клиент может передать заголовок Idempotency-Key.
Сервер запоминает ключ, отпечаток тела и результат на 24 часа:

- тот же ключ и то же тело — сервер возвращает сохранённый результат и ничего не создаёт;
- тот же ключ и другое тело — 422, ключ уже занят другим запросом.

Ключи разделены по токенам: один клиент не может получить чужой результат.
Источники — docs/STANDARDS.md, раздел «Ключ идемпотентности».
"""

import time
from dataclasses import dataclass

from app.schemas import Ticket

TTL_SECONDS = 24 * 60 * 60


@dataclass
class SavedResult:
    fingerprint: str
    ticket: Ticket
    saved_at: float


class IdempotencyStore:
    def __init__(self) -> None:
        self._items: dict[tuple[str, str], SavedResult] = {}

    def reset(self) -> None:
        self._items.clear()

    def get(self, client: str, key: str) -> SavedResult | None:
        saved = self._items.get((client, key))
        if saved and time.monotonic() - saved.saved_at > TTL_SECONDS:
            del self._items[(client, key)]
            return None
        return saved

    def save(self, client: str, key: str, fingerprint: str, ticket: Ticket) -> None:
        self._items[(client, key)] = SavedResult(fingerprint, ticket, time.monotonic())


idempotency_store = IdempotencyStore()
