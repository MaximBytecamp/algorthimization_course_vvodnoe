"""Операции над ресурсом Ticket: /api/v1/tickets."""

import hashlib
from datetime import datetime, timezone
from email.utils import format_datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response

from app.idempotency import idempotency_store
from app.limits import write_rate_limit
from app.schemas import Ticket, TicketCreate, TicketPage, TicketStatus, TicketUpdate
from app.storage import repository

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# Операция GET /tickets/open устарела: вместо неё GET /tickets?status=open.
OPEN_TICKETS_DEPRECATED_AT = datetime(2026, 9, 16, tzinfo=timezone.utc)
OPEN_TICKETS_SUNSET_AT = datetime(2027, 3, 1, tzinfo=timezone.utc)

NOT_FOUND = {404: {"description": "Обращение с таким ticket_id не существует"}}
AUTH = {
    401: {"description": "Нет Bearer token или токен неизвестен"},
    403: {"description": "Токен известен, но изменять обращения ему запрещено"},
}
RATE_LIMIT_HEADERS = {
    "X-RateLimit-Limit": {"description": "Сколько операций записи разрешено за минуту", "schema": {"type": "integer"}},
    "X-RateLimit-Remaining": {"description": "Сколько операций записи осталось в текущем окне", "schema": {"type": "integer"}},
    "X-RateLimit-Reset": {"description": "Через сколько секунд окно сбросится", "schema": {"type": "integer"}},
}
RATE_LIMITED = {
    429: {
        "description": "Превышен лимит операций записи",
        "headers": {
            "Retry-After": {"description": "Через сколько секунд можно повторить запрос", "schema": {"type": "integer"}},
            **RATE_LIMIT_HEADERS,
        },
    }
}
ETAG_HEADER = {"ETag": {"description": "Версия представления обращения", "schema": {"type": "string", "example": '"5d41402abc4b2a76"'}}}


def get_or_404(ticket_id: UUID) -> Ticket:
    ticket = repository.get(ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} does not exist")
    return ticket


def etag_for(ticket: Ticket) -> str:
    return '"%s"' % hashlib.sha256(ticket.model_dump_json().encode()).hexdigest()[:16]


def etag_matches(header: str, etag: str, weak: bool) -> bool:
    values = [value.strip() for value in header.split(",")]
    if "*" in values:
        return True
    if weak:
        values = [value.removeprefix("W/") for value in values]
    return etag in values


@router.get(
    "",
    response_model=TicketPage,
    summary="Получить список обращений",
    description="Возвращает страницу обращений. Размер страницы ограничен параметром limit.",
    operation_id="listTickets",
)
def list_tickets(
    status_filter: TicketStatus | None = Query(None, alias="status", description="Показать только обращения с этим статусом"),
    limit: int = Query(20, ge=1, le=100, description="Сколько обращений вернуть, от 1 до 100"),
    offset: int = Query(0, ge=0, description="Сколько обращений пропустить от начала выборки"),
) -> TicketPage:
    items, total = repository.list(status_filter, limit, offset)
    return TicketPage(items=items, total=total, limit=limit, offset=offset)


@router.get(
    "/open",
    response_model=TicketPage,
    deprecated=True,
    summary="Получить открытые обращения (устарело)",
    description=(
        "Устарело с 16.09.2026, будет отключено 01.03.2027. "
        "Используйте GET /api/v1/tickets?status=open. "
        "Ответ содержит заголовки Deprecation (RFC 9745) и Sunset (RFC 8594)."
    ),
    operation_id="listOpenTickets",
    responses={
        200: {
            "description": "Открытые обращения",
            "headers": {
                "Deprecation": {"description": "Когда операция признана устаревшей, дата в формате @секунды Unix", "schema": {"type": "string", "example": "@1789516800"}},
                "Sunset": {"description": "Когда операция перестанет отвечать, HTTP-date", "schema": {"type": "string", "example": "Mon, 01 Mar 2027 00:00:00 GMT"}},
            },
        }
    },
)
def list_open_tickets(
    response: Response,
    limit: int = Query(20, ge=1, le=100, description="Сколько обращений вернуть, от 1 до 100"),
    offset: int = Query(0, ge=0, description="Сколько обращений пропустить от начала выборки"),
) -> TicketPage:
    response.headers["Deprecation"] = f"@{int(OPEN_TICKETS_DEPRECATED_AT.timestamp())}"
    response.headers["Sunset"] = format_datetime(OPEN_TICKETS_SUNSET_AT, usegmt=True)
    items, total = repository.list(TicketStatus.open, limit, offset)
    return TicketPage(items=items, total=total, limit=limit, offset=offset)


