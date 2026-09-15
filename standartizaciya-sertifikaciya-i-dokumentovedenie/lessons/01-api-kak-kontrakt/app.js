'use strict';
(() => {
  const main = document.getElementById('slides');
  const total = lessonSlides.length;
  const pad = n => String(n).padStart(2, '0');
  const groupFor = n => lessonGroups.find(group => n >= group.start && n <= group.end);

  main.innerHTML = lessonSlides.map((slide, i) => {
    const n = i + 1, group = groupFor(n), tag = n === 1 ? 'h1' : 'h2';
    const partIndex = lessonGroups.indexOf(group);
    // Карта частей и связка с предыдущей частью — только на первом слайде части.
    const cover = n === group.start ? `<div class="part-cover"><ol class="part-map" aria-label="Части темы">${lessonGroups.map((g, gi) => `<li class="${gi < partIndex ? 'done' : gi === partIndex ? 'now' : ''}" title="${g.title}"><span>${gi + 1}</span></li>`).join('')}</ol><p class="part-bridge"><b>Часть ${partIndex + 1} из ${lessonGroups.length}.</b> ${group.bridge || ''}</p></div>` : '';
    return `<section class="slide${slide.cls ? ' ' + slide.cls : ''}" id="slide-${pad(n)}" aria-labelledby="title-${pad(n)}" hidden><header>${cover}<p class="eyebrow">${group.title}<span>${pad(n)} / ${total}</span></p><${tag} id="title-${pad(n)}">${slide.title}</${tag}>${slide.intro ? `<p class="lead">${slide.intro}</p>` : ''}</header><div class="slide-body">${slide.body}</div></section>`;
  }).join('');
  const slides = [...main.querySelectorAll('.slide')];
  // Порядок появления: номер элемента внутри контейнера задаёт задержку анимации.
  const STAGGER = '.slide-body, .stack, .cards, .status-grid, .versions, .questions, .checklist, .endpoints, .chain, .timeline, .orbit .side, .row-chain, .legend, .strength';
  slides.forEach(slide => slide.querySelectorAll(STAGGER).forEach(box => {
    [...box.children].forEach((child, i) => child.style.setProperty('--i', Math.min(i, 9)));
  }));

  document.getElementById('outline').innerHTML = lessonGroups.map(group => `<section><h3>${group.title}<small>${group.time}</small></h3>${lessonSlides.slice(group.start - 1, group.end).map((slide, i) => `<button data-go="${group.start + i}"><span>${pad(group.start + i)}</span>${slide.title}</button>`).join('')}</section>`).join('');

  let index = 0;
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const hashIndex = () => {
    const match = location.hash.match(/^#(?:slide-)?(\d{1,3})$/);
    return match ? Math.max(0, Math.min(total - 1, Number(match[1]) - 1)) : 0;
  };
  function show(target, updateHash = true) {
    index = Math.max(0, Math.min(total - 1, target));
    const focusInSlide = main.contains(document.activeElement);
    slides.forEach((slide, i) => { slide.hidden = i !== index; slide.classList.remove('enter'); });
    // Перезапуск анимаций при каждом показе слайда.
    void slides[index].offsetWidth;
    slides[index].classList.add('enter');
    main.scrollTop = 0;
    const group = groupFor(index + 1);
    document.getElementById('chapter').textContent = `${group.title} · ${group.time}`;
    document.getElementById('counter').textContent = `${pad(index + 1)} / ${total}`;
    document.getElementById('progress').style.width = `${(index + 1) / total * 100}%`;
    document.querySelector('.progress').setAttribute('aria-valuenow', index + 1);
    document.querySelectorAll('#outline [data-go]').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.go) === index + 1)));
    prev.disabled = index === 0;
    next.disabled = index === total - 1;
    const plain = lessonSlides[index].title.replace(/<[^>]+>/g, '');
    document.title = `${pad(index + 1)} · ${plain} · API как контракт`;
    document.getElementById('announcement').textContent = `Слайд ${index + 1} из ${total}. ${plain}`;
    if (updateHash) history.replaceState(null, '', `#${pad(index + 1)}`);
    if (focusInSlide) main.focus({ preventScroll: true });
  }
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  window.addEventListener('hashchange', () => show(hashIndex(), false));

  const dialogTriggers = new WeakMap();
  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    dialogTriggers.set(dialog, trigger);
    dialog.showModal();
  }
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open, button)));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialogTriggers.get(dialog)?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
    button.closest('dialog')?.close(); show(Number(button.dataset.go) - 1); main.focus({ preventScroll: true });
  }));

  document.getElementById('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { toast('Полноэкранный режим недоступен в этом браузере.'); }
  });
  document.getElementById('print').addEventListener('click', () => window.print());

  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.target.closest('button,a,summary') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(total - 1); }
    else if (event.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
    else if (event.key.toLowerCase() === 'm') document.querySelector('[data-open="contents"]').click();
    else if (event.key.toLowerCase() === 's') document.querySelector('[data-open="sources"]').click();
  });

  let touchStart;
  main.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button,a,input,textarea,summary,pre,.table-wrap')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  main.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x, dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.7) show(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  let toastTimer;
  function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message; element.hidden = false; clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
  }

  // Снимки: клик открывает кадр крупно.
  document.querySelectorAll('.shot button.shot-view').forEach(view => view.addEventListener('click', () => {
    const img = view.querySelector('img');
    document.getElementById('visual-content').innerHTML = `<img src="${img.getAttribute('src')}" alt="${img.alt}">`;
    document.getElementById('visual-title').textContent = view.closest('.shot').querySelector('.shot-bar b').textContent;
    openDialog('visual', view);
  }));
  document.querySelectorAll('.shot img').forEach(img => img.addEventListener('error', () => {
    img.closest('.shot').classList.add('missing');
    toast(`Не удалось загрузить ${img.getAttribute('src')}. Откройте урок через HTTP-сервер из корня репозитория.`);
  }));

  // Анатомия сообщения: кнопка легенды подсвечивает строки своей части.
  document.querySelectorAll('.anatomy').forEach(box => {
    const buttons = [...box.querySelectorAll('[data-part-toggle]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const on = button.getAttribute('aria-pressed') !== 'true';
      buttons.forEach(other => other.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', String(on));
      box.classList.toggle('focusing', on);
      box.querySelectorAll('[data-part]').forEach(row => row.classList.toggle('lit', on && row.dataset.part === button.dataset.partToggle));
    }));
  });

  // Повтор запросов: состояние учебного сервера и ответы на одинаковые запросы.
  document.querySelectorAll('.replay').forEach(box => {
    let state, nextId, log;
    const reset = () => { state = [{ id: 42, status: 'open' }]; nextId = 43; log = []; render(); };
    const render = () => {
      box.querySelector('[data-state]').innerHTML = state.length
        ? state.map(t => `<span class="ticket-chip">#${t.id} · ${t.status}</span>`).join('')
        : '<span class="ticket-chip empty">коллекция пуста</span>';
      box.querySelector('[data-log]').innerHTML = log.length
        ? log.map(([req, code, note]) => `<li><code>${req}</code><b class="code-${String(code)[0]}">${code}</b><span>${note}</span></li>`).join('')
        : '<li class="hint"><span>Нажмите одну кнопку несколько раз подряд и сравните состояние сервера после каждого нажатия.</span></li>';
    };
    const run = kind => {
      const t42 = state.find(t => t.id === 42);
      if (kind === 'get') log.unshift(['GET /tickets/42', t42 ? 200 : 404, t42 ? 'состояние не изменилось' : 'ресурса нет, состояние не изменилось']);
      if (kind === 'post') { state.push({ id: nextId, status: 'open' }); log.unshift(['POST /tickets', 201, `создан #${nextId++} — ещё одно обращение`]); }
      if (kind === 'put') {
        if (t42) { const same = t42.status === 'closed'; t42.status = 'closed'; log.unshift(['PUT /tickets/42 {status: closed}', 200, same ? 'состояние то же, что после первого PUT' : '#42 заменён: closed']); }
        else log.unshift(['PUT /tickets/42 {status: closed}', 404, 'в учебном API PUT не создаёт ресурс']);
      }
      if (kind === 'delete') {
        if (t42) { state = state.filter(t => t.id !== 42); log.unshift(['DELETE /tickets/42', 204, '#42 удалён']); }
        else log.unshift(['DELETE /tickets/42', 404, 'код другой, но состояние то же: #42 нет']);
      }
      log = log.slice(0, 6); render();
    };
    box.querySelectorAll('[data-run]').forEach(button => button.addEventListener('click', () => run(button.dataset.run)));
    box.querySelector('[data-reset]').addEventListener('click', reset);
    reset();
  });

  // Линтер контракта: те же имена правил, что в .spectral.yaml учебного проекта.
  const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const VERBS = /^(get|create|update|delete|remove|add|make|set|edit)(?=[A-Z_-]|$)/i;
  function lintContract(text) {
    const problems = [];
    const lines = text.split('\n');
    const casings = new Set();
    lines.forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;
      const lineNo = i + 1;
      const add = (col, severity, rule, message) => problems.push({ line: lineNo, col, severity, rule, message });
      const [method, target = ''] = line.split(/\s+/);
      const upper = method.toUpperCase();
      if (!METHODS.includes(upper)) { add(1, 'error', 'http-method-known', `«${method}» не является HTTP-методом.`); return; }
      if (!target.startsWith('/')) { add(method.length + 2, 'error', 'path-format', 'Путь должен начинаться с «/».'); return; }
      const [path, query = ''] = target.split('?');
      const col = raw.indexOf(target) + 1;
      const segments = path.split('/').filter(Boolean).filter(s => !/^(api|v\d+)$/.test(s));
      segments.forEach(segment => {
        if (/^\{.+\}$/.test(segment) || /^\d+$/.test(segment)) return;
        if (/[A-Z]/.test(segment)) casings.add('camelCase');
        else if (segment.includes('-')) casings.add('kebab-case');
        else if (segment.includes('_')) casings.add('snake_case');
        else casings.add('lower');
        const verb = segment.match(VERBS);
        if (verb) add(col, 'error', 'paths-no-verbs', `В URI есть действие «${verb[1]}». Действие выражает HTTP-метод.`);
        if (upper === 'GET' && /(create|delete|remove|update|add|edit)/i.test(segment)) add(1, 'error', 'get-is-safe', 'GET не должен изменять состояние, а путь обещает изменение.');
      });
      const resource = segments.find(s => !/^\{.+\}$/.test(s) && !/^\d+$/.test(s) && !VERBS.test(s));
      if (resource && !/s$/i.test(resource.replace(/[-_].*$/, ''))) add(col, 'warning', 'collection-plural', `Коллекция «${resource}» названа в единственном числе.`);
      if (/(^|&)(id|\w+_id)=/i.test(query)) add(col + path.length, 'warning', 'id-in-path', 'Идентификатор ресурса передан query-параметром. Его место — path parameter.');
      const last = segments[segments.length - 1] || '';
      if (upper === 'POST' && /^(delete|remove)$/i.test(last)) add(1, 'error', 'method-matches-intent', 'Удаление выражено словом в пути. Для него есть метод DELETE.');
    });
    const naming = [...casings].filter(c => c !== 'lower');
    if (naming.length > 1) problems.push({ line: 1, col: 1, severity: 'warning', rule: 'naming-consistent', message: `В одном API смешаны стили: ${naming.join(', ')}.` });
    return problems.sort((a, b) => a.line - b.line || a.col - b.col);
  }
  document.querySelectorAll('.lint').forEach(box => {
    const input = box.querySelector('textarea');
    const output = box.querySelector('[data-lint-output]');
    const original = input.value;
    const run = () => {
      const problems = lintContract(input.value);
      const errors = problems.filter(p => p.severity === 'error').length;
      const warnings = problems.length - errors;
      output.hidden = false;
      output.innerHTML = problems.length
        ? problems.map(p => `<span class="lint-row ${p.severity}"><i>${p.line}:${p.col}</i><b>${p.severity}</b><em>${p.rule}</em><span>${p.message}</span></span>`).join('') +
          `<span class="lint-total">✖ ${problems.length} problems (${errors} errors, ${warnings} warnings)</span>`
        : '<span class="lint-total ok">No results with a severity of \'warn\' or higher found!</span>';
    };
    box.querySelector('[data-lint-run]').addEventListener('click', run);
    box.querySelector('[data-lint-reset]')?.addEventListener('click', () => { input.value = original; output.hidden = true; });
    if (box.dataset.live === 'true') input.addEventListener('input', () => { if (!output.hidden) run(); });
  });

  show(hashIndex(), false);
})();
