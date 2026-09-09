from measurements import measure_time

def manual_sum(numbers):
    result = 0

    for number in numbers:
        result += number

    return result

def builtin_sum(numbers):
    return sum(numbers)

numbers = list(range(1_000_000))


manual_time = measure_time(
    manual_sum,
    numbers
)

builtin_time = measure_time(
    builtin_sum,
    numbers
)


print(
    f"manual: {manual_time:.6f}"
)

print(
    f"sum():  {builtin_time:.6f}"
)
