<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Data

Goal: Lead data has real columns and schema changes ship as migrations

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0020 | backend | Alembic migrations run on start | alembic upgrade head works on an empty database and on the existing renovo.db; add_missing_columns is gone; tests pass | - | - | 🟥 Pending |
| RN-0021 | backend | Job details as real columns | A migration moves the JSON job details into columns, the API returns them, and the dashboard shows them | RN-0014, RN-0020 | - | 🟥 Pending |
| RN-0022 | infra | Choose the production database (move off SQLite) | Decision recorded with the provider and its cost | - | - | 🟥 Pending · Needs a human: hosting and budget decision |
