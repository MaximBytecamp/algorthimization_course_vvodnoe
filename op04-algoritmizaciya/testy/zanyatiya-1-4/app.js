/* Тест ОП.04 по занятиям 1, 3, 4. Одна попытка, 60 минут, разбор после отправки.

   Состояние живёт в localStorage этого браузера:
     op04-test-z134-r2:state  — идёт попытка (ФИО, порядок, ответы, дедлайн, уходы)
     op04-test-z134-r2:result — попытка завершена, оценка и ответы зафиксированы

   Пока лежит result, тест больше не запускается: любое открытие ссылки
   показывает готовую оценку и разбор. Это защита в пределах браузера —
   преподаватель принимает только первый присланный код.

   Ответы хранятся в исходной нумерации вариантов и карточек, поэтому
   проверка не зависит от перемешивания.

   Виды заданий: single, multi, order, slots, sort, line, number. */

const KEY_STATE = QUIZ.id + ':state';
const KEY_RESULT = QUIZ.id + ':result';

const KIND = {
  single: 'выбор ответа', multi: 'несколько ответов', order: 'порядок',
  slots: 'подстановка', sort: 'по группам', line: 'строка кода', number: 'число'
};
const HINT = {
  multi: 'Несколько верных вариантов · балл только за полностью верный набор',
  order: 'Перетащите карточки или двигайте их стрелками · можно нажать карточку, затем ту, на чьё место её поставить',
  slots: 'Перетащите карточку в пропуск или нажмите карточку, затем пропуск · нажатие на заполненный пропуск очищает его',
  sort: 'Перетащите каждую карточку в группу или нажмите карточку, затем группу',
  line: 'Нажмите строку кода'
};

const $ = id => document.getElementById(id);
const screens = { start: $('screen-start'), quiz: $('screen-quiz'), result: $('screen-result') };

let state = null;   // { name, group, order, optOrder, answers, deadline, leaves, startedAt }
let tick = null;
let finishing = false;
let picked = null;  // выбранная нажатием карточка: { qid, index }

/* ---------- хранилище ---------- */

