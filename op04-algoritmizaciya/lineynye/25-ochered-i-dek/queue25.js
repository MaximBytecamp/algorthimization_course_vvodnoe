(() => {
  'use strict';

  const MODES = {
    tasks: {
      title: 'Очередь задач',
      legend: 'Ожидающие задачи: начало слева, новые задачи справа. Выполненные записываются в порядке выполнения. При переносе строки чтение продолжается ниже.',
      cases: [
        ['A, B → выполнить → C → закрыть', [['add', 'A'], ['add', 'B'], ['run'], ['add', 'C'], ['close']]],
        ['Пустой список команд', []],
        ['Выполнить при пустой очереди', [['run']]],
        ['Команда после закрытия', [['close'], ['add', 'A']]],
        ['Неизвестная команда', [['add', 'A'], ['skip']]],
        ['Повторяющиеся и пустая строка', [['add', 'A'], ['add', 'A'], ['add', ''], ['close']]],
        ['Неверный аргумент add', [['add', 42]]]
      ],
      trace: traceTasks,
      render: renderTasks
    },
    ring: {
      title: 'Кольцевой буфер',
      legend: 'Физические ячейки всегда идут по индексам. Метка head указывает начало, даже когда буфер пуст. Логическая очередь читается слева направо; отказ не меняет буфер, следующие операции продолжаются.',
      cases: [
        ['Ёмкость 3: перенос через край', {capacity: 3, commands: [['push', 'A'], ['push', 'B'], ['push', 'C'], ['pop'], ['push', 'D'], ['pop'], ['pop'], ['pop']]}],
        ['Переполнение без изменения', {capacity: 2, commands: [['push', 'A'], ['push', 'B'], ['push', 'C'], ['pop']]}],
        ['Извлечение из пустого буфера', {capacity: 3, commands: [['pop'], ['push', 'A'], ['pop'], ['pop']]}],
        ['Ёмкость 1: заполнение и отказы', {capacity: 1, commands: [['push', 'A'], ['push', 'B'], ['pop'], ['pop'], ['push', 'C']]}],
        ['Равные значения', {capacity: 3, commands: [['push', 'A'], ['push', 'A'], ['pop'], ['push', 'A']]}],
        ['Пустой список операций', {capacity: 3, commands: []}]
      ],
      trace: traceRing,
      render: renderRing
    },
    window: {
      title: 'Максимум в скользящем окне',
      legend: 'Кандидаты хранят индексы, не значения. Начало дека слева. Сначала удаляем устаревшие индексы, затем слабые значения с конца (включая равные). Каждое удаление и добавление — отдельный шаг.',
      cases: [
        ['[4, 1, 3, 5, 2, 5], k = 3', {nums: [4, 1, 3, 5, 2, 5], k: 3}],
        ['Равные: [5, 5, 5, 5], k = 2', {nums: [5, 5, 5, 5], k: 2}],
        ['Убывающие: [9, 7, 5, 3, 1], k = 3', {nums: [9, 7, 5, 3, 1], k: 3}],
        ['Окно 1: [4, 1, 4], k = 1', {nums: [4, 1, 4], k: 1}],
        ['Пустой вход: ValueError', {nums: [], k: 1}],
        ['Нулевая ширина: ValueError', {nums: [2, 1], k: 0}],
        ['Окно больше входа: ValueError', {nums: [2, 1], k: 3}],
        ['Весь массив: [-3, -1, -2], k = 3', {nums: [-3, -1, -2], k: 3}]
      ],
      trace: traceWindow,
      render: renderWindow
    }
  };

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const repr = value => typeof value === 'string' ? JSON.stringify(value) : String(value);
  const commandText = command => `${command[0]}(${command.slice(1).map(repr).join(', ')})`;

  function traceTasks(commands) {
    const states = [], pending = [], completed = [];
    let closed = false;
    function save(commandIndex, event, code, error = false) {
      states.push({commandIndex, event, code, error, pending: pending.slice(), completed: completed.slice(), closed});
    }
    save(-1, 'Начало: задач нет, очередь открыта.', 'pending = deque(); completed = []; closed = False');
    for (let i = 0; i < commands.length; i++) {
      const [name, value] = commands[i];
      if (closed) {
        save(i, 'ValueError: после close запрещена любая команда. Обработка остановлена.', 'if closed: raise ValueError("closed")', true);
        return states;
      }
      if (name === 'add' && commands[i].length === 2 && typeof value === 'string') {
        pending.push(value);
        save(i, `Добавлена задача ${repr(value)}.`, 'pending.append(task)');
      } else if (name === 'run' && commands[i].length === 1) {
        if (pending.length) {
          const task = pending.shift();
          completed.push(task);
          save(i, `Выполнена первая задача ${repr(task)}.`, 'completed.append(pending.popleft())');
        } else {
          save(i, 'Команда run: ожидающих задач нет, состояние не изменилось.', 'if pending: completed.append(pending.popleft())');
        }
      } else if (name === 'close' && commands[i].length === 1) {
        closed = true;
        save(i, 'Команда close: приём закрыт, выполняем оставшиеся задачи по одной.', 'closed = True\nwhile pending:');
        while (pending.length) {
          const task = pending.shift();
          completed.push(task);
          save(i, `Закрытие: выполнена задача ${repr(task)}.`, 'completed.append(pending.popleft())');
        }
        save(i, 'Все оставшиеся задачи выполнены. Очередь закрыта.', 'return completed, list(pending)');
      } else {
        save(i, 'ValueError: неправильная команда или аргумент. Обработка остановлена.', 'raise ValueError("invalid command")', true);
        return states;
      }
    }
    save(commands.length, 'Все входные команды обработаны.', 'return completed, list(pending)');
    return states;
  }

  function traceRing({capacity, commands}) {
    const states = [], cells = Array(capacity).fill(null);
    let head = 0, size = 0;
    function save(commandIndex, event, code, changed = -1, error = false) {
      const logical = Array.from({length: size}, (_, j) => cells[(head + j) % capacity]);
      states.push({commandIndex, event, code, changed, error, cells: cells.slice(), head, size, logical});
    }
    save(-1, 'Начало: все физические ячейки свободны.', 'head = 0; size = 0; buffer = [None] * capacity');
    commands.forEach(([name, value], i) => {
      if (name === 'push') {
        if (size === capacity) {
          save(i, 'OverflowError: буфер заполнен. Добавление отклонено, состояние не изменилось.', 'if size == capacity: raise OverflowError', -1, true);
          return;
        }
        const tail = (head + size) % capacity;
        const oldSize = size;
        cells[tail] = value;
        size++;
        save(i, `Добавлено ${repr(value)} в ячейку (${head} + ${oldSize}) % ${capacity} = ${tail}.`, 'tail = (head + size) % capacity\nbuffer[tail] = value\nsize += 1', tail);
      } else if (name === 'pop') {
        if (!size) {
          save(i, 'IndexError: буфер пуст. Извлечение отклонено, состояние не изменилось.', 'if size == 0: raise IndexError', -1, true);
          return;
        }
        const previousHead = head, value = cells[head];
        cells[head] = null;
        head = (head + 1) % capacity;
        size--;
        save(i, `Извлечено ${repr(value)} из ячейки ${previousHead}; ссылка очищена, head = ${head}.`, 'value = buffer[head]\nbuffer[head] = None\nhead = (head + 1) % capacity\nsize -= 1', previousHead);
      }
    });
    save(commands.length, 'Все операции просмотрены.', 'логическая очередь: buffer[(head + j) % capacity], 0 <= j < size');
    return states;
  }

  function traceWindow({nums, k}) {
    const states = [], candidates = [], answer = [];
    function save(i, event, code, error = false) {
      states.push({i, event, code, error, candidates: candidates.slice(), answer: answer.slice()});
    }
    save(-1, 'Начало: дек индексов и ответ пусты.', 'candidates = deque(); answer = []');
    if (!nums.length || !Number.isInteger(k) || k < 1 || k > nums.length) {
      save(-1, 'ValueError: нужен непустой вход и целое k от 1 до длины входа.', 'if not nums or not 1 <= k <= len(nums): raise ValueError', true);
      return states;
    }
    for (let i = 0; i < nums.length; i++) {
      save(i, `Читаем nums[${i}] = ${nums[i]}. Граница устаревания: индекс <= ${i - k}.`, 'current = nums[i]');
      while (candidates.length && candidates[0] <= i - k) {
        const removed = candidates.shift();
        save(i, `Удалён устаревший индекс ${removed} из начала: ${removed} <= ${i - k}.`, 'while candidates and candidates[0] <= i - k:\n    candidates.popleft()');
      }
      while (candidates.length && nums[candidates[candidates.length - 1]] <= nums[i]) {
        const removed = candidates.pop();
        save(i, `Удалён слабый индекс ${removed} с конца: ${nums[removed]} <= ${nums[i]}.`, 'while candidates and nums[candidates[-1]] <= current:\n    candidates.pop()');
      }
      candidates.push(i);
      save(i, `Индекс ${i} добавлен в конец дека.`, 'candidates.append(i)');
      if (i >= k - 1) {
        const maximum = nums[candidates[0]];
        answer.push(maximum);
        save(i, `Окно [${i - k + 1}, ${i}]: максимум ${maximum} добавлен в ответ.`, 'answer.append(nums[candidates[0]])');
      }
    }
    save(nums.length - 1, 'Все полные окна обработаны.', 'return answer');
    return states;
  }

  function section(view, title, items, {boxed = true, empty = 'пусто'} = {}) {
    const panel = el('section', 'queue25__section');
    panel.append(el('h4', 'queue25__heading', title));
    const row = el('div', boxed ? 'queue25__row queue25__row--boxed' : 'queue25__row');
    if (!items.length) row.append(el('span', 'queue25__empty', empty));
    items.forEach(item => {
      const cell = el('span', `queue25__cell${item.current ? ' is-current' : ''}${item.changed ? ' is-changed' : ''}${item.muted ? ' is-muted' : ''}`);
      if (item.label !== undefined) cell.append(el('span', 'queue25__index', item.label));
      cell.append(el('span', 'queue25__value', item.value));
      if (item.marker) cell.append(el('span', 'queue25__marker', item.marker));
      if (item.current) cell.setAttribute('aria-current', 'step');
      row.append(cell);
    });
    panel.append(row);
    view.append(panel);
  }
  function commandSection(view, commands, commandIndex) {
    section(view, 'Входные команды', commands.map((command, i) => ({
      label: `команда ${i + 1}`, value: commandText(command), current: i === commandIndex,
      marker: i === commandIndex ? 'текущая' : '', muted: i < commandIndex
    })), {boxed: false, empty: 'команд нет'});
  }
  function values(items) { return items.map(value => ({value: repr(value)})); }
  function renderTasks(view, state, commands) {
    commandSection(view, commands, state.commandIndex);
    section(view, 'Ожидающие (pending): начало → конец', values(state.pending));
    section(view, 'Выполненные (completed)', values(state.completed));
    view.append(el('p', 'queue25__meta', `Закрыта (closed): ${state.closed ? 'True — да' : 'False — нет'}`));
  }
  function renderRing(view, state, input) {
    commandSection(view, input.commands, state.commandIndex);
    view.append(el('p', 'queue25__meta', `Ёмкость (capacity) = ${input.capacity}; начало (head) = ${state.head}; размер (size) = ${state.size}`));
    section(view, 'Физические ячейки буфера', state.cells.map((value, i) => ({
      label: `индекс ${i}`, value: value === null ? 'None — свободна' : repr(value),
      changed: i === state.changed, marker: i === state.head ? 'head — начало' : ''
    })));
    section(view, 'Логическая очередь: начало → конец', values(state.logical));
  }
  function renderWindow(view, state, {nums, k}) {
    const left = Math.max(0, state.i - k + 1);
    const bounds = state.i < 0 ? 'окно ещё не начато'
      : `границы [${left}, ${state.i}], ${state.i >= k - 1 ? 'полное окно' : 'окно пока неполное'}; устаревшие <= ${state.i - k}`;
    view.append(el('p', 'queue25__meta', `Текущий индекс i = ${state.i < 0 ? '—' : state.i}; ширина k = ${k}; ${bounds}`));
    section(view, 'Вход: индексы и значения', nums.map((value, i) => ({
      label: `индекс ${i}`, value: String(value), current: i === state.i,
      muted: state.i >= 0 && (i < left || i > state.i), marker: i === state.i ? 'текущий i' : ''
    })), {boxed: false, empty: 'пустой вход'});
    section(view, 'Кандидаты: индексы и значения (начало → конец)', state.candidates.map((i, position) => ({
      label: `индекс ${i}`, value: `nums[${i}] = ${nums[i]}`, marker: position === 0 ? 'начало дека' : ''
    })));
    section(view, 'Ответ: максимумы полных окон', state.answer.map((value, i) => ({label: `окно [${i}, ${i + k - 1}]`, value: String(value)})));
  }

  function init(host) {
    const mode = MODES[host.dataset.queue25];
    if (!mode || host.dataset.queue25Ready) return;
    host.dataset.queue25Ready = 'true';
    const head = el('div', 'widget__head');
    head.append(el('b', '', mode.title), el('span', '', 'Пошаговая трасса'));
    const label = el('label', 'queue25__select-label', 'Пример');
    const select = el('select', 'queue25__case');
    mode.cases.forEach(([title], i) => {
      const option = el('option', '', title);
      option.value = String(i);
      select.append(option);
    });
    label.append(select);
    const step = el('p', 'queue25__step');
    const view = el('div', 'queue25__view');
    const note = el('p', 'queue25__note');
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    note.setAttribute('aria-atomic', 'true');
    const controls = el('div', 'queue25__controls');
    const buttons = {};
    [['prev', 'Назад'], ['next', 'Дальше'], ['reset', 'Сначала']].forEach(([action, title]) => {
      const button = el('button', 'btn', title);
      button.type = 'button';
      button.dataset[action] = '';
      buttons[action] = button;
      controls.append(button);
    });
    const body = el('div', 'widget__body');
    body.append(label, step, view, note, el('p', 'queue25__legend', mode.legend), controls);
    host.append(head, body);
    let states, index, input;
    function render() {
      const state = states[index];
      view.replaceChildren();
      mode.render(view, state, input);
      view.append(el('pre', 'queue25__code', state.code));
      step.textContent = `Шаг ${index} из ${states.length - 1}`;
      note.textContent = `${mode.title}. ${step.textContent}. Событие: ${state.event}`;
      note.classList.toggle('is-error', Boolean(state.error));
      buttons.prev.disabled = buttons.reset.disabled = index === 0;
      buttons.next.disabled = index === states.length - 1;
    }
    function load() {
      input = mode.cases[Number(select.value)][1];
      states = mode.trace(input);
      index = 0;
      render();
    }
    select.addEventListener('change', load);
    buttons.prev.addEventListener('click', () => { if (index > 0) { index--; render(); } });
    buttons.next.addEventListener('click', () => { if (index < states.length - 1) { index++; render(); } });
    buttons.reset.addEventListener('click', () => { index = 0; render(); });
    load();
  }
  function boot() { document.querySelectorAll('[data-queue25]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
