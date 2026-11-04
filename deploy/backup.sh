#!/bin/sh
# Dump the Renovo PostgreSQL database to ~/backups and keep 14 days of dumps.
# Run nightly from cron (see deploy/README.md, "Backups").
set -eu
umask 077
BACKUP_DIR="$HOME/backups"
mkdir -p "$BACKUP_DIR"
cd "$HOME/renovo"
out="$BACKUP_DIR/renovo-$(date +%Y%m%d-%H%M%S).dump"
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U renovo -d renovo --format=custom > "$out.partial"
mv "$out.partial" "$out"
find "$BACKUP_DIR" -name 'renovo-*.dump' -mtime +14 -delete
echo "$(date -Is) backup ok: $out ($(wc -c < "$out") bytes)"
