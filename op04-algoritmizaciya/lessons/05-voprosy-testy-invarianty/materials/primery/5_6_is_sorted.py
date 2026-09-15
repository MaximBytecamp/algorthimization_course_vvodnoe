def is_sorted(numbers):
    for i in range(len(numbers) - 1):
        if numbers[i] > numbers[i + 1]:
            return False
    return True


for data in ([], [7], [1, 2, 2, 4], [1, 3, 2]):
    print(data, is_sorted(data))
