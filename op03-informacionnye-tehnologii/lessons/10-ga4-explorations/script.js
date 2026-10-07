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

// Число пользователей закрытой воронки: потери и доля следующего шага.
(() => {
 const inputs=[...document.querySelectorAll('[data-funnel]')],out=document.querySelector('#funnel-result');
 if(!out)return;
 function render(){
  const values=inputs.map(x=>x.value===''?NaN:Number(x.value));
  if(values.some((n,i)=>!Number.isSafeInteger(n)||n<0||(i>0&&n>values[i-1]))){out.textContent='Введите целые неотрицательные числа: каждый следующий шаг не больше предыдущего.';return;}
  const percent=(a,b)=>b===0?'—':(100*a/b).toLocaleString('ru-RU',{maximumFractionDigits:2})+'%';
  const labels=['Начало → CTA','CTA → форма','Форма → отправка'];
  out.innerHTML='<div class="table-scroll"><table><thead><tr><th>Переход</th><th>Дошли дальше</th><th>Потеряли</th><th>Доля потерь</th></tr></thead><tbody>'+labels.map((s,i)=>`<tr><td>${s}</td><td>${percent(values[i+1],values[i])}</td><td>${values[i]-values[i+1]}</td><td>${percent(values[i]-values[i+1],values[i])}</td></tr>`).join('')+'</tbody></table></div>'+`<p class="lab-total">Дошли от первого до последнего: <b>${percent(values[3],values[0])}</b>. При нулевом знаменателе доля не определена.</p>`;
 }
 inputs.forEach(x=>x.addEventListener('input',render));document.querySelector('#funnel-reset').onclick=()=>{[100,48,21,11].forEach((n,i)=>inputs[i].value=n);render()};render();
})();
