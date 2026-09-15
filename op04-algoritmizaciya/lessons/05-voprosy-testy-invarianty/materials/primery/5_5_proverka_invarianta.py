numbers = [4, 2, 8, 3, 7]

best = numbers[0]
k = 1
assert best == max(numbers[:k])
print(f"k={k} best={best}")

for i in range(1, len(numbers)):
    if numbers[i] > best:
        best = numbers[i]
    k = i + 1
    assert best == max(numbers[:k])
    print(f"k={k} best={best}")
