import pytest

from solution import solve


def test_обычный_случай():
    assert solve([...]) == ...


def test_пустой_ввод():
    assert solve([]) is None


def test_один_элемент():
    assert solve([1]) == ...


def test_дубликаты():
    assert solve([2, 2, 2]) == ...


@pytest.mark.parametrize("data, expected", [
    ([], None),
    ([1], ...),
])
def test_границы(data, expected):
    assert solve(data) == expected
