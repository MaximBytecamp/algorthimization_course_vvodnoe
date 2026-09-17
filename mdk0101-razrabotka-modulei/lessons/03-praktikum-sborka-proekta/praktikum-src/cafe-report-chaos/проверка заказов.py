import unittest

from app.services.orders import average_kopeks, kopeks_by_waiter, total_kopeks

ORDERS = [
    {"waiter": "Анна Петрова", "kopeks": 10000},
    {"waiter": "Мария Ким", "kopeks": 20000},
    {"waiter": "Анна Петрова", "kopeks": 30000},
]


class TestOrders(unittest.TestCase):
    def test_total(self):
        self.assertEqual(total_kopeks(ORDERS), 60000)

    def test_average(self):
        self.assertEqual(average_kopeks(ORDERS), 20000)

    def test_average_empty(self):
        with self.assertRaises(ValueError):
            average_kopeks([])

    def test_by_waiter(self):
        self.assertEqual(kopeks_by_waiter(ORDERS), {"Анна Петрова": 40000, "Мария Ким": 20000})


if __name__ == "__main__":
    unittest.main()
