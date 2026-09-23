/* Тест ОП.03 по темам 4, 5, 6. Файл собран скриптом — руками не править.

   Ключи и разбор лежат в SECRET: JSON, перемешанный XOR с SHA-256 от соли,
   в base64. Это барьер от беглого чтения исходника, а не защита. */

const QUIZ = {
 "id": "op03-test-t46",
 "prefix": "IT46",
 "title": "Темы 4, 5, 6 · GA4, Google Tag и события",
 "minutes": 45,
 "salt": "op03-temy-4-6-2026-sep",
 "context": "Снимки экрана сделаны в учебном ресурсе GA4 и в учебном проекте на Vercel; адреса и идентификаторы на них учебные. Снимок можно увеличить нажатием. Карточки перетаскиваются мышью или пальцем; можно и без перетаскивания: нажмите карточку, затем место, куда её поставить.",
 "grades": [
  {
   "min": 17,
   "mark": 5,
   "label": "отлично"
  },
  {
   "min": 13,
   "mark": 4,
   "label": "хорошо"
  },
  {
   "min": 9,
   "mark": 3,
   "label": "удовлетворительно"
  },
  {
   "min": 0,
   "mark": 2,
   "label": "неудовлетворительно"
  }
 ],
 "questions": [
  {
   "id": "q01",
   "topic": "Тема 4 · маршрут настройки",
   "type": "order",
   "text": "Расставьте шаги по порядку: от пустого Google-аккаунта до сайта, который отправляет данные. Первый шаг — сверху.",
   "items": [
    "Войти в Google-аккаунт на analytics.google.com",
    "Создать аккаунт Analytics — верхний уровень структуры",
    "Создать ресурс Property: название, часовой пояс, валюта",
    "Создать веб-поток данных и указать адрес сайта",
    "Скопировать Measurement ID вида <code>G-XXXXXXXXXX</code>",
    "Вставить код Google Tag в <code>&lt;head&gt;</code> страниц сайта"
   ]
  },
  {
   "id": "q02",
   "topic": "Тема 4 · уровни структуры",
   "type": "sort",
   "text": "Разложите настройки по уровню, на котором их задают.",
   "items": [
    "Часовой пояс отчётов",
    "Валюта денежных показателей",
    "Сфера деятельности и размер организации",
    "Адрес сайта — Website URL",
    "Идентификатор <code>G-XXXXXXXXXX</code>",
    "Улучшенная статистика — Enhanced measurement"
   ],
   "buckets": [
    "Ресурс · Property",
    "Веб-поток · Web Data Stream"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 330\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"три уровня: аккаунт, ресурс, поток данных\"><rect x=\"0\" y=\"0\" width=\"640\" height=\"330\" fill=\"#fff\"/><rect x=\"40\" y=\"14\" width=\"560\" height=\"84\" fill=\"#fff\" stroke=\"#087f73\" stroke-width=\"3\"/><text x=\"58\" y=\"42\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" letter-spacing=\"1.5\" fill=\"#087f73\">АККАУНТ ANALYTICS</text><text x=\"58\" y=\"70\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#0c2733\">ByteCamp</text><text x=\"58\" y=\"89\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">кому принадлежит аналитика</text><line x1=\"320.0\" y1=\"98\" x2=\"320.0\" y2=\"118\" stroke=\"#0c2733\" stroke-width=\"3\"/><polygon points=\"313.0,112 327.0,112 320.0,122\" fill=\"#0c2733\"/><rect x=\"66\" y=\"118\" width=\"508\" height=\"84\" fill=\"#fff\" stroke=\"#0c2733\" stroke-width=\"3\"/><text x=\"84\" y=\"146\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" letter-spacing=\"1.5\" fill=\"#0c2733\">РЕСУРС · PROPERTY</text><text x=\"84\" y=\"174\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#0c2733\">ByteCamp Website</text><text x=\"84\" y=\"193\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">данные какого проекта смотрим</text><line x1=\"320.0\" y1=\"202\" x2=\"320.0\" y2=\"222\" stroke=\"#0c2733\" stroke-width=\"3\"/><polygon points=\"313.0,216 327.0,216 320.0,226\" fill=\"#0c2733\"/><rect x=\"92\" y=\"222\" width=\"456\" height=\"84\" fill=\"#fff\" stroke=\"#a4620f\" stroke-width=\"3\"/><text x=\"110\" y=\"250\" font-family=\"Roboto Mono,monospace\" font-size=\"12\" letter-spacing=\"1.5\" fill=\"#a4620f\">ПОТОК ДАННЫХ · WEB</text><text x=\"110\" y=\"278\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#0c2733\">bytecamp.ru</text><text x=\"110\" y=\"297\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">откуда приходят данные</text></svg>",
    "caption": "три уровня: аккаунт, ресурс, поток данных"
   }
  },
  {
   "id": "q03",
   "topic": "Тема 4 · идентификаторы потока",
   "type": "single",
   "text": "На снимке — сведения о веб-потоке. Какое значение с этого экрана нужно, чтобы подключить сайт к GA4 через Google Tag?",
   "options": [
    "<code>G-2CNN55NJF7</code> — идентификатор потока данных",
    "<code>15744428303</code> — числовой идентификатор потока",
    "<code>https://bytecamp.ru</code> — URL потока",
    "<code>ByteCamp Website</code> — название потока"
   ],
   "image": {
    "src": "shots/stream-details.png",
    "caption": "сведения о потоке в интерфейсе GA4"
   }
  },
  {
   "id": "q04",
   "topic": "Тема 4 · что верно о структуре",
   "type": "multi",
   "text": "Какие утверждения о структуре Google Analytics верны? Отметьте все.",
   "options": [
    "Аккаунт Analytics объединяет ресурсы одного владельца или организации",
    "Внутри ресурса собираются события и отчёты проекта",
    "Поток данных — это сайт или мобильное приложение",
    "Каждой странице сайта нужен свой поток",
    "Идентификатор потока выдаётся заново после каждой публикации сайта на Vercel"
   ]
  },
  {
   "id": "q05",
   "topic": "Тема 5 · публикация изменения",
   "type": "order",
   "text": "Вы добавили код Google Tag в файлы проекта. Расставьте дальнейшие действия по порядку, чтобы изменение оказалось на опубликованном сайте.",
   "items": [
    "Сохранить изменённые файлы в VS Code",
    "Открыть Source Control и посмотреть список изменений",
    "Написать сообщение и нажать Commit",
    "Отправить изменения в GitHub: Sync Changes или Push",
    "Дождаться нового Deployment в Vercel",
    "Открыть Production-адрес и проверить страницу"
   ]
  },
  {
   "id": "q06",
   "topic": "Тема 5 · настройка проекта Vercel",
   "type": "single",
   "text": "На снимке — настройка проекта Vercel перед первой публикацией. Почему для учебного сайта выбран пресет <code>Other</code>, а Build Command остаётся пустой?",
   "options": [
    "Проект состоит из готовых HTML, CSS и JavaScript, собирать перед публикацией нечего",
    "Пресет <code>Other</code> отключает автоматическую публикацию из GitHub и экономит лимиты",
    "Пресет отвечает за язык интерфейса Vercel и к файлам проекта отношения не имеет",
    "Пустая Build Command означает, что Vercel соберёт проект настройками React по умолчанию"
   ],
   "image": {
    "src": "shots/vercel-preset.png",
    "caption": "импорт репозитория и выбор пресета в Vercel"
   }
  },
  {
   "id": "q07",
   "topic": "Тема 5 · поток после смены адреса",
   "type": "single",
   "text": "На снимке — сведения о веб-потоке сразу после того, как в нём заменили адрес сайта на адрес своего проекта. Какой вывод по этому экрану верен?",
   "options": [
    "Адрес потока обновлён, идентификатор прежний, но данные с сайта пока не поступают",
    "Адрес потока обновлён, поэтому GA4 уже получает просмотры страниц этого сайта",
    "После смены адреса GA4 выдал новый идентификатор, и тег на сайте нужно заменить",
    "Предупреждение вверху означает, что поток создан с ошибкой и его нужно создать заново"
   ],
   "image": {
    "src": "shots/stream-updated.png",
    "caption": "веб-поток с новым адресом сайта"
   }
  },
  {
   "id": "q08",
   "topic": "Тема 5 · место тега в разметке",
   "type": "line",
   "text": "Щёлкните строку, сразу после которой вставляют код Google Tag.",
   "code": "<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>GA4 Analytics Lab</title>\n    <link rel=\"stylesheet\" href=\"css/style.css\">\n</head>\n<body>\n    <h1>GA4 Analytics Lab</h1>\n</body>\n</html>",
   "file": "index.html",
   "lang": "HTML"
  },
  {
   "id": "q09",
   "topic": "Тема 5 · кто за что отвечает",
   "type": "slots",
   "text": "Подставьте инструмент к его роли в цепочке проекта.",
   "chips": [
    "VS Code",
    "GitHub",
    "Vercel",
    "Google Tag",
    "GA4",
    "UTM-метка"
   ],
   "slots": [
    "редактируем файлы проекта",
    "храним историю изменений",
    "публикуем сайт в интернете",
    "отправляет данные со страницы",
    "принимает и показывает данные",
    "описывает источник перехода"
   ]
  },
  {
   "id": "q10",
   "topic": "Тема 5 · Realtime пустой",
   "type": "multi",
   "text": "Сайт открыт в соседней вкладке, но в Realtime ничего не появляется. Какие причины из списка проверки это объясняют? Отметьте все.",
   "options": [
    "Тег вставлен только в <code>index.html</code>, а открыта <code>about.html</code>",
    "Файлы сохранены, но коммит и Push не сделаны — опубликована прежняя версия",
    "Данные в отчётах GA4 появляются через сутки",
    "В ресурсе выбран другой часовой пояс, поэтому отчёт показывает другие сутки",
    "Событие не отмечено как ключевое, поэтому отчёт его пока не показывает"
   ]
  },
  {
   "id": "q11",
   "topic": "Тема 6 · откуда берётся событие",
   "type": "sort",
   "text": "Разложите события по способу, которым они попадают в GA4 на учебном проекте.",
   "items": [
    "прокрутка страницы до конца — <code>scroll</code>",
    "переход по ссылке на другой домен — <code>click</code>",
    "скачивание PDF по ссылке — <code>file_download</code>",
    "начало заполнения формы — <code>form_start</code>",
    "заявка как ценное действие — <code>generate_lead</code>",
    "нажатие кнопки «Посмотреть программу» — <code>cta_click</code>"
   ],
   "buckets": [
    "Собирает улучшенная статистика",
    "Отправляем сами через gtag()"
   ]
  },
  {
   "id": "q12",
   "topic": "Тема 6 · что считается кликом",
   "type": "single",
   "text": "На снимке открыты настройки улучшенной статистики. Посетитель нажал на странице сайта внутреннюю кнопку «Посмотреть программу». Появится ли событие <code>click</code>?",
   "options": [
    "Нет: в улучшенной статистике <code>click</code> — это переход по ссылке на другой домен",
    "Да: учитывается любое нажатие на странице",
    "Да, но только если кнопка ведёт на другую страницу этого же сайта",
    "Нет: на снимке исходящие клики выключены, поэтому их сначала нужно включить"
   ],
   "image": {
    "src": "shots/enhanced-measurement.png",
    "caption": "настройки улучшенной статистики"
   }
  },
  {
   "id": "q13",
   "topic": "Тема 6 · порог прокрутки",
   "type": "number",
   "text": "При включённой улучшенной статистике событие <code>scroll</code> отправляется, когда посетитель впервые доходит примерно до определённой глубины страницы. Какой это процент?",
   "unit": "%"
  },
  {
   "id": "q14",
   "topic": "Тема 6 · событие и его параметр",
   "type": "slots",
   "text": "Подставьте к каждому событию параметр, который приходит вместе с ним.",
   "chips": [
    "page_location",
    "link_domain",
    "file_extension",
    "lead_source",
    "button_name"
   ],
   "slots": [
    "page_view",
    "click по внешней ссылке",
    "file_download",
    "generate_lead из формы проекта",
    "cta_click"
   ]
  },
  {
   "id": "q15",
   "topic": "Тема 6 · данные в параметрах",
   "type": "line",
   "text": "Щёлкните строку, которой в этом коде быть не должно.",
   "code": "const leadForm = document.querySelector('#lead-form');\n\nif (leadForm) {\n    leadForm.addEventListener('submit', (event) => {\n        event.preventDefault();\n\n        gtag('event', 'generate_lead', {\n            lead_source: 'contact_form',\n            user_email: leadForm.email.value\n        });\n    });\n}",
   "file": "js/script.js",
   "lang": "JavaScript"
  },
  {
   "id": "q16",
   "topic": "Тема 6 · чтение отчёта Realtime",
   "type": "single",
   "text": "На снимке — Realtime после визита на учебный сайт. Какое утверждение по этому экрану верно?",
   "options": [
    "Данные приходят, но события <code>form_submit</code> в списке нет — только <code>form_start</code>",
    "Заявка дошла: получены и <code>form_start</code>, и <code>form_submit</code>",
    "Ключевых событий нет, значит GA4 не получает с сайта никаких данных",
    "Значение 2 у <code>page_view</code> означает, что сайт открывали два разных посетителя"
   ],
   "image": {
    "src": "shots/realtime-events.png",
    "caption": "события в отчёте в реальном времени"
   }
  },
  {
   "id": "q17",
   "topic": "Тема 6 · проверка в DebugView",
   "type": "single",
   "text": "На снимке — DebugView с раскрытым событием. Что подтверждает этот экран?",
   "options": [
    "Событие <code>generate_lead</code> дошло вместе с параметром <code>lead_source</code> = <code>contact_form</code>",
    "Параметр <code>lead_source</code> зарегистрирован как специальный параметр и виден в отчётах",
    "Событие <code>generate_lead</code> отмечено ключевым: справа у него стоит значение 1",
    "Заявка принята сервером сайта, письмо получателю отправлено"
   ],
   "image": {
    "src": "shots/debugview-lead.png",
    "caption": "раскрытое событие в DebugView"
   }
  },
  {
   "id": "q18",
   "topic": "Тема 6 · имена собственных событий",
   "type": "multi",
   "text": "Какие имена подходят для собственного события GA4? Отметьте все.",
   "options": [
    "<code>cta_click</code>",
    "<code>course_card_open</code>",
    "<code>ClickButton</code>",
    "<code>test123</code>",
    "<code>project-demo-open</code>"
   ]
  },
  {
   "id": "q19",
   "topic": "Тема 6 · ключевое событие",
   "type": "single",
   "text": "На схеме — учебная воронка проекта за период. Событие <code>generate_lead</code> отметили как ключевое. Что это меняет?",
   "options": [
    "В отчётах GA4 выделит его как важное действие, код сайта менять не нужно",
    "GA4 начнёт собирать <code>generate_lead</code> сам, обработчик формы из <code>script.js</code> можно удалить",
    "Все события ниже <code>cta_click</code> в воронке тоже станут ключевыми",
    "Ключевыми отмечают только рекомендуемые имена Google, свои нельзя"
   ],
   "image": {
    "svg": "<svg viewBox=\"0 0 640 306\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"воронка: page_view 1000, cta_click 300, form_start 120, generate_lead 80\"><rect x=\"0\" y=\"0\" width=\"640\" height=\"306\" fill=\"#fff\"/><text x=\"176\" y=\"63\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#0c2733\">page_view</text><rect x=\"190\" y=\"30\" width=\"410.0\" height=\"52\" fill=\"#087f73\" stroke=\"#0c2733\" stroke-width=\"2\"/><text x=\"204\" y=\"64\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#fff\">1000</text><text x=\"176\" y=\"137\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#0c2733\">cta_click</text><rect x=\"190\" y=\"104\" width=\"123.0\" height=\"52\" fill=\"#087f73\" stroke=\"#0c2733\" stroke-width=\"2\"/><text x=\"204\" y=\"138\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#fff\">300</text><text x=\"626\" y=\"137\" text-anchor=\"end\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">30 % от шага выше</text><text x=\"176\" y=\"211\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#0c2733\">form_start</text><rect x=\"190\" y=\"178\" width=\"58.0\" height=\"52\" fill=\"#087f73\" stroke=\"#0c2733\" stroke-width=\"2\"/><text x=\"204\" y=\"212\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#fff\">120</text><text x=\"626\" y=\"211\" text-anchor=\"end\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">40 % от шага выше</text><text x=\"176\" y=\"285\" text-anchor=\"end\" font-family=\"Roboto Mono,monospace\" font-size=\"15\" fill=\"#0c2733\">generate_lead</text><rect x=\"190\" y=\"252\" width=\"58.0\" height=\"52\" fill=\"#a4620f\" stroke=\"#0c2733\" stroke-width=\"2\"/><text x=\"204\" y=\"286\" font-family=\"Space Grotesk,Inter,sans-serif\" font-size=\"22\" font-weight=\"700\" fill=\"#fff\">80</text><text x=\"626\" y=\"285\" text-anchor=\"end\" font-family=\"Inter,sans-serif\" font-size=\"13\" fill=\"#4d6470\">67 % от шага выше</text></svg>",
    "caption": "события учебного проекта за период"
   }
  },
  {
   "id": "q20",
   "topic": "Тема 6 · специальные параметры в отчёте",
   "type": "single",
   "text": "На снимке — карточка разреза Button name в отчёте по событию <code>cta_click</code>. Почему часть значений показана как <code>(not set)</code>?",
   "options": [
    "Эти срабатывания пришли раньше, чем разрез зарегистрировали",
    "Так отмечены события из режима отладки: в отчёт они не попадают",
    "Разрез создан с областью «Пользователь» вместо «Событие»",
    "Значения появятся, когда событие отметят ключевым"
   ],
   "image": {
    "src": "shots/dimension-notset.png",
    "caption": "разрез Button name в отчёте по событию"
   }
  }
 ]
};

