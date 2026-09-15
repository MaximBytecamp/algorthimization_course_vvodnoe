# Откуда взяты правила проекта

Каждое правило этого репозитория опирается на стандарт, спецификацию или открытый
документ крупной компании. Для каждой темы ниже:

1. **что сделано в проекте** — файл, где правило применено;
2. **источник** — цитата в оригинале, под ней перевод на русский и ссылка;
3. **как это делают другие** — тот же файл или правило у разных компаний, со ссылкой на настоящий файл.

Все ссылки и цитаты проверены 16 сентября 2026 года. Документы в репозиториях компаний
меняются: если ссылка на ветку `main` уже показывает другой текст, смотрите историю файла.

Статус источника указан явно:

| Статус | Что означает |
|---|---|
| **RFC, Standards Track** | стандарт IETF |
| **RFC, Informational** | опубликованный документ IETF, но не стандарт |
| **Internet-Draft** | черновик IETF: может измениться или истечь |
| **Спецификация** | OpenAPI, Fetch Standard, SemVer |
| **Правила компании** | обязательны только внутри этой компании |

---

## 1. Сила требования: MUST, SHOULD, MAY

**В проекте:** `docs/API_STYLE_GUIDE.md`.

**Источник:** [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html), Best Current Practice.

> MUST This word, or the terms "REQUIRED" or "SHALL", mean that the definition is an absolute requirement of the specification.

Перевод: MUST — это слово, как и термины REQUIRED и SHALL, означает, что определение является безусловным требованием спецификации.

