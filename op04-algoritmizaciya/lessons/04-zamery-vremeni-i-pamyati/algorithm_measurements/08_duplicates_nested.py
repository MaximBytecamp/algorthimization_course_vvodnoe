def has_duplicates_nested(numbers):
    n = len(numbers)

    for i in range(n):
        for j in range(i + 1, n):
            if numbers[i] == numbers[j]:
                return True

    return False
