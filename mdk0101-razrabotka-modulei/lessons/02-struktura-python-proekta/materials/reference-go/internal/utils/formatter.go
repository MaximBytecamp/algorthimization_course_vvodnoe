package utils

import "fmt"

// FormatAverage превращает число в строку с двумя знаками после точки.
func FormatAverage(value float64) string {
	return fmt.Sprintf("Средний результат: %.2f", value)
}
