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
      const shown = typeof v === 'string' ? `'${esc(v)}'` : Array.isArray(v) ? esc(JSON.stringify(v).replace(/,/g, ', ')) : esc(v);
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

  /* Интервалы модуля 12 на оси времени: каждый интервал — полоса на своей дорожке.
     lanes — [{name, bars: [{s, e, cls}]}], lo и hi — края оси.
     Функции объявлены через function: прогон вызывает их раньше, чем
     выполняются константы из разделов ниже. */
  function ivSvg(lanes, lo, hi) {
    const W = 760, L = 112, R = 18, RH = 30, TOP = 6;
    const H = TOP + lanes.length * RH + 30;
    const X = v => L + (v - lo) / Math.max(1, hi - lo) * (W - L - R);
    const step = hi - lo <= 24 ? 1 : hi - lo <= 60 ? 5 : 10;
    let g = '';
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      g += `<line class="iv-grid" x1="${X(v)}" x2="${X(v)}" y1="${TOP}" y2="${H - 24}"/>`;
      g += `<text x="${X(v)}" y="${H - 8}" text-anchor="middle">${v}</text>`;
    }
    g += `<line class="tl-axis" x1="${L}" x2="${W - R}" y1="${H - 24}" y2="${H - 24}"/>`;
    lanes.forEach((lane, k) => {
      const y = TOP + k * RH;
      g += `<text class="iv-name" x="${L - 10}" y="${y + 19}" text-anchor="end">${esc(lane.name)}</text>`;
      lane.bars.forEach(b => {
        const x1 = X(b.s), x2 = X(b.e), w = Math.max(3, x2 - x1);
        const txt = b.txt || `[${b.s}, ${b.e})`;
        g += `<rect class="iv-bar ${b.cls || ''}" x="${x1}" y="${y + 4}" width="${w}" height="20"><title>${esc(txt)}</title></rect>`;
        if (w >= txt.length * 7.4 + 8) g += `<text class="iv-txt ${b.cls || ''}" x="${x1 + w / 2}" y="${y + 18.5}" text-anchor="middle">${esc(txt)}</text>`;
        else if (lane.bars.length === 1) g += `<text class="iv-txt iv-txt--out" x="${x2 + 6}" y="${y + 18.5}">${esc(txt)}</text>`;
      });
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Интервалы на оси времени">${g}</svg>`;
  }

  function ivParse(s) {
    if (typeof s !== 'string' || s[0] !== '[') return null;
    try { const v = JSON.parse(s); return Array.isArray(v) ? v : null; } catch (_) { return null; }
  }
  const isPair = p => Array.isArray(p) && p.length === 2 && p.every(x => typeof x === 'number');
  const isPairs = v => Array.isArray(v) && v.every(isPair);

  /* Края оси для всего прогона: по всем интервалам во всех кадрах. */
  function ivRange(t) {
    let lo = Infinity, hi = -Infinity;
    const take = p => { lo = Math.min(lo, p[0]); hi = Math.max(hi, p[1], p[0]); };
    t.frames.forEach(f => {
      if (isPairs(f.arr)) f.arr.forEach(take);
      Object.values(f.vars).forEach(s => { const v = ivParse(s); if (v && isPairs(v)) v.forEach(take); else if (v && isPair(v)) take(v); });
    });
    if (lo === Infinity) { lo = 0; hi = 10; }
    return [Math.floor(lo) - 1, Math.ceil(hi) + 1];
  }

  /* Кадр прогона в зонах intervals и pairs.
     intervals — объединение и вставка: текущий интервал [start, end) подсвечен
     на дорожке списка, внизу — списки merged, result или slots из переменных.
     pairs — проверка конфликтов: ordered[i] сравнивается с ordered[i − 1]. */
  function drawIvTrace(box, f, t, zone) {
    if (!t._range) t._range = ivRange(t);
    const [lo, hi] = t._range;
    const vnum = n => (f.vars[n] !== undefined && /^-?\d+$/.test(f.vars[n])) ? Number(f.vars[n]) : null;
    let rows = isPairs(f.arr) ? f.arr : null, rowName = t.arr_name;
    if (!rows) {
      const raw = ivParse(f.vars.intervals);
      if (raw && isPairs(raw)) { rows = raw; rowName = 'intervals'; }
    }
    rows = rows || [];
    const i = vnum('i'), cur = ivParse(f.vars.iv);
    const s = vnum('start') !== null ? vnum('start') : isPair(cur) ? cur[0] : null;
    const e = vnum('end') !== null ? vnum('end') : isPair(cur) ? cur[1] : null;
    let hot = -1;
    if (zone === 'pairs' && i !== null) hot = i;
    else if (s !== null && e !== null) hot = rows.findIndex(p => p[0] === s && p[1] === e);
    if (zone === 'intervals' && hot < 0 && i !== null && i < rows.length) hot = i;
    const lanes = rows.map((p, k) => {
      let cls = '';
      if (zone === 'pairs' && i !== null) cls = k === i ? 'is-hot' : k === i - 1 ? 'is-prev' : k < i - 1 ? 'is-done' : '';
      else if (k === hot) cls = 'is-hot';
      return { name: `${rowName}[${k}]`, bars: [{ s: p[0], e: p[1], cls }] };
    });
    const same = s !== null && e !== null && rows.some(p => p[0] === s && p[1] === e);
    if (zone === 'intervals' && !same && s !== null && e !== null && s <= e) lanes.push({ name: 'start, end', bars: [{ s, e, cls: 'is-new' }] });
    ['merged', 'result', 'slots'].forEach(name => {
      const v = ivParse(f.vars[name]);
      if (v && isPairs(v)) lanes.push({ name, bars: v.map(p => ({ s: p[0], e: p[1], cls: 'is-merged' })) });
    });
    box.innerHTML = `<div class="ivtrace">${ivSvg(lanes, lo, hi)}</div>`;
  }

  /* ── 1. Пошаговый прогон ──────────────────────────────────────── */
  /* data-trace — ключ в window.TRACES, data-zone — как красить ячейки.
     Кадр с ev = 'exc' — строка, на которой возникло исключение: она красная,
     а вместо результата показывается текст исключения.
     Зоны:
     between — вне [i, j] бледно; rw — [0, w) готово, [w, r) мусор;
     compress — то же, что rw, но граница чтения — start;
     window — окно длины k модуля 9 (см. ниже);
     events — события во временном окне: левее l бледно, с l по r — окно;
     prefix — список prefix модуля 11 (см. ниже);
     prefix1 — то же для запроса [l, r] с включённым концом: prefix[l] и prefix[r + 1];
     balance — левее i, сам i и правее i для равновесного индекса;
     intervals, pairs — интервалы модуля 12 на оси времени вместо ячеек (drawIvTrace). */
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
      const mark = f.ev === 'return' ? 'is-ret' : f.ev === 'exc' ? 'is-err' : 'is-now';
      lines.forEach((ln, k) => ln.className = k + 1 === f.ln ? mark : '');
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
      if (zone === 'intervals' || zone === 'pairs') drawIvTrace(cells, f, t, zone);
      else drawCells(cells, arr, {
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
          if (zone === 'events') {
            // События во временном окне: с l по r — в окне, левее l — ушли.
            const rr = num(f, 'r'), ll = num(f, 'l');
            if (ll !== null && k < ll) return 'is-out';
            if (ll !== null && rr !== null && k >= ll && k <= rr) return 'is-win';
          }
          if (zone === 'prefix') {
            // Префиксы модуля 11: при ответе на запрос подсвечены prefix[l] и prefix[r].
            // При подготовке записанная ячейка видна по вспышке.
            const ll = num(f, 'l'), rr = num(f, 'r');
            if (ll !== null && rr !== null) return (k === ll || k === rr) ? 'is-hot' : '';
          }
          if (zone === 'prefix1') {
            // Запрос с включённым правым концом: подсвечены prefix[l] и prefix[r + 1].
            const ll = num(f, 'l'), rr = num(f, 'r');
            if (ll !== null && rr !== null) return (k === ll || k === rr + 1) ? 'is-hot' : '';
          }
          if (zone === 'balance') {
            // Равновесный индекс модуля 11: левее i — сумма left, i — текущий, правее — right.
            const ii = num(f, 'i');
            if (ii !== null) return k < ii ? 'is-done' : k === ii ? 'is-hot' : 'is-win';
          }
          if (zone === 'window') {
            // Окно модуля 9: при r — окно после сдвига [r − len + 1, r], ушедший r − len;
            // при s — срез [s, s + len); до цикла — первое окно [0, len).
            // Длина окна — size, если он есть (окно радиуса k, оставшиеся карты), иначе k;
            // начало окна в задаче о разнице оценок — i.
            const len = num(f, 'size') !== null ? num(f, 'size') : num(f, 'k');
            const rr = num(f, 'r'), ss = num(f, 's') !== null ? num(f, 's') : num(f, 'i');
            if (len !== null) {
              if (rr !== null) { if (k > rr - len && k <= rr) return 'is-win'; if (k === rr - len) return 'is-gone'; }
              else if (ss !== null) { if (k >= ss && k < ss + len) return 'is-win'; }
              else if (['total', 'count', 'best'].some(v => f.vars[v] !== undefined) && k < len) return 'is-win';
            }
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
        result.classList.toggle('is-err', Boolean(t.error));
        result.textContent = t.error
          ? `Функция прервана исключением ${t.error}. Список к этому моменту: ${t.after}`
          : `Функция вернула ${t.result}. Список после вызова: ${t.after}`;
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
  /* data-series: [{name, color, pts: [[n, ms], ...]}], data-xlabel — подпись оси x.
     Оси логарифмические. */
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
          <text x="${(W + L) / 2}" y="${H - 8}" text-anchor="middle">${esc(root.dataset.xlabel || 'длина списка n')}</text>
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

  /* ── 9а. Окно над списком ─────────────────────────────────────── */
  /* data-a — список, data-k — длина окна, data-goal="min" — искать наименьшую
     сумму вместо наибольшей. Окно — полуинтервал [l, r),
     r = l + k. Сумма окна пересчитывается сдвигом: минус ушедший элемент,
     плюс пришедший. Счётчики сравнивают число обращений к элементам
     при пересчёте с нуля и при сдвиге. */
  document.querySelectorAll('.slide').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length;
    let k = Math.min(Math.max(Number(root.dataset.k) || 3, 1), n), l, sum, naive, roll, best, bestL, timer = null, prevL = -1;
    const toMin = root.dataset.goal === 'min';
    const better = (a, b) => toMin ? a < b : a > b;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Окно над списком')}</b><span>сдвиг на одну позицию</span></div>
      <div class="widget__body">
        <div class="btnrow slide__kbar"><span>Длина окна</span><button class="btn" data-act="kminus" aria-label="уменьшить k">−</button><b class="slide__k"></b><button class="btn" data-act="kplus" aria-label="увеличить k">+</button></div>
        <div class="cells"></div>
        <p class="slide__sum" aria-live="polite"></p>
        <div class="btnrow">
          <button class="btn btn--main" data-act="next">сдвинуть окно →</button>
          <button class="btn" data-act="play">▶ до конца</button>
          <button class="btn" data-act="reset">↻ сначала</button>
        </div>
        <div class="hunt__stats slide__stats"></div>
        <div class="legend"><span><i class="l-win"></i>окно [l, r)</span><span><i class="l-gone"></i>элемент, который ушёл из окна</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), say = root.querySelector('.slide__sum'), stats = root.querySelector('.slide__stats');
    const total = () => n - k + 1;
    const el_ = c => `${c} ${c % 10 === 1 && c % 100 !== 11 ? 'элемент' : c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14) ? 'элемента' : 'элементов'}`;
    function reset() {
      stop();
      l = 0; prevL = -1;
      sum = a.slice(0, k).reduce((x, y) => x + y, 0);
      naive = k; roll = k; best = sum; bestL = 0;
      say.innerHTML = `Первое окно a[0:${k}]: ${a.slice(0, k).join(' + ')} = <b>${sum}</b>. Чтобы его посчитать, нужно прочитать ${k === 1 ? 'один элемент' : `все ${el_(k)}`}.`;
      draw();
    }
    function step() {
      if (l + k >= n) return false;
      const out = a[l], inn = a[l + k], old = sum;
      sum = sum - out + inn; prevL = l; l++;
      naive += k; roll += 2;
      if (better(sum, best)) { best = sum; bestL = l; }
      say.innerHTML = `Окно сдвинулось на одну позицию: ушёл a[${l - 1}] = ${out}, пришёл a[${l + k - 1}] = ${inn}. Новая сумма: ${old} − ${out} + ${inn} = <b>${sum}</b>. ${k > 1 ? `Остальные ${el_(k - 1)} окна не перечитывались.` : ''}`;
      if (l + k >= n) say.innerHTML += ` Это последнее окно: справа элементов больше нет. ${toMin ? 'Наименьшая' : 'Наибольшая'} сумма — <b>${best}</b>, окно a[${bestL}:${bestL + k}].` + (root.dataset.note ? ` ${root.dataset.note.replace('{best}', best).replace('{rest}', a.reduce((x, y) => x + y, 0) - best)}` : '');
      draw();
      return true;
    }
    function draw() {
      const tags = {}, tail = [];
      const put = (p, v) => { if (v < n) (tags[v] = tags[v] || []).push(p); else tail.push(p); };
      put('l', l); put('r', l + k);
      drawCells(cells, a, {
        tags, tailTags: tail,
        flash: prevL >= 0 ? new Set([l + k - 1]) : new Set(),
        cls: i => (i >= l && i < l + k) ? 'is-win' : i === prevL ? 'is-gone' : ''
      });
      root.querySelector('.slide__k').textContent = `k = ${k}`;
      root.querySelector('[data-act="kminus"]').disabled = k <= 1;
      root.querySelector('[data-act="kplus"]').disabled = k >= n;
      root.querySelector('[data-act="next"]').disabled = l + k >= n;
      stats.innerHTML = `<span>окно ${l + 1} из ${total()}</span><span>пересчёт с нуля: ${naive} обращений</span><span>сдвиг окна: ${roll} обращений</span>`;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; root.querySelector('[data-act="play"]').textContent = '▶ до конца'; } }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'kminus' && k > 1) { k--; reset(); }
      if (act === 'kplus' && k < n) { k++; reset(); }
      if (act === 'reset') reset();
      if (act === 'next') { stop(); step(); }
      if (act === 'play') {
        if (timer) return stop();
        if (l + k >= n) reset();
        b.textContent = '⏸ пауза';
        timer = setInterval(() => { if (!step()) stop(); }, 900);
      }
    });
    reset();
  });

  /* ── 9б. Сдвиг окна вручную ──────────────────────────────────── */
  /* На каждом сдвиге студент щёлкает ячейку, которая уходит из окна,
     затем ячейку, которая входит, и вводит новую сумму. Неверный выбор
     не выполняется, вместо него — объяснение. */
  document.querySelectorAll('.slidehand').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length, k = Number(root.dataset.k) || 3;
    let l, sum, phase, errors, done;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Сдвиньте окно сами</b><span>окно длины ${k}</span></div>
      <div class="widget__body">
        <div class="cells slidehand__cells"></div>
        <p class="rwg__now"></p>
        <div class="btnrow slidehand__sum" hidden>
          <label>Новая сумма окна: <input type="number" inputmode="numeric"></label>
          <button class="btn btn--main" data-act="check">Проверить</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="btnrow"><span style="flex:1"></span><button class="btn" data-act="reset">↻ заново</button></div>
        <div class="legend"><span><i class="l-win"></i>текущее окно</span><span><i class="l-gone"></i>ушло из окна</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const box = root.querySelector('.slidehand__sum'), input = box.querySelector('input');
    const say = (t, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = t; };
    let gone = -1, came = -1;
    function reset() {
      l = 0; sum = a.slice(0, k).reduce((x, y) => x + y, 0); phase = 'out'; errors = 0; done = false; gone = came = -1;
      say(`Первое окно nums[0:${k}] посчитано целиком: ${a.slice(0, k).join(' + ')} = ${sum}. Дальше окно сдвигается на одну позицию. Щёлкните элемент, который уйдёт из окна.`);
      draw();
    }
    function draw() {
      const tags = {}, tail = [];
      const put = (p, v) => { if (v < n) (tags[v] = tags[v] || []).push(p); else tail.push(p); };
      put('l', l); put('r', l + k);
      drawCells(cells, a, { tags, tailTags: tail, cls: i => (i >= l && i < l + k) ? 'is-win' : i === gone ? 'is-gone' : '' });
      [...cells.children].forEach((c, i) => { if (i < n) { c.classList.add('is-pick'); c.dataset.i = i; } });
      now.innerHTML = done ? '' : `Окно nums[${l}:${l + k}], сумма <b>${sum}</b>. ` +
        (phase === 'out' ? 'Какой элемент уйдёт из окна при сдвиге?' : phase === 'in' ? 'Какой элемент войдёт в окно?' : `Посчитайте: ${sum} − ${a[l]} + ${a[l + k]}.`);
      box.hidden = phase !== 'sum' || done;
    }
    cells.addEventListener('click', e => {
      const c = e.target.closest('.cell'); if (!c || done || c.dataset.i === undefined) return;
      const i = Number(c.dataset.i);
      if (phase === 'out') {
        if (i === l) { phase = 'in'; say(`Верно: уходит nums[${l}] = ${a[l]}, самый левый элемент окна. Теперь щёлкните элемент, который войдёт.`); }
        else { errors++; say(i > l && i < l + k ? `nums[${i}] = ${a[i]} останется в окне: после сдвига окно — nums[${l + 1}:${l + k + 1}]. Уходит самый левый элемент.` : `nums[${i}] не входит в текущее окно nums[${l}:${l + k}], уйти из него он не может.`, 'no'); }
      } else if (phase === 'in') {
        if (i === l + k) { phase = 'sum'; say(`Верно: входит nums[${l + k}] = ${a[l + k]}, первый элемент справа от окна. Введите новую сумму.`); setTimeout(() => input.focus(), 0); }
        else { errors++; say(i < l + k && i >= l ? `nums[${i}] = ${a[i]} уже в окне.` : `Окно сдвигается на одну позицию, поэтому входит элемент сразу за правой границей: nums[${l + k}].`, 'no'); }
      }
      draw();
    });
    function check() {
      const want = sum - a[l] + a[l + k], got = Number(input.value);
      if (input.value.trim() === '' || got !== want) {
        errors++;
        say(`Сумма не сходится. Из ${sum} вычитается ушедший ${a[l]} и прибавляется пришедший ${a[l + k]}: ${sum} − ${a[l]} + ${a[l + k]}.`, 'no');
        return;
      }
      gone = l; sum = want; l++; input.value = ''; phase = 'out';
      if (l + k >= n) {
        done = true;
        say(`Готово: последнее окно nums[${l}:${l + k}], сумма ${sum}. Все ${n - k + 1} окон пройдены, каждое после первого — за одно вычитание и одно сложение. Ошибок: ${errors}.`, 'ok');
      } else say(`Верно: ${want}. Окно сдвинулось, теперь это nums[${l}:${l + k}]. Щёлкните элемент, который уйдёт следующим.`);
      draw();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'check') check();
      if (b.dataset.act === 'reset') reset();
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    reset();
  });

  /* ── 9в. Временная ось ──────────────────────────────────────────── */
  /* data-t — отсортированные моменты событий, data-w — длина окна.
     Окно [s, s + w) ставится началом на одно из событий: лучшее окно
     всегда можно сдвинуть вправо до первого события в нём. */
  document.querySelectorAll('.timeline').forEach(root => {
    const t = json(root, 't') || [];
    let w = Number(root.dataset.w) || 5;
    const starts = [...new Set(t)];
    let at = 0, best = 0, bestS = null;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'События на оси времени')}</b><span>окно [s, s + w)</span></div>
      <div class="widget__body">
        <div class="btnrow slide__kbar"><span>Длина окна</span><button class="btn" data-act="wminus" aria-label="уменьшить w">−</button><b class="slide__k"></b><button class="btn" data-act="wplus" aria-label="увеличить w">+</button></div>
        <div class="timeline__wrap"></div>
        <p class="slide__sum" aria-live="polite"></p>
        <div class="btnrow">
          <button class="btn" data-act="prev">← окно</button>
          <button class="btn btn--main" data-act="next">окно →</button>
          <button class="btn" data-act="reset">↻ сначала</button>
        </div>
        <div class="legend"><span><i class="l-win"></i>окно [s, s + w)</span><span><i class="l-in"></i>событие в окне</span><span><i class="l-outdot"></i>событие вне окна</span></div>
      </div>`;
    const wrap = root.querySelector('.timeline__wrap'), say = root.querySelector('.slide__sum');
    const lo = Math.min(...t) - 1, hi = Math.max(...t) + 6;
    const W = 760, H = 120, L = 24, R = 24, Y = 78;
    const X = v => L + (v - lo) / (hi - lo) * (W - L - R);
    function draw() {
      const s0 = starts[at], s1 = s0 + w;
      const inside = t.filter(v => v >= s0 && v < s1).length;
      if (inside > best) { best = inside; bestS = s0; }
      let g = `<rect class="tl-win" x="${X(s0)}" y="${Y - 46}" width="${X(s1) - X(s0)}" height="60"/>`;
      g += `<line class="tl-axis" x1="${L}" x2="${W - R}" y1="${Y}" y2="${Y}"/>`;
      for (let v = Math.ceil(lo); v <= hi; v++) if (v % 5 === 0) g += `<line class="tl-tick" x1="${X(v)}" x2="${X(v)}" y1="${Y}" y2="${Y + 6}"/><text x="${X(v)}" y="${Y + 22}" text-anchor="middle">${v}</text>`;
      g += `<line class="tl-edge" x1="${X(s1)}" x2="${X(s1)}" y1="${Y - 50}" y2="${Y + 8}"/><text class="tl-lab" x="${X(s0)}" y="${Y - 52}" text-anchor="middle">s = ${s0}</text><text class="tl-lab" x="${X(s1)}" y="${Y - 52}" text-anchor="middle">s + w = ${s1}</text>`;
      const seen = {};
      t.forEach(v => {
        const n = (seen[v] = (seen[v] || 0) + 1) - 1;
        const on = v >= s0 && v < s1;
        g += `<circle class="${on ? 'tl-in' : 'tl-out'}" cx="${X(v)}" cy="${Y - 8 - n * 13}" r="6"><title>${v}</title></circle>`;
      });
      wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="События на оси времени">${g}</svg>`;
      root.querySelector('.slide__k').textContent = `w = ${w}`;
      root.querySelector('[data-act="prev"]').disabled = at === 0;
      root.querySelector('[data-act="next"]').disabled = at === starts.length - 1;
      root.querySelector('[data-act="wminus"]').disabled = w <= 1;
      const edge = t.filter(v => v === s1).length;
      say.innerHTML = `Окно [${s0}, ${s1}): событий в нём — <b>${inside}</b>.` +
        (edge ? ` Событие в момент ${s1} лежит на правой границе и в окно не входит.` : '') +
        ` Лучшее из просмотренных окон — ${best} ${best === 1 ? 'событие' : best >= 2 && best <= 4 ? 'события' : 'событий'}, начало в момент ${bestS}.`;
    }
    function reset() { at = 0; best = 0; bestS = null; draw(); }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'next' && at < starts.length - 1) at++;
      if (a === 'prev' && at > 0) at--;
      if (a === 'reset') return reset();
      if (a === 'wminus' && w > 1) { w--; return reset(); }
      if (a === 'wplus') { w++; return reset(); }
      draw();
    });
    reset();
  });

  /* ── 9г. Окно переменного размера ─────────────────────────────── */
  /* data-a — список неотрицательных чисел, data-s — порог суммы,
     data-ds — шаг кнопок «−» и «+» у порога. Ищется самое короткое окно
     с суммой не меньше порога. Окно — полуинтервал [l, r). На шаге сдвигается
     одна граница: правая, пока сумма меньше порога, иначе левая. */
  document.querySelectorAll('.vwin').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length, all = a.reduce((x, y) => x + y, 0);
    const ds = Number(root.dataset.ds) || 5;
    let S = Number(root.dataset.s) || 10, l, r, sum, best, moveL, moveR, gone, came, done, timer = null;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Окно переменного размера')}</b><span>за шаг сдвигается одна граница</span></div>
      <div class="widget__body">
        <div class="btnrow slide__kbar"><span>Порог суммы</span><button class="btn" data-act="sminus" aria-label="уменьшить порог">−</button><b class="slide__k"></b><button class="btn" data-act="splus" aria-label="увеличить порог">+</button></div>
        <div class="cells"></div>
        <p class="slide__sum" aria-live="polite"></p>
        <div class="btnrow">
          <button class="btn btn--main" data-act="next">шаг →</button>
          <button class="btn" data-act="play">▶ до конца</button>
          <button class="btn" data-act="reset">↻ сначала</button>
        </div>
        <div class="hunt__stats vwin__stats"></div>
        <div class="legend"><span><i class="l-win"></i>окно [l, r)</span><span><i class="l-gone"></i>элемент, который ушёл из окна</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), say = root.querySelector('.slide__sum'), stats = root.querySelector('.vwin__stats');
    const times = c => `${c} ${c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14) ? 'раза' : 'раз'}`;
    function reset() {
      stop();
      l = 0; r = 0; sum = 0; best = null; moveL = 0; moveR = 0; gone = -1; came = -1; done = false;
      say.innerHTML = `Окно пустое: l = 0, r = 0, сумма 0. Нужно самое короткое окно с суммой не меньше ${S}.`;
      draw();
    }
    function step() {
      if (done) return false;
      gone = -1; came = -1;
      if (sum >= S) {
        const len = r - l, v = a[l], old = sum;
        let note = 'Найденное раньше окно не длиннее, запись не меняется.';
        if (!best || len < best[1] - best[0]) { note = best ? 'Оно короче найденных раньше, его границы записаны.' : 'Это первое подходящее окно, его границы записаны.'; best = [l, r, sum]; }
        sum -= v; gone = l; l++; moveL++;
        say.innerHTML = `Сумма ${old} не меньше ${S}: окно a[${l - 1}:${r}] длины ${len} подходит. ${note} Окно сжимается слева: уходит a[${l - 1}] = ${v}, сумма ${old} − ${v} = <b>${sum}</b>.`;
      } else if (r < n) {
        const v = a[r], old = sum;
        sum += v; came = r; r++; moveR++;
        say.innerHTML = `Сумма ${old} меньше ${S}: окно расширяется справа. Приходит a[${r - 1}] = ${v}, сумма ${old} + ${v} = <b>${sum}</b>.`;
      } else {
        done = true;
        say.innerHTML = `Сумма ${sum} меньше ${S}, а правая граница дошла до конца списка: расширять окно нечем. ` + (best
          ? `Ответ — окно a[${best[0]}:${best[1]}]: длина <b>${best[1] - best[0]}</b>, сумма ${best[2]}.`
          : `Окна с суммой не меньше ${S} в списке нет: сумма всех элементов равна ${all}.`);
      }
      draw();
      return !done;
    }
    function draw() {
      const tags = {}, tail = [];
      const put = (p, v) => { if (v < n) (tags[v] = tags[v] || []).push(p); else tail.push(p); };
      put('l', l); put('r', r);
      drawCells(cells, a, {
        tags, tailTags: tail,
        flash: came >= 0 ? new Set([came]) : new Set(),
        cls: i => (i >= l && i < r) ? 'is-win' : i === gone ? 'is-gone' : ''
      });
      root.querySelector('.slide__k').textContent = `S = ${S}`;
      root.querySelector('[data-act="sminus"]').disabled = S - ds < 1;
      root.querySelector('[data-act="splus"]').disabled = S > all;
      root.querySelector('[data-act="next"]').disabled = done;
      stats.innerHTML = `<span>правая граница сдвинута ${times(moveR)}, левая — ${times(moveL)}</span><span>${best ? `самое короткое окно: a[${best[0]}:${best[1]}], длина ${best[1] - best[0]}` : 'подходящих окон пока нет'}</span><span>подотрезков в списке: ${n * (n + 1) / 2}</span>`;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; root.querySelector('[data-act="play"]').textContent = '▶ до конца'; } }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'sminus' && S - ds >= 1) { S -= ds; reset(); }
      if (act === 'splus' && S <= all) { S += ds; reset(); }
      if (act === 'reset') reset();
      if (act === 'next') { stop(); step(); }
      if (act === 'play') {
        if (timer) return stop();
        if (done) reset();
        b.textContent = '⏸ пауза';
        timer = setInterval(() => { if (!step()) stop(); }, 1100);
      }
    });
    reset();
  });

  /* ── 9д. Расширение и сжатие вручную ──────────────────────────── */
  /* data-a — список неотрицательных чисел, data-limit — порог.
     data-goal="max" (по умолчанию): самый длинный отрезок с суммой не больше
     порога, окно сжимают, пока сумма больше порога. data-goal="min": самый
     короткий отрезок с суммой не меньше порога, окно сжимают, пока сумма
     не меньше порога. data-goal="uniq": data-a — список символов, ищется
     самая длинная подстрока без повторов, под лентой показана частотная
     карта окна. data-goal="distinct": самый длинный отрезок, в котором разных
     значений не больше data-limit. Окно — элементы с l по r включительно, как в коде модуля 10. Неверный ход не выполняется, вместо него — объяснение. */
  document.querySelectorAll('.vwinhand').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length, lim = Number(root.dataset.limit) || 0, toMin = root.dataset.goal === 'min', distinct = root.dataset.goal === 'distinct', uniq = root.dataset.goal === 'uniq' || distinct;
    let l, r, sum, best, errors, done, gone, cnt;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Двигайте границы сами</b><span>${distinct ? `разных значений не больше ${lim}` : uniq ? 'в окне нет повторов' : toMin ? `сумма не меньше ${lim}` : `сумма не больше ${lim}`}</span></div>
      <div class="widget__body">
        <div class="cells"></div>
        <p class="rwg__now"></p>
        <div class="btnrow">
          <button class="btn btn--main" data-act="grow">расширить: r += 1</button>
          <button class="btn btn--main" data-act="shrink">сжать: l += 1</button>
          <span style="flex:1"></span><button class="btn" data-act="reset">↻ заново</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="legend"><span><i class="l-win"></i>текущее окно</span><span><i class="l-gone"></i>ушло из окна</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const say = (t, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = t; };
    const kinds = () => Object.values(cnt).filter(v => v > 0).length;
    const win = () => l > r ? 'пустое' : distinct ? `[${a.slice(l, r + 1).join(', ')}]` : uniq ? `'${a.slice(l, r + 1).join('')}'` : `nums[${l}:${r + 1}]`;
    const mustShrink = () => distinct ? kinds() > lim : uniq ? (r >= l && cnt[a[r]] > 1) : toMin ? sum >= lim : sum > lim;
    function reset() {
      l = 0; r = -1; sum = 0; best = 0; errors = 0; done = false; gone = -1; cnt = {};
      say(distinct ? `Нужен самый длинный отрезок, в котором разных значений не больше ${lim}. Окно пустое, частотная карта пустая. Выберите, какую границу сдвинуть.` : uniq ? 'Нужна самая длинная подстрока без повторов. Окно пустое, частотная карта пустая. Выберите, какую границу сдвинуть.' : toMin
        ? `Нужен самый короткий отрезок с суммой не меньше ${lim}. Окно пустое, сумма 0. Выберите, какую границу сдвинуть.`
        : `Нужен самый длинный отрезок с суммой не больше ${lim}. Окно пустое, сумма 0. Выберите, какую границу сдвинуть.`);
      draw();
    }
    function draw() {
      const tags = {};
      const put = (p, v) => { if (v >= 0 && v < n) (tags[v] = tags[v] || []).push(p); };
      put('l', l); put('r', r);
      drawCells(cells, a, { tags, tailTags: l >= n ? ['l'] : [], cls: i => (i >= l && i <= r) ? 'is-win' : i === gone ? 'is-gone' : '' });
      now.innerHTML = uniq
        ? `Окно ${win()}, длина ${r - l + 1}. Карта: <b>${Object.keys(cnt).filter(c => cnt[c] > 0).map(c => distinct ? `${c}: ${cnt[c]}` : `'${c}': ${cnt[c]}`).join(', ') || 'пустая'}</b>. ${distinct ? 'Самый длинный допустимый отрезок' : 'Самая длинная подстрока без повторов'}: <b>${best || 'пока нет'}</b>.`
        : `Окно ${win()}, сумма <b>${sum}</b>, длина ${r - l + 1}. ${toMin ? 'Самое короткое подходящее' : 'Самое длинное допустимое'}: <b>${best || 'пока нет'}</b>.`;
      root.querySelectorAll('[data-act="grow"],[data-act="shrink"]').forEach(b => { b.disabled = done; });
    }
    function finish(t) {
      done = true;
      say(`${t} Готово: правая граница прошла ${uniq && !distinct ? 'всю строку' : 'весь список'}. Ответ — <b>${best}</b>${best ? '' : ': подходящего отрезка нет'}. Ошибок: ${errors}.`, 'ok');
    }
    function growU() {
      if (mustShrink()) { errors++; return say(distinct ? `В окне ${win()} разных значений ${kinds()}, больше ${lim}: окно недопустимо. Расширение их число не уменьшит. Окно нужно сжать.` : `В окне ${win()} символ '${a[r]}' встречается дважды: окно недопустимо. Расширение повтор не уберёт. Окно нужно сжать.`, 'no'); }
      r++; cnt[a[r]] = (cnt[a[r]] || 0) + 1; gone = -1;
      let t = distinct ? `Пришло значение ${a[r]}, count[${a[r]}] = ${cnt[a[r]]}, разных значений в окне ${kinds()}. ` : `Пришёл символ '${a[r]}', count['${a[r]}'] = ${cnt[a[r]]}. `;
      if (distinct && mustShrink()) t += `Это больше ${lim}: окно недопустимо.`;
      else if (!distinct && cnt[a[r]] > 1) t += 'Символ уже был в окне: появился повтор.';
      else { const len = r - l + 1; t += `${distinct ? 'Окно допустимо' : 'Повторов нет'}, длина окна ${len}. ` + (len > best ? 'Это больше прежней лучшей длины, запись обновлена.' : 'Лучшая длина не изменилась.'); if (len > best) best = len; }
      if (r === n - 1 && !mustShrink()) finish(t); else say(t);
      draw();
    }
    function shrinkU() {
      if (!mustShrink()) { errors++; return say(l > r ? 'Окно пустое, сжимать нечего. Окно нужно расширить.' : `В окне ${win()} ${distinct ? `разных значений ${kinds()}, не больше ${lim}` : 'повторов нет'}: окно допустимо. Сжатие сделает его короче, а нужна самая длинная подстрока. Окно нужно расширить.`, 'no'); }
      const x = a[l]; cnt[x]--; gone = l; l++;
      let t = distinct ? `Ушло значение ${x}, count[${x}] = ${cnt[x]}${cnt[x] === 0 ? ': его в окне не осталось' : ''}. ` : `Ушёл символ '${x}', count['${x}'] = ${cnt[x]}. `;
      if (mustShrink()) t += distinct ? `Разных значений всё ещё ${kinds()}.` : `Символ '${a[r]}' всё ещё встречается дважды.`;
      else { const len = r - l + 1; t += `${distinct ? `Разных значений ${kinds()}, окно допустимо` : 'Повторов больше нет'}, длина окна ${len}. ` + (len > best ? 'Запись обновлена.' : 'Лучшая длина не изменилась.'); if (len > best) best = len; }
      if (r === n - 1 && !mustShrink()) finish(t); else say(t);
      draw();
    }
    function grow() {
      if (uniq) return growU();
      if (mustShrink()) {
        errors++;
        return say(toMin
          ? `Сумма ${sum} не меньше ${lim}: окно подходит. Расширение сделает его длиннее, а нужен самый короткий отрезок. Окно нужно сжать.`
          : `Сумма ${sum} больше ${lim}: окно недопустимо. Расширение сумму не уменьшит. Сначала окно нужно сжать.`, 'no');
      }
      r++; sum += a[r]; gone = -1;
      let t = `Пришёл nums[${r}] = ${a[r]}, сумма ${sum - a[r]} + ${a[r]} = ${sum}. `;
      if (toMin) t += sum >= lim ? `Она не меньше ${lim}: окно подходит.` : `Она меньше ${lim}: окно пока не подходит.`;
      else if (sum <= lim) {
        const len = r - l + 1;
        t += `Она не больше ${lim}: окно допустимо, его длина ${len}. ` + (len > best ? 'Это больше прежней лучшей длины, запись обновлена.' : 'Лучшая длина не изменилась.');
        if (len > best) best = len;
      } else t += `Она больше ${lim}: окно недопустимо.`;
      if (r === n - 1 && !mustShrink()) finish(t); else say(t);
      draw();
    }
    function shrink() {
      if (uniq) return shrinkU();
      if (!mustShrink()) {
        errors++;
        return say(toMin
          ? `Сумма ${sum} меньше ${lim}: окно не подходит. Сжатие сумму не увеличит. Окно нужно расширить.`
          : (l > r ? 'Окно пустое, сжимать нечего. Окно нужно расширить.' : `Сумма ${sum} не больше ${lim}: окно допустимо. Сжатие сделает его короче, а нужен самый длинный отрезок. Окно нужно расширить.`), 'no');
      }
      let t = '';
      if (toMin) {
        const len = r - l + 1;
        t = `Перед сжатием записана длина ${len}` + (!best ? ': это первое подходящее окно. ' : len < best ? ': она меньше прежней лучшей. ' : ', лучшая длина не изменилась. ');
        if (!best || len < best) best = len;
      }
      sum -= a[l]; gone = l; l++;
      t += `Ушёл nums[${l - 1}] = ${a[l - 1]}, сумма ${sum + a[l - 1]} − ${a[l - 1]} = ${sum}. `;
      if (!toMin) {
        if (sum <= lim) {
          const len = r - l + 1;
          t += l > r ? 'Окно стало пустым, оно допустимо.' : `Она не больше ${lim}: окно снова допустимо, его длина ${len}. ` + (len > best ? 'Запись обновлена.' : 'Лучшая длина не изменилась.');
          if (len > best) best = len;
        } else t += `Она всё ещё больше ${lim}.`;
      } else t += sum >= lim ? `Она всё ещё не меньше ${lim}.` : `Она меньше ${lim}.`;
      if (r === n - 1 && !mustShrink()) finish(t); else say(t);
      draw();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'grow') grow();
      if (b.dataset.act === 'shrink') shrink();
      if (b.dataset.act === 'reset') reset();
    });
    reset();
  });

  /* ── 9е. Запросы на диапазоне ─────────────────────────────────── */
  /* data-a — список целых чисел, data-l и data-r — первый запрос.
     Запрос — полуинтервал [l, r), сумма nums[l:r]. Под списком — prefix
     из n + 1 ячейки. Каждое изменение границы — новый запрос: счётчики
     показывают, сколько сложений сделал бы перебор и сколько вычитаний
     нужно префиксам. Кнопка серии добавляет 100 случайных запросов. */
  const minus = x => String(x).replace('-', '−');
  const signed = xs => xs.length ? xs.map((x, k) => k === 0 ? minus(x) : x < 0 ? `− ${-x}` : `+ ${x}`).join(' ') : '0';
  const plural = (c, one, few, many) => c % 10 === 1 && c % 100 !== 11 ? one : c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14) ? few : many;
  const prefixOf = a => a.reduce((p, x) => (p.push(p[p.length - 1] + x), p), [0]);

  document.querySelectorAll('.prefix').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length, pre = prefixOf(a);
    let l0 = Math.max(0, Number(root.dataset.l) || 0), r0 = Math.min(n, Number(root.dataset.r) || n);
    let l, r, q, adds, subs, seed;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Сумма на диапазоне')}</b><span>запрос — полуинтервал [l, r)</span></div>
      <div class="widget__body">
        <div class="btnrow slide__kbar">
          <span>l</span><button class="btn" data-act="lminus" aria-label="сдвинуть l влево">−</button><b class="slide__k" data-v="l"></b><button class="btn" data-act="lplus" aria-label="сдвинуть l вправо">+</button>
          <span style="margin-left:14px">r</span><button class="btn" data-act="rminus" aria-label="сдвинуть r влево">−</button><b class="slide__k" data-v="r"></b><button class="btn" data-act="rplus" aria-label="сдвинуть r вправо">+</button>
        </div>
        <span class="tracer__label">список nums</span>
        <div class="cells" data-row="a"></div>
        <span class="tracer__label">prefix: в prefix[i] сумма первых i чисел</span>
        <div class="cells" data-row="p"></div>
        <p class="slide__sum" aria-live="polite"></p>
        <div class="btnrow">
          <button class="btn btn--main" data-act="series">+ 100 случайных запросов</button>
          <button class="btn" data-act="reset">↻ сначала</button>
        </div>
        <div class="hunt__stats prefix__stats"></div>
        <div class="legend"><span><i class="l-win"></i>диапазон nums[l:r]</span><span><i class="l-hot"></i>prefix[l] и prefix[r]</span></div>
      </div>`;
    const rowA = root.querySelector('[data-row="a"]'), rowP = root.querySelector('[data-row="p"]');
    const say = root.querySelector('.slide__sum'), stats = root.querySelector('.prefix__stats');
    const count = () => { q++; adds += r - l; subs++; };
    function reset() { l = l0; r = r0; q = 0; adds = 0; subs = 0; seed = 7; count(); draw(); }
    function draw() {
      const tagsA = {}, tailA = [];
      const put = (p, v) => { if (v < n) (tagsA[v] = tagsA[v] || []).push(p); else tailA.push(p); };
      put('l', l); put('r', r);
      drawCells(rowA, a, { tags: tagsA, tailTags: tailA, cls: k => (k >= l && k < r) ? 'is-win' : '' });
      const tagsP = {}; (tagsP[l] = tagsP[l] || []).push('l'); (tagsP[r] = tagsP[r] || []).push('r');
      drawCells(rowP, pre, { tags: tagsP, cls: k => (k === l || k === r) ? 'is-hot' : '' });
      root.querySelector('[data-v="l"]').textContent = `l = ${l}`;
      root.querySelector('[data-v="r"]').textContent = `r = ${r}`;
      root.querySelector('[data-act="lminus"]').disabled = l === 0;
      root.querySelector('[data-act="lplus"]').disabled = l === r;
      root.querySelector('[data-act="rminus"]').disabled = r === l;
      root.querySelector('[data-act="rplus"]').disabled = r === n;
      const part = a.slice(l, r), s = pre[r] - pre[l];
      say.innerHTML = l === r
        ? `Диапазон nums[${l}:${r}] пустой, его сумма 0. Перебору складывать нечего, по префиксам: prefix[${r}] − prefix[${l}] = ${minus(pre[r])} − ${minus(pre[l])} = <b>0</b>.`
        : `Сумма nums[${l}:${r}]. Перебор: ${signed(part)} = ${minus(s)}, сложений ${r - l}. По префиксам: prefix[${r}] − prefix[${l}] = ${minus(pre[r])} − ${pre[l] < 0 ? `(${minus(pre[l])})` : pre[l]} = <b>${minus(s)}</b>, одно вычитание.`;
      stats.innerHTML = `<span>запросов: ${fmt(q)}</span><span>перебор: ${fmt(adds)} ${plural(adds, 'сложение', 'сложения', 'сложений')}</span><span>префиксы: ${n} ${plural(n, 'сложение', 'сложения', 'сложений')} на подготовку + ${fmt(subs)} ${plural(subs, 'вычитание', 'вычитания', 'вычитаний')}</span>`;
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'reset') return reset();
      if (act === 'series') {
        let last = '';
        for (let t = 0; t < 100; t++) {
          seed = (seed * 1103515245 + 12345) % 2147483648;
          const x = seed % (n + 1);
          seed = (seed * 1103515245 + 12345) % 2147483648;
          const y = seed % (n + 1);
          l = Math.min(x, y); r = Math.max(x, y); count();
        }
        draw();
        say.innerHTML += ' Последний из ста запросов показан на ленте.';
        return;
      }
      if (act === 'lminus' && l > 0) l--;
      if (act === 'lplus' && l < r) l++;
      if (act === 'rminus' && r > l) r--;
      if (act === 'rplus' && r < n) r++;
      count(); draw();
    });
    reset();
  });

  /* ── 9ж. Префиксы вручную ─────────────────────────────────────── */
  /* data-a — список целых чисел, data-q — запросы [[l, r], ...].
     Сначала студент вводит prefix[1..n] по одной ячейке, затем на каждый
     запрос щёлкает уменьшаемое prefix[r] и вычитаемое prefix[l]. Неверный
     ответ не принимается, вместо него — объяснение. */
  document.querySelectorAll('.prefhand').forEach(root => {
    const a = json(root, 'a') || [];
    const qs = json(root, 'q') || [];
    const n = a.length, pre = prefixOf(a);
    let k, phase, qi, picked, errors;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Префиксы вручную</b><span>сначала prefix, потом запросы</span></div>
      <div class="widget__body">
        <span class="tracer__label">список nums</span>
        <div class="cells" data-row="a"></div>
        <span class="tracer__label">prefix</span>
        <div class="cells" data-row="p"></div>
        <p class="rwg__now"></p>
        <div class="btnrow slidehand__sum" hidden>
          <label><span class="prefhand__what"></span> <input type="number" inputmode="numeric"></label>
          <button class="btn btn--main" data-act="check">Проверить</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="btnrow"><span style="flex:1"></span><button class="btn" data-act="reset">↻ заново</button></div>
        <div class="legend"><span><i class="l-win"></i>диапазон запроса</span><span><i class="l-hot"></i>выбранная ячейка prefix</span></div>
      </div>`;
    const rowA = root.querySelector('[data-row="a"]'), rowP = root.querySelector('[data-row="p"]');
    const now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const box = root.querySelector('.slidehand__sum'), input = box.querySelector('input'), what = root.querySelector('.prefhand__what');
    const say = (t, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = t; };
    function reset() {
      k = 1; phase = 'fill'; qi = 0; picked = []; errors = 0;
      say('prefix[0] = 0: сумма нуля чисел. Каждая следующая ячейка — предыдущая плюс очередное число списка. Введите prefix[1].');
      draw();
      input.value = '';
    }
    function draw() {
      const [ql, qr] = phase === 'fill' ? [-1, -1] : (qs[qi] || [-1, -1]);
      drawCells(rowA, a, { cls: i => phase === 'fill' ? (i === k - 1 ? 'is-hot' : '') : (i >= ql && i < qr ? 'is-win' : '') });
      drawCells(rowP, pre, { cls: i => phase === 'fill' ? (i === k ? 'is-hot' : '') : (picked.includes(i) ? 'is-hot' : '') });
      [...rowP.children].forEach((c, i) => {
        if (phase === 'fill' && i >= k) c.querySelector('.cell__val').textContent = i === k ? '?' : '';
        if (phase === 'query') { c.classList.add('is-pick'); c.dataset.i = i; }
      });
      box.hidden = phase !== 'fill';
      what.textContent = `prefix[${k}] =`;
      if (phase === 'fill') now.innerHTML = `prefix[${k}] = prefix[${k - 1}] + nums[${k - 1}]. Сколько это?`;
      else if (phase === 'query') now.innerHTML = `Запрос ${qi + 1} из ${qs.length}: сумма nums[${ql}:${qr}]. ` + (picked.length === 0 ? 'Щёлкните ячейку prefix, <b>из которой</b> вычитают.' : `Уменьшаемое — prefix[${qr}] = ${minus(pre[qr])}. Щёлкните ячейку, <b>которую</b> вычитают.`);
      else now.innerHTML = '';
    }
    function check() {
      const want = pre[k], got = Number(input.value);
      if (input.value.trim() === '' || got !== want) {
        errors++;
        return say(`Не сходится. prefix[${k}] — сумма ${k === 1 ? 'первого числа' : `первых ${k} чисел`}: к prefix[${k - 1}] = ${minus(pre[k - 1])} прибавьте nums[${k - 1}] = ${minus(a[k - 1])}.`, 'no');
      }
      input.value = '';
      if (k === n) {
        phase = qs.length ? 'query' : 'done';
        say(`Верно: prefix[${n}] = ${minus(want)}, сумма всего списка. Подготовка закончена: ${n} сложений. Теперь ответьте на запросы.`);
      } else { k++; say(`Верно: ${minus(want)}. Введите prefix[${k}].`); setTimeout(() => input.focus(), 0); }
      draw();
    }
    rowP.addEventListener('click', e => {
      const c = e.target.closest('.cell'); if (!c || phase !== 'query' || c.dataset.i === undefined) return;
      const i = Number(c.dataset.i), [ql, qr] = qs[qi];
      if (picked.length === 2) return;
      if (picked.length === 0) {
        if (i === qr) { picked = [i]; say(`Верно: prefix[${qr}] — сумма всех чисел до конца диапазона, nums[0:${qr}].`); }
        else {
          errors++;
          say(i === ql ? `prefix[${ql}] — сумма чисел до начала диапазона. Её вычитают. Уменьшаемое — сумма до конца диапазона.`
            : i === qr - 1 ? `prefix[${qr - 1}] — сумма nums[0:${qr - 1}]. В ней нет nums[${qr - 1}] — последнего числа диапазона.`
            : `prefix[${i}] — сумма nums[0:${i}]. Диапазон кончается перед индексом ${qr}, значит, нужна сумма первых ${qr} чисел.`, 'no');
        }
      } else {
        if (i === ql) {
          picked.push(i);
          const s = pre[qr] - pre[ql];
          say(`Верно: prefix[${qr}] − prefix[${ql}] = ${minus(pre[qr])} − ${pre[ql] < 0 ? `(${minus(pre[ql])})` : pre[ql]} = <b>${minus(s)}</b>. Проверка сложением: ${signed(a.slice(ql, qr))} = ${minus(s)}.`, 'ok');
          setTimeout(() => {
            qi++; picked = [];
            if (qi === qs.length) { phase = 'done'; say(`Готово: ${qs.length} ${qs.length === 1 ? 'запрос' : 'запроса'}, на каждый — одно вычитание. Ошибок: ${errors}.`, 'ok'); }
            draw();
          }, 1400);
        } else {
          errors++;
          say(i === ql - 1 ? `prefix[${ql - 1}] не содержит nums[${ql - 1}]. После вычитания это число останется в ответе, а оно левее диапазона.`
            : i === ql + 1 ? `prefix[${ql + 1}] содержит nums[${ql}] — первое число диапазона. Вычитание уберёт его из ответа.`
            : `Вычитают сумму чисел левее диапазона: nums[0:${ql}], это prefix[${ql}].`, 'no');
        }
      }
      draw();
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'check') check();
      if (b.dataset.act === 'reset') reset();
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    reset();
  });

  /* ── 9з. Равновесный индекс вручную ───────────────────────────── */
  /* data-a — список целых чисел. На каждом индексе студент вводит сумму
     справа: right = total − left − nums[i]. Если left == right, индекс
     найден; иначе nums[i] уходит в left и проверяется следующий индекс. */
  document.querySelectorAll('.balance').forEach(root => {
    const a = json(root, 'a') || [];
    const n = a.length, total = a.reduce((x, y) => x + y, 0);
    let i, left, errors, done;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Найдите равновесный индекс</b><span>total = ${minus(total)}</span></div>
      <div class="widget__body">
        <div class="cells"></div>
        <p class="rwg__now"></p>
        <div class="btnrow slidehand__sum">
          <label>right = <input type="number" inputmode="numeric"></label>
          <button class="btn btn--main" data-act="check">Проверить</button>
        </div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="btnrow"><span style="flex:1"></span><button class="btn" data-act="reset">↻ заново</button></div>
        <div class="legend"><span><i class="l-done"></i>левее i: сумма left</span><span><i class="l-hot"></i>nums[i]</span><span><i class="l-win"></i>правее i: сумма right</span></div>
      </div>`;
    const cells = root.querySelector('.cells'), now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const box = root.querySelector('.slidehand__sum'), input = box.querySelector('input');
    const say = (t, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = t; };
    function reset() {
      i = 0; left = 0; errors = 0; done = n === 0; input.value = '';
      say(`Сумма всего списка total = ${minus(total)} посчитана заранее. Левее индекса 0 чисел нет, left = 0. Введите сумму правее индекса 0.`);
      draw();
    }
    function draw() {
      const tags = {}; if (!done || i < n) tags[i] = ['i'];
      drawCells(cells, a, { tags, cls: k => done && i >= n ? '' : k < i ? 'is-done' : k === i ? 'is-hot' : 'is-win' });
      now.innerHTML = done ? '' : `i = ${i}, left = <b>${minus(left)}</b>, nums[${i}] = ${minus(a[i])}. right = total − left − nums[i] = ?`;
      box.hidden = done;
    }
    function check() {
      if (done) return;
      const want = total - left - a[i], got = Number(input.value);
      if (input.value.trim() === '' || got !== want) {
        errors++;
        return say(got === total - left && input.value.trim() !== ''
          ? `${minus(got)} = total − left: в эту сумму попало само nums[${i}] = ${minus(a[i])}. Справа от индекса его нет, его тоже нужно вычесть.`
          : `Не сходится. Справа — всё, кроме левой части и самого nums[${i}]: ${minus(total)} − ${minus(left)} − ${minus(a[i])}.`.replace(/− −/g, '+ '), 'no');
      }
      input.value = '';
      if (left === want) {
        done = true;
        say(`Верно: right = ${minus(want)}, и left = ${minus(left)}. Суммы равны — индекс <b>${i}</b> равновесный. Ошибок: ${errors}.`, 'ok');
      } else {
        const old = left; left += a[i]; i++;
        if (i === n) { done = true; say(`right = ${minus(want)}, left = ${minus(old)}: не равны. Индексы закончились — равновесного нет, ответ <b>−1</b>. Ошибок: ${errors}.`, 'ok'); }
        else { say(`Верно: right = ${minus(want)}, left = ${minus(old)} — не равны. nums[${i - 1}] уходит влево: left = ${minus(left)}. Введите сумму правее индекса ${i}.`); setTimeout(() => input.focus(), 0); }
      }
      draw();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'check') check();
      if (b.dataset.act === 'reset') reset();
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    reset();
  });

  /* ── 9и. Интервалы на оси (без управления) ───────────────────── */
  /* data-a — интервалы, data-name — подпись дорожек (по умолчанию intervals),
     data-hot — индексы подсвеченных интервалов, data-merged — нижняя
     дорожка с блоками, data-merged-name — её подпись. */
  document.querySelectorAll('.ivshow').forEach(root => {
    const a = json(root, 'a') || [];
    const hot = json(root, 'hot') || [];
    const merged = json(root, 'merged');
    const name = root.dataset.name || 'intervals';
    const all = a.flat().concat(merged ? merged.flat() : []);
    const lanes = a.map((p, k) => ({ name: `${name}[${k}]`, bars: [{ s: p[0], e: p[1], cls: hot.includes(k) ? 'is-hot' : '' }] }));
    if (merged) lanes.push({ name: root.dataset.mergedName || 'merged', bars: merged.map(p => ({ s: p[0], e: p[1], cls: 'is-merged' })) });
    root.classList.add('widget');
    root.innerHTML = `<div class="widget__head"><b>${esc(root.dataset.title || 'Интервалы на оси времени')}</b><span>интервал — [start, end)</span></div>
      <div class="widget__body"><div class="ivtrace">${ivSvg(lanes, Math.min(...all) - 1, Math.max(...all) + 1)}</div></div>`;
  });

  /* ── 9й. Два интервала ────────────────────────────────────────── */
  /* data-a и data-b — интервалы [start, end). A стоит на месте, B двигается
     кнопками. Под осью — условие пересечения с подставленными числами
     и что получилось: пересечение, касание, вложение или промежуток. */
  document.querySelectorAll('.ivpair').forEach(root => {
    const A = json(root, 'a') || [10, 14];
    const B0 = json(root, 'b') || [5, 8];
    let b;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Когда два интервала пересекаются')}</b><span>интервал — полуинтервал [start, end)</span></div>
      <div class="widget__body">
        <div class="btnrow slide__kbar">
          <span>B</span><button class="btn" data-act="left" aria-label="сдвинуть B влево">← сдвиг</button><button class="btn" data-act="right" aria-label="сдвинуть B вправо">сдвиг →</button>
          <span style="margin-left:14px">длина B</span><button class="btn" data-act="shorter" aria-label="укоротить B">−</button><b class="slide__k"></b><button class="btn" data-act="longer" aria-label="удлинить B">+</button>
        </div>
        <div class="ivtrace"></div>
        <p class="slide__sum" aria-live="polite"></p>
        <div class="btnrow"><button class="btn" data-act="reset">↻ сначала</button></div>
      </div>`;
    const wrap = root.querySelector('.ivtrace'), say = root.querySelector('.slide__sum');
    const lo = A[0] - 9, hi = A[1] + 9;
    function draw() {
      const [s1, e1] = A, [s2, e2] = b;
      const c1 = s1 < e2, c2 = s2 < e1, cross = c1 && c2;
      const lanes = [{ name: 'A', bars: [{ s: s1, e: e1, cls: 'is-prev' }] }, { name: 'B', bars: [{ s: s2, e: e2, cls: 'is-hot' }] }];
      if (cross) lanes.push({ name: 'общая часть', bars: [{ s: Math.max(s1, s2), e: Math.min(e1, e2), cls: 'is-merged' }] });
      wrap.innerHTML = ivSvg(lanes, lo, hi);
      root.querySelector('.slide__k').textContent = e2 - s2;
      root.querySelector('[data-act="left"]').disabled = s2 <= lo;
      root.querySelector('[data-act="right"]').disabled = e2 >= hi;
      root.querySelector('[data-act="shorter"]').disabled = e2 - s2 <= 1;
      root.querySelector('[data-act="longer"]').disabled = e2 >= hi;
      const cond = `a.start &lt; b.end and b.start &lt; a.end → ${s1} &lt; ${e2} and ${s2} &lt; ${e1} → <b>${c1 ? 'True' : 'False'} and ${c2 ? 'True' : 'False'}</b>. `;
      let what;
      if (cross) {
        const ms = Math.max(s1, s2), me = Math.min(e1, e2);
        what = s2 >= s1 && e2 <= e1 ? `B лежит внутри A. Общая часть совпадает с B: [${ms}, ${me}).`
          : s1 >= s2 && e1 <= e2 ? `A лежит внутри B. Общая часть совпадает с A: [${ms}, ${me}).`
          : `Интервалы пересекаются, общая часть [${ms}, ${me}) длиной ${me - ms}.`;
      } else if (s2 === e1 || s1 === e2) {
        const t = s2 === e1 ? e1 : e2;
        what = `Интервалы касаются: один заканчивается в момент ${t}, другой в этот момент начинается. Общего времени нет, поэтому полуинтервалы не пересекаются. В записи с включённым концом, как в LeetCode 56, момент ${t} входит в оба интервала.`;
      } else {
        const gap = s2 > e1 ? s2 - e1 : s1 - e2;
        what = `Интервалы не пересекаются, между ними свободный промежуток длиной ${gap}. Ложно условие ${c1 ? 'b.start &lt; a.end: B начинается после конца A' : 'a.start &lt; b.end: B заканчивается раньше начала A'}.`;
      }
      say.innerHTML = cond + what;
    }
    function reset() { b = B0.slice(); draw(); }
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]'); if (!btn) return;
      const a = btn.dataset.act;
      if (a === 'reset') return reset();
      if (a === 'left' && b[0] > lo) { b[0]--; b[1]--; }
      if (a === 'right' && b[1] < hi) { b[0]++; b[1]++; }
      if (a === 'shorter' && b[1] - b[0] > 1) b[1]--;
      if (a === 'longer' && b[1] < hi) b[1]++;
      draw();
    });
    reset();
  });

  /* ── 9к. Интервалы вручную ────────────────────────────────────── */
  /* data-a — интервалы в порядке заявок, data-goal — merge или conflict.
     Сначала интервалы сортируются по началу кнопкой sorted. Затем
     на каждом интервале решение принимает студент:
     merge — продлить последний блок или начать новый;
     conflict — есть ли конфликт с предыдущим интервалом.
     Неверный ход не выполняется, вместо него — объяснение. */
  document.querySelectorAll('.ivhand').forEach(root => {
    const src = json(root, 'a') || [];
    const goal = root.dataset.goal === 'conflict' ? 'conflict' : 'merge';
    const sorted = src.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    let ordered, k, merged, errors, done;
    const all = src.flat();
    const lo = Math.min(...all) - 1, hi = Math.max(...all) + 1;
    root.classList.add('widget');
    const choice = goal === 'merge'
      ? '<button class="btn" data-act="join">Продлить последний блок</button><button class="btn" data-act="new">Начать новый блок</button>'
      : '<button class="btn" data-act="clash">Конфликт с предыдущим</button><button class="btn" data-act="fine">Конфликта нет</button>';
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || (goal === 'merge' ? 'Объединение вручную' : 'Поиск конфликта вручную'))}</b><span>${goal === 'merge' ? 'сортировка и один проход' : 'сортировка и сравнение соседей'}</span></div>
      <div class="widget__body">
        <div class="ivtrace"></div>
        <p class="rwg__now"></p>
        <div class="btnrow" data-row="sort"><button class="btn btn--main" data-act="sort">sorted(intervals)</button></div>
        <div class="btnrow" data-row="pick" hidden>${choice}</div>
        <p class="hunt__msg" aria-live="polite"></p>
        <div class="btnrow"><span style="flex:1"></span><button class="btn" data-act="reset">↻ заново</button></div>
        <div class="legend"><span><i class="l-ivhot"></i>текущий интервал</span>${goal === 'merge' ? '<span><i class="l-ivmerged"></i>блоки merged</span>' : '<span><i class="l-ivprev"></i>предыдущий интервал</span>'}<span><i class="l-done"></i>пройден</span></div>
      </div>`;
    const wrap = root.querySelector('.ivtrace'), now = root.querySelector('.rwg__now'), msg = root.querySelector('.hunt__msg');
    const rowSort = root.querySelector('[data-row="sort"]'), rowPick = root.querySelector('[data-row="pick"]');
    const say = (t, kind = '') => { msg.className = 'hunt__msg' + (kind ? ' is-' + kind : ''); msg.innerHTML = t; };
    const iv = p => `[${p[0]}, ${p[1]})`;
    function reset() {
      ordered = null; k = 0; merged = []; errors = 0; done = false;
      say('Интервалы стоят в порядке заявок. В таком порядке пересекающиеся интервалы могут оказаться далеко друг от друга. Отсортируйте их по началу.');
      draw();
    }
    function draw() {
      const rows = ordered || src;
      const name = ordered ? 'ordered' : 'intervals';
      const lanes = rows.map((p, j) => {
        let cls = '';
        if (ordered && !done) cls = j === k ? 'is-hot' : (goal === 'conflict' && j === k - 1) ? 'is-prev' : j < k ? 'is-done' : '';
        return { name: `${name}[${j}]`, bars: [{ s: p[0], e: p[1], cls }] };
      });
      if (goal === 'merge' && ordered) lanes.push({ name: 'merged', bars: merged.map(p => ({ s: p[0], e: p[1], cls: 'is-merged' })) });
      wrap.innerHTML = ivSvg(lanes, lo, hi);
      rowSort.hidden = Boolean(ordered);
      rowPick.hidden = !ordered || done;
      if (!ordered || done) now.innerHTML = '';
      else if (goal === 'merge') now.innerHTML = `Интервал ${iv(ordered[k])}. Последний блок merged — ${iv(merged[merged.length - 1])}. Продлить его или начать новый?`;
      else now.innerHTML = `Сравните ordered[${k}] = ${iv(ordered[k])} с предыдущим ordered[${k - 1}] = ${iv(ordered[k - 1])}.`;
    }
    function next() {
      k++;
      if (k === ordered.length) {
        done = true;
        if (goal === 'merge') say(`Готово: merged = ${JSON.stringify(merged).replace(/,/g, ', ')}. ${merged.length} ${plural(merged.length, 'блок', 'блока', 'блоков')} занятости из ${ordered.length} ${plural(ordered.length, 'интервала', 'интервалов', 'интервалов')}. Ошибок: ${errors}.`, 'ok');
        else say(`Все соседние пары проверены, конфликтов нет: can_attend вернёт <b>True</b>. Ошибок: ${errors}.`, 'ok');
      }
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'reset') return reset();
      if (a === 'sort') {
        ordered = sorted.map(p => p.slice());
        if (goal === 'merge') {
          merged = [ordered[0].slice()]; k = 1;
          say(`После сортировки начала идут по возрастанию. merged пуст, поэтому первый интервал ${iv(ordered[0])} начинает первый блок.`);
        } else {
          k = 1;
          say('После сортировки начала идут по возрастанию. Конфликт, если он есть, найдётся у соседней пары: интервал сравнивают только с предыдущим.');
        }
        if (ordered.length < 2) { done = true; say(goal === 'merge' ? `Интервал один, merged = ${JSON.stringify(merged)}.` : 'Интервал один, конфликтов нет: True.', 'ok'); }
        return draw();
      }
      if (!ordered || done) return;
      const [s, en] = ordered[k];
      if (goal === 'merge') {
        const last = merged[merged.length - 1];
        const joins = s <= last[1];
        if (a === 'join' && joins) {
          const old = last[1];
          last[1] = Math.max(last[1], en);
          say(en <= old
            ? `Верно: ${s} ≤ ${old}, интервал ${s < old ? 'пересекает блок' : 'касается блока'}. Его конец ${en} не больше ${old}, блок не меняется: max(${old}, ${en}) = ${old}.`
            : `Верно: ${s} ≤ ${old}, интервал ${s < old ? 'пересекает блок' : 'касается блока'}. Блок продлевается до max(${old}, ${en}) = ${en}.`);
          next();
        } else if (a === 'new' && !joins) {
          merged.push([s, en]);
          say(`Верно: ${s} &gt; ${last[1]}, между блоком и интервалом свободно ${s - last[1]}. Блок ${iv(last)} закрыт: начала следующих интервалов не меньше ${s}, ни один из них его не достанет.`);
          next();
        } else {
          errors++;
          say(joins
            ? `Начало ${s} не больше конца блока ${last[1]}: интервал ${s < last[1] ? 'пересекает блок' : 'касается блока'}, свободного времени между ними нет. Это один блок занятости.`
            : `Между концом блока ${last[1]} и началом ${s} свободно ${s - last[1]}. Если продлить блок, это время станет занятым.`, 'no');
        }
      } else {
        const prev = ordered[k - 1];
        const clash = s < prev[1];
        if (a === 'clash' && clash) {
          done = true;
          say(`Верно: ${s} &lt; ${prev[1]}, интервал ${iv(ordered[k])} начинается до конца ${iv(prev)}. Конфликт найден, can_attend вернёт <b>False</b>. Остальные пары проверять не нужно. Ошибок: ${errors}.`, 'ok');
        } else if (a === 'fine' && !clash) {
          say(s === prev[1] ? `Верно: ${s} = ${prev[1]}, встречи касаются. Одна заканчивается в момент ${s}, другая в этот момент начинается — конфликта нет.` : `Верно: ${s} ≥ ${prev[1]}, интервал начинается после конца предыдущего.`);
          next();
        } else {
          errors++;
          say(clash
            ? `${iv(ordered[k])} начинается в ${s}, а ${iv(prev)} заканчивается в ${prev[1]}: с ${s} до ${Math.min(prev[1], en)} заняты обе встречи.`
            : s === prev[1] ? `Встречи касаются: ${iv(prev)} заканчивается в ${s}, и в этот момент начинается ${iv(ordered[k])}. В полуинтервале [start, end) момент end не входит, конфликта нет.`
            : `${iv(ordered[k])} начинается в ${s}, это позже конца ${iv(prev)} в ${prev[1]}. Общего времени нет.`, 'no');
        }
      }
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
  function call(mode, user, extra) {
    return boot().then(() => new Promise(resolve => {
      const id = ++seq;
      const timer = setTimeout(() => {
        worker.terminate(); worker = null; readyPromise = null;
        setStatus('запуск прерван, Python будет загружен заново');
        resolve({ fatal: 'Код работает дольше 5 секунд и остановлен. Чаще всего это бесконечный цикл: проверьте, что указатели сдвигаются на каждом шаге.' });
      }, 5000);
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
      const r = await call(act === 'run' ? 'run' : 'test', ed.value, extra);
      root.querySelectorAll('[data-act]').forEach(b => b.disabled = false);
      let html = '';
      if (r.fatal) html += `<pre class="sandbox__err">${esc(r.fatal)}</pre>`;
      if (r.results) {
        const ok = r.results.filter(x => x[1]).length;
        html += `<p class="sandbox__sum ${ok === r.results.length ? 'is-ok' : ''}">Прошло тестов: ${ok} из ${r.results.length}</p><ul class="sandbox__list">` +
          r.results.map(([name, pass, doc, msg]) => `<li class="${pass ? 'is-ok' : 'is-no'}"><b>${pass ? '✓' : '✗'} ${esc(name)}</b>${doc ? `<span>${esc(doc)}</span>` : ''}${msg ? `<code>${esc(msg)}</code>` : ''}</li>`).join('') + '</ul>';
      }
      if (r.out) html += `<p class="sandbox__label">вывод print()</p><pre class="sandbox__print">${esc(r.out)}</pre>`;
      if (!html) html = '<p class="sandbox__wait">Код выполнился, вывода нет.</p>';
      out.innerHTML = html;
    });
  });
})();

/* ── 12. Мок-интервью: задача по этапам с секундомером ──────────── */
/* .mockset — карточки задач (.mock-board) и панели задач (.mock).
   В панели этапы .mock__stage с data-title и data-min (минуты по плану).
   Этапы открываются по одному; время каждого этапа запоминается
   и в конце сравнивается с планом. Состояние живёт до перезагрузки. */
(() => {
  const mm = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  document.querySelectorAll('.mockset').forEach(set => {
    const panels = [...set.querySelectorAll('.mock')];
    const cards = [...set.querySelectorAll('.mock-board [data-mock]')];
    const select = (id, scroll) => {
      if (id === 'random') {
        const rest = panels.filter(p => p.hidden);
        id = (rest.length ? rest : panels)[Math.floor(Math.random() * (rest.length || panels.length))].id;
      }
      panels.forEach(p => { p.hidden = p.id !== id; });
      cards.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.mock === id)));
      const p = panels.find(x => x.id === id);
      if (scroll && p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    cards.forEach(c => c.addEventListener('click', () => select(c.dataset.mock, true)));
    // Ссылка вида 06-mok-intervyu.html#task-pair открывает нужную задачу: так ведёт билет мок-интервью № 1.
    const fromHash = panels.find(p => '#' + p.id === location.hash);
    select(fromHash ? fromHash.id : panels[0].id, Boolean(fromHash));
    window.addEventListener('hashchange', () => {
      const p = panels.find(x => '#' + x.id === location.hash);
      if (p) select(p.id, true);
    });
  });

  document.querySelectorAll('.mock').forEach(root => {
    const stages = [...root.querySelectorAll('.mock__stage')];
    const plan = stages.map(s => Number(s.dataset.min) || 0);
    const ends = plan.map((_, k) => plan.slice(0, k + 1).reduce((a, b) => a + b, 0));
    const total = ends[ends.length - 1];
    let open = 1, all = false, sec = 0, timer = null, spent = [], mark = 0;

    const bar = document.createElement('div');
    bar.className = 'mock__bar';
    bar.innerHTML = `
      <div class="mock__clock"><b>00:00</b><span>план ${total} мин · сейчас по плану: ${stages[0].dataset.title}</span></div>
      <div class="btnrow">
        <button class="btn btn--main" type="button" data-act="clock">▶ Старт</button>
        <button class="btn" type="button" data-act="all">Открыть все этапы</button>
        <button class="btn" type="button" data-act="reset">↻ Начать заново</button>
      </div>
      <ol class="mock__nav">${stages.map((s, k) => `<li><button type="button" data-go="${k}"><i>${k + 1}</i>${s.dataset.title}<small>${k ? ends[k - 1] : 0}–${ends[k]} мин</small></button></li>`).join('')}</ol>`;
    root.querySelector('.mock__head').after(bar);
    const clock = bar.querySelector('.mock__clock b'), planNow = bar.querySelector('.mock__clock span');
    const navs = [...bar.querySelectorAll('[data-go]')];

    stages.forEach((s, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--main mock__next';
      b.textContent = k === stages.length - 1 ? '✓ Задача решена' : `Этап пройден → ${stages[k + 1].dataset.title}`;
      b.addEventListener('click', () => next(k));
      s.appendChild(b);
      s.insertAdjacentHTML('afterbegin', `<h3 class="mock__title"><i>${k + 1}</i>${s.dataset.title}<small>по плану ${plan[k]} мин</small></h3>`);
    });
    const summary = document.createElement('div');
    summary.className = 'mock__summary';
    summary.hidden = true;
    root.appendChild(summary);

    function tick() {
      clock.textContent = mm(sec);
      const k = ends.findIndex(e => sec < e * 60);
      planNow.textContent = k === -1 ? `план ${total} мин · время по плану вышло` : `план ${total} мин · сейчас по плану: ${stages[k].dataset.title}`;
      clock.classList.toggle('is-over', sec >= total * 60);
    }
    function startClock() {
      if (timer) return;
      timer = setInterval(() => { sec++; tick(); }, 1000);
      bar.querySelector('[data-act="clock"]').textContent = '⏸ Пауза';
    }
    function stopClock() {
      clearInterval(timer); timer = null;
      bar.querySelector('[data-act="clock"]').textContent = sec ? '▶ Продолжить' : '▶ Старт';
    }
    function draw() {
      stages.forEach((s, k) => {
        s.hidden = !all && k >= open;
        s.querySelector('.mock__next').hidden = all || k !== open - 1 || spent.length === stages.length;
      });
      navs.forEach((b, k) => {
        b.className = k < spent.length ? 'is-done' : k === open - 1 ? 'is-now' : '';
        b.disabled = !all && k >= open;
      });
      bar.querySelector('[data-act="all"]').textContent = all ? 'Скрыть непройденные' : 'Открыть все этапы';
    }
    function next(k) {
      spent[k] = sec - mark; mark = sec;
      if (k === stages.length - 1) return finish();
      open = Math.max(open, k + 2);
      draw();
      stages[k + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function finish() {
      stopClock(); draw();
      const rows = stages.map((s, k) => {
        const over = spent[k] > plan[k] * 60;
        return `<tr><td>${k + 1}. ${s.dataset.title}</td><td>${plan[k]} мин</td><td class="${over ? 'is-over' : ''}">${mm(spent[k] || 0)}</td></tr>`;
      }).join('');
      const extra = spent.map((v, k) => (v || 0) - plan[k] * 60);
      const worst = extra.indexOf(Math.max(...extra));
      const verdict = !sec ? 'Секундомер не запускался, поэтому время этапов не записано.'
        : extra[worst] > 0 ? `Больше всего сверх плана ушло на этап «${stages[worst].dataset.title}»: ${mm(extra[worst])}.`
        : 'Все этапы уложились в план.';
      summary.hidden = false;
      summary.innerHTML = `<p class="mock__summary-head">Задача «${root.dataset.name}» пройдена за ${mm(sec)}</p>
        <div class="table-scroll"><table><thead><tr><th>Этап</th><th>План</th><th>Фактически</th></tr></thead><tbody>${rows}
        <tr><td><b>Всего</b></td><td><b>${total} мин</b></td><td class="${sec > total * 60 ? 'is-over' : ''}"><b>${mm(sec)}</b></td></tr></tbody></table></div>
        <p>${verdict} Пункты для самопроверки — в §4.</p>`;
      summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'clock') timer ? stopClock() : startClock();
      if (b.dataset.act === 'all') { all = !all; draw(); }
      if (b.dataset.act === 'reset') { stopClock(); sec = 0; mark = 0; spent = []; open = 1; all = false; summary.hidden = true; tick(); stopClock(); draw(); root.scrollIntoView({ block: 'start' }); }
      if (b.dataset.go !== undefined) stages[Number(b.dataset.go)].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tick(); draw();
  });

  /* Ответы к примерам скрыты, пока их не открыли. */
  document.querySelectorAll('.mock-ex').forEach(box => {
    const b = box.querySelector('.mock-ex__show');
    b.addEventListener('click', () => {
      const on = box.classList.toggle('is-open');
      b.textContent = on ? 'Скрыть ответы' : 'Показать ответы';
    });
  });
})();

/* ── 13. Билет мок-интервью № 1 ──────────────────────────────────── */
/* .ticket берёт задачи из window.MOCK_POOL (pool.js модуля 16) и тянет
   две: простую и чуть сложнее, из разных модулей. Секундомер — 60 минут,
   по плану 25 на первую задачу и 35 на вторую. */
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mm = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  const pick = xs => xs[Math.floor(Math.random() * xs.length)];
  document.querySelectorAll('.ticket').forEach(root => {
    const pool = window.MOCK_POOL || [];
    if (!pool.length) { root.innerHTML = '<p style="padding:14px">Пул задач не загружен.</p>'; return; }
    const easy = pool.filter(t => t.level === 'easy'), medium = pool.filter(t => t.level === 'medium');
    const PLAN = [25, 35];
    let pair = null, sec = 0, timer = null;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>Билет мок-интервью № 1</b><span>${easy.length} простых · ${medium.length} чуть сложнее</span></div>
      <div class="widget__body">
        <div class="btnrow">
          <button class="btn btn--main" type="button" data-act="draw">Вытянуть билет</button>
          <button class="btn" type="button" data-act="clock" disabled>▶ Старт 60 минут</button>
          <b class="ticket__clock">00:00</b><span class="ticket__plan"></span>
        </div>
        <div class="ticket__tasks"></div>
      </div>`;
    const box = root.querySelector('.ticket__tasks'), clock = root.querySelector('.ticket__clock');
    const plan = root.querySelector('.ticket__plan'), btnClock = root.querySelector('[data-act="clock"]');
    function tick() {
      clock.textContent = mm(sec);
      clock.classList.toggle('is-over', sec >= 60 * 60);
      plan.textContent = !pair ? '' : sec < PLAN[0] * 60 ? 'по плану: задача 1' : sec < 60 * 60 ? 'по плану: задача 2' : 'время секции вышло';
    }
    function stop() { clearInterval(timer); timer = null; btnClock.textContent = sec ? '▶ Продолжить' : '▶ Старт 60 минут'; }
    function card(t, n) {
      const src = t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.source)}</a>` : esc(t.source);
      const where = t.chapter ? `разобрана в главе ${t.chapter}` : `разобрана только в тренажёре модуля ${t.module}`;
      return `<article class="ticket__task">
        <p class="ticket__meta"><b>Задача ${n} · ${n === 1 ? 'простая' : 'чуть сложнее'} · ${PLAN[n - 1]} минут</b><span>модуль ${t.module} · ${src}</span></p>
        <h3>${esc(t.title)}</h3>
        <p class="ticket__say">«${t.say}»</p>
        <p class="ticket__foot">Задача ${where}. <a href="${esc(t.trainer)}">Пройти её по этапам в тренажёре →</a></p>
      </article>`;
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'draw') {
        const first = pick(easy);
        const second = pick(medium.filter(t => t.module !== first.module));
        pair = [first, second];
        stop(); sec = 0; tick();
        box.innerHTML = card(first, 1) + card(second, 2);
        b.textContent = '↻ Другой билет';
        btnClock.disabled = false;
      }
      if (b.dataset.act === 'clock') {
        if (timer) return stop();
        timer = setInterval(() => { sec++; tick(); }, 1000);
        btnClock.textContent = '⏸ Пауза';
      }
    });
    tick();
  });
})();
