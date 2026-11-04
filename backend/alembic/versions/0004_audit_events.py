"""Append-only audit log of security events.

Creates audit_events, plus a trigger that refuses UPDATE and DELETE on it,
so not even a bug or a direct SQL session through the app's connection can
rewrite history. The trigger is written per database (PostgreSQL in
production, SQLite in development and before the move).

Revision ID: 0004_audit_events
Revises: 0003_user_roles
Create Date: 2026-11-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_audit_events"
down_revision: Union[str, Sequence[str], None] = "0003_user_roles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MESSAGE = "audit_events is append-only"


def upgrade() -> None:
    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("event", sa.String(length=50), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("actor_username", sa.String(length=50), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("target_type", sa.String(length=30), nullable=True),
        sa.Column("target_id", sa.String(length=50), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["actor_id"], ["admin_users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_created_at", "audit_events", ["created_at"])
    op.create_index("ix_audit_events_event", "audit_events", ["event"])
    op.create_index("ix_audit_events_actor_id", "audit_events", ["actor_id"])

    dialect = op.get_bind().dialect.name
    if dialect == "postgresql":
        op.execute(f"""
            CREATE FUNCTION audit_events_append_only() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION '{MESSAGE}';
            END;
            $$ LANGUAGE plpgsql
            """)
        op.execute(
            "CREATE TRIGGER audit_events_append_only"
            " BEFORE UPDATE OR DELETE ON audit_events"
            " FOR EACH ROW EXECUTE FUNCTION audit_events_append_only()"
        )
    elif dialect == "sqlite":
        for action in ("UPDATE", "DELETE"):
            op.execute(
                f"CREATE TRIGGER audit_events_no_{action.lower()}"
                f" BEFORE {action} ON audit_events"
                f" BEGIN SELECT RAISE(ABORT, '{MESSAGE}'); END"
            )


def downgrade() -> None:
    dialect = op.get_bind().dialect.name
    if dialect == "postgresql":
        op.execute("DROP TRIGGER IF EXISTS audit_events_append_only ON audit_events")
        op.execute("DROP FUNCTION IF EXISTS audit_events_append_only()")
    elif dialect == "sqlite":
        op.execute("DROP TRIGGER IF EXISTS audit_events_no_update")
        op.execute("DROP TRIGGER IF EXISTS audit_events_no_delete")
    op.drop_index("ix_audit_events_actor_id", table_name="audit_events")
    op.drop_index("ix_audit_events_event", table_name="audit_events")
    op.drop_index("ix_audit_events_created_at", table_name="audit_events")
    op.drop_table("audit_events")