function load(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

function show(name) {
  Object.entries(screens).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
  $('timer').classList.toggle('hidden', name !== 'quiz');
  window.scrollTo(0, 0);
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  const rnd = new Uint32Array(n);
  crypto.getRandomValues(rnd);
  for (let i = n - 1; i > 0; i--) {
    const j = rnd[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function countOf(q) {
  return (q.options || q.items || q.chips || []).length;
}

/* ---------- запуск ---------- */

function init() {
  const done = load(KEY_RESULT);
  if (done) { renderResult(done, true); return; }

  const saved = load(KEY_STATE);
  if (saved && saved.answers && saved.order) {
    state = saved;
    if (Date.now() >= state.deadline) { finish(true); return; }
    startQuiz();
    return;
  }
  show('start');
}

$('btn-start').addEventListener('click', () => {
  const name = $('in-name').value.trim().replace(/\s+/g, ' ');
  const group = $('in-group').value.trim();
  const err = $('start-err');
  if (name.length < 3 || !name.includes(' ')) { err.textContent = 'Укажите фамилию и имя полностью — например, «Иванов Иван».'; return; }
  if (!group) { err.textContent = 'Укажите группу.'; return; }
  if (!confirm(`Начать тест? Пройти его заново будет нельзя, отсчёт ${QUIZ.minutes} минут пойдёт сразу.`)) return;
  err.textContent = '';

  const optOrder = {};
  QUIZ.questions.forEach(q => {
    const n = countOf(q);
    let perm = shuffled(n);
    // карточки для порядка не должны сразу стоять верно
    while (q.type === 'order' && perm.every((x, i) => x === i)) perm = shuffled(n);
    optOrder[q.id] = perm;
  });
  state = {
    name, group,
    order: shuffled(QUIZ.questions.length), optOrder,
    answers: {}, leaves: 0, startedAt: Date.now(),
    deadline: Date.now() + QUIZ.minutes * 60000
  };
  if (!save(KEY_STATE, state)) {
    err.textContent = 'Браузер запретил сохранение данных сайта. Отключите приватный режим — иначе результат потеряется.';
    return;
  }
  startQuiz();
});

function startQuiz() {
  renderQuestions();
  show('quiz');
  updateLeaves();
  startTimer();
}

/* ---------- таймер ---------- */

function startTimer() {
  updateTimer();
  clearInterval(tick);
  tick = setInterval(updateTimer, 250);
}

function updateTimer() {
  const left = Math.max(0, state.deadline - Date.now());
  const el = $('timer');
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  el.textContent = `${m}:${String(s).padStart(2, '0')}`;
  el.classList.toggle('warn', left <= 180000 && left > 60000);
  el.classList.toggle('danger', left <= 60000);
  if (left === 0) { clearInterval(tick); finish(true); }
}

/* ---------- уход со вкладки ---------- */

let unloading = false;
window.addEventListener('pagehide', () => { unloading = true; });
window.addEventListener('pageshow', () => { unloading = false; });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden' || unloading || !state || finishing || load(KEY_RESULT)) return;
  state.leaves = (state.leaves || 0) + 1;
  save(KEY_STATE, state);
  updateLeaves();
});

function updateLeaves() {
  const note = $('leave-note');
  if (!state || !state.leaves) { note.classList.add('hidden'); return; }
  note.classList.remove('hidden');
  note.innerHTML = `<b>Вы уходили со вкладки теста: ${state.leaves}.</b> Это записано в код результата. Время при этом не останавливается.`;
}

['copy', 'cut', 'contextmenu', 'dragstart'].forEach(type => {
  $('questions').addEventListener(type, e => e.preventDefault());
});

/* ---------- общие части карточки ---------- */

function codeBlock(code, cls = '') {
  return `<figure class="q-code ${cls}"><figcaption><span>main.py</span><span>Python 3.12</span></figcaption><pre>${
    code.split('\n').map((line, i) => `<span class="ln" data-l="${i}">${esc(line) || ' '}</span>`).join('')}</pre></figure>`;
}

function imageBlock(img) {
  return img ? `<figure class="q-img">${img.svg}<figcaption>${esc(img.caption)}</figcaption></figure>` : '';
}

function questionHead(q, pos, extra = '') {
  return `<div class="q-head">
      <span class="q-num">ЗАДАНИЕ ${pos + 1} ИЗ ${QUIZ.questions.length}</span>
      <span class="q-kind">${KIND[q.type]}</span>${extra}
      <span class="q-topic">${esc(q.topic)}</span>
    </div>
    <p class="q-text">${q.text}</p>`;
}

/* ---------- перетаскивание ----------
   Pointer events работают и с мышью, и с пальцем. Короткое нажатие без
   движения считается нажатием: карточка выбирается, затем нажимают место. */

function draggable(el, card, { onDrop, onTap }) {
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button:not(.chip)') && e.target.closest('button') !== el) return;
    const sx = e.clientX, sy = e.clientY;
    let ghost = null, over = null;

    const targetAt = ev => {
      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
      const t = hit && hit.closest('[data-drop]');
      return t && card.contains(t) ? t : null;
    };
    const move = ev => {
      if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
        ghost = el.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.classList.remove('sel');
        ghost.style.width = el.getBoundingClientRect().width + 'px';
        document.body.appendChild(ghost);
        el.classList.add('dragging');
      }
      if (!ghost) return;
      ev.preventDefault();
      ghost.style.left = ev.clientX + 'px';
      ghost.style.top = ev.clientY + 'px';
      const t = targetAt(ev);
      if (t !== over) { if (over) over.classList.remove('over'); over = t; if (over) over.classList.add('over'); }
    };
    const end = (ev, cancelled) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      if (over) over.classList.remove('over');
      if (ghost) {
        ghost.remove();
        el.classList.remove('dragging');
        if (!cancelled) { const t = targetAt(ev); if (t) onDrop(t, ev); }
      } else if (!cancelled) {
        onTap();
      }
    };
    const up = ev => end(ev, false);
    const cancel = ev => end(ev, true);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  });
}

