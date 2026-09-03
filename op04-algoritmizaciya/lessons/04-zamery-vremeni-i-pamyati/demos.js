(() => {
  const TIME = [
    { n: 64, list: 25.605, set: 1.457 },
    { n: 128, list: 94.488, set: 2.738 },
    { n: 256, list: 330.333, set: 4.421 },
    { n: 512, list: 1071.267, set: 11.204 },
    { n: 1024, list: 4397.171, set: 20.150 },
    { n: 2048, list: 17227.367, set: 49.204 }
  ];

  const MEMORY = [
    { n: 500, list: 4.5, set: 40.3 },
    { n: 1000, list: 8.4, set: 40.3 },
    { n: 2000, list: 16.2, set: 160.3 },
    { n: 4000, list: 31.8, set: 160.3 },
    { n: 8000, list: 63.0, set: 640.3 }
  ];

  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  function drawChart(host, rows, series, unit) {
    const W = 720, H = 360, left = 62, right = 28, top = 26, bottom = 54;
    const values = rows.flatMap(row => series.map(item => row[item.key]));
    const maxValue = Math.max(...values) * 1.08;
    const x = index => left + index * (W - left - right) / (rows.length - 1);
    const y = value => H - bottom - value / maxValue * (H - top - bottom);
    const svg = make('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': host.dataset.label });

    for (let tick = 0; tick <= 4; tick += 1) {
      const value = maxValue * tick / 4;
      const py = y(value);
      svg.appendChild(make('line', { x1: left, x2: W - right, y1: py, y2: py, class: 'gridline' }));
      const label = make('text', { x: left - 10, y: py + 4, 'text-anchor': 'end', class: 'chart-label' });
      label.textContent = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(value < 10 ? 1 : 0);
      svg.appendChild(label);
    }

    svg.appendChild(make('line', { x1: left, x2: W - right, y1: H - bottom, y2: H - bottom, class: 'axis' }));
    svg.appendChild(make('line', { x1: left, x2: left, y1: top, y2: H - bottom, class: 'axis' }));

    rows.forEach((row, index) => {
      const label = make('text', { x: x(index), y: H - bottom + 23, 'text-anchor': 'middle', class: 'chart-label' });
      label.textContent = row.n;
      svg.appendChild(label);
    });

    const unitLabel = make('text', { x: left, y: 14, class: 'chart-label' });
    unitLabel.textContent = unit;
    svg.appendChild(unitLabel);
    const nLabel = make('text', { x: W - right, y: H - 12, 'text-anchor': 'end', class: 'chart-label' });
    nLabel.textContent = 'размер входа n';
    svg.appendChild(nLabel);

    series.forEach((item, seriesIndex) => {
      const points = rows.map((row, index) => `${x(index)},${y(row[item.key])}`).join(' ');
      const path = make('polyline', { points, class: 'chart-path', style: `--c:${item.color}` });
      svg.appendChild(path);
      rows.forEach((row, index) => {
        svg.appendChild(make('circle', {
          cx: x(index), cy: y(row[item.key]), r: 5, class: 'chart-dot',
          style: `--c:${item.color};--d:${.35 + seriesIndex * .18 + index * .11}s`
        }));
      });
    });

    host.replaceChildren(svg);
  }

  document.querySelectorAll('[data-chart="time"]').forEach(host => drawChart(host, TIME, [
    { key: 'list', color: '#e45832' },
    { key: 'set', color: '#087f62' }
  ], 'мкс / вызов'));

  document.querySelectorAll('[data-chart="memory"]').forEach(host => drawChart(host, MEMORY, [
    { key: 'list', color: '#2867d5' },
    { key: 'set', color: '#7455c6' }
  ], 'пиковая traced memory, KiB'));

  const lab = document.querySelector('[data-live-lab]');
  if (lab) {
    const sizeButtons = [...lab.querySelectorAll('[data-size]')];
    const listBar = lab.querySelector('[data-list-bar]');
    const setBar = lab.querySelector('[data-set-bar]');
    const listValue = lab.querySelector('[data-list-value]');
    const setValue = lab.querySelector('[data-set-value]');
    const factor = lab.querySelector('[data-factor]');
    const verdict = lab.querySelector('[data-verdict]');

    function show(n) {
      const row = TIME.find(item => item.n === n);
      if (!row) return;
      const max = Math.max(row.list, row.set);
      listBar.style.width = `${Math.max(2, row.list / max * 100)}%`;
      setBar.style.width = `${Math.max(2, row.set / max * 100)}%`;
      listValue.textContent = `${row.list.toFixed(3)} мкс`;
      setValue.textContent = `${row.set.toFixed(3)} мкс`;
      factor.textContent = `${(row.list / row.set).toFixed(1)}×`;
      verdict.textContent = n < 256
        ? 'Разница уже измерима, но абсолютное время обеих реализаций мало.'
        : 'Квадратичный рост начинает определять пользовательскую задержку.';
      sizeButtons.forEach(button => button.classList.toggle('is-active', Number(button.dataset.size) === n));
    }

    sizeButtons.forEach(button => button.addEventListener('click', () => show(Number(button.dataset.size))));
    show(128);
  }

  document.querySelectorAll('[data-boundary]').forEach(stage => {
    const toggles = [...stage.querySelectorAll('[data-boundary-toggle]')];
    const total = stage.querySelector('[data-boundary-total]');
    function update() {
      const active = toggles.filter(button => button.classList.contains('is-active'));
      total.textContent = active.length === 1 && active[0].dataset.boundaryToggle === 'algorithm'
        ? 'Измеряется только исследуемая функция'
        : 'Результат смешивает несколько видов работы';
      total.classList.toggle('is-good', active.length === 1 && active[0].dataset.boundaryToggle === 'algorithm');
    }
    toggles.forEach(button => button.addEventListener('click', () => {
      button.classList.toggle('is-active');
      update();
    }));
    update();
  });
})();

