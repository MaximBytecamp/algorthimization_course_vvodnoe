# Стенд практики модуля 3: сервис доставки

Практика главы 3.8 справочника «Метрики и наблюдаемость». Условия заданий — на странице главы.

| Что | Адрес |
|---|---|
| Сервис доставки | http://localhost:8033 |
| Страница метрик | http://localhost:8033/metrics |
| Prometheus | http://localhost:9096 |

## Файлы

| Файл | Что в нём |
|---|---|
| `app.py` | сервис; места для заданий 3–5 отмечены словом ЗАДАНИЕ |
| `compose.yaml` | сервисы api и prometheus |
| `prometheus/prometheus.yml` | job delivery, опрос раз в 15 секунд |
| `nagruzka.sh`, `nagruzka.ps1` | одинаковая для всех нагрузка: 220 запросов к доставкам, 30 заявок, 20 расчётов маршрута |
| `otchet.md` | бланк отчёта |

## Запуск

```sh
docker compose up -d --build
./nagruzka.sh                      # Windows: powershell -ExecutionPolicy Bypass -File nagruzka.ps1
```

После каждой правки `app.py` сервис пересобирают и перезапускают, а данные Prometheus удаляют,
чтобы старые ряды не мешали:

```sh
docker compose down -v
docker compose up -d --build
./nagruzka.sh
```

Через 15–20 секунд после нагрузки Prometheus выполнит опрос, и числа появятся в запросах.

## Проверка имён

```sh
curl -s localhost:8033/metrics | docker run --rm -i --entrypoint promtool prom/prometheus:v3.5.0 check metrics
```

В Windows PowerShell: `curl.exe -s localhost:8033/metrics | docker run --rm -i --entrypoint promtool prom/prometheus:v3.5.0 check metrics`.
