#!/usr/bin/env bash
# Security scans of the Renovo production stack, run locally in Docker.
#
#   docs/security/scan.sh baseline <tree> [stage ...]   -> docs/security/baseline/
#   docs/security/scan.sh retest   <tree> [stage ...]   -> docs/security/retest/
#   docs/security/scan.sh live                          -> docs/security/retest/live/
#
# <tree> is a checkout of the commit to scan, for example
#   git worktree add ../renovo-baseline f7ebb5d
# Put "Scanned commit: <sha>" in <out>/commit.txt first so probes.txt names it.
# Stages (default: all, in this order): up probes nmap deps zap down
#
# The stack is docker-compose.prod.yml from <tree> plus compose.scan.yml
# from this folder: a throwaway env file (random keys, ENVIRONMENT=
# production), local logs, and Caddy on loopback-only ports. No real .env
# is read. Active scans (ZAP API scan) only ever target this local stack.
#
# "live" is passive only: one ZAP baseline per hostname, one Nmap top-ports
# service scan, and a handful of single GET/HEAD requests. It never logs in
# and never active-scans the server.
#
# Needs: Docker, curl, python3, npm, uvx (for pip-audit).
set -uo pipefail

name="${1:?usage: scan.sh baseline|retest <tree> [stage...] | scan.sh live}"
here="$(cd "$(dirname "$0")" && pwd)"

ZAP_IMAGE=ghcr.io/zaproxy/zaproxy:stable
NMAP_IMAGE=instrumentisto/nmap:latest
CURL_IMAGE=curlimages/curl:8.11.1
PIP_AUDIT="uvx pip-audit==2.10.1"

log() { printf '\n[%s] %s\n' "$(date -u +%H:%M:%S)" "$*" >&2; }

# Replace the throwaway secrets and any JWT in raw outputs.
redact() {
  python3 - "$1" "${SECRET_KEY:-}" "${SERVICE_API_KEY:-}" "${TWILIO_AUTH_TOKEN:-}" "${ADMIN_PASSWORD:-}" "${STAFF_PASSWORD:-}" <<'PY'
import pathlib, re, sys
root, *secrets = sys.argv[1:]
jwt = re.compile(r"eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}")
for p in pathlib.Path(root).rglob("*"):
    if not p.is_file() or p.suffix not in {".txt", ".json", ".md", ".log", ".yaml"}:
        continue
    text = p.read_text(errors="replace")
    new = jwt.sub("REDACTED_JWT", text)
    for s in secrets:
        if s:
            new = new.replace(s, "REDACTED")
    if new != text:
        p.write_text(new)
PY
}

# ---------------------------------------------------------------- live
if [ "$name" = live ]; then
  out="$here/retest/live"
  mkdir -p "$out"
  app=app.16-192-12-251.sslip.io
  voice=voice.16-192-12-251.sslip.io
  {
    echo "# Live server checks (passive), $(date -u +%Y-%m-%dT%H:%MZ)"
    for h in "$app" "$voice"; do
      echo; echo "## HEAD https://$h/"; curl -sSI "https://$h/" | tr -d '\r'
    done
    for p in /api/docs /api/redoc /api/openapi.json /api/health; do
      printf '\nGET https://%s%s -> ' "$app" "$p"
      curl -s -o /dev/null -w '%{http_code}\n' "https://$app$p"
    done
    printf '\nPOST https://%s/voice (no Twilio signature) -> ' "$voice"
    curl -s -o /dev/null -w '%{http_code}\n' -X POST -d 'CallSid=CAlivecheck' "https://$voice/voice"
    printf '\nGET http://%s/ -> ' "$app"
    curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "http://$app/"
  } > "$out/live-checks.txt" 2>&1
  log "nmap top 1000 ports"
  docker run --rm "$NMAP_IMAGE" -Pn -sV -T3 --top-ports 1000 \
    --script ssl-enum-ciphers,http-server-header "$app" -oN - > "$out/nmap-live.txt" 2>&1
  for h in app voice; do
    log "ZAP baseline (passive) $h"
    docker run --rm -v "$out:/zap/wrk:rw" "$ZAP_IMAGE" zap-baseline.py \
      -t "https://$h.16-192-12-251.sslip.io/" -m 2 -I \
      -J "zap-baseline-live-$h.json" -w "zap-baseline-live-$h.md" > "$out/zap-baseline-live-$h.log" 2>&1
  done
  redact "$out"
  log "Results in $out"
  exit 0
