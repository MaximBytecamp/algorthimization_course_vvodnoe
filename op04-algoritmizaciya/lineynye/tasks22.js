(() => {
  'use strict';

  let markerSerial = 0;

  class Node {
    constructor(id, value, next = null) {
      this.id = id;
      this.value = value;
      this.next = next;
    }
  }

  function makeNodes(definitions) {
    const nodes = Object.fromEntries(definitions.map(([id, value]) => [id, new Node(id, value)]));
    definitions.forEach(([id,, next]) => { nodes[id].next = next ? nodes[next] : null; });
    return nodes;
  }

  function buildTracer(nodes, variableNames) {
    const states = [];

    function capture(line, status, variables) {
      const allNodes = Object.values(nodes);
      states.push({
        line,
        status,
        variables: Object.fromEntries(variableNames.map(name => [name, variables[name]])),
        links: Object.fromEntries(allNodes.map(node => [node.id, node.next ? node.next.id : null]))
      });
    }

    return { states, capture };
  }

  function reverseStates() {
    const nodes = makeNodes([
      ['A', 42, 'B'], ['B', 17, 'C'], ['C', 30, null]
    ]);
    const { states, capture } = buildTracer(nodes, ['head', 'prev', 'current', 'following', 'result']);
    const head = nodes.A;
    let prev = null;
    let current;
    let following;
    let result;

    capture(0, 'Выполнено: prev = None.', { head, prev, current, following, result });
    current = head;
    capture(1, 'Выполнено: current = head. Голова вызывающего остаётся у A.', { head, prev, current, following, result });

    while (true) {
      capture(2, current ? `Проверка while: current — узел ${current.id}, цикл продолжается.` : 'Проверка while: current = None, цикл закончен.', { head, prev, current, following, result });
      if (current === null) break;
      following = current.next;
      capture(3, `Выполнено: following = current.next. Сохранена ссылка на ${following ? following.id : 'None'}.`, { head, prev, current, following, result });
      current.next = prev;
      capture(4, `Выполнено: ${current.id}.next = ${prev ? prev.id : 'None'}. Реальная связь развернулась.`, { head, prev, current, following, result });
      prev = current;
      capture(5, `Выполнено: prev = current. prev указывает на ${prev.id}.`, { head, prev, current, following, result });
      current = following;
      capture(6, `Выполнено: current = following. current ${current ? `указывает на ${current.id}` : 'равен None'}.`, { head, prev, current, following, result });
    }

    result = prev;
    capture(7, `Выполнено: return prev. Возвращена новая голова ${result.id}; head вызывающего не менялся.`, { head, prev, current, following, result });
    return { nodes, states };
  }

  function mergeStates() {
    const nodes = makeNodes([
      ['A', 1, 'B'], ['B', 4, null], ['C', 2, 'D'], ['D', 4, null]
    ]);
    const { states, capture } = buildTracer(nodes, ['left', 'right', 'dummy', 'tail', 'result']);
    let left = nodes.A;
    let right = nodes.C;
    const dummy = new Node('dummy', null);
    nodes.dummy = dummy;
    let tail;
    let result;

    capture(0, 'Выполнено: dummy = Node(None). Временный узел пока ни с кем не связан.', { left, right, dummy, tail, result });
    tail = dummy;
    capture(1, 'Выполнено: tail = dummy.', { left, right, dummy, tail, result });

    while (true) {
      capture(2, left && right ? `Проверка while: left = ${left.id}, right = ${right.id}; оба списка ещё есть.` : 'Проверка while: один из списков закончился.', { left, right, dummy, tail, result });
      if (left === null || right === null) break;

      if (left.value <= right.value) {
        capture(3, `Проверка if: ${left.value} ≤ ${right.value}; берём узел ${left.id}.`, { left, right, dummy, tail, result });
        tail.next = left;
        capture(4, `Выполнено: tail.next = left. ${tail.id}.next теперь ведёт к ${left.id}.`, { left, right, dummy, tail, result });
        left = left.next;
        capture(5, `Выполнено: left = left.next. left ${left ? `перешёл к ${left.id}` : 'равен None'}.`, { left, right, dummy, tail, result });
      } else {
        capture(3, `Проверка if: ${left.value} > ${right.value}; выполняется ветвь else.`, { left, right, dummy, tail, result });
        tail.next = right;
        capture(6, `Выполнено: tail.next = right. ${tail.id}.next теперь ведёт к ${right.id}.`, { left, right, dummy, tail, result });
        right = right.next;
        capture(7, `Выполнено: right = right.next. right ${right ? `перешёл к ${right.id}` : 'равен None'}.`, { left, right, dummy, tail, result });
      }

      tail = tail.next;
      capture(8, `Выполнено: tail = tail.next. Хвост результата — ${tail.id}.`, { left, right, dummy, tail, result });
    }

    tail.next = left !== null ? left : right;
    capture(9, `Выполнено: tail.next присоединён к ${tail.next ? tail.next.id : 'None'}. Все узлы остаются на схеме.`, { left, right, dummy, tail, result });
    result = dummy.next;
    capture(10, `Выполнено: return dummy.next. Результат начинается с ${result.id}.`, { left, right, dummy, tail, result });
    return { nodes, states };
  }

  function middleStates() {
    const nodes = makeNodes([
      ['A', 10, 'B'], ['B', 20, 'C'], ['C', 30, 'D'], ['D', 40, null]
    ]);
    const { states, capture } = buildTracer(nodes, ['head', 'slow', 'fast', 'result']);
    const head = nodes.A;
    let slow = head;
    let fast = head;
    let result;

    capture(0, 'Выполнено: slow = fast = head. Обе переменные у A.', { head, slow, fast, result });
    while (true) {
      const canContinue = fast !== null && fast.next !== null;
      capture(1, canContinue ? `Проверка while: fast = ${fast.id}, fast.next = ${fast.next.id}; можно двигаться.` : 'Проверка while: fast дошёл до конца.', { head, slow, fast, result });
      if (!canContinue) break;
      slow = slow.next;
      capture(2, `Выполнено: slow = slow.next. slow у ${slow.id}.`, { head, slow, fast, result });
      fast = fast.next.next;
      capture(3, `Выполнено: fast = fast.next.next. fast ${fast ? `у ${fast.id}` : 'равен None'}.`, { head, slow, fast, result });
    }
    result = slow;
    capture(4, `Выполнено: return slow. Для чётной длины возвращена правая середина ${result.id}.`, { head, slow, fast, result });
    return { nodes, states };
  }

  function cycleStates() {
    const nodes = makeNodes([
      ['A', 7, 'B'], ['B', 7, 'C'], ['C', 9, 'B']
    ]);
    const { states, capture } = buildTracer(nodes, ['head', 'slow', 'fast', 'result']);
    const head = nodes.A;
    let slow = head;
    let fast = head;
    let result;

    capture(0, 'Выполнено: slow = fast = head. У одинаковых значений различаются объекты A и B.', { head, slow, fast, result });
    while (true) {
      const canContinue = fast !== null && fast.next !== null;
      capture(1, canContinue ? 'Проверка while: fast и fast.next существуют.' : 'Проверка while: fast дошёл до None.', { head, slow, fast, result });
      if (!canContinue) break;
      slow = slow.next;
      capture(2, `Выполнено: slow сделал один шаг и указывает на ${slow.id}.`, { head, slow, fast, result });
      fast = fast.next.next;
      capture(3, `Выполнено: fast сделал два шага и указывает на ${fast.id}.`, { head, slow, fast, result });
      const met = slow === fast;
      capture(4, met ? `Проверка if: slow is fast. Обе переменные у объекта ${slow.id}.` : `Проверка if: ${slow.id} и ${fast.id} — разные объекты.`, { head, slow, fast, result });
      if (met) {
        result = true;
        capture(5, 'Выполнено: return True. В списке обнаружен цикл.', { head, slow, fast, result });
        return { nodes, states };
      }
    }
    result = false;
    capture(6, 'Выполнено: return False. Цикла нет.', { head, slow, fast, result });
    return { nodes, states };
  }

  const builders = { reverse: reverseStates, merge: mergeStates, middle: middleStates, cycle: cycleStates };

  function variableLabel(name, value) {
    if (value === undefined) return `${name}: —`;
    if (name === 'result' && typeof value === 'boolean') return `result = ${value ? 'True' : 'False'}`;
    return `${name} = ${value ? value.id : 'None'}`;
  }

  function nodeCaption(node) {
    return node.id === 'dummy' ? 'dummy · Node' : `${node.id} · Node`;
  }

  function renderDiagram(host, state, nodes) {
    const allNodes = Object.values(nodes);
    const vertical = host.clientWidth < 740 || allNodes.length > 4;
    const nodeWidth = 156;
    const nodeHeight = 96;
    const variableEntries = Object.entries(state.variables);
    const targetVariables = variableEntries.filter(([, value]) => value && typeof value === 'object');
    const varsHeight = Math.max(54, variableEntries.length * 31 + 55);
    const horizontalGap = 80;
    const xForIndex = index => vertical ? 106 : 26 + index * (nodeWidth + horizontalGap);
    const yForIndex = index => vertical ? varsHeight + 12 + index * 156 : varsHeight + 20;
    const width = vertical ? 330 : Math.max(690, allNodes.length * (nodeWidth + horizontalGap) - horizontalGap + 52);
    const height = vertical ? varsHeight + allNodes.length * 156 + 18 : varsHeight + nodeHeight + 44;
    const marker = `ln-task22-arrow-${++markerSerial}`;
    const text = (x, y, content, className, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${className}">${content}</text>`;
    const arrow = (path, className = '') => `<path d="${path}" class="ln-link ${className}" marker-end="url(#${marker})"/>`;
    const positions = Object.fromEntries(allNodes.map((node, index) => [node.id, { x: xForIndex(index), y: yForIndex(index), index }]));
    const activeIds = new Set(targetVariables.filter(([name]) => name !== 'head' && name !== 'dummy').map(([, value]) => value.id));
    let body = '';

    variableEntries.forEach(([name, value], index) => {
      const y = 25 + index * 31;
      const label = variableLabel(name, value);
      body += text(100, y, label, 'ln-name');
      if (!value || typeof value !== 'object') return;
      const target = positions[value.id];
      const lane = 12 + index * 14;
      if (vertical) {
        body += arrow(`M90,${y - 6} H${lane} V${target.y + 14 + index * 14} H${target.x}`, 'ln-variable');
      } else {
        const routeY = varsHeight - 12 - index * 9;
        body += arrow(`M90,${y - 6} H${lane} V${routeY} H${target.x + 20 + index * 23} V${target.y - 3}`, 'ln-variable');
      }
    });

    allNodes.forEach((node, index) => {
      const { x, y } = positions[node.id];
      const isActive = activeIds.has(node.id);
      const valueText = node.value === null ? 'None' : node.value;
      const nextId = state.links[node.id];
      body += `<g class="ln-object${isActive ? ' ln-object--active' : ''}"><title>${nodeCaption(node)}: value = ${valueText}, next = ${nextId || 'None'}</title><rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}"/><path d="M${x},${y + 37} H${x + nodeWidth} M${x + 78},${y + 37} V${y + nodeHeight}"/>${text(x + 9, y + 24, nodeCaption(node), 'ln-small')}${text(x + 15, y + 52, 'value', 'ln-small')}${text(x + 97, y + 52, 'next', 'ln-small')}${text(x + 19, y + 86, valueText, node.value === null ? 'ln-small' : 'ln-value')}${nextId ? `<circle cx="${x + 117}" cy="${y + 79}" r="4"/>` : ''}</g>`;

      if (nextId) {
        const target = positions[nextId];
        const sourceX = x + 117;
        const sourceY = y + 79;
        let path;
        if (!vertical && target.index > index) {
          path = `M${sourceX},${sourceY} H${target.x}`;
        } else if (!vertical) {
          const routeY = y + nodeHeight + 22;
          path = `M${sourceX},${sourceY} H${x + nodeWidth + 20} V${routeY} H${target.x - 18} V${target.y + 47} H${target.x}`;
        } else if (target.index > index) {
          path = `M${sourceX},${sourceY} H${x + nodeWidth + 18} V${target.y - 18} H${target.x + 55} V${target.y}`;
        } else {
          const routeX = x + nodeWidth + 34;
          path = `M${sourceX},${sourceY} H${routeX} V${target.y + 47} H${target.x + nodeWidth}`;
        }
        body += arrow(path);
      } else {
        body += text(x + 101, y + 88, 'None', 'ln-small');
      }
    });

    const accessibleLinks = allNodes.map(node => `${node.id}.next = ${state.links[node.id] || 'None'}`).join('; ');
    host.innerHTML = `<svg style="max-width: ${vertical ? '380px' : '100%'}; margin-inline: auto" viewBox="0 0 ${width} ${height}" role="img" aria-label="${state.status} Связи: ${accessibleLinks}."><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>${body}</svg>`;
  }

  function initWidget(root) {
    const type = root.dataset.task22;
    const build = builders[type];
    const host = root.querySelector('[data-chain-diagram]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const reset = root.querySelector('[data-reset]');
    const step = root.querySelector('[data-step]');
    const status = root.querySelector('[data-status]');
    if (!build || !host || !prev || !next || !reset || !step || !status) return;

    const { nodes, states } = build();
    let index = 0;
    let lastWidth = 0;
    status.setAttribute('aria-live', 'polite');

    function update() {
      const state = states[index];
      renderDiagram(host, state, nodes);
      step.textContent = `Шаг ${index} из ${states.length - 1}`;
      status.textContent = state.status;
      prev.disabled = index === 0;
      next.disabled = index === states.length - 1;
      root.querySelectorAll('[data-line]').forEach(line => {
        line.classList.toggle('ln-code-active', Number(line.dataset.line) === state.line);
      });
    }

    prev.addEventListener('click', () => { if (index > 0) { index -= 1; update(); } });
    next.addEventListener('click', () => { if (index < states.length - 1) { index += 1; update(); } });
    reset.addEventListener('click', () => { index = 0; update(); });
    new ResizeObserver(entries => {
      const width = Math.round(entries[0].contentRect.width);
      if (width !== lastWidth) {
        lastWidth = width;
        update();
      }
    }).observe(host);
    update();
  }

  function init() {
    document.querySelectorAll('.widget[data-task22]').forEach(initWidget);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
