(() => {
  'use strict';
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notify = message => {
    const el = document.getElementById('toast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(notify.timer); notify.timer = setTimeout(() => el.classList.remove('show'), 2500);
  };
  // Переключатель языка материала: одна книга, две ветки (Python и Go).
  const LANGS = ['py', 'go'];
  const LANG_NOTES = {py: 'Python 3.10+ · venv и pip', go: 'Go 1.21+ · модули и go get'};
  let activeLang = 'py';
  try { activeLang = localStorage.getItem('modules-book-lang') || activeLang; } catch {}
  if (!LANGS.includes(activeLang)) activeLang = 'py';
  // Текст без скрытой языковой ветки: нужен для оглавления главы.
  const visibleText = el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(`[data-lang]:not([data-lang="${activeLang}"])`).forEach(node => node.remove());
    return clone.textContent.trim().replace(/\s+/g, ' ');
  };
  window.bookVisibleText = visibleText;
  window.bookLang = () => activeLang;
  function applyLang(lang, save) {
    activeLang = LANGS.includes(lang) ? lang : 'py';
    document.documentElement.dataset.lang = activeLang;
    document.querySelectorAll('[data-setlang]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.setlang === activeLang)));
    const note = document.getElementById('lang-note');
    if (note) note.textContent = LANG_NOTES[activeLang];
    // Заголовок вкладки тоже относится к языку: варианты лежат в data-атрибутах body.
    const titles = document.body.dataset;
    if (titles.titlePy && titles.titleGo) document.title = activeLang === 'go' ? titles.titleGo : titles.titlePy;
    if (save) { try { localStorage.setItem('modules-book-lang', activeLang); } catch { /* Чтение работает и без хранилища. */ } }
    document.dispatchEvent(new CustomEvent('langchange', {detail: activeLang}));
  }
  applyLang(activeLang, false);
  document.querySelectorAll('[data-setlang]').forEach(button =>
    button.addEventListener('click', () => applyLang(button.dataset.setlang, true)));

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
  // Оглавление главы собирается только из разделов текущего языка.
  function buildLocalToc() {
    const toc = document.querySelector('.local-toc > div');
    if (toc) toc.textContent = '';
    document.querySelectorAll('article > section').forEach(section => {
      const lang = section.dataset.lang;
      section.dataset.active = String(!lang || lang === activeLang);
    });
    const visible = [...document.querySelectorAll('article > section[data-active=true]')];
    visible.forEach((section, index) => {
      section.id = `section-${index + 1}`;
      const heading = section.querySelector('h2');
      if (!toc || !heading) return;
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = `${index + 1}. ${visibleText(heading)}`;
      toc.append(link);
    });
  }
  buildLocalToc();
  document.addEventListener('langchange', buildLocalToc);
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
  // Ветка Go: поиск go.mod вверх по дереву папок.
  const modToggle = document.getElementById('toggle-mod');
  if (modToggle) modToggle.addEventListener('click', () => {
    const nested = modToggle.getAttribute('aria-pressed') !== 'true';
    modToggle.setAttribute('aria-pressed', String(nested));
    modToggle.textContent = nested ? 'Показать запуск из корня' : 'Показать поиск из вложенной папки';
    const route = document.getElementById('mod-route');
    route.classList.toggle('active', nested);
    route.innerHTML = nested
      ? 'internal/services <span>↑</span> student-tools/go.mod'
      : 'go build <span>→</span> student-tools/go.mod';
    document.getElementById('mod-explain').textContent = nested
      ? 'Команда выполнена во вложенной папке: go.mod там нет, поэтому Go поднимается на уровень выше и находит его в корне. Модуль тот же самый.'
      : 'Команда выполнена в корне: go.mod найден сразу, модуль определён.';
  });
  const tree = document.getElementById('project-tree');
  const treeFiles = {
    py: [
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
    ],
    go: [
      ['student-tools/', 'Корень модуля. Здесь лежит go.mod, и отсюда выполняется go run .'],
      ['├ go.mod', 'Имя модуля, версия Go и список прямых зависимостей. Главный файл проекта в Go.'],
      ['├ go.sum', 'Контрольные суммы скачанных версий. Создаётся сам; руками не правим, но храним в Git.'],
      ['├ main.go', 'Пакет main: получает данные, вызывает расчёт и выводит строку цветом.'],
      ['├ internal/', 'Пакеты только для этого модуля. Импортировать их извне Go не разрешит.'],
      ['│ ├ services/', 'Пакет прикладной логики. Не знает ни про main, ни про оформление.'],
      ['│ │ └ calculator.go', 'Функция CalculateAverage: сумма / количество. Пустой срез возвращает ошибку.'],
      ['│ └ utils/', 'Пакет небольших вспомогательных функций.'],
      ['│   └ formatter.go', 'Функция FormatAverage: число превращается в строку с двумя знаками после точки.'],
      ['├ internal/services/calculator_test.go  [2.6]', 'Тест лежит рядом с кодом, в том же пакете. Добавим в следующей главе.'],
      ['├ .gitignore  [2.6]', 'В следующей главе исключим собранный бинарник и локальные файлы.'],
      ['└ README.md  [2.6]', 'В следующей главе напишем инструкцию, чтобы проект запустил другой человек.']
    ]
  };
  function buildTree() {
    if (!tree) return;
    tree.textContent = '';
    const panel = document.getElementById('tree-info');
    if (panel) panel.innerHTML = '<b>Выберите строку</b><p>Нажмите на файл или папку слева, чтобы прочитать, зачем они нужны.</p>';
    treeFiles[activeLang].forEach(([label, description]) => {
      const button = document.createElement('button');button.type = 'button';button.textContent = label;button.setAttribute('aria-pressed','false');
      button.addEventListener('click', () => {
        tree.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');
        document.getElementById('tree-info').innerHTML = `<b>${escape(label.replace(/[├└│]/g,'').trim())}</b><p>${escape(description)}</p>`;
      });
      tree.append(button);
    });
  }
  buildTree();
  document.addEventListener('langchange', buildTree);
  const importDescriptions = {
    py: ['app — обычный пакет приложения. Python ищет его из корня проекта.', 'services — вложенный пакет с прикладными вычислениями.', 'calculator — модуль calculator.py. Расширение в импорте не пишем.', 'calculate_average — функция внутри модуля. from … import … связывает это имя в main.py.'],
    go: ['example.com/student-tools — имя модуля из go.mod. С него начинается любой внутренний импорт.', 'internal — граница модуля: эти пакеты доступны только внутри проекта.', 'services — папка, и одновременно имя пакета. Импортируется путь к папке, не файл.', 'services.CalculateAverage — обращение к функции через имя пакета. Заглавная буква делает её видимой снаружи.']
  };
  document.querySelectorAll('[data-import]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-import]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    document.getElementById('import-info').textContent = importDescriptions[activeLang][Number(button.dataset.import)];
  }));
  // Мини-тренажёр: у каждой языковой ветки своя форма с одинаковыми именами полей.
  document.querySelectorAll('form[data-quiz]').forEach(quiz => quiz.addEventListener('submit', event => {
    event.preventDefault();const data = new FormData(quiz);
    const results = [data.get('calc') === 'service', data.get('fmt') === 'utils', data.get('env') === 'deps'];
    const count = results.filter(Boolean).length;
    const where = quiz.dataset.quiz === 'go' ? 'Скачанные зависимости лежат в общем кэше модулей, а их версии — в go.mod и go.sum.' : 'Установленные библиотеки находятся в .venv.';
    quiz.querySelector('[data-feedback]').textContent = count === 3 ? '3 из 3. Верно! Теперь восстановите структуру из архива в VS Code.' : `${count} из 3. ${!results[0] ? 'Вычисления относятся к services. ' : ''}${!results[1] ? 'Оформление строки относится к utils. ' : ''}${!results[2] ? where : ''}`;
  }));
  // Minimal local highlighting; source text is escaped before adding markup.
  const PY_TOKENS = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b(?:def|if|not|raise|return|from|import|class|with|as|for|in)\b)/g;
  const GO_TOKENS = /("(?:\\.|[^"\\])*"|`[^`]*`|\/\/[^\n]*|\b(?:package|import|func|return|if|else|for|range|var|const|type|struct|interface|map|defer|go|nil|errors|fmt)\b)/g;
  const PY_LABELS = ['ЗАЩИТА ТОЧКИ ЗАПУСКА', 'ДВА СПОСОБА ОБРАЩЕНИЯ'];
  const GO_LABELS = ['ТОЧКА ЗАПУСКА В GO', 'ИМЯ РЕШАЕТ ВИДИМОСТЬ'];
  document.querySelectorAll('.code').forEach(figure => {
    const label = figure.querySelector('figcaption > span')?.textContent || '';
    const isGo = label.endsWith('.go') || label.endsWith('go.mod') || GO_LABELS.includes(label);
    const isPy = label.endsWith('.py') || PY_LABELS.includes(label);
    if (!isGo && !isPy) return;
    const code = figure.querySelector('pre code');const source = code.textContent;
    const tokens = isGo ? GO_TOKENS : PY_TOKENS;
    tokens.lastIndex = 0;
    let start = 0, result = '';
    for (const match of source.matchAll(tokens)) {
      result += escape(source.slice(start,match.index));const token = match[0];
      const type = token.startsWith('#') || token.startsWith('//') ? 'comment' : /^["'`]/.test(token) ? 'str' : 'kw';
      result += `<span class="${type}">${escape(token)}</span>`;start = match.index + token.length;
    }
    code.innerHTML = result + escape(source.slice(start));
  });
})();

