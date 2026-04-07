#!/bin/bash

# ============================================
# MongoDB Backup Script
# ============================================

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/taskmanager/backups"
MONGODB_URI="mongodb://admin:password@localhost:27017"
DATABASE_NAME="taskmanager"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/backup_${DATABASE_NAME}_${TIMESTAMP}"

echo "============================================"
echo "Starting MongoDB Backup"
echo "Time: $(date)"
echo "Database: $DATABASE_NAME"
echo "============================================"

# Create backup
echo "Creating backup..."
mongodump \
    --uri="$MONGODB_URI" \
    --db="$DATABASE_NAME" \
    --out="$BACKUP_FILE" \
    --gzip

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✓ Backup created successfully"
    
    # Create archive
    echo "Creating archive..."
    tar -czf "${BACKUP_FILE}.tar.gz" -C "$BACKUP_DIR" "$(basename $BACKUP_FILE)"
    
    # Remove uncompressed backup
    rm -rf "$BACKUP_FILE"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.tar.gz" | cut -f1)
    echo "✓ Archive created: ${BACKUP_FILE}.tar.gz ($BACKUP_SIZE)"
    
    # Clean old backups
    echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "============================================"
    echo "Backup completed successfully!"
    echo "============================================"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Optional: Upload to cloud storage
# Uncomment and configure as needed

# Upload to AWS S3
# aws s3 cp "${BACKUP_FILE}.tar.gz" "s3://your-bucket/backups/"

# Upload to Google Cloud Storage
# gsutil cp "${BACKUP_FILE}.tar.gz" "gs://your-bucket/backups/"

exit 0
