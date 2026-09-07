"""Свойства часов · занятие 4.

Python сам рассказывает про свои часы: `time.get_clock_info(имя)`
возвращает разрешение, признак монотонности и системный вызов, на
котором часы построены. Гадать и мерить эти свойства не нужно.

    разрешение   наименьший интервал, который часы различают;
    монотонные   могут ли часы пойти назад.

Запуск:

    python benchmarks/clock_info.py
"""
import time


def main():
    for name in ("perf_counter", "process_time", "time"):
        info = time.get_clock_info(name)
        print(f'{name}:')
        print(f'    разрешение {info.resolution:.3e} с, '
              f'монотонные: {info.monotonic}')
        print(f'    реализация {info.implementation}')


if __name__ == "__main__":
    main()
