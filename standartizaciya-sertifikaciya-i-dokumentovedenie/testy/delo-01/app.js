/* Игра-расследование «Выгрузка на продажу».
   Данные варианта и подсчёт баллов — в game-data.js. Здесь интерфейс: рабочий стол специалиста,
   заседание суда, итог и сохранение дела в файлы .md. */
'use strict';

const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STAGES = ['Осмотр', 'Путь выгрузки', 'Люди и сроки', 'Заседание'];
const WHO = { korneev: 'Свидетель Корнеев Д. А.', ahmetov: 'Свидетель Ахметов Р. Т.', kravec: 'Заявитель Кравец Н. Ю.', clerk: 'Секретарь заседания', judge: 'Судья Орлова Е. Н.', rkn: 'Представитель Роскомнадзора Белых Т. А.', org: 'Представитель ООО «КурсБлиновской» Вайс И. Л.' };
const TABS = [['mail', 'Почта'], ['site', 'Сайт'], ['server', 'Сервер'], ['host', 'Хостинг'], ['max', 'MAX'], ['hr', 'Кадры'], ['talks', 'Опросы'], ['pins', 'Улики'],
  ['tasks', 'Задания'], ['notes', 'Блокнот'], ['court', 'Суд']];

let V = null;            // { pub, sec } — материалы и ключи варианта
let S = null;            // состояние игры, хранится в localStorage
let DOCS = {};           // документ по идентификатору
const draft = {};        // незаписанные ответы в формах
const term = { cwd: '/srv/kursblinovskoy', out: [], hist: [], pos: 0 };
let fileFilter = '';
let showHidden = false;
let timerId = null;
const ACTIONS = {};       // действия кнопок по атрибуту data-act

/* ---------------------------------------------------------------- состояние */

function save() { try { localStorage.setItem(GAME.id, JSON.stringify(S)); } catch (e) {} }

function load() {
  try { return JSON.parse(localStorage.getItem(GAME.id) || 'null'); } catch (e) { return null; }
}

function elapsed() { return Math.floor(((S.done ? S.done.at : (S.pauseAt || Date.now())) - S.start - (S.paused || 0)) / 1000); }

function clock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function addLog(text) {
  S.log.push({ t: elapsed(), x: text });
}

function available(doc) {
  if (doc.pet && !S.pets.includes(doc.pet)) return false;
  if (doc.kind === 'hr') return S.stage >= 2;
  return doc.stage <= S.stage;
}

function see(id) {
  if (S.seen[id]) return;
  S.seen[id] = 1;
  const d = DOCS[id];
  const what = { file: 'Открыт файл ', git: 'Открыто изменение ', mail: 'Прочитано письмо «', att: 'Открыто вложение «', chat: 'Открыт чат «', hr: 'Открыто личное дело: ', web: 'Открыта страница сайта ', talk: 'Открыта запись: ', panel: 'Открыта панель хостинга: ' }[d.kind];
  addLog(what + (d.kind === 'file' || d.kind === 'web' ? d.path : d.kind === 'git' ? d.hash : d.title) + (['mail', 'att', 'chat'].includes(d.kind) ? '»' : ''));
  save();
}

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

/* ---------------------------------------------------------------- улики */

function lineText(doc, i) {
  const ln = doc.lines[i];
  if (typeof ln === 'string') return ln;
  const name = ln.w === 'inv' ? 'Следователь' : V.pub.people[ln.w];
  if (ln.x === null) return name + ': сообщение удалено';
  if (ln.sys) return ln.x;
  if (ln.st) return name + ': стикер ' + ln.st;
  if (ln.voice) return name + ' (голосовое, ' + ln.voice + '): ' + ln.x;
  if (ln.img) return name + ': ' + ln.x + ' [снимок экрана]';
  return name + ': ' + ln.x + (ln.q ? ' (в ответ на сообщение ' + V.pub.people[ln.q.w] + ': «' + ln.q.x + '»)' : '');
}

function refInfo(ref) {
  const k = ref.lastIndexOf('#');
  const doc = DOCS[ref.slice(0, k)], i = Number(ref.slice(k + 1));
  let where;
  if (doc.kind === 'file') where = doc.path + ', строка ' + (i + 1);
  else if (doc.kind === 'git') where = 'история изменений, ' + doc.hash + ', строка ' + (i + 1);
  else if (doc.kind === 'mail') where = 'письмо «' + doc.title + '», ' + doc.frm + ', абзац ' + (i + 1);
  else if (doc.kind === 'att') where = 'вложение «' + doc.title + '», строка ' + (i + 1);
  else if (doc.kind === 'panel') where = 'панель хостинга, раздел «' + doc.title + '», строка ' + (i + 1);
  else if (doc.kind === 'talk') where = doc.title + ', ' + doc.lines[i].t;
  else if (doc.kind === 'web') where = 'сайт, страница ' + doc.path + ', строка ' + (i + 1);
  else if (doc.kind === 'chat') where = 'MAX, чат «' + doc.title + '», ' + doc.lines[i].d + ' ' + doc.lines[i].t;
  else where = 'кадры, ' + doc.title + ', строка ' + (i + 1);
  return { doc, i, where, text: lineText(doc, i) };
}

function pinned(ref) { return S.pins.some(p => p.ref === ref); }

function frozen() { return S.court.on || !!S.done; }

function togglePin(ref) {
  if (frozen()) { toast('Заседание открыто: состав улик больше не меняется.'); return; }
  const at = S.pins.findIndex(p => p.ref === ref);
  if (at >= 0) {
    S.pins.splice(at, 1);
    S.links = S.links.filter(l => l[0] !== ref && l[1] !== ref);
    draft.linkFrom = null;
    addLog('Запись исключена из улик: ' + refInfo(ref).where);
  } else {
    if (S.pins.length >= GAME.maxPins) { toast('Приобщено ' + GAME.maxPins + ' записей — это предел. Исключите лишнюю в разделе «Улики».'); return; }
    S.pins.push({ ref, note: '' });
    addLog('Запись приобщена к делу: ' + refInfo(ref).where);
  }
  save();
  render();
}

function pinBtn(ref) {
  const on = pinned(ref);
  return `<button class="pin${on ? ' on' : ''}" data-pin="${esc(ref)}" title="${on ? 'Исключить из улик' : 'Приобщить к делу'}" aria-pressed="${on}">${on ? '◆' : '◇'}</button>`;
}

/* ---------------------------------------------------------------- портреты */

const FACE = {
  granin: ['#E9D5E3', '#E6B48F', '#2b2430', 'short', '#3a2b4f', 0], korneev: ['#D3E4F5', '#EDC3A0', '#5a3a1e', 'mop', '#2D7FC1', 1],
  safina: ['#D9EEDF', '#F0C7A6', '#2a1c14', 'long', '#24774D', 0], loseva: ['#F7E7C8', '#F2CDB0', '#9a4a1c', 'bun', '#A3650D', 1],
  ahmetov: ['#F4D9D6', '#D9A47C', '#15161c', 'crop', '#5b5f6e', 0], lykov: ['#DDDCF4', '#EBBF9C', '#6b4a2a', 'mop', '#4b4fa8', 0],
  unknown: ['#2a2d3a', '#565b6e', '#1a1c25', 'crop', '#11131a', 0],
  clerk: ['#E8E2D0', '#EFC8A8', '#5a3a1e', 'long', '#3a4a6b', 1],
  inv: ['#D8DCE6', '#E2B592', '#3c3f47', 'crop', '#1d2540', 0], judge: ['#DCEBF8', '#EFC8A8', '#8d8f98', 'bun', '#0f1330', 1],
  rkn: ['#F9E3E1', '#EDC3A0', '#4a2f22', 'long', '#7c2d2a', 0], org: ['#FBEED6', '#E9BD99', '#d8c9a0', 'short', '#6a4a12', 1],
};
const HAIR = {
  short: '<path d="M19 26c-1-12 5-18 13-18s14 6 13 18c-2-6-5-9-13-9s-11 3-13 9z"/>',
  crop: '<path d="M20 22c0-9 5-13 12-13s12 4 12 13c-3-4-6-5-12-5s-9 1-12 5z"/>',
  mop: '<path d="M18 28c-2-13 5-21 14-21s16 8 14 21c-1-5-3-8-6-10-3 2-10 3-16 2-3 2-5 4-6 8z"/>',
  long: '<path d="M17 46V25c0-11 7-17 15-17s15 6 15 17v21h-6V27c-2-5-5-7-9-7s-7 2-9 7v19z"/>',
  bun: '<circle cx="32" cy="8" r="6"/><path d="M19 27c-1-11 5-17 13-17s14 6 13 17c-2-6-6-8-13-8s-11 2-13 8z"/>',
};

const PHOTO = new Set(['kravec', 'granin', 'korneev', 'safina', 'loseva', 'ahmetov', 'lykov', 'inv', 'judge', 'rkn', 'org']);

/* Фотографии — сгенерированные лица несуществующих людей; у неустановленного лица остаётся рисунок. */
function portrait(id, size) {
  if (PHOTO.has(id)) return `<img class="face" src="media/face-${id}.jpg" width="${size || 40}" height="${size || 40}" alt="" loading="lazy">`;
  const [bg, skin, hair, style, coat, glasses] = FACE[id] || FACE.inv;
  return `<svg class="face" width="${size || 40}" height="${size || 40}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${bg}"/>
    <path d="M6 64c2-15 12-21 26-21s24 6 26 21z" fill="${coat}"/><path d="M26 43l6 9 6-9z" fill="#fff"/><rect x="27" y="35" width="10" height="10" fill="${skin}"/>
    <ellipse cx="32" cy="26" rx="12" ry="14" fill="${skin}"/><g fill="${hair}">${HAIR[style]}</g>
    <circle cx="27" cy="27" r="1.4" fill="#1c1c28"/><circle cx="37" cy="27" r="1.4" fill="#1c1c28"/><path d="M28 33q4 3 8 0" fill="none" stroke="#8a4b3a" stroke-width="1.4" stroke-linecap="round"/>
    ${glasses ? '<g fill="none" stroke="#1c1c28" stroke-width="1.3"><circle cx="27" cy="27" r="4.2"/><circle cx="37" cy="27" r="4.2"/><path d="M31.2 27h1.6"/></g>' : ''}</svg>`;
}

/* ---------------------------------------------------------------- каркас */

const INTRO = [
  ['clerk', 'Помощник судьи', '⟦ФИО⟧? Судебный участок, помощник судьи. Вас привлекают специалистом. Дело в отношении ООО «КурсБлиновской»: базу их учеников продают на форуме.'],
  ['me', '', 'Что уже есть в деле?'],
  ['clerk', 'Помощник судьи', 'Три бумаги. Уведомление оператора, жалоба матери пятнадцатилетнего ученика и письмо директора. Директор уже всё объяснил: виноват подрядчик.'],
  ['me', '', 'Быстро он.'],
  ['clerk', 'Помощник судьи', 'Да, объяснение пришло в тот же день. Доступ к серверу, переписке и кадрам вам откроют. Улики отбираете вы: суд увидит только то, что вы приобщите к делу. Не больше двадцати четырёх записей.'],
  ['me', '', 'А стороны?'],
  ['clerk', 'Помощник судьи', 'Роскомнадзор настаивает на большем штрафе, компания называет виновным подрядчика. Проверяйте обе версии по материалам. Определение у вас в почте, ⟦ИМЯ⟧.'],
];

function viewIntro() {
  const parts = S.name.trim().split(/\s+/);
  const n = Math.min(S.intro || 1, INTRO.length);
  const lines = INTRO.slice(0, n).map(([who, name, text]) => {
    const t = esc(text.replace(/⟦ФИО⟧/g, parts.join(' ')).replace(/⟦ИМЯ⟧/g, parts[1] || parts[0]));
    return who === 'me' ? `<div class="call me"><div><b>${esc(parts.join(' '))}</b><p>${t}</p></div></div>` : `<div class="call">${portrait('clerk', 48)}<div><b>${name}</b><p>${t}</p></div></div>`;
  }).join('');
  return `<div class="pane narrow intro"><p class="eyebrow">09.10.2026 · 08:52 · входящий звонок</p><h2>Судебный участок</h2>${lines}
    <button class="btn ghost small" data-act="reset">Сбросить</button> <button class="btn" data-act="intro">${n < INTRO.length ? (INTRO[n][0] === 'me' ? 'Ответить' : 'Слушать дальше') : 'Открыть дело'}</button></div>`;
}
ACTIONS.intro = () => {
  if ((S.intro || 1) >= INTRO.length) { S.introDone = 1; addLog('Принят звонок из судебного участка'); }
  else S.intro = (S.intro || 1) + 1;
  save(); render();
  $('#main').scrollTop = $('#main').scrollHeight;
};

function render() {
  if (S.pauseAt) { $('#nav').innerHTML = ''; $('#main').innerHTML = `<div class="pane narrow"><p class="eyebrow">перерыв</p><h2>Таймер остановлен</h2><p>Материалы закрыты до конца перерыва. Он длится не больше 20 минут и даётся один раз. Чтобы вернуться раньше, нажмите «Продолжить» вверху.</p></div>`; return; }
  if (!S.introDone && !S.done) { $('#nav').innerHTML = ''; $('#main').innerHTML = viewIntro(); $('#stage').textContent = 'Вызов'; return; }
  renderNav();
  const main = $('#main');
  const keep = main.scrollTop;
  keepLock();
  const playing = $('#aud');
  if (playing && S.tab === 'talks') audioKeep = { t: playing.currentTime, on: !playing.paused }; else audioKeep = null;
  const view = { mail: viewMail, site: viewSite, host: viewHost, talks: viewTalks, server: viewServer, max: viewMax, hr: viewHr, pins: viewPins, tasks: viewTasks, notes: viewNotes, court: viewCourt, result: viewResult }[S.tab];
  main.innerHTML = view();
  main.scrollTop = main.dataset.view === S.tab ? keep : 0;
  main.dataset.view = S.tab;
  after();
  $('#stage').textContent = S.done ? 'Дело закрыто' : 'Этап ' + (S.stage + 1) + ' из 4 · ' + STAGES[S.stage];
}

function openTasks() {
  return V.pub.tasks.filter(t => t.stage === S.stage && !(S.tasks[t.id] && S.tasks[t.id].s)).length;
}

