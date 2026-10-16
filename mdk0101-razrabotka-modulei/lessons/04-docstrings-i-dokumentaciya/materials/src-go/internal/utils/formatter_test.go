package utils

import (
	"testing"
	"unicode/utf8"
)

func TestKopeksToRubles(t *testing.T) {
	if got := FormatKopeks(125000); got != "1 250,00 ₽" {
		t.Fatalf("FormatKopeks(125000) = %q", got)
	}
}

func TestZeroKopeks(t *testing.T) {
	if got := FormatKopeks(0); got != "0,00 ₽" {
		t.Fatalf("FormatKopeks(0) = %q", got)
	}
}

func TestTitleHasGivenWidth(t *testing.T) {
	if got := FormatTitle(" Смена ", 40); utf8.RuneCountInString(got) != 40 {
		t.Fatalf("ширина = %d", utf8.RuneCountInString(got))
	}
}
