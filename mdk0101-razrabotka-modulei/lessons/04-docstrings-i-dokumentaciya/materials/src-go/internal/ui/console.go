// Package ui выводит готовый отчёт пользователю.
package ui

import "fmt"

// PrintReport печатает готовый отчёт в консоль построчно.
//
// Функция только печатает: расчёты и форматирование выполняются
// до вызова, в пакетах services и utils.
func PrintReport(lines []string) {
	for _, line := range lines {
		fmt.Println(line)
	}
}
