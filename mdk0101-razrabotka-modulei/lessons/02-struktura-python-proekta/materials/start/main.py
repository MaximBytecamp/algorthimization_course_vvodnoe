def calculate_average(values: list[int]) -> float:
    if not values:
        raise ValueError("Список оценок не должен быть пустым")
    return sum(values) / len(values)


def format_average(value: float) -> str:
    return f"Средний результат: {value:.2f}"


def main():
    values = [5, 4, 5, 3, 5]
    average = calculate_average(values)
    print(format_average(average))


if __name__ == "__main__":
    main()
