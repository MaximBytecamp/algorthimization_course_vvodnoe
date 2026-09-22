/* Демонстрации занятия 7.

   .player   пошаговый плеер «указатели над массивом»: ячейки раскрашены по зонам,
             над ними маркеры указателей, под ними таблица состояния растёт
             на строку за шаг, справа строка инварианта с отметкой ✓ или ✗.
             Сценарий задаётся атрибутом data-scenario и строится функцией
             ниже: кадры вычисляются настоящим проходом по данным.
   .cuts     границы среза: нажатие на промежуток между ячейками ставит l и r.
   .memrow   адрес ячейки: нажатие на ячейку показывает расчёт адреса.
   .shelves  размер и ёмкость списка: append по одному, стоимость каждого
             append столбиком и средняя стоимость по всем вызовам.            */
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ---------- сценарии плеера ---------- */
  // Кадр: cells [{v, z}], ptrs {имя: индекс}, row (строка таблицы или null),
  // note (пояснение шага), inv (true / false / null).

  function streak() {
    const data = [12000, 3000, 11000, 10500, 10000, 4000, 13000];
    const goal = 10000;
    const frames = [];
    let cur = 0, best = 0, bestEnd = -1;
    const cells = i => data.map((v, k) => {
      let z = v >= goal ? 'ok' : 'miss';
      if (k > i) z += ' unseen';
      if (i >= 0 && k <= i && k > i - cur) z += ' cur';
      if (best && k <= bestEnd && k > bestEnd - best) z += ' best';
      return { v: fmt(v), z };
    });
    frames.push({ cells: cells(-1), ptrs: {}, row: null, inv: true,
      note: 'До цикла cur = 0, best = 0. Ни один день ещё не просмотрен, лучшая серия пустая — инвариант верен.' });
    data.forEach((v, i) => {
      const hit = v >= goal;
      let action;
      if (hit) {
        cur += 1; action = 'cur += 1';
        if (cur > best) { best = cur; bestEnd = i; action += '; best = cur'; }
      } else { cur = 0; action = 'cur = 0'; }
      frames.push({ cells: cells(i), ptrs: { i }, inv: true,
        row: [i, fmt(v), hit ? 'да' : 'нет', action, cur, best],
        note: hit
          ? `День ${i}: ${fmt(v)} шагов, цель достигнута. Серия, которая заканчивается на дне ${i}, длиной ${cur}. Лучшая среди дней 0..${i} — ${best}.`
          : `День ${i}: ${fmt(v)} шагов, цель не достигнута. Серия, которая заканчивается на дне ${i}, пустая: cur = 0. Лучшая среди дней 0..${i} по-прежнему ${best}.` });
    });
    frames.push({ cells: cells(data.length - 1), ptrs: {}, row: null, inv: true,
      note: `Цикл закончился. По инварианту best — лучшая серия среди всех дней. Ответ: ${best}.` });
    return { frames, cols: ['i', 'steps[i]', '≥ цели', 'действие', 'cur', 'best'],
      inv: 'cur — длина серии, которая заканчивается на дне i; best — длина лучшей серии среди steps[0..i]',
      legend: [['ok', 'цель достигнута'], ['miss', 'не достигнута'], ['cur', 'текущая серия'], ['best', 'лучшая серия']] };
  }

  function streakBuggy() {
    // Данные подобраны так, чтобы лучшая серия стояла в конце списка.
    const s = { frames: [], cols: [], inv: '' };
    const data = [12000, 3000, 11000, 10500, 10000];
    const goal = 10000;
    let cur = 0, best = 0;
    const cells = (i, cur) => data.map((v, k) => {
      let z = v >= goal ? 'ok' : 'miss';
      if (k > i) z += ' unseen';
      if (i >= 0 && k <= i && k > i - cur) z += ' cur';
      return { v: fmt(v), z };
    });
    s.frames.push({ cells: cells(-1, 0), ptrs: {}, row: null, inv: true, note: 'Ошибочная версия: best обновляется только в ветке else, то есть при обрыве серии.' });
    data.forEach((v, i) => {
      const hit = v >= goal;
      let action;
      if (hit) { cur += 1; action = 'cur += 1'; }
      else { best = Math.max(best, cur); cur = 0; action = 'best = max(best, cur); cur = 0'; }
      let tb = 0, c = 0; for (let k = 0; k <= i; k += 1) { c = data[k] >= goal ? c + 1 : 0; tb = Math.max(tb, c); }
      s.frames.push({ cells: cells(i, cur), ptrs: { i }, row: [i, fmt(v), action, cur, best], inv: best === tb,
        note: best === tb ? `После дня ${i}: best = ${best}, лучшая серия среди дней 0..${i} тоже ${tb}.` : `После дня ${i}: best = ${best}, а лучшая серия среди дней 0..${i} уже ${tb}. Инвариант нарушен.` });
    });
    s.frames.push({ cells: s.frames[s.frames.length - 1].cells, ptrs: {}, row: null, inv: false,
      note: `Цикл закончился на серии длины ${cur}, ветка else больше не выполнилась. Функция вернёт ${best}, правильный ответ 3.` });
    s.cols = ['i', 'steps[i]', 'действие', 'cur', 'best'];
    s.inv = 'best — длина лучшей серии среди steps[0..i]';
    s.legend = [['ok', 'цель достигнута'], ['miss', 'не достигнута'], ['cur', 'текущая серия']];
    return s;
  }

  function reverse() {
    const a = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const l = 1, r = 6;
    const frames = [];
    const cells = (i, j, swapped) => a.map((v, k) => {
      let z = (k < l || k > r) ? 'out' : (k < i || k > j) ? 'done' : 'todo';
      if (swapped && (k === swapped[0] || k === swapped[1])) z += ' flash';
      return { v, z };
    });
    let i = l, j = r;
    frames.push({ cells: cells(i, j), ptrs: { i, j }, row: null, inv: true,
      note: `Разворачиваем tracks[${l}..${r}] включительно. До цикла i = l = ${l}, j = r = ${r}. Вне участка [i..j] лежат только треки, которые разворот не затрагивает.` });
    let step = 0;
    while (i < j) {
      step += 1;
      const pair = [i, j];
      const was = `${a[i]} ↔ ${a[j]}`;
      [a[i], a[j]] = [a[j], a[i]];
      i += 1; j -= 1;
      frames.push({ cells: cells(i, j, pair), ptrs: i <= j ? { i, j } : { i, j }, row: [step, pair[0], pair[1], was, a.slice(l, r + 1).join(' ')], inv: true,
        note: i < j
          ? `Обмен позиций ${pair[0]} и ${pair[1]}, затем i = ${i}, j = ${j}. Позиции ${pair[0]} и ${pair[1]} больше не меняются — они на итоговом месте.`
          : `Обмен позиций ${pair[0]} и ${pair[1]}, затем i = ${i}, j = ${j}. Теперь i ≥ j: необработанный участок пуст, цикл заканчивается.` });
    }
    frames.push({ cells: cells(i, j), ptrs: {}, row: null, inv: true,
      note: `Участок развёрнут за ${step} обмена: (r − l + 1) // 2 = ${(r - l + 1) >> 1}. Треки вне участка не трогали.` });
    return { frames, cols: ['обмен', 'i', 'j', 'что меняем', 'tracks[1..6] после'],
      inv: 'Всё вне tracks[i..j] уже стоит на итоговом месте',
      legend: [['out', 'вне участка'], ['done', 'на итоговом месте'], ['todo', 'ещё не обработано']] };
  }

  const COMMENTS = ['Отлично', 'http://win', 'http://prize', 'Спасибо', 'Вопрос', 'http://bot', 'Понятно'];
  const spam = t => t.startsWith('http');

  function removeInPlace() {
    const a = COMMENTS.slice();
    const frames = [];
    const cells = (w, r, just) => a.map((v, k) => {
      let z = k < w ? 'keep' : k < r ? 'junk' : 'unseen';
      if (spam(v)) z += ' spam';
      if (k === just) z += ' flash';
      return { v, z };
    });
    let w = 0;
    frames.push({ cells: cells(0, 0), ptrs: { r: 0, w: 0 }, row: null, inv: true,
      note: 'До цикла r = 0, w = 0. Зона comments[0:w] пустая, просмотренных элементов тоже нет — инвариант верен.' });
    for (let r = 0; r < a.length; r += 1) {
      const v = a[r];
      let action, just = -1;
      if (!spam(v)) {
        action = w === r ? `a[${w}] = a[${r}] (на месте), w += 1` : `a[${w}] = a[${r}], w += 1`;
        a[w] = v; just = w; w += 1;
      } else action = 'пропустить';
      frames.push({ cells: cells(w, r + 1, just), ptrs: { r: r + 1, w }, row: [r, v, spam(v) ? 'да' : 'нет', action, w], inv: true,
        note: spam(v)
          ? `a[${r}] = «${v}» — спам. Указатель записи w не двигается, r идёт дальше. Ячейка остаётся в зоне мусора.`
          : `a[${r}] = «${v}» — обычный комментарий. Он записан в позицию w = ${w - 1}, затем w = ${w}. В зоне [0:w] все обычные комментарии из [0:r] в исходном порядке.` });
    }
    const kept = a.slice(0, w);
    frames.push({ cells: kept.map(v => ({ v, z: 'keep' })).concat(a.slice(w).map(v => ({ v, z: 'gone' }))), ptrs: { w }, row: null, inv: true,
      note: `Цикл закончен: r = ${a.length}. del comments[${w}:] убирает хвост одной операцией. Функция возвращает ${w}.` });
    return { frames, cols: ['r', 'comments[r]', 'спам', 'действие', 'w'],
      inv: 'comments[0:w] — все обычные комментарии из comments[0:r], в исходном порядке',
      legend: [['keep', 'готово: [0, w)'], ['junk', 'мусор: [w, r)'], ['unseen', 'не просмотрено: [r, n)']] };
  }

  function delBug() {
    const a = ['Отлично', 'http://win', 'http://prize', 'Спасибо'];
    const n = a.length;
    const frames = [];
    const checked = new Set();
    const skipped = new Set();
    const cells = (i, extra = {}) => a.map((v, k) => {
      let z = spam(v) ? 'spam' : '';
      if (checked.has(v)) z += ' seen';
      if (skipped.has(v)) z += ' skipped';
      if (k === extra.flash) z += ' flash';
      return { v, z };
    });
    frames.push({ cells: cells(-1), ptrs: {}, row: null, inv: null,
      note: `range(len(comments)) вычислен один раз до цикла: range(${n}), i пройдёт 0, 1, 2, 3. Дальше длина списка будет меняться, а range — нет.` });
    for (let i = 0; i < n; i += 1) {
      if (i >= a.length) {
        frames.push({ cells: cells(i), ptrs: { i }, row: [i, a.length, '—', 'IndexError'], inv: false, crash: true,
          note: `i = ${i}, а в списке осталось ${a.length} элемента: допустимые индексы 0..${a.length - 1}. comments[${i}] поднимает IndexError.` });
        break;
      }
      const v = a[i];
      checked.add(v);
      if (spam(v)) {
        a.splice(i, 1);
        const next = a[i];
        skipped.add(next);
        frames.push({ cells: cells(i, { flash: i }), ptrs: { i }, row: [i, a.length + 1, v, `del comments[${i}]`], inv: false,
          note: `«${v}» удалён. Хвост сдвинулся влево на одну позицию: «${next}» теперь стоит на месте ${i}. Следующий шаг i = ${i + 1}, и этот элемент проверен не будет.` });
      } else {
        frames.push({ cells: cells(i), ptrs: { i }, row: [i, a.length, v, 'оставить'], inv: true,
          note: `comments[${i}] = «${v}» — обычный комментарий, остаётся.` });
      }
    }
    return { frames, cols: ['i', 'len', 'comments[i]', 'действие'],
      inv: 'Каждый элемент проверен ровно один раз',
      legend: [['spam', 'спам'], ['seen', 'проверен'], ['skipped', 'пропущен']] };
  }

  const scenarios = { streak, streakBug: streakBuggy, reverse, remove: removeInPlace, delBug };

  /* ---------- плеер ---------- */
  function mountPlayer(root) {
    const sc = scenarios[root.dataset.scenario]();
    const n = sc.frames[0].cells.length;
    root.style.setProperty('--n', n);
    root.innerHTML = `
      <div class="player__main">
        <div class="player__stage">
          <div class="player__ptrs"></div>
          <div class="player__cells"></div>
          <div class="player__idx">${Array.from({ length: n }, (_, k) => `<span>${k}</span>`).join('')}</div>
        </div>
        <div class="player__legend">${sc.legend.map(([z, t]) => `<span><i class="z-${z.split(' ')[0]}"></i>${esc(t)}</span>`).join('')}</div>
        <p class="player__note"></p>
        <div class="player__inv"><b>Инвариант</b><span>${esc(sc.inv)}</span><i></i></div>
        <div class="player__controls">
          <button type="button" data-act="reset" aria-label="В начало">⏮</button>
          <button type="button" data-act="back">← шаг</button>
          <button type="button" data-act="step">шаг →</button>
          <button type="button" data-act="play">весь прогон ▶</button>
          <span class="player__count"></span>
        </div>
      </div>
      <div class="player__side">
        <table class="player__table"><thead><tr>${sc.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody></tbody></table>
      </div>`;
    const cellsEl = root.querySelector('.player__cells');
    const ptrsEl = root.querySelector('.player__ptrs');
    const note = root.querySelector('.player__note');
    const inv = root.querySelector('.player__inv');
    const tbody = root.querySelector('tbody');
    const count = root.querySelector('.player__count');
    const tableWrap = root.querySelector('.player__side');
    let at = 0, timer = null;

    function draw() {
      const f = sc.frames[at];
      cellsEl.innerHTML = f.cells.map(c => `<span class="${(c.z || '').split(' ').filter(Boolean).map(z => 'z-' + z).join(' ')}">${esc(c.v)}</span>`).join('')
        + (f.cells.length < n ? Array.from({ length: n - f.cells.length }, () => '<span class="z-void"></span>').join('') : '');
      ptrsEl.innerHTML = Object.entries(f.ptrs).map(([name, idx]) =>
        `<b class="ptr ptr--${name}${f.crash ? ' ptr--crash' : ''}" style="--at:${idx}">${name}</b>`).join('');
      note.textContent = f.note;
      inv.classList.toggle('is-ok', f.inv === true);
      inv.classList.toggle('is-bad', f.inv === false);
      inv.querySelector('i').textContent = f.inv === true ? '✓' : f.inv === false ? '✗' : '·';
      const rows = sc.frames.slice(0, at + 1).filter(fr => fr.row);
      tbody.innerHTML = rows.map((fr, k) => `<tr class="${k === rows.length - 1 && fr === f ? 'is-now' : ''}${fr.inv === false ? ' is-bad' : ''}">${fr.row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
      tableWrap.scrollTop = tableWrap.scrollHeight;
      count.textContent = `кадр ${at + 1} из ${sc.frames.length}`;
      root.querySelector('[data-act="back"]').disabled = at === 0;
      root.querySelector('[data-act="step"]').disabled = at === sc.frames.length - 1;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; root.querySelector('[data-act="play"]').textContent = 'весь прогон ▶'; } }
    root.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      e.stopPropagation();
      const act = b.dataset.act;
      if (act === 'play') {
        if (timer) { stop(); return; }
        if (at === sc.frames.length - 1) at = 0;
        b.textContent = 'пауза ❚❚';
        draw();
        timer = setInterval(() => { if (at >= sc.frames.length - 1) { stop(); return; } at += 1; draw(); }, 1300);
        return;
      }
      stop();
      if (act === 'reset') at = 0;
      if (act === 'back') at = Math.max(0, at - 1);
      if (act === 'step') at = Math.min(sc.frames.length - 1, at + 1);
      draw();
    });
    root.resetDemo = () => { stop(); at = 0; draw(); };
    draw();
  }

  /* ---------- границы среза ---------- */
  function mountCuts(root) {
    const a = (root.dataset.values || '10,20,30,40,50,60,70,80').split(',');
    const n = a.length;
    let l = Number(root.dataset.l || 2), r = Number(root.dataset.r || 5), pick = 0;
    root.style.setProperty('--n', n);
    root.innerHTML = `
      <div class="cuts__row">
        ${a.map((v, k) => `<button type="button" class="cuts__gap" data-b="${k}"><i>${k}</i></button><span class="cuts__cell">${esc(v)}<small>${k}</small></span>`).join('')}
        <button type="button" class="cuts__gap" data-b="${n}"><i>${n}</i></button>
      </div>
      <div class="cuts__out">
        <code class="cuts__expr"></code>
        <span class="cuts__len"></span>
        <span class="cuts__split"></span>
      </div>
      <div class="cuts__presets">
        <button type="button" data-p="2,5">a[2:5]</button>
        <button type="button" data-p="0,${n}">a[0:${n}]</button>
        <button type="button" data-p="3,3">a[3:3]</button>
        <button type="button" data-p="${n - 1},${n}">a[${n - 1}:${n}]</button>
        <span class="cuts__hint">нажмите на две границы между ячейками</span>
      </div>`;
    function draw() {
      root.querySelectorAll('.cuts__gap').forEach(g => {
        const b = Number(g.dataset.b);
        g.classList.toggle('is-l', b === l);
        g.classList.toggle('is-r', b === r);
      });
      root.querySelectorAll('.cuts__cell').forEach((c, k) => {
        c.classList.toggle('is-in', k >= l && k < r);
        c.classList.toggle('is-left', k < l);
        c.classList.toggle('is-right', k >= r);
      });
      const part = a.slice(l, r);
      root.querySelector('.cuts__expr').textContent = `a[${l}:${r}] → [${part.join(', ')}]`;
      root.querySelector('.cuts__len').innerHTML = `длина: <b>r − l = ${r} − ${l} = ${r - l}</b>`;
      root.querySelector('.cuts__split').innerHTML = `a[:${l}] + a[${l}:${r}] + a[${r}:] — ${l} + ${r - l} + ${n - r} = <b>${n}</b> элементов, без пропусков и повторов`;
    }
    root.addEventListener('click', e => {
      e.stopPropagation();
      const g = e.target.closest('.cuts__gap');
      const p = e.target.closest('[data-p]');
      if (p) { [l, r] = p.dataset.p.split(',').map(Number); pick = 0; draw(); return; }
      if (!g) return;
      const b = Number(g.dataset.b);
      if (pick === 0) { l = b; r = b; pick = 1; }
      else { if (b < l) { r = l; l = b; } else r = b; pick = 0; }
      draw();
    });
    draw();
  }

  /* ---------- адрес ячейки ---------- */
  function mountMemrow(root) {
    const a = root.dataset.values.split(',');
    const base = 0x7f3a1000;
    const hex = v => '0x' + v.toString(16);
    root.innerHTML = `
      <div class="memrow__cells">${a.map((v, k) => `<button type="button" data-i="${k}"><small>${hex(base + 8 * k)}</small><b>●</b><em>${esc(v)}</em><span>${k}<i>${k - a.length}</i></span></button>`).join('')}</div>
      <p class="memrow__calc"></p>`;
    const calc = root.querySelector('.memrow__calc');
    function pick(i) {
      root.querySelectorAll('button').forEach((b, k) => b.classList.toggle('is-on', k === i));
      calc.innerHTML = `a[${i}] и a[${i - a.length}] → адрес = начало + ${i} × 8 = ${hex(base)} + ${8 * i} = <b>${hex(base + 8 * i)}</b>. В ячейке лежит ссылка на объект ${esc(a[i])}.`;
    }
    root.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { e.stopPropagation(); pick(Number(b.dataset.i)); } });
    pick(0);
  }

  /* ---------- размер и ёмкость ---------- */
  // Рост ёмкости по формуле list_resize из CPython 3.12 (Objects/listobject.c):
  // new_allocated = (newsize + (newsize >> 3) + 6) & ~3.
  const growth = {
    cpython: (size, cap) => {
      const ns = size + 1;
      let na = (ns + (ns >> 3) + 6) & ~3;
      if (ns - size > na - ns) na = (ns + 3) & ~3;
      return na;
    },
    double: (size, cap) => Math.max(1, cap * 2),
    plusone: (size, cap) => cap + 1
  };

  function mountShelves(root) {
    const LIMIT = 64;
    let mode = 'cpython', size = 0, cap = 0, total = 0, costs = [];
    root.innerHTML = `
      <div class="shelves__top">
        <div class="shelves__modes">
          <button type="button" data-mode="cpython" class="is-on">CPython 3.12</button>
          <button type="button" data-mode="double">удвоение</button>
          <button type="button" data-mode="plusone">без запаса: +1</button>
        </div>
        <div class="shelves__acts">
          <button type="button" data-add="1">append</button>
          <button type="button" data-add="8">append × 8</button>
          <button type="button" data-add="64">до 64</button>
          <button type="button" data-reset>сброс</button>
        </div>
      </div>
      <div class="shelves__slots"></div>
      <div class="shelves__stats"></div>
      <div class="shelves__chart"><div class="shelves__bars"></div><span class="shelves__avg"></span></div>
      <p class="shelves__cap">Столбик — стоимость одного append: 1 запись или, при переезде, копирование всех элементов плюс запись. Линия — средняя стоимость по всем вызовам.</p>`;
    const slots = root.querySelector('.shelves__slots');
    const stats = root.querySelector('.shelves__stats');
    const bars = root.querySelector('.shelves__bars');
    const avg = root.querySelector('.shelves__avg');

    function append() {
      if (size >= LIMIT) return;
      let cost = 1, moved = false;
      if (size === cap) { cap = growth[mode](size, cap); cost += size; moved = true; }
      size += 1; total += cost; costs.push({ cost, moved });
    }
    function draw(lastMoved) {
      slots.innerHTML = Array.from({ length: cap }, (_, k) => `<i class="${k < size ? 'is-full' : ''}${lastMoved && k < size - 1 ? ' is-moved' : ''}"></i>`).join('');
      const mean = size ? total / size : 0;
      stats.innerHTML = `<span>len <b>${size}</b></span><span>ёмкость <b>${cap}</b></span><span>свободно <b>${cap - size}</b></span><span>переездов <b>${costs.filter(c => c.moved).length}</b></span><span>всего операций <b>${total}</b></span><span>в среднем на append <b>${mean.toFixed(2)}</b></span>`;
      const max = Math.max(8, ...costs.map(c => c.cost));
      bars.innerHTML = costs.map(c => `<i class="${c.moved ? 'is-move' : ''}" style="--h:${(c.cost / max) * 100}%" title="${c.cost}"></i>`).join('');
      avg.style.setProperty('--h', `${(mean / max) * 100}%`);
      avg.textContent = size ? `среднее ${mean.toFixed(2)}` : '';
      avg.hidden = !size;
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      e.stopPropagation();
      if (b.dataset.mode) {
        mode = b.dataset.mode; size = 0; cap = 0; total = 0; costs = [];
        root.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('is-on', x === b));
        draw(false); return;
      }
      if (b.hasAttribute('data-reset')) { size = 0; cap = 0; total = 0; costs = []; draw(false); return; }
      const k = b.dataset.add === '64' ? LIMIT - size : Number(b.dataset.add);
      let moved = false;
      for (let t = 0; t < k; t += 1) { const before = cap; append(); if (cap !== before) moved = true; }
      draw(moved && k === 1);
    });
    draw(false);
  }

  document.querySelectorAll('.player').forEach(mountPlayer);
  document.querySelectorAll('.cuts').forEach(mountCuts);
  document.querySelectorAll('.memrow').forEach(mountMemrow);
  document.querySelectorAll('.shelves').forEach(mountShelves);

  // При входе на экран плеер возвращается к первому кадру.
  new MutationObserver(records => records.forEach(rec => {
    if (rec.target.classList.contains('is-active')) rec.target.querySelectorAll('.player').forEach(p => p.resetDemo && p.resetDemo());
  })).observe(document.querySelector('.slides'), { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
