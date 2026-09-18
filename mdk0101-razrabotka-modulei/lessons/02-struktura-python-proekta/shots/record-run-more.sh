set -u
# Записывает вывод команд для трёх снимков:
#   29-activate-toggle — глава 2.1: какой python отвечает до активации, после неё и после deactivate;
#   30-practice-files  — глава 2.7: что лежит в архиве практики и что будет при запуске до раскладки;
#   31-homework-check  — глава 2.8: ожидаемый результат домашнего задания.
# Результат: /tmp/python-book-more/log.txt → build-shots-more.py

BASE=/tmp/python-book-more
LOG=$BASE/log.txt
PRACTICE=/Users/makarovmn/algorthimization_course_vvodnoe/mdk0101-razrabotka-modulei/lessons/02-struktura-python-proekta/materials/student-tools-practice.zip
rm -rf $BASE; mkdir -p $BASE/student-tools; cd $BASE/student-tools
: > $LOG

run() { # run <id> <prompt-prefix> <command...>
  local id="$1"; local p="$2"; shift 2
  echo "##### $id" >> $LOG
  echo "\$prompt $p" >> $LOG
  echo "\$cmd $*" >> $LOG
  { eval "$@"; } >> $LOG 2>&1
  echo "##### end" >> $LOG
}
export PYTHONIOENCODING=utf-8
export PYTHONDONTWRITEBYTECODE=1
BASEPY=/Users/makarovmn/.pyenv/versions/3.12.12/bin/python3

# --- 2.1: до активации, после активации, после deactivate
$BASEPY -m venv .venv
run m1-before "student-tools $" "which python3 && python3 -c 'import sys; print(sys.prefix != sys.base_prefix)'"
source .venv/bin/activate
run m2-after "(.venv) student-tools $" "which python && python -c 'import sys; print(sys.prefix != sys.base_prefix)'"
deactivate
run m3-off "student-tools $" "which python3 && python3 -c 'import sys; print(sys.prefix != sys.base_prefix)'"
source .venv/bin/activate
python -m pip install -q rich==13.9.4

# --- 2.7: что в архиве практики и что будет при запуске до раскладки
mkdir -p $BASE/praktika && cd $BASE/praktika
unzip -q "$PRACTICE"
cd student-tools-practice
run m4-files "student-tools-practice $" "ls"
run m5-early "student-tools-practice $" "python 'запуск final.py'"

# --- 2.8: ожидаемый результат домашнего задания
mkdir -p $BASE/lesson_02/app/services $BASE/lesson_02/app/utils $BASE/lesson_02/tests
cd $BASE/lesson_02
touch app/__init__.py app/services/__init__.py app/utils/__init__.py
cat > app/services/calculator.py <<'PY'
def calculate_average(values: list[int]) -> float:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return sum(values) / len(values)


def calculate_min(values: list[int]) -> int:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return min(values)


def calculate_max(values: list[int]) -> int:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return max(values)
PY
cat > app/utils/formatter.py <<'PY'
def format_average(value: float) -> str:
    return f"Средний результат: {value:.2f}"


def format_report(average: float, minimum: int, maximum: int) -> str:
    return (
        f"Средний результат: {average:.2f}\n"
        f"Минимальная оценка: {minimum}\n"
        f"Максимальная оценка: {maximum}"
    )
PY
cat > app/main.py <<'PY'
from rich.console import Console

from app.services.calculator import calculate_average, calculate_max, calculate_min
from app.utils.formatter import format_report


def main():
    values = [5, 4, 5, 3, 5]
    report = format_report(
        calculate_average(values), calculate_min(values), calculate_max(values)
    )
    Console().print(f"[bold green]{report}[/bold green]")


if __name__ == "__main__":
    main()
PY
cat > tests/test_calculator.py <<'PY'
import unittest

from app.services.calculator import calculate_average, calculate_max, calculate_min
from app.utils.formatter import format_average

VALUES = [5, 4, 5, 3, 5]


class AverageTests(unittest.TestCase):
    def test_average(self):
        self.assertAlmostEqual(calculate_average(VALUES), 4.4)

    def test_average_empty(self):
        with self.assertRaises(ValueError):
            calculate_average([])

    def test_format(self):
        self.assertEqual(format_average(4.4), "Средний результат: 4.40")

    def test_min(self):
        self.assertEqual(calculate_min(VALUES), 3)

    def test_min_empty(self):
        with self.assertRaises(ValueError):
            calculate_min([])

    def test_max(self):
        self.assertEqual(calculate_max(VALUES), 5)

    def test_max_empty(self):
        with self.assertRaises(ValueError):
            calculate_max([])
PY
source $BASE/student-tools/.venv/bin/activate
run m6-hw-run "(.venv) lesson_02 $" "python -m app.main"
run m7-hw-tests "(.venv) lesson_02 $" "python -m unittest discover -s tests -v 2>&1 | tail -12"
echo "лог: $LOG"