function renderNav() {
  const unread = kind => Object.values(DOCS).filter(d => d.kind === kind && available(d) && !S.seen[d.id]).length;
  const badge = {
    mail: unread('mail') || '', max: unread('chat') || '', hr: S.stage < 2 ? 'закрыто' : (unread('hr') || ''),
    talks: S.stage < 2 || !S.pets.includes('p3') ? 'закрыто' : (unread('talk') || ''),
    pins: S.pins.length + '/' + GAME.maxPins, tasks: S.stage < 3 ? (openTasks() || '') : '',
    court: S.stage < 3 ? 'закрыто' : '',
  };
  let html = TABS.map(([id, t]) => {
    const locked = badge[id] === 'закрыто';
    return `<button class="nav-btn${S.tab === id ? ' on' : ''}${locked ? ' locked' : ''}" data-tab="${id}"><span>${t}</span>${badge[id] !== '' && badge[id] !== undefined ? `<i>${badge[id]}</i>` : ''}</button>`;
  }).join('');
  if (S.done) html += `<button class="nav-btn result${S.tab === 'result' ? ' on' : ''}" data-tab="result"><span>Итог</span></button>`;
  html += `<a class="nav-btn guide" href="pamyatka.html" target="_blank" rel="noopener"><span>Памятка ↗</span></a>`;
  html += `<div class="nav-foot"><b>${esc(S.name)}</b><br>${esc(S.group)} · вариант ${S.v}<button class="reset" data-act="reset">Сбросить игру</button></div>`;
  $('#nav').innerHTML = html;
}

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) { S.tab = tab.dataset.tab; save(); render(); return; }
  const pin = e.target.closest('[data-pin]');
  if (pin) { togglePin(pin.dataset.pin); return; }
  const act = e.target.closest('[data-act]');
  if (act && ACTIONS[act.dataset.act]) ACTIONS[act.dataset.act](act.dataset.arg, act);
});


/* Строки документа с кнопкой «приобщить». */
function linesHtml(doc, opts = {}) {
  return doc.lines.map((ln, i) => {
    if (opts.filter && !ln.toLowerCase().includes(opts.filter)) return '';
    if (ln === '' && !opts.mono) return '';
    const ref = doc.id + '#' + i;
    const cls = 'ln' + (pinned(ref) ? ' pinned' : '') + (opts.mono && /^\+/.test(ln) && doc.kind === 'git' ? ' add' : '') + (opts.mono && /^-/.test(ln) && doc.kind === 'git' ? ' del' : '');
    const num = opts.mono ? `<span class="no">${i + 1}</span>` : '';
    return `<div class="${cls}">${ln.trim() === '' ? '<span class="pin-gap"></span>' : pinBtn(ref)}${num}<span class="tx">${esc(ln) || '&nbsp;'}</span></div>`;
  }).join('');
}

/* Скан документа или снимок экрана: по нажатию раскрывается во всю ширину. */
function scanHtml(name, caption) {
  return `<figure class="scan" data-act="zoom"><img src="media/${name}.jpg" alt="${esc(caption)}" loading="lazy"><figcaption>${esc(caption)} Нажмите, чтобы увеличить.</figcaption></figure>`;
}
ACTIONS.zoom = (arg, el) => el.classList.toggle('big');

/* ---------------------------------------------------------------- замки */

const PADLOCK = '<svg class="padlock" viewBox="0 0 64 80" aria-hidden="true"><path d="M16 34V22a16 16 0 0132 0v12" fill="none" stroke="#020835" stroke-width="7"/><rect x="6" y="32" width="52" height="42" fill="#E3C98F" stroke="#020835" stroke-width="4"/><circle cx="32" cy="50" r="6" fill="#020835"/><rect x="29.5" y="52" width="5" height="12" fill="#020835"/></svg>';

function lockOf(doc) {
  return doc && doc.lock && !S.locks[doc.lock] ? V.pub.locks.find(l => l.id === doc.lock) : null;
}

function lockTask(lock, n) { const q = lock.qs[n]; return { id: 'lock-' + lock.id + '-' + n, type: q.type, left: q.left, slots: q.slots, options: q.options }; }

/* Замок — мини-тест: открывается, когда все задания решены верно. */
function lockHtml(lock) {
  const bad = draft['lockbad-' + lock.id] || [];
  const qs = lock.qs.map((q, n) => {
    const name = 'lq-' + lock.id + '-' + n;
    const body = BOARD.includes(q.type) ? boardHtml(lockTask(lock, n)) : widget(q.type, name, q.options, draft[name]);
    return `<div class="lq${bad.includes(n) ? ' bad' : ''}" data-lq="${n}"><p class="lq-h"><b>${n + 1}</b>${esc(q.q)}${bad.includes(n) ? '<i>неверно</i>' : ''}</p>${body}</div>`;
  }).join('');
  return `<div class="pane lockbox" data-lock="${lock.id}">${PADLOCK}<div class="lock-body"><p class="eyebrow">материал под замком · ${lock.qs.length} заданий</p><h2>${esc(lock.title)}</h2>
    <p>Тема: <b>${esc(lock.theme)}</b>. Замок откроется, когда все задания решены верно. После проверки неверные будут отмечены, их можно исправить. Часть стандартов в курсе не разбиралась: ответы можно искать в интернете и в самих документах.</p>${qs}
    <p class="err">${esc(draft['lockmsg-' + lock.id] || '')}</p><button class="btn" data-act="unlock" data-arg="${lock.id}">Проверить и открыть</button>
    <p class="tip">Баллов замок не даёт. Число попыток записывается в ход расследования.</p></div></div>`;
}

function keepLock() {
  const root = document.querySelector('[data-lock]');
  if (!root) return;
  const lock = V.pub.locks.find(l => l.id === root.dataset.lock);
  lock.qs.forEach((q, n) => { if (!BOARD.includes(q.type)) draft['lq-' + lock.id + '-' + n] = readWidget(q.type, 'lq-' + lock.id + '-' + n, root); });
}

ACTIONS.unlock = id => {
  keepLock();
  const lock = V.pub.locks.find(l => l.id === id);
  const bad = [];
  lock.qs.forEach((q, n) => {
    const val = BOARD.includes(q.type) ? draft['lock-' + id + '-' + n] : draft['lq-' + id + '-' + n];
    if (!answerOk(q.type, V.sec.locks[id].keys[n], val)) bad.push(n);
  });
  S.lockTries[id] = (S.lockTries[id] || 0) + 1;
  draft['lockbad-' + id] = bad;
  if (!bad.length) {
    S.locks[id] = 1;
    addLog('Замок открыт: ' + lock.title + ' (проверок: ' + S.lockTries[id] + ')');
    toast('Замок открыт: ' + lock.title + '.');
  } else {
    draft['lockmsg-' + id] = 'Верно ' + (lock.qs.length - bad.length) + ' из ' + lock.qs.length + '. Исправьте отмеченные задания.';
    addLog('Замок «' + lock.title + '»: верно ' + (lock.qs.length - bad.length) + ' из ' + lock.qs.length);
  }
  save(); render();
};

/* ---------------------------------------------------------------- почта */

function viewMail() {
  const list = Object.values(DOCS).filter(d => d.kind === 'mail' && available(d)).reverse();
  if (!S.open.mail || !DOCS[S.open.mail] || !available(DOCS[S.open.mail])) S.open.mail = list[list.length - 1].id;
  const cur = DOCS[S.open.mail];
  see(cur.id);
  const items = list.map(d => `<button class="item${d.id === cur.id ? ' on' : ''}${S.seen[d.id] ? '' : ' new'}" data-act="mail" data-arg="${d.id}">
    <b>${esc(d.frm)}</b><span>${esc(d.title)}</span><small>${esc(d.date)}</small></button>`).join('');
  const att = (cur.att || []).map(id => `<button class="att${S.open.att === id ? ' on' : ''}" data-act="att" data-arg="${id}">Вложение: ${esc(DOCS[id].title)}</button>`).join('');
  let attBody = '';
  if (S.open.att && (cur.att || []).includes(S.open.att)) {
    see(S.open.att);
    attBody = `${DOCS[S.open.att].scan ? scanHtml(DOCS[S.open.att].scan, 'Снимок экрана, который приложил автор письма. Ниже — тот же текст строками, их можно приобщать.') : ''}<div class="doc mono-doc"><div class="doc-head"><b>${esc(DOCS[S.open.att].title)}</b></div>${linesHtml(DOCS[S.open.att], { mono: true })}</div>`;
  }
  return `<div class="split"><div class="list">${items}</div>
    <article class="pane"><p class="eyebrow">почта специалиста</p><h2>${esc(cur.title)}</h2>
      <p class="meta">От: ${esc(cur.frm)} · ${esc(cur.date)}</p>
      <div class="doc letter">${linesHtml(cur)}</div>${att ? `<div class="atts">${att}</div>` : ''}${cur.img ? scanHtml(cur.img, 'Снимок экрана, приложенный к письму.') : ''}${attBody}${cur.offer ? offerHtml() : ''}
      <p class="tip">Значок ◇ слева от абзаца приобщает его к делу как улику.</p></article></div>`;
}

function offerHtml() {
  const said = { report: 'Вы отказались и сообщили о письме суду.', silent: 'Вы отказались. Суду о письме не сообщали.', accept: 'Вы приняли предложение.' };
  if (S.offer) return `<div class="notice"><b>Ваш ответ.</b> ${said[S.offer]} Изменить его нельзя.</div>`;
  return `<div class="notice"><b>Нужен ответ.</b> Решение попадёт в материалы дела и повлияет на итог.
    <div class="task-btns"><button class="btn small" data-act="offer" data-arg="report">Отказаться и сообщить суду</button>
    <button class="btn ghost small" data-act="offer" data-arg="silent">Отказаться, суду не сообщать</button>
    <button class="btn ghost small" data-act="offer" data-arg="accept">Принять предложение</button></div></div>`;
}
ACTIONS.offer = how => {
  if (S.offer || !confirm({ report: 'Отказаться и переслать письмо суду?', silent: 'Отказаться и никому не сообщать?', accept: 'Принять предложение директора?' }[how])) return;
  S.offer = how;
  addLog('Предложение директора: ' + { report: 'отклонено, письмо передано суду', silent: 'отклонено, суду не сообщено', accept: 'принято' }[how]);
  save(); render();
};
ACTIONS.pet = id => {
  if (S.pets.includes(id)) return;
  const pet = V.pub.pets.find(x => x.id === id);
  const paid = S.pets.length >= 3;
  if (!confirm('Заявить ходатайство: «' + pet.title + '»?' + (paid ? ' Это ходатайство сверх трёх: за него снимутся 2 балла.' : ' Без условий осталось: ' + (3 - S.pets.length) + '.'))) return;
  keepDrafts();
  S.pets.push(id);
  addLog('Заявлено ходатайство: ' + pet.title + (paid ? ' (−2 балла)' : ''));
  toast('Суд удовлетворил ходатайство. ' + pet.note);
  save(); render();
};
ACTIONS.mail = id => { S.open.mail = id; S.open.att = null; save(); render(); };
ACTIONS.att = id => { S.open.att = S.open.att === id ? null : id; save(); render(); };

/* ---------------------------------------------------------------- сайт */

const signups = [];      // заявки, отправленные через форму на сайте (только в этой вкладке)
const botLog = [];

function siteBlock(cur, ln, i) {
  const ref = cur.id + '#' + i;
  const pin = `<div class="s-pin">${pinBtn(ref)}</div>`;
  if (ln.startsWith('# ')) return `<h2>${esc(ln.slice(2))}</h2>`;
  if (ln.startsWith('## ')) return `<h3>${esc(ln.slice(3))}</h3>`;
  const [tag, ...restParts] = ln.startsWith('@') ? ln.slice(1).split(' ') : ['p'];
  const cells = restParts.join(' ').split(' | ');
  if (tag === 'hero') return `<div class="s-hero"><h2>${esc(cells[0])}</h2><p>${esc(cells[1])}</p><button class="s-cta" data-act="web" data-arg="w:/signup">Начать учиться</button></div>`;
  if (tag === 'stats') return `<div class="s-stats">${cells.map(c => { const k = c.indexOf(' ', c.indexOf(' ') + 1 > 0 && /^\d+ \d/.test(c) ? c.indexOf(' ') + 1 : 0); return `<div><b>${esc(c.slice(0, k))}</b><span>${esc(c.slice(k + 1))}</span></div>`; }).join('')}</div>`;
  if (tag === 'card') return `<div class="s-card"><div class="s-thumb"${cells[3] ? ` style="background-image:url(media/${cells[3]}.jpg)"` : ''}></div><b>${esc(cells[0])}</b><span>${esc(cells[1])}</span><i>${esc(cells[2])}</i></div>`;
  if (tag === 'quote') return `<blockquote class="s-quote">«${esc(cells[0])}»<cite>${esc(cells[1])}</cite></blockquote>`;
  if (tag === 'btn') return `<button class="s-cta ghost" data-act="go-path" data-arg="${esc(cells[1])}">${esc(cells[0])}</button>`;
  if (tag === 'file') return `<div class="ln s-file${pinned(ref) ? ' pinned' : ''}">${pinBtn(ref)}<span class="tx"><a>${esc(cells[0])}</a><span>${esc(cells[1])}</span><span>${esc(cells[2])}</span></span></div>`;
  if (tag === 'form') {
    const done = signups.map((r, n) => `<div class="s-res">201 Created · строка № ${12000 + n + 1} добавлена в users · ${esc(r)}${signups.indexOf(r) !== n ? ' · <b>адрес уже был: создана вторая строка с той же почтой</b>' : ''}</div>`).join('');
    return `<div class="s-form"><input id="sf-name" placeholder="Фамилия, имя, отчество"><input id="sf-mail" placeholder="Адрес электронной почты"><input id="sf-phone" placeholder="Номер телефона">
      <input id="sf-birth" placeholder="Дата рождения, например 12.03.2014"><input id="sf-pw" placeholder="Пароль" type="password">
      <button class="s-cta" data-act="signup">Зарегистрироваться</button>${done}</div>`;
  }
  if (tag === 'bot') {
    const log = botLog.map(([q, a]) => `<div class="s-msg me">${esc(q)}</div><div class="s-msg">${esc(a)}</div>`).join('');
    return `<div class="s-bot"><div class="s-msg me">Когда откроется третий модуль курса?</div>
      <div class="s-msg">Дмитрий, третий модуль курса «Python с нуля» откроется 5 октября. Напомнить вам по телефону +7 9** ***-**-38, который указан в профиле?</div>${log}
      <div class="s-ask"><input id="bot-q" placeholder="Напишите вопрос помощнику"><button class="s-cta" data-act="bot">Спросить</button></div></div>`;
  }
  return `<div class="ln s-p${pinned(ref) ? ' pinned' : ''}">${pinBtn(ref)}<span class="tx">${esc(ln)}</span></div>`;
}

