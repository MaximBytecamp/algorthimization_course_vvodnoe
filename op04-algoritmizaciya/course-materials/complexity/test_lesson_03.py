"""Автопроверка разметки сложности · занятие 3.

Тест сверяет отпечаток вашего ответа с отпечатком верного. Самих оценок
здесь нет: по строке из шестнадцати символов восстановить «O(n log n)»
нельзя, а посчитать отпечаток для каждого из шести вариантов и подобрать
ответ — это ровно та работа, которую проще сделать честно.

Запуск из корня репозитория:

    pytest course-materials/complexity/test_lesson_03.py -q

Каждый фрагмент — отдельная строка отчёта, поэтому видно не «12 ошибок»,
а какие именно оценки не сошлись.
"""
import hashlib
import re

import pytest

import answers

CANONICAL = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n + m)"]


def normalize(text):
    """Приводит запись оценки к одному виду: регистр, пробелы, степень."""
    text = text.lower().replace("²", "^2").replace("**", "^")
    return re.sub(r"\s+", "", text)


def fingerprint(key, value):
    return hashlib.sha256(f"{key}|{normalize(value)}".encode()).hexdigest()[:16]


TIME_FINGERPRINT = {
    "01_find_pass": "1e7d132c4365d7ef",
    "02_first_and_last": "ba5c2812e956c6d4",
    "03_has_duplicate_badges": "79465b15c9acb63b",
    "04_has_duplicate_badges_fast": "239c4932558cc002",
    "05_three_cheapest": "40622025f41d83fe",
    "06_find_receipt": "0ad233afd3a0c2e9",
    "07_average_and_spikes": "761bce45e182c9c9",
    "08_closest_pair_distance": "12ae53641d2dd6f0",
    "09_word_counts": "a610924690048054",
    "10_unique_keep_order": "096b964f01c0d090",
    "11_halving_steps": "868870732b9cd877",
    "12_merge_sorted": "98b82394080bd761",
}

SPACE_FINGERPRINT = {
    "01_find_pass": "704d069369743eed",
    "02_first_and_last": "b2984156427e56d1",
    "03_has_duplicate_badges": "0575a42db3893ef9",
    "04_has_duplicate_badges_fast": "69d64ce5476dc982",
    "05_three_cheapest": "1280f03596a4bc26",
    "06_find_receipt": "bd1e816058c8a91c",
    "07_average_and_spikes": "f1d064c38957b98f",
    "08_closest_pair_distance": "06f566bef805c6f4",
    "09_word_counts": "35d097f2933846dc",
    "10_unique_keep_order": "f87f984a036a6516",
    "11_halving_steps": "6f98aed1ebcbf9fc",
    "12_merge_sorted": "f8dc74e7b0d1d2db",
}


def check(kind, key, given, expected):
    if not given.strip():
        pytest.fail(f"{key}: {kind} не заполнено")
    if normalize(given) not in {normalize(c) for c in CANONICAL}:
        pytest.fail(
            f"{key}: запись «{given}» не из списка. Допустимые: "
            + ", ".join(CANONICAL)
            + ". Константы и младшие слагаемые в оценке не пишутся."
        )
    if fingerprint(f"{key}|{'t' if kind == 'время' else 's'}", given) != expected:
        pytest.fail(f"{key}: {kind} — «{given}» неверно. Посчитайте операции на n = 8 и n = 16")


@pytest.mark.parametrize("key", sorted(TIME_FINGERPRINT))
def test_time(key):
    check("время", key, answers.TIME[key], TIME_FINGERPRINT[key])


@pytest.mark.parametrize("key", sorted(SPACE_FINGERPRINT))
def test_space(key):
    check("память", key, answers.SPACE[key], SPACE_FINGERPRINT[key])


@pytest.mark.parametrize("key", sorted(answers.WORST_CASE))
def test_worst_case(key):
    """Худший случай проверяет преподаватель, тест следит за длиной ответа."""
    text = answers.WORST_CASE[key].strip()
    if not text:
        pytest.fail(f"{key}: худший случай не описан")
    assert len(text) >= 25, f"{key}: одной фразы мало — назовите вход и причину"
