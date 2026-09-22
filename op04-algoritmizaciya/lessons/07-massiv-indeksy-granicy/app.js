/* Движок колоды занятия 7.

   Основа — движок занятия 3: показ экранов, очерёдное появление блоков,
   счётчик, полноэкранный режим, свайпы, таймер на экране практики,
   печать домашнего задания. Добавлены кнопка «Показать ответы» для
   ручной таблицы и переключатель языка примеров Python / C# (клавиша L).  */
(() => {
  // Экраны, которых нет в выбранном языке (.l-py / .l-cs на самом экране), в показ не входят.
  const allSlides = [...document.querySelectorAll('.slide')];
  const lang = () => document.documentElement.dataset.lang === 'cs' ? 'cs' : 'py';
  const inLang = slide => !slide.classList.contains(lang() === 'cs' ? 'l-py' : 'l-cs');
  let slides = allSlides.filter(inLang);
  const deck = document.getElementById('deck');
  const boot = document.getElementById('boot');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const currentNumber = document.getElementById('currentNumber');
  const totalNumber = document.getElementById('totalNumber');
  const progress = document.getElementById('progress');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const sourcesButton = document.getElementById('sourcesButton');
  const sourcesPanel = document.getElementById('sourcesPanel');
  let index = 0;
  let touchStartX = null;
  let bootOpen = Boolean(boot);
  let revealTimers = [];
  let timerHandle = null;

  const pad = value => String(value).padStart(2, '0');
  const staggerSelector = [
    '.cards3 > div', '.cards4 > div', '.agenda > div', '.zones > div', '.termdef dl > div',
    '.tbl tbody tr', '.steps li', '.hw-cards li', '.hw-order > div'
  ].join(',');

  document.querySelectorAll(staggerSelector).forEach(element => {
    if (!element.closest('.manual')) element.classList.add('fragment');
  });

  function dismissBoot() {
    if (!bootOpen) return false;
    bootOpen = false;
    boot.classList.add('is-gone');
    window.setTimeout(() => boot.remove(), 700);
    return true;
  }

  if (boot) {
    boot.addEventListener('click', dismissBoot);
    document.addEventListener('keydown', event => {
      if (!bootOpen) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dismissBoot();
    }, true);
    window.setTimeout(dismissBoot, 9000);
  }

  function revealFragments(slide) {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    const items = [...slide.querySelectorAll('.fragment')].filter(item => !item.closest(lang() === 'cs' ? '.l-py' : '.l-cs'));
    items.forEach(item => item.classList.remove('revealed'));
    items.forEach((item, itemIndex) => {
      revealTimers.push(window.setTimeout(() => item.classList.add('revealed'), 320 + itemIndex * 90));
    });
  }

  function hiddenFragments() {
    return [...slides[index].querySelectorAll('.fragment:not(.revealed)')].filter(item => !item.closest(lang() === 'cs' ? '.l-py' : '.l-cs'));
  }

  function startTimer(slide) {
    if (timerHandle) clearInterval(timerHandle);
    const field = slide.querySelector('[data-timer]');
    if (!field) return;
    let left = Number(field.dataset.timer) * 60;
    const paint = () => {
      field.textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
      field.classList.toggle('is-out', left === 0);
    };
    paint();
    timerHandle = window.setInterval(() => {
      if (left <= 0) { clearInterval(timerHandle); return; }
      left -= 1;
      paint();
    }, 1000);
  }

  function updateUi() {
    const active = slides[index];
    currentNumber.textContent = pad(index + 1);
    totalNumber.textContent = pad(slides.length);
    progress.style.setProperty('--progress', `${((index + 1) / slides.length) * 100}%`);
    deck.style.setProperty('--accent', `var(--${active.dataset.accent || 'blue'})`);
    deck.classList.toggle('is-inverse', active.matches('.slide--question, .slide--title, .slide--practice'));
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1;
    document.title = `${pad(index + 1)} · Массив: индексы, проходы, границы`;
    history.replaceState(null, '', `#${pad(index + 1)}`);
    revealFragments(active);
    startTimer(active);
  }

  function render(nextIndex, direction = 1) {
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (clamped === index && slides[index].classList.contains('is-active')) return;
    const previous = slides[index];
    previous.classList.remove('is-active', 'is-leaving-left');
    if (direction > 0) previous.classList.add('is-leaving-left');
    window.setTimeout(() => previous.classList.remove('is-leaving-left'), 480);
    index = clamped;
    slides[index].classList.add('is-active');
    updateUi();
  }

  function next() {
    const pending = hiddenFragments();
    if (pending.length) {
      revealTimers.forEach(clearTimeout);
      revealTimers = [];
      pending.forEach(item => item.classList.add('revealed'));
      return;
    }
    render(index + 1, 1);
  }

  function previous() { render(index - 1, -1); }

  function openSources() {
    sourcesPanel.classList.add('is-open');
    sourcesPanel.setAttribute('aria-hidden', 'false');
    sourcesPanel.querySelector('.sources-close').focus();
  }

  function closeSources() {
    sourcesPanel.classList.remove('is-open');
    sourcesPanel.setAttribute('aria-hidden', 'true');
    sourcesButton.focus();
  }

  prevButton.addEventListener('click', previous);
  nextButton.addEventListener('click', next);
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => render(Number(button.dataset.go), -1)));
  sourcesButton.addEventListener('click', openSources);
  document.querySelectorAll('[data-close-sources]').forEach(element => element.addEventListener('click', closeSources));

  document.querySelectorAll('[data-reveal]').forEach(button => button.addEventListener('click', () => {
    const table = document.getElementById(button.dataset.reveal);
    const open = table.classList.toggle('is-open');
    button.textContent = open ? 'Скрыть ответы' : 'Показать ответы';
  }));

  document.querySelectorAll('.hw-download').forEach(button => button.addEventListener('click', () => window.print()));

  // Язык примеров: Python или C#. Выбор хранится в браузере; если хранилище
  // недоступно, колода открывается на Python.
  function setLang(next) {
    const current = slides[index];
    document.documentElement.dataset.lang = next;
    try { localStorage.setItem('op04-l07-lang', next); } catch (_) { /* без хранилища */ }
    slides = allSlides.filter(inLang);
    const keep = slides.indexOf(current);
    // Если текущего экрана в новом языке нет, остаёмся на ближайшем предыдущем.
    let target = keep;
    if (keep < 0) {
      const pos = allSlides.indexOf(current);
      target = Math.max(0, slides.findIndex(s => allSlides.indexOf(s) >= pos));
      if (target < 0) target = slides.length - 1;
    }
    allSlides.forEach(s => s.classList.remove('is-active', 'is-leaving-left'));
    index = target;
    slides[index].classList.add('is-active');
    updateUi();
  }
  document.querySelectorAll('[data-set-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.setLang)));

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { /* Полноэкранный режим может быть заблокирован внутри превью. */ }
  });

  document.addEventListener('keydown', event => {
    if (sourcesPanel.classList.contains('is-open')) {
      if (event.key === 'Escape') closeSources();
      return;
    }
    if (event.target.closest('a, button') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) { event.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); previous(); }
    if (event.key.toLowerCase() === 's') openSources();
    if (event.key.toLowerCase() === 'f') fullscreenButton.click();
    if (event.key.toLowerCase() === 'l') setLang(lang() === 'py' ? 'cs' : 'py');
    if (event.key === 'Home') render(0, -1);
    if (event.key === 'End') render(slides.length - 1, 1);
  });

  document.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    if (event.target.closest('.player, .cuts, .shelves, .memrow')) { touchStartX = null; return; }
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) delta < 0 ? next() : previous();
    touchStartX = null;
  }, { passive: true });

  const initial = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));
  index = initial;
  allSlides.forEach(slide => slide.classList.remove('is-active'));
  slides[initial].classList.add('is-active');
  updateUi();
})();