/* ---------- отрисовка заданий ---------- */

function renderQuestions() {
  const host = $('questions');
  host.innerHTML = '';
  $('context').innerHTML = QUIZ.context;

  state.order.forEach((qi, pos) => {
    const q = QUIZ.questions[qi];
    const card = document.createElement('div');
    card.className = 'q';
    card.id = 'card-' + q.id;
    card.innerHTML = questionHead(q, pos)
      + imageBlock(q.image)
      + (q.code && q.type !== 'line' ? codeBlock(q.code) : '')
      + (HINT[q.type] ? `<p class="q-hint">${HINT[q.type]}</p>` : '')
      + '<div class="body"></div>';
    host.appendChild(card);
    renderBody(q);
  });
  updateProgress();
}

function renderBody(q) {
  const card = $('card-' + q.id);
  const body = card.querySelector('.body');
  ({ single: bodyChoice, multi: bodyChoice, order: bodyOrder, slots: bodySlots, sort: bodySort, line: bodyLine, number: bodyNumber })[q.type](q, body, card);
}

function commit(q, value) {
  if (Date.now() >= state.deadline) { finish(true); return false; }
  if (value === null) delete state.answers[q.id];
  else state.answers[q.id] = value;
  save(KEY_STATE, state);
  $('card-' + q.id).classList.remove('unanswered');
  updateProgress();
  return true;
}

/* выбор одного или нескольких */
function bodyChoice(q, body) {
  const multi = q.type === 'multi';
  body.innerHTML = '<div class="opts"></div>';
  const opts = body.firstChild;
  state.optOrder[q.id].forEach(oi => {
    const label = document.createElement('label');
    label.className = 'opt';
    const on = (state.answers[q.id] || []).includes(oi);
    label.innerHTML = `<input type="${multi ? 'checkbox' : 'radio'}" name="${q.id}" ${on ? 'checked' : ''}><span>${q.options[oi]}</span>`;
    label.classList.toggle('picked', on);
    label.querySelector('input').addEventListener('change', () => {
      const cur = state.answers[q.id] || [];
      let next = multi ? (cur.includes(oi) ? cur.filter(x => x !== oi) : cur.concat(oi).sort((a, b) => a - b)) : [oi];
      if (!commit(q, next.length ? next : null)) return;
      opts.querySelectorAll('.opt').forEach(l => l.classList.toggle('picked', l.querySelector('input').checked));
    });
    opts.appendChild(label);
  });
}

