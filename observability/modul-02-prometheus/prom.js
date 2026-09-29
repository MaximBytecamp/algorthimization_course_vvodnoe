/* Модуль 2 «Как работает Prometheus» — интерактивные блоки.
   Без JavaScript каждый блок показывает всё содержимое сразу;
   скрипт добавляет пошаговый показ и расчёты.
     1. путь данных (.pipe)           4. модель scrape (.sim)
     2. разбор строки (.anat)         5. адрес target (.resolve)
     3. проверка формата (.expo)      6. диаграмма последовательности (.seq) */
(() => {
  document.documentElement.classList.add('js');
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const btn = (text, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; return b; };

  /* ── 1. Путь данных ─────────────────────────────────────────── */
  document.querySelectorAll('.pipe').forEach(root => {
    const stages = [...root.querySelectorAll('.pipe__stages button')];
    const panes = [...root.querySelectorAll('.pipe__pane')];
    const row = el('div', 'btnrow');
    const prev = btn('← назад'), next = btn('далее →', 'btn--main');
    row.append(prev, next);
    root.querySelector('.widget__body').appendChild(row);
    let cur = 0;
    const show = i => {
      cur = Math.max(0, Math.min(stages.length - 1, i));
      stages.forEach((b, k) => {
        b.setAttribute('aria-pressed', String(k === cur));
        b.classList.toggle('is-past', k < cur);
      });
      panes.forEach((p, k) => { p.hidden = k !== cur; });
      prev.disabled = cur === 0;
      next.disabled = cur === stages.length - 1;
    };
    stages.forEach((b, k) => { b.type = 'button'; b.addEventListener('click', () => show(k)); });
    prev.addEventListener('click', () => show(cur - 1));
    next.addEventListener('click', () => show(cur + 1));
    show(0);
  });

  /* ── 2. Разбор строки ───────────────────────────────────────── */
  document.querySelectorAll('.anat').forEach(root => {
    const parts = [...root.querySelectorAll('[data-part]')];
    const notes = [...root.querySelectorAll('.anat__note')];
    const pick = name => {
      parts.forEach(p => p.classList.toggle('is-on', p.dataset.part === name));
      notes.forEach(n => n.classList.toggle('is-on', n.dataset.note === name));
    };
    parts.forEach(p => {
      p.tabIndex = 0;
      p.setAttribute('role', 'button');
      p.addEventListener('click', () => pick(p.dataset.part));
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.dataset.part); } });
    });
    if (parts.length) pick(parts[0].dataset.part);
  });

  /* ── 3. Проверка текстового формата ─────────────────────────── */
  /* Упрощённая проверка по правилам текстового формата Prometheus 0.0.4:
     строки HELP и TYPE, имя, метки, значение, отметка времени, группировка
     и повторы рядов. Имена в кавычках (UTF-8) не разбираются. */
  const NAME = /^[a-zA-Z_:][a-zA-Z0-9_:]*/;
  const LNAME = /^[a-zA-Z_][a-zA-Z0-9_]*/;
  const FLOAT = /^(?:[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|NaN|[+-]?Inf)$/;
  const TYPES = ['counter', 'gauge', 'histogram', 'summary', 'untyped'];

  const parseSample = line => {
    const m = line.match(NAME);
    if (!m) return { err: 'строка должна начинаться с имени метрики: буква, _ или :' };
    const name = m[0];
    let i = name.length;
    const labels = [];
    let odd = '';
    if (line[i] === '{') {
      i++;
      for (;;) {
        while (line[i] === ' ' || line[i] === '\t') i++;
        if (line[i] === '}') { i++; break; }
        const ln = line.slice(i).match(LNAME);
        if (!ln) return { err: `после «{» или «,» ожидается имя метки, найдено «${line[i] || 'конец строки'}»` };
        i += ln[0].length;
        while (line[i] === ' ' || line[i] === '\t') i++;
        if (line[i] !== '=') return { err: `после имени метки ${ln[0]} ожидается «=»` };
        i++;
        while (line[i] === ' ' || line[i] === '\t') i++;
        if (line[i] !== '"') return { err: `значение метки ${ln[0]} должно быть в двойных кавычках` };
        i++;
        let val = '', closed = false;
        while (i < line.length) {
          const c = line[i];
          if (c === '\\') {
            const nx = line[i + 1];
            if (nx === '\\' || nx === '"') { val += nx; i += 2; continue; }
            if (nx === 'n') { val += '\n'; i += 2; continue; }
            if (nx === undefined) return { err: `значение метки ${ln[0]} не закрыто кавычкой` };
            odd = `в значении метки ${ln[0]} последовательность «\\${nx}»: спецификация разрешает только \\\\, \\" и \\n; Prometheus 3.5 сохраняет её как есть`;
            val += '\\' + nx; i += 2; continue;
          }
          if (c === '"') { closed = true; i++; break; }
          val += c; i++;
        }
        if (!closed) return { err: `значение метки ${ln[0]} не закрыто кавычкой` };
        labels.push([ln[0], val]);
        while (line[i] === ' ' || line[i] === '\t') i++;
        if (line[i] === ',') { i++; continue; }
        if (line[i] === '}') { i++; break; }
        return { err: 'между метками нужна запятая, после последней — «}»' };
      }
    }
    const rest = line.slice(i);
    if (rest && !/^[ \t]/.test(rest)) return { err: `после ${labels.length ? '«}»' : 'имени'} нужен пробел перед значением` };
    const tokens = rest.trim().split(/[ \t]+/).filter(Boolean);
    if (!tokens.length) return { err: 'нет значения' };
    if (!FLOAT.test(tokens[0])) return { err: `значение «${tokens[0]}» не число: допустимы 125, 125.0, 1.2e3, NaN, +Inf, -Inf` };
    if (tokens.length > 2) return { err: 'после значения допускается только отметка времени' };
    if (tokens.length === 2 && !/^-?\d+$/.test(tokens[1])) return { err: `отметка времени «${tokens[1]}» должна быть целым числом миллисекунд` };
    const names = labels.map(l => l[0]);
    const dup = names.find((n, k) => names.indexOf(n) !== k);
    if (dup) return { err: `метка ${dup} указана дважды` };
    return { name, labels, value: tokens[0], ts: tokens[1], odd };
  };

  const familyOf = (name, types) => {
    for (const suf of ['_bucket', '_sum', '_count']) {
      if (name.endsWith(suf)) {
        const base = name.slice(0, -suf.length);
        if (types[base] === 'histogram' || (types[base] === 'summary' && suf !== '_bucket')) return base;
      }
    }
    return name;
  };

  /* Два уровня замечаний. «Ошибка» — синтаксис, на котором разборщик
     Prometheus 3.5 останавливается и отклоняет весь ответ (проверено на
     стенде). «Нарушение» — правило спецификации, которое Prometheus 3.5
     не проверяет и ответ принимает; строгие разборщики, например
     OpenMetrics, такой ответ отклонят. */
  const check = text => {
    const out = [];
    const types = {}, helps = {}, seen = new Set(), closedFam = new Set(), valued = new Set();
    let lastFam = null, samples = 0;
    const lines = text.split('\n');
    if (lines.length && lines[lines.length - 1] === '') lines.pop();
    const enter = f => {
      const broken = closedFam.has(f);
      if (lastFam && lastFam !== f) closedFam.add(lastFam);
      lastFam = f;
      return broken ? `строки ${f} уже встречались выше, между ними другая метрика: по спецификации все строки метрики идут одной группой` : '';
    };
    lines.forEach((raw, k) => {
      const n = k + 1;
      const line = raw.trim();
      if (!line) { out.push([n, 'ok', 'пустая строка, пропускается']); return; }
      if (line.startsWith('#')) {
        const t = line.slice(1).trim().split(/[ \t]+/);
        if (t[0] !== 'HELP' && t[0] !== 'TYPE') { out.push([n, 'ok', 'комментарий, Prometheus его пропускает']); return; }
        const name = t[1];
        if (!name || (name.match(NAME) || [''])[0] !== name) { out.push([n, 'err', `после слова ${t[0]} ожидается имя метрики`]); return; }
        const notes = [];
        const g = enter(name); if (g) notes.push(g);
        if (t[0] === 'HELP') {
          if (helps[name]) notes.push(`второй HELP для ${name}: по спецификации допускается один; Prometheus 3.5 оставляет последний`);
          helps[name] = true;
          out.push(notes.length ? [n, 'warn', notes.join('; ')] : [n, 'ok', `HELP: описание ${name}`]);
          return;
        }
        if (t.length !== 3) { out.push([n, 'err', 'после TYPE нужны ровно два слова: имя и тип']); return; }
        if (!TYPES.includes(t[2])) { out.push([n, 'err', `неизвестный тип «${t[2]}»: допустимы ${TYPES.join(', ')}`]); return; }
        if (types[name]) notes.push(`второй TYPE для ${name}: по спецификации допускается один`);
        if (valued.has(name)) notes.push(`TYPE для ${name} стоит после его значений: по спецификации — до первого значения`);
        types[name] = t[2];
        out.push(notes.length ? [n, 'warn', notes.join('; ')] : [n, 'ok', `TYPE: ${name} — ${t[2]}`]);
        return;
      }
      const s = parseSample(line);
      if (s.err) { out.push([n, 'err', s.err]); return; }
      const fam = familyOf(s.name, types);
      const notes = [];
      const g = enter(fam); if (g) notes.push(g);
      valued.add(s.name); valued.add(fam);
      const key = s.name + '{' + s.labels.map(l => l[0] + '=' + JSON.stringify(l[1])).sort().join(',') + '}';
      if (seen.has(key)) notes.push('такой ряд уже был выше: Prometheus 3.5 сохранит первое значение, а значение из этой строки отбросит с предупреждением в журнале');
      seen.add(key);
      samples++;
      if (s.odd) notes.push(s.odd);
      if (s.labels.some(l => l[0].startsWith('__'))) notes.push('имена меток с __ зарезервированы для Prometheus');
      if (s.labels.some(l => l[0] === 'job' || l[0] === 'instance')) notes.push('метки job и instance ставит Prometheus: по умолчанию эта станет exported_…');
      if (s.ts) notes.push('указана отметка времени: обычно её не ставят, Prometheus записывает время сбора');
      const lbl = s.labels.length ? s.labels.length + ' ' + (s.labels.length === 1 ? 'метка' : 'метки') : 'без меток';
      const head = `ряд ${esc(s.name)}, ${lbl}, значение ${s.value}`;
      out.push(notes.length ? [n, 'warn', head + '. ' + notes.map((x, k) => k ? x : x[0].toUpperCase() + x.slice(1)).join('; ')] : [n, 'ok', `${head}, тип ${types[fam] || 'untyped — TYPE не указан'}`]);
    });
    return { out, samples, endsNl: text.endsWith('\n') };
  };

  document.querySelectorAll('.expo').forEach(root => {
    const area = root.querySelector('.expo__area');
    const list = root.querySelector('.expo__out');
    const sum = root.querySelector('.expo__sum');
    const presets = [...root.querySelectorAll('script.expo__preset')];
    const row = el('div', 'btnrow');
    const run = btn('проверить', 'btn--main');
    row.appendChild(run);
    presets.forEach(p => {
      const b = btn(p.dataset.title);
      b.addEventListener('click', () => { area.value = p.textContent.replace(/^\n/, ''); go(); });
      row.appendChild(b);
    });
    area.after(row);
    const go = () => {
      const r = check(area.value);
      list.innerHTML = '';
      r.out.forEach(([n, kind, msg]) => {
        const li = el('li', 'is-' + kind, `<span>${n}</span><span>${kind === 'err' ? '✗ ' : kind === 'warn' ? '! ' : '✓ '}${msg}</span>`);
        list.appendChild(li);
      });
      const errs = r.out.filter(x => x[1] === 'err').length;
      const warns = r.out.filter(x => x[1] === 'warn').length + (r.endsNl ? 0 : 1);
      sum.innerHTML = errs
        ? `<span class="bad">Ошибок: ${errs}.</span> Prometheus отклонит ответ целиком: сбор неуспешный, up = 0, ни одно значение не сохранится.`
        : `<span class="ok">Синтаксических ошибок нет.</span> Рядов со значениями: ${r.samples}.` +
          (warns ? ` Замечаний по спецификации: ${warns}. Prometheus 3.5 такой ответ примет, строгие разборщики — нет.` : '') +
          (r.endsNl ? '' : ' После последней строки нет перевода строки: спецификация его требует.');
    };
    run.addEventListener('click', go);
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } });
    go();
  });

  /* ── 4. Модель scrape ───────────────────────────────────────── */
  /* Модель, а не запись с сервера: секундная шкала, одно значение gauge
     «длина очереди» и один target. Правила взяты из поведения Prometheus:
     scrape начинается раз в interval со смещением, ответ дольше timeout
     прерывается, при неуспешном scrape up = 0, а ряды target помечаются
     устаревшими (линия прерывается). */
  document.querySelectorAll('.sim').forEach(root => {
    const T = 180, W = 760, X0 = 70, X1 = W - 14;
    const q = s => root.querySelector(s);
    const iv = q('[name=interval]'), to = q('[name=timeout]'), rt = q('[name=response]'), down = q('[name=outage]');
    const svg = q('.sim__svg'), stats = q('.sim__stats'), errBox = q('.sim__err');
    const INTERVALS = [5, 10, 15, 30, 60];
    const RESP = [0.01, 0.05, 0.2, 0.5, 1, 2, 3, 5, 8, 12, 20];
    const truth = t => 6 + 3 * Math.sin(t / 11) + (t >= 62 && t < 69 ? 48 : 0);
    const sx = t => X0 + (X1 - X0) * t / T;
    const fmt = v => (v < 1 ? v.toFixed(2).replace(/0$/, '') : String(v)) + ' с';

    const draw = () => {
      const interval = INTERVALS[+iv.value];
      const timeout = +to.value;
      const resp = RESP[+rt.value];
      const outage = down.checked;
      q('[data-out=interval]').textContent = interval + ' с';
      q('[data-out=timeout]').textContent = timeout + ' с';
      q('[data-out=response]').textContent = fmt(resp);

      let h = '';
      // сетка и подписи дорожек
      for (let t = 0; t <= T; t += 30) h += `<line class="grid" x1="${sx(t)}" x2="${sx(t)}" y1="14" y2="262"/><text x="${sx(t)}" y="278" text-anchor="middle">${t} с</text>`;
      h += '<text class="lane" x="4" y="42">SCRAPE</text><text class="lane" x="4" y="120">ЗНАЧЕНИЕ</text><text class="lane" x="4" y="228">UP</text>';
      if (outage) h += `<rect class="outage" x="${sx(95)}" y="14" width="${sx(130) - sx(95)}" height="248"/><text x="${(sx(95) + sx(130)) / 2}" y="26" text-anchor="middle">приложение остановлено</text>`;
      h += `<rect class="spike" x="${sx(62)}" y="64" width="${sx(69) - sx(62)}" height="130"/><text x="${sx(69) + 6}" y="120">всплеск 7 с</text>`;

      if (timeout > interval) {
        svg.innerHTML = h;
        errBox.hidden = false;
        errBox.textContent = `FAILED: scrape timeout greater than scrape interval for scrape config with job name "api"`;
        stats.innerHTML = '<div><b>—</b><span>конфигурация не загружена, сбора нет</span></div>';
        return;
      }

      // настоящее значение (пунктир)
      const yv = v => 190 - v * 2.2;
      let path = '';
      for (let t = 0; t <= T; t += 0.5) path += (t ? 'L' : 'M') + sx(t).toFixed(1) + ' ' + yv(truth(t)).toFixed(1);
      h += `<path class="truth" d="${path}"/>`;

      const offset = +(interval * 0.27).toFixed(1);
      let ok = 0, bad = 0, spikeSeen = false, lastErr = '';
      let seg = '', prevOk = false, upPath = '', dots = '';
      for (let t = offset; t < T; t += interval) {
        const inOutage = outage && t >= 95 && t < 130;
        const failed = inOutage || resp > timeout;
        const dur = inOutage ? 0.01 : Math.min(resp, timeout);
        const w = Math.max(3, sx(t + dur) - sx(t));
        h += `<rect class="${failed ? 'span-bad' : 'span-ok'}" x="${sx(t)}" y="32" width="${Math.min(w, X1 - sx(t))}" height="16"/>`;
        h += `<circle class="${failed ? 'tick-bad' : 'tick-ok'}" cx="${sx(t)}" cy="56" r="3.5"/>`;
        const upY = failed ? 244 : 214;
        upPath += (upPath ? 'L' : 'M') + sx(t).toFixed(1) + ' ' + upY;
        if (failed) {
          bad++;
          lastErr = inOutage ? 'Get "http://api:8000/metrics": dial tcp <IP api>:8000: connect: connection refused'
                             : 'Get "http://api:8000/metrics": context deadline exceeded';
          prevOk = false;
        } else {
          ok++;
          const v = truth(t);
          if (t >= 62 && t < 69) spikeSeen = true;
          seg += (prevOk ? 'L' : 'M') + sx(t).toFixed(1) + ' ' + yv(v).toFixed(1);
          dots += `<circle class="dot" cx="${sx(t)}" cy="${yv(v)}" r="3.5"/>`;
          prevOk = true;
        }
      }
      h += `<path class="stored" d="${seg}"/>${dots}`;
      h += `<text x="${X0 - 6}" y="218" text-anchor="end">1</text><text x="${X0 - 6}" y="248" text-anchor="end">0</text>`;
      h += `<path class="upline" d="${upPath}"/>`;
      svg.innerHTML = h;

      errBox.hidden = !bad;
      errBox.textContent = bad ? 'lastError: ' + lastErr : '';
      stats.innerHTML =
        `<div><b>${ok + bad}</b><span>scrape за 180 с</span></div>` +
        `<div><b class="ok">${ok}</b><span>успешных · up = 1</span></div>` +
        `<div><b class="${bad ? 'bad' : ''}">${bad}</b><span>неуспешных · up = 0</span></div>` +
        `<div><b>${offset} с</b><span>смещение первого scrape</span></div>` +
        `<div><b class="${spikeSeen ? 'ok' : 'bad'}">${spikeSeen ? 'да' : 'нет'}</b><span>всплеск попал в данные</span></div>`;
    };
    [iv, to, rt, down].forEach(c => c.addEventListener('input', draw));
    draw();
  });

  /* ── 5. Адрес target ────────────────────────────────────────── */
  document.querySelectorAll('.resolve').forEach(root => {
    const data = JSON.parse(root.querySelector('script.resolve__data').textContent);
    const out = root.querySelector('.resolve__out');
    const stat = root.querySelector('.resolve__static');
    if (stat) stat.hidden = true;
    const val = n => (root.querySelector(`input[name=${n}]:checked`) || {}).value;
    const draw = () => {
      const r = data[val('where') + '|' + val('addr')];
      if (!r) return;
      out.innerHTML =
        `<span class="state ${r.up ? 'up' : 'down'}">${r.up ? 'UP' : 'DOWN'}</span><b>http://${esc(val('addr'))}/metrics</b>` +
        (r.error ? `<pre>Error scraping target: ${esc(r.error)}</pre>` : '') +
        `<p>${r.note}</p><small>${r.verified ? 'Проверено на стенде модуля, Prometheus 3.5.0.' : 'Ожидаемый результат: этот вариант на стенде не запускался.'}</small>`;
    };
    root.querySelectorAll('input').forEach(i => i.addEventListener('change', draw));
    draw();
  });

  /* ── 6. Диаграмма последовательности ────────────────────────── */
  document.querySelectorAll('.seq').forEach(root => {
    const items = [...root.querySelectorAll('[data-step]')];
    const notes = [...root.querySelectorAll('.seq__notes li')];
    const max = Math.max(...items.map(i => +i.dataset.step));
    const row = el('div', 'btnrow');
    const prev = btn('← шаг'), next = btn('шаг →', 'btn--main'), all = btn('показать всё');
    const count = el('span', 'tracer__label', '');
    count.style.margin = '0 0 0 8px';
    row.append(prev, next, all, count);
    root.querySelector('.widget__body').appendChild(row);
    let cur = 0;
    const show = n => {
      cur = Math.max(0, Math.min(max, n));
      items.forEach(i => i.classList.toggle('is-on', +i.dataset.step <= cur));
      notes.forEach((li, k) => { li.classList.toggle('is-on', k < cur); li.classList.toggle('is-now', k === cur - 1); });
      prev.disabled = cur === 0;
      next.disabled = cur === max;
      count.textContent = `шаг ${cur} из ${max}`;
    };
    prev.addEventListener('click', () => show(cur - 1));
    next.addEventListener('click', () => show(cur + 1));
    all.addEventListener('click', () => show(max));
    show(0);
  });
})();
