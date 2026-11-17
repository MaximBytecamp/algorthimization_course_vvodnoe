(() => {
  'use strict';

  const KEY = 'op04-hesh-praktikum-v4';
  const CASES = [
    {
      id: 'payments', number: '01', title: 'Повторная оплата',
      lead: 'Шлюз иногда повторно доставляет одно и то же событие. У каждой оплаты есть уникальный event_id: повторная доставка несёт тот же идентификатор. Один клиент, напротив, может оплатить несколько разных заказов.',
      tasks: [
        {
          id: 'pay-bug', type: 'choice', title: 'Найдите неверный ключ',
          instruction: 'Коллега пытается отсечь повторы. Какой дефект даст этот фрагмент?',
          code: `def accept_payments(events):\n    seen_clients = set()\n    accepted = []\n    for event in events:\n        if event["client_id"] in seen_clients:\n            continue\n        seen_clients.add(event["client_id"])\n        accepted.append(event["event_id"])\n    return accepted\n\nevents = [\n    {"event_id": "pay-301", "client_id": "c-18"},\n    {"event_id": "pay-302", "client_id": "c-18"},\n]\nprint(accept_payments(events))`,
          output: "Вывод Python: ['pay-301'].",
          options: [
            ['same-client', 'Две разные оплаты одного клиента будут приняты за повтор.'],
            ['list-needed', 'Нельзя использовать set для идентификаторов.'],
            ['sort-needed', 'Перед проверкой надо отсортировать события.']
          ], answer: 'same-client',
          explain: 'Для дедупликации нужен event_id: клиент может оплатить два заказа, а повтор доставки сохраняет идентификатор одной оплаты.'
        },
        {
          id: 'pay-duplicate', type: 'multi', title: 'Отметьте повторы доставки',
          instruction: 'Какие строки журнал уже получил раньше и должен пропустить? Сравнивайте только event_id.',
          table: { caption: 'Журнал шлюза за минуту', heads: ['Время', 'event_id', 'client_id', 'Сумма'], rows: [
            ['10:02:11', 'pay-410', 'c-07', '1 290 ₽'], ['10:02:13', 'pay-411', 'c-07', '890 ₽'],
            ['10:02:16', 'pay-410', 'c-07', '1 290 ₽'], ['10:02:19', 'pay-412', 'c-31', '0 ₽'],
            ['10:02:22', 'pay-411', 'c-07', '890 ₽']
          ]},
          options: [
            ['r1', '10:02:11 · pay-410'], ['r2', '10:02:13 · pay-411'], ['r3', '10:02:16 · pay-410'],
            ['r4', '10:02:19 · pay-412'], ['r5', '10:02:22 · pay-411']
          ], answer: ['r3', 'r5'],
          explain: 'Повторно пришли pay-410 и pay-411. Нулевая сумма pay-412 не делает событие повтором.'
        },
        {
          id: 'pay-order', type: 'order', title: 'Соберите обработку события',
          instruction: 'Нажмите только нужные шаги в порядке выполнения для нового события. Пул намеренно перемешан.',
          steps: [
            ['record', 'Записать оплату в журнал.'], ['check', 'Проверить event_id в множестве seen.'],
            ['get', 'Взять event_id из события.'], ['add', 'Добавить event_id в seen.'],
            ['client', 'Проверить client_id в множестве seen.']
          ], answer: ['get', 'check', 'add', 'record'],
          explain: 'Сначала извлекают и проверяют event_id. Только новое событие помечают как увиденное и записывают; повтор останавливается на проверке.'
        }
      ]
    },
    {
      id: 'delivery', number: '02', title: 'Сверка поставки',
      lead: 'Накладная и фактическая приёмка содержат повторяющиеся позиции. Здесь важно не только наличие SKU, но и количество каждой единицы.',
      tasks: [
        {
          id: 'delivery-bug', type: 'choice', title: 'Найдите потерянные количества',
          instruction: 'Почему такой код не годится для сверки поставки?',
          code: `def missing_skus(invoice, received):\n    expected = set(invoice)\n    actual = set(received)\n    return expected - actual\n\ninvoice = ["MUG", "MUG", "MUG", "PEN"]\nreceived = ["MUG", "PEN"]\nprint(missing_skus(invoice, received))`,
          output: 'Вывод Python: set().',
          options: [
            ['counts-lost', 'Множества убрали повторы: код не увидит, что двух MUG не хватает.'],
            ['key-order', 'set возвращает SKU в неправильном порядке.'],
            ['dict-only', 'Списки нельзя передавать функции.']
          ], answer: 'counts-lost',
          explain: 'set отвечает только на вопрос «есть ли SKU». Для накладной нужны частоты: например, Counter или словарь SKU → количество.'
        },
        {
          id: 'delivery-result', type: 'choice', title: 'Сформулируйте итог приёмки',
          instruction: 'Сначала посчитайте каждую позицию. Какой итог верен?',
          table: { caption: 'Накладная и фактически принятый товар', heads: ['SKU', 'По накладной', 'Принято'], rows: [
            ['MUG', '4', '2'], ['PEN', '3', '5'], ['NOTE', '1', '1']
          ]},
          options: [
            ['right', 'Недостача: MUG — 2 шт.; излишек: PEN — 2 шт.'],
            ['missing-only', 'Недостача: MUG — 1 шт.; излишков нет.'],
            ['sets', 'Ошибок нет: все три SKU встретились.']
          ], answer: 'right',
          explain: 'Недостача и излишек считаются раздельно по разности количеств: MUG 4 − 2, PEN 5 − 3.'
        },
        {
          id: 'delivery-order', type: 'order', title: 'Соберите сверку',
          instruction: 'Расположите нужные шаги. Лишний шаг оставьте в пуле.',
          steps: [
            ['compare', 'Для каждого SKU сравнить ожидаемое и принятое количество.'], ['sets', 'Превратить оба списка в множества.'],
            ['expected', 'Посчитать частоты SKU в накладной.'], ['report', 'Записать отдельно недостачи и излишки.'],
            ['actual', 'Посчитать частоты SKU в приёмке.']
          ], answer: ['expected', 'actual', 'compare', 'report'],
          explain: 'Два счётчика сохраняют кратность. После сравнения по каждому SKU отчёт разделяет недостачу и излишек.'
        }
      ]
    },
    {
      id: 'catalog', number: '03', title: 'Группы каталога',
      lead: 'Служба контента ищет похожие буквенные метки для ручной проверки. В этой задаче совпадение означает: одинаковые латинские буквы без учёта регистра, дефисов и цифр, но с учётом каждой повторной буквы. Это не означает, что товары взаимозаменяемы.',
      tasks: [
        {
          id: 'catalog-bug', type: 'choice', title: 'Проверьте ключ группы',
          instruction: 'Какой дефект есть в построении сигнатуры?',
          code: `def signature(code):\n    letters = (ch.lower() for ch in code if ch.isalpha())\n    return ''.join(sorted(set(letters)))\n\nprint(signature("ABBA-12"))\nprint(signature("AB-12"))`,
          output: 'Вывод Python: две строки ab и ab.',
          options: [
            ['repeat-lost', 'set убирает повторные буквы, хотя они являются частью правила.'],
            ['case-lost', 'lower() ломает сравнение регистров.'],
            ['digits-kept', 'isalpha() оставляет цифры в сигнатуре.']
          ], answer: 'repeat-lost',
          explain: 'Нужно отсортировать все отобранные буквы, а не set букв: сигнатуры aabb и ab должны различаться.'
        },
        {
          id: 'catalog-group', type: 'multi', title: 'Соберите одну группу',
          instruction: 'Какие метки попадут в группу с ABBA-12 по описанному правилу?',
          table: { caption: 'Метки для проверки', heads: ['Метка'], rows: [
            ['ABBA-12'], ['BAAB-77'], ['AB-12'], ['AABB-45'], ['BABA-99']
          ]},
          options: [
            ['baab', 'BAAB-77'], ['ab', 'AB-12'], ['aabb', 'AABB-45'], ['baba', 'BABA-99']
          ], answer: ['baab', 'aabb', 'baba'],
          explain: 'BAAB, AABB и BABA дают aabb, как и исходная метка. AB-12 даёт ab: одной пары букв в ней нет.'
        },
        {
          id: 'catalog-order', type: 'order', title: 'Соберите группировку',
          instruction: 'Поставьте шаги в порядок для каждой метки. Пул намеренно перемешан.',
          steps: [
            ['append', 'Добавить исходную метку в список по этому ключу.'], ['sort', 'Отсортировать все отобранные буквы, сохранив повторы.'],
            ['filter', 'Оставить латинские буквы и перевести их в нижний регистр.'], ['set', 'Сделать из букв множество.'],
            ['key', 'Использовать полученную строку как ключ словаря групп.']
          ], answer: ['filter', 'sort', 'key', 'append'],
          explain: 'Нормализация создаёт повторяемый ключ. Словарь связывает ключ с группой исходных меток; set здесь разрушил бы правило.'
        }
      ]
    },
    {
      id: 'cache', number: '04', title: 'Кэш цен',
      lead: 'Кэш каталога вмещает три позиции. В LRU чтение существующего ключа делает его самым свежим. Цена 0 ₽ — корректное значение, а не признак отсутствия.',
      tasks: [
        {
          id: 'cache-bug', type: 'choice', title: 'Найдите дефект чтения',
          instruction: 'Почему чтение цены 0 ₽ не обновит положение ключа?',
          code: `from collections import OrderedDict\n\ndef read_price(cache, sku):\n    price = cache.get(sku)\n    if price:\n        cache.move_to_end(sku)\n    return price\n\ncache = OrderedDict([("LIME", 0), ("BAG", 890)])\nprint(read_price(cache, "LIME"))\nprint(list(cache))`,
          output: "Заранее рассчитанный прогон: 0 и ['LIME', 'BAG']; LIME остался самым старым.",
          options: [
            ['zero-false', 'Условие if price считает 0 ложным, хотя ключ найден.'],
            ['ordered-bad', 'OrderedDict нельзя использовать для LRU.'],
            ['sort-keys', 'После чтения надо отсортировать SKU.']
          ], answer: 'zero-false',
          explain: 'Проверять нужно наличие ключа, например if sku in cache. Тогда значение 0 вернётся и ключ переместится в конец.'
        },
        {
          id: 'cache-evict', type: 'choice', title: 'Определите вытеснение',
          instruction: 'Кто будет вытеснен при добавлении четвёртой позиции?',
          log: ['Старт, от старого к свежему: [LIME: 0, BAG: 890, CUP: 240]', 'Чтение LIME → [BAG: 890, CUP: 240, LIME: 0]', 'Запись BOOK: 340, вместимость 3'],
          options: [
            ['bag', 'BAG'], ['cup', 'CUP'], ['lime', 'LIME'], ['book', 'BOOK']
          ], answer: 'bag',
          explain: 'После чтения LIME стала свежей, несмотря на цену 0. Самой давней осталась BAG, её и удаляет LRU.'
        },
        {
          id: 'cache-order', type: 'order', title: 'Соберите чтение из LRU',
          instruction: 'Соберите ветку для ключа, который уже есть в кэше. Лишний шаг оставьте в пуле.',
          steps: [
            ['move', 'Переместить ключ в конец как самый свежий.'], ['test', 'Проверить, есть ли SKU среди ключей кэша.'],
            ['return', 'Вернуть сохранённую цену, включая 0.'], ['get', 'Получить значение цены по SKU.'],
            ['truth', 'Проверить, является ли цена истинной.']
          ], answer: ['test', 'get', 'move', 'return'],
          explain: 'Проверка наличия ключа не путает 0 с отсутствием. Успешное чтение обновляет порядок, затем возвращает значение.'
        }
      ]
    }
  ];

  const TASKS = CASES.flatMap(caseItem => caseItem.tasks.map(task => ({ ...task, caseId: caseItem.id, caseTitle: caseItem.title })));
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const blankAnswer = task => task.type === 'order' ? [] : task.type === 'multi' ? [] : '';
  const emptyState = () => ({ version: 4, started: false, submitted: false, view: 'payments', answers: Object.fromEntries(TASKS.map(task => [task.id, blankAnswer(task)])), reflection: '' });

  let storageUsable = true;
  let storageMessage = '';
  function canUseStorage() {
    try {
      const probe = `${KEY}:probe`;
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch (_) { return false; }
  }
  storageUsable = canUseStorage();

  function validAnswer(task, answer) {
    const keys = task.type === 'order' ? task.steps.map(step => step[0]) : task.options.map(option => option[0]);
    if (task.type === 'choice') return typeof answer === 'string' && (answer === '' || keys.includes(answer));
    return Array.isArray(answer) && answer.every(value => typeof value === 'string' && keys.includes(value)) && new Set(answer).size === answer.length;
  }
  function validState(candidate) {
    return candidate && typeof candidate === 'object' && candidate.version === 4 && typeof candidate.started === 'boolean' &&
      typeof candidate.submitted === 'boolean' && typeof candidate.view === 'string' && typeof candidate.reflection === 'string' &&
      candidate.reflection.length <= 4000 && candidate.answers && typeof candidate.answers === 'object' &&
      TASKS.every(task => Object.prototype.hasOwnProperty.call(candidate.answers, task.id) && validAnswer(task, candidate.answers[task.id]));
  }
  function load() {
    if (!storageUsable) {
      storageMessage = 'Автосохранение недоступно в этом браузере: ответы останутся до закрытия страницы.';
      return emptyState();
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      if (validState(parsed)) return parsed;
      localStorage.removeItem(KEY);
      storageMessage = 'Некорректное сохранение v4 сброшено; текущая работа будет сохранена заново.';
      return emptyState();
    } catch (_) {
      storageMessage = 'Не удалось прочитать сохранение v4; начат чистый бланк.';
      return emptyState();
    }
  }
  let state = load();

  function save() {
    if (!storageUsable) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      storageUsable = false;
      storageMessage = 'Автосохранение стало недоступно: не закрывайте страницу до сдачи.';
      updateStorageStatus();
      return false;
    }
  }
  function updateStorageStatus() {
    const target = $('storage-status');
    if (!target) return;
    target.textContent = storageUsable ? (storageMessage || 'Ответы автоматически сохранены в этом браузере.') : storageMessage;
  }
  function sameSet(first, second) { return first.length === second.length && first.every(value => second.includes(value)); }
  function complete(task) {
    const answer = state.answers[task.id];
    return task.type === 'choice' ? answer !== '' : answer.length > 0;
  }
  function correct(task) {
    const answer = state.answers[task.id];
    if (task.type === 'order') {
      const variants = [task.answer];
      if (task.id === 'delivery-order') variants.push(['actual', 'expected', 'compare', 'report']);
      if (task.id === 'cache-order') variants.push(['test', 'move', 'get', 'return']);
      return variants.some(order => answer.join('|') === order.join('|'));
    }
    return task.type === 'multi' ? sameSet(answer, task.answer) : answer === task.answer;
  }
  function caseComplete(caseItem) { return caseItem.tasks.filter(complete).length; }
  function answerText(task) {
    const answer = state.answers[task.id];
    const pool = task.type === 'order' ? task.steps : task.options;
    const labels = Object.fromEntries(pool.map(item => [item[0], item[1]]));
    if (task.type === 'choice') return answer ? labels[answer] : 'Нет ответа';
    return answer.length ? answer.map(key => labels[key]).join(' → ') : 'Нет ответа';
  }

  function tableMarkup(table) {
    return `<table class="data-table"><caption>${esc(table.caption)}</caption><thead><tr>${table.heads.map(head => `<th scope="col">${esc(head)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function choiceMarkup(task, readonly) {
    const answer = state.answers[task.id];
    return `<fieldset ${readonly ? 'disabled' : ''}><legend>Выберите один вариант</legend><div class="options">${task.options.map(([key, text]) => `<label class="option"><input type="radio" name="${task.id}" value="${key}" data-choice="${task.id}" ${answer === key ? 'checked' : ''}><span>${esc(text)}</span></label>`).join('')}</div></fieldset>`;
  }
  function multiMarkup(task, readonly) {
    const selected = state.answers[task.id];
    return `<fieldset ${readonly ? 'disabled' : ''}><legend>Выберите все подходящие варианты</legend><div class="options">${task.options.map(([key, text]) => `<label class="option"><input type="checkbox" value="${key}" data-multi="${task.id}" ${selected.includes(key) ? 'checked' : ''}><span>${esc(text)}</span></label>`).join('')}</div></fieldset>`;
  }
  function orderMarkup(task, readonly) {
    const chosen = state.answers[task.id];
    const labels = Object.fromEntries(task.steps.map(step => [step[0], step[1]]));
    const available = task.steps.filter(([key]) => !chosen.includes(key));
    return `<fieldset><legend>Ваш порядок</legend><div class="options" aria-label="Выбранные шаги">${chosen.length ? chosen.map((key, index) => `<button class="option" type="button" data-order-remove="${task.id}:${key}" aria-pressed="true" ${readonly ? 'disabled' : ''}><span>${index + 1}. ${esc(labels[key])} <span aria-hidden="true">×</span></span></button>`).join('') : '<p class="helper">Пока ни одного шага не выбрано.</p>'}</div><p class="field-label">Пул шагов</p><div class="options">${available.map(([key, text]) => `<button class="option" type="button" data-order-add="${task.id}:${key}" aria-pressed="false" ${readonly ? 'disabled' : ''}>${esc(text)}</button>`).join('') || '<p class="helper">Все шаги перенесены в порядок.</p>'}</div></fieldset>`;
  }
  function taskMarkup(task, number, readonly) {
    const interaction = task.type === 'choice' ? choiceMarkup(task, readonly) : task.type === 'multi' ? multiMarkup(task, readonly) : orderMarkup(task, readonly);
    return `<article class="task" aria-labelledby="${task.id}-title"><div class="task-title"><h3 id="${task.id}-title">${number}. ${esc(task.title)}</h3><span class="task-points">1 балл</span></div><p class="task-instruction">${esc(task.instruction)}</p>${task.table ? tableMarkup(task.table) : ''}${task.log ? `<div class="log">${task.log.map(line => `<div>${esc(line)}</div>`).join('')}</div>` : ''}${task.code ? `<div class="code-wrap"><div class="code-label">ФРАГМЕНТ PYTHON · НЕ ВЫПОЛНЯЕТСЯ В БРАУЗЕРЕ</div><pre class="code"><code>${esc(task.code)}</code></pre><p class="helper">${esc(task.output)}</p></div>` : ''}${interaction}${readonly ? `<p class="status-line">Ответ: ${esc(answerText(task))}</p>` : ''}</article>`;
  }
  function caseMarkup(caseItem, readonly) {
    const startNumber = CASES.slice(0, CASES.indexOf(caseItem)).reduce((sum, item) => sum + item.tasks.length, 0);
    return `<header class="case-header"><span class="case-tag">КЕЙС ${caseItem.number} · 3 действия</span><h2>${esc(caseItem.title)}</h2><p>${esc(caseItem.lead)}</p></header>${caseItem.tasks.map((task, index) => taskMarkup(task, startNumber + index + 1, readonly)).join('')}${!readonly && caseItem.id === 'cache' ? reflectionMarkup(false) : ''}${!readonly ? '<div class="answer-actions"><p class="helper">Верность ответов не показывается до сдачи.</p><button id="open-submit" class="button button-primary" type="button">Перейти к сдаче</button></div>' : ''}`;
  }
  function reflectionMarkup(readonly) {
    return `<section class="result-section" aria-labelledby="reflection-title"><h2 id="reflection-title">Итог для преподавателя</h2><p>Одним-двумя предложениями: почему в кэше нельзя проверять цену условием <code>if price</code>? Этот ответ не входит в автоматический балл.</p><label class="field-label" for="reflection">Ваше объяснение</label><textarea id="reflection" maxlength="4000" ${readonly ? 'readonly' : ''} placeholder="Напишите своими словами…">${esc(state.reflection)}</textarea>${readonly ? '<p class="helper">Сохранённый ответ показан без автоматической оценки.</p>' : ''}</section>`;
  }
  function resultsMarkup() {
    const score = TASKS.filter(correct).length;
    return `<header class="case-header"><span class="case-tag">ИТОГИ</span><h2>Работа сдана</h2><p>Ниже — балл, ваши выбранные ответы и объяснения. Кейсы остаются доступными для чтения.</p></header><div class="result-summary"><div><p class="score">${score} / ${TASKS.length}</p><p class="score-label">автоматически оценённых действий</p></div><p class="helper">Свободное объяснение сохранено отдельно и не влияет на балл.</p></div><section class="result-section" aria-labelledby="review-title"><h2 id="review-title">Разбор</h2>${TASKS.map((task, index) => `<article class="result-item"><h3>${index + 1}. ${esc(task.title)}</h3><p class="${correct(task) ? 'result-ok' : 'result-check'}">${correct(task) ? 'Верно' : 'Стоит повторить'}</p><p class="student-answer">Ваш ответ: ${esc(answerText(task))}</p><p>${esc(task.explain)}</p></article>`).join('')}</section>${reflectionMarkup(true)}<div class="result-actions"><button id="export-report" class="button button-secondary" type="button">Экспортировать текстовый отчёт</button><button id="retry-button" class="button button-primary" type="button">Новая попытка</button></div>`;
  }

  function renderNav() {
    const nav = $('case-nav');
    const sections = CASES.map(caseItem => {
      const filled = caseComplete(caseItem);
      const current = state.view === caseItem.id;
      return `<button type="button" data-view="${caseItem.id}" aria-current="${current ? 'true' : 'false'}"><span class="nav-number">${caseItem.number}</span><span>${esc(caseItem.title)}</span><span class="nav-state">${filled}/3</span></button>`;
    });
    if (state.submitted) sections.push(`<button type="button" data-view="results" aria-current="${state.view === 'results' ? 'true' : 'false'}"><span class="nav-number">Σ</span><span>Итоги</span></button>`);
    nav.innerHTML = sections.join('');
  }
  function renderProgress() {
    const count = TASKS.filter(complete).length;
    $('progress-text').textContent = `${count} из ${TASKS.length} действий`;
    $('progress-bar').style.width = `${count / TASKS.length * 100}%`;
  }
  function render() {
    $('intro').hidden = true;
    $('app').hidden = false;
    if (state.submitted && state.view !== 'results' && !CASES.some(caseItem => caseItem.id === state.view)) state.view = 'results';
    renderNav();
    renderProgress();
    updateStorageStatus();
    const current = CASES.find(caseItem => caseItem.id === state.view);
    $('case-view').innerHTML = state.view === 'results' ? resultsMarkup() : caseMarkup(current || CASES[0], state.submitted);
  }
  function openSection(id) {
    state.view = id;
    save();
    render();
    document.querySelector('.main-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function missingItems() {
    const items = TASKS.filter(task => !complete(task)).map(task => `${task.caseTitle}: ${task.title}`);
    if (!state.reflection.trim()) items.push('Кэш цен: итоговое объяснение для преподавателя');
    return items;
  }
  function showSubmitDialog() {
    const missing = missingItems();
    $('missing-summary').textContent = missing.length ? `Не заполнено: ${missing.length}. Можно вернуться к любому из этих мест или сдать неполную работу.` : 'Все 12 действий и итоговое объяснение заполнены. После подтверждения ответы станут доступными только для чтения.';
    $('missing-list').innerHTML = missing.map(item => `<li>${esc(item)}</li>`).join('');
    $('submit-dialog').showModal();
  }
  function exportReport() {
    const score = TASKS.filter(correct).length;
    const lines = [
      'Практикум ОП.04: хеш-структуры', `Баллы: ${score} из ${TASKS.length}`, '',
      ...TASKS.flatMap((task, index) => [`${index + 1}. ${task.caseTitle} — ${task.title}`, `Ответ: ${answerText(task)}`, `Разбор: ${task.explain}`, '']),
      'Итоговое объяснение студента:', state.reflection || 'Нет ответа'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'op04-hesh-praktikum-report.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  $('start-button').addEventListener('click', () => { state.started = true; save(); render(); });
  $('case-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    openSection(button.dataset.view);
  });
  $('case-view').addEventListener('change', event => {
    const input = event.target;
    if (input.dataset.choice) state.answers[input.dataset.choice] = input.value;
    if (input.dataset.multi) {
      const values = state.answers[input.dataset.multi];
      state.answers[input.dataset.multi] = input.checked ? [...values, input.value] : values.filter(value => value !== input.value);
    }
    save();
    renderProgress();
    renderNav();
  });
  $('case-view').addEventListener('input', event => {
    if (event.target.id === 'reflection') { state.reflection = event.target.value.slice(0, 4000); save(); }
  });
  $('case-view').addEventListener('click', event => {
    const add = event.target.closest('[data-order-add]');
    const remove = event.target.closest('[data-order-remove]');
    if (add || remove) {
      const [taskId, key] = (add || remove).dataset[add ? 'orderAdd' : 'orderRemove'].split(':');
      const values = state.answers[taskId];
      state.answers[taskId] = add ? [...values, key] : values.filter(value => value !== key);
      save(); render();
      return;
    }
    if (event.target.closest('#open-submit')) showSubmitDialog();
    if (event.target.closest('#export-report')) exportReport();
    if (event.target.closest('#retry-button')) $('retry-dialog').showModal();
  });
  $('submit-dialog').addEventListener('close', () => {
    if ($('submit-dialog').returnValue === 'confirm') {
      state.submitted = true;
      state.view = 'results';
      save();
      render();
    }
  });
  $('retry-dialog').addEventListener('close', () => {
    if ($('retry-dialog').returnValue === 'confirm') {
      state = emptyState();
      state.started = true;
      save();
      render();
    }
  });

  if (state.started || state.submitted) render();
})();
