numbers = [3, -2, 0, 5]
total = 0
count = 0
print(f"k=0 total={total} count={count}")
for k, value in enumerate(numbers, start=1):
    total += value
    if value > 0:
        count += 1
    print(f"k={k} total={total} count={count}")
