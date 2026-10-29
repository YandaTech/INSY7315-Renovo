from sqlalchemy.orm import declarative_base

# Create a base class for map class definitions.
# All ORM models (database tables) will inherit from this Base class.
Base = declarative_base()
