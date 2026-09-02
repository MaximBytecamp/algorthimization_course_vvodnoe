"""Выдаётся студенту, когда в репозитории появляется вторая папка занятия.

В каждой папке лежит свой solution.py. Без этого файла pytest, запущенный из
корня, импортирует первый попавшийся solution и подставляет его во все тесты.
Здесь мы сбрасываем кэш модуля перед импортом очередного набора тестов.

Класть в корень репозитория студента.
"""
import sys

import pytest

MODULES = ("solution",)


@pytest.hookimpl(tryfirst=True)
def pytest_pycollect_makemodule(module_path, parent):
    for name in MODULES:
        sys.modules.pop(name, None)
    return None
