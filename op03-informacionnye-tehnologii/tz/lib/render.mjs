// Сборка HTML технического задания из файла данных компании.
import { seal, stamp, signature, flow, wireframe } from './graphics.mjs';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = s => `<code>${esc(s)}</code>`;
const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const olist = items => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
const table = (head, rows, cls = '') => `<table class="${cls}${rows.length <= 8 ? ' keep' : ''}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const blank = '<span class="blank"></span>';

export function render(tz) {
  tz = normalize(tz);
  const c = tz.company;
  const ink = '#2b3c9e';
  const sealSvg = (rot = -9, size = 168) => seal({
    outer: `${c.short.toUpperCase()} • ИНН ${c.inn.replace(/ /g, '')} • `,
    inner: c.sealInner, center: c.sealCenter, logo: c.logo.replace(/currentColor/g, ink), ink, rotate: rot, size,
  });
  const dirSign = (w = 150) => signature(c.director.sign, { width: w });
  const conSign = (w = 130) => signature(c.contact.sign, { width: w, rotate: 2 });
  const logo = (size = 44) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" style="color:${tz.accent}">${c.logo}</svg>`;
  const autoCount = tz.events.filter(e => e.type === 'auto').length;
  const required = tz.events.filter(e => !e.optional).length;
  const keyEvents = tz.events.filter(e => e.key).map(e => code(e.name));
  const pageFiles = tz.pages.map(p => p.file);
  const ig = tz.instagram;
  const utmByRow = Object.fromEntries(tz.utm.map(r => [r[0], r]));
  const utmUrl = (row, host = '<адрес-сайта>.vercel.app') => {
    const [, , , s, m, camp, content, page] = row;
    const [path, hash] = (page || 'index.html').split('#');
    return `https://${host}/${path}?utm_source=${s}&utm_medium=${m}&utm_campaign=${camp}&utm_content=${content}${hash ? '#' + hash : ''}`;
  };

  const letterhead = `<header class="letterhead">
    <div class="lh-brand">${logo(46)}<div><div class="lh-name">${esc(c.brand)}</div><div class="lh-tag">${esc(c.tagline)}</div></div></div>
    <div class="lh-req">${esc(c.full)}<br>${esc(c.address)}<br>ИНН ${esc(c.inn)}${c.kpp && c.kpp !== '—' ? ' · КПП ' + esc(c.kpp) : ''} · ${c.ogrn.startsWith('ОГРН') ? esc(c.ogrn) : 'ОГРН ' + esc(c.ogrn)}<br>${esc(c.phone)} · ${esc(c.email)}</div>
  </header>`;

  // ——— Титульный лист ———
  const cover = `<section class="page cover">
    ${letterhead}
    <div class="cover-top">
      <div class="outno">${esc(tz.outNo)}<br>от ${esc(tz.issued)}</div>
      <div class="approve">
        <div class="approve-h">УТВЕРЖДАЮ</div>
        <div>${esc(c.director.post)}<br>${esc(c.short)}</div>
        <div class="sign-line"><span class="sig-wrap">${dirSign()}</span><span class="line"></span> ${esc(c.director.short)}</div>
        <div>«${tz.issued.slice(0, 2)}» ${month(tz.issued)} ${tz.issued.slice(6)} г.</div>
        <div class="seal-wrap">${sealSvg(-11)}</div>
      </div>
    </div>
    <div class="cover-title">
      <div class="kind">Техническое задание</div>
      <div class="num">№ ${esc(tz.code)}</div>
      <h1>${esc(tz.title)}</h1>
      <p class="sub">${esc(tz.subtitle)}</p>
    </div>
    ${table(['Параметр', 'Значение'], [
      ['Заказчик', `${esc(c.full)}`],
      ['Исполнитель', `студент ${blank}<br><span class="hint">фамилия, имя, группа</span>`],
      ['Руководитель проекта со стороны Заказчика', `${esc(c.contact.post)} ${esc(c.contact.name)}, ${esc(c.contact.email)}, Telegram ${esc(c.contact.tg)}`],
      ['Основание', 'Практическая работа по дисциплине ОП.03 «Информационные технологии»'],
      ['Дата выдачи', `${blank}`],
      ['Срок выполнения', '21 календарный день с даты выдачи; промежуточные этапы — в разделе 10'],
      ['Версия документа', '1.0'],
    ], 'passport')}
    <h3>Содержание</h3>
    <ul class="toc">${[['', 'Обращение Заказчика'], ['1', 'Цели проекта'], ['2', 'Сведения о компании'], ['3', 'Требования к сайту'], ['4', 'Веб-аналитика GA4'], ['5', 'UTM-разметка и соцсети'], ['6', 'Приём заявок'], ['7', 'Автоответы в Instagram'], ['8', 'Отчётность'], ['9', 'CRM HubSpot'], ['10', 'Этапы и сроки'], ['11', 'Порядок приёмки'], ['12', 'Что сдаётся'], ['13', 'Оценка'], ['А', 'Схемы страниц'], ['Б', 'Лист согласования'], ['В', 'Акт сдачи-приёмки']].map(([n, t]) => `<li><b>${n}</b>${t}</li>`).join('')}</ul>

  </section>`;

  // ——— Письмо руководителя ———
  const letter = `<section class="page letter">
    ${letterhead}
    <div class="letter-to">Исполнителю по техническому заданию № ${esc(tz.code)}</div>
    <h2 class="plain">О задачах проекта</h2>
    ${tz.letter.map(p => `<p>${esc(p)}</p>`).join('')}
    <div class="facts">${tz.facts.map(f => `<div><b>${esc(f.n)}</b><span>${esc(f.t)}</span></div>`).join('')}</div>
    <div class="letter-sign">
      <div>${esc(c.director.post)}<br>${esc(c.short)}</div>
      <div class="sig-wrap big">${dirSign(170)}<div class="seal-wrap">${sealSvg(7, 150)}</div></div>
      <div>${esc(c.director.short)}</div>
    </div>
  </section>`;

  // ——— 1–2. Цели и сведения о компании ———
  const s1 = `<section class="page">
    <h2>1. Цели проекта</h2>
    <p class="note top">Термины «должен», «обязательно» обозначают требования, которые проверяются при приёмке. Требование, помеченное «по выбору», выполняется по решению Исполнителя и даёт дополнительные баллы.</p>
    ${olist(tz.goals.map(esc))}
    <h3>Схема результата</h3>
    <p>Схема показывает путь посетителя и данных после выполнения задания. Номер у каждого блока — раздел задания, в котором он описан.</p>
    ${flow({
      width: 680, height: 250, nodes: [
        { id: 'soc', x: 4, y: 20, label: 'Соцсети и QR', sub: 'ссылки с UTM · разд. 5' },
        { id: 'ig', x: 4, y: 110, label: 'Instagram', sub: 'ManyChat · разд. 7', fill: '#fdf1f6', stroke: '#e3a1c0' },
        { id: 'site', x: 190, y: 64, label: 'Сайт на Vercel', sub: `${tz.pages.length} страниц · разд. 3`, fill: tz.accentSoft, stroke: tz.accent },
        { id: 'ga', x: 370, y: 14, label: 'Google Analytics 4', sub: `${required} событий · разд. 4`, fill: '#fff6e0', stroke: '#e5bd59' },
        { id: 'sh', x: 370, y: 114, label: 'Google Таблица', sub: 'заявки · разд. 6', fill: '#e7f5ea', stroke: '#86c497' },
        { id: 'ds', x: 556, y: 64, label: 'Data Studio', sub: 'отчёт · разд. 8', fill: '#eaf0fd', stroke: '#8ba7e8' },
        { id: 'crm', x: 556, y: 180, label: 'HubSpot CRM', sub: 'сделки · разд. 9', fill: '#fff0ea', stroke: '#f0a184' },
      ], links: [['soc', 'site', 'переход'], ['ig', 'site', 'кнопка в DM'], ['site', 'ga', 'события'], ['site', 'sh', 'заявка'],
        ['ga', 'ds'], ['sh', 'ds'], ['sh', 'crm', 'импорт']],
    })}
    <h2>2. Сведения о компании для наполнения сайта</h2>
    <p>Тексты сайта составляются только по этим сведениям. Цены, адреса, режим работы и названия услуг, которых здесь нет, на сайте не публикуются.</p>
    ${table(['Раздел', 'Сведения'], tz.about.map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)]), 'about')}
    <p class="hint">Адрес, телефон и e-mail компании — в шапке этого документа. Домен ${code(c.site)} не используется: сайт публикуется по адресу Vercel.</p>

    <h2>3. Требования к сайту</h2>
    <h3>3.1. Создание сайта с помощью нейросети</h3>
    ${list([
      'Исполнитель выбирает инструмент сам: v0, Lovable, Bolt.new, Cursor, Claude, ChatGPT, DeepSeek, GigaChat, YandexGPT или другой. Инструмент и версия указываются в <code>docs/prompts.md</code>.',
      'Результат — статические файлы HTML, CSS и JavaScript, которые открываются в браузере без сборки. Сайты на React, Next.js и других фреймворках со сборкой не принимаются: если инструмент выдал такой проект, Исполнитель просит переписать его на обычный HTML.',
      'Все запросы к нейросети сохраняются в <code>docs/prompts.md</code> в порядке отправки: номер, текст запроса, что получилось, что пришлось исправить вручную. Минимум — запрос на структуру сайта, отдельный запрос на каждую страницу и запросы на исправления.',
      'Тексты интерфейса — на русском языке. Заглушки вида «Lorem ipsum», «Заголовок», «Ваш текст» не допускаются.',
      'При приёмке Заказчик выбирает любой фрагмент JavaScript из <code>js/</code>, и Исполнитель объясняет, что делает каждая строка этого фрагмента.',
    ])}
  </section>`;

  // ——— 3.2–3.4. Страницы ———
  const pagesRows = tz.pages.map(p => [code(p.file), `<b>${esc(p.name)}</b><br>${esc(p.purpose)}`,
    p.blocks.map(b => esc(b.name)).join('; '),
    [...new Set(p.blocks.filter(b => b.event).map(b => b.event))].map(code).join(' ') || '—']);
  const s3 = `<section class="page">
    <h3>3.2. Состав страниц</h3>
    <p>Сайт состоит из ${tz.pages.length} страниц и страницы <code>404.html</code>. Схемы страниц с расположением блоков — в Приложении А. Порядок блоков на странице обязателен, оформление выбирает Исполнитель.</p>
    ${table(['Файл', 'Страница и назначение', 'Обязательные блоки', 'События'], pagesRows, 'pages')}
    <h3>3.3. Общие требования</h3>
    ${list([
      'Единые шапка и подвал на всех страницах. В меню выделен пункт текущей страницы.',
      'Страницы корректно отображаются при ширине окна 375, 768 и 1280 пикселей: без горизонтальной прокрутки, текст не выходит за края, кнопки нажимаются пальцем (не менее 44 × 44 px).',
      'У каждой страницы свой <code>&lt;title&gt;</code>, <code>&lt;meta name="description"&gt;</code> и теги Open Graph: <code>og:title</code>, <code>og:description</code>, <code>og:image</code> (картинка 1200 × 630). По ним соцсети строят превью ссылки. Подключён значок сайта (favicon).',
      'Изображения в формате WebP или JPEG, каждое не больше 300 КБ, у каждого заполнен атрибут <code>alt</code>.',
      'Отчёт Lighthouse для главной страницы в мобильном режиме: Performance не ниже 70, Accessibility не ниже 90, SEO не ниже 90.',
      'Форма содержит флажок согласия на обработку персональных данных со ссылкой на <code>privacy.html</code>. Флажок по умолчанию не отмечен, без него форма не отправляется.',
      ...tz.extra.map(esc),
    ])}
    <h3>3.4. Публикация</h3>
    ${list([
      'Код хранится в публичном репозитории GitHub Исполнителя с именем <code>' + tz.file.toLowerCase().replace(/_/g, '-') + '</code>. В репозитории не меньше 10 коммитов с понятными сообщениями; первый коммит — исходный результат нейросети без правок.',
      'Сайт опубликован на Vercel и обновляется автоматически после каждого push в ветку <code>main</code>. Адрес вида <code>&lt;имя&gt;.vercel.app</code> указывается в <code>README.md</code>.',
    ])}
  </section>`;

  // ——— 4. GA4 ———
  const typeName = { auto: 'авто', rec: 'рекоменд.', custom: 'своё' };
  const evRows = tz.events.map((e, i) => [i + 1, code(e.name) + (e.optional ? '<br><span class="tag">по выбору</span>' : '') + (e.key ? '<br><span class="tag key">ключевое</span>' : ''),
    typeName[e.type], esc(e.when), e.params.split(', ').map(code).join(' ')]);
  const s4 = `<section class="page">
    <h2>4. Веб-аналитика Google Analytics 4</h2>
    <h3>4.1. Ресурс и поток</h3>
    ${list([
      `Создан отдельный ресурс GA4 с названием «${esc(c.brand)} — сайт», часовой пояс (GMT+03:00) Москва, валюта — российский рубль.`,
      'Создан веб-поток с адресом сайта на Vercel. В настройках потока включена расширенная статистика (Enhanced measurement), включая взаимодействия с формами.',
      'Тег Google (gtag.js) с идентификатором <code>G-…</code> этого ресурса установлен в <code>&lt;head&gt;</code> каждой страницы, включая <code>404.html</code>.',
    ])}
    <h3>4.2. Перечень событий</h3>
    <p>Сайт отправляет ${tz.events.length} событий: ${autoCount} собирает расширенная статистика без кода, остальные Исполнитель программирует сам. Обязательны ${required} событий; события с пометкой «по выбору» дают дополнительные баллы.</p>
    ${table(['№', 'Событие', 'Тип', 'Когда отправляется', 'Параметры'], evRows, 'events')}
  </section>
  <section class="page">
    <h3>4.3. Правила программирования событий</h3>
    ${list([
      'Все вызовы <code>gtag(\'event\', …)</code> находятся в одном файле <code>js/analytics.js</code>, который подключён на всех страницах. В разметке кнопки описываются атрибутами, например <code>data-event="cta_click" data-button-name="hero_trial"</code>, а <code>analytics.js</code> находит такие элементы и отправляет событие.',
      'Имена событий и параметров — латиница в нижнем регистре со знаком подчёркивания (snake_case), не длиннее 40 символов. Значения параметров — не длиннее 100 символов.',
      'В GA4 не передаются имя, телефон и e-mail посетителя — ни в параметрах, ни в адресе страницы. Это запрещено правилами Google Analytics.',
      'Событие <code>generate_lead</code> отправляется только после того, как приёмник заявок (раздел 6) ответил <code>{"ok": true}</code>. При ошибке приёмника отправляется <code>form_error</code> с <code>error_type = "server"</code>.',
      'В <code>docs/events.md</code> Исполнитель ведёт таблицу событий: имя, где отправляется (файл и строка), параметры с примерами значений.',
    ])}
    <h3>4.4. Пользовательские параметры</h3>
    <p>Чтобы значения параметров были видны в отчётах, их регистрируют в разделе Admin → Custom definitions как параметры уровня события (Event scope). Обязательны следующие ${tz.dims.length}:</p>
    ${table(['Параметр', 'Событие', 'Какой вопрос отчёта закрывает'], tz.dims.map(([a, b, d]) => [code(a), b.split(', ').map(code).join(' '), esc(d)]))}
    <h3>4.5. Ключевые события</h3>
    <p>Ключевыми событиями (Key events) отмечены: ${keyEvents.join(', ')}. Других ключевых событий в ресурсе нет.</p>
    <h3>4.6. Проверка</h3>
    <p>Каждое событие из таблицы 4.2 проверено в DebugView: снимок экрана с событием и раскрытыми параметрами сохраняется в <code>screens/ga4/</code> под именем события, например <code>${tz.events[8].name}.png</code>. Режим отладки включается расширением Google Analytics Debugger или параметром <code>debug_mode: true</code> в <code>gtag(\'config\', …)</code>; перед сдачей отладочный режим в коде отключается.</p>
  </section>`;

  // ——— 5. UTM ———
  const utmRows = tz.utm.map(r => r.map((v, i) => i < 3 ? esc(v) : (v ? code(v) : '<span class="fill">заполнить</span>')));
  const s5 = `<section class="page">
    <h2>5. UTM-разметка и размещение ссылок в социальных сетях</h2>
    <p>Все ссылки на сайт в соцсетях, у партнёров и на афише размечаются UTM-метками — ${esc(tz.campaignNote)}. Без меток переходы из приложений соцсетей попадают в GA4 как прямые заходы (Direct), и источник заявки теряется.</p>
    <h3>5.1. Правила написания меток</h3>
    ${olist([
      'Только строчные латинские буквы, цифры и знак подчёркивания. Пробелы, дефисы и кириллица не используются.',
      `<code>utm_medium</code> — из списка: ${['social', 'affiliate', 'qr', 'email', 'cpc', 'referral'].map(code).join(', ')}.`,
      `<code>utm_campaign</code> содержит повод и период: ${code(tz.campaign)}.`,
      '<code>utm_content</code> различает размещения внутри одного источника: <code>post_01</code>, <code>stories_01</code>, <code>reel_01</code>.',
      'Метки стоят после <code>?</code> и до <code>#</code>, если в адресе есть якорь.',
      'Ссылка сначала вносится в реестр, затем публикуется. Ссылки по памяти и копии чужих ссылок не публикуются.',
    ])}
    <h3>5.2. Реестр ссылок</h3>
    <p>Ячейки «заполнить» Исполнитель заполняет сам по правилам 5.1. Для блогеров <code>utm_source</code> — ник партнёра латиницей, <code>utm_content</code> — формат размещения. Пустая страница назначения — Исполнитель выбирает её сам и объясняет выбор в реестре.</p>
    ${table(['№', 'Канал', 'Размещение', 'source', 'medium', 'campaign', 'content', 'Страница'], utmRows, 'utm')}
    <p class="hint">Пример готовой ссылки для строки ${ig.utmRow}:<br><code class="url">${esc(utmUrl(utmByRow[ig.utmRow]))}</code></p>
  </section>
  <section class="page">
    <h3>5.3. Ведение реестра</h3>
    ${list([
      'Реестр ведётся в Google Таблице на листе <code>utm</code> и выгружается в репозиторий как <code>docs/utm.csv</code>. Столбцы: номер, канал, размещение, пять меток, страница, полная ссылка, короткая ссылка, адрес публикации, дата публикации.',
      'Полная ссылка собирается формулой из столбцов меток (например, <code>=СЦЕПИТЬ(…)</code>). Вручную ссылки не набираются.',
      'Для ВКонтакте и Telegram дополнительно создаются короткие ссылки (<code>vk.cc</code> или <code>clck.ru</code>). После перехода по короткой ссылке в адресной строке сохраняются все пять меток — это проверяется и фиксируется снимком.',
      'Для строки с QR-кодом создаётся QR-код полной ссылки в формате PNG (<code>docs/qr-' + tz.utm.find(r => r[4] === 'qr')?.[0].toLowerCase() + '.png</code>) и афиша формата A4 с этим кодом (<code>docs/afisha.pdf</code>).',
    ])}
    <h3>5.4. Размещение</h3>
    ${list([
      'Ссылки размещаются в настоящих публикациях не менее чем в четырёх соцсетях: Instagram, ВКонтакте, Telegram и YouTube. Если в одной из них нет возможности публиковаться, её заменяет Дзен, TikTok или Pinterest — замена указывается в реестре.',
      'Для проекта создаются отдельные страницы, сообщество и канал от имени компании. Личные страницы Исполнителя для публикаций не используются.',
      'Роль блогеров-партнёров выполняют двое других студентов группы: каждый публикует ссылку Исполнителя у себя (сторис, пост или сообщение в канале) и переходит по ней. Их ники указываются в <code>utm_source</code>.',
    ])}
    <h3>5.5. Отработка ссылок</h3>
    <p>Каждая ссылка реестра проверяется переходом из самой публикации: нажатием на ссылку в приложении или на сайте соцсети. Вставка ссылки в адресную строку проверкой не считается. Порядок проверки одной ссылки:</p>
    ${olist([
      'Открыть публикацию с другого устройства или в окне инкогнито и нажать на ссылку.',
      'Убедиться, что в адресной строке сайта есть все метки строки реестра, и сделать снимок.',
      'Найти визит в GA4 Realtime: карточка с источником (<code>First user source</code> или <code>Session source</code>) показывает значение <code>utm_source</code>.',
      `Для строк ${tz.utm.filter((r, i, a) => a.findIndex(x => x[1] === r[1]) === i).map(r => r[0]).join(', ')} дополнительно отправить заявку с именем «Тест ${tz.utm[0][0].slice(0, 2)}-номер», например «Тест U-05». В таблице заявок у этой строки метки совпадают с реестром.`,
    ])}
    <p>Через 24–48 часов после проверок в отчёте Reports → Acquisition → Traffic acquisition при группировке по <code>Session source / medium</code> видно не меньше шести разных пар источника и канала из реестра. Снимок отчёта — <code>screens/utm/traffic-acquisition.png</code>.</p>
  </section>`;

  // ——— 6. Заявки ———
  const s6 = `<section class="page">
    <h2>6. Приём заявок: форма, Apps Script и Google Таблица</h2>
    <h3>6.1. Таблица заявок</h3>
    <p>Google Таблица называется «${esc(tz.sheetName)}», лист с заявками — <code>leads</code>. Одна строка — одна заявка. Первая строка — заголовки в указанном порядке:</p>
    ${table(['Столбец', 'Тип', 'Откуда значение', 'Обязательно'], tz.columns.map(([a, b, d, e]) => [code(a), esc(b), esc(d), esc(e)]), 'cols')}
    ${list([
      `Столбец <code>status</code> заполняется из выпадающего списка: ${tz.statuses.map(s => code(s[0])).join(', ')}. Ввод другого значения отклоняется проверкой данных.`,
      'Пустые обязательные ячейки и повторяющиеся <code>request_id</code> подсвечиваются условным форматированием.',
      'Доступ на просмотр открыт по ссылке для e-mail Заказчика, указанного при выдаче задания.',
    ])}
    <h3>6.2. Приёмник заявок</h3>
    ${list([
      'Веб-приложение Apps Script с функцией <code>doPost(e)</code> принимает данные формы и дописывает строку в лист <code>leads</code>. За основу берётся приёмник из темы 7 курса.',
      'Приёмник сам проверяет обязательные поля, формат телефона и e-mail, допустимые значения списков и длину строк (не более 200 символов). При ошибке возвращает <code>{"ok": false, "error": "…"}</code> и строку не записывает.',
      'Повторная отправка с тем же <code>request_id</code> не создаёт вторую строку.',
      '<code>created_at</code> и <code>status = new</code> ставит приёмник. Значение <code>status</code>, присланное из браузера, игнорируется.',
      'Код приёмника хранится в репозитории: <code>apps-script/Code.gs</code>. Идентификатор таблицы в коде допускается, пароли и ключи — нет.',
    ])}
    <h3>6.3. Форма на сайте</h3>
    ${list([
      'Поля пользователя: ' + tz.columns.filter(r => r[4] === 'form').map(r => code(r[0])).join(', ') + ', флажок согласия.',
      'Скрытые поля <code>request_id</code>, <code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code>, <code>utm_content</code> заполняет JavaScript: метки читаются из адреса страницы и сохраняются в <code>sessionStorage</code>, чтобы не потеряться при переходе посетителя по страницам сайта до отправки формы.',
      'Форма отправляется без перезагрузки страницы (<code>fetch</code>). Во время отправки кнопка неактивна. После ответа <code>ok: true</code> посетитель попадает на <code>thanks.html</code>, где показан номер его заявки.',
      'При ошибке поле подсвечивается, под ним выводится понятный текст ошибки, отправляется событие <code>form_error</code>.',
    ])}
    <h3>6.4. Подготовка данных для CRM</h3>
    <p>На отдельном листе <code>crm_import</code> формулами (<code>ARRAYFORMULA</code>, <code>SPLIT</code>, <code>СЖПРОБЕЛЫ</code>, <code>ВПР</code>) из листа <code>leads</code> строится таблица для импорта в CRM: имя разделено на <code>first_name</code> и <code>last_name</code>, телефон приведён к виду <code>+7XXXXXXXXXX</code>, <code>status</code> заменён на название стадии сделки по таблице 9.1, добавлен столбец <code>deal_name</code> по шаблону «${esc(tz.crm.dealName)}». Лист выгружается в CSV.</p>
  </section>`;

  // ——— 7. Instagram ———
  const u = utmByRow[ig.utmRow], ub = utmByRow[ig.branch.utmRow];
  const phone = `<div class="phone">
    <div class="ph-top">${esc(c.ig)}</div>
    <div class="ph-post"><div class="ph-reel">▶ Reel № 1</div></div>
    <div class="ph-com"><b>student_test</b> ${esc(ig.keyword)}</div>
    <div class="ph-com reply"><b>${esc(c.ig)}</b> ${esc(ig.replies[0])}</div>
    <div class="ph-sep">Direct</div>
    <div class="bubble">${esc(ig.dm)}</div>
    <div class="bubble btn">${esc(ig.button)}</div>
    <div class="ph-url">${esc(u[7])}?utm_source=${u[3]}&amp;utm_medium=${u[4]}&amp;utm_campaign=${u[5]}&amp;utm_content=${u[6]}</div>
  </div>`;
  const s7 = `<section class="page">
    <h2>7. Автоответы в Instagram через ManyChat</h2>
    <div class="two">
      <div>
        <p>Под ${esc(ig.reel)} пользователь пишет комментарий с ключевым словом. ManyChat отвечает в комментариях и отправляет в Direct сообщение с кнопкой. Кнопка ведёт на сайт по ссылке ${ig.utmRow} из реестра.</p>
        ${table(['Параметр', 'Значение'], [
          ['Аккаунт', 'Профессиональный аккаунт Instagram (Автор или Бизнес), созданный для проекта'],
          ['Автоматизация', code(ig.automation)],
          ['Триггер', `Комментарий к конкретному Reel (Specific Post or Reel), ключевое слово ${code(ig.keyword)}`],
          ['Ответ в комментарии', ig.replies.map(r => '«' + esc(r) + '»').join('<br>') + '<br><span class="hint">три варианта, ManyChat выбирает случайный</span>'],
          ['Сообщение в Direct', `«${esc(ig.dm)}»`],
          ['Кнопка', `«${esc(ig.button)}» → ссылка ${ig.utmRow}`],
        ])}
      </div>
      ${phone}
    </div>
    <h3>7.1. Вторая ветка</h3>
    <p>В той же автоматизации или во второй автоматизации к тому же Reel ключевое слово ${code(ig.branch.keyword)} отправляет другое сообщение: «${esc(ig.branch.dm)}» с кнопкой «${esc(ig.branch.button)}» и ссылкой ${ig.branch.utmRow} (<code>utm_campaign=${ub[5]}</code>, <code>utm_content=${ub[6]}</code>).</p>
    <h3>7.2. Проверка</h3>
    ${olist([
      'Автоматизация переведена в режим Live.',
      'Со второго аккаунта Instagram оставлен комментарий с каждым ключевым словом. Получены ответ в комментариях и сообщение в Direct (на тестовом аккаунте оно может прийти в папку «Запросы»).',
      'Нажата кнопка в сообщении. В адресе открывшейся страницы есть все метки строки реестра.',
      'С этой страницы отправлена заявка. В таблице заявок у неё <code>utm_source=instagram</code> и <code>utm_content</code> из реестра; в GA4 Realtime видно событие <code>generate_lead</code>.',
    ])}
    <p>Снимки каждого шага сохраняются в <code>screens/instagram/</code>. Если сообщение не приходит, проверяются по порядку: ключевое слово, выбранный Reel, статус Live, подключение Instagram в ManyChat. Частые повторные комментарии с одного аккаунта Instagram может ограничить — между проверками выдерживается пауза не меньше 2 минут.</p>
  </section>`;

  // ——— 8. Отчётность ———
  const interest = tz.events[8].name;
  const ownEvents = tz.events.filter(e => e.type !== 'auto').slice(0, 5).map(e => code(e.name)).join(', ');
  const s8 = `<section class="page">
    <h2>8. Отчётность</h2>
    <p>Отчёты строятся после того, как в ресурсе накопились данные проверок разделов 5–7, то есть не раньше чем через 24–48 часов после них. Период во всех отчётах — от первой проверки до дня сдачи (Custom). Каждый отчёт сохраняется снимком в <code>screens/reports/</code> или <code>screens/explore/</code> под именем из таблицы.</p>
    <h3>8.1. Стандартные отчёты (Reports)</h3>
    ${table(['Отчёт', 'Настройка', 'Снимок'], [
      ['Reports snapshot', 'Период проверок и сравнение с предыдущим периодом (Compare → Preceding period)', '<code>snapshot.png</code>'],
      ['User acquisition', 'Группировка <code>First user source / medium</code>', '<code>user-acquisition.png</code>'],
      ['Traffic acquisition', 'Группировка <code>Session source / medium</code>, дополнительный параметр (Secondary dimension) <code>Session campaign</code>; второй снимок — с дополнительным параметром <code>Session manual ad content</code>', '<code>traffic-campaign.png</code>, <code>traffic-content.png</code>'],
      ['Landing page', 'Engagement → Landing page, дополнительный параметр <code>Session source</code>', '<code>landing-source.png</code>'],
      ['Pages and screens', 'Столбцы Views, Active users, Average engagement time', '<code>pages.png</code>'],
      ['Events', `Event count и Total users для ${ownEvents}`, '<code>events.png</code>'],
      ['Key events', 'Отчёт по ключевым событиям с разбивкой по <code>Session source / medium</code>', '<code>key-events.png</code>'],
      ['Tech', 'Tech details, группировка <code>Device category</code>', '<code>tech.png</code>'],
    ], 'reps')}
    ${list([
      'В отчёте Traffic acquisition созданы два сравнения (Comparisons): <code>Session source exactly matches instagram</code> и <code>Session source exactly matches (direct)</code>. Снимок отчёта с обоими сравнениями — <code>comparison.png</code>.',
      'Отчёт Traffic acquisition выгружен через Share this report → Download file в CSV: <code>docs/reports/traffic-acquisition.csv</code>.',
      `В разделе Library создана коллекция «${esc(c.brand)}» с собственным отчётом «Кампания ${esc(tz.campaign)}»: параметры <code>Session source / medium</code>, <code>Session campaign</code>, <code>Session manual ad content</code>; показатели Sessions, Engagement rate, Key events. Коллекция опубликована и видна в левом меню Reports. Снимок — <code>library.png</code>.`,
    ])}
    <h3>8.2. Исследования (Explore)</h3>
    <p>Названия исследований начинаются с «${esc(c.brand)} ·». В исследованиях созданы два сегмента сеансов: «Instagram Sessions» (<code>Session source = instagram</code>) и «Direct Sessions» (<code>Session source = (direct)</code>).</p>
    ${table(['Исследование', 'Настройка', 'На какой вопрос отвечает'], [
      ['Свободная форма', 'Строки: <code>Session source / medium</code>, <code>Session campaign</code>, <code>Session manual ad content</code>. Значения: Sessions, Engaged sessions, Key events. Фильтр: кампания ' + code(tz.campaign) + '. Вторая вкладка — те же строки с двумя сегментами рядом', 'Какие размещения приводят посетителей и заявки; чем Instagram отличается от прямых заходов'],
      ['Воронка', `5 шагов: <code>page_view</code> → <code>${interest}</code> → <code>cta_click</code> → <code>form_start</code> → <code>generate_lead</code>. Сначала открытая воронка (Open), затем копия вкладки с закрытой (Closed). Разбивка (Breakdown) по <code>Session source</code>, третья вкладка — по <code>Device category</code>. Сегменты Instagram и Direct применены к воронке`, 'На каком шаге и из какого источника теряются посетители; меняется ли картина на телефоне'],
      ['Воронка со временем', 'Копия воронки, у шага <code>form_start</code> ограничение «в течение 10 минут» после <code>cta_click</code> (Time constraint)', 'Сколько посетителей начинают заполнять форму сразу после кнопки'],
      ['Путь', `Начальная точка — страница <code>${esc(u[7])}</code>, следующие 3 шага по <code>Page title</code>, один узел раскрыт`, 'Куда переходят посетители из Instagram после первой страницы'],
      ['Обратный путь', 'Конечная точка (Ending point) — событие <code>generate_lead</code>, 3 предыдущих шага по <code>Event name</code>', 'Что посетители делали перед заявкой'],
    ])}
    <p>Для каждого исследования сохраняется снимок с видимым значком качества данных (Data quality indicator) в правом верхнем углу. Таблица свободной формы выгружена в CSV: <code>docs/reports/free-form.csv</code>.</p>
    <h3>8.3. Атрибуция и автоматические подсказки</h3>
    ${list([
      'Advertising → Attribution paths для ключевого события <code>generate_lead</code>: снимок цепочек источников перед заявкой — <code>attribution-paths.png</code>.',
      'Admin → Attribution settings: модель атрибуции ресурса и окно атрибуции записываются в аналитическую записку.',
      'Создано собственное оповещение (Custom insight): ежедневная проверка, сегмент <code>Session source = instagram</code>, условие «Sessions уменьшились больше чем на 50 %», уведомление на e-mail Исполнителя. Снимок настроек — <code>custom-insight.png</code>.',
    ])}
    <h3>8.4. Отчёт в Data Studio</h3>
    <p>Отчёт «${esc(c.brand)} — ${esc(tz.campaign)}» из трёх страниц. На каждой странице есть элемент выбора периода (Date range control), и он меняет все элементы страницы.</p>
    ${table(['Страница', 'Источник данных', 'Состав'], [
      ['Трафик', 'GA4', 'Карточки Sessions, Active users, Key events; график Sessions по дням; таблица источников с Engagement rate; фильтры по Session source и Session campaign'],
      ['Заявки', 'Google Таблица, лист <code>leads</code>', `Карточки «Всего заявок», «Новые», «${esc(tz.won[1])}» (вычисляемые поля); столбчатая диаграмма по статусам; заявки по источникам и по дням; фильтр по статусу`],
      ['Кампании', 'Объединение (Blend) GA4 и таблицы', `Ключи объединения: source и campaign. Таблица: Sessions, generate_lead из GA4, заявки из таблицы, заявки в статусе <code>${tz.won[0]}</code>; вычисляемое поле «Конверсия в заявку, %»`],
    ])}
    <p>Доступ к отчёту — «Просмотр» для e-mail Заказчика. Имена, телефоны и e-mail посетителей на страницах отчёта не выводятся.</p>
    <h3>8.5. Аналитическая записка</h3>
    <p>Файл <code>docs/report.md</code> заполняется по шаблону в порядке шагов анализа. Все числа берутся из отчётов 8.1–8.4 за период проверок. Вывод описывает, где и у кого теряются посетители; гипотеза — возможную причину, которую можно проверить изменением на сайте.</p>
    <pre class="tpl">Период: ___ — ___
1. Traffic acquisition: сеансов всего ___, из Instagram ___, по кампании ${esc(tz.campaign)} ___
   Чем User acquisition отличается от Traffic acquisition на моих данных: ___
2. Landing page: главная страница входа из Instagram — ___ (___ сеансов)
3. Events: ${interest} ___ раз / ___ пользователей; cta_click ___; form_start ___; generate_lead ___
4. Свободная форма: размещение (utm_content) с наибольшим числом ключевых событий — ___
   Instagram и Direct: Engagement rate ___ % и ___ %
5. Воронка (открытая): наибольшая потеря между ___ и ___ (теряется ___ %)
   В закрытой воронке на последнем шаге ___, в открытой ___. Причина разницы: ___
6. Разбивка: на телефоне доля дошедших до заявки ___ %, на компьютере ___ %
7. Путь: после ${esc(u[7])} чаще всего открывают ___
8. Обратный путь: перед generate_lead чаще всего было событие ___
Атрибуция: модель ___, окно ___ дней; самая частая цепочка ___
Заявок в таблице ___, generate_lead в GA4 ___. Причина расхождения: ___
Вывод: ___
Гипотеза и как её проверить: ___</pre>
  </section>`;

  // ——— 9. CRM ———
  const s9 = `<section class="page">
    <h2>9. CRM HubSpot</h2>
    <p>В бесплатной версии HubSpot CRM заявки ведутся как связка «Контакт — Сделка»: контакт описывает человека, сделка — конкретное обращение с источником и стадией.</p>
    <h3>9.1. Воронка сделок</h3>
    <p>Воронка (Pipeline) по умолчанию переименована в «${esc(tz.crm.pipeline)}». Стадии соответствуют статусам таблицы заявок:</p>
    ${table(['status в таблице', 'Стадия сделки', 'Название стадии в HubSpot'], tz.statuses.map(([a, b, d]) => [code(a), esc(b), esc(d)]))}
    <h3>9.2. Свойства и импорт</h3>
    ${list([
      'Для сделок созданы свойства: ' + tz.crm.props.map(p => `«${esc(p)}»`).join(', ') + '. Свойство «' + esc(tz.crm.props[1]) + '» — выпадающий список с теми же значениями, что в таблице.',
      'CSV с листа <code>crm_import</code> загружен одним файлом через Import → Advanced, объекты Contacts и Deals со связью между ними. Контакт определяется по e-mail или телефону.',
      'После импорта у каждой сделки заполнены Request ID и метки UTM, у каждого контакта есть связанная сделка.',
    ])}
    <h3>9.3. Работа со сделками</h3>
    ${list([
      `Одна сделка проведена по всем стадиям до «${esc(tz.won[1])}»: на каждой стадии добавлена заметка (Note), на стадии «${esc(tz.statuses[2][1])}» создана задача (Task) с датой.`,
      `Одна сделка закрыта со стадией «${esc(tz.lost[1])}» и заметкой с причиной.`,
      'Сохранено представление (Saved view) «Instagram · ' + esc(tz.campaign) + '»: сделки с UTM Source = instagram.',
    ])}
    <p>Снимки воронки в виде доски (Board), карточки сделки со связанным контактом и результатов импорта сохраняются в <code>screens/crm/</code>.</p>

    <h2>10. Этапы и сроки</h2>
    <p>День 0 — дата выдачи задания. К концу каждого этапа результат загружен в репозиторий; Заказчик может проверить промежуточный результат без предупреждения.</p>
    ${table(['Этап', 'Срок', 'Результат этапа'], [
      ['1. Сайт', 'день 4', 'Все страницы сгенерированы, доработаны по разделу 3 и опубликованы на Vercel; заполнен <code>docs/prompts.md</code>'],
      ['2. Аналитика', 'день 8', 'Ресурс GA4, тег на всех страницах, события раздела 4 проверены в DebugView'],
      ['3. Заявки', 'день 11', 'Таблица, приёмник и форма; заявки доходят до таблицы с метками'],
      ['4. Каналы', 'день 15', 'Реестр ссылок, публикации в соцсетях, автоответы Instagram, проверки 5.5 и 7.2'],
      ['5. Отчёты и CRM', 'день 19', 'Отчёты и исследования GA4, атрибуция и оповещение, отчёт Data Studio, HubSpot, аналитическая записка'],
      ['6. Сдача', 'день 21', 'Комплект по разделу 12, испытания раздела 11 в присутствии Заказчика'],
    ])}
  </section>`;

  // ——— 11. Приёмка ———
  const tests = [
    ['И-01', 'Сайт', 'Открыть все страницы по адресу Vercel в режиме телефона (375 px)', 'Страницы открываются, нет горизонтальной прокрутки, меню работает'],
    ['И-02', 'Тег', 'Открыть исходный код трёх страниц на выбор Заказчика', 'В <code>&lt;head&gt;</code> есть тег с идентификатором ресурса Исполнителя'],
    ['И-03', 'Контрольная заявка', 'Заказчик выбирает строку реестра, переходит по ссылке со своего телефона и отправляет заявку с именем «Приёмка ' + esc(tz.code) + '»', 'Не позже чем через 2 минуты в таблице есть строка с метками этой строки реестра; в DebugView или Realtime — <code>generate_lead</code>'],
    ['И-04', 'Ошибки формы', 'Отправить форму с пустым телефоном, затем с телефоном «123»', 'Форма не отправлена, показана ошибка у поля, пришло событие <code>form_error</code>'],
    ['И-05', 'Повтор', 'Отправить в приёмник повторно запрос с <code>request_id</code> уже записанной заявки', 'Вторая строка не появилась, приёмник вернул ошибку'],
    ['И-06', 'События', 'Заказчик называет 5 событий из таблицы 4.2', 'Исполнитель вызывает каждое на сайте и показывает его с параметрами в DebugView'],
    ['И-07', 'Instagram', 'Заказчик пишет комментарий с ключевым словом под Reel', 'Ответ в комментариях и сообщение в Direct с кнопкой; ссылка кнопки совпадает с реестром'],
    ['И-08', 'Короткая ссылка', 'Перейти по короткой ссылке ВКонтакте из реестра', 'В адресе сайта все метки строки реестра'],
    ['И-09', 'Data Studio', 'Изменить период на странице «Кампании»', 'Меняются все элементы страницы; числа заявок совпадают с таблицей за тот же период'],
    ['И-10', 'CRM', 'Найти в HubSpot заявку из И-03 после повторного импорта', 'Есть контакт и связанная сделка в стадии «Новая заявка» с Request ID и UTM'],
    ['И-11', 'Отчёты GA4', 'Заказчик задаёт вопрос по данным, например «С какой страницы входа из Instagram было больше всего ключевых событий?»', 'Исполнитель за 5 минут находит ответ в Reports или Explore и называет, какие параметр и показатель для этого выбрал'],
    ['И-12', 'Воронка', 'Переключить воронку с открытой на закрытую', 'Числа на шагах меняются; Исполнитель объясняет почему'],
    ...(tz.extraTests || []).map((t, n) => [`И-${13 + n}`, ...t.slice(1)]),
  ];
  const s11 = `<section class="page">
    <h2>11. Порядок приёмки</h2>
    <p>Приёмка проходит в присутствии Исполнителя. Исполнитель заранее открывает GA4 (DebugView и Realtime), таблицу заявок, ManyChat, Data Studio и HubSpot. Заказчик проводит испытания в указанном порядке и отмечает результат в акте (Приложение В).</p>
    ${table(['№', 'Что проверяется', 'Действие Заказчика', 'Ожидаемый результат'], tests, 'tests')}
    <p>Если испытание не пройдено, Исполнитель получает перечень замечаний и один раз устраняет их в течение 3 дней. Повторная проверка проводится только по непройденным испытаниям.</p>
  </section>`;

  // ——— 12–13. Комплект и оценка ———
  const tree = `${tz.file.toLowerCase().replace(/_/g, '-')}/
├── ${pageFiles.join('  ')}  404.html
├── css/  js/analytics.js  js/form.js  img/  files/
├── apps-script/Code.gs
├── docs/
│   ├── prompts.md      запросы к нейросети
│   ├── events.md       таблица событий
│   ├── utm.csv         реестр ссылок
│   ├── images.md       источники изображений
│   ├── report.md       аналитическая записка
│   └── afisha.pdf, qr-*.png
├── screens/ga4/  utm/  instagram/  crm/  datastudio/  lighthouse/
└── README.md           ссылки на всё, что ниже`;
  const s12 = `<section class="page">
    <div class="keep-block"><h2>12. Что сдаётся</h2>
    <p>Всё сдаётся одной ссылкой на репозиторий GitHub. Структура репозитория:</p>
    <pre class="tree">${esc(tree)}</pre></div>
    <p><code>README.md</code> начинается с таблицы ссылок: сайт на Vercel, таблица заявок, отчёт Data Studio, публикации в каждой соцсети, Reel с автоответами. Ниже — идентификатор ресурса GA4 (<code>G-…</code>) и строка «Доступ Viewer к ресурсу GA4 выдан: ___ (e-mail Заказчика)».</p>
    <p>В конце <code>README.md</code> две строки: «Не получилось: ___» и «Нейросеть использовалась для: ___».</p>

    <h2>13. Оценка</h2>
    ${table(['Часть работы', 'Разделы', 'Баллы'], [
      ['Сайт: страницы, блоки, адаптивность, Lighthouse, публикация, журнал запросов', '3', '15'],
      [`Аналитика: ресурс, тег, ${required} обязательных событий с параметрами, пользовательские параметры, ключевые события`, '4', '25'],
      ['UTM: реестр, короткие ссылки, QR, публикации в 4 соцсетях, отработка', '5', '15'],
      ['Заявки: таблица с проверками, приёмник, форма', '6', '10'],
      ['Автоответы Instagram с двумя ветками', '7', '10'],
      ['Отчёты и исследования GA4, атрибуция, оповещение, аналитическая записка', '8.1–8.3, 8.5', '10'],
      ['Отчёт Data Studio', '8.4', '5'],
      ['CRM HubSpot', '9', '5'],
      ['Оформление репозитория и снимков по разделу 12', '12', '5'],
      ['<b>Итого</b>', '', '<b>100</b>'],
      ['Дополнительно: события «по выбору», по 2 балла', '4.2', '+' + (tz.events.filter(e => e.optional).length * 2)],
    ], 'score')}
    ${table(['Баллы', '90–100', '75–89', '60–74', 'меньше 60'], [['Оценка', '5', '4', '3', 'работа возвращается на доработку']], 'grade')}
    <p><b>Работа не принимается</b> к оценке, если не выполнено хотя бы одно условие: сайт открывается по адресу Vercel; тег GA4 есть на всех страницах; контрольная заявка И-03 доходит до таблицы с метками.</p>
  </section>`;

  // ——— Приложения ———
  const wires = tz.pages.map(p => `<figure>${wireframe({ title: p.file, blocks: p.blocks, accent: tz.accent })}<figcaption>${esc(p.name)}</figcaption></figure>`).join('');
  const appA = `<section class="page appendix">
    <h2>Приложение А. Схемы страниц</h2>
    <p>Схема задаёт состав и порядок блоков. Справа в блоке — событие, которое он отправляет. Выделенные блоки содержат главную кнопку страницы.</p>
    <div class="wires">${wires}</div>
  </section>`;

  const appB = `<section class="page appendix">
    <h2>Приложение Б. Лист согласования</h2>
    ${table(['Должность', 'ФИО', 'Подпись', 'Дата'], [
      [esc(c.director.post), esc(c.director.name), `<span class="sig-cell">${dirSign(120)}</span>`, tz.issued],
      [esc(c.contact.post), esc(c.contact.name), `<span class="sig-cell">${conSign(110)}</span>`, tz.issued],
      ['Исполнитель: с заданием ознакомлен', blank, '', blank],
    ], 'agree')}
    <div class="seal-corner">${sealSvg(-4, 140)}</div>

    <h2 class="next">Приложение В. Акт сдачи-приёмки</h2>
    <p>к техническому заданию № ${esc(tz.code)}. Заполняется Заказчиком при приёмке.</p>
    ${table(['№', 'Испытание', 'Пройдено', 'Замечание'], tests.map(t => [t[0], t[1], '☐ да&nbsp;&nbsp;☐ нет', '']), 'act')}
    <div class="act-foot">
      <div>Баллы: ${blank}<br>Оценка: ${blank}</div>
      <div>Заказчик: ${blank}<br><span class="hint">подпись, расшифровка</span></div>
      <div class="stamp-place"><span class="hint">место для штампа<br>«Работа принята»</span></div>
    </div>
  </section>`;

  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(tz.code)} — ${esc(c.brand)}</title>
