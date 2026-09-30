# Практика: Instagram → ManyChat → сайт → заявка

1. Возьмите существующий сайт тем 5–7 с contacts.html, GA4 и записью в leads.
2. Скопируйте site/guide.html и site/guide.js в корень репозитория этого сайта. Для другого веб-потока замените публичный ID G-2CNN55NJF7 в guide.html. Проверьте изменения, commit, push, дождитесь Ready в Vercel.
3. Откройте /guide.html по Production URL. Пройдите по ссылке с UTM из messages.md и кнопке к форме: четыре метки должны сохраниться. Пример домена замените своим, если проект отличается.
4. Подключите учебный Professional Instagram к ManyChat, опубликуйте учебный Post/Reel. Выберите Specific Post, ГАЙД, Public Reply, Private Reply с единственной кнопкой Open Website. Используйте тексты messages.md.
5. Preview → Set Live. Отдельный учебный пользователь оставляет первый комментарий под этим постом. Повтор одного и того же пользователя не годится для нового теста.
6. Пройдите TESTS.md; снимите кадры по SCREENSHOTS.md презентации. В итоговом отчёте укажите URL публикации, automation, Production URL, время теста и request_id.

## Что именно готово

Комплект содержит backend-материал и перенос четырёх UTM к существующей форме. Он не публикует сайт, не подключает ManyChat и не меняет Apps Script автоматически. Frontend и Analytics для дополнительного ветвления нужно подготовить отдельно.

Текущая форма сохраняет только utm_source, utm_medium, utm_campaign. utm_content остаётся в URL/GA4. Событие generate_lead в текущем коде отправляется при submit, до подтверждения записи: нужна отдельная проверка строки Sheets. Новая метка не начинает новый сеанс GA4; не путайте First user source и Session source.
