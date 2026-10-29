import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import get_db
from app.models.base import Base
from app.models.user import AdminUser
from app.models.call import CallLog
from app.models.lead import Lead

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
    # Build schema fresh per test
    Base.metadata.create_all(bind=engine)
    yield
    # Tear down tables after test completes
    Base.metadata.drop_all(bind=engine)


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
