package services

import (
	"errors"
	"slices"
	"strconv"

	"example.com/otchet-kafe/internal/domain"
)

// ErrNoOrders возвращается, если список заказов пуст.
var ErrNoOrders = errors.New("список заказов пуст")

// WaiterRevenue — выручка одного официанта за смену.
type WaiterRevenue struct {
	Waiter string // имя официанта
	Kopeks int    // выручка в копейках
}

// LoadOrders читает заказы из файла смены с колонками waiter и kopeks.
//
// Заказы возвращаются в порядке строк файла. Ошибка возвращается, если
// файла нет или в колонке kopeks записано не целое число.
func LoadOrders(path string) ([]domain.Order, error) {
	var orders []domain.Order
	for row, err := range ReadRows(path) {
		if err != nil {
			return nil, err
		}
		kopeks, err := strconv.Atoi(row["kopeks"])
		if err != nil {
			return nil, err
		}
		order, err := domain.NewOrder(row["waiter"], kopeks)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, nil
}

// RevenueByWaiter считает выручку по каждому официанту и возвращает
// её в порядке убывания суммы.
//
// Параметр top ограничивает число официантов в результате;
// значение 0 означает «все». Для пустого списка заказов
// возвращается [ErrNoOrders].
func RevenueByWaiter(orders []domain.Order, top int) ([]WaiterRevenue, error) {
	if len(orders) == 0 {
		return nil, ErrNoOrders
	}
	totals := map[string]int{}
	var names []string
	for _, order := range orders {
		if _, seen := totals[order.Waiter]; !seen {
			names = append(names, order.Waiter)
		}
		totals[order.Waiter] += order.Kopeks
	}
	ranked := make([]WaiterRevenue, 0, len(names))
	for _, name := range names {
		ranked = append(ranked, WaiterRevenue{Waiter: name, Kopeks: totals[name]})
	}
	slices.SortStableFunc(ranked, func(a, b WaiterRevenue) int {
		return b.Kopeks - a.Kopeks
	})
	if top > 0 && top < len(ranked) {
		ranked = ranked[:top]
	}
	return ranked, nil
}

// SortOrdersInPlace сортирует заказы по убыванию суммы, меняя порядок
// элементов в переданном срезе; новый срез не создаётся.
//
// Вызывающий код после вызова видит изменённый порядок. Чтобы сохранить
// исходный, передают копию: SortOrdersInPlace(slices.Clone(orders)).
func SortOrdersInPlace(orders []domain.Order) {
	slices.SortStableFunc(orders, func(a, b domain.Order) int {
		return b.Kopeks - a.Kopeks
	})
}
