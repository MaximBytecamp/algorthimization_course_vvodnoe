'use strict';
function sendLearningEvent(name, parameters) {
  const available = typeof window.gtag === 'function';
  if (available) window.gtag('event', name, parameters);
  const log = document.querySelector('#event-log');
  if (log) log.textContent = JSON.stringify({event:name, parameters, status:available ? 'Вызван gtag; получение проверьте в GA4' : 'Только локально: Google Tag не установлен'}, null, 2);
}
const programCta = document.querySelector('#program-cta');
if (programCta) programCta.addEventListener('click', () => {
  document.querySelector('#program-preview').hidden = false;
  sendLearningEvent('cta_click', {button_name:'program', page_section:'hero'});
});
const leadForm = document.querySelector('#lead-form');
if (leadForm) leadForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;
  sendLearningEvent('generate_lead', {lead_source:'contact_form'});
  document.querySelector('#form-status').textContent = 'Учебная форма проверена. Данные не отправлены.';
});
