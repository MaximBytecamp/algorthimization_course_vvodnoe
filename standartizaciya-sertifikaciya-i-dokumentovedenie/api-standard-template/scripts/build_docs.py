"""Собирает страницы видов ошибок для GitHub Pages.

    python3 scripts/build_docs.py

Поле type в Problem Details содержит адрес вида
https://maximbytecamp.github.io/api-standard-template/problems/http-404.
RFC 9457 (раздел 3.1.1) требует, чтобы по такому адресу открывалась документация
о виде проблемы. Скрипт создаёт site/problems/http-<код>.html для каждого кода,
который возвращает API, и копирует openapi.yaml в site/.

Страницу ReDoc site/index.html собирает Redocly CLI в workflow docs.yml.
Если её нет (локальный запуск), скрипт создаёт простую страницу со ссылками.
"""

import html
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"

PROBLEMS = {
    401: ("Authentication required", "Нет заголовка Authorization или токен неизвестен.",
          "Передайте действующий токен: Authorization: Bearer <token>."),
    403: ("Operation forbidden", "Токен известен, но эта операция для него запрещена.",
          "Выполните операцию токеном с правом записи или запросите права у владельца API."),
    404: ("Resource not found", "Ресурса с таким идентификатором нет.",
          "Проверьте ticket_id. Обращение могли удалить."),
    412: ("Precondition failed", "ETag из If-Match не совпадает с текущей версией обращения: его изменили после того, как вы его прочитали.",
          "Получите обращение заново, возьмите новый ETag и повторите изменение."),
    422: ("Validation error", "Запрос не соответствует схеме контракта или Idempotency-Key уже использован с другим телом.",
          "Исправьте поля из массива errors. Для нового запроса используйте новый Idempotency-Key."),
    429: ("Too many requests", "Превышен лимит операций записи для токена.",
          "Повторите запрос через число секунд из заголовка Retry-After."),
    500: ("Internal server error", "Непредвиденная ошибка сервера. Подробности записаны в лог.",
          "Повторите запрос позже. Если ошибка повторяется, создайте issue и укажите X-Request-Id."),
}

PAGE = """<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>body{{font:17px/1.55 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#172335}}
code,pre{{font-family:Menlo,Consolas,monospace;background:#eef2f6;border-radius:6px}}code{{padding:1px 5px}}pre{{padding:14px;white-space:pre-wrap;overflow-wrap:anywhere}}
a{{color:#205dcc}}.status{{font:700 44px Menlo,monospace;color:#8a5a05}}</style></head>
<body>{body}</body></html>
"""


def problem_page(code: int, title: str, meaning: str, action: str) -> str:
    type_uri = f"https://maximbytecamp.github.io/api-standard-template/problems/http-{code}"
    body = f"""<p><a href="index.html">← Все виды ошибок</a></p>
<p class="status">{code}</p>
<h1>{html.escape(title)}</h1>
<p><strong>Что означает.</strong> {html.escape(meaning)}</p>
<p><strong>Что делать клиенту.</strong> {html.escape(action)}</p>
<h2>Пример ответа</h2>
<pre>HTTP/1.1 {code}
Content-Type: application/problem+json

{{
  "type": "{type_uri}",
  "title": "{html.escape(title)}",
  "status": {code},
  "instance": "/api/v1/tickets"
}}</pre>
<p>Формат описан в <a href="https://www.rfc-editor.org/rfc/rfc9457.html">RFC 9457</a>.
Этот адрес указан в поле <code>type</code>: по нему программа различает вид ошибки, а человек читает объяснение.</p>"""
    return PAGE.format(title=f"{code} {title} · Service Desk API", body=body)


def main() -> None:
    problems_dir = SITE / "problems"
    problems_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    for code, (title, meaning, action) in PROBLEMS.items():
        (problems_dir / f"http-{code}.html").write_text(problem_page(code, title, meaning, action), encoding="utf-8")
        rows.append(f'<li><a href="http-{code}.html"><code>http-{code}</code></a> — {code} {html.escape(title)}</li>')
    index = f"""<p><a href="../index.html">← Документация API</a></p><h1>Виды ошибок Service Desk API</h1>
<p>Каждый ответ с ошибкой содержит поле <code>type</code> с адресом одной из этих страниц.</p><ul>{''.join(rows)}</ul>"""
    (problems_dir / "index.html").write_text(PAGE.format(title="Виды ошибок · Service Desk API", body=index), encoding="utf-8")
    shutil.copy(ROOT / "openapi" / "openapi.yaml", SITE / "openapi.yaml")
    if not (SITE / "index.html").exists():
        (SITE / "index.html").write_text(PAGE.format(
            title="Service Desk API",
            body='<h1>Service Desk API</h1><p><a href="openapi.yaml">openapi.yaml</a> · <a href="problems/index.html">Виды ошибок</a></p>',
        ), encoding="utf-8")
    print(f"built {len(PROBLEMS)} problem pages in {problems_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
