// Package services — служебный слой: чтение данных и расчёты.
//
// Функции пакета работают только с данными и ничего не печатают.
package services

import (
	"errors"
	"math"
	"slices"
)

// ErrNoGrades возвращается, если список оценок пуст.
var ErrNoGrades = errors.New("список оценок пуст")

// CalculateAverage считает среднюю оценку по списку и округляет
// её до двух знаков после запятой.
//
// Для пустого списка возвращается [ErrNoGrades]: среднее по пустому
// списку не определено, поэтому нуль в этом случае не возвращается.
func CalculateAverage(grades []int) (float64, error) {
	if len(grades) == 0 {
		return 0, ErrNoGrades
	}
	sum := 0
	for _, grade := range grades {
		sum += grade
	}
	// Сумма переводится в float64 до деления: деление двух int
	// отбросило бы дробную часть, и среднее 4.4 стало бы 4.
	return math.Round(float64(sum)/float64(len(grades))*100) / 100, nil
}

// GradeBounds находит минимальную и максимальную оценку — именно
// в этом порядке. Для пустого списка возвращается [ErrNoGrades].
func GradeBounds(grades []int) (low, high int, err error) {
	if len(grades) == 0 {
		return 0, 0, ErrNoGrades
	}
	return slices.Min(grades), slices.Max(grades), nil
}
