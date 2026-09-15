"""Проверки контрактов темы 5. Стандартная библиотека Python."""
import unittest
from reference import second_max, contains_zero, is_sorted


class SolutionsTests(unittest.TestCase):
    def test_second_max(self):
        cases = [([], None), ([7], None), ([4, 4], None),
                 ([1, 5, 3], 3), ([-10, -3, -5], -5),
                 ([5, 5, 3], 3), ([5, 0], 0), ([5, -1], -1),
                 ([10, 5], 5), ([5, 10], 5), ([0, -1, 0], -1),
                 ([-10**9, 10**9], -10**9)]
        for data, expected in cases:
            with self.subTest(data=data):
                before = data.copy()
                self.assertEqual(second_max(data), expected)
                self.assertEqual(data, before)

    def test_contains_zero(self):
        cases = [([], False), ([0], True), ([4, 8, 0], True),
                 ([0, 4], True), ([4, 0, 8], True),
                 ([-2, 3], False), ([0, 0], True), ([7], False)]
        for data, expected in cases:
            with self.subTest(data=data):
                before = data.copy()
                self.assertIs(contains_zero(data), expected)
                self.assertEqual(data, before)

    def test_is_sorted(self):
        cases = [([], True), ([7], True), ([1, 2, 2, 4], True),
                 ([2, 2], True), ([1, 3, 2], False),
                 ([-5, -2, 0], True), ([3, 1], False),
                 ([3, 2, 1], False)]
        for data, expected in cases:
            with self.subTest(data=data):
                before = data.copy()
                self.assertIs(is_sorted(data), expected)
                self.assertEqual(data, before)

    def test_input_boundaries(self):
        self.assertIsNone(second_max([10**9] * 100_000))
        self.assertEqual(second_max([-10**9] * 99_999 + [10**9]), -10**9)
        self.assertFalse(contains_zero([10**9] * 100_000))
        self.assertTrue(contains_zero([10**9] * 99_999 + [0]))
        self.assertTrue(is_sorted([-10**9] * 100_000))
        self.assertFalse(is_sorted([10**9] * 99_999 + [-10**9]))


if __name__ == "__main__":
    unittest.main()
