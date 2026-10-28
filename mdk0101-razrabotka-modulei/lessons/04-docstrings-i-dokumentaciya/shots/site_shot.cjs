// Снимок страницы собранного сайта Sphinx для глав 4.12–4.16.
//   node site_shot.cjs out.png page.html [ширина высота [селектор]]
// Плотность 2, светлая схема: так же сняты кадры pkgsite в главе 4.6.
const { chromium } = require('playwright');

(async () => {
  const [out, page, w = '1240', h = '780', sel = ''] = process.argv.slice(2);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, colorScheme: 'light' });
  await p.goto(page.startsWith('http') ? page : 'file://' + page);
  await p.waitForTimeout(700);
  if (sel) await (await p.$(sel)).screenshot({ path: out });
  else await p.screenshot({ path: out });
  await browser.close();
})();
