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
${p.cover}${p.letter}${p.s1}${p.s3}${p.s4}${p.s5}${p.s6}${p.s9}${p.s11}${p.appA}${p.appB}${p.appV}
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

  const toc = [['', 'Обращение Заказчика'], ['1', 'Цели работы'], ['2', 'Компания и инфраструктура'], ['3', 'Заявка и обстановка'], ['4', 'Рабочее место и стенд'],
    ['5', 'Что надо сделать'], ['6', 'Задачи по выбору'], ['7', 'Работа в паре'], ['8', 'Результат работы'], ['9', 'Этапы и сроки'], ['10', 'Порядок приёмки'],
    ['11', 'Что сдаётся'], ['12', 'Оценка'], ['А', 'Пункты скрипта приёмки'], ['Б', 'Выдержки из регламентов'], ['В', 'Лист согласования'], ['Г', 'Акт сдачи-приёмки']];

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
      ['Срок выполнения', '14 календарных дней с даты выдачи; промежуточные этапы — в разделе 9'],
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

  // ——— 1–2 ———
  const s1 = `<section class="${sec()}" id="s1">
    <h2>1. Цели работы</h2>
    <p class="note top">Термины «должен», «обязательно» обозначают требования, которые проверяются при приёмке. Задачи раздела 6 выполняются по выбору Исполнителей и дают дополнительные баллы.</p>
    ${olist(tz.goals)}
    <h3>Схема работы</h3>
    <p>Схема показывает части работы и их порядок. Номер в блоке — раздел задания, в котором эта часть описана.</p>
    ${site ? '<div class="flow-wrap">' : ''}${flow({ width: 680, height: tz.flow.height, nodes: tz.flow.nodes, links: tz.flow.links })}${site ? '</div>' : ''}

    <h2 id="s2">2. Компания и инфраструктура</h2>
    <p>Сведения ниже общие для всех заданий группы эксплуатации. Имена сотрудников и учётных записей используются в работе так, как они указаны здесь.</p>
    <h3>2.1. О компании</h3>
    ${table(null, ABOUT.map(([a, b]) => [`<b>${a}</b>`, b]), 'about')}
    <h3>2.2. Сотрудники, которых касается задание</h3>
    ${table(['Сотрудник', 'Должность', 'Учётная запись', 'Роль в задании'], tz.people.map(k => PEOPLE[k]), 'people')}
    <h3>2.3. Серверы группы эксплуатации</h3>
    ${table(['Сервер', 'Назначение', 'Службы', 'Задание'], SERVERS.map(r => r[3] === `ТЗ № ${tz.num}` ? r.map(x => `<b>${x}</b>`) : r), 'servers')}
    <p>Все серверы работают под Ubuntu 24.04. Задание выполняется на копии сервера <b>${esc(tz.server.split(',')[0])}</b>.</p>
    <h3>2.4. Регламенты, по которым выполняется работа</h3>
    ${list(tz.regs.map(k => `<b>${k}</b> «${REGS[k].title}» — ${REGS[k].intro.charAt(0).toLowerCase() + REGS[k].intro.slice(1)}`))}
    <p>Выдержки из регламентов — в Приложении Б. Если требование раздела 5 и регламент расходятся, выполняется требование раздела 5.</p>
  </section>`;

  // ——— 3. Заявка ———
  const t = tz.ticket;
  const relHead = req.num === 1 ? 'Состав релиза' : 'Что есть на сервере';
  const s3 = `<section class="${sec()}" id="s3">
    <h2>3. Заявка и обстановка</h2>
    <h3>3.1. Текст заявки</h3>
    <div class="ticket">
      <div class="t-head"><b>${esc(t.no)}</b><span>${esc(t.subject)}</span></div>
      <div class="t-meta"><span>Создана: ${esc(t.date)}</span><span>Автор: ${esc(t.author)}</span><span>Приоритет: ${esc(t.priority)}</span></div>
      ${t.text.map(p => `<p>${p}</p>`).join('')}
    </div>
    <h3>3.2. Хронология</h3>
    ${table(['Когда', 'Что произошло'], tz.timeline, 'timeline')}
    <h3>3.3. ${relHead}</h3>
    ${table(['Файл или каталог', 'Назначение'], req.release.map(([a, b]) => [`<code>${a}</code>`, b]), 'release')}
  </section>`;

  // ——— 4. Стенд ———
  const s4 = `<section class="${sec()}" id="s4">
    <h2>4. Рабочее место и стенд</h2>
    <h3>4.1. Виртуальная машина</h3>
    <p>Изменения на рабочем сервере ${esc(tz.server.split(',')[0])} вносит дежурный инженер по вашему отчёту. Вы работаете на копии сервера: её разворачивает скрипт стенда в вашей виртуальной машине с Ubuntu 24.04, установленной на занятии 1.</p>
    ${list([
      'У каждого практиканта своя виртуальная машина и свой стенд. Свободно не меньше 2 ГБ места на диске и 2 ГБ оперативной памяти.',
      'Перед первым запуском стенда в VirtualBox создаётся снимок состояния машины. Если машина перестала загружаться или потерян доступ к sudo, машину возвращают к снимку.',
      'Стенд запускается только в виртуальной машине: он создаёт и удаляет учётные записи, правила sudo и каталоги служб.',
      'Повторный запуск стенда возвращает копию сервера в исходное состояние. Разворачивать стенд заново можно сколько угодно раз.',
    ])}
    <h3>4.2. Стенд и скрипт приёмки</h3>
    <p>Скачайте скрипты стенда и приёмки и разверните стенд:</p>
    ${term(['cd ~/Downloads', `wget ${BASE}/materials/${stand}`, `wget ${BASE}/materials/${acc}`, `sudo bash ${stand}`])}
    <p>${req.stand_note}</p>
    <p>Скрипт приёмки ничего не изменяет: он проверяет копию сервера и печатает OK или FAIL по каждому пункту, в конце — итог «Result: N of ${total}». Перечень пунктов с переводом — в Приложении А.</p>
    ${term([`sudo bash ~/Downloads/${acc} | tee acceptance.txt`])}
    <p>Пункт FAIL показывает, какое требование не выполнено. Подгонять сервер под скрипт в обход требований запрещено: при приёмке пара объясняет каждое действие из журнала работ.</p>
    <h3>4.3. Материалы</h3>
    ${site ? table(['Материал', 'Что в нём'], [
      [`<a href="pdf/${tz.file}.pdf" download>Это ТЗ в PDF</a>`, 'бланк с подписями, лист согласования и акт сдачи-приёмки для печати'],
      ['<a href="metodichka.html">Методичка</a>', 'порядок работы, частые сообщения об ошибках, Git в паре, защита'],
      ['<a href="spravochnik.html">Справочник команд</a>', 'команды по задачам: осмотр, поиск, диск, учётные записи, sudo, права, процессы, скрипты bash'],
      ['<a href="shablony.zip" download>Шаблоны и каркасы</a>', 'шаблоны документов и каркасы скриптов'],
      ['<a href="#hints">Куда смотреть</a>', 'что изучить и чем себя проверить по каждой задаче — в конце этой страницы'],
      ['<a href="../../index.html">Лекции курса</a>', 'занятия 3–8'],
    ], 'matlist') : table(['Материал', 'Адрес'], [
      ['Задание на сайте дисциплины, раздел «Куда смотреть»', `<code class="url">${BASE}/${req.slug}.html</code>`],
      ['Методичка: порядок работы, частые сообщения об ошибках, Git в паре, защита', `<code class="url">${BASE}/metodichka.html</code>`],
      ['Справочник команд по задачам', `<code class="url">${BASE}/spravochnik.html</code>`],
      ['Шаблоны документов и каркасы скриптов', `<code class="url">${BASE}/shablony.zip</code>`],
      ['Лекции занятий 3–8', '<code class="url">algorthimization-course-vvodnoe.vercel.app/op05-operacionnye-sistemy-i-sredy/</code>'],
    ], 'matlist')}
  </section>`;

  // ——— 5. Требования ———
  let reqHtml = '';
  req.groups.forEach(([g, items], i) => {
    reqHtml += `<h3>5.${i + 1}. ${g}</h3><ol class="req">${items.map((x, j) => `<li><span>5.${i + 1}.${j + 1}</span><div>${x}</div></li>`).join('')}</ol>`;
  });
  let matrix = '';
  if (req.matrix) {
    const [head, rows] = req.matrix;
    matrix = `<h3>Матрица доступа</h3><p>Матрица задаёт, что может каждая роль. Права шире, чем в матрице, считаются ошибкой.</p>${table(head, rows, 'matrix')}
      <p class="hint">Запуск программ из <code>/usr/local/bin</code> разрешён всем. root в матрице не указан: для его процессов права не проверяются.</p>`;
  }
  const s5 = `<section class="${sec()}" id="s5">
    <h2>5. Что надо сделать</h2>
    <p>Требования сгруппированы по частям работы. Номер требования указывается в журнале работ рядом с командами, которые его выполняют, и в Приложении А рядом с пунктом приёмки, который его проверяет.</p>
    ${reqHtml}${matrix}
  </section>`;

  // ——— 6–8 ———
  const optRows = tz.optional.map(([f, text, p], i) => [`6.${i + 1}`, `<code>${f}</code>`, text, `+${p}`]);
  const s6 = `<section class="${sec()}" id="s6">
    <h2>6. Задачи по выбору</h2>
    <p>Задачи выполняются после основных требований, кладутся в папку <code>optional/</code> и проверяются при приёмке: Исполнитель запускает скрипт на стенде или показывает документ и отвечает на вопросы по нему.</p>
    ${table(['№', 'Файл', 'Что сделать', 'Баллы'], optRows, 'opt')}

    <h2 id="s7">7. Работа в паре</h2>
    <h3>7.1. Распределение частей</h3>
    ${table(['Кто', 'Что делает'], req.split.map(([a, b]) => [`<b>${a.replace('Инженер', 'Практикант')}</b>`, b]), 'pairsplit')}
    <p>В <code>README.md</code> записано, кто из пары практикант 1 и кто практикант 2. Каждый отвечает за свою часть и при приёмке отвечает на вопросы по части напарника.</p>
    <h3>7.2. Репозиторий, ветки и ревью</h3>
    ${olist([
      `Один репозиторий на пару — <code>${repoName}</code>. Его создаёт практикант 1 и добавляет напарника в Settings → Collaborators.`,
      'Каждый работает в своей ветке (<code>part-1</code>, <code>part-2</code>) и открывает Pull Request в <code>main</code>.',
      'Напарник проверяет Pull Request: повторяет команды на своём стенде и оставляет замечания во вкладке Files changed. Слияние — после одобрения (Approve).',
      'Журнал работ <code>runbook.md</code> общий: время, кто из пары, команда, результат, номер требования. Ошибки и откаты тоже записываются.',
      'Финальная приёмка — на одной машине: стенд заново, обе части решения, скрипт приёмки. Вывод сохраняется в <code>acceptance.txt</code>.',
    ])}

    <div class="keep-block"><h2 id="s8">8. Результат работы</h2>
    <p>Кроме файлов из таблицы, в репозитории лежит <code>README.md</code>.</p>
    ${table(['Файл', 'Что в нём'], [
      ['<code>server-passport.md</code>', `паспорт сервера до изменений: версия системы, учётные записи и группы, которые касаются задания, работающие процессы и их владельцы, заполнение разделов, каталоги из раздела 3. Для каждого сведения — команда, которой оно получено. Составляется до первой команды, которая изменяет сервер.`],
      ...req.deliver,
      ['<code>acceptance.txt</code>', `вывод скрипта приёмки после финального прогона на стенде, развёрнутом заново: ${total} пунктов.`],
    ], 'deliver')}</div>
    <p>Шаблоны <code>README.md</code>, журнала работ, паспорта сервера и документа «${docName}», а также каркас скрипта <code>${repFile}</code> — в архиве шаблонов (раздел 4.3). Каркас разбирает аргументы, остальное пишет пара.</p>
  </section>`;

  // ——— 9–10 ———
  const tests = [
    ['И-01', 'Стенд и решение', 'Заказчик разворачивает стенд заново на машине Исполнителя. Исполнитель выполняет решение по журналу работ и своим скриптам', 'Решение выполнено не дольше чем за 30 минут; каждая выполненная команда есть в журнале работ'],
    ['И-02', 'Приёмка', `Запустить <code>sudo bash ${acc}</code>`, `Все ${total} пунктов OK; вывод совпадает с <code>acceptance.txt</code> в репозитории`],
    ['И-03', 'Повторяемость', `Заказчик разворачивает стенд заново; ${repAction}`, repResult.charAt(0).toUpperCase() + repResult.slice(1)],
    ...tz.tests.map((x, i) => [`И-${String(4 + i).padStart(2, '0')}`, ...x]),
    ['И-08', 'Журнал работ', 'Заказчик выбирает любую строку <code>runbook.md</code>', 'Исполнитель объясняет команду, каждый её ключ и вывод, называет номер требования'],
    ['И-09', 'Ревью', 'Открыть Pull Request каждого практиканта', 'В каждом есть замечания напарника и ответы на них; слияние выполнено после одобрения'],
    ['И-10', 'Часть напарника', 'Заказчик задаёт каждому практиканту по два вопроса о части напарника', 'Ответ с командой и объяснением её результата'],
  ];
  const s9 = `<section class="${sec()}" id="s9">
    <h2>9. Этапы и сроки</h2>
    <p>День 0 — дата выдачи задания. К концу каждого этапа результат загружен в репозиторий; наставник может проверить промежуточный результат без предупреждения. Сроки из регламентов на время практики заменяются сроками этапов.</p>
    ${table(['Этап', 'Срок', 'Результат этапа'], [
      ['1. Подготовка', 'день 2', 'Репозиторий пары, стенд у каждого, распределение частей в <code>README.md</code>, паспорт сервера <code>server-passport.md</code>'],
      ['2. Части практикантов', 'день 7', 'Каждый выполнил свою часть раздела 5 и открыл Pull Request; команды записаны в журнал работ'],
      ['3. Ревью', 'день 9', 'Напарник повторил часть на своём стенде, замечания исправлены, ветки слиты в <code>main</code>'],
      ['4. Сведение', 'день 12', `Общая часть, скрипт <code>${repFile}</code>, документ «${docName}», финальная приёмка на стенде заново, <code>acceptance.txt</code>`],
      ['5. Сдача', 'день 14', 'Комплект по разделу 11, испытания раздела 10 в присутствии Заказчика'],
    ], 'stages')}

    <h2 id="s10">10. Порядок приёмки</h2>
    <p>Приёмка проходит в присутствии обоих практикантов. Исполнители заранее открывают виртуальную машину со снимком, репозиторий на GitHub и журнал работ. Заказчик проводит испытания в указанном порядке и отмечает результат в акте (Приложение Г).</p>
    ${table(['№', 'Что проверяется', 'Действие Заказчика', 'Ожидаемый результат'], tests, 'tests')}
    <p>Если испытание не пройдено, Исполнители получают перечень замечаний и один раз устраняют их в течение 3 дней. Повторная проверка проводится только по непройденным испытаниям.</p>
  </section>`;

  // ——— 11–12 ———
  const tree = `${repoName}/
├── README.md            номер ТЗ, состав пары, кто за что отвечает, итог приёмки
├── server-passport.md   паспорт сервера до изменений
├── runbook.md           журнал работ
├── ${docFile.padEnd(20)} ${docName}
├── ${repFile.padEnd(20)} скрипт из раздела 8
├── acceptance.txt       вывод приёмки после финального прогона
├── optional/            задачи по выбору (раздел 6)
└── screenshots/         снимки из раздела 8`;
  const s11 = `<section class="${sec()}" id="s11">
    <div class="keep-block"><h2>11. Что сдаётся</h2>
    <p>Всё сдаётся одной ссылкой на репозиторий GitHub. Структура репозитория:</p>
    <pre class="tree">${esc(tree)}</pre></div>
    <p><code>README.md</code> начинается с таблицы: номер ТЗ, практикант 1 и практикант 2 (фамилия, имя, GitHub) и за что отвечает каждый, сервер, итог приёмки «N из ${total}». Ниже — раздел «Как воспроизвести»: команды стенда, решения и приёмки по порядку.</p>
    <p>В конце <code>README.md</code> две строки: «Не получилось: ___» и «Нейросеть использовалась для: ___». Команды и их вывод в документах — только с вашей виртуальной машины.</p>

    <div class="keep-block"><h2 id="s12">12. Оценка</h2>
    ${table(['Часть работы', 'Разделы', 'Баллы'], [
      [`Приёмка на стенде, развёрнутом заново: баллы пропорциональны числу пунктов OK из ${total}`, '5, 10', '30'],
      [`Повторяемость: скрипт <code>${repFile}</code> выполняет свою задачу на чистом стенде`, '8', '15'],
      [`Документ «${docName}»: по фактам, с командами и выводом`, '8', '15'],
      ['Паспорт сервера до изменений', '8', '5'],
      ['Журнал работ: полный, с временем, авторством и номерами требований', '7, 8', '10'],
      ['Работа в паре: свои ветки и Pull Request, ревью с замечаниями', '7', '10'],
      ['Испытания И-04 — И-10 при приёмке', '10', '15'],
      ['<b>Итого</b>', '', '<b>100</b>'],
      ['Дополнительно: задачи по выбору', '6', '+' + tz.optional.reduce((n, o) => n + o[2], 0)],
    ], 'score keep')}
    ${table(['Баллы', '90–100', '75–89', '60–74', 'меньше 60'], [['Оценка', '5', '4', '3', 'работа возвращается на доработку']], 'grade')}
    <p>Оценку получает пара, но вклад каждого виден по коммитам, Pull Request и журналу работ. Если часть работы выполнил один из пары, второй получает 0 баллов за работу в паре и отвечает по своей части отдельно.</p>
    <p><b>Работа не принимается</b> к оценке, если не выполнено хотя бы одно условие: решение воспроизводится на стенде, развёрнутом заново; есть журнал работ; права не ослаблены ради запуска службы или выполнения пункта приёмки.</p></div>
  </section>`;

  // ——— Приложения ———
  let n = 0;
  const accRows = tz.acceptance.flatMap(([grp, items]) => [[`<b>${grp}</b>`, '', '', ''], ...items.map(([en, ru, ref]) => [String(++n), `<code class="en">${esc(en)}</code>`, ru, ref])]);
  const appA = `<section class="${sec('appendix')}" id="appA">
    <h2>Приложение А. Пункты скрипта приёмки</h2>
    <p>Скрипт <code>${acc}</code> печатает пункты на английском языке, сгруппированные по частям. В таблице — что означает каждый пункт и какое требование раздела 5 он проверяет. Требования, которые скрипт проверить не может, проверяются по документам и на испытаниях раздела 10.</p>
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

  const out = { cover, letter, s1, s3, s4, s5, s6, s9, s11, appA, appB, appV, total };
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
