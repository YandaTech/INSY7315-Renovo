<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Release

Goal: The marked main branch holds the deployed work and the app runs on a live HTTPS host

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0001 | infra | Merge Yaseera's final push, then ui-overhaul, into main | main contains ui-overhaul and CI is green on main | - | - | 🟥 Pending · Needs a human: team decision; Yaseera's push lands first |
| RN-0002 | infra | Confirm the live host is up | Dashboard loads over HTTPS at APP_DOMAIN and a test call creates a lead | RN-0001 | - | 🟥 Pending · Needs a human: needs access to the server and Twilio console |
| RN-0003 | infra | Write the hosting rationale (EC2 + Caddy instead of Railway) | deploy/README.md has a section explaining why Railway was dropped and why EC2 + Caddy fits | - | - | 🟥 Pending · Needs a human: only the team knows why Railway was dropped |
| RN-0004 | infra | Turn on GitHub repo Insights for the marker | Marker can see each member's contributions under Insights | - | - | 🟥 Pending · Needs a human: repository settings need an owner |
