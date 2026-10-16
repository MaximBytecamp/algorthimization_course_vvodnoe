package utils

import (
	"strconv"
	"strings"
	"unicode/utf8"
)

// FormatKopeks переводит сумму в копейках в строку с рублями
// вида «1 250,00 ₽»: пробел разделяет тысячи, запятая отделяет копейки.
// Сумма должна быть неотрицательной.
func FormatKopeks(kopeks int) string {
	rubles := strconv.Itoa(kopeks / 100)
	var groups []string
	for len(rubles) > 3 {
		groups = append([]string{rubles[len(rubles)-3:]}, groups...)
		rubles = rubles[:len(rubles)-3]
	}
	groups = append([]string{rubles}, groups...)
	cents := kopeks % 100
	return strings.Join(groups, " ") + "," + strconv.Itoa(cents/10) + strconv.Itoa(cents%10) + " ₽"
}

// FormatTitle центрирует заголовок отчёта, достраивая строку
// знаками «=» до ширины width.
//
// Ширина считается в знаках, а не в байтах. Текст длиннее width
// не обрезается и возвращается как есть.
func FormatTitle(text string, width int) string {
	free := width - utf8.RuneCountInString(text)
	if free <= 0 {
		return text
	}
	left := free / 2
	return strings.Repeat("=", left) + text + strings.Repeat("=", free-left)
}
