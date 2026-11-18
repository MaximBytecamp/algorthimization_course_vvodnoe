(function () {
  'use strict';

  var presets = [42, 17, 1042, 25, 9];
  var paymentEvents = [
    { id: 'pay-410', client: 'c-07' },
    { id: 'pay-411', client: 'c-07' },
    { id: 'pay-410', client: 'c-07' },
    { id: 'pay-412', client: 'c-31', sum: 0 },
    { id: 'pay-411', client: 'c-07' }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function rememberFocus(container) {
    var active = document.activeElement;
    if (!container.contains(active)) return function () {};
    var attributes = ['data-action', 'data-role', 'data-preset', 'data-sku', 'value'];
    var selector = active.id ? '#' + CSS.escape(active.id) : active.tagName.toLowerCase();
    if (!active.id) attributes.forEach(function (attr) {
      if (active.hasAttribute(attr)) selector += '[' + attr + '="' + CSS.escape(active.getAttribute(attr)) + '"]';
    });
    return function () {
      var target = container.querySelector(selector);
      if (!target && active.dataset.action === 'foundation-add') target = container.querySelector('[data-action="foundation-step"]');
      if (!target && active.dataset.action === 'foundation-step') target = container.querySelector('[data-action="foundation-add"]');
      if (target) target.focus({ preventScroll: true });
    };
  }

  function live(message) {
    return '<p class="hash-lab__live" aria-live="polite" aria-atomic="true">' + escapeHtml(message) + '</p>';
  }

  function button(action, text, extra) {
    return '<button type="button" class="hash-lab__button ' + (extra || '') + '" data-action="' + action + '">' + text + '</button>';
  }

  function renderFoundation(container, state) {
    var restoreFocus = rememberFocus(container);
    var cells = state.cells.map(function (value, index) {
      var cls = 'hash-lab__cell';
      if (state.pending && state.pending.index === index) cls += ' is-current';
      if (state.checked.indexOf(index) !== -1) cls += ' is-checked';
      return '<li class="' + cls + '"><span>' + index + '</span><b>' + (value === null ? '—' : value) + '</b></li>';
    }).join('');
    var quick = presets.map(function (value) {
      return '<button type="button" class="hash-lab__chip" data-preset="' + value + '">' + value + '</button>';
    }).join('');
    var step = state.pending ? button('foundation-step', 'Проверить ячейку ' + state.pending.index, 'hash-lab__button--primary') : '';
    container.innerHTML = '<section class="hash-lab" aria-labelledby="hash-foundation-title">' +
      '<header><p class="hash-lab__eyebrow">Лаборатория · без оценки</p><h3 id="hash-foundation-title">Хэш-таблица: поиск места</h3><p>В этой модели начальная ячейка вычисляется как <code>k % 8</code>. Допускаются неотрицательные целые числа. В Python <code>dict</code> используются другая хеш-функция и другой порядок пробирования.</p></header>' +
      '<div class="hash-lab__controls"><label>Число <input inputmode="numeric" pattern="[0-9]*" data-role="foundation-input" value="' + escapeHtml(state.input) + '" aria-describedby="foundation-help"></label>' + button('foundation-add', 'Добавить число', 'hash-lab__button--primary') + button('foundation-reset', 'Сбросить') + '</div>' +
      '<p id="foundation-help" class="hash-lab__hint">Быстрые числа: ' + quick + '</p>' +
      '<p class="hash-lab__formula">Начальная ячейка: <strong>' + (state.pending ? state.pending.start : '—') + '</strong> · линейное пробирование по кругу</p>' +
      '<ol class="hash-lab__cells" aria-label="Ячейки таблицы">' + cells + '</ol>' +
      '<div class="hash-lab__actions">' + step + '</div>' + live(state.message) +
      '</section>';
    restoreFocus();
  }

  function foundation(container) {
    var state = { cells: Array(8).fill(null), input: '', pending: null, checked: [], message: 'Введите число или выберите быстрое число.' };
    function begin(raw) {
      var value = Number(raw);
      if (!/^(0|[1-9]\d*)$/.test(String(raw).trim()) || !Number.isSafeInteger(value)) {
        state.message = 'Нужно неотрицательное целое число.';
        renderFoundation(container, state);
        return;
      }
      if (state.pending) {
        state.message = 'Сначала завершите проверку текущего числа.';
        renderFoundation(container, state);
        return;
      }
      state.input = String(value);
      state.pending = { value: value, start: value % 8, index: value % 8, attempts: 0 };
      state.checked = [];
      state.message = 'Для ' + value + ' начинаем с ячейки ' + state.pending.index + '.';
      renderFoundation(container, state);
    }
    container.onclick = function (event) {
      var target = event.target.closest('button');
      if (!target || !container.contains(target)) return;
      var action = target.dataset.action;
      if (target.dataset.preset) return begin(target.dataset.preset);
      if (action === 'foundation-add') return begin(container.querySelector('[data-role="foundation-input"]').value);
      if (action === 'foundation-reset') {
        state = { cells: Array(8).fill(null), input: '', pending: null, checked: [], message: 'Таблица очищена.' };
        return renderFoundation(container, state);
      }
      if (action !== 'foundation-step' || !state.pending) return;
      var pending = state.pending;
      var slot = state.cells[pending.index];
      state.checked.push(pending.index);
      if (slot === pending.value) {
        state.message = 'Дубликат: ' + pending.value + ' уже находится в ячейке ' + pending.index + '.';
        state.pending = null;
      } else if (slot === null) {
        state.cells[pending.index] = pending.value;
        state.message = 'Свободно: ' + pending.value + ' записано в ячейку ' + pending.index + '.';
        state.pending = null;
      } else if (pending.attempts === 7) {
        state.message = 'Таблица заполнена: свободной ячейки нет.';
        state.pending = null;
      } else {
        var previous = pending.index;
        pending.index = (pending.index + 1) % 8;
        pending.attempts += 1;
        state.message = 'Коллизия в ячейке ' + previous + ': там ' + slot + '. Идём к ' + pending.index + '.';
      }
      renderFoundation(container, state);
    };
    container.onkeydown = function (event) {
      if (event.key === 'Enter' && event.target.matches('[data-role="foundation-input"]')) {
        event.preventDefault();
        begin(event.target.value);
      }
    };
    renderFoundation(container, state);
  }

  function renderPayments(container, state) {
    var restoreFocus = rememberFocus(container);
    var rows = paymentEvents.map(function (item, index) {
      var result = state.results[index];
      var details = item.id + ' · ' + item.client + (item.sum === 0 ? ' · sum=0' : '');
      return '<li class="hash-lab__event ' + (result ? (result.accepted ? 'is-accepted' : 'is-skipped') : '') + '"><code>' + details + '</code><span>' + (result ? escapeHtml(result.text) : index === state.position ? 'следующее' : 'ожидает') + '</span></li>';
    }).join('');
    var seen = Array.from(state.seen).map(escapeHtml).join(', ') || '—';
    container.innerHTML = '<section class="hash-lab" aria-labelledby="hash-payments-title">' +
      '<header><p class="hash-lab__eyebrow">Лаборатория · без оценки</p><h3 id="hash-payments-title">Повторы событий оплаты</h3><p>Каждое событие можно принять один раз. Проверьте, какой ключ хранит множество <code>seen</code>.</p></header>' +
      '<fieldset class="hash-lab__choice"><legend>Ключ дедупликации</legend><label><input type="radio" name="hash-payment-key" value="client" ' + (state.key === 'client' ? 'checked' : '') + '> <code>client_id</code> — неверно</label><label><input type="radio" name="hash-payment-key" value="event" ' + (state.key === 'event' ? 'checked' : '') + '> <code>event_id</code> — верно</label></fieldset>' +
      '<div class="hash-lab__controls">' + button('payment-step', 'Обработать следующее событие', 'hash-lab__button--primary') + button('payment-reset', 'Сбросить поток') + '</div>' +
      '<p class="hash-lab__formula"><code>seen = {' + seen + '}</code></p><ol class="hash-lab__events">' + rows + '</ol>' + live(state.message) +
      '</section>';
    restoreFocus();
  }

  function payments(container) {
    var state = { key: 'client', position: 0, seen: new Set(), results: [], message: 'Выбран неверный ключ: попробуйте обработать поток.' };
    function reset(key) {
      state = { key: key || state.key, position: 0, seen: new Set(), results: [], message: 'Поток сброшен. Начните с первого события.' };
    }
    container.onclick = function (event) {
      var target = event.target.closest('button');
      if (!target || !container.contains(target)) return;
      if (target.dataset.action === 'payment-reset') {
        reset();
      } else if (target.dataset.action === 'payment-step') {
        if (state.position >= paymentEvents.length) state.message = 'Все пять событий уже обработаны.';
        else {
          var item = paymentEvents[state.position];
          var key = state.key === 'client' ? item.client : item.id;
          var duplicate = state.seen.has(key);
          state.results[state.position] = {
            accepted: !duplicate,
            text: duplicate ? 'пропущено: ключ уже был в seen' : 'принято: ключ добавлен в seen'
          };
          if (!duplicate) state.seen.add(key);
          state.position += 1;
          if (duplicate && state.key === 'client' && state.position === 2) state.message = 'Ошибка ключа: это другое событие того же клиента, его нельзя было пропускать.';
          else if (!duplicate && item.sum === 0) state.message = 'Сумма 0 не делает событие повтором: у него новый event_id.';
          else state.message = duplicate ? 'Повтор по выбранному ключу пропущен.' : 'Событие принято.';
        }
      } else return;
      renderPayments(container, state);
    };
    container.onchange = function (event) {
      if (!event.target.matches('input[name="hash-payment-key"]')) return;
      reset(event.target.value);
      state.message = 'Ключ изменён. Обработайте события заново и сравните результаты.';
      renderPayments(container, state);
    };
    renderPayments(container, state);
  }

  function renderDelivery(container, state) {
    var restoreFocus = rememberFocus(container);
    var expected = { MUG: 4, PEN: 3, NOTE: 1 };
    var rows = Object.keys(expected).map(function (sku) {
      var taken = state.taken[sku];
      var delta = taken - expected[sku];
      var result = delta === 0 ? 'без расхождения' : delta < 0 ? 'недостача ' + Math.abs(delta) : 'излишек ' + delta;
      return '<tr><th scope="row"><code>' + sku + '</code></th><td>' + expected[sku] + '</td><td><label class="hash-lab__sr-only" for="delivery-' + sku + '">Принято ' + sku + '</label><input id="delivery-' + sku + '" data-sku="' + sku + '" type="number" min="0" max="99" inputmode="numeric" value="' + taken + '"></td><td class="' + (delta === 0 ? 'is-neutral' : delta < 0 ? 'is-short' : 'is-extra') + '">' + result + '</td></tr>';
    }).join('');
    container.innerHTML = '<section class="hash-lab" aria-labelledby="hash-delivery-title">' +
      '<header><p class="hash-lab__eyebrow">Лаборатория · без оценки</p><h3 id="hash-delivery-title">Сверка поставки: счётчики</h3><p>Счётчик хранит количество каждого SKU. В Python такую структуру предоставляет <code>Counter</code> из <code>collections</code>.</p></header>' +
      '<div class="hash-lab__controls">' + button('delivery-source', 'Исходные значения: MUG 2, PEN 5, NOTE 1') + '</div>' +
      '<div class="hash-lab__table-wrap"><table><caption>Ожидаемое и принятое количество</caption><thead><tr><th>SKU</th><th>Ожидается</th><th>Принято</th><th>Отчёт</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + live(state.message) +
      '</section>';
    restoreFocus();
  }

  function delivery(container) {
    var state = { taken: { MUG: 2, PEN: 5, NOTE: 1 }, message: 'Изменяйте принятые количества от 0 до 99.' };
    container.onclick = function (event) {
      var target = event.target.closest('button');
      if (target && target.dataset.action === 'delivery-source') {
        state.taken = { MUG: 2, PEN: 5, NOTE: 1 };
        state.message = 'Восстановлены исходные принятые количества.';
        renderDelivery(container, state);
      }
    };
    container.oninput = function (event) {
      if (!event.target.matches('[data-sku]')) return;
      var input = event.target;
      var value = Math.max(0, Math.min(99, Math.trunc(Number(input.value)) || 0));
      state.taken[input.dataset.sku] = value;
      state.message = 'Отчёт обновлён: кратность сохранена для каждой позиции.';
      renderDelivery(container, state);
    };
    renderDelivery(container, state);
  }

  function signature(label) {
    var letters = (label.toLowerCase().match(/[a-z]/g) || []).sort();
    return letters.join('');
  }

  function renderCatalog(container, state) {
    var restoreFocus = rememberFocus(container);
    var groups = Object.create(null);
    state.labels.forEach(function (label) {
      var key = signature(label);
      (groups[key] || (groups[key] = [])).push(label);
    });
    var groupList = Object.keys(groups).sort().map(function (key) {
      return '<li><code>' + escapeHtml(key) + '</code><span>' + groups[key].map(function (label) { return '<code>' + escapeHtml(label) + '</code>'; }).join(' ') + '</span></li>';
    }).join('');
    var labelRows = state.labels.map(function (label) {
      return '<li><code>' + escapeHtml(label) + '</code><span>→ <code>' + escapeHtml(signature(label)) + '</code></span></li>';
    }).join('');
    container.innerHTML = '<section class="hash-lab" aria-labelledby="hash-catalog-title">' +
      '<header><p class="hash-lab__eyebrow">Лаборатория · без оценки</p><h3 id="hash-catalog-title">Каталог: ключи группировки</h3><p>Сигнатура — строковый ключ группы. Для него нужны нижний регистр и только латинские буквы <code>/[a-z]/</code>; сортировка сохраняет повторы.</p></header>' +
      '<div class="hash-lab__controls"><label>Метка <input maxlength="80" data-role="catalog-input" value="' + escapeHtml(state.input) + '" autocomplete="off" placeholder="например, Tea-22"></label>' + button('catalog-add', 'Добавить метку', 'hash-lab__button--primary') + button('catalog-reset', 'Сбросить') + '</div>' +
      '<div class="hash-lab__split"><div><h4>Метки и сигнатуры</h4><ul class="hash-lab__data-list">' + labelRows + '</ul></div><div><h4>Группы по сигнатуре</h4><ul class="hash-lab__group-list">' + groupList + '</ul></div></div>' + live(state.message) +
      '</section>';
    restoreFocus();
  }

  function catalog(container) {
    var state = { labels: ['ABBA-12', 'BAAB-77', 'AB-12'], input: '', message: 'Две первые метки попали в одну группу: повторы букв важны.' };
    function add(raw) {
      var value = String(raw).trim().slice(0, 80);
      if (!signature(value)) state.message = 'Нужна хотя бы одна латинская буква A–Z.';
      else {
        state.labels.push(value);
        state.input = '';
        state.message = 'Метка добавлена; её сигнатура рассчитана ниже.';
      }
      renderCatalog(container, state);
    }
    container.onclick = function (event) {
      var target = event.target.closest('button');
      if (!target || !container.contains(target)) return;
      if (target.dataset.action === 'catalog-add') add(container.querySelector('[data-role="catalog-input"]').value);
      if (target.dataset.action === 'catalog-reset') {
        state = { labels: ['ABBA-12', 'BAAB-77', 'AB-12'], input: '', message: 'Вернулись исходные метки.' };
        renderCatalog(container, state);
      }
    };
    container.onkeydown = function (event) {
      if (event.key === 'Enter' && event.target.matches('[data-role="catalog-input"]')) {
        event.preventDefault();
        add(event.target.value);
      }
    };
    renderCatalog(container, state);
  }

  function renderCache(container, state) {
    var restoreFocus = rememberFocus(container);
    var rows = state.items.map(function (item, index) {
      return '<li' + (index === 0 ? ' class="is-oldest"' : index === state.items.length - 1 ? ' class="is-freshest"' : '') + '><code>' + escapeHtml(item.key) + '</code><span>' + item.value + '</span></li>';
    }).join('');
    var log = state.log.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
    container.innerHTML = '<section class="hash-lab" aria-labelledby="hash-cache-title">' +
      '<header><p class="hash-lab__eyebrow">Лаборатория · без оценки</p><h3 id="hash-cache-title">LRU-кэш на 3 записи</h3><p><code>get</code> делает найденную запись свежей. При <code>put</code> четвёртой записи самая старая вытесняется.</p></header>' +
      '<div class="hash-lab__controls hash-lab__controls--wrap">' + button('cache-get-lime', 'get LIME') + button('cache-get-miss', 'get NOTE') + button('cache-put-book', 'put BOOK 340', 'hash-lab__button--primary') + button('cache-put-lime', 'put LIME 0') + button('cache-reset', 'Сбросить') + '</div>' +
      '<p class="hash-lab__formula">Порядок: <strong>старый → свежий</strong></p><ol class="hash-lab__cache" aria-label="Порядок в LRU-кэше">' + rows + '</ol>' +
      '<div class="hash-lab__split"><div><h4>Последняя операция</h4>' + live(state.message) + '</div><div><h4>Журнал</h4><ol class="hash-lab__log">' + (log || '<li>Пока пусто.</li>') + '</ol></div></div>' +
      '</section>';
    restoreFocus();
  }

  function cache(container) {
    var state = { items: [{ key: 'LIME', value: 0 }, { key: 'BAG', value: 890 }, { key: 'CUP', value: 240 }], log: [], message: 'Кэш готов: значение LIME равно 0 и это существующая запись.' };
    function record(message) {
      state.log.unshift(message);
      state.log = state.log.slice(0, 5);
      state.message = message;
    }
    function get(key) {
      var index = state.items.findIndex(function (item) { return item.key === key; });
      if (index === -1) record('miss: ' + key + ' нет в кэше.');
      else {
        var item = state.items.splice(index, 1)[0];
        state.items.push(item);
        record('hit: ' + key + ' = ' + item.value + '. Чтение обновило порядок.');
      }
    }
    function put(key, value) {
      var index = state.items.findIndex(function (item) { return item.key === key; });
      if (index !== -1) {
        state.items.splice(index, 1);
        state.items.push({ key: key, value: value });
        record('put: ' + key + ' обновлён до ' + value + ' и стал свежим.');
      } else {
        var evicted = state.items.length === 3 ? state.items.shift() : null;
        state.items.push({ key: key, value: value });
        record('put: ' + key + ' = ' + value + (evicted ? '; вытеснен ' + evicted.key + '.' : '.'));
      }
    }
    container.onclick = function (event) {
      var target = event.target.closest('button');
      if (!target || !container.contains(target)) return;
      var action = target.dataset.action;
      if (action === 'cache-get-lime') get('LIME');
      else if (action === 'cache-get-miss') get('NOTE');
      else if (action === 'cache-put-book') put('BOOK', 340);
      else if (action === 'cache-put-lime') put('LIME', 0);
      else if (action === 'cache-reset') state = { items: [{ key: 'LIME', value: 0 }, { key: 'BAG', value: 890 }, { key: 'CUP', value: 240 }], log: [], message: 'Кэш возвращён к исходному порядку.' };
      else return;
      renderCache(container, state);
    };
    renderCache(container, state);
  }

  var labs = { foundation: foundation, payments: payments, delivery: delivery, catalog: catalog, cache: cache };
  window.HashLabs = window.HashLabs || {};
  window.HashLabs.mount = function (container, kind) {
    if (!container || typeof container.innerHTML === 'undefined') throw new TypeError('HashLabs.mount: нужен DOM-контейнер.');
    if (!labs[kind]) throw new Error('HashLabs.mount: неизвестная лаборатория "' + kind + '".');
    container.innerHTML = '';
    labs[kind](container);
  };
}());
