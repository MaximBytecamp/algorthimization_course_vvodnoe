'use strict';
// Интерактивные блоки темы. Одни и те же поведения нужны колоде (app.js)
// и лекции (lecture.js), поэтому они собраны здесь.
window.apiTopicInteractive = (root, options = {}) => {
  const toast = options.toast || (() => {});
  const onZoom = options.onZoom || null;

  // Порядок появления: номер элемента внутри контейнера задаёт задержку анимации.
  const STAGGER = '.slide-body, .stack, .cards, .status-grid, .versions, .questions, .checklist, .endpoints, .chain, .timeline, .orbit .side, .row-chain, .legend, .strength';
  root.querySelectorAll(STAGGER).forEach(box => {
    [...box.children].forEach((child, i) => child.style.setProperty('--i', Math.min(i, 9)));
  });

  // Снимки: клик открывает кадр крупно — в колоде диалогом, в лекции новой вкладкой.
  root.querySelectorAll('.shot button.shot-view').forEach(view => {
    const img = view.querySelector('img');
    view.addEventListener('click', () => {
      if (onZoom) onZoom(img, view.closest('.shot').querySelector('.shot-bar b').textContent);
      else window.open(img.getAttribute('src'), '_blank', 'noopener');
    });
  });
  root.querySelectorAll('.shot img').forEach(img => img.addEventListener('error', () => {
    img.closest('.shot').classList.add('missing');
    toast(`Не удалось загрузить ${img.getAttribute('src')}. Откройте страницу через HTTP-сервер из корня репозитория.`);
  }));

  // Анатомия сообщения: кнопка легенды подсвечивает строки своей части.
  root.querySelectorAll('.anatomy').forEach(box => {
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
  root.querySelectorAll('.replay').forEach(box => {
    let state, nextId, log;
    const render = () => {
      box.querySelector('[data-state]').innerHTML = state.length
        ? state.map(t => `<span class="ticket-chip">#${t.id} · ${t.status}</span>`).join('')
        : '<span class="ticket-chip empty">коллекция пуста</span>';
      box.querySelector('[data-log]').innerHTML = log.length
        ? log.map(([req, code, note]) => `<li><code>${req}</code><b class="code-${String(code)[0]}">${code}</b><span>${note}</span></li>`).join('')
        : '<li class="hint"><span>Нажмите одну кнопку несколько раз подряд и сравните состояние сервера после каждого нажатия.</span></li>';
    };
    const reset = () => { state = [{ id: 42, status: 'open' }]; nextId = 43; log = []; render(); };
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
    const casings = new Set();
    text.split('\n').forEach((raw, i) => {
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
  root.querySelectorAll('.lint').forEach(box => {
    const input = box.querySelector('textarea');
    const output = box.querySelector('[data-lint-output]');
    const original = input.value;
    const run = () => {
      const problems = lintContract(input.value);
      const errors = problems.filter(p => p.severity === 'error').length;
      output.hidden = false;
      output.innerHTML = problems.length
        ? problems.map(p => `<span class="lint-row ${p.severity}"><i>${p.line}:${p.col}</i><b>${p.severity}</b><em>${p.rule}</em><span>${p.message}</span></span>`).join('') +
          `<span class="lint-total">✖ ${problems.length} problems (${errors} errors, ${problems.length - errors} warnings)</span>`
        : '<span class="lint-total ok">No results with a severity of \'warn\' or higher found!</span>';
    };
    box.querySelector('[data-lint-run]').addEventListener('click', run);
    box.querySelector('[data-lint-reset]')?.addEventListener('click', () => { input.value = original; output.hidden = true; });
    if (box.dataset.live === 'true') input.addEventListener('input', () => { if (!output.hidden) run(); });
  });
};
