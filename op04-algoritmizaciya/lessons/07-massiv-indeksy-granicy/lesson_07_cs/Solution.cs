// Занятие 7 · массив: индексы, проходы, границы.
//
// Три метода для самостоятельного решения. Сигнатуры и контракты не меняйте:
// по ним работают тесты в Tests.cs. Условия и ограничения — в task.md.
//
// Запуск всех тестов из этой папки:   dotnet run
// Только тесты одной задачи:          dotnet run -- streak

namespace Lesson07;

public static class Solution
{
    /// <summary>
    /// Длина самой длинной серии дней подряд, в которые шагов было не меньше goal.
    /// steps — число шагов по дням, в порядке дат. Пустой список → 0.
    /// Время O(n), дополнительная память O(1). Список не изменяется.
    /// </summary>
    public static int MaxStreak(IReadOnlyList<int> steps, int goal = 10_000)
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// Разворачивает участок плейлиста tracks[l..r] включительно на месте.
    /// Элементы вне участка остаются на своих местах.
    /// Если не выполнено 0 &lt;= l &lt;= r &lt; tracks.Count, выбрасывается ArgumentException,
    /// а список остаётся без изменений.
    /// Время O(r - l), дополнительная память O(1).
    /// List.Reverse, Array.Reverse, диапазоны и LINQ не используются.
    /// </summary>
    public static void ReverseSegment<T>(List<T> tracks, int l, int r)
    {
        throw new NotImplementedException();
    }

    /// <summary>Комментарий считается спамом, если в нём есть ссылка.</summary>
    public static bool IsSpam(string text) =>
        text.Contains("http://") || text.Contains("https://");

    /// <summary>
    /// Удаляет спам из списка комментариев на месте и возвращает число оставшихся.
    /// Порядок обычных комментариев сохраняется. После вызова в списке остаются
    /// только обычные комментарии: comments.Count равен возвращённому числу.
    /// Время O(n), дополнительная память O(1): новый список не создаётся,
    /// Remove, RemoveAt и RemoveAll внутри цикла не используются.
    /// Один вызов RemoveRange после цикла разрешён.
    /// </summary>
    public static int RemoveSpam(List<string> comments)
    {
        throw new NotImplementedException();
    }
}