<style>${css(tz)}</style></head><body>
${cover}${letter}${s1}${s3}${s4}${s5}${s6}${s7}${s8}${s9}${s11}${s12}${appA}${appB}
</body></html>`;
}

// Блоки страниц можно задавать массивом [название, пояснение, событие, главная кнопка].
function normalize(tz) {
  const pages = tz.pages.map(p => ({ ...p, blocks: p.blocks.map(b => Array.isArray(b) ? { name: b[0], note: b[1], event: b[2], cta: b[3] } : b) }));
  const won = tz.statuses.find(s => s[2] === 'Closed won'), lost = tz.statuses.find(s => s[2] === 'Closed lost');
  // Проверка согласованности файла данных.
  const names = new Set(tz.events.map(e => e.name));
  const errors = [];
  for (const p of pages) for (const b of p.blocks) if (b.event && !names.has(b.event)) errors.push(`${p.file}: нет события ${b.event}`);
  const rows = new Set(tz.utm.map(r => r[0]));
  for (const r of [tz.instagram.utmRow, tz.instagram.branch.utmRow]) if (!rows.has(r)) errors.push(`нет строки реестра ${r}`);
  if (!tz.utm.some(r => r[4] === 'qr')) errors.push('в реестре нет строки с QR');
  if (!won || !lost) errors.push('в статусах нет Closed won / Closed lost');
  if (tz.events.length !== 20) errors.push(`событий ${tz.events.length}, нужно 20`);
  const dimEvents = tz.dims.flatMap(d => d[1].split(', '));
  for (const e of dimEvents) if (!names.has(e)) errors.push(`параметр ссылается на неизвестное событие ${e}`);
  if (errors.length) throw new Error(`${tz.code}: ` + errors.join('; '));
  return { ...tz, pages, won, lost, company: { ig: tz.company.brand.toLowerCase() + '_official', ...tz.company } };
}

function month(d) {
  return ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][+d.slice(3, 5) - 1];
}

function css(tz) {
  return `
