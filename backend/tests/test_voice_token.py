import jwt

from app.core.config import settings


def configure(monkeypatch):
    monkeypatch.setattr(settings, "TWILIO_ACCOUNT_SID", "AC" + "0" * 32)
    monkeypatch.setattr(settings, "TWILIO_API_KEY_SID", "SK" + "1" * 32)
    monkeypatch.setattr(settings, "TWILIO_API_KEY_SECRET", "test-secret")
    monkeypatch.setattr(settings, "TWILIO_TWIML_APP_SID", "AP" + "2" * 32)


def test_token_requires_login(client, monkeypatch):
    configure(monkeypatch)
    assert client.get("/voice/token").status_code == 401


def test_token_unavailable_when_not_configured(client, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "TWILIO_API_KEY_SECRET", "")
    response = client.get("/voice/token", headers=auth_headers)
    assert response.status_code == 503


def test_token_only_allows_calling_the_renovo_app(client, auth_headers, monkeypatch):
    configure(monkeypatch)
    response = client.get("/voice/token", headers=auth_headers)
    assert response.status_code == 200

    claims = jwt.decode(
        response.json()["token"],
        "test-secret",
        algorithms=["HS256"],
        options={"verify_aud": False},
    )
    assert claims["iss"] == settings.TWILIO_API_KEY_SID
    assert claims["sub"] == settings.TWILIO_ACCOUNT_SID
    assert claims["exp"] - claims["nbf"] <= 600
    assert claims["grants"]["identity"] == "staff-testadmin"
    voice = claims["grants"]["voice"]
    assert voice["outgoing"]["application_sid"] == settings.TWILIO_TWIML_APP_SID
    assert not voice.get("incoming", {}).get("allow")
