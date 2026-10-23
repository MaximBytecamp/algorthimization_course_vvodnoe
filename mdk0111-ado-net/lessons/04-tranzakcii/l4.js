/* МДК.01.11 · занятие 4 · схемы лекции.
   1–2, 5. Пошаговые операции: без транзакции, в транзакции, с точками сохранения.
   3. Как заканчивается транзакция.
   4. Два соединения: COMMIT и ROLLBACK.
   Числа и сообщения получены на чистой базе стенда: .NET 10.0.402 + Npgsql 10.0.3 + PostgreSQL 17. */

/* ---------- код разделов ---------- */
renderCode($('#code2'), [
  'await using var connection = await dataSource.OpenConnectionAsync();',
  'await using var transaction = await connection.BeginTransactionAsync();',
  'try',
  '{',
  '    // INSERT в orders, затем для каждой позиции INSERT в order_items и UPDATE products:',
  '    await using var insertOrder = new NpgsqlCommand(sql, connection, transaction);',
  '    // …',
  '    await transaction.CommitAsync();',
  '    return "оформлен";',
  '}',
  'catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.CheckViolation)',
  '{',
  '    await transaction.RollbackAsync();',
  '    return "не оформлен, на складе не хватает товара";',
  '}',
]);
renderCode($('#code5'), [
  'foreach (var line in lines)',
  '{',
  '    await transaction.SaveAsync("item");',
  '    try',
  '    {',
  '        // INSERT позиции и UPDATE остатка',
  '        await transaction.ReleaseAsync("item");',
  '    }',
  '    catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.CheckViolation)',
  '    {',
  '        await transaction.RollbackAsync("item");   // позиция пропущена',
  '    }',
  '}',
  'await transaction.CommitAsync();',
]);

