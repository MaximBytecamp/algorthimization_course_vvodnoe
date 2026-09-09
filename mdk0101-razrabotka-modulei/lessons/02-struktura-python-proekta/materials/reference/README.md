# Student Tools — разбор темы 02

Python 3.10+. Программа считает среднюю оценку и печатает результат через Rich.
Откройте эту папку целиком в VS Code. Все команды — из папки с app/ и requirements.txt.

## Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Если активация запрещена, откройте CMD и выполните `.venv\Scripts\activate.bat`.
Или используйте `.\.venv\Scripts\python.exe` вместо `python` во всех командах ниже.

## macOS / Linux (bash, zsh)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Установка и запуск

```bash
python -c "import sys; print(sys.executable)"
python -m pip install -r requirements.txt
python -m app.main
python -m unittest discover -s tests -v
```

Ожидаемый вывод: `Средний результат: 4.40`. Три теста должны завершиться OK.
В VS Code выполните Python: Select Interpreter и выберите Python внутри .venv.

## Ответственность

- app/main.py — соединение частей и запуск.
- app/services/calculator.py — расчёт; пустой список вызывает ValueError.
- app/utils/formatter.py — формат строки с двумя знаками после точки.
- tests/ — проверки без стороннего тестового фреймворка.
- requirements.txt — зафиксированные зависимости учебного примера (не требование последних версий).
- .gitignore — исключает локальное окружение и кэш.

Окружение .venv создают на своём компьютере, в Git его не загружают.
