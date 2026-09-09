(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const current = document.getElementById('current');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let counterFrame = 0;
  let touchStart = null;
  let dialogTrigger = null;
  const pad = n => String(n).padStart(2, '0');
  const hashIndex = () => {
    const value = /^#(?:slide-)?(\d+)$/.exec(location.hash);
    return value ? Math.max(0, Math.min(slides.length - 1, Number(value[1]) - 1)) : 0;
  };

  function animateCounters(slide) {
    cancelAnimationFrame(counterFrame);
    const counters = [...slide.querySelectorAll('[data-count]')];
    if (!counters.length) return;
    if (reducedMotion.matches) {
      counters.forEach(el => { el.textContent = el.dataset.count; });
      return;
    }
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 750, 1);
      const ease = 1 - (1 - progress) ** 3;
      counters.forEach(el => { el.textContent = Math.round(Number(el.dataset.count) * ease); });
      if (progress < 1) counterFrame = requestAnimationFrame(tick);
    };
    counterFrame = requestAnimationFrame(tick);
  }

  function show(target, updateHash = true) {
    index = Math.max(0, Math.min(slides.length - 1, target));
    const active = slides[index];
    const oldActive = document.querySelector('.slide.active');
    const focusWasInSlide = oldActive && oldActive !== active && oldActive.contains(document.activeElement);
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    active.scrollTop = 0;
    current.textContent = pad(index + 1);
    document.getElementById('chapter').textContent = active.dataset.group;
    document.getElementById('progress').style.width = `${(index + 1) / slides.length * 100}%`;
    document.querySelector('.progress').setAttribute('aria-valuenow', index + 1);
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    document.querySelectorAll('[data-go]').forEach(button => {
      button.setAttribute('aria-current', String(Number(button.dataset.go) === index));
    });
    document.title = `${pad(index + 1)} · ${active.dataset.title} · ОП.03`;
    if (updateHash) history.replaceState(null, '', `#${pad(index + 1)}`);
    document.getElementById('announcement').textContent = `Слайд ${index + 1} из ${slides.length}. ${active.dataset.title}`;
    if (focusWasInSlide) document.getElementById('slides').focus({ preventScroll: true });
    animateCounters(active);
  }

  slides.forEach(slide => {
    slide.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--order', i));
  });
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => {
      dialogTrigger = button;
      document.getElementById(button.dataset.open).showModal();
    });
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialogTrigger?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => {
      button.closest('dialog')?.close();
      show(Number(button.dataset.go));
    });
  });
  document.querySelectorAll('.ui-figure .mock').forEach(mock => {
    mock.tabIndex = 0;
    mock.setAttribute('role', 'button');
    mock.setAttribute('aria-label', mock.querySelector('img') ? 'Увеличить скриншот GA4' : 'Увеличить учебную схему GA4');
    mock.title = 'Нажмите, чтобы увеличить';
    const enlarge = () => {
      dialogTrigger = mock;
      const clone = mock.cloneNode(true);
      clone.removeAttribute('tabindex');
      clone.removeAttribute('role');
      clone.removeAttribute('aria-label');
      clone.removeAttribute('title');
      document.getElementById('visualContent').replaceChildren(clone);
      document.getElementById('visualCaption').textContent = mock.closest('figure').querySelector('figcaption').textContent;
      document.getElementById('visual').showModal();
    };
    mock.addEventListener('click', enlarge);
    mock.addEventListener('keydown', event => {
      if (['Enter', ' '].includes(event.key)) {
        event.preventDefault(); event.stopPropagation(); enlarge();
      }
    });
  });
  document.getElementById('fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {
      document.getElementById('announcement').textContent = 'Браузер не разрешил полноэкранный режим.';
    }
  });
  document.getElementById('print').addEventListener('click', () => {
    document.getElementById('sources').close();
    window.print();
  });

  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.target.closest('button, a, summary') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
    else if (event.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
    else if (event.key.toLowerCase() === 's') document.querySelector('[data-open="sources"]').click();
    else if (event.key.toLowerCase() === 'm') document.querySelector('[data-open="contents"]').click();
  });
  const main = document.getElementById('slides');
  main.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button, a, summary, select, input, textarea')) {
      touchStart = null; return;
    }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  main.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.6) show(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  main.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  window.addEventListener('hashchange', () => show(hashIndex(), false));

  const levels = [
    ['Account — кому принадлежит аналитика?', 'Верхний контейнер. Объединяет ресурсы одного владельца или организации.'],
    ['Property — какой проект анализируем?', 'Ресурс конкретного проекта. Здесь находятся пользователи, события, отчёты, аудитории и настройки.'],
    ['Data Stream — откуда поступают данные?', 'Источник событий внутри ресурса: сайт, Android- или iOS-приложение. Для нашего сайта выбираем Web.']
  ];
  document.querySelectorAll('[data-level]').forEach(button => {
    button.addEventListener('click', () => {
      const n = Number(button.dataset.level);
      document.querySelectorAll('[data-level]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      document.getElementById('levelNumber').textContent = pad(n + 1);
      document.getElementById('levelTitle').textContent = levels[n][0];
      document.getElementById('levelText').textContent = levels[n][1];
    });
  });
  document.getElementById('timeZone').addEventListener('change', event => {
    const instant = new Date(Date.UTC(2026, 8, 9, 21, 30) + Number(event.target.value) * 3600000);
    document.getElementById('timeResult').textContent = `${instant.getUTCDate()} сентября · ${pad(instant.getUTCHours())}:${pad(instant.getUTCMinutes())}`;
  });

  // Printing exposes all slides and answers, then restores the presentation state.
  const printDetails = new Map();
  window.addEventListener('beforeprint', () => {
    slides.forEach(slide => { slide.inert = false; slide.removeAttribute('aria-hidden'); });
    document.querySelectorAll('.quiz-grid details').forEach(el => { printDetails.set(el, el.open); el.open = true; });
    document.querySelectorAll('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
    cancelAnimationFrame(counterFrame);
  });
  window.addEventListener('afterprint', () => {
    printDetails.forEach((open, el) => { el.open = open; });
    printDetails.clear();
    show(index, false);
  });
  document.documentElement.classList.add('js');
  show(hashIndex());
})();
