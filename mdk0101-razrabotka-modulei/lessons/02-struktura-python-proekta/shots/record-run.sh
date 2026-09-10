set -u
REF=/Users/makarovmn/algorthimization_course_vvodnoe/mdk0101-razrabotka-modulei/lessons/02-struktura-python-proekta/materials/reference
BASE=/tmp/python-book-evidence
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
BASEPY=/Users/makarovmn/.pyenv/versions/3.12.12/bin/python3

# --- 2.1
run p1-version "student-tools $" "$BASEPY --version"
run p1-create "student-tools $" "$BASEPY -m venv .venv"
run p1-inside "student-tools $" "ls .venv && echo '' && cat .venv/pyvenv.cfg"
run p1-before "student-tools $" "$BASEPY -c 'import sys; print(sys.executable); print(sys.prefix != sys.base_prefix)'"
source .venv/bin/activate
run p1-after "(.venv) student-tools $" "which python && python --version && python -c 'import sys; print(sys.executable); print(sys.prefix != sys.base_prefix)'"
run p1-list "(.venv) student-tools $" "python -m pip list"

# --- 2.3
run p3-missing "(.venv) student-tools $" "python -c 'import rich'"
run p3-install "(.venv) student-tools $" "python -m pip install rich==13.9.4"
run p3-show "(.venv) student-tools $" "python -m pip show rich"
run p3-which-pip "(.venv) student-tools $" "python -m pip --version"
cp $REF/app/main.py /tmp/keep-main.py
cat > main.py <<'PY'
from rich.console import Console


def calculate_average(values: list[int]) -> float:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return sum(values) / len(values)


def format_average(value: float) -> str:
    return f"Средний результат: {value:.2f}"


def main():
    values = [5, 4, 5, 3, 5]
    average = calculate_average(values)
    console = Console()
    console.print(f"[bold green]{format_average(average)}[/bold green]")


if __name__ == "__main__":
    main()
PY
run p3-run "(.venv) student-tools $" "FORCE_COLOR=1 python main.py"
deactivate
run p3-off "student-tools $" "which python3 && python3 -c 'import sys; print(sys.executable)' && python3 -m pip show rich"
source .venv/bin/activate

# --- 2.5
mkdir -p app/services app/utils tests
cp $REF/app/__init__.py app/__init__.py
cp $REF/app/main.py app/main.py
cp $REF/app/services/__init__.py app/services/__init__.py
cp $REF/app/services/calculator.py app/services/calculator.py
cp $REF/app/utils/__init__.py app/utils/__init__.py
cp $REF/app/utils/formatter.py app/utils/formatter.py
cp $REF/tests/test_calculator.py tests/test_calculator.py
cp $REF/.gitignore .gitignore
rm main.py
run p5-wrong "(.venv) student-tools $" "python app/main.py"
run p5-run "(.venv) student-tools $" "FORCE_COLOR=1 python -m app.main"
run p5-cache "(.venv) student-tools $" "find app -name '__pycache__' -maxdepth 3 | sort"

# --- 2.6
run p6-freeze "(.venv) student-tools $" "python -m pip freeze"
run p6-freeze-file "(.venv) student-tools $" "python -m pip freeze > requirements.txt && cat requirements.txt"
run p6-tests "(.venv) student-tools $" "python -m unittest discover -s tests -v"
deactivate

# clean start: new folder from sources only
mkdir -p $BASE/clean/student-tools
cd $BASE/clean/student-tools
cp -R $BASE/student-tools/app $BASE/student-tools/tests $BASE/student-tools/requirements.txt $BASE/student-tools/.gitignore .
find . -name __pycache__ -type d -exec rm -rf {} + 2>/dev/null
run p6-clean-tree "student-tools $" "ls -a"
run p6-clean-fail "student-tools $" "$BASEPY -m app.main"
run p6-clean-venv "student-tools $" "$BASEPY -m venv .venv"
source .venv/bin/activate
run p6-clean-install "(.venv) student-tools $" "python -m pip install -r requirements.txt"
run p6-clean-run "(.venv) student-tools $" "FORCE_COLOR=1 python -m app.main && python -m unittest discover -s tests -v"
deactivate
echo DONE
