def find_max(numbers):
    best = 0
    for value in numbers:
        if value > best:
            best = value
    return best


assert find_max([3, 8, 2]) == 8
assert find_max([-1]) == -1, "максимум одного элемента -1"
print("все проверки пройдены")
