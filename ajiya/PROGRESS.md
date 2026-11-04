<!-- Written by ajiya build. Do not edit: run 'ajiya build'. -->
# renovo: progress

Generated 2026-11-04.

## Milestones

| Milestone | Closed | Required | % | Can start now |
|---|---|---|---|---|
| hardened | 19 | 19 | 100% | 0 |
| final-submission | 30 | 33 | 90% | 3 |

## Phases

| Phase | Done | In progress | Pending | Total | % | Milestone |
|---|---|---|---|---|---|---|
| Access-control | 5 | 0 | 0 | 5 | 100% | hardened |
| Audit-trail | 2 | 0 | 0 | 2 | 100% | hardened |
| Api-hardening | 6 | 0 | 0 | 6 | 100% | hardened |
| Supply-chain | 1 | 0 | 0 | 1 | 100% | hardened |
| Security-assessment | 3 | 0 | 0 | 3 | 100% | hardened |
| Dashboard-ux | 2 | 0 | 0 | 2 | 100% | hardened |
| Data | 6 | 0 | 0 | 6 | 100% | final-submission |
| Release | 5 | 0 | 3 | 8 | 62% | final-submission |
| Operations | 5 | 0 | 0 | 5 | 100% | final-submission |
| Notifications | 7 | 0 | 0 | 7 | 100% | final-submission |
| Pipeline | 5 | 0 | 0 | 5 | 100% | final-submission |

## Can start now

- **RN-0039** Submit the live deployment URL on ARC (infra) · final-submission
- **RN-0041** EXPO presentation with live end-to-end demo (infra) · final-submission
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra) · final-submission

## Waiting

Nothing.

## Needs a human

- **RN-0039** Submit the live deployment URL on ARC (infra): ARC submission is done by the PM in the browser
- **RN-0041** EXPO presentation with live end-to-end demo (infra): slides, physical board and rehearsal are done by the team
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra): each member signs and submits their own forms

## Recent activity

- 2026-11-04 `3c722dd` Update test counts in the report (RN-0040)
- 2026-11-04 `69f0064` Fix stale password reset, Twilio and business description lines (chore)
- 2026-11-04 `3ed1d2a` Fix F15 bad-input 500s, F12 login timing and the Express banner (F14) (chore)
- 2026-11-04 `32e0bee` Merge the deployment lifecycle doc, README rewrite, changelog and templates (RN-0032)
- 2026-11-04 `a64b2de` Avoid a leading slash in a mermaid decision label (RN-0032)
- 2026-11-04 `0240b30` Document the deployment lifecycle and the CI-gated automatic deploy (RN-0032)
  - RN-0032: pending → in_progress
- 2026-11-04 `ea55f7c` Add a changelog for v1.0.0, a PR template and a bug report template (RN-0032)
- 2026-11-04 `44d7b0d` Rewrite the README with live links, architecture, tests, docs and team (RN-0032)
- 2026-11-04 `af86ced` Drop unused variables from the env examples and add POSTGRES_PASSWORD (RN-0032)
- 2026-11-04 `fe78b35` Correct encryption at rest, API access and Twilio ownership in the docs (RN-0040)
- 2026-11-04 `13e758c` Deploy only commits that passed CI and record each deploy in GitHub (RN-0031, RN-0032)
- 2026-11-04 `1569106` Describe the password reset and session ending in the report (RN-0040)
- 2026-11-04 `56320db` Merge the admin password reset and session ending on password change (chore)
- 2026-11-04 `afea746` Record the F11 and F13 fixes and the admin password reset in the docs (chore)
- 2026-11-04 `c7a631e` Add a Reset password action to the Staff page (chore)
- and 125 more in data.js

## Checks

0 error(s), 1 warning(s).

- W003 ajiya/operations.md:11: RN-0036 was done in commit 5a72bc0, which changed nothing under backend. Fix: check that the trailer names the right ticket
