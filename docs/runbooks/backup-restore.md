# Database & Media Backup & Recovery Runbook

This operational runbook documents the disaster recovery, point-in-time restoration, and continuous backup procedures for the Pimple Saudagar Directory platform.

---

## 1. Automated PostgreSQL Backup

### Daily Backup Script
Execute via cron on a backup server or GitHub Actions scheduled workflow:

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/pimplesaudagar"
BACKUP_FILE="${BACKUP_DIR}/directory_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting pg_dump..."
pg_dump -Fc --no-owner --no-privileges -d "${DATABASE_URL}" -f "${BACKUP_FILE}"

echo "[$(date)] Compressing and syncing to cold storage..."
gzip -9 "${BACKUP_FILE}"

# Retain 30 days locally, purge older files
find "${BACKUP_DIR}" -name "*.dump.gz" -mtime +30 -delete
echo "[$(date)] Backup completed successfully."
```

---

## 2. Disaster Recovery & Database Restoration

To restore from a `.dump` or `.dump.gz` backup archive into a fresh PostgreSQL instance:

```bash
# 1. Uncompress dump archive
gunzip -k directory_20261028_120000.dump.gz

# 2. Terminate existing connections (if restoring existing database)
psql "${TARGET_DATABASE_URL}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'directory' AND pid <> pg_backend_pid();"

# 3. Restore schema & data using pg_restore
pg_restore --clean --if-exists --no-owner --no-privileges -d "${TARGET_DATABASE_URL}" directory_20261028_120000.dump

# 4. Regenerate Prisma client & trigger aggregate recalculation
npm run prisma:generate
curl -X GET "https://pimplesaudagar.org/api/cron/repair-aggregates?key=${CRON_SECRET}"
```

---

## 3. Cloudflare R2 Media Bucket Backup

Cloudflare R2 provides 99.999999999% (11 9s) of durability. For offsite multi-cloud disaster backup, use `rclone` or AWS CLI:

```bash
# Sync R2 bucket to local or secondary S3 bucket
aws s3 sync s3://pimplesaudagar-media ./r2-backup-media \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
```

---

## 4. Emergency Contacts & Escalation Matrix

1. **Lead Operations Architect**: Responsible for database availability and recovery SLA (< 1 hour RTO, < 24 hour RPO).
2. **Security & Data Protection Officer**: Responsible for evaluating breach notification requirements under India DPDP Act 2023.
