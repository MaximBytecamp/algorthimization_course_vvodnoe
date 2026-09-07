from pathlib import Path

import pytest

from orders.errors import OrderCannotBeCanceled, OrderNotFound
from orders.service import cancel, create, find
from orders.storage import read_orders


def test_sozdanie_daet_sleduyushchiy_nomer(tmp_path: Path) -> None:
    path = tmp_path / "orders.json"
    create(path, "Лера", [{"name": "кружка", "price": 450, "qty": 1}])
    second = create(path, "Игорь", [{"name": "чайник", "price": 3400, "qty": 1}])
    assert second["id"] == 2


def test_otmena_menyaet_status_i_sohranyaetsya_na_disk(tmp_path: Path) -> None:
    path = tmp_path / "orders.json"
    created = create(path, "Настя", [{"name": "кружка", "price": 450, "qty": 1}])
    cancel(path, created["id"])
    assert read_orders(path)[0]["status"] == "canceled"


def test_uehavshiy_zakaz_otmenit_nelzya(tmp_path: Path) -> None:
    path = tmp_path / "orders.json"
    created = create(path, "Марат", [{"name": "весы", "price": 2100, "qty": 1}])
    created["status"] = "shipped"
    from orders.storage import write_orders

    write_orders(path, [created])
    with pytest.raises(OrderCannotBeCanceled):
        cancel(path, created["id"])


def test_poisk_nesushchestvuyushchego_podnimaet_oshibku() -> None:
    with pytest.raises(OrderNotFound):
        find([], 42)


def test_dorogoy_zakaz_otmenyaet_tolko_menedzher(tmp_path: Path) -> None:
    path = tmp_path / "orders.json"
    created = create(path, "Марат", [{"name": "гриндер", "price": 5900, "qty": 1}])
    with pytest.raises(OrderCannotBeCanceled):
        cancel(path, created["id"])
