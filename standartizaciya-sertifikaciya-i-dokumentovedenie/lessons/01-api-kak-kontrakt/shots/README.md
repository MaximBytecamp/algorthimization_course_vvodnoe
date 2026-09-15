# Кадры темы 1

Кадры слайдов 1–94 и 114–122 сняты 15 сентября 2026 года, кадры `e-*` для слайдов 95–113 — 16 сентября 2026 года.
Все кадры сняты, 1600×1000, браузер Chromium через Playwright
без входа в аккаунты. Оранжевые рамки добавлены при съёмке и отмечают, куда смотреть;
содержимое страниц не менялось. Единственное вмешательство — кадр 56: JSON
отформатирован так же, как это делает флажок Chrome «Автоформатировать».

Локальные кадры сняты на запущенном `api-standard-template` (`uvicorn app.main:app`).
Страница открыта по адресу `127.0.0.1:8000`, как у студентов; на машине автора порт 8000
был занят, поэтому запросы браузера перенаправлялись на экземпляр того же приложения на 8001.

| Слайд | Файл | Что на кадре | Источник |
|---|---|---|---|
| 18 | 18-rfc9110-methods.png | Раздел 9 «Methods», таблица стандартных методов | rfc-editor.org/rfc/rfc9110 |
| 38 | 38-openapi-specification.png | OpenAPI Specification v3.2.0, определение OAS | spec.openapis.org/oas/v3.2.0 |
| 39 | 38b-openapi-latest.png | Последняя редакция v3.2.1, Published 10 September 2026 | spec.openapis.org/oas/latest |
| 45 | 45-swagger-tags.png | Группа Tickets с описанием | учебный проект, `/docs` |
| 55 | 55-swagger-ui.png | Шапка Service Desk API 1.0.0, OAS 3.1, GET /api/v1/tickets | учебный проект, `/docs` |
| 56 | 56-openapi-json.png | `"openapi": "3.1.0"`, `"info"`, `"paths"` | учебный проект, `/openapi.json` |
| 57 | 57-redoc.png | ReDoc: навигация, операция, примеры ответов | учебный проект, `/redoc` |
| 58 | 58-swagger-metadata.png | title, version, summary, description, contact | учебный проект, `/docs` |
| 59 | 59-swagger-operation.png | Раскрытая операция listTickets | учебный проект, `/docs` |
| 62 | 62-rfc9457-problem-details.png | Раздел 3, пример 403 с application/problem+json | rfc-editor.org/rfc/rfc9457 |
| 64 | 64-swagger-404.png | Try it out → Execute: 404 и тело Problem Details | учебный проект, `/docs` |
| 72 | 72-github-api-versions.png | X-GitHub-Api-Version, версия 2026-03-10 | docs.github.com |
| 79 | 79-spectral-repo.png | Описание Spectral с поддержкой OpenAPI | github.com/stoplightio/spectral |
| 84 | 84-swagger-authorize.png | Окно Authorize, схема BearerAuth | учебный проект, `/docs` |
| 85 | 85-owasp-api-top10.png | OWASP API Security Top 10 2023, API1 BOLA | github.com/OWASP/API-Security |
| 87 | 87-oai-openapi-specification.png | versions, README.md, style-guide.md | github.com/OAI/OpenAPI-Specification |
| 88 | 88-zalando-guidelines.png | Описание репозитория, папка chapters | github.com/zalando/restful-api-guidelines |
| 89 | 89-microsoft-api-guidelines.png | Guidelines.md, azure, graph | github.com/microsoft/api-guidelines |
| 90 | 90-adidas-api-guidelines.png | ruleset.md, adidas-spectral.yaml | github.com/adidas/api-guidelines |
| 91 | 91-github-rest-api-description.png | «An OpenAPI description for GitHub's REST API» | github.com/github/rest-api-description |
| 92 | 92-redocly-openapi-starter.png | Папка openapi: paths, components | github.com/Redocly/openapi-starter |
| 93 | 93-digitalocean-spectral-ruleset.png | spectral/ruleset.yml, severity: error | github.com/digitalocean/openapi |
| 94 | 94-box-openapi.png | openapi.json и папка openapi | github.com/box/box-openapi |
| 119 | 100-swagger-post-201.png | POST /api/v1/tickets → 201, заголовок location | учебный проект, `/docs` |

## Доказательства для слайдов 95–113

Страницы стандартов и файлы компаний. На слайдах часть кадров спрятана в раскрываемый блок
«Доказательство», остальные лежат в папке для `docs/STANDARDS.md` учебного проекта.

