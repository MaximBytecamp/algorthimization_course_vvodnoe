"""Набор функций для учебного проекта Text Kit.

Всё лежит в одном файле: строки, числа, проверка данных и даты вперемешку.
Программа работает, но читать и дополнять такой файл тяжело.
"""

from datetime import date


TITLE = "  Отчёт   за март  "
NAME = "Пётр Иванович Смирнов"
SCORES = [5, 4, 5, 3, 5, 4]
MARKS = ["зачёт", "незачёт", "зачёт", "зачёт"]
EMAILS = ["student@college.ru", "не почта"]
PHONES = ["8 (900) 123-45-67", "123"]
PASSWORDS = ["Qwerty12345", "qwerty"]
FIRST_DAY = "02.03.2026"
LAST_DAY = "31.03.2026"


def clean_spaces(text: str) -> str:
    """Убирает лишние пробелы в начале, в конце и внутри строки."""
    return " ".join(text.split())


def average(numbers: list[float]) -> float:
    """Считает среднее значение. Для пустого списка вызывает ValueError."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    return sum(numbers) / len(numbers)


def parse_date(text: str) -> date:
    """Читает дату из строки вида «17.09.2026»."""
    day, month, year = (int(part) for part in text.split("."))
    return date(year, month, day)


def is_email(value: str) -> bool:
    """Проверяет простую правильность адреса почты."""
    value = clean_spaces(value)
    if value.count("@") != 1 or " " in value:
        return False
    name, domain = value.split("@")
    return bool(name) and "." in domain and not domain.startswith(".") and not domain.endswith(".")


def shorten(text: str, limit: int) -> str:
    """Обрезает длинную строку до limit символов и ставит многоточие."""
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def median(numbers: list[float]) -> float:
    """Возвращает срединное значение списка."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def format_date(value: date) -> str:
    """Записывает дату строкой вида «17.09.2026»."""
    return f"{value.day:02d}.{value.month:02d}.{value.year}"


def normalize_phone(value: str) -> str:
    """Приводит номер к виду +7XXXXXXXXXX."""
    digits = "".join(symbol for symbol in value if symbol.isdigit())
    if len(digits) == 11 and digits[0] in "78":
        return "+7" + digits[1:]
    if len(digits) == 10:
        return "+7" + digits
    raise ValueError(f"Непонятный номер: {value}")


def initials(full_name: str) -> str:
    """Превращает «Пётр Иванович Смирнов» в «П. И. Смирнов»."""
    parts = clean_spaces(full_name).split()
    if not parts:
        raise ValueError("Пустое имя")
    surname = parts[-1]
    letters = [part[0].upper() + "." for part in parts[:-1]]
    return " ".join(letters + [surname])


def spread(numbers: list[float]) -> float:
    """Считает разницу между наибольшим и наименьшим значением."""
    if not numbers:
        raise ValueError("Список чисел пуст")
    return max(numbers) - min(numbers)


def is_weekend(value: date) -> bool:
    """Отвечает, выходной ли это день: суббота или воскресенье."""
    return value.weekday() >= 5


def is_phone(value: str) -> bool:
    """Отвечает, получится ли привести номер к единому виду."""
    try:
        normalize_phone(value)
    except ValueError:
        return False
    return True


def slug(text: str) -> str:
    """Делает из заголовка адрес страницы: «Отчёт за март» → «otchet-za-mart»."""
    table = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
        "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
        "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
        "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    result = []
    for symbol in clean_spaces(text).lower():
        if symbol in table:
            result.append(table[symbol])
        elif symbol.isalnum():
            result.append(symbol)
        elif symbol in " -_":
            result.append("-")
    return "-".join(part for part in "".join(result).split("-") if part)


def count_values(items: list) -> dict:
    """Считает, сколько раз встречается каждое значение."""
    result: dict = {}
    for item in items:
        result[item] = result.get(item, 0) + 1
    return result


def days_between(first: date, second: date) -> int:
    """Считает, сколько дней между двумя датами. Порядок дат не важен."""
    return abs((second - first).days)


def password_problems(value: str) -> list[str]:
    """Возвращает список замечаний к паролю. Пустой список — пароль подходит."""
    problems = []
    if len(value) < 8:
        problems.append("короче восьми символов")
    if not any(symbol.isdigit() for symbol in value):
        problems.append("нет ни одной цифры")
    if not any(symbol.isupper() for symbol in value):
        problems.append("нет заглавной буквы")
    return problems


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
