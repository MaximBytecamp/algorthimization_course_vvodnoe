# ОП.03 · тема 9 · Instagram и ManyChat · 51 кадров

Задание для Claude: пройди учебный сценарий по презентации последовательно. Снимай настоящие интерфейсы Instagram, ManyChat, сайта, Vercel, GA4 и Google Sheets. Не подменяй их нарисованными экранами.

Сохраняй PNG в op03-informacionnye-tehnologii/lessons/09-instagram-manychat/shots/ по точным именам ниже. Ссылки на слайды: index.html#354, index.html#363a и т. д. Колонка «экран» — позиция в презентации; «исходник» — постоянный номер из текста.

Подготовка: прочитай files/README.md, опубликуй guide.html и guide.js в существующем учебном сайте; сверь ID GA4. Используй учебный Professional Instagram и отдельный тестовый аккаунт. Настрой одну публикацию, слово ГАЙД и один Private Reply с Open Website. Все изменения аккаунтов и публикации выполняй в согласованном учебном стенде. Пароли, коды входа, чужие переписки и персональные данные в кадр не включай.

До первого комментария проверь Live и работающую ссылку. Для этой публикации тестовый пользователь ещё не должен был комментировать. Один тест: комментарий → DM → материал → кнопка на сайте → форма → событие GA4 → новая строка Sheets. Не заменяй проверку сохранения заявки одним событием generate_lead.

Кадры дополнительных веток 428a/430a нужны только после выполнения дополнительного задания; остальные снимаются по основному маршруту. Для широких интерфейсов желательно 1600×1000 или больше, текст читаемый; мобильные экраны сохраняй вертикально. Можно делать несколько кадров в один PNG, если шаг явно просит сравнить два состояния. В evidence.json записывай время, систему, фактический результат и имя файла. Не отмечай captured до сохранения реального кадра.

После добавления PNG выполни node build.mjs в папке темы. Открой каждый кадр в увеличении, проверь соответствие шага и отсутствие секретов.

