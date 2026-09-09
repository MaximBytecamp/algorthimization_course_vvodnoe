# Скриншоты первой пары

Все 13 мест заполнены настоящими кадрами. Учебные HTML-макеты остались в коде и
возвращаются кнопкой «Вернуть макет», если под рукой нет изображений.

## Что и откуда снято

| Слайд | Файл | Что на кадре | Источник |
|---|---|---|---|
| 3 | 03-bad-project.png | `src/main.py`, `.env`, `database.sql`; нет README, docs/, `.env.example` | VS Code, учебный проект |
| 6 | 06-good-project.png | README, CHANGELOG, `.env.example`, docs/ из пяти документов | VS Code, учебный проект |
| 7 | 07-customer-task.png | Задача заказчика: «удобно», «быстро», «хорошая безопасность» | Markdown Preview, учебный текст |
| 14 | 14-verification-table.png | Таблица «Требование / Метод проверки / Результат» | Markdown Preview, учебный документ |
| 19 | 19-openapi-specification.png | OpenAPI Specification v3.1.1, опубликована 24.10.2024 | spec.openapis.org |
| 20 | 20-readme.png | README: Installation, Configuration, Usage, API, Tests | VS Code, учебный проект |
| 21 | 21-readme-doc-links.png | Тот же README в предпросмотре, разделы и ссылки на docs/ | Markdown Preview |
| 22 | 22-github-repository.png | docs/, README.md, CHANGELOG.md, 1 523 коммита | GitHub, открытый репозиторий encode/httpx |
| 23 | 23-outdated-readme.png | `pyproject.toml` требует Python 3.13, README обещает 3.10 и PostgreSQL 14 | VS Code, учебный проект |
| 27 | 27-iso-25010.png | ISO/IEC 25010:2023, Product quality model, издание 2 | iso.org |
| 30 | 30-booking-service.png | booking-service, который аудируют на паре | VS Code, учебный проект |
| 32 | 32-audit-template.png | Шаблон `docs/handoff_audit.md` с пятью разделами | VS Code |
| 34 | 34-audit-result.png | Раздел «Итог», статус NOT READY с обоснованием | Markdown Preview |

Кадры сняты 9 сентября 2026 года. Кадры VS Code сделаны в веб-версии редактора
(`code serve-web`) на настоящих файлах учебного проекта; баннер режима ограниченного
доверия обрезан сверху. Кадры iso.org и spec.openapis.org — снимки официальных страниц.
Кадр GitHub — чужой открытый репозиторий encode/httpx, а не проект курса: он взят потому,
что в нём действительно есть docs/, README.md, CHANGELOG.md и длинная история коммитов.
Значения из `.env` на кадрах не показаны, переписка заказчика обезличена.

## Заменить кадр своим

Нажмите «Подставить скриншот» под изображением: PNG, JPEG или WebP до 20 МБ покажется
локально до перезагрузки страницы. «Вернуть макет» возвращает исходный кадр.
Клик по изображению открывает увеличение.

Для постоянной замены положите файл в эту папку и поправьте объект `screenshotFiles`
в начале `content.js`:

```javascript
const screenshotFiles = {
  3: {file: 'shots/03-bad-project.png', caption: 'VS Code · учебный проект · дата снимка'}
};
```
