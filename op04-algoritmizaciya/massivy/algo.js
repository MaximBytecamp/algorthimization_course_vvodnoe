/* ОП.04 «Алгоритмы на массивах» — интерактивные блоки модулей.
   Каждый блок находится по классу и берёт данные из data-атрибутов.
   Пошаговые прогоны читают window.TRACES из traces.js модуля: кадры
   в нём получены настоящим запуском Python, здесь они только проигрываются. */
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const fmt = n => n.toLocaleString('ru-RU');
  const json = (node, name) => { try { return JSON.parse(node.dataset[name]); } catch (_) { return null; } };

  /* Лента ячеек: общая для прогона и ручных упражнений. */
  function drawCells(box, values, opts = {}) {
    const tags = opts.tags || {};
    box.innerHTML = '';
    values.forEach((v, k) => {
      const cell = el('div', 'cell');
      (opts.cls && opts.cls(k)) && cell.classList.add(...opts.cls(k).split(' ').filter(Boolean));
      if (opts.flash && opts.flash.has(k)) cell.classList.add('is-flash');
      const shown = typeof v === 'string' ? `'${esc(v)}'` : esc(v);
      const t = (tags[k] || []).map(p => `<span class="tag tag--${p}">${p}</span>`).join('');
      cell.innerHTML = `<span class="cell__idx">${k}</span><span class="cell__val">${shown}</span><span class="cell__tags">${t}</span>`;
      box.appendChild(cell);
    });
    if (opts.tailTags && opts.tailTags.length) {
      const cell = el('div', 'cell');
      cell.innerHTML = `<span class="cell__idx">${values.length}</span><span class="cell__val" style="border-style:dashed;opacity:.5">·</span><span class="cell__tags">${opts.tailTags.map(p => `<span class="tag tag--${p}">${p}</span>`).join('')}</span>`;
      box.appendChild(cell);
    }
  }

  /* ── 1. Пошаговый прогон ──────────────────────────────────────── */
  /* data-trace — ключ в window.TRACES, data-zone — как красить ячейки:
     between — вне [i, j] бледно; rw — [0, w) готово, [w, r) мусор;
     compress — то же, что rw, но граница чтения — start. */
  document.querySelectorAll('.tracer[data-trace]').forEach(root => {
    const t = (window.TRACES || {})[root.dataset.trace];
    if (!t) { root.innerHTML = '<p style="padding:14px">Прогон не загружен.</p>'; return; }
    const zone = root.dataset.zone || '';
    const title = root.dataset.title || 'Пошаговый прогон';
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(title)}</b><span>${esc(t.call)}</span></div>
      <div class="tracer__bar"><span></span></div>
      <div class="tracer__grid">
        <div class="tracer__code"></div>
        <div class="tracer__state">
          <span class="tracer__label">список ${esc(t.arr_name)}</span>
          <div class="cells"></div>
          <table class="tracer__vars"><tbody></tbody></table>
        </div>
      </div>
      <div class="tracer__say" aria-live="polite"></div>
      <div class="tracer__ctrl">
        <div class="btnrow">
          <button class="btn" data-act="first" title="В начало">⏮</button>
          <button class="btn" data-act="back">← шаг</button>
          <button class="btn btn--main" data-act="next">шаг →</button>
          <button class="btn" data-act="play">▶ до конца</button>
        </div>
        <span class="tracer__count"></span>
      </div>
      <div class="tracer__result" hidden></div>`;
    const codeBox = root.querySelector('.tracer__code');
    codeBox.innerHTML = t.code.map((line, k) => `<div><i>${k + 1}</i>${esc(line)}</div>`).join('');
    const lines = [...codeBox.children];
    const cells = root.querySelector('.cells');
    const vars = root.querySelector('.tracer__vars tbody');
    const say = root.querySelector('.tracer__say');
    const count = root.querySelector('.tracer__count');
    const bar = root.querySelector('.tracer__bar span');
    const result = root.querySelector('.tracer__result');
    const btn = a => root.querySelector(`[data-act="${a}"]`);
    let at = 0, timer = null;
    const N = t.frames.length;

    const num = (f, name) => (f.vars[name] !== undefined && /^-?\d+$/.test(f.vars[name])) ? Number(f.vars[name]) : null;

    function show() {
      const f = t.frames[at];
      const prev = at > 0 ? t.frames[at - 1] : null;
      lines.forEach((ln, k) => ln.className = k + 1 === f.ln ? (f.ev === 'return' ? 'is-ret' : 'is-now') : '');
      const cur = lines[f.ln - 1];
      if (cur && codeBox.scrollHeight > codeBox.clientHeight) cur.scrollIntoView({ block: 'nearest' });
      const arr = f.arr || [];
      const tags = {}; const tail = [];
      t.ptrs.forEach(p => {
        const v = num(f, p);
        if (v === null) return;
        if (v >= 0 && v < arr.length) (tags[v] = tags[v] || []).push(p);
        else if (v === arr.length) tail.push(p);
      });
      const i = num(f, 'i'), j = num(f, 'j'), w = num(f, 'w');
      const r = zone === 'compress' ? num(f, 'start') : num(f, 'r');
      const flash = new Set();
      if (prev && prev.arr) arr.forEach((v, k) => { if (prev.arr[k] !== v) flash.add(k); });
      drawCells(cells, arr, {
        tags, tailTags: tail, flash,
        cls: k => {
          if (zone === 'between' && i !== null && j !== null) return (k < i || k > j) ? 'is-out' : '';
          if ((zone === 'rw' || zone === 'compress') && w !== null) {
            if (k < w) return 'is-done';
            if (r !== null && k < r) return 'is-junk';
          }
          if (zone === 'colors') {
            const lo = num(f, 'low'), hi = num(f, 'high');
            if (lo !== null && hi !== null && (k < lo || k > hi)) return 'is-done';
          }
          if (zone === 'split' && i !== null && j !== null) {
            if (k < i || k > j) return 'is-done';
          }
          return '';
        }
      });
      vars.innerHTML = Object.entries(f.vars).map(([k, v]) => {
        const changed = prev && prev.vars[k] !== v;
        return `<tr class="${changed ? 'is-changed' : ''}"><td>${esc(k)}</td><td>${esc(v)}</td></tr>`;
      }).join('') || '<tr><td colspan="2" style="color:var(--ink-faint)">переменных пока нет</td></tr>';
      say.innerHTML = `<b>строка ${f.ln}</b>${esc(f.say)}`;
      count.textContent = `шаг ${at + 1} из ${N}`;
      bar.style.width = `${((at + 1) / N) * 100}%`;
      btn('first').disabled = btn('back').disabled = at === 0;
      btn('next').disabled = at === N - 1;
      if (at === N - 1) {
        result.hidden = false;
        result.textContent = `Функция вернула ${t.result}. Список после вызова: ${t.after}`;
      } else result.hidden = true;
    }
    const stop = () => { if (timer) { clearInterval(timer); timer = null; btn('play').textContent = '▶ до конца'; } };
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'play') {
        if (timer) { stop(); return; }
        if (at === N - 1) at = 0;
        b.textContent = '⏸ пауза';
        timer = setInterval(() => { if (at >= N - 1) { stop(); return; } at++; show(); }, 900);
        show(); return;
      }
      stop();
      if (a === 'first') at = 0;
      if (a === 'back') at = Math.max(0, at - 1);
      if (a === 'next') at = Math.min(N - 1, at + 1);
      show();
    });
    root.tabIndex = 0;
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); at = Math.min(N - 1, at + 1); show(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); at = Math.max(0, at - 1); show(); }
    });
    if (root.classList.contains('tracer--bug')) root.querySelector('.widget__head b').insertAdjacentHTML('afterbegin', '');
    show();
  });

  /* ── 2. Вопрос с разбором ответов ─────────────────────────────── */
  document.querySelectorAll('.quiz').forEach(q => {
    const items = [...q.querySelectorAll('.quiz__opts li')];
    const again = el('button', 'btn quiz__again', '↻ ответить заново');
    again.type = 'button'; again.hidden = true;
    q.appendChild(again);
    items.forEach((li, k) => {
      const b = li.querySelector('button');
      b.type = 'button';
      b.dataset.letter = 'АБВГДЕЖ'[k] + ')';
      b.addEventListener('click', () => {
        items.forEach(x => { x.querySelector('button').disabled = true; });
        li.classList.add('is-shown', 'data-ok' in li.dataset || li.hasAttribute('data-ok') ? 'is-ok' : 'is-no');
        items.forEach(x => { if (x.hasAttribute('data-ok')) x.classList.add('is-ok', 'is-shown'); });
        again.hidden = false;
      });
    });
    again.addEventListener('click', () => {
      items.forEach(x => { x.className = ''; x.querySelector('button').disabled = false; });
      again.hidden = true;
    });
  });

  /* ── 3. Разговор с интервьюером ───────────────────────────────── */
  /* Кнопка-вопрос несёт ответ (data-answer), уточнение условия (data-fact)
     и то, что меняется в коде (data-code). */
  document.querySelectorAll('.ask').forEach(root => {
    const facts = root.querySelector('.ask__facts');
    const log = root.querySelector('.ask__log');
    const qs = [...root.querySelectorAll('.ask__qs button')];
    const counter = root.querySelector('.ask__count');
    const upd = () => { if (counter) counter.textContent = `задано ${qs.filter(b => b.disabled).length} из ${qs.length}`; };
    qs.forEach(b => {
      b.type = 'button';
      b.addEventListener('click', () => {
        b.disabled = true;
        log.prepend(el('div', 'ask__msg ask__msg--code', `<b>что это меняет в решении</b>${b.dataset.code}`));
        log.prepend(el('div', 'ask__msg ask__msg--they', `<b>интервьюер</b>${b.dataset.answer}`));
        log.prepend(el('div', 'ask__msg ask__msg--me', `<b>кандидат</b>${b.innerHTML}`));
        facts.appendChild(el('li', '', b.dataset.fact));
        upd();
      });
    });
    upd();
  });

  /* ── 4. Поиск пары вручную ────────────────────────────────────── */
  /* Студент сам двигает i и j. Неверный ход не выполняется: вместо него
     объясняется, какая пара при таком ходе была бы потеряна. */
  document.querySelectorAll('.hunt').forEach(root => {
    const sets = json(root, 'sets') || [];
    let set = 0, a, t, i, j, steps, mistakes, done;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Найдите пару вручную</b><span class="hunt__title"></span></div>
      <div class="widget__body">
        <div class="cells"></div>
        <div class="hunt__sum"></div>
        <div class="btnrow">
          <button class="btn" data-act="i">i → вправо</button>
          <button class="btn" data-act="j">← j влево</button>
          <button class="btn btn--main" data-act="found">Пара найдена</button>
          <button class="btn" data-act="none">Пары нет</button>
          <span style="flex:1"></span>
          <button class="btn" data-act="reset">↻ заново</button>
          <button class="btn" data-act="nextset">другой пример →</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="hunt__stats"></div>
      </div>`;
    const cells = root.querySelector('.cells');
    const sum = root.querySelector('.hunt__sum');
    const msg = root.querySelector('.hunt__msg');
    const stats = root.querySelector('.hunt__stats');
    const say = (text, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = text; };

    function load(k) {
      set = k; a = sets[k].a; t = sets[k].t; i = 0; j = a.length - 1; steps = 0; mistakes = 0; done = false;
      root.querySelector('.hunt__title').textContent = `пример ${k + 1} из ${sets.length} · цель ${fmt(t)}`;
      say(`Цены отсортированы по возрастанию. Нужны две разные цены с суммой ${fmt(t)}. Указатели стоят по краям: i на самой дешёвой, j на самой дорогой. Сравните сумму с целью и сдвиньте один указатель.`);
      draw();
    }
    function draw() {
      const tags = {}; (tags[i] = tags[i] || []).push('i'); (tags[j] = tags[j] || []).push('j');
      drawCells(cells, a, { tags, cls: k => (k < i || k > j) ? 'is-out' : (done && (k === i || k === j) && a[i] + a[j] === t ? 'is-done' : '') });
      if (i < j) {
        const s = a[i] + a[j];
        const cls = s < t ? 'is-less' : s > t ? 'is-more' : 'is-eq';
        const word = s < t ? 'меньше цели' : s > t ? 'больше цели' : 'равна цели';
        sum.innerHTML = `<span>prices[${i}] + prices[${j}] = ${a[i]} + ${a[j]} = <strong class="${cls}">${a[i] + a[j]}</strong></span><span class="${cls}">${word} ${fmt(t)}</span>`;
      } else sum.innerHTML = `<span>i = ${i}, j = ${j}: указатели встретились, пар между ними не осталось</span>`;
      const total = a.length * (a.length - 1) / 2;
      stats.innerHTML = `<span>ходов: ${steps}</span><span>ошибок: ${mistakes}</span><span>перебор проверил бы до ${total} пар</span>`;
      root.querySelector('[data-act="i"]').disabled = root.querySelector('[data-act="j"]').disabled = done || i >= j;
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'reset') return load(set);
      if (act === 'nextset') return load((set + 1) % sets.length);
      if (done) return;
      const s = i < j ? a[i] + a[j] : null;
      if (act === 'i' || act === 'j') {
        if (s === t) { mistakes++; say(`Сумма ${s} уже равна цели. Двигать указатели не нужно — нажмите «Пара найдена».`, 'no'); return draw(); }
        if (act === 'i' && s > t) {
          mistakes++;
          say(`Сумма ${s} больше цели. Если сдвинуть i вправо, левая цена станет дороже, и сумма вырастет ещё сильнее. Уменьшить сумму можно только ходом j влево.`, 'no');
          return draw();
        }
        if (act === 'j' && s < t) {
          mistakes++;
          say(`Сумма ${s} меньше цели. Если сдвинуть j влево, правая цена станет дешевле, и сумма уменьшится. Увеличить сумму можно только ходом i вправо.`, 'no');
          return draw();
        }
        steps++;
        if (act === 'i') {
          say(`Верно. Цена ${a[i]} даже с самой дорогой из оставшихся (${a[j]}) даёт меньше цели, поэтому пары с ней нет. i сдвигается: ${i} → ${i + 1}.`);
          i++;
        } else {
          say(`Верно. Цена ${a[j]} даже с самой дешёвой из оставшихся (${a[i]}) даёт больше цели, поэтому пары с ней нет. j сдвигается: ${j} → ${j - 1}.`);
          j--;
        }
        return draw();
      }
      if (act === 'found') {
        if (s === t) {
          done = true;
          say(`Готово: prices[${i}] + prices[${j}] = ${a[i]} + ${a[j]} = ${t}. Ответ (${i}, ${j}), ходов ${steps}. Перебор проверил бы до ${a.length * (a.length - 1) / 2} пар.`, 'ok');
        } else { mistakes++; say(i < j ? `Сумма ${s}, а нужна ${t}: это ещё не пара.` : 'Указатели встретились: пары с такой суммой в списке нет.', 'no'); }
        return draw();
      }
      if (act === 'none') {
        if (i >= j) { done = true; say(`Верно: указатели встретились, каждую цену исключили с объяснением. Пары с суммой ${t} нет, функция вернёт None. Ходов: ${steps}.`, 'ok'); }
        else { mistakes++; say(`Между i и j ещё есть непроверенные цены (с ${i} по ${j}). Пока указатели не встретились, отвечать «пары нет» рано.`, 'no'); }
        return draw();
      }
    });
    load(0);
  });

  /* ── 5. Таблица всех пар ──────────────────────────────────────── */
  /* Строка — левая цена prices[i], столбец — правая prices[j]. Каждый ход
     указателей вычёркивает целую строку или целый столбец таблицы. */
  document.querySelectorAll('.pgrid').forEach(root => {
    const a = json(root, 'a'); const t = Number(root.dataset.t); const n = a.length;
    const colored = root.dataset.color !== 'off';
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Все пары prices[i] + prices[j]</b><span>цель ${fmt(t)}</span></div>
      <div class="widget__body">
        <div class="pgrid__wrap"><table></table></div>
        <div class="pgrid__info"></div>
        <div class="btnrow">
          <button class="btn btn--main" data-act="step">ход указателей →</button>
          <button class="btn" data-act="brute">▶ перебор по порядку</button>
          <button class="btn" data-act="reset">↻ сначала</button>
        </div>
        <div class="legend"><span><i class="l-less"></i>сумма меньше цели</span><span><i class="l-more"></i>сумма больше цели</span><span><i class="l-eq"></i>сумма равна цели</span></div>
      </div>`;
    const table = root.querySelector('table');
    let head = '<tr><th></th>' + a.map((v, k) => `<th>j=${k}<br>${v}</th>`).join('') + '</tr>';
    let body = a.map((vi, r) => '<tr><th>i=' + r + '<br>' + vi + '</th>' + a.map((vj, c) => {
      if (c <= r) return '<td class="is-none"></td>';
      const s = vi + vj;
      const cls = !colored ? 'is-plain' : s < t ? 'is-less' : s > t ? 'is-more' : 'is-eq';
      return `<td class="${cls}" data-r="${r}" data-c="${c}">${s}</td>`;
    }).join('') + '</tr>').join('');
    table.innerHTML = head + body;
    const cell = (r, c) => table.querySelector(`td[data-r="${r}"][data-c="${c}"]`);
    const info = root.querySelector('.pgrid__info');
    let i, j, moves, found, timer;
    const total = n * (n - 1) / 2;
    const live = () => [...table.querySelectorAll('td[data-r]')].filter(td => !td.classList.contains('is-cut')).length;
    function reset() {
      clearInterval(timer); timer = null;
      table.querySelectorAll('td').forEach(td => td.classList.remove('is-cut', 'is-cur', 'is-seen'));
      i = 0; j = n - 1; moves = 0; found = false;
      cell(i, j) && cell(i, j).classList.add('is-cur');
      info.innerHTML = `<span>i = ${i}, j = ${j}</span><span>ходов: 0</span><span>пар под подозрением: ${total} из ${total}</span>`;
    }
    function step() {
      if (found || i >= j) return;
      const s = a[i] + a[j];
      const c = cell(i, j); c.classList.remove('is-cur');
      if (s === t) { found = true; c.classList.add('is-cur'); info.innerHTML = `<span>Пара найдена: (${i}, ${j}), ${a[i]} + ${a[j]} = ${t}</span><span>ходов: ${moves}</span><span>клеток открыто указателями: ${moves + 1} из ${total}</span>`; return; }
      if (s < t) { for (let c2 = i + 1; c2 < n; c2++) cell(i, c2) && cell(i, c2).classList.add('is-cut'); i++; }
      else { for (let r2 = 0; r2 < j; r2++) cell(r2, j) && cell(r2, j).classList.add('is-cut'); j--; }
      moves++;
      if (i < j) cell(i, j).classList.add('is-cur');
      const why = s < t ? `строка i = ${i - 1} вычеркнута: ${a[i - 1]} + ${s - a[i - 1]} = ${s} < ${t}, а остальные суммы в строке ещё меньше` : `столбец j = ${j + 1} вычеркнут: ${s - a[j + 1]} + ${a[j + 1]} = ${s} > ${t}, а остальные суммы в столбце ещё больше`;
      info.innerHTML = `<span>${why}</span><span>ходов: ${moves}</span><span>пар под подозрением: ${live()} из ${total}</span>` + (i >= j ? '<span>указатели встретились: пары нет</span>' : '');
    }
    function brute() {
      reset(); table.querySelector('.is-cur') && table.querySelector('.is-cur').classList.remove('is-cur');
      const order = []; for (let r = 0; r < n; r++) for (let c = r + 1; c < n; c++) order.push([r, c]);
      let k = 0;
      timer = setInterval(() => {
        if (k >= order.length) { clearInterval(timer); timer = null; return; }
        const [r, c] = order[k++]; const td = cell(r, c); td.classList.add('is-seen');
        info.innerHTML = `<span>перебор проверяет (${r}, ${c}): ${a[r] + a[c]}</span><span>проверено пар: ${k} из ${total}</span>`;
        if (a[r] + a[c] === t) { clearInterval(timer); timer = null; info.innerHTML += `<span>найдена на ${k}-й проверке</span>`; }
      }, 260);
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'step') { if (timer) reset(); step(); }
      if (b.dataset.act === 'reset') reset();
      if (b.dataset.act === 'brute') brute();
    });
    reset();
  });

  /* ── 6. Счётчик сравнений ─────────────────────────────────────── */
  /* Время — оценка по замеру из модуля 8: 21,8 нс на пару у перебора
     и 33,6 нс на шаг у указателей (Python 3.12, Apple M4). */
  document.querySelectorAll('.race').forEach(root => {
    const perPair = 21.8e-9, perStep = 33.6e-9;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Сколько проверок нужно в худшем случае</b><span>пары нет, просмотрен весь список</span></div>
      <div class="widget__body">
        <label>Длина списка n: <span class="race__n"></span></label>
        <input type="range" min="1" max="6" step="0.01" value="3">
        <div class="race__rows">
          <div class="race__row race__row--slow"><div><b>перебор всех пар</b><small>n·(n − 1) / 2 проверок</small></div><div class="race__bar"><span></span><em></em></div></div>
          <div class="race__row"><div><b>два указателя</b><small>не больше n − 1 шагов</small></div><div class="race__bar"><span></span><em></em></div></div>
        </div>
      </div>
      <div class="widget__foot"></div>`;
    const input = root.querySelector('input');
    const [slow, fast] = root.querySelectorAll('.race__bar');
    const human = sec => sec < 1e-3 ? `${(sec * 1e6).toFixed(0)} мкс` : sec < 1 ? `${(sec * 1e3).toFixed(1)} мс` : sec < 120 ? `${sec.toFixed(1)} с` : sec < 7200 ? `${(sec / 60).toFixed(0)} мин` : sec < 172800 ? `${(sec / 3600).toFixed(1)} ч` : `${(sec / 86400).toFixed(0)} сут`;
    function upd() {
      const n = Math.round(10 ** Number(input.value));
      const b = n * (n - 1) / 2, p = Math.max(n - 1, 0);
      root.querySelector('.race__n').textContent = fmt(n);
      const scale = Math.log10(Math.max(b, 10) + 1);
      const wid = x => `${Math.max(1.5, (Math.log10(x + 1) / scale) * 100)}%`;
      slow.querySelector('span').style.width = wid(b);
      fast.querySelector('span').style.width = wid(p);
      slow.querySelector('em').textContent = `${fmt(b)} проверок · около ${human(b * perPair)}`;
      fast.querySelector('em').textContent = `${fmt(p)} шагов · около ${human(p * perStep)}`;
      root.querySelector('.widget__foot').innerHTML = `При n = ${fmt(n)} перебор делает в ${fmt(Math.round(b / Math.max(p, 1)))} раз больше проверок. Длина полосы — в логарифмическом масштабе: каждая метка шкалы в 10 раз больше предыдущей. Время — оценка по замеру на Python 3.12, Apple M4.`;
    }
    input.addEventListener('input', upd); upd();
  });

  /* ── 7. Сборка кода из строк ──────────────────────────────────── */
  document.querySelectorAll('.parsons').forEach(root => {
    const right = json(root, 'lines') || [];
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let order = right.map((_, k) => k);
    do { order.sort(() => rnd() - .5); } while (order.every((v, k) => v === k) && right.length > 1);
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Соберите функцию из строк')}</b><span>стрелки или перетаскивание</span></div>
      <div class="widget__body">
        <ol class="parsons__list"></ol>
        <div class="btnrow" style="margin-top:12px">
          <button class="btn btn--main" data-act="check">Проверить порядок</button>
          <button class="btn" data-act="show">Показать ответ</button>
          <button class="btn" data-act="mix">↻ перемешать</button>
        </div>
        <p class="parsons__msg" aria-live="polite"></p>
      </div>`;
    const list = root.querySelector('.parsons__list');
    const msg = root.querySelector('.parsons__msg');
    let drag = null;
    function draw() {
      list.innerHTML = '';
      order.forEach((k, pos) => {
        const li = el('li', '', `<code>${esc(right[k])}</code><button type="button" data-mv="-1" aria-label="выше">↑</button><button type="button" data-mv="1" aria-label="ниже">↓</button>`);
        li.draggable = true; li.dataset.pos = pos;
        li.addEventListener('dragstart', () => { drag = pos; li.classList.add('is-drag'); });
        li.addEventListener('dragend', () => li.classList.remove('is-drag'));
        li.addEventListener('dragover', e => e.preventDefault());
        li.addEventListener('drop', e => { e.preventDefault(); if (drag === null) return; const [x] = order.splice(drag, 1); order.splice(pos, 0, x); drag = null; draw(); });
        list.appendChild(li);
      });
    }
    list.addEventListener('click', e => {
      const b = e.target.closest('[data-mv]'); if (!b) return;
      const pos = Number(b.closest('li').dataset.pos), to = pos + Number(b.dataset.mv);
      if (to < 0 || to >= order.length) return;
      [order[pos], order[to]] = [order[to], order[pos]]; msg.textContent = ''; draw();
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'check') {
        const items = [...list.children]; let ok = 0;
        items.forEach((li, pos) => { const good = right[order[pos]] === right[pos]; li.classList.toggle('is-ok', good); li.classList.toggle('is-no', !good); ok += good; });
        msg.textContent = ok === right.length ? 'Порядок верный: функция собрана.' : `На своих местах ${ok} строк из ${right.length}. Красные строки стоят не там.`;
      }
      if (b.dataset.act === 'show') { order = right.map((_, k) => k); draw(); msg.textContent = 'Показан верный порядок.'; }
      if (b.dataset.act === 'mix') { order.sort(() => rnd() - .5); msg.textContent = ''; draw(); }
    });
    draw();
  });

  /* ── 8. График замеров ────────────────────────────────────────── */
  /* data-series: [{name, color, pts: [[n, ms], ...]}]. Оси логарифмические. */
  document.querySelectorAll('.bench').forEach(root => {
    const series = json(root, 'series') || [];
    root.classList.add('widget');
    const W = 760, H = 380, L = 70, R = 46, T = 20, B = 50;
    const xs = series.flatMap(s => s.pts.map(p => p[0])), ys = series.flatMap(s => s.pts.map(p => p[1]));
    const x0 = Math.floor(Math.log10(Math.min(...xs))), x1 = Math.ceil(Math.log10(Math.max(...xs)));
    const y0 = Math.floor(Math.log10(Math.min(...ys))), y1 = Math.ceil(Math.log10(Math.max(...ys)));
    const X = v => L + (Math.log10(v) - x0) / (x1 - x0) * (W - L - R);
    const Y = v => H - B - (Math.log10(v) - y0) / (y1 - y0) * (H - T - B);
    let g = '';
    for (let e = x0; e <= x1; e++) g += `<line class="gridl" x1="${X(10 ** e)}" x2="${X(10 ** e)}" y1="${T}" y2="${H - B}"/><text x="${X(10 ** e)}" y="${H - B + 20}" text-anchor="middle">${fmt(10 ** e)}</text>`;
    for (let e = y0; e <= y1; e++) g += `<line class="gridl" x1="${L}" x2="${W - R}" y1="${Y(10 ** e)}" y2="${Y(10 ** e)}"/><text x="${L - 8}" y="${Y(10 ** e) + 4}" text-anchor="end">${10 ** e >= 1 ? fmt(10 ** e) : (10 ** e).toFixed(-e)}</text>`;
    const lines = series.map(s => `<polyline class="line" stroke="${s.color}" points="${s.pts.map(p => `${X(p[0])},${Y(p[1])}`).join(' ')}"/>` + s.pts.map(p => `<circle class="dot" fill="${s.color}" cx="${X(p[0])}" cy="${Y(p[1])}" r="5"><title>${s.name}: n = ${fmt(p[0])}, ${p[1]} мс</title></circle>`).join('')).join('');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Замер')}</b><span>обе оси логарифмические</span></div>
      <div class="widget__body">
        <div class="bench__keys">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(root.dataset.title || 'Замер')}">${g}
          <line class="axis" x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}"/><line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H - B}"/>
          <text x="${(W + L) / 2}" y="${H - 8}" text-anchor="middle">длина списка n</text>
          <text x="16" y="${(H - B + T) / 2}" text-anchor="middle" transform="rotate(-90 16 ${(H - B + T) / 2})">время, мс</text>
          ${lines}</svg>
      </div>`;
  });

  /* ── 9. Чтение и запись вручную ───────────────────────────────── */
  /* data-mode: dedup — оставить различные значения отсортированного списка;
     zeros — перенести ненулевые вперёд обменом. Решение на каждом шаге
     принимает студент, неверное не выполняется. */
  document.querySelectorAll('.rwg').forEach(root => {
    const start = json(root, 'a') || [];
    const mode = root.dataset.mode;
    let a, w, r, over, errors;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${mode === 'dedup' ? 'Удалите повторы сами' : 'Перенесите нули в конец сами'}</b><span>r читает, w пишет</span></div>
      <div class="widget__body">
        <div class="cells"></div>
        <p class="rwg__now"></p>
        <div class="btnrow">
          <button class="btn btn--main" data-act="write">${mode === 'dedup' ? 'Новое значение: записать в w' : 'Не ноль: обменять с позицией w'}</button>
          <button class="btn" data-act="skip">${mode === 'dedup' ? 'Повтор: пропустить' : 'Ноль: пропустить'}</button>
          <span style="flex:1"></span>
          <button class="btn" data-act="reset">↻ заново</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="legend"><span><i class="l-done"></i>[0, w) — готово</span><span><i class="l-junk"></i>[w, r) — ${mode === 'dedup' ? 'повторы и старые копии' : 'нули'}</span><span><i></i>[r, n) — ещё не прочитано</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const say = (text, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = text; };
    function reset() {
      a = start.slice(); errors = 0; over = false;
      w = mode === 'dedup' ? (a.length ? 1 : 0) : 0; r = mode === 'dedup' ? 1 : 0;
      say(mode === 'dedup' ? 'Первый элемент остаётся всегда, поэтому w = 1 и r = 1. Для каждого прочитанного элемента решите: это новое значение или повтор последнего записанного?' : 'w = 0 и r = 0. Для каждого прочитанного числа решите: переносить его вперёд или пропустить?');
      draw();
    }
    function draw() {
      const tags = {}; const tail = [];
      const put = (p, v) => { if (v < a.length) (tags[v] = tags[v] || []).push(p); else tail.push(p); };
      put('w', w); if (!over) put('r', r);
      drawCells(cells, a, { tags, tailTags: tail, cls: k => k < w ? 'is-done' : (k < r || over) ? 'is-junk' : '' });
      if (over) { now.innerHTML = ''; }
      else if (mode === 'dedup') now.innerHTML = `Прочитан ids[${r}] = <b>${a[r]}</b>. Последнее записанное значение ids[${w - 1}] = <b>${a[w - 1]}</b>.`;
      else now.innerHTML = `Прочитан nums[${r}] = <b>${a[r]}</b>. Позиция записи w = ${w}.`;
      root.querySelectorAll('[data-act="write"],[data-act="skip"]').forEach(b => b.disabled = over);
    }
    function finish() {
      over = true;
      if (mode === 'dedup') {
        const cut = a.length - w;
        say(`Список прочитан. Осталось обрезать хвост: <code>del ids[${w}:]</code> удалит ${cut} ${cut === 1 ? 'элемент' : 'элемента'}. Результат: [${a.slice(0, w).join(', ')}], функция вернёт ${w}. Ошибок: ${errors}.`, 'ok');
      } else say(`Список прочитан: [${a.join(', ')}]. Ненулевые числа стоят в исходном порядке, нули собраны в конце. Ошибок: ${errors}.`, 'ok');
      draw();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'reset') return reset();
      if (over) return;
      const want = mode === 'dedup' ? a[r] !== a[w - 1] : a[r] !== 0;
      const pick = b.dataset.act === 'write';
      if (pick !== want) {
        errors++;
        if (mode === 'dedup') say(pick ? `${a[r]} совпадает с последним записанным ${a[w - 1]}: это повтор, записывать его нельзя.` : `${a[r]} отличается от последнего записанного ${a[w - 1]}: это новое значение. Список отсортирован, поэтому раньше такого значения не было.`, 'no');
        else say(pick ? 'Это ноль: он должен остаться позади, в зоне нулей.' : `${a[r]} — не ноль: его нужно поставить в позицию w = ${w}.`, 'no');
        return draw();
      }
      if (pick) {
        if (mode === 'dedup') { say(`Записано: ids[${w}] = ${a[r]}, w: ${w} → ${w + 1}.`); a[w] = a[r]; }
        else { say(w === r ? `w = r = ${w}: число уже на месте, w: ${w} → ${w + 1}.` : `Обмен nums[${w}] и nums[${r}]: ${a[r]} уходит вперёд, ноль — на его место. w: ${w} → ${w + 1}.`); [a[w], a[r]] = [a[r], a[w]]; }
        w++;
      } else say(mode === 'dedup' ? `Повтор ${a[r]} пропущен, w не меняется.` : 'Ноль пропущен, w не меняется.');
      r++;
      if (r >= a.length) return finish();
      draw();
    });
    reset();
  });

  /* ── 10. Признаки в условии ───────────────────────────────────── */
  document.querySelectorAll('[data-lit]').forEach(b => {
    const target = document.getElementById(b.dataset.lit);
    if (!target) return;
    b.type = 'button';
    b.addEventListener('click', () => {
      const on = target.classList.toggle('is-lit');
      b.textContent = on ? 'Скрыть признаки' : 'Подсветить признаки';
    });
  });
})();

