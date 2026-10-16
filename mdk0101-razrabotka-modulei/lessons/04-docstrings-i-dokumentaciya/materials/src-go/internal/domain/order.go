// Package domain описывает объекты предметной области: заказ и смену.
package domain

import (
	"errors"

	"example.com/otchet-kafe/internal/utils"
)

// ErrNegativeKopeks возвращается, если сумма заказа меньше нуля.
var ErrNegativeKopeks = errors.New("сумма заказа не может быть отрицательной")

// Order — один заказ из файла смены.
//
// Создавать заказ нужно через [NewOrder]: она проверяет сумму
// и приводит имя официанта к виду «Фамилия Имя».
type Order struct {
	Waiter string // имя официанта в виде «Фамилия Имя»
	Kopeks int    // сумма заказа в копейках, неотрицательная
}

// NewOrder создаёт заказ с проверкой данных.
//
// Имя официанта нормализуется функцией [utils.NormalizeName].
// Если сумма отрицательная, возвращается [ErrNegativeKopeks].
func NewOrder(waiter string, kopeks int) (Order, error) {
	if kopeks < 0 {
		return Order{}, ErrNegativeKopeks
	}
	return Order{Waiter: utils.NormalizeName(waiter), Kopeks: kopeks}, nil
}
