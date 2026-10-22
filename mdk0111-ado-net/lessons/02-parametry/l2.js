/* МДК.01.11 · занятие 2 · схемы лекции.
   1. Код разделов.
   2. Сборка запроса из ввода: разбор на токены, ввод внутри строки и ввод-код.
   3. Склейка и параметр: что уходит на сервер, журнал PostgreSQL.
   4. Ошибки с параметрами.
   5. Белый список для сортировки.
   Результаты, сообщения и строки журнала получены на .NET 10.0.402 + Npgsql 10.0.3 + PostgreSQL 17. */

const PRODUCTS = [
  [1, 'Клавиатура', '2490.00'], [2, 'Мышь', '890.00'], [3, 'Монитор 24"', '13990.00'], [4, 'Наушники', '3290.00'],
  [5, 'Веб-камера', '2790.00'], [6, 'Коврик для мыши', '390.00'], [7, 'USB-хаб', '1190.00'], [8, 'Подставка для ноутбука', '1890.00'],
];
const ru = v => v.replace('.', ',');
const rowsHtml = (ids, cls = '') => '<ul class="rows">' + PRODUCTS.filter(p => ids.includes(p[0]))
  .map(p => `<li class="${cls}">${p[0]}: ${esc(p[1])}, ${cls ? '1,00' : ru(p[2])} руб.</li>`).join('') + '</ul>';

/* ---------- 1. Код разделов ---------- */
renderCode($('#code1'), [
  'Console.Write("Поиск товара: ");',
  'string text = Console.ReadLine() ?? "";',
  '',
  'string sql = $"SELECT id, name, price FROM products WHERE name ILIKE \'%{text}%\' ORDER BY id";',
  'await using var command = new NpgsqlCommand(sql, connection);',
]);
renderCode($('#code3'), [
  'string sql = "SELECT id, name, price FROM products WHERE name ILIKE @pattern ORDER BY id";',
  'await using var command = new NpgsqlCommand(sql, connection);',
  'command.Parameters.AddWithValue("pattern", "%" + text + "%");',
]);
renderCode($('#code5'), [
  'var sorts = new Dictionary<string, string>',
  '{',
  '    ["1"] = "id",',
  '    ["2"] = "price",',
  '    ["3"] = "price DESC",',
  '};',
  '',
  'if (!sorts.TryGetValue(choice, out string? orderBy))',
  '    orderBy = "id";',
  '',
  'await using var command = new NpgsqlCommand(',
  '    $"SELECT name, price FROM products ORDER BY {orderBy}", connection);',
]);

/* ---------- 2. Сборка запроса из ввода ---------- */
const PRE = "SELECT id, name, price FROM products WHERE name ILIKE '%";
const POST = "%' ORDER BY id";
const KWS = new Set('SELECT FROM WHERE ILIKE LIKE ORDER BY OR AND NOT UPDATE SET DELETE DROP TABLE INSERT INTO VALUES UNION NULL IS'.split(' '));

function tokenize(sql) {
  const out = []; let i = 0, unterminated = false;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'") {
      let j = i + 1;
      for (;;) {
        if (j >= sql.length) { unterminated = true; break; }
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue; }
        if (sql[j] === "'") { j++; break; }
        j++;
      }
      out.push({ t: 'str', a: i, b: Math.min(j, sql.length) }); i = j;
    } else if (ch === '-' && sql[i + 1] === '-') {
      const j = sql.indexOf('\n', i); const b = j < 0 ? sql.length : j;
      out.push({ t: 'com', a: i, b }); i = b;
    } else if (/[A-Za-z_]/.test(ch)) {
      let j = i; while (j < sql.length && /\w/.test(sql[j])) j++;
      out.push({ t: KWS.has(sql.slice(i, j).toUpperCase()) ? 'kw' : 'id', a: i, b: j }); i = j;
    } else if (/\d/.test(ch)) {
      let j = i; while (j < sql.length && /[\d.]/.test(sql[j])) j++;
      out.push({ t: 'num', a: i, b: j }); i = j;
    } else { out.push({ t: 'p', a: i, b: i + 1 }); i++; }
  }
  return { tokens: out, unterminated };
}

