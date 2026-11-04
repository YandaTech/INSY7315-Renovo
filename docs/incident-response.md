# Incident response runbook

What to do when the Renovo receptionist or dashboard breaks in production.
For what data we hold and why, see [security-design.md](security-design.md).

## 1. Production at a glance

| Item | Value |
|---|---|
| Server | One EC2 `t3.small`, `eu-north-1`, instance `i-054c4509d9515ba8b`, Elastic IP |
| Admin access | SSH through AWS SSM Session Manager. Port 22 is closed |
| Stack | `~/renovo/docker-compose.prod.yml` |
| Secrets | `~/renovo/.env` on the server only. Never in git, never printed |
| Database | PostgreSQL 16 (`db` service, `pg_data` volume). Nightly `pg_dump` to `~/backups`, 14 days kept |
| Pricing rules | `pricing_config` volume |
| TLS certificates | `caddy_data` volume (Let's Encrypt, renewed by Caddy) |
| Deploy | Manual: `git archive` of the branch over SSH, then `up --build -d` |

Request path:

- `APP_DOMAIN` → Caddy → `frontend` (nginx) → `/api/*` → `backend` (FastAPI)
- `VOICE_DOMAIN` → Caddy → `voice-bridge` (Twilio webhook `/voice` and ConversationRelay WebSocket)
- `voice-bridge` → `ai-agent` (Claude Haiku) → `mcp-pricing-server`
- `voice-bridge` → `backend` (saves calls, leads and notifications) and the SMS provider

Only Caddy publishes ports. `backend`, `ai-agent` and `mcp-pricing-server` are
reachable only on the internal Docker network.

## 2. Roles and contacts

Fill these in. One person can hold several roles.

| Role | Who | How to reach | Owns |
|---|---|---|---|
| Incident lead | `<name>` | `<phone / WhatsApp>` | Runs the incident, decides severity, writes the review |
| Server operator | `<name>` | `<phone>` | SSM access, `.env`, Docker |
| AWS account owner | `<name>` | `<phone>` | IAM, EC2, snapshots, AWS SMS |
| Twilio account owner | `<name>` (not the server operator) | `<phone>` | Phone number, webhook URL, Twilio keys |
| Anthropic console owner | `<name>` | `<phone>` | Anthropic API keys and billing |
| SMS provider owner | `<name>` | `<phone>` | SMSPortal or AWS End User Messaging |
| Renovo Cape contact (the client) | `<owner name>` | `<phone>` | Receives updates; decides what callers are told |
| Lecturer / module lead | `<name>` | `<email>` | Told about SEV1 and any data breach |

## 3. Severity and who is told

| Severity | Examples | Who is told | When |
|---|---|---|---|
| **SEV1** | Calls fail or go silent. Personal data exposed. A secret leaked | Incident lead, server operator, Renovo Cape contact, lecturer | Within 30 minutes of noticing |
| **SEV2** | Dashboard down. SMS not sent. Quotes wrong or R0. Login broken | Incident lead, server operator, Renovo Cape contact | Same day |
| **SEV3** | Cosmetic issue, one slow page, a single failed SMS | Team group chat | Next stand-up |

Rules:

- Post "investigating", "mitigated" and "resolved" in the team group chat, with times.
- If personal data may have been seen by someone who should not see it, treat it as SEV1 and follow section 8.
- The Renovo Cape contact hears from **one** person (the incident lead), not from several team members.

## 4. How customers hear

Renovo Cape is our customer. Its callers are their customers.

| Audience | Channel | What they get |
|---|---|---|
| Renovo Cape | Phone call, then WhatsApp or email in writing | What is broken, what callers experience, the workaround, the next update time. Final message when resolved, plus the review within 3 working days |
| Callers, while calls fail | Nothing automatic: there is no status page and no fallback number | Ask the Twilio account owner to point the number's voice webhook (or its fallback URL) at Renovo Cape's human line until fixed |
| Callers who got a wrong quote or SMS | Renovo Cape phones or texts them back, using the lead list | A correction. We supply the list of affected leads |
| Callers whose data was exposed | Renovo Cape notifies them (it is the responsible party under POPIA) | What happened, what data, what to watch for. We draft the wording |

Never contact callers directly ourselves. We are Renovo Cape's operator, not
the business they called.

## 5. Connect and check

### Connect

Needs the AWS CLI, the Session Manager plugin and credentials for the
project account.

```sh
# Shell on the server
aws ssm start-session --target i-054c4509d9515ba8b --region eu-north-1

# Or SSH through SSM (lets you use scp and git archive)
# ~/.ssh/config:
#   Host renovo
#     HostName i-054c4509d9515ba8b
#     User ubuntu
#     IdentityFile ~/.ssh/renovo.pem
#     ProxyCommand aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p --region eu-north-1
ssh renovo
```

On the server, every command below runs from `~/renovo`:

```sh
cd ~/renovo
alias dc='docker compose -f docker-compose.prod.yml'
```

### What is checked, in order

From your laptop:

```sh
curl -fsS https://$APP_DOMAIN/api/health   # expect {"status":"ok"}
curl -fsS https://$VOICE_DOMAIN/           # expect "Renovo Voice Bridge is running"
```

On the server:

```sh
dc ps                                   # all 6 up; backend "healthy"
dc logs --since 30m --tail 200 voice-bridge
dc logs --since 30m --tail 200 ai-agent
dc logs --since 30m --tail 200 backend
dc logs --since 30m caddy | grep -iE "error|acme|certificate"
df -h /                                 # disk (20 GB)
free -m                                 # memory (2 GB + 2 GB swap)
docker system df                        # images and logs eating disk
```

One AI agent turn (proves the Anthropic key and pricing path work):

```sh
dc exec ai-agent python -c "import json,urllib.request as u; r=u.Request('http://localhost:8002/agent/message', data=json.dumps({'call_sid':'ops-check','text':'Hi, how much to re-enamel a bath in the CBD?'}).encode(), headers={'Content-Type':'application/json'}); print(u.urlopen(r, timeout=60).read().decode())"
dc exec ai-agent python -c "import urllib.request as u; u.urlopen(u.Request('http://localhost:8002/agent/end/ops-check', method='POST'))"
```

Pricing server directly:

```sh
dc exec backend python -c "import urllib.request as u; print(u.urlopen('http://mcp-pricing-server:8001/mcp/pricing/rules').read()[:300])"
```

Last, the real test: one call from the dashboard's Demo call page.

## 6. Triage by symptom

Restarting does not reload `.env`. After any `.env` change, **recreate** the
container:

```sh
dc up -d --no-deps --force-recreate <service>
```

Recreating `voice-bridge` or `ai-agent` drops any call in progress: both keep
live call state in memory, and a call cut off before it ends is never saved.
Check `dc logs --since 5m voice-bridge` for an active call first.

### Calls fail, go silent or hang up straight away

| Check | Look for | Fix |
|---|---|---|
| `dc logs ai-agent` | `401 invalid x-api-key`, `credit balance`, `429`, `overloaded` | 401: new key (section 7). Billing: Anthropic console owner. 429/overloaded: wait, then retry |
| `dc logs voice-bridge` | `Failed to reach AI agent` | `dc ps ai-agent`; `dc up -d --no-deps ai-agent` |
| `dc logs voice-bridge` | `Rejected webhook with invalid Twilio signature` | `TWILIO_AUTH_TOKEN` in `.env` no longer matches the account, or `VOICE_DOMAIN` changed. Ask the Twilio owner |
| `dc logs voice-bridge` | No `Tracking active call` line at all | Twilio is not reaching us. Twilio owner checks the number's webhook is `https://<VOICE_DOMAIN>/voice` (POST) and Twilio's Debugger |
| `dc logs voice-bridge` | `ConversationRelay error` | Read the JSON. Often a bad `TTS_PROVIDER` / `TTS_VOICE` |
| `dc logs voice-bridge` | `Failed to save call to Renovo backend` | Backend down or `SERVICE_API_KEY` mismatch between services. See "Dashboard down" |
| `curl https://$VOICE_DOMAIN/` | TLS error | See "Certificate problems" |

### Dashboard down or login fails

| Check | Look for | Fix |
|---|---|---|
| `dc ps` | `backend` unhealthy or restarting | `dc logs backend`. A missing or short `SECRET_KEY` stops it starting |
| `/api/health` | 502 from nginx | Backend down; `dc up -d --no-deps backend`, then `dc restart frontend` if still 502 |
| `df -h /` | Disk over 90% | `docker image prune -f`; `docker builder prune -f`. Container logs have no size limit, so check `du -sh /var/lib/docker/containers/*` |
| `free -m` | Out of memory, containers killed | `dc up -d`; do not build images while calls are live |
| Login returns 429 | Rate limit, 5/minute | Behind Caddy, all users share one limit. Wait one minute |
| Login returns 401 for `sysadmin` | Wrong password | No self-service reset. Server operator resets the hash in the database |

### SMS not sent

| Check | Look for | Fix |
|---|---|---|
| `GET /api/notifications/` while logged in | Rows with `status = failed` | Read `dc logs voice-bridge \| grep "quote SMS"` |
| `.env` variable **names** only: `grep -o '^SMS_PROVIDER=[a-z]*' .env` | Provider set and expected | `smsportal`, `twilio` or the AWS sender |
| SMSPortal | Text replaced by "test message" | Free credits. Buy credits, or `SMSPORTAL_TEST_MODE` is on |
| AWS End User Messaging | Sends refused | Sandbox: only verified numbers, $1 a month cap. Instance role needs `sms-voice:SendTextMessage` |
| Call had no quote, R0 quote or no number | No SMS by design | Not an incident |

A failed SMS never blocks the call or lead from being saved. Renovo Cape can
phone the lead back from the dashboard.

### Pricing errors, R0 quotes or wrong prices

| Check | Look for | Fix |
|---|---|---|
| Pricing server check (section 5) | Connection refused | `dc up -d --no-deps mcp-pricing-server` |
| `dc logs mcp-pricing-server` | JSON or validation errors | A bad save from the Pricing page. Fix the rule in the dashboard and save again |
| Quotes in leads are R0 | Pricing failed during the call (known gap: failures return `estimated_quote: 0.0`) | Fix pricing, then send Renovo Cape the list of R0 leads to call back |

The rules live in the `pricing_config` volume. Rebuilding the image does not
reset them; removing the volume does.

### Certificate problems

| Check | Look for | Fix |
|---|---|---|
| `echo \| openssl s_client -connect $APP_DOMAIN:443 -servername $APP_DOMAIN 2>/dev/null \| openssl x509 -noout -dates -subject` | Expired, or wrong name | Read Caddy logs |
| `dc logs caddy` | ACME challenge failed | Port 80 must be open in the security group. DNS must point at the Elastic IP |
| `dc logs caddy` | `rateLimited` | Let's Encrypt limit. Wait; never delete `caddy_data` to "retry" |
| Elastic IP | Disassociated or changed | Re-associate. `sslip.io` names contain the IP, so a new IP means new domains, a new `.env` and a new Twilio webhook |

## 7. Rotating a leaked or revoked secret

Do this whenever a secret appears in git, chat, a screenshot or a log, or a
provider revokes it.

1. Create the new value in the provider's console (or `openssl rand -hex 32`
   for our own keys).
