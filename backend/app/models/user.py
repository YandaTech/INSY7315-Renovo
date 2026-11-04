from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    String,
    true,
)
from app.models.base import Base

# Admins manage staff accounts and prices; staff work the leads and calls.
ROLES = ("admin", "staff")


class AdminUser(Base):
    """
    A person who can log in to the dashboard, as an admin or as staff.

    Stores authentication credentials including indexed unique usernames
    and securely hashed password strings. Accounts are deactivated rather
    than deleted, so the audit log keeps pointing at who did what.
    """

    # Name of the database table
    __tablename__ = "admin_users"
    __table_args__ = (
        CheckConstraint("role IN ('admin', 'staff')", name="ck_admin_users_role"),
    )

    # Primary key: Unique auto-incrementing integer ID for each admin user
    id = Column(Integer, primary_key=True, index=True)

    # Unique username used for authentication
    # Indexed for rapid lookup during login checks and marked non-nullable
    username = Column(String(50), unique=True, nullable=False, index=True)

    # Securely hashed password string (e.g., via bcrypt/Argon2)
    # Stored with a length limit of 255 to accommodate standard hashing algorithms
    hashed_password = Column(String(255), nullable=False)

    # Optional profile details shown on the dashboard Profile page
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)

    # "admin" or "staff". Checked against the database on every request,
    # so a role change applies at once, not when the token expires.
    role = Column(String(20), nullable=False, default="staff")

    # A deactivated account cannot log in and its open sessions stop working
    is_active = Column(Boolean, nullable=False, default=True, server_default=true())

    # When the password was last changed or reset, in UTC (without tzinfo,
    # like audit_events.created_at). Tokens issued before it are refused,
    # so a password change or an admin reset ends every older session.
    # Empty for accounts whose password has not changed since this column
    # was added; their sessions are not affected.
    password_changed_at = Column(DateTime, nullable=True)

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"
