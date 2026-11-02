from app.core.config import settings

SMS = {
    "type": "sms",
    "recipient": "+27820000001",
    "message": "Hi James, your quote is R3,370.",
    "provider_id": "SM123",
}


def test_service_key_logs_notification_from_json_body(
    client, auth_headers, monkeypatch
):
    monkeypatch.setattr(settings, "SERVICE_API_KEY", "bridge-secret")
    response = client.post(
        "/notifications/", json=SMS, headers={"X-Service-Key": "bridge-secret"}
    )
    assert response.status_code == 200
    assert response.json()["recipient"] == "+27820000001"
    assert response.json()["status"] == "sent"

    logged = client.get("/notifications/", headers=auth_headers).json()
    assert [n["message"] for n in logged] == [SMS["message"]]


def test_notification_requires_auth(client):
    assert client.post("/notifications/", json=SMS).status_code == 401


def test_notification_not_accepted_in_query_string(client, auth_headers):
    response = client.post("/notifications/", params=SMS, headers=auth_headers)
    assert response.status_code == 422


def test_notification_body_is_validated(client, auth_headers):
    bad = [
        {**SMS, "type": "fax"},
        {**SMS, "status": "maybe"},
        {**SMS, "recipient": ""},
        {k: v for k, v in SMS.items() if k != "message"},
    ]
    for body in bad:
        response = client.post("/notifications/", json=body, headers=auth_headers)
        assert response.status_code == 422, body
