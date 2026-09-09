from time import perf_counter
from statistics import median

def calculate(n):
    total = 0

    for i in range(n):
        total += i

    return total

values = []
for i in range(7):
    start = perf_counter()
    calculate(1_000_000)
    elapsed = perf_counter() - start
    values.append(elapsed)
    print(f"run {i + 1}: {elapsed:.6f} sec")
print(f"median: {median(values):.6f} sec")
