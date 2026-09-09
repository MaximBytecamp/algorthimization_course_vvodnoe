from measurements import measure_memory

def version_a(n):
    squares = []

    for i in range(n):
        squares.append(i * i)

    return sum(squares)

def version_b(n):
    total = 0

    for i in range(n):
        total += i * i

    return total

n = 1_000_000


_, memory_a = measure_memory(
    version_a,
    n
)

_, memory_b = measure_memory(
    version_b,
    n
)


print(
    "A:",
    memory_a / 1024 / 1024,
    "MB"
)

print(
    "B:",
    memory_b / 1024 / 1024,
    "MB"
)

# В исходном выводе MB; деление на 1024**2 даёт MiB.
