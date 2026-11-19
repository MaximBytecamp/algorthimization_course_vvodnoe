(() => {
  const values = [42, 17, 30];
  const names = ['head', 'second', 'third'];
  let serial = 0;

  // Поле next содержит ссылку: стрелка начинается в нём и заканчивается у объекта.
  function drawChain(host, { count = 3, current = null, focus = null, single = false } = {}) {
    const vertical = host.clientWidth < 620;
    const indices = single ? [2] : [0, 1, 2];
    const width = vertical ? 280 : single ? 350 : 820;
    const height = vertical ? single ? 200 : 510 : 240;
    const marker = `ln-arrow-${++serial}`;
    const pos = i => ({ x: vertical ? 80 : single ? 90 : 90 + i * 225, y: vertical ? single ? 40 : 40 + i * 150 : 70 });
    const text = (x, y, value, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${value}</text>`;
    const arrow = (d, cls = '') => `<path d="${d}" class="ln-link ${cls}" marker-end="url(#${marker})"/>`;
    let body = '';
    const first = 3 - count;
    indices.forEach(i => {
      const { x, y } = pos(i);
      if (i < first) {
        body += `<rect x="${x}" y="${y}" width="140" height="76" class="ln-empty"/>` + text(x + 70, y + 44, 'ещё нет узла', 'ln-small');
        return;
      }
      const selected = current === i || focus === i;
      body += `<g class="ln-object${selected ? ' ln-object--active' : ''}"><title>Узел ${values[i]}: value = ${values[i]}, next ${i === 2 ? '= None' : 'ссылается на узел ' + values[i + 1]}</title><rect x="${x}" y="${y}" width="140" height="76"/><path d="M${x + 77},${y} v76"/>${text(x + 38, y + 24, 'value', 'ln-small')}${text(x + 109, y + 24, 'next', 'ln-small')}${text(x + 38, y + 59, values[i], 'ln-value')}<circle cx="${x + 109}" cy="${y + 53}" r="4"/></g>`;
      if (vertical) {
        body += text(x - 9, y + 19, names[i], 'ln-name', 'end') + arrow(`M${x - 12},${y + 28} H${x - 2}`, 'ln-variable');
      } else {
        body += text(x + 70, y - 33, names[i], 'ln-name') + arrow(`M${x + 70},${y - 25} V${y - 2}`, 'ln-variable');
      }
      if (i < 2) {
        const dest = pos(i + 1);
        body += vertical
          ? arrow(`M${x + 109},${y + 53} H250 V${dest.y - 18} H${dest.x + 70} V${dest.y - 2}`)
          : arrow(`M${x + 109},${y + 53} H${dest.x - 2}`);
      } else {
        body += vertical
          ? arrow(`M${x + 109},${y + 53} H250 V${y + 115} H${x + 73}`) + text(x + 38, y + 121, 'None', 'ln-name')
          : arrow(`M${x + 109},${y + 53} H${x + 176}`) + text(x + 207, y + 59, 'None', 'ln-name');
      }
      if (current === i) {
        body += text(x + 46, y + 112, 'current', 'ln-name') + arrow(`M${x + 46},${y + 95} V${y + 78}`, 'ln-variable');
      }
    });
    if (current === 3) body += text(vertical ? 145 : 675, vertical ? 491 : 205, 'current = None', 'ln-name');
    const description = `Создано узлов: ${count}. ${values.slice(first).join(' → ')}${count ? ' → None.' : ''}${current !== null ? ' current: ' + (values[current] ?? 'None') + '.' : ''}`;
    host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${description}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${body}</svg>`;
  }

  document.querySelectorAll('[data-node-diagram]').forEach(host => {
    const render = () => drawChain(host, { count: 1, single: true });
    new ResizeObserver(render).observe(host);
  });

  function player(root, states, render) {
    let index = 0;
    const next = root.querySelector('[data-next]');
    const previous = root.querySelector('[data-prev]');
    const update = () => {
      const state = states[index];
      root.querySelector('[data-step]').textContent = `Шаг ${index} из ${states.length - 1}`;
      const status = root.querySelector('[data-status]');
      status.textContent = state.message;
      status.setAttribute('aria-live', 'polite');
      root.querySelectorAll('[data-line]').forEach(line => {
        const active = Number(line.dataset.line) === state.line;
        line.classList.toggle('ln-code-active', active);
        if (active) line.setAttribute('aria-current', 'step');
        else line.removeAttribute('aria-current');
      });
      next.disabled = index === states.length - 1;
      previous.disabled = index === 0;
      render(state);
    };
    next.addEventListener('click', () => { if (index < states.length - 1) { index++; update(); } });
    previous.addEventListener('click', () => { if (index > 0) { index--; update(); } });
    root.querySelector('[data-reset]').addEventListener('click', () => { index = 0; update(); });
    new ResizeObserver(update).observe(root.querySelector('[data-chain-diagram]'));
    update();
  }

  const build = document.querySelector('[data-build-demo]');
  if (build) player(build, [
    { count: 0, line: -1, message: 'Класс Node уже определён. Эти три узла ещё не созданы. Выполняйте строки сверху вниз.' },
    { count: 1, focus: 2, line: 0, message: 'Node(30) создаёт узел: value = 30, next = None. Переменная third получает ссылку на этот объект.' },
    { count: 2, focus: 1, line: 1, message: 'Node(17, third) создаёт узел 17. В его next записана ссылка на существующий узел 30. Узел 30 остаётся тем же объектом.' },
    { count: 3, focus: 0, line: 2, message: 'Node(42, second) создаёт узел 42 со ссылкой на узел 17. head указывает на начало: 42 → 17 → 30 → None.' }
  ], state => drawChain(build.querySelector('[data-chain-diagram]'), state));

  const walk = document.querySelector('[data-walk-demo]');
  if (walk) player(walk, [
    { current: null, line: -1, output: [], message: 'Цепочка уже построена. head, second и third сохраняют свои ссылки. Начнём выполнение обхода.' },
    { current: 0, line: 0, output: [], message: 'current = head. Две переменные указывают на один узел 42. Копия узла при присваивании не создаётся.' },
    { current: 0, line: 2, output: [42], message: 'Условие цикла истинно: current указывает на узел. print(current.value) выводит 42.' },
    { current: 1, line: 3, output: [42], message: 'current = current.next. Сначала читается next узла 42, затем current получает ссылку на узел 17. head остаётся на узле 42.' },
    { current: 1, line: 2, output: [42, 17], message: 'Условие снова истинно. print(current.value) добавляет в вывод значение 17.' },
    { current: 2, line: 3, output: [42, 17], message: 'Поле next узла 17 ведёт к узлу 30. current получает эту ссылку. Стрелки между узлами сохраняются.' },
    { current: 2, line: 2, output: [42, 17, 30], message: 'current указывает на узел 30. print(current.value) добавляет 30 в вывод.' },
    { current: 3, line: 3, output: [42, 17, 30], message: 'Поле next последнего узла равно None. Присваивание current = current.next даёт current = None.' },
    { current: 3, line: 1, output: [42, 17, 30], message: 'Условие current is not None ложно. Цикл завершён. Все три узла и ссылка head сохранились.' }
  ], state => {
    drawChain(walk.querySelector('[data-chain-diagram]'), state);
    walk.querySelector('[data-output]').textContent = state.output.length ? state.output.join('\n') : 'Пока пусто';
  });

  const access = document.querySelector('[data-access-demo]');
  if (access) {
    let step = 0;
    const messages = [
      'Начало. Нужно получить третий элемент, 30.',
      'tasks[2] даёт 30. В цепочке current = head: текущий узел — 42.',
      'Первый переход current = current.next ведёт от узла 42 к узлу 17.',
      'Второй переход ведёт от узла 17 к узлу 30. current.value даёт 30.'
    ];
    const render = () => {
      access.querySelectorAll('[data-list-item]').forEach((item, i) => item.classList.toggle('is-hot', step > 0 && i === 2));
      drawChain(access.querySelector('[data-chain-diagram]'), { current: step ? step - 1 : null });
      access.querySelector('#access-status').textContent = messages[step];
      access.querySelector('[data-access-next]').disabled = step === 3;
    };
    access.querySelector('[data-access-next]').addEventListener('click', () => { if (step < 3) { step++; render(); } });
    access.querySelector('[data-access-reset]').addEventListener('click', () => { step = 0; render(); });
    new ResizeObserver(render).observe(access.querySelector('[data-chain-diagram]'));
    render();
  }

  // Инвариант current: обработано / current / необработано
  const invariant = document.querySelector('[data-invariant-demo]');
  if (invariant) {
    const states = [
      { processed: [], current: 0, unprocessed: [1, 2], output: [], line: 0, message: 'Перед циклом: current = head. Все узлы ещё не обработаны.' },
      { processed: [], current: 0, unprocessed: [1, 2], output: [], line: 1, message: 'Проверка while: current указывает на узел 42. Условие истинно, входим в тело цикла.' },
      { processed: [0], current: 0, unprocessed: [1, 2], output: [42], line: 2, message: 'Печать 42. Узел обработан, но current ещё у него.' },
      { processed: [0], current: 1, unprocessed: [2], output: [42], line: 3, message: 'Переход current = current.next восстанавливает инвариант: current у первого необработанного.' },
      { processed: [0], current: 1, unprocessed: [2], output: [42], line: 1, message: 'Проверка: current указывает на узел 17. Условие истинно.' },
      { processed: [0, 1], current: 1, unprocessed: [2], output: [42, 17], line: 2, message: 'Печать 17. Узел 17 обработан.' },
      { processed: [0, 1], current: 2, unprocessed: [], output: [42, 17], line: 3, message: 'Переход: current у узла 30, последнего необработанного.' },
      { processed: [0, 1], current: 2, unprocessed: [], output: [42, 17], line: 1, message: 'Проверка: current указывает на узел 30. Условие истинно.' },
      { processed: [0, 1, 2], current: 2, unprocessed: [], output: [42, 17, 30], line: 2, message: 'Печать 30. Все узлы обработаны.' },
      { processed: [0, 1, 2], current: 3, unprocessed: [], output: [42, 17, 30], line: 3, message: 'Переход: current = None. Необработанных узлов нет.' },
      { processed: [0, 1, 2], current: 3, unprocessed: [], output: [42, 17, 30], line: 1, message: 'Проверка: current is None. Условие ложно, цикл завершён.' }
    ];
    player(invariant, states, state => {
      const host = invariant.querySelector('[data-chain-diagram]');
      host.classList.add('ln-diagram');
      const vertical = host.clientWidth < 620;
      const width = vertical ? 280 : 820;
      const height = vertical ? 710 : 320;
      const marker = `inv-arrow-${++serial}`;
      const pos = i => ({ x: vertical ? 80 : 90 + i * 225, y: vertical ? 40 + i * 150 : 70 });
      const text = (x, y, value, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${value}</text>`;
      const arrow = (d, cls = '') => `<path d="${d}" class="ln-link ${cls}" marker-end="url(#${marker})"/>`;
      let body = '';
      [0, 1, 2].forEach(i => {
        const { x, y } = pos(i);
        const isProcessed = state.processed.includes(i);
        const isCurrent = state.current === i;
        const cls = isCurrent ? ' ln-object--active' : isProcessed ? ' ln-object--done' : '';
        body += `<g class="ln-object${cls}"><rect x="${x}" y="${y}" width="140" height="76"/><path d="M${x + 77},${y} v76"/>${text(x + 38, y + 24, 'value', 'ln-small')}${text(x + 109, y + 24, 'next', 'ln-small')}${text(x + 38, y + 59, values[i], 'ln-value')}<circle cx="${x + 109}" cy="${y + 53}" r="4"/></g>`;
        if (i === 0) {
          body += vertical
            ? text(x - 9, y + 19, 'head', 'ln-name', 'end') + arrow(`M${x - 12},${y + 28} H${x - 2}`, 'ln-variable')
            : text(x + 70, y - 33, 'head', 'ln-name') + arrow(`M${x + 70},${y - 25} V${y - 2}`, 'ln-variable');
        }
        if (isCurrent && state.current < 3) {
          body += vertical
            ? text(x + 148, y + 19, 'current', 'ln-name') + arrow(`M${x + 145},${y + 28} H${x + 142}`, 'ln-variable')
            : text(x + 70, y + 170, 'current', 'ln-name') + arrow(`M${x + 70},${y + 153} V${y + 78}`, 'ln-variable');
        }
        if (i < 2) {
          const dest = pos(i + 1);
          body += vertical ? arrow(`M${x + 109},${y + 53} H250 V${dest.y - 18} H${dest.x + 70} V${dest.y - 2}`) : arrow(`M${x + 109},${y + 53} H${dest.x - 2}`);
        } else {
          body += vertical
            ? arrow(`M${x + 109},${y + 53} H250 V${y + 115} H${x + 73}`) + text(x + 38, y + 121, 'None', 'ln-name')
            : arrow(`M${x + 109},${y + 53} H${x + 176}`) + text(x + 207, y + 59, 'None', 'ln-name');
        }
      });
      if (state.current === 3) body += text(vertical ? 145 : 675, vertical ? 680 : 285, 'current = None', 'ln-name');
      const status = `Обработано: ${state.processed.length}. Current: ${state.current < 3 ? values[state.current] : 'None'}. Необработано: ${values.length - state.processed.length}.`;
      host.innerHTML = `<svg class="ln-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${status}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${body}</svg>`;
      invariant.querySelector('[data-output]').textContent = state.output.length ? state.output.join('\n') : 'Пока пусто';
    });
  }

  // Dummy-head deletion: сравнение удаления первого и внутреннего
  const dummy = document.querySelector('[data-dummy-demo]');
  if (dummy) {
    const scenarios = [
      { name: 'head', wanted: 4, nodes: [{ v: 4, next: 1 }, { v: 7, next: 2 }, { v: 9, next: null }], steps: [
        { dummyNext: 0, previous: -1, checking: 0, links: [1, 2, null], line: 0, message: 'Создан dummy. previous = dummy, dummy.next указывает на узел 4.' },
        { dummyNext: 0, previous: -1, checking: 0, links: [1, 2, null], line: 1, message: 'Проверка previous.next: узел 4. Его value (4) совпадает с wanted (4).' },
        { dummyNext: 1, previous: -1, checking: 0, links: [1, 2, null], line: 2, message: 'previous.next = previous.next.next: dummy.next теперь указывает на узел 7. Узел 4 выпал.' },
        { dummyNext: 1, previous: -1, checking: null, links: [1, 2, null], line: 3, message: 'Возврат dummy.next: результат начинается с узла 7. Dummy не входит в список.' }
      ]},
      { name: 'middle', wanted: 7, nodes: [{ v: 4, next: 1 }, { v: 7, next: 2 }, { v: 9, next: null }], steps: [
        { dummyNext: 0, previous: -1, checking: 0, links: [1, 2, null], line: 0, message: 'Создан dummy. previous = dummy, dummy.next указывает на узел 4.' },
        { dummyNext: 0, previous: -1, checking: 0, links: [1, 2, null], line: 1, message: 'Проверка previous.next: узел 4. Его value (4) не равно wanted (7).' },
        { dummyNext: 0, previous: 0, checking: 1, links: [1, 2, null], line: 4, message: 'Переход: previous теперь указывает на узел 4. Следующий узел для проверки — 7.' },
        { dummyNext: 0, previous: 0, checking: 1, links: [1, 2, null], line: 1, message: 'Проверка previous.next: узел 7. Его value (7) совпадает с wanted (7).' },
        { dummyNext: 0, previous: 0, checking: 1, links: [2, 2, null], line: 2, message: 'previous.next = previous.next.next: узел 4 теперь ведёт к узлу 9. Узел 7 выпал.' },
        { dummyNext: 0, previous: 0, checking: null, links: [2, 2, null], line: 3, message: 'Возврат dummy.next: результат начинается с узла 4. Dummy не входит в список.' }
      ]}
    ];
    let scenario = 0;
    let step = 0;
    const render = () => {
      const { wanted, nodes, steps } = scenarios[scenario];
      const state = steps[step];
      const host = dummy.querySelector('[data-chain-diagram]');
      host.classList.add('ln-diagram');
      const vertical = host.clientWidth < 600;
      const width = vertical ? 300 : 900;
      const height = vertical ? 660 : 300;
      const marker = `dum-arrow-${++serial}`;
      const pos = i => ({ x: vertical ? 80 : 250 + i * 190, y: vertical ? 180 + i * 140 : 110 });
      const dummyPos = vertical ? { x: 80, y: 40 } : { x: 50, y: 110 };
      const text = (x, y, value, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${value}</text>`;
      const arrow = (d, cls = '') => `<path d="${d}" class="ln-link ${cls}" marker-end="url(#${marker})"/>`;
      const previousLabel = (x, y, targetX, targetY) => vertical
        ? text(8, y + 100, 'previous', 'ln-name', 'start') + arrow(`M45,${y + 80} V${y + 33} H${x - 2}`, 'ln-variable')
        : text(x + 60, y + 140, 'previous', 'ln-name') + arrow(`M${x + 60},${y + 123} V${targetY}`, 'ln-variable');
      let body = '';
      body += `<g class="ln-object${state.previous === -1 ? ' ln-object--active' : ''}"><rect x="${dummyPos.x}" y="${dummyPos.y}" width="120" height="66"/><path d="M${dummyPos.x + 66},${dummyPos.y} v66"/>${text(dummyPos.x + 33, dummyPos.y + 22, 'value', 'ln-small')}${text(dummyPos.x + 93, dummyPos.y + 22, 'next', 'ln-small')}${text(dummyPos.x + 33, dummyPos.y + 50, 'None', 'ln-small')}<circle cx="${dummyPos.x + 93}" cy="${dummyPos.y + 46}" r="4"/></g>`;
      body += vertical
        ? text(dummyPos.x - 8, dummyPos.y + 18, 'dummy', 'ln-name', 'end') + arrow(`M${dummyPos.x - 11},${dummyPos.y + 26} H${dummyPos.x - 2}`, 'ln-variable')
        : text(dummyPos.x + 60, dummyPos.y - 28, 'dummy', 'ln-name') + arrow(`M${dummyPos.x + 60},${dummyPos.y - 20} V${dummyPos.y - 2}`, 'ln-variable');
      if (state.previous === -1) body += previousLabel(dummyPos.x, dummyPos.y, dummyPos.x + 122, dummyPos.y + 26);
      const dummyDest = pos(state.dummyNext);
      body += vertical
        ? state.dummyNext > 0
          ? arrow(`M${dummyPos.x + 93},${dummyPos.y + 46} H290 V${dummyDest.y + 33} H${dummyDest.x + 122}`)
          : arrow(`M${dummyPos.x + 93},${dummyPos.y + 46} H250 V${dummyDest.y - 16} H${dummyDest.x + 60} V${dummyDest.y - 2}`)
        : state.dummyNext > 0
          ? arrow(`M${dummyPos.x + 93},${dummyPos.y + 46} H${dummyPos.x + 150} V${dummyPos.y - 50} H${dummyDest.x + 60} V${dummyDest.y - 2}`)
          : arrow(`M${dummyPos.x + 93},${dummyPos.y + 46} H${dummyDest.x - 2}`);
      nodes.forEach((node, i) => {
        const { x, y } = pos(i);
        const isActive = state.previous === i || state.checking === i;
        const next = state.links[i];
        body += `<g class="ln-object${isActive ? ' ln-object--active' : ''}"><rect x="${x}" y="${y}" width="120" height="66"/><path d="M${x + 66},${y} v66"/>${text(x + 33, y + 22, 'value', 'ln-small')}${text(x + 93, y + 22, 'next', 'ln-small')}${text(x + 33, y + 50, node.v, 'ln-value')}<circle cx="${x + 93}" cy="${y + 46}" r="4"/></g>`;
        if (state.previous === i) body += previousLabel(x, y, x + 122, y + 26);
        if (next !== null) {
          const dest = pos(next);
          body += vertical
            ? next > i + 1
              ? arrow(`M${x + 93},${y + 46} H290 V${dest.y + 33} H${dest.x + 122}`)
              : arrow(`M${x + 93},${y + 46} H250 V${dest.y - 16} H${dest.x + 60} V${dest.y - 2}`)
            : next > i + 1
              ? arrow(`M${x + 93},${y + 46} H${x + 140} V${y - 50} H${dest.x + 60} V${dest.y - 2}`)
              : arrow(`M${x + 93},${y + 46} H${dest.x - 2}`);
        } else {
          body += vertical
            ? arrow(`M${x + 93},${y + 46} H270 V${y + 100} H${x + 60}`) + text(x + 33, y + 106, 'None', 'ln-name')
            : arrow(`M${x + 93},${y + 46} H${x + 140}`) + text(x + 165, y + 52, 'None', 'ln-name');
        }
      });
      const status = `Удаление ${wanted}. ${state.message}`;
      host.innerHTML = `<svg class="ln-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${status}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${body}</svg>`;
      dummy.querySelector('[data-step]').textContent = `Шаг ${step} из ${steps.length - 1}`;
      const statusNode = dummy.querySelector('[data-status]');
      statusNode.textContent = state.message;
      statusNode.setAttribute('aria-live', 'polite');
      dummy.querySelectorAll('[data-line]').forEach(line => {
        const active = Number(line.dataset.line) === state.line;
        line.classList.toggle('ln-code-active', active);
        if (active) line.setAttribute('aria-current', 'step');
        else line.removeAttribute('aria-current');
      });
      dummy.querySelector('[data-next]').disabled = step === steps.length - 1;
      dummy.querySelector('[data-prev]').disabled = step === 0;
      dummy.querySelectorAll('[data-scenario]').forEach((btn, i) => {
        btn.classList.toggle('btn--main', i === scenario);
        btn.disabled = i === scenario;
      });
    };
    dummy.querySelector('[data-next]').addEventListener('click', () => { if (step < scenarios[scenario].steps.length - 1) { step++; render(); } });
    dummy.querySelector('[data-prev]').addEventListener('click', () => { if (step > 0) { step--; render(); } });
    dummy.querySelector('[data-reset]').addEventListener('click', () => { step = 0; render(); });
    dummy.querySelectorAll('[data-scenario]').forEach((btn, i) => {
      btn.addEventListener('click', () => { scenario = i; step = 0; render(); });
    });
    new ResizeObserver(render).observe(dummy.querySelector('[data-chain-diagram]'));
    render();
  }

  // Выбор структуры по требованиям
  const choice = document.querySelector('[data-choice-demo]');
  if (choice) {
    const scenarios = [
      { q: 'Номер позиции известен (например, tasks[2]); нужно быстро прочитать элемент по индексу.', a: 'list', why: 'Индекс даёт доступ за O(1). Для известной позиции цепочка Node потребовала бы идти от головы по переходам.' },
      { q: 'Есть ссылка на узел-предшественник; нужно удалить следующий узел.', a: 'Node', why: 'Замена одного поля next занимает O(1), если предшественник уже известен. Если его ещё нужно найти от головы, это добавляет O(n).' },
      { q: 'Заявки обслуживаются в порядке поступления; нужно быстро добавлять в конец и снимать с начала.', a: 'deque', why: 'append и popleft оба работают за O(1). Для list операция pop(0) стоит O(n), потому что элементы сдвигаются.' },
      { q: 'Нужно быстро проверить, есть ли ключ 42 в коллекции (например, уникальные номера заявок).', a: 'set', why: 'Проверка наличия ключа в set занимает ожидаемое O(1). В list потребуется проход за O(n).' },
      { q: 'Нужно быстро найти статус заявки по её номеру (например, номер → статус).', a: 'dict', why: 'Поиск по ключу в dict занимает ожидаемое O(1). Словарь хранит пары «ключ — значение».' }
    ];
    let current = 0;
    const render = () => {
      const { q, a, why } = scenarios[current];
      choice.querySelector('[data-question]').textContent = q;
      const opts = choice.querySelectorAll('[data-option]');
      opts.forEach(btn => {
        btn.classList.remove('btn--main');
        btn.disabled = false;
      });
      choice.querySelector('[data-explanation]').textContent = '';
      choice.querySelector('[data-explanation]').style.display = 'none';
      choice.querySelector('[data-next-scenario]').disabled = current === scenarios.length - 1;
      choice.querySelector('[data-prev-scenario]').disabled = current === 0;
    };
    const showExplanation = (selected) => {
      const { a, why } = scenarios[current];
      const correct = selected === a;
      const opts = choice.querySelectorAll('[data-option]');
      opts.forEach(btn => {
        btn.disabled = true;
        btn.classList.toggle('btn--main', btn.dataset.option === a);
      });
      const expl = choice.querySelector('[data-explanation]');
      expl.textContent = correct ? `Правильно! ${why}` : `Выбран ${selected}, но для этого требования лучше подходит ${a}. ${why}`;
      expl.style.display = 'block';
      expl.style.background = correct ? 'var(--steel-pale)' : 'var(--fire-pale)';
      expl.style.padding = '1rem';
      expl.style.border = '3px solid var(--ink)';
      expl.style.boxShadow = '5px 5px 0 var(--ink)';
      expl.style.marginTop = '1rem';
      expl.setAttribute('aria-live', 'polite');
    };
    choice.querySelectorAll('[data-option]').forEach(btn => {
      btn.addEventListener('click', () => showExplanation(btn.dataset.option));
    });
    choice.querySelector('[data-next-scenario]').addEventListener('click', () => {
      if (current < scenarios.length - 1) { current++; render(); }
    });
    choice.querySelector('[data-prev-scenario]').addEventListener('click', () => {
      if (current > 0) { current--; render(); }
    });
    choice.querySelector('[data-reset-choice]').addEventListener('click', () => {
      current = 0; render();
    });
    render();
  }
})();
