# Quickstart: первый запрос за пять минут

Руководство для разработчика клиента. Полное описание операций —
[документация API](https://maximbytecamp.github.io/api-standard-template/).

## 1. Запустить сервер

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 2. Прочитать список обращений

Чтение не требует токена.

```bash
curl -i http://127.0.0.1:8000/api/v1/tickets?limit=2
```

В ответе `200 OK`, заголовок `X-Request-Id` и страница обращений:

```json
{"items": [{"id": "…", "title": "Не работает VPN", "status": "open", "…": "…"}], "total": 3, "limit": 2, "offset": 0}
```

## 3. Создать обращение

Запись требует токена. Ключ идемпотентности защищает от дубля, если ответ потерялся и запрос пришлось повторить.

```bash
curl -i -X POST http://127.0.0.1:8000/api/v1/tickets \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324" \
  -d '{"title": "Не работает VPN", "description": "Ошибка после обновления"}'
```

Ответ `201 Created`. Адрес нового обращения — в заголовке `Location`, его версия — в `ETag`.

## 4. Изменить обращение без потери чужих правок

Передайте `ETag`, полученный при чтении, в `If-Match`:

```bash
curl -i -X PATCH http://127.0.0.1:8000/api/v1/tickets/<ticket_id> \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -H 'If-Match: "<etag>"' \
  -d '{"status": "closed"}'
```

Если обращение успели изменить, ответ будет `412 Precondition Failed`: прочитайте его заново.

## 5. Обработать ошибку

Все ошибки приходят в одном формате `application/problem+json`. Ветвите обработку по полю `type`:

| type заканчивается на | Что делать |
|---|---|
| `http-401` | передать токен |
| `http-404` | обращения нет |
| `http-412` | перечитать обращение и повторить |
| `http-422` | исправить поля из `errors` |
| `http-429` | подождать `Retry-After` секунд |

Описание каждого вида — по адресу из поля `type`.
