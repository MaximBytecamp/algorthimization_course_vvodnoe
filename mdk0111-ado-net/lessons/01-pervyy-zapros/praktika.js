/* МДК.01.11 · занятие 1 · практика: четыре задания, рецензия и отчёт .md.
   Ответы и баллы хранятся в localStorage; у каждого задания одна проверка.
   Сообщения задания 3 и вывод задания 4 получены запуском на настоящем стенде. */

(() => {
  const { $, $$, esc, renderCode } = window.ado;
  const KEY = 'mdk0111-z01-v1';
  const MAX = { 1: 2, 2: 2, 3: 3, 4: 3 };
  let st;
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) { /* приватный режим */ } };
  const balls = n => n === 1 ? 'балл' : n >= 2 && n <= 4 ? 'балла' : 'баллов';

  const finish = (n, score, fbHtml) => {
    st['t' + n] = { ...(st['t' + n] || {}), done: true, score };
    save();
    showDone(n, fbHtml);
    renderReview();
  };
  const showDone = (n, fbHtml) => {
    const box = $('#t' + n);
    box.classList.add('is-done', 'locked');
    const s = st['t' + n].score;
    $('.task__head .pts', box).textContent = `${s} из ${MAX[n]}`;
    $('.verdict', box).innerHTML = s === MAX[n] ? '<span class="ok-t">Верно</span>' : s > 0 ? '<span class="ok-t">Частично верно</span>' : '<span class="bad-t">Неверно</span>';
    $('[data-check]', box).disabled = true;
    $$('input, textarea', box).forEach(el => { el.readOnly = true; });
    $('#t' + n + 'fb').innerHTML = fbHtml;
  };
  const warn = (n, text) => { $('#t' + n + ' .verdict').innerHTML = `<span class="bad-t">${text}</span>`; };

  /* ---------- задание 1 ---------- */
  const T1 = [
    'await using var dataSource = NpgsqlDataSource.Create(connectionString);',
    'await using var connection = await dataSource.OpenConnectionAsync();',
    'await using var command = new NpgsqlCommand("SELECT status FROM orders", connection);',
    'await using var reader = await command.ExecuteReaderAsync();',
    'while (await reader.ReadAsync())',
    '    Console.WriteLine(reader.GetString(0));',
  ];
  const T1WHY = [
    'источник данных создаётся первым: из него получают соединение',
    'соединение открывается из источника данных',
    'команда использует переменную connection, поэтому стоит после строки, где соединение открыто',
    'читатель получается из выполненной команды',
    'цикл переводит читатель со строки на строку',
    'значение читается из текущей строки; в запросе один столбец, поэтому его номер 0',
  ];
  const SHUF = [3, 0, 5, 2, 4, 1];
  const t1 = st.t1 || (st.t1 = { order: [] });
  const drawT1 = () => {
    const done = t1.done;
    $('#t1src').innerHTML = SHUF.filter(i => !t1.order.includes(i)).map(i => `<li data-i="${i}">${esc(T1[i])}</li>`).join('');
    $('#t1dst').innerHTML = t1.order.map((i, pos) => `<li data-i="${i}" class="${done ? (i === pos ? 'good' : 'bad') : ''}">${esc(T1[i])}</li>`).join('');
  };
  $('#t1src').addEventListener('click', e => { const li = e.target.closest('li'); if (!li || t1.done) return; t1.order.push(Number(li.dataset.i)); save(); drawT1(); });
  $('#t1dst').addEventListener('click', e => { const li = e.target.closest('li'); if (!li || t1.done) return; t1.order = t1.order.filter(i => i !== Number(li.dataset.i)); save(); drawT1(); });
  const fbT1 = () => {
    const right = t1.order.filter((i, pos) => i === pos).length;
    return `<h4>Разбор</h4><p>На своём месте ${right} из 6 строк. Верный порядок:</p><ul>${T1.map((l, i) => `<li><code>${esc(l.trim())}</code> — ${T1WHY[i]}.</li>`).join('')}</ul>`;
  };
  const checkT1 = () => {
    if (t1.order.length < 6) return warn(1, 'Расставьте все шесть строк');
    const right = t1.order.filter((i, pos) => i === pos).length;
    finish(1, right === 6 ? 2 : right >= 4 ? 1 : 0, fbT1());
    drawT1();
  };

  /* ---------- задание 2 ---------- */
  const YML2 = ['services:', '  stock-db:', '    image: postgres:17', '    environment:', '      POSTGRES_DB: warehouse', '      POSTGRES_USER: keeper', '      POSTGRES_PASSWORD: k33per', '    ports:', '      - "6543:5432"'];
  $('#t2yml').innerHTML = YML2.map(l => `<span>${esc(l)}</span>`).join('');
  const T2 = {
    Host: { ok: v => /^(localhost|127\.0\.0\.1)$/i.test(v), right: 'localhost', why: 'контейнер запущен на этом же компьютере, Docker открывает его порт на localhost' },
    Port: { ok: v => v === '6543', right: '6543', why: 'левое число в ports — порт на компьютере; 5432 — порт внутри контейнера' },
    Database: { ok: v => v === 'warehouse', right: 'warehouse', why: 'значение POSTGRES_DB' },
    Username: { ok: v => v === 'keeper', right: 'keeper', why: 'значение POSTGRES_USER' },
    Password: { ok: v => v === 'k33per', right: 'k33per', why: 'значение POSTGRES_PASSWORD, в пароле цифры 3 вместо букв e' },
  };
  const t2 = st.t2 || (st.t2 = { vals: {} });
  const inputs = $$('#t2fields input');
  const drawT2 = () => {
    inputs.forEach(inp => {
      inp.value = t2.vals[inp.dataset.k] || '';
      if (t2.done) inp.className = T2[inp.dataset.k].ok(inp.value.trim()) ? 'good' : 'bad';
    });
    const parts = inputs.map(i => `${i.dataset.k}=${(t2.vals[i.dataset.k] || '').trim()}`);
    $('#t2str').textContent = '"' + parts.join(';') + '"';
  };
  inputs.forEach(inp => inp.addEventListener('input', () => { if (t2.done) return; t2.vals[inp.dataset.k] = inp.value; save(); $('#t2str').textContent = '"' + inputs.map(i => `${i.dataset.k}=${(t2.vals[i.dataset.k] || '').trim()}`).join(';') + '"'; }));
  const fbT2 = () => `<h4>Разбор</h4><ul>${Object.entries(T2).map(([k, d]) => {
    const v = (t2.vals[k] || '').trim(), ok = d.ok(v);
    return `<li>${ok ? '<span class="ok-t">✓</span>' : '<span class="bad-t">✕</span>'} <code>${k}=${esc(v) || '…'}</code>${ok ? '' : ` → <code>${k}=${d.right}</code>`} — ${d.why}.</li>`;
  }).join('')}</ul><p>Верная строка: <code>Host=localhost;Port=6543;Database=warehouse;Username=keeper;Password=k33per</code></p>`;
  const checkT2 = () => {
    if (inputs.some(i => !(t2.vals[i.dataset.k] || '').trim())) return warn(2, 'Заполните все пять полей');
    const right = Object.entries(T2).filter(([k, d]) => d.ok((t2.vals[k] || '').trim())).length;
    finish(2, right === 5 ? 2 : right === 4 ? 1 : 0, fbT2());
    drawT2();
  };

  /* ---------- задание 3 ---------- */
  const CODE3 = [
    'using Npgsql;',
    '',
    'const string connectionString =',
    '    "Host=localhost;Port=5432;Database=orders;Username=student;Password=student";',
    '',
    'await using var dataSource = NpgsqlDataSource.Create(connectionString);',
    'await using var connection = dataSource.CreateConnection();',
    '',
    'await using var command = new NpgsqlCommand(',
    '    "SELECT id, status, total FROM order", connection);',
    '',
    'await using var reader = await command.ExecuteReaderAsync();',
    '',
    'while (await reader.ReadAsync())',
    '{',
    '    int id = reader.GetInt32(0);',
    '    int status = reader.GetInt32(1);',
    '    decimal total = reader.GetDecimal(2);',
    '',
    '    Console.WriteLine($"Заказ {id}: {status}, {total} руб.");',
    '}',
  ];
  const RUNS = [
    { msg: 'System.InvalidOperationException: Connection is not open', ok: [7],
      why: 'Строка 7: <code>CreateConnection()</code> создаёт соединение, но не открывает его. Ошибка появляется в строке 12, когда команда пытается выполниться по закрытому соединению. Исправление: <code>await dataSource.OpenConnectionAsync()</code>. Неверный порт в первом запуске не проявился, потому что программа ещё ни разу не обращалась к сети.' },
    { msg: 'Npgsql.NpgsqlException: Failed to connect to 127.0.0.1:5432', ok: [3, 4],
      why: 'Строка 4: порт 5432 вместо 5433. После исправления строки 7 программа впервые подключается к серверу и не находит его на порту 5432. Кода SQLSTATE нет: до PostgreSQL программа не дошла.' },
    { msg: 'Npgsql.PostgresException: 42601: syntax error at or near "order"', ok: [9, 10],
      why: 'Строка 10: таблица называется <code>orders</code>. Слово <code>order</code> — ключевое слово SQL, поэтому сервер сообщает о синтаксической ошибке. Код начинается с 42 — ошибка в тексте запроса.' },
    { msg: "System.InvalidCastException: Reading as 'System.Int32' is not supported for fields having DataTypeName 'text'", ok: [17],
      why: 'Строка 17: столбец <code>status</code> имеет тип <code>text</code>, его читают через <code>string status = reader.GetString(1)</code>. Ошибка возникает на первой же строке результата.' },
  ];
  const lines3 = renderCode($('#t3code'), CODE3);
  lines3.forEach(l => l.classList.add('is-pick'));
  const t3 = st.t3 || (st.t3 = { map: {} });
  let sel = 0;
  const drawT3 = () => {
    $('#t3runs').innerHTML = RUNS.map((r, i) => {
      const line = t3.map[i];
      const cls = t3.done ? (r.ok.includes(line) ? 'good' : 'bad') : (i === sel ? 'is-on' : '');
      return `<div class="runitem ${cls}" data-i="${i}"><b>Запуск ${i + 1}</b><code>${esc(r.msg)}</code><span class="pick">${line ? 'строка ' + line : 'строка не выбрана'}</span></div>`;
    }).join('');
    lines3.forEach((l, j) => {
      const n = j + 1;
      l.classList.remove('is-mark', 'is-good', 'is-bad', 'is-on');
      $$('.tag', l).forEach(t => t.remove());
      const who = Object.keys(t3.map).filter(k => t3.map[k] === n).map(Number);
      if (who.length) {
        if (t3.done) l.classList.add(who.every(k => RUNS[k].ok.includes(n)) ? 'is-good' : 'is-bad');
        else l.classList.add('is-mark');
        l.insertAdjacentHTML('beforeend', who.map(k => `<span class="tag">запуск ${k + 1}</span>`).join(''));
      }
      if (t3.done) RUNS.forEach(r => { if (r.ok[r.ok.length - 1] === n && !who.length) l.classList.add('is-good'); });
    });
  };
  $('#t3runs').addEventListener('click', e => { const it = e.target.closest('.runitem'); if (!it || t3.done) return; sel = Number(it.dataset.i); drawT3(); });
  $('#t3code').addEventListener('click', e => {
    const l = e.target.closest('.ln'); if (!l || t3.done) return;
    const n = lines3.indexOf(l) + 1;
    if (!CODE3[n - 1].trim() || CODE3[n - 1].trim() === '{' || CODE3[n - 1].trim() === '}') return;
    t3.map[sel] = n; save();
    const next = RUNS.findIndex((_, i) => !t3.map[i]);
    if (next >= 0) sel = next;
    drawT3();
  });
  const fbT3 = () => `<h4>Разбор</h4><ul>${RUNS.map((r, i) => `<li>${r.ok.includes(t3.map[i]) ? '<span class="ok-t">✓</span>' : '<span class="bad-t">✕</span>'} Запуск ${i + 1}. ${r.why}</li>`).join('')}</ul><p>Программа останавливается на первой ошибке, которую встречает при выполнении, поэтому сообщения появляются в порядке выполнения строк. Строка 7 выполняется до первого обращения к сети, и её ошибка появилась раньше ошибки в порте.</p>`;
  const checkT3 = () => {
    if (RUNS.some((_, i) => !t3.map[i])) return warn(3, 'Выберите строку для каждого запуска');
    const right = RUNS.filter((r, i) => r.ok.includes(t3.map[i])).length;
    finish(3, right === 4 ? 3 : right === 3 ? 2 : right === 2 ? 1 : 0, fbT3());
    drawT3();
  };

  /* ---------- задание 4 ---------- */
  const NEW = { 3: ['Мария Козлова', 3290], 5: ['Дмитрий Орлов', 5280], 7: ['Игорь Волков', 2490], 10: ['Елена Новикова', 1190] };
  const t4 = st.t4 || (st.t4 = { sql: '', out: '' });
  const sqlBox = $('#t4sql'), outBox = $('#t4out');
  sqlBox.value = t4.sql; outBox.value = t4.out;
  sqlBox.addEventListener('input', () => { if (t4.done) return; t4.sql = sqlBox.value; save(); });
  outBox.addEventListener('input', () => { if (t4.done) return; t4.out = outBox.value; save(); });
  const num = s => Number(s.replace(/\s/g, '').replace(',', '.'));
  const analyse = () => {
    const rows = [];
    t4.out.split(/\r?\n/).forEach(line => {
      const m = line.match(/Заказ\s+(\d+)\s*:\s*([^,]+?)\s*,\s*([\d\s.,]+?)\s*руб/i);
      if (m) rows.push({ id: Number(m[1]), name: m[2].trim(), sum: num(m[3]) });
    });
    const cnt = t4.out.match(/Новых заказов\s*:\s*(\d+)/i);
    const ids = rows.map(r => r.id);
    const missing = Object.keys(NEW).map(Number).filter(id => !ids.includes(id));
    const extra = ids.filter(id => !NEW[id]);
    const wrongName = rows.filter(r => NEW[r.id] && r.name !== NEW[r.id][0]);
    const wrongSum = rows.filter(r => NEW[r.id] && r.sum !== NEW[r.id][1]);
    return { rows, cnt: cnt ? Number(cnt[1]) : null, missing, extra, wrongName, wrongSum };
  };
  const fbT4 = (a, s1, s2) => {
    const li = [];
    if (s1 === 2) li.push('<span class="ok-t">✓</span> В выводе четыре новых заказа — 3, 5, 7 и 10, с именами клиентов и суммами.');
    else {
      if (!a.rows.length) li.push('<span class="bad-t">✕</span> В выводе нет строк вида <code>Заказ 3: Мария Козлова, 3290,00 руб.</code>');
      if (a.missing.length && a.rows.length) li.push(`<span class="bad-t">✕</span> Не хватает заказов: ${a.missing.join(', ')}. Новых заказов в базе четыре: 3, 5, 7 и 10.`);
      if (a.extra.length) li.push(`<span class="bad-t">✕</span> Лишние заказы: ${a.extra.join(', ')}. В запросе нужно условие <code>WHERE o.status = 'new'</code>.`);
      if (a.wrongName.length) li.push(`<span class="bad-t">✕</span> Вместо имени клиента напечатано <code>${esc(a.wrongName[0].name)}</code>. Имя берётся из <code>c.full_name</code> после <code>JOIN customers c ON c.id = o.customer_id</code>.`);
      if (a.wrongSum.length) li.push('<span class="bad-t">✕</span> Суммы не совпадают с таблицей <code>orders</code>: третьим столбцом должен идти <code>o.total</code>.');
    }
    li.push(s2 ? '<span class="ok-t">✓</span> Итоговая строка <code>Новых заказов: 4</code> есть.'
      : a.cnt === null ? '<span class="bad-t">✕</span> Нет строки <code>Новых заказов: N</code> после цикла.' : `<span class="bad-t">✕</span> В итоговой строке ${a.cnt}, новых заказов четыре.`);
    if (!/new/i.test(t4.sql) || !/join/i.test(t4.sql)) li.push('В поле запроса нет условия на статус <code>new</code> или соединения таблиц. Вставьте в отчёт тот запрос, который выполняла программа.');
    return `<h4>Разбор</h4><ul>${li.map(x => `<li>${x}</li>`).join('')}</ul><p>Эталонный запрос:</p><pre class="code" style="padding:10px 14px">SELECT o.id, c.full_name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'new'
ORDER BY o.id</pre>`;
  };
  const checkT4 = () => {
    if (!t4.out.trim()) return warn(4, 'Вставьте вывод программы');
    if (!t4.sql.trim()) return warn(4, 'Вставьте текст запроса');
    const a = analyse();
    const exact = !a.missing.length && !a.extra.length && !a.wrongName.length && !a.wrongSum.length && a.rows.length === 4;
    const s1 = exact ? 2 : (a.rows.length && !a.wrongName.length && a.missing.length === 0) ? 1 : 0;
    const s2 = a.cnt === 4 ? 1 : 0;
    finish(4, s1 + s2, fbT4(a, s1, s2));
  };

  /* ---------- проверка и восстановление ---------- */
  const checks = { 1: checkT1, 2: checkT2, 3: checkT3, 4: checkT4 };
  $$('[data-check]').forEach(b => b.addEventListener('click', () => checks[b.dataset.check]()));
  drawT1(); drawT2(); drawT3();
  if (t1.done) showDone(1, fbT1());
  if (t2.done) showDone(2, fbT2());
  if (t3.done) showDone(3, fbT3());
  if (t4.done) { const a = analyse(); const s1 = st.t4.score - (a.cnt === 4 ? 1 : 0); showDone(4, fbT4(a, s1, a.cnt === 4 ? 1 : 0)); }

  /* ---------- рецензия ---------- */
  const NAMES = { 1: 'Порядок строк программы', 2: 'Строка подключения по docker-compose.yml', 3: 'Четыре запуска', 4: 'Новые заказы в стартовом проекте' };
  const nameIn = $('#rvName'), groupIn = $('#rvGroup');
  nameIn.value = st.name || ''; groupIn.value = st.group || '';
  nameIn.addEventListener('input', () => { st.name = nameIn.value; save(); });
  groupIn.addEventListener('input', () => { st.group = groupIn.value; save(); });
  const total = () => [1, 2, 3, 4].reduce((s, n) => s + ((st['t' + n] && st['t' + n].done) ? st['t' + n].score : 0), 0);
  function renderReview() {
    $('#rvTable').innerHTML = '<tr><th>Задание</th><th>Баллы</th></tr>'
      + [1, 2, 3, 4].map(n => {
        const t = st['t' + n];
        return `<tr><td>${n}. ${NAMES[n]}</td><td>${t && t.done ? `${t.score} / ${MAX[n]}` : 'не проверено'}</td></tr>`;
      }).join('')
      + `<tr class="total"><td>Итого</td><td>${total()} / 10</td></tr>`;
  }
  renderReview();

  $('#rvDownload').addEventListener('click', () => {
    const name = (st.name || '').trim(), group = (st.group || '').trim();
    if (!name) { nameIn.focus(); nameIn.style.borderColor = 'var(--red)'; return; }
    const sc = n => (st['t' + n] && st['t' + n].done) ? `${st['t' + n].score} / ${MAX[n]}` : 'не проверено';
    const fence = (lang, text) => '```' + lang + '\n' + (text || '').replace(/\s+$/, '') + '\n```';
    const md = [
      '# Занятие 1 · Первый запрос к базе из C#',
      '',
      'МДК.01.11 Технология доступа к базам данных ADO.NET',
      '',
      '| | |', '|---|---|',
      `| Студент | ${name} |`, `| Группа | ${group || '—'} |`, `| Дата | ${new Date().toLocaleDateString('ru-RU')} |`,
      '',
      '## Баллы', '',
      '| Задание | Баллы |', '|---|---|',
      ...[1, 2, 3, 4].map(n => `| ${n}. ${NAMES[n]} | ${sc(n)} |`),
      `| **Итого** | **${total()} / 10** |`,
      '',
      '## Задание 1. Порядок строк', '',
      fence('csharp', (st.t1.order || []).map(i => T1[i]).join('\n')),
      '',
      '## Задание 2. Строка подключения', '',
      fence('text', inputs.map(i => `${i.dataset.k}=${(st.t2.vals[i.dataset.k] || '').trim()}`).join(';')),
      '',
      '## Задание 3. Четыре запуска', '',
      '| Запуск | Сообщение | Выбранная строка |', '|---|---|---|',
      ...RUNS.map((r, i) => `| ${i + 1} | \`${r.msg.replace(/\|/g, '\\|')}\` | ${st.t3.map[i] || '—'} |`),
      '',
      '## Задание 4. Новые заказы', '',
      'Запрос:', '', fence('sql', st.t4.sql),
      '', 'Вывод программы:', '', fence('text', st.t4.out),
      '',
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lesson01_${name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
