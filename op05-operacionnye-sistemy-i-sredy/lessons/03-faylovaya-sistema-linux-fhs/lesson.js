'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  // ───── отметки пройденных слоёв
  const KEY = 'os-razrez-linux-v1';
  let state = { layers: [], checks: [] };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.layers) && Array.isArray(s.checks)) state = s; } catch {}
  let toastTimer;
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('visible'), 2400); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('Браузер не сохранил отметку: она действует до закрытия страницы.'); } };
  const layer = Number(document.body.dataset.layer);
  function refresh() {
    $$('.gauge a').forEach(a => a.classList.toggle('done', state.layers.includes(Number(a.dataset.layer))));
    const b = $('#mark-layer'); if (!b) return;
    const done = state.layers.includes(layer);
    b.setAttribute('aria-pressed', String(done));
    b.textContent = done ? 'Слой пройден ✓ · снять отметку' : 'Отметить слой пройденным';
  }
  $('#mark-layer')?.addEventListener('click', () => {
    state.layers = state.layers.includes(layer) ? state.layers.filter(x => x !== layer) : [...state.layers, layer];
    save(); refresh();
  });
  refresh();

  // ───── появление при прокрутке: анимации линз, осей, разреза и маркера ответа
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 }) : null;
  $$('.reveal, .core, .answer').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // ───── копирование команд
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); const l = b.textContent; b.textContent = 'Скопировано ✓'; setTimeout(() => { b.textContent = l; }, 1600); }
    catch { toast('Не удалось скопировать: выделите команды и нажмите Ctrl+C.'); }
  }));

  // ───── модель: маршрут по дереву
  $$('[data-widget="walk"]').forEach(w => {
    const exists = new Set($$('[data-node]', w).map(n => n.dataset.node));
    const term = $('.walk-term', w); let cwd = '/';
    const home = '/home/ubuntu';
    const norm = parts => '/' + parts.filter(Boolean).join('/');
    function resolve(arg) {
      if (arg === '~') return home;
      const base = arg.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
      arg.split('/').forEach(p => { if (p === '..') base.pop(); else if (p && p !== '.') base.push(p); });
      return norm(base);
    }
    const prompt = p => `ubuntu@ubuntu:${p === home ? '~' : p.startsWith(home + '/') ? '~' + p.slice(home.length) : p}$`;
    function paint(target, missing) {
      $$('[data-node]', w).forEach(n => { n.classList.remove('here', 'trail', 'missing'); });
      $$('[data-node]', w).forEach(n => { if (target.startsWith(n.dataset.node === '/' ? '/' : n.dataset.node + '/') || n.dataset.node === target) n.classList.add('trail'); });
      const node = $(`[data-node="${cwd}"]`, w); node?.classList.add('here');
      if (missing) node?.classList.add('missing');
    }
    function line(html) { term.querySelector('.cursor')?.parentElement.remove(); term.insertAdjacentHTML('beforeend', html); term.insertAdjacentHTML('beforeend', `<p><span class="pr">${prompt(cwd)}</span> <span class="cursor"></span></p>`); term.scrollTop = term.scrollHeight; }
    paint('/');
    $$('[data-cd]', w).forEach(b => b.addEventListener('click', () => {
      const arg = b.dataset.cd.slice(3); const target = resolve(arg); const before = prompt(cwd);
      const kind = arg === '~' ? '<b>~</b> — Bash подставил домашний каталог /home/ubuntu.' : arg.startsWith('/') ? `<b>абсолютный</b>: ${arg} не зависит от текущего каталога.` : `<b>относительный</b>: ${cwd} + ${arg} → ${target}.`;
      $('.walk-kind', w).innerHTML = kind;
      if (!exists.has(target)) {
        line(`<p><span class="pr">${before}</span> ${b.dataset.cd}</p><p class="err">bash: cd: ${arg}: No such file or directory</p>`);
        $('.walk-kind', w).innerHTML = `<b>относительный</b>: ${cwd} + ${arg} → ${target} — такого каталога нет.`;
        paint(cwd, true); return;
      }
      cwd = target;
      line(`<p><span class="pr">${before}</span> ${b.dataset.cd}</p><p><span class="pr">${prompt(cwd)}</span> pwd</p><p>${cwd}</p>`);
      paint(cwd);
    }));
  });

  // ───── модель: оси FHS
  $$('[data-widget="axes"]').forEach(w => $$('[data-explain]', w).forEach(b => b.addEventListener('click', () => {
    $$('[data-explain]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('.axes-out', w).innerHTML = `<b>${b.textContent}</b> — ${b.dataset.explain}`;
  })));

  // ───── модель: раскладка CUPS
  $$('[data-widget="spread"]').forEach(w => $$('[data-mode]', w).forEach(b => {
    if (b === w) return;
    b.addEventListener('click', () => {
      const apply = () => { w.dataset.mode = b.dataset.mode; $$('button[data-mode]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b))); };
      if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
    });
  }));

  // ───── модель: поиск команды
  $$('[data-widget="pathscan"]').forEach(w => {
    const dirs = $$('[data-dir]', w); const log = $('.pathscan-log', w); const steps = $$('[data-step]', w);
    const table = { python3: '/usr/bin', cupsd: '/usr/sbin', ls: '/usr/bin' };
    let run = 0;
    $$('[data-name]', w).forEach(b => b.addEventListener('click', async () => {
      const id = ++run; const name = b.dataset.name;
      $$('[data-name]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      dirs.forEach(d => d.className = ''); steps.forEach(s => s.className = ''); log.innerHTML = `<p>$ ${name}</p>`;
      const say = (t, c = '') => { if (id === run) log.insertAdjacentHTML('beforeend', `<p class="${c}">${t}</p>`); };
      steps[0].className = 'on'; await wait(450); if (id !== run) return;
      if (name === 'ls') { say('псевдоним: ls → ls --color=auto, дальше ищем ls'); await wait(500); }
      steps[0].className = ''; steps[1].className = 'on'; await wait(450); if (id !== run) return;
      if (name === 'cd') { steps[1].className = 'hit'; dirs.forEach(d => d.className = 'rest'); say('cd — встроенная команда оболочки, искать в PATH не нужно', 'ok'); return; }
      steps[1].className = ''; steps[2].className = 'on';
      for (const d of dirs) {
        if (id !== run) return;
        d.className = 'scan'; await wait(380); if (id !== run) return;
        if (table[name] === d.dataset.dir) { d.className = 'hit'; steps[2].className = 'hit'; say(`найден ${d.dataset.dir}/${name}, он и запускается; дальше поиск не идёт`, 'ok'); dirs.slice(dirs.indexOf(d) + 1).forEach(x => x.className = 'rest'); return; }
        d.className = 'miss';
      }
      say(`${name}: command not found`, 'err'); say('программу из текущего каталога запускают так: ./app');
    }));
  });

  // ───── модель: срок жизни
  const LIFE = {
    reboot: [{ sock: ['gone', 'удалён: /run очищен'] }, 'После перезагрузки /run пустой. Служба при запуске создаст cups.sock заново. Остальные файлы лежат на диске и сохраняются.'],
    upgrade: [{ prog: ['new', 'заменён новой версией'], conf: ['kept', 'сохранён: это ваши настройки'], sock: ['new', 'создан заново'] }, 'При обновлении файлы программы в /usr заменяются новыми. Изменённый файл настроек dpkg не перезаписывает, а спрашивает, что с ним делать. Файлы в /var не меняются.'],
    cache: [{ cache: ['gone', 'удалён, будет создан заново'] }, 'Программа создаст кэш заново, на это уйдёт немного времени. Остальные файлы не затронуты.'],
    remove: [{ prog: ['gone', 'удалён вместе с пакетом'], conf: ['kept', 'остался: его удаляет только purge'], sock: ['gone', 'служба остановлена'], spool: ['kept', 'обычно остаются'], log: ['kept', 'обычно остаются'], cache: ['kept', 'обычно остаются'] }, 'apt remove удаляет программу, но оставляет настройки в /etc на случай повторной установки. Файлы в /var служба создала сама во время работы, поэтому они обычно остаются.'],
  };
  $$('[data-widget="lifetime"]').forEach(w => $$('[data-event]', w).forEach(b => b.addEventListener('click', () => {
    $$('[data-event]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b && b.dataset.event !== 'reset')));
    const [changes, text] = LIFE[b.dataset.event] || [{}, 'Все адреса на месте. Выберите событие.'];
    $$('[data-item]', w).forEach(li => {
      const ch = changes[li.dataset.item];
      li.dataset.state = ch ? ch[0] : ''; $('.lt-state', li).textContent = ch ? ch[1] : 'не затронут';
      if (b.dataset.event === 'reset') $('.lt-state', li).textContent = 'на месте';
      if (ch) { li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash'); }
    });
    $('.lt-out', w).textContent = text;
  })));

  // ───── модель: кто отвечает на чтение
  $$('[data-widget="kernelfs"]').forEach(w => {
    let procReads = 0; let run = 0;
    $$('[data-read]', w).forEach(b => b.addEventListener('click', async () => {
      const id = ++run; const proc = b.dataset.read === 'proc';
      $$('[data-read]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const nodes = n => $(`[data-n="${n}"]`, w); const out = $('.kfs-result code', w);
      $$('.kfs-node', w).forEach(n => n.classList.remove('lit', 'off')); out.textContent = '…';
      for (const n of ['cat', 'vfs']) { nodes(n).classList.add('lit'); await wait(420); if (id !== run) return; }
      nodes(proc ? 'proc' : 'disk').classList.add('lit'); nodes(proc ? 'disk' : 'proc').classList.add('off'); await wait(520); if (id !== run) return;
      nodes('out').classList.add('lit');
      if (proc) { out.textContent = procReads % 2 ? w.dataset.second : w.dataset.first; procReads++; }
      else out.textContent = w.dataset.copy;
    }));
  });

  // ───── модель: имена, inode и данные
  $$('[data-widget="inode"]').forEach(w => {
    const F = w.dataset.file, L = w.dataset.link;
    let s;
    const reset = () => { s = { names: ['info.txt'], links: 1 }; };
    function draw(leaving) {
      const data = $('[data-dir="data"]', w), lab = $('[data-dir="lab"]', w);
      data.innerHTML = s.names.map(n => `<li data-name="${n}"><span>${n}</span><span class="pill">inode ${F}</span></li>`).join('') + (leaving ? `<li class="leaving"><span>${leaving}</span><span class="pill">inode ${F}</span></li>` : '');
      lab.innerHTML = `<li><span>info-link.txt</span><span class="pill link">inode ${L}</span></li>`;
      const broken = !s.names.includes('info.txt');
      $('.inode-cards', w).innerHTML =
        `<div class="icard"><header><span>inode ${F}</span><span>обычный файл</span></header><dl><dt>размер</dt><dd>17 байт</dd><dt>ссылок (Links)</dt><dd><span class="count">${s.links}</span></dd><dt>данные</dt><dd>Linux filesystem</dd></dl></div>` +
        `<div class="icard link${broken ? ' broken' : ''}"><header><span>inode ${L}</span><span>символическая ссылка</span></header><dl><dt>размер</dt><dd>13 байт</dd><dt>записанный путь</dt><dd class="target">data/info.txt</dd><dt>цель</dt><dd>${broken ? 'нет такого имени' : `inode ${F}`}</dd></dl></div>`;
    }
    const bump = () => { const c = $('.count', w); c.classList.add('bump'); };
    const term = t => { $('.inode-term', w).textContent = t; };
    reset(); draw(); term('$ ls -li data/info.txt\n' + F + ' -rw-rw-r-- 1 ubuntu ubuntu 17 data/info.txt');
    $$('[data-op]', w).forEach(b => b.addEventListener('click', () => {
      const op = b.dataset.op;
      if (op === 'reset') { reset(); draw(); term('Модель сброшена: у файла одно имя.'); return; }
      if (op === 'ln') {
        if (s.names.includes('info-hard.txt')) { term('$ ln data/info.txt data/info-hard.txt\nln: failed to create hard link \'data/info-hard.txt\': File exists'); return; }
        if (!s.names.includes('info.txt')) { term('$ ln data/info.txt data/info-hard.txt\nln: failed to access \'data/info.txt\': No such file or directory'); return; }
        s.names.push('info-hard.txt'); s.links++; draw(); bump(); term('$ ln data/info.txt data/info-hard.txt\nу inode ' + F + ' стало два имени — Links: 2');
      }
      if (op === 'rm') {
        if (!s.names.includes('info.txt')) { term('$ rm data/info.txt\nrm: cannot remove \'data/info.txt\': No such file or directory'); return; }
        s.names = s.names.filter(n => n !== 'info.txt'); s.links--; draw('info.txt'); bump();
        term(s.links ? '$ rm data/info.txt\nудалено одно имя, данные на месте. Links: ' + s.links : '$ rm data/info.txt\nпоследнее имя удалено — данные освобождены');
      }
      if (op === 'cat') term(s.names.includes('info.txt') ? '$ cat info-link.txt\nLinux filesystem' : '$ cat info-link.txt\ncat: info-link.txt: No such file or directory');
      if (op === 'relink') {
        if (s.names.includes('info.txt')) { term('$ ln data/info-hard.txt data/info.txt\nln: failed to create hard link \'data/info.txt\': File exists'); return; }
        if (!s.names.includes('info-hard.txt')) { term('$ ln data/info-hard.txt data/info.txt\nln: failed to access \'data/info-hard.txt\': No such file or directory'); return; }
        s.names.unshift('info.txt'); s.links++; draw(); bump(); term('$ ln data/info-hard.txt data/info.txt\nимя снова указывает на тот же inode, символическая ссылка снова работает');
      }
    }));
  });

  // ───── модель: монтирование
  const MOUNT = [
    ['before.txt', '/ /cow overlay', 'Каталог лежит на корневой файловой системе, в нём виден before.txt.'],
    ['inside.txt', '/home/ubuntu/linux-fhs-lab/mount-demo tmpfs tmpfs', 'К каталогу подключена tmpfs, и теперь в нём видно её содержимое. before.txt не удалён, он просто не виден. Новый файл inside.txt записан в память.'],
    ['before.txt', '/ /cow overlay', 'tmpfs отключена. В каталоге снова виден before.txt, а inside.txt исчез вместе с tmpfs.'],
  ];
  $$('[data-widget="mount"]').forEach(w => {
    const set = n => { $('.mount-stage', w).dataset.stage = n; $$('[data-stage]', $('.model-head', w)).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.stage) === n))); $('[data-ls]', w).textContent = MOUNT[n][0]; $('[data-fm]', w).textContent = MOUNT[n][1]; $('.mount-out', w).textContent = MOUNT[n][2]; };
    $$('button[data-stage]', w).forEach(b => b.addEventListener('click', () => set(Number(b.dataset.stage))));
    set(0);
  });

  // ───── самопроверка размещения
  $('#check-placement')?.addEventListener('click', () => {
    let score = 0;
    $$('.quiz-row').forEach(r => { const s = $('select', r); const ok = s.value === s.dataset.answer; r.dataset.correct = String(ok); if (ok) score++; const f = $('.feedback', r); f.textContent = (ok ? 'Верно. ' : s.value ? `Сюда подходит ${s.dataset.answer}. ` : 'Ответ не выбран. ') + f.dataset.explanation; });
    $('#quiz-score').textContent = `${score} из 6. ${score === 6 ? 'Теперь объясните выбор в отчёте своими словами.' : 'Исправьте и проверьте ещё раз.'}`;
  });

  // ───── карта корня
  $$('[data-widget="rootmap"]').forEach(w => $$('[data-root]', w).forEach((b, i) => {
    b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => {
      const d = JSON.parse(b.dataset.root);
      $$('[data-root]', w).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('.rm-path', w).textContent = d.p; $('.rm-title', w).textContent = d.t; $('.rm-desc', w).textContent = d.d; $('.rm-cmd', w).textContent = d.c;
      const a = $('.rm-link', w); a.href = d.s + '.html'; a.textContent = `Разбирается в слое ${String(d.l).padStart(2, '0')} · ${d.n} →`;
    });
  }));

  // ───── чек-лист сдачи
  const checkStatus = () => { const el = $('#check-status'); if (el) el.textContent = `Отмечено ${$$('[data-check]').filter(x => x.checked).length} из 5`; };
  $$('[data-check]').forEach(i => { const n = Number(i.dataset.check); i.checked = state.checks.includes(n); i.addEventListener('change', () => { state.checks = i.checked ? [...new Set([...state.checks, n])] : state.checks.filter(x => x !== n); save(); checkStatus(); }); });
  checkStatus();

  // ───── кадр крупно
  const dialog = $('#image-dialog');
  $$('.zoom-shot').forEach(a => a.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || !dialog.showModal) return;
    e.preventDefault(); const img = $('img', a);
    $('img', dialog).src = a.href; $('img', dialog).alt = img.alt; $('p', dialog).textContent = img.alt; $('#original-image').href = a.href; dialog.showModal();
  }));
  $('#close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  let opened = [];
  addEventListener('beforeprint', () => { opened = $$('details').filter(d => d.open); $$('details').forEach(d => d.open = true); $$('.reveal,.core,.answer').forEach(el => el.classList.add('in')); });
  addEventListener('afterprint', () => $$('details').forEach(d => d.open = opened.includes(d)));
})();
