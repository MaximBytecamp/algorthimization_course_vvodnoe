"""Собирает четыре статичных кадра для презентации занятия 4."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parent
MONO = "/System/Library/Fonts/SFNSMono.ttf"
SANS = "/System/Library/Fonts/SFNS.ttf"
W, H = 1600, 900


def font(size, mono=True):
    return ImageFont.truetype(MONO if mono else SANS, size)


def terminal(name, lines, accent="#6FB8E3", footer=""):
    image = Image.new("RGB", (W, H), "#020835")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((52, 46, 1548, 854), 18, fill="#07103F", outline=accent, width=4)
    draw.rounded_rectangle((52, 46, 1548, 118), 18, fill="#111A55")
    draw.rectangle((52, 96, 1548, 118), fill="#111A55")
    for x, color in ((92, "#FF796F"), (126, "#FFD166"), (160, "#74D680")):
        draw.ellipse((x - 11, 71, x + 11, 93), fill=color)
    draw.text((1488, 70), name, font=font(24), fill="#9FB0E0", anchor="ra")
    y = 154
    for text, color, size, gap in lines:
        draw.text((96, y), text, font=font(size), fill=color)
        y += gap
    if footer:
        draw.text((1500, 816), footer, font=font(19), fill="#7081BD", anchor="ra")
    return image


terminal(
    "clocks.py",
    [
        ("$ python benchmarks/clocks.py", "#6FB8E3", 30, 62),
        ("perf_counter   разрешение 4e-08 с   монотонные", "#E3EAFF", 28, 46),
        ("process_time   разрешение 1e-06 с   монотонные", "#E3EAFF", 28, 68),
        ("Участок: sleep(0.20) + 400 000 сложений", "#9FB0E0", 28, 78),
        ("perf_counter      0.219 с      прошедшее время", "#B8FF45", 31, 54),
        ("process_time      0.016 с      время на CPU", "#B8FF45", 31, 54),
        ("разница           0.203 с      ожидание", "#FF9A85", 31, 88),
        ("Вывод", "#6FB8E3", 29, 52),
        ("Лимит ответа API проверяем по perf_counter.", "#E3EAFF", 30, 48),
        ("Пользователь ждёт прошедшее время.", "#E3EAFF", 30, 44),
    ],
    footer="CPython 3.12.12 · запуск 07.09.2026",
).save(ROOT / "01-clocks-output.png")

terminal(
    "test_lesson_04.py",
    [
        ("$ pytest benchmarks/test_lesson_04.py -q", "#6FB8E3", 30, 76),
        (".......                                           [100%]", "#E3EAFF", 30, 68),
        ("7 passed in 0.18s", "#B8FF45", 34, 90),
        ("Что проверено", "#9FB0E0", 30, 58),
        ("✓ одинаковые данные при одном seed", "#E3EAFF", 29, 48),
        ("✓ один прогрев до серии", "#E3EAFF", 29, 48),
        ("✓ по одному сырому значению на повтор", "#E3EAFF", 29, 48),
        ("✓ генерация данных вне границы", "#E3EAFF", 29, 48),
        ("✓ минимум, медиана, максимум и разброс", "#E3EAFF", 29, 48),
        ("✓ решения сохраняют ожидаемый порядок", "#E3EAFF", 29, 44),
    ],
    footer="проверяется поведение, а не совпадение микросекунд",
).save(ROOT / "02-pytest-green.png")


def csv_shot():
    image = Image.new("RGB", (W, H), "#F2F1E9")
    draw = ImageDraw.Draw(image)
    draw.rectangle((54, 48, 1546, 852), fill="#FFFFFF", outline="#020835", width=5)
    draw.rectangle((54, 48, 1546, 122), fill="#020835")
    draw.text((92, 72), "results_time.csv", font=font(28), fill="#6FB8E3")
    draw.text((1504, 76), "6 размеров · 7 повторов", font=font(21), fill="#9FB0E0", anchor="ra")
    cols = (100, 250, 500, 730, 960, 1190)
    headers = ("n", "list_us", "list_x", "set_us", "set_x", "spread")
    draw.rectangle((82, 156, 1518, 210), fill="#BFE2F5")
    for x, value in zip(cols, headers):
        draw.text((x, 170), value, font=font(24), fill="#020835")
    rows = [
        ("250", "277.916", "—", "5.000", "—", "1.108"),
        ("500", "1022.292", "3.678", "11.416", "2.283", "1.194"),
        ("1000", "3971.417", "3.885", "22.375", "1.960", "1.146"),
        ("2000", "15811.792", "3.981", "47.375", "2.117", "1.040"),
        ("4000", "66023.541", "4.176", "100.667", "2.125", "1.991"),
        ("8000", "263340.625", "3.989", "238.250", "2.367", "1.082"),
    ]
    for index, row in enumerate(rows):
        y = 238 + index * 60
        if index == 4:
            draw.rectangle((82, y - 10, 1518, y + 43), fill="#FFF3F0")
        for col, value in enumerate(row):
            color = "#C4442C" if index == 1 and col in (2, 4) else "#2F395E"
            if index == 4 and col == 5:
                color = "#C4442C"
            draw.text((cols[col], y), value, font=font(24), fill=color)
    draw.line((82, 612, 1518, 612), fill="#020835", width=3)
    draw.text((100, 650), "Читаем строку n = 500", font=font(23), fill="#2D7FC1")
    draw.text((100, 706), "Список вырос в 3,678 раза, множество — в 2,283.", font=font(27, mono=False), fill="#2F395E")
    draw.text((100, 760), "Это наблюдение для одной пары размеров. Разброс остаётся рядом.", font=font(23, mono=False), fill="#6A7396")
    return image


csv_shot().save(ROOT / "03-results-csv.png")

terminal(
    "broken_bench.py",
    [
        ("$ python benchmarks/broken_bench.py", "#6FB8E3", 30, 64),
        ("n    список, мкс   множество, мкс   разница", "#E3EAFF", 28, 48),
        ("250          355.7             83.9      4.2x", "#E3EAFF", 28, 48),
        ("500         1272.9            165.7      7.7x", "#E3EAFF", 28, 48),
        ("1000        4398.8            356.9     12.3x", "#E3EAFF", 28, 70),
        ("Вывод скрипта: «Список можно оставить».", "#FF9A85", 31, 84),
        ("Почему кадр выглядит убедительно", "#9FB0E0", 29, 52),
        ("✓ таблица заполнена   ✓ числа растут   ✓ программа не упала", "#E3EAFF", 27, 72),
        ("Почему верить нельзя", "#FF9A85", 29, 52),
        ("генерация внутри · разные данные · один запуск", "#E3EAFF", 27, 44),
        ("нет прогрева · time.time вместо perf_counter", "#E3EAFF", 27, 40),
    ],
    accent="#FF9A85",
).save(ROOT / "04-broken-bench.png")
