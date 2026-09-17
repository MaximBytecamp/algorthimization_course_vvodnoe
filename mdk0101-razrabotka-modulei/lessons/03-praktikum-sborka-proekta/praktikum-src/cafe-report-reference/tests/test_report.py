import unittest

from app.services.report import build_report
from app.utils.money import format_rubles, to_rubles
from app.utils.text import normalize_name, pad

ORDERS = [
    {"waiter": "Анна Петрова", "kopeks": 10000},
    {"waiter": "Мария Ким", "kopeks": 20000},
]


class TestHelpers(unittest.TestCase):
    def test_to_rubles(self):
        self.assertEqual(to_rubles(128050), 1280.5)

    def test_format_rubles(self):
        self.assertEqual(format_rubles(1280.5), "1 280,50 ₽")

    def test_normalize_name(self):
        self.assertEqual(normalize_name("анна   петрова"), "Анна Петрова")

    def test_pad(self):
        self.assertEqual(pad("Анна", 6), "Анна  ")


class TestReport(unittest.TestCase):
    def test_lines(self):
        lines = build_report(ORDERS)
        self.assertEqual(lines[0], "ОТЧЁТ ПО ЗАКАЗАМ")
        self.assertIn("Заказов: 2", lines)
        self.assertTrue(any(line.startswith("Анна Петрова") for line in lines))


if __name__ == "__main__":
    unittest.main()
