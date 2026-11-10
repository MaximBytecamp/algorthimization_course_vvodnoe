/* Режим чтения: лекция по одному разделу — одна мысль на экране.
   Разделы — элементы .part внутри .leaf. Кнопки с атрибутом data-reader-start включают режим;
   панель внизу листает разделы, ← и → тоже, Esc возвращает всю лекцию.
   Место чтения хранится в localStorage только для удобства: без него режим начинается с первого раздела. */
(function () {
  const parts = Array.from(document.querySelectorAll('.leaf > .part'));
  if (!parts.length) return;

  const storeKey = 'reader:' + location.pathname;
  const load = () => { try { return parseInt(localStorage.getItem(storeKey), 10) || 0; } catch (e) { return 0; } };
  const save = (n) => { try { localStorage.setItem(storeKey, String(n)); } catch (e) { /* без сохранения */ } };

  const titleOf = (p) => {
    const h = p.querySelector('h2, h3');
    return h ? h.textContent.replace(/^§\d+\s*/, '').trim() : '';
  };
  const secOf = (p) => {
    const s = p.querySelector('h2 .sec');
    return s ? s.textContent.trim() : '';
  };

  const progress = document.createElement('div');
  progress.className = 'reader-progress';
  progress.innerHTML = '<i></i>';

  const bar = document.createElement('nav');
  bar.className = 'reader-bar';
  bar.setAttribute('aria-label', 'Режим чтения');
  bar.innerHTML =
    '<button type="button" class="reader-bar__exit" data-act="exit">✕ Вся лекция</button>' +
    '<span class="reader-bar__where"><b></b><span></span></span>' +
    '<button type="button" data-act="prev">← Назад</button>' +
    '<button type="button" class="reader-bar__next" data-act="next">Дальше →</button>';
  document.body.append(progress, bar);

  const where = bar.querySelector('.reader-bar__where b');
  const whereTitle = bar.querySelector('.reader-bar__where span');
  const prevBtn = bar.querySelector('[data-act="prev"]');
  const nextBtn = bar.querySelector('[data-act="next"]');
  let current = 0;

  function show(n) {
    current = Math.max(0, Math.min(parts.length - 1, n));
    parts.forEach((p, k) => p.classList.toggle('is-current', k === current));
    const p = parts[current];
    where.textContent = (current + 1) + ' из ' + parts.length;
    whereTitle.textContent = [secOf(p), titleOf(p)].filter(Boolean).join(' ');
    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === parts.length - 1 ? 'Готово ✓' : 'Дальше →';
    progress.firstChild.style.width = ((current + 1) / parts.length * 100) + '%';
    save(current);
    window.scrollTo(0, 0);
  }

  function enter(n) {
    document.body.classList.add('reading');
    show(n);
  }

  function exit() {
    document.body.classList.remove('reading');
    parts.forEach((p) => p.classList.remove('is-current'));
    parts[current].scrollIntoView();
  }

  function next() {
    if (current === parts.length - 1) { save(0); exit(); return; }
    show(current + 1);
  }

  bar.addEventListener('click', (e) => {
    const act = e.target.closest('button') && e.target.closest('button').dataset.act;
    if (act === 'exit') exit();
    if (act === 'prev') show(current - 1);
    if (act === 'next') next();
  });

  // переход в конце раздела тоже листает вперёд
  parts.forEach((p) => p.querySelectorAll('.next').forEach((el) => {
    el.addEventListener('click', () => { if (document.body.classList.contains('reading')) next(); });
  }));

  document.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('reading')) return;
    if (e.target.closest('input, textarea, summary')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'Escape') exit();
  });

  // кнопки запуска: «с начала» и «продолжить», если чтение уже начиналось
  const saved = load();
  document.querySelectorAll('[data-reader-start]').forEach((btn) => {
    const from = btn.dataset.readerStart === 'continue' ? saved : 0;
    if (btn.dataset.readerStart === 'continue') {
      if (saved > 0 && saved < parts.length) {
        btn.hidden = false;
        btn.textContent = 'Продолжить: ' + [secOf(parts[saved]), titleOf(parts[saved])].filter(Boolean).join(' ') + ' →';
      } else {
        btn.hidden = true;
      }
    }
    btn.addEventListener('click', () => enter(from));
  });
})();
