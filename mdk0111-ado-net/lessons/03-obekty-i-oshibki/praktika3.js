/* МДК.01.11 · занятие 3 · практика: четыре задания, рецензия и отчёт .md.
   Варианты заданий 1–2 и вывод задания 4 проверены запуском на настоящем стенде. */

(() => {
  const KEY = 'mdk0111-z03-v1';
  const MAX = { 1: 2, 2: 3, 3: 2, 4: 3 };
  let st;
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) { /* приватный режим */ } };
  const T = n => st['t' + n] || (st['t' + n] = {});
  const mark = ok => ok ? '<span class="ok-t">✓</span>' : '<span class="bad-t">✕</span>';

  const showDone = (n, fb) => {
    const box = $('#t' + n), s = T(n).score;
    box.classList.add('is-done', 'locked');
    $('.task__head .pts', box).textContent = `${s} из ${MAX[n]}`;
    $('.verdict', box).innerHTML = s === MAX[n] ? '<span class="ok-t">Верно</span>' : s > 0 ? '<span class="ok-t">Частично верно</span>' : '<span class="bad-t">Неверно</span>';
    $('[data-check]', box).disabled = true;
    $$('textarea', box).forEach(el => { el.readOnly = true; });
    $$('select', box).forEach(el => { el.disabled = true; });
    $('#t' + n + 'fb').innerHTML = fb;
  };
  const finish = (n, score, fb) => { T(n).done = true; T(n).score = score; save(); showDone(n, fb); renderReview(); };
  const warn = (n, text) => { $('#t' + n + ' .verdict').innerHTML = `<span class="bad-t">${text}</span>`; };

  /* общий движок: таблица «вопрос → выбор из списка» */
  function selectTask(n, rows, opts, score) {
    const t = T(n); t.a = t.a || {};
    $(`#t${n}table tbody`).innerHTML = rows.map((r, i) => `<tr><td>${r.q}</td><td><select><option value="">— выберите —</option>${(r.opts || opts).map((o, k) => `<option value="${k}">${esc(o)}</option>`).join('')}</select></td></tr>`).join('');
    const sels = $$(`#t${n}table select`);
    const draw = () => sels.forEach((s, i) => {
      s.value = t.a[i] ?? '';
      if (t.done) s.closest('tr').className = +t.a[i] === rows[i].ok ? 'good' : 'bad';
    });
    sels.forEach((s, i) => s.addEventListener('change', () => { if (t.done) return; t.a[i] = s.value; save(); }));
    const fb = () => `<h4>Разбор</h4><ul>${rows.map((r, i) => `<li>${mark(+t.a[i] === r.ok)} ${r.q} — <code>${esc((r.opts || opts)[r.ok])}</code>. ${r.why}</li>`).join('')}</ul>`;
    const check = () => {
      if (rows.some((_, i) => t.a[i] === undefined || t.a[i] === '')) return warn(n, 'Выберите ответ в каждой строке');
      finish(n, score(rows.filter((r, i) => +t.a[i] === r.ok).length), fb()); draw();
    };
    draw();
    if (t.done) showDone(n, fb());
    return check;
  }

  /* ---------- задание 1 ---------- */
  renderCode($('#t1code'), [
    'SELECT c.full_name AS name,',
    '       count(o.id) AS orders_count,',
    "       max(o.created_at) FILTER (WHERE o.status = 'cancelled') AS last_cancelled",
    'FROM customers c',
    'LEFT JOIN orders o ON o.customer_id = c.id',
    'GROUP BY c.id, c.full_name',
    'ORDER BY c.id',
    '',
    'record CustomerStat(string Name, long OrdersCount, DateOnly? LastCancelled);',
  ]);
  const check1 = selectTask(1, [
    { q: '<code>Name</code>', ok: 1, opts: ['reader.GetString(reader.GetOrdinal("full_name"))', 'reader.GetString(reader.GetOrdinal("name"))', 'reader.GetInt32(0)'],
      why: 'Столбец переименован словом <code>AS</code>, поэтому имя <code>full_name</code> не находится: <code>Field not found in row: full_name</code>.' },
    { q: '<code>OrdersCount</code>', ok: 2, opts: ['reader.GetString(reader.GetOrdinal("orders_count"))', 'reader.GetInt64(reader.GetOrdinal("count"))', 'reader.GetInt64(reader.GetOrdinal("orders_count"))'],
      why: '<code>count(o.id)</code> имеет тип <code>bigint</code>, это <code>long</code>. Строкой его не прочитать, а столбец называется <code>orders_count</code>.' },
    { q: '<code>LastCancelled</code>', ok: 0, opts: ['reader.GetFieldValue<DateOnly?>(reader.GetOrdinal("last_cancelled"))', 'reader.GetFieldValue<DateOnly>(reader.GetOrdinal("last_cancelled"))', '(DateOnly?)reader.GetValue(reader.GetOrdinal("last_cancelled"))'],
      why: 'У четырёх клиентов здесь NULL. <code>GetFieldValue&lt;DateOnly&gt;</code> падает на второй строке: <code>Column \'last_cancelled\' is null.</code> Приведение <code>GetValue</code> тоже падает: на месте NULL приходит объект <code>DBNull</code>, и в <code>DateOnly?</code> он не приводится.' },
  ], [], r => r === 3 ? 2 : r === 2 ? 1 : 0);

  /* ---------- задание 2 ---------- */
  renderCode($('#t2code'), [
    'static async Task<int> InsertItemAsync(NpgsqlDataSource dataSource,',
    '    int orderId, int productId, int quantity, decimal? price)',
    '{',
    '    await using var connection = await dataSource.OpenConnectionAsync();',
    '    await using var command = new NpgsqlCommand(',
    '        "INSERT INTO order_items (order_id, product_id, quantity, price) " +',
    '        "VALUES (@order, @product, @quantity, @price)", connection);',
    '    command.Parameters.AddWithValue("order", orderId);',
    '    command.Parameters.AddWithValue("product", productId);',
    '    command.Parameters.AddWithValue("quantity", quantity);',
    '    command.Parameters.AddWithValue("price", (object?)price ?? DBNull.Value);',
    '    return await command.ExecuteNonQueryAsync();',
    '}',
  ]);
  const O2 = ['вернёт 1', 'вернёт 0', 'исключение 23505', 'исключение 23503', 'исключение 23514', 'исключение 23502'];
  const check2 = selectTask(2, [
    { q: '<code>InsertItemAsync(ds, 2, 3, 1, 13990m)</code>', ok: 2, why: 'В заказе 2 уже есть товар 3, первичный ключ <code>(order_id, product_id)</code> не допускает повтора.' },
    { q: '<code>InsertItemAsync(ds, 2, 1, 2, 2490m)</code>', ok: 0, why: 'Все правила выполнены, добавлена одна строка.' },
    { q: '<code>InsertItemAsync(ds, 13, 1, 1, 2490m)</code>', ok: 3, why: 'Заказов 12, заказа 13 нет: нарушен внешний ключ <code>order_items_order_id_fkey</code>.' },
    { q: '<code>InsertItemAsync(ds, 2, 1, -1, 2490m)</code>', ok: 4, why: 'Проверка <code>CHECK (quantity &gt; 0)</code> срабатывает до проверки ключа, хотя товар 1 к этому моменту уже есть в заказе 2.' },
    { q: '<code>InsertItemAsync(ds, 2, 8, 1, null)</code>', ok: 5, why: 'Цена передана как <code>DBNull.Value</code>, а столбец <code>price</code> объявлен <code>NOT NULL</code>.' },
  ], O2, r => r === 5 ? 3 : r === 4 ? 2 : r === 3 ? 1 : 0);

  /* ---------- задание 3 ---------- */
  const O3 = ['ExecuteReaderAsync', 'ExecuteNonQueryAsync', 'ExecuteScalarAsync'];
  const check3 = selectTask(3, [
    { q: 'Получить список позиций заказа с названиями товаров', ok: 0, why: 'Строк в результате несколько, их читают читателем.' },
    { q: 'Удалить позицию и узнать, была ли она в заказе', ok: 1, why: 'Метод вернёт 1, если позиция была, и 0, если нет.' },
    { q: 'Узнать, сколько заказов в статусе new', ok: 2, why: '<code>count(*)</code> — одно значение.' },
    { q: 'Добавить клиента и получить номер, который ему назначила база', ok: 2, why: '<code>INSERT … RETURNING id</code> возвращает одно значение.' },
    { q: 'Отменить все новые заказы клиента и узнать, сколько отменено', ok: 1, why: 'Число затронутых строк <code>UPDATE</code> и есть число отменённых заказов.' },
  ], O3, r => r === 5 ? 2 : r === 4 ? 1 : 0);

  /* ---------- задание 4 ---------- */
  const t4 = T(4);
  const box = $('#t4out');
  box.value = t4.out || '';
  box.addEventListener('input', () => { if (t4.done) return; t4.out = box.value; save(); });
  const norm = s => (s || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ');
  const MSG = ['Товар 4 уже есть в заказе 1.', 'Заказа 1 или товара 99 нет в базе.', 'Количество должно быть больше нуля, указано 0.'];
  const ITEMS = [['Клавиатура', 2490], ['Мышь', 890], ['Наушники', 3290]];
  const evalT4 = () => {
    const out = norm(t4.out);
    const first = /Добавлено строк: 1/.test(out);
    const msgs = MSG.map(m => out.includes(m));
    const items = ITEMS.map(([n, p]) => new RegExp(`${n}: 1 [×xх*] ${p}[.,]00 руб`).test(out));
    return { first, msgs, items };
  };
  const scoreT4 = a => {
    const m = a.msgs.filter(Boolean).length;
    return (a.first && m === 3 ? 2 : m >= 1 ? 1 : 0) + (a.items.every(Boolean) ? 1 : 0);
  };
  const fbT4 = () => {
    const a = evalT4();
    return `<h4>Разбор</h4><ul>
      <li>${mark(a.first)} Первая попытка добавляет позицию: <code>Добавлено строк: 1</code>.</li>
      ${MSG.map((m, i) => `<li>${mark(a.msgs[i])} <code>${m}</code></li>`).join('')}
      <li>${mark(a.items.every(Boolean))} Маппер вернул три позиции заказа 1: Клавиатура, Мышь и добавленные Наушники.${a.items.every(Boolean) ? '' : ' Если строки «Позиции заказа 1:» нет или после неё пусто, объекты не добавляются в <code>items</code>.'}</li>
    </ul><p>Эталон обработки ошибок и маппера:</p><pre class="code" style="padding:10px 14px">catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.UniqueViolation)
{
    return $"Товар {productId} уже есть в заказе {orderId}.";
}
…
items.Add(new OrderItemRow(
    reader.GetString(reader.GetOrdinal("product_name")),
    reader.GetInt32(reader.GetOrdinal("quantity")),
    reader.GetDecimal(reader.GetOrdinal("price"))));</pre>`;
  };
  const check4 = () => {
    if (!(t4.out || '').trim()) return warn(4, 'Вставьте вывод программы');
    finish(4, scoreT4(evalT4()), fbT4());
  };
  if (t4.done) showDone(4, fbT4());

  const checks = { 1: check1, 2: check2, 3: check3, 4: check4 };
  $$('[data-check]').forEach(b => b.addEventListener('click', () => checks[b.dataset.check]()));

  /* ---------- рецензия и отчёт ---------- */
  const NAMES = { 1: 'Маппер для статистики клиента', 2: 'Чем закончится INSERT', 3: 'Метод выполнения команды', 4: 'Позиции заказа в ItemsApp' };
  const nameIn = $('#rvName'), groupIn = $('#rvGroup');
  nameIn.value = st.name || ''; groupIn.value = st.group || '';
  nameIn.addEventListener('input', () => { st.name = nameIn.value; save(); });
  groupIn.addEventListener('input', () => { st.group = groupIn.value; save(); });
  const total = () => [1, 2, 3, 4].reduce((s, n) => s + (T(n).done ? T(n).score : 0), 0);
  function renderReview() {
    $('#rvTable').innerHTML = '<tr><th>Задание</th><th>Баллы</th></tr>'
      + [1, 2, 3, 4].map(n => `<tr><td>${n}. ${NAMES[n]}</td><td>${T(n).done ? `${T(n).score} / ${MAX[n]}` : 'не проверено'}</td></tr>`).join('')
      + `<tr class="total"><td>Итого</td><td>${total()} / 10</td></tr>`;
  }
  renderReview();

  $('#rvDownload').addEventListener('click', () => {
    const name = (st.name || '').trim(), group = (st.group || '').trim();
    if (!name) { nameIn.focus(); nameIn.style.borderColor = 'var(--red)'; return; }
    const sc = n => T(n).done ? `${T(n).score} / ${MAX[n]}` : 'не проверено';
    const pick = (n) => $$(`#t${n}table tbody tr`).map((tr, i) => {
      const q = tr.cells[0].textContent.replace(/\|/g, '\\|');
      const s = $('select', tr); const v = T(n).a && T(n).a[i];
      return `| ${q} | ${v !== undefined && v !== '' ? s.options[+v + 1].textContent.replace(/\|/g, '\\|') : '—'} |`;
    });
    const md = [
      '# Занятие 3 · Строки в объекты и ошибки ограничений', '',
      'МДК.01.11 Технология доступа к базам данных ADO.NET', '',
      '| | |', '|---|---|',
      `| Студент | ${name} |`, `| Группа | ${group || '—'} |`, `| Дата | ${new Date().toLocaleDateString('ru-RU')} |`, '',
      '## Баллы', '', '| Задание | Баллы |', '|---|---|',
      ...[1, 2, 3, 4].map(n => `| ${n}. ${NAMES[n]} | ${sc(n)} |`),
      `| **Итого** | **${total()} / 10** |`, '',
      '## Задание 1. Маппер', '', '| Свойство | Выражение |', '|---|---|', ...pick(1), '',
      '## Задание 2. Чем закончится INSERT', '', '| Вызов | Ответ |', '|---|---|', ...pick(2), '',
      '## Задание 3. Метод выполнения', '', '| Задача | Метод |', '|---|---|', ...pick(3), '',
      '## Задание 4. ItemsApp', '', '```text', (t4.out || '').replace(/\s+$/, ''), '```', '',
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    a.download = 'report.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
