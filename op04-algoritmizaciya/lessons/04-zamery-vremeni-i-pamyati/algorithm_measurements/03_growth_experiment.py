from time import perf_counter


def calculate(n):
    total = 0

    for i in range(n):
        total += i

    return total


sizes = [
    10_000,
    100_000,
    1_000_000,
    10_000_000,
]


for n in sizes:
    start = perf_counter()

    calculate(n)

    elapsed = perf_counter() - start

    print(
        f"n={n:>10} | "
        f"time={elapsed:.6f}"
    )
