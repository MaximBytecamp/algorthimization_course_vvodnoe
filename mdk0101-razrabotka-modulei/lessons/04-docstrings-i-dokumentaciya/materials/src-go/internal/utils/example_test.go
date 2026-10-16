package utils_test

import (
	"fmt"

	"example.com/otchet-kafe/internal/utils"
)

func ExampleFormatKopeks() {
	fmt.Println(utils.FormatKopeks(125000))
	fmt.Println(utils.FormatKopeks(0))
	// Output:
	// 1 250,00 ₽
	// 0,00 ₽
}

func ExampleFormatTitle() {
	fmt.Println(utils.FormatTitle(" Итог ", 20))
	// Output:
	// ======= Итог =======
}
