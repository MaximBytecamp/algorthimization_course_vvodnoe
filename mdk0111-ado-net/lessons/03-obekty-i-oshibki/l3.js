/* МДК.01.11 · занятие 3 · схемы лекции.
   1. Строки результата → список OrderRow.
   2. Маппер по номерам и по именам при перестановке столбцов.
   3. Чтение столбца с NULL тремя способами.
   4. ExecuteNonQuery и ExecuteScalar.
   5. Ошибки ограничений order_items.
   Значения, сообщения и свойства исключений получены на .NET 10.0.402 + Npgsql 10.0.3 + PostgreSQL 17. */

/* ---------- 1. Строки → объекты ---------- */
renderCode($('#code1'), [
  'var orders = new List<OrderRow>();',
  'while (await reader.ReadAsync())',
  '{',
  '    orders.Add(MapOrder(reader));',
  '}',
  '',
  '// Маппер: одна строка читателя → один объект.',
  'static OrderRow MapOrder(NpgsqlDataReader reader) =>',
  '    new(reader.GetInt32(0), reader.GetString(1), reader.GetDecimal(2));',
  '',
  'record OrderRow(int Id, string Status, decimal Total);',
]);
(() => {
  const ROWS = [[1, 'shipped', '3380.00'], [2, 'paid', '13990.00'], [3, 'new', '3290.00'], [4, 'cancelled', '890.00'], [5, 'new', '5280.00']];
  const ru = v => v.replace('.', ',');
  let at = 0, busy = false;
  const draw = () => {
    $('#mapRows').innerHTML = '<tr><th>0 · id<small>integer</small></th><th>1 · status<small>text</small></th><th>2 · total<small>numeric</small></th></tr>'
      + ROWS.map((r, i) => `<tr class="${i < at ? 'done' : i === at ? 'cur' : ''}">${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    $('#mapObjs').innerHTML = at ? ROWS.slice(0, at).map(r => `<div class="objcard"><b>OrderRow</b><span><i>Id = </i>${r[0]}</span><span><i>Status = </i>${r[1]}</span><span><i>Total = </i>${ru(r[2])}</span></div>`).join('')
      : '<div class="empty">orders: пустой список</div>';
    $('#mapCount').textContent = `orders.Count = ${at}`;
    $('#mapStep').disabled = at >= ROWS.length;
  };
  $('#mapStep').addEventListener('click', () => {
    if (busy || at >= ROWS.length) return;
    busy = true;
    const cells = $$(`#mapRows tr:nth-child(${at + 2}) td`);
    cells.forEach((td, k) => setTimeout(() => td.classList.add('fly'), k * 180));
    setTimeout(() => { at++; draw(); busy = false; }, 700);
  });
  $('#mapReset').addEventListener('click', () => { at = 0; draw(); });
  draw();
})();

