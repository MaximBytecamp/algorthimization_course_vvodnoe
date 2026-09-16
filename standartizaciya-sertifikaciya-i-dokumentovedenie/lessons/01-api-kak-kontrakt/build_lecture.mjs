// Собирает лекцию (lekciya/) из того же content.js, что и колода.
// Запуск: node build_lecture.mjs
// Текст темы живёт в одном месте: правка слайда попадает и в колоду, и в лекцию.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'lekciya');
const source = fs.readFileSync(path.join(dir, 'content.js'), 'utf8');
const sandbox = {};
new Function('window', 'module', source + '\nwindow.slides = lessonSlides; window.groups = lessonGroups;')(sandbox, {});
const { slides, groups } = sandbox;

const pad = n => String(n).padStart(2, '0');
const fileFor = i => `${pad(i + 1)}-${groups[i].slug}.html`;
// Ссылки внутри готовой разметки слайда считаются от папки урока — поправим на папку лекции.
const rebase = html => html
  .replace(/(src|href)="shots\//g, '$1="../shots/')
  .replace(/href="\.\.\/\.\.\//g, 'href="../../../')
  .replace(/href="(LESSON_PLAN\.md|SOURCE_SCENARIO\.md|shots\/README\.md)"/g, 'href="../$1"');

const head = (title, description) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#172335">
<meta name="description" content="${description}">
<title>${title}</title>
<link rel="stylesheet" href="lecture.css">
<script defer src="../interactive.js"></script><script defer src="lecture.js"></script></head>`;

const topbar = (activeIndex) => `<header class="lec-top">
<a class="lec-brand" href="../../../index.html"><b>API</b><span>Стандартизация<br>тема 1</span></a>
<nav class="lec-gauge" aria-label="Части темы">${groups.map((g, i) => `<a href="${fileFor(i)}" style="--c:${g.color}" ${i === activeIndex ? 'aria-current="page"' : ''} title="Часть ${i + 1}. ${g.title}"><span>${i + 1}</span></a>`).join('')}</nav>
<a class="lec-mode" href="../index.html${activeIndex >= 0 ? '#' + pad(groups[activeIndex].start) : ''}" title="Те же материалы слайдами для показа на проекторе">Открыть слайдами →</a>
</header>`;

const foot = `<footer class="lec-foot"><div class="lec-wrap">
<p>Учебный проект темы: <a href="https://github.com/MaximBytecamp/api-standard-template">api-standard-template</a> · <a href="https://maximbytecamp.github.io/api-standard-template/">документация API</a> · <a href="../../../api-standard-template/docs/STANDARDS.md">источники правил с цитатами</a>.</p>
<p class="lec-credits"><span>Стандартизация, сертификация и техническое документоведение · 4 курс</span><span>Макаров Максим Николаевич</span></p>
</div></footer>`;

function partPage(groupIndex) {
  const group = groups[groupIndex];
  const items = slides.slice(group.start - 1, group.end);
  const nav = [
    groupIndex > 0 ? `<a class="lec-prev" href="${fileFor(groupIndex - 1)}">← Часть ${groupIndex}. ${groups[groupIndex - 1].title}</a>` : `<a class="lec-prev" href="index.html">← Содержание темы</a>`,
    groupIndex < groups.length - 1 ? `<a class="lec-next" href="${fileFor(groupIndex + 1)}">Часть ${groupIndex + 2}. ${groups[groupIndex + 1].title} →</a>` : `<a class="lec-next" href="index.html">Содержание темы →</a>`,
  ].join('');
  const toc = items.map((s, i) => `<li><a href="#s${group.start + i}"><span>${group.start + i}</span>${s.title}</a></li>`).join('');
  const sections = items.map((s, i) => {
    const n = group.start + i;
    return `<section class="lec-stage" id="s${n}">
<h2><span class="lec-num">${n}</span>${s.title}</h2>
${s.intro ? `<p class="lead">${s.intro}</p>` : ''}
<div class="slide-body">${rebase(s.body)}</div>
</section>`;
  }).join('\n');
  return `${head(`Часть ${groupIndex + 1}. ${group.title} · API как контракт`, group.bridge || group.title)}
<body class="lec" style="--c:${group.color}"><a class="skip" href="#main">К тексту части</a>
${topbar(groupIndex)}
<main id="main">
<section class="lec-hero"><div class="lec-wrap">
<p class="lec-kicker">Часть ${groupIndex + 1} из ${groups.length} · слайды ${group.start}–${group.end}</p>
<h1>${group.title}</h1>
<p class="lec-bridge">${group.bridge || ''}</p>
<ol class="lec-toc">${toc}</ol>
</div></section>
<div class="lec-wrap lec-page">
${sections}
<nav class="lec-nav">${nav}</nav>
</div>
</main>
${foot}
<div id="toast" role="status" hidden></div>
<dialog id="visual"><div class="dialog-head"><h2 id="visual-title">Кадр крупным планом</h2><button data-close aria-label="Закрыть изображение">✕</button></div><div id="visual-content"></div></dialog>
</body></html>`;
}

function indexPage() {
  const parts = groups.map((g, i) => `<li style="--c:${g.color}"><a href="${fileFor(i)}">
<span class="lec-st">${i + 1}</span><b>${g.title}</b><p>${g.bridge || ''}</p><small>слайды ${g.start}–${g.end} · ${g.end - g.start + 1} разворотов</small></a></li>`).join('');
  return `${head('API как публичный контракт программы · лекция', 'Лекция по теме 1 дисциплины «Стандартизация, сертификация и техническое документоведение»: HTTP и REST, OpenAPI, ошибки, версии, стандарт и его проверка.')}
<body class="lec" style="--c:#2d6fd0"><a class="skip" href="#main">К содержанию</a>
${topbar(-1)}
<main id="main">
<section class="lec-hero lec-cover"><div class="lec-wrap">
<p class="lec-kicker">Стандартизация, сертификация и техническое документоведение · 4 курс · тема 1</p>
<h1>API как публичный контракт программы</h1>
<p class="lec-bridge">${slides[0].intro}</p>
<a class="lec-start" href="${fileFor(0)}">Часть 1 →</a>
</div></section>
<div class="lec-wrap lec-page">
<section><h2>Что внутри</h2>
<p class="lead">Тот же материал, что и в колоде из ${slides.length} слайдов, но текстом и по частям: читать можно подряд, а можно открыть нужную часть.</p>
<ol class="lec-parts">${parts}</ol></section>
<section><h2>Материалы темы</h2>
<div class="lec-links">
<a href="../index.html"><b>Колода для показа</b><span>${slides.length} слайдов, полноэкранный режим</span></a>
<a href="../LESSON_PLAN.md"><b>План преподавателя</b><span>как вести части, что уточнено в сценарии</span></a>
<a href="https://github.com/MaximBytecamp/api-standard-template"><b>Учебный проект</b><span>Service Desk API: код, тесты, CI</span></a>
<a href="https://maximbytecamp.github.io/api-standard-template/"><b>Документация API</b><span>ReDoc и страницы видов ошибок</span></a>
<a href="../../../api-standard-template/docs/STANDARDS.md"><b>Источники правил</b><span>цитаты стандартов с переводом</span></a>
<a href="../shots/README.md"><b>Список кадров</b><span>что снято и откуда</span></a>
</div></section>
</div>
</main>
${foot}
<div id="toast" role="status" hidden></div>
<dialog id="visual"><div class="dialog-head"><h2 id="visual-title">Кадр крупным планом</h2><button data-close aria-label="Закрыть изображение">✕</button></div><div id="visual-content"></div></dialog>
</body></html>`;
}

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), indexPage());
groups.forEach((g, i) => fs.writeFileSync(path.join(out, fileFor(i)), partPage(i)));
console.log(`лекция собрана: ${groups.length} частей, ${slides.length} разворотов → ${path.relative(dir, out)}/`);
