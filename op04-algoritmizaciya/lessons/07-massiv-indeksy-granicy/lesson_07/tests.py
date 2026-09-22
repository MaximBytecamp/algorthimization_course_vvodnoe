"""Публичные тесты занятия 7.

Запуск: python -m pytest tests.py -v
Каждый тест проверяет один класс входа; имя теста говорит, какой.
Свои граничные тесты добавляйте в конец файла, в блок «Мои тесты».
"""
import pytest

from solution import max_streak, remove_spam, reverse_segment


# ---------- задача 1: максимальная серия ----------

def test_streak_empty():
    assert max_streak([]) == 0


def test_streak_single_day_reached():
    assert max_streak([10_000]) == 1


def test_streak_single_day_missed():
    assert max_streak([9_999]) == 0


def test_streak_goal_is_inclusive():
    assert max_streak([10_000, 10_000, 9_999, 10_000]) == 2


def test_streak_all_days_reached():
    assert max_streak([12_000, 15_000, 10_500, 11_000]) == 4


def test_streak_best_series_at_the_end():
    assert max_streak([12_000, 3_000, 11_000, 10_500, 10_000]) == 3


def test_streak_best_series_in_the_middle():
    assert max_streak([11_000, 2_000, 13_000, 14_000, 15_000, 1_000, 12_000]) == 3


def test_streak_custom_goal():
    assert max_streak([5, 6, 1, 7, 8, 9], goal=5) == 3


def test_streak_does_not_change_input():
    steps = [12_000, 3_000, 11_000]
    max_streak(steps)
    assert steps == [12_000, 3_000, 11_000]


# ---------- задача 2: разворот участка ----------

def test_reverse_middle_segment():
    tracks = ["A", "B", "C", "D", "E", "F"]
    reverse_segment(tracks, 1, 4)
    assert tracks == ["A", "E", "D", "C", "B", "F"]


def test_reverse_whole_list_even_length():
    tracks = [1, 2, 3, 4]
    reverse_segment(tracks, 0, 3)
    assert tracks == [4, 3, 2, 1]


def test_reverse_whole_list_odd_length():
    tracks = [1, 2, 3, 4, 5]
    reverse_segment(tracks, 0, 4)
    assert tracks == [5, 4, 3, 2, 1]


def test_reverse_one_element_segment():
    tracks = ["A", "B", "C"]
    reverse_segment(tracks, 1, 1)
    assert tracks == ["A", "B", "C"]


def test_reverse_last_two():
    tracks = ["A", "B", "C"]
    reverse_segment(tracks, 1, 2)
    assert tracks == ["A", "C", "B"]


def test_reverse_returns_none_and_keeps_object():
    tracks = [1, 2, 3]
    same = tracks
    assert reverse_segment(tracks, 0, 2) is None
    assert same is tracks and same == [3, 2, 1]


@pytest.mark.parametrize("l, r", [(2, 1), (-1, 2), (0, 3), (3, 3)])
def test_reverse_bad_bounds(l, r):
    tracks = [1, 2, 3]
    with pytest.raises(ValueError):
        reverse_segment(tracks, l, r)
    assert tracks == [1, 2, 3]


def test_reverse_empty_list():
    with pytest.raises(ValueError):
        reverse_segment([], 0, 0)


# ---------- задача 3: удаление на месте ----------

def test_remove_no_spam():
    comments = ["Отличный урок", "Спасибо"]
    assert remove_spam(comments) == 2
    assert comments == ["Отличный урок", "Спасибо"]


def test_remove_two_spam_in_a_row():
    comments = ["Отличный урок", "http://win.ru", "http://prize.ru", "Спасибо"]
    assert remove_spam(comments) == 2
    assert comments == ["Отличный урок", "Спасибо"]


def test_remove_spam_at_both_ends():
    comments = ["https://a.ru", "Вопрос по теме", "Всё понятно", "http://b.ru"]
    assert remove_spam(comments) == 2
    assert comments == ["Вопрос по теме", "Всё понятно"]


def test_remove_all_spam():
    comments = ["http://a.ru", "http://b.ru", "http://c.ru"]
    assert remove_spam(comments) == 0
    assert comments == []


def test_remove_empty():
    comments = []
    assert remove_spam(comments) == 0
    assert comments == []


def test_remove_keeps_order_and_object():
    comments = ["1", "http://x.ru", "2", "http://y.ru", "3", "4"]
    same = comments
    remove_spam(comments)
    assert same is comments
    assert comments == ["1", "2", "3", "4"]


def test_remove_keeps_duplicates():
    comments = ["+", "+", "http://x.ru", "+"]
    assert remove_spam(comments) == 3
    assert comments == ["+", "+", "+"]


# ---------- Мои тесты ----------
# Сюда — тест, который воспроизводит найденную ошибку, и тесты по карточке изменения.
