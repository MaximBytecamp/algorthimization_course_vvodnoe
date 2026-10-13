// Сборка ТЗ ОП.05 в PDF: node build.mjs [номер ...]. Без аргументов собирает все три.
// Требования читаются из ../content.py (тот же текст, что на страницах сайта), легенда — из data/. PDF копируется в ../pdf/ для сайта.
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { render } from './lib/render.mjs';
import { load } from './lib/load.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.env.HOME, 'python_presentations/tools/'));
const { chromium } = require('playwright');
const downloads = join(process.env.HOME, 'Downloads', 'ТЗ_ОП05');

const items = await load(process.argv.slice(2));

mkdirSync(join(here, 'out'), { recursive: true });
mkdirSync(downloads, { recursive: true });
mkdirSync(join(here, '..', 'pdf'), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const { tz, req } of items) {
  const f = tz.file;
  const html = render(tz, req);
  if (/\$\{|undefined|NaN/.test(html.replace(/<style>[\s\S]*?<\/style>/, ''))) throw new Error(`${f}: в тексте осталась неподставленная переменная`);
  const htmlPath = join(here, 'out', `${tz.file}.html`);
  writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  const pdf = join(here, 'out', `${tz.file}.pdf`);
  await page.pdf({
    path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:7pt 'PT Sans',Arial;white-space:nowrap;color:#8a93a2;padding:0 15mm 0 18mm;display:flex;justify-content:space-between">
      <span>ТЗ № ${tz.code} · ООО «Пятый склад»</span>
      <span>Кейс ОП.05 · организация, реквизиты, печать и подписи вымышлены</span>
      <span>стр. <span class="pageNumber"></span> из <span class="totalPages"></span></span></div>`,
  });
  await page.close();
  copyFileSync(pdf, join(downloads, `${tz.file}.pdf`));
  copyFileSync(pdf, join(here, '..', 'pdf', `${tz.file}.pdf`));
  console.log('готово:', `out/${tz.file}.pdf`);
}
await browser.close();