/* ---------- 2. По номеру и по имени ---------- */
(() => {
  renderCode($('#byIndex'), ['// по номерам', 'new OrderRow(', '    reader.GetInt32(0),', '    reader.GetString(1),', '    reader.GetDecimal(2));']);
  renderCode($('#byName'), ['// по именам', 'new OrderRow(', '    reader.GetInt32(reader.GetOrdinal("id")),', '    reader.GetString(reader.GetOrdinal("status")),', '    reader.GetDecimal(reader.GetOrdinal("total")));']);
  const ORD = [['id', 'status', 'total'], ['status', 'id', 'total']];
  const OK = 'Результат: <code>OrderRow { Id = 1, Status = shipped, Total = 3380,00 }</code>';
  const show = o => {
    $$('#reorder [data-o]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.o === o)));
    $('#selrow').innerHTML = 'SELECT ' + ORD[o].map((c, i) => `<span class="col"><small>${i}</small>${c}</span>`).join(', ') + ' FROM orders WHERE id = 1';
    const a = $('#byIndexOut'), b = $('#byNameOut');
    if (o === 0) { a.className = 'verdict-box ok'; a.innerHTML = OK; }
    else { a.className = 'verdict-box bad'; a.innerHTML = '<code>InvalidCastException: Reading as \'System.Int32\' is not supported for fields having DataTypeName \'text\'</code><br>Номер 0 теперь у столбца <code>status</code>.'; }
    b.className = 'verdict-box ok';
    b.innerHTML = OK + (o === 1 ? '<br><code>GetOrdinal("id")</code> вернул 1, <code>GetOrdinal("status")</code> — 0.' : '');
  };
  $$('#reorder [data-o]').forEach(btn => btn.addEventListener('click', () => show(+btn.dataset.o)));
  show(0);
})();

/* ---------- 3. NULL ---------- */
renderCode($('#code3'), [
  'SELECT c.id, c.full_name, max(o.created_at) AS last_cancelled',
  'FROM customers c',
  "LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'",
  'GROUP BY c.id, c.full_name',
  'ORDER BY c.id',
]);
(() => {
  const DATA = [[1, 'Анна Смирнова', '2026-09-05'], [2, 'Игорь Волков', null], [3, 'Мария Козлова', null], [4, 'Дмитрий Орлов', null], [5, 'Елена Новикова', null], [6, 'Павел Соколов', '2026-09-16']];
  const WAYS = [
    { t: 'GetFieldValue<DateOnly>', code: ['DateOnly last = reader.GetFieldValue<DateOnly>(2);'], k: 'bad',
      out: 'На второй строке — <code>InvalidCastException: Column \'last_cancelled\' is null.</code> Исключение прервало цикл, строки 3–6 не прочитаны.' },
    { t: 'IsDBNull', code: ['DateOnly? last = reader.IsDBNull(2) ? null : reader.GetFieldValue<DateOnly>(2);'], k: 'ok',
      out: '<code>IsDBNull(2)</code> возвращает <code>true</code> для пустого значения, и в переменную записывается <code>null</code>. Вместо <code>null</code> можно подставить своё значение.' },
    { t: 'GetFieldValue<DateOnly?>', code: ['DateOnly? last = reader.GetFieldValue<DateOnly?>(2);'], k: 'ok',
      out: 'Для типа со знаком <code>?</code> Npgsql возвращает <code>null</code> на месте NULL. Результат тот же, что у проверки <code>IsDBNull</code>.' },
  ];
  $('#nullTabs').innerHTML = WAYS.map((w, i) => `<button type="button" aria-pressed="${i === 0}">${esc(w.t)}</button>`).join('');
  const btns = $$('#nullTabs button');
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    const w = WAYS[i];
    renderCode($('#nullCode'), w.code);
    $('#nullTab').innerHTML = '<tr><th>id</th><th>full_name</th><th>last_cancelled в базе</th><th>что прочитано</th></tr>'
      + DATA.map((r, k) => {
        let cls, txt;
        if (i === 0) {
          if (k === 0) { cls = 'r-ok'; txt = r[2]; }
          else if (k === 1) { cls = 'r-bad'; txt = 'исключение'; }
          else { cls = 'r-skip'; txt = 'не прочитано'; }
        } else { cls = r[2] ? 'r-ok' : 'r-null'; txt = r[2] || 'null'; }
        return `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="${r[2] ? '' : 'v-null'}">${r[2] || 'NULL'}</td><td class="${cls}">${txt}</td></tr>`;
      }).join('');
    const o = $('#nullOut'); o.className = 'verdict-box ' + w.k; o.innerHTML = w.out;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();

/* ---------- 4. Команды на изменение ---------- */
(() => {
  const C = [
    { t: 'INSERT новой позиции', code: ['var command = new NpgsqlCommand(', '    "INSERT INTO order_items (order_id, product_id, quantity, price) " +', '    "VALUES (1, 4, 1, 3290)", connection);', 'int rows = await command.ExecuteNonQueryAsync();'],
      k: 'ok', out: '<code>rows = 1</code>: в таблицу добавлена одна строка.' },
    { t: 'UPDATE несуществующего заказа', code: ['var command = new NpgsqlCommand(', '    "UPDATE orders SET status = \'paid\' WHERE id = @id", connection);', 'command.Parameters.AddWithValue("id", 99);', 'int rows = await command.ExecuteNonQueryAsync();'],
      k: 'warn', out: '<code>rows = 0</code>, без исключения: заказа 99 нет, условию не подошла ни одна строка. Проверка <code>rows == 0</code> — способ сообщить «заказ не найден».' },
    { t: 'UPDATE заказа 3', code: ['command.Parameters.AddWithValue("id", 3);', 'int rows = await command.ExecuteNonQueryAsync();'],
      k: 'ok', out: '<code>rows = 1</code>: статус заказа 3 изменён.' },
    { t: 'DELETE одной позиции дважды', code: ['var command = new NpgsqlCommand(', '    "DELETE FROM order_items WHERE order_id = 1 AND product_id = 4", connection);', 'int first = await command.ExecuteNonQueryAsync();', 'int second = await command.ExecuteNonQueryAsync();'],
      k: 'ok', out: '<code>first = 1</code>, <code>second = 0</code>: при втором вызове удалять уже нечего.' },
    { t: 'SELECT через ExecuteNonQuery', code: ['var command = new NpgsqlCommand("SELECT * FROM orders", connection);', 'int rows = await command.ExecuteNonQueryAsync();'],
      k: 'bad', out: '<code>rows = -1</code>. Запрос выполнен, но строки результата отброшены: для <code>SELECT</code> нужен читатель или <code>ExecuteScalarAsync</code>.' },
    { t: 'count(*) через ExecuteScalar', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM orders WHERE status = \'new\'", connection);', 'long count = (long)(await command.ExecuteScalarAsync())!;'],
      k: 'ok', out: '<code>count = 4</code>. Значение пришло как <code>Int64</code>: тип <code>count(*)</code> в PostgreSQL — <code>bigint</code>.' },
    { t: 'INSERT … RETURNING id', code: ['var command = new NpgsqlCommand(', '    "INSERT INTO customers (full_name, city) VALUES (@n, @c) RETURNING id", connection);', 'command.Parameters.AddWithValue("n", "Ольга Белова");', 'command.Parameters.AddWithValue("c", "Казань");', 'int id = (int)(await command.ExecuteScalarAsync())!;'],
      k: 'ok', out: '<code>id = 7</code>, тип <code>Int32</code>: номер нового клиента, который назначила база. Шесть клиентов уже были в <code>init.sql</code>.' },
  ];
  const list = $('#cmds');
  list.innerHTML = C.map((c, i) => `<button type="button" aria-pressed="${i === 0}"><b>${i + 1}</b>${c.t}</button>`).join('');
  const btns = $$('button', list);
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    renderCode($('#cmdCode'), C[i].code);
    const o = $('#cmdOut'); o.className = 'verdict-box ' + C[i].k; o.innerHTML = C[i].out;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();

/* ---------- 5. Ошибки ограничений ---------- */
renderCode($('#code5'), [
  'try',
  '{',
  '    int rows = await command.ExecuteNonQueryAsync();',
  '    return $"Добавлено строк: {rows}";',
  '}',
  'catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)',
  '{',
  '    return $"Товар {productId} уже есть в заказе {orderId}.";',
  '}',
  'catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)',
  '{',
  '    return $"Заказа {orderId} или товара {productId} нет в базе.";',
  '}',
  'catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.CheckViolation)',
  '{',
  '    return $"Количество должно быть больше нуля, указано {quantity}.";',
  '}',
]);
(() => {
  const DDL = [
    'CREATE TABLE order_items (',
    '    order_id   integer       NOT NULL REFERENCES orders (id),',
    '    product_id integer       NOT NULL REFERENCES products (id),',
    '    quantity   integer       NOT NULL CHECK (quantity > 0),',
    '    price      numeric(10,2) NOT NULL,',
    '    PRIMARY KEY (order_id, product_id)',
    ');',
  ];
  $('#ddl').innerHTML = DDL.map(l => `<span>${esc(l)}</span>`).join('');
  const lines = $$('#ddl span');
  const T = [
    { t: '(1, 4, 1, 3290) — новая позиция', line: -1, state: '—', cons: '—', msg: 'команда выполнена', detail: '—', fr: 'Добавлено строк: 1' },
    { t: '(1, 4, 1, 3290) — та же ещё раз', line: 5, state: '23505 · UniqueViolation', cons: 'order_items_pkey', msg: 'duplicate key value violates unique constraint "order_items_pkey"', detail: 'Key (order_id, product_id)=(1, 4) already exists.', fr: 'Товар 4 уже есть в заказе 1.' },
    { t: '(1, 99, 1, 100) — товара 99 нет', line: 2, state: '23503 · ForeignKeyViolation', cons: 'order_items_product_id_fkey', msg: 'insert or update on table "order_items" violates foreign key constraint "order_items_product_id_fkey"', detail: 'Key (product_id)=(99) is not present in table "products".', fr: 'Заказа 1 или товара 99 нет в базе.' },
    { t: '(99, 4, 1, 100) — заказа 99 нет', line: 1, state: '23503 · ForeignKeyViolation', cons: 'order_items_order_id_fkey', msg: 'insert or update on table "order_items" violates foreign key constraint "order_items_order_id_fkey"', detail: 'Key (order_id)=(99) is not present in table "orders".', fr: 'Заказа 99 или товара 4 нет в базе.' },
    { t: '(1, 5, 0, 2790) — количество 0', line: 3, state: '23514 · CheckViolation', cons: 'order_items_quantity_check', msg: 'new row for relation "order_items" violates check constraint "order_items_quantity_check"', detail: 'Failing row contains (1, 5, 0, 2790.00).', fr: 'Количество должно быть больше нуля, указано 0.' },
    { t: '(1, 5, 1, DBNull) — цены нет', line: 4, state: '23502 · NotNullViolation', cons: 'null — для NOT NULL сервер присылает ColumnName = price', msg: 'null value in column "price" of relation "order_items" violates not-null constraint', detail: 'Failing row contains (1, 5, 1, null).', fr: 'Unhandled exception. Npgsql.PostgresException: 23502 … — код не обработан, программа завершилась' },
  ];
  const list = $('#consList');
  list.innerHTML = T.map((c, i) => `<button type="button" aria-pressed="${i === 0}"><b>${i + 1}</b>${c.t}</button>`).join('');
  const btns = $$('button', list);
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    const c = T[i];
    lines.forEach((l, j) => { l.className = c.line < 0 ? (j > 0 && j < 6 ? 'ok' : '') : (j === c.line ? 'hit' : ''); });
    $('#consErr').innerHTML = `<dt>SqlState</dt><dd>${c.state}</dd><dt>ConstraintName</dt><dd>${esc(c.cons)}</dd><dt>MessageText</dt><dd>${esc(c.msg)}</dd><dt>Detail*</dt><dd>${esc(c.detail)}</dd>`;
    $('#consFriendly').textContent = c.fr;
    $('#consErr').insertAdjacentHTML('beforeend', '<dt></dt><dd style="font-family:var(--body);color:var(--ink-faint)">* с настройкой Include Error Detail=true, без неё — Detail redacted</dd>');
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();
