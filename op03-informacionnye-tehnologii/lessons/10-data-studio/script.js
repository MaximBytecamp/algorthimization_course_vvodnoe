(() => {
  const slides=[...document.querySelectorAll('.lesson-slide')];
  let current=0;
  const find=id=>Math.max(0,slides.findIndex(s=>s.id==='slide-'+id));
  function show(i){current=Math.max(0,Math.min(slides.length-1,i));slides.forEach((s,n)=>s.classList.toggle('active',n===current));const s=slides[current];s.scrollTop=0;document.querySelector('#current').textContent=String(current+1).padStart(2,'0');document.querySelector('#chapter').textContent=s.dataset.stage;document.querySelector('#progress').style.width=(current+1)/slides.length*100+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',current+1);document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===slides.length-1;history.replaceState(null,'','#'+s.id.replace('slide-',''));}
  document.documentElement.classList.add('leads-ready');
  show(find(location.hash.replace('#','')));
  addEventListener('hashchange',()=>show(find(location.hash.replace('#',''))));
  document.querySelector('#prev').onclick=()=>show(current-1);
  document.querySelector('#next').onclick=()=>show(current+1);
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.open).showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{b.closest('dialog').close();show(find(b.dataset.go));});
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
  document.querySelector('#fullscreen').onclick=fullscreen;
  document.querySelector('#print').onclick=()=>{document.querySelector('#sources').close();print();};
  addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,button,a,summary'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(current+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(current-1);}if(e.key==='Home'){e.preventDefault();show(0);}if(e.key==='End'){e.preventDefault();show(slides.length-1);}if(e.key.toLowerCase()==='m')document.querySelector('#contents').showModal();if(e.key.toLowerCase()==='s')document.querySelector('#sources').showModal();if(e.key.toLowerCase()==='f')fullscreen();});
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.closest('figure').querySelector('code').textContent);b.textContent='Скопировано';}catch{b.textContent='Выделите вручную';}});
  document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{const d=document.querySelector('#visual');d.querySelector('img').src=b.querySelector('img').src;d.querySelector('img').alt=b.querySelector('img').alt;d.showModal();});
  let start;document.querySelector('#slides').addEventListener('touchstart',e=>{if(e.target.closest('button,a,input,pre'))return;start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});document.querySelector('#slides').addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)show(current+(dx<0?1:-1));start=null;},{passive:true});
})();


// Небольшая модель Left Outer: условные данные, без внешних запросов.
(() => {
 const output=document.querySelector('#join-result');if(!output)return;
 const traffic=[{source:'instagram',campaign:'backend',sessions:100},{source:'instagram',campaign:'frontend',sessions:50},{source:'instagram',campaign:'test',sessions:30}];
 const leads=[{source:'instagram',campaign:'backend',id:'REQ-1'},{source:'instagram',campaign:'backend',id:'REQ-2'},{source:'instagram',campaign:'frontend',id:'REQ-3'}];
 function render(){
  const both=document.querySelector('#join-keys').value==='both',grouped=document.querySelector('#join-grain').value==='grouped';
  const groups=new Map();for(const lead of leads){const k=lead.source+'|'+lead.campaign;if(!groups.has(k))groups.set(k,{source:lead.source,campaign:lead.campaign,count:0});groups.get(k).count++;}
  const right=grouped?[...groups.values()]:leads.map(x=>({...x,count:1}));
  const rows=[];for(const t of traffic){const matches=right.filter(r=>r.source===t.source&&(!both||r.campaign===t.campaign));if(!matches.length)rows.push({...t,rc:'—',count:null});else for(const r of matches)rows.push({...t,rc:grouped?r.campaign:r.id,count:r.count});}
  const sum=rows.reduce((a,r)=>a+r.sessions,0);
  output.innerHTML='<div class="table-scroll"><table><thead><tr><th>GA4 campaign</th><th>Sessions</th><th>Справа</th><th>Lead Count</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${r.campaign}</td><td>${r.sessions}</td><td>${r.rc}</td><td>${r.count??'NULL'}</td></tr>`).join('')+'</tbody></table></div>'+`<p class="lab-summary" data-total="${sum}" data-rows="${rows.length}">После JOIN: <b>${rows.length} строк</b>, сумма Sessions = <b>${sum}</b>; до JOIN — 180.</p>`+`<aside class="${both&&grouped?'result':'note'}">${both&&grouped?'Детализация сохранена. У test нет пары справа: NULL требует проверки.':'Sessions повторились. Проверьте состав ключа и агрегируйте обе стороны до одинаковой детализации.'}</aside>`;
 }
 document.querySelectorAll('.join-lab select').forEach(s=>s.addEventListener('change',render));render();
})();
