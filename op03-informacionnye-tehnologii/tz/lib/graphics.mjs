// Печати, подписи и схемы для ТЗ. Всё рисуется SVG, без растровых файлов.

let uid = 0;
const id = p => `${p}${++uid}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Круглая печать организации: текст по кругу, внутреннее кольцо, центр с логотипом.
export function seal({ outer, inner, center = [], logo = '', ink = '#2b3c9e', rotate = -9, size = 168 }) {
  const f = id('grain'), p1 = id('arc'), p2 = id('arc');
  const r1 = 66, r2 = 47;
  const arc = r => `M 80,80 m -${r},0 a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 -${2 * r},0`;
  const lines = center.map((t, i) => `<text x="80" y="${center.length === 1 ? 104 : 100 + i * 10}" text-anchor="middle" font-size="${i === 0 ? 8.6 : 7.4}" font-weight="${i === 0 ? 700 : 400}" letter-spacing=".3">${esc(t)}</text>`).join('');
  return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 160 160" style="transform:rotate(${rotate}deg)">
  <defs>
    <filter id="${f}" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${uid * 7}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.25 1.32" result="mask"/>
      <feComposite in="SourceGraphic" in2="mask" operator="in" result="ink"/>
      <feDisplacementMap in="ink" in2="n" scale="1.1"/>
    </filter>
    <path id="${p1}" d="${arc(r1 - 9)}"/>
    <path id="${p2}" d="${arc(r2 - 7.5)}"/>
  </defs>
  <g filter="url(#${f})" fill="${ink}" stroke="${ink}" font-family="PT Sans, Arial, sans-serif" opacity=".9">
    <circle cx="80" cy="80" r="${r1 + 9}" fill="none" stroke-width="2.6"/>
    <circle cx="80" cy="80" r="${r1 + 5.5}" fill="none" stroke-width=".9"/>
    <circle cx="80" cy="80" r="${r2 + 1}" fill="none" stroke-width="1.4"/>
    <circle cx="80" cy="80" r="${r2 - 13}" fill="none" stroke-width=".7"/>
    <text font-size="10.2" font-weight="700" stroke="none" letter-spacing=".6"><textPath href="#${p1}" startOffset="0" textLength="${(2 * Math.PI * (r1 - 9) - 6).toFixed(1)}">${esc(outer)}</textPath></text>
    <text font-size="7.6" stroke="none" letter-spacing=".4"><textPath href="#${p2}" startOffset="0" textLength="${(2 * Math.PI * (r2 - 7.5) - 4).toFixed(1)}">${esc(inner)}</textPath></text>
    <g stroke="none" transform="translate(80 ${center.length ? 70 : 80}) scale(.62) translate(-24 -24)">${logo}</g>
    <g stroke="none">${lines}</g>
  </g>
</svg>`;
}

// Прямоугольный штамп («Утверждено», «Копия верна» и т. п.).
export function stamp({ lines, ink = '#a8262b', rotate = 4, width = 190 }) {
  const f = id('grain');
  const h = 18 + lines.length * 15;
  const t = lines.map((s, i) => `<text x="${width / 2}" y="${22 + i * 15}" text-anchor="middle" font-size="${i === 0 ? 12.5 : 10}" font-weight="${i === 0 ? 700 : 400}" letter-spacing="${i === 0 ? 1.6 : .3}">${esc(s)}</text>`).join('');
  return `<svg class="stamp" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" style="transform:rotate(${rotate}deg)">
  <defs><filter id="${f}"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="${uid * 3}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>
  <g filter="url(#${f})" fill="${ink}" stroke="${ink}" font-family="PT Sans, Arial, sans-serif" opacity=".85">
    <rect x="2" y="2" width="${width - 4}" height="${h - 4}" rx="5" fill="none" stroke-width="2.2"/>
    <rect x="6" y="6" width="${width - 12}" height="${h - 12}" rx="3" fill="none" stroke-width=".7"/>
    <g stroke="none">${t}</g>
  </g>
</svg>`;
}

