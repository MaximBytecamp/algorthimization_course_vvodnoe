"""Дополнительные задачи занятия 13. Проверка: python -m pytest tests_extra.py -v

Символы во всех трёх задачах сравниваются как есть, с регистром.
"""


def max_words(text, word):
    """Сколько раз можно составить word из символов text, LeetCode 1189.

    Каждый символ text используется не больше одного раза. В LeetCode word
    всегда 'balloon'; здесь word любой непустой. Время O(n + m).
    Пример: max_words('loonbalxballpoon', 'balloon') → 2.
    """
    raise NotImplementedError


def is_isomorphic(s, t):
    """Изоморфные строки, LeetCode 205.

    Каждый символ s заменяется одним и тем же символом так, чтобы получилась t;
    два разных символа s не могут перейти в один. len(s) == len(t).
    Пример: 'egg', 'add' → True; 'foo', 'bar' → False. Время O(n).
    """
    raise NotImplementedError


def good_words_length(words, chars):
    """Сумма длин слов, которые составляются из chars, LeetCode 1160.

    Для каждого слова символы chars используются заново, каждый не больше
    одного раза. Пример: ['cat', 'bt', 'hat', 'tree'], 'atach' → 6.
    """
    raise NotImplementedError
