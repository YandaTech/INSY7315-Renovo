# Performance

Measured on 4 November 2026. Raw outputs are in [raw/](raw). Every number
below can be traced to a file there.

## Summary

| What | Before | After |
|---|---|---|
| Lighthouse, login page, mobile (perf / a11y / best practices / SEO) | 72 / 97 / 96 / 83 | **99 / 100 / 100 / 100** |
| Lighthouse, login page, desktop | 87 / 97 / 96 / 83 | **100 / 100 / 100 / 100** |
| Lighthouse, dashboard, mobile | 76 / 100 / 100 / 83 | **97 / 100 / 100 / 66** (SEO: see below) |
| Lighthouse, dashboard, desktop | 99 / 100 / 100 / 83 | **100 / 100 / 100 / 66** |
| Login page LCP, mobile (simulated slow 4G) | 6.5 s | **1.8 s** |
| Login page transfer size, desktop | 2,474 KiB | **206 KiB** |
| JS the login page downloads (gzip) | 223 kB | **106 kB** |
| `POST /pricing/calculate` p50, server side | 23.7 ms | **4.8 ms** |
| Live `GET /api/health` from South Africa, p50 / p95 / p99 | 181 / 306 / 1,153 ms, 0 errors | not redeployed |

"Before" is the code at `13e758c` (`origin/ali-dev`). "After" is this
branch. The live server still runs the "before" code, so the live numbers
describe the deployed system. The before/after comparison was made locally,
under identical conditions for both builds.

## 1. Lighthouse

Lighthouse 13.5.0, headless Chrome 156, on an Apple M5 MacBook. Mobile uses
Lighthouse's default simulated throttling (slow 4G: 150 ms RTT, 1.6 Mbit/s,
4x CPU slowdown). Desktop uses `--preset=desktop`.

### What the scores and metrics mean

Lighthouse is Google's page audit tool. It loads a page and scores it from 0
to 100 in four categories:

- **Performance:** how fast the page loads and becomes usable. The score is
  a weighted mix of the timing metrics below.
- **Accessibility (A11y):** automated checks such as labels on form fields,
  colour contrast and page landmarks. This catches common problems for
  screen reader and keyboard users, but not all of them.
- **Best practices:** checks such as HTTPS, no browser console errors and
  correctly sized images.
- **SEO:** whether search engines can find and index the page, for example a
  meta description and a valid `robots.txt`.

The timing columns in the tables are:

- **FCP (First Contentful Paint):** when the first text or image appears.
- **LCP (Largest Contentful Paint):** when the largest element in the
  viewport finishes rendering. On the login page that was the background
  image. LCP is the closest single number to "when the page looks loaded".
- **TBT (Total Blocking Time):** how long JavaScript blocked the main thread
  between FCP and the page becoming interactive. 0 ms means clicks and taps
  are never held up.
- **CLS (Cumulative Layout Shift):** how much visible content jumps around
  as the page loads. 0 is perfectly stable. Lighthouse treats anything below
  0.1 as good.
- **Transfer:** the total bytes downloaded over the network, after
  compression.

The mobile numbers matter most. Mobile runs simulate a slow phone on a slow
network, so they are the harder test and closer to what staff see on a weak
connection.

### Live login page (deployed code, before the changes)

`https://app.16-192-12-251.sslip.io/login`, one run each:

| Form factor | Performance | Accessibility | Best practices | SEO | FCP | LCP | Transfer |
|---|---|---|---|---|---|---|---|
| Mobile | 90 | 97 | 96 | 83 | 2.9 s | 2.9 s | 610 KiB |
| Desktop | 81 | 97 | 96 | 83 | 1.1 s | 2.6 s | 2,138 KiB |

(Mobile transfers less because the background photo is hidden below the
`md` breakpoint, so the browser never fetches it.)

Reports: [live-login-mobile-before.html](raw/lighthouse/live-login-mobile-before.html),
[live-login-desktop-before.html](raw/lighthouse/live-login-desktop-before.html).

### Before and after, local

To compare like with like, the same small server on localhost served both
builds. It gzips text like Caddy does and proxies `/api` to a local backend.
The "after" build also gets the new nginx cache headers. Each cell is the
median of 3 runs. The dashboard runs were logged in with a session cookie.

| Page, form factor | Build | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|---|---|---|
| Login, mobile | before | 72 | 97 | 96 | 83 | 3.0 s | 6.5 s | 0 ms | 0 | 947 KiB |
| Login, mobile | after | 99 | 100 | 100 | 100 | 1.7 s | 1.8 s | 0 ms | 0 | 150 KiB |
| Login, desktop | before | 87 | 97 | 96 | 83 | 0.7 s | 2.4 s | 0 ms | 0 | 2,474 KiB |
| Login, desktop | after | 100 | 100 | 100 | 100 | 0.4 s | 0.5 s | 0 ms | 0 | 206 KiB |
| Dashboard, mobile | before | 76 | 100 | 100 | 83 | 3.0 s | 5.1 s | 0 ms | 0 | 952 KiB |
| Dashboard, mobile | after | 97 | 100 | 100 | 66 | 1.8 s | 2.4 s | 0 ms | 0.006 | 278 KiB |
| Dashboard, desktop | before | 99 | 100 | 100 | 83 | 0.6 s | 1.0 s | 0 ms | 0.001 | 952 KiB |
| Dashboard, desktop | after | 100 | 100 | 100 | 66 | 0.4 s | 0.5 s | 0 ms | 0.007 | 278 KiB |

