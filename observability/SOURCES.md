# Источники и происхождение кадров

Материалы подготовлены 15 сентября 2026 года.
Автор учебного издания: Макаров Максим Николаевич.

## Подход и оформление

- Собственный справочник MongoDB: https://maximbytecamp.github.io/mongodb_theory_makarov/
  Книжная структура, паспорт, механизм, запускаемый пример, реальный кадр,
  ошибки, проверка и памятка. Новый справочник имеет свою палитру и визуальные блоки.
- Собственный справочник Python: https://python-theory-makarov.vercel.app/
  Ссылка в каждой главе; синтаксис не подменяет объяснение наблюдаемости.
- `shared/VOICE.md`, `TEXT_REVIEW.md`, `EDITORIAL_REWRITE.md` родительского проекта.
- Разделы курса о структуре Python-проекта, файловой системе Linux и теме 5 алгоритмизации.

## Технические первоисточники

- https://opentelemetry.io/docs/concepts/observability-primer/
- https://opentelemetry.io/docs/concepts/signals/
- https://opentelemetry.io/docs/concepts/signals/metrics/
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
- https://grafana.com/docs/grafana/latest/fundamentals/
- https://sre.google/sre-book/monitoring-distributed-systems/
- https://sre.google/sre-book/effective-troubleshooting/
- https://docs.python.org/3/library/logging.html
- https://docs.python.org/3/library/traceback.html
- https://docs.python.org/3/library/time.html#time.perf_counter
- https://docs.python.org/3/library/asyncio-task.html#asyncio.sleep
- https://fastapi.tiangolo.com/tutorial/first-steps/

Определения изложены своими словами. Код учебного API и данные эксперимента
созданы для материала. Ссылки на релевантные источники стоят также в главах.

## Реальные снимки экрана

| Файл | Откуда | Что показывает |
|---|---|---|
| shots/api-fast.png | localhost:8015/lab | быстрый HTTP 200, событие и этапы |
| shots/api-slow.png | localhost:8015/lab | настоящий запрос с внесённым asyncio.sleep |
| shots/api-error.png | localhost:8015/lab | HTTP 500, реальный traceback перехваченного TimeoutError |
| shots/fastapi-swagger.png | localhost:8015/docs | сгенерированная FastAPI документация |
| shots/otel-signals.png | официальная страница Signals OpenTelemetry | структура документации по сигналам |
| shots/prometheus-architecture.png | официальная страница Overview Prometheus | опубликованная архитектурная схема |
| shots/prometheus-query.png | localhost:9095 | запрос к метрикам настоящего учебного API |
| shots/grafana-dashboard.png | localhost:3015 | панели с данными локального Prometheus |

Кадры получены Chromium/Playwright; интерфейсы продуктов не реконструировались.
Встроенный Browser в сессии не предоставил доступного браузера, поэтому для
съёмки применён локальный headless Chromium. Скрипты повторения — в tools/.

Версии: Python 3.12.12, FastAPI 0.115.6, Uvicorn 0.34.0,
Prometheus 3.5.0, Grafana 12.1.1. Скриншоты официальных страниц отражают их вид
на дату съёмки; навигация документации может изменяться.

## Измерения и учебные схемы

`lab/results/requests.csv`, `summary.json`, `events.json` — один реальный прогон
20 последовательных запросов. Сценарии фиксированы; времена измерены.
Скриншоты API и Grafana сняты отдельными запросами, поэтому точные значения,
идентификаторы и общий накопленный счётчик могут отличаться от CSV.

Перцентиль в главе 1.4 — nearest rank: ceil(0.95*n), позиция с единицы.
Шкала «дольше секунды» выбрана для учебного опыта.

Графики CPU, архитектурные схемы, временная шкала очереди и данные пятишагового
инцидента — явно обозначенные учебные модели, не измерения инфраструктуры.
Waterfall и столбцы длительностей построены по записанному реальному прогону.

Зависимость моделируется ожиданием; реальная PostgreSQL не подключена.
Ручные spans первого стенда не выдаются за экспорт OpenTelemetry.
