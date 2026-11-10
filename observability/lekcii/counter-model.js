/* Модель счётчика для лекции 2.2: события, опросы и перезапуски процесса.
   Рост по отсчётам считается тем же правилом, что функция growth из §11:
   уменьшение значения — сброс, после него прибавляется всё новое значение. */
(function () {
  const root = document.getElementById('counter-model');
  if (!root) return;

  let st;
  function fresh() {
    st = { proc: 1, mem: 0, samples: [], restartPending: false, eventsSinceFirst: 0 };
  }

  function event(k) {
    st.mem += k;
    if (st.samples.length) st.eventsSinceFirst += k;
  }
  function scrape() {
    st.samples.push({ n: st.samples.length + 1, v: st.mem, proc: st.proc, afterRestart: st.restartPending });
    st.restartPending = false;
  }
  function restart() {
    st.proc += 1;
    st.mem = 0;
    st.restartPending = true;
  }

  function growth(values) {
    let total = 0, resets = 0;
    for (let i = 1; i < values.length; i++) {
      const prev = values[i - 1], cur = values[i];
      if (cur >= prev) total += cur - prev;
      else { total += cur; resets += 1; }
    }
    return { total, resets };
  }

  const scenarios = {
    visible: () => { fresh(); event(40); scrape(); restart(); event(10); scrape(); },
    hidden: () => { fresh(); event(40); scrape(); restart(); event(60); scrape(); },
  };

  root.innerHTML = `
    <div class="model__top">
      <div class="model__proc"><b>Процесс <span data-k="proc"></span></b><span>в памяти: <strong data-k="mem"></strong></span></div>
      <div class="model__btns">
        <button type="button" data-a="e1">Событие +1</button>
        <button type="button" data-a="e10">+10 событий</button>
        <button type="button" data-a="scrape" class="primary">Опрос</button>
        <button type="button" data-a="restart" class="warn">Перезапуск</button>
      </div>
    </div>
    <svg class="model__chart" viewBox="0 0 640 200" role="img" aria-label="График отсчётов в базе"></svg>
    <div class="model__bottom">
      <div class="table-scroll model__table"><table class="series"><thead><tr><th>Опрос</th><th>Процесс</th><th>Значение</th></tr></thead><tbody></tbody></table></div>
      <dl class="model__calc">
        <div><dt>Событий после первого опроса</dt><dd data-k="events"></dd></div>
        <div><dt>Рост по отсчётам, как у Prometheus</dt><dd data-k="growth"></dd></div>
        <div><dt>Найдено сбросов</dt><dd data-k="resets"></dd></div>
        <p class="model__verdict" data-k="verdict"></p>
      </dl>
    </div>
    <div class="model__scen">
      <span>Готовые сценарии:</span>
      <button type="button" data-a="visible">Видимый сброс</button>
      <button type="button" data-a="hidden">Скрытый сброс</button>
      <button type="button" data-a="clear">Начать заново</button>
    </div>`;

  const $ = (k) => root.querySelector(`[data-k="${k}"]`);
  const svg = root.querySelector('svg');
  const tbody = root.querySelector('tbody');

  function draw() {
    $('proc').textContent = st.proc;
    $('mem').textContent = st.mem;

    const vals = st.samples.map((s) => s.v);
    const g = growth(vals);
    $('events').textContent = st.samples.length ? st.eventsSinceFirst : '—';
    $('growth').textContent = vals.length > 1 ? g.total : '—';
    $('resets').textContent = vals.length > 1 ? g.resets : '—';
    const v = $('verdict');
    if (vals.length < 2) {
      v.className = 'model__verdict';
      v.textContent = 'Нужно хотя бы два опроса, чтобы посчитать рост.';
    } else if (g.total === st.eventsSinceFirst) {
      v.className = 'model__verdict ok';
      v.textContent = 'Рост по отсчётам совпадает с числом событий.';
    } else {
      v.className = 'model__verdict bad';
      v.textContent = `Потеряно ${st.eventsSinceFirst - g.total}: сброс между опросами не виден в отсчётах.`;
    }

    tbody.innerHTML = st.samples.slice(-8).map((s) =>
      `<tr${s.afterRestart ? ' class="after-restart"' : ''}><td>${s.n}</td><td>${s.proc}</td><td>${s.v}</td></tr>`).join('') ||
      '<tr><td colspan="3">Опросов ещё не было</td></tr>';

    // график: последние 12 отсчётов
    const shown = st.samples.slice(-12);
    const max = Math.max(10, ...shown.map((s) => s.v));
    const x = (i) => 50 + i * (560 / 11);
    const y = (val) => 170 - (val / max) * 140;
    let out = `<line class="sc-axis" x1="40" y1="170" x2="620" y2="170"/>
      <text class="tm tr" x="34" y="174">0</text><text class="tm tr" x="34" y="34">${max}</text>
      <line class="sc-grid" x1="40" y1="30" x2="620" y2="30"/>`;
    shown.forEach((s, i) => {
      if (i > 0) {
        const p = shown[i - 1];
        out += s.afterRestart
          ? `<line class="sc-arrow-w" x1="${x(i - 1)}" y1="${y(p.v)}" x2="${x(i)}" y2="${y(s.v)}"/>`
          : `<line class="sc-plot" x1="${x(i - 1)}" y1="${y(p.v)}" x2="${x(i)}" y2="${y(s.v)}"/>`;
      }
    });
    shown.forEach((s, i) => {
      out += `<circle class="${s.afterRestart ? 'sc-dot-w' : 'sc-dot'}" cx="${x(i)}" cy="${y(s.v)}" r="5"/>
        <text class="tm tc" x="${x(i)}" y="${y(s.v) - 10}">${s.v}</text>
        <text class="t tc" x="${x(i)}" y="190">${s.n}</text>`;
    });
    if (!shown.length) out += '<text class="t tc" x="330" y="100">Нажмите «Событие», затем «Опрос»</text>';
    svg.innerHTML = out;
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'e1') event(1);
    if (a === 'e10') event(10);
    if (a === 'scrape') scrape();
    if (a === 'restart') restart();
    if (a === 'clear') fresh();
    if (scenarios[a]) scenarios[a]();
    draw();
  });

  fresh();
  draw();
})();
