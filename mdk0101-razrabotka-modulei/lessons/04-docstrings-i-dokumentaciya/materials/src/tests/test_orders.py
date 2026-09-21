"""Проверки расчётов по заказам."""

import pytest

from app.domain.order import Order
from app.services.orders import revenue_by_waiter, sort_orders_in_place


def test_revenue_groups_by_waiter():
    orders = [Order("иванов пётр", 100), Order("ИВАНОВ ПЁТР", 250)]
    assert revenue_by_waiter(orders) == {"Иванов Пётр": 350}


def test_revenue_sorts_by_sum():
    orders = [Order("Иванов Пётр", 100), Order("Петрова Анна", 900)]
    assert list(revenue_by_waiter(orders)) == ["Петрова Анна", "Иванов Пётр"]


def test_revenue_empty_raises():
    with pytest.raises(ValueError):
        revenue_by_waiter([])


def test_negative_order_raises():
    with pytest.raises(ValueError):
        Order("Иванов Пётр", -1)


def test_sort_in_place_changes_caller_list():
    orders = [Order("Иванов Пётр", 100), Order("Петрова Анна", 900)]
    sort_orders_in_place(orders)
    assert orders[0].kopeks == 900
