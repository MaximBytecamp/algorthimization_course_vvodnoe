def second_by_position(numbers):
    return sorted(numbers)[-2]


def second_distinct(numbers):
    return sorted(set(numbers))[-2]


data = [10, 10, 5]
print("по позиции:", second_by_position(data))
print("различное значение:", second_distinct(data))
