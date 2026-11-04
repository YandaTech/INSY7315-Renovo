from fastapi import Request
from slowapi import Limiter

from app.core.config import settings


def client_ip(request: Request) -> str:
    """The IP address of the client that made the request.

    In production uvicorn runs with --proxy-headers and trusts only the
    Docker network (see the Dockerfile), so request.client is the real
    visitor taken from X-Forwarded-For, not Caddy or nginx. Without that,
    every visitor would share the proxy's address and one rate limit.
    A forwarded header from anyone else is ignored, so it cannot be faked.
    """
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


limiter = Limiter(
    key_func=client_ip,
    enabled=settings.ENABLE_RATE_LIMITING,
)
