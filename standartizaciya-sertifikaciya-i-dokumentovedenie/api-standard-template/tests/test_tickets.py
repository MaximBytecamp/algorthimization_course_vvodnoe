"""Поведение endpoints: status codes, заголовки и тела ответов."""

from uuid import uuid4

from app.problems import PROBLEM_TYPE_BASE

PROBLEM = "application/problem+json"


def test_list_returns_page(client):
    response = client.get("/api/v1/tickets", params={"limit": 2})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2
    assert body["limit"] == 2


def test_list_filters_by_status(client):
    body = client.get("/api/v1/tickets", params={"status": "open"}).json()
    assert {ticket["status"] for ticket in body["items"]} == {"open"}


def test_create_returns_201_and_location(client, writer):
    response = client.post("/api/v1/tickets", json={"title": "Не работает VPN"}, headers=writer)
    assert response.status_code == 201
    ticket = response.json()
    assert ticket["status"] == "open"
    assert response.headers["Location"] == f"/api/v1/tickets/{ticket['id']}"


def test_create_without_token_is_401(client):
    response = client.post("/api/v1/tickets", json={"title": "Не работает VPN"})
    assert response.status_code == 401
    assert response.headers["content-type"] == PROBLEM
    assert response.headers["WWW-Authenticate"] == "Bearer"


def test_viewer_cannot_delete_403(client, viewer):
    ticket_id = client.get("/api/v1/tickets").json()["items"][0]["id"]
    response = client.delete(f"/api/v1/tickets/{ticket_id}", headers=viewer)
    assert response.status_code == 403
    assert response.json()["title"] == "Operation forbidden"


def test_client_cannot_send_id(client, writer):
    response = client.post("/api/v1/tickets", json={"id": str(uuid4()), "title": "VPN"}, headers=writer)
    assert response.status_code == 422


def test_missing_ticket_is_problem_details(client):
    ticket_id = uuid4()
    response = client.get(f"/api/v1/tickets/{ticket_id}")
    assert response.status_code == 404
    assert response.headers["content-type"] == PROBLEM
    assert response.json() == {
        "type": f"{PROBLEM_TYPE_BASE}http-404",
        "title": "Resource not found",
        "status": 404,
        "detail": f"Ticket {ticket_id} does not exist",
        "instance": f"/api/v1/tickets/{ticket_id}",
    }


def test_validation_error_is_problem_details(client):
    response = client.get("/api/v1/tickets", params={"limit": 500})
    assert response.status_code == 422
    body = response.json()
    assert body["type"] == f"{PROBLEM_TYPE_BASE}http-422"
    assert body["errors"][0]["loc"] == ["query", "limit"]


def test_patch_changes_only_sent_fields(client, writer):
    ticket = client.get("/api/v1/tickets", params={"status": "open"}).json()["items"][0]
    response = client.patch(f"/api/v1/tickets/{ticket['id']}", json={"status": "closed"}, headers=writer)
    assert response.status_code == 200
    assert response.json()["status"] == "closed"
    assert response.json()["title"] == ticket["title"]


def test_delete_is_204_and_repeat_gives_404(client, writer):
    ticket_id = client.get("/api/v1/tickets").json()["items"][0]["id"]
    first = client.delete(f"/api/v1/tickets/{ticket_id}", headers=writer)
    assert first.status_code == 204
    assert first.content == b""
    assert client.delete(f"/api/v1/tickets/{ticket_id}", headers=writer).status_code == 404
