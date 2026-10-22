using Npgsql;

// Русские буквы в терминале Windows.
Console.OutputEncoding = System.Text.Encoding.UTF8;

const string connectionString =
    "Host=localhost;Port=5433;Database=orders;Username=student;Password=student";

await using var dataSource = NpgsqlDataSource.Create(connectionString);

// Сброс: удаляет позицию, которую добавляет сценарий, чтобы программу можно было запускать много раз.
await using (var connection = await dataSource.OpenConnectionAsync())
await using (var reset = new NpgsqlCommand(
    "DELETE FROM order_items WHERE order_id = 1 AND product_id = 4", connection))
{
    await reset.ExecuteNonQueryAsync();
}

// Сценарий: четыре попытки добавить позицию в заказ 1.
Console.WriteLine(await AddItemAsync(dataSource, 1, 4, 1, 3290m));   // новая позиция
Console.WriteLine(await AddItemAsync(dataSource, 1, 4, 1, 3290m));   // та же позиция ещё раз
Console.WriteLine(await AddItemAsync(dataSource, 1, 99, 1, 100m));   // товара 99 нет
Console.WriteLine(await AddItemAsync(dataSource, 1, 5, 0, 2790m));   // количество 0

Console.WriteLine("Позиции заказа 1:");
foreach (var item in await GetItemsAsync(dataSource, 1))
{
    Console.WriteLine($"  {item.ProductName}: {item.Quantity} × {item.Price} руб.");
}

// Добавляет позицию в заказ и возвращает текст результата.
// Сейчас любая ошибка базы завершает программу.
static async Task<string> AddItemAsync(
    NpgsqlDataSource dataSource, int orderId, int productId, int quantity, decimal price)
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (@order, @product, @quantity, @price)
        """, connection);
    command.Parameters.AddWithValue("order", orderId);
    command.Parameters.AddWithValue("product", productId);
    command.Parameters.AddWithValue("quantity", quantity);
    command.Parameters.AddWithValue("price", price);

    int rows = await command.ExecuteNonQueryAsync();
    return $"Добавлено строк: {rows}";
}

// Возвращает позиции заказа списком объектов OrderItemRow.
static async Task<List<OrderItemRow>> GetItemsAsync(NpgsqlDataSource dataSource, int orderId)
{
    var items = new List<OrderItemRow>();

    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT p.name AS product_name, oi.quantity, oi.price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = @order
        ORDER BY p.id
        """, connection);
    command.Parameters.AddWithValue("order", orderId);

    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        // Здесь нужно создать OrderItemRow из текущей строки и добавить его в items.
    }

    return items;
}

record OrderItemRow(string ProductName, int Quantity, decimal Price);
