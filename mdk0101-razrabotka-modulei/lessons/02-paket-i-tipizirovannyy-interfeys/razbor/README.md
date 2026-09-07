# Разбор занятия 5 — собранный пакет

То, во что превращается `stend/orders.py` к концу пары. Материал преподавателя:
студентам выдаётся после сдачи работы, чтобы было с чем сравнить своё деление.

## Запуск

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e . ruff mypy pytest
python -m orders data/orders.json
```

Отчёт печатается одинаково из любой папки — в этом и была цель.

## Проверки

```bash
ruff check .     # All checks passed!
mypy             # Success: no issues found in 11 source files
pytest -q        # 11 passed
```

## Устройство

```
src/orders/
  __init__.py     дверь пакета: 8 имён в __all__
  __main__.py     точка входа: python -m orders <путь к данным>
  contracts.py    типы: OrderId, Money, Status, Item, Order
  errors.py       OrderError, OrderNotFound, OrderCannotBeCanceled
  pricing.py      скидка, доставка, итог — чистые функции
  rules.py        статусы и правила; про деньги ничего не знает
  storage.py      единственный модуль, который трогает диск
  report.py       единственный модуль, который печатает
  service.py      сценарии: find, create, cancel
  py.typed        заявка на то, что пакет типизирован
```

Стрелки импортов идут только сверху вниз: `__init__`/`__main__` → `service`/`report`
→ `pricing`/`rules`/`storage` → `contracts`/`errors`.

## Как воспроизвести цикл на паре

В `rules.py` добавить `from orders.pricing import total`, а в `pricing.py` —
`from orders.rules import is_active`, после чего `python -m orders data/orders.json`
падает с `ImportError: cannot import name 'total' from partially initialized module`.
Правильная починка — та, что уже стоит в коде: `can_cancel(order, order_total)`
принимает сумму параметром, а зовёт обоих `service`.
