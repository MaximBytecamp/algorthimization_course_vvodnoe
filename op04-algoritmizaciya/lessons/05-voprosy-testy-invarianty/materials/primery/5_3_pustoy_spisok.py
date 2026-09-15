def find_max(numbers):
    if not numbers:
        raise ValueError("numbers must not be empty")
    best = numbers[0]
    for i in range(1, len(numbers)):
        if numbers[i] > best:
            best = numbers[i]
    return best


print(find_max([-8, -3, -10]))
print(find_max([]))
