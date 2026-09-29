# prometheus-start

Стенд модуля 2 справочника «Метрики и наблюдаемость»: приложение FastAPI
с одной метрикой `http_requests_total` и Prometheus 3.5.0.

| Файл | Назначение |
|---|---|
| `app.py` | приложение: `/`, `/items/{id}`, `/metrics` и три пути для опыта с ошибками |
| `requirements.txt` | fastapi 0.115.6, uvicorn 0.34.0, prometheus-client 0.26.0 |
| `Dockerfile` | образ приложения |
| `compose.yaml` | сервисы `api` и `prometheus` в одной сети |
| `prometheus.yml` | рабочая конфигурация: job `api`, target `api:8000` |
| `prometheus-errors.yml` | опыт из главы 2.4: рабочий target и пять неуспешных |
| `prometheus-local.yml` | вариант без Docker: target `localhost:8020` |

## Запуск

```sh
docker compose up -d --build
curl http://localhost:8020/metrics
```

Prometheus: http://localhost:9092 → Status → Target health.

Нагрузка для счётчика:

```sh
for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:8020/items/$i; done
curl -s -o /dev/null http://localhost:8020/items/500
```

В PowerShell:

```powershell
1..20 | ForEach-Object { Invoke-WebRequest -UseBasicParsing "http://localhost:8020/items/$_" | Out-Null }
```

## Опыт с неуспешными scrape

```sh
PROM_CONFIG=prometheus-errors.yml docker compose up -d
```

В PowerShell: `$env:PROM_CONFIG="prometheus-errors.yml"; docker compose up -d`.
Вернуть рабочую конфигурацию: `docker compose up -d` без переменной
(в PowerShell сначала `Remove-Item Env:PROM_CONFIG`).

## Остановка

```sh
docker compose down        # контейнеры
docker compose down -v     # и данные Prometheus
```
