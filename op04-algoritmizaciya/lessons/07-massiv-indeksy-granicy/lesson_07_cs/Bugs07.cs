// Домашнее задание 7 · три метода с ошибкой на границе.
//
// Каждый метод на обычных входах отвечает верно и ошибается только на
// граничном входе. Для каждого: найти вход, записать тест, который падает,
// исправить одну строку и прогнать тесты снова.
//
// Файл не входит в сборку (см. Lesson07.csproj). Чтобы работать с ним,
// удалите строку <Compile Remove="Bugs07.cs" /> из Lesson07.csproj.

namespace Lesson07;

public static class Bugs07
{
    /// <summary>true, если хотя бы в один день цена выросла по сравнению с предыдущим.</summary>
    public static bool HasGrowth(List<int> prices)
    {
        for (int i = 0; i < prices.Count; i++)
        {
            if (prices[i + 1] > prices[i])
                return true;
        }
        return false;
    }

    /// <summary>Суммы всех отрезков длины k подряд, слева направо. 1 &lt;= k &lt;= values.Count.</summary>
    public static List<int> WindowSums(List<int> values, int k)
    {
        var sums = new List<int>();
        for (int i = 0; i < values.Count - k; i++)
            sums.Add(values.GetRange(i, k).Sum());
        return sums;
    }

    /// <summary>Последние n событий журнала. Если событий меньше n, возвращаются все. n &gt;= 0.</summary>
    public static List<string> LastN(List<string> events, int n)
    {
        return events.GetRange(events.Count - n, n);
    }
}
