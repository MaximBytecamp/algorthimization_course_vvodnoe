# Стенд модуля 3 «Метрика как данные»

Сервис заказов на FastAPI и Prometheus 3.5.0 в Docker Compose.

| Что | Адрес |
|---|---|
| Сервис заказов | http://localhost:8031 |
| Страница метрик | http://localhost:8031/metrics |
| Prometheus | http://localhost:9094 |

## Запуск

Нужен Docker Desktop (Windows, macOS) или Docker Engine с Compose (Linux).

```sh
docker compose up -d --build
docker compose ps
```

Остановить и удалить данные Prometheus:

```sh
docker compose down -v
```

## Адреса сервиса

| Запрос | Что делает |
|---|---|
| `GET /orders/7` | заказ по номеру; номер больше 500 — ответ 404 |
| `POST /orders?payment=card` | новый заказ (`card` или `cash`), заказ встаёт в очередь сборки |
| `GET /report?ms=300` | отчёт, который строится заданное число миллисекунд |
| `GET /metrics` | метрики в текстовом формате Prometheus |

Склад собирает один заказ в секунду, поэтому `orders_queue_length` уменьшается на 1 каждую секунду.

## Опыты по главам

Команды записаны для macOS и Linux. В Windows PowerShell вместо `curl` пишут `curl.exe`,
циклы — через `1..10 | ForEach-Object { curl.exe -s -o NUL http://localhost:8031/orders/$_ }`.

**3.1, 3.3.** Десять запросов, через минуту — запрос `http_requests_total[1m]` на вкладке Table:

```sh
for i in $(seq 1 10); do curl -s -o /dev/null localhost:8031/orders/$i; done
curl -s -o /dev/null localhost:8031/orders/777          # ответ 404: новый ряд
curl -s -X POST 'localhost:8031/orders?payment=card'    # ещё один ряд
```

**3.2.** Проверка имён в ответе сервиса:

```sh
curl -s localhost:8031/metrics | docker run --rm -i --entrypoint promtool prom/prometheus:v3.5.0 check metrics
```

**3.4.** Сброс счётчика: довести счётчик до 40, перезапустить сервис, отправить 10 запросов.

```sh
docker compose restart api
```

**3.5.** Очередь: десять заказов разом, затем каждую секунду смотреть `orders_queue_length`.

```sh
for i in $(seq 1 10); do curl -s -o /dev/null -X POST localhost:8031/orders; done
for i in $(seq 1 12); do curl -s localhost:8031/metrics | grep '^orders_queue_length'; sleep 1; done
```

**3.6.** Отчёты с заданной длительностью:

```sh
for ms in 30 40 60 70 80 90 120 130 150 180 200 220 300 350 400 450 700 900 1400 3000; do
  curl -s -o /dev/null "localhost:8031/report?ms=$ms" &
done; wait
curl -s localhost:8031/metrics | grep 'route="/report"'
```

**3.7.** Метка с полным путём и номером клиента:

```sh
docker compose down -v
BAD_LABELS=1 docker compose up -d
for i in $(seq 1 1000); do curl -s -o /dev/null -H "X-Customer-Id: $((RANDOM % 300 + 1))" localhost:8031/orders/$i; done
```

Страница Status → TSDB status показывает число рядов. Предел `sample_limit`:

```sh
PROM_CONFIG=prometheus-limit.yml BAD_LABELS=1 docker compose up -d prometheus
```

В PowerShell переменные задают так: `$env:BAD_LABELS=1; docker compose up -d`.
