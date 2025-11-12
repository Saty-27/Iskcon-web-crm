#!/bin/bash

echo "🔧 Fixing PostgreSQL Database Connection"
echo "======================================="

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
sudo systemctl status postgresql

# Start PostgreSQL if not running
echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if database exists
echo "Checking if database exists..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw iskcon_juhu
if [ $? -eq 0 ]; then
    echo "✅ Database iskcon_juhu exists"
else
    echo "❌ Database iskcon_juhu does not exist. Creating..."
    sudo -u postgres createdb iskcon_juhu
    sudo -u postgres psql -c "CREATE USER iskcon_user WITH PASSWORD 'iskcon123';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE iskcon_juhu TO iskcon_user;"
fi

# Test database connection
echo "Testing database connection..."
PGPASSWORD=iskcon123 psql -h localhost -U iskcon_user -d iskcon_juhu -c "SELECT 1;"

echo "✅ Database connection fixed!"