function analyse(user) {
  const sql = PRE + user + POST;
  const ua = PRE.length, ub = ua + user.length;
  const { tokens, unterminated } = tokenize(sql);
  let html = '', codeChars = 0;
  for (const tk of tokens) {
    for (let k = tk.a; k < tk.b;) {
      const fromUser = k >= ua && k < ub;
      let e = k; while (e < tk.b && ((e >= ua && e < ub) === fromUser)) e++;
      const part = sql.slice(k, e);
      const cls = [tk.t === 'kw' ? 'kw' : tk.t === 'str' ? 'str' : tk.t === 'com' ? 'com' : tk.t === 'num' ? 'num' : ''];
      if (fromUser) {
        const inData = tk.t === 'str';
        cls.push(inData ? 'u-data' : 'u-code');
        if (!inData) codeChars += part.replace(/\s/g, '').length;
      }
      html += `<span class="${cls.join(' ').trim()}">${esc(part)}</span>`;
      k = e;
    }
  }
  return { html, codeChars, unterminated };
}

/* результаты готовых вариантов — со стенда */
const KNOWN = {
  'мыш': ['ok', 'Найдено товаров: 2', rowsHtml([2, 6])],
  'USB': ['ok', 'Найдено товаров: 1', rowsHtml([7])],
  '24"': ['ok', 'Найдено товаров: 1', rowsHtml([3]) + '<p>Двойная кавычка в SQL не закрывает строку: строки SQL заключаются в апострофы.</p>'],
  "O'Neil": ['bad', 'Ошибка 42601', '<code>Npgsql.PostgresException: 42601: syntax error at or near "Neil"</code><p>Апостроф в фамилии закрыл строку, слово Neil осталось вне строки, а остаток <code>%\' ORDER BY id</code> открыл новую строку, которая не закрыта.</p>'],
  "' OR 1=1 --": ['bad', 'Найдено товаров: 8 — вся таблица', rowsHtml([1, 2, 3, 4, 5, 6, 7, 8]) + '<p>Условие стало <code>name ILIKE \'%\' OR 1=1</code>. Шаблон <code>\'%\'</code> подходит любому названию, <code>1=1</code> верно всегда, остальное — комментарий.</p>'],
  "Мышь' --": ['warn', 'Найдено товаров: 1', rowsHtml([2]) + '<p>Комментарий отрезал хвост <code>%\'</code>, и шаблон стал <code>\'%Мышь\'</code>: названия, которые заканчиваются на «Мышь». Коврик для мыши не подошёл. Запрос изменён вводом, хотя результат выглядит правдоподобно.</p>'],
  "'; UPDATE products SET price = 1; --": ['bad', 'Найдено товаров: 8, цены изменены', rowsHtml([1, 2, 3, 4, 5, 6, 7, 8]) + '<p>Программа напечатала восемь товаров со старыми ценами: первый запрос выполнился до второго. После него в таблице:</p>' + rowsHtml([1, 2, 3, 4, 5, 6, 7, 8], 'chg')],
};

