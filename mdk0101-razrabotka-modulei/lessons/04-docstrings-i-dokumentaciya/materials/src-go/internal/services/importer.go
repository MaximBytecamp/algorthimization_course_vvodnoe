package services

import (
	"encoding/csv"
	"errors"
	"io"
	"iter"
	"os"
)

// ReadRows читает CSV-файл построчно, не загружая его целиком в память.
//
// Первая строка файла — заголовок, по нему строятся ключи словаря.
// Каждый шаг перебора отдаёт очередную строку в виде словаря
// «колонка — значение» или ошибку; после ошибки перебор заканчивается.
// Файл закрывается, когда перебор закончен или прерван.
func ReadRows(path string) iter.Seq2[map[string]string, error] {
	return func(yield func(map[string]string, error) bool) {
		file, err := os.Open(path)
		if err != nil {
			yield(nil, err)
			return
		}
		defer file.Close()

		reader := csv.NewReader(file)
		header, err := reader.Read()
		if err != nil {
			yield(nil, err)
			return
		}
		for {
			record, err := reader.Read()
			if errors.Is(err, io.EOF) {
				return
			}
			if err != nil {
				yield(nil, err)
				return
			}
			row := make(map[string]string, len(header))
			for i, name := range header {
				row[name] = record[i]
			}
			if !yield(row, nil) {
				return
			}
		}
	}
}
