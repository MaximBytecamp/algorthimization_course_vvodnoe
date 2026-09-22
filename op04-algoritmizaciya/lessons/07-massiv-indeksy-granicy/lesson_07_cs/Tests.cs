// Публичные тесты занятия 7.
//
// Запуск: dotnet run            — все тесты
//         dotnet run -- streak  — тесты, в имени которых есть «streak»
// Каждый тест проверяет один класс входа; имя теста говорит, какой.
// Свои граничные тесты добавляйте в конец списка, в блок «Мои тесты».

namespace Lesson07;

public static class Tests
{
    public static readonly (string Name, Action Body)[] All =
    {
        // ---------- задача 1: максимальная серия ----------
        ("streak_empty", () => Eq(0, Solution.MaxStreak(new List<int>()))),
        ("streak_single_day_reached", () => Eq(1, Solution.MaxStreak(new List<int> { 10_000 }))),
        ("streak_single_day_missed", () => Eq(0, Solution.MaxStreak(new List<int> { 9_999 }))),
        ("streak_goal_is_inclusive", () => Eq(2, Solution.MaxStreak(new List<int> { 10_000, 10_000, 9_999, 10_000 }))),
        ("streak_all_days_reached", () => Eq(4, Solution.MaxStreak(new List<int> { 12_000, 15_000, 10_500, 11_000 }))),
        ("streak_best_series_at_the_end", () => Eq(3, Solution.MaxStreak(new List<int> { 12_000, 3_000, 11_000, 10_500, 10_000 }))),
        ("streak_best_series_in_the_middle", () => Eq(3, Solution.MaxStreak(new List<int> { 11_000, 2_000, 13_000, 14_000, 15_000, 1_000, 12_000 }))),
        ("streak_custom_goal", () => Eq(3, Solution.MaxStreak(new List<int> { 5, 6, 1, 7, 8, 9 }, goal: 5))),
        ("streak_does_not_change_input", () =>
        {
            var steps = new List<int> { 12_000, 3_000, 11_000 };
            Solution.MaxStreak(steps);
            Seq(new List<int> { 12_000, 3_000, 11_000 }, steps);
        }),

        // ---------- задача 2: разворот участка ----------
        ("reverse_middle_segment", () =>
        {
            var t = new List<string> { "A", "B", "C", "D", "E", "F" };
            Solution.ReverseSegment(t, 1, 4);
            Seq(new List<string> { "A", "E", "D", "C", "B", "F" }, t);
        }),
        ("reverse_whole_list_even_length", () =>
        {
            var t = new List<int> { 1, 2, 3, 4 };
            Solution.ReverseSegment(t, 0, 3);
            Seq(new List<int> { 4, 3, 2, 1 }, t);
        }),
        ("reverse_whole_list_odd_length", () =>
        {
            var t = new List<int> { 1, 2, 3, 4, 5 };
            Solution.ReverseSegment(t, 0, 4);
            Seq(new List<int> { 5, 4, 3, 2, 1 }, t);
        }),
        ("reverse_one_element_segment", () =>
        {
            var t = new List<string> { "A", "B", "C" };
            Solution.ReverseSegment(t, 1, 1);
            Seq(new List<string> { "A", "B", "C" }, t);
        }),
        ("reverse_last_two", () =>
        {
            var t = new List<string> { "A", "B", "C" };
            Solution.ReverseSegment(t, 1, 2);
            Seq(new List<string> { "A", "C", "B" }, t);
        }),
        ("reverse_keeps_object", () =>
        {
            var t = new List<int> { 1, 2, 3 };
            var same = t;
            Solution.ReverseSegment(t, 0, 2);
            Check(ReferenceEquals(same, t), "список подменён другим объектом");
            Seq(new List<int> { 3, 2, 1 }, same);
        }),
        ("reverse_bad_bounds_l_greater_r", () => BadBounds(2, 1)),
        ("reverse_bad_bounds_negative_l", () => BadBounds(-1, 2)),
        ("reverse_bad_bounds_r_equals_count", () => BadBounds(0, 3)),
        ("reverse_bad_bounds_both_outside", () => BadBounds(3, 3)),
        ("reverse_empty_list", () =>
        {
            var t = new List<int>();
            Throws<ArgumentException>(() => Solution.ReverseSegment(t, 0, 0));
        }),

        // ---------- задача 3: удаление на месте ----------
        ("remove_no_spam", () => Removed(new[] { "Отличный урок", "Спасибо" }, 2, new[] { "Отличный урок", "Спасибо" })),
        ("remove_two_spam_in_a_row", () => Removed(new[] { "Отличный урок", "http://win.ru", "http://prize.ru", "Спасибо" }, 2, new[] { "Отличный урок", "Спасибо" })),
        ("remove_spam_at_both_ends", () => Removed(new[] { "https://a.ru", "Вопрос по теме", "Всё понятно", "http://b.ru" }, 2, new[] { "Вопрос по теме", "Всё понятно" })),
        ("remove_all_spam", () => Removed(new[] { "http://a.ru", "http://b.ru", "http://c.ru" }, 0, new string[0])),
        ("remove_empty", () => Removed(new string[0], 0, new string[0])),
        ("remove_keeps_order_and_object", () =>
        {
            var c = new List<string> { "1", "http://x.ru", "2", "http://y.ru", "3", "4" };
            var same = c;
            Solution.RemoveSpam(c);
            Check(ReferenceEquals(same, c), "список подменён другим объектом");
            Seq(new List<string> { "1", "2", "3", "4" }, c);
        }),
        ("remove_keeps_duplicates", () => Removed(new[] { "+", "+", "http://x.ru", "+" }, 3, new[] { "+", "+", "+" })),

        // ---------- Мои тесты ----------
        // Сюда — тест, который воспроизводит найденную ошибку, и тесты по карточке изменения.
    };

    static void BadBounds(int l, int r)
    {
        var t = new List<int> { 1, 2, 3 };
        Throws<ArgumentException>(() => Solution.ReverseSegment(t, l, r));
        Seq(new List<int> { 1, 2, 3 }, t);
    }

    static void Removed(string[] before, int expected, string[] after)
    {
        var c = new List<string>(before);
        Eq(expected, Solution.RemoveSpam(c));
        Seq(new List<string>(after), c);
    }

    // ---------- проверки ----------
    public static void Eq<T>(T expected, T actual)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
            throw new TestFailure($"ждали {expected}, получили {actual}");
    }

    public static void Seq<T>(IList<T> expected, IList<T> actual)
    {
        if (!expected.SequenceEqual(actual))
            throw new TestFailure($"ждали [{string.Join(", ", expected)}], получили [{string.Join(", ", actual)}]");
    }

    public static void Check(bool condition, string message)
    {
        if (!condition) throw new TestFailure(message);
    }

    public static void Throws<TException>(Action action) where TException : Exception
    {
        try { action(); }
        catch (TException) { return; }
        throw new TestFailure($"ждали исключение {typeof(TException).Name}, его не было");
    }
}

public class TestFailure(string message) : Exception(message);
