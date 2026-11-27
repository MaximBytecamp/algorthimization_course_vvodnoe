(() => {
  const root = document.querySelector('[data-sort-trace]');
  if (!root) return;

  const orders = [
    { id: 'B', total: 1900 },
    { id: 'A', total: 700 },
    { id: 'C', total: 1200 }
  ];
  const states = [
    {
      line: -1,
      keys: 0,
      result: 0,
      output: 'Пока вызов sorted не выполнен.',
      status: 'Вызов готов. В orders три словаря: B, A и C.'
    },
    {
      line: 0,
      keys: 1,
      result: 0,
      output: 'lambda order: order["total"]\nB → 1900',
      status: 'Для первого словаря B функция ключа возвращает 1900. Исходный orders не меняется.'
    },
    {
      line: 0,
      keys: 2,
      result: 0,
      output: 'lambda order: order["total"]\nB → 1900\nA → 700',
      status: 'Для второго словаря A функция ключа возвращает 700. Python получил два ключа.'
    },
    {
      line: 0,
      keys: 3,
      result: 0,
      output: 'lambda order: order["total"]\nB → 1900\nA → 700\nC → 1200',
      status: 'Для C ключ равен 1200. Теперь известны все пары «запись — ключ».'
    },
    {
      line: 0,
      keys: 3,
      result: 3,
      output: 'by_total = [A, C, B]\n# ключи: 700, 1200, 1900',
      status: 'Записи расположены по возрастанию ключа: 700, затем 1200, затем 1900. Получен новый список by_total.'
    },
    {
      line: 2,
      keys: 3,
      result: 3,
      output: '[order["id"] for order in by_total]\n[\'A\', \'C\', \'B\']\n\n[order["id"] for order in orders]\n[\'B\', \'A\', \'C\']',
      status: 'Вывод подтверждает результат: by_total отсортирован, а orders сохранён в исходном порядке.'
    }
  ];
  let index = 0;

  const source = root.querySelector('[data-sort-source]');
  const keys = root.querySelector('[data-sort-keys]');
  const result = root.querySelector('[data-sort-result]');
  const step = root.querySelector('[data-sort-step]');
  const output = root.querySelector('[data-sort-output]');
  const status = root.querySelector('[data-sort-status]');
  const previous = root.querySelector('[data-sort-prev]');
  const next = root.querySelector('[data-sort-next]');

  function card({ id, total }, className = '', text = `${total} ₽`) {
    const item = document.createElement('div');
    item.className = `sort-card ${className}`.trim();
    const name = document.createElement('b');
    name.textContent = id;
    const value = document.createElement('small');
    value.textContent = text;
    item.append(name, value);
    return item;
  }

  function renderCards(state) {
    source.replaceChildren(...orders.map(order => card(order)));
    keys.replaceChildren(...orders.map((order, position) => card(order,
      position < state.keys ? position === state.keys - 1 ? 'is-active' : 'is-done' : 'is-waiting',
      position < state.keys ? `key = ${order.total}` : 'ключ ещё не вычислен'
    )));
    const sorted = [...orders].sort((left, right) => left.total - right.total);
    result.replaceChildren(...sorted.map((order, position) => card(order,
      position < state.result ? position === state.result - 1 && state.result < sorted.length ? 'is-active' : 'is-done' : 'is-waiting',
      position < state.result ? `key = ${order.total}` : 'ещё нет в результате'
    )));
  }

  function render() {
    const state = states[index];
    step.textContent = `Шаг ${index} из ${states.length - 1}`;
    output.textContent = state.output;
    status.textContent = state.status;
    root.querySelectorAll('[data-sort-line]').forEach(line => {
      line.classList.toggle('is-active', Number(line.dataset.sortLine) === state.line);
    });
    previous.disabled = index === 0;
    next.disabled = index === states.length - 1;
    renderCards(state);
  }

  previous.addEventListener('click', () => { if (index > 0) { index--; render(); } });
  next.addEventListener('click', () => { if (index < states.length - 1) { index++; render(); } });
  root.querySelector('[data-sort-reset]').addEventListener('click', () => { index = 0; render(); });
  render();
})();
