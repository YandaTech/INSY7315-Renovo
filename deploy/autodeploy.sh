#!/bin/bash
# Deploy the latest commit on main when it changes. Runs on the server every
# 5 minutes from a systemd timer (see deploy/README.md, "Automatic deploys").
#
#   deploy/autodeploy.sh                 deploy main if it moved
#   deploy/autodeploy.sh --ref <commit>  deploy that commit (rollback)
#
# Steps: fetch with the read-only deploy key, back up the database, unpack
# the commit into ~/renovo.new, copy the .env files across, swap folders,
# rebuild. If /api/health doesn't answer within 3 minutes, the previous
# folder is put back and rebuilt.
set -euo pipefail
exec </dev/null   # docker compose exec would otherwise read our stdin

SRC="$HOME/renovo-src.git"
LIVE="$HOME/renovo"
STATE="$HOME/.renovo-deployed"
LOCK="$HOME/.renovo-deploy.lock"
BRANCH=main
DC="docker compose -f docker-compose.prod.yml"

log() { echo "$(date -Is) $*"; }

exec 9>"$LOCK"
flock -n 9 || { log "another deploy is running"; exit 0; }

ref=""
if [ "${1:-}" = "--ref" ]; then ref="${2:?commit needed}"; fi

if [ ! -d "$SRC" ]; then
  git clone --quiet --bare git@github.com:YandaTech/INSY7315-Renovo.git "$SRC"
fi
git -C "$SRC" fetch --quiet --prune origin "+refs/heads/$BRANCH:refs/heads/$BRANCH"

target=$(git -C "$SRC" rev-parse --verify "${ref:-$BRANCH}^{commit}")
current=$(cat "$STATE" 2>/dev/null || true)
if [ -z "$ref" ] && [ "$target" = "$current" ]; then
  exit 0
fi

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

log "deploying ${target:0:7} (was ${current:0:7})"
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
  log "deployed ${target:0:7}"
  exit 0
fi

log "ERROR: ${target:0:7} failed its health check, rolling back to ${current:0:7}"
rm -rf "$HOME/renovo.failed"
mv "$LIVE" "$HOME/renovo.failed"
mv "$HOME/renovo.prev" "$LIVE"
cd "$LIVE"
$DC up --build -d >/dev/null 2>&1
if health_ok; then
  log "rolled back to ${current:0:7}; the failed tree is in ~/renovo.failed"
else
  log "ERROR: rollback is not healthy either; check docker compose logs"
fi
exit 1