2. Back up and edit `.env` on the server without printing it:

   ```sh
   cd ~/renovo
   cp .env .env.bak-$(date +%Y%m%d%H%M%S)
   nano .env        # replace the one line; never cat, grep -v or echo the file
   ```
3. Recreate only the services that read it (table below).
4. Run the checks in section 5.
5. Revoke the old value in the provider's console.
6. Delete the backup, which still holds the old value: `rm ~/renovo/.env.bak-*`.
7. If it was committed to git, rotating is the fix. Rewriting history is optional.

| Secret | Rotate in | Recreate |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic console | `ai-agent` |
| `SECRET_KEY` (JWT signing) | `openssl rand -hex 32` | `backend`. Signs everyone out |
| `SERVICE_API_KEY` | `openssl rand -hex 32` | `backend voice-bridge` together |
| `TWILIO_AUTH_TOKEN` | Twilio console (account owner) | `voice-bridge backend` |
| `TWILIO_API_KEY_SID` / `TWILIO_API_KEY_SECRET` | Twilio console (account owner) | `backend` |
| `SMSPORTAL_CLIENT_ID` / `SMSPORTAL_API_SECRET` | SMSPortal console | `voice-bridge` |
| `POSTGRES_PASSWORD` | Generate a new one, then `ALTER USER renovo PASSWORD ...` in the `db` container and recreate `backend` | The database |
| `sysadmin` password | Dashboard Profile page (`POST /auth/me/password`) | Nothing |
| AWS credentials | IAM. The server should use its instance role, not keys | Nothing |