fi

# ---------------------------------------------------------------- local stack
tree="$(cd "${2:?give the source tree to scan}" && pwd)"
shift 2
stages=("$@")
[ ${#stages[@]} -eq 0 ] && stages=(up probes nmap deps zap down)

case "$name" in
  baseline) http_port=18080 https_port=18443 ;;
  retest)   http_port=28080 https_port=28443 ;;
  *) echo "unknown scan name: $name" >&2; exit 2 ;;
esac

out="$here/$name"
mkdir -p "$out"
proj="renovo-scan-$name"
net="${proj}_default"
state="${TMPDIR:-/tmp}/$proj"
mkdir -p "$state"
chmod 700 "$state"

# Throwaway secrets, kept for the life of the stack so stages can run
# separately. Deleted by the "down" stage.
if [ ! -f "$state/secrets" ]; then
  {
    echo "SECRET_KEY=$(openssl rand -hex 32)"
    echo "SERVICE_API_KEY=$(openssl rand -hex 24)"
    echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)"
    echo "ADMIN_PASSWORD=$(openssl rand -hex 12)"
    echo "STAFF_PASSWORD=$(openssl rand -hex 12)"
    echo "TEMP_PASSWORD=$(openssl rand -hex 12)"
    # The baseline runs without a Twilio auth token, the way a server with
    # a missing or mistyped TWILIO_AUTH_TOKEN would. The retest sets one
    # (its voice-bridge refuses to start in production without it).
    if [ "$name" = retest ]; then echo "TWILIO_AUTH_TOKEN=$(openssl rand -hex 16)"; fi
  } > "$state/secrets"
fi
set -a; . "$state/secrets"; set +a

export SCAN_ENV_FILE="$state/scan.env"
{
  echo "ENVIRONMENT=production"
  echo "SECRET_KEY=$SECRET_KEY"
  echo "SERVICE_API_KEY=$SERVICE_API_KEY"
  echo "CORS_ORIGINS=https://app.localhost"
  echo "ANTHROPIC_API_KEY=sk-ant-scan-placeholder-not-a-real-key"
  [ -n "${TWILIO_AUTH_TOKEN:-}" ] && echo "TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN"
} > "$SCAN_ENV_FILE"
export SCAN_HTTP_PORT=$http_port SCAN_HTTPS_PORT=$https_port
export APP_DOMAIN=app.localhost VOICE_DOMAIN=voice.localhost POSTGRES_PASSWORD

compose=(docker compose -p "$proj" --project-directory "$tree"
  -f "$tree/docker-compose.prod.yml" -f "$here/compose.scan.yml")
if grep -q '^  db:' "$tree/docker-compose.prod.yml"; then
  compose+=(-f "$here/compose.scan.db.yml")
fi

APP="https://app.localhost:$https_port"
VOICE="https://voice.localhost:$https_port"
# curl from this machine (client 1)
H() { curl -sk --max-time 20 --resolve "app.localhost:$https_port:127.0.0.1" \
  --resolve "voice.localhost:$https_port:127.0.0.1" "$@"; }
# curl from a container on the Compose network (client 2, its own IP)
# (curl maps *.localhost to 127.0.0.1 by itself, so point that name at caddy)
P() { docker exec "$proj-probe" curl -sk --max-time 20 --connect-to app.localhost:443:caddy:443 "$@"; }
# JSON body from key value pairs, built outside any "..." string: bash 3.2
# brace-expands {"a":1,"b":2} inside "$( )" in a double-quoted echo.
json() { python3 -c 'import json,sys; a=sys.argv[1:]; print(json.dumps(dict(zip(a[::2], a[1::2]))))' "$@"; }
code() { H -o /dev/null -w '%{http_code}' "$@"; }
pcode() { P -o /dev/null -w '%{http_code}' "$@"; }
token_of() { python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))'; }

