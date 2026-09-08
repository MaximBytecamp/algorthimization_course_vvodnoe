(() => {
  /* ---------------------------------------------------------
     Занятие 2 · embedding и referencing. Каркас колоды взят из
     колоды занятия 1: заставка, переходы, каскад, источники, печать
     задания. Своё здесь одно — прогон заявки CR-014 на экране 3.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Каркас колоды: заставка, переходы, каскад, источники.
     --------------------------------------------------------- */
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
    '.def', '.tbl', '.zones li', '.qcard', '.check > li', '.hw-cards > li',
    '.hw-order > div', '.stepbar i', '.bytes__legend > div', '.types tbody tr',
    '.final-metrics > span', '.title-meta span', '.shot-duo .shot',
    '.bill__card', '.runcard', '.pick', '.decide__row', '.adr > div', '.wall__bar'
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

  function animateNumbers(slide) {
    if (countFrame) cancelAnimationFrame(countFrame);
    const targets = [...slide.querySelectorAll('.final-metrics strong')];
    if (!targets.length) return;
    const start = performance.now();
    const duration = 850;
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
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1 && !hiddenFragments().length;
    document.title = `${pad(index + 1)} · Embedding и referencing: проектирование от операций`;
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
    window.setTimeout(() => previous.classList.remove('is-leaving-left'), 460);
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

  /* ---------------------------------------------------------
     Экран 03 · прогон заявки CR-014. Числа — со стенда:
     49 резюме и 5 приглашений хранят копию названия, справочник
     компаний хранит его один раз. Кнопка выполняет то же, что
     updateMany + updateOne: две коллекции обновляются, третья
     остаётся со старым значением, потому что про неё забыли.
     --------------------------------------------------------- */
  const crRun = document.getElementById('crRun');
  if (crRun) {
    const cards = ['rcEmbed', 'rcInterviews', 'rcCompanies'].map(id => document.getElementById(id));
    const note = document.getElementById('crNote');
    crRun.addEventListener('click', () => {
      crRun.disabled = true;
      cards.forEach((card, cardIndex) => {
        const value = card.querySelector('strong');
        const from = Number(value.dataset.from);
        const to = Number(value.dataset.to);
        window.setTimeout(() => {
          const start = performance.now();
          const step = now => {
            const raw = Math.min(1, (now - start) / 700);
            value.textContent = Math.round(from + (to - from) * raw);
            if (raw < 1) requestAnimationFrame(step);
            else card.classList.add(to === from ? 'is-stale' : 'is-fixed');
          };
          requestAnimationFrame(step);
        }, 200 + cardIndex * 500);
      });
      window.setTimeout(() => {
        note.innerHTML = 'Правка выполнена за 4 мс. <b>Пять приглашений остались со старым названием:</b> ' +
          'их никто не просил менять, и никто про них не вспомнил.';
      }, 1900);
    });
  }

  // Печатный лист задания: на печать уходит только .hw-sheet — см. @media print.
  function printSheet() {
    window.print();
  }
  const hwDownload = document.getElementById('hwDownload');
  if (hwDownload) hwDownload.addEventListener('click', printSheet);

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
