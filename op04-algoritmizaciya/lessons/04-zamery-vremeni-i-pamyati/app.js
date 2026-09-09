'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey = 'op04-measurements-v1';
let state = {slides:{},checks:{}};
try { const saved=JSON.parse(localStorage.getItem(storageKey)); if(saved && saved.slides && saved.checks) state=saved; } catch {}
let current = 0;
let toastTimer;
function toast(text) { $('#toast').textContent=text; $('#toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').hidden=true,3500); }
function save() { try {localStorage.setItem(storageKey,JSON.stringify(state));} catch {toast('Хранилище недоступно. Скачайте результаты через оглавление.');} }
function data() { return state.slides[current] ||= {answers:{},values:{},prediction:'',locked:false,explained:false,reflection:''}; }
function highlight(code) {
 const token=/(#[^\n]*|(?:f|r)?"(?:\\.|[^"\\])*"|(?:f|r)?'(?:\\.|[^'\\])*'|\b(?:def|return|for|in|if|else|from|import|as|True|False|None)\b|\b(?:print|range|len|sum|list|set|median|perf_counter)\b|\b\d[\d_]*(?:\.\d+)?\b)/g;
 let out='',last=0;
 for(const m of code.matchAll(token)) {out+=esc(code.slice(last,m.index));const t=m[0];const type=t.startsWith('#')?'comment':/^([fr]?["'])/.test(t)?'string':/^\d/.test(t)?'number':/^(print|range|len|sum|list|set|median|perf_counter)$/.test(t)?'builtin':'keyword';out+=`<span class="${type}">${esc(t)}</span>`;last=m.index+t.length;}
 return out+esc(code.slice(last));
}
function codeBlock(c,i,s) {
 const code=LESSON_SOURCE[c.slide].codes[c.index].trimEnd();
 // Empty lines are folded visually; copy retains the complete original snippet.
 const lines=code.split('\n'); const numbered=lines.length>12;
 const nonempty=lines.map((text,n)=>({text,n})).filter(l=>l.text.trim());
 const pages=Math.ceil(nonempty.length/14), page=Math.min(data().codePages?.[i]||0,pages-1);
 const visible=pages>1?nonempty.slice(page*14,page*14+14):lines.map((text,n)=>({text,n}));
 return `<section class="code-panel">${s.codeLabels?`<p class="code-label">${esc(s.codeLabels[i])}</p>`:''}<div class="code-head"><span>${esc(c.file || 'example.py')}</span><div><button data-copy="${i}" aria-label="Скопировать код ${esc(c.file)}">Скопировать код</button>${c.file?`<a href="algorithm_measurements/${esc(c.file)}" download data-file="${i}">↓ .py</a>`:''}</div></div><pre tabindex="0" aria-label="Python: ${esc(c.file)}"><code>${visible.map(({text:line,n})=>line.trim()?`<span class="code-line">${numbered?`<i aria-hidden="true">${n+1}</i>`:''}${highlight(line)}</span>`:'<span class="code-gap"></span>').join('')}</code></pre>${pages>1?`<div class="code-pager"><button data-code-page="${i}" data-page="${page-1}" ${page===0?'disabled':''} aria-label="Предыдущая часть кода">←</button><span>Код · часть ${page+1} / ${pages}<small>Копирование и скачивание — целиком</small></span><button data-code-page="${i}" data-page="${page+1}" ${page===pages-1?'disabled':''} aria-label="Следующая часть кода">→</button></div>`:''}</section>`;
}
function quizzes(s) {
 return (s.quizzes||[]).map((q,i)=>{const answer=data().answers[i]; const done=Number.isInteger(answer);return `<fieldset class="quiz"><legend><span class="label">${i+1}. ПРЕДСКАЖИ</span>${esc(q.question)}</legend><div class="options">${q.options.map((o,j)=>`<button data-quiz="${i}" data-option="${j}" class="${done && j===q.correct?'correct':done && j===answer?'incorrect':''}" ${done?'disabled':''}>${esc(o)}${done && j===q.correct?' ✓':''}</button>`).join('')}</div>${done?`<p class="feedback" role="status"><b>${answer===q.correct?'Верно.':'Верный ответ: '+esc(q.options[q.correct])+'.'}</b> ${esc(q.why)}</p>`:'<p class="hint">Ответ и объяснение появятся после выбора.</p>'}</fieldset>`;}).join('');
}
function hasGrowth(l) { return l.rows.length>1 && l.rows.every(r=>/^\d[\d ]*$/.test(r[0])); }
function resultTable(l) {
 const growth=hasGrowth(l);
 const d=data();return `<div class="table-wrap"><table class="results"><thead><tr><th scope="col">${/^\d/.test(l.rows[0][0])?'n':'Вариант'}</th>${l.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}${growth?'<th scope="col">Во сколько раз дольше</th>':''}</tr></thead><tbody>${l.rows.map((r,i)=>`<tr><th scope="row">${esc(r[0])}</th>${l.columns.map((c,j)=>`<td><input type="text" inputmode="decimal" data-value="${i}-${j}" aria-label="${esc(r[0]+', '+c)}" placeholder="${l.columns[j].includes('MiB')?'Число из вывода':'Секунды из Python'}" value="${esc(d.values[`${i}-${j}`]||'')}" ${d.locked?'':'disabled'}></td>`).join('')}${growth?`<td class="ratio" data-ratio="${i}">—</td>`:''}</tr>`).join('')}</tbody></table></div>${growth?`<p class="hint">Время текущей строки ÷ время предыдущей${l.columns.length>1?' — отдельно для каждой серии':''}. ×10 означает «в 10 раз дольше». У первой строки ещё нет пары для сравнения.</p>`:''}`;
}
function labPanel(s) {
 const d=data(),l=s.lab;
 return `<section class="lab"><div class="lab-heading"><span class="label">ЛАБОРАТОРНЫЙ ЖУРНАЛ</span><span class="autosave">сохраняется на этом устройстве</span></div><label class="prediction-label" for="prediction">01 / ${esc(l.question)}</label><div class="prediction-row"><input id="prediction" placeholder="Моя гипотеза…" value="${esc(d.prediction)}" ${d.locked?'readonly':''}><button id="lock-prediction" ${d.locked || !d.prediction.trim()?'disabled':''}>${d.locked?'Зафиксировано ✓':'Записать прогноз'}</button></div><div class="run-step ${d.locked?'':'muted'}"><span class="label">02 / ЗАПУСТИ В ЛОКАЛЬНОМ PYTHON</span><div class="command"><code>python3 ${esc(l.file)}</code><a href="algorithm_measurements/${esc(l.file)}" download>↓ Скачать .py</a></div><p class="hint">Распакуйте «Файлы занятия», откройте терминал в algorithm_measurements. В Windows можно использовать py. Браузер не выполняет Python.</p></div><span class="label">03 / ПЕРЕНЕСИ РЕЗУЛЬТАТ ИЗ ТЕРМИНАЛА</span><p class="input-guide">${l.columns[0].includes('MiB')?'Введите число памяти из вывода скрипта. Деление на 1024² даёт MiB.':'Введите напечатанное Python время, без слова sec. Дробную часть можно вводить через точку или запятую. Это секунды, не число итераций и не миллисекунды.'}</p>${resultTable(l)}${s.repeat?'<button id="repeat">Запустить ещё раз: новая серия</button><p class="hint">Повторите команду в терминале и внесите новую серию. Предыдущая сохранится в экспорте.</p>':''}<div id="measured-chart"></div>${s.finalMemory?`<div class="memory-fields"><label>nested · peak, MiB<input inputmode="decimal" data-memory="nested" value="${esc(d.memory?.nested||'')}" placeholder="Из вывода скрипта" ${d.locked?'':'disabled'}></label><label>set · peak, MiB<input inputmode="decimal" data-memory="set" value="${esc(d.memory?.set||'')}" placeholder="Из вывода скрипта" ${d.locked?'':'disabled'}></label></div>`:''}<button id="explain" class="primary" disabled>${l.rows.length===1?'04 / Что означает этот замер?':'04 / Сравнить и открыть объяснение'}</button><div id="explanation" ${d.explained?'':'hidden'} class="explanation"><p>${esc(l.explanation)}</p><label for="reflection">Мой вывод: совпал ли прогноз с результатами и почему?</label><textarea id="reflection" placeholder="Что показали ваши измерения?">${esc(d.reflection)}</textarea></div></section>`;
}
const summaryRows=[['Доступ по индексу list','O(1)','O(1)'],['Линейный поиск','O(n)','O(1)'],['Вложенные циклы','O(n²)','O(1)'],['Ручная сумма','O(n)','O(1)'],['sum()','O(n)','O(1)'],['Поиск в list','O(n)','O(1)'],['Поиск в готовом set','O(1) в среднем','O(1)'],['Список квадратов','O(n)','O(n)'],['Последовательный подсчёт','O(n)','O(1)'],['Поиск дублей через пары','O(n²)','O(1)'],['Поиск дублей через set','O(n) в среднем','O(n)']];
const chapters=[{start:1,end:8,title:'От модели к эксперименту',time:'0–10 мин'},{start:9,end:11,title:'Методика замера',time:'10–20 мин'},{start:12,end:21,title:'Лаборатория роста',time:'20–45 мин'},{start:22,end:25,title:'Big O и реализация',time:'45–55 мин'},{start:26,end:32,title:'Исследуем память',time:'55–70 мин'},{start:33,end:39,title:'Финальная задача',time:'70–80 мин'},{start:40,end:44,title:'Выводы и самопроверка',time:'80–90 мин'}];
function render() {
 const s=LESSON[current],d=data(),chapter=chapters.find(c=>current+1>=c.start&&current+1<=c.end);
 $('#screen').innerHTML=`<section class="slide ${s.hero?'hero':''} ${s.lab?'experiment':''}" aria-labelledby="slide-title"><div class="slide-heading"><p class="eyebrow"><span>${esc(chapter.title)}</span><span>${chapter.time} · PYTHON LAB</span></p><h1 id="slide-title">${esc(s.title)}</h1><p class="intro">${esc(s.intro)}</p></div><div class="slide-body ${s.code?.length && (s.lab||s.quizzes||s.body)?'split':''} ${s.code?.length>1?'multi-code':''}">${s.code?`<div class="code-stack">${s.code.map((c,i)=>codeBlock(c,i,s)).join('')}</div>`:''}<div class="content">${s.body||''}${quizzes(s)}${s.lab?labPanel(s):''}${s.graph?'<div class="graph-controls"><label for="model-n">Размер входа n <output id="model-value">10</output></label><input type="range" id="model-n" min="2" max="30" value="10"><div class="legend"><span>● O(1)</span><span>● O(n)</span><span>● O(n²)</span></div></div><div id="model-chart"></div>':''}${s.summary?`<table class="summary-table"><thead><tr><th>Операция</th><th>T(n)</th><th>S(n)</th></tr></thead><tbody>${summaryRows.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}${s.checklist?`<div class="checklist">${s.checklist.map((x,i)=>`<label><input type="checkbox" data-check="${i}" ${state.checks[i]?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div><p id="check-count" class="note"></p>`:''}${s.reflection?`<label for="reflection">${esc(s.reflection)}</label><textarea id="reflection">${esc(d.reflection)}</textarea>`:''}</div></div>${s.takeaway?`<p class="takeaway">${esc(s.takeaway)}</p>`:''}${s.extra||''}</section>`;
 $('#counter').textContent=`${String(current+1).padStart(2,'0')} / 44`;
 $('#prev').disabled=current===0;$('#next').disabled=current===43;$('#progress').style.width=`${(current+1)/44*100}%`;
 updatePhase(); bind(s); if(s.lab) updateMeasurements(); if(s.graph) drawModel(); if(s.checklist) checkCount();
 $('#screen').scrollTop=0; $('#screen').focus({preventScroll:true});
 document.title=`${String(current+1).padStart(2,'0')} · ${s.title} · ОП.04`;
}
function updatePhase() {
 const s=LESSON[current],d=data();const ready=s.lab&&s.lab.rows.every((r,i)=>s.lab.columns.every((c,j)=>number(d.values[`${i}-${j}`])!==null));
 const phase=s.lab?(d.explained?3:ready&&d.locked?2:d.locked?1:0):(s.stage||0);
 $('#phase').innerHTML=['Прогноз','Замер','Сравнение','Вывод'].map((x,i)=>`<span ${i===phase?'aria-current="step"':''} class="${i===phase?'active':''}"><i>${i+1}</i>${x}</span>`).join('<b>→</b>');
}
function number(raw) {if(raw===undefined||String(raw).trim()==='')return null;const value=Number(String(raw).trim().replace(',','.')); return Number.isFinite(value)&&value>=0?value:null;}
function updateMeasurements() {
 const d=data(),l=LESSON[current].lab;
 const values=l.rows.map((r,i)=>l.columns.map((c,j)=>number(d.values[`${i}-${j}`])));
 document.querySelectorAll('[data-value]').forEach(el=>{el.setAttribute('aria-invalid',el.value.trim()!==''&&number(el.value)===null?'true':'false');});
 values.forEach((row,i)=>{const target=$(`[data-ratio="${i}"]`);if(!target)return;target.textContent=i?row.map((v,j)=>v!==null&&values[i-1][j]>0?'×'+(v/values[i-1][j]).toLocaleString('ru-RU',{maximumFractionDigits:2}):'—').join(' / '):'—';});
 let complete=values.every(row=>row.every(v=>v!==null));
 if(LESSON[current].finalMemory)complete=complete&&['nested','set'].every(k=>number(d.memory?.[k])!==null);
 $('#explain').disabled=!d.locked||!complete;
 if(!complete){$('#explain').title='Сначала зафиксируйте прогноз и заполните все замеры неотрицательными числами.';$('#explanation').hidden=true;d.explained=false;}else{$('#explain').title='';}
 const numericX=l.rows.every(r=>/^\d[\d ]*$/.test(r[0]));
 const any=values.some(row=>row.some(v=>v!==null));
 if(numericX && l.rows.length===1) {
  const value=values[0][0];
  $('#measured-chart').innerHTML=`<div class="measurement-guide">${value===null?'После запуска здесь будет расшифровка вашего результата.':`Вы записали: <strong>${esc(value.toLocaleString('ru-RU',{maximumFractionDigits:10}))} секунд</strong> при n = ${esc(l.rows[0][0])}.`}<p>Это один запуск на одном размере входа. По нему пока нельзя судить о росте времени. На следующем слайде измерим четыре размера n и сравним их.</p></div>`;
 } else if(numericX) {
  const enough=l.columns.some((c,j)=>values.filter(row=>row[j]!==null).length>=2);
  $('#measured-chart').innerHTML=enough
   ? '<p class="input-guide"><b>Как читать график:</b> вправо — больше элементов n; вверх — больше секунд. Каждая точка — введённый вами замер. Линия соединяет замеры, а не показывает выполнение программы во времени.</p>'+chart(l.rows.map(r=>Number(r[0].replaceAll(' ',''))),l.columns.map((name,j)=>({name,values:values.map(row=>row[j])})),l.columns[0].includes('MiB')?'Peak, MiB':'Время, sec')+'<p class="hint">Сравните соседние строки: во сколько раз вырос n и во сколько раз выросло время? Точные коэффициенты находятся в таблице. График не определяет Big O автоматически.</p>'
   : '<p class="measurement-guide">График появится после двух замеров для разных n. Заполните строки числами из вывода скрипта: одного замера недостаточно, чтобы увидеть рост.</p>';
 }
 else if(any && !numericX) {const valid=values.flat().filter(x=>x!==null);const max=Math.max(...valid,Number.EPSILON);$('#measured-chart').innerHTML=`<div class="bars">${values.map((row,i)=>`<div><span>${esc(l.rows[i][0])}</span><b style="width:${row[0]===null?0:Math.max(1,row[0]/max*100)}%"></b><small>${row[0]===null?'—':esc(row[0])}</small></div>`).join('')}</div>`+(LESSON[current].repeat&&complete?`<p class="note">Медиана ваших 7 запусков: ${[...valid].sort((a,b)=>a-b)[3]} sec</p>`:'');}else $('#measured-chart').innerHTML='';
}
function chart(xs,series,ylabel) {
 const width=700,height=250,left=76,right=22,top=30,bottom=48;
 const maxX=Math.max(...xs,1), maxY=Math.max(...series.flatMap(s=>s.values.filter(v=>v!==null)),Number.EPSILON);
 const x=v=>left+v/maxX*(width-left-right), y=v=>height-bottom-v/maxY*(height-top-bottom);
 const colors=['#1d64c8','#10927e','#b16b00'];
 const fmt=v=>v!==0&&(Math.abs(v)<.001||Math.abs(v)>=1e9)?v.toExponential(1):Number(v.toPrecision(3)).toLocaleString('ru-RU');
 return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ylabel)} по размеру входа n"><text x="${left}" y="17">${esc(ylabel)}</text>${[0,.25,.5,.75,1].map(t=>`<line x1="${left}" y1="${y(maxY*t)}" x2="${width-right}" y2="${y(maxY*t)}" class="gridline"/><text x="${left-8}" y="${y(maxY*t)+4}" text-anchor="end">${fmt(maxY*t)}</text>`).join('')}<line class="axis" x1="${left}" y1="${height-bottom}" x2="${width-right}" y2="${height-bottom}"/>${[0,.25,.5,.75,1].map(t=>`<text x="${x(maxX*t)}" y="${height-bottom+22}" text-anchor="middle">${fmt(maxX*t)}</text>`).join('')}<text x="${width-right}" y="${height-3}" text-anchor="end">Размер входа n</text>${series.map((s,j)=>{const pts=s.values.map((v,i)=>v===null?null:[x(xs[i]),y(v)]).filter(Boolean);return `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${colors[j]}" stroke-width="3"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${colors[j]}"/>`).join('')}`;}).join('')}</svg><div class="legend">${series.map((s,j)=>`<span style="color:${colors[j]}">● ${esc(s.name)}</span>`).join('')}</div>`;
}
function drawModel(){const n=Number($('#model-n').value);$('#model-value').textContent=n;const xs=Array.from({length:n+1},(_,i)=>i);$('#model-chart').innerHTML=chart(xs,[{name:'O(1): 1',values:xs.map(()=>1)},{name:'O(n): n',values:xs},{name:'O(n²): n²',values:xs.map(v=>v*v)}],'Объём работы, усл. ед.')+`<div class="model-stats"><span>1 → <b>1</b></span><span>n → <b>${n}</b></span><span>n² → <b>${n*n}</b></span></div>`;}
function downloadBlob(content,type,name) {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function copyText(text) {try {await navigator.clipboard.writeText(text);toast('Код скопирован');} catch {const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.left='-9999px';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Код скопирован':'Не удалось скопировать. Выделите код или скачайте .py.');}}
const virtualFiles={
 'timer_scheme.py':'from time import perf_counter\n\nstart = perf_counter()\n\n# код\n\nfinish = perf_counter()\n\nelapsed = finish - start\n',
 'boundary_with_setup.py':'from time import perf_counter\n\n'+LESSON_SOURCE[11].codes[0],
 'boundary_search_only.py':'from time import perf_counter\n\n'+LESSON_SOURCE[11].codes[1],
 'memory_scheme.py':'import tracemalloc\n\n'+LESSON_SOURCE[29].codes[1]
};
function bind(s) {
 document.querySelectorAll('[data-code-page]').forEach(b=>b.onclick=()=>{(data().codePages||={})[b.dataset.codePage]=Number(b.dataset.page);save();const scroll=$('#screen').scrollTop;render();$('#screen').scrollTop=scroll;});
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const c=s.code[Number(b.dataset.copy)];copyText(LESSON_SOURCE[c.slide].codes[c.index]);});
 document.querySelectorAll('[data-file]').forEach(a=>{const c=s.code[Number(a.dataset.file)];if(virtualFiles[c.file])a.onclick=e=>{e.preventDefault();downloadBlob(virtualFiles[c.file],'text/x-python',c.file);};});
 document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>{data().answers[b.dataset.quiz]=Number(b.dataset.option);save();const scroll=$('#screen').scrollTop;render();$('#screen').scrollTop=scroll;});
 if($('#prediction'))$('#prediction').oninput=e=>{data().prediction=e.target.value;$('#lock-prediction').disabled=!e.target.value.trim();save();};
 if($('#lock-prediction'))$('#lock-prediction').onclick=()=>{if(!data().prediction.trim())return;data().locked=true;save();const scroll=$('#screen').scrollTop;render();$('#screen').scrollTop=scroll;};
 document.querySelectorAll('[data-value]').forEach(el=>el.oninput=()=>{data().values[el.dataset.value]=el.value;updateMeasurements();updatePhase();save();});
 document.querySelectorAll('[data-memory]').forEach(el=>el.oninput=()=>{(data().memory||={})[el.dataset.memory]=el.value;el.setAttribute('aria-invalid',el.value.trim()!==''&&number(el.value)===null?'true':'false');updateMeasurements();updatePhase();save();});
 if($('#explain'))$('#explain').onclick=()=>{data().explained=true;$('#explanation').hidden=false;save();updatePhase();$('#explanation').scrollIntoView({block:'nearest',behavior:'smooth'});};
 if($('#reflection'))$('#reflection').oninput=e=>{data().reflection=e.target.value;save();};
 if($('#model-n'))$('#model-n').oninput=drawModel;
 document.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>{state.checks[el.dataset.check]=el.checked;save();checkCount();});
 if($('#repeat'))$('#repeat').onclick=()=>{const d=data();if(Object.values(d.values).some(v=>String(v).trim()))(d.history||=[]).push({values:{...d.values},recordedAt:new Date().toISOString()});d.values={};d.explained=false;save();render();toast('Предыдущая серия сохранена. Повторите команду в терминале.');};
}
function checkCount() {$('#check-count').textContent=`${Object.values(state.checks).filter(Boolean).length} / 10 навыков отмечено`;}
function go(n){current=Math.max(0,Math.min(LESSON.length-1,n));history.replaceState(null,'',`#slide-${current+1}`);render();}
$('#prev').onclick=()=>go(current-1);$('#next').onclick=()=>go(current+1);
$('#contents').onclick=()=>$('#outline').showModal();$('#close-outline').onclick=()=>$('#outline').close();
$('#outline').onclick=e=>{if(e.target===$('#outline'))$('#outline').close();};
$('#outline-list').innerHTML=chapters.map(ch=>`<section><h3>${ch.title}<small>${ch.time}</small></h3>${LESSON.slice(ch.start-1,ch.end).map((s,i)=>`<button data-go="${ch.start+i-1}"><span>${String(ch.start+i).padStart(2,'0')}</span>${esc(s.title)}</button>`).join('')}</section>`).join('');
$('#outline-list').onclick=e=>{const b=e.target.closest('[data-go]');if(b){$('#outline').close();go(Number(b.dataset.go));}};
$('#export').onclick=()=>downloadBlob(JSON.stringify({lesson:'ОП.04 / 04',exportedAt:new Date().toISOString(),slides:LESSON.map((s,i)=>({number:i+1,title:s.title,columns:s.lab?.columns,rows:s.lab?.rows,...state.slides[i]})),checks:state.checks},null,2),'application/json','lesson-04-my-results.json');
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Полноэкранный режим недоступен. Используйте режим презентации браузера.');}};
window.addEventListener('keydown',e=>{if($('#outline').open||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(current+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(43);}if(e.key.toLowerCase()==='f')$('#fullscreen').click();});
function fromHash(){const match=location.hash.match(/^#slide-(\d+)$/);go(match?Number(match[1])-1:0);}
window.addEventListener('hashchange',fromHash);fromHash();
