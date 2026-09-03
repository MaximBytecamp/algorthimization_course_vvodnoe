"""Часы Python · занятие 4.

Четыре функции модуля `time` показывают разные величины, и выбор между
ними меняет ответ. Скрипт выполняет один и тот же участок и печатает,
что засчитали разные часы.

    perf_counter   монотонные часы с наибольшим разрешением; то, что
                   принято называть wall-clock time. Считает всё, включая
                   ожидание;
    process_time   процессорное время текущего процесса; ожидание и работу
                   других процессов не считает;
    monotonic      монотонные часы для интервалов; разрешение хуже;
    time           календарное время; может прыгнуть назад при синхронизации
                   часов, поэтому для интервалов не годится.

Запуск:

    python benchmarks/clocks.py
"""
import time


def workload():
    """Смесь ожидания и вычислений — как у обращения к базе или к сети."""
    time.sleep(0.20)                    # ожидание: процессор свободен
    total = 0
    for value in range(400_000):        # вычисление: процессор занят
        total += value
    return total


def main():
    for name in ("perf_counter", "process_time", "monotonic", "time"):
        info = time.get_clock_info(name)
        print(f"{name:<14} разрешение {info.resolution:.0e} с   "
              f"монотонные: {'да' if info.monotonic else 'нет'}")

    print("\nОдин и тот же участок: sleep(0.20) плюс 400 000 сложений\n")
    wall_start = time.perf_counter()
    cpu_start = time.process_time()
    workload()
    wall = time.perf_counter() - wall_start
    cpu = time.process_time() - cpu_start

    print(f"perf_counter  {wall:.3f} с   прошедшее время: ожидание засчитано")
    print(f"process_time  {cpu:.3f} с   процессорное время: ожидание не засчитано")
    print(f"разница       {wall - cpu:.3f} с   процессор в это время был свободен")
    print("\nЛимит ответа API проверяется по perf_counter: пользователь ждёт")
    print("прошедшее время. Стоимость вычислений сравнивается по process_time:")
    print("иначе в число попадёт чужая нагрузка на той же машине.")


if __name__ == "__main__":
    main()
