/* Движок колоды занятия 4.

   Показ экранов, постепенное появление блоков, счётчик, полноэкранный
   режим, свайпы, таймер на экранах практики и окно «Показать файл» —
   всё как в колоде занятия 3, чтобы преподавателю не переучиваться.
   Отличие одно: демонстрации этой колоды интерактивные, поэтому
   каскад появления не трогает блок с границей замера — он должен
   быть кликабелен с первой секунды.                                    */
(() => {
  const slides = [...document.querySelectorAll('.slide')];
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
  const fileModal = document.getElementById('fileModal');
  const fileModalName = document.getElementById('fileModalName');
  const fileModalBody = document.getElementById('fileModalBody');
  const fileCopy = document.getElementById('fileCopy');
  let index = 0;
  let touchStartX = null;
  let bootOpen = Boolean(boot);
  let revealTimers = [];
  let timerHandle = null;

  const pad = value => String(value).padStart(2, '0');
  const staggerSelector = [
    '.cards4 article', '.duo__side', '.myths > div', '.checklist > div',
    '.big-list li', '.hw-cards li', '.hw-order > div', '.task-list li',
    '.journal__cell', '.mem-steps__row', '.verdict__form > div',
    '.samples__legend > div', '.lab__col'
  ].join(',');

  document.querySelectorAll(staggerSelector).forEach(element => element.classList.add('fragment'));

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
    const items = [...slide.querySelectorAll('.fragment')];
    items.forEach(item => item.classList.remove('revealed'));
    items.forEach((item, itemIndex) => {
      revealTimers.push(window.setTimeout(() => {
        item.classList.add('revealed');
        if (itemIndex === items.length - 1) nextButton.disabled = index === slides.length - 1;
      }, 320 + itemIndex * 85));
    });
  }

  function hiddenFragments() {
    return [...slides[index].querySelectorAll('.fragment:not(.revealed)')];
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
    deck.style.setProperty('--accent', `var(--${active.dataset.accent})`);
    deck.classList.toggle('is-inverse', active.matches('.slide--question, .slide--title, .slide--practice'));
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1 && !hiddenFragments().length;
    document.title = `${pad(index + 1)} · Замеры времени и памяти`;
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
      nextButton.disabled = index === slides.length - 1;
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

  function openFile(name) {
    const template = document.querySelector(`.file-vault template[data-file-name="${name}"]`);
    if (!template) return;
    fileModalName.textContent = name;
    fileModalBody.textContent = template.content.textContent;
    fileCopy.textContent = 'Копировать';
    fileModal.classList.add('is-open');
    fileModal.setAttribute('aria-hidden', 'false');
    fileModalBody.scrollTop = 0;
  }

  function closeFile() {
    fileModal.classList.remove('is-open');
    fileModal.setAttribute('aria-hidden', 'true');
  }

  prevButton.addEventListener('click', previous);
  nextButton.addEventListener('click', next);
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => render(Number(button.dataset.go), -1)));
  sourcesButton.addEventListener('click', openSources);
  document.querySelectorAll('[data-close-sources]').forEach(element => element.addEventListener('click', closeSources));
  document.querySelectorAll('[data-file]').forEach(button => button.addEventListener('click', () => openFile(button.dataset.file)));
  document.querySelectorAll('[data-close-file]').forEach(element => element.addEventListener('click', closeFile));

  fileCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(fileModalBody.textContent);
      fileCopy.textContent = 'Скопировано';
    } catch (_) {
      fileCopy.textContent = 'Выделите и скопируйте';
    }
  });

  const hwDownload = document.getElementById('hwDownload');
  if (hwDownload) hwDownload.addEventListener('click', () => window.print());

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { /* Полноэкранный режим может быть заблокирован внутри превью. */ }
  });

  document.addEventListener('keydown', event => {
    if (fileModal.classList.contains('is-open')) {
      if (event.key === 'Escape') closeFile();
      return;
    }
    if (sourcesPanel.classList.contains('is-open')) {
      if (event.key === 'Escape') closeSources();
      return;
    }
    if (event.target.closest('a, button') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) { event.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); previous(); }
    if (event.key.toLowerCase() === 's') openSources();
    if (event.key.toLowerCase() === 'f') fullscreenButton.click();
    if (event.key === 'Home') render(0, -1);
    if (event.key === 'End') render(slides.length - 1, 1);
  });

  document.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) delta < 0 ? next() : previous();
    touchStartX = null;
  }, { passive: true });

  const initial = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));
  index = initial;
  slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === initial));
  updateUi();
})();
