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
     3. .htable — таблица из m ячеек: вставка и поиск по шагам,
        с data-grow — рост таблицы и перекладка ключей (resize/rehash)
     4. .setops — операции над двумя множествами
     5. .groupby — группировка слов по ключу: отсортированные буквы или частоты
     6. .buckets — частоты и вёдра «частота → элементы» для k самых частых */
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
        : `Номер ${q} найден. Список дошёл до него за ${seen} ${plural(seen, 'сравнение', 'сравнения', 'сравнений')}: столько, на каком месте номер стоит. Таблица сразу вычислила ячейку <code>${q} % ${m} = ${p.start}</code> и нашла номер ${p.path.length === 1 ? 'в ней' : `за ${p.path.length} ${plural(p.path.length, 'проверку', 'проверки', 'проверок')}`}.`;
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
    const m0 = +(root.dataset.m || 8);
    const grow = 'grow' in root.dataset;
    /* Словарь CPython заполняет таблицу не больше чем на 2/3. Когда
       ключ не помещается, новая таблица — ближайшая степень двойки
       не меньше 3 · (число ключей); все ключи раскладываются заново. */
    const usableOf = m => Math.floor(m * 2 / 3);
    let m, usable, slots, next, log, inserted;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || `Хеш-таблица из ${m0} ячеек`)}</b><span>${grow ? 'вставка и рост таблицы' : 'вставка и поиск'}</span></div>
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
        + `Занято ${used} из ${m} ячеек.` + (grow ? ` Таблица из ${m} ячеек вмещает ${usable} ${plural(usable, 'ключ', 'ключа', 'ключей')}.`
          : used > usable ? ` <b>В словаре Python таблица из ${m} ячеек вмещает не больше ${usable} ключей: ключ № ${usable + 1} он записал бы уже в увеличенную таблицу.</b>` : '');
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
    function resize() {
      const old = m, n = inserted.length;
      m = 8; while (m < n * 3) m *= 2;
      usable = usableOf(m);
      slots = place(inserted, m);
      const moved = inserted.map(k => `${k} → ${slots.indexOf(k)}`).join(', ');
      log.unshift(`<b>таблица заполнена: ${n} ${plural(n, 'ключ', 'ключа', 'ключей')} из ${n} возможных → новая таблица из ${m} ячеек, ключи разложены заново по <code>hash % ${m}</code>: ${moved}</b>`);
      return old;
    }
    function insert(key) {
      let p = probe(slots, key), grew = null;
      if (grow && !p.found && inserted.length + 1 > usable) { grew = resize(); p = probe(slots, key); }
      if (p.found) return show(pathMark(p, 'is-hit'), `${steps(key, p).join(' → ')} → ключ ${key} уже есть, второй раз не записывается`, `Ключ ${key} уже в таблице: в множестве и в ключах словаря каждый ключ хранится один раз.`);
      if (p.end === null) return show(pathMark(p, 'is-probe'), `${key}: свободных ячеек нет`, 'Все ячейки заняты.');
      slots[p.end] = key; inserted.push(key);
      const coll = p.path.length > 1;
      const grewNote = grew ? `Ключ № ${inserted.length} не поместился в таблицу из ${grew} ячеек. Таблица выросла до ${m} ячеек, и все ${inserted.length - 1} прежних ключей переложены: от числа ячеек зависит остаток, поэтому ячейки у ключей новые. ` : '';
      show(pathMark(p, 'is-hit'), `${steps(key, p).join(' → ')} → ячейка ${p.end} свободна, ключ ${key} записан`,
        grewNote + (coll ? `Коллизия: ячейка ${p.start} уже занята, ключ ${key} лёг в ячейку ${p.end}. При поиске ${key} таблица пройдёт тот же путь.` : `Ячейка ${p.start} была свободна, ключ записан сразу.`));
    }
    function find(key) {
      const p = probe(slots, key);
      const mark = pathMark(p, p.found ? 'is-hit' : 'is-stop');
      const tail = p.found ? `ключ ${key} найден в ячейке ${p.end}` : p.end === null ? 'пустых ячеек нет, ключа нет' : `ячейка ${p.end} пустая — ключа ${key} нет`;
      show(mark, `поиск: ${steps(key, p).join(' → ')} → ${tail}`,
        p.found ? `Поиск прошёл ${p.path.length === 1 ? 'одну ячейку' : `${cellsN(p.path.length)} — тот же путь, что при вставке`}.` : 'Пустая ячейка на пути означает, что ключа нет: при вставке он лёг бы в неё или раньше.');
    }
    function reset() { m = m0; usable = usableOf(m); slots = Array(m).fill(null); next = 0; log = []; inserted = []; show({}, '', `Таблица пустая. Ключи из списка: ${queue.join(', ')}.`); }

    btnNext.addEventListener('click', () => { if (next < queue.length) insert(queue[next++]); });
    root.querySelector('.hx-reset').addEventListener('click', reset);
    const own = fn => () => { const k = readInt(inp.value); if (k === null || k < 0) { root.querySelector('.hx-note').innerHTML = '<span class="hx-err">Впишите целый неотрицательный номер.</span>'; return; } fn(k); };
    root.querySelector('.hx-add').addEventListener('click', own(insert));
    root.querySelector('.hx-find').addEventListener('click', own(find));
    reset();
  });

  /* ── 4. Операции над двумя множествами ──────────────────────── */
  /* data-a, data-b — элементы двух множеств (строки или числа),
     data-names — подписи множеств, data-vars — имена переменных. */
  document.querySelectorAll('.setops').forEach(root => {
    const A = json(root, 'a') || [], B = json(root, 'b') || [];
    const [na, nb] = json(root, 'names') || ['A', 'B'];
    const [va, vb] = json(root, 'vars') || ['a', 'b'];
    const inA = new Set(A), inB = new Set(B);
    const all = [...A, ...B.filter(x => !inA.has(x))];
    const zone = x => inA.has(x) && inB.has(x) ? 'both' : inA.has(x) ? 'a' : 'b';
    const ops = [
      ['|', 'объединение', x => true, `все элементы, которые есть хотя бы в одном из множеств`],
      ['&', 'пересечение', x => zone(x) === 'both', `элементы, которые есть в обоих множествах`],
      ['-', 'разность', x => zone(x) === 'a', `элементы ${va}, которых нет в ${vb}`],
      ['-', 'разность', x => zone(x) === 'b', `элементы ${vb}, которых нет в ${va}`, true],
      ['^', 'симметрическая разность', x => zone(x) !== 'both', `элементы, которые есть ровно в одном из множеств`],
    ];
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Операции над множествами')}</b><span>выберите операцию</span></div>
      <div class="widget__body">
        <div class="hx-ctrl">${ops.map((o, i) => `<button type="button" class="btn" data-i="${i}"><code>${o[4] ? `${vb} ${o[0]} ${va}` : `${va} ${o[0]} ${vb}`}</code></button>`).join('')}</div>
        <div class="so-rows">
          <div class="so-row"><span class="so-name"><code>${esc(va)}</code> · ${esc(na)}</span><div class="so-chips">${A.map(x => `<span class="so-chip so-${zone(x)}" data-x="${esc(x)}">${esc(x)}</span>`).join('')}</div></div>
          <div class="so-row"><span class="so-name"><code>${esc(vb)}</code> · ${esc(nb)}</span><div class="so-chips">${B.map(x => `<span class="so-chip so-${zone(x)}" data-x="${esc(x)}">${esc(x)}</span>`).join('')}</div></div>
          <div class="so-row so-row--res"><span class="so-name so-res-name"></span><div class="so-chips so-res"></div></div>
        </div>
        <div class="legend"><span><i class="l-a"></i>только в <code>${esc(va)}</code></span><span><i class="l-both"></i>в обоих</span><span><i class="l-b"></i>только в <code>${esc(vb)}</code></span></div>
      </div>
      <div class="widget__foot hx-note"></div>`;
    const btns = root.querySelectorAll('.hx-ctrl .btn');
    const pick = i => {
      const [sym, name, keep, what, rev] = ops[i];
      const res = all.filter(keep);
      btns.forEach((b, j) => b.classList.toggle('btn--main', j === i));
      root.querySelectorAll('.so-rows .so-row:not(.so-row--res) .so-chip').forEach(c => c.classList.toggle('is-off', !res.map(String).includes(c.dataset.x)));
      const expr = rev ? `${vb} ${sym} ${va}` : `${va} ${sym} ${vb}`;
      root.querySelector('.so-res-name').innerHTML = `<code>${esc(expr)}</code>`;
      root.querySelector('.so-res').innerHTML = res.length ? res.map(x => `<span class="so-chip so-${zone(x)}">${esc(x)}</span>`).join('') : '<span class="so-empty">set() — пустое множество</span>';
      root.querySelector('.hx-note').innerHTML = `<b>${name[0].toUpperCase() + name.slice(1)}</b> <code>${esc(expr)}</code> — ${what}: ${res.length} ${plural(res.length, 'элемент', 'элемента', 'элементов')}. Каждый элемент в результате один раз, даже если он был в обоих множествах.`;
    };
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    pick(1);
  });

  /* ── 5. Группировка слов по ключу ───────────────────────────── */
  /* data-words — слова через запятую или JSON-список. Ключ —
     отсортированные буквы ''.join(sorted(w)) или частоты букв; частоты
     показаны только ненулевыми, в Python это кортеж из 33 чисел. */
  const RU = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  const pySorted = w => [...w].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join('');
  const countKey = w => { const c = {}; for (const ch of w) c[ch] = (c[ch] || 0) + 1; return [...RU, ...Object.keys(c).filter(ch => !RU.includes(ch)).sort()].filter(ch => c[ch]).map(ch => `${ch}${c[ch]}`).join(' '); };
  document.querySelectorAll('.groupby').forEach(root => {
    const start = (json(root, 'words') || ['листок', 'кот', 'слиток', 'ток', 'столик', 'окт', 'кот']).join(', ');
    let mode = 'sorted';
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Группировка слов по ключу')}</b><span>впишите слова</span></div>
      <div class="widget__body">
        <label class="hx-field"><span>words =</span><input class="hx-input gb-input" value="${esc(start)}"></label>
        <div class="hx-ctrl"><button type="button" class="btn" data-m="sorted">ключ: отсортированные буквы</button><button type="button" class="btn" data-m="counts">ключ: частоты букв</button></div>
        <div class="table-scroll"><table class="gb-keys"><thead><tr><th>Слово</th><th>Ключ</th><th>Группа</th></tr></thead><tbody></tbody></table></div>
        <div class="gb-groups"></div>
      </div>
      <div class="widget__foot hx-note"></div>`;
    const inp = root.querySelector('.gb-input');
    const draw = () => {
      const words = inp.value.split(',').map(w => w.trim().toLowerCase());
      if (inp.value.trim() === '') words.length = 0;
      const key = mode === 'sorted' ? pySorted : countKey;
      const groups = new Map();
      const rows = words.map(w => {
        const k = key(w);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(w);
        return `<tr><td><code>'${esc(w)}'</code></td><td><code>${mode === 'sorted' ? `'${esc(k)}'` : esc(k || 'все нули')}</code></td><td>${[...groups.keys()].indexOf(k) + 1}</td></tr>`;
      });
      root.querySelectorAll('.hx-ctrl .btn').forEach(b => b.classList.toggle('btn--main', b.dataset.m === mode));
      root.querySelector('.gb-keys tbody').innerHTML = rows.join('');
      root.querySelector('.gb-groups').innerHTML = [...groups.values()].map((g, i) => `<div class="gb-group"><span class="gb-num">группа ${i + 1}</span><div class="so-chips">${g.map(w => `<span class="so-chip so-both">${esc(w) || ' '}</span>`).join('')}</div></div>`).join('');
      const dup = words.length - new Set(words).size;
      root.querySelector('.hx-note').innerHTML = `${words.length} ${plural(words.length, 'слово', 'слова', 'слов')}, ${groups.size} ${plural(groups.size, 'группа', 'группы', 'групп')}. `
        + (mode === 'sorted' ? 'Ключ — строка из тех же букв по алфавиту: <code>\'\'.join(sorted(w))</code>.' : 'Ключ — сколько раз встречается каждая буква. На схеме показаны только ненулевые частоты, в Python это кортеж из 33 чисел.')
        + ` Группы идут в порядке первого появления ключа, слова в группе — в порядке входа.` + (dup ? ` Повторы слов сохраняются: в группах ${dup} ${plural(dup, 'повтор', 'повтора', 'повторов')}.` : '');
    };
    inp.addEventListener('input', draw);
    root.querySelectorAll('.hx-ctrl .btn').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; draw(); }));
    draw();
  });

  /* ── 6. Частоты и вёдра ─────────────────────────────────────── */
  /* data-nums — числа, data-k — сколько самых частых вернуть. Ведро
     с номером c хранит числа с частотой c в порядке первого появления. */
  document.querySelectorAll('.buckets').forEach(root => {
    const nums0 = (json(root, 'nums') || [3, 1, 1, 2, 2, 3, 4, 1]).join(', ');
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Частоты и вёдра')}</b><span>впишите числа и k</span></div>
      <div class="widget__body">
        <label class="hx-field"><span>nums =</span><input class="hx-input bk-nums" value="${esc(nums0)}"></label>
        <label class="hx-field"><span>k =</span><input class="hx-input bk-k" inputmode="numeric" value="${esc(root.dataset.k || 2)}" style="max-width:90px"></label>
        <h4 class="bk-h">Частотный словарь <code>count</code></h4>
        <div class="so-chips bk-count"></div>
        <h4 class="bk-h">Вёдра: частота → числа</h4>
        <div class="bk-rows"></div>
        <div class="legend"><span><i class="l-hit"></i>попало в ответ</span><span><i class="l-probe"></i>не вошло: ответ уже из k чисел</span></div>
      </div>
      <div class="widget__foot hx-note"></div>`;
    const draw = () => {
      const raw = root.querySelector('.bk-nums').value.split(',').map(v => v.trim()).filter(Boolean);
      const k = readInt(root.querySelector('.bk-k').value);
      const nums = raw.map(readInt);
      const note = root.querySelector('.hx-note');
      if (nums.some(v => v === null) || k === null || k < 1) { note.innerHTML = '<span class="hx-err">Впишите целые числа через запятую и k ≥ 1.</span>'; return; }
      const count = new Map();
      nums.forEach(x => count.set(x, (count.get(x) || 0) + 1));
      root.querySelector('.bk-count').innerHTML = [...count].map(([x, c]) => `<span class="so-chip">${x}: ${c}</span>`).join('') || '<span class="so-empty">пустой словарь</span>';
      const result = [], rows = [];
      for (let c = nums.length; c >= 1; c--) {
        const inB = [...count].filter(([, cc]) => cc === c).map(([x]) => x);
        if (!inB.length) continue;
        const chips = inB.map(x => { const take = result.length < k; if (take) result.push(x); return `<span class="so-chip ${take ? 'so-both' : 'bk-off'}">${x}</span>`; });
        rows.push(`<div class="so-row"><span class="so-name">частота ${c}</span><div class="so-chips">${chips.join('')}</div></div>`);
      }
      root.querySelector('.bk-rows').innerHTML = rows.join('') || '<span class="so-empty">вёдер нет</span>';
      note.innerHTML = `${count.size} ${plural(count.size, 'разное число', 'разных числа', 'разных чисел')}. Вёдра просматриваются от большей частоты к меньшей, ответ: <code>[${result.join(', ')}]</code>.`
        + (count.size < k ? ` Разных чисел меньше k, поэтому в ответе все ${count.size}.` : '')
        + ' Числа с одинаковой частотой стоят в ведре в порядке первого появления.';
    };
    root.querySelectorAll('.hx-input').forEach(i => i.addEventListener('input', draw));
    draw();
  });
})();
