'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ───── отметки пройденных частей
  const KEY = 'os-fs-linux-v2';
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

  // ───── схема: переходы между каталогами
  $$('[data-widget="walk"]').forEach(w => {
    const exists = new Set($$('[data-node]', w).map(n => n.dataset.node));
    const term = $('.walk-term', w); const home = '/home/ubuntu'; let cwd = '/';
    const prompt = p => `ubuntu@ubuntu:${p === home ? '~' : p}$`;
    function resolve(arg) {
      if (arg === '~') return home;
      const parts = arg.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
      arg.split('/').forEach(p => { if (p === '..') parts.pop(); else if (p && p !== '.') parts.push(p); });
      return '/' + parts.join('/');
    }
    function paint(missing) {
      $$('[data-node]', w).forEach(n => n.classList.toggle('here', n.dataset.node === cwd));
      $$('[data-node]', w).forEach(n => n.classList.remove('missing'));
      if (missing) $(`[data-node="${cwd}"]`, w)?.classList.add('missing');
    }
    const add = h => { term.insertAdjacentHTML('beforeend', h); term.scrollTop = term.scrollHeight; };
    paint();
    $$('[data-cd]', w).forEach(b => b.addEventListener('click', () => {
      const arg = b.dataset.cd.slice(3); const target = resolve(arg); const before = prompt(cwd);
      const kind = arg === '~' ? '<code>~</code> — домашний каталог /home/ubuntu.' : arg.startsWith('/') ? `Абсолютный путь: ${arg}.` : `Относительный путь: ${cwd} + ${arg} = ${target}.`;
      if (!exists.has(target)) {
        add(`<p><span class="pr">${before}</span> ${b.dataset.cd}</p><p class="err">bash: cd: ${arg}: No such file or directory</p>`);
        $('.walk-kind', w).innerHTML = `Относительный путь: ${cwd} + ${arg} = ${target}. Такого каталога нет.`;
        paint(true); return;
      }
      cwd = target;
      add(`<p><span class="pr">${before}</span> ${b.dataset.cd}</p>`);
      $('.walk-kind', w).innerHTML = kind; paint();
    }));
  });

  // ───── схема: имена, inode и ссылки
  $$('[data-widget="inode"]').forEach(w => {
    const F = w.dataset.file, L = w.dataset.link;
    let s;
    const reset = () => { s = { names: ['info.txt'], links: 1 }; };
    function draw() {
      $('[data-dir="data"]', w).innerHTML = s.names.map(n => `<li><span>${n}</span><span class="pill">inode ${F}</span></li>`).join('');
      $('[data-dir="lab"]', w).innerHTML = `<li><span>info-link.txt</span><span class="pill link">inode ${L}</span></li>`;
      const broken = !s.names.includes('info.txt');
      $('.inode-cards', w).innerHTML =
        `<div class="icard"><header><span>inode ${F}</span><span>обычный файл</span></header><dl><dt>размер</dt><dd>17 байт</dd><dt>число ссылок</dt><dd>${s.links}</dd><dt>данные</dt><dd>Linux filesystem</dd></dl></div>` +
        `<div class="icard link${broken ? ' broken' : ''}"><header><span>inode ${L}</span><span>символическая ссылка</span></header><dl><dt>размер</dt><dd>13 байт</dd><dt>записанный путь</dt><dd class="target">data/info.txt</dd><dt>цель</dt><dd>${broken ? 'не существует' : `inode ${F}`}</dd></dl></div>`;
    }
    const term = t => { $('.inode-term', w).textContent = t; };
    reset(); draw(); term(`$ ls -li data/info.txt\n${F} -rw-rw-r-- 1 ubuntu ubuntu 17 data/info.txt`);
    $$('[data-op]', w).forEach(b => b.addEventListener('click', () => {
      const op = b.dataset.op;
      if (op === 'reset') { reset(); draw(); term('Исходное состояние: у файла одно имя.'); return; }
      if (op === 'ln') {
        if (s.names.includes('info-hard.txt') || !s.names.includes('info.txt')) { term('$ ln data/info.txt data/info-hard.txt\nкоманда не выполнена: имя уже есть или исходного файла нет'); return; }
        s.names.push('info-hard.txt'); s.links++; draw(); term(`$ ln data/info.txt data/info-hard.txt\nу inode ${F} два имени, число ссылок: 2`);
      }
      if (op === 'rm') {
        if (!s.names.includes('info.txt')) { term("$ rm data/info.txt\nrm: cannot remove 'data/info.txt': No such file or directory"); return; }
        s.names = s.names.filter(n => n !== 'info.txt'); s.links--; draw();
        term(s.links ? `$ rm data/info.txt\nудалено одно имя, число ссылок: ${s.links}` : '$ rm data/info.txt\nудалено последнее имя, данные удалены');
      }
      if (op === 'cat') term(s.names.includes('info.txt') ? '$ cat info-link.txt\nLinux filesystem' : '$ cat info-link.txt\ncat: info-link.txt: No such file or directory');
      if (op === 'relink') {
        if (s.names.includes('info.txt') || !s.names.includes('info-hard.txt')) { term('$ ln data/info-hard.txt data/info.txt\nкоманда не выполнена: имя уже есть или файла info-hard.txt нет'); return; }
        s.names.unshift('info.txt'); s.links++; draw(); term('$ ln data/info-hard.txt data/info.txt\nимя info.txt снова указывает на inode, символическая ссылка работает');
      }
    }));
  });

  // ───── схема: монтирование
  const MOUNT = [
    ['before.txt', '/ /cow overlay', 'Каталог находится на корневой файловой системе, в нём файл before.txt.'],
    ['inside.txt', '/home/ubuntu/linux-fhs-lab/mount-demo tmpfs tmpfs', 'К каталогу подключена tmpfs. Виден её файл inside.txt; before.txt не удалён, но недоступен.'],
    ['before.txt', '/ /cow overlay', 'tmpfs отключена. Снова виден before.txt, inside.txt удалён вместе с tmpfs.'],
  ];
  $$('[data-widget="mount"]').forEach(w => {
    const set = n => { $('.mount-stage', w).dataset.stage = n; $$('button[data-stage]', w).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.stage) === n))); $('[data-ls]', w).textContent = MOUNT[n][0]; $('[data-fm]', w).textContent = MOUNT[n][1]; $('.mount-out', w).textContent = MOUNT[n][2]; };
    $$('button[data-stage]', w).forEach(b => b.addEventListener('click', () => set(Number(b.dataset.stage))));
    set(0);
  });

  // ───── чек-лист сдачи
  const checkStatus = () => { const el = $('#check-status'); if (el) el.textContent = `Отмечено ${$$('[data-check]').filter(x => x.checked).length} из 5`; };
  $$('[data-check]').forEach(i => { const n = Number(i.dataset.check); i.checked = state.checks.includes(n); i.addEventListener('change', () => { state.checks = i.checked ? [...new Set([...state.checks, n])] : state.checks.filter(x => x !== n); save(); checkStatus(); }); });
  checkStatus();

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
