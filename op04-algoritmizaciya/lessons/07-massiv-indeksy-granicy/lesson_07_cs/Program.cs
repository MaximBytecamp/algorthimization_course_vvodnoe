// Запуск тестов: dotnet run [-- фильтр]
// Фильтр — часть имени теста: streak, reverse, remove.

using Lesson07;

string filter = args.Length > 0 ? args[0] : "";
int passed = 0, failed = 0;

foreach (var (name, body) in Tests.All)
{
    if (!name.Contains(filter)) continue;
    try
    {
        body();
        passed++;
        Console.WriteLine($"PASSED  {name}");
    }
    catch (Exception e)
    {
        failed++;
        string reason = e is TestFailure ? e.Message : $"{e.GetType().Name}: {e.Message}";
        Console.WriteLine($"FAILED  {name} — {reason}");
    }
}

Console.WriteLine();
Console.WriteLine($"{passed} passed, {failed} failed");
return failed == 0 ? 0 : 1;
