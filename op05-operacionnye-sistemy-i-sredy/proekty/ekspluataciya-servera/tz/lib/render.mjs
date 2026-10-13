// Сборка HTML технического задания ОП.05. Требования (группы, матрица, распределение, результат) берутся
// из content.py — того же источника, что и страницы на сайте; легенда и приёмка — из data/tz-0N-*.mjs.
import { seal, signature, flow } from '../../../../../op03-informacionnye-tehnologii/tz/lib/graphics.mjs';
import { COMPANY as c, ABOUT, PEOPLE, SERVERS, REGS, BASE } from '../data/company.mjs';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const olist = items => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
// site = true — разметка для страницы сайта: таблицы в прокручиваемой обёртке, терминал с кнопкой «Копировать».
let site = false;
const table = (head, rows, cls = '') => {
  const t = `<table class="${cls}${rows.length <= 8 ? ' keep' : ''}">${head ? `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : ''}
<tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return site ? `<div class="tbl ${cls}${/matrix|grade/.test(cls) ? '' : ' stack'}">${t}</div>` : t;
};
const term = lines => site
  ? `<div class="term"><button class="copy" type="button" data-copy="${esc(lines.join('\n'))}">Копировать</button><pre>${lines.map(esc).join('\n')}</pre></div>`
  : `<pre class="term">${lines.map(esc).join('\n')}</pre>`;
const sec = cls => site ? 'part' : `page${cls ? ' ' + cls : ''}`;
const blank = '<span class="blank"></span>';

