from time import perf_counter


def calculate(n):
    total = 0

    for i in range(n):
        total += i

    return total


n = 1_000_000

start = perf_counter()

calculate(n)

elapsed = perf_counter() - start

print(f"{elapsed:.6f} sec")
