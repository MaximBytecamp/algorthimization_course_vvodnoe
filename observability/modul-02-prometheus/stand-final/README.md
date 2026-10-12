# prometheus-final

Итоговый стенд модуля 2 справочника «Метрики и наблюдаемость».
В нём приложение FastAPI с двумя метриками, Prometheus 3.5.0 и готовые
настройки для всех опытов и заданий главы 2.6.

Порядок работы описан в файле **PROHOD.md**: девять шагов с командами
и выводом, который должен получиться.

## Что в папке

| Файл | Назначение |
|---|---|
| `PROHOD.md` | пошаговый проход по стенду |
| `app.py` | приложение: `/`, `/items/{id}`, `/metrics`, три адреса для опыта с ошибками |
| `Dockerfile`, `requirements.txt` | образ приложения: fastapi 0.115.6, uvicorn 0.34.0, prometheus-client 0.26.0 |
| `compose.yaml` | контейнеры `api` и `prometheus` в одной сети |
| `prometheus/prometheus.yml` | основные настройки: задание `api`, target `api:8000`, метка `env: dev` |
| `prometheus/zadanie-1-interval.yml` | задание 1: интервал 5 секунд |
| `prometheus/zadanie-3-path.yml` | задание 3: неверный путь `/stats` |
| `prometheus/oshibki.yml` | опыт главы 2.4: один рабочий target и пять с ошибками |
| `prometheus/bez-docker.yml` | запуск без Docker: target `localhost:8020` |
| `zaprosy.sh`, `zaprosy.ps1` | 22 запроса к приложению |
| `dolgie-zaprosy.sh`, `dolgie-zaprosy.ps1` | пять запросов по 40 секунд для метрики `items_in_progress` |

## Чем отличается от prometheus-start

- В `app.py` добавлена вторая метрика — gauge `items_in_progress` (задание 4).
- В основных настройках у target есть метка `env: dev` (задание 2).
- Настройки Prometheus лежат в папке `prometheus/`. Файл выбирает переменная `PROM_CONFIG`.

## Быстрый запуск

```sh
docker compose up -d --build
sh zaprosy.sh
```

Приложение: http://localhost:8020/metrics
Prometheus: http://localhost:9092 → Status → Target health

Стенды `prometheus-start` и `prometheus-final` занимают одни и те же порты 8020 и 9092.
Перед запуском одного остановите другой командой `docker compose down`.

## Остановка

```sh
docker compose down        # контейнеры
docker compose down -v     # контейнеры и данные Prometheus
```
