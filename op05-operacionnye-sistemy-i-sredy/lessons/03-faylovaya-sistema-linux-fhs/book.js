'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const key = 'os-fhs-book-v1';
  let state = { chapters: [], checks: [] };
  try { const saved = JSON.parse(localStorage.getItem(key)); if (saved && Array.isArray(saved.chapters) && Array.isArray(saved.checks)) state = saved; } catch {}
  let toastTimer;
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400); }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { toast('Браузер не сохранил отметки. Они действуют до закрытия страницы.'); } }
  function refreshProgress() {
    $('#course-status').textContent = `Пройдено ${state.chapters.filter(n => n >= 1 && n <= 8).length} из 8 глав`;
    $$('[data-complete]').forEach(el => { const done = state.chapters.includes(Number(el.dataset.complete)); el.textContent = done ? '✓' : ''; el.parentElement.title = done ? 'Глава отмечена пройденной' : ''; });
    const button = $('#mark-complete');
    if (button) { const done = state.chapters.includes(Number(document.body.dataset.chapter)); button.setAttribute('aria-pressed', String(done)); button.textContent = done ? 'Глава пройдена ✓ · снять отметку' : 'Отметить главу пройденной'; }
  }
  refreshProgress();
  $('#mark-complete')?.addEventListener('click', () => { const n = Number(document.body.dataset.chapter); state.chapters = state.chapters.includes(n) ? state.chapters.filter(x => x !== n) : [...state.chapters, n]; save(); refreshProgress(); });
  $$('.copy').forEach(button => button.addEventListener('click', async () => {
    const code = $('pre code', button.closest('.code'));
    try { await navigator.clipboard.writeText(code.textContent); const label = button.textContent; button.textContent = 'Скопировано ✓'; setTimeout(() => { button.textContent = label; }, 1800); }
    catch { const range = document.createRange(); range.selectNodeContents(code); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); toast('Код выделен. Нажмите Ctrl+C или ⌘C.'); }
  }));
  const steps = $$('.lesson-step'); let lecture = false; let step = Math.max(0, steps.findIndex(s => '#' + s.id === location.hash));
  function showStep(scroll = false) { steps.forEach((s, i) => { s.hidden = lecture && i !== step; }); if ($('#step-status')) { $('#step-status').textContent = `${step + 1} / ${steps.length}`; $('#step-prev').disabled = step === 0; $('#step-next').disabled = step === steps.length - 1; } if (scroll) steps[step]?.scrollIntoView({ block: 'start' }); updateReading(); }
  $('#lecture-toggle')?.addEventListener('click', () => { lecture = !lecture; $('#lecture-toggle').setAttribute('aria-pressed', String(lecture)); $('#lecture-toggle').textContent = lecture ? 'Показать всю главу' : 'Показывать по одному шагу'; $('#step-controls').hidden = !lecture; showStep(); });
  $('#step-prev')?.addEventListener('click', () => { step = Math.max(0, step - 1); showStep(true); });
  $('#step-next')?.addEventListener('click', () => { step = Math.min(steps.length - 1, step + 1); showStep(true); });
  $$('.local-toc a').forEach(link => link.addEventListener('click', () => { const target = steps.findIndex(s => '#' + s.id === link.hash); if (target >= 0) { step = target; showStep(); } }));
  addEventListener('hashchange', () => { const n = steps.findIndex(s => '#' + s.id === location.hash); if (n >= 0) { step = n; showStep(true); } });
  function updateReading() { const total = document.documentElement.scrollHeight - innerHeight; $('.reading-progress span').style.width = `${total > 0 ? Math.min(100, scrollY / total * 100) : 100}%`; }
  addEventListener('scroll', updateReading, { passive: true }); addEventListener('resize', updateReading); addEventListener('load', updateReading); updateReading();
  // Data embedded here keeps the map available on file:// as well as HTTP.
  const directories = /*FHS_MAP_START*/ [["/", "Корень дерева", "Общий начальный каталог всех абсолютных путей.", "pwd", "01-root"], ["/home", "Домашние каталоги", "Личные файлы и настройки обычных пользователей.", "ls /home", "03-home"], ["/root", "Дом администратора", "Домашний каталог учётной записи root; не корень дерева.", "getent passwd root", "03-home"], ["/etc", "Конфигурация", "Настройки системы и системно установленных приложений.", "cat /etc/os-release", "06-config"], ["/usr", "Программы и ресурсы", "Команды, библиотеки и общие ресурсы установленного ПО.", "ls /usr", "09-usrmerge"], ["/usr/local", "Локальная установка", "ПО, которое администратор устанавливает отдельно от пакетов дистрибутива.", "ls /usr/local", "09-usrmerge"], ["/var", "Изменяемые данные", "Состояние приложений, кэш, очереди и журналы.", "ls /var", "10-var"], ["/tmp", "Временные файлы", "Не рассчитывайте на сохранность после перезагрузки или очистки.", "findmnt -T /tmp", "11-temporary"], ["/run", "Текущий запуск", "PID-файлы, сокеты и другое состояние запущенных служб.", "findmnt -T /run", "11-temporary"], ["/dev", "Устройства", "Специальные файлы для обращения к устройствам и псевдоустройствам.", "ls -l /dev/null", "12-dev"], ["/proc", "Процессы и ядро", "Виртуальное представление состояния процессов и системных показателей.", "head /proc/meminfo", "13-proc"], ["/sys", "Устройства и ядро", "Представление устройств, драйверов и свойств через sysfs.", "ls /sys/class/net", "14-sys"], ["/boot", "Загрузка", "Файлы, необходимые для загрузки; в установленной системе здесь могут быть ядро и initramfs.", "ls -lah /boot", "05-fhs"], ["/opt", "Дополнительное ПО", "Отдельные пакеты сторонних приложений; каталог может быть пуст.", "ls -la /opt", "05-fhs"], ["/srv", "Данные сервисов", "Данные, которые предоставляет сервис, например содержимое сайта.", "ls -la /srv", "05-fhs"], ["/mnt", "Временное подключение", "Традиционное место ручного временного монтирования.", "findmnt -T /mnt", "18-mounts"], ["/media", "Съёмные носители", "Каталоги подключения съёмных носителей; автомонтирование зависит от окружения.", "ls /media", "18-mounts"]] /*FHS_MAP_END*/;
  $$('[data-directory]').forEach(button => button.addEventListener('click', () => { const d = directories[Number(button.dataset.directory)]; $$('[data-directory]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); $('#map-title').textContent = `${d[0]} · ${d[1]}`; $('#map-description').textContent = d[2]; $('#map-command').textContent = d[3]; $('#map-shot').href = `shots/${d[4]}.png`; }));
  function resolvePath() {
    const cwd = $('#path-cwd').value; const input = $('#path-input').value.trim();
    if (!input) { $('#path-output').textContent = 'Введите путь, например ../bin или /etc.'; return; }
    if (input.includes('~') || input.includes('$')) { $('#path-output').textContent = 'Эта модель не раскрывает ~ и переменные. Введите абсолютный путь или путь с . и ..'; return; }
    const parts = (input.startsWith('/') ? input : cwd + '/' + input).split('/'); const result = [];
    parts.forEach(part => { if (part === '..') result.pop(); else if (part && part !== '.') result.push(part); });
    $('#path-output').textContent = `${cwd} + ${input} → /${result.join('/')}`;
  }
  $('#resolve-path')?.addEventListener('click', resolvePath); $('#path-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') resolvePath(); });
  $$('[data-mount]').forEach(button => button.addEventListener('click', () => {
    const n = Number(button.dataset.mount); $$('[data-mount]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('#disk-layer').classList.toggle('covered', n === 1); $('#ram-layer').hidden = n !== 1;
    $('#disk-status').textContent = n === 1 ? 'Скрыт подключённой файловой системой' : 'Доступен по прежнему пути';
    $('#mount-explanation').textContent = ['Каталог показывает before.txt из исходной файловой системы.', 'После mount путь показывает tmpfs. Здесь мы создали inside.txt; before.txt остаётся под точкой подключения.', 'После umount before.txt снова доступен. Временные данные этого экземпляра tmpfs больше не доступны.'][n];
  }));
  $('#check-placement')?.addEventListener('click', () => {
    let score = 0; $$('.quiz-row').forEach(row => { const select = $('select', row); const right = select.value === select.dataset.answer; row.dataset.correct = String(right); if (right) score++; const feedback = $('.feedback', row); feedback.textContent = (right ? 'Верно. ' : select.value ? `Для этого объекта подходит ${select.dataset.answer}. ` : 'Ответ не выбран. ') + feedback.dataset.explanation; }); $('#quiz-score').textContent = `${score} из 6 верно. ${score === 6 ? 'Теперь объясните выбор своими словами в отчёте.' : 'Исправьте ответы и проверьте ещё раз.'}`;
  });
  function checkStatus() { const count = $$('[data-check]').filter(x => x.checked).length; if ($('#check-status')) $('#check-status').textContent = `Отмечено ${count} из 5`; }
  $$('[data-check]').forEach(input => { const n = Number(input.dataset.check); input.checked = state.checks.includes(n); input.addEventListener('change', () => { state.checks = input.checked ? [...new Set([...state.checks, n])] : state.checks.filter(x => x !== n); save(); checkStatus(); }); }); checkStatus();
  const dialog = $('#image-dialog');
  $$('.zoom-shot').forEach(link => link.addEventListener('click', e => { if (e.ctrlKey || e.metaKey || e.shiftKey || !dialog.showModal) return; e.preventDefault(); const source = $('img', link); $('img', dialog).src = link.href; $('#original-image').href = link.href; $('img', dialog).alt = source.alt; $('p', dialog).textContent = source.alt; dialog.showModal(); }));
  $('#close-image').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  let previouslyOpen = [];
  addEventListener('beforeprint', () => { previouslyOpen = $$('details').filter(d => d.open); $$('details').forEach(d => d.open = true); });
  addEventListener('afterprint', () => { $$('details').forEach(d => d.open = previouslyOpen.includes(d)); });
  $('.print-button')?.addEventListener('click', () => window.print());
})();
