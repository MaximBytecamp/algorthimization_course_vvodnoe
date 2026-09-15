# Как вносить изменения в контракт

1. Если изменение меняет контракт, сначала откройте issue по форме
   **Предложение изменить API** и дождитесь обсуждения.
2. Проверьте изменение по [API_STYLE_GUIDE.md](API_STYLE_GUIDE.md) и определите по
   [VERSIONING.md](VERSIONING.md), совместимо ли оно.
3. Создайте ветку от `main`, реализуйте изменение в `app/` и добавьте тесты в `tests/`.
4. Выгрузите контракт: `python scripts/export_openapi.py`.
5. Проверьте локально:

   ```bash
   pytest
   python scripts/export_openapi.py --check
   npx @stoplight/spectral-cli lint openapi/openapi.yaml
   ```

6. Запишите изменение в `CHANGELOG.md` в раздел `[Unreleased]`.
7. Если принято архитектурное решение, добавьте ADR в `docs/adr/`.
8. Сделайте commit в формате [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
   `feat(api): add ticket pagination`, `docs(api): define ticket error contract`.
   Для несовместимого изменения — `feat(api)!: rename title to subject` и строка `BREAKING CHANGE:` в теле.
9. Откройте pull request и заполните шаблон.

## Что проверяется в pull request

| Проверка | Где | Что ловит |
|---|---|---|
| `pytest` | job `contract` | поведение endpoints и правила контракта |
| `export_openapi.py --check` | job `contract` | `openapi/` не совпадает с кодом |
| Spectral | job `contract` | нарушения `.spectral.yaml` |
| oasdiff | job `breaking-changes` | breaking change относительно `main` |
| review владельца | `.github/CODEOWNERS` | изменения контракта без согласования |

Ветка `main` защищена: слияние возможно только после успешных проверок.
Откуда взяты эти практики — [STANDARDS.md](STANDARDS.md).
