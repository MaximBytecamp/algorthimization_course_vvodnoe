/* ОП.04 «Алгоритмы на строках» — интерактивные схемы книги.
   Общие блоки (вопросы, песочница, график замеров, вкладки) берутся из
   ../massivy/algo.js и book.js, здесь только то, что относится к строкам.

   Строка в Python — последовательность кодовых точек Unicode. В JavaScript
   строка хранит единицы UTF-16, поэтому здесь строки всегда разбираются
   через Array.from: так длина и индексы совпадают с Python.

   Части файла:
     1. общие функции: repr как в Python, видимый символ, срез
     2. .strview  — лента символов, индекс и срез
     3. .memsteps — имена и объекты по шагам кода
     4. .strcmp   — сравнение двух строк посимвольно
     5. .codes    — номер, UTF-8 и вид каждого символа
     6. .cmap     — карта кодов ASCII и кириллицы
     7. .norm     — шаги нормализации и группы ключей
     8. .build    — сколько символов копирует сборка строки
     9. .freq     — частоты символов двух строк
    10. .mirror   — палиндром: указатели с двух концов
    11. .parse    — разбор строки событий                                   */
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const json = (node, name) => { try { return JSON.parse(node.dataset[name]); } catch (_) { return null; } };
  const cps = s => Array.from(s);
  const hex = (n, w = 4) => n.toString(16).toUpperCase().padStart(w, '0');

  /* ── 1. Общие функции ─────────────────────────────────────────── */
  /* repr строки по правилам Python: непечатаемые символы (категории C и Z,
     кроме обычного пробела) записываются escape-последовательностью. */
  const NONPRINT = /^[\p{C}\p{Z}]$/u;
  function pyChar(ch) {
    if (ch === '\\') return '\\\\';
    if (ch === "'") return "\\'";
    if (ch === '\n') return '\\n';
    if (ch === '\t') return '\\t';
    if (ch === '\r') return '\\r';
    if (ch !== ' ' && NONPRINT.test(ch)) {
      const c = ch.codePointAt(0);
      if (c < 0x100) return '\\x' + c.toString(16).padStart(2, '0');
      if (c < 0x10000) return '\\u' + c.toString(16).padStart(4, '0');
      return '\\U' + c.toString(16).padStart(8, '0');
    }
    return ch;
  }
  const pyRepr = s => "'" + cps(s).map(pyChar).join('') + "'";
  const pyList = a => '[' + a.map(pyRepr).join(', ') + ']';

  /* Символ в ячейке: невидимые и комбинируемые получают видимую замену. */
  function shown(ch) {
    if (ch === ' ') return { t: '␣', cls: 'is-space', tip: 'пробел' };
    if (ch === ' ') return { t: '⍽', cls: 'is-space', tip: 'неразрывный пробел \\xa0' };
    if (ch === '\t') return { t: '⇥', cls: 'is-space', tip: 'табуляция \\t' };
    if (ch === '\n') return { t: '↵', cls: 'is-space', tip: 'перевод строки \\n' };
    if (/^\p{M}$/u.test(ch)) return { t: '◌' + ch, cls: 'is-mark', tip: 'комбинируемый знак U+' + hex(ch.codePointAt(0)) };
    if (/^[\p{C}\p{Z}]$/u.test(ch)) return { t: pyChar(ch), cls: 'is-ctl', tip: 'невидимый символ U+' + hex(ch.codePointAt(0)) };
    return { t: ch, cls: '', tip: '' };
  }
  function cellHTML(ch, opts = {}) {
    const v = shown(ch);
    const cls = ['cell', opts.cls || ''].join(' ');
    return `<div class="${cls}"${v.tip ? ` title="${esc(v.tip)}"` : ''}>`
      + (opts.top != null ? `<span class="cell__idx">${opts.top}</span>` : '')
      + `<span class="cell__val ${v.cls}">${esc(v.t)}</span>`
      + (opts.bottom != null ? `<span class="cell__idx cell__idx--neg">${opts.bottom}</span>` : '')
      + (opts.tags != null ? `<span class="cell__tags">${opts.tags}</span>` : '')
      + '</div>';
  }

  /* Индексы среза s[start:stop:step] по правилам Python (PySlice_AdjustIndices). */
  function sliceIdx(n, start, stop, step) {
    if (step === 0) return { err: 'ValueError: slice step cannot be zero' };
    const adj = (v, def) => {
      if (v === null) return def;
      if (v < 0) { v += n; if (v < 0) v = step < 0 ? -1 : 0; }
      else if (v >= n) v = step < 0 ? n - 1 : n;
      return v;
    };
    const a = adj(start, step < 0 ? n - 1 : 0), b = adj(stop, step < 0 ? -1 : n);
    const out = [];
    for (let i = a; step > 0 ? i < b : i > b; i += step) out.push(i);
    return { idx: out };
  }
  const intOrNull = v => { v = String(v).trim(); if (v === '') return null; return /^[-+]?\d+$/.test(v) ? parseInt(v, 10) : NaN; };

  /* ── 2. Лента символов, индекс и срез ─────────────────────────── */
  /* data-s — строка, data-a, data-b, data-c — начало, конец и шаг среза
     (пусто — значение по умолчанию), data-i — индекс одного символа. */
  document.querySelectorAll('.strview').forEach(root => {
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Строка s')}</b><span>измените строку и числа</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>s =</span><input class="sx-input" type="text" spellcheck="false"></label>
        <div class="sx-tape"></div>
        <div class="sx-ops">
          <label class="sx-op"><code>s[</code><input class="sx-num" data-k="i" inputmode="numeric"><code>]</code></label>
          <span class="sx-res sx-res--i"></span>
        </div>
        <div class="sx-ops">
          <label class="sx-op"><code>s[</code><input class="sx-num" data-k="a" inputmode="numeric"><code>:</code><input class="sx-num" data-k="b" inputmode="numeric"><code>:</code><input class="sx-num" data-k="c" inputmode="numeric"><code>]</code></label>
          <span class="sx-res sx-res--s"></span>
        </div>
        <div class="legend"><span><i class="l-i"></i>символ s[i]</span><span><i class="l-done"></i>символы среза, цифра снизу — порядок в результате</span></div>
      </div>
      <div class="widget__foot sx-note"></div>`;
    const inp = root.querySelector('.sx-input'), tape = root.querySelector('.sx-tape');
    const num = k => root.querySelector(`.sx-num[data-k="${k}"]`);
    inp.value = root.dataset.s || 'склад';
    num('i').value = root.dataset.i ?? '0';
    num('a').value = root.dataset.a ?? '1';
    num('b').value = root.dataset.b ?? '4';
    num('c').value = root.dataset.c ?? '';
    const draw = () => {
      const s = inp.value, ch = cps(s), n = ch.length;
      const i = intOrNull(num('i').value);
      let iIdx = null, iText;
      if (i === null || Number.isNaN(i)) iText = '<span class="sx-err">впишите целое число</span>';
      else if (i >= n || i < -n) iText = `<span class="sx-err">IndexError: string index out of range</span>`;
      else { iIdx = i < 0 ? i + n : i; iText = `→ <code>${esc(pyRepr(ch[iIdx]))}</code>${i < 0 ? ` <small>то же, что s[${iIdx}]</small>` : ''}`; }
      const a = intOrNull(num('a').value), b = intOrNull(num('b').value), c = intOrNull(num('c').value);
      let sl, sText;
      if ([a, b, c].some(Number.isNaN)) sText = '<span class="sx-err">впишите целые числа или оставьте поле пустым</span>';
      else {
        sl = sliceIdx(n, a, b, c === null ? 1 : c);
        sText = sl.err ? `<span class="sx-err">${sl.err}</span>` : `→ <code>${esc(pyRepr(sl.idx.map(k => ch[k]).join('')))}</code> <small>длина ${sl.idx.length}</small>`;
      }
      const order = new Map((sl && sl.idx) ? sl.idx.map((k, m) => [k, m + 1]) : []);
      tape.innerHTML = n ? `<div class="cells sx-cells">${ch.map((x, k) => cellHTML(x, {
        top: k, bottom: k - n,
        cls: (k === iIdx ? 'is-i ' : '') + (order.has(k) ? 'is-done' : ''),
        tags: order.has(k) ? `<span class="tag tag--w">${order.get(k)}</span>` : ''
      })).join('')}</div>` : '<p class="sx-empty">Пустая строка: <code>len(s) == 0</code>, любой индекс даёт IndexError, любой срез — <code>\'\'</code>.</p>';
      root.querySelector('.sx-res--i').innerHTML = iText;
      root.querySelector('.sx-res--s').innerHTML = sText;
      root.querySelector('.sx-note').innerHTML = `<code>len(s) == ${n}</code>. Индексы сверху — от начала, с 0 до ${Math.max(n - 1, 0)}; снизу — от конца, с −${n} до −1. Срез за границы строки не выходит и ошибку не даёт.`;
    };
    root.querySelectorAll('input').forEach(x => x.addEventListener('input', draw));
    draw();
  });

  /* ── 3. Имена и объекты по шагам кода ─────────────────────────── */
  /* data-code — строки кода через \n; data-steps — список шагов:
     {line, names: {имя: номер объекта}, objs: [{id, v, kind, mark}], say, err}.
     Объект kind="str" рисуется лентой символов, kind="list" — списком ячеек. */
  document.querySelectorAll('.memsteps').forEach(root => {
    const code = (root.dataset.code || '').split('\n');
    const steps = json(root, 'steps') || [];
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Имена и объекты')}</b><span class="ms-count"></span></div>
      <div class="ms-grid">
        <pre class="tracer__code ms-code">${code.map((l, k) => `<div><i>${k + 1}</i>${esc(l)}</div>`).join('')}</pre>
        <div class="ms-mem"><span class="tracer__label">имена</span><div class="ms-names"></div><span class="tracer__label">объекты в памяти</span><div class="ms-objs"></div></div>
      </div>
      <div class="tracer__say ms-say"></div>
      <div class="tracer__ctrl"><div class="btnrow"><button class="btn" data-go="-1">← шаг</button><button class="btn btn--main" data-go="1">шаг →</button><button class="btn" data-go="0">↺ сначала</button></div></div>`;
    let at = 0;
    const show = () => {
      const st = steps[at];
      root.querySelectorAll('.ms-code div').forEach((d, k) => { d.classList.toggle('is-now', k + 1 === st.line && !st.err); d.classList.toggle('is-err', k + 1 === st.line && !!st.err); });
      const colors = ['var(--ptr-i)', 'var(--ptr-j)', 'var(--ptr-w)', 'var(--ptr-r)'];
      root.querySelector('.ms-names').innerHTML = Object.entries(st.names).map(([nm, id]) => `<span class="ms-name" style="--c:${colors[id % 4]}"><b>${esc(nm)}</b> → объект ${id}</span>`).join('') || '<span class="ms-none">пока нет</span>';
      root.querySelector('.ms-objs').innerHTML = st.objs.map(o => {
        const holders = Object.entries(st.names).filter(([, id]) => id === o.id).map(([nm]) => nm);
        const body = o.kind === 'list'
          ? `<div class="cells">${o.v.map((x, k) => cellHTML(x, { top: k, cls: (o.mark || []).includes(k) ? 'is-flash is-hot' : '' })).join('')}</div>`
          : `<div class="cells">${cps(o.v).map((x, k) => cellHTML(x, { top: k })).join('')}</div>`;
        return `<div class="ms-obj${holders.length ? '' : ' is-orphan'}${o.fresh ? ' is-fresh' : ''}" style="--c:${colors[o.id % 4]}">
          <div class="ms-obj__head"><b>объект ${o.id}</b><span>${o.kind === 'list' ? 'list · можно менять' : 'str · менять нельзя'}</span><em>${holders.length ? 'на него указывает: ' + holders.join(', ') : 'на него никто не указывает'}</em></div>${body}</div>`;
      }).join('');
      root.querySelector('.ms-say').innerHTML = `<b>шаг ${at + 1}</b>${st.say}`;
      root.querySelector('.ms-count').textContent = `шаг ${at + 1} из ${steps.length}`;
      root.querySelector('[data-go="-1"]').disabled = at === 0;
      root.querySelector('[data-go="1"]').disabled = at === steps.length - 1;
    };
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      const d = +b.dataset.go; at = d === 0 ? 0 : Math.max(0, Math.min(steps.length - 1, at + d)); show();
    }));
    if (steps.length) show();
  });

  /* ── 4. Сравнение двух строк ──────────────────────────────────── */
  /* data-a, data-b — строки. Символы сравниваются по номерам слева направо
     до первого различия; если одна строка — начало другой, меньше короткая. */
  document.querySelectorAll('.strcmp').forEach(root => {
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Сравнение строк')}</b><span>впишите две строки</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>a =</span><input class="sx-input" data-k="a" type="text" spellcheck="false"></label>
        <label class="sx-field"><span>b =</span><input class="sx-input" data-k="b" type="text" spellcheck="false"></label>
        <div class="sc-rows"></div>
        <p class="sc-verdict"></p>
      </div>`;
    const A = root.querySelector('[data-k="a"]'), B = root.querySelector('[data-k="b"]');
    A.value = root.dataset.a ?? 'Склад'; B.value = root.dataset.b ?? 'склад';
    const draw = () => {
      const a = cps(A.value), b = cps(B.value);
      let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++;
      const row = (s, name) => `<div class="sc-row"><code class="sc-name">${name}</code><div class="cells">${s.map((x, m) => cellHTML(x, {
        top: m, cls: m < k ? 'is-done' : (m === k ? 'is-diff' : 'is-out'),
        tags: `<span class="sc-code">${x.codePointAt(0)}</span>`
      })).join('')}${s.length === k ? '<div class="cell is-diff"><span class="cell__idx">' + k + '</span><span class="cell__val sc-end">конец</span><span class="cell__tags"></span></div>' : ''}</div></div>`;
      root.querySelector('.sc-rows').innerHTML = row(a, 'a') + row(b, 'b');
      let v;
      if (a.length === b.length && k === a.length) v = `Строки совпадают по всем ${k} символам: <code>a == b</code> → <code>True</code>.`;
      else if (k === a.length) v = `Символы 0…${k - 1} совпали, и строка <code>a</code> закончилась раньше. Короткая строка меньше: <code>a &lt; b</code> → <code>True</code>.`;
      else if (k === b.length) v = `Символы 0…${k - 1} совпали, и строка <code>b</code> закончилась раньше. Короткая строка меньше: <code>a &lt; b</code> → <code>False</code>.`;
      else {
        const ca = a[k].codePointAt(0), cb = b[k].codePointAt(0);
        v = `${k ? `Символы 0…${k - 1} совпали. ` : ''}Первое различие — индекс ${k}: <code>ord(${esc(pyRepr(a[k]))}) == ${ca}</code>, <code>ord(${esc(pyRepr(b[k]))}) == ${cb}</code>. Дальше символы не сравниваются: <code>a &lt; b</code> → <code>${ca < cb ? 'True' : 'False'}</code>.`;
      }
      root.querySelector('.sc-verdict').innerHTML = v;
    };
    [A, B].forEach(x => x.addEventListener('input', draw));
    draw();
  });

  /* ── 5. Номер, UTF-8 и вид каждого символа ────────────────────── */
  /* data-s — строка, data-presets — [[подпись, строка], ...]. */
  function kindOf(ch) {
    const t = r => r.test(ch);
    if (t(/^\p{Lu}$/u)) return 'буква, заглавная';
    if (t(/^\p{Ll}$/u)) return 'буква, строчная';
    if (t(/^\p{L}$/u)) return 'буква';
    if (t(/^\p{Nd}$/u)) return 'цифра';
    if (t(/^\p{N}$/u)) return 'число, не цифра';
    if (t(/^\p{M}$/u)) return 'комбинируемый знак';
    if (ch === ' ') return 'пробел';
    if (t(/^\p{Zs}$/u)) return 'пробел другого вида';
    if (t(/^\p{Cc}$/u)) return 'управляющий';
    if (t(/^\p{Cf}$/u)) return 'невидимый служебный';
    if (t(/^\p{P}$/u)) return 'знак препинания';
    if (t(/^\p{S}$/u)) return 'символ';
    return 'другое';
  }
  function scriptOf(ch) {
    if (/^\p{Script=Cyrillic}$/u.test(ch)) return 'кириллица';
    if (/^\p{Script=Latin}$/u.test(ch)) return 'латиница';
    return '—';
  }
  const utf8 = ch => [...new TextEncoder().encode(ch)];
  document.querySelectorAll('.codes').forEach(root => {
    const presets = json(root, 'presets') || [];
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Из чего состоит строка')}</b><span>один символ — одна строка таблицы</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>s =</span><input class="sx-input" type="text" spellcheck="false"></label>
        ${presets.length ? `<div class="btnrow cd-presets">${presets.map((p, k) => `<button class="btn" data-p="${k}">${esc(p[0])}</button>`).join('')}</div>` : ''}
        <div class="table-scroll"><table class="cd-table"><thead><tr><th>i</th><th>символ</th><th>ord</th><th>номер</th><th>байты UTF-8</th><th>вид</th><th>письменность</th></tr></thead><tbody></tbody></table></div>
      </div>
      <div class="widget__foot cd-sum"></div>`;
    const inp = root.querySelector('.sx-input');
    inp.value = root.dataset.s ?? 'Ёлка';
    const draw = () => {
      const ch = cps(inp.value);
      let bytes = 0;
      root.querySelector('tbody').innerHTML = ch.map((x, k) => {
        const b = utf8(x); bytes += b.length;
        const v = shown(x), c = x.codePointAt(0), sc = scriptOf(x);
        return `<tr class="${sc === 'латиница' ? 'is-lat' : ''}"><td>${k}</td><td class="cd-ch ${v.cls}">${esc(v.t)}</td><td>${c}</td><td>U+${hex(c)}</td><td><span class="cd-bytes">${b.map(y => `<i>${hex(y, 2)}</i>`).join('')}</span> <small>${b.length}</small></td><td>${kindOf(x)}</td><td>${sc}</td></tr>`;
      }).join('') || '<tr><td colspan="7">пустая строка</td></tr>';
      const lat = ch.filter(x => scriptOf(x) === 'латиница').length, cyr = ch.filter(x => scriptOf(x) === 'кириллица').length;
      root.querySelector('.cd-sum').innerHTML = `<code>len(s) == ${ch.length}</code> · <code>len(s.encode('utf-8')) == ${bytes}</code>`
        + (lat && cyr ? ' · <b class="sx-err">в одном слове смешаны латиница и кириллица</b>' : '');
    };
    inp.addEventListener('input', draw);
    root.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { inp.value = presets[+b.dataset.p][1]; draw(); }));
    draw();
  });

  /* ── 6. Карта кодов ───────────────────────────────────────────── */
  /* Две части таблицы Unicode: печатные символы ASCII (32–126) и блок
     кириллицы (1024–1119). Символы строки из поля подсвечиваются. */
  document.querySelectorAll('.cmap').forEach(root => {
    root.classList.add('widget');
    const block = (from, to, title) => {
      let rows = '';
      for (let r = from - from % 16; r <= to; r += 16) {
        let cells = '';
        for (let c = r; c < r + 16; c++) {
          if (c < from || c > to) { cells += '<span class="cm-c is-none"></span>'; continue; }
          const ch = String.fromCodePoint(c);
          const zone = /[A-Z]/.test(ch) || (c >= 1040 && c <= 1071) || c === 1025 ? 'up' : /[a-z]/.test(ch) || (c >= 1072 && c <= 1103) || c === 1105 ? 'lo' : /[0-9]/.test(ch) ? 'dg' : '';
          cells += `<button type="button" class="cm-c${zone ? ' z-' + zone : ''}${c === 1025 || c === 1105 ? ' is-yo' : ''}" data-c="${c}" title="${c}">${ch === ' ' ? '␣' : esc(ch)}</button>`;
        }
        rows += `<div class="cm-row"><span class="cm-lbl">${r}</span>${cells}</div>`;
      }
      return `<div class="cm-block"><span class="tracer__label">${title}</span>${rows}</div>`;
    };
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Карта кодов')}</b><span>номер строки + столбец = ord</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>подсветить</span><input class="sx-input" type="text" spellcheck="false"></label>
        <div class="cm-wrap">${block(32, 126, 'ASCII: цифры, латиница, знаки · 32–126')}${block(1024, 1119, 'Кириллица · 1024–1119')}</div>
        <div class="legend"><span><i class="l-up"></i>заглавные</span><span><i class="l-lo"></i>строчные</span><span><i class="l-dg"></i>цифры</span><span><i class="l-yo"></i>Ё и ё</span><span><i class="l-hit"></i>символ из поля</span></div>
      </div>
      <div class="widget__foot cm-info">Нажмите на символ, чтобы увидеть его номер.</div>`;
    const inp = root.querySelector('.sx-input');
    inp.value = root.dataset.s ?? 'ёжик';
    const info = root.querySelector('.cm-info');
    const hi = () => {
      const set = new Set(cps(inp.value).map(x => x.codePointAt(0)));
      root.querySelectorAll('.cm-c[data-c]').forEach(b => b.classList.toggle('is-hit', set.has(+b.dataset.c)));
      const sorted = cps(inp.value).sort((x, y) => x.codePointAt(0) - y.codePointAt(0));
      info.innerHTML = inp.value ? `<code>sorted(${esc(pyRepr(inp.value))})</code> → <code>${esc(pyList(sorted))}</code> — символы по возрастанию номера.` : 'Нажмите на символ, чтобы увидеть его номер.';
    };
    root.querySelectorAll('.cm-c[data-c]').forEach(b => b.addEventListener('click', () => {
      const c = +b.dataset.c, ch = String.fromCodePoint(c);
      info.innerHTML = `<code>ord(${esc(pyRepr(ch))}) == ${c}</code> · <code>chr(${c}) == ${esc(pyRepr(ch))}</code> · номер U+${hex(c)} · в UTF-8 ${utf8(ch).length} байт${utf8(ch).length === 1 ? '' : 'а'}: ${utf8(ch).map(y => hex(y, 2)).join(' ')}`;
    }));
    inp.addEventListener('input', hi);
    hi();
  });

  /* ── 7. Нормализация ──────────────────────────────────────────── */
  /* data-items — исходные строки. Шаги идут в фиксированном порядке, каждый
     можно выключить. Повторяют функции Python из главы 0.3. */
  const NORM_STEPS = [
    { id: 'nfc', code: "unicodedata.normalize('NFC', key)", say: 'Unicode NFC: букву из двух кодовых точек записать одной', f: s => s.normalize('NFC') },
    { id: 'lower', code: 'key.lower()', say: 'Регистр: все буквы строчные', f: s => s.toLowerCase() },
    { id: 'yo', code: "key.replace('ё', 'е')", say: 'Буква ё: заменить на е', f: s => s.replaceAll('ё', 'е') },
    { id: 'dash', code: "key.replace('-', ' ')", say: 'Дефис: заменить на пробел', f: s => s.replaceAll('-', ' ') },
    { id: 'space', code: "' '.join(key.split())", say: 'Пробелы: убрать по краям, серию пробелов заменить одним', f: s => s.split(/[\s\u001c-\u001f\u0085]+/u).filter(Boolean).join(' ') },
  ];
  document.querySelectorAll('.norm').forEach(root => {
    const items = json(root, 'items') || [];
    const on = new Set((root.dataset.on || '').split(/\s+/).filter(Boolean));
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Нормализация')}</b><span class="nm-count"></span></div>
      <div class="widget__body">
        <div class="nm-steps">${NORM_STEPS.map(s => `<label class="nm-step"><input type="checkbox" data-s="${s.id}"${on.has(s.id) ? ' checked' : ''}><span>${s.say}</span><code>${esc(s.code)}</code></label>`).join('')}</div>
        <figure class="code nm-code"><figcaption><span>функция ключа</span><span>собрана из отмеченных шагов</span></figcaption><pre></pre></figure>
        <span class="tracer__label">группы: ключ → исходные строки</span>
        <div class="nm-groups"></div>
      </div>`;
    const draw = () => {
      const act = NORM_STEPS.filter(s => root.querySelector(`[data-s="${s.id}"]`).checked);
      root.querySelector('.nm-code pre').innerHTML = '<span class="k">def</span> <span class="f">city_key</span>(text):\n    key = text\n'
        + act.map(s => `    key = ${esc(s.code)}\n`).join('') + '    <span class="k">return</span> key';
      const groups = new Map();
      items.forEach(x => { const k = act.reduce((v, s) => s.f(v), x); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); });
      root.querySelector('.nm-groups').innerHTML = [...groups].map(([k, xs]) =>
        `<div class="nm-g${xs.length > 1 ? ' is-merged' : ''}"><code class="nm-key">${esc(pyRepr(k))}</code><span class="nm-arrow">←</span><div class="nm-raw">${xs.map(x => `<code>${esc(pyRepr(x))}</code>`).join('')}</div></div>`).join('');
      root.querySelector('.nm-count').textContent = `${items.length} строк · ${groups.size} разных ключей`;
    };
    root.querySelectorAll('input').forEach(x => x.addEventListener('change', draw));
    draw();
  });

  /* ── 8. Сборка строки ─────────────────────────────────────────── */
  /* data-s — итоговая строка. Слева каждый шаг создаёт новую строку и
     копирует в неё все символы; справа части копятся в списке и
     соединяются одним join. Счётчики — число скопированных символов. */
  document.querySelectorAll('.build').forEach(root => {
    const ch = cps(root.dataset.s || 'склад'), n = ch.length;
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Сборка строки по символу')}</b><span class="bd-count"></span></div>
      <div class="bd-grid">
        <div class="bd-lane"><span class="tracer__label">s = s + ch · новая строка на каждом шаге</span><div class="bd-rows bd-rows--plus"></div><p class="bd-sum bd-sum--plus"></p></div>
        <div class="bd-lane"><span class="tracer__label">parts.append(ch), в конце ''.join(parts)</span><div class="bd-rows bd-rows--join"></div><p class="bd-sum bd-sum--join"></p></div>
      </div>
      <div class="tracer__say bd-say"></div>
      <div class="tracer__ctrl"><div class="btnrow"><button class="btn" data-go="-1">← шаг</button><button class="btn btn--main" data-go="1">шаг →</button><button class="btn" data-go="0">↺ сначала</button></div></div>`;
    let at = 0; const N = n + 1;
    const show = () => {
      const k = Math.min(at, n);
      let plus = '', copiedPlus = 0;
      for (let m = 1; m <= k; m++) {
        copiedPlus += m;
        plus += `<div class="bd-row${m === k ? ' is-now' : ' is-old'}"><div class="cells">${ch.slice(0, m).map(x => cellHTML(x)).join('')}</div><small>скопировано ${m}</small></div>`;
      }
      const done = at === N;
      const join = `<div class="bd-row"><code>parts =</code>${k ? `<div class="cells">${ch.slice(0, k).map(x => cellHTML(x)).join('')}</div>` : '<code>[]</code>'}</div>`
        + (done ? `<div class="bd-row is-now"><code>''.join</code><div class="cells">${ch.map(x => cellHTML(x)).join('')}</div><small>скопировано ${n}</small></div>` : '');
      root.querySelector('.bd-rows--plus').innerHTML = plus || '<p class="sx-empty">s = \'\'</p>';
      root.querySelector('.bd-rows--join').innerHTML = join;
      root.querySelector('.bd-sum--plus').innerHTML = `скопировано символов: <b>${copiedPlus}</b>`;
      root.querySelector('.bd-sum--join').innerHTML = `скопировано символов: <b>${done ? n : 0}</b>`;
      root.querySelector('.bd-say').innerHTML = at === 0
        ? '<b>начало</b>Строка пустая, список частей пустой.'
        : done
          ? `<b>итог</b>Слева скопировано 1 + 2 + … + ${n} = ${n * (n + 1) / 2} символов: при длине n это n(n + 1)/2, рост O(n²). Справа символы попали в список по одному, и <code>join</code> один раз скопировал ${n} символов в итоговую строку: O(n).`
          : `<b>шаг ${at}</b>Слева строка длины ${k - 1} не меняется: создаётся новая строка длины ${k}, в неё копируются ${k - 1} старых символов и один новый. Справа в список добавлен один элемент, строки не копируются.`;
      root.querySelector('.bd-count').textContent = `шаг ${at} из ${N}`;
      root.querySelector('[data-go="-1"]').disabled = at === 0;
      root.querySelector('[data-go="1"]').disabled = at === N;
    };
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      const d = +b.dataset.go; at = d === 0 ? 0 : Math.max(0, Math.min(N, at + d)); show();
    }));
    show();
  });

  /* ── 9. Частоты двух строк ────────────────────────────────────── */
  /* data-a, data-b — строки. Столбики — сколько раз символ входит в каждую.
     Переключатель «ключ» применяет lower() и убирает пробелы. */
  document.querySelectorAll('.freq').forEach(root => {
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Частоты символов')}</b><span>Counter(a) и Counter(b)</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>a =</span><input class="sx-input" data-k="a" type="text" spellcheck="false"></label>
        <label class="sx-field"><span>b =</span><input class="sx-input" data-k="b" type="text" spellcheck="false"></label>
        <label class="nm-step fq-norm"><input type="checkbox"><span>Сначала привести к ключу</span><code>''.join(text.lower().split())</code></label>
        <div class="fq-bars"></div>
        <div class="fq-sorted"></div>
        <div class="legend"><span><i class="l-a"></i>a</span><span><i class="l-b"></i>b</span><span><i class="l-diff"></i>частоты различаются</span></div>
      </div>
      <div class="widget__foot fq-verdict"></div>`;
    const A = root.querySelector('[data-k="a"]'), B = root.querySelector('[data-k="b"]'), N = root.querySelector('.fq-norm input');
    A.value = root.dataset.a ?? 'листок'; B.value = root.dataset.b ?? 'слиток';
    N.checked = root.dataset.norm === 'on';
    const key = s => N.checked ? s.toLowerCase().split(/\s+/u).join('') : s;
    const count = s => { const m = new Map(); cps(s).forEach(x => m.set(x, (m.get(x) || 0) + 1)); return m; };
    const draw = () => {
      const a = key(A.value), b = key(B.value), ca = count(a), cb = count(b);
      const all = [...new Set([...ca.keys(), ...cb.keys()])].sort((x, y) => x.codePointAt(0) - y.codePointAt(0));
      const top = Math.max(1, ...ca.values(), ...cb.values());
      root.querySelector('.fq-bars').innerHTML = all.map(x => {
        const p = ca.get(x) || 0, q = cb.get(x) || 0, v = shown(x);
        return `<div class="fq-col${p !== q ? ' is-diff' : ''}"><div class="fq-pair"><span class="fq-bar fq-bar--a" style="height:${p / top * 100}%"><i>${p}</i></span><span class="fq-bar fq-bar--b" style="height:${q / top * 100}%"><i>${q}</i></span></div><b class="${v.cls}">${esc(v.t)}</b></div>`;
      }).join('') || '<p class="sx-empty">Обе строки пустые.</p>';
      const sa = cps(a).sort((x, y) => x.codePointAt(0) - y.codePointAt(0)), sb = cps(b).sort((x, y) => x.codePointAt(0) - y.codePointAt(0));
      root.querySelector('.fq-sorted').innerHTML = `<code>sorted(a)</code> → <code>${esc(pyRepr(sa.join('')))}</code><br><code>sorted(b)</code> → <code>${esc(pyRepr(sb.join('')))}</code> <small>(списки символов записаны строкой)</small>`;
      const diff = all.filter(x => (ca.get(x) || 0) !== (cb.get(x) || 0));
      root.querySelector('.fq-verdict').innerHTML = diff.length
        ? `Частоты различаются у символов ${diff.map(x => `<code>${esc(pyRepr(x))}</code>`).join(', ')}: строки — не анаграммы.`
        : `Каждый символ входит в обе строки одинаковое число раз: <code>Counter(a) == Counter(b)</code> → <code>True</code>, строки — анаграммы.`;
    };
    [A, B].forEach(x => x.addEventListener('input', draw)); N.addEventListener('change', draw);
    draw();
  });

  /* ── 10. Палиндром: указатели с двух концов ───────────────────── */
  /* data-s — фраза. Указатель i идёт слева, j справа; символы, которые не
     буква и не цифра (isalnum), пропускаются; буквы сравниваются после lower(). */
  const isAlnum = ch => /^[\p{L}\p{N}]$/u.test(ch);
  document.querySelectorAll('.mirror').forEach(root => {
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Палиндром: указатели с двух концов')}</b><span class="mr-count"></span></div>
      <div class="widget__body">
        <label class="sx-field"><span>s =</span><input class="sx-input" type="text" spellcheck="false"></label>
        <div class="mr-tape"></div>
        <div class="legend"><span><i class="l-done"></i>пара совпала</span><span><i class="l-out"></i>пропущен: не буква и не цифра</span><span><i class="l-no"></i>пара не совпала</span></div>
      </div>
      <div class="tracer__say mr-say"></div>
      <div class="tracer__ctrl"><div class="btnrow"><button class="btn" data-go="-1">← шаг</button><button class="btn btn--main" data-go="1">шаг →</button><button class="btn" data-go="0">↺ сначала</button></div></div>`;
    const inp = root.querySelector('.sx-input');
    inp.value = root.dataset.s ?? 'А роза упала на лапу Азора';
    let frames = [], at = 0;
    const plan = () => {
      const ch = cps(inp.value);
      frames = [{ i: 0, j: ch.length - 1, ok: new Set(), skip: new Set(), bad: null, say: `<b>начало</b>i = 0, j = ${ch.length - 1}: указатели на первом и последнем символе.` }];
      let i = 0, j = ch.length - 1; const ok = new Set(), skip = new Set();
      const push = (say, bad = null) => frames.push({ i, j, ok: new Set(ok), skip: new Set(skip), bad, say });
      while (i < j) {
        if (!isAlnum(ch[i])) { skip.add(i); i++; push(`<b>пропуск</b>${esc(pyRepr(ch[i - 1]))} не буква и не цифра, i сдвигается на ${i}.`); continue; }
        if (!isAlnum(ch[j])) { skip.add(j); j--; push(`<b>пропуск</b>${esc(pyRepr(ch[j + 1]))} не буква и не цифра, j сдвигается на ${j}.`); continue; }
        const x = ch[i].toLowerCase(), y = ch[j].toLowerCase();
        if (x !== y) { push(`<b>различие</b>s[${i}].lower() == ${esc(pyRepr(x))}, s[${j}].lower() == ${esc(pyRepr(y))}. Пара не совпала: строка — не палиндром, ответ False.`, [i, j]); return; }
        ok.add(i); ok.add(j);
        const pi = i, pj = j; i++; j--;
        push(`<b>пара</b>s[${pi}] и s[${pj}] после lower() — ${esc(pyRepr(x))}. Пара совпала, i = ${i}, j = ${j}.`);
      }
      const last = frames[frames.length - 1];
      frames.push({ ...last, ok: new Set(last.ok), done: true, say: `<b>итог</b>${i === j ? `i == j == ${i}: средний символ сравнивать не с чем.` : `i = ${i}, j = ${j}: указатели встретились.`} Все пары совпали, ответ True.` });
    };
    const show = () => {
      const ch = cps(inp.value), f = frames[at];
      root.querySelector('.mr-tape').innerHTML = ch.length ? `<div class="cells">${ch.map((x, k) => {
        let cls = f.skip.has(k) ? 'is-out' : f.ok.has(k) ? 'is-done' : '';
        if (f.bad && f.bad.includes(k)) cls = 'is-diff';
        const tags = (k === f.i && !f.done ? '<span class="tag tag--i">i</span>' : '') + (k === f.j && !f.done ? '<span class="tag tag--j">j</span>' : '');
        return cellHTML(x, { top: k, cls, tags });
      }).join('')}</div>` : '<p class="sx-empty">Пустая строка — палиндром: сравнивать нечего, ответ True.</p>';
      root.querySelector('.mr-say').innerHTML = f.say;
      root.querySelector('.mr-count').textContent = `шаг ${at + 1} из ${frames.length}`;
      root.querySelector('[data-go="-1"]').disabled = at === 0;
      root.querySelector('[data-go="1"]').disabled = at === frames.length - 1;
    };
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      const d = +b.dataset.go; at = d === 0 ? 0 : Math.max(0, Math.min(frames.length - 1, at + d)); show();
    }));
    inp.addEventListener('input', () => { plan(); at = 0; show(); });
    plan(); show();
  });

  /* ── Подпись над лентой прогона ─────────────────────────────────── */
  /* Прогон из ../massivy/algo.js подписывает ленту «список имя». Для строки
     подпись задаётся атрибутом data-label: <div class="tracer" data-label="строка text">. */
  document.querySelectorAll('.tracer[data-label]').forEach(root => {
    const lab = root.querySelector('.tracer__state .tracer__label');
    if (lab) lab.textContent = root.dataset.label;
  });

  /* ── 11. Разбор строки событий ────────────────────────────────── */
  /* data-s — строка вида «ключ=значение;ключ=значение». Сначала split(';'),
     затем у каждого куска partition('='). Повреждённые куски помечаются. */
  document.querySelectorAll('.parse').forEach(root => {
    const presets = json(root, 'presets') || [];
    root.classList.add('widget');
    root.innerHTML = `
      <div class="widget__head"><b>${esc(root.dataset.title || 'Разбор строки событий')}</b><span>split(';'), затем partition('=')</span></div>
      <div class="widget__body">
        <label class="sx-field"><span>line =</span><input class="sx-input" type="text" spellcheck="false"></label>
        ${presets.length ? `<div class="btnrow cd-presets">${presets.map((p, k) => `<button class="btn" data-p="${k}">${esc(p[0])}</button>`).join('')}</div>` : ''}
        <span class="tracer__label">куски после line.split(';')</span>
        <div class="ps-parts"></div>
        <span class="tracer__label">результат</span>
        <pre class="ps-out"></pre>
      </div>`;
    const inp = root.querySelector('.sx-input');
    inp.value = root.dataset.s ?? 'time=09:15;user=ivan;action=login';
    const draw = () => {
      const parts = inp.value.split(';'), seen = new Set(), res = [], errs = [];
      root.querySelector('.ps-parts').innerHTML = parts.map((p, k) => {
        const at = p.indexOf('=');
        let cls = 'is-ok', note;
        if (p === '') { cls = 'is-bad'; note = 'пустой кусок'; errs.push(`кусок ${k}: пустой`); }
        else if (at < 0) { cls = 'is-bad'; note = "нет знака '='"; errs.push(`кусок ${k}: нет '='`); }
        else {
          const key = p.slice(0, at), val = p.slice(at + 1);
          if (key === '') { cls = 'is-bad'; note = 'пустой ключ'; errs.push(`кусок ${k}: пустой ключ`); }
          else if (seen.has(key)) { cls = 'is-bad'; note = `ключ ${pyRepr(key)} повторяется`; errs.push(`кусок ${k}: повтор ключа ${pyRepr(key)}`); }
          else { seen.add(key); res.push([key, val]); note = `${pyRepr(key)} → ${pyRepr(val)}`; }
        }
        return `<div class="ps-part ${cls}"><span class="ps-i">${k}</span><code>${esc(pyRepr(p))}</code><small>${esc(note)}</small></div>`;
      }).join('');
      root.querySelector('.ps-out').textContent = errs.length
        ? 'ValueError: ' + errs.join('; ')
        : '{' + res.map(([k, v]) => `${pyRepr(k)}: ${pyRepr(v)}`).join(', ') + '}';
      root.querySelector('.ps-out').classList.toggle('is-err', errs.length > 0);
    };
    inp.addEventListener('input', draw);
    root.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => { inp.value = presets[+b.dataset.p][1]; draw(); }));
    draw();
  });
})();
