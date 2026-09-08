(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.getElementById('deck');
  const current = document.getElementById('currentNumber');
  const total = document.getElementById('totalNumber');
  const progress = document.getElementById('progress');
  const prev = document.getElementById('prevButton');
  const next = document.getElementById('nextButton');
  const sources = document.getElementById('sourcesPanel');
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = lightbox.querySelector('.image-lightbox__close');

  let index = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));
  let touch = null;
  let timers = [];
  let lastImage = null;

  const pad = number => String(number).padStart(2, '0');

  document
    .querySelectorAll('.card, .notes li, .agenda div, .era__beat, .ledger__row, .spec, .checklist li, .logo-card, .myths > div, .hw-cards li, .hw-order div, .memory__page')
    .forEach(element => element.classList.add('fragment'));

  function reveal(slide) {
    timers.forEach(clearTimeout);
    timers = [];

    [...slide.querySelectorAll('.fragment')].forEach((element, fragmentIndex) => {
      element.classList.remove('revealed');
      timers.push(setTimeout(() => element.classList.add('revealed'), 150 + fragmentIndex * 45));
    });

    slide.querySelectorAll('.stack').forEach(stack => {
      stack.classList.remove('is-live');
      [...stack.children].forEach((layer, layerIndex) => {
        layer.style.transitionDelay = `${layerIndex * 130}ms`;
      });
      timers.push(setTimeout(() => stack.classList.add('is-live'), 120));
    });
  }

  /* Диаграмма состояний: токен ходит по циклу «готов → выполняется → ожидает». */
  let statesTimer = null;
  function runStates(slide) {
    clearInterval(statesTimer);
    const nodes = [...slide.querySelectorAll('.states__node')];
    if (!nodes.length) return;
    let position = 0;
    nodes.forEach(node => node.classList.remove('is-hot'));
    nodes[0].classList.add('is-hot');
    statesTimer = setInterval(() => {
      nodes[position].classList.remove('is-hot');
      position = (position + 1) % nodes.length;
      nodes[position].classList.add('is-hot');
    }, 1400);
  }

  /* Демонстрация планировщика: одно ядро, три процесса, фиксированная запись прогона. */
  const SLOTS = [
    'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'a', 'b',
    'c', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c',
    'a', 'b', 'a', 'b', 'c', 'a', 'b', 'c', 'a', 'b'
  ];
  let schedTimer = null;

  function resetSched(root) {
    clearInterval(schedTimer);
    root.querySelectorAll('.sched__track').forEach(track => (track.innerHTML = ''));
    root.querySelectorAll('.sched__num').forEach(cell => (cell.textContent = '0%'));
    root.querySelector('[data-sched-switches]').textContent = '0';
    root.querySelector('[data-sched-slots]').textContent = '0';
  }

  function runSched(root) {
    resetSched(root);
    const width = 100 / SLOTS.length;
    const owned = { a: 0, b: 0, c: 0 };
    let step = 0;
    let switches = 0;

    schedTimer = setInterval(() => {
      if (step >= SLOTS.length) {
        clearInterval(schedTimer);
        return;
      }

      const owner = SLOTS[step];
      if (step > 0 && SLOTS[step - 1] !== owner) switches += 1;

      ['a', 'b', 'c'].forEach(name => {
        const track = root.querySelector(`.sched__track[data-process="${name}"]`);
        const cell = document.createElement('i');
        cell.className = name === owner ? 'sched__cell' : 'sched__cell sched__cell--wait';
        cell.style.left = `${step * width}%`;
        cell.style.width = `${width}%`;
        track.appendChild(cell);
      });

      owned[owner] += 1;
      step += 1;

      ['a', 'b', 'c'].forEach(name => {
        const value = Math.round((owned[name] / step) * 100);
        root.querySelector(`.sched__num[data-process="${name}"]`).textContent = `${value}%`;
      });
      root.querySelector('[data-sched-switches]').textContent = String(switches);
      root.querySelector('[data-sched-slots]').textContent = String(step);
    }, 110);
  }

  const schedRoot = document.querySelector('.sched');
  if (schedRoot) {
    schedRoot.querySelector('[data-sched-run]').addEventListener('click', () => runSched(schedRoot));
    schedRoot.querySelector('[data-sched-reset]').addEventListener('click', () => resetSched(schedRoot));
  }

  /* Конструктор паспорта: выбранные признаки собираются в одну строку описания. */
  const builder = document.querySelector('.builder');
  if (builder) {
    const output = builder.querySelector('.builder__out');
    const picked = {};

    builder.querySelectorAll('.builder__axis').forEach(axis => {
      axis.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          axis.querySelectorAll('button').forEach(other => other.classList.remove('is-picked'));
          button.classList.add('is-picked');
          picked[axis.dataset.axis] = button.dataset.value;

          const order = ['tasks', 'users', 'purpose', 'interface', 'time', 'source'];
          const parts = order.filter(key => picked[key]).map(key => picked[key]);

          output.innerHTML = parts.length
            ? `Моя система: <b>${parts.join('</b>, <b>')}</b>. Осталось назвать наблюдение, которое это подтверждает.`
            : '<em>Выберите значение в каждом столбце — строка соберётся здесь.</em>';
        });
      });
    });
  }

  function update() {
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
    const active = slides[index];

    current.textContent = pad(index + 1);
    total.textContent = pad(slides.length);
    progress.style.setProperty('--progress', `${((index + 1) / slides.length) * 100}%`);
    deck.style.setProperty('--accent', `var(--${active.dataset.accent || 'orange'})`);
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    history.replaceState(null, '', `#${pad(index + 1)}`);
    document.title = `${pad(index + 1)} · История, назначение и виды операционных систем`;

    reveal(active);
    runStates(active);
    if (schedRoot && !active.contains(schedRoot)) resetSched(schedRoot);
  }

  function go(nextIndex) {
    index = Math.max(0, Math.min(slides.length - 1, nextIndex));
    update();
  }

  function openSources() {
    sources.classList.add('is-open');
    sources.setAttribute('aria-hidden', 'false');
  }

  function closeSources() {
    sources.classList.remove('is-open');
    sources.setAttribute('aria-hidden', 'true');
  }

  function openImage(image) {
    lastImage = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || 'Увеличенное изображение';

    const caption = image.closest('figure')?.querySelector('figcaption')?.textContent;
    lightboxCaption.textContent = caption || image.alt || 'Изображение презентации';

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
  }

  function closeImage() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    lastImage?.focus();
  }

  document.querySelectorAll('.slide img').forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Увеличить изображение: ${image.alt || 'иллюстрация'}`);
    image.title = 'Нажмите, чтобы увеличить';

    image.addEventListener('click', () => openImage(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openImage(image);
      }
    });
  });

  lightboxClose.addEventListener('click', closeImage);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target === lightboxImage) closeImage();
  });

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  document.querySelectorAll('[data-go]').forEach(button =>
    button.addEventListener('click', () => go(Number(button.dataset.go)))
  );

  document.getElementById('sourcesButton').addEventListener('click', openSources);
  document.querySelectorAll('[data-close-sources]').forEach(button =>
    button.addEventListener('click', closeSources)
  );

  const hwDownload = document.getElementById('hwDownload');
  if (hwDownload) hwDownload.addEventListener('click', () => window.print());

  document.getElementById('fullscreenButton').addEventListener('click', async () => {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await document.documentElement.requestFullscreen();
    } catch (_) {}
  });

  document.addEventListener('keydown', event => {
    if (event.target.closest('.builder, .sched')) return;

    if (lightbox.classList.contains('is-open')) {
      if (event.key === 'Escape') closeImage();
      return;
    }

    if (sources.classList.contains('is-open')) {
      if (event.key === 'Escape') closeSources();
      return;
    }

    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      go(index + 1);
    }

    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) {
      event.preventDefault();
      go(index - 1);
    }

    if (event.key.toLowerCase() === 's') openSources();
    if (event.key.toLowerCase() === 'f') document.getElementById('fullscreenButton').click();
    if (event.key === 'Home') go(0);
    if (event.key === 'End') go(slides.length - 1);
  });

  document.addEventListener('touchstart', event => { touch = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', event => {
    if (touch === null || lightbox.classList.contains('is-open')) return;
    const distance = event.changedTouches[0].clientX - touch;
    if (Math.abs(distance) > 55) go(index + (distance < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });

  update();
})();
