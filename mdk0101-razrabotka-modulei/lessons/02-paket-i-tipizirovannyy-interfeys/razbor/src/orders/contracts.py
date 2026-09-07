"""Имена типов, которыми разговаривают остальные модули пакета."""

from typing import Literal, TypedDict

type OrderId = int
type Money = int

Status = Literal["new", "packing", "shipped", "delivered", "canceled"]


class Item(TypedDict):
    name: str
    price: Money
    qty: int


class Order(TypedDict):
    id: OrderId
    customer: str
    status: Status
    promo: str | None
    items: list[Item]
    created_at: str
