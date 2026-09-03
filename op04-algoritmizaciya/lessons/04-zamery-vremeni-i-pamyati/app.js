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
  const fragments = [
    '.metric', '.term', '.finding', '.method-step', '.noise-item',
    '.scenario', '.review-item', '.result-row', '.memory-band',
    '.comparison tbody tr', '.checklist li', '.defect', '.defense-question'
  ].join(',');

  document.querySelectorAll(fragments).forEach(node => node.classList.add('fragment'));

  function dismissBoot() {
    if (!bootOpen) return false;
    bootOpen = false;
    boot.classList.add('is-gone');
    window.setTimeout(() => boot.remove(), 600);
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
    if (new URLSearchParams(location.search).has('skip')) window.setTimeout(dismissBoot, 0);
  }

  function revealFragments(slide) {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
    const items = [...slide.querySelectorAll('.fragment')];
    items.forEach(item => item.classList.remove('revealed'));
    items.forEach((item, itemIndex) => {
      revealTimers.push(window.setTimeout(() => item.classList.add('revealed'), 260 + itemIndex * 85));
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
      if (left <= 0) return clearInterval(timerHandle);
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
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1 && !hiddenFragments().length;
    document.title = `${pad(index + 1)} · Измерение производительности`;
    history.replaceState(null, '', `#${pad(index + 1)}`);
    revealFragments(active);
    startTimer(active);
    document.dispatchEvent(new CustomEvent('deck:slide', { detail: { slide: active, index } }));
  }

  function render(nextIndex, direction = 1) {
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (clamped === index && slides[index].classList.contains('is-active')) return;
    const previous = slides[index];
    previous.classList.remove('is-active', 'is-leaving-left');
    if (direction > 0) previous.classList.add('is-leaving-left');
    window.setTimeout(() => previous.classList.remove('is-leaving-left'), 420);
    index = clamped;
    slides[index].classList.add('is-active');
    updateUi();
  }

  function next() {
    const pending = hiddenFragments();
    if (pending.length) {
      revealTimers.forEach(clearTimeout);
      pending.forEach(item => item.classList.add('revealed'));
      return;
    }
    render(index + 1, 1);
  }

  function previous() { render(index - 1, -1); }

  function openPanel(panel) {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel(panel) {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  function openFile(name) {
    const template = document.querySelector(`template[data-file-name="${name}"]`);
    if (!template) return;
    fileModalName.textContent = name;
    fileModalBody.textContent = template.content.textContent.trim();
    fileCopy.textContent = 'Копировать';
    openPanel(fileModal);
  }

  prevButton.addEventListener('click', previous);
  nextButton.addEventListener('click', next);
  sourcesButton.addEventListener('click', () => openPanel(sourcesPanel));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => render(Number(button.dataset.go), -1)));
  document.querySelectorAll('[data-close-sources]').forEach(node => node.addEventListener('click', () => closePanel(sourcesPanel)));
  document.querySelectorAll('[data-file]').forEach(button => button.addEventListener('click', () => openFile(button.dataset.file)));
  document.querySelectorAll('[data-close-file]').forEach(node => node.addEventListener('click', () => closePanel(fileModal)));

  fileCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(fileModalBody.textContent);
      fileCopy.textContent = 'Скопировано';
    } catch (_) {
      fileCopy.textContent = 'Выделите код';
    }
  });

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { /* Полноэкранный режим может быть запрещён внутри превью. */ }
  });

  document.addEventListener('keydown', event => {
    if (bootOpen) return;
    if (fileModal.classList.contains('is-open')) {
      if (event.key === 'Escape') closePanel(fileModal);
      return;
    }
    if (sourcesPanel.classList.contains('is-open')) {
      if (event.key === 'Escape') closePanel(sourcesPanel);
      return;
    }
    if (event.target.closest('button, a') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) { event.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); previous(); }
    if (event.key.toLowerCase() === 's') openPanel(sourcesPanel);
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
