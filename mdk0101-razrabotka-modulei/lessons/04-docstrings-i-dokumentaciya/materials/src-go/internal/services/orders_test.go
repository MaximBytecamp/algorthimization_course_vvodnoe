package services

import (
	"errors"
	"testing"

	"example.com/otchet-kafe/internal/domain"
)

func mustOrder(t *testing.T, waiter string, kopeks int) domain.Order {
	t.Helper()
	order, err := domain.NewOrder(waiter, kopeks)
	if err != nil {
		t.Fatal(err)
	}
	return order
}

func TestRevenueGroupsByWaiter(t *testing.T) {
	orders := []domain.Order{mustOrder(t, "иванов пётр", 100), mustOrder(t, "ИВАНОВ ПЁТР", 250)}
	got, err := RevenueByWaiter(orders, 0)
	if err != nil || len(got) != 1 || got[0] != (WaiterRevenue{"Иванов Пётр", 350}) {
		t.Fatalf("RevenueByWaiter = %v, %v", got, err)
	}
}

func TestRevenueSortsBySum(t *testing.T) {
	orders := []domain.Order{mustOrder(t, "Иванов Пётр", 100), mustOrder(t, "Петрова Анна", 900)}
	got, _ := RevenueByWaiter(orders, 0)
	if got[0].Waiter != "Петрова Анна" || got[1].Waiter != "Иванов Пётр" {
		t.Fatalf("порядок = %v", got)
	}
}

func TestRevenueEmptyFails(t *testing.T) {
	if _, err := RevenueByWaiter(nil, 0); !errors.Is(err, ErrNoOrders) {
		t.Fatalf("err = %v; want ErrNoOrders", err)
	}
}

func TestSortInPlaceChangesCallerSlice(t *testing.T) {
	orders := []domain.Order{mustOrder(t, "Иванов Пётр", 100), mustOrder(t, "Петрова Анна", 900)}
	SortOrdersInPlace(orders)
	if orders[0].Kopeks != 900 {
		t.Fatalf("первый заказ = %v", orders[0])
	}
}
