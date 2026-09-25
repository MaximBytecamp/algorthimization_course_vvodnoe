import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
const source=fs.readFileSync(path.join(root,'SOURCE.md'),'utf8');
const slides=[...source.matchAll(/^# Слайд (\d+)\.([^\n]*)\n([\s\S]*?)(?=^# Слайд |$(?![\s\S]))/gm)].map(m=>{const parts={};for(const p of m[3].split(/^## /m).slice(1)){const at=p.indexOf('\n');parts[p.slice(0,at).trim()]=p.slice(at).replace(/\n---\s*$/,'').trim();}return {id:+m[1],title:parts['Заголовок'],text:parts['Текст'],shot:parts['Скриншот'],accent:parts['Акцент']||'',visual:parts['Визуал'],after:parts['После']?+parts['После']:null};});
const base=slides.filter(x=>!x.after);
if(base.length!==93||base.some((x,i)=>x.id!==171+i))throw Error('Ожидались исходные слайды 171–263');
const added=slides.filter(x=>x.after);
for(const x of added)if(!base.some(b=>b.id===x.after))throw Error(`Слайд ${x.id}: «После ${x.after}» — такого исходного слайда нет`);
const deck=[];
for(const b of base){deck.push(b);for(const x of added.filter(a=>a.after===b.id))deck.push(x);}
if(deck.length!==slides.length)throw Error('Часть слайдов потерялась при сборке порядка');
const TOTAL=deck.length;
const code=(s,lang='text')=>`<figure class="code"><figcaption>${esc(lang)}<button data-copy aria-label="Скопировать код">Копировать</button></figcaption><pre><code>${esc(s.trim())}</code></pre></figure>`;
const note=s=>`<aside class="note">${inline(s)}</aside>`;
const cards=(items)=>`<div class="cards">${items.map(([t,c])=>`<article><h3>${inline(t)}</h3><p>${inline(c)}</p></article>`).join('')}</div>`;
const flow=(items)=>`<ol class="flow">${items.map((x,i)=>`<li><small>${String(i+1).padStart(2,'0')}</small><b>${inline(x)}</b></li>`).join('')}</ol>`;
const branch=()=>`<div class="branch"><div class="origin"><small>ОДНО ДЕЙСТВИЕ</small><strong>FORM SUBMIT</strong><span>Пользователь отправляет форму</span></div><div class="branches"><article><small>АНАЛИТИКА ПОВЕДЕНИЯ</small><h3>GA4</h3><code>generate_lead</code><p>Событие попытки отправки.<br>Без имени и email.</p></article><article><small>ОБРАБОТКА ЗАЯВКИ</small><h3>Apps Script → Sheets</h3><code>request_id · status · UTM</code><p>Запись после проверки.<br>Имя и email — только здесь.</p></article></div></div>`;
const download=(file,label)=>`<a class="download" href="files/${file}" download>${label} ↓</a>`;
const ext=(href,label)=>`<a class="ext" href="${href}" target="_blank" rel="noopener noreferrer">${inline(label)} ↗</a>`;
// Разбор кода: слева кусок из листинга, справа — что он делает.
const walk=(items)=>`<dl class="walk">${items.map(([t,c])=>`<div><dt><code>${esc(t)}</code></dt><dd>${inline(c)}</dd></div>`).join('')}</dl>`;
const resource=(href,label,hint)=>`<a class="resource" href="${href}" target="_blank" rel="noopener noreferrer"><small>ОТКРЫТЬ В НОВОЙ ВКЛАДКЕ</small><b>${esc(label)}</b><span>${inline(hint)}</span></a>`;
// Слайд → файл, который на нём разбирают. Под кодом появляется кнопка скачивания.
const fileFor={200:'Code.gs',201:'Code.gs',202:'Code.gs',203:'Code.gs',205:'Code.gs',206:'Code.gs',
  207:'Code.gs',208:'Code.gs',209:'Code.gs',210:'Code.gs',211:'Code.gs',248:'Code.gs',
  204:'form.html',221:'form.html',222:'form.html',223:'form.html',224:'form.html',225:'form.html',
  226:'lead-form.js',227:'script.js',228:'script.js',230:'script.js',232:'script.js',
  212:'Code.gs',233:'script.js',234:'form.html'};
const fileLabel={'Code.gs':'Скачать Code.gs','form.html':'Скачать HTML формы','script.js':'Скачать script.js','lead-form.js':'Скачать lead-form.js'};
// Архив со всеми заготовками темы: собирается заново при каждой сборке.
const ARCHIVE='leads-lab.zip';
try{
  fs.rmSync(path.join(root,'files',ARCHIVE),{force:true});
  execFileSync('zip',['-q','-X',ARCHIVE,'Code.gs','form.html','script.js','lead-form.js'],{cwd:path.join(root,'files')});
}catch(e){console.warn('Архив не собран:',e.message);}
// Разбор кода по слайдам: добавляется под блоком кода.
const explain={
201:[['doPost(e)','Google вызывает эту функцию, когда в адрес /exec приходит POST-запрос.'],
  ['e.parameter','Объект с полями формы: ключ — атрибут name, значение — то, что отправил браузер.'],
  ['doGet','Отдельная функция для обычного открытия адреса. Форме она не нужна.']],
202:[['openById(SPREADSHEET_ID)','Web App работает без открытой таблицы, поэтому таблицу называем по её ID из адреса.'],
  ['getSheetByName(\'leads\')','Берём именно нужный лист, а не первый попавшийся: листов в таблице может стать больше.']],
203:[['String(p[key] || \'\')','Если поля нет совсем, получаем пустую строку, а не ошибку.'],
  ['.trim()','Убирает пробелы по краям: «  Иван » и «Иван» должны считаться одним и тем же.']],
205:[['required.filter(…)','Оставляет имена тех полей, которые пришли пустыми.'],
  ['missing.length','Ноль — всё на месте. Больше нуля — запись не делаем.'],
  ['error: \'missing_required\'','Клиент получает причину отказа, а не молчаливое «ок».']],
206:[['getScriptLock()','Замок один на весь скрипт: две одновременные заявки не смогут писать вместе.'],
  ['tryLock(10000)','Ждём освобождения до 10 секунд, потом отвечаем busy_retry.'],
  ['finally','Замок снимается даже если внутри произошла ошибка — иначе приёмник зависнет.']],
207:[['new Date()','Время берётся с сервера Google, а не из браузера: его нельзя подделать.'],
  ['Часовой пояс','Берётся из настроек таблицы, поэтому его стоит задать сразу.']],
208:[['status = \'new\'','Значение задаёт сервер. Что бы ни прислал клиент, в таблицу попадёт new.']],
209:[['clean(\'utm_source\') || \'direct\'','Пустая метка заменяется заглушкой: в столбце не будет дыр.'],
  ['direct / none / not_set','Три разных заглушки, чтобы потом отличать «пришёл сам» от «метку забыли».']],
210:[['appendRow([…])','Дописывает строку сразу после последней заполненной — искать свободное место не нужно.'],
  ['Порядок значений','Совпадает со столбцами A–I. Переставите — данные уедут не в свои колонки.'],
  ['textCell(…)','Ставит апостроф перед = + - @, чтобы присланный текст не стал формулой таблицы.']],
211:[['createTextOutput(…)','Web App умеет отдавать только текст, поэтому объект превращаем в строку.'],
  ['JSON.stringify(data)','Объект → строка вида {"ok":true,…}.'],
  ['setMimeType(…JSON)','Помечает ответ как JSON, иначе браузер посчитает его обычным текстом.']],
223:[['action','Адрес опубликованного Web App. Именно сюда уходит POST.'],
  ['method="POST"','Данные идут в теле запроса, а не в адресной строке.'],
  ['target="submission-frame"','Ответ открывается в скрытом iframe, и страница остаётся на месте.']],
225:[['type="hidden"','Поле не видно пользователю, но уходит в POST наравне с остальными.'],
  ['name / id','Под name значение ищет Apps Script, под id — JavaScript на странице.']],
227:[['new URLSearchParams(location.search)','Разбирает часть адреса после «?» в удобный объект.'],
  ['(() => { … })();','Функция выполняется сразу и прячет свои переменные: имя params не столкнётся с тем, что уже есть в metrics.js.']],
228:[['params.get(key)','Вернёт значение метки или null, если её в адресе нет.'],
  ['?.trim()','Обрежет пробелы, но не упадёт, когда метки нет.'],
  ['|| fallback','Вместо пустоты подставляет direct, none или not_set.']],
230:[['crypto.randomUUID()','Браузер сам делает случайный идентификатор — совпадения практически исключены.'],
  ['toUpperCase()','Приёмник ждёт верхний регистр: так проверка ID на сервере строже.'],
  ['if (!requestId.value)','ID создаётся один раз. Повторная отправка той же формы придёт с тем же ID, и таблица отклонит дубль.']],
232:[['typeof gtag === \'function\'','Если тег не загрузился или его заблокировали, строка просто не выполнится и форма не сломается.'],
  ['lead_source','Единственный параметр события. Имя и email в GA4 не отправляем.']],
233:[['Нет preventDefault()','Обработчик ничего не отменяет — браузер отправляет POST сам.'],
  ['Порядок','Сначала ID и событие GA4, потом отправка. Иначе поля уедут пустыми.']],
248:[['createTextFinder(id)','Ищет точное совпадение ID по всему столбцу A.'],
  ['matchEntireCell(true)','Совпасть должна вся ячейка, а не её часть.'],
  ['Если нашёлся','Запись не делаем и отвечаем duplicate_request_id — число строк не меняется.']]};
// Подробный разбор для материалов: читать после занятия.
const breakdown=[
 ['Code.gs · приёмник заявок',[
  ['Константы вверху файла',"const SPREADSHEET_ID = '…';\nconst HEADERS = ['request_id', 'created_at', …];",
   'ID таблицы лежит в её адресе между /d/ и /edit. Он вынесен в константу, чтобы при переносе на другую таблицу правку делали в одном месте. HEADERS — эталон заголовков: перед записью скрипт сверяет с ним первую строку листа и отказывается писать, если столбцы переставили.'],
  ['Точка входа','function doPost(e) { … }',
   'Google вызывает doPost сам, когда на адрес /exec приходит POST-запрос. Внутри e.parameter лежат поля формы: ключ — это атрибут name у поля, значение — то, что отправил браузер. Функции doGet в этом приёмнике нет, поэтому при обычном открытии адреса страница выдаст ошибку — так и задумано.'],
  ['Приведение значений',"const clean = key => String(p[key] || '').trim();",
   'Поле может не прийти совсем: тогда p[key] равно undefined. String(… || \'\') превращает это в пустую строку, а trim убирает пробелы по краям. Без этого «  Иван » и «Иван» считались бы разными значениями, а отсутствующее поле роняло бы скрипт.'],
  ['Обязательные поля',"const missing = ['request_id', 'name', 'email', 'direction'].filter(key => !clean(key));\nif (missing.length) return jsonResponse({ok:false, error:'missing_required', fields:missing});",
   'filter оставляет имена тех полей, которые пришли пустыми. Если список не пуст, запись не делается, а клиент получает причину отказа и перечень недостающих полей. Проверка required в HTML для этого не годится: её легко обойти через DevTools или отправив запрос мимо формы.'],
  ['Формат request_id',"if (!/^REQ-[A-F0-9]{8}-…$/i.test(id)) return jsonResponse({ok:false, error:'invalid_request_id'});",
   'Регулярное выражение требует префикс REQ- и полный UUID четвёртой версии. Это отсекает и случайный мусор, и попытки прислать короткий предсказуемый ID, под которым можно было бы подделать чужую заявку.'],
  ['Email и направление',"if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(clean('email'))) …\nif (!['frontend','backend','data'].includes(clean('direction'))) …",
   'Email проверяется простым шаблоном: есть имя, собака, домен с точкой. Направление сверяется со списком из трёх значений — это белый список: всё, чего в нём нет, отклоняется. Так в таблицу не попадёт направление, которого не существует.'],
  ['Длина полей',"if (['name','email','utm_source',…].some(key => clean(key).length > 200)) …",
   'Ограничение в 200 символов защищает таблицу от гигантских строк: ячейка Google Sheets вмещает до 50 000 символов, и один запрос мог бы забить лист мусором.'],
  ['Блокировка',"const lock = LockService.getScriptLock();\nif (!lock.tryLock(10000)) return jsonResponse({ok:false, error:'busy_retry'});",
   'Две заявки могут прийти в одну и ту же секунду. Без блокировки оба вызова успели бы проверить отсутствие дубля и записать одинаковый ID. Замок один на весь скрипт: второй вызов ждёт до 10 секунд и только потом отвечает busy_retry.'],
  ['Проверка листа',"if (!sheet || sheet.getRange(1,1,1,9).getValues()[0].join('|') !== HEADERS.join('|')) …",
   'Перед записью скрипт читает первую строку и сравнивает её с эталоном. Если лист переименовали или столбцы поменяли местами, приёмник откажется писать, а не разложит данные по чужим колонкам.'],
  ['Поиск дубля',"const duplicate = sheet.getRange('A:A').createTextFinder(id)\n  .matchEntireCell(true).matchCase(false).findNext();",
   'createTextFinder ищет по всему столбцу A. matchEntireCell требует совпадения ячейки целиком, иначе нашлось бы частичное вхождение. Если совпадение есть — запись не делается и клиент получает duplicate_request_id.'],
  ['Серверные поля',"const createdAt = new Date();\nconst source = clean('utm_source') || 'direct';\nconst status = 'new';",
   'Время берётся с сервера Google, а не из браузера: подделать его нельзя. Пустые метки заменяются заглушками direct / none / not_set — так в столбцах не остаётся дыр, и видно разницу между «пришёл сам» и «метку потеряли». Статус всегда new: что бы ни прислал клиент, поле игнорируется.'],
  ['Запись строки',"sheet.appendRow([id, createdAt, textCell(clean('name')), …]);\nSpreadsheetApp.flush();",
   'appendRow дописывает строку сразу после последней заполненной — искать свободное место не нужно. Порядок значений в массиве совпадает со столбцами A–I; переставите местами — данные уедут в чужие колонки. flush заставляет Google записать изменения немедленно, до снятия блокировки.'],
  ['Защита от формул',"function textCell(value) {\n  return /^[=+@-]/.test(value) ? \"'\" + value : value;\n}",
   'Google Sheets считает формулой всё, что начинается с =, +, - или @. Если посетитель отправит имя вида =1+1, таблица посчитает его выражением. Апостроф в начале заставляет Sheets воспринимать значение как текст.'],
  ['Обработка ошибок',"catch (error) {\n  return jsonResponse({ok:false, error:'storage_error'});\n} finally {\n  lock.releaseLock();\n}",
   'Клиенту возвращается только общий код ошибки: подробности о таблице и содержимом заявки наружу не уходят. Блок finally снимает замок в любом случае — иначе после первой же ошибки приёмник завис бы для всех следующих заявок.'],
  ['Формат ответа',"return ContentService.createTextOutput(JSON.stringify(data))\n  .setMimeType(ContentService.MimeType.JSON);",
   'Web App умеет отдавать только текст, поэтому объект превращается в строку через JSON.stringify. setMimeType помечает ответ как JSON — без этого браузер счёл бы его обычным текстом.']]],
 ['js/script.js · форма на сайте',[
  ['Изолирующая функция',"(() => {\n  const leadForm = document.querySelector('#lead-form');\n  if (!leadForm) return;\n  …\n})();",
   'Весь код формы завёрнут в функцию, которая выполняется сразу. Её переменные не видны снаружи, поэтому имя params не столкнётся с таким же именем в js/metrics.js. Проверка if (!leadForm) return нужна, потому что скрипт подключён ко всем страницам, а форма есть только на Contacts.'],
  ['Метки кампании',"const params = new URLSearchParams(window.location.search);\nconst defaults = {utm_source:'direct', utm_medium:'none', utm_campaign:'not_set'};\nfor (const [key, fallback] of Object.entries(defaults)) {\n  leadForm.elements.namedItem(key).value = params.get(key)?.trim() || fallback;\n}",
   'URLSearchParams разбирает часть адреса после «?» в объект. params.get возвращает значение метки или null, если её нет; ?. позволяет вызвать trim, не упав на null. Оператор || подставляет заглушку вместо пустого значения. Один цикл заполняет все три скрытых поля.'],
  ['Идентификатор заявки',"if (!requestId.value) requestId.value = 'REQ-' + crypto.randomUUID().toUpperCase();",
   'crypto.randomUUID даёт случайный идентификатор прямо в браузере — совпадения практически исключены. toUpperCase нужен потому, что приёмник ждёт верхний регистр. Условие if (!requestId.value) означает, что ID создаётся один раз: если посетитель нажмёт «Отправить» дважды, уйдёт тот же ID, и таблица отклонит повтор.'],
  ['Событие GA4',"if (typeof gtag === 'function') {\n  gtag('event', 'generate_lead', {lead_source: 'contact_form'});\n}",
   'Проверка typeof нужна на случай, когда тег не загрузился или его заблокировали: без неё форма перестала бы отправляться. В параметры уходит только источник заявки. Имя и email в GA4 не передаются — это персональные данные.'],
  ['Отправка без preventDefault',"// preventDefault() не вызываем: браузер отправляет POST сам.",
   'В теме 6 обработчик отменял отправку, потому что форма была учебной. Теперь отмены нет: браузер сам выполняет POST по адресу из action. Ответ приёмника открывается в скрытом iframe, поэтому страница остаётся на месте и посетитель видит сообщение под формой.']]],
 ['Формулы Google Sheets',[
  ['Список допустимых статусов','new\nin_progress\ndone\nrejected',
   'Это не формула, а правило проверки данных на диапазоне I2:I1000. Заголовок в правило не входит — иначе слово «status» само стало бы недопустимым значением. Режим «Запрещать ввод данных» не пускает в ячейку ничего, кроме четырёх значений; режим «Показывать предупреждение» только подсветил бы ошибку, но значение принял.'],
  ['Подсветка неполной заявки','=AND($A2<>"";COUNTBLANK($C2:$E2)>0)',
   'Условное форматирование применяет формулу к каждой строке диапазона по очереди. $A2 — столбец закреплён знаком $, а номер строки Sheets подставляет свой: для четвёртой строки формула читается как $A4. Первая часть проверяет, что строка вообще начата: в ней есть request_id. COUNTBLANK считает пустые ячейки среди C, D и E — это name, email и direction. Если пустых больше нуля, строка подсвечивается. AND требует, чтобы оба условия выполнились разом, иначе подсветились бы все пустые строки листа.'],
  ['Поиск повторяющегося ID','=AND($A2<>"";COUNTIF(A:A;$A2)>1)',
   'COUNTIF считает, сколько раз значение из $A2 встречается во всём столбце A. Сама ячейка тоже попадает в подсчёт, поэтому обычное значение даёт единицу, а дубль — два и больше: отсюда сравнение >1. Диапазон A:A взят целиком, чтобы правило работало и на строках, добавленных позже. Условие $A2<>"" отсекает пустые ячейки: они одинаковы между собой, но дублями заявок не являются.']]]];
const breakdownHtml=()=>`<h2>Разбор кода</h2><p>Что делает каждый блок и почему он написан именно так.</p>`+breakdown.map(([title,items])=>`<section class="breakdown"><h3>${esc(title)}</h3>${items.map(([h,c,t])=>`<article><h4>${esc(h)}</h4>${code(c,'')}<p>${inline(t)}</p></article>`).join('')}</section>`).join('');
// Путь по кликам: последовательность того, куда нажимать.
const clickPath=(items)=>`<p class="path">${items.map(x=>`<b>${inline(x)}</b>`).join('<i>→</i>')}</p>`;
const clicks={
180:['sheets.google.com','Пустая таблица'],
181:['Клик по названию «Новая таблица»','Ввести GA4 Analytics Lab — Leads','Enter'],
182:['Двойной клик по ярлыку «Лист1»','Ввести leads','Enter'],
189:['Выделить I2:I','Данные','Настроить проверку данных','Добавить правило','Раскрывающийся список'],
193:['Выделить A2:I','Формат','Условное форматирование','Добавить правило','Ваша формула'],
194:['Формат','Условное форматирование','Добавить правило','Ваша формула'],
199:['Расширения','Apps Script'],
213:['Клик по названию проекта','Ввести имя','Переименовать','⌘ + S'],
214:['Начать развертывание','Новое развертывание'],
215:['Шестерёнка «Выберите тип»','Веб-приложение'],
216:['Описание','Запуск от имени: от моего имени','У кого есть доступ: Все','Начать развертывание'],
217:['Предоставить доступ','Выбрать аккаунт','Advanced','Go to … (unsafe)','Continue'],
218:['Копировать URL','Готово'],
235:['Иконка Source Control','Проверить список изменённых файлов'],
236:['Ввести сообщение коммита','Commit','Sync Changes'],
250:['Клик по ячейке status','Клик по стрелке','Выбрать значение'],
265:['Клик по любой ячейке','Вид','Закрепить','1 строку'],
266:['Заголовок столбца B','Формат','Числа','Дата и время'],
267:['Заголовки A…I','Правый клик','Изменить размер столбцов A–I','Автоподбор размера','ОК'],
268:['Клик по A2','⌘ + Shift + ↓','Добавить правило']};
const custom={

225:`<p>Внутрь формы добавьте четыре скрытых поля — по одному на каждое системное значение.</p>${code('<input type="hidden" name="request_id" id="request_id">\n<input type="hidden" name="utm_source" id="utm_source">\n<input type="hidden" name="utm_medium" id="utm_medium">\n<input type="hidden" name="utm_campaign" id="utm_campaign">','contacts.html')}<p>Пользователь их не заполняет — значения подставит JavaScript.</p>`,
180:`<p>Откройте Google Таблицы и создайте новую пустую таблицу.</p>${resource('https://sheets.google.com','sheets.google.com','Кнопка «Пустая таблица» в блоке «Создать таблицу»')}${note('Войдите в тот же аккаунт Google, в котором потом будете публиковать Apps Script.')}`,
220:`<p>Продолжаем существующий сайт и его репозиторий — новый проект не создаём.</p><p>${ext('https://ga4-analytics-lab-ivanov.vercel.app','ga4-analytics-lab-ivanov.vercel.app')} · ${ext('https://github.com/MaximBytecamp/ga4-analytics-lab-ivanov','репозиторий на GitHub')}</p>${cards([['contacts.html','Расширяем уже существующую lead-form.'],['js/script.js','Заменяем только прежний submit-обработчик.']])}${note('Google Tag, CTA и js/metrics.js сохраняем. Новый репозиторий и новый Vercel-проект не создаём.')}`,
237:`<p>Откройте свой проект на Vercel и убедитесь, что последний deployment — это ваш коммит.</p>${resource('https://vercel.com/dashboard','vercel.com/dashboard','Project → Deployments → статус Ready')}${code('Add Google Sheets lead collection','СООБЩЕНИЕ ПОСЛЕДНЕГО DEPLOYMENT')}${note('Пока deployment не Ready, форма на боевом адресе продолжает работать по-старому.')}`,
227:`<p>В js/metrics.js уже есть переменная params. Код новой формы помещаем в отдельную функцию, чтобы имена не конфликтовали.</p>${code("(() => {\n  const leadForm = document.querySelector('#lead-form');\n  if (!leadForm) return;\n  const params = new URLSearchParams(location.search);\n  // Заполнение UTM и обработчик submit — внутри.\n})();",'js/script.js')}`,

171:`<p class="lead">UTM, сайт на Vercel и Google Tag уже дают события. Теперь найдём место для самой заявки.</p>${branch()}${note('Событие generate_lead само по себе не доказывает, что заявка сохранена.')}`,
172:cards([['GA4 · что сделал посетитель','generate_lead · страница · источник · кампания'],['Таблица · что обработать','request_id · created_at · name · email · status']])+note('Имя и email не передаём в параметры GA4.'),
173:branch(),
174:flow(['Модель заявки','Таблица leads','Правила качества','Apps Script','Форма + UTM','POST + GA4','Проверка записи','Ошибки и дубли'])+note('Восемь этапов объединяют все 13 задач исходника. В конце — две записи: direct и telegram.'),
175:cards([['Идентичность','request_id · created_at'],['Содержание','name · email · direction'],['Источник','utm_source · utm_medium · utm_campaign'],['Состояние','status']])+note('Девять столбцов. У каждого поля есть назначение.'),
177:cards([['Человек','name · email · direction'],['Адрес страницы','utm_source · utm_medium · utm_campaign'],['Код','request_id — браузер; created_at и status — сервер']]),
178:cards([['В форме','Имя, email и направление.'],['В коде браузера','request_id и UTM можно изменить через DevTools: сервер проверяет их.'],['Только на сервере','created_at и status создаёт Apps Script.']]),
183:`<p>Вставьте заголовки в <strong>A1:I1</strong>, закрепите строку 1. Для даты в B выберите формат даты и времени.</p>${code('request_id\tcreated_at\tname\temail\tdirection\tutm_source\tutm_medium\tutm_campaign\tstatus','TSV · копировать в A1')}`,
189:`<p>Выделите <code>I2:I</code> → <strong>Данные → Проверка данных</strong>. Заголовок не включаем.</p>${code('new\nin_progress\ndone\nrejected','DROPDOWN')}${walk([['I2:I','Правило начинается со второй строки: в первой лежит заголовок столбца.'],['Раскрывающийся список','Sheets рисует в ячейке чип со стрелкой и не даёт набрать своё.'],['Запрещать ввод данных','Любое значение, кроме этих четырёх, ячейка не примет совсем.']])}`,
193:`<p>Для диапазона <code>A2:I</code> выберите «Ваша формула». Подсвечиваем только начатые строки с пропущенным обязательным полем.</p>${code('=AND($A2<>"";COUNTBLANK($C2:$E2)>0)','GOOGLE SHEETS')}${walk([['$A2<>""','Строка уже начата: в ней есть request_id. Пустые строки не трогаем.'],['COUNTBLANK($C2:$E2)','Считает пустые ячейки среди name, email и direction — это обязательные поля.'],['>0','Хотя бы одна пустая — значит заявка неполная.'],['AND(…)','Подсветка включается, только когда оба условия верны сразу.'],['Знак $ перед буквой','Столбец закреплён, номер строки Sheets подставляет свой для каждой строки диапазона.']])}${note('Формула записана для русской локали, где аргументы разделяет «;». Если в вашей таблице разделитель «,» — замените его.')}`,
194:`<p>Диапазон <code>A2:A</code> → Условное форматирование → Ваша формула.</p>${code('=AND($A2<>"";COUNTIF(A:A;$A2)>1)','GOOGLE SHEETS')}${walk([['COUNTIF(A:A;$A2)','Сколько раз этот request_id встречается во всём столбце A.'],['>1','Ячейка считает и саму себя, поэтому дубль начинается с двух.'],['$A2<>""','Пустые ячейки одинаковы между собой, но дублями не считаются.']])}${note('Номер строки в формуле совпадает с началом диапазона. В локали с разделителем «,» замените «;» на «,».')}`,
196:flow(['Структура ✓','Статусы ✓','Обязательные поля ✓','Дубли ✓'])+note('Таблица подготовлена. Следующий этап — приём настоящего POST.'),
197:flow(['Форма на Vercel','POST','Apps Script','Лист leads'])+note('Доступ к таблице остаётся у скрипта. Браузер знает только URL приёмника.'),
202:`<p>Скопируйте ID таблицы из адреса между <code>/d/</code> и <code>/edit</code>. Web App открывает её явно.</p>${code("const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ';\nconst sheet = SpreadsheetApp\n  .openById(SPREADSHEET_ID)\n  .getSheetByName('leads');",'Code.gs')}${note('getActiveSpreadsheet() не используем: в контексте Web App активной таблицы нет.')}`,
206:`<p>Проверяем ID и записываем строку под одной блокировкой.</p>${code("const lock = LockService.getScriptLock();\nlock.waitLock(10000);\ntry {\n  // Найти ID → отклонить дубль → appendRow\n  SpreadsheetApp.flush();\n} finally {\n  lock.releaseLock();\n}",'ФРАГМЕНТ · полный файл на слайде 212')}${note('Без блокировки два одновременных запроса могут оба пройти проверку до первой записи.')}`,
210:`<p>Порядок значений совпадает с A–I. Пользовательский текст записываем через <code>textCell()</code>.</p>${code("sheet.appendRow([\n  id, createdAt,\n  textCell(clean('name')),\n  textCell(clean('email')), clean('direction'),\n  textCell(source), textCell(medium),\n  textCell(campaign), status\n]);",'Code.gs')}${note('textCell() не даёт строке, начинающейся с =, превратиться в формулу. Функция есть в полном файле.')}`,
212:`<p class="lead">Скачайте готовый <code>Code.gs</code>, вставьте целиком и укажите ID своей таблицы.</p>${cards([['Вход','Обязательные поля, email, direction, формат ID.'],['Запись','Блокировка, поиск дубля, timestamp и status=new.'],['Ответ','JSON: ok, request_id или код ошибки.']])}${note('Полный файл дополнен проверкой заголовков и длины полей. Это учебный приёмник, не production API.')}`,
216:`<p>Описание: <code>GA4 Leads Receiver v1</code>.</p>${cards([['Execute as','Me / Я — скрипт пишет в вашу таблицу.'],['Who has access','Anyone / Все — для посетителя без входа в Google.']])}${note('Публикуем только учебный приёмник с тестовыми данными. Если политика Workspace запрещает доступ «Все», не обходите её: используйте разрешённый учебный аккаунт.')}`,
224:flow(['Форма','POST в named iframe','Apps Script'])+code('<iframe name="submission-frame"\n  id="submission-frame"\n  title="Ответ приёмника" hidden></iframe>','contacts.html')+note('Имя iframe совпадает с target формы. Скрытый ответ с другого origin нельзя прочитать из страницы: сохранение проверяем в Sheets.'),
228:`<p>Этот код выполняется внутри <code>if (leadForm)</code>: на Home и About формы нет.</p>${code("const defaults = {\n  utm_source: 'direct',\n  utm_medium: 'none',\n  utm_campaign: 'not_set'\n};\nfor (const [key, fallback] of Object.entries(defaults)) {\n  leadForm.elements.namedItem(key).value =\n    params.get(key)?.trim() || fallback;\n}",'js/script.js')}`,
230:`<p>Создаём полный UUID перед первой отправкой. Для повторной доставки сохраняем тот же ID.</p>${code("if (!requestId.value) {\n  requestId.value = 'REQ-' +\n    crypto.randomUUID().toUpperCase();\n}",'js/script.js')}${note('Не обрезаем UUID до 8 символов. Новая заявка — кнопка «Новая заявка» / reset. Сервер всё равно проверяет формат и дубль.')}`,
232:`<p>Событие остаётся в обработчике <code>submit</code>. Имя и email в параметры не передаём.</p>${code("if (typeof window.gtag === 'function') {\n  window.gtag('event', 'generate_lead', {\n    lead_source: 'contact_form'\n  });\n}",'js/script.js')}${note('В этой версии событие означает попытку отправки. Доказательство сохранения — строка в Sheets, а не событие GA4.')}`,
233:`<p>Замените старый submit-обработчик из темы 6. Остальные события оставьте.</p>${code("leadForm.addEventListener('submit', () => {\n  if (!requestId.value) {\n    requestId.value = 'REQ-' + crypto.randomUUID().toUpperCase();\n  }\n  if (typeof window.gtag === 'function') {\n    window.gtag('event', 'generate_lead', {\n      lead_source: 'contact_form'\n    });\n  }\n  // Браузер выполняет обычный POST.\n});",'КЛЮЧЕВОЙ ФРАГМЕНТ')}${note('Старый preventDefault() остановит POST, даже если новый обработчик правильный. Не оставляйте два обработчика формы.')}`,
234:`<p>Одна существующая форма; три видимых поля, четыре hidden-поля и iframe после формы.</p>${code('<form id="lead-form"\n  action="ВАШ_APPS_SCRIPT_URL"\n  method="POST" target="submission-frame">\n  <!-- name, email, direction -->\n  <!-- request_id, utm_source, utm_medium, utm_campaign -->\n  <button type="submit">Отправить заявку</button>\n  <button type="reset">Новая заявка</button>\n</form>\n<iframe name="submission-frame" hidden></iframe>','СТРУКТУРА · полный код в файле')}${note('Hidden не означает защищённый. Timestamp и status отсутствуют в форме и создаются сервером.')}`,
239:`<p>Найдите новую строку на листе <code>leads</code>. Сверьте ID из сообщения под формой.</p>${code('REQ-…  |  дата и время  |  Иван Тестов\nstudent@example.com  |  backend\ndirect  |  none  |  not_set  |  new','ОЖИДАЕМЫЕ ЗНАЧЕНИЯ')}${note('Сообщение «POST отправляется» не подтверждает результат. Если строки нет — проверьте Executions в Apps Script, URL /exec и права Web App.')}`,
243:`<p>Откройте Realtime или DebugView и найдите <code>generate_lead</code> после теста формы.</p><p>${ext('https://analytics.google.com/analytics/web/','analytics.google.com')}</p>${cards([['GA4','Есть событие попытки отправки.'],['Google Sheets','Есть строка с тем же учебным сценарием и нужными UTM.']])}${note('Эти проверки независимы. Блокировщик может остановить GA4, а ошибка приёмника — запись в таблицу.')}`,
248:`<p>Повторный POST с тем же ID не должен добавлять строку. Это отдельная проверка от ручного копирования строки.</p>${code("{\n  \"ok\": false,\n  \"error\": \"duplicate_request_id\"\n}",'ОЖИДАЕМЫЙ JSON')}${note('Отправьте повторно без «Новая заявка», сравните число строк. Для просмотра JSON временно задайте target="_blank". Проверка и запись защищены ScriptLock.')}`,
250:`<p>Откройте dropdown одной тестовой заявки. Пройдите допустимые состояния.</p>${flow(['new','in_progress','done'])}${note('После демонстрации дубля удалите только добавленную тестовую копию строки. Оригинал оставьте.')}`,
254:branch()+flow(['UTM-ссылка','Форма','Проверки на сервере','Запись в leads']),
256:`<p>POST отправляется в скрытый iframe. Страница пока не обрабатывает JSON-ответ.</p>${cards([['Уже есть','В ответе Apps Script — ok и error.'],['Пока нет','Подтверждения успешного сохранения в интерфейсе формы.']])}${note('ContentService в этом примере не выставляет произвольные HTTP 400/409/500. JSON-ошибка и HTTP-статус — разные вещи. Контракт и подтверждение разберём в теме API/Webhook.')}`,
262:branch()+note('Результат: контролируемая таблица заявок v1. Проверены direct, UTM, обязательные поля, дубли и словарь статусов.'),
263:flow(['Google Sheets','CSV','Power Query','Applied Steps','Refresh'])+`<p class="lead">Следующая тема: повторяемая очистка вместо ручного исправления.</p>`
};
// Пункт перечисления: короткая строка, которая кончается «;» — или «.» сразу после таких строк.
const isBullet=(p,started)=>!p.includes('\n')&&p.length<130&&!/^\d+\. /.test(p)&&(/;$/.test(p)||(started&&/\.$/.test(p)));
function paragraphs(part){
  const out=[];let bullets=[];
  const flush=()=>{if(bullets.length){out.push(`<ul class="bullets">${bullets.map(b=>`<li>${inline(b.replace(/[;.]$/,''))}</li>`).join('')}</ul>`);bullets=[];}};
  for(const p of part.trim().split(/\n\s*\n/).filter(Boolean)){
    if(isBullet(p,bullets.length>0)){bullets.push(p);continue;}
    flush();
    if(/^\d+\. /m.test(p)){out.push(`<ol class="list">${p.split(/\n(?=\d+\. )/).map(v=>`<li>${inline(v.replace(/^\d+\. /,''))}</li>`).join('')}</ol>`);continue;}
    out.push(`<p>${inline(p).replace(/\n/g,'<br>')}</p>`);
  }
  flush();
  return out.join('');
}
function markdown(text){const chunks=text.split(/(```[\s\S]*?```)/g);return chunks.map(part=>{if(part.startsWith('```')){const m=part.match(/^```([^\n]*)\n([\s\S]*?)```$/);return code(m[2],m[1]||'text');}return paragraphs(part);}).join('');}
const stageOf=id=>id<180?'01 / Событие и заявка':id<197?'02 / Контролируемая таблица':id<213?'03 / Приёмник Apps Script':id<220?'04 / Публикация Web App':id<235?'05 / Форма и UTM':id<244?'06 / Сквозная проверка':id<251?'07 / Качество данных':'08 / Итог и Power Query';
const anchorOf=id=>{const x=deck.find(d=>d.id===id);return x&&x.after?x.after:id;};
const stage=id=>stageOf(anchorOf(id));
const dark=new Set([171,173,196,197,219,251,254,262,263]);
const corrections={179:'Используйте только вымышленные значения. В событие GA4 не отправляйте содержимое полей.',187:'В этой практике UTM читаем с текущей страницы Contacts. Для перехода с Home метки нужно сохранять отдельно — здесь это ещё не реализовано.',209:'direct / none / not_set — наш учебный словарь. Это не гарантия совпадения с атрибуцией сессии GA4.',218:'Нужен /exec, не /dev. После правки кода: Управление развёртываниями → Изменить → Новая версия.',225:'Скрытые поля доступны в DevTools. Сервер не доверяет их значениям без проверки.',229:'Для этой проверки открывайте contacts.html сразу с UTM. Перенос между страницами автоматически не происходит.',231:'В полном примере UUID длиннее показанных в схеме коротких ID. Положение строки и ID не связаны.',247:'Это ручная демонстрация подсветки. Она не проверяет защиту от повторного POST: этот тест — следующий.',249:'Dropdown защищает ручной ввод. Сервер отдельно игнорирует присланный status и назначает new.'};
fs.mkdirSync(path.join(root,'shots'),{recursive:true});
const shots=deck.filter(s=>s.shot).map(s=>({sourceSlide:s.id,lessonSlide:deck.indexOf(s)+1,file:`${s.id}-shot.png`,screen:s.shot,accent:s.accent,status:fs.existsSync(path.join(root,'shots',`${s.id}-shot.png`))?'captured':'pending'}));
fs.writeFileSync(path.join(root,'shots/manifest.json'),JSON.stringify(shots,null,2));
const captureNotes={225:'VS Code: фрагмент формы для существующего contacts.html, четыре hidden-поля.',234:'VS Code: полный фрагмент form.html для замены формы. URL /exec ещё нужно подставить.',227:'VS Code: подготовленный script.js, URLSearchParams внутри отдельной функции.',228:'VS Code: заполнение UTM в hidden-полях, проверка наличия формы.',233:'VS Code: подготовленный submit-обработчик; ниже сохранён существующий CTA.'};
const shot=s=>{const file=`${s.id}-shot.png`;const exists=fs.existsSync(path.join(root,'shots',file));return `<figure class="shot">${exists?`<button data-zoom><img src="shots/${file}" alt="${esc(s.shot)}"></button>`:`<div class="shot-placeholder"><small>КАДР ${s.id}</small><span class="camera">▣</span><strong>${inline(s.shot).replace(/\n/g,' ')}</strong><span>${inline(s.accent).replace(/\n/g,' ')}</span><code>shots/${file}</code><small>Скриншот ещё не снят</small></div>`}<figcaption>${esc(file)} · ${inline(captureNotes[s.id]||s.accent||s.shot).replace(/\n/g,' ')}</figcaption></figure>`;};
const simulation=`<div class="sim"><p><b>Локальная модель</b> — в Google ничего не отправляется.</p><div class="sim-actions"><button data-sim="valid">Корректная заявка</button><button data-sim="missing">Пустое имя</button><button data-sim="duplicate">Тот же ID</button><button data-sim="status">status=done из формы</button></div><output id="sim-output" aria-live="polite">Выберите сценарий: увидим решение приёмника.</output></div>`;
const html=deck.map((s,i)=>{let body=custom[s.id]||markdown(s.text);
// Ссылка на файл живёт в шапке блока кода: слайд не становится выше.
if(fileFor[s.id]&&!body.includes('class="download"')){const f=fileFor[s.id];
  body=body.includes('<button data-copy')
    ?body.replace('<button data-copy',`<a class="dl" href="files/${f}" download>${f} ↓</a><button data-copy`)
    :body+download(f,fileLabel[f]);}
if(clicks[s.id])body=clickPath(clicks[s.id])+body;
if(explain[s.id]){const w=walk(explain[s.id]);const at=body.indexOf('<aside class="note">');body=at>=0?body.slice(0,at)+w+body.slice(at):body+w;}
if(s.id===174)body+=`<aside class="note">Готовый код всех изменений можно скачать со слайдов: <a class="ext" href="files/${ARCHIVE}" download>архив со всеми файлами темы</a>. Переписывать вручную не нужно.</aside>`;
if(corrections[s.id])body+=note(corrections[s.id]);if(s.id===246)body=simulation+flow(['HTML required','Серверная проверка','Запись или отказ']);if([260,261].includes(s.id))body=`<div class="checklist">${s.text.split(/\n\s*\n/).filter(p=>p&&p!=='Сделайте скриншоты:'&&p!=='После занятия студент должен объяснить:').map(p=>p.split(/\n/).map(t=>`<label><input type="checkbox">${inline(t.replace(/^\d+\. /,''))}</label>`).join('')).join('')}</div>`;return `<section class="lesson-slide ${dark.has(s.id)?'dark':''} ${s.shot?'with-shot':''}" id="slide-${s.id}" data-stage="${stage(s.id)}"><div class="inner"><div class="kicker">${stage(s.id)}<span>ИСХОДНИК ${s.id} · ${i+1} / ${TOTAL}</span></div><h${i===0?1:2}>${inline(s.title)}</h${i===0?1:2}><div class="${s.shot?'workbench':'content'}"><div class="copy">${body}</div>${s.shot?shot(s):''}</div></div></section>`;}).join('\n');
const head=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c2733"><title>ОП.03 · Тема 7 · Контролируемая таблица заявок</title><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="styles.css"></head>`;
const sources=[['Apps Script Web Apps','https://developers.google.com/apps-script/guides/web'],['Доступ к связанным файлам из Web App','https://developers.google.com/apps-script/guides/bound'],['ScriptLock','https://developers.google.com/apps-script/reference/lock/lock-service'],['appendRow и формулы','https://developers.google.com/apps-script/reference/spreadsheet/sheet'],['Content Service','https://developers.google.com/apps-script/guides/content']];
fs.writeFileSync(path.join(root,'index.html'),head+`<body class="leads"><a class="skip" href="#slides">К слайдам</a><div class="presentation"><header><a class="brand" href="../../index.html"><b>И/Т</b><span>ОП.03 · ТЕМА 07<small>Форма → заявка → качество данных</small></span></a><nav><button data-open="contents">Содержание</button><a href="materials.html">Материалы</a><button data-open="sources" aria-label="Источники">S</button><button id="fullscreen" aria-label="Полный экран">⛶</button><span class="counter"><b id="current">01</b> / ${TOTAL}</span></nav></header><main id="slides" tabindex="-1">${html}</main><footer><span id="chapter">${stage(171)}</span><small>← → листать · M содержание · F полный экран</small><button id="prev" aria-label="Предыдущий слайд">←</button><button id="next">Дальше →</button><div class="progress" role="progressbar" aria-label="Прогресс" aria-valuemin="1" aria-valuemax="${TOTAL}"><i id="progress"></i></div></footer></div><dialog id="contents"><div class="dialog-head"><h2>Содержание</h2><button data-close>Закрыть ×</button></div><p>${TOTAL} экранов · исходные номера 171–263, добавленные — с 264.</p><div class="contents">${deck.map((s,i)=>`<button data-go="${s.id}"><b>${String(i+1).padStart(2,'0')}</b>${inline(s.title)}<small>${s.id}</small></button>`).join('')}</div></dialog><dialog id="sources"><div class="dialog-head"><h2>Источники и материалы</h2><button data-close>Закрыть ×</button></div>${sources.map(([t,u])=>`<p><a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a></p>`).join('')}<p>Официальные источники проверены 23.09.2026. Сценарий сохранён; технические уточнения — в LESSON.md.</p><button id="print">Печать / PDF</button></dialog><dialog id="visual"><div class="dialog-head"><h2>Скриншот</h2><button data-close>Закрыть ×</button></div><img alt=""></dialog><script src="script.js"></script></body></html>`);
const table=shots.map(s=>`<tr><td><a href="index.html#${s.sourceSlide}">${s.lessonSlide} / ${s.sourceSlide}</a></td><td><code>${s.file}</code></td><td>${inline(s.screen).replace(/\n/g,' ')} ${inline(s.accent).replace(/\n/g,' ')}</td><td>${s.status==='captured'?'Снят':'Ожидает съёмки'}</td></tr>`).join('');
fs.writeFileSync(path.join(root,'materials.html'),head+`<body class="leads materials"><main><a href="index.html">← К презентации</a><p class="kicker">ТЕМА 07 / МАТЕРИАЛЫ</p><h1>Из события — в заявку</h1><p>Готовые фрагменты для существующего проекта темы 6. Перед публикацией подставьте ID таблицы и URL Web App.</p><p>${download(ARCHIVE,'Скачать все файлы одним архивом')}</p><div class="cards">${['Code.gs','script.js','lead-form.js','form.html'].map(f=>`<article><h3>${f}</h3>${download(f,'Скачать')}<details><summary>Посмотреть код</summary>${code(fs.readFileSync(path.join(root,'files',f),'utf8'),f)}</details></article>`).join('')}</div>${breakdownHtml()}<h2>Скриншоты · ${shots.length}</h2><p>Нумерация: экран темы / исходный слайд. PNG сохраняйте в shots/ под указанным именем, затем выполните node build.mjs. При отсутствии кадра остаётся честно подписанная рамка.</p><div class="table-scroll"><table><thead><tr><th>Слайд</th><th>Файл</th><th>Что снять</th><th>Статус</th></tr></thead><tbody>${table}</tbody></table></div></main><script>document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.closest('figure').querySelector('code').textContent);b.textContent='Скопировано';}catch{b.textContent='Выделите вручную';}});</script></body></html>`);
fs.writeFileSync(path.join(root,'SCREENSHOTS.md'),`# Тема 7: ${shots.length} скриншотов\n\nСнимать настоящие окна пользователя, не макеты. Только учебные данные. Не изменять рабочий ByteCamp. Не выдавать локальные проверки за работу Google Sheets или GA4. Номер файла — исходный слайд.\n\n| В теме | Исходник | Файл | Что снять | Статус |\n|---|---|---|---|---|\n`+shots.map(s=>`| ${s.lessonSlide} | ${s.sourceSlide} | ${s.file} | ${(s.screen+' '+s.accent).replace(/\n/g,' ')} | ${s.status} |`).join('\n')+'\n');
console.log(`Built ${TOTAL} slides; ${shots.length} shots, ${shots.filter(s=>s.status==='captured').length} captured.`);
