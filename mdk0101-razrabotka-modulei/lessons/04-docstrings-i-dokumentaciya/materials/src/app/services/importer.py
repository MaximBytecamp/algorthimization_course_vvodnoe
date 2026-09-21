"""Потоковое чтение файла смены."""

import csv
from collections.abc import Iterator
from pathlib import Path


def read_rows(path: Path) -> Iterator[dict[str, str]]:
    """Читает CSV-файл построчно, не загружая его целиком в память.

    Args:
        path: Путь к файлу с колонками waiter и kopeks.

    Yields:
        Очередную строку файла в виде словаря «колонка — значение».

    Raises:
        FileNotFoundError: Если файла по указанному пути нет.

    Note:
        Файл остаётся открытым, пока перебор не закончен. Прервав перебор,
        вызывающий код закрывает генератор сам либо использует его внутри
        цикла for до конца.
    """
    with open(path, encoding="utf-8", newline="") as file:
        yield from csv.DictReader(file)