All 24 runs: [raw/lighthouse/summary.txt](raw/lighthouse/summary.txt) and
the `local-*.json.gz` reports (open one with
`gunzip -k` and drop the JSON on https://googlechrome.github.io/lighthouse/viewer/).

The largest change is mobile LCP on the login page: 6.5 s to 1.8 s. Before
the changes, a staff member on a phone waited more than six seconds for the
login page to look ready.

**Dashboard SEO 66 is deliberate.** The new `robots.txt` allows only the
login page. `/dashboard` is a logged-in staff page and should not be
indexed, so Lighthouse's "page is blocked from indexing" check fails there
by design. The login page, the only public page, scores 100.

### What Lighthouse found, and the fix

| Finding (before) | Fix |
|---|---|
| Main bundle 735 kB (223 kB gzip); Vite's chunk size warning; 149 KiB unused JS on the login page | Route-level code splitting with `React.lazy` in `frontend/src/routes/AppRoutes.tsx`. Login stays in the main bundle, and every other page is its own chunk. The dashboard preloads the other pages 1 s after it renders (`routes/pages.ts`), so moving between pages does not wait on the network. |
| LCP element is a 1.5 MB PNG background (1440x1024) | Converted to WebP at quality 75: 56 kB. |
| 356 kB logo shown at 44 px | Resized to 128 px wide: 12 kB. Explicit `width`/`height` on the `<img>`. |
| Render-blocking Google Fonts stylesheet (300 to 1,200 ms) | Self-hosted Plus Jakarta Sans with `@fontsource-variable/plus-jakarta-sans`. The `@font-face` rules ship in the app CSS, and the browser fetches only the latin subset (27 kB). The CSP in `deploy/Caddyfile` no longer allows the Google Fonts hosts. |
| No cache headers on any static file | `frontend/nginx.conf`: hashed `/assets/*` cached for a year (`immutable`), images for a day, `index.html` revalidated on every load. |
| Console error: `GET /api/auth/me` 401 on every visit to the login page | New `GET /auth/session` answers 200 with `{"user": null}` when nobody is logged in. The dashboard restores the session from it. `/auth/me` is unchanged. |
| No meta description; `robots.txt` was the SPA's HTML (20 errors) | Meta description and theme colour in `index.html`, and a real `public/robots.txt`. |
| No `<main>` landmark on the login and sign-up pages | The form side of `AuthLayout` is now `<main>`. |

Code splitting is the change that matters most here. Before, the login page
downloaded the code for every page in the app, including the charts library
used only on Statistics. Now it downloads only what the login page needs,
and the rest arrives later, when the user is already logged in.

What is left: about 50 KiB of unused JS on the login page (React DOM and
the router are needed on every page), and the CSS file counts as render
blocking, which is normal for an SPA. Neither moves the score below 99.

## 2. API latency on the live server

Tool: [hey](https://github.com/rakyll/hey) 0.1.5, 300 requests at
concurrency 5, from a home connection in South Africa to the EC2 server
in Stockholm (eu-north-1). Read-only endpoints only. We left the login
endpoint and every write endpoint alone.

| Endpoint | Requests | Errors | p50 | p95 | p99 | Slowest | Req/s |
|---|---|---|---|---|---|---|---|
| `GET /api/health` (Caddy, nginx, FastAPI) | 300 | 0 | 181 ms | 306 ms | 1,153 ms | 1,165 ms | 22.5 |
| `GET /` (dashboard shell, Caddy and nginx) | 300 | 0 | 178 ms | 249 ms | 542 ms | 543 ms | 26.0 |

Raw: [live-health-hey.txt](raw/live-health-hey.txt),
[live-shell-hey.txt](raw/live-shell-hey.txt).

### What p50, p95 and p99 mean

These are percentiles of the response times. Sort all 300 responses from
fastest to slowest:

- **p50** (the median) is the middle one. Half the requests were faster.
  This is the typical experience.
- **p95** is the response that 95% of requests beat. One request in twenty
  was slower.
- **p99** is the response that 99% of requests beat. Only the slowest 1%
  were worse.

We report all three because an average hides the slow tail. A service can
have a good average while one user in a hundred waits a second. The p99
shows that tail.

**Read these numbers as network time.** A single TCP handshake from here to
Stockholm takes 175 to 340 ms ([live-rtt-curl.txt](raw/live-rtt-curl.txt)),
so one round trip is about 175 ms. The p50 of 181 ms is one round trip
plus a few milliseconds of server time. The p99 is the 5 requests that
opened a new connection and paid for the TCP and TLS handshakes (hey's
"DNS+dialup" slowest is 0.98 s). Users closer to Stockholm pay less of
this. The server's own cost is in section 3.

In plain English, most of the 181 ms is the distance between South Africa and
Stockholm, not the server doing work. The 1-second p99 is a handful of
requests that had to set up a new secure connection first.

## 3. Server-side latency, no network

We measured the backend directly on `localhost` (uvicorn, one worker), so
the numbers are the server's own time. 1,000 requests at concurrency 5
after 50 warm-up requests, authenticated with a session cookie. The
database held 200 seeded leads.

| Endpoint | p50 | p95 | p99 | Errors |
|---|---|---|---|---|
| `GET /health` | 0.4 ms | 0.6 ms | 1.5 ms | 0 |
| `GET /leads/` (100 leads per response, from 200 in the table) | 9.5 ms | 16.4 ms | 22.8 ms | 0 |
| `POST /pricing/calculate`, before the fix | 23.7 ms | 28.4 ms | 33.8 ms | 0 |
| `POST /pricing/calculate`, after the fix | **4.8 ms** | **10.2 ms** | 29.8 ms | 0 |

Raw: `raw/local-sqlite-*-hey.txt`.

**The pricing fix.** The pricing server itself answers in 0.7 ms, so the
backend was spending about 23 ms on its own. `PricingService` opened a new
`httpx.AsyncClient` for every request, which builds an SSL context and
opens a new connection each time. It now reuses one client per event loop
(`backend/app/services/pricing_service.py`). Calculating a quote, logging
a call without a quote, and loading the Pricing and Log a call forms all
use this path.

Put simply, the backend was setting up a new connection to the pricing
server for every request and throwing it away afterwards. Keeping one
connection open removes that setup cost, which was most of the time.

**Caveat.** Docker Desktop on the test machine stopped responding during
this session, so these runs used the backend and pricing server started
natively with SQLite (same code, same settings as
`docker-compose.e2e.yml`) instead of the PostgreSQL container. PostgreSQL
over the Docker network adds a fraction of a millisecond per query; the
shape of the results does not change.

## 4. Bundle size

From `vite build` (Vite 8.3.5). Full output:
[bundle-before.txt](raw/bundle-before.txt),
[bundle-after.txt](raw/bundle-after.txt).

Each cell shows two sizes. **Raw** is the file size on disk. **Gzip** is
the size after compression, which is roughly what the browser downloads,
because the server compresses text files before sending them. The gzip
number is the one that affects load time on a slow network. The raw number
still matters on slow phones, because the browser has to parse and run all
of it.

| | Before (raw / gzip) | After (raw / gzip) |
|---|---|---|
| Main JS chunk (everything the login page runs) | 734.9 / 222.9 kB | **324.1 / 105.7 kB** |
| Dashboard page (main + layout + page chunks) | 734.9 / 222.9 kB | 352 / 115 kB |
| Statistics chunk (recharts) | in main chunk | 362.2 / 105.1 kB, loaded only on Statistics |
| DemoCall chunk (Twilio Voice SDK) | 183.0 / 47.5 kB | 183.0 / 47.5 kB |
| All JS together | 917.8 / 270.4 kB | 921.2 / 277.2 kB |
| CSS | 28.2 / 6.2 kB | 31.9 / 8.7 kB (now includes the `@font-face` rules) |
| Font files | from Google Fonts | 27.3 kB latin, 21.7 kB latin-ext, 8.4 kB Vietnamese (woff2, fetched only when a page uses those characters) |
| Chunk size warning | yes | no |

The total stays about the same. What changed is that each page downloads
only what it uses.

## 5. Call end to lead visible

Not measured. `voice-bridge/scripts/simulate-call.js` drives a call
through the AI agent, which needs a real Anthropic API key, and this run
used only throwaway values. The E2E test "Log a call creates a lead"
covers the dashboard half of the path: the lead appears in the table
without a reload, within Playwright's default wait, in every run.

## 6. End-to-end tests

13 Playwright tests in [e2e/tests](../../e2e/tests), run by the "End-to-end
tests" job in `.github/workflows/ci-cd.yml` against the stack from
`docker-compose.e2e.yml`. Local wall time for the suite is 9 s with 4
workers and 14 s with the CI settings (2 workers), plus about 1 to 2
minutes to build and start the containers.

## How to reproduce

```
# Lighthouse (Chrome installed)
npx lighthouse@13.5.0 https://app.16-192-12-251.sslip.io/login --output=html
npx lighthouse@13.5.0 https://app.16-192-12-251.sslip.io/login --preset=desktop --output=html

# Live latency, read-only endpoints only
hey -n 300 -c 5 https://app.16-192-12-251.sslip.io/api/health
hey -n 300 -c 5 https://app.16-192-12-251.sslip.io/

# Bundle sizes
cd frontend && npm ci && npx vite build
```
