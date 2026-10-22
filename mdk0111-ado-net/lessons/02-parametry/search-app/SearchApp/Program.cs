using Npgsql;

// Русские буквы в терминале Windows.
Console.OutputEncoding = System.Text.Encoding.UTF8;

const string connectionString =
    "Host=localhost;Port=5433;Database=orders;Username=student;Password=student";

Console.Write("Поиск товара: ");
string text = Console.ReadLine() ?? "";

await using var dataSource = NpgsqlDataSource.Create(connectionString);
await using var connection = await dataSource.OpenConnectionAsync();

// Текст поиска вклеивается прямо в SQL.
string sql = $"SELECT id, name, price FROM products WHERE name ILIKE '%{text}%' ORDER BY id";
Console.WriteLine($"SQL: {sql}");

await using var command = new NpgsqlCommand(sql, connection);
await using var reader = await command.ExecuteReaderAsync();

int count = 0;
while (await reader.ReadAsync())
{
    int id = reader.GetInt32(0);
    string name = reader.GetString(1);
    decimal price = reader.GetDecimal(2);

    Console.WriteLine($"{id}: {name}, {price} руб.");
    count++;
}

Console.WriteLine($"Найдено товаров: {count}");
