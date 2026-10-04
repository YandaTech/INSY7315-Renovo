# INSY7315-Renovo

AI phone receptionist for Renovo: a caller rings the Twilio number, a
Claude Haiku agent collects the job details and gives an estimate, and the
call, transcript and lead land in a dashboard for staff to follow up.

```
Twilio call -> voice-bridge -> ai-agent -> mcp-pricing-server
                    |
                    v  (call ends: call log + lead)
                 backend  <-  frontend (staff dashboard)
```

| Service | Port | What it does |
|---|---|---|
| `frontend` | 5173 | React dashboard: leads, call stats, manual call logging |
| `backend` | 8000 | FastAPI + SQLite: calls, leads, admin auth (`/docs`) |
| `mcp-pricing-server` | 8001 | Quote calculation from `config/pricing_rules.json` |
| `ai-agent` | 8002 | Claude Haiku conversation loop |
| `voice-bridge` | 5000 | Twilio webhook + ConversationRelay WebSocket |

## Run everything

```
cp .env.example .env      # fill in ANTHROPIC_API_KEY at minimum
docker compose up --build
```

Open http://localhost:5173, sign up, log in. In Docker, voice-bridge is on
host port **5050** (macOS AirPlay holds 5000).

## Test a call without a phone

With the stack running:

```
cd voice-bridge
PORT=5050 npm run simulate-call                    # scripted caller
PORT=5050 npm run simulate-call -- --interactive   # type the caller's lines
```

This plays Twilio's part over the WebSocket, so the call goes through the
agent and pricing server and ends up as a call log and lead in the
dashboard. The final hang-up logs a Twilio 401 because the call SID is fake.

## Test a real call

1. `ngrok http 5050`
2. In the Twilio console, set the number's voice webhook to
   `https://<ngrok-host>/voice` (HTTP POST). The number only needs Voice
   capability.
3. Call the number.

## Tests

```
cd backend && python -m pytest
```