login() { # user password -> token (empty on failure)
  H -X POST "$APP/api/auth/login" --data-urlencode "username=$1" \
    --data-urlencode "password=$2" | token_of 2>/dev/null
}

stage_up() {
  log "build and start $proj from $tree"
  "${compose[@]}" up --build -d || return 1
  for _ in $(seq 1 120); do
    [ "$(code "$APP/api/health")" = 200 ] && break
    sleep 3
  done
  [ "$(code "$APP/api/health")" = 200 ] || { log "stack not healthy"; "${compose[@]}" ps; return 1; }
  docker rm -f "$proj-probe" >/dev/null 2>&1
  docker run -d --name "$proj-probe" --network "$net" --entrypoint sleep "$CURL_IMAGE" 86400 >/dev/null

  log "create test accounts"
  H -X POST "$APP/api/auth/register" -H 'Content-Type: application/json' \
    -d "{\"username\":\"scan-admin\",\"password\":\"$ADMIN_PASSWORD\"}" >/dev/null
  ADMIN_TOKEN=$(login scan-admin "$ADMIN_PASSWORD")
  H -X POST "$APP/api/auth/register" -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"username\":\"scan-staff\",\"password\":\"$STAFF_PASSWORD\"}" >/dev/null
  H -X POST "$APP/api/auth/register" -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"username\":\"scan-temp\",\"password\":\"$TEMP_PASSWORD\"}" >/dev/null
  STAFF_TOKEN=$(login scan-staff "$STAFF_PASSWORD")
  { echo "ADMIN_TOKEN=$ADMIN_TOKEN"; echo "STAFF_TOKEN=$STAFF_TOKEN"; } > "$state/tokens"
  "${compose[@]}" ps > "$out/stack-ps.txt"
}

load_tokens() { [ -f "$state/tokens" ] && { set -a; . "$state/tokens"; set +a; }; }

twilio_sig() { # url params... -> X-Twilio-Signature for TWILIO_AUTH_TOKEN
  python3 - "$TWILIO_AUTH_TOKEN" "$@" <<'PY'
import base64, hashlib, hmac, sys
token, url, *pairs = sys.argv[1:]
params = dict(p.split("=", 1) for p in pairs)
data = url + "".join(k + params[k] for k in sorted(params))
print(base64.b64encode(hmac.new(token.encode(), data.encode(), hashlib.sha1).digest()).decode())
PY
}

