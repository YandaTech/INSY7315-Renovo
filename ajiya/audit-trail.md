<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Audit-trail

Goal: Every security-relevant action is recorded append-only with who, when and from where

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0012 | backend | Append-only audit log of security events | Tests show logins, failed logins, user changes, password changes, lead deletes and pricing edits each write an event with actor, time and IP; no API edits or deletes events | RN-0010 | - | 🟩 Done · e5a6168 · 2026-11-04 · tests passed · Note: audit_events (0004) with actor, time, IP; ORM and DB triggers block UPDATE/DELETE; tests/test_audit.py; CI run 41874792097 green (backend 101 incl. PostgreSQL, frontend 65); deployed 4 Nov 2026 |
| RN-0013 | frontend | Audit log page with user and date filters | An admin can filter events by user and date range in the dashboard | RN-0011, RN-0012 | - | 🟩 Done · 5142f64 · 2026-11-04 · tests passed · Note: /audit page with user and date filters, admin only; src/lib/audit.ts tests; CI run 41874792097 green (backend 101 incl. PostgreSQL, frontend 65); deployed 4 Nov 2026 |
