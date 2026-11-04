"""Roles and deactivation for dashboard accounts.

Adds admin_users.role ("admin" or "staff") and admin_users.is_active.
Every account that exists before this migration becomes an active admin,
so nobody loses access; new accounts default to staff.

Revision ID: 0003_user_roles
Revises: 0002_lead_job_columns
Create Date: 2026-11-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_user_roles"
down_revision: Union[str, Sequence[str], None] = "0002_lead_job_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The server defaults fill in existing rows. role's is dropped again
    # afterwards so an insert that forgets the role never makes an admin.
    with op.batch_alter_table("admin_users") as batch:
        batch.add_column(
            sa.Column(
                "role",
                sa.String(length=20),
                nullable=False,
                server_default="admin",
            )
        )
        batch.add_column(
            sa.Column(
                "is_active",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            )
        )

    with op.batch_alter_table("admin_users") as batch:
        batch.alter_column(
            "role",
            existing_type=sa.String(length=20),
            existing_nullable=False,
            server_default=None,
        )
        batch.create_check_constraint(
            "ck_admin_users_role", "role IN ('admin', 'staff')"
        )


def downgrade() -> None:
    with op.batch_alter_table("admin_users") as batch:
        batch.drop_constraint("ck_admin_users_role", type_="check")
        batch.drop_column("is_active")
        batch.drop_column("role")
