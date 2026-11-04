#!/bin/bash
# Continuous deployment for Renovo Cape. A systemd timer runs this on the
# server every 5 minutes (see deploy/README.md, "Automatic deploys").
#
#   deploy/autodeploy.sh                 deploy the newest main commit, once CI passed
#   deploy/autodeploy.sh --ref <commit>  deploy that commit now (manual rollback)
#
# For a new main commit it:
#   1. waits until the "Renovo Full Stack CI/CD" workflow has passed on it
#      (a failed run is skipped, never deployed)
#   2. records a GitHub deployment to the "production" environment
#   3. backs up the database, unpacks the commit into ~/renovo.new, copies the
#      .env files across and swaps folders; migrations run when the backend starts
#   4. waits up to 3 minutes for /health, then marks the deployment success
#   5. on failure, puts the previous folder back, rebuilds it and marks the
#      deployment failure
#
# The server reads the repository with a fine-grained GitHub token kept in
# ~/.renovo-gh-token (mode 600): Contents and Actions read, Deployments write.
set -euo pipefail
exec </dev/null   # docker compose exec would otherwise read our stdin

REPO=YandaTech/INSY7315-Renovo
WORKFLOW="Renovo Full Stack CI/CD"
APP_URL=https://app.16-192-12-251.sslip.io
SRC="$HOME/renovo-src.git"
LIVE="$HOME/renovo"
STATE="$HOME/.renovo-deployed"
SKIPPED="$HOME/.renovo-skipped"
LOCK="$HOME/.renovo-deploy.lock"
TOKEN_FILE="$HOME/.renovo-gh-token"
BRANCH=main
DC="docker compose -f docker-compose.prod.yml"

log() { echo "$(date -Is) $*"; }

exec 9>"$LOCK"
flock -n 9 || { log "another deploy is running"; exit 0; }

TOKEN=$(tr -d '[:space:]' < "$TOKEN_FILE")
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$TOKEN" | base64 -w0)"

api() {  # api <METHOD> <path> [json body]
  curl -fsS -X "$1" -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/$REPO$2" ${3:+-d "$3"}
}

json() {  # json <python expression on d>  (reads JSON on stdin)
  python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"
}

ref=""
if [ "${1:-}" = "--ref" ]; then ref="${2:?commit needed}"; fi

if [ ! -d "$SRC" ]; then
  git -c "http.extraHeader=$AUTH" clone --quiet --bare \
    "https://github.com/$REPO.git" "$SRC"
fi
git -C "$SRC" -c "http.extraHeader=$AUTH" fetch --quiet --prune \
  "https://github.com/$REPO.git" "+refs/heads/$BRANCH:refs/heads/$BRANCH"

target=$(git -C "$SRC" rev-parse --verify "${ref:-$BRANCH}^{commit}")
current=$(cat "$STATE" 2>/dev/null || true)
short=${target:0:7}

if [ -z "$ref" ]; then
  [ "$target" = "$current" ] && exit 0
  grep -qx "$target" "$SKIPPED" 2>/dev/null && exit 0

  # Gate: the CI workflow must have finished and passed on this exact commit.
  ci=$(api GET "/actions/runs?head_sha=$target&event=push&per_page=20" | json \
    "next((r['status']+' '+str(r['conclusion'])+' '+r['html_url'] for r in d['workflow_runs'] if r['name']=='$WORKFLOW'), 'none')")
  case "$ci" in
    "completed success "*) log "CI passed for $short: ${ci##* }" ;;
    none|queued*|in_progress*|waiting*|requested*|pending*)
      exit 0 ;;  # not finished yet: try again on the next run
    *)
      log "CI did not pass for $short ($ci); not deploying it"
      echo "$target" >> "$SKIPPED"
      exit 0 ;;
  esac
fi

# Record the deployment in GitHub (Deployments tab, "production").
desc="${ref:+Manual rollback to }${ref:-Automatic deploy of }$short"
dep_id=$(api POST /deployments \
  "{\"ref\":\"$target\",\"environment\":\"production\",\"auto_merge\":false,\"required_contexts\":[],\"description\":\"$desc\"}" \
  | json "d['id']" || echo "")
status() {  # status <state> <description>
  [ -n "$dep_id" ] && api POST "/deployments/$dep_id/statuses" \
    "{\"state\":\"$1\",\"environment_url\":\"$APP_URL\",\"description\":\"$2\"}" >/dev/null || true
}
status in_progress "Deploying $short"

health_ok() {
  for _ in $(seq 1 36); do
    if $DC exec -T backend python -c \
      "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" \
      >/dev/null 2>&1; then
      return 0
    fi
    sleep 5
  done
  return 1
}

log "deploying $short (was ${current:0:7})"
"$LIVE/deploy/backup.sh"

rm -rf "$HOME/renovo.new"
mkdir "$HOME/renovo.new"
git -C "$SRC" archive --format=tar "$target" | tar -xf - -C "$HOME/renovo.new"
cp -p "$LIVE"/.env* "$HOME/renovo.new/"
rm -rf "$HOME/renovo.prev"
mv "$LIVE" "$HOME/renovo.prev"
mv "$HOME/renovo.new" "$LIVE"

cd "$LIVE"
if $DC up --build -d >/dev/null 2>&1 && health_ok; then
  echo "$target" > "$STATE"
  status success "Deployed $short; /health OK"
  log "deployed $short"
  exit 0
fi

log "ERROR: $short failed its health check, rolling back to ${current:0:7}"
rm -rf "$HOME/renovo.failed"
mv "$LIVE" "$HOME/renovo.failed"
mv "$HOME/renovo.prev" "$LIVE"
cd "$LIVE"
$DC up --build -d >/dev/null 2>&1
echo "$target" >> "$SKIPPED"
if health_ok; then
  status failure "Health check failed; rolled back to ${current:0:7}"
  log "rolled back to ${current:0:7}; the failed tree is in ~/renovo.failed"
else
  status error "Health check failed and the rollback is unhealthy"
  log "ERROR: rollback is not healthy either; check docker compose logs"
fi
exit 1
