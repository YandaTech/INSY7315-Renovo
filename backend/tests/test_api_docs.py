import importlib

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.core.config import settings

DOC_PATHS = ["/docs", "/redoc", "/openapi.json"]


@pytest.fixture
def app_for_environment(monkeypatch):
    """Rebuild app.main under a given ENVIRONMENT, then restore it."""

    def build(environment: str):
        monkeypatch.setattr(settings, "ENVIRONMENT", environment)
        return importlib.reload(main_module).app

    yield build
    monkeypatch.undo()
    importlib.reload(main_module)


@pytest.mark.parametrize("path", DOC_PATHS)
def test_docs_served_in_development(app_for_environment, path):
    client = TestClient(app_for_environment("development"))
    assert client.get(path).status_code == 200


@pytest.mark.parametrize("path", DOC_PATHS)
def test_docs_hidden_in_production(app_for_environment, path):
    client = TestClient(app_for_environment("Production"))
    assert client.get(path).status_code == 404
    # The API itself is still served
    assert client.get("/health").json() == {"status": "ok"}
