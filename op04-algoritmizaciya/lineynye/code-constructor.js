/* Постепенная сборка исходного кода: фрагмент → причина → пример. */
(() => {
  'use strict';
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  document.querySelectorAll('[data-code-constructor]').forEach(root => {
    const source = root.querySelector('script[type="application/json"]');
    if (!source) return;
    const data = JSON.parse(source.textContent);
    let at = 0;
    root.classList.add('widget', 'code-constructor');
    const head = make('div', 'widget__head');
    head.append(make('b', '', data.title), make('span', '', 'собираем код по частям'));
    const body = make('div', 'widget__body');
    const count = make('p', 'code-constructor__count');
    const title = make('h4', 'code-constructor__title');
    const reason = make('p', 'code-constructor__reason');
    const code = make('pre', 'code-constructor__code');
    code.tabIndex = 0;
    code.setAttribute('aria-label', 'Собранный код; новые строки выделены');
    const example = make('div', 'code-constructor__example');
    const note = make('p', 'scheme__note', 'Выделены строки, добавленные на этом шаге. Код накапливается сверху вниз. До последнего шага реализация ещё не собрана целиком.');
    const controls = make('div', 'code-constructor__controls');
    const buttons = {};
    for (const [key, text] of [['first', 'Сначала'], ['back', '← Назад'], ['next', 'Добавить фрагмент →'], ['all', 'Весь код']]) {
      const button = make('button', 'btn', text);
      button.type = 'button';
      button.dataset.act = key;
      buttons[key] = button;
      controls.append(button);
    }
    const live = make('p', 'code-constructor__live');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    body.append(count, title, reason, code, note, example, controls, live);
    root.append(head, body);
    const render = () => {
      const step = data.steps[at];
      count.textContent = `Шаг ${at + 1} из ${data.steps.length}`;
      title.textContent = step.title;
      reason.textContent = step.reason;
      code.replaceChildren();
      let number = 0;
      for (let part = 0; part <= at; part++) {
        for (const text of data.steps[part].code.split('\n')) {
          const line = make('span', 'code-constructor__line' + (part === at ? ' is-new' : ''));
          const label = make('span', 'code-constructor__number', String(++number));
          label.setAttribute('aria-hidden', 'true');
          line.append(label, make('code', '', text || ' '));
          code.append(line);
        }
      }
      example.replaceChildren(make('b', '', 'Проверка на примере'), make('p', '', step.example));
      buttons.first.disabled = buttons.back.disabled = at === 0;
      buttons.next.disabled = buttons.all.disabled = at === data.steps.length - 1;
      live.textContent = at === data.steps.length - 1
        ? 'Реализация собрана. Ниже приведены полный код и результаты запуска.'
        : `Добавлен фрагмент: ${step.title}.`;
    };
    const move = value => { at = Math.max(0, Math.min(data.steps.length - 1, value)); render(); };
    buttons.first.addEventListener('click', () => move(0));
    buttons.back.addEventListener('click', () => move(at - 1));
    buttons.next.addEventListener('click', () => move(at + 1));
    buttons.all.addEventListener('click', () => move(data.steps.length - 1));
    root.tabIndex = 0;
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', data.title);
    root.addEventListener('keydown', event => {
      // Не перехватывать прокрутку внутри блока кода.
      if (event.target !== root) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(at + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    render();
  });
})();
