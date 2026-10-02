from typing import Any

_sessions: dict[str, dict[str, Any]] = {}


def get_session(call_sid: str) -> dict[str, Any]:
    """Returns the session for call_sid, creating one if it doesn't exist yet."""
    if call_sid not in _sessions:
        _sessions[call_sid] = {
            "messages": [],
            "factors": {},
            "quote": None,
        }
    return _sessions[call_sid]


def append_message(call_sid: str, role: str, content: Any) -> None:
    session = get_session(call_sid)
    session["messages"].append({"role": role, "content": content})


def get_messages(call_sid: str) -> list[dict[str, Any]]:
    return get_session(call_sid)["messages"]


def update_factors(call_sid: str, factors: dict[str, Any]) -> dict[str, Any]:
    session = get_session(call_sid)
    session["factors"].update({k: v for k, v in factors.items() if v is not None})
    return session["factors"]


def set_quote(call_sid: str, quote: dict[str, Any]) -> None:
    get_session(call_sid)["quote"] = quote


def end_session(call_sid: str) -> None:
    _sessions.pop(call_sid, None)
