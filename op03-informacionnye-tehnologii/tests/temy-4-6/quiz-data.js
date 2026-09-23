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
    "<code>15744428303</code> — идентификатор потока",
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
    "Внутри ресурса собираются события, отчёты и источники трафика проекта",
    "Поток данных — это источник: сайт, Android- или iOS-приложение",
    "Для каждой страницы сайта создают отдельный веб-поток",
    "Measurement ID выдаётся заново при каждой публикации сайта"
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
    "Проект состоит из готовых HTML, CSS и JavaScript — собирать перед публикацией нечего",
    "Пресет <code>Other</code> отключает автоматическую сборку из GitHub и экономит лимиты",
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
    "Расширение браузера блокирует запросы Google Analytics",
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
    "Нет: здесь <code>click</code> — это переход по ссылке за пределы домена",
    "Да: при включённой улучшенной статистике учитывается любое нажатие на странице",
    "Да, но только если кнопка ведёт на другую страницу этого же сайта",
    "Нет: на снимке исходящие клики выключены, их сначала нужно включить"
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
    "<code>project_demo_open</code>",
    "<code>ClickButton</code>",
    "<code>event_new_final</code>"
   ]
  },
  {
   "id": "q19",
   "topic": "Тема 6 · ключевое событие",
   "type": "single",
   "text": "На схеме — учебная воронка проекта за период. Событие <code>generate_lead</code> отметили как ключевое. Что это меняет?",
   "options": [
    "Код сайта не меняется: <code>generate_lead</code> остаётся событием и дополнительно считается ключевым",
    "GA4 начнёт собирать <code>generate_lead</code> сам, обработчик формы можно удалить",
    "Все события, стоящие в воронке ниже <code>cta_click</code>, тоже станут ключевыми",
    "Отмечать ключевыми можно только рекомендуемые имена Google, собственные — нельзя"
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
    "У этих срабатываний значения нет: разрез не применяется к событиям, пришедшим до его регистрации",
    "Так помечены события, пришедшие из режима отладки, — в обычные отчёты они не попадают",
    "Разрез зарегистрирован с областью «Пользователь» вместо «Событие», и значения не подставились",
    "<code>(not set)</code> показывается до тех пор, пока событие не отмечено ключевым"
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
