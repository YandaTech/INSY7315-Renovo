<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Data

Goal: Lead data has real columns and schema changes ship as migrations

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0020 | backend | Alembic migrations run on start | alembic upgrade head works on an empty database and on the existing renovo.db; add_missing_columns is gone; tests pass | - | - | 🟥 Pending |
| RN-0021 | backend | Job details as real columns | A migration moves the JSON job details into columns, the API returns them, and the dashboard shows them | RN-0014, RN-0020 | - | 🟥 Pending |
| RN-0022 | infra | Choose the production database (move off SQLite) | Decision recorded with the provider and its cost | - | - | 🟥 Pending · Needs a human: hosting and budget decision |
| RN-0038 | backend | Pricing rules can be read and saved through the MCP server | GET and PUT /pricing/rules on the backend reach /mcp/pricing/rules on the MCP server, and the Pricing page Save persists the rules | - | path:backend/app/main.py path:backend/app/services/pricing_service.py path:mcp-pricing-server/server.py | 🟩 Done · 2e8ba3a · 2026-11-02 · tests passed · Note: Built in f866eb1 and e493573; this commit only links the evidence |
| RN-0048 | backend | Deleting a lead also deletes its call transcript | DELETE /leads/{id} removes the linked call log and transcript, with a test | - | - | 🟩 Done · c9320a1 · 2026-11-02 · tests passed |
| RN-0049 | voice-bridge | Greeting says the caller is speaking to an AI and the call is transcribed | The welcome greeting tells callers it is an AI assistant and the call is transcribed, in one short sentence (POPIA section 18) | - | path:ai-agent/prompts.py path:voice-bridge/src/greeting.js | 🟩 Done · a2f8e6a · 2026-11-02 · tests passed |
