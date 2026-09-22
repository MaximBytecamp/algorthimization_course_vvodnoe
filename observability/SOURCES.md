# Источники и происхождение снимков

Материалы подготовлены 15 сентября 2026 года.
Автор: Макаров Максим Николаевич.

## Подход и оформление

- Собственный справочник MongoDB: https://maximbytecamp.github.io/mongodb_theory_makarov/
  Структура главы: паспорт, разделы, частые ошибки, «Проверьте себя», шпаргалка.
- Собственный справочник Python: https://python-theory-makarov.vercel.app/
- `shared/VOICE.md`, `TEXT_REVIEW.md`, `EDITORIAL_REWRITE.md` родительского проекта.

## Технические первоисточники

- https://opentelemetry.io/docs/concepts/observability-primer/
- https://opentelemetry.io/docs/concepts/signals/
- https://opentelemetry.io/docs/concepts/signals/logs/
- https://opentelemetry.io/docs/concepts/signals/traces/
- https://opentelemetry.io/docs/concepts/context-propagation/
- https://opentelemetry.io/docs/concepts/instrumentation/
- https://opentelemetry.io/docs/concepts/sampling/
- https://opentelemetry.io/docs/what-is-opentelemetry/
- https://prometheus.io/docs/introduction/overview/
- https://prometheus.io/docs/concepts/data_model/
- https://prometheus.io/docs/concepts/metric_types/
- https://prometheus.io/docs/practices/histograms/
- https://prometheus.io/docs/practices/naming/
- https://prometheus.io/docs/prometheus/latest/configuration/configuration/
- https://prometheus.io/docs/prometheus/latest/querying/functions/#rate
- https://grafana.com/docs/grafana/latest/fundamentals/
- https://grafana.com/docs/grafana/latest/administration/provisioning/
- https://sre.google/sre-book/monitoring-distributed-systems/
- https://sre.google/sre-book/effective-troubleshooting/
- https://www.postgresql.org/docs/current/runtime-config-connection.html
- https://docs.python.org/3/library/logging.html
- https://docs.python.org/3/library/traceback.html
- https://docs.python.org/3/library/statistics.html
- https://docs.python.org/3/library/time.html#time.perf_counter
- https://docs.python.org/3/library/asyncio-task.html
- https://fastapi.tiangolo.com/tutorial/first-steps/

Определения изложены своими словами. Код API стенда и данные эксперимента
созданы для справочника.

## Снимки экрана

Все снимки сделаны на стенде справочника через Playwright (headless Chromium).
Снимков сторонних сайтов нет.

| Файл | Адрес | Что показывает | Глава |
|---|---|---|---|
| shots/api-health.png | 127.0.0.1:8015/health | ответ проверки процесса | 1.1 |
| shots/api-fast.png | 127.0.0.1:8015/lab | сценарий fast: ответ, событие, этапы | 1.1 |
| shots/api-slow.png | 127.0.0.1:8015/lab | сценарий slow: ожидание зависимости 3 с | 1.1, 1.6 |
| shots/api-error.png | 127.0.0.1:8015/lab | сценарий error: HTTP 500 и traceback | 1.5 |
| shots/api-metrics.png | 127.0.0.1:8015/metrics | счётчик и гистограмма в формате Prometheus | 1.4 |
| shots/fastapi-swagger.png | 127.0.0.1:8015/docs | Swagger с раскрытым /products | 1.9 |
| shots/prometheus-targets.png | 127.0.0.1:9095/targets | состояние цели telemetry-lab | 1.8 |
| shots/prometheus-query.png | 127.0.0.1:9095/query | lab_http_requests_total, таблица | 1.8 |
| shots/prometheus-graph.png | 127.0.0.1:9095/query | скорость по кодам ответа за 5 минут | 1.8 |
| shots/grafana-dashboard.png | 127.0.0.1:3015/d/telemetry-intro | дашборд стенда за 5 минут | 1.8 |

Повторение:

```sh
python3 tools/capture.py            # API: консоль, Swagger, /metrics, /health
python3 tools/capture.py console    # только страница /lab (перед съёмкой прогреть API парой запросов)
python3 tools/traffic.py            # после свежего старта API: 2 мин без ошибок, 90 с с ошибками
python3 tools/capture_stack.py      # Prometheus и Grafana, нужен docker compose up
```

Снимки /lab и Swagger пересняты 22.09.2026: числа и request_id в главах 1.1, 1.5 и 1.6 взяты
с этих кадров. Метки-номера на снимках рисует страница, их координаты заданы в `tools/chapters/c*.py`.

Снимки Prometheus и Grafana сделаны сразу после `tools/traffic.py`, поэтому числа на них
не совпадают с CSV эксперимента: счётчик приложения учитывает все запросы с запуска.

Версии: Python 3.12.12, FastAPI 0.115.6, Uvicorn 0.34.0, Prometheus 3.5.0,
Grafana 12.1.1, Docker 29.7.2 (macOS).

## Схемы

Схемы нарисованы автором в SVG внутри `tools/chapters/c*.py`; съёмке они не подлежат.
Числа на схемах взяты из соседнего текста главы и из записанного прогона:
корзины гистограммы в главе 1.4 — со снимка `api-metrics.png`;
медиана, p95 и этапы в главе 1.7 — из таблиц того же кейса, то есть составлены для разбора;
схемы в главах 1.2 и 1.3 показывают порядок величин и отношения, а не измерения.

## Измерения и данные для разбора

`lab/results/requests.csv`, `summary.json`, `events.json` — один прогон
`experiment.py`: 20 последовательных запросов. Сценарии фиксированы, длительности измерены.
Перцентиль — метод ближайшего ранга: позиция ceil(0.95 × n) при счёте с единицы.

Составленные для разбора, а не измеренные данные: ряды CPU в главе 1.2, числа кейса в главе 1.7,
временная шкала фоновой задачи в главе 1.6. В главах это указано рядом с данными.

Зависимость моделируется `asyncio.sleep`; PostgreSQL к стенду не подключена.
Этапы запроса измеряет сам обработчик, OpenTelemetry в стенде не используется.
