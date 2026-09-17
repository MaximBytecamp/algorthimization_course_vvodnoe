# Список скриншотов · Тема 6

Всего: **52**. Каждый файл вставляется на одноимённый слайд автоматически после команды `node build.mjs`. До съёмки на слайде видна пустая рамка. Снимать личный учебный проект; скрыть аккаунт, почту и другие личные данные. Интерфейс должен показывать указанный результат, а не только открытый раздел.

## Отчёты и разрезы

<a id="slide-150"></a>

- [ ] **150. Параметр есть, а в отчёте его нет** — GA4 → Отчёты → Взаимодействие → События: список имён событий, параметров в таблице нет.
  - Файл: `shots/150-shot.png`

<a id="slide-237"></a>

- [ ] **237. Что настроено и где пригодится** — GA4: карточки Button name и Page section на странице события cta_click; (not set) — события до регистрации.
  - Файл: `shots/237-shot.png`
## Рабочий цикл публикации

<a id="slide-201"></a>

- [ ] **201. Шаг A. Скопировать адрес репозитория** — GitHub: кнопка Code, вкладка HTTPS и скопированный адрес репозитория.
  - Файл: `shots/201-shot.png`

<a id="slide-202"></a>

- [ ] **202. Шаг B. Склонировать проект** — VS Code: команда Git: Clone и поле для адреса репозитория.
  - Файл: `shots/202-shot.png`

<a id="slide-203"></a>

- [ ] **203. Шаг C. Открыть нужный файл** — VS Code Explorer: файлы склонированного проекта, открыт index.html.
  - Файл: `shots/203-shot.png`

<a id="slide-204"></a>

- [ ] **204. Шаг D. Изменить и сохранить** — VS Code: изменение сохранено, метка M у файла в Explorer.
  - Файл: `shots/204-shot.png`

<a id="slide-205"></a>

- [ ] **205. Шаг E. Посмотреть изменения** — VS Code Source Control: список изменённых файлов и сравнение версий.
  - Файл: `shots/205-shot.png`

<a id="slide-206"></a>

- [ ] **206. Шаг F. Сделать commit** — VS Code: сообщение коммита и кнопка Commit.
  - Файл: `shots/206-shot.png`

<a id="slide-207"></a>

- [ ] **207. Шаг G. Отправить в GitHub** — VS Code: кнопка Sync Changes после коммита.
  - Файл: `shots/207-shot.png`

<a id="slide-208"></a>

- [ ] **208. Шаг H. Проверить коммит на GitHub** — GitHub: новый коммит в истории репозитория.
  - Файл: `shots/208-shot.png`

<a id="slide-209"></a>

- [ ] **209. Шаг I. Дождаться деплоя** — Vercel Deployments: коммит со статусами Ready и Production.
  - Файл: `shots/209-shot.png`

<a id="slide-210"></a>

- [ ] **210. Шаг J. Открыть обновлённый сайт** — Production-сайт: изменение видно на опубликованной странице.
  - Файл: `shots/210-shot.png`
## Tag Assistant и DebugView: переходы

<a id="slide-220"></a>

- [ ] **220. Шаг 26. Открыть Tag Assistant** — Tag Assistant: список доменов и кнопка «Добавить домен».
  - Файл: `shots/220-shot.png`

<a id="slide-221"></a>

- [ ] **221. Шаг 27. Подключить свой сайт** — Tag Assistant: окно подключения с введённым Production URL.
  - Файл: `shots/221-shot.png`

<a id="slide-222"></a>

- [ ] **222. Вкладка отладки** — Вкладка отладки: адрес с gtm_debug и плашка «Tag Assistant подключен».
  - Файл: `shots/222-shot.png`

<a id="slide-226"></a>

- [ ] **226. Что видно в Tag Assistant** — Tag Assistant: список сообщений и объект параметров события cta_click.
  - Файл: `shots/226-shot.png`

<a id="slide-223"></a>

- [ ] **223. Шаг 28. Открыть DebugView** — GA4: путь Администратор → Просмотр данных → DebugView.
  - Файл: `shots/223-shot.png`

<a id="slide-224"></a>

- [ ] **224. Из чего состоит экран DebugView** — GA4 DebugView: минуты слева, лента секунд в центре, верхние события справа.
  - Файл: `shots/224-shot.png`

<a id="slide-225"></a>

- [ ] **225. Действие на сайте → событие в ленте** — Нажатие CTA на сайте и событие cta_click в ленте DebugView.
  - Файл: `shots/225-shot.png`
## GA4 и Tag Assistant

<a id="slide-95"></a>

- [ ] **95. Шаг 1. Открыть Enhanced Measurement** — GA4: данные веб-потока — URL проекта, Measurement ID и блок Enhanced Measurement.
  - Файл: `shots/95-shot.png`

<a id="slide-96"></a>

- [ ] **96. Часть событий можно получать без кода** — GA4: блок Enhanced Measurement; переключатель находится в положении On.
  - Файл: `shots/96-shot.png`

<a id="slide-97"></a>

- [ ] **97. Шаг 2. Посмотреть автоматические измерения** — GA4: открытая панель Enhanced Measurement со списком автоматических измерений.
  - Файл: `shots/97-shot.png`

<a id="slide-101"></a>

- [ ] **101. Шаг 3. Прокрутить страницу** — GA4 Realtime: в списке событий видно scroll после прокрутки длинной страницы.
  - Файл: `shots/101-shot.png`

<a id="slide-104"></a>

- [ ] **104. Шаг 5. Нажать внешнюю ссылку** — GA4 Realtime: событие click после перехода по внешней ссылке.
  - Файл: `shots/104-shot.png`

<a id="slide-109"></a>

- [ ] **109. Шаг 8. Скачать файл** — GA4 Realtime: событие file_download после нажатия ссылки на PDF.
  - Файл: `shots/109-shot.png`

