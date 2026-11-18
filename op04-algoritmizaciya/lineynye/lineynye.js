(() => {
  const demo = document.querySelector('[data-access-demo]');
  if (!demo) return;

  const nextButton = demo.querySelector('[data-access-next]');
  const resetButton = demo.querySelector('[data-access-reset]');
  const status = demo.querySelector('#access-status');
  const listItems = [...demo.querySelectorAll('[data-list-item]')];
  const chainItems = [...demo.querySelectorAll('[data-chain-item]')];
  let step = 0;

  const messages = [
    'Начало. Нужно получить третий элемент, 30.',
    'Список: по индексу 2 получено значение 30. Цепочка: current = head, текущий узел — 42.',
    'Цепочка: первый переход по next, текущий узел — 17.',
    'Цепочка: второй переход по next, текущий узел — 30. Третий элемент найден.'
  ];

  function paint(items, currentIndex) {
    items.forEach((item, index) => {
      item.classList.toggle('is-hot', index === currentIndex);
      item.classList.toggle('is-done', currentIndex !== null && index < currentIndex);
    });
  }

  function render() {
    if (step === 0) {
      paint(listItems, null);
      paint(chainItems, null);
    } else {
      paint(listItems, 2);
      listItems.forEach(item => item.classList.remove('is-done'));
      paint(chainItems, step - 1);
    }

    status.textContent = messages[step];
    nextButton.disabled = step === messages.length - 1;
    nextButton.setAttribute('aria-disabled', String(nextButton.disabled));
  }

  nextButton.addEventListener('click', () => {
    if (step < messages.length - 1) {
      step += 1;
      render();
    }
  });

  resetButton.addEventListener('click', () => {
    step = 0;
    render();
  });

  render();
})();
