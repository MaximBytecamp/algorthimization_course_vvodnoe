/* МДК.01.11 · занятие 4 · практика: четыре задания, рецензия и отчёт .md.
   Случаи заданий 2–3 и вывод задания 4 проверены запуском на чистой базе стенда. */

(() => {
  const KEY = 'mdk0111-z04-v1';
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

  function selectTask(n, rows, opts, score) {
    const t = T(n); t.a = t.a || {};
    $(`#t${n}table tbody`).innerHTML = rows.map(r => `<tr><td>${r.q}</td><td><select><option value="">— выберите —</option>${opts.map((o, k) => `<option value="${k}">${esc(o)}</option>`).join('')}</select></td></tr>`).join('');
    const sels = $$(`#t${n}table select`);
    const draw = () => sels.forEach((s, i) => {
      s.value = t.a[i] ?? '';
      if (t.done) s.closest('tr').className = +t.a[i] === rows[i].ok ? 'good' : 'bad';
    });
    sels.forEach((s, i) => s.addEventListener('change', () => { if (t.done) return; t.a[i] = s.value; save(); }));
    const fb = () => `<h4>Разбор</h4><ul>${rows.map((r, i) => `<li>${mark(+t.a[i] === r.ok)} ${r.q} — <b>${esc(opts[r.ok])}</b>. ${r.why}</li>`).join('')}</ul>`;
    const check = () => {
      if (rows.some((_, i) => t.a[i] === undefined || t.a[i] === '')) return warn(n, 'Выберите ответ в каждой строке');
      finish(n, score(rows.filter((r, i) => +t.a[i] === r.ok).length), fb()); draw();
    };
    draw();
    if (t.done) showDone(n, fb());
    return check;
  }

  /* ---------- задание 1 ---------- */
  const L1 = [
    'await using var connection = await dataSource.OpenConnectionAsync();',
    'await using var transaction = await connection.BeginTransactionAsync();',
    'int orderId = (int)(await insertOrder.ExecuteScalarAsync())!;',
    'await insertItem.ExecuteNonQueryAsync();',
    'await takeStock.ExecuteNonQueryAsync();',
    'await transaction.CommitAsync();',
  ];
  const WHY1 = [
    'транзакция открывается на соединении, поэтому соединение нужно первым',
    'транзакция открыта до первой команды, которая меняет данные',
    'строка заказа добавляется первой: её номер нужен позициям',
    'позиция ссылается на номер заказа',
    'остаток уменьшается для той же позиции; эту строку можно поставить и перед INSERT позиции',
    'сохранение — последним, когда все команды выполнены',
  ];
  const SHUF = [4, 1, 5, 0, 3, 2];
  const t1 = T(1); t1.order = t1.order || [];
  const okPos = (i, pos) => i === pos || (pos === 3 && i === 4) || (pos === 4 && i === 3);
  const right1 = () => t1.order.filter((i, pos) => okPos(i, pos)).length;
  const drawT1 = () => {
    $('#t1src').innerHTML = SHUF.filter(i => !t1.order.includes(i)).map(i => `<li data-i="${i}">${esc(L1[i])}</li>`).join('');
    $('#t1dst').innerHTML = t1.order.map((i, pos) => `<li data-i="${i}" class="${t1.done ? (okPos(i, pos) ? 'good' : 'bad') : ''}">${esc(L1[i])}</li>`).join('');
  };
  $('#t1src').addEventListener('click', e => { const li = e.target.closest('li'); if (!li || t1.done) return; t1.order.push(+li.dataset.i); save(); drawT1(); });
  $('#t1dst').addEventListener('click', e => { const li = e.target.closest('li'); if (!li || t1.done) return; t1.order = t1.order.filter(i => i !== +li.dataset.i); save(); drawT1(); });
  const fbT1 = () => `<h4>Разбор</h4><p>На своём месте ${right1()} из 6 строк. Порядок:</p><ul>${L1.map((l, i) => `<li><code>${esc(l)}</code> — ${WHY1[i]}.</li>`).join('')}</ul><p>При ошибке выполнение уходит в <code>catch</code>, где вызывается <code>RollbackAsync</code>, и строка с <code>CommitAsync</code> не выполняется.</p>`;
  const check1 = () => {
    if (t1.order.length < 6) return warn(1, 'Расставьте все шесть строк');
    const r = right1();
    finish(1, r === 6 ? 2 : r >= 4 ? 1 : 0, fbT1()); drawT1();
  };
  drawT1();
  if (t1.done) showDone(1, fbT1());

  /* ---------- задание 2 ---------- */
  const check2 = selectTask(2, [
    { q: 'Без транзакции. Ошибка 23514 на последнем <code>UPDATE</code>, программа её перехватила', ok: 1, why: 'Каждая команда без транзакции сохраняется сразу: строка заказа уже в базе.' },
    { q: 'В транзакции. Ошибка 23514 на последнем <code>UPDATE</code>, в <code>catch</code> вызван <code>RollbackAsync</code>', ok: 0, why: 'Откат отменил все команды транзакции.' },
    { q: 'В транзакции. Все команды прошли без ошибок, но <code>CommitAsync</code> не вызван', ok: 0, why: 'При закрытии объекта транзакции без <code>CommitAsync</code> Npgsql отправляет <code>ROLLBACK</code>.' },
    { q: 'В транзакции. Ошибку 23514 на первой позиции перехватили и выполнили команды второй позиции без точки сохранения', ok: 2, why: 'После ошибки сервер отклоняет все команды транзакции до отката.' },
    { q: 'В транзакции. Ошибку 23514 на последнем <code>UPDATE</code> перехватили и вызвали <code>CommitAsync</code>', ok: 0, why: '<code>CommitAsync</code> завершается без исключения, но транзакция была в состоянии ошибки, и сервер выполняет откат.' },
    { q: 'В транзакции с точкой сохранения перед каждой позицией. Вторая позиция откатилась к точке, в конце вызван <code>CommitAsync</code>', ok: 1, why: 'Откат к точке убрал только одну позицию, заказ сохранён.' },
    { q: 'В транзакции. Все команды прошли, вызван <code>CommitAsync</code>', ok: 1, why: 'Заказ сохранён целиком.' },
  ], ['заказов 12', 'заказов 13', 'исключение 25P02'], r => r === 7 ? 3 : r === 6 ? 2 : r === 5 ? 1 : 0);

  /* ---------- задание 3 ---------- */
  const check3 = selectTask(3, [
    { q: 'Соединение 1 читает остаток внутри своей транзакции, после <code>UPDATE</code>', ok: 1, why: 'Внутри транзакции её изменения уже действуют.' },
    { q: 'Соединение 2 читает, пока транзакция не завершена', ok: 0, why: 'В режиме <code>READ COMMITTED</code> другие соединения читают только сохранённые данные.' },
    { q: 'Соединение 2 читает после <code>COMMIT</code>', ok: 1, why: 'После сохранения изменение видно всем.' },
    { q: 'Транзакция завершилась <code>ROLLBACK</code>. Соединение 2 читает', ok: 0, why: 'Отменённое изменение в базу не попало.' },
  ], ['9', '6', '3'], r => r === 4 ? 2 : r === 3 ? 1 : 0);

  /* ---------- задание 4 ---------- */
  const t4 = T(4);
  const box = $('#t4out');
  box.value = t4.out || '';
  box.addEventListener('input', () => { if (t4.done) return; t4.out = box.value; save(); });
  const evalT4 = () => {
    const out = (t4.out || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ');
    return {
      first: /Заказ 1: оформлен/.test(out),
      second: /Заказ 2: не оформлен/.test(out),
      counts: /Стало: заказов 13, позиций 20/.test(out),
      stock: /Остатки: Клавиатура 13, Мышь 40, Монитор 24" 5, Веб-камера 9/.test(out),
      old: /Стало: заказов 14/.test(out),
    };
  };
  const scoreT4 = a => (a.first && a.second && a.counts ? 2 : 0) + (a.stock ? 1 : 0);
  const fbT4 = () => {
    const a = evalT4();
    return `<h4>Разбор</h4><ul>
      <li>${mark(a.first && a.second)} Заказ 1 оформлен, заказ 2 не оформлен.</li>
      <li>${mark(a.counts)} <code>Стало: заказов 13, позиций 20</code>: в базе только первый заказ и его две позиции.${a.old ? ' В выводе 14 заказов — команды второго заказа по-прежнему выполняются без транзакции или транзакция не откатывается.' : ''}</li>
      <li>${mark(a.stock)} Мышей снова 40: списание мышей из второго заказа отменено вместе с ним.</li>
    </ul><p>Эталон — три строки в <code>CreateOrderAsync</code>:</p><pre class="code" style="padding:10px 14px">await using var transaction = await connection.BeginTransactionAsync();
…
await transaction.CommitAsync();      // перед return в try
…
await transaction.RollbackAsync();    // в catch</pre>`;
  };
  const check4 = () => {
    if (!(t4.out || '').trim()) return warn(4, 'Вставьте вывод программы');
    finish(4, scoreT4(evalT4()), fbT4());
  };
  if (t4.done) showDone(4, fbT4());

  const checks = { 1: check1, 2: check2, 3: check3, 4: check4 };
  $$('[data-check]').forEach(b => b.addEventListener('click', () => checks[b.dataset.check]()));

  /* ---------- рецензия и отчёт ---------- */
  const NAMES = { 1: 'Порядок вызовов в транзакции', 2: 'Что останется в базе', 3: 'Что прочитает другое соединение', 4: 'Транзакция в OrderApp' };
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
    const pick = n => $$(`#t${n}table tbody tr`).map((tr, i) => {
      const q = tr.cells[0].textContent.replace(/\|/g, '\\|');
      const s = $('select', tr), v = T(n).a && T(n).a[i];
      return `| ${q} | ${v !== undefined && v !== '' ? s.options[+v + 1].textContent : '—'} |`;
    });
    const md = [
      '# Занятие 4 · Транзакции и откат операций', '',
      'МДК.01.11 Технология доступа к базам данных ADO.NET', '',
      '| | |', '|---|---|',
      `| Студент | ${name} |`, `| Группа | ${group || '—'} |`, `| Дата | ${new Date().toLocaleDateString('ru-RU')} |`, '',
      '## Баллы', '', '| Задание | Баллы |', '|---|---|',
      ...[1, 2, 3, 4].map(n => `| ${n}. ${NAMES[n]} | ${sc(n)} |`),
      `| **Итого** | **${total()} / 10** |`, '',
      '## Задание 1. Порядок вызовов', '', '```csharp', ...(t1.order || []).map(i => L1[i]), '```', '',
      '## Задание 2. Что останется в базе', '', '| Случай | Ответ |', '|---|---|', ...pick(2), '',
      '## Задание 3. Что прочитает другое соединение', '', '| Момент | Ответ |', '|---|---|', ...pick(3), '',
      '## Задание 4. OrderApp', '', '```text', (t4.out || '').replace(/\s+$/, ''), '```', '',
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    a.download = 'report.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
