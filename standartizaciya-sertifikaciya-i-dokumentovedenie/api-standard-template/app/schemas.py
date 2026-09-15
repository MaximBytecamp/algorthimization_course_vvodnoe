"""Схемы запросов и ответов Service Desk API.

Для одной сущности заведено несколько моделей: клиент присылает TicketCreate
или TicketUpdate, а сервер отвечает Ticket. Так поля, которые формирует сервер
(id, created_at, updated_at), не попадают в тело запроса.
"""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"


class TicketCreate(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [
                {
                    "title": "Не работает VPN",
                    "description": "Ошибка подключения после обновления клиента",
                }
            ]
        },
    )

    title: str = Field(min_length=3, max_length=120, description="Короткая суть обращения")
    description: str = Field(
        default="", max_length=2000, description="Что делали и что увидели"
    )


class TicketUpdate(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={"examples": [{"status": "closed"}]},
    )

    title: str | None = Field(default=None, min_length=3, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    status: TicketStatus | None = None


class Ticket(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": "8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10",
                    "title": "Не работает VPN",
                    "description": "Ошибка подключения после обновления клиента",
                    "status": "open",
                    "created_at": "2026-09-15T17:30:00Z",
                    "updated_at": "2026-09-15T17:30:00Z",
                }
            ]
        }
    )

    id: UUID
    title: str
    description: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime


class TicketPage(BaseModel):
    items: list[Ticket]
    total: int = Field(description="Сколько обращений подходит под фильтр")
    limit: int
    offset: int


class ProblemDetails(BaseModel):
    """Тело ошибки по RFC 9457."""

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "type": "https://maximbytecamp.github.io/api-standard-template/problems/http-404",
                    "title": "Resource not found",
                    "status": 404,
                    "detail": "Ticket 8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10 does not exist",
                    "instance": "/api/v1/tickets/8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10",
                }
            ]
        }
    )

    type: str = Field(description="URI, который определяет вид проблемы")
    title: str = Field(description="Краткое описание вида проблемы")
    status: int = Field(description="HTTP status code этого ответа")
    detail: str | None = Field(default=None, description="Что случилось в этом запросе")
    instance: str | None = Field(default=None, description="Адрес запроса, где возникла ошибка")
    errors: list[dict[str, Any]] | None = Field(
        default=None, description="Поля, не прошедшие валидацию (только для 422)"
    )
