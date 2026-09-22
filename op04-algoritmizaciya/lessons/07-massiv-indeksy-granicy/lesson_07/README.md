# lesson_07 · стартовый набор

Материалы к занятию 7 ОП.04 «Массив: индексы, проходы, границы».

| Файл | Что в нём |
|---|---|
| `task.md` | условия трёх задач, примеры и ограничения |
| `solution.py` | сигнатуры функций с контрактами, тела не написаны |
| `tests.py` | 27 публичных тестов pytest и место для своих |
| `complexity_note.md` | шаблон заметки об инвариантах и сложности |
| `change_card.md` | карточка изменения условия, выдаётся после зелёных тестов задачи 3 |
| `homework_07.md` | домашнее задание |
| `bugs_07.py` | три функции с ошибкой на границе для домашнего задания |

## Как начать

```bash
cp -r lesson_07 ~/algo-portfolio/portfolio/lesson_07
cd ~/algo-portfolio/portfolio/lesson_07
python -m pip install pytest        # если pytest ещё не установлен
python -m pytest tests.py -v
```

До первого решения все тесты падают с `NotImplementedError`: так и должно быть.
Решайте по одной функции и запускайте только её тесты:

```bash
python -m pytest tests.py -v -k streak
python -m pytest tests.py -v -k reverse
python -m pytest tests.py -v -k remove
```

## Без интернета

Все файлы работают локально. Если репозиторий недоступен, папка сдаётся архивом
`Фамилия_группа_lesson_07.zip` с тем же содержимым.
