# Места для реальных скриншотов

В уроке 13 мест, пока заполненных учебными HTML-макетами с явной подписью.
Ни один макет не выдаётся за снимок официального сайта, VS Code или GitHub.

Для временного показа нажмите «Подставить скриншот» под нужным макетом.
PNG, JPEG или WebP до 20 МБ будет показан локально до перезагрузки. «Вернуть макет»
восстанавливает исходный вид. Клик по изображению открывает увеличение.

| Слайд | Рекомендуемое имя | Содержание реального кадра |
|---|---|---|
| 3 | 03-bad-project.png | VS Code: src/, main.py, .env, база; отсутствуют README, docs/, .env.example и инструкции |
| 6 | 06-good-project.png | VS Code: README.md, CHANGELOG.md, .env.example, docs/requirements.md, architecture.md, deployment.md, api.md, user-guide.md |
| 7 | 07-customer-task.png | Задача или обезличенная переписка: «удобно», «быстро», «хорошая безопасность» |
| 14 | 14-verification-table.png | Markdown Preview: Требование / Метод проверки / Результат |
| 19 | 19-openapi-specification.png | Официальный экран https://spec.openapis.org/oas/v3.1.1.html с названием и редакцией |
| 20 | 20-readme.png | README проекта: Installation, Configuration, Usage, API, Tests |
| 21 | 21-readme-doc-links.png | README с теми же разделами и ссылками на подробную документацию |
| 22 | 22-github-repository.png | GitHub: docs/, README.md, CHANGELOG.md и история коммитов |
| 23 | 23-outdated-readme.png | VS Code: Python 3.13 в конфигурации против Python 3.10 в README; PostgreSQL 17 против 14 |
| 27 | 27-iso-25010.png | Официальный экран https://www.iso.org/standard/78176.html: ISO/IEC 25010:2023, название модели качества |
| 30 | 30-booking-service.png | VS Code: проект booking-service для аудита |
| 32 | 32-audit-template.png | VS Code: открытый docs/handoff_audit.md с пятью разделами |
| 34 | 34-audit-result.png | Markdown Preview: итоговый аудит со статусом READY или NOT READY и обоснованием |

Слайды 20–21 используют два независимых места. Итого: 13 файлов / 13 мест
(номера: 3, 6, 7, 14, 19, 20, 21, 22, 23, 27, 30, 32, 34).

## Постоянная замена

Сохраните кадр в этой папке. В начале `content.js` заполните объект `screenshotFiles`:

```javascript
const screenshotFiles = {
  3: {file: 'shots/03-bad-project.png', caption: 'VS Code · учебный проект · дата снимка'},
  19: {file: 'shots/19-openapi-specification.png', caption: 'OpenAPI 3.1.1 · дата снимка'}
};
```

Скрипт автоматически заменит макет изображением и обновит подпись. Увеличение,
временная загрузка и восстановление исходного кадра продолжают работать.

Не показывайте значения из .env. Для переписки используйте обезличенный пример.
Снимайте отдельное читаемое окно; не уменьшайте весь рабочий стол до мелкого текста.
