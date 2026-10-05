# Deploying Renovo

One EC2 server in the project's Region (`eu-north-1`) runs the whole stack
with `docker-compose.prod.yml`. Caddy is the only public entrypoint and
serves HTTPS for two hostnames:

| Hostname | Goes to | Used by |
|---|---|---|
| `APP_DOMAIN` | frontend (nginx, which proxies `/api` to the backend) | Staff dashboard |
| `VOICE_DOMAIN` | voice-bridge | Twilio webhook + ConversationRelay WebSocket |

The backend, ai-agent and pricing server are only reachable on the internal
Docker network.

## Server

- EC2 `t3.small` (2 GB), Ubuntu 24.04, 20 GB gp3, Elastic IP
- Security group: 80 and 443 from anywhere, 22 from your own IP only
- Hostnames: a real domain, or free `sslip.io` names built from the
  Elastic IP, e.g. `app.13-48-1-2.sslip.io` and `voice.13-48-1-2.sslip.io`

## First deploy

```
ssh -i ~/.ssh/renovo.pem ubuntu@<elastic-ip>

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu && newgrp docker

# 2 GB swap so image builds don't run out of memory on a t3.small
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

git clone -b staging https://github.com/YandaTech/INSY7315-Renovo.git renovo
cd renovo
cp .env.production.example .env   # fill in every value, see below
docker compose -f docker-compose.prod.yml up --build -d
```

`.env` values: generate `SECRET_KEY` and `SERVICE_API_KEY` with
`openssl rand -hex 32` (never reuse the dev values), and copy the
Anthropic and Twilio keys from their consoles.

Then:

1. Open `https://<APP_DOMAIN>`, sign up the first staff account.
2. In the Twilio Console, set the number's voice webhook to
   `https://<VOICE_DOMAIN>/voice` (HTTP POST).
3. Call the number.

## Security

- voice-bridge rejects webhooks without a valid `X-Twilio-Signature`
  (checked with `TWILIO_AUTH_TOKEN`), and only streams calls announced by
  a verified webhook. Never set `ALLOW_UNVERIFIED_CALLS` in production.
- Only Caddy publishes ports. Don't add `ports:` to other services.

## Updating

```
cd renovo && git pull
docker compose -f docker-compose.prod.yml up --build -d
```

## Backups

Leads, calls, staff accounts and pricing edits live in the `backend_data`
and `pricing_config` volumes on the server's disk. Schedule daily EBS
snapshots with Amazon Data Lifecycle Manager.

## Logs

```
docker compose -f docker-compose.prod.yml logs -f voice-bridge
```