export function render(tz, req) {
  const p = parts(tz, req);
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(tz.code)} — ${esc(c.brand)}</title>
<style>${css(tz)}</style></head><body>
${p.cover}${p.letter}${p.s1}${p.s2}${p.s3}${p.s4}${p.appA}${p.appB}${p.appV}
</body></html>`;
}

// Разделы ТЗ по отдельности. С { site: true } — для страницы сайта (build.py через export.mjs).
export function parts(tz, req, opts = {}) {
  site = !!opts.site;
  const ink = '#2b3c9e';
  const sealSvg = (rot = -9, size = 168) => seal({
    outer: `${c.short.toUpperCase()} • ИНН ${c.inn.replace(/ /g, '')} • `,
    inner: c.sealInner, center: c.sealCenter, logo: c.logo.replace(/currentColor/g, ink), ink, rotate: rot, size,
  });
  const dirSign = (w = 150) => signature(c.director.sign, { width: w });
  const logo = (size = 44) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" style="color:${tz.accent}">${c.logo}</svg>`;
  const person = PEOPLE[tz.contact.key];
  const stand = req.stand[0], acc = req.stand[1];
  const total = tz.acceptance.reduce((n, [, items]) => n + items.length, 0);
  const repoName = `${req.slug.replace(/^tz-(\d)/, 'tz-0$1')}`;
  const [docFile, docName] = tz.mainDoc;
  const [repFile, repAction, repResult] = tz.repeat;

  const letterhead = `<header class="letterhead">
    <div class="lh-brand">${logo(46)}<div><div class="lh-name">${esc(c.brand)}</div><div class="lh-tag">${esc(c.tagline)}</div></div></div>
    <div class="lh-req">${esc(c.full)}<br>${esc(c.address)}<br>ИНН ${esc(c.inn)} · КПП ${esc(c.kpp)} · ОГРН ${esc(c.ogrn)}<br>${esc(c.phone)} · ${esc(c.email)}</div>
  </header>`;

  const toc = [['', 'Обращение Заказчика'], ['1', 'Ситуация'], ['2', 'Задача'], ['3', 'Порядок работы'], ['4', 'Сдача и проверка'],
    ['А', 'Пункты скрипта приёмки'], ['Б', 'Выдержки из регламентов'], ['В', 'Лист согласования'], ['Г', 'Акт сдачи-приёмки']];

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
      ['Заказчик', `${esc(c.full)}, ИТ-отдел`],
      ['Исполнители', `пара практикантов группы эксплуатации<br>практикант 1 ${blank}<br>практикант 2 ${blank}<br><span class="hint">фамилия, имя, группа</span>`],
      ['Руководитель работ со стороны Заказчика', `${esc(person[1][0].toUpperCase() + person[1].slice(1))} ${esc(person[0])}, ${esc(tz.contact.email)}, Telegram ${esc(tz.contact.tg)}`],
      ['Наставник', `${esc(c.mentor.name)}, ${esc(c.mentor.email)}, Telegram ${esc(c.mentor.tg)}`],
      ['Сервер и вид работ', `${esc(tz.server)} · ${esc(tz.workType)}`],
      ['Основание', 'Практическая работа по дисциплине ОП.05 «Операционные системы и среды», работа в паре по темам 1–8'],
      ['Дата выдачи', blank],
      ['Срок выполнения', '14 календарных дней с даты выдачи; этапы — в разделе 3.3'],
      ['Версия документа', '1.0'],
    ], 'passport')}
    <h3>Содержание</h3>
    <ul class="toc">${toc.map(([n, t]) => `<li><b>${n}</b>${t}</li>`).join('')}</ul>
  </section>`;

  // ——— Письмо ———
  const approveSite = site ? `<div class="cover-top">
      <div class="outno">${esc(tz.outNo)}<br>от ${esc(tz.issued)}</div>
      <div class="approve">
        <div class="approve-h">УТВЕРЖДАЮ</div>
        <div>${esc(c.director.post)}<br>${esc(c.short)}</div>
        <div class="sign-line"><span class="sig-wrap">${dirSign()}</span><span class="line"></span> ${esc(c.director.short)}</div>
        <div>«${tz.issued.slice(0, 2)}» ${month(tz.issued)} ${tz.issued.slice(6)} г.</div>
        <div class="seal-wrap">${sealSvg(-11)}</div>
      </div>
    </div>` : '';
  const letter = `<section class="${site ? 'doc' : 'page letter'}" id="letter">
    ${letterhead}${approveSite}
    <div class="letter-to">Практикантам группы эксплуатации,<br>исполнителям технического задания № ${esc(tz.code)}</div>
    <h2 class="plain">О задачах работы</h2>
    ${tz.letter.map(p => `<p>${p}</p>`).join('')}
    <div class="facts">${tz.facts.map(f => `<div><b>${esc(f.n)}</b><span>${esc(f.t)}</span></div>`).join('')}</div>
    <div class="letter-sign">
      <div>${esc(c.director.post)}<br>${esc(c.short)}</div>
      <div class="sig-wrap big">${dirSign(170)}<div class="seal-wrap">${sealSvg(7, 150)}</div></div>
      <div>${esc(c.director.short)}</div>
    </div>
  </section>`;

  // ——— Часть 1. Ситуация ———
  const t = tz.ticket;
  const srv = tz.server.split(',')[0];
  const relHead = req.num === 1 ? 'Состав релиза' : 'Что есть на сервере';
  const s1 = `<section class="${sec()}" id="s1">
    <h2>1. Ситуация</h2>
    <p class="lead">${ABOUT[0][1]}</p>
    <p>${ABOUT[1][1]} ${ABOUT[2][1]}</p>
    <p>Группа эксплуатации обслуживает три сервера: ${SERVERS.map(r => `<b>${r[0]}</b> — ${r[1]}`).join('; ')}. Это задание относится к серверу <b>${esc(srv)}</b>. Работа ведётся по регламентам компании ${tz.regs.map(k => `${k} «${REGS[k].title}»`).join(', ')}; выдержки из них — в Приложении Б.</p>
    <h3>1.1. Заявка</h3>
    <p>Работа начинается с заявки в очереди группы эксплуатации. Её текст приводится полностью.</p>
    <div class="ticket">
      <div class="t-head"><b>${esc(t.no)}</b><span>${esc(t.subject)}</span></div>
      <div class="t-meta"><span>Создана: ${esc(t.date)}</span><span>Автор: ${esc(t.author)}</span><span>Приоритет: ${esc(t.priority)}</span></div>
      ${t.text.map(p => `<p>${p}</p>`).join('')}
    </div>
    <h3>1.2. Хронология и участники</h3>
    <p>События до выдачи задания и после него расположены по времени. Ниже — сотрудники, которых касается задание; их учётные записи используются в работе так, как они записаны в таблице.</p>
    ${table(['Когда', 'Что произошло'], tz.timeline, 'timeline')}
    ${table(['Сотрудник', 'Должность', 'Учётная запись', 'Роль в задании'], tz.people.map(k => PEOPLE[k]), 'people')}
    <h3>1.3. ${relHead}</h3>
    <p>На копии сервера, которую разворачивает стенд, находятся файлы и программы из таблицы. С них начинается осмотр сервера.</p>
    ${table(['Файл или каталог', 'Назначение'], req.release.map(([a, b]) => [`<code>${a}</code>`, b]), 'release')}
    <p class="bridge">Из заявки и обстановки на сервере следует задача пары. Она описана в части 2 как перечень требований: каждое требование проверяется при приёмке.</p>
  </section>`;

  // ——— Часть 2. Задача ———
  let reqHtml = '';
  req.groups.forEach(([g, items], i) => {
    reqHtml += `<h3>2.${i + 1}. ${g}</h3><ol class="req">${items.map((x, j) => `<li><span>2.${i + 1}.${j + 1}</span><div>${x}</div></li>`).join('')}</ol>`;
  });
  let matrix = '';
  if (req.matrix) {
    const [head, rows] = req.matrix;
    matrix = `<h3>Матрица доступа</h3><p>Матрица задаёт, что может каждая роль. Права шире, чем в матрице, считаются ошибкой.</p>${table(head, rows, 'matrix')}
      <p class="hint">Запуск программ из <code>/usr/local/bin</code> разрешён всем. root в матрице не указан: для его процессов права не проверяются.</p>`;
  }
  const nGroups = req.groups.length;
  const optRows = tz.optional.map(([f, text, p], i) => [`<code>${f}</code>`, text, `+${p}`]);
  const s2 = `<section class="${sec()}" id="s2">
    <h2>2. Задача</h2>
    <p class="lead">Результат работы описывается пятью целями:</p>
    ${olist(tz.goals)}
    <p>Схема показывает части работы и порядок, в котором они связаны. Номер в блоке — раздел задания, где эта часть описана.</p>
    ${site ? '<div class="flow-wrap">' : ''}${flow({ width: 680, height: tz.flow.height, nodes: tz.flow.nodes, links: tz.flow.links })}${site ? '</div>' : ''}
    <p>Требования ниже сгруппированы по тем же частям. Слова «должен» и «обязательно» обозначают требование, которое проверяется при приёмке. Номер требования записывается в журнал работ рядом с командами, которые его выполняют. Если требование и регламент расходятся, выполняется требование.</p>
    ${reqHtml}${matrix}
    <h3>2.${nGroups + 1}. Задачи по выбору</h3>
    <p>Эти задачи выполняются после основных требований и дают дополнительные баллы. Файлы кладутся в папку <code>optional/</code>; при приёмке пара запускает скрипт на стенде или показывает документ.</p>
    ${table(['Файл', 'Что сделать', 'Баллы'], optRows, 'opt')}
    <p class="bridge">Требования выполняются на копии сервера, вдвоём, в течение 14 дней. Как устроены стенд, работа в паре и этапы, описано в части 3.</p>
  </section>`;

  // ——— Часть 3. Порядок работы ———
  const s3 = `<section class="${sec()}" id="s3">
    <h2>3. Порядок работы</h2>
    <h3>3.1. Копия сервера</h3>
    <p class="lead">Изменения на рабочем сервере ${esc(srv)} вносит дежурный инженер по отчёту пары. Пара работает на копии сервера: её разворачивает скрипт стенда в виртуальной машине с Ubuntu 24.04 из занятия 1. У каждого практиканта своя машина и свой стенд; нужно не меньше 2 ГБ свободного места и 2 ГБ памяти.</p>
    <p>Перед первым запуском стенда в VirtualBox создаётся снимок состояния машины: к нему возвращаются, если машина перестала загружаться или потерян доступ к sudo. Стенд создаёт и удаляет учётные записи, правила sudo и каталоги служб, поэтому запускается только в виртуальной машине. Повторный запуск возвращает копию сервера в исходное состояние.</p>
    ${term(['cd ~/Downloads', `wget ${BASE}/materials/${stand}`, `wget ${BASE}/materials/${acc}`, `sudo bash ${stand}`])}
    <p>${req.stand_note}</p>
    <p>Скрипт приёмки ничего не изменяет: он проверяет копию сервера и печатает OK или FAIL по каждому из ${total} пунктов. Пункт FAIL показывает, какое требование не выполнено; перевод пунктов — в Приложении А. Подгонять сервер под скрипт в обход требований запрещено.</p>
    ${term([`sudo bash ~/Downloads/${acc} | tee acceptance.txt`])}
    <h3>3.2. Работа в паре</h3>
    <p>Работа делится на две части, общую часть пара выполняет вместе. Кто из пары практикант 1 и кто практикант 2, записывается в <code>README.md</code>. При приёмке каждый отвечает и за свою часть, и за часть напарника.</p>
    ${table(['Кто', 'Что делает'], req.split.map(([a, b]) => [`<b>${a.replace('Инженер', 'Практикант')}</b>`, b]), 'pairsplit')}
    <p>У пары один репозиторий — <code>${repoName}</code>: его создаёт практикант 1 и добавляет напарника в Settings → Collaborators. Каждый работает в своей ветке (<code>part-1</code>, <code>part-2</code>) и открывает Pull Request в <code>main</code>. Напарник повторяет команды на своём стенде, оставляет замечания и одобряет слияние. Журнал работ <code>runbook.md</code> общий: время, кто из пары, команда, результат, номер требования; ошибки и откаты тоже записываются.</p>
    <h3>3.3. Этапы</h3>
    <p>День 0 — дата выдачи задания. К концу каждого этапа результат загружен в репозиторий, наставник может проверить его без предупреждения.</p>
    ${table(['Этап', 'Срок', 'Результат этапа'], [
      ['1. Подготовка', 'день 2', 'Репозиторий, стенд у каждого, распределение частей, паспорт сервера <code>server-passport.md</code>'],
      ['2. Части практикантов', 'день 7', 'Каждый выполнил свою часть требований и открыл Pull Request'],
      ['3. Ревью', 'день 9', 'Напарник повторил часть на своём стенде, замечания исправлены, ветки слиты'],
      ['4. Сведение', 'день 12', `Общая часть, скрипт <code>${repFile}</code>, документ «${docName}», финальная приёмка на стенде заново`],
      ['5. Сдача', 'день 14', 'Проверка по части 4 в присутствии обоих практикантов'],
    ], 'stages')}
    <h3>3.4. Материалы</h3>
    ${site ? `<p>В работе используются <a href="metodichka.html">методичка</a> (порядок работы, частые сообщения об ошибках, Git в паре), <a href="spravochnik.html">справочник команд</a>, <a href="shablony.zip" download>шаблоны документов и каркасы скриптов</a> и <a href="../../index.html">лекции занятий 3–8</a>. Что изучить по каждой задаче, сказано в разделе <a href="#hints">«Куда смотреть»</a> в конце страницы. <a href="pdf/${tz.file}.pdf" download>PDF этого ТЗ</a> содержит лист согласования и акт сдачи-приёмки.</p>`
      : `<p>Методичка, справочник команд, шаблоны документов и каркасы скриптов, раздел «Куда смотреть» по каждой задаче — на странице задания: <code class="url">${BASE}/${req.slug}.html</code>. Лекции занятий 3–8 — на странице дисциплины ОП.05.</p>`}
    <p class="bridge">Работа заканчивается сдачей репозитория и проверкой в присутствии пары. Что сдаётся и как выставляются баллы, описано в части 4.</p>
  </section>`;

  // ——— Часть 4. Сдача и проверка ———
  const [tA, tB] = tz.tests;
  const tests = [
    ['И-01', 'Решение и приёмка', `Заказчик разворачивает стенд заново. Пара выполняет решение по журналу работ и своим скриптам, затем запускает скрипт приёмки`, `Не дольше 30 минут; все ${total} пунктов OK, вывод совпадает с <code>acceptance.txt</code>`],
    ['И-02', 'Повторяемость', repAction.charAt(0).toUpperCase() + repAction.slice(1), repResult.charAt(0).toUpperCase() + repResult.slice(1)],
    ['И-03', ...tA],
    ['И-04', ...tB],
    ['И-05', 'Журнал и часть напарника', 'Заказчик выбирает строку <code>runbook.md</code> из части напарника', 'Практикант объясняет команду, её ключи и вывод, называет номер требования'],
  ];
  const tree = `${repoName}/
