/* МДК.01.11 · занятие 1 · интерактивные схемы лекции.
   1. Подсветка C# в блоках кода.
   2. Переключатель провайдера.
   3. Карточки четырёх объектов и строки кода.
   4. Пошаговое выполнение программы.
   5. Строка подключения и docker-compose.yml, ошибки по этапам.
   6. Get-методы на первой строке результата.
   Все тексты ошибок и значения получены запуском на .NET 10.0.402 + Npgsql 10.0.3 + PostgreSQL 17. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 1. Подсветка C# ---------- */
const KW = new Set('using await var const new while if else return int string decimal bool for foreach true false null'.split(' '));
const TYPES = /^(Npgsql\w*|Console|DateTime)$/;
function hl(line) {
  const re = /(\/\/.*$)|(\$?"(?:[^"\\]|\\.)*")|("{3})|([A-Za-z_]\w*)|(\d+)|(\s+)|(.)/g;
  let out = '', m;
  while ((m = re.exec(line))) {
    const [t, com, str, tri, word, num] = m;
    if (com) out += `<span class="c">${esc(com)}</span>`;
    else if (str || tri) out += `<span class="s">${esc(t)}</span>`;
    else if (word) {
      if (KW.has(word)) out += `<span class="k">${word}</span>`;
      else if (TYPES.test(word)) out += `<span class="t">${word}</span>`;
      else if (/^[A-Z]/.test(word) && line[re.lastIndex] === '(') out += `<span class="m">${word}</span>`;
      else out += word;
    } else if (num) out += `<span class="m">${num}</span>`;
    else out += esc(t);
  }
  return out;
}
function renderCode(pre, lines) {
  pre.innerHTML = lines.map(l => `<span class="ln">${hl(l) || ' '}</span>`).join('');
  return $$('.ln', pre);
}
window.ado = { $, $$, esc, hl, renderCode };

/* ---------- навигация: подсветка текущей части ---------- */
(() => {
  const links = $$('.topbar nav a');
  const parts = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  const onScroll = () => {
    let cur = 0;
    parts.forEach((p, i) => { if (p && p.getBoundingClientRect().top < 120) cur = i; });
    links.forEach((a, i) => a.classList.toggle('is-on', i === cur));
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- 2. Провайдер ---------- */
(() => {
  const P = {
    pg:   { pkg: 'Npgsql', pkgnote: 'реализует классы ADO.NET для PostgreSQL', db: 'PostgreSQL', addr: 'сервер, localhost:5432', c1: 'NpgsqlConnection', c2: 'NpgsqlCommand', c3: 'NpgsqlDataReader', add: 'dotnet add package Npgsql' },
    ms:   { pkg: 'Microsoft.Data.SqlClient', pkgnote: 'реализует классы ADO.NET для SQL Server', db: 'SQL Server', addr: 'сервер, localhost:1433', c1: 'SqlConnection', c2: 'SqlCommand', c3: 'SqlDataReader', add: 'dotnet add package Microsoft.Data.SqlClient' },
    lite: { pkg: 'Microsoft.Data.Sqlite', pkgnote: 'реализует классы ADO.NET для SQLite', db: 'SQLite', addr: 'без сервера: файл orders.db рядом с программой', c1: 'SqliteConnection', c2: 'SqliteCommand', c3: 'SqliteDataReader', add: 'dotnet add package Microsoft.Data.Sqlite' },
  };
  const root = $('#prov');
  if (!root) return;
  const btns = $$('[data-p]', root);
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const d = P[b.dataset.p];
    $$('[data-f]', root).forEach(el => {
      el.textContent = d[el.dataset.f];
      el.classList.remove('swap-in'); void el.offsetWidth; el.classList.add('swap-in');
    });
  }));
})();

