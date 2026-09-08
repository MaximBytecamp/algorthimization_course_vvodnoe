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
    .querySelectorAll('.card, .notes li, .steps li, .checklist li, .spec, .route div')
    .forEach(element => element.classList.add('fragment'));

  function reveal(slide) {
    timers.forEach(clearTimeout);
    timers = [];

    [...slide.querySelectorAll('.fragment')].forEach((element, fragmentIndex) => {
      element.classList.remove('revealed');
      timers.push(setTimeout(() => element.classList.add('revealed'), 160 + fragmentIndex * 55));
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
    document.title = `${pad(index + 1)} · Установка Ubuntu в VirtualBox`;
    reveal(active);
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
    lightboxImage.alt = image.alt || 'Увеличенный скриншот';

    const caption = image.closest('figure')?.querySelector('figcaption')?.textContent;
    lightboxCaption.textContent = caption || image.alt || 'Скриншот презентации';

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
    image.setAttribute('aria-label', `Увеличить изображение: ${image.alt || 'скриншот'}`);
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

  document.getElementById('fullscreenButton').addEventListener('click', async () => {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await document.documentElement.requestFullscreen();
    } catch (_) {}
  });

  document.addEventListener('keydown', event => {
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

  document.addEventListener(
    'touchstart',
    event => {
      touch = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    event => {
      if (touch === null || lightbox.classList.contains('is-open')) return;
      const distance = event.changedTouches[0].clientX - touch;
      if (Math.abs(distance) > 55) go(index + (distance < 0 ? 1 : -1));
      touch = null;
    },
    { passive: true }
  );

  update();
})();
