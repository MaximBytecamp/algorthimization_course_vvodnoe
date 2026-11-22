'use strict';
// Модель ограничена двумя действиями: проверка WIP и завершение проверенной задачи.
(() => {
  const payment = document.getElementById('payment-ticket');
  const catalog = document.getElementById('catalog-ticket');
  const queue = payment.parentElement;
  const doing = document.getElementById('doing-column');
  const done = document.getElementById('done-column');
  const empty = document.getElementById('done-empty');
  const message = document.getElementById('board-message');
  const count = document.getElementById('wip-count');
  const start = document.getElementById('start-payment');
  const finish = document.getElementById('finish-catalog');
  const initial = message.textContent;
  const currentWip = () => doing.querySelectorAll('.ticket').length;
  const update = () => {
    count.textContent = `В работе: ${currentWip()} из 2`;
    empty.hidden = done.querySelector('.ticket') !== null;
  };
  start.addEventListener('click', () => {
    if (currentWip() >= 2) {
      message.textContent = 'Лимит WIP достигнут: две задачи уже в работе. Сначала завершите каталог, проверки которого уже пройдены.';
      return;
    }
    doing.append(payment);
    start.disabled = true;
    message.textContent = 'Оплата взята в работу: снова две задачи из двух. Новую работу начали после освобождения места.';
    update();
  });
  finish.addEventListener('click', () => {
    done.append(catalog);
    finish.disabled = true;
    message.textContent = 'Проверенный каталог завершён. В работе одна задача: теперь можно взять оплату.';
    update();
  });
  document.getElementById('reset-board').addEventListener('click', () => {
    queue.append(payment);
    doing.insertBefore(catalog, doing.querySelector('.ticket'));
    start.disabled = false;
    finish.disabled = false;
    message.textContent = initial;
    update();
  });
})();
