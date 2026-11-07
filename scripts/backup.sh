#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./data/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DB_NAME="${DB_NAME:-mnyala}"
UPLOADS_DIR="${STORAGE_DIR:-./data/uploads}"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "=== Mnyala Backup: $TIMESTAMP ==="

# 1. Database dump
DB_BACKUP="$BACKUP_DIR/db_${DB_NAME}_${TIMESTAMP}.sql.gz"
echo "Dumping PostgreSQL database ($DB_NAME)..."
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "${DATABASE_URL:-postgresql://mnyala@localhost:5433/$DB_NAME}" | gzip > "$DB_BACKUP"
  echo "Database backup saved to: $DB_BACKUP"
else
  echo "pg_dump not found in PATH; skipping raw pg_dump."
fi

# 2. Uploads archive
if [ -d "$UPLOADS_DIR" ]; then
  UPLOADS_BACKUP="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"
  echo "Archiving uploads folder ($UPLOADS_DIR)..."
  tar -czf "$UPLOADS_BACKUP" -C "$UPLOADS_DIR" .
  echo "Uploads backup saved to: $UPLOADS_BACKUP"
fi

# 3. Clean up backups older than 14 days
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +"$RETENTION_DAYS" -delete || true

echo "=== Backup completed successfully. ==="
