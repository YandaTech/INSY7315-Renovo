# Changelog

All notable changes to Renovo Cape's AI receptionist are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/). Dates come
from the git history. Versions before 1.0.0 were not tagged at the time.
They mark the main milestones in that history.

## [Unreleased]

## [1.0.0] - 2026-11-05

Final release for the INSY7315 submission. The system has run on AWS EC2
since 5 Oct 2026. This release adds everything built after the Task 2
feedback.

### Voice and AI

- The receptionist greets callers as an AI and says the call is transcribed.
- A failed or incomplete quote leaves the lead unquoted ("Pending"), and the
  agent promises a callback instead of quoting R0.
- The agent asks for a mobile number and an optional email address, then
  confirms them.

### Notifications

- Quote SMS after every quoted call, sent through AWS End User Messaging
  (SMSPortal and Twilio remain as options).
- Quote email through Amazon SES when the caller gives an address.
- Every SMS and email attempt is logged as `sent` or `failed` and counted on
  the Statistics page.

### Dashboard

- Staff page for admins: add accounts, deactivate them and reset their
  passwords.
- Audit log page with user and date filters.
- Toast messages for every failed action.
- Focus trap in the lead panel and the Log a call dialog.
- Session kept in an httpOnly cookie instead of `localStorage`.
- Unused Vite template assets removed.

### Backend and data

- Routes split into 8 routers. Calls, leads and notifications take typed JSON
  bodies, so no personal data appears in URLs.
- Production moved from SQLite to PostgreSQL 16 in the Compose stack.
- Alembic migrations (5), run automatically when the backend starts.
- Job details stored as real columns on `leads`.
- Admin and staff roles. Deactivating an account or changing its password
  ends its sessions.
- Append-only audit log of security events.

### Security

- Login rate limit of 5 attempts a minute per real client IP.
- Twilio webhook signatures required in production (fails closed).
- Security headers and a Content-Security-Policy in Caddy. API docs hidden in
  production.
- Call content and phone numbers kept out of logs.
- Every dependency pinned and patched. `npm audit` and `pip-audit` run in CI.
- Nmap and OWASP ZAP baseline scan and retest, with a CVSS-scored
  vulnerability report (`docs/security/report.md`).

### Operations and CI/CD

- CI runs 8 jobs on every push: backend (against PostgreSQL 16), frontend
  (lint, Vitest, build), pricing server, voice-bridge, AI agent, Docker build,
  dependency scans, and 13 Playwright end-to-end tests against the full
  Docker stack.
- Automatic deploy of every `main` commit that passed CI
  (`deploy/autodeploy.sh`). Each deploy has a GitHub Deployment record, a
  pre-deploy backup, a fresh-folder deploy, a health check and automatic
  rollback.
- Nightly `pg_dump` backups kept 14 days, and a tested restore from an EBS
  snapshot.
- Container logs in CloudWatch, with an error alarm emailed through SNS.
- Uptime check from GitHub every 10 minutes.
- Incident response runbook, deployment lifecycle document, PR template and
  this changelog.

## [0.4.0] - 2026-11-01

Team work merged to `main` after Task 2 (PRs #13 and #14).

### Added

- Notification logging in the backend, and the first real SMS and email
  sending functions (PR #13, merged 29 Oct 2026).
- Login rate limiting with slowapi, httpOnly cookie sessions with a logout
  endpoint, and PostgreSQL connection pooling (PR #14, merged 1 Nov 2026).
- CI frontend build checks and Docker build verification (PR #14).

## [0.3.0] - 2026-10-05

First production deploy (PR #8, then PRs #9 to #12).

### Added

- Every finished call becomes a lead with a real transcript.
- The whole stack runs with `docker compose up --build`.
- Renovo Cape's real services and prices in the pricing rules.
- The dashboard uses real authentication and data.
- AWS EC2 deploy with Docker Compose and Caddy HTTPS for the dashboard and
  voice hostnames (`5b65384`).
- Twilio request signature checks.
- Public sign-up closes after the first account.
- Browser demo phone for calling the receptionist from the dashboard (PR #9).
- Lead detail panel with the call transcript (PR #10).
- ElevenLabs as the default receptionist voice (PR #11).

### Changed

- `SECRET_KEY` is required, and tokens expire after 60 minutes by default
  (PR #12).

## [0.2.0] - 2026-10-04

The Task 2 build: each service works, on developer machines only.

### Added

- Claude Haiku phone agent on Twilio ConversationRelay, and the MCP pricing
  server (PR #5, merged 2 Oct 2026).
- bcrypt and JWT authentication, protected endpoints, an automated pytest
  suite, Docker multi-stage builds and the first GitHub Actions pipeline
  (PR #6, merged 4 Oct 2026).
- Dashboard pages: login, sign-up, dashboard, log call, statistics, profile
  and pricing (on `main` from 26 Sep 2026). Call logging and status updates
  work against the backend from 2 Oct 2026.

### Changed

- ConversationRelay WebSocket handling cleaned up (PR #7).

## [0.1.0] - 2026-09-18

First working services.

### Added

- Repository created (11 Sep 2026).
- FastAPI backend with call and lead endpoints and Swagger docs (PR #2,
  merged 17 Sep 2026).
- Voice Bridge: Twilio voice webhook, call state, WebSocket streaming and
  saving finished calls to the backend (PR #3, merged 18 Sep 2026).
- First versions of the pricing rules engine and the Claude Haiku agent on
  the `ali` branch (18 Sep 2026).

## Task 1 (August 2026)

Planning and design, before this repository existed: requirements, user
roles and stories, journey maps, UML and ERD, architecture, DevOps plan,
running costs and a prototype (final report, section 1.6). No code from
Task 1 is in this history.

[Unreleased]: https://github.com/YandaTech/INSY7315-Renovo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YandaTech/INSY7315-Renovo/releases/tag/v1.0.0
[0.4.0]: https://github.com/YandaTech/INSY7315-Renovo/commit/f7ebb5d
[0.3.0]: https://github.com/YandaTech/INSY7315-Renovo/pull/12
[0.2.0]: https://github.com/YandaTech/INSY7315-Renovo/pull/7
[0.1.0]: https://github.com/YandaTech/INSY7315-Renovo/pull/3
