set -u
BASE=/tmp/python-book-evidence
LOG=$BASE/log3.txt
D=$BASE/tests-demo; rm -rf $D; mkdir -p $D; cd $D
: > $LOG
PY=$BASE/student-tools/.venv/bin/python
run() { local id="$1"; local p="$2"; shift 2; echo "##### $id" >> $LOG; echo "\$prompt $p" >> $LOG; echo "\$cmd $*" >> $LOG; { eval "$@"; } >> $LOG 2>&1; echo "##### end" >> $LOG; }

# дробные числа: почему assertAlmostEqual
run q1-float "student-tools $" "$PY -c 'print(0.1 + 0.2); print(0.1 + 0.2 == 0.3); print(sum([5, 4, 5, 3, 5]) / 5)'"

# рабочий проект с тестами
REF=/Users/makarovmn/algorthimization_course_vvodnoe/mdk0101-razrabotka-modulei/lessons/02-struktura-python-proekta/materials/reference
cp -R $REF/app $REF/tests .
find . -name __pycache__ -type d -exec rm -rf {} + 2>/dev/null

# падение теста: в формулу внесена ошибка
python3 - <<'PY'
import pathlib
p = pathlib.Path('/tmp/python-book-evidence/tests-demo/app/services/calculator.py')
p.write_text(p.read_text().replace('return sum(values) / len(values)', 'return sum(values) / (len(values) - 1)'))
PY
run q2-fail "(.venv) student-tools $" "$PY -m unittest discover -s tests -v"

# ошибка в тесте, а не в проверке: опечатка в имени функции
python3 - <<'PY'
import pathlib
p = pathlib.Path('/tmp/python-book-evidence/tests-demo/app/services/calculator.py')
p.write_text(p.read_text().replace('return sum(values) / (len(values) - 1)', 'return sum(values) / len(values)'))
t = pathlib.Path('/tmp/python-book-evidence/tests-demo/tests/test_calculator.py')
t.write_text(t.read_text().replace('calculate_average([5, 4, 5, 3, 5])', 'calculate_average(5, 4, 5, 3, 5)'))
PY
run q3-error "(.venv) student-tools $" "$PY -m unittest discover -s tests -v"

# тесты не найдены
python3 - <<'PY'
import pathlib
t = pathlib.Path('/tmp/python-book-evidence/tests-demo/tests/test_calculator.py')
t.write_text(t.read_text().replace('calculate_average(5, 4, 5, 3, 5)', 'calculate_average([5, 4, 5, 3, 5])'))
t.rename(t.with_name('calculator_test.py'))
PY
run q4-none "(.venv) student-tools $" "$PY -m unittest discover -s tests -v"
echo DONE
