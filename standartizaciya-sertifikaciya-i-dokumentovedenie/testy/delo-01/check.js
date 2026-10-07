/* ---------------------------------------------------------------
   Замок.

   Пароль в исходнике не лежит: сравнивается SHA-256 от строки
   "СОЛЬ|check|пароль". Пароль и соль те же, что у страниц проверки
   тестов ОП.03, ДУП.02, ОП.04, ОП.05 и МДК.01.01.

   Это барьер от того, чтобы студент открыл страницу по ссылке, —
   не защита: страница статическая.
   --------------------------------------------------------------- */

const PW_SALT = 'op03-voronka-utm-2026';
const PW_HASH = '9d9d93467fde12247a0b3225d4551ed8ca9804fbe873bf48c9fbc772984a7d1e';
const PW_FLAG = GAME.id + ':checker-open';

function unlock() {
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('tool').classList.remove('hidden');
}

async function tryPassword() {
  const input = document.getElementById('pw');
  const err = document.getElementById('pw-err');
  if (await sha256hex(PW_SALT + '|check|' + input.value) !== PW_HASH) {
    err.textContent = 'Неверный пароль.';
    input.select();
    return;
  }
  err.textContent = '';
  try { sessionStorage.setItem(PW_FLAG, '1'); } catch (e) {}
  unlock();
}

document.getElementById('pw-btn').addEventListener('click', tryPassword);
document.getElementById('pw').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); tryPassword(); }
});
try { if (sessionStorage.getItem(PW_FLAG) === '1') unlock(); } catch (e) {}

/* Проверка кодов: контрольная сумма и пересчёт баллов по ответам из кода. */

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CODE_RE = new RegExp(GAME.prefix + '\\.[A-Za-z0-9_-]+\\.[0-9a-f]{10}', 'g');

/* Архив собран без сжатия, поэтому код читается прямо из байтов файла. */
document.getElementById('files').addEventListener('change', async e => {
  const found = new Set(document.getElementById('in').value.split('\n').map(s => s.trim()).filter(Boolean));
  for (const file of e.target.files) {
    const text = new TextDecoder('latin1').decode(await file.arrayBuffer());
    (text.match(CODE_RE) || []).forEach(c => found.add(c));
  }
  document.getElementById('in').value = [...found].join('\n');
});

async function verify(code) {
  const parts = code.trim().split('.');
  if (parts.length !== 3 || parts[0] !== GAME.prefix) return { fatal: `Это не код результата этой игры (ожидается ${GAME.prefix}.…).` };
  const [, body, sum] = parts;
  const sumOk = (await shortHash(GAME.salt + '|code|' + body)).slice(0, 10) === sum;
  let p;
  try { p = JSON.parse(unb64url(body)); }
  catch (e) { return { fatal: 'Тело кода повреждено и не читается.' }; }
  if (!PUBLIC[p.v]) return { fatal: 'В коде указан неизвестный вариант.' };

  const { pub, sec } = await loadVariant(p.v);
  const tasks = {};
  pub.tasks.forEach((t, i) => {
    const m = /^([okn])(\d+)(h?)$/.exec((p.T || [])[i] || 'n0');
    tasks[t.id] = m ? { s: m[1] === 'o' ? 'ok' : m[1] === 'k' ? 'skip' : '', w: Number(m[2]), h: m[3] ? 1 : 0 } : {};
  });
  const court = {};
  pub.court.forEach((s, i) => { court[s.id] = (p.C || [])[i] || []; });
  const persons = {};
  pub.verdict.persons.forEach((per, i) => { persons[per.id] = ((p.V || {}).p || [])[i]; });
  const sc = scoreAll(pub, sec, { tasks, court, verdict: { org: (p.V || {}).o || [], persons }, pets: p.P || [], offer: p.O || '' });
  const rows = sc.rows.map(r => {
    let note = '';
    if (r.sec === 'Расследование' && tasks[r.id]) { const st = tasks[r.id]; note = st.s === 'ok' ? 'решено' + (st.w ? ', неверных: ' + st.w : '') + (st.h ? ', подсказка' : '') : st.s === 'skip' ? 'ответ открыт' : 'не решено'; }
    return { ...r, note };
  });
  return { sumOk, claimed: p.s, sc, rows, mark: gradeFor(sc.total).mark, markOk: gradeFor(sc.total).mark === p.m, expected: variantFor(p.n, p.g),
    name: p.n, group: p.g, variant: p.v, date: p.d, used: p.u, byTimeout: p.o === 1, pins: p.p, words: p.w };
}

