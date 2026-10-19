<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Operations

Goal: The team hears about failures first and can recover from them

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0033 | infra | Incident response runbook and data design note | docs/incident-response.md says who is told, what is checked and how customers hear; docs/security-design.md explains single-tenant isolation and retention | - | - | 🟥 Pending |
| RN-0034 | infra | Test a backup restore | An EBS snapshot was restored to a test volume and the leads were readable; date written in deploy/README.md | RN-0002 | - | 🟥 Pending · Needs a human: needs the AWS console |
| RN-0035 | infra | Choose error tracking and uptime monitoring | Provider chosen and project DSN or monitor created | - | - | 🟥 Pending · Needs a human: needs an account |
| RN-0036 | backend | Report errors and downtime to the chosen service | An exception in backend or voice-bridge shows up in the tracker, and the uptime monitor alerts when /health fails | RN-0035 | - | 🟥 Pending |