@page { size: A4; margin: 15mm 15mm 17mm 18mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 10.4pt/1.45 "PT Sans", Arial, sans-serif; color: #1d222b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; }
.cover, .letter, .appendix { break-after: page; }
.appendix { break-before: page; }
.appendix:last-child { break-after: auto; }
h1 { font-size: 21pt; line-height: 1.15; margin: 4mm 0 3mm; }
h2 { font-size: 14pt; margin: 6mm 0 2.5mm; padding-bottom: 1.2mm; border-bottom: 1.6pt solid ${tz.accent}; break-after: avoid; }
h2:first-child { margin-top: 0; }
h2.plain { border: 0; margin-top: 5mm; }
h2.next { margin-top: 9mm; }
h3 { font-size: 11.4pt; margin: 4.5mm 0 1.5mm; break-after: avoid; }
p { margin: 0 0 2.2mm; }
ul, ol { margin: 0 0 2.5mm; padding-left: 6mm; }
li { margin-bottom: 1.2mm; }
code { font: 8.8pt "PT Mono", monospace; background: #f1f2f5; padding: .2mm 1mm; border-radius: 1mm; white-space: nowrap; }
code.url { white-space: normal; word-break: break-all; display: inline-block; margin-top: 1mm; }
table { width: 100%; border-collapse: collapse; margin: 1.5mm 0 3mm; font-size: 9.4pt; break-inside: auto; }
tr { break-inside: avoid; }
table.keep, pre, .two, .facts, .keep-block { break-inside: avoid; }
th { background: #2b2f36; color: #fff; text-align: left; font-weight: 700; padding: 1.6mm 2mm; }
td { border-bottom: .5pt solid #d5d9e0; padding: 1.5mm 2mm; vertical-align: top; }
tbody tr:nth-child(even) td { background: #f8f9fb; }
.hint { color: #6a7382; font-size: 8.6pt; }
.note.top { margin: 0 0 3mm; }
.note { font-size: 9pt; color: #4a5260; border-left: 2pt solid ${tz.accent}; padding: 1mm 0 1mm 3mm; margin-top: 4mm; }
.blank { display: inline-block; min-width: 60mm; border-bottom: .6pt solid #333; height: 4mm; }
.tag { display: inline-block; font-size: 7.4pt; padding: .2mm 1.4mm; border-radius: 2mm; background: #eef0f4; color: #4a5260; margin-top: .6mm; }
.tag.key { background: ${tz.accentSoft}; color: ${tz.accent}; font-weight: 700; }
.fill { color: ${tz.accent}; font-size: 8pt; font-style: italic; }

.letterhead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 3mm; border-bottom: 2.4pt solid ${tz.accent}; margin-bottom: 5mm; }
.lh-brand { display: flex; align-items: center; gap: 3mm; }
.lh-name { font-size: 19pt; font-weight: 700; letter-spacing: 2.4pt; color: #2b2f36; line-height: 1; }
.lh-tag { font-size: 8.6pt; color: #6a7382; margin-top: 1mm; }
.lh-req { font-size: 7.6pt; color: #4a5260; text-align: right; line-height: 1.4; }

.cover-top { display: flex; justify-content: space-between; align-items: flex-start; min-height: 52mm; }
.outno { font-size: 9.4pt; color: #4a5260; }
.approve { width: 74mm; font-size: 10pt; position: relative; line-height: 1.5; }
.approve-h { font-weight: 700; letter-spacing: 2pt; margin-bottom: 1mm; }
.sign-line { display: flex; align-items: flex-end; gap: 2mm; height: 12mm; position: relative; }
.sign-line .line { width: 30mm; border-bottom: .6pt solid #333; }
.sig-wrap { position: absolute; left: -2mm; bottom: -3mm; z-index: 2; }
.approve .seal-wrap { position: absolute; left: -24mm; top: 10mm; z-index: 3; mix-blend-mode: multiply; }
.cover-title { margin: 2mm 0 5mm; }
.toc { columns: 2; column-gap: 8mm; font-size: 9.4pt; margin-top: 3mm; padding: 0; list-style: none; }
.toc li { margin: 0 0 1mm; }
.toc b { color: ${tz.accent}; display: inline-block; width: 7mm; }
.kind { text-transform: uppercase; letter-spacing: 3pt; font-weight: 700; color: ${tz.accent}; font-size: 11pt; }
.num { font-size: 12pt; color: #4a5260; margin-top: 1mm; }
.sub { font-size: 11pt; color: #3b4350; }
.passport td:first-child { width: 58mm; font-weight: 700; }

.letter-to { text-align: right; font-size: 9.6pt; color: #4a5260; }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 4mm 0; }
.facts div { border: .6pt solid #d5d9e0; border-top: 2pt solid ${tz.accent}; padding: 2.5mm; border-radius: 1.5mm; }
.facts b { display: block; font-size: 15pt; }
.facts span { font-size: 8.6pt; color: #4a5260; }
.letter-sign { display: grid; grid-template-columns: 1fr 70mm 40mm; align-items: center; margin: 2mm 0 4mm; min-height: 34mm; }
.letter-sign .sig-wrap { position: relative; left: 0; bottom: 0; }
.letter-sign .seal-wrap { position: absolute; left: 14mm; top: -14mm; z-index: 3; mix-blend-mode: multiply; }
.flow { margin-top: 2mm; }

.two { display: grid; grid-template-columns: 1fr 58mm; gap: 6mm; align-items: start; }
.phone { border: 2.4pt solid #2b2f36; border-radius: 7mm; padding: 4mm 3mm 5mm; font-size: 8pt; background: #fff; }
.ph-top { text-align: center; font-weight: 700; margin-bottom: 2mm; }
.ph-post { height: 26mm; border-radius: 2mm; background: linear-gradient(135deg, ${tz.accent}, #2b2f36); display: flex; align-items: center; justify-content: center; }
.ph-reel { color: #fff; font-weight: 700; }
.ph-com { margin-top: 1.6mm; }
.ph-com.reply { padding-left: 4mm; color: #3b4350; }
.ph-sep { text-align: center; color: #8a93a2; font-size: 7pt; margin: 2.5mm 0 1.5mm; border-top: .5pt solid #e1e4ea; padding-top: 1.5mm; }
.bubble { background: #eef0f4; border-radius: 3mm; padding: 2mm 2.5mm; margin-bottom: 1.5mm; }
.bubble.btn { background: #fff; border: .7pt solid #3f6fe0; color: #3f6fe0; text-align: center; font-weight: 700; }
.ph-url { font: 6.6pt "PT Mono", monospace; color: #6a7382; word-break: break-all; margin-top: 1mm; }

pre.tpl, pre.tree { font: 8.6pt/1.5 "PT Mono", monospace; background: #f6f7f9; border: .6pt solid #d5d9e0; border-radius: 1.5mm; padding: 3mm; white-space: pre-wrap; }
.events td:first-child, .tests td:first-child, .act td:first-child { width: 9mm; }
.events td:nth-child(2) { width: 30mm; }
.events td:nth-child(3) { width: 17mm; font-size: 8.4pt; color: #4a5260; }
.events td { padding: 1.1mm 2mm; }
.pages td:first-child { width: 28mm; }
.reps td:first-child { width: 30mm; font-weight: 700; }
.reps td:last-child { width: 42mm; }
.pages td:last-child { width: 30mm; }
.utm { font-size: 8.4pt; }
.utm td:first-child { white-space: nowrap; }
.utm code { font-size: 7.8pt; }
.score td:last-child, .score th:last-child, .score td:nth-child(2) { text-align: center; width: 18mm; }
.grade td, .grade th { text-align: center; }
.wires { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm 6mm; align-items: start; }
.wires figure { margin: 0; break-inside: avoid; }
.wires figcaption { text-align: center; font-size: 8.6pt; color: #4a5260; margin-top: 1mm; }
.agree td { height: 15mm; vertical-align: middle; }
.sig-cell { display: inline-block; height: 10mm; }
.sig-cell .signature { margin-top: -3mm; }
.seal-corner { position: absolute; right: 30mm; top: 22mm; z-index: 3; mix-blend-mode: multiply; }
.act td:nth-child(3) { width: 30mm; white-space: nowrap; }
.act td:last-child { width: 55mm; }
.act-foot { display: grid; grid-template-columns: 1fr 1fr 60mm; gap: 4mm; margin-top: 5mm; align-items: center; }
.act-foot .blank { min-width: 35mm; }
.stamp-place { text-align: center; border: .8pt dashed #9aa3b1; border-radius: 2mm; height: 22mm; display: flex; align-items: center; justify-content: center; }
`;
}
