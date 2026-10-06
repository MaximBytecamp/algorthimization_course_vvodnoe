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

  // ───── схема: что разрешают права каталога
  $$('[data-widget="dirperm"]').forEach(w => {
    const acts = JSON.parse(w.dataset.actions);
    const have = { r: true, w: true, x: true };
    const WHY = { r: 'чтение списка (r)', w: 'изменение списка (w)', x: 'проход (x)' };
    function draw() {
      $$('.bit', w).forEach(b => b.setAttribute('aria-pressed', String(have[b.dataset.bit])));
      const t = (have.r ? 'r' : '-') + (have.w ? 'w' : '-') + (have.x ? 'x' : '-');
      $('.dp-line', w).textContent = `d${t}r-xr-x  docs`;
      $('.dp-rows', w).innerHTML = acts.map(([cmd, need, out]) => {
        const miss = [...need].filter(p => !have[p]);
        let ok = miss.length === 0, res;
        if (cmd === 'ls docs' && have.r && !have.x) { ok = true; res = "имена видны, но ls сообщает: cannot access 'docs/notes.txt': Permission denied"; }
        else if (cmd === 'ls -l docs' && have.r && !have.x) { ok = false; res = 'имена видны, вместо прав и размера — знаки ?, и ошибка Permission denied'; }
        else res = ok ? out : `Permission denied: нет права ${miss.map(p => WHY[p]).join(' и ')}`;
        const needTxt = [...need].map(p => WHY[p]).join(' и ');
        return `<li class="${ok ? 'pass' : 'fail'}"><code>${esc(cmd)}</code><span>нужно: ${needTxt}</span><p>${esc(res)}</p></li>`;
      }).join('');
    }
    $$('.bit', w).forEach(b => b.addEventListener('click', () => { have[b.dataset.bit] = !have[b.dataset.bit]; draw(); }));
    draw();
  });

  // ───── схема: перевод прав
  const MEAN = { '-': { r: 'читать содержимое', w: 'изменять содержимое', x: 'запускать как программу' },
                 d: { r: 'читать список имён', w: 'создавать и удалять файлы', x: 'входить и открывать файлы по имени' } };
  $$('[data-widget="calc"]').forEach(w => {
    let kind = '-';
    const boxes = $$('input[data-who]', w), sp = $$('input[data-sp]', w), num = $('.calc-num', w);
    const digit = who => boxes.filter(b => b.dataset.who === who && b.checked).reduce((s, b) => s + ({ r: 4, w: 2, x: 1 }[b.dataset.p]), 0);
    function fromBoxes() {
      const s = sp.filter(b => b.checked).reduce((t, b) => t + Number(b.dataset.sp), 0);
      num.value = (s ? String(s) : '') + digit('u') + digit('g') + digit('o');
      draw();
    }
    function fromNum() {
      const v = num.value.trim();
      if (!/^[0-7]{3,4}$/.test(v)) { num.classList.add('bad'); return; }
      num.classList.remove('bad');
      const d = v.padStart(4, '0');
      sp.forEach(b => { b.checked = (Number(d[0]) & Number(b.dataset.sp)) > 0; });
      ['u', 'g', 'o'].forEach((who, i) => boxes.filter(b => b.dataset.who === who).forEach(b => { b.checked = (Number(d[i + 1]) & ({ r: 4, w: 2, x: 1 }[b.dataset.p])) > 0; }));
      draw();
    }
    function draw() {
      const has = (who, p) => boxes.find(b => b.dataset.who === who && b.dataset.p === p).checked;
      const spOn = v => sp.find(b => Number(b.dataset.sp) === v).checked;
      let str = kind;
      ['u', 'g', 'o'].forEach(who => {
        str += has(who, 'r') ? 'r' : '-';
        str += has(who, 'w') ? 'w' : '-';
        const x = has(who, 'x'), bit = { u: 4, g: 2, o: 1 }[who];
        const letter = who === 'o' ? 't' : 's';
        str += spOn(bit) ? (x ? letter : letter.toUpperCase()) : (x ? 'x' : '-');
      });
      ['u', 'g', 'o'].forEach(who => { $(`[data-digit="${who}"]`, w).textContent = digit(who); });
      $('.calc-str', w).textContent = str;
      const name = kind === 'd' ? 'каталог' : 'файл';
      $('.calc-c1', w).textContent = `chmod ${num.value} ${name}`;
      const part = who => who + '=' + ['r', 'w', 'x'].filter(p => has(who, p)).join('');
      $('.calc-c2', w).textContent = `chmod ${['u', 'g', 'o'].map(part).join(',')} ${name}`;
      const label = { u: 'Владелец', g: 'Группа', o: 'Остальные' };
      $('.calc-mean', w).innerHTML = ['u', 'g', 'o'].map(who => {
        const can = ['r', 'w', 'x'].filter(p => has(who, p)).map(p => MEAN[kind][p]);
        return `<li><b>${label[who]}</b> ${can.length ? esc(can.join(', ')) : 'ничего'}</li>`;
      }).join('') + (spOn(4) ? '<li><b>setuid</b> программа работает от имени владельца файла</li>' : '')
        + (spOn(2) ? `<li><b>setgid</b> ${kind === 'd' ? 'новые файлы получают группу каталога' : 'программа работает с группой файла'}</li>` : '')
        + (spOn(1) ? `<li><b>sticky</b> ${kind === 'd' ? 'файлы удаляет только их владелец' : 'для файлов в Linux не действует'}</li>` : '');
    }
    boxes.concat(sp).forEach(b => b.addEventListener('change', fromBoxes));
    num.addEventListener('input', fromNum);
    $$('[data-kind]', w).forEach(b => b.addEventListener('click', () => {
      kind = b.dataset.kind;
      $$('[data-kind]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    fromNum();
  });

  // ───── схема: маска и права новых файлов
  $$('[data-widget="umask"]').forEach(w => {
    const inp = $('.um-num', w);
    const tri = n => (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    function table(title, base, mask) {
      const b = base.split('').map(Number), m = mask.slice(-3).split('').map(Number);
      const res = b.map((v, i) => v & ~m[i]);
      const cells = arr => arr.map(v => `<td><code>${tri(v)}</code><small>${v}</small></td>`).join('');
      return `<table class="um-t"><caption>${title}</caption><thead><tr><th></th><th>владелец</th><th>группа</th><th>остальные</th></tr></thead><tbody>`
        + `<tr><th>запрос программы</th>${cells(b)}</tr><tr class="um-mask"><th>маска снимает</th>${cells(m)}</tr>`
        + `<tr class="um-res"><th>получится</th>${cells(res)}</tr></tbody></table>`;
    }
    function draw() {
      const v = inp.value.trim();
      if (!/^[0-7]{3,4}$/.test(v)) { inp.classList.add('bad'); return; }
      inp.classList.remove('bad');
      $$('[data-mask]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mask === v.padStart(4, '0'))));
      $('.um-tables', w).innerHTML = table('Новый файл: запрос 666', '666', v) + table('Новый каталог: запрос 777', '777', v);
    }
    inp.addEventListener('input', draw);
    $$('[data-mask]', w).forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.mask; draw(); }));
    draw();
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