**Как это делают другие:** этими словами размечены правила
[Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
(заголовки вида «MUST use semantic versioning») и
[Microsoft Graph REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/graph/GuidelinesGraph.md).
[Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md)
используют другую форму той же идеи: метки **DO** и **DO NOT**.

---

## 2. Описание API в OpenAPI и принцип API First

**В проекте:** `openapi/openapi.yaml`, `scripts/export_openapi.py`, `tests/test_contract.py`.

**Источник:** [OpenAPI Specification 3.2.0](https://spec.openapis.org/oas/v3.2.0.html), спецификация.

> The OpenAPI Specification (OAS) defines a standard, programming language-agnostic interface description for HTTP APIs, which allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code, additional documentation, or inspection of network traffic.

Перевод: OpenAPI Specification определяет стандартное, не зависящее от языка программирования описание интерфейса HTTP API. Оно позволяет и людям, и программам узнать возможности сервиса без доступа к исходному коду, дополнительной документации и без анализа сетевого трафика.

**Источник:** [Zalando, правило 100 «MUST follow API first principle»](https://opensource.zalando.com/restful-api-guidelines/#100), правила компании.

> You must define APIs first, before coding its implementation, using OpenAPI as specification language

Перевод: API нужно сначала описать на языке OpenAPI и только потом писать реализацию.

**Как это делают другие:**

| Компания | Где лежит описание API | Как оно получается |
|---|---|---|
| GitHub | [github/rest-api-description](https://github.com/github/rest-api-description) | публикуется из внутреннего описания; README: «used to validate GitHub API requests as well as powering contract tests» |
| Azure | [Azure/azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs) | спецификации пишут и проходят review до выпуска SDK |
| DigitalOcean | [digitalocean/openapi](https://github.com/digitalocean/openapi) | описание разбито на файлы, проверяется своим Spectral ruleset |
| Box | [box/box-openapi](https://github.com/box/box-openapi) | отдельный файл на каждую версию API в папке `openapi/` |
| Наш проект | `openapi/openapi.yaml` | генерируется из кода FastAPI, CI сверяет файл с кодом |

---

## 3. Метаданные API

**В проекте:** `app/main.py` — `title`, `version`, `description`, `contact`, `license`.

**Источник:** [Zalando, правило 218 «MUST contain API meta information»](https://opensource.zalando.com/restful-api-guidelines/#218), правила компании.
Правило требует заполнять в `info` поля `title`, `version`, `description` и `contact`.

---

## 4. Формат ошибок: Problem Details

**В проекте:** `app/problems.py`, `docs/ERRORS.md`, страницы видов ошибок на
[GitHub Pages](https://maximbytecamp.github.io/api-standard-template/problems/).

**Источник:** [RFC 9457, раздел 3.1.1](https://www.rfc-editor.org/rfc/rfc9457.html#name-type), Standards Track.

> If the type URI is a locator (e.g., those with an "http" or "https" scheme), dereferencing it SHOULD provide human-readable documentation for the problem type (e.g., using HTML).

Перевод: если URI в поле type является адресом (например, со схемой http или https), то по этому адресу SHOULD открываться понятная человеку документация о виде проблемы, например HTML-страница.

Поэтому в проекте `type` ведёт на опубликованную страницу, а не на выдуманный домен.

**Источник:** [Zalando, правило 176 «MUST support problem JSON»](https://opensource.zalando.com/restful-api-guidelines/#176), правила компании.

> every endpoints must be capable of returning a Problem JSON on client usage errors (4xx status codes) as well as server side processing errors (5xx status codes).

Перевод: каждый endpoint должен уметь возвращать Problem JSON как при ошибках клиента (коды 4xx), так и при ошибках обработки на сервере (коды 5xx).

**Как это делают другие:** Zalando — `application/problem+json` в теле;
Azure — собственная структура ошибки и заголовок `x-ms-error-code`
([Azure REST API Guidelines, раздел Handling Errors](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#handling-errors)).

---

## 5. Версия контракта: Semantic Versioning

**В проекте:** `info.version` в `app/main.py`, `docs/VERSIONING.md`.

**Источник:** [Semantic Versioning 2.0.0](https://semver.org/), спецификация.

> MAJOR version when you make incompatible API changes
> MINOR version when you add functionality in a backward compatible manner
> PATCH version when you make backward compatible bug fixes

Перевод: MAJOR — при несовместимых изменениях API; MINOR — при добавлении функциональности с сохранением обратной совместимости; PATCH — при исправлении ошибок с сохранением обратной совместимости.

**Источник:** [Zalando, правило 116 «MUST use semantic versioning»](https://opensource.zalando.com/restful-api-guidelines/#116), правила компании.

> Note, this API specification document version is distinct from the OpenAPI Specification version (also required, e.g. openapi: 3.1.0), or the API Implementation version

Перевод: версия документа спецификации API отличается от версии OpenAPI Specification (её тоже нужно указать, например openapi: 3.1.0) и от версии реализации API.

---

## 6. Где указывать версию API: четыре разных решения

**В проекте:** мажорная версия в пути `/api/v1`, решение записано в `docs/adr/0001-api-versioning.md`.

| Компания | Где версия | Пример | Доказательство |
|---|---|---|---|
| GitHub | заголовок, версия названа датой | `X-GitHub-Api-Version: 2026-03-10` | [GitHub Docs, API Versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions) |
| Microsoft Graph | путь | `https://graph.microsoft.com/v1.0/users`, `beta` | [GuidelinesGraph.md, URL structure](https://github.com/microsoft/api-guidelines/blob/vNext/graph/GuidelinesGraph.md) |
| Azure | query-параметр | `?api-version=2024-05-01` | [Azure Guidelines.md, Versioning](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) |
| Box | в имени файла описания | `openapi-v2025.0.json` | [box/box-openapi/openapi](https://github.com/box/box-openapi/tree/main/openapi) |
| Наш проект | путь | `/api/v1/tickets` | `docs/adr/0001-api-versioning.md` |

Цитаты:

> `version` can be v1.0 or beta.

Перевод (Microsoft Graph): сегмент `version` может быть v1.0 или beta.

> The api-version query parameter (?api-version=) is required for all requests

Перевод (Azure, текст сообщения об ошибке, который правило требует возвращать): query-параметр api-version обязателен во всех запросах.

---

## 7. Что считать breaking change: у компаний разные ответы

**В проекте:** `docs/VERSIONING.md`, проверка в `.github/workflows/ci.yml` (job `breaking-changes`).

**Источник:** [GitHub Docs, API Versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions), правила компании.

> Breaking changes are changes that can potentially break an integration.

Перевод: breaking changes — это изменения, которые потенциально могут сломать интеграцию.

GitHub относит к совместимым изменениям в том числе «Adding a response field» — добавление поля в ответ.

**Источник:** [Azure, Breaking changes guidelines](https://github.com/Azure/azure-rest-api-specs/blob/main/documentation/Breaking%20changes%20guidelines.md), правила компании (документ помечен как устаревший, актуальная политика — по ссылке в его начале).

> Teams MAY define backwards compatibility as their business needs require. For example, Azure defines the addition of a new JSON field in a response to be not backwards compatible.

Перевод: команды MAY определять обратную совместимость так, как требует их бизнес. Например, Azure считает добавление нового поля JSON в ответ обратно несовместимым изменением.

**Вывод для проекта:** одно и то же изменение GitHub считает совместимым, а Azure — нет.
Поэтому политика совместимости записывается явно в `docs/VERSIONING.md`.

---

## 8. Устаревание операции: Deprecation и Sunset

**В проекте:** `GET /api/v1/tickets/open` в `app/api/v1/endpoints/tickets.py` —
`deprecated: true` в OpenAPI и заголовки `Deprecation`, `Sunset` в ответе.

**Источник:** [Zalando, правило 187 «MUST reflect deprecation in API specifications»](https://opensource.zalando.com/restful-api-guidelines/#187), правила компании.

> the producers must set deprecated: true for the affected element and add further explanation to the description section of the API specification. If a future shut down is planned, the producer must provide a sunset date and document in details what consumers should use instead and how to migrate.

Перевод: владелец API должен указать `deprecated: true` у затронутого элемента и добавить объяснение в описание спецификации. Если планируется отключение, нужно указать дату отключения и подробно описать, что использовать вместо элемента и как перейти.

**Источник:** [Zalando, правило 189 «SHOULD add Deprecation and Sunset header to responses»](https://opensource.zalando.com/restful-api-guidelines/#189), правила компании.

> During the deprecation phase, the producer should add a Deprecation: <timestamp> (see RFC 9745 section 2) and - if also planned - a Sunset: <date-time> (see RFC 8594 section 3) header on each response affected by a deprecated element

Перевод: на этапе устаревания владелец API должен добавлять заголовок Deprecation со временем (RFC 9745, раздел 2) и, если отключение запланировано, заголовок Sunset с датой (RFC 8594, раздел 3) в каждый ответ, который затрагивает устаревший элемент.

**Источник:** [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html), Standards Track, март 2025.

> The Deprecation HTTP response header field is used to signal to consumers of a resource (identified by a URI) that the resource will be or has been deprecated.

Перевод: заголовок ответа Deprecation сообщает потребителям ресурса (идентифицированного URI), что ресурс будет объявлен или уже объявлен устаревшим.

Пример из RFC: `Deprecation: @1688169599`.

**Источник:** [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html), **Informational**, май 2019.

> This specification defines the Sunset HTTP response header field, which indicates that a URI is likely to become unresponsive at a specified point in the future.

Перевод: спецификация определяет заголовок ответа Sunset. Он показывает, что URI, вероятно, перестанет отвечать в указанный момент в будущем.

Пример из RFC: `Sunset: Sat, 31 Dec 2018 23:59:59 GMT`.

**Как это делают другие:**

| Компания | Как сообщает об устаревании | Доказательство |
|---|---|---|
| Zalando | `deprecated: true` + заголовки `Deprecation`, `Sunset` | правила 187, 189 |
| Microsoft Graph | новый элемент с новым именем, старый помечается аннотацией; поддержка не меньше 36 месяцев | [GuidelinesGraph.md, Versioning and deprecation](https://github.com/microsoft/api-guidelines/blob/vNext/graph/GuidelinesGraph.md#versioning-and-deprecation) |
| Azure | заголовок `azure-deprecating` | [Azure Guidelines.md, Deprecating Behavior Notification](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) |
| GitHub | breaking changes только в новой датированной версии | [GitHub Docs, API Versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions) |

Цитата Microsoft Graph:

> If your API requires a breaking change in GA, then you MUST create new element versions and support deprecated elements for a minimum of 36 months or 24 months with demonstrated non-usage.

Перевод: если API в статусе GA требует breaking change, нужно MUST создать новые версии элементов и поддерживать устаревшие не меньше 36 месяцев либо 24 месяцев, если доказано, что ими не пользуются.

---

## 9. Ограничение частоты запросов: 429 и Retry-After

**В проекте:** `app/limits.py` — лимит операций записи, ответ 429 с `Retry-After`, заголовки `X-RateLimit-*`.

**Источник:** [RFC 6585, раздел 4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4), Standards Track.

> The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.

Перевод: ответ SHOULD объяснять причину и MAY содержать заголовок Retry-After, который показывает, сколько ждать перед новым запросом.

**Источник:** [Zalando, правило 153 «MUST use code 429 with headers for rate limits»](https://opensource.zalando.com/restful-api-guidelines/#153), правила компании.

> X-RateLimit-Reset: The relative time in seconds when the rate limit window will be reset. Beware that this is different to Github and Twitter’s usage of a header with the same name which is using UTC epoch seconds instead.

Перевод: X-RateLimit-Reset — относительное время в секундах до сброса окна лимита. Учтите, что GitHub и Twitter используют заголовок с тем же именем иначе: в нём время в секундах UTC epoch.

**Источник:** [GitHub Docs, Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), правила компании.

> x-ratelimit-reset The time at which the current rate limit window resets, in UTC epoch seconds

Перевод: x-ratelimit-reset — момент сброса текущего окна лимита в секундах UTC epoch.

**Вывод для проекта:** одинаковое имя заголовка у двух компаний означает разное. В проекте принят вариант Zalando, и смысл заголовка записан в OpenAPI.

**Стандарт в работе:** [draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), **Internet-Draft**, версия 11, активен.
Он вводит заголовки `RateLimit` и `RateLimit-Policy`. Проект перейдёт на них, когда черновик станет RFC.

---

## 10. Условные запросы: ETag, If-None-Match, If-Match

**В проекте:** `GET /tickets/{ticket_id}` отдаёт `ETag` и отвечает 304 на совпавший `If-None-Match`;
`PATCH` с устаревшим `If-Match` получает 412 и ничего не меняет.

**Источник:** [RFC 9110, раздел 13.1.1](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match), Standards Track.

> The "If-Match" header field makes the request method conditional on the recipient origin server either having at least one current representation of the target resource, when the field value is "*", or having a current representation of the target resource that has an entity tag matching a member of the list of entity tags provided in the field value.

Перевод: заголовок If-Match делает метод запроса условным. Сервер выполняет запрос, только если у ресурса есть хотя бы одно текущее представление (при значении «*») или если entity tag текущего представления совпадает с одним из перечисленных в заголовке.

**Источник:** [Zalando, правило 182 «MAY consider to support ETag together with If-Match/If-None-Match header»](https://opensource.zalando.com/restful-api-guidelines/#182), правила компании.

> When creating or updating resources it may be necessary to expose conflicts and to prevent the lost update or initially created problem.

Перевод: при создании или изменении ресурсов бывает нужно обнаруживать конфликты и предотвращать потерю обновления или повторное создание.

**Как это делают другие:**

| Компания | Сила правила | Доказательство |
|---|---|---|
| Zalando | MAY | правило 182 |
| Azure | DO | Azure Guidelines: «**DO** support caching and optimistic concurrency by honoring the the `If-Match`, `If-None-Match`, if-modified-since, and if-unmodified-since request headers and by returning the ETag and last-modified response headers» |
| GitHub | используется для экономии лимита | [Best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api): «Most endpoints return an etag header… If the response has not changed, you will receive a 304 Not Modified response.» |

Перевод цитаты Azure: DO — поддерживать кэширование и оптимистичную блокировку: учитывать заголовки запроса If-Match, If-None-Match, if-modified-since и if-unmodified-since и возвращать заголовки ответа ETag и last-modified. Двойное «the the» — опечатка в оригинале.

Перевод цитаты GitHub: большинство endpoints возвращают заголовок etag… Если ответ не изменился, вы получите 304 Not Modified.

---

## 11. Ключ идемпотентности: Idempotency-Key

**В проекте:** `app/idempotency.py`, заголовок `Idempotency-Key` в `POST /tickets`.

**Источник:** [draft-ietf-httpapi-idempotency-key-header-07](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header), **Internet-Draft, срок действия истёк**.
Это не стандарт. Черновик используется как описание распространённой практики.

> If there is an attempt to reuse an idempotency key with a different request payload, the resource SHOULD reply with a HTTP 422 status code with body containing a link pointing to relevant documentation.

Перевод: при попытке повторно использовать ключ идемпотентности с другим телом запроса ресурс SHOULD ответить кодом 422 с телом, в котором есть ссылка на документацию.

**Источник:** [Stripe API, Idempotent requests](https://docs.stripe.com/api/idempotent_requests), правила компании.

> Idempotency keys are up to 255 characters long. … You can remove keys from the system automatically after they’re at least 24 hours old. … The idempotency layer compares incoming parameters to those of the original request and errors if they’re not the same to prevent accidental misuse.

Перевод: ключ идемпотентности занимает до 255 символов… Ключи можно автоматически удалять, когда им не меньше 24 часов… Слой идемпотентности сравнивает параметры нового запроса с исходным и возвращает ошибку, если они различаются.

**Источник:** [Zalando, правило 230 «MAY consider to support Idempotency-Key header»](https://opensource.zalando.com/restful-api-guidelines/#230), правила компании.

> The unique request key is stored temporarily, e.g. for 24 hours, together with the response and the request hash (optionally) of the first request in a key cache

Перевод: уникальный ключ запроса временно хранится, например 24 часа, вместе с ответом и (необязательно) хешем первого запроса.

**Что взято в проект:** длина до 255 символов и хранение 24 часа (Stripe, Zalando), ответ 422 при другом теле (черновик IETF).

---

## 12. Идентификатор запроса

**В проекте:** `app/middleware.py`, заголовок `X-Request-Id` в каждом ответе.

Стандартного заголовка для этого нет: каждая компания выбирает своё имя.

| Компания | Заголовок | Доказательство |
|---|---|---|
| Zalando | `X-Flow-ID` | [правило 233 «MUST support X-Flow-ID»](https://opensource.zalando.com/restful-api-guidelines/#233) |
| Azure | `x-ms-client-request-id` | [Azure Guidelines.md, таблица correlation headers](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) |
| Наш проект | `X-Request-Id` | `app/middleware.py` |

> A consequent usage of the Flow-ID facilitates the tracking of call flows through our system and allows the correlation of service activities initiated by a specific call.

Перевод (Zalando): последовательное использование Flow-ID упрощает отслеживание цепочек вызовов в системе и позволяет связать действия сервисов, вызванные конкретным запросом.

> If the caller provides this header the service **must** include this in their log entries to facilitate correlation of log entries for a single request. Because this header can be client-generated, it should not …

Перевод (Azure): если вызывающая сторона передала этот заголовок, сервис **must** записывать его в логи, чтобы связать записи одного запроса. Поскольку значение может сформировать клиент, оно не должно… (дальше Azure ограничивает, как это значение можно использовать).

Поэтому проект принимает значение клиента, только если оно состоит из букв, цифр, `.`, `_`, `-` и не длиннее 128 символов.

---

## 13. CORS: какие заголовки видит браузерный клиент

**В проекте:** `CORSMiddleware` в `app/main.py`, список `expose_headers`.

**Источник:** [Fetch Standard, CORS protocol](https://fetch.spec.whatwg.org/#http-responses), спецификация WHATWG.

> `Access-Control-Expose-Headers` Indicates which headers can be exposed as part of the response by listing their names.

Перевод: Access-Control-Expose-Headers перечисляет имена заголовков, которые можно открыть скрипту как часть ответа.

**Почему это часть контракта:** без этого списка браузерный клиент не прочитает `ETag`, `Location`
и `Retry-After`, даже если сервер их прислал.

---

## 14. Журнал изменений

**В проекте:** `CHANGELOG.md`.

**Источник:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), соглашение.

> Changelogs are for humans, not machines. There should be an entry for every single version. The same types of changes should be grouped. Versions and sections should be linkable. The latest version comes first. The release date of each version is displayed. Mention whether you follow Semantic Versioning.

Перевод: журнал изменений пишется для людей, а не для программ. Для каждой версии должна быть запись. Изменения одного типа группируются. На версии и разделы можно сослаться. Последняя версия идёт первой. У каждой версии указана дата выпуска. Сказано, соблюдается ли Semantic Versioning.

**Как это делают другие:**

| Проект | Вариант | Файл |
|---|---|---|
| Keep a Changelog | один файл, разделы Added / Changed / Deprecated… | [CHANGELOG.md](https://github.com/olivierlacan/keep-a-changelog/blob/main/CHANGELOG.md) |
| Stripe Node SDK | один файл, генерируется из фрагментов `.change.md`, ссылки на PR | [CHANGELOG.md](https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md) |
| Kubernetes | папка, отдельный файл на каждую минорную версию | [CHANGELOG/](https://github.com/kubernetes/kubernetes/tree/master/CHANGELOG) |

---

## 15. Сообщения коммитов

**В проекте:** `docs/CONTRIBUTING.md`.

**Источник:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), соглашение.

> This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.

Перевод: соглашение согласуется с SemVer: сообщения коммитов описывают новые возможности, исправления и breaking changes.

---

## 16. Шаблон pull request

**В проекте:** `.github/PULL_REQUEST_TEMPLATE.md`.

**Источник:** [GitHub Docs, Creating a pull request template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository).

> To store your file in a hidden directory, name the pull request template .github/pull_request_template.md.

Перевод: чтобы хранить файл в скрытой папке, назовите шаблон pull request `.github/pull_request_template.md`.
Имя файла не чувствительно к регистру: Kubernetes и GitHub Docs называют его `PULL_REQUEST_TEMPLATE.md`.

**Как это делают другие:** один и тот же файл устроен по-разному.

| Проект | Что требует шаблон | Файл |
|---|---|---|
| Kubernetes | тип PR командой `/kind api-change`, `/kind deprecation`; блок release note | [PULL_REQUEST_TEMPLATE.md](https://github.com/kubernetes/kubernetes/blob/master/.github/PULL_REQUEST_TEMPLATE.md) |
| OpenAPI Initiative | отметить, нужны ли изменения JSON Schema спецификации | [pull_request_template.md](https://github.com/OAI/OpenAPI-Specification/blob/main/.github/pull_request_template.md) |
| GitHub Docs | ссылка на issue, чек-лист: проверка экспертом, CI | [PULL_REQUEST_TEMPLATE.md](https://github.com/github/docs/blob/main/.github/PULL_REQUEST_TEMPLATE.md) |
| Azure REST API Specs | выбор из трёх шаблонов: data plane, control plane, SDK | [PULL_REQUEST_TEMPLATE.md](https://github.com/Azure/azure-rest-api-specs/blob/main/.github/PULL_REQUEST_TEMPLATE.md) и [папка шаблонов](https://github.com/Azure/azure-rest-api-specs/tree/main/.github/PULL_REQUEST_TEMPLATE) |
| Box OpenAPI | чек-лист: стиль, самопроверка, `yarn lint` | [PULL_REQUEST_TEMPLATE.md](https://github.com/box/box-openapi/blob/main/.github/PULL_REQUEST_TEMPLATE.md) |

---

## 17. Формы issue

**В проекте:** `.github/ISSUE_TEMPLATE/`.

**Источник:** [GitHub Docs, Syntax for issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms).

> You can create custom issue forms by adding a YAML form definition file to the /.github/ISSUE_TEMPLATE folder in your repository.

Перевод: собственные формы issue создаются YAML-файлами с описанием формы в папке `/.github/ISSUE_TEMPLATE` репозитория.

**Как это делают другие:**

| Проект | Формат | Что спрашивает форма | Файл |
|---|---|---|---|
| Azure REST API Specs | YAML-форма | обязательные поля «API Spec link» и «API Spec version» | [02_bug.yml](https://github.com/Azure/azure-rest-api-specs/blob/main/.github/ISSUE_TEMPLATE/02_bug.yml) |
| Kubernetes | YAML-форма | что произошло, что ожидали, как воспроизвести, версия | [bug-report.yaml](https://github.com/kubernetes/kubernetes/blob/master/.github/ISSUE_TEMPLATE/bug-report.yaml) |
| Stripe Node SDK | YAML-форма | описание, шаги, ожидаемое поведение, код | [bug_report.yml](https://github.com/stripe/stripe-node/blob/master/.github/ISSUE_TEMPLATE/bug_report.yml) |
| VS Code | Markdown-шаблон, не форма | свободный текст по подсказкам | [bug_report.md](https://github.com/microsoft/vscode/blob/main/.github/ISSUE_TEMPLATE/bug_report.md) |

Из Azure в проект взяты обязательные поля «версия API» и «операция», из Kubernetes — пары «что произошло / что ожидали».

---

## 18. Владельцы кода и обязательный review

**В проекте:** `.github/CODEOWNERS` — изменения в `openapi/`, `docs/` и `.spectral.yaml` требуют review владельца API.

**Источник:** [GitHub Docs, About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

> Code owners are automatically requested for review when someone opens a pull request that modifies code that they own.

Перевод: владельцы кода автоматически получают запрос на review, когда кто-то открывает pull request, меняющий принадлежащий им код.

> To use a CODEOWNERS file, create a new file called CODEOWNERS in the .github/, root, or docs/ directory of the repository

Перевод: чтобы использовать CODEOWNERS, создайте файл с этим именем в папке `.github/`, в корне или в папке `docs/` репозитория.

**Как это делают другие:**

| Проект | Вариант | Файл |
|---|---|---|
| OpenAPI Initiative | папку `/versions/` утверждает технический комитет | [CODEOWNERS](https://github.com/OAI/OpenAPI-Specification/blob/main/.github/CODEOWNERS) |
| Azure REST API Specs | отдельные владельцы у спецификации каждого сервиса | [CODEOWNERS](https://github.com/Azure/azure-rest-api-specs/blob/main/.github/CODEOWNERS) |
| GitHub Docs | владельцы у отдельных разделов контента | [CODEOWNERS](https://github.com/github/docs/blob/main/.github/CODEOWNERS) |
| Kubernetes | не CODEOWNERS, а файлы `OWNERS` в каждой папке для бота Prow | [OWNERS](https://github.com/kubernetes/kubernetes/blob/master/OWNERS) |

---

## 19. Политика безопасности

**В проекте:** `docs/SECURITY.md`.

**Источник:** [GitHub Docs, Adding a security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository).

> In the new SECURITY.md file, add information about supported versions of your project and how to report a vulnerability.

Перевод: в новом файле SECURITY.md укажите поддерживаемые версии проекта и способ сообщить об уязвимости.

**Как это делают другие:**

| Проект | Вариант | Файл |
|---|---|---|
| Azure REST API Specs | полный стандартный текст Microsoft: не публиковать уязвимость в issue, писать в MSRC, список сведений | [SECURITY.md](https://github.com/Azure/azure-rest-api-specs/blob/main/SECURITY.md) |
| VS Code | короткая версия того же блока Microsoft со ссылкой на общую политику | [SECURITY.md](https://github.com/microsoft/vscode/blob/main/SECURITY.md) |
| Kubernetes | файл `SECURITY_CONTACTS` со списком ответственных и ссылкой на процесс | [SECURITY_CONTACTS](https://github.com/kubernetes/kubernetes/blob/master/SECURITY_CONTACTS) |

**Про OWASP:** риски API перечислены в [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/).

---

## 20. Лицензия

**В проекте:** `LICENSE` (MIT). Та же лицензия объявлена в `info.license` OpenAPI.

**Источник:** [GitHub Docs, Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

> For your repository to truly be open source, you'll need to license it so that others are free to use, change, and distribute the software.

Перевод: чтобы репозиторий действительно был открытым, ему нужна лицензия, которая разрешает другим свободно использовать, изменять и распространять программу.

---

## 21. Обновление зависимостей

**В проекте:** `.github/dependabot.yml`.

| Проект | Вариант | Файл |
|---|---|---|
| OpenAPI Initiative | только GitHub Actions, ежедневно | [dependabot.yml](https://github.com/OAI/OpenAPI-Specification/blob/main/.github/dependabot.yml) |
| GitHub Docs | npm и Actions еженедельно, группировка, пропуск patch и minor | [dependabot.yml](https://github.com/github/docs/blob/main/.github/dependabot.yml) |
| FastAPI | свой вариант для Python-проекта | [dependabot.yml](https://github.com/fastapi/fastapi/blob/master/.github/dependabot.yml) |

---

## 22. Проверки перед слиянием

**В проекте:** ветка `main` защищена: pull request сливается только после успешных проверок CI.

**Источник:** [GitHub Docs, About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
Среди настроек защиты ветки перечислены «Require pull request reviews before merging» и «Require status checks before merging» — «требовать review перед слиянием» и «требовать успешных проверок статуса перед слиянием».

---

## 23. Линтер и автоматический поиск breaking changes

**В проекте:** `.spectral.yaml`; job `breaking-changes` в `.github/workflows/ci.yml` сравнивает
`openapi/openapi.yaml` в pull request с версией в `main`.

**Источник:** [stoplightio/spectral](https://github.com/stoplightio/spectral), описание репозитория.

> A flexible JSON/YAML linter for creating automated style guides, with baked in support for OpenAPI (v3.1, v3.0, and v2.0), Arazzo v1.0, as well as AsyncAPI v2.x.

Перевод: гибкий линтер JSON и YAML для автоматических style guide со встроенной поддержкой OpenAPI (3.1, 3.0 и 2.0), Arazzo 1.0 и AsyncAPI 2.x.

**Источник:** [oasdiff/oasdiff-action](https://github.com/oasdiff/oasdiff-action), README.

> GitHub Actions that check your OpenAPI specs for breaking changes on every pull request.

Перевод: GitHub Actions, которые проверяют спецификации OpenAPI на breaking changes в каждом pull request.

**Как это делают другие:** Azure использует собственный инструмент
[Azure/openapi-diff](https://github.com/Azure/openapi-diff);
правила стиля в виде Spectral ruleset есть у
[adidas](https://github.com/adidas/api-guidelines/blob/master/adidas-spectral.yaml) и
[DigitalOcean](https://github.com/digitalocean/openapi/blob/main/spectral/ruleset.yml).

---

## 24. Опубликованная документация

**В проекте:** `.github/workflows/docs.yml` собирает ReDoc и страницы видов ошибок и публикует их на
[GitHub Pages](https://maximbytecamp.github.io/api-standard-template/).

**Источник:** [Redocly CLI](https://github.com/Redocly/redocly-cli), README: команда `redocly build-docs openapi.yaml` собирает HTML-документацию.

**Источник:** [GitHub Docs, Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): публикация выполняется action `actions/deploy-pages`.

**Источник:** Zalando, раздел общих правил: «SHOULD provide API user manual» — «SHOULD предоставлять руководство пользователя API».
В проекте это `docs/QUICKSTART.md`. Пример большого quickstart — [GitHub REST API Quickstart](https://docs.github.com/en/rest/quickstart).

---

## 25. Безопасность в описании API

**В проекте:** схема `BearerAuth` в OpenAPI.

**Источник:** [Zalando, правило 104 «MUST secure endpoints»](https://opensource.zalando.com/restful-api-guidelines/#104), правила компании.

**Что не реализовано и почему:** OpenAPI позволяет описать OAuth 2.0 со схемами `authorizationCode`
и `clientCredentials` ([OpenAPI 3.2.0, OAuth Flows Object](https://spec.openapis.org/oas/v3.2.0.html#oauth-flows-object)).
Учебный стенд не содержит сервера авторизации, поэтому такая схема в контракте была бы неправдой.
В production её добавляют вместе с настоящим сервером авторизации.
