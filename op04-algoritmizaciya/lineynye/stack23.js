(() => {
  'use strict';
  const MODES = {
    brackets: [
      ['{[()]}', '{[()]}'], ['([)]', '([)]'], [')(', ')('], ['(()', '(()'], ['Пустая строка', '']
    ],
    postfix: [
      ['2 3 + 4 *', '2 3 + 4 *'], ['8 3 -', '8 3 -'], ['-7 3 /', '-7 3 /'],
      ['1 +', '1 +'], ['5 0 /', '5 0 /'], ['1 2', '1 2'], ['2 x +', '2 x +']
    ],
    undo: [
      ['add:при → add:вет → undo', ['add:при', 'add:вет', 'undo']],
      ['undo на пустой истории', ['undo']],
      ['add:a → add:пусто → undo', ['add:a', 'add:', 'undo']],
      ['add:a → add:b → undo → add:c', ['add:a', 'add:b', 'undo', 'add:c']]
    ],
    calls: [['countdown(2)', 2], ['countdown(1)', 1], ['countdown(3)', 3]]
  };
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function trace(mode, input) {
    const stack = [], states = [];
    const tokens = mode === 'calls'
      ? [...Array.from({length: input + 1}, (_, i) => `вход ${input - i}`),
         ...Array.from({length: input + 1}, (_, i) => `выход ${i}`)]
      : mode === 'brackets' ? Array.from(input)
      : mode === 'postfix' ? input.split(/\s+/).filter(Boolean) : input;
    function save(consumed, action, code, changed = []) {
      states.push({tokens, consumed, action, code, stack: stack.slice(), changed});
    }
    save(0, 'Начальное состояние: стек пуст.', mode === 'undo' ? 'chunks = []' : 'stack = []');
    let stopped = false;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (mode === 'brackets') {
        if ('([{'.includes(token)) {
          stack.push(token);
          save(i + 1, `Открывающая ${token} добавлена на вершину.`, 'stack.append(char)', [stack.length - 1]);
        } else if (!stack.length) {
          save(i + 1, `Закрывающая ${token} встретилась при пустом стеке. Результат False.`, 'if not stack: return False');
          stopped = true;
        } else {
          const top = stack.pop(), expected = {')':'(', ']':'[', '}':'{'}[token];
          save(i + 1, `Сняли ${top}; для ${token} требуется ${expected}. ${top === expected ? 'Пара совпала.' : 'Пара не совпала. Результат False.'}`, 'stack.pop() != pairs[char]');
          stopped = top !== expected;
        }
      } else if (mode === 'postfix') {
        if (/^-?\d+$/.test(token)) {
          stack.push(BigInt(token));
          save(i + 1, `Число ${token} добавлено на вершину.`, 'stack.append(value)', [stack.length - 1]);
        } else if (!['+', '-', '*', '/'].includes(token)) {
          save(i + 1, `Токен ${token} не является числом или допустимой операцией. ValueError.`, "raise ValueError('Неверный токен')");
          stopped = true;
        } else if (stack.length < 2) {
          save(i + 1, `Для ${token} нужны два числа; в стеке ${stack.length}. ValueError.`, 'if len(stack) < 2: raise ValueError(...)');
          stopped = true;
        } else {
          const right = stack.pop();
          save(i + 1, `Снят правый операнд right = ${right}.`, 'right = stack.pop()');
          const left = stack.pop();
          save(i + 1, `Снят левый операнд left = ${left}.`, 'left = stack.pop()');
          if (token === '/' && right === 0n) {
            save(i + 1, 'Делитель равен нулю. ZeroDivisionError.', 'if right == 0: raise ZeroDivisionError(...)');
            stopped = true;
          } else {
            // BigInt division truncates toward zero, matching the chapter's Python rule.
            const value = token === '+' ? left + right : token === '-' ? left - right : token === '*' ? left * right : left / right;
            stack.push(value);
            save(i + 1, `${left} ${token} ${right} = ${value}. Результат добавлен на вершину.`, 'stack.append(value)', [stack.length - 1]);
          }
        }
      } else if (mode === 'undo') {
        if (token.startsWith('add:')) {
          const chunk = token.slice(4);
          stack.push(chunk);
          save(i + 1, `Добавлен фрагмент «${chunk}». Текст: «${stack.join('')}».`, 'chunks.append(action[1])', [stack.length - 1]);
        } else if (stack.length) {
          const chunk = stack.pop();
          save(i + 1, `Отменено добавление «${chunk}». Текст: «${stack.join('')}».`, 'chunks.pop()');
        } else save(i + 1, 'История пуста. Отмена ничего не меняет.', 'elif chunks:');
      } else {
        const n = Number(token.split(' ')[1]);
        if (token.startsWith('вход')) {
          stack.push(`countdown(${n})`);
          save(i + 1, `Создан кадр countdown(${n}).`, n === 0 ? 'if n == 0:' : 'return countdown(n - 1)', [stack.length - 1]);
        } else {
          stack.pop();
          save(i + 1, `Вызов countdown(${n}) возвращает 0. Его кадр снят.`, n === 0 ? 'return 0' : 'return countdown(n - 1)');
        }
      }
      if (stopped) break;
    }
    if (!stopped) {
      const action = mode === 'brackets' ? `Результат ${stack.length ? 'False: остались незакрытые скобки' : 'True: стек пуст'}.`
        : mode === 'postfix' ? (stack.length === 1 ? `Результат: ${stack[0]}.` : `Осталось значений: ${stack.length}. Ожидается одно. ValueError.`)
        : mode === 'undo' ? `Итоговый текст: «${stack.join('')}».` : 'Все вызовы завершены. Результат countdown — 0.';
      save(tokens.length, action, mode === 'brackets' ? 'return not stack' : mode === 'postfix' ? 'if len(stack) != 1: raise ValueError(...)\nreturn stack[0]' : mode === 'undo' ? "return ''.join(chunks)" : 'результат вызова → 0');
    }
    return states;
  }
  function init(host) {
    const mode = host.dataset.stack23, cases = MODES[mode];
    if (!cases) return;
    const label = el('label', 'stack23__select-label', 'Пример');
    const select = el('select', 'stack23__case');
    cases.forEach(([name], i) => {
      const option = el('option', '', name); option.value = String(i); select.append(option);
    });
    label.append(select);
    const step = el('span', 'stack23__step');
    const view = el('div', 'stack23__view');
    const note = el('p', 'stack23__note'); note.setAttribute('aria-live', 'polite');
    const legend = el('p', 'scheme__note', 'Дно стека слева, вершина справа. При переносе строки чтение продолжается ниже. Выделены новый элемент стека и текущий входной элемент. Побледневшие элементы уже обработаны.');
    const controls = el('div', 'stack23__controls');
    const buttons = {};
    for (const [action, title] of [['prev', '← Назад'], ['next', 'Шаг →'], ['reset', 'Сначала']]) {
      const button = el('button', 'btn', title); button.type = 'button'; button.dataset[action] = ''; buttons[action] = button; controls.append(button);
    }
    const body = el('div', 'widget__body');
    body.append(label, step, view, note, legend, controls);
    host.append(body);
    let states, index;
    function render() {
      const state = states[index]; view.replaceChildren();
      view.append(el('h3', 'stack23__heading', mode === 'calls' ? 'События вызовов' : 'Вход'));
      const tokens = el('div', 'stack23__tokens');
      state.tokens.forEach((token, i) => tokens.append(el('span', `stack23__token${i < state.consumed ? ' is-consumed' : ''}${i === state.consumed - 1 ? ' is-current' : ''}`, token === 'add:' ? 'add:пусто' : token)));
      if (!state.tokens.length) tokens.append(el('span', 'stack23__empty', 'пустой вход'));
      view.append(tokens, el('h3', 'stack23__heading', 'Стек: дно → вершина'));
      const stack = el('div', 'stack23__stack');
      state.stack.forEach((item, i) => stack.append(el('span', `stack23__entry${state.changed.includes(i) ? ' is-changed' : ''}`, item === '' ? 'пустая строка' : String(item))));
      if (!state.stack.length) stack.append(el('span', 'stack23__empty', 'пуст'));
      view.append(stack, el('pre', 'stack23__code', state.code));
      note.textContent = state.action;
      step.textContent = `Шаг ${index} из ${states.length - 1}`;
      buttons.prev.disabled = buttons.reset.disabled = index === 0;
      buttons.next.disabled = index === states.length - 1;
    }
    function load() { states = trace(mode, cases[Number(select.value)][1]); index = 0; render(); }
    select.addEventListener('change', load);
    buttons.prev.addEventListener('click', () => { if (index > 0) { index--; render(); } });
    buttons.next.addEventListener('click', () => { if (index < states.length - 1) { index++; render(); } });
    buttons.reset.addEventListener('click', () => { index = 0; render(); });
    load();
  }
  document.querySelectorAll('[data-stack23]').forEach(init);
})();
