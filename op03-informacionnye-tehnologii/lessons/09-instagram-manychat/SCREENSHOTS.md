# ОП.03 · тема 9 · Instagram и ManyChat · 70 кадров

Задание для Claude: пройди учебный сценарий по презентации последовательно. Снимай настоящие интерфейсы Instagram, ManyChat, сайта, Vercel, GA4 и Google Sheets. Не подменяй их нарисованными экранами.

Сохраняй PNG в op03-informacionnye-tehnologii/lessons/09-instagram-manychat/shots/ по точным именам ниже. Ссылки на слайды: index.html#354, index.html#363a и т. д. Колонка «экран» — позиция в презентации; «исходник» — постоянный номер из текста.

Подготовка: прочитай files/README.md, опубликуй guide.html и guide.js в существующем учебном сайте; сверь ID GA4. Используй учебный Professional Instagram и отдельный тестовый аккаунт. Настрой одну публикацию, слово ГАЙД и один Private Reply с Open Website. Все изменения аккаунтов и публикации выполняй в согласованном учебном стенде. Пароли, коды входа, чужие переписки и персональные данные в кадр не включай.

До первого комментария проверь Live и работающую ссылку. Для этой публикации тестовый пользователь ещё не должен был комментировать. Один тест: комментарий → DM → материал → кнопка на сайте → форма → событие GA4 → новая строка Sheets. Не заменяй проверку сохранения заявки одним событием generate_lead.

Кадры дополнительных веток 428a/430a нужны только после выполнения дополнительного задания; остальные снимаются по основному маршруту. Для широких интерфейсов желательно 1600×1000 или больше, текст читаемый; мобильные экраны сохраняй вертикально. Можно делать несколько кадров в один PNG, если шаг явно просит сравнить два состояния. В evidence.json записывай время, систему, фактический результат и имя файла. Не отмечай captured до сохранения реального кадра.

После добавления PNG выполни node build.mjs в папке темы. Открой каждый кадр в увеличении, проверь соответствие шага и отсутствие секретов.