stage_probes() {
  load_tokens
  local f="$out/probes.txt"
  log "manual probes -> $f"
  {
    echo "# Manual probes against the local $name stack ($(date -u +%Y-%m-%dT%H:%MZ))"
    cat "$out/commit.txt" 2>/dev/null
    echo "Dashboard: $APP (Caddy -> nginx -> backend), voice: $VOICE"
    echo "Client 1 = this machine; client 2 = a container on the Compose network."

    echo; echo "## P1 Response headers, dashboard and voice hosts"
    echo "### HEAD $APP/"; H -I "$APP/" | tr -d '\r'
    echo "### GET $APP/api/health (headers)"; H -D - -o /dev/null "$APP/api/health" | tr -d '\r'
    echo "### HEAD $VOICE/"; H -I "$VOICE/" | tr -d '\r'
    echo "### HTTP (port $http_port) redirect"; curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
      --resolve "app.localhost:$http_port:127.0.0.1" "http://app.localhost:$http_port/"

    echo; echo "## P2 API documentation exposed through the public entrypoint"
    for p in /api/docs /api/redoc /api/openapi.json; do echo "GET $p -> $(code "$APP$p")"; done
    echo "Direct, inside the network: GET http://backend:8000/openapi.json -> $(pcode http://backend:8000/openapi.json)"

    echo; echo "## P3 Session token handling at login (values redacted)"
    # A fresh account each run (P4 changes its password and deactivates it)
    local temp_user body
    temp_user="scan-temp-$(date +%s)"
    body=$(json username "$temp_user" password "$TEMP_PASSWORD")
    echo "admin creates $temp_user -> $(code -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H 'Content-Type: application/json' -d "$body" "$APP/api/auth/register")"
    H -D - -o "$state/login-body.json" -X POST "$APP/api/auth/login" \
      --data-urlencode "username=$temp_user" --data-urlencode "password=$TEMP_PASSWORD" \
      | tr -d '\r' | grep -i '^HTTP\|^set-cookie' | sed -E 's/(access_token=)("?Bearer )?[^;]*/\1<value>/'
    echo "Response body keys: $(python3 -c 'import json,sys; print(sorted(json.load(open(sys.argv[1]))))' "$state/login-body.json")"
    local bundle; bundle=$(H "$APP/" | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1)
    echo "Dashboard bundle: $bundle"
    echo "localStorage calls in the bundle:"
    H "$APP$bundle" | grep -oE 'localStorage\.[a-zA-Z]+\([^)]{0,40}\)' | sort | uniq -c
    echo "Authorization header set by the bundle: $(H "$APP$bundle" | grep -oE 'Authorization=`Bearer \$\{[a-z]+\}`|headers\.Authorization' | sort -u | tr '\n' ' ')"

    echo; echo "## P4 Token still accepted after logout and after a password change"
    local tok; tok=$(token_of < "$state/login-body.json")
    echo "GET /api/auth/me with the token -> $(code -H "Authorization: Bearer $tok" "$APP/api/auth/me")"
    echo "POST /api/auth/logout -> $(code -X POST -H "Authorization: Bearer $tok" "$APP/api/auth/logout")"
    echo "GET /api/auth/me with the same token after logout -> $(code -H "Authorization: Bearer $tok" "$APP/api/auth/me")"
    body=$(json current_password "$TEMP_PASSWORD" new_password "$(openssl rand -hex 12)")
    echo "POST /api/auth/me/password -> $(code -X POST -H "Authorization: Bearer $tok" -H 'Content-Type: application/json' \
      -d "$body" "$APP/api/auth/me/password")"
    echo "GET /api/auth/me with the old token after the password change -> $(code -H "Authorization: Bearer $tok" "$APP/api/auth/me")"
    # Deactivation exists only from ali-dev on (PATCH /users/{id})
    local tid; tid=$(H -H "Authorization: Bearer $tok" "$APP/api/auth/me" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))' 2>/dev/null)
    echo "Admin deactivates the account: PATCH /api/users/$tid {is_active:false} -> $(code -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H 'Content-Type: application/json' -d '{"is_active":false}' "$APP/api/users/$tid")"
    echo "GET /api/auth/me with the token after deactivation -> $(code -H "Authorization: Bearer $tok" "$APP/api/auth/me")"

    echo; echo "## P5 Authorisation: what a second (non-first) account can do"
    local rules; rules=$(H -H "Authorization: Bearer $STAFF_TOKEN" "$APP/api/pricing/rules")
    echo "scan-staff GET /api/pricing/rules -> $(code -H "Authorization: Bearer $STAFF_TOKEN" "$APP/api/pricing/rules")"
    echo "scan-staff PUT /api/pricing/rules (same rules back) -> $(code -X PUT -H "Authorization: Bearer $STAFF_TOKEN" \
      -H 'Content-Type: application/json' -d "$rules" "$APP/api/pricing/rules")"
    body=$(json username "scan-by-staff-$(date +%s)" password "$(openssl rand -hex 8)")
    echo "scan-staff POST /api/auth/register (new account) -> $(code -X POST -H "Authorization: Bearer $STAFF_TOKEN" \
      -H 'Content-Type: application/json' -d "$body" "$APP/api/auth/register")"
    echo "scan-staff GET /api/audit-events/ -> $(code -H "Authorization: Bearer $STAFF_TOKEN" "$APP/api/audit-events/")"
    echo "scan-admin GET /api/audit-events/ -> $(code -H "Authorization: Bearer $ADMIN_TOKEN" "$APP/api/audit-events/")"

    echo; echo "## P6 Internal services answer without any credentials (from client 2)"
    echo "GET  http://mcp-pricing-server:8001/mcp/pricing/rules -> $(pcode http://mcp-pricing-server:8001/mcp/pricing/rules)"
    echo "PUT  http://mcp-pricing-server:8001/mcp/pricing/rules (same rules back) -> $(pcode -X PUT -H 'Content-Type: application/json' \
      -d "$rules" http://mcp-pricing-server:8001/mcp/pricing/rules)"
    echo "GET  http://mcp-pricing-server:8001/docs -> $(pcode http://mcp-pricing-server:8001/docs)"
    echo "POST http://ai-agent:8002/agent/message -> $(pcode -X POST -H 'Content-Type: application/json' \
      -d "$(json call_sid CAprobe text hi)" http://ai-agent:8002/agent/message)"
    echo "GET  http://ai-agent:8002/docs -> $(pcode http://ai-agent:8002/docs)"
    echo "POST http://backend:8000/calls/ with no key -> $(pcode -X POST -H 'Content-Type: application/json' -d '{}' http://backend:8000/calls/)"

    echo; echo "## P7 Twilio webhook without a signature"
    echo "POST $VOICE/voice, no X-Twilio-Signature -> $(code -X POST -d CallSid=CAunsigned01 --data-urlencode From=+27820000001 "$VOICE/voice")"
    echo "POST $VOICE/voice, wrong X-Twilio-Signature -> $(code -X POST -H 'X-Twilio-Signature: AAAA' -d CallSid=CAunsigned02 "$VOICE/voice")"
    if [ -n "${TWILIO_AUTH_TOKEN:-}" ]; then
      local sig; sig=$(twilio_sig "https://voice.localhost/voice" CallSid=CAsigned01 From=+27820000002)
      echo "POST $VOICE/voice, correct signature -> $(code -X POST -H "X-Twilio-Signature: $sig" -d CallSid=CAsigned01 --data-urlencode From=+27820000002 "$VOICE/voice")"
      echo "voice-bridge started in production with TWILIO_AUTH_TOKEN empty:"
      "${compose[@]}" run --rm --no-deps -T -e TWILIO_AUTH_TOKEN= voice-bridge 2>&1 | tail -3
      echo "exit code: ${PIPESTATUS[0]}"
    else
      echo "(no TWILIO_AUTH_TOKEN in this stack's env)"
    fi

    echo; echo "## P8 Caller data in URLs and logs: one simulated call"
    local sid="CAscanprivacy$(date +%s)"
    local sigh=()
    if [ -n "${TWILIO_AUTH_TOKEN:-}" ]; then
      sigh=(-H "X-Twilio-Signature: $(twilio_sig "https://voice.localhost/voice" CallSid=$sid From=+27821234567)")
    fi
    echo "POST /voice for $sid -> $(code -X POST ${sigh[@]+"${sigh[@]}"} -d CallSid=$sid --data-urlencode From=+27821234567 "$VOICE/voice")"
    "${compose[@]}" exec -T voice-bridge node -e '
      const WebSocket = require("ws");
      const ws = new WebSocket("ws://localhost:5000/");
      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "setup", callSid: process.argv[1], from: "+27821234567" }));
        setTimeout(() => ws.send(JSON.stringify({ type: "prompt",
          voicePrompt: "Hi, my name is Thandi Scanprobe, call me on 082 123 4567" })), 500);
        setTimeout(() => ws.close(), 8000);
      });
      ws.on("close", (c) => { console.log("websocket closed", c); process.exit(0); });
      ws.on("error", (e) => { console.log("websocket error", e.message); process.exit(0); });
    ' "$sid"
    sleep 4
    echo "voice-bridge log lines for this call:"
    "${compose[@]}" logs --no-color voice-bridge 2>&1 | grep -E "$sid|Scanprobe|123 4567|Caller|Agent" | sed 's/^[^|]*| //' | head -20
    echo "backend access-log lines for this call (POST /calls/, /leads/):"
    "${compose[@]}" logs --no-color backend 2>&1 | grep -E "POST /(calls|leads)/" | grep -E "$sid|Scanprobe|transcript|HTTP" | sed 's/^[^|]*| //' | tail -4

    echo; echo "## P9 Transcript in a query string (service key, direct to backend)"
    local q="call_sid=CAqs$(date +%s)&duration=5&transcript=Caller%3A%20my%20address%20is%201%20Probe%20Street&outcome=completed"
    echo "POST /calls/?<transcript in query> -> $(pcode -X POST -H "X-Service-Key: $SERVICE_API_KEY" "http://backend:8000/calls/?$q")"
    body=$(json call_sid "CAjs$(date +%s)" duration 5 transcript "Caller: 2 Probe Street" outcome completed)
    echo "POST /calls/ with JSON body -> $(pcode -X POST -H "X-Service-Key: $SERVICE_API_KEY" -H 'Content-Type: application/json' \
      -d "$body" http://backend:8000/calls/)"
    sleep 1
    echo "backend log lines containing 'Probe' (the transcript):"
    "${compose[@]}" logs --no-color backend 2>&1 | grep -E "Probe%20Street|Probe Street" | sed 's/^[^|]*| //' | tail -3

    echo; echo "## P10 Deleting a lead: is the call transcript deleted too?"
    local dsid="CAdel$(date +%s)"
    pcode -X POST -H "X-Service-Key: $SERVICE_API_KEY" "http://backend:8000/calls/?call_sid=$dsid&duration=3&transcript=Caller%3A%20delete%20me&outcome=completed" >/dev/null
    pcode -X POST -H "X-Service-Key: $SERVICE_API_KEY" -H 'Content-Type: application/json' \
      -d "{\"call_sid\":\"$dsid\",\"duration\":3,\"transcript\":\"Caller: delete me\",\"outcome\":\"completed\"}" http://backend:8000/calls/ >/dev/null
    local lead
    lead=$(P -X POST -H "X-Service-Key: $SERVICE_API_KEY" -H 'Content-Type: application/json' \
      -d "{\"name\":\"Delete Probe\",\"contact\":\"+27820000003\",\"call_sid\":\"$dsid\",\"job_details\":{},\"quote\":100}" http://backend:8000/leads/)
    case "$lead" in *lead_id*|*'"id"'*) ;; *)
      lead=$(P -X POST -H "X-Service-Key: $SERVICE_API_KEY" -H 'Content-Type: application/json' -d '{}' \
        "http://backend:8000/leads/?name=Delete%20Probe&contact=%2B27820000003&call_sid=$dsid&quote=100") ;;
    esac
    local lid; lid=$(echo "$lead" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("lead_id") or d.get("id") or "")' 2>/dev/null)
    echo "created lead id: ${lid:-<none>} for call $dsid"
    echo "GET  /api/calls/$dsid before -> $(code -H "Authorization: Bearer $ADMIN_TOKEN" "$APP/api/calls/$dsid")"
    echo "DELETE /api/leads/$lid -> $(code -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" "$APP/api/leads/$lid")"
    echo "GET  /api/calls/$dsid after -> $(code -H "Authorization: Bearer $ADMIN_TOKEN" "$APP/api/calls/$dsid")"

    echo; echo "## P11 Login response time: unknown username vs real username (2 tries each)"
    sleep 61
    code -X POST "$APP/api/auth/login" -d username=warm-up -d password=x >/dev/null  # first request is slow
    for u in no-such-user-a scan-admin no-such-user-b scan-admin; do
      echo "$u: $(H -o /dev/null -w '%{http_code} %{time_total}s' -X POST "$APP/api/auth/login" \
        --data-urlencode "username=$u" --data-urlencode password=wrong-password)"
    done

    echo; echo "## P12 Login rate limit: is it per client?"
    sleep 61
    echo "Client 2: 6 wrong passwords in a row:"
    for i in 1 2 3 4 5 6; do
      printf ' %s' "$(pcode -X POST https://app.localhost/api/auth/login -d username=scan-staff -d password=wrong$i)"
    done; echo
    echo "Client 1 right after (correct password) -> $(code -X POST "$APP/api/auth/login" \
      --data-urlencode username=scan-staff --data-urlencode "password=$STAFF_PASSWORD")"
    sleep 61
    echo "Client 2: 6 wrong passwords, each with a different forged X-Forwarded-For:"
    for i in 1 2 3 4 5 6; do
      printf ' %s' "$(pcode -X POST -H "X-Forwarded-For: 203.0.113.$i" https://app.localhost/api/auth/login -d username=scan-staff -d password=wrong$i)"
    done; echo
  } > "$f" 2>&1
  redact "$out"
}

