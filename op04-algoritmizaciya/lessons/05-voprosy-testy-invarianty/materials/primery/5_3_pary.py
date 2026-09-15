def has_pair_wrong(numbers, target):
    for a in numbers:
        for b in numbers:
            if a + b == target:
                return True
    return False


def has_pair(numbers, target):
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return True
    return False


for data in ([3], [3, 3]):
    print(data, has_pair_wrong(data, 6), has_pair(data, 6))
