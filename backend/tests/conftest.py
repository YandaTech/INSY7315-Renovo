import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.limiter import limiter
from app.db import get_db
from app.main import app
from app.models.base import Base

# StaticPool ensures all sessions and threads share the exact same in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override app's database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def disable_rate_limits():
    """Disable slowapi limits across all test suites by default."""
    limiter.enabled = False
    yield
    limiter.enabled = False


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    res = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    return {"Authorization": f"Bearer {res.json()['access_token']}"}
