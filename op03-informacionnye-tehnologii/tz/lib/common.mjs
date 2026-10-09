// Общие части файлов данных: стандартные события, столбцы таблицы заявок, подписи.

// Подпись строится из «семени»: у каждого человека своя, при пересборке не меняется.
export function sign(seed) {
  let x = 0;
  for (const ch of String(seed)) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const r = (a, b) => +(a + rnd() * (b - a)).toFixed(1);
  // Заглавная буква: петля с заходом снизу.
  let px = r(8, 14), py = r(54, 60);
  let d = `M${px},${py} C${r(12, 18)},${r(18, 28)} ${r(26, 34)},${r(14, 22)} ${r(30, 36)},${r(30, 38)} C${r(32, 38)},${r(48, 58)} ${r(18, 24)},${r(58, 64)} ${r(20, 26)},${r(46, 52)}`;
  px = r(24, 30); py = r(40, 48);
  d += ` C${r(28, 34)},${r(30, 36)} ${r(40, 46)},${r(26, 32)} ${r(44, 50)},${r(38, 44)}`;
  px = 48;
  // Строчные буквы: волна с разной высотой и редкими петлями.
  const humps = 4 + Math.floor(rnd() * 4);
  for (let i = 0; i < humps; i++) {
    const step = r(12, 19), top = r(26, 42), bottom = r(52, 60);
    const nx = px + step;
    if (rnd() < .3) d += ` C${px + step * .2},${top - 8} ${px + step * .9},${top - 6} ${px + step * .5},${bottom - 4} C${px + step * .3},${bottom + 2} ${nx},${bottom} ${nx},${top + 6}`;
    else d += ` C${px + step * .3},${top} ${px + step * .7},${top} ${nx - step * .3},${bottom} S${nx},${top + 4} ${nx},${top + 10}`;
    px = nx;
  }
  // Росчерк: возврат под подпись.
  d += ` M${r(40, 60)},${r(64, 70)} C${r(80, 100)},${r(58, 64)} ${r(130, 150)},${r(60, 66)} ${Math.min(px + 20, 192)},${r(48, 58)}`;
  return d;
}

// 20 событий: 6 автоматических, generate_lead, cta_click, 8 своих для бизнеса и 4 общих.
// specific — 8 объектов { name, when, params }, два последних получают пометку «по выбору».
export function events(specific, { leadParams = 'lead_direction, lead_source', keyContact = true } = {}) {
  if (specific.length !== 8) throw new Error('нужно 8 своих событий, сейчас ' + specific.length);
  const own = specific.map((e, i) => ({ type: 'custom', ...e, optional: i >= 6 || e.optional }));
  return [
    { name: 'page_view', type: 'auto', when: 'Открытие любой страницы', params: 'page_location, page_title' },
    { name: 'scroll', type: 'auto', when: 'Прокрутка страницы до 90 %', params: 'percent_scrolled' },
    { name: 'click', type: 'auto', when: 'Переход по ссылке на внешний сайт', params: 'link_url, outbound' },
    { name: 'file_download', type: 'auto', when: 'Скачивание PDF с сайта', params: 'file_name, file_extension' },
    { name: 'form_start', type: 'auto', when: 'Первое взаимодействие с формой заявки', params: 'form_id' },
    { name: 'form_submit', type: 'auto', when: 'Отправка формы заявки', params: 'form_id' },
    { name: 'generate_lead', type: 'rec', when: 'Таблица заявок ответила ok: true', params: leadParams, key: true },
    { name: 'cta_click', type: 'custom', when: 'Клик по любой кнопке заявки', params: 'button_name, page_section' },
    ...own.slice(0, 6),
    { name: 'contact_click', type: 'custom', when: 'Клик по телефону или e-mail', params: 'contact_type', key: keyContact },
    { name: 'messenger_click', type: 'custom', when: 'Клик по кнопке Telegram или WhatsApp', params: 'messenger', key: true },
    { name: 'social_click', type: 'custom', when: 'Клик по иконке соцсети в подвале или на thanks.html', params: 'network, page_section' },
    { name: 'form_error', type: 'custom', when: 'Форма не отправлена из-за ошибки поля', params: 'field_name, error_type' },
    ...own.slice(6),
  ];
}

// Столбцы листа leads. extra — 2–3 столбца бизнеса: [имя, тип, откуда, обязательно].
export function columns(extra) {
  return [
    ['request_id', 'текст', 'Создаёт форма: REQ- + UUID', 'да'],
    ['created_at', 'дата и время', 'Ставит Apps Script', 'да'],
    ['name', 'текст', 'Поле формы, 2–60 символов', 'да', 'form'],
    ['phone', 'текст', 'Поле формы, +7 и 10 цифр', 'да', 'form'],
    ['email', 'текст', 'Поле формы, проверка формата', 'нет', 'form'],
    ...extra.map(r => [...r, 'form']),
    ['utm_source', 'текст', 'Из адреса страницы; пусто → direct', 'да'],
    ['utm_medium', 'текст', 'Из адреса; пусто → none', 'да'],
    ['utm_campaign', 'текст', 'Из адреса; пусто → not_set', 'да'],
    ['utm_content', 'текст', 'Из адреса; пусто → not_set', 'да'],
    ['status', 'список', 'Ставит Apps Script: new', 'да'],
  ];
}

// Пользовательские параметры, общие для всех ТЗ; бизнес добавляет свои.
export function dims(extra) {
  return [
    ['button_name', 'cta_click', 'Какая кнопка заявки сработала'],
    ['page_section', 'cta_click, social_click', 'В каком блоке страницы был клик'],
    ...extra,
    ['messenger', 'messenger_click', 'Какой мессенджер выбирают'],
  ];
}

export const UTM_PROPS = ['UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'Application Created At'];
