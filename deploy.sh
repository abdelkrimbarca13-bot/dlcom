#!/bin/bash

# Configuration
REPO_URL="https://github.com/abdelkrimbarca13-bot/dlcom.git"
APP_DIR="/root/dlcom"

# 1. Update and install dependencies
echo "Updating packages..."
apt update && apt upgrade -y
apt install -y curl git build-essential

# 2. Install Node.js (NodeSource)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# 3. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# 4. Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo "Updating repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 5. Setup .env (SQLite)
if [ ! -f ".env" ]; then
    echo "Configuring .env..."
    echo 'DATABASE_URL="file:./dev.db"' > .env
    echo 'NEXTAUTH_URL="http://164.132.116.143"' >> .env
    echo 'NEXTAUTH_SECRET="f6c8e3b2a1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4"' >> .env
    echo 'NODE_ENV="production"' >> .env
fi

# 6. Install dependencies and Build
echo "Installing dependencies..."
npm install
echo "Running Prisma..."
npx prisma generate
npx prisma db push
echo "Building application..."
npm run build

# 7. Start/Restart with PM2
echo "Starting application with PM2..."
pm2 delete dlcom || true
pm2 start npm --name "dlcom" -- start -- -p 80

# 8. Setup PM2 startup
pm2 save
pm2 startup | tail -n 1 | bash

echo "Deployment complete! Application should be accessible at http://164.132.116.143"
