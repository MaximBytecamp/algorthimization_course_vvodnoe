/* Демонстрации занятия 3.

   Всё, что показывается на экране, действительно выполняется: скрипт строит
   план шагов по тому же алгоритму, что и в fragments.py, и проигрывает его
   с постоянной скоростью. Счётчик рядом увеличивается на каждом шаге, поэтому
   число под анимацией — не подпись, а результат прогона.

   Разметка:
     <div class="run" data-run="linear|binary|nlogn|quad|const" data-n="64">
     <div class="race" data-race="search|pairs">
     <figure class="chart" data-chart="growth">

   Скорость задаётся в data-speed (миллисекунд на шаг), по умолчанию своя
   для каждого вида: медленное там, где важно увидеть каждый шаг.          */
(() => {
  const STEP = { const: 520, binary: 420, linear: 90, nlogn: 55, quad: 26 };

  /* ---------- планы шагов: тот же алгоритм, что в fragments.py ---------- */

  function planLinear(n) {                       // поиск перебором, элемента нет
    return Array.from({ length: n }, (_, i) => [i]);
  }

  function planBinary(n) {                       // половинное деление, элемента нет
    const steps = [];
    let low = 0, high = n - 1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      steps.push([middle, low, high]);
      high = middle - 1;                         // искомое меньше всех, уходим влево
    }
    return steps;
  }

  function planConst(n) {                        // обращение по индексу
    return [[0]];
  }

  function planNlogn(n) {                        // сортировка слиянием: log n проходов по n
    const steps = [];
    for (let width = 1; width < n; width *= 2) {
      for (let i = 0; i < n; i++) steps.push([i, width]);
    }
    return steps;
  }

  function planQuad(n) {                         // все пары i < j
    const steps = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) steps.push([i, j]);
    return steps;
  }

  const PLAN = { const: planConst, binary: planBinary, linear: planLinear, nlogn: planNlogn, quad: planQuad };

  /* ---------- полоса ячеек ---------- */

  function buildStrip(host, n) {
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.style.setProperty('--n', n);
    for (let i = 0; i < n; i++) {
      const cell = document.createElement('i');
      cell.dataset.i = i;
      strip.appendChild(cell);
    }
    host.appendChild(strip);
    return [...strip.children];
  }

  function buildGrid(host, n) {
    const grid = document.createElement('div');
    grid.className = 'grid-pairs';
    grid.style.setProperty('--n', n);
    for (let i = 0; i < n * n; i++) grid.appendChild(document.createElement('i'));
    host.appendChild(grid);
    return [...grid.children];
  }

  /* ---------- один прогон ---------- */

  class Run {
    constructor(node) {
      this.node = node;
      this.kind = node.dataset.run;
      this.n = Number(node.dataset.n || 64);
      this.speed = Number(node.dataset.speed || STEP[this.kind] || 80);
      this.steps = PLAN[this.kind](this.n);
      this.counter = node.querySelector('.run__ops b');
      this.stage = node.querySelector('.run__stage');
      this.cells = this.kind === 'quad'
        ? buildGrid(this.stage, this.n)
        : buildStrip(this.stage, this.n);
      this.timer = null;
      this.done = false;
    }

    reset() {
      clearInterval(this.timer);
      this.cells.forEach(cell => { cell.className = ''; });
      if (this.counter) this.counter.textContent = '0';
      this.node.classList.remove('is-done');
      this.i = 0;
      this.done = false;
    }

    paint(step) {
      if (this.kind === 'quad') {
        const [i, j] = step;
        this.cells[i * this.n + j].className = 'hit';
        return;
      }
      if (this.kind === 'binary') {
        const [middle, low, high] = step;
        this.cells.forEach((cell, k) => {
          if (k < low || k > high) cell.className = cell.className || 'gone';
        });
        this.cells[middle].className = 'hit';
        return;
      }
      if (this.kind === 'nlogn') {
        const [i] = step;
        if (i === 0) this.cells.forEach(cell => { cell.className = ''; });
        this.cells[i].className = 'hit';
        return;
      }
      const [i] = step;
      if (i > 0) this.cells[i - 1].className = 'seen';
      this.cells[i].className = 'hit';
    }

    tick() {
      if (this.i >= this.steps.length) {
        clearInterval(this.timer);
        this.node.classList.add('is-done');
        this.done = true;
        if (this.onDone) this.onDone();
        return;
      }
      this.paint(this.steps[this.i]);
      this.i += 1;
      if (this.counter) this.counter.textContent = String(this.i);
    }

    start() {
      this.reset();
      this.timer = window.setInterval(() => this.tick(), this.speed);
    }

    stop() { clearInterval(this.timer); }
  }

  /* ---------- график роста ---------- */

  const CURVES = [
    { name: 'O(1)', color: '#8892B8', f: () => 1 },
    { name: 'O(log n)', color: '#2E8B57', f: n => Math.log2(Math.max(n, 1)) },
    { name: 'O(n)', color: '#2D7FC1', f: n => n },
    { name: 'O(n log n)', color: '#7C6BF5', f: n => n * Math.log2(Math.max(n, 2)) },
    { name: 'O(n²)', color: '#E8503A', f: n => n * n }
  ];

  function drawChart(figure) {
    const W = 560, H = 300, LEFT = 30, RIGHT = 96, TOP = 26, BOTTOM = 34, MAXN = 32;
    // Потолок шкалы — по кривой n log n. Тогда линейная и логарифмическая
    // различимы, а n² уходит за верх графика: это и есть «отвесно вверх».
    const top = MAXN * Math.log2(MAXN);
    const x = n => LEFT + (n / MAXN) * (W - LEFT - RIGHT);
    const y = v => H - BOTTOM - (Math.min(v, top) / top) * (H - BOTTOM - TOP);
    const svg = [`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Кривые роста пяти классов сложности">`];
    const usedY = [];                            // чтобы подписи не наезжали друг на друга
    svg.push(`<line class="axis" x1="${LEFT}" y1="${H - BOTTOM}" x2="${W - RIGHT + 10}" y2="${H - BOTTOM}"/>`);
    svg.push(`<line class="axis" x1="${LEFT}" y1="${TOP - 12}" x2="${LEFT}" y2="${H - BOTTOM}"/>`);
    svg.push(`<text class="axis-label" x="${W - RIGHT + 10}" y="${H - BOTTOM + 18}" text-anchor="end">размер входа n</text>`);
    svg.push(`<text class="axis-label" x="${LEFT}" y="${TOP - 18}">операций</text>`);
    CURVES.forEach((curve, index) => {
      const points = [];
      let lastVisible = 0;
      for (let n = 0; n <= MAXN; n += 0.25) {
        const value = curve.f(n);
        points.push(`${x(n).toFixed(1)},${y(value).toFixed(1)}`);
        if (value <= top) lastVisible = n;
        if (value > top) break;                 // кривая ушла за верх — дальше не рисуем
      }
      svg.push(`<polyline class="curve" style="--c:${curve.color};--d:${index * 0.3}s" points="${points.join(' ')}"/>`);
      const labelX = lastVisible >= MAXN ? x(MAXN) + 8 : x(lastVisible) + 6;
      let labelY = Math.max(y(curve.f(lastVisible)) + (lastVisible >= MAXN ? 4 : -8), TOP - 4);
      while (usedY.some(used => Math.abs(used - labelY) < 13)) labelY -= 13;
      usedY.push(labelY);
      const anchor = lastVisible >= MAXN ? 'start' : 'start';
      svg.push(`<text class="curve-label" style="--c:${curve.color};--d:${index * 0.3}s" x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="${anchor}">${curve.name}</text>`);
    });
    svg.push('</svg>');
    figure.querySelector('.chart__plot').innerHTML = svg.join('');
  }

  /* ---------- сборка ---------- */

  const runs = new Map();
  document.querySelectorAll('[data-run]').forEach(node => runs.set(node, new Run(node)));
  document.querySelectorAll('[data-chart="growth"]').forEach(drawChart);

  function slideOf(node) { return node.closest('.slide'); }

  function playSlide(slide) {
    runs.forEach((run, node) => {
      if (slideOf(node) === slide) run.start(); else run.stop();
    });
    const chart = slide.querySelector('.chart');
    if (chart) { chart.classList.remove('is-drawn'); void chart.offsetWidth; chart.classList.add('is-drawn'); }
  }

  document.querySelectorAll('.replay').forEach(button => {
    button.addEventListener('click', () => {
      const slide = button.closest('.slide');
      playSlide(slide);
    });
  });

  // Экран стал активным — прогон запускается сам, чтобы не искать кнопку на паре.
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      const slide = record.target;
      if (slide.classList.contains('is-active')) playSlide(slide);
    });
  });
  document.querySelectorAll('.slide').forEach(slide => observer.observe(slide, { attributes: true, attributeFilter: ['class'] }));

  const active = document.querySelector('.slide.is-active');
  if (active) playSlide(active);
})();