/* ---------- пошаговые операции ---------- */
const OPS = {
  notx: {
    rows: ['заказов', 'позиций', 'мониторов на складе', 'веб-камер на складе'],
    cols: ['в базе'],
    start: [[12, 18, 6, 9]],
    steps: [
      { t: 'INSERT INTO orders … RETURNING id', v: [[13, 18, 6, 9]], m: 'Строка заказа сохранена в базе сразу.' },
      { t: 'INSERT order_items: монитор, 1 шт.', v: [[13, 19, 6, 9]], m: 'Позиция с монитором сохранена.' },
      { t: 'UPDATE products: мониторов 6 → 5', v: [[13, 19, 5, 9]], m: 'Монитор списан со склада.' },
      { t: 'INSERT order_items: веб-камеры, 20 шт.', v: [[13, 20, 5, 9]], m: 'Позиция с веб-камерами сохранена: количество 20 ограничениям order_items не противоречит.' },
      { t: 'UPDATE products: веб-камер 9 → −11', fail: true, v: [[13, 20, 5, 9]], k: 'bad', m: '<code>23514: new row for relation "products" violates check constraint "products_stock_check"</code>. Программа печатает «не оформлен», а четыре изменения уже в базе.' },
    ],
  },
  tx: {
    rows: ['заказов', 'позиций', 'мониторов на складе', 'веб-камер на складе'],
    cols: ['внутри транзакции', 'в базе'],
    start: [['—', '—', '—', '—'], [12, 18, 6, 9]],
    steps: [
      { t: 'BEGIN', tx: true, v: [[12, 18, 6, 9], [12, 18, 6, 9]], m: 'Транзакция открыта. Пока внутри неё те же данные, что в базе.' },
      { t: 'INSERT INTO orders … RETURNING id', v: [[13, 18, 6, 9], [12, 18, 6, 9]], m: 'Строка заказа есть только внутри транзакции.' },
      { t: 'INSERT order_items: монитор, 1 шт.', v: [[13, 19, 6, 9], [12, 18, 6, 9]], m: 'Позиция добавлена внутри транзакции.' },
      { t: 'UPDATE products: мониторов 6 → 5', v: [[13, 19, 5, 9], [12, 18, 6, 9]], m: 'Монитор списан внутри транзакции, в базе мониторов по-прежнему 6.' },
      { t: 'INSERT order_items: веб-камеры, 20 шт.', v: [[13, 20, 5, 9], [12, 18, 6, 9]], m: 'Вторая позиция добавлена внутри транзакции.' },
      { t: 'UPDATE products: веб-камер 9 → −11', fail: true, v: [[13, 20, 5, 9], [12, 18, 6, 9]], k: 'bad', m: 'Ошибка 23514. Транзакция переходит в состояние ошибки, программа попадает в блок <code>catch</code>.' },
      { t: 'ROLLBACK', tx: true, undoAll: true, v: [['—', '—', '—', '—'], [12, 18, 6, 9]], k: 'ok', m: '<code>RollbackAsync</code> отменил все четыре изменения. В базе то же, что до заказа.' },
    ],
  },
  sp: {
    rows: ['заказов', 'позиций в заказе', 'клавиатур', 'веб-камер', 'мышей'],
    cols: ['внутри транзакции', 'в базе'],
    start: [['—', '—', '—', '—', '—'], [12, 0, 14, 9, 40]],
    steps: [
      { t: 'BEGIN', tx: true, v: [[12, 0, 14, 9, 40], [12, 0, 14, 9, 40]], m: 'Транзакция открыта.' },
      { t: 'INSERT INTO orders … RETURNING id', v: [[13, 0, 14, 9, 40], [12, 0, 14, 9, 40]], m: 'Строка заказа внутри транзакции.' },
      { t: 'SAVEPOINT item', tx: true, v: [[13, 0, 14, 9, 40], [12, 0, 14, 9, 40]], m: 'Точка сохранения перед первой позицией.' },
      { t: 'INSERT позиции: клавиатура, 1 шт.', v: [[13, 1, 14, 9, 40], [12, 0, 14, 9, 40]], m: 'Позиция добавлена.' },
      { t: 'UPDATE: клавиатур 14 → 13', v: [[13, 1, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Клавиатура списана внутри транзакции.' },
      { t: 'RELEASE SAVEPOINT item', tx: true, v: [[13, 1, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Позиция прошла, отметка больше не нужна.' },
      { t: 'SAVEPOINT item', tx: true, v: [[13, 1, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Точка сохранения перед второй позицией.' },
      { t: 'INSERT позиции: веб-камеры, 20 шт.', undoGroup: 'cam', v: [[13, 2, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Позиция добавлена.' },
      { t: 'UPDATE: веб-камер 9 → −11', fail: true, undoGroup: 'cam', v: [[13, 2, 13, 9, 40], [12, 0, 14, 9, 40]], k: 'bad', m: 'Ошибка 23514, транзакция в состоянии ошибки.' },
      { t: 'ROLLBACK TO SAVEPOINT item', tx: true, undo: 'cam', v: [[13, 1, 13, 9, 40], [12, 0, 14, 9, 40]], k: 'ok', m: 'Откат к точке: позиция с веб-камерами убрана, состояние ошибки снято. Заказ и клавиатура остались.' },
      { t: 'SAVEPOINT item', tx: true, v: [[13, 1, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Точка сохранения перед третьей позицией.' },
      { t: 'INSERT позиции: мыши, 2 шт.', v: [[13, 2, 13, 9, 40], [12, 0, 14, 9, 40]], m: 'Позиция добавлена.' },
      { t: 'UPDATE: мышей 40 → 38', v: [[13, 2, 13, 9, 38], [12, 0, 14, 9, 40]], m: 'Мыши списаны внутри транзакции.' },
      { t: 'RELEASE SAVEPOINT item', tx: true, v: [[13, 2, 13, 9, 38], [12, 0, 14, 9, 40]], m: 'Третья позиция прошла.' },
      { t: 'COMMIT', tx: true, v: [[13, 2, 13, 9, 38], [13, 2, 13, 9, 38]], k: 'ok', m: '<code>CommitAsync</code> сохранил заказ с двумя позициями. Эти числа получены на стенде.' },
    ],
  },
};

$$('[data-op]').forEach(panel => {
  const op = OPS[panel.dataset.op];
  const list = $('.steplist', panel), table = $('.counters', panel), msg = $('.opmsg', panel);
  list.innerHTML = op.steps.map((s, i) => `<li data-n="${i + 1}">${esc(s.t)}</li>`).join('');
  const items = $$('li', list);
  let at = 0;
  const draw = () => {
    const undone = new Set(op.steps.slice(0, at).filter(s => s.undo).map(s => s.undo));
    const all = op.steps.slice(0, at).some(s => s.undoAll);
    items.forEach((li, i) => {
      const s = op.steps[i];
      li.className = i >= at ? '' : (i === at - 1 ? (s.fail ? 'fail' : 'cur') : (s.fail && !s.undoGroup ? 'fail' : (s.undoGroup && undone.has(s.undoGroup) ? 'undo' : (s.tx ? 'tx' : 'done'))));
      if (all && i < at - 1 && !s.tx) li.className = 'undo';
      if (i === at - 1 && s.tx && !s.fail) li.className = 'tx cur';
    });
    const v = at ? op.steps[at - 1].v : op.start;
    const prev = at > 1 ? op.steps[at - 2].v : op.start;
    table.innerHTML = '<tr><th></th>' + op.cols.map(c => `<th>${c}</th>`).join('') + '</tr>'
      + op.rows.map((r, ri) => '<tr><td>' + r + '</td>' + op.cols.map((_, ci) => {
        const val = v[ci][ri], was = prev[ci][ri];
        const cls = ['num'];
        if (val === '—') cls.push('gone'); else if (at && val !== was) cls.push('chg');
        if (op.cols.length > 1 && ci === 0 && val !== '—') cls.push('tx');
        return `<td class="${cls.join(' ')}">${val}</td>`;
      }).join('') + '</tr>').join('');
    const s = at ? op.steps[at - 1] : null;
    msg.className = 'opmsg' + (s && s.k ? ' ' + s.k : '');
    msg.innerHTML = s ? s.m : 'Операция не начата. Кнопка «Шаг» выполнит первую команду.';
    $('[data-act="step"]', panel).disabled = at >= op.steps.length;
  };
  $('[data-act="step"]', panel).addEventListener('click', () => { if (at < op.steps.length) { at++; draw(); } });
  $('[data-act="reset"]', panel).addEventListener('click', () => { at = 0; draw(); });
  draw();
});

/* ---------- 3. Как заканчивается транзакция ---------- */
(() => {
  const C = [
    { t: 'Ошибка и RollbackAsync в catch', code: ['await using var transaction = await connection.BeginTransactionAsync();', 'try', '{', '    // заказ из раздела 2: ошибка 23514 на пятой команде', '    await transaction.CommitAsync();', '}', 'catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.CheckViolation)', '{', '    await transaction.RollbackAsync();', '}'],
      k: 'ok', out: 'После отката в базе 12 заказов, 18 позиций, 6 мониторов — как до заказа.' },
    { t: 'Транзакция закрыта без CommitAsync', code: ['await using (var connection = await dataSource.OpenConnectionAsync())', '{', '    await using var transaction = await connection.BeginTransactionAsync();', '    // INSERT INTO orders … — выполнен без ошибки', '    // CommitAsync не вызван', '}'],
      k: 'warn', out: 'Заказов по-прежнему 12. При закрытии объекта транзакции без <code>CommitAsync</code> Npgsql отправляет серверу <code>ROLLBACK</code>. Забытый <code>CommitAsync</code> выглядит как потерянные данные без единой ошибки.' },
    { t: 'Команда после ошибки', code: ['await using var transaction = await connection.BeginTransactionAsync();', 'try { /* UPDATE: веб-камер 9 → −91 */ }', 'catch (PostgresException) { /* ошибку проглотили */ }', '', '// следующая команда той же транзакции:', 'await takeStock.ExecuteNonQueryAsync();'],
      k: 'bad', out: '<code>25P02: current transaction is aborted, commands ignored until end of transaction block</code><br>После ошибки сервер отклоняет любые команды транзакции, пока она не будет отменена целиком или до точки сохранения.' },
    { t: 'CommitAsync после проглоченной ошибки', code: ['await using var transaction = await connection.BeginTransactionAsync();', '// INSERT INTO orders … — выполнен', 'try { /* UPDATE: веб-камер 9 → −11 */ }', 'catch (PostgresException) { /* ошибку проглотили */ }', 'await transaction.CommitAsync();'],
      k: 'bad', out: '<code>CommitAsync</code> завершился без исключения, но заказов по-прежнему 12. Транзакция была в состоянии ошибки, и сервер на <code>COMMIT</code> выполнил откат. Программа считает заказ сохранённым, а его в базе нет.' },
    { t: 'Команда без transaction в аргументах', code: ['await using var transaction = await connection.BeginTransactionAsync();', 'var command = new NpgsqlCommand(', '    "UPDATE products SET stock = stock - 1 WHERE id = 3", connection);', 'await command.ExecuteNonQueryAsync();', 'await transaction.RollbackAsync();'],
      k: 'ok', out: 'Остаток мониторов не изменился: команда вошла в транзакцию соединения и откатилась вместе с ней. Так работает Npgsql; провайдер SQL Server в этом случае бросает исключение, поэтому транзакцию передают в команду явно.' },
    { t: 'Номер заказа после отката', code: ['// транзакция 1: INSERT INTO orders … RETURNING id → 13, затем ROLLBACK', '// транзакция 2: INSERT INTO orders … RETURNING id → ?'],
      k: 'warn', out: 'Вторая транзакция получила номер <code>14</code>. Номер 13 был выдан отменённой вставке и больше не используется.' },
  ];
  const list = $('#cases');
  list.innerHTML = C.map((c, i) => `<button type="button" aria-pressed="${i === 0}"><b>${i + 1}</b>${c.t}</button>`).join('');
  const btns = $$('button', list);
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    renderCode($('#caseCode'), C[i].code);
    const o = $('#caseOut'); o.className = 'verdict-box ' + C[i].k; o.innerHTML = C[i].out;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();

/* ---------- 4. Два соединения ---------- */
(() => {
  const V = {
    commit: [
      [1, 'BEGIN', '', 6], [1, 'UPDATE products SET stock = stock - 2 WHERE id = 3', '', 6],
      [1, 'SELECT stock … → <b>4</b>', 'read', 6], [2, 'SELECT stock … → <b>6</b>', 'read', 6],
      [1, 'COMMIT', 'end', 4], [2, 'SELECT stock … → <b>4</b>', 'read', 4],
    ],
    rollback: [
      [1, 'BEGIN', '', 6], [1, 'UPDATE products SET stock = stock - 2 WHERE id = 3', '', 6],
      [1, 'SELECT stock … → <b>4</b>', 'read', 6], [2, 'SELECT stock … → <b>6</b>', 'read', 6],
      [1, 'ROLLBACK', 'back', 6], [2, 'SELECT stock … → <b>6</b>', 'read', 6],
    ],
  };
  let mode = 'commit', at = 0;
  const draw = () => {
    const ev = V[mode].slice(0, at);
    const col = n => ev.map((e, k) => e[0] === n ? `<div class="ev ${e[2]}${k === ev.length - 1 ? ' new' : ''}">${e[1]}</div>` : '<div class="ev gap">·</div>').join('');
    $('#c1').innerHTML = col(1); $('#c2').innerHTML = col(2);
    const base = at ? ev[ev.length - 1][3] : 6;
    $('#base').textContent = `сохранено в базе: мониторов ${base}`;
    $('#visStep').disabled = at >= V[mode].length;
  };
  $$('#vis [data-v]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.v; at = 0;
    $$('#vis [data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));
  $('#visStep').addEventListener('click', () => { at++; draw(); });
  $('#visReset').addEventListener('click', () => { at = 0; draw(); });
  draw();
})();
