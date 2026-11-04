"""When each account's password last changed.

Adds admin_users.password_changed_at (UTC). The backend refuses a session
token issued before it, so changing or resetting a password ends every
older session (security finding F11).

Existing accounts get NULL: their passwords have not changed since the
column was added, so the sessions open during the upgrade keep working.

Revision ID: 0005_password_changed_at
Revises: 0004_audit_events
Create Date: 2026-11-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_password_changed_at"
down_revision: Union[str, Sequence[str], None] = "0004_audit_events"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("admin_users") as batch:
        batch.add_column(sa.Column("password_changed_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("admin_users") as batch:
        batch.drop_column("password_changed_at")
