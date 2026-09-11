(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.lesson-slide')];
  let index = 0, returnFocus = null, touch = null, demoTimer = null;
  const pad = n => String(n).padStart(2,'0');
  const fromHash = () => {
    const m = /^#(?:slide-)?(\d+)$/.exec(location.hash);
    return m ? Math.max(0, Math.min(slides.length-1, Number(m[1])-20)) : 0;
  };
  function stopDemo() {
    clearTimeout(demoTimer);
    document.querySelectorAll('.demo-active').forEach(e=>e.classList.remove('demo-active'));
    document.getElementById('deploy-demo').disabled = false;
  }
  function show(n, hash = true) {
    const old = slides[index];
    index = Math.max(0,Math.min(slides.length-1,n));
    const active = slides[index];
    const moveFocus = old!==active && old.contains(document.activeElement);
    stopDemo();
    document.getElementById('deploy-state').textContent = 'Демонстрация: код ещё не сохранён';
    slides.forEach((s,i)=>{ s.classList.toggle('active',i===index);s.inert=i!==index;s.setAttribute('aria-hidden',String(i!==index)); });
    active.scrollTop=0;
    document.getElementById('current').textContent=pad(index+1);
    document.getElementById('chapter').textContent=active.dataset.stage;
    document.getElementById('prev').disabled=index===0;
    document.getElementById('next').disabled=index===slides.length-1;
    document.getElementById('progress').style.width=`${(index+1)/slides.length*100}%`;
    document.querySelector('.lesson-progress').setAttribute('aria-valuenow',index+1);
    document.querySelectorAll('[data-go]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.go)===index+20)));
    document.title=`${pad(index+1)} · ${active.dataset.title} · Тема 5 · ОП.03`;
    document.getElementById('announcement').textContent=`Слайд ${index+1} из ${slides.length}. ${active.dataset.title}`;
    if(hash) history.replaceState(null,'',`#${index+20}`);
    if(moveFocus) document.getElementById('lesson-slides').focus({preventScroll:true});
  }
  function openDialog(id,trigger) { returnFocus=trigger;document.getElementById(id).showModal(); }
  document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.dialog,b)));
  document.querySelectorAll('dialog').forEach(d=>{
    d.querySelector('[data-close]').addEventListener('click',()=>d.close());
    d.addEventListener('close',()=>{if(returnFocus?.isConnected&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true});});
    d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
  });
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{b.closest('dialog').close();show(Number(b.dataset.go)-20);}));
  document.getElementById('prev').addEventListener('click',()=>show(index-1));
  document.getElementById('next').addEventListener('click',()=>show(index+1));
  document.querySelectorAll('.reveal').forEach(e=>e.style.setProperty('--i',[...e.parentElement.children].indexOf(e)));
  document.querySelectorAll('[data-shot]').forEach(b=>b.addEventListener('click',()=>{
    const img=b.querySelector('img'),s=b.closest('.lesson-slide');
    document.getElementById('visual-title').textContent=s.dataset.title;
    document.getElementById('visual-img').src=img.currentSrc||img.src;
    document.getElementById('visual-img').alt=img.alt;
    document.getElementById('visual-caption').textContent=b.closest('figure').querySelector('figcaption').textContent;
    openDialog('visual',b);
  }));
  // Each image has a real SVG placeholder. A supplied PNG replaces it only on success.
  document.querySelectorAll('[data-real-src]').forEach(img=>{
    const candidate=new Image();
    candidate.onload=()=>{img.src=candidate.src;img.alt=img.alt.replace('Заглушка: ','Скриншот: ');img.dataset.loaded='real';};
    candidate.onerror=()=>{img.dataset.loaded='placeholder';};
    candidate.src=img.dataset.realSrc;
  });
  document.getElementById('fullscreen').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{document.getElementById('announcement').textContent='Полноэкранный режим недоступен в этом окне.';}
  });
  document.getElementById('print').addEventListener('click',()=>{document.getElementById('sources').close();window.print();});
  document.addEventListener('keydown',e=>{
    if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea,[contenteditable=true]'))return;
    if(e.target.closest('button,a')&&['Enter',' '].includes(e.key))return;
    if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(index+1);}
    else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(index-1);}
    else if(e.key==='Home'){e.preventDefault();show(0);}
    else if(e.key==='End'){e.preventDefault();show(slides.length-1);}
    else if(e.key.toLowerCase()==='m')document.querySelector('[data-dialog=contents]').click();
    else if(e.key.toLowerCase()==='s')openDialog('sources',document.getElementById('fullscreen'));
    else if(e.key.toLowerCase()==='f')document.getElementById('fullscreen').click();
  });
  const main=document.getElementById('lesson-slides');
  main.addEventListener('touchstart',e=>{touch=e.touches.length===1&&!e.target.closest('button,a,input,label')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
  main.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6)show(index+(dx<0?1:-1));touch=null;},{passive:true});
  main.addEventListener('touchcancel',()=>touch=null,{passive:true});
  window.addEventListener('hashchange',()=>show(fromHash(),false));
  document.getElementById('deploy-demo').addEventListener('click',e=>{
    stopDemo();e.currentTarget.disabled=true;
    const states=['Save: файл сохранён на компьютере','Commit: создана локальная версия','Push: commit отправлен в GitHub','Deploy: новая версия доступна на Vercel'];
    const cells=[...document.querySelectorAll('#slide-81 .lab-flow li')];let n=0;
    const tick=()=>{cells.forEach((c,i)=>c.classList.toggle('demo-active',i<=n));document.getElementById('deploy-state').textContent=states[n];n++;if(n<4)demoTimer=setTimeout(tick,matchMedia('(prefers-reduced-motion: reduce)').matches?0:900);else document.getElementById('deploy-demo').disabled=false;};tick();
  });
  window.addEventListener('beforeprint',()=>{stopDemo();slides.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');});});
  window.addEventListener('afterprint',()=>show(index,false));
  document.documentElement.classList.add('lab-ready');show(fromHash());
})();
