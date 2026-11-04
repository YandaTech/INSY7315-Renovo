<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Security-assessment

Goal: The capstone report shows ZAP, Nmap and dependency scans, at least five code findings, the fixes and a clean retest

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0005 | infra | Baseline scans before fixes: npm audit, pip-audit, Nmap, ZAP | Raw outputs saved under docs/security/baseline/ for the local Docker stack | - | - | 🟩 Done · 841996c · 2026-11-04 · tests passed · Note: Baseline at f7ebb5d (early Oct main) on a local stack: npm audit, pip-audit, Nmap, ZAP baseline + API; raw outputs in docs/security/baseline/ |
| RN-0006 | infra | Vulnerability report with CVSS, location and fix for each finding | docs/security/report.md lists at least 5 code findings with OWASP category, CVSS, affected file and remediation | RN-0005 | - | 🟩 Done · 01b4e51 · 2026-11-04 · tests passed · Note: docs/security/report.md: 15 findings with OWASP 2021, CVSS 3.1, files and fixes; 9 fixed, 6 open with reasons |
| RN-0037 | infra | Retest after fixes and update the report | Rescans saved under docs/security/retest/ show each report finding fixed or explained | RN-0006, RN-0009, RN-0010, RN-0012, RN-0014, RN-0016, RN-0017, RN-0018, RN-0019 | - | 🟩 Done · 01b4e51 · 2026-11-04 · tests passed · Note: Retest of ali-dev in docs/security/retest/ (plus passive live checks in retest/live/); each finding marked fixed or explained in report.md |
