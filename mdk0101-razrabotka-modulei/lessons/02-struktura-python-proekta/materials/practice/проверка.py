import unittest
from app.services.calculator import calculate_average
from app.utils.formatter import format_average


class AverageTests(unittest.TestCase):
    def test_average(self):
        self.assertAlmostEqual(calculate_average([5, 4, 5, 3, 5]), 4.4)

    def test_empty(self):
        with self.assertRaises(ValueError):
            calculate_average([])

    def test_format(self):
        self.assertEqual(format_average(4.4), "Средний результат: 4.40")


if __name__ == "__main__":
    unittest.main()
