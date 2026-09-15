"""Заголовки контракта: X-Request-Id, ETag, Idempotency-Key, лимиты, deprecation, CORS.

Источник каждого правила указан в docs/STANDARDS.md.
"""

from app.main import app

PROBLEM = "application/problem+json"


def first_ticket_id(client):
    return client.get("/api/v1/tickets").json()["items"][0]["id"]


def test_request_id_is_generated(client):
    response = client.get("/api/v1/tickets")
    assert len(response.headers["X-Request-Id"]) == 36


def test_request_id_from_client_is_returned(client):
    response = client.get("/api/v1/tickets", headers={"X-Request-Id": "support-case-1842"})
    assert response.headers["X-Request-Id"] == "support-case-1842"


def test_unsafe_request_id_is_replaced(client):
    response = client.get("/api/v1/tickets", headers={"X-Request-Id": "bad value; drop table"})
    assert response.headers["X-Request-Id"] != "bad value; drop table"


def test_get_returns_etag_and_304_for_same_version(client):
    url = f"/api/v1/tickets/{first_ticket_id(client)}"
    etag = client.get(url).headers["ETag"]
    response = client.get(url, headers={"If-None-Match": etag})
    assert response.status_code == 304
    assert response.content == b""


def test_patch_with_stale_if_match_is_412(client, writer):
    url = f"/api/v1/tickets/{first_ticket_id(client)}"
    old_etag = client.get(url).headers["ETag"]
    client.patch(url, json={"status": "in_progress"}, headers=writer)
    response = client.patch(url, json={"status": "closed"}, headers={**writer, "If-Match": old_etag})
    assert response.status_code == 412
    assert response.headers["content-type"] == PROBLEM
    assert client.get(url).json()["status"] == "in_progress"


def test_patch_with_current_if_match_succeeds(client, writer):
    url = f"/api/v1/tickets/{first_ticket_id(client)}"
    etag = client.get(url).headers["ETag"]
    response = client.patch(url, json={"status": "closed"}, headers={**writer, "If-Match": etag})
    assert response.status_code == 200
    assert response.headers["ETag"] != etag


def test_idempotency_key_prevents_duplicate(client, writer):
    headers = {**writer, "Idempotency-Key": "8e03978e-40d5-43e8-bc93-6894a57f9324"}
    first = client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=headers)
    second = client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=headers)
    assert first.status_code == second.status_code == 201
    assert first.json()["id"] == second.json()["id"]
    assert client.get("/api/v1/tickets").json()["total"] == 4


def test_idempotency_key_with_other_body_is_422(client, writer):
    headers = {**writer, "Idempotency-Key": "key-1"}
    client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=headers)
    response = client.post("/api/v1/tickets", json={"title": "Не работает почта"}, headers=headers)
    assert response.status_code == 422
    assert response.headers["content-type"] == PROBLEM


def test_write_limit_returns_429_with_retry_after(client, writer, low_write_limit):
    for _ in range(2):
        ok = client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=writer)
    assert ok.headers["X-RateLimit-Remaining"] == "0"
    response = client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=writer)
    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) >= 1
    assert response.json()["title"] == "Too many requests"


def test_deprecated_operation_sends_deprecation_and_sunset(client):
    response = client.get("/api/v1/tickets/open")
    assert response.status_code == 200
    assert response.headers["Deprecation"].startswith("@")
    assert response.headers["Sunset"] == "Mon, 01 Mar 2027 00:00:00 GMT"
    assert app.openapi()["paths"]["/api/v1/tickets/open"]["get"]["deprecated"] is True


def test_cors_exposes_contract_headers(client):
    response = client.get("/api/v1/tickets/open", headers={"Origin": "http://localhost:5173"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    exposed = response.headers["access-control-expose-headers"]
    assert "ETag" in exposed and "X-Request-Id" in exposed and "Deprecation" in exposed


def test_every_response_documents_request_id():
    for path_item in app.openapi()["paths"].values():
        for operation in path_item.values():
            for response in operation["responses"].values():
                assert "X-Request-Id" in response["headers"]
