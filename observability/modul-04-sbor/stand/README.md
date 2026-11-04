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
