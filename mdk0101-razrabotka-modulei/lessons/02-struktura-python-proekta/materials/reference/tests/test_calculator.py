import pytest

from app.services.calculator import calculate_average
from app.utils.formatter import format_average


def test_average():
    assert calculate_average([5, 4, 5, 3, 5]) == pytest.approx(4.4)


def test_format():
    assert format_average(4.4) == "Средний результат: 4.40"


def test_empty_list():
    with pytest.raises(ValueError):
        calculate_average([])
