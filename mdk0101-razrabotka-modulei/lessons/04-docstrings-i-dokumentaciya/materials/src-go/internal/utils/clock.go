package utils

import "time"

// TodayLabel возвращает текущую дату в виде «21.09.2026» для шапки отчёта.
func TodayLabel() string {
	return time.Now().Format("02.01.2006")
}
