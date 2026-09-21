"""Сборка двух архивов проекта «Отчёт кафе» для темы 04.

    python3 build.py

Исходник один — `src/`, в нём код с докстрингами. Это эталон: те же функции
и те же описания, что разобраны в главах. Стартовый вариант получается из
эталона снятием докстрингов, поэтому код в обоих архивах совпадает строка
в строку и расходиться не может.

На выходе:
    otchet-kafe-bez-tipov.zip      — без аннотаций и описаний: практика по типам
    otchet-kafe-start.zip          — с аннотациями, без описаний: практика
                                     по докстрингам
    otchet-kafe-dokumentirovan.zip — эталон для сверки

Первый архив получается из второго снятием аннотаций, второй — из третьего
снятием докстрингов. Итог практики по типам совпадает со стартом практики
по докстрингам.
"""
import ast
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "src"
BUILD = HERE / "build"

BEZ_TIPOV_README = """# Отчёт кафе — проект без аннотаций типов

Рабочий код без аннотаций и без описаний. Задача первой части темы 04:
расставить аннотации у параметров, результатов и переменных и добиться,
чтобы проверка типов проходила без ошибок.

## Запуск

    python3 -m venv .venv
    source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Отчёт печатается так же, как в проекте с аннотациями: Python их при запуске
не проверяет.

## Проверки

    python -m pytest -v              # 12 тестов
    mypy app                         # сейчас ошибки: функции без аннотаций

## Что оставлено как есть

Поля заказа в app/domain/order.py записаны с аннотациями: это dataclass,
и для него аннотация — объявление поля. Без неё поля не будет.
"""

START_README = """# Отчёт кафе — стартовый проект

Рабочий код без единого описания. Задача темы 04: задокументировать его
в формате Google и добиться, чтобы проверка проходила без замечаний.

## Запуск

    python3 -m venv .venv
    source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Ожидаемый вывод — заголовок со сегодняшней датой, три строки с официантами
(Петрова Анна, Иванов Пётр, Сидоров Илья) и строка с итогом 4 937,50 ₽.

## Проверки

    python -m pytest -v              # 12 тестов
    mypy app                         # типы расставлены, ошибок нет
    ruff check app                   # сейчас 33 замечания: докстрингов нет

## Что в проекте

    app/domain      заказ и смена: объекты предметной области
    app/services    чтение файла, расчёты, запись отчёта
    app/utils       имена, суммы, дата
    app/ui          печать в консоль
    data/smena.csv  файл смены: официант и сумма заказа в копейках
    tests/          проверки расчётов и форматирования
"""

REFERENCE_README = """# Отчёт кафе — задокументированный проект

Тот же код, что в стартовом архиве, с описаниями в формате Google. Каждый
случай из главы 4.4 здесь встречается в рабочем коде: функция без параметров,
значение по умолчанию, возврат None, исключение, изменение аргумента на месте,
генератор, пара значений, работа с файлом, служебное имя с подчёркиванием,
класс, dataclass, модуль и пакет.

## Запуск

    python3 -m venv .venv
    source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

## Проверки

    python -m pytest -v                       # 12 тестов
    python -m doctest app/utils/formatter.py  # примеры из докстринга
    mypy app                                  # типы расставлены, ошибок нет
    ruff check app                            # замечаний нет

## Формат описаний

Google: разделы Args, Returns, Raises, Yields, Attributes. Правила проверки
заданы в pyproject.toml: набор «D» и конвенция google, для папки тестов
правила отключены.

## Как посмотреть описания без редактора

    python -c "import app.services.orders as m; help(m)"
"""


