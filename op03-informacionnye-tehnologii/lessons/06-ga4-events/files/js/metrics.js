'use strict';
// Дополнительные учебные метрики. Подключается после js/script.js:
// <script src="js/metrics.js" defer></script>
// Персональные данные не собираются: только адреса страниц, метки кампаний и тексты ссылок.

function sendMetric(name, parameters) {
  if (typeof gtag === 'function') gtag('event', name, parameters);
}

// 1. nav_click — по каким пунктам меню ходят посетители.
document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => {
    sendMetric('nav_click', {
      link_text: link.textContent.trim(),
      from_page: document.title
    });
  });
});

// 2. utm_visit — метки кампании из адреса страницы.
const params = new URLSearchParams(window.location.search);
const utmSource = params.get('utm_source');
if (utmSource) {
  sendMetric('utm_visit', {
    utm_source: utmSource,
    utm_medium: params.get('utm_medium') || 'not_set',
    utm_campaign: params.get('utm_campaign') || 'not_set',
    landing_page: window.location.pathname
  });
}

// 3. read_30s — посетитель остался на странице полминуты.
let counted = false;
window.setTimeout(() => {
  if (counted || document.hidden) return;
  counted = true;
  sendMetric('read_30s', { page_path: window.location.pathname });
}, 30000);

// 4. form_error — браузер не пропустил отправку формы.
const form = document.querySelector('#lead-form');
if (form) {
  form.addEventListener('invalid', (event) => {
    sendMetric('form_error', {
      field_name: event.target.name || 'unknown',
      form_id: 'lead-form'
    });
  }, true);
}