// An optional teaching view: preserve the chapter order and direct section links.
(() => {
  const toggle = document.getElementById('lesson-mode');
  if (!toggle) return;
  let sections = [...document.querySelectorAll('article > section[data-active=true]')];
  const controls = document.getElementById('step-controls');
  const previous = document.getElementById('step-prev');
  const next = document.getElementById('step-next');
  const status = document.getElementById('step-status');
  let active = false, index = 0;
  function show(scroll = false) {
    document.querySelectorAll('article > section').forEach(section => { section.hidden = false; });
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
  function bindTocLinks() {
    document.querySelectorAll('.local-toc a').forEach((link,i) => link.addEventListener('click', () => {index=i;show();}));
  }
  bindTocLinks();
  // Смена языка меняет набор разделов: пересобираем шаги и начинаем с первого.
  document.addEventListener('langchange', () => {
    sections = [...document.querySelectorAll('article > section[data-active=true]')];
    index = 0;
    bindTocLinks();
    show();
  });
  window.addEventListener('hashchange', () => {
    const found = sections.findIndex(s => `#${s.id}` === location.hash);
    if (found >= 0) {index=found;show();}
  });
  show();
})();

// Interactive схемы главы 2.3 и 2.5 + мягкое появление крупных блоков.
(() => {
  const installMap = document.getElementById('install-map');
  if (installMap) {
    const explain = document.getElementById('install-explain');
    const texts = {
      m: 'Модуль pip запускается внутри выбранного Python, поэтому пакет попадает в окружение проекта. Тот же интерпретатор потом запускает вашу программу — и видит библиотеку.',
      bare: 'Какая программа pip запустится, решает PATH. В одном терминале это pip из .venv, в другом — pip другого Python. Пакет может уехать в чужое окружение, и тогда программа не найдёт библиотеку.'
    };
    document.querySelectorAll('[data-install]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.install;
      document.querySelectorAll('[data-install]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      installMap.dataset.mode = mode;
      explain.textContent = texts[mode];
    }));
  }

  const runMap = document.getElementById('run-map');
  if (runMap) {
    const explain = document.getElementById('run-explain');
    const state = {
      module: {
        start: 'root', hidden: null,
        text: 'Python начинает поиск с текущей папки — корня проекта. Внутри него виден пакет app, поэтому импорт from app.services.calculator работает.'
      },
      file: {
        start: 'pkg', hidden: 'root',
        text: 'При запуске файлом поиск начинается с папки, где лежит сам файл, — с app/. Корень проекта в поиск не попадает, пакет app снаружи не виден: ModuleNotFoundError: No module named app.'
      }
    };
    document.querySelectorAll('[data-run]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.run;
      document.querySelectorAll('[data-run]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      runMap.dataset.mode = mode;
      runMap.querySelectorAll('.rm-line').forEach(line => {
        line.removeAttribute('data-start'); line.removeAttribute('data-hidden');
        if (line.dataset.level === state[mode].start) line.setAttribute('data-start','');
        if (line.dataset.level === state[mode].hidden) line.setAttribute('data-hidden','');
      });
      explain.textContent = state[mode].text;
    }));
    runMap.querySelector('.rm-line[data-level=root]').setAttribute('data-start','');
  }

  const nameMap = document.getElementById('name-map');
  if (nameMap) {
    const state = {
      run: {value: '"__main__"', cond: 'выполняется', call: 'вызывается',
            text: 'Файл запущен напрямую: Python дал ему имя __main__, условие истинно, программа стартовала. Это обычный запуск вашей программы.'},
      import: {value: '"main"', cond: 'ложно', call: 'не вызывается',
            text: 'Файл импортирован другим файлом: Python дал ему собственное имя модуля. Определения из файла созданы и доступны, но программа не стартовала — именно этого мы и добиваемся.'}
    };
    document.querySelectorAll('[data-namemode]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.namemode;
      document.querySelectorAll('[data-namemode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      nameMap.dataset.mode = mode;
      document.getElementById('nm-value').textContent = state[mode].value;
      document.getElementById('nm-cond').textContent = state[mode].cond;
      document.getElementById('nm-call').textContent = state[mode].call;
      document.getElementById('name-explain').textContent = state[mode].text;
    }));
  }

  // Ветка Go: заглавная буква решает, видно ли имя за пределами пакета.
  const visMap = document.getElementById('vis-map');
  if (visMap) {
    const state = {
      up: {inside: 'доступна', outside: 'доступна', call: 'services.CalculateAverage(values)',
        text: 'Имя начинается с заглавной буквы — функция экспортирована. Это часть публичного интерфейса пакета: её могут вызывать другие пакеты и тесты.'},
      low: {inside: 'доступна', outside: 'не существует', call: 'services.calculateAverage undefined',
        text: 'Имя начинается со строчной буквы — функция видна только внутри своего пакета. Компилятор остановит сборку: undefined (name calculateAverage is not exported). Так в Go скрывают внутренние детали пакета.'}
    };
    document.querySelectorAll('[data-vis]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.vis;
      document.querySelectorAll('[data-vis]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      visMap.dataset.mode = mode;
      document.getElementById('vis-inside').textContent = state[mode].inside;
      document.getElementById('vis-outside').textContent = state[mode].outside;
      document.getElementById('vis-call').textContent = state[mode].call;
      document.getElementById('vis-explain').textContent = state[mode].text;
    }));
  }

  const impMap = document.getElementById('imp-map');
  if (impMap) {
    const state = {
      module: {name: 'calculator', what: 'модуль целиком', call: 'calculator.calculate_average([5, 4, 5])',
        text: 'Видно, откуда пришла функция: имя модуля остаётся в строке вызова. Удобно, когда из модуля нужно много всего или когда имена в разных модулях совпадают.'},
      name: {name: 'calculate_average', what: 'одна функция из модуля', call: 'calculate_average([5, 4, 5])',
        text: 'Короче в вызове, но по строке уже не видно, из какого модуля пришло имя. Так пишут, когда из модуля нужны одна-две функции и имена не спорят между собой.'}
    };
    document.querySelectorAll('[data-imp]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.imp;
      document.querySelectorAll('[data-imp]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      impMap.dataset.mode = mode;
      document.getElementById('imp-name').textContent = state[mode].name;
      document.getElementById('imp-what').textContent = state[mode].what;
      document.getElementById('imp-call').textContent = state[mode].call;
      document.getElementById('imp-explain').textContent = state[mode].text;
    }));
  }

  const depMap = document.getElementById('dep-map');
  if (depMap) {
    const depTexts = {
      py: {
        ok: 'Стрелка одна и вниз: main.py импортирует расчёт и оформление. Калькулятор можно вызвать из тестов, из другой программы, из будущего веб-интерфейса — он ничего не знает о том, кто его использует.',
        bad: 'Появилась встречная стрелка: расчёт импортирует точку запуска. Каждый модуль ждёт, пока догрузится другой, и Python сообщает об ошибке partially initialized module. Вычислениям точка запуска не нужна — данные они получают аргументами.'
      },
      go: {
        ok: 'Стрелка одна и вниз: пакет main импортирует services и utils. Калькулятор можно вызвать из теста, из другой команды, из будущего HTTP-обработчика — он ничего не знает о том, кто его использует.',
        bad: 'Появилась встречная стрелка: services импортирует main. Go такой проект просто не собирает: import cycle not allowed — ошибка возникает на компиляции, до первого запуска. Вычислениям точка запуска не нужна: данные они получают аргументами.'
      }
    };
    const depText = mode => depTexts[window.bookLang ? window.bookLang() : 'py'][mode];
    document.querySelectorAll('[data-dep]').forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.dep;
      document.querySelectorAll('[data-dep]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      depMap.dataset.mode = mode;
      depMap.querySelector('[data-arrow=up]').hidden = mode !== 'bad';
      depMap.dataset.lastMode = mode;
      document.getElementById('dep-explain').textContent = depText(mode);
    }));
    // После смены языка пояснение должно соответствовать новому языку.
    document.addEventListener('langchange', () => {
      const mode = depMap.dataset.lastMode;
      if (mode) document.getElementById('dep-explain').textContent = depText(mode);
    });
  }

  const blocks = document.querySelectorAll('.evidence, .action-card, .lab');
  if (!blocks.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  blocks.forEach(block => block.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    });
  }, {rootMargin: '0px 0px -12% 0px'});
  blocks.forEach(block => observer.observe(block));
  // Safety net: nothing may stay invisible because of a missed observer callback.
  setTimeout(() => blocks.forEach(block => block.classList.add('seen')), 4000);
})();
