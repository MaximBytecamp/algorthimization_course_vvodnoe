import unittest

from app.services.statistics import average, count_values, median, spread


class TestStatistics(unittest.TestCase):
    def test_average(self):
        self.assertEqual(average([5, 4, 3]), 4)

    def test_average_empty(self):
        with self.assertRaises(ValueError):
            average([])

    def test_median(self):
        self.assertEqual(median([5, 1, 3]), 3)
        self.assertEqual(median([4, 1, 3, 2]), 2.5)

    def test_spread(self):
        self.assertEqual(spread([5, 4, 3]), 2)

    def test_count_values(self):
        self.assertEqual(count_values(["зачёт", "незачёт", "зачёт"]), {"зачёт": 2, "незачёт": 1})


if __name__ == "__main__":
    unittest.main()
