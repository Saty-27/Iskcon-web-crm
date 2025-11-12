#!/bin/bash

# Export Database Script for VPS Migration
# This script exports your current Replit database

echo "Exporting Replit Database..."

# Export database structure and data
pg_dump $DATABASE_URL > replit_database_backup.sql

if [ $? -eq 0 ]; then
    echo "✅ Database exported successfully to: replit_database_backup.sql"
    echo "📄 File size: $(du -h replit_database_backup.sql | cut -f1)"
    echo ""
    echo "🚀 To migrate to your VPS:"
    echo "1. Download this file: replit_database_backup.sql"
    echo "2. Upload it to your VPS server"
    echo "3. Run: psql -h localhost -U iskcon_user -d iskcon_juhu < replit_database_backup.sql"
else
    echo "❌ Database export failed!"
fi