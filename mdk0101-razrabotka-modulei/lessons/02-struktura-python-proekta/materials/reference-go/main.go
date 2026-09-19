package main

import (
	"github.com/fatih/color"

	"example.com/student-tools/internal/services"
	"example.com/student-tools/internal/utils"
)

func main() {
	values := []int{5, 4, 5, 3, 5}
	average, err := services.CalculateAverage(values)
	if err != nil {
		color.Red("Ошибка: %v", err)
		return
	}
	color.Green(utils.FormatAverage(average))
}
