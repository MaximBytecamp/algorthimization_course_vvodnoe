import pytest

from orders.contracts import Order
from orders.pricing import delivery, discount, total


def order(price: int, qty: int = 1, promo: str | None = None) -> Order:
    return {
        "id": 1,
        "customer": "тест",
        "status": "new",
        "promo": promo,
        "items": [{"name": "товар", "price": price, "qty": qty}],
        "created_at": "2026-09-07T00:00:00",
    }


def test_dobavlyaem_dostavku_kogda_summa_menshe_poroga() -> None:
    assert total(order(1490)) == 1490 + 199


def test_dostavka_besplatna_rovno_na_poroge() -> None:
    assert delivery(order(1500)) == 0


def test_skidka_schitaetsya_v_rublyah_i_ostaetsya_celym() -> None:
    assert discount(order(3400, promo="WELCOME")) == 340


def test_neizvestnyy_promokod_ne_daet_skidki() -> None:
    assert discount(order(1000, promo="HALYAVA")) == 0


@pytest.mark.parametrize("promo", [None, "WELCOME"])
def test_itog_vsegda_celoe_chislo(promo: str | None) -> None:
    assert isinstance(total(order(2750, promo=promo)), int)