function viewSite() {
  const pages = Object.values(DOCS).filter(d => d.kind === 'web');
  if (!S.open.web || !DOCS[S.open.web]) S.open.web = 'w:/';
  const cur = DOCS[S.open.web];
  see(cur.id);
  const menu = ['w:/', 'w:/signup', 'w:/lk', 'w:/policy'].map(id => `<button class="s-link${id === cur.id ? ' on' : ''}" data-act="web" data-arg="${id}">${esc(DOCS[id].title)}</button>`).join('');
  let body = '', cards = '';
  cur.lines.forEach((ln, i) => {
    if (ln.startsWith('@card ')) { cards += siteBlock(cur, ln, i); return; }
    if (cards) { body += `<div class="s-cards">${cards}</div>`; cards = ''; }
    body += siteBlock(cur, ln, i);
  });
  const plain = cur.path.startsWith('/static/');
  let dev = '';
  if (S.open.dev) {
    const d = DOCS['w:~devtools'];
    see(d.id);
    dev = `<div class="devtools"><div class="dev-head"><b>Инструменты разработчика</b><span>Сеть · Исходный код · Cookie</span><button data-act="dev">✕</button></div>
      ${d.lines.map((ln, i) => ln.startsWith('# ') ? `<h4>${esc(ln.slice(2))}</h4>` : `<div class="ln${pinned(d.id + '#' + i) ? ' pinned' : ''}">${pinBtn(d.id + '#' + i)}<span class="tx">${esc(ln)}</span></div>`).join('')}</div>`;
  }
  return `<div class="pane browser"><div class="bbar"><span class="dots"><i></i><i></i><i></i></span>
      <input id="addr" class="addr" value="https://kursblinovskoy.example${esc(cur.path === '~devtools' ? '/' : cur.path)}" spellcheck="false" aria-label="Адрес страницы"><button class="btn ghost small" data-act="go">Перейти</button>
      <button class="btn ghost small${S.open.dev ? ' on' : ''}" data-act="dev">Инструменты разработчика</button></div>
    <div class="site${plain ? ' plain' : ''}">${plain ? '' : `<div class="s-nav"><span class="s-logo"><i></i>КурсБлиновской</span>${menu}<button class="s-cta small" data-act="web" data-arg="w:/signup">Записаться</button></div>`}
      <div class="s-page">${body}${cards ? `<div class="s-cards">${cards}</div>` : ''}</div>
      ${plain ? '' : '<div class="s-foot">© 2026 ООО «КурсБлиновской» · г. Москва · support@kursblinovskoy.example · <a data-act="web" data-arg="w:/policy">Политика обработки данных</a></div>'}</div>${dev}
    <p class="tip">Это сайт платформы, каким его видит посетитель. В адресной строке можно ввести путь, например /static/backup/. Значок ◇ приобщает строку к делу.</p></div>`;
}
ACTIONS.web = id => { S.open.web = id; save(); render(); $('#main').scrollTop = 0; };
ACTIONS.dev = () => { S.open.dev = !S.open.dev; if (S.open.dev) addLog('Открыты инструменты разработчика на сайте'); save(); render(); };
function goPath(path) {
  const hit = DOCS['w:' + path] || DOCS['w:' + path + '/'] || DOCS['w:' + path.replace(/\/$/, '')];
  if (hit && hit.path !== '~devtools') { S.open.web = hit.id; save(); render(); return; }
  if (/^\/static\//.test(path) || /^\/(\.env|admin|backup)/.test(path)) { S.open.web = 'w:/static/backup/'; save(); render(); if (!/^\/static\//.test(path)) toast('Страница ' + path + ' не найдена: 404.'); return; }
  toast('Страница ' + path + ' не найдена: 404.');
}
ACTIONS.go = () => goPath($('#addr').value.trim().replace(/^https?:\/\/[^/]+/, '') || '/');
ACTIONS['go-path'] = path => goPath(path);
ACTIONS.signup = () => {
  const mail = $('#sf-mail').value.trim().toLowerCase();
  if (!mail || !$('#sf-name').value.trim()) { toast('Форма просит хотя бы имя и почту. Возраст и согласие родителя она не спрашивает.'); return; }
  signups.push(mail);
  addLog('На сайте отправлена форма регистрации: ' + mail + (signups.indexOf(mail) !== signups.length - 1 ? ' (повторно)' : ''));
  save(); render();
};
ACTIONS.bot = () => {
  const q = $('#bot-q').value.trim();
  if (!q) return;
  const replies = ['Дмитрий, по курсу «Python с нуля» ближайший дедлайн — в пятницу. Продублировать напоминание на номер из профиля?',
    'Дмитрий, вам 15 лет, поэтому сертификат о прохождении придёт на почту из профиля. Что-нибудь ещё по курсу?',
    'Дмитрий Сергеевич, я вижу ваш курс и расписание. Уточните вопрос, и я отвечу точнее.'];
  botLog.push([q, replies[botLog.length % replies.length]]);
  addLog('Задан вопрос помощнику на сайте');
  save(); render();
};

/* ---------------------------------------------------------------- хостинг */

/* Схема потоков данных: что остаётся на площадке в России и что уходит за границу. */
const FLOW = `<svg class="flow" viewBox="0 0 860 300" role="img" aria-label="Схема потоков данных сервера">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#020835"/></marker></defs>
  <rect x="170" y="14" width="470" height="272" fill="#EAF2FA" stroke="#020835" stroke-width="3"/>
  <text x="184" y="36" class="ft">РОССИЯ · МОСКВА · ЦОД «СЕВЕР-2» · vs-4-8-160</text>
  <line x1="668" y1="6" x2="668" y2="294" stroke="#AE3D37" stroke-width="3" stroke-dasharray="9 7"/><text x="676" y="22" class="fb">граница</text>
  <g class="node"><rect x="14" y="110" width="120" height="56"/><text x="74" y="134">ученик</text><text x="74" y="152" class="fs">браузер</text></g>
  <g class="node"><rect x="196" y="110" width="120" height="56"/><text x="256" y="134">nginx</text><text x="256" y="152" class="fs">80, 443</text></g>
  <g class="node"><rect x="356" y="56" width="120" height="56"/><text x="416" y="80">REST</text><text x="416" y="98" class="fs">интерфейс базы</text></g>
  <g class="node"><rect x="356" y="164" width="120" height="56"/><text x="416" y="188">бот</text><text x="416" y="206" class="fs">помощник</text></g>
  <g class="node"><rect x="506" y="56" width="120" height="56"/><text x="566" y="80">PostgreSQL</text><text x="566" y="98" class="fs">системный диск</text></g>
  <g class="node"><rect x="196" y="214" width="120" height="56"/><text x="256" y="238">/var/www</text><text x="256" y="256" class="fs">доп. диск 60 ГБ</text></g>
  <g class="node out"><rect x="700" y="164" width="146" height="56"/><text x="773" y="188">NorthLM API</text><text x="773" y="206" class="fs">США, Вирджиния</text></g>
  <g fill="none" stroke="#020835" stroke-width="2.5" marker-end="url(#ah)"><path d="M134 138H194"/><path d="M316 128L354 96"/><path d="M316 148L354 180"/><path d="M476 84H504"/><path d="M416 164V114"/><path d="M256 166V212"/></g>
  <path d="M476 192H698" fill="none" stroke="#AE3D37" stroke-width="3" marker-end="url(#ah)"/><text x="560" y="182" class="fb">3 184 соединения</text><text x="548" y="212" class="fb">за сентябрь, с 21.09</text></svg>`;

function viewHost() {
  const pages = Object.values(DOCS).filter(d => d.kind === 'panel');
  if (!S.open.host) S.open.host = pages[0].id;
  const cur = DOCS[S.open.host];
  see(cur.id);
  const tabs = pages.map(d => `<button class="ptab${d.id === cur.id ? ' on' : ''}" data-act="host" data-arg="${d.id}">${esc(d.title)}</button>`).join('');
  const rows = cur.lines.map((ln, i) => {
    if (ln.startsWith('# ')) return `<h3>${esc(ln.slice(2))}</h3>`;
    const ref = cur.id + '#' + i, cells = ln.split(' | ');
    return `<div class="ln hrow c${cells.length}${pinned(ref) ? ' pinned' : ''}">${pinBtn(ref)}${cells.map((c, n) => `<span class="${n ? 'tx' : 'tx k'}">${esc(c)}</span>`).join('')}</div>`;
  }).join('');
  let extra = '';
  if (cur.id === 'p:server') extra = `<h3>Стойка на площадке</h3>${scanHtml('host-rack', 'Стойка с серверами провайдера, снимок из карточки услуги. Фото: Derrick Coetzee, CC0, Wikimedia Commons.')}`;
  if (cur.id === 'p:net') extra = `<h3>Схема потоков данных</h3>${FLOW}<p class="tip">Схему строит панель по сетевому экрану и исходящим соединениям. Что именно передаётся в каждом соединении, панель не видит: это определяется по коду проекта.</p>`;
  if (cur.id === 'p:disks') {
    const pts = [['01.09', 71], ['10.09', 84], ['16.09', 97], ['17.09', 100], ['17.09', 93], ['01.10', 94]];
    extra = `<h3>Заполнение системного диска, %</h3><div class="bars">${pts.map(([d, v]) => `<div class="bar${v >= 97 ? ' hot' : ''}"><i style="height:${v}%"></i><b>${v}</b><span>${d}</span></div>`).join('')}</div>`;
  }
  return `<div class="pane hostp"><div class="hosthead"><span class="hlogo">ОС</span><div><p class="eyebrow">панель провайдера · доступ на чтение</p><h2>Облако Север · vs-4-8-160</h2></div><span class="hstate">● работает</span></div>
    <div class="ptabs">${tabs}</div><div class="sheet hostsheet">${cur.id === 'p:net' || cur.id === 'p:disks' ? '' : ''}${rows}${extra}</div></div>`;
}
ACTIONS.host = id => { S.open.host = id; save(); render(); };

/* ---------------------------------------------------------------- сервер */

function fileDocs() { return Object.values(DOCS).filter(d => d.kind === 'file'); }

function tree() {
  const root = {};
  for (const d of fileDocs()) {
    const parts = d.path.split('/').filter(Boolean);
    if (!showHidden && parts.some(x => x.startsWith('.'))) continue;
    let node = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) node[part] = d.id;
      else node = node[part] = node[part] || {};
    });
  }
  const walk = (node, path) => Object.keys(node).sort((a, b) => (typeof node[a] === 'string') - (typeof node[b] === 'string') || a.localeCompare(b)).map(name => {
    const full = path + '/' + name;
    if (typeof node[name] === 'string') {
      const id = node[name];
      return `<button class="tfile${S.open.file === id ? ' on' : ''}${S.seen[id] ? ' seen' : ''}${lockOf(DOCS[id]) ? ' lk' : ''}" data-act="file" data-arg="${esc(id)}">${esc(name)}</button>`;
    }
    const open = S.dirs[full] !== undefined ? S.dirs[full] : (full === '/srv' || full === '/srv/kursblinovskoy');
    return `<div class="tdir"><button class="tname" data-act="dir" data-arg="${esc(full)}">${open ? '▾' : '▸'} ${esc(name)}/</button>${open ? `<div class="tkids">${walk(node[name], full)}</div>` : ''}</div>`;
  }).join('');
  return walk(root, '');
}

function viewServer() {
  if (!S.ssh) {
    return `<div class="pane narrow"><p class="eyebrow">сервер проекта</p><h2>Вход по SSH</h2>
      <p>Учётные данные прислал технический директор. Они в почте.</p>
      <div class="sshbox"><label class="field"><span>Узел</span><input value="kursblinovskoy.example" disabled></label>
      <label class="field"><span>Пользователь</span><input id="ssh-user" autocomplete="off" spellcheck="false"></label>
      <label class="field"><span>Пароль</span><input id="ssh-pw" autocomplete="off" spellcheck="false"></label>
      <p id="ssh-err" class="err" role="alert"></p><button class="btn" data-act="ssh">Подключиться</button></div></div>`;
  }
  const cur = S.open.file && DOCS[S.open.file];
  let body;
  if (lockOf(cur)) {
    body = lockHtml(lockOf(cur));
  } else if (!cur) {
    body = `<div class="empty">Выберите файл слева или изменение в истории. Файлы можно читать и командами в терминале: <code>ls</code>, <code>cat</code>, <code>grep</code>.</div>`;
  } else {
    see(cur.id);
    const head = cur.kind === 'git'
      ? `<b>изменение ${cur.hash}</b><span>${esc(cur.author)} · ${esc(cur.date)}</span>`
      : `<b>${esc(cur.path)}</b><span>${cur.lines.length} строк</span>`;
    body = `${cur.scan ? scanHtml(cur.scan, 'Скан документа. Ниже — распознанный текст, его строки можно приобщать.') : ''}<div class="doc mono-doc"><div class="doc-head">${head}
      <input id="filter" class="filter" placeholder="показать строки, содержащие…" value="${esc(fileFilter)}" spellcheck="false"></div>
      <div id="file-lines">${linesHtml(cur, { mono: true, filter: fileFilter.toLowerCase() })}</div></div>`;
  }
  const commits = Object.values(DOCS).filter(d => d.kind === 'git').map(d =>
    `<button class="commit${S.open.file === d.id ? ' on' : ''}${S.seen[d.id] ? ' seen' : ''}" data-act="file" data-arg="${d.id}"><code>${d.hash}</code><span>${esc(d.date.slice(0, 10))} · ${esc(d.author)}</span><em>${esc(d.msg)}</em></button>`).join('');
  return `<div class="server"><aside class="tree"><p class="eyebrow">expert@kursblinovskoy</p>${tree()}
      <label class="check small"><input type="checkbox" id="hidden-toggle"${showHidden ? ' checked' : ''}> показывать скрытые файлы</label>
      <p class="eyebrow gap">история изменений</p><div class="commits">${commits}</div></aside>
    <div class="work">${body}
      <details class="cheat"><summary>Шпаргалка по командам терминала</summary><div>
        <code>ls -a</code> — файлы каталога вместе со скрытыми · <code>cd /var/log</code> — перейти в каталог · <code>cat файл</code> — вывести файл<br>
        <code>grep backup /var/log/nginx/access.log</code> — строки со словом backup<br>
        <code>grep users файл | grep -v "id=eq" | wc -l</code> — сколько строк со словом users без id=eq<br>
        <code>cut -d " " -f 1 файл | sort | uniq -c | sort -r | head -n 5</code> — пять самых частых адресов<br>
        <code>git log --oneline</code> — список изменений · <code>git show 6f2d9aa</code> — что изменено и кем</div></details>
      <div class="term"><div id="term-out" class="term-out">${termHtml()}</div>
        <div class="term-in"><span>${esc(prompt())}</span><input id="term-in" autocomplete="off" spellcheck="false" aria-label="Команда"></div></div></div></div>`;
}

ACTIONS.ssh = async () => {
  const user = $('#ssh-user').value.trim(), pw = $('#ssh-pw').value.trim();
  if (user !== 'expert' || await sha256hex(GAME.salt + '|ssh|' + pw) !== V.pub.pw) { $('#ssh-err').textContent = 'Permission denied. Проверьте пользователя и пароль в письме.'; return; }
  S.ssh = true;
  addLog('Выполнен вход на сервер под учётной записью expert');
  save(); render();
};
ACTIONS.file = id => { S.open.file = id; fileFilter = ''; save(); render(); };
ACTIONS.dir = path => {
  const open = S.dirs[path] !== undefined ? S.dirs[path] : (path === '/srv' || path === '/srv/kursblinovskoy');
  S.dirs[path] = !open; save(); render();
};

