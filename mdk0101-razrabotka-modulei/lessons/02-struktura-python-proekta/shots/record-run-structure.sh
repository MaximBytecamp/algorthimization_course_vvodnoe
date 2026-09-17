set -u
# Записывает вывод команд для двух снимков главы 2.5:
#   25-tree      — раскладка файлов до и после переноса в пакет;
#   26-two-runs  — две комбинации «форма импорта + команда запуска».
# Результат: /tmp/python-book-structure/log.txt → build-shots-structure.py

BASE=/tmp/python-book-structure
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

# --- состояние после главы 2.4: три файла рядом в корне
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
run s1-before "(.venv) student-tools $" "ls"

# --- состояние после главы 2.5: пакет app с двумя подпакетами
mkdir -p app/services app/utils
touch app/__init__.py app/services/__init__.py app/utils/__init__.py
mv calculator.py app/services/calculator.py
mv formatter.py app/utils/formatter.py
cat > app/main.py <<'PY'
from rich.console import Console

from app.services.calculator import calculate_average
from app.utils.formatter import format_average


def main():
    values = [5, 4, 5, 3, 5]
    average = calculate_average(values)
    console = Console()
    console.print(f"[bold green]{format_average(average)}[/bold green]")


if __name__ == "__main__":
    main()
PY
rm -f main.py
run s2-after "(.venv) student-tools $" "find . -path ./.venv -prune -o -type f -print | sed 's|^\./||' | sort"

# --- две комбинации «импорт + команда»
run s3-root-m "(.venv) student-tools $" "python -m app.main"
run s4-root-file "(.venv) student-tools $" "python app/main.py"

cat > app/main.py <<'PY'
from rich.console import Console

from services.calculator import calculate_average
from utils.formatter import format_average


def main():
    values = [5, 4, 5, 3, 5]
    average = calculate_average(values)
    console = Console()
    console.print(f"[bold green]{format_average(average)}[/bold green]")


if __name__ == "__main__":
    main()
PY
run s5-inside-file "(.venv) student-tools $" "python app/main.py"
run s6-inside-m "(.venv) student-tools $" "python -m app.main"
echo "лог: $LOG"