/* ── 11. Песочница: свой код и тесты прямо на странице ───────────── */
/* Python работает в браузере через Pyodide (Python 3.12). Он загружается
   только по первому нажатию «Запустить», около 10 МБ, и живёт в фоновом
   потоке (Web Worker): бесконечный цикл в коде студента не вешает страницу,
   запуск прерывается через 5 секунд. Тесты — функции test_* с assert,
   как в pytest; их текст лежит в разметке рядом с заготовкой. */
(() => {
  const boxes = document.querySelectorAll('.sandbox');
  if (!boxes.length) return;
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.8/full/';
  const RUNNER = `
import json, io, contextlib, traceback
def _short(e):
    return f"{type(e).__name__}: {e}"
def _run(mode, user, extra):
    ns, out, res = {}, io.StringIO(), []
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(user, "solution.py", "exec"), ns)
    except Exception as e:
        tb = traceback.format_exc(limit=-1).strip().splitlines()
        return json.dumps({"fatal": "\\n".join(l for l in tb[-4:] if not l.startswith("Traceback")), "out": out.getvalue()[-3000:]})
    if mode == "run":
        try:
            with contextlib.redirect_stdout(out):
                exec(compile(extra, "вызов", "exec"), ns)
        except Exception as e:
            return json.dumps({"fatal": _short(e), "out": out.getvalue()[-3000:]})
        return json.dumps({"out": out.getvalue()[-3000:]})
    exec(extra, ns)
    for name, fn in list(ns.items()):
        if not (name.startswith("test_") and callable(fn)):
            continue
        doc = (fn.__doc__ or "").strip()
        try:
            with contextlib.redirect_stdout(out):
                fn()
            res.append([name, True, doc, ""])
        except AssertionError as e:
            res.append([name, False, doc, str(e) or "проверка assert не прошла"])
        except Exception as e:
            res.append([name, False, doc, _short(e)])
    return json.dumps({"results": res, "out": out.getvalue()[-3000:]})
`;
  const workerSrc = `
importScripts('${PYODIDE}pyodide.js');
const ready = loadPyodide({ indexURL: '${PYODIDE}' }).then(async py => { py.runPython(${JSON.stringify(RUNNER)}); return py; });
ready.then(() => postMessage({ ready: true }), e => postMessage({ loadError: String(e) }));
onmessage = async e => {
  const py = await ready;
  py.globals.set('MODE', e.data.mode); py.globals.set('USER', e.data.user); py.globals.set('EXTRA', e.data.extra);
  try { postMessage({ id: e.data.id, data: JSON.parse(py.runPython('_run(MODE, USER, EXTRA)')) }); }
  catch (err) { postMessage({ id: e.data.id, data: { fatal: String(err) } }); }
};`;
  let worker = null, readyPromise = null, seq = 0;
  const status = new Set();
  const setStatus = t => status.forEach(fn => fn(t));
  function boot() {
    if (readyPromise) return readyPromise;
    setStatus('загружается Python — при первом запуске до минуты');
    worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' })));
    readyPromise = new Promise((ok, fail) => {
      worker.addEventListener('message', function first(e) {
        if (e.data.ready) { worker.removeEventListener('message', first); setStatus('Python 3.12 готов'); ok(); }
        if (e.data.loadError) { worker.removeEventListener('message', first); setStatus('Python не загрузился: нужен интернет'); readyPromise = null; fail(e.data.loadError); }
      });
    });
    return readyPromise;
  }
  function call(mode, user, extra, limit = 5000) {
    return boot().then(() => new Promise(resolve => {
      const id = ++seq;
      const timer = setTimeout(() => {
        worker.terminate(); worker = null; readyPromise = null;
        setStatus('запуск прерван, Python будет загружен заново');
        resolve({ fatal: `Код работает дольше ${limit / 1000} секунд и остановлен. Чаще всего это бесконечный цикл: проверьте, что указатели сдвигаются на каждом шаге.` });
      }, limit);
      const onMsg = e => { if (e.data.id !== id) return; clearTimeout(timer); worker.removeEventListener('message', onMsg); resolve(e.data.data); };
      worker.addEventListener('message', onMsg);
      worker.postMessage({ id, mode, user, extra });
    })).catch(err => ({ fatal: 'Python не загрузился. Песочнице нужен интернет: Python скачивается с cdn.jsdelivr.net. ' + err }));
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  boxes.forEach((root, n) => {
    const start = root.querySelector('.sandbox__start').textContent.replace(/^\n/, '').replace(/\s+$/, '') + '\n';
    const tests = root.querySelector('.sandbox__tests').textContent;
    const callText = root.dataset.call || '';
    const key = 'op04-sandbox:' + location.pathname.split('/').pop() + ':' + (root.id || n);
    let saved = null; try { saved = localStorage.getItem(key); } catch (_) {}
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Напишите функцию')}</b><span class="sandbox__status">Python загрузится по кнопке «Запустить»</span></div>
      <div class="sandbox__body">
        <textarea class="sandbox__editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Код функции"></textarea>
        <div class="btnrow">
          <button class="btn btn--main" data-act="test">▶ Запустить тесты</button>
          <button class="btn" data-act="reset">↺ Вернуть заготовку</button>
        </div>
        ${callText ? `<div class="sandbox__call"><span>Свой вызов:</span><input type="text" spellcheck="false" value="${esc(callText)}"><button class="btn" data-act="run">Выполнить</button></div>` : ''}
        <div class="sandbox__out" aria-live="polite"></div>
      </div>`;
    const ed = root.querySelector('textarea'), out = root.querySelector('.sandbox__out'), st = root.querySelector('.sandbox__status');
    ed.value = saved || start;
    const fit = () => { ed.style.height = 'auto'; ed.style.height = Math.max(160, ed.scrollHeight + 6) + 'px'; };
    fit();
    status.add(t => { st.textContent = t; });
    ed.addEventListener('input', () => { fit(); try { localStorage.setItem(key, ed.value); } catch (_) {} });
    ed.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const a = ed.selectionStart, b = ed.selectionEnd;
      ed.value = ed.value.slice(0, a) + '    ' + ed.value.slice(b);
      ed.selectionStart = ed.selectionEnd = a + 4;
    });
    root.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act]'); if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'reset') { ed.value = start; fit(); try { localStorage.removeItem(key); } catch (_) {} out.innerHTML = ''; return; }
      root.querySelectorAll('[data-act]').forEach(b => b.disabled = true);
      out.innerHTML = '<p class="sandbox__wait">выполняется…</p>';
      const extra = act === 'run' ? root.querySelector('.sandbox__call input').value : tests;
      const r = await call(act === 'run' ? 'run' : 'test', ed.value, extra, Number(root.dataset.timeout) || 5000);
      root.querySelectorAll('[data-act]').forEach(b => b.disabled = false);
      let html = '';
      if (r.fatal) html += `<pre class="sandbox__err">${esc(r.fatal)}</pre>`;
      if (r.results) {
        const ok = r.results.filter(x => x[1]).length;
        root.dispatchEvent(new CustomEvent('sandbox:result', { bubbles: true, detail: { ok, total: r.results.length } }));
        html += `<p class="sandbox__sum ${ok === r.results.length ? 'is-ok' : ''}">Прошло тестов: ${ok} из ${r.results.length}</p><ul class="sandbox__list">` +
          r.results.map(([name, pass, doc, msg]) => `<li class="${pass ? 'is-ok' : 'is-no'}"><b>${pass ? '✓' : '✗'} ${esc(name)}</b>${doc ? `<span>${esc(doc)}</span>` : ''}${msg ? `<code>${esc(msg)}</code>` : ''}</li>`).join('') + '</ul>';
      }
      if (r.out) html += `<p class="sandbox__label">вывод print()</p><pre class="sandbox__print">${esc(r.out)}</pre>`;
      if (!html) html = '<p class="sandbox__wait">Код выполнился, вывода нет.</p>';
      out.innerHTML = html;
    });
  });
})();

/* ── 12. Перетаскивание карточек: пропуски в коде и корзины ───────── */
/* .dnd содержит пул .dnd__pool с карточками .chip[data-key] и места:
   .slot[data-accept] — одна карточка, .bin[data-accept] — сколько угодно.
   data-accept — ключи подходящих карточек через пробел. data-mode="copy":
   карточка из пула не исчезает и ставится в несколько мест (метки O(n)).
   Карточку тянут мышью или пальцем, либо касаются карточки, затем места.
   Касание поставленной карточки возвращает её в пул. Разбор берётся из
   data-why у мест (.slot) или у карточек (в корзинах). Итог — событие dnd:result. */
(() => {
  const roots = document.querySelectorAll('.dnd');
  if (!roots.length) return;
  roots.forEach(root => {
    const pool = root.querySelector('.dnd__pool');
    const copy = root.dataset.mode === 'copy';
    const slots = [...root.querySelectorAll('.slot')];
    const bins = [...root.querySelectorAll('.bin')];
    const chips0 = [...pool.querySelectorAll('.chip')];
    const home = new Map(chips0.map((c, k) => [c, k]));
    let picked = null, locked = false, reported = false;

    const row = document.createElement('div');
    row.className = 'btnrow dnd__btns';
    row.innerHTML = '<button class="btn btn--main" type="button" data-act="check">Проверить</button><button class="btn" type="button" data-act="reset">↺ Начать заново</button>';
    const msg = document.createElement('p'); msg.className = 'dnd__msg'; msg.hidden = true;
    const why = document.createElement('ol'); why.className = 'dnd__why'; why.hidden = true;
    root.append(row, msg, why);

    const back = chip => {
      if (copy) { chip.remove(); return; }
      const k = home.get(chip);
      const after = [...pool.children].find(c => home.get(c) > k);
      pool.insertBefore(chip, after || null);
    };
    const unpick = () => { if (picked) picked.classList.remove('is-picked'); picked = null; root.classList.remove('is-picking'); };
    function place(chip, target) {
      if (!target || locked) return;
      if (target === pool) { if (chip.parentElement !== pool) back(chip); return; }
      let c = chip;
      if (copy && chip.parentElement === pool) { c = chip.cloneNode(true); c.classList.remove('is-picked', 'is-drag'); home.set(c, -1); }
      if (target.classList.contains('slot')) {
        const old = target.querySelector('.chip');
        if (old && old !== c) back(old);
        target.appendChild(c);
      } else {
        (target.querySelector('.bin__drop') || target).appendChild(c);
      }
      root.classList.toggle('has-placed', true);
    }
    const targetAt = (x, y) => {
      const t = document.elementFromPoint(x, y);
      const hit = t && t.closest('.slot, .bin, .dnd__pool');
      return hit && root.contains(hit) ? hit : null;
    };

    root.addEventListener('pointerdown', e => {
      const chip = e.target.closest('.chip');
      if (!chip || locked || !root.contains(chip) || e.button > 0) return;
      const sx = e.clientX, sy = e.clientY;
      let ghost = null;
      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
        if (!ghost) {
          ghost = chip.cloneNode(true);
          ghost.className = 'chip chip--ghost';
          document.body.appendChild(ghost);
          chip.classList.add('is-drag');
          unpick();
        }
        ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
        root.querySelectorAll('.is-over').forEach(x => x.classList.remove('is-over'));
        const t = targetAt(ev.clientX, ev.clientY); if (t) t.classList.add('is-over');
        ev.preventDefault();
      };
      const up = ev => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        root.querySelectorAll('.is-over').forEach(x => x.classList.remove('is-over'));
        if (ghost) {
          ghost.remove(); chip.classList.remove('is-drag');
          place(chip, targetAt(ev.clientX, ev.clientY));
          return;
        }
        // касание без движения
        if (chip.parentElement !== pool) { back(chip); unpick(); return; }
        if (picked === chip) { unpick(); return; }
        unpick(); picked = chip; chip.classList.add('is-picked'); root.classList.add('is-picking');
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
    root.addEventListener('click', e => {
      if (!picked || locked || e.target.closest('.chip')) return;
      const t = e.target.closest('.slot, .bin');
      if (t && root.contains(t)) { place(picked, t); unpick(); }
    });

    row.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'reset') {
        locked = false; root.classList.remove('is-checked');
        root.querySelectorAll('.slot .chip, .bin .chip').forEach(back);
        root.querySelectorAll('.is-ok, .is-no').forEach(x => x.classList.remove('is-ok', 'is-no'));
        msg.hidden = true; why.hidden = true; why.innerHTML = '';
        row.querySelector('[data-act="check"]').disabled = false;
        return;
      }
      if (act !== 'check') return;
      locked = true; unpick(); root.classList.add('is-checked');
      row.querySelector('[data-act="check"]').disabled = true;
      let ok = 0, total = 0;
      const items = [];
      const accepts = t => (t.dataset.accept || '').split(/\s+/).filter(Boolean);
      if (slots.length) {
        slots.forEach((s, k) => {
          const c = s.querySelector('.chip');
          const good = !!c && accepts(s).includes(c.dataset.key);
          total++; ok += good;
          s.classList.add(good ? 'is-ok' : 'is-no');
          if (s.dataset.why) items.push([good, (s.dataset.label || `Место ${k + 1}`), s.dataset.why]);
        });
      } else {
        chips0.forEach(c => {
          const bin = c.closest('.bin');
          const good = !!bin && accepts(bin).includes(c.dataset.key);
          const right = bins.find(b => accepts(b).includes(c.dataset.key));
          total++; ok += good;
          c.classList.add(good ? 'is-ok' : 'is-no');
          items.push([good, c.dataset.label || c.textContent.trim(), (right ? `Нужно: ${right.dataset.name || ''}. ` : '') + (c.dataset.why || '')]);
        });
      }
      msg.hidden = false;
      msg.className = 'dnd__msg' + (ok === total ? ' is-ok' : '');
      msg.textContent = `Верно: ${ok} из ${total}.`;
      why.innerHTML = items.map(([g, h, t]) => `<li class="${g ? 'is-ok' : 'is-no'}"><b>${h}</b>${t}</li>`).join('');
      why.hidden = !items.length;
      if (!reported) { reported = true; root.dispatchEvent(new CustomEvent('dnd:result', { bubbles: true, detail: { ok, total } })); }
    });
  });
})();

/* ── 13. Строка с ошибкой: щёлкнуть строку кода и проверить ─────── */
/* .bugline__code состоит из .ln; у ошибочных строк data-bad. После проверки
   открываются .bugline__why и исправление. Итог — событие bugline:result. */
(() => {
  document.querySelectorAll('.bugline').forEach(root => {
    const lines = [...root.querySelectorAll('.ln')];
    const btn = root.querySelector('[data-act="check"]');
    const out = root.querySelector('.bugline__why');
    let sel = null, done = false, reported = false;
    lines.forEach(ln => {
      ln.tabIndex = 0;
      const pick = () => { if (done) return; lines.forEach(x => x.classList.remove('is-sel')); ln.classList.add('is-sel'); sel = ln; btn.disabled = false; };
      ln.addEventListener('click', pick);
      ln.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    btn.disabled = true;
    btn.addEventListener('click', () => {
      if (!sel) return;
      done = true; btn.disabled = true; root.classList.add('is-checked');
      const ok = sel.hasAttribute('data-bad');
      lines.forEach(x => { if (x.hasAttribute('data-bad')) x.classList.add('is-bad'); });
      if (!ok) sel.classList.add('is-wrong');
      out.hidden = false;
      out.querySelector('.bugline__verdict').textContent = ok ? 'Верно, ошибка в этой строке.' : 'Ошибка в другой строке, она подсвечена красным.';
      out.classList.toggle('is-ok', ok);
      if (!reported) { reported = true; root.dispatchEvent(new CustomEvent('bugline:result', { bubbles: true, detail: { ok } })); }
    });
  });
})();
