<!-- Written by ajiya. Do not edit by hand: use ajiya commands. -->
# Release

Goal: The marked main branch holds the deployed work and the app runs on a live HTTPS host

| ID | App | Ticket | Done when | Depends | Tags | Status |
|---|---|---|---|---|---|---|
| RN-0001 | infra | Merge Yaseera's final push, then ui-overhaul, into main | main contains ui-overhaul and CI is green on main | - | - | 🟩 Done · by Aliyu Yahaya · 2026-11-04 · tests passed · Note: ali-dev merged into main via PR #16 (merge commit 3fa5823) and PR #17 |
| RN-0002 | infra | Confirm the live host is up | Dashboard loads over HTTPS at APP_DOMAIN and a test call creates a lead | RN-0001 | - | 🟩 Done · by Aliyu Yahaya · 2026-11-02 · Note: ali-dev deployed 2026-11-02; browser Demo call CA1905a3 quoted, call and lead 17 saved, headers and auth checked live |
| RN-0003 | infra | Write the hosting rationale (EC2 + Caddy instead of Railway) | deploy/README.md has a section explaining why Railway was dropped and why EC2 + Caddy fits | - | - | 🟩 Done · by Aliyu Yahaya · 2026-11-04 · tests passed · Note: deploy/README.md 'Why EC2 and Caddy instead of Railway', with trade-offs; two points marked (team to confirm) |
| RN-0004 | infra | Turn on GitHub repo Insights for the marker | Marker can see each member's contributions under Insights | - | - | 🟩 Done · by Aliyu Yahaya · 2026-11-04 · tests passed · Note: Marker added as a collaborator; docs/contributions.md gives per-member history (Insights graphs need a paid plan for private repos) |
| RN-0039 | infra | Submit the live deployment URL on ARC | The live dashboard URL is submitted on ARC and opens the current main build | RN-0002 | - | 🟥 Pending · Needs a human: ARC submission is done by the PM in the browser |
| RN-0040 | infra | Final report updated from Task 1 with Task 2 feedback | Final report covers every Task 2 marker comment and describes the deployed system | RN-0002, RN-0048, RN-0049, RN-0050 | - | 🟩 Done · by Aliyu Yahaya · 2026-11-04 · tests passed · Note: docs/final-report.md final; PDF/DOCX plus per-member copies in the submission pack |
| RN-0041 | infra | EXPO presentation with live end-to-end demo | Deck, board and rehearsed demo start with Renovo and its user stories, then show call, AI quote, lead, dashboard and pricing live | RN-0002, RN-0038 | - | 🟥 Pending · Needs a human: slides, physical board and rehearsal are done by the team |
| RN-0042 | infra | Individual submissions: ARC upload, peer evaluations, declaration | Each member has submitted on ARC with Annexure A and one Annexure B form per teammate | RN-0040 | - | 🟥 Pending · Needs a human: each member signs and submits their own forms |
