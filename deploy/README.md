# Deploying Renovo

One EC2 server in `eu-north-1` runs the whole stack with
`docker-compose.prod.yml`. Caddy is the only public entrypoint and serves
HTTPS for two hostnames:

| Hostname | Goes to | Used by |
|---|---|---|
| `APP_DOMAIN` | frontend (nginx, which proxies `/api` to the backend) | Staff dashboard |
| `VOICE_DOMAIN` | voice-bridge | Twilio webhook + ConversationRelay WebSocket |

The backend, ai-agent and pricing server are only reachable on the internal
Docker network. Only Caddy publishes ports; don't add `ports:` to other
services.

For incidents, health checks, secret rotation and manual database copies, see
[docs/incident-response.md](../docs/incident-response.md).

## Why EC2 and Caddy instead of Railway

The Task 2 plan said Renovo would be hosted on Railway. We moved to one EC2
instance with Caddy in front. The move was made when the production deploy
was prepared (commit `5b65384`, 5 Oct 2026). Railway is not mentioned
anywhere else in the repository, so the reasons below come from what the
stack needs. Points marked "(team to confirm)" depend on what the team
remembers and are not recorded anywhere in the repo.

### What the stack needs

- **Six services that talk to each other.** backend, mcp-pricing-server,
  ai-agent, voice-bridge, frontend and caddy are defined in one file,
  `docker-compose.prod.yml`. On a VM with Docker, that file runs as it is,
  with the same Compose setup we use in development. On Railway, each
  service is set up and deployed as a separate service, so the Compose file
  can't be used as it is.
- **A long-lived WebSocket.** Twilio ConversationRelay holds a WebSocket open
  to voice-bridge for the whole call (`voice-bridge/src/websocket.js`). On
  our own server, Caddy proxies it straight to the container with no
  platform request limits or idle timeouts in between. Some platforms put
  limits like these on WebSocket connections (team to confirm whether this
  was a problem on Railway).
- **Two public HTTPS hostnames.** Twilio must reach `https://<VOICE_DOMAIN>/voice`
  and `wss://<VOICE_DOMAIN>/`, and staff use `https://<APP_DOMAIN>`. Caddy
  gets and renews Let's Encrypt certificates for both by itself
  (`deploy/Caddyfile`). With free `sslip.io` names built from the Elastic IP,
  we don't need to buy a domain.
- **Data that survives rebuilds.** The database, pricing edits and Caddy's
  certificates live in named Docker volumes (`backend_data`,
  `pricing_config`, `caddy_data`) on the instance's EBS disk.

### Why EC2 fits

- **One AWS account for hosting, SMS and email.** Quote SMS goes through
  AWS End User Messaging and quote email through Amazon SES, both
  authorised by the EC2 instance role, so no SMS or email keys are stored
  in `.env` (see "SMS" and "Email" below).
- **One bill with a known amount.** A `t3.small` has a fixed hourly price,
  and the volumes are on its 20 GB gp3 disk. Railway charges by usage
  (team to confirm that cost was part of the decision).
- **Smaller attack surface.** Only Caddy publishes ports (80 and 443).
  Port 22 is closed, and admins reach the server only through AWS Systems
  Manager, with IAM controlling who can connect.
- **Full control of the edge.** Security headers and the CSP are set in one
  place (`deploy/Caddyfile`). Caddy applies them after the proxied
  response, so they win over anything nginx or FastAPI sends.

### Trade-offs, and what reduces them

