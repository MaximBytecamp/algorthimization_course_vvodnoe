"""Проверки контракта: правила из docs/API_STYLE_GUIDE.md, записанные тестами."""

import json
from pathlib import Path

from app.main import app

HTTP_METHODS = {"get", "put", "post", "delete", "options", "head", "patch", "trace"}
ROOT = Path(__file__).resolve().parents[1]


def operations(schema):
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            if method in HTTP_METHODS:
                yield path, method, operation


def test_openapi_contract_has_required_metadata():
    schema = app.openapi()

    assert schema["info"]["title"]
    assert schema["info"]["version"]
    assert schema["info"]["description"]
    assert schema["info"]["contact"]["name"]


def test_every_operation_has_operation_id():
    schema = app.openapi()
    for path, method, operation in operations(schema):
        assert operation.get("operationId"), f"{method.upper()} {path} has no operationId"


def test_operation_ids_are_unique():
    ids = [operation["operationId"] for _, _, operation in operations(app.openapi())]
    assert len(ids) == len(set(ids))


def test_every_operation_has_tag_and_summary():
    for path, method, operation in operations(app.openapi()):
        assert operation.get("tags"), f"{method.upper()} {path} has no tags"
        assert operation.get("summary"), f"{method.upper()} {path} has no summary"


def test_every_operation_defines_success_response():
    for path, method, operation in operations(app.openapi()):
        assert any(code.startswith("2") for code in operation["responses"]), f"{method.upper()} {path}"


def test_errors_use_problem_details():
    for path, method, operation in operations(app.openapi()):
        for code, response in operation["responses"].items():
            if code.startswith(("4", "5")):
                assert list(response["content"]) == ["application/problem+json"], f"{method.upper()} {path} {code}"


def test_write_operations_require_bearer_token():
    for path, method, operation in operations(app.openapi()):
        if method in {"post", "put", "patch", "delete"}:
            assert operation.get("security") == [{"BearerAuth": []}], f"{method.upper()} {path}"


def test_paths_use_major_version_prefix():
    assert all(path.startswith("/api/v1/") for path in app.openapi()["paths"])


def test_committed_openapi_matches_code():
    committed = json.loads((ROOT / "openapi" / "openapi.json").read_text(encoding="utf-8"))
    assert committed == app.openapi(), "run: python scripts/export_openapi.py"
