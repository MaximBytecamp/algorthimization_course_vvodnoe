def second_max(numbers):
    first = 0
    second = 0
    for value in numbers:
        before = (first, second)
        if value > first:
            second = first
            first = value
            branch = "if"
        elif value > second:
            second = value
            branch = "elif"
        else:
            branch = "нет"
        print(f"value={value:>3} до={before} ветка={branch:4} после={(first, second)}")
    return second


print("результат:", second_max([-10, -3, -5]))
