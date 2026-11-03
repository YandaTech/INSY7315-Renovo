import os

# Force the database URL to an in-memory SQLite database BEFORE importing FastAPI app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.limiter import limiter
from app.db import get_db
from app.main import app
from app.models.base import Base
import app.db as db_module

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkeypatch the app's session maker to use our test engine during tests
db_module.engine = engine
db_module.SessionLocal = TestingSessionLocal

@pytest.fixture(autouse=True)
def db_session():
    # Drop and recreate tables for absolute isolation per test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    
    def override_get_db():
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield session
    
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def disable_rate_limits():
    limiter.enabled = False
    yield
    limiter.enabled = False


@pytest.fixture
def client(db_session):
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    res = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    token = res.json()["access_token"]
    client.cookies.clear()
    return {"Authorization": f"Bearer {token}"}