/* Учебный аналог gtag.js для занятия 2. Отличие от стенда занятия 1: из адреса
   вырезается не только utm_source, но и utm_medium с utm_campaign, а первое
   значение запоминается в sessionStorage — чтобы метка не потерялась при переходе
   на вторую страницу сайта. Строка параметров собирается в формате Measurement
   Protocol (GA4, версия 2) — те же поля, что уходят с настоящего сайта.

   Как событие отправляется. Настоящий gtag.js делает POST на
   google-analytics.com/g/collect через navigator.sendBeacon. Учебному стенду это
   не подходит: его открывают через Live Server, «python3 -m http.server» и другие
   раздатчики статики, а они адреса /g/collect не знают и на POST отвечают 404 или
   405 — строки в панели Network краснеют, будто стенд сломан.

   Поэтому стенд отправляет событие запросом картинки: браузер загружает
   прозрачный пиксель 1x1 (g/collect.gif), а все поля события едут в строке
   запроса этой картинки. Так работали счётчики до появления sendBeacon — на
   занятии 1 мы разбирали этот способ под названием «отслеживающий пиксель»,
   и часть рекламных счётчиков пользуется им до сих пор. Файл существует,
   поэтому любой сервер отвечает на такой запрос кодом 200. */
(function () {
  var TID = 'G-4EXAMPLE99';
  // Открытый файлом стенд слать некуда — используем настоящий адрес Google.
  var VIA_FILE = location.protocol === 'file:';
  var ENDPOINT = VIA_FILE
    ? 'https://www.google-analytics.com/g/collect'
    : 'g/collect.gif';

  function rnd(n) { var s = ''; while (s.length < n) s += Math.floor(Math.random() * 36).toString(36); return s; }

  var cid = localStorage.getItem('_ga_cid');
  if (!cid) { cid = Math.floor(Date.now() / 1000) + '.' + Math.floor(1e9 * Math.random()); localStorage.setItem('_ga_cid', cid); }
  var sid = String(Math.floor(Date.now() / 1000));
  var loadTs = performance.now();
  var seq = 0;

  /* ---- разметка перехода ---------------------------------------------------
     Три метки читаются из адресной строки один раз — при первой странице визита.
     Дальше значения берутся из sessionStorage: посетитель уходит с посадочной
     страницы вглубь сайта, метки из адреса пропадают, а источник перехода
     остаётся прежним. Это «первое касание» (first touch) в простейшем виде. */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var NOT_SET = '(not set)';

  function readCampaign() {
    var q = new URLSearchParams(location.search);
    var fromUrl = {}, hasAny = false;
    UTM_KEYS.forEach(function (k) {
      var v = q.get(k);
      if (v !== null && v !== '') { fromUrl[k] = v; hasAny = true; }
    });
    if (hasAny) {
      sessionStorage.setItem('_utm', JSON.stringify(fromUrl));
      return fromUrl;
    }
    try { return JSON.parse(sessionStorage.getItem('_utm')) || {}; } catch (e) { return {}; }
  }

  window.campaign = function () {
    var c = readCampaign();
    return {
      source:   c.utm_source   || NOT_SET,
      medium:   c.utm_medium   || NOT_SET,
      campaign: c.utm_campaign || NOT_SET
    };
  };
  /* Значения метки прямо из адреса, без подстановки из sessionStorage, —
     нужно, чтобы показать разницу между «метка в адресе» и «метка в заявке». */
  window.campaignFromUrl = function () {
    var q = new URLSearchParams(location.search);
    return {
      source:   q.get('utm_source')   || NOT_SET,
      medium:   q.get('utm_medium')   || NOT_SET,
      campaign: q.get('utm_campaign') || NOT_SET
    };
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    var a = arguments;
    window.dataLayer.push(a);
    if (a[0] === 'event') sendCollect(a[1], a[2] || {});
    if (a[0] === 'config') sendCollect('page_view', {});
  };

  function sendCollect(name, params) {
    seq += 1;
    var q = new URLSearchParams();
    q.set('v', '2');
    q.set('tid', TID);
    q.set('gtm', '45je' + rnd(4) + 'v' + (89000 + seq));
    q.set('_p', String(Math.floor(1e9 * Math.random())));
    q.set('cid', cid);
    q.set('ul', (navigator.language || 'ru-ru').toLowerCase());
    q.set('sr', screen.width + 'x' + screen.height);
    q.set('_s', String(seq));
    q.set('sid', sid);
    q.set('sct', '1');
    q.set('seg', '1');
    q.set('dl', location.href);
    if (document.referrer) q.set('dr', document.referrer);
    q.set('dt', document.title);
    q.set('en', name);
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (typeof v === 'number') q.set('epn.' + k, String(v));
      else q.set('ep.' + k, String(v));
    });
    q.set('_et', String(Math.round(performance.now() - loadTs)));
    var url = ENDPOINT + '?' + q.toString();
    if (VIA_FILE) {
      // Настоящий приёмник: как это делает gtag.js на живом сайте.
      if (navigator.sendBeacon) navigator.sendBeacon(url);
      else fetch(url, { method: 'POST', keepalive: true });
    } else {
      // Запрос картинки: параметры события лежат в её адресе.
      new Image().src = url;
    }
  }
})();

/* Событие прокрутки: уходит один раз, когда посетитель добрался до 90 % высоты
   страницы. Настоящий GA4 отправляет scroll по тому же правилу. */
(function () {
  var fired = false;
  addEventListener('scroll', function () {
    var d = document.documentElement;
    var pct = (d.scrollTop + d.clientHeight) / d.scrollHeight;
    if (!fired && pct > 0.85) { fired = true; gtag('event', 'scroll', { percent_scrolled: 90 }); }
  }, { passive: true });
})();
