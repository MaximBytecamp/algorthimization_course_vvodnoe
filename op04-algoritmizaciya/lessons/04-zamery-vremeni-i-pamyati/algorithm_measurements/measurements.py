from time import perf_counter
from statistics import median
import tracemalloc


def measure_time(func, *args, repeats=7):
    measurements = []

    for _ in range(repeats):
        start = perf_counter()

        func(*args)

        elapsed = perf_counter() - start
        measurements.append(elapsed)

    return median(measurements)


def measure_memory(func, *args):
    tracemalloc.start()

    result = func(*args)

    current, peak = (
        tracemalloc.get_traced_memory()
    )

    tracemalloc.stop()

    return result, peak
