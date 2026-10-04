def test_register_admin(client):
    response = client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testadmin"
    assert "id" in data


def test_register_duplicate_username_fails(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/register",
        json={"username": "testadmin", "password": "AnotherPassword456!"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"


def test_login_success(client):
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


def test_login_invalid_password(client):
    client.post(
        "/auth/register", json={"username": "testadmin", "password": "TestPassword123!"}
    )
    response = client.post(
        "/auth/login", data={"username": "testadmin", "password": "WrongPassword!"}
    )
    assert response.status_code == 401


def test_protected_route_without_token_fails(client):
    response = client.get("/leads/")
    assert response.status_code == 401


def test_protected_route_with_valid_token(client):
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
