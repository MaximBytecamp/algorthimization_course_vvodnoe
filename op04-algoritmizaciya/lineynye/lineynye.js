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
      root.querySelector('[data-status]').textContent = state.message;
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
})();
