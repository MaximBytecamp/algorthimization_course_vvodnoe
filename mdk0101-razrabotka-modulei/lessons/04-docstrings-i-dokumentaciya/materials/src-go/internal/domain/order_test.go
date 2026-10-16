package domain

import (
	"errors"
	"testing"
)

func TestNegativeOrderFails(t *testing.T) {
	if _, err := NewOrder("Иванов Пётр", -1); !errors.Is(err, ErrNegativeKopeks) {
		t.Fatalf("err = %v; want ErrNegativeKopeks", err)
	}
}
