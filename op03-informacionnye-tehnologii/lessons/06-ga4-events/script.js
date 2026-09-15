(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.lesson-slide')];
  let current = 0;
  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; slide.classList.toggle('active', i === current); });
    slides[current].scrollTop = 0;
    document.querySelector('#current').textContent = String(current + 1).padStart(2, '0');
    document.querySelector('#chapter').textContent = slides[current].dataset.stage;
    document.querySelector('#progress').style.width = `${(current + 1) / slides.length * 100}%`;
    document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', current + 1);
    document.querySelector('#prev').disabled = current === 0;
    document.querySelector('#next').disabled = current === slides.length - 1;
    history.replaceState(null, '', `#${slides[current].id.replace('slide-', '')}`);
    document.title = `${slides[current].id.replace('slide-', '')} · ${slides[current].dataset.title} · Тема 6`;
  }
  function indexById(id) { const found = slides.findIndex(slide => slide.id === `slide-${id}`); return found < 0 ? 0 : found; }
  function fromHash() { const id = Number(location.hash.replace('#slide-', '').replace('#', '')); show(indexById(id)); }
  document.documentElement.classList.add('events-ready');
  fromHash();
  addEventListener('hashchange', fromHash);
  document.querySelector('#prev').onclick = () => show(current - 1);
  document.querySelector('#next').onclick = () => show(current + 1);
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => document.getElementById(b.dataset.open).showModal());
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { b.closest('dialog').close(); show(indexById(Number(b.dataset.go))); });
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { document.querySelector('#announcement').textContent = 'Полный экран недоступен в этом браузере.'; } };
  document.querySelector('#fullscreen').onclick = fullscreen;
  document.querySelector('#print').onclick = () => { document.querySelector('#sources').close(); window.print(); };
  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || document.querySelector('dialog[open]') || e.target.closest('input,textarea,select,button,a,summary')) return;
    if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); show(current + 1); }
    if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); show(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
    if (e.key.toLowerCase() === 'm') document.querySelector('#contents').showModal();
    if (e.key.toLowerCase() === 's') document.querySelector('#sources').showModal();
    if (e.key.toLowerCase() === 'f') fullscreen();
  });
  document.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => {
    try { await navigator.clipboard.writeText(b.closest('figure').querySelector('code').textContent); b.textContent = 'Скопировано'; } catch { b.textContent = 'Выделите код вручную'; }
  });
  document.querySelectorAll('[data-zoom]').forEach(b => b.onclick = () => { const modal = document.querySelector('#visual'); modal.querySelector('img').src = b.querySelector('img').src; modal.querySelector('img').alt = b.querySelector('img').alt; modal.showModal(); });
  const log = document.querySelector('.event-log'); let events = [];
  document.querySelectorAll('[data-demo-event]').forEach(b => b.onclick = () => {
    events.push({event: b.dataset.demoEvent, parameters: b.dataset.demoEvent === 'cta_click' ? {button_name:'program',page_section:'hero'} : {lead_source:'contact_form'}});
    log.textContent = events.map((event,i) => `${i+1}. ${JSON.stringify(event,null,2)}`).join('\n'); log.scrollTop = log.scrollHeight;
  });
  document.querySelector('[data-demo-clear]').onclick = () => { events = []; log.textContent = 'Журнал пуст. В GA4 ничего не отправляется.'; };
  document.querySelectorAll('.scroll-model').forEach(model => {
    const input = model.querySelector('input'); let fired = false;
    input.oninput = () => { model.querySelector('output').value = `${input.value}%`; model.querySelector('.depth i').style.width = `${input.value}%`; if (+input.value >= 90) fired = true; model.querySelector('[role=status]').textContent = fired ? 'scroll: 1 событие за просмотр. Повторная прокрутка не добавит второе.' : 'Событие ещё не возникло.'; };
    model.querySelector('button').onclick = () => { fired = false; input.value = 0; input.oninput(); };
  });
  addEventListener('beforeprint', () => slides.forEach(s => s.hidden = false));
  addEventListener('afterprint', () => show(current));
})();
