<!-- Written by ajiya build. Do not edit: run 'ajiya build'. -->
# renovo: progress

Generated 2026-11-04.

## Milestones

| Milestone | Closed | Required | % | Can start now |
|---|---|---|---|---|
| hardened | 19 | 19 | 100% | 0 |
| final-submission | 24 | 33 | 72% | 6 |

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
| Release | 2 | 0 | 6 | 8 | 25% | final-submission |
| Operations | 4 | 1 | 0 | 5 | 80% | final-submission |
| Notifications | 7 | 0 | 0 | 7 | 100% | final-submission |
| Pipeline | 3 | 0 | 2 | 5 | 60% | final-submission |

## Can start now

- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra) · final-submission
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra) · final-submission
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra) · final-submission
- **RN-0004** Turn on GitHub repo Insights for the marker (infra) · final-submission
- **RN-0039** Submit the live deployment URL on ARC (infra) · final-submission
- **RN-0041** EXPO presentation with live end-to-end demo (infra) · final-submission

## Waiting

- **RN-0032** Deploy main automatically, with a rollback (infra) waits on RN-0031
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra) waits on RN-0040

## Needs a human

- **RN-0001** Merge Yaseera's final push, then ui-overhaul, into main (infra): team decision; Yaseera's push lands first
- **RN-0004** Turn on GitHub repo Insights for the marker (infra): repository settings need an owner
- **RN-0031** Add the EC2 deploy key to GitHub secrets (infra): needs the server's SSH key
- **RN-0039** Submit the live deployment URL on ARC (infra): ARC submission is done by the PM in the browser
- **RN-0040** Final report updated from Task 1 with Task 2 feedback (infra): team document written and agreed by all members
- **RN-0041** EXPO presentation with live end-to-end demo (infra): slides, physical board and rehearsal are done by the team
- **RN-0042** Individual submissions: ARC upload, peer evaluations, declaration (infra): each member signs and submits their own forms

## Recent activity

- 2026-11-04 `01b4e51` Write the vulnerability report with CVSS scores and retest results (RN-0006, RN-0037)
- 2026-11-04 `3e0cae8` Add retest scan results for ali-dev and passive live server checks (RN-0037)
- 2026-11-04 `841996c` Add the local security scan tooling and baseline scan results (RN-0005)
- 2026-11-04 `dd98953` Point commit references at the rewritten history (chore)
  - RN-0007: done → done
  - RN-0008: done → done
  - RN-0009: done → done
  - RN-0010: done → done
  - RN-0011: done → done
  - RN-0012: done → done
  - RN-0013: done → done
  - RN-0014: done → done
  - RN-0015: done → done
  - RN-0016: done → done
  - RN-0017: done → done
  - RN-0018: done → done
  - RN-0019: done → done
  - RN-0020: done → done
  - RN-0021: done → done
  - RN-0025: done → done
  - RN-0028: done → done
  - RN-0029: done → done
  - RN-0030: done → done
  - RN-0033: done → done
  - RN-0043: done → done
  - RN-0047: done → done
  - RN-0048: done → done
  - RN-0049: done → done
  - RN-0050: done → done
- 2026-11-04 `ba083df` Add full names and student numbers to the report and contributions page (RN-0040)
- 2026-11-04 `67873c8` Keep the Expo kit and submission documents out of git (chore)
- 2026-11-04 `8b81b0d` Run the AI agent's tests in CI (chore)
- 2026-11-04 `163d39e` Point the incident runbook at the safe deploy and the tested restore (chore)
- 2026-11-04 `ebadd5b` Merge branch 'worktree-agent-a9d0e981d43f29392' into ali-dev (-)
- 2026-11-04 `8795e84` Bring the security design and deploy README up to date with the code (chore)
- 2026-11-04 `c2e1d2b` Add a team contributions page from the git history (RN-0004)
- 2026-11-04 `884a111` Merge branch 'worktree-agent-a5beb8819b7448d9e' into ali-dev (-)
- 2026-11-04 `362aaa4` Draft the final report with the Task 2 feedback response (RN-0040)
- 2026-11-04 `d57b823` Mark the backup restore test done in Ajiya (RN-0034)
  - RN-0034: pending → done
- 2026-11-04 `548afbe` Record the EBS snapshot restore test (RN-0034)
- and 102 more in data.js

## Checks

0 error(s), 3 warning(s).

- W008 ajiya/pipeline.md:11: RN-0031 has needed a human (needs the server's SSH key) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:8: RN-0001 has needed a human (team decision; Yaseera's push lands first) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
- W008 ajiya/release.md:11: RN-0004 has needed a human (repository settings need an owner) for 16 days. Fix: ask the person named, or close it with 'ajiya ticket done --by'