/* порядок */
function bodyOrder(q, body, card) {
  const cur = state.answers[q.id] || state.optOrder[q.id];
  const moved = !!state.answers[q.id];
  body.innerHTML = `<ol class="ord">${cur.map((it, pos) => `
      <li class="ord-item ${picked && picked.qid === q.id && picked.index === it ? 'sel' : ''}" data-drop="ord" data-i="${it}">
        <span class="txt">${q.items[it]}</span>
        <span class="ord-btns">
          <button type="button" data-dir="-1" aria-label="выше" ${pos === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-dir="1" aria-label="ниже" ${pos === cur.length - 1 ? 'disabled' : ''}>↓</button>
        </span>
      </li>`).join('')}</ol>
    <p class="ord-moved">${moved ? '✓ порядок сохранён' : 'Порядок ещё не менялся — пока задание не выполнено'}</p>`;

  const place = (it, targetIt, after) => {
    const next = cur.filter(x => x !== it);
    let at = next.indexOf(targetIt);
    if (after) at += 1;
    next.splice(at, 0, it);
    picked = null;
    if (commit(q, next)) renderBody(q);
  };

  body.querySelectorAll('.ord-item').forEach(li => {
    const it = Number(li.dataset.i);
    li.querySelectorAll('.ord-btns button').forEach(btn => btn.addEventListener('click', () => {
      const pos = cur.indexOf(it), to = pos + Number(btn.dataset.dir);
      const next = [...cur];
      [next[pos], next[to]] = [next[to], next[pos]];
      picked = null;
      if (commit(q, next)) renderBody(q);
    }));
    draggable(li, card, {
      onDrop: (t, ev) => {
        const target = Number(t.dataset.i);
        if (target === it) { if (!state.answers[q.id] && commit(q, [...cur])) renderBody(q); return; }
        const r = t.getBoundingClientRect();
        place(it, target, ev.clientY > r.top + r.height / 2);
      },
      onTap: () => {
        if (picked && picked.qid === q.id && picked.index !== it) {
          const from = cur.indexOf(picked.index), to = cur.indexOf(it);
          place(picked.index, it, from < to);
        } else {
          picked = picked && picked.qid === q.id && picked.index === it ? null : { qid: q.id, index: it };
          renderBody(q);
        }
      }
    });
  });
}

/* подстановка в пропуски: карточки палитры не расходуются */
function bodySlots(q, body, card) {
  const cur = state.answers[q.id] || q.slots.map(() => null);
  const mono = q.chips.every(c => c.length < 16);
  body.innerHTML = `
    <div class="palette"><p class="palette-note">Карточки</p>${state.optOrder[q.id].map(c =>
      `<button type="button" class="chip ${mono ? 'mono' : ''} ${picked && picked.qid === q.id && picked.index === c ? 'sel' : ''}" data-c="${c}">${q.chips[c]}</button>`).join('')}</div>
    <div class="slots">${q.slots.map((label, s) => `
      <div class="slot-row">
        <div class="slot-label">${esc(label)}</div>
        <div class="slot ${cur[s] !== null ? 'filled' : ''}" data-drop="slot" data-s="${s}" role="button" tabindex="0">${cur[s] !== null ? esc(q.chips[cur[s]]) : 'сюда'}</div>
      </div>`).join('')}</div>`;

  const put = (s, c) => {
    const next = [...cur];
    next[s] = c;
    picked = null;
    if (commit(q, next.every(x => x === null) ? null : next)) renderBody(q);
  };
  body.querySelectorAll('.chip').forEach(chip => {
    const c = Number(chip.dataset.c);
    draggable(chip, card, {
      onDrop: t => put(Number(t.dataset.s), c),
      onTap: () => { picked = picked && picked.qid === q.id && picked.index === c ? null : { qid: q.id, index: c }; renderBody(q); }
    });
  });
  body.querySelectorAll('.slot').forEach(slot => {
    const s = Number(slot.dataset.s);
    const act = () => {
      if (picked && picked.qid === q.id) put(s, picked.index);
      else if (cur[s] !== null) put(s, null);
    };
    slot.addEventListener('click', act);
    slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  });
}

/* раскладка по группам: карточка лежит либо в общей стопке, либо в одной группе */
function bodySort(q, body, card) {
  const cur = state.answers[q.id] || q.items.map(() => null);
  const chip = it => `<button type="button" class="chip ${picked && picked.qid === q.id && picked.index === it ? 'sel' : ''}" data-it="${it}">${q.items[it]}</button>`;
  const inPlace = b => state.optOrder[q.id].filter(it => cur[it] === b).map(chip).join('');
  body.innerHTML = `
    <div class="pool" data-drop="pool">${inPlace(null)}</div>
    <div class="buckets">${q.buckets.map((title, b) => `
      <div class="bucket" data-drop="bucket" data-b="${b}">
        <div class="bucket-title">${esc(title)}</div>
        <div class="bucket-body">${inPlace(b)}</div>
      </div>`).join('')}</div>`;

  const put = (it, b) => {
    const next = [...cur];
    next[it] = b;
    picked = null;
    if (commit(q, next.every(x => x === null) ? null : next)) renderBody(q);
  };
  const where = t => t.dataset.drop === 'pool' ? null : Number(t.dataset.b);
  body.querySelectorAll('.chip').forEach(el => {
    const it = Number(el.dataset.it);
    draggable(el, card, {
      onDrop: t => put(it, where(t)),
      onTap: () => { picked = picked && picked.qid === q.id && picked.index === it ? null : { qid: q.id, index: it }; renderBody(q); }
    });
  });
  body.querySelectorAll('[data-drop]').forEach(zone => zone.addEventListener('click', e => {
    if (e.target.closest('.chip') || !picked || picked.qid !== q.id) return;
    put(picked.index, where(zone));
  }));
}

/* строка кода */
function bodyLine(q, body) {
  body.innerHTML = codeBlock(q.code, 'lines');
  const sel = state.answers[q.id] ? state.answers[q.id][0] : null;
  body.querySelectorAll('.ln').forEach(ln => {
    const l = Number(ln.dataset.l);
    ln.classList.toggle('sel', l === sel);
    ln.addEventListener('click', () => { if (commit(q, [l])) renderBody(q); });
  });
}

/* число */
function bodyNumber(q, body) {
  const val = state.answers[q.id] || '';
  const unit = q.unit ? `<span>${esc(q.unit)}</span>` : '';
  body.innerHTML = `<label class="num">${q.unit_before ? unit : ''}<input type="text" inputmode="decimal" autocomplete="off" maxlength="12" value="${esc(val)}" aria-label="ответ">${q.unit_before ? '' : unit}</label>`;
  const input = body.querySelector('input');
  input.addEventListener('input', () => {
    const v = input.value.replace(/[^0-9.,\-\s]/g, '');
    if (v !== input.value) input.value = v;
    commit(q, v.trim() ? v.trim() : null);
  });
}

/* ---------- прогресс ---------- */

function isDone(q) {
  return normalized(q, state.answers[q.id]) !== null;
}

function updateProgress() {
  const total = QUIZ.questions.length;
  const done = QUIZ.questions.filter(isDone).length;
  $('progress-fill').style.width = (done / total * 100) + '%';
  $('progress-text').textContent = `ГОТОВО ${done} ИЗ ${total}`;
  $('finish-note').textContent = done < total ? `Не выполнено: ${total - done}` : 'Выполнены все задания';
}

/* ---------- завершение ---------- */

$('btn-finish').addEventListener('click', () => {
  const missing = state.order.map(i => QUIZ.questions[i]).filter(q => !isDone(q));
  if (missing.length) {
    missing.forEach(q => $('card-' + q.id).classList.add('unanswered'));
    $('card-' + missing[0].id).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!confirm(`Не выполнено заданий: ${missing.length} (в заданиях с карточками нужно заполнить все места). Они будут засчитаны как неверные.\n\nЗавершить работу? Изменить ответы после этого нельзя.`)) return;
  } else if (!confirm('Завершить работу? Изменить ответы после этого нельзя.')) {
    return;
  }
  finish(false);
});