| Слайд | Файл | Что на кадре | Источник |
|---|---|---|---|
| 96 | e-pr-kubernetes.png | `/kind api-change`, `/kind deprecation` в шаблоне PR | github.com/kubernetes/kubernetes |
| — | e-pr-oai.png | отметка «schema changes» в шаблоне PR | github.com/OAI/OpenAPI-Specification |
| — | e-pr-azure.png | выбор из трёх шаблонов PR | github.com/Azure/azure-rest-api-specs |
| 97 | e-issue-azure.png | форма с обязательными API Spec link и API Spec version | github.com/Azure/azure-rest-api-specs |
| — | e-issue-kubernetes.png | форма bug-report.yaml | github.com/kubernetes/kubernetes |
| 98 | e-codeowners-oai.png | `/versions/ @oai/tsc` | github.com/OAI/OpenAPI-Specification |
| 98 | e-owners-kubernetes.png | файл OWNERS: reviewers, approvers | github.com/kubernetes/kubernetes |
| — | e-codeowners-azure.png | владельцы спецификаций сервисов | github.com/Azure/azure-rest-api-specs |
| 99 | e-security-azure.png | «Please do not report security vulnerabilities through public GitHub issues.» | github.com/Azure/azure-rest-api-specs |
| — | e-security-vscode.png | короткий SECURITY.md Microsoft | github.com/microsoft/vscode |
| — | e-security-kubernetes.png | SECURITY_CONTACTS | github.com/kubernetes/kubernetes |
| 100 | e-changelog-stripe.png | «This release changes the pinned API version» | github.com/stripe/stripe-node |
| 100 | e-changelog-kubernetes.png | папка CHANGELOG по минорным версиям | github.com/kubernetes/kubernetes |
| — | e-oasdiff-action.png | описание oasdiff-action | github.com/oasdiff/oasdiff-action |
| — | e-rfc9457-type.png | раздел 3.1.1 про адрес type | rfc-editor.org/rfc/rfc9457 |
| 102 | e-site-problem-412.png | страница вида проблемы 412, локальная сборка `scripts/build_docs.py` | учебный проект, `site/` |
| — | e-site-redoc.png | ReDoc 1.1.0, собранный Redocly CLI | учебный проект, `site/` |
| 104 | e-azure-new-field-breaking.png | «Azure defines the addition of a new JSON field in a response to be not backwards compatible» | github.com/Azure/azure-rest-api-specs |
| 105 | e-graph-versioning.png | «`version` can be v1.0 or beta» | github.com/microsoft/api-guidelines |
| — | e-azure-api-version.png | «The api-version query parameter (?api-version=) is required» | github.com/microsoft/api-guidelines |
| 106 | e-swagger-deprecated.png | зачёркнутая операция, заголовки Deprecation и Sunset | учебный проект, `/docs` |
| — | e-rfc9745-deprecation.png | пример `Deprecation: @1688169599` | rfc-editor.org/rfc/rfc9745 |
| — | e-zalando-189-deprecation.png | правило 189 | opensource.zalando.com |
| 107 | e-github-ratelimit-headers.png | x-ratelimit-reset в секундах UTC epoch | docs.github.com |
| — | e-zalando-153-429.png | правило 153 | opensource.zalando.com |
| — | e-ietf-ratelimit-active.png | draft-ietf-httpapi-ratelimit-headers: Active Internet-Draft | datatracker.ietf.org |
| — | e-github-etag.png, e-zalando-182-etag.png | условные запросы у GitHub и Zalando | docs.github.com, opensource.zalando.com |
| 109 | e-ietf-idempotency-expired.png | draft-ietf-httpapi-idempotency-key-header-07: Expired Internet-Draft | datatracker.ietf.org |
| — | e-stripe-idempotency.png, e-zalando-230-idempotency.png | ключ идемпотентности у Stripe и Zalando | docs.stripe.com, opensource.zalando.com |
| 110 | e-zalando-233-flow-id.png | правило 233, X-Flow-ID | opensource.zalando.com |
| — | e-zalando-218-meta.png, e-zalando-116-semver.png | правила 218 и 116 | opensource.zalando.com |
| 113 | e-swagger-headers.png | параметр If-Match в PATCH | учебный проект, `/docs` |

## Живой репозиторий учебного проекта

Репозиторий https://github.com/MaximBytecamp/api-standard-template опубликован 16 сентября 2026 года.

| Слайд | Файл | Что на кадре |
|---|---|---|
| 83 | g-actions-main-green.png | прогон ci.yml после push в main: contract зелёный, breaking-changes пропущен |
| 96 | g-pr-checks.png | учебный PR №6, заполненный по шаблону |
| — | g-pr-demo.png | тот же PR №6, верх страницы |
| 97 | g-issue-demo.png | учебный issue №7 в формате формы api_change.yml |
| 101 | g-actions-breaking-failed.png | прогон на PR №6: contract зелёный, breaking-changes красный, 5 аннотаций oasdiff |
| 102 | g-pages-problem-412.png | опубликованная страница вида проблемы 412 |
| — | g-pages-redoc.png | опубликованный ReDoc 1.1.0 |
| — | g-repo-root.png, g-repo-tree.png | корень репозитория и папка .github |
| — | g-dependabot-prs.png | pull request от Dependabot, открытые сразу после публикации |

Страницы, доступные только после входа в GitHub (форма создания issue, логи шагов Actions,
настройки защиты ветки), не сняты: браузер для съёмки не авторизован. Кадр страницы выбора
формы issue удалён — вместо неё GitHub показал окно входа. Вывод oasdiff на слайде 101 получен запуском
`docker run tufin/oasdiff breaking` (oasdiff v1.33.0-rc.1) на копии контракта, где `title` переименован в `subject`.

## Переснять

Сценарии съёмки не входят в репозиторий. Порядок для локальных кадров:

1. Запустить `uvicorn app.main:app` в `api-standard-template/`.
2. Открыть `/docs`, выполнить действия из колонки «Что на кадре».
3. Сохранить PNG под тем же именем: колода подхватит его без правки кода.