| Экран | Исходник | PNG | Что снять | Статус |
|---|---|---|---|---|
| 11 | 363a | 363a-shot.png | Редактор существующего сайта: guide.html и guide.js рядом с contacts.html; виден ID веб-потока.  | captured |
| 12 | 363b | 363b-shot.png | Vercel Deployment Ready с новым коммитом и опубликованная /guide.html без 404.  | captured |
| 13 | 363c | 363c-shot.png | guide.html и contacts.html: на обеих страницах одинаковые четыре UTM в адресной строке.  | captured |
| 16 | 366 | 366-shot.png | Instagram:  `Account type and tools`. `Switch to professional account`. | captured |
| 17 | 366a | 366a-shot.png | Мастер переключения: выбран тип «Автор».  | captured |
| 18 | 366b | 366b-shot.png | Экран описания аккаунта автора с кнопкой Далее.  | captured |
| 19 | 366c | 366c-shot.png | Список категорий: выбран «Личный блог».  | captured |
| 20 | 366d | 366d-shot.png | Окно «Переключиться на профессиональный аккаунт?» с кнопкой Продолжить.  | captured |
| 21 | 366e | 366e-shot.png | Экран «Ваш аккаунт автора Instagram готов!».  | captured |
| 22 | 367 | 367-shot.png | Профиль учебного Instagram после переключения.  | captured |
| 26 | 370 | 370-shot.png | Страница регистрации ManyChat: Sign up, почта и вход через Google.  | captured |
| 27 | 370a | 370a-shot.png | ManyChat: экран выбора канала, первая плитка Instagram.  | captured |
| 28 | 371 | 371-shot.png | ManyChat: экран Connect Instagram с кнопкой Connect Via Meta и ссылкой See More Options. See More Options. | captured |
| 29 | 371a | 371a-shot.png | Connect Instagram: раскрыты варианты Connect Via Instagram и Meta Business Suite.  | captured |
| 30 | 372 | 372-shot.png | Окно Instagram: «Manychat-IG запрашивает доступ к tvoya_sreda_live».  | captured |
| 32 | 373a | 373a-shot.png | Окно разрешений Instagram для Manychat-IG.  | captured |
| 33 | 373b | 373b-shot.png | ManyChat: «Your Instagram is connected!» и первый вопрос анкеты.  | captured |
| 34 | 373c | 373c-shot.png | Экран тарифов: Free и кнопка Continue with Free.  | captured |
| 35 | 373d | 373d-shot.png | ManyChat Home после регистрации.  | captured |
| 36 | 374 | 374-shot.png | Instagram → Настройки → Приложения и сайты: Manychat-IG в активных.  | captured |
| 37 | 375 | 375-shot.png | ManyChat Settings → Instagram с подключённым аккаунтом.  | captured |
| 38 | 376 | 376-shot.png | Instagram: открыто меню Создать с пунктом Публикация.  | captured |
| 39 | 376b | 376b-shot.png | Окно создания публикации.  | captured |
| 40 | 376c | 376c-shot.png | Редактор: картинка развёрнута целиком.  | captured |
| 41 | 376d | 376d-shot.png | Экран «Новая публикация»: введена подпись с ГАЙД.  | captured |
| 42 | 376a | 376a-shot.png | Опубликованный учебный Post/Reel: подпись с ГАЙД, комментарии доступны; сохранить ссылку.  | captured |
| 45 | 379 | 379-shot.png | ManyChat Automation.  ManyChat сейчас поддерживает именно такой путь для создания comment-trigger flow.  | captured |
| 46 | 379a | 379a-shot.png | Меню Start From Scratch: пункт Start from a blank canvas.  | captured |
| 47 | 380 | 380-shot.png | Пустой Flow Builder.  | captured |
| 48 | 381 | 381-shot.png | Окно выбора trigger. User comments on your Post or Reel. | captured |
| 49 | 382 | 382-shot.png | Экран выбора типа публикации.  | captured |
| 51 | 384 | 384-shot.png | ManyChat со списком Instagram Posts/Reels.  | captured |
| 52 | 385 | 385-shot.png | Настройка keywords.  | captured |
| 54 | 387 | 387-shot.png | Настройка Public Reply.  | captured |
| 56 | 389 | 389-shot.png | Trigger block после сохранения.  | captured |
| 57 | 389a | 389a-shot.png | Окно Going to leave without saving? с кнопками Keep Editing и Leave.  | captured |
| 60 | 392 | 392-shot.png | Добавление Send Message.  | captured |
| 61 | 393 | 393-shot.png | Message Editor.  | captured |
| 63 | 395 | 395-shot.png | Message block → Button.  | captured |
| 64 | 395a | 395a-shot.png | Edit Button: выбрано действие Open website, поле Website URL пустое.  | captured |
| 71 | 402 | 402-shot.png | Полный URL материала с четырьмя UTM в редакторе, без сокращателя ссылок.  | captured |
| 72 | 403 | 403-shot.png | Настройка кнопки в ManyChat. Полный URL. | captured |
| 73 | 404 | 404-shot.png | Flow Builder целиком.  | captured |
| 75 | 405b | 405b-shot.png | Поле имени automation в режиме редактирования.  | captured |
| 76 | 405a | 405a-shot.png | Flow Builder с названием IG · Backend Guide · Reel 01 и настроенной схемой.  | captured |
| 77 | 406 | 406-shot.png | Кнопка Preview.  | captured |
| 79 | 408 | 408-shot.png | Set Live.  ManyChat использует эти действия для публикации текущего Flow.  | captured |
| 80 | 408a | 408a-shot.png | GA4: правильный веб-поток и Form interactions в Enhanced measurement.  | captured |
| 82 | 410 | 410-shot.png | Комментарий под Reel.  | captured |
| 83 | 411 | 411-shot.png | Instagram Post/Reel с комментарием и reply.  | captured |
| 84 | 412 | 412-shot.png | Instagram Direct.  | captured |
| 85 | 412a | 412a-shot.png | Запрос на переписку: текст Private Reply и кнопки Заблокировать, Удалить, Accept.  | captured |
| 86 | 412b | 412b-shot.png | Окно выбора папки: Основные, Общие, Отмена.  | captured |
| 87 | 412c | 412c-shot.png | Переписка после принятия запроса.  | captured |
| 88 | 413 | 413-shot.png | DM → кнопка.  | pending |
| 89 | 414 | 414-shot.png | Браузер с UTM URL.  | captured |
| 90 | 415 | 415-shot.png | GA4 Realtime.  | captured |
| 92 | 416a | 416a-shot.png | DebugView: page_view → page_location с UTM. Позже отдельный кадр Traffic acquisition с Session source / medium.  | pending |
| 95 | 418a | 418a-shot.png | Страница материала с CTA и открывшаяся форма с сохранёнными UTM.  | captured |
| 96 | 419 | 419-shot.png | Заполненная форма.  | captured |
| 97 | 419a | 419a-shot.png | Форма после отправки с request_id.  | captured |
| 98 | 420 | 420-shot.png | GA4 с `generate_lead`.  | captured |
| 99 | 421 | 421-shot.png | Новая строка Google Sheets.  | captured |
| 100 | 421a | 421a-shot.png | Одна тестовая строка Sheets: request_id, время, backend, new и три UTM; без чужих персональных данных.  | captured |
| 101 | 422 | 422-shot.png | Google Sheets с выделенными UTM.  | captured |
| 108 | 428a | 428a-shot.png | Дополнительный черновик: три обычные кнопки первого DM ведут к трём сообщениям со ссылками.  | pending |
| 111 | 430a | 430a-shot.png | Preview дополнительного сценария: выбранная ветка, её сообщение и соответствующий UTM URL.  | pending |
| 116 | 435 | 435-shot.png | ManyChat → выбранный Specific Post/Reel.  | captured |
| 117 | 436 | 436-shot.png | Automation status.  | captured |
| 118 | 437 | 437-shot.png | Settings → Instagram.  | captured |
