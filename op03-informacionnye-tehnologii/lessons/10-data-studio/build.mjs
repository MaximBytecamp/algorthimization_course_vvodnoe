import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
const code=(s,label='ПРИМЕР')=>`<figure class="code"><figcaption>${esc(label)}<button data-copy>Копировать</button></figcaption><pre><code>${esc(s.trim())}</code></pre></figure>`;
const note=s=>`<aside class="note">${inline(s)}</aside>`;
const result=s=>`<aside class="result"><b>ПРОВЕРЬТЕ РЕЗУЛЬТАТ</b><span>${inline(s)}</span></aside>`;
const cards=a=>`<div class="cards">${a.map(([t,c])=>`<article><h3>${inline(t)}</h3><p>${inline(c)}</p></article>`).join('')}</div>`;
const flow=a=>`<ol class="flow">${a.map((x,i)=>`<li><small>${String(i+1).padStart(2,'0')}</small><b>${inline(x)}</b></li>`).join('')}</ol>`;
const bullets=a=>`<ul class="bullets">${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`;
const checklist=a=>`<div class="checklist">${a.map(x=>`<label><input type="checkbox">${inline(x)}</label>`).join('')}</div>`;
const dl=(f,t)=>`<a class="download" href="files/${f}" download>${inline(t)} ↓</a>`;
const click=a=>`<div class="path" aria-label="Путь по меню">${a.map(x=>`<b>${inline(x)}</b>`).join('<i aria-hidden="true">→</i>')}</div>`;
function prose(text){
 const parts=text.trim().split(/\n\s*\n/).filter(Boolean),out=[];let list=[];
 const flush=()=>{if(list.length)out.push(bullets(list));list=[];};
 for(const p of parts){if(!p.includes('\n')&&p.length<145&&(/;$/.test(p)||(list.length&&/\.$/.test(p)))){list.push(p.replace(/[;.]$/,''));continue;}flush();
 if(/^\d+\. /m.test(p)){out.push(`<ol class="list">${p.split(/\n(?=\d+\. )/).map(x=>`<li>${inline(x.replace(/^\d+\. /,''))}</li>`).join('')}</ol>`);}else out.push(`<p>${inline(p.replace(/^> /gm,'')).replace(/\n/g,'<br>')}</p>`);}
 flush();return out.join('');
}
const md=s=>s.split(/(```[\s\S]*?```)/g).map(p=>{if(!p.startsWith('```'))return prose(p);const m=p.match(/^```([^\n]*)\n([\s\S]*?)```$/);return m[2].includes('↓')&&!m[2].includes('├')?flow(m[2].trim().split(/\n?↓\n?/).map(x=>x.trim())):code(m[2],m[1]||'ПРИМЕР');}).join('');import deckSource from './datalens.mjs';
// Тема перестроена на Yandex DataLens 14–15.10.2026: Data Studio из России недоступен.
// SOURCE.md (Data Studio) сохранён как исходник автора, колода собирается из datalens.mjs.
const table=(headers,rows)=>`<div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const joinLab=`<div class="join-lab"><p>Условный набор: три кампании Instagram; слева 180 сеансов. Выберите ключи и детализацию справа.</p><div class="lab-controls"><label>Ключи<select id="join-keys"><option value="both">Source + Campaign</option><option value="source">Только Source</option></select></label><label>Правая таблица<select id="join-grain"><option value="grouped">По Source + Campaign</option><option value="raw">Отдельные заявки</option></select></label></div><div id="join-result" aria-live="polite"></div></div>`;
const FIRST=606,LAST=734;
const deck=[];let stg='',num=FIRST-1,letter=0;
for(const item of deckSource({bullets,click,result,note,cards,code,flow,table,joinLab})){
 if(item.stage){stg=item.stage;continue;}
 let id;if(item.sub&&deck.length){letter++;id=num+String.fromCharCode(96+letter);}else{num++;letter=0;id=String(num);}
 deck.push({...item,id,stage:stg});
}
if(num>LAST)throw Error(`Номера вышли за ${LAST}: ${num}`);
const shotDir=path.join(root,'shots');fs.mkdirSync(shotDir,{recursive:true});
const stepFile=n=>{const f=fs.readdirSync(path.join(shotDir,'steps')).find(x=>x.startsWith(n+'-'));if(!f)throw Error('нет шага '+n);return f;};
for(const f of fs.readdirSync(shotDir))if(/-shot\.png$/.test(f))fs.rmSync(path.join(shotDir,f));
for(const s of deck){if(!s.shot&&!s.edited)continue;const n=s.shot||s.edited;const name=stepFile(n);const from=s.edited?path.join(shotDir,'edited',name):path.join(shotDir,'steps',name);if(!fs.existsSync(from))throw Error('нет файла '+from+' — запустите python3 prep_shots.py');fs.copyFileSync(from,path.join(shotDir,`${s.id}-shot.png`));s.step=name;}
const shots=deck.filter(s=>s.step).map(s=>({sourceSlide:s.id,lessonSlide:deck.indexOf(s)+1,file:`${s.id}-shot.png`,step:`steps/${s.step}`,screen:s.cap,masked:!!s.edited}));
const shot=s=>{const f=`${s.id}-shot.png`;return `<figure class="shot"><button data-zoom aria-label="Увеличить скриншот"><img src="shots/${f}" alt="${esc(s.cap)}" loading="lazy"></button><figcaption>${inline(s.cap)}</figcaption></figure>`;};
const html=deck.map((s,i)=>`<section class="lesson-slide ${s.dark?'dark':''} ${s.step?'with-shot':''}" id="slide-${s.id}" data-stage="${s.stage}"><div class="inner"><div class="kicker">${s.stage}<span>${s.id} · ${i+1} / ${deck.length}</span></div><h${i===0?1:2}>${inline(s.title)}</h${i===0?1:2}><div class="${s.step?'workbench':'content'}"><div class="copy">${s.body}</div>${s.step?shot(s):''}</div></div></section>`).join('\n');
const sources=[
['Yandex DataLens: документация','https://yandex.cloud/ru/docs/datalens/'],
['Подключение Google Sheets','https://yandex.cloud/ru/docs/datalens/operations/connection/create-google-sheets'],
['Датасеты и вычисляемые поля','https://yandex.cloud/ru/docs/datalens/concepts/calculations/'],
['Функция DATE_PARSE','https://yandex.cloud/ru/docs/datalens/function-ref/DATE_PARSE'],
['Функция COUNTD','https://yandex.cloud/ru/docs/datalens/function-ref/COUNTD'],
['Несколько датасетов в чарте','https://yandex.cloud/ru/docs/datalens/concepts/chart/multidataset-chart'],
['Связи и алиасы на дашборде','https://yandex.cloud/ru/docs/datalens/concepts/dashboard#links'],
['Права доступа к воркбуку','https://yandex.cloud/ru/docs/datalens/workbooks-collections/security'],
['GA4: исследование в свободной форме','https://support.google.com/analytics/answer/9327972?hl=ru']];
const title='ОП.03 · Тема 10 · часть 2 · DataLens: GA4 и заявки';
const head=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c2733"><title>${title}</title><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="styles.css"></head>`;
fs.writeFileSync(path.join(root,'index.html'),head+`<body class="leads dashboard"><a class="skip" href="#slides">К слайдам</a><div class="presentation"><header><a class="brand" href="../../index.html"><b>И/Т</b><span>ОП.03 · ТЕМА 10 · ЧАСТЬ 2<small>GA4 + Таблицы → DataLens</small></span></a><nav><button data-open="contents">Содержание</button><a href="materials.html">Материалы</a><button data-open="sources" aria-label="Источники">S</button><button id="fullscreen" aria-label="Полный экран">⛶</button><span class="counter"><b id="current">01</b> / ${deck.length}</span></nav></header><main id="slides" tabindex="-1">${html}</main><footer><span id="chapter">${deck[0].stage}</span><small>← → листать · M содержание · F полный экран</small><button id="prev" aria-label="Предыдущий слайд">←</button><button id="next">Дальше →</button><div class="progress" role="progressbar" aria-label="Прогресс" aria-valuemin="1" aria-valuemax="${deck.length}"><i id="progress"></i></div></footer></div><dialog id="contents"><div class="dialog-head"><h2>Содержание</h2><button data-close>Закрыть ×</button></div><p>${deck.length} экранов. Номер с буквой — продолжение шага предыдущего слайда.</p><div class="contents">${deck.map((s,i)=>`<button data-go="${s.id}"><b>${i+1}</b>${inline(s.title)}<small>${s.id}</small></button>`).join('')}</div></dialog><dialog id="sources"><div class="dialog-head"><h2>Источники и материалы</h2><button data-close>Закрыть ×</button></div>${sources.map(([t,u])=>`<p><a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a></p>`).join('')}<p>Все кадры сняты 14–15.10.2026 в учебных ресурсах: GA4 Tvuya Sreda Website, таблица Leads, воркбук DataLens «ОП03 Маркетинг и заявки». Числа на слайдах — фактические. Личные данные на кадрах закрашены.</p><button id="print">Печать / PDF</button></dialog><dialog id="visual"><div class="dialog-head"><h2>Скриншот</h2><button data-close>Закрыть ×</button></div><img alt=""></dialog><script src="script.js"></script></body></html>`);
const shotTable=shots.map(s=>`<tr><td><a href="index.html#${s.sourceSlide}">${s.lessonSlide} / ${s.sourceSlide}</a></td><td><code>${s.file}</code></td><td>${inline(s.screen)}${s.masked?' (обработан: обрезка или закраска личных данных)':''}</td></tr>`).join('');
fs.writeFileSync(path.join(root,'materials.html'),head+`<body class="leads dashboard materials"><main><a href="index.html">← К презентации</a><p class="kicker">ОП.03 / ТЕМА 10 · ЧАСТЬ 2 / МАТЕРИАЛЫ</p><h1>DataLens: GA4 и заявки</h1><p>${deck.length} экранов, ${shots.length} настоящих кадров.</p>${dl('datalens-lab.zip','Скачать комплект практики')}<p><a href="files/dashboard-spec.md">Спецификация для заполнения</a> · <a href="files/formulas.md">Формулы DataLens</a> · <a href="files/README.md">Порядок работы</a> · <a href="files/reconciliation.csv">Шаблон сверки</a></p>${cards([['Web Analytics','Сеансы, пользователи, generate_lead, динамика, источники, устройства.'],['Заявки','Actual Leads, статусы, кампании, динамика по дате создания.'],['Маркетинг и заявки','Три датасета в одной таблице по source + campaign.']])}<h2>Три датасета</h2>${table(['Датасет','Лист','Поля и формулы'],[['GA4 трафик','ga4_traffic','Дата = DATE_PARSE([date]); source, campaign — приведение (direct) и (not set); sessions, active_users — сумма'],['GA4 generate_lead','ga4_leads','Те же Дата, source, campaign; lead_events — сумма'],['Заявки','leads','Дата = DATE([created_at]); Lead Count = COUNTD([request_id]); Done Count; name и email скрыты']])}<h2>Модель JOIN</h2><p>На <a href="index.html#${deck.find(s=>s.body.includes("join-lab")).id}">слайде с моделью</a> можно сравнить ключ Source с Source + Campaign и отдельные заявки с агрегатами. Числа модели условные.</p><h2>Кадры · ${shots.length}</h2><p>Кадры копируются при сборке из shots/steps (все промежуточные шаги съёмки). Кадры с личными данными сначала обрабатывает <code>python3 prep_shots.py</code>.</p><div class="table-scroll"><table><thead><tr><th>Экран / номер</th><th>PNG</th><th>Что на кадре</th></tr></thead><tbody>${shotTable}</tbody></table></div><h2>Официальные источники</h2>${sources.map(([t,u])=>`<p><a href="${u}">${t}</a></p>`).join('')}</main></body></html>`);
fs.writeFileSync(path.join(shotDir,'manifest.json'),JSON.stringify(shots,null,2)+'\n');
fs.writeFileSync(path.join(root,'deck.json'),JSON.stringify(deck.map((s,i)=>({position:i+1,id:s.id,title:s.title,stage:s.stage,screenshot:s.step?`shots/${s.id}-shot.png`:null})),null,2)+'\n');
fs.writeFileSync(path.join(root,'SCREENSHOTS.md'),`# Тема 10 · часть 2 · DataLens · ${shots.length} кадров\n\nКадры сняты 14–15.10.2026 фоновым Chrome (CDP). Все промежуточные шаги — shots/steps с журналом steps.md (${fs.readdirSync(path.join(shotDir,'steps')).filter(f=>f.endsWith('.png')).length} PNG). Слайд ссылается на номер шага в datalens.mjs; build.mjs копирует его в shots/<номер>-shot.png. Кадры с личными данными берутся из shots/edited (prep_shots.py).\n\n| Экран | Номер | PNG | Шаг | Что на кадре |\n|---|---|---|---|---|\n`+shots.map(s=>`| ${s.lessonSlide} | ${s.sourceSlide} | ${s.file} | ${s.step}${s.masked?' (обработан)':''} | ${s.screen.replace(/\|/g,'\\|')} |`).join('\n')+'\n');
const zipName='files/datalens-lab.zip';fs.rmSync(path.join(root,'files/data-studio-lab.zip'),{force:true});const zip=path.join(root,zipName);fs.rmSync(zip,{force:true});execFileSync('zip',['-q','-X',zip,'README.md','dashboard-spec.md','formulas.md','reconciliation.csv','CHECKLIST.md'],{cwd:path.join(root,'files')});
console.log(JSON.stringify({slides:deck.length,lastId:num,screenshots:shots.length,masked:shots.filter(s=>s.masked).length}));
