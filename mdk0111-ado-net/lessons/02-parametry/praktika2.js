/* МДК.01.11 · занятие 2 · практика: четыре задания, рецензия и отчёт .md.
   Ответы задания 2 и выводы задания 4 получены запуском SearchApp на настоящем стенде. */

(() => {
  const KEY = 'mdk0111-z02-v1';
  const MAX = { 1: 2, 2: 3, 3: 2, 4: 3 };
  let st;
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) { /* приватный режим */ } };
  const T = n => st['t' + n] || (st['t' + n] = {});

  const showDone = (n, fb) => {
    const box = $('#t' + n), s = T(n).score;
    box.classList.add('is-done', 'locked');
    $('.task__head .pts', box).textContent = `${s} из ${MAX[n]}`;
    $('.verdict', box).innerHTML = s === MAX[n] ? '<span class="ok-t">Верно</span>' : s > 0 ? '<span class="ok-t">Частично верно</span>' : '<span class="bad-t">Неверно</span>';
    $('[data-check]', box).disabled = true;
    $$('input, textarea, select', box).forEach(el => { el.readOnly = true; if (el.tagName === 'SELECT') el.disabled = true; });
    $('#t' + n + 'fb').innerHTML = fb;
  };
  const finish = (n, score, fb) => { T(n).done = true; T(n).score = score; save(); showDone(n, fb); renderReview(); };
  const warn = (n, text) => { $('#t' + n + ' .verdict').innerHTML = `<span class="bad-t">${text}</span>`; };
  const mark = ok => ok ? '<span class="ok-t">✓</span>' : '<span class="bad-t">✕</span>';

  /* ---------- задание 1 ---------- */
  const L1 = [
    ['new NpgsqlCommand($"SELECT * FROM customers WHERE full_name = \'{name}\'", connection);', true, 'интерполяция вклеивает имя в текст запроса'],
    ['new NpgsqlCommand("SELECT * FROM customers WHERE full_name = @name", connection);\ncommand.Parameters.AddWithValue("name", name);', false, 'имя передано параметром'],
    ['new NpgsqlCommand("SELECT * FROM customers WHERE city = \'" + city + "\'", connection);', true, 'город присоединён к тексту запроса через +'],
    ['new NpgsqlCommand(string.Format("SELECT * FROM customers WHERE city = \'{0}\'", city), connection);', true, 'string.Format вставляет город в текст так же, как интерполяция'],
    ['new NpgsqlCommand("SELECT * FROM customers WHERE city = @city", connection);\ncommand.Parameters.AddWithValue("city", city);', false, 'город передан параметром'],
    ['new NpgsqlCommand("SELECT * FROM products WHERE name ILIKE @p", connection);\ncommand.Parameters.AddWithValue("p", "%" + text + "%");', false, 'склейка со знаками % идёт в значении параметра, текст запроса не меняется'],
    ['new NpgsqlCommand($"SELECT * FROM products ORDER BY {sorts[choice]}", connection);', false, 'в запрос попадает только строка из словаря; для неизвестного ключа индексатор бросает KeyNotFoundException, и запрос не выполняется'],
  ];
  const t1 = T(1); t1.a = t1.a || {};
  $('#t1list').innerHTML = L1.map(([code], i) => `<div class="markrow" data-i="${i}"><pre>${esc(code)}</pre><div class="tabs"><button type="button" data-v="1">можно</button><button type="button" data-v="0">нельзя</button></div></div>`).join('');
  const drawT1 = () => $$('#t1list .markrow').forEach(row => {
    const i = +row.dataset.i, v = t1.a[i];
    $$('button', row).forEach(b => b.setAttribute('aria-pressed', String(v !== undefined && String(+v) === b.dataset.v)));
    if (t1.done) row.classList.add(v === L1[i][1] ? 'good' : 'bad');
  });
  $('#t1list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || t1.done) return;
    t1.a[b.closest('.markrow').dataset.i] = b.dataset.v === '1'; save(); drawT1();
  });
  const fbT1 = () => `<h4>Разбор</h4><ul>${L1.map(([, v, why], i) => `<li>${mark(t1.a[i] === v)} Строка ${i + 1}: ${v ? 'внедрить SQL можно' : 'внедрить SQL нельзя'} — ${why}.</li>`).join('')}</ul>`;
  const checkT1 = () => {
    if (L1.some((_, i) => t1.a[i] === undefined)) return warn(1, 'Отметьте все семь строк');
    const r = L1.filter(([, v], i) => t1.a[i] === v).length;
    finish(1, r === 7 ? 2 : r === 6 ? 1 : 0, fbT1()); drawT1();
  };

  /* ---------- задание 2 ---------- */
  renderCode($('#t2code'), ['string sql = $"SELECT id, name, price FROM products WHERE name ILIKE \'%{text}%\' ORDER BY id";']);
  const OPTS = ['не найдёт ни одного товара', 'найдёт 1 товар', 'найдёт 2 товара', 'выдаст все 8 товаров', 'закончится ошибкой 42601', 'выдаст 8 товаров и поставит всем цену 1.00'];
  const Q2 = [
    ['мыши', 1, 'шаблон <code>\'%мыши%\'</code> подходит только «Коврику для мыши»: в слове «Мышь» нет буквы «и» после «мыш»'],
    ["D'Artagnan", 4, 'апостроф закрыл строку, сервер ответил <code>42601: syntax error at or near "Artagnan"</code>'],
    ["' OR 2>1 --", 3, 'условие <code>2>1</code> верно для каждой строки, как <code>1=1</code>; остаток запроса закомментирован'],
    ["'; UPDATE products SET price = 1; --", 5, 'точка с запятой отделила второй запрос; программа печатает 8 товаров, а UPDATE меняет цены'],
    ['мыш', 2, 'запрос не изменён, шаблон подходит Мыши и Коврику для мыши'],
  ];
  const t2 = T(2); t2.a = t2.a || {};
  $('#t2table tbody').innerHTML = Q2.map(([inp], i) => `<tr data-i="${i}"><td><code>${esc(inp)}</code></td><td><select><option value="">— выберите —</option>${OPTS.map((o, k) => `<option value="${k}">${o}</option>`).join('')}</select></td></tr>`).join('');
  const sels = $$('#t2table select');
  const drawT2 = () => sels.forEach((s, i) => {
    s.value = t2.a[i] ?? '';
    if (t2.done) s.closest('tr').className = +t2.a[i] === Q2[i][1] ? 'good' : 'bad';
  });
  sels.forEach((s, i) => s.addEventListener('change', () => { if (t2.done) return; t2.a[i] = s.value; save(); }));
  const fbT2 = () => `<h4>Разбор</h4><ul>${Q2.map(([inp, k, why], i) => `<li>${mark(+t2.a[i] === k)} <code>${esc(inp)}</code> — ${OPTS[k]}: ${why}.</li>`).join('')}</ul>`;
  const checkT2 = () => {
    if (Q2.some((_, i) => t2.a[i] === undefined || t2.a[i] === '')) return warn(2, 'Выберите ответ для каждого ввода');
    const r = Q2.filter(([, k], i) => +t2.a[i] === k).length;
    finish(2, r === 5 ? 3 : r === 4 ? 2 : r === 3 ? 1 : 0, fbT2()); drawT2();
  };

  /* ---------- задание 3 ---------- */
  const t3 = T(3); t3.a = t3.a || ['', '', ''];
  const ins = $$('#t3code input');
  const judge = () => {
    const [a, b, c] = t3.a.map(x => (x || '').trim());
    const m0 = a.match(/^@([A-Za-z_]\w*)$/);
    const m1 = b.match(/^"@?([A-Za-z_]\w*)"$/);
    const ok0 = !!m0;
    const ok1 = !!m1 && ok0 && m1[1].toLowerCase() === m0[1].toLowerCase();
    const ok2 = c === 'maxPrice';
    return [ok0, ok1, ok2];
  };
  const drawT3 = () => {
    ins.forEach((inp, i) => { inp.value = t3.a[i] || ''; });
    if (t3.done) judge().forEach((ok, i) => { ins[i].className = ok ? 'good' : 'bad'; });
  };
  ins.forEach((inp, i) => inp.addEventListener('input', () => { if (t3.done) return; t3.a[i] = inp.value; save(); }));
  const fbT3 = () => {
    const [o0, o1, o2] = judge();
    return `<h4>Разбор</h4><ul>
      <li>${mark(o0)} В тексте запроса — место параметра с <code>@</code>, например <code>@maxPrice</code>. Значение в текст запроса не попадает.</li>
      <li>${mark(o1)} Первый аргумент <code>AddWithValue</code> — имя того же параметра в кавычках: <code>"maxPrice"</code>. Регистр и <code>@</code> в начале не учитываются, но имя должно совпадать, иначе сервер ответит <code>42703: column "maxprice" does not exist</code>.</li>
      <li>${mark(o2)} Второй аргумент — переменная <code>maxPrice</code> типа <code>decimal</code>; она уйдёт на сервер как <code>numeric</code>.</li>
    </ul><p>На стенде для <code>maxPrice = 1000</code> запрос вернул: Коврик для мыши, 390,00; Мышь, 890,00.</p>`;
  };
  const checkT3 = () => {
    if (t3.a.some(x => !(x || '').trim())) return warn(3, 'Заполните три пропуска');
    const r = judge().filter(Boolean).length;
    finish(3, r === 3 ? 2 : r === 2 ? 1 : 0, fbT3()); drawT3();
  };

  /* ---------- задание 4 ---------- */
  const t4 = T(4);
  const boxes = { a: $('#t4a'), b: $('#t4b'), c: $('#t4c') };
  Object.entries(boxes).forEach(([k, el]) => { el.value = t4[k] || ''; el.addEventListener('input', () => { if (t4.done) return; t4[k] = el.value; save(); }); });
  const sqlLine = s => ((s || '').match(/SQL:.*$/m) || [''])[0];
  const found = s => { const m = (s || '').match(/Найдено товаров:\s*(\d+)/); return m ? +m[1] : null; };
  const evalT4 = () => {
    const a = t4.a || '', b = t4.b || '', c = t4.c || '';
    const okA = /OR 1=1/.test(sqlLine(a)) && found(a) === 8;
    const okB = /@\w+/.test(sqlLine(b)) && !/OR 1=1/.test(sqlLine(b)) && found(b) === 0;
    const okC = /@\w+/.test(sqlLine(c)) && /USB-хаб/.test(c) && found(c) === 1;
    return [okA, okB, okC];
  };
  const fbT4 = () => {
    const [okA, okB, okC] = evalT4();
    return `<h4>Разбор</h4><ul>
      <li>${mark(okA)} До исправления: в строке <code>SQL:</code> видно <code>OR 1=1</code>, найдено 8 товаров — вся таблица.</li>
      <li>${mark(okB)} После исправления с тем же вводом: в строке <code>SQL:</code> стоит <code>@pattern</code>, найдено 0 товаров.${okB ? '' : ' Если в выводе по-прежнему <code>OR 1=1</code>, программа запущена до сохранения файла или текст поиска всё ещё вклеивается в SQL.'}</li>
      <li>${mark(okC)} После исправления поиск по названию работает: <code>USB</code> находит USB-хаб, 1 товар.${okC ? '' : ' Проверьте, что знаки % добавлены к значению: <code>"%" + text + "%"</code>.'}</li>
    </ul><p>Эталон исправления:</p><pre class="code" style="padding:10px 14px">string sql = "SELECT id, name, price FROM products WHERE name ILIKE @pattern ORDER BY id";
await using var command = new NpgsqlCommand(sql, connection);
command.Parameters.AddWithValue("pattern", "%" + text + "%");</pre>`;
  };
  const checkT4 = () => {
    if (Object.keys(boxes).some(k => !(t4[k] || '').trim())) return warn(4, 'Заполните три поля');
    finish(4, evalT4().filter(Boolean).length, fbT4());
  };

  /* ---------- проверка и восстановление ---------- */
  const checks = { 1: checkT1, 2: checkT2, 3: checkT3, 4: checkT4 };
  $$('[data-check]').forEach(b => b.addEventListener('click', () => checks[b.dataset.check]()));
  drawT1(); drawT2(); drawT3();
  if (T(1).done) showDone(1, fbT1());
  if (T(2).done) showDone(2, fbT2());
  if (T(3).done) showDone(3, fbT3());
  if (T(4).done) showDone(4, fbT4());

  /* ---------- рецензия и отчёт ---------- */
  const NAMES = { 1: 'Где можно внедрить SQL', 2: 'Что сделает запрос', 3: 'Запрос с параметром по образцу', 4: 'Исправить поиск в SearchApp' };
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
    const fence = (lang, text) => '```' + lang + '\n' + (text || '').replace(/\s+$/, '') + '\n```';
    const md = [
      '# Занятие 2 · Параметры запроса и SQL-инъекция', '',
      'МДК.01.11 Технология доступа к базам данных ADO.NET', '',
      '| | |', '|---|---|',
      `| Студент | ${name} |`, `| Группа | ${group || '—'} |`, `| Дата | ${new Date().toLocaleDateString('ru-RU')} |`, '',
      '## Баллы', '', '| Задание | Баллы |', '|---|---|',
      ...[1, 2, 3, 4].map(n => `| ${n}. ${NAMES[n]} | ${sc(n)} |`),
      `| **Итого** | **${total()} / 10** |`, '',
      '## Задание 1. Где можно внедрить SQL', '',
      '| Строка | Ответ |', '|---|---|',
      ...L1.map((_, i) => `| ${i + 1} | ${t1.a[i] === undefined ? '—' : t1.a[i] ? 'можно' : 'нельзя'} |`), '',
      '## Задание 2. Что сделает запрос', '',
      '| Ввод | Ответ |', '|---|---|',
      ...Q2.map(([inp], i) => `| \`${inp}\` | ${t2.a[i] !== undefined && t2.a[i] !== '' ? OPTS[+t2.a[i]] : '—'} |`), '',
      '## Задание 3. Запрос с параметром', '',
      fence('csharp', `... WHERE price <= ${t3.a[0] || '___'} ORDER BY price\ncommand.Parameters.AddWithValue(${t3.a[1] || '___'}, ${t3.a[2] || '___'});`), '',
      '## Задание 4. SearchApp', '',
      'До исправления, ввод `\' OR 1=1 --`:', '', fence('text', t4.a), '',
      'После исправления, ввод `\' OR 1=1 --`:', '', fence('text', t4.b), '',
      'После исправления, ввод `USB`:', '', fence('text', t4.c), '',
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    a.download = 'report.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
