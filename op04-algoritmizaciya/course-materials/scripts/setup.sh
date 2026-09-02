#!/usr/bin/env bash
set -e

PY=${PYTHON:-python3}
echo "Python: $($PY --version)"

if [ ! -d .venv ]; then
  $PY -m venv .venv
  echo "Создано виртуальное окружение .venv"
fi

.venv/bin/pip install --upgrade pip --quiet
.venv/bin/pip install -r requirements.txt --quiet
echo "Зависимости установлены."

.venv/bin/pytest example -q
echo
echo "Окружение готово. Активировать: source .venv/bin/activate"
