# Проход по итоговому стенду

Девять шагов. Все команды выполняются в папке `prometheus-final`.
Выводы получены на этом стенде 12.10.2026: Docker Desktop, Prometheus 3.5.0.

Команды записаны для macOS и Linux. Отличия для Windows (PowerShell):

| macOS, Linux | Windows |
|---|---|
| `sh zaprosy.sh` | `.\zaprosy.ps1` |
| `sh dolgie-zaprosy.sh` | `.\dolgie-zaprosy.ps1` |
| `curl` | `curl.exe` |
| `PROM_CONFIG=файл docker compose up -d` | `$env:PROM_CONFIG="файл"; docker compose up -d` |
| `docker compose up -d` без переменной | `Remove-Item Env:PROM_CONFIG; docker compose up -d` |

Запросы к Prometheus вводятся в браузере: http://localhost:9092, вкладка **Query**.

---

## Шаг 1. Запустить стенд

```sh
docker compose up -d --build
docker compose ps
```

```
NAME                            IMAGE                    STATUS          PORTS
prometheus-final-api-1          prometheus-final-api     Up 24 seconds   127.0.0.1:8020->8000/tcp
prometheus-final-prometheus-1   prom/prometheus:v3.5.0   Up 24 seconds   127.0.0.1:9092->9090/tcp
```

Работают два контейнера. При первом запуске Docker скачивает образы, это занимает несколько минут.

## Шаг 2. Посмотреть /metrics до запросов

```sh
curl http://localhost:8020/metrics
```

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
# HELP items_in_progress Requests to /items being processed right now
# TYPE items_in_progress gauge
items_in_progress 0.0
```

У счётчика `http_requests_total` есть только строки HELP и TYPE: запросов ещё не было, рядов нет.
У gauge `items_in_progress` один ряд, и он есть сразу со значением 0 (глава 2.3, §5).

## Шаг 3. Отправить запросы

```sh
sh zaprosy.sh
curl http://localhost:8020/metrics
```

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 20.0
http_requests_total{method="GET",status="404"} 1.0
http_requests_total{method="POST",status="405"} 1.0
# HELP items_in_progress Requests to /items being processed right now
# TYPE items_in_progress gauge
items_in_progress 0.0
```

Скрипт отправил 20 запросов к товарам, один запрос к товару 500 (ответ 404) и один POST (ответ 405).
У счётчика появилось три ряда.

## Шаг 4. Открыть Prometheus

Откройте http://localhost:9092, меню **Status → Target health**.
Задание `api`: `1 / 1 up`, состояние `UP`, метки `env="dev"`, `instance="api:8000"`, `job="api"`.

На вкладке **Query** выполните три запроса.

`up`

```
up{env="dev", instance="api:8000", job="api"}  1
```

`http_requests_total`

```
http_requests_total{env="dev", instance="api:8000", job="api", method="GET", status="200"}   20
http_requests_total{env="dev", instance="api:8000", job="api", method="GET", status="404"}   1
http_requests_total{env="dev", instance="api:8000", job="api", method="POST", status="405"}  1
```

`http_requests_total{status="404"}` — один ряд со значением 1.

Метки `method` и `status` записало приложение. Метки `job`, `instance` и `env` добавил Prometheus.
Метка `env` взята из параметра `labels` в `prometheus/prometheus.yml` — это ответ на задание 2:
метка target появляется на всех рядах этого target, включая `up`.

Если ряды счётчика ещё не видны, подождите до 15 секунд: значения обновляются после очередного scrape.

## Шаг 5. Вторая метрика: gauge items_in_progress

В `app.py` метрика увеличивается в начале обработки `/items/{id}` и уменьшается в конце.
Обычный запрос выполняется за миллисекунды, и к моменту scrape значение снова равно 0.
Параметр `wait` задаёт длительность обработки в секундах.

```sh
sh dolgie-zaprosy.sh
```

Пока команда работает (40 секунд), во втором окне терминала:

```sh
curl -s http://localhost:8020/metrics | grep items_in_progress
```

```
# HELP items_in_progress Requests to /items being processed right now
# TYPE items_in_progress gauge
items_in_progress 5.0
```

В Prometheus запрос `items_in_progress`:

```
items_in_progress{env="dev", instance="api:8000", job="api"}  5
```

После завершения команды и следующего scrape значение равно 0.
На вкладке **Graph** виден подъём до 5 и возврат к 0.

