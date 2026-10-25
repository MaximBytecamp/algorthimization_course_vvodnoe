/* Модуль 3 «Метрика как данные» — интерактивные блоки.
   .hist — гистограмма из своих длительностей: корзины, _sum, _count и оценка
           перцентиля тем же способом, что у функции histogram_quantile;
   .card — число рядов метрики как произведение числа значений меток.
   Без JavaScript блоки показывают исходные данные, текст главы их пересказывает. */
(function () {
  const fmt = (x, d = 3) => Number(x.toFixed(d)).toString().replace('.', ',');
  const nums = s => s.split(/[\s;,]+/).map(v => v.replace(',', '.')).filter(Boolean).map(Number).filter(v => isFinite(v) && v >= 0);

  /* Оценка перцентиля по накопительным корзинам, как в Prometheus:
     ранг q × count, первая корзина, где накоплено не меньше ранга,
     линейная интерполяция внутри неё; корзина +Inf даёт верхнюю
     границу последней конечной корзины. */
  function estimate(bounds, cum, q) {
    const count = cum[cum.length - 1];
    if (!count) return null;
    const rank = q * count;
    let i = cum.findIndex(c => c >= rank);
    if (i === bounds.length) return { value: bounds[bounds.length - 1], inf: true, i };
    const lo = i === 0 ? 0 : bounds[i - 1];
    const before = i === 0 ? 0 : cum[i - 1];
    const inBucket = cum[i] - before;
    return { value: lo + (bounds[i] - lo) * (rank - before) / inBucket, lo, hi: bounds[i], rank, before, inBucket, i };
  }

  document.querySelectorAll('.hist').forEach(root => {
    const ms = root.querySelector('.hist__ms');
    const le = root.querySelector('.hist__le');
    const qs = root.querySelector('.hist__q');
    const out = root.querySelector('.hist__out');
    function draw() {
      const vals = nums(ms.value).map(v => v / 1000);
      const bounds = [...new Set(nums(le.value))].sort((a, b) => a - b);
      const q = Number(qs.value);
      if (!vals.length || !bounds.length) { out.innerHTML = '<p>Введите хотя бы одну длительность и одну границу.</p>'; return; }
      const cum = bounds.map(b => vals.filter(v => v <= b).length).concat(vals.length);
      const sum = vals.reduce((a, b) => a + b, 0);
      const sorted = [...vals].sort((a, b) => a - b);
      const exact = sorted[Math.ceil(q * vals.length) - 1];
      const est = estimate(bounds, cum, q);
      const labels = bounds.map(b => `le="${b}"`).concat('le="+Inf"');
      let rows = labels.map((l, k) =>
        `<span>${l}</span><i class="${k === labels.length - 1 ? 's' : ''}" style="--w:${100 * cum[k] / vals.length}%"></i><b>${cum[k]}</b>`).join('');
      let how;
      if (est.inf) {
        how = `Ранг ${fmt(q * vals.length, 2)} попал в корзину +Inf. У неё нет верхней границы, поэтому оценка — граница последней конечной корзины, ${fmt(est.value)} с.`;
      } else {
        how = `Ранг ${fmt(est.rank, 2)} = ${fmt(q, 2)} × ${vals.length}. Первая корзина, где накоплено не меньше: le="${est.hi}" (${cum[est.i]}). До неё накоплено ${est.before}, в ней ${est.inBucket}. ` +
          `Оценка: ${fmt(est.lo)} + (${fmt(est.hi)} − ${fmt(est.lo)}) × (${fmt(est.rank, 2)} − ${est.before}) / ${est.inBucket} = ${fmt(est.value)} с.`;
      }
      out.innerHTML =
        `<div class="bars">${rows}</div>` +
        `<p class="hist__sum"><code>_count</code> ${vals.length} · <code>_sum</code> ${fmt(sum)} с · среднее ${fmt(sum / vals.length)} с</p>` +
        `<p class="hist__cmp"><span>Оценка по корзинам: <b>${fmt(est.value)} с</b></span><span>Точное значение по длительностям: <b>${fmt(exact)} с</b></span></p>` +
        `<p class="hist__how">${how}</p>`;
    }
    [ms, le].forEach(el => el.addEventListener('input', draw));
    qs.addEventListener('change', draw);
    root.querySelectorAll('[data-le]').forEach(b => b.addEventListener('click', () => { le.value = b.dataset.le; draw(); }));
    draw();
  });

  document.querySelectorAll('.card').forEach(root => {
    const inputs = [...root.querySelectorAll('input[type=number]')];
    const out = root.querySelector('.card__out');
    function draw() {
      const parts = inputs.map(i => ({ name: i.dataset.name, n: Math.max(1, Math.floor(Number(i.value) || 1)) }));
      const total = parts.reduce((a, p) => a * p.n, 1);
      const day = total * 5760;
      out.innerHTML = `<p class="card__formula">${parts.map(p => `<span>${p.n}<small>${p.name}</small></span>`).join('<em>×</em>')}<em>=</em><b>${total.toLocaleString('ru-RU')}</b></p>` +
        `<p>Наибольшее число рядов метрики на одном target. При опросе раз в 15 секунд это ${day.toLocaleString('ru-RU')} отсчётов в сутки.</p>`;
    }
    inputs.forEach(i => i.addEventListener('input', draw));
    root.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
      b.dataset.preset.split(',').forEach((v, k) => { if (inputs[k]) inputs[k].value = v; });
      draw();
    }));
    draw();
  });
})();
