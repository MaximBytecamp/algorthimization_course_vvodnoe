from measurements import measure_time, measure_memory

def with_list(n):
    return sum(
        [i * i for i in range(n)]
    )

def with_generator(n):
    return sum(
        i * i for i in range(n)
    )

for func in [with_list, with_generator]:
    for n in [10_000, 100_000, 1_000_000]:
        elapsed = measure_time(func, n)
        result, peak = measure_memory(func, n)
        print(f"{func.__name__}: {n=} | {elapsed=:.6f} sec | {peak / 1024**2:.6f} MiB")
