<!-- Written by ajiya build. Do not edit: run 'ajiya build'. -->
# renovo: progress

Generated 2026-11-04.

## Milestones

| Milestone | Closed | Required | % | Can start now |
|---|---|---|---|---|
| hardened | 16 | 19 | 84% | 0 |
| final-submission | 23 | 33 | 69% | 7 |

## Phases

| Phase | Done | In progress | Pending | Total | % | Milestone |
|---|---|---|---|---|---|---|
| Access-control | 5 | 0 | 0 | 5 | 100% | hardened |
| Audit-trail | 2 | 0 | 0 | 2 | 100% | hardened |
| Api-hardening | 6 | 0 | 0 | 6 | 100% | hardened |
| Supply-chain | 1 | 0 | 0 | 1 | 100% | hardened |
| Security-assessment | 0 | 1 | 2 | 3 | 0% | hardened |
| Dashboard-ux | 2 | 0 | 0 | 2 | 100% | hardened |
| Data | 6 | 0 | 0 | 6 | 100% | final-submission |
| Release | 2 | 0 | 6 | 8 | 25% | final-submission |
| Operations | 3 | 1 | 1 | 5 | 60% | final-submission |
| Notifications | 7 | 0 | 0 | 7 | 100% | final-submission |
| Pipeline | 3 | 0 | 2 | 5 | 60% | final-submission |

## Can start now

- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra) · final-submission
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra) · final-submission
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra) · final-submission
- **RN-0004** Turn on GitHub repo Insights for the marker (infra) · final-submission
- **RN-0034** Test a backup restore (infra) · final-submission
- **RN-0039** Submit the live deployment URL on ARC (infra) · final-submission
- **RN-0041** EXPO presentation with live end-to-end demo (infra) · final-submission

## Waiting

- **RN-0006** Vulnerability report with CVSS, location and fix for each finding (infra) waits on RN-0005
- **RN-0032** Deploy main automatically, with a rollback (infra) waits on RN-0031
- **RN-0037** Retest after fixes and update the report (infra) waits on RN-0006
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra) waits on RN-0040

## Needs a human

- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra): team decision; Yaseera's push lands first
- **RN-0004** Turn on GitHub repo Insights for the marker (infra): repository settings need an owner
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra): needs the server's SSH key
- **RN-0034** Test a backup restore (infra): needs the AWS console
- **RN-0039** Submit the live deployment URL on ARC (infra): ARC submission is done by the PM in the browser
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra): team document written and agreed by all members
- **RN-0041** EXPO presentation with live end-to-end demo (infra): slides, physical board and rehearsal are done by the team
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra): each member signs and submits their own forms

## Recent activity

- 2026-11-04 `36951b9` Update the database copy test for user roles and audit events (RN-0010, RN-0012)
- 2026-11-04 `6b9ef7d` Merge branch 'worktree-agent-acbf8423309afc44a' into ali-dev (-)
- 2026-11-04 `dbd8c62` Add a pull-based auto-deploy script and systemd timer for main (RN-0031, RN-0032)
- 2026-11-04 `d656b80` Add an audit log page with user and date filters (RN-0013)
- 2026-11-04 `281316c` Send container logs to CloudWatch, alarm on errors, check uptime from GitHub (RN-0035, RN-0036)
- 2026-11-04 `a390158` Add a Staff page where admins manage accounts (RN-0011)
- 2026-11-04 `21b109e` Mark live quote SMS and the email provider done in Ajiya (RN-0046, RN-0024)
  - RN-0024: pending → done
  - RN-0046: in_progress → done
- 2026-11-04 `e74f8c7` Use the cookie session in the dashboard instead of localStorage (RN-0009)
- 2026-11-04 `02c81d7` Mark PostgreSQL, hosting rationale, quote email and notification counts done in Ajiya (RN-0022, RN-0003, RN-0025)
  - RN-0003: pending → done
  - RN-0022: pending → done
  - RN-0025: pending → done
  - RN-0043: pending → done
- 2026-11-04 `5a44fa2` Record security events in an append-only audit log (RN-0012)
- 2026-11-04 `c130016` Bring the hosting and security docs up to date (RN-0003)
- 2026-11-04 `3fe5b79` Keep the backup script's docker exec off stdin (RN-0022)
- 2026-11-04 `4fdba33` Merge branch 'worktree-agent-ab4a8cc4cc61e4904' into ali-dev (-)
- 2026-11-04 `049c004` Add admin and staff roles, and deactivation that ends sessions (RN-0010, RN-0011)
- 2026-11-04 `a9f68ae` Show sent and failed SMS and email counts on the Statistics page (RN-0043)
- and 92 more in data.js

## Checks

0 error(s), 4 warning(s).

- W008 ajiya/operations.md:9: RN-0034 has needed a human (needs the AWS console) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/pipeline.md:11: RN-0031 has needed a human (needs the server's SSH key) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:8: RN-0001 has needed a human (team decision; Yaseera's push lands first) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:11: RN-0004 has needed a human (repository settings need an owner) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
