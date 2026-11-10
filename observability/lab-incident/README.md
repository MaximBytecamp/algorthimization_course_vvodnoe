# Стенд лекции 1.6 · разбор инцидента

Автор материала — Макаров Максим Николаевич.

Три экземпляра каталога (`api-1`, `api-2`, `api-3`) на FastAPI. Каждый берёт соединение
из пула и выполняет «SQL-запрос». Базы данных нет: пул — `asyncio.Semaphore`, запрос — ожидание 40 мс.

## Подготовка

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi==0.115.6 uvicorn==0.34.0 prometheus-client==0.21.1 httpx==0.28.1
```

## Опыт

```sh
./start.sh                       # все три экземпляра: версия 2.14.0, пул 10
python load.py --out before.csv  # 186 запросов в секунду, 30 секунд
python summary.py before.csv
# Ctrl+C, затем выпуск 2.15.0 на api-2 с пулом 2:
./start.sh 2 2.15.0
python load.py --out after.csv
python summary.py after.csv
```

Адреса экземпляра: `/products`, `/config`, `/events` (последние 5000 записей с этапами), `/metrics`.

Этапы всех запросов api-2 после прогона:

```sh
curl -s localhost:8032/events > events2.json
python stages.py
```
