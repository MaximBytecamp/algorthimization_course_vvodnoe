(() => {
  /* ---------------------------------------------------------
     Полоса года: 57 учебных единиц собираются из описания
     разделов, чтобы в разметке не лежало 57 одинаковых span.
     Единицы 24, 27, 30 и 32 — самостоятельные работы.
     --------------------------------------------------------- */
  const SECTIONS = [
    { tag: 'Р1',  from: 1,  to: 2,  hours: 4,  color: '#D97706', title: 'Архитектура хранения' },
    { tag: 'Р2',  from: 3,  to: 7,  hours: 10, color: '#16A34A', title: 'MongoDB' },
    { tag: 'Р3',  from: 8,  to: 12, hours: 10, color: '#7C3AED', title: 'ClickHouse' },
    { tag: 'Р4',  from: 13, to: 16, hours: 8,  color: '#E11D48', title: 'Интеграция и Redis' },
    { tag: 'Р5',  from: 17, to: 22, hours: 12, color: '#0891B2', title: 'RabbitMQ' },
    { tag: 'Р6',  from: 23, to: 33, hours: 22, color: '#2563EB', title: 'Защита платформы' },
    { tag: 'Р7',  from: 34, to: 38, hours: 10, color: '#DB2777', title: 'Управление доступом' },
    { tag: 'Р8',  from: 39, to: 43, hours: 10, color: '#CA8A04', title: 'Копии и восстановление' },
    { tag: 'Р9',  from: 44, to: 48, hours: 10, color: '#059669', title: 'Производительность' },
    { tag: 'Р10', from: 49, to: 53, hours: 10, color: '#4F46E5', title: 'Тесты и эксплуатация' },
    { tag: 'Р11', from: 54, to: 57, hours: 8,  color: '#DC2626', title: 'Жизненный цикл и зачёт' }
  ];
  const SOLO = [24, 27, 30, 32];

  const sectionOf = unit => SECTIONS.find(s => unit >= s.from && unit <= s.to);

  function buildSemester() {
    const host = document.getElementById('semester');
    const legend = document.getElementById('semesterLegend');
    if (!host) return;

    const rows = [
      { tag: '7 семестр', note: '58 аудиторных + 8 самостоятельных часов', from: 1, to: 33 },
      { tag: '8 семестр', note: '48 аудиторных часов · зачёт', from: 34, to: 57 }
    ];

    rows.forEach(row => {
      const wrap = document.createElement('div');
      wrap.className = 'semester__row';

      const tag = document.createElement('div');
      tag.className = 'semester__tag';
      tag.innerHTML = `<b>${row.tag}</b>${row.note}`;

      const cells = document.createElement('div');
      cells.className = 'semester__cells';
      for (let unit = row.from; unit <= row.to; unit += 1) {
        const section = sectionOf(unit);
        const cell = document.createElement('i');
        cell.style.setProperty('--c', section.color);
        if (SOLO.includes(unit)) cell.classList.add('solo');
        cell.title = `Единица ${unit} · ${section.tag} ${section.title}` + (SOLO.includes(unit) ? ' · самостоятельная работа' : '');
        cell.innerHTML = `<b>${unit}</b>`;
        cells.appendChild(cell);
      }

      wrap.append(tag, cells);
      host.appendChild(wrap);
    });

    if (!legend) return;
    SECTIONS.forEach(section => {
      const item = document.createElement('span');
      item.style.setProperty('--c', section.color);
      item.innerHTML = `<i></i>${section.tag} ${section.title} <em>· ${section.hours} ч</em>`;
      legend.appendChild(item);
    });
  }

  buildSemester();

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
    '.contours article', '.works article', '.pstrip span', '.gates > div',
    '.stages > div', '.clock .arc', '.pairs__row', '.pg-list > div',
    '.stack span', '.grade > li', '.final-metrics > span', '.title-meta span',
    '.semester__row', '.semester__legend span'
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
    document.title = `${pad(index + 1)} · Разработка и защита баз данных`;
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