let lastTsv = '';

document.getElementById('btn').addEventListener('click', async () => {
  const out = document.getElementById('out');
  const summary = document.getElementById('summary');
  out.innerHTML = ''; summary.innerHTML = '';
  const codes = document.getElementById('in').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!codes.length) { out.innerHTML = '<div class="notice">Выберите файлы дела или вставьте хотя бы один код.</div>'; return; }

  const seen = new Map();
  const table = [];
  for (const code of codes) {
    const r = await verify(code);
    const box = document.createElement('div');
    box.className = 'panel';
    if (r.fatal) {
      box.innerHTML = `<h2 style="color:var(--red)">Код не распознан</h2><p class="muted">${r.fatal}</p><p><code>${esc(code.slice(0, 90))}${code.length > 90 ? '…' : ''}</code></p>`;
      out.appendChild(box);
      continue;
    }
    const who = (r.name + '|' + r.group).toLowerCase();
    const repeat = seen.has(who);
    seen.set(who, 1);
    const flags = [];
    if (!r.sumOk) flags.push('контрольная сумма не сходится — код правили вручную');
    if (r.claimed !== r.sc.total) flags.push(`в коде записано ${r.claimed} баллов, по ответам получается ${r.sc.total}`);
    if (!r.markOk) flags.push('оценка в коде не соответствует баллам');
    if (r.expected !== r.variant) flags.push(`для этих фамилии и группы положен вариант ${r.expected}, пройден ${r.variant}`);
    if (repeat) flags.push('повторный код этого студента — засчитывается первый');
    const trusted = !flags.length;
    table.push([r.name, r.group, r.variant, r.sc.total, r.mark, r.sc.inv, r.sc.court, r.sc.verdict, r.pins, r.used, r.byTimeout ? 'да' : 'нет', r.date.replace('T', ' '), trusted ? 'ок' : flags.join('; ')]);
    let sec = '';
    box.innerHTML = `
      <div class="score"><div class="mark m${r.mark}">${r.mark}</div><div>
        <p><b>${esc(r.name)}</b> · группа ${esc(r.group)} · вариант ${r.variant}</p>
        <p>${r.sc.total} из 100 · ${gradeFor(r.sc.total).label} · расследование ${r.sc.inv}/${r.sc.max.inv}, заседание ${r.sc.court}/${r.sc.max.court}, решение ${r.sc.verdict}/${r.sc.max.verdict}</p>
        <p class="muted">${esc(r.date.replace('T', ', '))} · потрачено ${r.used} мин${r.byTimeout ? ' · завершено по истечении времени' : ''} · улик приобщено: ${r.pins} · знаков в блокноте и мотивировке: ${r.words}</p>
        <p style="font-weight:600;color:${trusted ? 'var(--mint)' : 'var(--red)'}">${trusted ? '✓ код подлинный, баллы сходятся' : '⚠ ' + flags.join('; ')}</p></div></div>
      <div class="res-wrap"><table class="res"><tr><th>Часть</th><th>Задание</th><th>Отметка</th><th>Баллы</th></tr>
        ${r.rows.map(x => { const head = x.sec !== sec ? x.sec : ''; sec = x.sec;
          return `<tr><td>${head}</td><td>${esc(x.id)} · ${esc(x.title)}</td><td>${esc(x.note)}</td><td style="font-weight:600;color:${x.got === x.max ? 'var(--mint)' : x.got ? 'var(--clay)' : 'var(--red)'}">${x.got} из ${x.max}</td></tr>`; }).join('')}
      </table></div>`;
    out.appendChild(box);
  }
  if (table.length) {
    const head = ['ФИО', 'Группа', 'Вариант', 'Баллы', 'Оценка', 'Расследование', 'Заседание', 'Решение', 'Улик', 'Минут', 'По таймеру', 'Завершено', 'Проверка'];
    lastTsv = [head, ...table].map(row => row.join('\t')).join('\n');
    summary.innerHTML = `<div class="panel"><h2>Сводка</h2><div class="res-wrap"><table class="res"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>
      ${table.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
    document.getElementById('btn-tsv').classList.remove('hidden');
  }
});

document.getElementById('btn-tsv').addEventListener('click', async () => {
  const btn = document.getElementById('btn-tsv');
  try { await navigator.clipboard.writeText(lastTsv); btn.textContent = 'Скопировано — вставьте в таблицу'; }
  catch (e) { btn.textContent = 'Не удалось скопировать'; }
  setTimeout(() => { btn.textContent = 'Скопировать сводку для таблицы'; }, 2200);
});
