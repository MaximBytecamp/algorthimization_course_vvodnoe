# Стенд лекции 2.12 · метрики веб-сервиса на FastAPI

Автор материала — Макаров Максим Николаевич.

Сервис каталога: `GET /products`, `GET /products/{product_id}` (404 для номера больше 100),
`POST /orders` (в 20% случаев исключение → 500), `GET /report` (0,3–1,5 с).
Промежуточный обработчик считает запросы, длительность и запросы в работе.

## Подготовка

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi==0.115.6 uvicorn==0.34.0 prometheus-client==0.26.0 httpx==0.28.1
```

## Один процесс

```sh
python -m uvicorn app:app --port 8040
python load.py                      # во втором терминале
curl -sL localhost:8040/metrics     # -L: /metrics перенаправляет на /metrics/
```

## Несколько процессов

```sh
rm -rf mp && mkdir mp
PROMETHEUS_MULTIPROC_DIR=mp python -m uvicorn app:app --port 8040 --workers 2
```

Папку `mp` очищают перед каждым запуском (лекция 2.6, §3).
