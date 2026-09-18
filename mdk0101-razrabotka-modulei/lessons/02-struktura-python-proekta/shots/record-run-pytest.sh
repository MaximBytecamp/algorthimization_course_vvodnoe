set -u
# Записывает вывод pytest для главы 2.6:
#   32-pytest-ok    — три теста прошли;
#   33-pytest-fail  — расчёт вернул не то: видно строку assert и значения;
#   34-pytest-error — ошибка до проверки (опечатка в имени функции);
#   35-pytest-none  — файл назван не по правилу: собрано ноль тестов.
# Результат: /tmp/python-book-pytest/log.txt → build-shots-pytest.py

BASE=/tmp/python-book-pytest
LOG=$BASE/log.txt
REF=/Users/makarovmn/algorthimization_course_vvodnoe/mdk0101-razrabotka-modulei/lessons/02-struktura-python-proekta/materials/reference
rm -rf $BASE; mkdir -p $BASE
cp -R "$REF/" $BASE/student-tools
cd $BASE/student-tools
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
python -m pip install -q rich==13.9.4 pytest
cp app/services/calculator.py /tmp/calculator-ok.py
cp tests/test_calculator.py /tmp/test-ok.py

# --- всё в порядке
run p1-ok "(.venv) student-tools $" "python -m pytest -v"

# --- FAIL: в формулу внесена ошибка
python - <<'PY'
import pathlib
p = pathlib.Path("app/services/calculator.py")
p.write_text(p.read_text(encoding="utf-8").replace("len(values)", "len(values) - 1"), encoding="utf-8")
PY
run p2-fail "(.venv) student-tools $" "python -m pytest -v 2>&1 | tail -22"
cp /tmp/calculator-ok.py app/services/calculator.py

# --- ошибка до проверки: опечатка в имени функции
python - <<'PY'
import pathlib
p = pathlib.Path("tests/test_calculator.py")
p.write_text(p.read_text(encoding="utf-8").replace("calculate_average([5, 4, 5, 3, 5])", "calculate_avg([5, 4, 5, 3, 5])"), encoding="utf-8")
PY
run p3-error "(.venv) student-tools $" "python -m pytest -v 2>&1 | tail -20"
cp /tmp/test-ok.py tests/test_calculator.py

# --- ноль тестов: файл назван не по правилу
mv tests/test_calculator.py tests/calculator.py
run p4-none "(.venv) student-tools $" "python -m pytest -v"
mv tests/calculator.py tests/test_calculator.py

# --- проверка с чистого листа: только исходники, новое окружение
CLEAN=$BASE/clean
mkdir -p $CLEAN
cp -R "$REF/" $CLEAN/student-tools
cd $CLEAN/student-tools
run p5-tree "student-tools $" "ls -a"
$BASEPY -m venv .venv
source .venv/bin/activate
run p5-install "(.venv) student-tools $" "python -m pip install -q -r requirements.txt && echo 'зависимости установлены по requirements.txt'"
run p5-run "(.venv) student-tools $" "python -m app.main && python -m pytest -v 2>&1 | tail -7"
echo "лог: $LOG"

