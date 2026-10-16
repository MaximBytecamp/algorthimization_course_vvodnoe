package services

import (
	"os"
	"strings"
)

// SaveReport записывает отчёт в текстовый файл в кодировке UTF-8
// и возвращает количество записанных строк.
//
// Существующий файл перезаписывается. Родительская папка должна
// существовать: если её нет или на запись не хватает прав,
// возвращается ошибка и 0.
func SaveReport(path string, lines []string) (int, error) {
	err := os.WriteFile(path, []byte(strings.Join(lines, "\n")), 0o644)
	if err != nil {
		return 0, err
	}
	return len(lines), nil
}
