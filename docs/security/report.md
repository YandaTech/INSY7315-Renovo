# Renovo Cape security assessment: vulnerability report and retest

Tickets: RN-0005 (baseline scans), RN-0006 (this report), RN-0037 (retest).
Assessment date: 4 November 2026.

## Summary

We scanned and reviewed the Renovo Cape stack twice. The baseline is the
code before the hardening work (commit `f7ebb5d`). The retest is the
current `ali-dev` branch (commit `9df6f99`). We found 15 findings. Nine
of them are in the baseline and were fixed before the retest. Six were
still open at the retest. One of those six (F15) is new: it came in with
the move to PostgreSQL. After the retest, the admin password reset work
fixed F13 for new passwords and partly fixed F11. A follow-up change then
fixed F12 and F15 and removed the Express banner from F14. Three findings
are open now: F10, and F11 and F14, which are partly fixed. None of the
open findings is High or Critical.

| ID | Title | OWASP Top 10 (2021) | CVSS v3.1 | Status |
|---|---|---|---|---|
| F01 | Session token readable by page scripts (localStorage) | A07 Identification and Authentication Failures | 6.8 Medium | Fixed |
| F02 | No security headers or CSP; server versions disclosed | A05 Security Misconfiguration | 4.2 Medium | Fixed (low residue, see F14) |
| F03 | API docs and OpenAPI schema public in production | A05 Security Misconfiguration | 5.3 Medium | Fixed |
| F04 | Login rate limit shared by every visitor | A07 Identification and Authentication Failures | 5.3 Medium | Fixed |
| F05 | Twilio webhook signature check fails open | A07 Identification and Authentication Failures | 4.8 Medium | Fixed |
| F06 | Caller personal data in URLs and logs | A09 Security Logging and Monitoring Failures | 4.9 Medium | Fixed |
| F07 | No roles: every account is a full admin, no deactivation | A01 Broken Access Control | 6.5 Medium | Fixed |
| F08 | Vulnerable and unpinned dependencies | A06 Vulnerable and Outdated Components | 7.5 High | Fixed |
| F09 | Deleting a lead keeps its call transcript | A04 Insecure Design | 2.7 Low | Fixed |
| F10 | Internal services (pricing server, AI agent) have no authentication | A01 Broken Access Control | 5.3 Medium | Open (accepted, mitigated) |
| F11 | Session token still valid after logout or password change | A07 Identification and Authentication Failures | 4.8 Medium | Partly fixed (a password change or reset ends sessions; logout does not) |
| F12 | Username enumeration through login response time | A07 Identification and Authentication Failures | 3.7 Low | Fixed (after the retest) |
| F13 | Weak password policy (6 characters minimum) | A07 Identification and Authentication Failures | 4.8 Medium | Fixed for new passwords (8 characters minimum) |
| F14 | Containers run as root; Express banner on the voice host | A05 Security Misconfiguration | 3.9 Low | Partly fixed (Express banner removed; containers still run as root) |
| F15 | Unvalidated input causes unhandled database errors (HTTP 500) | A03 Injection (CWE-20 input validation) | 4.3 Medium | Fixed (after the retest; was new in `ali-dev`) |

Raw outputs are in `docs/security/baseline/`, `docs/security/retest/` and
`docs/security/retest/live/`. "probes.txt" in each folder holds the manual
HTTP checks. Each check has a number (P1 to P12), and the findings below
cite these numbers.

## Method

**Targets**

