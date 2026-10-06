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

  // ───── схемы-проигрыватели: запуск команды и судьба завершившегося процесса
  const STATE_NAME = { R: 'выполняется', S: 'спит', D: 'ждёт устройство', T: 'остановлен', Z: 'зомби' };
  $$('[data-widget="player"]').forEach(w => {
    const cases = JSON.parse(w.dataset.cases);
    let c = 0, k = 0;
    function tree(nodes) {
      const byParent = {};
      nodes.forEach(n => { (byParent[n[2]] = byParent[n[2]] || []).push(n); });
      const pids = new Set(nodes.map(n => n[1]));
      const roots = nodes.filter(n => !pids.has(n[2]));
      const box = n => `<div class="pl-node st-${n[3]}"><b>${esc(n[0])}</b><span>PID ${n[1]} · PPID ${n[2]}</span><i>${n[3]} — ${STATE_NAME[n[3]]}</i></div>`;
      const branch = n => `<li>${box(n)}${(byParent[n[1]] || []).length ? '<ul>' + byParent[n[1]].map(branch).join('') + '</ul>' : ''}</li>`;
      return '<ul>' + roots.map(branch).join('') + '</ul>';
    }
    function draw() {
      const steps = cases[c].steps, s = steps[k];
      $$('[data-case]', w).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.case) === c)));
      $('.pl-steps', w).innerHTML = steps.map((x, i) => `<li class="${i === k ? 'on' : i < k ? 'done' : ''}"><button type="button" data-step="${i}">${i + 1}. ${esc(x.t)}</button></li>`).join('');
      $$('[data-step]', w).forEach(b => b.addEventListener('click', () => { k = Number(b.dataset.step); draw(); }));
      $('.pl-tree', w).innerHTML = tree(s.n);
      $('.pl-text', w).textContent = s.p;
      $('.pl-term', w).textContent = s.term || ' ';
      $('.pl-count', w).textContent = `шаг ${k + 1} из ${steps.length}`;
      $('[data-go="-1"]', w).disabled = k === 0;
      $('[data-go="1"]', w).disabled = k === steps.length - 1;
    }
    $$('[data-go]', w).forEach(b => b.addEventListener('click', () => { k = Math.max(0, Math.min(cases[c].steps.length - 1, k + Number(b.dataset.go))); draw(); }));
    $$('[data-case]', w).forEach(b => b.addEventListener('click', () => { c = Number(b.dataset.case); k = 0; draw(); }));
    draw();
  });

  // ───── схема: переходы между состояниями
  $$('[data-widget="states"]').forEach(w => {
    const S = JSON.parse(w.dataset.states);
    function pick(st) {
      $$('.st-node', w).forEach(g => g.classList.toggle('on', g.dataset.st === st));
      $$('.st-edge', w).forEach(g => {
        g.classList.toggle('in', g.dataset.to === st);
        g.classList.toggle('out', g.dataset.from === st);
      });
      const d = S[st];
      const list = (title, arr) => arr.length ? `<div><small>${title}</small><ul>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
      $('.st-info', w).innerHTML = `<p><b>${st.length === 1 ? st + ' — ' : ''}${esc(d.name)}.</b> ${esc(d.text)}</p><div class="st-cols">${list('Как попадает', d.into)}${list('Куда переходит', d.out)}</div>`;
    }
    $$('.st-node', w).forEach(g => {
      g.addEventListener('click', () => pick(g.dataset.st));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.dataset.st); } });
    });
    pick('R');
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
