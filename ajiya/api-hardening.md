<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Api-hardening

Goal: The API takes typed data in request bodies, fails safely and exposes nothing extra

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0014 | backend | Calls and leads in typed JSON request bodies | POST /calls and /leads take validated JSON bodies; voice-bridge and the Log Call form send bodies; no names, numbers or transcripts appear in URLs; tests pass | - | - | 🟩 Done · 2c8d655 · 2026-11-02 · tests passed |
| RN-0015 | backend | Move call, lead and pricing routes out of main.py into routers | main.py only builds the app and includes routers; tests pass | RN-0014 | - | 🟥 Pending |
| RN-0016 | backend | Pricing failure leaves the quote empty instead of R0 | A test with the pricing server down saves the lead with no quote; the dashboard shows the quote as pending | RN-0014 | - | 🟥 Pending |
| RN-0017 | infra | Security headers, and API docs hidden in production | Responses carry HSTS, CSP, X-Content-Type-Options, X-Frame-Options and Referrer-Policy; /docs returns 404 when ENVIRONMENT=production | - | - | 🟩 Done · 6f364c9 · 2026-11-02 · tests passed |
| RN-0018 | voice-bridge | Fail closed on Twilio signatures in production | Tests show production refuses to start without TWILIO_AUTH_TOKEN and ignores ALLOW_UNVERIFIED_CALLS and VALIDATE_TWILIO_SIGNATURE=false | - | - | 🟩 Done · d3c3911 · 2026-11-02 · tests passed |
| RN-0047 | voice-bridge | Keep transcripts and personal data out of logs and URLs | voice-bridge no longer logs what callers or the agent say, calls and leads go to the backend in request bodies not query strings, and container logs rotate in docker-compose.prod.yml | RN-0014 | path:backend/app/** path:docker-compose.prod.yml path:voice-bridge/src/** | 🟥 Pending |