async function finish(byTimeout) {
  if (finishing) return;
  finishing = true;
  clearInterval(tick);
  const details = [];
  let score = 0;
  for (const q of QUIZ.questions) {
    const ok = await isCorrect(q, state.answers[q.id]);
    if (ok) score++;
    details.push({ id: q.id, ok });
  }
  const g = gradeFor(score);
  const result = {
    v: 1,
    name: state.name, group: state.group,
    answers: QUIZ.questions.map(q => encodeAnswer(q, state.answers[q.id])),
    raw: state.answers,
    score, total: QUIZ.questions.length, mark: g.mark,
    finishedAt: new Date().toISOString(),
    minutesUsed: Math.round((Math.min(Date.now(), state.deadline) - (state.startedAt || state.deadline - QUIZ.minutes * 60000)) / 60000),
    byTimeout: !!byTimeout,
    leaves: state.leaves || 0,
    order: state.order,
    details
  };
  result.code = await makeCode(result);

  save(KEY_RESULT, result);
  try { localStorage.removeItem(KEY_STATE); } catch (e) {}
  renderResult(result, false);
}

/* ---------- код результата ---------- */

function b64url(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function makeCode(r) {
  const payload = {
    v: 1, n: r.name, g: r.group, a: r.answers,
    s: r.score, t: r.total, m: r.mark,
    d: r.finishedAt.slice(0, 16), u: r.minutesUsed, o: r.byTimeout ? 1 : 0, x: r.leaves
  };
  const body = b64url(JSON.stringify(payload));
  const sum = await shortHash(QUIZ.salt + '|code|' + body);
  return `${QUIZ.prefix}.${body}.${sum.slice(0, 10)}`;
}

/* ---------- экран результата ---------- */

async function renderResult(r, returning) {
  show('result');
  $('result-title').textContent = returning ? 'Тест уже пройден' : (r.byTimeout ? 'Время вышло — работа отправлена' : 'Работа завершена');

  const g = QUIZ.grades.find(x => x.mark === r.mark) || QUIZ.grades[QUIZ.grades.length - 1];
  $('mark').textContent = r.mark;
  $('mark').className = 'mark m' + r.mark;
  $('score-line').textContent = `${r.score} из ${r.total} · ${g.label}`;
  $('who').textContent = `${r.name} · группа ${r.group}`;
  const dt = new Date(r.finishedAt);
  $('when').textContent = 'Завершено ' + dt.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' })
    + (r.leaves ? ` · уходов со вкладки: ${r.leaves}` : '');
  $('code').value = r.code;

  if (returning && !document.querySelector('.notice.again')) {
    const note = document.createElement('div');
    note.className = 'notice again';
    note.innerHTML = '<b>Повторное прохождение не предусмотрено.</b> Оценка зафиксирована при первой попытке и не меняется. Разбор ниже остаётся доступным.';
    screens.result.insertBefore(note, screens.result.children[2]);
  }

  const secret = await secretData();
  const order = r.order || QUIZ.questions.map((_, i) => i);
  const raw = r.raw || {};

  $('review-map').innerHTML = order.map((qi, pos) => {
    const q = QUIZ.questions[qi];
    const d = r.details.find(x => x.id === q.id) || { ok: false };
    return `<a href="#rv-${q.id}" class="${d.ok ? 'ok' : 'bad'}" title="${d.ok ? 'верно' : 'неверно'} · ${esc(q.topic)}">${pos + 1}</a>`;
  }).join('');

  $('review').innerHTML = order.map((qi, pos) => {
    const q = QUIZ.questions[qi];
    const d = r.details.find(x => x.id === q.id) || { ok: false };
    const key = secret[q.id].key;
    const verdict = `<span class="verdict ${d.ok ? 'ok' : 'bad'}">${d.ok ? '✓ верно' : '✗ неверно'}</span>`;
    return `<article class="q rv ${d.ok ? 'ok' : 'bad'}" id="rv-${q.id}">
      ${questionHead(q, pos, verdict)}
      ${imageBlock(q.image)}
      ${q.code && q.type !== 'line' ? codeBlock(q.code) : ''}
      ${reviewBody(q, raw[q.id], key)}
      <div class="why"><b>Разбор</b>${secret[q.id].why}</div>
    </article>`;
  }).join('');
}

function reviewBody(q, a, key) {
  const none = '<i class="muted">нет ответа</i>';
  switch (q.type) {
    case 'single': case 'multi': {
      const mine = a || [];
      return `<div class="cmp">${q.options.map((o, i) => {
        const right = key.includes(i), my = mine.includes(i);
        const cls = right ? 'right' : (my ? 'wrong' : '');
        const tag = right && my ? 'ваш выбор · верно' : right ? 'верный ответ' : my ? 'ваш выбор · неверно' : '';
        return `<div class="cmp-opt ${cls}"><span class="mk">${right ? '✓' : my ? '✗' : ''}</span><span>${o}</span>${tag ? `<span class="tag">${tag}</span>` : ''}</div>`;
      }).join('')}</div>${mine.length ? '' : `<p>${none}</p>`}`;
    }
    case 'order': {
      const mine = a || null;
      const yours = mine
        ? `<ol>${mine.map((it, pos) => `<li class="${it === key[pos] ? 'right' : 'wrong'}">${q.items[it]}</li>`).join('')}</ol>`
        : `<p>${none} — порядок не менялся</p>`;
      return `<div class="cols">
        <div><h3>Ваш порядок</h3>${yours}</div>
        <div><h3>Верный порядок</h3><ol>${key.map(it => `<li class="right">${q.items[it]}</li>`).join('')}</ol></div>
      </div>`;
    }
    case 'slots': {
      const mine = a || [];
      return `<div class="res-wrap"><table class="res"><tr><th>Пропуск</th><th>Ваш ответ</th><th>Верно</th></tr>${q.slots.map((s, i) => {
        const my = mine[i] ?? null;
        return `<tr><td>${esc(s)}</td><td class="${my === key[i] ? 'right' : 'wrong'}">${my === null ? '—' : esc(q.chips[my])}</td><td><b>${esc(q.chips[key[i]])}</b></td></tr>`;
      }).join('')}</table></div>`;
    }
    case 'sort': {
      const mine = a || [];
      return `<div class="res-wrap"><table class="res"><tr><th>Карточка</th><th>Ваша группа</th><th>Верная группа</th></tr>${q.items.map((it, i) => {
        const my = mine[i] ?? null;
        return `<tr><td>${it}</td><td class="${my === key[i] ? 'right' : 'wrong'}">${my === null ? '—' : esc(q.buckets[my])}</td><td><b>${esc(q.buckets[key[i]])}</b></td></tr>`;
      }).join('')}</table></div>`;
    }
    case 'line': {
      const my = a ? a[0] : null;
      const lines = q.code.split('\n').map((line, i) => {
        const cls = i === key[0] ? 'right' : i === my ? 'wrong' : '';
        return `<span class="ln ${cls}">${esc(line) || ' '}</span>`;
      }).join('');
      const note = my === null ? `Вы не выбрали строку.` : my === key[0] ? `Вы выбрали строку ${my + 1} — верно.` : `Вы выбрали строку ${my + 1}, верная — строка ${key[0] + 1}.`;
      return `<figure class="q-code lines-rv"><figcaption><span>зелёная — верно · красная — ваш выбор</span></figcaption><pre>${lines}</pre></figure><p>${note}</p>`;
    }
    case 'number': {
      const ok = normalized(q, a) && normalized(q, a)[0] === key[0];
      return `<div class="numrv"><span class="${ok ? 'right' : 'wrong'}">Ваш ответ: ${a ? esc(a) : '—'}</span><span class="right">Верно: ${key[0]}</span></div>`;
    }
  }
  return '';
}

document.querySelectorAll('.filter .chipbtn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.filter .chipbtn').forEach(b => b.classList.toggle('on', b === btn));
  const onlyBad = btn.dataset.filter === 'bad';
  document.querySelectorAll('#review .rv').forEach(el => el.classList.toggle('hidden', onlyBad && el.classList.contains('ok')));
}));

$('btn-copy').addEventListener('click', async () => {
  const ta = $('code');
  try { await navigator.clipboard.writeText(ta.value); }
  catch (e) { ta.removeAttribute('readonly'); ta.select(); document.execCommand('copy'); ta.setAttribute('readonly', ''); }
  $('btn-copy').textContent = 'Скопировано';
  setTimeout(() => { $('btn-copy').textContent = 'Скопировать'; }, 1800);
});

window.addEventListener('beforeunload', e => {
  if (state && !finishing && !load(KEY_RESULT)) { e.preventDefault(); e.returnValue = ''; }
});

init();
