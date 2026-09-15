def find_max(numbers):
    best = 0
    for value in numbers:
        if value > best:
            best = value
    return best


tests = [
    ([3, 8, 2], 8),
    ([8, 3, 2], 8),
    ([-7], -7),
    ([-8, -3, -10], -3),
    ([5, 5, 5], 5),
]

for data, expected in tests:
    actual = find_max(data)
    status = "OK" if actual == expected else "ОШИБКА"
    print(f"{status:7} {data} ожидаем {expected}, получили {actual}")