@router.post(
    "",
    response_model=Ticket,
    status_code=201,
    summary="Создать обращение",
    description=(
        "Регистрирует новое обращение со статусом open. Идентификатор формирует сервер. "
        "Повтор запроса с тем же Idempotency-Key и тем же телом не создаёт второе обращение."
    ),
    operation_id="createTicket",
    responses={
        201: {
            "description": "Обращение создано",
            "headers": {
                "Location": {
                    "description": "Адрес созданного обращения",
                    "schema": {"type": "string", "example": "/api/v1/tickets/8d45c3e2-7f1a-4c55-9a39-2b1f0e6d4a10"},
                },
                **ETAG_HEADER,
                **RATE_LIMIT_HEADERS,
            },
        },
        **AUTH,
        422: {"description": "Тело не соответствует схеме или Idempotency-Key уже использован с другим телом"},
        **RATE_LIMITED,
    },
)
def create_ticket(
    data: TicketCreate,
    response: Response,
    token: str = Depends(write_rate_limit),
    idempotency_key: str | None = Header(
        None,
        alias="Idempotency-Key",
        max_length=255,
        description="Уникальный ключ запроса. Повтор с тем же ключом и телом вернёт первый результат",
    ),
) -> Ticket:
    fingerprint = hashlib.sha256(data.model_dump_json().encode()).hexdigest()
    if idempotency_key:
        saved = idempotency_store.get(token, idempotency_key)
        if saved and saved.fingerprint != fingerprint:
            raise HTTPException(status_code=422, detail="Idempotency-Key was already used with a different request body")
        if saved:
            response.headers["Location"] = f"/api/v1/tickets/{saved.ticket.id}"
            response.headers["ETag"] = etag_for(saved.ticket)
            return saved.ticket
    ticket = repository.add(data)
    if idempotency_key:
        idempotency_store.save(token, idempotency_key, fingerprint, ticket)
    response.headers["Location"] = f"/api/v1/tickets/{ticket.id}"
    response.headers["ETag"] = etag_for(ticket)
    return ticket


@router.get(
    "/{ticket_id}",
    response_model=Ticket,
    summary="Получить обращение",
    description="Возвращает одно обращение. Если If-None-Match совпадает с текущим ETag, сервер отвечает 304 без тела.",
    operation_id="getTicket",
    responses={
        200: {"description": "Обращение", "headers": ETAG_HEADER},
        304: {"description": "Представление не изменилось с версии из If-None-Match", "headers": ETAG_HEADER},
        **NOT_FOUND,
    },
)
def get_ticket(
    ticket_id: UUID,
    response: Response,
    if_none_match: str | None = Header(None, alias="If-None-Match", description="ETag, полученный ранее"),
) -> Ticket | Response:
    ticket = get_or_404(ticket_id)
    etag = etag_for(ticket)
    if if_none_match and etag_matches(if_none_match, etag, weak=True):
        return Response(status_code=304, headers={"ETag": etag})
    response.headers["ETag"] = etag
    return ticket


@router.patch(
    "/{ticket_id}",
    response_model=Ticket,
    summary="Изменить обращение",
    description=(
        "Меняет только переданные поля. Если передан If-Match и обращение за это время изменилось, "
        "сервер отвечает 412 и ничего не меняет."
    ),
    operation_id="updateTicket",
    responses={
        200: {"description": "Обращение изменено", "headers": {**ETAG_HEADER, **RATE_LIMIT_HEADERS}},
        **AUTH,
        **NOT_FOUND,
        412: {"description": "ETag из If-Match не совпадает с текущей версией обращения"},
        **RATE_LIMITED,
    },
)
def update_ticket(
    ticket_id: UUID,
    data: TicketUpdate,
    response: Response,
    _: str = Depends(write_rate_limit),
    if_match: str | None = Header(None, alias="If-Match", description="ETag версии, которую клиент видел перед изменением"),
) -> Ticket:
    ticket = get_or_404(ticket_id)
    if if_match is not None and not etag_matches(if_match, etag_for(ticket), weak=False):
        raise HTTPException(status_code=412, detail="Ticket was changed after the version in If-Match was read")
    updated = repository.update(ticket_id, data)
    response.headers["ETag"] = etag_for(updated)
    return updated


@router.delete(
    "/{ticket_id}",
    status_code=204,
    response_class=Response,
    summary="Удалить обращение",
    description="Удаляет обращение. Успешный ответ не содержит тела.",
    operation_id="deleteTicket",
    responses={204: {"description": "Обращение удалено", "headers": RATE_LIMIT_HEADERS}, **AUTH, **NOT_FOUND, **RATE_LIMITED},
)
def delete_ticket(ticket_id: UUID, response: Response, _: str = Depends(write_rate_limit)) -> Response:
    get_or_404(ticket_id)
    repository.delete(ticket_id)
    response.status_code = 204
    return response
