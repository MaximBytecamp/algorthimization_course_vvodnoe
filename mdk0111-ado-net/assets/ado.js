/* МДК.01.11 · общие помощники страниц занятий:
   выбор элементов, экранирование, подсветка C#, подсветка текущей части в верхнем меню. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 1. Подсветка C# ---------- */
const KW = new Set('using await var const new while if else return int string decimal bool for foreach true false null'.split(' '));
const TYPES = /^(Npgsql\w*|Console|DateTime|Dictionary|DBNull)$/;
function hl(line) {
  const re = /(\/\/.*$)|(\$?"(?:[^"\\]|\\.)*")|("{3})|([A-Za-z_]\w*)|(\d+)|(\s+)|(.)/g;
  let out = '', m;
  while ((m = re.exec(line))) {
    const [t, com, str, tri, word, num] = m;
    if (com) out += `<span class="c">${esc(com)}</span>`;
    else if (str || tri) out += `<span class="s">${esc(t)}</span>`;
    else if (word) {
      if (KW.has(word)) out += `<span class="k">${word}</span>`;
      else if (TYPES.test(word)) out += `<span class="t">${word}</span>`;
      else if (/^[A-Z]/.test(word) && line[re.lastIndex] === '(') out += `<span class="m">${word}</span>`;
      else out += word;
    } else if (num) out += `<span class="m">${num}</span>`;
    else out += esc(t);
  }
  return out;
}
function renderCode(pre, lines) {
  pre.innerHTML = lines.map(l => `<span class="ln">${hl(l) || ' '}</span>`).join('');
  return $$('.ln', pre);
}
window.ado = { $, $$, esc, hl, renderCode };

/* ---------- навигация: подсветка текущей части ---------- */
(() => {
  const links = $$('.topbar nav a');
  const parts = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  const onScroll = () => {
    let cur = 0;
    parts.forEach((p, i) => { if (p && p.getBoundingClientRect().top < 120) cur = i; });
    links.forEach((a, i) => a.classList.toggle('is-on', i === cur));
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