stage_nmap() {
  log "nmap"
  docker run --rm "$NMAP_IMAGE" -Pn -sV -p "$http_port,$https_port" \
    --script ssl-enum-ciphers,http-headers,http-server-header host.docker.internal -oN - \
    > "$out/nmap-published.txt" 2>&1
  local hosts=(caddy frontend backend mcp-pricing-server ai-agent voice-bridge)
  grep -q '^  db:' "$tree/docker-compose.prod.yml" && hosts+=(db)
  docker run --rm --network "$net" "$NMAP_IMAGE" -Pn -sV -T4 -p 1-10000 "${hosts[@]}" -oN - \
    > "$out/nmap-internal.txt" 2>&1
}

stage_deps() {
  log "npm audit"
  for pkg in frontend voice-bridge; do
    (cd "$tree/$pkg" && npm audit --json > "$out/npm-audit-$pkg.json" 2>/dev/null; true)
  done
  log "pip-audit of the packages installed in each running image"
  for svc in backend mcp-pricing-server ai-agent; do
    "${compose[@]}" exec -T "$svc" pip freeze --all 2>/dev/null \
      | grep -vE '^(pip|setuptools|wheel)==' > "$out/pip-freeze-$svc.txt"
    $PIP_AUDIT --disable-pip --no-deps -r "$out/pip-freeze-$svc.txt" -f json \
      > "$out/pip-audit-$svc.json" 2> "$out/pip-audit-$svc.err" || true
    [ -s "$out/pip-audit-$svc.err" ] || rm -f "$out/pip-audit-$svc.err"
  done
}

