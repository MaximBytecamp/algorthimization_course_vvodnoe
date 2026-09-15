import pytest
from fastapi.testclient import TestClient

from app.idempotency import idempotency_store
from app.limits import write_limiter
from app.main import app
from app.storage import repository


@pytest.fixture
def client():
    repository.reset()
    idempotency_store.reset()
    write_limiter.reset()
    return TestClient(app)


@pytest.fixture
def writer():
    return {"Authorization": "Bearer demo-token"}


@pytest.fixture
def viewer():
    return {"Authorization": "Bearer viewer-token"}


@pytest.fixture
def low_write_limit():
    original = write_limiter.limit
    write_limiter.limit = 2
    yield
    write_limiter.limit = original
