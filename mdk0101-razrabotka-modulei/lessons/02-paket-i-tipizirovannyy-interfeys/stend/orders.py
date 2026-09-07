# Сервис заказов. Всё в одном файле: так начинался проект,
# так он и остался. На занятии 5 мы разрежем его на пакет.

import json
import os
from datetime import datetime

DATA_FILE = "orders.json"
PROMO = {"WELCOME": 10, "FRIEND": 15, "BIRTHDAY": 20}
LOADED = []


def load():
    global LOADED
    if not os.path.exists(DATA_FILE):
        LOADED = []
        return LOADED
    with open(DATA_FILE, encoding="utf-8") as f:
        LOADED = json.load(f)
    return LOADED


def save():
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(LOADED, f, ensure_ascii=False, indent=2)


def find(order_id):
    for o in LOADED:
        if o["id"] == order_id:
            return o
    return None


def total(order):
    s = 0
    for it in order["items"]:
        s = s + it["price"] * it["qty"]
    if order.get("promo"):
        p = PROMO.get(order["promo"])
        if p:
            s = s - s * p / 100
    if s < 1500:
        s = s + 199
    return s


def can_cancel(order):
    if order["status"] == "shipped":
        return False
    if order["status"] == "delivered":
        return False
    if order["status"] == "canceled":
        return False
    return True


def cancel(order_id):
    o = find(order_id)
    if o is None:
        print("нет такого заказа")
        return
    if not can_cancel(o):
        print("заказ уже уехал, отменить нельзя")
        return
    o["status"] = "canceled"
    o["canceled_at"] = datetime.now().isoformat()
    save()
    print("заказ", order_id, "отменён")


def create(customer, items, promo=None):
    new_id = 1
    for o in LOADED:
        if o["id"] >= new_id:
            new_id = o["id"] + 1
    order = {
        "id": new_id,
        "customer": customer,
        "items": items,
        "promo": promo,
        "status": "new",
        "created_at": datetime.now().isoformat(),
    }
    LOADED.append(order)
    save()
    return order


def report():
    load()
    print("ОТЧЁТ ПО ЗАКАЗАМ")
    print("-" * 46)
    money = 0
    for o in LOADED:
        t = total(o)
        if o["status"] != "canceled":
            money = money + t
        print(str(o["id"]).rjust(3), o["customer"].ljust(16), o["status"].ljust(10), str(t).rjust(9))
    print("-" * 46)
    print("всего к оплате:", money)


if __name__ == "__main__":
    report()