/* Терминал: чтение файлов сервера. Конвейеры через «|» поддерживаются. */

function prompt() { return 'expert@kursblinovskoy:' + term.cwd.replace('/home/expert', '~') + '$ '; }

function termHtml() {
  if (!term.out.length) return '<div class="t-o">Доступ только на чтение. Список команд: help</div>';
  return term.out.map(r => `<div class="t-c">${esc(r.p + r.c)}</div>${r.o ? `<div class="t-o">${esc(r.o)}</div>` : ''}`).join('');
}

function norm(path) {
  const out = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return '/' + out.join('/');
}

function abs(arg) {
  if (arg === '~') return '/home/expert';
  if (arg.startsWith('~/')) arg = '/home/expert/' + arg.slice(2);
  return norm(arg.startsWith('/') ? arg : term.cwd + '/' + arg);
}

function isDir(path) {
  if (path === '/' || path === '/home/expert') return true;
  return fileDocs().some(d => d.path.startsWith(path + '/'));
}

function fileAt(path) { return DOCS['f:' + path]; }

function children(path) {
  const prefix = path === '/' ? '/' : path + '/';
  const set = new Set();
  for (const d of fileDocs()) {
    if (!d.path.startsWith(prefix)) continue;
    const rest = d.path.slice(prefix.length).split('/');
    set.add(rest.length > 1 ? rest[0] + '/' : rest[0]);
  }
  return [...set].sort();
}

function tokens(s) {
  const out = [];
  s.replace(/"([^"]*)"|'([^']*)'|(\S+)/g, (m, a, b, c) => { out.push(a !== undefined ? a : b !== undefined ? b : c); return ''; });
  return out;
}

function readArg(arg) {
  const path = abs(arg);
  const doc = fileAt(path);
  if (!doc) return { err: (isDir(path) ? arg + ': это каталог' : arg + ': нет такого файла или каталога') };
  if (lockOf(doc)) return { err: arg + ': Permission denied — файл под замком, откройте его в дереве файлов' };
  see(doc.id);
  return { lines: doc.lines, path };
}

function matcher(pattern, icase) {
  try { const re = new RegExp(pattern, icase ? 'i' : ''); return s => re.test(s); }
  catch (e) { const p = icase ? pattern.toLowerCase() : pattern; return s => (icase ? s.toLowerCase() : s).includes(p); }
}

const HELP = ['Команды (доступ только на чтение):',
  '  ls [-a] [каталог]      список файлов; -a показывает скрытые',
  '  cd каталог, pwd         перейти в каталог, показать текущий',
  '  cat файл                вывести файл',
  '  grep [-i -n -v -c -r] шаблон [файл|каталог]   найти строки',
  '  head -n N, tail -n N    первые или последние строки',
  '  wc -l, sort, uniq [-c]  счёт строк, сортировка, повторы',
  '  cut -d "раздел." -f N   выбрать поле',
  '  git log [--oneline], git show ХЕШ   история изменений проекта',
  'Команды соединяются знаком |, например: grep users /var/log/api/gateway.log | grep -v "id=eq" | wc -l',
  'Приобщать строки к делу можно в просмотре файла над терминалом.'].join('\n');

function runOne(argv, stdin) {
  const cmd = argv[0], args = argv.slice(1);
  const flags = new Set();
  const rest = [];
  let n = null, delim = '\t', field = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (cmd === 'head' || cmd === 'tail') {
      if (a === '-n') { n = Number(args[++i]); continue; }
      if (/^-\d+$/.test(a)) { n = Number(a.slice(1)); continue; }
    }
    if (cmd === 'cut') {
      if (a === '-d') { delim = args[++i]; continue; }
      if (a === '-f') { field = Number(args[++i]); continue; }
      if (/^-d./.test(a)) { delim = a.slice(2); continue; }
      if (/^-f\d+$/.test(a)) { field = Number(a.slice(2)); continue; }
    }
    if (/^-[a-zA-Z]+$/.test(a) && cmd !== 'git') { for (const ch of a.slice(1)) flags.add(ch); continue; }
    rest.push(a);
  }
  const input = () => {
    if (rest.length) { const r = readArg(rest[rest.length - 1]); if (r.err) throw new Error(cmd + ': ' + r.err); return r.lines; }
    if (stdin === null) throw new Error(cmd + ': укажите файл');
    return stdin;
  };
  switch (cmd) {
    case 'help': return HELP.split('\n');
    case 'pwd': return [term.cwd];
    case 'whoami': return ['expert'];
    case 'clear': term.out = []; return [];
    case 'cd': {
      const to = abs(rest[0] || '~');
      if (!isDir(to)) throw new Error('cd: ' + (rest[0] || '') + ': нет такого каталога');
      term.cwd = to; return [];
    }
    case 'ls': {
      const path = abs(rest[0] || '.');
      if (fileAt(path)) return [rest[0]];
      if (!isDir(path)) throw new Error('ls: ' + rest[0] + ': нет такого файла или каталога');
      const names = children(path).filter(x => flags.has('a') || !x.startsWith('.'));
      if (flags.has('l')) return names.map(x => x.endsWith('/') ? 'd  ' + x : '-  ' + String(fileAt((path === '/' ? '' : path) + '/' + x).lines.length).padStart(4) + ' строк  ' + x);
      return names.length ? [names.join('  ')] : [];
    }
    case 'cat': return input();
    case 'head': return input().slice(0, n || 10);
    case 'tail': return input().slice(-(n || 10));
    case 'wc': return [String(input().length)];
    case 'sort': { const out = [...input()].sort(); return flags.has('r') ? out.reverse() : out; }
    case 'uniq': {
      const out = [];
      for (const ln of input()) { if (out.length && out[out.length - 1][0] === ln) out[out.length - 1][1]++; else out.push([ln, 1]); }
      return out.map(([ln, c]) => flags.has('c') ? String(c).padStart(7) + ' ' + ln : ln);
    }
    case 'cut': {
      if (!field) throw new Error('cut: укажите поле: -f N');
      return input().map(ln => ln.split(delim)[field - 1] || '');
    }
    case 'grep': {
      if (!rest.length) throw new Error('grep: укажите шаблон');
      const test = matcher(rest[0], flags.has('i'));
      const keep = s => test(s) !== flags.has('v');
      let sources;
      if (rest.length > 1) {
        sources = [];
        for (const arg of rest.slice(1)) {
          const path = abs(arg);
          if (fileAt(path) && lockOf(fileAt(path))) throw new Error('grep: ' + arg + ': Permission denied — файл под замком, откройте его в дереве файлов');
          if (fileAt(path)) { see('f:' + path); sources.push([rest.length > 2 ? arg : '', fileAt(path).lines]); }
          else if (isDir(path) && flags.has('r')) fileDocs().filter(d => !lockOf(d) && d.path.startsWith(path === '/' ? '/' : path + '/')).forEach(d => sources.push([d.path, d.lines]));
          else throw new Error('grep: ' + arg + (isDir(path) ? ': это каталог, добавьте -r' : ': нет такого файла или каталога'));
        }
      } else {
        if (stdin === null) throw new Error('grep: укажите файл');
        sources = [['', stdin]];
      }
      const out = [];
      let count = 0;
      for (const [name, lines] of sources) lines.forEach((ln, i) => {
        if (!keep(ln)) return;
        count++;
        out.push((name ? name + ':' : '') + (flags.has('n') ? (i + 1) + ':' : '') + ln);
      });
      return flags.has('c') ? [String(count)] : out;
    }
    case 'git': {
      const commits = Object.values(DOCS).filter(d => d.kind === 'git');
      if (args[0] === 'log') {
        const list = [...commits].reverse();
        if (args.includes('--oneline')) return list.map(d => d.hash + ' ' + d.msg);
        return list.flatMap(d => ['commit ' + d.hash, 'Author: ' + d.author, 'Date:   ' + d.date, '', '    ' + d.msg, '']);
      }
      if (args[0] === 'show') {
        const d = commits.find(x => args[1] && x.hash.startsWith(args[1]));
        if (!d) throw new Error('git show: изменение не найдено. Хеши — в git log --oneline');
        see(d.id);
        return d.lines;
      }
      throw new Error('git: доступны git log и git show ХЕШ');
    }
  }
  throw new Error(cmd + ': команда не найдена. Список команд: help');
}

function runLine(line) {
  const stages = line.split('|').map(s => tokens(s.trim())).filter(a => a.length);
  let data = null;
  try {
    for (const argv of stages) data = runOne(argv, data);
    return (data || []).join('\n');
  } catch (e) { return e.message; }
}

/* ---------------------------------------------------------------- MAX */

function viewMax() {
  const list = Object.values(DOCS).filter(d => d.kind === 'chat' && available(d));
  if (!S.open.chat || !available(DOCS[S.open.chat])) S.open.chat = list[0].id;
  const cur = DOCS[S.open.chat];
  const later = Object.values(DOCS).filter(d => d.kind === 'chat' && !available(d)).map(d => `<div class="item off"><b>${esc(d.title)}</b><span>${d.stage <= S.stage ? 'нужно ходатайство' : 'переписка ещё не передана суду'}</span></div>`).join('');
  const items = list.map(d => `<button class="item${d.id === cur.id ? ' on' : ''}${S.seen[d.id] ? '' : ' new'}${lockOf(d) ? ' lk' : ''}" data-act="chat" data-arg="${d.id}">
    <b>${esc(d.title)}</b><span>${esc(d.sub)}</span><small>${d.lines.length} сообщений</small></button>`).join('') + later;
  if (lockOf(cur)) return `<div class="split"><div class="list"><p class="eyebrow pad">MAX · выгрузка переписки</p>${items}</div>${lockHtml(lockOf(cur))}</div>`;
  see(cur.id);
  let day = '';
  const msgs = cur.lines.map((m, i) => {
    const ref = cur.id + '#' + i;
    const head = m.d !== day ? `<div class="day">${m.d}.2026</div>` : '';
    day = m.d;
    if (m.sys) return `${head}<div class="sysmsg">${esc(m.x)} · ${m.t}</div>`;
    const wave = Array.from({ length: 26 }, (x, k) => `<i style="height:${5 + (k * 7 + i * 3) % 15}px"></i>`).join('');
    const body = m.x === null ? '<em class="gone">Сообщение удалено</em>'
      : m.st ? `<span class="sticker">${m.st}</span>`
      : m.voice ? `<span class="voice"><span class="vplay">▶</span><span class="vwave">${wave}</span><span class="vdur">${m.voice}</span></span><span class="vtext">Расшифровка: ${esc(m.x)}</span>`
      : (m.q ? `<blockquote><b>${esc(V.pub.people[m.q.w])}</b>${esc(m.q.x)}</blockquote>` : '') + (m.img ? `<img class="cimg" src="media/${m.img}.jpg" alt="снимок экрана" loading="lazy">` : '') + esc(m.x);
    return `${head}<div class="msg who-${m.w}${pinned(ref) ? ' pinned' : ''}${m.st ? ' stk' : ''}">${pinBtn(ref)}${portrait(m.w, 36)}<div class="bubble"><b>${esc(V.pub.people[m.w])}</b><p>${body}</p><time>${m.t}</time>${m.re ? `<span class="react">${m.re}</span>` : ''}</div></div>`;
  }).join('');
  return `<div class="split"><div class="list"><p class="eyebrow pad">MAX · выгрузка переписки</p>${items}</div>
    <article class="pane chat"><h2>${esc(cur.title)}</h2><p class="meta">${esc(cur.sub)}</p><div class="msgs">${msgs}</div></article></div>`;
}
ACTIONS.chat = id => { S.open.chat = id; save(); render(); };

/* ---------------------------------------------------------------- кадры */

function hrPages(doc) {
  const pages = [];
  doc.lines.forEach((ln, i) => {
    if (ln.startsWith('# ')) pages.push({ title: ln.slice(2), rows: [] });
    else pages[pages.length - 1].rows.push(i);
  });
  return pages;
}

function viewHr() {
  if (S.stage < 2) return lockedView('Кадры', 'Личные дела суд истребует после того, как вы установите путь выгрузки. Раздел откроется по итогам этапа 2.');
  const list = Object.values(DOCS).filter(d => d.kind === 'hr');
  const cur = S.open.hr && DOCS[S.open.hr];
  if (!cur) {
    const stamp = { 'h:ahmetov': 'уволен', 'h:lykov': 'подряд', 'h:tabel': 'табель' };
    return `<div class="pane"><p class="eyebrow">кадровые документы</p><h2>Личные дела</h2>
      <p>Папки переданы суду кадровым делопроизводством. В каждой — несколько листов: карточка, выдержки из должностной инструкции, приказы, отметки.</p>
      <div class="shelf">${list.map(d => `<button class="folder${S.seen[d.id] ? ' seen' : ''}" data-act="hr" data-arg="${d.id}">
        <span class="ftab">${d.id === 'h:tabel' ? 'Т-13' : 'дело № ' + (list.indexOf(d) + 1)}</span>
        <span class="fbody">${d.id === 'h:tabel' ? '<span class="ficon">▦</span>' : portrait(d.id.slice(2), 72)}
          <b>${esc(d.title)}</b><small>${esc(d.sub)}</small>${stamp[d.id] ? `<i class="stamp">${stamp[d.id]}</i>` : ''}${lockOf(d) ? '<i class="stamp seal">опечатано</i>' : ''}${S.seen[d.id] ? '' : '<em>не открывалось</em>'}</span></button>`).join('')}</div></div>`;
  }
  if (lockOf(cur)) return `<div><button class="btn ghost small" data-act="hr" data-arg="">← К папкам</button><div style="height:14px"></div>${lockHtml(lockOf(cur))}</div>`;
  see(cur.id);
  const pages = hrPages(cur);
  const at = Math.min(S.open.page || 0, pages.length - 1);
  const page = pages[at];
  const mono = cur.id === 'h:tabel';
  const rows = page.rows.map(i => {
    const ref = cur.id + '#' + i, ln = cur.lines[i];
    const k = mono ? -1 : ln.indexOf(': ');
    const body = k > 0 && k < 60 && !/^п\. /.test(ln) ? `<span class="tx"><span class="lbl">${esc(ln.slice(0, k))}</span>${esc(ln.slice(k + 2))}</span>` : `<span class="tx">${esc(ln)}</span>`;
    return `<div class="ln${pinned(ref) ? ' pinned' : ''}${mono ? ' pre' : ''}">${pinBtn(ref)}${body}</div>`;
  }).join('');
  const tabs = pages.map((pg, n) => `<button class="ptab${n === at ? ' on' : ''}" data-act="hr-page" data-arg="${n}">${esc(pg.title.length > 34 ? pg.title.slice(0, 32) + '…' : pg.title)}</button>`).join('');
  return `<div class="pane dossier"><button class="btn ghost small" data-act="hr" data-arg="">← К папкам</button>
    <div class="dhead">${mono ? '' : portrait(cur.id.slice(2), 84)}<div><p class="eyebrow">${mono ? 'табель' : 'личное дело'}</p><h2>${esc(cur.title)}</h2><p class="meta">${esc(cur.sub)}</p></div></div>
    <div class="ptabs">${tabs}</div>
    <div class="sheet"><div class="sheet-h"><b>${esc(page.title)}</b><span>лист ${at + 1} из ${pages.length}</span></div>
      ${(cur.scans || {})[page.title] ? scanHtml(cur.scans[page.title], 'Скан листа. Ниже — его текст строками.') : ''}${rows}
      <div class="sheet-f"><button class="btn ghost small" data-act="hr-page" data-arg="${at - 1}"${at ? '' : ' disabled'}>← Предыдущий лист</button>
      <button class="btn ghost small" data-act="hr-page" data-arg="${at + 1}"${at < pages.length - 1 ? '' : ' disabled'}>Следующий лист →</button></div></div></div>`;
}
ACTIONS.hr = id => { S.open.hr = id || null; S.open.page = 0; save(); render(); };
ACTIONS['hr-page'] = n => { S.open.page = Number(n); save(); render(); };

