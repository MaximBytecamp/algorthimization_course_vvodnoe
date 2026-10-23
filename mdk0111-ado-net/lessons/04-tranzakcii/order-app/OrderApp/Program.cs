using Npgsql;

// Русские буквы в терминале Windows.
Console.OutputEncoding = System.Text.Encoding.UTF8;

const string connectionString =
    "Host=localhost;Port=5433;Database=orders;Username=student;Password=student";

await using var dataSource = NpgsqlDataSource.Create(connectionString);

// Сброс: возвращает заказы и остатки к строкам из init.sql, чтобы программу можно было запускать много раз.
await using (var connection = await dataSource.OpenConnectionAsync())
await using (var reset = new NpgsqlCommand(
    """
    DELETE FROM order_items WHERE order_id > 12;
    DELETE FROM orders WHERE id > 12;
    UPDATE products SET stock = CASE id WHEN 1 THEN 14 WHEN 2 THEN 40 WHEN 3 THEN 6 WHEN 5 THEN 9 ELSE stock END;
    """, connection))
{
    await reset.ExecuteNonQueryAsync();
}

Console.WriteLine($"Было: {await CountsAsync(dataSource)}");

// Заказ 1: монитор и клавиатура, оба товара есть на складе.
Console.WriteLine("Заказ 1: " + await CreateOrderAsync(dataSource, 2, [new(3, 1, 13990m), new(1, 1, 2490m)]));
// Заказ 2: две мыши и 20 веб-камер, а камер на складе 9.
Console.WriteLine("Заказ 2: " + await CreateOrderAsync(dataSource, 4, [new(2, 2, 890m), new(5, 20, 2790m)]));

Console.WriteLine($"Стало: {await CountsAsync(dataSource)}");
Console.WriteLine($"Остатки: {await StockAsync(dataSource)}");

// Оформляет заказ: строка в orders, позиции в order_items, уменьшение остатков в products.
// Сейчас команды выполняются без транзакции.
static async Task<string> CreateOrderAsync(NpgsqlDataSource dataSource, int customerId, List<OrderLine> lines)
{
    await using var connection = await dataSource.OpenConnectionAsync();
    try
    {
        decimal total = lines.Sum(l => l.Quantity * l.Price);

        await using var insertOrder = new NpgsqlCommand(
            """
            INSERT INTO orders (customer_id, status, created_at, total)
            VALUES (@customer, 'new', CURRENT_DATE, @total)
            RETURNING id
            """, connection);
        insertOrder.Parameters.AddWithValue("customer", customerId);
        insertOrder.Parameters.AddWithValue("total", total);
        int orderId = (int)(await insertOrder.ExecuteScalarAsync())!;

        foreach (var line in lines)
        {
            await using var insertItem = new NpgsqlCommand(
                """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (@order, @product, @quantity, @price)
                """, connection);
            insertItem.Parameters.AddWithValue("order", orderId);
            insertItem.Parameters.AddWithValue("product", line.ProductId);
            insertItem.Parameters.AddWithValue("quantity", line.Quantity);
            insertItem.Parameters.AddWithValue("price", line.Price);
            await insertItem.ExecuteNonQueryAsync();

            await using var takeStock = new NpgsqlCommand(
                "UPDATE products SET stock = stock - @quantity WHERE id = @product", connection);
            takeStock.Parameters.AddWithValue("quantity", line.Quantity);
            takeStock.Parameters.AddWithValue("product", line.ProductId);
            await takeStock.ExecuteNonQueryAsync();
        }

        return $"оформлен, позиций {lines.Count}.";
    }
    catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.CheckViolation)
    {
        return "не оформлен, на складе не хватает товара.";
    }
}

static async Task<string> CountsAsync(NpgsqlDataSource dataSource)
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        "SELECT (SELECT count(*) FROM orders), (SELECT count(*) FROM order_items)", connection);
    await using var reader = await command.ExecuteReaderAsync();
    await reader.ReadAsync();
    return $"заказов {reader.GetInt64(0)}, позиций {reader.GetInt64(1)}";
}

static async Task<string> StockAsync(NpgsqlDataSource dataSource)
{
    await using var connection = await dataSource.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        "SELECT string_agg(name || ' ' || stock, ', ' ORDER BY id) FROM products WHERE id IN (1, 2, 3, 5)",
        connection);
    return (string)(await command.ExecuteScalarAsync())!;
}

record OrderLine(int ProductId, int Quantity, decimal Price);
