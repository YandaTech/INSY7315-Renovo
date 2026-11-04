<!-- Written by ajiya build. Do not edit: run 'ajiya build'. -->
# renovo: progress

Generated 2026-11-02.

## Milestones

| Milestone | Closed | Required | % | Can start now |
|---|---|---|---|---|
| hardened | 8 | 19 | 42% | 2 |
| final-submission | 13 | 33 | 39% | 12 |

## Phases

| Phase | Done | In progress | Pending | Total | % | Milestone |
|---|---|---|---|---|---|---|
| Access-control | 0 | 0 | 5 | 5 | 0% | hardened |
| Audit-trail | 0 | 0 | 2 | 2 | 0% | hardened |
| Api-hardening | 5 | 0 | 1 | 6 | 83% | hardened |
| Supply-chain | 1 | 0 | 0 | 1 | 100% | hardened |
| Security-assessment | 0 | 1 | 2 | 3 | 0% | hardened |
| Dashboard-ux | 2 | 0 | 0 | 2 | 100% | hardened |
| Data | 3 | 0 | 3 | 6 | 50% | final-submission |
| Release | 1 | 0 | 7 | 8 | 12% | final-submission |
| Operations | 2 | 0 | 3 | 5 | 40% | final-submission |
| Notifications | 3 | 1 | 3 | 7 | 42% | final-submission |
| Pipeline | 2 | 1 | 2 | 5 | 40% | final-submission |

## Can start now

- **RN-0007** Rate-limit login (backend) · hardened
- **RN-0015** Move call, lead and pricing routes out of main.py into routers (backend) · hardened
- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra) · final-submission
- **RN-0024** Choose an email provider and verify a sender domain (infra) · final-submission
- **RN-0020** Alembic migrations run on start (backend) · final-submission
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra) · final-submission
- **RN-0035** Choose error tracking and uptime monitoring (infra) · final-submission
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra) · final-submission
- **RN-0003** Write the hosting rationale (EC2 + Caddy instead of Railway) (infra) · final-submission
- **RN-0004** Turn on GitHub repo Insights for the marker (infra) · final-submission
- **RN-0022** Choose the production database (move off SQLite) (infra) · final-submission
- **RN-0034** Test a backup restore (infra) · final-submission
- **RN-0039** Submit the live deployment URL on ARC (infra) · final-submission
- **RN-0041** EXPO presentation with live end-to-end demo (infra) · final-submission

## Waiting

- **RN-0006** Vulnerability report with CVSS, location and fix for each finding (infra) waits on RN-0005
- **RN-0008** Session in an httpOnly cookie, with logout (backend) waits on RN-0007
- **RN-0009** Dashboard uses the cookie session instead of localStorage (frontend) waits on RN-0008
- **RN-0010** Admin and staff roles, with deactivation that ends sessions (backend) waits on RN-0008
- **RN-0011** Staff management page for admins (frontend) waits on RN-0009, RN-0010
- **RN-0012** Append-only audit log of security events (backend) waits on RN-0010
- **RN-0013** Audit log page with user and date filters (frontend) waits on RN-0011, RN-0012
- **RN-0021** Job details as real columns (backend) waits on RN-0020
- **RN-0025** Email quote confirmation when the caller gives an email (voice-bridge) waits on RN-0024
- **RN-0032** Deploy main automatically, with a rollback (infra) waits on RN-0031
- **RN-0036** Report errors and downtime to the chosen service (backend) waits on RN-0035
- **RN-0037** Retest after fixes and update the report (infra) waits on RN-0006, RN-0009, RN-0010, RN-0012
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra) waits on RN-0040
- **RN-0043** Statistics page shows sent SMS and email counts (frontend) waits on RN-0025

## Needs a human

- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra): team decision; Yaseera's push lands first
- **RN-0003** Write the hosting rationale (EC2 + Caddy instead of Railway) (infra): only the team knows why Railway was dropped
- **RN-0004** Turn on GitHub repo Insights for the marker (infra): repository settings need an owner
- **RN-0022** Choose the production database (move off SQLite) (infra): hosting and budget decision
- **RN-0024** Choose an email provider and verify a sender domain (infra): needs an account and DNS access
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra): needs the server's SSH key
- **RN-0034** Test a backup restore (infra): needs the AWS console
- **RN-0035** Choose error tracking and uptime monitoring (infra): needs an account
- **RN-0039** Submit the live deployment URL on ARC (infra): ARC submission is done by the PM in the browser
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra): team document written and agreed by all members
- **RN-0041** EXPO presentation with live end-to-end demo (infra): slides, physical board and rehearsal are done by the team
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra): each member signs and submits their own forms
- **RN-0046** Quote SMS through AWS End User Messaging (voice-bridge): AWS login, verifying destination numbers by OTP

## Recent activity

- 2026-11-02 `6371de8` Add Vitest unit tests for the frontend and run them in CI (RN-0030)
- 2026-11-02 `1da7c67` Fail CI on npm audit and pip-audit findings (RN-0029)
- 2026-11-02 `0c16116` Mark confirm the live host is up done in Ajiya (RN-0002)
  - RN-0002: pending → done
- 2026-11-02 `c068bf8` Start security scans in CI and frontend unit tests in Ajiya (RN-0029, RN-0030)
  - RN-0029: pending → in_progress
  - RN-0030: pending → in_progress
- 2026-11-02 `0def542` Mark CI runs every service's tests done in Ajiya (RN-0028)
  - RN-0028: in_progress → done
- 2026-11-02 `e581cfc` Format the incomplete-lead test with black (RN-0016)
- 2026-11-02 `df47edb` Mark quote SMS through AWS in progress in Ajiya (RN-0046)
  - RN-0046: pending → in_progress
- 2026-11-02 `0a3cf91` Mark pricing failure leaves the quote empty done in Ajiya (RN-0016)
  - RN-0016: pending → done
- 2026-11-02 `3c2b66e` Leave an incomplete call's lead unquoted (RN-0016)
- 2026-11-02 `0109893` Show a missing lead quote as Pending instead of R0 (RN-0016)
- 2026-11-02 `5c763b4` Save a lead with no quote when pricing fails (RN-0016)
- 2026-11-02 `6dd0202` Send a lead's quote as null, not 0, when the call has none (RN-0016)
- 2026-11-02 `e47c703` Never give the caller a zero-rand quote when pricing fails (RN-0016)
- 2026-11-02 `2bc6c6a` Mark keep personal data out of logs done in Ajiya (RN-0047)
  - RN-0047: pending → done
- 2026-11-02 `a80e61c` Keep call content and phone numbers out of logs (RN-0047)
- and 93 more in data.js

## Checks

0 error(s), 8 warning(s).

- W008 ajiya/data.md:10: RN-0022 has needed a human (hosting and budget decision) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/notifications.md:9: RN-0024 has needed a human (needs an account and DNS access) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/operations.md:9: RN-0034 has needed a human (needs the AWS console) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/operations.md:10: RN-0035 has needed a human (needs an account) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/pipeline.md:11: RN-0031 has needed a human (needs the server's SSH key) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:8: RN-0001 has needed a human (team decision; Yaseera's push lands first) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:10: RN-0003 has needed a human (only the team knows why Railway was dropped) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:11: RN-0004 has needed a human (repository settings need an owner) for 14 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
