// Интерактивный разбор кода: слева файл целиком, справа — шаги.
// Шаг подсвечивает свои строки, остальные гаснут. Стрелки ← → сначала листают шаги, потом слайды.
import fs from 'node:fs';
import path from 'node:path';
import {CODE_GS,FORM,SCRIPT} from './tour-steps.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
// «9-10,47-49» → [[9,10],[47,49]]
const ranges=s=>String(s).split(',').map(r=>{const [a,b]=r.split('-').map(Number);return [a,b||a];});
const rangeLabel=s=>{const rs=ranges(s);const n=rs.reduce((k,[a,b])=>k+b-a+1,0);
  return (n===1?'Строка ':'Строки ')+rs.map(([a,b])=>a===b?a:`${a}–${b}`).join(', ');};

// marks: номер строки → 'add' (появилась в теме 7) или 'mod' (была, но изменена).
function render({file,label,dl,from,to,marks={},steps,stages,legend}){
  const all=fs.readFileSync(file,'utf8').replace(/\n$/,'').split('\n');
  const first=from||1,last=to||all.length;
  const shown=all.slice(first-1,last);
  steps.forEach((s,i)=>{for(const [a,b] of ranges(s.lines)){if(a<first||b>last)throw Error(`${label}, шаг ${i+1}: строки ${s.lines} вне файла`);}
    const [a]=ranges(s.lines)[0];if(s.check&&!all[a-1].includes(s.check))throw Error(`${label}, шаг ${i+1}: в строке ${a} нет «${s.check}» — код сдвинулся`);});
  const lines=shown.map((t,k)=>{const n=first+k;const m=marks[n]?` data-mark="${marks[n]}"`:'';
    const cls=/^\s*(\/\/|<!--)/.test(t)?'ln cm':'ln';return `<span class="${cls}" data-n="${n}"${m}>${esc(t)}</span>`;}).join('');
  const chips=steps.map((s,i)=>`<button data-step="${i}" aria-label="Шаг ${i+1}: ${esc(s.title)}">${i+1}</button>`).join('');
  const paras=a=>(a||[]).map(t=>`<p>${inline(t)}</p>`).join('');
  const parts=a=>a?`<dl class="tour-parts">${a.map(([c,t])=>`<div><dt><code>${esc(c)}</code></dt><dd>${inline(t)}</dd></div>`).join('')}</dl>`:'';
  const cards=steps.map((s,i)=>`<article class="tour-card" data-lines="${s.lines}"${s.stage!=null?` data-stage-i="${s.stage}"`:''}${i?' hidden':''}>`
    +`<p class="tour-where"><b>${i+1} / ${steps.length}</b>${rangeLabel(s.lines)}</p><h3>${inline(s.title)}</h3>`
    +paras(s.text)+parts(s.parts)+paras(s.text2)
    +(s.example?`<figure class="tour-ex"><figcaption>Пример</figcaption><pre>${esc(s.example)}</pre></figure>`:'')
    +(s.todo?`<p class="tour-todo"><b>Сделайте</b>${inline(s.todo)}</p>`:'')
    +(s.note?`<p class="tour-note">${inline(s.note)}</p>`:'')
    +`<p class="tour-like"><b>Как в жизни</b>${inline(s.like)}</p><p class="tour-more" aria-hidden="true">↓ ещё ниже</p></article>`).join('');
  const strip=stages?`<ol class="tour-stages">${stages.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'';
  const leg=legend?`<p class="tour-legend"><span data-mark="add">+ новое в теме 7</span><span data-mark="mod">~ изменено</span><span>без отметки — осталось из темы 6</span></p>`:'';
  return `<div class="tour" data-tour><div class="tour-code"><figure class="code"><figcaption>${esc(label)}<a class="dl" href="${dl}" download>${esc(path.basename(dl))} ↓</a><button data-copy aria-label="Скопировать ${esc(label)}">Копировать</button></figcaption><pre><code>${lines}</code></pre></figure>${leg}</div>`
    +`<div class="tour-side">${strip}<div class="tour-chips">${chips}</div>${cards}<div class="tour-nav"><button data-tour-prev>← Назад</button><button data-tour-next>Следующий шаг →</button></div></div></div>`;
}

export function tours(root){
  const f=p=>path.join(root,'files',p);
  const range=(a,b)=>Array.from({length:b-a+1},(_,k)=>a+k);
  const formMarks=Object.fromEntries([[25,'add'],[26,'mod'],...range(27,32).map(n=>[n,'mod']),...range(33,44).map(n=>[n,'add']),[46,'add'],[48,'mod'],[50,'add']]);
  const scriptMarks=Object.fromEntries([[2,'mod'],...range(4,39).map(n=>[n,'add'])]);
  return {
    gs:render({file:f('Code.gs'),label:'Code.gs',dl:'files/Code.gs',steps:CODE_GS,
      stages:['Приём','Проверка','Запись под замком','Строка в листе','Ответ']}),
    form:render({file:f('final/contacts.html'),label:'contacts.html · форма',dl:'files/final/contacts.html',from:25,to:50,
      marks:formMarks,steps:FORM,legend:true}),
    script:render({file:f('final/js/script.js'),label:'js/script.js',dl:'files/final/js/script.js',
      marks:scriptMarks,steps:SCRIPT,legend:true})};
}
