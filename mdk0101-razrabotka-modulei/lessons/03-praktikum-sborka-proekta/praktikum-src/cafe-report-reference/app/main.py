"""Точка запуска: читает заказы и печатает отчёт."""

from pathlib import Path

from app.services.orders import load_orders
from app.services.report import build_report

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "orders.csv"


def main() -> None:
    orders = load_orders(DATA_FILE)
    for line in build_report(orders):
        print(line)


if __name__ == "__main__":
    main()
