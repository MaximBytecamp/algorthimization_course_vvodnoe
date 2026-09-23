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
    "Поток данных описывает источник: сайт или мобильное приложение",
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
    "Realtime обновляет данные раз в сутки",
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
   "text": "Подставьте к каждому событию параметр, который приходит только с ним.",
   "chips": [
    "link_domain",
    "file_extension",
    "lead_source",
    "button_name"
   ],
   "slots": [
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
   "text": "Щёлкните строку, которая отправляет в GA4 то, что отправлять нельзя.",
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
    "Данные приходят, от формы пришло только <code>form_start</code>, <code>form_submit</code> в списке нет",
    "Заявка дошла: получены и <code>form_start</code>, и <code>form_submit</code>",
    "Ключевых событий нет, значит GA4 не получает с сайта никаких данных",
    "Значение 2 у <code>page_view</code> означает, что сайт в это время открывали два посетителя"
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
   "text": "На схеме — учебная воронка проекта за период. Её нижний шаг, событие <code>generate_lead</code>, отметили в настройках ресурса как ключевое. Что это меняет?",
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
    "Эти срабатывания пришли без значения button_name",
    "Так отмечены события из режима отладки: в отчёт они не попадают",
    "Разрез создан с областью «Пользователь»",
    "Значения появятся, когда отметят ключевое событие"
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
