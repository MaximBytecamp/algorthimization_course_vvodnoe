(() => {
  'use strict';
  const make = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
  // States are computed by the algorithms; stacks always contain indices.
  function frames(nums, mode) {
    const stack = [], out = Array(nums.length).fill(mode === 'days' ? 0 : -1), states = [];
    let best = 0;
    const snap = (i, message, line, removed = null) => states.push({
      i, message, line, removed, stack: [...stack], out: [...out], best
    });
    snap(-1, 'До прохода стек пуст. Дно стека показано слева, вершина справа.', 'init');
    const limit = nums.length + (mode === 'hist' ? 1 : 0);
    for (let i = 0; i < limit; i++) {
      const value = i < nums.length ? nums[i] : 0;
      snap(i, i === nums.length ? 'Завершающий 0 закрывает положительные высоты.' : `Текущая позиция ${i}, значение ${value}.`, 'for');
      const removable = () => mode === 'hist' ? nums[stack[stack.length - 1]] > value : nums[stack[stack.length - 1]] < value;
      while (stack.length && removable()) {
        const old = stack.pop();
        if (mode === 'hist') {
          const left = stack.length ? stack[stack.length - 1] : -1;
          const width = i - left - 1;
          best = Math.max(best, nums[old] * width);
          snap(i, `Снят индекс ${old}: h=${nums[old]}, left=${left}, right=${i}. Ширина ${width}, площадь ${nums[old] * width}.`, 'pop', old);
        } else {
          out[old] = mode === 'days' ? i - old : value;
          snap(i, `Снят индекс ${old}: значение ${nums[old]} < ${value}. answer[${old}] = ${out[old]}.`, 'pop', old);
        }
      }
      stack.push(i);
      snap(i, `Добавлен индекс ${i}${i === nums.length ? ' служебного нуля' : ''}. Порядок значений восстановлен.`, 'push');
    }
    snap(-1, mode === 'hist' ? `Максимальная площадь: ${best}.` : `Проход завершён. Не снятые позиции сохраняют ${mode === 'days' ? 0 : -1}.`, 'return');
    return states;
  }
  document.querySelectorAll('[data-monostack]').forEach(root => {
    const mode = root.dataset.monostack;
    const examples = mode === 'hist' ? [[2, 1, 2], [2, 2], [0, 2, 0], []] : mode === 'days' ? [[73, 74, 74, 71, 72], [30, 30], [33, 32, 31], []] : [[3, 2, 4], [2, 2, 3], [4, 3, 2, 1], []];
    let states, at = 0, values;
    const head = make('div', undefined, 'widget__head');
    head.append(make('b', 'Алгоритм по шагам'), make('span', 'индексы и значения показаны отдельно'));
    root.append(head);
    const controls = make('div', undefined, 'ms-controls');
    const label = make('label', 'Вход: '), select = make('select');
    select.setAttribute('aria-label', 'Выбрать вход для трассы');
    examples.forEach((data, i) => { const option = make('option', JSON.stringify(data)); option.value = String(i); select.append(option); });
    label.append(select); controls.append(label);
    const prev = make('button', '← Назад', 'btn'), next = make('button', 'Вперёд →', 'btn'), reset = make('button', 'Сбросить', 'btn');
    for (const btn of [prev, next, reset]) { btn.type = 'button'; controls.append(btn); }
    root.append(controls);
    const progress = make('p'), input = make('div', undefined, 'ms-cells'), stack = make('div', undefined, 'ms-cells');
    const output = make('p', undefined, 'ms-code'), status = make('p'); status.setAttribute('aria-live', 'polite');
    root.append(progress, make('p', 'Вход: индекс сверху, значение снизу'), input, make('p', 'Стек индексов: дно слева → вершина справа'), stack, output, status);
    const code = make('div', undefined, 'ms-code');
    const lines = mode === 'hist' ? [
      ['init', 'stack = []; best = 0'], ['for', 'for i, height in enumerate(heights + [0]):'], ['pop', '    while stack and heights[stack[-1]] > height:\n        h = heights[stack.pop()]\n        left = stack[-1] if stack else -1\n        best = max(best, h * (i - left - 1))'], ['push', '    stack.append(i)'], ['return', 'return best']
    ] : [
      ['init', `answer = [${mode === 'days' ? '0' : '-1'}] * len(nums); stack = []`], ['for', 'for i, value in enumerate(nums):'], ['pop', `    while stack and nums[stack[-1]] < value:\n        old = stack.pop()\n        answer[old] = ${mode === 'days' ? 'i - old' : 'value'}`], ['push', '    stack.append(i)'], ['return', 'return answer']
    ];
    const codeLines = lines.map(([key, text]) => { const line = make('div', text); line.dataset.line = key; code.append(line); return line; });
    root.append(code);
    function render() {
      const frame = states[at]; progress.textContent = `Шаг ${at + 1} из ${states.length}`;
      input.replaceChildren(); stack.replaceChildren();
      values.forEach((value, i) => {
        const box = make('div', undefined, 'ms-cell' + (i === frame.i ? ' ms-current' : '') + (i === frame.removed ? ' ms-removed' : ''));
        box.append(make('small', String(i)), make('b', String(value))); input.append(box);
      });
      if (!values.length) input.append(make('span', '[] — пустой вход'));
      frame.stack.forEach(i => { const box = make('div', undefined, 'ms-cell'); box.append(make('small', `индекс ${i}`), make('b', i < values.length ? String(values[i]) : '0 (служебный)')); stack.append(box); });
      if (!frame.stack.length) stack.append(make('span', '[] — пустой стек'));
      output.textContent = mode === 'hist' ? `best = ${frame.best}` : `answer = [${frame.out.join(', ')}]`;
      status.textContent = frame.message;
      codeLines.forEach(line => line.classList.toggle('ms-active', line.dataset.line === frame.line));
      prev.disabled = at === 0; next.disabled = at === states.length - 1;
    }
    const load = () => { values = examples[Number(select.value)]; states = frames(values, mode); at = 0; render(); };
    select.addEventListener('change', load);
    prev.addEventListener('click', () => { if (at) { at--; render(); } });
    next.addEventListener('click', () => { if (at < states.length - 1) { at++; render(); } });
    reset.addEventListener('click', () => { at = 0; render(); });
    load();
  });
})();