stage_zap() {
  load_tokens
  local zap=(docker run --rm --network "$net" -v "$out:/zap/wrk:rw")
  for h in app voice; do
    log "ZAP baseline $h.localhost"
    "${zap[@]}" "$ZAP_IMAGE" zap-baseline.py -t "https://$h.localhost/" -m 2 -I \
      -J "zap-baseline-$h.json" -w "zap-baseline-$h.md" > "$out/zap-baseline-$h.log" 2>&1
  done

  log "OpenAPI spec for the API scan"
  if [ "$(pcode http://backend:8000/openapi.json)" = 200 ]; then
    P http://backend:8000/openapi.json > "$state/openapi.json"
    echo "served at http://backend:8000/openapi.json" > "$out/openapi-source.txt"
  else
    # Production hides /openapi.json; build the same schema from the app.
    "${compose[@]}" exec -T backend python -c \
      'import json; from app.main import app; print(json.dumps(app.openapi()))' > "$state/openapi.json"
    echo "not served (404); generated inside the backend container with app.openapi()" > "$out/openapi-source.txt"
  fi
  python3 - "$state/openapi.json" "$out/openapi.json" <<'PY'
import json, sys
spec = json.load(open(sys.argv[1]))
spec["servers"] = [{"url": "http://backend:8000"}]
json.dump(spec, open(sys.argv[2], "w"), indent=1)
PY
  log "ZAP API scan (active, local backend, as scan-admin)"
  "${zap[@]}" -e ZAP_AUTH_HEADER_VALUE="Bearer $ADMIN_TOKEN" "$ZAP_IMAGE" zap-api-scan.py \
    -t /zap/wrk/openapi.json -f openapi -I -J zap-api.json -w zap-api.md \
    -z "-config scanner.maxScanDurationInMins=20 -config scanner.maxRuleDurationInMins=2" \
    > "$out/zap-api.log" 2>&1
  redact "$out"
}

stage_down() {
  log "tear down $proj"
  docker rm -f "$proj-probe" >/dev/null 2>&1
  "${compose[@]}" down -v --rmi local --remove-orphans
  rm -rf "$state"
}

for s in "${stages[@]}"; do
  "stage_$s" || { log "stage $s failed"; exit 1; }
done
redact "$out"
log "Results in $out"
