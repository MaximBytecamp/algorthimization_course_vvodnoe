"""Хранилище обращений в памяти процесса.

Учебному стенду база данных не нужна: контракт API от способа хранения
не зависит. После перезапуска сервера остаются только три демонстрационных
обращения.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas import Ticket, TicketCreate, TicketStatus, TicketUpdate

DEMO_TICKETS = [
    ("Не работает VPN", "Ошибка подключения после обновления клиента", TicketStatus.open),
    ("Принтер печатает пустые листы", "Кабинет 312, модель HP LaserJet", TicketStatus.in_progress),
    ("Нужен доступ к репозиторию", "Проект service-desk, роль developer", TicketStatus.closed),
]


class TicketRepository:
    def __init__(self) -> None:
        self._items: dict[UUID, Ticket] = {}

    def reset(self, with_demo_data: bool = True) -> None:
        self._items.clear()
        if with_demo_data:
            for title, description, status in DEMO_TICKETS:
                ticket = self.add(TicketCreate(title=title, description=description))
                self._items[ticket.id] = ticket.model_copy(update={"status": status})

    def list(self, status: TicketStatus | None, limit: int, offset: int) -> tuple[list[Ticket], int]:
        items = [t for t in self._items.values() if status is None or t.status == status]
        return items[offset : offset + limit], len(items)

    def add(self, data: TicketCreate) -> Ticket:
        now = datetime.now(timezone.utc)
        ticket = Ticket(
            id=uuid4(),
            title=data.title,
            description=data.description,
            status=TicketStatus.open,
            created_at=now,
            updated_at=now,
        )
        self._items[ticket.id] = ticket
        return ticket

    def get(self, ticket_id: UUID) -> Ticket | None:
        return self._items.get(ticket_id)

    def update(self, ticket_id: UUID, data: TicketUpdate) -> Ticket | None:
        ticket = self._items.get(ticket_id)
        if ticket is None:
            return None
        changes = data.model_dump(exclude_unset=True)
        changes["updated_at"] = datetime.now(timezone.utc)
        ticket = ticket.model_copy(update=changes)
        self._items[ticket_id] = ticket
        return ticket

    def delete(self, ticket_id: UUID) -> bool:
        return self._items.pop(ticket_id, None) is not None


repository = TicketRepository()
repository.reset()