function simulate(user) {
  if (/['\\]/.test(user)) return null;
  const rx = new RegExp('^' + ('%' + user + '%').replace(/[.*+?^${}()|[\]]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'is');
  return PRODUCTS.filter(p => rx.test(p[1])).map(p => p[0]);
}

const PRESETS = {
  safe: ['мыш', 'USB', '24"', "O'Neil"],
  attack: ["' OR 1=1 --", "Мышь' --", "'; UPDATE products SET price = 1; --", 'мыш'],
};
$$('[data-builder]').forEach(panel => {
  const input = $('input', panel), view = $('.sqlview', panel), box = $('.verdict-box', panel), pre = $('.presets', panel);
  const list = PRESETS[panel.dataset.builder];
  pre.innerHTML = list.map(v => `<button type="button">${esc(v)}</button>`).join('');
  const btns = $$('button', pre);
  const draw = () => {
    const user = input.value;
    btns.forEach((b, i) => b.setAttribute('aria-pressed', String(list[i] === user)));
    const a = analyse(user);
    view.innerHTML = a.html;
    const known = KNOWN[user];
    let kind, title, body;
    if (known) [kind, title, body] = known;
    else if (!a.codeChars && !a.unterminated) {
      const ids = simulate(user);
      if (ids) { kind = 'ok'; title = `Найдено товаров: ${ids.length}`; body = ids.length ? rowsHtml(ids) : '<p>Ни одно название не подходит к шаблону.</p>'; }
      else { kind = 'warn'; title = 'Результат не вычислен'; body = '<p>Обратная косая черта в шаблоне LIKE экранирует следующий символ, результат этого ввода на стенде не проверялся.</p>'; }
    } else {
      kind = 'bad'; title = 'Ввод изменил запрос';
      body = `<p>${a.codeChars ? `Символов ввода вне строки SQL: ${a.codeChars}. Сервер разберёт их как код.` : ''} ${a.unterminated ? 'Строка в конце запроса не закрыта, сервер ответит ошибкой синтаксиса.' : ''}</p><p>Результат для этого ввода на стенде не проверялся.</p>`;
    }
    box.className = 'verdict-box ' + kind;
    box.innerHTML = `<b class="vt">${title}</b>${body}`;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => { input.value = list[i]; draw(); }));
  input.addEventListener('input', draw);
  input.value = list[0];
  draw();
});

/* ---------- 3. Склейка и параметр ---------- */
(() => {
  const root = $('#chan');
  const MODES = {
    concat: {
      code: ['string sql = $"… ILIKE \'%{text}%\' …";', 'new NpgsqlCommand(sql, connection);', '', '// text = "\' OR 1=1 --"'],
      p1: "…ILIKE '%' OR 1=1 --%'…", p2: null,
      srv: [['Разбирает текст: условие <code>name ILIKE \'%\' OR 1=1</code>', ''], ['Остаток после <code>--</code> — комментарий', ''], ['Выполняет запрос: подходят все 8 строк', 'bad']],
      log: '<span class="ts">2026-10-22 09:40:38.943 UTC [77]</span> LOG:  execute &lt;unnamed&gt;: SELECT id, name, price FROM products WHERE name ILIKE <span class="dang">\'%\' OR 1=1 --%\'</span> ORDER BY id',
    },
    param: {
      code: ['string sql = "… ILIKE @pattern …";', 'new NpgsqlCommand(sql, connection);', 'command.Parameters.AddWithValue(', '    "pattern", "%" + text + "%");'],
      p1: '…ILIKE $1…', p2: "$1 = %' OR 1=1 --%",
      srv: [['Разбирает текст: условие <code>name ILIKE $1</code>', ''], ['Получает значение <code>$1</code> как строку text', ''], ['Выполняет запрос: таких названий нет, 0 строк', '']],
      log: '<span class="ts">2026-10-22 09:40:38.959 UTC [77]</span> LOG:  execute &lt;unnamed&gt;: SELECT id, name, price FROM products WHERE name ILIKE <span class="hl">$1</span> ORDER BY id\n<span class="ts">2026-10-22 09:40:38.959 UTC [77]</span> DETAIL:  Parameters: <span class="hl">$1 = \'%\'\' OR 1=1 --%\'</span>',
    },
  };
  let mode = 'concat', timers = [];
  const play = () => {
    timers.forEach(clearTimeout); timers = [];
    const m = MODES[mode];
    renderCode($('#chanCode'), m.code);
    $('#w2').classList.toggle('off', !m.p2);
    const p1 = $('#p1'), p2 = $('#p2');
    [p1, p2].forEach(p => { p.classList.remove('go'); p.style.opacity = 0; });
    $('#srv').innerHTML = m.srv.map(([t, c]) => `<li class="${c}">${t}</li>`).join('');
    $('#chanLog').innerHTML = m.log;
    $('#chanLog').style.opacity = .25;
    void p1.offsetWidth;
    p1.textContent = m.p1; p1.style.opacity = ''; p1.classList.add('go');
    if (m.p2) timers.push(setTimeout(() => { p2.textContent = m.p2; p2.style.opacity = ''; p2.classList.add('go'); }, 350));
    $$('#srv li').forEach((li, i) => timers.push(setTimeout(() => li.classList.add('on'), 1300 + i * 550)));
    timers.push(setTimeout(() => { $('#chanLog').style.opacity = 1; }, 1300 + m.srv.length * 550));
  };
  $$('[data-m]', root).forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.m;
    $$('[data-m]', root).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    play();
  }));
  $('#chanPlay').addEventListener('click', play);
  $('#chanLog').style.transition = 'opacity .4s';
  play();
})();