/* ---------- 3. Четыре объекта ---------- */
(() => {
  const pre = $('#objcode');
  if (!pre) return;
  const lines = renderCode(pre, [
    'const string connectionString = "Host=localhost;Port=5433;Database=orders;Username=student;Password=student";',
    'await using var dataSource = NpgsqlDataSource.Create(connectionString);',
    'await using var connection = await dataSource.OpenConnectionAsync();',
    'await using var command = new NpgsqlCommand(',
    '    "SELECT id, status, total FROM orders ORDER BY id", connection);',
    'await using var reader = await command.ExecuteReaderAsync();',
    'while (await reader.ReadAsync())',
    '    Console.WriteLine(reader.GetString(1));',
  ]);
  const cards = $$('#objs .obj');
  const pick = card => {
    cards.forEach(c => c.classList.toggle('is-on', c === card));
    const on = card.dataset.l.split(',').map(Number);
    lines.forEach((l, i) => l.classList.toggle('is-on', on.includes(i + 1)));
  };
  cards.forEach(c => {
    c.addEventListener('click', () => pick(c));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(c); } });
  });
})();

/* ---------- 4. Пошаговое выполнение ---------- */
(() => {
  const root = $('#run');
  if (!root) return;
  const CODE = [
    'using Npgsql;',
    '',
    'const string connectionString =',
    '    "Host=localhost;Port=5433;Database=orders;Username=student;Password=student";',
    '',
    'await using var dataSource = NpgsqlDataSource.Create(connectionString);',
    'await using var connection = await dataSource.OpenConnectionAsync();',
    '',
    'await using var command = new NpgsqlCommand(',
    '    "SELECT id, status, total FROM orders ORDER BY id", connection);',
    '',
    'await using var reader = await command.ExecuteReaderAsync();',
    '',
    'while (await reader.ReadAsync())',
    '{',
    '    int id = reader.GetInt32(0);',
    '    string status = reader.GetString(1);',
    '    decimal total = reader.GetDecimal(2);',
    '',
    '    Console.WriteLine($"Заказ {id}: {status}, {total} руб.");',
    '}',
  ];
  const lines = renderCode($('#runcode'), CODE);

  /* строки таблицы orders из db/init.sql */
  const ORDERS = [
    [1, 1, 'shipped', '2026-09-01', '3380.00'], [2, 2, 'paid', '2026-09-03', '13990.00'],
    [3, 3, 'new', '2026-09-04', '3290.00'], [4, 1, 'cancelled', '2026-09-05', '890.00'],
    [5, 4, 'new', '2026-09-07', '5280.00'], [6, 5, 'shipped', '2026-09-08', '1670.00'],
    [7, 2, 'new', '2026-09-10', '2490.00'], [8, 6, 'paid', '2026-09-11', '5360.00'],
    [9, 3, 'shipped', '2026-09-12', '16780.00'], [10, 5, 'new', '2026-09-14', '1190.00'],
    [11, 4, 'paid', '2026-09-15', '2790.00'], [12, 6, 'cancelled', '2026-09-16', '3290.00'],
  ];
  const ru = v => v.replace('.', ',');
  const outLine = r => `Заказ ${r[0]}: ${r[2]}, ${ru(r[4])} руб.`;

  /* мини-таблица в блоке PostgreSQL: первые 6 строк */
  const COLS = ['id', 'customer_id', 'status', 'total'];
  const SRC = [0, 1, 2, 4];
  const PICK = [0, 2, 3];
  const mini = $('#dbmini');
  mini.innerHTML = '<tr>' + COLS.map((c, i) => `<th data-c="${i}">${c}</th>`).join('') + '</tr>'
    + ORDERS.slice(0, 6).map(r => '<tr>' + SRC.map((k, i) => `<td data-c="${i}">${r[k]}</td>`).join('') + '</tr>').join('')
    + '<tr><td colspan="4">… ещё 6 строк · столбец created_at не показан</td></tr>';

  /* ---- сценарий: массив снимков состояния ---- */
  const S = [];
  const base = { lines: [], cs: 0, ds: 0, conn: '', cmd: 0, rd: 0, rows: 0, cur: -1, hot: -1, vars: {}, cons: [], db: 0, pk: [], label: 'не запущена', cap: '' };
  const add = patch => { const prev = S.length ? S[S.length - 1] : base; S.push({ ...prev, pk: [], hot: -1, ...patch, vars: { ...(patch.vars || (patch.keepVars === false ? {} : prev.vars)) } }); };

  add({ cap: 'Программа ещё не запущена. Кнопка «Шаг» выполнит первую строку.' });
  add({ lines: [3, 4], cs: 1, label: 'строки 3–4 · строка подключения',
    cap: 'В памяти появляется строка подключения. Это обычный текст с адресом сервера, портом, именем базы, пользователем и паролем. К базе программа ещё не обращалась.' });
  add({ lines: [6], ds: 1, label: 'строка 6 · NpgsqlDataSource.Create',
    cap: '<code>NpgsqlDataSource.Create</code> разбирает строку подключения и создаёт источник данных с пустым пулом соединений. По сети ничего не отправляется: даже если сервер выключен, эта строка выполнится без ошибки.' });
  add({ lines: [7], conn: 'open', pk: [['go', 'вход: student → orders'], ['back', 'вход выполнен']], label: 'строка 7 · OpenConnectionAsync',
    cap: '<code>OpenConnectionAsync</code> — первое обращение к серверу. Npgsql открывает сетевое соединение с портом 5433 и передаёт имя пользователя, пароль и имя базы. Сервер проверяет их и отвечает. Слово <code>await</code> означает, что программа ждёт завершения этой сетевой операции. Соединение открыто.' });
  add({ lines: [9, 10], cmd: 1, label: 'строки 9–10 · new NpgsqlCommand',
    cap: 'Создаётся команда: текст запроса и соединение, по которому его отправить. Запрос пока лежит в памяти программы, на сервер он не отправлен.' });
  add({ lines: [12], rd: 1, rows: 12, db: 1, pk: [['go', 'SELECT id, status, total …'], ['back', '12 строк']], label: 'строка 12 · ExecuteReaderAsync',
    cap: '<code>ExecuteReaderAsync</code> отправляет текст запроса на сервер — второе обращение по сети. PostgreSQL берёт из таблицы <code>orders</code> три столбца, сортирует строки по <code>id</code> и передаёт результат. Читатель создан и стоит перед первой строкой: значения ещё не прочитаны.' });

  const rowSteps = (i, full) => {
    const r = ORDERS[i];
    if (full) {
      add({ lines: [14], cur: i, vars: {}, keepVars: false, label: `строка 14 · ReadAsync → true`,
        cap: i === 0
          ? '<code>ReadAsync</code> переводит читатель на первую строку и возвращает <code>true</code>, поэтому выполняется тело цикла.'
          : 'Второй вызов <code>ReadAsync</code> переводит читатель на вторую строку. Значения первой строки больше недоступны: читатель двигается только вперёд.' });
      add({ lines: [16], hot: 0, vars: { id: r[0] }, label: 'строка 16 · GetInt32(0)',
        cap: i === 0 ? '<code>GetInt32(0)</code> читает столбец номер 0 текущей строки — <code>id</code>. В PostgreSQL у него тип <code>integer</code>, в C# значение становится <code>int</code>.' : `<code>GetInt32(0)</code>: id = ${r[0]}.` });
      add({ lines: [17], hot: 1, vars: { id: r[0], status: r[2] }, label: 'строка 17 · GetString(1)',
        cap: i === 0 ? '<code>GetString(1)</code> читает столбец номер 1 — <code>status</code>. Тип <code>text</code> становится <code>string</code>.' : `<code>GetString(1)</code>: status = "${r[2]}".` });
      add({ lines: [18], hot: 2, vars: { id: r[0], status: r[2], total: r[4] }, label: 'строка 18 · GetDecimal(2)',
        cap: i === 0 ? '<code>GetDecimal(2)</code> читает столбец номер 2 — <code>total</code>. Тип <code>numeric</code> становится <code>decimal</code>: этот тип хранит копейки без потерь.' : `<code>GetDecimal(2)</code>: total = ${r[4]}.` });
      add({ lines: [20], cons: [...S[S.length - 1].cons, outLine(r)], label: 'строка 20 · Console.WriteLine',
        cap: i === 0 ? '<code>Console.WriteLine</code> печатает строку с тремя значениями. Это первая из двенадцати строк вывода. Дальше выполнение возвращается к условию цикла.' : 'Вторая строка вывода. Остальные десять строк обрабатываются так же.' });
    } else {
      add({ lines: [14, 16, 17, 18, 20], cur: i, vars: { id: r[0], status: r[2], total: r[4] }, cons: [...S[S.length - 1].cons, outLine(r)], label: `строки 14–20 · строка результата ${i + 1}`,
        cap: `Строка ${i + 1}: <code>ReadAsync</code> возвращает <code>true</code>, три Get-метода читают значения, <code>Console.WriteLine</code> печатает строку.` });
    }
  };
  ORDERS.forEach((_, i) => rowSteps(i, i < 2));
  const loopEnd = S.length;
  add({ lines: [14], cur: 12, vars: {}, keepVars: false, label: 'строка 14 · ReadAsync → false',
    cap: 'Строк больше нет: <code>ReadAsync</code> возвращает <code>false</code>, и цикл заканчивается.' });
  add({ lines: [12, 9, 7], rd: 2, cmd: 2, conn: 'pool', label: 'конец программы · await using',
    cap: 'Программа дошла до конца. Объекты, объявленные с <code>await using</code>, закрываются в обратном порядке: читатель (строка 12), команда (строка 9), соединение (строка 7). Закрытое соединение возвращается в пул источника данных открытым: следующий запрос получил бы его без повторного входа.' });
  add({ lines: [6], ds: 2, conn: 'off', pk: [['go', 'завершение сеанса']], label: 'конец программы · dataSource',
    cap: 'Последним закрывается источник данных (строка 6). Он закрывает соединения из пула, и сервер получает сообщение о завершении сеанса. Программа завершилась.' });

  /* ---- отрисовка ---- */
  let at = 0, timer = null;
  const chip = o => $(`.chip[data-o="${o}"]`, root);
  const setChip = (o, v, prevV) => {
    const c = chip(o);
    c.classList.toggle('is-live', v === 1 || v === 'live');
    c.classList.toggle('is-gone', v === 2);
    if (v === 1 && prevV !== 1) { c.classList.remove('is-new'); void c.offsetWidth; c.classList.add('is-new'); }
    const lamp = $('.lamp', c);
    if (o !== 'conn') lamp.className = 'lamp' + (v === 1 ? ' open' : '');
  };
  const pk1 = $('#pk1'), pk2 = $('#pk2');
  let pkTimers = [];
  const playPackets = list => {
    pkTimers.forEach(clearTimeout); pkTimers = [];
    [pk1, pk2].forEach(p => p.classList.remove('go'));
    list.forEach(([dir, label], k) => {
      pkTimers.push(setTimeout(() => {
        const p = dir === 'go' ? pk1 : pk2;
        p.textContent = label;
        p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
      }, k * 1150));
    });
  };

  function render(forward) {
    const s = S[at], prev = S[at - 1] || base;
    lines.forEach((l, i) => {
      l.classList.toggle('is-on', s.lines.includes(i + 1));
    });
    const first = lines[(s.lines[0] || 1) - 1];
    const box = $('#runcode');
    if (first && (first.offsetTop < box.scrollTop || first.offsetTop > box.scrollTop + box.clientHeight - 30)) box.scrollTop = first.offsetTop - 40;

    setChip('cs', s.cs, prev.cs);
    setChip('ds', s.ds, prev.ds);
    setChip('cmd', s.cmd, prev.cmd);
    setChip('rd', s.rd, prev.rd);
    const c = chip('conn');
    c.classList.toggle('is-live', s.conn === 'open' || s.conn === 'pool');
    c.classList.toggle('is-gone', s.conn === 'off');
    if (s.conn === 'open' && prev.conn !== 'open') { c.classList.remove('is-new'); void c.offsetWidth; c.classList.add('is-new'); }
    const lamp = $('[data-f="lamp"]', root);
    lamp.className = 'lamp' + (s.conn === 'open' ? (forward && prev.conn !== 'open' ? ' wait' : ' open') : s.conn === 'pool' ? ' pool' : '');
    const connst = $('[data-f="connst"]', root);
    connst.textContent = { open: 'открыто', pool: 'в пуле', off: 'закрыто', '': '' }[s.conn];
    if (forward && s.conn === 'open' && prev.conn !== 'open') {
      connst.textContent = 'подключение…';
      setTimeout(() => { if (S[at].conn === 'open') { lamp.className = 'lamp open'; connst.textContent = 'открыто'; } }, 1500);
    }
    $('[data-f="pool"]', root).textContent = s.ds === 1 ? (s.conn === 'open' ? 'пул: 1 занято' : s.conn === 'pool' ? 'пул: 1 свободно' : 'пул: пусто') : '';
    $$('.vars span', root).forEach(v => {
      const k = v.dataset.v, val = s.vars[k];
      v.classList.toggle('is-set', val !== undefined);
      v.textContent = val === undefined ? k : `${k} = ${k === 'status' ? '"' + val + '"' : val}`;
    });

    $$('th, td', mini).forEach(td => {
      const ci = Number(td.dataset.c);
      td.classList.toggle('col-on', s.db === 1 && PICK.includes(ci));
      td.classList.toggle('dim', s.db === 1 && !PICK.includes(ci) && td.dataset.c !== undefined);
    });

    const rr = $('#resrows');
    if (!s.rows) rr.innerHTML = '<div class="before">результата пока нет</div>';
    else {
      rr.innerHTML = (s.cur === -1 ? '<div class="before">▶ перед первой строкой</div>' : '')
        + '<table><tr><th>0 · id</th><th>1 · status</th><th>2 · total</th></tr>'
        + ORDERS.map((r, i) => `<tr class="${i === s.cur ? 'cur' : i < s.cur ? 'got' : ''}"><td class="${i === s.cur && s.hot === 0 ? 'hot' : ''}">${r[0]}</td><td class="${i === s.cur && s.hot === 1 ? 'hot' : ''}">${r[2]}</td><td class="${i === s.cur && s.hot === 2 ? 'hot' : ''}">${r[4]}</td></tr>`).join('')
        + '</table>' + (s.cur === 12 ? '<div class="before">▶ после последней строки</div>' : '');
    }
    $('#cons').innerHTML = s.cons.map(l => `<div>${esc(l)}</div>`).join('');

    const cap = $('#runcap');
    cap.innerHTML = `<b class="lbl">${s.label}</b>${s.cap}`;
    cap.classList.remove('flash'); void cap.offsetWidth; cap.classList.add('flash');
    $('#runLabel').textContent = s.label;
    $('#runCount').textContent = `шаг ${at} из ${S.length - 1}`;
    $('#bBack').disabled = at === 0;
    $('#bStep').disabled = at === S.length - 1;
    $('#bLoop').disabled = at >= loopEnd;
    if (forward && s.pk.length) playPackets(s.pk); else if (!forward) playPackets([]);
  }
  const go = (n, forward) => { at = Math.max(0, Math.min(S.length - 1, n)); render(forward); };
  const stopAuto = () => { clearInterval(timer); timer = null; $('#bAuto').textContent = '▶ Авто'; };
  $('#bStep').addEventListener('click', () => { stopAuto(); go(at + 1, true); });
  $('#bBack').addEventListener('click', () => { stopAuto(); go(at - 1, false); });
  $('#bReset').addEventListener('click', () => { stopAuto(); go(0, false); });
  $('#bLoop').addEventListener('click', () => { stopAuto(); go(loopEnd, true); });
  $('#bAuto').addEventListener('click', () => {
    if (timer) return stopAuto();
    if (at === S.length - 1) go(0, false);
    $('#bAuto').textContent = '❚❚ Пауза';
    timer = setInterval(() => {
      if (at >= S.length - 1) return stopAuto();
      go(at + 1, true);
    }, 2600);
  });
  root.addEventListener('keydown', e => {
    if (e.target.closest('button')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); go(at + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); go(at - 1, false); }
  });
  render(false);
})();