def strip_docstrings(code: str) -> str:
    """Возвращает тот же код без строк документации.

    Узлы находятся разбором кода, а не поиском по тексту: строка в тройных
    кавычках может быть и обычным значением внутри функции, такую трогать
    нельзя.

    Args:
        code: Исходный текст модуля.

    Returns:
        Текст модуля, из которого убраны докстринги модуля, классов
        и функций вместе с пустой строкой после них.
    """
    tree = ast.parse(code)
    lines = code.splitlines()
    drop: set[int] = set()

    for node in ast.walk(tree):
        if not isinstance(node, (ast.Module, ast.ClassDef,
                                 ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        body = getattr(node, "body", [])
        if not body:
            continue
        first = body[0]
        if not (isinstance(first, ast.Expr) and isinstance(first.value, ast.Constant)
                and isinstance(first.value.value, str)):
            continue
        start, end = first.lineno - 1, first.end_lineno - 1
        drop.update(range(start, end + 1))
        # пустая строка сразу после описания больше ничего не отделяет
        if end + 1 < len(lines) and not lines[end + 1].strip():
            drop.add(end + 1)

    kept = [line for number, line in enumerate(lines) if number not in drop]
    text = "\n".join(kept).lstrip("\n")
    return text.rstrip() + "\n"


def strip_annotations(code: str) -> str:
    """Возвращает тот же код без аннотаций у функций и локальных переменных.

    Аннотации убираются по позициям из разбора кода, остальной текст
    остаётся как был: кавычки, переносы, комментарии. Аннотации в теле
    класса не трогаются — у dataclass это объявления полей, и без них
    полей не станет.

    Args:
        code: Исходный текст модуля.

    Returns:
        Текст модуля без аннотаций параметров, результата и переменных
        внутри функций.
    """
    tree = ast.parse(code)
    lines = code.splitlines()
    cuts: dict[int, list[tuple[int, int, bool]]] = {}

    def cut(line: int, start: int, end: int, parameter: bool = False) -> None:
        cuts.setdefault(line, []).append((start, end, parameter))

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            params = node.args
            for arg in [*params.posonlyargs, *params.args, *params.kwonlyargs,
                        params.vararg, params.kwarg]:
                if arg is None or arg.annotation is None:
                    continue
                ann = arg.annotation
                assert arg.lineno == ann.end_lineno, "аннотация на нескольких строках"
                cut(arg.lineno - 1, arg.col_offset + len(arg.arg), ann.end_col_offset,
                    parameter=True)
            if node.returns is not None:
                ret = node.returns
                row = lines[ret.lineno - 1]
                arrow = row.rfind("->", 0, ret.col_offset)
                cut(ret.lineno - 1, arrow - 1, ret.end_col_offset)
            for inner in ast.walk(node):
                if isinstance(inner, ast.AnnAssign) and inner.value is not None:
                    target, ann = inner.target, inner.annotation
                    cut(target.lineno - 1, target.end_col_offset, ann.end_col_offset)

    for number, spans in cuts.items():
        row = lines[number]
        for start, end, parameter in sorted(spans, reverse=True):
            row = row[:start] + row[end:]
            # У параметра без аннотации значение по умолчанию пишется
            # слитно (PEP 8): «top: int = 0» превращается в «top=0».
            if parameter and row[start:start + 3] == " = ":
                row = row[:start] + "=" + row[start + 3:]
        lines[number] = row
    return "\n".join(lines).rstrip() + "\n"


def make_variant(name: str, readme: str, keep_docstrings: bool,
                 keep_annotations: bool = True) -> Path:
    """Собирает один вариант проекта и запаковывает его в архив.

    Args:
        name: Имя папки и архива без расширения.
        readme: Текст файла README.md для этого варианта.
        keep_docstrings: Оставить описания в коде или снять их.
        keep_annotations: Оставить аннотации типов или снять их.

    Returns:
        Путь к собранному архиву.
    """
    target = BUILD / name
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(SRC, target)

    for file in target.rglob("*.py"):
        if file.parts[-2] == "tests":
            continue
        code = file.read_text(encoding="utf-8")
        if not keep_docstrings:
            code = strip_docstrings(code)
        # main.py оставлен с аннотациями: это образец для практики,
        # а проверка «mypy app» его не охватывает.
        if not keep_annotations and file.name != "main.py":
            code = strip_annotations(code)
        file.write_text(code, encoding="utf-8")

    (target / "README.md").write_text(readme, encoding="utf-8")

    archive = HERE / f"{name}.zip"
    if archive.exists():
        archive.unlink()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file in sorted(target.rglob("*")):
            if file.is_file():
                zip_file.write(file, file.relative_to(BUILD))
    return archive


def main() -> None:
    """Собирает оба архива и печатает их размер."""
    BUILD.mkdir(exist_ok=True)
    for name, readme, keep_docs, keep_types in (
        ("otchet-kafe-bez-tipov", BEZ_TIPOV_README, False, False),
        ("otchet-kafe-start", START_README, False, True),
        ("otchet-kafe-dokumentirovan", REFERENCE_README, True, True),
    ):
        archive = make_variant(name, readme, keep_docs, keep_types)
        print(f"  ✓ {archive.name} — {archive.stat().st_size // 1024} КБ")


if __name__ == "__main__":
    main()
