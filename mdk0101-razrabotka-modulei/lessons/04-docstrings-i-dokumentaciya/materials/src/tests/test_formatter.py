"""Проверки форматирования сумм и заголовков."""

from app.utils.formatter import format_kopeks, format_title


def test_kopeks_to_rubles():
    assert format_kopeks(125000) == "1 250,00 ₽"


def test_zero_kopeks():
    assert format_kopeks(0) == "0,00 ₽"


def test_title_has_given_width():
    assert len(format_title(" Смена ", 40)) == 40
