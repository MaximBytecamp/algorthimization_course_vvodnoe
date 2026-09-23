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
  const messages={valid:'ok: true → одна строка добавлена; status: new',missing:'ok: false → missing_required: name; запись не добавлена',duplicate:'ok: false → duplicate_request_id; число строк не изменилось',status:'Клиент прислал done → сервер игнорирует поле → новая запись получает new'};
  document.querySelectorAll('[data-sim]').forEach(b=>b.onclick=()=>document.querySelector('#sim-output').textContent=messages[b.dataset.sim]);
  let start;document.querySelector('#slides').addEventListener('touchstart',e=>{if(e.target.closest('button,a,input,pre'))return;start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});document.querySelector('#slides').addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)show(current+(dx<0?1:-1));start=null;},{passive:true});
})();
