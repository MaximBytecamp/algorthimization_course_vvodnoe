'use strict';
// The pages are static; JavaScript only enhances navigation and the worked trace.
const progress = document.querySelector('.reading-progress span');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 100}%`;
}
window.addEventListener('scroll', updateProgress, {passive: true});
window.addEventListener('resize', updateProgress);
window.addEventListener('load', updateProgress);
document.querySelectorAll('details').forEach(item => item.addEventListener('toggle', updateProgress));
if ('ResizeObserver' in window) new ResizeObserver(updateProgress).observe(document.body);
updateProgress();
const contents = document.querySelector('.contents');
if (window.matchMedia('(max-width: 850px)').matches) contents.open = false;
const trace = document.querySelector('[data-trace]');
if (trace) {
  const numbers = [4, 2, 8, 3, 7];
  let count = 1;
  const cells = [...trace.querySelectorAll('.array span')];
  function draw() {
    const best = Math.max(...numbers.slice(0, count));
    cells.forEach((cell, i) => {
      cell.classList.toggle('done', i < count);
      cell.classList.toggle('boundary', i === count - 1);
      cell.setAttribute('aria-label', `${numbers[i]}: ${i < count ? 'обработано' : 'ещё не обработано'}`);
    });
    trace.querySelector('.trace-state').textContent = `Обработано: ${count} из ${numbers.length}. best = ${best}.`;
    let explanation = 'Первый элемент уже учтён. Следующий индекс: 1.';
    if (count > 1) {
      const value = numbers[count - 1];
      const before = Math.max(...numbers.slice(0, count - 1));
      explanation = `${value} > ${before} — ${value > before ? 'истина: обновляем best' : 'ложь: сохраняем best'}. `;
      explanation += count === numbers.length ? 'Все элементы обработаны, возвращаем 8.' : `Следующий индекс: ${count}.`;
    }
    trace.querySelector('.trace-explain').textContent = explanation;
    trace.querySelector('[data-step="prev"]').disabled = count === 1;
    trace.querySelector('[data-step="next"]').disabled = count === numbers.length;
  }
  trace.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.step;
    count = action === 'reset' ? 1 : Math.max(1, Math.min(numbers.length, count + (action === 'next' ? 1 : -1)));
    draw();
  }));
  draw();
}

// Сцены собеседования: сначала две реплики, остальные по кнопке. Без JavaScript видна вся сцена.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-scene]').forEach(scene => {
  const lines = [...scene.querySelectorAll('.say')];
  const notes = scene.querySelector('.notes');
  const next = scene.querySelector('[data-scene-next]');
  const all = scene.querySelector('[data-scene-all]');
  let shown = Math.min(2, lines.length);
  const draw = animate => {
    lines.forEach((line, i) => {
      const visible = i < shown;
      if (visible && line.hidden && animate && !reduce) { line.classList.remove('enter'); void line.offsetWidth; line.classList.add('enter'); }
      line.hidden = !visible;
    });
    const done = shown >= lines.length;
    if (done && notes.hidden && animate && !reduce) notes.classList.add('enter');
    notes.hidden = !done;
    next.hidden = done; all.hidden = done;
    updateProgress();
  };
  next.addEventListener('click', () => { shown += 1; draw(true); });
  all.addEventListener('click', () => { shown = lines.length; draw(true); });
  draw(false);
});

// Анимация схем при появлении на экране и кнопка «Повторить».
const animated = document.querySelectorAll('[data-anim]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(items => items.forEach(item => {
    if (item.isIntersecting) { item.target.classList.add('in'); io.unobserve(item.target); }
  }), {threshold: 0.35});
  animated.forEach(item => io.observe(item));
} else animated.forEach(item => item.classList.add('in'));
document.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', () => {
  const box = button.closest('[data-anim]');
  box.classList.remove('in'); void box.offsetWidth;
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('in')));
}));

// Матрица тестов: подсветка наименьшего набора, который ловит все версии.
document.querySelectorAll('[data-matrix]').forEach(matrix => {
  const button = matrix.querySelector('[data-matrix-min]');
  button.addEventListener('click', () => {
    const on = matrix.classList.toggle('min');
    button.textContent = on ? 'Показать все тесты' : 'Показать наименьший набор';
  });
});

// Какие индексы перебирает цикл: указатель проходит по ячейкам.
document.querySelectorAll('[data-ruler]').forEach(ruler => {
  const cells = [...ruler.querySelectorAll('[data-i]')];
  const out = ruler.querySelector('.ruler-out');
  const buttons = [...ruler.querySelectorAll('[data-range]')];
  let timer;
  const texts = {
    short: 'range(len(numbers) - 1) = range(2): i = 0, 1. Индекс 2 с нулём не проверяется, результат False.',
    full: 'range(len(numbers)) = range(3): i = 0, 1, 2. На i = 2 найден ноль, результат True.'
  };
  const run = mode => {
    clearTimeout(timer);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.range === mode)));
    const last = mode === 'short' ? 1 : 2;
    cells.forEach(c => c.className = '');
    out.textContent = texts[mode];
    if (reduce) { cells.forEach((c, i) => c.classList.add(i <= last ? 'seen' : 'skip')); return; }
    let i = 0;
    const step = () => {
      cells.forEach((c, j) => c.className = j < i ? 'seen' : j === i ? 'now' : '');
      if (i > last) { cells.forEach((c, j) => c.className = j <= last ? 'seen' : 'skip'); return; }
      i += 1; timer = setTimeout(step, 650);
    };
    step();
  };
  buttons.forEach(b => b.addEventListener('click', () => run(b.dataset.range)));
  cells.forEach((c, i) => c.classList.add(i <= 1 ? 'seen' : 'skip'));
});

// Банк кейсов: фильтр по типу ошибки.
const filter = document.querySelector('.kase-filter');
if (filter) filter.addEventListener('click', event => {
  const button = event.target.closest('[data-tag]');
  if (!button) return;
  filter.querySelectorAll('[data-tag]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.querySelectorAll('.kase').forEach(card => card.classList.toggle('hidden', button.dataset.tag !== 'all' && card.dataset.tag !== button.dataset.tag));
  updateProgress();
});

// Тренажёр: пояснения к вопросам.
document.querySelectorAll('[data-pick] button').forEach(button => button.addEventListener('click', () => {
  const why = button.nextElementSibling;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  why.hidden = !open;
  updateProgress();
}));

// Тренажёр: одна задача при разных ограничениях.
document.querySelectorAll('[data-switch]').forEach(box => {
  const tabs = [...box.querySelectorAll('[data-tab]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    box.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== tab.dataset.tab);
    updateProgress();
  }));
});

// Тренажёр: охота на контрпример.
document.querySelectorAll('[data-hunt]').forEach(box => {
  const total = Number(box.dataset.total);
  const score = box.querySelector('.hunt-score');
  box.querySelectorAll('[data-try]').forEach(button => button.addEventListener('click', () => {
    const row = box.querySelector(`tr[data-row="${button.dataset.try}"]`);
    if (!row.hidden) return;
    row.hidden = false;
    row.parentElement.appendChild(row);
    row.classList.add('enter');
    row.closest('.table-wrap').hidden = false;
    const bad = row.classList.contains('bad');
    button.classList.add(bad ? 'tried-bad' : 'tried-ok');
    const found = box.querySelectorAll('tr.bad:not([hidden])').length;
    const tried = box.querySelectorAll('tr[data-row]:not([hidden])').length;
    score.textContent = `Проверено входов: ${tried}. Ломающих найдено: ${found} из ${total}.`;
    if (found) box.querySelector('.hunt-why').hidden = false;
    updateProgress();
  }));
});

// Встроенные тесты: выбрать ровно N вариантов, проверить, показать пояснения.
document.querySelectorAll('[data-quiz]').forEach(quiz => {
  const need = Number(quiz.dataset.need);
  const inputs = [...quiz.querySelectorAll('input')];
  const count = quiz.querySelector('.quiz-count');
  const check = quiz.querySelector('[data-quiz-check]');
  const reset = quiz.querySelector('[data-quiz-reset]');
  const result = quiz.querySelector('.quiz-result');
  const sync = () => {
    const picked = inputs.filter(i => i.checked).length;
    count.textContent = `Выбрано ${picked} из ${need}`;
    check.disabled = picked !== need;
    if (need > 1) inputs.forEach(i => { if (!i.checked) i.disabled = picked >= need; });
  };
  inputs.forEach(i => i.addEventListener('change', sync));
  check.addEventListener('click', () => {
    const picked = inputs.filter(i => i.checked).map(i => i.closest('li').dataset.kind);
    const keys = picked.filter(k => k === 'key').length;
    quiz.classList.add('done');
    inputs.forEach(i => i.disabled = true);
    quiz.querySelectorAll('.quiz-why').forEach(w => w.hidden = false);
    check.hidden = true; reset.hidden = false; result.hidden = false;
    if (need === 1) result.textContent = keys ? 'Верно.' : 'Неверно. Прочитайте пояснения к вариантам.';
    else {
      const bad = picked.filter(k => k === 'bad').length;
      result.textContent = `Ключевых выбрано: ${keys} из ${need}.` + (bad ? ` Вопросов, не влияющих на решение: ${bad}.` : '') + (keys === need ? ' Отличный набор.' : ' Сравните свой выбор с пояснениями.');
    }
    if (need > 1) {
      const meter = document.createElement('span');
      meter.className = 'quiz-meter';
      meter.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < need; i++) meter.appendChild(document.createElement('i')).className = i < keys ? 'on' : '';
      result.prepend(meter);
    }
    updateProgress();
  });
  reset.addEventListener('click', () => {
    quiz.classList.remove('done');
    inputs.forEach(i => { i.checked = false; i.disabled = false; });
    quiz.querySelectorAll('.quiz-why').forEach(w => w.hidden = true);
    check.hidden = false; reset.hidden = true; result.hidden = true;
    sync(); updateProgress();
  });
  sync();
});
