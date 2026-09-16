"""Проверка: все варианты решают свою задачу одинаково.

Запуск из этой папки: python3 -m unittest -v test_variantov.py

Проверка нужна, чтобы выбор варианта шёл по ограничениям, а не по
сомнениям в правильности: все десять реализаций возвращают один ответ,
пока соблюдены их требования к входу.
"""
import unittest

import zadacha_a_kth as A
import zadacha_b_poisk as B

VHODY_A = [
    ([7, 2, 9, 9, 4, 1], 1),
    ([7, 2, 9, 9, 4, 1], 2),
    ([7, 2, 9, 9, 4, 1], 6),
    ([5], 1),
    ([3, 3, 3], 2),
    ([0, 10, 5, 10], 3),
]

VHODY_B = [
    ([4, 1, 9, 4, 7], [4, 5, 9, 0]),
    ([0], [0, 1]),
    ([2, 2, 2], [2, 3]),
    ([1, 3, 5, 7], [7, 6, 1]),
    ([], [1]),
]


class ZadachaA(unittest.TestCase):
    def etalon(self, numbers, k):
        return sorted(numbers, reverse=True)[k - 1]

    def test_obshchiy_kontrakt(self):
        """Восемь вариантов работают на любом допустимом входе."""
        obshchie = [A.v01_sort_kopii, A.v02_sort_na_meste, A.v03_nlargest,
                    A.v04_kucha_iz_k, A.v05_k_prohodov, A.v06_quickselect,
                    A.v07_schetchik, A.v08_bisect_top_k]
        for numbers, k in VHODY_A:
            for variant in obshchie:
                with self.subTest(variant=variant.__name__, vhod=numbers, k=k):
                    self.assertEqual(variant(list(numbers), k), self.etalon(numbers, k))

    def test_v02_menyaet_vhod(self):
        """v02 сортирует переданный список: это его цена за O(1) памяти."""
        numbers = [7, 2, 9]
        A.v02_sort_na_meste(numbers, 2)
        self.assertEqual(numbers, [2, 7, 9])
        kopiya = [7, 2, 9]
        A.v01_sort_kopii(kopiya, 2)
        self.assertEqual(kopiya, [7, 2, 9])

    def test_v09_tolko_k2(self):
        """v09 отвечает верно при k = 2 и отказывается при другом k."""
        for numbers, k in VHODY_A:
            if k == 2:
                self.assertEqual(A.v09_dve_peremennye(numbers, 2), self.etalon(numbers, 2))
        with self.assertRaises(ValueError):
            A.v09_dve_peremennye([1, 2, 3], 3)

    def test_v10_drugoy_kontrakt(self):
        """v10 отвечает на другой вопрос: k-е различное значение."""
        self.assertEqual(A.v10_razlichnye([10, 10, 5], 2), 5)
        self.assertEqual(A.v01_sort_kopii([10, 10, 5], 2), 10)

    def test_v07_trebuet_neotricatelnyh(self):
        """v07 строит массив по значениям, поэтому отрицательные ему не подходят."""
        with self.assertRaises(IndexError):
            A.v07_schetchik([-1, -5], 1)


class ZadachaB(unittest.TestCase):
    def etalon(self, numbers, zaprosy):
        gotovyy = set(numbers)
        return [x in gotovyy for x in zaprosy]

    def test_obshchiy_kontrakt(self):
        """Восемь вариантов работают на любом списке целых чисел."""
        obshchie = [B.v01_lineyno_kazhdyy, B.v02_operator_in, B.v03_set_zaranee,
                    B.v04_sort_kopii_bisect, B.v05_sort_na_meste_bisect,
                    B.v07_slovar_kolichestv, B.v08_set_kazhdyy_raz,
                    B.v10_sliyanie_zaprosov]
        for numbers, zaprosy in VHODY_B:
            for variant in obshchie:
                with self.subTest(variant=variant.__name__, vhod=numbers):
                    self.assertEqual(variant(list(numbers), list(zaprosy)),
                                     self.etalon(numbers, zaprosy))

    def test_v06_trebuet_neotricatelnyh(self):
        """v06 держит флаги по значениям: нужен непустой список от 0 до m."""
        for numbers, zaprosy in VHODY_B:
            if numbers and min(numbers) >= 0:
                self.assertEqual(B.v06_flagi(list(numbers), list(zaprosy)),
                                 self.etalon(numbers, zaprosy))

    def test_v09_trebuet_sortirovki(self):
        """v09 верен на отсортированном входе и ошибается на неотсортированном."""
        self.assertEqual(B.v09_binarnyy_poisk_svoy([1, 4, 4, 7, 9], [4, 5]), [True, False])
        self.assertEqual(B.v09_binarnyy_poisk_svoy([5, 9, 1], [1]), [False])

    def test_v05_menyaet_vhod(self):
        """v05 сортирует переданный список, v04 работает с копией."""
        numbers = [4, 1, 9]
        B.v05_sort_na_meste_bisect(numbers, [4])
        self.assertEqual(numbers, [1, 4, 9])
        kopiya = [4, 1, 9]
        B.v04_sort_kopii_bisect(kopiya, [4])
        self.assertEqual(kopiya, [4, 1, 9])


if __name__ == '__main__':
    unittest.main(verbosity=2)
