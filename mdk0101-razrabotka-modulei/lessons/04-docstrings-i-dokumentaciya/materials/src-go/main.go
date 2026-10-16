// Программа «Отчёт кафе» читает файл смены, считает выручку
// по официантам и печатает отчёт в консоль.
//
// Запуск из папки с go.mod:
//
//	go run .
package main

import (
	"fmt"
	"log"

	"example.com/otchet-kafe/internal/services"
	"example.com/otchet-kafe/internal/ui"
	"example.com/otchet-kafe/internal/utils"
)

// buildReport собирает строки отчёта по файлу смены: заголовок с датой,
// строку на каждого официанта и итог.
//
// Ошибка возвращается, если файла нет, в нём нет ни одного заказа
// или сумма записана не целым числом.
func buildReport(path string) ([]string, error) {
	orders, err := services.LoadOrders(path)
	if err != nil {
		return nil, err
	}
	revenue, err := services.RevenueByWaiter(orders, 0)
	if err != nil {
		return nil, err
	}
	lines := []string{utils.FormatTitle(" Смена "+utils.TodayLabel()+" ", 40)}
	total := 0
	for _, row := range revenue {
		lines = append(lines, fmt.Sprintf("%-20s%20s", row.Waiter, utils.FormatKopeks(row.Kopeks)))
		total += row.Kopeks
	}
	lines = append(lines, utils.FormatTitle(" Итого "+utils.FormatKopeks(total)+" ", 40))
	return lines, nil
}

func main() {
	lines, err := buildReport("data/smena.csv")
	if err != nil {
		log.Fatal(err)
	}
	ui.PrintReport(lines)
}
