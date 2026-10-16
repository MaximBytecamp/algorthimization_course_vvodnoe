package services

import (
	"errors"
	"testing"
)

func TestAverageRoundsToTwoDigits(t *testing.T) {
	got, err := CalculateAverage([]int{5, 4, 5, 3, 5})
	if err != nil || got != 4.4 {
		t.Fatalf("CalculateAverage = %v, %v; want 4.4, nil", got, err)
	}
}

func TestAverageEmptyFails(t *testing.T) {
	if _, err := CalculateAverage(nil); !errors.Is(err, ErrNoGrades) {
		t.Fatalf("err = %v; want ErrNoGrades", err)
	}
}

func TestBoundsReturnsMinThenMax(t *testing.T) {
	low, high, err := GradeBounds([]int{5, 3, 4})
	if err != nil || low != 3 || high != 5 {
		t.Fatalf("GradeBounds = %d, %d, %v; want 3, 5, nil", low, high, err)
	}
}

func TestBoundsEmptyFails(t *testing.T) {
	if _, _, err := GradeBounds(nil); !errors.Is(err, ErrNoGrades) {
		t.Fatalf("err = %v; want ErrNoGrades", err)
	}
}