<a id="slide-112"></a>

- [ ] **112. Шаг 9. Form interactions** — GA4: в настройках Enhanced Measurement включён пункт Form interactions.
  - Файл: `shots/112-shot.png`

<a id="slide-115"></a>

- [ ] **115. Шаг 10. Начать заполнять форму** — GA4 Realtime: событие form_start после первого взаимодействия с формой.
  - Файл: `shots/115-shot.png`

<a id="slide-116"></a>

- [ ] **116. Шаг 11. Отправить форму** — GA4 Realtime после отправки учебной формы: form_start получен, form_submit не появился.
  - Файл: `shots/116-shot.png`

<a id="slide-131"></a>

- [ ] **131. Шаг 20. Найти generate_lead** — GA4 Realtime: событие generate_lead после отправки формы.
  - Файл: `shots/131-shot.png`

<a id="slide-140"></a>

- [ ] **140. Шаг 25. Нажать кнопку** — GA4 Realtime: событие cta_click после одного нажатия кнопки.
  - Файл: `shots/140-shot.png`

<a id="slide-143"></a>

- [ ] **143. Шаг 26. Google Tag Assistant** — Google Tag Assistant: подключён Production URL учебного сайта.
  - Файл: `shots/143-shot.png`

<a id="slide-144"></a>

- [ ] **144. Шаг 27. Admin → DebugView** — GA4 DebugView: открыт экран, выбрано своё debug-устройство.
  - Файл: `shots/144-shot.png`

<a id="slide-145"></a>

- [ ] **145. События почти по секундам** — GA4 DebugView: в ленте видна последовательность событий тестового визита.
  - Файл: `shots/145-shot.png`

<a id="slide-146"></a>

- [ ] **146. Шаг 28. Открыть событие** — GA4 DebugView: раскрыто событие generate_lead.
  - Файл: `shots/146-shot.png`

<a id="slide-147"></a>

- [ ] **147. Параметр дошёл?** — GA4 DebugView: у generate_lead виден lead_source=contact_form.
  - Файл: `shots/147-shot.png`

<a id="slide-148"></a>

- [ ] **148. Шаг 29. Проверить Custom Event** — GA4 DebugView: у cta_click видны button_name=program и page_section=hero.
  - Файл: `shots/148-shot.png`

<a id="slide-151"></a>

- [ ] **151. Шаг 30. Admin → Custom definitions** — GA4 Custom definitions: открыт список и кнопка создания определения.
  - Файл: `shots/151-shot.png`

<a id="slide-152"></a>

- [ ] **152. Шаг 31. Создать Event-scoped Dimension** — GA4 Create custom dimension: Event scope и параметр button_name.
  - Файл: `shots/152-shot.png`

<a id="slide-153"></a>

- [ ] **153. Шаг 32. Второй параметр** — GA4 Create custom dimension: Event scope и параметр page_section.
  - Файл: `shots/153-shot.png`

<a id="slide-157"></a>

- [ ] **157. Шаг 33. Admin → Events** — GA4 Events: в списке найдено событие generate_lead.
  - Файл: `shots/157-shot.png`

<a id="slide-158"></a>

- [ ] **158. Шаг 34. Mark as key event** — GA4 Events: generate_lead отмечено как Key Event.
  - Файл: `shots/158-shot.png`

<a id="slide-160"></a>

- [ ] **160. Шаг 35. Отправить ещё одну форму** — GA4 Realtime: новое generate_lead после настройки Key Event.
  - Файл: `shots/160-shot.png`
## Публикация и сайт

<a id="slide-129"></a>

- [ ] **129. Шаг 18. Проверить Deployment** — Vercel Deployments: нужный коммит имеет статусы Ready и Production.
  - Файл: `shots/129-shot.png`

<a id="slide-130"></a>

- [ ] **130. Шаг 19. Отправить тестовую заявку** — Production-сайт: форма Contacts после одной успешной учебной отправки; виден URL.
  - Файл: `shots/130-shot.png`

<a id="slide-139"></a>

- [ ] **139. Шаг 24. Отправить изменения** — Source Control и Vercel: коммит CTA опубликован, deployment Ready.
  - Файл: `shots/139-shot.png`
## Редактор и код

<a id="slide-103"></a>

- [ ] **103. Шаг 4. Найти внешнюю ссылку** — VS Code: внешняя ссылка на GitHub в index.html, видны href и target.
  - Файл: `shots/103-shot.png`

<a id="slide-107"></a>

- [ ] **107. Шаг 6. Подготовить PDF для скачивания** — VS Code Explorer: файл assets/analytics-guide.pdf находится в проекте.
  - Файл: `shots/107-shot.png`

<a id="slide-108"></a>

- [ ] **108. Шаг 7. Создать кнопку скачивания** — VS Code: HTML-ссылка на analytics-guide.pdf с атрибутом download.
  - Файл: `shots/108-shot.png`

<a id="slide-113"></a>

- [ ] **113. На странице должна быть форма** — Форма Contacts в браузере и её HTML с id="lead-form" в VS Code.
  - Файл: `shots/113-shot.png`

<a id="slide-119"></a>

- [ ] **119. Шаг 12. Открыть script.js** — VS Code: открыт js/script.js и найден блок обработки формы.
  - Файл: `shots/119-shot.png`

<a id="slide-128"></a>

- [ ] **128. Шаг 17. Save → Commit → Push** — VS Code Source Control: изменения contacts.html и script.js готовы к коммиту.
  - Файл: `shots/128-shot.png`

<a id="slide-133"></a>

- [ ] **133. Шаг 21. Подготовить HTML** — VS Code: кнопка #program-cta в index.html.
  - Файл: `shots/133-shot.png`
