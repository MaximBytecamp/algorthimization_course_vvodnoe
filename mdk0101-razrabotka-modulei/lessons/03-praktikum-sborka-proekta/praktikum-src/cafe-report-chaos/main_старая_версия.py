# Первая версия программы, когда весь код лежал в одном файле.
# Оставлена «на всякий случай» и с тех пор не запускалась.
import csv

rows = list(csv.DictReader(open("orders.csv")))
total = 0
for r in rows:
    total = total + int(r["kopeks"])
print("итого", total / 100)