/* ---------- 4. Ошибки с параметрами ---------- */
(() => {
  const C = [
    { t: 'Число в параметре', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM orders WHERE id = @id", connection);', 'command.Parameters.AddWithValue("id", 3);'],
      k: 'ok', out: 'Результат: <code>1</code>. Значение <code>int</code> передано как <code>integer</code>, заказ номер 3 найден.' },
    { t: 'Строка вместо числа', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM orders WHERE id = @id", connection);', 'command.Parameters.AddWithValue("id", "3");'],
      k: 'bad', out: '<code>Npgsql.PostgresException: 42883: operator does not exist: integer = text</code><br>Строка <code>"3"</code> передана как <code>text</code>. Оператора, который сравнивает <code>integer</code> с <code>text</code>, в PostgreSQL нет. Ввод переводят в число в C#: <code>int.Parse(input)</code>.' },
    { t: 'null вместо значения', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM products WHERE name = @n", connection);', 'command.Parameters.AddWithValue("n", null);'],
      k: 'bad', out: '<code>System.InvalidOperationException: Parameter \'n\' must have either its DbType, NpgsqlDbType, DataTypeName or its Value set.</code><br>По <code>null</code> Npgsql не может определить тип параметра, и запрос на сервер не уходит. Пустое значение в ADO.NET обозначают <code>DBNull.Value</code>.' },
    { t: 'DBNull.Value и знак =', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM products WHERE name = @n", connection);', 'command.Parameters.AddWithValue("n", DBNull.Value);'],
      k: 'warn', out: 'Результат: <code>0</code>, без ошибки. Сравнение <code>name = NULL</code> не даёт истину ни для одной строки. Пустые значения ищут условием <code>name IS NULL</code>.' },
    { t: 'Параметр не добавлен', code: ['var command = new NpgsqlCommand(', '    "SELECT count(*) FROM products WHERE name = @n", connection);', '// строки с AddWithValue нет'],
      k: 'bad', out: '<code>Npgsql.PostgresException: 42703: column "n" does not exist</code><br>Npgsql заменяет на <code>$1</code> только добавленные параметры. Без них текст ушёл на сервер с <code>@n</code>, и сервер разобрал <code>n</code> как имя столбца.' },
    { t: 'Имя не совпадает', code: ['var command = new NpgsqlCommand(', '    "SELECT … FROM products WHERE price <= @maxPrice …", connection);', 'command.Parameters.AddWithValue("price", maxPrice);'],
      k: 'bad', out: '<code>Npgsql.PostgresException: 42703: column "maxprice" does not exist</code><br>Параметра с именем <code>maxPrice</code> нет, поэтому <code>@maxPrice</code> ушёл на сервер как текст. PostgreSQL переводит имена без кавычек в нижний регистр, отсюда <code>maxprice</code> в сообщении. Регистр в имени параметра не учитывается: <code>"maxprice"</code> и <code>"@maxPrice"</code> тоже подходят.' },
    { t: 'Знак % в значении', code: ['// text = "%"', 'command.Parameters.AddWithValue("pattern", "%" + text + "%");'],
      k: 'warn', out: 'Найдено товаров: <code>8</code>. Структура запроса не изменилась, но <code>%</code> и <code>_</code> внутри шаблона LIKE — подстановочные знаки, и шаблон <code>%%%</code> подходит любому названию. Если эти символы нужно искать буквально, перед ними ставят обратную косую черту.' },
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

/* ---------- 5. Белый список ---------- */
(() => {
  const DICT = [['1', 'id'], ['2', 'price'], ['3', 'price DESC']];
  const ORDER = { id: [1, 2, 3, 4, 5, 6, 7, 8], price: [6, 2, 7, 8, 1, 5, 4, 3], 'price DESC': [3, 4, 5, 1, 8, 7, 2, 6] };
  const CH = ['1', '2', '3', 'price; DROP TABLE products'];
  $('#wlDict tbody').innerHTML = DICT.map(([k, v]) => `<tr><td>"${k}"</td><td>"${v}"</td></tr>`).join('');
  const box = $('#wlChoices');
  box.innerHTML = CH.map(c => `<button type="button">choice = "${esc(c)}"</button>`).join('');
  const btns = $$('button', box);
  const show = i => {
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    const idx = DICT.findIndex(([k]) => k === CH[i]);
    $$('#wlDict tbody tr').forEach((tr, j) => { tr.className = j === idx ? 'hit' : ''; });
    const frag = idx < 0 ? 'id' : DICT[idx][1];
    $('#wlLookup').innerHTML = idx < 0
      ? `Ключа <code>"${esc(CH[i])}"</code> в словаре нет: <code>TryGetValue</code> вернул <code>false</code>, сортировка по <code>id</code>. Введённый текст в запрос не попал.`
      : `Ключ <code>"${CH[i]}"</code> найден, в запрос вставлен фрагмент <code>${frag}</code> из словаря.`;
    $('#wlSql').innerHTML = `<span class="kw">SELECT</span> name, price <span class="kw">FROM</span> products <span class="kw">ORDER BY</span> <span class="u-data">${esc(frag)}</span>`;
    $('#wlRows').innerHTML = ORDER[frag].map(id => { const p = PRODUCTS[id - 1]; return `<div>${esc(p[1])}, ${ru(p[2])} руб.</div>`; }).join('');
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(1);
})();
