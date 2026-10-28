/* Секция мок-интервью № 1 с ИИ-интервьюером (sekciya.html).
   1. Состояние секции: билет, разговор, этапы; хранится в localStorage, чтобы пережить перезагрузку.
   2. Разговор: /api/mock-chat отвечает за интервьюера по карточке задачи.
   3. Примеры: /api/mock-check сверяет ответы студента с запуском эталона и верный ответ не возвращает.
   4. Код: Python (Pyodide) в браузере запускает функцию студента на входах тестов, а сверяет
      результаты сервер. Ответы тестов на страницу не приходят.
   5. Самооценка и лист обратной связи по рубрике КТП, выгрузка в .md. */
(() => {
  const API_CHAT = '/api/mock-chat', API_CHECK = '/api/mock-check';
  const STORE = 'op04-mok1:session', STORE_CODE = 'op04-mok1:code';
  const POOL = window.MOCK_POOL || [];
  const BY_KEY = Object.fromEntries(POOL.map(t => [t.key, t]));
  const PLAN = [25, 35];
  const STAGES = [
    ['retell', 'Условие'], ['clarify', 'Уточнения'], ['examples', 'Примеры'], ['idea', 'Перебор и идея'],
    ['complexity', 'Сложность'], ['code', 'Код'], ['check', 'Проверка'],
  ];
  const CRITERIA = [
    ['clarify', 'Уточнение', 15], ['algorithm', 'Алгоритм', 25], ['code', 'Код', 25],
    ['tests', 'Тесты', 15], ['complexity', 'Сложность', 10], ['communication', 'Коммуникация', 10],
  ];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  const mm = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  const pick = xs => xs[Math.floor(Math.random() * xs.length)];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* без сохранения */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* нечего удалять */ } },
  };

  let S = store.get(STORE);
  let server = { ready: false, needCode: false };
  let busy = false;

  /* ── 1. Билет и состояние ─────────────────────────────────────── */
  function drawTicket() {
    const q = new URLSearchParams(location.search).get('t');
    const fromUrl = (q || '').split(',').filter(k => BY_KEY[k]);
    if (fromUrl.length === 2) return fromUrl;
    const easy = POOL.filter(t => t.level === 'easy'), medium = POOL.filter(t => t.level === 'medium');
    const first = pick(easy);
    return [first.key, pick(medium.filter(t => t.module !== first.module)).key];
  }
  const newTask = key => ({ key, messages: [], stage: 'retell', clarified: [], hints: [], code: BY_KEY[key].signature, examples: [{ args: '', answer: '', verdict: '' }], tests: null, startedAt: null, finishedAt: null });
  const task = () => S.tasks[S.idx];
  const save = () => store.set(STORE, S);

  /* ── 2. Сервер ─────────────────────────────────────────────────── */
  async function post(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-mock-code': store.get(STORE_CODE) || '' },
      body: JSON.stringify(body),
    });
    let data = {};
    try { data = await r.json(); } catch { /* пустой ответ */ }
    if (!r.ok) throw new Error(data.error || `сервер ответил ${r.status}`);
    return data;
  }

  async function ask() {
    const t = task();
    busy = true; renderChat(true);
    try {
      const out = await post(API_CHAT, { action: 'chat', key: t.key, mode: S.mode, stage: t.stage, hints: t.hints.length, messages: t.messages, code: t.code === BY_KEY[t.key].signature ? '' : t.code });
      t.messages.push({ role: 'assistant', content: out.reply });
      if (out.stage && out.stage !== t.stage) { t.stage = out.stage; }
      for (const f of out.clarified || []) if (!t.clarified.includes(f)) t.clarified.push(f);
    } catch (e) {
      t.messages.push({ role: 'error', content: e.message });
    }
    busy = false; save(); renderRoom();
  }

  async function askHint() {
    const t = task();
    if (busy) return;
    busy = true; renderChat(true);
    try {
      const out = await post(API_CHAT, { action: 'hint', key: t.key, hints: t.hints.length, messages: t.messages });
      t.messages.push({ role: 'assistant', content: `Подсказка, ступень ${out.ladder}: ${out.text}` });
      if (out.level > t.hints.length) t.hints.push({ level: out.ladder, stage: t.stage, text: out.text });
    } catch (e) {
      t.messages.push({ role: 'error', content: e.message });
    }
    busy = false; save(); renderRoom();
  }

  function say(text) {
    const t = task();
    t.messages = t.messages.filter(m => m.role !== 'error');
    t.messages.push({ role: 'user', content: text });
    return ask();
  }

  function event(text) {
    const t = task();
    t.messages = t.messages.filter(m => m.role !== 'error');
    t.messages.push({ role: 'event', content: text });
    return ask();
  }

  /* ── 3. Python в браузере ──────────────────────────────────────── */
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.8/full/';
  /*RUNNER*/const RUNNER = `
import json, io, ast, contextlib, traceback
def _norm(x):
    if isinstance(x, bool) or x is None or isinstance(x, (int, str)):
        return x
    if isinstance(x, float):
        return int(x) if x.is_integer() else round(x, 6)
    if isinstance(x, (list, tuple)):
        return [_norm(v) for v in x]
    if isinstance(x, (set, frozenset)):
        return sorted((_norm(v) for v in x), key=repr)
    if isinstance(x, dict):
        return {str(k): _norm(v) for k, v in x.items()}
    return {"repr": repr(x)[:200]}
def _run(user, fn_name, cases_json):
    ns, out, res = {}, io.StringIO(), []
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(user, "solution.py", "exec"), ns)
    except Exception:
        tb = traceback.format_exc(limit=-1).strip().splitlines()
        return json.dumps({"fatal": "\\n".join(l for l in tb[-4:] if not l.startswith("Traceback")), "out": out.getvalue()[-2000:]})
    f = ns.get(fn_name)
    if not callable(f):
        return json.dumps({"fatal": f"В коде нет функции {fn_name}: имя должно совпадать с заголовком в заготовке."})
    for src in json.loads(cases_json):
        args = list(ast.literal_eval(src))
        o = {}
        try:
            with contextlib.redirect_stdout(out):
                r = f(*args)
            o["ret"] = _norm(r)
            o["repr"] = repr(r)[:300]
        except Exception as e:
            o["ret"] = {"raise": type(e).__name__}
            o["err"] = f"{type(e).__name__}: {e}"[:300]
        o["args"] = _norm(args)
        res.append(o)
    return json.dumps({"results": res, "out": out.getvalue()[-2000:]})
`;/*/RUNNER*/
  const workerSrc = `
importScripts('${PYODIDE}pyodide.js');
const ready = loadPyodide({ indexURL: '${PYODIDE}' }).then(py => { py.runPython(${JSON.stringify(RUNNER)}); return py; });
ready.then(() => postMessage({ ready: true }), e => postMessage({ loadError: String(e) }));
onmessage = async e => {
  const py = await ready;
  py.globals.set('USER', e.data.user); py.globals.set('FN', e.data.fn); py.globals.set('CASES', e.data.cases);
  try { postMessage({ id: e.data.id, data: JSON.parse(py.runPython('_run(USER, FN, CASES)')) }); }
  catch (err) { postMessage({ id: e.data.id, data: { fatal: String(err) } }); }
};`;
  let worker = null, readyPromise = null, seq = 0;
  function boot(setStatus) {
    if (readyPromise) return readyPromise;
    setStatus('загружается Python — при первом запуске до минуты');
    worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' })));
    readyPromise = new Promise((ok, fail) => {
      worker.addEventListener('message', function first(e) {
        if (e.data.ready) { worker.removeEventListener('message', first); ok(); }
        if (e.data.loadError) { worker.removeEventListener('message', first); readyPromise = null; fail(e.data.loadError); }
      });
    });
    return readyPromise;
  }
  function runPython(user, fn, cases, setStatus) {
    return boot(setStatus).then(() => new Promise(resolve => {
      const id = ++seq;
      const timer = setTimeout(() => {
        worker.terminate(); worker = null; readyPromise = null;
        resolve({ fatal: 'Код работает дольше 6 секунд и остановлен. Чаще всего это бесконечный цикл: проверьте, что указатели сдвигаются на каждом шаге.' });
      }, 6000);
      const onMsg = e => { if (e.data.id !== id) return; clearTimeout(timer); worker.removeEventListener('message', onMsg); resolve(e.data.data); };
      worker.addEventListener('message', onMsg);
      worker.postMessage({ id, user, fn, cases: JSON.stringify(cases) });
    })).catch(err => ({ fatal: 'Python не загрузился. Ему нужен интернет: Python скачивается с cdn.jsdelivr.net. ' + err }));
  }

  /* ── 4. Отрисовка ──────────────────────────────────────────────── */
  function show(id) {
    for (const s of ['start', 'room', 'self', 'sheet']) $('#mk-' + s).hidden = s !== id;
  }

  function renderStart() {
    show('start');
    const ticket = S && S.draft ? S.draft : drawTicket();
    S = { draft: ticket };
    const st = $('#mk-server');
    st.className = 'mk-server ' + (server.ready ? 'is-ok' : 'is-no');
    st.textContent = server.ready ? 'ИИ-интервьюер подключён.' : (server.error || 'ИИ-интервьюер не настроен на сервере: секцию можно пройти в парах, порядок — в главе 16, §7.');
    $('#mk-code-row').hidden = !server.needCode;
    $('#mk-code').value = store.get(STORE_CODE) || '';
    $('#mk-ticket').innerHTML = ticket.map((k, i) => {
      const t = BY_KEY[k];
      return `<article class="ticket__task"><p class="ticket__meta"><b>Задача ${i + 1} · ${i ? 'чуть сложнее' : 'простая'} · ${PLAN[i]} минут</b><span>модуль ${t.module}</span></p><h3>${esc(t.title)}</h3></article>`;
    }).join('');
    $('#mk-go').disabled = !server.ready;
  }

  function renderRoom() {
    show('room');
    const t = task(), p = BY_KEY[t.key];
    $('#mk-title').innerHTML = `Задача ${S.idx + 1} из 2 · ${S.idx ? 'чуть сложнее' : 'простая'} · <span>${esc(p.title)}</span>`;
    $('#mk-mode').textContent = S.mode === 'training' ? 'тренировка: подсказки по просьбе' : 'экзамен: без подсказок';
    const at = STAGES.findIndex(s => s[0] === t.stage);
    $('#mk-stages').innerHTML = STAGES.map(([id, name], i) => `<li class="${t.stage === 'done' || i < at ? 'is-past' : i === at ? 'is-now' : ''}">${name}</li>`).join('');
    $('#mk-say').innerHTML = `«${p.say}»`;
    $('#mk-facts').innerHTML = t.clarified.length ? t.clarified.map(f => `<li>${esc(f)}</li>`).join('') : '<li class="is-empty">Пока ничего. Факты появятся здесь, когда интервьюер ответит на ваши вопросы.</li>';
    $('#mk-hints').hidden = !t.hints.length;
    $('#mk-hints').textContent = t.hints.length ? `Подсказки: ${t.hints.map(h => 'ступень ' + h.level).join(', ')}` : '';
    $('#mk-fn').textContent = p.fn;
    const ed = $('#mk-editor');
    if (document.activeElement !== ed) ed.value = t.code;
    renderExamples();
    renderTests();
    renderChat(busy);
    $('#mk-finish').textContent = S.idx === 0 ? 'Закончить задачу → задача 2' : 'Закончить секцию';
  }

  function renderChat(waiting) {
    const t = task();
    const body = $('#mk-chat');
    body.innerHTML = t.messages.map((m, i) => {
      if (m.role === 'assistant') return `<p class="chat__msg chat__msg--ai"><b>Интервьюер</b>${rich(m.content)}</p>`;
      if (m.role === 'user') return `<p class="chat__msg chat__msg--me"><b>Вы</b>${rich(m.content)}</p>`;
      if (m.role === 'event') return `<p class="chat__note">${esc(m.content.replace(/^\[[^\]]+\]\s*/, ''))}</p>`;
      return `<p class="chat__note mk-err">${esc(m.content)} <button class="btn" type="button" data-act="retry" data-i="${i}">Повторить</button></p>`;
    }).join('') + (waiting ? '<p class="chat__note mk-typing">интервьюер пишет…</p>' : '');
    body.scrollTop = body.scrollHeight;
    $('#mk-send').disabled = waiting;
    const hb = $('#mk-hint');
    hb.hidden = S.mode !== 'training';
    hb.disabled = waiting;
    hb.textContent = `Подсказка · ступень ${Math.min(t.hints.length + 1, 4)}`;
  }

  function renderExamples() {
    const t = task(), p = BY_KEY[t.key];
    $('#mk-ex-rows').innerHTML = t.examples.map((r, i) => `<tr>
      <td><span class="mk-call">${esc(p.fn)}(</span><input data-ex="${i}" data-f="args" value="${esc(r.args)}" spellcheck="false" autocomplete="off" placeholder="[1, 2, 3], 2"><span class="mk-call">)</span></td>
      <td><input data-ex="${i}" data-f="answer" value="${esc(r.answer)}" spellcheck="false" autocomplete="off" placeholder="ответ"></td>
      <td class="mk-verdict ${r.verdict ? 'is-' + r.verdict : ''}">${{ ok: 'сходится', bad: 'не сходится', parse: 'не разобрать' }[r.verdict] || ''}</td>
      <td><button class="mk-x" type="button" data-act="ex-del" data-i="${i}" aria-label="Удалить пример">×</button></td></tr>`).join('');
  }

  function renderTests() {
    const t = task(), p = BY_KEY[t.key], box = $('#mk-tests');
    const r = t.tests;
    if (!r) { box.innerHTML = '<p class="sandbox__wait">Тесты ещё не запускались. Входов в тестах: ' + p.cases.length + '.</p>'; return; }
    if (r.fatal) { box.innerHTML = `<pre class="sandbox__err">${esc(r.fatal)}</pre>`; return; }
    box.innerHTML = `<p class="sandbox__sum ${r.passed === r.total ? 'is-ok' : ''}">Прошло тестов: ${r.passed} из ${r.total}</p><ul class="sandbox__list">` +
      r.items.map((it, i) => it.ok
        ? `<li class="is-ok"><b>тест ${i + 1} · прошёл</b></li>`
        : `<li class="is-no"><b>тест ${i + 1} · не прошёл</b><span>вход: ${esc(p.fn + p.cases[i].replace(/,\)$/, ')'))}</span><span>ваш результат: ${esc(it.got)}</span></li>`).join('') +
      '</ul>' + (r.out ? `<p class="sandbox__label">вывод print()</p><pre class="sandbox__print">${esc(r.out)}</pre>` : '');
  }

  /* ── 5. Действия ───────────────────────────────────────────────── */
  async function checkExamples() {
    const t = task(), p = BY_KEY[t.key];
    const rows = t.examples.filter(r => r.args.trim() || r.answer.trim());
    if (!rows.length) return;
    try {
      const out = await post(API_CHECK, { action: 'examples', key: t.key, rows: rows.map(r => ({ args: r.args, answer: r.answer })) });
      rows.forEach((r, i) => { r.verdict = out.verdicts[i]; });
    } catch (e) { alert(e.message); return; }
    save(); renderExamples();
    const word = { ok: 'сходится', bad: 'не сходится', parse: 'не удалось разобрать запись' };
    const lines = rows.map((r, i) => `${i + 1}) ${p.fn}(${r.args}) → ${r.answer}: ${word[r.verdict]}`);
    await event(`[СВЕРКА] Кандидат сверил примеры с эталоном (${rows.filter(r => r.verdict === 'ok').length} из ${rows.length} сходятся):\n${lines.join('\n')}`);
  }

  async function runTests() {
    const t = task(), p = BY_KEY[t.key], btn = $('#mk-run');
    t.code = $('#mk-editor').value;
    btn.disabled = true;
    const status = $('#mk-run-status');
    const res = await runPython(t.code, p.fn, p.cases, s => { status.textContent = s; });
    status.textContent = '';
    if (res.fatal) {
      t.tests = { fatal: res.fatal };
    } else {
      try {
        const out = await post(API_CHECK, { action: 'tests', key: t.key, outputs: res.results.map(o => ({ ret: o.ret, args: o.args })) });
        t.tests = {
          passed: out.passed, total: out.total, out: res.out,
          items: out.results.map((ok, i) => ({ ok, got: res.results[i].err || res.results[i].repr })),
        };
      } catch (e) { t.tests = { fatal: e.message }; }
    }
    btn.disabled = false; save(); renderTests();
    const r = t.tests;
    const failed = r.items ? r.items.map((it, i) => it.ok ? null : `${p.fn}${p.cases[i].replace(/,\)$/, ')')}`).filter(Boolean) : [];
    await event(r.fatal
      ? `[ТЕСТЫ] Код не запустился: ${r.fatal.split('\n').pop()}`
      : `[ТЕСТЫ] Прошло ${r.passed} из ${r.total}.${failed.length ? ' Не прошли входы: ' + failed.slice(0, 4).join('; ') + '.' : ' Все тесты прошли.'}`);
  }

  function finishTask() {
    const t = task();
    if (t.stage !== 'done' && !confirm('Интервьюер ещё не закрыл задачу. Закончить её сейчас?')) return;
    t.code = $('#mk-editor').value;
    t.finishedAt = Date.now();
    if (S.idx === 0) {
      S.idx = 1; task().startedAt = Date.now(); save(); renderRoom(); ask();
    } else { S.phase = 'self'; save(); renderSelf(); }
  }

  function renderSelf() {
    show('self');
    $('#mk-self-rows').innerHTML = CRITERIA.map(([id, name, w]) => `<tr><td><b>${name}</b></td><td>${w} %</td><td><div class="mk-scale">${[0, 1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="self-${id}" value="${n}" ${S.self && S.self[id] === n ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></td></tr>`).join('');
  }

  async function makeSheet() {
    const self = {};
    for (const [id] of CRITERIA) {
      const v = document.querySelector(`input[name="self-${id}"]:checked`);
      if (!v) { alert('Оцените себя по всем шести критериям.'); return; }
      self[id] = Number(v.value);
    }
    S.self = self; save();
    const btn = $('#mk-sheet-go'); btn.disabled = true; btn.textContent = 'Интервьюер заполняет лист…';
    try {
      S.sheet = await post(API_CHAT, {
        action: 'feedback', self,
        tasks: S.tasks.map(t => ({
          key: t.key, messages: t.messages.filter(m => m.role !== 'error'), code: t.code, stage: t.stage,
          hints: t.hints.map(h => ({ level: h.level, stage: h.stage })),
          tests: t.tests && !t.tests.fatal ? { passed: t.tests.passed, total: t.tests.total } : (t.tests ? { error: t.tests.fatal } : null),
          examples: t.examples.filter(r => r.verdict).map(r => ({ call: `${BY_KEY[t.key].fn}(${r.args})`, answer: r.answer, verdict: r.verdict })),
          minutes: t.startedAt && t.finishedAt ? Math.round((t.finishedAt - t.startedAt) / 60000) : null,
        })),
      });
      save(); renderSheet();
    } catch (e) { alert(e.message); }
    btn.disabled = false; btn.textContent = 'Получить лист обратной связи';
  }

  function minutes(t) { return t.startedAt && t.finishedAt ? Math.max(1, Math.round((t.finishedAt - t.startedAt) / 60000)) : '—'; }
  function selfTotal() { return Math.round(CRITERIA.reduce((s, [id, , w]) => s + w * (S.self[id] || 0) / 5, 0)); }
  function repeatList() {
    return S.tasks.filter(t => t.hints.length || !t.tests || t.tests.fatal || t.tests.passed < t.tests.total || t.stage !== 'done').map(t => BY_KEY[t.key]);
  }

  function renderSheet() {
    show('sheet');
    const sh = S.sheet;
    $('#mk-total').innerHTML = `<b>${sh.total} %</b><span>оценка интервьюера</span><b>${selfTotal()} %</b><span>ваша самооценка</span>`;
    $('#mk-sheet-rows').innerHTML = sh.criteria.map(c => `<tr><td><b>${esc(c.name)}</b><br><small>${c.weight} %</small></td><td>${S.self[c.id]}</td><td>${c.score}</td><td>${esc(c.comment)}${c.quote ? `<q>${esc(c.quote)}</q>` : ''}</td></tr>`).join('');
    $('#mk-tasks').innerHTML = S.tasks.map((t, i) => {
      const p = BY_KEY[t.key], r = t.tests;
      return `<tr><td>${i + 1}. ${esc(p.title)}</td><td>${minutes(t)} из ${PLAN[i]}</td><td>${r && !r.fatal ? `${r.passed} из ${r.total}` : 'не запускались'}</td><td>${t.hints.length ? t.hints.map(h => h.level).join(', ') : 'нет'}</td><td>${t.stage === 'done' ? 'закрыта' : 'не закрыта'}</td></tr>`;
    }).join('');
    $('#mk-strengths').innerHTML = sh.strengths.map(s => `<li>${esc(s)}</li>`).join('');
    $('#mk-improve').innerHTML = sh.improve.map(s => `<li>${esc(s)}</li>`).join('');
    $('#mk-summary').textContent = sh.summary;
    const rep = repeatList();
    $('#mk-repeat').innerHTML = rep.length
      ? rep.map(p => `<li>${esc(p.title)}: ${p.chapter ? `глава ${p.chapter}, ` : ''}<a href="${esc(p.trainer)}">тренажёр модуля ${p.module}</a></li>`).join('')
      : '<li>Обе задачи закрыты без подсказок и со всеми тестами. Следующий шаг — новый билет в режиме «экзамен».</li>';
  }

  function markdown() {
    const sh = S.sheet, date = new Date().toLocaleDateString('ru-RU');
    const L = [`# Мок-интервью № 1 · ОП.04 · ${date}`, '', `Режим: ${S.mode === 'training' ? 'тренировка' : 'экзамен'}. Итог: ${sh.total} % (самооценка ${selfTotal()} %).`, '', '## Лист обратной связи', '',
      '| Критерий | Вес | Самооценка | Интервьюер | Комментарий |', '|---|---|---|---|---|',
      ...sh.criteria.map(c => `| ${c.name} | ${c.weight} % | ${S.self[c.id]} | ${c.score} | ${(c.comment + (c.quote ? ` «${c.quote}»` : '')).replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ')} |`),
      '', '### Что получилось', ...sh.strengths.map(s => `- ${s}`), '', '### Что сделать к следующей секции', ...sh.improve.map(s => `- ${s}`), '', sh.summary, '',
      '## Ретроспектива', '', '- Что сделано хорошо:', '- Где ушло больше времени, чем по плану:', '- Что изменить в следующий раз:', ''];
    S.tasks.forEach((t, i) => {
      const p = BY_KEY[t.key], r = t.tests;
      L.push(`## Задача ${i + 1}. ${p.title}`, '', `Время: ${minutes(t)} мин из ${PLAN[i]}. Тесты: ${r && !r.fatal ? `${r.passed} из ${r.total}` : 'не запускались'}. Подсказки: ${t.hints.length ? t.hints.map(h => 'ступень ' + h.level).join(', ') : 'нет'}.`, '',
        '```python', t.code.trim(), '```', '', '### Разговор', '');
      for (const m of t.messages) {
        if (m.role === 'assistant') L.push(`**Интервьюер:** ${m.content}`, '');
        if (m.role === 'user') L.push(`**Кандидат:** ${m.content}`, '');
        if (m.role === 'event') L.push(`*${m.content.replace(/^\[[^\]]+\]\s*/, '')}*`, '');
      }
    });
    return L.join('\n');
  }

  /* ── 6. События страницы ───────────────────────────────────────── */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'redraw') { S = null; renderStart(); }
    if (act === 'go') {
      const code = $('#mk-code').value.trim();
      if (server.needCode) store.set(STORE_CODE, code);
      const ticket = S.draft;
      S = { mode: document.querySelector('input[name="mk-mode"]:checked').value, idx: 0, tasks: ticket.map(newTask), self: null, sheet: null };
      task().startedAt = Date.now(); save(); renderRoom(); ask();
    }
    if (act === 'retry') { task().messages.splice(Number(b.dataset.i), 1); ask(); }
    if (act === 'ex-add') { if (task().examples.length < 12) task().examples.push({ args: '', answer: '', verdict: '' }); save(); renderExamples(); }
    if (act === 'ex-del') { task().examples.splice(Number(b.dataset.i), 1); if (!task().examples.length) task().examples.push({ args: '', answer: '', verdict: '' }); save(); renderExamples(); }
    if (act === 'ex-check') checkExamples();
    if (act === 'run') runTests();
    if (act === 'hint') askHint();
    if (act === 'finish') finishTask();
    if (act === 'sheet') makeSheet();
    if (act === 'download') {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([markdown()], { type: 'text/markdown;charset=utf-8' }));
      a.download = `mok-intervyu-1_${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
    }
    if (act === 'restart' && confirm('Начать новую секцию? Текущий разговор и лист будут удалены из браузера.')) { store.del(STORE); S = null; renderStart(); }
  });

  $('#mk-form').addEventListener('submit', e => {
    e.preventDefault();
    const box = $('#mk-input'), text = box.value.trim();
    if (!text || busy) return;
    box.value = ''; say(text.slice(0, 3000));
  });
  $('#mk-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#mk-form').requestSubmit(); }
  });
  $('#mk-editor').addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ed = e.target, s = ed.selectionStart;
    ed.setRangeText('    ', s, ed.selectionEnd, 'end');
  });
  $('#mk-editor').addEventListener('input', e => { task().code = e.target.value; save(); });
  document.addEventListener('input', e => {
    const i = e.target.dataset.ex; if (i === undefined) return;
    const r = task().examples[Number(i)]; r[e.target.dataset.f] = e.target.value; r.verdict = ''; save();
  });

  setInterval(() => {
    if (!S || !S.tasks || $('#mk-room').hidden) return;
    const t = task(), sec = Math.floor((Date.now() - S.tasks[0].startedAt) / 1000);
    const own = t.startedAt ? Math.floor((Date.now() - t.startedAt) / 1000) : 0;
    const clock = $('#mk-clock');
    clock.textContent = mm(sec);
    clock.classList.toggle('is-over', sec >= 60 * 60);
    $('#mk-plan').textContent = `задача ${S.idx + 1}: ${mm(own)} из ${PLAN[S.idx]}:00`;
  }, 1000);

  /* ── 7. Запуск ──────────────────────────────────────────────────── */
  fetch(API_CHAT).then(r => r.json()).then(d => { server = d; }, () => { server = { ready: false, error: 'Сервер интервьюера недоступен. На локальной копии страницы его нет: откройте страницу на сайте курса.' }; })
    .finally(() => {
      if (S && S.sheet) renderSheet();
      else if (S && S.tasks && S.phase === 'self') renderSelf();
      else if (S && S.tasks) renderRoom();
      else renderStart();
    });
})();
