"""Job factors as real columns on leads, filled from the job_details JSON.

Also drops scope, urgency and materials_grade: an earlier model had them,
and the old start-up code may have added them, but no call collects them.

Revision ID: 0002_lead_job_columns
Revises: 0001_baseline
Create Date: 2026-11-03
"""

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_lead_job_columns"
down_revision: Union[str, Sequence[str], None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (name, type, max length for text values)
NEW_COLUMNS = [
    ("job_type", sa.String(length=50), 50),
    ("quantity", sa.Integer(), None),
    ("material", sa.String(length=50), 50),
    ("damage_level", sa.String(length=50), 50),
    ("travel_zone", sa.String(length=50), 50),
    ("suburb", sa.String(length=100), 100),
]
STALE_COLUMNS = ["scope", "urgency", "materials_grade"]


def _clean(value, limit):
    """A factor value as stored in its column, or None if unusable."""
    if limit is None:
        try:
            quantity = int(value)
        except (TypeError, ValueError):
            return None
        return quantity if quantity >= 1 else None
    if value is None or value == "":
        return None
    return str(value)[:limit]


def upgrade() -> None:
    bind = op.get_bind()
    existing = {c["name"] for c in sa.inspect(bind).get_columns("leads")}

    with op.batch_alter_table("leads") as batch:
        for name, type_, _ in NEW_COLUMNS:
            if name in existing:
                # Added earlier by the old start-up code, possibly untyped
                batch.alter_column(name, type_=type_, existing_nullable=True)
            else:
                batch.add_column(sa.Column(name, type_, nullable=True))
        for name in STALE_COLUMNS:
            if name in existing:
                batch.drop_column(name)
        batch.create_index("ix_leads_job_type", ["job_type"])

    # Copy the factors out of each lead's job_details JSON
    leads = sa.table(
        "leads",
        sa.column("id", sa.Integer),
        sa.column("job_details", sa.Text),
        *[sa.column(name, type_) for name, type_, _ in NEW_COLUMNS],
    )
    rows = bind.execute(
        sa.select(leads.c.id, leads.c.job_details).where(
            leads.c.job_details.isnot(None)
        )
    ).all()
    for lead_id, raw in rows:
        try:
            factors = json.loads(raw)
        except (TypeError, ValueError):
            continue
        if not isinstance(factors, dict):
            continue
        values = {
            name: _clean(factors.get(name), limit) for name, _, limit in NEW_COLUMNS
        }
        bind.execute(leads.update().where(leads.c.id == lead_id).values(**values))


def downgrade() -> None:
    # job_details still holds every factor, so nothing is lost
    with op.batch_alter_table("leads") as batch:
        batch.drop_index("ix_leads_job_type")
        for name, _, _ in NEW_COLUMNS:
            batch.drop_column(name)
