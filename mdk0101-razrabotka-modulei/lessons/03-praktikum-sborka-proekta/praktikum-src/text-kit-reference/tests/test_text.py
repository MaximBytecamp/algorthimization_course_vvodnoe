import unittest

from app.utils.text import clean_spaces, initials, shorten, slug


class TestText(unittest.TestCase):
    def test_clean_spaces(self):
        self.assertEqual(clean_spaces("  Отчёт   за март  "), "Отчёт за март")

    def test_shorten(self):
        self.assertEqual(shorten("Отчёт за март", 10), "Отчёт за…")
        self.assertEqual(shorten("Коротко", 10), "Коротко")

    def test_initials(self):
        self.assertEqual(initials("Пётр Иванович Смирнов"), "П. И. Смирнов")

    def test_initials_empty(self):
        with self.assertRaises(ValueError):
            initials("   ")

    def test_slug(self):
        self.assertEqual(slug("Отчёт за март"), "otchet-za-mart")


if __name__ == "__main__":
    unittest.main()
