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
  const finalSourcesButton = document.getElementById('finalSourcesButton');
  const sourcesPanel = document.getElementById('sourcesPanel');
  let index = 0;
  let touchStartX = null;
  let bootOpen = Boolean(boot);
  let revealTimers = [];
  let countFrame = null;

  const pad = value => String(value).padStart(2, '0');
  const staggerSelector = [
    '.stat', '.use-grid article', '.depth-strip > div', '.definition-notes > div',
    '.tradeoff-row > span', '.system-grid > article', '.system-grid > figure',
    '.process-line > li', '.criteria-row > span', '.audit-stack > div',
    '.company-card', '.platform-row > span', '.topic-cloud > span',
    '.core-bands > span', '.roadmap > article', '.canvas-flow > div',
    '.acceptance-strip > span', '.timeline > article', '.git-strip > span',
    '.scenario-grid > span', '.scenario-grid > figure', '.scenario-example > *',
    '.mock-grid > div', '.readiness-strip > span', '.final-metrics > span',
    '.portfolio-strip > span', '.big-list li', '.complexity-bars > div',
    '.policy-grid article', '.final-steps span', '.compare-list > div', '.mosaic .ph', '.example-row article', '.step-cards article', '.glossary > div', '.hw-row'
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
      }, 360 + itemIndex * 105));
    });
  }

  function hiddenFragments() {
    return [...slides[index].querySelectorAll('.fragment:not(.revealed)')];
  }

  function animateNumbers(slide) {
    if (countFrame) cancelAnimationFrame(countFrame);
    const targets = [...slide.querySelectorAll('.stat strong, .final-metrics strong')];
    const start = performance.now();
    const duration = 900;
    const values = targets.map(element => {
      const original = element.dataset.original || element.textContent.trim();
      element.dataset.original = original;
      const match = original.match(/([0-9]+)/);
      return { element, value: match ? Number(match[1]) : null, suffix: match ? original.slice(match.index + match[1].length) : '' };
    });
    const tick = now => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      values.forEach(({ element, value, suffix }) => {
        if (value !== null) element.textContent = `${Math.round(value * eased)}${suffix}`;
      });
      if (raw < 1) countFrame = requestAnimationFrame(tick);
    };
    countFrame = requestAnimationFrame(tick);
  }

  function updateUi() {
    const active = slides[index];
    currentNumber.textContent = pad(index + 1);
    totalNumber.textContent = pad(slides.length);
    progress.style.setProperty('--progress', `${((index + 1) / slides.length) * 100}%`);
    deck.style.setProperty('--accent', `var(--${active.dataset.accent})`);
    deck.classList.toggle('is-inverse', active.matches('.slide--question, .slide--title'));
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1 && !hiddenFragments().length;
    document.title = `${pad(index + 1)} · Основы алгоритмизации`;
    history.replaceState(null, '', `#${pad(index + 1)}`);
    revealFragments(active);
    animateNumbers(active);
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

  prevButton.addEventListener('click', previous);
  nextButton.addEventListener('click', next);
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => render(Number(button.dataset.go), -1)));
  sourcesButton.addEventListener('click', openSources);
  if (finalSourcesButton) finalSourcesButton.addEventListener('click', openSources);
  document.querySelectorAll('[data-close-sources]').forEach(element => element.addEventListener('click', closeSources));

  const hwDownload = document.getElementById('hwDownload');
  if (hwDownload) hwDownload.addEventListener('click', () => window.print());

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
