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

```sh
# From your laptop, on the branch to deploy
git archive --format=tar <branch> | ssh renovo 'mkdir -p ~/renovo && tar -xf - -C ~/renovo'

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
Anthropic and Twilio keys from their consoles. For SMS, add the variables
from `.env.example` (see "SMS" below).

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

## Backups

**There are no automated backups yet.** Leads, calls, staff accounts and
pricing edits live in the `backend_data` and `pricing_config` volumes on the
server's only disk. Daily EBS snapshots with Amazon Data Lifecycle Manager are
planned but not set up. Until then, take a manual copy before risky changes;
see [incident-response.md section 9](../docs/incident-response.md#9-restoring-data).

## Logs

```sh
docker compose -f docker-compose.prod.yml logs -f --tail 200 voice-bridge
```
