/* МДК.01.04 · занятие 1 · практика: три задания, рецензия и отчёт .md.
   Ответы и баллы хранятся в localStorage; у каждого задания одна проверка. */

(() => {
  const { $, $$ } = window.sp;
  const KEY = 'mdk0104-z01-v1';
  const MAX = { 1: 3, 2: 3, 3: 4 };
  let st;
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) { /* приватный режим */ } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  ['t1', 't2', 't3'].forEach(k => { st[k] = st[k] || {}; });

  const showDone = (n, fbHtml) => {
    const box = $('#t' + n);
    box.classList.add('is-done', 'locked');
    const s = st['t' + n].score;
    $('.task__head .pts', box).textContent = `${s} из ${MAX[n]}`;
    $('.verdict', box).innerHTML = s === MAX[n] ? '<span class="ok-t">Верно</span>' : s > 0 ? '<span class="ok-t">Частично верно</span>' : '<span class="bad-t">Неверно</span>';
    $('[data-check]', box).disabled = true;
    $$('input, select', box).forEach(el => { el.readOnly = true; if (el.tagName === 'SELECT') el.disabled = true; });
    $('#t' + n + 'fb').innerHTML = fbHtml;
  };
  const finish = (n, score, fbHtml) => {
    st['t' + n] = { ...st['t' + n], done: true, score };
    save();
    showDone(n, fbHtml);
    renderReview();
  };
  const warn = (n, text) => { $('#t' + n + ' .verdict').innerHTML = `<span class="bad-t">${text}</span>`; };

  /* ---------- задание 1 ---------- */
  const T1 = [
    ['Microsoft Word', 'текстовый редактор', 'app', 'Решает задачу человека — набрать и оформить документ.'],
    ['Диспетчер задач', 'taskmgr.exe', 'sys', 'Показывает процессы и загрузку компьютера, завершает зависшие программы — обслуживает систему.'],
    ['Драйвер видеокарты', 'модуль ядра', 'sys', 'Управляет устройством и работает в режиме ядра.'],
    ['Telegram', 'мессенджер', 'app', 'Решает задачу человека — переписку.'],
    ['Защитник Windows', 'антивирус', 'sys', 'Следит за файлами и процессами всех программ, работает службой.'],
    ['Компилятор MSVC', 'cl.exe', 'sys', 'Создаёт программы для системы. Компиляторы, компоновщики и отладчики традиционно относят к системным программам.'],
    ['Docker Engine', 'служба контейнеров', 'sys', 'Запускает другие программы в изолированных контейнерах и распределяет им ресурсы.'],
    ['Minecraft', 'игра', 'app', 'Решает задачу человека — развлечение.'],
  ];
  const t1 = st.t1; t1.a = t1.a || {};
  $('#t1list').innerHTML = T1.map(([n, s], i) => `<div class="sorter__row" data-i="${i}"><span><b>${n}</b><small>${s}</small></span><span class="seg"><button type="button" data-v="sys" aria-pressed="false">системная</button><button type="button" data-v="app" aria-pressed="false">прикладная</button></span></div>`).join('');
  const drawT1 = () => $$('#t1list .sorter__row').forEach(r => $$('button', r).forEach(b => b.setAttribute('aria-pressed', String(t1.a[r.dataset.i] === b.dataset.v))));
  $('#t1list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || t1.done) return;
    t1.a[b.closest('.sorter__row').dataset.i] = b.dataset.v; save(); drawT1();
  });
  drawT1();
  const fbT1 = () => {
    $$('#t1list .sorter__row').forEach(r => r.classList.add(t1.a[r.dataset.i] === T1[r.dataset.i][2] ? 'good' : 'bad'));
    return `<h4>Разбор</h4><ul>${T1.map(([n, , v, why], i) => `<li><span class="${t1.a[i] === v ? 'ok-t' : 'bad-t'}">${n}</span> — ${v === 'sys' ? 'системная' : 'прикладная'}. ${why}</li>`).join('')}</ul>`;
  };
  $('[data-check="1"]').addEventListener('click', () => {
    if (Object.keys(t1.a).length < T1.length) return warn(1, 'Выберите группу для всех восьми программ');
    const c = T1.filter((x, i) => t1.a[i] === x[2]).length;
    t1.correct = c;
    finish(1, c === 8 ? 3 : c >= 6 ? 2 : c >= 4 ? 1 : 0, fbT1());
  });

  /* ---------- задание 2 ---------- */
  const TOPICS = ['Процессы и потоки', 'Память', 'Файлы', 'Реестр', 'Журналы событий', 'Сеть'];
  const T2 = [
    ['Программа загружает процессор на 95 % дольше минуты', 0, 'Загрузка процессора считается по процессорному времени процесса — пара 5.'],
    ['За час процесс вырос с 200 МБ до 3 ГБ памяти', 1, 'Объём памяти процесса — пара 7, проверка «память растёт без остановки».'],
    ['В файл C:\\Windows\\System32\\drivers\\etc\\hosts добавлена строка', 2, 'Изменение файла видно по его хэшу — пара 9.'],
    ['В ключе HKCU\\…\\CurrentVersion\\Run появилась запись Updater', 3, 'Ключ Run хранится в реестре — пара 11.'],
    ['Пять раз подряд введён неверный пароль при входе в Windows', 4, 'Неудачные входы Windows записывает в журнал безопасности — пара 12.'],
    ['Программа начала принимать соединения на порту 4444', 5, 'Открытые порты и соединения — пара 13.'],
  ];
  const t2 = st.t2; t2.a = t2.a || {};
  $('#t2list').innerHTML = T2.map(([e], i) => `<div class="sorter__row" data-i="${i}"><b>${esc(e)}</b><select aria-label="Тема курса"><option value="">— тема —</option>${TOPICS.map((t, k) => `<option value="${k}">${t}</option>`).join('')}</select></div>`).join('');
  $$('#t2list select').forEach(s => {
    const i = s.closest('.sorter__row').dataset.i;
    if (t2.a[i] !== undefined) s.value = t2.a[i];
    s.addEventListener('change', () => { if (s.value === '') delete t2.a[i]; else t2.a[i] = +s.value; save(); });
  });
  const fbT2 = () => {
    $$('#t2list .sorter__row').forEach(r => r.classList.add(t2.a[r.dataset.i] === T2[r.dataset.i][1] ? 'good' : 'bad'));
    return `<h4>Разбор</h4><ul>${T2.map(([e, v, why], i) => `<li><span class="${t2.a[i] === v ? 'ok-t' : 'bad-t'}">${TOPICS[v]}</span>: ${esc(e)}. ${why}</li>`).join('')}</ul>`;
  };
  $('[data-check="2"]').addEventListener('click', () => {
    if (Object.keys(t2.a).length < T2.length) return warn(2, 'Выберите тему для всех шести нарушений');
    const c = T2.filter((x, i) => t2.a[i] === x[1]).length;
    t2.correct = c;
    finish(2, c === 6 ? 3 : c >= 4 ? 2 : c >= 2 ? 1 : 0, fbT2());
  });

  /* ---------- задание 3 ---------- */
  const t3 = st.t3;
  const clIn = $('#t3cl'), outIn = $('#t3out');
  clIn.value = t3.cl || ''; outIn.value = t3.out || '';
  clIn.addEventListener('input', () => { t3.cl = clIn.value; save(); });
  outIn.addEventListener('input', () => { t3.out = outIn.value; save(); });
  const okCl = v => /Microsoft\s*\(R\)\s*C\/C\+\+/i.test(v) && /\b19\.\d+/.test(v);
  const okOut = v => /^\s*agent v0, pid=\d+\s*$/.test(v);
  const fbT3 = () => {
    const a = okCl(t3.cl || ''), b = okOut(t3.out || '');
    clIn.classList.add(a ? 'good' : 'bad'); outIn.classList.add(b ? 'good' : 'bad');
    const ver = ((t3.cl || '').match(/19\.\d+(\.\d+)?/) || [''])[0];
    const pid = ((t3.out || '').match(/pid=(\d+)/) || [, ''])[1];
    return `<h4>Разбор</h4><ul>
      <li><span class="${a ? 'ok-t' : 'bad-t'}">Поле 1.</span> ${a ? `Компилятор MSVC версии ${esc(ver)}. Старший номер 19 у компилятора MSVC начиная с Visual Studio 2015, вторая часть номера растёт с каждым обновлением.` : 'Ожидалась строка вида <code>Microsoft (R) C/C++ Optimizing Compiler Version 19.xx… for x64</code>. Если интерфейс установщика русский, строка начинается со слов «Оптимизирующий компилятор Microsoft (R) C/C++ версии 19.xx».'}</li>
      <li><span class="${b ? 'ok-t' : 'bad-t'}">Поле 2.</span> ${b ? `Процесс получил PID ${esc(pid)}. При следующем запуске номер будет другим: Windows выдаёт PID при создании процесса и после его завершения может отдать этот номер другому процессу.` : 'Ожидалась строка вида <code>agent v0, pid=12345</code> — первая строка вывода программы без изменений.'}</li>
    </ul>`;
  };
  $('[data-check="3"]').addEventListener('click', () => {
    if (!(t3.cl || '').trim() || !(t3.out || '').trim()) return warn(3, 'Заполните оба поля');
    finish(3, (okCl(t3.cl) ? 2 : 0) + (okOut(t3.out) ? 2 : 0), fbT3());
  });

  if (t1.done) showDone(1, fbT1());
  if (t2.done) showDone(2, fbT2());
  if (t3.done) showDone(3, fbT3());

  /* ---------- рецензия ---------- */
  const NAMES = { 1: 'Системная или прикладная программа', 2: 'Тема курса для каждого нарушения', 3: 'Первая программа на WinAPI' };
  const nameIn = $('#rvName'), groupIn = $('#rvGroup');
  nameIn.value = st.name || ''; groupIn.value = st.group || '';
  nameIn.addEventListener('input', () => { st.name = nameIn.value; save(); });
  groupIn.addEventListener('input', () => { st.group = groupIn.value; save(); });
  const total = () => [1, 2, 3].reduce((s, n) => s + (st['t' + n].done ? st['t' + n].score : 0), 0);
  function renderReview() {
    $('#rvTable').innerHTML = '<tr><th>Задание</th><th>Баллы</th></tr>'
      + [1, 2, 3].map(n => `<tr><td>${n}. ${NAMES[n]}</td><td>${st['t' + n].done ? `${st['t' + n].score} / ${MAX[n]}` : 'не проверено'}</td></tr>`).join('')
      + `<tr class="total"><td>Итого</td><td>${total()} / 10</td></tr>`;
  }
  renderReview();

  $('#rvDownload').addEventListener('click', () => {
    const name = (st.name || '').trim(), group = (st.group || '').trim();
    if (!name) { nameIn.focus(); nameIn.style.borderColor = 'var(--red)'; return; }
    const sc = n => st['t' + n].done ? `${st['t' + n].score} / ${MAX[n]}` : 'не проверено';
    const fence = (lang, text) => '```' + lang + '\n' + (text || '').replace(/\s+$/, '') + '\n```';
    const md = [
      '# Занятие 1 · Цели курса и проект',
      '',
      'МДК.01.04 Системное программирование',
      '',
      '| | |', '|---|---|',
      `| Студент | ${name} |`, `| Группа | ${group || '—'} |`, `| Дата | ${new Date().toLocaleDateString('ru-RU')} |`,
      '',
      '## Баллы', '',
      '| Задание | Баллы |', '|---|---|',
      ...[1, 2, 3].map(n => `| ${n}. ${NAMES[n]} | ${sc(n)} |`),
      `| **Итого** | **${total()} / 10** |`,
      '',
      '## Задание 1. Системная или прикладная программа', '',
      '| Программа | Мой ответ |', '|---|---|',
      ...T1.map(([n], i) => `| ${n} | ${t1.a[i] === 'sys' ? 'системная' : t1.a[i] === 'app' ? 'прикладная' : '—'} |`),
      '',
      '## Задание 2. Тема курса для каждого нарушения', '',
      '| Нарушение | Мой ответ |', '|---|---|',
      ...T2.map(([e], i) => `| ${e.replace(/\|/g, '\\|')} | ${t2.a[i] !== undefined ? TOPICS[t2.a[i]] : '—'} |`),
      '',
      '## Задание 3. Первая программа на WinAPI', '',
      'Компилятор:', '', fence('text', t3.cl),
      '', 'Вывод программы:', '', fence('text', t3.out),
      '',
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
