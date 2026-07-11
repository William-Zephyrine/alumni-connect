#!/bin/bash
set -e

echo "=== AlumniConnect Deployment ==="

if [ ! -f "server.js" ]; then
  echo "ERROR: server.js not found. Run from project root."
  exit 1
fi

echo "1. Installing dependencies..."
npm install --production=false

echo "2. Generating Prisma client..."
npx prisma generate

echo "3. Running database migrations..."
npx prisma migrate deploy

echo "4. Building Next.js..."
npm run build

echo ""
echo "=== Build complete ==="
echo ""
echo "To start the server:"
echo ""
echo "  Development:  npm run dev"
echo "  Production:   NODE_ENV=production node server.js"
echo ""
echo "PM2 setup (first time):"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo ""
echo "PM2 restart (after deploy):"
echo "  pm2 restart alumni-connect"
echo ""
echo "IMPORTANT: Make sure .env has:"
echo "  - DATABASE_URL (production PostgreSQL URL)"
echo "  - JWT_SECRET (strong random string)"
echo "  - NEXT_PUBLIC_APP_URL (LEAVE EMPTY for same-origin)"
echo ""
