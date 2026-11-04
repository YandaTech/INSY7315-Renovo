"""Input limits that keep request values inside what the database accepts.

PostgreSQL refuses two things that SQLite lets through: a NUL character
(\\x00) in a text value, and an integer outside the 32-bit range of an
INTEGER column. Either one used to reach the database and come back as an
unhandled error (HTTP 500). The types here reject such values while the
request is validated, so the client gets a 422 and the database never
sees them.
"""

from typing import Annotated, Any

from fastapi import Path, Query
from pydantic import AfterValidator, BaseModel, field_validator

# The range of a PostgreSQL INTEGER (and of every id column in the models)
INT32_MIN = -(2**31)
INT32_MAX = 2**31 - 1

# Any string without a NUL character
NO_NUL_PATTERN = r"^[^\x00]*$"
NUL_MESSAGE = "must not contain NUL (\\x00) characters"


def contains_nul(value: Any) -> bool:
    """True if value, or any string inside it (keys included), has a NUL."""
    if isinstance(value, str):
        return "\x00" in value
    if isinstance(value, dict):
        return any(contains_nul(k) or contains_nul(v) for k, v in value.items())
    if isinstance(value, (list, tuple, set)):
        return any(contains_nul(item) for item in value)
    return False


def reject_nul(value: Any) -> Any:
    if contains_nul(value):
        raise ValueError(NUL_MESSAGE)
    return value


# A string (or nested JSON value) that must not contain NUL
NoNul = AfterValidator(reject_nul)


class InputModel(BaseModel):
    """Base for request bodies: no field may contain a NUL character,
    including strings nested inside dict or list fields."""

    @field_validator("*", mode="after")
    @classmethod
    def _no_nul(cls, value: Any) -> Any:
        return reject_nul(value)


# Path and query parameters
RowId = Annotated[int, Path(ge=INT32_MIN, le=INT32_MAX)]
PathText = Annotated[str, Path(pattern=NO_NUL_PATTERN)]
Offset = Annotated[int, Query(ge=0, le=INT32_MAX)]
Limit = Annotated[int, Query(ge=0, le=INT32_MAX)]
