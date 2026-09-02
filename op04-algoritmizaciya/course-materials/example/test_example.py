import pytest

from solution import max_value


def test_обычный_случай():
    assert max_value([7, 2, 9, 2]) == 9


def test_пустой_список():
    assert max_value([]) is None


def test_один_элемент():
    assert max_value([5]) == 5


def test_все_элементы_равны():
    assert max_value([3, 3, 3]) == 3


def test_отрицательные_числа():
    assert max_value([-7, -2, -9]) == -2


@pytest.mark.parametrize("numbers, expected", [
    ([1, 2, 3], 3),
    ([3, 2, 1], 3),
    ([0], 0),
])
def test_порядок_не_важен(numbers, expected):
    assert max_value(numbers) == expected
