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


client = TestClient(app)


def test_register_admin():
    response = client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testadmin"
    assert "id" in data


def test_register_duplicate_username_fails():
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/register",
        json={"username": "testadmin", "password": "AnotherPassword456!"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


def test_login_success():
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password():
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/login", data={"username": "testadmin", "password": "WrongPassword!"}
    )
    assert response.status_code == 401


def test_protected_route_without_token_fails():
    response = client.get("/leads/")
    assert response.status_code == 401


def test_protected_route_with_valid_token():
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    login_res = client.post(
        "/auth/login", data={"username": "testadmin", "password": "TestPassword123!"}
    )
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/leads/", headers=headers)
    assert response.status_code == 200
    assert response.json() == []
