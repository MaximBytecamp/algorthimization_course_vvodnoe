'use strict';
// Справочник: увеличение кадров, копирование примеров, оглавление главы по прокрутке.
(() => {
  const dialog = document.getElementById('zoom');
  if (dialog) {
    document.querySelectorAll('.shot img').forEach(img => img.addEventListener('click', () => {
      dialog.querySelector('img').src = img.currentSrc || img.src;
      dialog.querySelector('img').alt = img.alt;
      dialog.querySelector('.bar span').textContent = img.closest('.shot').querySelector('figcaption b')?.textContent || 'Кадр';
      dialog.showModal();
    }));
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  }

  // Копирование примера: код в справочнике повторяют в терминале.
  document.querySelectorAll('.code:not(.code--out)').forEach(box => {
    const title = box.querySelector('b');
    if (!title) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy';
    button.textContent = 'копировать';
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(box.querySelector('pre').innerText); button.textContent = 'скопировано'; }
      catch { button.textContent = 'выделите вручную'; }
      setTimeout(() => { button.textContent = 'копировать'; }, 2000);
    });
    title.append(button);
  });

  // Текущий параграф подсвечивается в оглавлении главы.
  const links = [...document.querySelectorAll('.contents a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;
  const watch = new IntersectionObserver(entries => {
    const top = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!top) return;
    links.forEach(a => a.style.borderBottomColor = a.getAttribute('href') === '#' + top.target.id ? 'var(--acc)' : 'transparent');
  }, { rootMargin: '-10% 0px -75% 0px' });
  sections.forEach(s => watch.observe(s));
})();
