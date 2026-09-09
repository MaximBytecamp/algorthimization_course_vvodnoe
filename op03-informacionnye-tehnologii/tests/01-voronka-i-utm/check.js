/* Проверка кодов результата. Для каждого кода:
   1) сверяем контрольную сумму — правка кода вручную её ломает;
   2) заново считаем баллы по ответам, зашитым в код, и сравниваем
      с числом, которое в коде записано. Расхождение показываем явно. */

function unb64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
}

async function verify(code) {
  const parts = code.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'OP03T1') {
    return { fatal: 'Это не код результата теста 1 (ожидается OP03T1.…).' };
  }
  const [, body, sum] = parts;

  const expect = (await shortHash(QUIZ.salt + '|code|' + body)).slice(0, 8);
  const sumOk = expect === sum;

  let p;
  try { p = JSON.parse(unb64url(body)); }
  catch (e) { return { fatal: 'Тело кода повреждено и не читается.' }; }

  // пересчёт баллов из ответов
  const picks = String(p.a || '').split('-');
  const rows = [];
  let recomputed = 0;
  for (let i = 0; i < QUIZ.questions.length; i++) {
    const q = QUIZ.questions[i];
    const picked = (picks[i] || '').split('').filter(c => c !== '').map(Number);
    const ok = await isCorrect(q, picked);
    if (ok) recomputed++;
    rows.push({ n: i + 1, topic: q.topic, picked, ok });
  }

  return {
    sumOk,
    claimed: p.s,
    recomputed,
    total: p.t,
    mark: p.m,
    markOk: gradeFor(recomputed).mark === p.m,
    name: p.n, group: p.g, date: p.d, byTimeout: p.o === 1,
    rows
  };
}

document.getElementById('btn').addEventListener('click', async () => {
  const out = document.getElementById('out');
  out.innerHTML = '';
  const codes = document.getElementById('in').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!codes.length) { out.innerHTML = '<div class="notice">Вставьте хотя бы один код.</div>'; return; }

  for (const code of codes) {
    const r = await verify(code);
    const box = document.createElement('div');
    box.className = 'panel';

    if (r.fatal) {
      box.innerHTML = `<h2 style="color:var(--red)">Код не распознан</h2>
        <p class="muted">${r.fatal}</p>
        <p><code>${code.slice(0, 90)}${code.length > 90 ? '…' : ''}</code></p>`;
      out.appendChild(box);
      continue;
    }

    const trusted = r.sumOk && r.claimed === r.recomputed && r.markOk;
    const flags = [];
    if (!r.sumOk) flags.push('контрольная сумма не сходится — код правили вручную');
    if (r.claimed !== r.recomputed) flags.push(`в коде записано ${r.claimed} баллов, по ответам получается ${r.recomputed}`);
    if (!r.markOk) flags.push('оценка не соответствует баллам');

    box.innerHTML = `
      <div class="score">
        <div class="mark m${r.mark}">${r.mark}</div>
        <div class="score-text">
          <p style="margin:0 0 4px"><b>${r.name}</b> · группа ${r.group}</p>
          <p style="margin:0 0 4px">${r.recomputed} из ${r.total} · ${gradeFor(r.recomputed).label}</p>
          <p style="margin:0" class="muted">${r.date.replace('T', ', ')}${r.byTimeout ? ' · отправлено по истечении времени' : ''}</p>
          <p style="margin:6px 0 0;font-weight:600;color:${trusted ? 'var(--teal)' : 'var(--red)'}">
            ${trusted ? '✓ код подлинный, баллы сходятся' : '⚠ ' + flags.join('; ')}
          </p>
        </div>
      </div>
      <table class="res">
        <tr><th>№</th><th>Тема</th><th>Ответ</th><th>Итог</th></tr>
        ${r.rows.map(x => `<tr>
          <td>${x.n}</td>
          <td>${x.topic}</td>
          <td>${x.picked.length ? x.picked.map(i => i + 1).join(', ') : '<i>нет</i>'}</td>
          <td style="color:${x.ok ? 'var(--teal)' : 'var(--red)'};font-weight:600">${x.ok ? 'верно' : 'неверно'}</td>
        </tr>`).join('')}
      </table>`;
    out.appendChild(box);
  }
});