const SECRET = "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";

let SECRET_CACHE = null;
async function secretData() {
  if (SECRET_CACHE) return SECRET_CACHE;
  const pad = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(QUIZ.salt)));
  const bytes = Uint8Array.from(atob(SECRET), c => c.charCodeAt(0)).map((b, i) => b ^ pad[i % pad.length]);
  SECRET_CACHE = JSON.parse(new TextDecoder().decode(bytes));
  return SECRET_CACHE;
}

async function shortHash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/* Приводит ответ к форме ключа. Пустой или неполный ответ даёт null. */
function normalized(q, a) {
  if (a == null) return null;
  switch (q.type) {
    case 'single': case 'multi': case 'line':
      return a.length ? [...a].sort((x, y) => x - y) : null;
    case 'order':
      return a.length ? a : null;
    case 'slots': case 'sort':
      return a.every(x => x !== null && x !== undefined) ? a : null;
    case 'number': {
      const s = String(a).replace(/\s/g, '').replace(',', '.').replace('%', '');
      return s !== '' && isFinite(Number(s)) ? [Number(s)] : null;
    }
  }
  return null;
}

async function isCorrect(q, a) {
  const norm = normalized(q, a);
  if (!norm) return false;
  const key = (await secretData())[q.id].key;
  return JSON.stringify(norm) === JSON.stringify(key);
}

/* Ответ в коде результата: строка на вопрос. Номера — одной цифрой, пусто — x. */
function encodeAnswer(q, a) {
  if (a == null) return '';
  if (q.type === 'number') return String(a).replace(/[^0-9.,\-]/g, '').slice(0, 12);
  if (q.type === 'slots' || q.type === 'sort') return a.map(x => (x === null || x === undefined) ? 'x' : String(x)).join('');
  return a.join('');
}

function decodeAnswer(q, s) {
  s = s || '';
  if (q.type === 'number') return s === '' ? null : s;
  if (s === '') return null;
  const parts = s.split('');
  if (q.type === 'slots' || q.type === 'sort') return parts.map(c => c === 'x' ? null : Number(c));
  return parts.map(Number);
}

function gradeFor(score) {
  return QUIZ.grades.find(g => score >= g.min) || QUIZ.grades[QUIZ.grades.length - 1];
}
