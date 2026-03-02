#!/bin/sh

# Wait for database to be ready (optional, handled by docker-compose depends_on healthcheck)
echo "Running database migrations..."
npx prisma migrate deploy

# Run seed if needed (e.g., first time)
# npx prisma db seed

echo "Starting application..."
node dist/index.js