| Экран | Исходник | PNG | Что снять | Статус |
|---|---|---|---|---|
| 11 | 363a | 363a-shot.png | Редактор существующего сайта: guide.html и guide.js рядом с contacts.html; виден ID веб-потока.  | pending |
| 12 | 363b | 363b-shot.png | Vercel Deployment Ready с новым коммитом и опубликованная /guide.html без 404.  | pending |
| 13 | 363c | 363c-shot.png | guide.html и contacts.html: на обеих страницах одинаковые четыре UTM в адресной строке.  | pending |
| 16 | 366 | 366-shot.png | Instagram:  `Account type and tools`. `Switch to professional account`. | pending |
| 17 | 367 | 367-shot.png | Профиль учебного Instagram после переключения.  | pending |
| 20 | 369a | 369a-shot.png | Экран текущего плана ManyChat: название и лимиты; скрыть платёжные реквизиты.  | pending |
| 21 | 370 | 370-shot.png | Стартовый экран ManyChat.  | pending |
| 22 | 371 | 371-shot.png | ManyChat → Settings → Instagram. Connect. | pending |
| 23 | 371a | 371a-shot.png | Мастер подключения ManyChat: доступные способы входа, выбран подходящий учебному аккаунту.  | pending |
| 24 | 372 | 372-shot.png | Экран выбора Instagram account.  | pending |
| 26 | 373a | 373a-shot.png | Экран разрешений подключения: имя учебного профиля и запрашиваемые права, без секретов.  | pending |
| 27 | 374 | 374-shot.png | Instagram → Connected tools.  | pending |
| 28 | 375 | 375-shot.png | ManyChat Settings → Instagram с подключённым аккаунтом.  | pending |
| 29 | 376 | 376-shot.png | Учебный Post/Reel с подписью ГАЙД перед выбором в ManyChat.  | pending |
| 30 | 376a | 376a-shot.png | Опубликованный учебный Post/Reel: подпись с ГАЙД, комментарии доступны; сохранить ссылку.  | pending |
| 33 | 379 | 379-shot.png | ManyChat Automation.  ManyChat сейчас поддерживает именно такой путь для создания comment-trigger flow.  | pending |
| 34 | 380 | 380-shot.png | Пустой Flow Builder.  | pending |
| 35 | 381 | 381-shot.png | Окно выбора trigger. User comments on your Post or Reel. | pending |
| 36 | 382 | 382-shot.png | Экран выбора типа публикации.  | pending |
| 38 | 384 | 384-shot.png | ManyChat со списком Instagram Posts/Reels.  | pending |
| 39 | 385 | 385-shot.png | Настройка keywords.  | pending |
| 41 | 387 | 387-shot.png | Настройка Public Reply.  | pending |
| 43 | 389 | 389-shot.png | Trigger block после сохранения.  | pending |
| 46 | 392 | 392-shot.png | Добавление Send Message.  | pending |
| 47 | 393 | 393-shot.png | Message Editor.  | pending |
| 49 | 395 | 395-shot.png | Message block → Button.  | pending |
| 56 | 402 | 402-shot.png | Полный URL материала с четырьмя UTM в редакторе, без сокращателя ссылок.  | pending |
| 57 | 403 | 403-shot.png | Настройка кнопки в ManyChat. Полный URL. | pending |
| 58 | 404 | 404-shot.png | Flow Builder целиком.  | pending |
| 60 | 405a | 405a-shot.png | Flow Builder с названием IG · Backend Guide · Reel 01 и настроенной схемой.  | pending |
| 61 | 406 | 406-shot.png | Кнопка Preview.  | pending |
| 63 | 408 | 408-shot.png | Set Live.  ManyChat использует эти действия для публикации текущего Flow.  | pending |
| 64 | 408a | 408a-shot.png | GA4: правильный веб-поток и Form interactions в Enhanced measurement.  | pending |
| 66 | 410 | 410-shot.png | Комментарий под Reel.  | pending |
| 67 | 411 | 411-shot.png | Instagram Post/Reel с комментарием и reply.  | pending |
| 68 | 412 | 412-shot.png | Instagram Direct.  | pending |
| 69 | 413 | 413-shot.png | DM → кнопка.  | pending |
| 70 | 414 | 414-shot.png | Браузер с UTM URL.  | pending |
| 71 | 415 | 415-shot.png | GA4 Realtime.  | pending |
| 73 | 416a | 416a-shot.png | DebugView: page_view → page_location с UTM. Позже отдельный кадр Traffic acquisition с Session source / medium.  | pending |
| 76 | 418a | 418a-shot.png | Страница материала с CTA и открывшаяся форма с сохранёнными UTM.  | pending |
| 77 | 419 | 419-shot.png | Заполненная форма.  | pending |
| 78 | 420 | 420-shot.png | GA4 с `generate_lead`.  | pending |
| 79 | 421 | 421-shot.png | Новая строка Google Sheets.  | pending |
| 80 | 421a | 421a-shot.png | Одна тестовая строка Sheets: request_id, время, backend, new и три UTM; без чужих персональных данных.  | pending |
| 81 | 422 | 422-shot.png | Google Sheets с выделенными UTM.  | pending |
| 88 | 428a | 428a-shot.png | Дополнительный черновик: три обычные кнопки первого DM ведут к трём сообщениям со ссылками.  | pending |
| 91 | 430a | 430a-shot.png | Preview дополнительного сценария: выбранная ветка, её сообщение и соответствующий UTM URL.  | pending |
| 96 | 435 | 435-shot.png | ManyChat → выбранный Specific Post/Reel.  | pending |
| 97 | 436 | 436-shot.png | Automation status.  | pending |
| 98 | 437 | 437-shot.png | Settings → Instagram.  | pending |
