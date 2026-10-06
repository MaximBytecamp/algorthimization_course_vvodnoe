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

  // ───── схема: очередь к ядрам (load average)
  $$('[data-widget="load"]').forEach(w => {
    let cores = 2;
    const range = $('input', w);
    function draw() {
      const n = Number(range.value);
      $('.lq-n', w).textContent = n;
      $$('[data-cores]', w).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.cores) === cores)));
      let cells = '';
      for (let i = 0; i < cores; i++) cells += `<div class="lq-core"><small>ядро ${i}</small>${i < n ? `<span class="lq-p">P${i + 1}</span>` : '<em>свободно</em>'}</div>`;
      $('.lq-cores', w).innerHTML = cells;
      const wait = Math.max(0, n - cores);
      $('.lq-queue', w).innerHTML = wait ? '<small>очередь</small>' + Array.from({ length: wait }, (_, i) => `<span class="lq-p lq-wait">P${cores + i + 1}</span>`).join('') : '<small>очередь пуста</small>';
      const verdict = n < cores ? `${cores - n} ${plural(cores - n, 'ядро простаивает', 'ядра простаивают', 'ядер простаивают')}: процессор справляется.`
        : n === cores ? 'Все ядра заняты, очереди нет.'
        : `${wait} ${plural(wait, 'процесс ждёт', 'процесса ждут', 'процессов ждут')} очереди: каждый получает процессор реже, программы отвечают медленнее.`;
      $('.lq-text', w).innerHTML = `Если так продолжается несколько минут, минутный load average приближается к <b>${n}</b> — это ${(n / cores).toFixed(1).replace('.', ',')} на ядро. ${verdict}`;
    }
    range.addEventListener('input', draw);
    $$('[data-cores]', w).forEach(b => b.addEventListener('click', () => { cores = Number(b.dataset.cores); draw(); }));
    draw();
  });

  // ───── схема: доли одного ядра при разных nice
  $$('[data-widget="nice"]').forEach(w => {
    const W = JSON.parse(w.dataset.weights);
    const pick = k => Number($(`[data-p="${k}"]`, w).value);
    const pct = x => (x >= 99.95 || x < 0.05 ? x.toFixed(0) : x.toFixed(1)).replace('.', ',');
    function draw() {
      const a = pick('a'), b = pick('b'), wa = W[a + 20], wb = W[b + 20];
      const sa = wa / (wa + wb) * 100, sb = 100 - sa;
      $('.nw-a', w).style.flexBasis = sa + '%'; $('.nw-b', w).style.flexBasis = sb + '%';
      $('.nw-a span', w).textContent = `A · ${pct(sa)} %`; $('.nw-b span', w).textContent = `B · ${pct(sb)} %`;
      const ratio = wa >= wb ? `A получает в ${(wa / wb).toFixed(1).replace('.', ',')} раза больше времени, чем B` : `B получает в ${(wb / wa).toFixed(1).replace('.', ',')} раза больше времени, чем A`;
      const root = a < 0 || b < 0 ? ' Отрицательный nice может назначить только root.' : '';
      $('.nw-text', w).textContent = a === b ? `Одинаковый nice — ядро делится поровну.${root}` : `Вес A — ${wa}, вес B — ${wb}. ${ratio}.${root} Если процессор свободен, оба работают в полную силу при любом nice.`;
    }
    $$('select', w).forEach(s => s.addEventListener('change', draw));
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
