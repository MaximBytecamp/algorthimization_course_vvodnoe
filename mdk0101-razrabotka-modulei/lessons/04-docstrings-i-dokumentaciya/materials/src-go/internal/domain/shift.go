package domain

import "time"

// Shift — смена кафе: заказы одного рабочего дня.
//
// Заказы хранятся в порядке добавления.
type Shift struct {
	Day    time.Time // дата смены
	Orders []Order   // заказы в порядке поступления
}

// NewShift создаёт пустую смену на указанную дату.
func NewShift(day time.Time) *Shift {
	return &Shift{Day: day}
}

// Add добавляет заказ в конец списка смены.
func (s *Shift) Add(order Order) {
	s.Orders = append(s.Orders, order)
}

// TotalKopeks возвращает выручку смены в копейках; у пустой смены — 0.
func (s *Shift) TotalKopeks() int {
	total := 0
	for _, order := range s.Orders {
		total += order.Kopeks
	}
	return total
}
