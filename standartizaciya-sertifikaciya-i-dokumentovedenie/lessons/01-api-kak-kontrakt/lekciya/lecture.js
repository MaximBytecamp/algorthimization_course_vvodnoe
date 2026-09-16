'use strict';
// Лекция: те же интерактивные блоки, что и в колоде, плюс появление разделов
// при прокрутке и подсветка текущей части в шкале.
(() => {
  const main = document.getElementById('main');
  if (!main) return;

  let toastTimer;
  function toast(message) {
    const element = document.getElementById('toast');
    if (!element) return;
    element.textContent = message; element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
  }

  const dialog = document.getElementById('visual');
  dialog?.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  window.apiTopicInteractive(main, {
    toast,
    onZoom: (img, title) => {
      if (!dialog) { window.open(img.getAttribute('src'), '_blank', 'noopener'); return; }
      document.getElementById('visual-content').innerHTML = `<img src="${img.getAttribute('src')}" alt="${img.alt}">`;
      document.getElementById('visual-title').textContent = title;
      dialog.showModal();
    },
  });

  const stages = [...main.querySelectorAll('.lec-stage')];
  if (!stages.length) return;
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('enter'); reveal.unobserve(entry.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  stages.forEach(stage => reveal.observe(stage));

  // Адрес в строке браузера следует за прочитанным разделом: ссылка ведёт на то же место.
  let current = '';
  const track = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible || visible.target.id === current) return;
    current = visible.target.id;
    history.replaceState(null, '', `#${current}`);
  }, { rootMargin: '-15% 0px -70% 0px' });
  stages.forEach(stage => track.observe(stage));
})();
