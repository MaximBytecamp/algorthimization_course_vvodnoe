# Модуль 4 «Сбор и хранение»: проект для опытов

Сервис заказов, склад со своим exporter, node_exporter и Prometheus 3.5.0 в Docker Compose.

| Что | Адрес |
|---|---|
| Сервис заказов | http://localhost:8041/metrics |
| Склад (только JSON) | http://localhost:8043/status |
| Exporter склада | http://localhost:8042/metrics |
| node_exporter | http://localhost:9110/metrics |
| Prometheus | http://localhost:9104 |

## Запуск

Нужен Docker Desktop (Windows, macOS) или Docker Engine с Compose (Linux).

```sh
docker compose up -d --build
docker compose ps
```

Остановить и удалить данные Prometheus: `docker compose down -v`.

## Опыты по главам

Команды записаны для macOS и Linux. В Windows PowerShell вместо `curl` пишут `curl.exe`.

**4.1. Exporter.** Отправить заказы на склад и сравнить JSON склада со страницей exporter:

```sh
for i in 1 2 3 4 5 6; do curl -s -X POST localhost:8043/orders > /dev/null; done
curl -s localhost:8043/status
curl -s localhost:8042/metrics | grep ^sklad
```

Остановить склад и через 30 секунд выполнить в Prometheus запрос `{job="sklad",__name__=~"up|sklad_up"}`:

```sh
docker compose stop sklad
docker compose start sklad
```

**4.2. Service discovery.** Запустить Prometheus с поиском target в папке `targets/`
и дописать вторую копию сервиса скриптом:

```sh
echo '[{"targets": ["api:8000"], "labels": {"env": "prod"}}]' > targets/orders.json
PROM_CONFIG=prometheus-sd.yml docker compose up -d
python3 make_targets.py
```

Страница Status → Service discovery показывает найденные метки. Ошибку чтения файла видно
в `docker compose logs prometheus` и в счётчике `prometheus_sd_file_read_errors_total` на
http://localhost:9104/metrics.

**4.3. Relabeling.** В `targets/orders.json` две копии с разными `env`, правила — в `prometheus-relabel.yml`:

```sh
cat > targets/orders.json <<'JSON'
[{"targets": ["api:8000"], "labels": {"env": "prod"}},
 {"targets": ["api2:8000"], "labels": {"env": "test"}}]
JSON
PROM_CONFIG=prometheus-relabel.yml docker compose up -d prometheus
python3 relabel_check.py
```

Запросы `scrape_samples_scraped{job="orders"}` и `scrape_samples_post_metric_relabeling{job="orders"}`
показывают, сколько рядов выбросили правила после опроса. Ошибка с regex — `prometheus-relabel-oshibka.yml`.

**4.4. Лимиты опроса.** Пять заданий, у каждого свой предел. Склад на время опыта замораживается,
чтобы exporter отвечал 2 секунды:

```sh
docker compose pause sklad
PROM_CONFIG=prometheus-limity.yml docker compose up -d prometheus
python3 limits_check.py          # через 30 секунд: задание, длительность опроса, ошибка
docker compose unpause sklad
```
