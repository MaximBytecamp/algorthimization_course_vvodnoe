"""Запись готового отчёта в файл."""

from pathlib import Path


def save_report(path: Path, lines: list[str]) -> int:
    """Записывает отчёт в текстовый файл в кодировке UTF-8.

    Args:
        path: Путь к файлу. Существующий файл перезаписывается,
            родительская папка должна существовать.
        lines: Строки отчёта без символов перевода строки на концах.

    Returns:
        Количество записанных строк.

    Raises:
        FileNotFoundError: Если родительской папки нет.
        PermissionError: Если на запись в эту папку нет прав.
    """
    with open(path, "w", encoding="utf-8") as file:
        file.write("\n".join(lines))
    return len(lines)
