"""Проверка данных, которые вводит человек."""

from app.utils.text import clean_spaces


def is_email(value: str) -> bool:
    """Проверяет простую правильность адреса почты."""
    value = clean_spaces(value)
    if value.count("@") != 1 or " " in value:
        return False
    name, domain = value.split("@")
    return bool(name) and "." in domain and not domain.startswith(".") and not domain.endswith(".")


def normalize_phone(value: str) -> str:
    """Приводит номер к виду +7XXXXXXXXXX."""
    digits = "".join(symbol for symbol in value if symbol.isdigit())
    if len(digits) == 11 and digits[0] in "78":
        return "+7" + digits[1:]
    if len(digits) == 10:
        return "+7" + digits
    raise ValueError(f"Непонятный номер: {value}")


def is_phone(value: str) -> bool:
    """Отвечает, получится ли привести номер к единому виду."""
    try:
        normalize_phone(value)
    except ValueError:
        return False
    return True


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
