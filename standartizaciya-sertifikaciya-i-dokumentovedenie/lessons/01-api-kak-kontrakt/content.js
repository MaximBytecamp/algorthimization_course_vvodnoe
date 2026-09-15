'use strict';
// Тема 1: 103 слайда по авторскому сценарию. Код на слайдах взят из учебного проекта
// ../../api-standard-template, кадры — из папки shots (список в shots/README.md).

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// ⟦текст⟧ внутри кода подсвечивается.
const code = (text, head = '', cls = '') => `<div class="code-block ${cls}">${head ? `<div class="code-head"><b>${esc(head)}</b></div>` : ''}<pre><code>${esc(text).replace(/⟦([\s\S]*?)⟧/g, '<span class="hl">$1</span>')}</code></pre></div>`;
const list = (items, cls = '') => `<ul class="list ${cls}">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const olist = (items, cls = '') => `<ol class="list ${cls}">${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
const cards = (items, cls = '') => `<div class="cards ${cls}">${items.map(([small, title, text, extra = '']) => `<article class="card ${extra}">${small ? `<small>${small}</small>` : ''}<h3>${title}</h3>${text ? `<p>${text}</p>` : ''}</article>`).join('')}</div>`;
// Элемент, начинающийся с «*», выделяется; «текст|подпись» даёт подпись снизу.
const chain = (items, cls = '') => `<ol class="chain ${cls}">${items.map(item => {
  const key = item.startsWith('*'), inner = item.startsWith('~');
  const [main, sub] = item.replace(/^[*~]/, '').split('|');
  return `<li class="${key ? 'key' : ''}${inner ? 'inner' : ''}">${main}${sub ? `<small>${sub}</small>` : ''}</li>`;
}).join('')}</ol>`;
const row = items => `<div class="row-chain">${items.map((item, i) => `${i ? '<i>→</i>' : ''}<span class="${item.startsWith('*') ? 'key' : ''}">${item.replace(/^\*/, '')}</span>`).join('')}</div>`;
const compare = (badTitle, bad, goodTitle, good) => `<div class="compare"><div class="bad-side"><b>${badTitle}</b>${bad}</div><div class="good-side"><b>${goodTitle}</b>${good}</div></div>`;
const table = (head, rows, cls = '') => `<div class="table-wrap ${cls}"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const status = (items, cls) => `<div class="status-grid">${items.map(([num, name, text]) => `<div class="status ${cls}"><b>${num}</b><span>${name}</span>${text ? `<p>${text}</p>` : ''}</div>`).join('')}</div>`;
const answer = (summary, body) => `<details class="answer"><summary>${summary}</summary><div>${body}</div></details>`;
const takeaway = text => `<p class="takeaway">${text}</p>`;
const note = text => `<p class="note">${text}</p>`;
const text = html => `<div class="text">${html}</div>`;
const m = method => `<span class="m ${method.toLowerCase()}">${method}</span>`;
const endpoints = rows => `<ul class="endpoints">${rows.map(([method, path, hint = '']) => `<li>${m(method)}<span>${path}</span><span>${hint}</span></li>`).join('')}</ul>`;
const shot = (file, title, caption, cls = '') => `<figure class="shot ${cls}"><div class="shot-bar"><b>${title}</b><span>СКРИНШОТ · ${/^[eg]-/.test(file) ? '16.09.2026' : '15.09.2026'}</span></div><button class="shot-view" aria-label="Увеличить кадр: ${esc(title)}"><img src="shots/${file}" alt="${esc(caption)}" loading="lazy"></button><figcaption>${caption} Клик — увеличить.</figcaption></figure>`;
const split = (left, right, cls = '') => `<div class="split ${cls}"><div class="stack">${left}</div><div class="stack">${right}</div></div>`;
const tree = html => `<pre class="tree">${html}</pre>`;

const anatomy = (rows, legend) => `<div class="anatomy"><div class="wire">${rows.map(r => r === '' ? '<div class="gap"></div>' : `<div data-part="${r[0]}"><pre>${esc(r[1])}</pre><i>${r[2]}</i></div>`).join('')}</div><div class="legend">${legend.map(([part, name, hint]) => `<button data-part-toggle="${part}" aria-pressed="false"><b>${name}</b><span>${hint}</span></button>`).join('')}</div></div>`;

const replay = `<div class="replay"><div class="stack"><label>Отправить запрос</label><div class="buttons"><button data-run="get">GET /tickets/42</button><button data-run="post">POST /tickets</button><button data-run="put">PUT /tickets/42</button><button data-run="delete">DELETE /tickets/42</button></div><label>Состояние сервера</label><div data-state></div><button data-reset>Вернуть исходное состояние</button></div><div class="stack"><label>Последние ответы, новые сверху</label><ul data-log></ul></div></div>`;

const lint = (value, opts = {}) => `<div class="lint"${opts.live ? ' data-live="true"' : ''}><div><div class="code-head"><b>${opts.head || 'contract.txt'}</b><span>метод и путь, по одному на строку</span></div><textarea spellcheck="false" aria-label="Список endpoints для проверки">${esc(value)}</textarea><div class="actions"><button class="primary" data-lint-run>${opts.button || 'Проверить правилами'}</button><button data-lint-reset>Вернуть исходный текст</button></div></div><div class="lint-out" data-lint-output aria-live="polite" hidden></div></div>`;

const link = (href, label) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
// Цитата из англоязычного источника: оригинал, под ним перевод и ссылка.
const quote = (en, ru, source, href) => `<figure class="quote"><blockquote lang="en">${en}</blockquote><p class="ru"><b>Перевод:</b> ${ru}</p><figcaption>${link(href, source)}</figcaption></figure>`;

// Ссылки на стандарты и файлы компаний, проверенные 16.09.2026. Полный список с цитатами —
// api-standard-template/docs/STANDARDS.md.
const SRC = {
  ghPrTemplate: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository',
  ghIssueForms: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms',
  ghCodeowners: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners',
  ghSecurity: 'https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository',
  ghVersions: 'https://docs.github.com/en/rest/about-the-rest-api/api-versions',
  ghBestPractices: 'https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api',
  k8sPr: 'https://github.com/kubernetes/kubernetes/blob/master/.github/PULL_REQUEST_TEMPLATE.md',
  oaiPr: 'https://github.com/OAI/OpenAPI-Specification/blob/main/.github/pull_request_template.md',
  ghdPr: 'https://github.com/github/docs/blob/main/.github/PULL_REQUEST_TEMPLATE.md',
  azPr: 'https://github.com/Azure/azure-rest-api-specs/blob/main/.github/PULL_REQUEST_TEMPLATE.md',
  boxPr: 'https://github.com/box/box-openapi/blob/main/.github/PULL_REQUEST_TEMPLATE.md',
  azIssue: 'https://github.com/Azure/azure-rest-api-specs/blob/main/.github/ISSUE_TEMPLATE/02_bug.yml',
  k8sIssue: 'https://github.com/kubernetes/kubernetes/blob/master/.github/ISSUE_TEMPLATE/bug-report.yaml',
  stripeIssue: 'https://github.com/stripe/stripe-node/blob/master/.github/ISSUE_TEMPLATE/bug_report.yml',
  vscIssue: 'https://github.com/microsoft/vscode/blob/main/.github/ISSUE_TEMPLATE/bug_report.md',
  oaiCo: 'https://github.com/OAI/OpenAPI-Specification/blob/main/.github/CODEOWNERS',
  azCo: 'https://github.com/Azure/azure-rest-api-specs/blob/main/.github/CODEOWNERS',
  k8sOwners: 'https://github.com/kubernetes/kubernetes/blob/master/OWNERS',
  azSec: 'https://github.com/Azure/azure-rest-api-specs/blob/main/SECURITY.md',
  vscSec: 'https://github.com/microsoft/vscode/blob/main/SECURITY.md',
  k8sSec: 'https://github.com/kubernetes/kubernetes/blob/master/SECURITY_CONTACTS',
  stripeCl: 'https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md',
  k8sCl: 'https://github.com/kubernetes/kubernetes/tree/master/CHANGELOG',
  keepChangelog: 'https://keepachangelog.com/en/1.1.0/',
  oaiDep: 'https://github.com/OAI/OpenAPI-Specification/blob/main/.github/dependabot.yml',
  ghdDep: 'https://github.com/github/docs/blob/main/.github/dependabot.yml',
  fastapiDep: 'https://github.com/fastapi/fastapi/blob/master/.github/dependabot.yml',
  oasdiff: 'https://github.com/oasdiff/oasdiff-action',
  rfc9457Type: 'https://www.rfc-editor.org/rfc/rfc9457.html#name-type',
  azBreaking: 'https://github.com/Azure/azure-rest-api-specs/blob/main/documentation/Breaking%20changes%20guidelines.md',
  graph: 'https://github.com/microsoft/api-guidelines/blob/vNext/graph/GuidelinesGraph.md',
  azGuidelines: 'https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md',
  boxDir: 'https://github.com/box/box-openapi/tree/main/openapi',
  rfc9745: 'https://www.rfc-editor.org/rfc/rfc9745.html',
  rfc8594: 'https://www.rfc-editor.org/rfc/rfc8594.html',
  rfc6585: 'https://www.rfc-editor.org/rfc/rfc6585.html#section-4',
  rfc9110IfMatch: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match',
  z104: 'https://opensource.zalando.com/restful-api-guidelines/#104',
  z153: 'https://opensource.zalando.com/restful-api-guidelines/#153',
  z182: 'https://opensource.zalando.com/restful-api-guidelines/#182',
  z189: 'https://opensource.zalando.com/restful-api-guidelines/#189',
  z230: 'https://opensource.zalando.com/restful-api-guidelines/#230',
  z233: 'https://opensource.zalando.com/restful-api-guidelines/#233',
  ietfRateLimit: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/',
  ietfIdempotency: 'https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header',
  stripeIdempotency: 'https://docs.stripe.com/api/idempotent_requests',
  fetch: 'https://fetch.spec.whatwg.org/#http-responses',
  oasOauth: 'https://spec.openapis.org/oas/v3.2.0.html#oauth-flows-object',
  repo: 'https://github.com/MaximBytecamp/api-standard-template',
  demoPr: 'https://github.com/MaximBytecamp/api-standard-template/pull/6',
  demoIssue: 'https://github.com/MaximBytecamp/api-standard-template/issues/7',
  redRun: 'https://github.com/MaximBytecamp/api-standard-template/actions/runs/35027958937',
  greenRun: 'https://github.com/MaximBytecamp/api-standard-template/actions/runs/35027767131',
  pages: 'https://maximbytecamp.github.io/api-standard-template/',
};

const lessonGroups = [
  { title: 'Что стандартизируем', time: 'часть 1', start: 1, end: 3 },
  { title: 'Запрос, ответ, ресурс', time: 'часть 2', start: 4, end: 8 },
  { title: 'Архитектурный стиль REST', time: 'часть 3', start: 9, end: 15 },
  { title: 'Правила HTTP API', time: 'часть 4', start: 16, end: 33 },
  { title: 'Практика: контракт', time: 'часть 5', start: 34, end: 36 },
  { title: 'OpenAPI', time: 'часть 6', start: 37, end: 53 },
  { title: 'FastAPI и документация', time: 'часть 7', start: 54, end: 60 },
  { title: 'Единый формат ошибок', time: 'часть 8', start: 61, end: 65 },
  { title: 'Версии и изменения', time: 'часть 9', start: 66, end: 75 },
  { title: 'Стандарт и его проверка', time: 'часть 10', start: 76, end: 86 },
  { title: 'Стандарты реальных команд', time: 'часть 11', start: 87, end: 94 },
  { title: 'Репозиторий API на GitHub', time: 'часть 12', start: 95, end: 103 },
  { title: 'Заголовки и совместимость', time: 'часть 13', start: 104, end: 113 },
  { title: 'Практическая работа', time: 'часть 14', start: 114, end: 120 },
  { title: 'Итог темы', time: 'часть 15', start: 121, end: 122 },
];

const lessonSlides = [
  // 1
  {
    title: 'API как публичный контракт программы',
    intro: 'На этом занятии нас интересует не только серверный код. Мы рассматриваем API как контракт между двумя программами: что клиент вправе ожидать от сервера и как проверить, что сервер это выполняет.',
    body: split(
      text('<p>Стандартизировать необходимо:</p>') + list(['адреса ресурсов', 'HTTP-методы', 'параметры', 'структуру JSON', 'HTTP status codes', 'формат ошибок', 'версионирование', 'документацию', 'безопасность', 'правила изменения API', 'проверку соответствия этим правилам'], 'cols'),
      chain(['CLIENT|клиентская программа', '*API CONTRACT|URL · METHOD · PARAMETERS · BODY · RESPONSE · ERRORS · VERSION', 'SERVER|реализация на FastAPI'])
    ),
  },
  // 2
  {
    title: 'Что в этой теме означает «сертификация»',
    intro: 'Для обычного REST API нет единого международного органа, который выдаёт разработчику сертификат «правильного API». Поэтому в рамках дисциплины мы разделяем два процесса.',
    body: split(
      cards([
        ['процесс 1', 'Стандартизация', 'Создание набора правил, которым API должен соответствовать: как называть адреса, какие коды возвращать, как описывать ошибки.', 'accent'],
        ['процесс 2', 'Проверка соответствия', 'Доказательство того, что API эти правила действительно выполняет. Доказательство — результат проверки, а не мнение автора.', 'good'],
      ], 'two') + text('<p>Позже в этой теме мы автоматизируем проверку:</p>') + row(['OpenAPI', 'Linter', 'Contract tests', '*CI']),
      table(['Стандарт', 'Чем проверяется'], [
        ['API Style Guide', 'Spectral'],
        ['OpenAPI Contract', 'OpenAPI validation'],
        ['HTTP rules', 'Tests'],
        ['Security rules', 'Security review'],
      ])
    ),
  },
  // 3
  {
    title: 'Сегодня создаём новый учебный API',
    intro: 'До этого занятия учебного API не существует. Мы создаём отдельный учебный стенд, а production-сервисы не изменяем.',
    body: split(
      text('<p>Предметная область — <strong>Service Desk API</strong>, система регистрации обращений в службу поддержки. Сотрудник сообщает о проблеме, специалист меняет статус обращения, пока проблема не решена.</p>') +
      table(['Технология', 'Роль в проекте'], [
        ['Python', 'язык реализации'],
        ['FastAPI', 'веб-фреймворк: маршруты, обработка запросов'],
        ['Pydantic', 'схемы данных и валидация тела запроса'],
        ['OpenAPI', 'машиночитаемое описание контракта'],
        ['Swagger UI', 'интерактивная документация по этому описанию'],
      ]),
      tree('<b>Учебный стенд</b>\nService Desk API\n\ntickets\n├── создание\n├── просмотр\n├── изменение\n└── удаление') +
      note('Готовый эталон лежит в репозитории курса: <code>api-standard-template/</code>. Его структуру разберём в конце темы.')
    ),
  },
  // 4
  {
    title: 'API — граница между программами',
    intro: 'API (Application Programming Interface) — интерфейс, через который одна программа взаимодействует с другой.',
    body: split(
      text('<p>Например, веб-интерфейс службы поддержки запрашивает у сервера список обращений:</p>') +
      row(['Frontend', 'GET /api/v1/tickets', 'Backend', '*JSON']) +
      text('<p>Клиенту не требуется знать:</p>') + list(['язык, на котором написан backend;', 'структуру базы данных;', 'внутренние классы;', 'алгоритмы сервера.']) +
      takeaway('Клиент должен знать только контракт API.'),
      chain(['FRONTEND|HTTP', '*PUBLIC API|то, что видит клиент', '~INTERNAL CODE · DATABASE|можно менять, не нарушая контракт'])
    ),
  },
  // 5
  {
    title: 'Что происходит при обращении к API',
    intro: 'Обмен всегда состоит из двух сообщений: клиент отправляет HTTP request, сервер обрабатывает его и возвращает HTTP response.',
    body: split(
      code('GET /api/v1/tickets/42', 'HTTP request') +
      code('200 OK\nContent-Type: application/json\n\n{\n  "id": 42,\n  "title": "Не работает VPN",\n  "status": "open"\n}', 'HTTP response') +
      note('Здесь клиент просит обращение с идентификатором 42. Сервер отвечает кодом <code>200 OK</code>, сообщает формат тела и передаёт само обращение в JSON.'),
      chain(['CLIENT', '*HTTP REQUEST|метод и адрес', 'SERVER', '*HTTP RESPONSE|код, заголовки, тело', 'CLIENT'])
    ),
  },
  // 6
  {
    title: 'Анатомия HTTP-запроса',
    intro: 'HTTP request может содержать метод, URL, заголовки, query parameters и тело. Нажмите на часть в легенде, чтобы увидеть её в запросе.',
    body: anatomy([
      ['method', 'POST', 'method'],
      ['url', '/api/v1/tickets', 'url'],
      ['header', 'Authorization: Bearer TOKEN', 'header'],
      ['header', 'Content-Type: application/json', 'header'],
      '',
      ['body', '{\n  "title": "Не работает VPN",\n  "description": "Ошибка после обновления"\n}', 'body'],
    ], [
      ['method', 'METHOD', 'Какое действие клиент просит выполнить: POST — создать обращение.'],
      ['url', 'URL', 'К какому ресурсу обращён запрос: коллекция обращений.'],
      ['header', 'HEADERS', 'Метаданные: кто отправил запрос и в каком формате тело.'],
      ['query', 'QUERY PARAMETERS', 'Уточняют выборку, например <code>?status=open</code>. В этом запросе их нет.'],
      ['body', 'BODY', 'Данные нового обращения в формате JSON.'],
    ]) + note('В настоящем сообщении метод и путь записаны в одной строке: <code>POST /api/v1/tickets HTTP/1.1</code>. Здесь они разнесены, чтобы подписать каждую часть отдельно.'),
  },
  // 7
  {
    title: 'Анатомия ответа',
    intro: 'Ответ сервера содержит status code, заголовки и тело.',
    body: anatomy([
      ['status', '201 Created', 'status'],
      ['header', 'Location: /api/v1/tickets/8d45...', 'header'],
      ['header', 'Content-Type: application/json', 'header'],
      '',
      ['body', '{\n  "id": "8d45...",\n  "title": "Не работает VPN",\n  "status": "open"\n}', 'body'],
    ], [
      ['status', 'STATUS', '201 — ресурс создан. Код читает программа, а не человек.'],
      ['header', 'HEADERS', 'Location сообщает адрес нового обращения, Content-Type — формат тела.'],
      ['body', 'BODY', 'Данные созданного ресурса: идентификатор, который выдал сервер, и начальный статус.'],
    ]) + takeaway('<code>201</code> сообщает машине результат операции, а JSON содержит данные созданного ресурса.'),
  },
  // 8
  {
    title: 'REST работает вокруг ресурсов',
    intro: 'Ресурс — сущность предметной области, которой API предоставляет адрес.',
    body: split(
      text('<p>В нашем проекте ресурс — <strong>Ticket</strong>, обращение в службу поддержки.</p>') +
      table(['Что', 'Адрес'], [['Коллекция обращений', '<code>/api/v1/tickets</code>'], ['Конкретное обращение', '<code>/api/v1/tickets/{ticket_id}</code>']]) +
      takeaway('URL описывает, <strong>что это за ресурс</strong>, а HTTP-метод — <strong>что с ним требуется сделать</strong>.'),
      tree('<b>tickets</b>\n│\n├── 41\n├── 42\n└── 43')
    ),
  },
  // 9
  {
    title: 'REST — архитектурный стиль',
    intro: 'REST не является языком программирования, библиотекой или форматом JSON.',
    body: split(
      text('<p><strong>REST</strong> (Representational State Transfer) — архитектурный стиль для распределённых систем. Его сформулировал Рой Филдинг в диссертации 2000 года.</p><p>Стиль задан набором архитектурных ограничений. Если система их соблюдает, клиент и сервер можно развивать относительно независимо: менять интерфейс, не трогая базу, или переносить сервер, не переписывая клиентов.</p>') +
      takeaway('REST = набор архитектурных ограничений'),
      table(['Ограничение', 'Суть'], [
        ['Client–Server', 'разделение обязанностей клиента и сервера'],
        ['Stateless', 'каждый запрос содержит всё нужное для обработки'],
        ['Cacheable', 'ответ сообщает, можно ли его повторно использовать'],
        ['Layered System', 'между клиентом и сервером могут быть промежуточные слои'],
        ['Uniform Interface', 'единые правила взаимодействия с любым ресурсом'],
        ['Code on Demand', 'необязательное: сервер может передать клиенту исполняемый код'],
      ]) + note('Следующие пять слайдов разбирают обязательные ограничения.')
    ),
  },
  // 10
  {
    title: 'Клиент и сервер имеют разные обязанности',
    intro: 'Клиент отвечает за использование данных. Сервер отвечает за их предоставление и изменение.',
    body: split(
      row(['React / Mobile App', 'HTTP', '*FastAPI']) +
      text('<p>Благодаря этому разделению изменение интерфейса мобильного приложения не требует изменения базы данных сервера. А перенос базы на другую СУБД не требует обновлять приложение у пользователей.</p>'),
      table(['Client', 'Server'], [['UI', 'Business logic'], ['Navigation', 'Database'], ['Display', 'Authorization']])
    ),
  },
  // 11
  {
    title: 'Каждый запрос должен быть самодостаточным',
    intro: 'Сервер не должен рассчитывать на то, что предыдущий HTTP request объяснил следующий. Запрос сам содержит необходимые данные.',
    body: split(
      text('<p>Поэтому токен доступа передаётся в каждом защищённом запросе:</p>') + code('Authorization: Bearer ey...', 'заголовок каждого запроса') +
      text('<p>Не следует строить контракт вида «сначала вызови A, сервер это запомнит, потом вызови B», если состояние можно явно передать в запросе.</p>') +
      compare('Так не надо', '<pre>сначала вызови A\nпотом сервер запомнит это\nпосле этого вызови B</pre>', 'Так надо', '<pre>B + всё, что нужно\n    для его обработки</pre>'),
      chain(['REQUEST 1 → SERVER', 'REQUEST 2 → SERVER', 'REQUEST 3 → SERVER', '*Каждый request самодостаточен|любой из них может обработать любой экземпляр сервера'])
    ),
  },
  // 12
  {
    title: 'Ответ может иметь правила кэширования',
    intro: 'HTTP позволяет серверу сообщить, можно ли повторно использовать ранее полученный response.',
    body: split(
      code('Cache-Control: max-age=300', 'заголовок ответа') +
      text('<p>Этот заголовок разрешает клиентам и промежуточным системам использовать сохранённый ответ в течение 300 секунд, не обращаясь к серверу снова.</p>') +
      takeaway('Кэширование — часть архитектуры HTTP API, а не особенность Swagger.'),
      chain(['CLIENT', '*CACHE|сохранённый response', 'SERVER|получает запрос, только если в кэше нет годного ответа'])
    ),
  },
  // 13
  {
    title: 'Между клиентом и сервером могут быть промежуточные слои',
    intro: 'Клиент не обязан знать, отвечает ему непосредственно приложение или запрос проходит через другие компоненты.',
    body: split(
      text('<p>Каждый слой решает свою задачу:</p>') + table(['Слой', 'Задача'], [
        ['CDN', 'отдаёт кэшированные ответы ближе к пользователю'],
        ['API Gateway', 'проверяет токены, ограничивает частоту запросов'],
        ['Load Balancer', 'распределяет запросы между экземплярами сервиса'],
      ]) + takeaway('Инфраструктуру можно менять без изменения клиентского контракта.'),
      chain(['CLIENT', 'CDN', 'API GATEWAY', 'LOAD BALANCER', '*FASTAPI'])
    ),
  },
  // 14
  {
    title: 'Одинаковые правила взаимодействия',
    intro: 'REST стремится к единообразному интерфейсу: с любым ресурсом работают по одним и тем же правилам.',
    body: split(
      table(['Элемент HTTP', 'Что делает'], [
        ['URI', 'идентифицирует ресурс'],
        ['HTTP method', 'задаёт действие'],
        ['status code', 'сообщает результат'],
        ['representation', 'передаёт состояние ресурса, например JSON'],
      ]) + text('<p>Поэтому вместо отдельной команды <code>deleteTicket()</code> используется стандартная HTTP-семантика:</p>') + code('DELETE /tickets/42'),
      `<div class="card accent"><small>правило</small><h3 class="big">RESOURCE + HTTP METHOD = OPERATION</h3><p>Клиент, который умеет удалять заказ в одном API, по той же схеме удалит обращение в другом.</p></div>`
    ),
  },
  // 15
  {
    title: 'Не каждый JSON API полностью RESTful',
    intro: 'На практике термин «REST API» часто применяют к любому HTTP API, которое использует ресурсы, методы и JSON.',
    body: split(
      text('<p>Обычно так называют API, которое использует:</p>') + list(['ресурсы;', 'HTTP methods;', 'HTTP status codes;', 'JSON;', 'stateless-взаимодействие.']) +
      text('<p>Полное соответствие всем ограничениям REST, включая hypermedia (ссылки на следующие действия прямо в ответе), встречается значительно реже.</p>'),
      `<div class="card accent"><small>пересечение</small><h3 class="big">HTTP API ∩ REST principles</h3></div>` +
      takeaway('Для нашей дисциплины важно не спорить о названии, а понимать, какие конкретно правила выполняет API.')
    ),
  },
  // 16
  {
    title: 'Без правил каждый разработчик создаёт свой язык',
    intro: 'Три команды независимо написали свои части одного API. Все три endpoint работают.',
    body: compare('До стандартизации',
      '<pre>GET  /getUsers\n\nPOST /user/create\n\nPOST /delete-user?id=10</pre>',
      'После стандартизации',
      '<pre>GET    /users\nPOST   /users\nDELETE /users/{user_id}</pre>') +
      text('<p>Вместе первые три адреса создают непоследовательный контракт: действие то в имени, то в методе, коллекция то во множественном числе, то в единственном, идентификатор то в пути, то в query. Клиенту приходится читать документацию к каждому адресу.</p>') +
      takeaway('После стандартизации клиент может предугадать поведение API.'),
  },
  // 17
  {
    title: 'API регулируется не одним документом',
    intro: 'Для реального API существует несколько уровней правил. Каждый следующий уровень уточняет предыдущий и не может ему противоречить.',
    body: split(
      table(['Уровень', 'Что определяет'], [
        ['IETF RFC', 'семантику HTTP: методы, коды, заголовки'],
        ['OpenAPI Specification', 'способ машинного описания API'],
        ['Company API Guidelines', 'правила именования и совместимости в компании'],
        ['Project API Style Guide', 'договорённости конкретной команды'],
        ['OpenAPI contract', 'контракт одного сервиса'],
      ]),
      chain(['IETF RFC', 'OpenAPI Specification', 'Company API Guidelines', 'Project API Style Guide', '*OpenAPI contract конкретного сервиса'])
    ),
  },
  // 18
  {
    title: 'Метод нельзя выбирать случайно',
    intro: 'HTTP уже определяет назначение стандартных методов.',
    body: split(
      text('<p>RFC 9110 «HTTP Semantics» описывает, в частности, методы:</p>') + code('GET\nHEAD\nPOST\nPUT\nDELETE\nOPTIONS') +
      text('<p>и их свойства — например, safe и idempotent.</p>') +
      takeaway('Значение <code>GET</code>, <code>POST</code> или <code>DELETE</code> является частью контракта.'),
      shot('18-rfc9110-methods.png', 'rfc-editor.org · RFC 9110', 'RFC 9110, раздел 9 «Methods»: обзор и таблица стандартных методов со ссылками на подразделы.'),
      'wide-right'
    ),
  },
  // 19
  {
    title: 'URI описывает существительное',
    intro: 'Действие уже выражается HTTP method. Если записать его ещё и в адрес, оно окажется в контракте дважды.',
    body: compare('Плохо', '<pre>/getTickets\n/createTicket\n/deleteTicket</pre>', 'Хорошо', '<pre>/tickets\n/users\n/orders\n/products</pre>') +
      split(code('POST /tickets', 'лучше'), code('POST /createTicket', 'хуже')),
  },
  // 20
  {
    title: 'Один ресурс и набор ресурсов',
    intro: 'Коллекция и элемент коллекции имеют разные адреса, но общий корень.',
    body: split(
      table(['Что', 'Запрос'], [
        ['Коллекция', '<code>GET /tickets</code>'],
        ['Конкретный ресурс', '<code>GET /tickets/{ticket_id}</code>'],
        ['Вложенный ресурс', '<code>GET /users/{user_id}/tickets</code>'],
      ]) + text('<p>Вложенный адрес читается как «обращения пользователя с этим идентификатором».</p>') +
      `<p class="warn-box">Чрезмерно глубокие URI усложняют контракт: <code>/companies/{id}/departments/{id}/users/{id}/tickets</code> заставляет клиента знать всю цепочку, чтобы получить одно обращение.</p>`,
      tree('<b>/tickets</b>\n   │\n   ├─ /1\n   ├─ /2\n   └─ /3')
    ),
  },
  // 21
  {
    title: 'Path parameter идентифицирует ресурс',
    intro: 'Часть пути, которая меняется от ресурса к ресурсу, называется path parameter.',
    body: split(
      code('GET /tickets/42') + tree('/tickets/42\n         ↑\n    <b>ticket_id</b>') +
      text('<p><code>42</code> — часть адреса конкретного ресурса. Без неё запрос обращён уже к коллекции.</p>'),
      code('@app.get("/tickets/{ticket_id}")\ndef get_ticket(⟦ticket_id: int⟧):\n    ...', 'FastAPI') +
      note('FastAPI берёт значение из пути, приводит его к <code>int</code> и передаёт в функцию. Если в пути <code>abc</code>, клиент получит ошибку валидации, а функция не будет вызвана.')
    ),
  },
  // 22
  {
    title: 'Query parameter изменяет выборку',
    intro: 'Query parameters записываются после знака «?» и уточняют запрос к тому же ресурсу.',
    body: split(
      text('<p>Их удобно использовать для:</p>') + list(['фильтрации;', 'сортировки;', 'поиска;', 'пагинации.']) +
      code('GET /tickets?status=open&limit=20'),
      text('<p>Основной ресурс остаётся тем же — <code>/tickets</code>, а параметры уточняют, какую часть коллекции вернуть:</p>') +
      table(['Параметр', 'Смысл'], [['<code>status=open</code>', 'только открытые обращения'], ['<code>limit=20</code>', 'не больше 20 штук']])
    ),
  },
  // 23
  {
    title: 'GET получает представление ресурса',
    intro: 'GET используется для чтения. Он не должен менять состояние сервера.',
    body: split(
      endpoints([['GET', '/tickets', 'коллекция'], ['GET', '/tickets/42', 'один ресурс']]) +
      text('<p>Запрос <code>GET /api/v1/tickets/42</code> может вернуть:</p>') +
      status([['200', 'OK', 'обращение найдено, оно в теле ответа'], ['404', 'Not Found', 'обращения с таким идентификатором нет']], 's2'),
      `<div class="card accent"><small>свойство метода</small><h3>GET относится к safe HTTP methods</h3><p>Клиент может повторить его, браузер может предзагрузить ссылку, кэш может сохранить ответ — ничего в системе от этого не изменится.</p></div>` +
      row(['CLIENT', '← DATA ←', '*SERVER'])
    ),
  },
  // 24
  {
    title: 'POST создаёт ресурс или запускает операцию',
    intro: 'Для создания обращения клиент отправляет POST на коллекцию.',
    body: split(
      code('POST /tickets', 'request') + code('{\n  "title": "Не работает VPN",\n  "description": "Ошибка подключения"\n}', 'body'),
      text('<p>При успешном создании сервер отвечает:</p>') + code('201 Created\nLocation: /tickets/{new_id}', 'response') +
      text('<p>Идентификатор нового ресурса формирует сервер, поэтому клиент узнаёт адрес созданного обращения из заголовка <code>Location</code>.</p>') +
      row(['POST /tickets', '*NEW TICKET'])
    ),
  },
  // 25
  {
    title: 'PUT заменяет состояние ресурса',
    intro: 'PUT используется, когда клиент передаёт полное новое представление ресурса.',
    body: split(
      code('PUT /tickets/42\n\n{\n  "title": "Не работает VPN",\n  "description": "Ошибка подключения",\n  "status": "closed"\n}', 'request') +
      note('Поле, которое клиент не передал, по смыслу PUT должно исчезнуть или получить значение по умолчанию: ресурс заменяется целиком.'),
      chain(['OLD RESOURCE', '*PUT|новое представление целиком', 'NEW RESOURCE']) +
      takeaway('По HTTP semantics PUT идемпотентен: повторение идентичного PUT даёт тот же предполагаемый эффект, что и один вызов.')
    ),
  },
  // 26
  {
    title: 'PATCH изменяет часть ресурса',
    intro: 'Если требуется изменить только статус, клиенту не нужно повторять остальные свойства.',
    body: split(
      code('PATCH /tickets/42\n\n{\n  "status": "closed"\n}', 'request') +
      takeaway('В нашем учебном API для редактирования Ticket используем PATCH.'),
      tree('<b>Ticket</b>\n├── title\n├── description\n└── status  ← PATCH') +
      note('Так клиент не затрёт поле, которое за это время изменил другой пользователь, и отправляет меньше данных.')
    ),
  },
  // 27
  {
    title: 'DELETE удаляет ресурс',
    intro: 'После успешного удаления возвращать нечего, поэтому ответ не содержит тела.',
    body: split(
      code('DELETE /tickets/42', 'request') + code('204 No Content', 'response') +
      text('<p>HTTP определяет DELETE как идемпотентный по предполагаемому эффекту: после первого и после пятого одинакового запроса ресурса нет.</p>') +
      note('Код ответа при повторе может отличаться: второй DELETE вернёт <code>404</code>, потому что удалять уже нечего. Идемпотентность говорит о состоянии сервера, а не о коде ответа.'),
      chain(['RESOURCE', '*DELETE', '∅'])
    ),
  },
  // 28
  {
    title: 'Два разных свойства HTTP-методов',
    intro: 'Safe и idempotent часто путают. Нажимайте одну кнопку несколько раз подряд и следите за состоянием сервера.',
    body: split(
      text('<p><strong>Safe</strong> — клиент не просит изменить состояние сервера: <code>GET</code>, <code>HEAD</code>, <code>OPTIONS</code>.</p><p><strong>Idempotent</strong> — повтор идентичной операции даёт тот же предполагаемый эффект, что один вызов: <code>PUT</code>, <code>DELETE</code>, <code>GET</code>.</p>') +
      `<div class="table-wrap"><table><thead><tr><th>Method</th><th>Safe</th><th>Idempotent</th></tr></thead><tbody>
      <tr><td>${m('GET')}</td><td class="yes">YES</td><td class="yes">YES</td></tr>
      <tr><td>${m('POST')}</td><td class="no">NO</td><td class="no">NO</td></tr>
      <tr><td>${m('PUT')}</td><td class="no">NO</td><td class="yes">YES</td></tr>
      <tr><td>${m('DELETE')}</td><td class="no">NO</td><td class="yes">YES</td></tr></tbody></table></div>` +
      note('POST в общем случае не идемпотентен: каждый повтор создаёт ещё одно обращение.'),
      replay, 'wide-right'
    ),
  },
  // 29
  {
    title: '2xx — запрос обработан успешно',
    intro: 'В нашем проекте понадобятся три успешных кода.',
    body: status([
      ['200', 'OK', 'Запрос выполнен, результат в теле. GET, PATCH.'],
      ['201', 'Created', 'Создан новый ресурс, адрес в Location. POST.'],
      ['204', 'No Content', 'Выполнено, тело не нужно. DELETE.'],
    ], 's2') + split(
      text('<p>Не следует автоматически возвращать <code>200</code> из любого endpoint. Status code должен описывать фактический результат операции: клиент по нему решает, что делать дальше, не разбирая тело.</p>'),
      table(['Метод', 'Успешный код'], [[m('GET'), '200'], [m('POST'), '201'], [m('DELETE'), '204']])
    ),
  },
  // 30
  {
    title: '4xx — проблема находится на стороне запроса',
    intro: 'Коды 4xx сообщают клиенту: повторять тот же запрос бесполезно, его нужно исправить.',
    body: status([
      ['400', 'Bad Request', 'Запрос нельзя разобрать: например, сломанный JSON.'],
      ['401', 'Unauthorized', 'Требуется корректная аутентификация: токена нет или он недействителен.'],
      ['403', 'Forbidden', 'Клиент известен, но эта операция ему запрещена.'],
      ['404', 'Not Found', 'Ресурса с таким адресом нет.'],
      ['409', 'Conflict', 'Запрос противоречит текущему состоянию ресурса.'],
      ['422', 'Unprocessable Content', 'JSON корректен, но данные не проходят проверку схемы.'],
      ['429', 'Too Many Requests', 'Клиент превысил допустимую частоту запросов.'],
    ]) + takeaway('<code>401</code> и <code>403</code> имеют разный смысл: в первом случае сервер не знает, кто перед ним, во втором знает и отказывает.'),
  },
  // 31
  {
    title: '5xx — сервер не смог выполнить корректный запрос',
    intro: 'Коды 5xx означают, что запрос был корректным, но сервер не справился.',
    body: split(
      code('500 Internal Server Error') +
      text('<p>Этот код не должен заменять любое исключение, которое можно корректно классифицировать. Если ресурса нет, это <code>404</code>, а не падение сервера.</p><p>Клиент также не должен получать:</p>') +
      list(['Python traceback;', 'SQL query;', 'пароль;', 'filesystem path.']),
      chain(['CLIENT|получает 500 и публичное описание ошибки', '*SERVER', '~LOGS|traceback и технические подробности']) +
      takeaway('Внутренние детали должны оставаться на сервере: по ним злоумышленник узнаёт устройство системы.')
    ),
  },
  // 32
  {
    title: 'Формат body тоже является частью контракта',
    intro: 'Одни и те же байты можно прочитать по-разному. Заголовок Content-Type сообщает, как интерпретировать тело.',
    body: split(
      code('Content-Type: application/json', 'в request') + note('Сообщает серверу формат отправленного тела.') +
      code('Content-Type: application/json', 'в response') + note('Сообщает клиенту формат ответа.') +
      code('Content-Type: application/problem+json', 'для ошибок') + note('Этот формат стандартизированных ошибок разберём позже в этой теме.'),
      chain(['BODY', '*MEDIA TYPE', 'INTERPRETABLE MESSAGE|сообщение, которое программа может разобрать'])
    ),
  },
  // 33
  {
    title: 'Стиль JSON необходимо зафиксировать',
    intro: 'Команда выбирает единый стиль имён и применяет его последовательно во всех ресурсах.',
    body: split(
      code('{\n  "ticket_id": 42,\n  "created_at": "2026-09-15T17:30:00Z"\n}', 'наш проект: snake_case') +
      text('<p>Другая организация может стандартизировать <code>camelCase</code>. Ошибкой будет не выбор стиля, а смешение: <code>created_at</code> в одном ответе и <code>updatedAt</code> в соседнем.</p>'),
      table(['Стиль', 'Пример'], [['snake_case', '<code>created_at</code>'], ['camelCase', '<code>createdAt</code>']]) +
      takeaway('Выбрать один стиль. Главное — единообразие внутри API ecosystem.')
    ),
  },
  // 34
  {
    title: 'Сначала API — потом код',
    intro: 'Для Service Desk фиксируем операции до того, как напишем первую строку реализации.',
    body: split(
      table(['Endpoint', 'Назначение', 'Успех'], [
        [`${m('GET')} <code>/api/v1/tickets</code>`, 'список обращений', '200'],
        [`${m('POST')} <code>/api/v1/tickets</code>`, 'создать обращение', '201'],
        [`${m('GET')} <code>/api/v1/tickets/{ticket_id}</code>`, 'одно обращение', '200'],
        [`${m('PATCH')} <code>/api/v1/tickets/{ticket_id}</code>`, 'изменить поля', '200'],
        [`${m('DELETE')} <code>/api/v1/tickets/{ticket_id}</code>`, 'удалить', '204'],
      ]),
      text('<p>Для каждого endpoint определите:</p>') + list(['request: параметры и тело;', 'success response;', 'error responses;', 'authentication.']) +
      answer('После работы → как это решено в учебном проекте', table(['Endpoint', 'Ошибки', 'Токен'], [
        ['GET /tickets', '422', 'нет'], ['POST /tickets', '401, 403, 422', 'да'], ['GET /tickets/{id}', '404, 422', 'нет'], ['PATCH /tickets/{id}', '401, 403, 404, 422', 'да'], ['DELETE /tickets/{id}', '401, 403, 404, 422', 'да'],
      ]))
    ),
  },
  // 35
  {
    title: 'Найдите нарушения самостоятельно',
    intro: 'Перед вами контракт другой команды. Сначала найдите нарушения сами, затем запустите проверку правилами.',
    body: split(
      text('<p>Необходимо определить:</p>') + list(['где действие помещено в URI;', 'где неверно выбран HTTP method;', 'где identifier логичнее сделать path parameter;', 'где контракт непоследователен.']),
      note('Проверка использует те же имена правил, что и <code>.spectral.yaml</code> учебного проекта, и печатает результат в формате Spectral. Текст можно исправлять и проверять снова.')
    ) + lint('GET  /getTickets\nPOST /ticket/delete\nGET  /createUser\nPOST /tickets?id=12'),
  },
  // 36
  {
    title: 'Что мы уже собрали',
    intro: 'Теперь у нас есть вся цепочка обмена между клиентом и сервером.',
    body: split(
      chain(['CLIENT', 'HTTP REQUEST', '*RESOURCE URI + HTTP METHOD', 'SERVER', '*HTTP STATUS + HEADERS + JSON', 'CLIENT'], 'compact'),
      text('<p>Каждое звено этой цепочки подчиняется правилам: метод выбирается по семантике HTTP, адрес описывает ресурс, код сообщает фактический результат, тело имеет объявленный формат.</p>') +
      takeaway('Следующая проблема — как формально описать этот контракт.')
    ),
  },
  // 37
  {
    title: 'README может перестать соответствовать коду',
    intro: 'Документация, которую пишут вручную, отстаёт от кода при первом же изменении, о котором забыли.',
    body: split(
      text('<p>Документация говорит, что <code>POST /tickets</code> принимает:</p>') + code('{\n  "title": "..."\n}', 'README.md') +
      text('<p>Разработчик добавляет обязательное поле <code>description</code>, но README не обновляет. Клиенты отправляют запрос по документации и получают <code>422</code>.</p>'),
      `<div class="card bad"><small>результат</small><h3 class="big">CODE ≠ DOCUMENTATION</h3><p>Такое состояние называется <strong>API documentation drift</strong> — расхождение документации и реализации.</p></div>` +
      chain(['CODE|description обязателен', '*mismatch', 'DOCS|только title'])
    ),
  },
  // 38
  {
    title: 'Машиночитаемое описание HTTP API',
    intro: 'OpenAPI Specification определяет стандартный формат описания HTTP API.',
    body: split(
      text('<p>В документе OpenAPI можно описать:</p>') + list(['endpoints и operations;', 'parameters;', 'request bodies;', 'responses;', 'schemas;', 'authentication;', 'metadata.'], 'cols') +
      takeaway('OpenAPI предназначен одновременно для людей и программ: по нему строится документация, генерируется клиентский код и проверяются запросы.'),
      shot('38-openapi-specification.png', 'spec.openapis.org · OAS 3.2.0', 'OpenAPI Specification v3.2.0: определение — «programming language-agnostic interface description for HTTP APIs».'),
      'wide-right'
    ),
  },
  // 39
  {
    title: 'OpenAPI 3.2 и OpenAPI 3.1 — не одно и то же',
    intro: 'Спецификация развивается, а фреймворки поддерживают её редакции с задержкой.',
    body: split(
      `<div class="versions" style="grid-template-columns:1fr 1fr"><div><small>последняя редакция OAS</small><strong>3.2.1</strong><p>опубликована 10 сентября 2026 года</p></div><div><small>генерирует FastAPI 0.115</small><strong>3.1.0</strong><p>поле <code>openapi</code> в <code>/openapi.json</code></p></div></div>` +
      text('<p>Минорная версия 3.2 вышла 19 сентября 2025 года (3.2.0), а 10 сентября 2026 года опубликовано исправление 3.2.1. При этом FastAPI по умолчанию генерирует:</p>') +
      code('{\n  "openapi": "3.1.0"\n}') +
      takeaway('Это не означает, что API «неправильный». Framework может поддерживать не самую новую опубликованную версию спецификации.'),
      shot('38b-openapi-latest.png', 'spec.openapis.org · latest', 'Страница последней редакции: OpenAPI Specification v3.2.1, Published 10 September 2026.')
    ),
  },
  // 40
  {
    title: 'Swagger и OpenAPI нельзя считать синонимами',
    intro: 'Путаница историческая: до 2016 года спецификация называлась Swagger Specification.',
    body: cards([
      ['формат', 'OpenAPI Specification', 'Стандарт описания API. Развивается OpenAPI Initiative. Файл <code>openapi.json</code> или <code>openapi.yaml</code> — документ в этом формате.', 'accent'],
      ['инструменты', 'Swagger', 'Набор инструментов компании SmartBear, которые работают с документами OpenAPI: редактор, интерфейс документации, генераторы кода.', 'good'],
    ], 'two') + takeaway('Документация Swagger прямо разделяет эти понятия: OpenAPI — спецификация, Swagger — инструменты для работы с ней.'),
  },
  // 41
  {
    title: 'Что входит в экосистему Swagger',
    intro: 'Каждый инструмент решает свою задачу, и все читают один и тот же документ OpenAPI.',
    body: split(
      table(['Инструмент', 'Назначение'], [
        ['Swagger Editor', 'редактирование описания с проверкой в реальном времени'],
        ['<strong>Swagger UI</strong>', 'интерактивная документация в браузере'],
        ['Swagger Codegen', 'генерация клиентов и заготовок сервера'],
        ['Swagger Core', 'получение описания из Java-кода'],
        ['Swagger Parser', 'разбор и валидация документа OpenAPI'],
      ]) + note('Для нашего занятия особенно важен Swagger UI: он читает OpenAPI schema и строит страницу, с которой можно отправлять запросы.'),
      chain(['openapi.json', '*Swagger UI', 'interactive documentation'])
    ),
  },
  // 42
  {
    title: 'OpenAPI document имеет стандартную структуру',
    intro: 'Каждая часть верхнего уровня отвечает за отдельный слой API contract.',
    body: split(
      code('openapi:\ninfo:\nservers:\ntags:\npaths:\ncomponents:\nsecurity:', 'упрощённо'),
      table(['Раздел', 'Что описывает'], [
        ['<code>openapi</code>', 'редакцию спецификации'],
        ['<code>info</code>', 'название, версию, владельца API'],
        ['<code>servers</code>', 'адреса, где API доступен'],
        ['<code>tags</code>', 'группы операций'],
        ['<code>paths</code>', 'адреса и операции'],
        ['<code>components</code>', 'переиспользуемые схемы'],
        ['<code>security</code>', 'требования аутентификации'],
      ]) + note('Далее разбираем разделы по отдельности.')
    ),
  },
  // 43
  {
    title: 'API должно представиться',
    intro: 'Раздел info отвечает на вопросы, что это за API, какая версия контракта и кто его поддерживает.',
    body: split(
      code('info:\n  ⟦title⟧: Service Desk API\n  ⟦version⟧: 1.0.0\n  ⟦description⟧: API для работы с обращениями\n  ⟦contact⟧:\n    name: API Team', 'openapi.yaml'),
      table(['Поле', 'Отвечает на вопрос'], [['title', 'что это за API'], ['version', 'какая версия контракта'], ['description', 'для чего он нужен'], ['contact', 'кто его поддерживает']]) +
      note('Zalando API Guidelines требуют указывать в спецификации title, version, description и контакты владельца API.')
    ),
  },
  // 44
  {
    title: 'Где доступен API',
    intro: 'В OpenAPI можно зафиксировать адреса серверов.',
    body: split(
      code('servers:\n  - url: https://api.example.com/api/v1\n    description: Production\n\n  - url: https://stage-api.example.com/api/v1\n    description: Staging', 'openapi.yaml'),
      tree('<b>OPENAPI</b>\n├─ Production\n└─ Staging') +
      text('<p>Это особенно важно при разделении production и test environments: Swagger UI покажет список серверов, и тестовый запрос не уйдёт случайно в боевую систему.</p>')
    ),
  },
  // 45
  {
    title: 'Endpoints необходимо группировать',
    intro: 'Большой API нельзя оставлять одной длинной лентой операций.',
    body: split(
      text('<p>Группы называются по предметной области:</p>') + code('Tickets\nUsers\nAuthentication\nReports') +
      text('<p>В FastAPI группа задаётся параметром <code>tags</code> роутера:</p>') + code('router = APIRouter(\n    prefix="/tickets",\n    ⟦tags=["Tickets"]⟧,\n)', 'app/api/v1/endpoints/tickets.py'),
      shot('45-swagger-tags.png', 'Swagger UI · /docs', 'Swagger UI группирует операции по tag: заголовок группы Tickets с описанием из openapi_tags.'),
      'wide-right'
    ),
  },
  // 46
  {
    title: 'paths описывает ресурсы',
    intro: 'Раздел paths перечисляет адреса, а внутри каждого адреса — допустимые методы.',
    body: split(
      code('paths:\n  /tickets:\n    get:\n    post:\n\n  /tickets/{ticket_id}:\n    get:\n    patch:\n    delete:', 'openapi.yaml'),
      tree('<b>paths</b>\n├── /tickets\n│   ├── GET\n│   └── POST\n└── /tickets/{ticket_id}\n    ├── GET\n    ├── PATCH\n    └── DELETE') +
      note('По <code>paths</code> видна вся структура HTTP interface: какие ресурсы есть и что с каждым можно сделать.')
    ),
  },
  // 47
  {
    title: 'Каждый method внутри path — отдельная operation',
    intro: 'Operation — это описание одного метода на одном адресе.',
    body: split(
      code('post:\n  summary: Создать обращение\n  description: Регистрирует новое обращение\n  ⟦operationId: createTicket⟧\n  tags: [Tickets]\n  parameters: []\n  requestBody: ...\n  responses: ...', 'operation'),
      table(['Поле', 'Назначение'], [
        ['summary', 'короткое название в списке'],
        ['description', 'подробное объяснение'],
        ['operationId', 'уникальный идентификатор операции'],
        ['tags', 'группа'],
        ['parameters', 'параметры пути, query, заголовков'],
        ['requestBody', 'тело запроса'],
        ['responses', 'возможные ответы'],
      ]) + note('<code>operationId</code> должен быть уникальным и желательно стабильным: генераторы SDK превращают его в имя метода, например <code>client.createTicket()</code>.')
    ),
  },
  // 48
  {
    title: 'OpenAPI различает расположение параметров',
    intro: 'Параметр может находиться в одном из четырёх мест HTTP-запроса. Поле in указывает, в каком.',
    body: split(
      code('GET /api/v1/tickets/⟦{ticket_id}⟧?⟦limit=20⟧\n⟦Authorization: Bearer TOKEN⟧\n⟦Cookie: session=abc⟧', 'HTTP request'),
      table(['in', 'Пример'], [
        ['<code>path</code>', '<code>ticket_id</code>'],
        ['<code>query</code>', '<code>limit</code>'],
        ['<code>header</code>', '<code>Authorization</code> — в OpenAPI описывается через security'],
        ['<code>cookie</code>', '<code>session</code>'],
      ]) + note('Зная место параметра, Swagger UI и сгенерированные клиенты сами собирают правильный запрос.')
    ),
  },
  // 49
  {
    title: 'Body тоже имеет формальную схему',
    intro: 'Для POST /tickets контракт описывает, какое тело клиент обязан прислать.',
    body: split(
      code('{\n  "title": "Не работает VPN",\n  "description": "Ошибка подключения"\n}', 'POST /tickets') +
      text('<p>OpenAPI описывает:</p>') + list(['media type;', 'schema;', 'required fields;', 'types;', 'validation;', 'examples.'], 'cols'),
      chain(['requestBody', 'application/json', '*TicketCreate|схема в components']) +
      note('В учебном проекте <code>title</code> обязателен и содержит от 3 до 120 символов. Запрос без него получит <code>422</code> ещё до вызова функции.')
    ),
  },
  // 50
  {
    title: 'Документируется не только успешный ответ',
    intro: 'Клиенту нужно знать все ответы, которые он может получить, иначе он не напишет их обработку.',
    body: split(
      text('<p>Для <code>GET /tickets/{ticket_id}</code> недостаточно описать только <code>200</code>. Контракт должен учитывать:</p>') +
      status([['200', 'OK', ''], ['404', 'Not Found', ''], ['422', 'Validation Error', '']]) +
      text('<p>Для защищённого endpoint также:</p>') + status([['401', 'Unauthorized', ''], ['403', 'Forbidden', '']]),
      tree('<b>REQUEST</b>\n├─ 200\n├─ 401\n├─ 404\n└─ 422')
    ),
  },
  // 51
  {
    title: 'Повторяющиеся схемы следует переиспользовать',
    intro: 'Вместо копирования одной модели во все operations OpenAPI позволяет создать reusable components.',
    body: split(
      code('components:\n  schemas:\n    Ticket:\n    TicketCreate:\n    TicketUpdate:\n    ProblemDetails:', 'openapi.yaml') +
      code('responses:\n  "200":\n    content:\n      application/json:\n        schema:\n          ⟦$ref: "#/components/schemas/Ticket"⟧', 'operation'),
      chain(['GET · POST · PATCH', '*$ref', 'Ticket schema|описана один раз']) +
      note('Если в <code>Ticket</code> появится поле, оно сразу окажется во всех ответах, которые на неё ссылаются.')
    ),
  },
  // 52
  {
    title: 'Механизм авторизации должен быть описан',
    intro: 'Схема безопасности объявляется один раз в components и подключается к операциям.',
    body: split(
      code('components:\n  securitySchemes:\n    BearerAuth:\n      type: http\n      scheme: bearer', 'Bearer authentication') +
      text('<p>После этого документация показывает кнопку <strong>Authorize</strong>, и Swagger UI сам передаёт заголовок <code>Authorization</code> в запросах.</p>') +
      note('Zalando API Guidelines показывают Bearer security scheme в OpenAPI как основной способ защиты endpoints.'),
      chain(['CLIENT', '*Authorization: Bearer TOKEN', 'API'])
    ),
  },
  // 53
  {
    title: 'Схема отвечает «что допустимо», example — «как это выглядит»',
    intro: 'Описание типа полезно, но пример с настоящими данными понимается быстрее.',
    body: split(
      code('title:\n  type: string\n  minLength: 3', 'schema') + code('{\n  "title": "Не работает VPN"\n}', 'example'),
      table(['Schema', 'Example'], [['string', '"Не работает VPN"'], ['string, format: date-time', '"2026-09-15T17:30:00Z"'], ['enum: open, in_progress, closed', '"open"']]) +
      takeaway('Хороший контракт содержит реальные и осмысленные examples, а не <code>"string"</code> в каждом поле.')
    ),
  },
  // 54
  {
    title: 'FastAPI строит OpenAPI из Python-кода',
    intro: 'FastAPI читает маршруты, аннотации типов и модели Pydantic и сам собирает документ OpenAPI.',
    body: split(
      table(['Адрес', 'Что открывается'], [
        ['<code>/docs</code>', 'Swagger UI'],
        ['<code>/redoc</code>', 'ReDoc'],
        ['<code>/openapi.json</code>', 'OpenAPI schema'],
      ]) + text('<p>Эти адреса есть у приложения по умолчанию. Схема строится при первом обращении и совпадает с кодом, потому что получена из него.</p>'),
      chain(['Python code', '*FastAPI', 'openapi.json', 'Swagger UI · ReDoc'])
    ),
  },
  // 55
  {
    title: 'Открываем интерактивную документацию',
    intro: 'Запускаем учебный проект и открываем Swagger UI.',
    body: split(
      code('pip install -r requirements.txt\nuvicorn app.main:app --reload', 'терминал, папка api-standard-template') +
      text('<p>В браузере перейти:</p>') + code('http://127.0.0.1:8000/docs') +
      olist(['Найти группу <code>Tickets</code>.', 'Раскрыть <code>GET /api/v1/tickets</code>.', 'Сверить название API и версию <code>1.0.0</code> в шапке.']),
      shot('55-swagger-ui.png', 'Swagger UI · /docs', 'Шапка Service Desk API с версией 1.0.0 и отметкой OAS 3.1, группа Tickets, раскрытая операция GET /api/v1/tickets.'),
      'wide-right'
    ),
  },
  // 56
  {
    title: 'Swagger UI не является источником контракта',
    intro: 'Swagger UI только отображает документ. Сам контракт — JSON по адресу /openapi.json.',
    body: split(
      code('http://127.0.0.1:8000/openapi.json') +
      olist(['Найти <code>"openapi": "3.1.0"</code>.', 'Найти <code>"info"</code> с названием и версией.', 'Найти <code>"paths"</code> со всеми адресами.']) +
      takeaway('Swagger UI является визуальным представлением этого документа.') +
      note('Если JSON отображается одной строкой, включите в Chrome флажок «Автоформатировать» над текстом.'),
      shot('56-openapi-json.png', 'Chrome · /openapi.json', 'OpenAPI schema учебного проекта с автоформатированием: выделены "openapi": "3.1.0", "info" и "paths".'),
      'wide-right'
    ),
  },
  // 57
  {
    title: 'Один OpenAPI — разные интерфейсы документации',
    intro: 'Открываем тот же контракт в другом интерфейсе и сравниваем.',
    body: split(
      code('http://127.0.0.1:8000/redoc') +
      text('<p>ReDoc показывает навигацию слева, описание в центре и примеры ответов справа. Отправлять запросы из него нельзя, зато длинный API удобнее читать.</p>') +
      takeaway('Обе системы получают данные из одного API contract. Разница только в способе отображения.') +
      `<p class="warn-box"><strong>Если /redoc пустой.</strong> FastAPI 0.115 подключает скрипт ReDoc по тегу <code>redoc@next</code>, а CDN по этому тегу больше не отдаёт файл. В учебном проекте версия закреплена явно: <code>redoc@2.5.4</code> в <code>app/main.py</code>.</p>`,
      shot('57-redoc.png', 'ReDoc · /redoc', 'ReDoc с Service Desk API: левая навигация, описание операции «Получить список обращений», примеры ответов 200 и 422.'),
      'wide-right'
    ),
  },
  // 58
  {
    title: 'Документируем API на уровне приложения',
    intro: 'Метаданные задаются параметрами конструктора FastAPI в файле app/main.py.',
    body: split(
      code('app = FastAPI(\n    title="Service Desk API",\n    version="1.0.0",\n    summary="Учебный стандартизированный REST API",\n    description=API_DESCRIPTION,\n    contact={\n        "name": "API Team",\n        "email": "api-team@example.edu",\n    },\n)', 'app/main.py') +
      note('После сохранения файла сервер с флагом <code>--reload</code> перезапустится сам. Обновите <code>/docs</code>.'),
      shot('58-swagger-metadata.png', 'Swagger UI · шапка', 'Каждый параметр конструктора виден в Swagger UI: title, version, summary, description и контакт API Team.')
    ),
  },
  // 59
  {
    title: 'Endpoint должен объяснять своё назначение',
    intro: 'Аргументы декоратора маршрута становятся полями operation в OpenAPI.',
    body: split(
      code('@router.get(\n    "",\n    ⟦response_model=TicketPage⟧,\n    ⟦summary="Получить список обращений"⟧,\n    description="Возвращает страницу обращений...",\n    ⟦operation_id="listTickets"⟧,\n)\ndef list_tickets(...) -> TicketPage:\n    ...', 'app/api/v1/endpoints/tickets.py') +
      table(['Аргумент', 'Поле OpenAPI'], [['response_model', 'schema ответа 200'], ['summary', 'summary'], ['operation_id', 'operationId']]),
      shot('59-swagger-operation.png', 'Swagger UI · listTickets', 'Раскрытая операция: summary рядом с путём, описание, параметры и ответ 200 со схемой TicketPage.')
    ),
  },
  // 60
  {
    title: 'Одной модели недостаточно',
    intro: 'Создание, изменение и ответ описываются разными схемами, потому что содержат разные поля.',
    body: split(
      code('class TicketCreate(BaseModel):\n    model_config = ConfigDict(⟦extra="forbid"⟧)\n    title: str = Field(min_length=3, max_length=120)\n    description: str = ""\n\nclass TicketUpdate(BaseModel):\n    title: str | None = None\n    description: str | None = None\n    status: TicketStatus | None = None\n\nclass Ticket(BaseModel):\n    ⟦id: UUID⟧\n    title: str\n    description: str\n    status: TicketStatus\n    ⟦created_at: datetime⟧\n    ⟦updated_at: datetime⟧', 'app/schemas.py (сокращено)'),
      table(['Где', 'Схема'], [['POST request', 'TicketCreate'], ['PATCH request', 'TicketUpdate'], ['Response', 'Ticket'], ['Список', 'TicketPage']]) +
      text('<p>Клиент не должен передавать <code>id</code> при создании: его формирует сервер. Благодаря <code>extra="forbid"</code> запрос с лишним полем <code>id</code> получит <code>422</code>, это проверяет тест <code>test_client_cannot_send_id</code>.</p>')
    ),
  },
  // 61
  {
    title: 'Каждый endpoint не должен придумывать свой error JSON',
    intro: 'Когда формат ошибки выбирает каждый разработчик сам, клиенту приходится писать отдельный разбор для каждого endpoint.',
    body: `<div class="cards">${[['endpoint 1', '{"error": "not found"}'], ['endpoint 2', '{"message": "User missing"}'], ['endpoint 3', '{"status": false}']].map(([s, j]) => `<article class="card bad"><small>${s}</small>${code(j)}</article>`).join('')}</div>` +
      split(text('<p>Три разных JSON приходят одному клиенту. В первом текст ошибки в поле <code>error</code>, во втором — в <code>message</code>, в третьем текста нет вовсе, а <code>status</code> означает не код, а успех.</p>'), takeaway('Нужен единый error contract.')),
  },
  // 62
  {
    title: 'RFC 9457 стандартизирует описание ошибок HTTP API',
    intro: 'RFC 9457 определяет формат Problem Details. Он заменил более старый RFC 7807.',
    body: split(
      code('Content-Type: application/problem+json', 'для JSON') +
      table(['Поле', 'Смысл'], [
        ['<code>type</code>', 'URI вида проблемы'],
        ['<code>title</code>', 'краткое описание вида'],
        ['<code>status</code>', 'HTTP status code'],
        ['<code>detail</code>', 'что произошло в этом запросе'],
        ['<code>instance</code>', 'где именно возникла проблема'],
      ]),
      shot('62-rfc9457-problem-details.png', 'rfc-editor.org · RFC 9457', 'RFC 9457, раздел 3: пример ответа 403 Forbidden с Content-Type: application/problem+json.'),
      'wide-right'
    ),
  },
  // 63
  {
    title: 'Применяем единый error contract',
    intro: 'Так учебный проект отвечает на запрос несуществующего обращения.',
    body: split(
      code('{\n  "type": "https://maximbytecamp.github.io/api-standard-template/problems/http-404",\n  "title": "Resource not found",\n  "status": 404,\n  "detail": "Ticket ... does not exist",\n  "instance": "/api/v1/tickets/..."\n}', '404 · application/problem+json'),
      table(['Поле', 'Для чего клиенту'], [
        ['type', 'ветвить обработку: по нему, а не по тексту, программа узнаёт вид ошибки'],
        ['title', 'показать человеку общий заголовок'],
        ['status', 'не читать заголовки, если тело сохранено в лог'],
        ['detail', 'показать подробность конкретного случая'],
        ['instance', 'найти запрос в логах сервера'],
      ]) + takeaway('Клиент знает структуру ошибки независимо от endpoint.') +
      note('Все обработчики лежат в <code>app/problems.py</code>. Там же ошибки валидации 422 получают дополнительное поле <code>errors</code> со списком неверных полей.')
    ),
  },
  // 64
  {
    title: 'Вызываем отсутствующий ресурс',
    intro: 'Проверяем контракт ошибок в Swagger UI.',
    body: split(
      olist(['Открыть <code>GET /api/v1/tickets/{ticket_id}</code>.', 'Нажать <strong>Try it out</strong>.', 'Ввести UUID отсутствующего объекта, например <code>3f2b8c1e-5d4a-4e7b-9c6f-0a1b2c3d4e5f</code>.', 'Нажать <strong>Execute</strong>.']) +
      text('<p>Ожидаемый результат:</p>') + code('404\napplication/problem+json'),
      shot('64-swagger-404.png', 'Swagger UI · Execute', 'Request URL, код ответа 404, тело Problem Details с полем type и заголовок content-type: application/problem+json.'),
      'wide-right'
    ),
  },
  // 65
  {
    title: 'Если Problem Details не появляется',
    intro: 'Проверяйте по порядку: каждая следующая проверка имеет смысл, только если предыдущая пройдена.',
    body: split(
      olist([
        'Правильный ли endpoint указан в запросе.',
        'Действительно ли ресурс отсутствует.',
        'Зарегистрирован ли exception handler: <code>register_problem_handlers(app)</code>.',
        'Сохранён ли файл.',
        'Перезапустился ли development server.',
        'Правильный ли HTTP status code вернулся.',
        'Возвращается ли <code>application/problem+json</code> в заголовке.',
        'Обновилась ли OpenAPI schema в <code>/openapi.json</code>.',
      ]),
      chain(['endpoint', 'ресурс', 'handler', 'файл сохранён', 'сервер перезапущен', 'status code', 'content-type', '*schema'], 'compact')
    ),
  },
  // 66
  {
    title: 'API нельзя бесконечно менять без правил',
    intro: 'Изменение, безобидное для сервера, может сломать клиента, о котором разработчик не знает.',
    body: split(
      code('{\n  "id": 10,\n  "title": "..."\n}', 'сегодня') +
      text('<p>Завтра разработчик решает переименовать <code>title → subject</code>. Старый клиент продолжает искать <code>title</code>, получает пустое значение, и интеграция ломается.</p>') +
      takeaway('Для этого нужны правила совместимости и versioning.'),
      chain(['API v1|title', '*rename', 'API changed|subject', 'OLD CLIENT ✕'])
    ),
  },
  // 67
  {
    title: 'Не путайте четыре разных номера',
    intro: 'В одном проекте одновременно живут четыре независимых номера версии.',
    body: `<div class="versions">
      <div><small>OpenAPI Specification version</small><strong>3.1.0</strong><p>редакция формата, которым описан контракт</p></div>
      <div><small>API contract version</small><strong>1.4.2</strong><p>состояние публичного контракта, <code>info.version</code></p></div>
      <div><small>Runtime major API version</small><strong>/api/v1</strong><p>несовместимая редакция, с которой работает клиент</p></div>
      <div><small>Deployment version</small><strong>4ab219…</strong><p>commit, из которого собран запущенный код</p></div></div>` +
      takeaway('Это независимые сущности. <code>openapi: 3.1.0</code> не означает API version 3.1.'),
  },
  // 68
  {
    title: 'Версию контракта удобно вести как MAJOR.MINOR.PATCH',
    intro: 'Semantic Versioning по номеру сразу сообщает, насколько опасно обновление.',
    body: split(
      tree('<b>1 . 4 . 2</b>\n│   │   └ PATCH\n│   └──── MINOR\n└──────── MAJOR'),
      table(['Часть', 'Когда увеличивается'], [
        ['MAJOR', 'несовместимое изменение'],
        ['MINOR', 'совместимая новая функциональность'],
        ['PATCH', 'совместимое исправление'],
      ]) + note('Zalando API Guidelines прямо требуют Semantic Versioning для <code>info.version</code>.')
    ),
  },
  // 69
  {
    title: 'Что может сломать существующего клиента',
    intro: 'Breaking change — изменение, после которого клиент, написанный по старому контракту, перестаёт работать.',
    body: split(
      `<div class="card bad"><small>breaking</small>${list(['удалить endpoint;', 'переименовать endpoint;', 'удалить response field;', 'переименовать field;', 'изменить тип field;', 'добавить обязательный parameter;', 'изменить authentication requirements.'])}</div>`,
      `<div class="card good"><small>non-breaking</small>${list(['добавить endpoint;', 'добавить optional parameter;', 'добавить response field;', 'добавить response header.'])}</div>` +
      note('GitHub относит именно такие изменения к breaking changes своего REST API — список виден на кадре слайда 72.')
    ),
  },
  // 70
  {
    title: 'Не каждое изменение требует новой major version',
    intro: 'Additive changes только добавляют возможности и не отнимают существующие.',
    body: split(
      table(['Additive change', 'Почему старый клиент не ломается'], [
        ['новый endpoint', 'старый клиент его не вызывает'],
        ['новый optional parameter', 'без него запрос работает как раньше'],
        ['новый response field', 'клиент читает только известные ему поля'],
        ['новый response header', 'неизвестные заголовки игнорируются'],
      ]) + `<p class="warn-box">Добавление поля безопасно, только если клиенты игнорируют неизвестные поля. Поэтому конкретная организация должна сама формально определить свою compatibility policy.</p>`,
      chain(['OLD CLIENT', 'NEW API', '*✓'])
    ),
  },
  // 71
  {
    title: 'Наш учебный API использует major version в path',
    intro: 'Мажорная версия записана прямо в адресе.',
    body: split(
      code('/api/v1/tickets') + text('<p>При действительно несовместимом redesign может появиться:</p>') + code('/api/v2/tickets') +
      text('<p>Это простой и хорошо заметный клиенту способ versioning: версия видна в любом логе и ссылке. Так же поступает Microsoft Graph (<code>/v1.0</code>, <code>/beta</code>), а Azure в той же компании передаёт версию query-параметром <code>api-version</code> — это разобрано на слайде 105.</p>'),
      table(['Адрес', 'Кто работает'], [['<code>/api/v1</code>', 'OLD CLIENTS'], ['<code>/api/v2</code>', 'NEW CLIENTS']]) +
      note('Обе редакции работают одновременно, пока старые клиенты не перейдут на новую.')
    ),
  },
  // 72
  {
    title: 'URL path — не единственный вариант',
    intro: 'GitHub REST API использует версии, названные по дате выпуска, и передаёт их в заголовке.',
    body: split(
      code('X-GitHub-Api-Version: 2026-03-10', 'заголовок запроса') +
      text('<p>Breaking changes выходят только в новой API version, а совместимые изменения попадают во все поддерживаемые версии. Если заголовка нет, GitHub использует версию по умолчанию.</p>') +
      takeaway('Versioning strategy — инженерное решение конкретной системы, а не обязательный <code>/v1</code> для всех API.'),
      shot('72-github-api-versions.png', 'docs.github.com · API Versions', 'GitHub Docs: текущая версия 2026-03-10 и список изменений, которые GitHub считает breaking. Пример с заголовком — ниже, в разделе «Specifying an API version».'),
      'wide-right'
    ),
  },
  // 73
  {
    title: 'Старое API сначала объявляется устаревшим',
    intro: 'Нельзя просто удалить endpoint, который используют клиенты. Удаление проходит несколько стадий.',
    body: `<div class="timeline"><div>ACTIVE<small>работает</small></div><div>DEPRECATED<small>объявлен устаревшим</small></div><div>MIGRATION PERIOD<small>клиенты переходят</small></div><div>SUNSET<small>дата отключения</small></div><div>REMOVED<small>удалён</small></div></div>` +
      split(
        text('<p>OpenAPI позволяет отметить operation:</p>') + code('get:\n  operationId: listTicketsOld\n  ⟦deprecated: true⟧\n  description: Используйте GET /api/v2/tickets'),
        text('<p>Swagger UI зачёркивает такую операцию. Zalando API Guidelines требуют отражать deprecation непосредственно в API specification и описывать путь миграции.</p>')
      ),
  },
  // 74
  {
    title: 'Изменения публичного контракта должны иметь историю',
    intro: 'Файл CHANGELOG.md перечисляет изменения, которые касаются потребителей API.',
    body: split(
      code('## [1.1.0]\n\n### Added\n\n- GET /api/v1/tickets/{id}/comments\n- optional status filter\n\n### Deprecated\n\n- field old_status', 'CHANGELOG.md'),
      text('<p>Разделы <code>Added</code>, <code>Changed</code>, <code>Deprecated</code>, <code>Removed</code>, <code>Fixed</code>, <code>Security</code> взяты из соглашения Keep a Changelog.</p>') +
      takeaway('Changelog предназначен для потребителя API, а не только для разработчика. Рефакторинг, который не меняет контракт, туда не пишут.')
    ),
  },
  // 75
  {
    title: 'Архитектурное решение тоже является документом',
    intro: 'ADR (Architecture Decision Record) — короткий документ об одном принятом решении.',
    body: split(
      code('docs/adr/0001-api-versioning.md') +
      tree('<b>ADR</b>\n├─ Context       <em>что вынудило решать</em>\n├─ Decision      <em>что решили</em>\n└─ Consequences  <em>чем за это платим</em>') +
      text('<p>Например: <strong>почему мы выбрали <code>/api/v1</code>, а не custom header?</strong> Через год разработчик увидит не только решение, но и причину его появления.</p>'),
      code('## Decision\n\nМажорная версия указывается в пути: /api/v1.\nВерсия контракта ведётся по Semantic\nVersioning в info.version.\n\n## Consequences\n\n- Версия видна в любом логе и ссылке.\n- Нельзя выпустить несовместимое изменение\n  одной операции, не выпуская /api/v2 целиком.', 'docs/adr/0001-api-versioning.md (фрагмент)', 'small')
    ),
  },
  // 76
  {
    title: 'Команда должна формально записать свои правила',
    intro: 'API Style Guide — внутренний стандарт проекта, файл docs/API_STYLE_GUIDE.md.',
    body: split(
      code('URI MUST use nouns.\n\nGET MUST NOT change business state.\n\nPublic operations MUST define operationId.\n\nErrors SHOULD use application/problem+json.\n\nCollections MUST support pagination\nwhen their size is unbounded.', 'примеры правил'),
      tree('<b>API_STYLE_GUIDE.md</b>\n├─ URI\n├─ HTTP\n├─ JSON\n├─ Errors\n├─ Versioning\n└─ Security') +
      note('В учебном проекте после каждого правила указано, чем оно проверяется автоматически: правилом Spectral или тестом.')
    ),
  },
  // 77
  {
    title: 'У правил должна быть сила требования',
    intro: 'В инженерных спецификациях сила требования обозначается ключевыми словами из RFC 2119.',
    body: split(
      `<div class="strength"><div><b>MUST</b><span>обязательно; MUST NOT — обязательно не делать</span></div><div><b>SHOULD</b><span>рекомендуется; отступление нужно обосновать</span></div><div><b>MAY</b><span>допускается по выбору команды</span></div></div>`,
      code('Every operation MUST have operationId.\n\nEndpoints SHOULD provide examples.\n\nClients MAY request up to 100 items.') +
      text('<p>Так документ становится менее двусмысленным: «желательно добавить пример» и «нужно добавить operationId» больше не читаются одинаково.</p>') +
      note('Zalando и adidas используют этот подход в своих API guidelines.')
    ),
  },
  // 78
  {
    title: 'Style Guide недостаточно просто написать',
    intro: 'Если в компании 100 API, человек не сможет вручную проверять каждую строку каждого OpenAPI.',
    body: split(
      text('<p>Правило, которое проверяют только на review, рано или поздно пропустят. Поэтому часть правил переводится в форму, понятную программе.</p>') +
      takeaway('Один из популярных инструментов — Spectral.'),
      chain(['API STYLE GUIDE|.md для людей', '*MACHINE RULES|.yaml для программы', 'LINTER|проверяет каждый коммит'])
    ),
  },
  // 79
  {
    title: 'Linter для OpenAPI',
    intro: 'Spectral анализирует описания API в YAML и JSON и сообщает о нарушениях правил.',
    body: split(
      text('<p>У Spectral есть встроенный ruleset для OpenAPI:</p>') + code('extends:\n  - spectral:oas', '.spectral.yaml') +
      text('<p>Он проверяет корректность документа и базовые рекомендации. Поверх него команда добавляет собственные правила.</p>') +
      code('npx @stoplight/spectral-cli lint openapi/openapi.yaml', 'запуск'),
      shot('79-spectral-repo.png', 'github.com · stoplightio/spectral', 'Репозиторий Spectral: описание «JSON/YAML linter … with baked in support for OpenAPI».'),
      'wide-right'
    ),
  },
  // 80
  {
    title: 'Часть правил переносим в код',
    intro: 'Файл .spectral.yaml учебного проекта: встроенные правила с повышенной строгостью и три собственных.',
    body: split(
      code('extends:\n  - spectral:oas\n\nrules:\n  info-contact: error\n  info-description: error\n  operation-operationId: error\n  operation-tags: error\n  path-params: error\n\n  ⟦paths-no-verbs⟧:\n    description: URI MUST описывать ресурс\n      существительным, а не действием.\n    severity: error\n    given: "$.paths"\n    then:\n      field: "@key"\n      function: pattern\n      functionOptions:\n        notMatch: "/(get|create|update|delete...)"', '.spectral.yaml (сокращено)', 'small'),
      code(' 2:6    error  info-contact           Info object must have "contact" object.\n10:22   error  ⟦paths-no-verbs⟧         URI MUST описывать ресурс существительным\n11:9    error  operation-operationId  Operation must have "operationId".\n36:19   error  error-responses-use-problem-json\n47:19   error  json-properties-snake-case\n\n<span class="err">✖ 9 problems (7 errors, 2 warnings)</span>', 'вывод Spectral на плохом контракте (фрагмент)', 'small').replace('&lt;span class=&quot;err&quot;&gt;', '<span class="err">').replace('&lt;/span&gt;', '</span>') +
      takeaway('Отсутствие <code>operationId</code> теперь не рекомендация преподавателя, а автоматически обнаруживаемая проблема.') +
      row(['API_STYLE_GUIDE.md', '.spectral.yaml', '*openapi.yaml'])
    ),
  },
  // 81
  {
    title: 'Контракт можно проверять обычным тестом',
    intro: 'app.openapi() возвращает контракт как словарь Python, и тест проверяет его, как любые другие данные.',
    body: split(
      code('from app.main import app\n\n\ndef test_openapi_contract_has_required_metadata():\n    schema = app.openapi()\n\n    assert schema["info"]["title"]\n    assert schema["info"]["version"]\n    assert schema["info"]["description"]\n    assert schema["info"]["contact"]["name"]', 'tests/test_contract.py'),
      chain(['CODE', 'app.openapi()', '*TEST ASSERTIONS']) +
      text('<p>Если кто-то удалит <code>contact</code> из <code>app/main.py</code>, тест упадёт с указанием строки. Правило проверяется автоматически при каждом запуске <code>pytest</code>.</p>')
    ),
  },
  // 82
  {
    title: 'Каждый endpoint обязан иметь operationId',
    intro: 'Тест проходит по всем операциям схемы и проверяет правило для каждой.',
    body: split(
      code('def test_every_operation_has_operation_id():\n    schema = app.openapi()\n    for path, method, operation in operations(schema):\n        assert operation.get("operationId"), (\n            f"{method.upper()} {path} has no operationId"\n        )', 'tests/test_contract.py') +
      note('Вспомогательная функция <code>operations()</code> в том же файле перебирает <code>schema["paths"]</code> и отбрасывает ключи, которые не являются HTTP-методами.'),
      chain(['OpenAPI paths', 'for each operation', '*CHECK']) +
      text('<p>Так стандартизация превращается из просьбы «пожалуйста, не забудьте» в проверяемое требование. В учебном проекте девять таких тестов, включая сверку <code>openapi/openapi.json</code> с кодом.</p>')
    ),
  },
  // 83
  {
    title: 'Проверка выполняется до объединения изменений',
    intro: 'GitHub Actions запускает проверки на каждый push и pull request.',
    body: split(
      code('name: API contract\non:\n  push:\n  pull_request:\n\njobs:\n  contract:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n      - uses: actions/setup-python@v5\n        with:\n          python-version: "3.12"\n      - run: pip install -r requirements.txt\n      - run: ⟦pytest⟧\n      - run: ⟦python scripts/export_openapi.py --check⟧\n      - uses: actions/setup-node@v4\n      - run: ⟦npx --yes @stoplight/spectral-cli@6.16.3 lint openapi/openapi.yaml⟧', '.github/workflows/ci.yml (сокращено)', 'small'),
      chain(['Push / Pull request', 'GitHub', 'CI', 'Tests · export --check · Spectral', 'oasdiff · только в pull request', '*PASS / FAIL'], 'compact') +
      takeaway('Ошибочный API contract обнаруживается ещё до deployment.') +
      answer('Доказательство: первый прогон в репозитории учебного проекта', shot('g-actions-main-green.png', 'github.com · MaximBytecamp/api-standard-template', 'Прогон ci.yml после push в main: job contract прошёл за 19 с, breaking-changes пропущен, потому что это не pull request. Логи шагов GitHub показывает только после входа.'))
    ),
  },
  // 84
  {
    title: 'Документация должна показывать, какие операции защищены',
    intro: 'Недостаточно написать в README «нужен токен». OpenAPI формально описывает security scheme.',
    body: split(
      text('<p>В нашем проекте write operations требуют Bearer token:</p>') +
      table(['Токен', 'Чтение', 'Запись'], [['нет', 'да', '401'], ['<code>demo-token</code>', 'да', 'да'], ['<code>viewer-token</code>', 'да', '403']]) +
      chain(['Swagger UI · Authorize', '*Bearer token', 'Protected operation'], 'compact') +
      note('В production реальный механизм может использовать OAuth 2.0 / OpenID Connect: токен выдаёт сервер авторизации, а сервис проверяет его подпись и срок действия.'),
      shot('84-swagger-authorize.png', 'Swagger UI · Authorize', 'Окно Available authorizations: схема BearerAuth (http, Bearer) и поле для токена. Операции записи отмечены замком.'),
      'wide-right'
    ),
  },
  // 85
  {
    title: 'Правильный Swagger ещё не делает API безопасным',
    intro: 'OWASP API Security Top 10 описывает риски, характерные именно для API.',
    body: split(
      table(['Риск', 'Как выглядит в Service Desk'], [
        ['Broken Object Level Authorization', 'сотрудник подставляет чужой <code>ticket_id</code> и читает чужое обращение'],
        ['Broken Authentication', 'сервер принимает просроченный или поддельный токен'],
        ['Broken Object Property Level Authorization', 'клиент меняет поле, которое ему менять нельзя'],
      ]) + takeaway('Наличие <code>/docs</code> и OpenAPI schema не является доказательством безопасности API.'),
      shot('85-owasp-api-top10.png', 'github.com · OWASP/API-Security', 'OWASP Top 10 API Security Risks – 2023: первый риск — API1:2023 Broken Object Level Authorization.'),
      'wide-right'
    ),
  },
  // 86
  {
    title: 'Теперь документация становится частью разработки',
    intro: 'Итоговая цепочка: каждое звено проверяет предыдущее.',
    body: split(
      chain(['API STYLE GUIDE', 'FASTAPI CODE', '*OPENAPI SCHEMA', 'SWAGGER UI / REDOC', 'LINTER', 'CONTRACT TESTS', 'CI'], 'compact'),
      text('<p>Style guide задаёт правила. Код реализует контракт, из кода получается схема. По схеме строится документация, её проверяют линтер и тесты, а CI не даёт объединить изменение, которое нарушает правила.</p>') +
      takeaway('API больше не является только набором функций Python.')
    ),
  },
  // 87
  {
    title: 'Как выглядит сам стандарт',
    intro: 'Репозиторий OAI/OpenAPI-Specification — место, где развивается спецификация OpenAPI.',
    body: split(
      table(['Что смотреть', 'Что там'], [
        ['<code>README.md</code>', 'что такое спецификация и как в ней участвовать'],
        ['<code>versions/</code>', 'опубликованные редакции: 3.0.x, 3.1.x, 3.2.x'],
        ['<code>style-guide.md</code>', 'правила оформления текста самой спецификации'],
      ]) + takeaway('Сам технический стандарт тоже развивается как versioned repository: с историей, pull requests и review.'),
      shot('87-oai-openapi-specification.png', 'github.com · OAI/OpenAPI-Specification', 'Корень репозитория спецификации: папка versions, README.md и style-guide.md.'),
      'wide-right'
    ),
  },
  // 88
  {
    title: 'Большая организация создаёт собственный API standard',
    intro: 'Zalando опубликовала правила, по которым её команды проектируют REST API.',
    body: split(
      code('zalando/restful-api-guidelines') +
      text('<p>Особенно полезные разделы в папке <code>chapters</code>:</p>') + list(['design principles;', 'HTTP requests;', 'JSON;', 'pagination;', 'security;', 'deprecation;', 'compatibility.'], 'cols') +
      takeaway('Zalando использует API First: спецификация создаётся до реализации и проходит review.'),
      shot('88-zalando-guidelines.png', 'github.com · zalando/restful-api-guidelines', 'Описание репозитория «A model set of guidelines for RESTful APIs and Events» и папка chapters.'),
      'wide-right'
    ),
  },
  // 89
  {
    title: 'Ещё одна организация — другие правила',
    intro: 'Microsoft публикует общие правила и отдельные правила для двух своих платформ.',
    body: split(
      code('microsoft/api-guidelines') +
      table(['Что изучить', 'Что там'], [['<code>Guidelines.md</code>', 'общие правила Microsoft REST API'], ['<code>azure/</code>', 'правила для сервисов Azure'], ['<code>graph/</code>', 'правила для Microsoft Graph'], ['<code>CONTRIBUTING.md</code>', 'как предлагать изменения']]) +
      text('<p>Полезно сравнить правила versioning Microsoft и Zalando.</p>') +
      takeaway('Корпоративный стандарт не обязан быть одинаковым у всех компаний.'),
      shot('89-microsoft-api-guidelines.png', 'github.com · microsoft/api-guidelines', 'Корень репозитория: Guidelines.md, папки azure и graph.'),
      'wide-right'
    ),
  },
  // 90
  {
    title: 'Style Guide + автоматический ruleset',
    intro: 'В репозитории adidas правило существует одновременно как текст и как автоматическая проверка.',
    body: split(
      code('adidas/api-guidelines') +
      text('<p>Здесь особенно интересна связь Markdown guidelines и правил Spectral. В корне лежат:</p>') +
      table(['Файл', 'Что это'], [['<code>ruleset.md</code>', 'описание правил для людей'], ['<code>.spectral.yml</code>', 'конфигурация линтера репозитория'], ['<code>adidas-spectral.yaml</code>', 'ruleset, который подключают команды']]) +
      takeaway('Это практически прямой пример темы нашей дисциплины.'),
      shot('90-adidas-api-guidelines.png', 'github.com · adidas/api-guidelines', 'Файлы adidas-spectral.yaml и ruleset.md в корне репозитория.'),
      'wide-right'
    ),
  },
  // 91
  {
    title: 'OpenAPI реального огромного API',
    intro: 'GitHub публикует OpenAPI description своего REST API.',
    body: split(
      code('github/rest-api-description') +
      text('<p>В репозитории лежит описание сотен операций GitHub REST API. README сообщает, что это описание используется во всём процессе разработки API: по нему проверяются запросы к GitHub API и работают контрактные тесты.</p>') +
      takeaway('OpenAPI не ограничивается учебными проектами.'),
      shot('91-github-rest-api-description.png', 'github.com · github/rest-api-description', 'Описание репозитория: «An OpenAPI description for GitHub\'s REST API».'),
      'wide-right'
    ),
  },
  // 92
  {
    title: 'Как организовать большой OpenAPI по файлам',
    intro: 'Redocly/openapi-starter полезен не кодом приложения, а организацией API description.',
    body: split(
      code('Redocly/openapi-starter') +
      tree('<b>openapi/</b>\n├── openapi.yaml   <em>точка входа</em>\n├── paths/         <em>по файлу на адрес</em>\n├── components/    <em>схемы, параметры</em>\n├── code_samples/\n└── webhooks/') +
      takeaway('Большой OpenAPI необязательно хранить одним огромным YAML. Его разбивают на файлы, а <code>$ref</code> собирает их в один документ.'),
      shot('92-redocly-openapi-starter.png', 'github.com · Redocly/openapi-starter', 'Папка openapi: openapi.yaml, paths, components, code_samples, webhooks.'),
      'wide-right'
    ),
  },
  // 93
  {
    title: 'Правила можно сделать очень строгими',
    intro: 'В репозитории OpenAPI DigitalOcean есть собственный Spectral ruleset.',
    body: split(
      code('digitalocean/openapi → spectral/ruleset.yml') +
      table(['Что проверяется', 'Правило'], [
        ['rate limit headers', '<code>ratelimit-headers</code>'],
        ['examples', '<code>properties-must-include-examples</code>'],
        ['operationId naming', '<code>operationid-must-follow-new-naming-conventions</code>'],
        ['schema naming', '<code>schema-key-must-be-snake-cased</code>'],
        ['security declarations', '<code>oas3-operation-security-defined</code>'],
      ], 'small') + note('Хороший материал для самостоятельного анализа: откройте файл и найдите, какие проверки вынесены в папку <code>functions</code>.'),
      shot('93-digitalocean-spectral-ruleset.png', 'github.com · digitalocean/openapi', 'spectral/ruleset.yml: у правил ratelimit-headers и properties-must-include-examples стоит severity: error.'),
      'wide-right'
    ),
  },
  // 94
  {
    title: 'OpenAPI можно использовать как публичный source of truth',
    intro: 'Box публикует OpenAPI specification своей платформы в открытом репозитории.',
    body: split(
      code('box/box-openapi') +
      text('<p>В корне лежит <code>openapi.json</code> — описание Box Platform API. В папке <code>openapi</code> хранятся отдельные файлы для версий, введённых в 2025 году: <code>openapi-v2025.0.json</code>, <code>openapi-v2026.0.json</code>.</p>') +
      takeaway('По репозиторию видно, как versioned API descriptions развиваются вместе с API.'),
      shot('94-box-openapi.png', 'github.com · box/box-openapi', 'Корень репозитория: файл openapi.json и папка openapi.'),
      'wide-right'
    ),
  },
  // 95 · Репозиторий API на GitHub
  {
    title: 'Один файл — разные решения компаний',
    intro: 'Репозиторий API содержит не только код. Шаблоны pull request, формы issue, владельцы кода, политика безопасности и журнал изменений есть у всех крупных проектов, но каждая компания устраивает их по-своему.',
    body: table(['Файл', 'Зачем нужен', 'Как устроен у других'], [
      ['<code>.github/PULL_REQUEST_TEMPLATE.md</code>', 'чек-лист изменения контракта', `${link(SRC.k8sPr, 'Kubernetes')} · ${link(SRC.oaiPr, 'OpenAPI Initiative')} · ${link(SRC.ghdPr, 'GitHub Docs')} · ${link(SRC.azPr, 'Azure')}`],
      ['<code>.github/ISSUE_TEMPLATE/*.yml</code>', 'формы с обязательными полями', `${link(SRC.azIssue, 'Azure')} · ${link(SRC.k8sIssue, 'Kubernetes')} · ${link(SRC.stripeIssue, 'Stripe')}`],
      ['<code>.github/CODEOWNERS</code>', 'кто утверждает изменения', `${link(SRC.oaiCo, 'OpenAPI Initiative')} · ${link(SRC.azCo, 'Azure')} · ${link(SRC.k8sOwners, 'Kubernetes OWNERS')}`],
      ['<code>SECURITY.md</code>', 'как сообщить об уязвимости', `${link(SRC.azSec, 'Azure')} · ${link(SRC.vscSec, 'VS Code')} · ${link(SRC.k8sSec, 'Kubernetes')}`],
      ['<code>CHANGELOG.md</code>', 'история изменений для потребителей', `${link(SRC.stripeCl, 'Stripe')} · ${link(SRC.k8sCl, 'Kubernetes')}`],
      ['<code>.github/dependabot.yml</code>', 'обновление зависимостей', `${link(SRC.oaiDep, 'OpenAPI Initiative')} · ${link(SRC.ghdDep, 'GitHub Docs')} · ${link(SRC.fastapiDep, 'FastAPI')}`],
    ]) + split(
      text('<p>На следующих слайдах у каждого файла есть цитата из документации GitHub или стандарта в оригинале, перевод и настоящие файлы компаний. Полный список с доказательствами лежит в учебном проекте: <code>docs/STANDARDS.md</code>.</p>'),
      note('Правила компании обязательны только внутри этой компании. Для учебного проекта выбрано подходящее, и каждый выбор записан вместе с источником.')
    ),
  },
  // 96
  {
    title: 'Шаблон pull request: что проверить до слияния',
    intro: 'Шаблон подставляется в описание каждого нового pull request. Автору он напоминает, что проверить, а ревьюеру показывает, где искать ответ.',
    body: split(
      quote('To store your file in a hidden directory, name the pull request template .github/pull_request_template.md.', 'чтобы хранить файл в скрытой папке, назовите шаблон pull request <code>.github/pull_request_template.md</code>.', 'GitHub Docs · Creating a pull request template', SRC.ghPrTemplate) +
      table(['Проект', 'Что требует шаблон'], [
        [link(SRC.k8sPr, 'Kubernetes'), 'тип PR командой <code>/kind api-change</code> или <code>/kind deprecation</code>, блок release note'],
        [link(SRC.oaiPr, 'OpenAPI Initiative'), 'отметить, нужны ли изменения JSON Schema спецификации'],
        [link(SRC.ghdPr, 'GitHub Docs'), 'ссылку на issue и проверку содержания экспертом'],
        [link(SRC.azPr, 'Azure'), 'выбрать один из трёх шаблонов: data plane, control plane, SDK'],
        [link(SRC.boxPr, 'Box'), 'самопроверку и запуск <code>yarn lint</code>'],
      ]) + note('Регистр в имени файла не важен: Kubernetes и GitHub Docs называют его <code>PULL_REQUEST_TEMPLATE.md</code>.'),
      shot('e-pr-kubernetes.png', 'github.com · kubernetes/kubernetes', 'Шаблон PR Kubernetes: список видов изменения, среди них /kind api-change и /kind deprecation.', 'compact') +
      answer('Учебный PR №6, заполненный по шаблону', shot('g-pr-checks.png', 'github.com · MaximBytecamp/api-standard-template/pull/6', 'Pull request №6: отмечен breaking change, заполнена таблица изменений контракта.') + `<p>${link(SRC.demoPr, 'Открыть PR №6')}</p>`) +
      answer('Как это сделано в учебном проекте', code('## Тип изменения\n\n- [ ] совместимое изменение контракта (MINOR)\n- [ ] исправление без изменения контракта (PATCH)\n- [ ] **breaking change** (MAJOR)\n- [ ] только документация\n\n## Проверки\n\n- [ ] контракт выгружен: python scripts/export_openapi.py\n- [ ] изменение записано в CHANGELOG.md\n- [ ] устаревающие элементы помечены deprecated: true', '.github/PULL_REQUEST_TEMPLATE.md (фрагмент)', 'small')),
      'wide-right'
    ),
  },
  // 97
  {
    title: 'Формы issue: обязательные поля вместо свободного текста',
    intro: 'Issue form — YAML-файл, из которого GitHub строит форму с полями. Пока обязательное поле пустое, обращение не отправить.',
    body: split(
      quote('You can create custom issue forms by adding a YAML form definition file to the /.github/ISSUE_TEMPLATE folder in your repository.', 'собственные формы issue создаются YAML-файлами с описанием формы в папке <code>/.github/ISSUE_TEMPLATE</code> репозитория.', 'GitHub Docs · Syntax for issue forms', SRC.ghIssueForms) +
      table(['Проект', 'Формат', 'Что спрашивает'], [
        [link(SRC.azIssue, 'Azure'), 'YAML-форма', 'обязательные «API Spec link» и «API Spec version»'],
        [link(SRC.k8sIssue, 'Kubernetes'), 'YAML-форма', 'что произошло, что ожидали, как воспроизвести'],
        [link(SRC.stripeIssue, 'Stripe Node SDK'), 'YAML-форма', 'описание, шаги, ожидаемое поведение'],
        [link(SRC.vscIssue, 'VS Code'), 'Markdown', 'свободный текст по подсказкам'],
      ]) + note('Из Azure в учебный проект взяты обязательные поля «версия API» и «операция», из Kubernetes — «что произошло / что ожидали».'),
      shot('e-issue-azure.png', 'github.com · Azure/azure-rest-api-specs', 'Форма ошибки Azure: поле API Spec version с обязательным заполнением.', 'compact') +
      answer('Учебный issue №7 в том виде, в каком его создаёт форма', shot('g-issue-demo.png', 'github.com · MaximBytecamp/api-standard-template/issues/7', 'Issue №7: каждое поле формы стало заголовком раздела, выбранные значения — текстом под ним.') + `<p>${link(SRC.demoIssue, 'Открыть issue №7')}</p>`) +
      answer('Как это сделано в учебном проекте', code('- type: input\n  id: version\n  attributes:\n    label: Версия API\n    placeholder: "1.1.0"\n  validations:\n    required: true\n\n- type: input\n  id: request_id\n  attributes:\n    label: X-Request-Id', '.github/ISSUE_TEMPLATE/bug_report.yml (фрагмент)', 'small')),
      'wide-right'
    ),
  },
  // 98
  {
    title: 'Кто утверждает изменения контракта',
    intro: 'CODEOWNERS связывает файлы и папки с людьми или командами. GitHub сам запрашивает у них review, а защита ветки может сделать этот review обязательным.',
    body: split(
      quote('Code owners are automatically requested for review when someone opens a pull request that modifies code that they own.', 'владельцы кода автоматически получают запрос на review, когда кто-то открывает pull request, меняющий принадлежащий им код.', 'GitHub Docs · About code owners', SRC.ghCodeowners) +
      code('*                        @MaximBytecamp\n/openapi/                @MaximBytecamp\n/.spectral.yaml          @MaximBytecamp\n/docs/API_STYLE_GUIDE.md @MaximBytecamp', '.github/CODEOWNERS (фрагмент)', 'small') +
      note(`В команде вместо имени указывают группу, например <code>@org/api-reviewers</code>. У ${link(SRC.azCo, 'Azure')} свои владельцы у спецификации каждого сервиса. Kubernetes использует другую систему: файлы <code>OWNERS</code> в папках читает бот Prow.`),
      shot('e-codeowners-oai.png', 'github.com · OAI/OpenAPI-Specification', 'CODEOWNERS спецификации OpenAPI: папку /versions/ утверждает технический комитет @oai/tsc.', 'compact') +
      answer('Доказательство: файл OWNERS в Kubernetes', shot('e-owners-kubernetes.png', 'github.com · kubernetes/kubernetes', 'Файл OWNERS в корне Kubernetes: списки reviewers и approvers.')),
      'wide-right'
    ),
  },
  // 99
  {
    title: 'Как сообщить об уязвимости',
    intro: 'Уязвимость не обсуждают в публичном issue: пока её не исправили, описание помогает атакующему. SECURITY.md говорит, куда писать вместо этого.',
    body: split(
      quote('In the new SECURITY.md file, add information about supported versions of your project and how to report a vulnerability.', 'в новом файле SECURITY.md укажите поддерживаемые версии проекта и способ сообщить об уязвимости.', 'GitHub Docs · Adding a security policy', SRC.ghSecurity) +
      table(['Проект', 'Вариант'], [
        [link(SRC.azSec, 'Azure'), 'полный стандартный текст Microsoft: не писать в issue, отправить отчёт в MSRC, перечень нужных сведений'],
        [link(SRC.vscSec, 'VS Code'), 'короткая версия того же блока Microsoft со ссылкой на общую политику'],
        [link(SRC.k8sSec, 'Kubernetes'), 'файл <code>SECURITY_CONTACTS</code>: ответственные и ссылка на процесс'],
        ['Учебный проект', '<code>docs/SECURITY.md</code>: поддерживаемые версии, приватный отчёт через GitHub, что указать в отчёте'],
      ]),
      shot('e-security-azure.png', 'github.com · Azure/azure-rest-api-specs', 'SECURITY.md Azure: «Please do not report security vulnerabilities through public GitHub issues».', 'compact'),
      'wide-right'
    ),
  },
  // 100
  {
    title: 'Журнал изменений в разных масштабах',
    intro: 'Keep a Changelog задаёт принципы, а форма журнала зависит от размера проекта.',
    body: split(
      quote('Changelogs are for humans, not machines. There should be an entry for every single version. The same types of changes should be grouped.', 'журнал изменений пишется для людей, а не для программ. Для каждой версии должна быть запись. Изменения одного типа группируются.', 'Keep a Changelog 1.1.0 · Guiding Principles', SRC.keepChangelog) +
      table(['Проект', 'Как устроен журнал'], [
        [link(SRC.stripeCl, 'Stripe Node SDK'), 'один файл, генерируется из фрагментов <code>.change.md</code>, у пунктов ссылки на PR'],
        [link(SRC.k8sCl, 'Kubernetes'), 'папка <code>CHANGELOG/</code>, отдельный файл на каждую минорную версию'],
        ['Учебный проект', 'один файл, разделы Added и Deprecated, ссылки сравнения версий'],
      ]),
      shot('e-changelog-stripe.png', 'github.com · stripe/stripe-node', 'CHANGELOG Stripe: запись о версии, которая меняет закреплённую версию API.', 'compact') +
      answer('Доказательство: папка CHANGELOG в Kubernetes', shot('e-changelog-kubernetes.png', 'github.com · kubernetes/kubernetes', 'Папка CHANGELOG Kubernetes: файлы по минорным версиям.')),
      'wide-right'
    ),
  },
  // 101
  {
    title: 'Breaking change ловит CI, а не review',
    intro: 'Переименованное поле легко пропустить в длинном diff. oasdiff сравнивает два файла OpenAPI и перечисляет изменения, которые сломают клиентов.',
    body: split(
      quote('GitHub Actions that check your OpenAPI specs for breaking changes on every pull request.', 'GitHub Actions, которые проверяют спецификации OpenAPI на breaking changes в каждом pull request.', 'oasdiff/oasdiff-action · README', SRC.oasdiff) +
      code('breaking-changes:\n  if: github.event_name == \'pull_request\'\n  steps:\n    - uses: actions/checkout@v5\n    - run: git fetch --depth=1 origin ${{ github.base_ref }}\n    - uses: oasdiff/oasdiff-action/breaking@v0.1.17\n      with:\n        base: "origin/${{ github.base_ref }}:openapi/openapi.yaml"\n        revision: "HEAD:openapi/openapi.yaml"\n        fail-on: ERR', '.github/workflows/ci.yml (фрагмент)', 'small'),
      answer('Тот же результат при локальном запуске oasdiff', code('$ oasdiff breaking base.yaml revision.yaml --fail-on ERR\n4 changes: 4 error, 0 warning, 0 info\nerror\t[response-required-property-removed] at /specs/revision.yaml\n\tin API GET /api/v1/tickets\n\t\tremoved the required property `items/items/title` from the response with the `200` status\n\nerror\t[response-required-property-removed] at /specs/revision.yaml\n\tin API POST /api/v1/tickets\n\t\tremoved the required property `title` from the response with the `201` status\n\n# ещё две такие же ошибки: GET и PATCH /api/v1/tickets/{ticket_id}', 'локальный запуск oasdiff: в ревизии поле title переименовано в subject', 'small')) +
      shot('g-actions-breaking-failed.png', 'github.com · pull request №6', 'Прогон на учебном PR №6 (updated_at → modified_at): contract прошёл, breaking-changes упал, 5 аннотаций oasdiff — по одной на каждую операцию с полем в ответе.', 'compact') +
      note(`Тесты в этом PR проходят: переименование согласовано во всём коде. Остановил слияние только oasdiff, а защита ветки <code>main</code> требует обе проверки. ${link(SRC.redRun, 'Открыть прогон')}.`)
    ),
  },
  // 102
  {
    title: 'Адрес в поле type должен открываться',
    intro: 'Problem Details различает виды ошибок по адресу в поле type. Стандарт требует, чтобы по этому адресу была документация.',
    body: split(
      quote('If the type URI is a locator (e.g., those with an "http" or "https" scheme), dereferencing it SHOULD provide human-readable documentation for the problem type (e.g., using HTML).', 'если URI в поле type является адресом (например, со схемой http или https), то по нему SHOULD открываться понятная человеку документация о виде проблемы, например HTML-страница.', 'RFC 9457 · раздел 3.1.1', SRC.rfc9457Type) +
      text('<p>В версии 1.0.0 учебного проекта <code>type</code> указывал на <code>example.edu</code>, где страницы нет. В 1.1.0 скрипт <code>scripts/build_docs.py</code> собирает страницу для каждого кода ошибки, а workflow <code>docs.yml</code> публикует их на GitHub Pages вместе с ReDoc.</p>') +
      note(`Документация опубликована: ${link(SRC.pages, 'maximbytecamp.github.io/api-standard-template')}, страница ${link(SRC.pages + 'problems/http-412.html', 'http-412')}.`) +
      '',
      shot('g-pages-problem-412.png', 'maximbytecamp.github.io · problems/http-412', 'Опубликованная страница вида проблемы 412: что означает ошибка и что делать клиенту.', 'compact'),
      'wide-right'
    ),
  },
  // 103
  {
    title: 'Правило без источника легко оспорить',
    intro: 'В учебном проекте для каждого правила записано, откуда оно взято, насколько оно обязательно и как то же самое решили другие компании.',
    body: split(
      code('## 9. Ограничение частоты запросов: 429 и Retry-After\n\n**В проекте:** app/limits.py\n\n**Источник:** RFC 6585, раздел 4, Standards Track.\n\n> The response representations SHOULD include details\n> explaining the condition, and MAY include a Retry-After\n> header indicating how long to wait before making a new request.\n\nПеревод: ответ SHOULD объяснять причину и MAY содержать\nзаголовок Retry-After ...\n\n**Как это делают другие:** Zalando (правило 153), GitHub ...', 'docs/STANDARDS.md (фрагмент)', 'small'),
      table(['Статус источника', 'Что означает'], [
        ['RFC, Standards Track', 'стандарт IETF'],
        ['RFC, Informational', 'опубликованный документ IETF, но не стандарт'],
        ['Internet-Draft', 'черновик: может измениться или истечь'],
        ['Спецификация', 'OpenAPI, Fetch Standard, SemVer'],
        ['Правила компании', 'обязательны только внутри этой компании'],
      ]) + takeaway('Статус указывается рядом с цитатой: RFC 8594 про Sunset — Informational, а черновик про Idempotency-Key истёк.')
    ),
  },
  // 104 · Заголовки и совместимость
  {
    title: 'Совместимость каждая компания определяет сама',
    intro: 'Одно и то же изменение — новое поле в ответе — GitHub считает совместимым, а Azure нет.',
    body: split(
      quote('Breaking changes are changes that can potentially break an integration.', 'breaking changes — это изменения, которые потенциально могут сломать интеграцию.', 'GitHub Docs · API Versions', SRC.ghVersions) +
      text('<p>В списке совместимых изменений GitHub есть «Adding a response field» — добавление поля в ответ.</p>') +
      quote('Teams MAY define backwards compatibility as their business needs require. For example, Azure defines the addition of a new JSON field in a response to be not backwards compatible.', 'команды MAY определять обратную совместимость так, как требует их бизнес. Например, Azure считает добавление нового поля JSON в ответ обратно несовместимым изменением.', 'Azure REST API Specs · Breaking changes guidelines', SRC.azBreaking),
      shot('e-azure-new-field-breaking.png', 'github.com · Azure/azure-rest-api-specs', 'Документ Azure о breaking changes: добавление нового поля в ответ названо несовместимым. Документ помечен как устаревший и ссылается на актуальную политику.', 'compact') +
      takeaway('Поэтому политика совместимости записывается явно. В учебном проекте принято правило GitHub, и клиенты обязаны игнорировать неизвестные поля: <code>docs/VERSIONING.md</code>.'),
      'wide-right'
    ),
  },
  // 105
  {
    title: 'Четыре места для версии API',
    intro: 'Слайд 71 показал версию в пути. У Microsoft внутри одной компании два разных решения.',
    body: split(
      table(['Кто', 'Где версия', 'Пример'], [
        [link(SRC.ghVersions, 'GitHub'), 'заголовок, версия названа датой', '<code>X-GitHub-Api-Version: 2026-03-10</code>'],
        [link(SRC.graph, 'Microsoft Graph'), 'путь', '<code>/v1.0/users</code>, <code>/beta/users</code>'],
        [link(SRC.azGuidelines, 'Azure'), 'query-параметр', '<code>?api-version=2024-05-01</code>'],
        [link(SRC.boxDir, 'Box'), 'отдельный файл описания на версию', '<code>openapi-v2025.0.json</code>'],
        ['Учебный проект', 'путь', '<code>/api/v1/tickets</code>'],
      ]) +
      quote('`version` can be v1.0 or beta.', 'сегмент <code>version</code> может быть v1.0 или beta.', 'Microsoft Graph REST API Guidelines', SRC.graph) +
      quote('The api-version query parameter (?api-version=) is required for all requests', 'query-параметр api-version обязателен во всех запросах.', 'Azure REST API Guidelines · текст ошибки, который требуется возвращать', SRC.azGuidelines),
      shot('e-graph-versioning.png', 'github.com · microsoft/api-guidelines', 'GuidelinesGraph.md, строки 134–138, подсвечены GitHub по ссылке на строки: структура URL и «`version` can be v1.0 or beta».', 'compact'),
      'wide-right'
    ),
  },
  // 106
  {
    title: 'Deprecation и Sunset в каждом ответе',
    intro: 'Пометку deprecated в OpenAPI увидит тот, кто читает документацию. Заголовок в ответе увидит программа, которая всё ещё вызывает устаревшую операцию.',
    body: split(
      quote('During the deprecation phase, the producer should add a Deprecation: &lt;timestamp&gt; (see RFC 9745 section 2) and - if also planned - a Sunset: &lt;date-time&gt; (see RFC 8594 section 3) header on each response affected by a deprecated element', 'на этапе устаревания владелец API должен добавлять заголовок Deprecation со временем (RFC 9745, раздел 2) и, если отключение запланировано, заголовок Sunset с датой (RFC 8594, раздел 3) в каждый ответ, который затрагивает устаревший элемент.', 'Zalando · правило 189', SRC.z189) +
      code('GET /api/v1/tickets/open?limit=1\n\nHTTP/1.1 200\ndeprecation: @1789516800\nsunset: Mon, 01 Mar 2027 00:00:00 GMT', 'настоящий ответ учебного API', 'small') +
      table(['Заголовок', 'Документ', 'Статус'], [
        ['<code>Deprecation</code>', link(SRC.rfc9745, 'RFC 9745'), '<span class="status-tag std">Standards Track</span>'],
        ['<code>Sunset</code>', link(SRC.rfc8594, 'RFC 8594'), '<span class="status-tag">Informational</span>'],
      ]),
      shot('e-swagger-deprecated.png', 'Swagger UI · listOpenTickets', 'Устаревшая операция: путь зачёркнут, в ответе 200 описаны заголовки Deprecation и Sunset.', 'compact'),
      'wide-right'
    ),
  },
  // 107
  {
    title: '429: одинаковое имя заголовка — разный смысл',
    intro: 'Код 429 и Retry-After определены в RFC. Заголовки X-RateLimit-* стандартом не являются, и компании понимают их по-разному.',
    body: split(
      quote('The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.', 'ответ SHOULD объяснять причину и MAY содержать заголовок Retry-After, который показывает, сколько ждать перед новым запросом.', 'RFC 6585 · раздел 4 · Standards Track', SRC.rfc6585) +
      quote('X-RateLimit-Reset: The relative time in seconds when the rate limit window will be reset. Beware that this is different to Github and Twitter’s usage of a header with the same name which is using UTC epoch seconds instead.', 'X-RateLimit-Reset — относительное время в секундах до сброса окна лимита. Учтите, что GitHub и Twitter используют заголовок с тем же именем иначе: там время в секундах UTC epoch.', 'Zalando · правило 153', SRC.z153) +
      note(`Стандарт в работе — ${link(SRC.ietfRateLimit, 'draft-ietf-httpapi-ratelimit-headers')}, активный черновик, версия 11. Он вводит заголовки <code>RateLimit</code> и <code>RateLimit-Policy</code>.`),
      code('POST /api/v1/tickets   # третий запрос при лимите 2 в минуту\n\nHTTP/1.1 429\nretry-after: 60\nx-ratelimit-limit: 2\nx-ratelimit-remaining: 0\nx-ratelimit-reset: 60\ncontent-type: application/problem+json\n\n{\n  "type": ".../problems/http-429",\n  "title": "Too many requests",\n  "status": 429,\n  "detail": "Write limit of 2 requests per minute exceeded"\n}', 'настоящий ответ учебного API', 'small') +
      answer('Доказательство: как GitHub описывает x-ratelimit-reset', shot('e-github-ratelimit-headers.png', 'docs.github.com · Rate limits', 'GitHub Docs: x-ratelimit-reset — время сброса в секундах UTC epoch.'))
    ),
  },
  // 108
  {
    title: 'ETag и If-Match: не потерять чужую правку',
    intro: 'Два оператора открыли одно обращение. Первый закрыл его, второй через минуту меняет описание по старой копии. Условный запрос не даёт второму затереть изменение первого.',
    body: split(
      quote('The "If-Match" header field makes the request method conditional on the recipient origin server either having at least one current representation of the target resource, when the field value is "*", or having a current representation of the target resource that has an entity tag matching a member of the list of entity tags provided in the field value.', 'заголовок If-Match делает метод запроса условным: сервер выполняет его, только если у ресурса есть текущее представление (при значении «*») или если entity tag текущего представления совпадает с одним из перечисленных в заголовке.', 'RFC 9110 · раздел 13.1.1 · Standards Track', SRC.rfc9110IfMatch) +
      table(['Кто', 'Сила правила'], [
        [link(SRC.z182, 'Zalando, правило 182'), 'MAY'],
        [link(SRC.azGuidelines, 'Azure'), 'DO — поддерживать If-Match и If-None-Match, возвращать ETag'],
        [link(SRC.ghBestPractices, 'GitHub'), 'большинство endpoints отдают etag; 304 не расходует лимит'],
      ]),
      code('GET /api/v1/tickets/a8d04cb9-…\nIf-None-Match: "4fec2a976840743a"\n\nHTTP/1.1 304\netag: "4fec2a976840743a"', '1. копия не изменилась — тело не передаётся', 'small') +
      code('PATCH /api/v1/tickets/a8d04cb9-…\nIf-Match: "4fec2a976840743a"      # версия до чужой правки\n\nHTTP/1.1 412\ncontent-type: application/problem+json\n\n{\n  "title": "Precondition failed",\n  "detail": "Ticket was changed after the version in If-Match was read"\n}', '2. обращение уже изменили — сервер отказывает', 'small')
    ),
  },
  // 109
  {
    title: 'Idempotency-Key: распространённая практика без стандарта',
    intro: 'POST не идемпотентен. Если ответ потерялся в сети и клиент повторил запрос, появится второе обращение. Ключ идемпотентности позволяет серверу узнать повтор.',
    body: split(
      shot('e-ietf-idempotency-expired.png', 'datatracker.ietf.org', 'Черновик draft-ietf-httpapi-idempotency-key-header: статус Expired Internet-Draft.', 'compact') +
      quote('If there is an attempt to reuse an idempotency key with a different request payload, the resource SHOULD reply with a HTTP 422 status code with body containing a link pointing to relevant documentation.', 'при попытке повторно использовать ключ с другим телом запроса ресурс SHOULD ответить кодом 422 с телом, в котором есть ссылка на документацию.', 'IETF draft-07 · срок действия истёк', SRC.ietfIdempotency),
      quote('Idempotency keys are up to 255 characters long. … You can remove keys from the system automatically after they’re at least 24 hours old.', 'ключ идемпотентности занимает до 255 символов… Ключи можно автоматически удалять, когда им не меньше 24 часов.', 'Stripe API · Idempotent requests', SRC.stripeIdempotency) +
      code('POST /api/v1/tickets  Idempotency-Key: 8e03978e-…  {"title": "Не работает VPN"}\nHTTP/1.1 201   id: 6dfeb4e3-…\n\nPOST /api/v1/tickets  Idempotency-Key: 8e03978e-…  {"title": "Не работает VPN"}\nHTTP/1.1 201   id: 6dfeb4e3-…   # тот же id, обращений по-прежнему 4\n\nPOST /api/v1/tickets  Idempotency-Key: 8e03978e-…  {"title": "Не работает почта"}\nHTTP/1.1 422   "Idempotency-Key was already used with a different request body"', 'настоящие ответы учебного API, сокращено', 'small') +
      note(`Длина ключа и срок хранения взяты из Stripe и ${link(SRC.z230, 'Zalando, правило 230')}, код 422 — из черновика IETF.`)
    ),
  },
  // 110
  {
    title: 'Идентификатор запроса: имя выбирает компания',
    intro: 'Одна операция проходит через клиент, gateway и сервис. Общий идентификатор позволяет найти её записи во всех логах. Стандартного имени у этого заголовка нет.',
    body: split(
      table(['Кто', 'Заголовок'], [
        [link(SRC.z233, 'Zalando, правило 233'), '<code>X-Flow-ID</code>'],
        [link(SRC.azGuidelines, 'Azure'), '<code>x-ms-client-request-id</code>'],
        ['Учебный проект', '<code>X-Request-Id</code>'],
      ]) +
      quote('If the caller provides this header the service **must** include this in their log entries to facilitate correlation of log entries for a single request. Because this header can be client-generated, it should not …', 'если вызывающая сторона передала этот заголовок, сервис <b>must</b> записывать его в логи, чтобы связать записи одного запроса. Поскольку значение может сформировать клиент, оно не должно… (дальше Azure ограничивает его использование).', 'Azure REST API Guidelines · correlation headers', SRC.azGuidelines),
      code('GET /api/v1/tickets/a8d04cb9-…\nX-Request-Id: support-case-1842\n\nHTTP/1.1 200\nx-request-id: support-case-1842', 'клиент передал свой идентификатор', 'small') +
      code('GET /api/v1/tickets\nX-Request-Id: bad value; drop table\n\nHTTP/1.1 200\nx-request-id: 3c1f…            # UUID сервера', 'значение не прошло проверку формата (тест test_unsafe_request_id_is_replaced)', 'small') +
      answer('Доказательство: правило Zalando 233', shot('e-zalando-233-flow-id.png', 'opensource.zalando.com · rule 233', 'Правило Zalando 233: MUST support X-Flow-ID.'))
    ),
  },
  // 111
  {
    title: 'CORS: заголовок пришёл, а скрипт его не видит',
    intro: 'Браузерный клиент на другом домене получает от сервера ETag и Location, но JavaScript прочитает их, только если сервер явно разрешил.',
    body: split(
      quote('`Access-Control-Expose-Headers` Indicates which headers can be exposed as part of the response by listing their names.', 'Access-Control-Expose-Headers перечисляет имена заголовков, которые можно открыть скрипту как часть ответа.', 'Fetch Standard · CORS protocol', SRC.fetch) +
      code('app.add_middleware(\n    CORSMiddleware,\n    allow_origins=CORS_ORIGINS,\n    expose_headers=[\n        "ETag", "Location", "X-Request-Id", "Retry-After",\n        "Deprecation", "Sunset",\n        "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset",\n    ],\n)', 'app/main.py (фрагмент)', 'small'),
      code('GET /api/v1/tickets/open\nOrigin: http://localhost:5173\n\nHTTP/1.1 200\naccess-control-allow-origin: http://localhost:5173\naccess-control-expose-headers: ETag, Location, X-Request-Id, Retry-After, Deprecation, Sunset, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset', 'настоящий ответ учебного API', 'small') +
      takeaway('Добавили в контракт новый заголовок ответа — добавьте его в <code>expose_headers</code>, иначе браузерный клиент его не получит.')
    ),
  },
  // 112
  {
    title: 'OAuth 2.0 описывают вместе с сервером авторизации',
    intro: 'OpenAPI позволяет описать OAuth 2.0 со схемами authorizationCode и clientCredentials. Но схема в контракте — обещание клиенту, и обещать можно только то, что работает.',
    body: split(
      table(['', 'Учебный стенд', 'Production'], [
        ['Кто выдаёт токен', 'токены заданы переменными окружения', 'сервер авторизации по OAuth 2.0 / OpenID Connect'],
        ['Схема в OpenAPI', '<code>BearerAuth: type: http, scheme: bearer</code>', '<code>type: oauth2</code> с flows и scopes'],
        ['Что проверяет сервис', 'совпадение строки токена', 'подпись, срок действия, scopes'],
      ]) +
      text(`<p>${link(SRC.oasOauth, 'OpenAPI 3.2.0, OAuth Flows Object')} описывает адреса авторизации и выдачи токена. ${link(SRC.z104, 'Zalando, правило 104')} требует защищать все endpoints.</p>`),
      `<p class="warn-box">Если описать в учебном контракте <code>oauth2</code> без сервера авторизации, Swagger UI покажет кнопку входа, которая никуда не ведёт. Такое описание нарушает главное свойство контракта: он должен совпадать с поведением API.</p>` +
      takeaway('Схему OAuth 2.0 добавляют в тот же pull request, что и подключение сервера авторизации.')
    ),
  },
  // 113
  {
    title: 'Что изменилось в учебном API 1.1.0',
    intro: 'Все механизмы этой части добавлены в учебный проект как совместимое изменение: версия 1.0.0 стала 1.1.0.',
    body: split(
      code('## [1.1.0] - 2026-09-16\n\n### Added\n\n- Заголовок X-Request-Id в каждом ответе.\n- ETag, 304 Not Modified на совпавший If-None-Match.\n- If-Match в PATCH, ответ 412 при устаревшей версии.\n- Idempotency-Key в POST /api/v1/tickets.\n- Лимит операций записи: 429 с Retry-After, X-RateLimit-*.\n- CORS с открытыми заголовками контракта.\n- Поле type в Problem Details ведёт на страницы видов ошибок.\n\n### Deprecated\n\n- GET /api/v1/tickets/open — используйте GET /api/v1/tickets?status=open.', 'CHANGELOG.md (сокращено)', 'small') +
      note('31 тест проходит, <code>export_openapi.py --check</code> подтверждает совпадение контракта с кодом, Spectral замечаний не выдаёт. Проверено 16 сентября 2026 года.'),
      shot('e-swagger-headers.png', 'Swagger UI · updateTicket', 'PATCH /api/v1/tickets/{ticket_id}: параметр If-Match в списке параметров операции.'),
      'wide-right'
    ),
  },
  // 95
  {
    title: 'Структура учебного эталона',
    intro: 'Репозиторий api-standard-template содержит не только код, но и все документы контракта.',
    body: split(
      tree('<b>api-standard-template/</b>\n├── .github/\n│   ├── ISSUE_TEMPLATE/\n│   ├── workflows/ci.yml, docs.yml\n│   ├── CODEOWNERS\n│   ├── PULL_REQUEST_TEMPLATE.md\n│   └── dependabot.yml\n├── app/\n├── docs/\n│   ├── STANDARDS.md, API_STYLE_GUIDE.md\n│   ├── QUICKSTART.md, VERSIONING.md, ERRORS.md\n│   ├── SECURITY.md, CONTRIBUTING.md\n│   └── adr/\n├── openapi/\n├── scripts/\n├── tests/\n├── .spectral.yaml\n├── CHANGELOG.md\n├── LICENSE\n└── README.md'),
      table(['Папка или файл', 'Назначение'], [
        ['<code>app/</code>', 'FastAPI-приложение'],
        ['<code>docs/</code>', 'правила, политика версий, ошибки, безопасность, ADR'],
        ['<code>openapi/</code>', 'выгруженный контракт'],
        ['<code>scripts/</code>', 'выгрузка контракта и сборка страниц ошибок'],
        ['<code>.github/</code>', 'CI, публикация документации, шаблоны, владельцы кода'],
        ['<code>docs/STANDARDS.md</code>', 'источник каждого правила с цитатой и переводом'],
        ['<code>tests/</code>', 'поведение endpoints и правила контракта'],
        ['<code>.spectral.yaml</code>', 'правила линтера'],
      ])
    ),
  },
  // 96
  {
    title: 'Это не только FastAPI-код',
    intro: 'Вокруг пяти операций собраны артефакты, которые делают API проверяемым контрактом.',
    body: `<div class="orbit"><div class="side">${['OpenAPI', 'Swagger UI', 'ReDoc', 'Bearer scheme', 'Problem Details', 'pagination', 'API Style Guide'].map(s => `<span>${s}</span>`).join('')}</div><div class="core">GET /tickets<br>POST /tickets<br>GET /tickets/{id}<br>PATCH /tickets/{id}<br>DELETE /tickets/{id}</div><div class="side">${['versioning policy', 'ADR', 'CHANGELOG', 'contract tests', 'CI', 'Spectral', 'oasdiff', 'ETag · If-Match', 'Idempotency-Key', 'X-Request-Id', 'CODEOWNERS', 'STANDARDS.md'].map(s => `<span>${s}</span>`).join('')}</div></div>` +
      note('Все проверки проходят на версии 1.1.0: 31 тест, <code>export_openapi.py --check</code> и Spectral без замечаний.'),
  },
  // 97
  {
    title: 'Не копируем Service Desk без изменений',
    intro: 'В практической работе вы выбираете собственную предметную область и строите контракт для неё.',
    body: split(
      text('<p>Например: Books, Events, Cinema, Warehouse, Delivery, Games, Pets, Music, Reservations.</p><p>После выбора необходимо:</p>') +
      olist(['определить ресурсы;', 'спроектировать URI;', 'выбрать HTTP methods;', 'определить request/response schemas;', 'определить status codes;', 'создать собственный Style Guide;', 'реализовать API;', 'проверить OpenAPI;', 'оформить документацию.'], 'cols'),
      row(['DOMAIN', 'RESOURCES', 'CONTRACT', 'IMPLEMENTATION', '*VALIDATION']) +
      text('<p>Первый черновик контракта своей области можно проверить здесь же:</p>') +
      lint('GET    /books\nPOST   /books\nGET    /books/{book_id}\nPATCH  /books/{book_id}\nDELETE /books/{book_id}', { head: 'мой контракт', button: 'Проверить мой контракт', live: true })
    ),
  },
  // 98
  {
    title: 'Контракт является частью repository',
    intro: 'Изменение контракта оформляется так же, как изменение кода. Git заново не изучаем.',
    body: split(
      chain(['Save', 'Source Control', 'Commit', 'Push', 'GitHub', '*GitHub Actions'], 'compact'),
      text('<p>Сообщение commit должно описывать изменение контракта:</p>') +
      code('docs(api): define ticket error contract', 'документ') + code('feat(api): add ticket pagination', 'новая возможность') +
      note('Перед commit выполните <code>python scripts/export_openapi.py</code>: иначе CI найдёт расхождение <code>openapi/openapi.json</code> с кодом.')
    ),
  },
  // 99
  {
    title: 'Диагностика стандарта',
    intro: 'Если CI не проходит, двигайтесь от сообщения об ошибке к правилу, а от правила к файлу.',
    body: split(
      olist([
        'какой именно test или шаг упал;',
        'какой endpoint указан в сообщении;',
        'существует ли <code>operationId</code>;',
        'определён ли success response;',
        'соответствует ли <code>response_model</code> возвращаемым данным;',
        'обновлена ли OpenAPI schema в <code>openapi/</code>;',
        'не нашёл ли oasdiff breaking change в job <code>breaking-changes</code>;',
        'обновлён ли CHANGELOG;',
        'сохранён ли файл;',
        'отправлен ли новый commit.',
      ]),
      chain(['CI FAIL', 'RULE', 'FILE', 'CONTRACT', '*FIX']) +
      code('FAILED tests/test_contract.py::test_every_operation_has_operation_id\nAssertionError: GET /api/v1/tickets/{ticket_id} has no operationId', 'пример сообщения', 'small')
    ),
  },
  // 100
  {
    title: 'Контрольные артефакты работы',
    intro: 'Для отчёта сохраните ссылки, файлы и скриншоты.',
    body: split(
      `<ul class="checklist">${[
        'ссылка на GitHub repository', 'screenshot Swagger UI', 'screenshot ReDoc', 'screenshot <code>/openapi.json</code>',
        'screenshot успешного POST', 'screenshot <code>404 application/problem+json</code>', '<code>API_STYLE_GUIDE.md</code>', '<code>VERSIONING.md</code>',
        '<code>CHANGELOG.md</code>', 'ADR', 'OpenAPI YAML/JSON', 'screenshot успешного GitHub Actions run', 'commit hash итоговой версии',
      ].map(i => `<li>${i}</li>`).join('')}</ul>`,
      shot('100-swagger-post-201.png', 'Swagger UI · POST /api/v1/tickets', 'Так выглядит скриншот успешного POST: код 201, тело созданного обращения и заголовок location.')
    ),
  },
  // 101
  {
    title: 'Проверяем понимание, а не память',
    intro: 'Студент должен своими словами объяснить ответы на эти вопросы.',
    body: `<ol class="questions">${[
      'Почему REST и HTTP — не одно и то же?',
      'Почему Swagger и OpenAPI — не одно и то же?',
      'Почему <code>GET /deleteUser</code> является плохим контрактом?',
      'Почему <code>POST</code> и <code>PUT</code> имеют разную семантику?',
      'Почему <code>401</code> и <code>403</code> нельзя считать одинаковыми?',
      'Почему OpenAPI version и API version — разные вещи?',
      'Что делает breaking change опасным?',
      'Зачем нужен <code>operationId</code>?',
      'Почему Problem Details лучше произвольного JSON?',
      'Зачем API Style Guide, если уже существует OpenAPI?',
      'Что проверяет Spectral?',
      'Почему успешные тесты приложения ещё не гарантируют качественный API contract?',
    ].map(q => `<li>${q}</li>`).join('')}</ol>` + `<p class="why"><b>«ПОЧЕМУ?»</b> <s>вместо «ГДЕ КНОПКА?»</s></p>`,
  },
  // 102
  {
    title: 'Как теперь выглядит процесс разработки API',
    intro: 'Стандартизация сопровождает API на протяжении всего жизненного цикла.',
    body: split(
      chain(['BUSINESS DOMAIN', 'RESOURCES', 'API STYLE GUIDE', 'HTTP CONTRACT', '*OPENAPI', 'FASTAPI IMPLEMENTATION', 'SWAGGER UI / REDOC'], 'compact'),
      chain(['LINTER', 'CONTRACT TESTS', 'GITHUB', 'CI', '*API RELEASE', 'CHANGELOG / VERSIONING / DEPRECATION'], 'compact') +
      note('Левая колонка продолжается в правой: после документации изменение проходит линтер и тесты.')
    ),
  },
  // 103
  {
    title: 'От описания API — к проверке его качества',
    intro: 'После этого блока логично переходить к отдельной теме: автоматизированный API Governance.',
    body: split(
      text('<p>Там можно глубже разобрать:</p>') + list(['Spectral custom rules;', 'OpenAPI linting;', 'contract testing;', 'schema compatibility;', 'breaking-change detection;', 'GitHub Actions quality gates;', 'security checks.'], 'cols'),
      compare('Сейчас', '<pre>«мы договорились\n писать API одинаково»</pre>', 'Дальше', '<pre>«repository технически\n не позволит нарушить\n часть этих правил»</pre>') +
      chain(['DOCUMENTED STANDARD', '*ENFORCED STANDARD']) +
      `<div class="actions"><a class="button" href="../../index.html">К дисциплине</a><a class="button" href="https://github.com/MaximBytecamp/api-standard-template" target="_blank" rel="noopener noreferrer">Репозиторий на GitHub ↗</a><a class="button" href="https://maximbytecamp.github.io/api-standard-template/" target="_blank" rel="noopener noreferrer">Документация API ↗</a></div>`
    ),
  },
];
