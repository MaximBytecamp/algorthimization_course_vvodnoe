package utils

import (
	"strings"
	"unicode"
)

// squashSpaces заменяет подряд идущие пробелы одним
// и убирает пробелы по краям.
func squashSpaces(value string) string {
	return strings.Join(strings.Fields(value), " ")
}

// NormalizeName приводит имя официанта к виду «Фамилия Имя»: лишние
// пробелы убираются, каждое слово начинается с заглавной буквы.
//
// Имена в файле записаны по-разному, а заказы группируются по совпадению
// строк, поэтому вызывать функцию нужно сразу при чтении данных.
func NormalizeName(name string) string {
	words := strings.Fields(strings.ToLower(squashSpaces(name)))
	for i, word := range words {
		runes := []rune(word)
		runes[0] = unicode.ToUpper(runes[0])
		words[i] = string(runes)
	}
	return strings.Join(words, " ")
}
