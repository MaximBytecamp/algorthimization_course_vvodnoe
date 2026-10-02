/* Рабочий стол практикума «Младший разработчик: первая неделя».

   1. Состояние и сохранение          6. Письмо 4: подпись вручную
   2. Общие куски                      7. Оценка и рецензия
   3. Письмо 1: рабочее место          8. Отчёт и сброс
   4. Письмо 2: подписи по заявкам     9. Вкладки и события
   5. Письмо 3: вызовы и подпись

   По ходу работы ничего не оценивается. Письма открываются кнопкой
   «Дальше» без условий. После «Сдать работу» ответы закрываются
   и открывается рецензия. Работа хранится в localStorage браузера. */
(() => {
  const { FROM, LETTERS, ORDER, FILES, CAUSES, CHAT, CATALOG, BUILD, SIEVE, WRITE } = window.PD;
  const S = window.SIG;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  /* ── 1. Состояние и сохранение ─────────────────────────────────── */
  const KEY = 'mdk0101-podpisi-v1', SKEY = 'mdk0101-podpisi-student';
  const blank = () => ({ open: 1, submitted: false, submittedAt: null,
    order: [], files: {}, chat: {}, build: {}, buildCur: 0, sieve: {}, sieveCur: 0, write: {} });
  const read = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || fallback; } catch (_) { return fallback; } };
  let state = Object.assign(blank(), read(KEY, {}));
  let student = read(SKEY, { name: '', group: '' });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { } };
  const saveStudent = () => { try { localStorage.setItem(SKEY, JSON.stringify(student)); } catch (_) { } };
  let tab = state.submitted ? 5 : Math.min(state.open, 4);
  const locked = () => state.submitted;
  const dis = () => (locked() ? ' disabled' : '');
  let picked = null;   // { kind: 'type', id } — тип, выбранный нажатием и ждущий слота

  /* ── 2. Общие куски ───────────────────────────────────────────── */
  const letterHtml = n => {
    const L = LETTERS[n - 1];
    return `<article class="letter"><div class="letter__head">От: <b>${esc(FROM)}</b><span class="letter__subject">${esc(L.subject)}</span></div>`
      + `<div class="letter__body">${L.body.map(p => `<p>${esc(p)}</p>`).join('')}</div></article>`
      + `<div class="task"><b>Задание</b>${esc(L.task)}</div>`;
  };

  const nextHtml = (n, left) => {
    if (locked()) return '<p class="note">Работа сдана. Ответы можно посмотреть, но не изменить. Рецензия — на вкладке «Рецензия».</p>';
    const warn = left ? `<span class="note">Не заполнено: ${left}. Перейти можно и так — вернуться к письму можно в любой момент до сдачи.</span>` : '';
    if (n < 4) return `<div class="row"><button type="button" class="btn" data-next="${n + 1}">Дальше: письмо ${n + 1} →</button>${warn}</div>`;
    return `<div class="row"><button type="button" class="btn" data-act="submit">Сдать работу</button>${warn}</div>`;
  };

  const binCard = (id, body, where, mark, verdict) => {
    const tools = locked() ? (verdict ? `<span class="note">${esc(verdict)}</span>` : '')
      : (where !== 'in' ? `<button type="button" class="btn btn--ghost btn--small" data-put="in">${esc(binCard.labels.in)}</button>` : '')
        + (where !== 'out' ? `<button type="button" class="btn btn--ghost btn--small" data-put="out">${esc(binCard.labels.out)}</button>` : '')
        + (where !== 'pool' ? '<button type="button" class="btn btn--ghost btn--small" data-put="pool">вернуть</button>' : '');
    return `<div class="doc-card${mark ? ' ' + mark : ''}" draggable="${!locked()}" data-doc="${esc(id)}"><pre>${esc(body)}</pre><div class="doc-card__tools">${tools}</div></div>`;
  };
  binCard.labels = { in: '', out: '' };

  /* Три колонки: не разобраны, «in», «out». items — [{ id, body }]. */
  const binsHtml = (items, place, heads, review) => {
    binCard.labels = { in: heads.short[0], out: heads.short[1] };
    const at = it => place[it.id] || 'pool';
    const col = (where, head, cls) => {
      const list = items.filter(it => at(it) === where);
      if (where === 'pool' && !list.length) return '';
      return `<div class="bin ${cls}" data-bin="${where}"><p class="bin__head">${head} · ${list.length}</p>`
        + list.map(it => binCard(it.id, it.body, where, review ? review(it) : '', '')).join('') + '</div>';
    };
    return `<div class="sieve">${col('pool', 'Не разобраны', 'bin--pool')}${col('in', heads.long[0], 'bin--in')}${col('out', heads.long[1], 'bin--out')}</div>`;
  };

  /* ── 3. Письмо 1: рабочее место ────────────────────────────────── */
  const ALL_STEPS = [...ORDER.steps, ...ORDER.extra];
  const stepOf = id => ALL_STEPS.find(x => x.id === id);
  const TRAY_ORDER = ['x2', 'o3', 'o5', 'x1', 'o1', 'o4', 'x3', 'o2'];
  const FILE_ORDER = ['f8', 'f4', 'f10', 'f1', 'f7', 'f5', 'f9', 'f3', 'f6', 'f2'];
  const fileOf = id => FILES.cards.find(f => f.id === id);
  const FILE_PLACE = { repo: 'in', local: 'out' };

  const orderRight = () => state.order.join() === ORDER.steps.map(s => s.id).join();
  const filesRight = () => FILES.cards.filter(f => state.files[f.id] === FILE_PLACE[f.where]).length;
  const chatRight = () => CHAT.filter(c => state.chat[c.id] === c.cause).length;
  const envTotal = 1 + FILES.cards.length + CHAT.length;
  const envGot = () => (orderRight() ? 1 : 0) + filesRight() + chatRight();
  const causeText = id => (CAUSES.find(c => c[0] === id) || [, '—'])[1];

  const envView = () => {
    const tray = TRAY_ORDER.filter(id => !state.order.includes(id));
    const placed = state.order.map((id, i) => `<div class="blk" draggable="${!locked()}" data-step="${id}" data-placed="1">`
      + (locked() ? '' : `<button type="button" class="blk__x" data-unstep="${id}" title="Вернуть в набор" aria-label="Вернуть в набор">×</button>`
        + (i ? `<button type="button" class="blk__up" data-upstep="${id}" title="Выше" aria-label="Поднять выше">↑</button>` : ''))
      + `<span class="blk__num">${i + 1}.</span>${esc(stepOf(id).text)}</div>`).join('');
    const part1 = `<article class="card"><div class="card__head"><span>Часть <b>1</b> · порядок команд</span><span>касса «Зерно»</span></div><div class="card__body">`
      + `<p class="card__task">${esc(ORDER.intro)}</p><div class="two">`
      + `<div><span class="lbl">Набор шагов</span><div class="tray" data-zone="steps-tray">${tray.map(id => `<div class="blk" draggable="${!locked()}" tabindex="0" role="button" data-step="${id}">${esc(stepOf(id).text)}</div>`).join('') || '<span class="zone__empty">Все шаги в списке</span>'}</div>`
      + '<p class="note">Нажмите на шаг, чтобы добавить его в конец списка, или перетащите. Стрелка ↑ поднимает шаг, крестик возвращает в набор.</p></div>'
      + `<div><span class="lbl">Ваш порядок</span><div class="zone" data-zone="steps">${placed || '<span class="zone__empty">Положите сюда шаги по порядку</span>'}</div></div>`
      + '</div></div></article>';

    const fileItems = FILE_ORDER.map(id => ({ id, body: fileOf(id).name }));
    const part2 = `<article class="card"><div class="card__head"><span>Часть <b>2</b> · первый коммит</span><span>${FILES.cards.length} файлов и папок</span></div><div class="card__body">`
      + `<p class="card__task">${esc(FILES.intro)}</p>`
      + binsHtml(fileItems, state.files, { long: ['В репозиторий', 'Остаётся на компьютере'], short: ['в репозиторий', 'на компьютере'] }) + '</div></article>';

    const part3 = `<p class="part">Часть 3 · вопросы из чата стажёров</p>` + CHAT.map((c, i) => `<article class="card" data-chat="${c.id}"><div class="card__head"><span>Вопрос <b>${i + 1}</b> из ${CHAT.length}</span><span>${esc(c.who)}</span></div><div class="card__body">`
      + `<p class="claim"><b>${esc(c.who)}:</b> ${esc(c.text)}</p><pre class="term">${esc(c.term)}</pre>`
      + `<div class="field"><label for="ch-${c.id}">Причина</label><select id="ch-${c.id}" data-cause${dis()}><option value="">— выберите —</option>`
      + CAUSES.map(([id, t]) => `<option value="${id}"${state.chat[c.id] === id ? ' selected' : ''}>${esc(t)}</option>`).join('') + '</select></div></div></article>').join('');

    const left = [];
    if (!state.order.length) left.push('порядок команд');
    const fl = FILES.cards.filter(f => !state.files[f.id]).length;
    if (fl) left.push(`${fl} из ${FILES.cards.length} файлов не разложены`);
    const cl = CHAT.filter(c => !state.chat[c.id]).length;
    if (cl) left.push(`${cl} из ${CHAT.length} вопросов без причины`);
    return part1 + part2 + part3 + nextHtml(1, left.join('; '));
  };

  const addStep = (id, beforeId) => {
    state.order = state.order.filter(x => x !== id);
    const at = beforeId ? state.order.indexOf(beforeId) : -1;
    if (at >= 0) state.order.splice(at, 0, id); else state.order.push(id);
  };

  /* ── 4. Письмо 2: подписи по заявкам ───────────────────────────── */
  const bs = b => (state.build[b.id] = state.build[b.id] || { params: [], ret: [] });
  const poolOf = (b, name) => b.pool.find(p => p[0] === name);
  const joinTypes = list => list.join(' | ');
  const canonOf = list => { try { return list.length ? S.canonText(joinTypes(list)) : ''; } catch (_) { return '?'; } };

  const paramText = (b, p) => {
    const def = poolOf(b, p.name)[1];
    const t = p.types.length ? `: ${joinTypes(p.types)}` : '';
    return p.name + t + (def !== undefined ? (t ? ` = ${def}` : `=${def}`) : '');
  };
  const sigText = b => {
    const st = bs(b);
    return `def ${b.fn}(${st.params.map(p => paramText(b, p)).join(', ')})${st.ret.length ? ' -> ' + joinTypes(st.ret) : ''}:`;
  };
  const orderError = b => {
    try { S.checkDefaults(bs(b).params.map(p => ({ name: p.name, hasDefault: poolOf(b, p.name)[1] !== undefined }))); return ''; }
    catch (e) { return e.message; }
  };

  /* Решена: те же параметры, те же типы (порядок вариантов в | не важен), тот же результат, подпись допустима. */
  const paramRight = (b, p) => {
    const want = b.params.find(x => x[0] === p.name);
    return !!want && canonOf(p.types) === S.canonText(want[1]);
  };
  const buildSolved = b => {
    const st = bs(b);
    return st.params.length === b.params.length && st.params.every(p => paramRight(b, p))
      && canonOf(st.ret) === S.canonText(b.ret) && !orderError(b);
  };
  const buildTouched = b => bs(b).params.length > 0 || bs(b).ret.length > 0;

  const tchip = (t, where) => `<span class="tchip${t === 'None' ? ' tchip--none' : ''}${!where && picked && picked.id === t ? ' is-picked' : ''}" draggable="${!locked()}" tabindex="0" role="button" data-type="${esc(t)}">${esc(t)}`
    + (where && !locked() ? `<button type="button" class="tchip__x" data-untype="${esc(t)}" data-from="${esc(where)}" aria-label="Убрать тип">×</button>` : '') + '</span>';

  const slotHtml = (key, list) => `<span class="slot${picked ? ' is-target' : ''}" data-slot="${esc(key)}" tabindex="0">`
    + (list.length ? list.map((t, i) => (i ? '<span class="slot__bar">|</span>' : '') + tchip(t, key)).join('')
      + (locked() ? '' : '<span class="slot__plus">+ ещё тип</span>')
      : '<span class="slot__empty">положите тип</span>') + '</span>';

  const readingHtml = b => {
    const st = bs(b);
    const node = list => { try { return list.length ? S.parseType(joinTypes(list)) : null; } catch (_) { return null; } };
    const items = st.params.map(p => `<li><code>${esc(p.name)}</code> — ${esc(p.types.length ? S.read(node(p.types)) : 'тип не выбран')}`
      + (poolOf(b, p.name)[1] !== undefined ? `; если не передать — <code>${esc(poolOf(b, p.name)[1])}</code>` : '') + '</li>');
    items.push(`<li>результат — ${esc(st.ret.length ? S.read(node(st.ret)) : 'тип не выбран')}</li>`);
    const warns = [];
    const err = orderError(b);
    if (err) warns.push(`<div class="warn warn--err">${esc(err)}</div>`);
    return `<div class="reading"><b>Как читается подпись</b><ul>${items.join('')}</ul></div>` + warns.join('');
  };

  const buildView = () => {
    const cur = Math.min(state.buildCur, BUILD.length - 1);
    const b = BUILD[cur], st = bs(b);
    const pills = BUILD.map((x, i) => `<button type="button" data-bcur="${i}" aria-current="${i === cur}" class="${buildTouched(x) ? 'is-ok' : ''}">${i + 1}</button>`).join('');
    const pool = b.pool.filter(p => !st.params.some(x => x.name === p[0]))
      .map(p => `<span class="pchip" draggable="${!locked()}" tabindex="0" role="button" data-param="${esc(p[0])}">${esc(p[0])}${p[1] !== undefined ? `<small> = ${esc(p[1])}</small>` : ''}</span>`).join('');
    const params = st.params.map((p, i) => `<div class="prm" data-prm="${esc(p.name)}"><span class="prm__name" draggable="${!locked()}" data-param="${esc(p.name)}" data-placed="1">${esc(p.name)}:</span>${slotHtml('p:' + p.name, p.types)}`
      + (poolOf(b, p.name)[1] !== undefined ? `<span>= ${esc(poolOf(b, p.name)[1])}</span>` : '')
      + (locked() ? '' : `<span class="prm__tools">${i ? `<button type="button" data-pup="${esc(p.name)}" title="Выше" aria-label="Поднять выше">↑</button>` : ''}<button type="button" data-premove="${esc(p.name)}" title="Вернуть в набор" aria-label="Вернуть в набор">×</button></span>`)
      + '</div>').join('');
    const left = BUILD.filter(x => !buildTouched(x)).length;

    return `<div class="pills" aria-label="Заявки">${pills}</div>`
      + `<article class="card"><div class="card__head"><span>Заявка <b>${cur + 1}</b> из ${BUILD.length}</span><span>${esc(b.client)}</span></div>`
      + `<div class="card__body"><p class="card__task">${esc(b.request)}</p></div></article>`
      + '<div class="builder"><div>'
      + `<span class="lbl">Данные из заявки</span><div class="tray" data-zone="param-tray">${pool || '<span class="zone__empty">Все данные перенесены в подпись</span>'}</div>`
      + '<p class="note">Нажмите на имя или перетащите его в подпись. Тип: нажмите на тип справа, затем на слот — или перетащите тип в слот. Второй тип в том же слоте даёт запись через |.</p>'
      + `<span class="lbl">Подпись функции</span><div class="sig"><div class="sig__line"><span class="sig__kw">def</span> <span class="sig__fn">${esc(b.fn)}</span>(</div>`
      + `<div class="sig__params" data-zone="params">${params || '<span class="zone__empty">Положите сюда параметры</span>'}</div>`
      + `<div class="sig__line">) -&gt; ${slotHtml('ret', st.ret)} :</div></div>`
      + `<div class="preview"><span class="lbl">Строка, которая получилась</span><pre class="q">${esc(sigText(b))}</pre>${readingHtml(b)}</div>`
      + '</div><div class="builder__side"><span class="lbl">Каталог типов</span><div class="catalog">'
      + CATALOG.map(([g, list]) => `<div class="catalog__group"><b>${esc(g)}</b>${list.map(t => tchip(t, '')).join('')}</div>`).join('')
      + '</div></div></div>'
      + nextHtml(2, left ? `${left} из ${BUILD.length} заявок без подписи` : '');
  };

  const addParam = (b, name, beforeName) => {
    const st = bs(b);
    let p = st.params.find(x => x.name === name);
    st.params = st.params.filter(x => x.name !== name);
    p = p || { name, types: [] };
    const at = beforeName ? st.params.findIndex(x => x.name === beforeName) : -1;
    if (at >= 0) st.params.splice(at, 0, p); else st.params.push(p);
  };
  const slotList = (b, key) => (key === 'ret' ? bs(b).ret : (bs(b).params.find(p => 'p:' + p.name === key) || {}).types);
  const addType = (b, key, t) => {
    const list = slotList(b, key);
    if (list && !list.includes(t)) list.push(t);
  };
  const removeType = (b, key, t) => {
    const list = slotList(b, key);
    if (list) list.splice(list.indexOf(t), 1);
  };

  /* ── 5. Письмо 3: вызовы и подпись ─────────────────────────────── */
  const ss = s => (state.sieve[s.id] = state.sieve[s.id] || { place: {} });
  const cardTruth = c => (c.ok ? 'in' : 'out');
  const sieveRight = s => s.cards.filter((c, i) => ss(s).place[i] === cardTruth(c)).length;
  const SIEVE_TOTAL = SIEVE.reduce((n, s) => n + s.cards.length, 0);
  /* Порядок карточек в раунде — не по эталону: верные и неверные вперемешку. */
  const MIX = [3, 0, 6, 2, 7, 4, 1, 5];

  const sieveView = () => {
    const cur = Math.min(state.sieveCur, SIEVE.length - 1);
    const s = SIEVE[cur];
    const filled = x => x.cards.every((c, i) => ss(x).place[i]);
    const pills = SIEVE.map((x, i) => `<button type="button" data-scur="${i}" aria-current="${i === cur}" class="${filled(x) ? 'is-ok' : ''}">${i + 1}</button>`).join('');
    const items = MIX.filter(i => i < s.cards.length).map(i => ({ id: String(i), body: s.cards[i].code }));
    const left = SIEVE.reduce((n, x) => n + x.cards.filter((c, i) => !ss(x).place[i]).length, 0);
    return `<div class="pills" aria-label="Подписи">${pills}</div>`
      + `<article class="card"><div class="card__head"><span>Подпись <b>${cur + 1}</b> из ${SIEVE.length}</span><span>8 строк</span></div>`
      + `<div class="card__body"><span class="lbl">Подпись</span><pre class="q">${esc(s.sig)}\n    ...</pre>`
      + (s.setup ? `<span class="lbl">Перед вызовами в коде записано</span><pre class="q">${esc(s.setup)}</pre>` : '') + '</div></article>'
      + binsHtml(items, ss(s).place, { long: ['Подходит к подписи', 'Не подходит'], short: ['подходит', 'не подходит'] })
      + nextHtml(3, left ? `${left} из ${SIEVE_TOTAL} строк не разложены` : '');
  };

  /* ── 6. Письмо 4: подпись вручную ──────────────────────────────── */
  const ws = w => (state.write[w.id] = state.write[w.id] || { text: '', hint: false });

  /* Сравнение с эталоном: имя, параметры по порядку, типы, умолчания, результат. */
  const writeCheck = w => {
    const text = ws(w).text.trim();
    if (!text) return { ok: false, notes: ['подпись не написана'] };
    let got;
    try { got = S.parseDef(text); } catch (e) { return { ok: false, notes: ['ошибка записи: ' + e.message] }; }
    const want = S.parseDef(w.answer);
    const notes = [];
    if (got.name !== want.name) notes.push(`имя функции ${got.name}, а в заявке ${want.name}`);
    if (got.params.map(p => p.name).join() !== want.params.map(p => p.name).join()) {
      notes.push(`параметры: ${got.params.map(p => p.name).join(', ') || 'нет'}, а нужны ${want.params.map(p => p.name).join(', ')}`);
    } else {
      want.params.forEach((p, i) => {
        const g = got.params[i];
        if (S.canon(g.type) !== S.canon(p.type)) notes.push(`${p.name}: ${g.type ? S.canon(g.type) : 'тип не указан'}, а нужен ${S.canon(p.type)}`);
        if ((g.def || '') !== (p.def || '')) notes.push(`${p.name}: значение по умолчанию ${g.def || 'не указано'}, а нужно ${p.def || 'без него'}`);
      });
    }
    if (S.canon(got.ret) !== S.canon(want.ret)) notes.push(`результат: ${got.ret ? S.canon(got.ret) : 'тип не указан'}, а нужен ${S.canon(want.ret)}`);
    return { ok: !notes.length, notes };
  };

  /* Под полем — как Python прочитает строку. Это не оценка: только разбор записи. */
  const liveHtml = w => {
    const text = ws(w).text;
    if (!text.trim()) return '<p class="note">Под полем появится разбор строки.</p>';
    try {
      const d = S.parseDef(text);
      const items = d.params.map(p => `<li><code>${esc(p.name)}</code> — ${esc(p.type ? S.read(p.type) : 'тип не указан')}${p.def ? `; если не передать — <code>${esc(p.def)}</code>` : ''}</li>`);
      items.push(`<li>результат — ${esc(d.ret ? S.read(d.ret) : 'тип не указан')}</li>`);
      return `<div class="reading"><b>Функция ${esc(d.name)}</b><ul>${items.join('')}</ul></div>`;
    } catch (e) {
      const raw = text.trim();
      const lead = text.length - text.trimStart().length;
      const pos = Math.max(0, Math.min(raw.length, (e.pos || 0) - (e.pos ? lead : 0)));
      return `<div class="warn warn--err">${esc(raw)}\n${' '.repeat(pos)}^\n${esc(e.message)}</div>`.replace(/\n/g, '<br>').replace(/ {2}/g, ' &nbsp;');
    }
  };

  const writeView = () => {
    const cards = WRITE.map((w, i) => {
      const st = ws(w);
      return `<article class="card" data-write="${w.id}"><div class="card__head"><span>Заявка <b>${i + 1}</b> из ${WRITE.length}</span><span>${esc(w.client)}</span></div>`
        + `<div class="card__body"><p class="card__task">${esc(w.task)}</p>`
        + `<div class="field"><label for="w-${w.id}">Подпись функции</label><input id="w-${w.id}" class="code" data-wtext spellcheck="false" autocomplete="off"${dis()} placeholder="def имя(параметр: тип) -> тип:" value="${esc(st.text)}"></div>`
        + `<div data-live>${liveHtml(w)}</div>`
        + `<div class="row"><button type="button" class="btn btn--ghost btn--small" data-act="hint">${st.hint ? 'Скрыть подсказку' : 'Подсказка'}</button></div>`
        + (st.hint ? `<div class="why"><b>Подсказка</b>${esc(w.hint)}</div>` : '') + '</div></article>';
    }).join('');
    const left = WRITE.filter(w => !ws(w).text.trim()).length;
    return cards + nextHtml(4, left ? `${left} из ${WRITE.length} подписей не написаны` : '');
  };

  /* ── 7. Оценка и рецензия ─────────────────────────────────────── */
  const scores = () => {
    const e = envGot();
    const b = BUILD.filter(buildSolved).length;
    const s = SIEVE.reduce((n, x) => n + sieveRight(x), 0);
    const w = WRITE.filter(x => writeCheck(x).ok).length;
    const parts = [
      { name: 'Письмо 1 · рабочее место', got: e, of: envTotal, pts: e >= 16 ? 2 : e >= 11 ? 1 : 0, max: 2, unit: 'ответов верно' },
      { name: 'Письмо 2 · подписи по заявкам', got: b, of: BUILD.length, pts: b >= 9 ? 4 : b >= 7 ? 3 : b >= 5 ? 2 : b >= 3 ? 1 : 0, max: 4, unit: 'подписей верно' },
      { name: 'Письмо 3 · вызовы и подпись', got: s, of: SIEVE_TOTAL, pts: s >= 36 ? 2 : s >= 28 ? 1 : 0, max: 2, unit: 'строк разложено верно' },
      { name: 'Письмо 4 · подпись вручную', got: w, of: WRITE.length, pts: w === 4 ? 2 : w >= 2 ? 1 : 0, max: 2, unit: 'подписей верно' },
    ];
    const total = parts.reduce((n, p) => n + p.pts, 0);
    const grade = total >= 9 ? 'отлично' : total >= 7 ? 'хорошо' : total >= 5 ? 'удовлетворительно' : 'неудовлетворительно';
    return { parts, total, grade };
  };

  /* Что повторить: по видам ошибок, без пересказа заданий. */
  const advice = () => {
    const out = [];
    const nums = list => list.join(', ');
    const envBad = [];
    if (!orderRight()) envBad.push('порядок создания окружения и установки (глава 2.1, 2.3)');
    if (filesRight() < FILES.cards.length) envBad.push('что попадает в Git и зачем нужен .gitignore (глава 2.6)');
    const chatWrong = CHAT.filter(c => state.chat[c.id] !== c.cause);
    if (chatWrong.length) envBad.push(`причины проблем с окружением — вопросы ${nums(chatWrong.map(c => CHAT.indexOf(c) + 1))}`);
    out.push(envBad.length ? `Рабочее место: повторите ${envBad.join('; ')}.` : 'Рабочее место: все ответы верны.');

    const bad = BUILD.filter(b => !buildSolved(b));
    if (bad.length) {
      const topics = new Set();
      bad.forEach(b => {
        const st = bs(b);
        if (st.params.some(p => !b.params.find(x => x[0] === p.name))) topics.add('какие данные нужны функции, а какие нет');
        if (b.params.some(p => !st.params.find(x => x.name === p[0]))) topics.add('какие данные нужны функции, а какие нет');
        if ([...b.params.map(p => p[1]), b.ret].some(t => t.includes('|'))) topics.add('запись X | None и объединение int | str (глава 4.2, §4–5)');
        if ([...b.params.map(p => p[1]), b.ret].some(t => /dict|tuple/.test(t))) topics.add('словари и кортежи в аннотациях (глава 4.2, §2)');
        if (b.ret === 'None') topics.add('-> None у функции без результата (глава 4.2, §1)');
        if (orderError(b)) topics.add('порядок параметров со значением по умолчанию (глава 4.1, §3)');
      });
      out.push(`Подписи по заявкам: ${bad.length === 1 ? 'не решена заявка' : 'не решены заявки'} ${nums(bad.map(b => BUILD.indexOf(b) + 1))}. Повторите: ${[...topics].join('; ') || 'простые типы (глава 4.2, §1)'}.`);
    } else out.push('Подписи по заявкам: все подписи верны.');

    const weak = SIEVE.filter(s => sieveRight(s) < s.cards.length);
    out.push(weak.length ? `Вызовы и подпись: ошибки в ${weak.length === 1 ? 'подписи' : 'подписях'} ${nums(weak.map(s => SIEVE.indexOf(s) + 1))}. Прочитайте разбор под каждой.` : 'Вызовы и подпись: все строки разложены верно.');
    const wbad = WRITE.filter(w => !writeCheck(w).ok);
    out.push(wbad.length ? `Подпись вручную: ${wbad.length === 1 ? 'не решена заявка' : 'не решены заявки'} ${nums(wbad.map(w => WRITE.indexOf(w) + 1))}.` : 'Подпись вручную: все подписи верны.');
    return out;
  };

  const okMark = ok => (ok ? '✓' : '✗');

  const recenzia = () => {
    const sc = scores();
    let h = `<article class="card"><div class="card__head"><span>Рецензия за неделю</span><span>${esc(student.name || 'без имени')}</span></div><div class="card__body">`
      + `<p class="card__task">От: <b>${esc(FROM)}</b></p>`
      + `<ul class="progress">${sc.parts.map(p => `<li><span>${p.name}: ${p.got} из ${p.of} — ${p.unit}</span><span>${p.pts} / ${p.max}</span></li>`).join('')}`
      + `<li><span><b>Итого</b></span><span>${sc.total} / 10 · ${sc.grade}</span></li></ul>`
      + `<ul>${advice().map(a => `<li>${esc(a)}</li>`).join('')}</ul></div></article>`;

    /* Письмо 1 */
    h += '<h3>Письмо 1. Рабочее место</h3>';
    const oOk = orderRight();
    h += `<article class="card ${oOk ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Порядок команд · ${oOk ? 'верно' : 'неверно'}</span><span>часть 1</span></div><div class="card__body">`
      + `<span class="lbl">Ваш порядок</span><pre class="q">${esc(state.order.map((id, i) => `${i + 1}. ${stepOf(id).text}`).join('\n') || 'шаги не разложены')}</pre>`
      + `<div class="why${oOk ? '' : ' why--bad'}"><b>Верный порядок</b>${esc(ORDER.why)}<pre>${esc(ORDER.steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n'))}</pre></div>`
      + ORDER.extra.map(x => `<p class="note"><b>${esc(x.text)}</b> — лишний шаг${state.order.includes(x.id) ? ' (был в вашем списке)' : ''}. ${esc(x.why)}</p>`).join('')
      + '</div></article>';

    const fr = filesRight();
    h += `<article class="card ${fr === FILES.cards.length ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Первый коммит · верно ${fr} из ${FILES.cards.length}</span><span>часть 2</span></div><div class="card__body">`
      + '<table class="cmp"><thead><tr><th>Файл</th><th>Куда</th><th>Почему</th><th></th></tr></thead><tbody>'
      + FILES.cards.map(f => {
        const ok = state.files[f.id] === FILE_PLACE[f.where];
        return `<tr class="${ok ? 'is-ok' : 'is-bad'}"><td><code>${esc(f.name)}</code></td><td>${f.where === 'repo' ? 'в репозиторий' : 'на компьютере'}</td><td>${esc(f.why)}</td><td>${okMark(ok)}</td></tr>`;
      }).join('') + '</tbody></table></div></article>';

    CHAT.forEach((c, i) => {
      const ok = state.chat[c.id] === c.cause;
      h += `<article class="card ${ok ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Вопрос <b>${i + 1}</b> · ${esc(c.who)} · ${ok ? 'верно' : 'неверно'}</span><span>часть 3</span></div><div class="card__body">`
        + `<p class="claim">${esc(c.text)}</p><pre class="term">${esc(c.term)}</pre>`
        + `<p class="note">Ваш ответ: ${esc(state.chat[c.id] ? causeText(state.chat[c.id]) : 'не выбран')}.</p>`
        + `<div class="why${ok ? '' : ' why--bad'}"><b>${esc(causeText(c.cause))}</b>${esc(c.why)}</div></div></article>`;
    });

    /* Письмо 2 */
    h += '<h3>Письмо 2. Подписи по заявкам</h3>';
    BUILD.forEach((b, i) => {
      const ok = buildSolved(b), st = bs(b);
      const rows = b.params.map(([name, type, def]) => {
        const p = st.params.find(x => x.name === name);
        const got = p ? (p.types.length ? joinTypes(p.types) : 'тип не выбран') : 'нет в подписи';
        const good = p && paramRight(b, p);
        return `<tr class="${good ? 'is-ok' : 'is-bad'}"><td><code>${esc(name)}</code></td><td><code>${esc(type)}${def !== undefined ? ' = ' + esc(def) : ''}</code></td><td><code>${esc(got)}</code></td><td>${okMark(good)}</td></tr>`;
      });
      st.params.filter(p => !b.params.find(x => x[0] === p.name)).forEach(p => rows.push(`<tr class="is-bad"><td><code>${esc(p.name)}</code></td><td>лишний: функции не нужен</td><td><code>${esc(joinTypes(p.types) || '—')}</code></td><td>✗</td></tr>`));
      const rOk = canonOf(st.ret) === S.canonText(b.ret);
      rows.push(`<tr class="${rOk ? 'is-ok' : 'is-bad'}"><td>результат</td><td><code>${esc(b.ret)}</code></td><td><code>${esc(joinTypes(st.ret) || 'тип не выбран')}</code></td><td>${okMark(rOk)}</td></tr>`);
      const err = orderError(b);
      h += `<article class="card ${ok ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Заявка <b>${i + 1}</b> · ${ok ? 'верно' : 'неверно'}</span><span>${esc(b.client)}</span></div><div class="card__body">`
        + `<p class="card__task">${esc(b.request)}</p><span class="lbl">Ваша подпись</span><pre class="q">${esc(sigText(b))}</pre>`
        + (err ? `<div class="warn warn--err">${esc(err)}</div>` : '')
        + `<table class="cmp"><thead><tr><th>Параметр</th><th>Нужно</th><th>У вас</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>`
        + `<div class="why${ok ? '' : ' why--bad'}"><b>Разбор</b>${esc(b.why)}<pre>${esc(refSig(b))}</pre></div></div></article>`;
    });

    /* Письмо 3 */
    h += '<h3>Письмо 3. Вызовы и подпись</h3>';
    SIEVE.forEach((s, i) => {
      const right = sieveRight(s), all = s.cards.length;
      const rows = s.cards.map((c, j) => {
        const mine = ss(s).place[j];
        const good = mine === cardTruth(c);
        return `<tr class="${good ? 'is-ok' : 'is-bad'}"><td><code>${esc(c.code)}</code></td><td>${c.ok ? 'подходит' : 'не подходит'}</td><td>${mine ? (mine === 'in' ? 'подходит' : 'не подходит') : 'не разложена'}</td><td>${okMark(good)}</td></tr>`;
      }).join('');
      h += `<article class="card ${right === all ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Подпись <b>${i + 1}</b> · верно ${right} из ${all}</span><span>8 строк</span></div><div class="card__body">`
        + `<pre class="q">${esc(s.sig)}${s.setup ? '\n\n' + esc(s.setup) : ''}</pre>`
        + `<table class="cmp"><thead><tr><th>Строка</th><th>Верно</th><th>У вас</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
        + `<div class="why${right === all ? '' : ' why--bad'}"><b>Почему так</b>${esc(s.why)}</div></div></article>`;
    });

    /* Письмо 4 */
    h += '<h3>Письмо 4. Подпись вручную</h3>';
    WRITE.forEach((w, i) => {
      const r = writeCheck(w);
      h += `<article class="card ${r.ok ? 'card--ok' : 'card--bad'}"><div class="card__head"><span>Заявка <b>${i + 1}</b> · ${r.ok ? 'верно' : 'неверно'}</span><span>${esc(w.client)}</span></div><div class="card__body">`
        + `<p class="card__task">${esc(w.task)}</p><span class="lbl">Ваша подпись</span><pre class="q">${esc(ws(w).text.trim() || '—')}</pre>`
        + (r.ok ? '' : `<ul class="note">${r.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`)
        + `<div class="why${r.ok ? '' : ' why--bad'}"><b>Верная подпись</b><pre>${esc(w.answer)}</pre></div></div></article>`;
    });
    return h;
  };

  const refSig = b => `def ${b.fn}(${b.params.map(([n, t, d]) => `${n}: ${t}${d !== undefined ? ' = ' + d : ''}`).join(', ')}) -> ${b.ret}:`;

  const submit = () => {
    const left = (state.order.length ? 0 : 1) + FILES.cards.filter(f => !state.files[f.id]).length + CHAT.filter(c => !state.chat[c.id]).length
      + BUILD.filter(b => !buildTouched(b)).length + SIEVE.reduce((n, x) => n + x.cards.filter((c, i) => !ss(x).place[i]).length, 0)
      + WRITE.filter(w => !ws(w).text.trim()).length;
    const msg = (left ? `Не заполнено ответов: ${left}. Они будут засчитаны как неверные.\n\n` : '')
      + 'После сдачи ответы изменить нельзя. Сдать работу?';
    if (!confirm(msg)) return;
    state.submitted = true;
    state.submittedAt = new Date().toISOString();
    state.open = 5;
    save();
    go(5);
  };

  /* ── 8. Отчёт и сброс ─────────────────────────────────────────── */
  const reportMd = () => {
    const sc = scores();
    const md = ['# Практикум «Младший разработчик: первая неделя»', '',
      'МДК.01.01 · аннотации типов и окружение проекта', '',
      `- Студент: ${student.name.trim() || '—'}`, `- Группа: ${student.group.trim() || '—'}`,
      `- Сдано: ${state.submittedAt ? new Date(state.submittedAt).toLocaleString('ru-RU') : 'не сдано'}`, '',
      '## Рецензия', '', '| Письмо | Результат | Баллы |', '|---|---|---|',
      ...sc.parts.map(p => `| ${p.name} | ${p.got} из ${p.of} | ${p.pts} / ${p.max} |`),
      `| **Итого** | | **${sc.total} / 10 · ${sc.grade}** |`, '', ...advice().map(a => `- ${a}`), '',
      '## Письмо 1. Рабочее место', '', `### Порядок команд — ${orderRight() ? 'верно' : 'неверно'}`, ''];
    state.order.forEach((id, i) => md.push(`${i + 1}. \`${stepOf(id).text}\``));
    if (!state.order.length) md.push('Шаги не разложены.');
    md.push('', `### Первый коммит — верно ${filesRight()} из ${FILES.cards.length}`, '', '| Файл | Ваш ответ | Верно |', '|---|---|---|');
    FILES.cards.forEach(f => {
      const mine = state.files[f.id];
      md.push(`| \`${f.name}\` | ${mine ? (mine === 'in' ? 'в репозиторий' : 'на компьютере') : '—'} | ${mine === FILE_PLACE[f.where] ? '✓' : '✗'} |`);
    });
    md.push('', `### Вопросы из чата — верно ${chatRight()} из ${CHAT.length}`, '', '| Вопрос | Ваша причина | Верно |', '|---|---|---|');
    CHAT.forEach((c, i) => md.push(`| ${i + 1}. ${c.who} | ${state.chat[c.id] ? causeText(state.chat[c.id]) : '—'} | ${state.chat[c.id] === c.cause ? '✓' : '✗'} |`));
    md.push('', '## Письмо 2. Подписи по заявкам', '');
    BUILD.forEach((b, i) => md.push(`### ${i + 1}. ${b.client} — ${buildSolved(b) ? 'верно' : 'неверно'}`, '', '```python', sigText(b), '```', ''));
    md.push('## Письмо 3. Вызовы и подпись', '', '| Подпись | Верно |', '|---|---|');
    SIEVE.forEach(s => md.push(`| \`${s.sig.replace(/\|/g, '\\|')}\` | ${sieveRight(s)} из ${s.cards.length} |`));
    md.push('', '## Письмо 4. Подпись вручную', '');
    WRITE.forEach((w, i) => {
      const r = writeCheck(w);
      md.push(`### ${i + 1}. ${w.client} — ${r.ok ? 'верно' : 'неверно'}`, '', '```python', ws(w).text.trim() || '# не написана', '```', '');
      if (!r.ok) r.notes.forEach(n => md.push(`- ${n}`));
      if (!r.ok) md.push('');
    });
    return md.join('\n');
  };

  const reportForm = () => {
    const ready = student.name.trim() && student.group.trim();
    return '<div class="task"><b>Что сдать</b>Файл отчёта .md: баллы, рецензия и все ваши ответы. Он кладётся в папку lesson_05 личного репозитория дисциплины.</div>'
      + `<div class="field"><label for="st-name">Фамилия и имя</label><input id="st-name" data-student="name" value="${esc(student.name)}" autocomplete="name"></div>`
      + `<div class="field"><label for="st-group">Группа</label><input id="st-group" data-student="group" value="${esc(student.group)}"></div>`
      + `<div class="row"><button type="button" class="btn" data-act="download"${ready ? '' : ' disabled'}>Скачать отчёт .md</button></div>`
      + `<p class="note" id="dl-note">${ready ? `Файл: ${esc(fileName())}` : 'Кнопка станет доступна, когда заполнены фамилия, имя и группа.'}</p>`
      + '<div class="letter"><div class="letter__head"><span class="letter__subject">Как сдать в GitHub</span></div><div class="letter__body"><ol style="margin:0 0 10px;padding-left:20px">'
      + '<li>В личном репозитории дисциплины создайте папку <code>lesson_05</code>.</li>'
      + '<li>Положите в неё скачанный файл отчёта, имя не меняйте.</li>'
      + '<li>В терминале в корне репозитория: <code>git add lesson_05</code>, затем <code>git commit -m "Practicum lesson 05"</code> и <code>git push</code>.</li>'
      + '<li>Откройте файл на GitHub: таблицы и код в нём показываются оформленными. Пришлите преподавателю ссылку на папку <code>lesson_05</code>.</li>'
      + '</ol></div></div>'
      + '<p class="note">Работа хранится только в этом браузере. Перед сменой компьютера скачайте отчёт.</p>';
  };
  const fileName = () => `podpisi_${(student.name || 'student').trim().replace(/\s+/g, '_').replace(/[^\p{L}\p{N}_-]/gu, '')}.md`;

  /* Сброс — только преподавателем. Хеш и приставка — те же, что у практикума
     MongoDB «Аналитик данных», поэтому пароль у них общий. */
  const RESET_HASH = 'd8e6d5a33bc8e95ed9a2505ccb9c0087102dc21bb8f02f87ef12e32fef4d9ba9';
  const sha256 = async text => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  const resetByTeacher = async () => {
    const pw = prompt('Сброс стирает все ответы и рецензию в этом браузере.\nПароль преподавателя:');
    if (pw === null) return;
    let ok = false;
    try { ok = (await sha256('mongodb-analitik:' + pw.trim().toLowerCase())) === RESET_HASH; }
    catch (_) { alert('Браузер не поддерживает проверку пароля. Откройте страницу по адресу https://…'); return; }
    if (!ok) { alert('Пароль неверный. Работа не сброшена.'); return; }
    state = blank();
    save();
    go(1);
    alert('Работа сброшена.');
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([reportMd()], { type: 'text/markdown;charset=utf-8' }));
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* ── 9. Вкладки, отрисовка, события ───────────────────────────── */
  const TABS = [[1, 'Письмо 1'], [2, 'Письмо 2'], [3, 'Письмо 3'], [4, 'Письмо 4'], [5, 'Рецензия']];
  const isOpen = t => (t === 5 ? state.submitted : t <= state.open);

  const draw = () => {
    $('#tabs').innerHTML = TABS.map(([t, n]) => `<button type="button" role="tab" data-tab="${t}" aria-selected="${tab === t}"${isOpen(t) ? '' : ' disabled'}>${n}</button>`).join('');
    $('#steps').innerHTML = [['Окружение', 1], ['Подписи', 2], ['Вызовы', 3], ['Вручную', 4], ['Рецензия', 5]].map(([n, t]) =>
      `<li class="${state.submitted || t < state.open ? 'is-done' : isOpen(t) ? 'is-open' : ''}">${t} · ${n}</li>`).join('');
    const scrollY = $('#work').parentElement.scrollTop;
    if (tab === 5) {
      $('#mail').innerHTML = reportForm();
      $('#work').innerHTML = recenzia();
    } else {
      $('#mail').innerHTML = letterHtml(tab);
      $('#work').innerHTML = [envView, buildView, sieveView, writeView][tab - 1]();
    }
    $('#work').parentElement.scrollTop = scrollY;
  };

  const go = t => {
    tab = t;
    picked = null;
    draw();
    $('#work').parentElement.scrollTop = 0;
    $('#mail').parentElement.scrollTop = 0;
  };

  /* Куда кладётся карточка в колонках: файлы письма 1 или строки письма 3. */
  const placeCard = (card, where) => {
    const id = card.dataset.doc;
    const place = tab === 1 ? state.files : ss(SIEVE[state.sieveCur]).place;
    if (where === 'pool') delete place[id]; else place[id] = where;
  };

  const bind = () => {
    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (b && !b.disabled) go(+b.dataset.tab);
    });

    const work = $('#work');
    work.addEventListener('click', e => {
      const t = e.target;
      const next = t.closest('[data-next]');
      if (next) { state.open = Math.max(state.open, +next.dataset.next); save(); go(+next.dataset.next); return; }
      const act = t.closest('[data-act]');
      if (act) {
        if (act.dataset.act === 'submit') return submit();
        const wcard = t.closest('[data-write]');
        if (act.dataset.act === 'hint' && wcard) { const st = ws(WRITE.find(x => x.id === wcard.dataset.write)); st.hint = !st.hint; save(); draw(); return; }
      }
      const bcur = t.closest('[data-bcur]');
      if (bcur) { state.buildCur = +bcur.dataset.bcur; picked = null; save(); draw(); return; }
      const scur = t.closest('[data-scur]');
      if (scur) { state.sieveCur = +scur.dataset.scur; save(); draw(); return; }
      if (locked()) return;

      /* Письмо 1: шаги и колонки */
      const un = t.closest('[data-unstep]');
      if (un) { state.order = state.order.filter(x => x !== un.dataset.unstep); save(); draw(); return; }
      const up = t.closest('[data-upstep]');
      if (up) {
        const i = state.order.indexOf(up.dataset.upstep);
        if (i > 0) [state.order[i - 1], state.order[i]] = [state.order[i], state.order[i - 1]];
        save(); draw(); return;
      }
      const step = t.closest('[data-step]');
      if (step && !step.dataset.placed) { addStep(step.dataset.step); save(); draw(); return; }
      const put = t.closest('[data-put]');
      if (put) { placeCard(put.closest('[data-doc]'), put.dataset.put); save(); draw(); return; }

      /* Письмо 2: параметры и типы */
      if (tab === 2) {
        const b = BUILD[state.buildCur];
        const untype = t.closest('[data-untype]');
        if (untype) { removeType(b, untype.dataset.from, untype.dataset.untype); save(); draw(); return; }
        const prem = t.closest('[data-premove]');
        if (prem) { bs(b).params = bs(b).params.filter(p => p.name !== prem.dataset.premove); save(); draw(); return; }
        const pup = t.closest('[data-pup]');
        if (pup) {
          const ps = bs(b).params, i = ps.findIndex(p => p.name === pup.dataset.pup);
          if (i > 0) [ps[i - 1], ps[i]] = [ps[i], ps[i - 1]];
          save(); draw(); return;
        }
        const slot = t.closest('[data-slot]');
        const chipInCatalog = t.closest('.catalog [data-type]');
        if (chipInCatalog) {
          const id = chipInCatalog.dataset.type;
          picked = picked && picked.id === id ? null : { kind: 'type', id };
          draw(); return;
        }
        if (slot && picked) { addType(b, slot.dataset.slot, picked.id); picked = null; save(); draw(); return; }
        const pchip = t.closest('.tray [data-param]');
        if (pchip) { addParam(b, pchip.dataset.param); save(); draw(); return; }
      }
    });

    work.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.blk, .pchip, .tchip, .slot')) { e.preventDefault(); e.target.click(); }
    });

    work.addEventListener('change', e => {
      if (locked() || !e.target.matches('[data-cause]')) return;
      state.chat[e.target.closest('[data-chat]').dataset.chat] = e.target.value;
      save();
      draw();
    });

    /* Ввод подписи: перерисовывается только разбор под полем, чтобы не терять курсор. */
    work.addEventListener('input', e => {
      if (locked() || !e.target.matches('[data-wtext]')) return;
      const card = e.target.closest('[data-write]');
      const w = WRITE.find(x => x.id === card.dataset.write);
      ws(w).text = e.target.value;
      save();
      card.querySelector('[data-live]').innerHTML = liveHtml(w);
    });

    /* Перетаскивание. Данные: step:id, doc:id, param:name, type:текст. */
    work.addEventListener('dragstart', e => {
      if (locked()) { e.preventDefault(); return; }
      const el = e.target.closest('[data-step], [data-doc], [data-param], [data-type]');
      if (!el) return;
      let v = '';
      if (el.dataset.step) v = 'step:' + el.dataset.step;
      else if (el.dataset.doc) v = 'doc:' + el.dataset.doc;
      else if (el.dataset.param) v = 'param:' + el.dataset.param;
      else if (el.dataset.type) v = 'type:' + el.dataset.type + (el.closest('[data-slot]') ? '@' + el.closest('[data-slot]').dataset.slot : '');
      e.dataTransfer.setData('text/pd', v);
      e.dataTransfer.effectAllowed = 'move';
      e.stopPropagation();
    });
    const targetOf = (e, kind) => {
      if (kind === 'step') return e.target.closest('[data-zone="steps"], [data-zone="steps-tray"]');
      if (kind === 'doc') return e.target.closest('[data-bin]');
      if (kind === 'param') return e.target.closest('[data-zone="params"], [data-zone="param-tray"]');
      if (kind === 'type') return e.target.closest('[data-slot]');
      return null;
    };
    work.addEventListener('dragover', e => {
      if (locked() || !e.dataTransfer.types.includes('text/pd')) return;
      const z = e.target.closest('[data-zone], [data-bin], [data-slot]');
      if (!z) return;
      e.preventDefault();
      work.querySelectorAll('.is-over').forEach(x => x.classList.remove('is-over'));
      z.classList.add('is-over');
    });
    work.addEventListener('dragleave', e => {
      const z = e.target.closest('[data-zone], [data-bin], [data-slot]');
      if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over');
    });
    work.addEventListener('drop', e => {
      if (locked()) return;
      const raw = e.dataTransfer.getData('text/pd');
      if (!raw) return;
      const kind = raw.slice(0, raw.indexOf(':')), val = raw.slice(raw.indexOf(':') + 1);
      const z = targetOf(e, kind);
      if (!z) return;
      e.preventDefault();
      if (kind === 'step') {
        if (z.dataset.zone === 'steps-tray') state.order = state.order.filter(x => x !== val);
        else {
          const before = e.target.closest('[data-step][data-placed]');
          addStep(val, before && before.dataset.step !== val ? before.dataset.step : null);
        }
      }
      if (kind === 'doc') placeCard({ dataset: { doc: val } }, z.dataset.bin);
      if (kind === 'param') {
        const b = BUILD[state.buildCur];
        if (z.dataset.zone === 'param-tray') bs(b).params = bs(b).params.filter(p => p.name !== val);
        else {
          const before = e.target.closest('[data-prm]');
          addParam(b, val, before && before.dataset.prm !== val ? before.dataset.prm : null);
        }
      }
      if (kind === 'type') {
        const b = BUILD[state.buildCur];
        const [t, from] = val.split('@');
        if (from && from !== z.dataset.slot) removeType(b, from, t);
        addType(b, z.dataset.slot, t);
        picked = null;
      }
      save(); draw();
    });
    /* Тип, вынесенный из слота за его пределы, убирается из слота. */
    work.addEventListener('dragend', e => {
      const el = e.target.closest && e.target.closest('[data-slot] [data-type]');
      if (!el || locked() || e.dataTransfer.dropEffect !== 'none' || tab !== 2) return;
      removeType(BUILD[state.buildCur], el.closest('[data-slot]').dataset.slot, el.dataset.type);
      save(); draw();
    });

    const mail = $('#mail');
    mail.addEventListener('input', e => {
      if (!e.target.dataset.student) return;
      student[e.target.dataset.student] = e.target.value;
      saveStudent();
      const ready = student.name.trim() && student.group.trim();
      const btn = mail.querySelector('[data-act="download"]');
      if (btn) btn.disabled = !ready;
      const note = $('#dl-note');
      if (note) note.textContent = ready ? `Файл: ${fileName()}` : 'Кнопка станет доступна, когда заполнены фамилия, имя и группа.';
      const head = $('#work .card__head span:last-child');
      if (head) head.textContent = student.name || 'без имени';
    });
    mail.addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (a && a.dataset.act === 'download' && !a.disabled) download();
    });
    $('#reset').addEventListener('click', resetByTeacher);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && picked) { picked = null; draw(); } });
  };

  bind();
  draw();
})();
