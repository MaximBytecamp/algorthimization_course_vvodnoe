package services

import (
	"math"
	"testing"
)

func TestCalculateAverage(t *testing.T) {
	got, err := CalculateAverage([]int{5, 4, 5, 3, 5})
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if math.Abs(got-4.4) > 1e-9 {
		t.Errorf("среднее = %v, ожидалось 4.4", got)
	}
}

func TestCalculateAverageEmpty(t *testing.T) {
	_, err := CalculateAverage([]int{})
	if err == nil {
		t.Error("для пустого среза ожидалась ошибка, её нет")
	}
}
