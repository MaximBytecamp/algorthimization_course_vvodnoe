"""Автопроверка измерительного контура · занятие 4.

Тест проверяет не совпадение чисел — они у каждого свои, — а устройство
контура. Проверяется поведение: сколько раз вызвано решение, что попало
внутрь границы, сколько сырых значений вернулось из серии.

Запуск из корня репозитория:

    pytest course-materials/benchmarks/test_lesson_04.py -q

Числа времени в тестах намеренно свободные: на медленной машине контур
тоже обязан быть правильным. Проверяется соотношение величин, а не
абсолютные микросекунды.
"""
import statistics

import pytest

import contour

N = 4000


def make_spy():
    """Считает вызовы и запоминает длину входа каждого вызова."""
    calls = []

    def spy(registry, incoming):
        calls.append(len(registry))
        return len(registry)

    return spy, calls


def test_make_data_deterministic():
    """Один seed — одни данные. Иначе решения сравниваются на разных входах."""
    first = contour.make_data(1000, seed=1)
    second = contour.make_data(1000, seed=1)
    assert first == second


def test_make_data_shape():
    registry, incoming = contour.make_data(500)
    assert len(registry) == len(incoming) == 500
    assert all(isinstance(value, int) for value in registry[:10])


def test_series_returns_raw_samples():
    """Из серии возвращаются сырые значения, по одному на повтор."""
    registry, incoming = contour.make_data(200)
    samples = contour.series(lambda a, b: None, registry, incoming, repeats=9)
    assert isinstance(samples, list)
    assert len(samples) == 9
    assert all(value >= 0 for value in samples)


def test_series_warms_up_once():
    """Прогрев обязателен и ровно один: всего repeats + 1 вызовов."""
    registry, incoming = contour.make_data(200)
    spy, calls = make_spy()
    contour.series(spy, registry, incoming, repeats=7)
    assert len(calls) == 8, (
        f"решение вызвано {len(calls)} раз; ожидалось 7 повторов плюс один прогрев"
    )
    assert calls[0] < calls[1], "прогрев делается на коротком входе, а не на полном"


def test_generation_is_outside_the_boundary():
    """Генерация данных не попадает внутрь измеряемого участка.

    Пустое решение на входе n = 4000 обязано измеряться в единицы
    микросекунд. Генерация тех же данных стоит около тысячи микросекунд,
    поэтому её попадание в границу видно сразу.
    """
    registry, incoming = contour.make_data(N)
    empty = min(contour.series(lambda a, b: None, registry, incoming, repeats=7))
    generation = min(contour.series(lambda a, b: contour.make_data(N),
                                    registry, incoming, repeats=3))
    assert empty * 20 < generation, (
        f"пустое решение измерено как {empty:.1f} мкс при цене генерации "
        f"{generation:.1f} мкс — похоже, подготовка данных внутри границы"
    )


def test_summarize_keys_and_order():
    samples = [12.0, 10.0, 11.0, 30.0]
    stats = contour.summarize(samples)
    for key in ("min", "median", "mean", "max", "spread"):
        assert key in stats, f"в агрегате нет ключа {key}"
    assert stats["min"] == 10.0
    assert stats["max"] == 30.0
    assert stats["median"] == statistics.median(samples)
    assert stats["min"] <= stats["median"] <= stats["max"]
    assert stats["spread"] == pytest.approx(3.0)


def test_measured_solutions_keep_their_order():
    """Контур обязан различать два решения на достаточно большом входе."""
    from lab import match_list, match_set

    registry, incoming = contour.make_data(2000)
    slow = min(contour.series(match_list, registry, incoming, repeats=5))
    fast = min(contour.series(match_set, registry, incoming, repeats=5))
    assert fast * 10 < slow, (
        f"сверка по множеству измерена как {fast:.1f} мкс, по списку — "
        f"{slow:.1f} мкс; при n = 2000 разница обязана быть в разы"
    )