/* ---------- 5. Строка подключения ---------- */
(() => {
  const partsBox = $('#csParts');
  if (!partsBox) return;
  const YML = [
    'services:',
    '  db:',
    '    image: postgres:17',
    '    container_name: orders-db',
    '    environment:',
    '      POSTGRES_DB: orders',
    '      POSTGRES_USER: student',
    '      POSTGRES_PASSWORD: student',
    '    ports:',
    '      - "5433:5432"',
  ];
  const yml = $('#yml');
  yml.innerHTML = YML.map(l => `<span>${esc(l)}</span>`).join('');
  const ylines = $$('span', yml);
  const PARTS = [
    { k: 'Host', v: 'localhost', y: [9], t: '<b>Host</b> — адрес компьютера, на котором работает сервер. <code>localhost</code> означает «этот же компьютер». Docker открывает порт контейнера на вашем компьютере, поэтому программа обращается к localhost. В файле адреса нет: его задаёт запись <code>ports</code>.' },
    { k: 'Port', v: '5433', y: [8, 9], t: '<b>Port</b> — номер порта, на котором сервер принимает подключения. Это левое число в записи <code>"5433:5432"</code>: порт на вашем компьютере. Если ключ не указан, Npgsql подставляет стандартный порт PostgreSQL 5432.' },
    { k: 'Database', v: 'orders', y: [5], t: '<b>Database</b> — имя базы на сервере. На одном сервере PostgreSQL может быть несколько баз. База <code>orders</code> создаётся при первом запуске контейнера по значению <code>POSTGRES_DB</code>.' },
    { k: 'Username', v: 'student', y: [6], t: '<b>Username</b> — пользователь PostgreSQL, от имени которого программа выполняет запросы. Совпадает с <code>POSTGRES_USER</code>.' },
    { k: 'Password', v: 'student', y: [7], t: '<b>Password</b> — пароль этого пользователя, совпадает с <code>POSTGRES_PASSWORD</code>. В рабочих проектах пароль не записывают в код: его передают через переменные окружения или хранилище секретов.' },
  ];
  partsBox.innerHTML = PARTS.map((p, i) => `<span class="cs__part" tabindex="0" data-i="${i}"><b>${p.k}</b>=${p.v}${i < PARTS.length - 1 ? ';' : ''}</span>`).join('');
  const chips = $$('.cs__part', partsBox);
  const pick = i => {
    chips.forEach((c, j) => c.classList.toggle('is-on', i === j));
    ylines.forEach((l, j) => l.classList.toggle('is-on', PARTS[i].y.includes(j)));
    $('#csExplain').innerHTML = PARTS[i].t;
  };
  chips.forEach((c, i) => {
    c.addEventListener('click', () => pick(i));
    c.addEventListener('mouseenter', () => pick(i));
    c.addEventListener('focus', () => pick(i));
  });

  /* ошибки по этапам */
  const BR = [
    { t: 'всё верно', stop: 4, out: '<span class="okk">Заказ 1: shipped, 3380,00 руб.\nЗаказ 2: paid, 13990,00 руб.\n…</span>',
      note: 'Все четыре этапа пройдены, программа печатает 12 строк.' },
    { t: 'контейнер остановлен', stop: 0, out: '<span class="err">Unhandled exception. Npgsql.NpgsqlException (0x80004005): Failed to connect to 127.0.0.1:5433\n ---> System.Net.Sockets.SocketException: Connection refused</span>',
      note: 'По адресу и порту никто не принимает подключения. Код SQLSTATE в сообщении отсутствует: ответ пришёл от операционной системы, до PostgreSQL программа не дошла. На Windows вторая строка звучит так: <code>No connection could be made because the target machine actively refused it</code>. Исправление: <code>docker compose up -d</code>.' },
    { t: 'Port=5432, есть свой PostgreSQL', stop: 1, out: '<span class="err">Unhandled exception. Npgsql.PostgresException (0x80004005): 28000: role "student" does not exist</span>',
      note: 'Сеть пройдена, но программа подключилась к другому серверу — PostgreSQL, установленному на компьютере. В нём нет пользователя <code>student</code>. Если своего PostgreSQL нет, сообщение будет как при остановленном контейнере: <code>Failed to connect to 127.0.0.1:5432</code>.' },
    { t: 'Password=123', stop: 1, out: '<span class="err">Unhandled exception. Npgsql.PostgresException (0x80004005): 28P01: password authentication failed for user "student"</span>',
      note: 'Сервер найден, но вход не выполнен. Код <code>28P01</code> — ошибка проверки пароля: пароль не подошёл к пользователю.' },
    { t: 'Database=order', stop: 2, out: '<span class="err">Unhandled exception. Npgsql.PostgresException (0x80004005): 3D000: database "order" does not exist</span>',
      note: 'Вход выполнен, но базы с таким именем на сервере нет. В сообщении PostgreSQL повторяет имя из строки подключения, по нему находят опечатку.' },
    { t: 'FROM order в запросе', stop: 3, out: '<span class="err">Unhandled exception. Npgsql.PostgresException (0x80004005): 42601: syntax error at or near "order"\n\nPOSITION: 31</span>',
      note: 'Подключение прошло, ошибка в тексте запроса. <code>ORDER</code> — ключевое слово SQL, поэтому сервер сообщает о синтаксической ошибке. <code>POSITION: 31</code> — номер символа в тексте запроса, где сервер её обнаружил.' },
    { t: 'столбец state', stop: 3, out: '<span class="err">Unhandled exception. Npgsql.PostgresException (0x80004005): 42703: column "state" does not exist\n\nPOSITION: 12</span>',
      note: 'Таблица найдена, но столбца с таким именем в ней нет. Столбец называется <code>status</code>.' },
  ];
  const tabs = $('#brTabs');
  tabs.innerHTML = BR.map((b, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${b.t}</button>`).join('');
  const stages = $$('#brStages .stage');
  const show = i => {
    $$('button', tabs).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    const b = BR[i];
    stages.forEach((st, j) => {
      st.classList.remove('ok', 'fail', 'skip');
      void st.offsetWidth;
      st.classList.add(j < b.stop ? 'ok' : j === b.stop ? 'fail' : 'skip');
    });
    $('#brOut').innerHTML = b.out;
    $('#brNote').innerHTML = b.note;
  };
  $$('button', tabs).forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();

/* ---------- 6. Get-методы ---------- */
(() => {
  const out = $('#gmOut');
  if (!out) return;
  const R = {
    'GetInt32|0': ['ok', 'Возвращает <code>1</code> типа <code>int</code>. Тип столбца <code>integer</code> подходит к методу.'],
    'GetInt32|1': ['bad', '<code>InvalidCastException: Reading as \'System.Int32\' is not supported for fields having DataTypeName \'text\'</code><br>Текст нельзя прочитать как число, даже если в столбце записаны цифры.'],
    'GetInt32|2': ['warn', 'Возвращает <code>3380</code> без ошибки. Дробная часть отбрасывается: значение <code>12.75</code> прочиталось бы как <code>12</code>. Для денег такой вызов даёт неверные суммы.'],
    'GetString|0': ['bad', '<code>InvalidCastException: Reading as \'System.String\' is not supported for fields having DataTypeName \'integer\'</code><br>Число не превращается в строку автоматически. Строку из числа получают в C#: <code>reader.GetInt32(0).ToString()</code>.'],
    'GetString|1': ['ok', 'Возвращает <code>"shipped"</code> типа <code>string</code>.'],
    'GetString|2': ['bad', '<code>InvalidCastException: Reading as \'System.String\' is not supported for fields having DataTypeName \'numeric\'</code>'],
    'GetDecimal|0': ['ok', 'Возвращает <code>1</code> типа <code>decimal</code>. Целое число помещается в <code>decimal</code> без потерь, поэтому вызов работает, но для <code>id</code> принят <code>GetInt32</code>.'],
    'GetDecimal|1': ['bad', '<code>InvalidCastException: Reading as \'System.Decimal\' is not supported for fields having DataTypeName \'text\'</code>'],
    'GetDecimal|2': ['ok', 'Возвращает <code>3380,00</code> типа <code>decimal</code>, копейки сохраняются. Разделитель при печати зависит от языка системы.'],
  };
  let m = 'GetInt32', c = 0;
  const draw = () => {
    $('#gmCall').innerHTML = `reader.<b>${m}</b>(${c})`;
    $$('#gmRow td[data-c]').forEach(td => td.classList.toggle('is-on', Number(td.dataset.c) === c));
    const r = c === 3
      ? ['bad', '<code>IndexOutOfRangeException: Ordinal must be between 0 and 2</code><br>В результате три столбца с номерами 0, 1 и 2. Столбца номер 3 нет: номера считаются с нуля.']
      : R[`${m}|${c}`];
    out.className = 'out ' + r[0];
    out.innerHTML = r[1];
  };
  $$('#gmMethods button').forEach(b => b.addEventListener('click', () => {
    m = b.dataset.m; $$('#gmMethods button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw();
  }));
  const colBtns = $$('#gmCols button');
  const setCol = n => { c = n; colBtns.forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.c) === n))); draw(); };
  colBtns.forEach(b => b.addEventListener('click', () => setCol(Number(b.dataset.c))));
  $$('#gmRow td[data-c]').forEach(td => td.addEventListener('click', () => setCol(Number(td.dataset.c))));
  draw();
})();
