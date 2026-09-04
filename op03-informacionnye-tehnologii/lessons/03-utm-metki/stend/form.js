/* Форма стенда: подстановка меток в скрытые поля, отправка события и показ
   сохранённой заявки. Тот же код работает на обеих страницах стенда. */
(function () {
  var form = document.getElementById('lead');
  if (!form) return;
  var saved = document.getElementById('saved');
  var peek = document.getElementById('peek');
  var formStarted = false;

  /* Шаг 1. Заполняем скрытые поля значениями меток. Это происходит при загрузке
     страницы — до того, как посетитель начал что-либо вводить. */
  var c = campaign();
  document.getElementById('utm_source').value = c.source;
  document.getElementById('utm_medium').value = c.medium;
  document.getElementById('utm_campaign').value = c.campaign;

  if (peek) {
    var mark = function (v) { return v === '(not set)' ? '<span class="ns">(not set)</span>' : v; };
    peek.innerHTML = 'скрытые поля формы прямо сейчас:<br>' +
      '<b>utm_source</b> = ' + mark(c.source) + '<br>' +
      '<b>utm_medium</b> = ' + mark(c.medium) + '<br>' +
      '<b>utm_campaign</b> = ' + mark(c.campaign);

    /* Если источника нет, поясняем почему. Чаще всего внутреннюю страницу
       открывают напрямую — тогда перехода с размеченной ссылки не было
       и запоминать в sessionStorage оказалось нечего. */
    if (c.source === '(not set)' && c.medium === '(not set)' && c.campaign === '(not set)') {
      var inner = /programma\.html$/.test(location.pathname);
      peek.insertAdjacentHTML('beforeend',
        '<div class="hint">' +
        (inner
          ? 'Источник неизвестен: эту страницу открыли напрямую. Начните с главной по размеченной ссылке и перейдите сюда через меню — тогда значения сохранятся.'
          : 'Источник неизвестен: в адресе нет меток. Допишите к адресу <b>?utm_source=vk&amp;utm_medium=social&amp;utm_campaign=sept_open_2026</b> и нажмите Enter.') +
        '</div>');
    }
  }

  var cta = document.getElementById('cta');
  if (cta) cta.addEventListener('click', function () {
    gtag('event', 'select_content', { content_type: 'cta', item_id: 'lead_button' });
    form.scrollIntoView({ behavior: 'smooth' });
  });

  form.addEventListener('focusin', function () {
    if (formStarted) return;
    formStarted = true;
    gtag('event', 'form_start', { form_id: 'lead_main' });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    /* Шаг 2. Те же три значения уходят в событие. Строковые ключи объекта
       становятся полями ep.*, числовые — epn.*. */
    gtag('event', 'generate_lead', {
      form_id:  'lead_main',
      source:   c.source,
      medium:   c.medium,
      campaign: c.campaign,
      value:    0,
      currency: 'RUB'
    });

    /* Шаг 3. Показываем строку, которая на настоящем сайте ушла бы в таблицу. */
    document.getElementById('s_name').textContent = document.getElementById('name').value || '—';
    document.getElementById('s_contact').textContent = document.getElementById('contact').value || '—';
    document.getElementById('s_msg').textContent = document.getElementById('msg').value || '—';
    document.getElementById('s_source').textContent = c.source;
    document.getElementById('s_medium').textContent = c.medium;
    document.getElementById('s_campaign').textContent = c.campaign;
    document.getElementById('s_time').textContent = new Date().toISOString().slice(0, 19).replace('T', ' ');
    ['s_source', 's_medium', 's_campaign'].forEach(function (id) {
      var row = document.getElementById(id).parentNode;
      row.classList.toggle('ns', document.getElementById(id).textContent === '(not set)');
    });

    form.style.display = 'none';
    if (peek) peek.style.display = 'none';
    saved.classList.add('on');
  });
})();
