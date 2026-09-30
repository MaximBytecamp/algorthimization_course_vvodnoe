(() => {
  const slides=[...document.querySelectorAll('.lesson-slide')];
  let current=0;
  // Разбор кода по шагам: подсветка строк и карточка шага. go() возвращает false на краях.
  const tours=new Map();
  document.querySelectorAll('[data-tour]').forEach(t=>{
    const pre=t.querySelector('pre'),lines=[...t.querySelectorAll('.ln')],cards=[...t.querySelectorAll('.tour-card')];
    const chips=[...t.querySelectorAll('[data-step]')],stages=[...t.querySelectorAll('.tour-stages li')];
    const prev=t.querySelector('[data-tour-prev]'),next=t.querySelector('[data-tour-next]'),last=cards.length-1;
    let i=0;
    const set=k=>{i=k;cards.forEach((c,n)=>c.hidden=n!==i);
      chips.forEach((c,n)=>{if(n===i)c.setAttribute('aria-current','step');else c.removeAttribute('aria-current');if(n<=i)c.classList.add('seen');});
      const on=new Set();for(const r of cards[i].dataset.lines.split(',')){const [a,b]=r.split('-').map(Number);for(let n=a;n<=(b||a);n++)on.add(n);}
      let first=null;lines.forEach(l=>{const hit=on.has(+l.dataset.n);l.classList.toggle('on',hit);if(hit&&!first)first=l;});
      pre.classList.add('focus');if(first)pre.scrollTop=Math.max(0,first.offsetTop-pre.clientHeight*.2);
      const st=cards[i].dataset.stageI;stages.forEach((s,n)=>{s.classList.toggle('on',st!=null&&n===+st);s.classList.toggle('done',st!=null&&n<+st);});
      prev.disabled=i===0;next.textContent=i===last?'К следующему слайду →':'Следующий шаг →';};
    const api={step:d=>{const k=i+d;if(k<0||k>last)return false;set(k);return true;},enter:back=>set(back?last:0)};
    // blur: иначе фокус остаётся на кнопке и стрелки клавиатуры перестают листать.
    chips.forEach((c,n)=>c.onclick=()=>{c.blur();set(n);});
    prev.onclick=()=>{prev.blur();api.step(-1);};next.onclick=()=>{next.blur();if(!api.step(1))show(current+1);};
    tours.set(t.closest('.lesson-slide'),api);set(0);
  });
  const tourOf=()=>tours.get(slides[current]);
  const forward=()=>{const t=tourOf();if(!t||!t.step(1))show(current+1);};
  const backward=()=>{const t=tourOf();if(!t||!t.step(-1))show(current-1,true);};
  const find=id=>Math.max(0,slides.findIndex(s=>s.id==='slide-'+id));
  function show(i,back){const was=current;current=Math.max(0,Math.min(slides.length-1,i));const t=tours.get(slides[current]);if(t&&(was!==current||!slides[current].classList.contains('active')))t.enter(back&&was>current);slides.forEach((s,n)=>s.classList.toggle('active',n===current));const s=slides[current];s.scrollTop=0;document.querySelector('#current').textContent=String(current+1).padStart(2,'0');document.querySelector('#chapter').textContent=s.dataset.stage;document.querySelector('#progress').style.width=(current+1)/slides.length*100+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',current+1);document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===slides.length-1;history.replaceState(null,'','#'+s.id.replace('slide-',''));}
  document.documentElement.classList.add('leads-ready');
  show(find(location.hash.replace('#','')));
  addEventListener('hashchange',()=>show(find(location.hash.replace('#',''))));
  document.querySelector('#prev').onclick=backward;
  document.querySelector('#next').onclick=forward;
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.open).showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{b.closest('dialog').close();show(find(b.dataset.go));});
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
  document.querySelector('#fullscreen').onclick=fullscreen;
  document.querySelector('#print').onclick=()=>{document.querySelector('#sources').close();print();};
  addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,button,a,summary'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();forward();}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();backward();}if(e.key==='Home'){e.preventDefault();show(0);}if(e.key==='End'){e.preventDefault();show(slides.length-1);}if(e.key.toLowerCase()==='m')document.querySelector('#contents').showModal();if(e.key.toLowerCase()==='s')document.querySelector('#sources').showModal();if(e.key.toLowerCase()==='f')fullscreen();});
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{const c=b.closest('figure').querySelector('code'),ln=c.querySelectorAll('.ln');await navigator.clipboard.writeText(ln.length?[...ln].map(l=>l.textContent).join('\n')+'\n':c.textContent);b.textContent='Скопировано';}catch{b.textContent='Выделите вручную';}});
  document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{const d=document.querySelector('#visual');d.querySelector('img').src=b.querySelector('img').src;d.querySelector('img').alt=b.querySelector('img').alt;d.showModal();});
  const messages={valid:'ok: true → одна строка добавлена; status: new',missing:'ok: false → missing_required: name; запись не добавлена',duplicate:'ok: false → duplicate_request_id; число строк не изменилось',status:'Клиент прислал done → сервер игнорирует поле → новая запись получает new'};
  document.querySelectorAll('[data-sim]').forEach(b=>b.onclick=()=>document.querySelector('#sim-output').textContent=messages[b.dataset.sim]);
  let start;document.querySelector('#slides').addEventListener('touchstart',e=>{if(e.target.closest('button,a,input,pre'))return;start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});document.querySelector('#slides').addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)dx<0?forward():backward();start=null;},{passive:true});
})();
