import unittest
from datetime import date

from app.utils.dates import days_between, format_date, is_weekend, parse_date


class TestDates(unittest.TestCase):
    def test_parse_date(self):
        self.assertEqual(parse_date("17.09.2026"), date(2026, 9, 17))

    def test_format_date(self):
        self.assertEqual(format_date(date(2026, 3, 2)), "02.03.2026")

    def test_is_weekend(self):
        self.assertTrue(is_weekend(date(2026, 3, 7)))
        self.assertFalse(is_weekend(date(2026, 3, 2)))

    def test_days_between(self):
        self.assertEqual(days_between(date(2026, 3, 2), date(2026, 3, 31)), 29)
        self.assertEqual(days_between(date(2026, 3, 31), date(2026, 3, 2)), 29)


if __name__ == "__main__":
    unittest.main()
