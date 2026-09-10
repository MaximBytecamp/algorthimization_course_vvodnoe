set -u
BASE=/tmp/python-book-evidence
LOG=$BASE/log2.txt
D=$BASE/theory; rm -rf $D; mkdir -p $D; cd $D
: > $LOG
PY=/tmp/python-book-evidence/student-tools/.venv/bin/python
run() { local id="$1"; local p="$2"; shift 2; echo "##### $id" >> $LOG; echo "\$prompt $p" >> $LOG; echo "\$cmd $*" >> $LOG; { eval "$@"; } >> $LOG 2>&1; echo "##### end" >> $LOG; }

# --- 2.4 : что такое __name__
cat > calculator.py <<'PY'
print("Модуль calculator загружается. __name__ =", __name__)


def calculate_average(values):
    return sum(values) / len(values)
PY
cat > main.py <<'PY'
from calculator import calculate_average

print("Модуль main загружается. __name__ =", __name__)


def main():
    print("Средний результат:", calculate_average([5, 4, 5, 3, 5]))


if __name__ == "__main__":
    main()
PY
run t1-run "student-tools $" "$PY main.py"
run t2-import "student-tools $" "$PY -c 'import main'"

# --- 2.4 : что будет без защиты
cp main.py main_noguard.py
python3 - <<'PY'
import pathlib
p = pathlib.Path('/tmp/python-book-evidence/theory/main_noguard.py')
s = p.read_text().replace('if __name__ == "__main__":\n    main()\n', 'main()\n')
p.write_text(s)
PY
run t3-noguard "student-tools $" "$PY -c 'import main_noguard'"

# --- 2.4 : модуль выполняется один раз
cat > twice.py <<'PY'
import calculator
import calculator
from calculator import calculate_average

print("calculator в кэше загруженных модулей:", "calculator" in __import__("sys").modules)
PY
run t4-twice "student-tools $" "$PY twice.py"

# --- 2.5 : порядок выполнения __init__.py
mkdir -p pkg/app/services pkg/app/utils
cd pkg
echo 'print("выполняется app/__init__.py")' > app/__init__.py
echo 'print("выполняется app/services/__init__.py")' > app/services/__init__.py
echo 'print("выполняется app/utils/__init__.py")' > app/utils/__init__.py
cat > app/services/calculator.py <<'PY'
print("выполняется app/services/calculator.py")


def calculate_average(values):
    return sum(values) / len(values)
PY
run t5-init-order "student-tools $" "$PY -c 'from app.services.calculator import calculate_average; print(\"импорт закончен, среднее:\", calculate_average([5, 4, 5, 3, 5]))'"

# --- 2.5 : чем пакет с __init__.py отличается от папки без него
cd $D; mkdir -p two/withinit/app two/noinit/app
echo '' > two/withinit/app/__init__.py
cat > two/withinit/app/calculator.py <<'PY'
def calculate_average(values):
    return sum(values) / len(values)
PY
cp two/withinit/app/calculator.py two/noinit/app/calculator.py
cd two/withinit
run t6-withinit "student-tools $" "$PY -c 'import app; print(app); print(\"__file__:\", app.__file__); print(\"__path__:\", list(app.__path__))'"
cd ../noinit
run t7-noinit "student-tools $" "$PY -c 'import app; print(app); print(\"__file__:\", app.__file__); print(\"__path__:\", list(app.__path__))'"
echo DONE
