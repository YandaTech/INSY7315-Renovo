from fastapi import APIRouter, Depends, HTTPException, status
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import AdminUser

router = APIRouter(prefix="/voice", tags=["Demo phone"])

TOKEN_TTL_SECONDS = 600


@router.get("/token")
def demo_phone_token(current_user: AdminUser = Depends(get_current_user)):
    """
    Short-lived Twilio access token for the dashboard's browser demo phone
    (Protected). It can only place outgoing calls to the Renovo TwiML app,
    which runs the same AI receptionist as a real phone call.
    """
    required = (
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_API_KEY_SID,
        settings.TWILIO_API_KEY_SECRET,
        settings.TWILIO_TWIML_APP_SID,
    )
    if not all(required):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo phone isn't configured on the server.",
        )

    token = AccessToken(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_API_KEY_SID,
        settings.TWILIO_API_KEY_SECRET,
        identity=f"staff-{current_user.username}",
        ttl=TOKEN_TTL_SECONDS,
    )
    token.add_grant(
        VoiceGrant(
            outgoing_application_sid=settings.TWILIO_TWIML_APP_SID,
            incoming_allow=False,
        )
    )
    return {"token": token.to_jwt(), "expires_in": TOKEN_TTL_SECONDS}
