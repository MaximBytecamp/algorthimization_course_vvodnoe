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
