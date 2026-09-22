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

  // ───── схема: анатомия строки учётной записи
  $$('[data-widget="record"]').forEach(w => {
    const recs = JSON.parse(w.dataset.records);
    let cur = 0;
    function show(k, field) {
      const r = recs[k]; cur = k;
      $$('[data-rec]', w).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.rec) === k)));
      $('.rec-file', w).innerHTML = `Файл <code>${esc(r.file)}</code> · поля разделены двоеточием`;
      const parts = r.line.split(':');
      $('.rec-line', w).innerHTML = parts.map((p, i) => `<button type="button" class="rec-f" data-f="${i}" title="${esc(r.fields[i][0])}"><span>${esc(p) || '∅'}</span><small>${i + 1}</small></button>`).join('<i>:</i>');
      $$('.rec-f', w).forEach(b => b.addEventListener('click', () => pick(Number(b.dataset.f))));
      pick(field ?? 0);
    }
    function pick(i) {
      const r = recs[cur];
      $$('.rec-f', w).forEach(b => b.classList.toggle('on', Number(b.dataset.f) === i));
      const val = r.line.split(':')[i];
      $('.rec-explain', w).innerHTML = `<dt>Поле ${i + 1} · ${esc(r.fields[i][0])}</dt><dd><code>${esc(val) || 'пусто'}</code> — ${esc(r.fields[i][1])}</dd>`;
    }
    $$('[data-rec]', w).forEach(b => b.addEventListener('click', () => show(Number(b.dataset.rec))));
    show(0);
  });

  // ───── схема: маршрут команды sudo
  $$('[data-widget="sudo"]').forEach(w => {
    const cases = JSON.parse(w.dataset.cases);
    const steps = $$('.route-steps li', w);
    let run = 0;
    async function go(k) {
      const my = ++run, c = cases[k];
      $$('[data-sudo]', w).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.sudo) === k)));
      steps.forEach(s => { s.className = ''; $('p', s).textContent = ''; });
      const term = $('.route-term', w); term.textContent = `${c.who}@ubuntu:~$ sudo whoami`;
      const text = [
        `${c.who}; группы: ${c.groups}`,
        'у файла /usr/bin/sudo установлен бит setuid: программа работает от имени root и может проверить правила',
        c.ok ? `найдено: ${c.rule}` : `не найдено: ${c.rule}`,
        c.password,
        c.ok ? 'whoami запущена с UID 0 и печатает root' : 'команда не выполняется',
        c.log,
      ];
      for (let i = 0; i < steps.length; i++) {
        if (my !== run) return;
        const failAt = c.ok ? -1 : 2;
        const skip = failAt >= 0 && i > failAt && i < 5;
        steps[i].classList.add(skip ? 'dim' : i === failAt ? 'fail' : 'pass');
        $('p', steps[i]).textContent = skip ? '—' : text[i];
        if (i === 3 && !c.ok) term.textContent += `\n${c.password.split(' — ')[0]}`;
        await wait(skip ? 150 : 600);
      }
      term.textContent += `\n${c.out}` + `\n\nжурнал: ${c.log}`;
    }
    $$('[data-sudo]', w).forEach(b => b.addEventListener('click', () => go(Number(b.dataset.sudo))));
    go(0);
  });

  // ───── схема: проверка доступа к каталогу /srv/devteam (drwxrws--- root devteam)
  $$('[data-widget="gate"]').forEach(w => {
    const G = JSON.parse(w.dataset.gate);
    let user = 'anna', act = 'ls', run = 0;
    async function check() {
      const my = ++run;
      const [name, uid, groups] = G.users.find(u => u[0] === user);
      const [, , need] = G.actions.find(a => a[0] === act);
      $$('[data-user]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.user === user)));
      $$('[data-act]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.act === act)));
      $$('.gate-triads span', w).forEach(s => s.className = '');
      const ol = $('.gate-steps', w); ol.innerHTML = '';
      const cmd = act === 'ls' ? 'ls /srv/devteam' : 'touch /srv/devteam/new.txt';
      const prefix = name === 'ubuntu' ? '' : name === 'root' ? 'sudo ' : `sudo -u ${name} `;
      const term = $('.gate-term', w); term.textContent = `ubuntu@ubuntu:~$ ${prefix}${cmd}`;
      const add = async (html, cls) => { if (my !== run) return false; ol.insertAdjacentHTML('beforeend', `<li class="${cls}">${html}</li>`); await wait(650); return my === run; };
      const needText = act === 'ls' ? 'чтение (r) и вход (x)' : 'запись (w) и вход (x)';
      if (!await add(`Процесс работает от имени <b>${name}</b>: UID ${uid}, группы: ${groups.join(', ')}. Нужно: ${needText}.`, 'info')) return;
      let ok, triad;
      if (uid === 0) {
        if (!await add('UID 0 — это root. Для root ядро права на файлы не проверяет.', 'pass')) return;
        ok = true;
      } else {
        if (!await add(`UID ${uid} не совпадает с владельцем каталога (root, UID 0) — права владельца <code>rwx</code> не применяются.`, 'dim')) return;
        if (groups.includes('devteam')) {
          triad = 'g';
          if (!await add('Среди групп процесса есть <b>devteam</b> — применяются права группы <code>rws</code>.', 'pass')) return;
        } else {
          triad = 'o';
          if (!await add(`Группы devteam среди групп ${name} нет${groups.includes('sudo') ? ' (членство в sudo прав на файлы не даёт)' : ''} — применяются права остальных <code>---</code>.`, 'fail')) return;
        }
        $(`.gate-triads [data-t="${triad}"]`, w).classList.add(triad === 'o' ? 'deny' : 'use');
        ok = triad === 'g';
        if (!await add(ok ? `В тройке <code>rws</code> есть ${act === 'ls' ? 'r и x (s включает x)' : 'w и x (s включает x)'} — доступ разрешён.` : 'В тройке <code>---</code> нет ни одного права — доступ запрещён.', ok ? 'pass' : 'fail')) return;
      }
      term.textContent += '\n' + (ok ? (act === 'ls' ? 'plan.txt' : '(файл создан, вывода нет)') : (act === 'ls' ? "ls: cannot open directory '/srv/devteam': Permission denied" : "touch: cannot touch '/srv/devteam/new.txt': Permission denied"));
    }
    $$('[data-user]', w).forEach(b => b.addEventListener('click', () => { user = b.dataset.user; check(); }));
    $$('[data-act]', w).forEach(b => b.addEventListener('click', () => { act = b.dataset.act; check(); }));
    check();
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
