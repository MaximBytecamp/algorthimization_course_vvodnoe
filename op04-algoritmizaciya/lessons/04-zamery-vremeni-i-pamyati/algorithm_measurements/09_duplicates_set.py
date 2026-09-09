def has_duplicates_set(numbers):
    seen = set()

    for number in numbers:
        if number in seen:
            return True

        seen.add(number)

    return False
