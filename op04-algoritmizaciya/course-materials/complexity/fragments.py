"""Двенадцать фрагментов для разметки сложности · занятие 3.

Каждая функция рабочая: её можно запустить и посмотреть, что она делает.
Ваша задача — не переписать код, а назвать его стоимость.

Для каждого фрагмента в answers.py укажите:
    время   T(n)  — как растёт число операций с ростом входа;
    память  S(n)  — сколько дополнительной памяти нужно сверх самого входа.

Дополнительная память — это то, что функция создаёт сама. Список, который
пришёл в аргументах, в S(n) не входит: он уже существовал до вызова.

Проверка:
    pytest course-materials/complexity/test_lesson_03.py

Запуск для просмотра результатов:
    python course-materials/complexity/fragments.py
"""


# --- 01 · стадион: поиск пропуска в списке ------------------------------
def find_pass(passes, code):
    """Возвращает индекс пропуска code или -1, если такого нет."""
    for i in range(len(passes)):
        if passes[i] == code:
            return i
    return -1


# --- 02 · пункт выдачи: первая и последняя заявка смены ------------------
def first_and_last(orders):
    """Возвращает пару (первая заявка, последняя заявка) или None."""
    if not orders:
        return None
    return orders[0], orders[-1]


# --- 03 · проходная: есть ли одинаковые пропуска -------------------------
def has_duplicate_badges(badges):
    """True, если в списке есть хотя бы два одинаковых номера."""
    for i in range(len(badges)):
        for j in range(i + 1, len(badges)):
            if badges[i] == badges[j]:
                return True
    return False


# --- 04 · проходная: то же самое через множество -------------------------
def has_duplicate_badges_fast(badges):
    """True, если в списке есть хотя бы два одинаковых номера."""
    seen = set()
    for badge in badges:
        if badge in seen:
            return True
        seen.add(badge)
    return False


# --- 05 · прайс склада: три самые дешёвые позиции ------------------------
def three_cheapest(prices):
    """Возвращает три наименьшие цены по возрастанию."""
    return sorted(prices)[:3]


# --- 06 · архив чеков: поиск по отсортированным номерам ------------------
def find_receipt(sorted_ids, target):
    """Возвращает индекс номера target или -1. Список отсортирован."""
    low, high = 0, len(sorted_ids) - 1
    while low <= high:
        middle = (low + high) // 2
        if sorted_ids[middle] == target:
            return middle
        if sorted_ids[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1


# --- 07 · теплица: среднее и число выбросов -----------------------------
def average_and_spikes(temperatures):
    """Возвращает пару (среднее, сколько значений выше среднего)."""
    total = 0
    for value in temperatures:
        total += value
    average = total / len(temperatures)

    spikes = 0
    for value in temperatures:
        if value > average:
            spikes += 1
    return average, spikes


# --- 08 · курьеры: самая близкая пара точек -----------------------------
def closest_pair_distance(points):
    """Возвращает наименьшее расстояние между двумя точками маршрута."""
    best = None
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            (x1, y1), (x2, y2) = points[i], points[j]
            distance = abs(x1 - x2) + abs(y1 - y2)
            if best is None or distance < best:
                best = distance
    return best


# --- 09 · служба поддержки: частота слов в обращении ---------------------
def word_counts(words):
    """Возвращает словарь «слово → сколько раз встретилось»."""
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts


# --- 10 · отчёт по заказам: убрать повторы, сохранив порядок -------------
def unique_keep_order(rows):
    """Возвращает список без повторов, порядок первых появлений сохранён."""
    result = []
    for row in rows:
        if row not in result:
            result.append(row)
    return result


# --- 11 · упаковка: сколько раз коробку можно разделить пополам ----------
def halving_steps(size):
    """Возвращает число делений пополам, пока размер не станет 1."""
    steps = 0
    while size > 1:
        size //= 2
        steps += 1
    return steps


# --- 12 · склад: слияние двух отсортированных накладных ------------------
def merge_sorted(left, right):
    """Сливает два отсортированных списка в один отсортированный."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


if __name__ == "__main__":
    print("01", find_pass([417, 902, 133], 133))
    print("02", first_and_last([417, 902, 133]))
    print("03", has_duplicate_badges([417, 902, 417]))
    print("04", has_duplicate_badges_fast([417, 902, 417]))
    print("05", three_cheapest([90, 15, 240, 60, 15]))
    print("06", find_receipt([101, 204, 315, 480, 512], 480))
    print("07", average_and_spikes([21, 24, 30, 19]))
    print("08", closest_pair_distance([(0, 0), (3, 4), (1, 1)]))
    print("09", word_counts(["заявка", "склад", "заявка"]))
    print("10", unique_keep_order(["A-1", "B-2", "A-1", "C-3"]))
    print("11", halving_steps(1000))
    print("12", merge_sorted([1, 4, 9], [2, 3, 10]))