- Baseline: commit `f7ebb5d44e1e` (merge of PR #14, 1 Nov 2026), checked
  out as a separate git worktree.
- Retest: commit `9df6f99fbc3a` (`ali-dev`, 4 Nov 2026).
- Each commit's own `docker-compose.prod.yml` ran on the assessor's Mac with
  the overlay `docs/security/compose.scan.yml`. The stack was Caddy, nginx
  (dashboard), FastAPI backend, voice-bridge, ai-agent and
  mcp-pricing-server, plus PostgreSQL in the retest (the baseline used
  SQLite).
- The overlay supplies a throwaway env file. It has a random
  `SECRET_KEY` and `SERVICE_API_KEY`, `ENVIRONMENT=production`, and a
  placeholder Anthropic key. It also switches logs to local files and
  publishes Caddy on loopback only, on ports 18080/18443 (baseline) and
  28080/28443 (retest). No real `.env` was read.
- The baseline ran without `TWILIO_AUTH_TOKEN`, as a server with a missing
  token would. The retest had a random token, because its voice-bridge
  refuses to start in production without one (P7).
- Live server (passive only): `app.16-192-12-251.sslip.io` and
  `voice.16-192-12-251.sslip.io`. This is the team's own EC2 host.

**Tools**

| Tool | Version | Use |
|---|---|---|
| OWASP ZAP (`ghcr.io/zaproxy/zaproxy:stable`) | 2.17.0 | `zap-baseline.py` (passive) on the dashboard and voice hosts; `zap-api-scan.py` (active) on the backend from its OpenAPI schema, signed in as an admin |
| Nmap (`instrumentisto/nmap`) | 7.98 | `-sV` with `ssl-enum-ciphers`, `http-headers`, `http-server-header` on the published ports; `-sV -p 1-10000` on every container inside the Compose network |
| npm audit | npm 11.20.0 | `npm audit --json` on `frontend/` and `voice-bridge/` lock files |
| pip-audit | 2.10.1 (via `uvx`) | `--disable-pip --no-deps` on `pip freeze` from each running Python image (what actually ran) |
| curl | 8.11.1 (probe container) and macOS curl | Manual probes P1 to P12 |
| Docker / Compose | 28.5.1 / 2.40.3 | Running the stacks |

**How to repeat**

```
git worktree add ../renovo-baseline f7ebb5d
docs/security/scan.sh baseline ../renovo-baseline   # up probes nmap deps zap down
docs/security/scan.sh retest .
docs/security/scan.sh live                          # passive checks of the server
```

**Code review.** We read the baseline tree and diffed it against
`ali-dev` (`git diff f7ebb5d ali-dev`). We read the backend auth and
routes, the voice-bridge webhook and WebSocket code, the dashboard auth
code, the Caddy and nginx configs, and the Dockerfiles. We then confirmed
every finding with a scan or a probe. The file:line references below
point at the baseline unless they say `ali-dev`.

**What we did not do on the live server.** We sent no login attempts and
ran no active scan. We ran one ZAP baseline per hostname and one Nmap
top-1000-ports service scan. We also sent single GET/HEAD requests and
one unsigned POST to `/voice`.

## Findings

### F01 Session token readable by page scripts

**Description.** After login, the dashboard stored the JWT in
`localStorage` and sent it as an `Authorization: Bearer` header. Any script
running on the page can read `localStorage`, for example through an XSS
bug or a compromised npm package. Such a script could copy the token and
use it from anywhere for up to an hour. The backend also set a cookie with
`SameSite=Lax`, but the dashboard did not use it.

**Evidence.**
- `frontend/src/lib/auth.ts:5`, `:12`, `:17` (getItem, setItem,
  removeItem of `renovo_token`). `frontend/src/lib/api.ts:12` adds the
  Bearer header.
- `backend/app/routes/auth.py:104-117` returns the token in the body and
  sets `samesite="lax"`.
- `baseline/probes.txt` P3: the built bundle contains
  `localStorage.getItem`, `setItem` and `removeItem`, and sets
  `headers.Authorization`. The cookie is `SameSite=lax`.

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N` = **6.8
Medium**. To exploit this, an attacker must first get a script onto the
page (AC:H) and a staff member must open it (UI:R). The stolen token
gives full read and write access to leads and transcripts (C:H/I:H).

**Affected files.** `frontend/src/lib/auth.ts`, `frontend/src/lib/api.ts`,
`backend/app/routes/auth.py`.

**Remediation.** Keep the session only in an `HttpOnly`, `Secure`,
`SameSite=Strict` cookie. Stop storing the token and stop sending the
header from the dashboard. Add a CSP (F02) as a second layer.

**Retest: Fixed.** `ali-dev` `backend/app/core/security.py:45-83` sets the
cookie `HttpOnly`, `SameSite=Strict`, and `Secure` in production. The
dashboard uses `withCredentials` (`frontend/src/lib/api.ts`). In
`retest/probes.txt` P3 the cookie is `HttpOnly; ... SameSite=strict;
Secure`. The only `localStorage` call left in the bundle is a one-off
`removeItem` of the old key (`frontend/src/lib/auth.ts:42-46`), and the
bundle no longer sets an `Authorization` header. The login response body
still carries the token for API clients. The dashboard ignores it, so a
script on the page cannot get the token unless it can also log in.

### F02 No security headers or CSP; server versions disclosed

**Description.** Caddy and nginx sent none of the standard browser
security headers. With no Content-Security-Policy, any injected script
runs (this is what makes F01 exploitable). With no `X-Frame-Options` or
`frame-ancestors`, other sites can frame the dashboard (clickjacking).
With no HSTS, the first visit can be downgraded. The responses also
disclosed `Server: nginx/1.27.5` and, on the voice host,
`X-Powered-By: Express`.

**Evidence.**
- `deploy/Caddyfile:6-14` (no `header` block).
- `baseline/probes.txt` P1 (headers listed in full).
- `baseline/zap-baseline-app.md`: 12 warnings, including CSP Header Not
  Set [10038], Missing Anti-clickjacking Header [10020], HSTS Not Set
  [10035], X-Content-Type-Options Missing [10021], Server Leaks Version
  Information [10036] and Permissions Policy Not Set [10063].
- `baseline/zap-baseline-voice.md`: X-Powered-By [10037], plus the same
  missing headers.

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N` = **4.2 Medium**.
The missing headers are not an attack on their own. They make XSS,
framing and downgrade attacks possible or worse (AC:H, UI:R).

**Affected files.** `deploy/Caddyfile`, `frontend/nginx.conf`.

**Remediation.** Add HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, COOP and a strict CSP in Caddy.
Remove the `Server` header.

**Retest: Fixed.** `ali-dev` `deploy/Caddyfile:18-27` (app) and `:35-41`
(voice). `retest/probes.txt` P1 shows all the headers and no `Server`
header. `retest/zap-baseline-app.md` is down from 12 to 7 warnings, and
the CSP, framing, HSTS, nosniff, server-version and permissions-policy
alerts are gone. These alerts remain:

- `style-src 'unsafe-inline'` [10055]. This is a documented trade-off for
  React and chart style attributes.
- Missing COEP [90004] and Sub Resource Integrity [90003]. The assets are
  same-origin, so SRI adds little.
- Cache-control [10015, 10049] and a "suspicious comment" in the bundle
  [10027].

The live server matches: `retest/live/live-checks.txt` and
`retest/live/zap-baseline-live-app.md` (0 FAIL, 7 WARN). The voice host
still sends `X-Powered-By: Express` and has no CSP. This is tracked in
F14.

### F03 API docs and OpenAPI schema public in production

**Description.** FastAPI served `/docs`, `/redoc` and `/openapi.json` to
anyone, through the public dashboard host at `/api/...`. The schema lists
every endpoint and parameter, including service-only routes. That makes
attacks on the API easier to plan.

**Evidence.**
- `backend/app/main.py:36-42` (`docs_url="/docs"`, `redoc_url="/redoc"`).
- `baseline/probes.txt` P2: `/api/docs`, `/api/redoc` and
  `/api/openapi.json` all return 200.
- `baseline/openapi.json` is the copy downloaded without logging in.

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N` = **5.3
Medium**. It discloses information to anyone with no effort.

**Affected files.** `backend/app/main.py`.

**Remediation.** Turn the docs and schema off when
`ENVIRONMENT=production`.

**Retest: Fixed.** `ali-dev` `backend/app/main.py:25-34`. In
`retest/probes.txt` P2 all three return 404, even from inside the
network. For the authenticated ZAP API scan we generated the schema
inside the container instead (`retest/openapi-source.txt`). The live
server also returns 404 for all three (`retest/live/live-checks.txt`).

### F04 Login rate limit shared by every visitor

**Description.** slowapi keyed the 5-per-minute login limit on
`request.client.host`. Behind Caddy and nginx, that address is always the
nginx container, and uvicorn ran without `--proxy-headers`. So every
visitor on the internet shared one bucket. Five wrong passwords from one
attacker locked every staff member out of the dashboard for a minute, and
an attacker could keep that up indefinitely. Brute-force protection
still applied, but only globally.

**Evidence.**
- `backend/app/core/limiter.py:7` (`key_func=get_remote_address`).
- `backend/Dockerfile:28` (no `--proxy-headers`).
- `baseline/probes.txt` P12: client 2 (a container) sends 6 wrong
  passwords, and the 6th gets 429. Then client 1 (a different machine)
  logs in with the **correct** password and also gets **429**.

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L` = **5.3
Medium**. Anyone can deny login to all staff with no credentials. The
rest of the system keeps working (A:L).

**Affected files.** `backend/app/core/limiter.py`, `backend/Dockerfile`.

**Remediation.** Run uvicorn with `--proxy-headers` and trust forwarded
headers only from the Docker network. Key the limit on the resulting
client IP. Make sure Caddy overwrites any `X-Forwarded-For` header the
client sends.

**Retest: Fixed.** `ali-dev` `backend/app/core/limiter.py:7-24` and
`backend/Dockerfile:34-36`. In `retest/probes.txt` P12, client 2 hits 429
on the 6th attempt, while client 1 still logs in (200). With a different
forged `X-Forwarded-For` on each attempt, client 2 still gets 429 on the
6th, so a forged header does not bypass the limit.

### F05 Twilio webhook signature check fails open

**Description.** voice-bridge checked `X-Twilio-Signature` only when
`TWILIO_AUTH_TOKEN` was set and `VALIDATE_TWILIO_SIGNATURE` was not
`false`. It also honoured `ALLOW_UNVERIFIED_CALLS` in any environment. A
missing or mistyped token, or a dev flag left in the server `.env`,
silently turned the check off. Anyone could then POST to `/voice` and open
the WebSocket to run AI agent sessions, which costs Anthropic credits. They
could also create fake calls and leads, with made-up caller numbers, in
the dashboard.

**Evidence.**
- `voice-bridge/src/twilioSignature.js:44-46` and
  `voice-bridge/src/websocket.js:102-106`.
- `baseline/probes.txt` P7: POST `/voice` with no signature returns 200,
  and with a wrong signature also returns 200.
- P8: a simulated call with no signature streamed and was saved as a lead
  (`POST /leads/ ... 200`).

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:L` = **4.8
Medium**. This needs the configuration mistake (AC:H). The result is fake
leads (I:L) and cost or quota exhaustion (A:L).

**Affected files.** `voice-bridge/src/twilioSignature.js`,
`voice-bridge/src/websocket.js`, `voice-bridge/src/server.js`.

**Remediation.** Fail closed in production. Refuse to start without the
token, and ignore the dev bypass flags when `ENVIRONMENT=production`.

**Retest: Fixed.** `ali-dev` `voice-bridge/src/twilioSignature.js:39-98`
and `voice-bridge/src/server.js:11-17`. In `retest/probes.txt` P7, no
signature and a wrong signature both return 403, and a correct signature
returns 200. Started with an empty token, voice-bridge prints "Refusing
to start in production" and exits with code 1. P8: an unknown call SID is
rejected on the WebSocket (close 1008). The live server returns 403 for an
unsigned POST (`retest/live/live-checks.txt`).

### F06 Caller personal data in URLs and logs

**Description.** voice-bridge sent each call's whole transcript, and the
caller's name and phone number, to the backend as **query-string**
parameters. Uvicorn writes the full URL of every request to its access
log, so every transcript ended up in the container logs. voice-bridge
also logged what the caller and the agent said (`Caller said: ...`,
`Agent said: ...`) and the full quote. The logs are kept by Docker and,
in `ali-dev`, shipped to CloudWatch, so anyone with log access could read
customer conversations. Transcripts contain names, phone numbers and
addresses, which is personal information under POPIA.

**Evidence.**
- `voice-bridge/src/backendClient.js:11-25` and `:52-68`
  (`URLSearchParams` with `transcript`, `name`, `contact`).
- `voice-bridge/src/websocket.js:134`, `:154`, `:156`.
- `backend/app/main.py:78-93` and `:125-151` (query parameters).
- `baseline/probes.txt` P8: the voice-bridge log has
  `Caller said: Hi, my name is Thandi Scanprobe, call me on 082 123 4567`.
  The backend access log has
  `POST /calls/?call_sid=...&transcript=...Thandi+Scanprobe%2C+call+me+on+082+123+4567...`
  and `POST /leads/?name=...&contact=%2B27821234567...`.
- P9: a transcript sent in the query string is logged verbatim.

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:N/A:N` = **4.9
Medium**. Reading the logs needs privileged access (PR:H), for example
server SSH or a CloudWatch IAM role. What leaks is every caller's
conversation (C:H).

**Affected files.** `voice-bridge/src/backendClient.js`,
`voice-bridge/src/websocket.js`, `voice-bridge/src/notifications.js`,
`backend/app/main.py`.

**Remediation.** Send typed JSON bodies instead of query parameters. Log
lengths and outcomes, never content. Mask phone numbers and email
addresses in any log line that might contain them.

**Retest: Fixed.**
- `ali-dev` `backend/app/schemas.py:9-29` (`CallCreate`, `LeadCreate`),
  `backend/app/routes/calls.py`, `voice-bridge/src/backendClient.js`,
  `voice-bridge/src/privacy.js` and `voice-bridge/src/websocket.js:155`.
- `retest/probes.txt` P8: the voice-bridge log only says
  `Caller spoke on <sid>: 56 chars` and `Agent replied ...: 69 chars`, and
  the backend log only says `POST /calls/ HTTP/1.1` and
  `POST /leads/ HTTP/1.1`.
- P9: a query-string transcript is now refused with 422. Note that
  uvicorn still logs the URL of that refused request. This only matters
  if a client deliberately sends data in the URL, and our own services
  no longer do.
- `LOG_CALL_CONTENT=true` can still print content for local debugging,
  but it is ignored in production.

### F07 No roles: every account is a full admin

**Description.** The baseline had one kind of account. Any logged-in user
could change prices that the AI quotes to callers immediately. They could
also create more accounts, and delete leads. There was no way to disable
an account short of deleting it from the database. A single compromised
or departing staff login had full control.

**Evidence.**
- `backend/app/models/user.py` (no role or active column).
- `backend/app/routes/auth.py:49-79`: once one account exists, any
  logged-in user may register another.
- `backend/app/main.py:239-254`: `PUT /pricing/rules` only needs
  `get_current_user`.
- `baseline/probes.txt` P5: a second account (`scan-staff`) gets 200 on
  `PUT /api/pricing/rules` and 201 on `POST /api/auth/register`.
- P4: no deactivation endpoint (`PATCH /api/users/{id}` returns 404).

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N` = **6.5
Medium**. Any low-privileged login can change prices for every caller and
create accounts (I:H).

**Affected files.** `backend/app/models/user.py`,
`backend/app/routes/auth.py`, `backend/app/main.py`,
`backend/app/core/dependencies.py`.

**Remediation.** Add `admin` and `staff` roles, enforced on the server.
Make prices, accounts and the audit log admin-only. Add an `is_active`
flag that is checked on every request. Record security events in an
append-only audit log.

**Retest: Fixed.**
- `ali-dev` `backend/app/models/user.py:20-48`,
  `backend/app/core/dependencies.py:37-80` (`require_admin`, `is_active`
  checked on every request), `backend/app/routes/pricing.py:54-60`,
  `backend/app/routes/users.py` and `backend/app/routes/audit.py`.
- `retest/probes.txt` P5: staff gets 403 on `PUT /pricing/rules`, on
  `POST /auth/register` and on `GET /audit-events/`, while the admin gets
  200 on the audit log.
- P4: after an admin deactivates an account, its still-unexpired token
  gets 401 at once.

### F08 Vulnerable and unpinned dependencies

**Description.** The backend used `python-jose`, which has an HMAC key
confusion flaw (PYSEC-2026-4298, no fixed release) and pulls in `ecdsa`
(CVE-2024-23342, Minerva timing). All Python dependencies were `>=`
ranges. The pricing server and AI agent built their requirements from
`pyproject.toml` at image build time, so every build could pull different
code. The dashboard lock file had 17 known vulnerabilities (5 high) and
voice-bridge had 2 (1 high). The voice-bridge one that matters most is
`body-parser` GHSA-27r3-jxmh-p828, a denial of service through trailing
bytes after a compressed body. voice-bridge parses form bodies on the
public `/voice` webhook before the signature check.

**Evidence.**
- `baseline/pip-audit-backend.json`: python-jose 3.5.0 PYSEC-2026-4298,
  and ecdsa 0.19.2 PYSEC-2026-1325 / CVE-2024-23342.
- `baseline/pip-freeze-*.txt` show what was installed.
- `baseline/npm-audit-frontend.json`: 17 vulnerabilities (12 moderate, 5
  high: vite, zod, brace-expansion, follow-redirects, source-map-js).
- `baseline/npm-audit-voice-bridge.json`: body-parser (high) and qs
  (moderate).
- `backend/requirements.txt` (all `>=`), `backend/app/core/security.py:4`
  (`from jose import jwt`).
- Earlier evidence: `docs/security/supply-chain/before/`.

**CVSS.** We score the worst dependency issue that is reachable in this
deployment, which is body-parser on the public voice host:
`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H` = **7.5 High** (the
advisory's own vector). The python-jose flaw is not reachable here. It
needs an asymmetric public key, and the app only accepts HS256 with a
fixed algorithm list (`dependencies.py:48-50`). Most of the frontend
issues are in build-time tooling.

**Affected files.** `backend/requirements.txt`,
`backend/app/core/security.py`, `backend/app/core/dependencies.py`,
`frontend/package-lock.json`, `voice-bridge/package-lock.json`,
`ai-agent/pyproject.toml`, `mcp-pricing-server/pyproject.toml`, and the
Dockerfiles.

**Remediation.** Replace python-jose with PyJWT. Pin every dependency
with full lock files and install them in the images. Run `npm audit fix`.
Fail CI on any new advisory.

**Retest: Fixed.** `retest/pip-audit-backend.json`,
`retest/pip-audit-ai-agent.json` and
`retest/pip-audit-mcp-pricing-server.json` show 0 vulnerabilities (55, 25
and 14 packages). `retest/npm-audit-frontend.json` and
`retest/npm-audit-voice-bridge.json` show 0. The backend runs PyJWT
2.15.1 (`retest/pip-freeze-backend.txt`), and python-jose is gone. The
`security-scan` CI job (`.github/workflows/ci-cd.yml`) runs both audits on
every push. See `docs/security/supply-chain/summary.txt`.

### F09 Deleting a lead keeps its call transcript

**Description.** When staff deleted a lead, for example at a caller's
request, the call log and its full transcript stayed in the database.
They were still readable at `/calls/{sid}`. The user believes the
caller's data is gone when it is not. That conflicts with POPIA's
retention and deletion principles.

**Evidence.**
- `backend/app/repositories/lead_repository.py:101-113` deletes only the
  lead.
- `baseline/probes.txt` P10: `GET /api/calls/<sid>` returns 200 before,
  `DELETE /api/leads/<id>` returns 204, and `GET /api/calls/<sid>` returns
  **200** after.

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:N/A:N` = **2.7 Low**.
Only a logged-in user can read the leftover transcript. The harm is
over-retention of personal data rather than exposure to outsiders.

**Affected files.** `backend/app/repositories/lead_repository.py`.

**Remediation.** Delete the call log in the same transaction when no
other lead links to it.

**Retest: Fixed.** `ali-dev`
`backend/app/repositories/lead_repository.py:101-130`. In
`retest/probes.txt` P10, `GET /api/calls/<sid>` after the delete returns
404.

### F10 Internal services have no authentication

**Description.** `mcp-pricing-server` (port 8001) and `ai-agent` (port
8002) accept any request with no credentials. That includes
`PUT /mcp/pricing/rules`, which replaces the prices the AI quotes. Both
also serve `/docs`. The backend now allows only admins to change prices
(F07), but anything that can reach port 8001 skips that check and the
audit log entirely. That could be another container, an SSRF bug, or a
port published by mistake.

**Evidence.**
- `mcp-pricing-server/server.py:32-38` and `ai-agent/agent.py:157-173`
  (unchanged in `ali-dev`).
- `baseline/probes.txt` and `retest/probes.txt` P6: GET and PUT of the
  rules both return 200 with no credentials, and `/docs` returns 200 on
  both services. The AI agent answers 500 only because the scan used a
  placeholder Anthropic key.

**CVSS.** `CVSS:3.1/AV:A/AC:H/PR:H/UI:N/S:U/C:L/I:H/A:L` = **5.3
Medium**. The attacker must already be on the Docker network (AV:A) and
control something there (PR:H, AC:H). If they are, they can change every
quote (I:H).

**Affected files.** `mcp-pricing-server/server.py`, `ai-agent/agent.py`,
`docker-compose.prod.yml`.

**Remediation.** Require the existing `SERVICE_API_KEY`, or a separate
key, as a header on both services. Turn off their `/docs`. Optionally put
them on an internal network that only the backend and voice-bridge can
reach.

**Retest: Open (accepted for now, mitigated).** Neither service publishes
a port in production. `retest/nmap-published.txt` shows only Caddy's two
ports, and the live Nmap scan (`retest/live/nmap-live.txt`) shows only 80
and 443 open. They are reachable only from inside the Compose network
(`retest/nmap-internal.txt`). The remaining risk is a compromise of
another container.

### F11 Session token still valid after logout or password change

**Description.** Logout only clears the browser cookie, and a password
change issues no new token. The JWT has no ID and there is no deny list,
so a token copied before logout or before a password change keeps working
until it expires (60 minutes).

**Evidence.**
- `ali-dev` `backend/app/routes/auth.py:169-181` (logout) and `:220-239`
  (password change).
- `backend/app/core/security.py:26-42` (no `jti`).
- `baseline/probes.txt` and `retest/probes.txt` P4: `GET /auth/me` with
  the old token returns 200 after logout, and 200 after a password change.

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N` = **4.8
Medium**. The attacker must already hold a stolen token (AC:H). The window
is at most one hour.

**Affected files.** `backend/app/routes/auth.py`,
`backend/app/core/security.py`, `backend/app/core/dependencies.py`,
`backend/app/models/user.py`.

**Remediation.** Add a `token_version` (or "sessions valid after"
timestamp) column to the user. Put it in the token and check it in
`get_current_user`. Bump it on logout, on password change and on
deactivation. Alternatively, keep a deny list of `jti` values until they
expire.

**Retest: Open, partly mitigated.** Since F01 was fixed, page scripts
cannot read the token, and deactivating an account ends its sessions at
once (`retest/probes.txt` P4: 401 after deactivation). An admin who
suspects a stolen session can deactivate the account and then reactivate
it.

**Fix after the retest: partly fixed.** A password change now ends every
older session of that account:

- Migration `0005_password_changed_at` adds
  `admin_users.password_changed_at` (UTC). Existing accounts get NULL,
  so sessions open during the upgrade keep working.
- The column is set when someone changes their own password
  (`POST /auth/me/password`) and when an admin resets it
  (`POST /users/{id}/password`).
- `get_current_user` (`backend/app/core/dependencies.py`) answers 401 for
  a token whose `iat` is earlier than `password_changed_at`. Tokens carry
  `iat` to the microsecond (`backend/app/core/security.py`).
- A person who changes their own password gets a fresh session cookie in
  the same response, so they stay logged in. Every other copy of their
  old token stops working.
- An admin who suspects a stolen session can now reset that person's
  password from the Staff page, which ends the session at once.

Tests: `backend/tests/test_password_reset.py` (the old token gets 401
after a reset and after a self change, by header and by cookie).

Still open: plain logout only clears the cookie. A token copied before
logout keeps working until it expires (at most 60 minutes). The
remaining fix is a per-user token version or a `jti` deny list, as in
the remediation above.

### F12 Username enumeration through login response time

**Description.** Login returns the same message for an unknown username
and a wrong password. However, the bcrypt check only runs when the
username exists. A request for a real username takes about 170 to 180 ms,
and one for an unknown username takes about 10 ms. An attacker can use
this to find valid usernames, and then concentrate guesses on them.

**Evidence.**
- `ali-dev` `backend/app/routes/auth.py:138-141`.
- `baseline/probes.txt` P11: unknown 0.009 s and 0.012 s; `scan-admin`
  0.171 s and 0.168 s.
- `retest/probes.txt` P11: unknown 0.013 s and 0.007 s; `scan-admin`
  0.181 s and 0.183 s.

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N` = **3.7 Low**.
The rate limit (5 a minute per IP) slows collection down.

**Affected files.** `backend/app/routes/auth.py`.

**Remediation.** When the user does not exist, still run
`bcrypt.checkpw` against a fixed dummy hash, so both paths take the same
time.

**Retest: Open.**

**Fix after the retest: fixed.** When the username does not exist, login
now checks the typed password against a fixed bcrypt hash
(`DUMMY_PASSWORD_HASH` in `backend/app/core/security.py`). That hash has
the same cost (12) as real ones, so an unknown username costs one bcrypt
check, just like a wrong password. The response is unchanged: the same
401, body and headers for both. No password can log in through the dummy
hash, because no account uses it. Tests: `backend/tests/test_auth.py`
checks that the unknown-user path runs the bcrypt check against the dummy
hash and that both failures look the same. The tests do not measure
timing, which is too noisy for CI.

### F13 Weak password policy

**Description.** Passwords need only 6 characters. There is no check
against common or breached passwords. Combined with F12, a short password
on a real account is the most likely way in, even with the rate limit.

**Evidence.** `ali-dev` `backend/app/routes/auth.py:28` and `:58`, and
`backend/app/routes/users.py:16` (`min_length=6`). The same is true in
the baseline.

**CVSS.** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N` = **4.8
Medium**. Exploiting it needs a weak password and many guesses at 5 a
minute (AC:H).

**Affected files.** `backend/app/routes/auth.py`,
`backend/app/routes/users.py`, and the dashboard forms.

**Remediation.** Require at least 12 characters (NIST SP 800-63B).
Reject the most common passwords. Consider a second factor for admins.

**Retest: Open.**

**Fix after the retest: fixed for new passwords.** Every new password
needs at least 8 characters (`MIN_PASSWORD_LENGTH` in
`backend/app/core/security.py`). The backend checks this on sign-up
(`POST /auth/register`), account creation (`POST /users/`), self change
(`POST /auth/me/password`) and admin reset (`POST /users/{id}/password`),
and answers 422 for a shorter one. The Staff, Profile and sign-up forms
show the same rule. Passwords set under the old 6-character rule still
log in until they are changed, so no account was locked out. Tests:
`backend/tests/test_password_reset.py`.

Residual risk: 8 is below the 12 characters recommended above, there is
no check against common or breached passwords, and old short passwords
stay until their owners change them. An admin can force a change by
resetting the password.

### F14 Containers run as root; Express banner on the voice host

**Description.** No Dockerfile sets a `USER`, so the backend, AI agent,
pricing server and voice-bridge processes run as root inside their
containers. A code-execution bug in any of them would give root in that
container, which makes a breakout or tampering with mounted volumes
easier. The voice host also still sends `X-Powered-By: Express`, and it
has no CSP or Permissions-Policy. Only Twilio calls this host, so those
headers matter little there.

**Evidence.**
- `backend/Dockerfile`, `ai-agent/Dockerfile`,
  `mcp-pricing-server/Dockerfile` and `voice-bridge/Dockerfile` (no
  `USER` line, in either commit).
- `retest/probes.txt` P1 and `retest/zap-baseline-voice.md`: [10037]
  X-Powered-By, [10038] CSP not set and [10063] Permissions-Policy not
  set. The live server shows the same (`retest/live/live-checks.txt`).

**CVSS.** `CVSS:3.1/AV:L/AC:H/PR:H/UI:N/S:U/C:L/I:L/A:L` = **3.9 Low**.
This only matters after a separate code-execution bug.

**Affected files.** The four Dockerfiles, `voice-bridge/src/server.js`
and `deploy/Caddyfile`.

**Remediation.** Add a non-root `USER` to each image (`node` already
exists in `node:22-alpine`). Call `app.disable("x-powered-by")` in
voice-bridge, or add `-X-Powered-By` to the voice block in Caddy.

**Retest: Open.**

**Fix after the retest: partly fixed.** The Express banner is gone.
voice-bridge now builds its app in `voice-bridge/src/app.js`, which calls
`app.disable("x-powered-by")`, so no response carries `X-Powered-By`.
Test: `voice-bridge/test/app.test.js`. The dashboard's nginx also sets
`server_tokens off` (`frontend/nginx.conf`), so it no longer puts its
version in the `Server` header or on error pages. Caddy already removed
that header, so this is defence in depth.

Still open: the containers still run as root. Adding `USER` lines needs
each image checked for files it writes and for volume ownership, so it
was left for a separate change. The voice host still has no CSP or
Permissions-Policy, which matters little because only Twilio calls it.

### F15 Unvalidated input causes unhandled database errors

**Description.** The authenticated ZAP API scan found 3 inputs that make
the backend throw an unhandled database exception and return HTTP 500:

- A lead ID larger than a 32-bit integer (`GET /leads/8661681940182828318`
  gives PostgreSQL `integer out of range`).
- A NUL byte in a text field (`POST /leads/` gives `PostgreSQL text fields
  cannot contain NUL (0x00) bytes`).
- Two requests creating the same username at once (`POST /users/` gives a
  `UniqueViolation`, because the "already exists" check and the insert
  are not atomic).

The response body is a plain "Internal Server Error", so no stack trace
leaks. But every one of these is logged as an `ERROR` and, in production,
sets off the CloudWatch error alarm e-mail. Anyone with a login, or the
service key, can therefore cause alarm noise at will. In the baseline,
SQLite accepted these values, so the problem came in with PostgreSQL.

**Evidence.**
- `retest/zap-api.md` and `retest/zap-api.json` (alert 100000, 5
  instances; 2 are the expected 503 from the unconfigured demo phone).
- `retest/backend-errors-during-zap.txt` (the exception class of each
  500).
- `backend/app/routes/leads.py:52` (`lead_id: int` with no bound),
  `backend/app/schemas.py:19-29` (no NUL check),
  `backend/app/routes/users.py:34-56` and `backend/app/routes/auth.py:61-76`
  (check-then-insert).
- The baseline ZAP API scan (`baseline/zap-api.md`) has only the 503s.

**CVSS.** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L` = **4.3
Medium**. It needs a login or the service key. The impact is failed
requests and alert noise (A:L).

**Affected files.** `backend/app/schemas.py`, `backend/app/routes/leads.py`,
`backend/app/routes/calls.py`, `backend/app/routes/users.py`,
`backend/app/routes/auth.py`.

**Remediation.**
- Bound path IDs (`Path(..., ge=1, le=2**31-1)`).
- Strip or reject `\x00` in the Pydantic string fields.
- Catch `IntegrityError` on user creation and return 400.
- Optionally, add a global `DataError` handler that returns 422.

**Retest: Open (new).**

**Fix after the retest: fixed.** Bad input is now refused before it
reaches the database, and a database error that still gets through
becomes a clean 4xx:

- **NUL characters.** Every request body (calls, leads, notifications,
  sign-up, profile and password change) is a subclass of `InputModel`
  (`backend/app/core/validation.py`). It rejects a NUL in any string,
  including strings and keys nested in `job_details`. The `call_sid`
  path, the audit `event` filter and every username (login, sign-up and
  `POST /users/`) are checked too. Each answers 422.
- **Integers beyond 32 bits.** Lead and user IDs in the path, the audit
  `actor_id`, and every `skip`, `limit` and `offset` are limited to the
  PostgreSQL INTEGER range, so `GET /leads/8661681940182828318` now gives
  422. Paging values must also be 0 or more. A call `duration` is bounded
  the same way. A `quantity` in `job_details` that does not fit the column
  is left out, like any other unusable quantity, and the lead is still
  saved.
- **Username race.** When two requests take the same username at once,
  the unique index refuses the second insert. `create_user` rolls back and
  answers 409 "Username already registered". It serves both
  `POST /auth/register` and `POST /users/`. A name that was already taken
  before the request still gets the usual 400.
- **Safety net.** `backend/app/main.py` handles any SQLAlchemy
  `DataError` (422) and `IntegrityError` (409) with a generic message.
  `get_db` rolls the session back first. The SQL, its values and the
  database message are never returned or logged. The log line is a
  warning with the method, path and SQLSTATE code, so it does not set off
  the error alarm.

Valid input behaves as before. Tests: `backend/tests/test_bad_input.py`
runs every case on SQLite and, with `TEST_POSTGRES_URL` set, on
PostgreSQL 16 (CI does both). Run against the code before the fix,
most of these tests fail: with 500s on PostgreSQL, and on SQLite with
unhandled overflow errors or with NUL values that were stored.

## Other scan results

- **Nmap, published ports.** Only Caddy is exposed, in both commits
  (`*/nmap-published.txt`). It redirects HTTP to HTTPS (308). On the
  `localhost` certificate, TLS is 1.3 only. On the live server
  (`retest/live/nmap-live.txt`) only 80 and 443 are open out of the top
  1000. TLS 1.2 and 1.3 offer only AEAD ciphers, all graded A, and there
  is no TLS 1.0 or 1.1. The server header is the generic `Caddy` with no
  version.
- **Nmap, inside the network.** In the retest, PostgreSQL 5432 is
  reachable from other containers but not published. Its password comes
  from `.env` (`retest/nmap-internal.txt`).
- **ZAP API scan, active and authenticated.** We imported 28 baseline
  URLs and 33 retest URLs. There were 0 FAIL results in both. Apart from
  F15, the alerts were missing `X-Content-Type-Options` and CORP on
  direct backend responses. That is expected, because the scan bypassed
  Caddy, which adds those headers. In the retest there was also a
  low-risk "Unix timestamp disclosure", which is just account
  `created_at` values on `/users/`. ZAP found no SQL injection, XSS,
  path traversal or command injection.

## Limitations

- **Local, not identical to production.** The scans used a local copy of
  each commit with throwaway keys, a placeholder Anthropic key and no
  Twilio account. AI replies, SMS, e-mail and the demo phone were
  therefore not exercised, and the ZAP active scan could not reach
  Twilio-dependent code paths.
- **Python baseline resolved today.** pip-audit audited what the baseline
  images installed on 4 November 2026. Because the baseline used `>=`
  ranges, a build in October could have pulled slightly different
  versions. `docs/security/supply-chain/before/` (2 November) agrees with
  these results.
- **Limited live checks.** On the live server we only ran passive and
  low-volume checks. Login rate limiting, roles and webhook signatures
  were verified locally and confirmed on the server only through the
  unsigned `/voice` 403.
- **ZAP limits.** ZAP passive spidering of a React single-page app finds
  few URLs. The API scan used a 20-minute cap and 2 minutes per rule, and
  it bypassed the Caddy and nginx proxies.
- **Not tested.** We did not test the Twilio and AWS accounts, the IAM
  roles, the EC2 host operating system, or the GitHub repository
  settings.

## Residual risks outside the code

These are not code findings, but they belong in the risk register.

- **Single server.** Everything runs on one EC2 instance with one Docker
  host. An instance failure takes down calls and the dashboard until
  someone restores it (see `deploy/README.md` and the EBS snapshot
  restore test).
- **Messaging sandboxes.** SES is in sandbox mode, and the SMS provider is
  in sandbox or test mode. Quote confirmations reach only verified
  recipients until production access is granted, so callers may silently
  not get their SMS or e-mail.
- **Twilio registration.** The team owns the Twilio account but does not
  have Renovo Cape's company registration details, which Twilio needs to
  give a business a local number and SMS sending. Registering the number
  under Renovo Cape's details is the fix.
- **No data retention.** There is still no automatic data-retention
  clean-up for leads, transcripts and notifications.