├── README.md            состав пары, кто за что отвечает, итог приёмки
├── server-passport.md   паспорт сервера до изменений
├── runbook.md           журнал работ
├── ${docFile.padEnd(20)} ${docName}
├── ${repFile.padEnd(20)} скрипт повторяемости
├── acceptance.txt       вывод приёмки после финального прогона
├── optional/            задачи по выбору
└── screenshots/         снимки из таблицы ниже`;
  const optSum = tz.optional.reduce((n, o) => n + o[2], 0);
  const s4 = `<section class="${sec()}" id="s4">
    <h2>4. Сдача и проверка</h2>
    <h3>4.1. Что сдаётся</h3>
    <p class="lead">Работа сдаётся одной ссылкой на репозиторий GitHub. <code>README.md</code> начинается с таблицы: практикант 1 и практикант 2, за что отвечает каждый, итог приёмки «N из ${total}»; ниже — команды стенда, решения и приёмки по порядку. В конце две строки: «Не получилось: ___» и «Нейросеть использовалась для: ___».</p>
    <pre class="tree">${esc(tree)}</pre>
    ${table(['Файл', 'Что в нём'], [
      ['<code>server-passport.md</code>', 'паспорт сервера до изменений: версия системы, учётные записи и группы из задания, процессы и их владельцы, заполнение разделов, каталоги из раздела 1.3. Для каждого сведения — команда, которой оно получено.'],
      ...req.deliver,
    ], 'deliver')}
    <p>Шаблоны <code>README.md</code>, журнала работ, паспорта сервера и документа «${docName}», а также каркас скрипта <code>${repFile}</code> — в архиве шаблонов. Команды и их вывод в документах — только с вашей виртуальной машины.</p>
    <h3>4.2. Проверка</h3>
    <p>Проверка проходит в присутствии обоих практикантов и состоит из пяти испытаний. Пара заранее открывает виртуальную машину со снимком, репозиторий и журнал работ. Если испытание не пройдено, пара один раз устраняет замечания в течение 3 дней.</p>
    ${table(['№', 'Что проверяется', 'Действие Заказчика', 'Ожидаемый результат'], tests, 'tests')}
    <h3>4.3. Оценка</h3>
    <p>Работа оценивается в 30 баллов. Оценку получает пара, вклад каждого виден по коммитам, Pull Request и журналу работ.</p>
    ${table(['Что оценивается', 'Баллы'], [
      [`Приёмка на стенде, развёрнутом заново (И-01): баллы пропорциональны числу пунктов OK из ${total}`, '10'],
      [`Скрипт <code>${repFile}</code> выполняет свою задачу на чистом стенде (И-02)`, '5'],
      [`Документ «${docName}»: по фактам, с командами и выводом`, '5'],
      ['Паспорт сервера и журнал работ', '4'],
      ['Работа в паре: свои ветки, Pull Request, ревью с замечаниями', '3'],
      ['Ответы на испытаниях И-03 — И-05', '3'],
      ['<b>Итого</b>', '<b>30</b>'],
      ['Дополнительно: задачи по выбору', '+' + optSum],
    ], 'score keep')}
    ${table(['Баллы', '27–30', '23–26', '18–22', 'меньше 18'], [['Оценка', '5', '4', '3', 'работа возвращается на доработку']], 'grade')}
    <p><b>Работа не принимается</b>, если решение не воспроизводится на стенде, развёрнутом заново, нет журнала работ или права ослаблены ради запуска службы или пункта приёмки.</p>
  </section>`;

  // ——— Приложения ———
  let n = 0;
  const accRows = tz.acceptance.flatMap(([grp, items]) => [[`<b>${grp}</b>`, '', '', ''], ...items.map(([en, ru, ref]) => [String(++n), `<code class="en">${esc(en)}</code>`, ru, ref])]);
  const appA = `<section class="${sec('appendix')}" id="appA">
    <h2>Приложение А. Пункты скрипта приёмки</h2>
    <p>Скрипт <code>${acc}</code> печатает пункты на английском языке, сгруппированные по частям. В таблице — что означает каждый пункт и какое требование части 2 он проверяет. Требования, которые скрипт проверить не может, проверяются по документам и на испытаниях части 4.</p>
    ${table(['№', 'Строка в выводе', 'Что проверяется', 'Требование'], accRows, 'acc')}
  </section>`;

  const regsHtml = tz.regs.map(k => `<div class="reg"><h3>${k} «${REGS[k].title}»</h3><p class="hint">${REGS[k].intro}</p>${REGS[k].sections.map(([h, items]) => `<p class="reg-h">${h}</p>${list(items)}`).join('')}</div>`).join('');
  const appB = `<section class="${sec('appendix')}" id="appB">
    <h2>Приложение Б. Выдержки из регламентов</h2>
    <p>Регламенты ИТ-отдела ООО «Пятый склад», которые относятся к этому заданию. Полные тексты хранятся во внутренней базе знаний группы эксплуатации.</p>
    ${regsHtml}
  </section>`;

  const appV = `<section class="page appendix">
    <h2>Приложение В. Лист согласования</h2>
    ${table(['Должность', 'ФИО', 'Подпись', 'Дата'], [
      [esc(c.director.post), esc(c.director.name), `<span class="sig-cell">${dirSign(120)}</span>`, tz.issued],
      [esc(person[1][0].toUpperCase() + person[1].slice(1)), esc(person[0]), `<span class="sig-cell">${signature(tz.contact.sign, { width: 110, rotate: 2 })}</span>`, tz.issued],
      [esc(c.mentor.post), esc(c.mentor.name), `<span class="sig-cell">${signature(c.mentor.sign, { width: 110, rotate: -1 })}</span>`, tz.issued],
      ['Практикант 1: с заданием ознакомлен', blank, '', blank],
      ['Практикант 2: с заданием ознакомлен', blank, '', blank],
    ], 'agree')}
    <div class="seal-corner">${sealSvg(-4, 140)}</div>

    <h2 class="next">Приложение Г. Акт сдачи-приёмки</h2>
    <p>к техническому заданию № ${esc(tz.code)}. Заполняется Заказчиком при приёмке.</p>
    ${table(['№', 'Испытание', 'Пройдено', 'Замечание'], tests.map(x => [x[0], x[1], '☐ да&nbsp;&nbsp;☐ нет', '']), 'act')}
    <div class="act-foot">
      <div>Итог приёмки: ${blank}<br>Баллы: ${blank}<br>Оценка: ${blank}</div>
      <div>Заказчик: ${blank}<br><span class="hint">подпись, расшифровка</span></div>
      <div class="stamp-place"><span class="hint">место для штампа<br>«Работа принята»</span></div>
    </div>
  </section>`;

  const out = { cover, letter, s1, s2, s3, s4, appA, appB, appV, total };
  site = false;
  return out;
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
p.bridge { margin-top: 3mm; padding: 1.6mm 3mm; border-left: 2pt solid ${tz.accent}; background: #f6f7f9; color: #3b4350; font-size: 9.8pt; }
.score td:last-child, .score th:last-child { text-align: center; width: 18mm; }
ul, ol { margin: 0 0 2.5mm; padding-left: 6mm; }
li { margin-bottom: 1.2mm; }
code { font: 8.8pt "PT Mono", monospace; background: #f1f2f5; padding: .2mm 1mm; border-radius: 1mm; white-space: nowrap; }
code.url { white-space: normal; word-break: break-all; }
code.en { white-space: normal; background: none; padding: 0; font-size: 8.2pt; }
table { width: 100%; border-collapse: collapse; margin: 1.5mm 0 3mm; font-size: 9.4pt; break-inside: auto; }
tr { break-inside: avoid; }
table.keep, pre, .facts, .keep-block, .ticket, .reg { break-inside: avoid; }
th { background: #2b2f36; color: #fff; text-align: left; font-weight: 700; padding: 1.6mm 2mm; }
td { border-bottom: .5pt solid #d5d9e0; padding: 1.5mm 2mm; vertical-align: top; }
tbody tr:nth-child(even) td { background: #f8f9fb; }
.hint { color: #6a7382; font-size: 8.6pt; }
.note.top { margin: 0 0 3mm; font-size: 9pt; color: #4a5260; border-left: 2pt solid ${tz.accent}; padding: 1mm 0 1mm 3mm; }
.blank { display: inline-block; min-width: 60mm; border-bottom: .6pt solid #333; height: 4mm; }

.letterhead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 3mm; border-bottom: 2.4pt solid ${tz.accent}; margin-bottom: 5mm; }
.lh-brand { display: flex; align-items: center; gap: 3mm; }
.lh-name { font-size: 19pt; font-weight: 700; letter-spacing: 2.4pt; color: #2b2f36; line-height: 1; }
.lh-tag { font-size: 8.6pt; color: #6a7382; margin-top: 1mm; }
.lh-req { font-size: 7.6pt; color: #4a5260; text-align: right; line-height: 1.4; }

.cover-top { display: flex; justify-content: space-between; align-items: flex-start; min-height: 46mm; }
.outno { font-size: 9.4pt; color: #4a5260; }
.approve { width: 78mm; font-size: 10pt; position: relative; line-height: 1.5; }
.approve-h { font-weight: 700; letter-spacing: 2pt; margin-bottom: 1mm; }
.sign-line { display: flex; align-items: flex-end; gap: 2mm; height: 12mm; position: relative; }
.sign-line .line { width: 30mm; border-bottom: .6pt solid #333; }
.sig-wrap { position: absolute; left: -2mm; bottom: -3mm; z-index: 2; }
.approve .seal-wrap { position: absolute; left: -24mm; top: 10mm; z-index: 3; mix-blend-mode: multiply; }
.cover-title { margin: 0 0 3mm; }
.toc { columns: 3; column-gap: 8mm; font-size: 9.4pt; margin-top: 3mm; padding: 0; list-style: none; }
.toc li { margin: 0 0 1mm; }
.toc b { color: ${tz.accent}; display: inline-block; width: 7mm; }
.kind { text-transform: uppercase; letter-spacing: 3pt; font-weight: 700; color: ${tz.accent}; font-size: 11pt; }
.num { font-size: 12pt; color: #4a5260; margin-top: 1mm; }
.sub { font-size: 11pt; color: #3b4350; }
.passport td:first-child { width: 58mm; font-weight: 700; }
.passport .blank { margin-top: 1.5mm; }

.letter-to { text-align: right; font-size: 9.6pt; color: #4a5260; }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 4mm 0; }
.facts div { border: .6pt solid #d5d9e0; border-top: 2pt solid ${tz.accent}; padding: 2.5mm; border-radius: 1.5mm; }
.facts b { display: block; font-size: 15pt; }
.facts span { font-size: 8.6pt; color: #4a5260; }
.letter-sign { display: grid; grid-template-columns: 1fr 70mm 40mm; align-items: center; margin: 2mm 0 4mm; min-height: 34mm; }
.letter-sign .sig-wrap { position: relative; left: 0; bottom: 0; }
.letter-sign .seal-wrap { position: absolute; left: 14mm; top: -14mm; z-index: 3; mix-blend-mode: multiply; }
.flow { margin-top: 2mm; }

.about td:first-child { width: 30mm; }
.people td:first-child { width: 46mm; }
.people td:nth-child(3) { width: 24mm; }
.servers td:first-child { width: 24mm; }
.servers td:last-child { width: 16mm; white-space: nowrap; }
.timeline td:first-child { width: 36mm; white-space: nowrap; }
.release td:first-child { width: 48mm; }
.matlist td:first-child { width: 72mm; }
.ticket { border: .8pt solid #c4cad4; border-left: 3pt solid ${tz.accent}; border-radius: 1.5mm; padding: 3mm 4mm 1.5mm; background: #fbfcfd; margin: 1.5mm 0 3mm; }
.t-head { display: flex; gap: 3mm; align-items: baseline; font-size: 11pt; margin-bottom: 1.2mm; }
.t-head b { font-family: "PT Mono", monospace; color: ${tz.accent}; white-space: nowrap; }
.t-meta { display: flex; flex-wrap: wrap; gap: 1mm 5mm; font-size: 8.4pt; color: #5b6575; margin-bottom: 2.4mm; padding-bottom: 1.6mm; border-bottom: .5pt dashed #c4cad4; }
pre.term { font: 8.8pt/1.55 "PT Mono", monospace; background: #1f2430; color: #e6e9ef; border-radius: 1.5mm; padding: 3mm 3.5mm; white-space: pre-wrap; word-break: break-all; margin: 1.5mm 0 3mm; }
ol.req { list-style: none; padding: 0; margin: 0 0 2mm; }
ol.req li { display: grid; grid-template-columns: 13mm 1fr; gap: 2mm; padding: 1.4mm 0; border-bottom: .5pt solid #e3e6eb; break-inside: avoid; }
ol.req li span { font: 700 9pt "PT Mono", monospace; color: ${tz.accent}; padding-top: .3mm; }
.matrix td:first-child { width: 46mm; }
.opt td:first-child { width: 9mm; }
.opt td:nth-child(2) { width: 34mm; }
.opt td:last-child { width: 14mm; text-align: center; }
.pairsplit td:first-child { width: 58mm; }
.deliver td:first-child { width: 40mm; }
.stages td:first-child { width: 40mm; }
.stages td:nth-child(2) { width: 18mm; white-space: nowrap; }
pre.tree { font: 8.6pt/1.5 "PT Mono", monospace; background: #f6f7f9; border: .6pt solid #d5d9e0; border-radius: 1.5mm; padding: 3mm; white-space: pre-wrap; }
.tests td:first-child, .act td:first-child, .acc td:first-child { width: 10mm; white-space: nowrap; }
.tests td:nth-child(2) { width: 28mm; }
.acc td:nth-child(2) { width: 70mm; }
.acc td:last-child { width: 22mm; font-family: "PT Mono", monospace; font-size: 8.6pt; color: ${tz.accent}; }
.score td:last-child, .score th:last-child, .score td:nth-child(2) { text-align: center; width: 18mm; }
.grade td, .grade th { text-align: center; }
.reg { margin-bottom: 3mm; }
.reg h3 { color: ${tz.accent}; margin-top: 3mm; }
.reg-h { font-weight: 700; margin: 2mm 0 1mm; }
.agree td { height: 14mm; vertical-align: middle; }
.agree td:first-child { width: 56mm; }
.sig-cell { display: inline-block; height: 10mm; }
.sig-cell .signature { margin-top: -3mm; }
.seal-corner { position: absolute; right: 30mm; top: 22mm; z-index: 3; mix-blend-mode: multiply; }
.act td:nth-child(3) { width: 30mm; white-space: nowrap; }
.act td:last-child { width: 60mm; }
.act-foot { display: grid; grid-template-columns: 1fr 1fr 60mm; gap: 4mm; margin-top: 5mm; align-items: center; }
.act-foot .blank { min-width: 32mm; }
.stamp-place { text-align: center; border: .8pt dashed #9aa3b1; border-radius: 2mm; height: 22mm; display: flex; align-items: center; justify-content: center; }
`;
}
