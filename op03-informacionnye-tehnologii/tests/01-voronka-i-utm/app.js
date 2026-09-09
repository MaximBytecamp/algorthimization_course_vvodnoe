/* Тест 1 ОП.03. Одна попытка, 10 минут, автоматическая проверка.

   Состояние живёт в localStorage этого браузера:
     op03-test-01:state  — идёт попытка (ФИО, ответы, дедлайн)
     op03-test-01:result — попытка завершена, оценка зафиксирована

   Пока лежит result, тест больше не запускается: любое открытие ссылки,
   перезагрузка и кнопка «назад» показывают уже готовую оценку. Оговорка:
   это защита в пределах браузера. Режим инкогнито, другое устройство или
   очистка данных сайта её снимают — серверной проверки здесь нет. */

const KEY_STATE = QUIZ.id + ':state';
const KEY_RESULT = QUIZ.id + ':result';

const $ = id => document.getElementById(id);
const screens = { start: $('screen-start'), quiz: $('screen-quiz'), result: $('screen-result') };

let state = null;      // { name, group, answers, deadline }
let tick = null;

/* ---------- хранилище (не падаем, если оно недоступно) ---------- */

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

/* ---------- запуск ---------- */

function init() {
  const done = load(KEY_RESULT);
  if (done) { renderResult(done, true); return; }

  const saved = load(KEY_STATE);
  if (saved && saved.answers) {
    state = saved;
    if (Date.now() >= state.deadline) { finish(true); return; }
    renderQuestions();
    show('quiz');
    startTimer();
    return;
  }
  show('start');
}

$('btn-start').addEventListener('click', () => {
  const name = $('in-name').value.trim().replace(/\s+/g, ' ');
  const group = $('in-group').value.trim();
  if (name.length < 3 || !name.includes(' ')) {
    $('start-err').textContent = 'Укажите фамилию и имя полностью — например, «Иванов Иван».';
    return;
  }
  if (!group) { $('start-err').textContent = 'Укажите группу.'; return; }
  $('start-err').textContent = '';

  state = { name, group, answers: {}, deadline: Date.now() + QUIZ.minutes * 60000 };
  if (!save(KEY_STATE, state)) {
    $('start-err').textContent = 'Браузер запретил сохранение данных сайта. Отключите приватный режим — иначе результат потеряется.';
    return;
  }
  renderQuestions();
  show('quiz');
  startTimer();
});

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

/* ---------- вопросы ---------- */

function renderQuestions() {
  const host = $('questions');
  host.innerHTML = '';
  QUIZ.questions.forEach((q, qi) => {
    const multi = q.type === 'multi';
    const card = document.createElement('div');
    card.className = 'q';
    card.id = 'card-' + q.id;
    card.innerHTML = `
      <div class="q-head">
        <span class="q-num">ВОПРОС ${qi + 1}</span>
        <span class="q-topic">${q.topic}</span>
      </div>
      <p class="q-text">${q.text}</p>
      ${multi ? '<p class="q-hint">Несколько верных вариантов · балл только за полностью верный набор</p>' : ''}
      <div class="opts"></div>`;
    const opts = card.querySelector('.opts');

    q.options.forEach((text, oi) => {
      const label = document.createElement('label');
      label.className = 'opt';
      const picked = (state.answers[q.id] || []).includes(oi);
      label.innerHTML = `<input type="${multi ? 'checkbox' : 'radio'}" name="${q.id}" value="${oi}" ${picked ? 'checked' : ''}><span>${text}</span>`;
      if (picked) label.classList.add('picked');
      label.querySelector('input').addEventListener('change', () => pick(q, oi, multi));
      opts.appendChild(label);
    });

    host.appendChild(card);
  });
  updateProgress();
}

function pick(q, oi, multi) {
  const cur = state.answers[q.id] || [];
  if (multi) {
    state.answers[q.id] = cur.includes(oi) ? cur.filter(x => x !== oi) : cur.concat(oi).sort((a, b) => a - b);
  } else {
    state.answers[q.id] = [oi];
  }
  if (!state.answers[q.id].length) delete state.answers[q.id];
  save(KEY_STATE, state);

  const card = $('card-' + q.id);
  card.querySelectorAll('.opt').forEach(l => l.classList.toggle('picked', l.querySelector('input').checked));
  card.classList.remove('unanswered');
  updateProgress();
}

