"""Функции для работы со строками."""


def clean_spaces(text: str) -> str:
    """Убирает лишние пробелы в начале, в конце и внутри строки."""
    return " ".join(text.split())


def shorten(text: str, limit: int) -> str:
    """Обрезает длинную строку до limit символов и ставит многоточие."""
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def initials(full_name: str) -> str:
    """Превращает «Пётр Иванович Смирнов» в «П. И. Смирнов»."""
    parts = clean_spaces(full_name).split()
    if not parts:
        raise ValueError("Пустое имя")
    surname = parts[-1]
    letters = [part[0].upper() + "." for part in parts[:-1]]
    return " ".join(letters + [surname])


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
