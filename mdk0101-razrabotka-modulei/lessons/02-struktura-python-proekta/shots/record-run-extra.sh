set -u
# Записывает вывод команд для двух снимков:
#   27-split-run  — глава 2.4: три файла в корне, запуск даёт прежний результат;
#   28-git-status — глава 2.6: git status до и после .gitignore.
# Результат: /tmp/python-book-extra/log.txt → build-shots-extra.py

BASE=/tmp/python-book-extra
LOG=$BASE/log.txt
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
$BASEPY -m venv .venv
source .venv/bin/activate
python -m pip install -q rich==13.9.4

# --- глава 2.4: один файл стал тремя
cat > calculator.py <<'PY'
def calculate_average(values: list[int]) -> float:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return sum(values) / len(values)
PY
cat > formatter.py <<'PY'
def format_average(value: float) -> str:
    return f"Средний результат: {value:.2f}"
PY
cat > main.py <<'PY'
from rich.console import Console

from calculator import calculate_average
from formatter import format_average


def main():
    values = [5, 4, 5, 3, 5]
    average = calculate_average(values)
    console = Console()
    console.print(f"[bold green]{format_average(average)}[/bold green]")


if __name__ == "__main__":
    main()
PY
run e1-files "(.venv) student-tools $" "ls"
run e2-run "(.venv) student-tools $" "python main.py"

# --- глава 2.6: что Git видит до и после .gitignore
mkdir -p app/services app/utils tests
touch app/__init__.py app/services/__init__.py app/utils/__init__.py
mv calculator.py app/services/calculator.py
mv formatter.py app/utils/formatter.py
mv main.py app/main.py
cat > tests/test_calculator.py <<'PY'
import unittest
PY
echo "# Student Tools" > README.md
python -m pip freeze > requirements.txt
mkdir -p app/__pycache__ && echo "кеш" > app/__pycache__/main.cpython-312.pyc
echo "TOKEN=local" > .env
git init -q
git config user.email "student@example.com"
git config user.name "Student"
run e3-before "(.venv) student-tools $" "git status --short"
run e3-inside "(.venv) student-tools $" "git status --short --untracked-files=all -- app"
cat > .gitignore <<'EOF'
.venv/
__pycache__/
*.pyc
.env
EOF
run e4-after "(.venv) student-tools $" "git status --short"
run e4-inside "(.venv) student-tools $" "git status --short --untracked-files=all -- app"
echo "лог: $LOG"