| Trade-off | What reduces it |
|---|---|
| One server, so it is a single point of failure | Every service has `restart: unless-stopped`, so it comes back after a crash or reboot. The backend has a health check, and voice-bridge and the frontend wait until it reports healthy |
| No autoscaling | The load is a few concurrent calls for one business, which a `t3.small` with 2 GB swap handles. We don't build during demos, because a build can starve the running containers |
| We patch the OS and Docker ourselves | Ubuntu 24.04 LTS, the `caddy:2-alpine` image, and rebuilt images on each deploy (team to confirm the patching routine) |
| We run backups ourselves | Manual database copies before risky changes ([incident-response.md section 9](../docs/incident-response.md#9-restoring-data)). EBS snapshots are planned (see "Backups") |
| Disk can fill up | Every container's logs rotate at 10 MB, keeping 3 files |
| Deploys are manual | One documented `git archive` command (see "Deploy"), followed by a health check and a test call |

## Server

- EC2 `t3.small` (2 GB), Ubuntu 24.04, 20 GB gp3, Elastic IP, 2 GB swap
- Security group: 80 and 443 from anywhere. **Port 22 is closed**; admin
  access goes through AWS Systems Manager (SSM)
- Hostnames: a real domain, or free `sslip.io` names built from the
  Elastic IP, e.g. `app.13-48-1-2.sslip.io` and `voice.13-48-1-2.sslip.io`
- Secrets live only in `~/renovo/.env` on the server. Never commit, copy
  off the server or print it

## Connect

Needs, on your laptop: the AWS CLI with the `renovo` profile, the
[Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html),
and `~/.ssh/renovo.pem`.

```sh
export AWS_PROFILE=renovo
ssh -i ~/.ssh/renovo.pem \
  -o ProxyCommand="aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p --region eu-north-1" \
  ubuntu@<instance-id>
```

To shorten this to `ssh renovo`, add a `Host renovo` block to
`~/.ssh/config` as shown in
[incident-response.md section 5](../docs/incident-response.md#5-connect-and-check).
The commands below use that alias.

## Deploy

Deploys copy a branch with `git archive`; the server has no git checkout and
no GitHub credentials. `git archive` only writes tracked files, so it never
touches `.env` or the Docker volumes.

The branch is unpacked into a fresh folder that then replaces `~/renovo`,
keeping only the `.env` files. Unpacking over the old folder would leave
files deleted from the repo behind; a stale Alembic migration left that
way stopped the backend from starting on 3 Nov 2026.

```sh
# From your laptop, on the branch to deploy
git archive --format=tar <branch> | ssh renovo 'set -e
  rm -rf ~/renovo.new && mkdir ~/renovo.new && tar -xf - -C ~/renovo.new
  if [ -d ~/renovo ]; then
    cp -p ~/renovo/.env* ~/renovo.new/ 2>/dev/null || true
    rm -rf ~/renovo.prev && mv ~/renovo ~/renovo.prev
  fi
  mv ~/renovo.new ~/renovo'

# On the server
cd ~/renovo
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps   # all 6 up, backend "healthy"
```

Before a deploy, take a manual database copy
([section 9](../docs/incident-response.md#9-restoring-data)). Don't build
during a demo: a build on 2 GB can starve the running containers.

After a deploy:

1. `curl -fsS https://<APP_DOMAIN>/api/health` returns `{"status":"ok"}`.
2. Make one call from the dashboard's **Demo call** page with the browser
   console open. Check that there are no Content-Security-Policy violations
   (see "Security headers" below).

## First-time setup

On a new instance, with SSM access working:

```sh
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu && newgrp docker

# 2 GB swap so image builds don't run out of memory on a t3.small
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Then run the `git archive` step above, and on the server:

```sh
cd ~/renovo
cp .env.production.example .env && chmod 600 .env   # fill in every value
docker compose -f docker-compose.prod.yml up --build -d
```

`.env` values: generate `SECRET_KEY` and `SERVICE_API_KEY` with
`openssl rand -hex 32` (never reuse the dev values), and copy the
Anthropic and Twilio keys from their consoles. The SMS settings are in
`.env.production.example` too (see "SMS" below).

Then:

1. Open `https://<APP_DOMAIN>` and sign up the first staff account.
2. In the Twilio Console, set the number's voice webhook to
   `https://<VOICE_DOMAIN>/voice` (HTTP POST).
3. Call the number.

## Changing `.env`

Edit `~/renovo/.env` on the server without printing it, then recreate only
the services that read the changed value. No rebuild is needed:

```sh
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate <service>
```

A plain `docker compose restart` does **not** reload `.env`. Recreating
`voice-bridge` or `ai-agent` drops any call in progress. Which service reads
which secret, and the full rotation steps, are in
[section 7](../docs/incident-response.md#7-rotating-a-leaked-or-revoked-secret).

## Production mode

`docker-compose.prod.yml` sets `ENVIRONMENT: production` for:

- **backend**: hides `/docs`, `/redoc` and `/openapi.json`, and marks the
  auth cookie `Secure`.
- **voice-bridge**: rejects webhooks without a valid `X-Twilio-Signature`
  (checked with `TWILIO_AUTH_TOKEN`) and only streams calls announced by a
  verified webhook. It fails closed: it refuses to start without
  `TWILIO_AUTH_TOKEN` and ignores `ALLOW_UNVERIFIED_CALLS` and
  `VALIDATE_TWILIO_SIGNATURE=false`.

## Security headers

`deploy/Caddyfile` adds HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` and a Content-Security-Policy to the
dashboard, and basic hardening headers to the voice hostname. If the frontend
starts loading something from a new origin (a font, a Twilio endpoint), the
CSP blocks it and the browser console shows the violation. That is why every
deploy ends with a Demo call check. Change the CSP in `deploy/Caddyfile`, not
in nginx or FastAPI.

## Pricing rules

The pricing server keeps its rules in the `pricing_config` Docker volume,
seeded from `mcp-pricing-server/config/pricing_rules.json` on first run.
Rebuilding the image does **not** update them. Edit prices on the dashboard's
Pricing page, or copy a new file into the running container:

```sh
docker compose -f docker-compose.prod.yml cp \
  mcp-pricing-server/config/pricing_rules.json \
  mcp-pricing-server:/app/config/pricing_rules.json
docker compose -f docker-compose.prod.yml restart mcp-pricing-server
```

## SMS

`SMS_PROVIDER` in `.env` picks the sender voice-bridge uses for quote SMS:

- `aws`: AWS End User Messaging, authenticated by the EC2 instance role (no
  keys in `.env`). `AWS_REGION` defaults to `eu-north-1`;
  `AWS_SMS_ORIGINATION_IDENTITY` is optional.
- `smsportal`: SMSPortal, with the API keys `SMSPORTAL_CLIENT_ID` and
  `SMSPORTAL_API_SECRET`. `SMSPORTAL_TEST_MODE` sends test messages only.
- Unset, it falls back to Twilio.

After changing it, recreate `voice-bridge` (see "Changing `.env`").

## Email

If the caller gives an email address on the call, voice-bridge also emails
them the quote, once per quoted call, and logs it in `/notifications/` as
`sent` or `failed`. `EMAIL_PROVIDER` in `.env` picks the sender:

- `ses`: Amazon SES (v2 API), authenticated by the EC2 instance role (no keys
  in `.env`), in `AWS_REGION` (default `eu-north-1`). `EMAIL_FROM` is the
  sender address.
- `none` or unset: no email is sent; voice-bridge logs that it skipped it.

Before setting `EMAIL_PROVIDER=ses`, a human must:

1. Verify the `EMAIL_FROM` address (or its domain) as an SES identity in
   `eu-north-1`.
2. Give the server's instance role `ses:SendEmail` on that identity.
3. While the account is in the SES sandbox, verify each recipient address
   too, or request production access.

Then recreate `voice-bridge` (see "Changing `.env`").

## Backups

The database is dumped every night at 02:00 (server time) by
`deploy/backup.sh`, run from the `ubuntu` user's crontab. Dumps go to
`~/backups` on the server (outside the Docker volumes), are readable by
`ubuntu` only, and are kept for 14 days. They hold personal data: do not
download them to a laptop.

```sh
# Install the nightly job (once)
chmod +x ~/renovo/deploy/backup.sh
(crontab -l 2>/dev/null | grep -v renovo/deploy/backup.sh; \
 echo '0 2 * * * $HOME/renovo/deploy/backup.sh >> $HOME/backups/backup.log 2>&1') | crontab -

# Take one now, e.g. before a risky change
~/renovo/deploy/backup.sh
```

Restore a dump (this replaces the current data):

```sh
cd ~/renovo
docker compose -f docker-compose.prod.yml stop backend voice-bridge
docker compose -f docker-compose.prod.yml exec -T db \
  pg_restore -U renovo -d renovo --clean --if-exists < ~/backups/renovo-<date>.dump
docker compose -f docker-compose.prod.yml start backend voice-bridge
```

The dumps are on the server's only disk, so they protect against a bad
change but not against losing the disk. Daily EBS snapshots with Amazon Data
Lifecycle Manager would cover that and are not set up yet. Pricing edits live
in the `pricing_config` volume; see
[incident-response.md section 9](../docs/incident-response.md#9-restoring-data).

## Production database: PostgreSQL on the same server

Decision record for RN-0022. Decided by the project lead in November 2026.

### Decision

Move production from SQLite to PostgreSQL 16:

- PostgreSQL runs as its own container in the same `docker-compose.prod.yml`
  stack, on the existing EC2 instance.
- Its data lives in a named Docker volume on the instance's EBS disk.
- The backend connects over the internal Docker network only. The database
  port is not published to the host or the internet.
- Alembic manages the schema. `backend/app/migrate.py` runs the migrations
  each time the backend starts.

### Cost

PostgreSQL adds no charge beyond the EC2 instance and its EBS storage, which
we already pay for. It shares the instance's CPU, its 2 GB of memory and its
20 GB disk.

### Why

- Marker feedback asked us to move production off SQLite.
- SQLite allows only one writer at a time. PostgreSQL handles concurrent
  writes from calls and dashboard edits.
- The code already supports it. `backend/app/db.py` accepts a PostgreSQL
  `DATABASE_URL` and sets up connection pooling for it.

### Alternatives considered

| Option | For | Against |
|---|---|---|
| Stay on SQLite | Nothing new to run | Marker feedback asked us to move off it; one writer at a time |
| Amazon RDS for PostgreSQL | AWS handles backups, patching and point-in-time restore | An extra monthly charge. In `eu-north-1`, a Single-AZ `db.t4g.micro` costs $0.016 per hour on demand (about $11.70 a month), plus $0.12 per GB-month of gp3 storage (about $2.40 for 20 GB). Source: AWS Price List API, RDS offer for `eu-north-1`, published 29 Oct 2026. Check the [RDS pricing page](https://aws.amazon.com/rds/postgresql/pricing/) for current prices |
| **PostgreSQL container on the EC2 instance (chosen)** | No extra cost; same deploy and network as the rest of the stack | We do the backups, upgrades and monitoring ourselves |

### Trade-off and upgrade path

The database shares one server with the rest of the stack. If that server or
its disk is lost, the database goes with it unless a backup exists elsewhere.

To move to RDS later, only `DATABASE_URL` needs to change. The app and the
Alembic migrations are the same for both. The steps: restore a `pg_dump`
into the RDS instance, point `DATABASE_URL` at it, and remove the database
service from the Compose file.

### Backups

The nightly `pg_dump` in [Backups](#backups) covers the database.

## Logs

```sh
docker compose -f docker-compose.prod.yml logs -f --tail 200 voice-bridge
```