Запрос `scrape_samples_scraped` показывает 4: в ответе приложения три ряда счётчика и один ряд gauge.

## Шаг 6. Остановить приложение

```sh
docker compose stop api
```

Через 15–30 секунд:

| Где смотреть | Что видно |
|---|---|
| Status → Target health | `DOWN`, текст ошибки `Get "http://api:8000/metrics": EOF` |
| Запрос `up` | `up{env="dev", instance="api:8000", job="api"}  0` |
| Запрос `http_requests_total` | пустой результат |

Текст ошибки зависит от окружения. В Linux вместо `EOF` бывает другая ошибка соединения.

```sh
docker compose start api
```

После следующего scrape:

| Запрос | Результат |
|---|---|
| `up` | 1 |
| `items_in_progress` | 0 |
| `http_requests_total` | пустой результат |

Gauge без меток появился сразу. Счётчик начался заново и появится после первого запроса
к приложению: выполните `sh zaprosy.sh`. На вкладке **Graph** запрос `up` показывает
снижение до 0 на время остановки.

## Шаг 7. Задание 1: интервал 5 секунд

```sh
PROM_CONFIG=zadanie-1-interval.yml docker compose up -d
```

Docker пересоздаёт контейнер Prometheus с другим файлом настроек. Данные сохраняются.

Страница **Status → Configuration**, начало:

```
global:
  scrape_interval: 5s
  scrape_timeout: 5s
```

В файле timeout не записан. Интервал меньше 10 секунд, поэтому Prometheus установил
timeout равным интервалу (глава 2.4, §4).

Через минуту запрос `up[1m]` на вкладке Table:

```
up{env="dev", instance="api:8000", job="api"}  1 1 1 1 1 1 1 1 1 1 1 1
```

За минуту 12 значений: 60 секунд / 5 секунд. При интервале 15 секунд их было бы 4.

## Шаг 8. Задание 3: неверный путь

```sh
PROM_CONFIG=zadanie-3-path.yml docker compose up -d
```

Status → Target health: `DOWN`, текст ошибки

```
server returned HTTP status 404 Not Found
```

Через минуту:

```sh
curl http://localhost:8020/metrics
```

```
http_requests_total{method="GET",status="404"} 4.0
```

Prometheus четыре раза в минуту запрашивает `/stats`. Такого адреса в приложении нет,
оно отвечает 404 и считает эти ответы в своём счётчике. Значение растёт на 4 в минуту
без запросов пользователей (глава 2.4, §7).

## Шаг 9. Опыт с ошибками и возврат к основным настройкам

```sh
PROM_CONFIG=oshibki.yml docker compose up -d
```

Через 30 секунд на странице Status → Target health шесть заданий:

```
api         up
broken      down   expected label value, got "G" ("INVALID") while parsing: "http_requests_total{method=G"
html        down   received unsupported Content-Type "text/html; charset=utf-8" and no fallback_scrape_protocol specified for target
localhost   down   Get "http://localhost:8000/metrics": dial tcp [::1]:8000: connect: connection refused
slow        down   Get "http://api:8000/metrics/slow": context deadline exceeded
wrong-path  down   server returned HTTP status 404 Not Found
```

Причина каждой ошибки разобрана в главе 2.4, §7.

Вернуть основные настройки и проверить файл:

```sh
docker compose up -d
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

```
Checking /etc/prometheus/prometheus.yml
 SUCCESS: /etc/prometheus/prometheus.yml is valid prometheus config file syntax
```

Чтобы Prometheus заново прочитал изменённый файл без перезапуска:

```sh
curl -X POST http://localhost:9092/-/reload
```

## Завершить работу

```sh
docker compose down -v
```

Команда удаляет контейнеры, сеть и данные Prometheus.

---

## Запуск без Docker

1. Скачать Prometheus 3.5.0 со страницы https://prometheus.io/download/ и распаковать.
2. В папке стенда: `python -m venv .venv`, затем `.venv/bin/pip install -r requirements.txt`
   (в Windows — `.venv\Scripts\pip`).
3. Запустить приложение: `.venv/bin/uvicorn app:app --port 8020`.
4. Во втором окне терминала: `./prometheus --config.file=prometheus/bez-docker.yml`.
   Веб-интерфейс откроется по адресу http://localhost:9090.
