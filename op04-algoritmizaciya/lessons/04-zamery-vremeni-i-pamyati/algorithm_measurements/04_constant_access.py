def get_middle(numbers):
    index = len(numbers) // 2

    return numbers[index]

if __name__ == "__main__":
    from measurements import measure_time

    for n in [
        1_000,
        10_000,
        100_000,
        1_000_000,
    ]:
        numbers = list(range(n))

        elapsed = measure_time(
            get_middle,
            numbers,
            repeats=100
        )

        print(
            f"n={n:>8} | "
            f"time={elapsed:.10f}"
        )