function updateProgress() {
  const total = QUIZ.questions.length;
  const done = QUIZ.questions.filter(q => state.answers[q.id]).length;
  $('progress-fill').style.width = (done / total * 100) + '%';
  $('progress-text').textContent = `ОТВЕЧЕНО ${done} ИЗ ${total}`;
  $('finish-note').textContent = done < total ? `Без ответа: ${total - done}` : 'Отвечены все вопросы';
}

/* ---------- завершение ---------- */

$('btn-finish').addEventListener('click', () => {
  const missing = QUIZ.questions.filter(q => !state.answers[q.id]);
  if (missing.length) {
    missing.forEach(q => $('card-' + q.id).classList.add('unanswered'));
    const first = $('card-' + missing[0].id);
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const ok = confirm(`Без ответа ${missing.length} вопрос(ов). Они будут засчитаны как неверные.\n\nЗавершить работу? Изменить ответы после этого нельзя.`);
    if (!ok) return;
  } else if (!confirm('Завершить работу? Изменить ответы после этого нельзя.')) {
    return;
  }
  finish(false);
});

async function finish(byTimeout) {
  clearInterval(tick);
  const details = [];
  let score = 0;
  for (const q of QUIZ.questions) {
    const picked = state.answers[q.id] || [];
    const ok = await isCorrect(q, picked);
    if (ok) score++;
    details.push({ id: q.id, picked, ok });
  }
  const g = gradeFor(score);
  const result = {
    v: 1,
    name: state.name,
    group: state.group,
    answers: QUIZ.questions.map(q => (state.answers[q.id] || []).join('')).join('-'),
    score,
    total: QUIZ.questions.length,
    mark: g.mark,
    finishedAt: new Date().toISOString(),
    byTimeout: !!byTimeout,
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
    d: r.finishedAt.slice(0, 16), o: r.byTimeout ? 1 : 0
  };
  const body = b64url(JSON.stringify(payload));
  const sum = await shortHash(QUIZ.salt + '|code|' + body);
  return `OP03T1.${body}.${sum.slice(0, 8)}`;
}

/* ---------- экран результата ---------- */

function renderResult(r, returning) {
  show('result');
  $('result-title').textContent = returning ? 'Тест уже пройден' : (r.byTimeout ? 'Время вышло — работа отправлена' : 'Работа завершена');

  const g = QUIZ.grades.find(x => x.mark === r.mark) || QUIZ.grades[QUIZ.grades.length - 1];
  const mark = $('mark');
  mark.textContent = r.mark;
  mark.className = 'mark m' + r.mark;
  $('score-line').textContent = `${r.score} из ${r.total} · ${g.label}`;
  $('who').textContent = `${r.name} · группа ${r.group}`;
  const dt = new Date(r.finishedAt);
  $('when').textContent = 'Завершено ' + dt.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
  $('code').value = r.code;

  if (returning) {
    const note = document.createElement('div');
    note.className = 'notice';
    note.innerHTML = '<b>Повторное прохождение не предусмотрено.</b> Оценка зафиксирована при первой попытке и не меняется. Если тест нужно пересдать, обратитесь к преподавателю.';
    screens.result.insertBefore(note, screens.result.children[2]);
  }

  const host = $('review');
  host.innerHTML = '';
  QUIZ.questions.forEach((q, qi) => {
    const d = r.details.find(x => x.id === q.id) || { picked: [], ok: false };
    const div = document.createElement('div');
    div.className = 'rq ' + (d.ok ? 'ok' : 'bad');
    const chosen = d.picked.length
      ? d.picked.map(i => q.options[i]).join('<br>')
      : '<i>без ответа</i>';
    div.innerHTML = `
      <div class="rq-head">Вопрос ${qi + 1} · ${d.ok ? 'верно' : 'неверно'}</div>
      <div class="rq-text">${q.text}</div>
      <div class="rq-ans"><b>Ваш ответ:</b> ${chosen}</div>
      <div class="rq-why">${q.why}</div>`;
    host.appendChild(div);
  });
}

$('btn-copy').addEventListener('click', async () => {
  const ta = $('code');
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch (e) {
    ta.removeAttribute('readonly'); ta.select(); document.execCommand('copy'); ta.setAttribute('readonly', '');
  }
  $('btn-copy').textContent = 'Скопировано';
  setTimeout(() => { $('btn-copy').textContent = 'Скопировать'; }, 1800);
});

/* уход со страницы во время попытки — предупредить */
window.addEventListener('beforeunload', e => {
  if (state && !load(KEY_RESULT)) { e.preventDefault(); e.returnValue = ''; }
});

init();