// Рукописная подпись: путь задаётся в данных компании, здесь только «чернила».
export function signature(path, { ink = '#1d2a6b', width = 150, rotate = -3 } = {}) {
  return `<svg class="signature" width="${width}" height="${width * .42}" viewBox="0 0 200 84" style="transform:rotate(${rotate}deg)">
  <path d="${path}" fill="none" stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>
</svg>`;
}

// Схема потоков данных: узлы по колонкам, стрелки между ними.
export function flow({ nodes, links, width = 680, height = 300 }) {
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  const W = 118, H = 44;
  const arrows = links.map(([a, b, label]) => {
    const s = map[a], t = map[b];
    let x1 = s.x + W, y1 = s.y + H / 2, x2 = t.x, y2 = t.y + H / 2;
    if (t.x === s.x) { x1 = s.x + W / 2; y1 = s.y + (t.y > s.y ? H : 0); x2 = t.x + W / 2; y2 = t.y + (t.y > s.y ? 0 : H); }
    else if (t.x < s.x) { x1 = s.x; x2 = t.x + W; }
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const d = t.x === s.x ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    return `<path d="${d}" fill="none" stroke="#7a8597" stroke-width="1.3" marker-end="url(#arr)"/>` +
      (label ? `<text x="${mx}" y="${my - 4}" text-anchor="middle" font-size="8.6" fill="#556070">${esc(label)}</text>` : '');
  }).join('');
  const boxes = nodes.map(n => `<g>
    <rect x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="7" fill="${n.fill || '#fff'}" stroke="${n.stroke || '#c4cad4'}" stroke-width="1.2"/>
    <text x="${n.x + W / 2}" y="${n.y + (n.sub ? 18 : 27)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1f2733">${esc(n.label)}</text>
    ${n.sub ? `<text x="${n.x + W / 2}" y="${n.y + 33}" text-anchor="middle" font-size="8.8" fill="#5b6575">${esc(n.sub)}</text>` : ''}
  </g>`).join('');
  return `<svg class="flow" viewBox="0 0 ${width} ${height}" width="100%" font-family="PT Sans, Arial, sans-serif">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#7a8597"/></marker></defs>
  ${arrows}${boxes}
</svg>`;
}

// Схема страницы: блоки сверху вниз, у каждого — подпись и событие, которое он отправляет.
export function wireframe({ title, blocks, accent }) {
  const w = 300, pad = 10;
  let y = 38;
  const rows = blocks.map(b => {
    const h = b.h || 34;
    const out = `<rect x="${pad}" y="${y}" width="${w - 2 * pad}" height="${h}" rx="4" fill="${b.cta ? accent + '22' : '#f3f5f8'}" stroke="${b.cta ? accent : '#cfd5de'}" stroke-dasharray="${b.cta ? '0' : '3 2'}"/>
      <text x="${pad + 8}" y="${y + 15}" font-size="10" font-weight="700" fill="#1f2733">${esc(b.name)}</text>
      ${b.note ? `<text x="${pad + 8}" y="${y + 27}" font-size="8.4" fill="#5b6575">${esc(b.note)}</text>` : ''}
      ${b.event ? `<text x="${w - pad - 8}" y="${y + 15}" text-anchor="end" font-size="8.4" font-family="PT Mono, monospace" fill="${accent}">${esc(b.event)}</text>` : ''}`;
    y += h + 6;
    return out;
  }).join('');
  return `<svg class="wire" viewBox="0 0 ${w} ${y + 4}" width="100%" font-family="PT Sans, Arial, sans-serif">
  <rect x="1" y="1" width="${w - 2}" height="${y + 2}" rx="8" fill="#fff" stroke="#9aa3b1"/>
  <rect x="1" y="1" width="${w - 2}" height="26" rx="8" fill="#e8ebf0"/>
  <circle cx="14" cy="14" r="3.4" fill="#e06b5f"/><circle cx="25" cy="14" r="3.4" fill="#e6b54a"/><circle cx="36" cy="14" r="3.4" fill="#63b867"/>
  <text x="${w / 2}" y="18" text-anchor="middle" font-size="9.4" font-family="PT Mono, monospace" fill="#445">${esc(title)}</text>
  ${rows}
</svg>`;
}
