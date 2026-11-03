/* ОП.04 «Хеш-структуры» — интерактивные схемы книги.
   Общие блоки (вопросы, песочница, график замеров) берутся из
   ../massivy/algo.js и book.js, здесь только то, что относится к хешам.

   Ключи на схемах — целые числа (номера заказов). Для них в Python
   hash(k) == k, поэтому номер ячейки на схеме совпадает с тем, что
   вычисляет Python: hash(k) % m. При занятой ячейке схема берёт
   следующую по кругу. CPython выбирает следующую ячейку по другой
   формуле, но для поиска важно то же самое: идти по тому же пути,
   что при вставке, до ключа или до пустой ячейки.

   Части файла:
     1. общие функции: хеш целого числа, размещение ключей
     2. .lookup — поиск номера в списке и в хеш-таблице
     3. .htable — таблица из m ячеек: вставка и поиск по шагам       */
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const json = (node, name) => { try { return JSON.parse(node.dataset[name]); } catch (_) { return null; } };
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ── 1. Общие функции ─────────────────────────────────────────── */
  /* hash целого числа как в CPython для |k| < 2**61 − 1: само число,
     только hash(-1) == -2 (−1 в C означает ошибку). */
  const pyHash = k => (k === -1 ? -2 : k);
  const pyMod = (a, m) => ((a % m) + m) % m;
  const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  const cellsN = n => `${n} ${plural(n, 'ячейку', 'ячейки', 'ячеек')}`;
  const readInt = v => { v = String(v).trim(); return /^-?\d{1,9}$/.test(v) ? parseInt(v, 10) : null; };

  /* Путь ключа по таблице: ячейки, которые просматриваются при поиске
     или вставке. Заканчивается на ячейке с этим ключом или на пустой. */
  function probe(slots, key) {
    const m = slots.length, start = pyMod(pyHash(key), m), path = [];
    for (let k = 0; k < m; k++) {
      const i = (start + k) % m;
      path.push(i);
      if (slots[i] === null || slots[i] === key) return { start, path, end: i, found: slots[i] === key };
    }
    return { start, path, end: null, found: false };
  }
  function place(keys, m) {
    const slots = Array(m).fill(null);
    keys.forEach(k => { const p = probe(slots, k); if (p.end !== null) slots[p.end] = k; });
    return slots;
  }
  const slotsHTML = (slots, mark = {}) => `<div class="cells hx-slots">${slots.map((k, i) =>
    `<div class="cell ${mark[i] || ''}"><span class="cell__idx">${i}</span><span class="cell__val">${k === null ? '' : esc(k)}</span>`
    + `<span class="cell__tags">${mark[i] === 'is-probe' || mark[i] === 'is-hit' || mark[i] === 'is-stop' ? `<span class="tag tag--w">${(mark.order || {})[i]}</span>` : ''}</span></div>`).join('')}</div>`;

  /* ── 2. Поиск номера в списке и в хеш-таблице ────────────────── */
  /* data-keys — номера заказов, data-m — число ячеек таблицы,
     data-q — номер, который ищется сначала. */
  document.querySelectorAll('.lookup').forEach(root => {
    const keys = json(root, 'keys') || [42, 17, 300, 230, 61];
    const m = +(root.dataset.m || 8);
    const slots = place(keys, m);
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Поиск номера заказа')}</b><span>впишите номер</span></div>
      <div class="widget__body">
        <label class="hx-field"><span>номер =</span><input class="hx-input" inputmode="numeric" value="${esc(root.dataset.q ?? 230)}"></label>
        <div class="hx-quick">${[...keys.slice(-2), 5, 1042].map(k => `<button type="button" class="btn" data-k="${k}">${k}</button>`).join('')}</div>
        <div class="hx-pair">
          <section><h4>Список <code>orders</code></h4><div class="hx-list"></div><p class="hx-count hx-count--list"></p></section>
          <section><h4>Множество <code>orders_set</code>, ${m} ячеек</h4><div class="hx-table"></div><p class="hx-count hx-count--set"></p></section>
        </div>
        <div class="legend"><span><i class="l-probe"></i>ячейка проверена</span><span><i class="l-hit"></i>номер найден</span></div>
      </div>
      <div class="widget__foot hx-note"></div>`;
    const inp = root.querySelector('.hx-input');
    const draw = () => {
      const q = readInt(inp.value);
      const listBox = root.querySelector('.hx-list'), tableBox = root.querySelector('.hx-table');
      if (q === null) {
        listBox.innerHTML = tableBox.innerHTML = '';
        root.querySelector('.hx-count--list').textContent = root.querySelector('.hx-count--set').textContent = '';
        root.querySelector('.hx-note').innerHTML = '<span class="hx-err">Впишите целый номер, например 230.</span>';
        return;
      }
      const at = keys.indexOf(q), seen = at === -1 ? keys.length : at + 1;
      listBox.innerHTML = `<div class="cells">${keys.map((k, i) => `<div class="cell ${i < seen ? (i === at ? 'is-hit' : 'is-probe') : ''}"><span class="cell__idx">${i}</span><span class="cell__val">${k}</span><span class="cell__tags">${i < seen ? `<span class="tag tag--w">${i + 1}</span>` : ''}</span></div>`).join('')}</div>`;
      const p = probe(slots, q), mark = { order: {} };
      p.path.forEach((i, n) => { mark[i] = i === p.end && p.found ? 'is-hit' : 'is-probe'; mark.order[i] = n + 1; });
      tableBox.innerHTML = slotsHTML(slots, mark);
      root.querySelector('.hx-count--list').innerHTML = `сравнений: <b>${seen}</b>`;
      root.querySelector('.hx-count--set').innerHTML = `проверено ячеек: <b>${p.path.length}</b>`;
      root.querySelector('.hx-note').innerHTML = at === -1
        ? `Номера ${q} нет. Список сравнил его со всеми ${keys.length} элементами: только так можно убедиться, что номера нет. Таблица вычислила ячейку <code>${q} % ${m} = ${p.start}</code>${p.path.length > 1 ? `, прошла ${cellsN(p.path.length)} до пустой` : ''} и остановилась на пустой ячейке: если бы номер был в таблице, он лежал бы там.`
        : `Номер ${q} найден. Список дошёл до него за ${seen} ${plural(seen, 'сравнение', 'сравнения', 'сравнений')}: столько, на каком месте номер стоит. Таблица сразу вычислила ячейку <code>${q} % ${m} = ${p.start}</code> и нашла номер ${p.path.length === 1 ? 'в ней' : `за ${p.path.length} ${plural(p.path.length, 'проверку', 'проверки', 'проверок')}`}. Как вычисляется ячейка, разобрано в главе 0.2.`;
    };
    inp.addEventListener('input', draw);
    root.querySelectorAll('.hx-quick .btn').forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.k; draw(); }));
    draw();
  });

  /* ── 3. Таблица из m ячеек: вставка и поиск по шагам ──────────── */
  /* data-keys — ключи, которые вставляются по очереди кнопкой,
     data-m — число ячеек. Свой ключ можно вставить или поискать. */
  document.querySelectorAll('.htable').forEach(root => {
    const queue = json(root, 'keys') || [42, 17, 1042, 300, 25];
    const m = +(root.dataset.m || 8);
    const usable = Math.floor(m * 2 / 3);
    let slots, next, log;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || `Хеш-таблица из ${m} ячеек`)}</b><span>вставка и поиск</span></div>
      <div class="widget__body">
        <div class="hx-ctrl">
          <button type="button" class="btn btn--main hx-next"></button>
          <button type="button" class="btn hx-reset">сначала</button>
        </div>
        <div class="hx-ctrl">
          <label class="hx-field hx-field--short"><span>ключ =</span><input class="hx-input" inputmode="numeric" value="9"></label>
          <button type="button" class="btn hx-add">вставить</button>
          <button type="button" class="btn hx-find">найти</button>
        </div>
        <div class="hx-table"></div>
        <ul class="hx-log"></ul>
        <div class="legend"><span><i class="l-probe"></i>ячейка проверена, занята другим ключом</span><span><i class="l-stop"></i>пустая ячейка</span><span><i class="l-hit"></i>ключ записан или найден</span></div>
      </div>
      <div class="widget__foot hx-note"></div>`;
    const btnNext = root.querySelector('.hx-next'), inp = root.querySelector('.hx-input');

    function show(mark, line, note) {
      root.querySelector('.hx-table').innerHTML = slotsHTML(slots, mark);
      if (line) log.unshift(line);
      root.querySelector('.hx-log').innerHTML = log.slice(0, 6).map(l => `<li>${l}</li>`).join('');
      const left = queue.slice(next);
      btnNext.textContent = left.length ? `вставить ${left[0]}` : 'ключи из списка вставлены';
      btnNext.disabled = !left.length;
      const used = slots.filter(k => k !== null).length;
      root.querySelector('.hx-note').innerHTML = (note ? note + ' ' : '')
        + `Занято ${used} из ${m} ячеек.` + (used > usable ? ` <b>В словаре Python таблица из ${m} ячеек вмещает не больше ${usable} ключей: ключ № ${usable + 1} он записал бы уже в увеличенную таблицу. Это разобрано в главе 0.4.</b>` : '');
    }
    function pathMark(p, kind) {
      const mark = { order: {} };
      p.path.forEach((i, n) => { mark[i] = 'is-probe'; mark.order[i] = n + 1; });
      if (p.end !== null) mark[p.end] = kind;
      return mark;
    }
    function steps(key, p) {
      const parts = [`<code>hash(${key}) % ${m} = ${p.start}</code>`];
      p.path.slice(0, -1).forEach(i => parts.push(`ячейка ${i} занята ключом ${slots[i]}`));
      return parts;
    }
    function insert(key) {
      const p = probe(slots, key);
      if (p.found) return show(pathMark(p, 'is-hit'), `${steps(key, p).join(' → ')} → ключ ${key} уже есть, второй раз не записывается`, `Ключ ${key} уже в таблице: в множестве и в ключах словаря каждый ключ хранится один раз.`);
      if (p.end === null) return show(pathMark(p, 'is-probe'), `${key}: свободных ячеек нет`, 'Все ячейки заняты.');
      slots[p.end] = key;
      const coll = p.path.length > 1;
      show(pathMark(p, 'is-hit'), `${steps(key, p).join(' → ')} → ячейка ${p.end} свободна, ключ ${key} записан`,
        coll ? `Коллизия: ячейка ${p.start} уже занята, ключ ${key} лёг в ячейку ${p.end}. При поиске ${key} таблица пройдёт тот же путь.` : `Ячейка ${p.start} была свободна, ключ записан сразу.`);
    }
    function find(key) {
      const p = probe(slots, key);
      const mark = pathMark(p, p.found ? 'is-hit' : 'is-stop');
      const tail = p.found ? `ключ ${key} найден в ячейке ${p.end}` : p.end === null ? 'пустых ячеек нет, ключа нет' : `ячейка ${p.end} пустая — ключа ${key} нет`;
      show(mark, `поиск: ${steps(key, p).join(' → ')} → ${tail}`,
        p.found ? `Поиск прошёл ${p.path.length === 1 ? 'одну ячейку' : `${cellsN(p.path.length)} — тот же путь, что при вставке`}.` : 'Пустая ячейка на пути означает, что ключа нет: при вставке он лёг бы в неё или раньше.');
    }
    function reset() { slots = Array(m).fill(null); next = 0; log = []; show({}, '', `Таблица пустая. Ключи из списка: ${queue.join(', ')}.`); }

    btnNext.addEventListener('click', () => { if (next < queue.length) insert(queue[next++]); });
    root.querySelector('.hx-reset').addEventListener('click', reset);
    const own = fn => () => { const k = readInt(inp.value); if (k === null || k < 0) { root.querySelector('.hx-note').innerHTML = '<span class="hx-err">Впишите целый неотрицательный номер.</span>'; return; } fn(k); };
    root.querySelector('.hx-add').addEventListener('click', own(insert));
    root.querySelector('.hx-find').addEventListener('click', own(find));
    reset();
  });
})();
