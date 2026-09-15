minimum = 0
for value in [5, 8, 2]:
    if value < minimum:
        minimum = value
print(minimum)

numbers = [5, 8, 2]
minimum = numbers[0]
for value in numbers[1:]:
    if value < minimum:
        minimum = value
print(minimum)