/* ---------------------------------------------------------------- опросы */

function viewTalks() {
  if (S.stage < 2 || !S.pets.includes('p3')) return lockedView('Опросы', 'Записи опросов хранятся у следователя. Суд истребует их по вашему ходатайству: блок «Ходатайства» в разделе «Задания» появится на третьем этапе.');
  const list = Object.values(DOCS).filter(d => d.kind === 'talk');
  if (!S.open.talk) S.open.talk = list[0].id;
  const cur = DOCS[S.open.talk];
  if (!lockOf(cur)) see(cur.id);
  const items = list.map(d => `<button class="item row${d.id === cur.id ? ' on' : ''}${S.seen[d.id] ? '' : ' new'}${lockOf(d) ? ' lk' : ''}" data-act="talk" data-arg="${d.id}">${portrait(d.who, 40)}<span><b>${esc(d.title)}</b><span>${esc(d.sub)}</span></span></button>`).join('');
  const msgs = cur.lines.map((m, i) => {
    const ref = cur.id + '#' + i;
    const inv = m.w === 'inv';
    return `<div class="turn${inv ? ' q' : ' a'}${pinned(ref) ? ' pinned' : ''}" data-cue="${cur.cues[i]}">${pinBtn(ref)}<button class="play" data-act="cue" data-arg="${cur.cues[i]}" title="Слушать с этого места">▶</button><code>${m.t}</code>${portrait(m.w, 34)}<div><b>${inv ? 'Следователь' : esc(V.pub.people[m.w])}</b><p>${esc(m.x)}</p></div></div>`;
  }).join('');
  if (lockOf(cur)) return `<div class="split"><div class="list"><p class="eyebrow pad">материал проверки · ст. 272.1 УК</p>${items}</div>${lockHtml(lockOf(cur))}</div>`;
  return `<div class="split"><div class="list"><p class="eyebrow pad">материал проверки · ст. 272.1 УК</p>${items}</div>
    <article class="pane"><p class="eyebrow">расшифровка аудиозаписи</p><h2>${esc(cur.title)}</h2><p class="meta">${esc(cur.sub)} · опрос проводит следователь Мальцев А. Р.</p>
      <div class="player"><span class="rec">● REC</span><audio id="aud" controls preload="metadata" src="media/${cur.audio}.mp3"></audio></div>
      <div class="turns">${msgs}</div>
      ${scanHtml('talk-recorder', 'Диктофон, на который велась запись; приобщён к материалу проверки. Фото: R. Henrik Nilsson, CC BY 4.0, Wikimedia Commons.')}
      <p class="tip">В записи оставлены фрагменты опроса, отметки времени слева — по полной записи. Кнопка ▶ включает запись с выбранной реплики. Голоса озвучены синтезатором речи. Ответы сверяйте с журналами, перепиской и документами.</p></article></div>`;
}
ACTIONS.talk = id => { S.open.talk = id; audioKeep = null; save(); render(); };
ACTIONS.cue = sec => { const a = $('#aud'); a.currentTime = Number(sec); a.play(); };
let audioKeep = null;

function lockedView(title, text) {
  return `<div class="pane narrow"><p class="eyebrow">раздел закрыт</p><h2>${title}</h2><p>${text}</p></div>`;
}

/* ---------------------------------------------------------------- улики и блокнот */

function viewPins() {
  const KIND = { panel: 'хостинг', file: 'файл', git: 'изменение', mail: 'письмо', att: 'вложение', chat: 'MAX', hr: 'кадры', web: 'сайт', talk: 'опрос' };
  const cards = S.pins.map((p, n) => {
    const r = refInfo(p.ref), ln = r.doc.lines[r.i];
    const thumb = typeof ln === 'object' ? portrait(ln.w, 40) : `<span class="ekind">${KIND[r.doc.kind]}</span>`;
    return `<div class="ecard r${n % 5}${draft.linkFrom === n ? ' sel' : ''}" data-card="${esc(p.ref)}"><i class="pinhead"></i>
      <div class="ehead">${thumb}<small>${esc(r.where)}</small></div><p class="quote">${esc(r.text.length > 230 ? r.text.slice(0, 230) + '…' : r.text)}</p>
      <textarea data-note="${n}" rows="2" placeholder="Что доказывает эта запись"${S.done ? ' disabled' : ''}>${esc(p.note)}</textarea>
      <div class="ebtns">${S.done ? '' : `<button class="btn ghost small" data-act="thread" data-arg="${n}">${draft.linkFrom === n ? 'Выберите вторую' : 'Нить'}</button>`}
      ${frozen() ? '' : `<button class="btn ghost small" data-pin="${esc(p.ref)}">Снять</button>`}</div></div>`;
  }).join('');
  return `<div class="pane"><p class="eyebrow">доска расследования</p><h2>Улики: ${S.pins.length} из ${GAME.maxPins}</h2>
    <p>На доске — записи, которые вы приобщили значком ◇. В заседании предъявляются только они.
    Кнопка «Нить» соединяет две связанные улики: нажмите её на одной карточке, затем на другой. Повторное соединение снимает нить.
    ${frozen() ? 'Заседание открыто, состав улик не меняется.' : 'К каждой записи допишите, что она доказывает: пояснения и связи войдут в файл дела.'}</p>
    <div class="cork" id="cork"><svg class="threads"></svg>${cards || '<div class="ecard r1"><i class="pinhead"></i><p class="quote">Доска пуста. Откройте письмо, файл, чат, личное дело или запись опроса и нажмите ◇ у нужной строки.</p></div>'}</div></div>`;
}

ACTIONS.thread = n => {
  n = Number(n);
  if (draft.linkFrom === null || draft.linkFrom === undefined) draft.linkFrom = n;
  else if (draft.linkFrom === n) draft.linkFrom = null;
  else {
    const a = S.pins[draft.linkFrom].ref, b = S.pins[n].ref;
    const at = S.links.findIndex(l => (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a));
    if (at >= 0) S.links.splice(at, 1); else { S.links.push([a, b]); addLog('Улики связаны нитью: ' + refInfo(a).where + ' — ' + refInfo(b).where); }
    draft.linkFrom = null;
    save();
  }
  render();
};

function drawThreads() {
  const cork = $('#cork');
  if (!cork) return;
  const base = cork.getBoundingClientRect();
  const at = ref => { const el = cork.querySelector(`[data-card="${CSS.escape(ref)}"] .pinhead`); if (!el) return null; const r = el.getBoundingClientRect(); return [r.left + 8 - base.left, r.top + 8 - base.top]; };
  cork.querySelector('.threads').innerHTML = S.links.map(([a, b]) => {
    const p = at(a), q = at(b);
    if (!p || !q) return '';
    const sag = 18 + Math.abs(p[0] - q[0]) / 14;
    return `<path d="M${p[0]} ${p[1]} Q${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2 + sag} ${q[0]} ${q[1]}"/>`;
  }).join('');
}
window.addEventListener('resize', drawThreads);

function viewNotes() {
  const log = S.log.slice().reverse().map(l => `<div class="logrow"><code>${clock(l.t)}</code><span>${esc(l.x)}</span></div>`).join('');
  return `<div class="pane"><p class="eyebrow">рабочие записи</p><h2>Блокнот</h2>
    <p>Записывайте версии, противоречия в словах участников и то, что ещё нужно проверить. Блокнот войдёт в файл дела без изменений.</p>
    <textarea id="notes" class="notes" rows="14" placeholder="Версия 1: …&#10;Что её подтверждает: …&#10;Что ей противоречит: …"${S.done ? ' disabled' : ''}>${esc(S.notes)}</textarea>
    <h3>Ход расследования</h3><div class="log">${log}</div></div>`;
}

/* ---------------------------------------------------------------- задания */

const NONE = '__none__';   // «среди моих улик подходящей нет»

function pinPicker(name, value, court) {
  const none = court ? `<label class="pick none"><input type="radio" name="${name}" value="${NONE}"${value === NONE ? ' checked' : ''}><span><small>честный ответ суду</small>Среди приобщённых улик подходящей записи нет</span></label>` : '';
  if (!S.pins.length) return none ? `<div class="picker">${none}</div>` : '<div class="empty small">Улик пока нет. Найдите нужную запись в материалах и приобщите её значком ◇.</div>';
  return `<div class="picker">${none}${S.pins.map(p => {
    const r = refInfo(p.ref);
    return `<label class="pick"><input type="radio" name="${name}" value="${esc(p.ref)}"${value === p.ref ? ' checked' : ''}><span><small>${esc(r.where)}</small>${esc(r.text.length > 170 ? r.text.slice(0, 170) + '…' : r.text)}</span></label>`;
  }).join('')}</div>`;
}

/* Задания с перетаскиванием: их ответ хранится в draft, поля ввода не используются. */
const BOARD = ['order', 'chain', 'match'];

function boardInit(t) {
  if (draft[t.id]) return draft[t.id];
  draft[t.id] = t.type === 'order' ? t.options.map((o, i) => i) : (t.type === 'chain' ? t.slots : t.left).map(() => null);
  return draft[t.id];
}

function boardHtml(t) {
  const v = boardInit(t), id = t.id;
  if (t.type === 'order') {
    return `<div class="board order">${v.map((o, pos) => `<div class="card" draggable="true" data-drag="${id}|${pos}" data-drop="${id}|${pos}">
      <span class="grip">⋮⋮</span><b>${pos + 1}</b><span>${esc(t.options[o])}</span>
      <span class="moves"><button data-act="move" data-arg="${id}|${pos}|-1" aria-label="Выше"${pos ? '' : ' disabled'}>↑</button><button data-act="move" data-arg="${id}|${pos}|1" aria-label="Ниже"${pos < v.length - 1 ? '' : ' disabled'}>↓</button></span></div>`).join('')}</div>`;
  }
  if (t.type === 'chain') {
    const used = new Set(v.filter(x => x !== null));
    return `<div class="board chain"><div class="slots">${t.slots.map((sl, n) => `<div class="slot${v[n] !== null ? ' full' : ''}" data-drop="${id}|${n}" data-act="unslot" data-arg="${id}|${n}">
        <small>${n + 1}. ${esc(sl)}</small>${v[n] !== null ? `<span class="chip in" draggable="true" data-drag="${id}|${v[n]}">${esc(t.options[v[n]])}</span>` : '<em>перетащите сюда</em>'}</div>${n < t.slots.length - 1 ? '<i class="arr">→</i>' : ''}`).join('')}</div>
      <div class="pool">${t.options.map((o, i) => used.has(i) ? '' : `<button class="chip" draggable="true" data-drag="${id}|${i}" data-act="chip" data-arg="${id}|${i}">${esc(o)}</button>`).join('')}</div></div>`;
  }
  const sel = draft[id + ':sel'];
  return `<div class="board match" data-match="${id}"><svg class="wires"></svg><div class="mcol">${t.left.map((l, n) => `<button class="mitem l${sel === n ? ' sel' : ''}${v[n] !== null ? ' linked' : ''}" draggable="true" data-drag="${id}|${n}" data-act="mleft" data-arg="${id}|${n}" data-l="${n}">${esc(l)}<i></i></button>`).join('')}</div>
    <div class="mcol">${t.options.map((o, n) => `<button class="mitem r${v.includes(n) ? ' linked' : ''}" data-drop="${id}|${n}" data-act="mright" data-arg="${id}|${n}" data-r="${n}"><i></i>${esc(o)}</button>`).join('')}</div></div>`;
}

function taskOf(id) { if (!id.startsWith('lock-')) return V.pub.tasks.find(x => x.id === id); const [, lid, n] = id.split('-'); return lockTask(V.pub.locks.find(l => l.id === lid), Number(n)); }

function boardDrop(from, to) {
  const [id, a] = from.split('|'), [id2, b] = to.split('|');
  if (id !== id2) return;
  const t = taskOf(id), v = boardInit(t);
  if (t.type === 'order') { const [x] = v.splice(Number(a), 1); v.splice(Number(b), 0, x); }
  else if (t.type === 'chain') { const chip = Number(a), was = v.indexOf(chip); if (was >= 0) v[was] = v[Number(b)]; v[Number(b)] = chip; }
  else { v.forEach((r, n) => { if (r === Number(b)) v[n] = null; }); v[Number(a)] = Number(b); }
  render();
}
ACTIONS.move = arg => { const [id, pos, d] = arg.split('|'); boardDrop(id + '|' + pos, id + '|' + (Number(pos) + Number(d))); };
ACTIONS.chip = arg => { const [id, chip] = arg.split('|'); const v = boardInit(taskOf(id)); const free = v.indexOf(null); if (free >= 0) { v[free] = Number(chip); render(); } };
ACTIONS.unslot = arg => { const [id, n] = arg.split('|'); const v = boardInit(taskOf(id)); if (v[Number(n)] !== null) { v[Number(n)] = null; render(); } };
ACTIONS.mleft = arg => { const [id, n] = arg.split('|'); const v = boardInit(taskOf(id)); if (v[Number(n)] !== null) v[Number(n)] = null; draft[id + ':sel'] = draft[id + ':sel'] === Number(n) ? null : Number(n); render(); };
ACTIONS.mright = arg => { const [id, n] = arg.split('|'); const sel = draft[id + ':sel']; if (sel === null || sel === undefined) { toast('Сначала нажмите утверждение слева.'); return; } draft[id + ':sel'] = null; boardDrop(id + '|' + sel, id + '|' + n); };

