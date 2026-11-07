#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-db-backup.sql.gz> [path-to-uploads-backup.tar.gz]"
  exit 1
fi

DB_BACKUP="$1"
UPLOADS_BACKUP="${2:-}"
UPLOADS_DIR="${STORAGE_DIR:-./data/uploads}"

echo "=== Mnyala Restore Drill ==="

if [ ! -f "$DB_BACKUP" ]; then
  echo "Error: Database backup file does not exist: $DB_BACKUP"
  exit 1
fi

echo "Restoring database from $DB_BACKUP..."
gunzip -c "$DB_BACKUP" | psql "${DATABASE_URL:-postgresql://mnyala@localhost:5433/mnyala}"
echo "Database restored successfully."

if [ -n "$UPLOADS_BACKUP" ] && [ -f "$UPLOADS_BACKUP" ]; then
  echo "Restoring uploads from $UPLOADS_BACKUP..."
  mkdir -p "$UPLOADS_DIR"
  tar -xzf "$UPLOADS_BACKUP" -C "$UPLOADS_DIR"
  echo "Uploads restored successfully."
fi

echo "=== Restore completed successfully. ==="
