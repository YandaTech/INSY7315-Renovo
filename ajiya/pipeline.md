<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Pipeline

Goal: Every push runs all tests and security scans, and main deploys itself

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0028 | infra | CI runs every service's tests on every push | GitHub Actions runs backend, pricing, voice-bridge tests and the frontend lint and build on every branch, all green | - | - | 🟩 Done · 6ffcaf0 · 2026-11-02 · tests passed · Note: GitHub Actions run 41513778771 on ali-dev passed (all service jobs) |
| RN-0029 | infra | Security scans in CI | CI fails on a high npm audit or pip-audit finding | RN-0019, RN-0028 | - | 🟩 Done · 1da7c67 · 2026-11-02 · tests passed · Note: GitHub Actions run 41519503633: Dependency Security Scans job passed |
| RN-0030 | frontend | Frontend unit tests | npm test runs Vitest tests for login, toasts and the status helpers, and CI runs them | RN-0028 | - | 🟩 Done · 6371de8 · 2026-11-02 · tests passed · Note: Vitest suite (22 tests) runs in CI; green in run 41675769530 |
| RN-0031 | infra | Add the EC2 deploy key to GitHub secrets | DEPLOY_HOST, DEPLOY_USER and DEPLOY_SSH_KEY exist as repo secrets | RN-0002 | - | 🟥 Pending · Needs a human: needs the server's SSH key |
| RN-0032 | infra | Deploy main automatically, with a rollback | A push to main redeploys the live host; deploy/README.md shows how to roll back to the previous commit | RN-0028, RN-0031 | - | 🟥 Pending |