```sh
dc up -d --no-deps --force-recreate ai-agent             # one service
dc up -d --no-deps --force-recreate backend voice-bridge # two together
```

## 8. Suspected data breach

1. Contain: rotate `SECRET_KEY` (signs everyone out) and any leaked secret
   (section 7). Change the `sysadmin` password.
2. Preserve evidence: `dc logs --since 72h > ~/incident-$(date +%F).log` on
   the server. It contains personal data; keep it on the server.
3. Work out what was exposed: which tables (`leads`, `call_logs`,
   `notifications`), date range, how many people.
4. Tell the Renovo Cape contact **immediately**. Under POPIA section 21 we, as
   operator, must tell the responsible party; under section 22 Renovo Cape
   must tell the Information Regulator and the affected callers as soon as
   reasonably possible. We draft both notices for them.
5. Tell the lecturer.

## 9. Restoring data

The database is PostgreSQL in the `db` container, with its data in the
`pg_data` volume. `deploy/backup.sh` dumps it every night to `~/backups` on
the server and keeps 14 days (see "Backups" in `deploy/README.md`). Pricing
edits live in the `pricing_config` volume; if that is lost, prices fall back
to the rules baked into the image.

Take a fresh dump before any risky change (deploy, migration, volume work):

```sh
~/renovo/deploy/backup.sh
ls -l ~/backups
```

