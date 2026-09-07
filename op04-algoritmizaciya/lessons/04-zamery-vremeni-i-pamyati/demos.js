/* Демонстрации занятия 4.

   Все числа здесь получены запуском Python на этой машине и лежат
   в course-materials/benchmarks/results_time.csv и results_memory.csv.
   Скрипт ничего не измеряет в браузере: секунды, снятые в JavaScript,
   к стоимости кода на Python отношения не имеют, и показывать их
   как замер было бы ровно тем дефектом, который разбирается на занятии.

   Две демонстрации:

     [data-boundary]  граница замера: строки листинга кликаются, число
                      складывается из реальной стоимости выбранных строк;
     [data-plot]      серия на логарифмических осях: точки — замеры,
                      прямизна линии показывает степенную зависимость.

   Сырые значения серии и результаты запусков показываются кадрами
   терминала: это настоящий вывод программы, а не его пересказ.        */
(() => {

  /* ---------- граница замера ---------- */

  function setupBoundary(root) {
    const lines = [...root.querySelectorAll('.boundary__line')];
    const costs = lines.map(line => Number(line.dataset.cost));
    const valueField = root.querySelector('[data-boundary-value]');
    const spanField = root.querySelector('[data-boundary-span]');
    const verdictField = root.querySelector('[data-boundary-verdict]');
    const presets = [...root.querySelectorAll('[data-preset]')];
    let from = 3;                 // строки 4–6: только цикл
    let to = 5;
    let pending = null;           // первый клик выбранной пары

    // 1333.9 → «1 333,9»: разряды разделяются неразрывным пробелом
    const format = value => {
      const [whole, fraction] = value.toFixed(1).split('.');
      return `${whole.replace(/\B(?=(\d{3})+$)/g, '\u00a0')},${fraction}`;
    };

    // Что показывает выбранный участок. Порядок проверок от худшего
    // промаха к лучшему: генерация врёт сильнее печати.
    function verdictFor(low, high) {
      const has = i => low <= i && i <= high;
      if (has(0)) {
        return ['is-bad', '<b>Внутри границы генерация данных.</b> Из 1333,9 мкс работой решения являются 66,4 — остальные 95% числа рассказывают про <code>make_data</code>. Обоим решениям прибавится одно и то же, и разница между ними схлопнется.'];
      }
      if (has(6)) {
        return ['is-bad', '<b>Внутри границы печать.</b> В этом окне терминала строка стоила 1,3 мкс, при быстрой прокрутке вывода — заметно больше. Число начинает зависеть от того, куда смотрит вывод, а не от кода.'];
      }
      if (has(1)) {
        return ['', '<b>Внутри всё решение целиком.</b> 119,4 мкс — построение множества плюс сверка. Так честно, если сравнивать с полным решением на списке (67 206,1 мкс), а не с одним его циклом.'];
      }
      if (has(3)) {
        return ['is-good', '<b>Граница поставлена верно.</b> Внутри только сверка. Именно это число сравнивают с 67 201,8 мкс у перебора по списку — разница в 1012 раз.'];
      }
      return ['is-bad', '<b>Исследуемой операции внутри нет.</b> Замер измеряет подготовку, а не то, ради чего он затевался.'];
    }

    function paint() {
      let sum = 0;
      lines.forEach((line, i) => {
        const inside = from <= i && i <= to;
        line.classList.toggle('is-inside', inside);
        line.classList.toggle('is-edge', i === from || i === to);
        if (inside) sum += costs[i];
      });
      valueField.innerHTML = `${format(sum)}<small>мкс</small>`;
      spanField.textContent = from === to
        ? `строка ${from + 1}`
        : `строки ${from + 1}–${to + 1}`;
      const [state, text] = verdictFor(from, to);
      verdictField.className = `boundary__verdict ${state}`;
      verdictField.innerHTML = text;
      presets.forEach(button => {
        const [a, b] = button.dataset.preset.split(',').map(Number);
        button.classList.toggle('is-on', a - 1 === from && b - 1 === to);
      });
    }

    lines.forEach((line, i) => {
      line.addEventListener('click', () => {
        // Первый клик задаёт один край, второй — другой; порядок кликов
        // не важен, границы сами встают по возрастанию.
        if (pending === null) {
          pending = i;
          from = to = i;
        } else {
          from = Math.min(pending, i);
          to = Math.max(pending, i);
          pending = null;
        }
        paint();
      });
    });

    presets.forEach(button => {
      button.addEventListener('click', () => {
        const [a, b] = button.dataset.preset.split(',').map(Number);
        from = a - 1;
        to = b - 1;
        pending = null;
        paint();
      });
    });

    paint();
  }

  /* ---------- график на логарифмических осях ---------- */

  const SERIES = [
    { name: 'список', color: '#E8503A', points: [[250, 300.3], [500, 1174.8], [1000, 4231.2], [2000, 16757.0], [4000, 67885.0], [8000, 266624.1]] },
    { name: 'множество', color: '#2E8B57', points: [[250, 5.2], [500, 10.7], [1000, 23.0], [2000, 49.1], [4000, 122.7], [8000, 239.1]] }
  ];

  function drawPlot(figure) {
    const W = 560, H = 330, LEFT = 54, RIGHT = 86, TOP = 20, BOTTOM = 44;
    const xs = [250, 500, 1000, 2000, 4000, 8000];
    const ys = [1, 10, 100, 1000, 10000, 100000, 1000000];
    const lx = Math.log10(250), hx = Math.log10(8000);
    const ly = 0, hy = 6;
    const X = n => LEFT + ((Math.log10(n) - lx) / (hx - lx)) * (W - LEFT - RIGHT);
    const Y = v => H - BOTTOM - ((Math.log10(v) - ly) / (hy - ly)) * (H - BOTTOM - TOP);

    const svg = [`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Время двух решений в зависимости от размера входа, логарифмические оси">`];
    ys.forEach(v => {
      svg.push(`<line class="grid-line" x1="${LEFT}" y1="${Y(v).toFixed(1)}" x2="${W - RIGHT}" y2="${Y(v).toFixed(1)}"/>`);
      const label = v >= 1000 ? `${v / 1000}к` : String(v);
      svg.push(`<text class="tick" x="${LEFT - 8}" y="${(Y(v) + 3).toFixed(1)}" text-anchor="end">${label}</text>`);
    });
    xs.forEach(n => {
      svg.push(`<text class="tick" x="${X(n).toFixed(1)}" y="${H - BOTTOM + 15}" text-anchor="middle">${n}</text>`);
    });
    svg.push(`<line class="axis" x1="${LEFT}" y1="${H - BOTTOM}" x2="${W - RIGHT}" y2="${H - BOTTOM}"/>`);
    svg.push(`<line class="axis" x1="${LEFT}" y1="${TOP}" x2="${LEFT}" y2="${H - BOTTOM}"/>`);
    svg.push(`<text class="axis-label" x="${(W - RIGHT)}" y="${H - 10}" text-anchor="end">РАЗМЕР ВХОДА n</text>`);
    svg.push(`<text class="axis-label" x="${LEFT - 40}" y="${TOP - 6}">МКС</text>`);

    SERIES.forEach((series, index) => {
      const path = series.points.map(([n, v]) => `${X(n).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      svg.push(`<polyline class="line" style="--c:${series.color};--d:${index * 0.35}s" points="${path}"/>`);
      series.points.forEach(([n, v]) => {
        svg.push(`<circle class="point" style="--c:${series.color};--d:${index * 0.35}s" cx="${X(n).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4"/>`);
      });
      const [lastN, lastV] = series.points[series.points.length - 1];
      svg.push(`<text class="series-label" style="--c:${series.color};--d:${index * 0.35}s" x="${(X(lastN) + 8).toFixed(1)}" y="${(Y(lastV) + 4).toFixed(1)}">${series.name}</text>`);
    });
    svg.push('</svg>');
    figure.querySelector('.plot__canvas').innerHTML = svg.join('');
  }

  /* ---------- сборка ---------- */

  document.querySelectorAll('[data-boundary]').forEach(setupBoundary);
  document.querySelectorAll('[data-plot]').forEach(drawPlot);

  function playSlide(slide) {
    const plot = slide.querySelector('.plot');
    if (plot) { plot.classList.remove('is-drawn'); void plot.offsetWidth; plot.classList.add('is-drawn'); }
  }

  // Экран стал активным — демонстрация запускается сама, чтобы не искать
  // кнопку на паре.
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.target.classList.contains('is-active')) playSlide(record.target);
    });
  });
  document.querySelectorAll('.slide').forEach(slide => observer.observe(slide, { attributes: true, attributeFilter: ['class'] }));

  const active = document.querySelector('.slide.is-active');
  if (active) playSlide(active);
})();
