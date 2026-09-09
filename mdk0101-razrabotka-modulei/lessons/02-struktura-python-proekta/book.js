(() => {
  'use strict';
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notify = message => {
    const el = document.getElementById('toast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(notify.timer); notify.timer = setTimeout(() => el.classList.remove('show'), 2500);
  };
  document.addEventListener('click', async event => {
    const button = event.target.closest('.copy');
    if (!button) return;
    const text = button.closest('.code').querySelector('pre code').textContent;
    try {
      await navigator.clipboard.writeText(text);
      notify('Скопировано');
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(button.closest('.code').querySelector('pre code'));
      selection.removeAllRanges(); selection.addRange(range);
      notify('Копирование недоступно. Текст выделен — нажмите Ctrl+C / Cmd+C.');
    }
  });
  const commands = {
    windows: {
      create: 'py --version\npy -m venv .venv',
      activate: '.\\.venv\\Scripts\\Activate.ps1',
      direct: '.\\.venv\\Scripts\\python.exe -c "import sys; print(sys.executable)"',
      inside: '.venv/\n├── Scripts/      ← Python и скрипты активации\n├── Lib/          ← установленные библиотеки\n└── pyvenv.cfg    ← настройки окружения'
    },
    cmd: {
      create: 'py --version\npy -m venv .venv',
      activate: '.venv\\Scripts\\activate.bat',
      direct: '.venv\\Scripts\\python.exe -c "import sys; print(sys.executable)"',
      inside: '.venv/\n├── Scripts/      ← Python и скрипты активации\n├── Lib/          ← установленные библиотеки\n└── pyvenv.cfg    ← настройки окружения'
    },
    mac: {
      create: 'python3 --version\npython3 -m venv .venv',
      activate: 'source .venv/bin/activate',
      direct: './.venv/bin/python -c "import sys; print(sys.executable)"',
      inside: '.venv/\n├── bin/          ← Python и скрипты активации\n├── lib/          ← установленные библиотеки\n└── pyvenv.cfg    ← настройки окружения'
    },
    linux: {
      create: 'python3 --version\npython3 -m venv .venv',
      activate: 'source .venv/bin/activate',
      direct: './.venv/bin/python -c "import sys; print(sys.executable)"',
      inside: '.venv/\n├── bin/          ← Python и скрипты активации\n├── lib/          ← установленные библиотеки\n└── pyvenv.cfg    ← настройки окружения'
    }
  };
  function setOS(os) {
    if (!commands[os]) os = 'windows';
    document.querySelectorAll('[data-os]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.os === os)));
    document.querySelectorAll('.os-commands').forEach(el => {
      const kind = el.dataset.kind;
      const label = kind === 'inside' ? 'СТРУКТУРА · student-tools/.venv/' : 'ТЕРМИНАЛ · student-tools/';
      el.innerHTML = `<figure class="code"><figcaption><span>${label}</span><button class="copy" type="button">Копировать</button></figcaption><pre><code>${escape(commands[os][kind])}</code></pre></figure>`;
    });
    try { localStorage.setItem('python-book-os', os); } catch { /* Reading works without storage. */ }
  }
  let storedOS = 'windows';
  try { storedOS = localStorage.getItem('python-book-os') || storedOS; } catch {}
  setOS(storedOS);
  document.querySelectorAll('[data-os]').forEach(button => button.addEventListener('click', () => setOS(button.dataset.os)));
  document.querySelectorAll('article > section').forEach((section, index) => {
    section.id = `section-${index + 1}`;
    const toc = document.querySelector('.local-toc > div');
    if (toc) {
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = `${index + 1}. ${section.querySelector('h2').textContent}`;
      toc.append(link);
    }
  });
  const progress = document.querySelector('.reading-progress span');
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${distance > 0 ? Math.min(100, window.scrollY / distance * 100) : 100}%`;
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress); updateProgress();
  const contents = document.querySelector('.contents');
  if (window.matchMedia('(max-width:850px)').matches) contents.open = false;
  const toggle = document.getElementById('toggle-env');
  if (toggle) toggle.addEventListener('click', () => {
    const active = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(active));
    toggle.textContent = active ? 'Показать деактивацию' : 'Показать активацию';
    const route = document.getElementById('env-route');
    route.classList.toggle('active', active);
    route.innerHTML = active ? 'python <span>→</span> student-tools/.venv' : 'python <span>→</span> базовый Python';
    document.getElementById('env-explain').textContent = active ? 'Теперь терминал ищет команды сначала в .venv. Папка с кодом при этом не перемещается.' : 'Активация отменена. Окружение осталось на диске, но прежний путь поиска команд восстановлен.';
  });
  const tree = document.getElementById('project-tree');
  const files = [
    ['student-tools/', 'Корень проекта. Здесь находятся app и служебные файлы. Отсюда запускаем python -m app.main.'],
    ['├ .venv/', 'Локальный Python и установленные пакеты. В Git и архив с исходниками не включаем.'],
    ['├ app/', 'Пакет приложения: точка запуска, прикладной расчёт и оформление.'],
    ['│ ├ __init__.py', 'Пустой маркер обычного пакета app. Код инициализации здесь пока не нужен.'],
    ['│ ├ main.py', 'Получает данные, вызывает расчёт и выводит строку через Rich.'],
    ['│ ├ services/', 'Пакет прикладной логики. Не зависит от main и оформления.'],
    ['│ │ ├ __init__.py', 'Пустой файл обычного пакета app.services.'],
    ['│ │ └ calculator.py', 'Функция calculate_average: сумма / количество. Пустой список вызывает ValueError.'],
    ['│ └ utils/', 'Пакет небольших вспомогательных функций.'],
    ['│   ├ __init__.py', 'Пустой файл обычного пакета app.utils.'],
    ['│   └ formatter.py', 'Функция format_average: число превращается в строку с двумя знаками после точки.'],
    ['├ tests/  [глава 2.6]', 'Добавим в следующей главе: проверки расчёта, пустого списка и форматирования.'],
    ['├ .gitignore  [2.6]', 'В следующей главе исключим .venv, кэш и .env из Git.'],
    ['├ requirements.txt  [2.6]', 'В следующей главе зафиксируем установленные библиотеки и версии.'],
    ['└ README.md  [2.6]', 'В следующей главе напишем инструкцию, чтобы проект запустил другой человек.']
  ];
  if (tree) files.forEach(([label,description]) => {
    const button = document.createElement('button');button.type = 'button';button.textContent = label;button.setAttribute('aria-pressed','false');
    button.addEventListener('click', () => {
      tree.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');
      const panel = document.getElementById('tree-info');panel.innerHTML = `<b>${escape(label.replace(/[├└│]/g,'').trim())}</b><p>${escape(description)}</p>`;
    });tree.append(button);
  });
  const importDescriptions = ['app — обычный пакет приложения. Python ищет его из корня проекта.', 'services — вложенный пакет с прикладными вычислениями.', 'calculator — модуль calculator.py. Расширение в импорте не пишем.', 'calculate_average — функция внутри модуля. from … import … связывает это имя в main.py.'];
  document.querySelectorAll('[data-import]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-import]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    document.getElementById('import-info').textContent = importDescriptions[Number(button.dataset.import)];
  }));
  const quiz = document.getElementById('sort-quiz');
  if (quiz) quiz.addEventListener('submit', event => {
    event.preventDefault();const data = new FormData(quiz);
    const results = [data.get('calc') === 'service', data.get('fmt') === 'utils', data.get('env') === 'venv'];
    const count = results.filter(Boolean).length;
    document.getElementById('sort-feedback').textContent = count === 3 ? '3 из 3. Верно! Теперь восстановите структуру из архива в VS Code.' : `${count} из 3. ${!results[0] ? 'Вычисления относятся к services. ' : ''}${!results[1] ? 'Оформление строки относится к utils. ' : ''}${!results[2] ? 'Установленные библиотеки находятся в .venv.' : ''}`;
  });
  // Minimal local highlighting; source text is escaped before adding markup.
  document.querySelectorAll('.code').forEach(figure => {
    const label = figure.querySelector('figcaption > span')?.textContent || '';
    if (!label.endsWith('.py') && label !== 'ЗАЩИТА ТОЧКИ ЗАПУСКА' && label !== 'ДВА СПОСОБА ОБРАЩЕНИЯ') return;
    const code = figure.querySelector('pre code');const source = code.textContent;
    const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b(?:def|if|not|raise|return|from|import|class|with|as|for|in)\b)/g;
    let start = 0, result = '';
    for (const match of source.matchAll(tokens)) {
      result += escape(source.slice(start,match.index));const token = match[0];
      const type = token[0] === '#' ? 'comment' : /^["']/.test(token) ? 'str' : 'kw';
      result += `<span class="${type}">${escape(token)}</span>`;start = match.index + token.length;
    }
    code.innerHTML = result + escape(source.slice(start));
  });
})();

// An optional teaching view: preserve the chapter order and direct section links.
(() => {
  const toggle = document.getElementById('lesson-mode');
  if (!toggle) return;
  const sections = [...document.querySelectorAll('article > section')];
  const controls = document.getElementById('step-controls');
  const previous = document.getElementById('step-prev');
  const next = document.getElementById('step-next');
  const status = document.getElementById('step-status');
  let active = false, index = 0;
  function show(scroll = false) {
    sections.forEach((section, i) => section.hidden = active && i !== index);
    document.body.classList.toggle('lecture-mode', active);
    controls.hidden = !active;
    toggle.setAttribute('aria-pressed', String(active));
    toggle.textContent = active ? 'Показать главу целиком' : 'Показывать по одному шагу';
    status.textContent = `Шаг ${index + 1} из ${sections.length}`;
    previous.disabled = index === 0;
    next.disabled = index === sections.length - 1;
    document.querySelectorAll('.local-toc a').forEach((a, i) => {
      if (active && i === index) a.setAttribute('aria-current','step');
      else a.removeAttribute('aria-current');
    });
    if (scroll) controls.scrollIntoView({block:'start',behavior:'instant'});
  }
  toggle.addEventListener('click', () => {
    active = !active;
    const fromHash = sections.findIndex(s => `#${s.id}` === location.hash);
    if (fromHash >= 0) index = fromHash;
    show(active);
  });
  previous.addEventListener('click', () => { if (index > 0) {index--;show(true);} });
  next.addEventListener('click', () => { if (index < sections.length - 1) {index++;show(true);} });
  document.querySelectorAll('.local-toc a').forEach((link,i) => link.addEventListener('click', () => {index=i;show();}));
  window.addEventListener('hashchange', () => {
    const found = sections.findIndex(s => `#${s.id}` === location.hash);
    if (found >= 0) {index=found;show();}
  });
  show();
})();
