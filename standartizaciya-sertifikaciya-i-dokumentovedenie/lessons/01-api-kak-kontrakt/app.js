'use strict';
(() => {
  const main = document.getElementById('slides');
  const total = lessonSlides.length;
  const pad = n => String(n).padStart(2, '0');
  const groupFor = n => lessonGroups.find(group => n >= group.start && n <= group.end);
  const partFile = group => `lekciya/${pad(lessonGroups.indexOf(group) + 1)}-${group.slug}.html`;

  main.innerHTML = lessonSlides.map((slide, i) => {
    const n = i + 1, group = groupFor(n), tag = n === 1 ? 'h1' : 'h2';
    const partIndex = lessonGroups.indexOf(group);
    // Карта частей и связка с предыдущей частью — только на первом слайде части.
    const cover = n === group.start ? `<div class="part-cover"><ol class="part-map" aria-label="Части темы">${lessonGroups.map((g, gi) => `<li class="${gi < partIndex ? 'done' : gi === partIndex ? 'now' : ''}" style="--c:${g.color}" title="${g.title}"><span>${gi + 1}</span></li>`).join('')}</ol><p class="part-bridge"><b>Часть ${partIndex + 1} из ${lessonGroups.length}.</b> ${group.bridge || ''}</p></div>` : '';
    return `<section class="slide${slide.cls ? ' ' + slide.cls : ''}" id="slide-${pad(n)}" style="--c:${group.color}" aria-labelledby="title-${pad(n)}" hidden><header>${cover}<p class="eyebrow">${group.title}<span>${pad(n)} / ${total}</span></p><${tag} id="title-${pad(n)}">${slide.title}</${tag}>${slide.intro ? `<p class="lead">${slide.intro}</p>` : ''}</header><div class="slide-body">${slide.body}</div></section>`;
  }).join('');
  const slides = [...main.querySelectorAll('.slide')];

  document.getElementById('outline').innerHTML = lessonGroups.map(group => `<section style="--c:${group.color}"><h3>${group.title}<small>${group.time}</small></h3>${lessonSlides.slice(group.start - 1, group.end).map((slide, i) => `<button data-go="${group.start + i}"><span>${pad(group.start + i)}</span>${slide.title}</button>`).join('')}</section>`).join('');

  let index = 0;
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const lectureLink = document.getElementById('lecture-link');
  const hashIndex = () => {
    const match = location.hash.match(/^#(?:slide-)?(\d{1,3})$/);
    return match ? Math.max(0, Math.min(total - 1, Number(match[1]) - 1)) : 0;
  };
  function show(target, updateHash = true) {
    index = Math.max(0, Math.min(total - 1, target));
    const focusInSlide = main.contains(document.activeElement);
    slides.forEach((slide, i) => { slide.hidden = i !== index; slide.classList.remove('enter'); });
    // Перезапуск анимаций при каждом показе слайда.
    void slides[index].offsetWidth;
    slides[index].classList.add('enter');
    main.scrollTop = 0;
    const group = groupFor(index + 1);
    document.getElementById('chapter').textContent = `${group.title} · ${group.time}`;
    document.getElementById('counter').textContent = `${pad(index + 1)} / ${total}`;
    document.getElementById('progress').style.width = `${(index + 1) / total * 100}%`;
    document.querySelector('.progress').setAttribute('aria-valuenow', index + 1);
    document.documentElement.style.setProperty('--c', group.color);
    document.querySelectorAll('#outline [data-go]').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.go) === index + 1)));
    prev.disabled = index === 0;
    next.disabled = index === total - 1;
    // Подсказка на кнопках: куда ведёт переход.
    const plainTitle = i => (lessonSlides[i]?.title || '').replace(/<[^>]+>/g, '');
    next.title = next.disabled ? 'Это последний слайд' : `Далее: ${plainTitle(index + 1)}`;
    prev.title = prev.disabled ? 'Это первый слайд' : `Назад: ${plainTitle(index - 1)}`;
    // Кнопка «Читать лекцией» открывает ту же тему текстом на месте текущего слайда.
    lectureLink.href = `${partFile(group)}#s${index + 1}`;
    lectureLink.title = `Текст этого места темы: часть «${group.title}»`;
    const plain = lessonSlides[index].title.replace(/<[^>]+>/g, '');
    document.title = `${pad(index + 1)} · ${plain} · API как контракт`;
    document.getElementById('announcement').textContent = `Слайд ${index + 1} из ${total}. ${plain}`;
    if (updateHash) history.replaceState(null, '', `#${pad(index + 1)}`);
    if (focusInSlide) main.focus({ preventScroll: true });
  }
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  window.addEventListener('hashchange', () => show(hashIndex(), false));

  const dialogTriggers = new WeakMap();
  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    dialogTriggers.set(dialog, trigger);
    dialog.showModal();
  }
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open, button)));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialogTriggers.get(dialog)?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
    button.closest('dialog')?.close(); show(Number(button.dataset.go) - 1); main.focus({ preventScroll: true });
  }));

  document.getElementById('fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { toast('Полноэкранный режим недоступен в этом браузере.'); }
  });
  document.getElementById('print').addEventListener('click', () => window.print());

  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (event.target.closest('button,a,summary') && ['Enter', ' '].includes(event.key)) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(total - 1); }
    else if (event.key.toLowerCase() === 'f') document.getElementById('fullscreen').click();
    else if (event.key.toLowerCase() === 'm') document.querySelector('[data-open="contents"]').click();
    else if (event.key.toLowerCase() === 's') document.querySelector('[data-open="sources"]').click();
    else if (event.key.toLowerCase() === 'l') lectureLink.click();
  });

  let touchStart;
  main.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button,a,input,textarea,summary,pre,.table-wrap')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  main.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x, dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.7) show(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  let toastTimer;
  function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message; element.hidden = false; clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
  }

  window.apiTopicInteractive(main, {
    toast,
    onZoom: (img, title) => {
      document.getElementById('visual-content').innerHTML = `<img src="${img.getAttribute('src')}" alt="${img.alt}">`;
      document.getElementById('visual-title').textContent = title;
      openDialog('visual', img.closest('.shot-view'));
    },
  });

  show(hashIndex(), false);
})();
