package services

import "errors"

// CalculateAverage возвращает среднюю оценку или ошибку для пустого среза.
func CalculateAverage(values []int) (float64, error) {
	if len(values) == 0 {
		return 0, errors.New("список оценок не должен быть пустым")
	}
	sum := 0
	for _, value := range values {
		sum += value
	}
	return float64(sum) / float64(len(values)), nil
}
