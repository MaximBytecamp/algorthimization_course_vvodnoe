"""Рабочие примеры лекции. Запуск: python3 examples.py."""

def find_max(numbers):
    if not numbers:
        raise ValueError("numbers must not be empty")
    best = numbers[0]
    for i in range(1, len(numbers)):
        if numbers[i] > best:
            best = numbers[i]
    return best


if __name__ == "__main__":
    print(find_max([-8, -3, -10]))  # -3
    try:
        find_max([])
    except ValueError as error:
        print(type(error).__name__)  # ValueError
    a = 2_000_000_000
    b = 2_000_000_000
    print(a + b)  # 4000000000
    print(10 ** 100 > 2 ** 63)  # True
    numbers = [4, 2, 8, 3, 7]
    best = numbers[0]
    print(1, best)
    for i in range(1, len(numbers)):
        if numbers[i] > best:
            best = numbers[i]
        print(i + 1, best)