let dragFrom = null;
document.addEventListener('dragstart', e => { const el = e.target.closest && e.target.closest('[data-drag]'); if (el) { dragFrom = el.dataset.drag; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragFrom); } });
document.addEventListener('dragover', e => { const el = e.target.closest && e.target.closest('[data-drop]'); if (el && dragFrom) { e.preventDefault(); el.classList.add('over'); } });
document.addEventListener('dragleave', e => { const el = e.target.closest && e.target.closest('[data-drop]'); if (el) el.classList.remove('over'); });
document.addEventListener('drop', e => { const el = e.target.closest && e.target.closest('[data-drop]'); if (el && dragFrom) { e.preventDefault(); const from = dragFrom; dragFrom = null; boardDrop(from, el.dataset.drop); } });

/* Линии между соединёнными карточками. */
function drawWires() {
  document.querySelectorAll('[data-match]').forEach(box => {
    const v = draft[box.dataset.match] || [], svg = box.querySelector('.wires'), base = box.getBoundingClientRect();
    svg.innerHTML = v.map((r, n) => {
      if (r === null) return '';
      const a = box.querySelector(`[data-l="${n}"] i`).getBoundingClientRect(), b = box.querySelector(`[data-r="${r}"] i`).getBoundingClientRect();
      const x1 = a.left + 6 - base.left, y1 = a.top + 6 - base.top, x2 = b.left + 6 - base.left, y2 = b.top + 6 - base.top, m = (x1 + x2) / 2;
      return `<path d="M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`;
    }).join('');
  });
}
window.addEventListener('resize', drawWires);

function widget(kind, name, options, value, off) {
  const dis = off ? ' disabled' : '';
  if (kind === 'evidence') return off ? `<div class="given">${value && value !== NONE ? esc(refInfo(value).where + ' — ' + refInfo(value).text) : 'Специалист сообщил суду, что подходящей улики среди приобщённых нет'}</div>` : pinPicker(name, value, name.startsWith('c-'));
  if (kind === 'single') return `<div class="opts">${options.map((o, i) => `<label class="opt"><input type="radio" name="${name}" value="${i}"${Number(value) === i && value !== undefined && value !== null ? ' checked' : ''}${dis}><span>${esc(o)}</span></label>`).join('')}</div>`;
  if (kind === 'multi') return `<div class="opts">${options.map((o, i) => `<label class="opt"><input type="checkbox" name="${name}" value="${i}"${(value || []).includes(i) ? ' checked' : ''}${dis}><span>${esc(o)}</span></label>`).join('')}</div>`;
  if (kind === 'datetime') {
    const [d, t] = (value || 'T').split('T');
    return `<div class="dt"><input type="date" name="${name}-d" value="${d}" min="2026-09-01" max="2026-10-31"${dis}><input type="time" name="${name}-t" value="${t}"${dis}></div>`;
  }
  return `<input class="short" name="${name}" value="${esc(value === undefined || value === null ? '' : value)}" ${kind === 'number' ? 'inputmode="numeric"' : ''} autocomplete="off" spellcheck="false"${dis}>`;
}

