'use strict';
(() => {
  const main = document.getElementById('slides');
  const pad = n => String(n).padStart(2, '0');
  const groupFor = n => lessonGroups.find(group => n >= group.start && n <= group.end);
  main.innerHTML = lessonSlides.map((slide, index) => {
    const n = index + 1;
    const group = groupFor(n);
    return `<section class="slide" id="slide-${pad(n)}" aria-labelledby="title-${pad(n)}" hidden><header><p class="eyebrow">${group.title}<span>${group.time} · ${pad(n)} / 36</span></p><${n===1?'h1':'h2'} id="title-${pad(n)}">${slide.title}</${n===1?'h1':'h2'}>${slide.intro ? `<p class="lead">${slide.intro}</p>` : ''}</header><div class="slide-body">${slide.body}</div></section>`;
  }).join('');
  const slides = [...main.querySelectorAll('.slide')];
  document.getElementById('outline').innerHTML = lessonGroups.map(group => `<section><h3>${group.title}<small>${group.time}</small></h3>${lessonSlides.slice(group.start-1,group.end).map((slide,i)=>`<button data-go="${group.start+i}"><span>${pad(group.start+i)}</span>${slide.title}</button>`).join('')}</section>`).join('');
  let index = 0;
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const hashIndex = () => {
    const match = location.hash.match(/^#(?:slide-)?(\d{1,2})$/);
    return match ? Math.max(0, Math.min(slides.length-1, Number(match[1])-1)) : 0;
  };
  function show(target, updateHash = true) {
    index = Math.max(0,Math.min(slides.length-1,target));
    const focusInSlide = main.contains(document.activeElement);
    slides.forEach((slide,i) => { slide.hidden = i !== index; });
    main.scrollTop = 0;
    const group = groupFor(index+1);
    document.getElementById('chapter').textContent = `${group.title} · ${group.time}`;
    document.getElementById('counter').textContent = `${pad(index+1)} / ${slides.length}`;
    document.getElementById('progress').style.width = `${(index+1)/slides.length*100}%`;
    document.querySelector('.progress').setAttribute('aria-valuenow',index+1);
    document.querySelectorAll('#outline [data-go]').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.go)===index+1)));
    prev.disabled = index===0;
    next.disabled = index===slides.length-1;
    document.title = `${pad(index+1)} · ${lessonSlides[index].title} · Первая пара`;
    document.getElementById('announcement').textContent = `Слайд ${index+1} из ${slides.length}. ${lessonSlides[index].title}`;
    if(updateHash) history.replaceState(null,'',`#${pad(index+1)}`);
    if(focusInSlide) main.focus({preventScroll:true});
  }
  prev.addEventListener('click',()=>show(index-1));
  next.addEventListener('click',()=>show(index+1));
  window.addEventListener('hashchange',()=>show(hashIndex(),false));
  const dialogTriggers = new WeakMap();
  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    dialogTriggers.set(dialog,trigger);
    dialog.showModal();
  }
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click',()=>openDialog(button.dataset.open,button)));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>dialogTriggers.get(dialog)?.focus());
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog) return;
      const box=dialog.getBoundingClientRect();
      if(event.clientX<box.left || event.clientX>box.right || event.clientY<box.top || event.clientY>box.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{
    button.closest('dialog')?.close(); show(Number(button.dataset.go)-1); main.focus({preventScroll:true});
  }));
  document.getElementById('fullscreen').addEventListener('click',async()=>{
    try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { toast('Полноэкранный режим недоступен в этом браузере.'); }
  });
  document.addEventListener('keydown',event=>{
    if(document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if(event.target.closest('input,textarea,select,[contenteditable="true"],[role="tablist"]')) return;
    if(event.target.closest('button,a,summary') && ['Enter',' '].includes(event.key)) return;
    if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();show(index+1);}
    else if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();show(index-1);}
    else if(event.key==='Home'){event.preventDefault();show(0);}
    else if(event.key==='End'){event.preventDefault();show(slides.length-1);}
    else if(event.key.toLowerCase()==='f') document.getElementById('fullscreen').click();
    else if(event.key.toLowerCase()==='m') document.querySelector('[data-open="contents"]').click();
    else if(event.key.toLowerCase()==='s') document.querySelector('[data-open="sources"]').click();
  });
  let touchStart;
  main.addEventListener('touchstart',event=>{
    if(event.touches.length!==1 || event.target.closest('button,a,input,textarea,summary,pre,.table-wrap')) {touchStart=null;return;}
    touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  main.addEventListener('touchend',event=>{
    if(!touchStart || !event.changedTouches.length)return;
    const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
    if(Math.abs(dx)>75 && Math.abs(dx)>Math.abs(dy)*1.7)show(index+(dx<0?1:-1));
    touchStart=null;
  },{passive:true});
  main.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
  let toastTimer;
  function toast(message) {
    const element=document.getElementById('toast');
    element.textContent=message;element.hidden=false;clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{element.hidden=true;},4500);
  }
  document.querySelectorAll('[data-vote]').forEach(button=>button.addEventListener('click',()=>{
    const choice=button.closest('.choice');
    choice.querySelectorAll('[data-vote]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    choice.querySelector('[data-vote-feedback]').textContent=`Ваша позиция: «${button.textContent}». Какие сведения подтверждают её?`;
  }));
  let evidenceCount=0;
  function renderEvidence(){
    document.querySelectorAll('.evidence-card').forEach((card,i)=>{
      card.classList.toggle('pending',i>=evidenceCount);
      card.classList.toggle('new',i===evidenceCount-1);
      // Скрытые факты не должны читаться скринридером до раскрытия.
      card.querySelector('span').setAttribute('aria-hidden',String(i>=evidenceCount));
    });
    const button=document.querySelector('[data-evidence-next]');
    button.disabled=evidenceCount===8;
    button.textContent=evidenceCount===8?'Все 8 фактов раскрыты':`Раскрыть факт ${evidenceCount+1} / 8`;
    document.querySelector('[data-evidence-question]').hidden=evidenceCount<8;
  }
  document.querySelector('[data-evidence-next]').addEventListener('click',()=>{evidenceCount=Math.min(8,evidenceCount+1);renderEvidence();});
  document.querySelector('[data-evidence-reset]').addEventListener('click',()=>{evidenceCount=0;renderEvidence();});
  renderEvidence();
  const latency=document.getElementById('latency');
  latency.addEventListener('input',()=>{
    const value=Number(latency.value),passed=value<=500;
    document.getElementById('latency-value').textContent=`${value} мс`;
    document.getElementById('latency-comparison').textContent=`${value} ${passed?'≤':'>'} 500`;
    const status=document.getElementById('latency-status');
    status.textContent=passed?'СООТВЕТСТВУЕТ':'НЕ СООТВЕТСТВУЕТ';status.className=`question ${passed?'success':'warning'}`;
  });
  let exerciseIndex=0;
  let exerciseAnswers=['','','',''];
  try {
    const saved=JSON.parse(localStorage.getItem('handoff-lesson-01-requirements-v1'));
    if(Array.isArray(saved)&&saved.length===4&&saved.every(x=>typeof x==='string'))exerciseAnswers=saved;
  }catch{/* Работа продолжается, если локальное хранилище недоступно. */}
  const exerciseInput=document.getElementById('exercise-input');
  function renderExercise(){
    document.getElementById('exercise-letter').textContent=`${'ABCD'[exerciseIndex]} · ${exerciseIndex+1} / 4`;
    document.getElementById('exercise-prompt').textContent=practiceItems[exerciseIndex][0];
    exerciseInput.value=exerciseAnswers[exerciseIndex];
    document.getElementById('exercise-example').hidden=true;
    document.getElementById('exercise-save').textContent=exerciseAnswers[exerciseIndex]?'Ваш черновик восстановлен.':'Черновик сохраняется в этом браузере, если хранилище доступно.';
    document.querySelector('[data-exercise-prev]').disabled=exerciseIndex===0;
    document.querySelector('[data-exercise-next]').disabled=exerciseIndex===3;
  }
  exerciseInput.addEventListener('input',()=>{
    exerciseAnswers[exerciseIndex]=exerciseInput.value;
    try{localStorage.setItem('handoff-lesson-01-requirements-v1',JSON.stringify(exerciseAnswers));document.getElementById('exercise-save').textContent='Черновик сохранён в этом браузере.';}
    catch{document.getElementById('exercise-save').textContent='Черновик хранится только до перезагрузки страницы.';}
  });
  document.querySelector('[data-exercise-prev]').addEventListener('click',()=>{exerciseIndex=Math.max(0,exerciseIndex-1);renderExercise();});
  document.querySelector('[data-exercise-next]').addEventListener('click',()=>{exerciseIndex=Math.min(3,exerciseIndex+1);renderExercise();});
  document.querySelector('[data-exercise-example]').addEventListener('click',()=>{
    const example=document.getElementById('exercise-example');example.textContent=`Один из вариантов: ${practiceItems[exerciseIndex][1]}`;example.hidden=!example.hidden;
  });
  renderExercise();
  const templateTabs=[...document.querySelectorAll('[data-template-tab]')];
  function selectTemplate(index,focus=false){
    templateTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    document.querySelectorAll('.template-page').forEach((page,i)=>{page.hidden=i!==index;});
    if(focus)templateTabs[index].focus();
  }
  templateTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTemplate(index));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const target=event.key==='Home'?0:event.key==='End'?4:(index+(event.key==='ArrowRight'?1:4))%5;
      selectTemplate(target,true);
    });
  });
  async function copyTemplate(){
    try { await navigator.clipboard.writeText(auditTemplate);toast('Весь шаблон handoff_audit.md скопирован.'); }
    catch {
      const area=document.createElement('textarea');area.value=auditTemplate;area.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(area);area.focus();area.select();
      let copied=false;try{copied=document.execCommand('copy');}catch{/* Скачивание доступно независимо от clipboard. */}area.remove();
      toast(copied?'Весь шаблон handoff_audit.md скопирован.':'Копирование недоступно. Используйте кнопку скачивания handoff_audit.md.');
    }
  }
  document.querySelectorAll('[data-copy-template]').forEach(button=>button.addEventListener('click',async()=>{await copyTemplate();button.focus();}));
  document.querySelectorAll('.shot').forEach(figure=>{
    const view=figure.querySelector('.shot-view');
    const caption=figure.querySelector('figcaption');
    const badge=figure.querySelector('.shot-bar>span');
    const permanent=screenshotFiles[figure.dataset.shot];
    if(permanent){
      const img=new Image();img.src=permanent.file;img.alt=permanent.caption;
      view.replaceChildren(img);caption.textContent=permanent.caption+' · клик — увеличить.';badge.textContent='СКРИНШОТ';
      img.onerror=()=>toast(`Не удалось загрузить скриншот слайда ${figure.dataset.shot}. Проверьте путь файла.`);
    }
    const original=view.innerHTML;
    const originalCaption=caption.textContent;
    const originalBadge=badge.textContent;
    const input=figure.querySelector('input');
    const restore=figure.querySelector('[data-restore]');
    let objectURL=null;
    view.addEventListener('click',()=>{
      document.getElementById('visual-content').innerHTML=view.innerHTML;
      openDialog('visual',view);
    });
    figure.querySelector('[data-upload]').addEventListener('click',()=>input.click());
    input.addEventListener('change',()=>{
      const file=input.files[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('Выберите изображение PNG, JPEG или WebP.');input.value='';return;}
      if(file.size>20*1024*1024){toast('Выберите изображение размером до 20 МБ.');input.value='';return;}
      const candidateURL=URL.createObjectURL(file),img=new Image();
      img.alt=`Скриншот для слайда ${figure.dataset.shot}: ${file.name}`;
      img.onload=()=>{
        if(objectURL)URL.revokeObjectURL(objectURL);objectURL=candidateURL;view.replaceChildren(img);
        badge.textContent='ЗАГРУЖЕННЫЙ СКРИНШОТ';caption.textContent=`${file.name} · клик — увеличить. Сохраняется до перезагрузки страницы.`;restore.hidden=false;
      };
      img.onerror=()=>{URL.revokeObjectURL(candidateURL);toast('Не удалось прочитать изображение. Выберите другой файл.');};
      img.src=candidateURL;
    });
    restore.addEventListener('click',()=>{
      if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;view.innerHTML=original;caption.textContent=originalCaption;badge.textContent=originalBadge;restore.hidden=true;input.value='';
    });
  });
  // В печати показываем раскрытия и все части шаблона, затем возвращаем состояние урока.
  let printDetails=[];
  window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('details')].map(detail=>[detail,detail.open]);printDetails.forEach(([detail])=>{detail.open=true;});});
  window.addEventListener('afterprint',()=>{printDetails.forEach(([detail,open])=>{detail.open=open;});printDetails=[];});
  document.getElementById('print').addEventListener('click',()=>{document.getElementById('sources').close();window.print();});
  show(hashIndex());
})();
