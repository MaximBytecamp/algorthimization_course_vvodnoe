"""Точка запуска: показывает работу всех функций набора."""

from app.services.statistics import average, count_values, median, spread
from app.services.validation import is_email, is_phone, normalize_phone, password_problems
from app.utils.dates import days_between, format_date, is_weekend, parse_date
from app.utils.text import clean_spaces, initials, shorten, slug

TITLE = "  Отчёт   за март  "
NAME = "Пётр Иванович Смирнов"
SCORES = [5, 4, 5, 3, 5, 4]
MARKS = ["зачёт", "незачёт", "зачёт", "зачёт"]
EMAILS = ["student@college.ru", "не почта"]
PHONES = ["8 (900) 123-45-67", "123"]
PASSWORDS = ["Qwerty12345", "qwerty"]
FIRST_DAY = "02.03.2026"
LAST_DAY = "31.03.2026"


def main() -> None:
    print("СТРОКИ")
    print("Заголовок:", clean_spaces(TITLE))
    print("Коротко:", shorten(clean_spaces(TITLE), 10))
    print("Инициалы:", initials(NAME))
    print("Адрес страницы:", slug(TITLE))

    print()
    print("ЧИСЛА")
    print("Среднее:", round(average(SCORES), 2))
    print("Медиана:", median(SCORES))
    print("Разброс:", spread(SCORES))
    print("Сколько каких:", count_values(MARKS))

    print()
    print("ПРОВЕРКА ДАННЫХ")
    for value in EMAILS:
        print(f"Почта {value!r}:", "подходит" if is_email(value) else "не подходит")
    for value in PHONES:
        if is_phone(value):
            print(f"Телефон {value!r}:", normalize_phone(value))
        else:
            print(f"Телефон {value!r}: не подходит")
    for value in PASSWORDS:
        problems = password_problems(value)
        print(f"Пароль {value!r}:", "подходит" if not problems else ", ".join(problems))

    print()
    print("ДАТЫ")
    first = parse_date(FIRST_DAY)
    last = parse_date(LAST_DAY)
    print("Начало:", format_date(first), "выходной" if is_weekend(first) else "рабочий день")
    print("Конец:", format_date(last), "выходной" if is_weekend(last) else "рабочий день")
    print("Дней между ними:", days_between(first, last))


if __name__ == "__main__":
    main()