function readWidget(kind, name, root) {
  const q = s => root.querySelector(s);
  if (kind === 'evidence' || kind === 'single') { const el = q(`input[name="${name}"]:checked`); return el ? (kind === 'single' ? Number(el.value) : el.value) : null; }
  if (kind === 'multi') return [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(el => Number(el.value));
  if (kind === 'datetime') { const d = q(`input[name="${name}-d"]`).value, t = q(`input[name="${name}-t"]`).value; return d && t ? d + 'T' + t : null; }
  const v = q(`input[name="${name}"]`).value.trim();
  return v === '' ? null : v;
}

function showAnswer(kind, options, value, t) {
  if (value === null || value === undefined || value === '') return '—';
  if (kind === 'evidence') return value === NONE ? 'подходящей улики среди приобщённых нет' : refInfo(value).where;
  if (kind === 'single') return options[value];
  if (kind === 'multi') return value.length ? value.map(i => options[i]).join('; ') : '—';
  if (kind === 'order' || kind === 'chain') return value.map(i => i === null ? '—' : options[i]).join(' → ');
  if (kind === 'match') return value.map((r, n) => (t ? t.left[n] : n + 1) + ' — ' + (r === null ? 'нет пары' : options[r])).join('; ');
  if (kind === 'datetime') return value.slice(8, 10) + '.' + value.slice(5, 7) + '.' + value.slice(0, 4) + ' ' + value.slice(11);
  return String(value);
}

function viewTasks() {
  let html = `<div class="pane"><p class="eyebrow">промежуточные выводы для суда</p><h2>Задания расследования</h2>
    <p>Каждый этап закрывается, когда закрыты все его задания. После этого суд истребует новые материалы. В части заданий карточки перетаскиваются, соединяются или собираются в цепочку.
    Неверный ответ и подсказка снимают по одному баллу. Если задание не получается, ответ можно открыть: баллов за него не будет, но расследование продолжится.</p>`;
  for (let st = 0; st < 3; st++) {
    const list = V.pub.tasks.filter(t => t.stage === st);
    html += `<h3 class="stage-h">Этап ${st + 1}. ${STAGES[st]}</h3>`;
    if (st > S.stage) { html += `<div class="empty small">Откроется после заданий этапа ${st}.</div>`; continue; }
    if (st === 2) html += `<div class="pets"><b>Ходатайства</b><p>Суд истребует материалы по вашему ходатайству. Три — без условий, каждое следующее стоит 2 балла. Заявлено: ${S.pets.length}.</p>
      ${V.pub.pets.map(x => `<div class="pet${S.pets.includes(x.id) ? ' done' : ''}"><div><b>${esc(x.title)}</b><span>${esc(x.note)}</span></div>${S.pets.includes(x.id) ? '<i>удовлетворено</i>' : (frozen() ? '' : `<button class="btn ghost small" data-act="pet" data-arg="${x.id}">Заявить${S.pets.length >= 3 ? ' (−2 балла)' : ''}</button>`)}</div>`).join('')}</div>`;
    for (const t of list) {
      const st8 = S.tasks[t.id] || {};
      const closed = !!st8.s;
      const sec = V.sec.tasks[t.id];
      html += `<div class="task${st8.s === 'ok' ? ' ok' : st8.s === 'skip' ? ' skip' : ''}" data-task="${t.id}">
        <div class="task-head"><b>${esc(t.title)}</b><span>${closed ? taskScore(t, st8) + ' из ' + t.pts : 'до ' + t.pts + ' баллов'}</span></div>
        <p>${esc(t.text)}</p>`;
      if (closed) {
        const key = t.type === 'evidence' ? refInfo(sec.key[0]).where + ' — ' + refInfo(sec.key[0]).text : showAnswer(t.type, t.options, t.type === 'multi' || BOARD.includes(t.type) ? sec.key : sec.key[0], t);
        html += `<div class="given"><b>${st8.s === 'ok' ? 'Верно' : 'Ответ открыт'}:</b> ${esc(key)}</div><p class="why">${esc(sec.why)}</p>`;
      } else {
        html += BOARD.includes(t.type) ? boardHtml(t) : widget(t.type, 'w-' + t.id, t.options, draft[t.id]);
        if (st8.h) html += `<p class="hint">Подсказка: ${esc(t.hint)}</p>`;
        if (st8.msg) html += `<p class="err">${esc(st8.msg)}</p>`;
        html += `<div class="task-btns"><button class="btn small" data-act="check" data-arg="${t.id}">Проверить</button>
          ${st8.h ? '' : `<button class="btn ghost small" data-act="hint" data-arg="${t.id}">Подсказка (−1 балл)</button>`}
          <button class="btn ghost small" data-act="skip" data-arg="${t.id}">Открыть ответ (0 баллов)</button>
          ${st8.w ? `<span class="muted">неверных попыток: ${st8.w}</span>` : ''}</div>`;
      }
      html += '</div>';
    }
  }
  if (S.stage >= 3) html += `<div class="notice">Все задания закрыты. Заседание открывается в разделе «Суд».</div>`;
  return html + '</div>';
}

function keepDrafts() {
  document.querySelectorAll('[data-task]').forEach(el => {
    const t = V.pub.tasks.find(x => x.id === el.dataset.task);
    if (!(S.tasks[t.id] && S.tasks[t.id].s) && !BOARD.includes(t.type)) draft[t.id] = readWidget(t.type, 'w-' + t.id, el);
  });
}

function advance() {
  const left = V.pub.tasks.filter(t => t.stage === S.stage && !(S.tasks[t.id] && S.tasks[t.id].s));
  if (left.length || S.stage >= 3) return;
  S.stage++;
  addLog('Этап закрыт. Открыт этап «' + STAGES[S.stage] + '»');
  const fresh = Object.values(DOCS).filter(d => (d.kind === 'hr' ? 2 : d.stage) === S.stage);
  const n = k => fresh.filter(d => d.kind === k).length;
  const parts = [];
  if (S.stage === 2) parts.push('суд принимает ходатайства');
  if (n('mail')) parts.push('писем: ' + n('mail'));
  if (n('chat')) parts.push('чатов в MAX: ' + n('chat'));
  if (n('hr')) parts.push('открыты разделы «Кадры» и «Опросы»');
  toast('Поступили новые материалы — ' + parts.join(', ') + '.');
  if (S.stage === 3) toast('Заседание назначено. Раздел «Суд» открыт.');
}

ACTIONS.check = id => {
  keepDrafts();
  const t = V.pub.tasks.find(x => x.id === id);
  const st = S.tasks[id] = S.tasks[id] || { w: 0 };
  const val = draft[id];
  if (val === null || val === undefined || (Array.isArray(val) && (!val.length || val.includes(null)))) { st.msg = BOARD.includes(t.type) ? 'Заполните все места.' : 'Ответ не выбран.'; render(); return; }
  if (answerOk(t.type, V.sec.tasks[id].key, val)) {
    st.s = 'ok'; st.msg = ''; st.a = val; draft[id] = null;
    addLog('Задание «' + t.title + '» закрыто: ' + taskScore(t, st) + ' из ' + t.pts);
    advance();
  } else {
    st.w++;
    st.msg = t.type === 'evidence' ? 'Эта запись вывод не подтверждает. Попытка стоит 1 балл.' : 'Не сходится с материалами. Попытка стоит 1 балл.';
    addLog('Задание «' + t.title + '»: неверный ответ (' + showAnswer(t.type, t.options, val, t) + ')');
  }
  save(); render();
};
ACTIONS.hint = id => {
  keepDrafts();
  const st = S.tasks[id] = S.tasks[id] || { w: 0 };
  st.h = 1;
  addLog('Взята подсказка к заданию «' + V.pub.tasks.find(x => x.id === id).title + '»');
  save(); render();
};
ACTIONS.skip = id => {
  keepDrafts();
  const t = V.pub.tasks.find(x => x.id === id);
  if (!confirm('Открыть ответ на задание «' + t.title + '»? Баллов за него не будет.')) return;
  const st = S.tasks[id] = S.tasks[id] || { w: 0 };
  st.s = 'skip'; st.msg = '';
  addLog('Ответ на задание «' + t.title + '» открыт без баллов');
  advance();
  save(); render();
};

/* ---------------------------------------------------------------- суд */

function fineText(lo, hi) {
  const f = x => x >= 1000 ? (x / 1000).toLocaleString('ru-RU') + ' млн ₽' : x + ' тыс. ₽';
  return 'от ' + f(lo) + ' до ' + f(hi);
}

function viewCourt() {
  if (S.stage < 3) return lockedView('Суд', 'Заседание назначат, когда будут закрыты задания трёх этапов расследования.');
  const steps = V.pub.court;
  if (!S.court.on) {
    return `<div class="pane narrow"><p class="eyebrow">заседание</p><h2>Перед заседанием</h2>
      <p>Суд и стороны зададут ${steps.length} вопросов. Порядок игровой и упрощён по сравнению с настоящим процессом.</p>
      <ul class="rules"><li>Ответ даётся один раз, изменить его нельзя.</li>
      <li>Предъявлять можно только приобщённые улики. Сейчас их ${S.pins.length} из ${GAME.maxPins}. После начала заседания состав улик не меняется.</li>
      <li>Материалы дела остаются открытыми для чтения.</li>
      <li>После вопросов вы предложите суду решение по организации и по каждому участнику.</li></ul>
      <button class="btn" data-act="court-start">Перейти к заседанию</button></div>`;
  }
  const stepHtml = (s, n, done) => {
    const ans = S.court.answers[s.id] || [];
    let h = `<div class="step${done ? ' done' : ''}"><div class="say who-${s.who}">${portrait(s.who, 52)}<div><b>${WHO[s.who]}</b><p>${esc(s.say)}</p></div></div>`;
    if (s.ask) h += `<div class="say who-judge">${portrait('judge', 52)}<div><b>${WHO.judge}</b><p>${esc(s.ask)}</p></div></div>`;
    h += `<div class="reply" data-step="${s.id}"><b>${done ? esc(WHO.me) : esc(WHO.me) + ' · трибуна'}</b>`;
    s.parts.forEach((part, i) => {
      h += `<div class="part">${part.label ? `<p class="plabel">${esc(part.label)}</p>` : ''}${widget(part.kind, 'c-' + s.id + '-' + i, part.options, done ? ans[i] : (draft[s.id] || [])[i], done)}</div>`;
    });
    if (done) {
      h += '</div>' + V.sec.react[s.id].map(([who, text]) => `<div class="say small who-${who}">${portrait(who, 36)}<div><b>${WHO[who]}</b><p>${esc(text)}</p></div></div>`).join('') + '</div>';
      return h;
    }
    h += `<p id="court-err" class="err"></p><button class="btn" data-act="court-answer" data-arg="${s.id}">Ответить суду</button>`;
    return h + '</div></div>';
  };
  const cur = steps[S.court.idx];
  const speak = cur ? cur.who : 'judge';
  const seat = (who, role, name) => `<div class="seat ${who}${speak === who || (who === 'judge' && cur && cur.ask) ? ' on' : ''}">${portrait(who, 78)}<b>${role}</b><span>${name}</span></div>`;
  const witness = cur && !['judge', 'rkn', 'org'].includes(cur.who) ? cur.who : null;
  let html = `<div class="pane court"><p class="eyebrow">зал заседаний № 3</p><h2>Дело в отношении ООО «КурсБлиновской»</h2>
    <div class="hall"><div class="bench">${seat('judge', 'Судья', 'Орлова Е. Н.')}</div>
      <div class="sides">${seat('rkn', 'Роскомнадзор', 'Белых Т. А.')}<div class="progress-c"><b>${Math.min(S.court.idx + 1, steps.length)} / ${steps.length}</b><span>${cur ? 'вопрос' : 'решение'}</span></div>${seat('org', 'ООО «КурсБлиновской»', 'Вайс И. Л.')}</div>
      ${witness ? `<div class="stand">${seat(witness, witness === 'kravec' ? 'Заявитель' : 'Свидетель', WHO[witness].split(' ').slice(1).join(' '))}</div>` : ''}</div>`;
  if (!S.court.idx) html += `<div class="say who-clerk">${portrait('clerk', 52)}<div><b>Секретарь заседания</b><p>Встать, суд идёт. Слушается дело об административном правонарушении в отношении ООО «КурсБлиновской». Явились представитель Роскомнадзора Белых, представитель общества Вайс. Материалы дела и улики отобраны специалистом — ${esc(WHO.me.slice(11))}.</p></div></div>`
    + (S.offer === 'report' ? `<div class="say who-judge">${portrait('judge', 52)}<div><b>${WHO.judge}</b><p>До начала: специалист передал суду письмо директора общества с предложением договора в обмен на нужный вывод. Письмо приобщено. Представитель общества, суд к этому вернётся.</p></div></div>` : '')
    + (S.offer === 'accept' ? `<div class="say who-judge">${portrait('judge', 52)}<div><b>${WHO.judge}</b><p>До начала: суду стало известно, что специалист принял от общества предложение о платном договоре. Суд выслушает специалиста, но к его выводам отнесётся с поправкой на это.</p></div></div>` : '');
  else {
    html += `<p class="eyebrow">после вашего ответа</p>` + V.sec.react[steps[S.court.idx - 1].id].map(([who, text]) => `<div class="say who-${who}">${portrait(who, 52)}<div><b>${WHO[who]}</b><p>${esc(text)}</p></div></div>`).join('');
  }
  if (S.court.idx) html += `<details class="protocol"><summary>Протокол заседания: отвечено ${S.court.idx} из ${steps.length}</summary>${steps.slice(0, S.court.idx).map((s, n) => stepHtml(s, n, true)).join('')}</details>`;
  if (cur) html += stepHtml(cur, S.court.idx, false);
  if (S.court.idx >= steps.length) html += S.done ? '<div class="notice">Решение оглашено. Сверка ваших ответов — в разделе «Итог».</div>' : verdictForm();
  return html + '</div>';
}

function verdictForm() {
  const v = V.pub.verdict, d = draft.verdict || { org: [], persons: {}, why: '' };
  let lo = 0, hi = 0;
  d.org.forEach(i => { lo += v.org.options[i].lo; hi += v.org.options[i].hi; });
  let html = `<div class="say who-judge">${portrait('judge', 52)}<div><b>${WHO.judge}</b><p>Вопросы исчерпаны. Специалист, изложите, какое решение по делу следует из материалов: по организации и по каждому участнику.</p></div></div>
    <div class="reply verdict" id="verdict"><b>Проект решения · ${esc(WHO.me)}</b>
    <div class="vcard"><h3>${esc(v.org.title)}</h3><p class="meta">${esc(v.org.sub)}</p><p class="plabel">${esc(v.org.label)}</p>
      <div class="opts">${v.org.options.map((o, i) => `<label class="opt"><input type="checkbox" name="v-org" value="${i}"${d.org.includes(i) ? ' checked' : ''}><span>${esc(o.t)}<small>${fineText(o.lo, o.hi)}</small></span></label>`).join('')}</div>
      <p class="sum">Штраф организации по отмеченным составам: <b id="fine-sum">${d.org.length ? fineText(lo, hi) : 'составы не отмечены'}</b></p></div>`;
  for (const per of v.persons) {
    html += `<div class="vcard"><div class="vhead">${portrait(per.id, 44)}<div><h3>${esc(per.title)}</h3><p class="meta">${esc(per.sub)}</p></div></div>${widget('single', 'v-' + per.id, per.options, d.persons[per.id])}</div>`;
  }
  html += `<div class="vcard"><h3>Мотивировка</h3><p class="meta">Коротко: что произошло и почему ответственность распределяется так. Не меньше 200 знаков. Текст войдёт в файл дела, преподаватель его прочитает.</p>
    <textarea id="v-why" rows="7" class="notes">${esc(d.why)}</textarea></div>
    <p id="verdict-err" class="err"></p><button class="btn" data-act="verdict">Огласить решение</button></div>`;
  return html;
}

function readVerdict() {
  const root = $('#verdict');
  if (!root) return;
  const d = { org: [...root.querySelectorAll('input[name="v-org"]:checked')].map(el => Number(el.value)), persons: {}, why: $('#v-why').value };
  V.pub.verdict.persons.forEach(per => { d.persons[per.id] = readWidget('single', 'v-' + per.id, root); });
  draft.verdict = d;
}

ACTIONS['court-start'] = () => {
  if (!S.offer && DOCS['m:m11']) { toast('Сначала ответьте на письмо директора «Лично. Не для суда» в почте.'); return; }
  if (!confirm('Начать заседание? После этого состав улик изменить нельзя. Сейчас приобщено: ' + S.pins.length + '.')) return;
  S.court.on = true;
  addLog('Заседание открыто. Улик приобщено: ' + S.pins.length);
  save(); render();
};

ACTIONS['court-answer'] = id => {
  const s = V.pub.court.find(x => x.id === id);
  const root = document.querySelector(`[data-step="${id}"]`);
  const ans = s.parts.map((part, i) => readWidget(part.kind, 'c-' + id + '-' + i, root));
  draft[id] = ans;
  if (s.parts.some((part, i) => ans[i] === null || ans[i] === '')) { $('#court-err').textContent = 'Ответьте на каждую часть вопроса. Если подходящей улики нет, выберите это в списке.'; return; }
  S.court.answers[id] = ans;
  S.court.idx++;
  addLog('Заседание: дан ответ на вопрос ' + S.court.idx + ' из ' + V.pub.court.length);
  save(); render();
  $('#main').scrollTop = 0;
};

ACTIONS.verdict = () => {
  readVerdict();
  const d = draft.verdict;
  const err = $('#verdict-err');
  if (V.pub.verdict.persons.some(per => d.persons[per.id] === null)) { err.textContent = 'Выберите решение по каждому участнику.'; return; }
  if (d.why.trim().length < 200) { err.textContent = 'Мотивировка короче 200 знаков: сейчас ' + d.why.trim().length + '.'; return; }
  if (!confirm('Огласить решение? После этого игра завершится и покажет сверку.')) return;
  S.verdict = d;
  finish(false);
};

/* ---------------------------------------------------------------- завершение и итог */

function compactState() {
  return { tasks: S.tasks, court: S.court.answers, verdict: S.verdict, pets: S.pets, offer: S.offer };
}

async function finish(byTimeout) {
  if (S.done) return;
  if (byTimeout) { readVerdict(); if (draft.verdict) S.verdict = draft.verdict; }
  const sc = scoreAll(V.pub, V.sec, compactState());
  if (S.pauseAt) { S.paused = (S.paused || 0) + Date.now() - S.pauseAt; S.pauseAt = 0; }
  const used = Math.min(GAME.minutes, Math.ceil(elapsed() / 60));
  const now = new Date();
  const payload = {
    n: S.name, g: S.group, v: S.v, s: sc.total, m: gradeFor(sc.total).mark, u: used, o: byTimeout ? 1 : 0,
    d: new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    T: V.pub.tasks.map(t => { const st = S.tasks[t.id] || {}; return (st.s === 'ok' ? 'o' : st.s === 'skip' ? 'k' : 'n') + (st.w || 0) + (st.h ? 'h' : ''); }),
    C: V.pub.court.map(s => S.court.answers[s.id] || null),
    V: { o: S.verdict.org || [], p: V.pub.verdict.persons.map(per => { const x = (S.verdict.persons || {})[per.id]; return x === undefined ? null : x; }) },
    P: S.pets, O: S.offer || '', p: S.pins.length, w: (S.verdict.why || '').trim().length + S.notes.trim().length,
  };
  const body = b64url(JSON.stringify(payload));
  const code = GAME.prefix + '.' + body + '.' + (await shortHash(GAME.salt + '|code|' + body)).slice(0, 10);
  addLog(byTimeout ? 'Время вышло. Игра завершена' : 'Решение оглашено. Игра завершена');
  S.done = { at: Date.now(), used, timeout: byTimeout, score: sc, code, date: payload.d };
  S.tab = 'result';
  save();
  clearInterval(timerId);
  $('#timer').classList.add('hidden');
  render();
}

function chapters(list) {
  return (list || []).map(k => `<a href="${GAME.chapters[k].url}" target="_blank" rel="noopener">${esc(GAME.chapters[k].title)}</a>`).join(' · ');
}

function mark(ok) { return `<span class="${ok ? 'yes' : 'no'}">${ok ? 'верно' : 'неверно'}</span>`; }

function viewResult() {
  const sc = S.done.score, g = gradeFor(sc.total), rv = V.sec.reveal;
  let html = `<div class="pane result"><p class="eyebrow">дело закрыто</p><h2>Итог расследования</h2>
    <div class="score"><div class="mark m${g.mark}">${g.mark}</div><div><p><b>${sc.total} из 100</b> · ${g.label}</p>
      <p class="muted">Расследование ${sc.inv} из ${sc.max.inv} · заседание ${sc.court} из ${sc.max.court} · решение ${sc.verdict} из ${sc.max.verdict} · потрачено ${S.done.used} мин${S.done.timeout ? ' · завершено по истечении времени' : ''}</p></div></div>
    <div class="gbars">${[['Расследование', sc.inv, sc.max.inv], ['Заседание', sc.court, sc.max.court], ['Решение', sc.verdict, sc.max.verdict]].map(([t, a, b]) => `<div class="gbar"><span>${t}</span><div><i style="width:${Math.max(0, a) / b * 100}%"></i></div><b>${a} из ${b}</b></div>`).join('')}</div>
    <div class="notice"><b>Что отправить преподавателю.</b> Скачайте дело и отправьте архив целиком. В файле <code>00-delo.md</code> записан код результата, по нему преподаватель проверяет баллы.
      <div class="task-btns"><button class="btn ghost" data-act="reset">Сбросить игру</button><button class="btn" data-act="zip">Скачать дело — архив .zip, 7 файлов .md</button><button class="btn ghost" data-act="md">Одним файлом .md</button><button class="btn ghost" data-act="copy">Скопировать код результата</button></div>
      <code class="code">${esc(S.done.code)}</code></div>
    <div class="say who-judge">${portrait('judge', 52)}<div><b>${WHO.judge}</b><p>${sc.total >= 85 ? 'Суд принимает заключение специалиста ' + esc(WHO.me.slice(11)) + ' полностью. Выводы подтверждены записями, которые специалист сам отобрал и предъявил.'
      : sc.total >= 70 ? 'Суд принимает заключение специалиста ' + esc(WHO.me.slice(11)) + ' в основной части. По отдельным вопросам суд пришёл к другим выводам, они изложены ниже.'
      : sc.total >= 50 ? 'Суд принимает заключение специалиста ' + esc(WHO.me.slice(11)) + ' частично. Значительную часть выводов суду пришлось проверять и исправлять самостоятельно.'
      : 'Суд не может положить заключение специалиста ' + esc(WHO.me.slice(11)) + ' в основу решения: выводы расходятся с материалами дела. Ниже — то, что установил суд.'}</p></div></div>
    <h3>Что произошло на самом деле</h3><div class="tl">${rv.timeline.map(([d, x]) => `<div class="tl-row"><code>${d}</code><span>${esc(x)}</span></div>`).join('')}</div>
    <div class="summary">${rv.summary.map(x => `<p>${esc(x)}</p>`).join('')}<p>Штраф организации по трём составам: <b>${fineText(rv.fine.lo, rv.fine.hi)}</b>.</p></div>
    <h3>Заседание: ваши ответы и материалы</h3>`;
  V.pub.court.forEach((s, n) => {
    const ans = S.court.answers[s.id] || [];
    html += `<div class="rev"><p class="rev-q"><b>${n + 1}. ${WHO[s.who]}:</b> ${esc(s.say)} ${esc(s.ask || '')}</p>`;
    s.parts.forEach((part, i) => {
      const sec = V.sec.court[s.id][i];
      const ok = answerOk(part.kind, sec.key, ans[i]);
      const right = part.kind === 'evidence' ? refInfo(sec.key[0]).where : showAnswer(part.kind, part.options, part.kind === 'single' ? sec.key[0] : sec.key[0]);
      html += `<div class="rev-part ${ok ? 'ok' : 'bad'}"><p>${part.label ? `<i>${esc(part.label)}.</i> ` : ''}Ваш ответ: <b>${esc(showAnswer(part.kind, part.options, ans[i]))}</b> — ${mark(ok)}, ${ok ? part.pts : 0} из ${part.pts}</p>
        ${ok ? '' : `<p>По материалам: <b>${esc(right)}</b></p>`}<p class="why">${esc(sec.why)}</p>${sec.ch.length ? `<p class="ch">Справочник: ${chapters(sec.ch)}</p>` : ''}</div>`;
    });
    html += '</div>';
  });
  const v = V.pub.verdict, mine = S.verdict;
  const picks = mine.org || [];
  html += `<h3>Решение: ваш проект и материалы</h3><div class="rev"><p class="rev-q"><b>${esc(v.org.title)}</b> — ${orgScore(v.org, V.sec.verdict.org.key, picks)} из ${v.org.pts}</p>
    ${v.org.options.map((o, i) => { const need = V.sec.verdict.org.key.includes(i), got = picks.includes(i);
      return `<div class="rev-part ${need === got ? 'ok' : 'bad'}"><p>${got ? '☑' : '☐'} ${esc(o.t)} — ${need ? 'подтверждается' : 'не подтверждается'}${need === got ? '' : (got ? ', отмечено лишнее' : ', пропущено')}</p></div>`; }).join('')}
    <p class="why">${esc(V.sec.verdict.org.why)}</p></div>`;
  for (const per of v.persons) {
    const sec = V.sec.verdict.persons[per.id];
    const a = (mine.persons || {})[per.id];
    const ok = answerOk('single', sec.key, a);
    html += `<div class="rev"><p class="rev-q"><b>${esc(per.title)}</b>, ${esc(per.sub)}</p><div class="rev-part ${ok ? 'ok' : 'bad'}">
      <p>Ваш ответ: <b>${esc(showAnswer('single', per.options, a))}</b> — ${mark(ok)}, ${ok ? per.pts : 0} из ${per.pts}</p>
      ${ok ? '' : `<p>По материалам: <b>${esc(per.options[sec.key[0]])}</b></p>`}<p class="why">${esc(sec.why)}</p>${sec.ch.length ? `<p class="ch">Справочник: ${chapters(sec.ch)}</p>` : ''}</div></div>`;
  }
  html += sc.rows.filter(r => r.max === 0 && r.got < 0).map(r => `<div class="rev"><div class="rev-part bad"><p><b>${esc(r.title)}</b> — ${r.got} баллов</p></div></div>`).join('');
  html += `<h3>Расследование</h3><div class="res-wrap"><table class="res"><tr><th>Задание</th><th>Итог</th><th>Баллы</th></tr>
    ${V.pub.tasks.map(t => { const st = S.tasks[t.id] || {}; return `<tr><td>${esc(t.title)}</td><td>${st.s === 'ok' ? 'решено' + (st.w ? ', неверных попыток: ' + st.w : '') + (st.h ? ', с подсказкой' : '') : st.s === 'skip' ? 'ответ открыт' : 'не решено'}</td><td>${taskScore(t, st)} из ${t.pts}</td></tr>`; }).join('')}</table></div>`;
  return html + '</div>';
}

/* ---------------------------------------------------------------- файлы дела */

function mdFiles() {
  const sc = S.done.score, g = gradeFor(sc.total), rv = V.sec.reveal;
  const q = t => String(t).split('\n').map(x => '> ' + x).join('\n');
  const files = [];
  files.push(['00-delo.md', `# Дело «Выгрузка на продажу»

Игра-расследование по теме 2 «Вайбкодинг в России», дисциплина «Стандартизация, сертификация и техническое документоведение».

- Специалист: ${S.name}
- Группа: ${S.group}
- Вариант дела: ${S.v}
- Завершено: ${S.done.date.replace('T', ' ')}${S.done.timeout ? ' (по истечении времени)' : ''}
- Потрачено: ${S.done.used} мин из ${GAME.minutes}
- Итог: ${sc.total} из 100, оценка ${g.mark} (${g.label})
- Расследование: ${sc.inv} из ${sc.max.inv} · заседание: ${sc.court} из ${sc.max.court} · решение: ${sc.verdict} из ${sc.max.verdict}
- Улик приобщено: ${S.pins.length} из ${GAME.maxPins}

## Код результата

\`\`\`
${S.done.code}
\`\`\`

## Состав дела

- 01-hod-rassledovaniya.md — что и в каком порядке открывалось и решалось
- 02-uliki.md — приобщённые записи с пояснениями
- 03-zadaniya.md — задания расследования
- 04-bloknot.md — рабочие записи
- 05-zasedanie.md — вопросы суда и ответы
- 06-reshenie.md — проект решения, мотивировка и сверка с материалами
`]);
  files.push(['01-hod-rassledovaniya.md', '# Ход расследования\n\nВремя — от открытия дела, минуты:секунды.\n\n' + S.log.map(l => `- \`${clock(l.t)}\` ${l.x}`).join('\n') + '\n']);
  const used = new Set(Object.values(S.court.answers).flat().filter(x => typeof x === 'string' && x.includes('#') && x !== NONE));
  files.push(['02-uliki.md', '# Улики\n\n' + (S.pins.length ? S.pins.map((p, n) => {
    const r = refInfo(p.ref);
    return `## ${n + 1}. ${r.where}\n\n${q(r.text)}\n\n**Что доказывает:** ${p.note.trim() || '—'}${used.has(p.ref) ? '\n\nПредъявлена в заседании.' : ''}`;
  }).join('\n\n') : 'Улики не приобщались.') + (S.links.length ? '\n\n## Связи между уликами\n\n' + S.links.map(([a, b]) => `- ${refInfo(a).where} ↔ ${refInfo(b).where}`).join('\n') : '') + '\n']);
  files.push(['03-zadaniya.md', '# Задания расследования\n\n' + V.pub.tasks.map(t => {
    const st = S.tasks[t.id] || {}, sec = V.sec.tasks[t.id];
    const state = st.s === 'ok' ? 'решено' : st.s === 'skip' ? 'ответ открыт без баллов' : 'не решено';
    const mine = st.s === 'ok' ? showAnswer(t.type, t.options, st.a, t) : '—';
    return `## Этап ${t.stage + 1}. ${t.title}\n\n${t.text}\n\n- Итог: ${state}, ${taskScore(t, st)} из ${t.pts}\n- Неверных попыток: ${st.w || 0}${st.h ? '\n- Взята подсказка' : ''}\n- Ответ: ${mine}${st.s ? '\n\n**Разбор.** ' + sec.why : ''}`;
  }).join('\n\n') + '\n']);
  files.push(['04-bloknot.md', '# Блокнот\n\n' + (S.notes.trim() || 'Записей нет.') + '\n']);
  files.push(['05-zasedanie.md', '# Заседание\n\n' + V.pub.court.map((s, n) => {
    const ans = S.court.answers[s.id];
    let out = `## Вопрос ${n + 1}\n\n**${WHO[s.who]}:** ${s.say}${s.ask ? `\n\n**${WHO.judge}:** ${s.ask}` : ''}\n`;
    s.parts.forEach((part, i) => {
      const sec = V.sec.court[s.id][i];
      const ok = ans ? answerOk(part.kind, sec.key, ans[i]) : false;
      out += `\n- ${part.label || 'Ответ'}: **${ans ? showAnswer(part.kind, part.options, ans[i]) : 'ответ не дан'}** — ${ok ? 'верно' : 'неверно'}, ${ok ? part.pts : 0} из ${part.pts}\n  Разбор: ${sec.why}`;
    });
    return out;
  }).join('\n\n') + '\n']);
  const v = V.pub.verdict, mine = S.verdict;
  let dec = `# Проект решения\n\n## ${v.org.title}\n\n` + v.org.options.map((o, i) => `- [${(mine.org || []).includes(i) ? 'x' : ' '}] ${o.t} — ${fineText(o.lo, o.hi)}`).join('\n')
    + `\n\nБаллы: ${orgScore(v.org, V.sec.verdict.org.key, mine.org)} из ${v.org.pts}. По материалам: ${V.sec.verdict.org.why}\n`;
  for (const per of v.persons) {
    const sec = V.sec.verdict.persons[per.id], a = (mine.persons || {})[per.id];
    const ok = answerOk('single', sec.key, a);
    dec += `\n## ${per.title}, ${per.sub}\n\n- Решение специалиста: **${showAnswer('single', per.options, a)}** — ${ok ? 'верно' : 'неверно'}, ${ok ? per.pts : 0} из ${per.pts}\n- По материалам: ${per.options[sec.key[0]]}\n- Разбор: ${sec.why}\n`;
  }
  dec += `\n## Мотивировка специалиста\n\n${(mine.why || '').trim() || '—'}\n\n## Что произошло на самом деле\n\n` + rv.timeline.map(([d, x]) => `- **${d}** — ${x}`).join('\n')
    + '\n\n' + rv.summary.map(x => '- ' + x).join('\n') + `\n- Штраф организации по трём составам: ${fineText(rv.fine.lo, rv.fine.hi)}.\n`;
  files.push(['06-reshenie.md', dec]);
  return files;
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xFFFFFFFF; for (const b of bytes) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

/* Архив .zip без сжатия: файлы .md лежат в нём открытым текстом. */
function makeZip(files) {
  const enc = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
  for (const [name, text] of files) {
    const nm = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const head = [0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nm.length), ...u16(0)];
    chunks.push(new Uint8Array(head), nm, data);
    central.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), nm);
    offset += head.length + nm.length + data.length;
  }
  const size = central.reduce((a, c) => a + c.length, 0);
  const end = new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(size), ...u32(offset), ...u16(0)]);
  return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

