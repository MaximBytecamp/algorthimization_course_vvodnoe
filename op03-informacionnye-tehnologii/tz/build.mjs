// Сборка ТЗ в PDF: node build.mjs [номер ...]. Без аргументов собирает все файлы из data/.
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { render } from './lib/render.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.env.HOME, 'python_presentations/tools/'));
const { chromium } = require('playwright');

const only = process.argv.slice(2);
const files = readdirSync(join(here, 'data')).filter(f => f.endsWith('.mjs'))
  .filter(f => !only.length || only.some(n => f.startsWith(`tz-${n.padStart(2, '0')}`)));

mkdirSync(join(here, 'out'), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const f of files) {
  const tz = (await import(pathToFileURL(join(here, 'data', f)))).default;
  const html = render(tz);
  const htmlPath = join(here, 'out', `${tz.file}.html`);
  writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: join(here, 'out', `${tz.file}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:7pt 'PT Sans',Arial;white-space:nowrap;color:#8a93a2;padding:0 15mm 0 18mm;display:flex;justify-content:space-between">
      <span>ТЗ № ${tz.code} · ${tz.company.short}</span>
      <span>Кейс ОП.03 · организация, реквизиты, печать и подписи вымышлены</span>
      <span>стр. <span class="pageNumber"></span> из <span class="totalPages"></span></span></div>`,
  });
  await page.close();
  console.log('готово:', `out/${tz.file}.pdf`);
}
await browser.close();
