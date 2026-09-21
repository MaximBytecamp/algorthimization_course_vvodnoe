/* Тема 04 «Докстринги и документация кода» — мелкая механика страницы.
   1. Картинка открывается во весь экран по клику.
   2. Событие на ленте лет подсвечивается вместе с годом. */
(() => {
  /* ---- Увеличение картинки ------------------------------------- */
  const shots = [...document.querySelectorAll('.shot img:not(.shot--logo img)')];
  if (shots.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>'
      + '<p class="lightbox__hint">клик или Esc — закрыть</p>';
    document.body.appendChild(box);

    const image = box.querySelector('img');
    const caption = box.querySelector('figcaption');

    const open = source => {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || '';
      const own = source.closest('figure')?.querySelector('figcaption');
      caption.textContent = own ? own.textContent.trim() : image.alt;
      caption.hidden = !caption.textContent;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
    };

    const close = () => {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      image.removeAttribute('src');
    };

    shots.forEach(source => {
      source.tabIndex = 0;
      source.addEventListener('click', () => open(source));
      source.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(source);
      });
    });

    box.addEventListener('click', close);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  }


  /* ---- Переключатель операционной системы ---------------------- */
  /* Инструкции по установке разные, а глава одна: блоки помечены
     data-os, видимостью управляет CSS, выбор запоминается на все главы. */
  const detectOs = () => {
    const platform = (navigator.userAgentData && navigator.userAgentData.platform)
      || navigator.platform || '';
    if (/win/i.test(platform)) return 'win';
    if (/mac|iphone|ipad/i.test(platform)) return 'mac';
    return 'linux';
  };

  if (document.querySelector('.book [data-os]')) {
    const items = [['win', 'Windows'], ['mac', 'macOS'], ['linux', 'Linux']];
    const key = 'docs-book-os';

    const read = () => {
      try {
        const saved = localStorage.getItem(key);
        return items.some(([id]) => id === saved) ? saved : detectOs();
      } catch (_) {
        return detectOs();
      }
    };

    const bar = document.createElement('div');
    bar.className = 'osbar';
    bar.innerHTML = '<span class="osbar__label">система</span>';

    const buttons = items.map(([id, title]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = title;
      button.dataset.value = id;
      bar.appendChild(button);
      return button;
    });

    const apply = (value, save) => {
      document.documentElement.setAttribute('data-os', value);
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === value)));
      if (save) {
        try { localStorage.setItem(key, value); } catch (_) { /* приватный режим */ }
      }
    };

    buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.value, true)));

    const running = document.querySelector('.running');
    if (running) running.appendChild(bar);
    apply(read(), false);

    // Выбор, сделанный в другой вкладке, подхватывается без перезагрузки.
    window.addEventListener('storage', event => {
      if (event.key === key && event.newValue) apply(read(), false);
    });
  }

  /* ---- Подсветка события на ленте лет --------------------------- */
  /* Карточка и год разнесены по разные стороны рельсы, поэтому связь
     между ними видна только при наведении. */
  document.querySelectorAll('.era__item').forEach(item => {
    const year = item.querySelector('.era__year');
    const card = item.querySelector('.era__card');
    if (!year || !card) return;
    const lit = state => {
      card.style.boxShadow = state ? '5px 5px 0 var(--fire)' : '';
      card.style.borderColor = state ? 'var(--fire-deep)' : '';
      year.style.color = state ? 'var(--fire-deep)' : '';
    };
    item.addEventListener('mouseenter', () => lit(true));
    item.addEventListener('mouseleave', () => lit(false));
  });
})();

/* ---- Разбор механизма: вкладки ---------------------------------- */
/* Блок .demo показывает одно место кода при разных условиях. Разметка
   остаётся читаемой без скриптов: панели скрываются только здесь, после
   того как кнопки заработали. */
(() => {
  document.querySelectorAll('.demo[data-demo]').forEach(demo => {
    const buttons = [...demo.querySelectorAll('.demo__tabs button')];
    const panes = [...demo.querySelectorAll('.demo__pane')];
    if (buttons.length !== panes.length || !buttons.length) return;

    const show = index => {
      buttons.forEach((button, i) => button.setAttribute('aria-selected', String(i === index)));
      panes.forEach((pane, i) => { pane.hidden = i !== index; });
    };

    buttons.forEach((button, index) => {
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.addEventListener('click', () => show(index));
      button.addEventListener('keydown', event => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = (index + step + buttons.length) % buttons.length;
        buttons[next].focus();
        show(next);
      });
    });

    show(0);
  });


  /* ---- Пошаговое появление схемы ------------------------------- */
  /* Шаги проступают по очереди: так видно порядок, а не готовая картинка.
     Показ запускается, когда блок доходит до экрана, и повторяется кнопкой. */
  const flows = [...document.querySelectorAll('.flowline[data-play]')];
  if (flows.length) {
    const play = flow => {
      const steps = [...flow.querySelectorAll('.flowline__step')];
      steps.forEach(step => step.classList.remove('is-on'));
      steps.forEach((step, index) => setTimeout(() => step.classList.add('is-on'), 260 * index));
    };

    flows.forEach(flow => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flowline__replay';
      button.textContent = '↻ показать по шагам';
      button.addEventListener('click', () => play(flow));
      flow.appendChild(button);
    });

    if ('IntersectionObserver' in window) {
      const watcher = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          play(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      flows.forEach(flow => watcher.observe(flow));
    } else {
      flows.forEach(play);
    }
  }
})();
