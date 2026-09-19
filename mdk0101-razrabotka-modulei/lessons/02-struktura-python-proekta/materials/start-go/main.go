package main

import (
	"errors"
	"fmt"
)

func calculateAverage(values []int) (float64, error) {
	if len(values) == 0 {
		return 0, errors.New("список оценок не должен быть пустым")
	}
	sum := 0
	for _, value := range values {
		sum += value
	}
	return float64(sum) / float64(len(values)), nil
}

func formatAverage(value float64) string {
	return fmt.Sprintf("Средний результат: %.2f", value)
}

func main() {
	values := []int{5, 4, 5, 3, 5}
	average, err := calculateAverage(values)
	if err != nil {
		fmt.Println("Ошибка:", err)
		return
	}
	fmt.Println(formatAverage(average))
}