Restore a dump (this replaces the current data):

```sh
dc stop backend voice-bridge
dc exec -T db pg_restore -U renovo -d renovo --clean --if-exists < ~/backups/renovo-<date>.dump
dc start backend voice-bridge
curl -fsS https://$APP_DOMAIN/api/health
```

The dumps share the server's only disk, so they protect against a bad change
but not against losing the disk. The plan:

- Daily EBS snapshots with Amazon Data Lifecycle Manager (not set up yet).
- Restoring a snapshot was tested on 4 Nov 2026: PostgreSQL started from a
  restored copy with all leads. Steps: `deploy/README.md`, "Restore test
  from an EBS snapshot".

The SQLite file from before the move to PostgreSQL (4 Nov 2026) is still in
the `backend_data` volume, mounted read-only. It is only a fallback and is
not updated.

## 10. Deploying a fix

Follow "Deploy" in `deploy/README.md`: it unpacks the branch into a fresh
folder, copies the `.env` files across and swaps folders, keeping the last
deploy in `~/renovo.prev`. Don't unpack over `~/renovo`: files deleted from
the repo stay behind (a stale migration stopped the backend on 3 Nov 2026).

Take a database dump first (`~/renovo/deploy/backup.sh`, section 9). To roll
back, swap `~/renovo.prev` back in and run `dc up --build -d`; if the
deploy ran a migration, restore the dump taken before it. Avoid building during a demo: a build on a 2 GB instance can starve
the running containers.

## 11. Post-incident review template

Copy into `docs/incidents/YYYY-MM-DD-<short-name>.md` within 3 working days.

```markdown
# <Title>

- Date: 
- Severity: SEV1 / SEV2 / SEV3
- Incident lead: 
- Duration: <first symptom> to <resolved> (<minutes>)

## Impact
Who was affected and how (calls lost, leads missing, wrong quotes, data exposed).

## Timeline
| Time | What happened |
|---|---|

## Cause
The technical cause, and why it was not caught earlier.

## Fix
Exact commands or changes.

## Who was told
| Who | When | How |
|---|---|---|

## What we will change
| Action | Owner | Ticket |
|---|---|---|
```

## 12. Worked example: Anthropic key revoked (2026-11-02)

Times were not recorded during this incident.

- **Severity:** SEV1 (calls failed during demo preparation).
- **Impact:** every demo call failed. No calls were saved, so no leads were
  lost; there was nothing to save.
- **Detection:** someone noticed while testing a demo call. No alert fired.
- **Checks:** `dc ps` showed all six containers up. `dc logs ai-agent` showed
  `401 invalid x-api-key`. The same key was failing locally too, so it was the
  key, not the server.
- **Cause:** the Anthropic API key had been revoked. The same key was used in
  development and production.
- **Fix:**
  1. New key created in the Anthropic console.
  2. Copied into `~/renovo/.env` over SSM without being printed; old file kept
     as `.env.bak-<timestamp>`.
  3. Only the agent recreated, no rebuild:
     `docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate ai-agent`
  4. Checked with one agent turn (section 5): normal reply, no errors.
- **Who was told:** the team. Renovo Cape: `<record whether and when>`.
- **What we will change:**

  | Action | Owner | Ticket |
  |---|---|---|
  | Separate Anthropic keys for development and production | `<name>` | `<ticket>` |
  | Delete `~/renovo/.env.bak-*` (holds the dead key) | `<name>` | - |
  | Alert when calls fail instead of finding out by hand | `<name>` | RN-0035, RN-0036 |
