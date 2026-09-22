'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
  const plural = (n, one, few, many) => { const a = n % 100, b = n % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many; };

  // ───── отметки пройденных частей
  const KEY = document.body.dataset.key || 'op05-lesson';
  let state = { layers: [], checks: [] };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.layers) && Array.isArray(s.checks)) state = s; } catch {}
  let toastTimer;
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('visible'), 2400); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('Браузер не сохранил отметку.'); } };
  const layer = Number(document.body.dataset.layer);
  function refresh() {
    $$('.gauge a').forEach(a => a.classList.toggle('done', state.layers.includes(Number(a.dataset.layer))));
    const b = $('#mark-layer'); if (!b) return;
    const done = state.layers.includes(layer);
    b.setAttribute('aria-pressed', String(done));
    b.textContent = done ? 'Часть пройдена ✓' : 'Отметить часть пройденной';
  }
  $('#mark-layer')?.addEventListener('click', () => {
    state.layers = state.layers.includes(layer) ? state.layers.filter(x => x !== layer) : [...state.layers, layer];
    save(); refresh();
  });
  refresh();

  // ───── копирование команд
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); const l = b.textContent; b.textContent = 'Скопировано'; setTimeout(() => { b.textContent = l; }, 1500); }
    catch { toast('Не удалось скопировать: выделите команды и нажмите Ctrl+C.'); }
  }));

  // ───── маски оболочки: фигурные скобки, затем *, ?, [...]; скрытые имена — только маской с точкой
  function braces(word) {
    const m = word.match(/^(.*?)\{([^{}]*,[^{}]*)\}(.*)$/);
    if (!m) return [word];
    return m[2].split(',').flatMap(v => braces(m[1] + v + m[3]));
  }
  function globRe(p) {
    let re = '';
    for (let i = 0; i < p.length; i++) {
      const ch = p[i];
      if (ch === '*') re += '.*';
      else if (ch === '?') re += '.';
      else if (ch === '[') {
        const j = p.indexOf(']', i + 2);
        if (j < 0) { re += '\\['; continue; }
        let body = p.slice(i + 1, j);
        const neg = body[0] === '!' || body[0] === '^';
        if (neg) body = body.slice(1);
        re += '[' + (neg ? '^' : '') + body.replace(/\\/g, '\\\\') + ']';
        i = j;
      } else re += ch.replace(/[.+^${}()|\\/]/g, '\\$&');
    }
    return new RegExp('^' + re + '$');
  }
  const isGlob = w => /[*?[]/.test(w);
  const globMatch = (pattern, names) => {
    const re = globRe(pattern);
    return names.filter(n => (n[0] !== '.' || pattern[0] === '.') && re.test(n)).sort();
  };
  function words(line) {   // деление строки на слова: пробелы, кавычки, обратная косая черта
    const out = []; let cur = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === ' ' || ch === '\t') { if (cur) { out.push(cur); cur = null; } continue; }
      cur = cur || { text: '', raw: '', quoted: false };
      if (ch === '"' || ch === "'") {
        const j = line.indexOf(ch, i + 1); const end = j < 0 ? line.length : j;
        cur.text += line.slice(i + 1, end); cur.raw += line.slice(i, end + 1); cur.quoted = true; i = end; continue;
      }
      if (ch === '\\' && i + 1 < line.length) { cur.text += line[i + 1]; cur.raw += ch + line[i + 1]; cur.quoted = true; i++; continue; }
      cur.text += ch; cur.raw += ch;
    }
    if (cur) out.push(cur);
    return out;
  }

  // ───── схема: раскрытие маски
  $$('[data-widget="expand"]').forEach(w => {
    const files = JSON.parse(w.dataset.files);
    const names = files.map(f => f[0]);
    const input = $('#expand-input', w);
    const list = $('.expand-files', w);
    list.innerHTML = files.map(([n, t]) => `<li data-name="${esc(n)}" class="${t === 'd' ? 'dir' : ''}${n[0] === '.' ? ' hidden' : ''}">${esc(n)}${t === 'd' ? '/' : ''}</li>`).join('');
    const stages = $$('.expand-stages > li', w);
    let run = 0;
    async function expand() {
      const my = ++run;
      const ws = words(input.value.trim());
      stages.forEach(s => s.classList.remove('on'));
      $$('li', list).forEach(li => li.classList.remove('hit'));
      $('.expand-words', w).innerHTML = ''; $('.expand-argv', w).innerHTML = ''; $('.expand-note', w).innerHTML = '';
      if (!ws.length) return;
      stages[0].classList.add('on');
      $('.expand-words', w).innerHTML = ws.map((x, i) => `<span class="chip pop ${i === 0 ? 'cmd' : isGlob(x.raw) && !x.quoted ? 'mask' : 'lit'}" style="animation-delay:${i * 80}ms">${esc(x.raw)}</span>`).join('');
      await wait(500); if (my !== run) return;
      stages[1].classList.add('on');
      const argv = [], notes = [], hits = new Set();
      const cmd = ws[0].text;
      for (const x of ws.slice(1)) {
        if (x.quoted) {
          argv.push([x.text, 'lit']);
          if (isGlob(x.text)) notes.push(`<code>${esc(x.raw)}</code> в кавычках — оболочка не раскрывает маску, команда получает символы <code>${esc(x.text)}</code>.`);
          else if (x.text.includes(' ')) notes.push(`<code>${esc(x.raw)}</code> — один аргумент: пробел внутри имени сохранён.`);
          continue;
        }
        const variants = braces(x.text);
        if (variants.length > 1) notes.push(`Фигурные скобки превратили <code>${esc(x.text)}</code> в ${variants.map(v => `<code>${esc(v)}</code>`).join(' и ')}.`);
        for (const v of variants) {
          if (!isGlob(v)) { argv.push([v, 'lit']); continue; }
          const m = globMatch(v, names);
          if (!m.length) { argv.push([v, 'lit']); notes.push(`Под маску <code>${esc(v)}</code> не подошло ни одно имя — оболочка передаёт её как есть${cmd === 'echo' ? ', и echo печатает саму маску' : `, и ${esc(cmd)} ищет файл с именем <code>${esc(v)}</code>`}.`); continue; }
          m.forEach(n => { argv.push([n, 'hit']); hits.add(n); });
          if (v[0] !== '.' && names.some(n => n[0] === '.' && globRe(v).test(n))) notes.push(`<code>.settings</code> подходит под <code>${esc(v)}</code> по буквам, но не попал в список: маска без точки в начале не совпадает со скрытыми именами.`);
        }
      }
      for (const li of $$('li', list)) {
        if (my !== run) return;
        if (hits.has(li.dataset.name)) { li.classList.add('hit'); await wait(70); }
      }
      await wait(350); if (my !== run) return;
      stages[2].classList.add('on');
      $('.expand-argv', w).innerHTML = `<span class="chip cmd">${esc(cmd)}</span>` + argv.map(([a, k], i) => `<span class="chip pop ${k === 'hit' ? 'mask' : 'lit'}" style="animation-delay:${i * 40}ms">${esc(a)}</span>`).join('');
      const missingArgs = argv.filter(([a, k]) => k === 'lit' && !a.startsWith('-') && !a.includes('/') && !names.includes(a) && !isGlob(a));
      if (cmd !== 'echo' && missingArgs.length) notes.push(`Файлов ${missingArgs.map(([a]) => `<code>${esc(a)}</code>`).join(', ')} в каталоге нет — ${esc(cmd)} сообщит <code>No such file or directory</code>.`);
      if (cmd === 'rm' && hits.size) notes.push(`rm получит ${hits.size} ${plural(hits.size, 'имя', 'имени', 'имён')} и удалит эти файлы. Тот же список выводит <code>ls</code> с этой маской.`);
      if (!notes.length) notes.push(`Команда ${esc(cmd)} получила ${argv.length} ${plural(argv.length, 'аргумент', 'аргумента', 'аргументов')}: вместо маски в списке готовые имена файлов.`);
      $('.expand-note', w).innerHTML = notes.join('<br>');
    }
    $('.expand-run', w).addEventListener('click', expand);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') expand(); });
    $$('[data-cmd]', w).forEach(b => b.addEventListener('click', () => { input.value = b.dataset.cmd; expand(); }));
    expand();
  });

  // ───── схема: отбор файлов командой find
  const UNIT = { c: 1, k: 1024, M: 1048576, G: 1073741824 };
  function parseFind(line) {
    const ws = words(line).map(x => x.text);
    const tests = [];
    for (let i = 2; i < ws.length; i += 2) tests.push([ws[i], ws[i + 1]]);
    return { start: ws[1], tests };
  }
  function passes(e, [t, v]) {
    const base = e.path.split('/').pop();
    if (t === '-type') return e.type === v;
    if (t === '-name') return globRe(v).test(base);
    if (t === '-iname') return globRe(v.toLowerCase()).test(base.toLowerCase());
    if (t === '-size') {
      const m = v.match(/^([+-]?)(\d+)([ckMG]?)$/); const unit = UNIT[m[3] || 'c'] || 512;
      const n = Math.ceil(e.size / unit), lim = Number(m[2]);
      return m[1] === '+' ? n > lim : m[1] === '-' ? n < lim : n === lim;
    }
    if (t === '-mtime') {
      const m = v.match(/^([+-]?)(\d+)$/); const n = Math.floor(e.age), lim = Number(m[2]);
      return m[1] === '+' ? n > lim : m[1] === '-' ? n < lim : n === lim;
    }
    return true;
  }
  const human = b => b >= 1048576 ? (b / 1048576).toFixed(1) + 'M' : b >= 1024 ? Math.ceil(b / 1024) + 'K' : b + ' Б';
  $$('[data-widget="sieve"]').forEach(w => {
    const raw = JSON.parse(w.dataset.entries);
    const entries = [{ path: 'inbox', type: 'd', size: 0, age: 0 }, ...raw.map(([p, t, s, a]) => ({ path: 'inbox/' + p, type: t, size: s, age: a }))];
    const grid = $('.sieve-grid', w);
    grid.innerHTML = entries.map((e, i) => `<li data-i="${i}"><span>${esc(e.path.replace(/^inbox\/?/, '') || 'inbox')}${e.type === 'd' ? '/' : ''}</span><span>${e.type === 'd' ? 'каталог' : human(e.size)}${e.age ? ' · ' + e.age + ' сут' : ''}</span></li>`).join('');
    const items = $$('li', grid);
    let run = 0;
    async function sieve(line) {
      const my = ++run;
      const { tests } = parseFind(line);
      $$('[data-find]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.find === line)));
      const box = $('.sieve-tests', w);
      box.innerHTML = `<div class="t done">find inbox<small>${entries.length} объектов</small></div>` + tests.map(([t, v]) => `<div class="t">${esc(t)} ${esc(v)}<small>…</small></div>`).join('');
      items.forEach(li => { li.className = ''; li.removeAttribute('data-why'); li.title = ''; });
      $('.sieve-out', w).textContent = `$ ${line}`;
      let alive = entries.map((_, i) => i);
      const boxes = $$('.t', box).slice(1);
      for (let k = 0; k < tests.length; k++) {
        if (my !== run) return;
        boxes[k].classList.add('active');
        await wait(550); if (my !== run) return;
        const next = [];
        for (const i of alive) {
          if (passes(entries[i], tests[k])) next.push(i);
          else { items[i].classList.add('out'); items[i].title = `отсеян условием ${tests[k].join(' ')}`; }
        }
        alive = next;
        boxes[k].classList.remove('active'); boxes[k].classList.add('done');
        $('small', boxes[k]).textContent = `осталось ${alive.length}`;
      }
      alive.forEach(i => items[i].classList.add('keep'));
      let out = `$ ${line}\n` + (alive.length ? alive.map(i => entries[i].path).join('\n') : '');
      const sz = tests.find(([t, v]) => t === '-size' && v === '-1M');
      if (sz && !alive.length) out += '(вывод пуст)\nПри подсчёте в мегабайтах любой непустой файл занимает не меньше одной единицы, а условие -1M требует меньше одной.';
      else if (!alive.length) out += '(вывод пуст)';
      $('.sieve-out', w).textContent = out;
    }
    $$('[data-find]', w).forEach(b => b.addEventListener('click', () => sieve(b.dataset.find)));
    sieve($('[data-find]', w).dataset.find);
  });

  // ───── чек-лист сдачи
  const total = $$('[data-check]').length;
  const checkStatus = () => { const el = $('#check-status'); if (el) el.textContent = `Отмечено ${$$('[data-check]').filter(x => x.checked).length} из ${total}`; };
  $$('[data-check]').forEach(i => { const n = Number(i.dataset.check); i.checked = state.checks.includes(n); i.addEventListener('change', () => { state.checks = i.checked ? [...new Set([...state.checks, n])] : state.checks.filter(x => x !== n); save(); checkStatus(); }); });
  checkStatus();

  // ───── домашнее задание в PDF: печать только листа задания
  $('.hw-print')?.addEventListener('click', () => {
    document.body.classList.add('print-hw');
    toast('В диалоге печати выберите «Сохранить как PDF» и снимите галочку «Колонтитулы».');
    setTimeout(() => window.print(), 300);
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-hw'));

  // ───── снимок крупно
  const dialog = $('#image-dialog');
  $$('.zoom-shot').forEach(a => a.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || !dialog.showModal) return;
    e.preventDefault(); const img = $('img', a);
    $('img', dialog).src = a.href; $('img', dialog).alt = img.alt; $('p', dialog).textContent = img.alt; $('#original-image').href = a.href; dialog.showModal();
  }));
  $('#close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})();