function slug() { return S.name.trim().split(/\s+/)[0].replace(/[^A-Za-zА-Яа-яЁё0-9-]/g, '') || 'student'; }

ACTIONS.zip = () => download(makeZip(mdFiles().map(([n, t]) => ['delo-01-' + slug() + '/' + n, t])), 'delo-01-' + slug() + '.zip');
ACTIONS.md = () => download(new Blob([mdFiles().map(([n, t]) => t).join('\n\n---\n\n')], { type: 'text/markdown' }), 'delo-01-' + slug() + '.md');
ACTIONS.copy = async (arg, btn) => {
  try { await navigator.clipboard.writeText(S.done.code); btn.textContent = 'Скопировано'; } catch (e) { btn.textContent = 'Не удалось скопировать'; }
};

/* ---------------------------------------------------------------- поля ввода и таймер */

function after() {
  drawWires();
  drawThreads();
  const aud = $('#aud');
  if (aud) {
    if (audioKeep) { aud.currentTime = audioKeep.t; if (audioKeep.on) aud.play().catch(() => {}); }
    aud.addEventListener('timeupdate', () => {
      let now = null;
      document.querySelectorAll('.turn').forEach(el => { if (Number(el.dataset.cue) <= aud.currentTime + .05) now = el; });
      document.querySelectorAll('.turn.now').forEach(el => { if (el !== now) el.classList.remove('now'); });
      if (now && !aud.paused) now.classList.add('now');
    });
  }
  const ti = $('#term-in');
  if (ti) {
    const out = $('#term-out');
    out.scrollTop = out.scrollHeight;
    ti.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const line = ti.value.trim();
        if (!line) return;
        term.hist.push(line); term.pos = term.hist.length;
        const p = prompt();
        const o = runLine(line);
        if (line !== 'clear') term.out.push({ p, c: line, o });
        addLog('Команда на сервере: ' + line);
        save(); render();
        $('#term-in').focus();
      } else if (e.key === 'ArrowUp') { if (term.pos > 0) ti.value = term.hist[--term.pos]; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { term.pos = Math.min(term.hist.length, term.pos + 1); ti.value = term.hist[term.pos] || ''; e.preventDefault(); }
    });
  }
  const f = $('#filter');
  if (f) f.addEventListener('input', () => { fileFilter = f.value; $('#file-lines').innerHTML = linesHtml(DOCS[S.open.file], { mono: true, filter: fileFilter.toLowerCase() }); });
  const ht = $('#hidden-toggle');
  if (ht) ht.addEventListener('change', () => { showHidden = ht.checked; render(); });
  const notes = $('#notes');
  if (notes) notes.addEventListener('input', () => { S.notes = notes.value; save(); });
  document.querySelectorAll('[data-note]').forEach(el => el.addEventListener('input', () => { S.pins[Number(el.dataset.note)].note = el.value; save(); }));
  const addr = $('#addr');
  if (addr) addr.addEventListener('keydown', e => { if (e.key === 'Enter') ACTIONS.go(); });
  const pw = $('#ssh-pw');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') ACTIONS.ssh(); });
  const ver = $('#verdict');
  if (ver) {
    ver.addEventListener('change', () => {
      readVerdict();
      let lo = 0, hi = 0;
      draft.verdict.org.forEach(i => { lo += V.pub.verdict.org.options[i].lo; hi += V.pub.verdict.org.options[i].hi; });
      $('#fine-sum').textContent = draft.verdict.org.length ? fineText(lo, hi) : 'составы не отмечены';
    });
    $('#v-why').addEventListener('input', readVerdict);
  }
  document.querySelectorAll('[data-task]').forEach(el => el.addEventListener('change', keepDrafts));
  document.querySelectorAll('[data-task] input.short').forEach(el => el.addEventListener('input', keepDrafts));
  const step = document.querySelector('[data-step] .btn');
  if (step) {
    const root = step.closest('[data-step]');
    const s = V.pub.court.find(x => x.id === root.dataset.step);
    const keep = () => { draft[s.id] = s.parts.map((part, i) => readWidget(part.kind, 'c-' + s.id + '-' + i, root)); };
    root.addEventListener('change', keep);
    root.addEventListener('input', keep);
  }
}

/* Сброс: стирает прохождение в этом браузере и возвращает к экрану начала.
   Если код результата уже отправлен, преподаватель увидит повторный код того же студента. */
ACTIONS.reset = () => {
  if (!confirm('Сбросить игру? Все улики, заметки, ответы и время будут удалены из этого браузера.')) return;
  if (S.done && !confirm('Дело уже закрыто. Если код результата отправлен преподавателю, засчитывается первый присланный код. Всё равно сбросить?')) return;
  try { localStorage.removeItem(GAME.id); } catch (e) {}
  location.reload();
};

const BREAK_MS = 20 * 60000;
ACTIONS.pause = () => {
  if (S.pauseAt) { S.paused = (S.paused || 0) + Date.now() - S.pauseAt; S.pauseAt = 0; addLog('Перерыв окончен'); }
  else if (!S.pauseUsed && confirm('Взять перерыв между парами? Таймер остановится не больше чем на 20 минут. Перерыв даётся один раз.')) { S.pauseUsed = 1; S.pauseAt = Date.now(); addLog('Взят перерыв'); }
  save(); render(); tick();
};

function tick() {
  if (S.pauseAt && Date.now() - S.pauseAt >= BREAK_MS) { S.paused = (S.paused || 0) + BREAK_MS; S.pauseAt = 0; save(); render(); }
  const pb = $('#pause');
  if (pb) { pb.classList.toggle('hidden', !!S.done || (!!S.pauseUsed && !S.pauseAt)); pb.textContent = S.pauseAt ? 'Продолжить' : 'Перерыв'; }
  const left = GAME.minutes * 60 - elapsed();
  const el = $('#timer');
  if (left <= 0) { el.textContent = '00:00'; finish(true); return; }
  el.textContent = clock(left);
  el.classList.toggle('warn', left <= 900 && left > 300);
  el.classList.toggle('danger', left <= 300);
}

async function open() {
  V = await loadVariant(S.v);
  /* Имя специалиста подставляется в материалы дела и реплики. */
  const parts = S.name.replace(/["\\<>]/g, '').trim().split(/\s+/);
  const fill = o => JSON.parse(JSON.stringify(o).replace(/⟦ФИО⟧/g, parts.join(' ')).replace(/⟦ИМЯ⟧/g, parts[1] || parts[0]).replace(/⟦ФАМИЛИЯ⟧/g, parts[0]));
  V = { pub: fill(V.pub), sec: fill(V.sec) };
  WHO.me = 'Специалист ' + parts.join(' ');
  DOCS = {};
  V.pub.docs.forEach(d => { DOCS[d.id] = d; });
  $('#screen-start').classList.add('hidden');
  $('#screen-desk').classList.remove('hidden');
  $('#stage').classList.remove('hidden');
  render();
  if (!S.done) {
    $('#timer').classList.remove('hidden');
    tick();
    timerId = setInterval(tick, 1000);
  }
}

$('#btn-start').addEventListener('click', () => {
  const name = $('#in-name').value.trim(), group = $('#in-group').value.trim();
  if (name.split(/\s+/).length < 2) { $('#start-err').textContent = 'Укажите фамилию и имя.'; return; }
  if (!group) { $('#start-err').textContent = 'Укажите группу.'; return; }
  S = { name, group, v: variantFor(name, group), start: Date.now(), stage: 0, tab: 'mail', ssh: false, seen: {}, dirs: {}, pins: [], notes: '',
    tasks: {}, log: [], open: {}, court: { on: false, idx: 0, answers: {} }, verdict: {}, done: null, locks: {}, lockTries: {}, links: [], pets: [], offer: '' };
  addLog('Дело открыто. Вариант ' + S.v);
  save();
  open();
});

S = load();
if (S) { S.locks = S.locks || {}; S.lockTries = S.lockTries || {}; S.links = S.links || []; S.pets = S.pets || []; open(); }
