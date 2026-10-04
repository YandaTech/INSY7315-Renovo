from sqlalchemy import Column, Integer, String
from app.models.base import Base


class AdminUser(Base):
    """
    Represents an administrative user with elevated access rights.

    Stores authentication credentials including indexed unique usernames
    and securely hashed password strings.
    """

    # Name of the database table
    __tablename__ = "admin_users"

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
