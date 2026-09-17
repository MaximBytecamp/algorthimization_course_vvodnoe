import unittest

from app.services.validation import is_email, is_phone, normalize_phone, password_problems


class TestValidation(unittest.TestCase):
    def test_is_email(self):
        self.assertTrue(is_email("student@college.ru"))
        self.assertFalse(is_email("не почта"))
        self.assertFalse(is_email("student@college"))

    def test_normalize_phone(self):
        self.assertEqual(normalize_phone("8 (900) 123-45-67"), "+79001234567")
        self.assertEqual(normalize_phone("900 123 45 67"), "+79001234567")

    def test_normalize_phone_error(self):
        with self.assertRaises(ValueError):
            normalize_phone("123")

    def test_is_phone(self):
        self.assertTrue(is_phone("+7 900 123-45-67"))
        self.assertFalse(is_phone("123"))

    def test_password_problems(self):
        self.assertEqual(password_problems("Qwerty12345"), [])
        self.assertEqual(len(password_problems("qwerty")), 3)


if __name__ == "__main__":
    unittest.main()
