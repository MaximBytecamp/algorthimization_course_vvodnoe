(() => {
  'use strict';
  // Локальная подсветка без CDN и исполнения учебного кода в браузере.
  const keywords = new Set('class def return if else elif for in not and or is None True False import from as with try except raise pass super lambda yield del assert'.split(' '));
  const tokens = /#[^\n]*|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b/g;
  document.querySelectorAll('figure.code[data-run="python"] pre').forEach(pre => {
    const raw = pre.textContent;
    const code = document.createElement('code');
    code.className = 'language-python';
    let pos = 0;
    for (const match of raw.matchAll(tokens)) {
      code.append(document.createTextNode(raw.slice(pos, match.index)));
      const value = match[0];
      const cls = value.startsWith('#') ? 'comment' : /^['"]/.test(value) ? 'string' : /^\d/.test(value) ? 'number' : keywords.has(value) ? 'keyword' : '';
      if (cls) {
        const span = document.createElement('span');
        span.className = `tok-${cls}`;
        span.textContent = value;
        code.append(span);
      } else code.append(document.createTextNode(value));
      pos = match.index + value.length;
    }
    code.append(document.createTextNode(raw.slice(pos)));
    pre.replaceChildren(code);
    const caption = pre.closest('figure').querySelector('figcaption');
    if (!caption) return;
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = 'Копировать';
    button.setAttribute('aria-label', 'Копировать пример Python');
    const status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(raw);
        status.textContent = 'Код скопирован';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(pre);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'Код выделен. Нажмите Ctrl+C или ⌘C';
      }
    });
    caption.append(button, status);
  });
})();
