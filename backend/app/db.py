from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

raw_db_url = settings.DATABASE_URL

# SQLAlchemy requires 'postgresql://', but many cloud providers provide 'postgres://'
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = raw_db_url.startswith("sqlite")

# Dialect-specific engine parameters
engine_kwargs = {}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL production pooling settings
    engine_kwargs.update(
        {
            "pool_pre_ping": True,
            "pool_size": 10,
            "max_overflow": 20,
        }
    )

engine = create_engine(raw_db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency yielding a transactional database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def add_missing_columns(base) -> None:
    """
    create_all() never alters existing tables, so a database made before a
    nullable column was added would break on every query. Add any such
    columns in place - enough for development databases without migrations.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing = {col["name"] for col in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name not in existing and column.nullable:
                    col_type = column.type.compile(dialect=engine.dialect)
                    conn.execute(
                        text(
                            f'ALTER TABLE "{table.name}" '
                            f'ADD COLUMN "{column.name}" {col_type}'
                        )
                    )
